/**
 * GoHighLevel (LeadConnector) API v2 client.
 *
 * Uses a Private Integration Token (PIT) — created in GHL under
 * Settings → Private Integrations. The token is a secret and is read from
 * server-only env vars, so this module must never be imported into client code.
 *
 * Required PIT scopes: contacts.write, contacts.readonly
 */

const GHL_API_BASE = "https://services.leadconnectorhq.com";
const GHL_API_VERSION = "2021-07-28";
// GHL calendar endpoints use an older API version than contacts.
const GHL_CALENDAR_VERSION = "2021-04-15";

export interface UpsertContactInput {
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  companyName?: string;
  source?: string;
  tags?: string[];
  customFields?: Array<{ id: string; field_value: string }>;
}

function getCredentials() {
  const token = process.env.GHL_PRIVATE_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;
  if (!token || !locationId) {
    throw new Error(
      "Missing GHL_PRIVATE_TOKEN or GHL_LOCATION_ID — set them in .env.local"
    );
  }
  return { token, locationId };
}

function headers(token: string, version: string = GHL_API_VERSION) {
  return {
    Authorization: `Bearer ${token}`,
    Version: version,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

/**
 * Upsert a contact (matches on email/phone within the location, so re-submits
 * don't create duplicates). Returns the GHL contact id.
 */
export async function upsertContact(
  input: UpsertContactInput
): Promise<{ contactId: string | undefined; raw: unknown }> {
  const { token, locationId } = getCredentials();

  const res = await fetch(`${GHL_API_BASE}/contacts/upsert`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({ locationId, ...input }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`GHL contact upsert failed (${res.status}): ${detail}`);
  }

  const raw = await res.json();
  // GHL returns { contact: { id, ... } } (or { new, contact } on upsert)
  const contactId: string | undefined = raw?.contact?.id ?? raw?.id;
  return { contactId, raw };
}

/**
 * Attach a free-text note to a contact — used to record the extra form fields
 * (team size, topic, message) that don't map onto standard contact fields.
 */
export async function addContactNote(
  contactId: string,
  body: string
): Promise<void> {
  const { token } = getCredentials();

  const res = await fetch(
    `${GHL_API_BASE}/contacts/${contactId}/notes`,
    {
      method: "POST",
      headers: headers(token),
      body: JSON.stringify({ body }),
    }
  );

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`GHL add-note failed (${res.status}): ${detail}`);
  }
}

/**
 * Build the GHL calendar booking URL with the lead's details prefilled, so the
 * booking widget skips straight to slot selection. Returns undefined if no
 * calendar is configured (caller falls back to a plain confirmation).
 */
export function buildBookingUrl(prefill: {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}): string | undefined {
  const base = process.env.GHL_CALENDAR_URL;
  if (!base) return undefined;

  const url = new URL(base);
  if (prefill.firstName) url.searchParams.set("first_name", prefill.firstName);
  if (prefill.lastName) url.searchParams.set("last_name", prefill.lastName);
  if (prefill.email) url.searchParams.set("email", prefill.email);
  if (prefill.phone) url.searchParams.set("phone", prefill.phone);
  return url.toString();
}

/**
 * Fetch open appointment slots for a calendar within a date range.
 * Returns a map of { "YYYY-MM-DD": ["<ISO datetime with offset>", ...] } in the
 * requested timezone. Empty/absent dates simply won't appear as keys.
 */
export async function getFreeSlots(params: {
  calendarId: string;
  startDate: number; // epoch ms
  endDate: number; // epoch ms
  timezone?: string;
}): Promise<Record<string, string[]>> {
  const { token } = getCredentials();

  const url = new URL(`${GHL_API_BASE}/calendars/${params.calendarId}/free-slots`);
  url.searchParams.set("startDate", String(params.startDate));
  url.searchParams.set("endDate", String(params.endDate));
  if (params.timezone) url.searchParams.set("timezone", params.timezone);

  const res = await fetch(url, { headers: headers(token, GHL_CALENDAR_VERSION) });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`GHL free-slots failed (${res.status}): ${detail}`);
  }

  const raw = await res.json();
  // Shape: { "2026-07-16": { slots: [...] }, ..., traceId: "..." }
  const days: Record<string, string[]> = {};
  for (const key of Object.keys(raw)) {
    const value = raw[key];
    if (value && Array.isArray(value.slots) && value.slots.length > 0) {
      days[key] = value.slots;
    }
  }
  return days;
}

/**
 * Book an appointment for an existing contact on a calendar.
 * endTime is optional — GHL derives it from the calendar's slot duration.
 */
export async function createAppointment(params: {
  calendarId: string;
  contactId: string;
  startTime: string; // ISO 8601 with offset, straight from getFreeSlots
  endTime?: string;
  title?: string;
  timezone?: string;
}): Promise<{ appointmentId: string | undefined; raw: unknown }> {
  const { token, locationId } = getCredentials();

  const body: Record<string, unknown> = {
    calendarId: params.calendarId,
    locationId,
    contactId: params.contactId,
    startTime: params.startTime,
    appointmentStatus: "confirmed",
    ignoreDateRange: false,
    toNotify: true,
  };
  if (params.endTime) body.endTime = params.endTime;
  if (params.title) body.title = params.title;

  const res = await fetch(`${GHL_API_BASE}/calendars/events/appointments`, {
    method: "POST",
    headers: headers(token, GHL_CALENDAR_VERSION),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`GHL create-appointment failed (${res.status}): ${detail}`);
  }

  const raw = await res.json();
  const appointmentId: string | undefined = raw?.id ?? raw?.appointment?.id;
  return { appointmentId, raw };
}
