import { errorMessages } from "@/lib/constants/errorMessage";
import { errorHandler } from "@/lib/errors/errorHandler";
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/better-auth/auth";
import { z } from "zod";

const updateNewsletterSettingsSchema = z.object({
  newsletterDay: z.string().min(1, "Newsletter day is required"),
  newsletterTime: z.string().min(1, "Newsletter time is required"),
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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        newsletterDay: true,
        newsletterTime: true,
      },
    });

    return NextResponse.json(
      {
        newsletterDay: user?.newsletterDay || "Friday",
        newsletterTime: user?.newsletterTime || "09:00",
      },
      { status: 200 }
    );
  } catch (error) {
    return errorHandler(error);
  }
}

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

    const userId = session.user.id;
    const body = await req.json();
    const validatedBody = updateNewsletterSettingsSchema.parse(body);

    await prisma.user.update({
      where: { id: userId },
      data: {
        newsletterDay: validatedBody.newsletterDay,
        newsletterTime: validatedBody.newsletterTime,
      },
    });

    return NextResponse.json(
      {
        message: "Newsletter settings updated successfully",
        newsletterDay: validatedBody.newsletterDay,
        newsletterTime: validatedBody.newsletterTime,
      },
      { status: 200 }
    );
  } catch (error) {
    return errorHandler(error);
  }
}
