import { searchHNByDateRange } from "./client";
import type { HNAlgoliaHit, HNConversation, HNSearchOptions } from "./types";

const HN_BASE_URL = "https://news.ycombinator.com";

/**
 * Strip HTML tags from text (HN API returns HTML-formatted text)
 */
function stripHtmlTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Convert an HN Algolia hit to our Conversation format
 */
function hitToConversation(hit: HNAlgoliaHit): HNConversation | null {
  const isStory = hit._tags.includes("story");
  const isComment = hit._tags.includes("comment");

  // Determine the content
  let rawContent: string;
  if (isStory) {
    rawContent = hit.story_text
      ? stripHtmlTags(hit.story_text)
      : hit.title || "";
  } else if (isComment) {
    rawContent = hit.comment_text ? stripHtmlTags(hit.comment_text) : "";
  } else {
    return null; // Skip polls, jobs, etc.
  }

  // Skip empty or very short content
  if (!rawContent || rawContent.length < 20) {
    return null;
  }

  // Determine the URL
  let url: string;
  if (isStory) {
    url = `${HN_BASE_URL}/item?id=${hit.objectID}`;
  } else {
    url = `${HN_BASE_URL}/item?id=${hit.objectID}`;
  }

  // Determine the title
  const title = isStory
    ? hit.title || null
    : hit.story_title || null;

  return {
    externalId: isComment ? `hn_comment_${hit.objectID}` : `hn_${hit.objectID}`,
    source: "hackernews",
    url,
    title,
    rawContent,
    author: hit.author,
    publishedAt: new Date(hit.created_at_i * 1000),
  };
}

/**
 * Search Hacker News for conversations matching the query
 */
export async function searchHNConversations(
  options: Omit<HNSearchOptions, "numericFilters"> & {
    startDate?: Date;
    endDate?: Date;
    includeStories?: boolean;
    includeComments?: boolean;
    maxPages?: number;
  }
): Promise<HNConversation[]> {
  const {
    query,
    startDate,
    endDate,
    includeStories = true,
    includeComments = true,
    hitsPerPage = 50,
    maxPages = 2,
  } = options;

  const conversations: HNConversation[] = [];

  // Build tags filter
  const tags: ("story" | "comment")[] = [];
  if (includeStories) tags.push("story");
  if (includeComments) tags.push("comment");

  if (tags.length === 0) {
    return conversations;
  }

  try {
    let page = 0;
    let hasMore = true;

    while (hasMore && page < maxPages) {
      const result = await searchHNByDateRange(query, {
        startDate,
        endDate,
        tags,
        hitsPerPage,
        page,
      });

      for (const hit of result.hits) {
        const conversation = hitToConversation(hit);
        if (conversation) {
          conversations.push(conversation);
        }
      }

      // Check if there are more pages
      hasMore = page < result.nbPages - 1;
      page++;
    }
  } catch (error) {
    console.error(`HN search failed for query "${query}":`, error);
    throw error;
  }

  return conversations;
}

/**
 * Calculate the start date for a given time window
 */
export function getStartDateForTimeWindow(
  window: "day" | "week" | "month"
): Date {
  const now = new Date();

  switch (window) {
    case "day":
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case "week":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "month":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}

