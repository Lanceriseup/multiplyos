"use client";

// Feature page: CFO Analytics, which the product calls Finance HQ.
//
// The product's own subtitle is the promise: "CFO-Grade Analytics". So the
// page's job is to make "CFO-grade" mean something more than "we drew your
// revenue as a line".
//
// Rewritten August 2026 against nine screenshots of the live, populated app.
// Before those arrived the entire dashboard on this page was invented. It is
// not any more: the tab set, the Big Six card anatomy with its goal footer, the
// P&L hierarchy and its % of income column, the Balance Sheet's period-over-
// period comparison, all seven Key Ratios and the Business Valuation wizard are
// traced from the product, and the figures are the product's own sample ledger.
//
// The spine is one fact carried by every mockup: July revenue fell 6.6% and the
// business still cleared four of its six goals, because margin went up while
// revenue went down. That is a real story the sample ledger tells, and it is
// what a goal-measured dashboard is for.
//
// Sections:
//
//   2. the lock       a second password, before any of it opens
//   3. connect        QuickBooks in two minutes, or a CSV if you are not on it
//   4. the Big Six    six tiles, each against a goal the owner set
//   5. the briefing   what a CFO would have told you, written out
//   6. the statements P&L, Balance Sheet, Key Ratios
//   7. transactions   search the ledger without opening QuickBooks
//   8. Multi AI       the coach, wired to the same numbers
//
// There is no catch-all section for the tabs the page does not visit. There was
// one, and it was cut: a grid of one-sentence cards for Class, Business
// Valuation, Overview, AI Insights and the header buttons read as a feature
// list bolted onto a page that had spent seven sections showing rather than
// telling. Business Valuation still gets its own beat in the hero tour, which
// is where it earns its place.
//
// This is the first feature page with NO ReplacesStrip. Per the client, CFO
// Analytics replaces nothing.
//
// See docs/cfo-analytics-feature-notes.md. Every figure here foots against
// section 7 of that file. Change one, change them all.
import { motion } from "framer-motion";
import { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CTA from "./CTA";
import Reveal from "./Reveal";
import CfoAnalyticsHeroTour from "./CfoAnalyticsHeroTour";
import MultiAiWired from "./MultiAiWired";
import type { Row, Insight } from "./MultiAiWired";
import { useDemo } from "./DemoModal";

// ---------------------------------------------------------------- tokens
const GREEN = "#0F7B4F"; // the product's own button green
const EMERALD = "#12A870"; // the brighter green the live charts are drawn in
const UP = "#1F7F4C";
const DOWN = "#C0402B";
const AMBER = "#C9832B";
const ROSE = "#DB5A6B";
const AI = "#4B3CC4";
const BLUE = "#2D5FA8";
const colTransition = { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const };

// One height for every mockup on the page, and it is the same pair the other
// feature pages use. Written out in full because Tailwind scans source for
// literal class names.
//
// Nothing inside these cards scrolls. Where a list runs longer than the card,
// it is clipped at the bottom edge on purpose: a statement that carries on past
// the frame reads like a real window onto real data, and a scrollbar inside a
// marketing mockup invites a reader to fight with it instead.
const CARD_CLS = "h-[380px] sm:h-[430px]";

// ---------------------------------------------------------------- icons
const ico = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
type IconProps = { className?: string; style?: React.CSSProperties };

const Chart = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M4 19.6h16" />
    <path d="M6.6 16.4V11M11.4 16.4V6.4M16.2 16.4v-7" />
  </svg>
);
const Tick = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2.4}>
    <path d="M5 12l5 5L20 7" />
  </svg>
);
const Arrow = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2.4}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
const Shield = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 3.4l7.4 2.6v5.6c0 4.2-3 7.6-7.4 9-4.4-1.4-7.4-4.8-7.4-9V6z" />
    <path d="M8.8 12l2.2 2.2 4.2-4.4" />
  </svg>
);
const Lock = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="4.6" y="10.4" width="14.8" height="10.2" rx="2.4" />
    <path d="M8.2 10.4V7.6a3.8 3.8 0 0 1 7.6 0v2.8" />
    <path d="M12 14.4v2.4" />
  </svg>
);
const EyeOff = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M4 4l16 16" />
    <path d="M9.6 5.4A9.7 9.7 0 0 1 12 5.1c5 0 9 4.4 9 6.9a9.6 9.6 0 0 1-2.4 3.4M6.3 7.5C4.2 8.9 3 10.8 3 12c0 2.5 4 6.9 9 6.9a9.6 9.6 0 0 0 3.4-.6" />
  </svg>
);
const Search = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="10.8" cy="10.8" r="6.4" />
    <path d="M15.6 15.6l4.4 4.4" />
  </svg>
);
const Spark = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2}>
    <path d="M12 3l1.6 4L18 8.5 14 10l-2 4-2-4-4-1.5L10 7z" />
  </svg>
);
const Target = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="12" cy="12" r="8.2" />
    <circle cx="12" cy="12" r="3.4" />
  </svg>
);
const Heart = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 5.6l7.2 2.5v5.2c0 4-3 7.2-7.2 8.5-4.2-1.3-7.2-4.5-7.2-8.5V8.1z" />
    <path d="M8.6 13.2h1.9l1-2.2 1.4 3.4 1-1.2h1.5" />
  </svg>
);
const Upload = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 16.4v-11M7.4 10l4.6-4.6L16.6 10M4.4 19.4h15.2" />
  </svg>
);
const Download = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 4.6v11M7.4 11l4.6 4.6L16.6 11M4.4 19.4h15.2" />
  </svg>
);
const RowsIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.2" />
    <path d="M3.5 9.5h17M3.5 14.5h17" />
  </svg>
);

// ---------------------------------------------------------------- the numbers
// The product's own sample ledger, July 2026, read off the live screenshots.
// Revenue less COGS is gross profit; gross profit less operating expenses is
// net operating income; less the tax accrual is net income. It all foots, and a
// finance buyer will check.
const M6 = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];
const SERIES = {
  rev: [172135, 209880, 202640, 197900, 191505, 178865],
  np: [29951, 45964, 41744, 38393, 35620, 34017],
  pm: [17.4, 21.9, 20.6, 19.4, 18.6, 19.0],
  ocf: [28400, 44900, 39100, 36200, 34000, 32700],
  gm: [68.4, 69.6, 69.1, 68.7, 68.9, 69.7],
  opex: [79800, 88600, 87400, 85100, 86300, 81124],
};

function tone(dir: "up" | "down" | "warn") {
  return dir === "up" ? UP : dir === "warn" ? AMBER : DOWN;
}

// ---------------------------------------------------------------- 2. the lock
type Gate = "gate" | "behind";

const BEHIND = [
  { l: "CFO View", s: "The Big Six, the briefing, warnings, what-if" },
  { l: "Profit and Loss", s: "Every account, every month, to the cent" },
  { l: "Balance Sheet", s: "What you own, owe, and have left" },
  { l: "Key Ratios", s: "Seven ratios against seven targets" },
  { l: "Transactions", s: "The whole ledger, searchable" },
  { l: "Business Valuation", s: "What the company is worth today" },
];

function LockDemo() {
  const [tab, setTab] = useState<Gate>("gate");

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${CARD_CLS}`}>
      <div className="flex flex-none items-center gap-1 border-b border-[#F1EEE9] px-3.5 py-2.5">
        <span className="flex items-center gap-0.5 rounded-lg bg-[#F1EEE9] p-0.5">
          {([
            { k: "gate", l: "The gate" },
            { k: "behind", l: "What is behind it" },
          ] as const).map(({ k, l }) => (
            <button
              key={k}
              type="button"
              aria-pressed={tab === k}
              onClick={() => setTab(k)}
              className={`whitespace-nowrap rounded-[7px] px-2.5 py-[5px] text-[10px] transition-colors ${
                tab === k ? "bg-brand-ink font-semibold text-white" : "font-medium text-brand-charcoal"
              }`}
            >
              {l}
            </button>
          ))}
        </span>
      </div>

      {tab === "gate" ? (
        <div className="grid min-h-0 flex-1 place-items-center px-5">
          <div className="w-full max-w-[300px] text-center">
            <span
              className="mx-auto grid h-[46px] w-[46px] place-items-center rounded-2xl text-white"
              style={{
                background: `linear-gradient(150deg, ${EMERALD}, ${GREEN})`,
                boxShadow: "0 14px 26px -14px rgba(15,123,79,0.85)",
              }}
            >
              <Lock className="h-[22px] w-[22px]" />
            </span>
            <h4 className="mt-3 text-[15px] font-extrabold tracking-tight">Finance HQ is locked</h4>
            <p className="mt-1 text-[10.5px] leading-relaxed text-brand-charcoal">
              Signed in to Multiply OS is not the same as signed in to the books.
            </p>

            <div className="mt-3 rounded-xl border border-[#E6E2DB] bg-[#FAF9F7] p-2.5 text-left">
              <p className="text-[8px] font-bold uppercase tracking-[0.13em] text-brand-gray">
                Finance HQ password
              </p>
              <span className="mt-1 flex items-center gap-2 rounded-lg border border-[#E6E2DB] bg-white px-2 py-1.5">
                <Lock className="h-3 w-3 flex-none text-brand-gray" />
                <span className="flex min-w-0 flex-1 items-center gap-[3px]">
                  {Array.from({ length: 11 }).map((_, i) => (
                    <span key={i} className="h-[5px] w-[5px] rounded-full bg-brand-ink" />
                  ))}
                </span>
                <EyeOff className="h-3 w-3 flex-none text-brand-gray" />
              </span>
              <span
                className="mt-2 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-[11px] font-semibold text-white"
                style={{ background: GREEN }}
              >
                <Lock className="h-3 w-3" />
                Unlock Finance HQ
              </span>
            </div>

            <p className="mt-2.5 text-[9.5px] leading-snug text-brand-gray">
              A second password, set apart from the one you use to sign in.
            </p>
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-hidden px-3.5 py-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-brand-gray">
            Shut until the password is entered
          </p>
          <div className="mt-1.5 space-y-1">
            {BEHIND.map((b) => (
              <div
                key={b.l}
                className="flex items-center gap-2.5 rounded-lg border border-[#EBE7E0] bg-[#FAF9F7] px-2.5 py-[7px]"
              >
                <Lock className="h-3.5 w-3.5 flex-none" style={{ color: GREEN }} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[10.5px] font-semibold leading-tight">{b.l}</span>
                  <span className="block truncate text-[9px] text-brand-gray">{b.s}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="mt-2.5 rounded-lg px-2.5 py-2" style={{ background: "#EAF5EF" }}>
            <p className="flex items-center gap-1.5 text-[10px] font-bold" style={{ color: GREEN }}>
              <Shield className="h-3 w-3" />
              And the sync underneath it is read-only
            </p>
            <p className="mt-1 text-[9.5px] leading-snug text-brand-charcoal">
              Tokens are encrypted at rest with AES-256-GCM. Nothing is ever written back to your
              QuickBooks, and you can purge every trace of it in one click.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- 3. connect
type Route = "qbo" | "manual";

function ConnectDemo() {
  const [route, setRoute] = useState<Route>("qbo");

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${CARD_CLS}`}>
      <div className="flex flex-none items-center gap-1 border-b border-[#F1EEE9] px-3.5 py-2.5">
        <span className="flex items-center gap-0.5 rounded-lg bg-[#F1EEE9] p-0.5">
          {([
            { k: "qbo", l: "QuickBooks Online" },
            { k: "manual", l: "No QuickBooks?" },
          ] as const).map(({ k, l }) => (
            <button
              key={k}
              type="button"
              aria-pressed={route === k}
              onClick={() => setRoute(k)}
              className={`whitespace-nowrap rounded-[7px] px-2.5 py-[5px] text-[10px] transition-colors ${
                route === k ? "bg-brand-ink font-semibold text-white" : "font-medium text-brand-charcoal"
              }`}
            >
              {l}
            </button>
          ))}
        </span>
      </div>

      {route === "qbo" ? (
        <div className="min-h-0 flex-1 overflow-hidden px-3.5 py-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-brand-gray">
            What we sync
          </p>
          <div className="mt-1.5 space-y-1.5">
            {[
              { l: "Chart of Accounts", s: "Account names, types, and balances" },
              { l: "Profit & Loss", s: "Last 6 months, monthly" },
              { l: "Balance Sheet", s: "Last 6 months, monthly" },
            ].map((s) => (
              <div key={s.l} className="flex items-start gap-2.5 rounded-lg border border-[#EBE7E0] bg-[#FAF9F7] px-2.5 py-1.5">
                <Tick className="mt-[3px] h-3 w-3 flex-none" style={{ color: GREEN }} />
                <span className="min-w-0">
                  <span className="block text-[10.5px] font-semibold leading-tight">{s.l}</span>
                  <span className="block text-[9px] text-brand-gray">{s.s}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="mt-2.5 rounded-lg px-2.5 py-2" style={{ background: "#EAF5EF" }}>
            <p className="flex items-center gap-1.5 text-[10px] font-bold" style={{ color: GREEN }}>
              <Shield className="h-3 w-3" />
              Read-only. We never write to your QuickBooks.
            </p>
            <p className="mt-1 text-[9.5px] leading-snug text-brand-charcoal">
              Tokens are encrypted at rest with AES-256-GCM. Disconnect whenever you like, or delete
              every trace of it in one click.
            </p>
          </div>

          <p className="mt-2.5 text-[9px] font-bold uppercase tracking-[0.12em] text-brand-gray">
            Then what
          </p>
          <div className="mt-1.5 space-y-1">
            {[
              "Nine tabs build themselves: CFO View, P&L, Balance Sheet, Key Ratios, and the rest",
              "Scoreboard metrics auto-populate from the accounts you map",
              "The AI briefing starts reading your books, not your spreadsheets",
            ].map((t) => (
              <p key={t} className="flex items-start gap-2 text-[9.5px] leading-snug text-brand-charcoal">
                <Tick className="mt-[2px] h-2.5 w-2.5 flex-none" style={{ color: UP }} />
                {t}
              </p>
            ))}
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-hidden px-3.5 py-3">
          <p className="text-[10px] leading-relaxed text-brand-charcoal">
            On Xero, on Sage, or on a bookkeeper&rsquo;s spreadsheet? Upload the two statements a
            month at a time and nothing else on this page changes.
          </p>

          <div className="mt-2.5 grid grid-cols-2 gap-2">
            {[
              { l: "Profit and Loss", s: "One CSV per month" },
              { l: "Balance Sheet", s: "One CSV per month" },
            ].map((c) => (
              <div key={c.l} className="rounded-lg border border-[#EBE7E0] bg-[#FAF9F7] px-2.5 py-2">
                <p className="flex items-center gap-1.5 text-[10.5px] font-bold">
                  <Upload className="h-3 w-3" style={{ color: GREEN }} />
                  {c.l}
                </p>
                <p className="mt-0.5 text-[9px] text-brand-gray">{c.s}</p>
                <p className="mt-2 flex items-center gap-1 text-[9px] font-semibold" style={{ color: GREEN }}>
                  <Download className="h-2.5 w-2.5" />
                  Template
                </p>
                <span className="mt-1.5 block rounded-md border border-dashed border-[#D5D0C7] bg-white px-2 py-2 text-center text-[9px] text-brand-gray">
                  Choose a file, or paste the CSV
                </span>
              </div>
            ))}
          </div>

          <div className="mt-2.5 space-y-1">
            {[
              "Pick the month, upload, done. Re-uploading a month replaces it.",
              "The Big Six, the ratios, and the briefing all work off it the same way",
              "So the feature does not die because your books live somewhere else",
            ].map((t) => (
              <p key={t} className="flex items-start gap-2 text-[9.5px] leading-snug text-brand-charcoal">
                <Tick className="mt-[2px] h-2.5 w-2.5 flex-none" style={{ color: UP }} />
                {t}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- 4. the Big Six
type Metric = keyof typeof SERIES;

const TILES: {
  key: Metric;
  label: string;
  value: string;
  goal: string;
  delta: string;
  deltaGood: boolean;
  verdict: string;
  gap: string;
  ok: boolean;
  pct: boolean;
  read: string;
}[] = [
  {
    key: "rev", label: "Revenue", value: "$178.9K", goal: "$175K",
    delta: "-6.6% vs Jun", deltaGood: false, verdict: "Above goal", gap: "$3.9K", ok: true, pct: false,
    read: "Down 6.6% on June and still $3,900 clear of the goal. March was the high water mark at $209,880.",
  },
  {
    key: "np", label: "Profit", value: "$34K", goal: "$32K",
    delta: "-4.5% vs Jun", deltaGood: false, verdict: "Above goal", gap: "$2K", ok: true, pct: false,
    read: "$34,017 against a $32,000 goal. Smaller than June in dollars, and still over the line.",
  },
  {
    key: "pm", label: "Profit Margin", value: "19.0%", goal: "18.0%",
    delta: "+0.4 pts vs Jun", deltaGood: true, verdict: "Above goal", gap: "1.0 pts", ok: true, pct: true,
    read: "The one Big Six number that improved in a month revenue fell. A point clear of goal, and up 0.4 on June.",
  },
  {
    key: "ocf", label: "Operating Cash Flow", value: "$32.7K", goal: "$30K",
    delta: "-3.7% vs Jun", deltaGood: false, verdict: "Above goal", gap: "$2.7K", ok: true, pct: false,
    read: "$2,700 over goal, and receivables fell $11,668 in the same month. Most of the cash came from collecting, not selling.",
  },
  {
    key: "gm", label: "Gross Margin", value: "69.7%", goal: "70.0%",
    delta: "+0.8 pts vs Jun", deltaGood: true, verdict: "To goal", gap: "0.3 pts", ok: false, pct: true,
    read: "Three tenths of a point short, and moving the right way at +0.8 on June. Amber, not red.",
  },
  {
    key: "opex", label: "Operating Expenses", value: "$81.1K", goal: "$72K",
    delta: "-6.0% vs Jun", deltaGood: true, verdict: "Over budget", gap: "$9.1K", ok: false, pct: false,
    read: "$9,124 over the goal you set, even after a 6.0% cut on June. This is the number the briefing opens with.",
  },
];

function BigSixDemo() {
  const [sel, setSel] = useState<Metric>("opex");
  const tile = TILES.find((t) => t.key === sel)!;
  const vals = SERIES[sel];

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${CARD_CLS}`}>
      <div className="flex flex-none items-center gap-2 border-b border-[#F1EEE9] px-3.5 py-2.5">
        <b className="text-[12px]">Big Picture</b>
        <span className="font-mono text-[9px] text-brand-gray">Jul 2026</span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="flex items-center gap-1 rounded-md border border-[#CFE7DA] bg-[#F3FAF6] px-1.5 py-[3px]">
            <Heart className="h-[11px] w-[11px]" style={{ color: GREEN }} />
            <b className="text-[10px] tabular-nums">
              79<span className="text-[8px] font-semibold text-brand-gray">/100</span>
            </b>
          </span>
          <span className="rounded-md border border-[#E6E2DB] px-1.5 py-[3px] text-[9px] font-semibold text-brand-gray">
            0 warnings
          </span>
        </span>
      </div>

      <div className="grid flex-none grid-cols-3 gap-1.5 px-3.5 py-2.5">
        {TILES.map((t) => {
          const on = sel === t.key;
          const c = t.ok ? GREEN : t.verdict === "Over budget" ? DOWN : AMBER;
          return (
            <button
              key={t.key}
              type="button"
              aria-pressed={on}
              onClick={() => setSel(t.key)}
              className={`rounded-lg border px-2 py-1.5 text-left transition-colors ${
                on ? "border-transparent bg-[#F7F5F1]" : "border-[#E6E2DB] hover:bg-[#FAF9F7]"
              }`}
              style={on ? { boxShadow: `inset 0 0 0 1.5px ${c}66` } : undefined}
            >
              <span className="block truncate text-[8px] font-bold uppercase tracking-[0.09em] text-brand-gray">
                {t.label}
              </span>
              <span className="mt-0.5 block truncate text-[14px] font-extrabold leading-none tracking-tight tabular-nums">
                {t.value}
              </span>
              <span className="mt-1 flex items-center gap-1">
                <span
                  className="rounded-[4px] px-1 py-px text-[7.5px] font-bold tabular-nums"
                  style={{ background: `${c}18`, color: c }}
                >
                  {t.gap}
                </span>
                <span className="truncate text-[7.5px] font-semibold" style={{ color: c }}>
                  {t.verdict}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="min-h-0 flex-1 border-t border-[#F1EEE9] bg-[#FAF9F7] px-3.5 py-2.5">
        <p className="flex items-center gap-2 text-[10.5px] font-bold">
          {tile.label}
          <span
            className="flex items-center gap-1 rounded-full px-1.5 py-px text-[8px] font-bold tabular-nums"
            style={{ background: "rgba(75,60,196,0.09)", color: AI }}
          >
            <Target className="h-[8px] w-[8px]" />
            Goal {tile.goal}
          </span>
          <span className="ml-auto font-mono text-[8.5px] font-normal text-brand-gray">
            Feb to Jul 2026
          </span>
        </p>
        <div className="mt-1.5 h-[92px] sm:h-[112px]">
          <Bars
            vals={vals}
            color={tile.ok ? EMERALD : tile.verdict === "Over budget" ? ROSE : AMBER}
            pct={tile.pct}
          />
        </div>
        <p className="mt-1.5 text-[10px] leading-snug text-brand-charcoal">{tile.read}</p>
      </div>
    </div>
  );
}

// A bar per month, each labelled, scaled inside its own range so a series that
// moves two points does not read as a flat line.
function Bars({ vals, color, pct }: { vals: number[]; color: string; pct: boolean }) {
  const lo = Math.min(...vals) * (pct ? 0.97 : 0.86);
  const hi = Math.max(...vals);
  const fmt = (v: number) => (pct ? `${v.toFixed(1)}%` : `${Math.round(v / 1000)}k`);

  return (
    <div className="flex h-full items-end gap-1.5">
      {vals.map((v, i) => {
        const h = ((v - lo) / (hi - lo)) * 100;
        const last = i === vals.length - 1;
        return (
          <div key={M6[i]} className="flex h-full min-w-0 flex-1 flex-col justify-end">
            <span className="mb-0.5 text-center font-mono text-[7.5px] tabular-nums text-brand-gray">
              {fmt(v)}
            </span>
            <span
              className="w-full rounded-t-[3px] transition-all duration-500"
              style={{ height: `${Math.max(6, h)}%`, background: last ? color : `${color}44` }}
            />
            <span className="mt-1 text-center font-mono text-[7.5px] text-brand-gray">{M6[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------- 5. the briefing
const FINDINGS: {
  tag: string;
  color: string;
  head: string;
  body: string;
  rows: { l: string; v: string }[];
}[] = [
  {
    tag: "Watch",
    color: AMBER,
    head: "Revenue slipped, and your margin still went up",
    body: "July closed at $178,865, down 6.6% on June, and net margin rose to 19.0% anyway. Gross margin did the work: 69.7%, up 0.8 points. The catch is underneath it. Operating expenses came in at $81,124 against the $72,000 goal you set, so 45.4 cents of every dollar went out the door in a month that earned less.",
    rows: [
      { l: "Revenue, July", v: "$178,865" },
      { l: "Change on June", v: "-6.6%" },
      { l: "OpEx against goal", v: "$9,124 over" },
      { l: "OpEx as % of revenue", v: "45.4%" },
    ],
  },
  {
    tag: "Working",
    color: UP,
    head: "Collections turned a slower month into a cash month",
    body: "Receivables fell $11,668 and the bank accounts went up $7,036, so the business took in cash on lower sales. Operating cash flow was $32,700 against a $30,000 goal. That is what a good collections month looks like on the statements, and it is the reason the current ratio is 10.68x rather than something worth worrying about.",
    rows: [
      { l: "Accounts receivable", v: "-$11,668" },
      { l: "Bank accounts", v: "+$7,036" },
      { l: "Operating cash flow", v: "$32,700" },
      { l: "Current ratio", v: "10.68x" },
    ],
  },
  {
    tag: "Close",
    color: BLUE,
    head: "Gross margin is three tenths of a point off goal",
    body: "69.7% against a 70.0% goal, and up 0.8 points on June. Direct labour is $25,396 of the $54,129 cost of goods, so the gap closes with one pricing decision or one scheduling change rather than a project. Four of the Big Six cleared their goals this month. This one is the near miss, and it is moving the right way.",
    rows: [
      { l: "Gross margin, July", v: "69.7%" },
      { l: "Goal", v: "70.0%" },
      { l: "Change on June", v: "+0.8 pts" },
      { l: "Health score", v: "79/100" },
    ],
  },
];

const SUB_TABS = ["AI Briefing", "Big Picture", "Key Numbers", "Expenses", "CCC", "What-If", "Warnings", "Trends"];

function BriefingDemo() {
  const [open, setOpen] = useState(0);

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${CARD_CLS}`}>
      <div className="flex flex-none items-center gap-2.5 border-b px-3.5 py-2.5" style={{ borderColor: "rgba(75,60,196,0.14)", background: "rgba(75,60,196,0.05)" }}>
        <span className="grid h-[26px] w-[26px] flex-none place-items-center rounded-lg bg-gradient-to-br from-[#F49230] to-[#DE6F14] text-white">
          <Spark className="h-3.5 w-3.5" />
        </span>
        <span className="min-w-0 flex-1">
          <p className="text-[12px] font-bold leading-tight">AI Briefing</p>
          <p className="text-[9px] text-brand-gray">July 2026 close &middot; generated from your books</p>
        </span>
        <span className="flex-none rounded-full border border-[#E6E2DB] px-2 py-[3px] font-mono text-[8px] text-brand-gray">
          3 findings
        </span>
      </div>

      {/* The CFO View's own strip, so it is clear the briefing is one of eight.
          Desktop only: on mobile it truncates mid-word, and nothing in this card
          scrolls, so the height it costs would push the third finding out. */}
      <div className="hidden flex-none gap-2.5 border-b border-[#F1EEE9] px-3.5 py-1.5 sm:flex">
        {SUB_TABS.map((s, i) => (
          <span
            key={s}
            className={`whitespace-nowrap text-[9px] ${i === 0 ? "font-bold" : "font-medium text-brand-gray"}`}
            style={i === 0 ? { color: GREEN } : undefined}
          >
            {s}
          </span>
        ))}
      </div>

      <div className="min-h-0 flex-1 space-y-1.5 overflow-hidden px-3.5 py-2.5">
        {FINDINGS.map((f, i) => {
          const on = open === i;
          return (
            <div
              key={f.tag}
              className="overflow-hidden rounded-lg border transition-colors"
              style={{ borderColor: on ? `${f.color}44` : "#EBE7E0", background: on ? `${f.color}08` : "#fff" }}
            >
              <button
                type="button"
                aria-expanded={on}
                onClick={() => setOpen(i)}
                className="flex w-full items-start gap-2 px-2.5 py-2 text-left"
              >
                <span
                  className="mt-px h-fit flex-none rounded-full px-1.5 py-px font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-white"
                  style={{ background: f.color }}
                >
                  {f.tag}
                </span>
                <span className="min-w-0 flex-1 text-[10.5px] font-bold leading-snug">{f.head}</span>
              </button>

              {on && (
                <div className="px-2.5 pb-2.5">
                  <p className="text-[10px] leading-relaxed text-brand-charcoal">{f.body}</p>
                  <div className="mt-2 grid grid-cols-2 gap-1">
                    {f.rows.map((r) => (
                      <span
                        key={r.l}
                        className="flex items-center gap-1.5 rounded-md bg-white px-1.5 py-1 text-[8.5px]"
                        style={{ border: `1px solid ${f.color}22` }}
                      >
                        <span className="min-w-0 flex-1 truncate text-brand-gray">{r.l}</span>
                        <b className="flex-none tabular-nums" style={{ color: f.color }}>{r.v}</b>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="flex-none border-t border-[#F1EEE9] px-3.5 py-2 text-[10px] leading-snug text-brand-gray">
        <span className="sm:hidden">Written by Claude. Never used for training.</span>
        <span className="hidden sm:inline">
          Written by Anthropic Claude against your own ledger. Your data is not retained for
          training.
        </span>
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- 6. the statements
type Tab = "pl" | "bs" | "kr";

// The Profit and Loss tab, July 2026, accrual basis, exactly as the product
// renders it: nested accounts, running totals, and a % of income column.
type PlRow = { k: "grp" | "acct" | "tot" | "key"; l: string; v?: string; p?: string; star?: boolean };

const PL: PlRow[] = [
  { k: "grp", l: "Income" },
  { k: "acct", l: "Services Revenue", v: "98,068.00", p: "54.83 %" },
  { k: "acct", l: "Recurring Subscriptions", v: "46,102.00", p: "25.77 %" },
  { k: "acct", l: "Product Sales", v: "20,752.00", p: "11.60 %" },
  { k: "acct", l: "Training & Workshops", v: "13,943.00", p: "7.80 %" },
  { k: "tot", l: "Total Income", v: "$178,865.00", p: "100.00 %" },
  { k: "grp", l: "Cost of Goods Sold" },
  { k: "acct", l: "Direct Labor", v: "25,396.00", p: "14.20 %" },
  { k: "acct", l: "Materials", v: "16,371.00", p: "9.15 %" },
  { k: "acct", l: "Subcontractors", v: "8,128.00", p: "4.54 %" },
  { k: "acct", l: "Shipping & Freight", v: "4,234.00", p: "2.37 %" },
  { k: "tot", l: "Total Cost of Goods Sold", v: "54,129.00", p: "30.26 %" },
  { k: "key", l: "GROSS PROFIT", v: "$124,736.00", p: "69.74 %", star: true },
  { k: "grp", l: "Expenses" },
  { k: "acct", l: "Salaries & Wages", v: "30,398.00", p: "16.99 %" },
  { k: "acct", l: "Payroll Taxes & Benefits", v: "8,171.00", p: "4.57 %" },
  { k: "acct", l: "Marketing", v: "7,529.00", p: "4.21 %" },
  { k: "acct", l: "Rent", v: "6,861.00", p: "3.84 %" },
  { k: "acct", l: "Software & Subscriptions", v: "5,862.00", p: "3.28 %" },
  { k: "acct", l: "Depreciation", v: "4,200.00", p: "2.35 %" },
  { k: "acct", l: "Professional Fees", v: "3,714.00", p: "2.08 %" },
  { k: "acct", l: "Travel & Meals", v: "3,271.00", p: "1.83 %" },
  { k: "acct", l: "Insurance", v: "2,950.00", p: "1.65 %" },
  { k: "acct", l: "Utilities", v: "1,925.00", p: "1.08 %" },
  { k: "acct", l: "Interest Expense", v: "1,850.00", p: "1.03 %" },
  { k: "acct", l: "Bank & Merchant Fees", v: "1,578.00", p: "0.88 %" },
  { k: "acct", l: "Repairs & Maintenance", v: "1,452.00", p: "0.81 %" },
  { k: "acct", l: "Office Supplies", v: "1,363.00", p: "0.76 %" },
  { k: "tot", l: "Total Expenses", v: "81,124.00", p: "45.35 %", star: true },
  { k: "key", l: "NET OPERATING INCOME", v: "$43,612.00", p: "24.38 %" },
];

// The Compare view: July against June, at the level the product totals to.
const PL_CMP = [
  { l: "Total Income", a: "178,865.00", b: "191,505.00", d: "-6.6%", dir: "down" as const, bold: true },
  { l: "Total Cost of Goods Sold", a: "54,129.00", b: "59,558.00", d: "-9.1%", dir: "up" as const },
  { l: "Gross Profit", a: "124,736.00", b: "131,947.00", d: "-5.5%", dir: "down" as const, bold: true },
  { l: "Total Expenses", a: "81,124.00", b: "86,302.00", d: "-6.0%", dir: "up" as const },
  { l: "Net Operating Income", a: "43,612.00", b: "45,645.00", d: "-4.5%", dir: "down" as const, bold: true },
  { l: "Gross margin", a: "69.74 %", b: "68.90 %", d: "+0.8 pts", dir: "up" as const },
  { l: "OpEx as % of income", a: "45.35 %", b: "45.07 %", d: "+0.3 pts", dir: "warn" as const },
];

// The Balance Sheet tab, as of Jul 31 2026, against the prior period.
const BS: { l: string; a: string; b: string; d: string; lvl: 0 | 1 | 2; bold?: boolean }[] = [
  { l: "ASSETS", a: "", b: "", d: "", lvl: 0, bold: true },
  { l: "Operating Checking", a: "339,087.00", b: "334,162.00", d: "+4,925.00", lvl: 2 },
  { l: "Savings", a: "145,323.00", b: "143,212.00", d: "+2,111.00", lvl: 2 },
  { l: "Total Bank Accounts", a: "484,410.00", b: "477,374.00", d: "+7,036.00", lvl: 1, bold: true },
  { l: "Accounts Receivable (A/R)", a: "164,556.00", b: "176,224.00", d: "-11,668.00", lvl: 2 },
  { l: "Inventory Asset", a: "21,652.00", b: "23,832.00", d: "-2,180.00", lvl: 2 },
  { l: "Total Current Assets", a: "670,618.00", b: "677,430.00", d: "-6,812.00", lvl: 1, bold: true },
  { l: "Total Fixed Assets", a: "180,000.00", b: "180,000.00", d: "0.00", lvl: 1, bold: true },
  { l: "TOTAL ASSETS", a: "850,618.00", b: "857,430.00", d: "-6,812.00", lvl: 0, bold: true },
  { l: "LIABILITIES AND EQUITY", a: "", b: "", d: "", lvl: 0, bold: true },
  { l: "Accounts Payable (A/P)", a: "35,184.00", b: "38,726.00", d: "-3,542.00", lvl: 2 },
  { l: "Visa Credit Card", a: "12,000.00", b: "12,000.00", d: "0.00", lvl: 2 },
  { l: "Total Current Liabilities", a: "62,796.00", b: "66,338.00", d: "-3,542.00", lvl: 1, bold: true },
  { l: "TOTAL LIABILITIES", a: "139,779.00", b: "143,321.00", d: "-3,542.00", lvl: 0, bold: true },
  { l: "TOTAL EQUITY", a: "710,839.00", b: "714,109.00", d: "-3,270.00", lvl: 0, bold: true },
];

const RATIOS: { l: string; v: string; d: string; t: string; ok: boolean }[] = [
  { l: "Gross Margin", v: "69.7%", d: "Revenue minus cost of goods sold, divided by revenue", t: "Target: > 50%", ok: true },
  { l: "Net Profit Margin", v: "19.0%", d: "Net income divided by total revenue", t: "Target: > 10%", ok: true },
  { l: "Revenue per Employee", v: "$441,765", d: "Trailing 12-month revenue divided by headcount", t: "Higher is better", ok: true },
  { l: "Current Ratio", v: "10.68x", d: "Current assets divided by current liabilities", t: "Target: 1.5x to 3.0x", ok: true },
  { l: "Debt-to-Equity", v: "0.20x", d: "Total liabilities divided by total equity", t: "Target: < 2.0x", ok: true },
  { l: "OpEx Ratio", v: "45.4%", d: "Operating expenses excluding COGS, divided by revenue", t: "Lower is better", ok: false },
  { l: "Return on Assets", v: "4.0%", d: "Net income divided by total assets", t: "Target: > 5%", ok: false },
];

function StatementsDemo() {
  const [tab, setTab] = useState<Tab>("pl");
  const [cmp, setCmp] = useState(false);

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${CARD_CLS}`}>
      <div className="scrollbar-none flex flex-none items-center gap-1 overflow-x-auto border-b border-[#EBE7E0] px-3 pt-1.5">
        {([
          { k: "pl", l: "Profit and Loss" },
          { k: "bs", l: "Balance Sheet" },
          { k: "kr", l: "Key Ratios" },
        ] as const).map(({ k, l }) => (
          <button
            key={k}
            type="button"
            aria-pressed={tab === k}
            onClick={() => setTab(k)}
            className={`whitespace-nowrap border-b-2 px-2.5 pb-1.5 pt-1 text-[10.5px] transition-colors ${
              tab === k ? "font-bold" : "border-transparent font-medium text-brand-gray hover:text-brand-charcoal"
            }`}
            style={tab === k ? { borderColor: GREEN, color: GREEN } : undefined}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === "pl" && (
        <>
          <div className="flex flex-none items-center gap-2 border-b border-[#F1EEE9] px-3.5 py-2">
            <span className="flex items-center gap-0.5 rounded-lg bg-[#F1EEE9] p-0.5">
              {([
                { k: false, l: "July 2026" },
                { k: true, l: "Compare to June" },
              ] as const).map(({ k, l }) => (
                <button
                  key={l}
                  type="button"
                  aria-pressed={cmp === k}
                  onClick={() => setCmp(k)}
                  className={`whitespace-nowrap rounded-[7px] px-2.5 py-[4px] text-[9.5px] transition-colors ${
                    cmp === k ? "bg-brand-ink font-semibold text-white" : "font-medium text-brand-charcoal"
                  }`}
                >
                  {l}
                </button>
              ))}
            </span>
            <span className="ml-auto truncate font-mono text-[8.5px]" style={{ color: GREEN }}>
              Accrual basis
            </span>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden">
            {!cmp ? (
              <>
                <div className="flex items-center gap-2 border-b border-[#F1EEE9] bg-[#FAF9F7] px-3 py-1.5">
                  <span className="min-w-0 flex-1 text-[8px] font-bold uppercase tracking-[0.1em] text-brand-gray">
                    Account
                  </span>
                  <span className="w-[86px] flex-none text-right text-[8px] font-bold uppercase tracking-[0.1em] text-brand-gray">
                    Total
                  </span>
                  <span className="w-[52px] flex-none text-right text-[8px] font-bold uppercase tracking-[0.1em] text-brand-gray">
                    % Inc
                  </span>
                </div>
                {PL.map((r) => {
                  const grp = r.k === "grp";
                  const tot = r.k === "tot";
                  const key = r.k === "key";
                  return (
                    <div
                      key={r.l}
                      className="flex items-center gap-2 border-b border-[#F7F4EF] px-3 py-[3px]"
                      style={tot || key ? { background: "#FAF9F7" } : undefined}
                    >
                      <span
                        className={`min-w-0 flex-1 truncate ${
                          key
                            ? "text-[10px] font-extrabold"
                            : tot || grp
                              ? "text-[10px] font-bold"
                              : "pl-3 text-[10px] text-brand-charcoal"
                        }`}
                      >
                        {r.l}
                      </span>
                      <span
                        className={`w-[86px] flex-none text-right tabular-nums ${
                          key ? "text-[10px] font-extrabold" : tot ? "text-[10px] font-bold" : "text-[10px]"
                        }`}
                      >
                        {r.v}
                      </span>
                      <span className="flex w-[52px] flex-none items-center justify-end gap-1 text-[9px] tabular-nums text-brand-charcoal">
                        {r.star && <span style={{ color: "#E0A32E" }}>&#9733;</span>}
                        <span className={key || tot ? "font-bold" : ""}>{r.p}</span>
                      </span>
                    </div>
                  );
                })}
              </>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#FAF9F7] text-[8px] uppercase tracking-[0.1em] text-brand-gray">
                    <th className="px-3 py-1.5 font-bold">Line</th>
                    <th className="px-3 py-1.5 text-right font-bold">Jul 2026</th>
                    <th className="px-3 py-1.5 text-right font-bold">Jun 2026</th>
                    <th className="px-3 py-1.5 text-right font-bold">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {PL_CMP.map((r) => {
                    const c = tone(r.dir);
                    return (
                      <tr key={r.l} className="border-t border-[#F5F2ED]" style={r.bold ? { background: "#FAF9F7" } : undefined}>
                        <td className={`px-3 py-[7px] text-[10px] ${r.bold ? "font-bold" : "pl-5 text-brand-charcoal"}`}>
                          {r.l}
                        </td>
                        <td className={`px-3 py-[7px] text-right text-[10px] tabular-nums ${r.bold ? "font-bold" : ""}`}>
                          {r.a}
                        </td>
                        <td className="px-3 py-[7px] text-right text-[10px] tabular-nums text-brand-gray">{r.b}</td>
                        <td className="px-3 py-[7px] text-right">
                          <span className="rounded-[4px] px-1.5 py-px text-[8.5px] font-bold tabular-nums" style={{ background: `${c}16`, color: c }}>
                            {r.d}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <p className="flex-none border-t border-[#F1EEE9] px-3.5 py-2 text-[10px] leading-snug text-brand-gray">
            {cmp
              ? "Every total against the month before. Costs fell faster than revenue, which is why margin went up on a smaller month."
              : "Twenty-eight accounts, each as a share of income, each traceable back to the QuickBooks account behind it."}
          </p>
        </>
      )}

      {tab === "bs" && (
        <>
          <div className="flex flex-none items-center gap-2 border-b border-[#F1EEE9] px-3.5 py-2">
            <b className="text-[10.5px]">Balance Sheet</b>
            <span className="font-mono text-[8.5px] text-brand-gray">As of Jul 31, 2026</span>
            <span className="ml-auto rounded-md border border-[#E6E2DB] px-2 py-[3px] font-mono text-[8.5px] text-brand-charcoal">
              vs Jun 30, 2026
            </span>
          </div>

          <div className="grid flex-none grid-cols-3 gap-1.5 px-3.5 py-2.5">
            {[
              { l: "Total assets", v: "$850,618", c: UP },
              { l: "Total liabilities", v: "$139,779", c: DOWN },
              { l: "Total equity", v: "$710,839", c: BLUE },
            ].map((c) => (
              <div key={c.l} className="rounded-lg border border-[#EBE7E0] px-2.5 py-1.5">
                <p className="truncate text-[8px] font-bold uppercase tracking-[0.09em] text-brand-gray">{c.l}</p>
                <p className="mt-0.5 text-[14px] font-extrabold leading-none tracking-tight tabular-nums" style={{ color: c.c }}>
                  {c.v}
                </p>
              </div>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-hidden border-t border-[#F1EEE9]">
            <div className="flex items-center gap-2 border-b border-[#F1EEE9] bg-[#FAF9F7] px-3 py-1.5">
              <span className="min-w-0 flex-1 text-[8px] font-bold uppercase tracking-[0.1em] text-brand-gray">
                Account
              </span>
              <span className="w-[74px] flex-none text-right text-[8px] font-bold uppercase tracking-[0.1em] text-brand-gray">
                Jul 31
              </span>
              <span className="w-[74px] flex-none text-right text-[8px] font-bold uppercase tracking-[0.1em] text-brand-gray">
                Jun 30
              </span>
              <span className="w-[72px] flex-none text-right text-[8px] font-bold uppercase tracking-[0.1em] text-brand-gray">
                Change
              </span>
            </div>
            {BS.map((r) => {
              const neg = r.d.startsWith("-");
              const zero = r.d === "0.00" || r.d === "";
              return (
                <div
                  key={r.l}
                  className="flex items-center gap-2 border-b border-[#F7F4EF] px-3 py-[3.5px]"
                  style={r.lvl === 0 ? { background: "#FAF9F7" } : undefined}
                >
                  <span
                    className={`min-w-0 flex-1 truncate text-[10px] ${r.bold ? "font-bold" : "text-brand-charcoal"}`}
                    style={{ paddingLeft: r.lvl * 8 }}
                  >
                    {r.l}
                  </span>
                  <span className={`w-[74px] flex-none text-right text-[10px] tabular-nums ${r.bold ? "font-bold" : ""}`}>
                    {r.a}
                  </span>
                  <span className="w-[74px] flex-none text-right text-[10px] tabular-nums text-brand-gray">{r.b}</span>
                  <span
                    className="w-[72px] flex-none text-right text-[9.5px] font-semibold tabular-nums"
                    style={{ color: zero ? "#A6A6A6" : neg ? DOWN : UP }}
                  >
                    {r.d}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="flex-none border-t border-[#F1EEE9] px-3.5 py-2 text-[10px] leading-snug text-brand-gray">
            Every line against the same line a month ago, so a balance sheet stops being a snapshot
            and starts being a direction.
          </p>
        </>
      )}

      {tab === "kr" && (
        <div className="min-h-0 flex-1 overflow-hidden px-3.5 py-3">
          <div className="grid grid-cols-2 gap-1.5">
            {RATIOS.map((r) => (
              <div
                key={r.l}
                className="rounded-lg border px-2.5 py-2"
                style={
                  r.ok
                    ? { borderColor: "rgba(18,168,112,0.3)", background: "#F4FBF7" }
                    : { borderColor: "rgba(201,131,43,0.34)", background: "#FEFAF1" }
                }
              >
                <p className="flex items-center gap-1.5">
                  <span className="h-[6px] w-[6px] flex-none rounded-full" style={{ background: r.ok ? EMERALD : AMBER }} />
                  <span className="min-w-0 truncate text-[8px] font-bold uppercase tracking-[0.09em] text-brand-charcoal">
                    {r.l}
                  </span>
                </p>
                <p className="mt-0.5 text-[17px] font-extrabold leading-none tracking-tight tabular-nums">{r.v}</p>
                <p className="mt-1 text-[8.5px] leading-snug text-brand-charcoal">{r.d}</p>
                <p className="mt-0.5 text-[8px] font-semibold text-brand-gray">{r.t}</p>
              </div>
            ))}

            {/* the eighth cell, so the grid closes instead of trailing off */}
            <div className="flex flex-col justify-center rounded-lg border border-dashed border-[#DDD8CF] px-2.5 py-2">
              <p className="flex items-center gap-1.5 text-[8.5px] font-bold" style={{ color: GREEN }}>
                <Target className="h-3 w-3" />
                Five green, two amber
              </p>
              <p className="mt-1 text-[8.5px] leading-snug text-brand-charcoal">
                Nobody on the team has to remember what a healthy current ratio is, because the target
                is printed on the card next to the number.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- 7. transactions
type Tx = { d: string; type: string; who: string; acct: string; off: string; memo: string; doc: string; amt: number };

// Twelve July rows off the sample ledger, in the product's own column order.
const TX: Tx[] = [
  { d: "Jul 31", type: "Journal Entry", who: "", acct: "Income Tax Expense", off: "Income Taxes Payable", memo: "Income tax accrual", doc: "JE-2026-07-TAX", amt: 9595 },
  { d: "Jul 31", type: "Journal Entry", who: "", acct: "Depreciation", off: "Accumulated Depreciation", memo: "Monthly depreciation", doc: "JE-2026-07-DEP", amt: 4200 },
  { d: "Jul 31", type: "Check", who: "Summit Benefits Group", acct: "Payroll Taxes & Benefits", off: "Operating Checking", memo: "Employer taxes and benefits", doc: "10831", amt: 3326 },
  { d: "Jul 31", type: "Check", who: "Beacon Payroll Co.", acct: "Salaries & Wages", off: "Operating Checking", memo: "Payroll run", doc: "10830", amt: 10142 },
  { d: "Jul 28", type: "Sales Receipt", who: "Halstead Manufacturing", acct: "Operating Checking", off: "Recurring Subscriptions", memo: "Recurring plan, auto-charged", doc: "SR-3480", amt: 5285 },
  { d: "Jul 28", type: "Invoice", who: "Fairmount Auto Group", acct: "Accounts Receivable (A/R)", off: "Services Revenue", memo: "Professional services, custom development", doc: "INV-1307", amt: 21852 },
  { d: "Jul 27", type: "Expense", who: "Vantage Analytics", acct: "Software & Subscriptions", off: "Visa Credit Card", memo: "Monthly subscription", doc: "", amt: 2062 },
  { d: "Jul 27", type: "Invoice", who: "Orchard Lane Dental", acct: "Accounts Receivable (A/R)", off: "Product Sales", memo: "Product order, sensor module", doc: "INV-1310", amt: 8644 },
  { d: "Jul 26", type: "Payment", who: "Ironbridge Security", acct: "Operating Checking", off: "Accounts Receivable (A/R)", memo: "Payment received, INV-1300", doc: "", amt: 10037 },
  { d: "Jul 25", type: "Payment", who: "Verdant Home Services", acct: "Operating Checking", off: "Accounts Receivable (A/R)", memo: "Payment received, INV-1292", doc: "", amt: 12993 },
  { d: "Jul 25", type: "Bill", who: "Ashford & Lane LLP", acct: "Professional Fees", off: "Accounts Payable (A/P)", memo: "Professional services", doc: "BILL-2666", amt: 1751 },
  { d: "Jul 25", type: "Expense", who: "Quill Software Inc", acct: "Software & Subscriptions", off: "Visa Credit Card", memo: "Monthly subscription", doc: "", amt: 1437 },
];

const CHIPS = ["software", "payroll", "invoice", "payment"];

function TxDemo() {
  // Opens on the whole ledger rather than a filter, so the reader sees the
  // volume first and the search second.
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const rows = term
    ? TX.filter((t) => `${t.who} ${t.acct} ${t.off} ${t.memo} ${t.type} ${t.doc}`.toLowerCase().includes(term))
    : TX;
  const total = rows.reduce((s, t) => s + t.amt, 0);

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${CARD_CLS}`}>
      <div className="flex-none border-b border-[#F1EEE9] px-3.5 py-2.5">
        <p className="mb-1.5 text-[9px] text-brand-gray">
          Sample ledger &middot; 4,430 posting lines across 24 months &middot; every row here foots to the
          Profit and Loss.
        </p>
        <div className="flex items-center gap-1.5">
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#E6E2DB] bg-[#FAF9F7] px-2.5 py-1.5 focus-within:border-brand-orange/60 focus-within:bg-white">
            <Search className="h-3.5 w-3.5 flex-none text-brand-gray" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Vendor, customer, memo, doc #..."
              aria-label="Search transactions"
              className="min-w-0 flex-1 bg-transparent text-[11px] font-medium outline-none placeholder:font-normal placeholder:text-brand-gray"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                className="flex-none text-[9px] font-semibold text-brand-gray hover:text-brand-charcoal"
              >
                Clear
              </button>
            )}
          </label>
          <span className="flex flex-none items-center gap-1 rounded-lg border border-[#E6E2DB] bg-white px-2 py-1.5 text-[9.5px] font-semibold text-brand-charcoal">
            <Download className="h-3 w-3" />
            Export CSV
          </span>
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {CHIPS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setQ(c)}
              className={`rounded-full border px-2 py-[3px] text-[9px] transition-colors ${
                term === c
                  ? "border-brand-orange/55 bg-[#FFF6EC] font-semibold text-brand-orange-dark"
                  : "border-[#E6E2DB] font-medium text-brand-charcoal hover:bg-[#FAF9F7]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {rows.length === 0 && (
          <p className="px-3.5 pt-12 text-center text-[10.5px] leading-relaxed text-brand-gray">
            Nothing matches &ldquo;{q}&rdquo; in July.
            <br />
            In QuickBooks you would still be looking.
          </p>
        )}
        {rows.map((t) => (
          <div key={`${t.d}-${t.acct}-${t.amt}`} className="flex items-center gap-2 border-b border-[#F5F2ED] px-3.5 py-[6px]">
            <span className="w-[38px] flex-none font-mono text-[9px] text-brand-gray">{t.d}</span>
            <span className="w-[74px] flex-none truncate text-[9px] font-semibold" style={{ color: GREEN }}>
              {t.type}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[10.5px] font-semibold leading-tight">
                {t.who || t.acct}
              </span>
              <span className="block truncate text-[8.5px] text-brand-gray">
                {t.acct} &#8596; {t.off}
              </span>
            </span>
            <span className="hidden w-[128px] flex-none sm:block">
              <span className="block truncate text-[9px] text-brand-charcoal">{t.memo}</span>
              <span className="block truncate font-mono text-[8px] text-brand-gray">{t.doc}</span>
            </span>
            <span className="flex-none font-mono text-[10px] font-bold tabular-nums">
              ${t.amt.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-none items-center gap-2 border-t border-[#F1EEE9] bg-[#FAF9F7] px-3.5 py-2">
        {/* not "shown": the list is clipped by the card, so this counts matches */}
        <span className="text-[10px] text-brand-gray">
          {term ? `${rows.length} of ${TX.length} rows match` : `${TX.length} rows from July`}
        </span>
        <span className="ml-auto font-mono text-[10.5px] font-bold tabular-nums">
          Total ${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 8. Multi AI
const AI_ROWS: Row[] = [
  { name: "Operating Expenses", value: "$9,124 over goal", hit: false, tone: "amber" },
  { name: "Operating Cash Flow", value: "$32,700", hit: true },
  { name: "Bank Accounts", value: "$484,410", hit: true },
];

const AI_INSIGHTS: Insight[] = [
  {
    tag: "Answer",
    color: UP,
    source: "Bank Accounts",
    text: "Yes, and comfortably. You are holding $484,410 across two accounts against $62,796 of current liabilities, and July still generated $32,700 of operating cash on a month when revenue fell 6.6%. Two hires at market do not threaten that.",
  },
  {
    tag: "But",
    color: AMBER,
    source: "Operating Expenses",
    text: "Operating expenses are already $9,124 over the $72,000 goal you set, and salaries and wages are $30,398 of the $81,124. Two more people move OpEx further from the target it is missing, not closer.",
  },
  {
    tag: "So",
    color: BLUE,
    source: "Operating Cash Flow",
    text: "Raise the OpEx goal deliberately, or hire one now and one after gross margin clears 70.0%. Either is fine. Drifting past the goal without deciding to is the version that ends badly.",
  },
];

// ---------------------------------------------------------------- section shell
function Section({
  id,
  eyebrow,
  title,
  swash,
  body,
  points,
  visual,
  flip,
  panel,
}: {
  id: string;
  eyebrow: string;
  title: React.ReactNode;
  swash?: string;
  body: string;
  points: string[];
  visual: React.ReactNode;
  flip?: boolean;
  panel: string;
}) {
  return (
    <section id={id} className="scroll-mt-24 px-5 py-10 sm:px-8 sm:py-20">
      <div className="mx-auto grid max-w-container items-center gap-8 lg:grid-cols-2 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={colTransition}
          className={`text-center lg:text-left ${flip ? "lg:order-2" : ""}`}
        >
          <p className="mb-4 text-[13px] font-bold uppercase tracking-[0.14em] text-brand-orange-dark">{eyebrow}</p>
          <h2 className="text-[26px] font-extrabold leading-[1.1] tracking-tight text-brand-ink sm:text-[42px] sm:leading-[1.06]">
            {title}
            {swash && (
              <>
                {" "}
                <span className="relative whitespace-nowrap">
                  {swash}
                  <svg
                    className="absolute -bottom-2 left-0 h-3 w-full text-brand-orange"
                    viewBox="0 0 120 12"
                    preserveAspectRatio="none"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    strokeLinecap="round"
                  >
                    <path d="M3 8c26-5 74-6 114-3" />
                  </svg>
                </span>
              </>
            )}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-brand-charcoal sm:mt-6 sm:text-lg lg:mx-0">
            {body}
          </p>
          <ul className="mt-5 flex flex-col items-center gap-2.5 sm:gap-3 lg:items-start">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-left text-[13.5px] text-brand-ink sm:text-[15px]">
                <Tick className="mt-[3px] h-[17px] w-[17px] flex-none" style={{ color: UP }} />
                {p}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ ...colTransition, delay: 0.1 }}
          // min-w-0 so a wide mockup shrinks the column instead of blowing the
          // grid track out and scrolling the whole page sideways
          className={`min-w-0 rounded-2xl p-3 sm:rounded-[28px] sm:p-7 ${flip ? "lg:order-1" : ""}`}
          style={{ background: panel }}
        >
          {visual}
        </motion.div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- page
export default function CfoAnalyticsPage() {
  const { openDemo } = useDemo();

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* ------------------------------------------------ hero */}
      <section className="relative overflow-hidden px-5 pb-4 pt-6 sm:px-8 sm:pb-8 sm:pt-16">
        <div className="bg-dotted pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative mx-auto max-w-container">
          <Reveal className="mx-auto max-w-4xl text-center">
            <span className="mb-4 inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-black/10 bg-white py-1 pl-1 pr-[11px] shadow-sm sm:mb-7 sm:gap-3 sm:py-2 sm:pl-2 sm:pr-[22px]">
              <span className="grid h-[21px] w-[21px] flex-none place-items-center rounded-lg bg-gradient-to-br from-[#C88A1F] to-[#8A5405] text-white shadow-[0_2px_6px_rgba(138,84,5,0.34),inset_0_1px_0_rgba(255,255,255,0.34)] sm:h-[34px] sm:w-[34px] sm:rounded-[11px]">
                <Chart className="h-[14px] w-[14px] sm:h-[19px] sm:w-[19px]" />
              </span>
              <span className="text-[11.5px] font-[650] tracking-[0.02em] text-[#33302C] sm:text-[16.5px]">
                CFO Analytics
              </span>
            </span>
            <h1 className="text-[24px] font-extrabold leading-[1.1] tracking-tight text-brand-ink sm:text-[66px] sm:leading-[1.04]">
              Connect QuickBooks.
              <br />
              <span className="text-brand-orange">Get a CFO.</span>
            </h1>
            <p className="mx-auto mt-3.5 max-w-2xl text-[14.5px] leading-relaxed text-brand-charcoal sm:mt-7 sm:text-xl">
              <span className="sm:hidden">
                Two minutes of setup turns your books into a finance department that reads them for
                you, behind a password of its own.
              </span>
              <span className="hidden sm:inline">
                Finance HQ locks your books behind a second password, then does what a good CFO does
                with them: measures all six headline numbers against the goals you set, and writes up
                what moved and why.
              </span>
            </p>
          </Reveal>

          <Reveal delay={0.12} className="mt-6 sm:mt-12">
            <div
              className="overflow-hidden rounded-2xl p-2 sm:rounded-[30px] sm:p-8"
              style={{ background: "linear-gradient(160deg, #E7F1EB, #D6E8DD)" }}
            >
              <CfoAnalyticsHeroTour />
            </div>
          </Reveal>

          <Reveal delay={0.2} className="mt-6 sm:mt-10">
            <div className="flex justify-center">
              <button
                type="button"
                onClick={openDemo}
                className="inline-flex w-full max-w-[420px] items-center justify-center gap-2.5 rounded-lg bg-brand-orange px-10 py-3 text-[15px] font-semibold text-white shadow-[0_12px_30px_-10px_rgba(234,123,27,0.85)] transition-colors hover:bg-brand-orange-dark sm:w-auto sm:min-w-[300px]"
              >
                Request a Demo
                <Arrow className="h-[17px] w-[17px]" />
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-container px-5 sm:px-8">
        <hr className="border-t border-brand-gray/20" />
      </div>

      {/* ------------------------------------------------ 2. the lock */}
      <Section
        id="locked"
        eyebrow="Locked by default"
        title="Being logged in is not"
        swash="enough."
        body="Finance HQ asks for a second password of its own before it renders a single number. Somebody sitting at an open Multiply OS session still does not get your payroll, your bank balance, or what the company is worth. The books are the one part of the operating system that stays shut until you say otherwise."
        points={[
          "A separate Finance HQ password, on top of your account login",
          "Every tab behind it stays closed until that password is entered",
          "Read-only QuickBooks sync underneath, tokens encrypted at rest",
        ]}
        visual={<LockDemo />}
        panel="linear-gradient(160deg, #ECF4F0, #DBE9E2)"
      />

      {/* ------------------------------------------------ 3. connect */}
      <Section
        id="connect"
        eyebrow="Two minutes, once"
        title="Authorise it, and the finance"
        swash="department opens."
        body="You sign in through Intuit, tick one box, and Finance HQ pulls six months of your chart of accounts, profit and loss, and balance sheet. Read-only, so nothing is ever written back to your books. And if you are not on QuickBooks, upload the two statements yourself and nothing else about this page changes."
        points={[
          "Read-only access, with tokens encrypted at rest",
          "Six months of history on the first sync, so trends exist on day one",
          "Not on QuickBooks? A CSV per month does the same job",
        ]}
        visual={<ConnectDemo />}
        flip
        panel="linear-gradient(160deg, #EDF6F1, #DEEDE5)"
      />

      {/* ------------------------------------------------ 4. the Big Six */}
      <Section
        id="big-six"
        eyebrow="The Big Six"
        title="Six numbers, and the goal you set"
        swash="for each one."
        body="Revenue, profit, profit margin, operating cash flow, gross margin, and operating expenses. Every card carries the number, the trend, and the distance to the target you set yourself, so nobody has to decide in the meeting whether $178,865 was a good month. It was $3,900 over goal. That is the whole conversation."
        points={[
          "Above goal, to goal, or over budget, printed on every card",
          "A health score out of 100 and a live warning count on the same screen",
          "Click any of the six to open its six-month history underneath",
        ]}
        visual={<BigSixDemo />}
        panel="linear-gradient(160deg, #FFF7EA, #FDECD4)"
      />

      {/* ------------------------------------------------ 5. the briefing */}
      <Section
        id="briefing"
        eyebrow="The AI Briefing"
        title="A chart shows you the drop. This tells"
        swash="you why."
        body="Every month it reads your ledger and writes up what a CFO would have walked into your office to say. Not a summary of the numbers you already saw, but the connection between them, with the arithmetic attached so you can check it."
        points={[
          "Written against your real accounts, with the figures cited",
          "One of eight views under CFO View, next to Warnings, What-If, and CCC",
          "Generated by Anthropic Claude, and your data is never used for training",
        ]}
        visual={<BriefingDemo />}
        flip
        panel="linear-gradient(160deg, #F3F0FA, #E9E4F6)"
      />

      {/* ------------------------------------------------ 6. the statements */}
      <Section
        id="statements"
        eyebrow="P&amp;L, Balance Sheet, Key Ratios"
        title="Run the entire P&L here, not"
        swash="in QuickBooks."
        body="Every account, nested the way your accountant nests them, with each line as a share of income and a compare column against last month. The balance sheet sits one tab across, already differenced against the prior period, and the ratios tab does the arithmetic nobody remembers the targets for."
        points={[
          "Twenty-eight accounts on the P&L, each with its % of income",
          "A balance sheet that shows the change, not just the closing figure",
          "Seven key ratios, each printed next to the target it has to clear",
        ]}
        visual={<StatementsDemo />}
        panel="linear-gradient(160deg, #EEF4FB, #E2ECF8)"
      />

      {/* ------------------------------------------------ 7. transactions */}
      <Section
        id="transactions"
        eyebrow="Transactions"
        title="Find any charge without opening"
        swash="QuickBooks."
        body="The whole posting ledger, searchable by vendor, customer, memo, or document number, with the account and the offsetting account on every row. Ask what you actually spent on software last month and get the answer and the subtotal in the same second, instead of logging into a second system to go looking."
        points={[
          "Every posting line, not just the ones that made it onto a report",
          "Filter, subtotal, and export to CSV without leaving the page",
          "One fewer login for everybody who is not the bookkeeper",
        ]}
        visual={<TxDemo />}
        flip
        panel="linear-gradient(160deg, #FAF6EE, #F2EADC)"
      />

      {/* ------------------------------------------------ 8. Multi AI (always last) */}
      <MultiAiWired
        heading="And your coach can read"
        swash="the books too."
        intro="Finance HQ is wired into Multi AI, so the coach that knows your projects, your scoreboards, and your SOPs also knows your cash position. Ask it a question in plain English and it answers out of the ledger."
        prompt="Can we afford to hire two more people this quarter?"
        leftLabel="What Finance HQ is holding"
        leftColor={GREEN}
        leftIcon={RowsIcon}
        rightLabel="What Multi AI says back"
        panelTitle="Finance HQ · July 2026"
        panelMeta="synced 4m ago"
        panelDot={GREEN}
        rows={AI_ROWS}
        insights={AI_INSIGHTS}
        aiMeta="reading 6 months of books"
        footer="Multi AI reads the same ledger the dashboards are built from. No exports, no copying numbers into a chat window, no separate AI subscription."
      />

      <CTA />
      <Footer />
    </main>
  );
}
