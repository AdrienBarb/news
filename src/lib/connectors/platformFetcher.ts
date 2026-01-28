import { scrapeRedditSearch } from "./reddit/client";
import { scrapeHackerNewsSearch } from "./hackernews/client";
import type { PlatformKey } from "@/lib/constants/platforms";

export type { PlatformKey };

const REDDIT_BASE_URL = "https://www.reddit.com";

/**
 * Unified post format returned by the platform fetcher
 */
export interface PlatformPost {
  id: string;
  externalId: string; // Unique ID with platform prefix (t3_xxx, hn_xxx)
  title: string;
  content: string; // selftext / story_text
  url: string;
  author: string;
  subreddit: string | null; // Only for Reddit
  score: number;
  numComments: number;
  createdUtc: number; // Unix timestamp
}

/**
 * Fetch options for platform search
 */
export interface PlatformFetchOptions {
  limit?: number;
  maxAgeDays?: number;
  // Reddit-specific options
  sort?: "relevance" | "hot" | "top" | "new";
  t?: "hour" | "day" | "week" | "month" | "year" | "all";
}

/**
 * Unified platform fetcher that routes to the correct connector
 *
 * @param platform - Platform to fetch from (reddit, hackernews)
 * @param query - Search query
 * @param options - Fetch options (limit, maxAgeDays, etc.)
 */
export async function fetchForPlatform(
  platform: PlatformKey,
  query: string,
  options: PlatformFetchOptions = {}
): Promise<PlatformPost[]> {
  switch (platform) {
    case "reddit":
      return fetchReddit(query, options);

    case "hackernews":
      return fetchHackerNews(query, options);

    case "twitter":
    case "linkedin":
      // Not implemented yet
      console.warn(`   ⚠️ Platform "${platform}" is not yet supported`);
      return [];

    default:
      console.error(`   ❌ Unknown platform: ${platform}`);
      return [];
  }
}

/**
 * Fetch posts from Reddit
 */
async function fetchReddit(
  query: string,
  options: PlatformFetchOptions
): Promise<PlatformPost[]> {
  const posts = await scrapeRedditSearch(query, {
    sort: options.sort || "relevance",
    t: options.t || "year",
    limit: options.limit || 50,
    maxAgeDays: options.maxAgeDays || 365,
  });

  return posts.map((post) => ({
    id: post.id,
    externalId: `t3_${post.id}`,
    title: post.title,
    content: post.selftext || "",
    url: post.url || `${REDDIT_BASE_URL}${post.permalink}`,
    author: post.author,
    subreddit: post.subreddit,
    score: post.score,
    numComments: post.num_comments,
    createdUtc: post.created_utc,
  }));
}

/**
 * Fetch posts from HackerNews
 */
async function fetchHackerNews(
  query: string,
  options: PlatformFetchOptions
): Promise<PlatformPost[]> {
  const posts = await scrapeHackerNewsSearch(query, {
    limit: options.limit || 50,
    maxAgeDays: options.maxAgeDays || 90,
  });

  return posts.map((post) => ({
    id: post.id,
    externalId: `hn_${post.id}`,
    title: post.title,
    content: post.selftext || "",
    url: post.url,
    author: post.author,
    subreddit: null, // HackerNews doesn't have subreddits
    score: post.score,
    numComments: post.num_comments,
    createdUtc: post.created_utc,
  }));
}
