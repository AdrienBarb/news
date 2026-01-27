"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import useApi from "@/lib/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PLATFORM_CONFIG, type PlatformKey } from "@/lib/constants/platforms";
import {
  ArrowLeft,
  Loader2,
  Search,
  Brain,
  CheckCircle,
  Mail,
  ExternalLink,
  User,
  MessageSquare,
  ThumbsUp,
  Calendar,
  Sparkles,
  ArrowUpDown,
} from "lucide-react";
type AgentStatus =
  | "PENDING_PAYMENT"
  | "QUEUED"
  | "FETCHING_LEADS"
  | "ANALYZING_LEADS"
  | "COMPLETED"
  | "FAILED";

type IntentType =
  | "recommendation"
  | "alternative"
  | "complaint"
  | "question"
  | "comparison";
import { formatDistanceToNow } from "date-fns";

interface Lead {
  id: string;
  externalId: string;
  url: string;
  subreddit: string | null;
  title: string;
  content: string;
  author: string | null;
  score: number;
  numComments: number;
  publishedAt: string | null;
  intent: IntentType | null;
  relevance: number | null;
  relevanceReason: string | null;
  createdAt: string;
}

interface Agent {
  id: string;
  websiteUrl: string;
  description: string | null;
  keywords: string[];
  competitors: string[];
  platform: PlatformKey;
  status: AgentStatus;
  amountPaid: number | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  leads: Lead[];
}

const STATUS_MESSAGES: Record<
  AgentStatus,
  { text: string; subtext: string; icon: typeof Search }
> = {
  PENDING_PAYMENT: {
    text: "Waiting for payment",
    subtext: "Complete your payment to start finding leads",
    icon: Search,
  },
  QUEUED: {
    text: "Starting up...",
    subtext: "Your agent is queued and will start shortly",
    icon: Sparkles,
  },
  FETCHING_LEADS: {
    text: "Searching for leads",
    subtext: "Finding conversations matching your keywords",
    icon: Search,
  },
  ANALYZING_LEADS: {
    text: "Analyzing with AI",
    subtext: "Scoring leads by relevance and intent",
    icon: Brain,
  },
  COMPLETED: {
    text: "Complete!",
    subtext: "Your leads are ready to review",
    icon: CheckCircle,
  },
  FAILED: {
    text: "Something went wrong",
    subtext: "Please try again or contact support",
    icon: Search,
  },
};

const INTENT_LABELS: Record<IntentType, { label: string; color: string }> = {
  recommendation: {
    label: "Looking for recommendations",
    color: "bg-green-100 text-green-700",
  },
  alternative: {
    label: "Seeking alternatives",
    color: "bg-blue-100 text-blue-700",
  },
  comparison: {
    label: "Comparing options",
    color: "bg-purple-100 text-purple-700",
  },
  complaint: {
    label: "Frustrated with current solution",
    color: "bg-orange-100 text-orange-700",
  },
  question: { label: "Has questions", color: "bg-gray-100 text-gray-700" },
};

function ProcessingOverlay({ status }: { status: AgentStatus }) {
  const currentMessage = STATUS_MESSAGES[status];
  const Icon = currentMessage.icon;
  const statusOrder: AgentStatus[] = [
    "QUEUED",
    "FETCHING_LEADS",
    "ANALYZING_LEADS",
  ];
  const currentIndex = statusOrder.indexOf(status);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl border p-8">
          {/* Icon with animation */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center">
                <Icon className="w-8 h-8 text-orange-600" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
              </div>
            </div>
          </div>

          {/* Status text */}
          <h2 className="text-xl font-semibold text-center mb-2">
            {currentMessage.text}
          </h2>
          <p className="text-muted-foreground text-center mb-6">
            {currentMessage.subtext}
          </p>

          {/* Progress indicator */}
          <div className="flex justify-center gap-2 mb-6">
            {statusOrder.map((s, index) => (
              <div
                key={s}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  index === currentIndex
                    ? "bg-orange-500 w-8"
                    : index < currentIndex
                      ? "bg-green-400 w-2"
                      : "bg-gray-200 w-2"
                )}
              />
            ))}
          </div>

          {/* Email notification */}
          <div className="flex items-center justify-center gap-2 bg-blue-50 rounded-xl p-4">
            <Mail className="w-5 h-5 text-blue-500 shrink-0" />
            <p className="text-sm text-blue-700">
              Feel free to leave. We&apos;ll email you when your leads are
              ready!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  const intentInfo = lead.intent ? INTENT_LABELS[lead.intent] : null;

  return (
    <div className="bg-white rounded-2xl border p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {lead.subreddit && (
              <Badge variant="outline" className="text-xs">
                r/{lead.subreddit}
              </Badge>
            )}
            {intentInfo && (
              <Badge className={cn("text-xs font-normal", intentInfo.color)}>
                {intentInfo.label}
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 line-clamp-2">
            {lead.title}
          </h3>
        </div>
        {lead.relevance && (
          <div className="flex flex-col items-center shrink-0">
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg",
                lead.relevance >= 80
                  ? "bg-green-100 text-green-700"
                  : lead.relevance >= 60
                    ? "bg-orange-100 text-orange-700"
                    : "bg-gray-100 text-gray-700"
              )}
            >
              {Math.round(lead.relevance)}
            </div>
            <span className="text-xs text-gray-500 mt-1">score</span>
          </div>
        )}
      </div>

      {/* Content preview */}
      <p className="text-gray-600 text-sm line-clamp-3 mb-4">{lead.content}</p>

      {/* AI Reasoning */}
      {lead.relevanceReason && (
        <div className="bg-orange-50 rounded-xl p-3 mb-4">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
            <p className="text-sm text-orange-700">{lead.relevanceReason}</p>
          </div>
        </div>
      )}

      {/* Meta info */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-4">
          {lead.author && (
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              u/{lead.author}
            </span>
          )}
          <span className="flex items-center gap-1">
            <ThumbsUp className="w-4 h-4" />
            {lead.score}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            {lead.numComments}
          </span>
          {lead.publishedAt && (
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDistanceToNow(new Date(lead.publishedAt), {
                addSuffix: true,
              })}
            </span>
          )}
        </div>
        <a
          href={lead.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium"
        >
          View on Reddit
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

type SortOption = "relevance" | "newest";

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.agentId as string;
  const [sortBy, setSortBy] = useState<SortOption>("relevance");

  const { useGet } = useApi();
  const { data: agentData, isLoading } = useGet(
    `/agents/${agentId}`,
    {},
    {
      refetchInterval: 3000,
    }
  );
  const agent = agentData as Agent | undefined;

  const sortedLeads = useMemo(() => {
    if (!agent?.leads) return [];

    return [...agent.leads].sort((a, b) => {
      if (sortBy === "relevance") {
        return (b.relevance ?? 0) - (a.relevance ?? 0);
      } else {
        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return dateB - dateA;
      }
    });
  }, [agent?.leads, sortBy]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Agent not found
          </h2>
          <Button variant="ghost" onClick={() => router.push("/d")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const isProcessing = ["QUEUED", "FETCHING_LEADS", "ANALYZING_LEADS"].includes(
    agent.status
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push("/d")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-900">
            {agent.websiteUrl}
          </h1>
          <p className="text-sm text-gray-500">
            {PLATFORM_CONFIG[agent.platform]?.label || agent.platform} &middot;{" "}
            {agent.keywords.length} keywords
          </p>
        </div>
        {agent.status === "COMPLETED" && (
          <Badge className="bg-green-100 text-green-700">
            {agent.leads.length} leads found
          </Badge>
        )}
      </div>

      {/* Processing State */}
      {isProcessing && <ProcessingOverlay status={agent.status} />}

      {/* Failed State */}
      {agent.status === "FAILED" && (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-500 mb-4">
            There was an error processing your request. Please try again.
          </p>
          <Button onClick={() => router.push("/d")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      )}

      {/* Completed State - Show Leads */}
      {agent.status === "COMPLETED" && (
        <>
          {agent.leads.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No leads found
              </h2>
              <p className="text-gray-500 mb-4">
                We couldn&apos;t find any high-intent leads matching your
                criteria. Try adjusting your keywords or expanding your time
                window.
              </p>
              <Button onClick={() => router.push("/d")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Sort Filter */}
              <div className="flex items-center justify-end gap-2">
                <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setSortBy("relevance")}
                    className={cn(
                      "px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer",
                      sortBy === "relevance"
                        ? "bg-orange-500 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    By relevance
                  </button>
                  <button
                    onClick={() => setSortBy("newest")}
                    className={cn(
                      "px-3 py-1.5 text-sm font-medium transition-colors border-l border-gray-200 cursor-pointer",
                      sortBy === "newest"
                        ? "bg-orange-500 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    By newest
                  </button>
                </div>
              </div>

              {/* Leads List */}
              {sortedLeads.map((lead: Lead) => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Pending Payment State */}
      {agent.status === "PENDING_PAYMENT" && (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Payment Required
          </h2>
          <p className="text-gray-500 mb-4">
            Complete your payment to start finding leads.
          </p>
          <Button onClick={() => router.push("/d")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      )}
    </div>
  );
}
