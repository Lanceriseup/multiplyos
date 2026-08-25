import Reveal from "./Reveal";

// All CTAs on this page route to the Rise Up Kings coaching-package booking page.
const CTA_URL = "https://go.riseupkings.com/coachingpackage";

/* ---- Content ------------------------------------------------------------ */

type Group = { title: string; items: string[]; kind?: "included" | "client" };

type Tier = {
  chip: string;
  name: string;
  tagline: string;
  oneTime: string;
  oneTimeLabel: string;
  monthly: string;
  featured?: boolean;
  ctaUrl?: string;
  groups: Group[];
  outcomes: string[];
};

const TIERS: Tier[] = [
  {
    chip: "Entry",
    name: "Launch + Self-Implementation",
    tagline:
      "For companies that want the system but will execute it internally.",
    oneTime: "$5,000",
    oneTimeLabel: "Onsite Strategy Day",
    monthly: "$1,000",
    groups: [
      {
        title: "Onsite Strategy Day",
        items: [
          "Build your One-Page Plan",
          "Define KPIs and meeting structure",
          "Train the leadership team on how to run the system",
        ],
      },
      {
        title: "Ongoing Support",
        items: [
          "Monthly group coaching calls",
          "Access to tools, templates, and frameworks",
          "Q&A and troubleshooting",
          "Guidance on running effective leadership meetings",
        ],
      },
      {
        title: "Your Responsibility",
        kind: "client",
        items: [
          "You run your own leadership meetings",
          "You drive accountability internally",
        ],
      },
    ],
    outcomes: [
      "A clear system installed",
      "Lower cost, higher self-discipline required",
      "Access to guidance without full facilitation",
    ],
  },
  {
    chip: "Execution",
    name: "Full Implementation",
    tagline:
      "For companies that want full system implementation but less direct CEO coaching.",
    oneTime: "$5,000",
    oneTimeLabel: "Onsite Strategy & Team Implementation Day",
    monthly: "$3,000",
    ctaUrl: "https://go.riseupkings.com/full-implementation",
    groups: [
      {
        title: "Onsite Implementation Day",
        items: [
          "Full-day, in-person working session",
          "Build your One-Page Strategic Plan",
          "Define KPIs, scorecards, and meeting cadence",
          "Align leadership team roles and expectations",
          "Install Multiply OS into your business in real time",
        ],
      },
      {
        title: "Ongoing Execution",
        items: [
          "2 calls per month — coaching or leadership meeting facilitation",
          "KPI tracking and accountability",
          "Issue identification and resolution",
          "Quarterly strategy sessions (4/year, 2–3 hours, virtual)",
        ],
      },
    ],
    outcomes: [
      "The leadership team runs on a proven system",
      "Increased accountability and execution",
      "Clear direction and consistent progress",
    ],
  },
  {
    chip: "Premium",
    name: "Full Implementation + CEO Coaching",
    tagline:
      "For companies that want full execution, accountability, and direct CEO transformation.",
    oneTime: "$5,000",
    oneTimeLabel: "Onsite Strategy & Team Implementation Day",
    monthly: "$5,000",
    featured: true,
    ctaUrl: "https://go.riseupkings.com/full-implementation-ceocoaching",
    groups: [
      {
        title: "Onsite Implementation Day",
        items: [
          "Full-day, in-person working session",
          "Build your One-Page Strategic Plan",
          "Define KPIs, scorecards, and meeting cadence",
          "Align leadership team roles and expectations",
          "Install Multiply OS into your business in real time",
        ],
      },
      {
        title: "Ongoing Execution — Monthly",
        items: [
          "Weekly leadership meeting facilitation (2×/month, done-for-you)",
          "KPI tracking and performance accountability",
          "Team alignment and issue resolution",
          "Quarterly strategic planning sessions (virtual, 3–4 hours)",
        ],
      },
      {
        title: "CEO Coaching — High-Touch",
        items: [
          "2 private CEO coaching calls per month",
          "Focus on leadership, decision-making, bottlenecks, and growth",
          "Direct advisory on hiring, strategy, and scaling challenges",
        ],
      },
    ],
    outcomes: [
      "Fully installed operating system on Multiply OS software",
      "A self-correcting leadership team",
      "Clear metrics driving growth",
      "A CEO operating with higher clarity and control",
    ],
  },
];

/* ---- Icons -------------------------------------------------------------- */

function Check({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className={className}
      aria-hidden="true"
    >
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

function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 10h11M11 6l4 4-4 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---- Card --------------------------------------------------------------- */

function TierCard({ tier }: { tier: Tier }) {
  const featured = !!tier.featured;

  return (
    <div
      className={`relative flex h-full flex-col rounded-3xl bg-white p-6 sm:p-7 ${
        featured
          ? "border-2 border-brand-orange shadow-[0_30px_80px_-40px_rgba(234,123,27,0.65)]"
          : "border border-[#E7E3DA] shadow-[0_20px_50px_-40px_rgba(0,0,0,0.4)]"
      }`}
    >
      {featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-orange px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-[0_10px_24px_-10px_rgba(234,123,27,0.9)]">
          Most Popular
        </span>
      )}

      {/* Header */}
      <div>
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
            featured
              ? "bg-brand-orange/10 text-brand-orange-dark"
              : "bg-black/[0.04] text-brand-charcoal"
          }`}
        >
          {tier.chip}
        </span>
        <h3 className="mt-3 text-xl font-extrabold tracking-tight text-brand-ink sm:text-[22px]">
          {tier.name}
        </h3>
        <p className="mt-2 min-h-[40px] text-sm leading-relaxed text-brand-charcoal">
          {tier.tagline}
        </p>
      </div>

      {/* Price */}
      <div className="mt-5 rounded-2xl border border-[#ECE8E0] bg-[#FAF8F4] p-4">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold tracking-tight text-brand-ink">
            {tier.monthly}
          </span>
          <span className="text-sm font-medium text-brand-charcoal">/month</span>
        </div>
        <p className="mt-1.5 text-[13px] text-brand-charcoal">
          plus{" "}
          <span className="font-semibold text-brand-ink">{tier.oneTime}</span>{" "}
          one-time
          <span className="block text-brand-gray">{tier.oneTimeLabel}</span>
        </p>
      </div>

      {/* Feature groups */}
      <div className="mt-6 space-y-5">
        {tier.groups.map((group) => {
          const isClient = group.kind === "client";
          return (
            <div key={group.title}>
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-brand-gray">
                {group.title}
              </p>
              <ul className="mt-2.5 space-y-2">
                {group.items.map((item) => (
                  <li key={item} className="flex gap-2.5 text-[13.5px] leading-snug">
                    {isClient ? (
                      <Arrow className="mt-0.5 h-4 w-4 flex-none text-brand-gray" />
                    ) : (
                      <Check
                        className={`mt-0.5 h-4 w-4 flex-none ${
                          featured ? "text-brand-orange" : "text-brand-orange-dark"
                        }`}
                      />
                    )}
                    <span
                      className={isClient ? "text-brand-gray" : "text-brand-charcoal"}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Outcome */}
      <div className="mt-6 rounded-2xl bg-[#F5F2EC] p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-brand-orange-dark">
          Outcome
        </p>
        <ul className="mt-2.5 space-y-1.5">
          {tier.outcomes.map((o) => (
            <li key={o} className="flex gap-2 text-[13px] font-medium leading-snug text-brand-ink">
              <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-brand-orange" />
              <span>{o}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="mt-auto pt-6">
        <a
          href={tier.ctaUrl ?? CTA_URL}
          aria-label={`Subscribe now — ${tier.name}`}
          className={`flex w-full items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold transition-colors ${
            featured
              ? "bg-brand-orange text-white shadow-[0_10px_30px_-8px_rgba(234,123,27,0.75)] hover:bg-brand-orange-dark"
              : "border-2 border-brand-orange text-brand-orange-dark hover:bg-brand-orange hover:text-white"
          }`}
        >
          Subscribe now
        </a>
      </div>
    </div>
  );
}

/* ---- Page section ------------------------------------------------------- */

const SHARED = [
  "Full-day onsite Strategy & Implementation Day",
  "Built on the Multiply OS system & software",
  "One-Page Strategic Plan, KPIs & scorecards",
];

export default function PricingPackages() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden px-5 pt-12 sm:px-8 sm:pt-20">
        <div className="pointer-events-none absolute inset-0 bg-dotted opacity-60" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(234,123,27,0.22),transparent_65%)] blur-2xl" />
        <div className="relative mx-auto max-w-container text-center">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-orange sm:text-sm">
              Implementation &amp; Coaching Packages
            </p>
            <h1 className="mx-auto mt-3 max-w-3xl text-3xl font-extrabold leading-[1.1] tracking-tight text-brand-ink sm:text-5xl">
              Get Multiply OS <span className="text-brand-orange">installed</span>{" "}
              — and your leadership team running it.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-brand-charcoal sm:text-lg">
              Done-with-you to done-for-you packages that pair the Multiply OS
              software with hands-on strategy, coaching, and accountability.
              Every package starts with a full-day onsite implementation.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <ul className="mx-auto mt-6 flex max-w-3xl flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] text-brand-charcoal">
              {SHARED.map((s) => (
                <li key={s} className="flex items-center gap-2">
                  <Check className="h-4 w-4 flex-none text-brand-orange" />
                  {s}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Cards */}
      <section className="px-5 py-10 sm:px-8 sm:py-16">
        <div className="mx-auto grid max-w-container items-stretch gap-6 lg:grid-cols-3">
          {TIERS.map((tier, i) => (
            <Reveal key={tier.name} delay={i * 0.08} className="h-full">
              <TierCard tier={tier} />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 flex flex-col items-center sm:mt-12">
          <a
            href={CTA_URL}
            className="inline-flex items-center justify-center rounded-lg bg-brand-orange px-8 py-3 text-base font-semibold text-white shadow-[0_10px_30px_-8px_rgba(234,123,27,0.75)] transition-colors hover:bg-brand-orange-dark"
          >
            Request a Demo
          </a>
          <p className="mx-auto mt-4 max-w-2xl text-center text-[13px] text-brand-gray">
            All packages include the one-time onsite day and are billed monthly
            thereafter. Not sure which fit is right?{" "}
            <a
              href={CTA_URL}
              className="font-semibold text-brand-orange-dark underline decoration-brand-orange/40 underline-offset-2 hover:decoration-brand-orange"
            >
              Talk to our team
            </a>{" "}
            and we&apos;ll help you choose.
          </p>
        </Reveal>
      </section>
    </>
  );
}
