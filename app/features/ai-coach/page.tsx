import type { Metadata } from "next";
import AiCoachPage from "@/components/AiCoachPage";

export const metadata: Metadata = {
  title: "AI Coach & Agent · Multiply OS",
  description:
    "The AI learns your business as you use it. Better insights, smarter advice, zero reprompting. Two coaches, answers that name the actual record, charts and calculators built on request, and memory that means you stop explaining yourself at the top of every chat.",
  openGraph: {
    title: "AI Coach & Agent · Multiply OS",
    description:
      "Your business brain, and it gets smarter every day. The AI learns your business as you use it, so it opens with your overdue tasks, your margin, and your open seats instead of an empty box.",
    url: "https://www.multiplyos.com/features/ai-coach",
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
    title: "AI Coach & Agent · Multiply OS",
    description:
      "Your business brain, and it gets smarter every day. The more you work in Multiply OS, the more aligned the coaching becomes.",
    images: ["/og-image.png"],
  },
};

export default function Page() {
  return <AiCoachPage />;
}
