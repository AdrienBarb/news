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
  // Normalize URL
  let websiteUrl = data.websiteUrl;
  if (!websiteUrl.startsWith("http://") && !websiteUrl.startsWith("https://")) {
    websiteUrl = `https://${websiteUrl}`;
  }

  // Extract domain name as default name if not provided
  let name = data.name;
  if (!name) {
    try {
      const url = new URL(websiteUrl);
      name = url.hostname.replace(/^www\./, "");
    } catch {
      name = websiteUrl;
    }
  }

  // Normalize competitor URLs
  const competitorUrls = (data.competitorUrls || []).map((url) => {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return `https://${url}`;
    }
    return url;
  });

  // Determine initial status based on whether keywords are provided
  const hasKeywords = data.keywords && data.keywords.length > 0;
  const status = hasKeywords ? "active" : "pending";

  const market = await prisma.market.create({
    data: {
      userId,
      websiteUrl,
      name,
      description: data.description || null,
      keywords: data.keywords || [],
      competitorUrls,
      status,
    },
  });

  return market;
}
