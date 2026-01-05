"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MarketStatusBadge } from "@/components/markets/MarketStatusBadge";
import { SignalCard } from "@/components/signals/SignalCard";
import { PainStatementCard } from "@/components/painStatements/PainStatementCard";
import { ReportSummary } from "@/components/reports/ReportSummary";
import { SignalDeltaTable } from "@/components/reports/SignalDeltaTable";
import useApi from "@/lib/hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  RefreshCwIcon,
  Loader2Icon,
  SignalIcon,
  FileTextIcon,
  ExternalLinkIcon,
  Trash2Icon,
  MessageSquareIcon,
  ArrowRightIcon,
  ClockIcon,
  MessagesSquareIcon,
} from "lucide-react";
import type {
  MarketStatus,
  PainType,
  SignalTrend,
  SourceType,
} from "@prisma/client";

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
  painStatementCount: number;
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

interface PainStatement {
  id: string;
  statement: string;
  painType: PainType;
  confidence: number;
  toolsMentioned: string[];
  switchingIntent: boolean;
  conversation: {
    id: string;
    title: string | null;
    url: string;
    source: SourceType;
  };
  signal: {
    id: string;
    title: string;
  } | null;
}

/** Animated radar pulse dot component */
function RadarDot() {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500"></span>
    </span>
  );
}

/** Empty state component with explanation */
function EmptyState({
  icon: Icon,
  title,
  description,
  status,
  type,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  status: MarketStatus;
  type: "report" | "signal" | "painStatement";
}) {
  const getStatusMessage = () => {
    if (status === "pending") {
      return "Your market is being set up. Data collection will begin in a few moments.";
    }
    if (status === "analyzing") {
      return "We're currently analyzing conversations. This typically takes 5-10 minutes for new markets.";
    }
    // Active status - provide specific timing info
    switch (type) {
      case "report":
        return "Your first report will be generated at 2:00 AM UTC with trend analysis and insights.";
      case "signal":
        return "Signals are created at 2:00 AM UTC when we cluster similar pain statements together.";
      case "painStatement":
        return "Pain statements are extracted continuously as new conversations are found.";
      default:
        return description;
    }
  };

  const getNextStep = () => {
    if (status === "pending" || status === "analyzing") {
      return "This page updates automatically — no need to refresh.";
    }
    switch (type) {
      case "report":
        return "Once you have signals, your first report will appear here.";
      case "signal":
        return "Keep this page open — signals will appear as data is processed.";
      case "painStatement":
        return "Pain statements should start appearing within minutes.";
      default:
        return null;
    }
  };

  const nextStep = getNextStep();

  return (
    <div className="text-center py-8 border rounded-lg bg-muted/20">
      <Icon className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
      <h3 className="text-base font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        {getStatusMessage()}
      </p>
      {nextStep && (
        <p className="text-xs text-muted-foreground/70 mt-2 max-w-xs mx-auto">
          {nextStep}
        </p>
      )}
      <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-muted-foreground">
        <ClockIcon className="h-3 w-3" />
        <span>Auto-refreshing every 10 seconds</span>
      </div>
    </div>
  );
}

export default function MarketDetailPage({ params }: PageProps) {
  const { marketId } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { useGet, usePost, useDelete } = useApi();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Auto-refetch every 10 seconds
  const { data: marketData, isLoading: marketLoading } = useGet(
    `/markets/${marketId}`,
    {},
    { refetchInterval: 10000 }
  );
  const { data: signalsData, isLoading: signalsLoading } = useGet(
    `/markets/${marketId}/signals?limit=6`,
    {},
    { refetchInterval: 10000 }
  );
  const { data: painStatementsData, isLoading: painStatementsLoading } = useGet(
    `/markets/${marketId}/pain-statements?limit=6`,
    {},
    { refetchInterval: 10000 }
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

  const { mutate: deleteMarket, isPending: deleting } = useDelete(
    `/markets/${marketId}`,
    {
      onSuccess: () => {
        // Invalidate markets list cache before redirecting
        queryClient.invalidateQueries({
          queryKey: ["get", { url: "/markets", params: undefined }],
        });
        toast.success("Market deleted successfully");
        router.push("/markets");
      },
      onError: (error: Error) => {
        toast.error(error.message || "Failed to delete market");
      },
    }
  );

  const market: Market | undefined = marketData?.market;
  const signals: Signal[] = signalsData?.signals || [];
  const painStatements: PainStatement[] =
    painStatementsData?.painStatements || [];
  const totalSignals: number = signalsData?.total || 0;
  const totalPainStatements: number = painStatementsData?.total || 0;

  const handleDelete = () => {
    deleteMarket({});
    setShowDeleteDialog(false);
  };

  if (marketLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-20" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
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

  const isActive = market.status === "active";
  const isPaused = market.status === "paused";

  return (
    <div className="p-6 space-y-8">
      {/* Paused Banner */}
      {isPaused && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="shrink-0 rounded-full bg-amber-500/20 p-2">
              <ClockIcon className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-amber-700 dark:text-amber-400">
                Market Paused
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Your subscription has ended. Data collection is paused.
                Resubscribe to resume monitoring and access all your data.
              </p>
            </div>
          </div>
        </div>
      )}

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

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            disabled={deleting}
            className="text-destructive hover:text-destructive"
          >
            {deleting ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2Icon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Market</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{market.name}&quot;? This
              will permanently remove all signals, conversations, and reports
              associated with this market. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {deleting ? (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Signals
              </CardTitle>
              {isActive && <RadarDot />}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{market.signalCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Conversations
              </CardTitle>
              {isActive && <RadarDot />}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{market.conversationCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pain Statements
              </CardTitle>
              {isActive && <RadarDot />}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {market.painStatementCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Latest Report */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileTextIcon className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Latest Report</h2>
          </div>
        </div>
        {market.latestReport ? (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Report for{" "}
              {new Date(market.latestReport.periodStart).toLocaleDateString()} -{" "}
              {new Date(market.latestReport.periodEnd).toLocaleDateString()}
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
          <EmptyState
            icon={FileTextIcon}
            title="No reports yet"
            description="Reports are generated daily with trend analysis."
            status={market.status}
            type="report"
          />
        )}
      </section>

      {/* Top Signals */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <SignalIcon className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Top Signals</h2>
            {totalSignals > 0 && (
              <span className="text-sm text-muted-foreground">
                ({totalSignals})
              </span>
            )}
          </div>
          {totalSignals > 6 && (
            <Link href={`/markets/${marketId}/signals`}>
              <Button variant="ghost" size="sm">
                View All
                <ArrowRightIcon className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
        {signalsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : signals.length === 0 ? (
          <EmptyState
            icon={SignalIcon}
            title="No signals yet"
            description="Signals are created by clustering similar pain statements."
            status={market.status}
            type="signal"
          />
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
      </section>

      {/* Recent Pain Statements */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquareIcon className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Recent Pain Statements</h2>
            {totalPainStatements > 0 && (
              <span className="text-sm text-muted-foreground">
                ({totalPainStatements})
              </span>
            )}
          </div>
          {totalPainStatements > 6 && (
            <Link href={`/markets/${marketId}/pain-statements`}>
              <Button variant="ghost" size="sm">
                View All
                <ArrowRightIcon className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
        {painStatementsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        ) : painStatements.length === 0 ? (
          <EmptyState
            icon={MessageSquareIcon}
            title="No pain statements yet"
            description="Pain statements are extracted from conversations continuously."
            status={market.status}
            type="painStatement"
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {painStatements.map((ps) => (
              <PainStatementCard
                key={ps.id}
                painStatement={ps}
                marketId={market.id}
              />
            ))}
          </div>
        )}
      </section>

      {/* Data Collection Info */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <MessagesSquareIcon className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <div className="space-y-2">
              <p className="text-sm font-medium">How it works</p>
              <div className="text-xs text-muted-foreground space-y-1.5">
                <p>
                  <span className="font-medium text-foreground/80">
                    1. Collection:
                  </span>{" "}
                  We continuously scan the web for conversations related to your
                  market.
                </p>
                <p>
                  <span className="font-medium text-foreground/80">
                    2. Extraction:
                  </span>{" "}
                  AI extracts pain statements from each conversation in
                  real-time.
                </p>
                <p>
                  <span className="font-medium text-foreground/80">
                    3. Clustering:
                  </span>{" "}
                  Every day at 2:00 AM UTC, similar statements are grouped into
                  signals.
                </p>
                <p>
                  <span className="font-medium text-foreground/80">
                    4. Reports:
                  </span>{" "}
                  Daily reports are generated with trend analysis and actionable
                  insights.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
