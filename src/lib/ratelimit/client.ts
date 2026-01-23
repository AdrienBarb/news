import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Different rate limiters for different endpoints
export const analyzeLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 h"), // 10 requests per hour
  analytics: true,
  prefix: "icp:analyze",
});

export const generateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"), // 5 requests per hour (most expensive)
  analytics: true,
  prefix: "icp:generate",
});

export const emailLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"), // 5 requests per hour
  analytics: true,
  prefix: "icp:email",
});
