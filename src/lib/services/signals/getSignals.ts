import { prisma } from "@/lib/db/prisma";
import type { Signal, SignalEvidence, PainStatement } from "@prisma/client";

export interface SignalWithEvidence extends Signal {
  evidence: Array<
    SignalEvidence & {
      painStatement: Pick<PainStatement, "statement" | "painType" | "confidence">;
    }
  >;
  _count: {
    painStatements: number;
  };
}

/**
 * Get all signals for a market
 */
export async function getSignalsForMarket(
  marketId: string,
  options: {
    limit?: number;
    offset?: number;
    orderBy?: "frequency" | "lastSeenAt" | "createdAt";
  } = {}
): Promise<{ signals: SignalWithEvidence[]; total: number }> {
  const { limit = 50, offset = 0, orderBy = "frequency" } = options;

  const [signals, total] = await Promise.all([
    prisma.signal.findMany({
      where: { marketId },
      orderBy: { [orderBy]: "desc" },
      take: limit,
      skip: offset,
      include: {
        evidence: {
          take: 3,
          orderBy: { createdAt: "desc" },
          include: {
            painStatement: {
              select: {
                statement: true,
                painType: true,
                confidence: true,
              },
            },
          },
        },
        _count: {
          select: {
            painStatements: true,
          },
        },
      },
    }),
    prisma.signal.count({ where: { marketId } }),
  ]);

  return { signals: signals as SignalWithEvidence[], total };
}

/**
 * Get a single signal by ID with all evidence
 */
export async function getSignalById(
  signalId: string,
  userId: string
): Promise<SignalWithEvidence | null> {
  const signal = await prisma.signal.findFirst({
    where: {
      id: signalId,
      market: {
        userId,
      },
    },
    include: {
      evidence: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          painStatement: {
            select: {
              statement: true,
              painType: true,
              confidence: true,
            },
          },
        },
      },
      _count: {
        select: {
          painStatements: true,
        },
      },
    },
  });

  return signal as SignalWithEvidence | null;
}

