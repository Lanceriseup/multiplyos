// The words around the numbers on the pricing page: plan cards, the HQ add-ons,
// the setup packages, the comparison table (and its "show differences only"
// filter) and the FAQ. The numbers themselves are tested in
// pricing-tiers.test.mjs.
import test from "node:test";
import assert from "node:assert/strict";

import * as copy from "../lib/pricing-copy";
import * as tiers from "../lib/pricing-tiers";

const { FAQ, FEATURE_GROUPS, HQ_ADDONS, PLANS, SETUP_PACKAGES, visibleFeatureGroups } = copy;
const { PLAN_ORDER } = tiers;

// ---- add-ons and setup packages ----------------------------------------------

test("the four HQ modules, with Marketing HQ marked Coming Q1", () => {
  assert.deepEqual(
    HQ_ADDONS.map((a) => [a.name, a.comingSoon ?? null]),
    [
      ["Contractor HQ", null],
      ["Inventory HQ", null],
      ["Events HQ", null],
      ["Marketing HQ", "Coming Q1"],
    ],
  );
});

test("setup packages run Launch, Accelerate, Momentum at the setup prices", () => {
  assert.deepEqual(
    SETUP_PACKAGES.map((s) => [s.name, s.price]),
    [
      ["LAUNCH", tiers.SETUP_PRICE.launch],
      ["ACCELERATE", tiers.SETUP_PRICE.accelerate],
      ["MOMENTUM", tiers.SETUP_PRICE.momentum],
    ],
  );
});

test("only Launch carries Included with MULTIPLY", () => {
  assert.deepEqual(
    SETUP_PACKAGES.map((s) => s.included ?? null),
    ["Included with MULTIPLY", null, null],
  );
});

// ---- plan cards --------------------------------------------------------------

test("plan copy: names, who they are for, and what each builds on", () => {
  assert.deepEqual(
    PLAN_ORDER.map((p) => [PLANS[p].name, PLANS[p].lead]),
    [
      ["GROW", null],
      ["SCALE", "Everything in GROW, plus"],
      ["MULTIPLY", "Everything in SCALE, plus"],
    ],
  );
  for (const p of PLAN_ORDER) {
    assert.ok(PLANS[p].who.length > 0, `${p} has a who`);
    assert.ok(PLANS[p].items.length >= 5, `${p} has a real list`);
  }
});

test("plan cards state the Launch value and the HQ inclusion from the same numbers", () => {
  assert.ok(PLANS.multiply.items.includes("Any 2 HQ modules included"));
  assert.ok(PLANS.multiply.items.includes("Launch onboarding included ($1,000 value)"));
});

// ---- compare table -----------------------------------------------------------

test("compare table: three groups and 23 rows, each with a value for all three plans", () => {
  assert.deepEqual(
    FEATURE_GROUPS.map((g) => [g.name, g.rows.length]),
    [
      ["The core", 8],
      ["Business modules", 12],
      ["Whole company", 3],
    ],
  );
  for (const g of FEATURE_GROUPS) {
    for (const r of g.rows) {
      assert.equal(r.values.length, 3, r.name);
      for (const v of r.values) {
        assert.ok(typeof v === "boolean" || (typeof v === "string" && v.length > 0), `${r.name}: ${String(v)}`);
      }
    }
  }
});

test("compare table: Forms and e-signatures and performance reviews are tagged as coming", () => {
  const rows = FEATURE_GROUPS.flatMap((g) => g.rows);
  const tagged = rows.filter((r) => r.tag).map((r) => [r.name, r.tag]);
  assert.deepEqual(tagged, [
    ["Performance reviews and engagement surveys", "Coming Q4"],
    ["Forms and e-signatures", "Coming soon"],
  ]);
});

test("show differences only drops the six rows that read the same on every plan", () => {
  const all = visibleFeatureGroups(false);
  assert.equal(all.flatMap((g) => g.rows).length, 23);

  const diff = visibleFeatureGroups(true);
  const kept = diff.flatMap((g) => g.rows).map((r) => r.name);
  assert.equal(kept.length, 17);
  for (const same of [
    "One Page Plan",
    "Leadership meetings, team meetings and 1-on-1s",
    "Org chart",
    "Quarterly Execution Plan",
    "Projects and tasks",
    "MOS Scribe",
  ]) {
    assert.ok(!kept.includes(same), `${same} should be hidden`);
  }
  for (const differs of ["Scoreboards", "Multi AI and Hubs", "CRM and pipelines", "Launch onboarding"]) {
    assert.ok(kept.includes(differs), `${differs} should stay`);
  }
});

test("show differences only never returns an empty group", () => {
  for (const g of visibleFeatureGroups(true)) assert.ok(g.rows.length > 0, g.name);
});

test("visibleFeatureGroups does not mutate the source table", () => {
  const before = JSON.stringify(FEATURE_GROUPS);
  visibleFeatureGroups(true);
  visibleFeatureGroups(false);
  assert.equal(JSON.stringify(FEATURE_GROUPS), before);
});

// ---- FAQ ---------------------------------------------------------------------

test("FAQ has the six approved questions, trial question first", () => {
  assert.equal(FAQ.length, 6);
  assert.equal(FAQ[0].q, "Do I need a credit card to start the trial?");
  for (const item of FAQ) {
    assert.ok(item.q.endsWith("?"), item.q);
    assert.ok(item.a.length > 0, item.q);
  }
});

// ---- copy rules --------------------------------------------------------------

function strings(value, out = []) {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) strings(v, out);
  else if (value && typeof value === "object") for (const v of Object.values(value)) strings(v, out);
  return out;
}

const copyStrings = () => strings(Object.values({ ...tiers, ...copy }).filter((v) => typeof v !== "function"));

// Built from its code point so this file does not itself contain the character.
const EM_DASH = String.fromCharCode(0x2014);

test("no em dash and no exclamation mark anywhere in the page copy or the price labels", () => {
  const all = copyStrings();
  assert.ok(all.length > 60, `only found ${all.length} strings, the walk is broken`);
  for (const s of all) {
    assert.ok(!s.includes(EM_DASH), `em dash in: ${s}`);
    assert.ok(!s.includes("!"), `exclamation mark in: ${s}`);
  }
});

test("the dollar figures written into the copy match the price table", () => {
  const text = copyStrings().join("\n");
  assert.ok(text.includes(`${tiers.money(tiers.SETUP_PRICE.launch)} value`), "Launch value");
  assert.ok(text.includes(`${tiers.money(tiers.HQ_PRICE_PER_MONTH)}/mo each`), "HQ price");
  assert.ok(text.includes(`${tiers.money(tiers.GROW_ADDON_PRICE_PER_MONTH)}/mo add-on`), "GROW add-on price");
  assert.ok(text.includes(`${tiers.money(tiers.FORMS_ADDON_PRICE_PER_MONTH)}/mo add-on`), "forms add-on price");
  assert.ok(text.includes(`${tiers.money(tiers.AI_MONTHLY_CAP_DEFAULT)} by default`), "AI cap");
});
