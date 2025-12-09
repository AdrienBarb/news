import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { errorHandler } from "@/lib/errors/errorHandler";
import { errorMessages } from "@/lib/constants/errorMessage";
import { auth } from "@/lib/better-auth/auth";
import { stripe } from "@/lib/stripe/client";

export async function POST(req: NextRequest) {
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
    const plan = body.plan || "annual"; // Default to annual for backward compatibility

    let priceId: string | undefined;
    let mode: "subscription" | "payment";
    let planId: string;

    if (plan === "lifetime") {
      priceId = process.env.STRIPE_PRICE_ID_LIFETIME;
      mode = "payment";
      planId = "lifetime";
    } else {
      priceId = process.env.STRIPE_PRICE_ID_ANNUAL;
      mode = "subscription";
      planId = "annual";
    }

    if (!priceId) {
      return NextResponse.json(
        { error: `Plan not configured for ${plan}` },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // Create Stripe Checkout Session
    const checkoutSessionParams: Stripe.Checkout.SessionCreateParams = {
      mode,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: session.user.email,
      metadata: {
        userId: session.user.id,
        planId,
      },
      success_url: `${baseUrl}/news?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/onboarding?step=7`,
      ...(mode === "subscription" && {
        subscription_data: {
          trial_period_days: 7,
          metadata: {
            userId: session.user.id,
          },
        },
      }),
    };

    const checkoutSession = await stripe.checkout.sessions.create(
      checkoutSessionParams
    );

    return NextResponse.json(
      {
        url: checkoutSession.url,
        sessionId: checkoutSession.id,
      },
      { status: 200 }
    );
  } catch (error) {
    return errorHandler(error);
  }
}
