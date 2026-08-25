"use client";

// Feature page: Checklists.
//
// The client's brief, in their order: automating and overseeing processes,
// creating consistent quality, then the features. So the sections run:
//
//   2. automate    a cadence, a reminder at 9am, a Run button on the row
//   3. oversee     the library as a worklist: due, overdue, never run
//   4. quality     required items, pass/fail/NA, a photo, and a signed record
//   5. features    the five item types, sub-items, sections as pause points
//
// The page has one argument, and it is not "collect answers". Forms does that.
// This is "prove the work happened, again, to a standard". See
// docs/checklists-feature-notes.md section 1 for why the two pages must not
// argue the same thing.
//
// Mockups are hand-built in markup rather than screenshots so they stay crisp and
// themeable, with the generalising pass from the notes applied: the live library
// is one ministry's van fleet, which reads as a niche rather than as any business.
import { motion } from "framer-motion";
import { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CTA from "./CTA";
import Reveal from "./Reveal";
import ChecklistsHeroTour from "./ChecklistsHeroTour";
import MultiAiWired from "./MultiAiWired";
import type { Row, Insight } from "./MultiAiWired";
import { useDemo } from "./DemoModal";

// ---------------------------------------------------------------- tokens
const GREEN = "#2BA463";
const AMBER = "#C9832B";
const RED = "#D8563F";
const BLUE = "#2E9BD6";
const AI = "#4B3CC4";
const colTransition = { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const };

// Shared card height, so the four mockups do not run ragged against each other.
// Written out in full because Tailwind scans source for literal class names.
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

const ClipIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.7}>
    <rect x="5" y="4.2" width="14" height="16.4" rx="2.2" />
    <path d="M9 4.2V3h6v1.2" />
    <path d="M9 12.2l2 2 4-4.2" />
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
const Plus = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2.4}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const Repeat = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M4 8.4h11.6a3.4 3.4 0 0 1 3.4 3.4" />
    <path d="M6.6 5.8L4 8.4l2.6 2.6" />
    <path d="M20 15.6H8.4A3.4 3.4 0 0 1 5 12.2" />
    <path d="M17.4 18.2l2.6-2.6-2.6-2.6" />
  </svg>
);
const Bell = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M17.6 11.6a5.6 5.6 0 1 0-11.2 0c0 4.2-1.8 5.4-1.8 5.4h14.8s-1.8-1.2-1.8-5.4z" />
    <path d="M10.4 20a1.9 1.9 0 0 0 3.2 0" />
  </svg>
);
const Shield = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 3.4l7.4 2.6v5.6c0 4.2-3 7.6-7.4 9-4.4-1.4-7.4-4.8-7.4-9V6z" />
    <path d="M8.8 12l2.2 2.2 4.2-4.4" />
  </svg>
);
const Camera = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M3.4 8.4h3.2l1.4-2.2h7.9l1.4 2.2h3.3v10.2H3.4z" />
    <circle cx="12" cy="13.2" r="3.2" />
  </svg>
);
const HistoryIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M3.6 12a8.4 8.4 0 1 0 2.6-6.1" />
    <path d="M3.4 4.6v4h4" />
    <path d="M12 7.8V12l3 1.6" />
  </svg>
);
const Play = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5.4v13.2l11-6.6z" />
  </svg>
);
const CheckSq = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <rect x="4.2" y="4.2" width="15.6" height="15.6" rx="2.4" />
    <path d="M8.2 12.2l2.6 2.6 5-5.4" />
  </svg>
);
const Thumb = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M7 10.6h2.4l2.8-6a2 2 0 0 1 2.6 1.9v3.2h3.4a1.8 1.8 0 0 1 1.7 2.3l-1.6 5.6a2 2 0 0 1-1.9 1.4H7z" />
    <rect x="3.4" y="10.6" width="3.6" height="8.4" rx="1" />
  </svg>
);
const TextT = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2}>
    <path d="M5.4 6.2h13.2M12 6.2v11.6" />
  </svg>
);
const Hash = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2}>
    <path d="M9 4.4L7.4 19.6M16.6 4.4L15 19.6M4.4 9h15.2M3.8 15h15.2" />
  </svg>
);
const Heading = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2}>
    <path d="M5.4 5v14M13 5v14M5.4 12H13M16.6 19v-6.4l2.6 1.6" />
  </svg>
);
const RowsIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.2" />
    <path d="M3.5 9.5h17M3.5 14.5h17" />
  </svg>
);
const People = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="9.2" cy="8.4" r="3" />
    <path d="M3.6 18.6c0-2.8 2.5-4.6 5.6-4.6s5.6 1.8 5.6 4.6" />
    <path d="M16.2 6.2a3 3 0 0 1 0 5.6M17.4 14.6c1.9.6 3.2 1.9 3.2 4" />
  </svg>
);
const MailIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="3.4" y="5.6" width="17.2" height="12.8" rx="2" />
    <path d="M3.8 7l8.2 5.6L20.2 7" />
  </svg>
);
const AlertIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2}>
    <path d="M12 4.2l8.4 15.2H3.6z" />
    <path d="M12 10v3.6M12 16.6v.1" />
  </svg>
);

// ---------------------------------------------------------------- 2. automate
// The cadence is the whole "automating" ask. Switching it changes the schedule,
// the reminder, and what the row says, so the reader sees the routine start
// running itself.
type Cad = "daily" | "weekly" | "monthly" | "off";

const CADENCES: { key: Cad; label: string; every: string; due: string; runs: string }[] = [
  { key: "daily", label: "Daily", every: "Every day at 9:00 AM", due: "Due today", runs: "248 runs kept" },
  { key: "weekly", label: "Weekly", every: "Every Friday at 9:00 AM", due: "Due in 3d", runs: "52 runs kept" },
  { key: "monthly", label: "Monthly", every: "1st of the month at 9:00 AM", due: "Due in 20d", runs: "14 runs kept" },
  { key: "off", label: "One-off", every: "No reminder", due: "Never run", runs: "no runs yet" },
];

function AutomateDemo() {
  const [cad, setCad] = useState<Cad>("weekly");
  const c = CADENCES.find((x) => x.key === cad)!;
  const off = cad === "off";

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${CARD_CLS}`}>
      <div className="flex flex-none items-center gap-2.5 border-b border-[#F1EEE9] px-3.5 py-2.5">
        <span className="min-w-0 flex-1">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-brand-gray">Checklist</p>
          <h4 className="truncate text-[13.5px] font-extrabold tracking-tight">Site Safety Walk</h4>
        </span>
        <span
          className="flex flex-none items-center gap-1 whitespace-nowrap rounded-full px-2 py-[3px] text-[9px] font-semibold"
          style={off ? { background: "#F1EEE9", color: "#6B665F" } : { background: "#E4F2FB", color: "#1F6E9C" }}
        >
          {!off && <Repeat className="h-2.5 w-2.5" />}
          {off ? "One-Off" : `Repeats ${c.label}`}
        </span>
      </div>

      <div className="flex-none border-b border-[#F1EEE9] px-3.5 py-2.5">
        <p className="mb-1.5 text-[9.5px] text-brand-gray">Cadence</p>
        <div className="flex gap-1">
          {CADENCES.map((x) => (
            <button
              key={x.key}
              type="button"
              aria-pressed={cad === x.key}
              onClick={() => setCad(x.key)}
              className={`flex-1 rounded-lg border px-2 py-1.5 text-[10px] transition-colors ${
                cad === x.key
                  ? "border-brand-orange/55 bg-[#FFF6EC] font-semibold text-brand-orange-dark"
                  : "border-[#E6E2DB] font-medium text-brand-charcoal hover:bg-[#FAF9F7]"
              }`}
            >
              {x.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto bg-[#FAF9F7] px-3.5 py-3">
        {/* the reminder */}
        <div className="rounded-lg border border-[#EBE7E0] bg-white p-2.5">
          <p className="mb-1.5 flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.12em]" style={{ color: off ? "#8A857D" : AMBER }}>
            <Bell className="h-2.5 w-2.5" />
            Reminder
          </p>
          {off ? (
            <p className="text-[10.5px] leading-snug text-brand-gray">
              No reminder. A one-off runs when somebody starts it, and it still keeps its record.
            </p>
          ) : (
            <>
              <p className="text-[11.5px] font-semibold">{c.every}</p>
              <p className="mt-1 text-[9.5px] leading-snug text-brand-gray">
                Sent in your company&rsquo;s timezone, to whoever is responsible. Pick a custom time
                and it goes at exactly that time instead.
              </p>
            </>
          )}
        </div>

        {/* the row, as the library shows it */}
        <div className="rounded-lg border border-[#EBE7E0] bg-white p-2.5">
          <p className="mb-1.5 text-[8px] font-bold uppercase tracking-[0.12em] text-brand-gray">
            In the library
          </p>
          <div className="flex items-center gap-2">
            <span className="grid h-[22px] w-[22px] flex-none place-items-center rounded-md" style={{ background: "#E4F2FB", color: BLUE }}>
              <ClipIcon className="h-3 w-3" />
            </span>
            <span className="min-w-0 flex-1 truncate text-[11px] font-semibold">Site Safety Walk</span>
            <span
              className="flex-none whitespace-nowrap text-[9.5px] font-semibold"
              style={{ color: off ? "#C4BFB6" : cad === "daily" ? AMBER : "#8A857D" }}
            >
              {c.due}
            </span>
            <span
              className="flex flex-none items-center gap-1 rounded-md border border-[#E6E2DB] px-1.5 py-1 text-[9px] font-bold"
              style={{ color: off ? "#C4BFB6" : "#1F6E9C" }}
            >
              <Play className="h-2 w-2" />
              Run
            </span>
          </div>
          <p className="mt-1.5 text-[9.5px] leading-snug text-brand-gray">
            A due-in counter and a Run button on the row, so starting the routine is one click from
            the list rather than a hunt.
          </p>
        </div>

        {/* what accumulates */}
        <div className="rounded-lg border border-[#EBE7E0] bg-white p-2.5">
          <p className="mb-1 flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.12em]" style={{ color: AI }}>
            <HistoryIcon className="h-2.5 w-2.5" />
            History
          </p>
          <p className="text-[11.5px] font-semibold">{c.runs}</p>
          <p className="mt-1 text-[9.5px] leading-snug text-brand-gray">
            Every run is kept, so a year later you can still show what was checked and by whom.
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 3. oversee
type Watch = { title: string; who: string; cadence: string; state: "done" | "due" | "late" | "never"; when: string };

const WATCH: Watch[] = [
  { title: "Closing Checklist", who: "Marcus Hale", cadence: "Daily", state: "done", when: "signed 9:41 PM" },
  { title: "Weekly Leadership Prep", who: "Jordan Rivera", cadence: "Weekly", state: "due", when: "due in 3d" },
  { title: "Van 3 Safety Inspection", who: "Marcus Hale", cadence: "Monthly", state: "late", when: "4 days late" },
  { title: "Monthly Payout Review", who: "Kath Nakamura", cadence: "Monthly", state: "due", when: "due in 12d" },
  { title: "Offsite Trip Prep", who: "Priya Nair", cadence: "One-off", state: "never", when: "never run" },
];

const WATCH_META = {
  done: { label: "Signed", color: GREEN, bg: "#EAF7F0" },
  due: { label: "Scheduled", color: "#1F6E9C", bg: "#E4F2FB" },
  late: { label: "Late", color: RED, bg: "#FBEEEB" },
  never: { label: "Never run", color: "#8A857D", bg: "#F1EEE9" },
} as const;

function OverseeDemo() {
  const late = WATCH.filter((w) => w.state === "late").length;
  const never = WATCH.filter((w) => w.state === "never").length;

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${CARD_CLS}`}>
      <div className="flex flex-none items-center gap-2 border-b border-[#F1EEE9] px-3.5 py-3">
        <b className="flex-none text-[12.5px]">This week</b>
        <span className="ml-auto flex flex-none items-center gap-1.5">
          <span className="rounded-full px-2 py-[3px] text-[9px] font-bold" style={{ background: "#FBEEEB", color: RED }}>
            {late} late
          </span>
          <span className="rounded-full px-2 py-[3px] text-[9px] font-bold" style={{ background: "#F1EEE9", color: "#6B665F" }}>
            {never} never run
          </span>
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {WATCH.map((w) => {
          const m = WATCH_META[w.state];
          return (
            <div key={w.title} className="flex items-center gap-2.5 border-b border-[#F5F2ED] px-3.5 py-[9px]">
              <span
                className="grid h-[24px] w-[24px] flex-none place-items-center rounded-lg"
                style={{ background: m.bg, color: m.color }}
              >
                {w.state === "done" ? (
                  <Tick className="h-3 w-3" />
                ) : w.state === "late" ? (
                  <AlertIcon className="h-3 w-3" />
                ) : (
                  <ClipIcon className="h-3 w-3" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[11.5px] font-semibold leading-tight">{w.title}</span>
                <span className="text-[9.5px] text-brand-gray">
                  {w.who} <span className="text-[#C4BFB6]">·</span> {w.cadence}
                </span>
              </span>
              <span className="flex-none whitespace-nowrap text-[9.5px]" style={{ color: m.color }}>
                {w.when}
              </span>
              <span
                className="hidden w-[74px] flex-none whitespace-nowrap rounded-full px-1.5 py-[3px] text-center text-[8.5px] font-bold uppercase tracking-wide min-[420px]:block"
                style={{ background: m.bg, color: m.color }}
              >
                {m.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex-none space-y-1.5 bg-[#FAF9F7] px-3.5 py-2.5">
        <p className="flex items-start gap-2 text-[10.5px] leading-snug text-brand-gray">
          <AlertIcon className="mt-px h-[12px] w-[12px] flex-none" style={{ color: RED }} />
          <span>
            <b className="font-semibold text-brand-charcoal">Van 3 is four days late.</b> Not
            somebody&rsquo;s hunch. The schedule said Monday and no signed run exists.
          </span>
        </p>
        <p className="flex items-start gap-2 text-[10.5px] leading-snug text-brand-gray">
          <MailIcon className="mt-px h-[12px] w-[12px] flex-none" style={{ color: AI }} />
          Each finished run can email its results to a manager, or to somebody outside the company.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 4. quality
// The consistent-quality ask. A tick alone proves nothing, so this shows the four
// things that make a run mean something: required, a verdict, a photo, a name.
type Guard = "required" | "verdict" | "photo" | "signoff";

const GUARDS: { key: Guard; label: string; sub: string; color: string; icon: (p: IconProps) => React.JSX.Element }[] = [
  { key: "required", label: "Required items", sub: "Cannot be skipped", color: GREEN, icon: Tick },
  { key: "verdict", label: "Pass / Fail / N/A", sub: "A verdict, not a tick", color: AMBER, icon: Thumb },
  { key: "photo", label: "Photo evidence", sub: "Show, do not assert", color: BLUE, icon: Camera },
  { key: "signoff", label: "Signed off", sub: "Name, time, device", color: AI, icon: Shield },
];

function QualityDemo() {
  const [on, setOn] = useState<Guard[]>(["required", "verdict", "photo", "signoff"]);
  const toggle = (k: Guard) =>
    setOn((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));
  const has = (k: Guard) => on.includes(k);

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${CARD_CLS}`}>
      <div className="flex-none border-b border-[#F1EEE9] px-3.5 py-2.5">
        <p className="mb-1.5 text-[9.5px] text-brand-gray">
          What makes a run mean something <span className="text-[#C4BFB6]">·</span> {on.length} of 4 on
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {GUARDS.map((g) => {
            const Icon = g.icon;
            const active = has(g.key);
            return (
              <button
                key={g.key}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(g.key)}
                className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 text-left transition-colors ${
                  active ? "border-transparent bg-[#F7F5F1]" : "border-[#E6E2DB] hover:bg-[#FAF9F7]"
                }`}
                style={active ? { boxShadow: `inset 0 0 0 1.5px ${g.color}44` } : undefined}
              >
                <span
                  className="grid h-[20px] w-[20px] flex-none place-items-center rounded-md"
                  style={active ? { background: g.color, color: "#fff" } : { background: "#F1EEE9", color: "#8A857D" }}
                >
                  <Icon className="h-2.5 w-2.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[9.5px] font-semibold leading-tight">{g.label}</span>
                  <span className="block truncate text-[8px] text-brand-gray">{g.sub}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* the run, as it reads with those guards on or off */}
      <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto bg-[#FAF9F7] px-3.5 py-3">
        <div className="rounded-lg border border-[#EBE7E0] bg-white px-2.5 py-2">
          <p className="text-[10.5px] font-medium">
            Fire exits clear and unlocked
            {has("required") && <span style={{ color: RED }}> *</span>}
          </p>
          <div className="mt-1.5 flex items-center gap-1.5">
            {has("verdict") ? (
              (["Pass", "Fail", "N/A"] as const).map((l) => (
                <span
                  key={l}
                  className="rounded-full border px-2 py-[2px] text-[9px] font-semibold"
                  style={
                    l === "Pass"
                      ? { background: "#EAF7F0", borderColor: "#BFE5CD", color: GREEN }
                      : { background: "#fff", borderColor: "#E6E2DB", color: "#6B665F" }
                  }
                >
                  {l}
                </span>
              ))
            ) : (
              <span className="flex items-center gap-1.5 text-[9.5px] text-brand-gray">
                <span className="grid h-[15px] w-[15px] place-items-center rounded-[4px] text-white" style={{ background: GREEN }}>
                  <Tick className="h-2 w-2" />
                </span>
                Ticked, and that is all you know
              </span>
            )}
          </div>
          {has("photo") && (
            <div className="mt-1.5 flex items-center gap-2 rounded-md border border-[#EBE7E0] bg-[#FBFAF8] px-2 py-1.5">
              <span className="grid h-[26px] w-[36px] flex-none place-items-center rounded border border-[#E6E2DB] bg-[#EFEAE1]" style={{ color: "#A9A49B" }}>
                <Camera className="h-3 w-3" />
              </span>
              <span className="text-[9px] leading-snug text-brand-gray">
                exit-b-2141.jpg <span className="text-[#C4BFB6]">·</span> attached by Marcus
              </span>
            </div>
          )}
        </div>

        {has("required") && (
          <p className="flex items-start gap-1.5 rounded-lg border px-2 py-1.5 text-[9.5px] leading-snug"
            style={{ background: "#FDF1DF", borderColor: "#F0DCB4", color: "#8A6320" }}>
            <AlertIcon className="mt-px h-2.5 w-2.5 flex-none" />
            A required item blocks Complete. Nobody signs a run with this one left blank.
          </p>
        )}

        <div
          className="rounded-lg border px-2.5 py-2"
          style={has("signoff") ? { background: "#F2FBF6", borderColor: "#BFE5CD" } : { background: "#fff", borderColor: "#EBE7E0" }}
        >
          {has("signoff") ? (
            <>
              <p className="flex items-center gap-1.5 text-[10.5px] font-bold">
                <Shield className="h-3 w-3" style={{ color: GREEN }} />
                Signed by Marcus Hale
              </p>
              <p className="mt-1 text-[9.5px] leading-snug text-brand-gray">
                21 Aug 2026, 9:41 PM <span className="text-[#C4BFB6]">·</span> iPhone, on site
                <br />
                He typed his name to certify it. Not a tickbox, and not editable afterwards.
              </p>
            </>
          ) : (
            <p className="text-[9.5px] leading-snug text-brand-gray">
              No sign-off. You have a completed checklist and no idea who stands behind it, which is
              exactly the problem a paper checklist has.
            </p>
          )}
        </div>
      </div>

      <p className="flex-none border-t border-[#F1EEE9] px-3.5 py-2 text-[10px] leading-snug text-brand-gray">
        Turn all four off and you have a to-do list. Turn them on and you have a record.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- 5. the features
type ItemKey = "check" | "pass" | "text" | "number" | "section";

const ITEM_DEFS: { key: ItemKey; label: string; sub: string; icon: (p: IconProps) => React.JSX.Element }[] = [
  { key: "check", label: "Check item", sub: "Tick when done", icon: CheckSq },
  { key: "pass", label: "Pass / Fail", sub: "Pass, fail, or N/A", icon: Thumb },
  { key: "text", label: "Text answer", sub: "Short written answer", icon: TextT },
  { key: "number", label: "Number", sub: "A reading or count", icon: Hash },
  { key: "section", label: "Section header", sub: "Group items, a pause point", icon: Heading },
];

const ITEMS_OPEN: ItemKey[] = ["section", "check", "pass", "number"];

function ItemBody({ k }: { k: ItemKey }) {
  switch (k) {
    case "section":
      return (
        <div className="rounded-lg bg-[#F1EEE9] px-2.5 py-1.5">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-brand-gray">Section</p>
          <p className="text-[11px] font-bold">Before you lock up</p>
          <p className="mt-0.5 text-[9px] text-brand-gray">A pause point, not just a heading.</p>
        </div>
      );
    case "check":
      return (
        <div className="rounded-lg border border-[#EBE7E0] bg-white px-2.5 py-2">
          <p className="text-[10.5px] font-medium">Alarm armed</p>
          <p className="mt-1 flex items-center gap-2 text-[9px] text-brand-gray">
            <span className="grid h-[15px] w-[15px] place-items-center rounded-[4px] border-[1.5px] border-[#D5D0C7]" />
            Tick when done
          </p>
          <p className="mt-1.5 border-t border-[#F5F2ED] pt-1.5 text-[9px] text-brand-gray">
            <b className="font-semibold text-brand-charcoal">+ Sub-item</b> for the two doors that
            always get missed.
          </p>
        </div>
      );
    case "pass":
      return (
        <div className="rounded-lg border border-[#EBE7E0] bg-white px-2.5 py-2">
          <p className="text-[10.5px] font-medium">Walk-in temperature in range</p>
          <div className="mt-1.5 flex gap-1.5">
            {(["Pass", "Fail", "N/A"] as const).map((l) => (
              <span
                key={l}
                className="rounded-full border px-2 py-[2px] text-[9px] font-semibold"
                style={
                  l === "Fail"
                    ? { background: "#FBEEEB", borderColor: "#F0D2CC", color: RED }
                    : { background: "#fff", borderColor: "#E6E2DB", color: "#6B665F" }
                }
              >
                {l}
              </span>
            ))}
          </div>
          <p className="mt-1.5 text-[9px] text-brand-gray">
            A fail is a fact you can search for later. A blank tick is not.
          </p>
        </div>
      );
    case "text":
      return (
        <div className="rounded-lg border border-[#EBE7E0] bg-white px-2.5 py-2">
          <p className="text-[10.5px] font-medium">Anything the next shift should know?</p>
          <div className="mt-1.5 h-[22px] rounded-md border border-[#E6E2DB] bg-[#FBFAF8]" />
        </div>
      );
    case "number":
      return (
        <div className="rounded-lg border border-[#EBE7E0] bg-white px-2.5 py-2">
          <p className="text-[10.5px] font-medium">Till count at close</p>
          <div className="mt-1.5 w-[86px] rounded-md border border-[#E6E2DB] bg-[#FBFAF8] px-2 py-1 text-[10px] font-semibold tabular-nums">
            412.60
          </div>
          <p className="mt-1.5 text-[9px] text-brand-gray">A reading, kept run over run.</p>
        </div>
      );
  }
}

function ItemsDemo() {
  const [on, setOn] = useState<ItemKey[]>(ITEMS_OPEN);
  const toggle = (k: ItemKey) =>
    setOn((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));
  const shown = ITEM_DEFS.filter((d) => on.includes(d.key));

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${CARD_CLS}`}>
      <div className="flex flex-none items-center gap-2.5 border-b border-[#F1EEE9] px-3.5 py-2.5">
        <span className="min-w-0 flex-1">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-brand-gray">Checklist</p>
          <h4 className="truncate text-[13.5px] font-extrabold tracking-tight">Closing Checklist</h4>
        </span>
        <span className="flex-none whitespace-nowrap text-[9.5px] text-brand-gray">
          {shown.length} item{shown.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="flex-none border-b border-[#F1EEE9] px-3.5 py-2.5">
        <p className="mb-1.5 text-[9.5px] text-brand-gray">Add to checklist</p>
        <div className="scrollbar-none flex flex-nowrap gap-1 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-x-visible sm:pb-0">
          {ITEM_DEFS.map((d) => {
            const Icon = d.icon;
            const active = on.includes(d.key);
            return (
              <button
                key={d.key}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(d.key)}
                className={`flex flex-none items-center gap-1 whitespace-nowrap rounded-full border px-2 py-1 text-[9.5px] transition-colors ${
                  active
                    ? "border-brand-orange/55 bg-[#FFF6EC] font-semibold text-brand-orange-dark"
                    : "border-[#E6E2DB] font-medium text-brand-charcoal hover:bg-[#FAF9F7]"
                }`}
              >
                <Icon className="h-2.5 w-2.5" />
                {d.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative min-h-0 flex-1 bg-[#FAF9F7]">
        <div className="h-full space-y-2 overflow-y-auto px-3.5 py-3">
          {shown.length === 0 ? (
            // Quoted almost verbatim, because it is the best line in the product.
            <p className="px-3 pt-10 text-center text-[11px] leading-relaxed text-brand-gray">
              No items yet. Add the killer items, the steps that get skipped, not every step that
              exists. Aim for 5 to 9 per section.
            </p>
          ) : (
            shown.map((d) => <ItemBody key={d.key} k={d.key} />)
          )}
        </div>
        {shown.length > 3 && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-7 bg-gradient-to-t from-[#FAF9F7] to-transparent"
          />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 6. Multi AI
const AI_ROWS: Row[] = [
  { name: "Van 3 Safety Inspection", value: "4 days late", hit: false, tone: "red" },
  { name: "Closing Checklist", value: "248 runs", hit: true, tone: "green" },
  { name: "Site Safety Walk", value: "3 fails", hit: false, tone: "amber" },
];

const AI_INSIGHTS: Insight[] = [
  {
    tag: "Overdue",
    color: RED,
    source: "Van 3 Safety Inspection",
    text: "Four days past its monthly slot, and the two before it were both signed late as well. This is not a person forgetting, it is a cadence that does not match how often that van is actually out.",
  },
  {
    tag: "Pattern",
    color: AMBER,
    source: "Site Safety Walk",
    text: "Three fails in six weeks, all of them the same item, all of them on a Sunday close. Whoever runs Sundays has not been shown that step.",
  },
  {
    tag: "Solid",
    color: GREEN,
    source: "Closing Checklist",
    text: "248 signed runs and a 96% on-time rate. This one is working, which is worth knowing before somebody decides to change it.",
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
export default function ChecklistsPage() {
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
              <span className="grid h-[21px] w-[21px] flex-none place-items-center rounded-lg bg-gradient-to-br from-[#8B9C3C] to-[#5A6726] text-white shadow-[0_2px_6px_rgba(90,103,38,0.34),inset_0_1px_0_rgba(255,255,255,0.34)] sm:h-[34px] sm:w-[34px] sm:rounded-[11px]">
                <ClipIcon className="h-[14px] w-[14px] sm:h-[19px] sm:w-[19px]" />
              </span>
              <span className="text-[11.5px] font-[650] tracking-[0.02em] text-[#33302C] sm:text-[16.5px]">
                Checklists
              </span>
            </span>
            <h1 className="text-[24px] font-extrabold leading-[1.1] tracking-tight text-brand-ink sm:text-[66px] sm:leading-[1.04]">
              It got done. And you
              <br />
              <span className="text-brand-orange">can prove it.</span>
            </h1>
            <p className="mx-auto mt-3.5 max-w-2xl text-[14.5px] leading-relaxed text-brand-charcoal sm:mt-7 sm:text-xl">
              <span className="sm:hidden">
                The routines your team repeats, on a schedule, with a signed record of every run.
              </span>
              <span className="hidden sm:inline">
                Turn the routines your team repeats into checklists that run on a schedule, chase
                themselves, and end with somebody&rsquo;s name on the result. A year later you can
                still show exactly what was checked, and by whom.
              </span>
            </p>
          </Reveal>

          <Reveal delay={0.12} className="mt-6 sm:mt-12">
            <div
              className="overflow-hidden rounded-2xl p-2 sm:rounded-[30px] sm:p-8"
              style={{ background: "linear-gradient(160deg, #F2F4E6, #E6EBD4)" }}
            >
              <ChecklistsHeroTour />
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

      {/* ------------------------------------------------ 2. automate */}
      <Section
        id="automate"
        eyebrow="Automate the routine"
        title="Set the cadence once. It chases"
        swash="itself."
        body="Daily, weekly, monthly, or a one-off. The reminder goes out at nine in your own timezone, the row starts counting down, and a Run button sits right there in the list. Nobody has to remember that it is Friday."
        points={[
          "Daily, weekly, monthly, or a custom time you pick",
          "A due-in counter on the row, and Run without opening anything",
          "Every run kept, so a year of them builds up on its own",
        ]}
        visual={<AutomateDemo />}
        panel="linear-gradient(160deg, #F0F3E4, #E4EAD2)"
      />

      {/* ------------------------------------------------ 3. oversee */}
      <Section
        id="oversee"
        eyebrow="Oversee without asking"
        title="Four days late is a fact, not"
        swash="a feeling."
        body="One screen shows what is due, what is signed, and what nobody has touched. Late is measured against the schedule the checklist already carries, so you are reading a record rather than chasing people for status."
        points={[
          "Due, signed, late, and never run, all on one list",
          "Two due this week counted for you, not worked out by you",
          "Each finished run can email its results, even outside the company",
        ]}
        visual={<OverseeDemo />}
        flip
        panel="linear-gradient(160deg, #EEF4FB, #E2ECF8)"
      />

      {/* ------------------------------------------------ 4. consistent quality */}
      <Section
        id="quality"
        eyebrow="Consistent quality"
        title="A tick proves nothing. A signed run"
        swash="proves it."
        body="Required items that block completion, a verdict instead of a tick, a photo when a claim needs backing, and a name typed at the end. Turn those four off and you have a to-do list. Turn them on and a new hire runs it exactly the way your best person does."
        points={[
          "Required items, so the step that always gets skipped cannot be",
          "Pass, Fail, or N/A, so a problem is searchable later",
          "Name, time, and device stored with the run, and not editable after",
        ]}
        visual={<QualityDemo />}
        panel="linear-gradient(160deg, #F3F0FA, #E9E4F6)"
      />

      {/* ------------------------------------------------ 5. the features */}
      <Section
        id="items"
        eyebrow="The item types"
        title="Five kinds of item, and one strong"
        swash="opinion."
        body="A tick, a verdict, a written answer, a reading, and a section that acts as a pause point. Sub-items nest under any of them. The product's own advice, on the empty page: add the killer items, the steps that get skipped, not every step that exists."
        points={[
          "Check, Pass / Fail, Text, Number, and Section header",
          "Sub-items for the two details that always get missed",
          "Aim for five to nine per section, because a wall of ticks gets faked",
        ]}
        visual={<ItemsDemo />}
        flip
        panel="linear-gradient(160deg, #EEF6F2, #E1EFE8)"
      />

      {/* ------------------------------------------------ 6. Multi AI (always last) */}
      <MultiAiWired
        heading="Every run, read by"
        swash="a second pair of eyes."
        intro="Multi AI already has every signed run your team has completed. Ask what keeps failing, what is always late, and which checklist is quietly working, and it answers out of the history rather than from a survey."
        leftLabel="The runs your team signs"
        leftColor="#6B7A2E"
        leftIcon={RowsIcon}
        rightLabel="What Multi AI finds in them"
        panelTitle="Checklists · All runs"
        panelMeta="21 runs"
        panelDot="#6B7A2E"
        rows={AI_ROWS}
        insights={AI_INSIGHTS}
        aiMeta="reading 19 checklists"
        footer="Multi AI reads the runs your team already signed. No exports, no separate reporting tool, no chasing anybody for an update."
      />

      <CTA />
      <Footer />
    </main>
  );
}
