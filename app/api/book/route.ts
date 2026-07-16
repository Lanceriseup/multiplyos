import { NextResponse } from "next/server";
import { createAppointment } from "@/lib/ghl";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface BookPayload {
  contactId?: string;
  startTime?: string;
  endTime?: string;
  timezone?: string;
}

export async function POST(request: Request) {
  const calendarId = process.env.GHL_CALENDAR_ID;
  if (!calendarId) {
    return NextResponse.json(
      { ok: false, error: "Calendar is not configured" },
      { status: 500 }
    );
  }

  let data: BookPayload;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  if (!data.contactId || !data.startTime) {
    return NextResponse.json(
      { ok: false, error: "Missing contact or time slot" },
      { status: 400 }
    );
  }

  try {
    const { appointmentId } = await createAppointment({
      calendarId,
      contactId: data.contactId,
      startTime: data.startTime,
      endTime: data.endTime,
      timezone: data.timezone,
      title: "MultiplyOS Demo Call",
    });
    return NextResponse.json({ ok: true, appointmentId });
  } catch (err) {
    console.error("Create-appointment error:", err);
    return NextResponse.json(
      { ok: false, error: "That time couldn't be booked. Please pick another slot." },
      { status: 502 }
    );
  }
}
