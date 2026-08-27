"use client";

// Feature page: Org Chart.
//
// The product's own subtitle does most of the positioning:
//
//     "Drag roles to reorganize. Hover to see outcomes and add child roles."
//
// That is not a directory. It is a chart you edit, where each box is a seat that
// owns outcomes. The distinction the page is built on comes from the product's
// own add-flow, which asks you to choose between adding a PERSON and adding a
// ROLE: a seat exists whether or not somebody is sitting in it.
//
//   2. the chart      the whole company, one screen, drag to reorganise
//   3. adding         person or seat, then details, then permissions
//   4. seats          role and person are different things, and empty is fine
//   5. the list       the same org as rows, when you need to read rather than look
//   6. DISC           one switch, and you can see how the team is wired
//
// The client's one hard instruction: NO person-detail view anywhere on this page.
// "That is too much info." Every mockup here stops at the card.
//
// See docs/org-chart-feature-notes.md. Three rules from it are load-bearing:
//
//   1. The list view has not been screenshotted. Section 4 shows only the fields
//      the cards already carry, and claims nothing about sorting or filtering.
//   2. Current/Future has never been switched to Future, so the page says the
//      toggle exists and nothing about what is behind it.
//   3. The company is fictional. The screenshots are Rise Up Kings's real org and
//      none of those names or reporting lines are on the public site.
import { motion } from "framer-motion";
import { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CTA from "./CTA";
import Reveal from "./Reveal";
import OrgChartHeroTour from "./OrgChartHeroTour";
import { ReplacesChip, REPLACES } from "./ReplacesStrip";
import MultiAiWired from "./MultiAiWired";
import type { Row, Insight } from "./MultiAiWired";
import { useDemo } from "./DemoModal";

// ---------------------------------------------------------------- tokens
const TEAL = "#3F7A6B"; // the feature's own tile colour, from the navbar
const GREEN = "#1F7F4C";
const AMBER = "#C9832B";
const RED = "#C0402B";
const colTransition = { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const };

// Written out in full because Tailwind scans source for literal class names.
const CARD_CLS = "h-[380px] sm:h-[430px]";

// Straight off the legend in the screenshot. What each letter means belongs on
// the DISC Assessments page, which has not been built yet.
const DISC = {
  D: { label: "Dominance", c: "#D6453C" },
  I: { label: "Influence", c: "#D69A28" },
  S: { label: "Steadiness", c: "#2BA463" },
  C: { label: "Compliance", c: "#2C6BA6" },
} as const;
type Disc = keyof typeof DISC;

const DEPTS: Record<string, string> = {
  Operations: "#B4532A",
  Sales: "#2C6BA6",
  Marketing: "#2E7D5B",
  Technology: "#5B47A8",
};

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

const Tree = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="9" y="3.4" width="6" height="4.4" rx="1.2" />
    <rect x="3" y="16.2" width="6" height="4.4" rx="1.2" />
    <rect x="15" y="16.2" width="6" height="4.4" rx="1.2" />
    <path d="M12 7.8v4.4M6 16.2v-4h12v4" />
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
const Target = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="12" cy="12" r="8.4" />
    <circle cx="12" cy="12" r="4.6" />
    <circle cx="12" cy="12" r="1.2" />
  </svg>
);
const Search = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="10.8" cy="10.8" r="6.4" />
    <path d="M15.6 15.6l4.4 4.4" />
  </svg>
);
const ListIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M4 6.6h16M4 12h16M4 17.4h16" />
  </svg>
);
const RowsIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.2" />
    <path d="M3.5 9.5h17M3.5 14.5h17" />
  </svg>
);

// ---------------------------------------------------------------- the org
// Fictional company, consistent with the other feature pages. Notes section 5.
type Person = {
  role: string;
  who: string | null;
  init: string;
  dept: keyof typeof DEPTS;
  to: string;
  reports: number;
  outcomes: number;
  disc: [Disc, Disc] | null;
  type: "Full-Time" | "Part-Time" | "FT Contractor" | "PT Contractor";
};

const ORG: Person[] = [
  { role: "CEO", who: "Skylar Lewis", init: "SL", dept: "Operations", to: "None (top-level)", reports: 3, outcomes: 4, disc: ["I", "D"], type: "Full-Time" },
  { role: "COO", who: "Dana Whitfield", init: "DW", dept: "Operations", to: "CEO", reports: 3, outcomes: 3, disc: ["C", "S"], type: "Full-Time" },
  { role: "Operations Manager", who: "Marcus Hale", init: "MH", dept: "Operations", to: "COO", reports: 2, outcomes: 3, disc: ["S", "C"], type: "Full-Time" },
  { role: "Technology Lead", who: "Kath Nakamura", init: "KN", dept: "Technology", to: "COO", reports: 1, outcomes: 1, disc: ["C", "D"], type: "Full-Time" },
  { role: "Field Safety Lead", who: null, init: "", dept: "Operations", to: "COO", reports: 0, outcomes: 0, disc: null, type: "Full-Time" },
  { role: "VP Sales", who: "Jordan Rivera", init: "JR", dept: "Sales", to: "CEO", reports: 2, outcomes: 2, disc: ["I", "D"], type: "Full-Time" },
  { role: "Account Executive", who: "Sam Okafor", init: "SO", dept: "Sales", to: "VP Sales", reports: 0, outcomes: 1, disc: null, type: "Full-Time" },
  { role: "Second Market Manager", who: null, init: "", dept: "Sales", to: "VP Sales", reports: 0, outcomes: 0, disc: null, type: "Full-Time" },
  { role: "Marketing Lead", who: "Priya Nair", init: "PN", dept: "Marketing", to: "CEO", reports: 1, outcomes: 2, disc: ["I", "S"], type: "Full-Time" },
  { role: "Content Lead", who: "Nina Petrova", init: "NP", dept: "Marketing", to: "Marketing Lead", reports: 0, outcomes: 1, disc: ["S", "I"], type: "Part-Time" },
];

function Badge({ p, disc }: { p: Person; disc: boolean }) {
  if (!disc || !p.who) return null;
  if (!p.disc) {
    return (
      <span className="grid h-[13px] w-[18px] flex-none place-items-center rounded-full bg-[#EDEAE4] text-[8px] font-bold text-brand-gray">
        &ndash;
      </span>
    );
  }
  const [a, b] = p.disc;
  return (
    <span className="flex-none rounded-full px-1 py-px text-[8px] font-bold text-white" style={{ background: DISC[a].c }}>
      {a}/{b}
    </span>
  );
}

// ---------------------------------------------------------------- 2. the chart
const LINE = "#DCD7CE";

function MiniCard({ p, root, dim }: { p: Person; root?: boolean; dim?: boolean }) {
  const dept = DEPTS[p.dept];
  return (
    <div
      className="rounded-lg border bg-white px-2 py-1.5 transition-opacity duration-300"
      style={{
        borderColor: "#EBE7E0",
        borderLeft: root ? "3px solid #EA7B1B" : undefined,
        opacity: dim ? 0.32 : 1,
      }}
    >
      <p className="truncate text-[9px] font-bold leading-tight">{p.role}</p>
      <p className="mt-0.5 flex items-center gap-1">
        {p.who ? (
          <>
            <span className="grid h-[13px] w-[13px] flex-none place-items-center rounded-full bg-[#F1EEE9] text-[6px] font-bold text-brand-charcoal">
              {p.init}
            </span>
            <span className="min-w-0 flex-1 truncate text-[8px] text-brand-charcoal">{p.who}</span>
          </>
        ) : (
          <>
            <span className="h-[13px] w-[13px] flex-none rounded-full bg-[#E6E2DB]" />
            <span className="min-w-0 flex-1 truncate text-[8px] font-semibold uppercase text-brand-gray">
              Open seat
            </span>
          </>
        )}
      </p>
      <p className="mt-0.5">
        <span className="rounded-full px-1 py-px text-[7px] font-semibold" style={{ background: `${dept}1A`, color: dept }}>
          {p.dept}
        </span>
      </p>
    </div>
  );
}

// Chart geometry. Every connector is derived from these numbers rather than
// eyeballed, so a rule can never stop short of a card or run past one.
const CW = 118; // card width
const CG = 8; // gap between siblings
const STUB = 11; // the vertical drop above and below a sibling rule

// The three managers, and who hangs off each.
const BRANCHES = [
  { parent: ORG[1], kids: [ORG[2], ORG[3], ORG[4]] }, // COO
  { parent: ORG[5], kids: [ORG[6], ORG[7]] }, // VP Sales
  { parent: ORG[8], kids: [ORG[9]] }, // Marketing Lead
];

// A sibling rule runs centre-to-centre, extended to reach the parent when the
// parent sits outside its children's span. Both ends are always card centres.
function Connectors({ centres, parentX }: { centres: number[]; parentX: number }) {
  const l = Math.min(parentX, ...centres);
  const r = Math.max(parentX, ...centres);
  return (
    <div className="relative" style={{ height: STUB * 2 }}>
      <span className="absolute w-px" style={{ left: parentX, top: 0, height: STUB, background: LINE }} />
      {r > l && (
        <span className="absolute h-px" style={{ left: l, width: r - l, top: STUB, background: LINE }} />
      )}
      {centres.map((c) => (
        <span key={c} className="absolute w-px" style={{ left: c, top: STUB, height: STUB, background: LINE }} />
      ))}
    </div>
  );
}

function ChartDemo() {
  const [open, setOpen] = useState(0);
  const branch = BRANCHES[open];

  const rowW = 3 * CW + 2 * CG; // the widest row, so the tree never shifts sideways
  const l2Centres = BRANCHES.map((_, i) => i * (CW + CG) + CW / 2);

  const kidRowW = branch.kids.length * CW + (branch.kids.length - 1) * CG;
  const kidStart = (rowW - kidRowW) / 2;
  const kidCentres = branch.kids.map((_, j) => kidStart + j * (CW + CG) + CW / 2);

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${CARD_CLS}`}>
      <div className="flex-none border-b border-[#F1EEE9] px-3.5 py-2.5">
        <p className="mb-1.5 text-[9.5px] text-brand-gray">Open a manager to see who reports to them</p>
        <div className="scrollbar-none flex flex-nowrap gap-1 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-x-visible sm:pb-0">
          {BRANCHES.map((b, i) => {
            const on = open === i;
            return (
              <button
                key={b.parent.role}
                type="button"
                aria-pressed={on}
                onClick={() => setOpen(i)}
                className={`flex-none whitespace-nowrap rounded-full border px-2 py-1 text-[9px] transition-colors ${
                  on ? "border-transparent font-semibold text-white" : "border-[#E6E2DB] font-medium text-brand-charcoal hover:bg-[#FAF9F7]"
                }`}
                style={on ? { background: DEPTS[b.parent.dept] } : undefined}
              >
                {b.parent.role}
                <span className={on ? "opacity-70" : "text-brand-gray"}> &middot; {b.kids.length}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden bg-[#FAF9F7] px-3 py-3">
        <div className="mx-auto" style={{ width: rowW }}>
          <div style={{ marginLeft: (rowW - CW) / 2, width: CW }}>
            <MiniCard p={ORG[0]} root />
          </div>

          <Connectors centres={l2Centres} parentX={rowW / 2} />

          <div className="flex" style={{ gap: CG }}>
            {BRANCHES.map((b, i) => (
              <div key={b.parent.role} style={{ width: CW }}>
                <MiniCard p={b.parent} dim={open !== i} />
              </div>
            ))}
          </div>

          <Connectors centres={kidCentres} parentX={l2Centres[open]} />

          <div className="flex justify-center" style={{ gap: CG }}>
            {branch.kids.map((p) => (
              <div key={p.role} style={{ width: CW }}>
                <MiniCard p={p} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="flex-none border-t border-[#F1EEE9] px-3.5 py-2 text-[10px] leading-snug text-brand-gray">
        Drag a card to a new manager and the reporting line moves with it.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- 3. adding somebody
// The product's own chooser is the interesting part: it makes you say whether
// you are adding a PERSON or a SEAT before it asks you anything else.
const STEPS = [
  {
    k: "who",
    tab: "Person or seat",
    head: "What are you adding?",
    sub: "Pick a starting point. You can rearrange later.",
  },
  {
    k: "info",
    tab: "Their details",
    head: "Add team member",
    sub: "Fill in their info, then choose how to get them into the system at the bottom.",
  },
  {
    k: "access",
    tab: "What they can reach",
    head: "Account access",
    sub: "Permissions are separate from where they sit on the chart.",
  },
];

const FIELDS = [
  { l: "First name", v: "Theo", req: true },
  { l: "Last name", v: "Barnes", req: false },
  { l: "Email", v: "theo@ridgeline.co", req: true },
  { l: "Title", v: "Demand Gen Lead", req: true },
  { l: "Department", v: "Marketing", req: false },
  { l: "Reports To", v: "Marketing Lead", req: true },
];

const TOGGLES = [
  {
    l: "Company Admin",
    on: false,
    note: "Company settings, billing, the audit log, and editing this chart. It does not put them on the Leadership Team, because goals and leadership meetings follow the role.",
  },
  { l: "One Page Plan Access", on: true, note: "Whether they can see the company plan and the goals on it." },
  { l: "Allow this user to use Multi", on: true, note: "Off hides the AI coach from their sidebar entirely." },
];

function AddDemo() {
  const [step, setStep] = useState(0);

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${CARD_CLS}`}>
      <div className="flex-none border-b border-[#F1EEE9] px-3.5 py-2.5">
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <button
              key={s.k}
              type="button"
              aria-pressed={step === i}
              onClick={() => setStep(i)}
              className={`flex flex-1 items-center gap-1.5 rounded-lg px-2 py-1.5 text-left transition-colors ${
                step === i ? "bg-[#F7F5F1]" : "hover:bg-[#FAF9F7]"
              }`}
              style={step === i ? { boxShadow: `inset 0 0 0 1.5px ${TEAL}55` } : undefined}
            >
              <span
                className="grid h-[16px] w-[16px] flex-none place-items-center rounded-full text-[8px] font-bold"
                style={step >= i ? { background: TEAL, color: "#fff" } : { background: "#F1EEE9", color: "#8A857D" }}
              >
                {i + 1}
              </span>
              <span className="min-w-0 truncate text-[9px] font-semibold">{s.tab}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-[#FAF9F7] px-3.5 py-3">
        <p className="text-[12px] font-bold leading-tight">{STEPS[step].head}</p>
        <p className="mt-0.5 text-[9.5px] leading-snug text-brand-charcoal">{STEPS[step].sub}</p>

        {step === 0 && (
          <div className="mt-2.5 space-y-2">
            <div className="rounded-lg border bg-white px-2.5 py-2" style={{ borderColor: `${TEAL}55` }}>
              <p className="text-[10.5px] font-bold">New User + Role</p>
              <p className="mt-0.5 text-[9px] leading-snug text-brand-charcoal">
                Bring a teammate in and place them on the chart. Pick who they report to, and invite
                by email or add their account directly.
              </p>
            </div>
            <div className="rounded-lg border border-[#E6E2DB] bg-white px-2.5 py-2">
              <p className="text-[10.5px] font-bold">New role</p>
              <p className="mt-0.5 text-[9px] leading-snug text-brand-charcoal">
                Add a seat to the chart, assignable to a teammate now or later. Pick where it sits
                when you create it.
              </p>
            </div>
            <p className="text-[9.5px] leading-snug text-brand-gray">
              Two different things, and the product makes you say which. That is why an empty seat is
              a normal state rather than a bug.
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="mt-2.5 grid grid-cols-2 gap-1.5">
            {FIELDS.map((f) => (
              <span key={f.l} className={f.l === "Email" || f.l === "Reports To" ? "col-span-2" : ""}>
                <span className="block text-[8px] font-bold uppercase tracking-[0.1em] text-brand-gray">
                  {f.l}
                  {f.req && <span style={{ color: RED }}> *</span>}
                </span>
                <span className="mt-0.5 block truncate rounded-md border border-[#E6E2DB] bg-white px-2 py-1 text-[10px] font-medium">
                  {f.v}
                </span>
              </span>
            ))}
            <p className="col-span-2 text-[9px] text-brand-gray">
              Reports To is required, and it is the field that decides where the new card lands.
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="mt-2.5 space-y-1.5">
            {TOGGLES.map((t) => (
              <div key={t.l} className="rounded-lg border border-[#E6E2DB] bg-white px-2.5 py-2">
                <p className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 text-[10.5px] font-bold">{t.l}</span>
                  <span
                    className="flex h-[14px] w-[24px] flex-none items-center rounded-full px-px"
                    style={{ background: t.on ? TEAL : "#D5D0C7", justifyContent: t.on ? "flex-end" : "flex-start" }}
                  >
                    <span className="h-[12px] w-[12px] rounded-full bg-white" />
                  </span>
                </p>
                <p className="mt-0.5 text-[9px] leading-snug text-brand-charcoal">{t.note}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="flex-none border-t border-[#F1EEE9] px-3.5 py-2 text-[10px] leading-snug text-brand-gray">
        {step === 2
          ? "Admin rights and a seat on the chart are two separate questions."
          : "Invite by email or create the account outright, with a password you set or one generated for you."}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- 4. seats
const EMPLOYMENT = ["Full-Time", "Part-Time", "FT Contractor", "PT Contractor"] as const;

function SeatDemo() {
  const [filled, setFilled] = useState(false);

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${CARD_CLS}`}>
      <div className="flex flex-none items-center gap-1 border-b border-[#F1EEE9] px-3.5 py-2.5">
        <span className="flex items-center gap-0.5 rounded-lg bg-[#F1EEE9] p-0.5">
          {([
            { k: false, l: "Open seat" },
            { k: true, l: "Somebody in it" },
          ] as const).map(({ k, l }) => (
            <button
              key={l}
              type="button"
              aria-pressed={filled === k}
              onClick={() => setFilled(k)}
              className={`whitespace-nowrap rounded-[7px] px-2.5 py-[5px] text-[10px] transition-colors ${
                filled === k ? "bg-brand-ink font-semibold text-white" : "font-medium text-brand-charcoal"
              }`}
            >
              {l}
            </button>
          ))}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-center bg-[#FAF9F7] px-4 py-3">
        <div className="mx-auto w-full max-w-[230px] rounded-xl border border-[#EBE7E0] bg-white p-3 shadow-[0_6px_18px_-12px_rgba(40,30,15,0.4)]">
          <p className="text-[12px] font-bold leading-tight">Second Market Manager</p>

          <p className="mt-2 flex items-center gap-2">
            {filled ? (
              <>
                <span className="grid h-[22px] w-[22px] flex-none place-items-center rounded-full bg-[#F1EEE9] text-[8px] font-bold text-brand-charcoal">
                  RD
                </span>
                <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-brand-charcoal">
                  Rosa Delgado
                </span>
              </>
            ) : (
              <>
                <span className="h-[22px] w-[22px] flex-none rounded-full bg-[#E6E2DB]" />
                <span className="min-w-0 flex-1 truncate text-[11px] font-semibold uppercase tracking-[0.04em] text-brand-gray">
                  Unassigned
                </span>
              </>
            )}
          </p>

          <p className="mt-2 flex flex-wrap items-center gap-1">
            <span className="rounded-full px-1.5 py-px text-[8.5px] font-semibold" style={{ background: `${DEPTS.Sales}1A`, color: DEPTS.Sales }}>
              Sales
            </span>
            <span className="rounded-full bg-[#F1EEE9] px-1.5 py-px text-[8.5px] font-semibold text-brand-charcoal">
              Full-Time
            </span>
          </p>

          <p className="mt-2 border-t border-[#F5F2ED] pt-2 text-[9px] text-brand-charcoal">
            <span className="font-semibold">Reports to</span> VP Sales
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-[9px] text-brand-charcoal">
            <Target className="h-2.5 w-2.5 flex-none" style={{ color: AMBER }} />
            {filled ? "Annual Outcomes (2)" : "Annual Outcomes (2), waiting on somebody"}
          </p>
        </div>

        <p className="mx-auto mt-3 max-w-[280px] text-center text-[10px] leading-relaxed text-brand-charcoal">
          {filled
            ? "Same seat, same outcomes, same reporting line. Only the name changed."
            : "The seat exists, it sits under VP Sales, and it already owns two outcomes. Nobody is in it yet."}
        </p>

        <div className="mt-3 flex flex-wrap justify-center gap-1">
          {EMPLOYMENT.map((e) => (
            <span
              key={e}
              className={`rounded-full border px-2 py-[3px] text-[8.5px] ${
                e === "Full-Time"
                  ? "border-brand-orange/50 bg-[#FFF6EC] font-semibold text-brand-orange-dark"
                  : "border-[#E6E2DB] font-medium text-brand-gray"
              }`}
            >
              {e}
            </span>
          ))}
        </div>
      </div>

      <p className="flex-none border-t border-[#F1EEE9] px-3.5 py-2 text-[10px] leading-snug text-brand-gray">
        Add a person, or add a seat and fill it later. The chart does not mind which order.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- 4. the list
function ListDemo() {
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const rows = term
    ? ORG.filter((p) => `${p.role} ${p.who ?? "open seat"} ${p.dept}`.toLowerCase().includes(term))
    : ORG;
  const open = rows.filter((p) => !p.who).length;

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${CARD_CLS}`}>
      <div className="flex flex-none items-center gap-2 border-b border-[#F1EEE9] px-3.5 py-2.5">
        <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#E6E2DB] bg-[#FAF9F7] px-2.5 py-1.5 focus-within:border-brand-orange/60 focus-within:bg-white">
          <Search className="h-3.5 w-3.5 flex-none text-brand-gray" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search people, roles, departments"
            aria-label="Search the org"
            className="min-w-0 flex-1 bg-transparent text-[11px] font-medium outline-none placeholder:font-normal placeholder:text-brand-gray"
          />
        </label>
        <span className="flex flex-none items-center gap-0.5 rounded-lg border border-[#E6E2DB] p-0.5">
          <span className="grid h-[20px] w-[20px] place-items-center rounded-[6px] text-brand-gray">
            <Tree className="h-3 w-3" />
          </span>
          <span className="grid h-[20px] w-[20px] place-items-center rounded-[6px] bg-brand-orange text-white">
            <ListIcon className="h-3 w-3" />
          </span>
        </span>
      </div>

      {/* Clipped, not scrolled: a scrollbar inside a mockup reads as a rendering
          fault rather than a control, and the count in the footer already says
          how many rows there are. */}
      <div className="min-h-0 flex-1 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#FAF9F7] text-[8px] uppercase tracking-[0.1em] text-brand-gray">
              <th className="px-3 py-1.5 font-bold">Role</th>
              <th className="px-3 py-1.5 font-bold">Person</th>
              <th className="px-3 py-1.5 font-bold">Reports to</th>
              <th className="px-3 py-1.5 text-center font-bold">Reports</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const dept = DEPTS[p.dept];
              return (
                <tr key={p.role} className="border-t border-[#F5F2ED]">
                  <td className="px-3 py-[7px]">
                    <span className="block truncate text-[10px] font-semibold leading-tight">{p.role}</span>
                    <span className="mt-px inline-block rounded-full px-1.5 py-px text-[7.5px] font-semibold" style={{ background: `${dept}1A`, color: dept }}>
                      {p.dept}
                    </span>
                  </td>
                  <td className="px-3 py-[7px]">
                    {p.who ? (
                      <span className="flex items-center gap-1.5">
                        <span className="grid h-[16px] w-[16px] flex-none place-items-center rounded-full bg-[#F1EEE9] text-[7px] font-bold text-brand-charcoal">
                          {p.init}
                        </span>
                        <span className="truncate text-[10px] text-brand-charcoal">{p.who}</span>
                      </span>
                    ) : (
                      <span className="rounded-full bg-[#F4F1EC] px-1.5 py-px text-[8.5px] font-semibold uppercase text-brand-gray">
                        Open seat
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-[7px] text-[9.5px] text-brand-charcoal">{p.to}</td>
                  <td className="px-3 py-[7px] text-center font-mono text-[10px] tabular-nums text-brand-charcoal">
                    {p.reports || "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {rows.length === 0 && (
          <p className="px-3.5 pt-10 text-center text-[10.5px] leading-relaxed text-brand-gray">
            Nobody and no seat matches &ldquo;{q}&rdquo;.
          </p>
        )}
      </div>

      <div className="flex flex-none items-center gap-2 border-t border-[#F1EEE9] bg-[#FAF9F7] px-3.5 py-2">
        <span className="text-[10px] text-brand-gray">
          {rows.length} of {ORG.length} seats
        </span>
        {open > 0 && (
          <span className="ml-auto rounded-full bg-[#F4F1EC] px-2 py-[3px] text-[9px] font-bold text-brand-charcoal">
            {open} open
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 5. DISC
function DiscDemo() {
  const [on, setOn] = useState(true);
  const assessed = ORG.filter((p) => p.who && p.disc).length;
  const people = ORG.filter((p) => p.who).length;

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${CARD_CLS}`}>
      <div className="flex flex-none items-center gap-2 border-b border-[#F1EEE9] px-3.5 py-2.5">
        <b className="text-[12px]">Org Chart</b>
        <button
          type="button"
          aria-pressed={on}
          onClick={() => setOn((v) => !v)}
          className={`ml-auto rounded-lg px-2.5 py-1.5 text-[10.5px] font-semibold transition-colors ${
            on ? "bg-brand-orange text-white" : "border border-[#E6E2DB] text-brand-charcoal hover:bg-[#FAF9F7]"
          }`}
        >
          Show DISC
        </button>
      </div>

      {on && (
        <div className="sop-view flex flex-none flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b border-[#F1EEE9] px-3 py-2">
          {(Object.keys(DISC) as Disc[]).map((k) => (
            <span key={k} className="flex items-center gap-1 text-[9px] font-medium text-brand-charcoal">
              <span className="grid h-[13px] w-[13px] place-items-center rounded-full text-[7.5px] font-bold text-white" style={{ background: DISC[k].c }}>
                {k}
              </span>
              {DISC[k].label}
            </span>
          ))}
          <span className="flex items-center gap-1 text-[9px] font-medium text-brand-gray">
            <span className="grid h-[13px] w-[13px] place-items-center rounded-full bg-[#E6E2DB] text-[7.5px] font-bold text-brand-gray">
              &ndash;
            </span>
            Not assessed
          </span>
        </div>
      )}

      {/* Clipped rather than scrolled, same as the list section. */}
      <div className="min-h-0 flex-1 overflow-hidden px-3.5 py-2">
        {ORG.filter((p) => p.who).map((p) => (
          <div key={p.role} className="flex items-center gap-2.5 border-b border-[#F5F2ED] py-[7px] last:border-b-0">
            <span className="grid h-[24px] w-[24px] flex-none place-items-center rounded-full bg-[#F1EEE9] text-[8px] font-bold text-brand-charcoal">
              {p.init}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[10.5px] font-semibold leading-tight">{p.who}</span>
              <span className="text-[8.5px] text-brand-gray">{p.role}</span>
            </span>
            <span className="w-[92px] flex-none text-right">
              {on ? (
                p.disc ? (
                  <span className="inline-flex items-center gap-1">
                    <span className="rounded-full px-1.5 py-px text-[8.5px] font-bold text-white" style={{ background: DISC[p.disc[0]].c }}>
                      {p.disc[0]}/{p.disc[1]}
                    </span>
                    <span className="truncate text-[8px] text-brand-gray">{DISC[p.disc[0]].label}</span>
                  </span>
                ) : (
                  <span className="rounded-full bg-[#F4F1EC] px-1.5 py-px text-[8.5px] font-semibold text-brand-gray">
                    Not assessed
                  </span>
                )
              ) : (
                <span className="text-[8.5px] text-[#C4BFB6]">&mdash;</span>
              )}
            </span>
          </div>
        ))}
      </div>

      <p className="flex-none border-t border-[#F1EEE9] px-3.5 py-2 text-[10px] leading-snug text-brand-gray">
        {on
          ? `${assessed} of ${people} assessed. The grey ones are the gap, and the switch makes it obvious.`
          : "One switch away, and it never gets in the way when you do not want it."}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- 6. Multi AI
const AI_ROWS: Row[] = [
  { name: "Field Safety Lead", value: "open seat", hit: false, tone: "red" },
  { name: "COO", value: "3 reports", hit: false, tone: "amber" },
  { name: "Marketing", value: "2 seats", hit: true },
];

const AI_INSIGHTS: Insight[] = [
  {
    tag: "Gap",
    color: RED,
    source: "Field Safety Lead",
    text: "This seat has been open all quarter and it sits under the COO, who already carries three direct reports and three annual outcomes. Nobody owns field safety right now, which means in practice the COO does.",
  },
  {
    tag: "Load",
    color: AMBER,
    source: "COO",
    text: "Dana holds three direct reports, one of them vacant, and is the reporting line for both Operations and Technology. Every other second-level seat carries at most two.",
  },
  {
    tag: "Shape",
    color: GREEN,
    source: "Marketing",
    text: "Marketing is two seats, one of them part-time, against a Sales function of three. If the second market is the annual goal, the chart does not currently look like a company that believes that.",
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
export default function OrgChartPage() {
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
              <span className="grid h-[21px] w-[21px] flex-none place-items-center rounded-lg bg-gradient-to-br from-[#559384] to-[#2F5B4F] text-white shadow-[0_2px_6px_rgba(47,91,79,0.34),inset_0_1px_0_rgba(255,255,255,0.34)] sm:h-[34px] sm:w-[34px] sm:rounded-[11px]">
                <Tree className="h-[14px] w-[14px] sm:h-[19px] sm:w-[19px]" />
              </span>
              <span className="text-[11.5px] font-[650] tracking-[0.02em] text-[#33302C] sm:text-[16.5px]">
                Org Chart
              </span>
            </span>
            <h1 className="text-[24px] font-extrabold leading-[1.1] tracking-tight text-brand-ink sm:text-[66px] sm:leading-[1.04]">
              Who owns what,
              <br />
              <span className="text-brand-orange">at a glance.</span>
            </h1>
            <p className="mx-auto mt-3.5 max-w-2xl text-[14.5px] leading-relaxed text-brand-charcoal sm:mt-7 sm:text-xl">
              <span className="sm:hidden">
                Every seat, who is in it, what it owns, and the ones nobody is in yet.
              </span>
              <span className="hidden sm:inline">
                Not a directory of names. A chart of seats, each one owning outcomes and reporting
                somewhere, including the seats you have not filled yet. Drag it to reshape the
                company, or switch on DISC and see how the whole team is wired.
              </span>
            </p>
          </Reveal>

          <Reveal delay={0.12} className="mt-6 sm:mt-12">
            {/* The chip goes in a relative wrapper alongside the panel rather
                than inside it: the panel clips to its rounded corners, and the
                claim has to hang over its top edge. */}
            <div className="relative">
              <ReplacesChip names={REPLACES.orgChart} />
              <div
                className="overflow-hidden rounded-2xl p-2 sm:rounded-[30px] sm:p-8"
                style={{ background: "linear-gradient(160deg, #E9F2EE, #D8E8E1)" }}
              >
                <OrgChartHeroTour />
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

      {/* ------------------------------------------------ 2. the chart */}
      <Section
        id="chart"
        eyebrow="The whole company"
        title="One screen, and nobody has to ask"
        swash="who to go to."
        body="Expand the whole thing in one click, or collapse to the level you are talking about. Open a single manager to see who sits under them. Drag a card onto a new manager and the reporting line follows it, because reorganising should not require a ticket."
        points={[
          "Expand or collapse any branch, and zoom to fit the room",
          "Drag a role to a new manager to reorganise",
          "Head count split into full-time, part-time, and contractors",
        ]}
        visual={<ChartDemo />}
        panel="linear-gradient(160deg, #EDF5F2, #DDEBE5)"
      />

      {/* ------------------------------------------------ 3. adding somebody */}
      <Section
        id="add"
        eyebrow="Adding somebody"
        title="A new hire is on the chart before"
        swash="their first day."
        body="It asks one question first: are you adding a person, or adding a seat. Then it takes their details, and Reports To is the field that decides where their card lands. Permissions are asked separately, because what somebody can open and where they sit are two different questions."
        points={[
          "Invite by email, or create the account outright",
          "Reports To is required, so nobody arrives unattached",
          "Company Admin does not put them on the Leadership Team",
        ]}
        visual={<AddDemo />}
        flip
        panel="linear-gradient(160deg, #FDF6EE, #F9E9D8)"
      />

      {/* ------------------------------------------------ 4. seats */}
      <Section
        id="seats"
        eyebrow="Seats, not just people"
        title="A role can exist before anybody"
        swash="is in it."
        body="Adding somebody and adding a seat are two different things, and the product asks you which one you mean. So the chart holds the shape of the company you are building, not just the people currently in it. An empty seat still has a manager, a department, and outcomes waiting on whoever takes it."
        points={[
          "Create a role now and assign it to somebody later",
          "Every seat carries its own annual outcomes",
          "Full-time, part-time, or contractor, on the seat itself",
        ]}
        visual={<SeatDemo />}
        panel="linear-gradient(160deg, #F3F0FA, #E9E4F6)"
      />

      {/* ------------------------------------------------ 5. the list */}
      <Section
        id="list"
        eyebrow="Or read it as a list"
        title="When you need to scan it, not"
        swash="look at it."
        body="The same org, as rows. Every seat, who is in it, who they report to, and how many people report to them. It is the view for the questions a chart is bad at: how many open seats do we have, and who is carrying the most people."
        points={[
          "Every seat and every reporting line, in one list",
          "Search across people, roles, and departments",
          "Open seats counted, so a hiring plan is one glance away",
        ]}
        visual={<ListDemo />}
        flip
        panel="linear-gradient(160deg, #EEF4FB, #E2ECF8)"
      />

      {/* ------------------------------------------------ 6. DISC */}
      <Section
        id="disc"
        eyebrow="One switch"
        title="See how the whole team is"
        swash="actually wired."
        body="Turn on DISC and every person on the chart carries their profile. You can see at a glance that your leadership team is four decisive types and nobody who slows anything down, or that the people who have never taken it are all in one department."
        points={[
          "Dominance, Influence, Steadiness, and Compliance, on the chart itself",
          "Anybody who has not taken it shows as not assessed",
          "Switch it straight back off when you are doing something else",
        ]}
        visual={<DiscDemo />}
        panel="linear-gradient(160deg, #F7F0F5, #EFE2EB)"
      />

      {/* ------------------------------------------------ 7. Multi AI (always last) */}
      <MultiAiWired
        heading="And somebody who can read"
        swash="the shape of it."
        intro="Multi AI can see every seat, every reporting line, every open role, and what each seat owns. Ask it what is wrong with how the company is put together and it answers from the chart itself."
        prompt="Is anyone on my leadership team carrying too much?"
        leftLabel="The seats on your chart"
        leftColor={TEAL}
        leftIcon={RowsIcon}
        rightLabel="What Multi AI reads out of them"
        panelTitle="Org Chart · Current"
        panelMeta="10 seats"
        panelDot={TEAL}
        rows={AI_ROWS}
        insights={AI_INSIGHTS}
        aiMeta="reading 10 seats"
        footer="Multi AI reads the chart your team already keeps, and the outcomes hanging off each seat. No headcount spreadsheet, no separate org tool."
      />

      <CTA />
      <Footer />
    </main>
  );
}
