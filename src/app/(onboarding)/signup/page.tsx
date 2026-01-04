import { headers } from "next/headers";
import { auth } from "@/lib/better-auth/auth";
import { redirect } from "next/navigation";
import SignUpPageClient from "@/components/auth/SignUpPageClient";
import { APP_ROUTER } from "@/lib/constants/appRouter";

export default async function SignUpPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If user is already authenticated, redirect to dashboard
  if (session?.user) {
    redirect(APP_ROUTER.MARKETS);
  }

  return <SignUpPageClient />;
}
