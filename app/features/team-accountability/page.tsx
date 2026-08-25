import type { Metadata } from "next";
import TeamAccountabilityPage from "@/components/TeamAccountabilityPage";

export const metadata: Metadata = {
  title: "Team Accountability · Multiply OS",
  description:
    "The One Page Plan holds your purpose, vision, and this quarter's goals on one screen. Every goal ladders up to an annual and a long-term target, every goal has one required owner, and every goal carries a written update every week.",
  openGraph: {
    title: "Team Accountability · Multiply OS",
    description:
      "The whole strategy, on one page. One accountable name against every line, milestones with their own dates and owners, and a written update every week.",
    url: "https://www.multiplyos.com/features/team-accountability",
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
    title: "Team Accountability · Multiply OS",
    description:
      "The whole strategy on one page, with one accountable name against every line and a written update every week.",
    images: ["/og-image.png"],
  },
};

export default function Page() {
  return <TeamAccountabilityPage />;
}
