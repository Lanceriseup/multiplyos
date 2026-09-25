/**
 * Every GoHighLevel contact this site writes carries a name.
 *
 * The forms mark their name inputs `required`, but a browser accepts a
 * whitespace-only value for `required`, and the API routes only checked the
 * email, so a blank name reached GHL as an email-only contact. The routes now
 * reject a blank or whitespace-only name with a 400 before any GHL write, and
 * `upsertContact` logs CONTACT_NAME_MISSING if a name-less write ever happens
 * anyway (a future caller, a bypassed route).
 */

/** Fixed marker for runtime-error alerts / grep. Logged with ids only, never PII. */
export const CONTACT_NAME_MISSING = "MULTIPLYOS_WEBSITE_CONTACT_NAME_MISSING";

/** 400 message for the single "Name" field (demo + contact forms). */
export const NAME_REQUIRED_ERROR = "Please enter your name.";

/** 400 message for the split first/last fields (coaching-call form). */
export const FIRST_LAST_REQUIRED_ERROR = "Please enter your first and last name.";

/** Trimmed, single-spaced string; anything that isn't a string is "". */
export function cleanName(value: unknown): string {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

/** "Jordan  Lee Smith " → { firstName: "Jordan", lastName: "Lee Smith" }. */
export function splitFullName(value: unknown): { firstName: string; lastName: string } {
  const [firstName = "", ...rest] = cleanName(value).split(" ").filter(Boolean);
  return { firstName, lastName: rest.join(" ") };
}
