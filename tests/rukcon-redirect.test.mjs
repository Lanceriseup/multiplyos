// /rukcon, where the RUKCON booth QR points. With the pricing v2 switch on it
// is a page (app/rukcon/page.tsx), so no redirect may shadow it. With the
// switch off it falls back to the event link: the home page with the demo
// modal open, tagged "rukcon" (lib/event-tag.ts).
//
// /rukcon-demo, the RUKCON demo QR, is that event link whatever the switch says.
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

async function redirectsWith(site, annual) {
  for (const [k, v] of [[KEYS[0], site], [KEYS[1], annual]]) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  return (await nextConfig.redirects?.()) ?? [];
}

test("switch on: no redirect shadows the /rukcon page, with or without annual", async () => {
  for (const annual of [undefined, "1"]) {
    const redirects = await redirectsWith("1", annual);
    assert.equal(redirects.some((r) => r.source === "/rukcon"), false);
  }
});

const DEMO = "/?demo=open&utm_source=rukcon&utm_medium=qr";

test("switch off: /rukcon is the temporary event link into the demo modal", async () => {
  for (const site of [undefined, "0"]) {
    assert.deepEqual(await redirectsWith(site, undefined), [
      { source: "/rukcon-demo", destination: DEMO, permanent: false },
      { source: "/rukcon", destination: DEMO, permanent: false },
    ]);
  }
});

test("/rukcon-demo is the temporary event link into the demo modal, switch on or off", async () => {
  for (const [site, annual] of [[undefined, undefined], ["0", undefined], ["1", undefined], ["1", "1"]]) {
    const redirects = await redirectsWith(site, annual);
    assert.deepEqual(
      redirects.find((r) => r.source === "/rukcon-demo"),
      { source: "/rukcon-demo", destination: DEMO, permanent: false },
    );
  }
});

test("the rest of the config is as it was", () => {
  assert.equal(nextConfig.reactStrictMode, true);
});
