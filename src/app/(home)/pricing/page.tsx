import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/better-auth/auth";
import { prisma } from "@/lib/db/prisma";
import { isSubscriptionActive } from "@/lib/utils/subscription";
import { APP_ROUTER } from "@/lib/constants/appRouter";
import PricingPageClient from "@/components/pricing/PricingPageClient";

export default async function PricingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If not logged in, redirect to signup
  if (!session?.user) {
    redirect(APP_ROUTER.SIGNUP);
  }

  // Check if user already has an active subscription
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      isSubscribed: true,
    },
  });

  // If already subscribed, redirect to dashboard
  if (isSubscriptionActive(user?.isSubscribed)) {
    redirect(APP_ROUTER.DASHBOARD);
  }

  return <PricingPageClient />;
}
