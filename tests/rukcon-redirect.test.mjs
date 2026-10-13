// /rukcon is a page now (app/rukcon/page.tsx), not a redirect: the booth QR
// opens the pricing page with the RUKCON offer and the code on every trial
// link. The config must not shadow the page with a redirect, whatever the
// pricing v2 flags say.
import test, { afterEach } from "node:test";
import assert from "node:assert/strict";

import nextConfig from "../next.config.mjs";

const KEYS = ["NEXT_PUBLIC_PRICING_V2", "NEXT_PUBLIC_PRICING_V2_ANNUAL"];
const saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]));

afterEach(() => {
  for (const k of KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

test("no redirect shadows /rukcon, with any combination of the flags", async () => {
  for (const site of [undefined, "1"]) {
    for (const annual of [undefined, "1"]) {
      if (site === undefined) delete process.env.NEXT_PUBLIC_PRICING_V2;
      else process.env.NEXT_PUBLIC_PRICING_V2 = site;
      if (annual === undefined) delete process.env.NEXT_PUBLIC_PRICING_V2_ANNUAL;
      else process.env.NEXT_PUBLIC_PRICING_V2_ANNUAL = annual;
      const redirects = (await nextConfig.redirects?.()) ?? [];
      assert.equal(redirects.some((r) => r.source === "/rukcon"), false);
    }
  }
});

test("the rest of the config is as it was", () => {
  assert.equal(nextConfig.reactStrictMode, true);
});
