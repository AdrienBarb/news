import type { RedditSearchResult } from "./types";

const REDDIT_PUBLIC_BASE = "https://www.reddit.com";

// Rate limiting: Be conservative to avoid blocks
// Reddit allows ~60 requests/minute unauthenticated, but we'll be safer
const REQUEST_DELAY_MS = 2500; // 2.5 seconds between requests
const MAX_RETRIES = 3;

// Pool of realistic browser User-Agents for rotation
const USER_AGENTS = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
];

let lastRequestTime = 0;

/**
 * Get a random User-Agent from the pool
 */
function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Delay execution for specified milliseconds
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Make a rate-limited request to Reddit's public JSON API
 * Handles rate limiting with exponential backoff
 */
async function redditPublicRequest<T>(url: string, retryCount = 0): Promise<T> {
  // Enforce minimum delay between requests
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < REQUEST_DELAY_MS) {
    await delay(REQUEST_DELAY_MS - timeSinceLastRequest);
  }
  lastRequestTime = Date.now();

  const response = await fetch(url, {
    headers: {
      "User-Agent": getRandomUserAgent(),
      Accept: "application/json",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  // Handle rate limiting with exponential backoff
  if (response.status === 429) {
    if (retryCount >= MAX_RETRIES) {
      throw new Error(
        `Reddit rate limit exceeded after ${MAX_RETRIES} retries`
      );
    }

    // Exponential backoff: 30s, 60s, 120s
    const backoffMs = Math.pow(2, retryCount) * 30000;
    console.log(
      `Reddit rate limited (429). Retry ${retryCount + 1}/${MAX_RETRIES} after ${backoffMs / 1000}s`
    );
    await delay(backoffMs);
    return redditPublicRequest<T>(url, retryCount + 1);
  }

  // Handle other common error codes
  if (response.status === 403) {
    throw new Error(
      "Reddit blocked request (403 Forbidden). Datacenter IP may be blocked."
    );
  }

  if (response.status === 503) {
    if (retryCount >= MAX_RETRIES) {
      throw new Error("Reddit service unavailable after retries");
    }
    // Reddit sometimes returns 503 under load, retry after brief delay
    await delay(5000);
    return redditPublicRequest<T>(url, retryCount + 1);
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Reddit API error: ${response.status} - ${text}`);
  }

  return response.json();
}

/**
 * Search Reddit posts using public JSON API
 */
export async function searchReddit(
  query: string,
  options: {
    sort?: "relevance" | "hot" | "top" | "new" | "comments";
    t?: "hour" | "day" | "week" | "month" | "year" | "all";
    limit?: number;
    after?: string;
    subreddit?: string;
  } = {}
): Promise<RedditSearchResult> {
  const params = new URLSearchParams({
    q: query,
    sort: options.sort || "relevance",
    t: options.t || "week",
    limit: String(options.limit || 25),
    type: "link", // Search for posts only
    raw_json: "1", // Get unescaped content
  });

  if (options.after) {
    params.append("after", options.after);
  }

  const url = options.subreddit
    ? `${REDDIT_PUBLIC_BASE}/r/${options.subreddit}/search.json?${params.toString()}&restrict_sr=1`
    : `${REDDIT_PUBLIC_BASE}/search.json?${params.toString()}`;

  return redditPublicRequest<RedditSearchResult>(url);
}

/**
 * Get comments for a specific post using public JSON API
 */
export async function getPostComments(
  subreddit: string,
  postId: string,
  options: {
    sort?: "best" | "top" | "new" | "controversial" | "old" | "qa";
    limit?: number;
  } = {}
): Promise<RedditSearchResult[]> {
  const params = new URLSearchParams({
    sort: options.sort || "top",
    limit: String(options.limit || 50),
    raw_json: "1",
  });

  const url = `${REDDIT_PUBLIC_BASE}/r/${subreddit}/comments/${postId}.json?${params.toString()}`;

  // Reddit returns an array: [post, comments]
  return redditPublicRequest<RedditSearchResult[]>(url);
}

/**
 * Test if Reddit is accessible from this server
 * Returns success status and diagnostic info
 */
export async function testRedditAccess(): Promise<{
  success: boolean;
  status?: number;
  message: string;
  postsFound?: number;
}> {
  try {
    const response = await fetch(
      `${REDDIT_PUBLIC_BASE}/r/technology/hot.json?limit=5&raw_json=1`,
      {
        headers: {
          "User-Agent": getRandomUserAgent(),
          Accept: "application/json",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      const postsFound = data?.data?.children?.length || 0;
      return {
        success: true,
        status: response.status,
        message: "Reddit is accessible from this server",
        postsFound,
      };
    }

    if (response.status === 403) {
      return {
        success: false,
        status: 403,
        message:
          "Reddit blocked this request (403). Datacenter IP may be blocked. Consider using ScrapingBee or residential proxies.",
      };
    }

    if (response.status === 429) {
      return {
        success: false,
        status: 429,
        message:
          "Reddit rate limited this request (429). Try again later or reduce request frequency.",
      };
    }

    return {
      success: false,
      status: response.status,
      message: `Reddit returned status ${response.status}`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to connect to Reddit: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
