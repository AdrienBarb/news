import { prisma } from "@/lib/db/prisma";
import { InteractionType } from "@prisma/client";

export async function getUserInteractions(
  userId: string,
  articleIds: string[]
): Promise<{
  likes: Set<string>;
  bookmarks: Set<string>;
}> {
  const interactions = await prisma.userArticleInteraction.findMany({
    where: {
      userId,
      articleId: { in: articleIds },
      interactionType: { in: [InteractionType.like, InteractionType.bookmark] },
    },
    select: {
      articleId: true,
      interactionType: true,
    },
  });

  const likes = new Set<string>();
  const bookmarks = new Set<string>();

  interactions.forEach((interaction) => {
    if (interaction.interactionType === InteractionType.like) {
      likes.add(interaction.articleId);
    } else if (interaction.interactionType === InteractionType.bookmark) {
      bookmarks.add(interaction.articleId);
    }
  });

  return { likes, bookmarks };
}

