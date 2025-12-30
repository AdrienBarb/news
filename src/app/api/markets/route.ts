import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "@/lib/errors/errorHandler";
import { errorMessages } from "@/lib/constants/errorMessage";
import { auth } from "@/lib/better-auth/auth";
import { createMarket } from "@/lib/services/markets/createMarket";
import { getMarketsForUser } from "@/lib/services/markets/getMarkets";
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
    const validatedData = createMarketSchema.parse(body);

    const market = await createMarket({
      userId: session.user.id,
      data: validatedData,
    });

    // Trigger the deriveMarketContext background job
    await inngest.send({
      name: "market/context.derive",
      data: {
        marketId: market.id,
      },
    });

    return NextResponse.json({ market }, { status: 201 });
  } catch (error) {
    return errorHandler(error);
  }
}

