import { errorMessages } from "@/lib/constants/errorMessage";
import { errorHandler } from "@/lib/errors/errorHandler";
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe/client";
import {
  getTimeWindowConfig,
  type TimeWindow,
} from "@/lib/constants/timeWindow";
import { getLeadTierConfig, type LeadTierKey } from "@/lib/constants/leadTiers";
import { getPlatformConfig, type PlatformKey } from "@/lib/constants/platforms";
import { z } from "zod";

const targetPersonaSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

const createAgentSchema = z.object({
  websiteUrl: z.string().url(),
  description: z.string().optional(),
  keywords: z.array(z.string()).min(1),
  competitors: z.array(z.string()),
  targetPersonas: z.array(targetPersonaSchema).optional(),
  platform: z.enum(["reddit", "hackernews", "twitter", "linkedin"]),
  leadTier: z.enum(["STARTER", "GROWTH", "SCALE"]),
});

/**
 * GET /api/agents - Get all agents for the current user
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: errorMessages.UNAUTHORIZED },
        { status: 401 }
      );
    }

    const agents = await prisma.aiAgent.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        websiteUrl: true,
        description: true,
        keywords: true,
        competitors: true,
        platform: true,
        leadTier: true,
        leadsIncluded: true,
        timeWindow: true, // Keep for backward compatibility
        status: true,
        amountPaid: true,
        createdAt: true,
        completedAt: true,
        _count: {
          select: { leads: true },
        },
      },
    });

    return NextResponse.json(agents, { status: 200 });
  } catch (error) {
    return errorHandler(error);
  }
}

/**
 * POST /api/agents - Create a new agent and redirect to Stripe checkout
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: errorMessages.UNAUTHORIZED },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = createAgentSchema.parse(body);
    console.log("🚀 ~ POST ~ validatedData:", validatedData);

    const tierConfig = getLeadTierConfig(validatedData.leadTier as LeadTierKey);
    const platformConfig = getPlatformConfig(
      validatedData.platform as PlatformKey
    );
    console.log("🚀 ~ POST ~ tierConfig:", tierConfig);
    console.log("🚀 ~ POST ~ platformConfig:", platformConfig);

    // Create the agent with PENDING_PAYMENT status
    const agent = await prisma.aiAgent.create({
      data: {
        userId: session.user.id,
        websiteUrl: validatedData.websiteUrl,
        description: validatedData.description,
        keywords: validatedData.keywords,
        competitors: validatedData.competitors,
        targetPersonas: validatedData.targetPersonas || [],
        platform: validatedData.platform,
        leadTier: validatedData.leadTier,
        leadsIncluded: tierConfig.leadsIncluded,
        status: "PENDING_PAYMENT",
      },
    });

    // Create Stripe checkout session
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: session.user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Lead Finder - ${tierConfig.label}`,
              description: `${tierConfig.leadsIncluded} qualified leads from ${platformConfig.label} for ${validatedData.websiteUrl}`,
            },
            unit_amount: tierConfig.price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        agentId: agent.id,
        userId: session.user.id,
      },
      success_url: `${baseUrl}/d/agents/${agent.id}?success=true`,
      cancel_url: `${baseUrl}/d?canceled=true`,
    });

    // Update agent with Stripe session ID
    await prisma.aiAgent.update({
      where: { id: agent.id },
      data: { stripeSessionId: checkoutSession.id },
    });

    return NextResponse.json(
      { checkoutUrl: checkoutSession.url, agentId: agent.id },
      { status: 201 }
    );
  } catch (error) {
    return errorHandler(error);
  }
}
