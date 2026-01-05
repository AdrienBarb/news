import { NextResponse } from "next/server";
import { testRedditAccess } from "@/lib/connectors/reddit/client";
import { errorHandler } from "@/lib/errors/errorHandler";

/**
 * Test endpoint to verify Reddit access from the server
 * Checks if Reddit blocks this datacenter IP
 *
 * GET /api/test-reddit
 */
export async function GET() {
  try {
    const result = await testRedditAccess();

    return NextResponse.json(result, {
      status: result.success ? 200 : 503,
    });
  } catch (error) {
    return errorHandler(error);
  }
}

