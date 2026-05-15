import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { env } from "@/lib/env";

type ApiRateLimitResult =
  | {
      success: true;
      limit?: number;
      remaining?: number;
      reset?: number;
    }
  | {
      success: false;
      limit?: number;
      remaining?: number;
      reset?: number;
    };

let rateLimiter: Ratelimit | null | undefined;

export function getApiRateLimitKey(input: {
  source: "demo" | "database";
  key: string;
  ip?: string | null;
}) {
  const identifier = input.source === "database" ? input.key : input.ip || input.key;

  return `api:${input.source}:${identifier}`;
}

export async function limitApiRequest(identifier: string): Promise<ApiRateLimitResult> {
  const limiter = getRateLimiter();

  if (!limiter) {
    return { success: true };
  }

  return limiter.limit(identifier);
}

function getRateLimiter() {
  if (rateLimiter !== undefined) {
    return rateLimiter;
  }

  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    rateLimiter = null;
    return rateLimiter;
  }

  rateLimiter = new Ratelimit({
    redis: new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    }),
    limiter: Ratelimit.slidingWindow(60, "1 m"),
    analytics: true,
  });

  return rateLimiter;
}
