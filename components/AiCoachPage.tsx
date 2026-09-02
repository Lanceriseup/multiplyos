"use client";

// Feature page: AI Coach & Agent, which the product calls Multi AI.
//
// The framing problem this page has to solve, and it is a real one: the client
// says it replaces Claude and ChatGPT, while the product's own footer reads
// "Powered by Claude & GPT". So the page cannot argue it is better than either.
// What it argues instead is both true and stronger:
//
//     Your business brain. Gets smarter every day.
//
// You are not replacing the intelligence, you are replacing the copying and
// pasting, and the twenty minutes of context you type before every question.
// The hero used to say "Same models. They can just see your business.", which
// made the same point from the model's side; the September 2026 copy makes it
// from the customer's side instead, because what compounds is the context the
// AI has accumulated about your company, not the model underneath it.
//
//   2. two coaches    one tells you what to do, one tells you what you are missing
//   3. grounded       it names the record, counts the days, and does not flatter you
//   4. it builds      charts, dashboards, and calculators you can put on your site
//   5. memory         three tiers, private to you, never shared with teammates
//   6. everywhere     the one section that ties the other eleven features together
//
// This is the only feature page that does NOT end with MultiAiWired, because the
// whole page is Multi AI and the component would be arguing with itself.
//
// See docs/ai-coach-feature-notes.md. Two rules from it are load-bearing: Hubs
// and expert playbooks are visible or claimed but unexplained, so neither is on
// the page; and the company in the mockups is fictional, because the screenshots
// are Lance's own account with real overdue tasks in them.
import { motion } from "framer-motion";
import { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CTA from "./CTA";
import Reveal from "./Reveal";
import AiCoachHeroTour from "./AiCoachHeroTour";
import { ReplacesChip, REPLACES } from "./ReplacesStrip";
import { useDemo } from "./DemoModal";

// ---------------------------------------------------------------- tokens
const AI = "#4B3CC4"; // the feature's own tile colour, from the navbar
const ASSISTANT = "#4B57C4";
const COACH = "#1592AE";
const GREEN = "#1F7F4C";
const AMBER = "#C9832B";
const RED = "#C0402B";
const colTransition = { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const };

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

const Spark = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2}>
    <path d="M12 3l1.6 4L18 8.5 14 10l-2 4-2-4-4-1.5L10 7z" />
  </svg>
);
const Compass = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="12" cy="12" r="8.4" />
    <path d="M15.2 8.8l-1.8 4.6-4.6 1.8 1.8-4.6z" />
  </svg>
);
const Bot = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="4" y="7.4" width="16" height="11.2" rx="2.6" />
    <path d="M12 3.4v4M8.8 12.2v1.4M15.2 12.2v1.4" />
  </svg>
);
const Brain = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 5.2a2.8 2.8 0 0 0-5.3 1.3A2.8 2.8 0 0 0 5 11.4a2.8 2.8 0 0 0 1.9 4.8A2.8 2.8 0 0 0 12 18z" />
    <path d="M12 5.2a2.8 2.8 0 0 1 5.3 1.3A2.8 2.8 0 0 1 19 11.4a2.8 2.8 0 0 1-1.9 4.8A2.8 2.8 0 0 1 12 18z" />
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
const Lock = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="4.6" y="10.4" width="14.8" height="9.6" rx="2.2" />
    <path d="M8.4 10.4V7.8a3.6 3.6 0 0 1 7.2 0v2.6" />
  </svg>
);
const Board = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="3.4" y="4.4" width="17.2" height="15.2" rx="2.2" />
    <path d="M9.2 4.4v15.2M15 4.4v15.2" />
  </svg>
);
const Ledger = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="4.4" y="3.4" width="15.2" height="17.2" rx="2" />
    <path d="M8 8h8M8 12h8M8 16h4.4" />
  </svg>
);
const Chart = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M4 19.6h16" />
    <path d="M6.6 16.4V11M11.4 16.4V6.4M16.2 16.4v-7" />
  </svg>
);
const Book = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M4.4 5.4A2 2 0 0 1 6.4 3.4H19.6v14.4H6.4a2 2 0 0 0-2 2z" />
    <path d="M4.4 17.8a2 2 0 0 1 2-2h13.2" />
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
const Target = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="12" cy="12" r="8.4" />
    <circle cx="12" cy="12" r="4.6" />
    <circle cx="12" cy="12" r="1.2" />
  </svg>
);
const Globe = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="12" cy="12" r="8.4" />
    <path d="M3.6 12h16.8M12 3.6c2.2 2.4 3.4 5.3 3.4 8.4s-1.2 6-3.4 8.4c-2.2-2.4-3.4-5.3-3.4-8.4S9.8 6 12 3.6z" />
  </svg>
);

// ---------------------------------------------------------------- 2. two coaches
// Both prompt sets are verbatim from the product. They are the clearest evidence
// that the two coaches are genuinely different jobs.
const COACHES = {
  assistant: {
    name: "Multi AI Assistant",
    sub: "Your AI Assistant for day-to-day work",
    c: ASSISTANT,
    icon: Bot,
    job: "Asks what you should do",
    prompts: [
      "What should I focus on this week based on my assigned tasks?",
      "Draft a short status update to my manager on what I shipped this week.",
      "Which of my tasks are overdue or at risk, and what should I do first?",
      "Where can I find the SOP for onboarding a new client?",
    ],
    note: "Operational. It knows your tasks, your SOPs, and your week, and it will write the thing for you.",
  },
  coach: {
    name: "Strategic Coach",
    sub: "Ask me anything",
    c: COACH,
    icon: Compass,
    job: "Asks what you are missing",
    prompts: [
      "Based on my data, what are the top 3 things I should focus on this week?",
      "How can I produce more results in my role, for the company?",
      "Where does the business look like it needs the most support?",
      "What am I not seeing in my role that I should be paying attention to?",
    ],
    note: "Reflective. Two of its four opening questions are ones most people would rather not ask.",
  },
} as const;

type Which = keyof typeof COACHES;

function CoachDemo() {
  const [who, setWho] = useState<Which>("coach");
  const c = COACHES[who];
  const Icon = c.icon;

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${CARD_CLS}`}>
      <div className="grid flex-none grid-cols-2 gap-2 border-b border-[#F1EEE9] px-3.5 py-2.5">
        {(Object.keys(COACHES) as Which[]).map((k) => {
          const x = COACHES[k];
          const I = x.icon;
          const on = who === k;
          return (
            <button
              key={k}
              type="button"
              aria-pressed={on}
              onClick={() => setWho(k)}
              className="flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition-colors"
              style={
                on
                  ? { borderColor: `${x.c}66`, background: `${x.c}0F` }
                  : { borderColor: "#E6E2DB", background: "#fff" }
              }
            >
              <span
                className="grid h-[24px] w-[24px] flex-none place-items-center rounded-lg"
                style={on ? { background: x.c, color: "#fff" } : { background: "#F1EEE9", color: "#8A857D" }}
              >
                <I className="h-3 w-3" />
              </span>
              <span className="min-w-0">
                <span
                  className="block truncate text-[10.5px] font-bold leading-tight"
                  style={on ? { color: x.c } : undefined}
                >
                  {x.name}
                </span>
                <span className="block truncate text-[8.5px] text-brand-gray">{x.job}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div key={who} className="sop-view min-h-0 flex-1 space-y-1.5 overflow-hidden bg-[#FAF9F7] px-3.5 py-3">
        <p className="text-[8.5px] font-bold uppercase tracking-[0.12em] text-brand-gray">
          What it opens with
        </p>
        {c.prompts.map((p) => (
          <span key={p} className="flex items-center gap-2 rounded-lg border border-[#EDEAE4] bg-white px-2.5 py-[7px]">
            <Spark className="h-2.5 w-2.5 flex-none" style={{ color: c.c }} />
            <span className="min-w-0 flex-1 text-[10px] leading-snug text-brand-charcoal">{p}</span>
          </span>
        ))}
      </div>

      <p className="flex-none border-t border-[#F1EEE9] px-3.5 py-2 text-[10px] leading-snug text-brand-gray">
        <Icon className="mr-1 inline h-3 w-3" style={{ color: c.c }} />
        {c.note}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- 3. grounded
// Every figure is one another feature page already publishes. Notes section 6.
const ANSWERS = [
  {
    k: "support",
    q: "Where does the business need the most support?",
    lead: "Marketing, and it is not close. Cost per lead is the only Critical goal in the quarter, with zero of four milestones done and five weeks left.",
    rows: [
      { l: "Team size", v: "2 seats vs Sales' 3", from: "Org Chart", tone: RED },
      { l: "Spend growth", v: "+17.5% vs +8.4% revenue", from: "Finance HQ", tone: AMBER },
      { l: "Parent goal", v: "Second market, also Critical", from: "One Page Plan", tone: RED },
    ],
  },
  {
    k: "cash",
    q: "Can we afford to hire two more people this quarter?",
    lead: "Not comfortably. You booked a record $55,900 profit in July and your cash still fell $22,100, because $55,800 of it went into receivables.",
    rows: [
      { l: "Cash on hand", v: "$318,400", from: "Finance HQ", tone: AMBER },
      { l: "Over 60 days", v: "$68,400 owed to you", from: "Finance HQ", tone: RED },
      { l: "Runway", v: "7.4 months, down from 9.1", from: "Finance HQ", tone: AMBER },
    ],
  },
  {
    k: "week",
    q: "What should I focus on this week?",
    lead: "Two things, and only two. The Field Safety Lead seat has been open all quarter, and the turnaround goal needs its third clean week to come off At Risk.",
    rows: [
      { l: "Open seat", v: "Field Safety Lead, under you", from: "Org Chart", tone: RED },
      { l: "Turnaround", v: "6.8 days, first week under 7", from: "One Page Plan", tone: GREEN },
      { l: "Overdue", v: "2 tasks, 11 and 15 days", from: "Projects", tone: RED },
    ],
  },
];

function GroundedDemo() {
  const [sel, setSel] = useState(0);
  const a = ANSWERS[sel];

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${CARD_CLS}`}>
      <div className="flex-none border-b border-[#F1EEE9] px-3.5 py-2.5">
        <div className="scrollbar-none flex flex-nowrap gap-1 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-x-visible sm:pb-0">
          {ANSWERS.map((x, i) => (
            <button
              key={x.k}
              type="button"
              aria-pressed={sel === i}
              onClick={() => setSel(i)}
              className={`flex-none whitespace-nowrap rounded-full border px-2 py-1 text-[9px] capitalize transition-colors ${
                sel === i
                  ? "border-transparent font-semibold text-white"
                  : "border-[#E6E2DB] font-medium text-brand-charcoal hover:bg-[#FAF9F7]"
              }`}
              style={sel === i ? { background: AI } : undefined}
            >
              {x.k}
            </button>
          ))}
        </div>
      </div>

      <div key={a.k} className="sop-view min-h-0 flex-1 overflow-hidden px-3.5 py-3">
        <div className="flex justify-end">
          <p className="max-w-[85%] rounded-2xl rounded-br-md bg-[#F1EEE9] px-2.5 py-1.5 text-[10px] font-medium">
            {a.q}
          </p>
        </div>

        <div className="mt-2.5 flex gap-2">
          <span className="grid h-[20px] w-[20px] flex-none place-items-center rounded-lg text-white" style={{ background: COACH }}>
            <Compass className="h-2.5 w-2.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] leading-relaxed text-brand-charcoal">{a.lead}</p>

            <div className="mt-2 space-y-1">
              {a.rows.map((r) => (
                <div key={r.l} className="flex items-center gap-2 rounded-lg border border-[#EDEAE4] bg-[#FBFAF9] px-2 py-1.5">
                  <span className="h-[18px] w-[2.5px] flex-none rounded-full" style={{ background: r.tone }} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[9.5px] font-semibold leading-tight">{r.v}</span>
                    <span className="text-[8px] text-brand-gray">{r.l}</span>
                  </span>
                  <span className="flex-none rounded-full bg-[#F1EEE9] px-1.5 py-px text-[7.5px] font-semibold text-brand-charcoal">
                    {r.from}
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-[#F4F1EC] px-1.5 py-px font-mono text-[8px] text-brand-gray">
              Sonnet 4.6 <span className="text-[#C4BFB6]">&middot;</span> Anthropic
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 4. it builds
const TOOLS = [
  {
    k: "dash",
    label: "Scoreboard dashboard",
    ask: "Build me an interactive dashboard of our top scoreboard metrics",
    desc: "An internal report combining several charts: monthly revenue, a leads trend line, and goal progress.",
    who: "For your team",
  },
  {
    k: "roi",
    label: "ROI calculator",
    ask: "Make an ROI calculator I can put on our website",
    desc: "Prospects enter a few numbers and see their projected annual savings. A lead-gen widget you can embed.",
    who: "For your website",
  },
  {
    k: "export",
    label: "A spreadsheet",
    ask: "Export last quarter's expenses as a spreadsheet",
    desc: "PDF, Excel, or CSV, built from the same live data rather than from a copy somebody pasted.",
    who: "For your inbox",
  },
];

const REV = [96, 104, 112, 118, 121, 128];

function BuildDemo() {
  const [sel, setSel] = useState(0);
  const t = TOOLS[sel];

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${CARD_CLS}`}>
      <div className="flex-none border-b border-[#F1EEE9] px-3.5 py-2.5">
        <div className="grid grid-cols-3 gap-1.5">
          {TOOLS.map((x, i) => (
            <button
              key={x.k}
              type="button"
              aria-pressed={sel === i}
              onClick={() => setSel(i)}
              className={`rounded-lg border px-2 py-1.5 text-left transition-colors ${
                sel === i ? "border-transparent bg-[#F7F5F1]" : "border-[#E6E2DB] hover:bg-[#FAF9F7]"
              }`}
              style={sel === i ? { boxShadow: `inset 0 0 0 1.5px ${AI}55` } : undefined}
            >
              <span className="block truncate text-[9.5px] font-bold leading-tight">{x.label}</span>
              <span className="block truncate text-[8px] text-brand-gray">{x.who}</span>
            </button>
          ))}
        </div>
      </div>

      <div key={t.k} className="sop-view min-h-0 flex-1 overflow-hidden bg-[#FAF9F7] px-3.5 py-2.5">
        <p className="flex items-start gap-1.5 rounded-lg border border-[#EDEAE4] bg-white px-2 py-1.5 text-[9.5px] italic leading-snug text-brand-charcoal">
          <Spark className="mt-px h-2.5 w-2.5 flex-none" style={{ color: AI }} />
          &ldquo;{t.ask}&rdquo;
        </p>

        <div className="mt-2 rounded-xl border border-[#EDEAE4] bg-white p-2.5">
          {sel === 0 && (
            <>
              <p className="text-[10px] font-bold">Q3 Scoreboard</p>
              <p className="text-[8px] text-brand-gray">Revenue, leads, and goal progress</p>
              <p className="mt-1.5 text-[17px] font-extrabold leading-none tabular-nums">
                $128k
                <span className="ml-1 text-[9px] font-bold" style={{ color: GREEN }}>&#9650; 14%</span>
              </p>
              <div className="mt-1.5 flex h-[52px] items-end gap-1">
                {REV.map((v, i) => (
                  <span
                    key={v}
                    className="flex-1 rounded-t-[2px]"
                    style={{ height: `${(v / 140) * 100}%`, background: i === REV.length - 1 ? ASSISTANT : `${ASSISTANT}33` }}
                  />
                ))}
              </div>
            </>
          )}

          {sel === 1 && (
            <>
              <p className="text-[10px] font-bold">ROI &amp; Savings Calculator</p>
              <p className="text-[8px] text-brand-gray">See how much your team could save each year</p>
              <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                {[
                  { l: "Team members", v: "10" },
                  { l: "Hours saved / week", v: "5" },
                ].map((f) => (
                  <span key={f.l}>
                    <span className="block text-[7.5px] text-brand-gray">{f.l}</span>
                    <span className="mt-0.5 block rounded-md border border-[#E6E2DB] px-2 py-1 text-[10px] font-semibold">
                      {f.v}
                    </span>
                  </span>
                ))}
              </div>
              <p className="mt-1.5 rounded-lg px-2 py-1.5" style={{ background: `${GREEN}12` }}>
                <span className="block text-[7.5px] text-brand-gray">Projected annual saving</span>
                <span className="block text-[15px] font-extrabold leading-tight tabular-nums" style={{ color: GREEN }}>
                  $67,600
                </span>
              </p>
            </>
          )}

          {sel === 2 && (
            <>
              <p className="text-[10px] font-bold">Q2 expenses</p>
              <p className="text-[8px] text-brand-gray">expenses-q2-2026.xlsx</p>
              <table className="mt-1.5 w-full text-left">
                <thead>
                  <tr className="text-[7.5px] uppercase tracking-[0.08em] text-brand-gray">
                    <th className="py-1 font-bold">Account</th>
                    <th className="py-1 text-right font-bold">Apr</th>
                    <th className="py-1 text-right font-bold">May</th>
                    <th className="py-1 text-right font-bold">Jun</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Payroll", "94,200", "98,800", "101,400"],
                    ["Marketing", "29,600", "31,400", "33,100"],
                    ["Software", "11,200", "11,600", "11,900"],
                  ].map((r) => (
                    <tr key={r[0]} className="border-t border-[#F5F2ED]">
                      <td className="py-[3px] text-[9px] font-medium">{r[0]}</td>
                      {r.slice(1).map((v) => (
                        <td key={v} className="py-[3px] text-right font-mono text-[9px] tabular-nums text-brand-charcoal">
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        <p className="mt-2 text-[9.5px] leading-snug text-brand-charcoal">{t.desc}</p>
      </div>

      <p className="flex-none border-t border-[#F1EEE9] px-3.5 py-2 text-[10px] leading-snug text-brand-gray">
        Saved automatically. Open it, download it, share a link, or ask Multi to change it in chat.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- 5. memory
const TIERS = [
  {
    k: "primary",
    label: "Primary instructions",
    cap: "5,000 characters",
    body: "How you want to be answered, applied to every conversation with every coach.",
    example: "Always answer concisely. Show concrete numbers. Use plain English, not jargon. Never recommend anything that conflicts with our company values.",
  },
  {
    k: "shared",
    label: "Shared with every coach",
    cap: "up to 25 memories",
    body: "Durable facts: your role, your company, the kind of help you want, recurring context you should not have to repeat.",
    example: "I run Operations for a field-services company with four crews. Always show the calculation behind a number.",
  },
  {
    k: "each",
    label: "Memory for each coach",
    cap: "up to 8 each",
    body: "Facts only one coach sees, on top of everything above. Kept short on purpose so each coach stays fast.",
    example: "Strategic Coach only: do not soften bad news. I would rather hear it in the first sentence.",
  },
];

function MemoryDemo() {
  const [sel, setSel] = useState(1);
  const t = TIERS[sel];

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${CARD_CLS}`}>
      <div className="flex flex-none items-center gap-2 border-b border-[#F1EEE9] px-3.5 py-2.5">
        <span className="grid h-[24px] w-[24px] flex-none place-items-center rounded-lg" style={{ background: `${AI}14`, color: AI }}>
          <Brain className="h-3.5 w-3.5" />
        </span>
        <span className="min-w-0">
          <p className="text-[11.5px] font-bold leading-tight">Saved Memory</p>
          <p className="text-[8.5px] text-brand-gray">Saved only for your chats</p>
        </span>
      </div>

      <div className="flex-none space-y-1 px-3.5 py-2.5">
        {TIERS.map((x, i) => {
          const on = sel === i;
          return (
            <button
              key={x.k}
              type="button"
              aria-pressed={on}
              onClick={() => setSel(i)}
              className={`flex w-full items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left transition-colors ${
                on ? "border-transparent bg-[#F7F5F1]" : "border-[#E6E2DB] hover:bg-[#FAF9F7]"
              }`}
              style={on ? { boxShadow: `inset 0 0 0 1.5px ${AI}55` } : undefined}
            >
              <span
                className="grid h-[16px] w-[16px] flex-none place-items-center rounded-full text-[8px] font-bold"
                style={on ? { background: AI, color: "#fff" } : { background: "#F1EEE9", color: "#8A857D" }}
              >
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-[10px] font-semibold">{x.label}</span>
              <span className="flex-none font-mono text-[8px] text-brand-gray">{x.cap}</span>
            </button>
          );
        })}
      </div>

      <div key={t.k} className="sop-view min-h-0 flex-1 overflow-hidden bg-[#FAF9F7] px-3.5 py-2.5">
        <p className="text-[10px] leading-snug text-brand-charcoal">{t.body}</p>
        <p className="mt-2 rounded-lg border border-[#EDEAE4] bg-white px-2.5 py-2 text-[10px] italic leading-relaxed text-brand-charcoal">
          {t.example}
        </p>
      </div>

      <p className="flex-none border-t border-[#F1EEE9] px-3.5 py-2 text-[10px] leading-snug text-brand-gray">
        <Lock className="mr-1 inline h-3 w-3" style={{ color: GREEN }} />
        Memories are private to you and never shared with teammates.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- 6. everywhere
// This page's closer, in place of MultiAiWired. It is the section that ties the
// other eleven features together, which only this page can do.
const REACH = [
  { icon: Chart, label: "Metrics Scoreboard", c: "#EA7B1B", t: "13 weeks of every board, 3 years for a single metric, and it can log this week's number for you." },
  { icon: Ledger, label: "Finance HQ", c: "#A16207", t: "P&L, margin, balance sheet, and cash flow, for the people whose permissions include it." },
  { icon: Book, label: "SOP HQ", c: "#7A4E28", t: "Finds the process, walks you through it, and offers to draft one when it does not exist yet." },
  { icon: Board, label: "Projects & Tasks", c: "#5B47A8", t: "What is assigned to you, what is overdue, and how many days late it actually is." },
  { icon: Target, label: "One Page Plan", c: "#B4532A", t: "Goals at every level, their owners, their status, and the weekly updates written against them." },
  { icon: Tree, label: "Org Chart", c: "#3F7A6B", t: "Who owns what, which seats are empty, and DISC profiles to help you pitch it to them." },
];

function ReachSection() {
  return (
    <section
      id="everywhere"
      className="relative overflow-hidden border-y border-[#EDE7DD] bg-[#FBFAF8] px-5 py-12 scroll-mt-24 sm:border-[#E7E0F7] sm:bg-[#FBFAFE] sm:px-8 sm:py-24"
    >
      <span className="pointer-events-none absolute -top-[120px] left-[2%] h-[340px] w-[400px] rounded-full bg-[rgba(234,123,27,0.30)] blur-[52px] sm:bg-[rgba(122,102,232,0.36)]" />
      <span className="pointer-events-none absolute -top-[70px] right-[4%] h-[300px] w-[320px] rounded-full bg-[rgba(232,163,61,0.28)] blur-[52px] sm:bg-[rgba(234,123,27,0.26)]" />
      <span className="pointer-events-none absolute -bottom-[190px] left-[34%] h-[320px] w-[460px] rounded-full bg-[rgba(201,101,15,0.18)] blur-[52px] sm:bg-[rgba(75,60,196,0.2)]" />

      <div className="relative mx-auto max-w-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={colTransition}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="mb-4 text-[13px] font-bold uppercase tracking-[0.14em] text-brand-orange-dark">
            What it can see
          </p>
          <h2 className="text-[26px] font-extrabold leading-[1.1] tracking-tight text-brand-ink sm:text-[42px] sm:leading-[1.06]">
            This is the part a chat window{" "}
            <span className="relative whitespace-nowrap">
              cannot do.
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
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-brand-charcoal sm:mt-6 sm:text-lg">
            Multi AI sits inside the same system as your numbers, your processes, your plan, and your
            people. Every other feature in Multiply OS is something it can read, which is why its
            answers name records instead of describing them in general terms.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ ...colTransition, delay: 0.1 }}
          className="mt-10 grid gap-2.5 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3"
        >
          {REACH.map((r) => {
            const Icon = r.icon;
            return (
              <div
                key={r.label}
                className="rounded-xl border border-white/90 bg-white/[0.84] p-3.5 shadow-[0_14px_34px_-22px_rgba(30,20,70,0.42)] backdrop-blur-[10px]"
              >
                <p className="flex items-center gap-2">
                  <span
                    className="grid h-[26px] w-[26px] flex-none place-items-center rounded-lg text-white"
                    style={{ background: r.c }}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0 truncate text-[12.5px] font-bold">{r.label}</span>
                </p>
                <p className="mt-2 text-[12px] leading-relaxed text-brand-charcoal">{r.t}</p>
              </div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ ...colTransition, delay: 0.16 }}
          className="mx-auto mt-6 max-w-3xl rounded-xl border border-white/90 bg-white/[0.84] p-4 shadow-[0_14px_34px_-22px_rgba(30,20,70,0.42)] backdrop-blur-[10px] sm:mt-8"
        >
          <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[12px] text-brand-charcoal">
            <span className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" style={{ color: AI }} />
              It searches the web and reads a URL you give it
            </span>
            <span className="flex items-center gap-1.5">
              <Spark className="h-3.5 w-3.5" style={{ color: AI }} />
              And it still answers any ordinary question you would ask an assistant
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- section shell
function Section({
  id,
  eyebrow,
  title,
  swash,
  body,
  body2,
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
  // An optional second paragraph. Only the two-coaches section uses it: that one
  // has to describe two different things, and running them together in one block
  // made the split the section exists to draw invisible.
  body2?: string;
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
          {body2 && (
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-brand-charcoal sm:mt-4 sm:text-lg lg:mx-0">
              {body2}
            </p>
          )}
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
export default function AiCoachPage() {
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
              <span className="grid h-[21px] w-[21px] flex-none place-items-center rounded-lg bg-gradient-to-br from-[#6C5CE0] to-[#3B2EA6] text-white shadow-[0_2px_6px_rgba(59,46,166,0.34),inset_0_1px_0_rgba(255,255,255,0.34)] sm:h-[34px] sm:w-[34px] sm:rounded-[11px]">
                <Spark className="h-[14px] w-[14px] sm:h-[19px] sm:w-[19px]" />
              </span>
              <span className="text-[11.5px] font-[650] tracking-[0.02em] text-[#33302C] sm:text-[16.5px]">
                AI Coach &amp; Agent
              </span>
            </span>
            <h1 className="text-[24px] font-extrabold leading-[1.1] tracking-tight text-brand-ink sm:text-[66px] sm:leading-[1.04]">
              Your business brain.
              <br />
              <span className="text-brand-orange">Gets smarter every day.</span>
            </h1>
            <p className="mx-auto mt-3.5 max-w-2xl text-[14.5px] leading-relaxed text-brand-charcoal sm:mt-7 sm:text-xl">
              <span className="sm:hidden">
                The AI learns your business as you use it. Better insights, smarter advice, zero
                reprompting.
              </span>
              <span className="hidden sm:inline">
                The AI learns your business as you use it. Better insights, smarter advice, zero
                reprompting. The more you work in Multiply OS, the more aligned the coaching
                becomes.
              </span>
            </p>
          </Reveal>

          <Reveal delay={0.12} className="mt-6 sm:mt-12">
            {/* The chip goes in a relative wrapper alongside the panel rather
                than inside it: the panel clips to its rounded corners, and from
                sm up the claim has to hang over its top edge. On a phone it sits
                in normal flow above the panel instead. See ReplacesChip. */}
            <div className="relative">
              <ReplacesChip names={REPLACES.aiCoach} />
              <div
                className="overflow-hidden rounded-2xl p-2 sm:rounded-[30px] sm:p-8"
                style={{ background: "linear-gradient(160deg, #EFEDFA, #E1DDF5)" }}
              >
                <AiCoachHeroTour />
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

      {/* ------------------------------------------------ 2. two coaches */}
      <Section
        id="coaches"
        eyebrow="Two AI Coaches"
        title="Operational clarity and strategic insight,"
        swash="in one place."
        body="Your Multi AI Assistant drafts your weekly update, finds your overdue tasks and writes the SOPs you keep forgetting. It handles the operational noise so you can focus on what matters."
        body2="Your Strategic Coach reads your business, asks the hard questions and spots patterns you are missing: the margin leak, the capacity bottleneck, the customer trend that is shifting. It keeps you honest and points at what you are not seeing."
        points={[
          "The Assistant drafts, finds, and clears your week",
          "The Coach reads the business and tells you what you are not seeing",
          "Each keeps its own chat history and its own memory",
        ]}
        visual={<CoachDemo />}
        panel="linear-gradient(160deg, #F3F0FA, #E9E4F6)"
      />

      {/* ------------------------------------------------ 3. grounded */}
      <Section
        id="grounded"
        eyebrow="It's already read the file"
        title="Answers you can"
        swash="actually act on."
        body="Ask a generic AI why your margin fell and it explains what margin is. Ask the Strategic Coach and it tells you which account moved, by how much, who owns it, and how long it has been true. You get the specific answer, not the textbook answer."
        points={[
          "Cites the actual figure, the actual owner, and the actual date",
          "Pulls from several features at once to answer one question",
          "Tells you the answer you did not want, in the first sentence",
        ]}
        visual={<GroundedDemo />}
        flip
        panel="linear-gradient(160deg, #EEF4FB, #E2ECF8)"
      />

      {/* ------------------------------------------------ 4. it builds */}
      <Section
        id="builds"
        eyebrow="Ask, and it builds"
        title="It does not just describe your data. It"
        swash="draws it."
        body="Ask for a chart and you get one, built from live figures rather than a screenshot somebody pasted. Ask for a dashboard, a calculator, or a spreadsheet and you get that too, saved automatically, downloadable, and shareable with a link."
        points={[
          "Charts and dashboards from your live numbers",
          "Calculators you can embed on your own website for lead capture",
          "PDF, Excel, and CSV exports, or ask it to change the thing in chat",
        ]}
        visual={<BuildDemo />}
        panel="linear-gradient(160deg, #FFF7EA, #FDECD4)"
      />

      {/* ------------------------------------------------ 5. memory */}
      <Section
        id="memory"
        eyebrow="Memory"
        title="Stop explaining yourself at the top of"
        swash="every chat."
        body="Tell it once how you want to be answered and it holds onto that. Three tiers: instructions for everything, durable facts shared across coaches, and a short private list for each coach on its own. All of it visible, all of it editable, none of it shared with your team."
        points={[
          "Primary instructions applied to every conversation",
          "Up to 25 shared facts, plus 8 more for each coach",
          "Private to you, and never shared with teammates",
        ]}
        visual={<MemoryDemo />}
        flip
        panel="linear-gradient(160deg, #EEF6F2, #E1EFE8)"
      />

      {/* ------------------------------------------------ 6. everywhere (the closer) */}
      <ReachSection />

      <CTA />
      <Footer />
    </main>
  );
}
