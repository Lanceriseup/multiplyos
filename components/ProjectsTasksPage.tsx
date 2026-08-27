"use client";

// Feature page: Projects & Tasks.
//
// Follows the client's brief, in the order they gave it:
//   1. hero: the projects gallery
//   2. inside a project: all seven views, switchable
//   3. My Tasks, the weekly rhythm
//   4. one task, in full
//   5. structure at scale: folders, templates, visibility
//   6. (last, as on every feature page) how Multi AI reads this data for insights
//
// Two colours run through the page, matching the home-page cards and the nav:
// GREEN is Projects (the container), PURPLE is Tasks (the week's work).
//
// Mockups are hand-built in markup rather than screenshots so they stay crisp and
// themeable. Project names, sections, and people are deliberately generic, the
// ones any business would recognise rather than the ones in the demo account.
import { motion } from "framer-motion";
import { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CTA from "./CTA";
import Reveal from "./Reveal";
import ProjectsTasksHeroTour from "./ProjectsTasksHeroTour";
import { ReplacesChip, REPLACES } from "./ReplacesStrip";
import MultiAiWired from "./MultiAiWired";
import type { Row, Insight } from "./MultiAiWired";
import { useDemo } from "./DemoModal";

// ---------------------------------------------------------------- tokens
const GREEN = "#1F9D57";
const GREEN_D = "#157A43";
const PURPLE = "#7C5CD6";
const PURPLE_D = "#5B47A8";
const BLUE = "#2C8FD6";
const AMBER = "#E89A2B";
const RED = "#D8563F";
const GREY = "#6B7280";
const colTransition = { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const };

// Shared by all four mockup cards, so the highlights line up as you scroll.
// Every card is built the same way: fixed-height shell, chrome pinned with
// flex-none, and one flex-1 body that takes whatever is left and clips. No card
// hardcodes a body height, so changing these numbers moves all four together.
//
// 400/340 matches SOP HQ and Metrics Scoreboard. It was 430/380 until the four
// pages were levelled up; the desktop drop of 30px costs the view bodies about
// a row each, which they absorb by clipping since that is what they already do.
//
// Written out in full: Tailwind scans source for literal class names and never
// sees an interpolated one.
const CARD_CLS = "h-[340px] sm:h-[400px]";

// The status set, shared by the List, Board, Timeline, and Overview mockups so a
// colour never means two things across the page.
const STATUS = {
  planned: { label: "Not Started", color: GREY, group: "PLANNED" },
  active: { label: "In Progress", color: BLUE, group: "ACTIVE" },
  hold: { label: "On Hold", color: AMBER, group: "ACTIVE" },
  review: { label: "In Review", color: PURPLE, group: "REVIEW" },
  done: { label: "Done", color: GREEN, group: "DONE" },
} as const;
type StatusKey = keyof typeof STATUS;

// ---------------------------------------------------------------- icons
const ico = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
type IconProps = { className?: string; style?: React.CSSProperties };

// Three columns, matching the Projects & Tasks icon in the nav's Features menu.
const BoardIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.8}>
    <rect x="3.6" y="5" width="4.7" height="14" rx="1.5" />
    <rect x="9.65" y="5" width="4.7" height="9.3" rx="1.5" />
    <rect x="15.7" y="5" width="4.7" height="11" rx="1.5" />
  </svg>
);
const Check = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2.4}>
    <path d="M5 12l5 5L20 7" />
  </svg>
);
const Arrow = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2.4}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
const SearchIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2}>
    <circle cx="10.8" cy="10.8" r="6.4" />
    <path d="M15.6 15.6L20 20" />
  </svg>
);
const FilterIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2}>
    <path d="M3.6 5.4h16.8l-6.5 7.7v5.9l-3.8 1.9v-7.8z" />
  </svg>
);
const BuildingIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.8}>
    <rect x="4.4" y="3.4" width="15.2" height="17.2" rx="1.8" />
    <path d="M8.4 7.6h2.4M8.4 11.4h2.4M8.4 15.2h2.4M13.2 7.6h2.4M13.2 11.4h2.4M13.2 15.2h2.4" />
  </svg>
);
const LockIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.9}>
    <rect x="4.6" y="10.4" width="14.8" height="9.6" rx="2.2" />
    <path d="M8 10.4V7.8a4 4 0 0 1 8 0v2.6" />
  </svg>
);
const PeopleIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.9}>
    <circle cx="9.2" cy="8.4" r="3.4" />
    <path d="M3 19.4c0-3.2 2.8-5.2 6.2-5.2s6.2 2 6.2 5.2" />
    <path d="M16.4 5.6a3.2 3.2 0 0 1 0 6M17.8 14.6c2.1.6 3.4 2.2 3.4 4.4" />
  </svg>
);
const CrownIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.9}>
    <path d="M3.4 7.4l3.6 3.2L12 5l5 5.6 3.6-3.2-1.6 11H5z" />
  </svg>
);
const ClockIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.9}>
    <circle cx="12" cy="12" r="8.4" />
    <path d="M12 7.4V12l3 1.8" />
  </svg>
);
const CalIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.9}>
    <rect x="3.6" y="5.2" width="16.8" height="15.2" rx="2.2" />
    <path d="M3.6 10h16.8M8.4 3.4v3.6M15.6 3.4v3.6" />
  </svg>
);
const FlagIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2}>
    <path d="M5.4 20.6V4.2M5.4 5.2h11l-2 3.6 2 3.6h-11" />
  </svg>
);
const FileIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.9}>
    <path d="M13.4 3.4H6.8a1.8 1.8 0 0 0-1.8 1.8v13.6a1.8 1.8 0 0 0 1.8 1.8h10.4a1.8 1.8 0 0 0 1.8-1.8V8.8z" />
    <path d="M13.4 3.4v5.4h5.6" />
  </svg>
);
const WalletIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.9}>
    <path d="M3.6 7.6a2 2 0 0 1 2-2h11.6a2 2 0 0 1 2 2v9.8a2 2 0 0 1-2 2H5.6a2 2 0 0 1-2-2z" />
    <path d="M15.4 11.6h4.8v3.4h-4.8a1.7 1.7 0 0 1 0-3.4z" />
  </svg>
);
const RowsIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.2" />
    <path d="M3.5 9.5h17M3.5 14.5h17" />
  </svg>
);
const TimelineIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.9}>
    <path d="M4 6.6h9.6M4 12h13.4M4 17.4h7.2" />
  </svg>
);
const GaugeIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.9}>
    <path d="M4 17.4a8.4 8.4 0 1 1 16 0" />
    <path d="M12 17.4l3.8-4.6" />
  </svg>
);
const PlusIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2.4}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const StarIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={1.9}>
    <path d="M12 4l2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4-3.9 5.6-.8z" />
  </svg>
);
const GoalIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.9}>
    <circle cx="12" cy="12" r="8.2" />
    <circle cx="12" cy="12" r="4.4" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
);

// ---------------------------------------------------------------- shared bits
function Avatar({ init, bg, size = 18 }: { init: string; bg: string; size?: number }) {
  return (
    <span
      className="grid flex-none place-items-center rounded-full font-bold text-white"
      style={{ background: bg, height: size, width: size, fontSize: size * 0.4 }}
    >
      {init}
    </span>
  );
}

function StatusChip({ s }: { s: StatusKey }) {
  const m = STATUS[s];
  return (
    <span
      className="inline-flex items-center gap-1 whitespace-nowrap rounded-full px-1.5 py-[2px] text-[8.5px] font-semibold"
      style={{ background: `${m.color}1A`, color: m.color }}
    >
      <span className="h-[4px] w-[4px] flex-none rounded-full" style={{ background: m.color }} />
      {m.label}
    </span>
  );
}

const PRI = {
  P1: RED,
  P2: "#D2811E",
  P3: "#B7952A",
  P5: GREY,
} as const;
type PriKey = keyof typeof PRI;

function Priority({ p }: { p: PriKey }) {
  return (
    <span
      className="inline-flex items-center gap-[3px] whitespace-nowrap rounded-[4px] px-1 py-[1px] text-[8px] font-bold"
      style={{ background: `${PRI[p]}16`, color: PRI[p] }}
    >
      <FlagIcon className="h-[8px] w-[8px]" />
      {p}
    </span>
  );
}

// The team, used across every mockup so the same initials always mean the same
// person. Generic names, not the demo account's.
const PEOPLE = {
  SL: { init: "SL", bg: "linear-gradient(135deg,#F49230,#D8563F)" },
  MC: { init: "MC", bg: "#3E7BC0" },
  DB: { init: "DB", bg: "#1F8A52" },
  JL: { init: "JL", bg: "#C9503B" },
  AR: { init: "AR", bg: "#8A3F6D" },
  TN: { init: "TN", bg: "#41638A" },
} as const;
type PersonKey = keyof typeof PEOPLE;

function Who({ k, size = 18 }: { k: PersonKey; size?: number }) {
  return <Avatar init={PEOPLE[k].init} bg={PEOPLE[k].bg} size={size} />;
}

// ---------------------------------------------------------------- 2. the views
// All seven tabs a project carries. The reader switches them, so the range is
// something they operate rather than a list they read. Fixed body height, so a
// tall view never resizes the card and shunts the section around.
type ViewKey = "overview" | "list" | "timeline" | "board" | "calendar" | "files" | "budget";

const VIEWS: { key: ViewKey; label: string; icon: (p: IconProps) => React.JSX.Element }[] = [
  { key: "overview", label: "Overview", icon: GaugeIcon },
  { key: "list", label: "List", icon: RowsIcon },
  { key: "timeline", label: "Timeline", icon: TimelineIcon },
  { key: "board", label: "Board", icon: BoardIcon },
  { key: "calendar", label: "Calendar", icon: CalIcon },
  { key: "files", label: "Files", icon: FileIcon },
  { key: "budget", label: "Budget", icon: WalletIcon },
];

/* ---- Overview ---- */
const ACTIVITY = [
  { who: "Dana Brooks", did: "changed status from In Progress to In Review on", what: "Vendor contract review", when: "1h ago" },
  { who: "Mira Castellanos", did: "commented on", what: "Landing page copy pass", when: "1h ago" },
  { who: "Skylar Lewis", did: "reassigned", what: "Q3 pricing sheet", when: "2h ago" },
  { who: "Avery Rowe", did: "attached", what: "handover-checklist.docx", when: "2h ago" },
];

function OverviewView() {
  const split = [
    { label: "Planned", n: 76, color: GREY },
    { label: "Active", n: 13, color: BLUE },
    { label: "In Review", n: 7, color: PURPLE },
    { label: "Done", n: 257, color: GREEN },
  ];
  const total = split.reduce((a, b) => a + b.n, 0);

  return (
    <div className="grid gap-2 p-2.5 sm:grid-cols-[1.35fr_1fr]">
      <div className="space-y-2">
        <div className="rounded-lg border border-[#ECEAE6] bg-white p-2.5">
          <p className="mb-1 text-[9.5px] font-bold text-brand-ink">Description</p>
          <p className="text-[9.5px] leading-snug text-brand-charcoal">
            Delegated IT, CRM, and web requests land here and get routed to a single owner.
          </p>
        </div>
        <div className="rounded-lg border border-[#ECEAE6] bg-white p-2.5">
          <p className="mb-0.5 text-[9.5px] font-bold text-brand-ink">Milestones</p>
          <p className="text-[8.5px] leading-snug text-brand-gray">
            Checkpoints that track this project&rsquo;s most important work.
          </p>
        </div>
        <div className="rounded-lg border border-[#ECEAE6] bg-white p-2.5">
          <p className="mb-1.5 text-[9.5px] font-bold text-brand-ink">Recent activity</p>
          <div className="space-y-1">
            {ACTIVITY.map((a) => (
              <p key={a.what} className="truncate text-[8.5px] leading-snug text-brand-gray">
                <b className="font-semibold text-brand-charcoal">{a.who}</b> {a.did}{" "}
                <span className="text-brand-charcoal">{a.what}</span>
                <span className="text-[#D5D0C7]"> · </span>
                {a.when}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="rounded-lg border border-[#ECEAE6] bg-white p-2.5">
          <p className="mb-1.5 text-[9.5px] font-bold text-brand-ink">Status</p>
          <div className="flex flex-wrap gap-1">
            {[
              { l: "On track", c: GREEN, on: true },
              { l: "At risk", c: AMBER, on: false },
              { l: "Off track", c: RED, on: false },
              { l: "On hold", c: GREY, on: false },
            ].map((s) => (
              <span
                key={s.l}
                className="flex items-center gap-1 rounded-full border px-1.5 py-[2px] text-[8.5px] font-semibold"
                style={
                  s.on
                    ? { borderColor: `${s.c}66`, background: `${s.c}1A`, color: GREEN_D }
                    : { borderColor: "#E3E0DA", color: "#6B6660" }
                }
              >
                <span className="h-[4px] w-[4px] rounded-full" style={{ background: s.c }} />
                {s.l}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-[#ECEAE6] bg-white p-2.5">
          <p className="mb-0.5 text-[9.5px] font-bold text-brand-ink">Rolls up to</p>
          <span className="mt-1 flex items-center gap-1.5 rounded-md border border-[#E3E0DA] px-1.5 py-1 text-[8.5px] font-medium text-brand-charcoal">
            <GoalIcon className="h-[10px] w-[10px] flex-none" style={{ color: GREEN_D }} />
            <span className="truncate">One reliable, visible system</span>
          </span>
        </div>

        <div className="rounded-lg border border-[#ECEAE6] bg-white p-2.5">
          <div className="flex items-baseline">
            <p className="text-[9.5px] font-bold text-brand-ink">Progress</p>
            <span className="ml-auto text-[11px] font-extrabold tabular-nums" style={{ color: GREEN_D }}>
              74%
            </span>
          </div>
          <p className="mt-0.5 text-[8.5px] tabular-nums text-brand-gray">259 / 352 tasks done</p>
          <span className="mt-1.5 flex h-[5px] overflow-hidden rounded-full">
            {split.map((s) => (
              <span key={s.label} style={{ width: `${(s.n / total) * 100}%`, background: s.color }} />
            ))}
          </span>
          <div className="mt-1.5 flex flex-wrap gap-x-2 gap-y-0.5">
            {split.map((s) => (
              <span key={s.label} className="flex items-center gap-1 text-[8px] text-brand-gray">
                <span className="h-[4px] w-[4px] rounded-full" style={{ background: s.color }} />
                {s.label} <b className="font-semibold tabular-nums text-brand-charcoal">{s.n}</b>
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-[#ECEAE6] bg-white p-2.5">
          <p className="mb-1.5 text-[9.5px] font-bold text-brand-ink">Members</p>
          {(
            [
              { k: "SL" as PersonKey, name: "Skylar Lewis", role: "OWNER" },
              { k: "MC" as PersonKey, name: "Mira Castellanos", role: "EDITOR" },
              { k: "DB" as PersonKey, name: "Dana Brooks", role: "EDITOR" },
            ]
          ).map((m) => (
            <span key={m.name} className="flex items-center gap-1.5 py-[3px]">
              <Who k={m.k} size={15} />
              <span className="min-w-0 flex-1 truncate text-[9px] text-brand-charcoal">{m.name}</span>
              <span className="flex-none rounded-full bg-[#F1EEE9] px-1.5 py-[1px] text-[7.5px] font-bold tracking-wide text-brand-gray">
                {m.role}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- List ---- */
type TaskRow = { name: string; who: PersonKey; due: string; overdue?: boolean; s: StatusKey; p: PriKey; sub?: string };

const LIST_SECTIONS: { title: string; n: number; rows: TaskRow[] }[] = [
  {
    title: "Today (Anchor) · 2 max",
    n: 10,
    rows: [
      { name: "Fix the reporting sync and verify data flows", who: "MC", due: "18d overdue", overdue: true, s: "planned", p: "P3" },
      { name: "Rework the nurture sequence found in content review", who: "DB", due: "17d overdue", overdue: true, s: "planned", p: "P2" },
      { name: "Vendor contract review", who: "AR", due: "3d overdue", overdue: true, s: "review", p: "P1" },
      { name: "Landing page copy pass", who: "SL", due: "Today", s: "active", p: "P1", sub: "0/1" },
    ],
  },
  {
    title: "Now (Ready) · 5 max",
    n: 13,
    rows: [
      { name: "Finalize the duplicate-contact SOP", who: "MC", due: "27d overdue", overdue: true, s: "planned", p: "P3" },
      { name: "Build the complimentary RSVP page + tracking", who: "SL", due: "Aug 25", s: "active", p: "P3", sub: "2/8" },
      { name: "Set up the pre-event email sequence", who: "DB", due: "Aug 22", s: "review", p: "P3" },
    ],
  },
];

function ListView() {
  return (
    <div className="p-2.5">
      {/* toolbar */}
      <div className="mb-2 flex flex-wrap items-center gap-1">
        <span className="flex items-center gap-1 rounded-lg bg-brand-ink px-2 py-1 text-[9px] font-semibold text-white">
          <PlusIcon className="h-[9px] w-[9px]" />
          Add task
        </span>
        <span className="hidden rounded-lg border border-[#E3E0DA] bg-white px-2 py-1 text-[9px] font-medium text-brand-charcoal min-[420px]:block">
          Sort: Due date
        </span>
        <span className="rounded-lg border border-[#E3E0DA] bg-white px-2 py-1 text-[9px] font-medium text-brand-charcoal">
          Group: Section
        </span>
        <span className="ml-auto flex items-center gap-1 rounded-lg border border-[#E3E0DA] bg-white px-2 py-1 text-[9px] font-medium text-brand-charcoal">
          <FilterIcon className="h-[9px] w-[9px]" />
          Filter
        </span>
      </div>

      {/* Column heads, desktop only. Below sm the row is two lines rather than
          five columns, so headings would label nothing. */}
      <div className="hidden items-center gap-2 border-b border-[#ECEAE6] px-1.5 pb-1 text-[7.5px] font-bold uppercase tracking-[0.08em] text-brand-gray sm:flex">
        <span className="min-w-0 flex-1">Name</span>
        <span className="hidden w-[58px] flex-none min-[420px]:block">Assignee</span>
        <span className="w-[62px] flex-none">Due date</span>
        <span className="hidden w-[66px] flex-none sm:block">Status</span>
        <span className="w-[26px] flex-none text-right">Pri</span>
      </div>

      {LIST_SECTIONS.map((sec) => (
        <div key={sec.title}>
          <div className="flex items-center gap-1.5 bg-[#F6F4F1] px-1.5 py-1">
            <b className="text-[9px] text-brand-ink">{sec.title}</b>
            <span className="text-[8px] tabular-nums text-brand-gray">({sec.n})</span>
          </div>
          {/* Two-line below sm, five columns from sm up.
              At 360px the name column was down to about 135px, so every task
              read "Fix the reporting sync and v…". The name is the only part of
              this row anyone reads, so on a phone it takes the whole width and
              the metadata drops underneath. Costs ~14px a row, which is why six
              fit instead of eight: eight truncated names say less than six
              whole ones. See design/projects-tasks-mobile-options.html. */}
          {sec.rows.map((r) => (
            <div
              key={r.name}
              className="flex flex-col gap-1.5 border-b border-[#F5F2ED] px-1.5 py-[7px] sm:flex-row sm:items-center sm:gap-2"
            >
              <div className="flex min-w-0 items-start gap-2 sm:flex-1 sm:items-center">
                <span className="mt-[2px] h-[11px] w-[11px] flex-none rounded-full border-[1.5px] border-[#DDD8D0] sm:mt-0" />
                {r.sub && (
                  <span className="mt-[1px] flex-none rounded bg-[#F1EEE9] px-1 text-[7.5px] font-bold tabular-nums text-brand-gray sm:mt-0">
                    {r.sub}
                  </span>
                )}
                <span className="min-w-0 flex-1 text-[10.5px] font-medium leading-snug text-brand-ink sm:truncate sm:text-[9.5px] sm:leading-normal">
                  {r.name}
                </span>
              </div>

              {/* second line on mobile, the last three columns on desktop */}
              <div className="flex items-center gap-2 pl-[19px] sm:contents sm:pl-0">
                <span className="flex flex-none items-center gap-1 max-[419px]:hidden sm:w-[58px]">
                  <Who k={r.who} size={14} />
                  <span className="truncate text-[8.5px] text-brand-charcoal">{PEOPLE[r.who].init}</span>
                </span>
                <span
                  className="flex-none whitespace-nowrap text-[8.5px] font-medium sm:w-[62px]"
                  style={{ color: r.overdue ? RED : "#6B6660" }}
                >
                  {r.due}
                </span>
                <span className="hidden w-[66px] flex-none sm:block">
                  <StatusChip s={r.s} />
                </span>
                <span className="ml-auto flex-none text-right sm:ml-0 sm:w-[26px]">
                  <Priority p={r.p} />
                </span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ---- Timeline ---- */
// Bars are drawn here. The client's screenshot happened to sit on a date range
// where every visible task was unscheduled, but a Gantt with no bars sells
// nothing, so this shows the view doing its job.
const GANTT: { name: string; who: PersonKey; start: number; span: number; color: string }[] = [
  { name: "Discovery and scoping", who: "SL", start: 0, span: 2, color: GREEN },
  { name: "Content and copy pass", who: "MC", start: 1, span: 3, color: BLUE },
  { name: "Design system rebuild", who: "AR", start: 2, span: 4, color: PURPLE },
  { name: "Build the templates", who: "DB", start: 4, span: 3, color: BLUE },
  { name: "QA and accessibility", who: "TN", start: 6, span: 2, color: AMBER },
  { name: "Launch and handover", who: "JL", start: 7, span: 1, color: RED },
];
const WEEKS = ["11/17", "11/24", "12/1", "12/8", "12/15", "12/22", "12/29", "1/5"];

function TimelineView() {
  return (
    <div className="p-2.5">
      <div className="mb-2 flex items-center gap-1">
        <span className="flex items-center gap-1 rounded-lg bg-brand-ink px-2 py-1 text-[9px] font-semibold text-white">
          <PlusIcon className="h-[9px] w-[9px]" />
          Add task
        </span>
        <span className="flex items-center gap-0.5 rounded-lg bg-[#F1EEE9] p-0.5">
          {["Day", "Week", "Month"].map((z) => (
            <span
              key={z}
              className={`rounded-[6px] px-1.5 py-[3px] text-[8.5px] ${
                z === "Week" ? "bg-brand-ink font-semibold text-white" : "font-medium text-brand-charcoal"
              }`}
            >
              {z}
            </span>
          ))}
        </span>
        <span className="ml-auto hidden rounded-lg border border-[#E3E0DA] bg-white px-2 py-1 text-[9px] font-medium text-brand-charcoal sm:block">
          Unscheduled 13
        </span>
      </div>

      <div className="overflow-hidden rounded-lg border border-[#ECEAE6] bg-white">
        {/* header */}
        <div className="flex border-b border-[#ECEAE6] bg-[#FBFAF8]">
          <span className="w-[92px] flex-none border-r border-[#ECEAE6] px-1.5 py-1 text-[7.5px] font-bold uppercase tracking-[0.08em] text-brand-gray sm:w-[124px]">
            Task
          </span>
          <span className="flex min-w-0 flex-1">
            {WEEKS.map((w) => (
              <span
                key={w}
                className="min-w-0 flex-1 border-r border-[#F1EEE9] px-1 py-1 text-center text-[7.5px] font-semibold tabular-nums text-brand-gray last:border-r-0"
              >
                {w}
              </span>
            ))}
          </span>
        </div>
        {/* rows */}
        {GANTT.map((g) => (
          <div key={g.name} className="flex items-center border-b border-[#F5F2ED] last:border-b-0">
            <span className="flex w-[92px] flex-none items-center gap-1 border-r border-[#ECEAE6] px-1.5 py-[6px] sm:w-[124px]">
              <Who k={g.who} size={13} />
              <span className="min-w-0 truncate text-[8.5px] font-medium text-brand-ink">{g.name}</span>
            </span>
            <span className="relative flex min-w-0 flex-1 py-[6px]">
              {WEEKS.map((w) => (
                <span key={w} className="min-w-0 flex-1 border-r border-[#F5F2ED] last:border-r-0" />
              ))}
              <span
                className="absolute top-1/2 h-[9px] -translate-y-1/2 rounded-full"
                style={{
                  left: `${(g.start / WEEKS.length) * 100}%`,
                  width: `calc(${(g.span / WEEKS.length) * 100}% - 4px)`,
                  background: g.color,
                  marginLeft: 2,
                }}
              />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- Board ---- */
const BOARD_COLS: { s: StatusKey; n: number; cards: { name: string; p: PriKey; due: string; who: PersonKey; hard?: boolean; sub?: string }[] }[] = [
  {
    s: "planned",
    n: 66,
    cards: [
      { name: "Rework the nurture sequence found in content review", p: "P2", due: "Aug 1", who: "DB" },
      { name: "Q3 pricing sheet", p: "P2", due: "Jul 27", who: "TN", sub: "1" },
      { name: "Account access for the new hire", p: "P1", due: "Aug 18", who: "MC" },
    ],
  },
  {
    s: "active",
    n: 8,
    cards: [
      { name: "Simplify the daily dashboard and call reporting tab", p: "P3", due: "Aug 8", who: "SL" },
      { name: "Build the complimentary RSVP page + tracking", p: "P3", due: "Aug 25", who: "SL", hard: true, sub: "8" },
      { name: "Finalize the duplicate-contact SOP", p: "P3", due: "Jul 22", who: "MC" },
    ],
  },
  {
    s: "hold",
    n: 3,
    cards: [
      { name: "Coaches academy email templates", p: "P2", due: "Jul 24", who: "AR" },
      { name: "Registration form build", p: "P3", due: "Aug 15", who: "JL" },
    ],
  },
  {
    s: "review",
    n: 6,
    cards: [
      { name: "Landing page + thank-you page updates", p: "P1", due: "Aug 15", who: "SL" },
      { name: "Set up the pre-event email sequence", p: "P3", due: "Aug 22", who: "DB", hard: true },
      { name: "Vendor contract review", p: "P2", due: "Aug 13", who: "AR" },
    ],
  },
];

function BoardView() {
  return (
    <div className="flex gap-2 overflow-x-auto p-2.5">
      {BOARD_COLS.map((col) => {
        const m = STATUS[col.s];
        return (
          <div key={col.s} className="w-[128px] flex-none">
            <div className="mb-1.5 flex items-center gap-1.5">
              <span className="h-[5px] w-[5px] flex-none rounded-full" style={{ background: m.color }} />
              <b className="truncate text-[9px] text-brand-ink">{m.label}</b>
              <span className="ml-auto text-[8px] tabular-nums text-brand-gray">{col.n}</span>
            </div>
            <p className="mb-1.5 text-[7px] font-bold uppercase tracking-[0.1em] text-brand-gray">{m.group}</p>
            <div className="space-y-1.5">
              {col.cards.map((c) => (
                <div key={c.name} className="rounded-[7px] border border-[#ECEAE6] bg-white p-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <p className="line-clamp-3 text-[9px] font-medium leading-snug text-brand-ink">{c.name}</p>
                  {c.hard && (
                    <span className="mt-1 inline-block rounded-full px-1.5 py-[1px] text-[7px] font-bold" style={{ background: `${RED}16`, color: RED }}>
                      Hard Deadline
                    </span>
                  )}
                  <div className="mt-1.5 flex items-center gap-1">
                    <Priority p={c.p} />
                    {c.sub && (
                      <span className="rounded bg-[#F1EEE9] px-1 text-[7px] font-bold tabular-nums text-brand-gray">{c.sub}</span>
                    )}
                    <span className="ml-auto">
                      <Who k={c.who} size={13} />
                    </span>
                  </div>
                  <p className="mt-1 text-[7.5px] tabular-nums text-brand-gray">{c.due}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---- Calendar ---- */
const CAL: Record<number, { t: string; c: string; hard?: boolean }[]> = {
  4: [{ t: "Audit the draft removals", c: AMBER }],
  5: [
    { t: "Masterclass HTML", c: RED, hard: true },
    { t: "Login access to portal", c: GREEN },
  ],
  6: [{ t: "Notification routing", c: BLUE }],
  7: [{ t: "Funnel inventory", c: PURPLE }],
  11: [{ t: "Scheduling error", c: AMBER }],
  12: [{ t: "New checking page", c: BLUE }],
  13: [{ t: "Account owner", c: GREEN }],
  14: [{ t: "Landing page build", c: PURPLE }],
  18: [
    { t: "Account access", c: BLUE },
    { t: "New coaching subs", c: GREEN },
  ],
  19: [{ t: "Reservation link", c: AMBER }],
  20: [{ t: "Take assessment", c: GREEN }],
  21: [{ t: "Linktree page build", c: PURPLE }],
  25: [{ t: "RSVP page build", c: RED, hard: true }],
  27: [{ t: "Dashboard CRM data", c: RED, hard: true }],
};
const TODAY = 18;

function CalendarView() {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  // A real August 2026: the 1st falls on a Saturday, so it sits in the last
  // column and the 18th lands on a Tuesday. Padded to whole weeks so the last
  // row is not ragged.
  const cells: (number | null)[] = [];
  for (let i = 0; i < 6; i++) cells.push(null);
  for (let d = 1; d <= 31; d++) cells.push(d);
  while (cells.length % 7) cells.push(null);

  return (
    <div className="p-2.5">
      <div className="mb-2 flex items-center gap-1.5">
        <span className="flex items-center gap-1 rounded-lg bg-brand-ink px-2 py-1 text-[9px] font-semibold text-white">
          <PlusIcon className="h-[9px] w-[9px]" />
          Add task
        </span>
        <b className="text-[10px] text-brand-ink">August 2026</b>
        <span className="ml-auto hidden rounded-lg border border-[#E3E0DA] bg-white px-2 py-1 text-[9px] font-medium text-brand-charcoal sm:block">
          Unscheduled 13
        </span>
      </div>

      <div className="overflow-hidden rounded-lg border border-[#ECEAE6] bg-white">
        <div className="grid grid-cols-7 border-b border-[#ECEAE6] bg-[#FBFAF8]">
          {days.map((d) => (
            <span key={d} className="px-1 py-1 text-center text-[7.5px] font-bold uppercase tracking-[0.06em] text-brand-gray">
              {d}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((d, i) => {
            const items = d ? CAL[d] ?? [] : [];
            return (
              <div
                key={i}
                // 42px, not 46: six week-rows have to clear the 352px body now
                // that it clips instead of scrolling
                className="min-h-[42px] border-b border-r border-[#F5F2ED] p-[3px] last:border-r-0"
                style={d === TODAY ? { background: `${GREEN}0F` } : undefined}
              >
                {d && (
                  <span
                    className={`mb-[2px] inline-grid h-[13px] min-w-[13px] place-items-center rounded-full px-[3px] text-[7.5px] font-semibold tabular-nums ${
                      d === TODAY ? "text-white" : "text-brand-gray"
                    }`}
                    style={d === TODAY ? { background: GREEN } : undefined}
                  >
                    {d}
                  </span>
                )}
                {items.map((it) => (
                  <span
                    key={it.t}
                    className="mb-[2px] block truncate rounded-[3px] border-l-2 bg-[#FBFAF8] px-[3px] py-[1px] text-[7px] leading-tight text-brand-charcoal"
                    style={{ borderColor: it.c }}
                  >
                    {it.t}
                  </span>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---- Files ---- */
const FILES = [
  { name: "brand-guidelines-v4.pdf", task: "Design system rebuild", by: "Avery Rowe", date: "Aug 18", size: "2.4 MB" },
  { name: "handover-checklist.docx", task: "Launch and handover", by: "Skylar Lewis", date: "Aug 18", size: "41.0 KB" },
  { name: "hero-mockup.png", task: "Landing page copy pass", by: "Mira Castellanos", date: "Aug 15", size: "374.7 KB" },
  { name: "pricing-q3.xlsx", task: "Q3 pricing sheet", by: "Tomas Nadel", date: "Aug 15", size: "88.2 KB" },
  { name: "vendor-agreement.pdf", task: "Vendor contract review", by: "Dana Brooks", date: "Aug 14", size: "1.2 MB" },
  { name: "rsvp-flow.jpg", task: "Build the RSVP page", by: "Jordan Lin", date: "Aug 13", size: "540.4 KB" },
];

function FilesView() {
  return (
    <div className="p-2.5">
      <div className="mb-2 flex items-center gap-1.5">
        <span className="flex min-w-0 flex-1 items-center gap-1.5 rounded-lg border border-[#E3E0DA] bg-white px-2 py-1 text-[9px] text-brand-gray sm:max-w-[180px]">
          <SearchIcon className="h-[10px] w-[10px] flex-none" />
          Search files
        </span>
      </div>
      <div className="overflow-hidden rounded-lg border border-[#ECEAE6] bg-white">
        <div className="flex items-center gap-2 border-b border-[#ECEAE6] bg-[#FBFAF8] px-2 py-1 text-[7.5px] font-bold uppercase tracking-[0.08em] text-brand-gray">
          <span className="min-w-0 flex-1">Name</span>
          <span className="hidden w-[92px] flex-none min-[420px]:block">Task</span>
          <span className="hidden w-[76px] flex-none sm:block">Uploaded by</span>
          <span className="w-[36px] flex-none">Date</span>
          <span className="w-[46px] flex-none text-right">Size</span>
        </div>
        {FILES.map((f) => (
          <div key={f.name} className="flex items-center gap-2 border-b border-[#F5F2ED] px-2 py-[6px] last:border-b-0">
            <span className="flex min-w-0 flex-1 items-center gap-1.5">
              <FileIcon className="h-[10px] w-[10px] flex-none text-brand-gray" />
              <span className="truncate text-[9px] font-medium text-brand-ink">{f.name}</span>
            </span>
            <span className="hidden w-[92px] flex-none truncate text-[8.5px] min-[420px]:block" style={{ color: BLUE }}>
              {f.task}
            </span>
            <span className="hidden w-[76px] flex-none truncate text-[8.5px] text-brand-charcoal sm:block">{f.by}</span>
            <span className="w-[36px] flex-none text-[8.5px] tabular-nums text-brand-gray">{f.date}</span>
            <span className="w-[46px] flex-none text-right text-[8.5px] tabular-nums text-brand-gray">{f.size}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- Budget ---- */
// Shown with a budget actually set. The empty state in the client's screenshot is
// the truthful default, but a filled one is what the view is for.
const EXPENSES = [
  { date: "2026-08-14", desc: "Design contractor", cat: "Labor", detail: "18h · Avery Rowe @ $95/h", cost: "$1,710.00" },
  { date: "2026-08-09", desc: "Stock photography", cat: "Software", detail: "Annual licence", cost: "$480.00" },
  { date: "2026-08-02", desc: "Build sprint", cat: "Labor", detail: "32h · Dana Brooks @ $85/h", cost: "$2,720.00" },
  { date: "2026-07-26", desc: "Accessibility audit", cat: "Services", detail: "Fixed scope", cost: "$1,250.00" },
];

function BudgetView() {
  const spent = 6160;
  const budget = 12000;
  const pct = Math.round((spent / budget) * 100);

  return (
    <div className="p-2.5">
      <div className="mb-2 rounded-lg border border-[#ECEAE6] bg-white p-2.5">
        <div className="flex items-center gap-1.5">
          <WalletIcon className="h-[12px] w-[12px] flex-none text-brand-charcoal" />
          <b className="text-[10px] text-brand-ink">Budget</b>
          <span className="ml-auto text-[9px] tabular-nums text-brand-gray">
            <b className="font-bold text-brand-ink">${spent.toLocaleString()}</b> of ${budget.toLocaleString()}
          </span>
        </div>
        <div className="mt-2 h-[6px] overflow-hidden rounded-full bg-[#ECE8E1]">
          <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: GREEN }} />
        </div>
        <div className="mt-1.5 flex items-center text-[8.5px] text-brand-gray">
          <span>{pct}% used</span>
          <span className="ml-auto tabular-nums">${(budget - spent).toLocaleString()} remaining</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-[#ECEAE6] bg-white">
        <div className="flex items-center border-b border-[#ECEAE6] px-2 py-1.5">
          <b className="text-[9.5px] text-brand-ink">Expenses &amp; time</b>
          <span className="ml-auto flex items-center gap-1">
            <span className="flex items-center gap-1 rounded-md border border-[#E3E0DA] px-1.5 py-[2px] text-[8px] font-semibold text-brand-charcoal">
              <ClockIcon className="h-[8px] w-[8px]" />
              Log time
            </span>
            <span className="rounded-md bg-brand-ink px-1.5 py-[2px] text-[8px] font-semibold text-white">Add expense</span>
          </span>
        </div>
        <div className="flex items-center gap-2 border-b border-[#ECEAE6] bg-[#FBFAF8] px-2 py-1 text-[7.5px] font-bold uppercase tracking-[0.08em] text-brand-gray">
          <span className="w-[52px] flex-none">Date</span>
          <span className="min-w-0 flex-1">Description</span>
          <span className="hidden w-[52px] flex-none min-[420px]:block">Category</span>
          <span className="hidden w-[104px] flex-none sm:block">Detail</span>
          <span className="w-[54px] flex-none text-right">Cost</span>
        </div>
        {EXPENSES.map((e) => (
          <div key={e.desc} className="flex items-center gap-2 border-b border-[#F5F2ED] px-2 py-[6px] last:border-b-0">
            <span className="w-[52px] flex-none text-[8px] tabular-nums text-brand-gray">{e.date}</span>
            <span className="min-w-0 flex-1 truncate text-[9px] font-medium text-brand-ink">{e.desc}</span>
            <span className="hidden w-[52px] flex-none text-[8.5px] text-brand-charcoal min-[420px]:block">{e.cat}</span>
            <span className="hidden w-[104px] flex-none truncate text-[8.5px] text-brand-gray sm:block">{e.detail}</span>
            <span className="w-[54px] flex-none text-right text-[9px] font-semibold tabular-nums text-brand-ink">{e.cost}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const VIEW_BODY: Record<ViewKey, () => React.JSX.Element> = {
  overview: OverviewView,
  list: ListView,
  timeline: TimelineView,
  board: BoardView,
  calendar: CalendarView,
  files: FilesView,
  budget: BudgetView,
};

function ViewsDemo() {
  const [view, setView] = useState<ViewKey>("list");
  const Body = VIEW_BODY[view];

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${CARD_CLS}`}
    >
      <span className="block h-[3px] w-full flex-none" style={{ background: BLUE }} />

      {/* project header */}
      <div className="flex flex-none items-center gap-2 px-3 pb-2 pt-2.5">
        <span className="grid h-[24px] w-[24px] flex-none place-items-center rounded-lg text-[11px] font-bold text-white" style={{ background: BLUE }}>
          W
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1">
            <b className="truncate text-[12.5px] leading-tight">Website Redesign</b>
            <StarIcon className="h-[10px] w-[10px] flex-none text-[#D5D0C7]" />
          </span>
          <span className="mt-0.5 flex items-center gap-1.5 text-[8.5px] text-brand-gray">
            <BuildingIcon className="h-[9px] w-[9px]" />
            Company-wide
            <span className="text-[#D5D0C7]">·</span>
            352 tasks
          </span>
        </span>
        <span className="hidden flex-none items-center gap-1 rounded-lg border border-[#E3E0DA] px-2 py-1 text-[9px] font-semibold text-brand-charcoal sm:flex">
          <Check className="h-[9px] w-[9px]" />
          Mark complete
        </span>
      </div>

      {/* the seven tabs */}
      <div className="flex flex-none gap-0.5 overflow-x-auto border-b border-[#ECEAE6] px-3">
        {VIEWS.map((v) => {
          const Icon = v.icon;
          const on = view === v.key;
          return (
            <button
              key={v.key}
              type="button"
              aria-pressed={on}
              onClick={() => setView(v.key)}
              className={`flex flex-none items-center gap-1 whitespace-nowrap border-b-2 px-2 py-1.5 text-[10px] transition-colors ${
                on ? "border-brand-ink font-bold text-brand-ink" : "border-transparent font-medium text-brand-gray hover:text-brand-charcoal"
              }`}
            >
              <Icon className="h-[11px] w-[11px]" />
              {/* labels off below sm: seven of them scroll Files and Budget off-screen
                  with nothing to signal it, and the icons fit across 300px */}
              <span className="hidden sm:inline">{v.label}</span>
            </button>
          );
        })}
      </div>

      {/* Takes the remainder of the card, so switching tabs never resizes it.
          Clipped rather than scrolled: every view is trimmed to fit, so a
          scrollbar on the edge of a marketing mockup never appears. Works out to
          about 322px, which is what the seven view bodies are sized against. */}
      <div className="min-h-0 flex-1 overflow-hidden bg-[#FBFAF8]">
        <Body />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 3. My Tasks
type MyRow = { name: string; due: string; overdue?: boolean; s: StatusKey; proj: string; projColor: string };

const BUCKETS: { title: string; n: number; rows: MyRow[] }[] = [
  {
    title: "Recently assigned",
    n: 2,
    rows: [
      { name: "Vendor contract review", due: "4d overdue", overdue: true, s: "active", proj: "Operations Queue", projColor: BLUE },
      { name: "Q3 pricing sheet", due: "4d overdue", overdue: true, s: "active", proj: "Sales Enablement", projColor: RED },
    ],
  },
  // Five rows in total across the three live buckets, which is what the card leaves
  // room for once the six bucket headers and the footer are accounted for. The
  // counts still say 2 and 3, so showing fewer stays honest.
  {
    title: "Today",
    n: 2,
    rows: [
      { name: "Landing page copy pass", due: "Today", s: "active", proj: "Website Redesign", projColor: PURPLE },
    ],
  },
  {
    title: "This Week",
    n: 3,
    rows: [
      { name: "Failsafe for the nightly data sync", due: "Aug 21", s: "planned", proj: "Operations Queue", projColor: BLUE },
      { name: "Design system rebuild", due: "Aug 21", s: "planned", proj: "Website Redesign", projColor: PURPLE },
    ],
  },
  { title: "Next Week", n: 0, rows: [] },
  { title: "Later", n: 0, rows: [] },
  { title: "Completed", n: 8, rows: [] },
];

function MyTasksDemo() {
  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(45,25,90,0.45)] ${CARD_CLS}`}
    >
      <div className="flex-none px-3.5 pb-2.5 pt-3">
        <b className="block text-[15px] leading-none tracking-tight">My Tasks</b>
        <p className="mt-1 text-[9px] leading-snug text-brand-gray">
          Your assigned tasks, grouped by when they are due.
        </p>
      </div>

      <div className="flex flex-none items-center gap-1 border-b border-[#ECEAE6] px-3.5 pb-2">
        <span className="flex items-center gap-0.5 rounded-lg bg-[#F1EEE9] p-0.5">
          {["List", "Board", "Calendar"].map((v) => (
            <span
              key={v}
              className={`rounded-[6px] px-1.5 py-[3px] text-[8.5px] ${
                v === "List" ? "bg-white font-semibold text-brand-ink shadow-sm" : "font-medium text-brand-charcoal"
              }`}
            >
              {v}
            </span>
          ))}
        </span>
        <span className="ml-auto flex items-center gap-1 rounded-lg px-2 py-1 text-[9px] font-semibold text-white" style={{ background: PURPLE }}>
          <PlusIcon className="h-[9px] w-[9px]" />
          Add task
        </span>
      </div>

      {/* takes whatever height is left and clips, so the card total never moves */}
      <div className="min-h-0 flex-1 overflow-hidden">
      {BUCKETS.map((b) => (
        <div key={b.title}>
          <div className="flex items-center gap-1.5 border-b border-[#F1EEE9] bg-[#FBFAF8] px-3.5 py-1.5">
            <b className="text-[9.5px]" style={{ color: b.n ? PURPLE_D : "#9A948C" }}>
              {b.title}
            </b>
            <span className="text-[8.5px] tabular-nums text-brand-gray">{b.n}</span>
            {b.n === 0 && <span className="ml-auto text-[8px] text-brand-gray">Nothing here</span>}
          </div>
          {/* same two-line shape as the List view, so the two mockups still
              read as the same product at every width */}
          {b.rows.map((r) => (
            <div
              key={r.name}
              className="flex flex-col gap-1.5 border-b border-[#F5F2ED] px-3.5 py-2 sm:flex-row sm:items-center sm:gap-2"
            >
              <div className="flex min-w-0 items-start gap-2 sm:flex-1 sm:items-center">
                <span className="mt-[2px] h-[12px] w-[12px] flex-none rounded-full border-[1.5px] border-[#DDD8D0] sm:mt-0" />
                <span className="min-w-0 flex-1 text-[10.5px] font-medium leading-snug text-brand-ink sm:truncate sm:text-[10px] sm:leading-normal">
                  {r.name}
                </span>
              </div>

              <div className="flex items-center gap-2 pl-[20px] sm:contents sm:pl-0">
                <span
                  className="flex-none whitespace-nowrap text-[8.5px] font-medium sm:w-[62px] sm:text-right"
                  style={{ color: r.overdue ? RED : "#6B6660" }}
                >
                  {r.due}
                </span>
                <span className="hidden w-[66px] flex-none sm:block">
                  <StatusChip s={r.s} />
                </span>
                <span className="ml-auto flex flex-none items-center gap-1 rounded-full bg-[#F4F2EE] px-1.5 py-[2px] sm:ml-0 sm:w-[84px]">
                  <span className="h-[4px] w-[4px] flex-none rounded-full" style={{ background: r.projColor }} />
                  <span className="truncate text-[8px] font-medium text-brand-charcoal">{r.proj}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      ))}
      </div>

      <p className="flex-none border-t border-[#F1EEE9] px-3.5 py-2 text-[9px] text-brand-gray">
        Every task on this page came from a project. Finish it here, and the project moves.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- 4. one task
// Locked to the shared height like the other three mockups. Two things came out to make it
// fit: the Files roll-up, which already has a whole tab to itself in the views
// section above, and the "Add property" chip, which is a control rather than
// something this section is arguing for.
function TaskDetailDemo() {
  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${CARD_CLS}`}
    >
      <div className="flex flex-none items-center gap-1.5 border-b border-[#ECEAE6] px-3.5 py-2">
        <span className="text-[7.5px] font-bold uppercase tracking-[0.12em] text-brand-gray">Task</span>
        <span className="ml-auto flex items-center gap-1">
          <Who k="SL" size={15} />
          <Who k="MC" size={15} />
          <span className="rounded-full border border-[#E3E0DA] px-1.5 py-[2px] text-[8px] font-semibold text-brand-charcoal">
            Following
          </span>
        </span>
      </div>

      <div className="flex-none px-3.5 pb-2.5 pt-3">
        <b className="block text-[14px] leading-tight tracking-tight">Design system rebuild</b>
      </div>

      {/* the property table */}
      <div className="flex-none space-y-1 px-3.5 pb-2.5">
        {[
          {
            l: "Status",
            v: <StatusChip s="active" />,
          },
          {
            l: "Assignee",
            v: (
              <span className="flex items-center gap-1.5">
                <Who k="AR" size={15} />
                <span className="text-[9.5px] font-medium text-brand-ink">Avery Rowe</span>
              </span>
            ),
          },
          {
            l: "Dates",
            v: (
              <span className="flex items-center gap-1.5 text-[9px] text-brand-charcoal">
                <span className="flex items-center gap-1 rounded-md border border-[#E3E0DA] px-1.5 py-[2px]">
                  <CalIcon className="h-[9px] w-[9px] text-brand-gray" />
                  Aug 13, 2026
                </span>
                <Arrow className="h-[9px] w-[9px] text-brand-gray" />
                <span className="flex items-center gap-1 rounded-md border border-[#E3E0DA] px-1.5 py-[2px]">
                  <CalIcon className="h-[9px] w-[9px] text-brand-gray" />
                  Aug 28, 2026
                </span>
              </span>
            ),
          },
          { l: "Priority", v: <Priority p="P1" /> },
          {
            l: "Project",
            v: (
              <span className="flex w-fit items-center gap-1 rounded-full bg-[#F4F2EE] px-1.5 py-[2px]">
                <span className="h-[4px] w-[4px] rounded-full" style={{ background: PURPLE }} />
                <span className="text-[8.5px] font-medium text-brand-charcoal">Website Redesign</span>
              </span>
            ),
          },
          {
            l: "Effort",
            v: <span className="text-[9.5px] font-medium text-brand-ink">8 points</span>,
          },
        ].map((r) => (
          <div key={r.l} className="flex items-center gap-2">
            <span className="w-[52px] flex-none text-[8px] font-bold uppercase tracking-[0.08em] text-brand-gray">
              {r.l}
            </span>
            <span className="min-w-0">{r.v}</span>
          </div>
        ))}
      </div>

      {/* description */}
      <div className="flex-none border-t border-[#F1EEE9] px-3.5 py-2.5">
        <p className="mb-1 text-[8px] font-bold uppercase tracking-[0.08em] text-brand-gray">Description</p>
        <p className="text-[9.5px] leading-snug text-brand-charcoal">
          Rebuild the shared component library so every page draws from one set of tokens. Colour,
          type scale, spacing, and the form controls.
        </p>
      </div>

      {/* the roll-ups */}
      <div className="flex-none border-t border-[#F1EEE9]">
        {[
          { l: "Subtasks", n: "3 of 8", pct: 38 },
          { l: "Dependencies", n: "2", pct: null },
        ].map((s) => (
          <div key={s.l} className="flex items-center gap-2 border-b border-[#F5F2ED] px-3.5 py-2 last:border-b-0">
            <span className="text-[9.5px] font-semibold text-brand-ink">{s.l}</span>
            <span className="rounded-full bg-[#F1EEE9] px-1.5 py-[1px] text-[8px] font-bold tabular-nums text-brand-charcoal">
              {s.n}
            </span>
            {s.pct !== null && (
              <span className="ml-auto h-[4px] w-[60px] overflow-hidden rounded-full bg-[#ECE8E1]">
                <span className="block h-full rounded-full" style={{ width: `${s.pct}%`, background: PURPLE }} />
              </span>
            )}
          </div>
        ))}
      </div>

      {/* comments, taking whatever height is left over */}
      <div className="min-h-0 flex-1 overflow-hidden border-t border-[#F1EEE9] px-3.5 py-2.5">
        <div className="mb-1.5 flex items-center gap-2.5">
          <span className="border-b-[1.5px] pb-0.5 text-[9.5px] font-bold text-brand-ink" style={{ borderColor: PURPLE }}>
            Comments 2
          </span>
          <span className="text-[9.5px] font-medium text-brand-gray">Activity</span>
        </div>
        <div className="flex items-start gap-1.5">
          <Who k="MC" size={16} />
          <span className="min-w-0 flex-1 rounded-lg bg-[#FBFAF8] px-2 py-1.5 text-[9px] leading-snug text-brand-charcoal">
            <b className="font-semibold text-brand-ink">Mira</b> Tokens are merged. Forms are the last
            piece.
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 5. structure
// One card carrying three bands rather than three separate cards. Three cards
// meant three borders, three shadows, three headers, and two gaps, which is
// where most of the old height went. Each band is flex-1 with its rows spread by
// justify-between, so the content stretches to fill the card instead of stacking
// up at the top and leaving dead space underneath.
const FOLDER_TREE: { l: string; depth: number; color?: string; n?: number }[] = [
  { l: "Client Work", depth: 0, color: PURPLE, n: 9 },
  { l: "2026", depth: 1, color: PURPLE, n: 6 },
  { l: "Conferences", depth: 2, color: BLUE, n: 4 },
  // one leaf is enough to show the fourth level; a second only costs height
  { l: "Annual Conference", depth: 3 },
  { l: "Operations", depth: 0, color: BLUE, n: 3 },
  { l: "Recurring", depth: 1, color: GREEN, n: 2 },
  { l: "Unfiled", depth: 0, color: AMBER, n: 5 },
];

const TEMPLATES = [
  { name: "Client Onboarding", sec: 7, tasks: 28, color: PURPLE },
  { name: "Event Build", sec: 16, tasks: 121, color: BLUE },
  { name: "Website Launch", sec: 9, tasks: 80, color: GREEN },
  { name: "Offboarding Process", sec: 4, tasks: 27, color: RED },
];

const VISIBILITY = [
  { l: "Company", d: "Everyone", icon: BuildingIcon, on: true },
  { l: "Leadership", d: "Owner + leads", icon: CrownIcon, on: false },
  { l: "Department", d: "One team", icon: PeopleIcon, on: false },
  { l: "Private", d: "Only you", icon: LockIcon, on: false },
];

function BandLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 flex-none text-[8px] font-bold uppercase tracking-[0.13em] text-brand-gray">{children}</p>
  );
}

function StructureDemo() {
  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${CARD_CLS}`}
    >
      {/* ---- folders ----
          min-h-0 so this band can actually shrink. Without it a flex child
          refuses to go below its content height, the card overflows its 430px,
          and overflow-hidden eats the bottom padding of the last band. */}
      <div className="flex min-h-0 flex-1 flex-col px-4 pb-2.5 pt-3">
        <BandLabel>Folders nest as deep as you like</BandLabel>
        {/* min-h-0 and overflow-hidden are load-bearing, not tidiness.
            A flex child will not shrink below its content height, so without
            them these rows overflow the band and, since the band does not clip
            either, paint straight over the one below. That is invisible while
            the content happens to fit and appears the moment the shared height
            drops. It did, at 340. */}
        <div className="flex min-h-0 flex-1 flex-col justify-between overflow-hidden">
          {FOLDER_TREE.map((f) => (
            <div
              key={f.l}
              className="flex items-center gap-2 text-[11px]"
              style={{ paddingLeft: f.depth * 16 }}
            >
              {f.color ? (
                <span className="h-[6px] w-[6px] flex-none rounded-full" style={{ background: f.color }} />
              ) : (
                <span className="h-[10px] w-[10px] flex-none rounded-[3px] border border-[#DDD8D0]" />
              )}
              <span className={f.color ? "font-medium text-brand-ink" : "text-brand-charcoal"}>{f.l}</span>
              {/* counts pushed to the edge, so the row spans the card */}
              {f.n !== undefined && (
                <span className="ml-auto text-[9.5px] tabular-nums text-brand-gray">{f.n}</span>
              )}
            </div>
          ))}
        </div>
        {/* one line, so the note does not cost the card two rows of height */}
        <p className="mt-2 flex-none border-t border-[#F1EEE9] pt-2 text-[9.5px] leading-snug text-brand-gray">
          Brand, then year, then event type, then month.
        </p>
      </div>

      {/* ---- templates ---- */}
      <div className="flex min-h-0 flex-1 flex-col border-t border-[#F1EEE9] px-4 pb-2.5 pt-3">
        <BandLabel>Start from a template, or blank</BandLabel>
        <div className="flex min-h-0 flex-1 flex-col justify-between overflow-hidden">
          {TEMPLATES.map((t) => (
            <div key={t.name} className="flex items-center gap-2.5 border-b border-[#F5F2ED] pb-1.5 last:border-b-0 last:pb-0">
              <span className="h-[17px] w-[3px] flex-none rounded-full" style={{ background: t.color }} />
              <b className="min-w-0 truncate text-[11px] font-semibold text-brand-ink">{t.name}</b>
              <span className="ml-auto flex-none whitespace-nowrap text-[9.5px] tabular-nums text-brand-gray">
                {t.sec} sections <span className="text-[#D5D0C7]">·</span> {t.tasks} tasks
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ---- sharing: four across, each filling a quarter of the card ---- */}
      <div className="flex-none border-t border-[#F1EEE9] px-4 pb-4 pt-3">
        <BandLabel>Who can see this</BandLabel>
        <div className="grid grid-cols-4 gap-1.5">
          {VISIBILITY.map((v) => {
            const Icon = v.icon;
            return (
              <div
                key={v.l}
                className="rounded-lg border px-1.5 py-2 text-center"
                style={v.on ? { borderColor: `${GREEN}66`, background: `${GREEN}0D` } : { borderColor: "#ECEAE6" }}
              >
                <Icon
                  className="mx-auto h-[12px] w-[12px]"
                  style={{ color: v.on ? GREEN_D : "#8C877F" }}
                />
                <b className="mt-1 block text-[9.5px] font-semibold text-brand-ink">{v.l}</b>
                <p className="text-[8px] leading-tight text-brand-gray">{v.d}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 6. Multi AI data
const AI_ROWS: Row[] = [
  { name: "Website Redesign", value: "6 overdue", hit: false, tone: "amber" },
  { name: "Operations Queue", value: "66 not started", hit: false, tone: "red" },
  { name: "Recurring Ops", value: "74% done", hit: true },
];

const AI_INSIGHTS: Insight[] = [
  {
    tag: "Slipping",
    color: "#C9832B",
    source: "Website Redesign",
    text: "Six tasks went past their due date this week and five of them sit with the same person. The project is not behind, one queue inside it is.",
  },
  {
    tag: "Backlog",
    color: "#C0402B",
    source: "Operations Queue",
    text: "Sixty-six tasks have never left Not Started, and the oldest has been open ninety-one days. Nothing here is blocked, it is just unassigned.",
  },
  {
    tag: "Pattern",
    color: "#1F7F4C",
    source: "Recurring Ops",
    text: "This board clears 74% every month without anyone chasing it, because the work arrives from a template instead of somebody's memory. Two other projects could run the same way.",
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
  accent,
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
  accent: string;
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
                <Check className="mt-[3px] h-[17px] w-[17px] flex-none" style={{ color: accent }} />
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
export default function ProjectsTasksPage() {
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
              <span className="grid h-[21px] w-[21px] flex-none place-items-center rounded-lg bg-gradient-to-br from-[#7C5CD6] to-[#4B3799] text-white shadow-[0_2px_6px_rgba(91,71,168,0.34),inset_0_1px_0_rgba(255,255,255,0.34)] sm:h-[34px] sm:w-[34px] sm:rounded-[11px]">
                <BoardIcon className="h-[14px] w-[14px] sm:h-[19px] sm:w-[19px]" />
              </span>
              <span className="text-[11.5px] font-[650] tracking-[0.02em] text-[#33302C] sm:text-[16.5px]">
                Projects &amp; Tasks
              </span>
            </span>
            <h1 className="text-[24px] font-extrabold leading-[1.1] tracking-tight text-brand-ink sm:text-[66px] sm:leading-[1.04]">
              See the whole board,
              <br />
              <span className="text-brand-orange">work the next row.</span>
            </h1>
            <p className="mx-auto mt-3.5 max-w-2xl text-[14.5px] leading-relaxed text-brand-charcoal sm:mt-7 sm:text-xl">
              <span className="sm:hidden">Projects hold the full scope. My Tasks hands you this week's slice.</span>
              <span className="hidden sm:inline">Projects hold the full scope, in seven views. My Tasks hands you the slice that is due
              this week.</span>
            </p>
          </Reveal>

          <Reveal delay={0.12} className="mt-6 sm:mt-12">
            {/* The chip goes in a relative wrapper alongside the panel rather
                than inside it: the panel clips to its rounded corners, and the
                claim has to hang over its top edge. */}
            <div className="relative">
              <ReplacesChip names={REPLACES.projectsTasks} />
              <div
                className="overflow-hidden rounded-2xl p-2 sm:rounded-[30px] sm:p-8"
                style={{ background: "linear-gradient(160deg, #FFF1E2, #FFE7D2)" }}
              >
                <ProjectsTasksHeroTour />
              </div>
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

      {/* ------------------------------------------------ 2. the seven views */}
      <Section
        id="views"
        eyebrow="Inside a project"
        title="One project,"
        swash="seven ways to see it."
        body="A list for the person working it, a board for the standup, a timeline for the plan, a calendar for the week. Nobody re-enters anything. Switch the tab and the same tasks rearrange themselves."
        points={[
          "Every view reads the same tasks, so nothing is re-entered",
          "Group, sort, and filter, then save it as a view",
          "Files and budget live on the project, not a drive folder",
        ]}
        visual={<ViewsDemo />}
        panel="linear-gradient(160deg, #EEF4FB, #E2ECF8)"
        accent={GREEN}
      />

      {/* ------------------------------------------------ 3. My Tasks */}
      <Section
        id="my-tasks"
        eyebrow="My Tasks"
        title="Today, this week,"
        swash="and what can wait."
        body="Every task assigned to you across every project, bucketed by when it is due. Not a project you have to open, not a board you have to scan, and not a status meeting to sit through first."
        points={[
          "Assignments from every project land in one list",
          "Overdue surfaces at the top instead of hiding inside a board",
          "List, board, or calendar, whichever way you think about your week",
        ]}
        visual={<MyTasksDemo />}
        flip
        panel="linear-gradient(160deg, #EFEBFB, #DED6F6)"
        accent={PURPLE}
      />

      {/* ------------------------------------------------ 4. one task */}
      <Section
        id="task"
        eyebrow="One task"
        title="Open the task,"
        swash="and it is all there."
        body="Owner, dates, priority, effort, and the fields your project added. Break it into subtasks, wire up what it is waiting on, and keep the conversation attached to the work instead of in a thread nobody can find."
        points={[
          "Subtasks that roll their progress back up to the parent",
          "Dependencies, so a blocked task says what it is blocked on",
          "Comments and full activity history, kept on the task forever",
        ]}
        visual={<TaskDetailDemo />}
        panel="linear-gradient(160deg, #FFF6EC, #FFEBD8)"
        accent={PURPLE}
      />

      {/* ------------------------------------------------ 5. structure */}
      <Section
        id="structure"
        eyebrow="Structure at scale"
        title="Filed the way your business"
        swash="is actually shaped."
        body="Folders nest like a drive, so brand, year, and event type each get a level. The shapes you run over and over become templates. And every project carries its own answer to who is allowed to see it."
        points={[
          "Folders nest as deep as the business actually is",
          "Save any project as a template and spin the next one up pre-built",
          "Company, leadership, department, or private, set per project",
        ]}
        visual={<StructureDemo />}
        flip
        panel="linear-gradient(160deg, #EEF6F2, #E1EFE8)"
        accent={GREEN}
      />

      {/* ------------------------------------------------ 6. Multi AI (always last) */}
      <MultiAiWired
        heading="Every project, read by"
        swash="a chief of staff."
        intro="Multi AI already has every project, task, due date, and owner your team has entered. Ask what is slipping, what has stalled, and who is carrying too much, and it answers out of the board itself."
        leftLabel="The work your team tracks"
        leftColor={PURPLE_D}
        leftIcon={BoardIcon}
        rightLabel="What Multi AI finds in it"
        panelTitle="Projects · All"
        panelMeta="16 projects"
        panelDot={PURPLE_D}
        rows={AI_ROWS}
        insights={AI_INSIGHTS}
        aiMeta="reading 16 projects"
        footer="Multi AI reads the projects your team already runs. No exports, no prompt engineering, no separate AI subscription."
      />

      <CTA />
      <Footer />
    </main>
  );
}
