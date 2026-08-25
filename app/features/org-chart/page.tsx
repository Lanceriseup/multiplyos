import type { Metadata } from "next";
import OrgChartPage from "@/components/OrgChartPage";

export const metadata: Metadata = {
  title: "Org Chart · Multiply OS",
  description:
    "A chart of seats, not a directory of names. Every role has one accountable person, its own annual outcomes, and a place on the chart, including the seats nobody is in yet. Read it as a chart or a list, and switch on DISC to see how the team is wired.",
  openGraph: {
    title: "Org Chart · Multiply OS",
    description:
      "Who owns what, at a glance. Drag roles to reorganise, create seats before you fill them, read the whole org as a list, and turn on DISC in one click.",
    url: "https://www.multiplyos.com/features/org-chart",
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
    title: "Org Chart · Multiply OS",
    description:
      "Who owns what, at a glance. Seats with outcomes, a list view, and DISC on the chart in one click.",
    images: ["/og-image.png"],
  },
};

export default function Page() {
  return <OrgChartPage />;
}
