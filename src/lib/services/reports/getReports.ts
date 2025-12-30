import { prisma } from "@/lib/db/prisma";
import type { Report, ReportSignal, Signal } from "@prisma/client";

export interface ReportWithSignals extends Report {
  reportSignals: Array<
    ReportSignal & {
      signal: Pick<Signal, "id" | "title" | "painType" | "description">;
    }
  >;
}

/**
 * Get all reports for a market
 */
export async function getReportsForMarket(
  marketId: string,
  options: {
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ reports: ReportWithSignals[]; total: number }> {
  const { limit = 20, offset = 0 } = options;

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where: { marketId },
      orderBy: { generatedAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        reportSignals: {
          orderBy: [
            { trend: "asc" }, // new first, then rising, stable, fading
            { currentFrequency: "desc" },
          ],
          include: {
            signal: {
              select: {
                id: true,
                title: true,
                painType: true,
                description: true,
              },
            },
          },
        },
      },
    }),
    prisma.report.count({ where: { marketId } }),
  ]);

  return { reports: reports as ReportWithSignals[], total };
}

/**
 * Get the latest report for a market
 */
export async function getLatestReport(
  marketId: string
): Promise<ReportWithSignals | null> {
  const report = await prisma.report.findFirst({
    where: { marketId },
    orderBy: { generatedAt: "desc" },
    include: {
      reportSignals: {
        orderBy: [
          { trend: "asc" },
          { currentFrequency: "desc" },
        ],
        include: {
          signal: {
            select: {
              id: true,
              title: true,
              painType: true,
              description: true,
            },
          },
        },
      },
    },
  });

  return report as ReportWithSignals | null;
}

/**
 * Get a single report by ID
 */
export async function getReportById(
  reportId: string,
  userId: string
): Promise<ReportWithSignals | null> {
  const report = await prisma.report.findFirst({
    where: {
      id: reportId,
      market: {
        userId,
      },
    },
    include: {
      reportSignals: {
        orderBy: [
          { trend: "asc" },
          { currentFrequency: "desc" },
        ],
        include: {
          signal: {
            select: {
              id: true,
              title: true,
              painType: true,
              description: true,
            },
          },
        },
      },
    },
  });

  return report as ReportWithSignals | null;
}

