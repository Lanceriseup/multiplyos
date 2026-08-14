import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import DemoProvider from "@/components/DemoModal";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Multiply OS — The operating system for your business",
  description:
    "Multiply OS brings your tools, teams, and AI into one connected workspace. Do more, with less.",
  metadataBase: new URL("https://www.multiplyos.com"),
  icons: {
    icon: "/MultiplyOS_GearsOnly.png",
    apple: "/MultiplyOS_GearsOnly.png",
  },
  openGraph: {
    title: "Multiply OS",
    description:
      "The operating system for your business. Tools, teams, and AI in one place.",
    url: "https://www.multiplyos.com",
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
    title: "Multiply OS",
    description:
      "The operating system for your business. Tools, teams, and AI in one place.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <DemoProvider>{children}</DemoProvider>
      </body>
    </html>
  );
}
