// The pricing v2 switches. The marketing site must look and behave exactly as it
// does today until NEXT_PUBLIC_PRICING_V2 is "1" or "true" at build time, so the
// rule for reading it is tested as hard as the flag itself. A second flag,
// NEXT_PUBLIC_PRICING_V2_ANNUAL, only matters once the first is on: it decides
// whether the site offers annual billing or launches monthly only (the app blocks
// annual checkout until counsel approves the annual consent text).
import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

import { leadBilling, pricingV2AnnualEnabled, pricingV2SiteEnabled } from "../lib/pricing-v2";

const KEY = "NEXT_PUBLIC_PRICING_V2";
const ANNUAL_KEY = "NEXT_PUBLIC_PRICING_V2_ANNUAL";
const saved = { [KEY]: process.env[KEY], [ANNUAL_KEY]: process.env[ANNUAL_KEY] };

afterEach(() => {
  for (const k of [KEY, ANNUAL_KEY]) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

function setFlags(site, annual) {
  for (const [k, v] of [
    [KEY, site],
    [ANNUAL_KEY, annual],
  ]) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
}

function flagIs(value) {
  setFlags(value, undefined);
  return pricingV2SiteEnabled();
}

function annualIs(site, annual) {
  setFlags(site, annual);
  return pricingV2AnnualEnabled();
}

const NOT_ON = ["", "0", "false", "TRUE", "True", "yes", "on", " 1", "1 ", "01", "2", "true "];

// ---- the main switch ---------------------------------------------------------

test("off when the variable is not set", () => {
  assert.equal(flagIs(undefined), false);
});

for (const value of ["1", "true"]) {
  test(`on for exactly ${JSON.stringify(value)}`, () => {
    assert.equal(flagIs(value), true);
  });
}

for (const value of NOT_ON) {
  test(`off for ${JSON.stringify(value)}`, () => {
    assert.equal(flagIs(value), false);
  });
}

test("the annual flag never turns the main switch on or off", () => {
  setFlags("1", undefined);
  assert.equal(pricingV2SiteEnabled(), true);
  setFlags(undefined, "1");
  assert.equal(pricingV2SiteEnabled(), false);
  setFlags("1", "1");
  assert.equal(pricingV2SiteEnabled(), true);
});

// ---- the annual switch -------------------------------------------------------

test("annual billing is off when nothing is set", () => {
  assert.equal(annualIs(undefined, undefined), false);
});

for (const site of ["1", "true"]) {
  for (const annual of ["1", "true"]) {
    test(`annual billing is on with the main switch ${JSON.stringify(site)} and the annual flag ${JSON.stringify(annual)}`, () => {
      assert.equal(annualIs(site, annual), true);
    });
  }
}

test("annual billing is off when only the main switch is on (the monthly only launch)", () => {
  assert.equal(annualIs("1", undefined), false);
  assert.equal(annualIs("true", undefined), false);
});

for (const site of [undefined, ...NOT_ON]) {
  test(`annual billing needs the main switch: off for the annual flag "1" with the main switch ${JSON.stringify(site)}`, () => {
    assert.equal(annualIs(site, "1"), false);
  });
}

for (const annual of NOT_ON) {
  test(`annual billing is off for the annual flag ${JSON.stringify(annual)}, even with the main switch on`, () => {
    assert.equal(annualIs("1", annual), false);
  });
}

// ---- the billing the site leads with ------------------------------------------

test("the site leads with annual billing only when annual billing is on, otherwise monthly", () => {
  setFlags("1", "1");
  assert.equal(leadBilling(), "annual");
  setFlags("true", "true");
  assert.equal(leadBilling(), "annual");
  setFlags("1", undefined);
  assert.equal(leadBilling(), "monthly");
  setFlags("1", "0");
  assert.equal(leadBilling(), "monthly");
  setFlags(undefined, "1");
  assert.equal(leadBilling(), "monthly");
});

// ---- where the variables are read ---------------------------------------------

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
const readersOf = (re) => scanned.filter((f) => re.test(readFileSync(f, "utf8"))).map(rel);

test("the main variable is read in exactly one source file", () => {
  assert.deepEqual(readersOf(/process\.env\.NEXT_PUBLIC_PRICING_V2\b/), ["lib/pricing-v2-switch.mjs"]);
});

test("the annual variable is read in exactly one source file, the same switch module", () => {
  assert.deepEqual(readersOf(/process\.env\.NEXT_PUBLIC_PRICING_V2_ANNUAL\b/), ["lib/pricing-v2-switch.mjs"]);
});

// .github/workflows/_vercel-build-deploy.yml scans app, components and lib for
// process.env.NEXT_PUBLIC_* and FAILS the deploy when a variable referenced
// without an inline `||` or `??` fallback is missing from the Vercel
// environment. Both flags are unset by design, so a bare reference would break
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

test("both flags are written up in .env.example", () => {
  const example = readFileSync(join(root, ".env.example"), "utf8");
  assert.ok(example.includes(`${KEY}=`), "main flag");
  assert.ok(example.includes(`${ANNUAL_KEY}=`), "annual flag");
});
