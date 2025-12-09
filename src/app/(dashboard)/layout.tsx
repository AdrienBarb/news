import { headers } from "next/headers";
import { auth } from "@/lib/better-auth/auth";
import { prisma } from "@/lib/db/prisma";
import { isSubscriptionActive } from "@/lib/utils/subscription";
import SubscriptionModal from "@/components/SubscriptionModal";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  let subscriptionActive = false;

  if (!session?.user) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      planType: true,
      accessExpiresAt: true,
    },
  });

  if (user) {
    subscriptionActive = isSubscriptionActive(
      user.planType,
      user.accessExpiresAt
    );
  }

  return (
    <>
      <main className="flex-1">{children}</main>
      {session?.user && !subscriptionActive && <SubscriptionModal />}
    </>
  );
}
