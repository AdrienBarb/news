import { inngest } from "./client";
import { prisma } from "@/lib/db/prisma";
import { searchRedditConversations } from "@/lib/connectors/reddit/search";
import {
  searchHNConversations,
  getStartDateForTimeWindow,
} from "@/lib/connectors/hn/search";
import { sanitizeContent } from "@/lib/utils/textSanitizer";
import type { SourceType } from "@prisma/client";

interface ConversationInput {
  marketId: string;
  source: SourceType;
  externalId: string;
  url: string;
  title: string | null;
  rawContent: string;
  sanitizedContent: string;
  author: string | null;
  publishedAt: Date | null;
}

interface FetchOptions {
  /** If true, fetch full history (week). If false, fetch only since last interval (8h) */
  isInitialFetch: boolean;
}

interface SensorFetchResult {
  conversations: ConversationInput[];
  error?: {
    sensorId: string;
    source: SourceType;
    message: string;
  };
}

interface ExtendedFetchOptions extends FetchOptions {
  /** Set of existing external IDs for this market to skip (saves API credits) */
  existingExternalIds?: Set<string>;
}

/**
 * Fetch conversations for a specific market sensor
 * Returns both conversations and any errors for visibility in Inngest
 */
async function fetchForSensor(
  sensor: { id: string; source: SourceType; queryText: string },
  marketId: string,
  options: ExtendedFetchOptions
): Promise<SensorFetchResult> {
  const conversations: ConversationInput[] = [];

  // For initial fetch, get full week of history. For incremental, only get last 8 hours.
  const hnTimeWindow = options.isInitialFetch ? "week" : "fetch_interval";
  const startDate = getStartDateForTimeWindow(hnTimeWindow);

  try {
    if (sensor.source === "reddit") {
      // Fetch posts and comments via ScrapingBee (handles rate limits & IP rotation)
      // Pass existing IDs to skip fetching comments for posts we already have
      const results = await searchRedditConversations({
        query: sensor.queryText,
        timeframe: options.isInitialFetch ? "week" : "day",
        limit: options.isInitialFetch ? 25 : 15,
        includeComments: true,
        maxCommentsPerPost: 10,
        existingPostIds: options.existingExternalIds,
      });

      console.log(
        `📡 Reddit sensor ${sensor.id}: fetched ${results.length} new conversations`
      );

      for (const result of results) {
        const sanitized = sanitizeContent(result.rawContent);

        if (
          sanitized.content.length < 50 ||
          sanitized.injectionCheck.detected
        ) {
          continue;
        }

        conversations.push({
          marketId,
          source: "reddit",
          externalId: result.externalId,
          url: result.url,
          title: result.title,
          rawContent: result.rawContent,
          sanitizedContent: sanitized.content,
          author: result.author,
          publishedAt: result.publishedAt,
        });
      }
    }

    if (sensor.source === "hackernews") {
      const results = await searchHNConversations({
        query: sensor.queryText,
        startDate,
        includeStories: true,
        includeComments: true,
        maxPages: options.isInitialFetch ? 5 : 2, // More pages for initial fetch
      });

      console.log(
        `📡 HackerNews sensor ${sensor.id}: fetched ${results.length} conversations`
      );

      for (const result of results) {
        const sanitized = sanitizeContent(result.rawContent);

        if (
          sanitized.content.length < 50 ||
          sanitized.injectionCheck.detected
        ) {
          continue;
        }

        conversations.push({
          marketId,
          source: "hackernews",
          externalId: result.externalId,
          url: result.url,
          title: result.title,
          rawContent: result.rawContent,
          sanitizedContent: sanitized.content,
          author: result.author,
          publishedAt: result.publishedAt,
        });
      }
    }

    return { conversations };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(
      `❌ Failed to fetch for sensor ${sensor.id} (${sensor.source}):`,
      errorMessage
    );

    // Return error info for visibility in Inngest, but don't throw
    // This allows other sensors to continue processing
    return {
      conversations,
      error: {
        sensorId: sensor.id,
        source: sensor.source,
        message: errorMessage,
      },
    };
  }
}

/**
 * Inngest function to fetch conversations for a market
 * Can be triggered manually or on a schedule
 */
export const fetchConversationsJob = inngest.createFunction(
  {
    id: "fetch-conversations",
    retries: 2,
    concurrency: {
      limit: 2, // Limit concurrent fetches to respect API rate limits
    },
  },
  { event: "market/conversations.fetch" },
  async ({ event, step }) => {
    const { marketId } = event.data;

    console.log(`\n${"=".repeat(60)}`);
    console.log(`🚀 [FETCH-CONVERSATIONS] Starting job for market: ${marketId}`);
    console.log(`${"=".repeat(60)}`);

    // Get market and its active sensors
    const market = await step.run("get-market", async () => {
      console.log(`📋 [FETCH] Loading market and sensors from database...`);
      return prisma.market.findUnique({
        where: { id: marketId },
        include: {
          sensors: {
            where: { isActive: true },
          },
        },
      });
    });

    if (!market || market.status !== "active") {
      console.log(`⚠️ [FETCH] Market not found or not active, skipping`);
      return {
        status: "skipped",
        reason: "Market not found or not active",
      };
    }

    console.log(`✅ [FETCH] Market loaded: "${market.category}" (status: ${market.status})`);
    console.log(`📡 [FETCH] Active sensors: ${market.sensors.length}`);
    market.sensors.forEach((s, i) => {
      console.log(`   ${i + 1}. [${s.source}] "${s.queryText}"`);
    });

    if (market.sensors.length === 0) {
      console.log(`⚠️ [FETCH] No active sensors, skipping`);
      return {
        status: "skipped",
        reason: "No active sensors",
      };
    }

    // Check existing conversation counts per source to determine initial fetch
    console.log(`\n📊 [FETCH] Checking existing conversation counts...`);
    const existingCounts = await step.run("check-existing-counts", async () => {
      const [hnCount, redditCount] = await Promise.all([
        prisma.conversation.count({
          where: { marketId, source: "hackernews" },
        }),
        prisma.conversation.count({
          where: { marketId, source: "reddit" },
        }),
      ]);
      return { hackernews: hnCount, reddit: redditCount };
    });
    console.log(`   - HackerNews: ${existingCounts.hackernews} existing conversations`);
    console.log(`   - Reddit: ${existingCounts.reddit} existing conversations`);

    // Get existing Reddit external IDs to skip fetching comments for posts we already have
    // This saves ScrapingBee API credits on subsequent runs!
    const existingRedditIds = await step.run(
      "get-existing-reddit-ids",
      async () => {
        const existing = await prisma.conversation.findMany({
          where: { marketId, source: "reddit" },
          select: { externalId: true },
        });
        return existing.map((c) => c.externalId);
      }
    );

    const existingRedditIdsSet = new Set(existingRedditIds);
    console.log(`💾 [FETCH] ${existingRedditIdsSet.size} existing Reddit IDs will be skipped`);

    // Fetch conversations for each sensor
    let totalFetched = 0;
    let totalNew = 0;
    const errors: Array<{ sensorId: string; source: string; message: string }> =
      [];

    console.log(`\n🔄 [FETCH] Starting to fetch from ${market.sensors.length} sensors...`);

    for (const sensor of market.sensors) {
      // Determine if this is an initial fetch for this specific source
      const isInitialFetch = existingCounts[sensor.source] === 0;

      console.log(`\n${"─".repeat(40)}`);
      console.log(`🔍 [SENSOR] Processing: [${sensor.source}] "${sensor.queryText}"`);
      console.log(`   Initial fetch: ${isInitialFetch ? "YES (full week)" : "NO (incremental)"}`);

      const result = await step.run(`fetch-sensor-${sensor.id}`, async () =>
        fetchForSensor(sensor, marketId, {
          isInitialFetch,
          existingExternalIds: existingRedditIdsSet,
        })
      );

      // Track any errors that occurred
      if (result.error) {
        console.log(`   ❌ [SENSOR] Error: ${result.error.message}`);
        errors.push(result.error);
      }

      const conversations = result.conversations;
      totalFetched += conversations.length;
      console.log(`   📥 [SENSOR] Fetched ${conversations.length} conversations`);

      if (conversations.length > 0) {
        // Upsert conversations (skip duplicates based on externalId)
        console.log(`   💾 [SENSOR] Saving conversations to database...`);
        const saveResult = await step.run(
          `save-sensor-${sensor.id}`,
          async () => {
            let inserted = 0;

            for (const conv of conversations) {
              try {
                await prisma.conversation.upsert({
                  where: {
                    source_externalId: {
                      source: conv.source,
                      externalId: conv.externalId,
                    },
                  },
                  update: {}, // Don't update existing
                  create: {
                    marketId: conv.marketId,
                    source: conv.source,
                    externalId: conv.externalId,
                    url: conv.url,
                    title: conv.title,
                    rawContent: conv.rawContent,
                    sanitizedContent: conv.sanitizedContent,
                    author: conv.author,
                    publishedAt: conv.publishedAt,
                    processingStatus: "pending",
                  },
                });
                inserted++;
              } catch (error) {
                // Unique constraint violation - conversation already exists
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
        console.log(`   ✅ [SENSOR] Saved ${saveResult} new conversations (${conversations.length - saveResult} duplicates skipped)`);
      }

      // Update sensor last fetched time
      await step.run(`update-sensor-${sensor.id}`, async () => {
        await prisma.marketSensor.update({
          where: { id: sensor.id },
          data: { lastFetchedAt: new Date() },
        });
      });
    }

    // Get pending conversations and trigger processing
    console.log(`\n${"─".repeat(40)}`);
    console.log(`📋 [FETCH] Getting pending conversations to process...`);
    const pendingConversations = await step.run(
      "get-pending-conversations",
      async () => {
        return prisma.conversation.findMany({
          where: {
            marketId,
            processingStatus: "pending",
          },
          select: { id: true },
          take: 100, // Process in batches
        });
      }
    );

    console.log(`   Found ${pendingConversations.length} pending conversations`);

    // Trigger processing for pending conversations
    if (pendingConversations.length > 0) {
      console.log(`🚀 [FETCH] Triggering process-conversation jobs for ${pendingConversations.length} conversations...`);
      await step.sendEvent(
        "trigger-processing",
        pendingConversations.map((c) => ({
          name: "conversation/process" as const,
          data: { conversationId: c.id },
        }))
      );
    }

    console.log(`\n${"=".repeat(60)}`);
    console.log(`✅ [FETCH-CONVERSATIONS] Job completed!`);
    console.log(`   📊 Summary:`);
    console.log(`   - Sensors processed: ${market.sensors.length}`);
    console.log(`   - Total fetched: ${totalFetched}`);
    console.log(`   - New conversations: ${totalNew}`);
    console.log(`   - Pending processing: ${pendingConversations.length}`);
    console.log(`   - Errors: ${errors.length}`);
    console.log(`${"=".repeat(60)}\n`);

    return {
      status: errors.length > 0 ? "completed_with_errors" : "completed",
      marketId,
      sensorsProcessed: market.sensors.length,
      totalFetched,
      totalNew,
      pendingProcessing: pendingConversations.length,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
);

/**
 * Scheduled job to fetch conversations for all active markets
 */
export const scheduledFetchConversationsJob = inngest.createFunction(
  {
    id: "scheduled-fetch-conversations",
  },
  { cron: "0 1 * * *" }, // Daily at 1 AM UTC
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

    // Trigger fetch for each market
    await step.sendEvent(
      "trigger-market-fetches",
      activeMarkets.map((m) => ({
        name: "market/conversations.fetch" as const,
        data: { marketId: m.id },
      }))
    );

    return {
      status: "completed",
      marketsTriggered: activeMarkets.length,
    };
  }
);
