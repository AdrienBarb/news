import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "@/lib/errors/errorHandler";
import { errorMessages } from "@/lib/constants/errorMessage";
import { auth } from "@/lib/better-auth/auth";
import { prisma } from "@/lib/db/prisma";
import { hasActiveAccess } from "@/lib/utils/subscription";

/**
 * GET /api/onboarding/status - Check if user has active access and a market
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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        accessExpiresAt: true,
        markets: {
          select: { id: true, status: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: errorMessages.USER_NOT_FOUND },
        { status: 404 }
      );
    }

    const hasAccess = hasActiveAccess(user.accessExpiresAt);
    const market = user.markets[0] || null;

    return NextResponse.json(
      {
        hasAccess,
        market: market
          ? {
              id: market.id,
              status: market.status,
              isReady: market.status === "active",
            }
          : null,
      },
      { status: 200 }
    );
  } catch (error) {
    return errorHandler(error);
  }
}

