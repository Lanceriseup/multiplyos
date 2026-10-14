// The words on /rukcon, the page the RUKCON booth QR opens: the pricing page
// with the RUKCON offer on top and the RUKCON code on every trial link.
//
// The offer (decision D10 in the MOS Pricing Rollout map): the LAUNCH setup
// and onboarding package ($1,000) is included when a booth trial is on annual
// SCALE (or MULTIPLY) by Oct 31. The app tags every signup that carries the
// code and enrolls the qualifying ones in client onboarding, which tells the
// team (lib/signup/signup-campaigns.ts in the app repository).
//
// Two modes, like the rest of the pricing copy. With annual billing on, the
// offer reads as the flyer does. With it off (the monthly only launch), the
// trial starts monthly and the offer says how to earn it: switch to annual by
// Oct 31.
//
// Pure data and pure functions only, so node:test can import it.
import { RUKCON_PROMO_CODE } from "@/lib/app-links.mjs";
import type { Billing, PlanId } from "@/lib/pricing-tiers";
import { SETUP_PRICE, TRIAL_DAYS, money } from "@/lib/pricing-tiers";

export const BOOTH_PROMO_CODE: string = RUKCON_PROMO_CODE;

const launchValue = `${money(SETUP_PRICE.launch)} value`;

export type BoothOffer = { eyebrow: string; title: string; body: string; steps: readonly string[] };

export function boothOffer(annualBilling: boolean): BoothOffer {
  return {
    eyebrow: "RUKCON exclusive",
    title: "LAUNCH Onboarding included with annual SCALE.",
    body: annualBilling
      ? `The LAUNCH setup and onboarding package (${launchValue}) is included with annual SCALE and MULTIPLY plans started by October 31. We build your scoreboard, plan and meeting rhythm with you.`
      : `Start your trial today and switch to annual billing by October 31: the LAUNCH setup and onboarding package (${launchValue}) is included with annual SCALE and MULTIPLY. We build your scoreboard, plan and meeting rhythm with you.`,
    // The visitor already scanned the QR to get here, so step one is the plan.
    steps: ["Pick annual SCALE", `Start your ${TRIAL_DAYS}-day trial`, "Go live with our team"],
  };
}

// The extra line on a plan card. MULTIPLY already lists Launch, so only
// SCALE gets one, and only where the offer applies (annual billing).
export function boothPlanLine(plan: PlanId, billing: Billing): string | null {
  if (plan !== "scale" || billing !== "annual") return null;
  return `LAUNCH onboarding included (${launchValue}), RUKCON offer`;
}
