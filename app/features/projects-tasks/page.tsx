import type { Metadata } from "next";
import ProjectsTasksPage from "@/components/ProjectsTasksPage";

export const metadata: Metadata = {
  title: "Projects & Tasks · Multiply OS",
  description:
    "Projects hold the full scope, in seven views. My Tasks hands you the slice that is due this week. Lists, boards, timelines, calendars, files, and budget on every project.",
  openGraph: {
    title: "Projects & Tasks · Multiply OS",
    description:
      "See the whole board, work the next row. Seven views on every project, and one page for what you owe this week.",
    url: "https://www.multiplyos.com/features/projects-tasks",
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
    title: "Projects & Tasks · Multiply OS",
    description:
      "See the whole board, work the next row. Seven views on every project, and one page for what you owe this week.",
    images: ["/og-image.png"],
  },
};

export default function Page() {
  return <ProjectsTasksPage />;
}
