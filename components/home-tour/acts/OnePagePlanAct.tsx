"use client";

// Tab 3 of 10: One Page Plan.
//
// Short cut of TeamAccountabilityHeroTour's second half. That tour runs the plan
// in five beats and all five survive here, because the scroll alone only proved
// the plan EXISTS. These prove it is worked:
//
//   3. the plan, scrolling      why we exist, values, vision, SWOT, the goals
//   4. open a quarterly goal    its parent chain, its owner, its department
//   5. tick a milestone         2 of 5 becomes 3 of 5
//   6. Goal Updates             the week's written check-in
//   7. save                     the chip flips At Risk to On Track
//
// The scroll is now the SET-UP rather than the whole act: it ends on Department
// Goals, which is where the one goal that is slipping lives, so the pointer has
// somewhere to go the moment the scroll stops. That join is the reason the beats
// are in this order.
//
// The last beat is the point of all of it. Opening a goal and ticking a
// milestone is a to-do list; a milestone that flips the status chip ON THE PLAN
// ITSELF is the argument, because it means the one-page strategy and the weekly
// work are the same object and not two documents that drift apart.
//
// The pointer is hidden for the scroll and faded back in once it settles. A
// cursor parked over prose while the prose slides under it reads as a mistake.
//
// One goal is carried through every part of this act (the plan row, the modal
// header, the milestone list, the update text and the chip) so the numbers can
// be followed rather than just glanced at.
import { useRef, useState } from "react";
import { useAct, type Rig } from "../rig";
import { Av, ISpark, PageHead, T, Tick } from "../ui";

const SCROLL_MS = 2200;

const VALUES = ["Ownership", "Clarity", "Multiply", "Integrity", "Stewardship"];

const SWOT = [
  {
    t: "Strengths",
    bg: T.greenSoft,
    fg: "#1F8A52",
    d: "M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z",
    li: ["Strong founder brand", "Loyal early customers", "Low churn in year two"],
  },
  {
    t: "Weaknesses",
    bg: "#F1EEFB",
    fg: "#6D5AB8",
    d: "M10.3 3.9l-8 13.9A1.5 1.5 0 0 0 3.6 20h16.8a1.5 1.5 0 0 0 1.3-2.2l-8-13.9a1.5 1.5 0 0 0-2.6 0z",
    li: ["Thin ops bench", "Manual onboarding", "One channel carries sales"],
  },
  {
    t: "Opportunities",
    bg: "#EAF1FB",
    fg: "#3E7BC0",
    d: "M3 17l6-6 4 4 8-8M21 7v5h-5",
    li: ["Faith-based market", "Coaching upsell", "Partner referrals"],
  },
  {
    t: "Threats",
    bg: "#FBEDED",
    fg: "#C9503B",
    d: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8v4M12 16h.01",
    li: ["Incumbent tools", "Slower economy", "Hiring costs rising"],
  },
];

const FIVE_YEAR = [["1.", "$25M ARR · 10k companies served"]];
const ANNUAL = [
  ["1.", "$1M ARR"],
  ["2.", "Launch v2 platform"],
  ["3.", "First 25 coaching seats sold"],
];

// The goal the act opens. It is the one department goal that is NOT on track,
// which is what gives the pointer a reason to pick it out of the four.
const HOT = {
  row: "Operations - cut onboarding from 14 days to 9",
  name: "Cut onboarding from 14 days to 9",
  parent: "Onboarding under 14 days (Annual)",
  owner: "Dana Whitfield",
  initials: "DW",
  dept: "Operations",
};

const DEPTS: { n: string; label: string; hot?: boolean }[] = [
  { n: "1.", label: "Sales - 120 new logos in Q2" },
  { n: "2.", label: HOT.row, hot: true },
  { n: "3.", label: "Finance - 18% net margin" },
  { n: "4.", label: "People - every seat scored on DISC" },
];

const MILESTONES = [
  { n: "Map the current 14-day path end to end", due: "Jul 18", done: true },
  { n: "Cut the intake-to-kickoff gap to 24h", due: "Aug 1", done: true },
  { n: "Second onboarding specialist certified", due: "Sep 12", done: false },
  { n: "Weekly onboarding review in the Ops meeting", due: "Sep 30", done: false },
  { n: "Hold 9 days for three straight weeks", due: "Sep 30", done: false },
];
/** The one the pointer ticks. */
const MS_PICK = 2;

const UPDATE = {
  week: "Week of Aug 24",
  text: "Specialist two passed certification Friday. Onboarding averaged 9.6 days this week, the first time under ten. Keeping the flag on until we hold it three weeks running.",
};
// Three weeks of history, not two. The Details tab is the taller of the two and
// the dialog body is a fixed height so switching tabs does not resize it, which
// left the Updates tab with a band of dead space above the buttons. A third week
// fills it and makes the "every week, on every goal" line below it true on screen
// rather than just asserted.
const PRIOR = [
  {
    w: "Week of Aug 17",
    t: "Intake-to-kickoff gap is down to 19 hours. Onboarding still 11.4 days, because scheduling is the bottleneck now, not intake.",
  },
  {
    w: "Week of Aug 10",
    t: "Mapped the full fourteen-day path with both specialists. Three handoffs account for six of the fourteen days.",
  },
  {
    w: "Week of Aug 3",
    t: "Two specialists are covering eleven active onboardings. That is why week two slips on almost every account.",
  },
];

const AMBER = "#C9832B";
const GREEN_INK = "#1F8A52";

type Scene = {
  scrolled: boolean;
  /** Pointer dwell target, for the pre-click hover state. */
  hot: string;
  modal: boolean;
  tab: "details" | "updates";
  ticked: boolean;
  posted: boolean;
  /** The chip on the plan itself, after Save. */
  flipped: boolean;
};
const BLANK: Scene = {
  scrolled: false,
  hot: "",
  modal: false,
  tab: "details",
  ticked: false,
  posted: false,
  flipped: false,
};

// ---------------------------------------------------------------- plan pieces
function Chip({ ok }: { ok: boolean }) {
  return (
    <span
      className="ml-auto inline-flex flex-none items-center gap-[6px] rounded-full px-[9px] py-[3px] text-[11px] font-semibold transition-colors duration-500"
      style={{
        background: ok ? T.greenSoft : "#FDF1DF",
        color: ok ? GREEN_INK : AMBER,
      }}
    >
      <span
        className="h-[6px] w-[6px] rounded-full transition-colors duration-500"
        style={{ background: ok ? T.green : AMBER }}
      />
      {ok ? "On Track" : "At Risk"}
    </span>
  );
}

function Box({ k, children, className = "" }: { k?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[12px] border bg-white px-4 py-[15px] ${className}`} style={{ borderColor: T.hair }}>
      {k && (
        <div className="text-[10.5px] font-bold uppercase tracking-[0.09em]" style={{ color: T.muted }}>
          {k}
        </div>
      )}
      {children}
    </div>
  );
}

function GoalList({ title, items }: { title: string; items: string[][] }) {
  return (
    <Box>
      <div className="flex items-center justify-between">
        <b className="text-[14px]">{title}</b>
        <span className="text-[12px] font-semibold" style={{ color: T.orange }}>
          + Add
        </span>
      </div>
      {items.map(([n, label], i) => (
        <div
          key={label}
          className="flex items-center gap-[10px] py-[9px] text-[13px]"
          style={{ borderTop: i === 0 ? undefined : `1px solid ${T.hair}` }}
        >
          <span className="font-semibold" style={{ color: T.muted2 }}>
            {n}
          </span>
          <span className="truncate">{label}</span>
          <Chip ok />
        </div>
      ))}
    </Box>
  );
}

// ---------------------------------------------------------------- the modal
function Field({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <span className="block min-w-0">
      <span className="block text-[8.5px] font-bold uppercase tracking-[0.1em]" style={{ color: T.muted }}>
        {label}
      </span>
      <span
        className="mt-1 block truncate rounded-[8px] border px-[9px] py-[6px] text-[10.5px] font-semibold transition-colors duration-500"
        style={{ borderColor: "#E6E2DB", background: "#FAF9F7", color: color ?? "#33302C" }}
      >
        {value}
      </span>
    </span>
  );
}

function GoalModal({ s }: { s: Scene }) {
  const done = MILESTONES.filter((m, i) => m.done || (i === MS_PICK && s.ticked)).length;

  return (
    <div
      className="absolute inset-0 z-[60] grid place-items-center px-6 transition-opacity duration-[280ms]"
      style={{
        background: "rgba(24,19,12,0.42)",
        opacity: s.modal ? 1 : 0,
        pointerEvents: "none",
      }}
    >
      <div
        className="w-[500px] rounded-[16px] bg-white px-5 py-4 transition-all duration-[280ms] ease-out"
        style={{
          boxShadow: "0 24px 60px -18px rgba(20,14,6,0.5)",
          transform: s.modal ? "scale(1)" : "scale(0.97)",
        }}
      >
        <h4 className="text-[15px] font-bold tracking-tight">Quarterly Detail</h4>

        <div className="mt-2 flex items-center gap-[6px]">
          {(
            [
              { k: "details", l: "Details" },
              { k: "updates", l: "Goal Updates" },
            ] as const
          ).map(({ k, l }) => (
            <span
              key={k}
              data-opp={k === "updates" ? "tab-updates" : undefined}
              className="rounded-full px-3 py-1 text-[10.5px] transition-all duration-200"
              style={
                s.tab === k
                  ? { background: T.orange, color: "#fff", fontWeight: 600 }
                  : {
                      color: "#4A4A4A",
                      fontWeight: 500,
                      boxShadow: s.hot === "tab-updates" && k === "updates" ? "0 0 0 2px rgba(234,123,27,0.35)" : undefined,
                    }
              }
            >
              {l}
            </span>
          ))}
        </div>

        {/* Fixed height, so switching tabs does not resize the dialog. */}
        <div className="mt-3" style={{ height: 306 }}>
          {s.tab === "details" ? (
            <div>
              <Field label="Name" value={HOT.name} />
              <div className="mt-2">
                <Field label="Parent goal" value={HOT.parent} />
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <Field
                  label="Status"
                  value={s.ticked ? "On Track" : "At Risk"}
                  color={s.ticked ? GREEN_INK : AMBER}
                />
                <Field label="Assignee" value={HOT.owner} />
                <Field label="Department" value={HOT.dept} />
              </div>

              <div className="mt-[10px] rounded-[10px] border px-[10px] py-2" style={{ borderColor: "#EBE7E0", background: "#FAF9F7" }}>
                <p className="flex items-center text-[8.5px] font-bold uppercase tracking-[0.1em]" style={{ color: T.muted }}>
                  Milestones
                  <span className="ml-auto font-mono normal-case tracking-normal">{done}/5 done</span>
                </p>
                <div className="mt-[6px] space-y-1">
                  {MILESTONES.map((m, i) => {
                    const on = m.done || (i === MS_PICK && s.ticked);
                    return (
                      <div
                        key={m.n}
                        data-opp={i === MS_PICK ? "ms" : undefined}
                        className="flex items-center gap-2 rounded-[6px] border bg-white px-2 py-[5px] transition-all duration-200"
                        style={{
                          borderColor: s.hot === "ms" && i === MS_PICK ? T.orange : "#EFEBE4",
                          boxShadow: s.hot === "ms" && i === MS_PICK ? "0 0 0 2px rgba(234,123,27,0.18)" : undefined,
                        }}
                      >
                        <Tick on={on} size={13} />
                        <span
                          className="min-w-0 flex-1 truncate text-[10px] transition-all duration-300"
                          style={{
                            color: on ? T.muted : "#33302C",
                            textDecoration: on ? "line-through" : undefined,
                            fontWeight: on ? 500 : 600,
                          }}
                        >
                          {m.n}
                        </span>
                        <span className="flex-none font-mono text-[8px]" style={{ color: T.muted2 }}>
                          {m.due}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* the week's check-in, written in the owner's own words */}
              <div
                className="rounded-[10px] border px-[10px] py-2 transition-all duration-[360ms] ease-out"
                style={{
                  borderColor: s.posted ? "#CFE6D8" : "#EBE7E0",
                  background: s.posted ? "#F6FCF8" : "#FAF9F7",
                  opacity: s.posted ? 1 : 0,
                  transform: s.posted ? "translateY(0)" : "translateY(-6px)",
                }}
              >
                <p className="flex items-center gap-2 text-[9.5px] font-bold">
                  <Av n={HOT.initials} size={18} bg={T.navy} />
                  {HOT.owner}
                  <span className="ml-auto font-mono text-[8px] font-normal" style={{ color: T.muted }}>
                    {UPDATE.week}
                  </span>
                </p>
                <p className="mt-[6px] text-[10px] leading-relaxed" style={{ color: "#3C3833" }}>
                  {UPDATE.text}
                </p>
              </div>

              <div className="mt-[6px] space-y-[6px] opacity-70">
                {PRIOR.map((u) => (
                  <div key={u.w} className="rounded-[10px] border px-[10px] py-2" style={{ borderColor: "#EBE7E0", background: "#FAF9F7" }}>
                    <p className="flex items-center gap-2 text-[9.5px] font-bold">
                      <Av n={HOT.initials} size={18} bg="#F1EEE9" />
                      {HOT.owner}
                      <span className="ml-auto font-mono text-[8px] font-normal" style={{ color: T.muted }}>
                        {u.w}
                      </span>
                    </p>
                    <p className="mt-1 text-[9.5px] leading-snug" style={{ color: "#3C3833" }}>
                      {u.t}
                    </p>
                  </div>
                ))}
              </div>

              <p className="mt-2 flex items-center gap-[6px] text-[9px]" style={{ color: T.muted }}>
                <ISpark className="h-[10px] w-[10px]" style={{ color: "#4B3CC4" }} />
                Every week, on every goal, in the owner&rsquo;s own words.
              </p>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center justify-end gap-3">
          <span className="text-[11.5px] font-semibold" style={{ color: "#4A4A4A" }}>
            Cancel
          </span>
          <span
            data-opp="save"
            className="rounded-[8px] px-4 py-[6px] text-[12px] font-semibold text-white transition-all duration-200"
            style={{
              background: T.orange,
              boxShadow: s.hot === "save" ? "0 0 0 3px rgba(234,123,27,0.35)" : undefined,
            }}
          >
            Save
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- the act
export default function OnePagePlanAct({ active, rig }: { active: boolean; rig: Rig }) {
  const [s, setScene] = useState<Scene>(BLANK);
  // Scopes cursor-target lookups to THIS copy of the act. See ActApi.q.
  const rootRef = useRef<HTMLDivElement>(null);

  useAct(active, rig, rootRef, () => setScene(BLANK), async ({ alive, wait, rig: r, q }) => {
    const patch = (p: Partial<Scene>) => alive() && setScene((x) => ({ ...x, ...p }));
    const hit = (k: string) => q(`[data-opp="${k}"]`);

    const tap = async (key: string, dur = 520, hold = 220) => {
      await r.glide(hit(key), 0.5, 0.5, dur);
      if (!alive()) return false;
      patch({ hot: key });
      await wait(hold);
      if (!alive()) return false;
      await r.click();
      patch({ hot: "" });
      return alive();
    };

    // ---- 1. the plan, top to bottom, with no pointer in the way
    await r.fade(0, 180);
    if (!alive()) return;
    await wait(420);
    patch({ scrolled: true });
    // Wait out the scroll itself: the goal row is inside the moving container,
    // so measuring it mid-transition would point the cursor at where the row
    // WAS rather than where it is coming to rest.
    await wait(SCROLL_MS + 240);
    if (!alive()) return;

    // ---- 2. open the one goal that is slipping
    r.at(hit("goal"), 0.4, 0.5);
    await r.fade(1, 200);
    if (!alive()) return;
    await wait(200);
    if (!(await tap("goal", 420, 260))) return;
    patch({ modal: true });
    await wait(550);

    // ---- 3. a milestone lands, and the counter moves
    if (!(await tap("ms", 560))) return;
    patch({ ticked: true });
    await wait(500);

    // ---- 4. the week's written check-in
    if (!(await tap("tab-updates", 440))) return;
    patch({ tab: "updates" });
    await wait(340);
    patch({ posted: true });
    await wait(900);

    // ---- 5. save, and the plan itself changes colour
    if (!(await tap("save", 520))) return;
    patch({ modal: false, flipped: true });
    await r.fade(0, 320);
  });

  return (
    <div ref={rootRef} className="relative flex h-full flex-col gap-3">
      <PageHead title="One Page Plan" sub="Company's strategic blueprint" />

      <div className="min-h-0 flex-1 overflow-hidden">
        <div
          className="flex flex-col gap-3"
          style={{
            transform: `translateY(${s.scrolled ? "calc(-100% + 552px)" : "0px"})`,
            transition: `transform ${SCROLL_MS}ms cubic-bezier(0.42,0,0.58,1)`,
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <Box k="Why we exist">
              <div className="mt-2 text-[13.5px] leading-[1.5]" style={{ color: "#3C3833" }}>
                To help mission-driven owners build companies that multiply impact: freedom, profit, and
                lasting influence.
              </div>
            </Box>
            <Box>
              <div className="flex items-center justify-between">
                <div className="text-[10.5px] font-bold uppercase tracking-[0.09em]" style={{ color: T.muted }}>
                  Values
                </div>
                <span className="text-[11px] font-semibold" style={{ color: T.orange }}>
                  EDIT
                </span>
              </div>
              <div className="mt-[10px] flex flex-wrap gap-[7px]">
                {VALUES.map((v) => (
                  <span
                    key={v}
                    className="rounded-full border px-[11px] py-[5px] text-[12px] font-semibold"
                    style={{ borderColor: T.hair2, background: T.ground, color: "#57534C" }}
                  >
                    {v}
                  </span>
                ))}
              </div>
            </Box>
          </div>

          <div className="flex items-center gap-[9px]">
            <span
              className="inline-flex rounded-[8px] border px-3 py-[6px] text-[12px] font-semibold"
              style={{ borderColor: T.hair2, background: "#fff" }}
            >
              FY 2026
            </span>
            <span className="inline-flex gap-[3px] rounded-[8px] p-[3px]" style={{ background: "#EDEAE4" }}>
              {["Q1", "Q2", "Q3", "Q4"].map((qq) => (
                <span
                  key={qq}
                  className="rounded-[6px] px-[11px] py-[5px] text-[12px]"
                  style={qq === "Q2" ? { background: T.navy, color: "#fff", fontWeight: 600 } : { color: T.muted }}
                >
                  {qq}
                </span>
              ))}
            </span>
            <span className="flex-1" />
            <span className="inline-flex rounded-[8px] p-[3px]" style={{ background: "#EDEAE4" }}>
              {["Leadership", "Everyone"].map((v) => (
                <span
                  key={v}
                  className="rounded-[6px] px-3 py-[5px] text-[12px]"
                  style={v === "Everyone" ? { background: T.navy, color: "#fff", fontWeight: 600 } : { color: T.muted }}
                >
                  {v}
                </span>
              ))}
            </span>
          </div>

          <div className="grid gap-[10px]" style={{ gridTemplateColumns: "1.1fr 1fr 1fr 1fr 1fr" }}>
            <div className="rounded-[12px] border bg-white p-[13px] text-center" style={{ borderColor: T.hair }}>
              <div className="text-[12.5px] font-bold">Company Vision</div>
              <div
                className="mx-auto mb-[6px] mt-2 grid h-[38px] w-[38px] place-items-center rounded-[10px]"
                style={{ background: "#EAF1FB" }}
              >
                <svg viewBox="0 0 24 24" className="h-[19px] w-[19px]" fill="none" stroke="#4A86C9" strokeWidth={2}>
                  <circle cx="12" cy="12" r="8.6" />
                  <path d="M12 3.4V7M12 17v3.6M3.4 12H7M17 12h3.6" />
                </svg>
              </div>
              <div className="text-[11.5px] leading-[1.4]" style={{ color: "#57534C" }}>
                Be the OS that 10,000 mission-driven businesses run on by 2030.
              </div>
            </div>

            {SWOT.map((c) => (
              <div
                key={c.t}
                className="rounded-[12px] border p-[13px]"
                style={{ borderColor: T.hair, background: c.bg, color: c.fg }}
              >
                <div className="flex items-center gap-[7px] text-[12.5px] font-bold">
                  <svg viewBox="0 0 24 24" className="h-[14px] w-[14px] flex-none" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d={c.d} />
                  </svg>
                  {c.t}
                </div>
                <ul className="mt-[9px] flex list-none flex-col gap-[6px] p-0">
                  {c.li.map((l) => (
                    <li key={l} className="relative pl-3 text-[11.5px] leading-[1.35]" style={{ color: "#57534C" }}>
                      <span
                        className="absolute left-[2px] top-[6px] h-1 w-1 rounded-full opacity-50"
                        style={{ background: "currentColor" }}
                      />
                      {l}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <GoalList title="5+ Year Vision" items={FIVE_YEAR} />
            <GoalList title="Annual Goals - 2026" items={ANNUAL} />
          </div>

          {/* Department Goals: where the scroll lands, and where the pointer
              picks the one goal that is not on track. */}
          <Box>
            <div className="flex items-center justify-between">
              <b className="text-[14px]">Department Goals</b>
              <span className="text-[12px] font-semibold" style={{ color: T.orange }}>
                Add or Edit Departments →
              </span>
            </div>
            {DEPTS.map((d, i) => (
              <div
                key={d.label}
                data-opp={d.hot ? "goal" : undefined}
                className="-mx-2 flex items-center gap-[10px] rounded-[8px] px-2 py-[9px] text-[13px] transition-colors duration-200"
                style={{
                  borderTop: i === 0 ? undefined : `1px solid ${T.hair}`,
                  background: d.hot && s.hot === "goal" ? "#FFF6EC" : "transparent",
                }}
              >
                <span className="font-semibold" style={{ color: T.muted2 }}>
                  {d.n}
                </span>
                <span className="truncate">{d.label}</span>
                {d.hot ? <Chip ok={s.flipped} /> : <Chip ok />}
              </div>
            ))}
          </Box>
        </div>
      </div>

      <GoalModal s={s} />
    </div>
  );
}
