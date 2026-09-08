"use client";

// Tab 2 of 10 — Scoreboard.
//
// Short cut of ScoreboardHeroTour. That tour runs four acts; this keeps the one
// the client's own screenshot is of, and the one that proves the column means
// something:
//
//   1. + Add Metric/KPI    type the name, type the goal, the row lands
//   2. assign its owner    the row arrives with nobody on it, then gets a name
//
// The row landing unassigned is the whole point of beat 2. Every row used to
// render the same avatar, so the Owner column was present without demonstrating
// anything.
//
// Board content, the AI Insights line and the week columns are traced from the
// client's September 2026 screenshot of the Leadership Scoreboard, down to the
// fiscal week and the date ranges.
import { useRef, useState } from "react";
import { useAct, type Rig } from "../rig";
import {
  Av,
  BtnDark,
  Caret,
  Ghost,
  IChevron,
  IDownload,
  IPlus,
  ISpark,
  IUpDown,
  PageHead,
  Pill,
  T,
} from "../ui";

const OWNER = { n: "Dana Whitfield", i: "DW" };

type Row = {
  name: string;
  icon: string;
  owner: string | null;
  goal: string;
  prev: string;
  cur: string;
  hit: boolean;
};

const ROWS: Row[] = [
  { name: "Revenue", icon: "⌁", owner: "SL", goal: "$50,000", prev: "$47,200", cur: "$54,100", hit: true },
  { name: "New Customers", icon: "◍", owner: "MR", goal: "10", prev: "8", cur: "12", hit: true },
  { name: "Cash Balance", icon: "▤", owner: "PA", goal: "$100,000", prev: "$101,400", cur: "$108,900", hit: true },
  { name: "Customer Satisfaction", icon: "☆", owner: "JK", goal: "90%", prev: "88%", cur: "93%", hit: true },
  { name: "Team Tasks Completed", icon: "☑", owner: "DW", goal: "25", prev: "21", cur: "28", hit: true },
];

const WEEKS = [
  ["7/6", "7/12"],
  ["7/13", "7/19"],
  ["7/20", "7/26"],
  ["7/27", "8/2"],
  ["8/3", "8/9"],
  ["8/10", "8/16"],
  ["8/17", "8/23"],
];

const COL = { metric: 208, owner: 70, goal: 88, prev: 100, cur: 100 };

// Where the owner picker hangs. Measured off the rendered board: the header is a
// 36px band and every row is a 37px pitch, so the draft row (the sixth) ends at
// 36 + 5*37 + 37. The picker has to open BELOW that, or it covers the very row
// whose owner is being assigned, along with the goal that was just typed into it.
const ROW_H = 37;
const HEAD_H = 36;
const PICKER_TOP = HEAD_H + ROW_H * (ROWS.length + 1) + 8;
const PICKER_LEFT = 186;

const NEW_NAME = "Net Profit Margin";
const NEW_GOAL = "18%";

type Scene = {
  addHot: boolean;
  /** The draft row exists but is not committed yet. */
  draft: boolean;
  name: string;
  goal: string;
  typing: "name" | "goal" | null;
  committed: boolean;
  ownerOpen: boolean;
  ownerPicked: boolean;
};
const BLANK: Scene = {
  addHot: false,
  draft: false,
  name: "",
  goal: "",
  typing: null,
  committed: false,
  ownerOpen: false,
  ownerPicked: false,
};

export default function ScoreboardAct({ active, rig }: { active: boolean; rig: Rig }) {
  const [s, setScene] = useState<Scene>(BLANK);
  // Scopes cursor-target lookups to THIS copy of the act. See ActApi.q.
  const rootRef = useRef<HTMLDivElement>(null);

  useAct(active, rig, rootRef, () => setScene(BLANK), async ({ alive, wait, rig: r, q }) => {
    const patch = (p: Partial<Scene>) => alive() && setScene((x) => ({ ...x, ...p }));
    const hit = (sel: string) => q(`[data-sb="${sel}"]`);
    const type = async (text: string, per: number, key: "name" | "goal") => {
      for (let i = 1; i <= text.length; i++) {
        if (!alive()) return;
        patch({ [key]: text.slice(0, i) } as Partial<Scene>);
        await wait(per);
      }
    };

    r.at(hit("add"), 0.5, 0.55);
    await r.fade(1, 200);
    if (!alive()) return;
    await wait(260);

    // ---- 1. add the metric
    patch({ addHot: true });
    await r.tap(hit("add"), 0.5, 0.55, 380);
    if (!alive()) return;
    patch({ addHot: false, draft: true, typing: "name" });
    await wait(220);
    await type(NEW_NAME, 34, "name");
    if (!alive()) return;
    await wait(180);

    patch({ typing: "goal" });
    await r.glide(hit("draft-goal"), 0.5, 0.5, 340);
    if (!alive()) return;
    await type(NEW_GOAL, 70, "goal");
    if (!alive()) return;
    await wait(240);
    patch({ typing: null, committed: true });
    await wait(420);

    // ---- 2. the row has nobody on it, so put somebody on it
    if (!alive()) return;
    await r.tap(hit("draft-owner"), 0.5, 0.5, 460);
    if (!alive()) return;
    patch({ ownerOpen: true });
    await wait(420);
    await r.tap(hit("owner-pick"), 0.5, 0.5, 320);
    if (!alive()) return;
    patch({ ownerOpen: false, ownerPicked: true });

    await wait(500);
    await r.fade(0, 380);
  });

  const HEAD =
    "border-b px-[6px] py-[7px] text-center text-[8.5px] font-semibold uppercase leading-[1.3] tracking-wide";
  const dash = <span style={{ color: T.muted2 }}>-</span>;

  return (
    <div ref={rootRef} className="relative flex h-full flex-col gap-[10px]">
      <PageHead
        title="Leadership Scoreboard"
        sub="High-level metrics every leader should track weekly."
        right={
          <>
            <Ghost>
              <IPlus className="h-[13px] w-[13px]" />
              New scoreboard
            </Ghost>
            <Ghost>
              <IDownload className="h-[13px] w-[13px] rotate-180" />
              Import
            </Ghost>
            <span data-sb="add">
              <BtnDark hot={s.addHot}>
                <IPlus className="h-[13px] w-[13px]" />
                Add Metric/KPI
              </BtnDark>
            </span>
          </>
        }
      />

      {/* fiscal row */}
      <div className="flex flex-none items-center gap-2 text-[11px]" style={{ color: T.muted }}>
        <span
          className="rounded-[6px] border px-2 py-1 font-semibold"
          style={{ borderColor: T.hair2, color: T.ink }}
        >
          FY 2026 (Current)
        </span>
        <span>· Week 26 of 52</span>
        <span className="ml-auto flex gap-[2px] rounded-[8px] p-[2px]" style={{ background: "#F1EEE9" }}>
          <span
            className="rounded-[6px] bg-white px-2 py-[3px] text-[10.5px] font-semibold shadow-sm"
            style={{ color: T.blue }}
          >
            Weekly
          </span>
        </span>
      </div>

      {/* AI insights */}
      <div
        className="flex flex-none items-center gap-[10px] rounded-[10px] border px-3 py-[9px]"
        style={{ borderColor: T.hair, background: "#fff" }}
      >
        <span
          className="grid h-[22px] w-[22px] flex-none place-items-center rounded-[7px]"
          style={{ background: "linear-gradient(135deg,#F49230,#EA7B1B)" }}
        >
          <ISpark className="h-[13px] w-[13px] text-white" />
        </span>
        <span className="flex-none text-[12.5px] font-bold">AI Insights</span>
        <Pill bg={T.orangeSoft} fg={T.orange}>
          AI-generated
        </Pill>
        <span className="truncate text-[12px]" style={{ color: "#57534C" }}>
          Revenue is pacing 8% ahead of goal. New Customers recovered after last week&apos;s dip.
        </span>
        <IChevron className="ml-auto h-[14px] w-[14px] flex-none" style={{ color: T.muted2 }} />
      </div>

      {/* filters */}
      <div className="flex flex-none items-center gap-1 text-[11.5px]">
        {["All", "High", "Watch"].map((f, i) => (
          <span
            key={f}
            className="rounded-[7px] px-[11px] py-[5px]"
            style={
              i === 0
                ? { background: "#EDEAE4", color: T.ink, fontWeight: 600 }
                : { color: T.muted }
            }
          >
            {f}
          </span>
        ))}
        <span className="flex items-center gap-1 px-2 py-[5px]" style={{ color: T.muted }}>
          <IUpDown className="h-[12px] w-[12px]" />
          Priority
        </span>
      </div>

      {/* the board */}
      <div
        className="relative min-h-0 flex-1 overflow-hidden rounded-[12px] border bg-white"
        style={{ borderColor: T.hair }}
      >
        <div className="w-full">
          {/* header */}
          <div className="flex" style={{ background: "#FAF9F7" }}>
            <div className={HEAD} style={{ width: COL.metric, borderColor: "#F1EEE9", textAlign: "left", paddingLeft: 14, color: T.muted }}>
              Metric
            </div>
            <div className={HEAD} style={{ width: COL.owner, borderColor: "#F1EEE9", color: T.muted }}>
              Owner
            </div>
            <div className={HEAD} style={{ width: COL.goal, borderColor: "#F1EEE9", color: T.muted }}>
              Goal
            </div>
            <div className={HEAD} style={{ width: COL.prev, borderColor: "#F1EEE9", color: T.muted }}>
              Previous
              <span className="block font-normal" style={{ color: T.muted2 }}>
                6/22-6/28
              </span>
            </div>
            <div
              className={HEAD}
              style={{ width: COL.cur, borderColor: "#F1EEE9", color: T.orange, background: "#FEF8F2" }}
            >
              Current
              <span className="block font-normal">6/29-7/5</span>
            </div>
            {WEEKS.map((w) => (
              <div key={w[0]} className={`${HEAD} flex-1`} style={{ borderColor: "#F1EEE9", color: T.muted2 }}>
                {w[0]}
                <span className="block font-normal">{w[1]}</span>
              </div>
            ))}
          </div>

          {/* rows */}
          {ROWS.map((r) => (
            <div key={r.name} className="flex items-stretch border-b" style={{ borderColor: "#F5F3EF" }}>
              <div
                className="flex items-center gap-2 py-[9px] pl-[14px] pr-2 text-[12px] font-bold"
                style={{ width: COL.metric }}
              >
                <span className="flex-none text-[11px]" style={{ color: T.muted2 }}>
                  {r.icon}
                </span>
                <span className="truncate">{r.name}</span>
              </div>
              <div className="grid place-items-center" style={{ width: COL.owner }}>
                <Av n={r.owner ?? "?"} size={22} />
              </div>
              <div className="grid place-items-center text-[11.5px] font-bold" style={{ width: COL.goal }}>
                {r.goal}
              </div>
              <div
                className="grid place-items-center text-[11.5px] font-semibold"
                style={{ width: COL.prev, color: T.pinkInk }}
              >
                {r.prev}
              </div>
              <div
                className="grid place-items-center text-[11.5px] font-bold"
                style={{ width: COL.cur, color: "#1F7F4C", background: "#FEFBF7" }}
              >
                {r.cur}
              </div>
              {WEEKS.map((w) => (
                <div key={w[0]} className="grid flex-1 place-items-center text-[11px]">
                  {dash}
                </div>
              ))}
            </div>
          ))}

          {/* the draft / new row */}
          <div
            className="flex items-stretch overflow-hidden border-b transition-all duration-[320ms] ease-out"
            style={{
              borderColor: "#F5F3EF",
              maxHeight: s.draft ? 44 : 0,
              opacity: s.draft ? 1 : 0,
              background: s.committed ? "#fff" : "#FEFBF7",
            }}
          >
            <div
              className="flex items-center gap-2 py-[9px] pl-[14px] pr-2 text-[12px] font-bold"
              style={{ width: COL.metric }}
            >
              <span className="flex-none text-[11px]" style={{ color: T.muted2 }}>
                ◔
              </span>
              <span className="truncate">
                {s.name}
                <Caret on={s.typing === "name"} />
              </span>
            </div>
            <div className="grid place-items-center" style={{ width: COL.owner }}>
              <span data-sb="draft-owner" className="grid place-items-center">
                {s.ownerPicked ? (
                  <Av n={OWNER.i} size={22} />
                ) : (
                  <span
                    className="grid h-[22px] w-[22px] place-items-center rounded-full border border-dashed text-[11px]"
                    style={{ borderColor: T.muted2, color: T.muted2 }}
                  >
                    +
                  </span>
                )}
              </span>
            </div>
            <div
              data-sb="draft-goal"
              className="grid place-items-center text-[11.5px] font-bold"
              style={{ width: COL.goal }}
            >
              <span
                className="rounded-[5px] px-[6px] py-[2px]"
                style={{
                  background: s.typing === "goal" ? "#FDF0E4" : "transparent",
                  boxShadow: s.typing === "goal" ? `0 0 0 1.5px ${T.orange}` : undefined,
                }}
              >
                {s.goal || <span style={{ color: T.muted2 }}>Goal</span>}
                <Caret on={s.typing === "goal"} />
              </span>
            </div>
            <div className="grid place-items-center text-[11px]" style={{ width: COL.prev }}>
              {dash}
            </div>
            <div
              className="grid place-items-center text-[11px]"
              style={{ width: COL.cur, background: "#FEFBF7" }}
            >
              {dash}
            </div>
            {WEEKS.map((w) => (
              <div key={w[0]} className="grid flex-1 place-items-center text-[11px]">
                {dash}
              </div>
            ))}
          </div>

          <div className="px-[14px] py-[9px] text-[10.5px]" style={{ color: T.muted2 }}>
            Scroll horizontally to see all 52 weeks. Click a cell to edit.
          </div>
        </div>

        {/* Owner picker. Lives INSIDE the board so it is positioned against the
            rows rather than against the act, and opens below the draft row. */}
        <div
          className="pointer-events-none absolute z-50 w-[196px] rounded-[10px] border bg-white p-[5px] transition-all duration-200"
          style={{
            borderColor: "rgba(0,0,0,0.09)",
            boxShadow: "0 6px 14px rgba(10,10,10,0.07), 0 20px 44px rgba(10,10,10,0.16)",
            left: PICKER_LEFT,
            top: PICKER_TOP,
            opacity: s.ownerOpen ? 1 : 0,
            transform: s.ownerOpen ? "translateY(0) scale(1)" : "translateY(-4px) scale(0.97)",
          }}
        >
          <div className="px-2 py-1 text-[9.5px] font-semibold uppercase tracking-wide" style={{ color: T.muted2 }}>
            Assign owner
          </div>
          {[OWNER, { n: "Marcus Reed", i: "MR" }, { n: "Priya Anand", i: "PA" }].map((p, i) => (
            <div
              key={p.n}
              data-sb={i === 0 ? "owner-pick" : undefined}
              className="flex items-center gap-2 rounded-[7px] px-2 py-[6px] text-[12px] font-semibold"
              style={{ background: i === 0 && s.ownerOpen ? "#F6F3EE" : "transparent" }}
            >
              <Av n={p.i} size={20} />
              {p.n}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
