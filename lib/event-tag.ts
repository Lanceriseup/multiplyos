/**
 * Event attribution for QR codes / short links (e.g. multiplyos.com/rukcon).
 *
 * The short link redirects to `/?demo=open&utm_source=<event>` (see
 * next.config.mjs). The browser remembers the event for 30 days, so a visitor
 * who scans, leaves, and comes back later on the same device is still tagged
 * when they submit the demo form.
 *
 * Only events on this list become GHL tags; anything else in the URL or the
 * request body is ignored, so nobody can write arbitrary tags into GHL.
 * To add an event: add its tag here and a redirect in next.config.mjs.
 */
export const EVENT_TAGS = ["rukcon"] as const;

const STORAGE_KEY = "mos_event";
const REMEMBER_MS = 30 * 24 * 60 * 60 * 1000;

/** The approved event tag for `value`, or undefined. Safe on client and server. */
export function eventTag(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const tag = value.trim().toLowerCase();
  return (EVENT_TAGS as readonly string[]).includes(tag) ? tag : undefined;
}

/** Browser only. Storage can be blocked (private mode), so failures are ignored. */
export function rememberEvent(tag: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tag, at: Date.now() }));
  } catch {
    // attribution is best-effort
  }
}

/** Browser only. The remembered event tag if it is still within 30 days. */
export function recalledEvent(): string | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const { tag, at } = JSON.parse(raw);
    if (typeof at !== "number" || Date.now() - at > REMEMBER_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return undefined;
    }
    return eventTag(tag);
  } catch {
    return undefined;
  }
}
