import { ApifyClient } from "apify-client";
import type { RedditPost } from "./types";

// Apify Reddit Scraper (full version - better results than lite)
const REDDIT_SCRAPER_ACTOR = "trudax/reddit-scraper";

/**
 * Apify response format for Reddit posts
 */
interface ApifyRedditPost {
  id: string;
  parsedId: string;
  url: string;
  username: string;
  title: string;
  body: string;
  communityName: string;
  parsedCommunityName: string;
  numberOfComments: number;
  upVotes: number;
  isVideo: boolean;
  isAd: boolean;
  over18: boolean;
  createdAt: string;
  scrapedAt: string;
  dataType: "post" | "comment" | "community" | "user";
}

/**
 * Initialize Apify client
 */
function getApifyClient(): ApifyClient {
  const token = process.env.APIFY_API;
  if (!token) {
    throw new Error(
      "APIFY_API not configured. Add it to your environment variables."
    );
  }
  return new ApifyClient({ token });
}

/**
 * Convert Apify post to our RedditPost format
 */
function convertApifyPost(post: ApifyRedditPost): RedditPost {
  // Parse createdAt to Unix timestamp
  const createdDate = new Date(post.createdAt);
  const createdUtc = Math.floor(createdDate.getTime() / 1000);

  return {
    id: post.parsedId,
    name: post.id, // Apify uses "t3_xxx" format for id
    title: post.title,
    selftext: post.body || "",
    url: post.url,
    permalink: post.url.replace("https://www.reddit.com", ""),
    subreddit: post.parsedCommunityName || "",
    author: post.username || "",
    created_utc: createdUtc,
    score: post.upVotes || 0,
    num_comments: post.numberOfComments || 0,
  };
}

/**
 * Search Reddit using Apify Reddit Scraper (full version)
 * Returns structured JSON directly with full post bodies
 *
 * @param query - Search query
 * @param options - Search options including time filter and limits
 * @param options.sort - Sort order (relevance, hot, top, new)
 * @param options.t - Time filter (hour, day, week, month, year, all)
 * @param options.limit - Maximum posts to return per query
 * @param options.maxAgeDays - Maximum age of posts in days (filters client-side)
 */
export async function scrapeRedditSearch(
  query: string,
  options: {
    sort?: "relevance" | "hot" | "top" | "new";
    t?: "hour" | "day" | "week" | "month" | "year" | "all";
    limit?: number;
    maxAgeDays?: number;
  } = {}
): Promise<RedditPost[]> {
  const sort = options.sort || "relevance";
  const time = options.t || "week";
  const limit = options.limit || 50;
  const maxAgeDays = options.maxAgeDays || 365; // Default to 1 year

  console.log(
    `   🔍 Searching Reddit via Apify: "${query}" (sort=${sort}, time=${time}, limit=${limit}, maxAge=${maxAgeDays}d)`
  );

  const client = getApifyClient();

  // Prepare Apify actor input (full version has more options)
  const input = {
    searches: [query],
    searchPosts: true,
    searchComments: false,
    searchCommunities: false,
    searchUsers: false,
    sort: sort,
    time: time,
    maxItems: limit * 2, // Get more items to filter
    maxPostCount: limit,
    maxComments: 0, // No comments needed
    skipComments: true,
    skipUserPosts: true,
    skipCommunity: true,
    includeNSFW: false,
    scrollTimeout: 60, // Increased from 40 - Reddit can be slow
    proxy: {
      useApifyProxy: true,
      apifyProxyGroups: ["RESIDENTIAL"], // Required to avoid Reddit blocks
    },
  };

  try {
    // Run the actor and wait for it to finish
    const run = await client.actor(REDDIT_SCRAPER_ACTOR).call(input);

    // Fetch results from the dataset
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    console.log(`   📥 Received ${items.length} items from Apify`);

    // Filter and convert posts
    const cutoffDate = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
    const posts: RedditPost[] = [];

    for (const item of items) {
      const apifyPost = item as unknown as ApifyRedditPost;

      // Only process posts (not comments, communities, users)
      if (apifyPost.dataType !== "post") {
        continue;
      }

      // Skip ads
      if (apifyPost.isAd) {
        continue;
      }

      // Skip NSFW content
      if (apifyPost.over18) {
        continue;
      }

      // Skip old posts based on dynamic maxAgeDays
      const postDate = new Date(apifyPost.createdAt).getTime();
      if (postDate < cutoffDate) {
        console.log(
          `   ⏭️ Skipping old post: ${apifyPost.title?.slice(0, 40)}...`
        );
        continue;
      }

      posts.push(convertApifyPost(apifyPost));
    }

    console.log(`   ✅ Parsed ${posts.length} posts from Apify`);
    return posts;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`   ❌ Apify error for "${query}": ${errorMessage}`);

    // Return empty array to allow other keywords to continue
    return [];
  }
}

/**
 * Test Reddit access via Apify
 */
export async function testRedditAccess(): Promise<{
  success: boolean;
  method: "apify";
  message: string;
  postsFound?: number;
}> {
  try {
    const posts = await scrapeRedditSearch("test", {
      sort: "new",
      t: "day",
      limit: 5,
      maxAgeDays: 1,
    });

    return {
      success: true,
      method: "apify",
      message: "Reddit accessible via Apify",
      postsFound: posts.length,
    };
  } catch (error) {
    return {
      success: false,
      method: "apify",
      message: error instanceof Error ? error.message : String(error),
    };
  }
}
