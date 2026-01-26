import { inngest } from "./client";
import { prisma } from "@/lib/db/prisma";
import { scrapeRedditSearch } from "@/lib/connectors/reddit/client";
import { sanitizeContent } from "@/lib/utils/textSanitizer";
import { getTimeWindowConfig } from "@/lib/constants/timeWindow";
import { getLeadTierConfig } from "@/lib/constants/leadTiers";
import { openai } from "@/lib/openai/client";
import { resendClient } from "@/lib/resend/resendClient";
import { LeadsReadyEmail } from "@/lib/emails/LeadsReadyEmail";
import type { IntentType } from "@prisma/client";
import type { TimeWindow } from "@/lib/constants/timeWindow";
import config from "../config";

const APP_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://prediqte.com";
const REDDIT_BASE_URL = "https://www.reddit.com";

const BATCH_SIZE = 10;
const MIN_RELEVANCE_SCORE = 60;

// Subreddits that are almost always irrelevant noise
const BLOCKLIST_SUBREDDITS = new Set([
  "funny",
  "pics",
  "memes",
  "dankmemes",
  "gaming",
  "aww",
  "todayilearned",
  "askreddit",
  "worldnews",
  "news",
  "politics",
  "videos",
  "movies",
  "television",
  "music",
  "sports",
  "nfl",
  "nba",
  "soccer",
  "art",
  "food",
  "recipes",
  "cooking",
  "fitness",
  "bodybuilding",
  "loseit",
  "relationships",
  "relationship_advice",
  "tifu",
  "amitheasshole",
  "unpopularopinion",
  "showerthoughts",
  "lifeprotips",
  "personalfinance",
  "wallstreetbets",
  "cryptocurrency",
  "bitcoin",
  "dogecoin",
  "anime",
  "manga",
  "games",
  "leagueoflegends",
  "fortnite",
  "minecraft",
  "valorant",
  "apexlegends",
  "cats",
  "dogs",
  "wholesomememes",
  "teenagers",
  "college",
  "looksmaxxing",
]);

function shouldSkipSubreddit(subreddit: string | null): boolean {
  if (!subreddit) return false;
  return BLOCKLIST_SUBREDDITS.has(subreddit.toLowerCase());
}

interface LeadInput {
  agentId: string;
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

interface LeadAnalysis {
  externalId: string;
  intent: IntentType;
  relevance: number;
  reason: string;
}

interface AnalysisResponse {
  leads: LeadAnalysis[];
}

/**
 * Fetch leads from Reddit for a specific keyword
 */
async function fetchForKeyword(
  keyword: string,
  agentId: string,
  timeWindow: TimeWindow,
  existingIds: Set<string>
): Promise<{ leads: LeadInput[]; error?: string }> {
  const leads: LeadInput[] = [];
  const seenIds = new Set<string>();
  const config = getTimeWindowConfig(timeWindow);

  console.log(`\n🔍 [FETCH] Keyword: "${keyword}"`);
  console.log(
    `   └── Time window: ${config.label} (${config.maxAgeDays} days)`
  );
  console.log(`   └── Limit per keyword: ${config.limitPerKeyword}`);

  try {
    const posts = await scrapeRedditSearch(keyword, {
      sort: "relevance",
      t: config.apifyTime,
      limit: config.limitPerKeyword,
      maxAgeDays: config.maxAgeDays,
    });

    console.log(`   📥 Received ${posts.length} posts from scraper`);

    for (const post of posts) {
      const postExternalId = `t3_${post.id}`;

      // Skip if already in DB or already seen in this batch
      if (existingIds.has(postExternalId) || seenIds.has(postExternalId)) {
        continue;
      }

      // Skip deleted users or AutoModerator
      if (post.author === "[deleted]" || post.author === "AutoModerator") {
        continue;
      }

      // Skip posts from blocklisted subreddits
      if (shouldSkipSubreddit(post.subreddit)) {
        continue;
      }

      seenIds.add(postExternalId);

      const contentToSanitize = post.selftext || post.title;
      const sanitized = sanitizeContent(contentToSanitize);

      // Skip very short content or detected injection attempts
      if (sanitized.content.length < 10 || sanitized.injectionCheck.detected) {
        continue;
      }

      const publishedAt =
        post.created_utc > 0 ? new Date(post.created_utc * 1000) : null;

      leads.push({
        agentId,
        externalId: postExternalId,
        url: post.url || `${REDDIT_BASE_URL}${post.permalink}`,
        subreddit: post.subreddit,
        title: post.title,
        content: sanitized.content,
        author: post.author,
        score: post.score || 0,
        numComments: post.num_comments || 0,
        publishedAt,
      });
    }

    console.log(`   ✅ Total new leads for "${keyword}": ${leads.length}`);
    return { leads };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(
      `   ❌ Failed to fetch for keyword "${keyword}":`,
      errorMessage
    );
    return { leads, error: errorMessage };
  }
}

/**
 * Analyze a batch of leads using OpenAI
 */
async function analyzeLeadsBatch(
  leads: {
    id: string;
    externalId: string;
    title: string;
    content: string;
    subreddit: string | null;
  }[],
  context: {
    description: string;
    keywords: string[];
    websiteUrl: string;
  }
): Promise<LeadAnalysis[]> {
  const leadsInfo = leads.map((lead, index) => ({
    index: index + 1,
    externalId: lead.externalId,
    subreddit: lead.subreddit || "unknown",
    title: lead.title,
    content: lead.content.slice(0, 800),
  }));

  const prompt = `You are a B2B sales expert identifying BUYERS, not just people talking about a topic.

## THE PRODUCT
**${context.websiteUrl}**: ${context.description}

## YOUR MISSION
Find people who are ACTIVELY SEEKING a solution. We want BUYERS, not observers.

## 🎯 HIGH-INTENT SIGNALS (Score 80-100)
These are READY TO BUY:
- "What tool do you recommend for [problem]?"
- "I need a solution for [problem], any suggestions?"
- "Looking for alternatives to [competitor]"
- "Can anyone recommend a [product category]?"
- "What's the best [product category] for [use case]?"
- "Thinking of switching from [competitor], thoughts?"
- "Has anyone tried [competitor]? Looking for options"
- Asking for comparisons between tools in this category

## ⚠️ MEDIUM-INTENT SIGNALS (Score 60-79)
These MIGHT become buyers:
- Complaining about a problem this product solves
- Frustrated with a competitor's limitations
- Discussing the challenge without asking for help yet
- "How do you handle [problem]?" (implicit need)

## ❌ NOT A LEAD - SCORE BELOW 40
REJECT these immediately:
- Just discussing the industry/topic in general
- Sharing news, articles, or links
- Promoting their own product/content
- Educational posts or tutorials (they're teaching, not buying)
- "I built/created [something]" posts
- Already using a solution and happy with it
- The post is about a DIFFERENT problem
- Asking technical questions unrelated to finding a tool
- Sharing experiences without seeking recommendations
- Generic discussions that happen to contain a keyword
- Memes, jokes, or entertainment posts

## CRITICAL RULES
1. The person must have a PROBLEM they want to SOLVE
2. They must be OPEN to new solutions (asking or complaining)
3. Generic discussion = NOT a lead
4. Already solved = NOT a lead
5. Just curious = NOT a lead
6. Teaching others = NOT a lead
7. Keyword match is NOT enough - they must WANT a solution

## INTENT TYPES
- **recommendation**: Actively asking "what should I use?"
- **alternative**: Looking for alternatives to a specific tool
- **comparison**: Comparing multiple solutions
- **complaint**: Frustrated with current solution (might switch)
- **question**: Has the problem but hasn't asked for tools yet

## POSTS TO ANALYZE
${JSON.stringify(leadsInfo, null, 2)}

## OUTPUT FORMAT
Return JSON:
{
  "leads": [
    {
      "externalId": "t3_xxx",
      "intent": "recommendation|alternative|comparison|complaint|question",
      "relevance": 0-100,
      "reason": "One sentence: why they ARE or ARE NOT a potential buyer"
    }
  ]
}

Remember: QUALITY over QUANTITY. 5 perfect leads > 50 random posts. Be extremely selective.`;

  console.log(`   🤖 Sending ${leads.length} leads to OpenAI for analysis...`);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.1,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are a B2B sales qualification expert. Your job is to find BUYERS - people actively looking for a solution. 90% of posts are NOT leads. Only people asking for recommendations, comparing tools, or frustrated with competitors are leads. Be ruthless - we want quality, not quantity.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  const parsed = JSON.parse(content) as AnalysisResponse;
  console.log(`   ✅ Received analysis for ${parsed.leads.length} leads`);

  const highIntent = parsed.leads.filter((l) => l.relevance >= 80).length;
  const mediumIntent = parsed.leads.filter(
    (l) => l.relevance >= 60 && l.relevance < 80
  ).length;
  const lowIntent = parsed.leads.filter((l) => l.relevance < 60).length;
  console.log(
    `   📊 Scores: ${highIntent} high (80+), ${mediumIntent} medium (60-79), ${lowIntent} low (<60)`
  );

  return parsed.leads;
}

/**
 * Inngest function to analyze a batch of leads using OpenAI
 * This is invoked in parallel by runAgentJob for faster analysis
 */
export const analyzeLeadsBatchJob = inngest.createFunction(
  {
    id: "analyze-leads-batch",
    retries: 2,
    // Conservative limit to respect OpenAI rate limits
    // Tier 1: 500 RPM, Tier 2: 5000 RPM - adjust based on your tier
    concurrency: {
      limit: 10,
    },
  },
  { event: "agent/analyze-batch" },
  async ({ event, step }) => {
    const { batchLeadIds, context, agentId } = event.data as {
      batchLeadIds: string[];
      context: {
        description: string;
        keywords: string[];
        websiteUrl: string;
      };
      agentId: string;
    };

    const result = await step.run("analyze", async () => {
      // Fetch full lead data for this batch
      const batch = await prisma.lead.findMany({
        where: { id: { in: batchLeadIds } },
        select: {
          id: true,
          externalId: true,
          title: true,
          content: true,
          subreddit: true,
        },
      });

      if (batch.length === 0) {
        return { kept: 0, deleted: 0 };
      }

      // Analyze with LLM
      const analyses = await analyzeLeadsBatch(batch, context);

      let kept = 0;
      let deleted = 0;

      // Batch the database operations for efficiency
      const leadsToUpdate: {
        id: string;
        intent: IntentType;
        relevance: number;
        reason: string;
      }[] = [];
      const leadsToDelete: string[] = [];

      for (const analysis of analyses) {
        const lead = batch.find((l) => l.externalId === analysis.externalId);
        if (!lead) continue;

        if (analysis.relevance >= MIN_RELEVANCE_SCORE) {
          leadsToUpdate.push({
            id: lead.id,
            intent: analysis.intent,
            relevance: analysis.relevance,
            reason: analysis.reason,
          });
          kept++;
        } else {
          leadsToDelete.push(lead.id);
          deleted++;
        }
      }

      // Batch update leads to keep
      await Promise.all(
        leadsToUpdate.map((lead) =>
          prisma.lead.update({
            where: { id: lead.id },
            data: {
              intent: lead.intent,
              relevance: lead.relevance,
              relevanceReason: lead.reason,
            },
          })
        )
      );

      // Batch delete low-relevance leads
      if (leadsToDelete.length > 0) {
        await prisma.lead.deleteMany({
          where: { id: { in: leadsToDelete } },
        });
      }

      return { kept, deleted };
    });

    return result;
  }
);

/**
 * Inngest function to fetch leads for a single keyword
 * This is invoked in parallel by runAgentJob for true concurrency
 */
export const fetchKeywordJob = inngest.createFunction(
  {
    id: "fetch-keyword",
    retries: 2,
    // Concurrency limit controls how many keyword fetches run in parallel across ALL users
    // Set slightly below Apify limit (32) to leave buffer for other potential Apify usage
    concurrency: {
      limit: 28,
    },
  },
  { event: "agent/fetch-keyword" },
  async ({ event, step }) => {
    const { keyword, agentId, timeWindow, existingIds } = event.data as {
      keyword: string;
      agentId: string;
      timeWindow: TimeWindow;
      existingIds: string[];
    };

    const existingIdsSet = new Set(existingIds);

    const result = await step.run("fetch", async () => {
      return fetchForKeyword(keyword, agentId, timeWindow, existingIdsSet);
    });

    return { keyword, ...result };
  }
);

/**
 * Inngest function to run an AI agent
 * Fetches leads from Reddit and analyzes them with AI
 */
export const runAgentJob = inngest.createFunction(
  {
    id: "run-agent",
    retries: 2,
    concurrency: {
      limit: 2,
    },
  },
  { event: "agent/run" },
  async ({ event, step }) => {
    const { agentId } = event.data;

    console.log(`\n${"=".repeat(60)}`);
    console.log(`🚀 [RUN AGENT JOB] Starting for agent: ${agentId}`);
    console.log(`${"=".repeat(60)}`);

    // Get agent config
    const agent = await step.run("get-agent", async () => {
      return prisma.aiAgent.findUnique({
        where: { id: agentId },
        select: {
          id: true,
          websiteUrl: true,
          description: true,
          keywords: true,
          competitors: true,
          platform: true,
          leadTier: true,
          leadsIncluded: true,
          timeWindow: true, // Keep for backward compatibility
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      });
    });

    if (!agent) {
      console.log(`❌ Agent not found: ${agentId}`);
      return { status: "failed", reason: "Agent not found" };
    }

    const allKeywords = [...agent.keywords, ...agent.competitors];

    // Determine if this is a new agent (with leadTier) or legacy (with timeWindow)
    const isNewAgent = agent.leadTier !== null && agent.leadsIncluded !== null;

    console.log(`📊 Agent config:`);
    console.log(`   └── Website: ${agent.websiteUrl}`);
    console.log(`   └── Keywords: ${agent.keywords.length}`);
    console.log(`   └── Competitors: ${agent.competitors.length}`);

    if (isNewAgent) {
      console.log(`   └── Platform: ${agent.platform}`);
      console.log(`   └── Lead Tier: ${agent.leadTier}`);
      console.log(`   └── Leads Included: ${agent.leadsIncluded}`);
    } else {
      console.log(`   └── Time window: ${agent.timeWindow} (LEGACY)`);
    }

    if (allKeywords.length === 0) {
      console.log(`❌ No keywords configured for agent`);
      await step.run("set-failed-status", async () => {
        await prisma.aiAgent.update({
          where: { id: agentId },
          data: { status: "FAILED" },
        });
      });
      return { status: "failed", reason: "No keywords configured" };
    }

    // Update status to FETCHING_LEADS
    await step.run("set-fetching-status", async () => {
      await prisma.aiAgent.update({
        where: { id: agentId },
        data: { status: "FETCHING_LEADS", startedAt: new Date() },
      });
      console.log(`📝 Agent status updated to: FETCHING_LEADS`);
    });

    // Get existing lead IDs to avoid duplicates
    const existingIds = await step.run("get-existing-ids", async () => {
      const existing = await prisma.lead.findMany({
        where: { agentId },
        select: { externalId: true },
      });
      return existing.map((l) => l.externalId);
    });

    const existingIdsSet = new Set(existingIds);

    // Determine search parameters
    let searchTimeWindow: TimeWindow;
    let searchMaxAgeDays: number;
    let searchLimit: number;

    if (isNewAgent && agent.leadTier) {
      // New agent: use lead tier config
      const tierConfig = getLeadTierConfig(agent.leadTier);
      searchMaxAgeDays = tierConfig.maxAgeDays;
      // Calculate posts per keyword based on total leads needed and keyword count
      // Fetch 3x more to ensure we get enough after filtering
      const targetTotal = agent.leadsIncluded! * 3;
      searchLimit = Math.ceil(targetTotal / allKeywords.length);
      // Map to a time window for the scraper
      searchTimeWindow =
        searchMaxAgeDays <= 7
          ? "LAST_7_DAYS"
          : searchMaxAgeDays <= 30
            ? "LAST_30_DAYS"
            : "LAST_365_DAYS";

      console.log(
        `   └── Search depth: ${searchMaxAgeDays} days (from ${agent.leadTier})`
      );
      console.log(`   └── Posts per keyword: ${searchLimit}`);
    } else if (agent.timeWindow) {
      // Legacy agent: use time window config
      const config = getTimeWindowConfig(agent.timeWindow);
      searchTimeWindow = agent.timeWindow;
      searchMaxAgeDays = config.maxAgeDays;
      searchLimit = config.limitPerKeyword;
    } else {
      console.log(`❌ Agent has neither leadTier nor timeWindow`);
      return { status: "failed", reason: "Invalid agent configuration" };
    }

    // Fetch leads for all keywords IN PARALLEL using step.invoke
    // Each keyword fetch runs as a separate Inngest function - Inngest job queue handles parallelization
    const errors: string[] = [];

    console.log(`\n${"─".repeat(60)}`);
    console.log(`🔎 Invoking ${allKeywords.length} parallel keyword fetches...`);
    console.log(`${"─".repeat(60)}`);

    // Note: Inngest serializes data as JSON, so dates become strings
    type SerializedLeadInput = Omit<LeadInput, "publishedAt"> & {
      publishedAt: string | null;
    };
    type FetchResult = {
      keyword: string;
      leads: SerializedLeadInput[];
      error?: string;
    };

    // Invoke ALL keyword fetches at once - Inngest discovers them all and runs them in parallel
    // The concurrency is controlled by fetchKeywordJob's concurrency.limit setting
    const fetchResults = (await Promise.all(
      allKeywords.map((keyword, kwIndex) =>
        step.invoke(`fetch-kw-${kwIndex}`, {
          function: fetchKeywordJob,
          data: {
            keyword,
            agentId,
            timeWindow: searchTimeWindow,
            existingIds: existingIds, // Pass as array, converted to Set in child function
          },
        })
      )
    )) as FetchResult[];

    // Step 2: Collect results and deduplicate
    // Note: Inngest serializes data as JSON, so Dates become strings - we need to convert them back
    const allFetchedLeads: LeadInput[] = [];
    const seenExternalIds = new Set<string>();
    let totalFetched = 0;

    for (const result of fetchResults) {
      if (result.error) {
        errors.push(`${result.keyword}: ${result.error}`);
      }

      totalFetched += result.leads.length;

      for (const lead of result.leads) {
        // Deduplicate across all keywords
        if (
          !seenExternalIds.has(lead.externalId) &&
          !existingIdsSet.has(lead.externalId)
        ) {
          seenExternalIds.add(lead.externalId);
          // Convert publishedAt back to Date if it was serialized as string
          allFetchedLeads.push({
            ...lead,
            publishedAt: lead.publishedAt ? new Date(lead.publishedAt) : null,
          });
        }
      }
    }

    console.log(
      `   📥 Total fetched: ${totalFetched}, unique new: ${allFetchedLeads.length}`
    );

    // Step 3: Save all leads in batch
    const allLeadIds: string[] = [];
    let totalNew = 0;

    if (allFetchedLeads.length > 0) {
      const savedLeads = await step.run("save-all-leads", async () => {
        // Use createMany for batch insertion (much faster)
        await prisma.lead.createMany({
          data: allFetchedLeads.map((lead) => ({
            agentId: lead.agentId,
            source: "reddit" as const,
            externalId: lead.externalId,
            url: lead.url,
            subreddit: lead.subreddit,
            title: lead.title,
            content: lead.content,
            author: lead.author,
            score: lead.score,
            numComments: lead.numComments,
            publishedAt: lead.publishedAt,
          })),
          skipDuplicates: true,
        });

        // Fetch the IDs of saved leads for analysis phase
        const saved = await prisma.lead.findMany({
          where: {
            agentId,
            externalId: { in: allFetchedLeads.map((l) => l.externalId) },
          },
          select: { id: true },
        });

        console.log(`   💾 Batch saved ${saved.length} leads to database`);
        return saved.map((l) => l.id);
      });

      allLeadIds.push(...savedLeads);
      totalNew = savedLeads.length;
    }

    console.log(`\n${"─".repeat(60)}`);
    console.log(`📊 FETCH SUMMARY`);
    console.log(`${"─".repeat(60)}`);
    console.log(
      `   └── Keywords processed: ${allKeywords.length} (in parallel)`
    );
    console.log(`   └── Total leads fetched: ${totalFetched}`);
    console.log(`   └── Unique leads after dedup: ${allFetchedLeads.length}`);
    console.log(`   └── New leads saved: ${totalNew}`);

    if (totalNew === 0) {
      await step.run("set-completed-no-leads", async () => {
        await prisma.aiAgent.update({
          where: { id: agentId },
          data: { status: "COMPLETED", completedAt: new Date() },
        });
        console.log(`\n📝 No leads found - Agent status updated to: COMPLETED`);
      });
      return { status: "completed", leadsFound: 0 };
    }

    // Update status to ANALYZING_LEADS
    await step.run("set-analyzing-status", async () => {
      await prisma.aiAgent.update({
        where: { id: agentId },
        data: { status: "ANALYZING_LEADS" },
      });
      console.log(`\n📝 Agent status updated to: ANALYZING_LEADS`);
    });

    // Split lead IDs into batches for analysis
    const batchIds: string[][] = [];
    for (let i = 0; i < allLeadIds.length; i += BATCH_SIZE) {
      batchIds.push(allLeadIds.slice(i, i + BATCH_SIZE));
    }

    console.log(
      `\n📦 Analyzing ${allLeadIds.length} leads in ${batchIds.length} batches (in parallel)`
    );

    const analysisContext = {
      description: agent.description || `Product at ${agent.websiteUrl}`,
      keywords: agent.keywords,
      websiteUrl: agent.websiteUrl,
    };

    // Invoke ALL batch analyses in parallel - Inngest handles concurrency
    // The concurrency is controlled by analyzeLeadsBatchJob's limit (10) to respect OpenAI rate limits
    const analysisResults = await Promise.all(
      batchIds.map((currentBatchIds, batchIndex) =>
        step.invoke(`analyze-batch-${batchIndex}`, {
          function: analyzeLeadsBatchJob,
          data: {
            batchLeadIds: currentBatchIds,
            context: analysisContext,
            agentId,
          },
        })
      )
    );

    // Aggregate results
    let totalKept = 0;
    let totalDeleted = 0;

    for (const result of analysisResults) {
      if (result) {
        totalKept += result.kept;
        totalDeleted += result.deleted;
      }
    }

    // For new agents: Guarantee exact lead count
    if (isNewAgent && agent.leadsIncluded) {
      await step.run("guarantee-lead-count", async () => {
        const targetLeads = agent.leadsIncluded!;

        // Get all analyzed leads sorted by relevance
        const allAnalyzedLeads = await prisma.lead.findMany({
          where: { agentId },
          orderBy: { relevance: "desc" },
          select: { id: true, relevance: true },
        });

        const currentLeadCount = allAnalyzedLeads.length;

        console.log(`\n📊 Lead Count Guarantee:`);
        console.log(`   └── Target: ${targetLeads}`);
        console.log(`   └── Current: ${currentLeadCount}`);

        if (currentLeadCount > targetLeads) {
          // We have more than needed - delete the lowest-scoring ones
          const leadsToDelete = allAnalyzedLeads.slice(targetLeads);
          const idsToDelete = leadsToDelete.map((l) => l.id);

          await prisma.lead.deleteMany({
            where: { id: { in: idsToDelete } },
          });

          console.log(`   └── Trimmed ${idsToDelete.length} excess leads`);
        } else if (currentLeadCount < targetLeads) {
          // We have fewer than needed - need to adjust quality bar
          console.log(
            `   ⚠️ Only found ${currentLeadCount}/${targetLeads} qualified leads`
          );
          // This is acceptable - deliver what we found
        } else {
          console.log(`   ✅ Exact lead count achieved`);
        }
      });
    }

    // Set agent status to COMPLETED
    await step.run("set-completed-status", async () => {
      await prisma.aiAgent.update({
        where: { id: agentId },
        data: { status: "COMPLETED", completedAt: new Date() },
      });
      console.log(`\n📝 Agent status updated to: COMPLETED`);
    });

    // Get final lead count after guarantee logic
    const finalLeadCount = await step.run("get-final-lead-count", async () => {
      return await prisma.lead.count({ where: { agentId } });
    });

    // Send email notification
    if (finalLeadCount > 0 && agent.user?.email) {
      await step.run("send-leads-ready-email", async () => {
        try {
          const platformName = agent.platform
            ? agent.platform.charAt(0).toUpperCase() + agent.platform.slice(1)
            : "Reddit";

          await resendClient.emails.send({
            from: `Lead Finder <${config.contact.leadsEmail}>`,
            to: agent.user!.email,
            subject: `🎯 ${finalLeadCount} leads ready for you!`,
            react: LeadsReadyEmail({
              name: agent.user!.name || undefined,
              marketName: agent.websiteUrl,
              leadCount: finalLeadCount,
              leadsIncluded: agent.leadsIncluded || undefined,
              platform: platformName,
              dashboardUrl: `${APP_URL}/d/agents/${agentId}`,
            }),
          });
          console.log(`📧 Sent leads ready email to ${agent.user!.email}`);
        } catch (emailError) {
          console.error(`⚠️ Failed to send email:`, emailError);
        }
      });
    }

    console.log(`\n${"─".repeat(60)}`);
    console.log(`📊 FINAL SUMMARY`);
    console.log(`${"─".repeat(60)}`);
    console.log(
      `   └── Leads kept (score >= ${MIN_RELEVANCE_SCORE}): ${totalKept}`
    );
    console.log(`   └── Leads deleted: ${totalDeleted}`);
    console.log(`   └── Final lead count: ${finalLeadCount}`);

    if (isNewAgent && agent.leadsIncluded) {
      console.log(`   └── Target leads: ${agent.leadsIncluded}`);
      console.log(
        `   └── Guarantee met: ${finalLeadCount >= agent.leadsIncluded ? "✅ Yes" : "⚠️ Partial"}`
      );
    }

    console.log(`\n${"=".repeat(60)}`);
    console.log(`✅ [RUN AGENT JOB] Completed for agent: ${agentId}`);
    console.log(`${"=".repeat(60)}\n`);

    return {
      status: errors.length > 0 ? "completed_with_errors" : "completed",
      agentId,
      keywordsProcessed: allKeywords.length,
      totalFetched,
      totalKept,
      totalDeleted,
      finalLeadCount,
      targetLeads: agent.leadsIncluded,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
);
