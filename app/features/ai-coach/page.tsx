import type { Metadata } from "next";
import AiCoachPage from "@/components/AiCoachPage";

export const metadata: Metadata = {
  title: "AI Coach & Agent · Multiply OS",
  description:
    "Multi AI runs on Claude and GPT with your live company data already in the room. Two coaches, answers that name the actual record, charts and calculators built on request, and memory that means you stop explaining yourself at the top of every chat.",
  openGraph: {
    title: "AI Coach & Agent · Multiply OS",
    description:
      "Same models. They can see your business. Multi AI opens with your overdue tasks, your margin, and your open seats, instead of an empty box you have to explain your company to.",
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
      "Same models. They can see your business. An AI chief of staff that reads your numbers, your plan, and your people.",
    images: ["/og-image.png"],
  },
};

export default function Page() {
  return <AiCoachPage />;
}
