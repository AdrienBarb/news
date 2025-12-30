import { openai } from "@/lib/openai/client";
import { prisma } from "@/lib/db/prisma";
import type { SourceType } from "@prisma/client";

interface MarketContext {
  category: string;
  productDescription: string;
  targetAudience: string;
  keyPhrases: string[];
  competitors: string[];
  painKeywords: string[];
}

interface MarketSensorInput {
  source: SourceType;
  queryText: string;
}

/**
 * Fetch and extract text content from a website
 */
async function fetchWebsiteContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; MarketSignals/1.0; +https://marketsignals.app)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.status}`);
    }

    const html = await response.text();

    // Basic HTML to text extraction
    const text = html
      // Remove script and style tags
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
      // Extract title
      .replace(/<title[^>]*>(.*?)<\/title>/gi, "$1 ")
      // Extract meta description
      .replace(
        /<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/gi,
        "$1 "
      )
      // Remove all other HTML tags
      .replace(/<[^>]*>/g, " ")
      // Decode entities
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      // Collapse whitespace
      .replace(/\s+/g, " ")
      .trim();

    // Limit content length for LLM
    return text.substring(0, 15000);
  } catch (error) {
    console.error(`Failed to fetch website ${url}:`, error);
    throw new Error(`Unable to fetch website content: ${error}`);
  }
}

/**
 * Use OpenAI to analyze website content and extract market context
 */
async function analyzeWebsiteWithLLM(
  websiteContent: string,
  websiteUrl: string
): Promise<MarketContext> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a market research analyst. Analyze the provided website content and extract structured information about the product/service and its market.

Return a JSON object with the following fields:
- category: The product category or market segment (e.g., "project management software", "email marketing platform")
- productDescription: A brief 1-2 sentence description of what the product does
- targetAudience: The primary target audience or ICP (e.g., "small business owners", "software developers")
- keyPhrases: An array of 5-10 key phrases that users might use when discussing this type of product
- competitors: An array of 3-5 likely competitor product names based on the category
- painKeywords: An array of 5-10 pain-related keywords users might use (e.g., "frustrating", "doesn't work", "switching from")`,
      },
      {
        role: "user",
        content: `Analyze this website and extract market context.

Website URL: ${websiteUrl}

Website Content:
${websiteContent}`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  return JSON.parse(content) as MarketContext;
}

/**
 * Generate search queries (sensors) based on market context
 */
function generateSensors(context: MarketContext): MarketSensorInput[] {
  const sensors: MarketSensorInput[] = [];
  const sources: SourceType[] = ["reddit", "hackernews"];

  // Generate queries based on context
  const queryTemplates = [
    // Direct product/category queries
    `${context.category} frustrating`,
    `${context.category} problems`,
    `${context.category} alternative`,
    `${context.category} vs`,
    `${context.category} recommendation`,
    `switching from ${context.category}`,
    `${context.category} review`,
    // Competitor comparisons
    ...context.competitors.slice(0, 3).map((c) => `${c} vs`),
    ...context.competitors.slice(0, 3).map((c) => `switching from ${c}`),
    // Pain-based queries
    ...context.painKeywords.slice(0, 3).map((p) => `${context.category} ${p}`),
  ];

  // Create sensors for each source
  for (const source of sources) {
    for (const query of queryTemplates) {
      sensors.push({
        source,
        queryText: query.toLowerCase().trim(),
      });
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  return sensors.filter((s) => {
    const key = `${s.source}:${s.queryText}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Derive market context from a website URL and create sensors
 */
export async function deriveMarketContext(marketId: string): Promise<void> {
  // Get the market
  const market = await prisma.market.findUnique({
    where: { id: marketId },
  });

  if (!market) {
    throw new Error(`Market not found: ${marketId}`);
  }

  try {
    // Update status to analyzing
    await prisma.market.update({
      where: { id: marketId },
      data: { status: "analyzing" },
    });

    // Fetch website content
    const websiteContent = await fetchWebsiteContent(market.websiteUrl);

    // Analyze with LLM
    const context = await analyzeWebsiteWithLLM(
      websiteContent,
      market.websiteUrl
    );

    // Generate sensors
    const sensors = generateSensors(context);

    // Update market with context and create sensors
    await prisma.$transaction(async (tx) => {
      // Update market
      await tx.market.update({
        where: { id: marketId },
        data: {
          category: context.category,
          contextJson: context as object,
          status: "active",
        },
      });

      // Create sensors
      await tx.marketSensor.createMany({
        data: sensors.map((s) => ({
          marketId,
          source: s.source,
          queryText: s.queryText,
          isActive: true,
        })),
      });
    });
  } catch (error) {
    console.error(`Failed to derive market context for ${marketId}:`, error);

    // Update status to error
    await prisma.market.update({
      where: { id: marketId },
      data: { status: "error" },
    });

    throw error;
  }
}

