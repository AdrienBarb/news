"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendBadge } from "./TrendBadge";
import { PainTypeBadge } from "./PainTypeBadge";
import { MessageSquareQuoteIcon } from "lucide-react";
import type { PainType, SignalTrend } from "@prisma/client";

interface SignalCardProps {
  signal: {
    id: string;
    title: string;
    description: string | null;
    painType: PainType;
    frequency: number;
  };
  marketId: string;
  trend?: SignalTrend;
  currentFrequency?: number;
}

export function SignalCard({
  signal,
  marketId,
  trend,
  currentFrequency,
}: SignalCardProps) {
  return (
    <Link href={`/markets/${marketId}/signals/${signal.id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base font-medium line-clamp-2">
              {signal.title}
            </CardTitle>
            {trend && <TrendBadge trend={trend} />}
          </div>
        </CardHeader>
        <CardContent>
          {signal.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {signal.description}
            </p>
          )}
          <div className="flex items-center justify-between">
            <PainTypeBadge painType={signal.painType} />
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MessageSquareQuoteIcon className="h-4 w-4" />
              <span>{currentFrequency ?? signal.frequency} mentions</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

