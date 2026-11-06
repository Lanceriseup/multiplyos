/**
 * Date ranges for the admin dashboard.
 *
 * A range is two calendar days (inclusive) in the reporting timezone. Every
 * section reads the same range, and the comparison is always the period of the
 * same length immediately before it. Pure functions only: safe on the server,
 * in middleware and in the browser.
 */

export const DEFAULT_REPORT_TIME_ZONE = "America/Chicago";
export const MAX_RANGE_DAYS = 366;

export type PresetId =
  | "today"
  | "yesterday"
  | "last-weekend"
  | "7d"
  | "14d"
  | "30d"
  | "90d"
  | "custom";

export const PRESETS: { id: Exclude<PresetId, "custom">; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "last-weekend", label: "Last weekend" },
  { id: "7d", label: "7 days" },
  { id: "14d", label: "14 days" },
  { id: "30d", label: "30 days" },
  { id: "90d", label: "90 days" },
];

export const DEFAULT_PRESET: PresetId = "30d";

/** Inclusive day range, as YYYY-MM-DD keys. */
export interface DayRange {
  start: string;
  end: string;
}

const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/;

export function isDayKey(value: unknown): value is string {
  if (typeof value !== "string" || !DAY_KEY.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/** The calendar day (YYYY-MM-DD) an instant falls on in `timeZone`. */
export function dayKey(ms: number, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(ms);
}

export function addDays(key: string, days: number): string {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Whole days from `a` to `b` (b - a). */
export function daysBetween(a: string, b: string): number {
  return Math.round(
    (Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000
  );
}

export function rangeLength(range: DayRange): number {
  return daysBetween(range.start, range.end) + 1;
}

/** Every day key in the range, oldest first. */
export function eachDay(range: DayRange): string[] {
  const out: string[] = [];
  for (let k = range.start; k <= range.end; k = addDays(k, 1)) out.push(k);
  return out;
}

/** The period of the same length that ends the day before `range` starts. */
export function previousRange(range: DayRange): DayRange {
  const len = rangeLength(range);
  return { start: addDays(range.start, -len), end: addDays(range.start, -1) };
}

/** Milliseconds `timeZone` is ahead of UTC at instant `ms`. */
function tzOffsetMs(ms: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(ms);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second")
  );
  return asUtc - Math.floor(ms / 1000) * 1000;
}

/** The instant a calendar day starts in `timeZone` (handles DST changes). */
export function dayStartMs(key: string, timeZone: string): number {
  const [y, m, d] = key.split("-").map(Number);
  const wall = Date.UTC(y, m - 1, d);
  const first = wall - tzOffsetMs(wall, timeZone);
  return wall - tzOffsetMs(first, timeZone);
}

/** [from, to) instants covering the whole range in `timeZone`. */
export function rangeBounds(range: DayRange, timeZone: string): { from: number; to: number } {
  return {
    from: dayStartMs(range.start, timeZone),
    to: dayStartMs(addDays(range.end, 1), timeZone),
  };
}

/** Resolve a preset against "today" in the reporting timezone. */
export function presetRange(preset: Exclude<PresetId, "custom">, today: string): DayRange {
  switch (preset) {
    case "today":
      return { start: today, end: today };
    case "yesterday": {
      const y = addDays(today, -1);
      return { start: y, end: y };
    }
    case "last-weekend": {
      // The most recent Saturday and Sunday that are both over.
      const dow = new Date(`${today}T00:00:00Z`).getUTCDay(); // 0 = Sunday
      const back = dow === 0 ? 8 : dow === 6 ? 7 : dow + 1;
      const sat = addDays(today, -back);
      return { start: sat, end: addDays(sat, 1) };
    }
    default: {
      const n = Number(preset.replace("d", ""));
      return { start: addDays(today, -(n - 1)), end: today };
    }
  }
}

/**
 * Read `start` and `end` from a query string. Falls back to the default preset
 * when they are missing or invalid; never lets a range run past today or
 * beyond MAX_RANGE_DAYS.
 */
export function parseRange(
  params: URLSearchParams,
  today: string
): { range: DayRange; error?: string } {
  const start = params.get("start");
  const end = params.get("end");
  if (!start && !end) {
    return { range: presetRange(DEFAULT_PRESET as "30d", today) };
  }
  if (!isDayKey(start) || !isDayKey(end)) {
    return { range: presetRange("30d", today), error: "start and end must be YYYY-MM-DD dates" };
  }
  if (start > end) {
    return { range: presetRange("30d", today), error: "start must be on or before end" };
  }
  const clampedEnd = end > today ? today : end;
  const clampedStart = start > clampedEnd ? clampedEnd : start;
  const range = { start: clampedStart, end: clampedEnd };
  if (rangeLength(range) > MAX_RANGE_DAYS) {
    return { range: { start: addDays(clampedEnd, -(MAX_RANGE_DAYS - 1)), end: clampedEnd } };
  }
  return { range };
}

/** "Nov 1 – Nov 6, 2026" (or "Nov 6, 2026" for one day). */
export function formatRange(range: DayRange): string {
  const fmt = (key: string, withYear: boolean) =>
    new Date(`${key}T12:00:00Z`).toLocaleDateString("en-US", {
      timeZone: "UTC",
      month: "short",
      day: "numeric",
      ...(withYear ? { year: "numeric" } : {}),
    });
  if (range.start === range.end) return fmt(range.end, true);
  const sameYear = range.start.slice(0, 4) === range.end.slice(0, 4);
  return `${fmt(range.start, !sameYear)} – ${fmt(range.end, true)}`;
}
