import { errorMessages } from "@/lib/constants/errorMessage";
import { errorHandler } from "@/lib/errors/errorHandler";
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/better-auth/auth";
import { z } from "zod";

const updateTimezoneSchema = z.object({
  timezone: z.string().min(1, "Timezone is required"),
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
        timezone: true,
      },
    });

    return NextResponse.json(
      { timezone: user?.timezone || null },
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
    const validatedBody = updateTimezoneSchema.parse(body);

    await prisma.user.update({
      where: { id: userId },
      data: {
        timezone: validatedBody.timezone,
      },
    });

    return NextResponse.json(
      {
        message: "Timezone updated successfully",
        timezone: validatedBody.timezone,
      },
      { status: 200 }
    );
  } catch (error) {
    return errorHandler(error);
  }
}
