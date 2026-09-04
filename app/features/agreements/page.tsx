import type { Metadata } from "next";
import AgreementsPage from "@/components/AgreementsPage";

export const metadata: Metadata = {
  title: "Agreements \u00b7 Multiply OS",
  description:
    "Build a custom agreement or contract, send it for signature, and store the signed copy, all without leaving Multiply OS. Every executed document tracked in one place.",
  openGraph: {
    title: "Agreements \u00b7 Multiply OS",
    description:
      "Signed, tracked and securely stored. Build a custom agreement, send it for signature, and keep every executed copy in one place.",
    url: "https://www.multiplyos.com/features/agreements",
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
    title: "Agreements \u00b7 Multiply OS",
    description:
      "Signed, tracked and securely stored. Build it, send it for signature, and keep the signed copy in one place.",
    images: ["/og-image.png"],
  },
};

export default function Page() {
  return <AgreementsPage />;
}
