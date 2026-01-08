import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "@/lib/errors/errorHandler";
import { errorMessages } from "@/lib/constants/errorMessage";
import { auth } from "@/lib/better-auth/auth";
import { getMarketById } from "@/lib/services/markets/getMarkets";
import { inngest } from "@/lib/inngest/client";

interface RouteParams {
  params: Promise<{ marketId: string }>;
}

/**
 * POST /api/markets/[marketId]/refresh - Manually trigger lead fetching for a market
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
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

    const { marketId } = await params;

    // Verify market ownership
    const market = await getMarketById(marketId, session.user.id);
    if (!market) {
      return NextResponse.json(
        { error: errorMessages.MARKET_NOT_FOUND },
        { status: 404 }
      );
    }

    // Only allow refresh for active markets
    if (market.status !== "active") {
      return NextResponse.json(
        { error: "Market must be active to refresh" },
        { status: 400 }
      );
    }

    // Trigger the fetchLeads job for this specific market
    await inngest.send({
      name: "market/leads.fetch",
      data: {
        marketId: market.id,
      },
    });

    return NextResponse.json(
      { message: "Lead refresh triggered successfully" },
      { status: 200 }
    );
  } catch (error) {
    return errorHandler(error);
  }
}
