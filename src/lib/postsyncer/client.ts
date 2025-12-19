import { POSTSYNCER_API_URL } from "@/lib/constants/postSyncer";

if (!process.env.POST_SYNCER_API_KEY) {
  throw new Error("POST_SYNCER_API_KEY is not set in environment variables");
}

export interface SchedulePostParams {
  workspaceId: number;
  text: string;
  date: string; // Format: "YYYY-MM-DD"
  time: string; // Format: "HH:MM"
  timezone: string; // e.g., "Europe/Paris"
  accountId: number;
  videoUrl?: string; // Optional video URL for TikTok posts
}

export async function schedulePost(params: SchedulePostParams) {
  const content: { text: string; media?: string[] } = {
    text: params.text,
  };

  // Add video URL if provided
  if (params.videoUrl) {
    content.media = [params.videoUrl];
  }

  const response = await fetch(POSTSYNCER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.POST_SYNCER_API_KEY}`,
    },
    body: JSON.stringify({
      workspace_id: params.workspaceId,
      content: [content],
      schedule_type: "schedule",
      schedule_for: {
        date: params.date,
        time: params.time,
        timezone: params.timezone,
      },
      accounts: [
        {
          id: params.accountId,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `PostSyncer API error: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  return await response.json();
}
