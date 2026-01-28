export const PLATFORM_CONFIG = {
  reddit: {
    id: "reddit" as const,
    label: "Reddit",
    description: "Find leads in Reddit discussions",
    enabled: true,
    defaultTimeRange: "year",
    maxAgeDays: 365,
  },
  hackernews: {
    id: "hackernews" as const,
    label: "Hacker News",
    description: "Find leads in HN discussions",
    enabled: true,
    defaultTimeRange: "year",
    maxAgeDays: 365,
  },
  twitter: {
    id: "twitter" as const,
    label: "Twitter/X",
    description: "Find leads in Twitter conversations",
    enabled: false, // Coming soon
    defaultTimeRange: "month",
    maxAgeDays: 30,
  },
  linkedin: {
    id: "linkedin" as const,
    label: "LinkedIn",
    description: "Find leads in LinkedIn posts",
    enabled: false, // Coming soon
    defaultTimeRange: "month",
    maxAgeDays: 30,
  },
} as const;

export type PlatformKey = keyof typeof PLATFORM_CONFIG;

export function getPlatformConfig(platform: PlatformKey) {
  return PLATFORM_CONFIG[platform];
}

export function getEnabledPlatforms() {
  return Object.entries(PLATFORM_CONFIG)
    .filter(([, config]) => config.enabled)
    .map(([key]) => key as PlatformKey);
}
