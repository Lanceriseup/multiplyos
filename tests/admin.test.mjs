import test from "node:test";
import assert from "node:assert/strict";

import {
  addDays,
  dayKey,
  dayStartMs,
  eachDay,
  parseRange,
  presetRange,
  previousRange,
  rangeBounds,
} from "../lib/admin/range";
import { createSessionToken, verifySessionToken } from "../lib/admin/session";
import { MAX_ATTEMPTS, WINDOW_MS, clearFailures, isLocked, recordFailure } from "../lib/admin/throttle";
import { isInternalEmail } from "../lib/admin/config";
import { leadTypes } from "../lib/admin/sources/ghl";

const TZ = "America/Chicago";

// ---- Date ranges --------------------------------------------------------------

test("presets resolve against today", () => {
  const today = "2026-11-06"; // a Friday
  assert.deepEqual(presetRange("today", today), { start: today, end: today });
  assert.deepEqual(presetRange("yesterday", today), { start: "2026-11-05", end: "2026-11-05" });
  assert.deepEqual(presetRange("7d", today), { start: "2026-10-31", end: today });
  assert.deepEqual(presetRange("30d", today), { start: "2026-10-08", end: today });
  assert.equal(eachDay(presetRange("90d", today)).length, 90);
});

test("last weekend is the most recent Saturday and Sunday that are over", () => {
  // Friday → the Sat/Sun just gone
  assert.deepEqual(presetRange("last-weekend", "2026-11-06"), { start: "2026-10-31", end: "2026-11-01" });
  // Saturday → the weekend before (today is not over)
  assert.deepEqual(presetRange("last-weekend", "2026-11-07"), { start: "2026-10-31", end: "2026-11-01" });
  // Sunday → still the weekend before
  assert.deepEqual(presetRange("last-weekend", "2026-11-08"), { start: "2026-10-31", end: "2026-11-01" });
  // Monday → the weekend just finished
  assert.deepEqual(presetRange("last-weekend", "2026-11-09"), { start: "2026-11-07", end: "2026-11-08" });
});

test("previous period has the same length and ends the day before", () => {
  assert.deepEqual(previousRange({ start: "2026-11-01", end: "2026-11-06" }), {
    start: "2026-10-26",
    end: "2026-10-31",
  });
  assert.deepEqual(previousRange({ start: "2026-03-01", end: "2026-03-01" }), {
    start: "2026-02-28",
    end: "2026-02-28",
  });
});

test("day boundaries follow the reporting timezone, including DST changes", () => {
  // Chicago is UTC-5 in summer, UTC-6 in winter.
  assert.equal(new Date(dayStartMs("2026-07-01", TZ)).toISOString(), "2026-07-01T05:00:00.000Z");
  assert.equal(new Date(dayStartMs("2026-12-01", TZ)).toISOString(), "2026-12-01T06:00:00.000Z");
  // DST ended 2026-11-01: that day is 25 hours long.
  const { from, to } = rangeBounds({ start: "2026-11-01", end: "2026-11-01" }, TZ);
  assert.equal((to - from) / 3_600_000, 25);
  // 11:30 PM Chicago on Nov 5 is still Nov 5 there, though Nov 6 in UTC.
  assert.equal(dayKey(Date.parse("2026-11-06T05:30:00Z"), TZ), "2026-11-05");
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
});

test("parseRange validates, clamps to today and defaults to 30 days", () => {
  const today = "2026-11-06";
  const q = (s) => new URLSearchParams(s);
  assert.deepEqual(parseRange(q(""), today).range, presetRange("30d", today));
  assert.deepEqual(parseRange(q("start=2026-11-01&end=2026-11-03"), today).range, {
    start: "2026-11-01",
    end: "2026-11-03",
  });
  assert.equal(parseRange(q("start=2026-11-01&end=2026-11-31"), today).error !== undefined, true);
  assert.equal(parseRange(q("start=2026-11-05&end=2026-11-01"), today).error !== undefined, true);
  assert.deepEqual(parseRange(q("start=2026-11-01&end=2027-01-01"), today).range, {
    start: "2026-11-01",
    end: today,
  });
  assert.equal(eachDay(parseRange(q("start=2020-01-01&end=2026-11-06"), today).range).length, 366);
});

// ---- Session ------------------------------------------------------------------

test("session tokens verify with the right secret only, and expire", async () => {
  const now = 1_800_000_000_000;
  const token = await createSessionToken("secret-a", now, 60_000);
  assert.equal(await verifySessionToken(token, "secret-a", now), true);
  assert.equal(await verifySessionToken(token, "secret-b", now), false);
  assert.equal(await verifySessionToken(token, "secret-a", now + 60_001), false);
  assert.equal(await verifySessionToken(undefined, "secret-a", now), false);
  assert.equal(await verifySessionToken(token, undefined, now), false);
});

test("a session token with a changed expiry is rejected", async () => {
  const now = 1_800_000_000_000;
  const [v, , sig] = (await createSessionToken("s", now, 60_000)).split(".");
  const forged = `${v}.${now + 10 ** 12}.${sig}`;
  assert.equal(await verifySessionToken(forged, "s", now), false);
  assert.equal(await verifySessionToken("v1.notanumber.abc", "s", now), false);
  assert.equal(await verifySessionToken("garbage", "s", now), false);
});

// ---- Login throttle -----------------------------------------------------------

test("login locks after the maximum failures and unlocks after the window", () => {
  const key = "203.0.113.9";
  const t0 = 1_000_000;
  for (let i = 0; i < MAX_ATTEMPTS - 1; i++) recordFailure(key, t0);
  assert.equal(isLocked(key, t0), false);
  recordFailure(key, t0);
  assert.equal(isLocked(key, t0), true);
  assert.equal(isLocked(key, t0 + WINDOW_MS + 1), false);
  clearFailures(key);
  assert.equal(isLocked(key, t0), false);
});

// ---- Counting rules -----------------------------------------------------------

test("lead types come from the tags the site's forms write", () => {
  assert.deepEqual(leadTypes(["website-lead", "demo-request"]), ["demo"]);
  assert.deepEqual(leadTypes(["Coaching-Call-Request", "mos-coaching-lead"]), ["coaching"]);
  assert.deepEqual(leadTypes(["website-lead", "contact-form"]), ["contact"]);
  assert.deepEqual(leadTypes(["demo-request", "mos-coaching-lead"]), ["demo", "coaching"]);
  assert.deepEqual(leadTypes(["mos-bblive-lead"]), []);
  assert.deepEqual(leadTypes(undefined), []);
});

test("staff and test emails are recognised", () => {
  const patterns = ["@riseupkings.com", "+test"];
  assert.equal(isInternalEmail("Lance@RiseUpKings.com", patterns), true);
  assert.equal(isInternalEmail("someone+test@gmail.com", patterns), true);
  assert.equal(isInternalEmail("owner@acme.com", patterns), false);
});
