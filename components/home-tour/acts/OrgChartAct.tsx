"use client";

// Tab 1 of 10 — Org Chart.
//
// Short cut of OrgChartHeroTour, which runs seven beats. Three survive, and the
// middle one is the reason this act got longer than the other nine:
//
//   2. Expand All    the company fans out, open seat included
//   3. drag a seat   an open seat moves to a new manager, and the chart reflows
//   6. Show DISC     the legend lands and every face gets a badge
//
// The drag is the beat the client asked for by name on the feature page, and it
// is the only one of the ten tabs where the pointer does something other than
// click: it presses, carries a card, and releases. Two clicks in a row read as a
// menu being operated; a press-carry-release reads as direct manipulation, which
// is the whole claim of an org chart you can reorganise.
//
// It moves an OPEN seat, deliberately, and for the same two reasons the feature
// tour gives: moving a named person between managers on a public marketing page
// depicts a demotion nobody asked for, and an open seat being re-hung is the
// more honest re-org anyway. A Support Specialist req moving off VP Sales and
// onto VP Operations is a decision a real company makes.
//
// The reflow is the payoff, so the layout is DERIVED from where the seat
// currently hangs rather than hardcoded. Both group widths change, so all three
// managers slide sideways and every connector re-hangs. That is why the kids are
// rendered as one flat absolutely-positioned list instead of nested inside their
// groups: the moved seat stays the same React element, so its `left` animates
// across instead of unmounting on one branch and remounting on another.
//
// The open seat is also deliberately unassessed, so when DISC comes on a beat
// later it is the grey dash rather than a colour. That is the coverage-gap
// argument arriving by itself.
//
// The cast is fictional and shares the mockup's CEO with the sidebar. None of
// Rise Up Kings's real org is on the public site.
import { useRef, useState } from "react";
import { useAct, type Rig } from "../rig";
import { Av, Ghost, BtnDark, IPersonPlus, PageHead, T } from "../ui";

const LINE = "#DCD7CE";
const CANVAS_W = 912;

const DISC = {
  D: { label: "Dominance", c: "#D6453C" },
  I: { label: "Influence", c: "#D69A28" },
  S: { label: "Steadiness", c: "#2BA463" },
  C: { label: "Compliance", c: "#2C6BA6" },
} as const;
type Disc = keyof typeof DISC | null;

// ---- cast
const CEO = { n: "Skylar Lewis", r: "Chief Executive Officer", i: "SL", d: "D" as Disc };

const MANAGERS = [
  { n: "Dana Whitfield", r: "VP Operations", i: "DW", d: "S" as Disc },
  { n: "Marcus Reed", r: "VP Sales", i: "MR", d: "D" as Disc },
  { n: "Priya Anand", r: "Controller", i: "PA", d: "C" as Disc },
];

type Kid = {
  n: string;
  r: string;
  i: string;
  d: Disc;
  /** Manager index this seat reports to before the drag. */
  home: number;
  /** Set on the one seat the drag beat moves. */
  movesTo?: number;
  open?: boolean;
};

const KIDS: Kid[] = [
  { n: "Tom Alvarez", r: "Operations Manager", i: "TA", d: "S", home: 0 },
  { n: "Jess Kim", r: "Onboarding Lead", i: "JK", d: "I", home: 0 },
  { n: "Ryan Cole", r: "Account Executive", i: "RC", d: "I", home: 1 },
  { n: "Bea Nolan", r: "Sales Development", i: "BN", d: "I", home: 1 },
  { n: "Open Seat", r: "Support Specialist", i: "+", d: null, home: 1, movesTo: 0, open: true },
  { n: "Luis Ortega", r: "Staff Accountant", i: "LO", d: "C", home: 2 },
  { n: "Amy Chen", r: "AP / AR", i: "AC", d: "S", home: 2 },
];

const MOVER = KIDS.findIndex((k) => k.movesTo !== undefined);
const MOVE_TO = KIDS[MOVER].movesTo as number;

// ---- geometry, all in canvas units
const KID_W = 120;
const KID_GAP = 10;
const GROUP_GAP = 14;
const MGR_W = 176;
const CEO_W = 200;

const Y = { ceo: 20, ceoH: 68, rule1: 116, mgr: 144, mgrH: 64, rule2: 236, kid: 266, kidH: 62 };
const CHART_H = Y.kid + Y.kidH;

/**
 * Where everything sits, given whether the seat has moved yet. Both layouts are
 * computed once at module scope and the render picks one, so the only thing that
 * changes at drag time is a set of `left` values that CSS can transition.
 */
function layout(moved: boolean) {
  const groups: number[][] = MANAGERS.map(() => []);
  KIDS.forEach((k, i) => {
    const g = moved && i === MOVER ? (k.movesTo as number) : k.home;
    groups[g].push(i);
  });
  const widths = groups.map((g) => g.length * KID_W + (g.length - 1) * KID_GAP);
  const total = widths.reduce((a, b) => a + b, 0) + GROUP_GAP * (MANAGERS.length - 1);
  const left0 = (CANVAS_W - total) / 2;
  const starts: number[] = [];
  widths.forEach((w, i) => {
    starts.push(i === 0 ? left0 : starts[i - 1] + widths[i - 1] + GROUP_GAP);
  });
  const centres = starts.map((s, i) => s + widths[i] / 2);
  // Centre of each kid, by kid index.
  const kidX: number[] = [];
  groups.forEach((g, gi) => {
    g.forEach((ki, slot) => {
      kidX[ki] = starts[gi] + KID_W / 2 + slot * (KID_W + KID_GAP);
    });
  });
  return { groups, widths, starts, centres, kidX };
}

const BEFORE = layout(false);
const AFTER = layout(true);

// Reveal order for the Expand All stagger. Pinned to the BEFORE layout so the
// drag cannot reorder it: the flat order changes when the seat changes group,
// and staggering off the live layout would let a card blink out mid-reflow.
const REVEAL: number[] = [];
BEFORE.groups.flat().forEach((ki, n) => {
  REVEAL[ki] = n;
});

// The drag happens while the chart is still in its BEFORE layout, so the drop
// zone is in BEFORE coordinates. It outlines the target MANAGER together with
// that manager's current reports, because the gesture is re-parenting: the seat
// is being made to report to Dana, and the chart makes room for it afterwards.
//
// An earlier version outlined the target group plus one empty slot to the right,
// meaning to show where the card would land. There is no empty slot in the
// BEFORE layout, so the outline ran straight over the first of the NEXT
// manager's reports and read as if that card were part of the drop.
const DROP_ZONE = (() => {
  const mgrLeft = BEFORE.centres[MOVE_TO] - MGR_W / 2;
  const left = Math.min(mgrLeft, BEFORE.starts[MOVE_TO]);
  const right = Math.max(mgrLeft + MGR_W, BEFORE.starts[MOVE_TO] + BEFORE.widths[MOVE_TO]);
  return { left: left - 10, width: right - left + 20, top: Y.mgr - 10, height: Y.kid + Y.kidH - Y.mgr + 20 };
})();

type Scene = {
  expanded: boolean;
  kids: number;
  /** A card is in the air: the source ghosts and the target group lights up. */
  dragging: boolean;
  moved: boolean;
  /** Which control the pointer is dwelling on, for the pre-click hover state. */
  hot: string;
  disc: boolean;
  badges: number;
  legend: boolean;
};
const BLANK: Scene = {
  expanded: false,
  kids: 0,
  dragging: false,
  moved: false,
  hot: "",
  disc: false,
  badges: 0,
  legend: false,
};

const BADGE_SLOTS = KIDS.length + MANAGERS.length + 1;

function Badge({ d, on }: { d: Disc; on: boolean }) {
  const c = d ? DISC[d].c : T.muted2;
  return (
    <span
      className="grid h-[15px] w-[15px] flex-none place-items-center rounded-[4px] text-[9px] font-bold transition-all duration-[240ms]"
      style={{
        background: d ? `${c}1F` : "#F1EEE9",
        color: c,
        opacity: on ? 1 : 0,
        transform: on ? "scale(1)" : "scale(0.4)",
      }}
    >
      {d ?? "–"}
    </span>
  );
}

export default function OrgChartAct({ active, rig }: { active: boolean; rig: Rig }) {
  const [s, setScene] = useState<Scene>(BLANK);
  // Scopes cursor-target lookups to THIS copy of the act. See ActApi.q.
  const rootRef = useRef<HTMLDivElement>(null);
  // The card that rides under the pointer during the drag. Animated
  // imperatively, alongside the cursor, so the two share one set of keyframes.
  const ghostRef = useRef<HTMLDivElement>(null);

  useAct(active, rig, rootRef, () => setScene(BLANK), async ({ alive, wait, rig: r, q }) => {
    const patch = (p: Partial<Scene>) => alive() && setScene((x) => ({ ...x, ...p }));
    const hit = (sel: string) => q(`[data-oc="${sel}"]`);

    // Glide, dwell on the control, then click. The dwell is what the feature
    // tour does and what this act was missing: without it the pointer arrives
    // and fires in the same instant, which reads as a jump cut.
    const tap = async (key: string, dur = 480, hold = 240) => {
      await r.glide(hit(key), 0.5, 0.55, dur);
      if (!alive()) return false;
      patch({ hot: key });
      await wait(hold);
      if (!alive()) return false;
      await r.click();
      patch({ hot: "" });
      return alive();
    };

    r.at(hit("expand"), 0.5, 0.55);
    await r.fade(1, 220);
    if (!alive()) return;
    await wait(300);

    // ---- 1. Expand All
    if (!(await tap("expand", 420))) return;
    patch({ expanded: true });
    for (let i = 1; i <= KIDS.length; i++) {
      await wait(58);
      if (!alive()) return;
      patch({ kids: i });
    }
    await wait(280);

    // ---- 2. press, carry, release
    await r.glide(hit("mover"), 0.5, 0.42, 620);
    if (!alive()) return;
    patch({ hot: "mover" });
    await wait(250);
    if (!alive()) return;
    await r.click();
    // Park the ghost on the pointer BEFORE it becomes visible.
    r.park(ghostRef.current);
    patch({ dragging: true, hot: "" });
    await wait(250);
    if (!alive()) return;

    await r.carry(r.pointAt(hit("drop"), 0.5, 0.5), ghostRef.current, 880);
    if (!alive()) return;
    await wait(300);
    await r.click();
    if (!alive()) return;
    patch({ dragging: false, moved: true });
    // Let the reflow finish before the pointer leaves for the next control.
    await wait(560);

    // ---- 3. Show DISC
    if (!(await tap("disc", 520, 200))) return;
    patch({ disc: true, legend: true });
    for (let i = 1; i <= BADGE_SLOTS; i++) {
      await wait(46);
      if (!alive()) return;
      patch({ badges: i });
    }

    await r.fade(0, 400);
  });

  const L = s.moved ? AFTER : BEFORE;
  const showKid = (ki: number) => s.expanded && s.kids > REVEAL[ki];
  const badgeOn = (slot: number) => s.disc && s.badges > slot;
  // The seat in the air is hidden in place, the way a real drag source ghosts.
  const lifted = (ki: number) => s.dragging && ki === MOVER;

  const FLOW = "left 520ms cubic-bezier(0.22,1,0.36,1), width 520ms cubic-bezier(0.22,1,0.36,1)";

  return (
    <div ref={rootRef} className="flex h-full flex-col gap-3">
      <PageHead
        title="Org Chart"
        sub="Drag roles to reorganise. Every seat, every reporting line, one page."
        right={
          <>
            <span data-oc="expand">
              <Ghost hot={s.hot === "expand"}>Expand All</Ghost>
            </span>
            <span data-oc="disc">
              <Ghost hot={s.hot === "disc" || s.disc}>Show DISC</Ghost>
            </span>
            <BtnDark>
              <IPersonPlus className="h-[13px] w-[13px]" />
              New User/Role
            </BtnDark>
          </>
        }
      />

      <div
        className="relative min-h-0 flex-1 overflow-hidden rounded-[12px] border bg-white"
        style={{ borderColor: T.hair }}
      >
        {/* DISC legend */}
        <div
          className="absolute left-4 top-4 z-10 flex items-center gap-3 rounded-[10px] border bg-white px-3 py-2 transition-all duration-[420ms]"
          style={{
            borderColor: T.hair2,
            opacity: s.legend ? 1 : 0,
            transform: s.legend ? "translateY(0)" : "translateY(-6px)",
            boxShadow: "0 8px 18px -12px rgba(40,30,15,0.35)",
          }}
        >
          {(Object.keys(DISC) as (keyof typeof DISC)[]).map((k) => (
            <span key={k} className="flex items-center gap-[6px] text-[10.5px] font-semibold" style={{ color: "#57534C" }}>
              <span
                className="grid h-[15px] w-[15px] place-items-center rounded-[4px] text-[9px] font-bold"
                style={{ background: `${DISC[k].c}1F`, color: DISC[k].c }}
              >
                {k}
              </span>
              {DISC[k].label}
            </span>
          ))}
          <span className="flex items-center gap-[6px] text-[10.5px] font-semibold" style={{ color: T.muted }}>
            <span
              className="grid h-[15px] w-[15px] place-items-center rounded-[4px] text-[9px] font-bold"
              style={{ background: "#F1EEE9", color: T.muted2 }}
            >
              –
            </span>
            Not assessed
          </span>
        </div>

        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: CANVAS_W, height: CHART_H }}
        >
          {/* ---- drop zone: the manager the seat is being re-parented to ---- */}
          <div
            className="absolute rounded-[12px] border-2 border-dashed transition-all duration-300"
            style={{
              left: DROP_ZONE.left,
              top: DROP_ZONE.top,
              width: DROP_ZONE.width,
              height: DROP_ZONE.height,
              borderColor: s.dragging ? T.orange : "transparent",
              background: s.dragging ? "rgba(234,123,27,0.07)" : "transparent",
            }}
          />

          {/* ---- connectors, CEO to managers ---- */}
          <i
            className="absolute"
            style={{ left: CANVAS_W / 2, top: Y.ceo + Y.ceoH, width: 1, height: Y.rule1 - (Y.ceo + Y.ceoH), background: LINE }}
          />
          <i
            className="absolute"
            style={{
              left: L.centres[0],
              top: Y.rule1,
              width: L.centres[L.centres.length - 1] - L.centres[0],
              height: 1,
              background: LINE,
              transition: FLOW,
            }}
          />
          {L.centres.map((c, i) => (
            <i
              key={`mv${i}`}
              className="absolute"
              style={{ left: c, top: Y.rule1, width: 1, height: Y.mgr - Y.rule1, background: LINE, transition: FLOW }}
            />
          ))}

          {/* ---- CEO ---- */}
          <div
            className="absolute flex items-center gap-[10px] rounded-[11px] border bg-white px-3"
            style={{
              left: (CANVAS_W - CEO_W) / 2,
              top: Y.ceo,
              width: CEO_W,
              height: Y.ceoH,
              borderColor: T.hair2,
              boxShadow: "0 6px 14px -10px rgba(40,30,15,0.3)",
            }}
          >
            <Av n={CEO.i} size={34} bg="linear-gradient(135deg,#F49230,#D8563F)" sq />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-bold leading-tight">{CEO.n}</span>
              <span className="block truncate text-[11px]" style={{ color: T.muted }}>
                {CEO.r}
              </span>
            </span>
            <Badge d={CEO.d} on={badgeOn(0)} />
          </div>

          {/* ---- managers, and each one's own sibling rule ---- */}
          {MANAGERS.map((m, gi) => (
            <div key={m.n}>
              <div
                // The release target for the drag beat: you drop onto the
                // manager, not onto a slot in the row.
                data-oc={gi === MOVE_TO ? "drop" : undefined}
                className="absolute flex items-center gap-[9px] rounded-[10px] border bg-white px-[10px]"
                style={{
                  left: L.centres[gi] - MGR_W / 2,
                  top: Y.mgr,
                  width: MGR_W,
                  height: Y.mgrH,
                  borderColor: s.dragging && gi === MOVE_TO ? T.orange : T.hair2,
                  boxShadow: "0 5px 12px -10px rgba(40,30,15,0.28)",
                  transition: `${FLOW}, border-color 300ms`,
                }}
              >
                <Av n={m.i} size={30} bg={T.navy} sq />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-bold leading-tight">{m.n}</span>
                  <span className="block truncate text-[10.5px]" style={{ color: T.muted }}>
                    {m.r}
                  </span>
                </span>
                <Badge d={m.d} on={badgeOn(gi + 1)} />
              </div>

              <i
                className="absolute"
                style={{
                  left: L.centres[gi],
                  top: Y.mgr + Y.mgrH,
                  width: 1,
                  height: Y.rule2 - (Y.mgr + Y.mgrH),
                  background: LINE,
                  opacity: s.expanded ? 1 : 0,
                  transition: `${FLOW}, opacity 300ms`,
                }}
              />
              <i
                className="absolute"
                style={{
                  left: L.kidX[L.groups[gi][0]],
                  top: Y.rule2,
                  width: L.kidX[L.groups[gi][L.groups[gi].length - 1]] - L.kidX[L.groups[gi][0]],
                  height: 1,
                  background: LINE,
                  opacity: s.expanded ? 1 : 0,
                  transition: `${FLOW}, opacity 300ms`,
                }}
              />
            </div>
          ))}

          {/* ---- kids, one flat list so the moved seat keeps its identity ---- */}
          {KIDS.map((k, ki) => {
            const on = showKid(ki);
            const x = L.kidX[ki];
            return (
              <div key={k.n}>
                <i
                  className="absolute"
                  style={{
                    left: x,
                    top: Y.rule2,
                    width: 1,
                    height: Y.kid - Y.rule2,
                    background: LINE,
                    opacity: on && !lifted(ki) ? 1 : 0,
                    transition: `${FLOW}, opacity 300ms`,
                  }}
                />
                <div
                  data-oc={k.movesTo !== undefined ? "mover" : undefined}
                  className="absolute flex flex-col justify-center gap-[3px] rounded-[9px] border bg-white px-[9px]"
                  style={{
                    left: x - KID_W / 2,
                    top: Y.kid,
                    width: KID_W,
                    height: Y.kidH,
                    borderColor: k.open ? "#DED9D0" : T.hair2,
                    borderStyle: k.open ? "dashed" : "solid",
                    background: k.open ? "#FBFAF8" : "#fff",
                    opacity: on ? (lifted(ki) ? 0.28 : 1) : 0,
                    transform: on ? "translateY(0) scale(1)" : "translateY(-10px) scale(0.94)",
                    transition: `${FLOW}, opacity 300ms, transform 320ms cubic-bezier(0.22,1,0.36,1)`,
                  }}
                >
                  <span className="flex items-center gap-[6px]">
                    <Av n={k.i} size={20} bg={k.open ? "#CFC9BF" : "#5B6470"} sq />
                    <span
                      className="min-w-0 flex-1 truncate text-[10.5px] font-bold leading-tight"
                      style={{ color: k.open ? T.muted : T.ink }}
                    >
                      {k.n}
                    </span>
                  </span>
                  {/* The DISC badge sits on the ROLE line. On the name line it
                      took 21px off a 102px card and every full name truncated. */}
                  <span className="flex items-center gap-[5px]">
                    <span className="min-w-0 flex-1 truncate text-[9.5px]" style={{ color: T.muted2 }}>
                      {k.r}
                    </span>
                    <Badge d={k.d} on={badgeOn(MANAGERS.length + 1 + ki)} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ---- the card in the air ----
            Offset up and left of the pointer the way a real drag image sits, and
            tilted a little so it reads as lifted rather than as a second card
            that happens to be there. Positioned imperatively by rig.carry. */}
        <div
          ref={ghostRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 z-[88] origin-top-left transition-opacity duration-150"
          style={{ opacity: s.dragging ? 1 : 0 }}
        >
          <div
            className="-ml-[26px] -mt-[16px] w-[120px] rotate-[-3deg] rounded-[9px] border bg-white px-[9px] py-[7px]"
            style={{
              borderColor: "#F0C79A",
              boxShadow: "0 16px 30px -10px rgba(40,30,15,0.45)",
            }}
          >
            <span className="flex items-center gap-[6px]">
              <Av n={KIDS[MOVER].i} size={20} bg="#CFC9BF" sq />
              <span className="min-w-0 flex-1 truncate text-[10.5px] font-bold leading-tight" style={{ color: T.muted }}>
                {KIDS[MOVER].n}
              </span>
            </span>
            <span className="mt-[3px] block truncate text-[9.5px]" style={{ color: T.muted2 }}>
              {KIDS[MOVER].r}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
