"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  TIME_WINDOW_CONFIG,
  type TimeWindow,
} from "@/lib/constants/timeWindow";
import { PLATFORM_CONFIG, type PlatformKey } from "@/lib/constants/platforms";
import { type LeadTierKey } from "@/lib/constants/leadTiers";
import { Loader2, ArrowRight, Clock } from "lucide-react";

type AgentStatus =
  | "PENDING_PAYMENT"
  | "QUEUED"
  | "FETCHING_LEADS"
  | "ANALYZING_LEADS"
  | "COMPLETED"
  | "FAILED";

interface Agent {
  id: string;
  websiteUrl: string;
  description: string | null;
  keywords: string[];
  competitors: string[];
  platform: PlatformKey;
  leadTier: LeadTierKey | null;
  leadsIncluded: number | null;
  timeWindow: TimeWindow | null; // Now optional for backward compatibility
  status: AgentStatus;
  amountPaid: number | null;
  createdAt: string;
  completedAt: string | null;
  _count: {
    leads: number;
  };
}

const STATUS_LABELS: Record<AgentStatus, { label: string; color: string }> = {
  PENDING_PAYMENT: {
    label: "Pending Payment",
    color: "bg-yellow-100 text-yellow-700",
  },
  QUEUED: { label: "Queued", color: "bg-blue-100 text-blue-700" },
  FETCHING_LEADS: {
    label: "Fetching Leads",
    color: "bg-orange-100 text-orange-700",
  },
  ANALYZING_LEADS: {
    label: "Analyzing",
    color: "bg-purple-100 text-purple-700",
  },
  COMPLETED: { label: "Completed", color: "bg-green-100 text-green-700" },
  FAILED: { label: "Failed", color: "bg-red-100 text-red-700" },
};

interface AgentCardProps {
  agent: Agent;
}

export default function AgentCard({ agent }: AgentCardProps) {
  const router = useRouter();
  const statusInfo = STATUS_LABELS[agent.status];
  const isProcessing = ["QUEUED", "FETCHING_LEADS", "ANALYZING_LEADS"].includes(
    agent.status
  );

  // Check if new agent (with leadTier) or legacy (with timeWindow)
  const isNewAgent = agent.leadTier !== null && agent.leadsIncluded !== null;

  return (
    <button
      onClick={() => router.push(`/d/agents/${agent.id}`)}
      className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-6 text-left hover:shadow-lg transition-shadow w-full cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="font-semibold text-gray-900">{agent.websiteUrl}</h4>
            <Badge className={cn("font-normal", statusInfo.color)}>
              {isProcessing && (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              )}
              {statusInfo.label}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {/* Show platform for new agents, time window for legacy */}
            {isNewAgent ? (
              <span className="font-medium">
                {PLATFORM_CONFIG[agent.platform].label}
              </span>
            ) : agent.timeWindow ? (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {TIME_WINDOW_CONFIG[agent.timeWindow].label}
              </span>
            ) : null}

            {/* Show lead count for new agents */}
            {isNewAgent && (
              <span>{agent.leadsIncluded} leads included</span>
            )}

            <span>{agent.keywords.length} keywords</span>

            {/* Show delivery status for completed agents */}
            {agent.status === "COMPLETED" && (
              <span className="text-green-600 font-medium">
                {isNewAgent && agent.leadsIncluded
                  ? `${agent._count.leads}/${agent.leadsIncluded} delivered`
                  : `${agent._count.leads} leads found`}
              </span>
            )}
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400" />
      </div>
    </button>
  );
}

export type { Agent, AgentStatus };
