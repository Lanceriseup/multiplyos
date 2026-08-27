import type { Metadata } from "next";
import CfoAnalyticsPage from "@/components/CfoAnalyticsPage";

export const metadata: Metadata = {
  title: "CFO Analytics · Multiply OS",
  description:
    "Finance HQ locks your books behind a second password, then turns a read-only QuickBooks sync into CFO-grade analytics: the Big Six against goals you set, a full profit and loss, a balance sheet differenced against last month, seven key ratios, a searchable ledger, a business valuation, and a monthly AI briefing that tells you why the numbers moved.",
  openGraph: {
    title: "CFO Analytics · Multiply OS",
    description:
      "Connect QuickBooks. Get a CFO. A second password on the books, the Big Six measured against your own goals, the whole P&L, and an AI briefing that catches the month your revenue fell and your margin went up.",
    url: "https://www.multiplyos.com/features/cfo-analytics",
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
    title: "CFO Analytics · Multiply OS",
    description:
      "Connect QuickBooks. Get a CFO. Password-locked books, the Big Six against your goals, and an AI briefing that reads your ledger.",
    images: ["/og-image.png"],
  },
};

export default function Page() {
  return <CfoAnalyticsPage />;
}
