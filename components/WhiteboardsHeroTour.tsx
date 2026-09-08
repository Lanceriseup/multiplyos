"use client";

// Animated hero for the Whiteboards feature page.
//
// Whiteboards is the newest module and the only one that replaces Miro. The
// help centre gives it two capabilities, "start a whiteboard" and "share and
// collaborate". The second one is the whole argument, so it is not saved for
// the end: Dana is already on the board when it opens, and her cursor never
// stops moving.
//
// Two drivers run at once, and each owns exactly one cursor:
//
//   OURS (the main loop)
//     1. the tools        a sticky lands and gets typed into, then a second one
//     2. a connector      the two are joined, so it is a map and not a pile
//     3. the pen          a freehand loop around both, because it is a whiteboard
//     4. two photos       dropped onto the board together, the way files arrive
//     5. a pinned comment left on Dana's second sticky, the async half
//
//   DANA (mateScript, concurrent)
//     already there       on the board and drifting before we touch anything
//     her first sticky    added and typed while we are still on our second
//     drifting            the whole way through, so the board is never still
//     her second sticky   the one we then comment on
//     still drifting      until our own pointer has finished
//
// Nothing but mateScript ever animates mateRef, and nothing but the main loop
// ever animates cursorRef. That split is load-bearing: two callers animating
// one element through the Web Animations API race, and the loser strands its
// cursor mid-canvas because it reads a start position that has already moved.
// mateScript hands control back with a flag the main loop awaits, rather than
// by reaching for the other cursor itself.
//
// Presence is deliberately not a beat. An infinite canvas on its own is a
// drawing app; a canvas with somebody else working on it at the same time is
// the product, and it is the reason this replaces Miro rather than a notes
// tool. The collaborator has their own colour and their own name label, the way
// presence actually renders.
//
// The comment is last and deliberately quiet. Pinned comments are the half of
// collaboration that does not need everyone in the room at once, and they are
// what turn a session into something you can come back to.
//
// The chrome is traced from the client's September 2026 screenshots: the top bar
// with its Saved pill and the presence avatar, the fourteen-tool rail down the
// left, the dot grid, the floating selection toolbar, and the minimap and zoom
// control in the bottom right corner.
//
// Same architecture as the other twelve hero tours: the board is React state,
// only the two cursors and the ripple are animated imperatively through the Web
// Animations API, and the sequence is generation-token guarded so a re-render or
// unmount cancels the in-flight tour rather than leaving orphaned timers behind.
//
// The board contents are fictional and match the other feature pages. The
// client's own screenshot has real photographs and a real teammate's name on it;
// none of that is on the public site.
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

const MIN_W = 980;
const STAGE_H = 500;
const EASE = "cubic-bezier(0.22,1,0.36,1)";

const RAIL_W = 46;
const TOPBAR_H = 42;

const INK = "#1B1A17";
const HAIR = "#ECEAE6";
const HAIR2 = "#E3E0DA";
const MUTED = "#8A867E";
const MUTED2 = "#A9A49B";
const ORANGE = "#EA7B1B";
const GREEN = "#2BA463";
const STICKY = "#FBE98A";
const STICKY_EDGE = "#F0D96A";
/** The other person on the board. Teal so it can never be read as our own. */
const MATE = "#1592AE";
const MATE_NAME = "Dana W.";

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

const Cursor = ({ className, style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24">
    <path
      d="M5.5 2.5l12.4 8.1-5.2.7 3 6.2-2.5 1.2-3-6.2-3.4 3.6z"
      fill="#fff"
      stroke={INK}
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
);
const Hand = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M8 12V6.6a1.6 1.6 0 0 1 3.2 0V12M11.2 11V5.4a1.6 1.6 0 0 1 3.2 0V12M14.4 12V7.4a1.6 1.6 0 0 1 3.2 0V14a6 6 0 0 1-6 6h-.8a5.6 5.6 0 0 1-5.6-5.6v-2a1.6 1.6 0 0 1 3.2 0" />
  </svg>
);
const Note = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M4.5 4.5h15v9.6L14.1 19.5H4.5z" />
    <path d="M19.5 14.1h-5.4v5.4" />
  </svg>
);
const TextT = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M5 5.5h14M12 5.5v13M8.6 18.5h6.8" />
  </svg>
);
const Square = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="4.6" y="4.6" width="14.8" height="14.8" rx="2" />
  </svg>
);
const Circle = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="12" cy="12" r="7.6" />
  </svg>
);
const Diamond = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 3.6L20.4 12 12 20.4 3.6 12z" />
  </svg>
);
const Connect = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M5 18.6c0-7 3.4-12 8.6-12" />
    <path d="M10.6 6.6h3.6v3.6" />
  </svg>
);
const Pen = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M3.6 20.4l4.4-1.2 10.6-10.6a2 2 0 0 0-2.8-2.8L5.2 16.4z" />
    <path d="M14 6.6l2.8 2.8" />
  </svg>
);
const Marker = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M6 16.4l7.8-7.8a2.4 2.4 0 0 1 3.4 3.4L9.4 19.8H5.6z" />
    <path d="M4.4 21.6h15" />
  </svg>
);
const Eraser = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M8.6 19.6L3.8 14.8a1.8 1.8 0 0 1 0-2.6l7.6-7.6a1.8 1.8 0 0 1 2.6 0l5.6 5.6a1.8 1.8 0 0 1 0 2.6l-7 7z" />
    <path d="M8.6 19.6h11" />
  </svg>
);
const Frame = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M8 3.6v16.8M16 3.6v16.8M3.6 8h16.8M3.6 16h16.8" />
  </svg>
);
const CommentIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M20.4 14.6a2 2 0 0 1-2 2H8l-4.4 3.8V5.4a2 2 0 0 1 2-2h12.8a2 2 0 0 1 2 2z" />
  </svg>
);
const ImageIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="3.6" y="4.6" width="16.8" height="14.8" rx="2" />
    <circle cx="9" cy="10" r="1.6" />
    <path d="M4.4 17.4l4.8-4.4 4 3.4 3-2.6 4.2 3.6" />
  </svg>
);
const Undo = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M4.6 9.4h9.8a4.6 4.6 0 0 1 0 9.2H8.6" />
    <path d="M8 5.4L4 9.4l4 4" />
  </svg>
);
const Redo = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M19.4 9.4H9.6a4.6 4.6 0 0 0 0 9.2h5.8" />
    <path d="M16 5.4l4 4-4 4" />
  </svg>
);
const Palette = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 3.6a8.4 8.4 0 1 0 0 16.8c1.2 0 1.8-.8 1.8-1.8 0-1.6 1-2.2 2.2-2.2h1.6a2.8 2.8 0 0 0 2.8-2.8A8.4 8.4 0 0 0 12 3.6z" />
    <circle cx="8.4" cy="10" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="7.8" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="15.6" cy="10" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);
const Back = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);
const Help = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="12" cy="12" r="8.6" />
    <path d="M9.8 9.4a2.2 2.2 0 1 1 3.4 1.9c-.8.5-1.2 1-1.2 1.9M12 16.6h.01" />
  </svg>
);

// The rail, in the product's order. Only three of these are ever picked by the
// tour; the rest are drawn because a two-tool whiteboard is not a whiteboard.
// (Four now, with the image tool.)
type ToolKey = "select" | "hand" | "note" | "text" | "square" | "circle" | "diamond" | "connect" | "pen" | "marker" | "eraser" | "frame" | "comment" | "image";
const TOOLS: { k: ToolKey; icon: (p: IconProps) => React.JSX.Element }[] = [
  { k: "select", icon: Cursor },
  { k: "hand", icon: Hand },
  { k: "note", icon: Note },
  { k: "text", icon: TextT },
  { k: "square", icon: Square },
  { k: "circle", icon: Circle },
  { k: "diamond", icon: Diamond },
  { k: "connect", icon: Connect },
  { k: "pen", icon: Pen },
  { k: "marker", icon: Marker },
  { k: "eraser", icon: Eraser },
  { k: "frame", icon: Frame },
  { k: "comment", icon: CommentIcon },
  { k: "image", icon: ImageIcon },
];

// ---------------------------------------------------------------- board data
// Canvas coordinates, with the origin at the canvas's own top left.
const NOTE_W = 128;
const NOTE_H = 92;

const A = { x: 150, y: 96, text: "Ship v2 in Q1" };
const B = { x: 392, y: 236, text: "Hiring plan" };
/** The one the OTHER person adds late, and the one we pin a comment to. */
const C = { x: 648, y: 120, text: "Pricing page" };
/**
 * The one the other person adds EARLY, while we are still writing our second.
 * Two contributions rather than one, because a collaborator who does a single
 * thing at the end reads as a scripted cameo instead of somebody working.
 */
const D = { x: 648, y: 262, text: "Q1 budget" };

// Where Dana drifts between her contributions, as [x, y, glide ms, hold ms].
// Hand-placed to stay in the right half of the canvas: clear of our own
// pointer's path on the left, clear of the photo strip along the bottom, and
// clear of the minimap in the bottom right corner. Two cursors that overlap
// read as one cursor glitching.
type Way = [number, number, number, number];

const MATE_WAYS_EARLY: Way[] = [
  [838, 92, 900, 460],
  [782, 168, 700, 380],
];
const MATE_WAYS_MID: Way[] = [
  [800, 246, 820, 520],
  [886, 190, 760, 480],
  [760, 402, 900, 560],
  [868, 268, 780, 520],
  [700, 214, 720, 620],
  [896, 122, 760, 660],
  [786, 336, 800, 520],
];
// After her second sticky she keeps moving, but stays low enough to sit clear
// of the comment bubble, which opens UPWARD out of C and covers y 18 to 98.
const MATE_WAYS_IDLE: Way[] = [
  [760, 306, 860, 620],
  [864, 232, 780, 660],
  [704, 372, 840, 620],
  [830, 300, 760, 640],
];

// The elbow that joins A to B, drawn as one stroke.
const LINK = `M${A.x + NOTE_W / 2} ${A.y + NOTE_H} V${B.y - 34} H${B.x + NOTE_W / 2} V${B.y}`;
const LINK_LEN = 320;

// A loose hand-drawn loop around A and B. Deliberately not an ellipse: the point
// of the pen is that it is not a shape tool.
const LOOP =
  "M108 74c118-42 372-26 420 34 44 56-18 176-110 216-96 42-286 34-336-38-46-66 8-176 26-212z";
const LOOP_LEN = 1420;

// Two photographs, dropped together the way files actually arrive on a canvas.
// The client's own screenshot has two real photos on the board; these are drawn
// instead, because putting a stock photograph on the page would imply the board
// shipped with content and a real one is not ours to publish. They read as
// placed images: rounded, shadowed, with a filename caption underneath.
const PHOTO_W = 116;
const PHOTO_H = 82;
const PHOTOS = [
  { x: 166, y: 344, name: "site-survey.jpg", sky: ["#BFE0EF", "#E9F3F7"], hill: "#7FA98C", sun: "#F5C86A" },
  { x: 298, y: 344, name: "warehouse-2.jpg", sky: ["#F3D9BE", "#FBEEDD"], hill: "#B08258", sun: "#EC9A4C" },
];

const COMMENT = "Can we hold this until the Q1 pricing review?";

// ---------------------------------------------------------------- scene
type Scene = {
  dim: boolean;
  tool: ToolKey;
  /** Ours: sticky A, then B. */
  notes: number;
  aText: string;
  bText: string;
  cText: string;
  dText: string;
  /** The one being typed into, for the caret. */
  typing: "a" | "b" | null;
  linked: boolean;
  drawn: boolean;
  /** How many of the two dropped photos have landed. */
  photos: number;
  /**
   * The collaborator is on the board. True from the first frame: she is not
   * something the tour introduces, she is already here.
   */
  mate: boolean;
  /** Hers: D first, then C. */
  mateNotes: number;
  /** Selection chrome on the collaborator's sticky. */
  selected: boolean;
  pin: boolean;
  comment: string;
  saved: boolean;
};
const BLANK: Scene = {
  dim: false,
  tool: "select",
  notes: 0,
  aText: "",
  bText: "",
  cText: "",
  dText: "",
  typing: null,
  linked: false,
  drawn: false,
  photos: 0,
  mate: true,
  mateNotes: 0,
  selected: false,
  pin: false,
  comment: "",
  saved: true,
};

// The frame shown under prefers-reduced-motion: the finished board, one shot.
const STILL: Scene = {
  ...BLANK,
  notes: 2,
  aText: A.text,
  bText: B.text,
  cText: C.text,
  dText: D.text,
  linked: true,
  drawn: true,
  photos: 2,
  mate: true,
  mateNotes: 2,
  pin: true,
  comment: COMMENT,
  tool: "select",
};

export default function WhiteboardsHeroTour() {
  const hostRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<SVGSVGElement>(null);
  const rippleRef = useRef<HTMLSpanElement>(null);
  const mateRef = useRef<HTMLDivElement>(null);

  const inView = useInView(hostRef, { margin: "-60px" });
  const reduce = useReducedMotion() ?? false;

  const [scene, setScene] = useState<Scene>(reduce ? STILL : BLANK);
  const [scaled, setScaled] = useState(false);
  const [scale, setScale] = useState(1);
  const [boxH, setBoxH] = useState<number | undefined>(undefined);

  const runRef = useRef(0);
  const scaleRef = useRef(1);
  const posRef = useRef({ x: 300, y: 120 });
  const matePosRef = useRef({ x: 980, y: 60 });

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
    const setMate = (x: number, y: number) => {
      matePosRef.current = { x, y };
      if (mateRef.current) mateRef.current.style.transform = `translate(${x}px,${y}px)`;
    };

    // Positions are in unscaled stage units, so divide out the CSS scale.
    const pointAt = (sel: string, fx = 0.5, fy = 0.5) => {
      const stage = stageRef.current;
      const node = stage?.querySelector(`[data-wb="${sel}"]`);
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
    /** A point in CANVAS coordinates, converted to stage units. */
    const canvasPt = (x: number, y: number) => ({ x: RAIL_W + x, y: TOPBAR_H + y });

    const glide = async (pt: { x: number; y: number }, dur = 620) => {
      const c = cursorRef.current;
      const from = posRef.current;
      if (!c) return;
      const a = c.animate(
        [
          { transform: `translate(${from.x}px,${from.y}px)` },
          { transform: `translate(${pt.x}px,${pt.y}px)` },
        ],
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

    const glideMate = async (pt: { x: number; y: number }, dur = 760) => {
      const m = mateRef.current;
      const from = matePosRef.current;
      if (!m) return;
      const a = m.animate(
        [
          { transform: `translate(${from.x}px,${from.y}px)` },
          { transform: `translate(${pt.x}px,${pt.y}px)` },
        ],
        { duration: dur, easing: EASE, fill: "forwards" },
      );
      try {
        await a.finished;
      } catch {
        /* cancelled */
      }
      a.cancel();
      setMate(pt.x, pt.y);
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

    const tap = async (sel: string, dur = 560) => {
      await glide(pointAt(sel), dur);
      if (!alive()) return false;
      await wait(160);
      if (!alive()) return false;
      await click();
      return alive();
    };

    const type = async (text: string, key: "aText" | "bText" | "cText" | "dText", per = 52) => {
      for (let i = 1; i <= text.length; i++) {
        if (!alive()) return;
        patch({ [key]: text.slice(0, i) } as Partial<Scene>);
        await wait(per);
      }
    };

    /** Walk a waypoint list with Dana's cursor. Only mateScript calls this. */
    const drift = async (ways: Way[]) => {
      for (const [x, y, dur, hold] of ways) {
        if (!alive()) return false;
        await glideMate(canvasPt(x, y), dur);
        if (!alive()) return false;
        await wait(hold);
      }
      return alive();
    };

    (async function loop() {
      while (alive()) {
        setScene(BLANK);
        setCursor(300, 120);
        // Dana starts ON the canvas, not off the right edge waiting to be
        // introduced. The board is already shared when the tour opens.
        setMate(canvasPt(872, 60).x, canvasPt(872, 60).y);
        await fade(1, 260);
        if (!alive()) return;

        // ---- Dana, running alongside everything below.
        //
        // mainDone lets her keep drifting for as long as our own pointer is
        // busy without having to know how long that is, and mateAddedC is how
        // she tells us her second sticky exists so we can comment on it. The
        // main loop awaits this whole script before it restarts, so there is
        // never a second copy of her animating the same element.
        let mainDone = false;
        let mateAddedC = false;
        const mateRun = (async function mateScript() {
          await wait(400);
          if (!(await drift(MATE_WAYS_EARLY))) return;

          // her first sticky, while we are still on our second
          await glideMate(canvasPt(D.x + NOTE_W / 2, D.y + NOTE_H / 2), 820);
          if (!alive()) return;
          patch({ mateNotes: 1, saved: false });
          await wait(200);
          await type(D.text, "dText", 54);
          if (!alive()) return;
          await wait(500);

          if (!(await drift(MATE_WAYS_MID))) return;

          // her second sticky, the one we pin a comment to
          await glideMate(canvasPt(C.x + NOTE_W / 2, C.y + NOTE_H / 2), 780);
          if (!alive()) return;
          patch({ mateNotes: 2 });
          await wait(200);
          await type(C.text, "cText", 56);
          if (!alive()) return;
          patch({ selected: true });
          mateAddedC = true;
          // Park clear of where the comment bubble is about to open.
          await glideMate(canvasPt(C.x + NOTE_W + 46, C.y + NOTE_H + 44), 760);

          // Still here, still moving, until we are finished.
          while (alive() && !mainDone) {
            if (!(await drift(MATE_WAYS_IDLE))) return;
          }
        })();

        await wait(420);

        // ---- 1. a sticky, and something written on it
        if (!(await tap("tool-note", 520))) return;
        patch({ tool: "note" });
        await wait(300);

        await glide(canvasPt(A.x + NOTE_W / 2, A.y + NOTE_H / 2), 640);
        if (!alive()) return;
        await click();
        patch({ notes: 1, typing: "a", tool: "select" });
        await wait(260);
        await type(A.text, "aText");
        if (!alive()) return;
        patch({ typing: null, saved: false });
        await wait(420);

        // ---- and a second one
        if (!(await tap("tool-note", 480))) return;
        patch({ tool: "note" });
        await wait(240);
        await glide(canvasPt(B.x + NOTE_W / 2, B.y + NOTE_H / 2), 600);
        if (!alive()) return;
        await click();
        patch({ notes: 2, typing: "b", tool: "select" });
        await wait(240);
        await type(B.text, "bText");
        if (!alive()) return;
        patch({ typing: null });
        await wait(400);

        // ---- 2. join them, so it is a map and not a pile
        if (!(await tap("tool-connect", 520))) return;
        patch({ tool: "connect" });
        await wait(260);
        await glide(canvasPt(A.x + NOTE_W / 2, A.y + NOTE_H), 520);
        if (!alive()) return;
        await click();
        patch({ linked: true });
        await glide(canvasPt(B.x + NOTE_W / 2, B.y), 900);
        if (!alive()) return;
        await click();
        patch({ tool: "select" });
        await wait(520);

        // ---- 3. the pen, because it is a whiteboard
        if (!(await tap("tool-pen", 520))) return;
        patch({ tool: "pen" });
        await wait(240);
        await glide(canvasPt(112, 78), 460);
        if (!alive()) return;
        patch({ drawn: true });
        // Travel roughly the loop while the stroke resolves, so the two read as
        // one gesture rather than a click and then a picture.
        await glide(canvasPt(528, 150), 620);
        await glide(canvasPt(300, 322), 620);
        await glide(canvasPt(108, 180), 560);
        if (!alive()) return;
        patch({ tool: "select" });
        await wait(560);

        // ---- 4. two photos, dropped together
        if (!(await tap("tool-image", 560))) return;
        patch({ tool: "image" });
        await wait(260);
        await glide(canvasPt(PHOTOS[0].x + PHOTO_W / 2, PHOTOS[0].y + PHOTO_H / 2), 620);
        if (!alive()) return;
        await click();
        patch({ photos: 1, tool: "select" });
        await wait(200);
        patch({ photos: 2 });
        await wait(620);

        // ---- 5. a comment on Dana's second sticky.
        //
        // She may still be typing it. Wait on her flag rather than trusting the
        // two scripts to stay in step: any tuning to a beat above would
        // otherwise send our pointer to comment on a sticky that is not there.
        while (alive() && !mateAddedC) await wait(120);
        if (!alive()) return;
        await wait(560);
        if (!(await tap("tool-comment", 620))) return;
        patch({ tool: "comment" });
        await wait(260);
        await glide(canvasPt(C.x - 14, C.y - 10), 600);
        if (!alive()) return;
        await click();
        // selected:false because the floating toolbar has had its moment, and leaving
        // it up would put two overlapping panels on one sticky.
        patch({ pin: true, selected: false, tool: "select" });
        await wait(340);
        for (let i = 1; i <= COMMENT.length; i++) {
          if (!alive()) return;
          patch({ comment: COMMENT.slice(0, i) });
          await wait(24);
        }
        if (!alive()) return;
        await wait(600);
        patch({ saved: true });
        await wait(2200);

        // Release Dana's idle drift and let it unwind before restarting, so the
        // next iteration is the only thing animating her cursor.
        mainDone = true;
        await mateRun;

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
      mateRef.current?.getAnimations().forEach((a) => a.cancel());
    };
  }, [inView, reduce]);

  // ---- render
  const noteStyle = (n: { x: number; y: number }) => ({
    left: n.x,
    top: n.y,
    width: NOTE_W,
    height: NOTE_H,
  });

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
            className="relative overflow-hidden rounded-2xl border border-black/5 bg-white transition-opacity duration-[520ms] ease-out"
            style={{
              height: STAGE_H,
              opacity: scene.dim ? 0 : 1,
              boxShadow: "0 30px 60px -30px rgba(40,30,15,0.45), 0 2px 6px -3px rgba(40,30,15,0.12)",
            }}
          >
            {/* ---------------- top bar ---------------- */}
            <div
              className="flex items-center gap-3 border-b px-3"
              style={{ height: TOPBAR_H, borderColor: HAIR, background: "#fff" }}
            >
              <span className="flex items-center gap-1.5 text-[11.5px] font-semibold" style={{ color: INK }}>
                <Back className="h-[13px] w-[13px]" style={{ color: MUTED }} />
                Boards
              </span>
              <span className="ml-2 text-[12px] font-bold tracking-tight">Q1 planning session</span>

              <span className="ml-auto flex items-center gap-2.5">
                {/* Presence: both of us, from the first frame. Dana's avatar is
                    not conditional and does not animate in, because she is not
                    arriving. The board was already shared when it opened. */}
                <span className="flex -space-x-1.5">
                  <span
                    className="grid h-[22px] w-[22px] place-items-center rounded-full text-[8.5px] font-bold text-white ring-2 ring-white"
                    style={{ background: MATE }}
                  >
                    DW
                  </span>
                  <span
                    className="grid h-[22px] w-[22px] place-items-center rounded-full text-[8.5px] font-bold text-white ring-2 ring-white"
                    style={{ background: "linear-gradient(135deg,#F49230,#D8563F)" }}
                  >
                    SL
                  </span>
                </span>
                <Palette className="h-[15px] w-[15px]" style={{ color: MUTED }} />
                <span className="flex items-center gap-1.5 text-[10.5px] font-semibold" style={{ color: MUTED }}>
                  <span
                    className="h-[6px] w-[6px] rounded-full transition-colors duration-300"
                    style={{ background: scene.saved ? GREEN : ORANGE }}
                  />
                  {scene.saved ? "Saved" : "Saving…"}
                </span>
              </span>
            </div>

            <div className="flex" style={{ height: STAGE_H - TOPBAR_H }}>
              {/* ---------------- tool rail ---------------- */}
              <div
                className="flex flex-none flex-col items-center gap-[3px] border-r py-2"
                style={{ width: RAIL_W, borderColor: HAIR, background: "#fff" }}
              >
                {TOOLS.map((t) => {
                  const on = t.k === scene.tool;
                  const Ico = t.icon;
                  return (
                    <span
                      key={t.k}
                      data-wb={`tool-${t.k}`}
                      className="grid h-[26px] w-[26px] place-items-center rounded-[7px] transition-all duration-200"
                      style={{
                        background: on ? INK : "transparent",
                        color: on ? "#fff" : MUTED,
                      }}
                    >
                      <Ico className="h-[14px] w-[14px]" />
                    </span>
                  );
                })}
                <span className="mt-auto flex flex-col items-center gap-[3px]">
                  <Undo className="h-[14px] w-[14px]" style={{ color: MUTED2 }} />
                  <Redo className="h-[14px] w-[14px]" style={{ color: MUTED2 }} />
                </span>
              </div>

              {/* ---------------- the canvas ---------------- */}
              <div
                className="relative min-w-0 flex-1 overflow-hidden"
                style={{
                  backgroundColor: "#FDFDFC",
                  backgroundImage: "radial-gradient(#DCD9D2 1px, transparent 1px)",
                  backgroundSize: "22px 22px",
                }}
              >
                {/* the freehand loop, under everything */}
                <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
                  <path
                    d={LOOP}
                    fill="none"
                    stroke={ORANGE}
                    strokeWidth={2.6}
                    strokeLinecap="round"
                    opacity={0.85}
                    style={{
                      strokeDasharray: LOOP_LEN,
                      strokeDashoffset: scene.drawn ? 0 : LOOP_LEN,
                      transition: "stroke-dashoffset 2300ms cubic-bezier(0.4,0.1,0.3,1)",
                    }}
                  />
                  {/* the connector */}
                  <defs>
                    <marker id="wb-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                      <path d="M0 0L9 5L0 10z" fill={INK} />
                    </marker>
                  </defs>
                  <path
                    d={LINK}
                    fill="none"
                    stroke={INK}
                    strokeWidth={1.6}
                    markerEnd={scene.linked ? "url(#wb-arrow)" : undefined}
                    style={{
                      strokeDasharray: LINK_LEN,
                      strokeDashoffset: scene.linked ? 0 : LINK_LEN,
                      transition: "stroke-dashoffset 820ms cubic-bezier(0.3,0.1,0.3,1)",
                    }}
                  />
                </svg>

                {/* the dropped photos */}
                {PHOTOS.map((ph, i) => (
                  <div
                    key={ph.name}
                    className="absolute z-10 transition-all duration-[340ms] ease-out"
                    style={{
                      left: ph.x,
                      top: ph.y,
                      opacity: scene.photos > i ? 1 : 0,
                      transform: scene.photos > i ? "scale(1) rotate(0deg)" : "scale(0.8) rotate(-3deg)",
                    }}
                  >
                    <div
                      className="overflow-hidden rounded-[4px] bg-white p-[3px]"
                      style={{ boxShadow: "0 8px 18px -8px rgba(40,30,15,0.45)" }}
                    >
                      <svg width={PHOTO_W} height={PHOTO_H} viewBox="0 0 116 82" className="block rounded-[2px]">
                        <defs>
                          <linearGradient id={`wb-sky-${i}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={ph.sky[0]} />
                            <stop offset="100%" stopColor={ph.sky[1]} />
                          </linearGradient>
                        </defs>
                        <rect width="116" height="82" fill={`url(#wb-sky-${i})`} />
                        <circle cx="86" cy="24" r="9" fill={ph.sun} />
                        <path d="M0 62L26 44l22 14 20-12 26 18v18H0z" fill={ph.hill} />
                        <path d="M0 72l30-12 26 10 24-8 36 12v8H0z" fill={ph.hill} opacity="0.55" />
                      </svg>
                    </div>
                    <span
                      className="mt-[3px] block truncate text-center font-mono text-[8px]"
                      style={{ width: PHOTO_W + 6, color: MUTED2 }}
                    >
                      {ph.name}
                    </span>
                  </div>
                ))}

                {/* sticky A */}
                <Sticky show={scene.notes >= 1} style={noteStyle(A)} text={scene.aText} typing={scene.typing === "a"} />
                {/* sticky B */}
                <Sticky show={scene.notes >= 2} style={noteStyle(B)} text={scene.bText} typing={scene.typing === "b"} />

                {/* Dana's two stickies, carrying her colour on their edge so
                    they are never mistaken for ours. D lands early, C late. */}
                <Sticky show={scene.mateNotes >= 1} style={noteStyle(D)} text={scene.dText} typing={false} mate />
                <Sticky
                  show={scene.mateNotes >= 2}
                  style={noteStyle(C)}
                  text={scene.cText}
                  typing={false}
                  mate
                  selected={scene.selected}
                />

                {/* the pinned comment */}
                <div
                  className="absolute z-30 transition-all duration-[320ms] ease-out"
                  style={{
                    left: C.x - 26,
                    top: C.y - 22,
                    opacity: scene.pin ? 1 : 0,
                    transform: scene.pin ? "scale(1)" : "scale(0.6)",
                  }}
                >
                  <span
                    className="grid h-[24px] w-[24px] place-items-center rounded-full rounded-bl-[4px] text-[9px] font-bold text-white"
                    style={{ background: ORANGE, boxShadow: "0 4px 10px -4px rgba(40,30,15,0.5)" }}
                  >
                    1
                  </span>
                  {scene.comment && (
                    <div
                      // Opens UPWARD: at top-0 it covered the sticky it is
                      // pinned to and the floating toolbar above it.
                      className="absolute left-[26px] top-[-80px] w-[248px] rounded-[10px] border bg-white px-3 py-2"
                      style={{ borderColor: HAIR2, boxShadow: "0 12px 28px -14px rgba(40,30,15,0.4)" }}
                    >
                      <p className="flex items-center gap-1.5 text-[10px] font-bold">
                        <span
                          className="grid h-[16px] w-[16px] place-items-center rounded-full text-[7px] font-bold text-white"
                          style={{ background: "linear-gradient(135deg,#F49230,#D8563F)" }}
                        >
                          SL
                        </span>
                        Skylar Lewis
                        <span className="ml-auto font-mono text-[8px] font-normal" style={{ color: MUTED2 }}>
                          just now
                        </span>
                      </p>
                      <p className="mt-1.5 text-[10.5px] leading-snug" style={{ color: "#3C3833" }}>
                        {scene.comment}
                        <span
                          className="ml-px inline-block h-[1.05em] w-[1.5px] align-[-0.18em]"
                          style={{ background: scene.comment.length < COMMENT.length ? INK : "transparent" }}
                        />
                      </p>
                    </div>
                  )}
                </div>

                {/* the collaborator's cursor and name flag */}
                <div
                  ref={mateRef}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-0 top-0 z-40 transition-opacity duration-300"
                  style={{
                    opacity: scene.mate ? 1 : 0,
                    // The mate travels in STAGE units like our own pointer, so
                    // it is offset back out of the canvas's own origin.
                    marginLeft: -RAIL_W,
                    marginTop: -TOPBAR_H,
                  }}
                >
                  <Cursor className="h-[22px] w-[22px]" style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.3))" }} />
                  <span
                    className="absolute left-[16px] top-[18px] whitespace-nowrap rounded-[6px] px-[6px] py-[2px] text-[9.5px] font-bold text-white"
                    style={{ background: MATE }}
                  >
                    {MATE_NAME}
                  </span>
                </div>

                {/* ---- minimap and zoom, bottom right ---- */}
                <div
                  className="absolute bottom-[46px] right-3 h-[68px] w-[104px] overflow-hidden rounded-[8px] border bg-white/90"
                  style={{ borderColor: HAIR2 }}
                >
                  <span
                    className="absolute rounded-[2px]"
                    style={{ left: 16, top: 12, width: 16, height: 11, background: "#CFCBC3" }}
                  />
                  <span
                    className="absolute rounded-[2px] transition-opacity duration-500"
                    style={{ left: 42, top: 30, width: 16, height: 11, background: "#CFCBC3", opacity: scene.notes >= 2 ? 1 : 0 }}
                  />
                  {/* Dana's two, in her colour, so the minimap shows the board
                      filling up from both sides rather than only from ours. */}
                  <span
                    className="absolute rounded-[2px] transition-opacity duration-500"
                    style={{ left: 70, top: 40, width: 16, height: 11, background: MATE, opacity: scene.mateNotes >= 1 ? 1 : 0 }}
                  />
                  <span
                    className="absolute rounded-[2px] transition-opacity duration-500"
                    style={{ left: 70, top: 15, width: 16, height: 11, background: MATE, opacity: scene.mateNotes >= 2 ? 1 : 0 }}
                  />
                  <span
                    className="absolute inset-[6px] rounded-[4px] border"
                    style={{ borderColor: ORANGE, opacity: 0.55 }}
                  />
                </div>
                <div
                  className="absolute bottom-3 right-3 flex items-center gap-2 rounded-full border bg-white px-2.5 py-1"
                  style={{ borderColor: HAIR2 }}
                >
                  <span className="text-[13px] leading-none" style={{ color: MUTED }}>
                    −
                  </span>
                  <span className="font-mono text-[10px] font-semibold tabular-nums">79%</span>
                  <span className="text-[13px] leading-none" style={{ color: MUTED }}>
                    +
                  </span>
                </div>

                {/* how it works, top right of the canvas */}
                <span
                  className="absolute right-3 top-3 flex items-center gap-1.5 text-[10.5px] font-semibold"
                  style={{ color: MUTED }}
                >
                  <Help className="h-[13px] w-[13px]" />
                  How it works
                </span>
              </div>
            </div>
          </div>

          {/* ---- our own pointer ---- */}
          <span
            ref={rippleRef}
            aria-hidden="true"
            className="pointer-events-none absolute z-[85] h-9 w-9 rounded-full opacity-0"
            style={{ background: "radial-gradient(circle, rgba(234,123,27,0.5), rgba(234,123,27,0))" }}
          />
          <svg
            ref={cursorRef}
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="pointer-events-none absolute left-0 top-0 z-[90] h-[24px] w-[24px] opacity-0"
            style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.3))" }}
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
  );
}

// ---------------------------------------------------------------- a sticky
function Sticky({
  show,
  style,
  text,
  typing,
  mate,
  selected,
}: {
  show: boolean;
  style: React.CSSProperties;
  text: string;
  typing: boolean;
  mate?: boolean;
  selected?: boolean;
}) {
  return (
    <div
      className="absolute z-20 grid place-items-center rounded-[3px] px-3 text-center transition-all duration-[300ms] ease-out"
      style={{
        ...style,
        background: STICKY,
        border: `1px solid ${mate ? MATE : STICKY_EDGE}`,
        boxShadow: selected ? `0 0 0 2px ${MATE}` : "0 6px 14px -8px rgba(40,30,15,0.35)",
        opacity: show ? 1 : 0,
        transform: show ? "scale(1)" : "scale(0.82)",
      }}
    >
      <span className="text-[12.5px] font-semibold leading-snug" style={{ color: text ? "#4A4432" : "#A79B6E" }}>
        {text || "Type something"}
        <span
          className="ml-px inline-block h-[1.05em] w-[1.5px] align-[-0.18em]"
          style={{ background: typing ? "#4A4432" : "transparent" }}
        />
      </span>

      {/* the floating toolbar the product shows on a selected object */}
      {selected && (
        <div
          className="absolute -top-[34px] left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-[8px] border bg-white px-2 py-1"
          style={{ borderColor: HAIR2, boxShadow: "0 8px 18px -10px rgba(40,30,15,0.4)" }}
        >
          {["⌃", "⌄", "🔒", "⧉"].map((g) => (
            <span key={g} className="text-[10px] leading-none" style={{ color: MUTED }}>
              {g}
            </span>
          ))}
          <span className="text-[10px] leading-none" style={{ color: "#D8563F" }}>
            ⌫
          </span>
        </div>
      )}
    </div>
  );
}
