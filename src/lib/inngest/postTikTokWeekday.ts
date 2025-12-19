import { inngest } from "./client";
import { prisma } from "@/lib/db/prisma";
import { generateTikTokVideoPrompt } from "@/lib/openai/generateTikTokVideoPrompt";
import { createTikTokVideo } from "@/lib/revid/client";
import { extractArticleContent } from "@/lib/utils/articleExtractor";
import { TIKTOK_SCHEDULE_TIMES } from "@/lib/constants/postSyncer";

/**
 * Posts TikTok videos at scheduled times throughout the day
 * Runs on weekdays (Monday-Friday) at 6:00 AM to prepare 2 videos
 * Videos are scheduled for 9:00 AM and 7:00 PM
 */
export const postTikTokAutomation = inngest.createFunction(
  { id: "post-tiktok-automation" },
  { cron: "0 6 * * 1-5" }, // Weekdays (Monday-Friday) at 6:00 AM
  async ({ step }) => {
    // Fetch top 2 articles by relevance score
    const articles = await step.run("fetch-top-articles", async () => {
      return prisma.article.findMany({
        orderBy: {
          relevanceScore: "desc",
        },
        take: 2,
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
        videos: [],
      };
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const dateString = today.toISOString().split("T")[0];

    // Build webhook URL
    const webhookUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/revid`;

    // Process each article to create TikTok videos
    const videos = await Promise.all(
      articles.map((article, index) =>
        step.run(`process-article-${article.id}`, async () => {
          // Extract full article content
          const fullContent = await extractArticleContent(article.link);

          // Generate TikTok video prompt for revid.ai
          const videoPromptResult = await generateTikTokVideoPrompt({
            headline: article.headline || "",
            summary: article.summary,
            fullContent: fullContent || article.summary,
          });

          // Create TikTok video via Revid.ai
          try {
            const result = await createTikTokVideo({
              prompt: videoPromptResult.videoPrompt,
              webhookUrl: webhookUrl,
            });

            // Save TikTok post to database with scheduled time
            const scheduleTime =
              TIKTOK_SCHEDULE_TIMES[index] || TIKTOK_SCHEDULE_TIMES[0];
            if (result.pid) {
              await prisma.tiktokPost.create({
                data: {
                  articleId: article.id,
                  pid: result.pid,
                  postText: videoPromptResult.postText,
                  scheduledDate: dateString,
                  scheduledTime: scheduleTime,
                },
              });
            }

            return {
              articleId: article.id,
              pid: result.pid,
              scheduledTime: scheduleTime,
              status: "video_creation_started",
              revidResponse: result,
            };
          } catch (error) {
            return {
              articleId: article.id,
              status: "error",
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        })
      )
    );

    return {
      status: "completed",
      count: videos.length,
      videos,
    };
  }
);
