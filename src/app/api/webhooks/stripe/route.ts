import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { addYears } from "date-fns";
import { prisma } from "@/lib/db/prisma";
import { stripe } from "@/lib/stripe/client";
import { PlanType } from "@prisma/client";

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

  console.log("🚀 ~ POST ~ event:", event);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;

        if (!userId || !plan) {
          console.error("⚠️ Missing userId or plan in session metadata", {
            userId,
            plan,
          });
          break;
        }

        await prisma.user.update({
          where: { id: userId },
          data: {
            planType: plan as PlanType,
            accessExpiresAt:
              plan === PlanType.YEAR ? addYears(new Date(), 1) : null,
          },
        });
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
