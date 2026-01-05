import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db/prisma";
import { stripe } from "@/lib/stripe/client";

async function getCustomerEmail(
  customerId: string | Stripe.Customer | Stripe.DeletedCustomer
): Promise<string | null> {
  const id = typeof customerId === "string" ? customerId : customerId.id;
  const customer = await stripe.customers.retrieve(id);

  if (customer.deleted) {
    return null;
  }

  return customer.email;
}

async function getUserByCustomerEmail(
  customerId: string | Stripe.Customer | Stripe.DeletedCustomer
) {
  const email = await getCustomerEmail(customerId);

  if (!email) {
    console.error("⚠️ Could not retrieve customer email from Stripe");
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
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

  console.log("🚀 Stripe webhook event:", event.type);
  console.log("🚀 ~ POST ~ event:", event);

  try {
    switch (event.type) {
      // Handle subscription created or updated
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("🚀 ~ POST ~ subscription:", subscription);
        const user = await getUserByCustomerEmail(subscription.customer);

        if (!user) {
          break;
        }

        // Subscription is active if status is "active" or "trialing"
        const isActive =
          subscription.status === "active" ||
          subscription.status === "trialing";

        const stripeCustomerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;

        // Get the price ID from the first subscription item
        const stripePriceId = subscription.items.data[0]?.price.id ?? null;
        console.log("🚀 ~ POST ~ subscription.items:", subscription.items);

        await prisma.user.update({
          where: { id: user.id },
          data: {
            isSubscribed: isActive,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId,
            stripePriceId,
          },
        });

        // If subscription became active, resume any paused markets
        if (isActive) {
          await prisma.market.updateMany({
            where: {
              userId: user.id,
              status: "paused",
            },
            data: {
              status: "active",
            },
          });
          console.log(
            `✅ User ${user.id} subscription active, markets resumed`
          );
        }

        console.log(
          `✅ User ${user.id} subscription updated: isSubscribed=${isActive}`
        );
        break;
      }

      // Handle subscription cancelled or expired
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const user = await getUserByCustomerEmail(subscription.customer);

        if (!user) {
          break;
        }

        // Update user subscription status
        await prisma.user.update({
          where: { id: user.id },
          data: {
            isSubscribed: false,
            stripeSubscriptionId: null,
          },
        });

        // Pause all active markets for this user
        await prisma.market.updateMany({
          where: {
            userId: user.id,
            status: "active",
          },
          data: {
            status: "paused",
          },
        });

        console.log(
          `✅ User ${user.id} subscription cancelled, markets paused`
        );
        break;
      }

      // Handle subscription paused
      case "customer.subscription.paused": {
        const subscription = event.data.object as Stripe.Subscription;
        const user = await getUserByCustomerEmail(subscription.customer);

        if (!user) {
          break;
        }

        // Update user subscription status
        await prisma.user.update({
          where: { id: user.id },
          data: {
            isSubscribed: false,
          },
        });

        // Pause all active markets for this user
        await prisma.market.updateMany({
          where: {
            userId: user.id,
            status: "active",
          },
          data: {
            status: "paused",
          },
        });

        console.log(`✅ User ${user.id} subscription paused, markets paused`);
        break;
      }

      // Handle subscription resumed
      case "customer.subscription.resumed": {
        const subscription = event.data.object as Stripe.Subscription;
        const user = await getUserByCustomerEmail(subscription.customer);

        if (!user) {
          break;
        }

        // Update user subscription status
        await prisma.user.update({
          where: { id: user.id },
          data: {
            isSubscribed: true,
          },
        });

        // Resume all paused markets for this user
        await prisma.market.updateMany({
          where: {
            userId: user.id,
            status: "paused",
          },
          data: {
            status: "active",
          },
        });

        console.log(
          `✅ User ${user.id} subscription resumed, markets reactivated`
        );
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
