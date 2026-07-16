"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useDemo } from "@/components/DemoModal";

const CONTACT_EMAIL = "support@multiplyos.com";

const inputCls =
  "w-full rounded-[9px] border border-[#E1DBD2] bg-white px-3.5 py-3 text-[15px] text-brand-ink transition-shadow placeholder:text-brand-gray focus:border-brand-orange focus:outline-none focus:ring-[3px] focus:ring-brand-orange/15";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-brand-charcoal">
        {label}
      </span>
      {children}
    </label>
  );
}

function Detail({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3.5">
      <span className="grid h-10 w-10 flex-none place-items-center rounded-[10px] bg-brand-orange/[0.13] text-brand-orange-dark">
        {icon}
      </span>
      <div>
        <p className="text-[11.5px] font-semibold uppercase tracking-[0.05em] text-brand-gray">
          {label}
        </p>
        <div className="mt-0.5 text-[15.5px] font-medium text-brand-ink">{children}</div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  const { openDemo } = useDemo();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const fd = new FormData(e.currentTarget);
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          company: fd.get("company"),
          topic: fd.get("topic"),
          message: fd.get("message"),
          source: "Contact Form",
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Submit failed");
      setSubmitted(true);
    } catch {
      setError(`Something went wrong. Please try again or email ${CONTACT_EMAIL}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <section className="relative flex flex-1 flex-col justify-center overflow-hidden px-5 pb-24 pt-16 sm:px-8">
        <div className="bg-dotted pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative mx-auto grid max-w-container items-start gap-12 md:grid-cols-[1fr_1.15fr] lg:gap-20">
          {/* Left: intro + contact details */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-orange">
              Contact
            </p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-ink sm:text-4xl">
              Talk to the <span className="text-brand-orange">team</span>
            </h1>
            <p className="mt-4 max-w-md text-lg text-brand-charcoal">
              Whether you&rsquo;re evaluating Multiply OS or already onboard,
              we&rsquo;re here to help.
            </p>

            <div className="mt-10 flex flex-col gap-6">
              <Detail
                label="Email"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3 7 9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                }
              >
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="font-semibold text-brand-orange-dark hover:underline"
                >
                  {CONTACT_EMAIL}
                </a>
              </Detail>

              <Detail
                label="Response time"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                }
              >
                Within 1 business day
              </Detail>

              <Detail
                label="Looking for a demo?"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                    <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                }
              >
                <button
                  type="button"
                  onClick={openDemo}
                  className="font-semibold text-brand-orange-dark hover:underline"
                >
                  Request a walkthrough →
                </button>
              </Detail>
            </div>

            <div className="mt-8 border-t border-black/10 pt-6 text-sm leading-relaxed text-brand-charcoal">
              <p className="font-semibold text-brand-ink">Support hours</p>
              <p>Monday – Friday, 9am – 6pm ET</p>
            </div>
          </div>

          {/* Right: message form */}
          <div className="rounded-[16px] border border-black/10 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_18px_44px_-24px_rgba(10,10,10,0.28)] sm:p-8">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name">
                    <input type="text" name="name" required placeholder="Jordan Lee" className={inputCls} />
                  </Field>
                  <Field label="Work email">
                    <input type="email" name="email" required placeholder="you@company.com" className={inputCls} />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Company">
                    <input type="text" name="company" placeholder="Acme Inc." className={inputCls} />
                  </Field>
                  <Field label="Topic">
                    <div className="relative">
                      <select name="topic" required defaultValue="" className={`${inputCls} appearance-none pr-10`}>
                        <option value="" disabled>
                          Select…
                        </option>
                        <option>Sales</option>
                        <option>Support</option>
                        <option>Partnership</option>
                        <option>Something else</option>
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
                  </Field>
                </div>
                <Field label="Message">
                  <textarea
                    name="message"
                    required
                    rows={4}
                    placeholder="How can we help?"
                    className={`${inputCls} min-h-[120px] resize-none`}
                  />
                </Field>
                {error && (
                  <p className="text-center text-[13px] font-medium text-[#C0392B]">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-1 w-full rounded-[9px] bg-brand-orange px-4 py-3 text-[15.5px] font-semibold text-white shadow-[0_6px_16px_-8px_rgba(234,123,27,0.8)] transition-colors hover:bg-brand-orange-dark disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Sending…" : "Send message"}
                </button>
                <p className="text-center text-xs text-brand-gray">
                  Prefer email? Reach us at{" "}
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="text-brand-charcoal underline underline-offset-2"
                  >
                    {CONTACT_EMAIL}
                  </a>
                  .
                </p>
              </form>
            ) : (
              <div className="flex min-h-[360px] flex-col items-center justify-center gap-3.5 py-8 text-center">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-[#1F9D55]/12 text-[#1F9D55]">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                    <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 className="text-[23px] font-bold tracking-tight text-brand-ink">
                  Message sent 🎉
                </h2>
                <p className="max-w-[34ch] text-brand-charcoal">
                  Thanks for reaching out — we&rsquo;ll get back to you within{" "}
                  <strong>1 business day</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-1 rounded-[9px] border border-black/10 px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-black/5"
                >
                  Send another
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
