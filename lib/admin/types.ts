/**
 * Shapes shared by the admin API routes and the dashboard page.
 *
 * Every source either returns its data or says why it could not. A source that
 * is missing is never reported as zero: the page shows "Unavailable" with the
 * note, and everything else still loads.
 */

import type { DayRange } from "./range";

export type Source<T> =
  | { available: true; data: T; warnings?: string[] }
  | { available: false; reason: "not_configured" | "error"; note: string };

export function notConfigured(note: string): Source<never> {
  return { available: false, reason: "not_configured", note };
}

export function failed(err: unknown, label: string): Source<never> {
  const message = err instanceof Error ? err.message : String(err);
  return { available: false, reason: "error", note: `${label}: ${message}`.slice(0, 400) };
}

export interface ReportMeta {
  range: DayRange;
  previous: DayRange;
  timeZone: string;
  includesToday: boolean;
  generatedAt: string;
}

// ---- Leads (GoHighLevel contacts) -----------------------------------------

/** Which website form a contact came through, read from its GHL tags. */
export type LeadType = "demo" | "coaching" | "contact";

export interface Lead {
  id: string;
  dateAdded: string; // ISO
  name: string;
  email: string;
  company: string;
  types: LeadType[];
  event?: string;
  source: string;
}

export interface LeadCounts {
  total: number; // contacts with at least one website form tag
  demo: number;
  coaching: number;
  contact: number;
  event: number;
}

export interface LeadsReport {
  current: LeadCounts;
  previous: LeadCounts;
  daily: { date: string; demo: number; coaching: number; contact: number }[];
  leads: Lead[]; // current range, newest first
  excluded: { count: number; patterns: string[] };
  truncated: boolean;
}

// ---- Demos (GoHighLevel calendar) ------------------------------------------

export interface Demo {
  id: string;
  title: string;
  status: string;
  startTime: string; // ISO
  bookedAt: string | null; // ISO
}

export interface DemosReport {
  bookedCurrent: number;
  bookedPrevious: number;
  heldByStatus: Record<string, number>; // demos scheduled inside the range
  daily: { date: string; booked: number }[];
  booked: Demo[]; // booked inside the range, newest first
  upcoming: Demo[];
}

// ---- Traffic (GA4) ---------------------------------------------------------

export interface TrafficTotals {
  users: number;
  sessions: number;
  pageViews: number;
}

export interface TrafficReport {
  current: TrafficTotals;
  previous: TrafficTotals;
  daily: { date: string; sessions: number | null }[];
  channels: { channel: string; sessions: number }[];
}

// ---- Search (Search Console) -----------------------------------------------

export interface SearchTotals {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SearchReport {
  current: SearchTotals;
  previous: SearchTotals;
  daily: { date: string; clicks: number | null }[];
  queries: { query: string; clicks: number; impressions: number; ctr: number; position: number }[];
}

// ---- Paid ads (Meta via Windsor.ai) ----------------------------------------

export interface AdTotals {
  spend: number;
  impressions: number;
  clicks: number;
}

export interface PaidAdsReport {
  current: AdTotals;
  previous: AdTotals;
  daily: { date: string; spend: number | null }[];
  campaigns: { campaign: string; spend: number; impressions: number; clicks: number }[];
}

// ---- API responses ---------------------------------------------------------

export interface MetricsResponse {
  ok: true;
  meta: ReportMeta;
  leads: Source<LeadsReport>;
  demos: Source<DemosReport>;
  traffic: Source<TrafficReport>;
  search: Source<SearchReport>;
}

export interface PaidAdsResponse {
  ok: true;
  meta: ReportMeta;
  meta_ads: Source<PaidAdsReport>;
}
