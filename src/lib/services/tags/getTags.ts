import { prisma } from "@/lib/db/prisma";

export async function getTags() {
  return await prisma.tag.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

