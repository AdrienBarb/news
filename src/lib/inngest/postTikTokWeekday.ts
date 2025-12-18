import { inngest } from "./client";
import { prisma } from "@/lib/db/prisma";
import { generateTikTokVideoPrompt } from "@/lib/openai/generateTikTokVideoPrompt";
import { createTikTokVideo } from "@/lib/revid/client";
import { extractArticleContent } from "@/lib/utils/articleExtractor";

// Helper function to post TikTok video
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function postTikTok(step: any, scheduleTime: string) {
  // Fetch top 1 article by relevance score
  const article = await step.run("fetch-top-article", async () => {
    return prisma.article.findFirst({
      orderBy: {
        relevanceScore: "desc",
      },
      select: {
        id: true,
        headline: true,
        summary: true,
        link: true,
        relevanceScore: true,
      },
    });
  });

  if (!article) {
    return {
      status: "no_article",
      scheduledTime: scheduleTime,
    };
  }

  // Extract full article content
  const fullContent = await step.run(
    `extract-content-${article.id}`,
    async () => {
      return extractArticleContent(article.link);
    }
  );

  // Generate TikTok video prompt for revid.ai
  const videoPromptResult = await step.run(
    `generate-video-prompt-${article.id}`,
    async () => {
      return await generateTikTokVideoPrompt({
        headline: article.headline || "",
        summary: article.summary,
        fullContent: fullContent || article.summary,
      });
    }
  );

  // Build webhook URL
  const webhookUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/revid`;

  // Create TikTok video via Revid.ai
  const revidResponse = await step.run(
    `create-revid-video-${article.id}`,
    async () => {
      try {
        const result = await createTikTokVideo({
          prompt: videoPromptResult.videoPrompt,
          webhookUrl: webhookUrl,
        });

        // Save TikTok post to database
        if (result.pid) {
          await prisma.tiktokPost.create({
            data: {
              articleId: article.id,
              pid: result.pid,
              postText: videoPromptResult.postText,
            },
          });
        }

        return {
          articleId: article.id,
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
    }
  );

  return {
    status: "completed",
    scheduledTime: scheduleTime,
    videoPrompt: videoPromptResult,
    revidResponse,
  };
}

/**
 * Posts a TikTok post at 9 CET/CEST on weekdays (Monday-Friday)
 * CET is UTC+1 (winter), CEST is UTC+2 (summer)
 * Using 7 UTC to account for summer time (CEST), will be 8 CET in winter
 */
export const postTikTokMorning = inngest.createFunction(
  { id: "post-tiktok-morning" },
  { cron: "0 7 * * 1-5" }, // Weekdays at 7 UTC (9 CEST summer, 8 CET winter)
  async ({ step }) => {
    return await postTikTok(step, "09:00");
  }
);

/**
 * Posts a TikTok post at 19 CET/CEST on weekdays (Monday-Friday)
 * CET is UTC+1 (winter), CEST is UTC+2 (summer)
 * Using 17 UTC to account for summer time (CEST), will be 18 CET in winter
 */
export const postTikTokEvening = inngest.createFunction(
  { id: "post-tiktok-evening" },
  { cron: "0 17 * * 1-5" }, // Weekdays at 17 UTC (19 CEST summer, 18 CET winter)
  async ({ step }) => {
    return await postTikTok(step, "19:00");
  }
);
