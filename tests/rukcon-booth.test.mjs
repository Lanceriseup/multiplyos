// /rukcon is the booth page the RUKCON QR opens: the pricing page with the
// RUKCON offer on top and the RUKCON code on every trial link. Its words live
// in lib/rukcon-booth.ts. The app honors the offer (Launch included) when a
// RUKCON trial is on annual SCALE or MULTIPLY by Oct 31.
import test from "node:test";
import assert from "node:assert/strict";

import * as booth from "../lib/rukcon-booth";
import { RUKCON_PROMO_CODE } from "../lib/app-links.mjs";

const NO_EM_DASH = /—/;

test("the booth page links carry the RUKCON code", () => {
  assert.equal(booth.BOOTH_PROMO_CODE, RUKCON_PROMO_CODE);
});

test("annual on: the offer names annual SCALE, the $1,000 value and the Oct 31 deadline", () => {
  const offer = booth.boothOffer(true);
  assert.match(offer.title, /annual SCALE/);
  assert.match(offer.body, /\$1,000 value/);
  assert.match(offer.body, /October 31/);
  assert.deepEqual(offer.steps, ["Pick annual SCALE", "Start your 14-day trial", "Go live with our team"]);
});

test("annual off: the offer still explains how to earn it, by switching to annual by Oct 31", () => {
  const offer = booth.boothOffer(false);
  assert.match(offer.body, /switch to annual billing by October 31/);
});

test("the SCALE card line appears only on annual billing", () => {
  assert.equal(booth.boothPlanLine("scale", "annual"), "LAUNCH onboarding included ($1,000 value), RUKCON offer");
  assert.equal(booth.boothPlanLine("scale", "monthly"), null);
  assert.equal(booth.boothPlanLine("grow", "annual"), null);
  assert.equal(booth.boothPlanLine("multiply", "annual"), null, "MULTIPLY annual already lists Launch");
});

test("no em dash anywhere in the booth copy", () => {
  for (const annual of [true, false]) {
    const offer = booth.boothOffer(annual);
    for (const s of [offer.eyebrow, offer.title, offer.body, ...offer.steps]) assert.doesNotMatch(s, NO_EM_DASH);
  }
});

test("the booth code is an approved event tag, so booth demo requests are tagged in GHL", async () => {
  const { eventTag } = await import("../lib/event-tag");
  assert.equal(eventTag(booth.BOOTH_PROMO_CODE), "rukcon");
});
