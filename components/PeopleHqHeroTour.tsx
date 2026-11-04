"use client";

// Animated hero for the People HQ feature page.
//
// People HQ is one sidebar group with six pages, so the tour walks it the way
// an owner or People Lead would: start from the Overview, then follow the
// employee journey down the sidebar.
//
//   Overview        the team summary, the four journey cards and what needs you
//   Hiring          the dashboard and its Start Hiring menu, then Applicants by
//                   Stage, where a finalist moves to Waiting on Offer Letter
//   one candidate   the profile and the funnel; the rating fills in and the
//                   candidate moves on to Reference Check
//   Reviews         the review cycles, then a manager review written with the
//                   Evidence panel beside it
//   Surveys         a closed survey's Engagement Index, eNPS, drivers and heatmap
//   Certifications  the tracker; a card someone added gets verified
//   Reports         the Performance Chart, Value against Engagement
//
// Every screen is traced from the client's November 2026 screenshots: the
// People HQ sidebar and its six pages, the Overview's header, journey cards and
// Needs your attention, the Hiring tab bar, candidate list, Start Hiring menu
// and Applicants by Stage board, the candidate profile and its seven-stage
// funnel, the Performance Reviews header and tabs and cycle cards, the
// Certifications tracker with its legend and To verify cards, and the People
// Reports switcher and chart axes. Survey results and a review in progress were
// empty in the client's account, so those two follow the help center's
// description of them.
//
// Same architecture as the other hero tours: the screen is React state, only
// the cursor and the ripple are animated imperatively through the Web
// Animations API, and the sequence is generation-token guarded so a re-render
// or unmount cancels the in-flight tour rather than leaving orphaned timers.
//
// Everything on screen is fictional. The client's screenshots carry real
// candidates with their emails and phone numbers, real staff, a real benefits
// package and real roles; none of that is on the public site.
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

const MIN_W = 980;
const STAGE_H = 540;
const SIDEBAR_W = 178;
const EASE = "cubic-bezier(0.22,1,0.36,1)";

const INK = "#1B1A17";
const HAIR = "#ECEAE6";
const HAIR2 = "#E3E0DA";
const MUTED = "#8A867E";
const MUTED2 = "#A9A49B";
const ORANGE = "#EA7B1B";
const GREEN = "#1FA36A";
const NAVY = "#0F1B2D";
const AMBER = "#C9832B";
const BLUE = "#2F8FD8";
const PURPLE = "#7A4EDB";
const RED = "#C0402B";
const STAR = "#F2B01E";

// ---------------------------------------------------------------- icons
const ico = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
type IconProps = { className?: string; style?: React.CSSProperties };

/** People HQ's own mark in the app: two people. */
const People = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="9" cy="8.2" r="3.2" />
    <path d="M3.4 19.2c.6-3.2 2.9-5.1 5.6-5.1s5 1.9 5.6 5.1" />
    <path d="M15.4 5.3a3 3 0 0 1 0 5.7M17.3 14.4c1.8.6 3 2.2 3.3 4.8" />
  </svg>
);
const Grid = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="4" y="4" width="7" height="7" rx="1.6" />
    <rect x="13" y="4" width="7" height="7" rx="1.6" />
    <rect x="4" y="13" width="7" height="7" rx="1.6" />
    <rect x="13" y="13" width="7" height="7" rx="1.6" />
  </svg>
);
const UserPlus = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="9.4" cy="8.2" r="3.4" />
    <path d="M3.4 19.4c.7-3.3 3-5.2 6-5.2 1.4 0 2.6.4 3.6 1.1M18 13v6M15 16h6" />
  </svg>
);
const Ribbon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="12" cy="9" r="5.4" />
    <path d="M8.6 13.4L7.4 20.6 12 18.2l4.6 2.4-1.2-7.2" />
  </svg>
);
const HeartPulse = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 20s-7.6-4.6-7.6-10.4A4.2 4.2 0 0 1 12 7.2a4.2 4.2 0 0 1 7.6 2.4C19.6 15.4 12 20 12 20z" />
    <path d="M6.6 12.2h3l1.4-2.4 2 4.2 1.4-1.8h3" />
  </svg>
);
const CheckCircle = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="12" cy="12" r="8.4" />
    <path d="M8.4 12.2l2.4 2.4 4.8-4.8" />
  </svg>
);
const Bars = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M4.6 4.6v14.8h14.8M9 16v-4M13 16V8.6M17 16v-6" />
  </svg>
);
const Dash = Grid;
const Home = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M4 11l8-6.6 8 6.6M6.4 9.2v10h11.2v-10" />
  </svg>
);
const Target = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="12" cy="12" r="7.7" />
    <circle cx="12" cy="12" r="3.9" />
  </svg>
);
const CalDays = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="3.8" y="5" width="16.4" height="15" rx="2.4" />
    <path d="M3.8 9.6h16.4M8.2 3.2v3.4M15.8 3.2v3.4" />
    <path d="M8 13.2h.01M12 13.2h.01M16 13.2h.01M8 16.6h.01M12 16.6h.01M16 16.6h.01" strokeWidth={2.4} />
  </svg>
);
const Spark = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 3.6l1.8 5.1 5.1 1.8-5.1 1.8L12 17.4l-1.8-5.1-5.1-1.8 5.1-1.8z" />
  </svg>
);
const Hourglass = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M7 3.6h10M7 20.4h10M8 3.6c0 4.6 8 4.6 8 8.4s-8 3.8-8 8.4M16 3.6c0 4.6-8 4.6-8 8.4s8 3.8 8 8.4" />
  </svg>
);
const Send = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M20.4 3.6L10.2 13.8M20.4 3.6l-6.6 16.8-3.6-6.6-6.6-3.6z" />
  </svg>
);
const Pencil = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M3.6 20.4l4.4-1.2 10.6-10.6a2 2 0 0 0-2.8-2.8L5.2 16.4z" />
  </svg>
);
const Copy = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="8.4" y="8.4" width="11.6" height="11.6" rx="2" />
    <path d="M15.6 8.4V5.6a1.6 1.6 0 0 0-1.6-1.6H5.6A1.6 1.6 0 0 0 4 5.6V14a1.6 1.6 0 0 0 1.6 1.6h2.8" />
  </svg>
);
const Gear = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3.4v2.2M12 18.4v2.2M3.4 12h2.2M18.4 12h2.2M5.9 5.9l1.6 1.6M16.5 16.5l1.6 1.6M5.9 18.1l1.6-1.6M16.5 7.5l1.6-1.6" />
  </svg>
);
const Templates = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="4" y="4" width="16" height="7" rx="1.6" />
    <rect x="4" y="13" width="7" height="7" rx="1.6" />
    <rect x="13" y="13" width="7" height="7" rx="1.6" />
  </svg>
);
const Mail = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="3.6" y="5.6" width="16.8" height="12.8" rx="2" />
    <path d="M4 6.4l8 6 8-6" />
  </svg>
);
const Phone = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M5.2 4h3.4l1.6 4-2.2 1.4a10 10 0 0 0 4.6 4.6l1.4-2.2 4 1.6v3.4a1.6 1.6 0 0 1-1.6 1.6A15.6 15.6 0 0 1 3.6 5.6 1.6 1.6 0 0 1 5.2 4z" />
  </svg>
);
const Pin = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 20.6s-6.4-5.6-6.4-10.6a6.4 6.4 0 0 1 12.8 0c0 5-6.4 10.6-6.4 10.6z" />
    <circle cx="12" cy="10" r="2.2" />
  </svg>
);
const Doc = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M14 3.6H7.2a1.6 1.6 0 0 0-1.6 1.6v13.6a1.6 1.6 0 0 0 1.6 1.6h9.6a1.6 1.6 0 0 0 1.6-1.6V8z" />
    <path d="M14 3.6V8h4.4M9 12.6h6M9 16h4" />
  </svg>
);
const Back = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);
const Arrow = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M5 12h13M12.5 5.5L19 12l-6.5 6.5" />
  </svg>
);
const Check = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2.6}>
    <path d="M5 12.4l4.4 4.4L19 7.4" />
  </svg>
);
const Chevron = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2.2}>
    <path d="M6 9.5l6 6 6-6" />
  </svg>
);
const Plus = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2.2}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const StarIcon = ({ className, style, on }: IconProps & { on: boolean }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill={on ? STAR : "none"} stroke={on ? STAR : "#CFCBC3"} strokeWidth={1.6} strokeLinejoin="round">
    <path d="M12 3.8l2.5 5.2 5.6.7-4.1 3.9 1 5.6L12 16.5l-5 2.7 1-5.6-4.1-3.9 5.6-.7z" />
  </svg>
);

// ---------------------------------------------------------------- data
type View = "overview" | "hiring" | "board" | "candidate" | "cycles" | "write" | "surveys" | "certs" | "reports";

// The People HQ sidebar, in the product's order.
const SUBNAV = [
  { k: "overview", l: "Overview", icon: Grid },
  { k: "hiring", l: "Hiring", icon: UserPlus },
  { k: "reviews", l: "Performance Reviews", icon: Ribbon },
  { k: "surveys", l: "Engagement Surveys", icon: HeartPulse },
  { k: "certs", l: "Certifications / Trainings", icon: CheckCircle },
  { k: "reports", l: "Reports", icon: Bars },
];
const NAV_FOR: Record<View, string> = {
  overview: "overview",
  hiring: "hiring",
  board: "hiring",
  candidate: "hiring",
  cycles: "reviews",
  write: "reviews",
  surveys: "surveys",
  certs: "certs",
  reports: "reports",
};

const CANDIDATES = [
  { n: "Nora Castillo", role: "Operations Coordinator", em: "nora.castillo@example.com", ph: "(555) 014-3382", stars: 3, step: 3, of: 6, age: "2d" },
  { n: "Ben Archer", role: "Sales Development Rep", em: "ben.archer@example.com", ph: "(555) 017-2290", stars: 4, step: 2, of: 5, age: "2d" },
  { n: "Leah Kim", role: "Event Coordinator", em: "leah.kim@example.com", ph: "(555) 012-7741", stars: 5, step: 4, of: 5, age: "3d" },
  { n: "Omar Haddad", role: "Sales Development Rep", em: "omar.h@example.com", ph: "(555) 019-6603", stars: 3, step: 1, of: 5, age: "4d" },
  { n: "Ruby Chen", role: "Bookkeeper", em: "ruby.chen@example.com", ph: "(555) 016-1458", stars: 2, step: 1, of: 4, age: "6d" },
];

const FUNNEL = [
  { n: "Plan", d: "Shape the position: title, responsibilities, competencies, comp, and 90-day scorecard." },
  { n: "Source", d: "Post the job, blast referrals, and pull candidates into the pipeline." },
  { n: "Applicants", d: "Triage applicants: resume read, gut check, decide who advances to interviews." },
  { n: "Interview", d: "Phone screen → DISC → 1st / 2nd / final interviews. Capture answers and gut signals." },
  { n: "Reference Check", d: "Talk to former managers and peers. Validate or surface concerns before offer." },
  { n: "Offer Letter", d: "Draft terms, send for digital signature, track until accepted or declined." },
  { n: "Onboarding", d: "Assign SOPs, build their onboarding tasks project, and add them to Multiply OS." },
];
const FUNNEL_PILLS = ["Plan", "Source", "Applicants", "Interview", "Offer", "Onboarding"];

const CYCLES = [
  { n: "FY2026 Annual Review", y: "FY2026", s: "Live", pct: 68, people: 42, due: "Manager reviews due Dec 19, 2026" },
  { n: "New-hire reviews", y: "90 days after start", s: "Live", pct: 33, people: 3, due: "Created automatically" },
  { n: "Mid-year 2026", y: "FY2026", s: "Closed", pct: 100, people: 40, due: "Closed Jul 31, 2026" },
];

const ANSWER =
  "Marcus rebuilt how we schedule field visits and cut missed appointments by a third. He trained both new coordinators himself.";
const EVIDENCE = [
  { l: "1on1s", v: "22 held", d: "2 missed all year" },
  { l: "Recognition", v: "9 shout-outs", d: "4 from other teams" },
  { l: "People Alignment", v: "4.6 / 5", d: "Up from 4.1 in Q1" },
  { l: "Scoreboard", v: "41 of 48 weeks", d: "Hit on Jobs completed" },
  { l: "Tasks", v: "92% on time", d: "118 of 128 tasks" },
];

const DRIVERS = [
  { n: "Manager support", v: 86, d: +4 },
  { n: "Purpose", v: 82, d: +2 },
  { n: "Recognition", v: 71, d: +9 },
  { n: "Workload", v: 58, d: -6, focus: true },
  { n: "Growth", v: 61, d: +1, focus: true },
];
const HEAT_COLS = ["Engagement", "Manager", "Workload", "Growth"];
const HEAT = [
  { d: "Operations", v: [78, 88, 52, 60] },
  { d: "Sales", v: [81, 84, 66, 72] },
  { d: "Field crew", v: [69, 90, 49, 55] },
  { d: "Finance", v: [74, 79, 70, 58] },
];

type Cell = { s: "current" | "expiring" | "expired" | "missing" | "assigned" | "verify" | "na"; t?: string };
const CERT_COLS = [
  { k: "OSHA 10", pct: 70, c: "#F2C48C" },
  { k: "First Aid", pct: 77, c: "#8FD3C4" },
  { k: "Forklift", pct: 67, c: "#9CCBEA" },
  { k: "Fall Prot.", pct: 50, c: "#F5B49A" },
  { k: "Harassment", pct: 50, c: "#C9B5F0" },
];
const CERT_ROWS: { group?: string; n?: string; role?: string; cells?: Cell[] }[] = [
  { group: "Field crew · 4" },
  { n: "Marcus Hale", role: "Crew lead", cells: [{ s: "current", t: "10-2087745" }, { s: "current", t: "11/17/27" }, { s: "na" }, { s: "current", t: "5/11/27" }, { s: "current", t: "9/22/28" }] },
  { n: "Theo Barnes", role: "Installer", cells: [{ s: "verify" }, { s: "current", t: "3/16/28" }, { s: "na" }, { s: "current", t: "7/20/27" }, { s: "current", t: "4/25/28" }] },
  { n: "Jordan Rivera", role: "Apprentice", cells: [{ s: "assigned", t: "by 11/20/26" }, { s: "missing" }, { s: "na" }, { s: "assigned", t: "by 11/11/26" }, { s: "assigned", t: "60% done" }] },
  { n: "Sam Ortega", role: "Equipment operator", cells: [{ s: "current", t: "10-1952210" }, { s: "current", t: "6/10/27" }, { s: "current", t: "8/3/28" }, { s: "expiring", t: "11/26/26" }, { s: "current", t: "6/24/28" }] },
  { group: "Office · 3" },
  { n: "Priya Nair", role: "Office manager", cells: [{ s: "na" }, { s: "current", t: "1/31/27" }, { s: "na" }, { s: "na" }, { s: "current", t: "10/2/28" }] },
  { n: "Avery Rowe", role: "Estimator", cells: [{ s: "na" }, { s: "expired", t: "9/23/26" }, { s: "na" }, { s: "na" }, { s: "assigned", t: "80% done" }] },
  { n: "Dana Whitfield", role: "Owner", cells: [{ s: "na" }, { s: "current", t: "8/29/27" }, { s: "na" }, { s: "na" }, { s: "current", t: "2/14/28" }] },
];
const CELL_TONE: Record<Cell["s"], { bg: string; fg: string; label?: string }> = {
  current: { bg: "#E6F5EE", fg: "#1D6B48" },
  expiring: { bg: "#FDF1DC", fg: "#8A5A12" },
  expired: { bg: "#FBE4E6", fg: "#A12A3A", label: "" },
  missing: { bg: "#FBE4E6", fg: "#A12A3A", label: "Missing" },
  assigned: { bg: "#E3F0FB", fg: "#1F5F94", label: "Assigned" },
  verify: { bg: "#EFE8FC", fg: "#5B3BB8", label: "To verify" },
  na: { bg: "transparent", fg: MUTED2 },
};

// Value (1 Limited … 5 Essential) against Engagement (1 None … 5 High).
const PLOT = [
  { i: "DW", v: 5, e: 5, dx: -8, dy: 0 },
  { i: "PN", v: 5, e: 4, dx: 0, dy: 0 },
  { i: "MH", v: 5, e: 5, dx: 9, dy: 0 },
  { i: "TB", v: 4, e: 4, dx: -7, dy: 0 },
  { i: "AR", v: 4, e: 4, dx: 8, dy: 0 },
  { i: "JR", v: 4, e: 2, dx: 0, dy: 0, mis: true },
  { i: "SO", v: 3, e: 4, dx: 0, dy: 0 },
  { i: "LK", v: 3, e: 3, dx: -8, dy: 0 },
  { i: "RC", v: 3, e: 3, dx: 8, dy: 0 },
  { i: "BA", v: 2, e: 4, dx: 0, dy: 0, mis: true },
  { i: "OH", v: 2, e: 2, dx: 0, dy: 0 },
];

// ---------------------------------------------------------------- scene
type Scene = {
  dim: boolean;
  view: View;
  startMenu: boolean;
  /** Leah Kim has moved to Waiting on Offer Letter. */
  offered: boolean;
  stars: number;
  /** Index in FUNNEL of the candidate's current stage. */
  stage: number;
  /** How many characters of the manager's answer have been typed. */
  typed: number;
  rating: number;
  verified: boolean;
  toast: string | null;
};
const BLANK: Scene = {
  dim: false,
  view: "overview",
  startMenu: false,
  offered: false,
  stars: CANDIDATES[0].stars,
  stage: 3,
  typed: 0,
  rating: 0,
  verified: false,
  toast: null,
};
// The frame shown under prefers-reduced-motion: the Overview, which sums up the
// whole module in one screen.
const STILL: Scene = { ...BLANK };

export default function PeopleHqHeroTour() {
  const hostRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<SVGSVGElement>(null);
  const rippleRef = useRef<HTMLSpanElement>(null);

  const inView = useInView(hostRef, { margin: "-60px" });
  const reduce = useReducedMotion() ?? false;

  // Always BLANK on the first render, even under reduced motion, so the server
  // and client render the same thing; the tour effect swaps in STILL after mount.
  const [scene, setScene] = useState<Scene>(BLANK);
  const [scaled, setScaled] = useState(false);
  const [scale, setScale] = useState(1);
  const [boxH, setBoxH] = useState<number | undefined>(undefined);

  const runRef = useRef(0);
  const scaleRef = useRef(1);
  const posRef = useRef({ x: 560, y: 260 });

  // ---- fluid width with a scale-down floor at MIN_W
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
    const pointAt = (sel: string, fx = 0.5, fy = 0.5) => {
      const stage = stageRef.current;
      const node = stage?.querySelector(`[data-ph="${sel}"]`);
      if (!stage || !node) return posRef.current;
      const s = stage.getBoundingClientRect();
      const t = node.getBoundingClientRect();
      const k = scaleRef.current || 1;
      if (t.width === 0 && t.height === 0) return posRef.current;
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
      try {
        await a.finished;
      } catch {
        /* cancelled */
      }
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
        anims.push(
          r.animate(
            [
              { transform: "translate(-50%,-50%) scale(.35)", opacity: 0.95 },
              { transform: "translate(-50%,-50%) scale(1.5)", opacity: 0 },
            ],
            { duration: 460, easing: "ease-out" },
          ),
        );
      }
      if (c) {
        anims.push(
          c.animate(
            [
              { transform: `translate(${x}px,${y}px) scale(1)` },
              { transform: `translate(${x}px,${y}px) scale(.82)` },
              { transform: `translate(${x}px,${y}px) scale(1)` },
            ],
            { duration: 240, easing: "ease-out" },
          ),
        );
      }
      try {
        await Promise.all(anims.map((a) => a.finished));
      } catch {
        /* cancelled */
      }
      anims.forEach((a) => a.cancel());
      setCursor(x, y);
    };

    const fade = async (to: number, dur = 280) => {
      const c = cursorRef.current;
      if (!c) return;
      const a = c.animate([{ opacity: c.style.opacity || "0" }, { opacity: `${to}` }], {
        duration: dur,
        fill: "forwards",
      });
      try {
        await a.finished;
      } catch {
        /* cancelled */
      }
      if (alive()) c.style.opacity = `${to}`;
    };

    /** Glide to a target and press it; `p` lands as the press starts. */
    const tap = async (sel: string, dur = 560, p?: Partial<Scene>, fx = 0.5, fy = 0.5) => {
      await glide(pointAt(sel, fx, fy), dur);
      if (!alive()) return false;
      await wait(70);
      if (!alive()) return false;
      const pressed = click();
      if (p) patch(p);
      await pressed;
      return alive();
    };

    /** Click and hold on the result long enough to read it. */
    const visit = async (sel: string, p: Partial<Scene>, hold: number, dur = 560) => {
      if (!(await tap(sel, dur, p))) return false;
      await wait(hold);
      return alive();
    };

    (async function loop() {
      while (alive()) {
        setScene(BLANK);
        setCursor(560, 300);
        await fade(1, 260);
        if (!alive()) return;
        await wait(2200);

        // ---- Hiring
        if (!(await visit("nav-hiring", { view: "hiring" }, 700, 640))) return;
        if (!(await visit("start-hiring", { startMenu: true }, 1500))) return;
        patch({ startMenu: false });
        if (!(await visit("htab-board", { view: "board" }, 800, 620))) return;
        patch({ offered: true, toast: "Offer letter sent to Dana Whitfield for approval." });
        await wait(1900);
        patch({ toast: null });
        if (!(await visit("card-0", { view: "candidate" }, 700, 620))) return;
        if (!(await tap("star-4", 560, { stars: 5 }))) return;
        await wait(500);
        if (!(await tap("continue", 600, { stage: 4, toast: "Nora Castillo moved to Reference Check." }))) return;
        await wait(1800);
        patch({ toast: null });

        // ---- Performance Reviews
        if (!(await visit("nav-reviews", { view: "cycles" }, 1300, 640))) return;
        if (!(await visit("cycle-0", { view: "write" }, 400))) return;
        for (let i = 1; i <= ANSWER.length; i += 3) {
          if (!alive()) return;
          patch({ typed: i });
          await wait(24);
        }
        patch({ typed: ANSWER.length });
        await wait(400);
        if (!(await tap("rate-4", 560, { rating: 4 }))) return;
        await wait(400);
        if (!(await tap("submit", 560, { toast: "Both sides are in. Book the review conversation as a 1on1." }))) return;
        await wait(1900);
        patch({ toast: null });

        // ---- Engagement, Certifications, Reports
        if (!(await visit("nav-surveys", { view: "surveys" }, 2600, 640))) return;
        if (!(await visit("nav-certs", { view: "certs" }, 900, 600))) return;
        if (!(await tap("verify", 620, { verified: true, toast: "OSHA 10 verified for Theo Barnes." }))) return;
        await wait(1800);
        patch({ toast: null });
        if (!(await visit("nav-reports", { view: "reports" }, 2800, 600))) return;

        if (!alive()) return;
        patch({ dim: true });
        await fade(0, 320);
        await wait(560);
      }
    })();

    return () => {
      runRef.current++;
      cursorRef.current?.getAnimations().forEach((a) => a.cancel());
      rippleRef.current?.getAnimations().forEach((a) => a.cancel());
    };
  }, [inView, reduce]);

  const v = scene.view;
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
            className="relative flex overflow-hidden rounded-2xl border border-black/5 text-left transition-opacity duration-[520ms] ease-out"
            style={{
              height: STAGE_H,
              background: "#F7F6F3",
              opacity: scene.dim ? 0 : 1,
              boxShadow: "0 30px 60px -30px rgba(40,30,15,0.45), 0 2px 6px -3px rgba(40,30,15,0.12)",
            }}
          >
            <Sidebar active={NAV_FOR[v]} />
            <div className="relative min-w-0 flex-1">
              <Fade on={v === "overview"}>
                <Overview />
              </Fade>
              <Fade on={v === "hiring"}>
                <HiringHome menu={scene.startMenu} />
              </Fade>
              <Fade on={v === "board"}>
                <Board offered={scene.offered} />
              </Fade>
              <Fade on={v === "candidate"} from="right">
                <Candidate stars={scene.stars} stage={scene.stage} />
              </Fade>
              <Fade on={v === "cycles"}>
                <Cycles />
              </Fade>
              <Fade on={v === "write"} from="right">
                <WriteReview typed={scene.typed} rating={scene.rating} />
              </Fade>
              <Fade on={v === "surveys"}>
                <SurveyResults />
              </Fade>
              <Fade on={v === "certs"}>
                <Certs verified={scene.verified} />
              </Fade>
              <Fade on={v === "reports"}>
                <Reports />
              </Fade>
            </div>

            {/* The toast sits over every screen, bottom centre, the way the app shows them. */}
            <div
              className="pointer-events-none absolute bottom-5 left-1/2 z-20 flex items-center gap-2 rounded-[10px] px-3.5 py-2.5 text-[11.5px] font-semibold text-white transition-all duration-300"
              style={{
                marginLeft: SIDEBAR_W / 2,
                background: NAVY,
                opacity: scene.toast ? 1 : 0,
                transform: `translateX(-50%) translateY(${scene.toast ? 0 : 8}px)`,
                boxShadow: "0 14px 30px -12px rgba(15,27,45,0.55)",
                whiteSpace: "nowrap",
              }}
            >
              <span className="grid h-[16px] w-[16px] place-items-center rounded-full" style={{ background: GREEN }}>
                <Check className="h-[10px] w-[10px]" />
              </span>
              {scene.toast}
            </div>

            <span
              ref={rippleRef}
              className="pointer-events-none absolute z-30 h-[34px] w-[34px] rounded-full opacity-0"
              style={{ background: `${ORANGE}55` }}
            />
            <svg
              ref={cursorRef}
              viewBox="0 0 24 24"
              className="pointer-events-none absolute left-0 top-0 z-40 h-[22px] w-[22px]"
              style={{ opacity: 0, filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.28))", transform: "translate(560px,300px)" }}
              aria-hidden="true"
            >
              <path
                d="M5.5 2.5l12.4 8.1-5.2.7 3 6.2-2.5 1.2-3-6.2-3.4 3.6z"
                fill="#fff"
                stroke={INK}
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- plumbing
/**
 * A full-size layer that crossfades. The incoming layer sits ON TOP with the
 * app's own background, so it covers the outgoing one as it fades in.
 */
function Fade({ on, from, children }: { on: boolean; from?: "left" | "right"; children: React.ReactNode }) {
  const shift = from === "left" ? "translateX(-10px)" : from === "right" ? "translateX(10px)" : "translateY(4px)";
  return (
    <div
      className="absolute inset-0"
      style={{
        background: "#F7F6F3",
        zIndex: on ? 2 : 1,
        opacity: on ? 1 : 0,
        transform: on ? "none" : shift,
        pointerEvents: on ? "auto" : "none",
        transitionProperty: "opacity, transform",
        transitionDuration: on ? "260ms" : "0ms",
        transitionDelay: on ? "0ms" : "260ms",
        transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)",
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

function Pill({ children, tone }: { children: React.ReactNode; tone: "green" | "amber" | "grey" | "red" | "blue" | "purple" }) {
  const t = {
    green: { background: `${GREEN}16`, color: GREEN },
    amber: { background: `${AMBER}1C`, color: AMBER },
    grey: { background: "#EEECE8", color: MUTED },
    red: { background: "#FBE4E1", color: "#B4322A" },
    blue: { background: `${BLUE}16`, color: "#1F6FAE" },
    purple: { background: `${PURPLE}16`, color: PURPLE },
  }[tone];
  return (
    <span className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-2 py-[2px] text-[9px] font-bold" style={t}>
      {children}
    </span>
  );
}

function Btn({ children, dark, ph }: { children: React.ReactNode; dark?: boolean; ph?: string }) {
  return (
    <span
      data-ph={ph}
      className="flex flex-none items-center gap-1.5 whitespace-nowrap rounded-[8px] border px-2.5 py-[5px] text-[10px] font-semibold"
      style={dark ? { background: NAVY, borderColor: NAVY, color: "#fff" } : { background: "#fff", borderColor: HAIR2, color: INK }}
    >
      {children}
    </span>
  );
}

const Card = ({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
  <div className={`rounded-[12px] border bg-white ${className}`} style={{ borderColor: HAIR, ...style }}>
    {children}
  </div>
);

/** The header every People HQ page opens with: a navy icon tile, the title, a line under it. */
function PageHead({ icon: Ico, title, sub, right }: { icon: (p: IconProps) => React.JSX.Element; title: string; sub: string; right?: React.ReactNode }) {
  return (
    <Card className="flex items-start gap-3 px-4 py-3">
      <span className="grid h-[30px] w-[30px] flex-none place-items-center rounded-[9px] text-white" style={{ background: NAVY }}>
        <Ico className="h-[15px] w-[15px]" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[16px] font-bold leading-tight tracking-tight">{title}</div>
        <div className="mt-0.5 text-[10px]" style={{ color: MUTED }}>
          {sub}
        </div>
      </div>
      {right && <span className="flex flex-none items-center gap-1.5">{right}</span>}
    </Card>
  );
}

function Segs({ items, on }: { items: string[]; on: number }) {
  return (
    <span className="inline-flex rounded-[9px] border bg-white p-[2px] text-[10px] font-semibold" style={{ borderColor: HAIR2 }}>
      {items.map((t, i) => (
        <span key={t} className="whitespace-nowrap rounded-[7px] px-2.5 py-[3px]" style={i === on ? { background: NAVY, color: "#fff" } : { color: MUTED }}>
          {t}
        </span>
      ))}
    </span>
  );
}

const initials = (n: string) =>
  n
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

function Avatar({ n, size = 22 }: { n: string; size?: number }) {
  return (
    <span
      className="grid flex-none place-items-center rounded-full text-[8px] font-bold"
      style={{ width: size, height: size, background: "#FBEAE0", color: "#C2612D" }}
    >
      {initials(n)}
    </span>
  );
}

// ---------------------------------------------------------------- sidebar
function Sidebar({ active }: { active: string }) {
  const above = [
    { l: "Dashboard", icon: Dash },
    { l: "My HQ", icon: Home },
    { l: "One Page Plan", icon: Target },
    { l: "Events HQ", icon: CalDays },
  ];
  return (
    <div className="flex flex-none flex-col border-r bg-white px-2.5 py-3" style={{ width: SIDEBAR_W, borderColor: HAIR }}>
      <div className="mb-3 flex items-center gap-2 rounded-[9px] border px-2.5 py-2" style={{ borderColor: HAIR }}>
        <span className="grid h-[18px] w-[18px] place-items-center rounded-[5px] text-[9px] font-extrabold text-white" style={{ background: INK }}>
          R
        </span>
        <span className="text-[11px] font-semibold">Ridgeline Services</span>
      </div>
      {above.map((n) => (
        <NavRow key={n.l} {...n} />
      ))}
      <div className="mt-0.5 flex items-center gap-2 rounded-[8px] px-2 py-[6px] text-[11px] font-semibold" style={{ color: INK }}>
        <People className="h-[13px] w-[13px] flex-none" style={{ color: MUTED }} />
        People HQ
        <Chevron className="ml-auto h-[11px] w-[11px]" style={{ color: MUTED }} />
      </div>
      <div className="ml-3 mt-0.5 border-l pl-2" style={{ borderColor: HAIR }}>
        {SUBNAV.map((n) => {
          const Ico = n.icon;
          const on = n.k === active;
          return (
            <div
              key={n.k}
              data-ph={`nav-${n.k}`}
              className="flex items-center gap-2 rounded-[7px] px-2 py-[4.5px] text-[10.5px] transition-colors duration-300"
              style={on ? { background: `${ORANGE}14`, color: ORANGE, fontWeight: 600 } : { color: "#5C5852" }}
            >
              <Ico className="h-[12px] w-[12px] flex-none" style={{ color: on ? ORANGE : MUTED2 }} />
              <span className="truncate">{n.l}</span>
              {on && <span className="ml-auto h-[5px] w-[5px] flex-none rounded-full" style={{ background: ORANGE }} />}
            </div>
          );
        })}
      </div>
      <div className="mt-1">
        <NavRow l="Multi AI" icon={Spark} />
      </div>
    </div>
  );
}

function NavRow({ l, icon: Ico }: { l: string; icon: (p: IconProps) => React.JSX.Element }) {
  return (
    <div className="flex items-center gap-2 rounded-[8px] px-2 py-[6px] text-[11px]" style={{ color: "#4A4740" }}>
      <Ico className="h-[13px] w-[13px] flex-none" style={{ color: MUTED }} />
      {l}
    </div>
  );
}

// ---------------------------------------------------------------- Overview
const JOURNEY = [
  { k: "Attract", c: BLUE, icon: UserPlus, big: "23", l: "candidates in the pipeline", s: "Across 4 open roles.", chip: "+5 this week", chipTone: "green" as const },
  { k: "Onboard", c: ORANGE, icon: Send, big: "3", l: "new hires onboarding", s: "2 more being planned.", chip: "", chipTone: "grey" as const },
  { k: "Grow", c: NAVY, icon: Ribbon, big: "68%", l: "of FY2026 Annual Review done", s: "Manager reviews due Dec 19.", chip: "Live", chipTone: "green" as const },
  { k: "Engage", c: GREEN, icon: HeartPulse, big: "74%", l: "favorable, Q3 Team Engagement", s: "Up from 68% in Q2.", chip: "+6 pts", chipTone: "green" as const },
];

function Overview() {
  return (
    <div className="flex flex-col gap-2.5 px-5 pt-4">
      <Card className="flex items-start gap-3 px-4 py-3">
        <span className="grid h-[32px] w-[32px] flex-none place-items-center rounded-[9px] text-white" style={{ background: NAVY }}>
          <People className="h-[16px] w-[16px]" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[8.5px] font-bold uppercase tracking-[0.12em]" style={{ color: MUTED }}>
            Ridgeline Services
          </div>
          <div className="text-[17px] font-bold leading-tight tracking-tight">People HQ</div>
          <div className="mt-1.5 flex gap-1.5">
            {["42 people", "6 departments", "4 open roles", "3 onboarding"].map((c) => (
              <span key={c} className="rounded-full border px-2 py-[1px] text-[9px]" style={{ borderColor: HAIR2, color: "#5C5852" }}>
                {c}
              </span>
            ))}
          </div>
        </div>
        <Btn>
          <Ribbon className="h-[11px] w-[11px]" />
          Reviews
        </Btn>
        <Btn dark>
          <UserPlus className="h-[11px] w-[11px]" />
          Start hiring
        </Btn>
      </Card>

      <div className="flex items-center gap-2">
        <span className="grid h-[20px] w-[20px] place-items-center rounded-[6px]" style={{ background: "#EEECE8" }}>
          <Spark className="h-[11px] w-[11px]" />
        </span>
        <span className="text-[11px] font-bold">The employee journey</span>
        <span className="text-[9.5px]" style={{ color: MUTED }}>
          From first application to how the team feels today.
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {JOURNEY.map((j, i) => (
          <Card key={j.k} className="px-3 py-2.5">
            <div className="flex items-center">
              <span className="grid h-[20px] w-[20px] place-items-center rounded-[6px] text-white" style={{ background: j.c }}>
                <j.icon className="h-[11px] w-[11px]" />
              </span>
              <span className="ml-auto font-mono text-[8.5px]" style={{ color: MUTED2 }}>
                0{i + 1}
              </span>
            </div>
            <div className="mt-1.5 text-[8.5px] font-bold uppercase tracking-[0.1em]" style={{ color: "#5C5852" }}>
              {j.k}
            </div>
            <div className="text-[20px] font-bold leading-tight tabular-nums">{j.big}</div>
            <div className="truncate text-[9.5px]">{j.l}</div>
            <div className="truncate text-[8.5px]" style={{ color: MUTED }}>
              {j.s}
            </div>
            <div className="mt-1.5 h-[16px]">{j.chip && <Pill tone={j.chipTone}>{j.chip}</Pill>}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-[1.6fr_1fr] gap-2.5">
        <Card>
          <div className="flex items-center gap-2 border-b px-3.5 py-2" style={{ borderColor: HAIR }}>
            <CheckCircle className="h-[13px] w-[13px]" style={{ color: ORANGE }} />
            <span className="text-[11px] font-bold">Needs your attention</span>
            <span className="text-[9.5px]" style={{ color: MUTED }}>
              4 things across People
            </span>
          </div>
          {[
            { icon: Ribbon, c: RED, t: "3 manager reviews to write", d: "Due Dec 19. Overdue items come first.", a: "Write" },
            { icon: Hourglass, c: AMBER, t: "4 candidates have waited over a week", d: "No stage change in seven days.", a: "Review" },
            { icon: Send, c: BLUE, t: "1 offer is awaiting an answer", d: "Sent, and not yet accepted, signed or declined.", a: "Follow up" },
            { icon: UserPlus, c: GREEN, t: "5 new applicants this week", d: "Fresh candidates ready for a first look.", a: "Open" },
          ].map((r) => (
            <div key={r.t} className="flex items-center gap-2.5 border-b px-3.5 py-[6px] last:border-b-0" style={{ borderColor: HAIR }}>
              <span className="grid h-[22px] w-[22px] flex-none place-items-center rounded-[7px]" style={{ background: `${r.c}16`, color: r.c }}>
                <r.icon className="h-[12px] w-[12px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[10.5px] font-semibold">{r.t}</span>
                <span className="block truncate text-[9px]" style={{ color: MUTED }}>
                  {r.d}
                </span>
              </span>
              <span className="flex flex-none items-center gap-0.5 text-[9.5px] font-semibold">
                {r.a}
                <Arrow className="h-[10px] w-[10px]" />
              </span>
            </div>
          ))}
        </Card>
        <Card className="px-3.5 py-2.5">
          <div className="flex items-center gap-2">
            <Ribbon className="h-[13px] w-[13px]" />
            <span className="text-[11px] font-bold">Review cycle</span>
            <Pill tone="green">Live</Pill>
          </div>
          <div className="mt-0.5 text-[9.5px]" style={{ color: MUTED }}>
            FY2026 Annual Review · 29 of 42 with both sides in
          </div>
          {[
            ["Self-reviews", 86, BLUE],
            ["Manager reviews", 69, NAVY],
            ["Review conversations", 40, GREEN],
          ].map(([l, p, c]) => (
            <div key={l as string} className="mt-2">
              <div className="flex text-[9.5px]">
                <span>{l as string}</span>
                <span className="ml-auto font-semibold tabular-nums">{p as number}%</span>
              </div>
              <div className="mt-[3px] h-[5px] overflow-hidden rounded-full" style={{ background: "#EEECE8" }}>
                <div className="h-full rounded-full" style={{ width: `${p}%`, background: c as string }} />
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Hiring
function HiringTabs({ on }: { on: number }) {
  const tabs = [
    { l: "Dashboard", icon: Grid, k: "dash" },
    { l: "Applicants by Stage", icon: People, k: "board" },
    { l: "Hiring Pipeline Templates", icon: Templates, k: "tpl" },
    { l: "Settings", icon: Gear, k: "settings" },
  ];
  return (
    <div className="flex gap-1 rounded-[10px] px-1 py-1" style={{ background: "#F1EFEB" }}>
      {tabs.map((t, i) => (
        <span
          key={t.k}
          data-ph={`htab-${t.k}`}
          className="flex items-center gap-1.5 rounded-full px-2.5 py-[4px] text-[10px] font-semibold"
          style={i === on ? { background: NAVY, color: "#fff" } : { color: "#5C5852" }}
        >
          <t.icon className="h-[11px] w-[11px]" />
          {t.l}
        </span>
      ))}
    </div>
  );
}

function Dots({ step, of }: { step: number; of: number }) {
  return (
    <span className="flex items-center gap-[3px]">
      {Array.from({ length: of }, (_, i) => (
        <span key={i} className="h-[5px] w-[5px] rounded-full" style={{ background: i < step ? INK : "#D6D2CA" }} />
      ))}
    </span>
  );
}

function HiringHome({ menu }: { menu: boolean }) {
  return (
    <div className="px-5 pt-3">
      <HiringTabs on={0} />
      <div className="relative mt-3 flex items-start">
        <div>
          <div className="text-[17px] font-bold tracking-tight">Multiply Hiring</div>
          <div className="text-[10px]" style={{ color: MUTED }}>
            Plan a position, source applicants, run interviews, and onboard the new hire.
          </div>
        </div>
        <span className="relative ml-auto">
          <Btn dark ph="start-hiring">
            <UserPlus className="h-[11px] w-[11px]" />
            Start Hiring
            <Chevron className="h-[9px] w-[9px]" />
          </Btn>
          {/* The Start Hiring menu, traced from the client's screenshot. */}
          <div
            className="absolute right-0 top-[calc(100%+6px)] z-10 w-[250px] rounded-[10px] border bg-white text-[10.5px] transition-all duration-150"
            style={{
              borderColor: HAIR2,
              opacity: menu ? 1 : 0,
              transform: menu ? "translateY(0)" : "translateY(-4px)",
              boxShadow: "0 16px 32px -14px rgba(20,15,10,0.35)",
            }}
          >
            {[
              { icon: Pencil, t: "Add Applicant (Manual)", d: "Add a candidate to an existing position without sourcing." },
              { icon: Plus, t: "Create New Position", d: "Create and start hiring for a new position." },
              { icon: Copy, t: "Use a previous position as a template", d: "Clone the title, responsibilities, scorecard, and interview stages." },
            ].map((m, i) => (
              <div key={m.t} className="border-b px-3 py-2 last:border-b-0" style={{ borderColor: HAIR, background: i === 1 ? "#F7F5F1" : "#fff" }}>
                <div className="flex items-center gap-1.5 font-semibold">
                  <m.icon className="h-[11px] w-[11px]" />
                  {m.t}
                </div>
                <div className="text-[9px]" style={{ color: MUTED }}>
                  {m.d}
                </div>
              </div>
            ))}
          </div>
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="flex items-center gap-1.5 rounded-full px-3 py-[4px] text-[10px] font-semibold text-white" style={{ background: NAVY }}>
          Candidates
          <span className="rounded-full bg-white/20 px-1.5 text-[9px]">23</span>
        </span>
        <span className="flex items-center gap-1.5 px-2 text-[10px] font-semibold" style={{ color: MUTED }}>
          Positions
          <span className="rounded-full px-1.5 text-[9px]" style={{ background: "#EEECE8" }}>
            4
          </span>
        </span>
      </div>

      <div className="mt-2.5 grid grid-cols-[150px_1fr] gap-3">
        <div>
          <div className="mb-1 text-[8.5px] font-bold uppercase tracking-[0.1em]" style={{ color: MUTED2 }}>
            Departments
          </div>
          {[
            ["All departments", 23],
            ["Operations", 8],
            ["Sales", 9],
            ["Events", 4],
            ["Finance", 2],
          ].map(([d, n], i) => (
            <div key={d} className="flex items-center rounded-[7px] px-2 py-[5px] text-[10px]" style={i === 0 ? { background: "#EEECE8", fontWeight: 600 } : { color: "#4A4740" }}>
              {d}
              <span className="ml-auto text-[9px]" style={{ color: MUTED }}>
                {n}
              </span>
            </div>
          ))}
        </div>
        <Card className="px-3 py-2.5">
          <div className="flex gap-1.5">
            <span className="rounded-full px-2.5 py-[3px] text-[9.5px] font-semibold text-white" style={{ background: NAVY }}>
              Currently Being Interviewed (18)
            </span>
            <span className="rounded-full px-2.5 py-[3px] text-[9.5px] font-semibold" style={{ background: "#EEECE8", color: MUTED }}>
              Hired &amp; Onboarding (3)
            </span>
          </div>
          {CANDIDATES.map((c) => (
            <div key={c.n} className="flex items-start gap-2.5 border-b py-[6px] last:border-b-0" style={{ borderColor: HAIR }}>
              <Avatar n={c.n} size={24} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10.5px] font-semibold">{c.n}</span>
                  <span className="flex">
                    {[0, 1, 2, 3, 4].map((s) => (
                      <StarIcon key={s} on={s < c.stars} className="h-[10px] w-[10px]" />
                    ))}
                  </span>
                </div>
                <div className="flex items-center gap-2 truncate text-[9px]" style={{ color: MUTED }}>
                  <span className="flex items-center gap-1">
                    <Mail className="h-[9px] w-[9px]" />
                    {c.em}
                  </span>
                  <span style={{ color: INK }}>{c.role}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-[9px]">
                  <span className="rounded-[4px] px-1.5 font-semibold" style={{ background: "#EEECE8" }}>
                    #4 Interview
                  </span>
                  <Dots step={c.step} of={c.of} />
                  <span style={{ color: MUTED }}>{c.age}</span>
                </div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function BoardCard({ n, role, chip, tone, hot, ph }: { n: string; role: string; chip: string; tone: "grey" | "green" | "amber" | "red"; hot?: boolean; ph?: string }) {
  return (
    <div
      data-ph={ph}
      className="mb-1.5 rounded-[9px] border bg-white px-2.5 py-1.5 transition-shadow duration-300"
      style={{ borderColor: hot ? ORANGE : HAIR, boxShadow: hot ? `0 0 0 2px ${ORANGE}26` : "none" }}
    >
      <div className="truncate text-[10.5px] font-semibold">{n}</div>
      <div className="truncate text-[9px]" style={{ color: MUTED }}>
        {role}
      </div>
      <div className="mt-1">
        <Pill tone={tone}>{chip}</Pill>
      </div>
    </div>
  );
}

function Board({ offered }: { offered: boolean }) {
  const cols = [
    { t: "Currently Being Interviewed", d: "In Review, Interview, or Reference Check.", n: offered ? 17 : 18, c: BLUE },
    { t: "Waiting on Offer Letter", d: "Offer stage: offer not yet signed.", n: offered ? 1 : 0, c: AMBER },
    { t: "Onboarded", d: "Signed and onboarding.", n: 3, c: GREEN },
    { t: "Not Hired", d: "Not the right fit, or Future Potential.", n: 12, c: RED },
  ];
  return (
    <div className="px-5 pt-3">
      <HiringTabs on={1} />
      <div className="mt-3 text-[17px] font-bold tracking-tight">Applicants by Stage</div>
      <div className="text-[10px]" style={{ color: MUTED }}>
        Every applicant grouped by where they sit in your hiring pipeline.
      </div>
      <div className="mt-2.5 grid grid-cols-4 gap-2">
        {cols.map((c, i) => (
          <Card key={c.t} className="px-2 py-2" style={{ height: 330 }}>
            <div className="flex items-start gap-1 px-0.5">
              <span className="min-w-0 flex-1 text-[10.5px] font-bold leading-tight">{c.t}</span>
              <span className="rounded-full border px-1.5 text-[9px] font-bold tabular-nums" style={{ borderColor: `${c.c}66`, color: c.c }}>
                {c.n}
              </span>
            </div>
            <div className="mb-1.5 px-0.5 text-[8.5px] leading-snug" style={{ color: MUTED }}>
              {c.d}
            </div>
            {i === 0 && (
              <>
                <BoardCard ph="card-0" n="Nora Castillo" role="Operations Coordinator" chip="Interviewing · Second interview" tone="grey" />
                <BoardCard n="Ben Archer" role="Sales Development Rep" chip="Interviewing · Video interview" tone="grey" />
                {!offered && <BoardCard n="Leah Kim" role="Event Coordinator" chip="Reference Check" tone="grey" hot />}
                <BoardCard n="Omar Haddad" role="Sales Development Rep" chip="Interviewing · First interview" tone="grey" />
              </>
            )}
            {i === 1 &&
              (offered ? (
                <BoardCard n="Leah Kim" role="Event Coordinator" chip="Offer · awaiting approval" tone="amber" hot />
              ) : (
                <div className="flex items-center gap-1.5 rounded-[8px] border border-dashed px-2 py-2 text-[9.5px]" style={{ borderColor: HAIR2, color: MUTED }}>
                  <People className="h-[11px] w-[11px]" />
                  No one here yet.
                </div>
              ))}
            {i === 2 && (
              <>
                <BoardCard n="Sofia Grant" role="Field Technician" chip="Onboarding · Signed 10/2/2026" tone="green" />
                <BoardCard n="Eli Brooks" role="Customer Success Rep" chip="Onboarding · Signed 9/18/2026" tone="green" />
                <BoardCard n="Maya Lindqvist" role="Marketing Specialist" chip="Onboarding" tone="green" />
              </>
            )}
            {i === 3 && (
              <>
                <BoardCard n="Ivan Petrov" role="Bookkeeper" chip="Not a fit" tone="grey" />
                <BoardCard n="Hana Sato" role="Event Coordinator" chip="Future potential" tone="amber" />
                <BoardCard n="Cole Martin" role="Sales Development Rep" chip="Not a fit" tone="grey" />
              </>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function Candidate({ stars, stage }: { stars: number; stage: number }) {
  // The pill strip folds Reference Check into Interview, as the product does.
  const pillAt = stage <= 3 ? stage : stage === 4 ? 3 : stage - 1;
  const c = CANDIDATES[0];
  return (
    <div className="px-5 pt-3">
      <Card className="flex items-center px-3.5 py-2">
        <div>
          <div className="text-[8px] font-bold uppercase tracking-[0.12em]" style={{ color: MUTED }}>
            Multiply Hiring
          </div>
          <div className="text-[11.5px] font-bold">{c.role}</div>
        </div>
        <span className="ml-auto flex gap-1">
          {FUNNEL_PILLS.map((p, i) => (
            <span
              key={p}
              className="flex items-center gap-1 rounded-full border px-2 py-[2px] text-[9px] font-semibold"
              style={
                i < pillAt
                  ? { borderColor: `${GREEN}55`, background: `${GREEN}12`, color: GREEN }
                  : i === pillAt
                    ? { borderColor: NAVY, background: NAVY, color: "#fff" }
                    : { borderColor: HAIR2, color: MUTED2 }
              }
            >
              {i < pillAt && <Check className="h-[8px] w-[8px]" />}
              {i + 1}. {p}
            </span>
          ))}
        </span>
      </Card>

      <div className="mt-2.5 grid grid-cols-[200px_1fr] gap-3">
        <div className="flex flex-col gap-2">
          <Card className="px-3 py-2.5">
            <div className="text-[8.5px] font-bold uppercase tracking-[0.1em]" style={{ color: MUTED }}>
              Status
            </div>
            <div className="mt-1 flex items-center rounded-[7px] border px-2 py-[4px] text-[10.5px] font-semibold" style={{ borderColor: `${GREEN}55`, background: "#EEF8F2", color: "#17714A" }}>
              High Potential
              <Chevron className="ml-auto h-[9px] w-[9px]" />
            </div>
            <div className="mt-1.5 truncate rounded-[7px] border px-2 py-[4px] text-[9.5px]" style={{ borderColor: HAIR2 }}>
              <span style={{ color: MUTED }}>STAGE </span>
              {stage === 3 ? "Interviewing · Second interview" : "Reference Check"}
            </div>
          </Card>
          <Card className="px-3 py-2.5">
            <div className="flex items-center gap-2">
              <Avatar n={c.n} size={28} />
              <div className="min-w-0">
                <div className="truncate text-[8px] font-bold uppercase tracking-[0.08em]" style={{ color: MUTED }}>
                  ← {c.role}
                </div>
                <div className="text-[11.5px] font-bold">{c.n}</div>
              </div>
            </div>
            <div className="mt-2 flex items-center rounded-[7px] border border-dashed px-2 py-[4px]" style={{ borderColor: HAIR2 }}>
              <span className="text-[8.5px] font-bold uppercase tracking-[0.08em]" style={{ color: MUTED }}>
                Rating
              </span>
              <span className="ml-auto flex gap-[2px]">
                {[0, 1, 2, 3, 4].map((s) => (
                  <span key={s} data-ph={`star-${s}`}>
                    <StarIcon on={s < stars} className="h-[13px] w-[13px] transition-all duration-200" />
                  </span>
                ))}
              </span>
            </div>
            <div className="mt-2 flex flex-col gap-1 text-[9.5px]" style={{ color: "#4A4740" }}>
              {[
                [Mail, c.em],
                [Phone, c.ph],
                [Pin, "Denver, CO"],
                [Doc, "View resume"],
              ].map(([I, t]) => {
                const Ico = I as (p: IconProps) => React.JSX.Element;
                return (
                  <span key={t as string} className="flex items-center gap-1.5 truncate">
                    <Ico className="h-[10px] w-[10px] flex-none" />
                    {t as string}
                  </span>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="min-w-0">
          <div className="flex items-center">
            <div>
              <div className="text-[8.5px] font-bold uppercase tracking-[0.1em]" style={{ color: MUTED }}>
                Stage {stage + 1} · {FUNNEL[stage].n}
              </div>
              <div className="text-[14px] font-bold">Review {c.n}</div>
            </div>
            <span className="ml-auto">
              <Btn dark ph="continue">
                Continue to current stage
                <Arrow className="h-[11px] w-[11px]" />
              </Btn>
            </span>
          </div>
          <Card className="mt-2 px-3 py-2">
            <div className="text-[11px] font-bold">Where this applicant is headed</div>
            <div className="mt-1 flex flex-col gap-1">
              {FUNNEL.map((f, i) => {
                const done = i < stage;
                const cur = i === stage;
                return (
                  <div
                    key={f.n}
                    className="flex items-start gap-2 rounded-[8px] border px-2.5 py-[4px] transition-colors duration-300"
                    style={{ borderColor: cur ? NAVY : HAIR, background: cur ? "#F3F2EF" : "#fff" }}
                  >
                    <span
                      className="mt-[1px] grid h-[14px] w-[14px] flex-none place-items-center rounded-full text-[7.5px] font-bold"
                      style={done ? { border: `1.5px solid ${GREEN}`, color: GREEN } : cur ? { background: NAVY, color: "#fff" } : { background: "#EEECE8", color: MUTED }}
                    >
                      {done ? <Check className="h-[8px] w-[8px]" /> : i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 text-[10px] font-semibold">
                        {f.n}
                        {cur && (
                          <span className="rounded-[4px] px-1 text-[7.5px] font-bold tracking-[0.06em]" style={{ background: "#E4E2DD" }}>
                            CURRENT
                          </span>
                        )}
                      </span>
                      <span className="block truncate text-[8.5px]" style={{ color: MUTED }}>
                        {f.d}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Performance Reviews
function ReviewsHead({ tab }: { tab: number }) {
  return (
    <>
      <PageHead
        icon={Ribbon}
        title="Performance Reviews"
        sub="Annual, mid-year or whenever you need one, 360 feedback and anonymous engagement surveys."
        right={
          <>
            <Btn>
              <People className="h-[11px] w-[11px]" />
              Sharing
            </Btn>
            <Btn dark>
              <Plus className="h-[11px] w-[11px]" />
              New review
              <Chevron className="h-[9px] w-[9px]" />
            </Btn>
          </>
        }
      />
      <div className="mt-2.5">
        <Segs items={["My Reviews", "My team", "Performance Cycles", "360 Feedback", "Engagement"]} on={tab} />
      </div>
    </>
  );
}

function Cycles() {
  return (
    <div className="px-5 pt-4">
      <ReviewsHead tab={2} />
      <div className="mt-3 grid grid-cols-3 gap-2.5">
        {CYCLES.map((c, i) => (
          <Card key={c.n} className="px-3 py-2.5" style={i === 0 ? { borderColor: `${NAVY}33` } : undefined}>
            <div data-ph={i === 0 ? "cycle-0" : undefined} className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <div className="truncate text-[11.5px] font-bold">{c.n}</div>
                <div className="text-[9px]" style={{ color: MUTED }}>
                  {c.y}
                </div>
              </div>
              <Pill tone={c.s === "Live" ? "green" : "grey"}>{c.s}</Pill>
            </div>
            <div className="mt-2.5 h-[5px] overflow-hidden rounded-full" style={{ background: "#EEECE8" }}>
              <div className="h-full rounded-full" style={{ width: `${c.pct}%`, background: c.s === "Live" ? GREEN : MUTED2 }} />
            </div>
            <div className="mt-1.5 flex text-[9.5px]" style={{ color: MUTED }}>
              {c.people} people
              <span className="ml-auto font-semibold" style={{ color: INK }}>
                {c.pct}%
              </span>
            </div>
            <div className="text-[9.5px]" style={{ color: MUTED }}>
              {c.due}
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-2.5 px-3.5 py-2.5">
        <div className="text-[10.5px] font-bold">After both sides are in</div>
        <div className="mt-2 flex items-center gap-1.5">
          {["Second-level approval", "Release", "Review conversation", "Acknowledged", "Development plan"].map((s, i, a) => (
            <span key={s} className="flex min-w-0 flex-1 items-center gap-1.5">
              <span className="min-w-0 flex-1 truncate rounded-[7px] border px-2 py-[5px] text-center text-[9.5px] font-semibold" style={{ borderColor: HAIR2, background: "#FBFAF8" }}>
                {s}
              </span>
              {i < a.length - 1 && <Arrow className="h-[10px] w-[10px] flex-none" style={{ color: MUTED2 }} />}
            </span>
          ))}
        </div>
        <div className="mt-2 text-[9.5px]" style={{ color: MUTED }}>
          The manager&rsquo;s manager can sign off before release. Acknowledging means they read it, not that they agree.
        </div>
      </Card>
      <div className="mt-2.5 text-[9.5px]" style={{ color: MUTED }}>
        Review schedule · Once both sides are in, one click books the review conversation as a 1on1.
      </div>
    </div>
  );
}

function WriteReview({ typed, rating }: { typed: number; rating: number }) {
  return (
    <div className="px-5 pt-4">
      <div className="flex items-center gap-1.5 text-[10.5px] font-semibold" style={{ color: MUTED }}>
        <Back className="h-[12px] w-[12px]" />
        FY2026 Annual Review
      </div>
      <div className="mt-1.5 flex items-center gap-2.5">
        <Avatar n="Marcus Hale" size={30} />
        <div>
          <div className="text-[15px] font-bold leading-tight">Marcus Hale</div>
          <div className="text-[9.5px]" style={{ color: MUTED }}>
            Crew lead · Field crew · Manager review by Dana Whitfield
          </div>
        </div>
        <span className="ml-auto flex gap-1.5">
          <Pill tone="green">Self-review in</Pill>
          <Pill tone="amber">Manager review</Pill>
        </span>
      </div>

      <div className="mt-3 grid grid-cols-[1fr_220px] gap-3">
        <div className="flex flex-col gap-2">
          <Card className="px-3.5 py-2.5">
            <div className="text-[10.5px] font-bold">1. What did Marcus accomplish this year?</div>
            <div className="mt-1.5 h-[64px] rounded-[8px] border px-2.5 py-2 text-[10px] leading-snug" style={{ borderColor: typed ? `${NAVY}55` : HAIR2 }}>
              {typed ? (
                <>
                  {ANSWER.slice(0, typed)}
                  {typed < ANSWER.length && <span className="ml-[1px] inline-block h-[10px] w-[1px] align-middle" style={{ background: INK }} />}
                </>
              ) : (
                <span style={{ color: MUTED2 }}>Write your answer…</span>
              )}
            </div>
          </Card>
          <Card className="px-3.5 py-2.5">
            <div className="text-[10.5px] font-bold">2. Overall, how would you rate Marcus&rsquo;s performance this year?</div>
            <div className="mt-1.5 grid grid-cols-5 gap-1.5">
              {["Needs work", "Developing", "Solid", "Strong", "Exceptional"].map((l, i) => (
                <span
                  key={l}
                  data-ph={`rate-${i + 1}`}
                  className="rounded-[8px] border px-1 py-1.5 text-center transition-colors duration-200"
                  style={rating === i + 1 ? { borderColor: NAVY, background: NAVY, color: "#fff" } : { borderColor: HAIR2 }}
                >
                  <span className="block text-[11px] font-bold">{i + 1}</span>
                  <span className="block text-[8px]" style={{ opacity: 0.75 }}>
                    {l}
                  </span>
                </span>
              ))}
            </div>
          </Card>
          <Card className="px-3.5 py-2.5">
            <div className="text-[10.5px] font-bold">3. Goals this year</div>
            {[
              ["Cut missed appointments by 25%", "Ahead", "green"],
              ["Train two new coordinators", "On track", "blue"],
              ["Launch the spring maintenance plan", "At risk", "amber"],
            ].map(([g, s, t]) => (
              <div key={g} className="mt-1 flex items-center text-[10px]">
                <span className="truncate">{g}</span>
                <span className="ml-auto">
                  <Pill tone={t as "green" | "blue" | "amber"}>{s}</Pill>
                </span>
              </div>
            ))}
          </Card>
          <div className="flex justify-end">
            <Btn dark ph="submit">
              Submit review
            </Btn>
          </div>
        </div>

        <Card className="self-start px-3 py-2.5" style={{ background: "#FBFAF8" }}>
          <div className="flex items-center gap-1.5 text-[10.5px] font-bold">
            <Spark className="h-[12px] w-[12px]" style={{ color: ORANGE }} />
            Evidence
          </div>
          <div className="text-[9px]" style={{ color: MUTED }}>
            Marcus&rsquo;s year so far, from what the team already keeps.
          </div>
          <div className="mt-2 flex flex-col gap-1.5">
            {EVIDENCE.map((e) => (
              <div key={e.l} className="rounded-[8px] border bg-white px-2.5 py-1.5" style={{ borderColor: HAIR }}>
                <div className="flex items-center text-[9px] font-bold uppercase tracking-[0.06em]" style={{ color: MUTED }}>
                  {e.l}
                </div>
                <div className="text-[11.5px] font-bold">{e.v}</div>
                <div className="text-[8.5px]" style={{ color: MUTED }}>
                  {e.d}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Engagement Surveys
function heat(v: number) {
  if (v >= 80) return { bg: "#CDEBDC", fg: "#17714A" };
  if (v >= 70) return { bg: "#E3F3EA", fg: "#2C7A52" };
  if (v >= 60) return { bg: "#FBF0DA", fg: "#8A5A12" };
  return { bg: "#FBE1DD", fg: "#A12A1F" };
}

function SurveyResults() {
  return (
    <div className="px-5 pt-4">
      <PageHead
        icon={HeartPulse}
        title="Engagement Surveys"
        sub="Anonymous surveys that show how engaged your team is, what drives it, and where to act first."
        right={
          <Btn dark>
            <Plus className="h-[11px] w-[11px]" />
            New survey
          </Btn>
        }
      />
      <div className="mt-2.5 flex items-center gap-2">
        <span className="text-[11.5px] font-bold">Q3 Team Engagement</span>
        <Pill tone="grey">Closed Oct 3</Pill>
        <span className="text-[9.5px]" style={{ color: MUTED }}>
          37 of 42 answered · anonymity minimum 5
        </span>
        <span className="ml-auto">
          <Btn>
            <Spark className="h-[11px] w-[11px]" style={{ color: ORANGE }} />
            Find themes with AI
          </Btn>
        </span>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {[
          { l: "Engagement Index", v: "74%", s: "favorable · +6 since Q2", c: GREEN },
          { l: "eNPS", v: "+32", s: "−100 to +100", c: BLUE },
          { l: "Participation", v: "88%", s: "37 of 42 people", c: PURPLE },
        ].map((t) => (
          <Card key={t.l} className="border-l-[3px] px-3 py-2" style={{ borderLeftColor: t.c }}>
            <div className="text-[8.5px] font-bold uppercase tracking-[0.1em]" style={{ color: MUTED }}>
              {t.l}
            </div>
            <div className="text-[20px] font-bold leading-tight tabular-nums">{t.v}</div>
            <div className="text-[9px]" style={{ color: MUTED }}>
              {t.s}
            </div>
          </Card>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <Card className="px-3 py-2">
          <div className="text-[10.5px] font-bold">Drivers</div>
          {DRIVERS.map((d) => (
            <div key={d.n} className="mt-1.5">
              <div className="flex items-center gap-1.5 text-[9.5px]">
                <span>{d.n}</span>
                {d.focus && <Pill tone="amber">Focus area</Pill>}
                <span className="ml-auto font-semibold tabular-nums">{d.v}%</span>
                <span className="w-[22px] text-right tabular-nums" style={{ color: d.d < 0 ? RED : GREEN }}>
                  {d.d > 0 ? `+${d.d}` : d.d}
                </span>
              </div>
              <div className="mt-[2px] h-[4px] overflow-hidden rounded-full" style={{ background: "#EEECE8" }}>
                <div className="h-full rounded-full" style={{ width: `${d.v}%`, background: d.focus ? AMBER : GREEN }} />
              </div>
            </div>
          ))}
        </Card>
        <Card className="px-3 py-2">
          <div className="flex items-center text-[10.5px] font-bold">
            Heatmap by department
            <span className="ml-auto text-[9px] font-semibold" style={{ color: MUTED }}>
              Export CSV
            </span>
          </div>
          <div className="mt-1.5 grid gap-[3px]" style={{ gridTemplateColumns: "72px repeat(4, 1fr)" }}>
            <span />
            {HEAT_COLS.map((c) => (
              <span key={c} className="truncate text-center text-[8px] font-bold" style={{ color: MUTED }}>
                {c}
              </span>
            ))}
            {HEAT.map((r) => (
              <HeatRow key={r.d} r={r} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function HeatRow({ r }: { r: (typeof HEAT)[number] }) {
  return (
    <>
      <span className="truncate text-[9.5px] leading-[24px]">{r.d}</span>
      {r.v.map((v, i) => {
        const t = heat(v);
        return (
          <span key={i} className="grid h-[24px] place-items-center rounded-[5px] text-[9.5px] font-bold tabular-nums" style={{ background: t.bg, color: t.fg }}>
            {v}
          </span>
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------- Certifications
function Certs({ verified }: { verified: boolean }) {
  const legend: [string, string][] = [
    ["Expired", "#E2475A"],
    ["Missing", "#F08A9A"],
    ["Expiring soon", "#E8A33A"],
    ["Waiting for review", PURPLE],
    ["Assigned", BLUE],
    ["Current", GREEN],
  ];
  return (
    <div className="px-5 pt-4">
      <PageHead
        icon={CheckCircle}
        title="Certifications / Trainings"
        sub="Licenses, safety cards and required trainings for everyone on the team: who is current, who is expiring, who never had it."
        right={
          <>
            <Btn>
              <Doc className="h-[11px] w-[11px]" />
              Log a record
            </Btn>
            <Btn dark>
              <Plus className="h-[11px] w-[11px]" />
              New
            </Btn>
          </>
        }
      />
      <div className="mt-2.5 flex items-center gap-2">
        <Segs items={["Tracker", "Manage", verified ? "To verify" : "To verify 1", "Mine"]} on={0} />
        <span className="ml-2 flex gap-1.5">
          <Pill tone="green">{verified ? "67%" : "63%"} compliant</Pill>
          <Pill tone="red">1 expired</Pill>
          <Pill tone="amber">1 expiring soon</Pill>
          <Pill tone="purple">{verified ? 0 : 1} to verify</Pill>
        </span>
      </div>
      <Card className="mt-2.5 overflow-hidden">
        <div className="flex flex-wrap items-center gap-2.5 border-b px-3 py-1.5 text-[8.5px]" style={{ borderColor: HAIR, color: MUTED }}>
          <span className="text-[10px] font-bold" style={{ color: INK }}>
            7 people · 5 columns
          </span>
          {legend.map(([l, c]) => (
            <span key={l} className="flex items-center gap-1">
              <span className="h-[6px] w-[6px] rounded-full" style={{ background: c }} />
              {l}
            </span>
          ))}
        </div>
        <div className="grid" style={{ gridTemplateColumns: "150px repeat(5, 1fr)" }}>
          <span className="px-3 py-1.5 text-[9.5px]" style={{ color: MUTED }}>
            Person
          </span>
          {CERT_COLS.map((c) => (
            <span key={c.k} className="m-[3px] rounded-[6px] border-t-[3px] px-1 py-[3px] text-center" style={{ borderTopColor: c.c, background: `${c.c}33` }}>
              <span className="block text-[9px] font-bold">{c.k}</span>
              <span className="block text-[7.5px]" style={{ color: MUTED }}>
                {c.pct}% current
              </span>
            </span>
          ))}
          {CERT_ROWS.map((r, ri) =>
            r.group ? (
              <span
                key={r.group}
                className="border-t px-3 py-[3px] text-[8.5px] font-bold uppercase tracking-[0.08em]"
                style={{ gridColumn: "1 / span 6", borderColor: HAIR, background: "#F4F2EE", color: "#5C5852" }}
              >
                {r.group}
              </span>
            ) : (
              <CertRow key={ri} r={r} verified={verified} />
            ),
          )}
        </div>
      </Card>
    </div>
  );
}

function CertRow({ r, verified }: { r: (typeof CERT_ROWS)[number]; verified: boolean }) {
  return (
    <>
      <span className="flex items-center gap-2 border-t px-3 py-[3px]" style={{ borderColor: HAIR }}>
        <Avatar n={r.n!} size={18} />
        <span className="min-w-0">
          <span className="block truncate text-[10px] font-semibold">{r.n}</span>
          <span className="block truncate text-[8.5px]" style={{ color: MUTED }}>
            {r.role}
          </span>
        </span>
      </span>
      {r.cells!.map((cell, i) => {
        const c: Cell = cell.s === "verify" && verified ? { s: "current", t: "10-2231904" } : cell;
        const tone = CELL_TONE[c.s];
        const label = c.s === "expired" || c.s === "current" || c.s === "expiring" ? c.t : tone.label;
        return (
          <span key={i} className="border-t p-[3px]" style={{ borderColor: HAIR }}>
            {c.s !== "na" && (
              <span
                data-ph={cell.s === "verify" ? "verify" : undefined}
                className="grid h-[26px] place-items-center rounded-[5px] text-center leading-tight transition-colors duration-300"
                style={{ background: tone.bg, color: tone.fg }}
              >
                <span className="text-[9.5px] font-semibold tabular-nums">{label}</span>
                {c.s === "assigned" && c.t && <span className="block text-[7.5px]">{c.t}</span>}
              </span>
            )}
          </span>
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------- Reports
function Reports() {
  const cards = [
    { t: "Company Performance", d: "Ratings, goal outcomes, completion and rater leniency for one cycle.", c: NAVY, icon: Ribbon, on: false },
    { t: "Performance Chart", d: "Every person placed by Value × Engagement.", c: ORANGE, icon: Bars, on: true },
    { t: "Engagement", d: "Engagement Index, eNPS, drivers and focus areas.", c: GREEN, icon: HeartPulse, on: false },
  ];
  const W = 420;
  const H = 230;
  const x = (e: number) => 34 + ((e - 1) / 4) * (W - 54);
  const y = (v: number) => H - 26 - ((v - 1) / 4) * (H - 44);
  return (
    <div className="px-5 pt-4">
      <div className="flex items-start gap-3">
        <span className="grid h-[30px] w-[30px] flex-none place-items-center rounded-[9px] text-white" style={{ background: NAVY }}>
          <Bars className="h-[15px] w-[15px]" />
        </span>
        <div>
          <div className="text-[16px] font-bold leading-tight">People Reports</div>
          <div className="text-[10px]" style={{ color: MUTED }}>
            How the company is performing, where every person sits, and how people feel about working here.
          </div>
        </div>
      </div>
      <div className="mt-2.5 grid grid-cols-3 gap-2">
        {cards.map((c) => (
          <Card key={c.t} className="flex items-start gap-2 px-3 py-2" style={c.on ? { borderColor: c.c, background: `${c.c}0C`, boxShadow: `0 0 0 2px ${c.c}22` } : undefined}>
            <span className="grid h-[22px] w-[22px] flex-none place-items-center rounded-[7px] text-white" style={{ background: c.c }}>
              <c.icon className="h-[12px] w-[12px]" />
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] font-bold">{c.t}</span>
              <span className="block text-[8.5px] leading-snug" style={{ color: MUTED }}>
                {c.d}
              </span>
            </span>
          </Card>
        ))}
      </div>
      <div className="mt-2.5 grid grid-cols-[1fr_190px] gap-2.5">
        <Card className="px-3 py-2">
          <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" style={{ height: 230 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <g key={i}>
                <line x1={x(i)} x2={x(i)} y1={y(5)} y2={y(1)} stroke="#EEECE8" />
                <line x1={x(1)} x2={x(5)} y1={y(i)} y2={y(i)} stroke="#EEECE8" />
              </g>
            ))}
            {[
              [1, "Limited"],
              [3, "Solid"],
              [5, "Essential"],
            ].map(([v, l]) => (
              <text key={l as string} x={x(1) - 6} y={y(v as number) + 3} textAnchor="end" fontSize="8" fill={MUTED}>
                {l as string}
              </text>
            ))}
            {[
              [1, "None"],
              [3, "Medium"],
              [5, "High"],
            ].map(([e, l]) => (
              <text key={l as string} x={x(e as number)} y={H - 8} textAnchor="middle" fontSize="8" fill={MUTED}>
                {l as string}
              </text>
            ))}
            {PLOT.map((p) => (
              <g key={p.i} transform={`translate(${x(p.e) + p.dx},${y(p.v) + p.dy})`}>
                <circle r="8.5" fill={p.mis ? "#FDEBDC" : "#fff"} stroke={p.mis ? ORANGE : NAVY} strokeWidth="1.3" />
                <text y="2.8" textAnchor="middle" fontSize="7" fontWeight="700" fill={p.mis ? "#B4541A" : NAVY}>
                  {p.i}
                </text>
              </g>
            ))}
          </svg>
          <div className="flex items-center gap-3 text-[8.5px]" style={{ color: MUTED }}>
            <span style={{ color: ORANGE, fontWeight: 700 }}>VALUE</span> How valuable are this person&rsquo;s contributions?
            <span style={{ color: PURPLE, fontWeight: 700 }}>ENGAGEMENT</span> How engaged are they at work?
          </div>
        </Card>
        <Card className="self-start px-3 py-2">
          <div className="flex items-center text-[8.5px] font-bold uppercase tracking-[0.1em]" style={{ color: MUTED }}>
            All employees
            <span className="ml-auto">11</span>
          </div>
          <div className="mt-1.5 flex gap-1.5">
            <Pill tone="grey">11 people</Pill>
            <Pill tone="amber">2 misaligned</Pill>
          </div>
          <div className="mt-2 text-[9px] leading-snug" style={{ color: MUTED }}>
            Filter by time, department or manager, or show only misalignments.
          </div>
          {[
            ["Jordan Rivera", "Value 4 · Engagement 2"],
            ["Ben Archer", "Value 2 · Engagement 4"],
          ].map(([n, d]) => (
            <div key={n} className="mt-1.5 flex items-center gap-2 rounded-[8px] border px-2 py-1" style={{ borderColor: `${ORANGE}55` }}>
              <Avatar n={n} size={18} />
              <span className="min-w-0">
                <span className="block truncate text-[9.5px] font-semibold">{n}</span>
                <span className="block text-[8px]" style={{ color: MUTED }}>
                  {d}
                </span>
              </span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
