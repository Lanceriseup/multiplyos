import type { Metadata } from "next";
import InventoryHqPage from "@/components/InventoryHqPage";

export const metadata: Metadata = {
  title: "Inventory HQ · Multiply OS",
  description:
    "One pool of stock for what you sell and what you take to events. Every SKU, where it is, what is on order, what is promised to orders and events, and a stock history that cannot be edited.",
  openGraph: {
    title: "Inventory HQ · Multiply OS",
    description:
      "One pool of stock for what you sell and what you take to events. Purchasing, orders, event kits, counts and forecasts in one place.",
    url: "https://www.multiplyos.com/features/inventory-hq",
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
    title: "Inventory HQ · Multiply OS",
    description:
      "One pool of stock for what you sell and what you take to events. Purchasing, orders, event kits, counts and forecasts in one place.",
    images: ["/og-image.png"],
  },
};

export default function Page() {
  return <InventoryHqPage />;
}
