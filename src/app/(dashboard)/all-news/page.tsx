import { headers } from "next/headers";
import { auth } from "@/lib/better-auth/auth";
import { getAllArticles } from "@/lib/services/articles/getAllArticles";
import { getTags } from "@/lib/services/tags/getTags";
import AllNewsPageClient from "@/components/AllNewsPageClient";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{ page?: string; tag?: string }>;
}

export default async function AllNewsPage({ searchParams }: PageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const pageSize = 10;
  const tag = params.tag || undefined;

  const validPage = page >= 1 ? page : 1;

  const [articles, tags] = await Promise.all([
    getAllArticles(validPage, pageSize, tag),
    getTags(),
  ]);

  return (
    <AllNewsPageClient
      initialArticles={articles.articles}
      initialPage={validPage}
      initialTotalPages={articles.totalPages}
      initialTotal={articles.total}
      initialTag={tag || null}
      allTags={tags}
    />
  );
}
