import type { Metadata } from "next";
import ContractorHqPage from "@/components/ContractorHqPage";

export const metadata: Metadata = {
  title: "Contractor HQ · Multiply OS",
  description:
    "Requests, quotes, jobs, crews on site and invoices in one workspace, with a client hub where your customers approve quotes, see their appointments and pay online.",
  openGraph: {
    title: "Contractor HQ · Multiply OS",
    description: "From the first call to the paid invoice. Requests, quotes, jobs, projects, a crew app and a client hub in one place.",
    url: "https://www.multiplyos.com/features/contractor-hq",
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
    title: "Contractor HQ · Multiply OS",
    description: "From the first call to the paid invoice. Requests, quotes, jobs, projects, a crew app and a client hub in one place.",
    images: ["/og-image.png"],
  },
};

export default function Page() {
  return <ContractorHqPage />;
}
