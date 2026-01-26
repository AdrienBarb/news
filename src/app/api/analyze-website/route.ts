import { errorMessages } from "@/lib/constants/errorMessage";
import { errorHandler } from "@/lib/errors/errorHandler";
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { extractArticleContent } from "@/lib/utils/articleExtractor";
import { openai } from "@/lib/openai/client";
import { z } from "zod";

const analyzeWebsiteSchema = z.object({
  websiteUrl: z.string().url(),
});

interface PlatformSuggestion {
  platform: "reddit" | "hackernews" | "twitter" | "linkedin";
  reason: string;
  confidence: "high" | "medium" | "low";
}

interface TargetPersona {
  title: string; // e.g., "SaaS Founder", "Product Designer"
  description: string; // Brief description of this persona
}

interface AnalysisResult {
  description: string;
  keywords: string[];
  targetPersonas: TargetPersona[];
  suggestedPlatforms: PlatformSuggestion[];
}

/**
 * POST /api/analyze-website - Analyze a website URL and extract description + keywords
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: errorMessages.UNAUTHORIZED },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { websiteUrl } = analyzeWebsiteSchema.parse(body);

    console.log(`🔍 Analyzing website: ${websiteUrl}`);

    // Extract content from the website
    const content = await extractArticleContent(websiteUrl);

    if (!content) {
      return NextResponse.json(
        { error: "Could not extract content from the website. Please check the URL." },
        { status: 400 }
      );
    }

    // Limit content to avoid token limits
    const truncatedContent = content.slice(0, 15000);

    // Use OpenAI to analyze the website
    const prompt = `Analyze this website content and extract:
1. A concise product/service description (2-3 sentences max)
2. The target personas (ICP) - who would use this product? (2-4 personas)
3. A list of 10-15 SEARCH QUERIES that potential BUYERS would type when looking for this solution
4. Which platforms the ideal customer profile (ICP) for this product likely uses

For target personas:
- Identify 2-4 specific job titles or roles (e.g., "SaaS Founder", "Product Designer", "Marketing Manager")
- Focus on decision makers who would purchase/use this product
- Be specific (not just "business owners" but "E-commerce Store Owners")

## CRITICAL: Keywords Must Be BUYER Search Queries

The keywords should be **actual search queries from people looking to BUY**, not generic industry terms.

❌ BAD KEYWORDS (generic industry terms - attract sellers, not buyers):
- "lead generation tool"
- "SaaS marketing"
- "B2B sales"
- "customer acquisition"

✅ GOOD KEYWORDS (buyer search queries - questions from people wanting to purchase):
- "how to find customers for my SaaS"
- "best tool to find leads on Reddit"
- "where to find people who need my product"
- "recommend software for finding prospects"
- "looking for alternative to [common tool in this space]"
- "what do you use for [problem this product solves]"

The keywords should be:
- Phrased as QUESTIONS or SEARCHES a buyer would type
- Include words like: "recommend", "best", "looking for", "need help with", "alternative to", "how to"
- Focus on the PROBLEM the buyer has, not the industry they're in
- Be specific to what a BUYER would search, not what a SELLER/TEACHER would post about
- NO generic industry terms that attract competitors or content creators

For platform suggestions, consider:
- Reddit: Technical products, B2B SaaS, developer tools, niche communities
- HackerNews: Startups, tech products, developer tools, tech-savvy audience
- Twitter: Marketing tools, consumer products, thought leadership products
- LinkedIn: B2B products, enterprise software, professional services

Website content:
${truncatedContent}

Return JSON in this exact format:
{
  "description": "A brief description of what the product/service does",
  "targetPersonas": [
    {
      "title": "SaaS Founder",
      "description": "Founders of early-stage SaaS companies looking to grow"
    }
  ],
  "keywords": ["how to find customers for my SaaS", "best tool for...", ...],
  "suggestedPlatforms": [
    {
      "platform": "reddit",
      "reason": "Brief explanation why this ICP uses Reddit",
      "confidence": "high"
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are an expert at understanding products and generating BUYER search queries. Your job is to think like someone who WANTS TO BUY this type of product - what would they type into Reddit/Google when looking for a solution? Generate search queries that BUYERS use, not generic industry terms that sellers and content creators use. Focus on questions, recommendations, and problem-focused searches.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseContent = response.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(responseContent) as AnalysisResult;

    // Ensure we have valid data
    if (
      !result.description ||
      !Array.isArray(result.keywords) ||
      !Array.isArray(result.targetPersonas) ||
      !Array.isArray(result.suggestedPlatforms)
    ) {
      throw new Error("Invalid AI response format");
    }

    // Limit keywords to 15 and personas to 4
    const keywords = result.keywords.slice(0, 15);
    const targetPersonas = result.targetPersonas.slice(0, 4);

    console.log(
      `✅ Analysis complete: ${keywords.length} keywords, ${targetPersonas.length} personas extracted`
    );

    return NextResponse.json(
      {
        description: result.description,
        targetPersonas,
        keywords,
        suggestedPlatforms: result.suggestedPlatforms,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Website analysis error:", error);
    return errorHandler(error);
  }
}

