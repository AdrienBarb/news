import { Readability } from "@mozilla/readability";
import axios from "axios";

export async function extractArticleContent(url: string) {
  try {
    // Validate and normalize URL using WHATWG URL API to avoid deprecation warnings
    const validatedUrl = new URL(url).href;

    // Fetch the webpage
    const response = await axios.get(validatedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 10000, // 10 second timeout
    });

    // Remove <style> tags and stylesheet links to avoid CSS parsing errors
    let html = response.data;
    html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
    html = html.replace(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi, "");

    // Use linkedom instead of jsdom to avoid ESM/CommonJS compatibility issues in serverless
    const { parseHTML } = await import("linkedom");

    // Parse HTML with linkedom - returns { document, defaultView }
    const { document } = parseHTML(html);

    // Extract article content using Readability
    const reader = new Readability(document);
    const article = reader.parse();

    if (!article?.textContent) {
      return null;
    }

    return article.textContent;
  } catch (error) {
    console.error(`Error extracting content from ${url}:`, error);
    return null;
  }
}
