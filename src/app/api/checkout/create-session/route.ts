import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { errorHandler } from "@/lib/errors/errorHandler";
import { errorMessages } from "@/lib/constants/errorMessage";
import { auth } from "@/lib/better-auth/auth";
import { stripe } from "@/lib/stripe/client";
import { PlanType } from "@prisma/client";

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
    const plan = body.plan || PlanType.YEAR;
    const successUrl = body.successUrl;
    const cancelUrl = body.cancelUrl;

    let priceId: string | undefined;

    if (plan === PlanType.LIFETIME) {
      priceId = process.env.STRIPE_PRICE_ID_LIFETIME;
    } else {
      priceId = process.env.STRIPE_PRICE_ID_ANNUAL;
    }

    if (!priceId) {
      return NextResponse.json(
        { error: `Plan not configured for ${plan}` },
        { status: 400 }
      );
    }

    const checkoutSessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
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
        plan,
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}${cancelUrl}`,
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
