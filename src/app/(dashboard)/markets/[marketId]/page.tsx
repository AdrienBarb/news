"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarketStatusBadge } from "@/components/markets/MarketStatusBadge";
import { SignalCard } from "@/components/signals/SignalCard";
import { ReportSummary } from "@/components/reports/ReportSummary";
import { SignalDeltaTable } from "@/components/reports/SignalDeltaTable";
import useApi from "@/lib/hooks/useApi";
import { toast } from "sonner";
import {
  RefreshCwIcon,
  Loader2Icon,
  SignalIcon,
  FileTextIcon,
  ExternalLinkIcon,
} from "lucide-react";
import type { MarketStatus, PainType, SignalTrend } from "@prisma/client";

interface PageProps {
  params: Promise<{ marketId: string }>;
}

interface Market {
  id: string;
  name: string;
  websiteUrl: string;
  category: string | null;
  status: MarketStatus;
  signalCount: number;
  conversationCount: number;
  latestReport: {
    id: string;
    periodStart: string;
    periodEnd: string;
    summaryJson: {
      overview: string;
      keyInsights: string[];
      recommendations: string[];
    };
    reportSignals: Array<{
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
    }>;
  } | null;
}

interface Signal {
  id: string;
  title: string;
  description: string | null;
  painType: PainType;
  frequency: number;
}

export default function MarketDetailPage({ params }: PageProps) {
  const { marketId } = use(params);
  const router = useRouter();
  const { useGet, usePost } = useApi();

  const { data: marketData, isLoading: marketLoading } = useGet(
    `/markets/${marketId}`
  );
  const { data: signalsData, isLoading: signalsLoading } = useGet(
    `/markets/${marketId}/signals`
  );

  const { mutate: refreshMarket, isPending: refreshing } = usePost(
    `/markets/${marketId}/refresh`,
    {
      onSuccess: () => {
        toast.success("Refresh triggered! This may take a few minutes.");
      },
      onError: (error: Error) => {
        toast.error(error.message || "Failed to refresh market");
      },
    }
  );

  const market: Market | undefined = marketData?.market;
  const signals: Signal[] = signalsData?.signals || [];

  if (marketLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-20" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!market) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <p className="text-muted-foreground">Market not found</p>
          <Button variant="link" onClick={() => router.push("/markets")}>
            Back to Markets
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold tracking-tight">{market.name}</h1>
            <MarketStatusBadge status={market.status} />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{market.category || market.websiteUrl}</span>
            <a
              href={market.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              <ExternalLinkIcon className="h-3 w-3" />
            </a>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshMarket({})}
            disabled={refreshing || market.status !== "active"}
          >
            {refreshing ? (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCwIcon className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Signals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{market.signalCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{market.conversationCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{market.status}</div>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="report" className="space-y-4">
        <TabsList>
          <TabsTrigger value="report" className="flex items-center gap-2">
            <FileTextIcon className="h-4 w-4" />
            Latest Report
          </TabsTrigger>
          <TabsTrigger value="signals" className="flex items-center gap-2">
            <SignalIcon className="h-4 w-4" />
            All Signals ({signals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="report">
          {market.latestReport ? (
            <div className="space-y-6">
              <div className="text-sm text-muted-foreground">
                Report for{" "}
                {new Date(market.latestReport.periodStart).toLocaleDateString()}{" "}
                - {new Date(market.latestReport.periodEnd).toLocaleDateString()}
              </div>
              <ReportSummary summary={market.latestReport.summaryJson} />
              <Card>
                <CardHeader>
                  <CardTitle>Signal Changes</CardTitle>
                </CardHeader>
                <CardContent>
                  <SignalDeltaTable
                    reportSignals={market.latestReport.reportSignals}
                    marketId={market.id}
                  />
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-muted/20">
              <FileTextIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No reports yet</h3>
              <p className="text-muted-foreground">
                {market.status === "active"
                  ? "Reports are generated daily. Check back soon!"
                  : "Market is still being analyzed..."}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="signals">
          {signalsLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : signals.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/20">
              <SignalIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No signals yet</h3>
              <p className="text-muted-foreground">
                Signals are detected as conversations are analyzed.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {signals.map((signal) => (
                <SignalCard
                  key={signal.id}
                  signal={signal}
                  marketId={market.id}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
