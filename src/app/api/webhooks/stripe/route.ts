import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db/prisma";
import { stripe } from "@/lib/stripe/client";
import { inngest } from "@/lib/inngest/client";

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
      // Handle successful one-time payment (checkout session completed)
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Only process completed payments
        if (session.payment_status !== "paid") {
          console.log("⚠️ Payment not completed, skipping");
          break;
        }

        // Get agent ID from metadata
        const agentId = session.metadata?.agentId;
        if (!agentId) {
          console.error("⚠️ No agentId in checkout session metadata");
          break;
        }

        // Verify agent exists
        const agent = await prisma.aiAgent.findUnique({
          where: { id: agentId },
          select: { id: true, status: true },
        });

        if (!agent) {
          console.error(`⚠️ Agent not found: ${agentId}`);
          break;
        }

        // Update agent status to QUEUED and save payment amount
        await prisma.aiAgent.update({
          where: { id: agentId },
          data: {
            status: "QUEUED",
            amountPaid: session.amount_total,
          },
        });

        console.log(`✅ Agent ${agentId} payment completed, status: QUEUED`);

        // Trigger the agent run job
        await inngest.send({
          name: "agent/run",
          data: { agentId },
        });

        console.log(`🚀 Triggered agent run job for ${agentId}`);

        break;
      }

      default:
        // Unhandled event type
        break;
    }

    return new NextResponse("ok", { status: 200 });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return new NextResponse("Webhook handler error", { status: 500 });
  }
}
