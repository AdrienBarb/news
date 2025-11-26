import { errorHandler } from "@/lib/errors/errorHandler";
import { NextResponse, NextRequest } from "next/server";
import { inngest } from "@/lib/inngest/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("🚀 ~ POST ~ body:", body);

    // Handle each entry in new_entries
    if (body.new_entries && Array.isArray(body.new_entries)) {
      for (const entry of body.new_entries) {
        // Extract article content from the entry link
        if (entry.title && entry.link) {
          await inngest.send({
            name: "news/article.received",
            data: {
              title: entry.title,
              description: entry.description,
              link: entry.link,
              publishedAt: entry.time,
              source: body.feed.title,
              guid: entry.guid,
            },
          });
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    return errorHandler(error);
  }
}
