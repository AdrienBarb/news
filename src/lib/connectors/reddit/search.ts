import { searchReddit, getPostComments } from "./client";
import type {
  RedditPost,
  RedditComment,
  RedditConversation,
  RedditSearchOptions,
} from "./types";

const REDDIT_BASE_URL = "https://www.reddit.com";

/**
 * Convert a Reddit post to our Conversation format
 */
function postToConversation(post: RedditPost): RedditConversation {
  return {
    externalId: `t3_${post.id}`,
    source: "reddit",
    url: `${REDDIT_BASE_URL}${post.permalink}`,
    title: post.title,
    rawContent: post.selftext || post.title,
    author: post.author,
    publishedAt: new Date(post.created_utc * 1000),
  };
}

/**
 * Convert a Reddit comment to our Conversation format
 */
function commentToConversation(
  comment: RedditComment,
  postTitle?: string
): RedditConversation {
  return {
    externalId: `t1_${comment.id}`,
    source: "reddit",
    url: `${REDDIT_BASE_URL}${comment.permalink}`,
    title: postTitle || null,
    rawContent: comment.body,
    author: comment.author,
    publishedAt: new Date(comment.created_utc * 1000),
  };
}

/**
 * Search Reddit for posts matching the query and optionally fetch their comments
 * @param existingPostIds - Set of external IDs (e.g., "t3_abc123") already in DB to skip comment fetching
 */
export async function searchRedditConversations(
  options: RedditSearchOptions & {
    includeComments?: boolean;
    maxCommentsPerPost?: number;
    existingPostIds?: Set<string>;
  }
): Promise<RedditConversation[]> {
  const {
    query,
    sort = "relevance",
    timeframe = "week",
    limit = 25,
    subreddit,
    includeComments = false,
    maxCommentsPerPost = 20,
    existingPostIds = new Set(),
  } = options;

  const conversations: RedditConversation[] = [];

  try {
    // Search for posts
    const searchResult = await searchReddit(query, {
      sort,
      t: timeframe,
      limit,
      subreddit,
    });

    let newPostsCount = 0;
    let skippedPostsCount = 0;

    for (const child of searchResult.data.children) {
      if (child.kind === "t3") {
        const post = child.data as RedditPost;
        const postExternalId = `t3_${post.id}`;

        // Skip posts by deleted users or AutoModerator
        if (post.author === "[deleted]" || post.author === "AutoModerator") {
          continue;
        }

        // Check if we already have this post in DB
        const isExistingPost = existingPostIds.has(postExternalId);

        if (isExistingPost) {
          skippedPostsCount++;
          // Skip fetching comments for posts we already have
          continue;
        }

        newPostsCount++;

        // Add the post as a conversation
        conversations.push(postToConversation(post));

        // Only fetch comments for NEW posts (saves API credits!)
        if (includeComments && post.num_comments > 0) {
          try {
            const [, commentsResult] = await getPostComments(
              post.subreddit,
              post.id,
              { limit: maxCommentsPerPost }
            );

            if (commentsResult?.data?.children) {
              for (const commentChild of commentsResult.data.children) {
                if (commentChild.kind === "t1") {
                  const comment = commentChild.data as RedditComment;
                  const commentExternalId = `t1_${comment.id}`;

                  // Skip comments we already have
                  if (existingPostIds.has(commentExternalId)) {
                    continue;
                  }

                  // Skip deleted comments and AutoModerator
                  if (
                    comment.author === "[deleted]" ||
                    comment.author === "AutoModerator" ||
                    !comment.body ||
                    comment.body === "[deleted]" ||
                    comment.body === "[removed]"
                  ) {
                    continue;
                  }

                  // Only include comments with some substance
                  if (comment.body.length > 50) {
                    conversations.push(
                      commentToConversation(comment, post.title)
                    );
                  }
                }
              }
            }
          } catch (error) {
            console.error(
              `Failed to fetch comments for post ${post.id}:`,
              error
            );
            // Continue with other posts even if comment fetch fails
          }
        }
      }
    }

    console.log(
      `📊 Reddit search "${query}": ${newPostsCount} new posts, ${skippedPostsCount} skipped (already in DB)`
    );
  } catch (error) {
    console.error(`Reddit search failed for query "${query}":`, error);
    throw error;
  }

  return conversations;
}

/**
 * Filter relevant subreddits for SaaS/tech discussions
 */
export const RELEVANT_SUBREDDITS = [
  "SaaS",
  "startups",
  "Entrepreneur",
  "smallbusiness",
  "webdev",
  "programming",
  "software",
  "ProductManagement",
  "projectmanagement",
  "sysadmin",
  "devops",
  "selfhosted",
  "technology",
  "business",
  "marketing",
  "sales",
  "CustomerSuccess",
  "ITManagers",
];

