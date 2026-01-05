import type { RedditSearchResult } from "./types";

const REDDIT_PUBLIC_BASE = "https://www.reddit.com";
const SCRAPINGBEE_API_URL = "https://app.scrapingbee.com/api/v1/";

// Rate limiting for ScrapingBee (they handle Reddit rate limits, but we should still be reasonable)
const REQUEST_DELAY_MS = 1000; // 1 second between requests
const MAX_RETRIES = 2;

let lastRequestTime = 0;

/**
 * Check if ScrapingBee is configured
 */
function isScrapingBeeConfigured(): boolean {
  return !!process.env.SCRAPINGBEE_API_KEY;
}

/**
 * Delay execution for specified milliseconds
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Make a request through ScrapingBee proxy
 * ScrapingBee handles rate limiting, IP rotation, and anti-bot measures
 */
async function scrapingBeeRequest<T>(
  targetUrl: string,
  retryCount = 0
): Promise<T> {
  const apiKey = process.env.SCRAPINGBEE_API_KEY;

  if (!apiKey) {
    throw new Error(
      "SCRAPINGBEE_API_KEY not configured. Add it to your environment variables."
    );
  }

  // Enforce minimum delay between requests
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < REQUEST_DELAY_MS) {
    await delay(REQUEST_DELAY_MS - timeSinceLastRequest);
  }
  lastRequestTime = Date.now();

  const params = new URLSearchParams({
    api_key: apiKey,
    url: targetUrl,
    render_js: "false", // Reddit JSON doesn't need JS rendering (saves credits)
    premium_proxy: "true", // Use residential proxies for Reddit
  });

  const response = await fetch(`${SCRAPINGBEE_API_URL}?${params.toString()}`);

  // Handle ScrapingBee errors
  if (response.status === 500) {
    if (retryCount >= MAX_RETRIES) {
      throw new Error("ScrapingBee request failed after retries");
    }
    console.log(
      `ScrapingBee error (500). Retry ${retryCount + 1}/${MAX_RETRIES}`
    );
    await delay(2000);
    return scrapingBeeRequest<T>(targetUrl, retryCount + 1);
  }

  if (response.status === 401) {
    throw new Error("ScrapingBee API key is invalid");
  }

  if (response.status === 402) {
    throw new Error(
      "ScrapingBee credits exhausted. Please top up your account."
    );
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`ScrapingBee error: ${response.status} - ${text}`);
  }

  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `Failed to parse Reddit JSON response: ${text.slice(0, 200)}`
    );
  }
}

/**
 * Make a direct request to Reddit (fallback for local development)
 */
async function directRedditRequest<T>(url: string, retryCount = 0): Promise<T> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < REQUEST_DELAY_MS * 6) {
    // 6 seconds for direct requests
    await delay(REQUEST_DELAY_MS * 6 - timeSinceLastRequest);
  }
  lastRequestTime = Date.now();

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
      Accept: "application/json",
    },
  });

  if (response.status === 429) {
    if (retryCount >= MAX_RETRIES) {
      throw new Error("Reddit rate limit exceeded");
    }
    const backoffMs = Math.pow(2, retryCount) * 30000;
    console.log(
      `Reddit rate limited. Retry ${retryCount + 1}/${MAX_RETRIES} after ${backoffMs / 1000}s`
    );
    await delay(backoffMs);
    return directRedditRequest<T>(url, retryCount + 1);
  }

  if (response.status === 403) {
    throw new Error(
      "Reddit blocked request (403). Configure SCRAPINGBEE_API_KEY for production."
    );
  }

  if (!response.ok) {
    throw new Error(`Reddit API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Make a request to Reddit, using ScrapingBee if configured
 */
async function redditRequest<T>(url: string): Promise<T> {
  if (isScrapingBeeConfigured()) {
    console.log(`📡 Using ScrapingBee for Reddit request`);
    return scrapingBeeRequest<T>(url);
  } else {
    console.log(`📡 Using direct Reddit request (dev mode)`);
    return directRedditRequest<T>(url);
  }
}

/**
 * Search Reddit posts
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
    type: "link",
    raw_json: "1",
  });

  if (options.after) {
    params.append("after", options.after);
  }

  const url = options.subreddit
    ? `${REDDIT_PUBLIC_BASE}/r/${options.subreddit}/search.json?${params.toString()}&restrict_sr=1`
    : `${REDDIT_PUBLIC_BASE}/search.json?${params.toString()}`;

  return redditRequest<RedditSearchResult>(url);
}

/**
 * Get comments for a specific post
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

  return redditRequest<RedditSearchResult[]>(url);
}

/**
 * Test Reddit access - checks both direct and ScrapingBee
 */
export async function testRedditAccess(): Promise<{
  success: boolean;
  method: "scrapingbee" | "direct";
  status?: number;
  message: string;
  postsFound?: number;
}> {
  const testUrl = `${REDDIT_PUBLIC_BASE}/r/technology/hot.json?limit=5&raw_json=1`;

  try {
    if (isScrapingBeeConfigured()) {
      const data = await scrapingBeeRequest<RedditSearchResult>(testUrl);
      const postsFound = data?.data?.children?.length || 0;
      return {
        success: true,
        method: "scrapingbee",
        message: "Reddit accessible via ScrapingBee",
        postsFound,
      };
    } else {
      const data = await directRedditRequest<RedditSearchResult>(testUrl);
      const postsFound = data?.data?.children?.length || 0;
      return {
        success: true,
        method: "direct",
        message: "Reddit accessible directly (dev mode)",
        postsFound,
      };
    }
  } catch (error) {
    return {
      success: false,
      method: isScrapingBeeConfigured() ? "scrapingbee" : "direct",
      message: error instanceof Error ? error.message : String(error),
    };
  }
}
