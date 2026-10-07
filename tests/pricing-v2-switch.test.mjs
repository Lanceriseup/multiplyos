// The pricing v2 switch. The marketing site must look and behave exactly as it
// does today until NEXT_PUBLIC_PRICING_V2 is "1" or "true" at build time, so
// the rule for reading it is tested as hard as the flag itself.
import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

import { pricingV2SiteEnabled } from "../lib/pricing-v2";

const KEY = "NEXT_PUBLIC_PRICING_V2";
const saved = process.env[KEY];

afterEach(() => {
  if (saved === undefined) delete process.env[KEY];
  else process.env[KEY] = saved;
});

function flagIs(value) {
  if (value === undefined) delete process.env[KEY];
  else process.env[KEY] = value;
  return pricingV2SiteEnabled();
}

test("off when the variable is not set", () => {
  assert.equal(flagIs(undefined), false);
});

for (const value of ["1", "true"]) {
  test(`on for exactly ${JSON.stringify(value)}`, () => {
    assert.equal(flagIs(value), true);
  });
}

for (const value of ["", "0", "false", "TRUE", "True", "yes", "on", " 1", "1 ", "01", "2", "true "]) {
  test(`off for ${JSON.stringify(value)}`, () => {
    assert.equal(flagIs(value), false);
  });
}

// ---- where the variable is read ---------------------------------------------

const root = process.cwd();

function sourceFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...sourceFiles(full));
    else if (/\.(ts|tsx|js|mjs)$/.test(name)) out.push(full);
  }
  return out;
}

const scanned = [
  ...["app", "components", "lib"].flatMap((d) => sourceFiles(join(root, d))),
  join(root, "next.config.mjs"),
];

const rel = (f) => relative(root, f).split(sep).join("/");

test("the variable is read in exactly one source file", () => {
  const readers = scanned.filter((f) => /process\.env\.NEXT_PUBLIC_PRICING_V2\b/.test(readFileSync(f, "utf8")));
  assert.deepEqual(readers.map(rel), ["lib/pricing-v2-switch.mjs"]);
});

// .github/workflows/_vercel-build-deploy.yml scans app, components and lib for
// process.env.NEXT_PUBLIC_* and FAILS the deploy when a variable referenced
// without an inline `||` or `??` fallback is missing from the Vercel
// environment. This flag is unset by design, so a bare reference would break
// every preview and production deploy.
test("every NEXT_PUBLIC_ read carries an inline fallback, so the deploy check treats it as optional", () => {
  const bare = [];
  for (const f of scanned) {
    const text = readFileSync(f, "utf8");
    for (const m of text.matchAll(/process\.env\.(NEXT_PUBLIC_[A-Z0-9_]+)\b(?!\s*(\|\||\?\?))/g)) {
      bare.push(`${rel(f)}: ${m[1]}`);
    }
  }
  assert.deepEqual(bare, []);
});
