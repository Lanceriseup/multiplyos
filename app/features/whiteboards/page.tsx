import type { Metadata } from "next";
import WhiteboardsPage from "@/components/WhiteboardsPage";

export const metadata: Metadata = {
  title: "Whiteboards · Multiply OS",
  description:
    "An infinite canvas for planning, brainstorming and mapping things out together, in real time. Live cursors, a role for every teammate, public links for anyone outside, and pinned comments so the thinking carries on after the session ends.",
  openGraph: {
    title: "Whiteboards · Multiply OS",
    description:
      "Think it out together, on one canvas. Real-time collaboration, role-based sharing, public links and pinned comments, built into the system that already holds your plan.",
    url: "https://www.multiplyos.com/features/whiteboards",
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
    title: "Whiteboards · Multiply OS",
    description:
      "An infinite canvas for planning and brainstorming together in real time, with role-based sharing and pinned comments.",
    images: ["/og-image.png"],
  },
};

export default function Page() {
  return <WhiteboardsPage />;
}
