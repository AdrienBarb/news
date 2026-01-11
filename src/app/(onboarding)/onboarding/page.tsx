import { headers } from "next/headers";
import { auth } from "@/lib/better-auth/auth";
import { redirect } from "next/navigation";
import { APP_ROUTER } from "@/lib/constants/appRouter";
import { prisma } from "@/lib/db/prisma";
import { hasActiveAccess } from "@/lib/utils/subscription";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";

export default async function OnboardingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If not logged in, redirect to signup
  if (!session?.user) {
    redirect(APP_ROUTER.SIGNUP);
  }

  // Check if user already has active access and a market
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      accessExpiresAt: true,
      onboardingStep: true,
      onboardingWebsiteUrl: true,
      onboardingDescription: true,
      onboardingKeywords: true,
      onboardingCompetitors: true,
      markets: {
        select: { id: true },
        take: 1,
      },
    },
  });

  // If already has active access and a market, redirect to dashboard
  if (hasActiveAccess(user?.accessExpiresAt) && user?.markets.length) {
    redirect(APP_ROUTER.MARKETS);
  }

  // Get initial onboarding state
  const initialState = {
    step: user?.onboardingStep || 1,
    websiteUrl: user?.onboardingWebsiteUrl || "",
    description: user?.onboardingDescription || "",
    keywords: user?.onboardingKeywords || [],
    competitors: user?.onboardingCompetitors || [],
  };

  return <OnboardingWizard initialState={initialState} />;
}

