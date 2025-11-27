import { errorMessages } from "@/lib/constants/errorMessage";
import { errorHandler } from "@/lib/errors/errorHandler";
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/better-auth/auth";
import { createUserTagPreferenceSchema } from "@/lib/schemas/userTagPreference";

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
    const validatedBody = createUserTagPreferenceSchema.parse(body);

    // Create UserTagPreference records with score 0.6
    const preferences = await Promise.all(
      validatedBody.tagIds.map((tagId) =>
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

    return NextResponse.json(
      { message: "Tag preferences saved successfully", preferences },
      { status: 200 }
    );
  } catch (error) {
    return errorHandler(error);
  }
}

