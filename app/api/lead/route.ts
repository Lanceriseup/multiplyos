import { NextResponse } from "next/server";
import { upsertContact, addContactNote, buildBookingUrl } from "@/lib/ghl";

// Runs on the Node.js runtime; the PIT never reaches the browser.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface LeadPayload {
  name?: string;
  email?: string;
  company?: string;
  teamSize?: string;
  topic?: string;
  message?: string;
  source?: string;
}

export async function POST(request: Request) {
  let data: LeadPayload;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const email = data.email?.trim();
  if (!email) {
    return NextResponse.json({ ok: false, error: "Email is required" }, { status: 400 });
  }

  const [firstName, ...rest] = (data.name ?? "").trim().split(/\s+/).filter(Boolean);
  const lastName = rest.join(" ");
  const source = data.source || "Website";

  // Map extra questions into GHL custom fields when the field IDs are configured.
  const customFields: Array<{ id: string; field_value: string }> = [];
  if (process.env.GHL_FIELD_TEAM_SIZE && data.teamSize) {
    customFields.push({ id: process.env.GHL_FIELD_TEAM_SIZE, field_value: data.teamSize });
  }
  if (process.env.GHL_FIELD_DEMO_INTEREST && data.message) {
    customFields.push({ id: process.env.GHL_FIELD_DEMO_INTEREST, field_value: data.message });
  }

  try {
    const { contactId } = await upsertContact({
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      email,
      companyName: data.company?.trim() || undefined,
      source,
      tags: ["website-lead", source.toLowerCase().replace(/\s+/g, "-")],
      customFields: customFields.length ? customFields : undefined,
    });

    // Record the fields that don't map onto standard contact properties.
    const noteLines = [
      `Submitted via: ${source}`,
      data.company && `Company: ${data.company}`,
      data.teamSize && `Team size: ${data.teamSize}`,
      data.topic && `Topic: ${data.topic}`,
      data.message && `Message: ${data.message}`,
    ].filter(Boolean) as string[];

    if (contactId && noteLines.length > 1) {
      // Don't fail the submission if the note can't be attached.
      await addContactNote(contactId, noteLines.join("\n")).catch((err) =>
        console.error("GHL note failed:", err)
      );
    }

    // Fallback redirect URL, kept in case the calendar step is ever disabled.
    const bookingUrl = buildBookingUrl({ firstName, lastName, email });
    return NextResponse.json({ ok: true, contactId, bookingUrl });
  } catch (err) {
    console.error("Lead submission error:", err);
    return NextResponse.json(
      { ok: false, error: "We couldn't process that. Please try again or email us." },
      { status: 502 }
    );
  }
}
