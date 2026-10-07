// What every Sign up button on the site links to and says. With the main switch
// off it is today's signup page and "Sign up", unchanged. With it on it is the
// SCALE trial and "Start free trial": billed annually when annual billing is on,
// monthly when the site launches monthly only.
import test, { afterEach } from "node:test";
import assert from "node:assert/strict";

import { signupCta } from "../lib/signup-cta";

const KEY = "NEXT_PUBLIC_PRICING_V2";
const ANNUAL_KEY = "NEXT_PUBLIC_PRICING_V2_ANNUAL";
const saved = { [KEY]: process.env[KEY], [ANNUAL_KEY]: process.env[ANNUAL_KEY] };

afterEach(() => {
  for (const k of [KEY, ANNUAL_KEY]) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

function ctaWith(site, annual) {
  for (const [k, v] of [
    [KEY, site],
    [ANNUAL_KEY, annual],
  ]) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  return signupCta();
}

const TODAY = { href: "https://app.multiplyos.com/signup", label: "Sign up" };
const TRIAL_ANNUAL = {
  href: "https://app.multiplyos.com/trial/signup?plan=scale&billing=annual",
  label: "Start free trial",
};
const TRIAL_MONTHLY = {
  href: "https://app.multiplyos.com/trial/signup?plan=scale&billing=monthly",
  label: "Start free trial",
};

test("both switches unset: today's signup link and label", () => {
  assert.deepEqual(ctaWith(undefined, undefined), TODAY);
});

for (const site of ["", "0", "false", "TRUE", "yes", " 1"]) {
  test(`main switch ${JSON.stringify(site)}: still today's signup link and label, with or without the annual flag`, () => {
    assert.deepEqual(ctaWith(site, undefined), TODAY);
    assert.deepEqual(ctaWith(site, "1"), TODAY);
  });
}

test("annual flag alone does nothing: today's signup link and label", () => {
  assert.deepEqual(ctaWith(undefined, "1"), TODAY);
  assert.deepEqual(ctaWith(undefined, "true"), TODAY);
});

for (const site of ["1", "true"]) {
  test(`main switch ${JSON.stringify(site)} alone is the monthly only launch: SCALE monthly trial and "Start free trial"`, () => {
    assert.deepEqual(ctaWith(site, undefined), TRIAL_MONTHLY);
  });

  for (const annual of ["", "0", "false", "TRUE", "yes", " 1"]) {
    test(`main switch ${JSON.stringify(site)} with the annual flag ${JSON.stringify(annual)} stays monthly only`, () => {
      assert.deepEqual(ctaWith(site, annual), TRIAL_MONTHLY);
    });
  }

  for (const annual of ["1", "true"]) {
    test(`main switch ${JSON.stringify(site)} with the annual flag ${JSON.stringify(annual)}: SCALE annual trial and "Start free trial"`, () => {
      assert.deepEqual(ctaWith(site, annual), TRIAL_ANNUAL);
    });
  }
}
