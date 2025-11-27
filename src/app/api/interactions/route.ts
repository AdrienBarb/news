import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "@/lib/errors/errorHandler";
import { errorMessages } from "@/lib/constants/errorMessage";
import { auth } from "@/lib/better-auth/auth";
import { createInteractionSchema } from "@/lib/schemas/interactions/createInteractionSchema";
import { classifyInteractionType } from "@/lib/utils/interactions/classifyInteractionType";
import { createInteraction } from "@/lib/services/interactions/createInteraction";
import { getArticleWithTags } from "@/lib/services/articles/getArticleWithTags";
import { updateUserTagPreferencesFromInteraction } from "@/lib/services/userTagPreferences/updateUserTagPreferencesFromInteraction";

export async function POST(req: NextRequest) {
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

    const userId = session.user.id;
    const body = await req.json();
    const validatedBody = createInteractionSchema.parse(body);

    const article = await getArticleWithTags(validatedBody.articleId);

    if (!article) {
      return NextResponse.json(
        { error: errorMessages.ARTICLE_NOT_FOUND },
        { status: 404 }
      );
    }

    const interactionType = classifyInteractionType({
      dwellTimeMs: validatedBody.dwellTimeMs,
      reaction: validatedBody.reaction,
    });

    await createInteraction({
      userId,
      articleId: validatedBody.articleId,
      interactionType,
      dwellTimeMs: validatedBody.dwellTimeMs,
    });

    await updateUserTagPreferencesFromInteraction({
      userId,
      article,
      interactionType,
      dwellTimeMs: validatedBody.dwellTimeMs,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return errorHandler(error);
  }
}
