export const fmtInt = (n: number) => Math.round(n).toLocaleString("en-US");

export const fmtMoney = (n: number, digits = 0) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

/** 0.0345 → "3.5%" */
export const fmtPct = (ratio: number, digits = 1) => `${(ratio * 100).toFixed(digits)}%`;

/** "Nov 6" from a YYYY-MM-DD key. */
export function fmtDay(key: string, withYear = false): string {
  return new Date(`${key}T12:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    ...(withYear ? { year: "numeric" } : {}),
  });
}

/** "Nov 3, 9:35 PM" for an ISO instant, in the reporting timezone. */
export function fmtDateTime(iso: string | null | undefined, timeZone: string): string {
  if (!iso) return "—";
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return "—";
  return new Date(ms).toLocaleString("en-US", {
    timeZone,
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Short zone name for labels, e.g. "CST". */
export function zoneAbbr(timeZone: string): string {
  const part = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "short" })
    .formatToParts(new Date())
    .find((p) => p.type === "timeZoneName");
  return part?.value ?? timeZone;
}

/** "Central Time" for America/Chicago: the zone's long name without Standard/Daylight. */
export function zoneName(timeZone: string): string {
  try {
    const long = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "long" })
      .formatToParts(new Date())
      .find((p) => p.type === "timeZoneName")?.value;
    return long ? long.replace(/ (Standard|Daylight|Summer)/, "") : timeZone;
  } catch {
    return timeZone;
  }
}

export type Direction ="up-good" | "down-good" | "neutral";

/** Change versus the previous period, ready for display. */
export function delta(
  current: number,
  previous: number,
  direction: Direction = "up-good"
): { text: string; tone: "good" | "bad" | "flat" } {
  if (current === previous) return { text: "No change", tone: "flat" };
  if (previous === 0) return { text: "New", tone: direction === "neutral" ? "flat" : direction === "up-good" ? "good" : "bad" };
  const pct = (current - previous) / Math.abs(previous);
  const arrow = pct > 0 ? "▲" : "▼";
  const text = `${arrow} ${Math.abs(pct * 100).toFixed(Math.abs(pct) < 0.1 ? 1 : 0)}%`;
  if (direction === "neutral") return { text, tone: "flat" };
  const good = direction === "up-good" ? pct > 0 : pct < 0;
  return { text, tone: good ? "good" : "bad" };
}

/** Build and download a CSV file. */
export function downloadCsv(filename: string, rows: (string | number | null | undefined)[][]) {
  const cell = (v: string | number | null | undefined) => {
    const s = v === null || v === undefined ? "" : String(v);
    // Stop spreadsheet apps from running a value as a formula.
    const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
    return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  const csv = rows.map((r) => r.map(cell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
