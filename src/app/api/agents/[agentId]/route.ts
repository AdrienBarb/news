import { errorMessages } from "@/lib/constants/errorMessage";
import { errorHandler } from "@/lib/errors/errorHandler";
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";

/**
 * GET /api/agents/[agentId] - Get agent details with leads
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
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

    const { agentId } = await params;

    const agent = await prisma.aiAgent.findUnique({
      where: { id: agentId },
      include: {
        leads: {
          orderBy: { relevance: "desc" },
          select: {
            id: true,
            externalId: true,
            url: true,
            subreddit: true,
            title: true,
            content: true,
            author: true,
            score: true,
            numComments: true,
            publishedAt: true,
            intent: true,
            relevance: true,
            relevanceReason: true,
            createdAt: true,
          },
        },
      },
    });

    if (!agent) {
      return NextResponse.json(
        { error: errorMessages.NOT_FOUND },
        { status: 404 }
      );
    }

    // Verify ownership
    if (agent.userId !== session.user.id) {
      return NextResponse.json(
        { error: errorMessages.UNAUTHORIZED },
        { status: 403 }
      );
    }

    return NextResponse.json(agent, { status: 200 });
  } catch (error) {
    return errorHandler(error);
  }
}

