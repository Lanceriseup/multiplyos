// The typed door to the pricing v2 switch. Everything in the app imports
// pricingV2SiteEnabled from here. The variable itself is read in
// pricing-v2-switch.mjs, which is plain JavaScript so that next.config.mjs can
// load it on Node 20.
export { pricingV2SiteEnabled } from "./pricing-v2-switch.mjs";
