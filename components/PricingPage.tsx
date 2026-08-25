"use client";

// The pricing page.
//
// Replaces the nav's old off-site link to app.multiplyos.com/pricing, so this is
// now the page that has to do the selling rather than hand the visitor to the
// app. Two sources fed it:
//
//   1. Screenshots of the live in-app pricing page: the Multiply Scale Bundle at
//      $299 with ten seats, the AI usage billing explainer, the savings
//      calculator, the six included modules, and the FAQ. All reproduced.
//   2. The client's reference, HighLevel's "what's included" table, which lists
//      each capability against the tools it replaces and totals the stack.
//
// The stack table is the addition. Everything else already existed in the app.
//
// >>> BEFORE THIS SHIPS: every figure in STACK is a competitor's list price and
// >>> needs verifying. They are gathered in one constant for exactly that reason.
import { useMemo, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Reveal from "./Reveal";
import { ReplacedLogo } from "./ReplacesStrip";
import { useDemo } from "./DemoModal";

// Orange carries every accent on this page. The navy this replaced came from the
// in-app pricing screen and was the only cool colour anywhere on the site.
const ORANGE = "#EA7B1B";
const ORANGE_DARK = "#C9650F";
const ORANGE_GRAD = "linear-gradient(135deg, #F49230, #DE6F14)";
// the orange has to lift off a near-black slab, so it is a lighter tint of the same hue
const ORANGE_ON_DARK = "#FFB265";
const GREEN = "#1F7F4C";
const RED = "#C0402B";

const ico = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
type IconProps = { className?: string; style?: React.CSSProperties };

const Tick = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2.6}>
    <path d="M5 12l5 5L20 7" />
  </svg>
);
const Spark = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2}>
    <path d="M12 3l1.6 4L18 8.5 14 10l-2 4-2-4-4-1.5L10 7z" />
  </svg>
);
const People = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="9.2" cy="8.4" r="3" />
    <path d="M3.6 18.6c0-2.8 2.5-4.6 5.6-4.6s5.6 1.8 5.6 4.6" />
    <path d="M16.2 6.2a3 3 0 0 1 0 5.6M17.4 14.6c1.9.6 3.2 1.9 3.2 4" />
  </svg>
);
const Chevron = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2.2}>
    <path d="M6.4 9.6l5.6 5.2 5.6-5.2" />
  </svg>
);
const Flip = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M4 9.5A7.5 7.5 0 0 1 18 7l2.5 2.5M20 14.5A7.5 7.5 0 0 1 6 17l-2.5-2.5" />
    <path d="M20.5 5v4.5H16M3.5 19v-4.5H8" />
  </svg>
);
const Arrow = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2.4}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

// ---------------------------------------------------------------- the plan
const PRICE = 299;
const SEATS = 10;
const EXTRA = 29;

const INCLUDED = [
  "10 users included, then $29 per extra user",
  "Unlimited scoreboards and metrics",
  "Meetings, agendas, and one page plans",
  "Org chart, issues tracker, and tasks",
  "AI Coach, AI insights, and a fractional CMO",
  "SOP platform included",
  "CFO dashboard and banking analytics included",
  "Projects, boards and timelines, included",
  "CRM, pipelines, and follow-up included",
  "Forms and e-signatures, 25 forms and 100 signatures a month",
  "AI usage billed every 2 weeks, capped at $200 a month by default",
];

// ---------------------------------------------------------------- the stack
// The client's HighLevel reference, done our way.
//
// >>> EVERY `was` FIGURE BELOW IS A COMPETITOR'S PUBLISHED LIST PRICE AND HAS
// >>> NOT BEEN VERIFIED. They are indicative monthly costs for a team of ten at
// >>> a comparable tier, which is the only fair comparison against a plan that
// >>> includes ten seats. Vendors change pricing constantly and quoting one
// >>> wrongly is the kind of mistake that costs somebody, so check each one and
// >>> update AS_OF before this page goes live.
//
// One vendor is never counted twice: each row is a distinct category with its
// own tool, so the total is a clean sum rather than HighLevel's approach of
// repeating the same vendor across several rows and adding it in each time.
const AS_OF = "August 2026";

type StackRow = {
  what: string;
  note: string;
  was: number;
  logos: { name: string; logo?: string }[];
};

const STACK: StackRow[] = [
  {
    what: "Weekly scoreboards and metrics",
    note: "Thirteen weeks of history, an owner on every number",
    was: 160,
    logos: [{ name: "ninety.io", logo: "/replaces-ninety.png" }],
  },
  {
    what: "Quarterly planning and accountability",
    note: "One page plan, goals that cascade, weekly priorities",
    was: 149,
    logos: [{ name: "EOS One", logo: "/replaces-eosone.png" }],
  },
  {
    what: "SOPs, training, and documentation",
    note: "Screen recordings and AI drafting, 15 GB of storage",
    was: 249,
    logos: [{ name: "Trainual", logo: "/replaces-trainual.png" }],
  },
  {
    what: "Projects and tasks",
    note: "Boards, timelines, dependencies, and subtasks",
    was: 120,
    logos: [
      { name: "Asana", logo: "/replaces-asana.png" },
      { name: "Monday.com", logo: "/replaces-monday.png" },
    ],
  },
  {
    what: "Forms and surveys",
    note: "Twenty eight field types, conditional logic, integrations",
    was: 59,
    logos: [
      { name: "Typeform", logo: "/replaces-typeform.png" },
      { name: "Jotform", logo: "/replaces-jotform.png" },
      { name: "Google Forms", logo: "/replaces-google-forms.png" },
    ],
  },
  {
    what: "E-signatures and agreements",
    note: "Draw or type, separate consent, executed copies tracked",
    was: 65,
    logos: [
      { name: "DocuSign", logo: "/replaces-docusign.png" },
      { name: "PandaDoc", logo: "/replaces-pandadoc.png" },
      { name: "Adobe Sign", logo: "/replaces-adobe-sign.png" },
    ],
  },
  {
    what: "An AI assistant for the whole team",
    note: "Claude and GPT, grounded in your own company data",
    was: 250,
    logos: [
      { name: "Claude", logo: "/replaces-claude.png" },
      { name: "ChatGPT", logo: "/replaces-chatgpt.png" },
    ],
  },
  {
    what: "CFO dashboard and bank analytics",
    note: "Live P&L, balance sheet, cash flow, monthly AI briefing",
    was: 99,
    logos: [{ name: "Reach Reporting", logo: "/replaces-reachreporting.png" }],
  },
  {
    what: "Org chart",
    note: "Every seat, who is in it, and who they report to",
    was: 49,
    logos: [{ name: "Pingboard", logo: "/replaces-pingboard.png" }],
  },
  {
    what: "CRM and pipeline",
    note: "Contacts, deals, and the follow-up that closes them",
    was: 97,
    logos: [{ name: "GoHighLevel", logo: "/replaces-highlevel.png" }],
  },
];

const STACK_TOTAL = STACK.reduce((s, r) => s + r.was, 0);

const FAQ = [
  { q: "Can I cancel anytime?", a: "Yes. Cancel from Settings, then Billing, whenever you like. There is no notice period and no cancellation fee, and you keep full access until the end of the period you have already paid for." },
  { q: "How does AI usage billing work?", a: "Your $299 is billed monthly like any subscription. AI usage is separate: it is metered and invoiced every two weeks on a Friday against the same card, so a quiet month costs less than a busy one. You set a monthly maximum, $200 by default, and AI features pause once your team reaches it until the month rolls over. Raise it, lower it, or turn the cap off entirely from Settings, then Billing." },
  { q: "What is included in the Multiply Scale Bundle?", a: "Every module. Scoreboards, the one page plan, meetings and 1-on-1s, the org chart, DISC assessments, SOP HQ, projects and tasks, forms, checklists, agreements, the CRM, the CFO dashboard with banking analytics, and Multi AI across all of it. There are no add-ons to assemble and nothing held back for a higher tier." },
  { q: "Can I add or remove users mid-month?", a: "Yes. Ten seats are included and extra seats are $29 each per month. Add them when somebody joins and remove them when somebody leaves, rather than waiting for a renewal date." },
  { q: "Do I need to be on QuickBooks for the CFO dashboard?", a: "No. QuickBooks connects in about two minutes and is read-only, which is the fastest route. If you are on something else, upload a profit and loss and a balance sheet as a CSV each month and every dashboard, chart, and AI briefing works exactly the same way." },
];

const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

// ---------------------------------------------------------------- plan card
// NOT RENDERED. The "Plans that MULTIPLY results for your team" section that
// used to hold this was removed once the hero carried the price, the seats, the
// inclusions, and the call to action on its own.
//
// It is kept because of one thing the hero does not do: the extra-users stepper,
// which is the only place a buyer can work out what their own team costs. If
// that lands in the hero, or the answer is that nobody needs it, delete this.
function PlanCard() {
  const { openDemo } = useDemo();
  const [extra, setExtra] = useState(0);
  const total = PRICE + extra * EXTRA;

  return (
    <div className="relative mx-auto w-full max-w-[460px]">
      <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-bold text-white" style={{ background: ORANGE_DARK }}>
        Most popular
      </span>

      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-[0_30px_60px_-30px_rgba(40,30,15,0.45)] sm:p-7">
        <div className="flex items-center gap-2.5">
          <span className="grid h-[30px] w-[30px] flex-none place-items-center rounded-lg bg-[#FDF0E4]" style={{ color: ORANGE_DARK }}>
            <Spark className="h-4 w-4" />
          </span>
          <b className="text-[19px] font-extrabold tracking-tight">Multiply Scale Bundle</b>
        </div>
        <p className="mt-2 text-[13.5px] leading-relaxed text-brand-charcoal">
          The complete weekly operating system. Every module and every AI feature included.
        </p>

        <p className="mt-3 inline-flex items-start gap-1.5 rounded-lg bg-[#F4F1EC] px-2.5 py-1.5 text-[11.5px] font-semibold leading-snug text-brand-charcoal">
          <Spark className="mt-px h-3 w-3 flex-none text-brand-orange" />
          Claude AI included, so you can skip the $20 to $200 a month subscription
        </p>

        <p className="mt-4 flex items-baseline gap-1.5">
          <span className="text-[46px] font-extrabold leading-none tracking-tight tabular-nums">{money(total)}</span>
          <span className="text-[15px] font-medium text-brand-gray">/mo</span>
        </p>
        <p className="mt-1.5 text-[13px] text-brand-charcoal">
          Includes <b className="font-semibold">{SEATS} users</b> (owner plus 9 team members)
        </p>
        <p className="text-[12px] text-brand-gray">Plus ${EXTRA} a month per additional user</p>

        <div className="mt-4 rounded-xl border border-[#E6E2DB] bg-[#FAF9F7] px-3.5 py-3">
          <div className="flex items-center gap-3">
            <span className="flex-1 text-[13px] font-semibold">Extra users</span>
            <button
              type="button"
              onClick={() => setExtra((n) => Math.max(0, n - 1))}
              aria-label="Remove a user"
              disabled={extra === 0}
              className="grid h-[30px] w-[30px] place-items-center rounded-lg border border-[#E6E2DB] bg-white text-[17px] font-semibold text-brand-charcoal transition-colors hover:bg-[#F4F1EC] disabled:opacity-40"
            >
              &minus;
            </button>
            <span className="w-[30px] text-center text-[17px] font-bold tabular-nums">{extra}</span>
            <button
              type="button"
              onClick={() => setExtra((n) => Math.min(90, n + 1))}
              aria-label="Add a user"
              className="grid h-[30px] w-[30px] place-items-center rounded-lg border border-[#E6E2DB] bg-white text-[17px] font-semibold text-brand-charcoal transition-colors hover:bg-[#F4F1EC]"
            >
              +
            </button>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2 border-t border-[#EBE7E0] pt-2.5">
            <span className="flex-1 text-[12.5px] text-brand-charcoal">{SEATS + extra} users total</span>
            <span className="text-[17px] font-extrabold tabular-nums">{money(total)}</span>
            <span className="text-[12px] text-brand-gray">/mo</span>
          </div>
        </div>

        <ul className="mt-5 flex flex-col gap-2.5">
          {INCLUDED.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-[13.5px] leading-snug text-brand-ink">
              <Tick className="mt-[3px] h-[15px] w-[15px] flex-none" style={{ color: GREEN }} />
              {f}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={openDemo}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3.5 text-[15px] font-bold text-white shadow-[0_14px_30px_-12px_rgba(234,123,27,0.9)] transition-opacity hover:opacity-90"
          style={{ background: ORANGE_GRAD }}
        >
          Request a Demo
          <Arrow className="h-[16px] w-[16px]" />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- stack table
// Below sm each row becomes a small card: a four-column table at 360px is
// unreadable, and the price is the one thing that must not end up in a corner.
// ---------------------------------------------------------------- stack table
// The "sharper" treatment: same four columns, same rows, tightened.
//
// The change that matters is the price. It was 13.5px, which made the whole
// argument of the section read as a footnote, and it is now 17px. Rows also
// pick up an orange rail and a warm tint on hover, and the total bar carries
// the $299 on its own raised chip.
//
// Below sm each row becomes a small card: a four-column table at 360px is
// unreadable, and the price is the one thing that must not end up in a corner.
function StackTable() {
  return (
    <div className="overflow-hidden rounded-[20px] border border-black/[0.07] bg-white shadow-[0_24px_54px_-30px_rgba(40,30,15,0.45)]">
      <div className="hidden grid-cols-[minmax(0,1.45fr)_minmax(0,1.35fr)_120px_116px] items-center gap-4 border-b border-[#EBE7E0] bg-[#F6F3EE] px-6 py-3.5 sm:grid">
        {["What you get", "Instead of", "Their price", "Multiply OS"].map((h, i) => (
          <span
            key={h}
            className={`text-[10.5px] font-extrabold uppercase tracking-[0.11em] text-[#8A857D] ${i >= 2 ? "text-center" : ""}`}
          >
            {h}
          </span>
        ))}
      </div>

      {STACK.map((r) => (
        <div
          key={r.what}
          className="grid grid-cols-1 gap-2 border-b border-l-[3px] border-[#F3F0EB] border-l-transparent px-4 py-3.5 transition-colors duration-150 last:border-b-0 hover:border-l-brand-orange hover:bg-[#FFFCF7] sm:grid-cols-[minmax(0,1.45fr)_minmax(0,1.35fr)_120px_116px] sm:items-center sm:gap-4 sm:px-6 sm:py-[15px]"
        >
          <span className="min-w-0">
            <span className="block text-[14px] font-bold leading-tight">{r.what}</span>
            <span className="block text-[11.5px] leading-snug text-brand-gray">{r.note}</span>
          </span>

          <span className="flex min-w-0 flex-wrap items-center gap-[7px]">
            {r.logos.map((l) => (
              <span
                key={l.name}
                className="inline-flex items-center rounded-full border border-black/[0.08] bg-white px-2.5 py-1.5 text-[11px] font-[650] text-brand-charcoal shadow-[0_1px_2px_rgba(40,30,15,0.05)]"
              >
                <ReplacedLogo src={l.logo ?? ""} name={l.name} className="h-[17px] w-auto" />
              </span>
            ))}
          </span>

          <span className="flex items-baseline gap-2 sm:justify-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-brand-gray sm:hidden">
              Their price
            </span>
            <span className="text-[17px] font-extrabold tabular-nums line-through" style={{ color: RED }}>
              {money(r.was)}
            </span>
            <span className="text-[11.5px] text-brand-gray">/mo</span>
          </span>

          <span className="sm:flex sm:justify-center">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-[5px] text-[12px] font-extrabold"
              style={{ background: "#EAF7F0", color: GREEN }}
            >
              <Tick className="h-3 w-3" />
              Included
            </span>
          </span>
        </div>
      ))}

      <div
        className="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:px-6"
        style={{
          background: "linear-gradient(90deg, #FFF6EC, #FFE9D4)",
          borderTop: "2px solid rgba(234,123,27,0.4)",
        }}
      >
        <span className="text-[12.5px] font-extrabold uppercase tracking-[0.11em]" style={{ color: ORANGE_DARK }}>
          What that stack costs
        </span>
        <span className="flex items-baseline gap-2 sm:ml-auto">
          <span className="text-[27px] font-extrabold tabular-nums line-through" style={{ color: RED }}>
            {money(STACK_TOTAL)}
          </span>
          <span className="text-[12.5px] text-brand-gray">/mo</span>
        </span>
        <span
          className="flex items-baseline gap-2 self-start rounded-[13px] px-5 py-2.5 text-white shadow-[0_14px_28px_-12px_rgba(201,101,15,0.8)] sm:self-auto"
          style={{ background: ORANGE_GRAD }}
        >
          <span className="text-[27px] font-black tracking-tight tabular-nums">{money(PRICE)}</span>
          <span className="text-[12.5px] opacity-90">/mo with Multiply OS</span>
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- calculator
function Slider({ value, min, max, step, onChange, label }: {
  value: number; min: number; max: number; step: number;
  onChange: (n: number) => void; label: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <input
      type="range"
      aria-label={label}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="price-range w-full"
      style={{ background: `linear-gradient(to right, ${ORANGE} ${pct}%, #E1DDD6 ${pct}%)` }}
    />
  );
}

/* The three billing facts. Deliberately not a card: it sits on the page ground so
   the calculator beside it is the only object in the section with a border. */
function BillingFacts() {
  const facts = [
    {
      t: "The plan is billed monthly",
      d: "Your Multiply Scale Bundle price behaves like any other subscription.",
    },
    {
      t: "Usage is invoiced every two weeks",
      d: "Insights, the coach, and recordings are metered and charged on a Friday, as a separate automatic charge against the same card.",
    },
    {
      t: "You set the ceiling",
      d: "$200 a month by default. AI features pause when your team reaches it, until the month rolls over. Raise it, lower it, or turn it off from Settings, then Billing.",
    },
  ];

  return (
    <div className="pt-1">
      <h3 className="flex items-center gap-2 text-[20px] font-extrabold tracking-tight sm:text-[22px]">
        <Spark className="h-[18px] w-[18px] flex-none text-brand-orange" />
        How AI usage billing works
      </h3>
      <p className="mt-2.5 text-[14px] leading-relaxed text-brand-charcoal">
        Claude is built into every seat, so you skip the $20 to $200 a month subscription and pay
        only for what your team actually uses. Heavy month or light month, the bill follows the
        usage rather than a flat AI fee.
      </p>

      <ul className="mt-6 flex flex-col gap-[18px]">
        {facts.map((f, i) => (
          <li key={f.t} className="grid grid-cols-[30px_minmax(0,1fr)] items-start gap-x-[13px]">
            <span
              className="row-span-2 grid h-[30px] w-[30px] place-items-center rounded-[9px] text-[12.5px] font-extrabold"
              style={{ background: "#FDEEDC", color: ORANGE_DARK }}
            >
              {i + 1}
            </span>
            <b className="text-[14px] font-bold text-brand-ink">{f.t}</b>
            <span className="col-start-2 mt-[3px] text-[13px] leading-relaxed text-brand-charcoal">
              {f.d}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Calculator() {
  const [rev, setRev] = useState(100000);
  const [lift, setLift] = useState(3);
  const [team, setTeam] = useState(SEATS);
  const perUser = 20;

  const { save, year, aiCost } = useMemo(() => ({
    save: rev * (lift / 100),
    year: rev * (lift / 100) * 12,
    aiCost: team * perUser,
  }), [rev, lift, team]);

  // a white-ish inset panel, used for every input group
  const panel = "rounded-[14px] border border-white/80 bg-white/70 p-4";

  return (
    <div
      className="rounded-[20px] border p-5 shadow-[0_22px_48px_-30px_rgba(150,90,20,0.5)] sm:p-6"
      style={{ borderColor: "#F0DCC4", background: "linear-gradient(160deg, #FFF8F0, #FDEEDC)" }}
    >
      <div className={panel}>
        <p className="text-[10.5px] font-bold uppercase tracking-[0.09em] text-brand-charcoal">
          Your monthly revenue today
        </p>
        <p className="mt-2 flex items-baseline gap-[7px]">
          <span className="text-[28px] font-extrabold leading-none tabular-nums sm:text-[36px]">
            {money(rev)}
          </span>
          <span className="text-[13px] text-brand-gray">/mo</span>
        </p>
        <div className="mt-3">
          <Slider value={rev} min={0} max={10000000} step={100000} onChange={setRev} label="Monthly revenue" />
          <div className="mt-1 flex justify-between font-mono text-[10.5px] text-brand-gray">
            <span>$0</span>
            <span>Drag to set</span>
            <span>$10M+</span>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className={panel}>
          <p className="flex items-baseline gap-2.5 text-[10.5px] font-bold uppercase tracking-[0.09em] text-brand-charcoal">
            Profit lift from AI
            <b className="ml-auto text-[16px] font-extrabold tabular-nums text-brand-ink">{lift}%</b>
          </p>
          <div className="mt-2.5">
            <Slider value={lift} min={1} max={10} step={1} onChange={setLift} label="Profitability improvement" />
            <div className="mt-1 flex justify-between font-mono text-[10.5px] text-brand-gray">
              <span>1%</span>
              <span>10%</span>
            </div>
          </div>
        </div>

        <div className={panel}>
          <p className="flex items-baseline gap-2.5 text-[10.5px] font-bold uppercase tracking-[0.09em] text-brand-charcoal">
            <People className="h-3 w-3 flex-none" />
            Team size
            <b className="ml-auto text-[16px] font-extrabold tabular-nums text-brand-ink">{team}</b>
          </p>
          <div className="mt-2.5">
            <Slider value={team} min={1} max={50} step={1} onChange={setTeam} label="Team size" />
            <div className="mt-1 flex justify-between font-mono text-[10.5px] text-brand-gray">
              <span>1</span>
              <span>50</span>
            </div>
          </div>
        </div>
      </div>

      {/* the answer, on a dark slab so the orange figure is the loudest thing here */}
      <div className="mt-3 rounded-[14px] px-[18px] pb-4 pt-[18px] text-white" style={{ background: "#171310" }}>
        <p className="text-[10.5px] font-bold uppercase tracking-[0.11em]" style={{ color: ORANGE_ON_DARK }}>
          Estimated monthly gain
        </p>
        <p className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span
            className="text-[32px] font-black leading-none tabular-nums sm:text-[42px]"
            style={{ color: ORANGE_ON_DARK }}
          >
            {money(save)}
          </span>
          <span className="text-[13px] text-white/60">/mo</span>
          <span className="text-[19px] font-bold tabular-nums" style={{ color: ORANGE_ON_DARK }}>
            {money(year)}
          </span>
          <span className="text-[13px] text-white/60">a year</span>
        </p>
        <p className="mt-3 border-t border-white/[0.14] pt-3 text-[13px] text-white/[0.78]">
          Against <b className="font-semibold text-white tabular-nums">{money(aiCost)}</b>/mo of
          metered AI usage, plus your <b className="font-semibold text-white">{money(PRICE)}</b> plan.
        </p>
      </div>

      <p className="mt-2.5 text-[11.5px] leading-snug text-brand-gray">
        An estimate built from the numbers you entered, not a projection or a guarantee.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- FAQ
function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-3xl divide-y divide-[#EBE7E0] border-y border-[#EBE7E0]">
      {FAQ.map((f, i) => {
        const on = open === i;
        return (
          <div key={f.q}>
            <button
              type="button"
              aria-expanded={on}
              onClick={() => setOpen(on ? null : i)}
              className="flex w-full items-center gap-4 py-4 text-left"
            >
              <span className="flex-1 text-[15.5px] font-semibold text-brand-ink">{f.q}</span>
              <Chevron
                className="h-4 w-4 flex-none text-brand-gray transition-transform duration-200"
                style={{ transform: on ? "rotate(180deg)" : undefined }}
              />
            </button>
            {on && (
              <p className="sop-view -mt-1 max-w-2xl pb-4 text-[14px] leading-relaxed text-brand-charcoal">
                {f.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------- page
// ---------------------------------------------------------------- the receipt
// Line items are derived from STACK rather than typed out again, so the hero and
// the comparison table can never drift apart. Change a price in one place.
// ---------------------------------------------------------------- the receipt
// A card with two faces: what the stack costs today on the front, what $299
// includes on the back. Line items on the front come from STACK rather than
// being typed out again, so the hero and the comparison table cannot drift.
//
// Two things here are load-bearing and easy to break:
//
//   1. BOTH faces hide their own backface. Hiding only the front leaves the
//      back painted, mirrored, on top of the front at rest.
//   2. The stamp is a sibling of the receipt, not a child. The receipt clips its
//      own corners, so a stamp inside it can never spill past the edge.
function FlipReceipt() {
  const [flipped, setFlipped] = useState(false);

  return (
    <div>
      <div className="flip-scene">
        <div className={`flip-card ${flipped ? "is-flipped" : ""}`}>
          {/* front: what you are paying now */}
          <div className="flip-face" aria-hidden={flipped}>
            <div className="relative">
              <div className="overflow-hidden rounded-md bg-white shadow-[0_30px_64px_-22px_rgba(40,30,15,0.5)]">
                <div className="px-5 py-[17px] text-center text-white" style={{ background: ORANGE_GRAD }}>
                  <p className="text-[14px] font-extrabold uppercase tracking-[0.17em]">
                    Your current stack
                  </p>
                  <p className="mt-0.5 text-[12.5px] opacity-90">
                    Team of {SEATS} &middot; billed monthly
                  </p>
                </div>

                <div className="px-5 pb-[26px] pt-[18px] font-mono">
                  {STACK.map((r) => (
                    <p key={r.what} className="flex gap-2.5 py-[7px] text-[13.5px] text-brand-charcoal">
                      <span className="min-w-0 flex-1 truncate">{r.what}</span>
                      <span className="tabular-nums">{money(r.was)}</span>
                    </p>
                  ))}
                  <p
                    className="mt-2.5 flex gap-2.5 pt-3 text-[16.5px] font-bold"
                    style={{ borderTop: `2px solid ${ORANGE}` }}
                  >
                    <span className="min-w-0 flex-1">TOTAL</span>
                    <span className="tabular-nums" style={{ color: RED }}>
                      {money(STACK_TOTAL)}/mo
                    </span>
                  </p>
                </div>
              </div>

              {/* outside the receipt, so it can spill past the right edge */}
              <div
                className="stamp-spill absolute -bottom-4 rotate-[-9deg] rounded-[10px] border-[3px] bg-white px-[18px] py-[9px] text-center shadow-[0_16px_30px_-14px_rgba(201,101,15,0.75)]"
                style={{ borderColor: ORANGE_DARK, color: ORANGE_DARK }}
              >
                <p className="text-[11px] font-extrabold uppercase tracking-[0.13em]">Replaced by</p>
                <p className="text-[34px] font-black leading-none tracking-tight">{money(PRICE)}</p>
                <p className="text-[11px] font-bold">A MONTH</p>
              </div>
            </div>
          </div>

          {/* back: what the $299 actually buys */}
          <div
            className="flip-back overflow-hidden rounded-md bg-white shadow-[0_30px_64px_-22px_rgba(40,30,15,0.5)]"
            aria-hidden={!flipped}
          >
            <div
              className="flex flex-none items-baseline gap-2.5 px-5 py-4 text-white"
              style={{ background: ORANGE_GRAD }}
            >
              <span className="text-[12.5px] font-extrabold uppercase tracking-[0.15em]">
                Multiply OS
              </span>
              <span className="ml-auto text-[24px] font-black leading-none tracking-tight">
                {money(PRICE)}
              </span>
              <span className="text-[12px] font-semibold opacity-85">/mo</span>
            </div>

            <div className="grid min-h-0 flex-1 content-start gap-2.5 overflow-auto px-5 py-4">
              {INCLUDED.map((f) => (
                <p key={f} className="flex items-start gap-2.5 text-[13.5px] leading-snug text-brand-ink">
                  <Tick className="mt-[3px] h-[15px] w-[15px] flex-none" style={{ color: GREEN }} />
                  {f}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-pressed={flipped}
        className="mt-4 flex w-full items-center gap-2.5 rounded-xl border-[1.5px] bg-[#FFF7EF] px-4 py-[13px] text-[15px] font-bold transition-colors hover:bg-[#FFEFDD]"
        style={{ borderColor: "rgba(234,123,27,0.34)", color: "#9A4E07" }}
      >
        <Flip className="h-[17px] w-[17px] flex-none" />
        {flipped ? "Back to what you pay now" : `And here is what ${money(PRICE)} gets you`}
        <span
          className="ml-auto grid h-[22px] min-w-[26px] flex-none place-items-center rounded-full px-[7px] text-[12px] font-extrabold text-white"
          style={{ background: ORANGE_GRAD }}
        >
          {INCLUDED.length}
        </span>
      </button>
    </div>
  );
}

// ---------------------------------------------------------------- page
export default function PricingPage() {
  const { openDemo } = useDemo();

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* ------------------------------------------------ hero */}
      <section className="relative overflow-hidden px-5 pb-14 pt-10 sm:px-8 sm:pb-[68px] sm:pt-[68px]">
        <div className="bg-dotted pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative mx-auto grid max-w-container items-center gap-10 lg:grid-cols-[minmax(0,1fr)_448px] lg:gap-14">
          <Reveal>
            {/* the seats pill: a white chip with an orange ring that breathes */}
            <span className="inline-flex items-center gap-2.5 rounded-full border border-black/[0.08] bg-white px-5 py-2.5 text-[15px] font-[650] text-[#33302C] shadow-[0_2px_6px_rgba(40,30,15,0.07),0_0_0_5px_rgba(234,123,27,0.12)]">
              <span className="seat-dot h-[10px] w-[10px] flex-none rounded-full" style={{ background: ORANGE }} />
              <span>
                <b className="font-extrabold" style={{ color: ORANGE_DARK }}>{SEATS} users</b> included
                in every paid plan
              </span>
            </span>

            <h1 className="mt-6 text-[32px] font-extrabold leading-[1.05] tracking-tight text-brand-ink sm:text-[58px]">
              Here is what you are
              <br />
              <span className="text-brand-orange">paying right now.</span>
            </h1>
            <p className="mt-4 max-w-[44ch] text-[16px] leading-relaxed text-brand-charcoal sm:text-[17.5px]">
              Add up the tools your team already logs into every week. Then look at what the same
              capability costs when it is one product that talks to itself.
            </p>

            <div className="mt-7 flex flex-wrap gap-3.5">
              <button
                type="button"
                onClick={openDemo}
                className="inline-flex items-center gap-2.5 rounded-[12px] px-8 py-[17px] text-[17px] font-bold text-white shadow-[0_16px_34px_-12px_rgba(234,123,27,0.9)] transition-opacity hover:opacity-90"
                style={{ background: ORANGE_GRAD }}
              >
                Request a Demo
                <Arrow className="h-[17px] w-[17px]" />
              </button>
              <a
                href="#stack"
                className="inline-flex items-center gap-2 rounded-[12px] border-[1.5px] bg-white px-[26px] py-[17px] text-[17px] font-bold transition-colors hover:bg-[#FFF7EF]"
                style={{ borderColor: "rgba(234,123,27,0.4)", color: ORANGE_DARK }}
              >
                See what it replaces
                <Chevron className="h-[15px] w-[15px]" />
              </a>
            </div>

            <p className="mt-[18px] text-[13.5px] text-brand-gray">
              {money(PRICE)}/mo <span className="text-[#C4BFB6]">&middot;</span> {SEATS} users included{" "}
              <span className="text-[#C4BFB6]">&middot;</span> ${EXTRA} per extra seat{" "}
              <span className="text-[#C4BFB6]">&middot;</span> cancel any time
            </p>
          </Reveal>

          <Reveal delay={0.12}>
            <FlipReceipt />
          </Reveal>
        </div>
      </section>

      <section id="stack" className="scroll-mt-24 border-t border-[#EFECE6] bg-[#FBFAF8] px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-container">
          {/* Headline only. The eyebrow and the subheadline were removed: the
              table underneath says what the section is faster than a paragraph
              above it can. */}
          <Reveal className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
            <h2 className="text-[26px] font-extrabold leading-[1.1] tracking-tight text-brand-ink sm:text-[40px]">
              Everything Multiply OS{" "}
              <span className="relative whitespace-nowrap">
                replaces.
                <svg className="absolute -bottom-2 left-0 h-3 w-full text-brand-orange" viewBox="0 0 120 12" preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" aria-hidden="true">
                  <path d="M3 8c26-5 74-6 114-3" />
                </svg>
              </span>
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <StackTable />
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mx-auto mt-4 max-w-2xl text-center text-[11.5px] leading-relaxed text-brand-gray">
              Comparison uses published list pricing for a team of ten at a comparable tier, checked {AS_OF}.
              Vendors change their pricing, so treat these as indicative rather than quoted.
              All trademarks belong to their owners.
            </p>
          </Reveal>

          <Reveal delay={0.2} className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={openDemo}
              className="inline-flex w-full max-w-[420px] items-center justify-center gap-2.5 rounded-lg bg-brand-orange px-10 py-3.5 text-[15px] font-semibold text-white shadow-[0_12px_30px_-10px_rgba(234,123,27,0.85)] transition-colors hover:bg-brand-orange-dark sm:w-auto sm:min-w-[300px]"
            >
              Request a Demo
              <Arrow className="h-[17px] w-[17px]" />
            </button>
          </Reveal>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-container">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-[26px] font-extrabold leading-[1.1] tracking-tight text-brand-ink sm:text-[38px]">
              What the AI costs, and what it returns.
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-brand-charcoal">
              Usage is metered rather than a flat fee, so the number below moves with your team.
            </p>
          </Reveal>

          {/* calculator leads, explainer follows: the interactive thing earns the wider column */}
          <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:gap-12 sm:mt-10">
            <Reveal>
              <Calculator />
            </Reveal>
            <Reveal delay={0.1}>
              <BillingFacts />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-t border-[#EFECE6] bg-[#FBFAF8] px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-container">
          <Reveal className="mb-8 text-center sm:mb-10">
            <h2 className="text-[26px] font-extrabold leading-[1.1] tracking-tight text-brand-ink sm:text-[38px]">
              Frequently asked questions
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <Faq />
          </Reveal>

          <Reveal delay={0.14}>
            <div className="mx-auto mt-10 max-w-2xl text-center">
              <p className="text-[14px] font-semibold text-brand-ink">
                Trusted by entrepreneurs running $500K to $10M businesses
              </p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-brand-gray">
                Every plan includes SSL encryption, daily backups, and 99.9% uptime.
                <br className="hidden sm:block" />
                Questions?{" "}
                <a href="mailto:support@multiplyos.com" className="font-semibold text-brand-orange-dark underline">
                  support@multiplyos.com
                </a>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
