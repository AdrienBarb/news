import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "@/lib/errors/errorHandler";
import { errorMessages } from "@/lib/constants/errorMessage";
import { auth } from "@/lib/better-auth/auth";
import { getSignalById } from "@/lib/services/signals/getSignals";

interface RouteParams {
  params: Promise<{ signalId: string }>;
}

/**
 * GET /api/signals/[signalId] - Get a single signal with evidence
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

    const { signalId } = await params;
    const signal = await getSignalById(signalId, session.user.id);

    if (!signal) {
      return NextResponse.json(
        { error: errorMessages.SIGNAL_NOT_FOUND },
        { status: 404 }
      );
    }

    return NextResponse.json({ signal }, { status: 200 });
  } catch (error) {
    return errorHandler(error);
  }
}

