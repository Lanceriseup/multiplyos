"use client";

import { useEffect, useState, type ReactNode } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import Reveal from "./Reveal";

/* ---- Config ------------------------------------------------------------- */

// GHL booking widget for the coaching / strategy call (Mark Simpson setup).
const GHL_CALENDAR_SRC =
  "https://api.leadconnectorhq.com/widget/booking/D9qVaO75mwjBw5z6Hw6A";

/* ---- Content ------------------------------------------------------------ */

const AGENDA = [
  "Identify the real bottlenecks slowing your growth (not just surface-level problems)",
  "Expose the gaps in your current systems, leadership, and execution",
  "Clarify your vision and what it will actually take to achieve it",
  "Show you how Multiply OS can bring alignment, structure, and momentum",
  "Map out your next steps—whether we work together or not",
];

const INDUSTRIES = [
  "Restoration & Construction",
  "Home Services",
  "Financial Services",
  "Manufacturing",
  "Professional Service",
];

const REVENUES = [
  "1 – 2 Million",
  "2 – 5 Million",
  "5 – 10 Million",
  "10 – 20 Million",
  "20+ Million",
];

/* ---- Shared field styles (matches the demo form) ------------------------ */

const inputCls =
  "w-full rounded-[9px] border border-[#E1DBD2] bg-white px-3.5 py-3 text-[15px] text-brand-ink transition-shadow placeholder:text-brand-gray focus:border-brand-orange focus:outline-none focus:ring-[3px] focus:ring-brand-orange/15";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-brand-charcoal">
        {label}
      </span>
      {children}
    </label>
  );
}

function Select({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div className="relative">
      <select
        name={name}
        required
        defaultValue=""
        className={`${inputCls} cursor-pointer appearance-none pr-10`}
      >
        <option value="" disabled>
          Select…
        </option>
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-charcoal"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
      >
        <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function Check({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="m5 10.5 3.2 3.2L15 6.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---- Calendar step (funnel copy + embedded GHL widget) ------------------ */

function CalendarStep({
  firstName,
  onBack,
}: {
  firstName: string;
  onBack: () => void;
}) {
  const router = useRouter();

  // Send the visitor to the thank-you page once GHL signals the appointment is
  // booked. Guarded to GHL widget origins and to booking-related messages only,
  // so it never fires on the widget's routine auto-resize messages. This is a
  // convenience layer; the reliable path is the calendar's own post-booking
  // redirect (set that to /coaching-call/thank-you inside GHL).
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (!/(^|\.)(leadconnectorhq|msgsndr)\.com$/.test(new URL(e.origin || "http://x").hostname)) {
        return;
      }
      const data = e.data;
      // Ignore auto-resize messages (they carry a height).
      if (data && typeof data === "object" && ("height" in data || "type" in data && /height|resize/i.test(String((data as { type?: string }).type)))) {
        return;
      }
      const text = typeof data === "string" ? data : JSON.stringify(data ?? "");
      if (/appointment|booked|booking[\s_-]*success|scheduled|thank/i.test(text)) {
        router.push("/coaching-call/thank-you");
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [router]);

  return (
    <Reveal className="mx-auto max-w-3xl">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-orange sm:text-sm">
          Almost there — final step
        </p>
        <h1 className="mx-auto mt-3 max-w-2xl text-3xl font-extrabold leading-[1.1] tracking-tight text-brand-ink sm:text-[40px] sm:leading-[1.08]">
          {firstName ? `Nice work, ${firstName}. ` : ""}Pick the time that works
          best for <span className="text-brand-orange">you</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-brand-charcoal sm:text-lg">
          You&rsquo;re one step away from your 30-minute strategy session. Choose
          an open slot below and we&rsquo;ll send a calendar invite straight to
          your inbox. Come ready to talk through what&rsquo;s really slowing your
          growth — you&rsquo;ll leave with a clear next step.
        </p>

        {/* What to expect — reinforces the offer while they pick a time */}
        <ul className="mx-auto mt-6 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13.5px] font-medium text-brand-charcoal">
          {["30 minutes, one-on-one", "A clear, personalized action plan", "No pressure, no obligation"].map(
            (t) => (
              <li key={t} className="flex items-center gap-2">
                <Check className="h-4 w-4 flex-none text-brand-orange" />
                {t}
              </li>
            )
          )}
        </ul>
      </div>

      {/* Embedded GHL calendar */}
      <div className="mt-8 overflow-hidden rounded-3xl border border-[#E7E3DA] bg-white p-2 shadow-[0_40px_90px_-50px_rgba(234,123,27,0.55)] sm:p-4">
        <iframe
          src={GHL_CALENDAR_SRC}
          title="Book your Multiply OS strategy call"
          id="D9qVaO75mwjBw5z6Hw6A_coaching"
          scrolling="no"
          className="h-[760px] w-full border-none"
          style={{ minHeight: 760 }}
        />
      </div>
      {/* GHL auto-resizes the iframe to its content once this loads. */}
      <Script
        src="https://link.msgsndr.com/js/form_embed.js"
        strategy="afterInteractive"
      />

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onBack}
          className="text-[13.5px] font-semibold text-brand-charcoal underline decoration-brand-orange/40 underline-offset-2 transition-colors hover:text-brand-ink hover:decoration-brand-orange"
        >
          ← Edit your details
        </button>
      </div>
    </Reveal>
  );
}

/* ---- Page --------------------------------------------------------------- */

export default function CoachingCall() {
  const [step, setStep] = useState<"form" | "calendar">("form");
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const first = String(fd.get("firstName") || "").trim();
    setFirstName(first);

    // Capture / enrich the lead in GHL (qualifier answers + coaching tags).
    // Best-effort: never block the person from reaching the calendar if this
    // hiccups — the booking widget captures the appointment either way.
    try {
      await fetch("/api/coaching-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: first,
          lastName: fd.get("lastName"),
          email: fd.get("email"),
          phone: fd.get("phone"),
          organization: fd.get("organization"),
          businessOwner: fd.get("businessOwner"),
          industry: fd.get("industry"),
          revenue: fd.get("revenue"),
        }),
      }).catch(() => {});
    } finally {
      setLoading(false);
      setStep("calendar");
    }
  };

  return (
    <section className="relative overflow-hidden px-5 pb-20 pt-12 sm:px-8 sm:pb-28 sm:pt-16">
      {/* Backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-dotted opacity-60" />
      <div className="pointer-events-none absolute -top-24 left-[12%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(234,123,27,0.22),transparent_65%)] blur-2xl" />
      <div className="cta-glow pointer-events-none absolute -bottom-16 right-[6%] h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(234,123,27,0.16),transparent_65%)] blur-2xl" />

      {step === "calendar" ? (
        <div className="relative">
          <CalendarStep firstName={firstName} onBack={() => setStep("form")} />
        </div>
      ) : (
        <div className="relative mx-auto grid max-w-container items-start gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          {/* ---- Left: pitch ---- */}
          <Reveal className="lg:pt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-orange sm:text-sm">
              Book Your Strategy Call
            </p>
            <h1 className="mt-3 max-w-2xl text-3xl font-extrabold leading-[1.1] tracking-tight text-brand-ink sm:text-[42px] sm:leading-[1.08]">
              Discover How Installing Multiply OS in Your Business Can Create{" "}
              <span className="text-brand-orange">Alignment and Breakthrough</span>{" "}
              Today
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-brand-charcoal sm:text-lg">
              In 30 minutes, we&rsquo;ll identify what&rsquo;s holding your business
              back, uncover the gaps in your current systems, and map out a clear
              path to sustainable, aligned growth.
            </p>

            <div className="mt-8">
              <p className="text-sm font-bold uppercase tracking-[0.08em] text-brand-gray">
                During our time together, we&rsquo;ll:
              </p>
              <ul className="mt-4 space-y-3.5">
                {AGENDA.map((item) => (
                  <li key={item} className="flex gap-3 text-[15px] leading-snug text-brand-charcoal">
                    <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-brand-orange/12">
                      <Check className="h-4 w-4 text-brand-orange" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* ---- Right: form ---- */}
          <Reveal delay={0.1}>
            <div className="rounded-3xl border border-[#E7E3DA] bg-white p-6 shadow-[0_40px_90px_-50px_rgba(234,123,27,0.55)] sm:p-8">
              <h2 className="text-xl font-bold tracking-tight text-brand-ink sm:text-2xl">
                Book your call
              </h2>
              <p className="mb-6 mt-1 text-[13.5px] text-brand-charcoal">
                Tell us a bit about your business and we&rsquo;ll get you scheduled.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="First name">
                    <input type="text" name="firstName" required placeholder="Jordan" className={inputCls} />
                  </Field>
                  <Field label="Last name">
                    <input type="text" name="lastName" required placeholder="Lee" className={inputCls} />
                  </Field>
                </div>

                <Field label="Email">
                  <input
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    inputMode="email"
                    pattern="[^@\s]+@[^@\s]+\.[A-Za-z]{2,}"
                    title="Enter a valid email address, e.g. you@company.com"
                    placeholder="you@company.com"
                    className={inputCls}
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Mobile number">
                    <input
                      type="tel"
                      name="phone"
                      required
                      autoComplete="tel"
                      inputMode="numeric"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 15))}
                      minLength={10}
                      maxLength={15}
                      pattern="[0-9]{10,15}"
                      title="Enter numbers only — at least 10 digits"
                      placeholder="5551234567"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Organization">
                    <input type="text" name="organization" required placeholder="Acme Inc." className={inputCls} />
                  </Field>
                </div>

                <Field label="Are you a business owner?">
                  <Select name="businessOwner">
                    <option>Yes</option>
                    <option>No</option>
                  </Select>
                </Field>

                <Field label="Industry">
                  <Select name="industry">
                    {INDUSTRIES.map((i) => (
                      <option key={i}>{i}</option>
                    ))}
                  </Select>
                </Field>

                <Field label="Last year revenue">
                  <Select name="revenue">
                    {REVENUES.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </Select>
                </Field>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full rounded-[10px] bg-brand-orange px-6 py-3.5 text-base font-semibold text-white shadow-[0_12px_30px_-10px_rgba(234,123,27,0.85)] transition-colors hover:bg-brand-orange-dark disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Submitting…" : "Schedule My Call"}
                </button>
                <p className="text-center text-xs text-brand-gray">
                  By submitting you agree to our{" "}
                  <a href="/privacy" className="text-brand-charcoal underline underline-offset-2">
                    Privacy Policy
                  </a>
                  .
                </p>
              </form>
            </div>
          </Reveal>
        </div>
      )}
    </section>
  );
}
