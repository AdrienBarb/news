import { errorMessages } from "@/lib/constants/errorMessage";
import { errorHandler } from "@/lib/errors/errorHandler";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";

/**
 * GET /api/user/runs - Get remaining runs for the current user
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: errorMessages.UNAUTHORIZED },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { remainingRuns: true },
    });

    return NextResponse.json(
      { remainingRuns: user?.remainingRuns ?? 0 },
      { status: 200 }
    );
  } catch (error) {
    return errorHandler(error);
  }
}
