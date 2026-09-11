import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "You're booked — Multiply OS Strategy Call",
  description:
    "Your Multiply OS strategy call is confirmed. Check your inbox for the calendar invite and details.",
  alternates: { canonical: "/coaching-call/thank-you" },
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

const STEPS = [
  {
    title: "Check Your Inbox",
    body: "We just sent your calendar invite and a confirmation email. Add it to your calendar so it's locked in.",
  },
  {
    title: "Block 30 Focused Minutes",
    body: "Find a quiet spot, free from distractions, where you can talk openly. Turn off other technology.",
  },
  {
    title: "Bring Your #1 Bottleneck",
    body: "Come with the single biggest thing slowing your growth. That's where we'll start.",
  },
];

function StepIcon({ n }: { n: number }) {
  return (
    <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-brand-orange/12 text-sm font-extrabold text-brand-orange-dark">
      {n}
    </span>
  );
}

export default function ThankYouPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="relative overflow-hidden px-5 pb-24 pt-16 sm:px-8 sm:pb-32 sm:pt-24">
        {/* Backdrop */}
        <div className="pointer-events-none absolute inset-0 bg-dotted opacity-60" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(234,123,27,0.25),transparent_65%)] blur-2xl" />

        <div className="relative mx-auto max-w-2xl text-center">
          <Reveal>
            {/* Success disc */}
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-[#F6A04C] to-[#E2740F] text-white shadow-[0_20px_44px_-16px_rgba(226,116,15,0.85)]">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
                <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <p className="mt-7 text-xs font-semibold uppercase tracking-wider text-brand-orange sm:text-sm">
              Booking confirmed
            </p>
            <h1 className="mt-3 text-3xl font-extrabold leading-[1.1] tracking-tight text-brand-ink sm:text-5xl">
              Your Strategy Call Is{" "}
              <span className="text-brand-orange">Booked</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-brand-charcoal sm:text-lg">
              Check your inbox — we&rsquo;ve sent a calendar invite and confirmation
              with all the details. We&rsquo;re looking forward to helping you
              uncover your bottlenecks and map a clear path to aligned growth.
            </p>
          </Reveal>

          {/* What happens next */}
          <Reveal delay={0.1}>
            <div className="mt-12 rounded-3xl border border-[#E7E3DA] bg-white p-6 text-left shadow-[0_40px_90px_-50px_rgba(234,123,27,0.55)] sm:p-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-brand-gray">
                What happens next
              </p>
              <ul className="mt-5 space-y-5">
                {STEPS.map((s, i) => (
                  <li key={s.title} className="flex gap-4">
                    <StepIcon n={i + 1} />
                    <div>
                      <p className="text-[15px] font-bold text-brand-ink">{s.title}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-brand-charcoal">
                        {s.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Soft next step */}
          <Reveal delay={0.16}>
            <div className="mt-10 flex flex-col items-center gap-4">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-lg bg-brand-orange px-8 py-3.5 text-base font-semibold text-white shadow-[0_12px_34px_-8px_rgba(234,123,27,0.75)] transition-colors hover:bg-brand-orange-dark"
              >
                Back to Homepage
              </Link>
              <p className="text-[13px] text-brand-gray">
                Need to reschedule? Use the link in your confirmation email, or reply
                to it and we&rsquo;ll sort it out.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
