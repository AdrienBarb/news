import { prisma } from "@/lib/db/prisma";
import type { Market } from "@prisma/client";

export interface MarketWithLeadCount extends Market {
  leadCount: number;
  unreadLeadCount: number;
}

/**
 * Get all markets for a user with lead counts
 */
export async function getMarketsForUser(
  userId: string
): Promise<MarketWithLeadCount[]> {
  const markets = await prisma.market.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          leads: true,
        },
      },
    },
  });

  // Get unread lead counts
  const unreadCounts = await prisma.lead.groupBy({
    by: ["marketId"],
    where: {
        marketId: { in: markets.map((m) => m.id) },
      isRead: false,
      isArchived: false,
    },
    _count: true,
  });

  const unreadCountMap = new Map(
    unreadCounts.map((c) => [c.marketId, c._count])
  );

  return markets.map((market) => ({
    ...market,
    leadCount: market._count.leads,
    unreadLeadCount: unreadCountMap.get(market.id) || 0,
    _count: undefined,
  })) as MarketWithLeadCount[];
}

/**
 * Get a single market by ID with ownership check
 */
export async function getMarketById(
  marketId: string,
  userId: string
): Promise<MarketWithLeadCount | null> {
  const market = await prisma.market.findFirst({
    where: {
      id: marketId,
      userId,
    },
    include: {
      _count: {
        select: {
          leads: true,
        },
      },
    },
  });

  if (!market) {
    return null;
  }

  // Get unread lead count
  const unreadCount = await prisma.lead.count({
    where: {
        marketId,
      isRead: false,
      isArchived: false,
    },
  });

  return {
    ...market,
    leadCount: market._count.leads,
    unreadLeadCount: unreadCount,
    _count: undefined,
  } as MarketWithLeadCount;
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

/**
 * Update market keywords and description
 */
export async function updateMarketSettings(
  marketId: string,
  userId: string,
  data: { description?: string; keywords?: string[] }
): Promise<Market | null> {
  // Verify ownership first
  const market = await prisma.market.findFirst({
    where: { id: marketId, userId },
  });

  if (!market) {
    return null;
  }

  // Validate keywords limit
  if (data.keywords && data.keywords.length > 20) {
    throw new Error("Maximum 20 keywords allowed");
  }

  return prisma.market.update({
    where: { id: marketId },
    data: {
      ...(data.description !== undefined && { description: data.description }),
      ...(data.keywords !== undefined && { keywords: data.keywords }),
    },
  });
}
