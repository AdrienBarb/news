import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "@/lib/errors/errorHandler";
import { errorMessages } from "@/lib/constants/errorMessage";
import { auth } from "@/lib/better-auth/auth";
import { createInteractionSchema } from "@/lib/schemas/interactions/createInteractionSchema";
import { createInteraction, deleteInteraction } from "@/lib/services/interactions/createInteraction";
import { getArticleWithTags } from "@/lib/services/articles/getArticleWithTags";
import { updateUserTagPreferencesFromInteraction } from "@/lib/services/userTagPreferences/updateUserTagPreferencesFromInteraction";
import { InteractionType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

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
    const interactionsToDelete: InteractionType[] = [];
    const timestamp = new Date();

    if (validatedBody.isLiked) {
      interactionsToCreate.push(InteractionType.like);
    } else {
      const existingLike = await prisma.userArticleInteraction.findUnique({
        where: {
          userId_articleId_interactionType: {
            userId,
            articleId: validatedBody.articleId,
            interactionType: InteractionType.like,
          },
        },
      });
      if (existingLike) {
        interactionsToDelete.push(InteractionType.like);
      }
    }

    if (validatedBody.isBookmarked) {
      interactionsToCreate.push(InteractionType.bookmark);
    } else {
      const existingBookmark = await prisma.userArticleInteraction.findUnique({
        where: {
          userId_articleId_interactionType: {
            userId,
            articleId: validatedBody.articleId,
            interactionType: InteractionType.bookmark,
          },
        },
      });
      if (existingBookmark) {
        interactionsToDelete.push(InteractionType.bookmark);
      }
    }

    await Promise.all(
      interactionsToDelete.map((interactionType) =>
        deleteInteraction({
          userId,
          articleId: validatedBody.articleId,
          interactionType,
        })
      )
    );

    await Promise.all(
      interactionsToCreate.map((interactionType) =>
        createInteraction({
          userId,
          articleId: validatedBody.articleId,
          interactionType,
        })
      )
    );

    await Promise.all(
      interactionsToCreate.map((interactionType) =>
        updateUserTagPreferencesFromInteraction({
          userId,
          article,
          interactionType,
          timestamp,
        })
      )
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return errorHandler(error);
  }
}
