import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { createArticle } from "@/lib/inngest/createArticle";
import { sendNewsletter } from "@/lib/inngest/sendNewsletter";
import { tweetPostAutomation } from "@/lib/inngest/tweetPostAutomation";
import { postTikTokAutomation } from "@/lib/inngest/postTikTokWeekday";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    createArticle,
    sendNewsletter,
    tweetPostAutomation,
    postTikTokAutomation,
  ],
});
