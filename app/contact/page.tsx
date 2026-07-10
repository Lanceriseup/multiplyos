import type { Metadata } from "next";
import ContactPage from "@/components/ContactPage";

export const metadata: Metadata = {
  title: "Contact · Multiply OS",
  description:
    "Get in touch with the Multiply OS team. Questions about the platform, pricing, or a partnership — we reply within one business day.",
};

export default function Page() {
  return <ContactPage />;
}
