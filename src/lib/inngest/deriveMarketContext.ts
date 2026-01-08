import { inngest } from "./client";
import { analyzeWebsite } from "@/lib/services/markets/analyzeWebsite";
import { prisma } from "@/lib/db/prisma";

/**
 * Inngest function to analyze a website and derive keywords
 * Triggered when a new market is created
 */
export const deriveMarketContextJob = inngest.createFunction(
  {
    id: "derive-market-context",
    retries: 2,
  },
  { event: "market/context.derive" },
  async ({ event, step }) => {
    const { marketId } = event.data;

    // Check if market exists and is still pending/analyzing
    const market = await step.run("check-market", async () => {
      return prisma.market.findUnique({
        where: { id: marketId },
        select: { id: true, status: true, websiteUrl: true, name: true },
      });
    });

    if (!market) {
      return {
        status: "skipped",
        reason: "Market not found",
      };
    }

    // Only process pending or analyzing markets
    if (market.status !== "pending" && market.status !== "analyzing") {
      return {
        status: "skipped",
        reason: `Market already ${market.status}`,
      };
    }

    // Update status to analyzing
    await step.run("set-analyzing", async () => {
      await prisma.market.update({
        where: { id: marketId },
        data: { status: "analyzing" },
      });
    });

    // Analyze website to extract description and keywords
    const result = await step.run("analyze-website", async () => {
      return analyzeWebsite(market.websiteUrl);
    });

    if (!result.success) {
      // Mark market as error
      await step.run("set-error", async () => {
        await prisma.market.update({
          where: { id: marketId },
          data: { status: "error" },
        });
      });

      return {
        status: "error",
        marketId,
        error: result.error,
      };
    }

    // Update market with extracted data
    await step.run("update-market", async () => {
      await prisma.market.update({
        where: { id: marketId },
        data: {
          description: result.data.description,
          keywords: result.data.keywords.slice(0, 20), // Max 20 keywords
          status: "active",
        },
      });
    });

    // Trigger initial lead fetch
    // await step.sendEvent("trigger-initial-fetch", {
    //   name: "market/leads.fetch",
    //   data: { marketId },
    // });

    return {
      status: "completed",
      marketId,
      description: result.data.description,
      keywordsCount: result.data.keywords.length,
    };
  }
);
