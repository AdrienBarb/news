import { prisma } from "@/lib/db/prisma";
import { InteractionType } from "@prisma/client";
import type { ArticleWithTags } from "./getArticleWithTags";

export async function getBookmarkedArticles(
  userId: string
): Promise<ArticleWithTags[]> {
  const bookmarkedInteractions = await prisma.userArticleInteraction.findMany({
    where: {
      userId,
      interactionType: InteractionType.bookmark,
    },
    include: {
      article: {
        include: {
          tags: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return bookmarkedInteractions.map(
    (interaction) => interaction.article as ArticleWithTags
  );
}
