import type { HNAlgoliaSearchResult, HNSearchOptions } from "./types";

const HN_ALGOLIA_API = "https://hn.algolia.com/api/v1";

// Courtesy rate limiting: 1 request per second
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL_MS = 1000;

/**
 * Wait to respect courtesy rate limiting
 */
async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL_MS) {
    const waitTime = MIN_REQUEST_INTERVAL_MS - timeSinceLastRequest;
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }

  lastRequestTime = Date.now();
}

/**
 * Search Hacker News using Algolia API
 */
export async function searchHN(
  options: HNSearchOptions
): Promise<HNAlgoliaSearchResult> {
  await waitForRateLimit();

  const { query, tags, numericFilters, hitsPerPage = 50, page = 0 } = options;

  const params = new URLSearchParams({
    query,
    hitsPerPage: String(hitsPerPage),
    page: String(page),
  });

  // Tags filter (e.g., "story" or "(story,comment)")
  if (tags && tags.length > 0) {
    if (tags.length === 1) {
      params.append("tags", tags[0]);
    } else {
      params.append("tags", `(${tags.join(",")})`);
    }
  }

  // Numeric filters (e.g., time range)
  if (numericFilters) {
    params.append("numericFilters", numericFilters);
  }

  const url = `${HN_ALGOLIA_API}/search?${params.toString()}`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HN Algolia API error: ${response.status} - ${text}`);
  }

  return response.json();
}

/**
 * Search HN with date range filter
 */
export async function searchHNByDateRange(
  query: string,
  options: {
    startDate?: Date;
    endDate?: Date;
    tags?: ("story" | "comment" | "poll" | "job")[];
    hitsPerPage?: number;
    page?: number;
  } = {}
): Promise<HNAlgoliaSearchResult> {
  const { startDate, endDate, tags, hitsPerPage, page } = options;

  let numericFilters: string | undefined;

  if (startDate || endDate) {
    const filters: string[] = [];

    if (startDate) {
      filters.push(`created_at_i>${Math.floor(startDate.getTime() / 1000)}`);
    }

    if (endDate) {
      filters.push(`created_at_i<${Math.floor(endDate.getTime() / 1000)}`);
    }

    numericFilters = filters.join(",");
  }

  return searchHN({
    query,
    tags,
    numericFilters,
    hitsPerPage,
    page,
  });
}

/**
 * Get a specific HN item by ID
 */
export async function getHNItem(id: string): Promise<HNAlgoliaSearchResult> {
  await waitForRateLimit();

  const url = `${HN_ALGOLIA_API}/items/${id}`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HN Algolia API error: ${response.status} - ${text}`);
  }

  return response.json();
}

