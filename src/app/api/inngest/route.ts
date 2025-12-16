import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { createArticle } from "@/lib/inngest/createArticle";
import { sendNewsletter } from "@/lib/inngest/sendNewsletter";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [createArticle, sendNewsletter],
});
