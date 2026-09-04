import type { Metadata } from "next";
import SopHqPage from "@/components/SopHqPage";

export const metadata: Metadata = {
  title: "SOP HQ · Multiply OS",
  description:
    "Every process your team runs, captured once and shared forever. Written steps, screen recordings, and an AI agent that walks anyone through the SOP one step at a time.",
  openGraph: {
    title: "SOP HQ · Multiply OS",
    description:
      "Every process, out of someone's head. Written steps, video SOPs, and an AI agent that walks your team through them.",
    url: "https://www.multiplyos.com/features/sop-hq",
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
    title: "SOP HQ · Multiply OS",
    description:
      "Every process, out of someone's head. Written steps, video SOPs, and an AI agent that walks your team through them.",
    images: ["/og-image.png"],
  },
};

export default function Page() {
  return <SopHqPage />;
}
