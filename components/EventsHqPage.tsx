"use client";

// The Events HQ feature page.
//
// The first of the HQ Modules to get a page of its own (SOP HQ already had
// one). Built October 2026 from fifteen client screenshots of the module and
// Multi AI's own summary of it: planning, running and wrapping up events from
// start to finish.
//
// Events HQ is a whole department rather than a single tool, so the page runs
// to five sections where the single-feature pages run to four, in the order an
// event actually happens:
//
//   1. the calendar     every event in one view, colour-coded by type
//   2. stages           six months out to the week of, tasks, templates, agendas
//   3. people           registrations, coaches and volunteers, and each
//                       contact's history across events
//   4. the portal       a branded portal attendees log in to, and the texts and
//                       emails that get them there
//   5. budget and gear  P/L on the event, and stock held from Inventory HQ until
//                       the event wraps
//
// Everything here traces to a screenshot or to the module summary. Nothing
// about limits, pricing or integrations beyond the Ontraport contact group in
// the screenshots is claimed. See docs/events-hq-feature-notes.md.
//
// No "This replaces" chip: the client named no tool this replaces, and the
// other pages only show one when they have.
import { motion } from "framer-motion";
import { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CTA from "./CTA";
import Reveal from "./Reveal";
import EventsHqHeroTour from "./EventsHqHeroTour";
import MultiAiWired from "./MultiAiWired";
import type { Row, Insight } from "./MultiAiWired";
import { useDemo } from "./DemoModal";
import { signupCta } from "@/lib/signup-cta";

const SIGNUP = signupCta();

// ---------------------------------------------------------------- tokens
const RED = "#C2412D"; // the module's own colour, from the navbar
const GREEN = "#1FA36A";
const AMBER = "#C9832B";
const NAVY = "#0F1B2D";
const AI = "#4B3CC4";
const INK = "#1B1A17";
const HAIR = "#ECEAE6";
const HAIR2 = "#E3E0DA";
const MUTED = "#8A867E";
const MUTED2 = "#A9A49B";

const PANEL_WARM = "linear-gradient(160deg, #F8E9E4, #F0D8CF)";
const PANEL_STONE = "linear-gradient(160deg, #F2EEE7, #E7E0D4)";

const colTransition = { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const };
// One height at every width. 400 on a phone clipped the last volunteer in the
// People card and the "Next up" rows in the calendar.
const CARD_CLS = "h-[440px]";

// ---------------------------------------------------------------- icons
type IconProps = { className?: string; style?: React.CSSProperties };
const ico = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const TicketIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M3.6 7.6A1.6 1.6 0 0 1 5.2 6h13.6a1.6 1.6 0 0 1 1.6 1.6v2.1a2.3 2.3 0 0 0 0 4.6v2.1a1.6 1.6 0 0 1-1.6 1.6H5.2a1.6 1.6 0 0 1-1.6-1.6v-2.1a2.3 2.3 0 0 0 0-4.6z" />
    <path d="M14.4 6.6v1.6M14.4 11.2v1.6M14.4 15.8v1.6" />
  </svg>
);
const CalIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="4" y="5.2" width="16" height="14.6" rx="2.4" />
    <path d="M4 9.6h16M8.3 3.4v3.4M15.7 3.4v3.4" />
  </svg>
);
const Tick = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2.4}>
    <path d="M5 12l5 5L20 7" />
  </svg>
);
const Arrow = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M5 12h13M12.5 5.5L19 12l-6.5 6.5" />
  </svg>
);
const StagesIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M3 7h6l2.4 5L9 17H3l2.4-5z" />
    <path d="M12.6 7h6l2.4 5-2.4 5h-6l2.4-5z" />
  </svg>
);
const PeopleIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="9" cy="8.2" r="3.2" />
    <path d="M3.4 19.2c.6-3.2 2.9-5.1 5.6-5.1s5 1.9 5.6 5.1" />
    <path d="M15.4 5.3a3 3 0 0 1 0 5.7M17.3 14.4c1.8.6 3 2.2 3.3 4.8" />
  </svg>
);
const PortalIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="3.4" y="4.4" width="13" height="10.4" rx="1.8" />
    <path d="M7.4 18.8h5" />
    <rect x="15.4" y="10.6" width="5.2" height="8.6" rx="1.2" />
  </svg>
);
const CoinsIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <ellipse cx="12" cy="7" rx="6" ry="2.7" />
    <path d="M6 7v4.3c0 1.5 2.7 2.7 6 2.7s6-1.2 6-2.7V7" />
    <path d="M6 11.3v4.3c0 1.5 2.7 2.7 6 2.7s6-1.2 6-2.7v-4.3" />
  </svg>
);
const BoxIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 3.2l7.8 4.3v9L12 20.8l-7.8-4.3v-9z" />
    <path d="M4.4 7.6L12 11.8l7.6-4.2M12 11.8v8.8" />
  </svg>
);
const GlobeIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="12" cy="12" r="8.4" />
    <path d="M3.6 12h16.8M12 3.6c2.4 2.4 3.4 5.2 3.4 8.4s-1 6-3.4 8.4c-2.4-2.4-3.4-5.2-3.4-8.4s1-6 3.4-8.4z" />
  </svg>
);
const PrintIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M7 8V3.6h10V8" />
    <rect x="3.6" y="8" width="16.8" height="8.4" rx="1.8" />
    <path d="M7 13.4h10v7H7z" />
  </svg>
);
const WarnIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 4l9 15.6H3z" />
    <path d="M12 10v4M12 17h.01" />
  </svg>
);
const RowsIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="3.4" y="5" width="17.2" height="4.2" rx="1.4" />
    <rect x="3.4" y="14.8" width="17.2" height="4.2" rx="1.4" />
  </svg>
);

/** Small labelled header shared by every section card. */
function CardHead({
  icon: Ico,
  title,
  right,
}: {
  icon: (p: IconProps) => React.JSX.Element;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-none items-center gap-2 border-b px-4 py-2.5" style={{ borderColor: HAIR }}>
      <Ico className="h-[15px] w-[15px] flex-none" style={{ color: RED }} />
      <span className="truncate text-[12.5px] font-bold">{title}</span>
      {right && <span className="ml-auto flex flex-none items-center gap-1.5">{right}</span>}
    </div>
  );
}

// ---------------------------------------------------------------- 1. the calendar
// Event types and their colours, the legend the calendar paints with. Set once
// in Events HQ settings; these are Ridgeline's, not the client's.
const TYPES = [
  { k: "Summit", c: "#2F6FE4" },
  { k: "Retreat", c: "#0F9488" },
  { k: "Bootcamp", c: "#E2701F" },
  { k: "Intensive", c: "#7A4EDB" },
  { k: "Gala", c: "#C2398F" },
] as const;
type TypeKey = (typeof TYPES)[number]["k"];

// Fourth quarter 2026. Months are 0-based for Date.
const CAL_EVENTS: { type: TypeKey | "Protected" | "Holiday"; m: number; days: number[]; n: string }[] = [
  { type: "Protected", m: 9, days: [15, 16], n: "Protected: Summit prep" },
  { type: "Summit", m: 9, days: [22, 23, 24], n: "Leaders Summit 2026" },
  { type: "Retreat", m: 9, days: [29, 30, 31], n: "Founders Retreat" },
  { type: "Bootcamp", m: 10, days: [5, 6], n: "Sales Bootcamp" },
  { type: "Intensive", m: 10, days: [12, 13, 14], n: "Leadership Intensive" },
  { type: "Bootcamp", m: 10, days: [19, 20], n: "Sales Bootcamp II" },
  { type: "Gala", m: 11, days: [5], n: "Winter Gala" },
  { type: "Retreat", m: 11, days: [10, 11, 12], n: "Year-end Retreat" },
  { type: "Holiday", m: 11, days: [24, 25], n: "Holiday" },
];
const MONTHS = [
  { m: 9, label: "October 2026" },
  { m: 10, label: "November 2026" },
  { m: 11, label: "December 2026" },
];

function colorOf(type: (typeof CAL_EVENTS)[number]["type"]) {
  if (type === "Protected") return "#16130F";
  if (type === "Holiday") return "#A3A3A3";
  return TYPES.find((t) => t.k === type)!.c;
}

function MonthGrid({ m, label, only }: { m: number; label: string; only: TypeKey | null }) {
  const first = new Date(2026, m, 1).getDay();
  const days = new Date(2026, m + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);

  const eventOn = (d: number) => CAL_EVENTS.find((e) => e.m === m && e.days.includes(d));

  return (
    <div className="min-w-0 rounded-[10px] border bg-white p-2" style={{ borderColor: HAIR }}>
      <div className="mb-1.5 rounded-[6px] py-1 text-center text-[10px] font-bold text-white" style={{ background: NAVY }}>
        {label}
      </div>
      <div className="grid grid-cols-7 gap-[2px] text-center">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i} className="pb-0.5 text-[8px] font-bold" style={{ color: MUTED2 }}>
            {d}
          </span>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <span key={i} />;
          const e = eventOn(d);
          // A type filter fades every typed event that is not the one picked.
          // Protected days and holidays stay, because they block the calendar
          // whatever you are looking for.
          const faded = e && only && e.type !== only && e.type !== "Protected" && e.type !== "Holiday";
          return (
            <span
              key={i}
              title={e?.n}
              className="grid aspect-square place-items-center rounded-[3px] text-[8.5px] tabular-nums transition-all duration-300"
              style={
                e
                  ? { background: colorOf(e.type), color: "#fff", fontWeight: 700, opacity: faded ? 0.18 : 1 }
                  : { color: "#5C5852" }
              }
            >
              {d}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function CalendarDemo() {
  const [only, setOnly] = useState<TypeKey | null>(null);
  const shown = CAL_EVENTS.filter((e) => e.type !== "Protected" && e.type !== "Holiday" && (!only || e.type === only));
  return (
    <div className={`relative flex flex-col overflow-hidden rounded-[18px] border bg-white ${CARD_CLS}`} style={{ borderColor: HAIR }}>
      <CardHead
        icon={CalIcon}
        title="Calendar · 2026"
        right={
          <span className="flex rounded-[7px] border p-[2px] text-[9.5px] font-semibold" style={{ borderColor: HAIR2 }}>
            {["Year", "Month", "List"].map((v, i) => (
              <span key={v} className="rounded-[5px] px-1.5 py-[2px]" style={i === 0 ? { background: NAVY, color: "#fff" } : { color: MUTED }}>
                {v}
              </span>
            ))}
          </span>
        }
      />

      <div className="flex flex-none flex-wrap gap-1.5 px-4 pt-3">
        <button
          type="button"
          onClick={() => setOnly(null)}
          className="rounded-full border px-2.5 py-1 text-[10.5px] font-semibold transition-colors"
          style={only === null ? { borderColor: INK, background: INK, color: "#fff" } : { borderColor: HAIR2, color: MUTED }}
        >
          All types
        </button>
        {TYPES.map((t) => (
          <button
            key={t.k}
            type="button"
            onClick={() => setOnly(only === t.k ? null : t.k)}
            className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-semibold transition-colors"
            style={only === t.k ? { borderColor: t.c, background: `${t.c}14`, color: t.c } : { borderColor: HAIR2, color: MUTED }}
          >
            <span className="h-[7px] w-[7px] rounded-[2px]" style={{ background: t.c }} />
            {t.k}
          </button>
        ))}
      </div>

      {/* Two months on a phone, three from sm up: at 390 three grids would put
          the day numbers below a readable size. */}
      <div className="grid flex-none grid-cols-2 gap-2 px-4 pt-3 sm:grid-cols-3">
        {MONTHS.map((mo, i) => (
          <div key={mo.m} className={i === 2 ? "hidden sm:block" : ""}>
            <MonthGrid m={mo.m} label={mo.label} only={only} />
          </div>
        ))}
      </div>

      {/* The list view's dated rows, under the grids, following the same filter. */}
      <div className="min-h-0 flex-1 overflow-hidden px-4 pt-3">
        <div className="mb-1.5 text-[8.5px] font-bold uppercase tracking-[0.1em]" style={{ color: MUTED2 }}>
          Next up
        </div>
        {/* Three rows from sm up, two on a phone, where the chips wrap to two
            lines and leave room for only two above the footer. */}
        {shown.slice(0, 3).map((e, i) => (
          <div
            key={e.n}
            className={`items-center gap-2 border-b py-[5px] text-[10.5px] last:border-b-0 ${i === 2 ? "hidden sm:flex" : "flex"}`}
            style={{ borderColor: HAIR }}
          >
            <span className="h-[8px] w-[8px] flex-none rounded-[2px]" style={{ background: colorOf(e.type) }} />
            <span className="min-w-0 flex-1 truncate font-semibold">{e.n}</span>
            <span className="flex-none tabular-nums" style={{ color: MUTED }}>
              {MONTHS.find((mo) => mo.m === e.m)!.label.slice(0, 3)} {e.days[0]}
              {e.days.length > 1 ? `–${e.days[e.days.length - 1]}` : ""}
            </span>
          </div>
        ))}
      </div>

      <div className="mx-4 mb-4 flex flex-none items-center gap-2 rounded-[10px] border px-3 py-2" style={{ borderColor: HAIR2, background: "#FBFAF8" }}>
        {/* The legend and the button's label drop on a phone, where all three
            wrapped the footer onto three lines. */}
        <span className="hidden items-center gap-1.5 text-[10.5px] sm:flex" style={{ color: MUTED }}>
          <span className="h-[8px] w-[8px] rounded-[2px]" style={{ background: "#16130F" }} />
          Protected day
        </span>
        <span className="truncate text-[10.5px] font-semibold">
          {shown.length} {only ? `${only.toLowerCase()} ` : ""}event{shown.length === 1 ? "" : "s"} this quarter
        </span>
        <span className="ml-auto flex flex-none items-center gap-1 rounded-[7px] border bg-white px-2 py-[3px] text-[10px] font-semibold" style={{ borderColor: HAIR2 }}>
          <PrintIcon className="h-[11px] w-[11px]" />
          <span className="hidden sm:inline">Export PDF</span>
          <span className="sm:hidden">PDF</span>
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 2. stages and tasks
const STAGES = ["6 Months out", "4 Months out", "3 Months out", "2 Months out", "1 Month out", "2 Weeks out", "1 Week out", "Week of"];
/** What the chevrons print. Eight full names do not fit a 500px card; the full
 * name of the picked stage is spelled out underneath instead. */
const STAGE_SHORT = ["6 mo", "4 mo", "3 mo", "2 mo", "1 mo", "2 wk", "1 wk", "Week of"];
const STAGE_NOW = 5;

// Three tasks per stage, the kind every event template carries. The template
// decides them once; every event built from it starts with them.
const STAGE_TASKS: string[][] = [
  ["Book the venue", "Set ticket pricing", "Open registrations"],
  ["Lock the speaker lineup", "Reserve a hotel room block", "Build the event page"],
  ["Order attendee shirts", "Confirm the catering menu", "Recruit volunteers"],
  ["Assign coaches", "Order signage", "Send the save-the-date"],
  ["Finalize the run of show", "Confirm the AV vendor", "Volunteer training call"],
  ["Confirm hotel block and catering count", "Print name badges and handouts", "Send arrival details"],
  ["Pack the event kits", "Final headcount to the venue", "Volunteer group chat"],
  ["Load in and set up", "Open the registration desk", "Send the post-event survey"],
];
const OWNERS = [
  { i: "DW", n: "Dana" },
  { i: "PN", n: "Priya" },
  { i: "MH", n: "Marcus" },
];

function StagesDemo() {
  const [pick, setPick] = useState(STAGE_NOW);
  const statusFor = (stage: number, task: number) =>
    stage < STAGE_NOW ? "Completed" : stage > STAGE_NOW ? "Not started" : (["Completed", "In progress", "Not started"] as const)[task];

  return (
    <div className={`relative flex flex-col overflow-hidden rounded-[18px] border bg-white ${CARD_CLS}`} style={{ borderColor: HAIR }}>
      <CardHead
        icon={StagesIcon}
        title="Leaders Summit 2026"
        right={
          <span className="rounded-full px-2 py-[2px] text-[10px] font-bold" style={{ background: `${RED}14`, color: RED }}>
            8 days to go
          </span>
        }
      />

      {/* The stage bar scrolls sideways inside the card on a phone rather than
          squeezing eight labels into 330px. */}
      <div className="scrollbar-none flex-none overflow-x-auto px-4 pt-3">
        <div className="flex min-w-[480px]">
          {STAGES.map((s, i) => {
            const complete = i < STAGE_NOW;
            const current = i === STAGE_NOW;
            const picked = i === pick;
            const clip =
              i === 0
                ? "polygon(0 0, calc(100% - 9px) 0, 100% 50%, calc(100% - 9px) 100%, 0 100%)"
                : "polygon(0 0, calc(100% - 9px) 0, 100% 50%, calc(100% - 9px) 100%, 0 100%, 9px 50%)";
            return (
              <button
                key={s}
                type="button"
                onClick={() => setPick(i)}
                className="flex min-w-0 flex-1 flex-col justify-center py-[6px] text-left transition-[filter] duration-200"
                style={{
                  background: complete ? GREEN : current ? NAVY : "#ECEAE5",
                  color: complete || current ? "#fff" : MUTED,
                  clipPath: clip,
                  marginLeft: i === 0 ? 0 : -5,
                  paddingLeft: i === 0 ? 9 : 14,
                  paddingRight: 9,
                  filter: picked ? "none" : "saturate(0.75) brightness(1.04)",
                  boxShadow: picked ? "inset 0 -3px 0 rgba(255,255,255,0.55)" : "none",
                }}
              >
                <span className="truncate text-[9.5px] font-bold">{STAGE_SHORT[i]}</span>
                <span className="truncate text-[8px]" style={{ opacity: 0.85 }}>
                  {complete ? "Done" : current ? "Now" : "Next"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 px-4 pt-3">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-bold">{STAGES[pick]}</span>
          <span className="text-[10px]" style={{ color: MUTED }}>
            {pick < STAGE_NOW ? "Complete" : pick === STAGE_NOW ? "Happening now" : "Upcoming"}
          </span>
          <span className="ml-auto text-[10px] tabular-nums" style={{ color: MUTED }}>
            {pick < STAGE_NOW ? 3 : pick === STAGE_NOW ? 1 : 0} of 3 done
          </span>
        </div>
        <div className="mb-2.5 mt-1.5 h-[4px] overflow-hidden rounded-full" style={{ background: "#EEECE8" }}>
          <div
            className="h-full rounded-full transition-[width] duration-300"
            style={{ width: `${((pick < STAGE_NOW ? 3 : pick === STAGE_NOW ? 1 : 0) / 3) * 100}%`, background: GREEN }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          {STAGE_TASKS[pick].map((t, j) => {
            const status = statusFor(pick, j);
            const done = status === "Completed";
            const tone =
              status === "Completed"
                ? { background: `${GREEN}16`, color: GREEN }
                : status === "In progress"
                  ? { background: `${AMBER}18`, color: AMBER }
                  : { background: "#EEECE8", color: MUTED };
            return (
              <div key={t} className="flex items-center gap-2.5 rounded-[10px] border px-3 py-2" style={{ borderColor: HAIR }}>
                <span
                  className="grid h-[15px] w-[15px] flex-none place-items-center rounded-full border-[1.5px]"
                  style={done ? { background: GREEN, borderColor: GREEN, color: "#fff" } : { borderColor: "#C9C5BD" }}
                >
                  {done && <Tick className="h-[9px] w-[9px]" />}
                </span>
                <span
                  className="min-w-0 flex-1 truncate text-[11px]"
                  style={{ color: done ? MUTED2 : INK, textDecoration: done ? "line-through" : "none" }}
                >
                  {t}
                </span>
                <span
                  className="hidden h-[18px] w-[18px] flex-none place-items-center rounded-full text-[7px] font-bold sm:grid"
                  style={{ background: "#EEECE8", color: "#5C5852" }}
                  title={OWNERS[j].n}
                >
                  {OWNERS[j].i}
                </span>
                <span className="w-[66px] flex-none rounded-full py-[2px] text-center text-[8.5px] font-bold" style={tone}>
                  {status}
                </span>
              </div>
            );
          })}
          <div
            className="flex items-center justify-between rounded-[10px] border border-dashed px-3 py-2 text-[10.5px]"
            style={{ borderColor: HAIR2, color: MUTED2 }}
          >
            Add a task to {STAGES[pick]}…
            <span className="rounded-[6px] px-2 py-[2px] text-[9.5px] font-bold text-white" style={{ background: "#9A968E" }}>
              + Add
            </span>
          </div>
        </div>
      </div>

      <div className="mx-4 mb-4 mt-3 grid flex-none grid-cols-2 gap-2">
        <div className="rounded-[10px] border px-3 py-2" style={{ borderColor: HAIR2, background: "#FBFAF8" }}>
          <div className="text-[8.5px] font-bold uppercase tracking-[0.1em]" style={{ color: MUTED2 }}>
            Built from
          </div>
          <div className="mt-0.5 truncate text-[11px] font-semibold">Summit template</div>
          <div className="truncate text-[9.5px]" style={{ color: MUTED }}>
            8 stages · 96 tasks · 40 inventory
          </div>
        </div>
        <div className="rounded-[10px] border px-3 py-2" style={{ borderColor: HAIR2, background: "#FBFAF8" }}>
          <div className="text-[8.5px] font-bold uppercase tracking-[0.1em]" style={{ color: MUTED2 }}>
            Agenda
          </div>
          <div className="mt-0.5 truncate text-[11px] font-semibold">Summit run of show</div>
          <div className="truncate text-[9.5px]" style={{ color: MUTED }}>
            3 days · 64 rows, from the library
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 3. people
type Badge = "Team" | "External";
const REGISTRATIONS = [
  { n: "Elena Cruz", e: "Leaders Summit 2026", when: "Registered today" },
  { n: "Noah Bennett", e: "Leaders Summit 2026", when: "Registered yesterday" },
  { n: "Grace Okafor", e: "Founders Retreat", when: "Registered Oct 12" },
  { n: "Samuel Ortiz", e: "Sales Bootcamp", when: "Registered Oct 10" },
];
const COACHES: { n: string; role: string; b: Badge }[] = [
  { n: "Dana Whitfield", role: "Head coach", b: "Team" },
  { n: "Marcus Hale", role: "Logistics coach", b: "Team" },
  { n: "Jordan Rivera", role: "Small group coach", b: "External" },
];
const VOLUNTEERS: { n: string; s: "Approved" | "Pending" }[] = [
  { n: "Priya Nair", s: "Approved" },
  { n: "Theo Barnes", s: "Approved" },
  { n: "Avery Rowe", s: "Pending" },
];
// A contact's Events card: every registration and every role, across events.
const HISTORY = [
  { e: "Sales Bootcamp", when: "Mar 2025", role: "Attendee" },
  { e: "Leaders Summit 2025", when: "Oct 2025", role: "Attendee" },
  { e: "Founders Retreat", when: "Apr 2026", role: "Volunteer" },
  { e: "Leaders Summit 2026", when: "Oct 2026", role: "Registered" },
];

const initials = (n: string) =>
  n
    .split(" ")
    .map((w) => w[0])
    .join("");

function PeopleDemo() {
  const [tab, setTab] = useState<"registrations" | "staff" | "history">("staff");
  const [approved, setApproved] = useState(false);
  // `s` is the label on a phone, where "Coaches & volunteers" truncated.
  const tabs = [
    { k: "registrations", l: "Registrations", s: "Registrations" },
    { k: "staff", l: "Coaches & volunteers", s: "Staff" },
    { k: "history", l: "Contact history", s: "History" },
  ] as const;

  return (
    <div className={`relative flex flex-col overflow-hidden rounded-[18px] border bg-white ${CARD_CLS}`} style={{ borderColor: HAIR }}>
      <CardHead
        icon={PeopleIcon}
        title="Leaders Summit 2026"
        right={
          <span className="text-[10px] font-semibold tabular-nums" style={{ color: MUTED }}>
            137 / 140 registered
          </span>
        }
      />

      <div className="flex flex-none gap-1 px-4 pt-3">
        {tabs.map((t) => (
          <button
            key={t.k}
            type="button"
            onClick={() => setTab(t.k)}
            className="flex-1 truncate rounded-[8px] px-2 py-1.5 text-[10.5px] font-semibold transition-colors"
            style={tab === t.k ? { background: NAVY, color: "#fff" } : { background: "#F3F1EC", color: MUTED }}
          >
            <span className="hidden sm:inline">{t.l}</span>
            <span className="sm:hidden">{t.s}</span>
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-4 pt-3">
        {tab === "registrations" && (
          <div className="flex flex-col gap-1.5">
            {REGISTRATIONS.map((r) => (
              <div key={r.n} className="flex items-center gap-2.5 rounded-[10px] border px-3 py-2" style={{ borderColor: HAIR }}>
                <span className="grid h-[26px] w-[26px] flex-none place-items-center rounded-full text-[9px] font-bold" style={{ background: `${RED}14`, color: RED }}>
                  {initials(r.n)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[11.5px] font-semibold">{r.n}</span>
                  <span className="block truncate text-[9.5px]" style={{ color: MUTED }}>
                    {r.e}
                  </span>
                </span>
                <span className="flex-none text-[9.5px]" style={{ color: MUTED2 }}>
                  {r.when}
                </span>
              </div>
            ))}
            <div className="mt-1 text-center text-[10px]" style={{ color: MUTED2 }}>
              Every registration across every event, in one list
            </div>
          </div>
        )}

        {tab === "staff" && (
          <div>
            <div className="mb-1.5 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.1em]" style={{ color: MUTED2 }}>
              Coaches 3
              <span className="ml-auto rounded-full px-2 py-[1px] text-[9.5px] normal-case tracking-normal" style={{ background: `${RED}12`, color: RED }}>
                Coaching ratio 45.7
              </span>
            </div>
            <div className="flex flex-col gap-1">
              {COACHES.map((c) => (
                <div key={c.n} className="flex items-center gap-2.5 rounded-[9px] border px-3 py-[7px]" style={{ borderColor: HAIR }}>
                  <span className="grid h-[22px] w-[22px] flex-none place-items-center rounded-full text-[8px] font-bold" style={{ background: "#EEECE8", color: "#5C5852" }}>
                    {initials(c.n)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[11px] font-semibold">{c.n}</span>
                  <span className="hidden truncate text-[9.5px] sm:inline" style={{ color: MUTED }}>
                    {c.role}
                  </span>
                  <span
                    className="flex-none rounded-[5px] px-1.5 py-[1px] text-[8.5px] font-bold uppercase"
                    style={c.b === "Team" ? { background: "#E8EEF8", color: "#2F5FA8" } : { background: "#FBF0DF", color: AMBER }}
                  >
                    {c.b}
                  </span>
                </div>
              ))}
            </div>
            <div className="mb-1.5 mt-3 text-[9px] font-bold uppercase tracking-[0.1em]" style={{ color: MUTED2 }}>
              Volunteers 3
            </div>
            <div className="flex flex-col gap-1">
              {VOLUNTEERS.map((v) => {
                const ok = v.s === "Approved" || approved;
                return (
                  <div
                    key={v.n}
                    className="flex items-center gap-2.5 rounded-[9px] border border-l-[3px] px-3 py-[7px] transition-colors duration-300"
                    style={{ borderColor: HAIR, borderLeftColor: ok ? GREEN : AMBER, background: ok ? "#F3FAF6" : "#FDF7EC" }}
                  >
                    <span className="min-w-0 flex-1 truncate text-[11px] font-semibold">{v.n}</span>
                    {!ok ? (
                      <button
                        type="button"
                        onClick={() => setApproved(true)}
                        className="flex-none rounded-[6px] px-2 py-[2px] text-[9.5px] font-bold text-white"
                        style={{ background: GREEN }}
                      >
                        Approve
                      </button>
                    ) : null}
                    <span
                      className="flex flex-none items-center gap-1 rounded-full px-2 py-[1px] text-[8.5px] font-bold uppercase"
                      style={ok ? { background: `${GREEN}18`, color: GREEN } : { background: `${AMBER}1F`, color: AMBER }}
                    >
                      <span className="h-[5px] w-[5px] rounded-full" style={{ background: ok ? GREEN : AMBER }} />
                      {ok ? "Approved" : "Pending"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "history" && (
          <div>
            <div className="flex items-center gap-2.5 rounded-[10px] border px-3 py-2.5" style={{ borderColor: HAIR, background: "#FBFAF8" }}>
              <span className="grid h-[28px] w-[28px] place-items-center rounded-full text-[9.5px] font-bold" style={{ background: `${RED}14`, color: RED }}>
                EC
              </span>
              <span className="min-w-0">
                <span className="block text-[11.5px] font-bold">Elena Cruz</span>
                <span className="block text-[9.5px]" style={{ color: MUTED }}>
                  CRM contact · Events card
                </span>
              </span>
              <span className="ml-auto flex-none text-[10px] font-semibold" style={{ color: MUTED }}>
                4 events
              </span>
            </div>
            <div className="ml-4 mt-2 border-l-2 pl-3" style={{ borderColor: HAIR2 }}>
              {HISTORY.map((h, i) => (
                <div key={h.e} className="relative flex items-center gap-2 py-[6px]">
                  <span
                    className="absolute -left-[18px] h-[9px] w-[9px] rounded-full border-2 bg-white"
                    style={{ borderColor: i === HISTORY.length - 1 ? RED : MUTED2 }}
                  />
                  <span className="min-w-0 flex-1 truncate text-[11px] font-semibold">{h.e}</span>
                  <span className="flex-none text-[9.5px]" style={{ color: MUTED }}>
                    {h.when}
                  </span>
                  <span
                    className="w-[64px] flex-none rounded-full py-[1px] text-center text-[8.5px] font-bold"
                    style={h.role === "Volunteer" ? { background: `${GREEN}16`, color: GREEN } : { background: "#EEECE8", color: "#5C5852" }}
                  >
                    {h.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mx-4 mb-4 flex flex-none items-center gap-2 rounded-[10px] border px-3 py-2 text-[10.5px]" style={{ borderColor: HAIR2, background: "#FBFAF8", color: MUTED }}>
        <TicketIcon className="h-[12px] w-[12px] flex-none" style={{ color: RED }} />
        <span className="truncate">
          {tab === "history"
            ? "Who has done what, before they sign up for what comes next."
            : tab === "staff"
              ? "Coaches and volunteers come from each event's roster."
              : "Register someone straight from their CRM record."}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 4. the portal
// The Invite text follows the client's own default almost word for word. The
// other three are written in the same voice; the client's screenshot shows only
// the Invite tab's copy.
const MESSAGES = {
  Invite: {
    when: "The first time someone is added to the portal.",
    text: "Elena, you're in. Your Ridgeline Portal is ready. Everything for Leaders Summit 2026 lives there: logistics, your hotel, your intake form and who to call. Log in here: portal.ridgeline.com/…",
    subject: "You're in, Elena. Your Ridgeline Portal is ready",
  },
  "New event": {
    when: "When someone already in the portal joins another event.",
    text: "Elena, Founders Retreat (Oct 29 to 31) is in your Ridgeline Portal now, next to everything else you're registered for. Log in here: portal.ridgeline.com/…",
    subject: "Founders Retreat is in your Ridgeline Portal",
  },
  Reminder: {
    when: "Ahead of the event, for anyone with something still to do.",
    text: "Elena, Leaders Summit 2026 starts Thursday. You still have your intake form to finish, and it takes two minutes. Log in here: portal.ridgeline.com/…",
    subject: "Leaders Summit 2026 starts Thursday",
  },
  "Follow-up": {
    when: "After the event.",
    text: "Thanks for being at Leaders Summit 2026, Elena. Your notes and next steps are waiting in your Ridgeline Portal. Log in here: portal.ridgeline.com/…",
    subject: "Your next steps from Leaders Summit 2026",
  },
} as const;
type MessageKey = keyof typeof MESSAGES;

function PortalDemo() {
  const [msg, setMsg] = useState<MessageKey>("Invite");
  return (
    <div className={`relative flex flex-col overflow-hidden rounded-[18px] border bg-white ${CARD_CLS}`} style={{ borderColor: HAIR }}>
      <CardHead
        icon={PortalIcon}
        title="Client Portal"
        right={
          <span className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: GREEN }}>
            <span className="h-[6px] w-[6px] rounded-full" style={{ background: GREEN }} />
            Live
          </span>
        }
      />

      <div className="flex flex-none items-center gap-2.5 px-4 pt-3">
        <span className="grid h-[34px] w-[34px] flex-none place-items-center rounded-[9px] text-[13px] font-extrabold" style={{ background: "#121417", color: "#D4A54A" }}>
          R
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12px] font-bold">Ridgeline Portal</span>
          <span className="flex items-center gap-1 truncate font-mono text-[9.5px]" style={{ color: MUTED }}>
            <GlobeIcon className="h-[10px] w-[10px] flex-none" />
            portal.ridgeline.com
          </span>
        </span>
        <span className="flex flex-none gap-1">
          {["#121417", "#1C2230", "#D4A54A", "#F5F3EE"].map((c) => (
            <span key={c} className="h-[14px] w-[14px] rounded-[4px] border" style={{ background: c, borderColor: HAIR2 }} />
          ))}
        </span>
      </div>

      <div className="flex flex-none gap-1 px-4 pt-3">
        {(Object.keys(MESSAGES) as MessageKey[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setMsg(k)}
            className="flex-1 truncate rounded-[8px] px-1.5 py-1.5 text-[10.5px] font-semibold transition-colors"
            style={msg === k ? { background: NAVY, color: "#fff" } : { background: "#F3F1EC", color: MUTED }}
          >
            {k}
          </button>
        ))}
      </div>
      <div className="flex-none px-4 pt-2 text-[10px]" style={{ color: MUTED }}>
        {MESSAGES[msg].when}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 px-4 pt-2.5 sm:grid-cols-[1fr_150px]">
        <div className="min-w-0">
          <div className="mb-1 text-[8.5px] font-bold uppercase tracking-[0.1em]" style={{ color: MUTED2 }}>
            Text message
          </div>
          <div key={msg} className="rounded-[14px] rounded-tl-[4px] px-3 py-2.5 text-[11px] leading-snug" style={{ background: "#ECEDF1", color: "#2A2C33" }}>
            {MESSAGES[msg].text}
          </div>
          <div className="mb-1 mt-3 text-[8.5px] font-bold uppercase tracking-[0.1em]" style={{ color: MUTED2 }}>
            Email subject
          </div>
          <div className="truncate rounded-[9px] border px-3 py-2 text-[11px] font-semibold" style={{ borderColor: HAIR2 }}>
            {MESSAGES[msg].subject}
          </div>
          <div className="mt-2 text-[9.5px]" style={{ color: MUTED2 }}>
            Every message carries a one-time login link. Replies to texts land in CRM Conversations.
          </div>
        </div>

        {/* The portal itself is dark, the way attendees see it. Hidden on a
            phone: the message is the part of this card that has to read. */}
        <div className="hidden overflow-hidden rounded-[12px] p-3 text-white sm:block" style={{ background: "#121417" }}>
          <div className="text-[9px] font-semibold" style={{ color: "#D4A54A" }}>
            Welcome to Ridgeline
          </div>
          <div className="mt-0.5 text-[11.5px] font-bold leading-tight">Leaders Summit 2026</div>
          <div className="mt-2.5 flex flex-col gap-1.5">
            {[
              ["Intake form", false],
              ["Your hotel", true],
              ["Logistics", true],
              ["Who to call", true],
            ].map(([l, ok]) => (
              <div key={l as string} className="flex items-center gap-1.5 rounded-[7px] px-2 py-1.5 text-[9.5px]" style={{ background: "#1C2230" }}>
                <span
                  className="grid h-[11px] w-[11px] flex-none place-items-center rounded-full border"
                  style={ok ? { background: "#D4A54A", borderColor: "#D4A54A", color: "#121417" } : { borderColor: "#5B6170" }}
                >
                  {ok ? <Tick className="h-[7px] w-[7px]" /> : null}
                </span>
                {l as string}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 5. budget and inventory
const BUDGET_LINES = [
  { l: "Venue", plan: 9800, spent: 9800 },
  { l: "Catering", plan: 7200, spent: 6950 },
  { l: "Attendee shirts", plan: 2400, spent: 2310 },
  { l: "AV and staging", plan: 3000, spent: 3480 },
];
const HELD = [
  { l: "Attendee shirts, S to XXL", n: 42 },
  { l: "Name badge kits", n: 18 },
  { l: "Event kits", n: 8 },
  { l: "Banner stands", n: 4 },
];
const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

function BudgetDemo() {
  const [released, setReleased] = useState(false);
  const held = HELD.reduce((s, h) => s + h.n, 0);
  const spent = BUDGET_LINES.reduce((s, b) => s + b.spent, 0);
  return (
    <div className={`relative flex flex-col overflow-hidden rounded-[18px] border bg-white ${CARD_CLS}`} style={{ borderColor: HAIR }}>
      <CardHead
        icon={CoinsIcon}
        title="Founders Retreat"
        right={
          <span className="rounded-full px-2 py-[2px] text-[10px] font-bold" style={{ background: "#EEECE8", color: MUTED }}>
            Ended Oct 31
          </span>
        }
      />

      {/* The banner Events HQ shows across the top of the module while a
          finished event is still holding stock. */}
      <div
        className="mx-4 mt-3 flex flex-none items-center gap-2 rounded-[10px] border px-3 py-2 text-[10.5px] transition-colors duration-300"
        style={
          released
            ? { borderColor: `${GREEN}55`, background: "#EEF8F2", color: "#17714A" }
            : { borderColor: "#EED9A6", background: "#FCF5E6", color: "#7A5418" }
        }
      >
        {released ? <Tick className="h-[13px] w-[13px] flex-none" /> : <WarnIcon className="h-[13px] w-[13px] flex-none" />}
        <span className="min-w-0 flex-1 leading-snug">
          {released ? (
            <>
              <b>Released.</b> {held} items count as stock again in Inventory HQ.
            </>
          ) : (
            <>
              <b>This event is over and still holding stock.</b> Release the holds so those items count against what you can sell.
            </>
          )}
        </span>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 px-4 pt-3 sm:grid-cols-2">
        <div className="min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[20px] font-bold tabular-nums" style={{ color: GREEN }}>
              +$16,660
            </span>
            <span className="text-[10px] font-semibold" style={{ color: MUTED }}>
              P/L
            </span>
          </div>
          <div className="text-[10px] tabular-nums" style={{ color: MUTED }}>
            Plan +$14,000 · Spent {usd(spent)}
          </div>
          {/* The line items give way on a phone, where the two columns stack: the
              held stock is what the banner is about, so that half has to stay. */}
          <div className="mb-1 mt-3 hidden text-[8.5px] font-bold uppercase tracking-[0.1em] sm:block" style={{ color: MUTED2 }}>
            Spent against plan
          </div>
          <div className="hidden flex-col gap-1.5 sm:flex">
            {BUDGET_LINES.map((b) => {
              const over = b.spent > b.plan;
              return (
                <div key={b.l} className="text-[10.5px]">
                  <div className="flex">
                    <span className="truncate">{b.l}</span>
                    <span className="ml-auto tabular-nums" style={{ color: over ? "#C0402B" : INK }}>
                      {usd(b.spent)}
                    </span>
                  </div>
                  <div className="mt-[3px] h-[4px] overflow-hidden rounded-full" style={{ background: "#EEECE8" }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.min(100, (b.spent / b.plan) * 100)}%`, background: over ? "#C0402B" : NAVY }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {/* Budgets are their own permission in Events HQ settings. */}
          <div className="mt-3 flex items-center gap-1.5 rounded-[8px] border px-2.5 py-1.5 text-[10px]" style={{ borderColor: HAIR, color: MUTED }}>
            <svg className="h-[11px] w-[11px] flex-none" {...ico}>
              <rect x="4.6" y="10.4" width="14.8" height="9.8" rx="2" />
              <path d="M8 10.4V7.4a4 4 0 0 1 8 0v3" />
            </svg>
            Only people with budget access see this
          </div>
        </div>

        <div className="min-w-0 self-start rounded-[12px] border p-3" style={{ borderColor: HAIR, background: "#FBFAF8" }}>
          <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.1em]" style={{ color: MUTED2 }}>
            <BoxIcon className="h-[11px] w-[11px]" />
            Held from Inventory HQ
          </div>
          <div className="mt-1.5 flex flex-col gap-[5px]">
            {HELD.map((h) => (
              <div key={h.l} className="flex items-center text-[10.5px]">
                <span className="truncate" style={{ color: released ? MUTED2 : INK, textDecoration: released ? "line-through" : "none" }}>
                  {h.l}
                </span>
                <span className="ml-auto pl-2 tabular-nums font-semibold" style={{ color: released ? MUTED2 : INK }}>
                  {h.n}
                </span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setReleased((r) => !r)}
            className="mt-2.5 w-full rounded-[8px] py-1.5 text-[10.5px] font-bold transition-colors"
            style={released ? { background: "#EEECE8", color: MUTED } : { background: NAVY, color: "#fff" }}
          >
            {released ? "Undo" : `Release ${held} held items`}
          </button>
        </div>
      </div>
      <div className="mx-4 mb-4 flex flex-none items-center gap-2 rounded-[10px] border px-3 py-2 text-[10.5px]" style={{ borderColor: HAIR2, background: "#FBFAF8", color: MUTED }}>
        <BoxIcon className="h-[12px] w-[12px] flex-none" style={{ color: RED }} />
        <span className="truncate">Shirt sizes were counted from the attendee list, against real stock.</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Multi AI
const AI_ROWS: Row[] = [
  { name: "Leaders Summit 2026", value: "137 / 140", hit: true },
  { name: "Founders Retreat", value: "31 / 60", hit: false, tone: "amber" },
  { name: "Sales Bootcamp", value: "4 tasks late", hit: false, tone: "red" },
  { name: "Leadership Intensive", value: "12 volunteers", hit: true },
];

const AI_INSIGHTS: Insight[] = [
  {
    tag: "Staffing",
    color: "#C0402B",
    source: "Leaders Summit 2026",
    text: "137 registered against three coaches is a coaching ratio of 45.7. Your last two summits ran closer to 15. Add coaches before Thursday.",
  },
  {
    tag: "Behind",
    color: AMBER,
    source: "Sales Bootcamp",
    text: "Four tasks in the 1 Month out stage are past due, and all four sit with one person. The run of show is one of them.",
  },
  {
    tag: "Pattern",
    color: AI,
    source: "Founders Retreat",
    text: "Nine of the 31 registrants have no earlier Ridgeline event on their record. Most retreat attendees came through a Summit first.",
  },
];

// ---------------------------------------------------------------- the page
export default function EventsHqPage() {
  const { openDemo } = useDemo();

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* ------------------------------------------------ hero */}
      <section className="relative overflow-hidden px-5 pb-4 pt-6 sm:px-8 sm:pb-8 sm:pt-16">
        <div className="mx-auto max-w-container">
          <Reveal className="mx-auto max-w-4xl text-center">
            <span
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] sm:text-[12px]"
              style={{ borderColor: `${RED}33`, background: `${RED}0F`, color: RED }}
            >
              <TicketIcon className="h-[14px] w-[14px] sm:h-[19px] sm:w-[19px]" />
              Events HQ
            </span>

            <h1 className="mt-5 text-[24px] font-extrabold leading-[1.1] tracking-tight text-brand-ink sm:mt-7 sm:text-[66px] sm:leading-[1.04]">
              Plan it, run it, wrap it up.
              <br />
              <span className="text-brand-orange">Every event, one place.</span>
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-[14px] leading-relaxed text-brand-charcoal sm:mt-6 sm:text-[19px]">
              Events HQ runs your events from the first plan to the last box of gear coming home. Stages and tasks,
              registrations, coaches and volunteers, the agenda, a portal for your attendees, and the budget all live on
              the event, and every event lives on one calendar.
            </p>
          </Reveal>

          <Reveal delay={0.12} className="mt-6 sm:mt-12">
            {/* Relative wrapper kept to match the other pages, though there is no
                ReplacesChip here: the client named no tool Events HQ replaces. */}
            <div className="relative mx-auto max-w-[1120px]">
              <div className="overflow-hidden rounded-2xl p-2 sm:rounded-[30px] sm:p-8" style={{ background: PANEL_WARM }}>
                <EventsHqHeroTour />
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.2} className="mt-6 sm:mt-10">
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={openDemo}
                className="flex items-center justify-center gap-2 rounded-lg bg-brand-orange px-7 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-brand-orange-dark"
              >
                Request a Demo
                <Arrow className="h-[17px] w-[17px]" />
              </button>
              <a
                href={SIGNUP.href}
                className="border border-brand-orange/35 flex items-center justify-center gap-2 rounded-lg bg-white/70 px-7 py-3 text-base font-semibold text-brand-orange transition-colors hover:border-brand-orange/55 hover:bg-white sm:min-w-[170px]"
              >
                {SIGNUP.label}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------ 1. the calendar */}
      <Section
        id="calendar"
        eyebrow="Every event, one calendar"
        title={
          <>
            The whole year,
            <br className="hidden sm:block" /> <span className="text-brand-orange">at a glance.</span>
          </>
        }
        body="See every event you run on one calendar, by year, month or as a dated list, colour-coded by event type. Spot the clashes and the quiet weeks before anyone books a venue."
        points={[
          "Year, month and list views, coloured by the event types you set",
          "Filter by event type, manager or status, and export the year to PDF",
          "Mark protected days so nothing gets booked over prep time",
          "The Overview Calendar puts upcoming events side by side with their coaches, volunteers and ratios",
        ]}
        visual={<CalendarDemo />}
        panel={PANEL_WARM}
      />

      {/* ------------------------------------------------ 2. stages and tasks */}
      <Section
        id="stages"
        eyebrow="Plan by stages"
        title={
          <>
            Six months out
            <br className="hidden sm:block" /> <span className="text-brand-orange">to the week of.</span>
          </>
        }
        body="Every event moves through stages, each with its own tasks, owners and due dates. The record shows where the event is, what is done, what is due, and how many days are left."
        points={[
          "Stages from six months out to the week of, each with its own task list",
          "Tasks with an owner, a due date, a priority and a status",
          "Templates: reusable blueprints with stages, tasks, inventory, files and budget numbers",
          "An Agenda Library of run-of-show templates. Drop one onto any event and the dates come from the event",
        ]}
        visual={<StagesDemo />}
        flip
        panel={PANEL_STONE}
      />

      {/* ------------------------------------------------ 3. people */}
      <Section
        id="people"
        eyebrow="Registrations and staffing"
        title={
          <>
            Who&rsquo;s coming,
            <br className="hidden sm:block" /> <span className="text-brand-orange">and who&rsquo;s serving.</span>
          </>
        }
        body="Every event carries its own roster of registrations, coaches and volunteers. Every contact carries their history, so you know who has attended what before they sign up for what comes next."
        points={[
          "A roster on every event, and every registration across all of them in one list",
          "Coaches and volunteers per event, team or external, approved, pending or declined",
          "A contact's record shows every event they've registered for and every role they've held",
          "Link an Ontraport contact group to an event to bring its attendees in",
        ]}
        visual={<PeopleDemo />}
        panel={PANEL_WARM}
      />

      {/* ------------------------------------------------ 4. the portal */}
      <Section
        id="portal"
        eyebrow="The client portal"
        title={
          <>
            Everything attendees need,
            <br className="hidden sm:block" /> <span className="text-brand-orange">behind one login.</span>
          </>
        }
        body="Give attendees a portal with your name and brand on it. Logistics, their hotel, their intake form and who to call are all in one place, and the texts and emails that get them there send themselves."
        points={[
          "Your portal name, logo, colours and support contact",
          "Put it on your own address, like portal.yourdomain.com",
          "A welcome page attendees see the first time they log in",
          "Invite, new event, reminder and follow-up messages, each with a one-time login link",
        ]}
        visual={<PortalDemo />}
        flip
        panel={PANEL_STONE}
      />

      {/* ------------------------------------------------ 5. budget and inventory */}
      <Section
        id="budget"
        eyebrow="Budget and inventory"
        title={
          <>
            Know what it cost,
            <br className="hidden sm:block" /> <span className="text-brand-orange">and where the gear went.</span>
          </>
        }
        body="Every event has a budget with its plan, its spend and its P/L. Gear and supplies are held from Inventory HQ for the event, and when it wraps, the holds come off so that stock counts again."
        points={[
          "A budget on every event: plan, spend and P/L",
          "Decide who can see and edit event budgets",
          "Hold stock from Inventory HQ for upcoming events, and track attendee shirt sizes against it",
          "A finished event still holding stock gets flagged until you release it",
        ]}
        visual={<BudgetDemo />}
        panel={PANEL_WARM}
      />

      {/* ------------------------------------------------ 6. Multi AI (always last) */}
      <MultiAiWired
        heading="Your events, read by"
        swash="an event producer."
        intro="Multi AI can already see every event, registration, task and roster. Ask what needs attention this week and it answers from the events themselves, naming the event, the problem and what to do about it."
        leftLabel="The events your team runs"
        leftColor={RED}
        leftIcon={RowsIcon}
        rightLabel="What Multi AI finds in them"
        prompt="Which events need attention before the end of the month?"
        panelTitle="Events HQ · Upcoming"
        panelMeta="4 events"
        panelDot={RED}
        rows={AI_ROWS}
        insights={AI_INSIGHTS}
        aiMeta="reading 4 events"
        footer="Multi AI reads the same events, rosters and tasks your team already keeps. Nothing to export before you can ask."
      />

      <CTA />
      <Footer />
    </main>
  );
}

// ---------------------------------------------------------------- Section
function Section({
  id,
  eyebrow,
  title,
  body,
  points,
  visual,
  flip,
  panel,
}: {
  id: string;
  eyebrow: string;
  title: React.ReactNode;
  body: string;
  points: string[];
  visual: React.ReactNode;
  flip?: boolean;
  panel: string;
}) {
  return (
    <section id={id} className="scroll-mt-24 px-5 py-10 sm:px-8 sm:py-20">
      <div className="mx-auto grid max-w-container grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={colTransition}
          className={`min-w-0 text-center lg:text-left ${flip ? "lg:order-2" : ""}`}
        >
          <p className="mb-4 text-[13px] font-bold uppercase tracking-[0.14em] text-brand-orange-dark">{eyebrow}</p>
          <h2 className="text-[26px] font-extrabold leading-[1.1] tracking-tight text-brand-ink sm:text-[42px] sm:leading-[1.06]">
            {title}
          </h2>
          <p className="mt-4 text-[14px] leading-relaxed text-brand-charcoal sm:mt-5 sm:text-[17px]">{body}</p>
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
          transition={{ ...colTransition, delay: 0.08 }}
          // min-w-0: a grid item defaults to min-width:auto, so a visual that
          // cannot shrink below its content pushes the whole track wider than
          // the screen on a phone.
          className={`min-w-0 ${flip ? "lg:order-1" : ""}`}
        >
          <div className="overflow-hidden rounded-2xl p-2 sm:rounded-[26px] sm:p-6" style={{ background: panel }}>
            {visual}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
