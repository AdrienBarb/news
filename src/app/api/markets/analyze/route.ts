import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "@/lib/errors/errorHandler";
import { errorMessages } from "@/lib/constants/errorMessage";
import { auth } from "@/lib/better-auth/auth";
import { analyzeWebsite } from "@/lib/services/markets/analyzeWebsite";
import { z } from "zod";

const analyzeSchema = z.object({
  url: z.string().min(1, "URL is required"),
});

/**
 * POST /api/markets/analyze - Analyze a website URL and extract keywords
 * Returns suggested description and keywords for market creation
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
    const { url } = analyzeSchema.parse(body);

    const result = await analyzeWebsite(url);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      description: result.data.description,
      keywords: result.data.keywords,
    }, { status: 200 });
  } catch (error) {
    return errorHandler(error);
  }
}

