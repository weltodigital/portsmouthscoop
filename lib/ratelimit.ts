// Best-effort, in-memory rate limiter. Good enough to blunt casual abuse/spam.
//
// NOTE: serverless instances don't share memory, so this limits per-instance,
// not globally. For strong, global rate limiting use a shared store such as
// Upstash Redis (@upstash/ratelimit). This keeps us dependency-free for now.

type Hit = { count: number; resetAt: number };
const buckets = new Map<string, Hit>();

/**
 * Returns true if the request is allowed, false if it has exceeded `limit`
 * within `windowMs`. Keyed by something stable per caller (e.g. IP + route).
 */
export function rateLimit(
  key: string,
  limit = 5,
  windowMs = 60_000,
): boolean {
  const now = Date.now();
  const hit = buckets.get(key);

  if (!hit || now > hit.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (hit.count >= limit) return false;
  hit.count += 1;
  return true;
}

/** Best-effort client IP from common proxy headers. */
export function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") || "unknown";
}
