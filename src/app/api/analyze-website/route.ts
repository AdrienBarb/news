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

interface AnalysisResult {
  description: string;
  keywords: string[];
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
2. A list of 10-15 keywords that people would search for on Reddit when looking for this type of product/service

The keywords should be:
- Problem-focused (what pain points does this solve?)
- Solution-oriented (what would someone search for?)
- Specific to the product category
- Include both short and long-tail keywords
- NO competitor names (just generic terms)

Website content:
${truncatedContent}

Return JSON in this exact format:
{
  "description": "A brief description of what the product/service does",
  "keywords": ["keyword1", "keyword2", "keyword3", ...]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are an expert at understanding products and extracting search keywords. Focus on what potential customers would search for when looking for this type of solution.",
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
    if (!result.description || !Array.isArray(result.keywords)) {
      throw new Error("Invalid AI response format");
    }

    // Limit keywords to 15
    const keywords = result.keywords.slice(0, 15);

    console.log(`✅ Analysis complete: ${keywords.length} keywords extracted`);

    return NextResponse.json(
      {
        description: result.description,
        keywords,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Website analysis error:", error);
    return errorHandler(error);
  }
}

