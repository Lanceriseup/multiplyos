import type { Metadata } from "next";
import MetricsScoreboardPage from "@/components/MetricsScoreboardPage";

export const metadata: Metadata = {
  title: "Metrics Scoreboard · Multiply OS",
  description:
    "One scoreboard per team. Log the week once and the monthly and quarterly roll-ups build themselves. A goal, an owner, a trend, and a hit rate on every metric.",
  openGraph: {
    title: "Metrics Scoreboard · Multiply OS",
    description:
      "Know where you stand, week to quarter. One scoreboard per team, with a goal and an owner on every number.",
    url: "https://www.multiplyos.com/features/metrics-scoreboard",
    siteName: "Multiply OS",
    type: "website",
  },
};

export default function Page() {
  return <MetricsScoreboardPage />;
}
