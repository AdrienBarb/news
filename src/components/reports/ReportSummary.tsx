"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LightbulbIcon, TrendingUpIcon, AlertCircleIcon } from "lucide-react";

interface ReportSummaryProps {
  summary: {
    overview: string;
    keyInsights: string[];
    recommendations: string[];
    topSignals?: {
      new: string[];
      rising: string[];
      fading: string[];
    };
  };
}

export function ReportSummary({ summary }: ReportSummaryProps) {
  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUpIcon className="h-5 w-5" />
            Market Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{summary.overview}</p>
        </CardContent>
      </Card>

      {/* Key Insights */}
      {summary.keyInsights && summary.keyInsights.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <LightbulbIcon className="h-5 w-5 text-yellow-500" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {summary.keyInsights.map((insight, index) => (
                <li key={index} className="flex gap-2">
                  <span className="text-muted-foreground shrink-0">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {summary.recommendations && summary.recommendations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircleIcon className="h-5 w-5 text-blue-500" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {summary.recommendations.map((rec, index) => (
                <li key={index} className="flex gap-2">
                  <span className="text-primary font-medium shrink-0">
                    {index + 1}.
                  </span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

