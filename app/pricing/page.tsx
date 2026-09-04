import type { Metadata } from "next";
import PricingPage from "@/components/PricingPage";

export const metadata: Metadata = {
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

export default function Page() {
  return <PricingPage />;
}
