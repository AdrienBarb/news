import { headers } from "next/headers";
import { auth } from "@/lib/better-auth/auth";
import { redirect } from "next/navigation";
import { APP_ROUTER } from "@/lib/constants/appRouter";
import { prisma } from "@/lib/db/prisma";
import { hasActiveAccess } from "@/lib/utils/subscription";
import SuccessPageClient from "@/components/onboarding/SuccessPageClient";

export default async function SuccessPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If not logged in, redirect to signup
  if (!session?.user) {
    redirect(APP_ROUTER.SIGNUP);
  }

  // Get user and their most recent market
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      accessExpiresAt: true,
      markets: {
        select: { id: true, status: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  // If user has active access and a market that's ready, redirect immediately
  if (
    hasActiveAccess(user?.accessExpiresAt) &&
    user?.markets.length &&
    user.markets[0].status === "active"
  ) {
    redirect(`/markets/${user.markets[0].id}`);
  }

  // If no active access at all, redirect to onboarding
  if (!hasActiveAccess(user?.accessExpiresAt)) {
    redirect(APP_ROUTER.ONBOARDING);
  }

  // Show loading page while waiting for market to be ready
  return <SuccessPageClient />;
}
