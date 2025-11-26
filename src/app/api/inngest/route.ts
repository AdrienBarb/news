import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { createArticle } from "@/lib/inngest/createArticle";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [createArticle],
});
