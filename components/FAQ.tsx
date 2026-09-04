"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Reveal from "./Reveal";
import { useDemo } from "./DemoModal";

type Item = { q: string; a: ReactNode };

// Opens the demo form itself rather than scrolling to the section that holds
// the button that opens it, which is what an href="#demo" would do. It is a
// button because it performs an action and goes nowhere, styled as a link
// because that is what it reads as inside a sentence.
//
// It exists as its own component so ITEMS can stay a module level constant:
// useDemo is a hook and cannot be called out there.
function DemoLink({ children }: { children: ReactNode }) {
  const { openDemo } = useDemo();
  return (
    <button
      type="button"
      onClick={openDemo}
      className="font-semibold text-brand-orange-dark underline decoration-brand-orange/40 underline-offset-2 hover:decoration-brand-orange"
    >
      {children}
    </button>
  );
}

const ITEMS: Item[] = [
  {
    q: "Why an Operating System?",
    a: "Scalable and profitable businesses have been studied over the last 50 years and there is a proven way to run companies that produce better results. If you don't have a business operating system (OS) installed, the business will become chaotic, disjointed and inefficient, which results in reduced profit and burnout.",
  },
  {
    q: "Is this for startups?",
    a: "Multiply OS is designed for founders with teams and typically $1M to $100M in revenue who are scaling and need operational structure.",
  },
  {
    q: "How long does implementation take?",
    a: "Most companies begin seeing operational clarity within 30 days of implementing the software.",
  },
  {
    q: "What does Multiply OS include?",
    a: (
      <>
        Multiply OS includes a wide range of features designed to help you run
        your business more effectively and efficiently. You can explore all of
        our features in more depth and how they can support your business goals
        by <DemoLink>Requesting a Demo</DemoLink>.
      </>
    ),
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<Record<number, boolean>>({ 0: true });

  // The section's top padding is deliberately smaller than its bottom. CTA sits
  // directly above and is a filled card with its own 48px of inner padding and a
  // glow past its edge, so it already reads as finished; a full 96px on top of
  // CTA's own 96px left about 190px of white before the eyebrow. Trimmed here
  // rather than on CTA, which is shared by twelve other pages where it is
  // followed by the footer instead.
  return (
    <section id="faq" className="scroll-mt-24 px-5 py-8 sm:px-8 sm:pb-24 sm:pt-6">
      <div className="mx-auto max-w-[720px]">
        <Reveal className="mb-4 text-center sm:mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-orange sm:text-sm">
            FAQ
          </p>
          <h2 className="mt-2 text-xl font-extrabold tracking-tight text-brand-ink sm:mt-3 sm:text-4xl">
            Frequently Asked Questions
          </h2>
        </Reveal>

        <Reveal className="border-t border-black/10">
          {ITEMS.map((item, i) => {
            const isOpen = !!open[i];
            return (
              <div key={i} className="border-b border-black/10">
                <button
                  type="button"
                  onClick={() => setOpen((s) => ({ ...s, [i]: !s[i] }))}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-4 py-3 text-left text-[15px] font-bold text-brand-ink transition-colors hover:text-brand-orange-dark sm:py-5 sm:text-lg"
                >
                  <span className="flex-1">{item.q}</span>
                  {/* +/- icon */}
                  <span className="relative ml-auto h-5 w-5 flex-none">
                    <span className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 rounded bg-brand-orange" />
                    <span
                      className={`absolute bottom-0 left-1/2 top-0 w-0.5 -translate-x-1/2 rounded bg-brand-orange transition-transform duration-300 ${
                        isOpen ? "scale-y-0" : "scale-y-100"
                      }`}
                    />
                  </span>
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-[60ch] pb-3 text-[13px] leading-relaxed text-brand-charcoal sm:pb-5 sm:text-base">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
