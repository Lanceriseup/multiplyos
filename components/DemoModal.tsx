"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import BookingCalendar from "@/components/BookingCalendar";

/* ------------------------------------------------------------------ */
/*  Context — lets any button anywhere open the demo modal             */
/* ------------------------------------------------------------------ */
const DemoContext = createContext<{ openDemo: () => void }>({
  openDemo: () => {},
});

export const useDemo = () => useContext(DemoContext);

export default function DemoProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openDemo = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <DemoContext.Provider value={{ openDemo }}>
      {children}
      <DemoModal open={open} onClose={close} />
    </DemoContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  The modal — Option A "The Showroom"                                */
/* ------------------------------------------------------------------ */
function DemoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "booking">("form");
  const [contactId, setContactId] = useState<string | null>(null);
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");

  // Lock body scroll + close on Escape while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  // Reset the success state shortly after closing so it's fresh next open
  useEffect(() => {
    if (open) return;
    const t = setTimeout(() => {
      setSubmitted(false);
      setError(null);
      setStep("form");
      setContactId(null);
    }, 300);
    return () => clearTimeout(t);
  }, [open]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const fd = new FormData(e.currentTarget);
      const name = String(fd.get("name") || "");
      const email = String(fd.get("email") || "");
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          company: fd.get("company"),
          teamSize: fd.get("teamSize"),
          message: fd.get("message"),
          source: "Demo Request",
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Submit failed");

      // Move to the in-modal booking step to pick a slot.
      if (json.contactId) {
        setLeadName(name.trim());
        setLeadEmail(email.trim());
        setContactId(json.contactId);
        setStep("booking");
        return;
      }
      // Fallback: no contact returned — show a simple confirmation.
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again or email support@multiplyos.com.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          aria-modal="true"
          role="dialog"
          aria-label="Request a demo"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-[#0f0c08]/50 backdrop-blur-md" />

          {/* Panel */}
          <motion.div
            className={`relative w-full overflow-hidden rounded-[20px] bg-white shadow-[0_40px_80px_-24px_rgba(10,10,10,0.45),0_12px_28px_-16px_rgba(10,10,10,0.3)] ${
              step === "form" ? "grid max-w-[880px] sm:grid-cols-[1.05fr_1fr]" : "block max-w-[860px]"
            }`}
            initial={{ opacity: 0, y: 14, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.99 }}
            transition={{ duration: 0.34, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {/* Close (X) — always visible, top-right */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3.5 top-3.5 z-10 grid h-9 w-9 place-items-center rounded-[9px] border border-black/10 bg-white/90 text-brand-charcoal shadow-sm transition-colors hover:bg-black/5 hover:text-brand-ink"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>

            {step === "form" ? (
              <>
            {/* ---------- Left: warm ivory showroom panel ---------- */}
            <div className="relative hidden overflow-hidden bg-[#FBF4E9] p-8 text-[#241C12] sm:block sm:border-r sm:border-[#F0E6D4]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#E7B27A_1px,transparent_1px)] opacity-30 [background-size:20px_20px]" />
              <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(234,123,27,0.38),transparent_65%)] blur-md" />

              <div className="relative">
                <h2 className="text-balance text-[25px] font-bold leading-[1.12] tracking-tight">
                  See your whole company run on one screen.
                </h2>
                <p className="mt-1.5 text-sm text-[#6B5B47]">
                  A personalized walkthrough, built around your team.
                </p>

                {/* mini product window */}
                <div className="mt-6 overflow-hidden rounded-xl border border-[#F0E6D4] bg-white shadow-[0_16px_34px_-20px_rgba(120,70,10,0.4)]">
                  <div className="flex gap-1.5 border-b border-[#F2EADC] bg-[#FBF4E9] px-3 py-2.5">
                    <i className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                    <i className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
                    <i className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                  </div>
                  <div className="flex flex-col gap-3 p-3.5">
                    {[
                      { ic: "◆", w: "55%", fill: "bg-brand-orange", delay: "0s" },
                      { ic: "▦", w: "40%", fill: "bg-[#D3C4A8]", delay: "0.6s" },
                      { ic: "◷", w: "62%", fill: "bg-brand-orange", delay: "1.1s" },
                    ].map((r, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <div className="grid flex-none place-items-center rounded-[7px] bg-[rgba(234,123,27,0.13)] text-[13px] text-[#C9650F]" style={{ height: 26, width: 26 }}>
                          {r.ic}
                        </div>
                        <div className="flex flex-1 flex-col gap-1.5">
                          <div className="h-[7px] rounded bg-[#EBDFCC]" style={{ width: r.w }} />
                          <div className="h-1.5 overflow-hidden rounded bg-[#F4ECDD]">
                            <div className={`mw-fill h-full rounded ${r.fill}`} style={{ animationDelay: r.delay }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* value props */}
                <div className="mt-5 flex flex-col gap-3">
                  {[
                    "Replace 6+ disconnected tools",
                    "Live in under 2 weeks",
                    "Tailored to your workflows",
                  ].map((t) => (
                    <div key={t} className="flex items-center gap-2.5 text-[13.5px] text-[#6B5B47]">
                      <span className="grid h-5 w-5 flex-none place-items-center rounded-full bg-[rgba(234,123,27,0.16)] text-[#C9650F]">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2">
                          <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      {t}
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center gap-2.5 text-[11.5px] text-[#A08B6F]">
                  <span className="flex">
                    {[12, 32, 45, 68].map((id) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={id}
                        src={`https://i.pravatar.cc/64?img=${id}`}
                        alt=""
                        className="-ml-2 h-7 w-7 rounded-full border-2 border-[#FBF4E9] object-cover first:ml-0"
                      />
                    ))}
                  </span>
                  Trusted by 400+ operating teams
                </div>
              </div>
            </div>

            {/* ---------- Right: form / success ---------- */}
            <div className="flex flex-col p-7 sm:p-8">
              {!submitted ? (
                <>
                  <h3 className="text-xl font-bold tracking-tight">Request a Demo</h3>
                  <p className="mb-5 mt-1 text-[13.5px] text-brand-charcoal">
                    30 minutes. No prep needed. We&rsquo;ll do the driving.
                  </p>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                    <Field label="Work email">
                      <input type="email" name="email" required placeholder="you@company.com" className={inputCls} />
                    </Field>
                    <div className="grid gap-3.5 sm:grid-cols-2">
                      <Field label="Full name">
                        <input type="text" name="name" required placeholder="Jordan Lee" className={inputCls} />
                      </Field>
                      <Field label="Company">
                        <input type="text" name="company" required placeholder="Acme Inc." className={inputCls} />
                      </Field>
                    </div>
                    <Field label="Team size">
                      <div className="relative">
                        <select name="teamSize" required defaultValue="" className={`${inputCls} appearance-none pr-10`}>
                          <option value="" disabled>
                            Select…
                          </option>
                          <option>1–10</option>
                          <option>11–50</option>
                          <option>51–200</option>
                          <option>200+</option>
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
                    <Field label="What would you like to see?">
                      <textarea
                        name="message"
                        rows={2}
                        placeholder="e.g. how Multiply OS replaces our project + finance stack"
                        className={`${inputCls} min-h-[72px] resize-none`}
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
                      {loading ? "Submitting…" : "Request a Demo"}
                    </button>
                    <p className="mt-1 text-center text-xs text-brand-gray">
                      By submitting you agree to our{" "}
                      <a href="#" className="text-brand-charcoal underline underline-offset-2">
                        Privacy Policy
                      </a>
                      .
                    </p>
                  </form>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-1 flex-col items-center justify-center gap-3.5 py-10 text-center"
                >
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-[#1F9D55]/12 text-[#1F9D55]">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="text-[23px] font-bold tracking-tight">Request received 🎉</h3>
                  <p className="max-w-[34ch] text-brand-charcoal">
                    A Multiply OS specialist will reach out within{" "}
                    <strong>1 business day</strong> to schedule your walkthrough.
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-1 rounded-[9px] border border-black/10 px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-black/5"
                  >
                    Close
                  </button>
                </motion.div>
              )}
            </div>
              </>
            ) : (
              <BookingCalendar
                contactId={contactId}
                leadName={leadName}
                leadEmail={leadEmail}
                onBack={() => setStep("form")}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/*  Small helpers                                                      */
/* ------------------------------------------------------------------ */
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
