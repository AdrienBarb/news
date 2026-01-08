import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "@/lib/errors/errorHandler";
import { errorMessages } from "@/lib/constants/errorMessage";
import { auth } from "@/lib/better-auth/auth";
import { prisma } from "@/lib/db/prisma";

interface RouteParams {
  params: Promise<{ marketId: string }>;
}

/**
 * GET /api/markets/[marketId]/leads - Get leads for a market
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
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const showArchived = searchParams.get("archived") === "true";

    // Verify market ownership
    const market = await prisma.market.findFirst({
      where: {
        id: marketId,
        userId: session.user.id,
      },
    });

    if (!market) {
      return NextResponse.json(
        { error: errorMessages.NOT_FOUND },
        { status: 404 }
      );
    }

    // Fetch leads
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where: {
          marketId,
          isArchived: showArchived ? undefined : false,
        },
        orderBy: [
          { isRead: "asc" }, // Unread first
          { publishedAt: "desc" },
        ],
        take: limit,
        skip: offset,
      }),
      prisma.lead.count({
        where: {
          marketId,
          isArchived: showArchived ? undefined : false,
        },
      }),
    ]);

    return NextResponse.json({ leads, total }, { status: 200 });
  } catch (error) {
    return errorHandler(error);
  }
}

