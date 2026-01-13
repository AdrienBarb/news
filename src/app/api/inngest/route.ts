import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";

// AI Agent functions
import { runAgentJob } from "@/lib/inngest/runAgent";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    // Run AI agent - fetch and analyze leads
    runAgentJob,
  ],
});
