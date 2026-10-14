import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import CoachingCall from "@/components/CoachingCall";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Book a Strategy Call — Multiply OS",
  description:
    "Book a 30-minute strategy call: identify the bottlenecks slowing your growth, expose the gaps in your systems, and map a clear path to aligned, sustainable growth with Multiply OS.",
  alternates: { canonical: "/coaching-call" },
  // Link-only page: reachable by anyone with the direct URL, but kept out of
  // search results (matches the /implementation page it's linked from).
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
  openGraph: {
    title: "Book a Strategy Call — Multiply OS",
    description:
      "30 minutes to uncover your bottlenecks and map a clear path to aligned growth with Multiply OS.",
    url: "https://www.multiplyos.com/coaching-call",
    type: "website",
  },
};

export default function CoachingCallPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <CoachingCall />
      <Footer />
    </main>
  );
}
