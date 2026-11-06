/**
 * Meta ads via Windsor.ai: spend, impressions, clicks by day and campaign.
 *
 * Windsor returns every Meta account connected to the Windsor workspace, so
 * set WINDSOR_META_ACCOUNT_IDS to keep only MultiplyOS's ad accounts. Dates
 * follow the ad account's timezone. Lesson from the 2DayCEO dashboard: on a
 * plan with too many connected accounts Windsor returns placeholder rows, so
 * an all-empty reply is reported as a warning, not as zero spend.
 */

import { addDays, eachDay, type DayRange } from "../range";
import { failed, notConfigured, type AdTotals, type PaidAdsReport, type Source } from "../types";

interface WindsorRow {
  date?: string;
  campaign?: string;
  account_id?: string | number;
  spend?: number | string;
  impressions?: number | string;
  clicks?: number | string;
}

const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

function emptyTotals(): AdTotals {
  return { spend: 0, impressions: 0, clicks: 0 };
}

export async function paidAdsReport(
  range: DayRange,
  previous: DayRange
): Promise<Source<PaidAdsReport>> {
  const apiKey = process.env.WINDSOR_AI_API_KEY;
  if (!apiKey) return notConfigured("Set WINDSOR_AI_API_KEY (and WINDSOR_META_ACCOUNT_IDS).");

  const accounts = (process.env.WINDSOR_META_ACCOUNT_IDS ?? "")
    .split(",")
    .map((a) => a.trim().replace(/^act_/, ""))
    .filter(Boolean);

  try {
    const url = new URL("https://connectors.windsor.ai/facebook");
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("date_from", previous.start);
    url.searchParams.set("date_to", range.end);
    url.searchParams.set("fields", "date,account_id,campaign,spend,impressions,clicks");
    const res = await fetch(url, { signal: AbortSignal.timeout(45_000), cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
    const json = (await res.json()) as { data?: WindsorRow[] };

    const rows = (json.data ?? []).filter(
      (r) => !accounts.length || accounts.includes(String(r.account_id ?? "").replace(/^act_/, ""))
    );

    const current = emptyTotals();
    const prior = emptyTotals();
    const byDay = new Map<string, number>();
    const byCampaign = new Map<string, AdTotals>();
    const prevEnd = addDays(range.start, -1);

    for (const r of rows) {
      const date = String(r.date ?? "").slice(0, 10);
      const t = { spend: num(r.spend), impressions: num(r.impressions), clicks: num(r.clicks) };
      if (date >= range.start && date <= range.end) {
        current.spend += t.spend;
        current.impressions += t.impressions;
        current.clicks += t.clicks;
        byDay.set(date, (byDay.get(date) ?? 0) + t.spend);
        const name = r.campaign || "(no campaign)";
        const c = byCampaign.get(name) ?? emptyTotals();
        c.spend += t.spend;
        c.impressions += t.impressions;
        c.clicks += t.clicks;
        byCampaign.set(name, c);
      } else if (date >= previous.start && date <= prevEnd) {
        prior.spend += t.spend;
        prior.impressions += t.impressions;
        prior.clicks += t.clicks;
      }
    }

    const warnings: string[] = [];
    if (!rows.length) {
      warnings.push(
        accounts.length
          ? "Windsor returned no rows for these ad accounts. Check the account IDs and Windsor's plan limits."
          : "Windsor returned no rows. Check Windsor's plan limits and connected accounts."
      );
    } else if (!accounts.length) {
      warnings.push("WINDSOR_META_ACCOUNT_IDS is not set, so these totals include every connected Meta account.");
    }

    return {
      available: true,
      warnings: warnings.length ? warnings : undefined,
      data: {
        current,
        previous: prior,
        daily: eachDay(range).map((date) => ({ date, spend: byDay.get(date) ?? null })),
        campaigns: [...byCampaign.entries()]
          .map(([campaign, t]) => ({ campaign, ...t }))
          .sort((a, b) => b.spend - a.spend),
      },
    };
  } catch (err) {
    return failed(err, "Windsor (Meta)");
  }
}
