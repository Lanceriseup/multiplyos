/**
 * GoHighLevel reader for the admin dashboard: website leads (contacts) and
 * demo bookings (calendar events). Read-only; uses the same Private
 * Integration Token as the site's forms (needs contacts.readonly and
 * calendars/events.readonly).
 */

import { EVENT_TAGS } from "@/lib/event-tag";
import { isInternalEmail } from "../config";
import { dayKey, eachDay, rangeBounds, type DayRange } from "../range";
import {
  failed,
  notConfigured,
  type Demo,
  type DemosReport,
  type Lead,
  type LeadCounts,
  type LeadType,
  type LeadsReport,
  type Source,
} from "../types";

const API = "https://services.leadconnectorhq.com";
const PAGE_LIMIT = 500;
const MAX_PAGES = 20; // GHL search stops at 10,000 results
const TIMEOUT_MS = 20_000;

/**
 * The tags the site's forms write (app/api/lead, app/api/coaching-lead).
 * /api/lead tags "website-lead" plus its source slug: "demo-request" for the
 * demo form, "contact-form" for the contact page.
 */
const TYPE_TAGS: Record<LeadType, string[]> = {
  demo: ["demo-request"],
  coaching: ["coaching-call-request", "mos-coaching-lead"],
  contact: ["contact-form"],
};

interface GhlContact {
  id: string;
  dateAdded?: string;
  firstName?: string;
  lastName?: string;
  contactName?: string;
  email?: string;
  companyName?: string;
  source?: string;
  tags?: string[];
}

interface GhlEvent {
  id: string;
  title?: string;
  appointmentStatus?: string;
  startTime?: string;
  dateAdded?: string;
  deleted?: boolean;
}

function credentials() {
  const token = process.env.GHL_PRIVATE_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;
  return token && locationId ? { token, locationId } : null;
}

function headers(token: string, version: string) {
  return {
    Authorization: `Bearer ${token}`,
    Version: version,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

async function ghlFetch(url: string | URL, init: RequestInit): Promise<unknown> {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS), cache: "no-store" });
  if (!res.ok) {
    const detail = (await res.text().catch(() => "")).slice(0, 200);
    throw new Error(`HTTP ${res.status} ${detail}`);
  }
  return res.json();
}

export function leadTypes(tags: string[] | undefined): LeadType[] {
  const lower = (tags ?? []).map((t) => t.toLowerCase());
  return (Object.keys(TYPE_TAGS) as LeadType[]).filter((type) =>
    TYPE_TAGS[type].some((tag) => lower.includes(tag))
  );
}

function eventOf(tags: string[] | undefined): string | undefined {
  const lower = (tags ?? []).map((t) => t.toLowerCase());
  return (EVENT_TAGS as readonly string[]).find((e) => lower.includes(e));
}

function emptyCounts(): LeadCounts {
  return { total: 0, demo: 0, coaching: 0, contact: 0, event: 0 };
}

async function searchContacts(
  token: string,
  locationId: string,
  from: number,
  to: number
): Promise<{ contacts: GhlContact[]; truncated: boolean }> {
  const contacts: GhlContact[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const body = {
      locationId,
      page,
      pageLimit: PAGE_LIMIT,
      filters: [
        {
          field: "dateAdded",
          operator: "range",
          value: { gte: new Date(from).toISOString(), lte: new Date(to - 1).toISOString() },
        },
      ],
      sort: [{ field: "dateAdded", direction: "desc" }],
    };
    const raw = (await ghlFetch(`${API}/contacts/search`, {
      method: "POST",
      headers: headers(token, "2021-07-28"),
      body: JSON.stringify(body),
    })) as { contacts?: GhlContact[]; total?: number };
    const batch = raw.contacts ?? [];
    contacts.push(...batch);
    if (batch.length < PAGE_LIMIT || (raw.total !== undefined && contacts.length >= raw.total)) {
      return { contacts, truncated: false };
    }
  }
  return { contacts, truncated: true };
}

export async function leadsReport(
  range: DayRange,
  previous: DayRange,
  timeZone: string,
  internalPatterns: string[]
): Promise<Source<LeadsReport>> {
  const creds = credentials();
  if (!creds) return notConfigured("Set GHL_PRIVATE_TOKEN and GHL_LOCATION_ID.");

  try {
    const cur = rangeBounds(range, timeZone);
    const prev = rangeBounds(previous, timeZone);
    const { contacts, truncated } = await searchContacts(creds.token, creds.locationId, prev.from, cur.to);

    const current = emptyCounts();
    const prior = emptyCounts();
    const days = eachDay(range);
    const daily = new Map(days.map((d) => [d, { date: d, demo: 0, coaching: 0, contact: 0 }]));
    const leads: Lead[] = [];
    let excluded = 0;

    for (const c of contacts) {
      const types = leadTypes(c.tags);
      if (!types.length || !c.dateAdded) continue; // not from a website form
      const at = Date.parse(c.dateAdded);
      const inCurrent = at >= cur.from && at < cur.to;
      const inPrevious = at >= prev.from && at < prev.to;
      if (!inCurrent && !inPrevious) continue;
      if (c.email && isInternalEmail(c.email, internalPatterns)) {
        if (inCurrent) excluded++;
        continue;
      }

      const event = eventOf(c.tags);
      const bucket = inCurrent ? current : prior;
      bucket.total++;
      for (const t of types) bucket[t]++;
      if (event) bucket.event++;

      if (inCurrent) {
        const day = daily.get(dayKey(at, timeZone));
        if (day) for (const t of types) day[t]++;
        leads.push({
          id: c.id,
          dateAdded: c.dateAdded,
          name:
            [c.firstName, c.lastName].filter(Boolean).join(" ") || c.contactName || "",
          email: c.email ?? "",
          company: c.companyName ?? "",
          types,
          event,
          source: c.source?.trim() ?? "",
        });
      }
    }

    leads.sort((a, b) => b.dateAdded.localeCompare(a.dateAdded));
    return {
      available: true,
      data: {
        current,
        previous: prior,
        daily: [...daily.values()],
        leads,
        excluded: { count: excluded, patterns: internalPatterns },
        truncated,
      },
      warnings: truncated
        ? ["More than 10,000 contacts in this period; counts stop at the first 10,000."]
        : undefined,
    };
  } catch (err) {
    return failed(err, "GoHighLevel contacts");
  }
}

function toDemo(e: GhlEvent): Demo {
  return {
    id: e.id,
    title: e.title ?? "",
    status: (e.appointmentStatus ?? "unknown").toLowerCase(),
    startTime: e.startTime ?? "",
    bookedAt: e.dateAdded ?? null,
  };
}

/**
 * Demo bookings on GHL_CALENDAR_ID. "Booked" counts by the day the booking was
 * made; "held" counts demos whose start time falls in the range, by status.
 */
export async function demosReport(
  range: DayRange,
  previous: DayRange,
  timeZone: string
): Promise<Source<DemosReport>> {
  const creds = credentials();
  const calendarId = process.env.GHL_CALENDAR_ID;
  if (!creds || !calendarId) {
    return notConfigured("Set GHL_PRIVATE_TOKEN, GHL_LOCATION_ID and GHL_CALENDAR_ID.");
  }

  try {
    const cur = rangeBounds(range, timeZone);
    const prev = rangeBounds(previous, timeZone);
    const now = Date.now();
    // Bookings made in the range can be for dates well after it.
    const url = new URL(`${API}/calendars/events`);
    url.searchParams.set("locationId", creds.locationId);
    url.searchParams.set("calendarId", calendarId);
    url.searchParams.set("startTime", String(prev.from));
    url.searchParams.set("endTime", String(Math.max(cur.to, now) + 120 * 86_400_000));
    const raw = (await ghlFetch(url, { headers: headers(creds.token, "2021-04-15") })) as {
      events?: GhlEvent[];
    };
    const events = (raw.events ?? []).filter((e) => !e.deleted);

    const days = eachDay(range);
    const daily = new Map(days.map((d) => [d, { date: d, booked: 0 }]));
    const heldByStatus: Record<string, number> = {};
    const booked: Demo[] = [];
    const upcoming: Demo[] = [];
    let bookedPrevious = 0;

    for (const e of events) {
      const demo = toDemo(e);
      const bookedAt = Date.parse(demo.bookedAt ?? demo.startTime);
      const startAt = Date.parse(demo.startTime);

      if (bookedAt >= cur.from && bookedAt < cur.to) {
        booked.push(demo);
        const day = daily.get(dayKey(bookedAt, timeZone));
        if (day) day.booked++;
      } else if (bookedAt >= prev.from && bookedAt < prev.to) {
        bookedPrevious++;
      }
      if (startAt >= cur.from && startAt < cur.to) {
        heldByStatus[demo.status] = (heldByStatus[demo.status] ?? 0) + 1;
      }
      if (startAt >= now && demo.status !== "cancelled") upcoming.push(demo);
    }

    booked.sort((a, b) => (b.bookedAt ?? "").localeCompare(a.bookedAt ?? ""));
    upcoming.sort((a, b) => a.startTime.localeCompare(b.startTime));
    return {
      available: true,
      data: {
        bookedCurrent: booked.length,
        bookedPrevious,
        heldByStatus,
        daily: [...daily.values()],
        booked,
        upcoming,
      },
    };
  } catch (err) {
    return failed(err, "GoHighLevel calendar");
  }
}
