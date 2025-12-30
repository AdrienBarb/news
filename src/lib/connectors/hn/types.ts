// Hacker News Algolia API Types

export interface HNAlgoliaHit {
  objectID: string;
  title?: string; // Only for stories
  story_title?: string; // For comments, title of parent story
  url?: string;
  author: string;
  points: number | null;
  story_text?: string; // Self-post text
  comment_text?: string; // Comment text
  num_comments?: number;
  story_id?: number; // Parent story ID for comments
  parent_id?: number;
  created_at: string; // ISO date string
  created_at_i: number; // Unix timestamp
  _tags: string[]; // e.g., ["story", "author_username", "story_12345"]
  _highlightResult?: Record<string, unknown>;
}

export interface HNAlgoliaSearchResult {
  hits: HNAlgoliaHit[];
  nbHits: number;
  page: number;
  nbPages: number;
  hitsPerPage: number;
  exhaustiveNbHits: boolean;
  exhaustiveTypo: boolean;
  query: string;
  params: string;
  processingTimeMS: number;
}

export interface HNConversation {
  externalId: string;
  source: "hackernews";
  url: string;
  title: string | null;
  rawContent: string;
  author: string;
  publishedAt: Date;
}

export interface HNSearchOptions {
  query: string;
  tags?: ("story" | "comment" | "poll" | "job")[];
  numericFilters?: string; // e.g., "created_at_i>1234567890"
  hitsPerPage?: number;
  page?: number;
}

