import { prisma } from "@/lib/db/prisma";
import type {
  Article,
  Tag,
  InteractionType as PrismaInteractionType,
} from "@prisma/client";

type ArticleWithTags = Article & { tags: Tag[] };

/**
 * Enhanced algorithm for updating tag preferences with:
 * - Temporal decay (recent interactions matter more)
 * - Diminishing returns (prevent overfitting)
 * - Dwell time consideration
 * - Adaptive learning rates
 */

interface InteractionContext {
  daysSinceLastInteraction: number;
  totalInteractionsForTag: number;
  isFirstInteraction: boolean;
}

function calculateInteractionWeight(
  interactionType: PrismaInteractionType,
  dwellTimeMs: number,
  context: InteractionContext
): number {
  // Base weights (stronger signals have higher weights)
  const baseWeights: Record<PrismaInteractionType, number> = {
    like: 1.0,
    bookmark: 0.7,
    view_long: 0.4,
    view: 0.1,
    skip_fast: -0.3,
    hide_topic: -1.0,
    share: 0.5,
    more_like_this: 0.8,
  };

  let weight = baseWeights[interactionType] || 0;

  // 1. Dwell time modulation (for view interactions)
  if (interactionType === "view" || interactionType === "view_long") {
    // Normalize dwell time: 0-30s = 0.5x, 30s-2min = 1x, 2min+ = 1.5x
    const dwellMinutes = dwellTimeMs / 60000;
    const dwellMultiplier = Math.min(1.5, Math.max(0.5, dwellMinutes / 2));
    weight *= dwellMultiplier;
  }

  // 2. Temporal decay (recent interactions matter more)
  // Exponential decay: weight decreases by 5% per day
  const decayRate = 0.95;
  const daysSince = Math.min(context.daysSinceLastInteraction, 30); // Cap at 30 days
  const temporalDecay = Math.pow(decayRate, daysSince);
  weight *= temporalDecay;

  // 3. Diminishing returns (prevent overfitting from repeated interactions)
  // First interaction: 100%, second: 80%, third: 64%, etc.
  const diminishingFactor = Math.pow(
    0.8,
    Math.min(context.totalInteractionsForTag, 5)
  );
  weight *= diminishingFactor;

  // 4. Cold start boost (first interactions are more important)
  if (context.isFirstInteraction) {
    weight *= 1.5; // Boost initial learning
  }

  return weight;
}

function calculateScoreUpdate(currentScore: number, weight: number): number {
  // Adaptive learning rate based on current score confidence
  // If score is extreme (near -1 or 1), updates should be smaller
  const confidence = 1 - Math.abs(currentScore); // 0 = extreme, 1 = neutral
  const learningRate = 0.1 + confidence * 0.2; // 0.1-0.3 range

  // Calculate delta
  const delta = weight * learningRate;

  // Apply update with momentum (exponential moving average)
  // This smooths out rapid changes
  const momentum = 0.7; // How much to keep from current score
  const newScore =
    currentScore * momentum + (currentScore + delta) * (1 - momentum);

  // Clamp to [-1, 1]
  return Math.max(-1, Math.min(1, newScore));
}

export async function updateUserTagPreferencesFromInteraction(params: {
  userId: string;
  article: ArticleWithTags;
  interactionType: PrismaInteractionType;
  dwellTimeMs: number;
  timestamp?: Date;
}) {
  const {
    userId,
    article,
    interactionType,
    dwellTimeMs,
    timestamp = new Date(),
  } = params;

  if (!article.tags || article.tags.length === 0) return;

  await Promise.all(
    article.tags.map(async (tag) => {
      // Get existing preference
      const existing = await prisma.userTagPreference.findUnique({
        where: {
          userId_tagId: {
            userId,
            tagId: tag.id,
          },
        },
      });

      // Get interaction history for this tag to calculate context
      // Only get interactions with this specific tag to avoid noise
      const recentInteractions = await prisma.userArticleInteraction.findMany({
        where: {
          userId,
          article: {
            tags: {
              some: { id: tag.id },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10, // Last 10 interactions
      });

      const totalInteractionsForTag = recentInteractions.length;
      const lastInteraction = recentInteractions[0];
      const daysSinceLastInteraction = lastInteraction
        ? (timestamp.getTime() - lastInteraction.createdAt.getTime()) /
          (1000 * 60 * 60 * 24)
        : 999; // Never interacted before

      // Calculate weight with context
      const weight = calculateInteractionWeight(interactionType, dwellTimeMs, {
        daysSinceLastInteraction,
        totalInteractionsForTag,
        isFirstInteraction: !existing,
      });

      // Skip if weight is effectively zero
      if (Math.abs(weight) < 0.01) return;

      // Calculate new score
      const currentScore = existing?.score ?? 0;
      const newScore = calculateScoreUpdate(currentScore, weight);

      // Update or create preference
      if (existing) {
        await prisma.userTagPreference.update({
          where: { id: existing.id },
          data: {
            score: newScore,
            updatedAt: timestamp,
          },
        });
      } else {
        await prisma.userTagPreference.create({
          data: {
            userId,
            tagId: tag.id,
            score: newScore,
            createdAt: timestamp,
            updatedAt: timestamp,
          },
        });
      }
    })
  );
}
