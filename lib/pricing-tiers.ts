// The pricing v2 prices (GROW, SCALE, MULTIPLY) and the math behind the team
// total: per user prices for both billing intervals, the MULTIPLY minimum, team
// size limits, and the add-on and setup prices.
//
// Source of the numbers: the pricing v2 spec in the app repository
// (docs/superpowers/specs/2026-10-07-pricing-v2-design.md) and Ashley's workbook
// "Multiply OS Product Bundles & Pricing". If a price changes, it changes here
// and in the app's own table, and tests/pricing-tiers.test.mjs says so.
//
// This is the only place a price is written. The words around the prices (plan
// cards, comparison table, FAQ) are in pricing-copy.ts and build their dollar
// figures from this file. It stays small on purpose: the home page's stack table
// imports it for "From $15", and it must not drag the page copy along.
//
// Pure data and pure functions only, so node:test can import it. Not used while
// the pricing v2 switch is off.
import type { Billing, PlanId } from "@/lib/app-links.mjs";
import { PLAN_IDS } from "@/lib/app-links.mjs";

export type { Billing, PlanId };

// ---------------------------------------------------------------- formatting

export function money(n: number): string {
  return `$${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

export function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

// ---------------------------------------------------------------- prices

export const PLAN_ORDER: readonly PlanId[] = PLAN_IDS;
export const FEATURED_PLAN: PlanId = "scale";
export const TRIAL_DAYS = 14;

// USD per user per month. Annual is the per month equivalent of a year paid up
// front (GROW $180, SCALE $348, MULTIPLY $588 a year).
export const PRICE_PER_USER_MONTH: Record<PlanId, Record<Billing, number>> = {
  grow: { annual: 15, monthly: 19 },
  scale: { annual: 29, monthly: 39 },
  multiply: { annual: 49, monthly: 65 },
};

export const LOWEST_PRICE_PER_USER = Math.min(...PLAN_ORDER.map((p) => PRICE_PER_USER_MONTH[p].annual));

// "Save up to N%" is the best annual saving across the three plans, rounded
// down so the claim never overstates it (SCALE saves 25.6%).
export const ANNUAL_SAVINGS_PERCENT = Math.floor(
  Math.max(...PLAN_ORDER.map((p) => (1 - PRICE_PER_USER_MONTH[p].annual / PRICE_PER_USER_MONTH[p].monthly) * 100)),
);
export const ANNUAL_SAVINGS_LABEL = `Save up to ${ANNUAL_SAVINGS_PERCENT}%`;

// ---------------------------------------------------------------- team size

export const MIN_USERS = 1;
export const MAX_USERS = 500;
export const DEFAULT_USERS = 10;
// Open decision D2 in the spec: one MULTIPLY user would get two HQ modules and
// Launch onboarding for $49 a month, so MULTIPLY bills at least ten.
export const MULTIPLY_MIN_USERS = 10;

export function minUsers(plan: PlanId): number {
  return plan === "multiply" ? MULTIPLY_MIN_USERS : MIN_USERS;
}

// A whole number from MIN_USERS to MAX_USERS. Not a number at all falls back to
// the default rather than reaching a price.
export function clampUsers(n: number): number {
  const whole = Math.trunc(Number(n));
  if (Number.isNaN(whole)) return DEFAULT_USERS;
  return Math.min(MAX_USERS, Math.max(MIN_USERS, whole));
}

// The users a plan actually bills for a team of this size.
export function billedUsers(plan: PlanId, users: number): number {
  return Math.max(minUsers(plan), clampUsers(users));
}

// ---------------------------------------------------------------- team totals

// What the team pays each month at this billing interval's rate.
export function teamMonthly(plan: PlanId, billing: Billing, users: number): number {
  return PRICE_PER_USER_MONTH[plan][billing] * billedUsers(plan, users);
}

// What an annual subscription charges up front: twelve months at the annual rate.
export function teamAnnualBilled(plan: PlanId, users: number): number {
  return PRICE_PER_USER_MONTH[plan].annual * billedUsers(plan, users) * 12;
}

// The team total in two parts: "$290 a month for 10 users" and, on annual
// billing only, "billed $3,480 a year". The page keeps each part on one line, so
// a narrow card breaks between them and never inside "10 users".
export function teamTotalParts(plan: PlanId, billing: Billing, users: number): { head: string; billed: string | null } {
  const n = billedUsers(plan, users);
  return {
    head: `${money(teamMonthly(plan, billing, n))} a month for ${plural(n, "user")}`,
    billed: billing === "annual" ? `billed ${money(teamAnnualBilled(plan, n))} a year` : null,
  };
}

// "$290 a month for 10 users, billed $3,480 a year" on annual,
// "$390 a month for 10 users" on monthly.
export function teamTotalLine(plan: PlanId, billing: Billing, users: number): string {
  const { head, billed } = teamTotalParts(plan, billing, users);
  return billed ? `${head}, ${billed}` : head;
}

// ---------------------------------------------------------------- add-ons and setup

// HQ modules are per business, not per user. GROW's two $99 add-ons are SOP HQ
// and Finance HQ with Banking Analytics.
export const HQ_PRICE_PER_MONTH = 299;
export const GROW_ADDON_PRICE_PER_MONTH = 99;
export const FORMS_ADDON_PRICE_PER_MONTH = 49;

// AI is billed by use, on top of every plan, with a monthly cap the customer sets.
export const AI_MONTHLY_CAP_DEFAULT = 200;

// One time setup packages. Launch is included with MULTIPLY.
export const SETUP_PRICE = { launch: 1000, accelerate: 5000, momentum: 18000 };
