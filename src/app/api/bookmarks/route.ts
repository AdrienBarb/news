import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "@/lib/errors/errorHandler";
import { errorMessages } from "@/lib/constants/errorMessage";
import { auth } from "@/lib/better-auth/auth";
import { getBookmarkedArticles } from "@/lib/services/articles/getBookmarkedArticles";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: errorMessages.UNAUTHORIZED },
        { status: 401 }
      );
    }

    const articles = await getBookmarkedArticles(session.user.id);

    return NextResponse.json({ articles }, { status: 200 });
  } catch (error) {
    return errorHandler(error);
  }
}

