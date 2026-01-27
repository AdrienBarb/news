"use client";

import { useState } from "react";
import useApi from "@/lib/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, ShoppingCart } from "lucide-react";
import AgentsList from "@/components/agents/AgentsList";
import EmptyAgentsState from "@/components/agents/EmptyAgentsState";
import CreateAgentModal from "@/components/agents/CreateAgentModal";
import BuyRunsModal from "@/components/agents/BuyRunsModal";
import type { Agent } from "@/components/agents/AgentCard";

export default function DashboardPage() {
  const { useGet } = useApi();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBuyRunsOpen, setIsBuyRunsOpen] = useState(false);

  const { data: agentsData, isLoading: loadingAgents } = useGet("/agents");
  const agents = agentsData as Agent[] | undefined;

  const { data: runsData } = useGet("/user/runs");
  const remainingRuns = (runsData as { remainingRuns: number } | undefined)
    ?.remainingRuns ?? 0;

  const hasAgents = agents && agents.length > 0;

  // Loading state
  if (loadingAgents) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header with runs display and actions */}
      {hasAgents && (
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <Badge
              variant="outline"
              className="text-sm font-medium px-3 py-1"
            >
              {remainingRuns} run{remainingRuns !== 1 ? "s" : ""} remaining
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsBuyRunsOpen(true)}
              className="gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Buy Runs
            </Button>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Run an agent
            </Button>
          </div>
        </div>
      )}

      {/* Show form directly if no agents, otherwise show agents list */}
      {hasAgents ? <AgentsList agents={agents} /> : <EmptyAgentsState />}

      {/* Modal for creating new agent (when user already has agents) */}
      <CreateAgentModal open={isModalOpen} onOpenChange={setIsModalOpen} />

      {/* Modal for buying run packs */}
      <BuyRunsModal open={isBuyRunsOpen} onOpenChange={setIsBuyRunsOpen} />
    </div>
  );
}
