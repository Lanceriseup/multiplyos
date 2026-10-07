// The one place the pricing v2 switches are read.
//
// Two build time flags:
//   NEXT_PUBLIC_PRICING_V2         pricing v2 on or off (the three plan pricing
//                                  page, trial links, /rukcon). Off is today's site.
//   NEXT_PUBLIC_PRICING_V2_ANNUAL  only matters once the first is on. On: the site
//                                  offers annual billing (Annual and Monthly toggle,
//                                  Launch onboarding on annual MULTIPLY). Off: the
//                                  site launches monthly only. The app blocks annual
//                                  checkout until counsel approves the annual consent
//                                  text, so this stays off until that is done.
//
// It is plain JavaScript because next.config.mjs asks the same questions (the
// /rukcon redirect exists only while the switch is on, and which billing it
// lands on follows the annual flag) and CI builds on Node 20, which cannot load
// .ts. Application code imports the typed door, lib/pricing-v2.ts, never this file.
//
// The `?? ""` has to stay on the same line as each variable. The Vercel workflow
// (.github/workflows/_vercel-build-deploy.yml) scans app, components and lib and
// FAILS the deploy when a NEXT_PUBLIC_ variable that is read without an inline
// fallback is missing from the Vercel environment. Both flags are unset until
// the day they are turned on, so the fallback is what keeps them optional.
// tests/pricing-v2-switch.test.mjs guards both rules.

const isOn = (value) => value === "1" || value === "true";

/**
 * True only when NEXT_PUBLIC_PRICING_V2 is exactly "1" or "true" at build time.
 * Anything else, including unset, "TRUE" and " 1", is off.
 *
 * @returns {boolean}
 */
export function pricingV2SiteEnabled() {
  return isOn(process.env.NEXT_PUBLIC_PRICING_V2 ?? "");
}

/**
 * True only when BOTH flags are on: pricing v2 itself, and
 * NEXT_PUBLIC_PRICING_V2_ANNUAL set to exactly "1" or "true". The annual flag on
 * its own does nothing.
 *
 * @returns {boolean}
 */
export function pricingV2AnnualEnabled() {
  return pricingV2SiteEnabled() && isOn(process.env.NEXT_PUBLIC_PRICING_V2_ANNUAL ?? "");
}

/**
 * The billing interval the site leads with: annual when annual billing is on,
 * monthly otherwise. Every default trial link, the pricing page's opening
 * choice and the /rukcon redirect use it.
 *
 * @returns {"annual" | "monthly"}
 */
export function leadBilling() {
  return pricingV2AnnualEnabled() ? "annual" : "monthly";
}
