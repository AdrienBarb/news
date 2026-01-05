import { prisma } from "@/lib/db/prisma";
import type { Market, Report } from "@prisma/client";

export interface MarketWithLatestReport extends Market {
  latestReport: Report | null;
  signalCount: number;
  conversationCount: number;
  painStatementCount: number;
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
            orderBy: [{ trend: "asc" }, { currentFrequency: "desc" }],
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

  // Count pain statements through conversations
  const painStatementCount = await prisma.painStatement.count({
    where: {
      conversation: {
        marketId,
      },
    },
  });

  return {
    ...market,
    latestReport: market.reports[0] || null,
    signalCount: market._count.signals,
    conversationCount: market._count.conversations,
    painStatementCount,
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
 * Check if user has an active market (pending, analyzing, or active)
 */
export async function hasActiveMarket(userId: string): Promise<boolean> {
  const count = await prisma.market.count({
    where: {
      userId,
      status: {
        in: ["pending", "analyzing", "active"],
      },
    },
  });

  return count > 0;
}

