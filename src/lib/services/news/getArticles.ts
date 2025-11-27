import { prisma } from "@/lib/db/prisma";

export async function getArticles() {
  return await prisma.article.findMany({
    orderBy: {
      publishedAt: "desc",
    },
    take: 10,
  });
}
