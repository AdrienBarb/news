import { Readability } from "@mozilla/readability";
import axios from "axios";

export async function extractArticleContent(url: string) {
  try {
    // Fetch the webpage
    const response = await axios.get(url, {
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

    // Dynamically import JSDOM to avoid ESM/CommonJS compatibility issues
    const { JSDOM } = await import("jsdom");

    // Parse HTML with JSDOM
    const dom = new JSDOM(html, {
      url,
      runScripts: "outside-only",
    });

    // Extract article content using Readability
    const reader = new Readability(dom.window.document);
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
