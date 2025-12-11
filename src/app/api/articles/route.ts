import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "@/lib/errors/errorHandler";
import { errorMessages } from "@/lib/constants/errorMessage";
import { auth } from "@/lib/better-auth/auth";
import { getAllArticles } from "@/lib/services/articles/getAllArticles";
import { getUserInteractions } from "@/lib/services/interactions/getUserInteractions";

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

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const tagFilter = searchParams.get("tag") || undefined;

    // Validate pagination parameters
    if (page < 1) {
      return NextResponse.json(
        { error: "Page must be greater than 0" },
        { status: 400 }
      );
    }

    if (pageSize < 1 || pageSize > 100) {
      return NextResponse.json(
        { error: "Page size must be between 1 and 100" },
        { status: 400 }
      );
    }

    const result = await getAllArticles(page, pageSize, tagFilter);

    // Fetch user interactions for the articles
    const articleIds = result.articles.map((article) => article.id);
    const { likes, bookmarks } = await getUserInteractions(
      session.user.id,
      articleIds
    );

    return NextResponse.json(
      {
        ...result,
        likes: Array.from(likes),
        bookmarks: Array.from(bookmarks),
      },
      { status: 200 }
    );
  } catch (error) {
    return errorHandler(error);
  }
}
