import { prisma } from "@/lib/db/prisma";
import { InteractionType } from "@prisma/client";

export async function createInteraction({
  userId,
  articleId,
  interactionType,
  dwellTimeMs,
}: {
  userId: string;
  articleId: string;
  interactionType: InteractionType;
  dwellTimeMs: number;
}) {
  return await prisma.userArticleInteraction.upsert({
    where: {
      userId_articleId: {
        userId,
        articleId,
      },
    },
    update: {
      interactionType,
      dwellTimeMs,
    },
    create: {
      userId,
      articleId,
      interactionType,
      dwellTimeMs,
    },
  });
}

