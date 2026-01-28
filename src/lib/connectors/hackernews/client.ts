import type {
  AlgoliaSearchResponse,
  HackerNewsPost,
  HackerNewsSearchOptions,
  HackerNewsStory,
} from "./types";

const ALGOLIA_API_BASE = "https://hn.algolia.com/api/v1";
const HN_BASE_URL = "https://news.ycombinator.com";

/**
 * Convert Algolia HN story to our normalized HackerNewsPost format
 */
function convertAlgoliaStory(story: HackerNewsStory): HackerNewsPost {
  return {
    id: story.objectID,
    title: story.title || "",
    selftext: story.story_text || "",
    url: `${HN_BASE_URL}/item?id=${story.objectID}`,
    author: story.author || "",
    created_utc: story.created_at_i,
    score: story.points || 0,
    num_comments: story.num_comments || 0,
  };
}

/**
 * Search HackerNews using the free Algolia API
 * No API key required
 *
 * @param query - Search query
 * @param options - Search options including time filter and limits
 * @param options.limit - Maximum posts to return (default: 50)
 * @param options.maxAgeDays - Maximum age of posts in days (default: 90)
 */
export async function scrapeHackerNewsSearch(
  query: string,
  options: HackerNewsSearchOptions = {}
): Promise<HackerNewsPost[]> {
  const limit = options.limit || 50;
  const maxAgeDays = options.maxAgeDays || 90;

  // Calculate timestamp for filtering old posts
  const cutoffTimestamp = Math.floor(
    (Date.now() - maxAgeDays * 24 * 60 * 60 * 1000) / 1000
  );

  console.log(
    `   🔍 Searching HackerNews via Algolia: "${query}" (limit=${limit}, maxAge=${maxAgeDays}d)`
  );

  try {
    // Build search URL with numeric filter for date
    // tags=story filters for stories only (no comments)
    // numericFilters filters by created_at_i (unix timestamp)
    const searchParams = new URLSearchParams({
      query: query,
      tags: "story",
      numericFilters: `created_at_i>${cutoffTimestamp}`,
      hitsPerPage: String(Math.min(limit * 2, 100)), // Get extra to filter, max 100 per page
    });

    const url = `${ALGOLIA_API_BASE}/search?${searchParams.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Algolia API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as AlgoliaSearchResponse;

    console.log(`   📥 Received ${data.hits.length} stories from Algolia`);

    // Convert and filter posts
    const posts: HackerNewsPost[] = [];

    for (const story of data.hits) {
      // Skip stories without a title
      if (!story.title) {
        continue;
      }

      // Skip old posts (double-check in case API filter didn't work)
      if (story.created_at_i < cutoffTimestamp) {
        continue;
      }

      posts.push(convertAlgoliaStory(story));

      // Stop if we've reached the limit
      if (posts.length >= limit) {
        break;
      }
    }

    console.log(`   ✅ Parsed ${posts.length} posts from Algolia`);
    return posts;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`   ❌ Algolia error for "${query}": ${errorMessage}`);

    // Return empty array to allow other keywords to continue
    return [];
  }
}

/**
 * Test HackerNews access via Algolia API
 */
export async function testHackerNewsAccess(): Promise<{
  success: boolean;
  method: "algolia";
  message: string;
  postsFound?: number;
}> {
  try {
    const posts = await scrapeHackerNewsSearch("test", {
      limit: 5,
      maxAgeDays: 7,
    });

    return {
      success: true,
      method: "algolia",
      message: "HackerNews accessible via Algolia API",
      postsFound: posts.length,
    };
  } catch (error) {
    return {
      success: false,
      method: "algolia",
      message: error instanceof Error ? error.message : String(error),
    };
  }
}
