/**
 * GA4 Data API: visitors, sessions, page views and channels.
 *
 * Note: as of November 2026 the site does not load a GA4 tag, so there is
 * nothing to read until one is added. Dates follow the GA4 property timezone.
 */

import { eachDay, type DayRange } from "../range";
import {
  failed,
  notConfigured,
  type Source,
  type TrafficReport,
  type TrafficTotals,
} from "../types";
import { GOOGLE_SETUP_NOTE, googleConfigured, googlePost } from "./google";

const SCOPE = "https://www.googleapis.com/auth/analytics.readonly";

interface Ga4Row {
  dimensionValues?: { value: string }[];
  metricValues?: { value: string }[];
}
interface Ga4Report {
  rows?: Ga4Row[];
  totals?: Ga4Row[];
}

function hostFilter() {
  const hosts = (process.env.GA4_HOSTNAMES ?? "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);
  return hosts.length
    ? { dimensionFilter: { filter: { fieldName: "hostName", inListFilter: { values: hosts } } } }
    : {};
}

function totalsOf(report: Ga4Report): TrafficTotals {
  const v = report.totals?.[0]?.metricValues ?? report.rows?.[0]?.metricValues ?? [];
  return {
    users: Number(v[0]?.value ?? 0),
    sessions: Number(v[1]?.value ?? 0),
    pageViews: Number(v[2]?.value ?? 0),
  };
}

export async function trafficReport(
  range: DayRange,
  previous: DayRange
): Promise<Source<TrafficReport>> {
  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!propertyId || !googleConfigured()) {
    return notConfigured(
      `Set GA4_PROPERTY_ID. ${googleConfigured() ? "" : GOOGLE_SETUP_NOTE} The site also needs a GA4 tag before there is anything to read.`
    );
  }

  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;
  const metrics = [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }];
  const span = (r: DayRange) => [{ startDate: r.start, endDate: r.end }];

  try {
    const [daily, prior, channels] = await Promise.all([
      googlePost<Ga4Report>(url, SCOPE, {
        dateRanges: span(range),
        dimensions: [{ name: "date" }],
        metrics,
        metricAggregations: ["TOTAL"],
        keepEmptyRows: true,
        ...hostFilter(),
      }),
      googlePost<Ga4Report>(url, SCOPE, { dateRanges: span(previous), metrics, ...hostFilter() }),
      googlePost<Ga4Report>(url, SCOPE, {
        dateRanges: span(range),
        dimensions: [{ name: "sessionDefaultChannelGroup" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 10,
        ...hostFilter(),
      }),
    ]);

    const byDay = new Map<string, number>();
    for (const row of daily.rows ?? []) {
      const d = row.dimensionValues?.[0]?.value ?? ""; // YYYYMMDD
      byDay.set(`${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`, Number(row.metricValues?.[1]?.value ?? 0));
    }

    return {
      available: true,
      data: {
        current: totalsOf(daily),
        previous: totalsOf(prior),
        daily: eachDay(range).map((date) => ({ date, sessions: byDay.get(date) ?? null })),
        channels: (channels.rows ?? []).map((row) => ({
          channel: row.dimensionValues?.[0]?.value ?? "(other)",
          sessions: Number(row.metricValues?.[0]?.value ?? 0),
        })),
      },
    };
  } catch (err) {
    return failed(err, "GA4");
  }
}
