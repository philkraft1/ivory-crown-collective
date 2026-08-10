import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { hasUpstashConfig, isProduction } from "@/lib/security/env";

type LimitKind = "contact" | "checkout";

let redis: Redis | null = null;
const limiters = new Map<LimitKind, Ratelimit>();

function getRedis(): Redis | null {
  if (!hasUpstashConfig()) return null;
  if (!redis) {
    redis = Redis.fromEnv();
  }
  return redis;
}

function getLimiter(kind: LimitKind): Ratelimit | null {
  const client = getRedis();
  if (!client) return null;

  const existing = limiters.get(kind);
  if (existing) return existing;

  const limiter =
    kind === "contact"
      ? new Ratelimit({
          redis: client,
          limiter: Ratelimit.slidingWindow(3, "10 m"),
          prefix: "icc:rl:contact",
          analytics: false,
        })
      : new Ratelimit({
          redis: client,
          limiter: Ratelimit.slidingWindow(5, "10 m"),
          prefix: "icc:rl:checkout",
          analytics: false,
        });

  limiters.set(kind, limiter);
  return limiter;
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  return (
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("cf-connecting-ip")?.trim() ||
    "unknown"
  );
}

export type RateLimitResult =
  | { ok: true; remaining?: number }
  | { ok: false; status: 429 | 503; error: string; retryAfter?: number };

export async function enforceRateLimit(
  kind: LimitKind,
  request: Request,
): Promise<RateLimitResult> {
  const limiter = getLimiter(kind);

  if (!limiter) {
    if (isProduction()) {
      return {
        ok: false,
        status: 503,
        error: "Service temporarily unavailable.",
      };
    }
    // Dev without Upstash: allow through.
    return { ok: true };
  }

  const ip = clientIp(request);
  const result = await limiter.limit(`${kind}:${ip}`);

  if (!result.success) {
    const retryAfter = Math.max(
      1,
      Math.ceil((result.reset - Date.now()) / 1000),
    );
    return {
      ok: false,
      status: 429,
      error: "Too many requests. Please try again shortly.",
      retryAfter,
    };
  }

  return { ok: true, remaining: result.remaining };
}
