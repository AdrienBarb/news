import { inngest } from "./client";
import { deriveMarketContext } from "@/lib/services/markets/deriveContext";
import { prisma } from "@/lib/db/prisma";

/**
 * Inngest function to derive market context from a website
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

    // Check if market exists and is still pending
    const market = await step.run("check-market", async () => {
      return prisma.market.findUnique({
        where: { id: marketId },
        select: { id: true, status: true, websiteUrl: true },
      });
    });

    if (!market) {
      return {
        status: "skipped",
        reason: "Market not found",
      };
    }

    // Only process pending markets (idempotency check)
    if (market.status !== "pending") {
      return {
        status: "skipped",
        reason: `Market already ${market.status}`,
      };
    }

    // Derive context
    await step.run("derive-context", async () => {
      await deriveMarketContext(marketId);
    });

    // Get updated market info
    const updatedMarket = await step.run("get-updated-market", async () => {
      return prisma.market.findUnique({
        where: { id: marketId },
        select: {
          id: true,
          status: true,
          category: true,
          _count: {
            select: { sensors: true },
          },
        },
      });
    });

    // If market is now active, trigger initial conversation fetch
    if (updatedMarket?.status === "active") {
      await step.sendEvent("trigger-initial-fetch", {
        name: "market/conversations.fetch",
        data: { marketId },
      });
    }

    return {
      status: "completed",
      marketId,
      category: updatedMarket?.category,
      sensorCount: updatedMarket?._count.sensors || 0,
    };
  }
);

