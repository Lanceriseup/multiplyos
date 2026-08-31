import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PricingPackages from "@/components/PricingPackages";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Implementation & Coaching Packages — Multiply OS",
  description:
    "Done-with-you to done-for-you Multiply OS packages: onsite implementation, leadership meeting facilitation, KPI accountability, and CEO coaching.",
  alternates: { canonical: "/implementation" },
  // Link-only page: reachable by anyone with the direct URL, but kept out of
  // search results. Deliberately NOT blocked in robots.txt — crawlers must be
  // able to fetch the page to see this noindex directive.
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  openGraph: {
    title: "Multiply OS — Implementation & Coaching Packages",
    description:
      "Onsite implementation, ongoing execution, and CEO coaching — built on the Multiply OS system.",
    url: "https://www.multiplyos.com/implementation",
    type: "website",
  },
};

export default function ImplementationPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <PricingPackages />
      <CTA href="https://go.riseupkings.com/coachingpackage" />
      <Footer />
    </main>
  );
}
