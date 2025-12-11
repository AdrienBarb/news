import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function analyzeArticleWithLLM(input: {
  newArticle: { title: string; summary: string };
  existingArticles: { id: string; headline?: string | null; summary: string }[];
  fullContent: string;
  allowedTags: string[];
}) {
  const { newArticle, existingArticles, fullContent, allowedTags } = input;

  const prompt = `
You are an assistant that analyzes tech news for a learning app.

Goal of the app:
- Help people quickly learn important things happening in technology.
- Focus on ideas, innovations, trends, and meaningful business moves.
- NOT about shopping, discounts, or generic "best deals" content.

You have 2 tasks:

1) DUPLICATE DETECTION
Two articles are duplicates if they describe the SAME UNDERLYING NEWS EVENT, for example:
- the same product launch or major feature release
- the same funding round or acquisition
- the same research result or regulation announcement
Even if wording or details differ, if the news event is the same, it's a duplicate.

Compare "newArticle" to "existingArticles".
If ANY existing article describes the same event, set:
- "isDuplicate": true
- "duplicateOfId": the id of the best matching existing article
Otherwise:
- "isDuplicate": false
- "duplicateOfId": null

2) ANALYSIS
For the new article, produce:

- "headline":
  - A short, punchy, human-friendly title.
  - Start directly with the subject, e.g.:
    - "Apple launches a new AI-powered keyboard"
    - "Researchers discover a faster way to train neural networks"
    - "A new tool helps developers automate browser tests"
  - No fluff, no clickbait, no "the article".

- "summary":
  - 1–3 short sentences.
  - Simple, clear language that anyone can understand.
  - Write as if explaining to a smart 15-year-old.
  - NEVER start with phrases like "The article", "This article", "This piece".
  - Start directly with the subject.

- "tags":
  - Choose 0–4 tags ONLY from this EXACT list: ${allowedTags.join(", ")}
  - You MUST use the EXACT tag names as provided. Do not modify, abbreviate, or create variations.
  - If nothing fits, return [].
  - Example: If the list contains "Science & Innovation", use exactly "Science & Innovation", not "Science", "Innovation", or "Health & Medicine".

- "relevanceScore":
  - A number 1–10.
  - It measures how useful the article is for learning interesting things about technology.
  - Scale:
    9–10: Must-read — major breakthroughs, major launches, major regulations, huge funding/acquisitions.
    7–8: Solid, meaningful tech news.
    4–6: Niche or light.
    1–3: Low value — deals, discounts, shopping guides, price-only content.
  - Example: "The best Black Friday camera and drone deals" → relevance 1–3.

Return ONLY this JSON:
{
  "isDuplicate": boolean,
  "duplicateOfId": string or null,
  "analysis": {
    "headline": string,
    "summary": string,
    "tags": string[],
    "relevanceScore": number
  }
}
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: "You respond with valid JSON only." },
      {
        role: "user",
        content: JSON.stringify({
          prompt,
          newArticle,
          existingArticles,
          fullContent: fullContent.slice(0, 8000),
        }),
      },
    ],
  });

  return JSON.parse(completion.choices[0].message.content || "{}");
}
