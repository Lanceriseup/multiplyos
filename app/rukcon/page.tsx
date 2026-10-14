import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PricingTiersPage from "@/components/PricingTiersPage";
import { pricingV2SiteEnabled } from "@/lib/pricing-v2";
import { BOOTH_PROMO_CODE } from "@/lib/rukcon-booth";

// multiplyos.com/rukcon: the page the RUKCON booth QR opens. The pricing page,
// with the RUKCON offer on top and the RUKCON code on every trial link, so
// every signup from here is tagged for the offer. It exists only while the
// pricing v2 switch is on. Not indexed: it is a booth page, reached by the QR.
export const metadata: Metadata = {
  title: "RUKCON · Multiply OS",
  description: "The Multiply OS RUKCON offer: LAUNCH onboarding included with annual SCALE. Start a 14-day free trial.",
  robots: { index: false, follow: false },
};

export default function Page() {
  if (!pricingV2SiteEnabled()) notFound();
  return <PricingTiersPage promo={BOOTH_PROMO_CODE} />;
}
