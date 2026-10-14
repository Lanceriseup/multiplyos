// What every Sign up button on the site links to and says.
//
// Switch off (today): the app's signup page and "Sign up", exactly as before.
// Switch on: the 14 day trial on SCALE and "Start free trial", billed annually
// when annual billing is on and monthly when the site launches monthly only
// (see leadBilling in pricing-v2-switch.mjs). SCALE is the plan the RUKCON offer
// and the pricing page lead with; a visitor who wants another plan picks it on
// /pricing or on the trial screen.
//
// Components call this instead of holding their own copy of the URL, so there is
// one place to change it.
import { appSignupUrl, appTrialUrl } from "@/lib/app-links.mjs";
import { leadBilling, pricingV2SiteEnabled } from "@/lib/pricing-v2";

export type SignupCta = { href: string; label: string };

export function signupCta(): SignupCta {
  if (pricingV2SiteEnabled()) {
    return { href: appTrialUrl({ plan: "scale", billing: leadBilling() }), label: "Start free trial" };
  }
  return { href: appSignupUrl(), label: "Sign up" };
}
