import { prisma } from "@/lib/db/prisma";
import type { Market, Report } from "@prisma/client";

export interface MarketWithLatestReport extends Market {
  latestReport: Report | null;
  signalCount: number;
  conversationCount: number;
}

/**
 * Get all markets for a user with summary data
 */
export async function getMarketsForUser(
  userId: string
): Promise<MarketWithLatestReport[]> {
  const markets = await prisma.market.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      reports: {
        orderBy: { generatedAt: "desc" },
        take: 1,
      },
      _count: {
        select: {
          signals: true,
          conversations: true,
        },
      },
    },
  });

  return markets.map((market) => ({
    ...market,
    latestReport: market.reports[0] || null,
    signalCount: market._count.signals,
    conversationCount: market._count.conversations,
    reports: undefined,
    _count: undefined,
  })) as MarketWithLatestReport[];
}

/**
 * Get a single market by ID with ownership check
 */
export async function getMarketById(
  marketId: string,
  userId: string
): Promise<MarketWithLatestReport | null> {
  const market = await prisma.market.findFirst({
    where: {
      id: marketId,
      userId,
    },
    include: {
      reports: {
        orderBy: { generatedAt: "desc" },
        take: 1,
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
      },
      _count: {
        select: {
          signals: true,
          conversations: true,
        },
      },
    },
  });

  if (!market) {
    return null;
  }

  return {
    ...market,
    latestReport: market.reports[0] || null,
    signalCount: market._count.signals,
    conversationCount: market._count.conversations,
    reports: undefined,
    _count: undefined,
  } as MarketWithLatestReport;
}

/**
 * Delete a market and all associated data
 */
export async function deleteMarket(
  marketId: string,
  userId: string
): Promise<boolean> {
  const result = await prisma.market.deleteMany({
    where: {
      id: marketId,
      userId,
    },
  });

  return result.count > 0;
}

/**
 * Archive a market (soft delete - stops processing but keeps data)
 */
export async function archiveMarket(
  marketId: string,
  userId: string
): Promise<boolean> {
  const result = await prisma.market.updateMany({
    where: {
      id: marketId,
      userId,
    },
    data: {
      status: "archived",
    },
  });

  return result.count > 0;
}

/**
 * Restore an archived market back to active
 */
export async function restoreMarket(
  marketId: string,
  userId: string
): Promise<boolean> {
  const result = await prisma.market.updateMany({
    where: {
      id: marketId,
      userId,
      status: "archived",
    },
    data: {
      status: "active",
    },
  });

  return result.count > 0;
}

