import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function generateTweetForArticle(input: {
  headline: string;
  summary: string;
  link: string;
}) {
  const { headline, summary } = input;

  const MAX_TWEET_LENGTH = 250; // Twitter/X character limit

  const prompt = `
You are creating professional tech news tweets for a serious tech news publication.

Article:
Headline: ${headline}
Summary: ${summary}

CRITICAL REQUIREMENTS - FOLLOW EXACTLY:
1. Format MUST be: [CATEGORY]: [text]
2. Category must be one of: AI NEWS, SOFTWARE, TECH NEWS, SECURITY, STARTUP NEWS, BIG TECH, HARDWARE, or similar appropriate category based on the article content
3. Determine the category based on the article content:
   - AI/ML content → "AI NEWS"
   - Software/apps/platforms → "SOFTWARE"
   - Security/cybersecurity → "SECURITY"
   - Startups/venture capital → "STARTUP NEWS"
   - Major tech companies (Apple, Google, Microsoft, etc.) → "BIG TECH"
   - Hardware/devices → "HARDWARE"
   - General tech news → "TECH NEWS"
4. Write clean, simple, professional text
5. ABSOLUTELY NO EMOJIS - not even one emoji character
6. ABSOLUTELY NO LINKS - no URLs, no "read more", no "learn more", no website mentions
7. ABSOLUTELY NO CALLS TO ACTION - no "check out", no "read more", no "visit", no "click here"
8. Maximum ${MAX_TWEET_LENGTH} characters total (including the [CATEGORY]: part)
9. Be direct and informative
10. Focus on the key news point
11. Professional tone, no casual language
12. Return ONLY the tweet text, nothing else

Example formats (these are perfect examples):
- [AI NEWS]: OpenAI releases new GPT model with improved reasoning capabilities
- [SOFTWARE]: Google Chrome introduces new privacy features for user data protection
- [TECH NEWS]: Apple announces new iPhone with enhanced camera system
- [SECURITY]: Major data breach exposes millions of user credentials

Return ONLY the tweet text in the exact format [CATEGORY]: [text]. Do not include quotes, do not include any explanation, do not include any additional text. Just the tweet itself.
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a professional tech news writer. You MUST return ONLY the tweet text in the format [CATEGORY]: [text]. ABSOLUTELY NO emojis, NO links, NO URLs, NO call-to-actions, NO quotes around the text, NO additional formatting, NO explanations. Just the raw tweet text. Maximum 280 characters. The format must start with [CATEGORY]: followed by a space and then the text.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.5, // Lower temperature for more consistent, rule-following output
    max_tokens: 150,
  });

  const tweetText = completion.choices[0].message.content?.trim() || "";

  return tweetText;
}
