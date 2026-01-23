import { errorMessages } from "@/lib/constants/errorMessage";
import { errorHandler } from "@/lib/errors/errorHandler";
import { NextResponse, NextRequest } from "next/server";
import { openai } from "@/lib/openai/client";
import { generateIcpSchema } from "@/lib/schemas/icpGenerator";
import {
  getIcpReport,
  updateIcpReportWithGeneration,
} from "@/lib/services/icpGenerator";
import { generateLimiter } from "@/lib/ratelimit/client";
import { checkRateLimit } from "@/lib/ratelimit/checkRateLimit";

/**
 * POST /api/tools/icp-generator/generate - Generate comprehensive ICP report
 */
export async function POST(req: NextRequest) {
  try {
    // Rate limit check
    const rateLimit = await checkRateLimit(req, generateLimiter);
    if (!rateLimit.success) return rateLimit.response;

    const body = await req.json();
    const { reportId, finalData } = generateIcpSchema.parse(body);

    console.log(`📝 Generating ICP report for: ${reportId}`);

    // Verify report exists
    const existingReport = await getIcpReport(reportId);
    if (!existingReport) {
      return NextResponse.json(
        { error: errorMessages.NOT_FOUND },
        { status: 404 }
      );
    }

    // Generate comprehensive ICP report using GPT-4o
    const prompt = `Generate a comprehensive Ideal Customer Profile (ICP) report based on this product information:

**Product Description**: ${finalData.productDescription}

**Problem Solved**: ${finalData.problemSolved}

**Target Customer**: ${finalData.targetCustomer}

**Price Point**: ${finalData.pricePoint}

**Business Type**: ${finalData.businessType}

**Alternatives**: ${finalData.alternatives}

Create a detailed ICP report with the following sections (use markdown formatting):

# Ideal Customer Profile

## 1. Target Company Profile
- Company size (employees, revenue)
- Industry/vertical
- Growth stage
- Tech stack/tools they use
- Geographic location

## 2. Decision Maker
- Job title(s)
- Seniority level
- Department
- Day-to-day responsibilities
- What success looks like for them

## 3. Pain Points
List 3-5 specific pain points this ICP experiences that your product solves:
- Be specific and concrete
- Focus on emotional and practical frustrations
- Explain the cost of NOT solving this problem

## 4. Buying Triggers
What events or situations make them actively search for a solution?
- Business triggers (e.g., hitting scale, new regulation)
- Personal triggers (e.g., missed deadline, customer complaint)
- Seasonal/timing factors

## 5. Where They Hang Out
Specific places where this ICP spends time online:
- Subreddits (list 5-10 specific subreddit names)
- Online communities and forums
- Social media platforms
- Industry events/conferences
- Newsletters/publications they read

## 6. Objections You'll Hear
Common concerns and how to address them:
- Price/ROI concerns
- Implementation complexity
- Switching costs
- Trust/credibility concerns

## 7. Keywords They Search
15-20 specific search terms they use when looking for solutions:
- Problem-focused keywords
- Solution-focused keywords
- Competitor comparison keywords
- "Best X for Y" type queries

Make this actionable and specific. Use real examples and concrete details.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "You are an expert marketing strategist and customer research analyst. Create detailed, actionable ICPs that help founders understand exactly who to target and where to find them.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const report = response.choices[0]?.message?.content;
    if (!report) {
      throw new Error("No report generated from AI");
    }

    // Save to database
    await updateIcpReportWithGeneration({
      reportId,
      finalData,
      report,
    });

    console.log(`✅ ICP report generated successfully for: ${reportId}`);

    return NextResponse.json(
      {
        report,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("ICP generation error:", error);
    return errorHandler(error);
  }
}
