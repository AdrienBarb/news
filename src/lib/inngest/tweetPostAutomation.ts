import { inngest } from "./client";
import { prisma } from "@/lib/db/prisma";
import { generateTweetForArticle } from "@/lib/openai/generateTweet";
import { schedulePost } from "@/lib/postsyncer/client";
import {
  TWEET_SCHEDULE_TIMES,
  POSTSYNCER_WORKSPACE_ID,
  POSTSYNCER_TIMEZONE,
  POSTSYNCER_TWEET_ACCOUNT_ID,
  POSTSYNCER_THREADS_ACCOUNT_ID,
} from "@/lib/constants/postSyncer";

export const tweetPostAutomation = inngest.createFunction(
  { id: "tweet-post-automation" },
  { cron: "0 2 * * *" }, // Every day at 2:00 AM
  async ({ step }) => {
    // Fetch top 9 articles by relevance score
    const articles = await step.run("fetch-top-articles", async () => {
      return prisma.article.findMany({
        orderBy: {
          relevanceScore: "desc",
        },
        take: 9,
        select: {
          id: true,
          headline: true,
          summary: true,
          link: true,
          relevanceScore: true,
        },
      });
    });

    if (articles.length === 0) {
      return {
        status: "no_articles",
        count: 0,
        tweets: [],
      };
    }

    // Generate tweets for each article
    const tweets = await Promise.all(
      articles.map((article) =>
        step.run(`generate-tweet-${article.id}`, async () => {
          const tweetText = await generateTweetForArticle({
            headline: article.headline || "",
            summary: article.summary,
            link: article.link,
          });

          return {
            articleId: article.id,
            articleHeadline: article.headline,
            articleLink: article.link,
            tweetText,
            relevanceScore: article.relevanceScore,
          };
        })
      )
    );

    // Get today's date in YYYY-MM-DD format
    // Since we run at 2:00 AM, we schedule tweets for today starting at 3:00
    const today = new Date();
    const dateString = today.toISOString().split("T")[0];

    // Schedule each tweet at different times throughout the day
    const scheduledPosts = await Promise.all(
      tweets.map((tweet, index) =>
        step.run(`schedule-post-${tweet.articleId}`, async () => {
          const scheduleTime =
            TWEET_SCHEDULE_TIMES[index] || TWEET_SCHEDULE_TIMES[0];

          try {
            const tweetResult = await schedulePost({
              workspaceId: POSTSYNCER_WORKSPACE_ID,
              text: tweet.tweetText,
              date: dateString,
              time: scheduleTime,
              timezone: POSTSYNCER_TIMEZONE,
              accountId: POSTSYNCER_TWEET_ACCOUNT_ID,
            });

            const threadsResult = await schedulePost({
              workspaceId: POSTSYNCER_WORKSPACE_ID,
              text: tweet.tweetText,
              date: dateString,
              time: scheduleTime,
              timezone: POSTSYNCER_TIMEZONE,
              accountId: POSTSYNCER_THREADS_ACCOUNT_ID,
            });

            return {
              articleId: tweet.articleId,
              tweetText: tweet.tweetText,
              scheduledTime: scheduleTime,
              status: "scheduled",
              postSyncerTweetResult: tweetResult,
              postSyncerThreadsResult: threadsResult,
            };
          } catch (error) {
            return {
              articleId: tweet.articleId,
              tweetText: tweet.tweetText,
              scheduledTime: scheduleTime,
              status: "error",
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        })
      )
    );

    return {
      status: "completed",
      count: tweets.length,
      tweets,
      scheduledPosts,
    };
  }
);
