import { prisma } from "@/lib/db/prisma";
import { openai } from "@/lib/openai/client";
import {
  cosineSimilarity,
  calculateCentroid,
} from "@/lib/services/extraction/generateEmbedding";
import { extractQuote } from "@/lib/utils/textSanitizer";
import type { PainStatement } from "@prisma/client";

// Similarity threshold for clustering (0.85 = 85% similar)
const SIMILARITY_THRESHOLD = 0.85;

interface PainStatementWithEmbedding extends PainStatement {
  conversation: {
    url: string;
    sanitizedContent: string | null;
  };
}

interface SignalWithCentroid {
  id: string;
  centroid: number[];
}

/**
 * Generate a title for a signal based on its pain statements
 */
async function generateSignalTitle(
  statements: string[],
  painType: string
): Promise<{ title: string; description: string }> {
  const sampleStatements = statements.slice(0, 5).join("\n- ");

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a market analyst. Given a list of similar pain statements, generate a concise title and description for this market signal.

Return JSON: { "title": "...", "description": "..." }

The title should be:
- 5-10 words
- Actionable and specific
- Focused on the core issue

The description should be:
- 1-2 sentences
- Explain what users are experiencing
- Include specific pain points`,
      },
      {
        role: "user",
        content: `Pain type: ${painType}

Sample statements:
- ${sampleStatements}`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    return {
      title: `${painType.replace("_", " ")} issue`,
      description: statements[0] || "",
    };
  }

  try {
    const parsed = JSON.parse(content);
    return {
      title: parsed.title || `${painType.replace("_", " ")} issue`,
      description: parsed.description || statements[0] || "",
    };
  } catch {
    return {
      title: `${painType.replace("_", " ")} issue`,
      description: statements[0] || "",
    };
  }
}

/**
 * Cluster unclustered pain statements for a market
 */
export async function clusterPainStatementsForMarket(
  marketId: string
): Promise<{
  newSignals: number;
  updatedSignals: number;
  clusteredStatements: number;
}> {
  // Get existing signals with their centroids
  const existingSignals = await prisma.signal.findMany({
    where: { marketId },
    select: {
      id: true,
      centroid: true,
      painType: true,
    },
  });

  const signalsWithCentroids: SignalWithCentroid[] = existingSignals
    .filter((s) => s.centroid && s.centroid.length > 0)
    .map((s) => ({
      id: s.id,
      centroid: s.centroid,
    }));

  // Get unclustered pain statements
  const unclusteredStatements = await prisma.painStatement.findMany({
    where: {
      signalId: null,
      conversation: {
        marketId,
        processingStatus: "processed",
      },
    },
    include: {
      conversation: {
        select: {
          url: true,
          sanitizedContent: true,
        },
      },
    },
  });

  if (unclusteredStatements.length === 0) {
    return { newSignals: 0, updatedSignals: 0, clusteredStatements: 0 };
  }

  // Group statements by their best matching signal or create new clusters
  const signalAssignments = new Map<string, PainStatementWithEmbedding[]>();
  const newClusters: PainStatementWithEmbedding[][] = [];

  for (const statement of unclusteredStatements) {
    if (!statement.embedding || statement.embedding.length === 0) {
      continue;
    }

    // Find best matching existing signal
    let bestMatch: { id: string; similarity: number } | null = null;

    for (const signal of signalsWithCentroids) {
      const similarity = cosineSimilarity(statement.embedding, signal.centroid);
      if (
        similarity >= SIMILARITY_THRESHOLD &&
        (!bestMatch || similarity > bestMatch.similarity)
      ) {
        bestMatch = { id: signal.id, similarity };
      }
    }

    if (bestMatch) {
      // Assign to existing signal
      const existing = signalAssignments.get(bestMatch.id) || [];
      existing.push(statement as PainStatementWithEmbedding);
      signalAssignments.set(bestMatch.id, existing);
    } else {
      // Try to match with other unclustered statements
      let matchedCluster = false;

      for (const cluster of newClusters) {
        // Calculate cluster centroid
        const clusterEmbeddings = cluster.map((s) => s.embedding);
        const centroid = calculateCentroid(clusterEmbeddings);

        const similarity = cosineSimilarity(statement.embedding, centroid);
        if (similarity >= SIMILARITY_THRESHOLD) {
          cluster.push(statement as PainStatementWithEmbedding);
          matchedCluster = true;
          break;
        }
      }

      if (!matchedCluster) {
        // Start a new cluster
        newClusters.push([statement as PainStatementWithEmbedding]);
      }
    }
  }

  let newSignalsCount = 0;
  let updatedSignalsCount = 0;
  let clusteredStatementsCount = 0;

  // Update existing signals with new statements
  for (const [signalId, statements] of signalAssignments) {
    if (statements.length === 0) continue;

    await prisma.$transaction(async (tx) => {
      // Update pain statements to point to signal
      await tx.painStatement.updateMany({
        where: {
          id: { in: statements.map((s) => s.id) },
        },
        data: { signalId },
      });

      // Create evidence for each statement
      for (const statement of statements) {
        const quote = extractQuote(
          statement.conversation.sanitizedContent || statement.statement,
          { maxLength: 200 }
        );

        await tx.signalEvidence.upsert({
          where: {
            signalId_painStatementId: {
              signalId,
              painStatementId: statement.id,
            },
          },
          update: {},
          create: {
            signalId,
            painStatementId: statement.id,
            quote,
            sourceUrl: statement.conversation.url,
          },
        });
      }

      // Get all statements for this signal to recalculate metrics
      const allStatements = await tx.painStatement.findMany({
        where: { signalId },
        select: {
          embedding: true,
          confidence: true,
          createdAt: true,
        },
      });

      // Update signal metrics
      const newCentroid = calculateCentroid(
        allStatements.filter((s) => s.embedding.length > 0).map((s) => s.embedding)
      );
      const avgConfidence =
        allStatements.reduce((sum, s) => sum + s.confidence, 0) /
        allStatements.length;
      const lastSeenAt = allStatements.reduce(
        (latest, s) => (s.createdAt > latest ? s.createdAt : latest),
        new Date(0)
      );

      await tx.signal.update({
        where: { id: signalId },
        data: {
          frequency: allStatements.length,
          avgConfidence,
          centroid: newCentroid,
          lastSeenAt,
        },
      });
    });

    updatedSignalsCount++;
    clusteredStatementsCount += statements.length;
  }

  // Create new signals from clusters (only if they have 2+ statements)
  for (const cluster of newClusters) {
    if (cluster.length < 2) {
      // Single statements stay unclustered for now
      continue;
    }

    const centroid = calculateCentroid(cluster.map((s) => s.embedding));
    const avgConfidence =
      cluster.reduce((sum, s) => sum + s.confidence, 0) / cluster.length;
    const painType = cluster[0].painType;

    // Generate title for new signal
    const { title, description } = await generateSignalTitle(
      cluster.map((s) => s.statement),
      painType
    );

    await prisma.$transaction(async (tx) => {
      // Create new signal
      const signal = await tx.signal.create({
        data: {
          marketId,
          title,
          description,
          painType,
          frequency: cluster.length,
          avgConfidence,
          centroid,
          firstSeenAt: cluster.reduce(
            (earliest, s) =>
              s.createdAt < earliest ? s.createdAt : earliest,
            new Date()
          ),
          lastSeenAt: cluster.reduce(
            (latest, s) => (s.createdAt > latest ? s.createdAt : latest),
            new Date(0)
          ),
        },
      });

      // Update pain statements
      await tx.painStatement.updateMany({
        where: {
          id: { in: cluster.map((s) => s.id) },
        },
        data: { signalId: signal.id },
      });

      // Create evidence
      for (const statement of cluster) {
        const quote = extractQuote(
          statement.conversation.sanitizedContent || statement.statement,
          { maxLength: 200 }
        );

        await tx.signalEvidence.create({
          data: {
            signalId: signal.id,
            painStatementId: statement.id,
            quote,
            sourceUrl: statement.conversation.url,
          },
        });
      }
    });

    newSignalsCount++;
    clusteredStatementsCount += cluster.length;
  }

  return {
    newSignals: newSignalsCount,
    updatedSignals: updatedSignalsCount,
    clusteredStatements: clusteredStatementsCount,
  };
}

