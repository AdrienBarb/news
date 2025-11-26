import { prisma } from "../db/prisma";
import { extractArticleContent } from "@/lib/utils/articleExtractor";
import { inngest } from "./client";
import { analyzeArticleWithLLM } from "@/lib/openai/analyzeArticleLLM";

export const createArticle = inngest.createFunction(
  { id: "create-article" },
  { event: "news/article.received" },
  async ({ event, step }) => {
    const { title, description, link, publishedAt, source, guid } = event.data;

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
        select: { id: true, title: true, summary: true },
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

    const saved = await step.run("save-article", async () => {
      return prisma.article.create({
        data: {
          title,
          description,
          content,
          link,
          source,
          guid: guid,
          publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
          summary: llmResult.analysis.summary,
          shortSummary: llmResult.analysis.shortSummary,
          relevanceScore: llmResult.analysis.relevanceScore,
          tags: llmResult.analysis.tags,
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
