"use client";

// Animated hero for the Events HQ feature page.
//
// Events HQ is a whole department, so the loop does what an event manager does
// on a normal morning, in one pass and without leaving the module:
//
//   0. the list         Events HQ opens on its event list, upcoming first
//   1. open an event    the next one, Leaders Summit 2026, opens on its record
//   2. registrations    the count climbs toward capacity while you watch
//   3. the stage        the open tasks in "2 Weeks out" get ticked off, and
//                       the stage bar moves on to "1 Week out"
//   4. the agenda       the Agenda tab, the run of show for day one, and the
//                       share link copied for the team
//
// The chrome is traced from the client's October 2026 screenshots: the Events
// HQ sidebar with its eight pages, the Events / Calendar / Overview Calendar /
// Registrations / Coaches / Templates tabs, the event list's columns, and the
// event record's countdown, date, registrations and budget cards, its stage
// bar and its Tasks / Details / Agenda / Client Portal / People / Forms /
// Inventory / Files / Budget tabs.
//
// Same architecture as the other hero tours: the screen is React state, only
// the cursor and the ripple are animated imperatively through the Web
// Animations API, and the sequence is generation-token guarded so a re-render
// or unmount cancels the in-flight tour rather than leaving orphaned timers.
//
// Everything on screen is fictional. The client's screenshots carry real event
// names, real attendees with their phone numbers and emails, and real staff;
// none of that is on the public site. The events here belong to the same
// Ridgeline cast the other feature pages use.
import { useEffect, useRef, useState } from "react";
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
const LinkIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M10 13.6a4 4 0 0 0 5.7 0l2.8-2.8a4 4 0 0 0-5.7-5.7L11.4 6.5" />
    <path d="M14 10.4a4 4 0 0 0-5.7 0L5.5 13.2a4 4 0 0 0 5.7 5.7l1.4-1.4" />
  </svg>
);
const Chevron = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2.2}>
    <path d="M6 9.5l6 6 6-6" />
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
const TOP_TABS = ["Events", "Calendar", "Overview Calendar", "Registrations", "Coaches", "Templates"];

const EVENTS = [
  { n: "Leaders Summit 2026", at: "Hilltop Conference Center", m: "Dana Whitfield", i: "DW", start: "Oct 22, 2026", stage: "2 Weeks out" },
  { n: "Founders Retreat", at: "Lakeside Lodge", m: "Marcus Hale", i: "MH", start: "Oct 29, 2026", stage: "2 Weeks out" },
  { n: "Sales Bootcamp", at: "Ridgeline HQ", m: "Priya Nair", i: "PN", start: "Nov 5, 2026", stage: "1 Month out" },
  { n: "Leadership Intensive", at: "Austin, TX", m: "Jordan Rivera", i: "JR", start: "Nov 12, 2026", stage: "1 Month out" },
  { n: "Winter Gala", at: "The Grand Hall", m: "Theo Barnes", i: "TB", start: "Dec 5, 2026", stage: "2 Months out" },
  { n: "Q1 Kickoff", at: "Ridgeline HQ", m: "Avery Rowe", i: "AR", start: "Jan 8, 2027", stage: "3 Months out" },
];

const STAGES = ["6 Months out", "4 Months out", "3 Months out", "2 Months out", "1 Month out", "2 Weeks out", "1 Week out", "Week of"];
/** The stage the event is in when the record opens. */
const STAGE_NOW = 5;

const TASKS = [
  { t: "Confirm hotel block and catering count", who: "Dana", i: "DW", due: "Oct 9", status: "Not started" },
  { t: "Print name badges and handouts", who: "Priya", i: "PN", due: "Oct 10", status: "In progress" },
  { t: "Send arrival details to attendees", who: "Marcus", i: "MH", due: "Oct 12", status: "Not started" },
];

const AGENDA = [
  { at: "8:00 AM", t: "Registration and coffee", where: "Lobby", lead: "Priya Nair" },
  { at: "9:00 AM", t: "Welcome and vision", where: "Main hall", lead: "Dana Whitfield" },
  { at: "10:30 AM", t: "Breakout sessions", where: "Rooms A to C", lead: "Coaches" },
  { at: "12:30 PM", t: "Lunch", where: "Terrace", lead: "" },
  { at: "2:00 PM", t: "Panel: building teams that last", where: "Main hall", lead: "Marcus Hale" },
];

const CAPACITY = 140;
const REGS_FROM = 128;
const REGS_TO = 137;

// ---------------------------------------------------------------- scene
type Scene = {
  dim: boolean;
  view: "list" | "detail";
  /** The first row of the list is under the pointer. */
  hoverRow: boolean;
  regs: number;
  /** How many of the stage's three open tasks are ticked off. */
  done: number;
  /** Index of the current stage in STAGES. */
  stage: number;
  tab: "tasks" | "agenda";
  /** How many agenda rows have landed. */
  agendaRows: number;
  shareOpen: boolean;
  toast: string | null;
};
const BLANK: Scene = {
  dim: false,
  view: "list",
  hoverRow: false,
  regs: REGS_FROM,
  done: 0,
  stage: STAGE_NOW,
  tab: "tasks",
  agendaRows: 0,
  shareOpen: false,
  toast: null,
};
// The frame shown under prefers-reduced-motion: the record, with the stage's
// work done and the bar moved on. One shot that still tells the story.
const STILL: Scene = {
  ...BLANK,
  view: "detail",
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
      await wait(160);
      if (!alive()) return false;
      await click();
      return alive();
    };

    (async function loop() {
      while (alive()) {
        setScene(BLANK);
        setCursor(560, 300);
        await fade(1, 260);
        if (!alive()) return;
        await wait(700);

        // ---- 1. open the next event
        await glide(pointAt("row-0", 0.3, 0.5), 760);
        if (!alive()) return;
        patch({ hoverRow: true });
        await wait(320);
        await click();
        if (!alive()) return;
        patch({ view: "detail", hoverRow: false });
        await wait(800);

        // ---- 2. registrations land while you watch
        for (let r = REGS_FROM + 1; r <= REGS_TO; r++) {
          if (!alive()) return;
          patch({ regs: r });
          await wait(150);
        }
        await wait(500);

        // ---- 3. the stage's open tasks, ticked off
        for (let i = 0; i < TASKS.length; i++) {
          if (!(await tap(`task-${i}`, i === 0 ? 700 : 480))) return;
          patch({ done: i + 1 });
          await wait(360);
        }
        await wait(260);
        // Every task in the stage is done, so the bar moves on.
        patch({ stage: STAGE_NOW + 1, toast: "2 Weeks out is complete. 1 Week out is up next." });
        await wait(1900);
        patch({ toast: null });
        await wait(200);

        // ---- 4. the run of show, and the link the team needs
        if (!(await tap("tab-agenda", 640))) return;
        patch({ tab: "agenda" });
        for (let k = 1; k <= AGENDA.length; k++) {
          if (!alive()) return;
          await wait(110);
          patch({ agendaRows: k });
        }
        await wait(700);
        if (!(await tap("share", 620))) return;
        patch({ shareOpen: true });
        await wait(520);
        if (!(await tap("share-copy", 420))) return;
        patch({ shareOpen: false, toast: "Agenda link copied. Anyone with it can view." });
        await wait(2000);
        patch({ toast: null });
        await wait(900);

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
            <Sidebar />
            <div className="relative min-w-0 flex-1">
              <ListView scene={scene} />
              <DetailView scene={scene} />
            </div>

            {/* The toast sits over both views, bottom centre, the way the app shows them. */}
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

// ---------------------------------------------------------------- sidebar
function Sidebar() {
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
        <Cal className="h-[13px] w-[13px] flex-none" />
        Events HQ
        <Chevron className="ml-auto h-[11px] w-[11px]" />
      </div>
      <div className="ml-3 mt-1 border-l pl-2" style={{ borderColor: HAIR }}>
        {SUBNAV.map((n, i) => {
          const Ico = n.icon;
          return (
            <div
              key={n.l}
              className="flex items-center gap-2 rounded-[7px] px-2 py-[4.5px] text-[10.5px]"
              style={i === 0 ? { background: `${ORANGE}10`, color: ORANGE, fontWeight: 600 } : { color: "#5C5852" }}
            >
              <Ico className="h-[12px] w-[12px] flex-none" style={{ color: i === 0 ? ORANGE : MUTED2 }} />
              {n.l}
              {i === 0 && <span className="ml-auto h-[5px] w-[5px] rounded-full" style={{ background: ORANGE }} />}
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

// ---------------------------------------------------------------- the event list
function ListView({ scene }: { scene: Scene }) {
  const on = scene.view === "list";
  return (
    <div
      className="absolute inset-0 px-6 pt-5 transition-all duration-500 ease-out"
      style={{ opacity: on ? 1 : 0, transform: on ? "none" : "translateX(-14px)", pointerEvents: on ? "auto" : "none" }}
    >
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
        {TOP_TABS.map((t, i) => (
          <span
            key={t}
            className="-mb-px border-b-2 pb-2 font-semibold"
            style={i === 0 ? { borderColor: NAVY, color: INK } : { borderColor: "transparent", color: MUTED }}
          >
            {t}
            {t === "Templates" && (
              <span className="ml-1 rounded-full px-1.5 text-[9px]" style={{ background: "#EEECE8", color: MUTED }}>
                9
              </span>
            )}
          </span>
        ))}
      </div>

      <div className="mt-3 inline-flex gap-1 rounded-[10px] border bg-white p-1 text-[10px]" style={{ borderColor: HAIR }}>
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
            className="grid items-center border-b px-4 py-[9px] transition-colors duration-200 last:border-b-0"
            style={{
              gridTemplateColumns: "1.7fr 1fr 0.9fr 0.8fr",
              borderColor: HAIR,
              background: i === 0 && scene.hoverRow ? `${RED}0D` : "#fff",
            }}
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span
                className="grid h-[24px] w-[24px] flex-none place-items-center rounded-full text-[8.5px] font-bold"
                style={{ background: `${ORANGE}18`, color: ORANGE }}
              >
                {e.n
                  .split(" ")
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join("")}
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

// ---------------------------------------------------------------- the event record
function DetailView({ scene }: { scene: Scene }) {
  const on = scene.view === "detail";
  const left = CAPACITY - scene.regs;
  const allDone = scene.done >= TASKS.length;
  return (
    <div
      className="absolute inset-0 px-6 pt-4 transition-all duration-500 ease-out"
      style={{ opacity: on ? 1 : 0, transform: on ? "none" : "translateX(14px)", pointerEvents: on ? "auto" : "none" }}
    >
      <div className="flex items-center gap-1.5 text-[10.5px] font-semibold" style={{ color: MUTED }}>
        <Back className="h-[12px] w-[12px]" />
        Events HQ
      </div>

      {/* title */}
      <div className="mt-2 flex items-start gap-3">
        <span className="grid h-[38px] w-[38px] flex-none place-items-center rounded-[10px]" style={{ background: "#EFEDE9", color: "#5C5852" }}>
          <Cal className="h-[19px] w-[19px]" />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[17px] font-bold tracking-tight">Leaders Summit 2026</span>
            <span className="flex items-center gap-1 rounded-full px-2 py-[2px] text-[9.5px] font-bold" style={{ background: "#2F6FE418", color: "#2F6FE4" }}>
              <span className="h-[5px] w-[5px] rounded-full" style={{ background: "#2F6FE4" }} />
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
          <span
            data-eh="share"
            className="flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[10.5px] font-semibold text-white"
            style={{ background: NAVY }}
          >
            <List className="h-[12px] w-[12px]" />
            View / Share agenda
            <Chevron className="h-[10px] w-[10px]" />
          </span>
          <div
            className="absolute right-0 top-[calc(100%+6px)] z-10 w-[178px] rounded-[10px] border bg-white p-1 text-[10.5px] transition-all duration-200"
            style={{
              borderColor: HAIR2,
              opacity: scene.shareOpen ? 1 : 0,
              transform: scene.shareOpen ? "translateY(0)" : "translateY(-4px)",
              boxShadow: "0 16px 32px -14px rgba(20,15,10,0.35)",
            }}
          >
            <div className="flex items-center gap-2 rounded-[7px] px-2.5 py-2" style={{ color: "#4A4740" }}>
              <List className="h-[12px] w-[12px]" />
              Open the agenda
            </div>
            <div data-eh="share-copy" className="flex items-center gap-2 rounded-[7px] px-2.5 py-2 font-semibold" style={{ background: "#F5F3EF" }}>
              <LinkIcon className="h-[12px] w-[12px]" style={{ color: RED }} />
              Copy share link
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
            <div
              className="h-full rounded-full transition-[width] duration-200 ease-out"
              style={{ width: `${(scene.regs / CAPACITY) * 100}%`, background: NAVY }}
            />
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
          const bg = complete ? GREEN : current ? NAVY : "#ECEAE5";
          const fg = complete || current ? "#fff" : MUTED;
          const clip =
            i === 0
              ? "polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%)"
              : "polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%, 10px 50%)";
          return (
            <div
              key={s}
              className="flex min-w-0 flex-1 flex-col justify-center py-[6px] transition-colors duration-500"
              style={{
                background: bg,
                color: fg,
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
        {[
          ["tasks", "Tasks", "3"],
          ["details", "Details", ""],
          ["agenda", "Agenda", ""],
          ["portal", "Client Portal", ""],
          ["people", "People", String(scene.regs)],
          ["forms", "Forms", "2"],
          ["inventory", "Inventory", "72"],
          ["files", "Files", ""],
          ["budget", "Budget", ""],
        ].map(([k, l, n]) => (
          <span
            key={k}
            data-eh={`tab-${k}`}
            className="flex flex-1 items-center justify-center gap-1 rounded-[7px] py-1.5 font-semibold transition-colors duration-200"
            style={scene.tab === k ? { background: "#fff", color: INK, boxShadow: "0 1px 2px rgba(0,0,0,0.06)" } : { color: MUTED }}
          >
            {l}
            {n && (
              <span className="rounded-full px-1.5 text-[8.5px] tabular-nums" style={{ background: "#E4E1DB", color: MUTED }}>
                {n}
              </span>
            )}
          </span>
        ))}
      </div>

      {/* tab content */}
      <div className="relative mt-2.5">
        <div className="transition-opacity duration-300" style={{ opacity: scene.tab === "tasks" ? 1 : 0 }}>
          <div className="mb-2 flex items-center gap-2 px-1">
            <span className="text-[12px] font-bold">2 Weeks out</span>
            <span
              className="rounded-full px-2 py-[1px] text-[9.5px] font-semibold transition-colors duration-300"
              style={allDone ? { background: `${GREEN}18`, color: GREEN } : { background: "#EEECE8", color: MUTED }}
            >
              {allDone ? "All done" : `${TASKS.length - scene.done} open`}
            </span>
            <span className="ml-auto text-[10px]" style={{ color: MUTED }}>
              Sort: Due date
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {TASKS.map((t, i) => {
              const done = i < scene.done;
              const status = done ? "Completed" : t.status;
              const tone =
                status === "Completed"
                  ? { background: `${GREEN}16`, color: GREEN }
                  : status === "In progress"
                    ? { background: `${AMBER}18`, color: AMBER }
                    : { background: "#EEECE8", color: MUTED };
              return (
                <div key={t.t} className="flex items-center gap-3 rounded-[10px] border bg-white px-3.5 py-2" style={{ borderColor: HAIR }}>
                  <span
                    data-eh={`task-${i}`}
                    className="grid h-[17px] w-[17px] flex-none place-items-center rounded-full border-[1.5px] transition-colors duration-200"
                    style={done ? { background: GREEN, borderColor: GREEN, color: "#fff" } : { borderColor: "#C9C5BD" }}
                  >
                    {done && <Check className="h-[10px] w-[10px]" />}
                  </span>
                  <span
                    className="min-w-0 flex-1 truncate text-[11.5px] transition-colors duration-200"
                    style={{ color: done ? MUTED2 : INK, textDecoration: done ? "line-through" : "none" }}
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
                  <span className="w-[72px] rounded-full py-[3px] text-center text-[9px] font-bold transition-colors duration-200" style={tone}>
                    {status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="absolute inset-x-0 top-0 transition-opacity duration-300" style={{ opacity: scene.tab === "agenda" ? 1 : 0 }}>
          <div className="mb-2 flex items-center gap-2 px-1">
            <span className="text-[12px] font-bold">Day 1 · Thu, Oct 22</span>
            <span className="ml-auto flex gap-1 text-[9.5px] font-semibold">
              {["Day 1", "Day 2", "Day 3"].map((d, i) => (
                <span key={d} className="rounded-full px-2 py-[2px]" style={i === 0 ? { background: NAVY, color: "#fff" } : { background: "#EEECE8", color: MUTED }}>
                  {d}
                </span>
              ))}
            </span>
          </div>
          <div className="overflow-hidden rounded-[10px] border bg-white" style={{ borderColor: HAIR }}>
            {AGENDA.map((a, i) => (
              <div
                key={a.t}
                className="grid items-center border-b px-3.5 py-[7px] text-[11px] transition-all duration-300 last:border-b-0"
                style={{
                  gridTemplateColumns: "76px 1fr 110px 110px",
                  borderColor: HAIR,
                  opacity: i < scene.agendaRows ? 1 : 0,
                  transform: i < scene.agendaRows ? "none" : "translateY(6px)",
                }}
              >
                <span className="font-mono text-[10px]" style={{ color: MUTED }}>
                  {a.at}
                </span>
                <span className="font-semibold">{a.t}</span>
                <span className="text-[10px]" style={{ color: MUTED }}>
                  {a.where}
                </span>
                <span className="text-[10px]">{a.lead}</span>
              </div>
            ))}
          </div>
        </div>
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
