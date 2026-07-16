import { NextResponse } from "next/server";
import { getFreeSlots } from "@/lib/ghl";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;

export async function GET(request: Request) {
  const calendarId = process.env.GHL_CALENDAR_ID;
  if (!calendarId) {
    return NextResponse.json(
      { ok: false, error: "Calendar is not configured" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const timezone = searchParams.get("timezone") || undefined;

  const now = Date.now();
  const start = Number(searchParams.get("start")) || now;
  const end = Number(searchParams.get("end")) || start + 31 * DAY_MS;

  try {
    const days = await getFreeSlots({
      calendarId,
      // Never look for slots in the past.
      startDate: Math.max(start, now),
      endDate: end,
      timezone,
    });
    return NextResponse.json({ ok: true, timezone, days });
  } catch (err) {
    console.error("Free-slots error:", err);
    return NextResponse.json(
      { ok: false, error: "Couldn't load available times. Please try again." },
      { status: 502 }
    );
  }
}
