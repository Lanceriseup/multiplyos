// The one place the pricing v2 switch is read.
//
// It is plain JavaScript because next.config.mjs asks the same question (the
// /rukcon redirect exists only while the switch is on) and CI builds on Node 20,
// which cannot load .ts. Application code imports the typed door,
// lib/pricing-v2.ts, never this file.
//
// The `?? ""` has to stay on the same line as the variable. The Vercel workflow
// (.github/workflows/_vercel-build-deploy.yml) scans app, components and lib and
// FAILS the deploy when a NEXT_PUBLIC_ variable that is read without an inline
// fallback is missing from the Vercel environment. This switch is unset until
// the day it is turned on, so the fallback is what keeps it optional.
// tests/pricing-v2-switch.test.mjs guards both rules.

/**
 * True only when NEXT_PUBLIC_PRICING_V2 is exactly "1" or "true" at build time.
 * Anything else, including unset, "TRUE" and " 1", is off.
 *
 * @returns {boolean}
 */
export function pricingV2SiteEnabled() {
  const value = process.env.NEXT_PUBLIC_PRICING_V2 ?? "";
  return value === "1" || value === "true";
}
