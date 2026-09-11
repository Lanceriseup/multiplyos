import { NextResponse } from "next/server";
import { upsertContact, addContactNote, postToInboundWebhook } from "@/lib/ghl";

// Runs on the Node.js runtime; the PIT never reaches the browser.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CoachingLeadPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  organization?: string;
  businessOwner?: string; // "Yes" | "No"
  industry?: string;
  revenue?: string;
}

/**
 * Coaching-call lead capture (separate from the demo /api/lead flow so the two
 * pipelines can be tagged, routed, and reported on independently in GHL).
 *
 * Creates/updates the GHL contact and records the coaching qualifier answers
 * (business owner, industry, last-year revenue). Those extra answers map onto
 * GHL custom fields when their IDs are configured, and are always mirrored into
 * a contact note so nothing is lost if the fields aren't set up yet.
 *
 * Returns a prefilled coaching booking URL when GHL_COACHING_CALENDAR_URL is
 * configured, so the client can send the qualified lead straight to scheduling.
 */
export async function POST(request: Request) {
  let data: CoachingLeadPayload;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const email = data.email?.trim();
  if (!email) {
    return NextResponse.json({ ok: false, error: "Email is required" }, { status: 400 });
  }

  const firstName = data.firstName?.trim();
  const lastName = data.lastName?.trim();
  const phone = data.phone?.trim();
  const organization = data.organization?.trim();

  // Map the qualifier answers onto GHL custom fields when field IDs are set.
  const customFields: Array<{ id: string; field_value: string }> = [];
  if (process.env.GHL_FIELD_BUSINESS_OWNER && data.businessOwner) {
    customFields.push({ id: process.env.GHL_FIELD_BUSINESS_OWNER, field_value: data.businessOwner });
  }
  if (process.env.GHL_FIELD_INDUSTRY && data.industry) {
    customFields.push({ id: process.env.GHL_FIELD_INDUSTRY, field_value: data.industry });
  }
  if (process.env.GHL_FIELD_REVENUE && data.revenue) {
    customFields.push({ id: process.env.GHL_FIELD_REVENUE, field_value: data.revenue });
  }

  // Push the raw submission to the GHL Inbound Webhook first, and on its own.
  // It uses a different credential than the contacts API, so the lead still
  // lands in HighLevel even if the PIT isn't configured or the upsert fails.
  const webhook = await postToInboundWebhook({
    source: "Coaching Call Request",
    formName: "coaching-call",
    pageUrl: "/coaching-call",
    submittedAt: new Date().toISOString(),
    firstName: firstName || "",
    lastName: lastName || "",
    name: [firstName, lastName].filter(Boolean).join(" "),
    email,
    phone: phone || "",
    organization: organization || "",
    companyName: organization || "",
    businessOwner: data.businessOwner || "",
    industry: data.industry || "",
    revenue: data.revenue || "",
    tags: ["coaching-call-request", "mos-coaching-lead"],
  });

  try {
    const { contactId } = await upsertContact({
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      email,
      phone: phone || undefined,
      companyName: organization || undefined,
      source: "Coaching Call Request",
      tags: ["coaching-call-request", "mos-coaching-lead"],
      customFields: customFields.length ? customFields : undefined,
    });

    // Always mirror the qualifier answers into a note as a safety net.
    const noteLines = [
      "Submitted via: Coaching Call Request",
      organization && `Organization: ${organization}`,
      data.businessOwner && `Business owner: ${data.businessOwner}`,
      data.industry && `Industry: ${data.industry}`,
      data.revenue && `Last year revenue: ${data.revenue}`,
    ].filter(Boolean) as string[];

    if (contactId && noteLines.length > 1) {
      await addContactNote(contactId, noteLines.join("\n")).catch((err) =>
        console.error("GHL coaching note failed:", err)
      );
    }

    // Prefilled coaching booking link (fallback redirect when configured).
    let bookingUrl: string | undefined;
    const base = process.env.GHL_COACHING_CALENDAR_URL;
    if (base) {
      const url = new URL(base);
      if (firstName) url.searchParams.set("first_name", firstName);
      if (lastName) url.searchParams.set("last_name", lastName);
      if (email) url.searchParams.set("email", email);
      if (phone) url.searchParams.set("phone", phone);
      bookingUrl = url.toString();
    }

    return NextResponse.json({ ok: true, contactId, bookingUrl, webhook: webhook.ok });
  } catch (err) {
    console.error("Coaching lead submission error:", err);
    // The webhook already delivered the lead — don't fail the visitor for a
    // contacts-API problem we can reconcile in HighLevel.
    if (webhook.ok) {
      return NextResponse.json({ ok: true, webhook: true, contactId: null });
    }
    return NextResponse.json(
      { ok: false, error: "We couldn't process that. Please try again or email us." },
      { status: 502 }
    );
  }
}
