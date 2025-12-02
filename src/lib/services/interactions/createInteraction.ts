import { prisma } from "@/lib/db/prisma";
import { InteractionType } from "@prisma/client";

/**
 * Creates or updates an interaction for a user-article pair
 * Allows multiple interaction types per article (like, bookmark, view_long, etc.)
 */
export async function createInteraction({
  userId,
  articleId,
  interactionType,
  dwellTimeMs,
}: {
  userId: string;
  articleId: string;
  interactionType: InteractionType;
  dwellTimeMs?: number;
}) {
  return await prisma.userArticleInteraction.upsert({
    where: {
      userId_articleId_interactionType: {
        userId,
        articleId,
        interactionType,
      },
    },
    update: {
      dwellTimeMs: dwellTimeMs ?? undefined,
      createdAt: new Date(), // Update timestamp when interaction is re-triggered
    },
    create: {
      userId,
      articleId,
      interactionType,
      dwellTimeMs: dwellTimeMs ?? undefined,
    },
  });
}
