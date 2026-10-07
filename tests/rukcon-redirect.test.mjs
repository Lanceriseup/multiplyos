// /rukcon is the page the RUKCON booth QR points at. It is a redirect into the
// SCALE annual trial with the RUKCON code applied, and it exists only while the
// pricing v2 switch is on: with the switch off the site has no /rukcon at all.
import test, { afterEach } from "node:test";
import assert from "node:assert/strict";

import nextConfig from "../next.config.mjs";
import { RUKCON_PROMO_CODE, appTrialUrl } from "../lib/app-links.mjs";

const KEY = "NEXT_PUBLIC_PRICING_V2";
const saved = process.env[KEY];

afterEach(() => {
  if (saved === undefined) delete process.env[KEY];
  else process.env[KEY] = saved;
});

async function redirectsWith(value) {
  if (value === undefined) delete process.env[KEY];
  else process.env[KEY] = value;
  return (await nextConfig.redirects?.()) ?? [];
}

const EXPECTED = [
  {
    source: "/rukcon",
    destination: "https://app.multiplyos.com/trial/signup?plan=scale&billing=annual&promo=RUKCON",
    // temporary (307), so the destination can change after the event
    permanent: false,
  },
];

test("switch off: no redirects at all", async () => {
  for (const value of [undefined, "", "0", "false", "TRUE"]) {
    assert.deepEqual(await redirectsWith(value), [], `switch ${JSON.stringify(value)}`);
  }
});

for (const value of ["1", "true"]) {
  test(`switch ${JSON.stringify(value)}: /rukcon redirects to the SCALE annual trial with the RUKCON code`, async () => {
    assert.deepEqual(await redirectsWith(value), EXPECTED);
  });
}

test("the redirect destination is built by appTrialUrl and the RUKCON code from the links module", async () => {
  const [redirect] = await redirectsWith("1");
  assert.equal(redirect.destination, appTrialUrl({ plan: "scale", billing: "annual", promo: RUKCON_PROMO_CODE }));
});

test("the redirect is temporary, never permanent", async () => {
  const [redirect] = await redirectsWith("1");
  assert.equal(redirect.permanent, false);
});

test("the rest of the config is as it was", () => {
  assert.equal(nextConfig.reactStrictMode, true);
});
