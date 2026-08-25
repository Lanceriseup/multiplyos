"use client";

// Feature page: DISC Assessments.
//
// The product's own subtitle names the three use cases, so the page does not
// have to invent them:
//
//     "See who has taken DISC, send assessments, and put behavioral insights to
//      work in hiring, 1-on-1s, and team communication."
//
// Which means the argument is not "we have a personality test". Everybody has
// one of those, and it usually lives in a PDF somebody emailed round in 2023.
// The argument is that the result is sitting in the record of the person you are
// about to interview, coach, or delegate to.
//
//   2. the board      who has taken it, who has not, sent from here
//   3. the profile    four dimensions, scored, inside their own record
//   4. built in       it turns up on the chart, the team list, and in Multi AI
//   5. credits        held on send, returned if they never finish
//   6. what it is for hiring, 1-on-1s, communication, and a human coach
//
// Replaces nothing, per the client, so there is no ReplacesStrip and no
// crossed-out opening beat. Second page on the site with neither, after CFO
// Analytics.
//
// See docs/disc-feature-notes.md. Three rules from it are load-bearing: the page
// never describes what taking the assessment is like, because nobody has
// screenshotted it; pricing stays on the pricing page; and the team is fictional,
// because behavioural results are about as personal as workplace data gets.
import { motion } from "framer-motion";
import { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CTA from "./CTA";
import Reveal from "./Reveal";
import DiscHeroTour from "./DiscHeroTour";
import MultiAiWired from "./MultiAiWired";
import type { Row, Insight } from "./MultiAiWired";
import { useDemo } from "./DemoModal";

// ---------------------------------------------------------------- tokens
const PLUM = "#8A3F6D"; // the feature's own tile colour, from the navbar
const GREEN = "#1F7F4C";
const AMBER = "#C9832B";
const RED = "#C0402B";
const AI = "#4B3CC4";
const colTransition = { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const };

// Written out in full because Tailwind scans source for literal class names.
const CARD_CLS = "h-[380px] sm:h-[430px]";

// The four dimensions, with the product's own descriptors and the same colours
// the Org Chart legend uses.
const DIMS = [
  { k: "D", label: "Dominance", c: "#D6453C", note: "Direct, decisive, results-focused" },
  { k: "I", label: "Influence", c: "#D69A28", note: "Optimistic, people-focused, persuasive" },
  { k: "S", label: "Steadiness", c: "#2BA463", note: "Patient, predictable, consistent" },
  { k: "C", label: "Compliance", c: "#2C6BA6", note: "Analytical, accurate, systematic" },
] as const;

const DIM_C: Record<string, string> = { D: "#D6453C", I: "#D69A28", S: "#2BA463", C: "#2C6BA6" };

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

const DiscIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="12" cy="12" r="8.4" />
    <path d="M12 3.6v16.8M3.6 12h16.8" />
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
const Doc = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M6.4 3.4h7l4.2 4.2v13H6.4z" />
    <path d="M13.4 3.4v4.2h4.2M9 12.4h6M9 16h4" />
  </svg>
);
const Tree = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="9" y="3.4" width="6" height="4.4" rx="1.2" />
    <rect x="3" y="16.2" width="6" height="4.4" rx="1.2" />
    <rect x="15" y="16.2" width="6" height="4.4" rx="1.2" />
    <path d="M12 7.8v4.4M6 16.2v-4h12v4" />
  </svg>
);
const Spark = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2}>
    <path d="M12 3l1.6 4L18 8.5 14 10l-2 4-2-4-4-1.5L10 7z" />
  </svg>
);
const Rows = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.2" />
    <path d="M3.5 9.5h17M3.5 14.5h17" />
  </svg>
);
const Cap = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 4.4L2.6 9 12 13.6 21.4 9z" />
    <path d="M6.4 11v4.8c0 1.6 2.5 2.8 5.6 2.8s5.6-1.2 5.6-2.8V11M21.4 9v5" />
  </svg>
);
const Handshake = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M8.4 12.6l2.4 2.4 1.6-1.6 2.4 2.4" />
    <path d="M3.4 9.4l3.6-3.6h4l2 1.8 2-1.8h4l3.6 3.6-3.2 3.2-2.4-2-4 3.4-3.2-3.2" />
  </svg>
);
const Chat = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M20.4 12.4c0 3.8-3.8 6.8-8.4 6.8a10 10 0 0 1-2.6-.3l-4.6 1.6 1.4-3.6a6.4 6.4 0 0 1-2.6-4.9c0-3.8 3.8-6.8 8.4-6.8s8.4 3 8.4 6.8z" />
  </svg>
);
const Ext = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M14 4.4h5.6V10M19.6 4.4L11 13M17 13.4v5.2a1.6 1.6 0 0 1-1.6 1.6H5.4a1.6 1.6 0 0 1-1.6-1.6V8.6A1.6 1.6 0 0 1 5.4 7h5.2" />
  </svg>
);

// ---------------------------------------------------------------- the team
// Profiles match the badges the Org Chart page publishes. In every row the two
// highest scores are the two badge letters, in order. Notes section 6.
type Person = {
  name: string;
  init: string;
  role: string;
  scores: { D: number; I: number; S: number; C: number } | null;
  style?: string;
  done?: string;
};

const TEAM: Person[] = [
  { name: "Skylar Lewis", init: "SL", role: "CEO", scores: { D: 68, I: 81, S: 34, C: 46 }, style: "Persuader", done: "Mar 4, 2026" },
  { name: "Dana Whitfield", init: "DW", role: "COO", scores: { D: 38, I: 41, S: 66, C: 79 }, style: "Coordinator", done: "Mar 11, 2026" },
  { name: "Marcus Hale", init: "MH", role: "Operations Manager", scores: { D: 31, I: 42, S: 78, C: 66 }, style: "Specialist", done: "Apr 2, 2026" },
  { name: "Jordan Rivera", init: "JR", role: "VP Sales", scores: { D: 71, I: 86, S: 29, C: 38 }, style: "Persuader", done: "Mar 4, 2026" },
  { name: "Priya Nair", init: "PN", role: "Marketing Lead", scores: { D: 44, I: 77, S: 63, C: 41 }, style: "Promoter", done: "Apr 18, 2026" },
  { name: "Kath Nakamura", init: "KN", role: "Technology Lead", scores: { D: 61, I: 33, S: 40, C: 84 }, style: "Analyzer", done: "May 6, 2026" },
  { name: "Nina Petrova", init: "NP", role: "Content Lead", scores: { D: 32, I: 64, S: 76, C: 48 }, style: "Relater", done: "Jun 2, 2026" },
  { name: "Sam Okafor", init: "SO", role: "Account Executive", scores: null },
  { name: "Theo Barnes", init: "TB", role: "Demand Gen Lead", scores: null },
];

const badge = (p: Person) => {
  if (!p.scores) return null;
  const order = (Object.keys(p.scores) as (keyof typeof p.scores)[]).sort(
    (a, b) => p.scores![b] - p.scores![a],
  );
  return `${order[0]}/${order[1]}`;
};

const primary = (p: Person) => {
  const b = badge(p);
  return b ? DIM_C[b[0]] : "#A6A6A6";
};

const ASSESSED = TEAM.filter((p) => p.scores);

// ---------------------------------------------------------------- 2. the board
function BoardDemo() {
  const [sent, setSent] = useState<string[]>([]);
  const todo = TEAM.filter((p) => !p.scores);
  const pending = sent.length;

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${CARD_CLS}`}>
      <div className="flex flex-none items-center gap-3 border-b border-[#F1EEE9] px-3.5 py-2.5">
        {([
          { l: "Completed", n: ASSESSED.length, c: GREEN },
          { l: "Pending", n: pending, c: AMBER },
          { l: "Not Completed", n: todo.length - pending, c: "#A6A6A6" },
        ] as const).map((s) => (
          <span key={s.l} className="flex items-center gap-1.5 text-[10px] font-semibold">
            <span className="h-[6px] w-[6px] rounded-full" style={{ background: s.c }} />
            <span className="tabular-nums">{s.n}</span>
            <span className="font-normal text-brand-charcoal">{s.l}</span>
          </span>
        ))}
      </div>

      <div className="flex-none border-b border-[#F1EEE9] bg-[#FAF9F7] px-3.5 py-2">
        <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-brand-gray">
          Not completed
        </p>
        <div className="mt-1.5 space-y-1">
          {todo.map((p) => {
            const on = sent.includes(p.name);
            return (
              <div key={p.name} className="flex items-center gap-2 rounded-lg border border-[#EBE7E0] bg-white px-2 py-1.5">
                <span className="grid h-[18px] w-[18px] flex-none place-items-center rounded-full bg-[#F1EEE9] text-[7px] font-bold text-brand-charcoal">
                  {p.init}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[10px] font-semibold leading-tight">{p.name}</span>
                  <span className="block truncate text-[8px] text-brand-gray">
                    {on ? "Invite sent, link open 30 days" : p.role}
                  </span>
                </span>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() =>
                    setSent((s) => (s.includes(p.name) ? s.filter((x) => x !== p.name) : [...s, p.name]))
                  }
                  className="flex-none rounded-md px-2 py-[3px] text-[8.5px] font-bold text-white transition-colors"
                  style={{ background: on ? "#B7B2AA" : PLUM }}
                >
                  {on ? "Cancel" : "Send"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {ASSESSED.map((p) => (
          <div key={p.name} className="flex items-center gap-2 border-b border-[#F5F2ED] px-3.5 py-[7px]">
            <span className="grid h-[20px] w-[20px] flex-none place-items-center rounded-full bg-[#F1EEE9] text-[7.5px] font-bold text-brand-charcoal">
              {p.init}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5">
                <span className="truncate text-[10px] font-semibold leading-tight">{p.name}</span>
                <span
                  className="flex-none rounded-full px-1.5 py-px text-[8px] font-bold text-white"
                  style={{ background: primary(p) }}
                >
                  {badge(p)}
                </span>
              </span>
              <span className="text-[8px] text-brand-gray">Completed {p.done}</span>
            </span>
            <span className="flex flex-none items-center gap-1 rounded-md border border-[#E6E2DB] px-1.5 py-[3px] text-[8.5px] font-semibold text-brand-charcoal">
              <Doc className="h-2.5 w-2.5" />
              Report
            </span>
          </div>
        ))}
      </div>

      <p className="flex-none border-t border-[#F1EEE9] px-3.5 py-2 text-[10px] leading-snug text-brand-gray">
        {pending > 0
          ? "Cancel it and the credit goes straight back to the pool."
          : "Send an invite and watch what happens to the count above."}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- 3. the profile
function ProfileDemo() {
  const [sel, setSel] = useState(2); // Marcus Hale, S/C
  const p = ASSESSED[sel];

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${CARD_CLS}`}>
      <div className="flex-none border-b border-[#F1EEE9] px-3.5 py-2.5">
        <p className="mb-1.5 text-[9.5px] text-brand-gray">Pick anybody on the team</p>
        <div className="scrollbar-none flex flex-nowrap gap-1 overflow-x-auto pb-1">
          {ASSESSED.map((x, i) => {
            const on = sel === i;
            return (
              <button
                key={x.name}
                type="button"
                aria-pressed={on}
                onClick={() => setSel(i)}
                className={`flex flex-none items-center gap-1.5 whitespace-nowrap rounded-full border px-1.5 py-1 text-[9px] transition-colors ${
                  on ? "border-transparent font-semibold text-white" : "border-[#E6E2DB] font-medium text-brand-charcoal hover:bg-[#FAF9F7]"
                }`}
                style={on ? { background: primary(x) } : undefined}
              >
                <span
                  className="grid h-[15px] w-[15px] place-items-center rounded-full text-[6.5px] font-bold"
                  style={on ? { background: "rgba(255,255,255,0.24)" } : { background: "#F1EEE9" }}
                >
                  {x.init}
                </span>
                {x.name.split(" ")[0]}
              </button>
            );
          })}
        </div>
      </div>

      <div key={p.name} className="sop-view min-h-0 flex-1 overflow-hidden px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <span className="grid h-[28px] w-[28px] flex-none place-items-center rounded-full bg-[#F1EEE9] text-[9.5px] font-bold text-brand-charcoal">
            {p.init}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[11.5px] font-bold leading-tight">{p.name}</span>
            <span className="block truncate text-[9px] text-brand-gray">
              {p.role} <span className="text-[#C4BFB6]">&middot;</span> {p.style}
            </span>
          </span>
          <span
            className="flex-none rounded-full px-2 py-px text-[9px] font-bold text-white"
            style={{ background: primary(p) }}
          >
            {badge(p)}
          </span>
        </div>

        <div className="mt-2.5 space-y-1.5">
          {DIMS.map((d, i) => {
            const v = p.scores![d.k];
            return (
              <div key={d.k}>
                <p className="flex items-center gap-1.5">
                  <span
                    className="grid h-[14px] w-[14px] flex-none place-items-center rounded-full text-[8px] font-bold text-white"
                    style={{ background: d.c }}
                  >
                    {d.k}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[10px] font-semibold">{d.label}</span>
                  <span className="flex-none font-mono text-[10.5px] font-bold tabular-nums">{v}</span>
                </p>
                <span className="mt-0.5 block h-[5px] w-full overflow-hidden rounded-full bg-[#F1EEE9]">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${v}%`,
                      background: d.c,
                      transition: `width .7s cubic-bezier(0.22,1,0.36,1) ${i * 80}ms`,
                    }}
                  />
                </span>
                <p className="mt-0.5 pl-[19px] text-[8px] text-brand-gray">{d.note}</p>
              </div>
            );
          })}
        </div>
      </div>

      <p className="flex-none border-t border-[#F1EEE9] px-3.5 py-2 text-[10px] leading-snug text-brand-gray">
        <Doc className="mr-1 inline h-3 w-3" />
        The full TTI report sits behind it, downloadable, whenever you want the detail.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- 4. built in
const PLACES = [
  {
    k: "chart",
    label: "On the org chart",
    icon: Tree,
    c: "#3F7A6B",
    body: "One switch adds every profile to the chart, so you can see the shape of a team before you restructure it.",
  },
  {
    k: "team",
    label: "In the team list",
    icon: Rows,
    c: PLUM,
    body: "A column beside role and permission. Anybody who has not taken it is a grey dash, so the gap is visible without running a report.",
  },
  {
    k: "ai",
    label: "In Multi AI",
    icon: Spark,
    c: AI,
    body: "The coach can read profiles, so when you ask how to get somebody on board with something, it answers for that person rather than in general.",
  },
];

function BuiltInDemo() {
  const [sel, setSel] = useState(0);
  const place = PLACES[sel];

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${CARD_CLS}`}>
      <div className="flex-none border-b border-[#F1EEE9] px-3.5 py-2.5">
        <div className="grid grid-cols-3 gap-1.5">
          {PLACES.map((x, i) => {
            const Icon = x.icon;
            const on = sel === i;
            return (
              <button
                key={x.k}
                type="button"
                aria-pressed={on}
                onClick={() => setSel(i)}
                className={`flex flex-col items-start gap-1 rounded-lg border px-2 py-1.5 text-left transition-colors ${
                  on ? "border-transparent bg-[#F7F5F1]" : "border-[#E6E2DB] hover:bg-[#FAF9F7]"
                }`}
                style={on ? { boxShadow: `inset 0 0 0 1.5px ${x.c}55` } : undefined}
              >
                <span
                  className="grid h-[20px] w-[20px] place-items-center rounded-md"
                  style={on ? { background: x.c, color: "#fff" } : { background: "#F1EEE9", color: "#8A857D" }}
                >
                  <Icon className="h-2.5 w-2.5" />
                </span>
                <span className="block truncate text-[9px] font-bold leading-tight">{x.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div key={place.k} className="sop-view min-h-0 flex-1 overflow-hidden bg-[#FAF9F7] px-3.5 py-2.5">
        {sel === 0 && (
          <div className="space-y-1.5">
            {ASSESSED.slice(0, 5).map((p) => (
              <div key={p.name} className="flex items-center gap-2 rounded-lg border border-[#EBE7E0] bg-white px-2 py-1.5">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[9.5px] font-bold leading-tight">{p.role}</span>
                  <span className="block truncate text-[8.5px] text-brand-charcoal">{p.name}</span>
                </span>
                <span
                  className="flex-none rounded-full px-1.5 py-px text-[8px] font-bold text-white"
                  style={{ background: primary(p) }}
                >
                  {badge(p)}
                </span>
              </div>
            ))}
          </div>
        )}

        {sel === 1 && (
          <table className="w-full text-left">
            <thead>
              <tr className="text-[7.5px] uppercase tracking-[0.1em] text-brand-gray">
                <th className="pb-1 font-bold">Member</th>
                <th className="pb-1 font-bold">Permission</th>
                <th className="pb-1 text-center font-bold">DISC</th>
              </tr>
            </thead>
            <tbody>
              {TEAM.slice(0, 7).map((p) => (
                <tr key={p.name} className="border-t border-[#EDEAE4]">
                  <td className="py-[5px] text-[9.5px] font-semibold">{p.name}</td>
                  <td className="py-[5px] text-[8.5px] text-brand-charcoal">
                    {p.role === "CEO" || p.role === "COO" ? "Leadership" : "Team Member"}
                  </td>
                  <td className="py-[5px] text-center">
                    {p.scores ? (
                      <span
                        className="rounded-full px-1.5 py-px text-[8px] font-bold text-white"
                        style={{ background: primary(p) }}
                      >
                        {badge(p)}
                      </span>
                    ) : (
                      <span className="text-[9px] text-[#C4BFB6]">&ndash;</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {sel === 2 && (
          <>
            <div className="flex justify-end">
              <p className="max-w-[88%] rounded-2xl rounded-br-md bg-[#F1EEE9] px-2.5 py-1.5 text-[9.5px] font-medium">
                How do I get Kath on board with moving scheduling off spreadsheets?
              </p>
            </div>
            <div className="mt-2 flex gap-2">
              <span className="grid h-[20px] w-[20px] flex-none place-items-center rounded-lg bg-gradient-to-br from-[#F49230] to-[#DE6F14] text-white">
                <Spark className="h-2.5 w-2.5" />
              </span>
              <p className="min-w-0 flex-1 text-[10px] leading-relaxed text-brand-charcoal">
                Kath scores 84 on Compliance and 33 on Influence. Do not sell it to her, and do not
                bring it to her in a meeting. Send the migration plan in writing, with the failure
                cases already listed, and give her a day before you ask what she thinks.
              </p>
            </div>
          </>
        )}
      </div>

      <p className="flex-none border-t border-[#F1EEE9] px-3.5 py-2 text-[10px] leading-snug text-brand-gray">
        {place.body}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- 5. what it is for
const USES = [
  {
    k: "hiring",
    label: "Hiring",
    icon: Handshake,
    c: "#2C6BA6",
    head: "Assess somebody who does not work for you yet",
    body: "Send an assessment outside your organisation and have the profile waiting before the second interview, instead of finding out in month three that the role needed somebody who works the opposite way.",
  },
  {
    k: "oneone",
    label: "1-on-1s",
    icon: Chat,
    c: PLUM,
    head: "Know how this person wants to be talked to",
    body: "The same feedback lands differently on a 78 Steadiness than on an 86 Influence. Their profile sits in the record you already open before the meeting.",
  },
  {
    k: "comms",
    label: "Team communication",
    icon: DiscIcon,
    c: "#1F7F4C",
    head: "See the shape of the team, not just the people",
    body: "Four decisive types and nobody who slows anything down is a real risk, and it is invisible until every profile is in one place.",
  },
];

function UseDemo() {
  const [sel, setSel] = useState(0);
  const u = USES[sel];
  const Icon = u.icon;

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${CARD_CLS}`}>
      <div className="flex flex-none items-center gap-1 border-b border-[#F1EEE9] px-3.5 py-2.5">
        <span className="flex items-center gap-0.5 rounded-lg bg-[#F1EEE9] p-0.5">
          {USES.map((x, i) => (
            <button
              key={x.k}
              type="button"
              aria-pressed={sel === i}
              onClick={() => setSel(i)}
              className={`whitespace-nowrap rounded-[7px] px-2.5 py-[5px] text-[10px] transition-colors ${
                sel === i ? "bg-brand-ink font-semibold text-white" : "font-medium text-brand-charcoal"
              }`}
            >
              {x.label}
            </button>
          ))}
        </span>
      </div>

      <div key={u.k} className="sop-view flex min-h-0 flex-1 flex-col justify-center bg-[#FAF9F7] px-4 py-3">
        <span
          className="mx-auto grid h-[38px] w-[38px] place-items-center rounded-xl text-white"
          style={{ background: u.c }}
        >
          <Icon className="h-5 w-5" />
        </span>
        <p className="mt-2.5 text-center text-[12.5px] font-bold leading-tight">{u.head}</p>
        <p className="mx-auto mt-1.5 max-w-[300px] text-center text-[10.5px] leading-relaxed text-brand-charcoal">
          {u.body}
        </p>

        {sel === 0 && (
          <p className="mx-auto mt-2.5 flex items-center gap-1.5 rounded-lg border border-[#E6E2DB] bg-white px-2.5 py-1.5 text-[9.5px] font-semibold text-brand-charcoal">
            <Ext className="h-3 w-3" />
            Send Outside Organization
          </p>
        )}
        {sel === 2 && (
          <div className="mx-auto mt-2.5 flex gap-1">
            {ASSESSED.map((p) => (
              <span
                key={p.name}
                className="rounded-full px-1.5 py-px text-[8px] font-bold text-white"
                style={{ background: primary(p) }}
              >
                {badge(p)}
              </span>
            ))}
          </div>
        )}
      </div>

      <p className="flex-none border-t border-[#F1EEE9] px-3.5 py-2 text-[10px] leading-snug text-brand-gray">
        <Cap className="mr-1 inline h-3 w-3" style={{ color: PLUM }} />
        Not sure how to use any of it? A DISC coach, an actual person, will walk your team through it.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- 6. Multi AI
const AI_ROWS: Row[] = [
  { name: "Leadership team", value: "3 of 4 high D or I", hit: false, tone: "amber" },
  { name: "Kath Nakamura", value: "C 84 / I 33", hit: true },
  { name: "Not assessed", value: "2 people", hit: false, tone: "red" },
];

const AI_INSIGHTS: Insight[] = [
  {
    tag: "Shape",
    color: AMBER,
    source: "Leadership team",
    text: "Three of your four leaders lead with Dominance or Influence. That room will decide quickly and will not naturally slow down to check the detail. Dana is the only high Compliance in it, which makes her the whole quality function by accident.",
  },
  {
    tag: "How to ask",
    color: GREEN,
    source: "Kath Nakamura",
    text: "Kath is 84 Compliance and 33 Influence. Put the migration plan in writing with the failure cases listed, and give her a day before asking what she thinks. Pitching it live will not work.",
  },
  {
    tag: "Gap",
    color: RED,
    source: "Not assessed",
    text: "Sam and Theo have no profile, and both are in customer-facing seats. You have two credits held and eight available, so this is a five-minute fix rather than a budget conversation.",
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
export default function DiscPage() {
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
              <span className="grid h-[21px] w-[21px] flex-none place-items-center rounded-lg bg-gradient-to-br from-[#A75486] to-[#6E2E56] text-white shadow-[0_2px_6px_rgba(110,46,86,0.34),inset_0_1px_0_rgba(255,255,255,0.34)] sm:h-[34px] sm:w-[34px] sm:rounded-[11px]">
                <DiscIcon className="h-[14px] w-[14px] sm:h-[19px] sm:w-[19px]" />
              </span>
              <span className="text-[11.5px] font-[650] tracking-[0.02em] text-[#33302C] sm:text-[16.5px]">
                DISC Assessments
              </span>
            </span>
            <h1 className="text-[24px] font-extrabold leading-[1.1] tracking-tight text-brand-ink sm:text-[66px] sm:leading-[1.04]">
              Know how your team
              <br />
              <span className="text-brand-orange">actually works.</span>
            </h1>
            <p className="mx-auto mt-3.5 max-w-2xl text-[14.5px] leading-relaxed text-brand-charcoal sm:mt-7 sm:text-xl">
              <span className="sm:hidden">
                Send the assessment, read the result, and find it already sitting in the record of
                the person you are about to talk to.
              </span>
              <span className="hidden sm:inline">
                Everybody has done a personality test. It is in a PDF somebody emailed round two years
                ago. This one lives in the same place as the person: on their record, on the org
                chart, and in front of you the moment you are deciding how to hire, coach, or ask.
              </span>
            </p>
          </Reveal>

          <Reveal delay={0.12} className="mt-6 sm:mt-12">
            <div
              className="overflow-hidden rounded-2xl p-2 sm:rounded-[30px] sm:p-8"
              style={{ background: "linear-gradient(160deg, #F6EDF3, #EBDAE5)" }}
            >
              <DiscHeroTour />
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

      {/* ------------------------------------------------ 2. the board */}
      <Section
        id="board"
        eyebrow="One board"
        title="Who has taken it, and who you are still"
        swash="waiting on."
        body="Completed, pending, and not completed, on one screen, with the invite button next to the name. Send one and it appears under pending until they finish it. Nobody has to keep a spreadsheet of who has done the personality test."
        points={[
          "Send an assessment from beside the person's name",
          "Pending, completed, and untouched, counted at the top",
          "Contractors included or hidden, whichever you need",
        ]}
        visual={<BoardDemo />}
        panel="linear-gradient(160deg, #F7EFF4, #EEDFE8)"
      />

      {/* ------------------------------------------------ 3. the profile */}
      <Section
        id="profile"
        eyebrow="A person, not a PDF"
        title="Four numbers, in the record you were"
        swash="already opening."
        body="Dominance, Influence, Steadiness, and Compliance, each scored out of a hundred with what that score actually means. It sits inside their team record, next to their role and their department, rather than in a report you have to go and find."
        points={[
          "Every dimension scored, with a plain-English descriptor",
          "The full TTI report behind it, viewable and downloadable",
          "Already got a report from elsewhere? Replace the profile with it",
        ]}
        visual={<ProfileDemo />}
        flip
        panel="linear-gradient(160deg, #EEF4FB, #E2ECF8)"
      />

      {/* ------------------------------------------------ 4. built in */}
      <Section
        id="built-in"
        eyebrow="Built in, not bolted on"
        title="It turns up where you were going to"
        swash="need it."
        body="A personality assessment is only useful at the moment you are deciding something about a person. So the profile is on the org chart behind one switch, in the team list as a column, and readable by Multi AI when you ask how to approach somebody."
        points={[
          "One switch puts every profile on the org chart",
          "A DISC column beside role and permission",
          "Multi AI reads profiles, so its advice is about that person",
        ]}
        visual={<BuiltInDemo />}
        panel="linear-gradient(160deg, #EEF6F2, #E1EFE8)"
      />

      {/* ------------------------------------------------ 5. what it is for */}
      <Section
        id="uses"
        eyebrow="Hiring, 1-on-1s, and everything in between"
        title="The point was never the"
        swash="four letters."
        body="It is worth having because of what you do differently once you know. Who to put in front of a nervous client, how to deliver feedback that lands, and which candidate is going to be miserable in a role that looks perfect on paper."
        points={[
          "Assess candidates before you hire them, not after",
          "Walk into a 1-on-1 knowing how this person takes feedback",
          "See the shape of a whole team, and what it is missing",
        ]}
        visual={<UseDemo />}
        flip
        panel="linear-gradient(160deg, #FDF6EE, #F9E9D8)"
      />

      {/* ------------------------------------------------ 6. Multi AI (always last) */}
      <MultiAiWired
        heading="And a coach that reads them"
        swash="for you."
        intro="Multi AI can see every profile on your team. Ask it how to approach somebody, or what your leadership team is collectively bad at, and it answers from the actual scores rather than from a description of DISC."
        prompt="What is my leadership team collectively blind to?"
        leftLabel="The profiles on your team"
        leftColor={PLUM}
        leftIcon={Rows}
        rightLabel="What Multi AI reads out of them"
        panelTitle="DISC · Ridgeline Services"
        panelMeta="7 of 9 assessed"
        panelDot={PLUM}
        rows={AI_ROWS}
        insights={AI_INSIGHTS}
        aiMeta="reading 7 profiles"
        footer="Multi AI reads the profiles your team already completed. No exports, no interpreting a bar chart yourself, and no separate assessment platform to log into."
      />

      <CTA />
      <Footer />
    </main>
  );
}
