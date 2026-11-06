import { NextResponse } from "next/server";
import { NO_STORE, buildMeta, reportTimeZone } from "@/lib/admin/config";
import { dayKey, parseRange } from "@/lib/admin/range";
import { paidAdsReport } from "@/lib/admin/sources/windsor";
import type { PaidAdsResponse } from "@/lib/admin/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Windsor can take 20–30 seconds on a cold cache.
export const maxDuration = 60;

export async function GET(request: Request) {
  const timeZone = reportTimeZone();
  const today = dayKey(Date.now(), timeZone);
  const { range, error } = parseRange(new URL(request.url).searchParams, today);
  if (error) {
    return NextResponse.json({ ok: false, error }, { status: 400, headers: NO_STORE });
  }
  const meta = buildMeta(range, timeZone);
  const body: PaidAdsResponse = {
    ok: true,
    meta,
    meta_ads: await paidAdsReport(range, meta.previous),
  };
  return NextResponse.json(body, { headers: NO_STORE });
}
