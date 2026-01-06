import { openai } from "@/lib/openai/client";
import { escapeForPrompt } from "@/lib/utils/textSanitizer";
import type { PainType } from "@prisma/client";

export interface ExtractedPainStatement {
  statement: string;
  painType: PainType;
  toolsMentioned: string[];
  switchingIntent: boolean;
  confidence: number;
}

interface MarketContext {
  category: string;
  productDescription?: string;
  competitors?: string[];
  keyPhrases?: string[];
}

/**
 * Check if a conversation is relevant to the market category
 * Returns true only if the conversation is clearly about the target market
 */
async function isConversationRelevant(
  content: string,
  marketContext: MarketContext
): Promise<boolean> {
  const escapedContent = escapeForPrompt(content);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a strict relevance classifier. Your job is to determine if a conversation is about a specific market category.

Target market: "${marketContext.category}"
${marketContext.productDescription ? `Product context: ${marketContext.productDescription}` : ""}
${marketContext.competitors?.length ? `Known competitors in this market: ${marketContext.competitors.join(", ")}` : ""}
${marketContext.keyPhrases?.length ? `Related keywords: ${marketContext.keyPhrases.join(", ")}` : ""}

Rules:
- Return {"relevant": true} ONLY if the conversation is clearly discussing products/tools/topics related to "${marketContext.category}"
- Return {"relevant": false} if the conversation is about a DIFFERENT software category or industry
- Be STRICT: the conversation must be specifically about "${marketContext.category}" or closely related tools/topics, not just any software discussion
- If the conversation mentions any of the known competitors, it is likely relevant
- Generic discussions that don't specifically relate to "${marketContext.category}" should return false`,
      },
      {
        role: "user",
        content: `Is this conversation relevant to "${marketContext.category}"?

Conversation:
${escapedContent.substring(0, 3000)}`,
      },
    ],
  });

  const responseContent = response.choices[0]?.message?.content;
  if (!responseContent) {
    return false;
  }

  try {
    const parsed = JSON.parse(responseContent);
    return parsed.relevant === true;
  } catch {
    return false;
  }
}

/**
 * Extract pain statements from conversation content using OpenAI
 * Uses a two-step approach: first checks relevance, then extracts pain statements
 */
export async function extractPainStatements(
  content: string,
  marketContext: MarketContext
): Promise<ExtractedPainStatement[]> {
  // STEP 1: Check relevance first
  const isRelevant = await isConversationRelevant(content, marketContext);

  if (!isRelevant) {
    console.log(
      `⏭️ Skipping irrelevant conversation for market: ${marketContext.category}`
    );
    return [];
  }

  // STEP 2: Only extract if relevant
  const escapedContent = escapeForPrompt(content);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a market research analyst extracting pain statements from public conversations. 

Your task is to identify and extract distinct pain statements related to the market category: "${marketContext.category}".
${marketContext.productDescription ? `Product context: ${marketContext.productDescription}` : ""}

A pain statement is an expression of:
- Frustration with a product or feature
- A limitation or missing capability
- An unmet expectation
- A comparison between tools (especially negative)
- Intent to switch or abandon a tool
- A feature request or wish
- Pricing concerns
- Support or performance issues

For each pain statement found, return:
- statement: The extracted pain statement (paraphrased for clarity, 1-2 sentences max)
- painType: One of: frustration, limitation, unmet_expectation, comparison, switching_intent, feature_request, pricing, support, performance, other
- toolsMentioned: Array of product/tool names mentioned (only tools relevant to ${marketContext.category})
- switchingIntent: Boolean - true if the user expresses intent to switch tools
- confidence: Float 0.0-1.0 indicating how confident you are this is a genuine pain statement

Guidelines:
- Only extract genuine pain statements, not neutral mentions or positive reviews
- Combine related complaints from the same text into single statements
- Keep statements concise but preserve the essence of the complaint
- Be conservative - only extract clear pain points with confidence > 0.5
- If no relevant pain statements are found, return an empty array

Return JSON: { "painStatements": [...] }`,
      },
      {
        role: "user",
        content: `Extract pain statements from this conversation content.

Market context:
- Category: ${marketContext.category}
${marketContext.competitors?.length ? `- Known competitors: ${marketContext.competitors.join(", ")}` : ""}
${marketContext.keyPhrases?.length ? `- Key phrases: ${marketContext.keyPhrases.join(", ")}` : ""}

Conversation content:
${escapedContent}`,
      },
    ],
  });

  const responseContent = response.choices[0]?.message?.content;
  if (!responseContent) {
    return [];
  }

  try {
    const parsed = JSON.parse(responseContent);
    const statements = parsed.painStatements || [];

    // Validate and filter results
    return statements
      .filter(
        (s: ExtractedPainStatement) =>
          s.statement &&
          s.painType &&
          s.confidence >= 0.5 &&
          s.statement.length >= 10
      )
      .map((s: ExtractedPainStatement) => ({
        statement: s.statement.substring(0, 1000), // Limit statement length
        painType: validatePainType(s.painType),
        toolsMentioned: Array.isArray(s.toolsMentioned)
          ? s.toolsMentioned.slice(0, 10)
          : [],
        switchingIntent: Boolean(s.switchingIntent),
        confidence: Math.min(1, Math.max(0, s.confidence)),
      }));
  } catch (error) {
    console.error("Failed to parse pain statements response:", error);
    return [];
  }
}

/**
 * Validate that painType is a valid enum value
 */
function validatePainType(type: string): PainType {
  const validTypes: PainType[] = [
    "frustration",
    "limitation",
    "unmet_expectation",
    "comparison",
    "switching_intent",
    "feature_request",
    "pricing",
    "support",
    "performance",
    "other",
  ];

  const normalized = type.toLowerCase().replace(/\s+/g, "_");
  return validTypes.includes(normalized as PainType)
    ? (normalized as PainType)
    : "other";
}
