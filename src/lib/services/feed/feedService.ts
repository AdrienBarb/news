// lib/feedService.ts
import { prisma } from "@/lib/db/prisma"; // adapte ce chemin
import { getStartOfTodayUTC } from "@/lib/utils/date/getStartOfTodayUTC";
import type { Article, Tag } from "@prisma/client";

type ArticleWithTags = Article & { tags: Tag[] };

const FEED_SIZE = 10;
const ARTICLE_LOOKBACK_DAYS = 1;
const MIN_RELEVANCE_SCORE = 7; // à ajuster

// 🔹 Public API : appelé par ta route / ton front
export async function getOrCreateTodayFeed(
  userId: string
): Promise<ArticleWithTags[]> {
  const feedDate = getStartOfTodayUTC();

  // 1. Vérifier s'il existe déjà un feed pour aujourd'hui
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

  // 2. Sinon, le construire
  const articles = await buildFeedForUser(userId, feedDate);

  if (articles.length === 0) {
    return [];
  }

  // 3. Sauvegarder les feed items
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

// 🔹 Construction du feed (logique principale)
async function buildFeedForUser(
  userId: string,
  feedDate: Date
): Promise<ArticleWithTags[]> {
  // 1. Récupérer les préférences de tags
  const userTagPrefs = await prisma.userTagPreference.findMany({
    where: { userId },
  });

  const tagScoreMap = new Map<string, number>(
    userTagPrefs.map((pref) => [pref.tagId, pref.score])
  );

  // 2. Articles déjà vus / interactés (pour ne pas les remontrer)
  const seenInteractions = await prisma.userArticleInteraction.findMany({
    where: { userId },
    select: { articleId: true },
  });

  const seenArticleIds = seenInteractions.map((i) => i.articleId);

  // 3. Fenêtre de récence
  const cutoff = new Date(feedDate);
  cutoff.setDate(cutoff.getDate() - ARTICLE_LOOKBACK_DAYS);

  // 4. Récupérer les candidats
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

  // 5. Scorer chaque article
  const scored = candidates.map((article) => ({
    article,
    score: computeArticleScore(article as ArticleWithTags, tagScoreMap),
  }));

  // 6. Trier par score desc
  scored.sort((a, b) => b.score - a.score);

  // 7. Prendre les FEED_SIZE meilleurs (ou moins s'il n'y en a pas assez)
  const selected = scored.slice(0, FEED_SIZE).map((s) => s.article);

  return selected;
}

// 🔹 Scoring personnalisé par user
function computeArticleScore(
  article: ArticleWithTags,
  tagScoreMap: Map<string, number>
): number {
  // 1. Score de tags (moyenne des prefs user sur les tags de l'article)
  const tagScores = article.tags.map((tag) => tagScoreMap.get(tag.id) ?? 0);
  const userTagScore =
    tagScores.length > 0
      ? tagScores.reduce((a, b) => a + b, 0) / tagScores.length
      : 0;

  // 2. Recency boost (0–1 sur ARTICLE_LOOKBACK_DAYS)
  const now = Date.now();
  const daysOld = (now - article.publishedAt.getTime()) / (1000 * 60 * 60 * 24);
  const recencyBoost = Math.max(
    0,
    1 - daysOld / ARTICLE_LOOKBACK_DAYS // 1 = très récent, ~0 à J+ARTICLE_LOOKBACK_DAYS
  );

  // 3. Normaliser relevanceScore (0–1)
  const relevanceNorm = Math.min(1, article.relevanceScore / 100);

  // 4. Poids
  const wTags = 0.6;
  const wRecency = 0.2;
  const wRelevance = 0.2;

  let score =
    wTags * userTagScore + wRecency * recencyBoost + wRelevance * relevanceNorm;

  // 5. Petit bruit aléatoire pour exploration
  score += Math.random() * 0.05;

  return score;
}
