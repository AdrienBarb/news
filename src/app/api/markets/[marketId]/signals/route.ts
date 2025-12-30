import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "@/lib/errors/errorHandler";
import { errorMessages } from "@/lib/constants/errorMessage";
import { auth } from "@/lib/better-auth/auth";
import { getMarketById } from "@/lib/services/markets/getMarkets";
import { getSignalsForMarket } from "@/lib/services/signals/getSignals";

interface RouteParams {
  params: Promise<{ marketId: string }>;
}

/**
 * GET /api/markets/[marketId]/signals - Get all signals for a market
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
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

    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const orderBy = (searchParams.get("orderBy") || "frequency") as
      | "frequency"
      | "lastSeenAt"
      | "createdAt";

    const { signals, total } = await getSignalsForMarket(marketId, {
      limit,
      offset,
      orderBy,
    });

    return NextResponse.json({ signals, total }, { status: 200 });
  } catch (error) {
    return errorHandler(error);
  }
}

