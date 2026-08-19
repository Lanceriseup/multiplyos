"use client";

// Animated hero for the Team Meetings & 1on1s feature page.
//
// One continuous camera move, two acts, on a loop:
//
//   ACT 1 - the team meeting runs itself
//     1. a recurring meeting sits there with a timeboxed agenda
//     2. Start meeting, and a live bar pins to the top with a running clock
//     3. the agenda checks itself off step by step, and a task and an issue
//        get captured on the way through
//
//   THE ZOOM OUT
//     4. the workspace pulls back, and the nav shows 1on1s sitting right
//        beside Team Meetings. That beat is the argument for one page: these
//        are neighbours in the same system.
//
//   ACT 2 - the same rhythm, for one person
//     5. pick a teammate, and the shared topic list is already written
//     6. Start meeting, the partner joins, topics get checked
//     7. the payoff: the topic nobody got to carries to the next meeting
//
// The last beat is the whole thesis. Team meetings and 1on1s are the same
// object, a timeboxed agenda you step through in a live session, and neither
// one restarts from zero.
//
// Same split as SopHqHeroTour, ScoreboardHeroTour, and ProjectsTasksHeroTour:
// views are React state, only the cursor and its ripple are animated
// imperatively through the Web Animations API. The sequence is generation-token
// guarded, so a re-render or unmount aborts the in-flight tour rather than
// leaving orphaned timers behind.
//
// Layout: the stage is FLUID and fills its container, with a floor of MIN_W
// below which it scales down proportionally. Cursor targets are measured from
// live rects and divided by that scale. The zoom-out scales only the content
// column, never the nav rail, so the one cursor target used while zoomed still
// measures true.
//
// NOTE: a running *team* meeting has not been seen in the product. It is drawn
// here as the 1on1 session bar, which has been seen, on the reasoning that it is
// the same app and the same session concept. See docs/team-meetings-feature-notes.md.
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

const MIN_W = 980; // narrower than this and the whole stage scales down
const STAGE_H = 500;
const EASE = "cubic-bezier(0.22,1,0.36,1)";

// The nav rail sits BEHIND the content plate and is only ever revealed by the
// pull-back. RAIL_W and ZOOM together decide how far the plate has to travel:
// its left edge must clear the rail, and its right edge must still fit the
// stage. At MIN_W those two constraints leave very little room, so the shift is
// computed from the live width rather than hardcoded. See plateShift().
const RAIL_W = 140;
const RAIL_GAP = 14;
const ZOOM = 0.83;

// Left edge after scaling about the centre is (w - w*ZOOM)/2, so this is the
// extra translation needed to clear the rail, expressed in pre-scale units.
function plateShift(w: number) {
  return Math.max(0, (RAIL_W + RAIL_GAP - (w * (1 - ZOOM)) / 2) / ZOOM);
}

// ---------------------------------------------------------------- tokens
const BLUE = "#2C6BA6"; // Team Meetings, matches the nav and the home-page card
const BLUE_L = "#4A9FE0";
const BLUE_BG = "#EAF3FC";
const TEAL = "#1C6B62"; // 1on1s
const TEAL_L = "#2A8C82";
const TEAL_BG = "#E8F5F2";
const GREEN = "#2BA463";
const AMBER = "#B4771A";
const AMBER_BG = "#FDF3E0";

type IconProps = { className?: string; style?: React.CSSProperties };

// ---------------------------------------------------------------- icons
const Stroke = ({ className, d, w = 2 }: { className?: string; d: string; w?: number }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const PlayIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round">
    <path d="M7 4.5l12 7.5-12 7.5z" />
  </svg>
);
const CheckIcon = ({ className }: IconProps) => (
  <Stroke className={className} d="M5 12l5 5L20 7" w={3.2} />
);
const ClockIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);
const CalIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3.5" y="5" width="17" height="15" rx="2.4" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </svg>
);
const PeopleIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="8" r="3.4" />
    <path d="M2.8 19.5c.7-3.3 3.2-5 6.2-5s5.5 1.7 6.2 5M16.5 5.6a3.3 3.3 0 0 1 0 6.4M18 14.9c2.1.5 3.4 2 3.9 4.6" />
  </svg>
);
const AlertIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4.5l8.5 15h-17z" />
    <path d="M12 10v4M12 17.2v.1" />
  </svg>
);
const ChatIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 5.5h16v11H12l-5 3.5v-3.5H4z" />
  </svg>
);
const SearchIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4.5 4.5" />
  </svg>
);
const PlusIcon = ({ className }: IconProps) => (
  <Stroke className={className} d="M12 5.5v13M5.5 12h13" w={2.4} />
);
const PauseIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <rect x="7" y="5" width="3.6" height="14" rx="1.2" />
    <rect x="13.4" y="5" width="3.6" height="14" rx="1.2" />
  </svg>
);
const GaugeIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 17a8 8 0 1 1 16 0" />
    <path d="M12 17l4-4.5" />
  </svg>
);
const BookIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 5.5A2 2 0 0 1 6 3.5h13v15H6a2 2 0 0 0-2 2z" />
  </svg>
);
const HeartIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20s-7-4.4-7-9.2A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.8C19 15.6 12 20 12 20z" />
  </svg>
);
const HomeIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 10.5L12 4l8 6.5V20H4z" />
  </svg>
);
const BoardIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round">
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.2" />
    <path d="M9 4.5v15" />
  </svg>
);

// ---------------------------------------------------------------- people
// Generic across the site: the same cast as the SOP HQ and Projects pages.
const PEOPLE = {
  SL: { init: "SL", name: "Skylar Lewis", bg: "#B4532A" },
  JR: { init: "JR", name: "Jordan Rivera", bg: "#2C6BA6" },
  PN: { init: "PN", name: "Priya Nair", bg: "#6B4E9E" },
  MH: { init: "MH", name: "Marcus Hale", bg: "#2E7D5B" },
} as const;
type PersonKey = keyof typeof PEOPLE;

function Who({ k, size = 19 }: { k: PersonKey; size?: number }) {
  const p = PEOPLE[k];
  return (
    <span
      className="grid flex-none place-items-center rounded-full font-bold text-white"
      style={{ height: size, width: size, background: p.bg, fontSize: size * 0.4 }}
    >
      {p.init}
    </span>
  );
}

// ---------------------------------------------------------------- data
// The agenda is timeboxed and the boxes add up: 5 + 15 + 15 + 10 = 45.
// That is the detail worth animating, so the numbers have to stay in step.
const AGENDA = [
  { label: "Opening", min: "5m", at: "5:00" },
  { label: "Tasks Review", min: "15m", at: "20:00" },
  { label: "Issues Review", min: "15m", at: "35:00" },
  { label: "Scoreboard Review", min: "10m", at: "45:00" },
];

const CAPTURED = [
  { kind: "task" as const, text: "Send the renewal list to Sales", who: "PN" as PersonKey, from: "Tasks Review" },
  { kind: "issue" as const, text: "Onboarding still needs a manual step", who: "MH" as PersonKey, from: "Issues Review" },
];

const TOPICS = [
  { text: "Where the onboarding rewrite stands", by: "you" as const },
  { text: "Cover for the support desk in December", by: "them" as const },
  { text: "Career path after the Q4 push", by: "them" as const },
];

const NAV = [
  { label: "Dashboard", icon: HomeIcon },
  { label: "Scoreboards", icon: GaugeIcon },
  { label: "Team Meetings", icon: CalIcon, key: "team" },
  { label: "1on1s", icon: HeartIcon, key: "one" },
  { label: "Projects", icon: BoardIcon },
  { label: "SOP HQ", icon: BookIcon },
];

const ONE_TIMES = ["0:00", "3:40", "9:15", "14:30", "19:05"];

// ---------------------------------------------------------------- component
type View = "team-idle" | "team-live" | "one-idle" | "one-live";

const ABORT = Symbol("abort");

export default function TeamMeetingsHeroTour() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<SVGSVGElement>(null);
  const rippleRef = useRef<HTMLSpanElement>(null);

  // cursor targets, live in whichever view is currently mounted
  const teamStartRef = useRef<HTMLDivElement>(null);
  const oneNavRef = useRef<HTMLDivElement>(null);
  const pickRef = useRef<HTMLDivElement>(null);
  const oneStartRef = useRef<HTMLDivElement>(null);

  const inView = useInView(wrapRef, { once: false, margin: "-60px" });
  const reduce = useReducedMotion() ?? false;

  const [view, setView] = useState<View>("team-idle");
  const [step, setStep] = useState(0); // agenda items completed
  const [caught, setCaught] = useState(0); // items captured in the meeting
  const [zoomed, setZoomed] = useState(false);
  const [racked, setRacked] = useState(false); // the pair pulls into focus
  const [picked, setPicked] = useState(false);
  const [checks, setChecks] = useState(0); // topics checked in the 1on1
  const [joined, setJoined] = useState(false);
  const [oneTask, setOneTask] = useState(false);
  const [carry, setCarry] = useState(false);
  const [oneT, setOneT] = useState(0);

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
    // cancelling its animation, so fills never stack across beats.
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

    // The press keeps translate() inside every keyframe, so the pointer never
    // drops to the corner mid-click.
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
      for (;;) {
        // ---------------------------------------------- reset
        setView("team-idle");
        setStep(0);
        setCaught(0);
        setZoomed(false);
        setRacked(false);
        setPicked(false);
        setChecks(0);
        setJoined(false);
        setOneTask(false);
        setCarry(false);
        setOneT(0);
        await fade(0, 0);
        setCursor(MIN_W / 2, STAGE_H + 70);
        await wait(640);
        await fade(1, 240);

        // ---------------------------------------------- ACT 1: the meeting runs
        await tap(teamStartRef, 800);
        setView("team-live");
        await wait(1000);

        setStep(1);
        await wait(900);

        setStep(2);
        await wait(560);
        setCaught(1);
        await wait(1000);

        setStep(3);
        await wait(560);
        setCaught(2);
        await wait(1050);

        setStep(4);
        await wait(1350);

        // ---------------------------------------------- the zoom out (option B: rack focus)
        // The plate pulls back and the rail is revealed behind it, already soft.
        // Nothing pops: the only thing the eye tracks is the pair coming into
        // focus, which is why the rack waits for the pull-back to settle.
        setZoomed(true);
        await wait(560);
        setRacked(true);
        await wait(700);

        await tap(oneNavRef, 760);
        setView("one-idle");
        setZoomed(false);
        setRacked(false);
        // let the scale settle before any rect inside the content is measured
        await wait(840);

        // ---------------------------------------------- ACT 2: the same rhythm, for one
        await tap(pickRef, 700);
        setPicked(true);
        await wait(950);

        await tap(oneStartRef, 700);
        setView("one-live");
        setOneT(1);
        await wait(950);

        setJoined(true);
        await wait(820);

        setChecks(1);
        setOneT(2);
        await wait(820);

        setChecks(2);
        setOneT(3);
        await wait(700);

        setOneTask(true);
        setOneT(4);
        await wait(1000);

        setCarry(true);
        await wait(2100);

        await fade(0, 380);
        await wait(780);
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

  // Reduced motion gets a resolved frame rather than the opening one, so the
  // static version still shows a meeting that has actually run.
  const shown: View = reduce ? "team-live" : view;
  const rStep = reduce ? 3 : step;
  const rCaught = reduce ? 2 : caught;
  const active = shown === "one-idle" || shown === "one-live" ? "one" : "team";

  return (
    <div ref={wrapRef} className="w-full" style={{ height: STAGE_H * box.scale }}>
      <div
        ref={stageRef}
        className="relative overflow-hidden rounded-[18px] border border-black/5 bg-[#F3F1ED] shadow-[0_28px_60px_-32px_rgba(40,30,15,0.5)]"
        style={{
          width: box.w,
          height: STAGE_H,
          transform: `scale(${box.scale})`,
          transformOrigin: "top left",
        }}
      >
        {/* ---------------- nav rail ----------------
            Behind the plate and never scaled, so it is invisible until the
            pull-back uncovers it, and so the one cursor target used while
            zoomed still measures true. */}
        <NavRail active={active} oneNavRef={oneNavRef} racked={racked} />

        {/* ---------------- the plate, which is what pulls back ----------------
            Opaque and covering the whole stage at rest, so Act 1 shows the
            meeting and nothing else. */}
        <div
          className="absolute inset-0 z-[2] flex flex-col overflow-hidden bg-[#FBFAF8]"
          style={{
            transform: zoomed ? `scale(${ZOOM}) translateX(${plateShift(box.w)}px)` : "none",
            transformOrigin: "center center",
            transition: `transform 780ms ${EASE}, box-shadow 780ms ${EASE}, border-radius 780ms ${EASE}`,
            boxShadow: zoomed ? "0 26px 54px -24px rgba(40,30,15,0.5)" : "0 0 0 rgba(0,0,0,0)",
            borderRadius: zoomed ? 14 : 0,
          }}
        >
          <TopBar />
          <div className="flex-1 overflow-hidden px-5 py-4">
            {shown === "team-idle" ? (
              <TeamIdle startRef={teamStartRef} />
            ) : shown === "team-live" ? (
              <TeamLive step={rStep} caught={rCaught} />
            ) : shown === "one-idle" ? (
              <OneIdle picked={picked} pickRef={pickRef} startRef={oneStartRef} />
            ) : (
              <OneLive checks={checks} joined={joined} task={oneTask} carry={carry} t={ONE_TIMES[oneT] ?? "0:00"} />
            )}
          </div>
        </div>

        {/* ---------------- cursor + ripple ----------------
            Same pointer the other three feature tours use: white arrow with a
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

// ---------------------------------------------------------------- chrome
// Rack focus, the treatment picked from design/team-meetings-zoomout-options.html.
//
// Blur is applied per row, never to the rail itself: a filter on a parent
// rasterises its children along with it, so a child can never un-blur itself
// back out of an ancestor's filter. That bug is why this looks the way it does.
const SOFT = { filter: "blur(3.4px)", opacity: 0.5 };
const SHARP = { filter: "blur(0px)", opacity: 1 };
const RACK = `filter 620ms ${EASE}, opacity 620ms ${EASE}`;

function NavRail({
  active,
  oneNavRef,
  racked,
}: {
  active: string;
  oneNavRef: React.RefObject<HTMLDivElement | null>;
  racked: boolean;
}) {
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
          const focus = n.key === "team" || n.key === "one";
          const Icon = n.icon;
          return (
            <div
              key={n.label}
              ref={n.key === "one" ? oneNavRef : undefined}
              className="mb-0.5 flex items-center gap-2 rounded-[9px] px-2 py-[7px]"
              style={{
                background: on ? "#FDF0E4" : "transparent",
                color: on ? "#B4532A" : "#6F6A62",
                ...(focus && racked ? SHARP : SOFT),
                transition: `${RACK}, background 400ms, color 400ms`,
              }}
            >
              <Icon className="h-[13px] w-[13px] flex-none" />
              <span className="whitespace-nowrap text-[11px] font-semibold">{n.label}</span>
              {n.key === "one" && (
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
          <Who k="SL" size={21} />
          <div className="leading-tight">
            <div className="text-[10px] font-bold text-brand-ink">Skylar Lewis</div>
            <div className="text-[8.5px] text-brand-gray">Northwind Group</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <div className="flex flex-none items-center gap-2.5 border-b border-[#ECEAE6] bg-white px-5 py-2">
      <span className="grid h-[20px] w-[20px] flex-none place-items-center rounded-md bg-brand-orange text-white">
        <PlusIcon className="h-[11px] w-[11px]" />
      </span>
      <div className="flex h-[26px] max-w-[340px] flex-1 items-center gap-2 rounded-lg border border-[#E7E4DE] bg-[#FAF9F7] px-2.5">
        <SearchIcon className="h-[12px] w-[12px] text-brand-gray" />
        <span className="text-[11px] text-brand-gray">Search Multiply...</span>
        <span className="ml-auto rounded border border-[#E1DDD6] bg-white px-1 py-px font-mono text-[8.5px] text-brand-gray">CtrlK</span>
      </div>
    </div>
  );
}

// The pinned session bar. This is the thing that makes a meeting a meeting
// rather than a note page: it is stateful, it is timed, and it is always there.
function LiveBar({ label, who, t, total, tone }: { label: string; who: string; t: string; total: string; tone: string }) {
  return (
    <div
      className="mb-3 flex items-center gap-2.5 rounded-[10px] border px-3 py-2"
      style={{ background: "#FEFBEF", borderColor: "#F0E4C4" }}
    >
      <span className="relative flex h-[8px] w-[8px] flex-none">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70" style={{ background: tone }} />
        <span className="relative inline-flex h-[8px] w-[8px] rounded-full" style={{ background: tone }} />
      </span>
      <span className="text-[12px] font-bold text-brand-ink">{label}</span>
      <span className="text-[11.5px] text-brand-charcoal">· {who}</span>
      <span className="ml-3 font-mono text-[12px] font-semibold tabular-nums text-brand-ink">
        {t} <span className="font-normal text-brand-gray">of {total}</span>
      </span>
      <div className="ml-auto flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#E1DDD6] bg-white px-2.5 py-[5px] text-[10.5px] font-semibold text-brand-charcoal">
          <PauseIcon className="h-[10px] w-[10px]" />
          Pause
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-ink px-2.5 py-[5px] text-[10.5px] font-semibold text-white">
          <CheckIcon className="h-[10px] w-[10px]" />
          Complete
        </span>
      </div>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[12px] border border-[#E7E4DE] bg-white ${className}`}>{children}</div>
  );
}

function CardHead({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 border-b border-[#F0EDE8] px-3.5 py-2">
      <span className="text-[9.5px] font-bold uppercase tracking-[0.09em] text-brand-gray">{children}</span>
      {right && <span className="ml-auto">{right}</span>}
    </div>
  );
}

// ---------------------------------------------------------------- ACT 1
function MeetingHead() {
  return (
    <div className="mb-3 flex items-center gap-2.5">
      <span className="grid h-[26px] w-[26px] flex-none place-items-center rounded-[8px]" style={{ background: BLUE_BG, color: BLUE }}>
        <CalIcon className="h-[15px] w-[15px]" />
      </span>
      <span className="text-[16px] font-extrabold tracking-tight text-brand-ink">Leadership Team</span>
      <span className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-brand-orange px-2.5 py-[5px] text-[10.5px] font-semibold text-white">
        <AlertIcon className="h-[11px] w-[11px]" />
        Issues
      </span>
    </div>
  );
}

function TeamIdle({ startRef }: { startRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div className="flex h-full flex-col">
      <MeetingHead />
      <Card className="p-3.5">
        <div className="flex items-start">
          <div className="flex-1">
            <div className="flex items-center gap-4 text-[11px] font-medium text-brand-charcoal">
              <span className="inline-flex items-center gap-1.5">
                <CalIcon className="h-[13px] w-[13px] text-brand-gray" />
                Weekly · Mondays
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ClockIcon className="h-[13px] w-[13px] text-brand-gray" />
                45 min
              </span>
              <span className="inline-flex items-center gap-1.5">
                <PeopleIcon className="h-[13px] w-[13px] text-brand-gray" />7 participants
              </span>
            </div>
            <div className="mt-3">
              {AGENDA.map((a, i) => (
                <div key={a.label} className="flex items-center gap-2.5 py-[5px]">
                  <span className="grid h-[18px] w-[18px] flex-none place-items-center rounded-full bg-[#F1EEE9] text-[9.5px] font-bold text-brand-charcoal">
                    {i + 1}
                  </span>
                  <span className="text-[12.5px] font-semibold text-brand-ink">{a.label}</span>
                  <span className="ml-auto pr-1 font-mono text-[10.5px] text-brand-gray">{a.min}</span>
                </div>
              ))}
            </div>
          </div>
          <div ref={startRef} className="ml-4 mt-1 inline-flex flex-none items-center gap-2 rounded-lg bg-brand-ink px-4 py-2.5 text-[12px] font-semibold text-white">
            <PlayIcon className="h-[12px] w-[12px]" />
            Start meeting
          </div>
        </div>
        {/* the timeboxes add up, and saying so is the point */}
        <div className="mt-2.5 flex items-center gap-2 border-t border-[#F0EDE8] pt-2.5 text-[10.5px] text-brand-gray">
          <ClockIcon className="h-[12px] w-[12px]" style={{ color: BLUE_L }} />
          <span>
            Every item is timeboxed, and the boxes add up to the 45 minutes you booked.
          </span>
        </div>
      </Card>
      <div className="mt-3">
        <div className="mb-1.5 text-[9.5px] font-bold uppercase tracking-[0.09em] text-brand-gray">History</div>
        <div className="flex items-center gap-2.5 rounded-[10px] border border-[#E7E4DE] bg-white px-3.5 py-2.5">
          <span className="grid h-[7px] w-[7px] flex-none place-items-center rounded-full bg-[#D9D5CD]" />
          <span className="text-[11.5px] text-brand-charcoal">Last week · 45 min · 4 tasks captured, 2 issues closed</span>
          <span className="ml-auto text-[11px] font-semibold" style={{ color: BLUE }}>
            Open
          </span>
        </div>
      </div>
    </div>
  );
}

function TeamLive({ step, caught }: { step: number; caught: number }) {
  const t = step === 0 ? "0:00" : AGENDA[step - 1].at;
  return (
    <div className="flex h-full flex-col">
      <LiveBar label="Leadership Team" who="live" t={t} total="45:00" tone="#E2703A" />
      <div className="flex flex-1 gap-3 overflow-hidden">
        {/* agenda, checking itself off */}
        <Card className="flex-1 p-3.5">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[9.5px] font-bold uppercase tracking-[0.09em] text-brand-gray">Agenda</span>
            <span className="ml-auto font-mono text-[10px] text-brand-gray">
              {Math.min(step, AGENDA.length)}/{AGENDA.length}
            </span>
          </div>
          {AGENDA.map((a, i) => {
            const done = i < step;
            const now = i === step && step < AGENDA.length;
            return (
              <div
                key={a.label}
                className="flex items-center gap-2.5 rounded-lg px-2 py-[7px] transition-colors duration-500"
                style={{ background: now ? BLUE_BG : "transparent" }}
              >
                <span
                  className="grid h-[18px] w-[18px] flex-none place-items-center rounded-full border-[1.6px] transition-all duration-300"
                  style={{
                    borderColor: done ? GREEN : "#E1DDD6",
                    background: done ? GREEN : "transparent",
                    color: done ? "#fff" : "#6F6A62",
                    fontSize: 9.5,
                    fontWeight: 700,
                  }}
                >
                  {done ? <CheckIcon className="h-[10px] w-[10px]" /> : i + 1}
                </span>
                <span
                  className="text-[12.5px] font-semibold transition-colors duration-500"
                  style={{ color: done ? "#9B958C" : now ? BLUE : "#1B1A17", textDecoration: done ? "line-through" : "none" }}
                >
                  {a.label}
                </span>
                <span className="ml-auto pr-1 font-mono text-[10.5px] text-brand-gray">{a.min}</span>
              </div>
            );
          })}
          <div className="mt-2 flex items-center gap-2 border-t border-[#F0EDE8] pt-2.5">
            <span className="text-[10.5px] text-brand-gray">Pulled live from</span>
            <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: "#EFEBFB", color: "#5B47A8" }}>
              <BoardIcon className="h-[9px] w-[9px]" />
              Projects
            </span>
            <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: "#FDF0E4", color: "#B4532A" }}>
              <GaugeIcon className="h-[9px] w-[9px]" />
              Scoreboards
            </span>
          </div>
        </Card>

        {/* what the meeting caught on the way through */}
        <Card className="w-[300px] flex-none">
          <CardHead right={<span className="font-mono text-[10px] text-brand-gray">{caught}</span>}>Captured this meeting</CardHead>
          <div className="p-2.5">
            {CAPTURED.map((c, i) => {
              const on = i < caught;
              return (
                <div
                  key={c.text}
                  className="mb-2 rounded-[9px] border px-2.5 py-2 last:mb-0"
                  style={{
                    borderColor: on ? "#E7E4DE" : "transparent",
                    background: on ? "#fff" : "transparent",
                    opacity: on ? 1 : 0,
                    transform: on ? "translateY(0)" : "translateY(6px)",
                    transition: `opacity 420ms ${EASE}, transform 420ms ${EASE}`,
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="rounded px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wide"
                      style={
                        c.kind === "task"
                          ? { background: "#EFEBFB", color: "#5B47A8" }
                          : { background: "#FDECE8", color: "#C0402B" }
                      }
                    >
                      {c.kind}
                    </span>
                    <span className="text-[9.5px] text-brand-gray">from {c.from}</span>
                  </div>
                  <div className="mt-1.5 text-[11.5px] font-semibold leading-snug text-brand-ink">{c.text}</div>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <Who k={c.who} size={15} />
                    <span className="text-[10px] text-brand-charcoal">{PEOPLE[c.who].name}</span>
                  </div>
                </div>
              );
            })}
            {caught === 0 && (
              <div className="py-6 text-center text-[10.5px] text-brand-gray">Nothing captured yet.</div>
            )}
          </div>
          {caught >= 2 && (
            <div
              className="mx-2.5 mb-2.5 rounded-[8px] px-2.5 py-2 text-[10px] font-medium"
              style={{ background: "#EFEBFB", color: "#4B3799", animation: `os-rise 460ms ${EASE} both` }}
            >
              Tasks land in Projects. Issues stay on the meeting until they are closed.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- ACT 2
function OneIdle({
  picked,
  pickRef,
  startRef,
}: {
  picked: boolean;
  pickRef: React.RefObject<HTMLDivElement | null>;
  startRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-[0.08em]" style={{ background: TEAL_BG, color: TEAL }}>
          <ChatIcon className="h-[10px] w-[10px]" />
          1on1 studio
        </span>
        <span className="text-[16px] font-extrabold tracking-tight text-brand-ink">1on1 studio</span>
        <div className="ml-auto flex items-center gap-1.5">
          {["Org chart", "Past meetings", "Scorecard"].map((b) => (
            <span key={b} className="rounded-lg border border-[#E7E4DE] bg-white px-2.5 py-[5px] text-[10.5px] font-semibold text-brand-charcoal">
              {b}
            </span>
          ))}
        </div>
      </div>

      {/* who first, everything else after */}
      <div
        className="mb-3 rounded-[11px] border border-dashed px-3.5 py-2.5 transition-colors duration-500"
        style={{ borderColor: picked ? TEAL_L : "#F0C79B", background: picked ? TEAL_BG : "#FEF6EE" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-[11.5px] font-bold text-brand-ink">Who are you meeting with?</span>
          <div className="flex items-center gap-1.5">
            {(["JR", "PN", "MH"] as PersonKey[]).map((k) => {
              const on = picked && k === "JR";
              return (
                <div
                  key={k}
                  ref={k === "JR" ? pickRef : undefined}
                  className="inline-flex items-center gap-1.5 rounded-full border px-1.5 py-[3px] transition-all duration-300"
                  style={{
                    borderColor: on ? TEAL_L : "#E7E4DE",
                    background: on ? "#fff" : "transparent",
                    boxShadow: on ? `0 0 0 2px ${TEAL_L}33` : "none",
                  }}
                >
                  <Who k={k} size={16} />
                  <span className="pr-1 text-[10.5px] font-semibold text-brand-charcoal">{PEOPLE[k].name.split(" ")[0]}</span>
                </div>
              );
            })}
          </div>
          <div
            ref={startRef}
            className="ml-auto inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-[11.5px] font-semibold text-white transition-opacity duration-300"
            style={{ background: picked ? "#1B1A17" : "#C9C4BB" }}
          >
            <PlayIcon className="h-[11px] w-[11px]" />
            Start meeting
          </div>
        </div>
      </div>

      <div className="flex flex-1 gap-3 overflow-hidden">
        {/* the agenda both people wrote before anyone sat down */}
        <Card className="flex-1">
          <CardHead right={<span className="text-[9.5px] font-semibold" style={{ color: TEAL }}>Shared</span>}>
            Discussion topics
          </CardHead>
          <div className="p-2.5">
            {TOPICS.map((t) => (
              <div key={t.text} className="mb-1.5 flex items-center gap-2 rounded-[8px] border border-[#EFECE6] px-2.5 py-[7px] last:mb-0">
                <span className="h-[6px] w-[6px] flex-none rounded-full" style={{ background: t.by === "you" ? TEAL_L : "#C9C4BB" }} />
                <span className="text-[11.5px] text-brand-ink">{t.text}</span>
                <span className="ml-auto text-[9.5px] text-brand-gray">{t.by === "you" ? "you" : "Jordan"}</span>
              </div>
            ))}
            <div className="mt-2 text-[10px] text-brand-gray">Both of you write here. Topics carry into the live agenda.</div>
          </div>
        </Card>

        {/* length, type, flow */}
        <Card className="w-[330px] flex-none">
          <CardHead>Meeting options</CardHead>
          <div className="p-3">
            <div className="mb-1.5 text-[9.5px] font-semibold text-brand-charcoal">Length</div>
            <div className="mb-2.5 flex gap-1">
              {["15", "30", "45", "60", "90"].map((m) => (
                <span
                  key={m}
                  className="rounded-md border px-1.5 py-[3px] text-[10px] font-semibold"
                  style={
                    m === "30"
                      ? { borderColor: TEAL_L, background: TEAL_BG, color: TEAL }
                      : { borderColor: "#E7E4DE", color: "#6F6A62" }
                  }
                >
                  {m} min
                </span>
              ))}
            </div>
            <div className="mb-1.5 text-[9.5px] font-semibold text-brand-charcoal">Type</div>
            <div className="mb-2.5 flex flex-wrap gap-1">
              {["Regular", "Monthly", "Quarterly", "Annual review"].map((m) => (
                <span
                  key={m}
                  className="rounded-md border px-1.5 py-[3px] text-[10px] font-semibold"
                  style={
                    m === "Regular"
                      ? { borderColor: TEAL_L, background: TEAL_BG, color: TEAL }
                      : { borderColor: "#E7E4DE", color: "#6F6A62" }
                  }
                >
                  {m}
                </span>
              ))}
            </div>
            <div className="mb-1.5 text-[9.5px] font-semibold text-brand-charcoal">Flow</div>
            <div className="flex gap-1.5">
              <span className="flex-1 rounded-[8px] border px-2 py-1.5 text-[10px] font-semibold" style={{ borderColor: TEAL_L, background: TEAL_BG, color: TEAL }}>
                Standard cadence
              </span>
              <span className="flex-1 rounded-[8px] border border-[#E7E4DE] px-2 py-1.5 text-[10px] font-semibold text-brand-charcoal">
                Quarterly review
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function OneLive({
  checks,
  joined,
  task,
  carry,
  t,
}: {
  checks: number;
  joined: boolean;
  task: boolean;
  carry: boolean;
  t: string;
}) {
  return (
    <div className="flex h-full flex-col">
      <LiveBar label="Regular 1on1" who="Jordan Rivera" t={t} total="30:00" tone={TEAL_L} />
      <div className="flex flex-1 gap-3 overflow-hidden">
        <Card className="flex-1">
          <CardHead>Agenda / topics</CardHead>
          <div className="p-2.5">
            {TOPICS.map((topic, i) => {
              const done = i < checks;
              const left = carry && i >= checks;
              return (
                <div
                  key={topic.text}
                  className="mb-1.5 flex items-center gap-2.5 rounded-[9px] border px-2.5 py-[8px] transition-all duration-500 last:mb-0"
                  style={{
                    borderColor: left ? "#F0DFC0" : "#EFECE6",
                    background: left ? AMBER_BG : "#fff",
                  }}
                >
                  <span
                    className="grid h-[16px] w-[16px] flex-none place-items-center rounded-[5px] border-[1.6px] transition-all duration-300"
                    style={{
                      borderColor: done ? GREEN : "#DCD8D0",
                      background: done ? GREEN : "transparent",
                      color: "#fff",
                    }}
                  >
                    {done && <CheckIcon className="h-[9px] w-[9px]" />}
                  </span>
                  <span
                    className="text-[11.5px] transition-colors duration-500"
                    style={{ color: done ? "#9B958C" : "#1B1A17", textDecoration: done ? "line-through" : "none" }}
                  >
                    {topic.text}
                  </span>
                  {left && (
                    <span className="ml-auto flex-none rounded-md px-1.5 py-0.5 text-[9px] font-bold" style={{ background: "#F7E7C8", color: AMBER }}>
                      carries over
                    </span>
                  )}
                </div>
              );
            })}
            <div
              className="mt-2 rounded-[8px] px-2.5 py-2 text-[10.5px] font-medium transition-all duration-500"
              style={{
                background: carry ? AMBER_BG : "transparent",
                color: carry ? AMBER : "#9B958C",
              }}
            >
              Unchecked topics are carried over to the next meeting.
            </div>
          </div>
        </Card>

        <div className="flex w-[300px] flex-none flex-col gap-3">
          <Card>
            <CardHead right={<span className="inline-flex items-center gap-1 text-[9.5px] font-semibold text-brand-charcoal"><PlusIcon className="h-[8px] w-[8px]" />Add task</span>}>
              Tasks
            </CardHead>
            <div className="p-2.5">
              <div
                className="rounded-[9px] border px-2.5 py-2"
                style={{
                  borderColor: task ? "#E7E4DE" : "transparent",
                  opacity: task ? 1 : 0,
                  transform: task ? "translateY(0)" : "translateY(6px)",
                  transition: `opacity 420ms ${EASE}, transform 420ms ${EASE}`,
                }}
              >
                <div className="text-[11.5px] font-semibold leading-snug text-brand-ink">Draft the support role scorecard</div>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <Who k="JR" size={15} />
                  <span className="text-[10px] text-brand-charcoal">Jordan · due Friday</span>
                </div>
              </div>
              {!task && <div className="py-4 text-center text-[10.5px] text-brand-gray">No tasks yet. Add one, or carry from your last 1on1.</div>}
            </div>
          </Card>

          <Card className="flex-1">
            <div className="flex items-center gap-3 border-b border-[#F0EDE8] px-3.5 py-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-brand-charcoal">
                <span className="h-[6px] w-[6px] rounded-full" style={{ background: GREEN }} />
                You
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold transition-colors duration-500" style={{ color: joined ? "#33302C" : "#9B958C" }}>
                <span className="h-[6px] w-[6px] rounded-full transition-colors duration-500" style={{ background: joined ? GREEN : "#D9D5CD" }} />
                Jordan
                {!joined && <span className="text-[9.5px] font-normal text-brand-gray">not joined</span>}
              </span>
            </div>
            <div className="px-3.5 py-2.5">
              <div className="text-[10px] font-semibold text-brand-charcoal">Shared notes, decisions, checklists</div>
              <div className="mt-2 space-y-1.5">
                <div className="h-[6px] w-[85%] rounded-full bg-[#F1EEE9]" />
                <div className="h-[6px] w-[70%] rounded-full bg-[#F1EEE9]" />
                <div className="h-[6px] w-[78%] rounded-full bg-[#F1EEE9]" />
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[9.5px] text-brand-gray">
                <SearchIcon className="h-[10px] w-[10px]" />
                Searchable forever: notes, agendas, commitments, action items
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
