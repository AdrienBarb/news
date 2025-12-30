import { prisma } from "@/lib/db/prisma";
import type { CreateMarketInput } from "@/lib/schemas/markets/createMarketSchema";
import type { Market } from "@prisma/client";

interface CreateMarketParams {
  userId: string;
  data: CreateMarketInput;
}

/**
 * Create a new market for a user
 */
export async function createMarket({
  userId,
  data,
}: CreateMarketParams): Promise<Market> {
  // Extract domain name as default name if not provided
  let name = data.name;
  if (!name) {
    try {
      const url = new URL(data.websiteUrl);
      name = url.hostname.replace(/^www\./, "");
    } catch {
      name = data.websiteUrl;
    }
  }

  const market = await prisma.market.create({
    data: {
      userId,
      websiteUrl: data.websiteUrl,
      name,
      status: "pending",
    },
  });

  return market;
}

