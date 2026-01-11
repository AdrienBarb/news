import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "@/lib/errors/errorHandler";
import { errorMessages } from "@/lib/constants/errorMessage";
import { auth } from "@/lib/better-auth/auth";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const updateOnboardingSchema = z.object({
  step: z.number().min(1).max(3).optional(),
  websiteUrl: z.string().optional(),
  description: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  competitors: z.array(z.string()).optional(),
});

/**
 * GET /api/onboarding - Get current onboarding state
 */
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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        onboardingStep: true,
        onboardingWebsiteUrl: true,
        onboardingDescription: true,
        onboardingKeywords: true,
        onboardingCompetitors: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: errorMessages.USER_NOT_FOUND },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        step: user.onboardingStep || 1,
        websiteUrl: user.onboardingWebsiteUrl || "",
        description: user.onboardingDescription || "",
        keywords: user.onboardingKeywords || [],
        competitors: user.onboardingCompetitors || [],
      },
      { status: 200 }
    );
  } catch (error) {
    return errorHandler(error);
  }
}

/**
 * PUT /api/onboarding - Update onboarding state
 */
export async function PUT(req: NextRequest) {
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

    const body = await req.json();
    const data = updateOnboardingSchema.parse(body);

    const updateData: {
      onboardingStep?: number;
      onboardingWebsiteUrl?: string;
      onboardingDescription?: string;
      onboardingKeywords?: string[];
      onboardingCompetitors?: string[];
    } = {};

    if (data.step !== undefined) updateData.onboardingStep = data.step;
    if (data.websiteUrl !== undefined)
      updateData.onboardingWebsiteUrl = data.websiteUrl;
    if (data.description !== undefined)
      updateData.onboardingDescription = data.description;
    if (data.keywords !== undefined)
      updateData.onboardingKeywords = data.keywords;
    if (data.competitors !== undefined)
      updateData.onboardingCompetitors = data.competitors;

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        onboardingStep: true,
        onboardingWebsiteUrl: true,
        onboardingDescription: true,
        onboardingKeywords: true,
        onboardingCompetitors: true,
      },
    });

    return NextResponse.json(
      {
        step: user.onboardingStep || 1,
        websiteUrl: user.onboardingWebsiteUrl || "",
        description: user.onboardingDescription || "",
        keywords: user.onboardingKeywords || [],
        competitors: user.onboardingCompetitors || [],
      },
      { status: 200 }
    );
  } catch (error) {
    return errorHandler(error);
  }
}

