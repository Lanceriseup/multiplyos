"use client";

// Animated hero for the CFO Analytics feature page.
//
// Rebuilt in August 2026 against nine screenshots of the live, populated
// Finance HQ. Before those arrived the whole populated dashboard was invented;
// now the chrome, the tab set, the Big Six card anatomy, the P&L hierarchy, the
// Key Ratios and the Business Valuation wizard are all traced from the product.
// Only the AI briefing prose is written by us, because that tab ships empty
// until an account is connected and the product's own copy says the CFO View
// carries the sample insights instead.
//
// The loop, in order:
//
//   1. the lock              Finance HQ needs a SECOND password, not your login
//   2. the sync              six months of books arriving from QuickBooks
//   3. CFO View, Big Picture the Big Six, each one against a goal you set
//   4. CFO View, AI Briefing typed out, and it explains a fall that was fine
//   5. Profit and Loss       the real hierarchy, with the % of income column
//   6. Key Ratios            seven ratios, each against its own target
//   7. Business Valuation    three screens deep, and this beat scrolls
//
// The lock leads because a page with the books on it has to answer "who else
// can see this" before it answers anything else. The sync follows it so that
// "connect QuickBooks, get a CFO" reads as a sequence rather than a claim.
//
// Beat 7 is the only one that moves within itself: the result screen is longer
// than the frame, so the tour scrolls it through the scorecard, the eleven
// sub-categories on one radar, and the executive summary. The loop then fades
// the whole card out and brings the lock screen back up behind the fade, rather
// than cutting. One full pass is about 41 seconds.
//
// Same architecture as the other eight tours: the app is React state, only the
// cursor and its ripple are animated imperatively through the Web Animations
// API, and the sequence is generation-token guarded so a re-render or unmount
// cancels the in-flight tour rather than leaving orphaned timers behind.
//
// Numbers come from the product's own sample ledger, so they are the ones a
// prospect sees on their own trial. They foot: see
// docs/cfo-analytics-feature-notes.md section 7.
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

const MIN_W = 980;
const STAGE_H = 560; // taller than the other tours: this screen carries nine tabs of chrome
const EASE = "cubic-bezier(0.22,1,0.36,1)";

// The product's own green, from the Connect and Unlock buttons.
const GREEN = "#0F7B4F";
const EMERALD = "#12A870"; // the brighter green the live charts are drawn in
const AMBER = "#D0912C";
const ROSE = "#DB5A6B";
const RED = "#C0402B";
const AI = "#4B3CC4";
const BLUE = "#2D5FA8";

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

const Spark = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2}>
    <path d="M12 3l1.6 4L18 8.5 14 10l-2 4-2-4-4-1.5L10 7z" />
  </svg>
);
const Lock = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="4.6" y="10.4" width="14.8" height="10.2" rx="2.4" />
    <path d="M8.2 10.4V7.6a3.8 3.8 0 0 1 7.6 0v2.8" />
    <path d="M12 14.4v2.4" />
  </svg>
);
const Tick = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2.4}>
    <path d="M5 12l5 5L20 7" />
  </svg>
);
const Target = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="12" cy="12" r="8.2" />
    <circle cx="12" cy="12" r="3.4" />
  </svg>
);
const Share = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="9.2" cy="8.4" r="3" />
    <path d="M3.6 18.6c0-2.8 2.5-4.6 5.6-4.6s5.6 1.8 5.6 4.6" />
    <path d="M16.2 6.2a3 3 0 0 1 0 5.6M17.4 14.6c1.9.6 3.2 1.9 3.2 4" />
  </svg>
);
const Pie = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="12" cy="12" r="8.2" />
    <path d="M12 3.8V12l7 4.2" />
  </svg>
);
const Cog = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3.4v2.2M12 18.4v2.2M20.6 12h-2.2M5.6 12H3.4M18.1 5.9l-1.6 1.6M7.5 16.5l-1.6 1.6M18.1 18.1l-1.6-1.6M7.5 7.5L5.9 5.9" />
  </svg>
);
const Cal = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="3.6" y="5" width="16.8" height="15.4" rx="2" />
    <path d="M3.6 9.6h16.8M8.4 3v4M15.6 3v4" />
  </svg>
);
const Board = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="3.4" y="4.4" width="17.2" height="15.2" rx="2" />
    <path d="M9.6 4.4v15.2" />
  </svg>
);
const Bars = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M4 20h16" />
    <path d="M6.8 17V11M11.6 17V5.6M16.4 17v-7.4" />
  </svg>
);
const Pulse = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M3 13.4h3.6L9 6.4l3.4 11 2.4-6h6.2" />
  </svg>
);
const Scale = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 4.4v15.2M6.6 19.6h10.8" />
    <path d="M4 9.4h16M4 9.4l-2 4.4h4zM20 9.4l-2 4.4h4z" />
  </svg>
);
const Pct = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M6.4 17.6L17.6 6.4" />
    <circle cx="7.6" cy="7.6" r="2.4" />
    <circle cx="16.4" cy="16.4" r="2.4" />
  </svg>
);
const Ledger = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="4.4" y="3.4" width="15.2" height="17.2" rx="2" />
    <path d="M8 8h8M8 12h8M8 16h4.4" />
  </svg>
);
const Layers = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 3.6L21 8l-9 4.4L3 8z" />
    <path d="M3 12.6l9 4.4 9-4.4M3 16.8l9 4.4 9-4.4" />
  </svg>
);
const Brain = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 5.2v14" />
    <path d="M12 6.4a3 3 0 0 0-5.6-.6A2.8 2.8 0 0 0 4 9.6a2.9 2.9 0 0 0 .9 4.6A3 3 0 0 0 8.6 19a3 3 0 0 0 3.4-.9" />
    <path d="M12 6.4a3 3 0 0 1 5.6-.6A2.8 2.8 0 0 1 20 9.6a2.9 2.9 0 0 1-.9 4.6A3 3 0 0 1 15.4 19a3 3 0 0 1-3.4-.9" />
  </svg>
);
const Gem = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M7.4 4.4h9.2l3.4 4.6L12 19.6 4 9z" />
    <path d="M4 9h16M9.6 4.4L12 19.6 14.4 4.4" />
  </svg>
);
const Shield = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 3.4l7.4 2.6v5.6c0 4.2-3 7.6-7.4 9-4.4-1.4-7.4-4.8-7.4-9V6z" />
    <path d="M8.8 12l2.2 2.2 4.2-4.4" />
  </svg>
);
const Heart = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 5.6l7.2 2.5v5.2c0 4-3 7.2-7.2 8.5-4.2-1.3-7.2-4.5-7.2-8.5V8.1z" />
    <path d="M8.6 13.2h1.9l1-2.2 1.4 3.4 1-1.2h1.5" />
  </svg>
);
const Bell = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M6.6 10.4a5.4 5.4 0 0 1 10.8 0c0 4 1.6 5.4 1.6 5.4H5s1.6-1.4 1.6-5.4z" />
    <path d="M10.4 19a1.9 1.9 0 0 0 3.2 0" />
  </svg>
);
const Refresh = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M20.4 11.4a8.4 8.4 0 1 0-.8 4.6" />
    <path d="M20.6 5.6v5.8h-5.8" />
  </svg>
);
const Pencil = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M16.4 3.8l3.8 3.8L8.6 19.2 4 20.4l1.2-4.6z" />
  </svg>
);
const Plug = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M9 3.4v5M15 3.4v5" />
    <path d="M6.4 8.4h11.2v3.2a5.6 5.6 0 0 1-11.2 0z" />
    <path d="M12 17.2v3.4" />
  </svg>
);
const Spin = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2.2}>
    <path d="M12 4.2a7.8 7.8 0 1 1-5.5 2.3" />
  </svg>
);
const Chev = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2.2}>
    <path d="M9.4 5.6L16 12l-6.6 6.4" />
  </svg>
);
const Caret = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2.4}>
    <path d="M6 9.4l6 6 6-6" />
  </svg>
);
const Search = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="10.8" cy="10.8" r="6.4" />
    <path d="M15.6 15.6l4.4 4.4" />
  </svg>
);
const EyeOff = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M4 4l16 16" />
    <path d="M9.6 5.4A9.7 9.7 0 0 1 12 5.1c5 0 9 4.4 9 6.9a9.6 9.6 0 0 1-2.4 3.4M6.3 7.5C4.2 8.9 3 10.8 3 12c0 2.5 4 6.9 9 6.9a9.6 9.6 0 0 0 3.4-.6" />
  </svg>
);

// ---------------------------------------------------------------- data
// The product's sample ledger, July 2026. Every figure below is read straight
// off the live screenshots. See notes section 7 for how they foot.
const M6 = ["Feb 26", "Mar 26", "Apr 26", "May 26", "Jun 26", "Jul 26"];

type Big = {
  key: string;
  label: string;
  goal: string;
  month: string;
  value: string;
  delta: string;
  deltaGood: boolean;
  series: number[];
  color: string;
  goalLine: string;
  verdict: string;
  gap: string;
  ok: boolean;
};

// The Big Six, in the order the live Big Picture lays them out.
const BIG6: Big[] = [
  {
    key: "rev", label: "Revenue", goal: "$175K", month: "Jul 2026", value: "$178.9K",
    delta: "-6.6% vs Jun", deltaGood: false,
    series: [172135, 209880, 202640, 197900, 191505, 178865],
    color: EMERALD, goalLine: "$175K · monthly", verdict: "ABOVE GOAL", gap: "$3.9K", ok: true,
  },
  {
    key: "profit", label: "Profit", goal: "$32K", month: "Jul 2026", value: "$34K",
    delta: "-4.5% vs Jun", deltaGood: false,
    series: [29951, 45964, 41744, 38393, 35620, 34017],
    color: EMERALD, goalLine: "$32K · monthly", verdict: "ABOVE GOAL", gap: "$2K", ok: true,
  },
  {
    key: "pm", label: "Profit Margin", goal: "18.0%", month: "Jul 2026", value: "19.0%",
    delta: "+0.4 pts vs Jun", deltaGood: true,
    series: [17.4, 21.9, 20.6, 19.4, 18.6, 19.0],
    color: EMERALD, goalLine: "18.0% · monthly", verdict: "ABOVE GOAL", gap: "1.0 pts", ok: true,
  },
  {
    key: "ocf", label: "Operating Cash Flow", goal: "$30K", month: "Jul 2026", value: "$32.7K",
    delta: "-3.7% vs Jun", deltaGood: false,
    series: [28.4, 44.9, 39.1, 36.2, 34.0, 32.7],
    color: EMERALD, goalLine: "$30K · monthly", verdict: "ABOVE GOAL", gap: "$2.7K", ok: true,
  },
  {
    key: "gm", label: "Gross Margin", goal: "70.0%", month: "Jul 2026", value: "69.7%",
    delta: "+0.8 pts vs Jun", deltaGood: true,
    series: [68.4, 69.6, 69.1, 68.7, 68.9, 69.7],
    color: AMBER, goalLine: "70.0% · monthly", verdict: "TO GOAL", gap: "0.3 pts", ok: false,
  },
  {
    key: "opex", label: "Operating Expenses (OpEx)", goal: "$72K", month: "Jul 2026", value: "$81.1K",
    delta: "-6.0% vs Jun", deltaGood: true,
    series: [79.8, 88.6, 87.4, 85.1, 86.3, 81.1],
    color: ROSE, goalLine: "$72K · monthly", verdict: "OVER BUDGET", gap: "$9.1K", ok: false,
  },
];

// The AI briefing. This is the one piece of prose in the tour we wrote rather
// than read off a screenshot, because the AI Insights tab ships empty until an
// account is connected. It only cites numbers that appear elsewhere here.
const BRIEF =
  "July closed at $178,865, down 6.6% from June, and your net margin still went up. Gross margin did the work: 69.7%, up 0.8 points, which more than covered operating expenses drifting to 45.4% of revenue. That drift is the line to watch. OpEx came in at $81,124 against your $72,000 goal, $9,124 over, in a month that earned less. The quiet win was collections. Receivables fell $11,668 and the bank went up $7,036, so a slower month still put cash in the account.";

// The two the briefing files behind the headline one, shown collapsed.
const MORE_FINDINGS: { tag: string; color: string; head: string }[] = [
  { tag: "Working", color: GREEN, head: "Collections turned a slower month into a cash month" },
  { tag: "Close", color: BLUE, head: "Gross margin is three tenths of a point off goal" },
];

const MOVED: { l: string; v: string; d: string; good: boolean }[] = [
  { l: "Revenue", v: "$178,865", d: "-6.6%", good: false },
  { l: "Gross margin", v: "69.7%", d: "+0.8 pts", good: true },
  { l: "OpEx", v: "$81,124", d: "$9,124 over goal", good: false },
  { l: "Receivables", v: "$164,556", d: "-$11,668", good: true },
  { l: "Bank accounts", v: "$484,410", d: "+$7,036", good: true },
  { l: "Net income", v: "$34,017", d: "19.0% margin", good: true },
];

// The Profit and Loss tab, July 2026, accrual basis. Straight off the
// screenshot, with Cost of Goods Sold left collapsed and the nine smallest
// expense accounts rolled into one row, so the whole statement fits the stage.
type PlRow = { k: "grp" | "shut" | "acct" | "tot" | "key" | "more"; l: string; v?: string; p?: string; star?: boolean };

const PL: PlRow[] = [
  { k: "grp", l: "Income" },
  { k: "acct", l: "Services Revenue", v: "98,068.00", p: "54.83 %" },
  { k: "acct", l: "Recurring Subscriptions", v: "46,102.00", p: "25.77 %" },
  { k: "acct", l: "Product Sales", v: "20,752.00", p: "11.60 %" },
  { k: "acct", l: "Training & Workshops", v: "13,943.00", p: "7.80 %" },
  { k: "tot", l: "Total Income", v: "$178,865.00", p: "100.00 %" },
  { k: "shut", l: "Cost of Goods Sold", v: "54,129.00", p: "30.26 %" },
  { k: "key", l: "GROSS PROFIT", v: "$124,736.00", p: "69.74 %", star: true },
  { k: "grp", l: "Expenses" },
  { k: "acct", l: "Salaries & Wages", v: "30,398.00", p: "16.99 %" },
  { k: "acct", l: "Payroll Taxes & Benefits", v: "8,171.00", p: "4.57 %" },
  { k: "acct", l: "Marketing", v: "7,529.00", p: "4.21 %" },
  { k: "acct", l: "Rent", v: "6,861.00", p: "3.84 %" },
  { k: "acct", l: "Software & Subscriptions", v: "5,862.00", p: "3.28 %" },
  { k: "acct", l: "Depreciation", v: "4,200.00", p: "2.35 %" },
  { k: "more", l: "8 more expense accounts", v: "18,103.00", p: "10.12 %" },
  { k: "tot", l: "Total Expenses", v: "81,124.00", p: "45.35 %", star: true },
  { k: "key", l: "NET OPERATING INCOME", v: "$43,612.00", p: "24.38 %" },
];

// Key Ratios, all seven, each with the target the product ships.
const RATIOS: { l: string; v: string; d: string; t: string; ok: boolean }[] = [
  { l: "Gross Margin", v: "69.7%", d: "Revenue minus cost of goods sold, divided by revenue", t: "Target: > 50%", ok: true },
  { l: "Net Profit Margin", v: "19.0%", d: "Net income divided by total revenue", t: "Target: > 10%", ok: true },
  { l: "Revenue per Employee", v: "$441,765", d: "Trailing 12-month revenue divided by headcount", t: "Higher is better", ok: true },
  { l: "Current Ratio", v: "10.68x", d: "Current assets divided by current liabilities", t: "Target: 1.5x to 3.0x", ok: true },
  { l: "Debt-to-Equity", v: "0.20x", d: "Total liabilities divided by total equity", t: "Target: < 2.0x", ok: true },
  { l: "OpEx Ratio", v: "45.4%", d: "Operating expenses excluding COGS, divided by revenue", t: "Lower is better", ok: false },
  { l: "Return on Assets", v: "4.0%", d: "Net income divided by total assets", t: "Target: > 5%", ok: false },
];

// Business Valuation, off the result screen rather than the wizard. Everything
// here is read from that screenshot: the headline, the range, the two floor
// figures, the twelve-month target, and the 2-Day CEO 4-P scorecard beneath it.
const VAL = {
  worth: "$1.37M",
  range: "$715K to $1.97M",
  industry: "B2B SaaS",
  multiple: "4.3x SDE",
  computed: "computed 8/27/2026",
  asset: "$206K",
  liq: "$113K",
  goal: "$2.06M",
  goalRaw: "2,057,550",
  lift: "$686K",
  liftPct: "50%",
  fill: 0.13, // where the goal slider sits
};

type Quad = {
  key: string;
  name: string;
  score: string;
  bar: string;
  track: string;
  bg: string;
  border: string;
  chip: string;
  ink: string;
  note?: string;
  subs: { l: string; v: number }[];
};

const QUADS: Quad[] = [
  {
    key: "people", name: "People", score: "3.0",
    bar: "#EA7A1F", track: "#F7DFC7", bg: "#FDF4EC", border: "#F2DCC3", chip: "#FBE3CE", ink: "#9A5416",
    note: "PEOPLE is the highest-impact area to improve.",
    subs: [
      { l: "Leadership Team", v: 2.3 },
      { l: "Culture & Growth", v: 3.3 },
      { l: "Team Accountability", v: 3.3 },
    ],
  },
  {
    key: "process", name: "Process", score: "3.2",
    bar: "#8B5CF6", track: "#E4D8FB", bg: "#F7F3FE", border: "#E2D6FB", chip: "#E9DFFD", ink: "#5B33C0",
    subs: [
      { l: "Standard Operating Procedures", v: 4.0 },
      { l: "Training & Development Processes", v: 3.0 },
      { l: "Business Software & Oversight", v: 2.7 },
    ],
  },
  {
    key: "product", name: "Product", score: "3.2",
    bar: "#2F6BD8", track: "#D6E2F6", bg: "#EFF4FC", border: "#D1DFF4", chip: "#DCE7F9", ink: "#1F4E9E",
    subs: [
      { l: "Core Customer & Marketing", v: 3.3 },
      { l: "Product / Core Strategy", v: 3.0 },
    ],
  },
  {
    key: "plan", name: "Plan", score: "3.3",
    bar: "#10A870", track: "#CFEDDF", bg: "#EDF9F2", border: "#C9E9D9", chip: "#D6F0E2", ink: "#0B7A50",
    subs: [
      { l: "One Page Plan", v: 3.7 },
      { l: "Metrics & KPIs", v: 3.0 },
      { l: "Financials", v: 3.3 },
    ],
  },
];

// What the sync ticks through once the password clears. The first three are
// verbatim from the consent modal; the ledger line matches the Transactions tab.
const SYNC_STEPS = [
  { l: "Chart of Accounts", m: "142 accounts" },
  { l: "Profit & Loss", m: "6 months" },
  { l: "Balance Sheet", m: "6 months" },
  { l: "Transactions", m: "4,430 lines" },
  { l: "Building your dashboards", m: "Big Six, ratios, briefing" },
];

// ---------------------------------------------------------------- scene
type View = "lock" | "sync" | "big" | "brief" | "pl" | "ratios" | "val";

type Scene = {
  view: View;
  hot: string;
  pw: number; // characters typed into the Finance HQ password
  unlocking: boolean;
  step: number; // how many QuickBooks sync steps have completed
  tiles: number; // how many of the Big Six have landed
  spark: boolean; // the sparklines drawn
  brief: string;
  briefDone: boolean;
  pillars: boolean; // the valuation sliders filled
  valued: boolean; // the value range revealed
  vpage: number; // how far the Business Valuation screen has scrolled, 0 to 2
  dim: boolean; // the whole card faded out, so the loop restarts softly
};

const PW_LEN = 11;

const BLANK: Scene = {
  view: "lock", hot: "", pw: 0, unlocking: false, step: 0,
  tiles: 0, spark: false, brief: "", briefDone: false,
  pillars: false, valued: false, vpage: 0, dim: false,
};

// Under prefers-reduced-motion: the Big Picture, landed. That is the screen the
// loop exists to reach, and it is the one that carries the whole promise.
const STILL: Scene = {
  ...BLANK, view: "big", pw: PW_LEN, step: SYNC_STEPS.length, tiles: BIG6.length, spark: true,
};

// ---------------------------------------------------------------- component
export default function CfoAnalyticsHeroTour() {
  const hostRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<SVGSVGElement>(null);
  const rippleRef = useRef<HTMLSpanElement>(null);

  const inView = useInView(hostRef, { margin: "-60px" });
  const reduce = useReducedMotion() ?? false;

  const [scene, setScene] = useState<Scene>(reduce ? STILL : BLANK);
  const [scaled, setScaled] = useState(false);
  const [scale, setScale] = useState(1);
  const [boxH, setBoxH] = useState<number | undefined>(undefined);

  const runRef = useRef(0);
  const scaleRef = useRef(1);
  const posRef = useRef({ x: 190, y: 60 });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const measure = () => {
      const hw = host.clientWidth;
      if (hw <= 0) return;
      if (hw >= MIN_W) {
        scaleRef.current = 1;
        setScale(1);
        setScaled(false);
      } else {
        const s = hw / MIN_W;
        scaleRef.current = s;
        setScale(s);
        setScaled(true);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(host);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const upd = () => {
      const s = scaleRef.current;
      setBoxH(s < 1 ? stage.offsetHeight * s : undefined);
    };
    upd();
    const ro = new ResizeObserver(upd);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [scale]);

  useEffect(() => {
    if (reduce) {
      setScene(STILL);
      return;
    }
    if (!inView) return;

    const gen = ++runRef.current;
    const alive = () => gen === runRef.current;
    const wait = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));
    const patch = (p: Partial<Scene>) => {
      if (alive()) setScene((s) => ({ ...s, ...p }));
    };

    const setCursor = (x: number, y: number) => {
      posRef.current = { x, y };
      if (cursorRef.current) cursorRef.current.style.transform = `translate(${x}px,${y}px)`;
    };

    const pointAt = (key: string) => {
      const stage = stageRef.current;
      const node = cardRef.current?.querySelector(`[data-t="${key}"]`);
      if (!stage || !node) return posRef.current;
      const s = stage.getBoundingClientRect();
      const t = node.getBoundingClientRect();
      const k = scaleRef.current || 1;
      return {
        x: (t.left - s.left) / k + t.width / k / 2,
        y: (t.top - s.top) / k + t.height / k / 2,
      };
    };

    const glide = async (pt: { x: number; y: number }, dur = 620) => {
      const c = cursorRef.current;
      const from = posRef.current;
      if (!c) return;
      const a = c.animate(
        [{ transform: `translate(${from.x}px,${from.y}px)` }, { transform: `translate(${pt.x}px,${pt.y}px)` }],
        { duration: dur, easing: EASE, fill: "forwards" },
      );
      try { await a.finished; } catch { /* cancelled */ }
      a.cancel();
      setCursor(pt.x, pt.y);
    };

    const click = async () => {
      const c = cursorRef.current;
      const r = rippleRef.current;
      const { x, y } = posRef.current;
      const anims: Animation[] = [];
      if (r) {
        r.style.left = `${x}px`;
        r.style.top = `${y}px`;
        anims.push(r.animate(
          [{ transform: "scale(.35)", opacity: 0.95 }, { transform: "scale(1.5)", opacity: 0 }],
          { duration: 440, easing: "ease-out" },
        ));
      }
      if (c) {
        anims.push(c.animate([
          { transform: `translate(${x}px,${y}px) scale(1)` },
          { transform: `translate(${x}px,${y}px) scale(.82)` },
          { transform: `translate(${x}px,${y}px) scale(1)` },
        ], { duration: 230, easing: "ease-out" }));
      }
      try { await Promise.all(anims.map((a) => a.finished)); } catch { /* cancelled */ }
      anims.forEach((a) => a.cancel());
      setCursor(x, y);
    };

    const fade = async (to: number, dur = 260) => {
      const c = cursorRef.current;
      if (!c) return;
      const a = c.animate([{ opacity: c.style.opacity || "0" }, { opacity: `${to}` }],
        { duration: dur, fill: "forwards" });
      try { await a.finished; } catch { /* cancelled */ }
      if (alive()) c.style.opacity = `${to}`;
    };

    const tap = async (key: string, dur = 620, hold = 280) => {
      await glide(pointAt(key), dur);
      if (!alive()) return false;
      patch({ hot: key });
      await wait(hold);
      if (!alive()) return false;
      await click();
      patch({ hot: "" });
      return alive();
    };

    (async function loop() {
      setCursor(190, 60);
      let first = true;
      while (alive()) {
        if (first) {
          setScene({ ...BLANK });
          first = false;
        } else {
          // Come back to the lock screen behind the fade that ended the last
          // pass, then bring the card up rather than cutting to it.
          setScene({ ...BLANK, dim: true });
          await wait(90);
          patch({ dim: false });
          await wait(460);
          if (!alive()) return;
        }
        await fade(1);

        // --- 1. the second password, before anything opens
        await wait(1600);
        if (!(await tap("pw", 720, 220))) return;
        for (let i = 1; i <= PW_LEN; i++) {
          patch({ pw: i });
          await wait(88);
          if (!alive()) return;
        }
        await wait(340);
        if (!(await tap("unlock", 540))) return;
        patch({ unlocking: true });
        await wait(760);

        // --- 2. and only then does it go and get the books
        patch({ view: "sync", unlocking: false });
        await fade(0);
        await wait(480);
        for (let i = 0; i < SYNC_STEPS.length; i++) {
          patch({ step: i + 1 });
          await wait(425);
          if (!alive()) return;
        }
        await wait(620);
        patch({ view: "big" });
        await wait(420);

        // --- 3. the Big Six, each one against a goal the owner set
        for (let i = 0; i < BIG6.length; i++) {
          patch({ tiles: i + 1 });
          await wait(115);
          if (!alive()) return;
        }
        patch({ spark: true });
        await wait(2100);
        await fade(1);

        // --- 4. the AI briefing, which is the beat that says CFO
        if (!(await tap("sub-brief", 640))) return;
        patch({ view: "brief" });
        await wait(480);
        for (let i = 1; i <= BRIEF.length; i += 3) {
          if (!alive()) return;
          patch({ brief: BRIEF.slice(0, i) });
          await wait(9);
        }
        patch({ brief: BRIEF, briefDone: true });
        await wait(2600);

        // --- 5. the whole P&L, the way the product renders it
        if (!(await tap("tab-pl", 660))) return;
        patch({ view: "pl" });
        await wait(2800);

        // --- 6. seven ratios, each against its own target
        if (!(await tap("tab-ratios", 600))) return;
        patch({ view: "ratios" });
        await wait(2200);

        // --- 7. and the business valuation is in here too
        if (!(await tap("tab-val", 640))) return;
        patch({ view: "val" });
        await wait(900);
        patch({ valued: true }); // the headline number lands first
        await wait(800);
        patch({ pillars: true }); // then the target and the scorecard fill in
        await wait(2400);

        // ...and the screen carries on below the fold, so scroll it
        patch({ vpage: 1 }); // the eleven sub-categories, and the trajectory
        await wait(2900);
        patch({ vpage: 2 }); // the executive summary, and what to do about it
        await wait(3800);

        if (!alive()) return;

        // --- and out. The card fades before the loop restarts rather than
        // cutting straight back to the lock screen.
        patch({ dim: true });
        await fade(0);
        await wait(620);
      }
    })();

    return () => {
      runRef.current++;
      cursorRef.current?.getAnimations().forEach((a) => a.cancel());
      rippleRef.current?.getAnimations().forEach((a) => a.cancel());
    };
  }, [inView, reduce]);

  return (
    <div ref={hostRef} className="w-full">
      <div style={{ height: boxH }}>
        <div
          ref={stageRef}
          className="relative"
          style={{
            width: scaled ? MIN_W : "100%",
            transform: scaled ? `scale(${scale})` : undefined,
            transformOrigin: "top left",
          }}
        >
          <div
            ref={cardRef}
            className="relative overflow-hidden rounded-2xl border border-black/5 bg-[#FAF9F7] text-brand-ink shadow-[0_30px_60px_-30px_rgba(40,30,15,0.45),0_2px_6px_-3px_rgba(40,30,15,0.12)] transition-opacity duration-[520ms] ease-out"
            style={{ height: STAGE_H, opacity: scene.dim ? 0 : 1 }}
          >
            {scene.view === "lock" ? (
              <LockView scene={scene} />
            ) : scene.view === "sync" ? (
              <SyncView scene={scene} />
            ) : (
              <Chrome scene={scene} />
            )}

            {scene.view !== "lock" && scene.view !== "sync" && (
              <span className="pointer-events-none absolute bottom-4 right-5 z-[50] flex items-center gap-1.5 rounded-full border border-[#F7D8B4] bg-white px-3 py-1.5 text-[11px] font-semibold text-brand-ink shadow-[0_10px_22px_-10px_rgba(40,30,15,0.5)]">
                <span className="grid h-[18px] w-[18px] place-items-center rounded-full bg-gradient-to-br from-[#F49230] to-[#DE6F14] text-white">
                  <Spark className="h-[10px] w-[10px]" />
                </span>
                Ask Multi AI
              </span>
            )}
          </div>

          <span
            ref={rippleRef}
            aria-hidden="true"
            className="pointer-events-none absolute z-[85] -m-[13px] h-[26px] w-[26px] rounded-full border-2 border-brand-orange opacity-0"
          />
          <svg
            ref={cursorRef}
            aria-hidden="true"
            viewBox="0 0 24 24"
            width="23"
            height="23"
            fill="#fff"
            stroke="#1B1A17"
            strokeWidth={1.4}
            strokeLinejoin="round"
            className="pointer-events-none absolute left-0 top-0 z-[90] opacity-0 [filter:drop-shadow(0_2px_3px_rgba(0,0,0,0.32))]"
          >
            <path d="M5 3l14 8-6 1.5 3.5 6-2.8 1.6-3.5-6L7 18z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- view: locked
// Finance HQ sits behind a password of its own, on top of the Multiply OS login.
// This is the first thing the loop shows, because "who else can see this" is the
// first question anybody asks about a page with their books on it.
function LockView({ scene }: { scene: Scene }) {
  return (
    <div className="sop-view relative grid h-full place-items-center px-8">
      <span
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(120% 90% at 50% 0%, #ECF6F1 0%, #FAF9F7 62%)" }}
      />

      <div className="relative w-[520px] text-center">
        <span
          className="mx-auto grid h-[52px] w-[52px] place-items-center rounded-2xl text-white"
          style={{ background: `linear-gradient(150deg, ${EMERALD}, ${GREEN})`, boxShadow: "0 14px 26px -14px rgba(15,123,79,0.85)" }}
        >
          <Lock className="h-[25px] w-[25px]" />
        </span>

        <h3 className="mt-3.5 text-[21px] font-extrabold tracking-tight">Finance HQ is locked</h3>
        <p className="mx-auto mt-1.5 max-w-[366px] text-[11.5px] leading-relaxed text-brand-charcoal">
          Your books sit behind a second password, set separately from the one you use to sign in to
          Multiply OS. Being logged in is not enough.
        </p>

        <div className="mt-4 rounded-xl border border-[#E6E2DB] bg-white p-3.5 text-left shadow-[0_16px_34px_-22px_rgba(40,30,15,0.5)]">
          <p className="text-[8.5px] font-bold uppercase tracking-[0.13em] text-brand-gray">
            Finance HQ password
          </p>
          <div
            data-t="pw"
            className="mt-1.5 flex items-center gap-2 rounded-lg border bg-[#FAF9F7] px-2.5 py-2 transition-all duration-200"
            style={
              scene.pw > 0 || scene.hot === "pw"
                ? { borderColor: "rgba(15,123,79,0.45)", background: "#fff", boxShadow: "0 0 0 3px rgba(15,123,79,0.12)" }
                : { borderColor: "#E6E2DB" }
            }
          >
            <Lock className="h-3.5 w-3.5 flex-none text-brand-gray" />
            <span className="flex min-w-0 flex-1 items-center gap-[3px]">
              {Array.from({ length: scene.pw }).map((_, i) => (
                <span key={i} className="h-[6px] w-[6px] rounded-full bg-brand-ink" />
              ))}
              {scene.pw === 0 && (
                <span className="text-[11px] text-brand-gray">Enter your Finance HQ password</span>
              )}
              {scene.pw > 0 && !scene.unlocking && <span className="tour-caret" />}
            </span>
            <EyeOff className="h-3.5 w-3.5 flex-none text-brand-gray" />
          </div>

          <div
            data-t="unlock"
            className={`mt-2.5 flex items-center justify-center gap-2 rounded-lg py-2 text-[12.5px] font-semibold text-white transition-all duration-200 ${
              scene.hot === "unlock" ? "shadow-[0_0_0_3px_rgba(234,123,27,0.4)]" : ""
            }`}
            style={{ background: scene.pw > 0 ? GREEN : "#C9C2B6" }}
          >
            {scene.unlocking ? (
              <>
                <Spin className="sop-spin h-3.5 w-3.5" />
                Verifying
              </>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5" />
                Unlock Finance HQ
              </>
            )}
          </div>
        </div>

        <div className="mt-3.5 flex items-center justify-center gap-1.5">
          {["Separate from your login", "Nothing loads until it opens", "Read-only books behind it"].map((t) => (
            <span
              key={t}
              className="flex items-center gap-1 rounded-full border border-[#DCE9E2] bg-white px-2 py-1 text-[9px] font-semibold text-brand-charcoal"
            >
              <Shield className="h-[10px] w-[10px]" style={{ color: GREEN }} />
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- view: syncing
// Straight after the password clears, before any of the app is drawn. This is
// the beat that makes "connect QuickBooks and get a CFO" a sequence rather than
// a claim: the reader watches the books arrive.
function SyncView({ scene }: { scene: Scene }) {
  const pct = (scene.step / SYNC_STEPS.length) * 100;
  const done = scene.step >= SYNC_STEPS.length;

  return (
    <div className="sop-view relative grid h-full place-items-center px-8">
      <span
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(120% 90% at 50% 0%, #ECF6F1 0%, #FAF9F7 62%)" }}
      />

      <div className="relative w-[430px]">
        <div className="text-center">
          <span
            className="mx-auto grid h-[48px] w-[48px] place-items-center rounded-2xl text-white"
            style={{
              background: `linear-gradient(150deg, ${EMERALD}, ${GREEN})`,
              boxShadow: "0 14px 26px -14px rgba(15,123,79,0.85)",
            }}
          >
            {done ? <Tick className="h-[24px] w-[24px]" /> : <Plug className="h-[23px] w-[23px]" />}
          </span>
          <h3 className="mt-3 text-[19px] font-extrabold tracking-tight">
            {done ? "Your books are in" : "Syncing with QuickBooks"}
          </h3>
          <p className="mx-auto mt-1 max-w-[340px] text-[11px] leading-relaxed text-brand-charcoal">
            {done
              ? "Six months of history, read and ready. Building the dashboards now."
              : "Pulling six months of history in one read-only sync. This runs once, then again every month at close."}
          </p>
        </div>

        <div className="mt-3 flex items-center gap-2.5">
          <span className="h-[6px] min-w-0 flex-1 overflow-hidden rounded-full bg-[#E9E5DE]">
            <span
              className="block h-full rounded-full transition-[width] duration-500 ease-out"
              style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${EMERALD}, ${GREEN})` }}
            />
          </span>
          <b className="flex-none font-mono text-[9.5px] tabular-nums" style={{ color: GREEN }}>
            {Math.round(pct)}%
          </b>
        </div>

        <div className="mt-2.5 space-y-1">
          {SYNC_STEPS.map((s, i) => {
            const ok = scene.step > i;
            const now = scene.step === i;
            return (
              <div
                key={s.l}
                className="flex items-center gap-2.5 rounded-lg border px-2.5 py-[6px] transition-all duration-300"
                style={
                  ok
                    ? { borderColor: "rgba(15,123,79,0.28)", background: "#F4FAF7" }
                    : { borderColor: "#EBE7E0", background: "#fff", opacity: now ? 1 : 0.5 }
                }
              >
                <span
                  className="grid h-[16px] w-[16px] flex-none place-items-center rounded-full transition-colors duration-300"
                  style={ok ? { background: GREEN, color: "#fff" } : { border: "1.5px solid #D5D0C7" }}
                >
                  {ok ? <Tick className="h-[9px] w-[9px]" /> : now ? <Spin className="sop-spin h-[9px] w-[9px] text-brand-gray" /> : null}
                </span>
                <span className="min-w-0 flex-1 truncate text-[10.5px] font-semibold">{s.l}</span>
                <span className="flex-none font-mono text-[8.5px] text-brand-gray">{s.m}</span>
              </div>
            );
          })}
        </div>

        <p className="mt-2.5 flex items-center justify-center gap-1.5 text-[9.5px] font-semibold text-brand-charcoal">
          <Shield className="h-3 w-3" style={{ color: GREEN }} />
          Read-only. Nothing is ever written back to your books.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- the app shell
const TABS = [
  { key: "cfo", label: "CFO View", icon: Board },
  { key: "over", label: "Overview", icon: Bars },
  { key: "pl", label: "Profit and Loss", icon: Pulse },
  { key: "bs", label: "Balance Sheet", icon: Scale },
  { key: "ratios", label: "Key Ratios", icon: Pct },
  { key: "tx", label: "Transactions", icon: Ledger },
  { key: "class", label: "Class", icon: Layers },
  { key: "ai", label: "AI Insights", icon: Brain },
  { key: "val", label: "Business Valuation", icon: Gem },
];

const SUBS = [
  { key: "brief", label: "AI Briefing", icon: Spark },
  { key: "big", label: "Big Picture", icon: Bars },
  { key: "keys", label: "Key Numbers", icon: Target },
  { key: "exp", label: "Expenses", icon: Ledger },
  { key: "ccc", label: "CCC", icon: Pie },
  { key: "wi", label: "What-If", icon: Pct },
  { key: "warn", label: "Warnings", icon: Bell },
  { key: "trend", label: "Trends", icon: Pulse },
];

function Chrome({ scene }: { scene: Scene }) {
  const cfoView = scene.view === "big" || scene.view === "brief";
  const activeTab = cfoView ? "cfo" : scene.view === "pl" ? "pl" : scene.view === "ratios" ? "ratios" : "val";

  return (
    <div className="flex h-full flex-col px-6 pb-[46px] pt-5">
      {/* title row */}
      <div className="flex flex-none items-start gap-3">
        <span className="min-w-0 flex-1">
          <h3 className="text-[20px] font-extrabold leading-none tracking-tight">Finance HQ</h3>
          <p className="mt-[3px] text-[9.5px] font-medium text-brand-gray">CFO-Grade Analytics</p>
        </span>
        <span className="flex flex-none items-center gap-1.5">
          {[
            { l: "Set Goals", I: Target },
            { l: "Share", I: Share },
            { l: "Shared P&Ls", I: Pie },
            { l: "Settings", I: Cog },
          ].map(({ l, I }) => (
            <span
              key={l}
              className="flex items-center gap-1.5 rounded-lg border border-[#E6E2DB] bg-white px-2.5 py-[5px] text-[10px] font-semibold text-brand-charcoal"
            >
              <I className="h-[11px] w-[11px]" />
              {l}
            </span>
          ))}
        </span>
      </div>

      {/* period controls */}
      <div className="mt-2.5 flex flex-none items-center gap-2">
        <span className="flex items-center gap-1.5 rounded-lg border border-[#CFE7DA] bg-[#F3FAF6] px-2.5 py-[5px]">
          <Cal className="h-[11px] w-[11px]" style={{ color: GREEN }} />
          <span className="text-[8px] font-bold uppercase tracking-[0.1em] text-brand-gray">
            Report timeframe
          </span>
          <b className="text-[10px]">Last Month</b>
          <Caret className="h-[9px] w-[9px] text-brand-gray" />
        </span>
        <span className="flex items-center gap-1.5 rounded-lg border border-[#CFE7DA] bg-[#F3FAF6] px-2.5 py-[5px]">
          <Lock className="h-[11px] w-[11px]" style={{ color: GREEN }} />
          <span className="text-[8px] font-bold uppercase tracking-[0.1em] text-brand-gray">
            Last closed month
          </span>
          <b className="text-[10px]">Jul 26</b>
          <Caret className="h-[9px] w-[9px] text-brand-gray" />
        </span>
        <span className="flex items-center gap-1.5 rounded-lg bg-brand-orange px-3 py-[6px] text-[10.5px] font-semibold text-white shadow-[0_8px_18px_-10px_rgba(234,123,27,0.9)]">
          <Spark className="h-3 w-3" />
          Ask CFO Coach
        </span>
        <span className="ml-auto flex items-center gap-1.5 text-[9.5px] font-semibold" style={{ color: GREEN }}>
          <span className="h-[6px] w-[6px] rounded-full" style={{ background: GREEN }} />
          QuickBooks synced 4m ago
        </span>
      </div>

      {/* the nine tabs */}
      <div className="mt-2.5 flex flex-none items-center gap-0.5 rounded-lg bg-[#F1EEE9] p-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          const on = t.key === activeTab;
          const key = t.key === "pl" ? "tab-pl" : t.key === "ratios" ? "tab-ratios" : t.key === "val" ? "tab-val" : undefined;
          return (
            <span
              key={t.key}
              data-t={key}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-[7px] px-2.5 py-[5px] text-[10.5px] transition-all duration-200 ${
                on ? "bg-white font-bold shadow-[0_1px_3px_rgba(40,30,15,0.14)]" : "font-medium text-brand-charcoal"
              } ${key && scene.hot === key ? "bg-[#FFF1E0] shadow-[0_0_0_2px_rgba(234,123,27,0.35)]" : ""}`}
            >
              <Icon className="h-3 w-3" />
              {t.label}
            </span>
          );
        })}
      </div>

      {/* CFO View has its own strip of eight */}
      {cfoView && (
        <div className="mt-2 flex flex-none items-center gap-3 border-b border-[#EBE7E0] pb-1.5">
          {SUBS.map((s) => {
            const Icon = s.icon;
            const on = (scene.view === "brief" && s.key === "brief") || (scene.view === "big" && s.key === "big");
            return (
              <span
                key={s.key}
                data-t={s.key === "brief" ? "sub-brief" : undefined}
                className={`flex items-center gap-1 whitespace-nowrap rounded-[5px] px-1 text-[9.5px] transition-all duration-200 ${
                  on ? "font-bold" : "font-medium text-brand-gray"
                } ${scene.hot === "sub-brief" && s.key === "brief" ? "bg-[#FFF1E0] shadow-[0_0_0_2px_rgba(234,123,27,0.3)]" : ""}`}
                style={on ? { color: GREEN } : undefined}
              >
                <Icon className="h-[11px] w-[11px]" />
                {s.label}
              </span>
            );
          })}
          <span className="ml-auto flex items-center gap-1 text-[9.5px] font-medium text-brand-gray">
            <Cog className="h-[11px] w-[11px]" />
            Customize
          </span>
        </div>
      )}

      <div className="mt-2.5 min-h-0 flex-1">
        {scene.view === "big" && <BigView scene={scene} />}
        {scene.view === "brief" && <BriefView scene={scene} />}
        {scene.view === "pl" && <PlView />}
        {scene.view === "ratios" && <RatiosView />}
        {scene.view === "val" && <ValView scene={scene} />}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- view: Big Picture
function BigView({ scene }: { scene: Scene }) {
  return (
    <div className="sop-view flex h-full flex-col gap-2">
      <div className="flex flex-none items-center gap-2.5">
        <span className="grid h-[18px] w-[18px] place-items-center rounded-full border border-[#E6E2DB] bg-white">
          <Chev className="h-[9px] w-[9px] rotate-180 text-brand-charcoal" />
        </span>
        <span className="min-w-0">
          <p className="text-[14.5px] font-extrabold leading-none tracking-tight">
            Big Picture <span className="font-semibold text-brand-gray">&middot; Jul 2026</span>
          </p>
          <p className="mt-[3px] text-[9.5px] text-brand-charcoal">
            The Big Six. Every metric measured against a goal you set yourself.
          </p>
        </span>
        <span className="ml-auto flex flex-none items-center gap-1.5">
          <span className="flex items-center gap-1.5 rounded-lg border border-[#CFE7DA] bg-[#F3FAF6] px-2.5 py-1">
            <Heart className="h-3 w-3" style={{ color: GREEN }} />
            <span className="text-[7.5px] font-bold uppercase tracking-[0.1em] text-brand-gray">
              Health score
            </span>
            <b className="text-[12px] tabular-nums">
              79<span className="text-[8px] font-semibold text-brand-gray">/100</span>
            </b>
          </span>
          <span className="flex items-center gap-1.5 rounded-lg border border-[#E6E2DB] bg-white px-2.5 py-1">
            <Bell className="h-3 w-3 text-brand-gray" />
            <span className="text-[7.5px] font-bold uppercase tracking-[0.1em] text-brand-gray">
              Active warnings
            </span>
            <b className="text-[12px] tabular-nums">0</b>
          </span>
        </span>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-3 grid-rows-2 gap-2">
        {BIG6.map((t, i) => (
          <MetricCard key={t.key} t={t} shown={scene.tiles > i} draw={scene.spark} />
        ))}
      </div>
    </div>
  );
}

function MetricCard({ t, shown, draw }: { t: Big; shown: boolean; draw: boolean }) {
  const verdictColor = t.ok ? GREEN : t.verdict === "OVER BUDGET" ? RED : AMBER;
  return (
    <div
      className="flex min-h-0 flex-col rounded-xl border bg-white px-2.5 py-2 transition-all duration-300"
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(6px)",
        borderColor: t.ok
          ? "rgba(18,168,112,0.34)"
          : t.verdict === "OVER BUDGET"
            ? "rgba(219,90,107,0.4)"
            : "rgba(208,145,44,0.42)",
      }}
    >
      <p className="flex flex-none items-start gap-1.5">
        <span className="min-w-0 flex-1 truncate text-[8.5px] font-bold uppercase tracking-[0.09em] text-brand-charcoal">
          {t.label}
        </span>
        <span
          className="flex flex-none items-center gap-1 rounded-full px-1.5 py-px text-[8px] font-bold tabular-nums"
          style={{ background: "rgba(75,60,196,0.09)", color: AI }}
        >
          <Target className="h-[8px] w-[8px]" />
          {t.goal}
        </span>
      </p>
      <p className="mt-[2px] flex-none text-[8px] text-brand-gray">{t.month}</p>

      <p className="mt-[2px] flex flex-none items-baseline gap-1.5">
        <span className="text-[18px] font-extrabold leading-none tracking-tight tabular-nums">{t.value}</span>
        <span
          className="rounded-[4px] px-1 py-px text-[8px] font-bold tabular-nums"
          style={{
            background: t.deltaGood ? "rgba(18,168,112,0.13)" : "rgba(192,64,43,0.11)",
            color: t.deltaGood ? GREEN : RED,
          }}
        >
          {t.deltaGood ? "↗" : "↘"} {t.delta}
        </span>
      </p>

      <div className="mt-1 min-h-0 flex-1">
        <Spark6 id={t.key} vals={t.series} color={t.color} on={draw} />
      </div>

      <div className="mt-1 flex flex-none items-end gap-2 border-t border-[#F1EEE9] pt-1">
        <span className="min-w-0 flex-1">
          <span className="block text-[7px] font-bold uppercase tracking-[0.11em] text-brand-gray">Goal</span>
          <span className="block truncate text-[9px] font-semibold text-brand-charcoal">{t.goalLine}</span>
        </span>
        <span className="flex-none text-right">
          <span className="block text-[7px] font-bold uppercase tracking-[0.11em]" style={{ color: verdictColor }}>
            {t.verdict}
          </span>
          <span className="block text-[9.5px] font-bold tabular-nums" style={{ color: verdictColor }}>
            {t.gap} {t.ok ? "✓" : ""}
          </span>
        </span>
      </div>
    </div>
  );
}

// A filled six-month sparkline. Each series is normalised inside its own range,
// because a metric that moves two points would otherwise read as a flat line.
function Spark6({ id, vals, color, on }: { id: string; vals: number[]; color: string; on: boolean }) {
  const W = 280;
  const H = 54;
  const lo = Math.min(...vals);
  const hi = Math.max(...vals);
  const pad = (hi - lo) * 0.34 || 1;
  const top = hi + pad;
  const bot = lo - pad;
  const pts = vals.map((v, i) => [
    (i / (vals.length - 1)) * W,
    H - ((v - bot) / (top - bot)) * H,
  ] as const);

  // Catmull-Rom through the points, converted to cubics, so the curve matches
  // the soft line the product draws rather than a polyline.
  let line = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    line += ` C${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }

  return (
    <div className="flex h-full flex-col">
      <svg viewBox={`0 0 ${W} ${H}`} className="min-h-0 w-full flex-1" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id={`sp-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.26" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0.34, 0.68].map((f) => (
          <line
            key={f}
            x1="0"
            x2={W}
            y1={f * H}
            y2={f * H}
            stroke="#F2EFEA"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <path
          d={`${line} L${W} ${H} L0 ${H} Z`}
          fill={`url(#sp-${id})`}
          style={{ opacity: on ? 1 : 0, transition: "opacity .6s ease .35s" }}
        />
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          className={`tour-series ${on ? "tour-series-draw" : ""}`}
        />
      </svg>
      <div className="mt-[2px] flex flex-none justify-between">
        {M6.map((m) => (
          <span key={m} className="font-mono text-[6.5px] text-brand-gray">{m}</span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- view: AI Briefing
function BriefView({ scene }: { scene: Scene }) {
  return (
    <div className="sop-view grid h-full grid-cols-[1.5fr_1fr] gap-2.5">
      <div
        className="flex min-h-0 flex-col overflow-hidden rounded-xl border bg-white"
        style={{ borderColor: "rgba(75,60,196,0.22)" }}
      >
        <p
          className="flex flex-none items-center gap-2 border-b px-3 py-2 text-[11px] font-bold"
          style={{ borderColor: "rgba(75,60,196,0.14)", background: "rgba(75,60,196,0.05)" }}
        >
          <span className="grid h-[18px] w-[18px] place-items-center rounded-md bg-gradient-to-br from-[#F49230] to-[#DE6F14] text-white">
            <Spark className="h-[10px] w-[10px]" />
          </span>
          AI Briefing
          <span className="ml-auto rounded-full border border-[#E6E2DB] px-2 py-px font-mono text-[8px] font-normal text-brand-gray">
            July 2026 close
          </span>
        </p>

        <div className="min-h-0 flex-1 px-3.5 py-3">
          <p className="flex items-center gap-1.5">
            <span
              className="rounded-full px-1.5 py-px font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-white"
              style={{ background: AMBER }}
            >
              Watch
            </span>
            <span className="text-[11.5px] font-bold">Revenue slipped. Your margin did not.</span>
          </p>
          <p className="mt-2 text-[11.5px] leading-relaxed text-brand-charcoal">
            {scene.brief}
            {!scene.briefDone && scene.brief.length > 0 && <span className="tour-caret" />}
          </p>

          {scene.briefDone && (
            <div className="sop-view">
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {[
                  { l: "Set an OpEx guardrail", c: GREEN },
                  { l: "Open the Expenses tab", c: GREEN },
                  { l: "Ask the CFO Coach", c: "#DE6F14" },
                ].map((a) => (
                  <span
                    key={a.l}
                    className="rounded-full border px-2 py-[3px] text-[9.5px] font-semibold"
                    style={{ borderColor: `${a.c}55`, color: a.c, background: `${a.c}0D` }}
                  >
                    {a.l}
                  </span>
                ))}
              </div>

              <p className="mt-3.5 text-[8px] font-bold uppercase tracking-[0.13em] text-brand-gray">
                Two more findings this month
              </p>
              <div className="mt-1.5 space-y-1">
                {MORE_FINDINGS.map((f) => (
                  <p
                    key={f.head}
                    className="flex items-center gap-2 rounded-lg border border-[#EBE7E0] bg-[#FAF9F7] px-2 py-[6px]"
                  >
                    <span
                      className="flex-none rounded-full px-1.5 py-px font-mono text-[7.5px] font-bold uppercase tracking-[0.08em] text-white"
                      style={{ background: f.color }}
                    >
                      {f.tag}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[10px] font-semibold">{f.head}</span>
                    <Chev className="h-[10px] w-[10px] flex-none text-brand-gray" />
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        <p className="flex-none border-t border-[#F1EEE9] px-3.5 py-1.5 text-[9px] text-brand-gray">
          Written by Anthropic Claude against your own ledger. Your data is not retained for training.
        </p>
      </div>

      <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-[#EBE7E0] bg-white">
        <p className="flex flex-none items-center gap-2 border-b border-[#F1EEE9] px-3 py-2 text-[11px] font-bold">
          What moved
          <span className="ml-auto font-mono text-[8.5px] font-normal text-brand-gray">vs Jun 2026</span>
        </p>
        <div className="flex-none divide-y divide-[#F5F2ED]">
          {MOVED.map((m) => (
            <p key={m.l} className="flex items-center gap-2 px-3 py-[7px]">
              <span className="min-w-0 flex-1 truncate text-[10px] text-brand-charcoal">{m.l}</span>
              <b className="flex-none text-[10px] tabular-nums">{m.v}</b>
              <span
                className="w-[74px] flex-none text-right text-[9px] font-bold tabular-nums"
                style={{ color: m.good ? GREEN : RED }}
              >
                {m.d}
              </span>
            </p>
          ))}
        </div>

        {/* the same health score the Big Picture carries, so the two views agree */}
        <div className="mt-auto flex-none border-t border-[#F1EEE9] px-3 py-2.5">
          <p className="flex items-baseline gap-2">
            <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-brand-gray">
              Health score
            </span>
            <b className="ml-auto text-[15px] tabular-nums">
              79<span className="text-[9px] font-semibold text-brand-gray">/100</span>
            </b>
          </p>
          <span className="mt-1.5 block h-[7px] w-full overflow-hidden rounded-full bg-[#F1EEE9]">
            <span className="block h-full w-[79%] rounded-full" style={{ background: EMERALD }} />
          </span>
          <p className="mt-1.5 text-[9px] leading-snug text-brand-gray">
            Four of the Big Six cleared their goals. Gross margin is close. OpEx is not.
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- view: Profit and Loss
function PlView() {
  return (
    <div className="sop-view flex h-full flex-col overflow-hidden rounded-xl border border-[#EBE7E0] bg-white">
      <div className="flex flex-none items-center gap-2 border-b border-[#F1EEE9] px-3 py-[7px]">
        <span className="flex w-[190px] items-center gap-1.5 rounded-lg border border-[#E6E2DB] bg-[#FAF9F7] px-2 py-1">
          <Search className="h-3 w-3 flex-none text-brand-gray" />
          <span className="truncate text-[9.5px] text-brand-gray">Search accounts &amp; transactions...</span>
        </span>
        <span className="flex items-center gap-1.5 rounded-lg bg-[#101828] px-2.5 py-1 text-[9.5px] font-semibold text-white">
          <EyeOff className="h-3 w-3" />
          Hide $0
        </span>
        <span className="flex items-center gap-1.5 rounded-lg border border-[#E6E2DB] bg-white px-2.5 py-1 text-[9.5px] font-semibold text-brand-charcoal">
          <Scale className="h-3 w-3" />
          Compare
          <Caret className="h-[9px] w-[9px] text-brand-gray" />
        </span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="rounded-lg border border-[#E6E2DB] bg-white px-2.5 py-1 text-[9.5px] font-semibold text-brand-charcoal">
            Collapse all
          </span>
          <span className="rounded-lg border border-[#E6E2DB] bg-white px-2.5 py-1 text-[9.5px] font-semibold text-brand-charcoal">
            Expand all
          </span>
        </span>
      </div>

      <div className="flex flex-none items-center gap-2 border-b border-[#F1EEE9] px-3 py-[5px]">
        <b className="text-[10.5px]">Profit and Loss</b>
        <span className="font-mono text-[8.5px] text-brand-gray">July 2026</span>
        <span className="font-mono text-[8.5px]" style={{ color: GREEN }}>Accrual basis</span>
        <span className="ml-auto w-[104px] text-right text-[8px] font-bold uppercase tracking-[0.11em] text-brand-gray">
          Total
        </span>
        <span className="w-[58px] text-right text-[8px] font-bold uppercase tracking-[0.11em] text-brand-gray">
          % Inc
        </span>
      </div>

      <div className="min-h-0 flex-1">
        {PL.map((r) => {
          const grp = r.k === "grp";
          const shut = r.k === "shut";
          const tot = r.k === "tot";
          const key = r.k === "key";
          const more = r.k === "more";
          return (
            <div
              key={r.l}
              className="flex items-center gap-2 border-t border-[#F7F4EF] px-3 py-[2px] leading-[11px]"
              style={tot || key ? { background: "#FAF9F7" } : undefined}
            >
              <span className="flex min-w-0 flex-1 items-center gap-1.5">
                {(grp || shut || r.k === "acct") && (
                  <Chev className={`h-[9px] w-[9px] flex-none text-brand-gray ${grp ? "rotate-90" : ""}`} />
                )}
                <span
                  className={`truncate ${
                    key
                      ? "text-[10px] font-extrabold tracking-[0.01em]"
                      : tot || grp || shut
                        ? "text-[10px] font-bold"
                        : "text-[10px] text-brand-charcoal"
                  } ${more ? "italic text-brand-gray" : ""}`}
                  style={r.k === "acct" || more ? { paddingLeft: 6 } : undefined}
                >
                  {r.l}
                </span>
                {(r.k === "acct" || key) && <Pulse className="h-[9px] w-[9px] flex-none text-[#C9C2B6]" />}
              </span>
              <span
                className={`w-[104px] flex-none text-right tabular-nums ${
                  key ? "text-[10.5px] font-extrabold" : tot || shut ? "text-[10px] font-bold" : "text-[10px]"
                }`}
              >
                {r.v}
              </span>
              <span className="flex w-[58px] flex-none items-center justify-end gap-1 text-[9.5px] tabular-nums text-brand-charcoal">
                {r.star && <span style={{ color: "#E0A32E" }}>&#9733;</span>}
                <span className={key || tot || shut ? "font-bold" : ""}>{r.p}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- view: Key Ratios
function RatiosView() {
  return (
    <div className="sop-view grid h-full grid-cols-4 grid-rows-2 gap-2">
      {RATIOS.map((r) => (
        <div
          key={r.l}
          className="flex min-h-0 flex-col justify-center rounded-xl border px-3 py-2.5"
          style={
            r.ok
              ? { borderColor: "rgba(18,168,112,0.3)", background: "#F4FBF7" }
              : { borderColor: "rgba(208,145,44,0.34)", background: "#FEFAF1" }
          }
        >
          <p className="flex items-center gap-1.5">
            <span className="h-[6px] w-[6px] flex-none rounded-full" style={{ background: r.ok ? EMERALD : AMBER }} />
            <span className="min-w-0 truncate text-[8.5px] font-bold uppercase tracking-[0.09em] text-brand-charcoal">
              {r.l}
            </span>
          </p>
          <p className="mt-1 text-[23px] font-extrabold leading-none tracking-tight tabular-nums">{r.v}</p>
          <p className="mt-1.5 text-[9.5px] leading-snug text-brand-charcoal">{r.d}</p>
          <p className="mt-1.5 text-[8.5px] font-semibold text-brand-gray">{r.t}</p>
        </div>
      ))}

      <div className="flex min-h-0 flex-col justify-center rounded-xl border border-dashed border-[#DDD8CF] bg-white px-3 py-2.5">
        <p className="flex items-center gap-1.5 text-[9.5px] font-bold" style={{ color: GREEN }}>
          <Target className="h-3 w-3" />
          Every ratio has a target
        </p>
        <p className="mt-1 text-[9.5px] leading-snug text-brand-charcoal">
          Green means you cleared it. Amber means you have not. Nobody has to remember what a healthy
          current ratio is.
        </p>
      </div>
    </div>
  );
}


// ---------------------------------------------------------------- view: Business Valuation
// The result screen, not the wizard, and it is three screens deep, so this beat
// scrolls rather than sitting still:
//
//   page 0  the headline number, the twelve-month target, the 4-P scorecard
//   page 1  the eleven sub-categories on one radar, and the value trajectory
//   page 2  the executive summary, and strengths / opportunities / risks
//
// The pages are absolutely positioned siblings translated by whole multiples of
// their own height, which is a real scroll rather than a cross-fade between
// tabs: page 1 slides up from below while page 0 slides out of the top.
function ValView({ scene }: { scene: Scene }) {
  const pages = [ValPageOne, ValPageTwo, ValPageThree];

  return (
    <div className="sop-view relative h-full overflow-hidden">
      {pages.map((Page, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-transform duration-[900ms] ease-out"
          style={{ transform: `translateY(${(i - scene.vpage) * 100}%)` }}
        >
          <Page scene={scene} />
        </div>
      ))}

      {/* the scroll position, so the movement reads as a page rather than a tab */}
      <span className="pointer-events-none absolute inset-y-1 right-0 w-[3px] rounded-full bg-[#EDEAE4]">
        <span
          className="block w-full rounded-full bg-[#C9C2B6] transition-transform duration-[900ms] ease-out"
          style={{ height: `${100 / pages.length}%`, transform: `translateY(${scene.vpage * 100}%)` }}
        />
      </span>
    </div>
  );
}

function ValPageOne({ scene }: { scene: Scene }) {
  return (
    <div className="flex h-full flex-col gap-1.5">
      {/* the headline band */}
      <div
        className="flex flex-none items-center gap-4 rounded-xl border border-[#D8D8DC] px-4 py-[9px]"
        style={{ background: "linear-gradient(100deg, #EBEBEE, #DCDCE1)" }}
      >
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.13em] text-[#5B5B63]">
            <Pulse className="h-[10px] w-[10px]" />
            Your business is worth
          </span>
          {scene.valued ? (
            <span className="sop-view block">
              <span className="flex items-baseline gap-2">
                <b className="text-[28px] font-extrabold leading-none tracking-tight tabular-nums">
                  {VAL.worth}
                </b>
                <span className="text-[8px] font-bold uppercase tracking-[0.13em]" style={{ color: "#B8860F" }}>
                  Estimated
                </span>
              </span>
              <span className="mt-1 block text-[9px] text-[#4B4B53]">
                Range: <b className="text-[#26262C]">{VAL.range}</b>
                <span className="mx-1.5 text-[#9A9AA2]">&middot;</span>
                {VAL.industry}
                <span className="mx-1.5 text-[#9A9AA2]">&middot;</span>
                {VAL.multiple}
                <span className="mx-1.5 text-[#9A9AA2]">&middot;</span>
                {VAL.computed}
              </span>
            </span>
          ) : (
            <span className="mt-2 flex items-center gap-2 text-[13px] font-semibold text-[#5B5B63]">
              <Spin className="sop-spin h-4 w-4" />
              Pricing the company off your own numbers
            </span>
          )}
        </span>

        <span className="flex flex-none flex-col items-end gap-2">
          <span className="flex items-center gap-1.5">
            <span className="flex items-center gap-1.5 rounded-lg bg-[#101828] px-2.5 py-[5px] text-[10px] font-semibold text-white">
              <Refresh className="h-3 w-3" />
              Recalculate Valuation
            </span>
            <span className="flex items-center gap-1.5 rounded-lg border border-[#C9C9CF] bg-white px-2.5 py-[5px] text-[10px] font-semibold text-brand-charcoal">
              <Pencil className="h-3 w-3" />
              Edit Evaluation
            </span>
          </span>
          <span
            className="flex items-center gap-1.5 transition-opacity duration-500"
            style={{ opacity: scene.valued ? 1 : 0 }}
          >
            {[
              { l: "Asset sale", v: VAL.asset },
              { l: "Liquidation", v: VAL.liq },
            ].map((c) => (
              <span key={c.l} className="rounded-lg border border-[#D8D8DC] bg-white px-2.5 py-1 text-center">
                <span className="block text-[7px] font-bold uppercase tracking-[0.11em] text-brand-gray">
                  {c.l}
                </span>
                <b className="block text-[13px] leading-tight tabular-nums">{c.v}</b>
              </span>
            ))}
          </span>
        </span>
      </div>

      {/* the twelve-month target */}
      <div
        className="flex flex-none items-center gap-3 rounded-xl border border-[#F0DFBE] px-3 py-[6px]"
        style={{ background: "linear-gradient(100deg, #FDF6E8, #FAEED6)" }}
      >
        <span className="grid h-[22px] w-[22px] flex-none place-items-center rounded-full bg-[#F7E3BD]">
          <Target className="h-3 w-3" style={{ color: "#B8860F" }} />
        </span>
        <span className="flex-none">
          <span className="block text-[7.5px] font-bold uppercase tracking-[0.12em] text-[#8A6B23]">
            12-month goal
          </span>
          <b className="block text-[15px] leading-none tracking-tight tabular-nums">{VAL.goal}</b>
        </span>

        <span className="relative mx-1 h-[6px] min-w-0 flex-1 rounded-full bg-[#EBE4D5]">
          <span
            className="block h-full rounded-full bg-[#101828] transition-[width] duration-700 ease-out"
            style={{ width: scene.pillars ? `${VAL.fill * 100}%` : "0%" }}
          />
          <span
            className="absolute top-1/2 h-[13px] w-[13px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#101828] bg-white transition-[left] duration-700 ease-out"
            style={{ left: scene.pillars ? `${VAL.fill * 100}%` : "0%" }}
          />
        </span>

        <span className="flex-none text-[9.5px] text-[#5B5348]">
          Required lift <b className="text-brand-ink">{VAL.lift}</b> ({VAL.liftPct})
        </span>
        <span className="flex flex-none items-center gap-1.5 rounded-lg bg-[#101828] px-3 py-[6px] text-[10px] font-semibold text-white">
          <Spark className="h-3 w-3" />
          Build 3-Year Roadmap
          <Chev className="h-[10px] w-[10px]" />
        </span>
      </div>

      {/* the 2-Day CEO 4-P scorecard */}
      <p className="flex flex-none items-baseline gap-2 leading-[12px]">
        <span className="flex-none text-[7.5px] font-bold uppercase tracking-[0.13em] text-brand-gray">
          2-Day CEO 4-P Scorecard
        </span>
        <b className="flex-none text-[11px] tracking-tight">Where you stand across the four quadrants</b>
        <span className="ml-auto truncate text-[9px] font-semibold" style={{ color: QUADS[0].ink }}>
          {QUADS[0].note}
        </span>
      </p>

      <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-2">
        {QUADS.map((q) => (
          <div
            key={q.key}
            className="flex min-h-0 flex-col rounded-xl border px-3 py-[7px]"
            style={{ background: q.bg, borderColor: q.border }}
          >
            <p className="flex flex-none items-center gap-2">
              <span className="grid h-[19px] w-[19px] flex-none place-items-center rounded-md" style={{ background: q.chip, color: q.ink }}>
                <Target className="h-[11px] w-[11px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[6.5px] font-bold uppercase tracking-[0.14em]" style={{ color: q.ink }}>
                  Quadrant
                </span>
                <span className="block text-[11px] font-extrabold uppercase leading-none tracking-[0.03em]">
                  {q.name}
                </span>
              </span>
              <span className="flex-none text-right">
                <b className="block text-[17px] font-extrabold leading-none tabular-nums">{q.score}</b>
                <span className="block text-[6.5px] font-semibold uppercase tracking-[0.1em] text-brand-gray">
                  out of 5.0
                </span>
              </span>
            </p>

            <div className="mt-1.5 min-h-0 flex-1 space-y-[2px]">
              {q.subs.map((s) => (
                <span key={s.l} className="block">
                  <span className="flex items-baseline gap-2 leading-[11px]">
                    <span className="min-w-0 flex-1 truncate text-[8.5px]" style={{ color: q.ink }}>
                      {s.l}
                    </span>
                    <b className="flex-none text-[8.5px] tabular-nums">{s.v.toFixed(1)}</b>
                  </span>
                  <span className="mt-[2px] block h-[3px] w-full overflow-hidden rounded-full" style={{ background: q.track }}>
                    <span
                      className="block h-full rounded-full transition-[width] duration-700 ease-out"
                      style={{ width: scene.pillars ? `${(s.v / 5) * 100}%` : "0%", background: q.bar }}
                    />
                  </span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- valuation, page 2
function ValPageTwo({ scene }: { scene: Scene }) {
  return (
    <div className="grid h-full grid-cols-2 gap-2.5 pr-2">
      {/* every sub-category on one radar */}
      <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-[#EBE7E0] bg-white px-3 py-2.5">
        <p className="flex-none text-[7.5px] font-bold uppercase tracking-[0.13em] text-brand-gray">
          Comparative self-evaluation
        </p>
        <p className="flex-none text-[12px] font-extrabold tracking-tight">
          11 Sub-categories at a glance
        </p>
        <div className="grid min-h-0 flex-1 place-items-center">
          <Radar11 on={scene.vpage >= 1} />
        </div>
      </div>

      {/* what the number has done since the first run */}
      <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-[#EBE7E0] bg-white px-3 py-2.5">
        <p className="flex-none text-[7.5px] font-bold uppercase tracking-[0.13em] text-brand-gray">
          Trajectory
        </p>
        <p className="flex-none text-[12px] font-extrabold tracking-tight">Value over time</p>
        <p className="mt-0.5 flex-none text-[9px] text-brand-charcoal">
          Re-runs monthly when QuickBooks syncs, plus every manual refresh and override.
        </p>
        <div className="min-h-0 flex-1 pt-2">
          <Trajectory on={scene.vpage >= 1} />
        </div>
      </div>
    </div>
  );
}

// The eleven sub-categories, in the order the product plots them: People
// clockwise from the top, then Plan, then Process, then Product.
const RADAR11: { l: string; v: number; c: string }[] = [
  { l: "Leadership Team", v: 2.3, c: "#EA7A1F" },
  { l: "Culture & Growth", v: 3.3, c: "#EA7A1F" },
  { l: "Team Accountability", v: 3.3, c: "#EA7A1F" },
  { l: "One Page Plan", v: 3.7, c: "#10A870" },
  { l: "Metrics & KPIs", v: 3.0, c: "#10A870" },
  { l: "Financials", v: 3.3, c: "#10A870" },
  { l: "Standard Operating Procedures", v: 4.0, c: "#8B5CF6" },
  { l: "Training & Development Processes", v: 3.0, c: "#8B5CF6" },
  { l: "Business Software & Oversight", v: 2.7, c: "#8B5CF6" },
  { l: "Core Customer & Marketing", v: 3.3, c: "#2F6BD8" },
  { l: "Product / Core Strategy", v: 3.0, c: "#2F6BD8" },
];

function Radar11({ on }: { on: boolean }) {
  const W = 300;
  const H = 210;
  const cx = W / 2;
  const cy = H / 2;
  const r = 66;
  const n = RADAR11.length;
  const at = (i: number, v: number) => {
    const a = (2 * Math.PI * i) / n - Math.PI / 2;
    const k = (v / 5) * r;
    return [cx + Math.cos(a) * k, cy + Math.sin(a) * k] as const;
  };
  const ring = (v: number) =>
    RADAR11.map((_, i) => at(i, v).map((x) => x.toFixed(1)).join(",")).join(" ");
  const poly = RADAR11.map((p, i) => at(i, on ? p.v : 0).map((x) => x.toFixed(1)).join(",")).join(" ");

  // Long labels get broken onto two lines at the space nearest the middle, the
  // way the product wraps them, so nothing runs off the edge of the box.
  const wrap = (s: string) => {
    if (s.length <= 15) return [s];
    const mid = s.length / 2;
    let best = -1;
    for (let i = 0; i < s.length; i++) {
      if (s[i] === " " && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
    }
    return best < 0 ? [s] : [s.slice(0, best), s.slice(best + 1)];
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((v) => (
        <polygon key={v} points={ring(v)} fill="none" stroke={v === 5 ? "#DDD8CF" : "#F2EFEA"} strokeWidth="1" />
      ))}
      {RADAR11.map((p, i) => {
        const [x, y] = at(i, 5);
        return <line key={p.l} x1={cx} y1={cy} x2={x} y2={y} stroke="#F2EFEA" strokeWidth="1" />;
      })}
      {[0, 1, 2, 3, 4, 5].map((v) => (
        <text key={v} x={cx + 3} y={cy - (v / 5) * r} fontSize="6" fill="#B5AFA5" dominantBaseline="middle">
          {v}
        </text>
      ))}

      <polygon
        points={poly}
        fill="#EA7A1F"
        fillOpacity="0.34"
        stroke="#EA7A1F"
        strokeWidth="1.4"
        strokeLinejoin="round"
        style={{ transition: "all .9s cubic-bezier(0.22,1,0.36,1)" }}
      />

      {RADAR11.map((p, i) => {
        const [x, y] = at(i, 6.35);
        const right = x > cx + 4;
        const left = x < cx - 4;
        const lines = wrap(p.l);
        return (
          <text
            key={p.l}
            x={x}
            y={y - (lines.length - 1) * 3.4}
            textAnchor={right ? "start" : left ? "end" : "middle"}
            dominantBaseline="middle"
            fontSize="5.6"
            fontWeight="700"
            fill={p.c}
          >
            {lines.map((ln, k) => (
              <tspan key={ln} x={x} dy={k === 0 ? 0 : 6.8}>
                {ln}
              </tspan>
            ))}
          </text>
        );
      })}
    </svg>
  );
}

// The valuation each time it has re-run. The axis matches the product's own.
const TRAJ = [1.02, 1.09, 1.18, 1.24, 1.31, 1.37];
const TRAJ_M = ["Mar 26", "Apr 26", "May 26", "Jun 26", "Jul 26", "Aug 26"];

function Trajectory({ on }: { on: boolean }) {
  const W = 300;
  const H = 110;
  const TOP = 1.4;
  const y = (v: number) => H - (v / TOP) * H;
  // Inset so the end marker sits inside the box rather than half off its edge.
  const pts = TRAJ.map((v, i) => [4 + (i / (TRAJ.length - 1)) * (W - 8), y(v)] as const);
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");

  return (
    <div className="flex h-full gap-1.5">
      <div className="flex flex-none flex-col justify-between py-[1px] text-right">
        {["$1.40M", "$1.05M", "$700K", "$350K", "$0"].map((t) => (
          <span key={t} className="font-mono text-[6.5px] text-brand-gray">{t}</span>
        ))}
      </div>
      <div className="relative flex min-w-0 flex-1 flex-col">
        {/* The marker is HTML, not SVG: the chart stretches on one axis only,
            so a circle drawn inside it would come out an oval. */}
        <span
          className="absolute z-10 -m-[3.5px] h-[7px] w-[7px] rounded-full border-2 border-[#12A870] bg-white transition-opacity duration-300"
          style={{
            left: `${(pts[pts.length - 1][0] / W) * 100}%`,
            top: `${(pts[pts.length - 1][1] / H) * (100 - 14)}%`,
            opacity: on ? 1 : 0,
            transitionDelay: "900ms",
          }}
        />
        <svg viewBox={`0 0 ${W} ${H}`} className="min-h-0 w-full flex-1" preserveAspectRatio="none" aria-hidden="true">
          {[0, 0.25, 0.5, 0.75, 1].map((f) => (
            <line
              key={f}
              x1="0"
              x2={W}
              y1={f * H}
              y2={f * H}
              stroke="#F2EFEA"
              strokeWidth="1"
              strokeDasharray="3 3"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {/* No area fill: the series sits high on a zero-based axis, so a
              filled region would read as a solid block rather than a trend. */}
          <path
            d={line}
            fill="none"
            stroke="#12A870"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            className={`tour-series ${on ? "tour-series-draw" : ""}`}
          />
        </svg>
        <div className="mt-1 flex flex-none justify-between">
          {TRAJ_M.map((m) => (
            <span key={m} className="font-mono text-[6.5px] text-brand-gray">{m}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- valuation, page 3
const SUMMARY =
  "At 63/100 overall and a $1.37M mid-point equity value, this three-year-old B2B SaaS business has a solid operational foundation: best-in-class SOPs, clean customer concentration, and no single-source supplier dependency. It is leaving value on the table through a weak leadership bench, an under-used software stack, and a gross revenue retention rate that triggers a high-severity buyer discount. The path to the upper end of the $1.97M range runs through closing the retention gap and showing the business runs without the owner. Fix the three lowest sub-categories, Leadership Team at 2.3, Business Software at 2.7 and Product / Core Strategy at 3.0, and the multiple expands before any transaction.";

const FINDING_COLS: {
  k: string;
  label: string;
  color: string;
  bg: string;
  items: { h: string; b: string }[];
}[] = [
  {
    k: "str", label: "Strengths", color: "#0F7B4F", bg: "rgba(18,168,112,0.1)",
    items: [
      {
        h: "Best-in-class SOPs for a three-year-old company",
        b: "A 4.0/5 score is rare at this stage. Documented process cuts key-person risk and speeds onboarding.",
      },
      {
        h: "Customer concentration is well managed",
        b: "Top customer at 10% and top three at 28%. Buyers rarely flag concentration below 20% for one account.",
      },
      {
        h: "No litigation, no single-source supplier",
        b: "Clean legal status and a diversified supply chain remove two of the most common deal-killers in diligence.",
      },
    ],
  },
  {
    k: "opp", label: "Opportunities", color: "#8B5CF6", bg: "rgba(139,92,246,0.1)",
    items: [
      {
        h: "Fix retention to neutralise the biggest discount",
        b: "Buyers in this category apply a 0.5x to 1.5x multiple haircut for gross revenue retention under 80%.",
      },
      {
        h: "Upgrade the software stack to improve oversight",
        b: "A 2.7/5 score suggests under-integrated tools, which is where the reporting blind spots come from.",
      },
      {
        h: "Sharpen Metrics & KPIs to tell a growth story",
        b: "At 3.0/5 the business cannot prove its own trajectory. Track it monthly and lenders can price toward the top.",
      },
    ],
  },
  {
    k: "risk", label: "Risks", color: "#C0402B", bg: "rgba(192,64,43,0.1)",
    items: [
      {
        h: "Retention below 80% is a deal-breaker-level flag",
        b: "The most acute risk in the evaluation. Lenders price it heavily and it caps the multiple outright.",
      },
      {
        h: "Too much of the company sits with the owner",
        b: "A full working week and no clear successor. Buyers answer that with a price cut or an earnout.",
      },
      {
        h: "A low-growth trend caps multiple expansion",
        b: "Three years of history without a compounding curve. Until growth accelerates the multiple stays near the mid-point.",
      },
    ],
  },
];

function ValPageThree({ scene }: { scene: Scene }) {
  return (
    <div className="flex h-full flex-col gap-2 pr-2">
      <div className="flex-none rounded-xl bg-[#F4F2EF] px-3.5 py-2.5">
        <p className="flex items-center gap-2">
          <span className="text-[7.5px] font-bold uppercase tracking-[0.13em] text-brand-gray">
            Executive summary
          </span>
          <span className="ml-auto flex items-center gap-1 text-[9px] font-semibold text-brand-charcoal">
            <Refresh className="h-3 w-3" />
            Refresh
          </span>
        </p>
        <p className="mt-1 text-[9.5px] leading-relaxed text-brand-charcoal">{SUMMARY}</p>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-3 gap-2">
        {FINDING_COLS.map((col) => (
          <div key={col.k} className="flex min-h-0 flex-col rounded-xl border border-[#EBE7E0] bg-white px-3 py-2.5">
            <span
              className="flex w-fit flex-none items-center gap-1 rounded-full px-2 py-[3px] text-[9px] font-bold"
              style={{ background: col.bg, color: col.color }}
            >
              {col.label}
            </span>
            <div className="mt-2 min-h-0 flex-1 space-y-2">
              {col.items.map((it, i) => (
                <div
                  key={it.h}
                  className="transition-all duration-500"
                  style={{
                    opacity: scene.vpage >= 2 ? 1 : 0,
                    transform: scene.vpage >= 2 ? "none" : "translateY(6px)",
                    transitionDelay: `${180 + i * 130}ms`,
                  }}
                >
                  <p className="text-[10px] font-bold leading-snug">{it.h}</p>
                  <p className="mt-0.5 text-[9px] leading-snug text-brand-charcoal">{it.b}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
