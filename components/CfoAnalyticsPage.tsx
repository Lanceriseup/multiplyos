"use client";

// Feature page: CFO Analytics, which the product calls Finance HQ.
//
// The product's own subtitle is the promise: "CFO-grade financial analytics
// powered by QuickBooks." So the page's job is to make "CFO-grade" mean
// something more than "we drew your revenue as a line".
//
// The spine is one arithmetic fact, carried by every mockup on the page: in July
// this business booked its best profit ever and its cash still went down, because
// the money is sitting in receivables. That is the product's own framing ("profit
// and cash aren't the same thing") turned into numbers a reader can check.
//
// Sections follow the client's running order exactly:
//
//   2. connect        QuickBooks in two minutes, or CSV if you are not on it
//   3. the Big 6      six tiles, and the deep dive underneath them
//   4. the briefing   what a CFO would have told you, written out
//   5. the statements Overview, P&L (last month and last six), Balance Sheet
//   6. transactions   search the ledger without opening QuickBooks
//   7. Multi AI       the coach, wired to the same numbers
//
// This is the first feature page with NO ReplacesStrip. Per the client, CFO
// Analytics replaces nothing.
//
// See docs/cfo-analytics-feature-notes.md. Two rules from it are load-bearing:
// only section 2 of those notes is confirmed by screenshots, and every number on
// this page is invented but internally consistent. Change one, change them all.
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
const UP = "#1F7F4C";
const DOWN = "#C0402B";
const AMBER = "#C9832B";
const AI = "#4B3CC4";
const colTransition = { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const };

// Written out in full because Tailwind scans source for literal class names.
const CARD_CLS = "h-[380px] sm:h-[430px]";
const TALL_CLS = "h-[430px] sm:h-[486px]";

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
const Upload = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 16.4v-11M7.4 10l4.6-4.6L16.6 10M4.4 19.4h15.2" />
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
const Sheet = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="4.4" y="3.4" width="15.2" height="17.2" rx="2" />
    <path d="M4.4 9h15.2M4.4 14.6h15.2M10.2 3.4v17.2" />
  </svg>
);
const RowsIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.2" />
    <path d="M3.5 9.5h17M3.5 14.5h17" />
  </svg>
);

// ---------------------------------------------------------------- the numbers
// One fictional services business, February to July 2026. Notes section 7.
// Revenue less COGS is gross profit; gross profit less opex is net profit, on
// every column. A finance buyer will check the arithmetic, so it has to hold.
const MONTHS = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];
const SERIES = {
  rev: [318400, 336900, 352100, 371500, 380700, 412800],
  cogs: [136900, 142800, 148600, 155000, 158900, 170500],
  gp: [181500, 194100, 203500, 216500, 221800, 242300],
  opex: [141200, 148300, 152900, 161700, 166300, 186400],
  np: [40300, 45800, 50600, 54800, 55500, 55900],
  cash: [281200, 296800, 312500, 328900, 340500, 318400],
  run: [8.2, 8.5, 8.8, 9.1, 8.0, 7.4],
};

const money = (n: number) => `$${n.toLocaleString("en-US")}`;

// ---------------------------------------------------------------- 2. connect
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
        <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-3">
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
              "Your dashboards build themselves: P&L, balance sheet, cash flow, KPIs",
              "Scoreboard metrics auto-populate from the accounts you map",
              "The AI briefing starts reading your books, not your spreadsheets",
            ].map((t) => (
              <p key={t} className="flex items-start gap-2 text-[10px] leading-snug text-brand-charcoal">
                <span className="mt-[5px] h-1 w-1 flex-none rounded-full" style={{ background: GREEN }} />
                {t}
              </p>
            ))}
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-3">
          <p className="text-[10px] leading-relaxed text-brand-charcoal">
            On Xero, on Sage, or working off a bookkeeper&rsquo;s spreadsheet? Upload the two
            statements yourself and every part of this page works the same way.
          </p>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            {["Profit and Loss", "Balance Sheet"].map((l) => (
              <div key={l} className="rounded-lg border border-[#EBE7E0] bg-white p-2.5">
                <p className="flex items-center gap-1.5 text-[10.5px] font-bold">
                  <span className="grid h-[20px] w-[20px] flex-none place-items-center rounded-md" style={{ background: "#EAF5EF", color: GREEN }}>
                    <Sheet className="h-3 w-3" />
                  </span>
                  {l}
                </p>
                <p className="mt-1 text-[8.5px] text-brand-gray">One CSV per month.</p>
                <p className="mt-2 text-[8px] font-bold uppercase tracking-[0.1em] text-brand-gray">Month</p>
                <p className="mt-1 rounded-md border border-[#E6E2DB] bg-[#FAF9F7] px-2 py-1 text-[9.5px] font-medium">
                  July 2026
                </p>
                <p className="mt-2 flex items-center justify-center gap-1.5 rounded-md py-1.5 text-[9.5px] font-semibold text-white" style={{ background: "#7EBFA1" }}>
                  <Upload className="h-2.5 w-2.5" />
                  Upload
                </p>
              </div>
            ))}
          </div>
          <div className="mt-2.5 space-y-1">
            {[
              "A template CSV for each statement, so the columns are never a guessing game",
              "Re-uploading a month replaces it, rather than double-counting it",
              "Paste the CSV straight in if downloading a file is more trouble than it is worth",
            ].map((t) => (
              <p key={t} className="flex items-start gap-2 text-[10px] leading-snug text-brand-charcoal">
                <span className="mt-[5px] h-1 w-1 flex-none rounded-full" style={{ background: GREEN }} />
                {t}
              </p>
            ))}
          </div>
        </div>
      )}

      <p className="flex-none border-t border-[#F1EEE9] px-3.5 py-2 text-[10px] leading-snug text-brand-gray">
        {route === "qbo"
          ? "One accounting system at a time, authorised through Intuit's own sign-in."
          : "No accounting integration required. The dashboards do not know the difference."}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- 3. the Big 6
type Metric = keyof typeof SERIES;

const TILES: {
  key: Metric;
  label: string;
  value: string;
  sub: string;
  delta: string;
  dir: "up" | "down" | "warn";
  read: string;
}[] = [
  {
    key: "rev", label: "Revenue", value: "$412,800", sub: "July 2026", delta: "+8.4%", dir: "up",
    read: "Up 29.6% over six months, and July is the biggest month this business has had.",
  },
  {
    key: "gp", label: "Gross Profit", value: "$242,300", sub: "58.7% margin", delta: "+1.9 pts", dir: "up",
    read: "Margin has climbed five months running, 57.0% to 58.7%. Delivery is getting cheaper, not pricing.",
  },
  {
    key: "opex", label: "Operating Expenses", value: "$186,400", sub: "45.2% of revenue", delta: "+12.1%", dir: "warn",
    read: "Growing faster than revenue: 12.1% against 8.4%. This is the line that is eating the growth.",
  },
  {
    key: "np", label: "Net Profit", value: "$55,900", sub: "13.5% margin", delta: "-1.1 pts", dir: "down",
    read: "A record dollar figure on a falling margin. It peaked at 14.8% in May and has been sliding since.",
  },
  {
    key: "cash", label: "Cash on Hand", value: "$318,400", sub: "across 3 accounts", delta: "-$22,100", dir: "down",
    read: "Down in the same month profit hit a record, because $55,800 of new revenue went to receivables.",
  },
  {
    key: "run", label: "Runway", value: "7.4 mo", sub: "at current burn", delta: "-0.6 mo", dir: "down",
    read: "Two months ago this was 9.1. Nothing has broken yet, but the direction is the whole point.",
  },
];

function tone(dir: "up" | "down" | "warn") {
  return dir === "up" ? UP : dir === "warn" ? AMBER : DOWN;
}

function BigSixDemo() {
  const [sel, setSel] = useState<Metric>("cash");
  const tile = TILES.find((t) => t.key === sel)!;
  const vals = SERIES[sel];

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${CARD_CLS}`}>
      <div className="flex flex-none items-center gap-2 border-b border-[#F1EEE9] px-3.5 py-2.5">
        <b className="text-[12px]">Finance HQ</b>
        <span className="ml-auto flex items-center gap-1.5 text-[9px] font-semibold" style={{ color: GREEN }}>
          <span className="h-[6px] w-[6px] rounded-full" style={{ background: GREEN }} />
          Synced 4m ago
        </span>
      </div>

      <div className="grid flex-none grid-cols-3 gap-1.5 px-3.5 py-2.5">
        {TILES.map((t) => {
          const on = sel === t.key;
          const c = tone(t.dir);
          return (
            <button
              key={t.key}
              type="button"
              aria-pressed={on}
              onClick={() => setSel(t.key)}
              className={`rounded-lg border px-2 py-1.5 text-left transition-colors ${
                on ? "border-transparent bg-[#F7F5F1]" : "border-[#E6E2DB] hover:bg-[#FAF9F7]"
              }`}
              style={on ? { boxShadow: `inset 0 0 0 1.5px ${c}55` } : undefined}
            >
              <span className="block truncate text-[8px] font-bold uppercase tracking-[0.09em] text-brand-gray">
                {t.label}
              </span>
              <span className="mt-0.5 block truncate text-[14px] font-extrabold leading-none tracking-tight tabular-nums">
                {t.value}
              </span>
              <span
                className="mt-1 inline-block rounded-[4px] px-1 py-px text-[8px] font-bold tabular-nums"
                style={{ background: `${c}18`, color: c }}
              >
                {t.delta}
              </span>
            </button>
          );
        })}
      </div>

      {/* the deep dive, underneath the tiles, as the brief asks */}
      <div className="min-h-0 flex-1 border-t border-[#F1EEE9] bg-[#FAF9F7] px-3.5 py-2.5">
        <p className="flex items-center gap-2 text-[10.5px] font-bold">
          {tile.label}
          <span className="ml-auto font-mono text-[8.5px] font-normal text-brand-gray">
            Feb to Jul 2026
          </span>
        </p>
        <div className="mt-1.5 h-[92px] sm:h-[112px]">
          <Bars vals={vals} color={tone(tile.dir)} money={sel !== "run"} />
        </div>
        <p className="mt-1.5 text-[10px] leading-snug text-brand-charcoal">{tile.read}</p>
      </div>
    </div>
  );
}

// A bar per month, each labelled, scaled inside its own range so a series that
// moves 10% does not read as a flat line.
function Bars({ vals, color, money: asMoney }: { vals: number[]; color: string; money: boolean }) {
  const lo = Math.min(...vals) * 0.86;
  const hi = Math.max(...vals);
  const fmt = (v: number) =>
    asMoney ? `${Math.round(v / 1000)}k` : v.toFixed(1);

  return (
    <div className="flex h-full items-end gap-1.5">
      {vals.map((v, i) => {
        const h = ((v - lo) / (hi - lo)) * 100;
        const last = i === vals.length - 1;
        return (
          <div key={MONTHS[i]} className="flex h-full min-w-0 flex-1 flex-col justify-end">
            <span className="mb-0.5 text-center font-mono text-[7.5px] tabular-nums text-brand-gray">
              {fmt(v)}
            </span>
            <span
              className="w-full rounded-t-[3px] transition-all duration-500"
              style={{ height: `${Math.max(6, h)}%`, background: last ? color : `${color}44` }}
            />
            <span className="mt-1 text-center font-mono text-[7.5px] text-brand-gray">{MONTHS[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------- 4. the briefing
const FINDINGS: {
  tag: string;
  color: string;
  head: string;
  body: string;
  rows: { l: string; v: string }[];
}[] = [
  {
    tag: "Cash",
    color: DOWN,
    head: "Your best profit month, and cash still went down",
    body: "July netted $55,900 and the bank balance fell $22,100. Receivables grew $55,800 in the same month, and $68,400 of what is owed to you is now more than sixty days old. The profit is real. It is sitting in somebody else's account.",
    rows: [
      { l: "Net profit, July", v: "+$55,900" },
      { l: "Change in cash", v: "-$22,100" },
      { l: "Change in receivables", v: "+$55,800" },
      { l: "Over 60 days", v: "$68,400" },
    ],
  },
  {
    tag: "Risk",
    color: AMBER,
    head: "Operating expenses are outrunning revenue",
    body: "Revenue grew 8.4% last month. Operating expenses grew 12.1%, led by payroll at 11.0% and marketing at 17.5%. Net margin peaked at 14.8% in May and is now 13.5%. Hold that spread for two more quarters and a record top line earns you nothing.",
    rows: [
      { l: "Revenue growth", v: "+8.4%" },
      { l: "Opex growth", v: "+12.1%" },
      { l: "Net margin, May", v: "14.8%" },
      { l: "Net margin, July", v: "13.5%" },
    ],
  },
  {
    tag: "Working",
    color: UP,
    head: "Delivery is genuinely getting more efficient",
    body: "Over six months revenue grew 29.6% while cost of goods grew 24.5%, so gross margin went from 57.0% to 58.7%. That is five consecutive months of improvement, and it is the reason there is any profit to argue about at all.",
    rows: [
      { l: "Revenue, 6 months", v: "+29.6%" },
      { l: "Cost of goods, 6 months", v: "+24.5%" },
      { l: "Gross margin, February", v: "57.0%" },
      { l: "Gross margin, July", v: "58.7%" },
    ],
  },
];

function BriefingDemo() {
  const [open, setOpen] = useState(0);

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${CARD_CLS}`}>
      <div className="flex flex-none items-center gap-2.5 border-b px-3.5 py-2.5" style={{ borderColor: "rgba(75,60,196,0.14)", background: "rgba(75,60,196,0.05)" }}>
        <span className="grid h-[26px] w-[26px] flex-none place-items-center rounded-lg bg-gradient-to-br from-[#F49230] to-[#DE6F14] text-white">
          <Spark className="h-3.5 w-3.5" />
        </span>
        <span className="min-w-0 flex-1">
          <p className="text-[12px] font-bold leading-tight">AI CFO Briefing</p>
          <p className="text-[9px] text-brand-gray">July 2026 close &middot; generated from your books</p>
        </span>
        <span className="flex-none rounded-full border border-[#E6E2DB] px-2 py-[3px] font-mono text-[8px] text-brand-gray">
          3 findings
        </span>
      </div>

      <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto px-3.5 py-2.5">
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
        Written by Anthropic Claude against your own ledger. Your data is not retained for training.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- 5. the statements
type Tab = "over" | "pl" | "bs";

const PL_MONTH = [
  { l: "Revenue", a: "412,800", b: "380,700", d: "+8.4%", dir: "up" as const, bold: true },
  { l: "Cost of goods sold", a: "170,500", b: "158,900", d: "+7.3%", dir: "flat" as const },
  { l: "Gross profit", a: "242,300", b: "221,800", d: "+9.2%", dir: "up" as const, bold: true },
  { l: "Payroll", a: "112,600", b: "101,400", d: "+11.0%", dir: "warn" as const },
  { l: "Marketing", a: "38,900", b: "33,100", d: "+17.5%", dir: "warn" as const },
  { l: "Software & hosting", a: "12,400", b: "11,900", d: "+4.2%", dir: "flat" as const },
  { l: "Rent & facilities", a: "8,900", b: "8,900", d: "0.0%", dir: "flat" as const },
  { l: "Other operating", a: "13,600", b: "11,000", d: "+23.6%", dir: "warn" as const },
  { l: "Total operating expenses", a: "186,400", b: "166,300", d: "+12.1%", dir: "warn" as const, bold: true },
  { l: "Net profit", a: "55,900", b: "55,500", d: "+0.7%", dir: "down" as const, bold: true },
];

const PL_SIX: { l: string; vals: number[]; bold?: boolean }[] = [
  { l: "Revenue", vals: SERIES.rev, bold: true },
  { l: "Cost of goods sold", vals: SERIES.cogs },
  { l: "Gross profit", vals: SERIES.gp, bold: true },
  { l: "Operating expenses", vals: SERIES.opex },
  { l: "Net profit", vals: SERIES.np, bold: true },
];

const BS = {
  assets: [
    { l: "Cash and equivalents", v: "318,400" },
    { l: "Accounts receivable", v: "241,800" },
    { l: "Other current assets", v: "34,600" },
    { l: "Fixed assets, net", v: "96,200" },
  ],
  liabilities: [
    { l: "Accounts payable", v: "128,400" },
    { l: "Credit cards", v: "31,900" },
    { l: "Accrued liabilities", v: "42,700" },
    { l: "Long-term debt", v: "148,000" },
  ],
};

function StatementsDemo() {
  const [tab, setTab] = useState<Tab>("pl");
  const [span, setSpan] = useState<"month" | "six">("month");

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${TALL_CLS}`}>
      <div className="scrollbar-none flex flex-none items-center gap-1 overflow-x-auto border-b border-[#EBE7E0] px-3 pt-1.5">
        {([
          { k: "over", l: "Overview" },
          { k: "pl", l: "Profit & Loss" },
          { k: "bs", l: "Balance Sheet" },
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

      {tab === "over" && (
        <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-3">
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { l: "Revenue", v: "$412,800", d: "+8.4%", dir: "up" as const },
              { l: "Net profit", v: "$55,900", d: "13.5% margin", dir: "down" as const },
              { l: "Cash", v: "$318,400", d: "-$22,100", dir: "down" as const },
            ].map((c) => (
              <div key={c.l} className="rounded-lg border border-[#EBE7E0] px-2.5 py-2">
                <p className="truncate text-[8px] font-bold uppercase tracking-[0.09em] text-brand-gray">{c.l}</p>
                <p className="mt-0.5 text-[15px] font-extrabold leading-none tracking-tight tabular-nums">{c.v}</p>
                <p className="mt-1 text-[8.5px] font-bold tabular-nums" style={{ color: tone(c.dir) }}>{c.d}</p>
              </div>
            ))}
          </div>

          <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.12em] text-brand-gray">
            Where the money went, July
          </p>
          <div className="mt-1.5 space-y-1">
            {[
              { l: "Cost of delivery", v: 170500, c: "#7A9CB8" },
              { l: "Payroll", v: 112600, c: "#5B47A8" },
              { l: "Marketing", v: 38900, c: "#EA7B1B" },
              { l: "Everything else", v: 34900, c: "#8A857D" },
              { l: "Left as profit", v: 55900, c: GREEN },
            ].map((r) => (
              <div key={r.l} className="flex items-center gap-2">
                <span className="w-[86px] flex-none truncate text-[9.5px] text-brand-charcoal">{r.l}</span>
                <span className="h-[13px] min-w-0 flex-1 overflow-hidden rounded-[3px] bg-[#F4F1EC]">
                  <span
                    className="block h-full rounded-[3px]"
                    style={{ width: `${(r.v / 412800) * 100}%`, background: r.c }}
                  />
                </span>
                <span className="w-[54px] flex-none text-right font-mono text-[9px] tabular-nums text-brand-charcoal">
                  {money(r.v)}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-2.5 rounded-lg bg-[#FAF9F7] px-2.5 py-2 text-[9.5px] leading-snug text-brand-charcoal">
            Four of those five bars grew faster than revenue last month. That is the whole story of
            July in one picture, and it is why net margin fell on record sales.
          </p>
        </div>
      )}

      {tab === "pl" && (
        <>
          <div className="flex flex-none items-center gap-2 border-b border-[#F1EEE9] px-3.5 py-2">
            <span className="flex items-center gap-0.5 rounded-lg bg-[#F1EEE9] p-0.5">
              {([
                { k: "month", l: "Last month" },
                { k: "six", l: "Last 6 months" },
              ] as const).map(({ k, l }) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={span === k}
                  onClick={() => setSpan(k)}
                  className={`whitespace-nowrap rounded-[7px] px-2.5 py-[4px] text-[9.5px] transition-colors ${
                    span === k ? "bg-brand-ink font-semibold text-white" : "font-medium text-brand-charcoal"
                  }`}
                >
                  {l}
                </button>
              ))}
            </span>
            <span className="ml-auto truncate font-mono text-[8.5px] text-brand-gray">
              {span === "month" ? "Jul vs Jun 2026" : "Feb to Jul 2026"}
            </span>
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            {span === "month" ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#FAF9F7] text-[8px] uppercase tracking-[0.1em] text-brand-gray">
                    <th className="px-3 py-1.5 font-bold">Account</th>
                    <th className="px-3 py-1.5 text-right font-bold">Jul</th>
                    <th className="px-3 py-1.5 text-right font-bold">Jun</th>
                    <th className="px-3 py-1.5 text-right font-bold">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {PL_MONTH.map((r) => {
                    const c = r.dir === "flat" ? "#8A857D" : tone(r.dir);
                    return (
                      <tr key={r.l} className="border-t border-[#F5F2ED]" style={r.bold ? { background: "#FAF9F7" } : undefined}>
                        <td className={`px-3 py-[5px] text-[10px] ${r.bold ? "font-bold" : "pl-5 text-brand-charcoal"}`}>
                          {r.l}
                        </td>
                        <td className={`px-3 py-[5px] text-right text-[10px] tabular-nums ${r.bold ? "font-bold" : ""}`}>
                          {r.a}
                        </td>
                        <td className="px-3 py-[5px] text-right text-[10px] tabular-nums text-brand-gray">{r.b}</td>
                        <td className="px-3 py-[5px] text-right">
                          <span className="rounded-[4px] px-1.5 py-px text-[8.5px] font-bold tabular-nums" style={{ background: `${c}16`, color: c }}>
                            {r.d}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#FAF9F7] text-[8px] uppercase tracking-[0.1em] text-brand-gray">
                    <th className="px-3 py-1.5 font-bold">Account</th>
                    {MONTHS.map((m) => (
                      <th key={m} className="px-2 py-1.5 text-right font-bold">{m}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PL_SIX.map((r) => (
                    <tr key={r.l} className="border-t border-[#F5F2ED]" style={r.bold ? { background: "#FAF9F7" } : undefined}>
                      <td className={`px-3 py-[6px] text-[10px] ${r.bold ? "font-bold" : "pl-5 text-brand-charcoal"}`}>
                        {r.l}
                      </td>
                      {r.vals.map((v, i) => (
                        <td
                          key={MONTHS[i]}
                          className={`px-2 py-[6px] text-right font-mono text-[9px] tabular-nums ${
                            r.bold ? "font-bold" : "text-brand-charcoal"
                          }`}
                        >
                          {Math.round(v / 1000)}k
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr className="border-t border-[#F5F2ED]">
                    <td className="px-3 py-[6px] pl-5 text-[10px] text-brand-charcoal">Net margin</td>
                    {["12.7%", "13.6%", "14.4%", "14.8%", "14.6%", "13.5%"].map((m, i) => (
                      <td
                        key={MONTHS[i]}
                        className="px-2 py-[6px] text-right font-mono text-[9px] tabular-nums"
                        style={{ color: i >= 4 ? DOWN : UP }}
                      >
                        {m}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            )}
          </div>

          <p className="flex-none border-t border-[#F1EEE9] px-3.5 py-2 text-[10px] leading-snug text-brand-gray">
            {span === "month"
              ? "Last month against the one before it, every line, with the change already worked out."
              : "Six months side by side is where the trend shows up. Net margin peaked in May."}
          </p>
        </>
      )}

      {tab === "bs" && (
        <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-brand-gray">Assets</p>
              <div className="mt-1.5 space-y-1">
                {BS.assets.map((r) => (
                  <p key={r.l} className="flex items-center gap-2 text-[10px]">
                    <span className="min-w-0 flex-1 truncate text-brand-charcoal">{r.l}</span>
                    <b className="flex-none font-mono tabular-nums">{r.v}</b>
                  </p>
                ))}
              </div>
              <p className="mt-1.5 flex items-center gap-2 border-t border-[#EBE7E0] pt-1.5 text-[10.5px] font-bold">
                <span className="min-w-0 flex-1">Total assets</span>
                <span className="flex-none font-mono tabular-nums">691,000</span>
              </p>
            </div>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-brand-gray">
                Liabilities
              </p>
              <div className="mt-1.5 space-y-1">
                {BS.liabilities.map((r) => (
                  <p key={r.l} className="flex items-center gap-2 text-[10px]">
                    <span className="min-w-0 flex-1 truncate text-brand-charcoal">{r.l}</span>
                    <b className="flex-none font-mono tabular-nums">{r.v}</b>
                  </p>
                ))}
              </div>
              <p className="mt-1.5 flex items-center gap-2 border-t border-[#EBE7E0] pt-1.5 text-[10.5px] font-bold">
                <span className="min-w-0 flex-1">Total liabilities</span>
                <span className="flex-none font-mono tabular-nums">351,000</span>
              </p>
              <p className="mt-1 flex items-center gap-2 text-[10.5px] font-bold" style={{ color: GREEN }}>
                <span className="min-w-0 flex-1">Equity</span>
                <span className="flex-none font-mono tabular-nums">340,000</span>
              </p>
            </div>
          </div>

          <div className="mt-3 rounded-lg px-2.5 py-2" style={{ background: "#FBEEEB" }}>
            <p className="text-[10px] font-bold" style={{ color: DOWN }}>
              Receivables are now 35% of everything you own.
            </p>
            <p className="mt-0.5 text-[9.5px] leading-snug text-brand-charcoal">
              $241,800 owed to you against $318,400 in the bank, and $68,400 of it is over sixty days
              old. This is the line the cash finding on the briefing came from.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- 6. transactions
type Tx = { d: string; who: string; acct: string; amt: number };

const TX: Tx[] = [
  { d: "Jul 28", who: "Amazon Web Services", acct: "Software & Hosting", amt: -4182.4 },
  { d: "Jul 26", who: "Gusto Payroll", acct: "Payroll", amt: -68940 },
  { d: "Jul 24", who: "Meta Ads", acct: "Marketing", amt: -9850 },
  { d: "Jul 22", who: "Northwind Group", acct: "Revenue", amt: 48000 },
  { d: "Jul 19", who: "Adobe Creative Cloud", acct: "Software & Hosting", amt: -1079.88 },
  { d: "Jul 18", who: "Delta Air Lines", acct: "Travel", amt: -1462.3 },
  { d: "Jul 15", who: "Figma", acct: "Software & Hosting", amt: -684 },
  { d: "Jul 12", who: "Harborline LLC", acct: "Revenue", amt: 26500 },
  { d: "Jul 09", who: "State Farm", acct: "Insurance", amt: -2240 },
  { d: "Jul 05", who: "WeWork", acct: "Rent & Facilities", amt: -8900 },
];

const CHIPS = ["software", "payroll", "revenue", "ads"];

function TxDemo() {
  const [q, setQ] = useState("software");
  const term = q.trim().toLowerCase();
  const rows = term
    ? TX.filter((t) => `${t.who} ${t.acct}`.toLowerCase().includes(term))
    : TX;
  const total = rows.reduce((s, t) => s + t.amt, 0);

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${CARD_CLS}`}>
      <div className="flex-none border-b border-[#F1EEE9] px-3.5 py-2.5">
        <label className="flex items-center gap-2 rounded-lg border border-[#E6E2DB] bg-[#FAF9F7] px-2.5 py-1.5 focus-within:border-brand-orange/60 focus-within:bg-white">
          <Search className="h-3.5 w-3.5 flex-none text-brand-gray" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search every transaction"
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

      <div className="min-h-0 flex-1 overflow-y-auto">
        {rows.length === 0 && (
          <p className="px-3.5 pt-12 text-center text-[10.5px] leading-relaxed text-brand-gray">
            Nothing matches &ldquo;{q}&rdquo; in July.
            <br />
            In QuickBooks you would still be looking.
          </p>
        )}
        {rows.map((t) => (
          <div key={`${t.d}-${t.who}`} className="flex items-center gap-2.5 border-b border-[#F5F2ED] px-3.5 py-[7px]">
            <span className="w-[38px] flex-none font-mono text-[9px] text-brand-gray">{t.d}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[10.5px] font-semibold leading-tight">{t.who}</span>
              <span className="text-[8.5px] text-brand-gray">{t.acct}</span>
            </span>
            <span
              className="flex-none font-mono text-[10px] font-bold tabular-nums"
              style={{ color: t.amt > 0 ? UP : "#33302C" }}
            >
              {t.amt > 0 ? "+" : "-"}
              {Math.abs(t.amt).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-none items-center gap-2 border-t border-[#F1EEE9] bg-[#FAF9F7] px-3.5 py-2">
        <span className="text-[10px] text-brand-gray">
          {rows.length} of {TX.length} transactions
        </span>
        <span className="ml-auto font-mono text-[10.5px] font-bold tabular-nums" style={{ color: total >= 0 ? UP : "#33302C" }}>
          {total >= 0 ? "+" : "-"}
          {Math.abs(total).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 7. Multi AI
const AI_ROWS: Row[] = [
  { name: "Cash on Hand", value: "$318,400", hit: false, tone: "red" },
  { name: "Operating Expenses", value: "+12.1%", hit: false, tone: "amber" },
  { name: "Gross Margin", value: "58.7%", hit: true },
];

const AI_INSIGHTS: Insight[] = [
  {
    tag: "Answer",
    color: DOWN,
    source: "Cash on Hand",
    text: "You can cover payroll, but not comfortably. Cash is $318,400 and it fell $22,100 in your best profit month, because $55,800 of July's revenue is still sitting in receivables. Collect the $68,400 that is over sixty days and the question stops being a question.",
  },
  {
    tag: "Because",
    color: AMBER,
    source: "Operating Expenses",
    text: "Operating expenses grew 12.1% against 8.4% revenue growth, led by payroll and marketing. That spread is what turned a record month into a falling net margin, 14.8% in May down to 13.5% now.",
  },
  {
    tag: "Keep doing",
    color: UP,
    source: "Gross Margin",
    text: "Gross margin has improved five months running, 57.0% to 58.7%. Whatever changed in delivery this spring is working, and it is the only reason the opex problem has not shown up in the bank yet.",
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
                you.
              </span>
              <span className="hidden sm:inline">
                Finance HQ pulls six months of your books in one read-only sync, then does what a
                good CFO does with them: tells you that your record profit month was also the month
                your cash went down, and exactly why.
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

      {/* ------------------------------------------------ 2. connect */}
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
        panel="linear-gradient(160deg, #EDF6F1, #DEEDE5)"
      />

      {/* ------------------------------------------------ 3. the Big 6 */}
      <Section
        id="big-six"
        eyebrow="The Big 6"
        title="Six numbers that tell you whether"
        swash="you are fine."
        body="Revenue, gross profit, operating expenses, net profit, cash, and runway. The whole company on one row, each with the direction it is moving, and a six-month history underneath so you can tell a bad month from a bad trend."
        points={[
          "Every tile carries its change, not just its value",
          "Click any of the six to open its trend below",
          "Profit and cash sit side by side, because they disagree more often than owners expect",
        ]}
        visual={<BigSixDemo />}
        flip
        panel="linear-gradient(160deg, #FFF7EA, #FDECD4)"
      />

      {/* ------------------------------------------------ 4. the briefing */}
      <Section
        id="briefing"
        eyebrow="The AI CFO Briefing"
        title="A chart shows you the drop. This tells"
        swash="you why."
        body="Every month it reads your ledger and writes up what a CFO would have walked into your office to say. Not a summary of the numbers you already saw, but the connection between them, with the arithmetic attached so you can check it."
        points={[
          "Written against your real accounts, with the figures cited",
          "Says what is going wrong, what is going right, and what is about to",
          "Generated by Anthropic Claude, and your data is never used for training",
        ]}
        visual={<BriefingDemo />}
        panel="linear-gradient(160deg, #F3F0FA, #E9E4F6)"
      />

      {/* ------------------------------------------------ 5. the statements */}
      <Section
        id="statements"
        eyebrow="Overview, P&amp;L, Balance Sheet"
        title="Run the entire P&L here, not"
        swash="in QuickBooks."
        body="Last month against the month before, every line with the change already worked out. Or six months side by side, which is the view that shows you net margin peaked in May while everybody was celebrating the revenue. The balance sheet sits one tab across."
        points={[
          "Last month and last six months, on the same statement",
          "Overview, Profit & Loss, Balance Sheet, and Cash Flow",
          "Every line traces back to the accounts it came from",
        ]}
        visual={<StatementsDemo />}
        flip
        panel="linear-gradient(160deg, #EEF4FB, #E2ECF8)"
      />

      {/* ------------------------------------------------ 6. transactions */}
      <Section
        id="transactions"
        eyebrow="Transactions"
        title="Find any charge without opening"
        swash="QuickBooks."
        body="Search the whole ledger by vendor, by account, by anything. Ask what you actually spent on software last month and get the answer and the subtotal in the same second, instead of logging into a second system to go looking for it."
        points={[
          "Search every transaction, not just the ones on a report",
          "Filter to an account and the subtotal comes with it",
          "One fewer login for everybody who is not the bookkeeper",
        ]}
        visual={<TxDemo />}
        panel="linear-gradient(160deg, #FAF6EE, #F2EADC)"
      />

      {/* ------------------------------------------------ 7. Multi AI (always last) */}
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
