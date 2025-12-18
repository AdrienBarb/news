import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "@/lib/errors/errorHandler";
import { prisma } from "@/lib/db/prisma";
import { publishNowPost } from "@/lib/postsyncer/client";

// Configuration - can be moved to env vars if needed
const POSTSYNCER_WORKSPACE_ID = 21425;
const POSTSYNCER_TIKTOK_ACCOUNT_ID = 3776;

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

    // Schedule the post via PostSyncer (publish immediately)
    try {
      await publishNowPost({
        workspaceId: POSTSYNCER_WORKSPACE_ID,
        text: tiktokPost.postText,
        videoUrl: videoUrl,
        accountId: POSTSYNCER_TIKTOK_ACCOUNT_ID,
      });

      console.log(`✅ TikTok post scheduled for pid: ${pid}`);
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
