import { errorMessages } from "@/lib/constants/errorMessage";
import { errorHandler } from "@/lib/errors/errorHandler";
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/better-auth/auth";
import { z } from "zod";

const updateTagPreferencesSchema = z.object({
  tagIds: z.array(z.string()).optional(),
});

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

    const userId = session.user.id;

    const preferences = await prisma.userTagPreference.findMany({
      where: { userId },
      select: {
        tagId: true,
        tag: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(
      { preferences: preferences.map((p) => p.tag) },
      { status: 200 }
    );
  } catch (error) {
    return errorHandler(error);
  }
}

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
    const validatedBody = updateTagPreferencesSchema.parse(body);

    // If tagIds is provided, update preferences
    if (validatedBody.tagIds !== undefined) {
      // Get current preferences
      const currentPreferences = await prisma.userTagPreference.findMany({
        where: { userId },
        select: { tagId: true },
      });

      const currentTagIds = currentPreferences.map((p) => p.tagId);
      const newTagIds = validatedBody.tagIds;

      // Tags to add (in newTagIds but not in currentTagIds)
      const tagsToAdd = newTagIds.filter(
        (tagId) => !currentTagIds.includes(tagId)
      );

      // Tags to remove (in currentTagIds but not in newTagIds)
      const tagsToRemove = currentTagIds.filter(
        (tagId) => !newTagIds.includes(tagId)
      );

      // Add new preferences
      await Promise.all(
        tagsToAdd.map((tagId) =>
          prisma.userTagPreference.upsert({
            where: {
              userId_tagId: {
                userId,
                tagId,
              },
            },
            create: {
              userId,
              tagId,
              score: 0.6,
            },
            update: {
              score: 0.6,
            },
          })
        )
      );

      // Remove preferences
      await Promise.all(
        tagsToRemove.map((tagId) =>
          prisma.userTagPreference.delete({
            where: {
              userId_tagId: {
                userId,
                tagId,
              },
            },
          })
        )
      );
    }

    return NextResponse.json(
      { message: "Tag preferences updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    return errorHandler(error);
  }
}
