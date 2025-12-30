"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendBadge } from "@/components/signals/TrendBadge";
import { PainTypeBadge } from "@/components/signals/PainTypeBadge";
import type { PainType, SignalTrend } from "@prisma/client";

interface ReportSignal {
  id: string;
  trend: SignalTrend;
  currentFrequency: number;
  previousFrequency: number;
  signal: {
    id: string;
    title: string;
    painType: PainType;
    description: string | null;
  };
}

interface SignalDeltaTableProps {
  reportSignals: ReportSignal[];
  marketId: string;
}

export function SignalDeltaTable({
  reportSignals,
  marketId,
}: SignalDeltaTableProps) {
  if (reportSignals.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No signals in this report period
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Signal</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Trend</TableHead>
          <TableHead className="text-right">Current</TableHead>
          <TableHead className="text-right">Previous</TableHead>
          <TableHead className="text-right">Change</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reportSignals.map((rs) => {
          const change = rs.currentFrequency - rs.previousFrequency;
          const changePercent =
            rs.previousFrequency > 0
              ? Math.round((change / rs.previousFrequency) * 100)
              : rs.currentFrequency > 0
                ? 100
                : 0;

          return (
            <TableRow key={rs.id}>
              <TableCell>
                <Link
                  href={`/markets/${marketId}/signals/${rs.signal.id}`}
                  className="font-medium hover:underline"
                >
                  {rs.signal.title}
                </Link>
              </TableCell>
              <TableCell>
                <PainTypeBadge painType={rs.signal.painType} />
              </TableCell>
              <TableCell>
                <TrendBadge trend={rs.trend} />
              </TableCell>
              <TableCell className="text-right">{rs.currentFrequency}</TableCell>
              <TableCell className="text-right">{rs.previousFrequency}</TableCell>
              <TableCell className="text-right">
                <span
                  className={
                    change > 0
                      ? "text-green-600"
                      : change < 0
                        ? "text-orange-600"
                        : "text-muted-foreground"
                  }
                >
                  {change > 0 ? "+" : ""}
                  {change} ({changePercent > 0 ? "+" : ""}
                  {changePercent}%)
                </span>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

