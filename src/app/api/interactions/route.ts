import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "@/lib/errors/errorHandler";
import { errorMessages } from "@/lib/constants/errorMessage";
import { auth } from "@/lib/better-auth/auth";
import { createInteractionSchema } from "@/lib/schemas/interactions/createInteractionSchema";
import { classifyViewInteractionType } from "@/lib/utils/interactions/classifyInteractionType";
import { createInteraction } from "@/lib/services/interactions/createInteraction";
import { getArticleWithTags } from "@/lib/services/articles/getArticleWithTags";
import { updateUserTagPreferencesFromInteraction } from "@/lib/services/userTagPreferences/updateUserTagPreferencesFromInteraction";
import { InteractionType } from "@prisma/client";

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

    const interactionsToCreate: InteractionType[] = [];
    const timestamp = new Date();

    // Determine which interactions should be created
    if (validatedBody.isLiked) {
      interactionsToCreate.push(InteractionType.like);
    }

    if (validatedBody.isBookmarked) {
      interactionsToCreate.push(InteractionType.bookmark);
    }

    // Determine view interaction type based on dwell time
    // Only add if user didn't explicitly like or bookmark
    if (!validatedBody.isLiked && !validatedBody.isBookmarked) {
      const viewInteractionType = classifyViewInteractionType(
        validatedBody.dwellTimeMs
      );
      interactionsToCreate.push(viewInteractionType);
    }

    // Create all interactions in parallel
    await Promise.all(
      interactionsToCreate.map((interactionType) =>
        createInteraction({
          userId,
          articleId: validatedBody.articleId,
          interactionType,
          dwellTimeMs: validatedBody.dwellTimeMs,
        })
      )
    );

    // Update tag preferences for each interaction
    await Promise.all(
      interactionsToCreate.map((interactionType) =>
        updateUserTagPreferencesFromInteraction({
          userId,
          article,
          interactionType,
          dwellTimeMs: validatedBody.dwellTimeMs,
          timestamp,
        })
      )
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return errorHandler(error);
  }
}
