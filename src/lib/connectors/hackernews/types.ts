// HackerNews Algolia API Types

/**
 * HackerNews story from Algolia API
 */
export interface HackerNewsStory {
  objectID: string;
  title: string;
  url: string | null; // External URL (null for Ask HN, Show HN self-posts)
  author: string;
  points: number;
  num_comments: number;
  created_at: string; // ISO date string
  created_at_i: number; // Unix timestamp
  story_text: string | null; // For Ask HN / Show HN self-posts
}

/**
 * Algolia API search response
 */
export interface AlgoliaSearchResponse {
  hits: HackerNewsStory[];
  nbHits: number;
  page: number;
  nbPages: number;
  hitsPerPage: number;
}

/**
 * Normalized HackerNews post for internal use
 */
export interface HackerNewsPost {
  id: string; // objectID from Algolia
  title: string;
  selftext: string; // story_text or empty
  url: string; // HN item URL
  author: string;
  created_utc: number; // Unix timestamp
  score: number;
  num_comments: number;
}

/**
 * Search options for HackerNews
 */
export interface HackerNewsSearchOptions {
  limit?: number;
  maxAgeDays?: number;
}
