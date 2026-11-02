import type { Metadata } from "next";
import PeopleHqPage from "@/components/PeopleHqPage";

export const metadata: Metadata = {
  title: "People HQ · Multiply OS",
  description:
    "Hiring, performance reviews, 360 feedback, anonymous engagement surveys and certification tracking in one place, following every person from first application to how they feel about working here.",
  openGraph: {
    title: "People HQ · Multiply OS",
    description: "Hire them, grow them, keep them. Hiring, reviews, 360 feedback, engagement surveys and certifications in one place.",
    url: "https://www.multiplyos.com/features/people-hq",
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
    title: "People HQ · Multiply OS",
    description: "Hire them, grow them, keep them. Hiring, reviews, 360 feedback, engagement surveys and certifications in one place.",
    images: ["/og-image.png"],
  },
};

export default function Page() {
  return <PeopleHqPage />;
}
