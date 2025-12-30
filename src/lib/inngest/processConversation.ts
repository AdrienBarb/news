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

    // Get conversation with market context
    const conversation = await step.run("get-conversation", async () => {
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
      return {
        status: "skipped",
        reason: "Conversation not found",
      };
    }

    // Check processing status (idempotency)
    if (conversation.processingStatus !== "pending") {
      return {
        status: "skipped",
        reason: `Already ${conversation.processingStatus}`,
      };
    }

    // Mark as processing
    await step.run("mark-processing", async () => {
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { processingStatus: "processing" },
      });
    });

    try {
      // Extract market context
      const marketContext = {
        category: conversation.market.category || "software",
        ...(conversation.market.contextJson as object || {}),
      };

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

      if (painStatements.length === 0) {
        // Mark as processed with no pain statements
        await step.run("mark-processed-empty", async () => {
          await prisma.conversation.update({
            where: { id: conversationId },
            data: { processingStatus: "processed" },
          });
        });

        return {
          status: "completed",
          conversationId,
          painStatementsFound: 0,
        };
      }

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

      return {
        status: "completed",
        conversationId,
        painStatementsFound: statementsWithEmbeddings.length,
      };
    } catch (error) {
      console.error(`Failed to process conversation ${conversationId}:`, error);

      // Mark as error
      await step.run("mark-error", async () => {
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { processingStatus: "error" },
        });
      });

      throw error;
    }
  }
);

