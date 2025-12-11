import { prisma } from "@/lib/db/prisma";
import type { ArticleWithTags } from "./getArticleWithTags";

const DEFAULT_PAGE_SIZE = 10;

export interface GetAllArticlesResult {
  articles: ArticleWithTags[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getAllArticles(
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE,
  tagFilter?: string
): Promise<GetAllArticlesResult> {
  const skip = (page - 1) * pageSize;

  const whereClause = tagFilter
    ? {
        tags: {
          some: {
            name: tagFilter,
          },
        },
      }
    : {};

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where: whereClause,
      skip,
      take: pageSize,
      include: {
        tags: true,
      },
      orderBy: {
        publishedAt: "desc",
      },
    }),
    prisma.article.count({
      where: whereClause,
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return {
    articles: articles as ArticleWithTags[],
    total,
    page,
    pageSize,
    totalPages,
  };
}
