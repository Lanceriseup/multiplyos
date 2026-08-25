import type { Metadata } from "next";
import AgreementsPage from "@/components/AgreementsPage";

export const metadata: Metadata = {
  title: "Agreements \u00b7 Multiply OS",
  description:
    "An agreement is a form with a signature on it. Send a contract built from real fields, get a legally-binding signature, and have the signed result open the task, create the contact, and fill the spreadsheet by itself.",
  openGraph: {
    title: "Agreements \u00b7 Multiply OS",
    description:
      "Signed, tracked, and already working. Legally-binding e-signature on documents you build yourself, with every executed copy in one place.",
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
      "Signed, tracked, and already working. Legally-binding e-signature, and the signed result starts the work.",
    images: ["/og-image.png"],
  },
};

export default function Page() {
  return <AgreementsPage />;
}
