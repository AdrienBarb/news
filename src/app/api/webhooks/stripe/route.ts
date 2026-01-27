import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db/prisma";
import { stripe } from "@/lib/stripe/client";
import { inngest } from "@/lib/inngest/client";
import { getRunPackConfig, type RunPackKey } from "@/lib/constants/leadTiers";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return new NextResponse("Missing Stripe signature", { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return new NextResponse("Webhook secret not configured", { status: 500 });
  }

  const buf = Buffer.from(await req.arrayBuffer());

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook error:", message);
    return new NextResponse(`Webhook Error: ${message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.payment_status !== "paid") {
          console.log("⚠️ Payment not completed, skipping");
          break;
        }

        const userId = session.metadata?.userId;
        const runPack = session.metadata?.runPack as RunPackKey | undefined;
        const agentId = session.metadata?.agentId;

        if (!userId || !runPack) {
          console.error("⚠️ Missing userId or runPack in checkout metadata");
          break;
        }

        const packConfig = getRunPackConfig(runPack);

        if (agentId) {
          // Purchase tied to an agent — add runs, deduct 1, launch agent
          const agent = await prisma.aiAgent.findUnique({
            where: { id: agentId },
            select: { id: true, status: true },
          });

          if (!agent) {
            console.error(`⚠️ Agent not found: ${agentId}`);
            break;
          }

          // Add runs to user and deduct 1 for this agent
          await prisma.user.update({
            where: { id: userId },
            data: { remainingRuns: { increment: packConfig.runs - 1 } },
          });

          // Update agent status to QUEUED
          await prisma.aiAgent.update({
            where: { id: agentId },
            data: {
              status: "QUEUED",
              amountPaid: session.amount_total,
            },
          });

          console.log(
            `✅ Agent ${agentId} payment completed. Added ${packConfig.runs} runs, used 1. Status: QUEUED`
          );

          // Trigger the agent run job
          await inngest.send({
            name: "agent/run",
            data: { agentId },
          });

          console.log(`🚀 Triggered agent run job for ${agentId}`);
        } else {
          // Standalone purchase — just add runs, no agent to launch
          await prisma.user.update({
            where: { id: userId },
            data: { remainingRuns: { increment: packConfig.runs } },
          });

          console.log(
            `✅ Standalone purchase: Added ${packConfig.runs} runs for user ${userId}`
          );
        }

        break;
      }

      default:
        break;
    }

    return new NextResponse("ok", { status: 200 });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return new NextResponse("Webhook handler error", { status: 500 });
  }
}
