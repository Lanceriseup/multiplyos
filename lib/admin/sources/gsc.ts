/**
 * Google Search Console: clicks, impressions, CTR, position and top queries.
 * Search Console reports in Pacific time and its last two to three days are
 * provisional.
 */

import { eachDay, type DayRange } from "../range";
import {
  failed,
  notConfigured,
  type SearchReport,
  type SearchTotals,
  type Source,
} from "../types";
import { GOOGLE_SETUP_NOTE, googleConfigured, googlePost } from "./google";

const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";

interface GscRow {
  keys?: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

function totalsOf(rows: GscRow[] | undefined): SearchTotals {
  const r = rows?.[0];
  return {
    clicks: r?.clicks ?? 0,
    impressions: r?.impressions ?? 0,
    ctr: r?.ctr ?? 0,
    position: r?.position ?? 0,
  };
}

export async function searchReport(
  range: DayRange,
  previous: DayRange
): Promise<Source<SearchReport>> {
  const site = process.env.GSC_SITE_URL;
  if (!site || !googleConfigured()) {
    return notConfigured(
      `Set GSC_SITE_URL (e.g. sc-domain:multiplyos.com). ${googleConfigured() ? "" : GOOGLE_SETUP_NOTE}`
    );
  }

  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`;
  const query = (r: DayRange, extra: object = {}) =>
    googlePost<{ rows?: GscRow[] }>(url, SCOPE, {
      startDate: r.start,
      endDate: r.end,
      dataState: "all",
      ...extra,
    });

  try {
    const [total, prior, daily, queries] = await Promise.all([
      query(range),
      query(previous),
      query(range, { dimensions: ["date"] }),
      query(range, { dimensions: ["query"], rowLimit: 15 }),
    ]);
    const byDay = new Map((daily.rows ?? []).map((r) => [r.keys?.[0] ?? "", r.clicks]));
    return {
      available: true,
      data: {
        current: totalsOf(total.rows),
        previous: totalsOf(prior.rows),
        daily: eachDay(range).map((date) => ({ date, clicks: byDay.get(date) ?? null })),
        queries: (queries.rows ?? []).map((r) => ({
          query: r.keys?.[0] ?? "",
          clicks: r.clicks,
          impressions: r.impressions,
          ctr: r.ctr,
          position: r.position,
        })),
      },
    };
  } catch (err) {
    return failed(err, "Search Console");
  }
}
