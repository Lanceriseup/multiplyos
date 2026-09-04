"use client";

// Animated hero for the Metrics Scoreboard feature page.
//
// A pointer performs a four-act tour on a loop, at 1x pacing:
//   1. switch scoreboards        Tech -> Marketing -> Accounting
//   2. add a metric + its goal   types "Net Profit Margin", then "18%"
//   2b. assign its owner         the row lands unassigned, then gets a name
//   3. open the trend chart      orange series drawing over a dashed goal line
//
// Act 2b was added August 2026. Every row used to render the same hardcoded "SL"
// avatar, so the Owner column was present without demonstrating anything. Rows
// now carry their own owner and the added metric starts with nobody on it, which
// is what makes the assignment beat mean something.
//
// Board content is React state; only the cursor and the ripple are animated
// imperatively via the Web Animations API, the same split FeatureScoreboards
// uses. The sequence is generation-token guarded, so a re-render or unmount
// cancels the in-flight tour rather than leaving orphaned timers behind.
//
// Layout: the board is FLUID and fills its container, with a floor of MIN_W
// below which it scales down proportionally. Cursor targets are measured from
// live rects and divided by the scale, so both modes stay in sync.
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

const MIN_W = 960; // narrower than this and the whole stage scales down
const EASE = "cubic-bezier(0.22,1,0.36,1)";

// ---------------------------------------------------------------- data
type Unit = "int" | "pct" | "usdk" | "usd" | "hours";

// One accountable person per metric, which is the point of the Owner column.
// Every row used to render the same hardcoded avatar, so the column was there
// without demonstrating anything.
const PEOPLE = {
  SL: { name: "Skylar Lewis", role: "Leadership", from: "#F49230", to: "#D8563F" },
  DW: { name: "Dana Whitfield", role: "Leadership", from: "#6C5CE0", to: "#3B2EA6" },
  PN: { name: "Priya Nair", role: "Marketing", from: "#2E9E7A", to: "#1F7F4C" },
  MH: { name: "Marcus Hale", role: "Operations", from: "#C9832B", to: "#9A6115" },
  KN: { name: "Kath Nakamura", role: "Technology", from: "#3F8FCB", to: "#1F4E7A" },
  JR: { name: "Jordan Rivera", role: "Sales", from: "#C9663A", to: "#8E3F1D" },
  NP: { name: "Nina Petrova", role: "Marketing", from: "#A75486", to: "#6E2E56" },
} as const;

type Who = keyof typeof PEOPLE;

type Row = {
  name: string;
  owner: Who;
  goal: string; // display form, e.g. "$50,000"
  gv: number; // goal in series units
  unit: Unit;
  lower?: boolean; // true when lower is better
  hist: number[]; // 6 completed weeks before Previous
  prev: number;
  cur: number;
};

type Board = { name: string; color: string; group: string; rows: Row[] };

const BOARDS: Board[] = [
  {
    name: "Tech Scoreboard",
    color: "#2C6BA6",
    group: "Growth Program",
    rows: [
      { name: "Offer Visitors", owner: "KN", goal: "125", gv: 125, unit: "int", hist: [112, 87, 131, 104, 119, 96], prev: 104, cur: 138 },
      { name: "Total Sign Ups for the week", owner: "JR", goal: "50", gv: 50, unit: "int", hist: [44, 35, 52, 41, 47, 39], prev: 41, cur: 56 },
      { name: "# logged in", owner: "KN", goal: "2", gv: 2, unit: "int", hist: [2, 0, 3, 1, 2, 1], prev: 1, cur: 3 },
      { name: "App logins", owner: "KN", goal: "230", gv: 230, unit: "int", hist: [218, 196, 241, 212, 227, 208], prev: 212, cur: 244 },
      { name: "% logged in out of last 4 week's enrollees", owner: "JR", goal: "25%", gv: 25, unit: "pct", hist: [27, 15, 31, 19, 24, 17], prev: 18, cur: 21 },
    ],
  },
  {
    name: "Marketing Scoreboard",
    color: "#8A3F6D",
    group: "Demand Generation",
    rows: [
      { name: "Landing Page Visitors", owner: "NP", goal: "2,400", gv: 2400, unit: "int", hist: [2380, 1980, 2510, 2240, 2450, 2160], prev: 2180, cur: 2615 },
      { name: "New Leads", owner: "PN", goal: "120", gv: 120, unit: "int", hist: [118, 94, 131, 110, 124, 105], prev: 108, cur: 134 },
      { name: "Email Open Rate", owner: "NP", goal: "35%", gv: 35, unit: "pct", hist: [36, 29, 38, 33, 37, 32], prev: 33, cur: 41 },
      { name: "Cost per Lead", owner: "PN", goal: "$18", gv: 18, unit: "usd", lower: true, hist: [19, 24, 17, 21, 16, 23], prev: 23, cur: 21 },
      { name: "Social Followers", owner: "NP", goal: "8,500", gv: 8500, unit: "int", hist: [8240, 8090, 8460, 8310, 8520, 8180], prev: 8210, cur: 8740 },
    ],
  },
  {
    name: "Accounting Scoreboard",
    color: "#2E7D5B",
    group: "Financial Health",
    rows: [
      { name: "Revenue", owner: "SL", goal: "$50,000", gv: 50, unit: "usdk", hist: [47.1, 39.8, 51.2, 45.6, 49.3, 43.7], prev: 47.2, cur: 51.4 },
      { name: "Cash Balance", owner: "DW", goal: "$100,000", gv: 100, unit: "usdk", hist: [97.4, 88.6, 103.1, 96.8, 101.2, 94.5], prev: 96.4, cur: 108.9 },
      { name: "Accounts Receivable", owner: "DW", goal: "$12,000", gv: 12, unit: "usdk", lower: true, hist: [13.4, 16.1, 11.8, 14.2, 12.6, 15.7], prev: 14.8, cur: 11.2 },
      { name: "Gross Margin", owner: "SL", goal: "62%", gv: 62, unit: "pct", hist: [61, 54, 64, 59, 63, 56], prev: 58, cur: 64 },
      // Deliberately four rows. Act 2 adds a fifth into the reserved slot below,
      // so this board matches Tech and Marketing at five row-heights throughout
      // and the container never changes size during the tour.
    ],
  },
  {
    name: "Operations Scoreboard",
    color: "#C9832B",
    group: "Delivery",
    rows: [
      { name: "Tasks completed", owner: "MH", goal: "25", gv: 25, unit: "int", hist: [24, 19, 27, 23, 26, 22], prev: 22, cur: 28 },
      { name: "Avg response time", owner: "MH", goal: "4h", gv: 4, unit: "hours", lower: true, hist: [4.2, 5.1, 3.9, 4.4, 4.0, 4.7], prev: 4.9, cur: 3.2 },
      { name: "SOPs published", owner: "DW", goal: "3", gv: 3, unit: "int", hist: [3, 1, 4, 2, 3, 2], prev: 2, cur: 4 },
      { name: "Rank Ups", owner: "MH", goal: "3", gv: 3, unit: "int", hist: [4, 1, 5, 3, 4, 2], prev: 4, cur: 6 },
    ],
  },
];

// 6 completed weeks, then Previous, Current, then 2 upcoming.
const HIST_WEEKS: [string, string][] = [
  ["6/22", "6/28"], ["6/29", "7/5"], ["7/6", "7/12"], ["7/13", "7/19"], ["7/20", "7/26"], ["7/27", "8/2"],
];
const PREV_WEEK: [string, string] = ["8/3", "8/9"];
const CUR_WEEK: [string, string] = ["8/10", "8/16"];
const NEXT_WEEKS: [string, string][] = [["8/17", "8/23"], ["8/24", "8/30"]];

// 3 fixed + 6 history + prev + cur + 2 upcoming = 13 columns.
const PERIOD_COLS = HIST_WEEKS.length + 2 + NEXT_WEEKS.length;

// 31 weekly values for Revenue, in $k. Goal 50.
const REV = [34, 36, 35, 38, 37, 40, 39, 37, 41, 40, 43, 42, 40, 44, 43, 46, 45, 43,
  47, 46, 44, 48, 47, 49, 48, 46, 50, 49, 52, 50, 51.4];
const REV_GOAL = 50;
const X_LABELS = ["Jan '26", "Feb '26", "Mar '26", "Apr '26", "May '26", "Jun '26", "Jul '26", "Aug '26"];

const NEW_METRIC = "Net Profit Margin";
const NEW_GOAL = "18%";

// Which board act 2 adds to. That board holds one fewer real metric and keeps an
// empty row in reserve, so the added metric fills a gap rather than growing the card.
const ADD_BOARD = 2;

function fmt(n: number, unit: Unit) {
  if (unit === "pct") return `${n}%`;
  if (unit === "usdk") return `$${n.toFixed(1)}k`;
  if (unit === "usd") return `$${n}`;
  if (unit === "hours") return `${n}h`;
  return n.toLocaleString("en-US");
}

const hit = (r: Row, v: number) => (r.lower ? v <= r.gv : v >= r.gv);

// ---------------------------------------------------------------- scene
type Draft = { name: string; goal: string; goalEditing: boolean };
type Scene = {
  // The whole card faded out, so the loop restarts on a fade rather than a cut.
  dim: boolean;
  board: number;
  dropOpen: boolean;
  dropHover: number;
  switchHot: boolean;
  addGlow: boolean;
  draft: Draft | null;
  extra: { name: string; goal: string } | null;
  flash: boolean;
  chart: { left: number; top: number } | null;
  chartDraw: boolean;
  glyphHot: boolean;
  glyphLive: boolean;
  // act 2b: who owns the metric that was just added
  ownerHot: boolean;
  // The anchor, not a final position. The picker places itself against it, so it
  // can flip above the cell when the row it opened from is near the bottom.
  ownerPick: { x: number; top: number; bottom: number } | null;
  ownerHover: number;
  assigned: Who | null;
  ownerLanded: boolean;
};

const BLANK: Scene = {
  dim: false,
  board: 0, dropOpen: false, dropHover: -1, switchHot: false, addGlow: false,
  draft: null, extra: null, flash: false, chart: null, chartDraw: false,
  glyphHot: false, glyphLive: false,
  ownerHot: false, ownerPick: null, ownerHover: -1, assigned: null, ownerLanded: false,
};

// The static frame shown under prefers-reduced-motion: same capabilities, one shot.
const STILL: Scene = {
  ...BLANK, board: 2, extra: { name: NEW_METRIC, goal: NEW_GOAL }, assigned: "DW",
};

// Who the picker offers, and who the tour lands on. Net Profit Margin belongs to
// the COO, which is why she is the one chosen.
const PICK_LIST: Who[] = ["SL", "DW", "MH", "JR"];
const PICK_INDEX = 1;

// ---------------------------------------------------------------- icons
const ChartGlyph = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor"
    strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19V5" /><path d="M4 19h16" /><path d="M7.5 15.4l3.2-3.7 2.6 2.2 4-4.8" />
  </svg>
);

const Spark = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.6 4L18 8.5 14 10l-2 4-2-4-4-1.5L10 7z" />
  </svg>
);

// ---------------------------------------------------------------- owners
// Each person gets their own tint, so a column of avatars reads as several
// people at a glance rather than as one repeated badge.
function Avatar({ k, size = 19 }: { k: Who; size?: number }) {
  const p = PEOPLE[k];
  return (
    <span
      className="grid flex-none place-items-center rounded-[5px] font-bold text-white"
      style={{
        height: size,
        width: size,
        fontSize: size <= 19 ? 8 : 9.5,
        background: `linear-gradient(135deg, ${p.from}, ${p.to})`,
      }}
    >
      {k}
    </span>
  );
}

// The assignment popover, anchored to the owner cell it was opened from.
//
// It places ITSELF rather than being handed a final position, because the metric
// it opens on is the last row of the board: below the cell there is no card left
// to draw on, so the popover has to flip above. Both the popover's height and the
// stage's are measured rather than assumed, so this keeps working when the list
// of people changes length.
const PICK_W = 212;
const GAP = 8;

function OwnerPicker({
  at,
  hover,
  chosen,
}: {
  at: { x: number; top: number; bottom: number };
  hover: number;
  chosen: Who | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Absolutely positioned inside the stage, so offsetParent IS the stage.
    const stage = el.offsetParent as HTMLElement | null;
    const sw = stage?.clientWidth ?? 0;
    const sh = stage?.clientHeight ?? 0;
    const h = el.offsetHeight;

    const below = at.bottom + GAP;
    const above = at.top - GAP - h;
    // Prefer below, flip above when it would overrun the card, and if neither
    // fits, take whichever leaves more room and clamp into view.
    let top = below;
    if (below + h > sh - GAP) top = above >= GAP ? above : Math.max(GAP, sh - h - GAP);

    const left = Math.min(Math.max(GAP, at.x - PICK_W / 2), Math.max(GAP, sw - PICK_W - GAP));
    setPos({ left, top });
  }, [at]);

  return (
    <div
      ref={ref}
      className={`absolute z-[70] overflow-hidden rounded-xl border border-black/[0.07] bg-white shadow-[0_20px_44px_-18px_rgba(20,14,6,0.42)] ${
        pos ? "sop-pop" : ""
      }`}
      style={{
        width: PICK_W,
        left: pos?.left ?? 0,
        top: pos?.top ?? 0,
        // Laid out but not painted until measured, so it never flashes in the
        // wrong place and the pop animation starts from the final position.
        visibility: pos ? "visible" : "hidden",
      }}
    >
      <p className="border-b border-[#F1EEE9] px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-[0.12em] text-brand-gray">
        Metric owner
      </p>
      <div className="p-1">
        {PICK_LIST.map((k, i) => {
          const p = PEOPLE[k];
          const on = hover === i;
          const done = chosen === k;
          return (
            <div
              key={k}
              data-owner-opt={i}
              className="flex items-center gap-2 rounded-lg px-1.5 py-[5px] transition-colors duration-150"
              style={{ background: on || done ? "#FFF6EC" : "transparent" }}
            >
              <Avatar k={k} size={20} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[10.5px] font-semibold leading-tight">{p.name}</span>
              </span>
              <span className="flex-none rounded-full bg-[#F1EEE9] px-1.5 py-px text-[7px] font-bold uppercase tracking-[0.06em] text-brand-charcoal">
                {p.role}
              </span>
            </div>
          );
        })}
      </div>
      <p className="border-t border-[#F1EEE9] px-2.5 py-1.5 text-[8.5px] leading-snug text-brand-gray">
        One name per metric, so every number has somebody behind it.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- chart
function TrendPopover({ at, draw }: { at: { left: number; top: number }; draw: boolean }) {
  const W = 440;
  const H = 132;
  const hi = 60;
  const y = (v: number) => H - (v / hi) * H;
  const dx = W / (REV.length - 1);
  const d = REV.map((v, i) => `${i ? "L" : "M"}${(i * dx).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const ticks = [0, 15, 30, 45, 60];

  return (
    <div
      className="absolute z-[60] w-[508px] rounded-xl border border-black/[0.07] bg-white px-4 pb-2.5 pt-3.5 shadow-[0_10px_24px_rgba(20,15,10,0.1),0_26px_56px_-18px_rgba(20,15,10,0.34)]"
      style={{
        left: at.left,
        top: at.top,
        transformOrigin: "12% 0",
        animation: "tour-pop-in 0.34s cubic-bezier(0.22,1,0.36,1) both",
      }}
    >
      <div className="text-[13px] font-bold tracking-tight text-brand-ink">Revenue</div>
      <div className="mt-px text-[10.5px] text-brand-gray">Last 31 weeks</div>

      <div className="relative mt-2.5" style={{ height: H }}>
        {ticks.map((t) => (
          <span
            key={t}
            className="absolute left-0 w-[26px] -translate-y-1/2 text-right font-mono text-[9px] text-brand-gray"
            style={{ top: y(t) }}
          >
            {t}
          </span>
        ))}
        <svg
          viewBox={`0 0 ${W} ${H + 2}`}
          width={508 - 32 - 34}
          height={H}
          className="ml-[34px] overflow-visible"
          aria-hidden="true"
        >
          {ticks.map((t) => (
            <line key={t} x1="0" y1={y(t)} x2={W} y2={y(t)} stroke="#EFECE6" strokeWidth="1" strokeDasharray="3 3" />
          ))}
          <line x1="0" y1={y(REV_GOAL)} x2={W} y2={y(REV_GOAL)} stroke="#2BA463" strokeWidth="1.6" strokeDasharray="6 4" />
          <text x={W - 2} y={y(REV_GOAL) + 12} textAnchor="end" className="font-mono text-[9px] font-semibold" fill="#2BA463">
            Goal $50k
          </text>
          <path
            d={d}
            fill="none"
            stroke="#EA7B1B"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`tour-series ${draw ? "tour-series-draw" : ""}`}
          />
        </svg>
      </div>

      <div className="ml-[34px] mt-1.5 flex justify-between font-mono text-[8.5px] text-brand-gray">
        {X_LABELS.map((l) => <span key={l}>{l}</span>)}
      </div>
      <div className="ml-[34px] mt-1 font-mono text-[9px] text-brand-charcoal">
        Latest $51.4k · goal $50k · hit 21 of 31 weeks
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- component
export default function ScoreboardHeroTour() {
  const hostRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const switchRef = useRef<HTMLSpanElement>(null);
  const addRef = useRef<HTMLSpanElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<SVGSVGElement>(null);
  const rippleRef = useRef<HTMLSpanElement>(null);

  const inView = useInView(hostRef, { margin: "-60px" });
  const reduce = useReducedMotion() ?? false;

  const [scene, setScene] = useState<Scene>(reduce ? STILL : BLANK);
  // Only pin a pixel width when the stage has to scale down; otherwise it stays
  // width:100% so the first paint is already correct (no measure-then-resize flash).
  const [scaled, setScaled] = useState(false);
  const [scale, setScale] = useState(1);
  const [boxH, setBoxH] = useState<number | undefined>(undefined);

  const runRef = useRef(0);
  const scaleRef = useRef(1);
  const posRef = useRef({ x: 120, y: 40 });

  // ---- fluid width, with a scale-down floor at MIN_W
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const measure = () => {
      const hw = host.clientWidth;
      if (hw <= 0) return;
      if (hw >= MIN_W) {
        scaleRef.current = 1;
        setScale(1);
        setScaled(false);
      } else {
        const s = hw / MIN_W;
        scaleRef.current = s;
        setScale(s);
        setScaled(true);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(host);
    return () => ro.disconnect();
  }, []);

  // ---- when scaled, collapse the wrapper to the visual height
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const upd = () => {
      const s = scaleRef.current;
      setBoxH(s < 1 ? stage.offsetHeight * s : undefined);
    };
    upd();
    const ro = new ResizeObserver(upd);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [scale]);

  // ---- the tour
  useEffect(() => {
    if (reduce) {
      setScene(STILL);
      return;
    }
    if (!inView) return;

    const gen = ++runRef.current;
    const alive = () => gen === runRef.current;
    const wait = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));
    const patch = (p: Partial<Scene>) => {
      if (alive()) setScene((s) => ({ ...s, ...p }));
    };

    const setCursor = (x: number, y: number) => {
      posRef.current = { x, y };
      if (cursorRef.current) cursorRef.current.style.transform = `translate(${x}px,${y}px)`;
    };

    // Positions are in unscaled stage units, so divide out the CSS scale.
    const pointAt = (node: Element | null, fx = 0.5, fy = 0.5) => {
      const stage = stageRef.current;
      if (!stage || !node) return posRef.current;
      const s = stage.getBoundingClientRect();
      const t = node.getBoundingClientRect();
      const k = scaleRef.current || 1;
      return {
        x: (t.left - s.left) / k + (t.width / k) * fx,
        y: (t.top - s.top) / k + (t.height / k) * fy,
      };
    };

    const glide = async (pt: { x: number; y: number }, dur = 620) => {
      const c = cursorRef.current;
      const from = posRef.current;
      if (!c) return;
      const a = c.animate(
        [{ transform: `translate(${from.x}px,${from.y}px)` }, { transform: `translate(${pt.x}px,${pt.y}px)` }],
        { duration: dur, easing: EASE, fill: "forwards" },
      );
      try { await a.finished; } catch { /* cancelled */ }
      a.cancel();
      setCursor(pt.x, pt.y);
    };

    const click = async () => {
      const c = cursorRef.current;
      const r = rippleRef.current;
      const { x, y } = posRef.current;
      const anims: Animation[] = [];
      if (r) {
        r.style.left = `${x}px`;
        r.style.top = `${y}px`;
        anims.push(r.animate(
          [{ transform: "scale(.35)", opacity: 0.95 }, { transform: "scale(1.5)", opacity: 0 }],
          { duration: 460, easing: "ease-out" },
        ));
      }
      if (c) {
        anims.push(c.animate([
          { transform: `translate(${x}px,${y}px) scale(1)` },
          { transform: `translate(${x}px,${y}px) scale(.82)` },
          { transform: `translate(${x}px,${y}px) scale(1)` },
        ], { duration: 240, easing: "ease-out" }));
      }
      try { await Promise.all(anims.map((a) => a.finished)); } catch { /* cancelled */ }
      anims.forEach((a) => a.cancel());
      setCursor(x, y);
    };

    const fade = async (to: number, dur = 280) => {
      const c = cursorRef.current;
      if (!c) return;
      const a = c.animate([{ opacity: c.style.opacity || "0" }, { opacity: `${to}` }],
        { duration: dur, fill: "forwards" });
      try { await a.finished; } catch { /* cancelled */ }
    };

    const typeInto = async (text: string, per: number, apply: (partial: string) => void) => {
      for (let i = 1; i <= text.length; i++) {
        if (!alive()) return;
        apply(text.slice(0, i));
        await wait(per);
      }
    };

    const dropItem = (i: number) => dropRef.current?.children[i] ?? null;

    // ---- act 1: switch scoreboards
    const act1 = async () => {
      await fade(1);
      if (!alive()) return;

      for (const target of [1, 2]) {
        await glide(pointAt(switchRef.current), target === 1 ? 700 : 520);
        if (!alive()) return;
        patch({ switchHot: true });
        await wait(160);
        await click();
        if (!alive()) return;

        patch({ dropOpen: true, dropHover: -1 });
        await wait(target === 1 ? 420 : 400);
        if (!alive()) return;

        await glide(pointAt(dropItem(target)), target === 1 ? 520 : 460);
        if (!alive()) return;
        patch({ dropHover: target });
        await wait(target === 1 ? 220 : 200);
        await click();
        if (!alive()) return;

        patch({ dropOpen: false, dropHover: -1, switchHot: false, board: target });
        await wait(620);
        if (!alive()) return;
      }
      await wait(80);
    };

    // ---- act 2: add a metric, then its goal
    const act2 = async () => {
      await glide(pointAt(addRef.current), 640);
      if (!alive()) return;
      patch({ addGlow: true });
      await wait(170);
      await click();
      if (!alive()) return;

      patch({ draft: { name: "", goal: "", goalEditing: false } });
      await wait(300);
      patch({ addGlow: false });

      await typeInto(NEW_METRIC, 44, (partial) =>
        patch({ draft: { name: partial, goal: "", goalEditing: false } }));
      if (!alive()) return;
      await wait(300);

      const goalCell = gridRef.current?.querySelector("[data-draft-goal]") ?? null;
      await glide(pointAt(goalCell), 480);
      if (!alive()) return;
      await click();
      if (!alive()) return;

      patch({ draft: { name: NEW_METRIC, goal: "", goalEditing: true } });
      await wait(220);
      await typeInto(NEW_GOAL, 90, (partial) =>
        patch({ draft: { name: NEW_METRIC, goal: partial, goalEditing: true } }));
      if (!alive()) return;
      await wait(430);

      patch({ draft: null, extra: { name: NEW_METRIC, goal: NEW_GOAL }, flash: true });
      await wait(900);
      patch({ flash: false });
    };

    // ---- act 2b: put a name on the metric that was just added
    // The row lands unassigned, so this beat is the answer to "who is actually
    // responsible for this number", which is the question the Owner column is
    // there to settle.
    const act2b = async () => {
      const cell = gridRef.current?.querySelector("[data-owner-cell]") ?? null;
      if (!cell) return;
      await glide(pointAt(cell), 620);
      if (!alive()) return;
      patch({ ownerHot: true });
      await wait(200);
      await click();
      if (!alive()) return;

      const cTop = pointAt(cell, 0.5, 0);
      const cBot = pointAt(cell, 0.5, 1);
      patch({
        ownerPick: { x: Math.round(cBot.x), top: Math.round(cTop.y), bottom: Math.round(cBot.y) },
        ownerHover: -1,
      });
      await wait(520);
      if (!alive()) return;

      // run down the list before settling, the way somebody scanning it would.
      // Scoped to the stage, not the document, so the lookup cannot stray if a
      // second tour is ever mounted on the same page.
      for (let i = 0; i <= PICK_INDEX; i++) {
        const opt = stageRef.current?.querySelector(`[data-owner-opt="${i}"]`) ?? null;
        await glide(pointAt(opt), i === 0 ? 460 : 320);
        if (!alive()) return;
        patch({ ownerHover: i });
        await wait(i === PICK_INDEX ? 260 : 180);
      }
      await click();
      if (!alive()) return;

      patch({ ownerPick: null, ownerHover: -1, ownerHot: false, assigned: PICK_LIST[PICK_INDEX], ownerLanded: true });
      await wait(1500);
      patch({ ownerLanded: false });
    };

    // ---- act 3: open the trend chart on Revenue
    const act3 = async () => {
      const g = gridRef.current?.querySelector('[data-glyph="0"]') ?? null;
      if (!g) return;
      await glide(pointAt(g), 660);
      if (!alive()) return;
      patch({ glyphHot: true });
      await wait(200);
      await click();
      if (!alive()) return;

      const at = pointAt(g, 1, 1);
      patch({
        glyphHot: false,
        glyphLive: true,
        chart: { left: Math.round(at.x + 8), top: Math.round(at.y + 6) },
        chartDraw: false,
      });
      await wait(90);
      patch({ chartDraw: true });
      await wait(2600);
      if (!alive()) return;
      patch({ chart: null, chartDraw: false, glyphLive: false });
      await wait(420);
    };

    (async function loop() {
      setCursor(120, 40);
      let first = true;
      while (alive()) {
        if (first) {
          setScene({ ...BLANK });
          first = false;
        } else {
          // Come back behind the fade the last pass ended on, then bring the
          // card up rather than cutting to it.
          setScene({ ...BLANK, dim: true });
          await wait(90);
          patch({ dim: false });
          await wait(460);
          if (!alive()) return;
        }
        await act1();
        if (!alive()) return;
        await act2();
        if (!alive()) return;
        await act2b();
        if (!alive()) return;
        await act3();
        if (!alive()) return;
        // Fade the card out before the loop restarts, rather than cutting.
        patch({ dim: true });
        await fade(0);
        await wait(500);
      }
    })();

    return () => {
      runRef.current++;
      cursorRef.current?.getAnimations().forEach((a) => a.cancel());
      rippleRef.current?.getAnimations().forEach((a) => a.cancel());
    };
  }, [inView, reduce]);

  // ---- render
  const board = BOARDS[scene.board];
  const rowCount = board.rows.length + (scene.extra ? 1 : 0) + (scene.draft ? 1 : 0);
  const HEAD = "border-b border-[#F1EEE9] bg-[#FAF9F7] px-1.5 py-2 text-center text-[8.5px] font-semibold uppercase leading-[1.3] tracking-wide";
  const dash = <span className="text-brand-gray">–</span>;

  return (
    <div ref={hostRef} className="w-full">
      <div style={{ height: boxH }}>
        <div
          ref={stageRef}
          className="relative"
          style={{
            width: scaled ? MIN_W : "100%",
            transform: scaled ? `scale(${scale})` : undefined,
            transformOrigin: "top left",
          }}
        >
          {/* ---------------- the board ---------------- */}
          <div
            className="relative rounded-2xl border border-black/5 bg-white text-[12px] text-brand-ink shadow-[0_30px_60px_-30px_rgba(40,30,15,0.45),0_2px_6px_-3px_rgba(40,30,15,0.12)] transition-opacity duration-[520ms] ease-out"
            style={{ opacity: scene.dim ? 0 : 1 }}
          >
            {/* title bar */}
            <div className="flex items-center gap-2.5 border-b border-[#F1EEE9] px-4 py-3">
              <span className="h-2 w-2 flex-none rounded-full bg-brand-orange" />
              <span
                ref={switchRef}
                className={`-mx-2 -my-1 flex items-center gap-1.5 rounded-lg px-2 py-1 transition-colors ${
                  scene.switchHot ? "bg-[#F6F3EE]" : ""
                }`}
              >
                <span className="text-[15px] font-extrabold tracking-tight">{board.name}</span>
                <span
                  className="inline-block text-[9px] text-brand-gray transition-transform duration-[250ms]"
                  style={{ transform: scene.dropOpen ? "rotate(180deg)" : undefined }}
                >
                  ▼
                </span>
              </span>
              <span className="ml-auto flex gap-1.5">
                <span className="rounded-md border border-[#E3E0DA] px-2 py-1 text-[10.5px] font-semibold text-[#57534C]">
                  Create Group
                </span>
                <span
                  ref={addRef}
                  className={`rounded-md bg-brand-ink px-2 py-1 text-[10.5px] font-semibold text-white transition-shadow ${
                    scene.addGlow ? "shadow-[0_0_0_3px_rgba(234,123,27,0.35)]" : ""
                  }`}
                >
                  + Add Metric/KPI
                </span>
              </span>
            </div>

            {/* board dropdown */}
            <div
              ref={dropRef}
              className={`absolute left-[30px] top-[42px] z-40 w-[246px] rounded-xl border border-black/[0.09] bg-white p-[5px] shadow-[0_6px_14px_rgba(10,10,10,0.07),0_20px_44px_rgba(10,10,10,0.16)] transition-all duration-200 ${
                scene.dropOpen ? "scale-100 opacity-100" : "pointer-events-none -translate-y-[5px] scale-[0.96] opacity-0"
              }`}
              style={{ transformOrigin: "20% 0" }}
              aria-hidden="true"
            >
              {BOARDS.map((b, i) => (
                <div
                  key={b.name}
                  className={`flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[12.5px] font-semibold transition-colors ${
                    scene.dropHover === i ? "bg-[#F6F3EE]" : ""
                  }`}
                >
                  <span className="h-2 w-2 flex-none rounded-[3px]" style={{ background: b.color }} />
                  {b.name}
                  <span className={`ml-auto text-[11px] text-[#2BA463] ${scene.board === i ? "" : "opacity-0"}`}>✓</span>
                </div>
              ))}
              <div className="mx-[3px] my-[5px] h-px bg-[#F1EEE9]" />
              <div className="px-2.5 py-[7px] text-[12.5px] font-semibold text-brand-gray">+ New scoreboard</div>
            </div>

            {/* fiscal + filters */}
            <div className="flex items-center gap-2 px-4 pt-2.5 text-[11px] text-brand-gray">
              <span className="rounded-md border border-[#E3E0DA] px-2 py-1 font-semibold text-brand-ink">
                FY 2026 (Current)
              </span>
              <span>· Week 32 of 52</span>
              <span className="ml-auto flex gap-0.5 rounded-lg bg-[#F1EEE9] p-0.5">
                <span className="rounded-[6px] bg-white px-2 py-[3px] text-[10.5px] font-semibold text-[#3E7BC0] shadow-sm">
                  Weekly (10)
                </span>
                <span className="px-2 py-[3px] text-[10.5px] font-medium text-brand-charcoal">Monthly</span>
                <span className="px-2 py-[3px] text-[10.5px] font-medium text-brand-charcoal">Quarterly</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-4 pb-2 pt-3 text-[11.5px] text-brand-gray">
              <span className="rounded-md bg-[#EDEAE4] px-2.5 py-1 font-semibold text-brand-ink">All</span>
              <span className="px-1.5">High</span>
              <span className="px-1.5">Watch</span>
              <span className="px-1.5">View by Week</span>
            </div>

            {/* table: fixed metric/owner/goal, then every period column shares the rest */}
            <div className="relative overflow-hidden border-t border-[#ECEAE6]">
              <div
                ref={gridRef}
                className="grid"
                style={{ gridTemplateColumns: `264px 38px 74px repeat(${PERIOD_COLS}, minmax(0,1fr))` }}
              >
                {/* header */}
                <div className="border-b border-[#F1EEE9] bg-[#FAF9F7] px-2.5 py-2 text-[8.5px] font-semibold uppercase tracking-wide text-brand-gray">
                  Metric
                </div>
                <div className={`${HEAD} text-brand-gray`}>Owner</div>
                <div className={`${HEAD} text-brand-gray`}>Goal</div>
                {HIST_WEEKS.map((w) => (
                  <div key={w[0]} className={`${HEAD} font-normal text-brand-gray`}>
                    {w[0]}<br />{w[1]}
                  </div>
                ))}
                <div className={`${HEAD} text-brand-gray`}>
                  Previous<br />{PREV_WEEK[0]}
                </div>
                <div className={`${HEAD} text-brand-orange`}>
                  Current<br />{CUR_WEEK[0]}
                </div>
                {NEXT_WEEKS.map((w) => (
                  <div key={w[0]} className={`${HEAD} font-normal text-brand-gray`}>
                    {w[0]}<br />{w[1]}
                  </div>
                ))}

                {/* group header */}
                <div className="col-span-full flex items-center gap-2 border-b border-[#F1EEE9] px-2.5 pb-[5px] pt-3">
                  <span className="tracking-[-2px] text-brand-gray">⠿</span>
                  <span className="text-[12.5px] font-extrabold uppercase tracking-wide text-brand-orange">
                    {board.group}
                  </span>
                  <span className="text-[10px] text-brand-gray">{rowCount} metrics</span>
                </div>

                {/* committed rows */}
                {board.rows.map((r, i) => (
                  <MetricRow
                    key={`${board.name}-${r.name}`}
                    row={r}
                    glyphIndex={i}
                    glyphHot={scene.glyphHot && i === 0}
                    glyphLive={scene.glyphLive && i === 0}
                  />
                ))}

                {/* reserved empty row, held open so the added metric has somewhere to
                    land. Content is `invisible` rather than absent, so this row's
                    height matches a real one exactly instead of being guessed at. */}
                {scene.board === ADD_BOARD && !scene.draft && !scene.extra && (
                  <>
                    <div className="border-b border-[#F1EEE9] px-2.5 py-[9px] text-[12px] font-semibold">
                      <span className="invisible">reserved</span>
                    </div>
                    <div className="flex items-center justify-center border-b border-[#F1EEE9] px-1 py-[9px]">
                      <span className="invisible h-[19px] w-[19px]" />
                    </div>
                    <div className="flex items-center justify-center border-b border-l border-[#ECEAE6] px-1 py-[9px]">
                      <span className="invisible rounded-[5px] border px-[6px] py-[3px] text-[11px]">00</span>
                    </div>
                    {Array.from({ length: PERIOD_COLS }).map((_, k) => (
                      <div key={k} className="border-b border-[#F1EEE9] px-1 py-[9px]" />
                    ))}
                  </>
                )}

                {/* the metric added during act 2, no history yet, which is honest */}
                {scene.extra && (
                  <>
                    <div className={`flex min-w-0 items-center gap-1.5 border-b border-[#F1EEE9] px-2.5 py-[9px] text-[12px] font-semibold ${scene.flash ? "tour-landed" : ""}`}>
                      <span className="flex-none tracking-[-2px] text-brand-gray">⠿</span>
                      <span className="truncate">{scene.extra.name}</span>
                      <span data-glyph={board.rows.length} className="grid h-[19px] w-[19px] flex-none place-items-center rounded-[5px] text-brand-gray">
                        <ChartGlyph />
                      </span>
                    </div>
                    {/* A brand new metric starts with nobody on it. Act 2b is
                        the beat that fixes that, which is the whole reason this
                        cell renders an empty state rather than a default. */}
                    <div
                      data-owner-cell
                      className={`flex items-center justify-center border-b border-[#F1EEE9] px-1 py-[9px] ${scene.flash ? "tour-landed" : ""}`}
                    >
                      {scene.assigned ? (
                        <span className={scene.ownerLanded ? "sop-pop" : undefined}>
                          <Avatar k={scene.assigned} />
                        </span>
                      ) : (
                        <span
                          className={`grid h-[19px] w-[19px] place-items-center rounded-[5px] border border-dashed text-[11px] font-bold transition-all duration-200 ${
                            scene.ownerHot
                              ? "border-brand-orange bg-[#FFF1E2] text-brand-orange-dark"
                              : "border-[#CFC9BF] text-[#B7B2AA]"
                          }`}
                        >
                          +
                        </span>
                      )}
                    </div>
                    <div className={`flex items-center justify-center border-b border-l border-[#ECEAE6] px-1 py-[9px] ${scene.flash ? "tour-landed" : ""}`}>
                      <span className="rounded-[5px] border border-[#E3E0DA] px-[7px] py-[3px] font-bold tabular-nums">{scene.extra.goal}</span>
                    </div>
                    {Array.from({ length: PERIOD_COLS }).map((_, k) => (
                      <div key={k} className={`flex items-center justify-center border-b border-[#F1EEE9] px-1 py-[9px] ${scene.flash ? "tour-landed" : ""}`}>
                        {dash}
                      </div>
                    ))}
                  </>
                )}

                {/* the draft row being typed */}
                {scene.draft && (
                  <>
                    <div className="flex min-w-0 items-center gap-1.5 border-b border-[#F1EEE9] bg-[#FFFCF7] px-2.5 py-[9px] text-[12px] font-semibold">
                      <span className="flex-none tracking-[-2px] text-brand-gray">⠿</span>
                      <span className="inline-block min-h-[15px] border-b-[1.5px] border-brand-orange pb-px">
                        {scene.draft.name}
                        {!scene.draft.goalEditing && <span className="tour-caret" />}
                      </span>
                    </div>
                    {/* Unassigned while it is being typed, same as the moment it
                        lands. A metric does not get an owner until somebody
                        picks one, which is what act 2b then does. */}
                    <div className="flex items-center justify-center border-b border-[#F1EEE9] bg-[#FFFCF7] px-1 py-[9px]">
                      <span className="grid h-[19px] w-[19px] place-items-center rounded-[5px] border border-dashed border-[#CFC9BF] text-[11px] font-bold text-[#B7B2AA]">
                        +
                      </span>
                    </div>
                    <div
                      data-draft-goal=""
                      className="flex items-center justify-center border-b border-l border-[#ECEAE6] bg-[#FFFCF7] px-1 py-[9px]"
                    >
                      <span
                        className={`rounded-[5px] border px-[7px] py-[3px] font-bold transition-shadow ${
                          scene.draft.goalEditing
                            ? "border-brand-orange shadow-[0_0_0_3px_rgba(234,123,27,0.22)]"
                            : "border-[#E3E0DA]"
                        }`}
                      >
                        {scene.draft.goalEditing ? (
                          <>{scene.draft.goal}<span className="tour-caret" /></>
                        ) : "–"}
                      </span>
                    </div>
                    {Array.from({ length: PERIOD_COLS }).map((_, k) => (
                      <div key={k} className="flex items-center justify-center border-b border-[#F1EEE9] bg-[#FFFCF7] px-1 py-[9px]">
                        {dash}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* foot */}
            <div className="flex items-center justify-between px-4 py-2.5">
              <span className="text-[10.5px] text-brand-gray">
                Scroll horizontally to see all 52 weeks. Click a cell to edit.
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-br from-[#F49230] to-[#EA7B1B] px-3 py-1.5 text-[10.5px] font-semibold text-white shadow-[0_6px_16px_-6px_rgba(234,123,27,0.9)]">
                <Spark className="h-3 w-3" />
                Ask Multi AI
              </span>
            </div>
          </div>

          {/* ---------------- chart popover ---------------- */}
          {scene.chart && <TrendPopover at={scene.chart} draw={scene.chartDraw} />}

          {scene.ownerPick && (
            <OwnerPicker at={scene.ownerPick} hover={scene.ownerHover} chosen={scene.assigned} />
          )}

          {/* the tool this replaces, struck out before the boards appear */}

          {/* ---------------- cursor + ripple ---------------- */}
          <span
            ref={rippleRef}
            aria-hidden="true"
            className="pointer-events-none absolute z-[85] -m-[13px] h-[26px] w-[26px] rounded-full border-2 border-brand-orange opacity-0"
          />
          <svg
            ref={cursorRef}
            aria-hidden="true"
            viewBox="0 0 24 24"
            width="23"
            height="23"
            fill="#fff"
            stroke="#1B1A17"
            strokeWidth={1.4}
            strokeLinejoin="round"
            className="pointer-events-none absolute left-0 top-0 z-[90] opacity-0 [filter:drop-shadow(0_2px_3px_rgba(0,0,0,0.32))]"
          >
            <path d="M5 3l14 8-6 1.5 3.5 6-2.8 1.6-3.5-6L7 18z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- row
function MetricRow({
  row, glyphIndex, glyphHot, glyphLive,
}: {
  row: Row; glyphIndex: number; glyphHot?: boolean; glyphLive?: boolean;
}) {
  const cell = (v: number, key: string) => {
    const ok = hit(row, v);
    return (
      <div
        key={key}
        className="flex items-center justify-center border-b border-[#F1EEE9] px-1 py-[9px] text-[11px] font-bold tabular-nums"
        style={ok ? { background: "#EAF7F0", color: "#2BA463" } : { background: "#FBEEEB", color: "#D8563F" }}
      >
        {fmt(v, row.unit)}
      </div>
    );
  };
  const up = hit(row, row.cur);

  return (
    <>
      <div className="flex min-w-0 items-center gap-1.5 border-b border-[#F1EEE9] px-2.5 py-[9px] text-[12px] font-semibold">
        <span className="flex-none tracking-[-2px] text-brand-gray">⠿</span>
        <span className="truncate">{row.name}</span>
        <span className={`flex-none text-[11px] ${up ? "text-[#2BA463]" : "text-[#D8563F]"}`}>{up ? "↑" : "↓"}</span>
        <span
          data-glyph={glyphIndex}
          className={`grid h-[19px] w-[19px] flex-none place-items-center rounded-[5px] transition-all duration-[180ms] ${
            glyphLive ? "bg-brand-orange text-white" : glyphHot ? "bg-[#FFF1E2] text-brand-orange-dark" : "text-brand-gray"
          }`}
        >
          <ChartGlyph />
        </span>
      </div>
      <div className="flex items-center justify-center border-b border-[#F1EEE9] px-1 py-[9px]">
        <Avatar k={row.owner} />
      </div>
      <div className="flex items-center justify-center border-b border-l border-[#ECEAE6] px-1 py-[9px]">
        <span className="rounded-[5px] border border-[#E3E0DA] px-[6px] py-[3px] text-[11px] font-bold tabular-nums">
          {row.goal}
        </span>
      </div>
      {row.hist.map((v, i) => cell(v, `h${i}`))}
      {cell(row.prev, "prev")}
      {cell(row.cur, "cur")}
      {NEXT_WEEKS.map((w) => (
        <div key={w[0]} className="flex items-center justify-center border-b border-[#F1EEE9] px-1 py-[9px] text-brand-gray">
          –
        </div>
      ))}
    </>
  );
}
