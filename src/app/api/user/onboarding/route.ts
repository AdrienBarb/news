import { errorMessages } from "@/lib/constants/errorMessage";
import { errorHandler } from "@/lib/errors/errorHandler";
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/better-auth/auth";
import { z } from "zod";

const saveOnboardingSchema = z.object({
  techLevel: z.string().nullable().optional(),
  motivation: z.string().nullable().optional(),
  depthPreference: z.string().nullable().optional(),
  dailyTime: z.string().nullable().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

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
    const validatedBody = saveOnboardingSchema.parse(body);

    // Update user with onboarding data
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        techLevel: validatedBody.techLevel ?? undefined,
        motivation: validatedBody.motivation ?? undefined,
        depthPreference: validatedBody.depthPreference ?? undefined,
        dailyTime: validatedBody.dailyTime ?? undefined,
      },
    });

    // Save tag preferences if tagIds are provided
    const preferences = [];
    if (validatedBody.tagIds && validatedBody.tagIds.length > 0) {
      const savedPreferences = await Promise.all(
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
      preferences.push(...savedPreferences);
    }

    return NextResponse.json(
      {
        message: "Onboarding data saved successfully",
        preferences,
      },
      { status: 200 }
    );
  } catch (error) {
    return errorHandler(error);
  }
}
