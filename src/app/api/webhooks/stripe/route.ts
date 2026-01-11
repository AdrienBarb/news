import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db/prisma";
import { stripe } from "@/lib/stripe/client";
import { ACCESS } from "@/lib/constants/subscription";
import { calculateAccessExpiration } from "@/lib/utils/subscription";
import { createMarket } from "@/lib/services/markets/createMarket";

function getPassFromPriceId(priceId: string) {
  return ACCESS.PASSES.find((pass) => pass.stripePriceId === priceId) ?? null;
}

async function getUserByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      accessExpiresAt: true,
      onboardingWebsiteUrl: true,
      onboardingDescription: true,
      onboardingKeywords: true,
      onboardingCompetitors: true,
    },
  });

  if (!user) {
    console.error(`⚠️ No user found with email: ${email}`);
    return null;
  }

  return user;
}

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

        // Get customer email from session (prefer customer_details.email, fallback to customer_email)
        const customerEmail =
          session.customer_details?.email ?? session.customer_email;
        if (!customerEmail) {
          console.error("⚠️ No customer email in checkout session");
          break;
        }

        const user = await getUserByEmail(customerEmail);
        if (!user) {
          break;
        }

        // Get the price ID from line items
        const lineItems = await stripe.checkout.sessions.listLineItems(
          session.id,
          { limit: 1 }
        );
        const priceId = lineItems.data[0]?.price?.id;

        if (!priceId) {
          console.error("⚠️ No price ID found in checkout session");
          break;
        }

        // Find the pass that matches this price ID
        const pass = getPassFromPriceId(priceId);
        if (!pass) {
          console.error(`⚠️ Unknown price ID: ${priceId}, no access granted`);
          break;
        }

        const accessExpiresAt = calculateAccessExpiration(
          pass.durationDays,
          user.accessExpiresAt
        );

        await prisma.user.update({
          where: { id: user.id },
          data: {
            accessExpiresAt,
            accessPassId: pass.id,
          },
        });

        console.log(
          `✅ User ${user.id} purchased ${pass.id}, access expires: ${accessExpiresAt}`
        );

        // Create market from onboarding data if available
        if (user.onboardingWebsiteUrl) {
          try {
            const market = await createMarket({
              userId: user.id,
              data: {
                websiteUrl: user.onboardingWebsiteUrl,
                description: user.onboardingDescription || undefined,
                keywords: user.onboardingKeywords || [],
                competitorUrls: user.onboardingCompetitors || [],
              },
            });

            console.log(`✅ Created market ${market.id} for user ${user.id}`);

            // Clear onboarding state after successful market creation
            await prisma.user.update({
              where: { id: user.id },
              data: {
                onboardingStep: null,
                onboardingWebsiteUrl: null,
                onboardingDescription: null,
                onboardingKeywords: [],
                onboardingCompetitors: [],
              },
            });

            console.log(`✅ Cleared onboarding state for user ${user.id}`);
          } catch (marketError) {
            console.error(
              `⚠️ Failed to create market for user ${user.id}:`,
              marketError
            );
            // Don't fail the webhook - user still has access, they can create market manually
          }
        }

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
