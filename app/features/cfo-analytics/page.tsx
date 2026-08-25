import type { Metadata } from "next";
import CfoAnalyticsPage from "@/components/CfoAnalyticsPage";

export const metadata: Metadata = {
  title: "CFO Analytics · Multiply OS",
  description:
    "Connect QuickBooks in two minutes and Finance HQ turns six months of your books into CFO-grade analytics: the Big 6, a full profit and loss, a balance sheet, searchable transactions, and a monthly AI briefing that tells you why the numbers moved.",
  openGraph: {
    title: "CFO Analytics · Multiply OS",
    description:
      "Connect QuickBooks. Get a CFO. Read-only sync, the Big 6 on one screen, the whole P&L, and an AI briefing that catches the month your profit went up and your cash went down.",
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
      "Connect QuickBooks. Get a CFO. The Big 6, the whole P&L, and an AI briefing that reads your ledger.",
    images: ["/og-image.png"],
  },
};

export default function Page() {
  return <CfoAnalyticsPage />;
}
