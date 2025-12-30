// Reddit API Types

export interface RedditAccessToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  expires_at: number; // Unix timestamp when token expires
}

export interface RedditPost {
  id: string; // Post ID (without t3_ prefix)
  name: string; // Full name with prefix (t3_abc123)
  title: string;
  selftext: string;
  url: string;
  permalink: string;
  subreddit: string;
  author: string;
  created_utc: number;
  score: number;
  num_comments: number;
}

export interface RedditComment {
  id: string;
  name: string; // Full name with prefix (t1_abc123)
  body: string;
  permalink: string;
  subreddit: string;
  author: string;
  created_utc: number;
  score: number;
  parent_id: string;
  link_id: string; // ID of the parent post
}

export interface RedditSearchResult {
  kind: string;
  data: {
    after: string | null;
    before: string | null;
    children: Array<{
      kind: string;
      data: RedditPost | RedditComment;
    }>;
  };
}

export interface RedditConversation {
  externalId: string;
  source: "reddit";
  url: string;
  title: string | null;
  rawContent: string;
  author: string;
  publishedAt: Date;
}

export interface RedditSearchOptions {
  query: string;
  sort?: "relevance" | "hot" | "top" | "new" | "comments";
  timeframe?: "hour" | "day" | "week" | "month" | "year" | "all";
  limit?: number;
  subreddit?: string;
}

