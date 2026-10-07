import type { Metadata } from "next";
import PricingPage from "@/components/PricingPage";
import PricingTiersPage from "@/components/PricingTiersPage";
import { pricingV2SiteEnabled } from "@/lib/pricing-v2";
import { PLAN_ORDER, PRICE_PER_USER_MONTH, TRIAL_DAYS, money } from "@/lib/pricing-tiers";

// The single $299 plan, as the page has always described itself.
const metadataToday: Metadata = {
  title: "Pricing · Multiply OS",
  description:
    "One plan, every module. The Multiply Scale Bundle is $299 a month and includes 10 users, every feature, and Claude AI built into every seat. Extra seats are $29. See what the stack it replaces would cost you separately.",
  openGraph: {
    title: "Pricing · Multiply OS",
    description:
      "$299 a month, 10 users included, every module and every AI feature. See what the same stack costs when you buy it one subscription at a time.",
    url: "https://www.multiplyos.com/pricing",
    siteName: "Multiply OS",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Multiply OS — The operating system for your business",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing · Multiply OS",
    description:
      "$299 a month, 10 users included, every module and every AI feature.",
    images: ["/og-image.png"],
  },
};

// Pricing v2: the three plans, priced per user. The numbers come from
// lib/pricing-tiers.ts, the same table the page renders.
const fromAnnual = PLAN_ORDER.map((p) => `${p.toUpperCase()} is ${money(PRICE_PER_USER_MONTH[p].annual)}`);
const tiersDescription = `Three plans, priced per user. ${fromAnnual[0]}, ${fromAnnual[1]} and ${fromAnnual[2]} per user a month on annual billing. Every plan starts with a ${TRIAL_DAYS}-day free trial.`;
const tiersShort = `Three plans from ${money(PRICE_PER_USER_MONTH.grow.annual)} per user a month, billed annually. Start a ${TRIAL_DAYS}-day free trial on any plan.`;

// Same address, site name and share image as today's; the words are new.
const metadataTiers: Metadata = {
  title: "Pricing · Multiply OS",
  description: tiersDescription,
  openGraph: {
    ...metadataToday.openGraph,
    title: "Pricing · Multiply OS",
    description: tiersShort,
  },
  twitter: {
    ...metadataToday.twitter,
    title: "Pricing · Multiply OS",
    description: tiersShort,
  },
};

export const metadata: Metadata = pricingV2SiteEnabled() ? metadataTiers : metadataToday;

export default function Page() {
  return pricingV2SiteEnabled() ? <PricingTiersPage /> : <PricingPage />;
}
