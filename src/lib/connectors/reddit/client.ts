import type { RedditAccessToken, RedditSearchResult } from "./types";

const REDDIT_API_BASE = "https://oauth.reddit.com";
const REDDIT_AUTH_URL = "https://www.reddit.com/api/v1/access_token";
const USER_AGENT = "MarketSignals/1.0.0 (by /u/MarketSignalsApp)";

// Rate limiting: 100 requests per minute for OAuth apps
const RATE_LIMIT_REQUESTS = 100;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

let tokenCache: RedditAccessToken | null = null;
let requestTimestamps: number[] = [];

/**
 * Get Reddit OAuth credentials from environment variables
 */
function getCredentials() {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing Reddit API credentials. Set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET environment variables."
    );
  }

  return { clientId, clientSecret };
}

/**
 * Get a valid access token, refreshing if necessary
 */
async function getAccessToken(): Promise<string> {
  const now = Date.now();

  // Check if cached token is still valid (with 60s buffer)
  if (tokenCache && tokenCache.expires_at > now + 60000) {
    return tokenCache.access_token;
  }

  const { clientId, clientSecret } = getCredentials();

  // Use application-only OAuth (no user context needed)
  const authString = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  const response = await fetch(REDDIT_AUTH_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${authString}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": USER_AGENT,
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to get Reddit access token: ${response.status} - ${text}`);
  }

  const data = await response.json();

  tokenCache = {
    ...data,
    expires_at: now + data.expires_in * 1000,
  };

  return tokenCache!.access_token;
}

/**
 * Wait if necessary to respect rate limits
 */
async function waitForRateLimit(): Promise<void> {
  const now = Date.now();

  // Remove timestamps older than the rate limit window
  requestTimestamps = requestTimestamps.filter(
    (ts) => now - ts < RATE_LIMIT_WINDOW_MS
  );

  // If we've hit the rate limit, wait until the oldest request expires
  if (requestTimestamps.length >= RATE_LIMIT_REQUESTS) {
    const oldestTimestamp = requestTimestamps[0];
    const waitTime = RATE_LIMIT_WINDOW_MS - (now - oldestTimestamp) + 100;
    if (waitTime > 0) {
      console.log(`Reddit rate limit reached, waiting ${waitTime}ms`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  // Record this request
  requestTimestamps.push(Date.now());
}

/**
 * Make an authenticated request to the Reddit API with rate limiting
 */
export async function redditRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  await waitForRateLimit();

  const accessToken = await getAccessToken();

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${REDDIT_API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": USER_AGENT,
    },
  });

  if (response.status === 429) {
    // Rate limited - wait and retry once
    const retryAfter = parseInt(response.headers.get("Retry-After") || "60", 10);
    console.log(`Reddit 429 rate limit, retrying after ${retryAfter}s`);
    await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
    return redditRequest(endpoint, options);
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Reddit API error: ${response.status} - ${text}`);
  }

  return response.json();
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
    type: "link", // Search for posts only
    raw_json: "1", // Get unescaped content
  });

  if (options.after) {
    params.append("after", options.after);
  }

  const endpoint = options.subreddit
    ? `/r/${options.subreddit}/search?${params.toString()}&restrict_sr=1`
    : `/search?${params.toString()}`;

  return redditRequest<RedditSearchResult>(endpoint);
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

  // Reddit returns an array: [post, comments]
  return redditRequest<RedditSearchResult[]>(
    `/r/${subreddit}/comments/${postId}?${params.toString()}`
  );
}

