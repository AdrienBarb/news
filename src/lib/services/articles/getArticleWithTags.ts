import { prisma } from "@/lib/db/prisma";
import type { Article, Tag } from "@prisma/client";

export type ArticleWithTags = Article & { tags: Tag[] };

export async function getArticleWithTags(
  articleId: string
): Promise<ArticleWithTags | null> {
  return await prisma.article.findUnique({
    where: { id: articleId },
    include: { tags: true },
  });
}

