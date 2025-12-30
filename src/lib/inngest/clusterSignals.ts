import { inngest } from "./client";
import { prisma } from "@/lib/db/prisma";
import { clusterPainStatementsForMarket } from "@/lib/services/clustering/clusterPainStatements";

/**
 * Inngest function to cluster pain statements into signals for a market
 */
export const clusterSignalsJob = inngest.createFunction(
  {
    id: "cluster-signals",
    retries: 2,
  },
  { event: "market/signals.cluster" },
  async ({ event, step }) => {
    const { marketId } = event.data;

    // Get market to verify it exists
    const market = await step.run("get-market", async () => {
      return prisma.market.findUnique({
        where: { id: marketId },
        select: { id: true, status: true },
      });
    });

    if (!market || market.status !== "active") {
      return {
        status: "skipped",
        reason: "Market not found or not active",
      };
    }

    // Run clustering
    const result = await step.run("cluster-statements", async () => {
      return clusterPainStatementsForMarket(marketId);
    });

    // If we created or updated signals, trigger report generation
    if (result.newSignals > 0 || result.updatedSignals > 0) {
      await step.sendEvent("trigger-report", {
        name: "market/report.generate",
        data: { marketId },
      });
    }

    return {
      status: "completed",
      marketId,
      ...result,
    };
  }
);

/**
 * Scheduled job to cluster signals for all active markets
 */
export const scheduledClusterSignalsJob = inngest.createFunction(
  {
    id: "scheduled-cluster-signals",
  },
  { cron: "0 2 * * *" }, // Daily at 2 AM
  async ({ step }) => {
    // Get all active markets
    const activeMarkets = await step.run("get-active-markets", async () => {
      return prisma.market.findMany({
        where: { status: "active" },
        select: { id: true },
      });
    });

    if (activeMarkets.length === 0) {
      return {
        status: "completed",
        message: "No active markets to process",
      };
    }

    // Trigger clustering for each market
    await step.sendEvent(
      "trigger-market-clustering",
      activeMarkets.map((m) => ({
        name: "market/signals.cluster" as const,
        data: { marketId: m.id },
      }))
    );

    return {
      status: "completed",
      marketsTriggered: activeMarkets.length,
    };
  }
);

