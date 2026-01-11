import { openai } from "@/lib/openai/client";

export interface CompetitorAnalysisResult {
  competitorKeywords: string[];
}

type AnalyzeCompetitorsResponse =
  | {
      success: true;
      data: CompetitorAnalysisResult;
    }
  | {
      success: false;
      error: string;
    };

/**
 * Fetch and extract text content from a website
 */
async function fetchWebsiteContent(url: string): Promise<string> {
  try {
    // Normalize URL
    let normalizedUrl = url;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      normalizedUrl = `https://${url}`;
    }

    const response = await fetch(normalizedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Prediqte/1.0; +https://prediqte.com)",
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
    return text.substring(0, 10000);
  } catch (error) {
    console.error(`Failed to fetch website ${url}:`, error);
    throw new Error(`Unable to fetch website content from ${url}`);
  }
}

/**
 * Extract competitor name from URL
 */
function extractCompetitorName(url: string): string {
  try {
    let normalizedUrl = url;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      normalizedUrl = `https://${url}`;
    }
    const urlObj = new URL(normalizedUrl);
    return urlObj.hostname.replace(/^www\./, "").split(".")[0];
  } catch {
    return url;
  }
}

/**
 * Use OpenAI to analyze competitor websites and generate relevant keywords
 */
async function extractCompetitorKeywordsWithLLM(
  competitors: { url: string; name: string; content: string }[]
): Promise<CompetitorAnalysisResult> {
  const competitorInfo = competitors
    .map((c) => `Competitor: ${c.name} (${c.url})\nContent: ${c.content}`)
    .join("\n\n---\n\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a marketing expert specializing in Reddit lead generation. You are analyzing competitor websites to generate keywords that will help find people looking for alternatives or comparing products.

For each competitor, generate keywords like:
- "[competitor name] alternative" (e.g., "hootsuite alternative")
- "[competitor name] alternatives" (plural)
- "alternative to [competitor name]" 
- "switching from [competitor name]"
- "[competitor name] vs" (for comparison searches)
- "better than [competitor name]"
- "[competitor name] competitors"
- "leaving [competitor name]"
- "[competitor name] replacement"

Also generate category-based alternatives based on what the competitors do:
- "best [category] alternatives"
- "looking for [category] tool"

Return a JSON object:
{
  "competitorKeywords": ["string", ...]
}

Generate 3-5 keywords per competitor. All keywords should be lowercase.`,
      },
      {
        role: "user",
        content: `Analyze these competitors and generate alternative/comparison keywords:\n\n${competitorInfo}`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  const parsed = JSON.parse(content) as CompetitorAnalysisResult;

  // Validate and clean keywords
  const cleanedKeywords = parsed.competitorKeywords
    .map((k) => k.toLowerCase().trim())
    .filter((k) => k.length > 2 && k.length < 100);

  return {
    competitorKeywords: cleanedKeywords,
  };
}

/**
 * Analyze competitor URLs and extract keywords for lead generation
 */
export async function analyzeCompetitors(
  urls: string[]
): Promise<AnalyzeCompetitorsResponse> {
  try {
    if (urls.length === 0) {
      return {
        success: false,
        error: "At least one competitor URL is required",
      };
    }

    if (urls.length > 3) {
      return {
        success: false,
        error: "Maximum 3 competitor URLs allowed",
      };
    }

    // Fetch content from all competitors in parallel
    const competitorPromises = urls.map(async (url) => {
      const name = extractCompetitorName(url);
      const content = await fetchWebsiteContent(url);
      return { url, name, content };
    });

    const competitors = await Promise.all(competitorPromises);

    // Analyze with LLM
    const result = await extractCompetitorKeywordsWithLLM(competitors);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Failed to analyze competitors:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
