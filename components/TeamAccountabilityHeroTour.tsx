"use client";

// Animated hero for the Team Accountability feature page.
//
// The One Page Plan act is the original one and should stay that way: the whole
// plan, scrolled top to bottom in one continuous move, then a quarterly goal
// opened, a milestone ticked, the week's update written, and the chip flipping
// on the plan behind it. That act earns the name of the screen.
//
// August 2026 added an act in FRONT of it, once screenshots of "My 12 Week Year"
// turned up and proved the weekly tier exists:
//
//   1. ninety.io and EOS One    crossed out
//   2. My 12 Week Year          this week's priorities, ticked one at a time
//   3. the pull-back            the rail is revealed, two destinations sharpen
//   4. the plan, scrolling      why we exist, values, vision, SWOT, the goals
//   5. open a quarterly goal    its parent chain, its owner, its department
//   6. tick a milestone         2 of 5 becomes 3 of 5
//   7. Goal Updates             the week's written check-in
//   8. save                     the chip flips At Risk to On Track
//
// The pull-back is the join. A weekly checklist on its own is a to-do list; a
// weekly checklist you can watch ladder into the company plan is the product.
//
// Layout: the nav rail sits BEHIND the content plate and is never scaled, so it
// is invisible until the pull-back uncovers it, and so the one cursor target
// used while zoomed still measures true. Same treatment as the Team Meetings
// tour, and for the same reason.
//
// Same architecture as the other eleven hero tours: the app is React state, only
// the cursor and its ripple are animated imperatively through the Web Animations
// API, and the sequence is generation-token guarded so a re-render or unmount
// cancels the in-flight tour rather than leaving orphaned timers behind.
//
// The company here is fictional and matches the other feature pages. The real
// screenshots are of Rise Up Kings's own plan and none of that data is on the
// public site. See docs/team-accountability-feature-notes.md section 8.
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import ActZero, { runZero, type Zero } from "./ReplacesActZero";

const MIN_W = 980;
const STAGE_H = 500;
const EASE = "cubic-bezier(0.22,1,0.36,1)";

// Both wordmarks are wide, so they render shorter than the single-logo pages do.
const ZERO_ITEMS = [
  { name: "ninety.io", logo: "/replaces-ninety.png", h: 46 },
  { name: "EOS One", logo: "/replaces-eosone.png", h: 46 },
];

// The rail's width and the zoom together decide how far the plate must travel:
// its left edge has to clear the rail, its right edge has to stay on the stage.
const RAIL_W = 152;
const RAIL_GAP = 14;
const ZOOM = 0.84;

// Left edge after scaling about the centre is (w - w*ZOOM)/2, so this is the
// extra translation needed to clear the rail, in pre-scale units.
function plateShift(w: number) {
  return Math.max(0, (RAIL_W + RAIL_GAP - (w * (1 - ZOOM)) / 2) / ZOOM);
}

const GREEN = "#1F7F4C";
const AMBER = "#C9832B";
const RED = "#C0402B";
const RUST = "#B4532A"; // the feature's own tile colour, from the navbar
const AI = "#4B3CC4";

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
const Target = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="12" cy="12" r="8.4" />
    <circle cx="12" cy="12" r="4.6" />
    <circle cx="12" cy="12" r="1.2" />
  </svg>
);
const Bulb = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M9.4 17.6h5.2M10.2 20.4h3.6" />
    <path d="M12 3.6a5.6 5.6 0 0 1 3.4 10.1c-.6.5-.9 1.1-.9 1.8H9.5c0-.7-.3-1.3-.9-1.8A5.6 5.6 0 0 1 12 3.6z" />
  </svg>
);
const Shield = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 3.4l7.4 2.6v5.6c0 4.2-3 7.6-7.4 9-4.4-1.4-7.4-4.8-7.4-9V6z" />
  </svg>
);
const Warn = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 4.2l8.4 15.2H3.6z" />
    <path d="M12 10v3.6M12 16.6v.1" />
  </svg>
);
const Trend = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M4 16.4l5-5.2 3.4 3.2L20 7" />
    <path d="M15.4 7H20v4.6" />
  </svg>
);
const AlertCircle = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="12" cy="12" r="8.4" />
    <path d="M12 7.8v4.6M12 16.2v.1" />
  </svg>
);
const Tick = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2.4}>
    <path d="M5 12l5 5L20 7" />
  </svg>
);
const Cal = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="3.6" y="5.4" width="16.8" height="15" rx="2.2" />
    <path d="M3.6 10h16.8M8.4 3.4v3.6M15.6 3.4v3.6" />
  </svg>
);
const Gear = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 3.4v2.2M12 18.4v2.2M20.6 12h-2.2M5.6 12H3.4M18.1 5.9l-1.6 1.6M7.5 16.5l-1.6 1.6M18.1 18.1l-1.6-1.6M7.5 7.5L5.9 5.9" />
  </svg>
);
const Mega = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M4.4 10.2v3.6a1.6 1.6 0 0 0 1.6 1.6h2l6.6 4V4.6l-6.6 4H6a1.6 1.6 0 0 0-1.6 1.6z" />
    <path d="M18.2 9.4a4 4 0 0 1 0 5.2" />
  </svg>
);
const Cart = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M3.4 4.4h2.2l2.2 10.4h9.4l2-7.4H6.4" />
    <circle cx="9.4" cy="19" r="1.4" />
    <circle cx="16.6" cy="19" r="1.4" />
  </svg>
);
const Screen = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="3.4" y="4.4" width="17.2" height="12" rx="2" />
    <path d="M9 20.2h6M12 16.4v3.8" />
  </svg>
);
const Grid = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="3.6" y="3.6" width="7" height="7" rx="1.6" />
    <rect x="13.4" y="3.6" width="7" height="7" rx="1.6" />
    <rect x="3.6" y="13.4" width="7" height="7" rx="1.6" />
    <rect x="13.4" y="13.4" width="7" height="7" rx="1.6" />
  </svg>
);
const Chart = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M4 19.6h16M6.6 16.4V11M11.4 16.4V6.4M16.2 16.4v-7" />
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
const Board = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="3.4" y="4.4" width="17.2" height="15.2" rx="2.2" />
    <path d="M9.2 4.4v15.2M15 4.4v15.2" />
  </svg>
);
const Home = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M4 10.4L12 4l8 6.4V19a1.4 1.4 0 0 1-1.4 1.4H5.4A1.4 1.4 0 0 1 4 19z" />
  </svg>
);
const Chevron = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2.2}>
    <path d="M6.4 9.6l5.6 5.2 5.6-5.2" />
  </svg>
);

// ---------------------------------------------------------------- data
// Fictional company, consistent with the other feature pages. Notes section 8.
const VALUES = [
  { l: "O", n: "Own It" },
  { l: "D", n: "Do It Right" },
  { l: "S", n: "Say It Straight" },
  { l: "L", n: "Leave It Better" },
  { l: "K", n: "Keep Learning" },
];

const SWOT = [
  { t: "Strengths", icon: Shield, c: GREEN, bg: "#F1F9F4", items: ["Crew retention", "Repeat clients", "Same-week quotes"] },
  { t: "Weaknesses", icon: Warn, c: "#6D4BC4", bg: "#F5F2FD", items: ["One market", "Thin bench", "Manual scheduling"] },
  { t: "Opportunities", icon: Trend, c: "#2C6BA6", bg: "#EFF5FC", items: ["Referral programme", "Commercial accounts", "Second market"] },
  { t: "Threats", icon: AlertCircle, c: RED, bg: "#FDF1EF", items: ["Rising labour cost", "Two new entrants", "Fuel prices"] },
];

const LONG_TERM = [
  { n: "Operating in 4 markets", s: "ok" as const },
  { n: "500 customers under retainer by 2031", s: "ok" as const },
];

const ANNUAL = [
  { n: "$5.4M revenue", s: "risk" as const },
  { n: "40% gross margin on delivery", s: "ok" as const },
  { n: "Second market open and profitable", s: "crit" as const },
  { n: "90% client retention", s: "ok" as const },
];

type Status = "ok" | "risk" | "crit";

const STATUS = {
  ok: { label: "On Track", c: GREEN, bg: "#EAF7F0" },
  risk: { label: "At Risk", c: AMBER, bg: "#FDF1DF" },
  crit: { label: "Critical", c: RED, bg: "#FDECE9" },
} as const;

type Goal = { n: string; who: string; done: number; of: number; s: Status; hot?: boolean };

const DEPTS: { name: string; icon: (p: IconProps) => React.JSX.Element; c: string; goals: Goal[] }[] = [
  {
    name: "Operations", icon: Gear, c: RUST,
    goals: [
      { n: "Cut job turnaround from 9 days to 6", who: "MH", done: 2, of: 5, s: "risk", hot: true },
      { n: "Second crew fully certified", who: "MH", done: 3, of: 4, s: "ok" },
      { n: "Fleet inspection compliance to 100%", who: "MH", done: 1, of: 3, s: "ok" },
    ],
  },
  {
    name: "Marketing", icon: Mega, c: "#2E7D5B",
    goals: [
      { n: "Cost per lead under $18", who: "PN", done: 0, of: 4, s: "crit" },
      { n: "Launch the referral programme", who: "PN", done: 2, of: 3, s: "ok" },
    ],
  },
  {
    name: "Sales", icon: Cart, c: "#2C6BA6",
    goals: [
      { n: "30 new retainers signed", who: "JR", done: 1, of: 4, s: "risk" },
      { n: "Close rate from 22% to 30%", who: "JR", done: 2, of: 4, s: "ok" },
    ],
  },
  {
    name: "Technology", icon: Screen, c: "#5B47A8",
    goals: [
      { n: "Move scheduling off spreadsheets", who: "KN", done: 3, of: 5, s: "ok" },
    ],
  },
];

// The one goal carried through every section of the page. Notes section 8.
const HOT = {
  name: "Cut job turnaround from 9 days to 6",
  parent: "40% gross margin on delivery (Annual)",
  owner: "Marcus Hale",
  dept: "Operations",
};

const MILESTONES = [
  { n: "Map the current 9-day path end to end", due: "Jul 18, 2026", done: true },
  { n: "Cut the quote-to-schedule gap to 24h", due: "Aug 1, 2026", done: true },
  { n: "Second crew certified and dispatching", due: "Sep 12, 2026", done: false },
  { n: "Weekly turnaround review in the Ops meeting", due: "Sep 30, 2026", done: false },
  { n: "Hold 6 days for three straight weeks", due: "Sep 30, 2026", done: false },
];

const UPDATE = {
  week: "Week of Aug 24",
  who: "Marcus Hale",
  text: "Crew two passed certification Friday. Turnaround averaged 6.8 days this week, the first time under seven. Keeping the flag on until we hold it three weeks running.",
};

// ---- My 12 Week Year, the opening act ----
const WEEKS = [
  "7/6", "7/13", "7/20", "7/27", "8/3", "8/10", "8/17", "8/24", "8/31", "9/7", "9/14", "9/21", "9/28",
];
const NOW_WEEK = 7; // zero-based, so 8/24

// Per-week KPI outcomes for the quarterly goal. null is a week not reached yet.
const KPI: (boolean | null)[] = [
  false, false, true, false, true, false, true, null, null, null, null, null, null,
];

const MONTHS = [
  {
    n: "July",
    label: "Month 1 of 3",
    outcomes: ["Map the 9-day path end to end", "Quote-to-schedule under 24h"],
    weeks: [
      { r: "7/6 to 7/12", done: 3, of: 3 },
      { r: "7/13 to 7/19", done: 2, of: 3 },
      { r: "7/20 to 7/26", done: 3, of: 3 },
      { r: "7/27 to 8/2", done: 1, of: 3 },
    ],
  },
  {
    n: "August",
    label: "Month 2 of 3",
    now: true,
    outcomes: ["Second crew certified", "Hold turnaround under 7 days"],
    weeks: [
      { r: "8/3 to 8/9", done: 3, of: 3 },
      { r: "8/10 to 8/16", done: 2, of: 3 },
      { r: "8/17 to 8/23", done: 3, of: 3 },
      { r: "8/24 to 8/30", done: 0, of: 3, now: true },
    ],
  },
  {
    n: "September",
    label: "Month 3 of 3",
    outcomes: ["Three straight weeks at 6 days", "Turnaround review in Ops meeting"],
    weeks: [
      { r: "9/7 to 9/13", done: 0, of: 0 },
      { r: "9/14 to 9/20", done: 0, of: 0 },
      { r: "9/21 to 9/27", done: 0, of: 0 },
      { r: "9/28 to 10/4", done: 0, of: 0 },
    ],
  },
];

const THIS_WEEK = [
  "Ride along with crew two on Tuesday",
  "Close the dispatch handoff gap",
  "Log turnaround daily, not weekly",
];

// The nav rail, matching the product's own sidebar. Two entries sharpen when the
// plate pulls back: where you are, and where you are about to go.
const NAV = [
  { k: "dash", label: "Dashboard", icon: Home },
  { k: "twelve", label: "My 12 Week Year", icon: Cal, focus: true },
  { k: "plan", label: "One Page Plan", icon: Target, focus: true },
  { k: "score", label: "Scoreboards", icon: Chart },
  { k: "meet", label: "Team Meetings", icon: Grid },
  { k: "org", label: "Org Chart", icon: Tree },
  { k: "proj", label: "Projects", icon: Board },
];

// ---------------------------------------------------------------- scene
type Scene = {
  zero: Zero;
  view: "twelve" | "plan";
  // act one
  ticked: number; // this week's priorities completed
  zoomed: boolean;
  racked: boolean;
  // act two, unchanged from the original tour
  scrolled: boolean;
  modal: boolean;
  tab: "details" | "updates";
  msTicked: boolean; // milestone 3
  posted: boolean; // the weekly update
  flipped: boolean; // At Risk -> On Track on the plan
  hot: string;
};

const BLANK: Scene = {
  zero: "", view: "twelve", ticked: 0, zoomed: false, racked: false,
  scrolled: false, modal: false, tab: "details", msTicked: false,
  posted: false, flipped: false, hot: "",
};

// Under prefers-reduced-motion: the plan scrolled to its goals, which is the
// half that carries the argument.
const STILL: Scene = { ...BLANK, view: "plan", scrolled: true };

// ---------------------------------------------------------------- component
export default function TeamAccountabilityHeroTour() {
  const hostRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<SVGSVGElement>(null);
  const rippleRef = useRef<HTMLSpanElement>(null);

  const inView = useInView(hostRef, { margin: "-60px" });
  const reduce = useReducedMotion() ?? false;

  const [scene, setScene] = useState<Scene>(reduce ? STILL : BLANK);
  const [scaled, setScaled] = useState(false);
  const [scale, setScale] = useState(1);
  const [boxW, setBoxW] = useState(MIN_W);
  const [boxH, setBoxH] = useState<number | undefined>(undefined);

  const runRef = useRef(0);
  const scaleRef = useRef(1);
  const posRef = useRef({ x: 480, y: 44 });

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
        setBoxW(hw);
      } else {
        const s = hw / MIN_W;
        scaleRef.current = s;
        setScale(s);
        setScaled(true);
        setBoxW(MIN_W);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(host);
    return () => ro.disconnect();
  }, []);

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

    const pointAt = (key: string) => {
      const stage = stageRef.current;
      const node = cardRef.current?.querySelector(`[data-t="${key}"]`);
      if (!stage || !node) return posRef.current;
      const s = stage.getBoundingClientRect();
      const t = node.getBoundingClientRect();
      const k = scaleRef.current || 1;
      return {
        x: (t.left - s.left) / k + t.width / k / 2,
        y: (t.top - s.top) / k + t.height / k / 2,
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
          { duration: 440, easing: "ease-out" },
        ));
      }
      if (c) {
        anims.push(c.animate([
          { transform: `translate(${x}px,${y}px) scale(1)` },
          { transform: `translate(${x}px,${y}px) scale(.82)` },
          { transform: `translate(${x}px,${y}px) scale(1)` },
        ], { duration: 230, easing: "ease-out" }));
      }
      try { await Promise.all(anims.map((a) => a.finished)); } catch { /* cancelled */ }
      anims.forEach((a) => a.cancel());
      setCursor(x, y);
    };

    const fade = async (to: number, dur = 260) => {
      const c = cursorRef.current;
      if (!c) return;
      const a = c.animate([{ opacity: c.style.opacity || "0" }, { opacity: `${to}` }],
        { duration: dur, fill: "forwards" });
      try { await a.finished; } catch { /* cancelled */ }
      if (alive()) c.style.opacity = `${to}`;
    };

    const tap = async (key: string, dur = 620, hold = 300) => {
      await glide(pointAt(key), dur);
      if (!alive()) return false;
      patch({ hot: key });
      await wait(hold);
      if (!alive()) return false;
      await click();
      patch({ hot: "" });
      return alive();
    };

    (async function loop() {
      setCursor(480, 44);
      while (alive()) {
        setScene({ ...BLANK });

        if (!(await runZero((z) => patch({ zero: z }), wait, alive, ZERO_ITEMS.length))) return;
        await fade(1);

        // --- 1. this is what a week looks like
        await wait(2000);

        // --- 2. and this is what finishing one looks like
        for (let i = 0; i < THIS_WEEK.length; i++) {
          if (!(await tap(`wk-${i}`, i === 0 ? 640 : 400, 200))) return;
          patch({ ticked: i + 1 });
          await wait(320);
        }
        await wait(1500);

        // --- 3. pull back, and let the rail come into focus behind it
        patch({ zoomed: true });
        await wait(600);
        patch({ racked: true });
        await wait(880);

        if (!(await tap("nav-plan", 760))) return;
        patch({ view: "plan", zoomed: false, racked: false });
        // let the scale settle before anything inside the plate is measured
        await wait(860);

        // --- 4. the strategic half: purpose, values, vision, SWOT
        await wait(2200);

        // --- 5. and it keeps going, on the same page
        patch({ scrolled: true });
        await wait(2400);

        // --- 6. open the quarterly goal that is slipping
        if (!(await tap("goal-hot", 720))) return;
        patch({ modal: true });
        await wait(2000);

        // --- 7. a milestone lands, and the counter moves
        if (!(await tap("ms-3", 620))) return;
        patch({ msTicked: true });
        await wait(1400);

        // --- 8. the week's written check-in
        if (!(await tap("tab-updates", 620))) return;
        patch({ tab: "updates" });
        await wait(560);
        patch({ posted: true });
        await wait(2900);

        // --- 9. save, and the plan itself changes colour
        if (!(await tap("save", 620))) return;
        patch({ modal: false, flipped: true });
        await wait(2400);

        if (!alive()) return;
        await fade(0);
        await wait(520);
      }
    })();

    return () => {
      runRef.current++;
      cursorRef.current?.getAnimations().forEach((a) => a.cancel());
      rippleRef.current?.getAnimations().forEach((a) => a.cancel());
    };
  }, [inView, reduce]);

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
          <div
            ref={cardRef}
            className="relative overflow-hidden rounded-2xl border border-black/5 bg-[#F3F1ED] text-brand-ink shadow-[0_30px_60px_-30px_rgba(40,30,15,0.45),0_2px_6px_-3px_rgba(40,30,15,0.12)]"
            style={{ height: STAGE_H }}
          >
            {/* Behind the plate and never scaled, so it is invisible until the
                pull-back uncovers it, and so the one cursor target used while
                zoomed still measures true. */}
            <NavRail scene={scene} />

            <div
              className="absolute inset-0 z-[2] overflow-hidden bg-[#FAF9F7]"
              style={{
                transform: scene.zoomed
                  ? `scale(${ZOOM}) translateX(${plateShift(boxW)}px)`
                  : "none",
                transformOrigin: "center center",
                transition: `transform 780ms ${EASE}, box-shadow 780ms ${EASE}, border-radius 780ms ${EASE}`,
                boxShadow: scene.zoomed ? "0 26px 54px -24px rgba(40,30,15,0.5)" : "0 0 0 rgba(0,0,0,0)",
                borderRadius: scene.zoomed ? 14 : 0,
              }}
            >
              {scene.view === "twelve" ? <TwelveView scene={scene} /> : <PlanView scene={scene} />}
            </div>

            {scene.modal && <GoalModal scene={scene} />}

            {scene.zero && <ActZero state={scene.zero} items={ZERO_ITEMS} bg="#FAF9F7" />}

            <span className="pointer-events-none absolute bottom-4 right-5 z-[50] flex items-center gap-1.5 rounded-full border border-[#F7D8B4] bg-white px-3 py-1.5 text-[11px] font-semibold text-brand-ink shadow-[0_10px_22px_-10px_rgba(40,30,15,0.5)]">
              <span className="grid h-[18px] w-[18px] place-items-center rounded-full bg-gradient-to-br from-[#F49230] to-[#DE6F14] text-white">
                <Spark className="h-[10px] w-[10px]" />
              </span>
              Ask Multi AI
            </span>
          </div>

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

// ---------------------------------------------------------------- the rail
// Rack focus: everything is soft, and only the two entries that matter sharpen
// once the plate has settled. Blur is applied per row rather than to the rail,
// because a filter on a parent rasterises its children with it and a child can
// never un-blur itself back out of an ancestor's filter.
const SOFT = { filter: "blur(3.4px)", opacity: 0.5 };
const SHARP = { filter: "blur(0px)", opacity: 1 };

function NavRail({ scene }: { scene: Scene }) {
  const RACK = `filter 620ms ${EASE}, opacity 620ms ${EASE}`;
  const active = scene.view === "twelve" ? "twelve" : "plan";

  return (
    <div
      className="absolute inset-y-0 left-0 z-0 flex flex-col border-r border-[#E7E4DE] bg-white"
      style={{ width: RAIL_W }}
    >
      <div className="flex items-center gap-2 px-3 py-3.5" style={{ ...SOFT, transition: RACK }}>
        <span className="grid h-[21px] w-[21px] flex-none place-items-center rounded-[7px] bg-brand-orange text-[10.5px] font-black text-white">
          M
        </span>
        <span className="text-[12px] font-extrabold tracking-tight">Multiply OS</span>
      </div>

      <div className="px-2 pb-2">
        {NAV.map((n) => {
          const on = n.k === active;
          const Icon = n.icon;
          return (
            <div
              key={n.k}
              data-t={n.k === "plan" ? "nav-plan" : undefined}
              className="mb-0.5 flex items-center gap-2 rounded-[9px] px-2 py-[7px]"
              style={{
                background: on ? "#FDF0E4" : scene.hot === "nav-plan" && n.k === "plan" ? "#FFF6EC" : "transparent",
                color: on ? RUST : "#6F6A62",
                ...(n.focus && scene.racked ? SHARP : SOFT),
                transition: `${RACK}, background 400ms, color 400ms`,
              }}
            >
              <Icon className="h-[13px] w-[13px] flex-none" />
              <span className="whitespace-nowrap text-[11px] font-semibold">{n.label}</span>
              {n.k === "plan" && (
                <span
                  className="ml-auto h-[6px] w-[6px] flex-none rounded-full transition-opacity duration-500"
                  style={{ background: "#E2703A", opacity: scene.racked ? 1 : 0 }}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-auto border-t border-[#EFECE6] px-3 py-3" style={{ ...SOFT, transition: RACK }}>
        <div className="flex items-center gap-2">
          <span className="grid h-[21px] w-[21px] flex-none place-items-center rounded-full bg-[#F1EEE9] text-[8px] font-bold text-brand-charcoal">
            MH
          </span>
          <span className="leading-tight">
            <span className="block text-[10px] font-bold">{HOT.owner}</span>
            <span className="block text-[8.5px] text-brand-gray">Ridgeline Services</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- My 12 Week Year
// The opening act. Personal, weekly, and the rung the other two are made of.
function TwelveView({ scene }: { scene: Scene }) {
  const hit = (i: number) => (i === NOW_WEEK ? scene.ticked === THIS_WEEK.length : KPI[i]);

  return (
    <div className="flex h-full flex-col px-6 pb-5 pt-4">
      <div className="flex flex-none items-start gap-3">
        <span className="min-w-0 flex-1">
          <h3 className="text-[21px] font-extrabold tracking-tight">My 12 Week Year</h3>
          <p className="mt-0.5 text-[10.5px] text-brand-charcoal">
            Your quarter, broken into months, then into weeks.
          </p>
        </span>
        <span className="flex flex-none items-center gap-1.5">
          {[`${HOT.owner} (me)`, "Q3", "2026"].map((l) => (
            <span
              key={l}
              className="flex items-center gap-1 rounded-lg border border-[#E6E2DB] bg-white px-2 py-1 text-[10px] font-semibold text-brand-charcoal"
            >
              {l}
              <Chevron className="h-2 w-2 text-brand-gray" />
            </span>
          ))}
        </span>
      </div>

      <p className="mt-2.5 flex flex-none items-baseline gap-1.5 text-[12px] font-extrabold">
        Quarterly Goals
        <span className="text-[9.5px] font-medium text-brand-gray">1 goal &times; 13 weeks</span>
      </p>

      <div className="mt-1 flex-none overflow-hidden rounded-lg border border-[#EBE7E0] bg-white">
        <div className="flex items-stretch">
          <span className="flex w-[228px] flex-none items-center border-r border-[#F1EEE9] px-2.5 py-1 text-[7.5px] font-bold uppercase tracking-[0.1em] text-brand-gray">
            Goal &amp; KPI
          </span>
          <span className="flex w-[64px] flex-none items-center justify-center border-r border-[#F1EEE9] px-1 py-1 text-[7.5px] font-bold uppercase tracking-[0.1em] text-brand-gray">
            Target
          </span>
          {WEEKS.map((w, i) => (
            <span
              key={w}
              className="flex min-w-0 flex-1 items-center justify-center border-r border-[#F5F2ED] py-1 font-mono text-[7.5px] last:border-r-0"
              style={i === NOW_WEEK ? { background: "#FFF6EC", color: RUST, fontWeight: 700 } : { color: "#A6A6A6" }}
            >
              {w}
            </span>
          ))}
        </div>

        <div className="flex items-stretch border-t border-[#F1EEE9]">
          <span className="w-[228px] flex-none border-r border-[#F1EEE9] px-2.5 py-1.5">
            <span className="block truncate text-[10px] font-bold leading-tight">{HOT.name}</span>
            <span className="block truncate text-[8.5px] text-brand-gray">
              KPI: average turnaround, days
            </span>
          </span>
          <span className="flex w-[64px] flex-none items-center justify-center border-r border-[#F1EEE9] font-mono text-[10px] font-bold">
            &le; 6.0
          </span>
          {WEEKS.map((w, i) => {
            const v = hit(i);
            const isNow = i === NOW_WEEK;
            return (
              <span
                key={w}
                className="flex min-w-0 flex-1 items-center justify-center border-r border-[#F5F2ED] py-1.5 last:border-r-0"
                style={isNow ? { background: "#FFF6EC" } : undefined}
              >
                {v === null ? (
                  <span className="h-[4px] w-[4px] rounded-full bg-[#E0DCD5]" />
                ) : (
                  <span
                    className="grid h-[13px] w-[13px] place-items-center rounded-full transition-all duration-300"
                    style={v ? { background: GREEN, color: "#fff" } : { background: "#F1EEE9", color: "#B7B2AA" }}
                  >
                    {v ? <Tick className="h-2 w-2" /> : <span className="text-[8px] font-bold">&ndash;</span>}
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </div>

      <p className="mt-2.5 flex-none text-[12px] font-extrabold">Monthly &amp; Weekly Plan</p>

      <div className="mt-1 grid min-h-0 flex-1 grid-cols-3 gap-2">
        {MONTHS.map((m) => (
          <div
            key={m.n}
            className="flex min-h-0 flex-col overflow-hidden rounded-lg border bg-white"
            style={m.now ? { borderColor: `${RUST}44` } : { borderColor: "#EBE7E0" }}
          >
            <div className="flex flex-none items-center gap-1.5 border-b border-[#F1EEE9] px-2.5 py-1.5">
              <span className="min-w-0">
                <span className="block text-[7px] font-bold uppercase tracking-[0.12em] text-brand-gray">
                  {m.label}
                </span>
                <span className="block text-[12px] font-extrabold leading-none tracking-tight">{m.n}</span>
              </span>
              {m.now && (
                <span className="ml-auto rounded-full px-1.5 py-px text-[7px] font-bold text-white" style={{ background: RUST }}>
                  NOW
                </span>
              )}
            </div>

            <div className="flex-none px-2.5 py-1.5">
              <p className="flex items-center gap-1 text-[7.5px] font-bold uppercase tracking-[0.1em] text-brand-gray">
                Monthly outcomes
                <Spark className="h-2 w-2" style={{ color: AI }} />
              </p>
              {m.outcomes.map((o) => (
                <p key={o} className="mt-0.5 flex items-start gap-1 text-[8.5px] leading-snug text-brand-charcoal">
                  <span className="mt-[4px] h-1 w-1 flex-none rounded-full bg-[#C4BFB6]" />
                  <span className="min-w-0 truncate">{o}</span>
                </p>
              ))}
            </div>

            <div className="min-h-0 flex-1 overflow-hidden border-t border-[#F1EEE9] px-2.5 py-1.5">
              <p className="text-[7.5px] font-bold uppercase tracking-[0.1em] text-brand-gray">
                Weekly priorities
              </p>
              <div className="mt-1 space-y-1">
                {m.weeks.map((w) => {
                  const isNow = "now" in w && w.now;
                  const done = isNow ? scene.ticked : w.done;
                  const of = isNow ? THIS_WEEK.length : w.of;
                  const pct = of ? Math.round((done / of) * 100) : 0;
                  return (
                    <div
                      key={w.r}
                      className="rounded-md border px-1.5 py-1 transition-colors duration-300"
                      style={
                        isNow
                          ? { borderColor: `${RUST}55`, background: "#FFF8F1" }
                          : { borderColor: "#EFECE6", background: "#FBFAF9" }
                      }
                    >
                      <p className="flex items-center gap-1">
                        <span
                          className="min-w-0 flex-1 truncate font-mono text-[8px]"
                          style={isNow ? { color: RUST, fontWeight: 700 } : { color: "#8A857D" }}
                        >
                          {w.r}
                        </span>
                        <span className="flex-none font-mono text-[8px] text-brand-gray">
                          {done}/{of}
                        </span>
                        <span
                          className="flex-none font-mono text-[9px] font-bold tabular-nums transition-colors duration-300"
                          style={{ color: pct === 100 ? GREEN : pct > 0 ? AMBER : "#C4BFB6" }}
                        >
                          {pct}%
                        </span>
                      </p>

                      {/* only the current week opens, matching the product */}
                      {isNow && (
                        <div className="mt-1 space-y-[3px]">
                          {THIS_WEEK.map((t, i) => {
                            const on = scene.ticked > i;
                            return (
                              <p
                                key={t}
                                data-t={`wk-${i}`}
                                className={`flex items-start gap-1.5 rounded px-1 py-[2px] transition-all duration-200 ${
                                  scene.hot === `wk-${i}` ? "bg-[#FFEFDD]" : ""
                                }`}
                              >
                                <span
                                  className="mt-px grid h-[10px] w-[10px] flex-none place-items-center rounded-[2px] transition-colors duration-200"
                                  style={
                                    on
                                      ? { background: GREEN, color: "#fff" }
                                      : { border: "1.3px solid #C9C2B6", color: "transparent" }
                                  }
                                >
                                  <Tick className="h-[6px] w-[6px]" />
                                </span>
                                <span
                                  className={`min-w-0 flex-1 text-[8px] leading-tight ${
                                    on ? "text-brand-gray line-through" : "text-brand-charcoal"
                                  }`}
                                >
                                  {t}
                                </span>
                              </p>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- the plan
// Deliberately taller than the stage. The tour translates it, so the reader
// watches one continuous page rather than a cut between two screens.
//
// The travel is measured, not assumed: whatever the plan ends up being, the
// scrolled position is exactly its last pixel against the stage's, so the beat
// never ends on empty space and never clips the final row.
function PlanView({ scene }: { scene: Scene }) {
  const planRef = useRef<HTMLDivElement>(null);
  const [travel, setTravel] = useState(0);

  useEffect(() => {
    const el = planRef.current;
    if (!el) return;
    const measure = () => setTravel(Math.max(0, el.offsetHeight - STAGE_H));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="h-full overflow-hidden">
      <div
        ref={planRef}
        className="px-6 pt-5"
        style={{
          transform: `translateY(${scene.scrolled ? -travel : 0}px)`,
          transition: "transform 1.15s cubic-bezier(0.65,0,0.35,1)",
        }}
      >
        {/* header */}
        <div className="flex items-start gap-3">
          <span className="min-w-0 flex-1">
            <h3 className="text-[22px] font-extrabold tracking-tight">One Page Plan</h3>
            <p className="mt-0.5 text-[11px] text-brand-charcoal">
              Ridgeline Services&rsquo;s strategic blueprint
            </p>
          </span>
          <span className="flex flex-none items-center gap-2">
            <span className="rounded-lg border border-[#E6E2DB] bg-white px-2.5 py-1.5 text-[10.5px] font-semibold text-brand-charcoal">
              Ridgeline Services
            </span>
            <span className="rounded-lg border border-[#E6E2DB] bg-white px-2.5 py-1.5 text-[10.5px] font-semibold text-brand-charcoal">
              Plan style: Standard
            </span>
          </span>
        </div>

        {/* why we exist + values */}
        <div className="mt-3 flex gap-2.5">
          <div className="w-[268px] flex-none rounded-xl border border-[#EBE7E0] bg-white px-3 py-2.5 text-center">
            <p className="text-[8px] font-bold uppercase tracking-[0.13em] text-brand-gray">
              Why we exist
            </p>
            <span className="mx-auto mt-1.5 grid h-[26px] w-[26px] place-items-center rounded-full" style={{ background: "#FDF0E4", color: "#C9650F" }}>
              <Target className="h-4 w-4" />
            </span>
            <p className="mt-1.5 text-[10px] leading-snug text-brand-charcoal">
              Do work people are proud to put their name on, for customers who tell somebody else
              about it.
            </p>
          </div>

          <div className="min-w-0 flex-1 rounded-xl border border-[#EBE7E0] bg-white px-3 py-2.5">
            <p className="text-[8px] font-bold uppercase tracking-[0.13em] text-brand-gray">Values</p>
            <div className="mt-1.5 flex items-start justify-around">
              {VALUES.map((v) => (
                <span key={v.l} className="flex w-[74px] flex-col items-center gap-1">
                  <span className="grid h-[34px] w-[34px] place-items-center rounded-full bg-[#FBE9A8] text-[13px] font-bold" style={{ color: "#8A6512" }}>
                    {v.l}
                  </span>
                  <span className="text-center text-[8.5px] font-medium leading-tight text-brand-charcoal">
                    {v.n}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* period tabs */}
        <div className="mt-3 flex items-center gap-1.5">
          <span className="rounded-md border border-[#E6E2DB] bg-white px-2.5 py-1 text-[10px] font-semibold text-brand-charcoal">
            FY 2026
          </span>
          <span className="flex items-center gap-0.5 rounded-md bg-[#F1EEE9] p-0.5">
            {["Q1", "Q2", "Q3", "Q4"].map((q) => (
              <span
                key={q}
                className={`rounded-[5px] px-2.5 py-[3px] text-[10px] ${
                  q === "Q3" ? "bg-brand-ink font-semibold text-white" : "font-medium text-brand-charcoal"
                }`}
              >
                {q}
              </span>
            ))}
          </span>
        </div>

        {/* vision + SWOT */}
        <div className="mt-2.5 flex gap-2">
          <div className="w-[150px] flex-none rounded-xl border border-[#EBE7E0] bg-white px-2.5 py-2 text-center">
            <p className="text-[7.5px] font-bold uppercase tracking-[0.12em] text-brand-gray">
              Company vision
            </p>
            <span className="mx-auto mt-1 grid h-[24px] w-[24px] place-items-center rounded-full bg-[#E6F0F8]" style={{ color: "#2C6BA6" }}>
              <Bulb className="h-3.5 w-3.5" />
            </span>
            <p className="mt-1 text-[9.5px] font-medium leading-snug">
              4 markets, 500 customers, by 2031
            </p>
          </div>
          {SWOT.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.t} className="min-w-0 flex-1 rounded-xl border px-2.5 py-2" style={{ background: s.bg, borderColor: `${s.c}2E` }}>
                <p className="flex items-center gap-1.5 text-[10px] font-bold">
                  <Icon className="h-3 w-3 flex-none" style={{ color: s.c }} />
                  {s.t}
                </p>
                <div className="mt-1 space-y-[3px]">
                  {s.items.map((i) => (
                    <p key={i} className="truncate text-[9px] text-brand-charcoal">{i}</p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* long term + annual */}
        <div className="mt-2.5 flex gap-2.5">
          {([
            { title: "5+ Year Vision", rows: LONG_TERM, bar: "#5B47A8" },
            { title: "Annual Goals - 2026", rows: ANNUAL, bar: GREEN },
          ] as const).map((col) => (
            <div key={col.title} className="min-w-0 flex-1 overflow-hidden rounded-xl border border-[#EBE7E0] bg-white">
              <p className="flex items-center border-b border-[#F1EEE9] px-3 py-1.5 text-[10.5px] font-bold">
                {col.title}
                <span className="ml-auto text-[9px] font-semibold text-brand-orange">+ Add</span>
              </p>
              {col.rows.map((r, i) => {
                const m = STATUS[r.s];
                return (
                  <div key={r.n} className="flex items-center gap-2 border-b border-[#F5F2ED] px-3 py-[5px] last:border-b-0">
                    <span className="w-[9px] flex-none border-l-2 pl-0 text-[9px] text-brand-gray" style={{ borderColor: col.bar }}>
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[10px] font-medium">{r.n}</span>
                    <span
                      className="flex-none rounded-full px-1.5 py-px text-[8px] font-bold"
                      style={{ background: m.bg, color: m.c }}
                    >
                      {m.label}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* department goals */}
        <p className="mt-3 text-[11px] font-bold">Department Goals</p>
        <div className="mt-1.5 grid grid-cols-2 gap-2.5 pb-5">
          {DEPTS.map((d) => {
            const Icon = d.icon;
            return (
              <div key={d.name} className="overflow-hidden rounded-xl border border-[#EBE7E0] bg-white">
                <p className="flex items-center gap-1.5 border-b border-[#F1EEE9] px-3 py-1.5 text-[10.5px] font-bold">
                  <span className="grid h-[16px] w-[16px] flex-none place-items-center rounded-md" style={{ background: `${d.c}1A`, color: d.c }}>
                    <Icon className="h-2.5 w-2.5" />
                  </span>
                  {d.name} Goals - Q3
                  <span className="ml-auto text-[9px] font-semibold text-brand-orange">+ Add</span>
                </p>
                {d.goals.map((g, i) => {
                  const flip = g.hot && scene.flipped;
                  const m = STATUS[flip ? "ok" : g.s];
                  const done = g.hot && scene.msTicked ? g.done + 1 : g.done;
                  return (
                    <div
                      key={g.n}
                      data-t={g.hot ? "goal-hot" : undefined}
                      className={`flex items-center gap-2 border-b border-[#F5F2ED] px-3 py-[5px] transition-all duration-300 last:border-b-0 ${
                        scene.hot === "goal-hot" && g.hot ? "bg-[#FFF6EC]" : ""
                      }`}
                    >
                      <span className="w-[8px] flex-none text-[9px] text-brand-gray">{i + 1}</span>
                      <span className="grid h-[16px] w-[16px] flex-none place-items-center rounded-full bg-[#F1EEE9] text-[7px] font-bold text-brand-charcoal">
                        {g.who}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[10px] font-medium">{g.n}</span>
                      <span className="flex-none font-mono text-[8px] text-brand-gray">
                        {done}/{g.of}
                      </span>
                      <span
                        className="w-[46px] flex-none rounded-full py-px text-center text-[8px] font-bold transition-colors duration-300"
                        style={{ background: m.bg, color: m.c }}
                      >
                        {m.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- the goal modal
function GoalModal({ scene }: { scene: Scene }) {
  const done = MILESTONES.filter((m, i) => m.done || (i === 2 && scene.msTicked)).length;

  return (
    <div className="absolute inset-0 z-[60] grid place-items-center bg-[rgba(24,19,12,0.42)] px-6">
      <div className="sop-view w-[520px] rounded-2xl bg-white px-5 py-4 shadow-[0_24px_60px_-18px_rgba(20,14,6,0.5)]">
        <h4 className="text-[15px] font-bold tracking-tight">Quarterly Detail</h4>

        <div className="mt-2 flex items-center gap-1.5">
          {([
            { k: "details", l: "Details" },
            { k: "updates", l: "Goal Updates" },
          ] as const).map(({ k, l }) => (
            <span
              key={k}
              data-t={k === "updates" ? "tab-updates" : undefined}
              className={`rounded-full px-3 py-1 text-[10.5px] transition-all duration-200 ${
                scene.tab === k ? "bg-brand-orange font-semibold text-white" : "font-medium text-brand-charcoal"
              } ${scene.hot === "tab-updates" && k === "updates" ? "shadow-[0_0_0_2px_rgba(234,123,27,0.35)]" : ""}`}
            >
              {l}
            </span>
          ))}
        </div>

        {scene.tab === "details" ? (
          <div className="mt-3">
            <p className="text-[8.5px] font-bold uppercase tracking-[0.1em] text-brand-gray">Name</p>
            <p className="mt-1 rounded-lg border border-[#E6E2DB] bg-[#FAF9F7] px-2.5 py-1.5 text-[11px] font-medium">
              {HOT.name}
            </p>

            <p className="mt-2 text-[8.5px] font-bold uppercase tracking-[0.1em] text-brand-gray">
              Parent goal
            </p>
            <p className="mt-1 rounded-lg border border-[#E6E2DB] bg-[#FAF9F7] px-2.5 py-1.5 text-[11px] font-medium">
              {HOT.parent}
            </p>

            <div className="mt-2 grid grid-cols-3 gap-2">
              {([
                { l: "Status", v: scene.msTicked ? "On Track" : "At Risk", c: scene.msTicked ? GREEN : AMBER },
                { l: "Assignee", v: HOT.owner, c: "#33302C" },
                { l: "Department", v: HOT.dept, c: "#33302C" },
              ] as const).map((f) => (
                <span key={f.l}>
                  <span className="block text-[8.5px] font-bold uppercase tracking-[0.1em] text-brand-gray">
                    {f.l}
                  </span>
                  <span
                    className="mt-1 block truncate rounded-lg border px-2 py-1.5 text-[10.5px] font-semibold transition-colors duration-300"
                    style={{ borderColor: "#E6E2DB", background: "#FAF9F7", color: f.c }}
                  >
                    {f.v}
                  </span>
                </span>
              ))}
            </div>

            <div className="mt-2.5 rounded-lg border border-[#EBE7E0] bg-[#FAF9F7] px-2.5 py-2">
              <p className="flex items-center text-[8.5px] font-bold uppercase tracking-[0.1em] text-brand-gray">
                Milestones
                <span className="ml-auto font-mono normal-case tracking-normal">{done}/5 done</span>
              </p>
              <div className="mt-1.5 space-y-1">
                {MILESTONES.map((m, i) => {
                  const on = m.done || (i === 2 && scene.msTicked);
                  return (
                    <div
                      key={m.n}
                      data-t={i === 2 ? "ms-3" : undefined}
                      className={`flex items-center gap-2 rounded-md border bg-white px-2 py-1 transition-all duration-200 ${
                        scene.hot === "ms-3" && i === 2 ? "shadow-[0_0_0_2px_rgba(234,123,27,0.3)]" : ""
                      }`}
                      style={{ borderColor: "#EBE7E0" }}
                    >
                      <span
                        className="grid h-3 w-3 flex-none place-items-center rounded-[3px] transition-colors duration-200"
                        style={on ? { background: GREEN, color: "#fff" } : { border: "1.5px solid #C9C2B6", color: "transparent" }}
                      >
                        <Tick className="h-2 w-2" />
                      </span>
                      <span className={`min-w-0 flex-1 truncate text-[9.5px] ${on ? "text-brand-gray line-through" : "font-medium"}`}>
                        {m.n}
                      </span>
                      <span className="flex flex-none items-center gap-1 rounded border border-[#E6E2DB] px-1.5 py-px font-mono text-[8px] text-brand-gray">
                        <Cal className="h-2 w-2" />
                        {m.due}
                      </span>
                      <span className="w-[62px] flex-none truncate rounded border border-[#E6E2DB] px-1.5 py-px text-[8px] text-brand-charcoal">
                        {HOT.owner}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-3 min-h-[248px]">
            <p className="text-[8.5px] font-bold uppercase tracking-[0.1em] text-brand-gray">
              Goal updates
            </p>

            {scene.posted && (
              <div className="sop-pop mt-1.5 rounded-lg border px-2.5 py-2" style={{ borderColor: `${RUST}33`, background: `${RUST}08` }}>
                <p className="flex items-center gap-2 text-[9.5px] font-bold">
                  <span className="grid h-[18px] w-[18px] flex-none place-items-center rounded-full bg-[#F1EEE9] text-[7px] font-bold text-brand-charcoal">
                    MH
                  </span>
                  {UPDATE.who}
                  <span className="ml-auto font-mono text-[8px] font-normal text-brand-gray">
                    {UPDATE.week}
                  </span>
                </p>
                <p className="mt-1.5 text-[10px] leading-relaxed text-brand-charcoal">{UPDATE.text}</p>
              </div>
            )}

            <div className="mt-1.5 space-y-1.5 opacity-70">
              {[
                { w: "Week of Aug 17", t: "Quote-to-schedule gap is down to 19 hours. Turnaround still 7.9 days, because dispatch is the bottleneck now, not sales." },
                { w: "Week of Aug 10", t: "Mapped the full nine-day path with both crews. Three handoffs account for four of the nine days." },
              ].map((u) => (
                <div key={u.w} className="rounded-lg border border-[#EBE7E0] bg-[#FAF9F7] px-2.5 py-2">
                  <p className="flex items-center gap-2 text-[9.5px] font-bold">
                    <span className="grid h-[18px] w-[18px] flex-none place-items-center rounded-full bg-[#F1EEE9] text-[7px] font-bold text-brand-charcoal">
                      MH
                    </span>
                    {UPDATE.who}
                    <span className="ml-auto font-mono text-[8px] font-normal text-brand-gray">{u.w}</span>
                  </p>
                  <p className="mt-1 text-[9.5px] leading-snug text-brand-charcoal">{u.t}</p>
                </div>
              ))}
            </div>

            <p className="mt-2 flex items-center gap-1.5 text-[9px] text-brand-gray">
              <Spark className="h-2.5 w-2.5" style={{ color: AI }} />
              Every week, on every goal, in the owner&rsquo;s own words.
            </p>
          </div>
        )}

        <div className="mt-3 flex items-center justify-end gap-3">
          <span className="text-[11.5px] font-semibold text-brand-charcoal">Cancel</span>
          <span
            data-t="save"
            className={`rounded-lg bg-brand-orange px-4 py-1.5 text-[12px] font-semibold text-white transition-all duration-200 ${
              scene.hot === "save" ? "shadow-[0_0_0_3px_rgba(234,123,27,0.35)]" : ""
            }`}
          >
            Save
          </span>
        </div>
      </div>
    </div>
  );
}
