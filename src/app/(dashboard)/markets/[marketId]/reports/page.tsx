"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SignalDeltaTable } from "@/components/reports/SignalDeltaTable";
import useApi from "@/lib/hooks/useApi";
import { ArrowLeftIcon, FileTextIcon, CalendarIcon } from "lucide-react";
import type { PainType, SignalTrend } from "@prisma/client";

interface PageProps {
  params: Promise<{ marketId: string }>;
}

interface Report {
  id: string;
  periodStart: string;
  periodEnd: string;
  generatedAt: string;
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
}

export default function ReportsPage({ params }: PageProps) {
  const { marketId } = use(params);
  const router = useRouter();
  const { useGet } = useApi();

  const { data, isLoading } = useGet(`/markets/${marketId}/reports`);

  const reports: Report[] = data?.reports || [];

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-20" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48" />
        ))}
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
        <h1 className="text-2xl font-bold tracking-tight">Report History</h1>
        <p className="text-muted-foreground">
          View past reports and signal changes over time
        </p>
      </div>

      {/* Reports List */}
      {reports.length === 0 ? (
        <div className="text-center py-16 border rounded-lg bg-muted/20">
          <FileTextIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No reports yet</h3>
          <p className="text-muted-foreground">
            Reports are generated daily. Check back soon!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  {new Date(report.periodStart).toLocaleDateString()} -{" "}
                  {new Date(report.periodEnd).toLocaleDateString()}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Generated on{" "}
                  {new Date(report.generatedAt).toLocaleDateString()}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {report.summaryJson?.overview && (
                  <p className="text-muted-foreground">
                    {report.summaryJson.overview}
                  </p>
                )}
                <div className="border rounded-lg">
                  <SignalDeltaTable
                    reportSignals={report.reportSignals}
                    marketId={marketId}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
