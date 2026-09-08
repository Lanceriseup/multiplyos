"use client";

// Tab 6 of 10 — Projects.
//
// The client's line for this one was "Projects (show tasks in projects)", so the
// tab has to end up inside a project looking at its work, not on the gallery.
//
// Short cut of ProjectsTasksHeroTour, and it now keeps that tour's whole first
// act, which an earlier version of this file dropped:
//
//   1. the gallery      open "Client Onboarding"
//   2. the views        List -> Board -> Timeline, the SAME tasks
//   4. it closes out    tick a task, and 259/352 becomes 260/352
//
// Beat 2 is the one that was missing and the one that makes this tab worth its
// length. A list of tasks is a list of tasks; the same eight tasks as a status
// board and then as a Gantt is the argument, because it means the project has
// one set of work that different people can look at in the shape they think in.
//
// SO THE THREE VIEWS ARE DERIVED FROM ONE ARRAY. TASKS below is the single
// source: the list renders it as rows, the board buckets it by `status`, and the
// timeline lays the same rows out by `start` and `span`, colouring each bar by
// the same status colour its board column uses. If they were three hardcoded
// datasets the claim would be a lie that happened to look true, and the first
// edit to one of them would break it.
//
// Dropped from the full tour: the My Tasks detour that carries the tick, and the
// whole third act (share the task, copy the link, add collaborators). The tick
// happens in place here instead, which costs one view swap less.
//
// The counter moving is what makes the tick mean something. A checkbox on its
// own is a checkbox; a checkbox that moves the project's own number is the
// product.
//
// The featured project is deliberately one almost every business runs, so it
// reads as "this is your work" rather than "this is somebody's website".
import { useRef, useState } from "react";
import { useAct, type Rig } from "../rig";
import { Av, IBoard, IChevron, IClock, IPlus, PageHead, Pill, T, Tick } from "../ui";

const DONE0 = 259;
const TOTAL = 352;

const STATUS = {
  planned: { label: "Not Started", color: T.muted2, n: 66 },
  active: { label: "In Progress", color: T.blue, n: 13 },
  hold: { label: "On Hold", color: T.amber, n: 3 },
  review: { label: "In Review", color: T.purple, n: 7 },
} as const;
type StatusKey = keyof typeof STATUS;
/** Board column order, which is also the order the tour reads them in. */
const COLS: StatusKey[] = ["planned", "active", "hold", "review"];

const WEEKS = ["Aug 3", "Aug 10", "Aug 17", "Aug 24", "Aug 31", "Sep 7", "Sep 14", "Sep 21"];

// The ONE array all three views render. `start` and `span` are in WEEKS units.
type Task = {
  n: string;
  who: string;
  due: string;
  status: StatusKey;
  start: number;
  span: number;
};
const TASKS: Task[] = [
  { n: "Collect brand assets and logins", who: "JK", due: "Aug 12", status: "active", start: 1, span: 2 },
  { n: "Kickoff call and scope confirmation", who: "DW", due: "Aug 14", status: "active", start: 0, span: 2 },
  { n: "Countersign the agreement", who: "RC", due: "Aug 13", status: "review", start: 1, span: 1 },
  { n: "Custom integration request", who: "TA", due: "Aug 15", status: "hold", start: 2, span: 2 },
  { n: "Set up their account and workspace", who: "TA", due: "Aug 21", status: "planned", start: 2, span: 3 },
  { n: "Welcome packet and first invoice", who: "RC", due: "Aug 22", status: "review", start: 3, span: 1 },
  { n: "Training session with their team", who: "JK", due: "Sep 2", status: "planned", start: 4, span: 3 },
  { n: "Thirty-day review and handover", who: "DW", due: "Sep 9", status: "planned", start: 7, span: 1 },
];
/** The row the pointer ticks. */
const TICK = 0;

const GALLERY = [
  { n: "Client Onboarding", d: DONE0, t: TOTAL, c: T.orange, team: ["JK", "DW", "TA"] },
  { n: "Q2 Product Launch", d: 84, t: 190, c: T.purple, team: ["RC", "SL"] },
  { n: "Website Rebuild", d: 41, t: 128, c: T.blue, team: ["BN", "RC", "JK"] },
  { n: "Annual Audit", d: 12, t: 64, c: "#7A4E28", team: ["PA", "LO"] },
];

type ViewKey = "list" | "board" | "timeline";
const VIEWS: { k: ViewKey; label: string }[] = [
  { k: "list", label: "List" },
  { k: "board", label: "Board" },
  { k: "timeline", label: "Timeline" },
];

type Scene = {
  open: boolean;
  view: ViewKey;
  hot: string;
  ticked: boolean;
};
const BLANK: Scene = { open: false, view: "list", hot: "", ticked: false };

export default function ProjectsAct({ active, rig }: { active: boolean; rig: Rig }) {
  const [s, setScene] = useState<Scene>(BLANK);
  // Scopes cursor-target lookups to THIS copy of the act. See ActApi.q.
  const rootRef = useRef<HTMLDivElement>(null);

  useAct(active, rig, rootRef, () => setScene(BLANK), async ({ alive, wait, rig: r, q }) => {
    const patch = (p: Partial<Scene>) => alive() && setScene((x) => ({ ...x, ...p }));
    const hit = (k: string) => q(`[data-pj="${k}"]`);
    const tap = async (key: string, dur = 420, hold = 200) => {
      await r.glide(hit(key), 0.5, 0.5, dur);
      if (!alive()) return false;
      patch({ hot: key });
      await wait(hold);
      if (!alive()) return false;
      await r.click();
      patch({ hot: "" });
      return alive();
    };

    r.at(hit("card0"), 0.5, 0.4);
    await r.fade(1, 200);
    if (!alive()) return;
    await wait(220);

    // ---- 1. open the project
    if (!(await tap("card0", 480, 220))) return;
    patch({ open: true, view: "list" });
    await wait(700);

    // ---- 2. the same work, in three shapes
    if (!(await tap("v-board", 420))) return;
    patch({ view: "board" });
    await wait(1000);

    if (!(await tap("v-timeline", 380))) return;
    patch({ view: "timeline" });
    await wait(1100);

    if (!(await tap("v-list", 380))) return;
    patch({ view: "list" });
    await wait(350);

    // ---- 3. and it closes out
    if (!alive()) return;
    await r.glide(hit(`t${TICK}`), 0.035, 0.5, 420);
    if (!alive()) return;
    await r.click();
    if (!alive()) return;
    patch({ ticked: true });

    await wait(700);
    await r.fade(0, 380);
  });

  const done = DONE0 + (s.ticked ? 1 : 0);
  const pct = (done / TOTAL) * 100;

  return (
    <div ref={rootRef} className="relative h-full">
      {/* ---------------- the gallery ---------------- */}
      <div
        className="absolute inset-0 flex flex-col gap-3 transition-all duration-[320ms] ease-out"
        style={{
          opacity: s.open ? 0 : 1,
          transform: s.open ? "scale(0.985)" : "scale(1)",
          pointerEvents: "none",
        }}
      >
        <PageHead
          title="Projects"
          sub="Every project your team is running, and everything left in it."
          right={
            <span className="inline-flex rounded-[8px] p-[3px]" style={{ background: "#EDEAE4" }}>
              {["Active", "All", "Archived"].map((v, i) => (
                <span
                  key={v}
                  className="rounded-[6px] px-3 py-[5px] text-[12px]"
                  style={
                    i === 0
                      ? { background: "#fff", color: T.ink, fontWeight: 600, boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }
                      : { color: T.muted }
                  }
                >
                  {v}
                </span>
              ))}
            </span>
          }
        />
        <div className="grid min-h-0 flex-1 grid-cols-2 gap-3">
          {GALLERY.map((p, i) => (
            <div
              key={p.n}
              data-pj={`card${i}`}
              className="flex flex-col justify-between rounded-[12px] border bg-white p-4 transition-all duration-200"
              style={{
                borderColor: s.hot === `card${i}` ? T.orange : T.hair,
                boxShadow: s.hot === `card${i}` ? "0 0 0 3px rgba(234,123,27,0.16)" : undefined,
              }}
            >
              <div className="flex items-start gap-[10px]">
                <span
                  className="grid h-[30px] w-[30px] flex-none place-items-center rounded-[8px]"
                  style={{ background: `${p.c}18`, color: p.c }}
                >
                  <IBoard className="h-[16px] w-[16px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14.5px] font-bold">{p.n}</div>
                  <div className="mt-[2px] text-[11.5px]" style={{ color: T.muted }}>
                    {p.d} of {p.t} tasks complete
                  </div>
                </div>
                <span className="flex flex-none -space-x-[6px]">
                  {p.team.map((m) => (
                    <span key={m} className="rounded-full ring-2 ring-white">
                      <Av n={m} size={22} />
                    </span>
                  ))}
                </span>
              </div>
              <div className="mt-4">
                <div className="h-[6px] overflow-hidden rounded-full" style={{ background: "#F1EEE9" }}>
                  <span
                    className="block h-full rounded-full"
                    style={{ width: `${(p.d / p.t) * 100}%`, background: p.c }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---------------- inside the project ---------------- */}
      <div
        className="absolute inset-0 flex flex-col gap-3 transition-all duration-[320ms] ease-out"
        style={{
          opacity: s.open ? 1 : 0,
          transform: s.open ? "scale(1)" : "scale(1.012)",
          pointerEvents: "none",
        }}
      >
        <PageHead
          title="Client Onboarding"
          sub="Projects / Client Onboarding"
          right={
            <>
              {/* The view switch. Each segment is its own cursor target. */}
              <span className="inline-flex rounded-[8px] p-[3px]" style={{ background: "#EDEAE4" }}>
                {VIEWS.map((v) => {
                  const on = v.k === s.view;
                  return (
                    <span
                      key={v.k}
                      data-pj={`v-${v.k}`}
                      className="rounded-[6px] px-3 py-[5px] text-[12px] transition-all duration-200"
                      style={
                        on
                          ? { background: "#fff", color: T.ink, fontWeight: 600, boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }
                          : {
                              color: s.hot === `v-${v.k}` ? T.orange : T.muted,
                              background: s.hot === `v-${v.k}` ? "rgba(255,255,255,0.6)" : "transparent",
                            }
                      }
                    >
                      {v.label}
                    </span>
                  );
                })}
              </span>
              <span
                className="inline-flex items-center gap-[6px] rounded-[8px] px-[13px] py-2 text-[12.5px] font-semibold text-white"
                style={{ background: T.navy }}
              >
                <IPlus className="h-[13px] w-[13px]" />
                Add task
              </span>
            </>
          }
        />

        {/* the project's own number, which the tick below moves */}
        <div
          className="flex flex-none items-center gap-4 rounded-[12px] border bg-white px-4 py-[13px]"
          style={{ borderColor: T.hair }}
        >
          <span className="flex-none">
            <span className="text-[10.5px] font-bold uppercase tracking-[0.09em]" style={{ color: T.muted }}>
              Progress
            </span>
            <span className="mt-[2px] block text-[19px] font-[780] leading-none tracking-[-0.02em] tabular-nums">
              <span
                className="inline-block transition-colors duration-300"
                style={{ color: s.ticked ? "#1F8A52" : T.ink }}
              >
                {done}
              </span>
              <span style={{ color: T.muted2 }}> / {TOTAL}</span>
            </span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block h-[8px] overflow-hidden rounded-full" style={{ background: "#F1EEE9" }}>
              <span
                className="block h-full rounded-full transition-all duration-[520ms] ease-out"
                style={{ width: `${pct}%`, background: T.orange }}
              />
            </span>
          </span>
          <Pill bg={T.amberSoft} fg={T.amber}>
            <IClock className="h-[11px] w-[11px]" />
            Due Sep 9
          </Pill>
        </div>

        {/* the body, one shape at a time */}
        <div className="relative min-h-0 flex-1">
          {/* ---- list ---- */}
          <div
            className="absolute inset-0 flex flex-col overflow-hidden rounded-[12px] border bg-white transition-opacity duration-[260ms]"
            style={{ borderColor: T.hair, opacity: s.view === "list" ? 1 : 0 }}
          >
            <div
              className="flex flex-none items-center border-b px-4 py-[8px] text-[8.5px] font-semibold uppercase tracking-wide"
              style={{ borderColor: "#F1EEE9", background: "#FAF9F7", color: T.muted }}
            >
              <span className="flex-1 pl-[26px]">Task</span>
              <span className="w-[86px] text-center">Assignee</span>
              <span className="w-[76px] text-center">Due</span>
              <span className="w-[104px] text-center">Status</span>
            </div>

            {TASKS.map((t, i) => {
              const on = i === TICK && s.ticked;
              const st = STATUS[t.status];
              return (
                <div
                  key={t.n}
                  data-pj={`t${i}`}
                  className="flex items-center border-b px-4 py-[9px] text-[12.5px] transition-colors duration-300"
                  style={{ borderColor: "#F5F3EF", background: on ? "#FAFDFB" : "#fff" }}
                >
                  <span className="flex min-w-0 flex-1 items-center gap-[11px]">
                    <Tick on={on} size={15} />
                    <span
                      className="truncate transition-all duration-[280ms]"
                      style={{
                        color: on ? T.muted : T.ink,
                        textDecoration: on ? "line-through" : undefined,
                        fontWeight: on ? 500 : 600,
                      }}
                    >
                      {t.n}
                    </span>
                  </span>
                  <span className="grid w-[86px] place-items-center">
                    <Av n={t.who} size={21} />
                  </span>
                  <span className="w-[76px] text-center text-[11px]" style={{ color: T.muted }}>
                    {t.due}
                  </span>
                  <span className="grid w-[104px] place-items-center">
                    {on ? (
                      <Pill bg={T.greenSoft} fg="#1F8A52">
                        Done
                      </Pill>
                    ) : (
                      <Pill bg={`${st.color}18`} fg={st.color}>
                        {st.label}
                      </Pill>
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          {/* ---- board: the same tasks, bucketed by status ---- */}
          <div
            className="absolute inset-0 overflow-hidden rounded-[12px] border transition-opacity duration-[260ms]"
            style={{
              borderColor: T.hair,
              background: "#FBFAF8",
              opacity: s.view === "board" ? 1 : 0,
            }}
          >
            <div className="flex h-full gap-[10px] p-3">
              {COLS.map((k) => {
                const st = STATUS[k];
                const cards = TASKS.filter((t) => t.status === k);
                return (
                  <div key={k} className="flex min-w-0 flex-1 flex-col">
                    <div className="mb-2 flex flex-none items-center gap-[6px]">
                      <span className="h-[6px] w-[6px] flex-none rounded-full" style={{ background: st.color }} />
                      <b className="truncate text-[11.5px]">{st.label}</b>
                      <span className="ml-auto text-[10px] tabular-nums" style={{ color: T.muted2 }}>
                        {st.n}
                      </span>
                    </div>
                    <div className="space-y-[6px]">
                      {cards.map((c) => (
                        <div
                          key={c.n}
                          className="rounded-[9px] border bg-white p-2"
                          style={{ borderColor: T.hair, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
                        >
                          <p className="text-[11px] font-medium leading-snug">{c.n}</p>
                          <div className="mt-2 flex items-center gap-[6px]">
                            <span className="text-[9.5px] tabular-nums" style={{ color: T.muted2 }}>
                              {c.due}
                            </span>
                            <span className="ml-auto">
                              <Av n={c.who} size={17} />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ---- timeline: the same tasks, laid out in weeks ---- */}
          <div
            className="absolute inset-0 overflow-hidden rounded-[12px] border bg-white transition-opacity duration-[260ms]"
            style={{ borderColor: T.hair, opacity: s.view === "timeline" ? 1 : 0 }}
          >
            <div className="flex border-b" style={{ borderColor: "#F1EEE9", background: "#FAF9F7" }}>
              <span
                className="w-[248px] flex-none border-r px-3 py-[7px] text-[8.5px] font-bold uppercase tracking-[0.08em]"
                style={{ borderColor: "#F1EEE9", color: T.muted }}
              >
                Task
              </span>
              <span className="flex min-w-0 flex-1">
                {WEEKS.map((w) => (
                  <span
                    key={w}
                    className="min-w-0 flex-1 border-r py-[7px] text-center text-[9px] font-semibold tabular-nums last:border-r-0"
                    style={{ borderColor: "#F1EEE9", color: T.muted }}
                  >
                    {w}
                  </span>
                ))}
              </span>
            </div>
            {TASKS.map((g) => {
              const st = STATUS[g.status];
              return (
                <div key={g.n} className="flex items-center border-b last:border-b-0" style={{ borderColor: "#F5F2ED" }}>
                  <span
                    className="flex w-[248px] flex-none items-center gap-[7px] border-r px-3 py-[7px]"
                    style={{ borderColor: "#F1EEE9" }}
                  >
                    <Av n={g.who} size={17} />
                    <span className="min-w-0 truncate text-[11px] font-medium">{g.n}</span>
                  </span>
                  <span className="relative flex min-w-0 flex-1 py-[7px]">
                    {WEEKS.map((w) => (
                      <span
                        key={w}
                        className="min-w-0 flex-1 border-r last:border-r-0"
                        style={{ borderColor: "#F5F2ED" }}
                      />
                    ))}
                    {/* Bar colour is the task's own status colour, so a card in
                        the board's In Review column is the same colour here. */}
                    <span
                      className="absolute top-1/2 h-[11px] -translate-y-1/2 rounded-full transition-all duration-[420ms] ease-out"
                      style={{
                        left: `${(g.start / WEEKS.length) * 100}%`,
                        width: s.view === "timeline" ? `calc(${(g.span / WEEKS.length) * 100}% - 5px)` : 0,
                        background: st.color,
                        marginLeft: 2.5,
                      }}
                    />
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-none items-center px-1 text-[11.5px]" style={{ color: T.muted2 }}>
          <span className="flex items-center gap-[7px]">
            <IPlus className="h-[13px] w-[13px]" />
            Add a task
          </span>
          {/* Left-aligned, not ml-auto: the floating Ask Multi AI pill sits
              bottom-right of the frame and was covering it. */}
          <span className="ml-4 flex items-center gap-1">
            {TASKS.length} of {TOTAL - DONE0} open shown
            <IChevron className="h-[12px] w-[12px]" />
          </span>
        </div>
      </div>
    </div>
  );
}
