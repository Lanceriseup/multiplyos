"use client";

// Animated hero for the Projects & Tasks feature page.
//
// Three acts on a loop, at 1x pacing:
//
//   ACT 1 — the work is all here
//     1. the gallery            open "Client Onboarding"
//     2. the views              List -> Board -> Timeline, same tasks
//
//   ACT 2 — and it closes out
//     3. My Tasks               tick "Collect brand assets and logins" done
//     4. back to the project    259/352 becomes 260/352, the bar moves
//
//   ACT 3 — the whole team is in it   (added Sept 2026, on the client's brief)
//     5. open the task          the row they just finished
//     6. share                  copy the link, tick a teammate, notify them
//     7. collaborators          add somebody to the task
//
// Act 3 is the one that answers the headline. The first two show one person
// working; this one shows the task being handed around, which is what "your
// whole team works in one place" actually means. It is built from the client's
// own screenshots of the share and collaborator popovers, down to the section
// labels.
//
// The featured project is deliberately one almost every business runs, so the
// tour reads as "this is your work" rather than "this is somebody's website".
//
// The last beat is the point of the whole thing: the task somebody ticked in
// their own list and the project's progress bar are the same number. Clicking the
// project chip on the row they just finished is what carries them back.
//
// Same split as SopHqHeroTour and ScoreboardHeroTour: the views are React state,
// only the cursor and its ripple are animated imperatively through the Web
// Animations API. The sequence is generation-token guarded, so a re-render or
// unmount aborts the in-flight tour rather than leaving orphaned timers behind.
//
// Layout: the stage is FLUID and fills its container, with a floor of MIN_W below
// which it scales down proportionally. Cursor targets are measured from live rects
// and divided by the scale, so both modes stay in sync. Views swap inside a fixed
// height card, so it never resizes mid-tour.
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

const MIN_W = 940; // narrower than this and the whole stage scales down
const STAGE_H = 468; // card height, sized to the tallest view (the gallery)
const EASE = "cubic-bezier(0.22,1,0.36,1)";

// ---------------------------------------------------------------- tokens
const GREEN = "#1F9D57";
const GREEN_D = "#157A43";
const PURPLE = "#7C5CD6";
const PURPLE_D = "#5B47A8";
const BLUE = "#2C8FD6";
const AMBER = "#E89A2B";
const RED = "#D8563F";
const GREY = "#6B7280";

const STATUS = {
  planned: { label: "Not Started", color: GREY },
  active: { label: "In Progress", color: BLUE },
  hold: { label: "On Hold", color: AMBER },
  review: { label: "In Review", color: PURPLE },
} as const;
type StatusKey = keyof typeof STATUS;

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

const BoardIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <rect x="3.6" y="5" width="4.7" height="14" rx="1.5" />
    <rect x="9.65" y="5" width="4.7" height="9.3" rx="1.5" />
    <rect x="15.7" y="5" width="4.7" height="11" rx="1.5" />
  </svg>
);
const RowsIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.2" />
    <path d="M3.5 9.5h17M3.5 14.5h17" />
  </svg>
);
const TimelineIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M4 6.6h9.6M4 12h13.4M4 17.4h7.2" />
  </svg>
);
const GaugeIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M4 17.4a8.4 8.4 0 1 1 16 0" />
    <path d="M12 17.4l3.8-4.6" />
  </svg>
);
const CalIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <rect x="3.6" y="5.2" width="16.8" height="15.2" rx="2.2" />
    <path d="M3.6 10h16.8M8.4 3.4v3.6M15.6 3.4v3.6" />
  </svg>
);
const FileIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M13.4 3.4H6.8a1.8 1.8 0 0 0-1.8 1.8v13.6a1.8 1.8 0 0 0 1.8 1.8h10.4a1.8 1.8 0 0 0 1.8-1.8V8.8z" />
    <path d="M13.4 3.4v5.4h5.6" />
  </svg>
);
const WalletIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M3.6 7.6a2 2 0 0 1 2-2h11.6a2 2 0 0 1 2 2v9.8a2 2 0 0 1-2 2H5.6a2 2 0 0 1-2-2z" />
    <path d="M15.4 11.6h4.8v3.4h-4.8a1.7 1.7 0 0 1 0-3.4z" />
  </svg>
);
const FolderIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M3.4 6.6a1.8 1.8 0 0 1 1.8-1.8h3.4l2 2.4h8.2a1.8 1.8 0 0 1 1.8 1.8v8.6a1.8 1.8 0 0 1-1.8 1.8H5.2a1.8 1.8 0 0 1-1.8-1.8z" />
  </svg>
);
const BuildingIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.7}>
    <rect x="4.4" y="3.4" width="15.2" height="17.2" rx="1.8" />
    <path d="M8.4 7.6h2.4M8.4 11.4h2.4M8.4 15.2h2.4M13.2 7.6h2.4M13.2 11.4h2.4M13.2 15.2h2.4" />
  </svg>
);
const CheckIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={3.2}>
    <path d="M5 12l5 5L20 7" />
  </svg>
);
const BackIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2.2}>
    <path d="M14 6l-6 6 6 6" />
  </svg>
);
const PlusIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2.4}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const StarIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M12 4l2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4-3.9 5.6-.8z" />
  </svg>
);
const ShareIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <circle cx="17.6" cy="5.8" r="2.6" />
    <circle cx="6.4" cy="12" r="2.6" />
    <circle cx="17.6" cy="18.2" r="2.6" />
    <path d="M8.7 10.8l6.6-3.6M8.7 13.2l6.6 3.6" />
  </svg>
);
const LinkIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M10.4 13.6a3.4 3.4 0 0 0 5 .3l2.6-2.6a3.4 3.4 0 0 0-4.8-4.8l-1.5 1.5" />
    <path d="M13.6 10.4a3.4 3.4 0 0 0-5-.3L6 12.7a3.4 3.4 0 0 0 4.8 4.8l1.5-1.5" />
  </svg>
);
const SendIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M20.4 3.6L10.8 13.2M20.4 3.6l-6.2 16.8-3.4-7.2-7.2-3.4z" />
  </svg>
);
const MailIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <rect x="3.2" y="5.4" width="17.6" height="13.2" rx="2.2" />
    <path d="M3.8 7l8.2 5.6L20.2 7" />
  </svg>
);
const EyeIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M2.6 12S6 5.8 12 5.8 21.4 12 21.4 12 18 18.2 12 18.2 2.6 12 2.6 12z" />
    <circle cx="12" cy="12" r="2.8" />
  </svg>
);
const XIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2.2}>
    <path d="M6.4 6.4l11.2 11.2M17.6 6.4L6.4 17.6" />
  </svg>
);
const ListIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2}>
    <path d="M4 7h3M4 12h3M4 17h3M10 7h10M10 12h10M10 17h10" />
  </svg>
);

// ---------------------------------------------------------------- people
// Act 3 says these names out loud, so every key carries one. The initials in
// the earlier acts are the same records, just rendered smaller.
const PEOPLE = {
  SL: { bg: "linear-gradient(135deg,#F49230,#D8563F)", name: "Skylar Lewis" },
  MC: { bg: "#3E7BC0", name: "Mia Castellanos" },
  DB: { bg: "#1F8A52", name: "Daniel Brooks" },
  JL: { bg: "#C9503B", name: "Jordan Lee" },
  AR: { bg: "#8A3F6D", name: "Ana Reyes" },
  TN: { bg: "#41638A", name: "Tomas Nguyen" },
} as const;

// The people the task is already shared with, and the ones it is not. Split
// rather than filtered so the order in each popover is deliberate.
const ON_TASK: PersonKey[] = ["SL", "AR", "TN"];
const OFF_TASK: PersonKey[] = ["MC", "DB", "JL"];
type PersonKey = keyof typeof PEOPLE;

function Who({ k, size = 20 }: { k: PersonKey; size?: number }) {
  return (
    <span
      className="grid flex-none place-items-center rounded-full font-bold text-white"
      style={{ background: PEOPLE[k].bg, height: size, width: size, fontSize: size * 0.4 }}
    >
      {k}
    </span>
  );
}

function Pill({ s }: { s: StatusKey }) {
  const m = STATUS[s];
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-[3px] text-[10px] font-semibold"
      style={{ background: `${m.color}1A`, color: m.color }}
    >
      <span className="h-[5px] w-[5px] flex-none rounded-full" style={{ background: m.color }} />
      {m.label}
    </span>
  );
}

// ---------------------------------------------------------------- data
type Card = { name: string; desc?: string; bar: string; tasks: number; team: PersonKey[] };

const GALLERY: Card[] = [
  { name: "Operations Queue", desc: "Delegated IT, CRM, and web requests, routed to an owner.", bar: BLUE, tasks: 214, team: ["MC", "DB"] },
  { name: "Q4 Planning", desc: "Department plans, budget review, and leadership sign-off.", bar: BLUE, tasks: 150, team: ["SL"] },
  { name: "Recurring Ops", desc: "Daily, weekly, and monthly work on a series.", bar: GREEN, tasks: 167, team: ["DB", "JL"] },
  { name: "Client Onboarding", desc: "Every new client, the same first thirty days.", bar: PURPLE, tasks: 352, team: ["AR", "SL", "TN"] },
  { name: "Sales Pipeline", desc: "Every open deal, from the first call to signature.", bar: RED, tasks: 45, team: ["MC"] },
  { name: "Annual Conference", desc: "Venue, speakers, run of show, and the day-of checklist.", bar: AMBER, tasks: 127, team: ["SL", "JL"] },
];

const LIST_ROWS: { name: string; who: PersonKey; due: string; overdue?: boolean; s: StatusKey }[] = [
  { name: "Kickoff call and scope confirmation", who: "AR", due: "Aug 28", s: "active" },
  { name: "Collect brand assets and logins", who: "SL", due: "Today", s: "active" },
  { name: "Set up their account and workspace", who: "MC", due: "Aug 21", s: "planned" },
  { name: "Countersign the agreement", who: "DB", due: "3d overdue", overdue: true, s: "review" },
  { name: "Training session with their team", who: "TN", due: "Sep 2", s: "planned" },
  { name: "Thirty-day review and handover", who: "JL", due: "Sep 9", s: "planned" },
];

const BOARD_COLS: { s: StatusKey; n: number; cards: { name: string; who: PersonKey; due: string }[] }[] = [
  {
    s: "planned",
    n: 66,
    cards: [
      { name: "Set up their account and workspace", who: "MC", due: "Aug 21" },
      { name: "Training session with their team", who: "TN", due: "Sep 2" },
      { name: "Thirty-day review and handover", who: "JL", due: "Sep 9" },
    ],
  },
  {
    s: "active",
    n: 13,
    cards: [
      { name: "Kickoff call and scope confirmation", who: "AR", due: "Aug 28" },
      { name: "Collect brand assets and logins", who: "SL", due: "Today" },
    ],
  },
  { s: "hold", n: 3, cards: [{ name: "Custom integration request", who: "JL", due: "Aug 15" }] },
  {
    s: "review",
    n: 7,
    cards: [
      { name: "Countersign the agreement", who: "DB", due: "Aug 13" },
      { name: "Welcome packet and first invoice", who: "DB", due: "Aug 22" },
    ],
  },
];

const GANTT: { name: string; who: PersonKey; start: number; span: number; color: string }[] = [
  { name: "Kickoff and scoping", who: "SL", start: 0, span: 2, color: GREEN },
  { name: "Collect assets and logins", who: "MC", start: 1, span: 2, color: BLUE },
  { name: "Account and workspace setup", who: "AR", start: 2, span: 3, color: PURPLE },
  { name: "Training sessions", who: "DB", start: 4, span: 3, color: BLUE },
  { name: "First month check-ins", who: "TN", start: 6, span: 2, color: AMBER },
  { name: "Thirty-day review", who: "JL", start: 7, span: 1, color: RED },
];
const WEEKS = ["Aug 3", "Aug 10", "Aug 17", "Aug 24", "Aug 31", "Sep 7", "Sep 14", "Sep 21"];

const TABS = [
  { k: "overview", label: "Overview", icon: GaugeIcon },
  { k: "list", label: "List", icon: RowsIcon },
  { k: "timeline", label: "Timeline", icon: TimelineIcon },
  { k: "board", label: "Board", icon: BoardIcon },
  { k: "calendar", label: "Calendar", icon: CalIcon },
  { k: "files", label: "Files", icon: FileIcon },
  { k: "budget", label: "Budget", icon: WalletIcon },
] as const;

// ---------------------------------------------------------------- component
type View = "gallery" | "list" | "board" | "timeline" | "mytasks" | "task";

// Which popover the task view is showing. Only one is ever open, which is also
// how the real thing behaves.
type Pop = null | "share" | "collab";

const ABORT = Symbol("abort");

export default function ProjectsTasksHeroTour() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<SVGSVGElement>(null);
  const rippleRef = useRef<HTMLSpanElement>(null);

  // cursor targets, live in whichever view is currently mounted
  const cardRef = useRef<HTMLDivElement>(null);
  const boardTabRef = useRef<HTMLButtonElement>(null);
  const timelineTabRef = useRef<HTMLButtonElement>(null);
  const myTasksRef = useRef<HTMLDivElement>(null);
  const checkRef = useRef<HTMLDivElement>(null);
  const chipRef = useRef<HTMLDivElement>(null);
  // act 3
  const openTaskRef = useRef<HTMLDivElement>(null);
  const shareBtnRef = useRef<HTMLDivElement>(null);
  const notifyRowRef = useRef<HTMLDivElement>(null);
  const notifyBtnRef = useRef<HTMLDivElement>(null);
  const collabBtnRef = useRef<HTMLDivElement>(null);
  const addRowRef = useRef<HTMLDivElement>(null);

  const inView = useInView(wrapRef, { once: false, margin: "-60px" });
  const reduce = useReducedMotion() ?? false;

  const [view, setView] = useState<View>("gallery");
  const [ticked, setTicked] = useState(false);
  const [done, setDone] = useState(259);
  const [bump, setBump] = useState(false);
  // act 3 state
  const [pop, setPop] = useState<Pop>(null);
  const [notifyPick, setNotifyPick] = useState<PersonKey | null>(null);
  const [notified, setNotified] = useState(false);
  const [added, setAdded] = useState<PersonKey | null>(null);
  // The whole card faded out, so the loop restarts on a fade, not a cut.
  const [dim, setDim] = useState(false);

  // ---- fluid stage with a MIN_W floor
  const [box, setBox] = useState({ w: MIN_W, scale: 1 });
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const w = e.contentRect.width;
      setBox(w < MIN_W ? { w: MIN_W, scale: w / MIN_W } : { w, scale: 1 });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const scaleRef = useRef(1);
  scaleRef.current = box.scale;

  // ---- the tour
  const gen = useRef(0);
  const pos = useRef({ x: MIN_W / 2, y: STAGE_H + 70 });

  useEffect(() => {
    if (!inView || reduce) return;
    const g = ++gen.current;
    const alive = () => g === gen.current;

    const wait = (ms: number) =>
      new Promise<void>((res, rej) => {
        setTimeout(() => (alive() ? res() : rej(ABORT)), ms);
      });

    // Every move ends by committing the final position to style.transform and
    // cancelling its animation. Leaving fill:"forwards" animations alive instead
    // stacks one per beat, and their composite ordering is what made the pointer
    // dart off and come back. Nothing here relies on a fill.
    const setCursor = (x: number, y: number) => {
      pos.current = { x, y };
      if (cursorRef.current) cursorRef.current.style.transform = `translate(${x}px,${y}px)`;
    };

    // Positions are in unscaled stage units, so divide out the CSS scale.
    const pointAt = (ref: React.RefObject<HTMLElement | null>) => {
      const stage = stageRef.current;
      const node = ref.current;
      if (!stage || !node) return pos.current;
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
      const from = pos.current;
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

    // The press keeps translate() inside every keyframe. Animating a bare scale
    // alongside a separately-animated transform is what dropped the pointer to
    // the corner mid-click.
    const click = async () => {
      const c = cursorRef.current;
      const r = rippleRef.current;
      const { x, y } = pos.current;
      const anims: Animation[] = [];
      if (r) {
        r.style.left = `${x}px`;
        r.style.top = `${y}px`;
        anims.push(
          r.animate([{ transform: "scale(.35)", opacity: 0.95 }, { transform: "scale(1.5)", opacity: 0 }], {
            duration: 440,
            easing: "ease-out",
          }),
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
            { duration: 230, easing: "ease-out" },
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

    const fade = async (to: number, dur = 260) => {
      const c = cursorRef.current;
      if (!c) return;
      const a = c.animate([{ opacity: c.style.opacity || "0" }, { opacity: `${to}` }], { duration: dur, fill: "forwards" });
      try {
        await a.finished;
      } catch {
        /* cancelled */
      }
      a.cancel();
      if (alive()) c.style.opacity = `${to}`;
    };

    // One beat: glide to the target, settle, then press it.
    const tap = async (ref: React.RefObject<HTMLElement | null>, dur = 620, hold = 240) => {
      await glide(pointAt(ref), dur);
      if (!alive()) throw ABORT;
      await wait(hold);
      await click();
      if (!alive()) throw ABORT;
    };

    const run = async () => {
      let first = true;
      for (;;) {
        // ---------------------------------------------- reset
        setView("gallery");
        setTicked(false);
        setDone(259);
        setBump(false);
        setPop(null);
        setNotifyPick(null);
        setNotified(false);
        setAdded(null);
        await fade(0, 0);
        setCursor(MIN_W / 2, STAGE_H + 70);
        if (!first) {
          // Come back behind the fade the last pass ended on, then bring the card
          // up rather than cutting to it.
          await wait(90);
          setDim(false);
          await wait(460);
        }
        first = false;

        // ---------------------------------------------- the opening fade
        await fade(1, 240);

        // ---------------------------------------------- ACT 1: the whole board
        await tap(cardRef, 780);
        setView("list");
        await wait(1150);

        await tap(boardTabRef, 600);
        setView("board");
        await wait(1250);

        await tap(timelineTabRef, 580);
        setView("timeline");
        await wait(1300);

        // ---------------------------------------------- ACT 2: the next row
        await tap(myTasksRef, 680);
        setView("mytasks");
        await wait(1000);

        await tap(checkRef, 680);
        setTicked(true);
        await wait(1150);

        // the project chip on the row they just finished carries them back
        await tap(chipRef, 600);
        setView("list");
        setDone(260);
        setBump(true);
        await wait(1500);

        // ---------------------------------------------- ACT 3: the whole team
        // Open the row that was just ticked, so the task on screen is the one
        // the viewer already watched somebody finish.
        await tap(openTaskRef, 660);
        setView("task");
        await wait(950);

        // share: the link first, because it is the thing people reach for
        await tap(shareBtnRef, 620);
        setPop("share");
        await wait(1150);

        // then the half nobody expects, notifying somebody from the same panel
        await tap(notifyRowRef, 560);
        setNotifyPick("MC");
        await wait(700);

        await tap(notifyBtnRef, 480);
        setNotified(true);
        setPop(null);
        await wait(1400);

        // collaborators: not a notification, a person added to the work
        await tap(collabBtnRef, 640);
        setPop("collab");
        await wait(1150);

        await tap(addRowRef, 560);
        setAdded("DB");
        await wait(1750);

        // Fade the card out before the loop restarts, rather than cutting.
        setDim(true);
        await fade(0, 380);
        await wait(760);
      }
    };

    run().catch((e) => {
      if (e !== ABORT) throw e;
    });

    return () => {
      gen.current++;
      cursorRef.current?.getAnimations().forEach((a) => a.cancel());
      rippleRef.current?.getAnimations().forEach((a) => a.cancel());
    };
  }, [inView, reduce]);

  // Reduced motion gets the payoff frame rather than the opening one, so the
  // static version still shows a project with real work in it.
  const shown: View = reduce ? "list" : view;
  const pct = Math.round((done / 352) * 100);

  return (
    <div ref={wrapRef} className="w-full" style={{ height: STAGE_H * box.scale }}>
      <div
        ref={stageRef}
        className="relative overflow-hidden rounded-[18px] border border-black/5 bg-white shadow-[0_28px_60px_-32px_rgba(40,30,15,0.5)] transition-opacity duration-[520ms] ease-out"
        style={{
          width: box.w,
          height: STAGE_H,
          transform: `scale(${box.scale})`,
          transformOrigin: "top left",
          opacity: dim ? 0 : 1,
        }}
      >
        {shown === "gallery" ? (
          <GalleryView cardRef={cardRef} myTasksRef={myTasksRef} />
        ) : shown === "mytasks" ? (
          <MyTasksView ticked={ticked} checkRef={checkRef} chipRef={chipRef} />
        ) : shown === "task" ? (
          <TaskView
            pop={pop}
            notifyPick={notifyPick}
            notified={notified}
            added={added}
            shareBtnRef={shareBtnRef}
            notifyRowRef={notifyRowRef}
            notifyBtnRef={notifyBtnRef}
            collabBtnRef={collabBtnRef}
            addRowRef={addRowRef}
            myTasksRef={myTasksRef}
          />
        ) : (
          <ProjectView
            tab={shown}
            done={done}
            pct={pct}
            bump={bump}
            boardTabRef={boardTabRef}
            timelineTabRef={timelineTabRef}
            myTasksRef={myTasksRef}
            openTaskRef={openTaskRef}
          />
        )}

        {/* the tools this replaces, struck out before the board appears */}

        {/* ---------------- cursor + ripple ----------------
            Same pointer the SOP HQ and Scoreboard tours use: white arrow with a
            dark outline, and an orange ring for the press. */}
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
  );
}

// ---------------------------------------------------------------- views
function TopBar({ myTasksRef }: { myTasksRef?: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div className="flex items-center gap-2.5 border-b border-[#ECEAE6] px-4 py-2.5">
      <span className="flex items-center gap-1.5 text-[12px] font-semibold text-brand-charcoal">
        <FolderIcon className="h-[14px] w-[14px]" />
        Projects
      </span>
      <span className="ml-auto flex items-center gap-2">
        <div
          ref={myTasksRef}
          className="flex items-center gap-1.5 rounded-lg border border-[#E3E0DA] bg-white px-2.5 py-1.5 text-[11.5px] font-semibold text-brand-charcoal"
        >
          <ListIcon className="h-[12px] w-[12px]" />
          My Tasks
        </div>
        <span className="flex items-center gap-1.5 rounded-lg bg-brand-ink px-2.5 py-1.5 text-[11.5px] font-semibold text-white">
          <PlusIcon className="h-[11px] w-[11px]" />
          New project
        </span>
      </span>
    </div>
  );
}

function GalleryView({
  cardRef,
  myTasksRef,
}: {
  cardRef: React.RefObject<HTMLDivElement | null>;
  myTasksRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="pt-view flex h-full flex-col">
      <TopBar myTasksRef={myTasksRef} />
      <div className="flex items-baseline gap-2.5 px-4 pt-3.5">
        <h3 className="text-[21px] font-extrabold tracking-tight text-brand-ink">Projects</h3>
        <span className="text-[11.5px] text-brand-gray">16 projects</span>
        <span className="text-[#D5D0C7]">·</span>
        <span className="text-[11.5px] text-brand-gray">2 archived</span>
      </div>
      <div className="flex items-center gap-1.5 px-4 pb-3 pt-2.5">
        {[
          { l: "All", n: 16, on: true },
          { l: "My Projects", n: 4, on: false },
          { l: "Shared with me", n: 12, on: false },
          { l: "Archived", n: 2, on: false },
        ].map((t) => (
          <span
            key={t.l}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11.5px] ${
              t.on ? "bg-brand-ink font-semibold text-white" : "font-medium text-brand-charcoal"
            }`}
          >
            {t.l}
            <span className={t.on ? "text-white/60" : "text-brand-gray"}>{t.n}</span>
          </span>
        ))}
      </div>

      <div className="grid flex-1 grid-cols-3 gap-2.5 px-4 pb-4">
        {GALLERY.map((c) => {
          const target = c.name === "Client Onboarding";
          return (
            <div
              key={c.name}
              ref={target ? cardRef : undefined}
              className="flex flex-col overflow-hidden rounded-[11px] border border-[#ECEAE6] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
            >
              <span className="h-[4px] w-full flex-none" style={{ background: c.bar }} />
              <div className="flex flex-1 flex-col p-3">
                <b className="truncate text-[13px] leading-tight text-brand-ink">{c.name}</b>
                <p className="mt-1.5 line-clamp-2 text-[10.5px] leading-snug text-brand-gray">{c.desc}</p>
                <div className="mt-auto flex items-center gap-1.5 pt-2.5">
                  <BuildingIcon className="h-[12px] w-[12px] flex-none text-brand-gray" />
                  <span className="text-[10px] text-brand-gray">Company</span>
                  <span className="text-[10px] tabular-nums text-brand-gray">{c.tasks} tasks</span>
                  <span className="ml-auto flex -space-x-1.5">
                    {c.team.map((k) => (
                      <span key={k} className="rounded-full ring-2 ring-white">
                        <Who k={k} size={18} />
                      </span>
                    ))}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProjectView({
  tab,
  done,
  pct,
  bump,
  boardTabRef,
  timelineTabRef,
  myTasksRef,
  openTaskRef,
}: {
  tab: View;
  done: number;
  pct: number;
  bump: boolean;
  boardTabRef: React.RefObject<HTMLButtonElement | null>;
  timelineTabRef: React.RefObject<HTMLButtonElement | null>;
  myTasksRef: React.RefObject<HTMLDivElement | null>;
  openTaskRef?: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="flex h-full flex-col">
      <TopBar myTasksRef={myTasksRef} />

      {/* project header */}
      <span className="block h-[4px] w-full flex-none" style={{ background: PURPLE }} />
      <div className="flex items-center gap-2.5 px-4 pb-2.5 pt-3">
        <span className="flex items-center gap-1 text-[11px] font-medium text-brand-gray">
          <BackIcon className="h-[12px] w-[12px]" />
          Back
        </span>
        <span
          className="grid h-[30px] w-[30px] flex-none place-items-center rounded-[9px] text-[13px] font-bold text-white"
          style={{ background: PURPLE }}
        >
          C
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-1.5">
            <b className="truncate text-[16px] leading-tight tracking-tight">Client Onboarding</b>
            <StarIcon className="h-[12px] w-[12px] flex-none text-[#D5D0C7]" />
          </span>
          <span className="mt-0.5 flex items-center gap-1.5 text-[10.5px] text-brand-gray">
            <BuildingIcon className="h-[11px] w-[11px]" />
            Company-wide
            <span className="text-[#D5D0C7]">·</span>
            352 tasks
          </span>
        </span>

        {/* the number act 2 comes back to move */}
        <span className="ml-auto flex flex-none items-center gap-2.5">
          <span className="text-right">
            <span className="block text-[10px] leading-none text-brand-gray">Progress</span>
            <span
              className="mt-1 block text-[13px] font-extrabold leading-none tabular-nums transition-colors duration-300"
              style={{ color: bump ? GREEN : "#33302C" }}
            >
              {done} / 352
            </span>
          </span>
          <span className="w-[92px]">
            <span className="block h-[6px] overflow-hidden rounded-full bg-[#ECE8E1]">
              <span
                className="block h-full rounded-full transition-[width] duration-700 ease-out"
                style={{ width: `${pct}%`, background: GREEN }}
              />
            </span>
            <span
              className="mt-1 block text-right text-[10px] font-bold tabular-nums transition-colors duration-300"
              style={{ color: bump ? GREEN_D : "#8C877F" }}
            >
              {pct}%
            </span>
          </span>
        </span>
      </div>

      {/* the seven tabs */}
      <div className="flex gap-1 border-b border-[#ECEAE6] px-4">
        {TABS.map((t) => {
          const Icon = t.icon;
          const on = t.k === tab;
          return (
            <button
              key={t.k}
              type="button"
              tabIndex={-1}
              ref={t.k === "board" ? boardTabRef : t.k === "timeline" ? timelineTabRef : undefined}
              className={`flex flex-none items-center gap-1.5 whitespace-nowrap border-b-2 px-2.5 py-2 text-[12px] transition-colors ${
                on ? "border-brand-ink font-bold text-brand-ink" : "border-transparent font-medium text-brand-gray"
              }`}
            >
              <Icon className="h-[13px] w-[13px]" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* keyed, so each tab's body fades up as it swaps in rather than snapping */}
      <div key={tab} className="pt-view flex-1 overflow-hidden bg-[#FBFAF8]">
        {tab === "list" && <ListBody openTaskRef={openTaskRef} />}
        {tab === "board" && <BoardBody />}
        {tab === "timeline" && <TimelineBody />}
      </div>
    </div>
  );
}

function ListBody({ openTaskRef }: { openTaskRef?: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div className="px-4 py-2.5">
      <div className="flex items-center gap-2.5 border-b border-[#ECEAE6] px-2 pb-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-brand-gray">
        <span className="min-w-0 flex-1">Name</span>
        <span className="w-[80px] flex-none">Assignee</span>
        <span className="w-[80px] flex-none">Due date</span>
        <span className="w-[96px] flex-none">Status</span>
      </div>
      <div className="flex items-center gap-1.5 bg-[#F6F4F1] px-2 py-1.5">
        <b className="text-[11px] text-brand-ink">First thirty days</b>
        <span className="text-[10px] tabular-nums text-brand-gray">(6)</span>
      </div>
      {LIST_ROWS.map((r) => (
        <div
          key={r.name}
          // Act 3 opens the row act 2 just ticked, so the task it lands on is
          // the one the viewer already watched somebody finish.
          ref={r.name === "Collect brand assets and logins" ? openTaskRef : undefined}
          className="flex items-center gap-2.5 border-b border-[#F5F2ED] px-2 py-[9px]"
        >
          <span className="h-[14px] w-[14px] flex-none rounded-full border-[1.5px] border-[#DDD8D0]" />
          <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-brand-ink">{r.name}</span>
          <span className="flex w-[80px] flex-none items-center gap-1.5">
            <Who k={r.who} size={18} />
            <span className="text-[11px] text-brand-charcoal">{r.who}</span>
          </span>
          <span
            className="w-[80px] flex-none whitespace-nowrap text-[11px] font-medium"
            style={{ color: r.overdue ? RED : "#6B6660" }}
          >
            {r.due}
          </span>
          <span className="w-[96px] flex-none">
            <Pill s={r.s} />
          </span>
        </div>
      ))}
    </div>
  );
}

function BoardBody() {
  return (
    <div className="flex gap-2.5 px-4 py-2.5">
      {BOARD_COLS.map((col) => {
        const m = STATUS[col.s];
        return (
          <div key={col.s} className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-1.5">
              <span className="h-[6px] w-[6px] flex-none rounded-full" style={{ background: m.color }} />
              <b className="truncate text-[11.5px] text-brand-ink">{m.label}</b>
              <span className="ml-auto text-[10px] tabular-nums text-brand-gray">{col.n}</span>
            </div>
            <div className="space-y-1.5">
              {col.cards.map((c) => (
                <div key={c.name} className="rounded-[9px] border border-[#ECEAE6] bg-white p-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <p className="line-clamp-2 text-[11px] font-medium leading-snug text-brand-ink">{c.name}</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="text-[9.5px] tabular-nums text-brand-gray">{c.due}</span>
                    <span className="ml-auto">
                      <Who k={c.who} size={17} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TimelineBody() {
  return (
    <div className="px-4 py-2.5">
      <div className="overflow-hidden rounded-[9px] border border-[#ECEAE6] bg-white">
        <div className="flex border-b border-[#ECEAE6] bg-[#FBFAF8]">
          <span className="w-[188px] flex-none border-r border-[#ECEAE6] px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-brand-gray">
            Task
          </span>
          <span className="flex min-w-0 flex-1">
            {WEEKS.map((w) => (
              <span
                key={w}
                className="min-w-0 flex-1 border-r border-[#F1EEE9] py-1.5 text-center text-[9px] font-semibold tabular-nums text-brand-gray last:border-r-0"
              >
                {w}
              </span>
            ))}
          </span>
        </div>
        {GANTT.map((g) => (
          <div key={g.name} className="flex items-center border-b border-[#F5F2ED] last:border-b-0">
            <span className="flex w-[188px] flex-none items-center gap-1.5 border-r border-[#ECEAE6] px-2.5 py-[7px]">
              <Who k={g.who} size={16} />
              <span className="min-w-0 truncate text-[11px] font-medium text-brand-ink">{g.name}</span>
            </span>
            <span className="relative flex min-w-0 flex-1 py-[7px]">
              {WEEKS.map((w) => (
                <span key={w} className="min-w-0 flex-1 border-r border-[#F5F2ED] last:border-r-0" />
              ))}
              <span
                className="absolute top-1/2 h-[11px] -translate-y-1/2 rounded-full"
                style={{
                  left: `${(g.start / WEEKS.length) * 100}%`,
                  width: `calc(${(g.span / WEEKS.length) * 100}% - 5px)`,
                  background: g.color,
                  marginLeft: 2.5,
                }}
              />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const MY_BUCKETS: {
  title: string;
  n: number;
  rows: { name: string; due: string; overdue?: boolean; s: StatusKey; proj: string; color: string; target?: boolean }[];
}[] = [
  {
    title: "Recently assigned",
    n: 2,
    rows: [
      { name: "Countersign the agreement", due: "3d overdue", overdue: true, s: "review", proj: "Operations Queue", color: BLUE },
      { name: "Q4 budget draft", due: "2d overdue", overdue: true, s: "active", proj: "Q4 Planning", color: BLUE },
    ],
  },
  {
    title: "Today",
    n: 2,
    rows: [
      { name: "Collect brand assets and logins", due: "Today", s: "active", proj: "Client Onboarding", color: PURPLE, target: true },
      { name: "Approve the new pricing sheet", due: "Today", s: "planned", proj: "Q4 Planning", color: BLUE },
    ],
  },
  {
    title: "This Week",
    n: 2,
    rows: [
      { name: "Set up their account and workspace", due: "Aug 21", s: "planned", proj: "Client Onboarding", color: PURPLE },
      { name: "Failsafe for the nightly sync", due: "Aug 21", s: "planned", proj: "Operations Queue", color: BLUE },
    ],
  },
];

function MyTasksView({
  ticked,
  checkRef,
  chipRef,
}: {
  ticked: boolean;
  checkRef: React.RefObject<HTMLDivElement | null>;
  chipRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="pt-view flex h-full flex-col">
      <TopBar />
      <div className="px-4 pb-2.5 pt-3.5">
        <h3 className="text-[21px] font-extrabold tracking-tight text-brand-ink">My Tasks</h3>
        <p className="mt-1 text-[11.5px] text-brand-gray">
          Your assigned tasks, grouped by when they are due.
        </p>
      </div>

      <div className="flex items-center gap-1.5 border-b border-[#ECEAE6] px-4 pb-2.5">
        <span className="flex items-center gap-0.5 rounded-lg bg-[#F1EEE9] p-0.5">
          {["List", "Board", "Calendar"].map((v) => (
            <span
              key={v}
              className={`rounded-[7px] px-2 py-1 text-[11px] ${
                v === "List" ? "bg-white font-semibold text-brand-ink shadow-sm" : "font-medium text-brand-charcoal"
              }`}
            >
              {v}
            </span>
          ))}
        </span>
      </div>

      <div className="flex-1 overflow-hidden">
        {MY_BUCKETS.map((b) => (
          <div key={b.title}>
            <div className="flex items-center gap-1.5 border-b border-[#F1EEE9] bg-[#FBFAF8] px-4 py-1.5">
              <b className="text-[11px]" style={{ color: PURPLE_D }}>
                {b.title}
              </b>
              <span className="text-[10px] tabular-nums text-brand-gray">{b.n}</span>
            </div>
            {b.rows.map((r) => {
              const off = r.target && ticked;
              return (
                <div key={r.name} className="flex items-center gap-2.5 border-b border-[#F5F2ED] px-4 py-[9px]">
                  <div
                    ref={r.target ? checkRef : undefined}
                    className="grid h-[16px] w-[16px] flex-none place-items-center rounded-full border-[1.5px] transition-colors duration-200"
                    style={
                      off
                        ? { borderColor: PURPLE, background: PURPLE }
                        : { borderColor: "#DDD8D0" }
                    }
                  >
                    {off && <CheckIcon className="pt-pop h-[9px] w-[9px] text-white" />}
                  </div>
                  <span
                    className={`min-w-0 flex-1 truncate text-[12px] transition-colors duration-200 ${
                      off ? "text-brand-gray line-through" : "font-medium text-brand-ink"
                    }`}
                  >
                    {r.name}
                  </span>
                  <span
                    className="w-[80px] flex-none whitespace-nowrap text-[11px] font-medium"
                    style={{ color: r.overdue ? RED : "#6B6660" }}
                  >
                    {r.due}
                  </span>
                  <span className="w-[96px] flex-none">
                    <Pill s={r.s} />
                  </span>
                  <div
                    ref={r.target ? chipRef : undefined}
                    className="flex w-[132px] flex-none items-center gap-1.5 rounded-full bg-[#F4F2EE] px-2 py-[3px]"
                  >
                    <span className="h-[5px] w-[5px] flex-none rounded-full" style={{ background: r.color }} />
                    <span className="truncate text-[10px] font-medium text-brand-charcoal">{r.proj}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- act 3
// The task panel, and the two popovers the client's screenshots specify: a
// share sheet carrying both a link and a notify list, and a collaborator list
// you can add somebody to. Both are anchored to the control that opens them and
// sit on z-40, above the panel and below the cursor.
//
// Everything here is presentational. What is open, who is ticked and who has
// been added are all driven from the tour's state, so nothing in this file
// decides its own timing.

function PopLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1.5 text-[8.5px] font-bold uppercase tracking-[0.13em] text-brand-gray">{children}</p>
  );
}

function PersonRow({ k, right }: { k: PersonKey; right?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-2 py-[5px]">
      <Who k={k} size={18} />
      <span className="min-w-0 flex-1 truncate text-[11px] text-brand-ink">{PEOPLE[k].name}</span>
      {right}
    </div>
  );
}

function SharePop({
  notifyPick,
  notifyRowRef,
  notifyBtnRef,
}: {
  notifyPick: PersonKey | null;
  notifyRowRef: React.RefObject<HTMLDivElement | null>;
  notifyBtnRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="pt-view absolute right-[14px] top-[102px] z-40 w-[268px] rounded-[10px] border border-black/[0.08] bg-white p-3 shadow-[0_18px_44px_-12px_rgba(30,22,10,0.34)]">
      <PopLabel>Share link</PopLabel>
      <div className="flex items-center gap-1.5">
        <span className="min-w-0 flex-1 truncate rounded-[7px] border border-[#E3E0DA] px-2 py-[6px] text-[10.5px] text-brand-charcoal">
          https://app.multiplyos.com/t/e7Kq
        </span>
        <span className="flex flex-none items-center gap-1 rounded-[7px] border border-[#E3E0DA] px-2 py-[6px] text-[10.5px] font-semibold text-brand-charcoal">
          <LinkIcon className="h-[11px] w-[11px]" />
          Copy
        </span>
      </div>

      <PopLabel>
        <span className="mt-2.5 block">Notify a teammate</span>
      </PopLabel>
      <div className="max-h-[104px] overflow-hidden rounded-[7px] border border-[#E3E0DA]">
        {OFF_TASK.concat(["AR"]).map((k) => {
          const on = notifyPick === k;
          return (
            <div
              key={k}
              ref={k === "MC" ? notifyRowRef : undefined}
              className="flex items-center gap-2 px-2 py-[6px]"
            >
              <span
                className="grid h-[12px] w-[12px] flex-none place-items-center rounded-[3px] border-[1.5px] transition-colors duration-200"
                style={{
                  borderColor: on ? PURPLE : "#DDD8D0",
                  background: on ? PURPLE : "transparent",
                }}
              >
                {on && <CheckIcon className="h-[8px] w-[8px]" style={{ color: "#fff" }} />}
              </span>
              <span className="truncate text-[11px] text-brand-ink">{PEOPLE[k].name}</span>
            </div>
          );
        })}
      </div>

      <div
        ref={notifyBtnRef}
        className="mt-2.5 flex items-center justify-center gap-1.5 rounded-[7px] py-[7px] text-[11px] font-bold text-white transition-colors duration-200"
        style={{ background: notifyPick ? PURPLE : "#A9A49B" }}
      >
        <SendIcon className="h-[11px] w-[11px]" />
        Notify
      </div>
    </div>
  );
}

function CollabPop({ added, addRowRef }: { added: PersonKey | null; addRowRef: React.RefObject<HTMLDivElement | null> }) {
  const on = added ? ON_TASK.concat(added) : ON_TASK;
  return (
    <div className="pt-view absolute right-[85px] top-[102px] z-40 w-[248px] rounded-[10px] border border-black/[0.08] bg-white p-3 shadow-[0_18px_44px_-12px_rgba(30,22,10,0.34)]">
      <PopLabel>Collaborators</PopLabel>
      <div>
        {on.map((k) => (
          <PersonRow key={k} k={k} right={<XIcon className="h-[10px] w-[10px] flex-none text-[#C4BFB6]" />} />
        ))}
      </div>
      <div className="mt-1.5 rounded-[7px] border border-[#E3E0DA] px-2 py-[6px] text-[10.5px] text-brand-gray">
        Add teammate...
      </div>
      <div className="mt-1.5 max-h-[96px] overflow-hidden rounded-[7px] border border-[#EFECE6] bg-[#FBFAF8]">
        {OFF_TASK.filter((k) => k !== added).map((k) => (
          <div key={k} ref={k === "DB" ? addRowRef : undefined}>
            <PersonRow k={k} />
          </div>
        ))}
      </div>
    </div>
  );
}

function TaskView({
  pop,
  notifyPick,
  notified,
  added,
  shareBtnRef,
  notifyRowRef,
  notifyBtnRef,
  collabBtnRef,
  addRowRef,
  myTasksRef,
}: {
  pop: Pop;
  notifyPick: PersonKey | null;
  notified: boolean;
  added: PersonKey | null;
  shareBtnRef: React.RefObject<HTMLDivElement | null>;
  notifyRowRef: React.RefObject<HTMLDivElement | null>;
  notifyBtnRef: React.RefObject<HTMLDivElement | null>;
  collabBtnRef: React.RefObject<HTMLDivElement | null>;
  addRowRef: React.RefObject<HTMLDivElement | null>;
  myTasksRef: React.RefObject<HTMLDivElement | null>;
}) {
  const team = added ? ON_TASK.concat(added) : ON_TASK;

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex items-center gap-3 py-[7px]">
      <span className="w-[74px] flex-none text-[10.5px] text-brand-gray">{label}</span>
      <span className="flex min-w-0 items-center gap-1.5">{children}</span>
    </div>
  );

  return (
    <div className="pt-view relative flex h-full flex-col">
      <TopBar myTasksRef={myTasksRef} />

      {/* task header: the collaborator stack and the share control both live
          here, which is what makes act 3 read as one panel rather than two */}
      <div className="flex items-center gap-2.5 border-b border-[#ECEAE6] px-4 py-2">
        <span className="text-[9px] font-bold uppercase tracking-[0.13em] text-brand-gray">Task</span>
        <span className="ml-auto flex items-center gap-2">
          <span ref={collabBtnRef} className="flex items-center">
            <span className="flex -space-x-1.5">
              {team.map((k) => (
                <span key={k} className="rounded-full ring-2 ring-white">
                  <Who k={k} size={20} />
                </span>
              ))}
            </span>
            <span className="ml-1 grid h-[20px] w-[20px] flex-none place-items-center rounded-full border border-dashed border-[#C4BFB6] text-brand-gray">
              <PlusIcon className="h-[10px] w-[10px]" />
            </span>
          </span>
          <span className="flex items-center gap-1.5 rounded-[7px] bg-[#F1EEE9] px-2 py-[5px] text-[10.5px] font-semibold text-brand-charcoal">
            <EyeIcon className="h-[11px] w-[11px]" />
            Following
          </span>
          <span className="grid h-[24px] w-[24px] place-items-center rounded-[7px] text-brand-charcoal">
            <MailIcon className="h-[13px] w-[13px]" />
          </span>
          <span
            ref={shareBtnRef}
            className="grid h-[24px] w-[24px] place-items-center rounded-[7px] text-brand-charcoal transition-colors duration-200"
            style={{ background: pop === "share" ? "#EDE9E2" : "transparent" }}
          >
            <ShareIcon className="h-[13px] w-[13px]" />
          </span>
        </span>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* left: the properties */}
        <div className="w-[400px] flex-none px-4 pt-3">
          <div className="flex items-center gap-2">
            <span className="grid h-[16px] w-[16px] flex-none place-items-center rounded-full" style={{ background: GREEN }}>
              <CheckIcon className="h-[10px] w-[10px]" style={{ color: "#fff" }} />
            </span>
            <b className="truncate text-[17px] leading-tight tracking-tight text-brand-ink">
              Collect brand assets and logins
            </b>
          </div>

          <div className="mt-2 divide-y divide-[#F5F2ED]">
            <Field label="Status">
              <Pill s="review" />
            </Field>
            <Field label="Assignee">
              <Who k="SL" size={18} />
              <span className="text-[11.5px] text-brand-ink">{PEOPLE.SL.name}</span>
            </Field>
            <Field label="Due date">
              <span className="flex items-center gap-1.5 rounded-[6px] border border-[#E3E0DA] px-2 py-[3px] text-[11px] text-brand-charcoal">
                <CalIcon className="h-[11px] w-[11px]" />
                Today
              </span>
            </Field>
            <Field label="Priority">
              <span
                className="rounded-[6px] px-2 py-[3px] text-[11px] font-semibold"
                style={{ background: `${AMBER}1A`, color: "#9A6413" }}
              >
                P2
              </span>
            </Field>
            <Field label="Labels">
              <span className="rounded-[6px] bg-[#EFEAF9] px-2 py-[3px] text-[11px] font-medium text-[#5B47A8]">
                Onboarding
              </span>
              <span className="rounded-[6px] bg-[#E7F1FA] px-2 py-[3px] text-[11px] font-medium text-[#2C6E9E]">
                Assets
              </span>
            </Field>
            <Field label="Project">
              <span className="flex items-center gap-1.5 rounded-[6px] border border-[#E3E0DA] px-2 py-[3px] text-[11px] text-brand-charcoal">
                <span className="h-[6px] w-[6px] flex-none rounded-full" style={{ background: PURPLE }} />
                Client Onboarding
              </span>
            </Field>
          </div>

        </div>

        {/* middle: the work. Subtasks are here rather than in the properties
            because they are the thing somebody opens a task to actually do. */}
        <div className="min-w-0 flex-1 border-l border-[#F5F2ED] px-4 pt-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-brand-gray">Description</p>
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-brand-charcoal">
            Logo files, brand colours, and admin access for the domain and the ad accounts.
            Everything the build needs before week two.
          </p>
          <p className="mt-3.5 text-[9px] font-bold uppercase tracking-[0.13em] text-brand-gray">
            Subtasks <span className="text-[#C4BFB6]">3 of 4</span>
          </p>
          <div className="mt-1.5 space-y-[7px]">
            {[
              ["Logo pack and typefaces", true],
              ["Brand colour values", true],
              ["Domain and DNS access", true],
              ["Ad account access", false],
            ].map(([label, done]) => (
              <div key={label as string} className="flex items-center gap-2">
                <span
                  className="grid h-[13px] w-[13px] flex-none place-items-center rounded-full border-[1.5px]"
                  style={{
                    borderColor: done ? GREEN : "#DDD8D0",
                    background: done ? GREEN : "transparent",
                  }}
                >
                  {done && <CheckIcon className="h-[8px] w-[8px]" style={{ color: "#fff" }} />}
                </span>
                <span
                  className="truncate text-[11.5px]"
                  style={{ color: done ? "#8C877F" : "#33302C", textDecoration: done ? "line-through" : "none" }}
                >
                  {label as string}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* right: where the work actually gets talked about */}
        <div className="w-[320px] flex-none border-l border-[#ECEAE6] bg-[#FBFAF8] px-3.5 pt-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-brand-gray">Activity</p>
          <div className="mt-2 space-y-2">
            <div className="flex gap-2">
              <Who k="AR" size={18} />
              <p className="text-[10.5px] leading-snug text-brand-charcoal">
                <b className="font-semibold text-brand-ink">Ana</b> attached the logo pack and the
                DNS credentials.
              </p>
            </div>
            <div className="flex gap-2">
              <Who k="TN" size={18} />
              <p className="text-[10.5px] leading-snug text-brand-charcoal">
                <b className="font-semibold text-brand-ink">Tomas</b> moved this to In Review.
              </p>
            </div>
            {/* the two act 3 beats leave a mark, so the panel remembers what
                just happened rather than only flashing a popover */}
            {notified && (
              <div className="pt-view flex gap-2">
                <Who k="MC" size={18} />
                <p className="text-[10.5px] leading-snug text-brand-charcoal">
                  <b className="font-semibold text-brand-ink">Mia</b> was notified.
                </p>
              </div>
            )}
            {added && (
              <div className="pt-view flex gap-2">
                <Who k={added} size={18} />
                <p className="text-[10.5px] leading-snug text-brand-charcoal">
                  <b className="font-semibold text-brand-ink">{PEOPLE[added].name.split(" ")[0]}</b>{" "}
                  was added as a collaborator.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {pop === "share" && (
        <SharePop notifyPick={notifyPick} notifyRowRef={notifyRowRef} notifyBtnRef={notifyBtnRef} />
      )}
      {pop === "collab" && <CollabPop added={added} addRowRef={addRowRef} />}
    </div>
  );
}
