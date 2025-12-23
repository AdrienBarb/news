import { headers } from "next/headers";
import { auth } from "@/lib/better-auth/auth";
import { redirect } from "next/navigation";
import ThankYouPageClient from "@/components/auth/ThankYouPageClient";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  return <ThankYouPageClient />;
}
