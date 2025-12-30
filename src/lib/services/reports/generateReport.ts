import { prisma } from "@/lib/db/prisma";
import { openai } from "@/lib/openai/client";
import type { SignalTrend } from "@prisma/client";

const REPORT_PERIOD_DAYS = 30;

interface SignalDelta {
  signalId: string;
  trend: SignalTrend;
  currentFrequency: number;
  previousFrequency: number;
}

interface ReportSummary {
  overview: string;
  keyInsights: string[];
  topSignals: {
    new: string[];
    rising: string[];
    fading: string[];
  };
  recommendations: string[];
}

/**
 * Compute signal deltas by comparing current vs previous period
 */
async function computeSignalDeltas(
  marketId: string,
  periodEnd: Date
): Promise<SignalDelta[]> {
  const periodStart = new Date(
    periodEnd.getTime() - REPORT_PERIOD_DAYS * 24 * 60 * 60 * 1000
  );
  const previousPeriodStart = new Date(
    periodStart.getTime() - REPORT_PERIOD_DAYS * 24 * 60 * 60 * 1000
  );

  // Get all signals for this market
  const signals = await prisma.signal.findMany({
    where: { marketId },
    select: {
      id: true,
      title: true,
      painStatements: {
        select: {
          createdAt: true,
        },
      },
    },
  });

  const deltas: SignalDelta[] = [];

  for (const signal of signals) {
    // Count statements in current period
    const currentFrequency = signal.painStatements.filter(
      (ps) => ps.createdAt >= periodStart && ps.createdAt <= periodEnd
    ).length;

    // Count statements in previous period
    const previousFrequency = signal.painStatements.filter(
      (ps) => ps.createdAt >= previousPeriodStart && ps.createdAt < periodStart
    ).length;

    // Determine trend
    let trend: SignalTrend;

    if (previousFrequency === 0 && currentFrequency > 0) {
      trend = "new";
    } else if (currentFrequency > previousFrequency * 1.3) {
      trend = "rising";
    } else if (currentFrequency < previousFrequency * 0.7) {
      trend = "fading";
    } else {
      trend = "stable";
    }

    // Only include signals that have activity in either period
    if (currentFrequency > 0 || previousFrequency > 0) {
      deltas.push({
        signalId: signal.id,
        trend,
        currentFrequency,
        previousFrequency,
      });
    }
  }

  // Sort by trend priority (new > rising > stable > fading) then by frequency
  const trendPriority: Record<SignalTrend, number> = {
    new: 1,
    rising: 2,
    stable: 3,
    fading: 4,
  };

  deltas.sort((a, b) => {
    const priorityDiff = trendPriority[a.trend] - trendPriority[b.trend];
    if (priorityDiff !== 0) return priorityDiff;
    return b.currentFrequency - a.currentFrequency;
  });

  return deltas;
}

/**
 * Generate AI summary for the report
 */
async function generateReportSummary(
  marketId: string,
  deltas: SignalDelta[]
): Promise<ReportSummary> {
  // Get market and signal details
  const market = await prisma.market.findUnique({
    where: { id: marketId },
    select: {
      name: true,
      category: true,
    },
  });

  const signalDetails = await prisma.signal.findMany({
    where: {
      id: { in: deltas.map((d) => d.signalId) },
    },
    select: {
      id: true,
      title: true,
      description: true,
      painType: true,
    },
  });

  const signalMap = new Map(signalDetails.map((s) => [s.id, s]));

  // Prepare signal summary for AI
  const newSignals = deltas
    .filter((d) => d.trend === "new")
    .map((d) => signalMap.get(d.signalId))
    .filter(Boolean)
    .slice(0, 5);

  const risingSignals = deltas
    .filter((d) => d.trend === "rising")
    .map((d) => signalMap.get(d.signalId))
    .filter(Boolean)
    .slice(0, 5);

  const fadingSignals = deltas
    .filter((d) => d.trend === "fading")
    .map((d) => signalMap.get(d.signalId))
    .filter(Boolean)
    .slice(0, 3);

  if (deltas.length === 0) {
    return {
      overview:
        "No significant market signals detected in this period. Continue monitoring for emerging patterns.",
      keyInsights: [],
      topSignals: { new: [], rising: [], fading: [] },
      recommendations: [
        "Consider expanding search queries to capture more conversations",
      ],
    };
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a market intelligence analyst writing an executive summary report for a SaaS founder.

Generate a JSON report with:
- overview: 2-3 sentence executive summary of market signals
- keyInsights: Array of 3-5 key insights (1 sentence each)
- recommendations: Array of 2-3 actionable recommendations

Be concise, specific, and actionable. Focus on what's most important for product and strategic decisions.`,
      },
      {
        role: "user",
        content: `Generate a market intelligence report.

Market: ${market?.name || "Unknown"} (${market?.category || "Software"})
Period: Last 30 days

NEW SIGNALS (first seen this period):
${newSignals.map((s) => `- ${s?.title}: ${s?.description}`).join("\n") || "None"}

RISING SIGNALS (increasing frequency):
${risingSignals.map((s) => `- ${s?.title}: ${s?.description}`).join("\n") || "None"}

FADING SIGNALS (decreasing frequency):
${fadingSignals.map((s) => `- ${s?.title}: ${s?.description}`).join("\n") || "None"}

Total signals: ${deltas.length}
New: ${deltas.filter((d) => d.trend === "new").length}
Rising: ${deltas.filter((d) => d.trend === "rising").length}
Stable: ${deltas.filter((d) => d.trend === "stable").length}
Fading: ${deltas.filter((d) => d.trend === "fading").length}`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    return {
      overview: "Report generation failed. Please try again.",
      keyInsights: [],
      topSignals: { new: [], rising: [], fading: [] },
      recommendations: [],
    };
  }

  try {
    const parsed = JSON.parse(content);
    return {
      overview: parsed.overview || "",
      keyInsights: parsed.keyInsights || [],
      topSignals: {
        new: newSignals.map((s) => s?.title || ""),
        rising: risingSignals.map((s) => s?.title || ""),
        fading: fadingSignals.map((s) => s?.title || ""),
      },
      recommendations: parsed.recommendations || [],
    };
  } catch {
    return {
      overview: "Report parsing failed.",
      keyInsights: [],
      topSignals: { new: [], rising: [], fading: [] },
      recommendations: [],
    };
  }
}

/**
 * Generate a report for a market
 */
export async function generateReportForMarket(marketId: string): Promise<{
  reportId: string;
  signalCount: number;
}> {
  const now = new Date();
  const periodEnd = now;
  const periodStart = new Date(
    now.getTime() - REPORT_PERIOD_DAYS * 24 * 60 * 60 * 1000
  );

  // Check if report already exists for this period
  const existingReport = await prisma.report.findFirst({
    where: {
      marketId,
      periodStart,
      periodEnd,
    },
  });

  if (existingReport) {
    return {
      reportId: existingReport.id,
      signalCount: 0,
    };
  }

  // Compute signal deltas
  const deltas = await computeSignalDeltas(marketId, periodEnd);

  // Generate AI summary
  const summary = await generateReportSummary(marketId, deltas);

  // Create report with signal deltas
  const report = await prisma.$transaction(async (tx) => {
    const newReport = await tx.report.create({
      data: {
        marketId,
        periodStart,
        periodEnd,
        summaryJson: summary as object,
        generatedAt: now,
      },
    });

    // Create report signals
    if (deltas.length > 0) {
      await tx.reportSignal.createMany({
        data: deltas.map((d) => ({
          reportId: newReport.id,
          signalId: d.signalId,
          trend: d.trend,
          currentFrequency: d.currentFrequency,
          previousFrequency: d.previousFrequency,
        })),
      });
    }

    return newReport;
  });

  return {
    reportId: report.id,
    signalCount: deltas.length,
  };
}

