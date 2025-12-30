import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";

// Market Signals functions
import { deriveMarketContextJob } from "@/lib/inngest/deriveMarketContext";
import {
  fetchConversationsJob,
  scheduledFetchConversationsJob,
} from "@/lib/inngest/fetchConversations";
import { processConversationJob } from "@/lib/inngest/processConversation";
import {
  clusterSignalsJob,
  scheduledClusterSignalsJob,
} from "@/lib/inngest/clusterSignals";
import {
  generateReportJob,
  scheduledGenerateReportJob,
} from "@/lib/inngest/generateReport";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    // Market context derivation
    deriveMarketContextJob,
    // Conversation fetching
    fetchConversationsJob,
    scheduledFetchConversationsJob,
    // Conversation processing
    processConversationJob,
    // Signal clustering
    clusterSignalsJob,
    scheduledClusterSignalsJob,
    // Report generation
    generateReportJob,
    scheduledGenerateReportJob,
  ],
});
