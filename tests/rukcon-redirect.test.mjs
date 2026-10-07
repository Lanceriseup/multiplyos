// /rukcon is the page the RUKCON booth QR points at. It is a redirect into the
// SCALE trial with the RUKCON code applied, and it exists only while the pricing
// v2 switch is on: with the switch off the site has no /rukcon at all. The trial
// is billed annually when annual billing is on and monthly when the site
// launches monthly only.
import test, { afterEach } from "node:test";
import assert from "node:assert/strict";

import nextConfig from "../next.config.mjs";
import { RUKCON_PROMO_CODE, appTrialUrl } from "../lib/app-links.mjs";

const KEY = "NEXT_PUBLIC_PRICING_V2";
const ANNUAL_KEY = "NEXT_PUBLIC_PRICING_V2_ANNUAL";
const saved = { [KEY]: process.env[KEY], [ANNUAL_KEY]: process.env[ANNUAL_KEY] };

afterEach(() => {
  for (const k of [KEY, ANNUAL_KEY]) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

async function redirectsWith(site, annual) {
  for (const [k, v] of [
    [KEY, site],
    [ANNUAL_KEY, annual],
  ]) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  return (await nextConfig.redirects?.()) ?? [];
}

const redirectTo = (billing) => [
  {
    source: "/rukcon",
    destination: `https://app.multiplyos.com/trial/signup?plan=scale&billing=${billing}&promo=RUKCON`,
    // temporary (307), so the destination can change after the event
    permanent: false,
  },
];

test("switch off: no redirects at all, whatever the annual flag says", async () => {
  for (const site of [undefined, "", "0", "false", "TRUE"]) {
    assert.deepEqual(await redirectsWith(site, undefined), [], `switch ${JSON.stringify(site)}`);
    assert.deepEqual(await redirectsWith(site, "1"), [], `switch ${JSON.stringify(site)} with the annual flag on`);
  }
});

for (const site of ["1", "true"]) {
  test(`switch ${JSON.stringify(site)} alone (monthly only): /rukcon redirects to the SCALE monthly trial with the RUKCON code`, async () => {
    assert.deepEqual(await redirectsWith(site, undefined), redirectTo("monthly"));
    assert.deepEqual(await redirectsWith(site, "0"), redirectTo("monthly"));
  });

  for (const annual of ["1", "true"]) {
    test(`switch ${JSON.stringify(site)} with the annual flag ${JSON.stringify(annual)}: /rukcon redirects to the SCALE annual trial with the RUKCON code`, async () => {
      assert.deepEqual(await redirectsWith(site, annual), redirectTo("annual"));
    });
  }
}

test("the redirect destination is built by appTrialUrl and the RUKCON code from the links module", async () => {
  const [annual] = await redirectsWith("1", "1");
  assert.equal(annual.destination, appTrialUrl({ plan: "scale", billing: "annual", promo: RUKCON_PROMO_CODE }));
  const [monthly] = await redirectsWith("1", undefined);
  assert.equal(monthly.destination, appTrialUrl({ plan: "scale", billing: "monthly", promo: RUKCON_PROMO_CODE }));
});

test("the redirect is temporary, never permanent", async () => {
  for (const annual of [undefined, "1"]) {
    const [redirect] = await redirectsWith("1", annual);
    assert.equal(redirect.permanent, false);
  }
});

test("the rest of the config is as it was", () => {
  assert.equal(nextConfig.reactStrictMode, true);
});
