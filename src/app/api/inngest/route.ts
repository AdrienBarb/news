import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";

// Reddit Lead Discovery functions
import { deriveMarketContextJob } from "@/lib/inngest/deriveMarketContext";
import {
  fetchLeadsJob,
  scheduledFetchLeadsJob,
} from "@/lib/inngest/fetchLeads";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    // Market context derivation (analyze website)
    deriveMarketContextJob,
    // Lead fetching from Reddit
    fetchLeadsJob,
    scheduledFetchLeadsJob,
  ],
});
