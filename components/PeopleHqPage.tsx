"use client";

// The People HQ feature page.
//
// Built November 2026 from twenty-four client screenshots of the module, the
// help center's People HQ articles (overview, the Overview page, Hiring) and
// Multi AI's own summary of it: everything about the people who work for you.
//
// The page follows the employee journey the Overview page is built around,
// Attract, Onboard, Grow, Engage, with a band for it under the hero. Then five
// sections, one per page that does the work:
//
//   1. hiring          the funnel from Plan to Onboarding, and the board
//   2. reviews         review cycles, the Evidence panel, approval, release,
//                      acknowledgement and the development plan
//   3. 360 feedback    raters from the org chart, and groups that only appear
//                      once three people have answered
//   4. surveys         anonymous surveys, the anonymity minimum, drivers and
//                      the heatmap
//   5. certifications  the tracker, verification and reminders
//
// The Overview and Reports are in the hero tour. DISC has its own page and is
// not repeated here.
//
// Everything here traces to a screenshot or the help center text. No plan names:
// the help center ties Hiring to a plan the pricing page no longer names. See
// docs/people-hq-feature-notes.md.
import { motion } from "framer-motion";
import { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CTA from "./CTA";
import Reveal from "./Reveal";
import PeopleHqHeroTour from "./PeopleHqHeroTour";
import MultiAiWired from "./MultiAiWired";
import type { Row, Insight } from "./MultiAiWired";
import { useDemo } from "./DemoModal";
import { signupCta } from "@/lib/signup-cta";

const SIGNUP = signupCta();

// ---------------------------------------------------------------- tokens
const ROSE = "#B0466E"; // the module's own colour, from the navbar
const GREEN = "#1FA36A";
const AMBER = "#C9832B";
const BLUE = "#2F8FD8";
const PURPLE = "#7A4EDB";
const NAVY = "#0F1B2D";
const RED = "#C0402B";
const ORANGE = "#EA7B1B";
const STAR = "#F2B01E";
const AI = "#4B3CC4";
const INK = "#1B1A17";
const HAIR = "#ECEAE6";
const HAIR2 = "#E3E0DA";
const MUTED = "#8A867E";
const MUTED2 = "#A9A49B";

const PANEL_ROSE = "linear-gradient(160deg, #F6E7ED, #ECD4DE)";
const PANEL_STONE = "linear-gradient(160deg, #F2EEE7, #E7E0D4)";

const colTransition = { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const };
// One height at every width, as on the other HQ pages.
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

/** People HQ's own mark in the app: two people. */
const PeopleIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="9" cy="8.2" r="3.2" />
    <path d="M3.4 19.2c.6-3.2 2.9-5.1 5.6-5.1s5 1.9 5.6 5.1" />
    <path d="M15.4 5.3a3 3 0 0 1 0 5.7M17.3 14.4c1.8.6 3 2.2 3.3 4.8" />
  </svg>
);
const UserPlusIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="9.4" cy="8.2" r="3.4" />
    <path d="M3.4 19.4c.7-3.3 3-5.2 6-5.2 1.4 0 2.6.4 3.6 1.1M18 13v6M15 16h6" />
  </svg>
);
const RibbonIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="12" cy="9" r="5.4" />
    <path d="M8.6 13.4L7.4 20.6 12 18.2l4.6 2.4-1.2-7.2" />
  </svg>
);
const HeartPulseIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 20s-7.6-4.6-7.6-10.4A4.2 4.2 0 0 1 12 7.2a4.2 4.2 0 0 1 7.6 2.4C19.6 15.4 12 20 12 20z" />
    <path d="M6.6 12.2h3l1.4-2.4 2 4.2 1.4-1.8h3" />
  </svg>
);
const CheckCircleIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="12" cy="12" r="8.4" />
    <path d="M8.4 12.2l2.4 2.4 4.8-4.8" />
  </svg>
);
const QuoteIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M4.4 5.4h15.2a1.4 1.4 0 0 1 1.4 1.4v9a1.4 1.4 0 0 1-1.4 1.4H10l-4.6 3.4v-3.4h-1A1.4 1.4 0 0 1 3 15.8v-9a1.4 1.4 0 0 1 1.4-1.4z" />
    <path d="M9 10v2M15 10v2" />
  </svg>
);
const SendIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M20.4 3.6L10.2 13.8M20.4 3.6l-6.6 16.8-3.6-6.6-6.6-3.6z" />
  </svg>
);
const LockIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="4.6" y="10.4" width="14.8" height="9.8" rx="2" />
    <path d="M8 10.4V7.4a4 4 0 0 1 8 0v3" />
  </svg>
);
const Tick = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2.4}>
    <path d="M5 12l5 5L20 7" />
  </svg>
);
const Arrow = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M5 12h13M12.5 5.5L19 12l-6.5 6.5" />
  </svg>
);
const RowsIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="3.4" y="5" width="17.2" height="4.2" rx="1.4" />
    <rect x="3.4" y="14.8" width="17.2" height="4.2" rx="1.4" />
  </svg>
);
const StarIcon = ({ on, className }: { on: boolean; className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill={on ? STAR : "none"} stroke={on ? STAR : "#CFCBC3"} strokeWidth={1.6} strokeLinejoin="round">
    <path d="M12 3.8l2.5 5.2 5.6.7-4.1 3.9 1 5.6L12 16.5l-5 2.7 1-5.6-4.1-3.9 5.6-.7z" />
  </svg>
);

/** Small labelled header shared by every section card. */
function CardHead({ icon: Ico, title, right }: { icon: (p: IconProps) => React.JSX.Element; title: string; right?: React.ReactNode }) {
  return (
    <div className="flex flex-none items-center gap-2 border-b px-4 py-2.5" style={{ borderColor: HAIR }}>
      <Ico className="h-[15px] w-[15px] flex-none" style={{ color: ROSE }} />
      <span className="truncate text-[12.5px] font-bold">{title}</span>
      {right && <span className="ml-auto flex flex-none items-center gap-1.5">{right}</span>}
    </div>
  );
}

function Footnote({ icon: Ico, children }: { icon: (p: IconProps) => React.JSX.Element; children: React.ReactNode }) {
  return (
    <div className="mx-4 mb-4 flex flex-none items-center gap-2 rounded-[10px] border px-3 py-2 text-[10.5px]" style={{ borderColor: HAIR2, background: "#FBFAF8", color: MUTED }}>
      <Ico className="h-[12px] w-[12px] flex-none" style={{ color: ROSE }} />
      <span className="truncate">{children}</span>
    </div>
  );
}

function ActionButton({ onClick, done, children }: { onClick: () => void; done?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-[8px] py-1.5 text-[10.5px] font-bold transition-colors"
      style={done ? { background: "#EEECE8", color: MUTED } : { background: NAVY, color: "#fff" }}
    >
      {children}
    </button>
  );
}

const initials = (n: string) =>
  n
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

// ---------------------------------------------------------------- 1. hiring
const FUNNEL = [
  { n: "Plan", note: "Title, location, pay, job description and interview stages, with AI to help draft each part." },
  { n: "Source", note: "Post the job, ask for referrals, and pull candidates into the pipeline." },
  { n: "Applicants", note: "Read the resume, make a gut check, and decide who goes on to interviews." },
  { n: "Interview", note: "Phone screen, DISC, then first, second and final interviews, with notes on each." },
  { n: "Reference Check", note: "Talk to former managers and peers before an offer goes out." },
  { n: "Offer Letter", note: "Dana Whitfield signs off on the offer before it can be sent for signature." },
  { n: "Onboarding", note: "Onboarding from a template: SOPs to read and a tasks project to work through." },
];

function HiringDemo() {
  const [stage, setStage] = useState(3);
  const [stars, setStars] = useState(4);
  const last = stage === FUNNEL.length - 1;
  return (
    <div className={`relative flex flex-col overflow-hidden rounded-[18px] border bg-white ${CARD_CLS}`} style={{ borderColor: HAIR }}>
      <CardHead
        icon={UserPlusIcon}
        title="Operations Coordinator"
        right={
          <span className="text-[10px] font-semibold" style={{ color: MUTED }}>
            8 candidates
          </span>
        }
      />
      <div className="flex flex-none items-center gap-2.5 px-4 pt-3">
        <span className="grid h-[30px] w-[30px] flex-none place-items-center rounded-full text-[10px] font-bold" style={{ background: "#FBEAE0", color: "#C2612D" }}>
          NC
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12px] font-bold">Nora Castillo</span>
          <span className="block truncate text-[10px]" style={{ color: MUTED }}>
            High Potential · resume and interview notes on file
          </span>
        </span>
        <span className="flex flex-none gap-[1px]">
          {[1, 2, 3, 4, 5].map((s) => (
            <button key={s} type="button" aria-label={`${s} stars`} onClick={() => setStars(s)}>
              <StarIcon on={s <= stars} className="h-[15px] w-[15px]" />
            </button>
          ))}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-4 pt-3">
        <div className="flex flex-col gap-1">
          {FUNNEL.map((f, i) => {
            const done = i < stage;
            const cur = i === stage;
            return (
              <button
                key={f.n}
                type="button"
                onClick={() => setStage(i)}
                className="flex items-center gap-2 rounded-[8px] border px-2.5 py-[5px] text-left transition-colors duration-200"
                style={{ borderColor: cur ? NAVY : HAIR, background: cur ? "#F3F2EF" : "#fff" }}
              >
                <span
                  className="grid h-[16px] w-[16px] flex-none place-items-center rounded-full text-[8.5px] font-bold"
                  style={done ? { border: `1.5px solid ${GREEN}`, color: GREEN } : cur ? { background: NAVY, color: "#fff" } : { background: "#EEECE8", color: MUTED }}
                >
                  {done ? <Tick className="h-[9px] w-[9px]" /> : i + 1}
                </span>
                <span className="text-[11px] font-semibold" style={{ color: done || cur ? INK : MUTED }}>
                  {f.n}
                </span>
                {cur && (
                  <span className="rounded-[4px] px-1 text-[8px] font-bold tracking-[0.06em]" style={{ background: "#E4E2DD" }}>
                    CURRENT
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-2 text-[10.5px] leading-snug" style={{ color: MUTED }}>
          {FUNNEL[stage].note}
        </div>
      </div>

      <div className="mx-4 mb-3 mt-2 flex-none">
        <ActionButton onClick={() => setStage((s) => (last ? 3 : s + 1))} done={last}>
          {last ? "Start over" : `Move to ${FUNNEL[stage + 1].n}`}
        </ActionButton>
      </div>
      <Footnote icon={LockIcon}>Hiring has its own access: hiring managers, coordinators and recruiting admins.</Footnote>
    </div>
  );
}

// ---------------------------------------------------------------- 2. performance reviews
const REVIEW_STEPS = [
  { n: "Both sides in", d: "Marcus submitted his self-review and Dana her manager review, written beside the Evidence panel." },
  { n: "Second-level approval", d: "Dana's manager signs off before Marcus sees anything. Optional, per cycle." },
  { n: "Released", d: "Released now, on a date, or when the manager chooses." },
  { n: "Conversation booked", d: "One click books the review conversation as a 1on1." },
  { n: "Acknowledged", d: "Marcus has read it. Acknowledging means he read it, not that he agrees." },
  { n: "Development plan", d: "What Marcus works on next. Make tasks turns each item into a task assigned to him." },
];
const PLAN = ["Lead the spring maintenance launch", "Shadow Priya on quarterly budgeting", "Mentor one new coordinator"];
const EVIDENCE = [
  ["1on1s", "22 held"],
  ["Recognition", "9 shout-outs"],
  ["Scoreboard", "41 of 48 weeks"],
  ["Tasks", "92% on time"],
];

function ReviewDemo() {
  const [step, setStep] = useState(0);
  const [tasks, setTasks] = useState(false);
  const last = step === REVIEW_STEPS.length - 1;
  return (
    <div className={`relative flex flex-col overflow-hidden rounded-[18px] border bg-white ${CARD_CLS}`} style={{ borderColor: HAIR }}>
      <CardHead
        icon={RibbonIcon}
        title="Marcus Hale · FY2026 Annual Review"
        right={
          <span className="rounded-full px-2 py-[2px] text-[10px] font-bold" style={{ background: `${GREEN}16`, color: GREEN }}>
            Live
          </span>
        }
      />
      <div className="grid flex-none grid-cols-4 gap-1.5 px-4 pt-3">
        {EVIDENCE.map(([l, v]) => (
          <div key={l} className="rounded-[8px] border px-2 py-1.5" style={{ borderColor: HAIR, background: "#FBFAF8" }}>
            <div className="truncate text-[8px] font-bold uppercase tracking-[0.08em]" style={{ color: MUTED2 }}>
              {l}
            </div>
            <div className="truncate text-[10.5px] font-bold">{v}</div>
          </div>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-4 pt-3">
        <div className="flex flex-col">
          {REVIEW_STEPS.map((s, i) => {
            const done = i < step;
            const cur = i === step;
            return (
              <div key={s.n} className="flex gap-2.5">
                <div className="flex flex-col items-center">
                  <span
                    className="grid h-[16px] w-[16px] flex-none place-items-center rounded-full text-[8.5px] font-bold transition-colors duration-300"
                    style={done ? { background: GREEN, color: "#fff" } : cur ? { background: NAVY, color: "#fff" } : { background: "#EEECE8", color: MUTED }}
                  >
                    {done ? <Tick className="h-[9px] w-[9px]" /> : i + 1}
                  </span>
                  {i < REVIEW_STEPS.length - 1 && <span className="w-px flex-1" style={{ background: done ? GREEN : HAIR2, minHeight: cur ? 8 : 6 }} />}
                </div>
                <div className="min-w-0 pb-1.5">
                  <div className="text-[11px] font-semibold" style={{ color: done || cur ? INK : MUTED }}>
                    {s.n}
                  </div>
                  {cur && (
                    <div className="text-[10px] leading-snug" style={{ color: MUTED }}>
                      {s.d}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {last && (
          <div className="mt-1 flex flex-col gap-1">
            {PLAN.map((p) => (
              <div key={p} className="flex items-center gap-2 rounded-[8px] border px-2.5 py-[5px] text-[10.5px]" style={{ borderColor: tasks ? `${GREEN}55` : HAIR }}>
                <span className="min-w-0 flex-1 truncate">{p}</span>
                {tasks && (
                  <span className="flex-none rounded-full px-2 py-[1px] text-[9px] font-bold" style={{ background: `${GREEN}16`, color: GREEN }}>
                    Task · Marcus
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mx-4 mb-4 mt-2 flex-none">
        {last ? (
          <ActionButton onClick={() => (tasks ? (setTasks(false), setStep(0)) : setTasks(true))} done={tasks}>
            {tasks ? "Start over" : "Make tasks"}
          </ActionButton>
        ) : (
          <ActionButton onClick={() => setStep((s) => s + 1)}>Next: {REVIEW_STEPS[step + 1].n}</ActionButton>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 3. 360 feedback
// "Communicates clearly", on a 1 to 5 scale. Self sits above how others see it,
// which is the gap the report is for.
const SELF = 4.6;

function FeedbackDemo() {
  const [peers, setPeers] = useState(2);
  const shown = peers >= 3;
  const groups = [
    { g: "Manager", n: 1, v: 3.8, anon: false },
    { g: "Direct reports", n: 4, v: 3.9, anon: true },
    { g: "Peers", n: peers, v: 3.5, anon: true },
    { g: "External, by email", n: 3, v: 4.1, anon: true },
  ];
  const visible = groups.filter((g) => !g.anon || g.n >= 3);
  const others = visible.reduce((s, g) => s + g.v * g.n, 0) / visible.reduce((s, g) => s + g.n, 0);
  return (
    <div className={`relative flex flex-col overflow-hidden rounded-[18px] border bg-white ${CARD_CLS}`} style={{ borderColor: HAIR }}>
      <CardHead
        icon={QuoteIcon}
        title="360 · Priya Nair"
        right={
          <span className="text-[10px] font-semibold" style={{ color: MUTED }}>
            Closes Friday
          </span>
        }
      />
      <div className="flex-none px-4 pt-3">
        <div className="text-[9px] font-bold uppercase tracking-[0.1em]" style={{ color: MUTED2 }}>
          Communicates clearly
        </div>
        <div className="mt-1.5 grid grid-cols-3 gap-2">
          <div className="rounded-[10px] border px-3 py-2" style={{ borderColor: HAIR2, background: "#FBFAF8" }}>
            <div className="text-[8.5px] font-bold uppercase tracking-[0.1em]" style={{ color: MUTED2 }}>
              Self
            </div>
            <div className="text-[19px] font-bold tabular-nums">{SELF.toFixed(1)}</div>
          </div>
          <div className="rounded-[10px] border px-3 py-2" style={{ borderColor: HAIR2, background: "#FBFAF8" }}>
            <div className="text-[8.5px] font-bold uppercase tracking-[0.1em]" style={{ color: MUTED2 }}>
              Others
            </div>
            <div className="text-[19px] font-bold tabular-nums">{others.toFixed(1)}</div>
          </div>
          <div className="rounded-[10px] border px-3 py-2" style={{ borderColor: `${AMBER}55`, background: "#FCF5E6" }}>
            <div className="text-[8.5px] font-bold uppercase tracking-[0.1em]" style={{ color: AMBER }}>
              Gap
            </div>
            <div className="text-[19px] font-bold tabular-nums" style={{ color: "#8A5A12" }}>
              +{(SELF - others).toFixed(1)}
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-4 pt-3">
        <div className="flex flex-col gap-1.5">
          {groups.map((g) => {
            const locked = g.anon && g.n < 3;
            return (
              <div key={g.g} className="rounded-[9px] border px-3 py-[7px] transition-colors duration-300" style={{ borderColor: HAIR, background: locked ? "#FBFAF8" : "#fff" }}>
                <div className="flex items-center text-[10.5px]">
                  <span className="font-semibold">{g.g}</span>
                  <span className="ml-1.5 text-[9.5px]" style={{ color: MUTED }}>
                    {g.n} answered
                  </span>
                  <span className="ml-auto font-bold tabular-nums">
                    {locked ? (
                      <span className="flex items-center gap-1 text-[9.5px] font-semibold" style={{ color: MUTED }}>
                        <LockIcon className="h-[10px] w-[10px]" />
                        Appears at 3
                      </span>
                    ) : (
                      g.v.toFixed(1)
                    )}
                  </span>
                </div>
                {!locked && (
                  <div className="mt-1 h-[4px] overflow-hidden rounded-full" style={{ background: "#EEECE8" }}>
                    <div className="h-full rounded-full" style={{ width: `${(g.v / 5) * 100}%`, background: ROSE }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mx-4 mb-3 mt-2 flex-none">
        <ActionButton onClick={() => setPeers((p) => (shown ? 2 : p + 1))} done={shown}>
          {shown ? "Undo" : "A third peer answers"}
        </ActionButton>
      </div>
      <Footnote icon={LockIcon}>Small groups are combined into Other raters, so no answer can be traced.</Footnote>
    </div>
  );
}

// ---------------------------------------------------------------- 4. engagement surveys
const MINIMUMS = [3, 4, 5, 7, 10] as const;
const DEPTS = [
  { d: "Operations", n: 12, v: [78, 88, 52] },
  { d: "Sales", n: 10, v: [81, 84, 66] },
  { d: "Field crew", n: 8, v: [69, 90, 49] },
  { d: "Finance", n: 4, v: [74, 79, 70] },
  { d: "Marketing", n: 3, v: [83, 86, 75] },
];
function heat(v: number) {
  if (v >= 80) return { background: "#CDEBDC", color: "#17714A" };
  if (v >= 70) return { background: "#E3F3EA", color: "#2C7A52" };
  if (v >= 60) return { background: "#FBF0DA", color: "#8A5A12" };
  return { background: "#FBE1DD", color: "#A12A1F" };
}

function SurveyDemo() {
  const [min, setMin] = useState<(typeof MINIMUMS)[number]>(5);
  const hidden = DEPTS.filter((d) => d.n < min).length;
  return (
    <div className={`relative flex flex-col overflow-hidden rounded-[18px] border bg-white ${CARD_CLS}`} style={{ borderColor: HAIR }}>
      <CardHead
        icon={HeartPulseIcon}
        title="Q3 Team Engagement"
        right={
          <span className="text-[10px] font-semibold" style={{ color: MUTED }}>
            Closed · 37 of 42 answered
          </span>
        }
      />
      <div className="grid flex-none grid-cols-3 gap-2 px-4 pt-3">
        {[
          ["Engagement Index", "74%", GREEN],
          ["eNPS", "+32", BLUE],
          ["Participation", "88%", PURPLE],
        ].map(([l, v, c]) => (
          <div key={l} className="rounded-[10px] border border-l-[3px] px-2.5 py-1.5" style={{ borderColor: HAIR, borderLeftColor: c }}>
            <div className="truncate text-[8px] font-bold uppercase tracking-[0.08em]" style={{ color: MUTED2 }}>
              {l}
            </div>
            <div className="text-[17px] font-bold tabular-nums">{v}</div>
          </div>
        ))}
      </div>

      <div className="flex-none px-4 pt-3">
        <div className="flex items-center text-[9px] font-bold uppercase tracking-[0.1em]" style={{ color: MUTED2 }}>
          Anonymity minimum
          <span className="ml-auto normal-case tracking-normal">5 is recommended</span>
        </div>
        <div className="mt-1 flex gap-1">
          {MINIMUMS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMin(m)}
              className="flex-1 rounded-[8px] border py-1 text-[11px] font-bold transition-colors"
              style={min === m ? { borderColor: ROSE, background: `${ROSE}12`, color: ROSE } : { borderColor: HAIR2, color: MUTED }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-4 pt-3">
        <div className="grid gap-[3px]" style={{ gridTemplateColumns: "1.3fr repeat(3, 1fr)" }}>
          <span className="text-[8.5px] font-bold uppercase tracking-[0.08em]" style={{ color: MUTED2 }}>
            Heatmap
          </span>
          {["Engagement", "Manager", "Workload"].map((c) => (
            <span key={c} className="truncate text-center text-[8.5px] font-bold" style={{ color: MUTED }}>
              {c}
            </span>
          ))}
          {DEPTS.map((d) => {
            const off = d.n < min;
            return (
              <div key={d.d} className="contents">
                <span className="flex items-center gap-1 truncate text-[10px]">
                  {d.d}
                  <span className="text-[8.5px]" style={{ color: MUTED2 }}>
                    {d.n}
                  </span>
                </span>
                {off ? (
                  <span className="col-span-3 flex h-[24px] items-center justify-center gap-1 rounded-[5px] text-[9.5px] font-semibold" style={{ background: "#F3F1EC", color: MUTED }}>
                    <LockIcon className="h-[10px] w-[10px]" />
                    Hidden: fewer than {min} answered
                  </span>
                ) : (
                  d.v.map((v, i) => (
                    <span key={i} className="grid h-[24px] place-items-center rounded-[5px] text-[10px] font-bold tabular-nums" style={heat(v)}>
                      {v}
                    </span>
                  ))
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Footnote icon={LockIcon}>
        {hidden ? `${hidden} team${hidden === 1 ? "" : "s"} hidden at a minimum of ${min}. Results open only after the survey closes.` : "Results open only after the survey closes and enough people answered."}
      </Footnote>
    </div>
  );
}

// ---------------------------------------------------------------- 5. certifications
type S = "current" | "expiring" | "expired" | "missing" | "assigned" | "verify" | "na";
const TONE: Record<S, { background: string; color: string }> = {
  current: { background: "#E6F5EE", color: "#1D6B48" },
  assigned: { background: "#E3F0FB", color: "#1F5F94" },
  expiring: { background: "#FDF1DC", color: "#8A5A12" },
  expired: { background: "#FBE4E6", color: "#A12A3A" },
  missing: { background: "#FBE4E6", color: "#A12A3A" },
  verify: { background: "#EFE8FC", color: "#5B3BB8" },
  na: { background: "transparent", color: MUTED2 },
};
const ITEMS = ["OSHA 10", "First Aid", "Forklift", "Harassment"];
const PEOPLE: { n: string; c: [S, string][] }[] = [
  { n: "Marcus Hale", c: [["current", "10-2087745"], ["current", "11/17/27"], ["na", ""], ["current", "9/22/28"]] },
  { n: "Theo Barnes", c: [["verify", "To verify"], ["current", "3/16/28"], ["na", ""], ["current", "4/25/28"]] },
  { n: "Sam Ortega", c: [["current", "10-1952210"], ["expiring", "11/26/26"], ["current", "8/3/28"], ["current", "6/24/28"]] },
  { n: "Jordan Rivera", c: [["assigned", "Assigned"], ["missing", "Missing"], ["na", ""], ["assigned", "60% done"]] },
  { n: "Priya Nair", c: [["na", ""], ["current", "1/31/27"], ["na", ""], ["current", "10/2/28"]] },
  { n: "Avery Rowe", c: [["na", ""], ["expired", "9/23/26"], ["na", ""], ["current", "2/14/28"]] },
];

function CertsDemo() {
  const [attention, setAttention] = useState(false);
  const [verified, setVerified] = useState(false);
  const cellOf = (s: S, t: string): [S, string] => (s === "verify" && verified ? ["current", "10-2231904"] : [s, t]);
  const needs = (p: (typeof PEOPLE)[number]) => p.c.some(([s]) => s !== "current" && s !== "na" && !(s === "verify" && verified));
  const rows = attention ? PEOPLE.filter(needs) : PEOPLE;
  return (
    <div className={`relative flex flex-col overflow-hidden rounded-[18px] border bg-white ${CARD_CLS}`} style={{ borderColor: HAIR }}>
      <CardHead
        icon={CheckCircleIcon}
        title="Certifications / Trainings"
        right={
          <span className="rounded-full px-2 py-[2px] text-[10px] font-bold" style={{ background: `${GREEN}16`, color: GREEN }}>
            {verified ? "79%" : "75%"} compliant
          </span>
        }
      />
      <div className="flex flex-none items-center gap-2 px-4 pt-3">
        <button
          type="button"
          onClick={() => setAttention((a) => !a)}
          aria-pressed={attention}
          className="flex items-center gap-2 rounded-[8px] border px-2.5 py-1 text-[10.5px] font-semibold"
          style={{ borderColor: HAIR2 }}
        >
          <span className="relative h-[14px] w-[24px] rounded-full transition-colors" style={{ background: attention ? NAVY : "#D9D5CD" }}>
            <span className="absolute top-[2px] h-[10px] w-[10px] rounded-full bg-white transition-[left] duration-200" style={{ left: attention ? 12 : 2 }} />
          </span>
          Needs attention
        </button>
        <span className="ml-auto text-[10px]" style={{ color: MUTED }}>
          {rows.length} of {PEOPLE.length} people
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-4 pt-2.5">
        {/* minmax(0, …) so a card number can't widen its column past the card
            on a phone; the cells drop to 8.5px there so the numbers fit whole. */}
        <div className="grid gap-[3px]" style={{ gridTemplateColumns: "minmax(0,1.1fr) repeat(4, minmax(0,1fr))" }}>
          <span />
          {ITEMS.map((i) => (
            <span key={i} className="truncate rounded-[5px] py-[3px] text-center text-[8.5px] font-bold" style={{ background: "#F3F1EC" }}>
              {i}
            </span>
          ))}
          {rows.map((p) => (
            <div key={p.n} className="contents">
              <span className="flex h-[26px] items-center truncate text-[10px] font-semibold">{p.n}</span>
              {p.c.map(([s0, t0], i) => {
                const [s, t] = cellOf(s0, t0);
                return s === "na" ? (
                  <span key={i} />
                ) : (
                  <span key={i} className="grid h-[26px] place-items-center truncate rounded-[5px] px-0.5 text-[8.5px] font-semibold tabular-nums transition-colors duration-300 sm:text-[9px]" style={TONE[s]}>
                    {t}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
        {!attention && (
          <div className="mt-2.5 flex items-center gap-2.5 rounded-[10px] border px-3 py-2" style={{ borderColor: verified ? `${GREEN}55` : `${PURPLE}44`, background: verified ? "#EEF8F2" : "#F7F3FE" }}>
            <span className="min-w-0 flex-1 text-[10px] leading-snug">
              <b>Theo Barnes added OSHA 10</b>
              <span style={{ color: MUTED }}> · card 10-2231904, with a photo</span>
            </span>
            <button
              type="button"
              onClick={() => setVerified((v) => !v)}
              className="flex-none rounded-[7px] px-2.5 py-1 text-[10px] font-bold"
              style={verified ? { background: "#EEECE8", color: MUTED } : { background: NAVY, color: "#fff" }}
            >
              {verified ? "Undo" : "Verify"}
            </button>
          </div>
        )}
      </div>

      <Footnote icon={SendIcon}>Reminders go out on their own, plus a Monday digest for admins.</Footnote>
    </div>
  );
}

// ---------------------------------------------------------------- the journey band
const JOURNEY = [
  { k: "Attract", c: BLUE, icon: UserPlusIcon, d: "Candidates in the pipeline across your open roles, and who applied this week.", href: "#hiring" },
  { k: "Onboard", c: ORANGE, icon: SendIcon, d: "New hires onboarding now, from a template of SOPs and tasks.", href: "#hiring" },
  { k: "Grow", c: NAVY, icon: RibbonIcon, d: "How much of the running review cycle is done, and who is past due.", href: "#reviews" },
  { k: "Engage", c: GREEN, icon: HeartPulseIcon, d: "The favorable score from your latest closed survey, and the change since the last one.", href: "#surveys" },
];

// ---------------------------------------------------------------- Multi AI
const AI_ROWS: Row[] = [
  { name: "Field crew · Workload", value: "49% favorable", hit: false, tone: "red" },
  { name: "FY2026 Annual Review", value: "68% done", hit: false, tone: "amber" },
  { name: "Operations Coordinator", value: "Reference check", hit: true },
  { name: "First Aid / CPR", value: "1 expired", hit: false, tone: "red" },
];

const AI_INSIGHTS: Insight[] = [
  {
    tag: "Workload",
    color: RED,
    source: "Q3 Team Engagement",
    text: "Field crew scored workload at 49%, the lowest of any team, while its manager score is the highest at 90%. People like their lead and feel stretched: worth raising before the next survey.",
  },
  {
    tag: "Reviews",
    color: AMBER,
    source: "FY2026 Annual Review",
    text: "Three manager reviews are past due, all with the same reviewer. Two of those people also missed their last 1on1.",
  },
  {
    tag: "Compliance",
    color: AI,
    source: "Certifications",
    text: "Avery Rowe's First Aid expired Sep 23 and Sam Ortega's runs out Nov 26. A single crew class would cover both.",
  },
];

// ---------------------------------------------------------------- the page
export default function PeopleHqPage() {
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
              style={{ borderColor: `${ROSE}33`, background: `${ROSE}0F`, color: ROSE }}
            >
              <PeopleIcon className="h-[14px] w-[14px] sm:h-[19px] sm:w-[19px]" />
              People HQ
            </span>

            <h1 className="mt-5 text-[24px] font-extrabold leading-[1.1] tracking-tight text-brand-ink sm:mt-7 sm:text-[66px] sm:leading-[1.04]">
              Hire them, grow them,
              <br />
              <span className="text-brand-orange">keep them.</span>
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-[14px] leading-relaxed text-brand-charcoal sm:mt-6 sm:text-[19px]">
              People HQ is everything about the people who work for you: who is joining, how new hires get started, how
              people are growing, how they feel about working here, and whether their licenses and required trainings
              are current.
            </p>
          </Reveal>

          <Reveal delay={0.12} className="mt-6 sm:mt-12">
            <div className="relative mx-auto max-w-[1120px]">
              <div className="overflow-hidden rounded-2xl p-2 sm:rounded-[30px] sm:p-8" style={{ background: PANEL_ROSE }}>
                <PeopleHqHeroTour />
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

      {/* ------------------------------------------------ the employee journey */}
      <section className="px-5 pb-4 pt-8 sm:px-8 sm:pt-14">
        <div className="mx-auto max-w-container">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-[13px] font-bold uppercase tracking-[0.14em] text-brand-orange-dark">The employee journey</p>
            <h2 className="text-[26px] font-extrabold leading-[1.1] tracking-tight text-brand-ink sm:text-[42px] sm:leading-[1.06]">
              Four stages, <span className="text-brand-orange">one Overview.</span>
            </h2>
            <p className="mt-4 text-[14px] leading-relaxed text-brand-charcoal sm:text-[17px]">
              The Overview reads top to bottom: your team, where everyone is in the journey, and everything waiting on you, overdue items first.
            </p>
          </Reveal>
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {JOURNEY.map((j, i) => (
              <Reveal key={j.k} delay={0.05 * i}>
                <a href={j.href} className="group block h-full rounded-[18px] border bg-white p-5 transition-shadow hover:shadow-md" style={{ borderColor: HAIR }}>
                  <div className="flex items-center">
                    <span className="grid h-[34px] w-[34px] place-items-center rounded-[10px] text-white" style={{ background: j.c }}>
                      <j.icon className="h-[18px] w-[18px]" />
                    </span>
                    <span className="ml-auto font-mono text-[12px]" style={{ color: MUTED2 }}>
                      0{i + 1}
                    </span>
                  </div>
                  <div className="mt-4 text-[13px] font-bold uppercase tracking-[0.12em]" style={{ color: "#5C5852" }}>
                    {j.k}
                  </div>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-brand-charcoal">{j.d}</p>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ 1. hiring */}
      <Section
        id="hiring"
        eyebrow="Hiring"
        title={
          <>
            From an open role
            <br className="hidden sm:block" /> <span className="text-brand-orange">to their first day.</span>
          </>
        }
        body="Plan the seat, collect applicants, move them through interviews, references and an offer, and hand the new hire straight to onboarding. Every candidate's resume, interview notes, rating and stage live on their profile."
        points={[
          "A position planner for the title, location, pay, job description and interview stages, with AI to help draft each part",
          "Start a role from scratch, clone a previous position, or add a candidate by hand",
          "A board of every candidate: being interviewed, waiting on the offer letter, onboarded or not hired",
          "Offer approvals, interview templates, candidate emails, and onboarding from a template",
        ]}
        visual={<HiringDemo />}
        panel={PANEL_ROSE}
      />

      {/* ------------------------------------------------ 2. performance reviews */}
      <Section
        id="reviews"
        eyebrow="Performance reviews"
        title={
          <>
            Reviews built on the year,
            <br className="hidden sm:block" /> <span className="text-brand-orange">not on memory.</span>
          </>
        }
        body="Run annual, mid-year, quarterly, new-hire or project reviews. While a manager writes, the Evidence panel shows the year so far: 1on1s, recognition, People Alignment scores, scoreboard metrics and task follow-through."
        points={[
          "Question templates, like a 90-day check-in or a mid-year review, editable for one cycle without changing the template",
          "Optional second-level approval, then release now, on a date, or when the manager chooses",
          "The review conversation booked as a 1on1, an acknowledgement, and a development plan that becomes tasks",
          "New-hire reviews created automatically a set number of days after someone starts",
        ]}
        visual={<ReviewDemo />}
        flip
        panel={PANEL_STONE}
      />

      {/* ------------------------------------------------ 3. 360 feedback */}
      <Section
        id="feedback"
        eyebrow="360 feedback"
        title={
          <>
            See yourself
            <br className="hidden sm:block" /> <span className="text-brand-orange">the way others do.</span>
          </>
        }
        body="Collect feedback on one person from their peers, direct reports, their manager and people outside the company, any time of year, with no cycle required. The report shows the gap between how they see themselves and how others see them."
        points={[
          "Raters sorted into groups from the org chart, plus a self-assessment",
          "External raters answer by email, with no account needed",
          "Each anonymous group appears only once three people have answered",
          "Reminders go out on their own, with a last call the day before a request closes",
        ]}
        visual={<FeedbackDemo />}
        panel={PANEL_ROSE}
      />

      {/* ------------------------------------------------ 4. engagement surveys */}
      <Section
        id="surveys"
        eyebrow="Engagement surveys"
        title={
          <>
            Hear what people
            <br className="hidden sm:block" /> <span className="text-brand-orange">actually think.</span>
          </>
        }
        body="Anonymous surveys from templates: Team Engagement, Pulse and eNPS to measure, Manager Effectiveness, Wellbeing & Burnout, Belonging & Inclusion and Team Health Check to go deeper, or your own. Nothing shows for a group smaller than the minimum you set."
        points={[
          "Send to everyone, to departments or to specific people, now or later, weekly to quarterly",
          "Reminders only to people who haven't answered",
          "Engagement Index, eNPS, participation, drivers, focus areas and trends, with comments and Find themes with AI",
          "A heatmap by department, manager or tenure, exportable as CSV, and each manager's own team's results",
        ]}
        visual={<SurveyDemo />}
        flip
        panel={PANEL_STONE}
      />

      {/* ------------------------------------------------ 5. certifications */}
      <Section
        id="certifications"
        eyebrow="Certifications and trainings"
        title={
          <>
            Nobody on the job
            <br className="hidden sm:block" /> <span className="text-brand-orange">with an expired card.</span>
          </>
        }
        body="Track the licenses, safety cards and required trainings each person needs, and see who is current, expiring, expired or missing one. Start from a template for field safety, the office, healthcare, or drivers and fleet."
        points={[
          "Renewal periods, a warning window, who needs it, and a deadline for new hires",
          "Link a Training course and finishing it records the item on its own",
          "People add their own cards with a number or a photo, and an admin verifies them",
          "One row per person, one column per item, with a Needs attention switch, CSV export and Excel import",
        ]}
        visual={<CertsDemo />}
        panel={PANEL_ROSE}
      />

      {/* ------------------------------------------------ Multi AI (always last) */}
      <MultiAiWired
        heading="Your people, read by"
        swash="a head of people."
        intro="Multi AI can already see your reviews, surveys, candidates and certifications. Ask what needs attention and it answers from the records themselves, naming the team, the person and what to do next."
        leftLabel="What your team keeps in People HQ"
        leftColor={ROSE}
        leftIcon={RowsIcon}
        rightLabel="What Multi AI finds in it"
        prompt="Where should I spend my time with the team this month?"
        panelTitle="People HQ · Needs attention"
        panelMeta="4 areas"
        panelDot={ROSE}
        rows={AI_ROWS}
        insights={AI_INSIGHTS}
        aiMeta="reading 42 people"
        footer="Multi AI reads the same reviews, results and records your team already keeps. Nothing to export before you can ask."
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
