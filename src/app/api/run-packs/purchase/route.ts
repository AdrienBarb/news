import { errorMessages } from "@/lib/constants/errorMessage";
import { errorHandler } from "@/lib/errors/errorHandler";
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe/client";
import { getRunPackConfig, type RunPackKey } from "@/lib/constants/leadTiers";
import { z } from "zod";

const purchaseSchema = z.object({
  runPack: z.enum(["STARTER", "GROWTH", "SCALE"]),
});

/**
 * POST /api/run-packs/purchase - Standalone run pack purchase (no agent tied)
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
    const { runPack } = purchaseSchema.parse(body);
    const packConfig = getRunPackConfig(runPack as RunPackKey);

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
              description: `${packConfig.runs} agent run${packConfig.runs > 1 ? "s" : ""}`,
            },
            unit_amount: packConfig.price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: session.user.id,
        runPack,
      },
      success_url: `${baseUrl}/d?purchased=true`,
      cancel_url: `${baseUrl}/d?canceled=true`,
    });

    return NextResponse.json(
      { checkoutUrl: checkoutSession.url },
      { status: 201 }
    );
  } catch (error) {
    return errorHandler(error);
  }
}
