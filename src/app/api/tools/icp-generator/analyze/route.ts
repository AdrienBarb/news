import { errorMessages } from "@/lib/constants/errorMessage";
import { errorHandler } from "@/lib/errors/errorHandler";
import { NextResponse, NextRequest } from "next/server";
import { extractArticleContent } from "@/lib/utils/articleExtractor";
import { openai } from "@/lib/openai/client";
import { analyzeInputSchema, type AnalyzedData } from "@/lib/schemas/icpGenerator";
import { createIcpReport } from "@/lib/services/icpGenerator";
import { InputType } from "@prisma/client";
import { analyzeLimiter } from "@/lib/ratelimit/client";
import { checkRateLimit } from "@/lib/ratelimit/checkRateLimit";

/**
 * POST /api/tools/icp-generator/analyze - Analyze URL or description and extract ICP data
 */
export async function POST(req: NextRequest) {
  try {
    // Rate limit check
    const rateLimit = await checkRateLimit(req, analyzeLimiter);
    if (!rateLimit.success) return rateLimit.response;

    const body = await req.json();
    const { input, source } = analyzeInputSchema.parse(body);

    console.log(`🔍 Analyzing ICP input: ${input.slice(0, 100)}...`);

    // Detect if input is a URL
    let inputType: InputType = InputType.DESCRIPTION;
    let content = input;

    try {
      const url = new URL(input);
      if (url.protocol === "http:" || url.protocol === "https:") {
        inputType = InputType.URL;
        console.log(`📍 Detected URL, extracting content...`);

        const extracted = await extractArticleContent(input);
        if (extracted) {
          content = extracted;
        } else {
          // Fallback to original input if extraction fails
          content = input;
        }
      }
    } catch {
      // Not a valid URL, use as description
      inputType = InputType.DESCRIPTION;
    }

    // Limit content to avoid token limits
    const truncatedContent = content.slice(0, 15000);

    // Use OpenAI to extract structured ICP data
    const prompt = `Analyze this ${inputType === InputType.URL ? "website/product" : "product description"} and extract the following information:

1. **Product Description**: A concise 2-3 sentence description of what this product/service does
2. **Problem Solved**: What specific pain point or problem does this solve for customers?
3. **Target Customer**: Who is the ideal customer? (e.g., "B2B SaaS founders", "E-commerce store owners", "Solo developers")
4. **Price Point**: Estimate the pricing tier (FREE, UNDER_50, 50_TO_200, 200_TO_1000, OVER_1000)
5. **Business Type**: Is this B2B, B2C, or BOTH?
6. **Alternatives**: What are 2-3 alternative solutions or competitors? (generic names or categories)

Content:
${truncatedContent}

Return JSON in this exact format:
{
  "productDescription": "Brief description",
  "problemSolved": "The main problem it solves",
  "targetCustomer": "Description of ideal customer",
  "pricePoint": "FREE" | "UNDER_50" | "50_TO_200" | "200_TO_1000" | "OVER_1000",
  "businessType": "B2B" | "B2C" | "BOTH",
  "alternatives": "Alternative 1, Alternative 2, Alternative 3"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are an expert at analyzing products and identifying ideal customer profiles. Extract structured data about the product's ICP.",
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

    const analyzedData = JSON.parse(responseContent) as AnalyzedData;

    // Validate the response structure
    if (
      !analyzedData.productDescription ||
      !analyzedData.problemSolved ||
      !analyzedData.targetCustomer ||
      !analyzedData.pricePoint ||
      !analyzedData.businessType ||
      !analyzedData.alternatives
    ) {
      throw new Error("Invalid AI response format");
    }

    // Create ICP report in database
    const report = await createIcpReport({
      input,
      inputType,
      analyzedData,
      source,
    });

    console.log(`✅ ICP analysis complete for report: ${report.id}`);

    return NextResponse.json(
      {
        reportId: report.id,
        analyzedData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("ICP analysis error:", error);
    return errorHandler(error);
  }
}
