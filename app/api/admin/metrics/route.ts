import { NextResponse } from "next/server";
import { NO_STORE, buildMeta, internalEmailPatterns, reportTimeZone } from "@/lib/admin/config";
import { dayKey, parseRange } from "@/lib/admin/range";
import { demosReport, leadsReport } from "@/lib/admin/sources/ghl";
import { trafficReport } from "@/lib/admin/sources/ga4";
import { searchReport } from "@/lib/admin/sources/gsc";
import type { MetricsResponse } from "@/lib/admin/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Main admin report: leads, demos, traffic and search for one date range.
 * Each source succeeds or fails on its own. Paid ads load from their own
 * route so a slow ad API never holds these numbers up.
 */
export async function GET(request: Request) {
  const timeZone = reportTimeZone();
  const today = dayKey(Date.now(), timeZone);
  const { range, error } = parseRange(new URL(request.url).searchParams, today);
  if (error) {
    return NextResponse.json({ ok: false, error }, { status: 400, headers: NO_STORE });
  }
  const meta = buildMeta(range, timeZone);

  const [leads, demos, traffic, search] = await Promise.all([
    leadsReport(range, meta.previous, timeZone, internalEmailPatterns()),
    demosReport(range, meta.previous, timeZone),
    trafficReport(range, meta.previous),
    searchReport(range, meta.previous),
  ]);

  const body: MetricsResponse = { ok: true, meta, leads, demos, traffic, search };
  return NextResponse.json(body, { headers: NO_STORE });
}
