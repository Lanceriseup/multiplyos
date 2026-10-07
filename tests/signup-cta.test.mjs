// What every Sign up button on the site links to and says. With the switch off
// it is today's signup page and "Sign up", unchanged. With it on it is the SCALE
// annual trial and "Start free trial".
import test, { afterEach } from "node:test";
import assert from "node:assert/strict";

import { signupCta } from "../lib/signup-cta";

const KEY = "NEXT_PUBLIC_PRICING_V2";
const saved = process.env[KEY];

afterEach(() => {
  if (saved === undefined) delete process.env[KEY];
  else process.env[KEY] = saved;
});

function ctaWith(value) {
  if (value === undefined) delete process.env[KEY];
  else process.env[KEY] = value;
  return signupCta();
}

const TODAY = { href: "https://app.multiplyos.com/signup", label: "Sign up" };
const TRIAL = {
  href: "https://app.multiplyos.com/trial/signup?plan=scale&billing=annual",
  label: "Start free trial",
};

test("switch unset: today's signup link and label", () => {
  assert.deepEqual(ctaWith(undefined), TODAY);
});

for (const value of ["", "0", "false", "TRUE", "yes", " 1"]) {
  test(`switch ${JSON.stringify(value)}: still today's signup link and label`, () => {
    assert.deepEqual(ctaWith(value), TODAY);
  });
}

for (const value of ["1", "true"]) {
  test(`switch ${JSON.stringify(value)}: the SCALE annual trial and "Start free trial"`, () => {
    assert.deepEqual(ctaWith(value), TRIAL);
  });
}
