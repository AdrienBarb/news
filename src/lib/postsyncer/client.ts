if (!process.env.POST_SYNCER_API_KEY) {
  throw new Error("POST_SYNCER_API_KEY is not set in environment variables");
}

export const POSTSYNCER_API_URL = "https://postsyncer.com/api/v1/posts";

export interface SchedulePostParams {
  workspaceId: number;
  text: string;
  date: string; // Format: "YYYY-MM-DD"
  time: string; // Format: "HH:MM"
  timezone: string; // e.g., "Europe/Paris"
  accountId: number;
}

export interface PublishNowPostParams {
  workspaceId: number;
  text: string;
  videoUrl: string;
  accountId: number;
}

export async function schedulePost(params: SchedulePostParams) {
  const response = await fetch(POSTSYNCER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.POST_SYNCER_API_KEY}`,
    },
    body: JSON.stringify({
      workspace_id: params.workspaceId,
      content: [
        {
          text: params.text,
        },
      ],
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

export async function publishNowPost(params: PublishNowPostParams) {
  const response = await fetch(POSTSYNCER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.POST_SYNCER_API_KEY}`,
    },
    body: JSON.stringify({
      workspace_id: params.workspaceId,
      content: [
        {
          text: params.text,
          media: [params.videoUrl],
        },
      ],
      schedule_type: "publish_now",
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
