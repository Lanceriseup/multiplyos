"use client";

// Animated hero for the Events HQ feature page.
//
// Events HQ is a whole department, so the tour walks the module the way a
// manager would on a normal morning: across every tab at the top, then into one
// event and across its record.
//
//   the module      Events → Calendar → Overview Calendar → Registrations
//                   (a new one lands) → Coaches (a volunteer gets approved) →
//                   Templates → back to Events
//   one event       Leaders Summit 2026 opens. Registrations climb toward
//                   capacity, the stage's open tasks get ticked off and the
//                   stage bar moves on. Then its Details, its Agenda (texted
//                   and emailed to the coaches from View / Share agenda), its
//                   Client Portal (a hotel gets booked) and its Inventory.
//
// Every screen is traced from the client's October 2026 screenshots: the
// sidebar's eight pages, the six top tabs, the event list's columns and
// filters, the year calendar, the Overview Calendar's planning / staffing /
// coaches grid, the registrations list, the coaches and volunteers per event,
// the template cards, the record's stat cards, stage bar and nine tabs, the
// Details fields, the multi-day agenda with its coloured groups and notes and
// cues, the Client Portal attendee table with hotel and welcome box tracking,
// and the Inventory tab's attendee shirt sizes and per-person items.
//
// Same architecture as the other hero tours: the screen is React state, only
// the cursor and the ripple are animated imperatively through the Web
// Animations API, and the sequence is generation-token guarded so a re-render
// or unmount cancels the in-flight tour rather than leaving orphaned timers.
//
// Everything on screen is fictional. The client's screenshots carry real event
// names, real attendees with their phone numbers and emails, real coaches and
// volunteers, and real forms; none of that is on the public site. The events
// here belong to the same Ridgeline cast the other feature pages use, phone
// numbers are 555 numbers and emails are example.com.
import { Fragment, useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

const MIN_W = 980;
const STAGE_H = 520;
const SIDEBAR_W = 178;
const EASE = "cubic-bezier(0.22,1,0.36,1)";

const INK = "#1B1A17";
const HAIR = "#ECEAE6";
const HAIR2 = "#E3E0DA";
const MUTED = "#8A867E";
const MUTED2 = "#A9A49B";
const ORANGE = "#EA7B1B";
const RED = "#C2412D"; // Events HQ's own colour, from the navbar
const GREEN = "#1FA36A";
const NAVY = "#0F1B2D";
const AMBER = "#C9832B";

// Event types, the legend the calendar and the overview paint with.
const TYPE = {
  Summit: "#2F6FE4",
  Retreat: "#0F9488",
  Bootcamp: "#E2701F",
  Intensive: "#7A4EDB",
  Gala: "#C2398F",
  Kickoff: "#5E8A1E",
} as const;

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

const Cal = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="4" y="5.2" width="16" height="14.6" rx="2.4" />
    <path d="M4 9.6h16M8.3 3.4v3.4M15.7 3.4v3.4" />
  </svg>
);
/** Events HQ's own mark in the app: a calendar with a grid of days. */
const CalDays = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="3.8" y="5" width="16.4" height="15" rx="2.4" />
    <path d="M3.8 9.6h16.4M8.2 3.2v3.4M15.8 3.2v3.4" />
    <path d="M8 13.2h.01M12 13.2h.01M16 13.2h.01M8 16.6h.01M12 16.6h.01M16 16.6h.01" strokeWidth={2.4} />
  </svg>
);
const Grid = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="4" y="4" width="16" height="16" rx="2.4" />
    <path d="M4 10h16M10 4v16" />
  </svg>
);
const Ticket = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M3.6 7.6A1.6 1.6 0 0 1 5.2 6h13.6a1.6 1.6 0 0 1 1.6 1.6v2.1a2.3 2.3 0 0 0 0 4.6v2.1a1.6 1.6 0 0 1-1.6 1.6H5.2a1.6 1.6 0 0 1-1.6-1.6v-2.1a2.3 2.3 0 0 0 0-4.6z" />
  </svg>
);
const Cap = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M2.8 9.4L12 5l9.2 4.4L12 13.8z" />
    <path d="M6.6 11.4v4.2c0 1.4 2.4 2.6 5.4 2.6s5.4-1.2 5.4-2.6v-4.2" />
  </svg>
);
const List = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M8.6 6.4h11M8.6 12h11M8.6 17.6h11" />
    <path d="M4.4 6.4h.01M4.4 12h.01M4.4 17.6h.01" strokeWidth={2.6} />
  </svg>
);
const Portal = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="3.4" y="4.4" width="13" height="10.4" rx="1.8" />
    <path d="M7.4 18.8h5" />
    <rect x="15.4" y="10.6" width="5.2" height="8.6" rx="1.2" />
  </svg>
);
const Gear = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3.4v2.2M12 18.4v2.2M3.4 12h2.2M18.4 12h2.2M5.9 5.9l1.6 1.6M16.5 16.5l1.6 1.6M5.9 18.1l1.6-1.6M16.5 7.5l1.6-1.6" />
  </svg>
);
const Dash = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="4" y="4" width="7" height="7" rx="1.6" />
    <rect x="13" y="4" width="7" height="7" rx="1.6" />
    <rect x="4" y="13" width="7" height="7" rx="1.6" />
    <rect x="13" y="13" width="7" height="7" rx="1.6" />
  </svg>
);
const Target = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="12" cy="12" r="7.7" />
    <circle cx="12" cy="12" r="3.9" />
  </svg>
);
const People = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="9" cy="8.2" r="3.2" />
    <path d="M3.4 19.2c.6-3.2 2.9-5.1 5.6-5.1s5 1.9 5.6 5.1" />
    <path d="M15.4 5.3a3 3 0 0 1 0 5.7M17.3 14.4c1.8.6 3 2.2 3.3 4.8" />
  </svg>
);
const Box = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 3.2l7.8 4.3v9L12 20.8l-7.8-4.3v-9z" />
    <path d="M4.4 7.6L12 11.8l7.6-4.2M12 11.8v8.8" />
  </svg>
);
const Back = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);
const Pin = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 20.6s-6.4-5.6-6.4-10.6a6.4 6.4 0 0 1 12.8 0c0 5-6.4 10.6-6.4 10.6z" />
    <circle cx="12" cy="10" r="2.2" />
  </svg>
);
const Check = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2.6}>
    <path d="M5 12.4l4.4 4.4L19 7.4" />
  </svg>
);
const Pencil = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M3.6 20.4l4.4-1.2 10.6-10.6a2 2 0 0 0-2.8-2.8L5.2 16.4z" />
  </svg>
);
const Chevron = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2.2}>
    <path d="M6 9.5l6 6 6-6" />
  </svg>
);
const External = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M13.4 4.6h6v6M19.4 4.6l-8.2 8.2" />
    <path d="M17.4 13.8v4.4a1.6 1.6 0 0 1-1.6 1.6H5.8a1.6 1.6 0 0 1-1.6-1.6V8.2a1.6 1.6 0 0 1 1.6-1.6h4.4" />
  </svg>
);
const ShareNodes = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="17.6" cy="6" r="2.6" />
    <circle cx="6.4" cy="12" r="2.6" />
    <circle cx="17.6" cy="18" r="2.6" />
    <path d="M8.8 10.8l6.4-3.4M8.8 13.2l6.4 3.4" />
  </svg>
);
/** Volunteers, as the product draws them: a hand holding a heart. */
const HandHeart = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M3.4 14.4h2.8l3.4 1.4h3.2a1.4 1.4 0 0 1 0 2.8H9.6M12.8 18.6l5.4-2.2a1.5 1.5 0 0 1 1.2 2.7l-6.4 3.1H8.2l-4.8-1.6" />
    <path d="M15.4 11.6s-3.8-2.2-3.8-4.8a2 2 0 0 1 3.8-.9 2 2 0 0 1 3.8.9c0 2.6-3.8 4.8-3.8 4.8z" />
  </svg>
);
const Shirt = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M8.6 3.8L4 6.4l1.6 4 2.2-.8V20h8.4V9.6l2.2.8 1.6-4-4.6-2.6a3.4 3.4 0 0 1-6.8 0z" />
  </svg>
);
const Templates = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="4" y="4" width="16" height="7" rx="1.6" />
    <rect x="4" y="13" width="7" height="7" rx="1.6" />
    <rect x="13" y="13" width="7" height="7" rx="1.6" />
  </svg>
);
const Warn = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 4l9 15.6H3z" />
    <path d="M12 10v4M12 17h.01" />
  </svg>
);

// ---------------------------------------------------------------- data
// The Events HQ sidebar, in the product's order.
const SUBNAV = [
  { l: "Events", icon: Cal },
  { l: "Calendar", icon: Cal },
  { l: "Overview Calendar", icon: Grid },
  { l: "Registrations", icon: Ticket },
  { l: "Coaches", icon: Cap },
  { l: "Agenda Library", icon: List },
  { l: "Client Portal", icon: Portal },
  { l: "Settings", icon: Gear },
];

type Screen = "events" | "calendar" | "overview" | "registrations" | "coaches" | "templates" | "detail";
const TOP_TABS: { k: Exclude<Screen, "detail">; l: string }[] = [
  { k: "events", l: "Events" },
  { k: "calendar", l: "Calendar" },
  { k: "overview", l: "Overview Calendar" },
  { k: "registrations", l: "Registrations" },
  { k: "coaches", l: "Coaches" },
  { k: "templates", l: "Templates" },
];
/** Which sidebar page lights up for each screen. Templates is a tab, not a page. */
const NAV_FOR: Record<Screen, string> = {
  events: "Events",
  calendar: "Calendar",
  overview: "Overview Calendar",
  registrations: "Registrations",
  coaches: "Coaches",
  templates: "Events",
  detail: "Events",
};

const EVENTS = [
  { n: "Leaders Summit 2026", at: "Hilltop Conference Center", m: "Dana Whitfield", i: "DW", start: "Oct 22, 2026", stage: "2 Weeks out" },
  { n: "Founders Retreat", at: "Lakeside Lodge", m: "Marcus Hale", i: "MH", start: "Oct 29, 2026", stage: "2 Weeks out" },
  { n: "Sales Bootcamp", at: "Ridgeline HQ", m: "Priya Nair", i: "PN", start: "Nov 5, 2026", stage: "1 Month out" },
  { n: "Leadership Intensive", at: "Austin, TX", m: "Jordan Rivera", i: "JR", start: "Nov 12, 2026", stage: "1 Month out" },
  { n: "Winter Gala", at: "The Grand Hall", m: "Theo Barnes", i: "TB", start: "Dec 5, 2026", stage: "2 Months out" },
  { n: "Q1 Kickoff", at: "Ridgeline HQ", m: "Avery Rowe", i: "AR", start: "Jan 8, 2027", stage: "3 Months out" },
];

// Fourth quarter 2026 and January. Months are 0-based for Date.
const CAL: { y: number; m: number; days: number[]; c: string }[] = [
  { y: 2026, m: 9, days: [15, 16], c: "#16130F" }, // protected: summit prep
  { y: 2026, m: 9, days: [22, 23, 24], c: TYPE.Summit },
  { y: 2026, m: 9, days: [29, 30, 31], c: TYPE.Retreat },
  { y: 2026, m: 10, days: [5, 6], c: TYPE.Bootcamp },
  { y: 2026, m: 10, days: [12, 13, 14], c: TYPE.Intensive },
  { y: 2026, m: 10, days: [19, 20], c: TYPE.Bootcamp },
  { y: 2026, m: 11, days: [5], c: TYPE.Gala },
  { y: 2026, m: 11, days: [10, 11, 12], c: TYPE.Retreat },
  { y: 2026, m: 11, days: [24, 25], c: "#A3A3A3" },
  { y: 2027, m: 0, days: [8], c: TYPE.Kickoff },
  { y: 2027, m: 0, days: [20, 21, 22], c: TYPE.Summit },
];
const CAL_MONTHS = [
  { y: 2026, m: 9, l: "October 2026" },
  { y: 2026, m: 10, l: "November 2026" },
  { y: 2026, m: 11, l: "December 2026" },
  { y: 2027, m: 0, l: "January 2027" },
];

const OVERVIEW = [
  { n: "Leaders Summit 2026", d: "Oct 22 – 24", c: TYPE.Summit, ratio: "45.7", coaches: "3", enrolled: "137", vRatio: "34.3", vols: "4", head: "Dana Whitfield" },
  { n: "Founders Retreat", d: "Oct 29 – 31", c: TYPE.Retreat, ratio: "15.5", coaches: "2", enrolled: "31", vRatio: "6.2", vols: "5", head: "Marcus Hale" },
  { n: "Sales Bootcamp", d: "Nov 5 – 6", c: TYPE.Bootcamp, ratio: "13.7", coaches: "3", enrolled: "41", vRatio: "5.9", vols: "7", head: "Priya Nair" },
  { n: "Leadership Intensive", d: "Nov 12 – 14", c: TYPE.Intensive, ratio: "", coaches: "", enrolled: "15", vRatio: "", vols: "", head: "Jordan Rivera" },
];

const REGS = [
  { n: "Elena Cruz", e: "Leaders Summit 2026", ph: "(555) 014-2231", em: "elena.cruz@example.com" },
  { n: "Noah Bennett", e: "Leaders Summit 2026", ph: "(555) 017-8820", em: "noah.b@example.com" },
  { n: "Grace Okafor", e: "Founders Retreat", ph: "(555) 012-4471", em: "grace.okafor@example.com" },
  { n: "Samuel Ortiz", e: "Sales Bootcamp", ph: "(555) 019-3305", em: "sam.ortiz@example.com" },
  { n: "Maya Lindqvist", e: "Leadership Intensive", ph: "(555) 016-9042", em: "maya.l@example.com" },
  { n: "Owen Park", e: "Winter Gala", ph: "(555) 011-6658", em: "owen.park@example.com" },
];
const NEW_REG = { n: "Hannah Reyes", e: "Leaders Summit 2026", ph: "(555) 018-2764", em: "hannah.reyes@example.com" };

const TEMPLATES = [
  { n: "Summit Template", s: "3 Day Event", meta: "8 stages · 96 tasks · 40 inventory" },
  { n: "Retreat Template", s: "3 Day Event", meta: "7 stages · 84 tasks · 52 inventory" },
  { n: "Bootcamp Template", s: "2 Day Event", meta: "6 stages · 61 tasks · 28 inventory" },
  { n: "Intensive Template", s: "3 Day Event", meta: "7 stages · 72 tasks · 34 inventory" },
  { n: "Gala Template", s: "Evening", meta: "5 stages · 44 tasks · 18 inventory · 2 files" },
  { n: "Kickoff Template", s: "1 Day Event", meta: "4 stages · 30 tasks" },
];

const STAGES = ["6 Months out", "4 Months out", "3 Months out", "2 Months out", "1 Month out", "2 Weeks out", "1 Week out", "Week of"];
/** The stage the event is in when the record opens. */
const STAGE_NOW = 5;

const TASKS = [
  { t: "Confirm hotel block and catering count", who: "Dana", i: "DW", due: "Oct 9", status: "Not started" },
  { t: "Print name badges and handouts", who: "Priya", i: "PN", due: "Oct 10", status: "In progress" },
  { t: "Send arrival details to attendees", who: "Marcus", i: "MH", due: "Oct 12", status: "Not started" },
];

// The agenda's rows: a coloured group header, then segments under it.
type AgendaRow = { group: string; color: string } | { at: string; len: string; t: string; who: string; cue: string };
const AGENDA: AgendaRow[] = [
  { group: "Arrival", color: "#FDE68A" },
  { at: "8:00 AM", len: "60m", t: "Registration and coffee", who: "Priya", cue: "Badges at desk 2" },
  { at: "9:00 AM", len: "75m", t: "Welcome and vision", who: "Dana", cue: "Walk-on music, lights down" },
  { group: "Breakouts", color: "#E9D5FF" },
  { at: "10:30 AM", len: "90m", t: "Breakout sessions", who: "Coaches", cue: "Rooms A to C" },
  { at: "12:30 PM", len: "60m", t: "Lunch", who: "Volunteers", cue: "Terrace, dietary list" },
];
const AGENDA_DAYS = [
  { l: "Volunteer assignments", d: "Wed, Oct 21" },
  { l: "Set-up day", d: "Wed, Oct 21" },
  { l: "Day 1", d: "Thu, Oct 22" },
  { l: "Day 2", d: "Fri, Oct 23" },
  { l: "Day 3", d: "Sat, Oct 24" },
];

const ATTENDEES = [
  { n: "Elena Cruz", portal: true, forms: "2/2", shirt: "Medium", hotel: "Booked", carrier: "UPS", track: "1Z 84A 220" },
  { n: "Noah Bennett", portal: true, forms: "1/2", shirt: "Large", hotel: "Not booked", carrier: "", track: "" },
  { n: "Grace Okafor", portal: true, forms: "2/2", shirt: "Small", hotel: "Booked", carrier: "USPS", track: "9400 1118" },
  { n: "Samuel Ortiz", portal: false, forms: "0/2", shirt: "XL", hotel: "Not booked", carrier: "", track: "" },
  { n: "Maya Lindqvist", portal: true, forms: "2/2", shirt: "Small", hotel: "Booked", carrier: "FedEx", track: "7749 2210" },
];

const SIZES = [
  ["S", 18],
  ["M", 41],
  ["L", 36],
  ["XL", 22],
  ["2XL", 9],
] as const;
const ITEMS = [
  { n: "Agenda for volunteers and staff", mode: "Fixed", qty: "35" },
  { n: "Name badges", mode: "Per person", qty: "1 /person = 151" },
  { n: "2×4 labels", mode: "Per person", qty: "2 /person = 302", short: "280 available · short 22" },
];

const CAPACITY = 140;
const REGS_FROM = 128;
const REGS_TO = 137;

// ---------------------------------------------------------------- scene
type RecordTab = "tasks" | "details" | "agenda" | "portal" | "inventory";
type Scene = {
  dim: boolean;
  screen: Screen;
  /** The first row of the event list is under the pointer. */
  hoverRow: boolean;
  /** A new registration has landed at the top of the list. */
  newReg: boolean;
  /** The pending volunteer on the Coaches tab has been approved. */
  approved: boolean;
  regs: number;
  /** How many of the stage's three open tasks are ticked off. */
  done: number;
  /** Index of the current stage in STAGES. */
  stage: number;
  rtab: RecordTab;
  /** How many agenda rows have landed. */
  agendaRows: number;
  shareOpen: boolean;
  /** The second attendee's hotel flips to Booked on the Client Portal tab. */
  hotelBooked: boolean;
  toast: string | null;
};
const BLANK: Scene = {
  dim: false,
  screen: "events",
  hoverRow: false,
  newReg: false,
  approved: false,
  regs: REGS_FROM,
  done: 0,
  stage: STAGE_NOW,
  rtab: "tasks",
  agendaRows: 0,
  shareOpen: false,
  hotelBooked: false,
  toast: null,
};
// The frame shown under prefers-reduced-motion: the record, with the stage's
// work done and the bar moved on. One shot that still tells the story.
const STILL: Scene = {
  ...BLANK,
  screen: "detail",
  regs: REGS_TO,
  done: TASKS.length,
  stage: STAGE_NOW + 1,
};

export default function EventsHqHeroTour() {
  const hostRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<SVGSVGElement>(null);
  const rippleRef = useRef<HTMLSpanElement>(null);

  const inView = useInView(hostRef, { margin: "-60px" });
  const reduce = useReducedMotion() ?? false;

  // Always BLANK on the first render, even under reduced motion: the server
  // cannot know the visitor's setting, so starting from STILL here would render
  // different text on the client and fail hydration. The tour effect swaps in
  // STILL straight after mount.
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
      const node = stage?.querySelector(`[data-eh="${sel}"]`);
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

    const tap = async (sel: string, dur = 560, fx = 0.5, fy = 0.5) => {
      await glide(pointAt(sel, fx, fy), dur);
      if (!alive()) return false;
      await wait(150);
      if (!alive()) return false;
      await click();
      return alive();
    };

    /** Click a tab and wait for its screen to have been looked at. */
    const visit = async (sel: string, p: Partial<Scene>, hold: number, dur = 560) => {
      if (!(await tap(sel, dur))) return false;
      patch(p);
      await wait(hold);
      return alive();
    };

    (async function loop() {
      while (alive()) {
        setScene(BLANK);
        setCursor(560, 300);
        await fade(1, 260);
        if (!alive()) return;
        await wait(800);

        // ---- the module, tab by tab
        if (!(await visit("top-calendar", { screen: "calendar" }, 1700, 640))) return;
        if (!(await visit("top-overview", { screen: "overview" }, 1900))) return;
        if (!(await visit("top-registrations", { screen: "registrations" }, 600))) return;
        patch({ newReg: true });
        await wait(1500);
        if (!(await visit("top-coaches", { screen: "coaches" }, 700))) return;
        if (!(await tap("approve", 620))) return;
        patch({ approved: true });
        await wait(1100);
        if (!(await visit("top-templates", { screen: "templates" }, 1600, 640))) return;
        if (!(await visit("top-events", { screen: "events" }, 500, 620))) return;

        // ---- one event
        await glide(pointAt("row-0", 0.3, 0.5), 640);
        if (!alive()) return;
        patch({ hoverRow: true });
        await wait(260);
        await click();
        if (!alive()) return;
        patch({ screen: "detail", hoverRow: false });
        await wait(700);

        // registrations land while you watch
        for (let r = REGS_FROM + 1; r <= REGS_TO; r++) {
          if (!alive()) return;
          patch({ regs: r });
          await wait(110);
        }
        await wait(300);

        // the stage's open tasks, ticked off, and the bar moves on
        for (let i = 0; i < TASKS.length; i++) {
          if (!(await tap(`task-${i}`, i === 0 ? 640 : 440))) return;
          patch({ done: i + 1 });
          await wait(300);
        }
        patch({ stage: STAGE_NOW + 1, toast: "2 Weeks out is complete. 1 Week out is up next." });
        await wait(1700);
        patch({ toast: null });

        // the record, tab by tab
        if (!(await visit("tab-details", { rtab: "details" }, 1500, 600))) return;
        if (!(await visit("tab-agenda", { rtab: "agenda" }, 0))) return;
        for (let k = 1; k <= AGENDA.length; k++) {
          if (!alive()) return;
          await wait(100);
          patch({ agendaRows: k });
        }
        await wait(600);
        if (!(await tap("share", 620))) return;
        patch({ shareOpen: true });
        await wait(650);
        if (!(await tap("share-coaches", 500))) return;
        patch({ shareOpen: false, toast: "Agenda texted and emailed to the event's 3 coaches." });
        await wait(1800);
        patch({ toast: null });
        if (!(await visit("tab-portal", { rtab: "portal" }, 600, 640))) return;
        if (!(await tap("hotel-1", 560))) return;
        patch({ hotelBooked: true });
        await wait(1000);
        if (!(await visit("tab-inventory", { rtab: "inventory" }, 2200, 600))) return;

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

  const top = scene.screen !== "detail";

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
            <Sidebar active={NAV_FOR[scene.screen]} />
            <div className="relative min-w-0 flex-1">
              {/* The module's own header and tabs, shared by every top-level screen. */}
              <Fade on={top} from="left">
                <ModuleHeader screen={scene.screen} />
                <div className="relative mt-3" style={{ height: STAGE_H - 132 }}>
                  <Fade on={scene.screen === "events"}>
                    <EventList hover={scene.hoverRow} />
                  </Fade>
                  <Fade on={scene.screen === "calendar"}>
                    <YearCalendar />
                  </Fade>
                  <Fade on={scene.screen === "overview"}>
                    <Overview />
                  </Fade>
                  <Fade on={scene.screen === "registrations"}>
                    <Registrations fresh={scene.newReg} />
                  </Fade>
                  <Fade on={scene.screen === "coaches"}>
                    <Coaches approved={scene.approved} />
                  </Fade>
                  <Fade on={scene.screen === "templates"}>
                    <TemplateCards />
                  </Fade>
                </div>
              </Fade>
              <Fade on={!top} from="right">
                <EventRecord scene={scene} />
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
 * A full-size layer that fades in and out. Out is quick and in waits for it,
 * so two screens are never half-visible on top of each other: a straight
 * crossfade showed the old table ghosting through the new one.
 */
function Fade({ on, from, children }: { on: boolean; from?: "left" | "right"; children: React.ReactNode }) {
  const shift = from === "left" ? "translateX(-14px)" : from === "right" ? "translateX(14px)" : "translateY(6px)";
  return (
    <div
      className="absolute inset-0 ease-out"
      style={{
        opacity: on ? 1 : 0,
        transform: on ? "none" : shift,
        pointerEvents: on ? "auto" : "none",
        transitionProperty: "opacity, transform",
        transitionDuration: on ? "380ms" : "160ms",
        transitionDelay: on ? "150ms" : "0ms",
      }}
    >
      {children}
    </div>
  );
}

function Pill({ children, tone }: { children: React.ReactNode; tone: "green" | "amber" | "grey" | "red" | "navy" }) {
  const t = {
    green: { background: `${GREEN}16`, color: GREEN },
    amber: { background: `${AMBER}1C`, color: AMBER },
    grey: { background: "#EEECE8", color: MUTED },
    red: { background: "#FBE4E1", color: "#B4322A" },
    navy: { background: NAVY, color: "#fff" },
  }[tone];
  return (
    <span className="inline-flex items-center justify-center rounded-full px-2 py-[2px] text-[9px] font-bold" style={t}>
      {children}
    </span>
  );
}

const initials = (n: string) =>
  n
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

// ---------------------------------------------------------------- sidebar
function Sidebar({ active }: { active: string }) {
  const above = [
    { l: "Dashboard", icon: Dash },
    { l: "One Page Plan", icon: Target },
    { l: "Calendars", icon: Cal },
  ];
  const below = [
    { l: "Inventory HQ", icon: Box },
    { l: "People HQ", icon: People },
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
      <div className="mt-0.5 flex items-center gap-2 rounded-[8px] px-2 py-[6px] text-[11px] font-semibold" style={{ background: `${ORANGE}14`, color: ORANGE }}>
        <CalDays className="h-[13px] w-[13px] flex-none" />
        Events HQ
        <Chevron className="ml-auto h-[11px] w-[11px]" />
      </div>
      <div className="ml-3 mt-1 border-l pl-2" style={{ borderColor: HAIR }}>
        {SUBNAV.map((n) => {
          const Ico = n.icon;
          const on = n.l === active;
          return (
            <div
              key={n.l}
              className="flex items-center gap-2 rounded-[7px] px-2 py-[4.5px] text-[10.5px] transition-colors duration-300"
              style={on ? { background: `${ORANGE}10`, color: ORANGE, fontWeight: 600 } : { color: "#5C5852" }}
            >
              <Ico className="h-[12px] w-[12px] flex-none" style={{ color: on ? ORANGE : MUTED2 }} />
              {n.l}
              {on && <span className="ml-auto h-[5px] w-[5px] rounded-full" style={{ background: ORANGE }} />}
            </div>
          );
        })}
      </div>
      <div className="mt-1">
        {below.map((n) => (
          <NavRow key={n.l} {...n} />
        ))}
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

// ---------------------------------------------------------------- the module
function ModuleHeader({ screen }: { screen: Screen }) {
  return (
    <div className="px-6 pt-5">
      <div className="flex items-start">
        <div>
          <div className="text-[19px] font-bold tracking-tight">Events HQ</div>
          <div className="mt-0.5 text-[11px]" style={{ color: MUTED }}>
            24 events · 612 registrations · 9 templates
          </div>
        </div>
        <span className="ml-auto flex items-center gap-1.5 rounded-[8px] border bg-white px-2.5 py-1.5 text-[10.5px] font-semibold" style={{ borderColor: HAIR2 }}>
          <People className="h-[12px] w-[12px]" />
          Sharing
        </span>
      </div>
      <div className="mt-3.5 flex gap-5 border-b text-[11px]" style={{ borderColor: HAIR2 }}>
        {TOP_TABS.map((t) => (
          <span
            key={t.k}
            data-eh={`top-${t.k}`}
            className="-mb-px border-b-2 pb-2 font-semibold transition-colors duration-300"
            style={screen === t.k ? { borderColor: NAVY, color: INK } : { borderColor: "transparent", color: MUTED }}
          >
            {t.l}
            {t.k === "templates" && (
              <span className="ml-1 rounded-full px-1.5 text-[9px]" style={{ background: "#EEECE8", color: MUTED }}>
                9
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

function EventList({ hover }: { hover: boolean }) {
  return (
    <div className="px-6">
      <div className="inline-flex gap-1 rounded-[10px] border bg-white p-1 text-[10px]" style={{ borderColor: HAIR }}>
        {[
          ["All events", 24],
          ["Upcoming events", 18],
          ["Completed events", 6],
          ["Events where I am tasked", 3],
        ].map(([l, n], i) => (
          <span
            key={l}
            className="flex items-center gap-1.5 rounded-[7px] px-2.5 py-1 font-semibold"
            style={i === 1 ? { background: "#F3F1EC", color: INK } : { color: MUTED }}
          >
            {l}
            <span className="rounded-full px-1.5 text-[9px]" style={{ background: "#EEECE8", color: MUTED }}>
              {n}
            </span>
          </span>
        ))}
      </div>

      <div className="mt-3 overflow-hidden rounded-[12px] border bg-white" style={{ borderColor: HAIR }}>
        <div
          className="grid border-b px-4 py-2 text-[9px] font-bold uppercase tracking-[0.1em]"
          style={{ gridTemplateColumns: "1.7fr 1fr 0.9fr 0.8fr", borderColor: HAIR, color: MUTED2 }}
        >
          <span>Event name</span>
          <span>Event manager</span>
          <span>Start</span>
          <span>Current stage</span>
        </div>
        {EVENTS.map((e, i) => (
          <div
            key={e.n}
            data-eh={`row-${i}`}
            className="grid items-center border-b px-4 py-[8px] transition-colors duration-200 last:border-b-0"
            style={{
              gridTemplateColumns: "1.7fr 1fr 0.9fr 0.8fr",
              borderColor: HAIR,
              background: i === 0 && hover ? `${RED}0D` : "#fff",
            }}
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span
                className="grid h-[24px] w-[24px] flex-none place-items-center rounded-full text-[8.5px] font-bold"
                style={{ background: `${ORANGE}18`, color: ORANGE }}
              >
                {initials(e.n)}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[11.5px] font-semibold">{e.n}</span>
                <span className="block truncate text-[9.5px]" style={{ color: MUTED }}>
                  {e.at}
                </span>
              </span>
            </span>
            <span className="flex items-center gap-1.5 text-[10.5px]">
              <span className="grid h-[18px] w-[18px] place-items-center rounded-full text-[7.5px] font-bold" style={{ background: "#EEECE8", color: "#5C5852" }}>
                {e.i}
              </span>
              {e.m}
            </span>
            <span className="text-[10.5px] tabular-nums">{e.start}</span>
            <span className="text-[10.5px]">{e.stage}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniMonth({ y, m, l }: { y: number; m: number; l: string }) {
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  return (
    <div className="rounded-[10px] border bg-white p-2" style={{ borderColor: HAIR }}>
      <div className="mb-1.5 rounded-[6px] py-[3px] text-center text-[9.5px] font-bold text-white" style={{ background: NAVY }}>
        {l}
      </div>
      <div className="grid grid-cols-7 gap-[2px] text-center">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i} className="text-[7.5px] font-bold" style={{ color: MUTED2 }}>
            {d}
          </span>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <span key={i} />;
          const e = CAL.find((c) => c.y === y && c.m === m && c.days.includes(d));
          return (
            <span
              key={i}
              className="grid h-[19px] place-items-center rounded-[3px] text-[8.5px] tabular-nums"
              style={e ? { background: e.c, color: "#fff", fontWeight: 700 } : { color: "#5C5852" }}
            >
              {d}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function YearCalendar() {
  return (
    <div className="px-6">
      <div className="flex items-center gap-2">
        <span className="rounded-[7px] border bg-white px-2 py-[3px] text-[10px]" style={{ borderColor: HAIR2 }}>
          ‹
        </span>
        <span className="rounded-[7px] border bg-white px-2 py-[3px] text-[10px]" style={{ borderColor: HAIR2 }}>
          ›
        </span>
        <span className="ml-1 text-[14px] font-bold">2026</span>
        <span className="ml-3 text-[10.5px]" style={{ color: MUTED }}>
          Today
        </span>
        {["Event type", "Manager", "Status"].map((f) => (
          <span key={f} className="ml-1 flex items-center gap-1 rounded-[7px] border bg-white px-2 py-[3px] text-[10px]" style={{ borderColor: HAIR2 }}>
            {f}
            <Chevron className="h-[9px] w-[9px]" />
          </span>
        ))}
        <span className="ml-auto flex rounded-[7px] border bg-white p-[2px] text-[9.5px] font-semibold" style={{ borderColor: HAIR2 }}>
          {["Year", "Month", "List"].map((v, i) => (
            <span key={v} className="rounded-[5px] px-1.5 py-[2px]" style={i === 0 ? { background: NAVY, color: "#fff" } : { color: MUTED }}>
              {v}
            </span>
          ))}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2.5">
        {CAL_MONTHS.map((mo) => (
          <MiniMonth key={mo.l} {...mo} />
        ))}
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[9.5px]" style={{ color: MUTED }}>
        {Object.entries(TYPE).map(([k, c]) => (
          <span key={k} className="flex items-center gap-1">
            <span className="h-[7px] w-[7px] rounded-[2px]" style={{ background: c }} />
            {k}
          </span>
        ))}
        <span className="ml-auto flex items-center gap-1">
          <span className="h-[7px] w-[7px] rounded-full" style={{ background: "#16130F" }} />
          Protected day
        </span>
      </div>
      {/* The List view's dated rows, the next three, so the year view reads as
          events and not only as colour. */}
      <div className="mt-3 grid grid-cols-3 gap-2.5">
        {[
          { n: "Leaders Summit 2026", d: "Oct 22 – 24", c: TYPE.Summit, at: "Hilltop Conference Center" },
          { n: "Founders Retreat", d: "Oct 29 – 31", c: TYPE.Retreat, at: "Lakeside Lodge" },
          { n: "Sales Bootcamp", d: "Nov 5 – 6", c: TYPE.Bootcamp, at: "Ridgeline HQ" },
        ].map((e) => (
          <div key={e.n} className="flex items-center gap-2.5 rounded-[10px] border bg-white px-3 py-2" style={{ borderColor: HAIR }}>
            <span className="h-[28px] w-[4px] flex-none rounded-full" style={{ background: e.c }} />
            <span className="min-w-0">
              <span className="block truncate text-[11px] font-semibold">{e.n}</span>
              <span className="block truncate text-[9.5px]" style={{ color: MUTED }}>
                {e.d} · {e.at}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Overview() {
  const rows: { label: string; key?: keyof (typeof OVERVIEW)[number]; pill?: "red" | "green"; section?: string }[] = [
    { label: "Planning", section: "Planning" },
    { label: "Events team dinner" },
    { label: "Staffing", section: "Staffing" },
    { label: "Coaching ratio", key: "ratio", pill: "red" },
    { label: "# of coaches", key: "coaches" },
    { label: "Actual enrollment", key: "enrolled" },
    { label: "Volunteer ratio", key: "vRatio", pill: "green" },
    { label: "# of volunteers confirmed", key: "vols" },
    { label: "Coaches", section: "Coaches" },
    { label: "Head coach", key: "head" },
  ];
  return (
    <div className="px-6">
      <div className="flex items-center gap-3 text-[9.5px]" style={{ color: MUTED }}>
        Upcoming events, soonest first. Coaches and volunteers come from each event&rsquo;s roster.
        <span className="flex items-center gap-1">
          <span className="h-[6px] w-[6px] rounded-full" style={{ background: GREEN }} />
          Approved
        </span>
        <span className="flex items-center gap-1">
          <span className="h-[6px] w-[6px] rounded-full" style={{ background: "#E0B11E" }} />
          Pending
        </span>
      </div>
      <div className="mt-2 overflow-hidden rounded-[12px] border bg-white" style={{ borderColor: HAIR }}>
        <div className="grid" style={{ gridTemplateColumns: `150px repeat(${OVERVIEW.length}, 1fr)` }}>
          <span className="flex items-end px-3 pb-1.5 text-[9.5px]" style={{ color: MUTED }}>
            Event
          </span>
          {OVERVIEW.map((e) => (
            <span key={e.n} className="px-2 py-2 text-center text-white" style={{ background: e.c }}>
              <span className="block truncate text-[10px] font-bold">{e.n}</span>
              <span className="block text-[9px] opacity-90">{e.d}</span>
            </span>
          ))}
          {rows.map((r) =>
            r.section ? (
              <span
                key={r.label}
                className="border-t px-3 py-[3px] text-[8px] font-bold uppercase tracking-[0.1em]"
                style={{ gridColumn: `1 / span ${OVERVIEW.length + 1}`, borderColor: HAIR, background: "#F7F6F3", color: MUTED2 }}
              >
                {r.section}
              </span>
            ) : (
              <Fragment key={r.label}>
                <span className="border-t px-3 py-[5px] text-[10px] font-semibold" style={{ borderColor: HAIR }}>
                  {r.label}
                </span>
                {OVERVIEW.map((e) => {
                  const v = r.key ? e[r.key] : "";
                  return (
                    <span key={e.n} className="grid place-items-center border-l border-t px-1 py-[5px] text-[10px] tabular-nums" style={{ borderColor: HAIR }}>
                      {v && r.pill ? <Pill tone={r.pill}>{v}</Pill> : v}
                    </span>
                  );
                })}
              </Fragment>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

function Registrations({ fresh }: { fresh: boolean }) {
  const rows = fresh ? [NEW_REG, ...REGS.slice(0, 5)] : REGS;
  return (
    <div className="px-6">
      <div className="flex items-center gap-2 rounded-[11px] border bg-white px-3 py-2" style={{ borderColor: HAIR }}>
        <span className="rounded-[7px] border px-2 py-[3px] text-[10px] font-semibold" style={{ borderColor: HAIR2 }}>
          Filters
        </span>
        <span className="ml-auto rounded-full px-2 py-[2px] text-[9.5px] tabular-nums" style={{ background: "#F1EFEA", color: MUTED }}>
          {fresh ? 613 : 612} records
        </span>
        <span className="rounded-[7px] border px-2 py-[3px] text-[10px] font-semibold" style={{ borderColor: HAIR2 }}>
          Columns
        </span>
        <span className="rounded-[7px] px-2.5 py-[3px] text-[10px] font-bold text-white" style={{ background: ORANGE }}>
          + New Registration
        </span>
      </div>
      <div className="mt-2.5 overflow-hidden rounded-[12px] border bg-white" style={{ borderColor: HAIR }}>
        <div className="grid border-b px-4 py-2 text-[9px] font-bold uppercase tracking-[0.1em]" style={{ gridTemplateColumns: "1.6fr 1fr 1.3fr", borderColor: HAIR, color: MUTED2 }}>
          <span>Contact</span>
          <span>Phone</span>
          <span>Email</span>
        </div>
        {rows.map((r, i) => (
          <div
            key={r.n}
            className="grid items-center border-b px-4 py-[7px] text-[10.5px] last:border-b-0"
            style={{
              gridTemplateColumns: "1.6fr 1fr 1.3fr",
              borderColor: HAIR,
              background: fresh && i === 0 ? "#F2FAF5" : "#fff",
              animation: fresh && i === 0 ? "eh-in .45s cubic-bezier(.22,1,.36,1)" : undefined,
            }}
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span className="grid h-[22px] w-[22px] flex-none place-items-center rounded-full text-[8px] font-bold" style={{ background: `${ORANGE}18`, color: ORANGE }}>
                {initials(r.n)}
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 truncate font-semibold">
                  {r.n}
                  {fresh && i === 0 && <Pill tone="green">New</Pill>}
                </span>
                <span className="block truncate text-[9px]" style={{ color: MUTED }}>
                  {r.e}
                </span>
              </span>
            </span>
            <span className="tabular-nums">{r.ph}</span>
            <span className="truncate">{r.em}</span>
          </div>
        ))}
      </div>
      <style>{`@keyframes eh-in{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}

function Coaches({ approved }: { approved: boolean }) {
  const coaches = [
    { n: "Dana Whitfield", role: "Head coach", b: "Team" },
    { n: "Marcus Hale", role: "Logistics coach", b: "Team" },
    { n: "Jordan Rivera", role: "Small group coach", b: "External" },
  ];
  const vols = [
    { n: "Theo Barnes", s: "Approved" },
    { n: "Avery Rowe", s: "Approved" },
    { n: "Lena Fox", s: "Approved" },
    { n: "Chris Doyle", s: "Pending" },
  ];
  return (
    <div className="px-6">
      <div className="flex items-center text-[10.5px]" style={{ color: MUTED }}>
        6 coaches across 18 events.
        <span className="ml-auto flex gap-1.5">
          {["Dana Whitfield 5", "Marcus Hale 3", "Jordan Rivera 2"].map((c) => (
            <span key={c} className="rounded-full border bg-white px-2 py-[2px] text-[9.5px]" style={{ borderColor: HAIR2, color: "#4A4740" }}>
              {c}
            </span>
          ))}
        </span>
      </div>
      <div className="mt-2.5 rounded-[12px] border bg-white p-3" style={{ borderColor: HAIR }}>
        <div className="flex items-center gap-2 text-[11.5px]">
          <span className="font-bold">Leaders Summit 2026</span>
          <span className="text-[10px]" style={{ color: MUTED }}>
            Thu, Oct 22, 2026
          </span>
          <span className="flex items-center gap-1 text-[10px]" style={{ color: MUTED }}>
            <Pin className="h-[10px] w-[10px]" />
            Hilltop Conference Center
          </span>
          <span className="ml-auto text-[10px]" style={{ color: MUTED }}>
            3 coaches · 4 volunteers
          </span>
        </div>
        <div className="mt-2.5 grid grid-cols-2 gap-2.5">
          <div className="rounded-[10px] border p-2" style={{ borderColor: HAIR }}>
            <div className="mb-1.5 flex items-center gap-1.5 px-1 text-[8.5px] font-bold uppercase tracking-[0.1em]" style={{ color: MUTED }}>
              <Cap className="h-[11px] w-[11px]" />
              Coaches 3
            </div>
            {coaches.map((c) => (
              <div key={c.n} className="mb-1 flex items-center gap-2 rounded-[8px] border px-2 py-[6px] last:mb-0" style={{ borderColor: HAIR }}>
                <span className="grid h-[20px] w-[20px] place-items-center rounded-full text-[7.5px] font-bold" style={{ background: "#EEECE8", color: "#5C5852" }}>
                  {initials(c.n)}
                </span>
                <span className="min-w-0">
                  <span className="block text-[10.5px] font-semibold">{c.n}</span>
                  <span className="block text-[9px]" style={{ color: MUTED }}>
                    {c.role}
                  </span>
                </span>
                <span
                  className="ml-auto rounded-[5px] px-1.5 py-[1px] text-[8px] font-bold uppercase"
                  style={c.b === "Team" ? { background: "#E8EEF8", color: "#2F5FA8" } : { background: "#FBF0DF", color: AMBER }}
                >
                  {c.b}
                </span>
              </div>
            ))}
          </div>
          <div className="rounded-[10px] border p-2" style={{ borderColor: HAIR }}>
            <div className="mb-1.5 flex items-center gap-1.5 px-1 text-[8.5px] font-bold uppercase tracking-[0.1em]" style={{ color: MUTED }}>
              <HandHeart className="h-[11px] w-[11px]" />
              Volunteers 4
            </div>
            {vols.map((v) => {
              const ok = v.s === "Approved" || approved;
              return (
                <div
                  key={v.n}
                  className="mb-1 flex items-center gap-2 rounded-[8px] border border-l-[3px] px-2 py-[5px] transition-colors duration-300 last:mb-0"
                  style={{ borderColor: HAIR, borderLeftColor: ok ? GREEN : "#E0B11E", background: ok ? "#F3FAF6" : "#FDF7EC" }}
                >
                  <span className="text-[10.5px] font-semibold">{v.n}</span>
                  <Pill tone="amber">External</Pill>
                  <span className="ml-auto flex items-center gap-1.5">
                    {!ok && (
                      <span data-eh="approve" className="rounded-[5px] px-1.5 py-[1px] text-[9px] font-bold text-white" style={{ background: GREEN }}>
                        Approve
                      </span>
                    )}
                    <Pill tone={ok ? "green" : "amber"}>{ok ? "APPROVED" : "PENDING"}</Pill>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function TemplateCards() {
  return (
    <div className="px-6">
      <div className="flex items-center">
        <span className="text-[10.5px]" style={{ color: MUTED }}>
          Reusable event blueprints: stages, tasks, inventory, files, and budget numbers.
        </span>
        <span className="ml-auto rounded-[8px] px-2.5 py-[5px] text-[10px] font-bold text-white" style={{ background: NAVY }}>
          + New template
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2.5">
        {TEMPLATES.map((t) => (
          <div key={t.n} className="rounded-[12px] border bg-white p-3" style={{ borderColor: HAIR, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
            <div className="flex">
              <span className="grid h-[28px] w-[28px] place-items-center rounded-[8px]" style={{ background: "#EFEDE9", color: "#5C5852" }}>
                <Templates className="h-[15px] w-[15px]" />
              </span>
              <span className="ml-auto text-[12px] leading-none" style={{ color: MUTED2 }}>
                ···
              </span>
            </div>
            <div className="mt-2.5 text-[11.5px] font-bold">{t.n}</div>
            <div className="text-[9.5px]" style={{ color: MUTED }}>
              {t.s}
            </div>
            <div className="mt-2 text-[9.5px]" style={{ color: MUTED }}>
              {t.meta}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- one event's record
const RECORD_TABS: { k: RecordTab | "people" | "forms" | "files" | "budget"; l: string; n?: string }[] = [
  { k: "tasks", l: "Tasks", n: "3" },
  { k: "details", l: "Details" },
  { k: "agenda", l: "Agenda" },
  { k: "portal", l: "Client Portal" },
  { k: "people", l: "People", n: "137" },
  { k: "forms", l: "Forms", n: "2" },
  { k: "inventory", l: "Inventory", n: "72" },
  { k: "files", l: "Files" },
  { k: "budget", l: "Budget" },
];

function EventRecord({ scene }: { scene: Scene }) {
  const left = CAPACITY - scene.regs;
  return (
    <div className="px-6 pt-4">
      <div className="flex items-center gap-1.5 text-[10.5px] font-semibold" style={{ color: MUTED }}>
        <Back className="h-[12px] w-[12px]" />
        Events HQ
      </div>

      {/* title */}
      <div className="mt-2 flex items-start gap-3">
        <span className="grid h-[38px] w-[38px] flex-none place-items-center rounded-[10px]" style={{ background: "#EFEDE9", color: "#5C5852" }}>
          <CalDays className="h-[19px] w-[19px]" />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[17px] font-bold tracking-tight">Leaders Summit 2026</span>
            <span className="flex items-center gap-1 rounded-full px-2 py-[2px] text-[9.5px] font-bold" style={{ background: `${TYPE.Summit}18`, color: TYPE.Summit }}>
              <span className="h-[5px] w-[5px] rounded-full" style={{ background: TYPE.Summit }} />
              Summit
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-3 text-[10.5px]" style={{ color: MUTED }}>
            <span className="flex items-center gap-1">
              <Pin className="h-[11px] w-[11px]" />
              Hilltop Conference Center
            </span>
            <span className="flex items-center gap-1.5">
              Event manager
              <span className="grid h-[16px] w-[16px] place-items-center rounded-full text-[7px] font-bold text-white" style={{ background: "#1592AE" }}>
                DW
              </span>
              <span style={{ color: INK }}>Dana Whitfield</span>
            </span>
          </div>
        </div>
        {/* z-10 so the share menu opens over the stat cards below, not under them. */}
        <div className="relative z-10 ml-auto flex flex-none items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-[8px] border bg-white px-2.5 py-1.5 text-[10.5px] font-semibold" style={{ borderColor: HAIR2 }}>
            <Pencil className="h-[11px] w-[11px]" />
            Edit
          </span>
          <span data-eh="share" className="flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[10.5px] font-semibold text-white" style={{ background: NAVY }}>
            <List className="h-[12px] w-[12px]" />
            View / Share agenda
            <Chevron className="h-[10px] w-[10px]" />
          </span>
          {/* Traced from the client's screenshot of this menu: three ways to
              see or share the agenda, then texting and emailing it to the
              event's volunteers or coaches. */}
          <div
            className="absolute right-0 top-[calc(100%+6px)] w-[196px] rounded-[10px] border bg-white p-1 text-[10.5px] transition-all duration-[120ms]"
            style={{
              borderColor: HAIR2,
              color: "#3C3833",
              opacity: scene.shareOpen ? 1 : 0,
              transform: scene.shareOpen ? "translateY(0)" : "translateY(-4px)",
              boxShadow: "0 16px 32px -14px rgba(20,15,10,0.35)",
            }}
          >
            {[
              { l: "View agenda", icon: List },
              { l: "Open the shared agenda", icon: External },
              { l: "Share agenda…", icon: ShareNodes },
            ].map((m) => (
              <div key={m.l} className="flex items-center gap-2 rounded-[7px] px-2.5 py-[6px]">
                <m.icon className="h-[12px] w-[12px] flex-none" />
                {m.l}
              </div>
            ))}
            <div className="my-1 border-t" style={{ borderColor: HAIR }} />
            <div className="px-2.5 pb-1 pt-0.5 text-[9.5px]" style={{ color: MUTED }}>
              Text &amp; email the agenda to
            </div>
            <div className="flex items-center gap-2 rounded-[7px] px-2.5 py-[6px]">
              <HandHeart className="h-[12px] w-[12px] flex-none" />
              Volunteers…
            </div>
            <div data-eh="share-coaches" className="flex items-center gap-2 rounded-[7px] px-2.5 py-[6px] font-semibold" style={{ background: "#F5F3EF" }}>
              <Cap className="h-[12px] w-[12px] flex-none" style={{ color: RED }} />
              Coaches…
            </div>
          </div>
        </div>
      </div>

      {/* stat cards */}
      <div className="mt-3 grid grid-cols-4 gap-2.5">
        <Stat label="Countdown">
          <span className="text-[19px] font-bold tabular-nums">8</span>
          <span className="ml-1.5 text-[10px]" style={{ color: MUTED }}>
            days to go
          </span>
        </Stat>
        <Stat label="Event date">
          <span className="text-[13px] font-bold">Thu, Oct 22, 2026</span>
        </Stat>
        <Stat label="Registrations">
          <div className="flex items-baseline">
            <span className="text-[19px] font-bold tabular-nums">{scene.regs}</span>
            <span className="ml-1 text-[11px] tabular-nums" style={{ color: MUTED }}>
              / {CAPACITY}
            </span>
            <span className="ml-auto text-[9.5px] tabular-nums" style={{ color: MUTED }}>
              {left} left
            </span>
          </div>
          <div className="mt-1.5 h-[4px] overflow-hidden rounded-full" style={{ background: "#ECEAE6" }}>
            <div className="h-full rounded-full transition-[width] duration-200 ease-out" style={{ width: `${(scene.regs / CAPACITY) * 100}%`, background: NAVY }} />
          </div>
        </Stat>
        <Stat label="Budget">
          <div className="flex items-baseline gap-1">
            <span className="text-[17px] font-bold tabular-nums" style={{ color: GREEN }}>
              +$18,240
            </span>
            <span className="text-[9px] font-semibold" style={{ color: MUTED }}>
              P/L
            </span>
          </div>
          <div className="text-[9px] tabular-nums" style={{ color: MUTED }}>
            Plan +$15,000 · Spent $23,760
          </div>
        </Stat>
      </div>

      {/* stage bar */}
      <div className="mt-3 flex">
        {STAGES.map((s, i) => {
          const complete = i < scene.stage;
          const current = i === scene.stage;
          const clip =
            i === 0
              ? "polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%)"
              : "polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%, 10px 50%)";
          return (
            <div
              key={s}
              className="flex min-w-0 flex-1 flex-col justify-center py-[6px] transition-colors duration-500"
              style={{
                background: complete ? GREEN : current ? NAVY : "#ECEAE5",
                color: complete || current ? "#fff" : MUTED,
                clipPath: clip,
                marginLeft: i === 0 ? 0 : -6,
                paddingLeft: i === 0 ? 10 : 16,
                paddingRight: 10,
              }}
            >
              <span className="flex items-center gap-1 truncate text-[10px] font-bold">
                {complete && <Check className="h-[9px] w-[9px] flex-none" />}
                {s}
              </span>
              <span className="truncate text-[8.5px]" style={{ opacity: complete || current ? 0.85 : 1 }}>
                {complete ? "Complete" : current ? (i === STAGE_NOW + 1 ? "Happening now" : `${scene.done} of 3 done`) : "Upcoming"}
              </span>
            </div>
          );
        })}
      </div>

      {/* record tabs */}
      <div className="mt-3 flex gap-1 rounded-[10px] p-1 text-[10.5px]" style={{ background: "#EFEDE9" }}>
        {RECORD_TABS.map((t) => (
          <span
            key={t.k}
            data-eh={`tab-${t.k}`}
            className="flex flex-1 items-center justify-center gap-1 rounded-[7px] py-1.5 font-semibold transition-colors duration-200"
            style={scene.rtab === t.k ? { background: "#fff", color: INK, boxShadow: "0 1px 2px rgba(0,0,0,0.06)" } : { color: MUTED }}
          >
            {t.l}
            {t.n && (
              <span className="rounded-full px-1.5 text-[8.5px] tabular-nums" style={{ background: "#E4E1DB", color: MUTED }}>
                {t.k === "people" ? scene.regs : t.n}
              </span>
            )}
            {t.k === "inventory" && <span className="h-[5px] w-[5px] rounded-full" style={{ background: "#E5484D" }} />}
          </span>
        ))}
      </div>

      {/* tab content */}
      <div className="relative mt-2.5" style={{ height: 232 }}>
        <Fade on={scene.rtab === "tasks"}>
          <TasksPane done={scene.done} />
        </Fade>
        <Fade on={scene.rtab === "details"}>
          <DetailsPane regs={scene.regs} />
        </Fade>
        <Fade on={scene.rtab === "agenda"}>
          <AgendaPane rows={scene.agendaRows} />
        </Fade>
        <Fade on={scene.rtab === "portal"}>
          <PortalPane booked={scene.hotelBooked} />
        </Fade>
        <Fade on={scene.rtab === "inventory"}>
          <InventoryPane />
        </Fade>
      </div>
    </div>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[11px] border bg-white px-3 py-2.5" style={{ borderColor: HAIR }}>
      <div className="mb-1 text-[8.5px] font-bold uppercase tracking-[0.1em]" style={{ color: MUTED2 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function TasksPane({ done }: { done: number }) {
  const allDone = done >= TASKS.length;
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 px-1">
        <span className="text-[12px] font-bold">2 Weeks out</span>
        <span
          className="rounded-full px-2 py-[1px] text-[9.5px] font-semibold transition-colors duration-300"
          style={allDone ? { background: `${GREEN}18`, color: GREEN } : { background: "#EEECE8", color: MUTED }}
        >
          {allDone ? "All done" : `${TASKS.length - done} open`}
        </span>
        <span className="ml-auto text-[10px]" style={{ color: MUTED }}>
          Sort: Due date
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        {TASKS.map((t, i) => {
          const isDone = i < done;
          const status = isDone ? "Completed" : t.status;
          return (
            <div key={t.t} className="flex items-center gap-3 rounded-[10px] border bg-white px-3.5 py-2" style={{ borderColor: HAIR }}>
              <span
                data-eh={`task-${i}`}
                className="grid h-[17px] w-[17px] flex-none place-items-center rounded-full border-[1.5px] transition-colors duration-200"
                style={isDone ? { background: GREEN, borderColor: GREEN, color: "#fff" } : { borderColor: "#C9C5BD" }}
              >
                {isDone && <Check className="h-[10px] w-[10px]" />}
              </span>
              <span
                className="min-w-0 flex-1 truncate text-[11.5px] transition-colors duration-200"
                style={{ color: isDone ? MUTED2 : INK, textDecoration: isDone ? "line-through" : "none" }}
              >
                {t.t}
              </span>
              <span className="flex items-center gap-1.5 text-[10px]">
                <span className="grid h-[17px] w-[17px] place-items-center rounded-full text-[7px] font-bold" style={{ background: "#EEECE8", color: "#5C5852" }}>
                  {t.i}
                </span>
                {t.who}
              </span>
              <span className="flex items-center gap-1 rounded-[7px] border px-2 py-[3px] text-[9.5px] tabular-nums" style={{ borderColor: HAIR2 }}>
                <Cal className="h-[10px] w-[10px]" style={{ color: MUTED }} />
                {t.due}
              </span>
              <span className="w-[72px]">
                <Pill tone={status === "Completed" ? "green" : status === "In progress" ? "amber" : "grey"}>{status}</Pill>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DetailsPane({ regs }: { regs: number }) {
  const fields = [
    ["Start date", "Thursday, October 22, 2026"],
    ["End date", "Saturday, October 24, 2026"],
    ["Event type", "Summit"],
    ["Location", "Hilltop Conference Center"],
    ["Capacity (estimated participants)", "140"],
    ["Registrations", `${regs} of ${CAPACITY} spots`],
    ["Ticket price", "$495"],
    ["Owner", "Dana Whitfield"],
  ];
  return (
    <div className="h-full rounded-[12px] border bg-white px-4 py-2.5" style={{ borderColor: HAIR }}>
      <div className="flex items-center">
        <span className="text-[8.5px] font-bold uppercase tracking-[0.1em]" style={{ color: MUTED }}>
          Event details
        </span>
        <span className="ml-auto rounded-[7px] border px-2 py-[2px] text-[9.5px] font-semibold" style={{ borderColor: HAIR2 }}>
          Notes
        </span>
      </div>
      <div className="mt-1 grid grid-cols-2 gap-x-6 gap-y-[4px]">
        {fields.map(([k, v]) => (
          <div key={k}>
            <div className="text-[8px] font-bold uppercase tracking-[0.08em]" style={{ color: MUTED2 }}>
              {k}
            </div>
            <div className="text-[10.5px]">
              {k === "Event type" ? (
                <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-[1px] text-[9.5px] font-semibold" style={{ background: `${TYPE.Summit}18`, color: TYPE.Summit }}>
                  <span className="h-[5px] w-[5px] rounded-full" style={{ background: TYPE.Summit }} />
                  {v}
                </span>
              ) : (
                v
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-6 border-t pt-1.5" style={{ borderColor: HAIR }}>
        <div>
          <div className="text-[8px] font-bold uppercase tracking-[0.08em]" style={{ color: MUTED2 }}>
            About this event
          </div>
          <div className="text-[10px] leading-snug" style={{ color: "#4A4740" }}>
            Three days for Ridgeline&rsquo;s leaders: vision, breakouts, and the plan for next year.
          </div>
        </div>
        <div>
          <div className="text-[8px] font-bold uppercase tracking-[0.08em]" style={{ color: MUTED2 }}>
            Landing page links
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 rounded-[7px] border px-2 py-1 text-[10px]" style={{ borderColor: HAIR }}>
            <External className="h-[10px] w-[10px] flex-none" style={{ color: MUTED }} />
            <span className="truncate font-semibold">Leaders Summit sign-up page</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AgendaPane({ rows }: { rows: number }) {
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex flex-none items-center gap-1.5">
        {AGENDA_DAYS.map((d, i) => (
          <span
            key={d.l}
            className="rounded-[8px] border px-2 py-[3px] text-[9.5px] leading-tight"
            style={i === 2 ? { background: NAVY, borderColor: NAVY, color: "#fff" } : { borderColor: HAIR2, background: "#fff" }}
          >
            <span className="block font-bold">{d.l}</span>
            <span className="block text-[8px] opacity-75">{d.d}</span>
          </span>
        ))}
        <span className="rounded-[8px] border bg-white px-2 py-[6px] text-[9.5px] font-semibold" style={{ borderColor: HAIR2 }}>
          Shared notes
        </span>
        <span className="ml-auto flex items-center gap-1 rounded-[8px] border bg-white px-2 py-[6px] text-[9.5px] font-semibold" style={{ borderColor: HAIR2 }}>
          Logo
          <Check className="h-[9px] w-[9px]" style={{ color: GREEN }} />
        </span>
        <span className="rounded-[8px] border bg-white px-2 py-[6px] text-[9.5px] font-semibold" style={{ borderColor: HAIR2 }}>
          Library
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden rounded-[10px] border bg-white" style={{ borderColor: HAIR }}>
        <div
          className="grid border-b px-3 py-[5px] text-[8px] font-bold uppercase tracking-[0.1em]"
          style={{ gridTemplateColumns: "64px 46px 1.3fr 72px 1.2fr", borderColor: HAIR, color: MUTED2 }}
        >
          <span>Start</span>
          <span>Length</span>
          <span>Segment</span>
          <span>Who</span>
          <span>Notes &amp; cues</span>
        </div>
        {AGENDA.map((r, i) => {
          const shown = i < rows;
          const motion = { opacity: shown ? 1 : 0, transform: shown ? "none" : "translateY(5px)" };
          return "group" in r ? (
            <div
              key={r.group}
              className="border-b px-3 py-[4px] text-[8.5px] font-bold uppercase tracking-[0.1em] transition-all duration-300"
              style={{ background: r.color, borderColor: HAIR, color: "#3C3833", ...motion }}
            >
              {r.group}
            </div>
          ) : (
            <div
              key={r.t}
              className="grid items-center border-b px-3 py-[5px] text-[10.5px] transition-all duration-300 last:border-b-0"
              style={{ gridTemplateColumns: "64px 46px 1.3fr 72px 1.2fr", borderColor: HAIR, ...motion }}
            >
              <span className="font-mono text-[9.5px]" style={{ color: MUTED }}>
                {r.at}
              </span>
              <span className="text-[9.5px]" style={{ color: MUTED }}>
                {r.len}
              </span>
              <span className="font-semibold">{r.t}</span>
              <span className="text-[9.5px]">{r.who}</span>
              <span className="truncate text-[9.5px]" style={{ color: "#4A4740" }}>
                {r.cue}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PortalPane({ booked }: { booked: boolean }) {
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex flex-none items-center gap-1.5">
        <span className="inline-flex gap-1 rounded-[9px] p-[3px] text-[10px] font-semibold" style={{ background: "#EFEDE9" }}>
          {["Attendees", "Portal content", "Checklist"].map((s, i) => (
            <span key={s} className="rounded-[7px] px-2 py-[3px]" style={i === 0 ? { background: "#fff", color: INK } : { color: MUTED }}>
              {s}
            </span>
          ))}
        </span>
        <span className="text-[10px]" style={{ color: MUTED }}>
          Everyone registered is added
        </span>
        <span className="ml-auto flex items-center gap-1 rounded-[8px] border bg-white px-2 py-[4px] text-[9.5px] font-semibold" style={{ borderColor: HAIR2 }}>
          <Portal className="h-[11px] w-[11px]" />
          View client portal screen
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden rounded-[10px] border bg-white" style={{ borderColor: HAIR }}>
        <div
          className="grid border-b px-3 py-[5px] text-[8px] font-bold uppercase tracking-[0.1em]"
          style={{ gridTemplateColumns: "1.2fr 0.8fr 0.5fr 0.6fr 0.9fr 1.4fr", borderColor: HAIR, color: MUTED2 }}
        >
          <span>Attendee</span>
          <span>Portal</span>
          <span>Forms</span>
          <span>Shirt</span>
          <span>Hotel</span>
          <span>Welcome box tracking</span>
        </div>
        {ATTENDEES.map((a, i) => {
          const hotel = i === 1 && booked ? "Booked" : a.hotel;
          return (
            <div
              key={a.n}
              className="grid items-center border-b px-3 py-[6px] text-[10px] last:border-b-0"
              style={{ gridTemplateColumns: "1.2fr 0.8fr 0.5fr 0.6fr 0.9fr 1.4fr", borderColor: HAIR }}
            >
              <span className="truncate font-semibold">{a.n}</span>
              <span style={{ color: a.portal ? GREEN : MUTED }}>{a.portal ? "In portal" : "Not in portal"}</span>
              <span className="tabular-nums">{a.forms}</span>
              <span>{a.shirt}</span>
              <span>
                <span
                  data-eh={`hotel-${i}`}
                  className="inline-flex items-center gap-1 rounded-[6px] border px-1.5 py-[1px] text-[9.5px] transition-colors duration-300"
                  style={hotel === "Booked" ? { borderColor: `${GREEN}55`, background: "#EEF8F2", color: "#17714A" } : { borderColor: HAIR2 }}
                >
                  {hotel}
                  <Chevron className="h-[8px] w-[8px]" />
                </span>
              </span>
              <span className="flex items-center gap-1">
                <span className="rounded-[6px] border px-1.5 py-[1px] text-[9.5px]" style={{ borderColor: HAIR2, color: a.carrier ? INK : MUTED2 }}>
                  {a.carrier || "Carrier"}
                </span>
                <span className="truncate rounded-[6px] border px-1.5 py-[1px] font-mono text-[9px]" style={{ borderColor: HAIR2, color: a.track ? INK : MUTED2 }}>
                  {a.track || "Tracking #"}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InventoryPane() {
  return (
    <div className="flex h-full flex-col gap-2 rounded-[12px] border bg-white px-3 py-2.5" style={{ borderColor: HAIR }}>
      <div className="flex flex-none items-center gap-2">
        <span className="text-[11.5px] font-bold">Inventory needed</span>
        <span className="flex items-center gap-1 rounded-full border px-2 py-[1px] text-[9.5px] font-semibold" style={{ borderColor: "#F2B8B5", background: "#FDF0EF", color: "#B4322A" }}>
          <Warn className="h-[10px] w-[10px]" />
          Short 22 units
        </span>
      </div>
      <div className="flex-none rounded-[9px] border px-2.5 py-2" style={{ borderColor: HAIR, background: "#FBFAF8" }}>
        <div className="flex items-center gap-1.5 text-[8.5px] font-bold uppercase tracking-[0.1em]" style={{ color: MUTED }}>
          <Shirt className="h-[11px] w-[11px]" />
          Attendee shirts
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          {SIZES.map(([s, n]) => (
            <span key={s} className="rounded-[6px] border bg-white px-1.5 py-[1px] text-[9.5px] font-bold tabular-nums" style={{ borderColor: HAIR2 }}>
              {s} {n}
            </span>
          ))}
          <span className="rounded-[6px] border border-dashed px-1.5 py-[1px] text-[9.5px]" style={{ borderColor: HAIR2, color: MUTED }}>
            No size given 11
          </span>
          <span className="ml-auto text-[9.5px]" style={{ color: MUTED }}>
            126 of 137 have given a size · synced hourly
          </span>
        </div>
      </div>
      <div className="flex-none text-[9.5px]" style={{ color: MUTED }}>
        Per-person items scale with ~151 attendees: your planned number, or registrations +10%, whichever is higher.
      </div>
      <div className="flex min-h-0 flex-col gap-1">
        {ITEMS.map((it) => (
          <div
            key={it.n}
            className="flex items-center gap-2 rounded-[8px] border px-2.5 py-[4px] text-[10px]"
            style={it.short ? { borderColor: "#F2B8B5", background: "#FFF8F7" } : { borderColor: HAIR }}
          >
            {it.short && <span className="h-[5px] w-[5px] flex-none rounded-full" style={{ background: "#E5484D" }} />}
            <span className="min-w-0 flex-1 truncate">
              <span className="font-semibold">{it.n}</span>
              {it.short && (
                <span className="ml-2 text-[9px]" style={{ color: "#B4322A" }}>
                  {it.short}
                </span>
              )}
            </span>
            <span className="tabular-nums" style={{ color: MUTED }}>
              {it.qty}
            </span>
            <span className="w-[70px] rounded-[6px] border px-1.5 py-[1px] text-center text-[9px]" style={{ borderColor: HAIR2 }}>
              {it.mode}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
