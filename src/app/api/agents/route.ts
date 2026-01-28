import { errorMessages } from "@/lib/constants/errorMessage";
import { errorHandler } from "@/lib/errors/errorHandler";
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe/client";
import { getRunPackConfig, type RunPackKey } from "@/lib/constants/leadTiers";
import { getPlatformConfig, type PlatformKey } from "@/lib/constants/platforms";
import { inngest } from "@/lib/inngest/client";
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
  runPack: z.enum(["STARTER", "GROWTH", "SCALE"]).optional(),
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
 * POST /api/agents - Create a new agent
 * - With runPack: user has 0 runs → create PENDING_PAYMENT + Stripe checkout
 * - Without runPack: user has runs → deduct 1 run, create QUEUED, trigger Inngest
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
    if (validatedData.runPack) {
      // Flow A: User needs to buy runs first
      const packConfig = getRunPackConfig(validatedData.runPack as RunPackKey);

      const agent = await prisma.aiAgent.create({
        data: {
          userId: session.user.id,
          websiteUrl: validatedData.websiteUrl,
          description: validatedData.description,
          keywords: validatedData.keywords,
          competitors: validatedData.competitors,
          targetPersonas: validatedData.targetPersonas || [],
          platform: validatedData.platform,
          leadTier: validatedData.runPack,
          status: "PENDING_PAYMENT",
        },
      });

      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

      const checkoutSession = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: session.user.email,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Run Pack - ${packConfig.label}`,
                description: `${packConfig.runs} agent run${packConfig.runs > 1 ? "s" : ""} · ${packConfig.estimatedLeads}`,
              },
              unit_amount: packConfig.price,
            },
            quantity: 1,
          },
        ],
        metadata: {
          agentId: agent.id,
          userId: session.user.id,
          runPack: validatedData.runPack,
        },
        success_url: `${baseUrl}/d/agents/${agent.id}?success=true`,
        cancel_url: `${baseUrl}/d?canceled=true`,
      });

      await prisma.aiAgent.update({
        where: { id: agent.id },
        data: { stripeSessionId: checkoutSession.id },
      });

      return NextResponse.json(
        { checkoutUrl: checkoutSession.url, agentId: agent.id },
        { status: 201 }
      );
    } else {
      // Flow B: User has runs available — deduct 1 and launch
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { remainingRuns: true },
      });

      if (!user || user.remainingRuns < 1) {
        return NextResponse.json(
          { error: "No runs remaining. Please purchase a run pack." },
          { status: 400 }
        );
      }

      // Atomically deduct 1 run and create agent
      const [agent] = await prisma.$transaction([
        prisma.aiAgent.create({
          data: {
            userId: session.user.id,
            websiteUrl: validatedData.websiteUrl,
            description: validatedData.description,
            keywords: validatedData.keywords,
            competitors: validatedData.competitors,
            targetPersonas: validatedData.targetPersonas || [],
            platform: validatedData.platform,
            status: "QUEUED",
          },
        }),
        prisma.user.update({
          where: { id: session.user.id },
          data: { remainingRuns: { decrement: 1 } },
        }),
      ]);

      console.log("🚀 ~ POST ~ agent:", agent);

      // Trigger Inngest
      await inngest.send({
        name: "agent/run",
        data: { agentId: agent.id },
      });

      return NextResponse.json({ agentId: agent.id }, { status: 201 });
    }
  } catch (error) {
    return errorHandler(error);
  }
}
