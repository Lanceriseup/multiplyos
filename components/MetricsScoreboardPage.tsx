"use client";

// Feature page: Metrics Scoreboard.
//
// Follows the client's brief, in order:
//   1. hero: the scoreboard view, as it really looks
//   2. click the little chart glyph on a row -> the trend chart opens
//   3. adding a metric/KPI
//   4. multiple scoreboards, one per team
//   5. weekly / monthly / quarterly views
//   6. (last, as on every feature page) how Multi AI reads this data for insights
//
// Mockups are hand-built in markup rather than screenshots so they stay crisp and
// themeable. Metric names mirror the real Tech Scoreboard; values are healthier
// than a live mid-week board so the page reads as a win, not a blank slate.
import { motion } from "framer-motion";
import { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CTA from "./CTA";
import Reveal from "./Reveal";
import ScoreboardHeroTour from "./ScoreboardHeroTour";
import MultiAiWired from "./MultiAiWired";
import { useDemo } from "./DemoModal";

// ---------------------------------------------------------------- tokens
const GREEN = "#2BA463";
const GREEN_BG = "#EAF7F0";
const RED = "#D8563F";
const RED_BG = "#FBEEEB";
const colTransition = { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const };

// ---------------------------------------------------------------- icons
const ico = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const ChartGlyph = ({ className }: { className?: string }) => (
  <svg className={className} {...ico} strokeWidth={1.9}>
    <path d="M4 19V5" />
    <path d="M4 19h16" />
    <path d="M7.5 15.4l3.2-3.7 2.6 2.2 4-4.8" />
  </svg>
);
// Clipboard-list, matching the Scoreboards icon in the live app. Used for the
// page badge only; ChartGlyph still marks "open this metric's trend".
const ScoreboardIcon = ({ className }: { className?: string }) => (
  <svg className={className} {...ico} strokeWidth={1.9}>
    <rect x="8" y="2.4" width="8" height="4" rx="1.2" />
    <path d="M16 4.4h2a2 2 0 0 1 2 2v13.2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6.4a2 2 0 0 1 2-2h2" />
    <path d="M8.2 11.4h7.6" />
    <path d="M8.2 15.4h4.8" />
  </svg>
);
const Check = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} {...ico} strokeWidth={2.4}>
    <path d="M5 12l5 5L20 7" />
  </svg>
);
const Arrow = ({ className }: { className?: string }) => (
  <svg className={className} {...ico} strokeWidth={2.4}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
const Plus = ({ className }: { className?: string }) => (
  <svg className={className} {...ico} strokeWidth={2.6}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
// ---------------------------------------------------------------- board data
type Tone = "green" | "red" | "none";
function toneStyle(tone: Tone) {
  if (tone === "green") return { background: GREEN_BG, color: GREEN };
  if (tone === "red") return { background: RED_BG, color: RED };
  return { color: "#A6A6A6" };
}

// ---------------------------------------------------------------- 2. trend chart
type Trend = { name: string; goal: number; unit: string; vals: number[] };

// Leadership board here, so Tech is not the featured board in every mockup.
const TRENDS: Trend[] = [
  { name: "Net Promoter Score", goal: 50, unit: "", vals: [42, 45, 44, 48, 47, 51, 49, 53, 52, 55, 54, 57] },
  { name: "New Members", goal: 10, unit: "", vals: [6, 7, 9, 8, 11, 9, 12, 10, 13, 11, 10, 12] },
];

const WK_LABELS = ["6/1", "6/8", "6/15", "6/22", "6/29", "7/6", "7/13", "7/20", "7/27", "8/3", "8/10", "8/17"];

function linePath(vals: number[], w: number, h: number, min: number, max: number) {
  const dx = w / (vals.length - 1);
  return vals
    .map((v, i) => `${i ? "L" : "M"}${(i * dx).toFixed(1)} ${(h - ((v - min) / (max - min)) * h).toFixed(1)}`)
    .join(" ");
}

function TrendChart({ t }: { t: Trend }) {
  const W = 460;
  const H = 104;
  const max = Math.max(...t.vals, t.goal) * 1.12;
  const min = Math.min(...t.vals, t.goal) * 0.82;
  const goalY = H - ((t.goal - min) / (max - min)) * H;
  const d = linePath(t.vals, W, H, min, max);
  const last = t.vals[t.vals.length - 1];
  const hit = last >= t.goal;

  return (
    <div className="rounded-xl border border-[#ECEAE6] bg-white p-3.5">
      <div className="flex flex-wrap items-center gap-2">
        <b className="text-[12.5px]">{t.name}</b>
        <span
          className="rounded-full px-2 py-0.5 text-[9.5px] font-bold"
          style={{ background: hit ? GREEN_BG : RED_BG, color: hit ? GREEN : RED }}
        >
          {hit ? "ON TRACK" : "BEHIND"}
        </span>
        <span className="ml-auto text-[10.5px] text-brand-gray">Last 12 weeks</span>
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-[24px] font-extrabold tabular-nums leading-none">
          {last}
          {t.unit}
        </span>
        <span className="text-[11px] text-brand-gray">
          goal {t.goal}
          {t.unit}
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2.5 h-[104px] w-full overflow-visible" preserveAspectRatio="none">
        <defs>
          <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={GREEN} stopOpacity="0.22" />
            <stop offset="100%" stopColor={GREEN} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* goal line */}
        <line x1="0" y1={goalY} x2={W} y2={goalY} stroke="#C9C3B7" strokeWidth="1.5" strokeDasharray="5 4" />
        {/* static: no cfo-line / cfo-area draw classes, so both render fully drawn */}
        <path d={`${d} L${W} ${H} L0 ${H} Z`} fill="url(#tg)" />
        <path
          d={d}
          fill="none"
          stroke={GREEN}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx={W} cy={H - ((last - min) / (max - min)) * H} r="4" fill={GREEN} stroke="#fff" strokeWidth="2" />
      </svg>

      <div className="mt-1.5 flex justify-between text-[8.5px] text-brand-gray">
        {WK_LABELS.filter((_, i) => i % 2 === 0).map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
      <p className="mt-2 text-[10.5px] text-brand-gray">
        Dashed line is the goal. Every week you log rolls in automatically.
      </p>
    </div>
  );
}

// The last of the four feature pages to get a shared card height. 400 on
// desktop matches SOP HQ; 340 on mobile matches it too. Written out in full
// because Tailwind scans source for literal class names.
const MET_CARD_CLS = "h-[340px] sm:h-[400px]";

function TrendDemo() {
  // No animation in this section by design: the first chart is open from the first
  // paint, expanding is instant, and the chart line and area are drawn statically.
  // Clicking still works, it just does not animate.
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div
      className={`flex flex-col rounded-2xl border border-black/5 bg-white p-3 shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${MET_CARD_CLS}`}
    >
      {/* "click a ▣ to open its trend" is an instruction for a mouse, so it
          goes on a touch device. Losing it is what makes the card fit 340 with
          the first chart already open. */}
      <div className="mb-2 flex flex-none items-center gap-2 px-1">
        <span className="text-[13px] font-extrabold tracking-tight">Leadership Scoreboard</span>
        <span className="hidden text-[10.5px] text-brand-gray sm:inline">· click a</span>
        <ChartGlyph className="hidden h-3.5 w-3.5 text-brand-orange sm:block" />
        <span className="hidden text-[10.5px] text-brand-gray sm:inline">to open its trend</span>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-[#ECEAE6]">
        {TRENDS.map((t, i) => (
          <div key={t.name} className="border-b border-[#F1EEE9] last:border-0">
            <div className="flex items-center gap-2 bg-white px-3 py-2.5 text-[12px]">
              <span className="flex-none tracking-[-2px] text-brand-gray">⠿</span>
              <span className="min-w-0 flex-1 truncate font-semibold">{t.name}</span>
              <span className="flex-none text-[11px] font-bold tabular-nums text-brand-charcoal">
                {t.vals[t.vals.length - 1]}
                <span className="font-normal text-brand-gray"> / {t.goal}</span>
              </span>
              <button
                type="button"
                aria-label={`${open === i ? "Hide" : "Show"} trend chart for ${t.name}`}
                aria-expanded={open === i}
                onClick={() => setOpen(open === i ? null : i)}
                className={`grid h-7 w-7 flex-none place-items-center rounded-lg border ${
                  open === i
                    ? "border-brand-orange bg-brand-orange text-white"
                    : "border-[#E3E0DA] text-brand-charcoal hover:border-brand-orange hover:text-brand-orange"
                }`}
              >
                <ChartGlyph className="h-4 w-4" />
              </button>
            </div>
            {open === i && (
              <div className="px-2 pb-3">
                <TrendChart t={t} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 3. add metric
// Mirrors the live "Add metric" modal: name, type, direction, weekly goal, owner,
// notes, then grouping and roll-up tucked under advanced settings. Static by
// design, no stepped fill animation.
const OWNER = "Skylar Lewis (skylar@rise...";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-[12.5px] font-semibold text-brand-ink">{label}</p>
      {children}
    </div>
  );
}

function Input({ value, muted }: { value: string; muted?: boolean }) {
  return (
    <div
      className={`flex h-[34px] items-center rounded-lg border border-[#E3E0DA] bg-white px-3 text-[12.5px] ${
        muted ? "text-brand-gray" : "font-medium text-brand-ink"
      }`}
    >
      <span className="truncate">{value}</span>
    </div>
  );
}

function Select({ value }: { value: string }) {
  return (
    <div className="flex h-[34px] items-center gap-2 rounded-lg border border-[#E3E0DA] bg-white px-3 text-[12.5px] font-medium text-brand-ink">
      <span className="min-w-0 flex-1 truncate">{value}</span>
      <svg viewBox="0 0 24 24" className="h-3 w-3 flex-none text-brand-gray" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}

function AddMetricDemo() {
  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${MET_CARD_CLS}`}
    >
      {/* header */}
      <div className="flex flex-none items-start gap-3 px-5 pb-3.5 pt-4">
        <div className="min-w-0">
          <b className="block text-[16px] font-bold tracking-tight text-brand-ink">Add metric</b>
          <span className="mt-0.5 block text-[12.5px] text-brand-gray">
            Every metric has a goal and direction.
          </span>
        </div>
        <span className="ml-auto text-[17px] leading-none text-brand-gray">&times;</span>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-hidden px-5 pb-4">
        <Field label="Metric name">
          <Input value="# of people on mastermind call" />
        </Field>

        {/* One field per row below sm. At 360px each cell of a two-column grid
            is about 150px, and "Higher is better" truncates inside its own
            input. A form on a phone is a column, not a grid. */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Type">
            <Select value="# Number" />
          </Field>
          <Field label="Direction">
            <Select value="&uarr; Higher is better" />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Weekly goal">
            <Input value="110" />
          </Field>
          <Field label="Owner">
            <Select value={OWNER} />
          </Field>
        </div>

        {/* collapsed advanced panel, where grouping and roll-up actually live */}
        <div className="flex items-start gap-3 rounded-lg border border-[#E3E0DA] bg-[#FAF9F7] px-3.5 py-2.5">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-brand-charcoal">
              Advanced metric settings
            </p>
            <p className="mt-1 text-[11.5px] leading-snug text-brand-gray">
              Group, rollup, calculation, formatting, show on other scoreboards, copy to another
              scoreboard.
            </p>
          </div>
          <span className="ml-auto mt-0.5 flex-none text-[10px] text-brand-charcoal">&#9660;</span>
        </div>

        <div className="flex items-center justify-end gap-4 pt-0.5">
          <span className="text-[13px] font-semibold text-brand-charcoal">Cancel</span>
          <span className="rounded-lg bg-brand-orange px-4 py-2 text-[13px] font-semibold text-white shadow-[0_8px_20px_-9px_rgba(234,123,27,0.9)]">
            Create metric
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 4. many boards
const BOARDS = [
  { name: "Leadership Scoreboard", metrics: 12, owner: "SL", hit: 9, color: "#EA7B1B" },
  { name: "Tech Scoreboard", metrics: 10, owner: "SL", hit: 7, color: "#2C6BA6" },
  { name: "Marketing Scoreboard", metrics: 14, owner: "SL", hit: 11, color: "#8A3F6D" },
  // Roster matches the hero tour's dropdown, so the page does not name a Sales
  // board in one place and an Accounting board in another.
  { name: "Accounting Scoreboard", metrics: 8, owner: "SL", hit: 6, color: "#2E7D5B" },
  { name: "Operations Scoreboard", metrics: 9, owner: "SL", hit: 6, color: "#C9832B" },
];

function MultiBoardDemo() {
  // Accounting selected by default, not Tech
  const [active, setActive] = useState(3);
  return (
    // the only card across all four feature pages that needed nothing but the
    // shared height: five board rows and a header already fit 340
    <div
      className={`flex flex-col rounded-2xl border border-black/5 bg-white p-3.5 shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${MET_CARD_CLS}`}
    >
      <div className="mb-2.5 flex flex-none items-center gap-2 px-0.5">
        <b className="text-[12.5px]">Your scoreboards</b>
        <span className="ml-auto flex items-center gap-1 rounded-md bg-brand-ink px-2 py-1 text-[10px] font-semibold text-white">
          <Plus className="h-2.5 w-2.5" />
          New scoreboard
        </span>
      </div>

      <div className="min-h-0 flex-1 space-y-1.5 overflow-hidden">
        {BOARDS.map((b, i) => {
          const on = active === i;
          const pct = Math.round((b.hit / b.metrics) * 100);
          return (
            <button
              key={b.name}
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={on}
              className={`flex w-full items-center gap-3 rounded-xl border p-2 text-left ${
                on ? "border-brand-orange/40 bg-[#FFF8F1]" : "border-[#ECEAE6] bg-white hover:border-[#D9D4CB]"
              }`}
            >
              <span
                className="grid h-8 w-8 flex-none place-items-center rounded-[9px] text-white"
                style={{
                  background: `linear-gradient(145deg, color-mix(in srgb, ${b.color} 84%, #fff), color-mix(in srgb, ${b.color} 82%, #000))`,
                }}
              >
                <ChartGlyph className="h-[17px] w-[17px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] font-semibold text-brand-ink">{b.name}</span>
                <span className="text-[10.5px] text-brand-gray">
                  {b.metrics} metrics · {b.hit} hit goal this week
                </span>
              </span>
              <span className="flex-none text-right">
                <span className="block text-[13px] font-extrabold tabular-nums" style={{ color: pct >= 70 ? GREEN : RED }}>
                  {pct}%
                </span>
                <span className="text-[9px] uppercase tracking-wide text-brand-gray">on goal</span>
              </span>
            </button>
          );
        })}
      </div>
      {/* no footer note here: it restated the section's own bullets word for word */}
    </div>
  );
}

// ---------------------------------------------------------------- 5. period views
type Period = "Weekly" | "Monthly" | "Quarterly";

const PERIODS: Record<Period, { cols: string[]; rows: { name: string; goal: string; vals: (string | null)[]; tones: Tone[] }[]; note: string }> = {
  Weekly: {
    cols: ["8/3", "8/10", "8/17", "8/24", "8/31"],
    rows: [
      { name: "Offer Visitors", goal: "125", vals: ["104", "138", "131", "142", null], tones: ["red", "green", "green", "green", "none"] },
      { name: "Total Sign Ups for the week", goal: "50", vals: ["41", "56", "47", "58", null], tones: ["red", "green", "red", "green", "none"] },
      { name: "# of people on mastermind call", goal: "110", vals: ["118", "131", "126", "134", null], tones: ["green", "green", "green", "green", "none"] },
      { name: "App logins", goal: "230", vals: ["212", "244", "238", "221", null], tones: ["red", "green", "green", "red", "none"] },
      { name: "Training completion", goal: "70%", vals: ["68%", "76%", "73%", "71%", null], tones: ["red", "green", "green", "green", "none"] },
      { name: "# logged in", goal: "2", vals: ["1", "3", "2", "1", null], tones: ["red", "green", "green", "red", "none"] },
      { name: "# Rank Ups", goal: "3", vals: ["4", "6", "2", "5", null], tones: ["green", "green", "red", "green", "none"] },
    ],
    note: "Weekly is where accountability lives. One number, one owner, every Monday.",
  },
  Monthly: {
    cols: ["Apr", "May", "Jun", "Jul", "Aug"],
    rows: [
      { name: "Offer Visitors", goal: "500", vals: ["412", "468", "521", "497", "515"], tones: ["red", "red", "green", "red", "green"] },
      { name: "Total Sign Ups for the week", goal: "200", vals: ["178", "194", "214", "203", "221"], tones: ["red", "red", "green", "green", "green"] },
      { name: "# of people on mastermind call", goal: "440", vals: ["398", "445", "472", "489", "509"], tones: ["red", "green", "green", "green", "green"] },
      { name: "App logins", goal: "920", vals: ["848", "902", "968", "931", "954"], tones: ["red", "red", "green", "green", "green"] },
      { name: "Training completion", goal: "70%", vals: ["64%", "71%", "74%", "69%", "76%"], tones: ["red", "green", "green", "red", "green"] },
      { name: "# logged in", goal: "8", vals: ["6", "9", "7", "10", "9"], tones: ["red", "green", "red", "green", "green"] },
      { name: "# Rank Ups", goal: "12", vals: ["9", "13", "14", "11", "17"], tones: ["red", "green", "green", "red", "green"] },
    ],
    note: "The same metrics roll up to the month automatically, as a sum or an average. Your call.",
  },
  Quarterly: {
    cols: ["Q1", "Q2", "Q3", "Q4", "FY"],
    rows: [
      { name: "Offer Visitors", goal: "1,500", vals: ["1,284", "1,486", "1,533", null, "4,303"], tones: ["red", "red", "green", "none", "green"] },
      { name: "Total Sign Ups for the week", goal: "600", vals: ["542", "588", "638", null, "1,768"], tones: ["red", "red", "green", "none", "green"] },
      { name: "# of people on mastermind call", goal: "1,320", vals: ["1,197", "1,315", "1,470", null, "3,982"], tones: ["red", "red", "green", "none", "green"] },
      { name: "App logins", goal: "2,760", vals: ["2,518", "2,704", "2,853", null, "8,075"], tones: ["red", "red", "green", "none", "green"] },
      { name: "Training completion", goal: "70%", vals: ["66%", "72%", "73%", null, "70%"], tones: ["red", "green", "green", "none", "green"] },
      { name: "# logged in", goal: "24", vals: ["19", "26", "25", null, "70"], tones: ["red", "green", "green", "none", "green"] },
      { name: "# Rank Ups", goal: "36", vals: ["31", "38", "42", null, "111"], tones: ["red", "green", "green", "none", "green"] },
    ],
    note: "Zoom out to the quarter to see whether a bad week was noise or a trend.",
  },
};

function PeriodDemo() {
  const [p, setP] = useState<Period>("Weekly");
  const data = PERIODS[p];

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${MET_CARD_CLS}`}
    >
      <div className="flex flex-none items-center gap-2 border-b border-[#F1EEE9] px-3.5 py-3">
        <b className="text-[12.5px]">Tech Scoreboard</b>
        <span className="ml-auto flex items-center gap-0.5 rounded-lg bg-[#F1EEE9] p-0.5">
          {(Object.keys(PERIODS) as Period[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setP(k)}
              aria-pressed={p === k}
              className={`rounded-[6px] px-2.5 py-1 text-[11px] ${
                p === k ? "bg-white font-semibold text-[#3E7BC0] shadow-sm" : "font-medium text-brand-charcoal hover:text-brand-ink"
              }`}
            >
              {k}
            </button>
          ))}
        </span>
      </div>

      {/* ---------------------------------------------------------------
          MOBILE: one row per metric, with a sparkline.
          A table needs width and a phone has none: seven columns at 360px
          leaves the metric column about 100px, so "Total Sign Ups for the
          week" truncates and the five values sit almost on top of each other.
          A row per metric keeps everything the section claims, that the same
          metrics roll up and you can see the shape at a glance, and the
          Weekly/Monthly/Quarterly switch still drives it.
          See design/scoreboard-mobile-options.html (option B). */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden sm:hidden">
        <div className="flex flex-none items-center gap-2 border-b border-[#F1EEE9] px-3 py-2">
          <span className="tracking-[-2px] text-brand-gray">⠿</span>
          <span className="text-[10.5px] font-extrabold uppercase tracking-wide text-brand-orange">
            Growth Program
          </span>
          <span className="ml-auto text-[9px] text-brand-gray">{data.rows.length} metrics</span>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          {data.rows.map((r) => {
            // the last column is often blank (the week is not done yet), so the
            // headline number is the last one actually logged
            const logged = r.vals.filter((v): v is string => v !== null);
            const latest = logged[logged.length - 1] ?? "–";
            const latestTone = r.tones[logged.length - 1] ?? "none";
            const nums = logged.map((v) => parseFloat(v.replace(/[^0-9.]/g, "")));
            const peak = Math.max(...nums, 1);
            return (
              <div key={r.name} className="flex items-center gap-2.5 border-b border-[#F1EEE9] px-3 py-2">
                <span className="min-w-0 flex-1 truncate text-[10.5px] font-medium text-brand-ink">{r.name}</span>
                <span className="flex flex-none items-end gap-[2px]" style={{ height: 18 }}>
                  {nums.map((n, i) => (
                    <span
                      key={i}
                      className="block w-[5px] rounded-[1px]"
                      style={{
                        height: Math.max(4, Math.round((n / peak) * 18)),
                        background: r.tones[i] === "green" ? GREEN : r.tones[i] === "red" ? RED : "#D9D4CB",
                      }}
                    />
                  ))}
                </span>
                <span
                  className="w-[42px] flex-none text-right text-[10.5px] font-bold tabular-nums"
                  style={{ color: latestTone === "green" ? GREEN : latestTone === "red" ? RED : "#A6A6A6" }}
                >
                  {latest}
                </span>
                <span className="flex-none text-[8.5px] tabular-nums text-brand-gray">/{r.goal}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ---------------------------------------------------------------
          DESKTOP: the table. The metric column gets 2fr so the longer names
          stop truncating to "Offer Vi..."
          --------------------------------------------------------------- */}
      <div className="hidden min-h-0 flex-1 grid-cols-[minmax(0,2fr)_46px_repeat(5,minmax(0,1fr))] overflow-hidden text-[11.5px] sm:grid">
        <div className="bg-[#FAF9F7] px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-wide text-brand-gray">
          Metric
        </div>
        <div className="bg-[#FAF9F7] px-1 py-1.5 text-center text-[9px] font-semibold uppercase tracking-wide text-brand-gray">
          Goal
        </div>
        {data.cols.map((c) => (
          <div
            key={c}
            className="bg-[#FAF9F7] px-1 py-1.5 text-center text-[9px] font-semibold uppercase tracking-wide text-brand-gray"
          >
            {c}
          </div>
        ))}

        {/* group header, as the real board has above each set of metrics */}
        <div className="col-span-full flex items-center gap-2 border-t border-[#F1EEE9] px-2.5 pb-1.5 pt-2.5">
          <span className="tracking-[-2px] text-brand-gray">⠿</span>
          <span className="text-[11px] font-extrabold uppercase tracking-wide text-brand-orange">
            Growth Program
          </span>
          <span className="text-[9.5px] text-brand-gray">{data.rows.length} metrics</span>
        </div>

        {data.rows.map((r) => (
          <div key={r.name} className="contents">
            <div className="flex min-w-0 items-center gap-1.5 border-t border-[#F1EEE9] px-2.5 py-2.5 font-semibold">
              <span className="truncate">{r.name}</span>
            </div>
            <div className="flex items-center justify-center border-l border-t border-[#ECEAE6] px-1 py-2.5">
              <span className="font-bold tabular-nums">{r.goal}</span>
            </div>
            {r.vals.map((v, i) => (
              <div
                key={i}
                className="flex items-center justify-center border-t border-[#F1EEE9] px-1 py-2.5"
                style={toneStyle(r.tones[i])}
              >
                <span className="font-bold tabular-nums">{v ?? "–"}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <p className="flex-none border-t border-[#F1EEE9] px-3.5 py-2 text-[10.5px] text-brand-gray">{data.note}</p>
    </div>
  );
}

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
                <Check className="mt-[3px] h-[17px] w-[17px] flex-none" style={{ color: GREEN }} />
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
          className={`rounded-2xl p-3 sm:rounded-[28px] sm:p-7 ${flip ? "lg:order-1" : ""}`}
          style={{ background: panel }}
        >
          {visual}
        </motion.div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- page
export default function MetricsScoreboardPage() {
  const { openDemo } = useDemo();

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* ------------------------------------------------ hero */}
      <section className="relative overflow-hidden px-5 pb-4 pt-6 sm:px-8 sm:pb-8 sm:pt-16">
        {/* the site's own dotted backdrop, as used on the home-page hero */}
        <div className="bg-dotted pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative mx-auto max-w-container">
          <Reveal className="mx-auto max-w-4xl text-center">
            {/* feature badge: icon tile + label, in the SystemTokens pill idiom */}
            <span className="mb-4 inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-black/10 bg-white py-1 pl-1 pr-[11px] shadow-sm sm:mb-7 sm:gap-3 sm:py-2 sm:pl-2 sm:pr-[22px]">
              <span className="grid h-[21px] w-[21px] flex-none place-items-center rounded-lg bg-gradient-to-br from-[#F49230] to-[#DE6F14] text-white shadow-[0_2px_6px_rgba(234,123,27,0.34),inset_0_1px_0_rgba(255,255,255,0.34)] sm:h-[34px] sm:w-[34px] sm:rounded-[11px]">
                <ScoreboardIcon className="h-[13px] w-[13px] sm:h-[18px] sm:w-[18px]" />
              </span>
              <span className="text-[11.5px] font-[650] tracking-[0.02em] text-[#33302C] sm:text-[16.5px]">
                Metrics Scoreboard
              </span>
            </span>
            {/* 28px on mobile so "Know where you stand," fits one line inside 335px */}
            <h1 className="text-[24px] font-extrabold leading-[1.1] tracking-tight text-brand-ink sm:text-[66px] sm:leading-[1.04]">
              Know where you stand,
              <br />
              <span className="text-brand-orange">week to quarter.</span>
            </h1>
            <p className="mx-auto mt-3.5 max-w-2xl text-[14.5px] leading-relaxed text-brand-charcoal sm:mt-7 sm:text-xl">
              <span className="sm:hidden">Log the week once. The roll-ups build themselves.</span>
              <span className="hidden sm:inline">
                One scoreboard per team. Log the week once and the monthly and quarterly roll-ups
                build themselves.
              </span>
            </p>
          </Reveal>

          <Reveal delay={0.12} className="mt-6 sm:mt-12">
            <div className="overflow-hidden rounded-2xl p-2 sm:rounded-[30px] sm:p-8" style={{ background: "linear-gradient(160deg, #FFF1E2, #FFE7D2)" }}>
              <ScoreboardHeroTour />
            </div>
          </Reveal>

          {/* CTA sits under the board, so the tour is the first thing seen */}
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

      {/* divider between the hero tour and the capability sections */}
      <div className="mx-auto max-w-container px-5 sm:px-8">
        <hr className="border-t border-brand-gray/20" />
      </div>

      {/* ------------------------------------------------ 2. trend chart */}
      <Section
        id="trend"
        eyebrow="One click to the trend"
        title="Every number has a"
        swash="story."
        body="Tap the chart icon on any metric and its full history opens inline, goal line included. No pivot tables, no separate reporting tool, no waiting on someone to build a chart."
        points={[
          "12-week trend on every metric, always current",
          "Goal line overlaid so “behind” is obvious, not debatable",
          "Charts build themselves from the weekly numbers your team already logs",
        ]}
        visual={<TrendDemo />}
        panel="linear-gradient(160deg, #EEF4FB, #E2ECF8)"
      />

      {/* ------------------------------------------------ 3. add a metric */}
      <Section
        id="add"
        eyebrow="Add a metric in seconds"
        title="If you can name it, you can"
        swash="track it."
        body="Name it, pick a type, set the direction and the weekly goal, assign an owner. That's the whole setup, and it's the last time you'll think about it."
        points={[
          "Every metric has an owner, no exceptions",
          "Direction on every metric, so the board knows what good looks like",
          "Grouping, roll-ups and formatting wait under advanced settings",
        ]}
        visual={<AddMetricDemo />}
        flip
        panel="linear-gradient(160deg, #FFF6EC, #FFEBD8)"
      />

      {/* ------------------------------------------------ 4. multiple scoreboards */}
      <Section
        id="boards"
        eyebrow="Unlimited scoreboards"
        title="One board per team, one"
        swash="source of truth."
        body="Leadership, Tech, Marketing, Accounting. Each team runs the board it actually cares about, and every board feeds the same system. Spin up a new one whenever a new program or department appears."
        points={[
          "Separate boards for each department, program, or client",
          "Leadership sees the roll-up without chasing spreadsheets",
          "New scoreboard in a click. No admin, no setup call",
        ]}
        visual={<MultiBoardDemo />}
        panel="linear-gradient(160deg, #F3F0FA, #E9E4F6)"
      />

      {/* ------------------------------------------------ 5. weekly/monthly/quarterly */}
      <Section
        id="views"
        eyebrow="Weekly · Monthly · Quarterly"
        title="Zoom out without losing the"
        swash="detail."
        body="The same metrics, three altitudes. Weekly for accountability, monthly for pacing, quarterly for the trend that actually decides your year, all from the numbers logged once."
        points={[
          "Switch views instantly; nothing to re-enter or re-map",
          "Monthly and quarterly totals roll up automatically",
          "Spot whether a red week was noise or the start of a slide",
        ]}
        visual={<PeriodDemo />}
        flip
        panel="linear-gradient(160deg, #EEF6F2, #E1EFE8)"
      />

      {/* ------------------------------------------------ 6. Multi AI (always last)
          Deliberately not a Section: centred heading plus a full-width wired
          diagram, so the closer reads as its own thing rather than a fifth
          alternating block. See components/MultiAiWired.tsx. */}
      <MultiAiWired />

      <CTA />
      <Footer />
    </main>
  );
}
