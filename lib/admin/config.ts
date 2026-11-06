/**
 * Server-side settings for the admin dashboard, read from env vars.
 */

import { DEFAULT_REPORT_TIME_ZONE, dayKey, previousRange, type DayRange } from "./range";
import type { ReportMeta } from "./types";

export function reportTimeZone(): string {
  const tz = process.env.ADMIN_REPORT_TIME_ZONE?.trim();
  if (tz) {
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: tz });
      return tz;
    } catch {
      console.error(`ADMIN_REPORT_TIME_ZONE "${tz}" is not a valid timezone; using default`);
    }
  }
  return DEFAULT_REPORT_TIME_ZONE;
}

/**
 * Email fragments that mark staff and test submissions, which are left out of
 * every count. INTERNAL_EMAIL_PATTERNS is a comma-separated list.
 */
export function internalEmailPatterns(): string[] {
  const raw = process.env.INTERNAL_EMAIL_PATTERNS ?? "@riseupkings.com,+test";
  return raw
    .split(",")
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);
}

export function isInternalEmail(email: string, patterns: string[]): boolean {
  const e = email.toLowerCase();
  return patterns.some((p) => e.includes(p));
}

export function buildMeta(range: DayRange, timeZone: string): ReportMeta {
  const today = dayKey(Date.now(), timeZone);
  return {
    range,
    previous: previousRange(range),
    timeZone,
    includesToday: range.end >= today,
    generatedAt: new Date().toISOString(),
  };
}

export const NO_STORE = { "Cache-Control": "no-store" };
