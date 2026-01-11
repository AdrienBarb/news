import { openai } from "@/lib/openai/client";

export interface AnalysisResult {
  description: string;
  keywords: string[];
}

type AnalyzeWebsiteResponse =
  | {
      success: true;
      data: AnalysisResult;
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
    return text.substring(0, 15000);
  } catch (error) {
    console.error(`Failed to fetch website ${url}:`, error);
    throw new Error(`Unable to fetch website content: ${error}`);
  }
}

/**
 * Use OpenAI to analyze website content and extract keywords for Reddit search
 */
async function extractKeywordsWithLLM(
  websiteContent: string,
  websiteUrl: string
): Promise<AnalysisResult> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a marketing expert specializing in Reddit lead generation. Your task is to analyze a website and extract:

1. **description**: A short 1-2 sentence description of what the product/service does and who it's for (max 500 characters)
2. **keywords**: An array of 10-15 high-intent search keywords/phrases to find potential customers on Reddit

For keywords, generate STRONG intent-based phrases that people actually search for. Focus on:
- "best [category] tools" (e.g., "best Reddit lead tools", "best inbound lead generation software")
- "affordable [product type] software" (e.g., "affordable Reddit listening software")
- "[product name] alternatives" (e.g., "hootsuite alternatives", "sprout social alternatives")
- "[category] recommendations" (e.g., "Reddit lead generation tools", "social media listening tools")
- "must-have [category] for [audience]" (e.g., "must-have Reddit tools for entrepreneurs")
- "top [category] [year]" (e.g., "top Reddit engagement tools 2026")
- "which [product type] is best for [use case]" (e.g., "which Reddit tool is best for capturing leads")
- "[competitor] vs" searches (e.g., "brandwatch vs sprinklr")
- "looking for [solution]" (e.g., "looking for Reddit monitoring tool")
- "[category] software recommendations" (e.g., "community listening tools recommendations")

Return a JSON object with these fields:
{
  "description": "string",
  "keywords": ["string", ...]
}

Keywords should be 3-7 words each. Focus on phrases people ACTUALLY search when looking for solutions. Avoid generic single-word terms.`,
      },
      {
        role: "user",
        content: `Analyze this website and extract description and keywords for Reddit lead generation.

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

  const parsed = JSON.parse(content) as AnalysisResult;

  // Validate and clean keywords
  const cleanedKeywords = parsed.keywords
    .map((k) => k.toLowerCase().trim())
    .filter((k) => k.length > 2 && k.length < 100)
    .slice(0, 20); // Max 20 keywords

  return {
    description: parsed.description || "",
    keywords: cleanedKeywords,
  };
}

/**
 * Analyze a website URL and extract description + keywords for lead generation
 */
export async function analyzeWebsite(
  url: string
): Promise<AnalyzeWebsiteResponse> {
  try {
    // Fetch website content
    const websiteContent = await fetchWebsiteContent(url);

    // Analyze with LLM
    const result = await extractKeywordsWithLLM(websiteContent, url);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error(`Failed to analyze website ${url}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
