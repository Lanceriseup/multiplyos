"use client";

// Animated hero for the Checklists feature page.
//
// The client's brief: automating and overseeing processes, consistent quality,
// then the features. The loop is built so the payoff is the sign-off, because
// that is the thing Forms cannot do and a spreadsheet cannot do either:
//
//   1. the library         19 checklists, 14 recurring, 2 due this week, Run on every row
//   2. New Checklist       the editor, and its "killer items" empty state
//   3. build it            three of the five item types, with Required and Photo
//   4. Settings            a weekly cadence, and who hears about a finished run
//   5. Run Checklist       tick, Pass, a reading
//   6. sign off            type your name, and the record is sealed
//
// Content is generalised per docs/checklists-feature-notes.md, section 7: the
// live library is one ministry's van fleet, which reads as a niche rather than
// as any business.
//
// Same architecture as the other five hero tours: the app is React state, only
// the cursor and its ripple are animated imperatively through the Web Animations
// API, and the sequence is generation-token guarded so a re-render or unmount
// cancels the in-flight tour rather than leaving orphaned timers behind.
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

const MIN_W = 980;
const STAGE_H = 500;
const EASE = "cubic-bezier(0.22,1,0.36,1)";

// Both logos already exist for the Forms page, so this needed no new artwork.
// Heights match the trims measured there: Jotform fills 76% of its canvas,
// Google Forms 74%.

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

const ClipIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <rect x="5" y="4.2" width="14" height="16.4" rx="2.2" />
    <path d="M9 4.2V3h6v1.2" />
    <path d="M9 12.2l2 2 4-4.2" />
  </svg>
);
const CheckSq = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <rect x="4.2" y="4.2" width="15.6" height="15.6" rx="2.4" />
    <path d="M8.2 12.2l2.6 2.6 5-5.4" />
  </svg>
);
const Thumb = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M7 10.6h2.4l2.8-6a2 2 0 0 1 2.6 1.9v3.2h3.4a1.8 1.8 0 0 1 1.7 2.3l-1.6 5.6a2 2 0 0 1-1.9 1.4H7z" />
    <rect x="3.4" y="10.6" width="3.6" height="8.4" rx="1" />
  </svg>
);
const TextT = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2}>
    <path d="M5.4 6.2h13.2M12 6.2v11.6" />
  </svg>
);
const Hash = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2}>
    <path d="M9 4.4L7.4 19.6M16.6 4.4L15 19.6M4.4 9h15.2M3.8 15h15.2" />
  </svg>
);
const Heading = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2}>
    <path d="M5.4 5v14M13 5v14M5.4 12H13M16.6 19v-6.4l2.6 1.6" />
  </svg>
);
const Repeat = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M4 8.4h11.6a3.4 3.4 0 0 1 3.4 3.4" />
    <path d="M6.6 5.8L4 8.4l2.6 2.6" />
    <path d="M20 15.6H8.4A3.4 3.4 0 0 1 5 12.2" />
    <path d="M17.4 18.2l2.6-2.6-2.6-2.6" />
  </svg>
);
const HistoryIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M3.6 12a8.4 8.4 0 1 0 2.6-6.1" />
    <path d="M3.4 4.6v4h4" />
    <path d="M12 7.8V12l3 1.6" />
  </svg>
);
const Bell = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M17.6 11.6a5.6 5.6 0 1 0-11.2 0c0 4.2-1.8 5.4-1.8 5.4h14.8s-1.8-1.2-1.8-5.4z" />
    <path d="M10.4 20a1.9 1.9 0 0 0 3.2 0" />
  </svg>
);
const Lock = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <rect x="4.8" y="10.4" width="14.4" height="9.8" rx="2" />
    <path d="M8.4 10.4V7.8a3.6 3.6 0 0 1 7.2 0v2.6" />
  </svg>
);
const Share = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <circle cx="17.6" cy="5.8" r="2.3" />
    <circle cx="6.4" cy="12" r="2.3" />
    <circle cx="17.6" cy="18.2" r="2.3" />
    <path d="M8.4 10.9l7.2-3.9M8.4 13.1l7.2 3.9" />
  </svg>
);
const Trash = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M4.6 6.6h14.8M9.4 6.6V4.8h5.2v1.8M6.4 6.6l1 12.6h9.2l1-12.6" />
  </svg>
);
const Play = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5.4v13.2l11-6.6z" />
  </svg>
);
const Plus = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2.4}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const ArrowLeft = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2}>
    <path d="M19.2 12H4.8M10.6 6.4L4.8 12l5.8 5.6" />
  </svg>
);
const SearchGlyph = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <circle cx="10.8" cy="10.8" r="6.4" />
    <path d="M15.6 15.6l4.4 4.4" />
  </svg>
);
const Caret = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2.2}>
    <path d="M6.4 9.6l5.6 5.2 5.6-5.2" />
  </svg>
);
const Grid = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2}>
    <rect x="4" y="4" width="6.4" height="6.4" rx="1.4" />
    <rect x="13.6" y="4" width="6.4" height="6.4" rx="1.4" />
    <rect x="4" y="13.6" width="6.4" height="6.4" rx="1.4" />
    <rect x="13.6" y="13.6" width="6.4" height="6.4" rx="1.4" />
  </svg>
);
const ListGlyph = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2}>
    <path d="M4.4 6.6h15.2M4.4 12h15.2M4.4 17.4h15.2" />
  </svg>
);
const Inbox = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M3.2 13.4h4.2l1.4 2.4h6.4l1.4-2.4h4.2" />
    <path d="M5.4 5h13.2l2.2 8.4v4A1.6 1.6 0 0 1 19.2 19H4.8a1.6 1.6 0 0 1-1.6-1.6v-4z" />
  </svg>
);
const People = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <circle cx="9.2" cy="8.4" r="3" />
    <path d="M3.6 18.6c0-2.8 2.5-4.6 5.6-4.6s5.6 1.8 5.6 4.6" />
    <path d="M16.2 6.2a3 3 0 0 1 0 5.6M17.4 14.6c1.9.6 3.2 1.9 3.2 4" />
  </svg>
);
const FolderPlus = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M3.2 6.6a1.8 1.8 0 0 1 1.8-1.8h3.7l2 2.4h7.5a1.8 1.8 0 0 1 1.8 1.8v8.4a1.8 1.8 0 0 1-1.8 1.8H5a1.8 1.8 0 0 1-1.8-1.8z" />
    <path d="M11.2 11.4v4.4M9 13.6h4.4" />
  </svg>
);
const LinkIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M10.2 13.8a3.6 3.6 0 0 0 5.4.4l2.6-2.6a3.6 3.6 0 0 0-5.1-5.1l-1.5 1.5" />
    <path d="M13.8 10.2a3.6 3.6 0 0 0-5.4-.4l-2.6 2.6a3.6 3.6 0 0 0 5.1 5.1l1.5-1.5" />
  </svg>
);
const Camera = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M3.4 8.4h3.2l1.4-2.2h7.9l1.4 2.2h3.3v10.2H3.4z" />
    <circle cx="12" cy="13.2" r="3.2" />
  </svg>
);
const NoteIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M20.4 12.6a7.4 7.4 0 0 1-7.4 7.4 8 8 0 0 1-3.3-.7L4.4 21l1.7-4.9a7.4 7.4 0 1 1 14.3-3.5z" />
  </svg>
);
const Shield = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M12 3.4l7.4 2.6v5.6c0 4.2-3 7.6-7.4 9-4.4-1.4-7.4-4.8-7.4-9V6z" />
    <path d="M8.8 12l2.2 2.2 4.2-4.4" />
  </svg>
);
const Tick = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2.6}>
    <path d="M5 12l5 5L20 7" />
  </svg>
);
const Up = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2}><path d="M12 19V5M6.4 10.6L12 5l5.6 5.6" /></svg>
);
const Down = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2}><path d="M12 5v14M6.4 13.4L12 19l5.6-5.6" /></svg>
);
const Spark = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.6 4L18 8.5 14 10l-2 4-2-4-4-1.5L10 7z" />
  </svg>
);
const Close = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2}><path d="M6.4 6.4l11.2 11.2M17.6 6.4L6.4 17.6" /></svg>
);

// ---------------------------------------------------------------- data
const BLUE = "#2E9BD6";
const GREEN = "#2BA463";

// The library, generalised into a spread of trades. The live one is twelve van
// inspections, which reads as one niche rather than as any business.
type Row = {
  title: string;
  by: string;
  date: string;
  cadence: string;
  due: string;
  soon?: boolean;
  never?: boolean;
};

const LIST: Row[] = [
  { title: "Closing Checklist", by: "Skylar", date: "Aug 21, 2026", cadence: "Repeats Daily", due: "Due today", soon: true },
  { title: "Weekly Leadership Prep", by: "Jordan", date: "Aug 21, 2026", cadence: "Repeats Weekly", due: "Due in 3d", soon: true },
  { title: "Van 3 Safety Inspection", by: "Marcus", date: "Aug 17, 2026", cadence: "Repeats Monthly", due: "Due in 20d" },
  { title: "Site Safety Walk", by: "Marcus", date: "Aug 14, 2026", cadence: "Repeats Weekly", due: "Due in 5d" },
  { title: "New Client Onboarding", by: "Priya", date: "Aug 12, 2026", cadence: "One-Off", due: "Last run Aug 10" },
  { title: "Monthly Payout Review", by: "Kath", date: "Aug 9, 2026", cadence: "Repeats Monthly", due: "Due in 12d" },
  { title: "Offsite Trip Prep", by: "Priya", date: "Aug 9, 2026", cadence: "One-Off", due: "Never run", never: true },
];

const SIDE = [
  { label: "All Checklists", icon: Inbox, n: "", on: true },
  { label: "My Checklists", icon: People, n: "4" },
  { label: "Department", icon: People, n: "6" },
  { label: "Shared with Me", icon: Share, n: "2" },
];

const TABS = [
  { l: "All Checklists", n: "" },
  { l: "Recurring", n: "14" },
  { l: "One-off", n: "5" },
  { l: "Archived", n: "2" },
];

// The five item types, exactly as the palette lists them.
const PALETTE = [
  { key: "check", label: "Check item", sub: "Tick when done", icon: CheckSq },
  { key: "pass", label: "Pass / Fail", sub: "Pass, fail, or N/A", icon: Thumb },
  { key: "text", label: "Text answer", sub: "Short written answer", icon: TextT },
  { key: "number", label: "Number", sub: "A reading or count", icon: Hash },
  { key: "section", label: "Section header", sub: "Group items (a pause point)", icon: Heading },
] as const;

type ItemKind = "check" | "pass" | "text" | "number";

const NEW_NAME = "Closing Checklist";
const COVERS = "Covers Aug 22, 2026";
const SIGNER = "Skylar Lewis";

// What the tour builds. Three of the five types, because three is enough to show
// the range and a fourth costs four seconds.
const ITEMS: { kind: ItemKind; label: string; required: boolean; photo: boolean }[] = [
  { kind: "check", label: "Front of house wiped and reset", required: true, photo: false },
  { kind: "pass", label: "Walk-in temperature within range", required: true, photo: true },
  { kind: "number", label: "Till count at close", required: false, photo: false },
];

const KIND_ICON: Record<ItemKind, (p: IconProps) => React.JSX.Element> = {
  check: CheckSq, pass: Thumb, text: TextT, number: Hash,
};

// The order the tour clicks the palette in, matched to ITEMS.
const PICKS: ItemKind[] = ["check", "pass", "number"];

// ---------------------------------------------------------------- scene
type View = "library" | "editor" | "settings" | "run";

type Scene = {
  // The whole card faded out, so the loop restarts on a fade rather than a cut.
  dim: boolean;
  view: View;
  hot: string;
  items: number; // how many of ITEMS exist
  cadence: string; // the reminder select's value
  // the run
  ticked: boolean;
  passed: boolean;
  count: string;
  signed: string;
  complete: boolean;
};

const BLANK: Scene = {
  dim: false,
  view: "library", hot: "", items: 0, cadence: "No reminder",
  ticked: false, passed: false, count: "", signed: "", complete: false,
};

// The static frame under prefers-reduced-motion: the signed run, since the
// sign-off is what the whole loop exists to reach.
const STILL: Scene = {
  ...BLANK, view: "run", items: ITEMS.length,
  ticked: true, passed: true, count: "412.60", signed: SIGNER, complete: true,
};

// ---------------------------------------------------------------- component
export default function ChecklistsHeroTour() {
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
  const [boxH, setBoxH] = useState<number | undefined>(undefined);

  const runRef = useRef(0);
  const scaleRef = useRef(1);
  const posRef = useRef({ x: 160, y: 46 });

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

    const type = async (text: string, apply: (v: string) => void, per = 58) => {
      for (let i = 1; i <= text.length; i++) {
        if (!alive()) return;
        apply(text.slice(0, i));
        await wait(per);
      }
    };

    (async function loop() {
      setCursor(160, 46);
      let first = true;
      while (alive()) {
        if (first) {
          setScene({ ...BLANK });
          first = false;
        } else {
          // Come back behind the fade the last pass ended on, then bring the card
          // up rather than cutting to it.
          setScene({ ...BLANK, dim: true });
          await wait(90);
          patch({ dim: false });
          await wait(460);
          if (!alive()) return;
        }

        // a beat before the library fades up, so the loop restarts on a breath
        await fade(1);

        // --- 1. the library: a worklist, with Run on every row
        await wait(1700);
        if (!(await tap("new-checklist", 700))) return;
        patch({ view: "editor" });
        await wait(900);

        // --- 2. build it, three of the five types
        for (let i = 0; i < ITEMS.length; i++) {
          if (!(await tap(`pal-${PICKS[i]}`, i === 0 ? 660 : 500))) return;
          patch({ items: i + 1 });
          await wait(i === ITEMS.length - 1 ? 260 : 420);
        }
        await wait(1500);

        // --- 3. Settings: a cadence, and who hears about a finished run
        if (!(await tap("stage-settings", 620))) return;
        patch({ view: "settings" });
        await wait(760);
        if (!(await tap("cadence", 560))) return;
        patch({ cadence: "Every Friday at 9:00 AM" });
        await wait(1900);

        // --- 4. run it
        if (!(await tap("run-checklist", 640))) return;
        patch({ view: "run" });
        await wait(880);

        if (!(await tap("item-0", 560))) return;
        patch({ ticked: true });
        await wait(520);

        if (!(await tap("pass", 520))) return;
        patch({ passed: true });
        await wait(560);

        // a reading, typed in
        await glide(pointAt("count"), 520);
        if (!alive()) return;
        await click();
        await type("412.60", (v) => patch({ count: v }), 74);
        if (!alive()) return;
        await wait(560);

        // --- 5. sign off. The payoff: a name, not a tickbox.
        await glide(pointAt("sign"), 540);
        if (!alive()) return;
        await click();
        await type(SIGNER, (v) => patch({ signed: v }), 62);
        if (!alive()) return;
        await wait(620);

        if (!(await tap("complete", 560))) return;
        patch({ complete: true });
        await wait(2900);

        if (!alive()) return;
        // Fade the card out before the loop restarts, rather than cutting.
        patch({ dim: true });
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
            className="relative overflow-hidden rounded-2xl border border-black/5 bg-[#FAF9F7] text-brand-ink shadow-[0_30px_60px_-30px_rgba(40,30,15,0.45),0_2px_6px_-3px_rgba(40,30,15,0.12)] transition-opacity duration-[520ms] ease-out"
            style={{ height: STAGE_H, opacity: scene.dim ? 0 : 1 }}
          >
            {scene.view === "library" && <LibraryView scene={scene} />}
            {(scene.view === "editor" || scene.view === "settings") && <EditorView scene={scene} />}
            {scene.view === "run" && <RunView scene={scene} />}


            {/* Ask Multi AI, present on every screen in the product. Not in the
                runner, which is a focused mode with its own chrome. */}
            {scene.view !== "run" && (
              <span className="pointer-events-none absolute bottom-4 right-5 z-[50] flex items-center gap-1.5 rounded-full border border-[#F7D8B4] bg-white px-3 py-1.5 text-[11px] font-semibold text-brand-ink shadow-[0_10px_22px_-10px_rgba(40,30,15,0.5)]">
                <span className="grid h-[18px] w-[18px] place-items-center rounded-full bg-gradient-to-br from-[#F49230] to-[#DE6F14] text-white">
                  <Spark className="h-[10px] w-[10px]" />
                </span>
                Ask Multi AI
              </span>
            )}
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

function TypeCaret() {
  return <span className="tour-caret" />;
}

// ---------------------------------------------------------------- view: library
// The point of this shot is that the library is a worklist, not a filing cabinet:
// a cadence, a due-in counter, and a Run button on every single row.
function LibraryView({ scene }: { scene: Scene }) {
  return (
    <div className="sop-view flex h-full flex-col px-6 pb-5 pt-5">
      <div className="flex flex-none items-start gap-3 rounded-xl border border-[#EBE7E0] bg-white px-4 py-3">
        <span
          className="grid h-[34px] w-[34px] flex-none place-items-center rounded-[10px] text-white shadow-[0_3px_8px_rgba(46,155,214,0.3)]"
          style={{ background: `linear-gradient(145deg, #4FB0E3, ${BLUE})` }}
        >
          <ClipIcon className="h-[19px] w-[19px]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[21px] font-extrabold leading-tight tracking-tight">Checklists</span>
          <span className="block text-[11.5px] leading-snug text-brand-charcoal">
            Repeatable process checklists your team runs on a schedule, with photos, sign-offs, and
            a permanent history of every run.
          </span>
          <span className="mt-2 flex items-center gap-1.5">
            {[
              { n: "19", l: "checklists", i: ClipIcon, c: "#8A857D" },
              { n: "21", l: "runs", i: HistoryIcon, c: "#8A857D" },
              { n: "14", l: "recurring", i: Repeat, c: GREEN },
              { n: "2", l: "due this week", i: Bell, c: "#C9832B" },
            ].map(({ n, l, i: Ico, c }) => (
              <span
                key={l}
                className="flex items-center gap-1.5 rounded-full border border-[#EBE7E0] bg-[#FAF9F7] px-2.5 py-[3px] text-[10px] text-brand-gray"
              >
                <Ico className="h-[11px] w-[11px]" style={{ color: c }} />
                <b className="font-bold text-brand-ink">{n}</b>
                {l}
              </span>
            ))}
          </span>
        </span>
        <span className="flex flex-none items-center gap-1.5">
          <span className="flex items-center gap-1.5 rounded-lg border border-[#E6E2DB] bg-white px-2.5 py-2 text-[11.5px] font-semibold text-brand-charcoal">
            <Lock className="h-3 w-3" />
            Permissions
          </span>
          <span
            data-t="new-checklist"
            className={`flex items-center gap-1.5 rounded-lg bg-[#16233D] px-3.5 py-2 text-[12px] font-semibold text-white transition-shadow duration-200 ${
              scene.hot === "new-checklist" ? "shadow-[0_0_0_3px_rgba(234,123,27,0.4)]" : ""
            }`}
          >
            <Plus className="h-3.5 w-3.5" />
            New Checklist
          </span>
        </span>
      </div>

      <div className="mt-3 flex flex-none items-center gap-2">
        <span className="flex items-center gap-0.5 rounded-lg bg-[#F1EEE9] p-0.5">
          {TABS.map((t, i) => (
            <span
              key={t.l}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-[7px] px-2.5 py-[5px] text-[10.5px] ${
                i === 0 ? "bg-brand-ink font-semibold text-white" : "font-medium text-brand-charcoal"
              }`}
            >
              {t.l}
              {t.n && (
                <span className={`text-[8.5px] font-bold ${i === 0 ? "text-white/70" : "text-brand-gray"}`}>
                  {t.n}
                </span>
              )}
            </span>
          ))}
        </span>
        <span className="flex h-[30px] min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#E6E2DB] bg-white px-2.5">
          <SearchGlyph className="h-3.5 w-3.5 flex-none text-brand-gray" />
          <span className="truncate text-[10.5px] text-brand-gray">Search checklists...</span>
        </span>
        <span className="flex flex-none items-center gap-1.5 rounded-lg border border-[#E6E2DB] bg-white px-2.5 py-1.5 text-[10.5px] text-brand-charcoal">
          Last activity
          <Caret className="h-2.5 w-2.5" />
        </span>
        <span className="flex flex-none items-center gap-0.5 rounded-lg border border-[#E6E2DB] bg-white p-0.5">
          <span className="grid h-[20px] w-[20px] place-items-center rounded-md bg-brand-ink text-white">
            <ListGlyph className="h-3 w-3" />
          </span>
          <span className="grid h-[20px] w-[20px] place-items-center rounded-md text-brand-gray">
            <Grid className="h-3 w-3" />
          </span>
        </span>
      </div>

      <div className="mt-3 grid min-h-0 flex-1 grid-cols-[168px_minmax(0,1fr)] gap-4">
        <div className="min-w-0">
          {SIDE.map((s) => {
            const Ico = s.icon;
            return (
              <span
                key={s.label}
                className={`mb-0.5 flex items-center gap-2 rounded-lg px-2.5 py-[7px] text-[11px] ${
                  s.on ? "bg-[#F1EEE9] font-semibold text-brand-ink" : "font-medium text-brand-charcoal"
                }`}
              >
                <Ico className="h-3.5 w-3.5 flex-none text-brand-gray" />
                <span className="min-w-0 flex-1 truncate">{s.label}</span>
                {s.n && <span className="flex-none text-[9.5px] text-brand-gray">{s.n}</span>}
              </span>
            );
          })}
          <span className="my-1.5 block h-px bg-[#EBE7E0]" />
          <span className="flex items-center gap-2 rounded-lg px-2.5 py-[7px] text-[11px] font-medium text-brand-charcoal">
            <FolderPlus className="h-3.5 w-3.5 flex-none text-brand-gray" />
            New folder
          </span>
        </div>

        <div className="min-h-0 overflow-hidden rounded-xl border border-[#EBE7E0] bg-white">
          {LIST.map((r) => {
            const once = r.cadence === "One-Off";
            return (
              <div
                key={r.title}
                className="flex items-center gap-2.5 border-b border-[#F5F2ED] px-3 py-[9px] last:border-b-0"
              >
                <span
                  className="grid h-[26px] w-[26px] flex-none place-items-center rounded-lg"
                  style={{ background: "#E4F2FB", color: BLUE }}
                >
                  <ClipIcon className="h-[14px] w-[14px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-bold leading-tight">{r.title}</span>
                  <span className="text-[9.5px] text-brand-gray">
                    Created by {r.by} <span className="text-[#C4BFB6]">·</span> Updated {r.date}
                  </span>
                </span>

                <span
                  className="flex flex-none items-center gap-1 whitespace-nowrap rounded-full px-2 py-[3px] text-[9px] font-semibold"
                  style={
                    once
                      ? { background: "#F1EEE9", color: "#6B665F" }
                      : { background: "#E4F2FB", color: "#1F6E9C" }
                  }
                >
                  {!once && <Repeat className="h-2.5 w-2.5" />}
                  {r.cadence}
                </span>

                <span className="hidden flex-none items-center gap-1 whitespace-nowrap rounded-full bg-[#F1EEE9] px-2 py-[3px] text-[9px] text-brand-charcoal min-[1000px]:flex">
                  <LinkIcon className="h-2.5 w-2.5" />
                  Inherits
                </span>

                <span
                  className="w-[92px] flex-none text-right text-[9.5px] font-semibold"
                  style={{
                    color: r.never ? "#C4BFB6" : r.soon ? "#C9832B" : "#8A857D",
                  }}
                >
                  {r.due}
                </span>

                <span
                  className="flex flex-none items-center gap-1 rounded-md border border-[#E6E2DB] px-2 py-1 text-[9.5px] font-bold"
                  style={{ color: r.never ? "#C4BFB6" : "#1F6E9C" }}
                >
                  <Play className="h-2.5 w-2.5" />
                  Run
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- the editor
const STAGES = [
  { key: "build", label: "Build", sub: "Items & sections", icon: CheckSq },
  { key: "settings", label: "Settings", sub: "Reminders & notifications", icon: Bell },
  { key: "history", label: "History", sub: "0 completed runs", icon: HistoryIcon },
];

function EditorView({ scene }: { scene: Scene }) {
  const settings = scene.view === "settings";
  const ready = scene.items > 0;

  return (
    <div className="sop-view flex h-full flex-col">
      {/* top bar */}
      <div className="flex flex-none items-center gap-2.5 border-b border-[#EBE7E0] bg-white px-4 py-2.5">
        <ArrowLeft className="h-4 w-4 flex-none text-brand-charcoal" />
        <span className="min-w-0 flex-none">
          <b className="block text-[13px] leading-tight">{NEW_NAME}</b>
          <span className="text-[9.5px] text-brand-gray">
            {scene.items} item{scene.items === 1 ? "" : "s"} &middot; 0 runs
          </span>
        </span>
        <span className="ml-auto flex flex-none items-center gap-1.5">
          {[
            { l: "Archive", i: Trash },
            { l: "Share", i: Share },
            { l: "Permissions", i: Lock },
          ].map(({ l, i: Ico }) => (
            <span
              key={l}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10.5px] font-semibold text-brand-charcoal"
            >
              <Ico className="h-3 w-3" />
              {l}
            </span>
          ))}
          <span
            data-t="run-checklist"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10.5px] font-semibold text-white transition-shadow duration-200 ${
              ready ? "bg-[#16233D]" : "bg-[#B7B2AA]"
            } ${scene.hot === "run-checklist" ? "shadow-[0_0_0_3px_rgba(234,123,27,0.4)]" : ""}`}
          >
            <Play className="h-3 w-3" />
            Run Checklist
          </span>
        </span>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* three stages, not Forms' five: no integrations, no public link */}
        <div className="w-[168px] flex-none border-r border-[#EBE7E0] bg-white p-2">
          {STAGES.map((s) => {
            const Ico = s.icon;
            const on = (s.key === "settings") === settings && s.key !== "history";
            return (
              <span
                key={s.key}
                data-t={`stage-${s.key}`}
                className={`mb-1 flex items-center gap-2 rounded-lg px-2 py-[7px] transition-all duration-200 ${
                  on ? "bg-[#16233D] text-white" : "text-brand-charcoal"
                } ${scene.hot === `stage-${s.key}` && !on ? "shadow-[0_0_0_2px_rgba(234,123,27,0.4)]" : ""}`}
              >
                <Ico className={`h-3.5 w-3.5 flex-none ${on ? "text-white" : "text-brand-gray"}`} />
                <span className="min-w-0">
                  <span className="block truncate text-[10.5px] font-semibold leading-tight">{s.label}</span>
                  <span className={`block truncate text-[8.5px] ${on ? "text-white/65" : "text-brand-gray"}`}>
                    {s.sub}
                  </span>
                </span>
              </span>
            );
          })}
        </div>

        {settings ? <SettingsPane scene={scene} /> : <BuildPane scene={scene} />}
      </div>
    </div>
  );
}

function BuildPane({ scene }: { scene: Scene }) {
  const shown = ITEMS.slice(0, scene.items);

  return (
    <>
      {/* the palette, all five types */}
      <div className="w-[196px] flex-none border-r border-[#EBE7E0] px-2.5 py-2.5">
        <p className="mb-2 flex items-center gap-1 text-[8.5px] font-bold uppercase tracking-[0.1em] text-brand-orange-dark">
          <Plus className="h-2.5 w-2.5" />
          Add to checklist
        </p>
        <div className="space-y-1.5">
          {PALETTE.map((p) => {
            const Ico = p.icon;
            const hot = scene.hot === `pal-${p.key}`;
            return (
              <span
                key={p.key}
                data-t={`pal-${p.key}`}
                className={`flex items-start gap-2 rounded-lg border bg-white px-2 py-1.5 transition-all duration-200 ${
                  hot
                    ? "border-brand-orange/60 bg-[#FFF6EC] shadow-[0_0_0_2px_rgba(234,123,27,0.2)]"
                    : "border-[#EBE7E0]"
                }`}
              >
                <span className="mt-px grid h-[19px] w-[19px] flex-none place-items-center rounded-md bg-[#F4F1EC] text-brand-charcoal">
                  <Ico className="h-3 w-3" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[10px] font-semibold leading-tight">{p.label}</span>
                  <span className="block truncate text-[8.5px] text-brand-gray">{p.sub}</span>
                </span>
              </span>
            );
          })}
        </div>
      </div>

      {/* the canvas */}
      <div className="min-w-0 flex-1 overflow-hidden px-4 py-3">
        <div className="rounded-xl border border-[#EBE7E0] bg-white px-3 py-2.5">
          <p className="text-[8.5px] font-semibold text-brand-charcoal">Checklist name</p>
          <div className="mt-1 rounded-md border border-[#E6E2DB] bg-[#FBFAF8] px-2 py-1.5 text-[11px] font-medium">
            {NEW_NAME}
          </div>
          <p className="mt-2 text-[8.5px] font-semibold text-brand-charcoal">
            Description <span className="font-normal text-brand-gray">(optional)</span>
          </p>
          <div className="mt-1 rounded-md border border-[#E6E2DB] bg-[#FBFAF8] px-2 py-1.5 text-[9.5px] leading-snug text-brand-gray">
            What process does this checklist protect, and when should it be run?
          </div>
        </div>

        {shown.length === 0 ? (
          // The best copy in the product, so it is quoted almost verbatim.
          <div className="mt-2.5 grid place-items-center rounded-xl border border-dashed border-[#DED9D0] px-6 py-5 text-center">
            <p className="text-[10.5px] leading-relaxed text-brand-gray">
              No items yet. Add the killer items, the steps that get skipped, not every step that
              exists. Aim for 5 to 9 per section.
            </p>
          </div>
        ) : (
          <div className="mt-2.5 space-y-1.5">
            {shown.map((it, i) => {
              const Ico = KIND_ICON[it.kind];
              return (
                <div
                  key={it.label}
                  className="sop-pop rounded-lg border border-[#EBE7E0] bg-white px-2.5 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex-none text-[9px] leading-none text-[#C4BFB6]">&#8942;&#8942;</span>
                    <span className="grid h-[19px] w-[19px] flex-none place-items-center rounded-md bg-[#F4F1EC] text-brand-charcoal">
                      <Ico className="h-3 w-3" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[11px] font-medium">{it.label}</span>
                    <span className="flex flex-none items-center gap-1.5 text-[#C4BFB6]">
                      <Up className="h-2.5 w-2.5" />
                      <Down className="h-2.5 w-2.5" />
                      <Trash className="h-2.5 w-2.5" />
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5 pl-[30px]">
                    <span
                      className="flex items-center gap-1 rounded-full px-1.5 py-[2px] text-[8.5px] font-semibold"
                      style={
                        it.required
                          ? { background: "#EAF7F0", color: GREEN }
                          : { background: "#F4F1EC", color: "#8A857D" }
                      }
                    >
                      {it.required ? <Tick className="h-2 w-2" /> : <Plus className="h-2 w-2" />}
                      Required
                    </span>
                    <span
                      className="flex items-center gap-1 rounded-full px-1.5 py-[2px] text-[8.5px]"
                      style={
                        it.photo
                          ? { background: "#E4F2FB", color: "#1F6E9C", fontWeight: 600 }
                          : { background: "#F4F1EC", color: "#8A857D" }
                      }
                    >
                      <Camera className="h-2 w-2" />
                      Photo
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-[#F4F1EC] px-1.5 py-[2px] text-[8.5px] text-brand-gray">
                      <NoteIcon className="h-2 w-2" />
                      Note
                    </span>
                    <span className="ml-1 text-[8.5px] text-brand-gray">+ Sub-item</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function SettingsPane({ scene }: { scene: Scene }) {
  const set = scene.cadence !== "No reminder";
  return (
    <div className="sop-view min-w-0 flex-1 overflow-hidden px-5 py-3.5">
      <div className="rounded-xl border border-[#EBE7E0] bg-white px-3.5 py-3">
        <div className="flex items-start gap-2.5">
          <span className="mt-px grid h-[22px] w-[22px] flex-none place-items-center rounded-md bg-[#E4F2FB]" style={{ color: BLUE }}>
            <Repeat className="h-3 w-3" />
          </span>
          <span className="min-w-0">
            <b className="block text-[11.5px] leading-tight">Reminders</b>
            <span className="block text-[9.5px] leading-snug text-brand-gray">
              Nudge the responsible people to run this checklist. Presets send at 9:00 AM in your
              company&rsquo;s timezone. A custom reminder sends at the exact time you pick.
            </span>
          </span>
        </div>
        <p className="mt-2.5 text-[8.5px] font-semibold text-brand-charcoal">Cadence</p>
        <div
          data-t="cadence"
          className={`mt-1 flex items-center justify-between rounded-md border bg-white px-2.5 py-1.5 text-[10.5px] transition-all duration-200 ${
            scene.hot === "cadence"
              ? "border-brand-orange/60 shadow-[0_0_0_3px_rgba(234,123,27,0.18)]"
              : "border-[#E6E2DB]"
          } ${set ? "font-semibold text-brand-ink" : "text-brand-charcoal"}`}
        >
          {scene.cadence}
          <Caret className="h-2.5 w-2.5 text-brand-gray" />
        </div>
      </div>

      <div className="mt-2.5 rounded-xl border border-[#EBE7E0] bg-white px-3.5 py-3">
        <div className="flex items-start gap-2.5">
          <span className="mt-px grid h-[22px] w-[22px] flex-none place-items-center rounded-md bg-[#EAF7F0]" style={{ color: GREEN }}>
            <Tick className="h-3 w-3" />
          </span>
          <span className="min-w-0">
            <b className="block text-[11.5px] leading-tight">When a checklist is completed</b>
            <span className="block text-[9.5px] leading-snug text-brand-gray">
              Notify people every time a run is signed off, with the results and a link to the full
              record.
            </span>
          </span>
        </div>

        <div className="mt-2.5 flex items-center gap-1.5">
          {[
            { l: "In-app notification", i: Bell },
            { l: "Email", i: NoteIcon },
          ].map(({ l, i: Ico }) => (
            <span
              key={l}
              className="flex items-center gap-1.5 rounded-lg border border-[#E6E2DB] bg-white px-2 py-1.5 text-[10px] font-semibold text-brand-charcoal"
            >
              <Ico className="h-2.5 w-2.5" />
              {l}
              <span className="rounded-full px-1.5 text-[8.5px] font-bold" style={{ background: "#EAF7F0", color: GREEN }}>
                On
              </span>
            </span>
          ))}
        </div>

        <div className="mt-2.5 grid grid-cols-2 gap-2">
          <span>
            <p className="text-[8.5px] font-semibold text-brand-charcoal">Notify team members</p>
            <span className="mt-1 flex items-center gap-1.5 rounded-md border border-[#E6E2DB] bg-[#FBFAF8] px-2 py-1.5 text-[9.5px]">
              <span className="grid h-[16px] w-[16px] place-items-center rounded bg-[#DCE6F0] text-[7.5px] font-bold text-[#41638A]">
                SL
              </span>
              Skylar Lewis
            </span>
          </span>
          <span>
            <p className="text-[8.5px] font-semibold text-brand-charcoal">
              Email people outside your organization
            </p>
            <span className="mt-1 block rounded-md border border-[#E6E2DB] bg-[#FBFAF8] px-2 py-1.5 text-[9.5px] text-brand-gray">
              safety@yourinsurer.com
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- the runner
// A focused mode, not the editor. The sign-off card is the whole reason the page
// exists, so the loop ends here and holds.
function RunView({ scene }: { scene: Scene }) {
  const done = (scene.ticked ? 1 : 0) + (scene.passed ? 1 : 0) + (scene.count ? 1 : 0);
  const pct = Math.round((done / ITEMS.length) * 100);
  const allRequired = scene.ticked && scene.passed;

  return (
    <div className="sop-view flex h-full flex-col bg-[#FAF9F7]">
      <div className="flex-none border-b border-[#EBE7E0] bg-white">
        <div className="flex items-start gap-3 px-5 py-2.5">
          <span className="min-w-0 flex-1">
            <b className="block text-[13px] leading-tight">{NEW_NAME}</b>
            <span className="text-[9.5px] text-brand-gray">{COVERS}</span>
          </span>
          <span className="flex-none text-[11px] font-semibold tabular-nums text-brand-charcoal">
            {done}/{ITEMS.length} done
          </span>
          <Close className="h-3.5 w-3.5 flex-none text-brand-gray" />
        </div>
        <span className="block h-[3px] bg-[#ECE8E1]">
          <span
            className="block h-full transition-[width] duration-500"
            style={{ width: `${pct}%`, background: "#16233D" }}
          />
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-6 py-3.5">
        <div className="mx-auto w-[520px] space-y-2">
          {/* 1. a tick */}
          <div
            data-t="item-0"
            className="flex items-center gap-2.5 rounded-lg border px-3 py-2.5 transition-colors duration-300"
            style={
              scene.ticked
                ? { background: "#F2FBF6", borderColor: "#BFE5CD" }
                : { background: "#fff", borderColor: "#EBE7E0" }
            }
          >
            <span
              className="grid h-[22px] w-[22px] flex-none place-items-center rounded-md transition-colors duration-300"
              style={
                scene.ticked
                  ? { background: GREEN, color: "#fff" }
                  : { background: "#fff", border: "1.5px solid #D5D0C7", color: "transparent" }
              }
            >
              <Tick className="h-3 w-3" />
            </span>
            <span className="text-[11.5px] font-medium">
              {ITEMS[0].label} <span style={{ color: "#D8563F" }}>*</span>
            </span>
          </div>

          {/* 2. pass, fail, or N/A */}
          <div
            className="rounded-lg border px-3 py-2.5 transition-colors duration-300"
            style={
              scene.passed
                ? { background: "#F2FBF6", borderColor: "#BFE5CD" }
                : { background: "#fff", borderColor: "#EBE7E0" }
            }
          >
            <p className="text-[11.5px] font-medium">
              {ITEMS[1].label} <span style={{ color: "#D8563F" }}>*</span>
            </p>
            <div className="mt-1.5 flex items-center gap-1.5">
              {(["Pass", "Fail", "N/A"] as const).map((l) => {
                const on = scene.passed && l === "Pass";
                const isPass = l === "Pass";
                return (
                  <span
                    key={l}
                    data-t={isPass ? "pass" : undefined}
                    className={`rounded-full border px-2.5 py-[3px] text-[10px] font-semibold transition-all duration-200 ${
                      scene.hot === "pass" && isPass && !on ? "shadow-[0_0_0_3px_rgba(234,123,27,0.2)]" : ""
                    }`}
                    style={
                      on
                        ? { background: "#EAF7F0", borderColor: "#BFE5CD", color: GREEN }
                        : { background: "#fff", borderColor: "#E6E2DB", color: "#6B665F" }
                    }
                  >
                    {l}
                  </span>
                );
              })}
              <span className="ml-1 flex items-center gap-1 text-[9px] text-brand-gray">
                <Camera className="h-2.5 w-2.5" />
                Photo required
              </span>
            </div>
          </div>

          {/* 3. a reading */}
          <div className="rounded-lg border border-[#EBE7E0] bg-white px-3 py-2.5">
            <p className="text-[11.5px] font-medium">{ITEMS[2].label}</p>
            <div
              data-t="count"
              className="mt-1.5 w-[120px] rounded-md border border-[#E6E2DB] bg-[#FBFAF8] px-2 py-1.5 text-[10.5px] tabular-nums"
            >
              {scene.count ? (
                <span className="font-semibold text-brand-ink">
                  {scene.count}
                  <TypeCaret />
                </span>
              ) : (
                <span className="text-brand-gray">0</span>
              )}
            </div>
          </div>

          {/* the sign-off, which is the point */}
          <div
            className="rounded-lg border px-3 py-2.5 transition-colors duration-300"
            style={
              scene.complete
                ? { background: "#F2FBF6", borderColor: "#BFE5CD" }
                : { background: "#fff", borderColor: "#EBE7E0" }
            }
          >
            <p className="flex items-center gap-1.5 text-[11.5px] font-bold">
              <Shield className="h-3.5 w-3.5" style={{ color: scene.complete ? GREEN : "#6B665F" }} />
              Sign off
            </p>
            <p className="mt-1 text-[9.5px] leading-snug text-brand-gray">
              Type your full name (<b className="font-semibold text-brand-charcoal">{SIGNER}</b>) to
              certify this checklist was completed as recorded. Your name, the time, and your device
              are stored with the permanent record.
            </p>
            <div
              data-t="sign"
              className="mt-1.5 rounded-md border border-[#E6E2DB] bg-[#FBFAF8] px-2.5 py-1.5 text-[11px]"
            >
              {scene.signed ? (
                <span className="font-semibold text-brand-ink">
                  {scene.signed}
                  {!scene.complete && <TypeCaret />}
                </span>
              ) : (
                <span className="text-brand-gray">{SIGNER}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-none items-center gap-3 border-t border-[#EBE7E0] bg-white px-6 py-2.5">
        {scene.complete ? (
          <span className="flex items-center gap-1.5 text-[10.5px] font-semibold" style={{ color: GREEN }}>
            <Tick className="h-3 w-3" />
            Signed by {SIGNER} &middot; 9:41 PM &middot; kept in History
          </span>
        ) : (
          <span className="text-[10.5px] text-brand-gray">
            {allRequired ? "All required items are done." : "Two items are required."}
          </span>
        )}
        <span
          data-t="complete"
          className={`ml-auto flex flex-none items-center gap-1.5 rounded-lg px-3.5 py-2 text-[11px] font-semibold text-white transition-shadow duration-200 ${
            scene.hot === "complete" ? "shadow-[0_0_0_3px_rgba(234,123,27,0.4)]" : ""
          }`}
          style={{ background: scene.signed ? GREEN : "#B7B2AA" }}
        >
          <Tick className="h-3 w-3" />
          {scene.complete ? "Completed" : "Complete Checklist"}
        </span>
      </div>
    </div>
  );
}
