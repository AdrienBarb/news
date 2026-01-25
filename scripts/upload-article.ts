import { config } from "dotenv";
import { createClient } from "@sanity/client";
import { randomUUID } from "crypto";
import * as fs from "fs";
import * as path from "path";

// Load .env file
config();

// Sanity client with write token
const client = createClient({
  projectId: "o1j15hvr",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN, // Required for write operations
});

async function uploadArticle() {
  // Check for token
  if (!process.env.SANITY_API_TOKEN) {
    console.error("Error: SANITY_API_TOKEN environment variable is required.");
    console.error("\nTo get a token:");
    console.error("1. Go to https://www.sanity.io/manage");
    console.error("2. Select your project (o1j15hvr)");
    console.error("3. Go to API > Tokens");
    console.error('4. Create a token with "Editor" permissions');
    console.error("\nThen run:");
    console.error(
      "  SANITY_API_TOKEN=your_token npx tsx scripts/upload-article.ts"
    );
    process.exit(1);
  }

  // Read the article JSON
  const articlesPath = path.join(process.cwd(), "articles.json");
  const rawData = JSON.parse(fs.readFileSync(articlesPath, "utf-8"));

  // Handle both array and single object formats
  const articles = Array.isArray(rawData) ? rawData : [rawData];

  if (articles.length === 0) {
    console.error("Error: No articles found in articles.json");
    process.exit(1);
  }

  console.log(`Found ${articles.length} article(s). Uploading all...\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < articles.length; i++) {
    const articleData = articles[i];

    if (!articleData._type) {
      console.error(`[${i + 1}/${articles.length}] Skipping: missing _type field`);
      failCount++;
      continue;
    }

    // Generate a unique document ID
    const documentId = randomUUID();
    const draftId = `drafts.${documentId}`;

    // Add the _id to the document
    const document = {
      ...articleData,
      _id: draftId,
    };

    console.log(`[${i + 1}/${articles.length}] Uploading: "${document.title}"`);

    try {
      await client.createOrReplace(document);
      console.log(`    ✓ Success - ${draftId}`);
      successCount++;
    } catch (error) {
      console.error(`    ✗ Failed:`, error instanceof Error ? error.message : error);
      failCount++;
    }
  }

  console.log(`\n--- Summary ---`);
  console.log(`Uploaded: ${successCount}/${articles.length}`);
  if (failCount > 0) {
    console.log(`Failed: ${failCount}`);
  }
  console.log(`\nView drafts in Sanity Studio: https://o1j15hvr.sanity.studio/desk/post`)
}

uploadArticle();
