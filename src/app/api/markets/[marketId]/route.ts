import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "@/lib/errors/errorHandler";
import { errorMessages } from "@/lib/constants/errorMessage";
import { auth } from "@/lib/better-auth/auth";
import {
  getMarketById,
  deleteMarket,
  updateMarketSettings,
} from "@/lib/services/markets/getMarkets";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ marketId: string }>;
}

const updateMarketSchema = z.object({
  description: z.string().max(500).optional(),
  keywords: z.array(z.string().min(1).max(100)).max(20).optional(),
});

/**
 * GET /api/markets/[marketId] - Get a single market by ID
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
    const market = await getMarketById(marketId, session.user.id);

    if (!market) {
      return NextResponse.json(
        { error: errorMessages.NOT_FOUND },
        { status: 404 }
      );
    }

    return NextResponse.json({ market }, { status: 200 });
  } catch (error) {
    return errorHandler(error);
  }
}

/**
 * PUT /api/markets/[marketId] - Update market settings (description, keywords)
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
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
    const body = await req.json();
    const validatedData = updateMarketSchema.parse(body);

    const market = await updateMarketSettings(
      marketId,
      session.user.id,
      validatedData
    );

    if (!market) {
      return NextResponse.json(
        { error: errorMessages.NOT_FOUND },
        { status: 404 }
      );
    }

    return NextResponse.json({ market }, { status: 200 });
  } catch (error) {
    return errorHandler(error);
  }
}

/**
 * DELETE /api/markets/[marketId] - Delete a market
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
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
    const deleted = await deleteMarket(marketId, session.user.id);

    if (!deleted) {
      return NextResponse.json(
        { error: errorMessages.NOT_FOUND },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return errorHandler(error);
  }
}
