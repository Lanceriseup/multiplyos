import type { Metadata } from "next";
import ChecklistsPage from "@/components/ChecklistsPage";

export const metadata: Metadata = {
  title: "Checklists \u00b7 Multiply OS",
  description:
    "Turn the routines your team repeats into checklists that run on a schedule, chase themselves, and end with somebody's name on the result. A signed, permanent record of every run.",
  openGraph: {
    title: "Checklists \u00b7 Multiply OS",
    description:
      "It got done, and you can prove it. Recurring process checklists with required items, photo evidence, and a signed record of every run.",
    url: "https://www.multiplyos.com/features/checklists",
    siteName: "Multiply OS",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Multiply OS \u2014 The operating system for your business",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Checklists \u00b7 Multiply OS",
    description:
      "It got done, and you can prove it. Recurring checklists with required items, photo evidence, and a signed record of every run.",
    images: ["/og-image.png"],
  },
};

export default function Page() {
  return <ChecklistsPage />;
}
