import { prisma } from "@/lib/db/prisma";
import type {
  Article,
  Tag,
  InteractionType as PrismaInteractionType,
} from "@prisma/client";

type ArticleWithTags = Article & { tags: Tag[] };

interface InteractionContext {
  daysSinceLastInteraction: number;
  totalInteractionsForTag: number;
  isFirstInteraction: boolean;
}

function calculateInteractionWeight(
  interactionType: PrismaInteractionType,
  dwellTimeMs: number = 0,
  context: InteractionContext
): number {
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

  if (interactionType === "view" || interactionType === "view_long") {
    const dwellMinutes = dwellTimeMs / 60000;
    const dwellMultiplier = Math.min(1.5, Math.max(0.5, dwellMinutes / 2));
    weight *= dwellMultiplier;
  }

  const decayRate = 0.95;
  const daysSince = Math.min(context.daysSinceLastInteraction, 30);
  const temporalDecay = Math.pow(decayRate, daysSince);
  weight *= temporalDecay;

  const diminishingFactor = Math.pow(
    0.8,
    Math.min(context.totalInteractionsForTag, 5)
  );
  weight *= diminishingFactor;

  if (context.isFirstInteraction) {
    weight *= 1.5;
  }

  return weight;
}

function calculateScoreUpdate(currentScore: number, weight: number): number {
  const confidence = 1 - Math.abs(currentScore);
  const learningRate = 0.1 + confidence * 0.2;

  const delta = weight * learningRate;

  const momentum = 0.7;
  const newScore =
    currentScore * momentum + (currentScore + delta) * (1 - momentum);

  return Math.max(-1, Math.min(1, newScore));
}

export async function updateUserTagPreferencesFromInteraction(params: {
  userId: string;
  article: ArticleWithTags;
  interactionType: PrismaInteractionType;
  dwellTimeMs?: number;
  timestamp?: Date;
}) {
  const {
    userId,
    article,
    interactionType,
    dwellTimeMs = 0,
    timestamp = new Date(),
  } = params;

  if (!article.tags || article.tags.length === 0) return;

  await Promise.all(
    article.tags.map(async (tag) => {
      const existing = await prisma.userTagPreference.findUnique({
        where: {
          userId_tagId: {
            userId,
            tagId: tag.id,
          },
        },
      });

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
        take: 10,
      });

      const totalInteractionsForTag = recentInteractions.length;
      const lastInteraction = recentInteractions[0];
      const daysSinceLastInteraction = lastInteraction
        ? (timestamp.getTime() - lastInteraction.createdAt.getTime()) /
          (1000 * 60 * 60 * 24)
        : 999;

      const weight = calculateInteractionWeight(interactionType, dwellTimeMs, {
        daysSinceLastInteraction,
        totalInteractionsForTag,
        isFirstInteraction: !existing,
      });

      if (Math.abs(weight) < 0.01) return;

      const currentScore = existing?.score ?? 0;
      const newScore = calculateScoreUpdate(currentScore, weight);

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
