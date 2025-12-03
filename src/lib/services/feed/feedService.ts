import { prisma } from "@/lib/db/prisma";
import { getStartOfTodayUTC } from "@/lib/utils/date/getStartOfTodayUTC";
import type { Article, Tag } from "@prisma/client";

type ArticleWithTags = Article & { tags: Tag[] };

const FEED_SIZE = 10;
const ARTICLE_LOOKBACK_DAYS = 7;
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

  const articles = await buildFeedForUser(userId, feedDate);

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

async function buildFeedForUser(
  userId: string,
  feedDate: Date
): Promise<ArticleWithTags[]> {
  const userTagPrefs = await prisma.userTagPreference.findMany({
    where: { userId },
  });

  const tagScoreMap = new Map<string, number>(
    userTagPrefs.map((pref) => [pref.tagId, pref.score])
  );

  const seenInteractions = await prisma.userArticleInteraction.findMany({
    where: { userId },
    select: { articleId: true },
  });

  const seenArticleIds = seenInteractions.map((i) => i.articleId);

  const cutoff = new Date(feedDate);
  cutoff.setDate(cutoff.getDate() - ARTICLE_LOOKBACK_DAYS);

  const candidates = await prisma.article.findMany({
    where: {
      publishedAt: { gte: cutoff },
      relevanceScore: { gte: MIN_RELEVANCE_SCORE },
      id: { notIn: seenArticleIds },
    },
    include: { tags: true },
  });

  if (candidates.length === 0) {
    return [];
  }

  const scored = candidates.map((article) => ({
    article,
    score: computeArticleScore(article as ArticleWithTags, tagScoreMap),
  }));

  scored.sort((a, b) => b.score - a.score);

  const selected = scored.slice(0, FEED_SIZE).map((s) => s.article);

  return selected;
}

function computeArticleScore(
  article: ArticleWithTags,
  tagScoreMap: Map<string, number>
): number {
  const tagScores = article.tags.map((tag) => tagScoreMap.get(tag.id) ?? 0);
  const userTagScore =
    tagScores.length > 0
      ? tagScores.reduce((a, b) => a + b, 0) / tagScores.length
      : 0;

  const now = Date.now();
  const daysOld = (now - article.publishedAt.getTime()) / (1000 * 60 * 60 * 24);
  const recencyBoost = Math.max(0, 1 - daysOld / ARTICLE_LOOKBACK_DAYS);

  const relevanceNorm = Math.min(1, article.relevanceScore / 100);

  const wTags = 0.6;
  const wRecency = 0.2;
  const wRelevance = 0.2;

  let score =
    wTags * userTagScore + wRecency * recencyBoost + wRelevance * relevanceNorm;

  score += Math.random() * 0.05;

  return score;
}
