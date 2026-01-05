import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "@/lib/errors/errorHandler";
import { errorMessages } from "@/lib/constants/errorMessage";
import { auth } from "@/lib/better-auth/auth";
import {
  getMarketById,
  deleteMarket,
  archiveMarket,
  restoreMarket,
} from "@/lib/services/markets/getMarkets";

interface RouteParams {
  params: Promise<{ marketId: string }>;
}

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
 * PUT /api/markets/[marketId] - Archive or restore a market
 * Body: { action: "archive" | "restore" }
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
    const { action } = body as { action: "archive" | "restore" };

    if (!action || !["archive", "restore"].includes(action)) {
      return NextResponse.json(
        { error: errorMessages.MISSING_FIELDS },
        { status: 400 }
      );
    }

    const success =
      action === "archive"
        ? await archiveMarket(marketId, session.user.id)
        : await restoreMarket(marketId, session.user.id);

    if (!success) {
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
