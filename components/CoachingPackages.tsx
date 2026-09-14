import Reveal from "./Reveal";

/**
 * Implementation & Coaching overview.
 *
 * IMPORTANT: This page is public-facing. Coaching package PRICING and CHECKOUT
 * links are internal only and must NEVER appear here. The single CTA routes to a
 * "Book a Call to Learn More" coaching-call booking (NOT a product demo).
 */
const CTA_URL = "/coaching-call";

/* ---- Content ------------------------------------------------------------ */

type Group = { title: string; note?: string; items: string[] };

const GROUPS: Group[] = [
  {
    title: "Onsite Strategy Day",
    items: [
      "Full-day, in-person working session",
      "Build your One-Page Strategic Plan",
      "Define KPIs, scorecards, and meeting cadence",
      "Train the leadership team on how to run the system",
      "Our team does initial Multiply OS setup for your business",
    ],
  },
  {
    title: "Ongoing Monthly Execution",
    note: "varies by package",
    items: [
      "2 private CEO coaching calls per month",
      "Weekly leadership meeting facilitation",
      "KPI tracking and performance accountability",
      "Team alignment and issue resolution",
      "Quarterly strategic planning sessions",
      "Focus on leadership, decision-making, bottlenecks, and growth",
      "Direct advisory on hiring, strategy, and scaling challenges",
      "Access to tools, templates, and frameworks",
      "Q&A and troubleshooting",
    ],
  },
];

/* ---- Icons -------------------------------------------------------------- */

function Check({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="m5 10.5 3.2 3.2L15 6.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---- Group column ------------------------------------------------------- */

function GroupColumn({ group }: { group: Group }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-brand-gray">
        {group.title}
        {group.note && (
          <span className="ml-1.5 font-semibold normal-case tracking-normal text-brand-gray/80">
            ({group.note})
          </span>
        )}
      </p>
      <ul className="mt-3.5 space-y-2.5">
        {group.items.map((item) => (
          <li key={item} className="flex gap-3 text-[14px] leading-snug text-brand-charcoal">
            <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-orange/10">
              <Check className="h-3.5 w-3.5 text-brand-orange" />
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---- Page section ------------------------------------------------------- */

export default function CoachingPackages() {
  return (
    <section className="relative overflow-hidden px-5 pb-16 pt-12 sm:px-8 sm:pb-24 sm:pt-20">
      {/* Backdrop: dotted grid + ambient orange glows */}
      <div className="pointer-events-none absolute inset-0 bg-dotted opacity-60" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(234,123,27,0.25),transparent_65%)] blur-2xl" />
      <div className="cta-glow pointer-events-none absolute -bottom-16 right-[8%] h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(234,123,27,0.18),transparent_65%)] blur-2xl" />

      <div className="relative mx-auto max-w-container">
        {/* Hero */}
        <div className="text-center">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-orange sm:text-sm">
              Implementation &amp; Coaching Packages
            </p>
            <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight text-brand-ink sm:text-6xl">
              Stop Being the{" "}
              <span className="text-brand-orange">Bottleneck</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-brand-charcoal sm:text-lg">
              Our implementation packages combine strategic coaching with proven
              software to build a self-running leadership team — so you can focus
              on what only you can do.
            </p>
          </Reveal>
        </div>

        {/* Single "All Packages Include" card */}
        <Reveal delay={0.1}>
          <div className="relative mx-auto mt-16 max-w-4xl rounded-3xl border-2 border-brand-orange bg-white p-6 shadow-[0_40px_90px_-45px_rgba(234,123,27,0.65)] sm:p-10 sm:pt-12">
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand-orange px-5 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-[0_12px_28px_-10px_rgba(234,123,27,0.9)] sm:text-sm">
              All Packages Include
            </span>

            <div className="grid gap-10 sm:mt-2 lg:grid-cols-2 lg:gap-12">
              {GROUPS.map((group, i) => (
                <div
                  key={group.title}
                  className={
                    i === 1
                      ? "lg:border-l lg:border-[#EFE9DF] lg:pl-12"
                      : undefined
                  }
                >
                  <GroupColumn group={group} />
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-10 flex justify-center border-t border-[#EFE9DF] pt-8">
              <a
                href={CTA_URL}
                className="inline-flex w-full items-center justify-center rounded-lg bg-brand-orange px-8 py-3.5 text-base font-semibold text-white shadow-[0_12px_34px_-8px_rgba(234,123,27,0.75)] transition-colors hover:bg-brand-orange-dark sm:w-auto sm:min-w-[280px]"
              >
                Book a Call to Learn More
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
