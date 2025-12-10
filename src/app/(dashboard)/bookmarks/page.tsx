import { headers } from "next/headers";
import { auth } from "@/lib/better-auth/auth";
import { getBookmarkedArticles } from "@/lib/services/articles/getBookmarkedArticles";
import { redirect } from "next/navigation";
import BookmarkedArticlesList from "@/components/BookmarkedArticlesList";

export default async function BookmarksPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  const articles = await getBookmarkedArticles(session.user.id);

  return <BookmarkedArticlesList articles={articles} />;
}
