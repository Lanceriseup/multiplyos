"use client";

// Feature page: Team Meetings & 1on1s.
//
// The product keeps these apart, two separate nav items with different screens.
// The page puts them together because they are the same object underneath: a
// timeboxed agenda you step through in a live session, which captures what was
// decided and carries the rest forward. Team meetings do it for a group against
// the company's work. 1on1s do it for two people against one person's.
//
// Section order:
//   1. hero: the two acts, with the zoom-out between them
//   2. recurring team meetings: the agenda that adds up
//   3. the live session: pause, resume, complete
//   4. 1on1 studio: pick a person, set the shape, share the agenda
//   5. continuity: the argument the whole page is built on
//   6. ad hoc capture: the lightweight closer
//   7. (last, as on every feature page) how Multi AI reads this data
//
// Two colours run through the page: BLUE is Team Meetings, matching the nav and
// the home-page card, TEAL is 1on1s.
//
// Mockups are hand-built in markup rather than screenshots so they stay crisp
// and themeable. Meeting names, agenda items, and people are deliberately
// generic, the ones any business would recognise rather than the ones in the
// demo account. Nothing on this page names a branded methodology.
// See docs/team-meetings-feature-notes.md for what is confirmed and what is not.
import { motion } from "framer-motion";
import { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CTA from "./CTA";
import Reveal from "./Reveal";
import TeamMeetingsHeroTour from "./TeamMeetingsHeroTour";
import MultiAiWired from "./MultiAiWired";
import type { Row, Insight } from "./MultiAiWired";
import { useDemo } from "./DemoModal";

// ---------------------------------------------------------------- tokens
const BLUE = "#2C6BA6";
const BLUE_L = "#4A9FE0";
const BLUE_BG = "#EAF3FC";
const TEAL = "#1C6B62";
const TEAL_L = "#2A8C82";
const TEAL_BG = "#E8F5F2";
const GREEN = "#2BA463";
const AMBER = "#B4771A";
const AMBER_BG = "#FDF3E0";
const colTransition = { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const };

// Every section mockup is locked to this height, so the tinted panels stop
// running ragged down the page. Same approach as ProjectsTasksPage's CARD_H,
// just a taller number: Continuity is the tallest of the five and its
// carry-over card is the whole argument of that section, so the height was
// raised to fit it rather than the card trimmed to fit the height.
//
// The pattern throughout: root is `flex flex-col` at CARD_H, bands are
// `min-h-0 flex-1`, and rows inside a band spread with `justify-between`.
// min-h-0 matters. Without it a flex child refuses to shrink below its content
// height, the card overflows, and overflow-hidden eats the last row.
const CARD_H = 460;

// Mobile gets its own shared height for the same reason desktop does: five
// panels down a page look ragged unless they agree. 360 is the number the two
// settled cards already landed on, so the other three compress to meet them
// rather than the reverse.
//
// Applied as one class string so every card is changed in one place. Written
// out in full rather than composed from CARD_H, because Tailwind scans source
// for literal class names and never sees an interpolated one.
const CARD_CLS = "h-[360px] sm:h-[460px]";

type IconProps = { className?: string; style?: React.CSSProperties };

// ---------------------------------------------------------------- icons
const CalIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3.5" y="5" width="17" height="15" rx="2.4" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </svg>
);
const Check = ({ className, style }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} style={style} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12l5 5L20 7" />
  </svg>
);
const Arrow = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
const ClockIcon = ({ className, style }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} style={style} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);
const PeopleIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="8" r="3.4" />
    <path d="M2.8 19.5c.7-3.3 3.2-5 6.2-5s5.5 1.7 6.2 5M16.5 5.6a3.3 3.3 0 0 1 0 6.4M18 14.9c2.1.5 3.4 2 3.9 4.6" />
  </svg>
);
const PlayIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round">
    <path d="M7 4.5l12 7.5-12 7.5z" />
  </svg>
);
const PauseIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <rect x="7" y="5" width="3.6" height="14" rx="1.2" />
    <rect x="13.4" y="5" width="3.6" height="14" rx="1.2" />
  </svg>
);
const AlertIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4.5l8.5 15h-17z" />
    <path d="M12 10v4M12 17.2v.1" />
  </svg>
);
const SearchIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4.5 4.5" />
  </svg>
);
const ChatIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 5.5h16v11H12l-5 3.5v-3.5H4z" />
  </svg>
);
const PlusIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
    <path d="M12 5.5v13M5.5 12h13" />
  </svg>
);
const BoardIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round">
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.2" />
    <path d="M9 4.5v15" />
  </svg>
);
const GaugeIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 17a8 8 0 1 1 16 0" />
    <path d="M12 17l4-4.5" />
  </svg>
);
const OrgIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="3" width="6" height="4.5" rx="1.2" />
    <rect x="3" y="16.5" width="6" height="4.5" rx="1.2" />
    <rect x="15" y="16.5" width="6" height="4.5" rx="1.2" />
    <path d="M12 7.5v4.5M6 16.5V12h12v4.5" />
  </svg>
);
const HistoryIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12a8 8 0 1 0 2.5-5.8M4 4v4h4" />
    <path d="M12 8v4.4l3 1.8" />
  </svg>
);

// ---------------------------------------------------------------- people
const PEOPLE = {
  SL: { init: "SL", name: "Skylar Lewis", bg: "#B4532A" },
  JR: { init: "JR", name: "Jordan Rivera", bg: "#2C6BA6" },
  PN: { init: "PN", name: "Priya Nair", bg: "#6B4E9E" },
  MH: { init: "MH", name: "Marcus Hale", bg: "#2E7D5B" },
  // extras so the ad hoc directory reads as a company rather than a team, and
  // so the list overflows its box and visibly scrolls
  AD: { init: "AD", name: "Ava Donnelly", bg: "#8A3F6D" },
  DW: { init: "DW", name: "Dana Whitfield", bg: "#9A5A18" },
  TB: { init: "TB", name: "Tomas Bergman", bg: "#1F5F7A" },
} as const;
type PersonKey = keyof typeof PEOPLE;

// Neutral stand-in for the customer's own domain, matching the org name used
// in the hero's nav rail.
const DOMAIN = "northwind.co";
const mailFor = (k: PersonKey) => `${PEOPLE[k].name.split(" ")[0].toLowerCase()}@${DOMAIN}`;

function Who({ k, size = 20 }: { k: PersonKey; size?: number }) {
  const p = PEOPLE[k];
  return (
    <span
      className="grid flex-none place-items-center rounded-full font-bold text-white"
      style={{ height: size, width: size, background: p.bg, fontSize: size * 0.4 }}
    >
      {p.init}
    </span>
  );
}

function Card({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`rounded-[14px] border border-[#E7E4DE] bg-white ${className}`} style={style}>
      {children}
    </div>
  );
}

function Head({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 border-b border-[#F0EDE8] px-4 py-2.5">
      <span className="text-[10px] font-bold uppercase tracking-[0.09em] text-brand-gray">{children}</span>
      {right && <span className="ml-auto">{right}</span>}
    </div>
  );
}

// ================================================================ 2. the agenda
// The load-bearing detail: the timeboxes sum to the stated length.
//
// Laid out as proportional blocks rather than a list, so the height of a step
// IS its timebox: Tasks Review is three times the height of Opening because it
// is three times as long. That turns the footer sum from a claim you read into
// a caption for something already visible, and it means there is no leftover
// space to distribute, which is what made the plain list float in dead air once
// the card was locked to CARD_H.
//
// `at` is the cumulative start time, drawn up the left rail like a calendar
// column. It must stay in step with the running total of `min`.
const AGENDA: {
  label: string;
  min: number;
  at: string;
  note: string;
  from?: { label: string; bg: string; color: string; icon: (p: IconProps) => React.JSX.Element };
}[] = [
  { label: "Opening", min: 5, at: "0:00", note: "Wins from last week, then straight into the work." },
  {
    label: "Tasks Review",
    min: 15,
    at: "5:00",
    note: "The team's open tasks, read straight off the board. Nobody reads out a status update they already typed.",
    from: { label: "Projects", bg: "#EFEBFB", color: "#5B47A8", icon: BoardIcon },
  },
  {
    label: "Issues Review",
    min: 15,
    at: "20:00",
    note: "Anything raised since last time, worked until it is closed or owned.",
    from: { label: "Issues", bg: "#FDECE8", color: "#C0402B", icon: AlertIcon },
  },
  {
    label: "Scoreboard Review",
    min: 10,
    at: "35:00",
    note: "This week's numbers against goal, live from the scoreboard.",
    from: { label: "Scoreboards", bg: "#FDF0E4", color: "#B4532A", icon: GaugeIcon },
  },
];

// A 5m block lands at roughly 33px, which holds a label and a duration but not
// a note. Anything from 10m up has room.
const NOTE_MIN = 10;

function AgendaDemo() {
  const [open, setOpen] = useState(1);
  const total = AGENDA.reduce((s, a) => s + a.min, 0);

  const rowHead = (a: (typeof AGENDA)[number], i: number, on: boolean) => (
    <>
      <span
        className="grid h-[18px] w-[18px] flex-none place-items-center rounded-full text-[9.5px] font-bold transition-colors"
        style={{ background: on ? BLUE : "#EDEAE4", color: on ? "#fff" : "#57534C" }}
      >
        {i + 1}
      </span>
      <span className="text-[12.5px] font-semibold" style={{ color: on ? BLUE : "#1B1A17" }}>
        {a.label}
      </span>
      {a.from && (
        <span
          className="inline-flex flex-none items-center gap-1 rounded-md px-1.5 py-0.5 text-[9.5px] font-semibold"
          style={{ background: a.from.bg, color: a.from.color }}
        >
          <a.from.icon className="h-[9px] w-[9px]" />
          {a.from.label}
        </span>
      )}
      <span className="ml-auto flex-none font-mono text-[10.5px] text-brand-gray">{a.min}m</span>
    </>
  );

  return (
    <Card className={`flex flex-col overflow-hidden ${CARD_CLS}`}>
      <div className="flex flex-none items-center gap-2.5 border-b border-[#F0EDE8] px-4 py-3">
        <span className="grid h-[26px] w-[26px] flex-none place-items-center rounded-[8px]" style={{ background: BLUE_BG, color: BLUE }}>
          <CalIcon className="h-[15px] w-[15px]" />
        </span>
        <span className="text-[14px] font-extrabold tracking-tight text-brand-ink">Leadership Team</span>
        <span className="ml-auto inline-flex flex-none items-center gap-1.5 rounded-lg bg-brand-orange px-2.5 py-[5px] text-[11px] font-semibold text-white">
          <AlertIcon className="h-[11px] w-[11px]" />
          Issues
        </span>
      </div>

      {/* the long forms wrap to two lines at 360px, so mobile gets short ones */}
      <div className="flex flex-none flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 text-[11.5px] font-medium text-brand-charcoal">
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <CalIcon className="h-[13px] w-[13px] flex-none text-brand-gray" />
          Weekly<span className="hidden sm:inline">&nbsp;· Mondays</span>
        </span>
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <ClockIcon className="h-[13px] w-[13px] flex-none text-brand-gray" />
          45 min
        </span>
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <PeopleIcon className="h-[13px] w-[13px] flex-none text-brand-gray" />7{" "}
          <span className="sm:hidden">people</span>
          <span className="hidden sm:inline">participants</span>
        </span>
      </div>

      {/* ---------------------------------------------------------------
          MOBILE: a plain list, tap to open one note.
          Option B from design/team-meetings-agenda-mobile-options.html.
          The proportional column cannot work at 360px: once the blocks carry
          minimum heights so the 5m step stays tappable, the proportions flatten
          and the drawing stops being to scale, while the notes still clip
          mid-sentence. A list makes no claim it cannot keep.
          --------------------------------------------------------------- */}
      <div className="flex min-h-0 flex-1 flex-col justify-between px-2 pb-2 pt-1 sm:hidden">
        {AGENDA.map((a, i) => {
          const on = open === i;
          return (
            <button
              key={a.label}
              type="button"
              onClick={() => setOpen(i)}
              aria-pressed={on}
              className="w-full rounded-[10px] px-2 py-2 text-left transition-colors"
              style={{ background: on ? BLUE_BG : "transparent" }}
            >
              <span className="flex items-center gap-2">{rowHead(a, i, on)}</span>
              {/* span, not p: a button may only contain phrasing content */}
              {on && (
                <span className="mt-1.5 block pl-[26px] pr-1 text-[11px] leading-[1.45] text-brand-charcoal">{a.note}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ---------------------------------------------------------------
          DESKTOP: the proportional column. Rail and blocks share the same flex
          weights and the same gap, so a tick always lands on its block's top
          edge. The closing 45:00 is pinned rather than added as a fifth
          segment, which would push the rail taller than the blocks it labels.
          --------------------------------------------------------------- */}
      <div className="hidden min-h-0 flex-1 gap-2 px-3 pb-2.5 pt-2 sm:flex">
        <div className="relative flex w-[36px] flex-none flex-col gap-[3px]">
          {AGENDA.map((a) => (
            <div key={a.label} className="min-h-0" style={{ flex: `${a.min} 1 0` }}>
              <span className="font-mono text-[9.5px] leading-none text-brand-gray">{a.at}</span>
            </div>
          ))}
          <span className="absolute bottom-0 left-0 font-mono text-[9.5px] leading-none text-brand-gray">
            {total}:00
          </span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-[3px]">
          {AGENDA.map((a, i) => {
            const on = open === i;
            return (
              <button
                key={a.label}
                type="button"
                onClick={() => setOpen(i)}
                aria-pressed={on}
                className="flex min-h-0 w-full flex-col gap-1 overflow-hidden rounded-[9px] border px-2.5 py-[6px] text-left transition-colors"
                style={{
                  flex: `${a.min} 1 0`,
                  background: on ? BLUE_BG : "#FBFAF8",
                  borderColor: on ? "#B9D6EE" : "#F0EDE8",
                  borderLeftWidth: 3,
                  borderLeftColor: on ? BLUE : "#E1DDD6",
                }}
              >
                <span className="flex flex-none items-center gap-2">{rowHead(a, i, on)}</span>
                {a.min >= NOTE_MIN && (
                  <span className="block min-h-0 pl-[26px] pr-1 text-[11px] leading-[1.45] text-brand-charcoal">{a.note}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* the sum is the argument. On mobile the sentence wraps the equation, so
          only the equation survives. */}
      <div className="flex flex-none items-center gap-2.5 border-t border-[#F0EDE8] bg-[#FBFAF8] px-4 py-3">
        <span className="whitespace-nowrap font-mono text-[12px] font-semibold tabular-nums" style={{ color: BLUE }}>
          {AGENDA.map((a) => a.min).join(" + ")} = {total}
          <span className="sm:hidden"> min</span>
        </span>
        <span className="hidden text-[11.5px] text-brand-charcoal sm:inline">
          minutes, and the blocks are drawn to scale.
        </span>
      </div>
    </Card>
  );
}


// ================================================================ 3. live session
// Two columns, chosen from design/team-meetings-live-card-options.html (option A).
//
// The single-column version left roughly 180px of nothing at the bottom until
// the meeting was nearly over. The card was using half its width and all of its
// height; splitting it means the vertical space the two lists were fighting over
// stops existing. Each column also ends in something permanent, an elapsed bar
// on the left and a "where this goes" footer on the right, so neither column
// empties out at step 0. That was the actual test: the old card looked fine at
// the end and broke at the start.
//
// Layout matches the hero's running meeting, agenda left and captures right, so
// this reads as the same screen slowed down rather than a different one.
//
// Steps are driven off AGENDA so the labels, timeboxes, and cumulative times can
// never drift from section 2.
const LIVE_AT = [...AGENDA.map((a) => a.at), `${AGENDA.reduce((s, a) => s + a.min, 0)}:00`];

// What the meeting picks up as it runs. `at` is the step it appears on, so the
// list builds as you scrub. Only two kinds, task and issue: those are the two
// the product actually shows, and a third would be invented.
//
// Text has to stay short. The right column is a little over half the card, so
// anything past roughly 34 characters gets clipped.
const LIVE_CAUGHT: { kind: "Task" | "Issue"; text: string; who: PersonKey; at: number }[] = [
  { kind: "Task", text: "Send the wins recap to the team", who: "PN", at: 1 },
  { kind: "Task", text: "Send the renewal list to Sales", who: "PN", at: 2 },
  { kind: "Task", text: "Unblock the design review", who: "JR", at: 2 },
  { kind: "Issue", text: "Two projects have no owner", who: "MH", at: 2 },
  { kind: "Issue", text: "Onboarding needs a manual step", who: "MH", at: 3 },
  { kind: "Issue", text: "Two clients still on old pricing", who: "JR", at: 3 },
  { kind: "Task", text: "Draft the pricing migration plan", who: "SL", at: 3 },
  { kind: "Issue", text: "Cost per lead is over goal", who: "SL", at: 4 },
];

function LiveDemo() {
  // opens mid-meeting so the first thing anyone sees has work in it
  const [step, setStep] = useState(2);
  const caught = LIVE_CAUGHT.filter((c) => c.at <= step);
  const total = AGENDA.reduce((s, a) => s + a.min, 0);
  const done = AGENDA.slice(0, step).reduce((s, a) => s + a.min, 0);

  const capRow = (c: (typeof LIVE_CAUGHT)[number]) => (
    <div key={c.text} className="flex flex-none items-center gap-2 rounded-[9px] border border-[#E7E4DE] bg-white px-2.5 py-[6px]">
      <span
        className="flex-none rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
        style={c.kind === "Task" ? { background: "#EFEBFB", color: "#5B47A8" } : { background: "#FDECE8", color: "#C0402B" }}
      >
        {c.kind}
      </span>
      <span className="truncate text-[11.5px] font-medium text-brand-ink">{c.text}</span>
      <span className="ml-auto flex-none">
        <Who k={c.who} size={17} />
      </span>
    </div>
  );

  const legend = (
    <>
      <span className="flex items-center gap-1.5">
        <span className="flex-none rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide" style={{ background: "#EFEBFB", color: "#5B47A8" }}>
          Task
        </span>
        goes to Projects, with an owner
      </span>
      <span className="flex items-center gap-1.5">
        <span className="flex-none rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide" style={{ background: "#FDECE8", color: "#C0402B" }}>
          Issue
        </span>
        stays on the meeting until closed
      </span>
    </>
  );

  const emptyCaps = (
    <div className="flex flex-col items-center justify-center gap-1 py-6 text-center text-[11px] text-brand-gray">
      <span>Nothing captured yet.</span>
      <span>Anything raised lands here.</span>
    </div>
  );

  return (
    <div className={`flex flex-col ${CARD_CLS}`}>
      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* the pinned session bar. Two rows on mobile: at 360px the name, the
            clock and both buttons on one line pushed Complete off the edge. */}
        <div
          className="flex flex-none flex-col gap-2 border-b px-3 py-2.5 sm:flex-row sm:items-center sm:gap-2.5 sm:px-4"
          style={{ background: "#FEFBEF", borderColor: "#F0E4C4" }}
        >
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-[8px] w-[8px] flex-none">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E2703A] opacity-70" />
              <span className="relative inline-flex h-[8px] w-[8px] rounded-full bg-[#E2703A]" />
            </span>
            <span className="whitespace-nowrap text-[12.5px] font-bold text-brand-ink">Leadership Team</span>
            <span className="ml-auto whitespace-nowrap font-mono text-[12.5px] font-semibold tabular-nums text-brand-ink sm:ml-2">
              {LIVE_AT[step]} <span className="font-normal text-brand-gray">of {total}:00</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:ml-auto">
            <span className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#E1DDD6] bg-white px-2.5 py-[5px] text-[11px] font-semibold text-brand-charcoal sm:flex-none">
              <PauseIcon className="h-[10px] w-[10px]" />
              Pause
            </span>
            <span className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-ink px-2.5 py-[5px] text-[11px] font-semibold text-white sm:flex-none">
              <Check className="h-[10px] w-[10px]" />
              Complete
            </span>
          </div>
        </div>

        {/* ---------------------------------------------------------------
            MOBILE: the agenda collapses to a segmented bar, and the body is
            all capture. Option B from
            design/team-meetings-live-mobile-options.html.
            Two 165px columns at phone width truncated every captured item to
            "Send…"; giving the list the full width fixes that, and the strip
            still carries what the four rows did, what is done, what is
            running, and what is left.
            --------------------------------------------------------------- */}
        <div className="flex min-h-0 flex-1 flex-col sm:hidden">
          <div className="flex flex-none flex-col gap-1.5 border-b border-[#F0EDE8] px-3 py-2.5">
            <div className="flex gap-[2px]">
              {AGENDA.map((a, i) => (
                <span
                  key={a.label}
                  className="h-[7px] rounded-[3px] transition-colors"
                  style={{
                    flex: `${a.min} 1 0`,
                    background: i < step ? GREEN : i === step ? BLUE : "#F0EDE8",
                  }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11.5px] font-bold" style={{ color: BLUE }}>
                {step < AGENDA.length ? AGENDA[step].label : "Wrapping up"}
              </span>
              <span className="ml-auto font-mono text-[10.5px] tabular-nums text-brand-gray">
                {done} / {total} min
              </span>
            </div>
          </div>

          {/* the list can run to eight items but the card is fixed, so it
              clips behind a fade rather than pushing the legend off the bottom */}
          <div className="flex min-h-0 flex-1 flex-col gap-1.5 px-3 py-2.5">
            <div className="flex flex-none items-center text-[9.5px] font-bold uppercase tracking-[0.09em] text-brand-gray">
              Captured this meeting
              <span className="ml-auto font-mono text-[10.5px] font-medium tabular-nums">{caught.length}</span>
            </div>
            <div className="relative flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden">
              {caught.length ? caught.map(capRow) : emptyCaps}
              {caught.length > 3 && (
                <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[24px] bg-gradient-to-t from-white via-white/85 to-transparent" />
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 border-t border-[#F0EDE8] px-3 py-2.5 text-[10px] text-brand-gray">
            {legend}
          </div>
        </div>

        {/* ---------------------------------------------------------------
            DESKTOP: two columns. Each ends in something permanent, an elapsed
            bar on the left and the legend on the right, so neither column
            empties out at step 0.
            --------------------------------------------------------------- */}
        <div className="hidden min-h-0 flex-1 sm:flex">
          <div className="flex w-[47%] flex-none flex-col border-r border-[#F0EDE8] py-2.5 pl-3 pr-2.5">
            <div className="flex flex-col gap-[2px]">
              {AGENDA.map((a, i) => {
                const isDone = i < step;
                const now = i === step;
                return (
                  <div
                    key={a.label}
                    className="flex items-center gap-2.5 rounded-[9px] px-2 py-[7px] transition-colors"
                    style={{ background: now ? BLUE_BG : "transparent" }}
                  >
                    <span
                      className="grid h-[19px] w-[19px] flex-none place-items-center rounded-full border-[1.7px] text-[10px] font-bold transition-colors"
                      style={{
                        borderColor: isDone ? GREEN : now ? BLUE : "#E1DDD6",
                        background: isDone ? GREEN : now ? BLUE : "transparent",
                        color: isDone || now ? "#fff" : "#57534C",
                      }}
                    >
                      {isDone ? <Check className="h-[10px] w-[10px]" /> : i + 1}
                    </span>
                    <span
                      className="text-[12.5px] font-semibold"
                      style={{ color: isDone ? "#9B958C" : now ? BLUE : "#1B1A17", textDecoration: isDone ? "line-through" : "none" }}
                    >
                      {a.label}
                    </span>
                    <span className="ml-auto flex-none font-mono text-[10.5px] text-brand-gray">{a.min}m</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-auto flex flex-col gap-1.5 px-2 pt-3">
              <div className="flex items-center text-[9.5px] font-bold uppercase tracking-[0.09em] text-brand-gray">
                Elapsed
                <span className="ml-auto font-mono text-[10.5px] font-medium normal-case tracking-normal tabular-nums">
                  {done} / {total} min
                </span>
              </div>
              <div className="h-[6px] overflow-hidden rounded-full bg-[#F0EDE8]">
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{ width: `${(done / total) * 100}%`, background: BLUE }}
                />
              </div>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-2 bg-[#FBFAF8] px-3 py-2.5">
            <div className="flex flex-none items-center text-[9.5px] font-bold uppercase tracking-[0.09em] text-brand-gray">
              Captured this meeting
              <span className="ml-auto font-mono text-[10.5px] font-medium tabular-nums">{caught.length}</span>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden">
              {caught.map(capRow)}
              {caught.length === 0 && emptyCaps}
            </div>

            <div className="flex flex-none flex-col gap-1.5 border-t border-[#EAE7E1] pt-2.5 text-[10px] text-brand-gray">
              {legend}
            </div>
          </div>
        </div>
      </Card>

      {/* scrubber, so the visual is playable rather than a still */}
      <div className="mt-3 flex flex-none items-center gap-2">
        <span className="text-[11px] font-semibold text-brand-gray">Step through it</span>
        <div className="flex gap-1">
          {LIVE_AT.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setStep(i)}
              aria-label={`Step ${i}`}
              aria-pressed={step === i}
              className="h-[7px] rounded-full transition-all"
              style={{ width: step === i ? 22 : 7, background: step === i ? BLUE : "#DCD8D0" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}


// ================================================================ 4. 1on1 studio
const LENGTHS = ["15", "30", "45", "60", "90"];
const TYPES = ["Regular", "Monthly", "Quarterly", "Annual review"];

function StudioDemo() {
  const [len, setLen] = useState("30");
  const [type, setType] = useState("Regular");
  const [flow, setFlow] = useState(0);
  const flowName = flow === 0 ? "Standard cadence" : "Quarterly review";

  return (
    <Card className={`flex flex-col overflow-hidden ${CARD_CLS}`}>
      <div className="flex flex-none items-center gap-2.5 border-b border-[#F0EDE8] px-4 py-3">
        <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[9.5px] font-bold uppercase tracking-[0.08em]" style={{ background: TEAL_BG, color: TEAL }}>
          <ChatIcon className="h-[10px] w-[10px]" />
          1on1 studio
        </span>
        {/* the labelled buttons crowd the badge at 360px, so mobile keeps the
            icons and drops the words */}
        <div className="ml-auto flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-lg border border-[#E7E4DE] px-2 py-[5px] text-[10.5px] font-semibold text-brand-charcoal">
            <OrgIcon className="h-[11px] w-[11px]" />
            <span className="hidden sm:inline">Org chart</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg border border-[#E7E4DE] px-2 py-[5px] text-[10.5px] font-semibold text-brand-charcoal">
            <GaugeIcon className="h-[11px] w-[11px]" />
            <span className="hidden sm:inline">Scorecard</span>
          </span>
        </div>
      </div>

      <div className="flex-none border-b border-[#F0EDE8] px-4 py-3">
        <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.09em] text-brand-gray">Who are you meeting with?</div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border bg-white px-1.5 py-[3px]" style={{ borderColor: TEAL_L, boxShadow: `0 0 0 2px ${TEAL_L}33` }}>
            <Who k="JR" size={17} />
            <span className="pr-1 text-[11px] font-semibold text-brand-charcoal">Jordan Rivera</span>
          </span>
          <span className="hidden text-[11px] text-brand-gray sm:inline">+ pick someone else</span>
        </div>
      </div>

      {/* ---------------------------------------------------------------
          MOBILE: a settings list. Option B from
          design/team-meetings-remaining-mobile-options.html.
          Nine pills across three wrapped rows is a lot of small targets on a
          phone; three rows carrying the current value is the compact form.
          The trade is that the alternatives are no longer visible, which the
          section copy has to carry instead.
          --------------------------------------------------------------- */}
      <div className="flex min-h-0 flex-1 flex-col justify-center px-4 sm:hidden">
        {[
          { k: "Length", v: `${len} min` },
          { k: "Type", v: type },
          { k: "Flow", v: flowName },
        ].map((r, i) => (
          <div
            key={r.k}
            className={`flex items-center gap-3 py-3 ${i < 2 ? "border-b border-[#F0EDE8]" : ""}`}
          >
            <span className="text-[12px] font-semibold text-brand-charcoal">{r.k}</span>
            <span className="ml-auto text-[12px] font-bold" style={{ color: TEAL }}>
              {r.v}
            </span>
            <svg viewBox="0 0 24 24" className="h-[12px] w-[12px] flex-none text-brand-gray" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </div>
        ))}
      </div>

      {/* ---------------------------------------------------------------
          DESKTOP: the three option groups spread through the remainder
          --------------------------------------------------------------- */}
      <div className="hidden min-h-0 flex-1 flex-col justify-between px-4 py-3 sm:flex">
        <div>
          <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.09em] text-brand-gray">Length</div>
          <div className="flex flex-wrap gap-1.5">
            {LENGTHS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setLen(m)}
                className="rounded-lg border px-2.5 py-[5px] text-[11px] font-semibold transition-colors"
                style={m === len ? { borderColor: TEAL_L, background: TEAL_BG, color: TEAL } : { borderColor: "#E7E4DE", color: "#57534C" }}
              >
                {m} min
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.09em] text-brand-gray">Type</div>
          <div className="flex flex-wrap gap-1.5">
            {TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className="rounded-lg border px-2.5 py-[5px] text-[11px] font-semibold transition-colors"
                style={t === type ? { borderColor: TEAL_L, background: TEAL_BG, color: TEAL } : { borderColor: "#E7E4DE", color: "#57534C" }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.09em] text-brand-gray">Flow</div>
          <div className="flex gap-1.5">
            {[
              { t: "Standard cadence", d: "The regular rhythm. What is working, what is not, what you need." },
              { t: "Quarterly review", d: "Walk the quarter together: missions, monthly objectives, weekly moves." },
            ].map((f, i) => (
              <button
                key={f.t}
                type="button"
                onClick={() => setFlow(i)}
                className="flex-1 rounded-[10px] border px-3 py-2.5 text-left transition-colors"
                style={i === flow ? { borderColor: TEAL_L, background: TEAL_BG } : { borderColor: "#E7E4DE" }}
              >
                <span className="block text-[12px] font-bold" style={{ color: i === flow ? TEAL : "#1B1A17" }}>
                  {f.t}
                </span>
                <span className="mt-0.5 block text-[10.5px] leading-relaxed text-brand-charcoal">{f.d}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-none flex-col gap-2 border-t border-[#F0EDE8] px-4 py-3 sm:flex-row sm:items-center">
        <span className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-ink px-3.5 py-2 text-[12px] font-semibold text-white">
          <PlayIcon className="h-[11px] w-[11px]" />
          Start meeting
        </span>
        <span className="text-center text-[11px] text-brand-gray sm:text-left">
          {len} min · {type} · {flowName}
        </span>
      </div>
    </Card>
  );
}


// ================================================================ 5. continuity
const CARRY_TOPICS = [
  { t: "Where the onboarding rewrite stands", done: true },
  { t: "Cover for the support desk in December", done: true },
  { t: "Career path after the Q4 push", done: false },
];

function ContinuityDemo() {
  const topic = (c: { t: string; done: boolean }, showCarry: boolean) => (
    <div
      key={c.t}
      className="flex items-start gap-2.5 rounded-[9px] border px-3 py-2"
      style={{ borderColor: c.done ? "#EFECE6" : "#F0DFC0", background: c.done ? "#fff" : AMBER_BG }}
    >
      <span
        className="mt-[1px] grid h-[17px] w-[17px] flex-none place-items-center rounded-[5px] border-[1.7px]"
        style={{ borderColor: c.done ? GREEN : "#DCD8D0", background: c.done ? GREEN : "transparent", color: "#fff" }}
      >
        {c.done && <Check className="h-[9px] w-[9px]" />}
      </span>
      <span className="min-w-0">
        <span
          className="block text-[12px] leading-snug"
          style={{ color: c.done ? "#9B958C" : "#1B1A17", textDecoration: c.done ? "line-through" : "none" }}
        >
          {c.t}
        </span>
        {/* the chip sat beside the topic and pushed it to two lines at 360px */}
        {showCarry && (
          <span className="mt-1 inline-block rounded-md px-1.5 py-0.5 text-[9px] font-bold" style={{ background: "#F7E7C8", color: AMBER }}>
            ran out of clock
          </span>
        )}
      </span>
    </div>
  );

  const history = (
    <div className="flex flex-none items-center gap-2 border-t border-[#EAE7E1] px-3.5 py-2.5 text-[11px]">
      <HistoryIcon className="h-[12px] w-[12px] flex-none" style={{ color: TEAL_L }} />
      <span className="font-semibold text-brand-ink">14 past 1on1s</span>
      <span className="hidden text-brand-gray sm:inline">· every topic, decision, and commitment still there</span>
      <span className="text-brand-gray sm:hidden">, all searchable</span>
    </div>
  );

  return (
    <div className={`flex flex-col ${CARD_CLS}`}>
      {/* ---------------------------------------------------------------
          MOBILE: one card with a labelled divider. Option C from
          design/team-meetings-remaining-mobile-options.html.
          Two cards, an arrow and a third card is three headers for one idea.
          Merging them removes a header, a gap and a border, and makes the
          carry read as one continuous thing rather than a hop between two
          objects, which is closer to what actually happens.
          --------------------------------------------------------------- */}
      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden sm:hidden">
        <div className="flex flex-none items-center gap-2 border-b border-[#F0EDE8] px-3.5 py-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.09em] text-brand-gray">This 1on1</span>
          <span className="ml-auto font-mono text-[10.5px] text-brand-gray">28:40 of 30:00</span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden px-3 py-2.5">
          {CARRY_TOPICS.map((c) => topic(c, !c.done))}

          <div className="flex flex-none items-center gap-2 py-0.5">
            <span className="h-px flex-1" style={{ background: "#F0DFC0" }} />
            <span className="text-[9.5px] font-bold uppercase tracking-[0.06em]" style={{ color: AMBER }}>
              carries over
            </span>
            <span className="h-px flex-1" style={{ background: "#F0DFC0" }} />
          </div>

          <div className="flex flex-none items-center text-[10px] font-bold uppercase tracking-[0.09em] text-brand-gray">
            Next 1on1
            <span className="ml-auto font-normal normal-case tracking-normal">in two weeks</span>
          </div>
          {topic(CARRY_TOPICS[2], false)}
        </div>

        {history}
      </Card>

      {/* ---------------------------------------------------------------
          DESKTOP: three bands with the arrow between them
          --------------------------------------------------------------- */}
      <div className="hidden min-h-0 flex-1 flex-col justify-between gap-2 sm:flex">
        <Card className="flex-none">
          <Head right={<span className="font-mono text-[10.5px] text-brand-gray">28:40 of 30:00</span>}>This 1on1</Head>
          <div className="flex flex-col gap-1.5 p-3">{CARRY_TOPICS.map((c) => topic(c, !c.done))}</div>
        </Card>

        <div className="flex flex-none items-center gap-2 pl-4">
          <span className="grid h-[26px] w-[26px] place-items-center rounded-full" style={{ background: AMBER_BG, color: AMBER }}>
            <svg viewBox="0 0 24 24" className="h-[14px] w-[14px]" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M6 13l6 6 6-6" />
            </svg>
          </span>
          <span className="text-[11.5px] font-semibold" style={{ color: AMBER }}>
            Unchecked topics are carried over to the next meeting.
          </span>
        </div>

        <Card className="flex-none">
          <Head right={<span className="text-[10px] font-semibold text-brand-gray">in two weeks</span>}>Next 1on1</Head>
          <div className="flex flex-col gap-1.5 p-3">
            {topic(CARRY_TOPICS[2], false)}
            <div className="flex items-center gap-2.5 rounded-[9px] border border-[#EFECE6] px-3 py-2">
              <span className="grid h-[17px] w-[17px] flex-none place-items-center rounded-[5px] border-[1.7px] border-[#DCD8D0]" />
              <span className="text-[12px] text-brand-ink">Draft the support role scorecard</span>
              <span className="ml-auto flex-none rounded-md bg-[#EFEBFB] px-1.5 py-0.5 text-[9.5px] font-bold text-[#5B47A8]">open task</span>
            </div>
          </div>
        </Card>

        <Card className="flex-none">
          <div className="flex items-center gap-2 px-3.5 py-2.5">
            <SearchIcon className="h-[13px] w-[13px] text-brand-gray" />
            <span className="text-[11.5px] text-brand-gray">Search notes, agendas, commitments, action items...</span>
          </div>
          {history}
        </Card>
      </div>
    </div>
  );
}

// ================================================================ 6. ad hoc
// The full-height dialog, chosen from
// design/team-meetings-adhoc-card-options.html (option A).
//
// Centring a short modal in the shared height left dead tint above and below
// it, so the dialog grows to the panel using only content the live one really
// has: a people search, an email under every name, a Clear action beside
// Select all, and a directory long enough to overflow its box.
//
// The list is the flexible band, so it takes whatever height is left, and the
// fade at its foot is what says the directory keeps going. On desktop six rows
// is one more than fits; on mobile the card is 100px shorter, so it shows about
// three. The fade does the same job at either size, which is why the row count
// never has to be exact.
const ADHOC_PICKED: PersonKey[] = ["JR", "MH", "PN"];
const ADHOC_LIST: PersonKey[] = ["AD", "DW", "JR", "MH", "PN", "TB"];

function AdHocDemo() {
  return (
    <Card className={`flex flex-col overflow-hidden ${CARD_CLS}`}>
      <div className="flex-none border-b border-[#F0EDE8] px-4 pb-3 pt-3.5">
        <div className="text-[14px] font-extrabold tracking-tight text-brand-ink">New Ad Hoc Meeting</div>
        <p className="mt-0.5 text-[11px] text-brand-gray">
          Name the meeting and pick who is in it<span className="hidden sm:inline">, then take notes in the editor</span>.
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-4 py-3">
        <div className="mb-1 flex-none text-[10px] font-bold uppercase tracking-[0.08em] text-brand-gray">Meeting name</div>
        <div className="mb-2.5 flex-none rounded-lg border border-[#E7E4DE] bg-[#FBFAF8] px-3 py-2 text-[12.5px] text-brand-ink">
          Vendor follow-up
        </div>

        <div className="mb-1.5 flex flex-none items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-brand-gray">Attendees</span>
          <span className="text-[10.5px] text-brand-gray">{ADHOC_PICKED.length} selected</span>
          <span className="ml-auto flex items-center gap-2.5 text-[10.5px] font-semibold">
            <span style={{ color: BLUE }}>Select all</span>
            <span className="text-brand-gray">Clear</span>
          </span>
        </div>

        <div className="mb-1.5 flex flex-none items-center gap-2 rounded-lg border border-[#E7E4DE] bg-[#FBFAF8] px-3 py-2 text-[11.5px] text-brand-gray">
          <SearchIcon className="h-[12px] w-[12px]" />
          Search people
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg border border-[#E7E4DE]">
          {ADHOC_LIST.map((k, i) => {
            const on = ADHOC_PICKED.includes(k);
            return (
              <div
                key={k}
                className={`flex items-center gap-2.5 px-3 py-[7px] ${i < ADHOC_LIST.length - 1 ? "border-b border-[#F0EDE8]" : ""}`}
              >
                <span
                  className="grid h-[15px] w-[15px] flex-none place-items-center rounded-[4px] border-[1.6px]"
                  style={{ background: on ? BLUE : "transparent", borderColor: on ? BLUE : "#DCD8D0", color: "#fff" }}
                >
                  {on && <Check className="h-[9px] w-[9px]" />}
                </span>
                <Who k={k} size={20} />
                <span className="leading-tight">
                  <span className="block text-[12px] font-semibold text-brand-ink">{PEOPLE[k].name}</span>
                  <span className="block text-[10px] text-brand-gray">{mailFor(k)}</span>
                </span>
              </div>
            );
          })}
          <span className="pointer-events-none absolute inset-x-px bottom-px h-[26px] rounded-b-lg bg-gradient-to-t from-white via-white/85 to-transparent" />
        </div>

        <p className="mt-2 flex-none text-[10.5px] text-brand-gray">You will be included automatically.</p>
      </div>

      {/* three things on one line runs off the edge at 360px */}
      <div className="flex flex-none items-center gap-2 border-t border-[#F0EDE8] px-4 py-3">
        <span className="rounded-lg border border-[#E7E4DE] px-3.5 py-2 text-[12px] font-semibold text-brand-charcoal">
          Cancel
        </span>
        <span className="inline-flex items-center gap-2 rounded-lg bg-brand-ink px-3.5 py-2 text-[12px] font-semibold text-white">
          <PlayIcon className="h-[11px] w-[11px]" />
          Start new meeting
        </span>
        <span className="ml-auto hidden text-[11px] text-brand-gray sm:inline">Straight into the notes.</span>
      </div>
    </Card>
  );
}


// ---------------------------------------------------------------- Multi AI
const AI_ROWS: Row[] = [
  { name: "Leadership Team", value: "12 weeks run", hit: true },
  { name: "Open issues", value: "6 carried", hit: false },
  { name: "1on1s this month", value: "9 of 14", hit: false, tone: "amber" },
];

const AI_INSIGHTS: Insight[] = [
  {
    tag: "Pattern",
    color: "#4B3CC4",
    source: "Leadership Team",
    text: "The Leadership Team meeting has run 12 weeks straight and finishes inside its 45 minutes, but Scoreboard Review is the step that gets cut when you run long. It has been skipped 4 of the last 6 weeks.",
  },
  {
    tag: "Risk",
    color: "#C0402B",
    source: "Open issues",
    text: "Six issues have been carried for three meetings or more. Carried issues are the ones that never get an owner, and two of them touch onboarding.",
  },
  {
    tag: "Next step",
    color: "#1F7F4C",
    source: "1on1s this month",
    text: "Five people have not had a 1on1 this month, and three of them own carried issues. Book those five first.",
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
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-brand-charcoal sm:mt-6 sm:text-lg lg:mx-0">{body}</p>
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
export default function TeamMeetingsPage() {
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
              <span className="grid h-[21px] w-[21px] flex-none place-items-center rounded-lg bg-gradient-to-br from-[#4A9FE0] to-[#2C6BA6] text-white shadow-[0_2px_6px_rgba(44,107,166,0.34),inset_0_1px_0_rgba(255,255,255,0.34)] sm:h-[34px] sm:w-[34px] sm:rounded-[11px]">
                <CalIcon className="h-[14px] w-[14px] sm:h-[19px] sm:w-[19px]" />
              </span>
              <span className="text-[11.5px] font-[650] tracking-[0.02em] text-[#33302C] sm:text-[16.5px]">
                Team Meetings &amp; 1on1s
              </span>
            </span>
            <h1 className="text-[24px] font-extrabold leading-[1.1] tracking-tight text-brand-ink sm:text-[66px] sm:leading-[1.04]">
              Start loving
              <br />
              <span className="text-brand-orange">meetings.</span>
            </h1>
            <p className="mx-auto mt-3.5 max-w-2xl text-[14.5px] leading-relaxed text-brand-charcoal sm:mt-7 sm:text-xl">
              <span className="sm:hidden">Finally a strategic agenda that guides itself. Nothing gets dropped, nothing starts from zero.</span>
              <span className="hidden sm:inline">Finally a strategic agenda that guides itself, for the whole team and for one person at a time.
              Nothing gets dropped, and nothing starts from zero.</span>
            </p>
          </Reveal>

          <Reveal delay={0.12} className="mt-6 sm:mt-12">
            <div
              className="overflow-hidden rounded-2xl p-2 sm:rounded-[30px] sm:p-8"
              style={{ background: "linear-gradient(160deg, #EDF4FC, #D6E8F8)" }}
            >
              <TeamMeetingsHeroTour />
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

      {/* ------------------------------------------------ 2. the agenda */}
      <Section
        id="agenda"
        eyebrow="Recurring team meetings"
        title="An agenda"
        swash="that adds up."
        body="Every item gets a timebox, and the timeboxes total the length you booked. Tasks Review reads the open work straight off your projects. Scoreboard Review pulls this week's numbers. Nobody prepares a status report that the system already has."
        points={[
          "Set the agenda once and it repeats every week",
          "Steps read from your live projects and scoreboards",
          "Issues are a standing step, not an inbox nobody opens",
        ]}
        visual={<AgendaDemo />}
        panel="linear-gradient(160deg, #EDF4FC, #D6E8F8)"
        accent={BLUE}
      />

      {/* ------------------------------------------------ 3. the live session */}
      <Section
        id="live"
        eyebrow="The live session"
        title="Press start,"
        swash="and it keeps time."
        body="A meeting in Multiply OS is a session, not a page you happen to type on. The clock pins to the top and runs against the length you set, the agenda checks itself off as you go, and everything raised gets captured where it belongs before you leave."
        points={[
          "Pause, resume, or complete, and the record closes itself",
          "Tasks captured in the meeting land in Projects with an owner",
          "Issues stay attached to the meeting until they are closed",
        ]}
        visual={<LiveDemo />}
        flip
        panel="linear-gradient(160deg, #FFF6EC, #FFEBD8)"
        accent={BLUE}
      />

      {/* ------------------------------------------------ 4. the 1on1 studio */}
      <Section
        id="studio"
        eyebrow="1on1s"
        title="The same rhythm,"
        swash="one person at a time."
        body="Pick a teammate, set the length, and choose the shape of the conversation. The topic list is shared, so both of you write it before anyone sits down. Their org chart and their scorecard are one click away, so it is a real conversation rather than a verbal status report."
        points={[
          "Shared topics, written by both people ahead of time",
          "Fifteen minutes to ninety, with an org-wide default",
          "Regular, monthly, quarterly, or an annual review",
        ]}
        visual={<StudioDemo />}
        panel="linear-gradient(160deg, #E8F5F2, #D3EBE5)"
        accent={TEAL}
      />

      {/* ------------------------------------------------ 5. continuity, the thesis */}
      <Section
        id="continuity"
        eyebrow="Continuity"
        title="The conversation never"
        swash="restarts from zero."
        body="You ran out of clock on the last topic. It is already sitting at the top of the next meeting. Tasks carry forward with it, and every topic, decision, and commitment you have ever recorded with that person stays searchable."
        points={[
          "Unchecked topics carry to the next meeting automatically",
          "Tasks carry forward, or get pulled from your last session",
          "Search notes, agendas, commitments, and action items across every meeting",
        ]}
        visual={<ContinuityDemo />}
        flip
        panel="linear-gradient(160deg, #FDF3E0, #F7E7C8)"
        accent={AMBER}
      />

      {/* ------------------------------------------------ 6. ad hoc */}
      <Section
        id="ad-hoc"
        eyebrow="Ad hoc meetings"
        title="The conversation you"
        swash="did not plan."
        body="Not every meeting is on the calendar. Name it, tick who is in the room, and you are in the notes. The unplanned conversation that usually evaporates gets the same record, the same action items, and the same search as everything else."
        points={[
          "Your whole directory is already there, so nobody gets typed in",
          "Notes, decisions, and action items, captured as you talk",
          "Kept and searchable alongside every recurring meeting",
        ]}
        visual={<AdHocDemo />}
        panel="linear-gradient(160deg, #EEF6F2, #E1EFE8)"
        accent={GREEN}
      />

      {/* ------------------------------------------------ 7. Multi AI (always last) */}
      <MultiAiWired
        heading="Every meeting, read by"
        swash="a chief of staff."
        intro="Multi AI already has every agenda you ran, every issue you carried, and every commitment made in a 1on1. Ask what your rhythm is actually doing, and it answers out of the meetings themselves."
        leftLabel="The rhythm your team runs"
        leftColor={BLUE}
        leftIcon={CalIcon}
        rightLabel="What Multi AI finds in it"
        panelTitle="Meetings · Last 90 days"
        panelMeta="38 sessions"
        panelDot={BLUE}
        rows={AI_ROWS}
        insights={AI_INSIGHTS}
        aiMeta="reading 38 sessions"
        footer="Multi AI reads the meetings your team already runs. No exports, no prompt engineering, no separate AI subscription."
      />

      <CTA />
      <Footer />
    </main>
  );
}
