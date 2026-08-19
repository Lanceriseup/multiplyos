import type { Metadata } from "next";
import TeamMeetingsPage from "@/components/TeamMeetingsPage";

export const metadata: Metadata = {
  title: "Team Meetings & 1on1s · Multiply OS",
  description:
    "A timeboxed agenda that steps itself, for the whole team and for one person at a time. Tasks and issues get captured in the meeting, and unchecked topics carry to the next one.",
  openGraph: {
    title: "Team Meetings & 1on1s · Multiply OS",
    description:
      "Run the meeting, not the notes. Nothing gets dropped, and nothing starts from zero.",
    url: "https://www.multiplyos.com/features/team-meetings",
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
    title: "Team Meetings & 1on1s · Multiply OS",
    description:
      "Run the meeting, not the notes. Nothing gets dropped, and nothing starts from zero.",
    images: ["/og-image.png"],
  },
};

export default function Page() {
  return <TeamMeetingsPage />;
}
