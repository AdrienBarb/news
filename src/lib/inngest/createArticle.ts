import { prisma } from "../db/prisma";
import { extractArticleContent } from "@/lib/utils/articleExtractor";
import { inngest } from "./client";
import { analyzeArticleWithLLM } from "@/lib/openai/analyzeArticleLLM";

export const createArticle = inngest.createFunction(
  { id: "create-article" },
  { event: "news/article.received" },
  async ({ event, step }) => {
    const { title, description, link, publishedAt, imageUrl, source, guid } =
      event.data;

    if (guid) {
      const existingArticle = await step.run("check-duplicate", async () =>
        prisma.article.findFirst({
          where: { guid },
        })
      );

      if (existingArticle) {
        return {
          status: "skipped",
          reason: "duplicate",
          duplicateOfId: existingArticle.id,
        };
      }
    }

    const recentArticles = await step.run("fetch-recent-articles", async () => {
      return prisma.article.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { id: true, headline: true, summary: true },
      });
    });

    const extractedContent = await step.run("extract-content", async () =>
      extractArticleContent(link)
    );

    const allowedTags = await step.run("fetch-tags", async () => {
      const tags = await prisma.tag.findMany();
      return tags.map((tag) => tag.name);
    });

    const content = extractedContent || description || title;

    const llmResult = await step.run("analyze-and-dedup", async () => {
      return analyzeArticleWithLLM({
        newArticle: { title, summary: description ?? "" },
        existingArticles: recentArticles,
        fullContent: content,
        allowedTags,
      });
    });

    if (llmResult.isDuplicate) {
      return {
        status: "skipped",
        reason: "duplicate",
        duplicateOfId: llmResult.duplicateOfId,
      };
    }

    // Filter tags to only include those that exist in the database
    const validTags = llmResult.analysis.tags.filter((tagName: string) =>
      allowedTags.includes(tagName)
    );

    if (llmResult.analysis.tags.length !== validTags.length) {
      console.warn(
        `⚠️ Filtered out invalid tags. Original: ${JSON.stringify(llmResult.analysis.tags)}, Valid: ${JSON.stringify(validTags)}`
      );
    }

    const saved = await step.run("save-article", async () => {
      return prisma.article.create({
        data: {
          link,
          source,
          guid: guid,
          imageUrl,
          publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
          summary: llmResult.analysis.summary,
          headline: llmResult.analysis.headline,
          relevanceScore: llmResult.analysis.relevanceScore,
          tags: {
            connect: validTags.map((tagName: string) => ({
              name: tagName,
            })),
          },
        },
      });
    });

    return {
      status: "created",
      id: saved.id,
      tags: llmResult.analysis.tags,
      relevanceScore: llmResult.analysis.relevanceScore,
    };
  }
);
