/**
 * Basic in-memory rate limiter for development/single-instance use.
 * 
 * IMPORTANT: For production deployments on serverless platforms (like Vercel),
 * you MUST replace this with a persistent store (e.g., Upstash Redis, Vercel KV)
 * because in-memory state is not shared across serverless function instances.
 */

const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

export function checkRateLimit(ipOrUid: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ipOrUid);

  if (!record || record.expiresAt < now) {
    rateLimitMap.set(ipOrUid, { count: 1, expiresAt: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count += 1;
  return true;
}
