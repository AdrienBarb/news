import { errorMessages } from "@/lib/constants/errorMessage";
import { errorHandler } from "@/lib/errors/errorHandler";
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/better-auth/auth";
import { z } from "zod";
import { computeNextNewsletterAtUtc } from "@/lib/utils/date/computeNextNewsletterAtUtc";
import {
  DEFAULT_NEWSLETTER_DAY,
  DEFAULT_NEWSLETTER_TIME,
} from "@/lib/constants/settings";

const saveOnboardingSchema = z.object({
  tagIds: z.array(z.uuid()).optional(),
  timezone: z.string().optional(),
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

    const updateData: { timezone?: string; nextNewsletterAtUtc?: Date } = {};
    if (validatedBody.timezone) {
      updateData.timezone = validatedBody.timezone;
      updateData.nextNewsletterAtUtc = computeNextNewsletterAtUtc({
        newsletterDay: DEFAULT_NEWSLETTER_DAY,
        newsletterTime: DEFAULT_NEWSLETTER_TIME,
        timezone: validatedBody.timezone,
      });
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });
    }

    // Save tag preferences if provided
    if (validatedBody.tagIds && validatedBody.tagIds.length > 0) {
      await Promise.all(
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
    }

    return NextResponse.json(
      {
        message: "Onboarding data saved successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return errorHandler(error);
  }
}
