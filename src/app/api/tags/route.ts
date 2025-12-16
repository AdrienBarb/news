import { NextResponse } from "next/server";
import { getTags } from "@/lib/services/tags/getTags";
import { errorHandler } from "@/lib/errors/errorHandler";

export async function GET() {
  try {
    const tags = await getTags();
    return NextResponse.json(tags, { status: 200 });
  } catch (error) {
    return errorHandler(error);
  }
}
