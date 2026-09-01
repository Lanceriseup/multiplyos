"use client";

// Animated hero for the DISC Assessments feature page.
//
// The client asked for the main page and for a person's profile. The loop is
// those two, joined by the beat that explains the credit model without anybody
// having to read about it:
//
//   1. the assessments page   who has taken it, who has not, credits available
//   2. send an invite         pending goes up, and a credit moves to held
//   3. the Team Members tab   DISC is a column here, not a separate report
//   4. open somebody          four dimensions, scored, inside their own record
//   5. the zoom out            the plate pulls back, the nav rail is revealed,
//                              and Org Chart racks into focus beside Team
//   6. Show DISC               the chart arrives plain, then every seat gets
//                              its badge on one click
//
// The profile beat holds longest. It is the client's actual ask and the only
// frame that shows what you get for the credit.
//
// Beats 5 and 6 were added September 2026, on the client's brief: show DISC on
// the org chart, and get there the way the Team Meetings tour gets to 1on1s.
// That mechanic is copied deliberately, not reinvented: the plate pulls back to
// ZOOM and shifts right until its left edge clears the rail, the rail rows sit
// soft the whole time, and only the pair that matters racks into focus once the
// pull-back has settled. Nothing pops. See TeamMeetingsHeroTour and
// design/team-meetings-zoomout-options.html, option B.
//
// Then DISC is switched on IN the chart rather than arriving with it. The badges
// landing on a chart the viewer has already read is the beat; a chart that was
// always wearing them is just another screenshot.
//
// That beat is also the argument the other four cannot make on their own. A
// profile tells you about one person; the org chart tells you the shape of the
// whole company's behaviour, including which seats have no reading at all. Sam
// Okafor and Theo Barnes carry the grey dash, exactly as they do on the Org
// Chart page, so the coverage gap arrives by itself here too.
//
// No ActZero opening: the client is explicit that DISC replaces nothing, so
// there is nothing to cross out. Same as the CFO Analytics tour.
//
// Same architecture as the other eleven hero tours: the app is React state, only
// the cursor and its ripple are animated imperatively through the Web Animations
// API, and the sequence is generation-token guarded so a re-render or unmount
// cancels the in-flight tour rather than leaving orphaned timers behind.
//
// The team is fictional and its profiles match the badges the Org Chart page
// publishes. The screenshots are Rise Up Kings's real behavioural results, which
// is about as personal as workplace data gets, and none of it is on the public
// site. See docs/disc-feature-notes.md section 6.
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

const MIN_W = 980;
const STAGE_H = 500;
const EASE = "cubic-bezier(0.22,1,0.36,1)";

// The nav rail sits BEHIND the content plate and is only ever revealed by the
// pull-back, exactly as in TeamMeetingsHeroTour. RAIL_W and ZOOM together decide
// how far the plate has to travel: its left edge must clear the rail and its
// right edge must still fit the stage, so the shift is computed from the live
// width rather than hardcoded.
const RAIL_W = 140;
const RAIL_GAP = 14;
const ZOOM = 0.83;

// Left edge after scaling about the centre is (w - w*ZOOM)/2, so this is the
// extra translation needed to clear the rail, in pre-scale units.
function plateShift(w: number) {
  return Math.max(0, (RAIL_W + RAIL_GAP - (w * (1 - ZOOM)) / 2) / ZOOM);
}

// Rack focus. Blur is applied per row and never to the rail itself: a filter on
// a parent rasterises its children with it, so a child cannot un-blur itself
// back out of an ancestor's filter.
const SOFT = { filter: "blur(3.4px)", opacity: 0.5 };
const SHARP = { filter: "blur(0px)", opacity: 1 };
const RACK = `filter 620ms ${EASE}, opacity 620ms ${EASE}`;

const PLUM = "#8A3F6D"; // the feature's own tile colour, from the navbar
const GREEN = "#2BA463";
const AMBER = "#C9832B";

// The four dimensions, with the product's own descriptors and the same colours
// the Org Chart legend uses.
const DIMS = [
  { k: "D", label: "Dominance", c: "#D6453C", note: "Direct, decisive, results-focused" },
  { k: "I", label: "Influence", c: "#D69A28", note: "Optimistic, people-focused, persuasive" },
  { k: "S", label: "Steadiness", c: "#2BA463", note: "Patient, predictable, consistent" },
  { k: "C", label: "Compliance", c: "#2C6BA6", note: "Analytical, accurate, systematic" },
] as const;

const DIM_C: Record<string, string> = { D: "#D6453C", I: "#D69A28", S: "#2BA463", C: "#2C6BA6" };

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
const People = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="9.2" cy="8.4" r="3" />
    <path d="M3.6 18.6c0-2.8 2.5-4.6 5.6-4.6s5.6 1.8 5.6 4.6" />
    <path d="M16.2 6.2a3 3 0 0 1 0 5.6M17.4 14.6c1.9.6 3.2 1.9 3.2 4" />
  </svg>
);
const DiscIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="12" cy="12" r="8.4" />
    <path d="M12 3.6v16.8M3.6 12h16.8" />
  </svg>
);
const Doc = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M6.4 3.4h7l4.2 4.2v13H6.4z" />
    <path d="M13.4 3.4v4.2h4.2M9 12.4h6M9 16h4" />
  </svg>
);
const Down = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 4.6v11M7.4 11l4.6 4.6L16.6 11M4.4 19.4h15.2" />
  </svg>
);
const SendIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M20.4 3.6L10.6 13.4M20.4 3.6l-6.2 16.8-3.6-6.8-6.8-3.6z" />
  </svg>
);
const Pencil = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M4 20.2l.6-4L16.2 4.6a2 2 0 0 1 2.8 0l.4.4a2 2 0 0 1 0 2.8L8 19.6z" />
  </svg>
);
const Clock = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="12" cy="12" r="8.4" />
    <path d="M12 7.4V12l3 1.8" />
  </svg>
);
const Tick = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2.4}>
    <path d="M5 12l5 5L20 7" />
  </svg>
);
const Ext = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M14 4.4h5.6V10M19.6 4.4L11 13M17 13.4v5.2a1.6 1.6 0 0 1-1.6 1.6H5.4a1.6 1.6 0 0 1-1.6-1.6V8.6A1.6 1.6 0 0 1 5.4 7h5.2" />
  </svg>
);
const Home = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M3.6 10.4L12 3.8l8.4 6.6V19a1.4 1.4 0 0 1-1.4 1.4H5a1.4 1.4 0 0 1-1.4-1.4z" />
  </svg>
);
const Gauge = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M4 17.4a8.4 8.4 0 1 1 16 0" />
    <path d="M12 17.4l3.8-4.6" />
  </svg>
);
const Cal = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="3.6" y="5.2" width="16.8" height="15.2" rx="2.2" />
    <path d="M3.6 10h16.8M8.4 3.4v3.6M15.6 3.4v3.6" />
  </svg>
);
const Board = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="3.6" y="5" width="4.7" height="14" rx="1.5" />
    <rect x="9.65" y="5" width="4.7" height="9.3" rx="1.5" />
    <rect x="15.7" y="5" width="4.7" height="11" rx="1.5" />
  </svg>
);
const Tree = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="9" y="3.4" width="6" height="4.4" rx="1.2" />
    <rect x="3" y="16.2" width="6" height="4.4" rx="1.2" />
    <rect x="15" y="16.2" width="6" height="4.4" rx="1.2" />
    <path d="M12 7.8v4.2M6 16.2V12h12v4.2" />
  </svg>
);
const Close = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2.2}>
    <path d="M6.4 6.4l11.2 11.2M17.6 6.4L6.4 17.6" />
  </svg>
);
const Search = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="10.8" cy="10.8" r="6.4" />
    <path d="M15.6 15.6l4.4 4.4" />
  </svg>
);

// ---------------------------------------------------------------- data
// The profiles match the badges the Org Chart page already publishes, and in
// every row the two highest scores are the two badge letters, in order. Notes 6.
type Person = {
  name: string;
  init: string;
  role: string;
  dept: string;
  scores: { D: number; I: number; S: number; C: number } | null;
  style?: string;
  done?: string;
};

const TEAM: Person[] = [
  { name: "Skylar Lewis", init: "SL", role: "CEO", dept: "Operations", scores: { D: 68, I: 81, S: 34, C: 46 }, style: "Persuader", done: "Mar 4, 2026" },
  { name: "Dana Whitfield", init: "DW", role: "COO", dept: "Operations", scores: { D: 38, I: 41, S: 66, C: 79 }, style: "Coordinator", done: "Mar 11, 2026" },
  { name: "Marcus Hale", init: "MH", role: "Operations Manager", dept: "Operations", scores: { D: 31, I: 42, S: 78, C: 66 }, style: "Specialist", done: "Apr 2, 2026" },
  { name: "Jordan Rivera", init: "JR", role: "VP Sales", dept: "Sales", scores: { D: 71, I: 86, S: 29, C: 38 }, style: "Persuader", done: "Mar 4, 2026" },
  { name: "Priya Nair", init: "PN", role: "Marketing Lead", dept: "Marketing", scores: { D: 44, I: 77, S: 63, C: 41 }, style: "Promoter", done: "Apr 18, 2026" },
  { name: "Kath Nakamura", init: "KN", role: "Technology Lead", dept: "Technology", scores: { D: 61, I: 33, S: 40, C: 84 }, style: "Analyzer", done: "May 6, 2026" },
  { name: "Nina Petrova", init: "NP", role: "Content Lead", dept: "Marketing", scores: { D: 32, I: 64, S: 76, C: 48 }, style: "Relater", done: "Jun 2, 2026" },
  { name: "Sam Okafor", init: "SO", role: "Account Executive", dept: "Sales", scores: null },
  { name: "Theo Barnes", init: "TB", role: "Demand Gen Lead", dept: "Marketing", scores: null },
];

const DONE = TEAM.filter((p) => p.scores);
const TODO = TEAM.filter((p) => !p.scores);

// The invite goes to Sam Okafor, who is one of the two people the Org Chart page
// also shows as unassessed.
const INVITEE = TODO[0];

// The person whose profile the tour opens.
const SUBJECT = TEAM[2]; // Marcus Hale, S/C

// The workspace nav. Team is where DISC lives, Org Chart is where the tour
// goes, and those two are the pair the rack focus sharpens.
const NAV = [
  { label: "Dashboard", icon: Home },
  { label: "Scoreboards", icon: Gauge },
  { label: "Team Meetings", icon: Cal },
  { label: "Projects", icon: Board },
  { label: "Team", icon: People, key: "team" },
  { label: "Org Chart", icon: Tree, key: "org" },
];

// The same reporting lines the Org Chart page publishes, by name so the two
// pages cannot drift apart. Vacant seats are left out here: this chart exists to
// carry DISC badges, and an empty seat has nobody to have a profile.
const byName = (n: string) => TEAM.find((t) => t.name === n)!;
const ORG: { head: Person; kids: Person[] }[] = [
  { head: byName("Dana Whitfield"), kids: [byName("Marcus Hale"), byName("Kath Nakamura")] },
  { head: byName("Jordan Rivera"), kids: [byName("Sam Okafor")] },
  { head: byName("Priya Nair"), kids: [byName("Nina Petrova"), byName("Theo Barnes")] },
];
const ORG_ROOT = byName("Skylar Lewis");

// Chart geometry, same rule as the Org Chart tour: every connector is derived
// from these, so the rules cannot end up hanging in space.
const O_CARD = 132;
const O_KID = 118;
const O_KGAP = 8;
const O_GGAP = 22;
const O_STUB = 13;
const O_LINE = "#DCD7CE";

const badge = (p: Person) => {
  if (!p.scores) return null;
  const order = (Object.keys(p.scores) as (keyof typeof p.scores)[]).sort(
    (a, b) => p.scores![b] - p.scores![a],
  );
  return `${order[0]}/${order[1]}`;
};

const primary = (p: Person) => {
  const b = badge(p);
  return b ? DIM_C[b[0]] : "#A6A6A6";
};

// ---------------------------------------------------------------- scene
type Scene = {
  // The whole card faded out, so the loop restarts on a fade rather than a cut.
  dim: boolean;
  view: "disc" | "team" | "org";
  sent: boolean;
  modal: boolean;
  bars: boolean;
  hot: string;
  // The plate pulls back to reveal the rail behind it.
  zoomed: boolean;
  // and then the pair that matters racks into focus on the rail
  racked: boolean;
  // DISC is switched on inside the chart, not carried in with it
  discOn: boolean;
};

const BLANK: Scene = { view: "disc", sent: false, modal: false, bars: false, hot: "", dim: false, zoomed: false, racked: false, discOn: false };

// Under prefers-reduced-motion: the org chart with every badge on it. The
// profile was the still frame before beat 5 existed, but the chart carries the
// same claim and shows nine readings instead of one.
const STILL: Scene = { view: "org", sent: true, modal: false, bars: true, hot: "", dim: false, zoomed: false, racked: false, discOn: true };

// ---------------------------------------------------------------- component
export default function DiscHeroTour() {
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
  // Pre-scale stage width. plateShift needs it, and it is not the same as the
  // host width once the stage is floored at MIN_W and scaled down.
  const [boxW, setBoxW] = useState(MIN_W);

  const runRef = useRef(0);
  const scaleRef = useRef(1);
  const posRef = useRef({ x: 240, y: 44 });

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
      setCursor(240, 44);
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
        await fade(1);

        // --- 1. who has taken it, and who has not
        await wait(2400);

        // --- 2. send one, and watch a credit move to held
        if (!(await tap("send-invite", 720))) return;
        patch({ sent: true });
        await wait(2800);

        // --- 3. the same people, on the team tab, with DISC as a column
        if (!(await tap("tab-team", 700))) return;
        patch({ view: "team" });
        await wait(2400);

        // --- 4. and it lives inside the person's own record
        if (!(await tap("edit-row", 700))) return;
        patch({ modal: true });
        await wait(420);
        patch({ bars: true });
        await wait(4000);

        // --- 5. step back out of the record. The plate pulls back, the rail is
        //        revealed already soft, and only then does the pair rack into
        //        focus. The rack waits for the pull-back to settle so the eye
        //        tracks one thing at a time.
        if (!(await tap("profile-close", 620))) return;
        patch({ modal: false });
        await wait(520);

        patch({ zoomed: true });
        await wait(560);
        patch({ racked: true });
        await wait(760);
        if (!alive()) return;

        if (!(await tap("nav-org", 700))) return;
        patch({ view: "org", zoomed: false, racked: false });
        // let the scale settle before any rect inside the plate is measured
        await wait(880);

        // --- 6. the chart arrives plain, and DISC lands on it
        await wait(1300);
        if (!(await tap("show-disc", 660))) return;
        patch({ discOn: true });
        await wait(3600);

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
            {/* The rail sits behind the plate and is only ever seen during the
                pull-back. It is NOT inside the scaled plate, which is the whole
                trick: the one cursor target used while zoomed lives on the rail,
                so its rect still measures true and nothing has to be corrected
                for the scale. */}
            <NavRail active="team" racked={scene.racked} />

            {/* The plate. Scaling the content rather than the card keeps the
                card's own edge still, so it reads as stepping back inside the
                app rather than the panel shrinking on the page. */}
            <div
              className="absolute inset-0 flex h-full flex-col bg-[#FAF9F7] px-6 pb-5 pt-4"
              style={{
                transform: scene.zoomed
                  ? `scale(${ZOOM}) translateX(${plateShift(boxW)}px)`
                  : "none",
                transformOrigin: "center",
                transition: `transform 620ms ${EASE}, box-shadow 620ms ${EASE}, border-radius 620ms ${EASE}`,
                boxShadow: scene.zoomed ? "0 26px 54px -24px rgba(40,30,15,0.5)" : "0 0 0 rgba(0,0,0,0)",
                borderRadius: scene.zoomed ? 14 : 0,
              }}
            >
              <Tabs scene={scene} />
              <div className="mt-3 min-h-0 flex-1 overflow-hidden">
                {scene.view === "disc" ? (
                  <DiscView scene={scene} />
                ) : scene.view === "team" ? (
                  <TeamView scene={scene} />
                ) : (
                  <OrgView scene={scene} />
                )}
              </div>
            </div>

            {scene.modal && <ProfileModal scene={scene} />}

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

// ---------------------------------------------------------------- tabs
// The two tabs are the argument in miniature: DISC is a second view of your team
// list, not a separate product with its own directory.
function Tabs({ scene }: { scene: Scene }) {
  return (
    <div className="flex flex-none items-center gap-4 border-b border-[#EBE7E0]">
      {([
        { k: "team", l: "Team Members", icon: People },
        { k: "disc", l: "DISC Personality Assessments", icon: DiscIcon },
      ] as const).map(({ k, l, icon: Icon }) => {
        const on = scene.view === k;
        const key = k === "team" ? "tab-team" : undefined;
        return (
          <span
            key={k}
            data-t={key}
            className={`flex items-center gap-1.5 border-b-2 pb-2 pt-1 text-[11.5px] transition-colors ${
              on ? "font-bold" : "border-transparent font-medium text-brand-gray"
            } ${key && scene.hot === key ? "rounded-t-md bg-[#FFF6EC]" : ""}`}
            style={on ? { borderColor: PLUM, color: PLUM } : undefined}
          >
            <Icon className="h-3.5 w-3.5" />
            {l}
          </span>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------- the DISC page
function DiscView({ scene }: { scene: Scene }) {
  const pending = scene.sent ? 1 : 0;
  const notDone = TODO.length - pending;

  return (
    <div className="sop-view flex h-full gap-3">
      {/* left: status and the list */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-none items-start gap-3">
          <span className="min-w-0 flex-1">
            <h3 className="text-[19px] font-extrabold tracking-tight">DISC Personality Assessments</h3>
            <p className="mt-0.5 text-[10.5px] leading-snug text-brand-charcoal">
              See who has taken DISC, send assessments, and put behavioral insights to work in
              hiring, 1-on-1s, and team communication.
            </p>
          </span>
          <span className="flex flex-none items-center gap-1.5 rounded-lg border border-[#E6E2DB] bg-white px-2.5 py-1.5 text-[10px] font-semibold text-brand-charcoal">
            <Ext className="h-3 w-3" />
            Send Outside Organization
          </span>
        </div>

        <div className="mt-2.5 flex flex-none items-center gap-3">
          {([
            { l: "Completed", n: DONE.length, c: GREEN },
            { l: "Pending", n: pending, c: AMBER },
            { l: "Not Completed", n: notDone, c: "#A6A6A6" },
          ] as const).map((s) => (
            <span key={s.l} className="flex items-center gap-1.5 text-[10.5px] font-semibold">
              <span className="h-[7px] w-[7px] rounded-full" style={{ background: s.c }} />
              <span className="tabular-nums">{s.n}</span>
              <span className="font-normal text-brand-charcoal">{s.l}</span>
            </span>
          ))}
          <span className="ml-auto flex items-center gap-1.5 rounded-lg border border-[#E6E2DB] bg-white px-2 py-1 text-[9.5px] text-brand-gray">
            <Search className="h-2.5 w-2.5" />
            Search people
          </span>
        </div>

        {/* pending, which only exists once something is out */}
        {scene.sent && (
          <div className="sop-pop mt-2 flex-none rounded-lg border px-2.5 py-1.5" style={{ borderColor: `${AMBER}44`, background: `${AMBER}0D` }}>
            <p className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.1em]" style={{ color: AMBER }}>
              <Clock className="h-2.5 w-2.5" />
              Pending
            </p>
            <p className="mt-1 flex items-center gap-2">
              <span className="grid h-[20px] w-[20px] flex-none place-items-center rounded-full bg-[#F1EEE9] text-[7.5px] font-bold text-brand-charcoal">
                {INVITEE.init}
              </span>
              <span className="min-w-0 flex-1 truncate text-[10.5px] font-semibold">{INVITEE.name}</span>
              <span className="flex-none text-[9px] text-brand-charcoal">
                Invite sent just now <span className="text-[#C4BFB6]">&middot;</span> link open 30 days
              </span>
            </p>
          </div>
        )}

        <p className="mt-2 flex-none text-[9px] font-bold uppercase tracking-[0.1em] text-brand-gray">
          Completed <span className="font-mono normal-case tracking-normal">{DONE.length}</span>
        </p>

        <div className="mt-1 min-h-0 flex-1 overflow-hidden rounded-lg border border-[#EBE7E0] bg-white">
          {DONE.map((p) => (
            <div key={p.name} className="flex items-center gap-2 border-b border-[#F5F2ED] px-2.5 py-[7px] last:border-b-0">
              <span className="grid h-[20px] w-[20px] flex-none place-items-center rounded-full bg-[#F1EEE9] text-[7.5px] font-bold text-brand-charcoal">
                {p.init}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-[10.5px] font-semibold leading-tight">{p.name}</span>
                  <span
                    className="flex-none rounded-full px-1.5 py-px text-[8px] font-bold text-white"
                    style={{ background: primary(p) }}
                  >
                    {badge(p)}
                  </span>
                </span>
                <span className="text-[8.5px] text-brand-gray">
                  {p.style} <span className="text-[#C4BFB6]">&middot;</span> Completed {p.done}
                </span>
              </span>
              <span className="flex flex-none items-center gap-1">
                <span className="flex items-center gap-1 rounded-md border border-[#E6E2DB] px-1.5 py-[3px] text-[8.5px] font-semibold text-brand-charcoal">
                  <Doc className="h-2.5 w-2.5" />
                  View Report
                </span>
                <span className="grid h-[19px] w-[19px] place-items-center rounded-md border border-[#E6E2DB] text-brand-charcoal">
                  <Down className="h-2.5 w-2.5" />
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* right: credits, and the not-yet-taken list */}
      <div className="flex w-[248px] flex-none flex-col gap-2">
        <div className="rounded-xl border border-[#EBE7E0] bg-white p-2.5">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-brand-gray">
            Company credit pool
          </p>
          <div className="mt-1.5 grid grid-cols-2 gap-1.5">
            <span className="rounded-lg border border-[#EBE7E0] px-2 py-1.5">
              <span className="block text-[19px] font-extrabold leading-none tabular-nums transition-colors duration-300">
                {scene.sent ? 9 : 10}
              </span>
              <span className="block text-[7.5px] font-bold uppercase tracking-[0.1em] text-brand-gray">
                Available
              </span>
            </span>
            <span
              className="rounded-lg border px-2 py-1.5 transition-colors duration-300"
              style={scene.sent ? { borderColor: `${AMBER}55`, background: `${AMBER}0D` } : { borderColor: "#EBE7E0" }}
            >
              <span
                className="block text-[19px] font-extrabold leading-none tabular-nums transition-colors duration-300"
                style={{ color: scene.sent ? AMBER : "#0A0A0A" }}
              >
                {scene.sent ? 1 : 0}
              </span>
              <span className="block text-[7.5px] font-bold uppercase tracking-[0.1em] text-brand-gray">
                Held by pending
              </span>
            </span>
          </div>
          <p className="mt-1.5 text-[8.5px] leading-snug text-brand-charcoal">
            Sending holds 1 credit. Completion uses it. Cancelling, or 30 days, returns it.
          </p>
        </div>

        <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-[#EBE7E0] bg-white p-2.5">
          <p className="flex-none text-[8px] font-bold uppercase tracking-[0.12em] text-brand-gray">
            Not completed
          </p>
          <div className="mt-1.5 min-h-0 flex-1 space-y-1">
            {TODO.map((p, i) => {
              const gone = scene.sent && i === 0;
              return (
                <div
                  key={p.name}
                  className="flex items-center gap-1.5 rounded-lg border border-[#EBE7E0] px-2 py-1.5 transition-opacity duration-300"
                  style={{ opacity: gone ? 0.4 : 1 }}
                >
                  <span className="grid h-[18px] w-[18px] flex-none place-items-center rounded-full bg-[#F1EEE9] text-[7px] font-bold text-brand-charcoal">
                    {p.init}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[9.5px] font-semibold leading-tight">{p.name}</span>
                    <span className="block truncate text-[8px] text-brand-gray">{p.role}</span>
                  </span>
                  <span
                    data-t={i === 0 ? "send-invite" : undefined}
                    className={`flex flex-none items-center gap-1 rounded-md px-1.5 py-[3px] text-[8.5px] font-bold text-white transition-all duration-200 ${
                      scene.hot === "send-invite" && i === 0 ? "shadow-[0_0_0_3px_rgba(234,123,27,0.4)]" : ""
                    }`}
                    style={{ background: gone ? "#B7B2AA" : PLUM }}
                  >
                    <SendIcon className="h-2.5 w-2.5" />
                    {gone ? "Sent" : "Send"}
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

// ---------------------------------------------------------------- the team tab
function TeamView({ scene }: { scene: Scene }) {
  return (
    <div className="sop-view flex h-full flex-col">
      <div className="flex flex-none items-start gap-3">
        <span className="min-w-0 flex-1">
          <h3 className="text-[19px] font-extrabold tracking-tight">Team</h3>
          <p className="mt-0.5 text-[10.5px] text-brand-charcoal">
            Add employees and grant them access to specific scoreboards.
          </p>
        </span>
      </div>

      <div className="mt-2.5 min-h-0 flex-1 overflow-hidden rounded-lg border border-[#EBE7E0] bg-white">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#FAF9F7] text-[8px] uppercase tracking-[0.1em] text-brand-gray">
              <th className="px-3 py-1.5 font-bold">Member</th>
              <th className="px-3 py-1.5 font-bold">Role</th>
              <th className="px-3 py-1.5 font-bold">Permission</th>
              <th className="px-3 py-1.5 text-center font-bold">DISC</th>
              <th className="px-3 py-1.5 text-right font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {TEAM.map((p) => {
              const b = badge(p);
              const isSubject = p.name === SUBJECT.name;
              return (
                <tr key={p.name} className="border-t border-[#F5F2ED]">
                  <td className="px-3 py-[6px]">
                    <span className="flex items-center gap-2">
                      <span className="grid h-[20px] w-[20px] flex-none place-items-center rounded-full bg-[#F1EEE9] text-[7.5px] font-bold text-brand-charcoal">
                        {p.init}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[10px] font-semibold leading-tight">{p.name}</span>
                        <span className="block truncate text-[8px] text-brand-gray">{p.role}</span>
                      </span>
                    </span>
                  </td>
                  <td className="px-3 py-[6px]">
                    <span className="rounded-full bg-[#F1EEE9] px-1.5 py-px text-[8px] font-bold text-brand-charcoal">
                      Member
                    </span>
                  </td>
                  <td className="px-3 py-[6px] text-[9px] text-brand-charcoal">
                    {p.role === "CEO" || p.role === "COO" ? "Leadership Team" : "Team Member"}
                  </td>
                  <td className="px-3 py-[6px] text-center">
                    {b ? (
                      <span
                        className="rounded-full px-1.5 py-px text-[8px] font-bold text-white"
                        style={{ background: primary(p) }}
                      >
                        {b}
                      </span>
                    ) : (
                      <span className="text-[9px] text-[#C4BFB6]">&ndash;</span>
                    )}
                  </td>
                  <td className="px-3 py-[6px] text-right">
                    <span
                      data-t={isSubject ? "edit-row" : undefined}
                      className={`inline-flex items-center gap-1 rounded-md border border-[#E6E2DB] px-1.5 py-[3px] text-[8.5px] font-semibold text-brand-charcoal transition-all duration-200 ${
                        scene.hot === "edit-row" && isSubject ? "shadow-[0_0_0_3px_rgba(234,123,27,0.4)]" : ""
                      }`}
                    >
                      <Pencil className="h-2.5 w-2.5" />
                      Edit
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- the profile
// The client's actual ask: a person, and their DISC profile, inside their own
// record rather than in a separate report somebody has to go and find.
function ProfileModal({ scene }: { scene: Scene }) {
  const p = SUBJECT;
  return (
    <div className="absolute inset-0 z-[60] grid place-items-center bg-[rgba(24,19,12,0.42)] px-6">
      <div className="sop-view w-[430px] rounded-2xl bg-white px-5 py-4 shadow-[0_24px_60px_-18px_rgba(20,14,6,0.5)]">
        <div className="flex items-start">
          <span className="min-w-0 flex-1">
            <h4 className="text-[14.5px] font-bold tracking-tight">Edit team member</h4>
            <p className="mt-0.5 text-[10px] text-brand-charcoal">
              Update {p.name}&rsquo;s profile and permission role.
            </p>
          </span>
          <span
            data-t="profile-close"
            className="-mr-1 grid h-[22px] w-[22px] flex-none place-items-center rounded-md text-brand-gray"
          >
            <Close className="h-[13px] w-[13px]" />
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2.5 rounded-lg border border-[#EBE7E0] bg-[#FAF9F7] px-2.5 py-2">
          <span className="grid h-[30px] w-[30px] flex-none place-items-center rounded-full bg-[#F1EEE9] text-[10px] font-bold text-brand-charcoal">
            {p.init}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[11.5px] font-bold leading-tight">{p.name}</span>
            <span className="block truncate text-[9px] text-brand-gray">
              {p.role} <span className="text-[#C4BFB6]">&middot;</span> {p.dept}
            </span>
          </span>
          <span
            className="flex-none rounded-full px-2 py-px text-[9px] font-bold text-white"
            style={{ background: primary(p) }}
          >
            {badge(p)}
          </span>
        </div>

        <p className="mt-3 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-brand-gray">
          <DiscIcon className="h-2.5 w-2.5" />
          {p.name.split(" ")[0]}&rsquo;s DISC profile
        </p>

        <div className="mt-1.5 space-y-1.5">
          {DIMS.map((d, i) => {
            const v = p.scores![d.k];
            return (
              <div key={d.k}>
                <p className="flex items-center gap-1.5">
                  <span
                    className="grid h-[14px] w-[14px] flex-none place-items-center rounded-full text-[8px] font-bold text-white"
                    style={{ background: d.c }}
                  >
                    {d.k}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[10px] font-semibold">{d.label}</span>
                  <span className="flex-none font-mono text-[10.5px] font-bold tabular-nums">{v}</span>
                </p>
                <span className="mt-0.5 block h-[5px] w-full overflow-hidden rounded-full bg-[#F1EEE9]">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: scene.bars ? `${v}%` : "0%",
                      background: d.c,
                      transition: `width .8s cubic-bezier(0.22,1,0.36,1) ${i * 110}ms`,
                    }}
                  />
                </span>
                <p className="mt-0.5 pl-[19px] text-[8px] text-brand-gray">{d.note}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-2.5 flex items-center gap-1.5 rounded-lg border border-[#EBE7E0] bg-[#FAF9F7] px-2.5 py-1.5">
          <Doc className="h-3 w-3 flex-none text-brand-charcoal" />
          <span className="min-w-0 flex-1">
            <span className="block text-[9.5px] font-semibold leading-tight">View full report</span>
            <span className="block text-[8px] text-brand-gray">
              TTI Talent Insights <span className="text-[#C4BFB6]">&middot;</span> Completed {p.done}
            </span>
          </span>
          <span className="flex flex-none items-center gap-1">
            <span className="rounded-md border border-[#E6E2DB] bg-white px-1.5 py-[3px] text-[8.5px] font-semibold text-brand-charcoal">
              Allow retake
            </span>
            <span className="rounded-md border border-[#E6E2DB] bg-white px-1.5 py-[3px] text-[8.5px] font-semibold text-brand-charcoal">
              Replace
            </span>
          </span>
        </div>

        <p className="mt-2 flex items-start gap-1.5 text-[8.5px] leading-snug text-brand-gray">
          <Tick className="mt-px h-2.5 w-2.5 flex-none" style={{ color: GREEN }} />
          Already have a report from somewhere else? Replace the profile with it. That does not use a
          credit.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- the org chart
// Beat 5. The same nine profiles, arranged the way the company is, so the four
// letters stop being a per-person report and start being a picture of how the
// business is wired.
//
// The connector rule is the Org Chart tour's, unchanged: a sibling row is joined
// by a horizontal line running from the FIRST child's centre to the LAST child's
// centre, extended if it has to reach the parent, with a stub dropping from the
// parent and one rising from each child. Both ends are centres and never edges,
// so no rule can stick out past a card or stop short of one.
//
// Two people have no reading, and that is the point of showing this rather than
// a tidier chart. A grey dash on a real seat is a coverage gap somebody can act
// on, which is the same argument the Org Chart page makes with the same two
// names.

function OrgLine({ left, width }: { left: number; width: number }) {
  if (width <= 0) return null;
  return <span className="absolute h-px" style={{ left, width, top: O_STUB, background: O_LINE }} />;
}
function OrgStub({ left, from = 0 }: { left: number; from?: number }) {
  return <span className="absolute w-px" style={{ left, top: from, height: O_STUB, background: O_LINE }} />;
}

function OrgCard({ p, root, discOn }: { p: Person; root?: boolean; discOn: boolean }) {
  const b = badge(p);
  return (
    <div
      className="rounded-lg border bg-white px-2 py-1.5 shadow-[0_2px_6px_-3px_rgba(40,30,15,0.16)]"
      style={{ borderColor: "#EBE7E0", borderLeft: root ? `3px solid ${PLUM}` : undefined }}
    >
      <div className="flex items-center gap-1.5">
        <span className="grid h-[17px] w-[17px] flex-none place-items-center rounded-full bg-[#F1EEE9] text-[7px] font-bold text-brand-charcoal">
          {p.init}
        </span>
        <span className="min-w-0 flex-1 truncate text-[9.5px] font-bold leading-tight">{p.name}</span>
        {/* The badge is the whole reason this view is in the tour, so it is the
            only coloured thing on the card, and it only exists after the click.
            A seat with no reading gets a dash rather than nothing, because
            absent is a state worth seeing. */}
        {discOn && (
          <span className="pt-pop flex-none">
            {b ? (
              <span
                className="block rounded-full px-1.5 py-px text-[7.5px] font-bold text-white"
                style={{ background: primary(p) }}
              >
                {b}
              </span>
            ) : (
              <span className="block rounded-full bg-[#EFECE6] px-1.5 py-px text-[7.5px] font-bold text-[#A6A6A6]">
                &mdash;
              </span>
            )}
          </span>
        )}
      </div>
      <p className="mt-1 truncate text-[8px] text-brand-gray">{p.role}</p>
    </div>
  );
}

function OrgView({ scene }: { scene: Scene }) {
  const widths = ORG.map((b) => Math.max(O_CARD, b.kids.length * O_KID + (b.kids.length - 1) * O_KGAP));
  const total = widths.reduce((a, b) => a + b, 0) + O_GGAP * (widths.length - 1);

  const centres: number[] = [];
  let x = 0;
  for (const w of widths) {
    centres.push(x + w / 2);
    x += w + O_GGAP;
  }
  const spanL = centres[0];
  const spanR = centres[centres.length - 1];
  const mid = (spanL + spanR) / 2;

  const assessed = TEAM.filter((t) => t.scores).length;

  return (
    <div className="pt-view flex h-full flex-col">
      <div className="flex flex-none items-center gap-2 pb-2">
        <b className="text-[12.5px] tracking-tight">Org Chart</b>
        <span className="text-[10px] text-brand-gray">18 of 25 Team Members</span>

        <span className="ml-auto flex items-center gap-2">
          {/* The legend only exists once there is something to read, so the
              chart before the click is a plain org chart rather than one with
              an unexplained empty key sitting over it. */}
          <span
            className="flex items-center gap-1.5 transition-opacity duration-500"
            style={{ opacity: scene.discOn ? 1 : 0 }}
          >
            {DIMS.map((d) => (
              <span key={d.k} className="flex items-center gap-1 text-[8.5px] text-brand-charcoal">
                <span className="h-[7px] w-[7px] rounded-full" style={{ background: d.c }} />
                {d.label}
              </span>
            ))}
            <span className="ml-1 rounded-full bg-[#F1EEE9] px-2 py-px text-[8.5px] font-semibold text-brand-charcoal">
              {assessed} of {TEAM.length} assessed
            </span>
          </span>

          {/* The product's own control, and the one the client asked to see
              pressed. It reads as on afterwards rather than disappearing. */}
          <span
            data-t="show-disc"
            className="flex flex-none items-center gap-1.5 rounded-md border px-2 py-1 text-[9.5px] font-bold transition-colors duration-300"
            style={{
              borderColor: scene.discOn ? PLUM : "#E6E2DB",
              background: scene.discOn ? "#F6EDF3" : "#fff",
              color: scene.discOn ? PLUM : "#6B6660",
            }}
          >
            <DiscIcon className="h-[11px] w-[11px]" />
            Show DISC
          </span>
        </span>
      </div>

      {/* Centred rather than top-aligned. Three levels of a nine-person
          company do not fill a 400px panel, and a chart pinned to the top of an
          empty white field reads as a chart that has been cut off. */}
      <div className="flex min-h-0 flex-1 items-center overflow-hidden rounded-xl border border-[#EBE7E0] bg-white px-4 py-3">
        <div className="mx-auto" style={{ width: total }}>
          <div style={{ marginLeft: mid - O_CARD / 2, width: O_CARD }}>
            <OrgCard p={ORG_ROOT} root discOn={scene.discOn} />
          </div>

          <div className="relative" style={{ height: O_STUB * 2 }}>
            <OrgStub left={mid} />
            <OrgLine left={spanL} width={spanR - spanL} />
            {centres.map((c, i) => (
              <OrgStub key={ORG[i].head.name} left={c} from={O_STUB} />
            ))}
          </div>

          <div className="flex items-start" style={{ gap: O_GGAP }}>
            {ORG.map((b, i) => {
              const rowW = b.kids.length * O_KID + (b.kids.length - 1) * O_KGAP;
              const startX = (widths[i] - rowW) / 2;
              const firstC = startX + O_KID / 2;
              const lastC = startX + rowW - O_KID / 2;
              const pc = widths[i] / 2;
              const ruleL = Math.min(firstC, pc);
              const ruleR = Math.max(lastC, pc);

              return (
                <div key={b.head.name} style={{ width: widths[i] }}>
                  <div className="mx-auto" style={{ width: O_CARD }}>
                    <OrgCard p={b.head} discOn={scene.discOn} />
                  </div>
                  <div className="relative" style={{ height: O_STUB * 2 }}>
                    <OrgStub left={pc} />
                    <OrgLine left={ruleL} width={ruleR - ruleL} />
                    {b.kids.map((k, j) => (
                      <OrgStub key={k.name} left={startX + j * (O_KID + O_KGAP) + O_KID / 2} from={O_STUB} />
                    ))}
                  </div>
                  <div className="flex justify-center" style={{ gap: O_KGAP }}>
                    {b.kids.map((k) => (
                      <div key={k.name} style={{ width: O_KID }}>
                        <OrgCard p={k} discOn={scene.discOn} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- the nav rail
// Revealed by the pull-back in beat 5, and lifted from TeamMeetingsHeroTour so
// the two tours share one gesture rather than each inventing their own.
//
// Every row sits SOFT the whole time. When the rack fires, only Team and Org
// Chart sharpen, which is the entire argument of the beat: DISC is not a
// separate product, it is one of your workspace's areas and the org chart is
// the one next door.
//
// The blur is per row and never on the rail, because a filter on a parent
// rasterises its children with it and a child cannot un-blur itself back out of
// an ancestor's filter.
function NavRail({ active, racked }: { active: string; racked: boolean }) {
  return (
    <div
      className="absolute inset-y-0 left-0 z-0 flex flex-col border-r border-[#E7E4DE] bg-white"
      style={{ width: RAIL_W }}
    >
      <div className="flex items-center gap-2 px-3 py-3.5" style={{ ...SOFT, transition: RACK }}>
        <span className="grid h-[21px] w-[21px] flex-none place-items-center rounded-[7px] bg-brand-orange text-[10.5px] font-black text-white">
          M
        </span>
        <span className="text-[12px] font-extrabold tracking-tight text-brand-ink">Multiply OS</span>
      </div>

      <div className="px-2 pb-2">
        {NAV.map((n) => {
          const on = n.key === active;
          const focus = n.key === "team" || n.key === "org";
          const Icon = n.icon;
          return (
            <div
              key={n.label}
              data-t={n.key === "org" ? "nav-org" : undefined}
              className="mb-0.5 flex items-center gap-2 rounded-[9px] px-2 py-[7px]"
              style={{
                background: on ? "#F6EDF3" : "transparent",
                color: on ? PLUM : "#6F6A62",
                ...(focus && racked ? SHARP : SOFT),
                transition: `${RACK}, background 400ms, color 400ms`,
              }}
            >
              <Icon className="h-[13px] w-[13px] flex-none" />
              <span className="whitespace-nowrap text-[11px] font-semibold">{n.label}</span>
              {n.key === "org" && (
                <span
                  className="ml-auto h-[6px] w-[6px] flex-none rounded-full transition-opacity duration-500"
                  style={{ background: "#E2703A", opacity: racked ? 1 : 0 }}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-auto border-t border-[#EFECE6] px-3 py-3" style={{ ...SOFT, transition: RACK }}>
        <div className="flex items-center gap-2">
          <span className="grid h-[21px] w-[21px] flex-none place-items-center rounded-full bg-[#F1EEE9] text-[8px] font-bold text-brand-charcoal">
            SL
          </span>
          <div className="leading-tight">
            <div className="text-[10px] font-bold text-brand-ink">Skylar Lewis</div>
            <div className="text-[8.5px] text-brand-gray">Ridgeline Services</div>
          </div>
        </div>
      </div>
    </div>
  );
}
