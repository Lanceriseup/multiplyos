import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./admin.css";

// Display face for the dashboard's headings and big numbers.
const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Admin · Multiply OS",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className={display.variable}>{children}</div>;
}
