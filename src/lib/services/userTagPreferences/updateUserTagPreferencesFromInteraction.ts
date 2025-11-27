import { prisma } from "@/lib/db/prisma";
import type {
  Article,
  Tag,
  InteractionType as PrismaInteractionType,
} from "@prisma/client";

type ArticleWithTags = Article & { tags: Tag[] };

function getTagDelta(interactionType: PrismaInteractionType): number {
  switch (interactionType) {
    case "like":
      return 0.25;
    case "hide_topic":
      return -0.3;
    case "skip_fast":
      return -0.1;
    case "view_long":
      return 0.08;
    case "view":
      return 0;
    default:
      return 0;
  }
}

export async function updateUserTagPreferencesFromInteraction(params: {
  userId: string;
  article: ArticleWithTags;
  interactionType: PrismaInteractionType;
  dwellTimeMs: number;
}) {
  const { userId, article, interactionType } = params;

  const delta = getTagDelta(interactionType);
  if (delta === 0) return;

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

      const currentScore = existing?.score ?? 0;
      const newScoreRaw = currentScore + delta;
      const newScore = Math.max(-1, Math.min(1, newScoreRaw));

      if (existing) {
        await prisma.userTagPreference.update({
          where: { id: existing.id },
          data: { score: newScore },
        });
      } else {
        await prisma.userTagPreference.create({
          data: {
            userId,
            tagId: tag.id,
            score: newScore,
          },
        });
      }
    })
  );
}
