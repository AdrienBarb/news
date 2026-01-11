import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "@/lib/errors/errorHandler";
import { errorMessages } from "@/lib/constants/errorMessage";
import { auth } from "@/lib/better-auth/auth";
import { analyzeCompetitors } from "@/lib/services/markets/analyzeCompetitors";
import { z } from "zod";

const analyzeCompetitorsSchema = z.object({
  urls: z
    .array(z.string().min(1, "URL is required"))
    .min(1, "At least one competitor URL is required")
    .max(3, "Maximum 3 competitor URLs allowed"),
});

/**
 * POST /api/onboarding/analyze-competitors - Analyze competitor websites
 * Returns keywords focused on competitor alternatives
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: errorMessages.UNAUTHORIZED },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { urls } = analyzeCompetitorsSchema.parse(body);

    const result = await analyzeCompetitors(urls);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(
      {
        competitorKeywords: result.data.competitorKeywords,
      },
      { status: 200 }
    );
  } catch (error) {
    return errorHandler(error);
  }
}

