"use client";

// Tab 4 of 10: Quarterly Execution Plan.
//
// TeamAccountabilityHeroTour's opening act is only "this week's priorities,
// ticked one at a time", so unlike the other nine tabs there was no longer beat
// list to cut down from. This act was extended on the client's request instead,
// against the part of the real screen the earlier version left out entirely: the
// QUARTERLY GOALS table, where each goal carries a KPI, a target, and a hit or
// miss for each of the twelve weeks.
//
//   1. + Add goal       name it, set its KPI target, the row lands
//   2. this week        the four priorities ticked one at a time
//   3. the roll-up      week 5 scores a hit on the commitment-rate goal
//
// Beat 3 is why beats 1 and 2 are in this order. The first goal's KPI is
// literally "priorities completed / committed", so finishing the week is what
// scores it: the checklist and the quarterly scorecard are the same number seen
// at two altitudes, which is the whole 12-week-year argument. Without the table
// the ticks were just a to-do list.
//
// The newly added goal deliberately lands with twelve empty weeks. A goal
// created today has nothing logged against it yet, and showing it pre-filled
// would be the one dishonest frame in the act.
//
// The earlier version had a row of big week boxes instead of this table. It has
// gone: it was showing the same twelve weeks as the table now does, and the
// table is what the product actually renders.
import { useRef, useState } from "react";
import { useAct, type Rig } from "../rig";
import { BtnDark, Caret, ICheck, IChevron, IFlag, IPlus, PageHead, T, Tick } from "../ui";

const NOW_WEEK = 4; // zero-based, so week 5 of 12
const WEEKS = 12;

type Goal = {
  name: string;
  kpi: string;
  target: string;
  /** Per-week outcome. null is a week not reached yet. */
  weeks: (boolean | null)[];
};

// Week 5's cell is left out of the data on purpose: it is computed from whether
// this week's priorities are all in, which is beat 3.
const GOAL1: Goal = {
  name: "Lift weekly commitment rate to 90%",
  kpi: "KPI: priorities completed / committed",
  target: "≥ 90%",
  weeks: [true, true, false, true, null, null, null, null, null, null, null, null],
};

const NEW_GOAL = {
  name: "Cut onboarding from 14 days to 9",
  kpi: "KPI: average onboarding, days",
  target: "≤ 9.0",
};

const PRIORITIES = [
  "Publish the Q2 hiring plan",
  "Close 3 renewals",
  "Ship the onboarding checklist",
  "1on1 with every direct report",
];

const COL = { goal: 252, target: 68 };

type Scene = {
  hot: string;
  /** The draft goal row exists but is not committed yet. */
  draft: boolean;
  name: string;
  target: string;
  typing: "name" | "target" | null;
  committed: boolean;
  done: number;
};
const BLANK: Scene = {
  hot: "",
  draft: false,
  name: "",
  target: "",
  typing: null,
  committed: false,
  done: 0,
};

function WeekCell({
  v,
  isNow,
  children,
}: {
  v: boolean | null;
  isNow: boolean;
  children?: React.ReactNode;
}) {
  return (
    <span
      className="flex min-w-0 flex-1 items-center justify-center border-r py-[7px] last:border-r-0"
      style={{ borderColor: "#F5F2ED", background: isNow ? "#FFF6EC" : undefined }}
    >
      {children ??
        (v === null ? (
          <span className="h-[4px] w-[4px] rounded-full" style={{ background: "#E0DCD5" }} />
        ) : (
          <span
            className="grid h-[15px] w-[15px] place-items-center rounded-full transition-all duration-300"
            style={{ background: v ? T.greenSoft : T.pink }}
          >
            {v ? (
              <ICheck className="h-[9px] w-[9px]" style={{ color: "#1F8A52" }} />
            ) : (
              <span className="text-[9px] font-bold" style={{ color: T.pinkInk }}>
                ×
              </span>
            )}
          </span>
        ))}
    </span>
  );
}

export default function TwelveWeekAct({ active, rig }: { active: boolean; rig: Rig }) {
  const [s, setScene] = useState<Scene>(BLANK);
  // Scopes cursor-target lookups to THIS copy of the act. See ActApi.q.
  const rootRef = useRef<HTMLDivElement>(null);

  useAct(active, rig, rootRef, () => setScene(BLANK), async ({ alive, wait, rig: r, q }) => {
    const patch = (p: Partial<Scene>) => alive() && setScene((x) => ({ ...x, ...p }));
    const hit = (k: string) => q(`[data-tw="${k}"]`);
    const type = async (text: string, per: number, key: "name" | "target") => {
      for (let i = 1; i <= text.length; i++) {
        if (!alive()) return;
        patch({ [key]: text.slice(0, i) } as Partial<Scene>);
        await wait(per);
      }
    };
    const tap = async (key: string, dur = 460, hold = 200) => {
      await r.glide(hit(key), 0.5, 0.5, dur);
      if (!alive()) return false;
      patch({ hot: key });
      await wait(hold);
      if (!alive()) return false;
      await r.click();
      patch({ hot: "" });
      return alive();
    };

    r.at(hit("add"), 0.5, 0.55);
    await r.fade(1, 200);
    if (!alive()) return;
    await wait(240);

    // ---- 1. add a quarterly goal
    if (!(await tap("add", 400, 220))) return;
    patch({ draft: true, typing: "name" });
    await wait(200);
    await type(NEW_GOAL.name, 24, "name");
    if (!alive()) return;
    await wait(160);

    patch({ typing: "target" });
    await r.glide(hit("draft-target"), 0.5, 0.5, 320);
    if (!alive()) return;
    await type(NEW_GOAL.target, 62, "target");
    if (!alive()) return;
    await wait(200);
    patch({ typing: null, committed: true });
    await wait(420);

    // ---- 2. close the week out
    for (let i = 0; i < PRIORITIES.length; i++) {
      if (!alive()) return;
      await r.glide(hit(`p${i}`), 0.045, 0.5, i === 0 ? 520 : 280);
      if (!alive()) return;
      await r.click();
      if (!alive()) return;
      setScene((x) => ({ ...x, done: i + 1 }));
      await wait(i === PRIORITIES.length - 1 ? 140 : 180);
    }

    // ---- 3. and the quarterly goal scores the week
    await wait(900);
    await r.fade(0, 380);
  });

  const complete = s.done === PRIORITIES.length;
  const rate = Math.round((s.done / PRIORITIES.length) * 100);

  return (
    <div ref={rootRef} className="flex h-full flex-col gap-3">
      <PageHead
        title="Quarterly Execution Plan"
        sub="Your quarter, broken into months, then into weeks."
        right={
          <>
            <span
              className="inline-flex items-center gap-2 rounded-[8px] border px-3 py-[7px] text-[12px] font-semibold"
              style={{ borderColor: T.hair2, background: "#fff" }}
            >
              <IFlag className="h-[13px] w-[13px]" style={{ color: T.orange }} />
              Q2 2026 · Week {NOW_WEEK + 1} of {WEEKS}
            </span>
            <span data-tw="add">
              <BtnDark hot={s.hot === "add"}>
                <IPlus className="h-[13px] w-[13px]" />
                Add goal
              </BtnDark>
            </span>
          </>
        }
      />

      {/* ---------------- quarterly goals ---------------- */}
      <div className="flex-none">
        <p className="flex items-baseline gap-[6px] text-[12px] font-extrabold">
          Quarterly Goals
          <span className="text-[9.5px] font-medium" style={{ color: T.muted2 }}>
            {s.committed ? 2 : 1} {s.committed ? "goals" : "goal"} &times; {WEEKS} weeks
          </span>
        </p>

        <div className="mt-1 overflow-hidden rounded-[10px] border bg-white" style={{ borderColor: "#EBE7E0" }}>
          {/* header */}
          <div className="flex items-stretch">
            <span
              className="flex flex-none items-center border-r px-[10px] py-1 text-[7.5px] font-bold uppercase tracking-[0.1em]"
              style={{ width: COL.goal, borderColor: "#F1EEE9", color: T.muted }}
            >
              Goal &amp; KPI
            </span>
            <span
              className="flex flex-none items-center justify-center border-r px-1 py-1 text-[7.5px] font-bold uppercase tracking-[0.1em]"
              style={{ width: COL.target, borderColor: "#F1EEE9", color: T.muted }}
            >
              Target
            </span>
            {Array.from({ length: WEEKS }, (_, i) => (
              <span
                key={i}
                className="flex min-w-0 flex-1 items-center justify-center border-r py-1 font-mono text-[7.5px] last:border-r-0"
                style={
                  i === NOW_WEEK
                    ? { background: "#FFF6EC", color: T.orange, fontWeight: 700, borderColor: "#F5F2ED" }
                    : { color: T.muted2, borderColor: "#F5F2ED" }
                }
              >
                Wk {i + 1}
              </span>
            ))}
          </div>

          {/* the goal that this week's priorities score */}
          <div className="flex items-stretch border-t" style={{ borderColor: "#F1EEE9" }}>
            <span className="flex-none border-r px-[10px] py-[6px]" style={{ width: COL.goal, borderColor: "#F1EEE9" }}>
              <span className="block truncate text-[10px] font-bold leading-tight">{GOAL1.name}</span>
              <span className="block truncate text-[8.5px]" style={{ color: T.muted2 }}>
                {GOAL1.kpi}
              </span>
            </span>
            <span
              className="flex flex-none items-center justify-center border-r font-mono text-[10px] font-bold"
              style={{ width: COL.target, borderColor: "#F1EEE9" }}
            >
              {GOAL1.target}
            </span>
            {GOAL1.weeks.map((v, i) => (
              <WeekCell
                key={i}
                // Week 5 is not in the data: it is whether this week's
                // priorities are all in, which is what beat 3 turns over.
                v={i === NOW_WEEK ? (complete ? true : null) : v}
                isNow={i === NOW_WEEK}
                {...(i === NOW_WEEK && !complete
                  ? {
                      children: (
                        <span className="font-mono text-[9px] font-bold" style={{ color: T.orange }}>
                          {s.done}/4
                        </span>
                      ),
                    }
                  : {})}
              />
            ))}
          </div>

          {/* the goal being added */}
          <div
            className="flex items-stretch overflow-hidden border-t transition-all duration-[320ms] ease-out"
            style={{
              borderColor: "#F1EEE9",
              maxHeight: s.draft ? 42 : 0,
              opacity: s.draft ? 1 : 0,
              background: s.committed ? "#fff" : "#FEFBF7",
            }}
          >
            <span className="flex-none border-r px-[10px] py-[6px]" style={{ width: COL.goal, borderColor: "#F1EEE9" }}>
              <span className="block truncate text-[10px] font-bold leading-tight">
                {s.name}
                <Caret on={s.typing === "name"} />
              </span>
              <span className="block truncate text-[8.5px]" style={{ color: T.muted2 }}>
                {NEW_GOAL.kpi}
              </span>
            </span>
            <span
              data-tw="draft-target"
              className="flex flex-none items-center justify-center border-r font-mono text-[10px] font-bold"
              style={{ width: COL.target, borderColor: "#F1EEE9" }}
            >
              <span
                className="rounded-[4px] px-[5px] py-[1px]"
                style={{
                  background: s.typing === "target" ? "#FDF0E4" : "transparent",
                  boxShadow: s.typing === "target" ? `0 0 0 1.5px ${T.orange}` : undefined,
                }}
              >
                {s.target || <span style={{ color: T.muted2 }}>—</span>}
                <Caret on={s.typing === "target"} />
              </span>
            </span>
            {/* A goal created today has nothing logged against it yet. */}
            {Array.from({ length: WEEKS }, (_, i) => (
              <WeekCell key={i} v={null} isNow={i === NOW_WEEK} />
            ))}
          </div>
        </div>
      </div>

      {/* ---------------- this week ---------------- */}
      <div className="grid min-h-0 flex-1 gap-3" style={{ gridTemplateColumns: "1.62fr 1fr" }}>
        <div className="flex min-h-0 flex-col rounded-[12px] border bg-white" style={{ borderColor: T.hair }}>
          <div className="flex flex-none items-center gap-2 border-b px-4 py-[11px]" style={{ borderColor: T.hair }}>
            <b className="text-[14px]">This Week&apos;s Priorities</b>
            <span className="text-[11px]" style={{ color: T.muted2 }}>
              Week {NOW_WEEK + 1}
            </span>
            <span
              className="ml-auto rounded-full px-[10px] py-[3px] text-[11px] font-bold transition-colors duration-300"
              style={{
                background: complete ? T.greenSoft : "#F1EEE9",
                color: complete ? "#1F8A52" : T.muted,
              }}
            >
              {s.done} of {PRIORITIES.length} complete
            </span>
          </div>
          <div className="flex-1 px-4 py-1">
            {PRIORITIES.map((p, i) => {
              const on = s.done > i;
              return (
                <div
                  key={p}
                  data-tw={`p${i}`}
                  className="flex items-center gap-[11px] py-[10px] text-[13px]"
                  style={{ borderTop: i === 0 ? undefined : `1px solid ${T.hair}` }}
                >
                  <Tick on={on} size={17} />
                  <span
                    className="truncate transition-all duration-[280ms]"
                    style={{
                      color: on ? T.muted : T.ink,
                      textDecoration: on ? "line-through" : undefined,
                      fontWeight: on ? 500 : 600,
                    }}
                  >
                    {p}
                  </span>
                </div>
              );
            })}
            <div className="flex items-center gap-[7px] py-[10px] text-[12px]" style={{ color: T.muted2, borderTop: `1px solid ${T.hair}` }}>
              <IPlus className="h-[13px] w-[13px]" />
              Add a priority
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-col gap-3">
          {[
            {
              k: "Commitment rate",
              v: `${rate}%`,
              s: "this week",
              c: complete ? "#1F8A52" : T.orange,
            },
            { k: "Weeks hit", v: complete ? "4 of 5" : "3 of 5", s: "this quarter", c: T.ink },
            { k: "Current streak", v: complete ? "2 weeks" : "1 week", s: "since Wk 4", c: T.ink },
          ].map((m) => (
            <div
              key={m.k}
              className="flex flex-1 flex-col justify-center rounded-[12px] border bg-white px-4"
              style={{ borderColor: T.hair }}
            >
              <div className="text-[10.5px] font-bold uppercase tracking-[0.09em]" style={{ color: T.muted }}>
                {m.k}
              </div>
              <div
                className="mt-1 text-[26px] font-[780] leading-none tracking-[-0.03em] tabular-nums transition-colors duration-300"
                style={{ color: m.c }}
              >
                {m.v}
              </div>
              <div className="mt-[3px] flex items-center gap-1 text-[11.5px]" style={{ color: T.muted2 }}>
                {m.s}
                <IChevron className="h-[10px] w-[10px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
