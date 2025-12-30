"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PainTypeBadge } from "@/components/signals/PainTypeBadge";
import { EvidenceList } from "@/components/signals/EvidenceList";
import useApi from "@/lib/hooks/useApi";
import {
  ArrowLeftIcon,
  MessageSquareQuoteIcon,
  CalendarIcon,
} from "lucide-react";
import type { PainType } from "@prisma/client";

interface PageProps {
  params: Promise<{ marketId: string; signalId: string }>;
}

interface Evidence {
  id: string;
  quote: string;
  sourceUrl: string;
  painStatement: {
    statement: string;
    painType: PainType;
    confidence: number;
  };
}

interface Signal {
  id: string;
  title: string;
  description: string | null;
  painType: PainType;
  frequency: number;
  avgConfidence: number;
  firstSeenAt: string;
  lastSeenAt: string;
  evidence: Evidence[];
  _count: {
    painStatements: number;
  };
}

export default function SignalDetailPage({ params }: PageProps) {
  const { marketId, signalId } = use(params);
  const router = useRouter();
  const { useGet } = useApi();

  const { data, isLoading, error } = useGet(`/signals/${signalId}`);

  const signal: Signal | undefined = data?.signal;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-20" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !signal) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <p className="text-muted-foreground">Signal not found</p>
          <Button
            variant="link"
            onClick={() => router.push(`/markets/${marketId}`)}
          >
            Back to Market
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(`/markets/${marketId}`)}
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        Back to Market
      </Button>

      {/* Header */}
      <div>
        <div className="flex items-start gap-3 mb-2">
          <h1 className="text-2xl font-bold tracking-tight">{signal.title}</h1>
          <PainTypeBadge painType={signal.painType} />
        </div>
        {signal.description && (
          <p className="text-muted-foreground">{signal.description}</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MessageSquareQuoteIcon className="h-4 w-4" />
              Total Mentions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {signal._count.painStatements}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Confidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(signal.avgConfidence * 100)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              First Seen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(signal.firstSeenAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Evidence */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquareQuoteIcon className="h-5 w-5" />
            Evidence ({signal.evidence.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EvidenceList evidence={signal.evidence} />
        </CardContent>
      </Card>
    </div>
  );
}
