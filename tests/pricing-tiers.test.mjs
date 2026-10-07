// The pricing v2 prices and the math behind the pricing page: per user prices,
// team totals for both billing intervals, the MULTIPLY minimum, and the add-on
// and setup prices. The values are the ones in the pricing v2 spec; if one of
// them changes on purpose, change it here in the same commit. The words that go
// around these numbers are tested in pricing-copy.test.mjs.
import test from "node:test";
import assert from "node:assert/strict";

import * as tiers from "../lib/pricing-tiers";

const {
  ANNUAL_SAVINGS_LABEL,
  ANNUAL_SAVINGS_PERCENT,
  AI_MONTHLY_CAP_DEFAULT,
  DEFAULT_USERS,
  FEATURED_PLAN,
  FORMS_ADDON_PRICE_PER_MONTH,
  GROW_ADDON_PRICE_PER_MONTH,
  HQ_PRICE_PER_MONTH,
  MAX_USERS,
  MIN_USERS,
  MULTIPLY_MIN_USERS,
  PLAN_ORDER,
  PRICE_PER_USER_MONTH,
  SETUP_PRICE,
  STACK_TEAM_SIZE,
  TRIAL_DAYS,
  billedUsers,
  clampUsers,
  lowestPrice,
  money,
  plural,
  stackChip,
  teamAnnualBilled,
  teamMonthly,
  teamTotalLine,
  teamTotalParts,
} = tiers;

// ---- prices ------------------------------------------------------------------

test("per user prices are the spec's: GROW 15/19, SCALE 29/39, MULTIPLY 49/65", () => {
  assert.deepEqual(PRICE_PER_USER_MONTH, {
    grow: { annual: 15, monthly: 19 },
    scale: { annual: 29, monthly: 39 },
    multiply: { annual: 49, monthly: 65 },
  });
});

test("plans run GROW, SCALE, MULTIPLY and SCALE is the featured one", () => {
  assert.deepEqual([...PLAN_ORDER], ["grow", "scale", "multiply"]);
  assert.equal(FEATURED_PLAN, "scale");
});

test("the trial is 14 days and the page opens on 10 users", () => {
  assert.equal(TRIAL_DAYS, 14);
  assert.equal(DEFAULT_USERS, 10);
});

test("the lowest price on the page is GROW: $15 annual, $19 monthly", () => {
  assert.equal(lowestPrice("annual"), 15);
  assert.equal(lowestPrice("monthly"), 19);
});

test("the annual saving label is true: the best plan saves 25% or a little more, never less", () => {
  const best = Math.max(
    ...PLAN_ORDER.map((p) => (1 - PRICE_PER_USER_MONTH[p].annual / PRICE_PER_USER_MONTH[p].monthly) * 100),
  );
  assert.equal(ANNUAL_SAVINGS_PERCENT, 25);
  assert.ok(best >= ANNUAL_SAVINGS_PERCENT && best < ANNUAL_SAVINGS_PERCENT + 1, `best saving is ${best}%`);
  assert.equal(ANNUAL_SAVINGS_LABEL, "Save up to 25%");
});

// ---- team size and the MULTIPLY minimum --------------------------------------

test("MULTIPLY bills at least 10 users; GROW and SCALE bill what you enter", () => {
  assert.equal(MULTIPLY_MIN_USERS, 10);
  assert.equal(billedUsers("multiply", 1), 10);
  assert.equal(billedUsers("multiply", 9), 10);
  assert.equal(billedUsers("multiply", 10), 10);
  assert.equal(billedUsers("multiply", 25), 25);
  assert.equal(billedUsers("grow", 1), 1);
  assert.equal(billedUsers("scale", 3), 3);
  assert.equal(billedUsers("scale", 250), 250);
});

test("team size is a whole number from 1 to 500", () => {
  assert.equal(MIN_USERS, 1);
  assert.equal(MAX_USERS, 500);
  assert.equal(clampUsers(0), 1);
  assert.equal(clampUsers(-5), 1);
  assert.equal(clampUsers(1), 1);
  assert.equal(clampUsers(10), 10);
  assert.equal(clampUsers(10.9), 10);
  assert.equal(clampUsers(500), 500);
  assert.equal(clampUsers(501), 500);
  assert.equal(clampUsers(1e9), 500);
  assert.equal(clampUsers(Number.NaN), DEFAULT_USERS);
  assert.equal(clampUsers(undefined), DEFAULT_USERS);
});

test("billedUsers also clamps, so a bad value never reaches a price", () => {
  assert.equal(billedUsers("scale", 0), 1);
  assert.equal(billedUsers("grow", 100000), 500);
  assert.equal(billedUsers("multiply", Number.NaN), 10);
});

// ---- team totals -------------------------------------------------------------

test("team totals per month, for 10 users, both billing intervals", () => {
  assert.equal(teamMonthly("grow", "annual", 10), 150);
  assert.equal(teamMonthly("grow", "monthly", 10), 190);
  assert.equal(teamMonthly("scale", "annual", 10), 290);
  assert.equal(teamMonthly("scale", "monthly", 10), 390);
  assert.equal(teamMonthly("multiply", "annual", 10), 490);
  assert.equal(teamMonthly("multiply", "monthly", 10), 650);
});

test("annual billing charges twelve months of the annual rate up front", () => {
  assert.equal(teamAnnualBilled("grow", 10), 1800);
  assert.equal(teamAnnualBilled("scale", 10), 3480);
  assert.equal(teamAnnualBilled("multiply", 10), 5880);
  assert.equal(teamAnnualBilled("scale", 1), 348);
});

test("MULTIPLY totals use the 10 user minimum below 10 users", () => {
  assert.equal(teamMonthly("multiply", "annual", 3), 490);
  assert.equal(teamAnnualBilled("multiply", 3), 5880);
  assert.equal(teamMonthly("multiply", "monthly", 3), 650);
});

test("the total line, annual and monthly, as the page words it", () => {
  assert.equal(teamTotalLine("scale", "annual", 10), "$290 a month for 10 users, billed $3,480 a year");
  assert.equal(teamTotalLine("scale", "monthly", 10), "$390 a month for 10 users");
  assert.equal(teamTotalLine("grow", "annual", 10), "$150 a month for 10 users, billed $1,800 a year");
  assert.equal(teamTotalLine("multiply", "annual", 10), "$490 a month for 10 users, billed $5,880 a year");
  assert.equal(teamTotalLine("multiply", "monthly", 10), "$650 a month for 10 users");
});

test("the total line says 1 user, not 1 users, and shows the MULTIPLY minimum", () => {
  assert.equal(teamTotalLine("grow", "annual", 1), "$15 a month for 1 user, billed $180 a year");
  assert.equal(teamTotalLine("scale", "monthly", 1), "$39 a month for 1 user");
  assert.equal(teamTotalLine("multiply", "annual", 3), "$490 a month for 10 users, billed $5,880 a year");
});

test("the total line comes in two parts, so the page can keep each part on one line", () => {
  assert.deepEqual(teamTotalParts("scale", "annual", 10), {
    head: "$290 a month for 10 users",
    billed: "billed $3,480 a year",
  });
  assert.deepEqual(teamTotalParts("scale", "monthly", 10), { head: "$390 a month for 10 users", billed: null });
  assert.deepEqual(teamTotalParts("multiply", "annual", 3), {
    head: "$490 a month for 10 users",
    billed: "billed $5,880 a year",
  });
  // and the one line version is exactly the two parts joined
  for (const plan of PLAN_ORDER) {
    for (const billing of ["annual", "monthly"]) {
      const { head, billed } = teamTotalParts(plan, billing, 25);
      assert.equal(teamTotalLine(plan, billing, 25), billed ? `${head}, ${billed}` : head);
    }
  }
});

test("the total line at the top of the range", () => {
  assert.equal(teamTotalLine("scale", "annual", 500), "$14,500 a month for 500 users, billed $174,000 a year");
  assert.equal(teamTotalLine("multiply", "monthly", 1000), "$32,500 a month for 500 users");
});

test("monthly only mode: the team total for 10 users on each plan, and nothing about a year", () => {
  assert.equal(teamTotalLine("grow", "monthly", 10), "$190 a month for 10 users");
  assert.equal(teamTotalLine("scale", "monthly", 10), "$390 a month for 10 users");
  assert.equal(teamTotalLine("multiply", "monthly", 10), "$650 a month for 10 users");
  for (const plan of PLAN_ORDER) assert.equal(teamTotalParts(plan, "monthly", 10).billed, null);
});

test("the stack table chip is SCALE for a team of ten: $290 billed annually, or $390 monthly", () => {
  assert.equal(STACK_TEAM_SIZE, 10);
  assert.deepEqual(stackChip("annual"), { price: "$290", detail: "SCALE for 10 users, billed annually" });
  assert.deepEqual(stackChip("monthly"), { price: "$390", detail: "SCALE for 10 users" });
});

test("the stack table chip follows the price table and the SCALE card's own team total", () => {
  for (const billing of ["annual", "monthly"]) {
    assert.equal(stackChip(billing).price, money(PRICE_PER_USER_MONTH[FEATURED_PLAN][billing] * STACK_TEAM_SIZE), billing);
    assert.equal(stackChip(billing).price, money(teamMonthly(FEATURED_PLAN, billing, STACK_TEAM_SIZE)), billing);
    assert.ok(teamTotalLine(FEATURED_PLAN, billing, STACK_TEAM_SIZE).startsWith(`${stackChip(billing).price} a month for`), billing);
  }
});

test("money rounds to whole dollars and groups thousands", () => {
  assert.equal(money(0), "$0");
  assert.equal(money(15), "$15");
  assert.equal(money(14.6), "$15");
  assert.equal(money(999), "$999");
  assert.equal(money(3480), "$3,480");
  assert.equal(money(1234567), "$1,234,567");
});

test("plural", () => {
  assert.equal(plural(1, "user"), "1 user");
  assert.equal(plural(0, "user"), "0 users");
  assert.equal(plural(10, "user"), "10 users");
});

// ---- add-on and setup prices ---------------------------------------------------

test("HQ modules are $299 a month; GROW's two add-ons $99; basic forms $49; AI cap $200", () => {
  assert.equal(HQ_PRICE_PER_MONTH, 299);
  assert.equal(GROW_ADDON_PRICE_PER_MONTH, 99);
  assert.equal(FORMS_ADDON_PRICE_PER_MONTH, 49);
  assert.equal(AI_MONTHLY_CAP_DEFAULT, 200);
});

test("setup packages: Launch $1,000, Accelerate $5,000, Momentum $18,000", () => {
  assert.deepEqual(SETUP_PRICE, { launch: 1000, accelerate: 5000, momentum: 18000 });
});

