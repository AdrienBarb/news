import { inngest } from "./client";
import { prisma } from "@/lib/db/prisma";
import { extractPainStatements } from "@/lib/services/extraction/extractPainStatements";
import { generateEmbedding } from "@/lib/services/extraction/generateEmbedding";

/**
 * Inngest function to process a single conversation
 * Extracts pain statements and generates embeddings
 */
export const processConversationJob = inngest.createFunction(
  {
    id: "process-conversation",
    retries: 2,
    concurrency: {
      limit: 5, // Limit concurrent processing to manage OpenAI rate limits
    },
  },
  { event: "conversation/process" },
  async ({ event, step }) => {
    const { conversationId } = event.data;

    console.log(`\n${"─".repeat(50)}`);
    console.log(`🔄 [PROCESS-CONVERSATION] Starting for: ${conversationId}`);

    // Get conversation with market context
    const conversation = await step.run("get-conversation", async () => {
      console.log(`   📋 [PROCESS] Loading conversation from database...`);
      return prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          market: {
            select: {
              id: true,
              category: true,
              contextJson: true,
            },
          },
        },
      });
    });

    if (!conversation) {
      console.log(`   ⚠️ [PROCESS] Conversation not found, skipping`);
      return {
        status: "skipped",
        reason: "Conversation not found",
      };
    }

    console.log(
      `   📄 [PROCESS] Title: "${conversation.title || "(no title)"}"`
    );
    console.log(`   🔗 [PROCESS] Source: ${conversation.source}`);
    console.log(
      `   🏷️ [PROCESS] Market category: "${conversation.market.category}"`
    );
    console.log(
      `   📏 [PROCESS] Content length: ${(conversation.sanitizedContent || conversation.rawContent).length} chars`
    );

    // Check processing status (idempotency)
    if (conversation.processingStatus !== "pending") {
      console.log(
        `   ⚠️ [PROCESS] Already ${conversation.processingStatus}, skipping`
      );
      return {
        status: "skipped",
        reason: `Already ${conversation.processingStatus}`,
      };
    }

    // Mark as processing
    await step.run("mark-processing", async () => {
      console.log(`   🔄 [PROCESS] Marking as "processing"...`);
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { processingStatus: "processing" },
      });
    });

    try {
      // Extract market context
      const marketContext = {
        category: conversation.market.category || "software",
        ...((conversation.market.contextJson as object) || {}),
      };

      console.log(`\n   🧠 [PROCESS] STEP 1: Extracting pain statements...`);
      console.log(`   📝 [PROCESS] Market context:`);
      console.log(`      - Category: "${marketContext.category}"`);
      console.log(
        `      - Competitors: ${(marketContext as { competitors?: string[] }).competitors?.join(", ") || "none"}`
      );

      // Extract pain statements
      const painStatements = await step.run(
        "extract-pain-statements",
        async () => {
          return extractPainStatements(
            conversation.sanitizedContent || conversation.rawContent,
            marketContext
          );
        }
      );

      console.log(
        `   📊 [PROCESS] Extraction result: ${painStatements.length} pain statements found`
      );

      if (painStatements.length === 0) {
        console.log(
          `   ⏭️ [PROCESS] No pain statements found (conversation may be irrelevant or no pain expressed)`
        );
        // Mark as processed with no pain statements
        await step.run("mark-processed-empty", async () => {
          await prisma.conversation.update({
            where: { id: conversationId },
            data: { processingStatus: "processed" },
          });
        });

        console.log(`   ✅ [PROCESS] Marked as processed (empty)`);
        return {
          status: "completed",
          conversationId,
          painStatementsFound: 0,
        };
      }

      // Log found pain statements
      console.log(`\n   💡 [PROCESS] Pain statements found:`);
      painStatements.forEach((ps, i) => {
        console.log(
          `      ${i + 1}. [${ps.painType}] "${ps.statement.substring(0, 80)}..." (confidence: ${ps.confidence})`
        );
      });

      console.log(
        `\n   🔢 [PROCESS] STEP 2: Generating embeddings for ${painStatements.length} statements...`
      );
      // Generate embeddings for pain statements
      const statementsWithEmbeddings = await step.run(
        "generate-embeddings",
        async () => {
          const results = [];

          for (const statement of painStatements) {
            const embedding = await generateEmbedding(statement.statement);
            results.push({
              ...statement,
              embedding,
            });
          }

          return results;
        }
      );
      console.log(`   ✅ [PROCESS] Embeddings generated`);

      console.log(
        `\n   💾 [PROCESS] STEP 3: Saving pain statements to database...`
      );
      // Save pain statements to database
      await step.run("save-pain-statements", async () => {
        await prisma.$transaction(async (tx) => {
          // Create pain statements
          for (const statement of statementsWithEmbeddings) {
            await tx.painStatement.create({
              data: {
                conversationId,
                statement: statement.statement,
                painType: statement.painType,
                toolsMentioned: statement.toolsMentioned,
                switchingIntent: statement.switchingIntent,
                confidence: statement.confidence,
                embedding: statement.embedding,
              },
            });
          }

          // Mark conversation as processed
          await tx.conversation.update({
            where: { id: conversationId },
            data: { processingStatus: "processed" },
          });
        });
      });

      console.log(
        `   ✅ [PROCESS] Saved ${statementsWithEmbeddings.length} pain statements`
      );
      console.log(`\n   🎉 [PROCESS-CONVERSATION] Completed successfully!`);
      console.log(`${"─".repeat(50)}\n`);

      return {
        status: "completed",
        conversationId,
        painStatementsFound: statementsWithEmbeddings.length,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(
        `\n   ❌ [PROCESS] Failed to process conversation ${conversationId}:`,
        errorMessage
      );

      // Mark as error
      await step.run("mark-error", async () => {
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { processingStatus: "error" },
        });
      });

      console.log(`   ⚠️ [PROCESS] Marked as "error"`);
      console.log(`${"─".repeat(50)}\n`);

      // Return error details for Inngest visibility, then throw to trigger retry
      throw new Error(
        `Conversation ${conversationId} processing failed: ${errorMessage}`
      );
    }
  }
);
