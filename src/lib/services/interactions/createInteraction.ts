import { prisma } from "@/lib/db/prisma";
import { InteractionType } from "@prisma/client";

export async function createInteraction({
  userId,
  articleId,
  interactionType,
}: {
  userId: string;
  articleId: string;
  interactionType: InteractionType;
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
      createdAt: new Date(),
    },
    create: {
      userId,
      articleId,
      interactionType,
    },
  });
}

export async function deleteInteraction({
  userId,
  articleId,
  interactionType,
}: {
  userId: string;
  articleId: string;
  interactionType: InteractionType;
}) {
  return await prisma.userArticleInteraction.deleteMany({
    where: {
      userId,
      articleId,
      interactionType,
    },
  });
}
