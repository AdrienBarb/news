import { inngest } from "./client";
import { prisma } from "@/lib/db/prisma";
import { generateTweetForArticle } from "@/lib/openai/generateTweet";
import { schedulePost } from "@/lib/postsyncer/client";

// Configuration - can be moved to env vars if needed
const POSTSYNCER_WORKSPACE_ID = 21425;
const POSTSYNCER_ACCOUNT_ID = 3775;
const POSTSYNCER_TIMEZONE = "Europe/Paris";

// Schedule times for the 5 tweets throughout the day
const SCHEDULE_TIMES = ["08:00", "10:00", "12:00", "14:00", "16:00"];

export const tweetPostAutomation = inngest.createFunction(
  { id: "tweet-post-automation" },
  { cron: "0 6 * * *" }, // Every day at 6:00 AM
  async ({ step }) => {
    // Fetch top 5 articles by relevance score
    const articles = await step.run("fetch-top-articles", async () => {
      return prisma.article.findMany({
        orderBy: {
          relevanceScore: "desc",
        },
        take: 5,
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
      articles.map((article, index) =>
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
    const today = new Date();
    const dateString = today.toISOString().split("T")[0];

    // Schedule each tweet at different times throughout the day
    const scheduledPosts = await Promise.all(
      tweets.map((tweet, index) =>
        step.run(`schedule-post-${tweet.articleId}`, async () => {
          const scheduleTime = SCHEDULE_TIMES[index] || SCHEDULE_TIMES[0];

          try {
            const result = await schedulePost({
              workspaceId: POSTSYNCER_WORKSPACE_ID,
              text: tweet.tweetText,
              date: dateString,
              time: scheduleTime,
              timezone: POSTSYNCER_TIMEZONE,
              accountId: POSTSYNCER_ACCOUNT_ID,
            });

            return {
              articleId: tweet.articleId,
              tweetText: tweet.tweetText,
              scheduledTime: scheduleTime,
              status: "scheduled",
              postSyncerResult: result,
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
