import { prisma } from "@/lib/db/prisma";
import type { Article, Tag } from "@prisma/client";

export type ArticleWithTags = Article & { tags: Tag[] };

export async function getUserTagScoreMap(
  userId: string
): Promise<Map<string, number>> {
  const userTagPrefs = await prisma.userTagPreference.findMany({
    where: { userId },
  });

  return new Map<string, number>(
    userTagPrefs.map((pref) => [pref.tagId, pref.score])
  );
}

export async function getSeenArticleIds(userId: string): Promise<string[]> {
  const seenInteractions = await prisma.userArticleInteraction.findMany({
    where: { userId },
    select: { articleId: true },
  });

  return seenInteractions.map((i) => i.articleId);
}

export function computeArticleScore(
  article: ArticleWithTags,
  tagScoreMap: Map<string, number>,
  lookbackDays: number
): number {
  const tagScores = article.tags.map((tag) => tagScoreMap.get(tag.id) ?? 0);
  const userTagScore =
    tagScores.length > 0
      ? tagScores.reduce((a, b) => a + b, 0) / tagScores.length
      : 0;

  const now = Date.now();
  const daysOld = (now - article.publishedAt.getTime()) / (1000 * 60 * 60 * 24);
  const recencyBoost = Math.max(0, 1 - daysOld / lookbackDays);

  const relevanceNorm = Math.min(1, article.relevanceScore / 100);

  const wTags = 0.6;
  const wRecency = 0.2;
  const wRelevance = 0.2;

  let score =
    wTags * userTagScore + wRecency * recencyBoost + wRelevance * relevanceNorm;

  score += Math.random() * 0.05;

  return score;
}

export async function selectTopArticlesForUser(
  userId: string,
  options: {
    lookbackDays: number;
    minRelevanceScore: number;
    maxArticles: number;
  }
): Promise<ArticleWithTags[]> {
  const { lookbackDays, minRelevanceScore, maxArticles } = options;

  const [tagScoreMap, seenArticleIds] = await Promise.all([
    getUserTagScoreMap(userId),
    getSeenArticleIds(userId),
  ]);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - lookbackDays);

  const candidates = await prisma.article.findMany({
    where: {
      publishedAt: { gte: cutoff },
      relevanceScore: { gte: minRelevanceScore },
      id: { notIn: seenArticleIds },
    },
    include: { tags: true },
  });

  if (candidates.length === 0) {
    return [];
  }

  const scored = candidates.map((article) => ({
    article: article as ArticleWithTags,
    score: computeArticleScore(
      article as ArticleWithTags,
      tagScoreMap,
      lookbackDays
    ),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, maxArticles).map((s) => s.article);
}
