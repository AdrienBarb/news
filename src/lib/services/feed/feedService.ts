import { prisma } from "@/lib/db/prisma";
import { getStartOfTodayUTC } from "@/lib/utils/date/getStartOfTodayUTC";
import {
  selectTopArticlesForUser,
  type ArticleWithTags,
} from "@/lib/services/article/articleSelectionService";

const FEED_SIZE = 10;
const ARTICLE_LOOKBACK_DAYS = 1;
const MIN_RELEVANCE_SCORE = 7;

export async function getOrCreateTodayFeed(
  userId: string
): Promise<ArticleWithTags[]> {
  const feedDate = getStartOfTodayUTC();

  const existingItems = await prisma.dailyFeedItem.findMany({
    where: { userId, feedDate },
    orderBy: { position: "asc" },
    include: {
      article: {
        include: { tags: true },
      },
    },
  });

  if (existingItems.length > 0) {
    return existingItems.map((item) => item.article as ArticleWithTags);
  }

  const articles = await selectTopArticlesForUser(userId, {
    lookbackDays: ARTICLE_LOOKBACK_DAYS,
    minRelevanceScore: MIN_RELEVANCE_SCORE,
    maxArticles: FEED_SIZE,
  });

  if (articles.length === 0) {
    return [];
  }

  await prisma.$transaction(
    articles.map((article, index) =>
      prisma.dailyFeedItem.create({
        data: {
          userId,
          articleId: article.id,
          feedDate,
          position: index,
        },
      })
    )
  );

  return articles;
}
