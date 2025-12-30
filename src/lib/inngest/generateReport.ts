import { inngest } from "./client";
import { prisma } from "@/lib/db/prisma";
import { generateReportForMarket } from "@/lib/services/reports/generateReport";

/**
 * Inngest function to generate a report for a market
 */
export const generateReportJob = inngest.createFunction(
  {
    id: "generate-report",
    retries: 2,
  },
  { event: "market/report.generate" },
  async ({ event, step }) => {
    const { marketId } = event.data;

    // Get market to verify it exists
    const market = await step.run("get-market", async () => {
      return prisma.market.findUnique({
        where: { id: marketId },
        select: { id: true, status: true, name: true },
      });
    });

    if (!market || market.status !== "active") {
      return {
        status: "skipped",
        reason: "Market not found or not active",
      };
    }

    // Generate report
    const result = await step.run("generate-report", async () => {
      return generateReportForMarket(marketId);
    });

    return {
      status: "completed",
      marketId,
      marketName: market.name,
      reportId: result.reportId,
      signalCount: result.signalCount,
    };
  }
);

/**
 * Scheduled job to generate reports for all active markets
 */
export const scheduledGenerateReportJob = inngest.createFunction(
  {
    id: "scheduled-generate-report",
  },
  { cron: "0 3 * * *" }, // Daily at 3 AM (after clustering at 2 AM)
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

    // Trigger report generation for each market
    await step.sendEvent(
      "trigger-market-reports",
      activeMarkets.map((m) => ({
        name: "market/report.generate" as const,
        data: { marketId: m.id },
      }))
    );

    return {
      status: "completed",
      marketsTriggered: activeMarkets.length,
    };
  }
);

