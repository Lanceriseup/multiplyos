// The typed door to the pricing v2 switches. Everything in the app imports from
// here. The variables themselves are read in pricing-v2-switch.mjs, which is
// plain JavaScript so that next.config.mjs can load it on Node 20.
export { leadBilling, pricingV2AnnualEnabled, pricingV2SiteEnabled } from "./pricing-v2-switch.mjs";
