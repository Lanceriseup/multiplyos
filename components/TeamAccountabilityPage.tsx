"use client";

// Feature page: Team Accountability, which the product calls the One Page Plan.
//
// The help centre gives the argument its shape:
//
//     "Because every goal is tied to a person, and every person's metrics are
//      visible weekly, there's nowhere to hide."
//
// So the page is not "strategic planning software". It is the claim that a plan
// with a named owner on every line, reviewed every week, is a different object
// from a plan in a drawer. Sections run in that order of strength:
//
//   2. one page       purpose, values, vision, SWOT, all of it on one screen
//   3. the cascade    quarterly ladders to annual ladders to the long-term
//   4. goals+metrics  what one person is aiming at, and whether they are hitting it
//   5. the quarter    quarter to month to week, thirteen weeks, in My 12 Week Year
//   6. every team     a plan per department, or per team you pick
//
// See docs/team-accountability-feature-notes.md. Three rules from it are
// load-bearing:
//
//   1. Nothing on this page is invented UI. Section 5 was rebuilt in August 2026
//      once screenshots of "My 12 Week Year" turned up: the monthly and weekly
//      tiers the client asked for do exist, and the page had been underselling
//      them. Notes section 6.
//   2. The phrase "12 Week Year" appears nowhere. It is Brian Moran's trademark.
//      This page describes a twelve-week cycle in its own words. Notes section 7.
//   3. The company in the mockups is fictional. The screenshots are of Rise Up
//      Kings's real internal plan and none of that is on the public site.
import { motion } from "framer-motion";
import { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CTA from "./CTA";
import Reveal from "./Reveal";
import TeamAccountabilityHeroTour from "./TeamAccountabilityHeroTour";
import MultiAiWired from "./MultiAiWired";
import type { Row, Insight } from "./MultiAiWired";
import { useDemo } from "./DemoModal";

// ---------------------------------------------------------------- tokens
const GREEN = "#1F7F4C";
const AMBER = "#C9832B";
const RED = "#C0402B";
const RUST = "#B4532A"; // the feature's own tile colour, from the navbar
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

const Target = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="12" cy="12" r="8.4" />
    <circle cx="12" cy="12" r="4.6" />
    <circle cx="12" cy="12" r="1.2" />
  </svg>
);
const Bulb = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M9.4 17.6h5.2M10.2 20.4h3.6" />
    <path d="M12 3.6a5.6 5.6 0 0 1 3.4 10.1c-.6.5-.9 1.1-.9 1.8H9.5c0-.7-.3-1.3-.9-1.8A5.6 5.6 0 0 1 12 3.6z" />
  </svg>
);
const Shield = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 3.4l7.4 2.6v5.6c0 4.2-3 7.6-7.4 9-4.4-1.4-7.4-4.8-7.4-9V6z" />
  </svg>
);
const Warn = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 4.2l8.4 15.2H3.6z" />
    <path d="M12 10v3.6M12 16.6v.1" />
  </svg>
);
const Trend = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M4 16.4l5-5.2 3.4 3.2L20 7" />
    <path d="M15.4 7H20v4.6" />
  </svg>
);
const AlertCircle = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="12" cy="12" r="8.4" />
    <path d="M12 7.8v4.6M12 16.2v.1" />
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
const Spark = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2}>
    <path d="M12 3l1.6 4L18 8.5 14 10l-2 4-2-4-4-1.5L10 7z" />
  </svg>
);
const Board = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="3.4" y="4.4" width="17.2" height="15.2" rx="2.2" />
    <path d="M9.2 4.4v15.2M15 4.4v15.2" />
  </svg>
);
const Users = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="9.2" cy="8.4" r="3" />
    <path d="M3.6 18.6c0-2.8 2.5-4.6 5.6-4.6s5.6 1.8 5.6 4.6" />
    <path d="M16.2 6.2a3 3 0 0 1 0 5.6M17.4 14.6c1.9.6 3.2 1.9 3.2 4" />
  </svg>
);
const RowsIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.2" />
    <path d="M3.5 9.5h17M3.5 14.5h17" />
  </svg>
);

// ---------------------------------------------------------------- shared data
// One fictional company across every mockup, and one goal chain carried through
// every section so they corroborate each other. Notes section 8.
type Status = "ok" | "risk" | "crit";

const STATUS = {
  ok: { label: "On Track", c: GREEN, bg: "#EAF7F0" },
  risk: { label: "At Risk", c: AMBER, bg: "#FDF1DF" },
  crit: { label: "Critical", c: RED, bg: "#FDECE9" },
} as const;

const TEAM = {
  MH: { name: "Marcus Hale", role: "Operations" },
  PN: { name: "Priya Nair", role: "Marketing" },
  JR: { name: "Jordan Rivera", role: "Sales" },
  KN: { name: "Kath Nakamura", role: "Technology" },
  SL: { name: "Skylar Lewis", role: "Owner" },
} as const;

type Who = keyof typeof TEAM;

// ---------------------------------------------------------------- 2. one page
const VALUES = [
  { l: "O", n: "Own It" },
  { l: "D", n: "Do It Right" },
  { l: "S", n: "Say It Straight" },
  { l: "L", n: "Leave It Better" },
  { l: "K", n: "Keep Learning" },
];

const SWOT = [
  {
    k: "s", t: "Strengths", icon: Shield, c: GREEN, bg: "#F1F9F4",
    items: ["Crew retention above 90%", "Two thirds of work is repeat", "Same-week quotes, every time"],
  },
  {
    k: "w", t: "Weaknesses", icon: Warn, c: "#6D4BC4", bg: "#F5F2FD",
    items: ["One market, all the risk", "Thin bench under the leads", "Scheduling still on spreadsheets"],
  },
  {
    k: "o", t: "Opportunities", icon: Trend, c: "#2C6BA6", bg: "#EFF5FC",
    items: ["Referral programme", "Commercial accounts", "Second market next spring"],
  },
  {
    k: "t", t: "Threats", icon: AlertCircle, c: RED, bg: "#FDF1EF",
    items: ["Labour cost climbing", "Two new entrants", "Fuel prices"],
  },
];

function OnePageDemo() {
  const [quad, setQuad] = useState("w");
  const active = SWOT.find((s) => s.k === quad)!;

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${CARD_CLS}`}>
      <div className="flex flex-none items-center gap-2 border-b border-[#F1EEE9] px-3.5 py-2.5">
        <b className="text-[12px]">One Page Plan</b>
        <span className="ml-auto rounded-md border border-[#E6E2DB] px-2 py-[3px] text-[9px] font-semibold text-brand-charcoal">
          Plan style: Standard
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-2.5">
        <div className="rounded-lg border border-[#EBE7E0] bg-[#FAF9F7] px-3 py-2 text-center">
          <p className="text-[8px] font-bold uppercase tracking-[0.13em] text-brand-gray">
            Why we exist
          </p>
          <span className="mx-auto mt-1 grid h-[24px] w-[24px] place-items-center rounded-full" style={{ background: "#FDF0E4", color: "#C9650F" }}>
            <Target className="h-3.5 w-3.5" />
          </span>
          <p className="mt-1 text-[10px] leading-snug text-brand-charcoal">
            Do work people are proud to put their name on, for customers who tell somebody else
            about it.
          </p>
        </div>

        <div className="mt-2 flex items-start justify-around rounded-lg border border-[#EBE7E0] px-2 py-2">
          {VALUES.map((v) => (
            <span key={v.l} className="flex w-[58px] flex-col items-center gap-1">
              <span className="grid h-[28px] w-[28px] place-items-center rounded-full bg-[#FBE9A8] text-[11px] font-bold" style={{ color: "#8A6512" }}>
                {v.l}
              </span>
              <span className="text-center text-[8px] font-medium leading-tight text-brand-charcoal">
                {v.n}
              </span>
            </span>
          ))}
        </div>

        <div className="mt-2 flex items-center gap-2 rounded-lg border border-[#EBE7E0] px-3 py-2">
          <span className="grid h-[24px] w-[24px] flex-none place-items-center rounded-full bg-[#E6F0F8]" style={{ color: "#2C6BA6" }}>
            <Bulb className="h-3.5 w-3.5" />
          </span>
          <span className="min-w-0">
            <span className="block text-[8px] font-bold uppercase tracking-[0.12em] text-brand-gray">
              Company vision
            </span>
            <span className="block text-[11px] font-semibold">4 markets, 500 customers, by 2031</span>
          </span>
        </div>

        <div className="mt-2 grid grid-cols-4 gap-1.5">
          {SWOT.map((s) => {
            const Icon = s.icon;
            const on = quad === s.k;
            return (
              <button
                key={s.k}
                type="button"
                aria-pressed={on}
                onClick={() => setQuad(s.k)}
                className="rounded-lg border px-1.5 py-1.5 text-center transition-all"
                style={{
                  background: on ? s.bg : "#fff",
                  borderColor: on ? `${s.c}55` : "#EBE7E0",
                }}
              >
                <Icon className="mx-auto h-3.5 w-3.5" style={{ color: on ? s.c : "#A6A6A6" }} />
                <span className="mt-0.5 block truncate text-[8.5px] font-bold" style={{ color: on ? s.c : "#4A4744" }}>
                  {s.t}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-1.5 rounded-lg border px-2.5 py-2" style={{ background: active.bg, borderColor: `${active.c}33` }}>
          <div className="space-y-1">
            {active.items.map((i) => (
              <p key={i} className="flex items-start gap-2 text-[10px] leading-snug text-brand-charcoal">
                <span className="mt-[5px] h-1 w-1 flex-none rounded-full" style={{ background: active.c }} />
                {i}
              </p>
            ))}
          </div>
        </div>
      </div>

      <p className="flex-none border-t border-[#F1EEE9] px-3.5 py-2 text-[10px] leading-snug text-brand-gray">
        Purpose, values, vision, and an honest SWOT, above the goals they are supposed to be driving.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- 3. the cascade
type Rung = { tier: string; name: string; who: Who | null; s: Status };

// Four chains, each three rungs deep. Selecting a quarterly goal lights its own
// parents and dims everything else, which is the whole point of the section.
const CHAINS: Rung[][] = [
  [
    { tier: "5+ Year Vision", name: "Operating in 4 markets", who: "SL", s: "ok" },
    { tier: "Annual 2026", name: "40% gross margin on delivery", who: "SL", s: "ok" },
    { tier: "Q3 · Operations", name: "Cut job turnaround from 9 days to 6", who: "MH", s: "risk" },
  ],
  [
    { tier: "5+ Year Vision", name: "500 customers under retainer by 2031", who: "SL", s: "ok" },
    { tier: "Annual 2026", name: "$5.4M revenue", who: "SL", s: "risk" },
    { tier: "Q3 · Sales", name: "30 new retainers signed", who: "JR", s: "risk" },
  ],
  [
    { tier: "5+ Year Vision", name: "500 customers under retainer by 2031", who: "SL", s: "ok" },
    { tier: "Annual 2026", name: "Second market open and profitable", who: "SL", s: "crit" },
    { tier: "Q3 · Marketing", name: "Cost per lead under $18", who: "PN", s: "crit" },
  ],
  [
    { tier: "5+ Year Vision", name: "Operating in 4 markets", who: "SL", s: "ok" },
    { tier: "Annual 2026", name: "40% gross margin on delivery", who: "SL", s: "ok" },
    { tier: "Q3 · Technology", name: "Move scheduling off spreadsheets", who: "KN", s: "ok" },
  ],
];

function CascadeDemo() {
  const [sel, setSel] = useState(0);
  const chain = CHAINS[sel];

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${CARD_CLS}`}>
      <div className="flex-none border-b border-[#F1EEE9] px-3.5 py-2.5">
        <p className="text-[9.5px] text-brand-gray">
          Pick a quarterly goal and watch what it is holding up
        </p>
        <div className="scrollbar-none mt-1.5 flex flex-nowrap gap-1 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-x-visible sm:pb-0">
          {CHAINS.map((c, i) => {
            const q = c[2];
            const m = STATUS[q.s];
            return (
              <button
                key={q.name}
                type="button"
                aria-pressed={sel === i}
                onClick={() => setSel(i)}
                className={`flex flex-none items-center gap-1 whitespace-nowrap rounded-full border px-2 py-1 text-[9px] transition-colors ${
                  sel === i
                    ? "border-brand-orange/55 bg-[#FFF6EC] font-semibold text-brand-orange-dark"
                    : "border-[#E6E2DB] font-medium text-brand-charcoal hover:bg-[#FAF9F7]"
                }`}
              >
                <span className="h-[5px] w-[5px] rounded-full" style={{ background: m.c }} />
                {q.tier.replace("Q3 · ", "")}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-3">
        {chain.map((r, i) => {
          const m = STATUS[r.s];
          const last = i === chain.length - 1;
          return (
            <div key={r.tier}>
              <div
                className="rounded-lg border px-2.5 py-2 transition-colors"
                style={{
                  borderColor: last ? `${m.c}55` : "#EBE7E0",
                  background: last ? m.bg : "#fff",
                }}
              >
                <p className="flex items-center gap-2">
                  <span className="font-mono text-[8px] uppercase tracking-[0.08em] text-brand-gray">
                    {r.tier}
                  </span>
                  <span
                    className="ml-auto flex-none rounded-full px-1.5 py-px text-[8px] font-bold"
                    style={{ background: last ? "#fff" : m.bg, color: m.c }}
                  >
                    {m.label}
                  </span>
                </p>
                <p className="mt-1 flex items-center gap-2">
                  <span className="min-w-0 flex-1 text-[11px] font-bold leading-snug">{r.name}</span>
                  {r.who && (
                    <span className="grid h-[18px] w-[18px] flex-none place-items-center rounded-full bg-[#F1EEE9] text-[7.5px] font-bold text-brand-charcoal">
                      {r.who}
                    </span>
                  )}
                </p>
              </div>

              {!last && (
                <div className="flex items-center gap-1.5 py-1 pl-3">
                  <span className="h-3 w-px" style={{ background: "#D5D0C7" }} />
                  <span className="font-mono text-[8px] uppercase tracking-[0.08em] text-brand-gray">
                    ladders up to
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="flex-none border-t border-[#F1EEE9] px-3.5 py-2 text-[10px] leading-snug text-brand-gray">
        Every goal names its parent, and the parent can be reassigned. Three lists become one plan.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- 4. goals and metrics
// A goal says what somebody is aiming at; a metric says whether they are getting
// there. Showing both for one person is the argument, and it only works because
// the pairs line up: Priya's Critical goal is cost per lead, and the cost-per-lead
// metric under it has missed five of its last six weeks. Same problem, twice.
//
// The metrics here are the ones the Metrics Scoreboard page already assigns to
// these people, so the two pages corroborate rather than contradict.
// No department on the goal: it is redundant now that the goals sit under the
// person, whose own department is already in the header above them.
type OwnedGoal = { name: string; s: Status; done: number; of: number };

// Six elapsed weeks per metric, then the current one, which has not landed yet.
type Metric = { name: string; target: string; weeks: boolean[] };

const OWNED: Record<Who, OwnedGoal[]> = {
  MH: [
    { name: "Cut job turnaround from 9 days to 6", s: "risk", done: 2, of: 5 },
    { name: "Second crew fully certified", s: "ok", done: 3, of: 4 },
    { name: "Fleet inspection compliance to 100%", s: "ok", done: 1, of: 3 },
  ],
  PN: [
    { name: "Cost per lead under $18", s: "crit", done: 0, of: 4 },
    { name: "Launch the referral programme", s: "ok", done: 2, of: 3 },
  ],
  JR: [
    { name: "30 new retainers signed", s: "risk", done: 1, of: 4 },
    { name: "Close rate from 22% to 30%", s: "ok", done: 2, of: 4 },
  ],
  KN: [
    { name: "Move scheduling off spreadsheets", s: "ok", done: 3, of: 5 },
  ],
  SL: [
    { name: "$5.4M revenue", s: "risk", done: 0, of: 0 },
    { name: "40% gross margin on delivery", s: "ok", done: 0, of: 0 },
    { name: "Second market open and profitable", s: "crit", done: 0, of: 0 },
  ],
};

const METRICS: Record<Who, Metric[]> = {
  MH: [
    { name: "Avg job turnaround", target: "6 days or under", weeks: [false, false, true, false, true, true] },
    { name: "Jobs closed on time", target: "25 a week", weeks: [true, true, false, true, true, true] },
    { name: "Crew utilisation", target: "85%", weeks: [true, false, true, true, true, false] },
  ],
  PN: [
    { name: "New Leads", target: "120 a week", weeks: [true, true, false, true, true, false] },
    { name: "Cost per Lead", target: "$18 or under", weeks: [false, false, true, false, false, false] },
    { name: "Email Open Rate", target: "35%", weeks: [true, true, true, true, true, true] },
  ],
  JR: [
    { name: "New retainers signed", target: "3 a week", weeks: [false, true, false, false, true, false] },
    { name: "Close rate", target: "30%", weeks: [true, false, true, true, false, true] },
  ],
  KN: [
    { name: "Scheduling migrated", target: "2 crews a week", weeks: [true, true, false, true, true, true] },
    { name: "Uptime", target: "99.5%", weeks: [true, true, true, true, true, true] },
  ],
  SL: [
    { name: "Gross margin", target: "40%", weeks: [true, false, true, true, true, true] },
    { name: "Client retention", target: "90%", weeks: [true, true, true, true, true, true] },
  ],
};

// What the pairing actually shows for each person. This is the payoff line, so
// it is written per person rather than left generic.
const READS: Record<Who, string> = {
  MH: "Turnaround is his goal and his metric. Two green weeks running, and one more takes the goal off At Risk.",
  PN: "Her hardest goal and her worst metric are the same problem. That is not a coincidence.",
  JR: "The close rate is fine. The volume is not, which is why the retainer goal is the one slipping.",
  KN: "Nothing on fire, which is why his goal is the one nobody thinks to ask about.",
  SL: "Her metrics are the company's. That is what owning the annual goals turns out to mean.",
};

const ORDER: Who[] = ["MH", "PN", "JR", "KN", "SL"];

// Six cells for the weeks that have closed, then a seventh for the one running.
function WeekStrip({ weeks }: { weeks: boolean[] }) {
  const hits = weeks.filter(Boolean).length;
  return (
    <>
      <span className="flex flex-none gap-[2px]" aria-label={`${hits} of ${weeks.length} weeks hit`}>
        {weeks.map((w, i) => (
          <span
            key={i}
            className="block h-[12px] w-[4px] rounded-[1px]"
            style={{ background: w ? GREEN : "#E8DCC6" }}
          />
        ))}
        <span className="block h-[12px] w-[4px] rounded-[1px] bg-[#EFECE6]" />
      </span>
      <span
        className="w-[26px] flex-none text-right font-mono text-[9px] font-bold tabular-nums"
        style={{ color: hits >= weeks.length - 1 ? GREEN : hits <= 1 ? RED : AMBER }}
      >
        {hits}/{weeks.length}
      </span>
    </>
  );
}

function OwnerDemo() {
  const [who, setWho] = useState<Who>("PN");
  const goals = OWNED[who];
  const metrics = METRICS[who];
  const person = TEAM[who];

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${CARD_CLS}`}>
      <div className="flex-none border-b border-[#F1EEE9] px-3.5 py-2.5">
        <p className="mb-1.5 text-[9.5px] text-brand-gray">
          Everyone&rsquo;s goals, and the numbers under them
        </p>
        <div className="scrollbar-none flex flex-nowrap gap-1 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-x-visible sm:pb-0">
          {ORDER.map((k) => {
            const on = who === k;
            return (
              <button
                key={k}
                type="button"
                aria-pressed={on}
                onClick={() => setWho(k)}
                className={`flex flex-none items-center gap-1.5 whitespace-nowrap rounded-full border px-1.5 py-1 text-[9px] transition-colors ${
                  on
                    ? "border-transparent font-semibold text-white"
                    : "border-[#E6E2DB] font-medium text-brand-charcoal hover:bg-[#FAF9F7]"
                }`}
                style={on ? { background: RUST } : undefined}
              >
                <span
                  className="grid h-[16px] w-[16px] place-items-center rounded-full text-[7px] font-bold"
                  style={on ? { background: "rgba(255,255,255,0.24)" } : { background: "#F1EEE9" }}
                >
                  {k}
                </span>
                {TEAM[k].name.split(" ")[0]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-none items-center gap-2.5 border-b border-[#F1EEE9] bg-[#FAF9F7] px-3.5 py-2">
        <span className="grid h-[28px] w-[28px] flex-none place-items-center rounded-full text-[9.5px] font-bold text-white" style={{ background: RUST }}>
          {who}
        </span>
        <span className="min-w-0 flex-1">
          <p className="truncate text-[11.5px] font-bold leading-tight">{person.name}</p>
          <p className="text-[9px] text-brand-gray">{person.role}</p>
        </span>
        <span className="flex-none font-mono text-[9px] text-brand-gray">Q3 &middot; 2026</span>
      </div>

      <div key={who} className="sop-view min-h-0 flex-1 overflow-hidden">
        <p className="flex items-center px-3.5 pb-1 pt-2 text-[8px] font-bold uppercase tracking-[0.11em] text-brand-gray">
          Their goals
          <span className="ml-auto font-mono tracking-normal">{goals.length}</span>
        </p>
        {goals.map((g) => {
          const m = STATUS[g.s];
          return (
            <div key={g.name} className="flex items-center gap-2.5 border-b border-[#F5F2ED] px-3.5 py-[7px]">
              <span className="h-[24px] w-[3px] flex-none rounded-full" style={{ background: m.c }} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[10.5px] font-semibold leading-tight">{g.name}</span>
                {g.of > 0 && (
                  <span className="text-[8.5px] text-brand-gray">
                    {g.done} of {g.of} milestones
                  </span>
                )}
              </span>
              <span
                className="w-[52px] flex-none rounded-full py-[3px] text-center text-[8.5px] font-bold"
                style={{ background: m.bg, color: m.c }}
              >
                {m.label}
              </span>
            </div>
          );
        })}

        <p className="flex items-center px-3.5 pb-1 pt-2.5 text-[8px] font-bold uppercase tracking-[0.11em] text-brand-gray">
          Metrics they own
          <span className="ml-auto font-mono tracking-normal">{metrics.length}</span>
        </p>
        {metrics.map((mt) => (
          <div key={mt.name} className="flex items-center gap-2.5 border-b border-[#F5F2ED] px-3.5 py-[7px]">
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[10.5px] font-semibold leading-tight">{mt.name}</span>
              <span className="text-[8.5px] text-brand-gray">{mt.target}</span>
            </span>
            <WeekStrip weeks={mt.weeks} />
          </div>
        ))}
      </div>

      <p className="flex-none border-t border-[#F1EEE9] px-3.5 py-2 text-[10px] leading-snug text-brand-gray">
        {READS[who]}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- 5. the quarter
// My 12 Week Year, which is where the client's "quarterly to monthly to weekly"
// actually lives. Three rungs, and you can stand on any of them.
const WEEKS13 = [
  "7/6", "7/13", "7/20", "7/27", "8/3", "8/10", "8/17", "8/24", "8/31", "9/7", "9/14", "9/21", "9/28",
];
const NOW_WEEK = 7;
const KPI: (boolean | null)[] = [
  false, false, true, false, true, false, true, null, null, null, null, null, null,
];

const MONTHLY = [
  { m: "July", now: false, out: ["Map the 9-day path end to end", "Quote-to-schedule under 24h"], hit: "3 of 4 weeks" },
  { m: "August", now: true, out: ["Second crew certified", "Hold turnaround under 7 days"], hit: "3 of 4 weeks" },
  { m: "September", now: false, out: ["Three straight weeks at 6 days", "Turnaround review in Ops meeting"], hit: "not started" },
];

const THIS_WEEK = [
  "Ride along with crew two on Tuesday",
  "Close the dispatch handoff gap",
  "Log turnaround daily, not weekly",
];

const UPDATES = [
  { w: "Week of Aug 24", t: "Crew two passed certification Friday. Turnaround averaged 6.8 days this week, the first time under seven. Keeping the flag on until we hold it three weeks running." },
  { w: "Week of Aug 17", t: "Quote-to-schedule gap is down to 19 hours. Turnaround still 7.9 days, because dispatch is the bottleneck now, not sales." },
];

// Named Level rather than Rung: the cascade section above already owns Rung for
// a goal in the long-term / annual / quarterly chain.
type Level = "q" | "m" | "w";

function WeekDemo() {
  const [rung, setRung] = useState<Level>("w");
  const [ticked, setTicked] = useState<number[]>([]);
  const toggle = (i: number) =>
    setTicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));
  const pct = Math.round((ticked.length / THIS_WEEK.length) * 100);

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${TALL_CLS}`}>
      <div className="flex-none border-b border-[#F1EEE9] px-3.5 py-2.5">
        <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-brand-gray">
          Q3 &middot; Operations &middot; Marcus Hale
        </p>
        <p className="mt-0.5 text-[12px] font-bold leading-tight">
          Cut job turnaround from 9 days to 6
        </p>
        {/* the three rungs, in the order the product breaks them down */}
        <div className="mt-2 flex items-center gap-1">
          {([
            { k: "q", l: "Quarter" },
            { k: "m", l: "Month" },
            { k: "w", l: "Week" },
          ] as const).map(({ k, l }, i) => (
            <span key={k} className="flex items-center gap-1">
              {i > 0 && <span className="text-[9px] text-[#C4BFB6]">&rsaquo;</span>}
              <button
                type="button"
                aria-pressed={rung === k}
                onClick={() => setRung(k)}
                className={`rounded-full px-2.5 py-1 text-[10px] transition-colors ${
                  rung === k ? "bg-brand-orange font-semibold text-white" : "font-medium text-brand-charcoal hover:bg-[#FAF9F7]"
                }`}
              >
                {l}
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* the quarter, as thirteen weeks */}
      {rung === "q" && (
        <div className="min-h-0 flex-1 overflow-hidden px-3.5 py-3">
          <p className="flex items-baseline gap-1.5 text-[10.5px] font-bold">
            13 weeks
            <span className="text-[9px] font-medium text-brand-gray">
              weekly target &le; 6.0 days
            </span>
          </p>
          <div className="mt-2 flex items-end gap-[3px]">
            {WEEKS13.map((w, i) => {
              const v = KPI[i];
              const isNow = i === NOW_WEEK;
              return (
                <span key={w} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                  <span
                    className="w-full rounded-[3px] transition-all duration-300"
                    style={{
                      height: v === null ? 14 : v ? 40 : 22,
                      background: v === null ? "#EFECE6" : v ? GREEN : "#E8DCC6",
                      outline: isNow ? `2px solid ${RUST}` : undefined,
                      outlineOffset: isNow ? 1 : undefined,
                    }}
                  />
                  <span
                    className="font-mono text-[6.5px]"
                    style={isNow ? { color: RUST, fontWeight: 700 } : { color: "#A6A6A6" }}
                  >
                    {w}
                  </span>
                </span>
              );
            })}
          </div>
          <p className="mt-3 text-[10px] leading-relaxed text-brand-charcoal">
            Three of the seven weeks so far have hit the weekly target. Not a disaster, and not on
            pace either, and you can see which is true in one glance rather than at the quarterly
            review.
          </p>
          <div className="mt-2.5 flex items-center gap-3 text-[9px] text-brand-gray">
            <span className="flex items-center gap-1">
              <span className="h-[8px] w-[8px] rounded-[2px]" style={{ background: GREEN }} />
              Hit
            </span>
            <span className="flex items-center gap-1">
              <span className="h-[8px] w-[8px] rounded-[2px]" style={{ background: "#E8DCC6" }} />
              Missed
            </span>
            <span className="flex items-center gap-1">
              <span className="h-[8px] w-[8px] rounded-[2px] bg-[#EFECE6]" />
              Ahead of you
            </span>
          </div>
        </div>
      )}

      {/* the month, as outcomes */}
      {rung === "m" && (
        <div className="min-h-0 flex-1 space-y-1.5 overflow-hidden px-3.5 py-3">
          {MONTHLY.map((m) => (
            <div
              key={m.m}
              className="rounded-lg border px-2.5 py-2"
              style={m.now ? { borderColor: `${RUST}44`, background: `${RUST}08` } : { borderColor: "#EBE7E0" }}
            >
              <p className="flex items-center gap-2">
                <span className="text-[11px] font-bold">{m.m}</span>
                {m.now && (
                  <span className="rounded-full px-1.5 py-px text-[7.5px] font-bold text-white" style={{ background: RUST }}>
                    NOW
                  </span>
                )}
                <span className="ml-auto font-mono text-[8.5px] text-brand-gray">{m.hit}</span>
              </p>
              <div className="mt-1 space-y-0.5">
                {m.out.map((o) => (
                  <p key={o} className="flex items-start gap-1.5 text-[9.5px] leading-snug text-brand-charcoal">
                    <span className="mt-[5px] h-1 w-1 flex-none rounded-full bg-[#C4BFB6]" />
                    {o}
                  </p>
                ))}
              </div>
            </div>
          ))}
          <p className="pt-0.5 text-[9.5px] leading-snug text-brand-gray">
            <Spark className="mr-1 inline h-2.5 w-2.5" style={{ color: AI }} />
            Multi AI will draft the month&rsquo;s outcomes from the goal above it.
          </p>
        </div>
      )}

      {/* the week, which is the only one anybody actually works in */}
      {rung === "w" && (
        <>
          <div className="flex flex-none items-center gap-2 bg-[#FAF9F7] px-3.5 py-1.5">
            <span className="font-mono text-[9px] font-bold" style={{ color: RUST }}>
              8/24 to 8/30
            </span>
            <span className="rounded-full px-1.5 py-px text-[7.5px] font-bold text-white" style={{ background: RUST }}>
              NOW
            </span>
            <span className="ml-auto font-mono text-[9px] text-brand-gray">
              {ticked.length}/{THIS_WEEK.length}
            </span>
            <span
              className="font-mono text-[12px] font-bold tabular-nums transition-colors duration-300"
              style={{ color: pct === 100 ? GREEN : pct > 0 ? AMBER : "#C4BFB6" }}
            >
              {pct}%
            </span>
          </div>

          <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3.5 py-2">
            {THIS_WEEK.map((t, i) => {
              const on = ticked.includes(i);
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(i)}
                  className="flex w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-left transition-colors"
                  style={{ borderColor: on ? "#DCE9E1" : "#EBE7E0", background: on ? "#FAFDFB" : "#fff" }}
                >
                  <span
                    className="grid h-[13px] w-[13px] flex-none place-items-center rounded-[3px] transition-colors"
                    style={on ? { background: GREEN, color: "#fff" } : { border: "1.5px solid #C9C2B6", color: "transparent" }}
                  >
                    <Tick className="h-2 w-2" />
                  </span>
                  <span className={`min-w-0 flex-1 text-[10px] leading-snug ${on ? "text-brand-gray line-through" : "font-medium"}`}>
                    {t}
                  </span>
                </button>
              );
            })}

            <div className="!mt-2 rounded-lg border border-[#EBE7E0] px-2.5 py-2">
              <p className="flex items-center gap-1.5 text-[9px] font-bold">
                <Board className="h-2.5 w-2.5" style={{ color: "#5B47A8" }} />
                Linked projects
                <span className="ml-auto font-normal text-brand-orange">+ Link project</span>
              </p>
              <p className="mt-1 text-[9px] text-brand-gray">
                Dispatch rebuild <span className="text-[#C4BFB6]">·</span> 6 open tasks this week
              </p>
            </div>

            {UPDATES.slice(0, 1).map((u) => (
              <div key={u.w} className="!mt-2 rounded-lg border px-2.5 py-2" style={{ borderColor: `${RUST}33`, background: `${RUST}08` }}>
                <p className="flex items-center gap-2 text-[9.5px] font-bold">
                  <span className="grid h-[18px] w-[18px] flex-none place-items-center rounded-full bg-[#F1EEE9] text-[7px] font-bold text-brand-charcoal">
                    MH
                  </span>
                  Goal update
                  <span className="ml-auto font-mono text-[8px] font-normal text-brand-gray">{u.w}</span>
                </p>
                <p className="mt-1 text-[9.5px] leading-relaxed text-brand-charcoal">{u.t}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <p className="flex-none border-t border-[#F1EEE9] px-3.5 py-2 text-[10px] leading-snug text-brand-gray">
        {rung === "q"
          ? "Thirteen weeks, each one either hit or missed. That is the whole quarter on one line."
          : rung === "m"
            ? "Each month gets its own outcomes, so the quarter is not one long sprint."
            : "This is the only rung anybody works in. The other two are made of it."}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- 6. every team
const PLANS = [
  {
    k: "co", label: "Company", sub: "Everyone, one plan",
    rows: [
      { n: "$5.4M revenue", who: "SL" as Who, s: "risk" as Status },
      { n: "40% gross margin on delivery", who: "SL" as Who, s: "ok" as Status },
      { n: "Second market open and profitable", who: "SL" as Who, s: "crit" as Status },
      { n: "90% client retention", who: "SL" as Who, s: "ok" as Status },
    ],
  },
  {
    k: "ops", label: "Operations", sub: "Its own plan",
    rows: [
      { n: "Cut job turnaround from 9 days to 6", who: "MH" as Who, s: "risk" as Status },
      { n: "Second crew fully certified", who: "MH" as Who, s: "ok" as Status },
      { n: "Fleet inspection compliance to 100%", who: "MH" as Who, s: "ok" as Status },
    ],
  },
  {
    k: "launch", label: "Market 2 launch", sub: "A team you pick",
    rows: [
      { n: "Site secured and leased", who: "SL" as Who, s: "ok" as Status },
      { n: "First crew hired locally", who: "MH" as Who, s: "risk" as Status },
      { n: "50 leads before opening week", who: "PN" as Who, s: "crit" as Status },
    ],
  },
];

function PlansDemo() {
  const [sel, setSel] = useState(2);
  const plan = PLANS[sel];

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${CARD_CLS}`}>
      <div className="flex-none border-b border-[#F1EEE9] px-3.5 py-2.5">
        <p className="mb-1.5 text-[9.5px] text-brand-gray">One plan per group that needs one</p>
        <div className="grid grid-cols-3 gap-1.5">
          {PLANS.map((p, i) => (
            <button
              key={p.k}
              type="button"
              aria-pressed={sel === i}
              onClick={() => setSel(i)}
              className={`rounded-lg border px-2 py-1.5 text-left transition-colors ${
                sel === i ? "border-transparent bg-[#F7F5F1]" : "border-[#E6E2DB] hover:bg-[#FAF9F7]"
              }`}
              style={sel === i ? { boxShadow: `inset 0 0 0 1.5px ${RUST}55` } : undefined}
            >
              <span className="block truncate text-[9.5px] font-bold leading-tight">{p.label}</span>
              <span className="block truncate text-[8px] text-brand-gray">{p.sub}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-none items-center gap-2 bg-[#FAF9F7] px-3.5 py-2">
        <span className="grid h-[22px] w-[22px] flex-none place-items-center rounded-lg" style={{ background: `${RUST}1A`, color: RUST }}>
          <Users className="h-3 w-3" />
        </span>
        <span className="min-w-0 flex-1 truncate text-[11px] font-bold">
          {plan.label} Plan <span className="font-normal text-brand-gray">&middot; Q3</span>
        </span>
        <span className="flex-none text-[9px] font-semibold text-brand-orange">+ Add</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {plan.rows.map((r, i) => {
          const m = STATUS[r.s];
          return (
            <div key={r.n} className="flex items-center gap-2.5 border-b border-[#F5F2ED] px-3.5 py-[9px]">
              <span className="w-[9px] flex-none text-[9px] text-brand-gray">{i + 1}</span>
              <span className="grid h-[18px] w-[18px] flex-none place-items-center rounded-full bg-[#F1EEE9] text-[7.5px] font-bold text-brand-charcoal">
                {r.who}
              </span>
              <span className="min-w-0 flex-1 truncate text-[10.5px] font-medium">{r.n}</span>
              <span
                className="w-[52px] flex-none rounded-full py-[3px] text-center text-[8.5px] font-bold"
                style={{ background: m.bg, color: m.c }}
              >
                {m.label}
              </span>
            </div>
          );
        })}
      </div>

      <p className="flex-none border-t border-[#F1EEE9] px-3.5 py-2 text-[10px] leading-snug text-brand-gray">
        A department, a division, or a custom team you pick the people for. Same page, same rules.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- 7. Multi AI
const AI_ROWS: Row[] = [
  { name: "Cost per lead under $18", value: "Critical", hit: false, tone: "red" },
  { name: "30 new retainers signed", value: "1 of 4", hit: false, tone: "amber" },
  { name: "Cut turnaround to 6 days", value: "At Risk", hit: false, tone: "amber" },
];

const AI_INSIGHTS: Insight[] = [
  {
    tag: "Answer",
    color: RED,
    source: "Cost per lead under $18",
    text: "Cost per lead. It is the only Critical in the quarter, it has zero of four milestones done with five weeks left, and it is the parent of your second-market launch. Nothing else on the plan is both this far behind and this load-bearing.",
  },
  {
    tag: "Pattern",
    color: AMBER,
    source: "30 new retainers signed",
    text: "Jordan has posted an update every week for six weeks and the number has not moved past one of four. The updates are honest, which means the goal is wrong or the support is missing, not the effort.",
  },
  {
    tag: "Watch",
    color: AMBER,
    source: "Cut turnaround to 6 days",
    text: "This one is flagged At Risk but the last two updates both improved. Marcus is holding the flag deliberately until he sees three clean weeks. That is the opposite of the problem above.",
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
                <Tick className="mt-[3px] h-[17px] w-[17px] flex-none" style={{ color: GREEN }} />
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
export default function TeamAccountabilityPage() {
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
              <span className="grid h-[21px] w-[21px] flex-none place-items-center rounded-lg bg-gradient-to-br from-[#C9663A] to-[#8E3F1D] text-white shadow-[0_2px_6px_rgba(142,63,29,0.34),inset_0_1px_0_rgba(255,255,255,0.34)] sm:h-[34px] sm:w-[34px] sm:rounded-[11px]">
                <Target className="h-[14px] w-[14px] sm:h-[19px] sm:w-[19px]" />
              </span>
              <span className="text-[11.5px] font-[650] tracking-[0.02em] text-[#33302C] sm:text-[16.5px]">
                Team Accountability
              </span>
            </span>
            <h1 className="text-[24px] font-extrabold leading-[1.1] tracking-tight text-brand-ink sm:text-[66px] sm:leading-[1.04]">
              The whole strategy,
              <br />
              <span className="text-brand-orange">on one page.</span>
            </h1>
            <p className="mx-auto mt-3.5 max-w-2xl text-[14.5px] leading-relaxed text-brand-charcoal sm:mt-7 sm:text-xl">
              <span className="sm:hidden">
                Where you are going, what this quarter has to deliver, and one name against every
                line of it.
              </span>
              <span className="hidden sm:inline">
                Not a fifty-page plan in a drawer. One screen holding why you exist, where you are
                going, and what this quarter has to deliver, with one accountable name on every line
                and a written update against it every week.
              </span>
            </p>
          </Reveal>

          <Reveal delay={0.12} className="mt-6 sm:mt-12">
            <div
              className="overflow-hidden rounded-2xl p-2 sm:rounded-[30px] sm:p-8"
              style={{ background: "linear-gradient(160deg, #F7EDE6, #EFDCD1)" }}
            >
              <TeamAccountabilityHeroTour />
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

      {/* ------------------------------------------------ 2. one page */}
      <Section
        id="one-page"
        eyebrow="It really is one page"
        title="Why you exist, and what that means"
        swash="this quarter."
        body="The top of the plan holds the things a strategy document is usually too long to make anybody read: your purpose, your values, the vision, and an honest look at what you are good at and what could go wrong. They sit directly above the goals they are meant to be driving."
        points={[
          "A purpose statement your AI coaches read too",
          "Values, vision, and a working SWOT you actually revisit",
          "Scoped to a quarter, or to the full financial year",
        ]}
        visual={<OnePageDemo />}
        panel="linear-gradient(160deg, #FBF3EE, #F4E3D8)"
      />

      {/* ------------------------------------------------ 3. the cascade */}
      <Section
        id="cascade"
        eyebrow="Reverse engineered"
        title="Every quarterly goal knows what it is"
        swash="holding up."
        body="A quarterly goal names its annual parent. The annual goal names the long-term one. So nobody has to guess whether the work in front of them matters, and a goal that ladders up to nothing is visible as exactly that. Parents can be reassigned when the plan changes, because it will."
        points={[
          "Long-term, annual, and quarterly, in one chain",
          "Reassign a goal to a different parent without rebuilding it",
          "A parent cannot be deleted while its children still exist",
        ]}
        visual={<CascadeDemo />}
        flip
        panel="linear-gradient(160deg, #F3F0FA, #E9E4F6)"
      />

      {/* ------------------------------------------------ 4. one owner */}
      <Section
        id="owner"
        eyebrow="Goals and metrics"
        title="Personal goals, and the numbers that"
        swash="prove them."
        body="A goal says what somebody is aiming at. A metric says whether they are getting there. Pick anybody on the team and you see both: the goals they own this quarter, and the weekly numbers sitting underneath them."
        points={[
          "Every goal and every metric has one owner",
          "Weekly targets tracked across all thirteen weeks",
          "On Track, At Risk, and Critical, and nothing vaguer than that",
        ]}
        visual={<OwnerDemo />}
        panel="linear-gradient(160deg, #FDF6EE, #F9E9D8)"
      />

      {/* ------------------------------------------------ 5. the week */}
      <Section
        id="weekly"
        eyebrow="Quarter, month, week"
        title="Reverse engineered all the way down to"
        swash="this Monday."
        body="A quarterly goal breaks into monthly outcomes, and those break into the handful of things you are actually doing this week. Thirteen weeks, each one hit or missed, so a slow patch shows up while you can still do something about it rather than at the quarterly review."
        points={[
          "Thirteen weeks per goal, each one scored against a weekly target",
          "Monthly outcomes in between, so a quarter is not one long sprint",
          "Everybody plans their own week, every week, in their own view",
        ]}
        visual={<WeekDemo />}
        flip
        panel="linear-gradient(160deg, #EEF4FB, #E2ECF8)"
      />

      {/* ------------------------------------------------ 6. every team */}
      <Section
        id="plans"
        eyebrow="A plan per team"
        title="The company has one. So can every"
        swash="team in it."
        body="Run the company plan, then give Operations its own, and spin up a custom one for the eight people launching the second market. Same structure, same required owner, same weekly rhythm, scoped to the group that has to deliver it."
        points={[
          "A separate plan for a department or a division",
          "Or a custom plan for a team whose members you pick",
          "Every plan uses the same cascade and the same three statuses",
        ]}
        visual={<PlansDemo />}
        panel="linear-gradient(160deg, #EEF6F2, #E1EFE8)"
      />

      {/* ------------------------------------------------ 7. Multi AI (always last) */}
      <MultiAiWired
        heading="And somebody reads it all"
        swash="every week."
        intro="Multi AI can see every goal, every owner, every status, and every weekly update behind them. Ask it where the quarter is actually breaking and it answers from the plan, naming the goal and the person."
        prompt="What should I be worried about with five weeks left in the quarter?"
        leftLabel="The goals your team owns"
        leftColor={RUST}
        leftIcon={RowsIcon}
        rightLabel="What Multi AI reads out of them"
        panelTitle="One Page Plan · Q3"
        panelMeta="11 goals"
        panelDot={RUST}
        rows={AI_ROWS}
        insights={AI_INSIGHTS}
        aiMeta="reading 11 goals"
        footer="Multi AI reads the plan your team already keeps, and the weekly updates written against it. No status report to assemble, no separate check-in tool."
      />

      <CTA />
      <Footer />
    </main>
  );
}
