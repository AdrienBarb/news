import {
  selectTopArticlesForUser,
  type ArticleWithTags,
} from "@/lib/services/article/articleSelectionService";

const NEWSLETTER_SIZE = 10;
const NEWSLETTER_LOOKBACK_DAYS = 7;
const MIN_RELEVANCE_SCORE = 7;

export async function getNewsletterArticles(
  userId: string
): Promise<ArticleWithTags[]> {
  return selectTopArticlesForUser(userId, {
    lookbackDays: NEWSLETTER_LOOKBACK_DAYS,
    minRelevanceScore: MIN_RELEVANCE_SCORE,
    maxArticles: NEWSLETTER_SIZE,
  });
}
