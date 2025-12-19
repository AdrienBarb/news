import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "@/lib/errors/errorHandler";
import { prisma } from "@/lib/db/prisma";
import { schedulePost } from "@/lib/postsyncer/client";
import {
  POSTSYNCER_WORKSPACE_ID,
  POSTSYNCER_TIKTOK_ACCOUNT_ID,
  POSTSYNCER_TIMEZONE,
  POSTSYNCER_INSTAGRAM_ACCOUNT_ID,
} from "@/lib/constants/postSyncer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Handle Revid webhook callback
    // This will be called when the video generation is complete
    console.log("📹 Revid webhook received:", body);

    const { pid, videoUrl } = body;

    if (!pid || !videoUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing pid or videoUrl in webhook payload",
        },
        { status: 400 }
      );
    }

    // Find the TikTok post by pid
    const tiktokPost = await prisma.tiktokPost.findUnique({
      where: { pid },
      select: {
        id: true,
        pid: true,
        postText: true,
        videoUrl: true,
        scheduledDate: true,
        scheduledTime: true,
      },
    });

    if (!tiktokPost) {
      console.error(`TikTok post not found for pid: ${pid}`);
      return NextResponse.json(
        {
          success: false,
          error: "TikTok post not found",
        },
        { status: 404 }
      );
    }

    // Update the TikTok post with video URL
    await prisma.tiktokPost.update({
      where: { pid },
      data: { videoUrl },
    });

    // Schedule the post via PostSyncer using the saved scheduled date and time
    if (!tiktokPost.scheduledDate || !tiktokPost.scheduledTime) {
      console.error(
        `❌ TikTok post ${pid} missing scheduledDate or scheduledTime`
      );
      return NextResponse.json(
        {
          success: false,
          error: "TikTok post missing scheduled date or time",
        },
        { status: 400 }
      );
    }

    try {
      await schedulePost({
        workspaceId: POSTSYNCER_WORKSPACE_ID,
        text: tiktokPost.postText,
        date: tiktokPost.scheduledDate,
        time: tiktokPost.scheduledTime,
        timezone: POSTSYNCER_TIMEZONE,
        accountId: POSTSYNCER_TIKTOK_ACCOUNT_ID,
        videoUrl: videoUrl,
      });

      await schedulePost({
        workspaceId: POSTSYNCER_WORKSPACE_ID,
        text: tiktokPost.postText,
        date: tiktokPost.scheduledDate,
        time: tiktokPost.scheduledTime,
        timezone: POSTSYNCER_TIMEZONE,
        accountId: POSTSYNCER_INSTAGRAM_ACCOUNT_ID,
        videoUrl: videoUrl,
      });

      console.log(
        `✅ TikTok post scheduled for pid: ${pid} at ${tiktokPost.scheduledDate} ${tiktokPost.scheduledTime}`
      );
    } catch (error) {
      console.error(`❌ Error scheduling TikTok post for pid ${pid}:`, error);
      // Don't fail the webhook if scheduling fails - we can retry later
    }

    return NextResponse.json(
      {
        success: true,
        message: "Webhook processed successfully",
        pid,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing Revid webhook:", error);
    return errorHandler(error);
  }
}
