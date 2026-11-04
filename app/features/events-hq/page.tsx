import type { Metadata } from "next";
import EventsHqPage from "@/components/EventsHqPage";

export const metadata: Metadata = {
  title: "Events HQ · Multiply OS",
  description:
    "Plan, staff and run every event from one place. Stages and tasks, registrations, coaches and volunteers, agendas, a branded attendee portal, budgets and inventory, on one calendar.",
  openGraph: {
    title: "Events HQ · Multiply OS",
    description:
      "Plan it, run it, wrap it up. Every event, its people, its agenda and its budget, in one place.",
    url: "https://www.multiplyos.com/features/events-hq",
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
    title: "Events HQ · Multiply OS",
    description:
      "Plan it, run it, wrap it up. Every event, its people, its agenda and its budget, in one place.",
    images: ["/og-image.png"],
  },
};

export default function Page() {
  return <EventsHqPage />;
}
