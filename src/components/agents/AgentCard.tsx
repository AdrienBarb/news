"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PLATFORM_CONFIG, type PlatformKey } from "@/lib/constants/platforms";
import { Loader2, ArrowRight } from "lucide-react";

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
            <span className="font-medium">
              {PLATFORM_CONFIG[agent.platform].label}
            </span>

            <span>{agent.keywords.length} keywords</span>

            {/* Show leads found for completed agents */}
            {agent.status === "COMPLETED" && (
              <span className="text-green-600 font-medium">
                {agent._count.leads} leads found
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
