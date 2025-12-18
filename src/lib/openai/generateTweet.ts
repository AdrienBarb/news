import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function generateTweetForArticle(input: {
  headline: string;
  summary: string;
  link: string;
}) {
  const { headline, summary } = input;

  const READ_MORE_LINK = " read more on: https://www.thehackerbrief.com";
  const MAX_TWEET_LENGTH = 250;
  const MAX_CONTENT_LENGTH = MAX_TWEET_LENGTH - READ_MORE_LINK.length;

  const prompt = `
You are a social media expert creating engaging tweets for tech news.

Create a compelling tweet based on this article:

Headline: ${headline}
Summary: ${summary}

Requirements:
- Maximum ${MAX_CONTENT_LENGTH} characters for the main tweet content (before the "read more" link)
- End the tweet with: "${READ_MORE_LINK}"
- Total tweet length must be exactly ${MAX_TWEET_LENGTH} characters or less
- Do NOT include the original article link
- Engaging and attention-grabbing
- Make it shareable and interesting
- Use emojis sparingly (1-2 max) if appropriate
- Write in a conversational, engaging tone
- Focus on the most interesting/valuable aspect of the news
- Format: [Tweet text]${READ_MORE_LINK}

Return ONLY the complete tweet text including the "read more" link as a plain string, no JSON, no quotes, just the tweet content.
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a social media expert. Return only the tweet text, no additional formatting or explanation. The tweet must be exactly 200 characters or less including the 'read more' link.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.8,
    max_tokens: 100,
  });

  let tweetText = completion.choices[0].message.content?.trim() || "";

  // Safety check: Ensure tweet doesn't exceed 200 characters
  if (tweetText.length > MAX_TWEET_LENGTH) {
    // If tweet doesn't end with the read more link, add it
    if (!tweetText.endsWith(READ_MORE_LINK)) {
      tweetText =
        tweetText.slice(0, MAX_CONTENT_LENGTH).trim() + READ_MORE_LINK;
    } else {
      // If it already has the link but is too long, truncate the content part
      const contentPart = tweetText.slice(0, -READ_MORE_LINK.length);
      tweetText =
        contentPart.slice(0, MAX_CONTENT_LENGTH).trim() + READ_MORE_LINK;
    }
  }

  // Final safety check: ensure it's exactly 200 characters or less
  if (tweetText.length > MAX_TWEET_LENGTH) {
    tweetText = tweetText.slice(0, MAX_TWEET_LENGTH);
  }

  return tweetText;
}
