import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";

// AI Agent functions
import {
  runAgentJob,
  fetchKeywordJob,
  analyzeLeadsBatchJob,
} from "@/lib/inngest/runAgent";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    // Run AI agent - fetch and analyze leads
    runAgentJob,
    // Fetch leads for a single keyword (invoked in parallel by runAgentJob)
    fetchKeywordJob,
    // Analyze a batch of leads with OpenAI (invoked in parallel by runAgentJob)
    analyzeLeadsBatchJob,
  ],
});
