import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function analyzeArticleWithLLM(input: {
  newArticle: { title: string; summary: string };
  existingArticles: { id: string; title: string; summary: string }[];
  fullContent: string;
  allowedTags: string[];
}) {
  const { newArticle, existingArticles, fullContent, allowedTags } = input;

  const prompt = `
You are an assistant that analyzes tech news.

You have 2 tasks:

1) DUPLICATE DETECTION
Two articles are duplicates if they describe the SAME NEWS EVENT:
- product launch, funding round, acquisition, major announcement, research paper, etc.
Compare "newArticle" against "existingArticles".
If ANY existing article describes the same story, mark isDuplicate=true.

2) ANALYSIS
For the new article, produce:
- "summary": 2–3 sentence summary
- "shortSummary": 1 sentence max 20 words
- "tags": choose 0–4 tags ONLY from this list: ${allowedTags.join(", ")}
- "relevanceScore": number 1–10 based on interest for general tech audience

Return ONLY a JSON object:
{
  "isDuplicate": boolean,
  "duplicateOfId": string or null,
  "analysis": {
    "summary": string,
    "shortSummary": string,
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
