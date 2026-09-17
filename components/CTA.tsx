"use client";

import Reveal from "./Reveal";
import { useDemo } from "./DemoModal";

const SIGNUP_URL = "https://app.multiplyos.com/signup";

export default function CTA({ href }: { href?: string }) {
  const { openDemo } = useDemo();
  return (
    <section id="demo" className="scroll-mt-24 py-10 sm:py-24">
      <div className="mx-auto max-w-container px-5 sm:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-[#E0DCD3] bg-[#EDEAE4] px-6 py-7 shadow-[0_26px_70px_-34px_rgba(234,123,27,0.5)] sm:px-14 sm:py-12">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#C9C3B7_1px,transparent_1px)] opacity-50 [background-size:22px_22px]" />
            {/* ambient orange glow */}
            <div className="cta-glow pointer-events-none absolute -right-16 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(234,123,27,0.55),transparent_62%)] blur-2xl" />
            <div className="cta-glow pointer-events-none absolute -left-12 -top-12 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(234,123,27,0.3),transparent_65%)] blur-2xl" style={{ animationDelay: "1.8s" }} />
            <div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:justify-between sm:gap-10 sm:text-left">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-brand-ink sm:text-4xl">
                  See Multiply OS{" "}
                  <span className="text-brand-orange">in action</span>
                </h2>
                <p className="mt-3 max-w-xl text-sm text-brand-charcoal sm:text-lg">
                  Book a personalized walkthrough and see how your team can run
                  on one platform.
                </p>
              </div>
              <div className="flex w-full flex-none flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                {href ? (
                  <a
                    href={href}
                    className="inline-flex w-full items-center justify-center rounded-lg bg-brand-orange px-6 py-2.5 text-base font-semibold text-white shadow-[0_10px_30px_-8px_rgba(234,123,27,0.75)] transition-colors hover:bg-brand-orange-dark sm:w-auto sm:min-w-[190px]"
                  >
                    Request a Demo
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={openDemo}
                    className="inline-flex w-full items-center justify-center rounded-lg bg-brand-orange px-6 py-2.5 text-base font-semibold text-white shadow-[0_10px_30px_-8px_rgba(234,123,27,0.75)] transition-colors hover:bg-brand-orange-dark sm:w-auto sm:min-w-[190px]"
                  >
                    Request a Demo
                  </button>
                )}
                <a
                  href={SIGNUP_URL}
                  className="inline-flex w-full items-center justify-center rounded-lg border border-brand-orange/35 bg-white/70 px-6 py-2.5 text-base font-semibold text-brand-orange transition-colors hover:border-brand-orange/55 hover:bg-white sm:w-auto sm:min-w-[150px]"
                >
                  Sign up
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
