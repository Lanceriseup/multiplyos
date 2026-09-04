import type { Metadata } from "next";
import FormsPage from "@/components/FormsPage";

export const metadata: Metadata = {
  title: "Forms · Multiply OS",
  description:
    "Build a form in a minute and share it as a link, a QR code, or an embed. Every answer opens a task, fills a spreadsheet, or moves a number, without anybody copying it across.",
  openGraph: {
    title: "Forms · Multiply OS",
    description:
      "Ask once, and the answer goes to work. Twenty-eight field types, a QR code for anything printed, and every response landing where the work already happens.",
    url: "https://www.multiplyos.com/features/forms",
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
    title: "Forms · Multiply OS",
    description:
      "Ask once, and the answer goes to work. Every response opens a task, fills a spreadsheet, or moves a number.",
    images: ["/og-image.png"],
  },
};

export default function Page() {
  return <FormsPage />;
}
