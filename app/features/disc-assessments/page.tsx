import type { Metadata } from "next";
import DiscPage from "@/components/DiscPage";

export const metadata: Metadata = {
  title: "DISC Assessments · Multiply OS",
  description:
    "Send DISC assessments, track who has taken them, and read the result inside the record of the person it belongs to. Every profile scored across four dimensions, on the org chart, in the team list, and readable by your AI coach.",
  openGraph: {
    title: "DISC Assessments · Multiply OS",
    description:
      "Know how your team actually works. Behavioural profiles that live on the person's record instead of in a PDF somebody emailed round two years ago.",
    url: "https://www.multiplyos.com/features/disc-assessments",
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
    title: "DISC Assessments · Multiply OS",
    description:
      "Know how your team actually works. DISC profiles built into hiring, 1-on-1s, and everyday team communication.",
    images: ["/og-image.png"],
  },
};

export default function Page() {
  return <DiscPage />;
}
