"use client";

// Animated hero for the Contractor HQ feature page.
//
// Contractor HQ opens in its own workspace with its own navy menu, and work
// moves down that menu in order: a request, a quote, a job, visits, an invoice.
// The tour follows one piece of work down it, the way an owner would:
//
//   Home       what needs you today: the four Workflow cards, today's
//              appointments, alerts and the week's upcoming jobs
//   Requests   a new request from the client hub, converted into a quote
//   Quote      line items with cost beside price; the quote is emailed
//   Pipeline   the quote moves from Awaiting response to Approved when the
//              client approves it in the hub
//   Schedule   Find a Time offers Crew A's free morning and the visit is booked
//   Projects   the list, then the Timeline view of every open project
//   Invoices   two closed jobs under Requires invoicing, invoiced in one go
//   Insights   lead conversion, the funnel, quote value and conversion rate
//
// Every screen is traced from the client's November 2026 screenshots: the
// Contractor HQ menu, Home, Schedule (Week and Map), Clients, Requests and one
// request, Quotes and one quote, Jobs and one job, New job and New project,
// Projects, Invoices, Payments, Pipeline, Insights, Expenses, Timesheets, the
// Create menu, search, and Settings (Company settings, Client hub, Team &
// crews, Projects, Estimating, Automations). The convert step's menu is not in
// a screenshot: the help center says each item converts into the next, and the
// menu says only that.
//
// Same architecture as the other hero tours: the screen is React state, only
// the cursor and the ripple are animated imperatively through the Web
// Animations API, and the sequence is generation-token guarded so a re-render
// or unmount cancels the in-flight tour rather than leaving orphaned timers.
//
// Everything on screen is fictional. The client's screenshots carry their own
// company, logo, staff, test clients, an office email and a phone number; none
// of that is on the public site.
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

const MIN_W = 980;
const STAGE_H = 540;
const SIDEBAR_W = 168;
const EASE = "cubic-bezier(0.22,1,0.36,1)";

const INK = "#1B1A17";
const HAIR = "#ECEAE6";
const HAIR2 = "#E3E0DA";
const MUTED = "#8A867E";
const MUTED2 = "#A9A49B";
const ORANGE = "#EA7B1B";
const NAVY = "#0F1B2D";
const RED = "#C0402B";
const AMBER = "#C9832B";

// The app's own colours: the navy menu, its green buttons, and one colour per
// record type (the tinted icon tiles and the top borders on Home's cards).
const SIDE = "#1D2B44";
const SIDE_ON = "#2B3C5A";
const APP_GREEN = "#1F9D55";
const C_REQ = "#EA7B1B";
const C_QUOTE = "#D6336C";
const C_JOB = "#1F9D55";
const C_INV = "#2F6FD8";
const C_PROJ = "#D18A00";

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
type Ico = (p: IconProps) => React.JSX.Element;

const Plus = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2.2}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const Home = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M4 11l8-6.6 8 6.6M6.4 9.2v10h11.2v-10" />
  </svg>
);
const Cal = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="3.8" y="5" width="16.4" height="15" rx="2.4" />
    <path d="M3.8 9.6h16.4M8.2 3.2v3.4M15.8 3.2v3.4" />
  </svg>
);
const Users = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="9" cy="8.2" r="3.2" />
    <path d="M3.4 19.2c.6-3.2 2.9-5.1 5.6-5.1s5 1.9 5.6 5.1" />
    <path d="M15.4 5.3a3 3 0 0 1 0 5.7M17.3 14.4c1.8.6 3 2.2 3.3 4.8" />
  </svg>
);
const Tray = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M4 13.4l2.4-7.2a1.6 1.6 0 0 1 1.5-1.1h8.2a1.6 1.6 0 0 1 1.5 1.1l2.4 7.2v4.8a1.6 1.6 0 0 1-1.6 1.6H5.6A1.6 1.6 0 0 1 4 18.2z" />
    <path d="M4 13.4h4.4l1.2 2.2h4.8l1.2-2.2H20" />
  </svg>
);
const Doc = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M14 3.6H7.2a1.6 1.6 0 0 0-1.6 1.6v13.6a1.6 1.6 0 0 0 1.6 1.6h9.6a1.6 1.6 0 0 0 1.6-1.6V8z" />
    <path d="M14 3.6V8h4.4M9 12.6h6M9 16h4" />
  </svg>
);
const Briefcase = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="3.6" y="7" width="16.8" height="12.4" rx="2" />
    <path d="M9 7V5.4A1.4 1.4 0 0 1 10.4 4h3.2A1.4 1.4 0 0 1 15 5.4V7M9 7v12.4M15 7v12.4" />
  </svg>
);
/** The hard hat the app uses for Projects, and the navbar uses for Contractor HQ. */
const HardHat = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M5.2 16.4v-1.9a6.8 6.8 0 0 1 13.6 0v1.9" />
    <path d="M10.2 8.3V6.4a1.8 1.8 0 0 1 3.6 0v1.9" />
    <path d="M3.4 16.4h17.2v1.6a1.2 1.2 0 0 1-1.2 1.2H4.6a1.2 1.2 0 0 1-1.2-1.2z" />
  </svg>
);
const Receipt = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="5" y="3.6" width="14" height="16.8" rx="1.8" />
    <path d="M8.6 8.4h6.8M8.6 12h6.8M8.6 15.6h4" />
  </svg>
);
const CardIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="3.4" y="5.6" width="17.2" height="12.8" rx="2" />
    <path d="M3.4 10h17.2" />
  </svg>
);
const Kanban = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="3.8" y="3.8" width="16.4" height="16.4" rx="2.2" />
    <path d="M8.4 7.6v6M12 7.6v3.6M15.6 7.6v8" />
  </svg>
);
const Bars = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M4.6 4.6v14.8h14.8M9 16v-4M13 16V8.6M17 16v-6" />
  </svg>
);
const Dollar = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="4.6" y="3.6" width="14.8" height="16.8" rx="2" />
    <path d="M14.2 9.2c-.4-.9-1.2-1.4-2.2-1.4-1.3 0-2.2.7-2.2 1.7 0 2.4 4.6 1.2 4.6 3.6 0 1-1 1.8-2.4 1.8-1.1 0-2-.5-2.4-1.4M12 6.6v1.2M12 15.4v1.4" />
  </svg>
);
const Clock = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="12" cy="12" r="8.2" />
    <path d="M12 7.6V12l3 1.8" />
  </svg>
);
const Gear = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3.4v2.2M12 18.4v2.2M3.4 12h2.2M18.4 12h2.2M5.9 5.9l1.6 1.6M16.5 16.5l1.6 1.6M5.9 18.1l1.6-1.6M16.5 7.5l1.6-1.6" />
  </svg>
);
const Bell = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M6.4 16.4V11a5.6 5.6 0 0 1 11.2 0v5.4l1.6 1.8H4.8zM10 20.4h4" />
  </svg>
);
const Back = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);
const Search = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="11" cy="11" r="6.4" />
    <path d="M20 20l-4.4-4.4" />
  </svg>
);
const Spark = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 3.6l1.8 5.1 5.1 1.8-5.1 1.8L12 17.4l-1.8-5.1-5.1-1.8 5.1-1.8z" />
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
const ChevL = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2.2}>
    <path d="M14.5 6l-6 6 6 6" />
  </svg>
);
const ChevR = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2.2}>
    <path d="M9.5 6l6 6-6 6" />
  </svg>
);
const Dots = ({ className, style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="6" cy="12" r="1.6" />
    <circle cx="12" cy="12" r="1.6" />
    <circle cx="18" cy="12" r="1.6" />
  </svg>
);
const Pin = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 20.6s-6.4-5.6-6.4-10.6a6.4 6.4 0 0 1 12.8 0c0 5-6.4 10.6-6.4 10.6z" />
    <circle cx="12" cy="10" r="2.2" />
  </svg>
);
const Phone = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M5.2 4h3.4l1.6 4-2.2 1.4a10 10 0 0 0 4.6 4.6l1.4-2.2 4 1.6v3.4a1.6 1.6 0 0 1-1.6 1.6A15.6 15.6 0 0 1 3.6 5.6 1.6 1.6 0 0 1 5.2 4z" />
  </svg>
);
const Mail = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="3.6" y="5.6" width="16.8" height="12.8" rx="2" />
    <path d="M4 6.4l8 6 8-6" />
  </svg>
);
const Repeat = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M4.4 11V9.6a3 3 0 0 1 3-3h11l-3-3M19.6 13v1.4a3 3 0 0 1-3 3h-11l3 3" />
  </svg>
);
const Warn = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 4.2l8.4 14.6H3.6z" />
    <path d="M12 10v3.6M12 16.4h.01" />
  </svg>
);
const Box = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 3.4l7.6 4.2v8.8L12 20.6l-7.6-4.2V7.6z" />
    <path d="M4.4 7.6L12 11.8l7.6-4.2M12 11.8v8.8" />
  </svg>
);
const Note = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M5.6 3.6h12.8v11.2l-5.6 5.6H5.6z" />
    <path d="M12.8 20.4v-5.6h5.6" />
  </svg>
);
const List = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M9 6.4h11M9 12h11M9 17.6h11M4.4 6.4h.01M4.4 12h.01M4.4 17.6h.01" strokeWidth={2} />
  </svg>
);
const Pulse = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M3.6 12h4l2-5 4 10 2-5h4.8" />
  </svg>
);
const Funnel = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M4 5h16l-6.2 7.4v5.4l-3.6 1.8v-7.2z" />
  </svg>
);
const Trend = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M3.6 16.4l5.6-5.6 3.6 3.6 7.6-7.6M15 6.8h5.2V12" />
  </svg>
);

// ---------------------------------------------------------------- data
type View = "home" | "requests" | "quote" | "pipeline" | "schedule" | "projects" | "invoices" | "insights";

// The Contractor HQ menu, in the app's order and groups, with Projects on.
const NAV: { k: string; l: string; icon: Ico }[][] = [
  [
    { k: "home", l: "Home", icon: Home },
    { k: "schedule", l: "Schedule", icon: Cal },
  ],
  [
    { k: "clients", l: "Clients", icon: Users },
    { k: "requests", l: "Requests", icon: Tray },
    { k: "quotes", l: "Quotes", icon: Doc },
    { k: "jobs", l: "Jobs", icon: Briefcase },
    { k: "projects", l: "Projects", icon: HardHat },
    { k: "invoices", l: "Invoices", icon: Receipt },
    { k: "payments", l: "Payments", icon: CardIcon },
  ],
  [
    { k: "pipeline", l: "Pipeline", icon: Kanban },
    { k: "insights", l: "Insights", icon: Bars },
    { k: "expenses", l: "Expenses", icon: Dollar },
    { k: "timesheets", l: "Timesheets", icon: Clock },
  ],
  [{ k: "settings", l: "Settings", icon: Gear }],
];
const NAV_FOR: Record<View, string> = {
  home: "home",
  requests: "requests",
  quote: "quotes",
  pipeline: "pipeline",
  schedule: "schedule",
  projects: "projects",
  invoices: "invoices",
  insights: "insights",
};

// Quote #24, the piece of work the tour follows. The same quote is the
// section demo on the page, so the numbers must stay in step.
const QUOTE_LINES = [
  { n: "Backsplash tile, supply (sq ft)", q: 32, cost: 6.5, price: 11 },
  { n: "Setting materials and grout", q: 1, cost: 85, price: 140 },
  { n: "Installation labor (hours)", q: 12, cost: 35, price: 85 },
  { n: "Outlet extenders and trim", q: 1, cost: 40, price: 95 },
];
const SUBTOTAL = QUOTE_LINES.reduce((s, l) => s + l.q * l.price, 0); // 1,607.00
const TAX = Math.round(SUBTOTAL * 0.0825 * 100) / 100; // 132.58
const TOTAL_COST = QUOTE_LINES.reduce((s, l) => s + l.q * l.cost, 0); // 753.00

const money = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const REQUESTS = [
  { c: "Elena Cruz", t: "Kitchen backsplash", p: "1420 Alder Creek Dr, Austin", d: "Nov 4, 2026", s: "New", hub: true },
  { c: "Owen Park", t: "Pantry shelving", p: "88 Cypress Bend, Round Rock", d: "Nov 3, 2026", s: "New" },
  { c: "Samuel Ortiz", t: "Fence repair estimate", p: "905 Larkspur Way, Georgetown", d: "Nov 2, 2026", s: "Needs approval" },
  { c: "Hannah Reyes", t: "Garage door trim", p: "31 Mesa Verde Ct, Kyle", d: "Oct 30, 2026", s: "Assessment complete" },
  { c: "Grace Okafor", t: "Basement finish", p: "602 Hollow Oak Ln, Leander", d: "Oct 12, 2026", s: "Converted" },
  { c: "Maya Lindqvist", t: "Primary bath remodel", p: "15 Brushy Ridge Rd, Cedar Park", d: "Oct 9, 2026", s: "Converted" },
];

// ---------------------------------------------------------------- scene
type Scene = {
  dim: boolean;
  view: View;
  /** The row menu on Elena Cruz's request is open. */
  reqMenu: boolean;
  quoteSent: boolean;
  /** Elena Cruz approved Quote #24 in the client hub. */
  approved: boolean;
  /** Find a Time is showing Crew A's free morning. */
  slot: boolean;
  booked: boolean;
  timeline: boolean;
  selected: boolean;
  invoiced: boolean;
  toast: string | null;
};
const BLANK: Scene = {
  dim: false,
  view: "home",
  reqMenu: false,
  quoteSent: false,
  approved: false,
  slot: false,
  booked: false,
  timeline: false,
  selected: false,
  invoiced: false,
  toast: null,
};
// The frame shown under prefers-reduced-motion: Home, which is what needs you
// today across the whole module.
const STILL: Scene = { ...BLANK };

export default function ContractorHqHeroTour() {
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
      const node = stage?.querySelector(`[data-ch="${sel}"]`);
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
        await wait(2400);

        // ---- Request to quote
        if (!(await visit("nav-requests", { view: "requests" }, 900, 640))) return;
        if (!(await visit("req-more", { reqMenu: true }, 700))) return;
        if (!(await visit("convert", { view: "quote", reqMenu: false }, 1500, 520))) return;
        if (!(await tap("send-quote", 600, { quoteSent: true, toast: "Quote #24 emailed to Elena Cruz." }))) return;
        await wait(1700);
        patch({ toast: null });

        // ---- Approved in the client hub
        if (!(await visit("nav-pipeline", { view: "pipeline" }, 1100, 640))) return;
        patch({ approved: true, toast: "Elena Cruz approved Quote #24 in the client hub." });
        await wait(2100);
        patch({ toast: null });

        // ---- On the schedule
        if (!(await visit("nav-schedule", { view: "schedule" }, 700, 640))) return;
        if (!(await visit("find-time", { slot: true }, 900))) return;
        if (!(await tap("free-slot", 600, { booked: true, slot: false, toast: "Booked: Fri Nov 6, 8:00 AM, Crew A." }))) return;
        await wait(1800);
        patch({ toast: null });

        // ---- Projects
        if (!(await visit("nav-projects", { view: "projects" }, 1000, 620))) return;
        if (!(await visit("ptab-timeline", { timeline: true }, 2300))) return;

        // ---- Invoices
        if (!(await visit("nav-invoices", { view: "invoices" }, 800, 620))) return;
        if (!(await tap("select-all", 560, { selected: true }))) return;
        await wait(450);
        if (!(await tap("create-invoice", 560, { invoiced: true, toast: "2 draft invoices created, one per client." }))) return;
        await wait(1900);
        patch({ toast: null });

        // ---- Insights
        if (!(await visit("nav-insights", { view: "insights" }, 3000, 620))) return;

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
            <div className="flex min-w-0 flex-1 flex-col">
              <TopBar />
              <div className="relative min-h-0 flex-1">
                <Fade on={v === "home"}>
                  <HomeScreen />
                </Fade>
                <Fade on={v === "requests"}>
                  <Requests menu={scene.reqMenu} />
                </Fade>
                <Fade on={v === "quote"} from="right">
                  <Quote sent={scene.quoteSent} />
                </Fade>
                <Fade on={v === "pipeline"}>
                  <Pipeline approved={scene.approved} />
                </Fade>
                <Fade on={v === "schedule"}>
                  <Schedule slot={scene.slot} booked={scene.booked} />
                </Fade>
                <Fade on={v === "projects"}>
                  <Projects timeline={scene.timeline} />
                </Fade>
                <Fade on={v === "invoices"}>
                  <Invoices selected={scene.selected} invoiced={scene.invoiced} />
                </Fade>
                <Fade on={v === "insights"}>
                  <Insights />
                </Fade>
              </div>
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
              <span className="grid h-[16px] w-[16px] place-items-center rounded-full" style={{ background: APP_GREEN }}>
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

type Tone = "green" | "amber" | "grey" | "red" | "blue" | "purple" | "orange";
const TONES: Record<Tone, { background: string; color: string }> = {
  green: { background: "#E3F4EA", color: "#1B7A45" },
  amber: { background: "#FCEFD9", color: "#9A5A12" },
  grey: { background: "#EEECE8", color: MUTED },
  red: { background: "#FBE4E1", color: "#B4322A" },
  blue: { background: "#E3EEFB", color: "#1F5F9E" },
  purple: { background: "#EFE8FC", color: "#5B3BB8" },
  orange: { background: "#FDEBDC", color: "#B4541A" },
};

/** A status chip with the app's leading dot. */
function Pill({ children, tone }: { children: React.ReactNode; tone: Tone }) {
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full px-1.5 py-[1.5px] text-[8.5px] font-semibold transition-colors duration-300" style={TONES[tone]}>
      <span className="h-[4px] w-[4px] rounded-full" style={{ background: "currentColor" }} />
      {children}
    </span>
  );
}

function Btn({ children, green, ph, style }: { children: React.ReactNode; green?: boolean; ph?: string; style?: React.CSSProperties }) {
  return (
    <span
      data-ch={ph}
      className="flex flex-none items-center gap-1.5 whitespace-nowrap rounded-[7px] border px-2.5 py-[5px] text-[10px] font-semibold transition-colors duration-300"
      style={{ ...(green ? { background: APP_GREEN, borderColor: APP_GREEN, color: "#fff" } : { background: "#fff", borderColor: HAIR2, color: INK }), ...style }}
    >
      {children}
    </span>
  );
}

const Card = ({ children, className = "", style, ph }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; ph?: string }) => (
  <div data-ch={ph} className={`rounded-[10px] border bg-white ${className}`} style={{ borderColor: HAIR, ...style }}>
    {children}
  </div>
);

/** A tinted icon tile in the record's colour, as every Contractor HQ page header has. */
function Tile({ icon: I, c, size = 26 }: { icon: Ico; c: string; size?: number }) {
  return (
    <span className="grid flex-none place-items-center rounded-[8px]" style={{ width: size, height: size, background: `${c}1A`, color: c }}>
      <I className="h-[55%] w-[55%]" />
    </span>
  );
}

function PageHead({ icon, c, title, right }: { icon: Ico; c: string; title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <Tile icon={icon} c={c} size={28} />
      <span className="text-[18px] font-bold tracking-tight">{title}</span>
      {right && <span className="ml-auto flex items-center gap-1.5">{right}</span>}
    </div>
  );
}

/** A stat card: small tinted icon, a label, a muted period, and a big number. */
function Stat({ icon, c, l, sub, big, foot, footColor }: { icon: Ico; c: string; l: string; sub?: string; big: string; foot?: string; footColor?: string }) {
  return (
    <Card className="px-3 py-2">
      <div className="flex items-center gap-1.5">
        <Tile icon={icon} c={c} size={16} />
        <span className="text-[10px] font-semibold">{l}</span>
      </div>
      {sub && (
        <div className="ml-[22px] text-[8.5px]" style={{ color: MUTED }}>
          {sub}
        </div>
      )}
      <div className="mt-0.5 text-center text-[22px] font-extrabold leading-tight tabular-nums tracking-tight">{big}</div>
      {foot && (
        <div className="text-center text-[9px]" style={{ color: footColor ?? MUTED }}>
          {foot}
        </div>
      )}
    </Card>
  );
}

/** The Overview card: a list of statuses with a coloured dot and a count each. */
function Overview({ icon, c, rows }: { icon: Ico; c: string; rows: [string, string, string | number][] }) {
  return (
    <Card className="px-3 py-2">
      <div className="flex items-center gap-1.5">
        <Tile icon={icon} c={c} size={16} />
        <span className="text-[10px] font-semibold">Overview</span>
      </div>
      <div className="mt-1">
        {rows.map(([l, dot, n]) => (
          <div key={l} className="flex items-center gap-1.5 py-[1.5px] text-[9.5px]">
            <span className="h-[5px] w-[5px] rounded-full" style={{ background: dot }} />
            <span style={{ color: "#4A4740" }}>{l}</span>
            <span className="ml-auto tabular-nums">{n}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

const initials = (n: string) =>
  n
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

function Avatar({ n, size = 16 }: { n: string; size?: number }) {
  return (
    <span className="grid flex-none place-items-center rounded-full text-[6.5px] font-bold text-white" style={{ width: size, height: size, background: SIDE }}>
      {initials(n)}
    </span>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`text-[8px] font-semibold uppercase tracking-[0.08em] ${className}`} style={{ color: MUTED }}>
      {children}
    </span>
  );
}

// ---------------------------------------------------------------- chrome
function Sidebar({ active }: { active: string }) {
  return (
    <div className="flex flex-none flex-col px-2 pb-2.5 pt-3" style={{ width: SIDEBAR_W, background: SIDE }}>
      {/* The company's own logo sits here in the app. */}
      <div className="mb-2.5 flex items-center gap-2 px-1.5">
        <span className="grid h-[26px] w-[26px] place-items-center rounded-[7px] text-[13px] font-extrabold" style={{ background: "#fff", color: SIDE }}>
          R
        </span>
        <span className="leading-tight">
          <span className="block text-[11px] font-bold text-white">Ridgeline</span>
          <span className="block text-[7.5px] font-semibold uppercase tracking-[0.18em]" style={{ color: "#E07A5F" }}>
            Services
          </span>
        </span>
      </div>
      <div className="mb-2 flex items-center justify-center gap-1.5 rounded-[7px] py-[6px] text-[10.5px] font-semibold text-white" style={{ background: APP_GREEN }}>
        <Plus className="h-[11px] w-[11px]" />
        Create
      </div>
      {NAV.map((group, gi) => (
        <div key={gi} className="border-b py-1 last:border-b-0" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          {group.map((n) => {
            const on = n.k === active;
            return (
              <div
                key={n.k}
                data-ch={`nav-${n.k}`}
                className="relative flex items-center gap-2 rounded-[6px] px-2 py-[4.5px] text-[10.5px] transition-colors duration-300"
                style={on ? { background: SIDE_ON, color: "#fff", fontWeight: 700 } : { color: "#C7CEDB" }}
              >
                {on && <span className="absolute bottom-[5px] left-0 top-[5px] w-[2.5px] rounded-full" style={{ background: APP_GREEN }} />}
                <n.icon className="h-[12px] w-[12px] flex-none" />
                {n.l}
              </div>
            );
          })}
        </div>
      ))}
      <div className="mt-auto border-t pt-1.5" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        {[
          { l: "Inbox", icon: Bell },
          { l: "Back to Multiply OS", icon: Back },
        ].map((n) => (
          <div key={n.l} className="flex items-center gap-2 px-2 py-[4px] text-[10px]" style={{ color: "#C7CEDB" }}>
            <n.icon className="h-[12px] w-[12px] flex-none" />
            {n.l}
          </div>
        ))}
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <div className="flex h-[34px] flex-none items-center gap-3 border-b bg-white px-4" style={{ borderColor: HAIR }}>
      <span className="text-[10.5px] font-bold">Ridgeline Services</span>
      <span className="ml-auto flex w-[150px] items-center gap-1.5 rounded-[7px] border px-2 py-[3px] text-[9.5px]" style={{ borderColor: HAIR2, color: MUTED }}>
        <Search className="h-[10px] w-[10px]" />
        Search
        <span className="ml-auto rounded-[3px] border px-1 text-[8px]" style={{ borderColor: HAIR2 }}>
          /
        </span>
      </span>
      <span className="flex items-center gap-1 text-[10px] font-semibold">
        <Spark className="h-[11px] w-[11px]" />
        Ask Multi
      </span>
      <span className="text-[9.5px]" style={{ color: MUTED }}>
        Dana Whitfield
      </span>
    </div>
  );
}

// ---------------------------------------------------------------- Home
function HomeScreen() {
  const flow = [
    { l: "Invoices", icon: Receipt, c: C_INV, big: "1", s: "Past due", rows: [["Awaiting payment (1)", "$1,001.31"], ["Part paid (0)", "$0.00"], ["Draft", "0"]] },
    { l: "Requests", icon: Tray, c: C_REQ, big: "2", s: "New", rows: [["Needs approval", "1"], ["Overdue", "0"]] },
    { l: "Quotes", icon: Doc, c: C_QUOTE, big: "2", s: "Approved", rows: [["Draft", "1"], ["Changes requested", "1"]] },
    { l: "Jobs", icon: Briefcase, c: C_JOB, big: "2", s: "Requires invoicing", rows: [["Active (6)", "$18,430.00"], ["Action required", "1"]] },
  ];
  const visits = [
    { t: "7:30 AM", n: "Water heater check", c: "Noah Bennett", crew: ["Sam Ortega"], s: "Completed", tone: "grey" as Tone },
    { t: "8:00 AM", n: "Kitchen remodel · Inspection", c: "Owen Park", crew: ["Marcus Hale", "Theo Barnes"], s: "Active", tone: "green" as Tone },
    { t: "2:00 PM", n: "Bathroom fan replacement", c: "Maya Lindqvist", crew: ["Sam Ortega"], s: "Upcoming", tone: "blue" as Tone },
  ];
  return (
    <div className="flex flex-col gap-2.5 px-5 pt-3">
      <div>
        <div className="text-[10px]" style={{ color: MUTED }}>
          Wednesday, November 4
        </div>
        <div className="text-[19px] font-bold leading-tight tracking-tight">Good morning, Dana</div>
      </div>

      <div className="text-[10.5px] font-bold">Workflow</div>
      <div className="grid grid-cols-4 gap-2">
        {flow.map((f) => (
          <Card key={f.l} className="overflow-hidden border-t-[3px] px-3 pb-2 pt-2" style={{ borderTopColor: f.c }}>
            <div className="flex items-center gap-1.5">
              <Tile icon={f.icon} c={f.c} size={18} />
              <span className="text-[10.5px] font-bold">{f.l}</span>
            </div>
            <div className="mt-1 text-[20px] font-extrabold leading-none tabular-nums">{f.big}</div>
            <div className="mt-0.5 text-[9.5px]" style={{ color: "#4A4740" }}>
              {f.s}
            </div>
            <div className="mt-1.5 border-t pt-1" style={{ borderColor: HAIR }}>
              {f.rows.map(([a, b]) => (
                <div key={a} className="flex text-[9px] leading-[15px]">
                  <span style={{ color: "#4A4740" }}>{a}</span>
                  <span className="ml-auto tabular-nums">{b}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_200px] gap-2">
        <Card>
          <div className="flex items-center gap-2 border-b px-3 py-2" style={{ borderColor: HAIR }}>
            <span className="text-[11px] font-bold">Today&rsquo;s appointments</span>
            <span className="ml-auto flex overflow-hidden rounded-[6px] border text-[8.5px] font-semibold" style={{ borderColor: HAIR2 }}>
              <span className="px-1.5 py-[2px] text-white" style={{ background: APP_GREEN }}>
                Visit
              </span>
              <span className="px-1.5 py-[2px]" style={{ color: MUTED }}>
                Employee
              </span>
            </span>
            <span className="flex items-center gap-1 text-[9.5px] font-semibold" style={{ color: APP_GREEN }}>
              <Cal className="h-[10px] w-[10px]" />
              View Schedule
            </span>
          </div>
          <div className="grid grid-cols-5 border-b" style={{ borderColor: HAIR }}>
            {[
              ["3", "Total"],
              ["1", "Active"],
              ["1", "Completed"],
              ["0", "Overdue"],
              ["$1,618.88", "Remaining"],
            ].map(([n, l], i) => (
              <div key={l} className="py-1.5 text-center" style={{ borderLeft: i ? `1px solid ${HAIR}` : undefined }}>
                <div className="text-[13px] font-bold tabular-nums">{n}</div>
                <div className="text-[8.5px]" style={{ color: MUTED }}>
                  {l}
                </div>
              </div>
            ))}
          </div>
          {visits.map((x) => (
            <div key={x.n} className="flex items-center gap-2.5 border-b px-3 py-[6px] last:border-b-0" style={{ borderColor: HAIR }}>
              <span className="w-[44px] text-[9.5px] font-semibold tabular-nums">{x.t}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[10px] font-semibold">{x.n}</span>
                <span className="block truncate text-[8.5px]" style={{ color: MUTED }}>
                  {x.c}
                </span>
              </span>
              <span className="flex gap-[2px]">
                {x.crew.map((p) => (
                  <Avatar key={p} n={p} />
                ))}
              </span>
              <span className="w-[62px] text-right">
                <Pill tone={x.tone}>{x.s}</Pill>
              </span>
            </div>
          ))}
        </Card>
        <div className="flex flex-col gap-2">
          <Card className="px-3 py-2">
            <div className="text-[10.5px] font-bold">Alerts</div>
            {["1 recurring job ending within 30 days", "2 jobs are late"].map((a) => (
              <div key={a} className="mt-1 flex items-center gap-1.5 text-[9.5px]">
                <Warn className="h-[11px] w-[11px] flex-none" style={{ color: AMBER }} />
                {a}
              </div>
            ))}
          </Card>
          <Card className="px-3 py-2">
            <div className="text-[10.5px] font-bold">Upcoming jobs</div>
            <div className="text-[8.5px]" style={{ color: MUTED }}>
              This week
            </div>
            <div className="mt-1 text-[19px] font-extrabold tabular-nums">$6,420.00</div>
            <div className="text-[9px] font-semibold" style={{ color: APP_GREEN }}>
              ↑ 18% vs last week
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Requests
const REQ_TONE: Record<string, Tone> = { New: "blue", "Needs approval": "blue", "Assessment complete": "green", Converted: "green" };

function Requests({ menu }: { menu: boolean }) {
  return (
    <div className="px-5 pt-3">
      <PageHead
        icon={Tray}
        c={C_REQ}
        title="Requests"
        right={
          <Btn green>
            <Plus className="h-[10px] w-[10px]" />
            New Request
          </Btn>
        }
      />
      <div className="mt-2.5 grid grid-cols-3 gap-2">
        <Overview
          icon={Tray}
          c={C_REQ}
          rows={[
            ["Needs approval", "#2F8FD8", 1],
            ["New", "#2F8FD8", 2],
            ["Assessment complete", APP_GREEN, 1],
            ["Overdue", RED, 0],
          ]}
        />
        <Stat icon={Tray} c={C_REQ} l="New requests" sub="Past 30 days" big="15" />
        <Stat icon={Trend} c={C_REQ} l="Conversion rate" sub="Past 30 days" big="40%" />
      </div>
      <div className="mt-2.5 text-[11.5px] font-bold">All requests (6 results)</div>
      <Card className="mt-1.5">
        <div className="grid grid-cols-[1.1fr_1.3fr_1.7fr_0.9fr_1fr_20px] gap-2 border-b px-3 py-1.5" style={{ borderColor: HAIR }}>
          <Th>Client</Th>
          <Th>Title</Th>
          <Th>Property</Th>
          <Th>Requested</Th>
          <Th>Status</Th>
          <span />
        </div>
        {REQUESTS.map((r, i) => (
          <div
            key={r.c}
            className="relative grid grid-cols-[1.1fr_1.3fr_1.7fr_0.9fr_1fr_20px] items-center gap-2 border-b px-3 py-[6px] last:border-b-0"
            style={{ borderColor: HAIR, background: r.hub ? "#FFF8F1" : undefined }}
          >
            <span className="truncate text-[10px] font-semibold">{r.c}</span>
            <span className="min-w-0">
              <span className="block truncate text-[10px]">{r.t}</span>
              {r.hub && (
                <span className="text-[8px] font-semibold" style={{ color: C_REQ }}>
                  Source: Client hub
                </span>
              )}
            </span>
            <span className="truncate text-[9.5px]" style={{ color: "#4A4740" }}>
              {r.p}
            </span>
            <span className="text-[9.5px] tabular-nums" style={{ color: "#4A4740" }}>
              {r.d}
            </span>
            <span>
              <Pill tone={REQ_TONE[r.s]}>{r.s}</Pill>
            </span>
            <span data-ch={i === 0 ? "req-more" : undefined} className="grid h-[18px] w-[18px] place-items-center rounded-[5px]" style={{ color: MUTED }}>
              <Dots className="h-[12px] w-[12px]" />
            </span>
            {i === 0 && (
              <div
                className="absolute right-3 top-[calc(100%-4px)] z-10 w-[170px] rounded-[9px] border bg-white py-1 text-[10px] transition-all duration-150"
                style={{
                  borderColor: HAIR2,
                  opacity: menu ? 1 : 0,
                  transform: menu ? "translateY(0)" : "translateY(-4px)",
                  boxShadow: "0 16px 32px -14px rgba(20,15,10,0.35)",
                }}
              >
                <div data-ch="convert" className="flex items-center gap-2 px-3 py-[6px] font-semibold" style={{ background: "#F7F5F1" }}>
                  <Doc className="h-[11px] w-[11px]" style={{ color: C_QUOTE }} />
                  Convert to quote
                </div>
                <div className="flex items-center gap-2 px-3 py-[6px]">
                  <Briefcase className="h-[11px] w-[11px]" style={{ color: C_JOB }} />
                  Convert to job
                </div>
              </div>
            )}
          </div>
        ))}
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------- Quote #24
function Quote({ sent }: { sent: boolean }) {
  return (
    <div className="px-5 pt-3">
      <Card className="flex items-center gap-2.5 overflow-hidden border-t-[3px] px-3.5 py-2.5" style={{ borderTopColor: C_QUOTE }}>
        <Tile icon={Doc} c={C_QUOTE} size={28} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Pill tone={sent ? "blue" : "grey"}>{sent ? "Awaiting response" : "Draft"}</Pill>
            <span className="text-[9.5px]" style={{ color: MUTED }}>
              Quote #24
            </span>
          </div>
          <div className="text-[16px] font-bold tracking-tight">Kitchen backsplash</div>
        </div>
        <Btn>
          <Dots className="h-[11px] w-[11px]" />
          More
        </Btn>
        <Btn green ph="send-quote">
          <Mail className="h-[10px] w-[10px]" />
          {sent ? "Resend Email" : "Send Email"}
        </Btn>
      </Card>

      <div className="mt-2 grid grid-cols-[1fr_190px] gap-2">
        <div className="flex flex-col gap-2">
          <Card>
            <div className="flex items-center gap-1.5 border-b px-3 py-1.5" style={{ borderColor: HAIR }}>
              <Tile icon={Users} c={C_QUOTE} size={16} />
              <span className="text-[10.5px] font-bold">Client</span>
            </div>
            <div className="grid grid-cols-[1.3fr_1fr_1fr] gap-x-3 px-3 py-2">
              <div className="row-span-2">
                <div className="text-[11px] font-bold">Elena Cruz</div>
                {[
                  [Pin, "1420 Alder Creek Dr, Austin, TX"],
                  [Phone, "(555) 014-2290"],
                  [Mail, "elena.cruz@example.com"],
                ].map(([I, t]) => {
                  const Icon = I as Ico;
                  return (
                    <div key={t as string} className="mt-[3px] flex items-center gap-1.5 text-[9px]" style={{ color: "#4A4740" }}>
                      <Icon className="h-[9px] w-[9px] flex-none" />
                      {t as string}
                    </div>
                  );
                })}
              </div>
              {[
                ["Created", "Nov 4, 2026"],
                ["Salesperson", "Dana Whitfield"],
                ["Request", "#41 · Client hub"],
                ["Sent", sent ? "Nov 4, 2026" : "—"],
              ].map(([l, val]) => (
                <div key={l}>
                  <Th>{l}</Th>
                  <div className="text-[9.5px] font-medium">{val}</div>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-1.5 border-b px-3 py-1.5" style={{ borderColor: HAIR }}>
              <Tile icon={Box} c={C_QUOTE} size={16} />
              <span className="text-[10.5px] font-bold">Product / Service</span>
            </div>
            <div className="px-3 pb-2 pt-1.5">
              <div className="grid grid-cols-[2.4fr_0.6fr_0.9fr_0.9fr_0.9fr] gap-2 border-b pb-1" style={{ borderColor: HAIR }}>
                <Th>Line item</Th>
                <Th className="text-right">Qty</Th>
                <Th className="text-right">Unit cost</Th>
                <Th className="text-right">Unit price</Th>
                <Th className="text-right">Total</Th>
              </div>
              {QUOTE_LINES.map((l) => (
                <div key={l.n} className="grid grid-cols-[2.4fr_0.6fr_0.9fr_0.9fr_0.9fr] gap-2 border-b py-[5px] text-[9.5px] tabular-nums" style={{ borderColor: HAIR }}>
                  <span className="truncate font-medium">{l.n}</span>
                  <span className="text-right">{l.q}</span>
                  <span className="text-right" style={{ color: MUTED }}>
                    {money(l.cost)}
                  </span>
                  <span className="text-right">{money(l.price)}</span>
                  <span className="text-right">{money(l.q * l.price)}</span>
                </div>
              ))}
              <div className="ml-auto mt-1.5 w-[220px] text-[9.5px] tabular-nums">
                {[
                  ["Subtotal", money(SUBTOTAL)],
                  ["Tax (Sales tax 8.25%)", money(TAX)],
                ].map(([a, b]) => (
                  <div key={a} className="flex py-[1px]">
                    <span style={{ color: MUTED }}>{a}</span>
                    <span className="ml-auto">{b}</span>
                  </div>
                ))}
                <div className="mt-0.5 flex border-t pt-1 text-[11px] font-bold" style={{ borderColor: HAIR }}>
                  Total<span className="ml-auto">{money(SUBTOTAL + TAX)}</span>
                </div>
                <div className="flex py-[1px]">
                  <span style={{ color: MUTED }}>Total cost</span>
                  <span className="ml-auto">{money(TOTAL_COST)}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
        <Card className="self-start">
          <div className="border-b px-3 py-1.5" style={{ borderColor: HAIR }}>
            <div className="flex items-center gap-1.5">
              <Tile icon={Note} c={C_QUOTE} size={16} />
              <span className="text-[10.5px] font-bold">Notes</span>
            </div>
            <div className="mt-0.5 text-[8px]" style={{ color: MUTED }}>
              Internal only. Your client never sees these.
            </div>
          </div>
          <div className="px-3 py-2">
            <div className="rounded-[7px] border px-2 py-1.5 text-[9px]" style={{ borderColor: HAIR2, color: MUTED2 }}>
              Leave an internal note for yourself or a teammate
            </div>
            <div className="mt-2 text-[9.5px] leading-snug">Elena sent three photos of the wall. The two outlets need box extenders.</div>
            <div className="mt-0.5 text-[8px]" style={{ color: MUTED }}>
              Avery Rowe · Nov 4, 9:12 AM
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Pipeline
type PCard = { t: string; n: string; c: string; v: string; age: string; hot?: boolean };

function PipeCard({ p, req }: { p: PCard; req?: boolean }) {
  const I = req ? Tray : Doc;
  return (
    <div
      className="mb-1.5 rounded-[8px] border bg-white px-2 py-1.5 transition-shadow duration-300"
      style={{ borderColor: p.hot ? APP_GREEN : HAIR, boxShadow: p.hot ? `0 0 0 2px ${APP_GREEN}26` : "none" }}
    >
      <div className="flex items-center gap-1">
        <I className="h-[10px] w-[10px] flex-none" style={{ color: req ? C_REQ : C_QUOTE }} />
        <span className="truncate text-[9.5px] font-semibold">{p.t}</span>
      </div>
      <div className="mt-0.5 flex gap-1.5 truncate text-[8.5px]" style={{ color: MUTED }}>
        <span>#{p.n}</span>
        <span className="truncate">{p.c}</span>
      </div>
      <div className="mt-0.5 flex text-[8.5px]">
        <span className="font-bold tabular-nums">{p.v}</span>
        <span className="ml-auto" style={{ color: MUTED }}>
          {p.age}
        </span>
      </div>
    </div>
  );
}

function Pipeline({ approved }: { approved: boolean }) {
  const ours: PCard = { t: "Kitchen backsplash", n: "24", c: "Elena Cruz", v: "$1.7K", age: approved ? "just now" : "today", hot: approved };
  const cols: { t: string; icon: Ico; c: string; n: number; sum: string; cards: PCard[] }[] = [
    {
      t: "Requests",
      icon: Tray,
      c: C_REQ,
      n: 3,
      sum: "",
      cards: [
        { t: "Pantry shelving", n: "42", c: "Owen Park", v: "No price yet", age: "1 day ago" },
        { t: "Fence repair estimate", n: "40", c: "Samuel Ortiz", v: "No price yet", age: "2 days ago" },
        { t: "Garage door trim", n: "38", c: "Hannah Reyes", v: "No price yet", age: "5 days ago" },
      ],
    },
    { t: "Draft", icon: Doc, c: C_QUOTE, n: 1, sum: "$1.7K", cards: [{ t: "Water heater replacement", n: "23", c: "Noah Bennett", v: "$1.7K", age: "2 days ago" }] },
    {
      t: "Awaiting response",
      icon: Clock,
      c: C_QUOTE,
      n: approved ? 1 : 2,
      sum: approved ? "$1.0K" : "$2.7K",
      cards: [...(approved ? [] : [ours]), { t: "Gutter guards", n: "22", c: "Grace Okafor", v: "$1.0K", age: "9 days ago" }],
    },
    { t: "Changes requested", icon: Note, c: C_QUOTE, n: 1, sum: "$1.2K", cards: [{ t: "Hallway repaint", n: "21", c: "Samuel Ortiz", v: "$1.2K", age: "6 days ago" }] },
    {
      t: "Approved",
      icon: Check,
      c: C_QUOTE,
      n: approved ? 3 : 2,
      sum: approved ? "$5.6K" : "$3.9K",
      cards: [...(approved ? [ours] : []), { t: "Deck repair and stain", n: "19", c: "Noah Bennett", v: "$2.2K", age: "12 days ago" }, { t: "Fence stain", n: "20", c: "Hannah Reyes", v: "$1.7K", age: "8 days ago" }],
    },
    {
      t: "Converted to job",
      icon: Briefcase,
      c: C_QUOTE,
      n: 3,
      sum: "$96.8K",
      cards: [
        { t: "Kitchen remodel", n: "18", c: "Owen Park", v: "$48.6K", age: "3 weeks ago" },
        { t: "Basement finish", n: "16", c: "Grace Okafor", v: "$36.2K", age: "6 weeks ago" },
        { t: "Primary bath remodel", n: "17", c: "Maya Lindqvist", v: "$12.0K", age: "4 weeks ago" },
      ],
    },
  ];
  return (
    <div className="px-5 pt-3">
      <PageHead icon={Kanban} c={C_QUOTE} title="Pipeline" />
      <div className="ml-[38px] text-[10px]" style={{ color: MUTED }}>
        Every quote from draft to won, and the requests still waiting for one.
      </div>
      <div className="mt-2.5 grid grid-cols-6 gap-1.5">
        {cols.map((col) => (
          <div key={col.t} className="rounded-[10px] border px-1.5 pb-1 pt-1.5" style={{ borderColor: HAIR, background: "#F1EFEB", height: 400 }}>
            <div className="mb-1.5 flex items-start gap-1 px-0.5">
              <Tile icon={col.icon} c={col.c} size={15} />
              <span className="min-w-0 flex-1 text-[9.5px] font-bold leading-tight">{col.t}</span>
              <span className="text-[8.5px] tabular-nums" style={{ color: MUTED }}>
                {col.n}
                {col.sum && ` · ${col.sum}`}
              </span>
            </div>
            {col.cards.map((p) => (
              <PipeCard key={p.n} p={p} req={col.t === "Requests"} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Schedule
const HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
const ROW_H = 31;
const DAYS = ["Sun 1", "Mon 2", "Tue 3", "Wed 4", "Thu 5", "Fri 6", "Sat 7"];
const VISITS = [
  { d: 1, s: 8, e: 12, t: "Deck repair · Noah Bennett", crew: ["Marcus Hale", "Sam Ortega"] },
  { d: 2, s: 8, e: 15, t: "Deck repair · Noah Bennett", crew: ["Marcus Hale", "Sam Ortega"] },
  { d: 2, s: 9, e: 11, t: "Gutter cleaning · Hannah Reyes", crew: ["Jordan Rivera"], rec: true, col: 1 },
  { d: 3, s: 7.5, e: 8.5, t: "Water heater check · Noah Bennett", crew: ["Sam Ortega"], done: true },
  { d: 3, s: 8.5, e: 13.5, t: "Kitchen remodel · Owen Park", crew: ["Marcus Hale", "Theo Barnes"], col: 1 },
  { d: 3, s: 14, e: 16, t: "Bathroom fan · Maya Lindqvist", crew: ["Sam Ortega"] },
  { d: 4, s: 13, e: 14, t: "Assessment · Samuel Ortiz", crew: ["Avery Rowe"] },
];
const hourLabel = (h: number) => `${h > 12 ? h - 12 : h} ${h >= 12 ? "PM" : "AM"}`;

function Schedule({ slot, booked }: { slot: boolean; booked: boolean }) {
  return (
    <div className="px-5 pt-3">
      <div className="flex items-center gap-2">
        <span className="text-[17px] font-bold tracking-tight">Nov 1 – Nov 7, 2026</span>
        <span className="flex overflow-hidden rounded-[7px] border bg-white text-[10px]" style={{ borderColor: HAIR2 }}>
          <span className="grid w-[22px] place-items-center">
            <ChevL className="h-[10px] w-[10px]" />
          </span>
          <span className="border-x px-2 py-[4px] font-semibold" style={{ borderColor: HAIR2 }}>
            Today
          </span>
          <span className="grid w-[22px] place-items-center">
            <ChevR className="h-[10px] w-[10px]" />
          </span>
        </span>
        <Btn green ph="find-time">
          <Cal className="h-[10px] w-[10px]" />
          Find a Time
        </Btn>
        <span className="ml-auto flex overflow-hidden rounded-[7px] border bg-white text-[9.5px]" style={{ borderColor: HAIR2 }}>
          {["Month", "Week", "Day", "Map"].map((m) => (
            <span key={m} className="px-2 py-[4px] font-semibold" style={m === "Week" ? { background: APP_GREEN, color: "#fff" } : { color: MUTED }}>
              {m}
            </span>
          ))}
        </span>
        <Btn>
          <Cal className="h-[10px] w-[10px]" />
          To schedule
        </Btn>
      </div>
      <div className="mt-2 flex gap-1.5">
        {["Type", "Team", "Status"].map((f) => (
          <span key={f} className="flex items-center gap-1.5 rounded-full border bg-white px-2.5 py-[2px] text-[9px]" style={{ borderColor: HAIR2 }}>
            <span style={{ color: MUTED }}>{f}</span>
            <span className="font-semibold">All</span>
            <Chevron className="h-[8px] w-[8px]" />
          </span>
        ))}
      </div>
      <Card className="mt-2 overflow-hidden">
        <div className="grid grid-cols-[38px_repeat(7,1fr)] border-b" style={{ borderColor: HAIR }}>
          <span />
          {DAYS.map((d, i) => {
            const n = VISITS.filter((x) => x.d === i).length + (i === 5 && booked ? 1 : 0);
            return (
              <div key={d} className="border-l py-1 text-center" style={{ borderColor: HAIR, background: i === 3 ? "#EEF7F1" : undefined }}>
                <div className="text-[9.5px] font-bold" style={{ color: i === 3 ? APP_GREEN : INK }}>
                  {d}
                </div>
                <div className="text-[8px]" style={{ color: MUTED }}>
                  {n} visit{n === 1 ? "" : "s"}
                </div>
              </div>
            );
          })}
        </div>
        <div className="relative grid grid-cols-[38px_repeat(7,1fr)]" style={{ height: HOURS.length * ROW_H }}>
          <div>
            {HOURS.map((h) => (
              <div key={h} className="pr-1 text-right text-[7.5px]" style={{ height: ROW_H, color: MUTED }}>
                {hourLabel(h)}
              </div>
            ))}
          </div>
          {DAYS.map((d, i) => (
            <div key={d} className="relative border-l" style={{ borderColor: HAIR, background: i === 3 ? "#F6FBF8" : undefined }}>
              {HOURS.map((h) => (
                <div key={h} className="border-t" style={{ height: ROW_H, borderColor: "#F2F0EC" }} />
              ))}
              {VISITS.filter((x) => x.d === i).map((x) => (
                <VisitBlock key={x.t + x.s} s={x.s} e={x.e} t={x.t} crew={x.crew} rec={x.rec} done={x.done} col={x.col} />
              ))}
              {i === 3 && <div className="absolute left-0 right-0 z-[2] h-[2px]" style={{ top: (10.6 - 7) * ROW_H, background: RED }} />}
              {i === 5 && (
                <>
                  <div
                    data-ch="free-slot"
                    className="absolute left-[3px] right-[3px] rounded-[6px] border border-dashed px-1.5 py-1 text-[8.5px] font-semibold transition-opacity duration-300"
                    style={{ top: (8 - 7) * ROW_H + 2, height: 4 * ROW_H - 4, borderColor: APP_GREEN, background: "#EAF6EF", color: APP_GREEN, opacity: slot ? 1 : 0 }}
                  >
                    Crew A is free
                    <div className="mt-0.5 font-normal" style={{ color: "#3E7A57" }}>
                      8:00 AM – 12:00 PM
                    </div>
                  </div>
                  <div className="transition-opacity duration-300" style={{ opacity: booked ? 1 : 0 }}>
                    <VisitBlock s={8} e={12} t="Kitchen backsplash · Elena Cruz" crew={["Marcus Hale", "Sam Ortega"]} fresh />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function VisitBlock({ s, e, t, crew, rec, done, col, fresh }: { s: number; e: number; t: string; crew: string[]; rec?: boolean; done?: boolean; col?: number; fresh?: boolean }) {
  const h = s % 1 ? `${Math.floor(s) > 12 ? Math.floor(s) - 12 : Math.floor(s)}:30` : `${s > 12 ? s - 12 : s}:00`;
  return (
    <div
      className="absolute overflow-hidden rounded-[5px] border-l-[2.5px] px-1 py-[3px]"
      style={{
        top: (s - 7) * ROW_H + 1,
        height: (e - s) * ROW_H - 2,
        left: col ? "48%" : 2,
        right: 2,
        zIndex: col ? 1 : 0,
        borderLeftColor: done ? "#A9B8AE" : APP_GREEN,
        background: done ? "#F1F3F1" : fresh ? "#D6EFE0" : "#E8F4EC",
        boxShadow: fresh ? `0 0 0 2px ${APP_GREEN}33` : undefined,
      }}
    >
      <div className="flex items-center gap-[3px] text-[7.5px] font-semibold leading-tight" style={{ color: done ? MUTED : INK }}>
        {rec && <Repeat className="h-[7px] w-[7px] flex-none" />}
        <span className="truncate">
          {h} {t}
        </span>
      </div>
      <div className="mt-[2px] flex gap-[2px]">
        {crew.map((p) => (
          <Avatar key={p} n={p} size={11} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Projects
// Days from Oct 1, 2026 on the Timeline's axis, which runs Oct 1 to Jan 31.
const AXIS_DAYS = 123;
const PROJECTS = [
  { c: "Owen Park", n: "18", t: "Kitchen remodel", ph: "Rough-in", pct: 30, fin: "Nov 27, 2026", s: "Published", tone: "green" as Tone, a: 25, b: 57 },
  { c: "Grace Okafor", n: "16", t: "Basement finish", ph: "Drywall", pct: 64, fin: "Dec 11, 2026", s: "Behind baseline", tone: "red" as Tone, a: 0, b: 71, base: 64 },
  { c: "Maya Lindqvist", n: "17", t: "Primary bath remodel", ph: "Demo", pct: 8, fin: "Jan 22, 2027", s: "Published", tone: "green" as Tone, a: 39, b: 113 },
];

function Projects({ timeline }: { timeline: boolean }) {
  const pct = (d: number) => `${(d / AXIS_DAYS) * 100}%`;
  return (
    <div className="px-5 pt-3">
      <PageHead
        icon={HardHat}
        c={C_PROJ}
        title="Projects"
        right={
          <Btn green>
            <Plus className="h-[10px] w-[10px]" />
            New Project
          </Btn>
        }
      />
      <div className="mt-2.5 grid grid-cols-3 gap-2">
        <Overview
          icon={HardHat}
          c={C_PROJ}
          rows={[
            ["Active projects", APP_GREEN, 3],
            ["Behind baseline", RED, 1],
            ["Schedules offline", "#7A4EDB", 0],
          ]}
        />
        <Stat icon={Cal} c={C_PROJ} l="Items past due" sub="Across open projects" big="2" />
        <Stat icon={Clock} c={C_PROJ} l="In progress" sub="Items started, not finished" big="5" />
      </div>
      <div className="mt-3 flex items-center">
        <span className="text-[11.5px] font-bold">3 projects</span>
        <span className="ml-auto flex rounded-[8px] border bg-white p-[2px] text-[9.5px] font-semibold" style={{ borderColor: HAIR2 }}>
          {[
            { k: "list", l: "List", icon: List, on: !timeline },
            { k: "timeline", l: "Timeline", icon: Bars, on: timeline },
            { k: "health", l: "Health", icon: Pulse, on: false },
          ].map((t) => (
            <span
              key={t.k}
              data-ch={`ptab-${t.k}`}
              className="flex items-center gap-1 rounded-[6px] px-2 py-[3px] transition-colors duration-300"
              style={t.on ? { background: "#EEECE8", color: INK } : { color: MUTED }}
            >
              <t.icon className="h-[10px] w-[10px]" />
              {t.l}
            </span>
          ))}
        </span>
      </div>

      <div className="relative mt-2">
        <Card className="transition-opacity duration-300" style={{ opacity: timeline ? 0 : 1 }}>
          <div className="grid grid-cols-[1fr_1.3fr_0.8fr_1.1fr_0.9fr_1fr] gap-2 border-b px-3 py-1.5" style={{ borderColor: HAIR }}>
            {["Client", "Project", "Phase", "Progress", "Finish", "Schedule"].map((h) => (
              <Th key={h}>{h}</Th>
            ))}
          </div>
          {PROJECTS.map((p) => (
            <div key={p.n} className="grid grid-cols-[1fr_1.3fr_0.8fr_1.1fr_0.9fr_1fr] items-center gap-2 border-b px-3 py-[7px] last:border-b-0" style={{ borderColor: HAIR }}>
              <span className="truncate text-[10px] font-semibold">{p.c}</span>
              <span>
                <span className="block text-[10px] font-semibold">#{p.n}</span>
                <span className="block truncate text-[8.5px]" style={{ color: MUTED }}>
                  {p.t}
                </span>
              </span>
              <span className="text-[9.5px]">{p.ph}</span>
              <span className="flex items-center gap-1.5">
                <span className="h-[4px] flex-1 overflow-hidden rounded-full" style={{ background: "#EEECE8" }}>
                  <span className="block h-full rounded-full" style={{ width: `${p.pct}%`, background: APP_GREEN }} />
                </span>
                <span className="text-[9px] tabular-nums">{p.pct}%</span>
              </span>
              <span className="text-[9.5px] tabular-nums">{p.fin}</span>
              <span>
                <Pill tone={p.tone}>{p.s}</Pill>
              </span>
            </div>
          ))}
        </Card>

        <Card className="absolute inset-x-0 top-0 px-3 pb-3 pt-2 transition-opacity duration-300" style={{ opacity: timeline ? 1 : 0 }}>
          <div className="grid grid-cols-[150px_1fr]">
            <span />
            <div className="grid grid-cols-[31fr_30fr_31fr_31fr] text-[8.5px] font-semibold" style={{ color: MUTED }}>
              {["Oct 2026", "Nov", "Dec", "Jan 2027"].map((m) => (
                <span key={m} className="border-l pl-1" style={{ borderColor: HAIR }}>
                  {m}
                </span>
              ))}
            </div>
          </div>
          {PROJECTS.map((p) => (
            <div key={p.n} className="grid grid-cols-[150px_1fr] items-center border-t py-2" style={{ borderColor: HAIR }}>
              <span className="min-w-0 pr-2">
                <span className="block truncate text-[10px] font-semibold">{p.t}</span>
                <span className="block truncate text-[8.5px]" style={{ color: MUTED }}>
                  #{p.n} · {p.c}
                </span>
              </span>
              <div className="relative h-[22px]">
                {p.base !== undefined && (
                  <span
                    className="absolute top-[13px] h-[5px] rounded-full border border-dashed"
                    style={{ left: pct(p.a), width: pct(p.base - p.a), borderColor: MUTED2 }}
                    title="Baseline"
                  />
                )}
                <span className="absolute top-[2px] h-[10px] overflow-hidden rounded-full" style={{ left: pct(p.a), width: pct(p.b - p.a), background: p.tone === "red" ? "#F7D5CF" : "#D7EEDF" }}>
                  <span className="block h-full rounded-full" style={{ width: `${p.pct}%`, background: p.tone === "red" ? "#D8563F" : APP_GREEN }} />
                </span>
              </div>
            </div>
          ))}
          <div className="relative grid grid-cols-[150px_1fr]">
            <span />
            <div className="relative h-0">
              {/* Today, Nov 4, through every row. */}
              <span className="absolute bottom-0 w-[1.5px]" style={{ left: pct(34), height: 132, background: RED }} />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-3 text-[8.5px]" style={{ color: MUTED }}>
            <span className="flex items-center gap-1">
              <span className="h-[5px] w-[14px] rounded-full" style={{ background: APP_GREEN }} />
              Done so far
            </span>
            <span className="flex items-center gap-1">
              <span className="h-[5px] w-[14px] rounded-full border border-dashed" style={{ borderColor: MUTED2 }} />
              Baseline
            </span>
            <span className="flex items-center gap-1">
              <span className="h-[8px] w-[1.5px]" style={{ background: RED }} />
              Today
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Invoices
const READY = [
  { n: "55", t: "Deck repair and stain", c: "Noah Bennett", p: "2210 Quarry Ridge Rd, Austin", v: 2180 },
  { n: "57", t: "Dryer vent cleaning", c: "Hannah Reyes", p: "31 Mesa Verde Ct, Kyle", v: 164 },
];
const INVOICES = [
  { n: "INV-0042", c: "Samuel Ortiz", t: "Fence repair", is: "Oct 21, 2026", due: "Oct 31, 2026", s: "Past due", tone: "red" as Tone, v: 1150, bal: 1150 },
  { n: "INV-0041", c: "Maya Lindqvist", t: "Ceiling fan install", is: "Oct 19, 2026", due: "Oct 19, 2026", s: "Paid", tone: "green" as Tone, v: 378.88, bal: 0 },
  { n: "INV-0040", c: "Grace Okafor", t: "Gutter guards", is: "Oct 16, 2026", due: "Nov 15, 2026", s: "Awaiting payment", tone: "blue" as Tone, v: 1001.31, bal: 1001.31 },
  { n: "INV-0039", c: "Hannah Reyes", t: "Gutter cleaning", is: "Oct 14, 2026", due: "Oct 28, 2026", s: "Paid", tone: "green" as Tone, v: 189.44, bal: 0 },
];

function Invoices({ selected, invoiced }: { selected: boolean; invoiced: boolean }) {
  const drafts = READY.map((r, i) => ({ n: `INV-00${43 + i}`, c: r.c, t: r.t, is: "Draft", due: "—", s: "Draft", tone: "grey" as Tone, v: r.v, bal: r.v }));
  const rows = invoiced ? [...drafts, ...INVOICES.slice(0, 3)] : INVOICES;
  return (
    <div className="px-5 pt-3">
      <PageHead
        icon={Receipt}
        c={C_INV}
        title="Invoices"
        right={
          <>
            <Btn>
              <CardIcon className="h-[10px] w-[10px]" />
              Collect Payment
            </Btn>
            <Btn green>
              <Plus className="h-[10px] w-[10px]" />
              New Invoice
            </Btn>
          </>
        }
      />
      <div className="mt-2.5 grid grid-cols-4 gap-2">
        <Overview
          icon={Receipt}
          c={C_INV}
          rows={[
            ["Draft", MUTED2, invoiced ? 2 : 0],
            ["Awaiting payment", "#2F8FD8", 1],
            ["Part paid", "#7A4EDB", 0],
            ["Past due", RED, 1],
          ]}
        />
        <Stat icon={Dollar} c={C_INV} l="Receivable" sub="Open invoices" big="$2.2K" foot="$1.2K past due" footColor={RED} />
        <Stat icon={Mail} c={C_INV} l="Issued" sub="Past 30 days" big="15" foot="$9.4K" />
        <Stat icon={Check} c={C_INV} l="Paid in full" sub="Past 30 days" big="7" foot="$2.8K" />
      </div>

      <Card className="mt-2.5 overflow-hidden" style={{ borderColor: "#C9DAF1", background: "#F5F8FD" }}>
        <div className="flex items-center gap-2 px-3 py-2">
          <Tile icon={Receipt} c={C_INV} size={18} />
          <span className="min-w-0 flex-1">
            <span className="block text-[10.5px] font-bold">Requires invoicing</span>
            <span className="block truncate text-[9px]" style={{ color: "#4A4740" }}>
              {invoiced ? "No closed jobs waiting on an invoice." : "2 closed jobs waiting on an invoice. Select several to invoice them in one go, one draft per client."}
            </span>
          </span>
          {!invoiced && (
            <Btn green ph="create-invoice" style={selected ? undefined : { background: "#9ED3B3", borderColor: "#9ED3B3" }}>
              <Plus className="h-[10px] w-[10px]" />
              Create Invoice
            </Btn>
          )}
        </div>
        {!invoiced && (
          <>
            <div className="flex items-center gap-2 border-t px-3 py-[5px] text-[9px]" style={{ borderColor: "#DCE6F4", color: "#4A4740" }}>
              <Box2 on={selected} ph="select-all" />
              Select all
            </div>
            {READY.map((r) => (
              <div key={r.n} className="flex items-center gap-2 border-t bg-white px-3 py-[5px]" style={{ borderColor: "#DCE6F4" }}>
                <Box2 on={selected} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-semibold">
                    #{r.n} {r.t}
                  </span>
                  <span className="block truncate text-[8.5px]" style={{ color: MUTED }}>
                    {r.c} · {r.p}
                  </span>
                </span>
                <span className="text-[10px] font-semibold tabular-nums">{money(r.v)}</span>
              </div>
            ))}
          </>
        )}
      </Card>

      <Card className="mt-2">
        <div className="grid grid-cols-[1fr_1.4fr_0.9fr_1fr_0.8fr_0.8fr] gap-2 border-b px-3 py-1.5" style={{ borderColor: HAIR }}>
          {["Client", "Invoice", "Issued", "Status", "Total", "Balance"].map((h, i) => (
            <Th key={h} className={i >= 4 ? "text-right" : ""}>
              {h}
            </Th>
          ))}
        </div>
        {rows.map((r) => (
          <div key={r.n} className="grid grid-cols-[1fr_1.4fr_0.9fr_1fr_0.8fr_0.8fr] items-center gap-2 border-b px-3 py-[5px] last:border-b-0" style={{ borderColor: HAIR }}>
            <span className="truncate text-[10px] font-semibold">{r.c}</span>
            <span className="min-w-0">
              <span className="block text-[9.5px] font-semibold">{r.n}</span>
              <span className="block truncate text-[8.5px]" style={{ color: MUTED }}>
                {r.t}
              </span>
            </span>
            <span className="text-[9.5px] tabular-nums">{r.is}</span>
            <span>
              <Pill tone={r.tone}>{r.s}</Pill>
            </span>
            <span className="text-right text-[9.5px] tabular-nums">{money(r.v)}</span>
            <span className="text-right text-[9.5px] tabular-nums">{money(r.bal)}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

function Box2({ on, ph }: { on: boolean; ph?: string }) {
  return (
    <span
      data-ch={ph}
      className="grid h-[12px] w-[12px] flex-none place-items-center rounded-full border transition-colors duration-200"
      style={on ? { background: APP_GREEN, borderColor: APP_GREEN, color: "#fff" } : { borderColor: "#B9B4AA", background: "#fff" }}
    >
      {on && <Check className="h-[8px] w-[8px]" />}
    </span>
  );
}

// ---------------------------------------------------------------- Insights
// Quote conversion rate by week, Sep 28 to Nov 2.
const RATE = [58, 64, 71, 55, 62, 68];

function Insights() {
  const W = 840;
  const H = 150;
  const x = (i: number) => 30 + (i / (RATE.length - 1)) * (W - 44);
  const y = (v: number) => 8 + (1 - v / 100) * (H - 24);
  const path = RATE.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  return (
    <div className="px-5 pt-3">
      <div className="flex items-center">
        <span className="text-[18px] font-bold tracking-tight">Insights</span>
        <span className="ml-auto flex items-center gap-1.5 rounded-[7px] border bg-white px-2.5 py-[4px] text-[9.5px]" style={{ borderColor: HAIR2 }}>
          <Cal className="h-[10px] w-[10px]" />
          Last 30 days
          <Chevron className="h-[8px] w-[8px]" />
        </span>
      </div>
      <div className="mt-2 grid grid-cols-5 gap-2">
        {[
          { l: "New leads", v: "6", icon: Users, c: MUTED },
          { l: "New requests", v: "15", icon: Tray, c: C_REQ },
          { l: "Converted quotes", v: "13", icon: Doc, c: C_QUOTE },
          { l: "New one-off jobs", v: "21", icon: Briefcase, c: C_JOB },
          { l: "New recurring jobs", v: "2", icon: Repeat, c: C_JOB },
        ].map((t) => (
          <Card key={t.l} className="px-2.5 py-1.5">
            <div className="flex items-center gap-1.5">
              <Tile icon={t.icon} c={t.c} size={15} />
              <span className="truncate text-[9px] font-semibold">{t.l}</span>
            </div>
            <div className="text-center text-[18px] font-extrabold tabular-nums">{t.v}</div>
          </Card>
        ))}
      </div>

      <div className="mt-2.5 flex items-center gap-1.5 text-[11.5px] font-bold">
        <Tile icon={Trend} c={INK} size={18} />
        Lead conversion
      </div>
      <div className="mt-1.5 grid grid-cols-3 gap-2">
        <Card className="px-3 py-2">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold">
            <Clock className="h-[11px] w-[11px]" />
            Conversion time
          </div>
          <div className="mt-1 text-[8.5px]" style={{ color: MUTED }}>
            Lead to job
          </div>
          <div className="text-[15px] font-extrabold">6 days</div>
          <div className="mt-0.5 text-[8.5px]" style={{ color: MUTED }}>
            Quote sent to approved
          </div>
          <div className="text-[15px] font-extrabold">1.5 days</div>
        </Card>
        <Card className="px-3 py-2">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold">
            <Funnel className="h-[11px] w-[11px]" />
            Lead funnel
            <span className="ml-auto text-[8.5px] font-normal" style={{ color: MUTED }}>
              CSV
            </span>
          </div>
          {[
            ["New clients", 20],
            ["Clients with a sent quote", 14],
            ["Clients with any job", 11],
          ].map(([l, n]) => (
            <div key={l as string} className="mt-1.5">
              <div className="flex text-[9px]">
                {l as string}
                <span className="ml-auto font-semibold tabular-nums">{n as number}</span>
              </div>
              <div className="mt-[2px] h-[4px] overflow-hidden rounded-full" style={{ background: "#EEECE8" }}>
                <div className="h-full rounded-full" style={{ width: `${((n as number) / 20) * 100}%`, background: ORANGE }} />
              </div>
            </div>
          ))}
        </Card>
        <Card className="px-3 py-2">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold">
            <Doc className="h-[11px] w-[11px]" style={{ color: C_QUOTE }} />
            Quote value
          </div>
          {[
            ["Sent", "$48,420.50"],
            ["Approved", "$31,906.10"],
          ].map(([l, val]) => (
            <div key={l} className="mt-1.5 flex text-[9.5px]">
              <span style={{ color: MUTED }}>{l}</span>
              <span className="ml-auto font-bold tabular-nums">{val}</span>
            </div>
          ))}
        </Card>
      </div>

      <Card className="mt-2 px-3 pb-1 pt-2">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold">
          <Doc className="h-[11px] w-[11px]" style={{ color: C_QUOTE }} />
          Quote conversion rate
          <span className="ml-auto text-[8.5px] font-normal" style={{ color: MUTED }}>
            CSV
          </span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" style={{ height: 146 }}>
          {[0, 25, 50, 75, 100].map((t) => (
            <g key={t}>
              <line x1={30} x2={W - 14} y1={y(t)} y2={y(t)} stroke="#EEECE8" />
              <text x={24} y={y(t) + 3} textAnchor="end" fontSize="7.5" fill={MUTED}>
                {t}%
              </text>
            </g>
          ))}
          <path d={path} fill="none" stroke={C_QUOTE} strokeWidth="1.8" strokeLinejoin="round" />
          {["Sep 28", "Oct 5", "Oct 12", "Oct 19", "Oct 26", "Nov 2"].map((d, i) => (
            <text key={d} x={x(i)} y={H - 2} textAnchor="middle" fontSize="7.5" fill={MUTED}>
              {d}
            </text>
          ))}
        </svg>
      </Card>
    </div>
  );
}
