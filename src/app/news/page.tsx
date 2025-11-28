import { headers } from "next/headers";
import { auth } from "@/lib/better-auth/auth";
import { getOrCreateTodayFeed } from "@/lib/services/feed/feedService";
import UserFeed from "@/components/UserFeed";
import { redirect } from "next/navigation";

export default async function NewsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  const articles = await getOrCreateTodayFeed(session.user.id);

  return <UserFeed articles={articles} />;
}
