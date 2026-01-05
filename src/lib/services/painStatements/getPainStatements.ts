import { prisma } from "@/lib/db/prisma";
import type { PainStatement, Conversation, Signal } from "@prisma/client";

export interface PainStatementWithRelations extends PainStatement {
  conversation: Pick<Conversation, "id" | "title" | "url" | "source">;
  signal: Pick<Signal, "id" | "title"> | null;
}

/**
 * Get all pain statements for a market
 */
export async function getPainStatementsForMarket(
  marketId: string,
  options: {
    limit?: number;
    offset?: number;
    orderBy?: "createdAt" | "confidence";
  } = {}
): Promise<{ painStatements: PainStatementWithRelations[]; total: number }> {
  const { limit = 50, offset = 0, orderBy = "createdAt" } = options;

  const [painStatements, total] = await Promise.all([
    prisma.painStatement.findMany({
      where: {
        conversation: {
          marketId,
        },
      },
      orderBy: { [orderBy]: "desc" },
      take: limit,
      skip: offset,
      include: {
        conversation: {
          select: {
            id: true,
            title: true,
            url: true,
            source: true,
          },
        },
        signal: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    }),
    prisma.painStatement.count({
      where: {
        conversation: {
          marketId,
        },
      },
    }),
  ]);

  return { painStatements: painStatements as PainStatementWithRelations[], total };
}

