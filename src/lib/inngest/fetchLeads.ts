import { inngest } from "./client";
import { prisma } from "@/lib/db/prisma";
import { searchRedditConversations } from "@/lib/connectors/reddit/search";
import { sanitizeContent } from "@/lib/utils/textSanitizer";

interface LeadInput {
  marketId: string;
  externalId: string;
  url: string;
  subreddit: string | null;
  title: string;
  content: string;
  author: string | null;
  score: number;
  numComments: number;
  publishedAt: Date | null;
}

/**
 * Fetch leads from Reddit for a specific keyword
 */
async function fetchForKeyword(
  keyword: string,
  marketId: string,
  existingIds: Set<string>,
  isInitialFetch: boolean
): Promise<{ leads: LeadInput[]; error?: string }> {
  const leads: LeadInput[] = [];

  try {
    const results = await searchRedditConversations({
      query: keyword,
      timeframe: isInitialFetch ? "week" : "day",
      limit: isInitialFetch ? 25 : 15,
      includeComments: false, // Only get posts, not comments
      existingPostIds: existingIds,
    });

    console.log(`📡 Keyword "${keyword}": fetched ${results.length} posts`);

    for (const result of results) {
      const sanitized = sanitizeContent(result.rawContent);

      // Skip very short content or detected injection attempts
      if (sanitized.content.length < 30 || sanitized.injectionCheck.detected) {
        continue;
      }

      // Extract subreddit from URL
      const subredditMatch = result.url.match(/\/r\/([^/]+)/);
      const subreddit = subredditMatch ? subredditMatch[1] : null;

      leads.push({
        marketId,
        externalId: result.externalId,
        url: result.url,
        subreddit,
        title: result.title || "",
        content: sanitized.content,
        author: result.author,
        score: 0, // Will be enriched later if needed
        numComments: 0,
        publishedAt: result.publishedAt,
      });
    }

    return { leads };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ Failed to fetch for keyword "${keyword}":`, errorMessage);
    return { leads, error: errorMessage };
  }
}

/**
 * Inngest function to fetch leads for a market
 * Searches Reddit using the market's keywords
 */
export const fetchLeadsJob = inngest.createFunction(
  {
    id: "fetch-leads",
    retries: 2,
    concurrency: {
      limit: 2, // Limit concurrent fetches to respect API rate limits
    },
  },
  { event: "market/leads.fetch" },
  async ({ event, step }) => {
    const { marketId } = event.data;

    // Get market with keywords
    const market = await step.run("get-market", async () => {
      return prisma.market.findUnique({
        where: { id: marketId },
        select: {
          id: true,
          status: true,
          keywords: true,
          name: true,
        },
      });
    });

    if (!market || market.status !== "active") {
      return {
        status: "skipped",
        reason: "Market not found or not active",
      };
    }

    if (!market.keywords || market.keywords.length === 0) {
      return {
        status: "skipped",
        reason: "No keywords configured",
      };
    }

    // Check if this is initial fetch (no existing leads)
    const existingCount = await step.run("check-existing-count", async () => {
      return prisma.lead.count({ where: { marketId } });
    });

    const isInitialFetch = existingCount === 0;

    // Get existing lead IDs to avoid duplicates
    const existingIds = await step.run("get-existing-ids", async () => {
      const existing = await prisma.lead.findMany({
        where: { marketId },
        select: { externalId: true },
      });
      return existing.map((l) => l.externalId);
    });

    const existingIdsSet = new Set(existingIds);
    console.log(
      `💾 Market "${market.name}": ${existingIdsSet.size} existing leads in DB`
    );

    // Fetch leads for each keyword
    let totalFetched = 0;
    let totalNew = 0;
    const errors: string[] = [];

    for (const keyword of market.keywords) {
      const result = await step.run(
        `fetch-keyword-${keyword.slice(0, 20)}`,
        async () =>
          fetchForKeyword(keyword, marketId, existingIdsSet, isInitialFetch)
      );

      if (result.error) {
        errors.push(`${keyword}: ${result.error}`);
      }

      totalFetched += result.leads.length;

      if (result.leads.length > 0) {
        // Save leads (skip duplicates)
        const saveResult = await step.run(
          `save-keyword-${keyword.slice(0, 20)}`,
          async () => {
            let inserted = 0;

            for (const lead of result.leads) {
              try {
                await prisma.lead.upsert({
                  where: {
                    source_externalId: {
                      source: "reddit",
                      externalId: lead.externalId,
                    },
                  },
                  update: {}, // Don't update existing
                  create: {
                    marketId: lead.marketId,
                    source: "reddit",
                    externalId: lead.externalId,
                    url: lead.url,
                    subreddit: lead.subreddit,
                    title: lead.title,
                    content: lead.content,
                    author: lead.author,
                    score: lead.score,
                    numComments: lead.numComments,
                    publishedAt: lead.publishedAt,
                  },
                });
                inserted++;
              } catch (error) {
                // Unique constraint violation - lead already exists
                if (
                  error instanceof Error &&
                  error.message.includes("Unique constraint")
                ) {
                  continue;
                }
                throw error;
              }
            }

            return inserted;
          }
        );

        totalNew += saveResult;
      }
    }

    return {
      status: errors.length > 0 ? "completed_with_errors" : "completed",
      marketId,
      keywordsProcessed: market.keywords.length,
      totalFetched,
      totalNew,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
);

/**
 * Scheduled job to fetch leads for all active markets
 * Runs daily at 1 AM UTC
 */
export const scheduledFetchLeadsJob = inngest.createFunction(
  {
    id: "scheduled-fetch-leads",
  },
  { cron: "0 1 * * *" }, // Daily at 1 AM UTC
  async ({ step }) => {
    // Get all active markets
    const activeMarkets = await step.run("get-active-markets", async () => {
      return prisma.market.findMany({
        where: { status: "active" },
        select: { id: true, name: true },
      });
    });

    if (activeMarkets.length === 0) {
      return {
        status: "completed",
        message: "No active markets to process",
      };
    }

    console.log(`🚀 Triggering lead fetch for ${activeMarkets.length} markets`);

    // Trigger fetch for each market
    await step.sendEvent(
      "trigger-market-fetches",
      activeMarkets.map((m) => ({
        name: "market/leads.fetch" as const,
        data: { marketId: m.id },
      }))
    );

    return {
      status: "completed",
      marketsTriggered: activeMarkets.length,
    };
  }
);
