if (!process.env.REVID_API_KEY) {
  throw new Error("REVID_API_KEY is not set in environment variables");
}

export const REVID_API_URL = "https://www.revid.ai/api/public/v2/render";

export interface CreateTikTokVideoParams {
  prompt: string;
  webhookUrl: string;
}

export async function createTikTokVideo(params: CreateTikTokVideoParams) {
  const response = await fetch(REVID_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      key: process.env.REVID_API_KEY!,
    },
    body: JSON.stringify({
      webhook: params.webhookUrl,
      creationParams: {
        mediaType: "aiVideo",
        metadata: null,
        flowType: "prompt-to-video",
        slug: "ai-news-video-generator",
        slugNew: "",
        isCopiedFrom: false,
        hasToGenerateVoice: true,
        hasToTranscript: false,
        hasToSearchMedia: true,
        hasAvatar: false,
        hasWebsiteRecorder: false,
        hasTextSmallAtBottom: false,
        ratio: "9 / 16",
        selectedAudio: "Observer",
        selectedVoice: "nPczCjzI2devNBz1zQrb",
        selectedAvatar: "",
        selectedAvatarType: "",
        websiteToRecord: "",
        hasToGenerateCover: false,
        coverTextType: "layers",
        nbGenerations: 1,
        disableCaptions: false,
        mediaMultiplier: "medium",
        characters: [],
        imageGenerationModel: "good",
        videoGenerationModel: "base",
        avatarImageModel: "good",
        hasEnhancedGeneration: true,
        hasEnhancedGenerationPro: true,
        useLegacyVoiceModel: false,
        captionPresetName: "Wrap 1",
        captionPositionName: "bottom",
        sourceType: "contentScraping",
        selectedStoryStyle: {
          value: "custom",
          label: "General",
        },
        durationSeconds: 40,
        generationPreset: "DEFAULT",
        generationMusicPrompt: "",
        hasToGenerateMusic: false,
        isOptimizedForChinese: false,
        generationUserPrompt: "",
        hasToGenerateMusicWithLyrics: false,
        enableNsfwFilter: false,
        addStickers: false,
        typeMovingImageAnim: "dynamic",
        hasToGenerateSoundEffects: false,
        fetchNews: true,
        prompt: params.prompt,
        promptCustomRules:
          "- You are creating professional news videos that inform and engage viewers with the latest information\n- FIRST: Research and gather the most recent, accurate information about the topic provided by the user\n- Search for recent breaking news, latest developments, recent updates, and current events related to the user's topic\n- Focus on factual, credible information from reliable sources and recent timeframes\n- Structure the video like a professional news report with clear segments: headline, key facts, context, and implications\n- Include specific dates, statistics, quotes from officials or experts when relevant to the recent news\n- Make the content engaging but maintain journalistic integrity and objectivity\n- Use professional, clear language suitable for news reporting\n- Each scene should present information in a logical, news-style progression\n- Include compelling visuals that support and illustrate the news content\n- Add onScreenText for key headlines, statistics, or important quotes\n- Keep scenes dynamic but informative, typically 4-6 seconds each\n- End with a summary or call-to-action related to the news topic\n- Ensure all information presented is current and factually accurate\n- If the topic is breaking news, emphasize the timeliness and developing nature of the story",
        promptTargetDuration: 12,
        selectedCharacters: [],
        lang: "",
        voiceSpeed: 1,
        disableAudio: false,
        disableVoice: false,
        inputMedias: [],
        hasToGenerateVideos: true,
        audioUrl: "https://cdn.revid.ai/audio/observer.mp3",
        watermark: null,
        estimatedCreditsToConsume: 61,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Revid API error: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  return await response.json();
}
