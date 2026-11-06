/**
 * Login throttle: 8 failed attempts per 15 minutes per IP.
 *
 * Kept in memory because this site has no shared store (2DayCEO uses Vercel
 * KV). On Vercel each server instance keeps its own count, so this slows a
 * guessing attack rather than strictly capping it. A long random
 * ADMIN_PASSWORD is the real protection; move this to KV/Upstash if the
 * dashboard ever needs a hard limit.
 */

export const MAX_ATTEMPTS = 8;
export const WINDOW_MS = 15 * 60 * 1000;

const attempts = new Map<string, { count: number; resetAt: number }>();

export function isLocked(key: string, now: number = Date.now()): boolean {
  const entry = attempts.get(key);
  if (!entry || entry.resetAt <= now) return false;
  return entry.count >= MAX_ATTEMPTS;
}

export function recordFailure(key: string, now: number = Date.now()): void {
  const entry = attempts.get(key);
  if (!entry || entry.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.count++;
  }
  // Keep the map from growing without bound.
  if (attempts.size > 5000) {
    for (const [k, v] of attempts) if (v.resetAt <= now) attempts.delete(k);
  }
}

export function clearFailures(key: string): void {
  attempts.delete(key);
}
