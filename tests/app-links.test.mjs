// The single source for every link from multiplyos.com into the product app.
import test from "node:test";
import assert from "node:assert/strict";

import {
  BILLING_PERIODS,
  PLAN_IDS,
  RUKCON_PROMO_CODE,
  appSignupUrl,
  appTrialUrl,
} from "../lib/app-links.mjs";

const TRIAL = "https://app.multiplyos.com/trial/signup";

test("appSignupUrl is today's signup link, unchanged", () => {
  assert.equal(appSignupUrl(), "https://app.multiplyos.com/signup");
});

test("plans and billing periods are the three tiers and the two intervals", () => {
  assert.deepEqual([...PLAN_IDS], ["grow", "scale", "multiply"]);
  assert.deepEqual([...BILLING_PERIODS], ["annual", "monthly"]);
});

for (const plan of ["grow", "scale", "multiply"]) {
  for (const billing of ["annual", "monthly"]) {
    test(`appTrialUrl for ${plan} billed ${billing}`, () => {
      assert.equal(appTrialUrl({ plan, billing }), `${TRIAL}?plan=${plan}&billing=${billing}`);
    });
  }
}

test("promo is appended after plan and billing", () => {
  assert.equal(
    appTrialUrl({ plan: "scale", billing: "annual", promo: "RUKCON" }),
    `${TRIAL}?plan=scale&billing=annual&promo=RUKCON`,
  );
});

test("promo is left out when missing or blank", () => {
  const bare = `${TRIAL}?plan=scale&billing=annual`;
  for (const promo of [undefined, null, "", "   "]) {
    assert.equal(appTrialUrl({ plan: "scale", billing: "annual", promo }), bare, `promo ${JSON.stringify(promo)}`);
  }
});

test("promo is trimmed and URL encoded", () => {
  assert.equal(
    appTrialUrl({ plan: "grow", billing: "monthly", promo: " A B&C=1 " }),
    `${TRIAL}?plan=grow&billing=monthly&promo=A%20B%26C%3D1`,
  );
});

test("an unknown plan or billing period throws instead of shipping a dead link", () => {
  assert.throws(() => appTrialUrl({ plan: "pro", billing: "annual" }), RangeError);
  assert.throws(() => appTrialUrl({ plan: "scale", billing: "weekly" }), RangeError);
  assert.throws(() => appTrialUrl({ plan: undefined, billing: "annual" }), RangeError);
  assert.throws(() => appTrialUrl({ plan: "scale" }), RangeError);
});

test("the RUKCON promo code is RUKCON (Ashley names the final code)", () => {
  assert.equal(RUKCON_PROMO_CODE, "RUKCON");
});
