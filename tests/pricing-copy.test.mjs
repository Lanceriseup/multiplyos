// The words around the numbers on the pricing page: plan cards, the HQ add-ons,
// the setup packages, the comparison table (and its "show differences only"
// filter), the FAQ and the page metadata. The numbers themselves are tested in
// pricing-tiers.test.mjs.
//
// Two modes matter here. With annual billing on, the page offers Annual and
// Monthly and Launch onboarding is included with annual MULTIPLY only (spec
// decision D2). With annual billing off (the monthly only launch, before counsel
// approves the annual consent text) the page must not say anything about annual
// billing or about Launch being included.
import test from "node:test";
import assert from "node:assert/strict";

import * as copy from "../lib/pricing-copy";
import * as tiers from "../lib/pricing-tiers";

const { FAQ, FEATURE_GROUPS, HQ_ADDONS, PLANS, SETUP_PACKAGES, faqItems, planItems, pricingMeta, visibleFeatureGroups, visibleSetupPackages } =
  copy;
const { PLAN_ORDER } = tiers;

const LAUNCH_LINE = "Launch onboarding included ($1,000 value)";
const SWITCH_PLANS_ANSWER = "Yes. You can switch plans at any time, and your whole company moves to the new plan together.";
const rowsOf = (groups) => groups.flatMap((g) => g.rows);

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
  for (const annual of [true, false]) {
    assert.deepEqual(
      visibleSetupPackages(annual).map((s) => [s.name, s.price]),
      [
        ["LAUNCH", tiers.SETUP_PRICE.launch],
        ["ACCELERATE", tiers.SETUP_PRICE.accelerate],
        ["MOMENTUM", tiers.SETUP_PRICE.momentum],
      ],
    );
  }
});

test("only Launch carries Included with MULTIPLY, on either billing", () => {
  for (const annual of [true, false]) {
    assert.deepEqual(
      visibleSetupPackages(annual).map((s) => s.included ?? null),
      ["Included with MULTIPLY", null, null],
    );
  }
});

test("visibleSetupPackages does not change the source table", () => {
  const before = JSON.stringify(SETUP_PACKAGES);
  visibleSetupPackages(false);
  visibleSetupPackages(true);
  assert.equal(JSON.stringify(SETUP_PACKAGES), before);
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
    for (const billing of ["annual", "monthly"]) assert.ok(planItems(p, billing).length >= 4, `${p} ${billing} has a real list`);
  }
});

test("MULTIPLY includes Launch onboarding on either billing, and the line sits second as designed", () => {
  for (const billing of ["annual", "monthly"]) {
    assert.deepEqual(planItems("multiply", billing), [
      "Any 2 HQ modules included",
      LAUNCH_LINE,
      "Additional businesses at 25% off",
      "Expanded AI connections",
      "Unlimited websites",
    ], billing);
  }
});

test("GROW and SCALE read the same on both billings", () => {
  for (const p of ["grow", "scale"]) assert.deepEqual(planItems(p, "annual"), planItems(p, "monthly"), p);
});

// ---- compare table -----------------------------------------------------------

test("compare table with annual billing: three groups and 23 rows, each with a value for all three plans", () => {
  assert.deepEqual(
    visibleFeatureGroups({ differencesOnly: false, annual: true }).map((g) => [g.name, g.rows.length]),
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

test("compare table: Launch onboarding is included on MULTIPLY, on either billing", () => {
  for (const annual of [true, false]) {
    const row = rowsOf(visibleFeatureGroups({ differencesOnly: false, annual })).find((r) => r.name === "Launch onboarding");
    assert.deepEqual([...row.values], [false, false, "Included"]);
    assert.equal(row.note, "$1,000 value");
  }
});

test("compare table, monthly only: all 23 rows stay, Launch onboarding included", () => {
  const rows = rowsOf(visibleFeatureGroups({ differencesOnly: false, annual: false }));
  assert.equal(rows.length, 23);
  assert.ok(rows.some((r) => r.name === "Launch onboarding"));
});

test("compare table: Forms and e-signatures and performance reviews are tagged as coming", () => {
  const tagged = rowsOf(FEATURE_GROUPS)
    .filter((r) => r.tag)
    .map((r) => [r.name, r.tag]);
  assert.deepEqual(tagged, [
    ["Performance reviews and engagement surveys", "Coming Q4"],
    ["Forms and e-signatures", "Coming soon"],
  ]);
});

test("show differences only drops the six rows that read the same on every plan", () => {
  assert.equal(rowsOf(visibleFeatureGroups({ differencesOnly: false, annual: true })).length, 23);

  const kept = rowsOf(visibleFeatureGroups({ differencesOnly: true, annual: true })).map((r) => r.name);
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

test("show differences only, monthly only: 17 rows, Launch onboarding among them", () => {
  const kept = rowsOf(visibleFeatureGroups({ differencesOnly: true, annual: false })).map((r) => r.name);
  assert.equal(kept.length, 17);
  assert.ok(kept.includes("Launch onboarding"));
});

test("show differences only never returns an empty group", () => {
  for (const annual of [true, false]) {
    for (const g of visibleFeatureGroups({ differencesOnly: true, annual })) assert.ok(g.rows.length > 0, g.name);
  }
});

test("visibleFeatureGroups does not mutate the source table", () => {
  const before = JSON.stringify(FEATURE_GROUPS);
  for (const annual of [true, false]) {
    visibleFeatureGroups({ differencesOnly: true, annual });
    visibleFeatureGroups({ differencesOnly: false, annual });
  }
  assert.equal(JSON.stringify(FEATURE_GROUPS), before);
});

// ---- FAQ ---------------------------------------------------------------------

test("FAQ has the six approved questions in both modes, trial question first", () => {
  for (const annual of [true, false]) {
    const items = faqItems(annual);
    assert.equal(items.length, 6);
    assert.equal(items[0].q, "Do I need a credit card to start the trial?");
    for (const item of items) {
      assert.ok(item.q.endsWith("?"), item.q);
      assert.ok(item.a.length > 0, item.q);
    }
  }
  assert.equal(FAQ.length, 6);
});

test("changing plans: a true answer that settles no open decision (no proration, downgrade or renewal rules)", () => {
  for (const annual of [true, false]) {
    const answer = faqItems(annual).find((i) => i.q === "Can I change plans later?").a;
    assert.equal(answer, SWITCH_PLANS_ANSWER);
  }
  for (const annual of [true, false]) {
    for (const item of faqItems(annual)) assert.ok(!/prorat|downgrad|renewal/i.test(item.a), `${item.q}: ${item.a}`);
  }
});

test("the setup answer: MULTIPLY includes Launch, on either billing", () => {
  for (const annual of [true, false]) {
    const answer = faqItems(annual).find((i) => i.q === "Can you set it up for us?").a;
    assert.equal(answer, "Yes. Setup packages start at $1,000 for teams up to 10, and MULTIPLY includes Launch onboarding.");
  }
});

test("what happens when the trial ends: annual billing is only mentioned when it is offered", () => {
  const on = faqItems(true).find((i) => i.q === "What happens when my trial ends?").a;
  const off = faqItems(false).find((i) => i.q === "What happens when my trial ends?").a;
  assert.ok(/annual and monthly/.test(on), on);
  assert.ok(!/annual/i.test(off), off);
  assert.ok(off.includes("You can switch plans before then."), off);
});

// ---- page metadata -----------------------------------------------------------

test("metadata from the monthly prices: $19, $39, $65, billed monthly, nothing annual", () => {
  const { description, short } = pricingMeta("monthly");
  for (const price of ["$19", "$39", "$65"]) assert.ok(description.includes(price), `${price} in ${description}`);
  assert.ok(short.includes("from $19"), short);
  for (const text of [description, short]) assert.ok(!/annual|save up to/i.test(text), text);
  for (const price of ["$15", "$29", "$49"]) assert.ok(!description.includes(price), `${price} should not be in ${description}`);
  assert.ok(description.includes("14-day free trial"), description);
});

test("metadata from the annual prices: $15, $29, $49 on annual billing", () => {
  const { description, short } = pricingMeta("annual");
  for (const price of ["$15", "$29", "$49"]) assert.ok(description.includes(price), `${price} in ${description}`);
  assert.ok(/annual/.test(description), description);
  assert.ok(short.includes("from $15") && /annually/.test(short), short);
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

// Everything a visitor can read on the page when annual billing is off.
function monthlyOnlyCopy() {
  return [
    ...PLAN_ORDER.flatMap((p) => [PLANS[p].name, PLANS[p].who, PLANS[p].lead ?? "", ...planItems(p, "monthly")]),
    ...strings(visibleFeatureGroups({ differencesOnly: false, annual: false })),
    ...strings(visibleSetupPackages(false)),
    ...strings(faqItems(false)),
    ...strings(pricingMeta("monthly")),
  ];
}

test("no em dash and no exclamation mark anywhere in the page copy or the price labels", () => {
  const all = [...copyStrings(), ...strings(pricingMeta("annual")), ...strings(pricingMeta("monthly")), ...strings(faqItems(false))];
  assert.ok(all.length > 60, `only found ${all.length} strings, the walk is broken`);
  for (const s of all) {
    assert.ok(!s.includes(EM_DASH), `em dash in: ${s}`);
    assert.ok(!s.includes("!"), `exclamation mark in: ${s}`);
  }
});

test("monthly only: nothing on the page mentions annual billing or a saving", () => {
  const all = monthlyOnlyCopy();
  assert.ok(all.length > 60, `only found ${all.length} strings, the walk is broken`);
  for (const s of all) {
    assert.ok(!/annual|save up to/i.test(s), `monthly only copy says: ${s}`);
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
