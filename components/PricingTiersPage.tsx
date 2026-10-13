"use client";

// The pricing page while the pricing v2 switch is on: three plans priced per
// user (GROW, SCALE, MULTIPLY). app/pricing/page.tsx renders this in place of
// PricingPage.tsx only when pricingV2SiteEnabled() is true; with the switch off
// this file is never rendered.
//
// It is direction A of the MOS Pricing Rollout map (chief-of-staff repository,
// references/mos-pricing-restructure/pricing-rollout.html): the plan picker, an
// annual or monthly toggle, a team size that turns per user prices into a team
// total, then the add-ons, setup packages, comparison table and FAQ.
//
// Where things live:
//   - prices and the team total math: lib/pricing-tiers.ts. The plan cards, the
//     comparison table and the FAQ: lib/pricing-copy.ts. Both are pure data and
//     tested, and nothing on this page hard-codes a price.
//   - every link into the app: lib/app-links.mjs, so a Start free trial button
//     is the same URL as the hero's and the /rukcon redirect.
//
// Two modes, chosen at build time by the second switch (see lib/pricing-v2.ts):
//   - annual billing on: Annual (the opening choice) and Monthly, "Save up to
//     25%", and Launch onboarding with annual MULTIPLY.
//   - annual billing off, the monthly only launch (the app blocks annual
//     checkout until counsel approves the annual consent text): no toggle, monthly
//     prices, every link says billing=monthly, and nothing on the page mentions
//     annual billing or says Launch is included.
//
// The artifact the design came from used a navy card for the featured plan. The
// site's palette has no navy (the old pricing page dropped it), so SCALE takes
// the site's ink instead and keeps the orange for the badge and the buttons.
import { Fragment, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Reveal from "./Reveal";
import { useDemo } from "./DemoModal";
import { appTrialUrl } from "@/lib/app-links.mjs";
import {
  AI_MONTHLY_CAP_DEFAULT,
  ANNUAL_SAVINGS_LABEL,
  DEFAULT_USERS,
  FEATURED_PLAN,
  GROW_ADDON_PRICE_PER_MONTH,
  HQ_PRICE_PER_MONTH,
  MAX_USERS,
  MIN_USERS,
  MULTIPLY_MIN_USERS,
  PLAN_ORDER,
  PRICE_PER_USER_MONTH,
  TRIAL_DAYS,
  clampUsers,
  money,
  teamTotalParts,
} from "@/lib/pricing-tiers";
import type { Billing, PlanId } from "@/lib/pricing-tiers";
import { HQ_ADDONS, PLANS, faqItems, planItems, visibleFeatureGroups, visibleSetupPackages } from "@/lib/pricing-copy";
import type { FeatureValue } from "@/lib/pricing-copy";
import { leadBilling, pricingV2AnnualEnabled } from "@/lib/pricing-v2";
import { boothOffer, boothPlanLine } from "@/lib/rukcon-booth";

// Annual billing is offered only when both switches are on. Fixed at build time,
// so the server render and the browser always agree.
const PRICING_V2_ANNUAL = pricingV2AnnualEnabled();

// ---------------------------------------------------------------- shared bits

const ico = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
type IconProps = { className?: string };

const Tick = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2.8} aria-hidden="true">
    <path d="M5 12l5 5L20 7" />
  </svg>
);
const Chevron = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2.2} aria-hidden="true">
    <path d="M6.4 9.6l5.6 5.2 5.6-5.2" />
  </svg>
);

// The site's orange pill, from the pricing page's hero card. One base so every
// Start free trial on this page is the same button; the sticky bar only trims
// the padding and the type a little.
const PILL_BASE =
  "inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-[linear-gradient(135deg,#F49230,#DE6F14)] py-2.5 font-semibold text-white shadow-[0_10px_22px_-10px_rgba(234,123,27,0.9)] transition-opacity hover:opacity-90";
const PILL = `${PILL_BASE} px-5 text-[14.5px]`;
const PILL_OUTLINE =
  "inline-flex min-h-[44px] items-center justify-center whitespace-nowrap rounded-full border border-brand-orange/40 bg-white px-5 py-2.5 text-[14.5px] font-semibold text-brand-orange-dark transition-colors hover:border-brand-orange/60 hover:bg-[#FFFAF4]";
const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange";

const billingNote = (billing: Billing) => (billing === "annual" ? "billed annually" : "billed monthly");

function SectionHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <Reveal className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
      <h2 className="text-balance text-[26px] font-extrabold leading-[1.1] tracking-tight text-brand-ink sm:text-[38px]">
        {title}
      </h2>
      {sub && (
        <p className="mx-auto mt-3 max-w-[56ch] text-balance text-[14.5px] leading-relaxed text-brand-charcoal sm:text-[15.5px]">
          {sub}
        </p>
      )}
    </Reveal>
  );
}

// ---------------------------------------------------------------- controls

function BillingToggle({ billing, onChange }: { billing: Billing; onChange: (b: Billing) => void }) {
  const seg = (b: Billing, label: string, extra?: string) => {
    const on = billing === b;
    return (
      <button
        type="button"
        aria-pressed={on}
        onClick={() => onChange(b)}
        className={`min-h-[44px] whitespace-nowrap rounded-full px-4 py-2 text-[13.5px] font-semibold transition-colors ${FOCUS} ${
          on ? "bg-white text-brand-ink shadow-[0_1px_3px_rgba(0,0,0,0.14)]" : "text-brand-charcoal hover:text-brand-ink"
        }`}
      >
        {label}
        {extra && <span className="ml-1.5 text-[12px] font-semibold text-brand-orange-dark">{extra}</span>}
      </button>
    );
  };
  return (
    <div role="group" aria-label="Billing" className="inline-flex gap-0.5 rounded-full bg-[#F2EFE9] p-1">
      {seg("annual", "Annual", ANNUAL_SAVINGS_LABEL)}
      {seg("monthly", "Monthly")}
    </div>
  );
}

function TeamSize({ users, onChange }: { users: number; onChange: (n: number) => void }) {
  // The box can be typed into. While it is being edited it holds what was typed
  // (including an empty box), and the totals follow the last whole number. On
  // blur it snaps back to the number in use.
  const [draft, setDraft] = useState<string | null>(null);

  const step = (delta: number) => {
    setDraft(null);
    onChange(clampUsers(users + delta));
  };
  const btn = `grid h-11 w-11 flex-none place-items-center rounded-full border border-black/15 bg-white text-[19px] leading-none text-brand-ink transition-colors hover:bg-[#F6F3EE] disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS}`;

  return (
    <div role="group" aria-label="Team size" className="inline-flex items-center gap-2 text-[13.5px] text-brand-charcoal">
      <span>Team size</span>
      <button type="button" aria-label="Fewer users" disabled={users <= MIN_USERS} onClick={() => step(-1)} className={btn}>
        &minus;
      </button>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        aria-label="Number of users"
        value={draft ?? String(users)}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
          if (digits === "") {
            setDraft("");
            return;
          }
          const n = clampUsers(Number(digits));
          setDraft(String(n));
          onChange(n);
        }}
        onBlur={() => setDraft(null)}
        className={`h-11 w-[58px] rounded-lg border border-black/15 bg-white text-center text-[16px] font-bold text-brand-ink tabular-nums ${FOCUS}`}
      />
      <button type="button" aria-label="More users" disabled={users >= MAX_USERS} onClick={() => step(1)} className={btn}>
        +
      </button>
      <span>users</span>
    </div>
  );
}

// ---------------------------------------------------------------- plan cards

function PlanCard({
  plan,
  billing,
  users,
  onSelect,
  promo,
}: {
  plan: PlanId;
  billing: Billing;
  users: number;
  onSelect: (p: PlanId) => void;
  /** The booth code (/rukcon): carried on the trial link, and the offer line on SCALE. */
  promo?: string;
}) {
  const { openDemo } = useDemo();
  const copy = PLANS[plan];
  const featured = plan === FEATURED_PLAN;
  const rate = PRICE_PER_USER_MONTH[plan][billing];
  const total = teamTotalParts(plan, billing, users);
  const offerLine = promo ? boothPlanLine(plan, billing) : null;

  // The card is a subgrid of the grid around it from lg up, so the price, the
  // total, the button and the list sit on the same line in all three cards
  // however many lines a description or a total wraps to. Below lg it is a plain
  // stack. SCALE comes first on a phone.
  return (
    <article
      onPointerDownCapture={() => onSelect(plan)}
      onFocusCapture={() => onSelect(plan)}
      className={`relative grid min-w-0 content-start gap-y-3.5 rounded-2xl border p-6 lg:row-span-6 lg:grid-rows-subgrid ${
        featured
          ? "order-first border-brand-ink bg-brand-ink text-white shadow-[0_30px_60px_-28px_rgba(10,10,10,0.7)] lg:order-none"
          : "border-black/[0.08] bg-white text-brand-ink shadow-[0_24px_54px_-34px_rgba(40,30,15,0.4)]"
      }`}
    >
      {featured && (
        <span className="absolute -top-3 left-6 rounded-full bg-[linear-gradient(135deg,#F49230,#DE6F14)] px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.09em] text-white">
          Most popular
        </span>
      )}

      <div>
        <h3 className="text-[15px] font-extrabold tracking-[0.09em]">{copy.name}</h3>
        <p className={`mt-1 text-[13.5px] leading-snug ${featured ? "text-white/70" : "text-brand-charcoal"}`}>{copy.who}</p>
      </div>

      <div className="flex items-end gap-2">
        <span className="text-[44px] font-extrabold leading-[0.95] tracking-[-0.03em] tabular-nums">{money(rate)}</span>
        <span className={`pb-[3px] text-[12.5px] leading-[1.3] ${featured ? "text-white/60" : "text-[#737373]"}`}>
          per user / month
          <br />
          {billingNote(billing)}
        </span>
      </div>

      <p
        className={`-mt-1.5 text-[12px] ${
          plan === "multiply"
            ? `font-semibold ${featured ? "text-[#F7A165]" : "text-brand-orange-dark"}`
            : `font-medium ${featured ? "text-white/60" : "text-[#737373]"}`
        }`}
      >
        {plan === "multiply" ? `Minimum ${MULTIPLY_MIN_USERS} users` : `From ${MIN_USERS} user`}
      </p>

      {/* Two parts, each on one line, so a narrow card breaks at the comma and
          never inside "10 users". */}
      <p
        className={`rounded-lg px-2.5 py-2 text-[13px] leading-snug ${
          featured ? "bg-white/10 text-white/90" : "bg-[#F6F3EE] text-brand-charcoal"
        }`}
      >
        <span className="whitespace-nowrap">
          {total.head}
          {total.billed ? "," : ""}
        </span>
        {total.billed && (
          <>
            {" "}
            <span className="whitespace-nowrap">{total.billed}</span>
          </>
        )}
      </p>

      <div className="grid gap-2.5">
        <a href={appTrialUrl({ plan, billing, promo })} className={`${PILL} w-full ${FOCUS}`}>
          Start free trial
        </a>
        {plan === "multiply" ? (
          <p className="text-center text-[12px] text-[#737373]">
            Or{" "}
            <button
              type="button"
              onClick={openDemo}
              className={`font-semibold text-brand-orange-dark underline decoration-brand-orange/40 underline-offset-2 hover:decoration-brand-orange ${FOCUS}`}
            >
              book a demo
            </button>{" "}
            with our team
          </p>
        ) : (
          <p className={`text-center text-[12px] ${featured ? "text-white/60" : "text-[#737373]"}`}>
            Free for {TRIAL_DAYS} days. Cancel any time.
          </p>
        )}
      </div>

      <ul
        className={`grid content-start gap-2 border-t pt-4 text-[13.5px] leading-snug ${
          featured ? "border-white/15" : "border-black/[0.08]"
        }`}
      >
        {offerLine && (
          <li className="grid grid-cols-[16px_minmax(0,1fr)] items-start gap-2 font-semibold text-[#F7A165]">
            <Tick className="mt-[3px] h-[14px] w-[14px] text-brand-orange" />
            {offerLine}
          </li>
        )}
        {copy.lead && <li className="font-bold">{copy.lead}</li>}
        {planItems(plan, billing).map((item) => (
          <li key={item} className="grid grid-cols-[16px_minmax(0,1fr)] items-start gap-2">
            <Tick className="mt-[3px] h-[14px] w-[14px] text-brand-orange" />
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}

// ---------------------------------------------------------------- add-ons and setup

function AddOns() {
  return (
    <section className="bg-[#F6F3EE] px-5 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-container">
        <SectionHead
          title="Add an HQ to any plan"
          sub="Industry modules, priced per business, not per user. MULTIPLY includes any two."
        />
        <Reveal delay={0.08}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {HQ_ADDONS.map((a) => (
              <div
                key={a.name}
                className={`flex min-w-0 flex-col gap-1.5 rounded-2xl border border-black/[0.08] p-4 ${
                  a.comingSoon ? "bg-white/50" : "bg-white"
                }`}
              >
                <h3 className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[14.5px] font-bold text-brand-ink">
                  {a.name}
                  {a.comingSoon && (
                    <span className="rounded-full border border-black/15 px-2 py-px text-[10px] font-bold uppercase tracking-[0.06em] text-brand-charcoal">
                      {a.comingSoon}
                    </span>
                  )}
                </h3>
                <p className="text-[13px] leading-snug text-brand-charcoal">{a.blurb}</p>
                <p className="mt-auto pt-1.5 text-[13.5px] font-bold text-brand-ink">{money(HQ_PRICE_PER_MONTH)} / month</p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-4 max-w-3xl text-center text-[13.5px] leading-relaxed text-brand-charcoal">
            On GROW, add <b className="font-semibold text-brand-ink">SOP HQ</b> or{" "}
            <b className="font-semibold text-brand-ink">Finance HQ and Banking Analytics</b> for{" "}
            {money(GROW_ADDON_PRICE_PER_MONTH)} a month each.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function SetupPackages() {
  return (
    <section className="bg-white px-5 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-container">
        <SectionHead
          title="Want us to set it up with you?"
          sub="Our team builds your scoreboards, plan and meeting rhythm alongside you. Optional, and available any time."
        />
        <Reveal delay={0.08}>
          <div className="mx-auto grid max-w-[480px] gap-3 lg:max-w-none lg:grid-cols-3">
            {visibleSetupPackages(PRICING_V2_ANNUAL).map((s) => (
              <div
                key={s.name}
                className="flex min-w-0 flex-col gap-2 rounded-2xl border border-black/[0.08] bg-white p-5 shadow-[0_24px_54px_-38px_rgba(40,30,15,0.4)]"
              >
                <h3 className="text-[13px] font-extrabold tracking-[0.09em] text-brand-ink">{s.name}</h3>
                <p className="flex items-baseline gap-2">
                  <span className="text-[30px] font-extrabold leading-none tracking-[-0.02em] text-brand-ink tabular-nums">
                    {money(s.price)}
                  </span>
                  <span className="text-[12.5px] text-[#737373]">one time</span>
                </p>
                <p className="text-[12.5px] font-semibold text-brand-orange-dark">{s.fit}</p>
                <ul className="mt-1 grid gap-1.5 text-[13px] leading-snug text-brand-charcoal">
                  {s.items.map((item) => (
                    <li key={item} className="grid grid-cols-[16px_minmax(0,1fr)] items-start gap-2">
                      <Tick className="mt-[3px] h-[13px] w-[13px] text-brand-orange" />
                      {item}
                    </li>
                  ))}
                </ul>
                {s.included && (
                  <span className="mt-auto inline-flex w-fit items-center rounded-md bg-[#F6F3EE] px-2 py-1 text-[12px] font-bold text-brand-ink">
                    {s.included}
                  </span>
                )}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- compare

function CompareCell({ value }: { value: FeatureValue }) {
  if (value === true) {
    return (
      <>
        <Tick className="h-4 w-4 text-brand-orange" />
        <span className="sr-only">Included</span>
      </>
    );
  }
  if (value === false) {
    return (
      <>
        <span aria-hidden="true" className="text-[#BFC4CC]">
          &ndash;
        </span>
        <span className="sr-only">Not included</span>
      </>
    );
  }
  return <>{value}</>;
}

function Compare() {
  const [differencesOnly, setDifferencesOnly] = useState(false);
  const groups = visibleFeatureGroups({ differencesOnly, annual: PRICING_V2_ANNUAL });

  return (
    <section className="bg-[#F6F3EE] px-5 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-container">
        <SectionHead title="Compare every feature" />
        <Reveal delay={0.06}>
          <div className="mb-4 flex justify-center">
            <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2.5 text-[13.5px] text-brand-charcoal">
              <input
                type="checkbox"
                checked={differencesOnly}
                onChange={(e) => setDifferencesOnly(e.target.checked)}
                className={`h-[18px] w-[18px] accent-[#E56510] ${FOCUS}`}
              />
              Show differences only
            </label>
          </div>

          {/* A phone gets the whole width and fixed columns, so all three plans
              sit side by side with no sideways scroll; the long values wrap.
              From sm up it is a normal auto width table inside a rounded card.
              `relative` is load bearing: the sr-only spans in the cells are
              absolutely positioned, and without a containing block here they
              escape this clip and widen the whole page on a phone. */}
          <div className="relative -mx-5 overflow-x-auto border-y border-black/[0.07] bg-white shadow-[0_24px_54px_-34px_rgba(40,30,15,0.4)] sm:mx-0 sm:rounded-2xl sm:border">
            <table className="w-full table-fixed border-collapse text-left text-[12px] sm:table-auto sm:text-[13.5px]">
              <caption className="sr-only">Every feature, plan by plan</caption>
              <thead>
                <tr>
                  <th scope="col" className="w-[36%] bg-white px-3 py-3 text-[12px] font-bold text-brand-ink sm:w-[40%] sm:px-4 sm:text-[13px]">
                    Feature
                  </th>
                  {PLAN_ORDER.map((p) => (
                    <th
                      key={p}
                      scope="col"
                      className={`w-[21.33%] px-1.5 py-3 text-[11px] font-bold tracking-[0.02em] sm:w-auto sm:px-4 sm:text-[13px] sm:tracking-normal ${
                        p === FEATURED_PLAN ? "bg-brand-ink text-white" : "bg-white text-brand-ink"
                      }`}
                    >
                      {PLANS[p].name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groups.map((g) => (
                  <Fragment key={g.name}>
                    <tr>
                      <th
                        colSpan={4}
                        scope="colgroup"
                        className="bg-[#F6F3EE] px-3 py-2 text-[10.5px] font-bold uppercase tracking-[0.13em] text-[#737373] sm:px-4"
                      >
                        {g.name}
                      </th>
                    </tr>
                    {g.rows.map((r) => (
                      <tr key={r.name} className="border-t border-black/[0.07]">
                        <th scope="row" className="text-balance bg-white px-3 py-2.5 align-top font-medium text-brand-ink sm:px-4">
                          {r.name}
                          {r.tag && (
                            <span className="mt-1 block w-fit whitespace-nowrap rounded-full border border-black/15 px-1.5 py-px text-[10px] font-bold uppercase tracking-[0.06em] text-brand-charcoal sm:ml-2 sm:mt-0 sm:inline sm:align-[1px]">
                              {r.tag}
                            </span>
                          )}
                          {r.note && <small className="mt-0.5 block text-[12px] font-normal text-[#737373]">{r.note}</small>}
                        </th>
                        {r.values.map((v, i) => (
                          <td
                            key={PLAN_ORDER[i]}
                            className={`break-words px-1.5 py-2.5 align-top text-brand-charcoal sm:px-4 ${
                              PLAN_ORDER[i] === FEATURED_PLAN ? "bg-[#FFF8F2]" : ""
                            }`}
                          >
                            <CompareCell value={v} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- FAQ

function Faq() {
  return (
    <section className="bg-white px-5 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-container">
        <SectionHead title="Questions" />
        <Reveal delay={0.06}>
          <div className="mx-auto max-w-3xl divide-y divide-[#EBE7E0] border-y border-[#EBE7E0]">
            {faqItems(PRICING_V2_ANNUAL).map((f, i) => (
              <details key={f.q} open={i === 0} className="group">
                <summary
                  className={`flex min-h-[56px] cursor-pointer list-none items-center gap-4 py-4 text-left text-[15.5px] font-semibold text-brand-ink [&::-webkit-details-marker]:hidden ${FOCUS}`}
                >
                  <span className="flex-1">{f.q}</span>
                  <Chevron className="h-4 w-4 flex-none text-[#737373] transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <p className="max-w-2xl pb-4 text-[14px] leading-relaxed text-brand-charcoal">{f.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- the page

// The RUKCON offer above the plans on /rukcon. Phone first: the booth QR is
// scanned on a phone.
function BoothOffer() {
  const offer = boothOffer(PRICING_V2_ANNUAL);
  return (
    <Reveal delay={0.04} className="mx-auto mt-7 max-w-3xl sm:mt-9">
      <div className="relative overflow-hidden rounded-2xl bg-brand-ink px-5 py-6 text-white shadow-[0_30px_60px_-28px_rgba(10,10,10,0.7)] sm:px-8 sm:py-7">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(234,123,27,0.45),transparent_65%)] blur-2xl" />
        <div className="relative">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.19em] text-[#F7A165]">{offer.eyebrow}</p>
          <h2 className="mt-2 text-balance text-[22px] font-extrabold leading-[1.15] tracking-tight sm:text-[28px]">
            {offer.title}
          </h2>
          <p className="mt-3 max-w-[60ch] text-[14px] leading-relaxed text-white/80 sm:text-[15px]">{offer.body}</p>
          <ol className="mt-4 flex flex-col gap-2 text-[13.5px] text-white/90 sm:flex-row sm:gap-6">
            {offer.steps.map((step, i) => (
              <li key={step} className="flex items-center gap-2">
                <span className="grid h-6 w-6 flex-none place-items-center rounded-full bg-[linear-gradient(135deg,#F49230,#DE6F14)] text-[12px] font-bold">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Reveal>
  );
}

export default function PricingTiersPage({ promo }: { promo?: string } = {}) {
  const { openDemo } = useDemo();
  // Annual when annual billing is on, otherwise monthly and it never changes.
  const [billing, setBilling] = useState<Billing>(leadBilling());
  const [users, setUsers] = useState(DEFAULT_USERS);
  // The plan the phone's sticky bar is about. SCALE until a visitor touches
  // another card.
  const [selected, setSelected] = useState<PlanId>(FEATURED_PLAN);

  return (
    <main className="min-h-screen bg-white pb-20 md:pb-0">
      <Navbar />

      {/* ------------------------------------------------ plans */}
      <section className="relative overflow-hidden bg-white px-5 pb-12 pt-10 sm:px-8 sm:pb-16 sm:pt-[72px]">
        {/* The platform page's ground, as on the old pricing page and the hero:
            white under .bg-dotted at 60%. A texture, not a layer with content. */}
        <div aria-hidden="true" className="bg-dotted pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative mx-auto max-w-container">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="mb-2.5 text-[10.5px] font-bold uppercase tracking-[0.19em] text-brand-orange-dark sm:mb-4">
              Pricing
            </p>
            <h1 className="text-balance text-[28px] font-extrabold leading-[1.1] tracking-tight text-brand-ink sm:text-[44px]">
              One operating system. Three ways to{" "}
              <span className="relative whitespace-nowrap">
                run it.
                <svg
                  className="absolute -bottom-2 left-0 h-3 w-full text-brand-orange"
                  viewBox="0 0 120 12"
                  preserveAspectRatio="none"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M3 8c26-5 74-6 114-3" />
                </svg>
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-[54ch] text-[14.5px] leading-relaxed text-brand-charcoal sm:mt-7 sm:text-[16px]">
              Start a {TRIAL_DAYS}-day free trial on any plan. Your whole company uses the same plan, and you can change
              it any time.
            </p>
          </Reveal>

          {promo && <BoothOffer />}

          <Reveal delay={0.08} className="mt-8 flex flex-col items-center justify-center gap-4 sm:mt-10 sm:flex-row sm:gap-7">
            {PRICING_V2_ANNUAL && <BillingToggle billing={billing} onChange={setBilling} />}
            <TeamSize users={users} onChange={setUsers} />
          </Reveal>

          <Reveal delay={0.14} className="mt-8 sm:mt-10">
            <h2 className="sr-only">Plans</h2>
            <div className="mx-auto grid max-w-[480px] gap-5 lg:max-w-none lg:grid-cols-3 lg:gap-x-4 lg:gap-y-3.5">
              {PLAN_ORDER.map((p) => (
                <PlanCard key={p} plan={p} billing={billing} users={users} onSelect={setSelected} promo={promo} />
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.18}>
            <p className="mx-auto mt-6 max-w-3xl rounded-xl bg-[#F6F3EE] px-4 py-3 text-center text-[13.5px] leading-relaxed text-brand-charcoal">
              AI is billed by use, every two weeks, on the same card.{" "}
              <b className="font-semibold text-brand-ink">You set a monthly cap</b> ({money(AI_MONTHLY_CAP_DEFAULT)} by
              default) and AI pauses when you reach it.
            </p>
          </Reveal>
        </div>
      </section>

      <AddOns />
      <SetupPackages />
      <Compare />
      <Faq />

      {/* ------------------------------------------------ closing band
          The same band the other pages end on (CTA.tsx), with this page's words. */}
      <section className="px-5 pb-14 sm:px-8 sm:pb-24">
        <div className="mx-auto max-w-container">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-[#E0DCD3] bg-[#EDEAE4] px-6 py-9 text-center shadow-[0_26px_70px_-34px_rgba(234,123,27,0.5)] sm:px-14 sm:py-12">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#C9C3B7_1px,transparent_1px)] opacity-50 [background-size:22px_22px]" />
              <div className="cta-glow pointer-events-none absolute -right-16 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(234,123,27,0.55),transparent_62%)] blur-2xl" />
              <div
                className="cta-glow pointer-events-none absolute -left-12 -top-12 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(234,123,27,0.3),transparent_65%)] blur-2xl"
                style={{ animationDelay: "1.8s" }}
              />
              <div className="relative">
                <h2 className="text-balance text-2xl font-extrabold tracking-tight text-brand-ink sm:text-4xl">
                  Try Multiply OS free for {TRIAL_DAYS} days
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-sm text-brand-charcoal sm:text-lg">
                  Pick a plan now. We email you three days before your trial ends.
                </p>
                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <a
                    href={appTrialUrl({ plan: FEATURED_PLAN, billing, promo })}
                    className={`${PILL} w-full max-w-[420px] sm:w-auto sm:min-w-[190px] ${FOCUS}`}
                  >
                    Start free trial
                  </a>
                  <button
                    type="button"
                    onClick={openDemo}
                    className={`${PILL_OUTLINE} w-full max-w-[420px] sm:w-auto sm:min-w-[150px] ${FOCUS}`}
                  >
                    Book a demo
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />

      {/* ------------------------------------------------ phone only
          The selected plan and the way in stay pinned to the bottom of the screen
          while the cards, the table and the FAQ scroll past. */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-black/10 bg-white/95 px-4 pb-[calc(10px+env(safe-area-inset-bottom,0px))] pt-2.5 backdrop-blur md:hidden">
        <div className="min-w-0 leading-tight">
          <b className="block text-[14px] font-extrabold tracking-[0.04em] text-brand-ink">{PLANS[selected].name}</b>
          <span className="block text-[12px] leading-snug text-brand-charcoal">
            {money(PRICE_PER_USER_MONTH[selected][billing])} per user / month, {billingNote(billing)}
          </span>
        </div>
        <a href={appTrialUrl({ plan: selected, billing, promo })} className={`${PILL_BASE} flex-none px-4 text-[14px] ${FOCUS}`}>
          Start free trial
        </a>
      </div>
    </main>
  );
}
