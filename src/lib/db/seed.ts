import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const tags = [
  "Artificial Intelligence",
  "Software & Development",
  "Consumer Tech",
  "Startups & Venture Capital",
  "Big Tech Companies",
  "Cybersecurity",
  "Business & Industry Trends",
  "Science & Innovation",
  "Crypto & Web3",
  "Fintech",
];

async function main() {
  console.log("🌱 Seeding tags...");

  for (const tagName of tags) {
    await prisma.tag.upsert({
      where: { name: tagName },
      update: {},
      create: {
        name: tagName,
      },
    });
    console.log(`✅ Created/updated tag: ${tagName}`);
  }

  console.log("✨ Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

