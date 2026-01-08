import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "@/lib/errors/errorHandler";
import { errorMessages } from "@/lib/constants/errorMessage";
import { auth } from "@/lib/better-auth/auth";
import { createMarket } from "@/lib/services/markets/createMarket";
import {
  getMarketsForUser,
  hasActiveMarket,
} from "@/lib/services/markets/getMarkets";
import { createMarketSchema } from "@/lib/schemas/markets/createMarketSchema";
import { inngest } from "@/lib/inngest/client";

/**
 * GET /api/markets - List all markets for the authenticated user
 */
export async function GET(req: NextRequest) {
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

    const markets = await getMarketsForUser(session.user.id);

    return NextResponse.json({ markets }, { status: 200 });
  } catch (error) {
    return errorHandler(error);
  }
}

/**
 * POST /api/markets - Create a new market
 * 
 * Expected body:
 * - websiteUrl: string (required)
 * - name?: string (optional, will be derived from URL if not provided)
 * - description?: string (optional, AI-generated suggestion)
 * - keywords?: string[] (optional, AI-generated suggestions, max 20)
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

    // Check if user already has an active market (1 domain limit)
    const userHasActiveMarket = await hasActiveMarket(session.user.id);
    if (userHasActiveMarket) {
      return NextResponse.json(
        { error: errorMessages.MARKET_LIMIT_REACHED },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = createMarketSchema.parse(body);

    const market = await createMarket({
      userId: session.user.id,
      data: validatedData,
    });

    // If keywords provided, market is ready to start fetching leads
    // Otherwise, trigger AI analysis
    if (validatedData.keywords && validatedData.keywords.length > 0) {
      // Market has keywords, trigger lead fetching
      // await inngest.send({
      //   name: "market/leads.fetch",
      //   data: { marketId: market.id },
      // });
    } else {
      // Trigger AI analysis to derive keywords
    await inngest.send({
      name: "market/context.derive",
        data: { marketId: market.id },
    });
    }

    return NextResponse.json({ market }, { status: 201 });
  } catch (error) {
    return errorHandler(error);
  }
}
