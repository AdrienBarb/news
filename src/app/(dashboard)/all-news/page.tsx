import { headers } from "next/headers";
import { auth } from "@/lib/better-auth/auth";
import { getAllArticles } from "@/lib/services/articles/getAllArticles";
import { getUserInteractions } from "@/lib/services/interactions/getUserInteractions";
import AllNewsPageClient from "@/components/AllNewsPageClient";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
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

  const validPage = page >= 1 ? page : 1;

  const { articles, totalPages, total } = await getAllArticles(
    validPage,
    pageSize
  );

  return (
    <AllNewsPageClient
      initialArticles={articles}
      initialPage={validPage}
      initialTotalPages={totalPages}
      initialTotal={total}
    />
  );
}
