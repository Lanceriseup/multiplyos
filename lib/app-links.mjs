// Every link from multiplyos.com into the product app comes from here, so a path
// or a parameter name changes in one place.
//
// Plain JavaScript for the same reason as pricing-v2-switch.mjs: next.config.mjs
// imports it (the /rukcon redirect) and CI builds on Node 20, which cannot load
// .ts. TypeScript files import it with the .mjs extension and get their types
// from the JSDoc below.

const APP_ORIGIN = "https://app.multiplyos.com";

/** @typedef {"grow" | "scale" | "multiply"} PlanId */
/** @typedef {"annual" | "monthly"} Billing */

/** @type {readonly PlanId[]} */
export const PLAN_IDS = Object.freeze(["grow", "scale", "multiply"]);

/** @type {readonly Billing[]} */
export const BILLING_PERIODS = Object.freeze(["annual", "monthly"]);

// The RUKCON booth offer rides on this code. Ashley names the final code: change
// it here and the /rukcon redirect in next.config.mjs follows.
export const RUKCON_PROMO_CODE = "RUKCON";

/**
 * Today's signup page. It is where every Sign up button goes until pricing v2 is
 * switched on.
 *
 * @returns {string}
 */
export function appSignupUrl() {
  return `${APP_ORIGIN}/signup`;
}

/**
 * The 14 day trial on a chosen plan. The app's /trial/signup reads plan and
 * billing from the link, so nobody picks twice. promo is optional and is
 * trimmed; a blank code is left out.
 *
 * Throws on a plan or billing period it does not know, so a typo fails the build
 * instead of shipping a dead link.
 *
 * @param {{ plan: PlanId, billing: Billing, promo?: string | null }} options
 * @returns {string}
 */
export function appTrialUrl({ plan, billing, promo }) {
  if (!PLAN_IDS.includes(plan)) throw new RangeError(`Unknown plan: ${String(plan)}`);
  if (!BILLING_PERIODS.includes(billing)) throw new RangeError(`Unknown billing period: ${String(billing)}`);
  const code = typeof promo === "string" ? promo.trim() : "";
  const query = `plan=${plan}&billing=${billing}${code ? `&promo=${encodeURIComponent(code)}` : ""}`;
  return `${APP_ORIGIN}/trial/signup?${query}`;
}
