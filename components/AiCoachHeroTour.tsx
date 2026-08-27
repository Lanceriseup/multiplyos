"use client";

// Animated hero for the AI Coach & Agent feature page, which the product calls
// Multi AI.
//
// The client asked for three things: show Multi AI, show it giving insightful
// information, and show it building a chart. The loop is those three, in the
// order that makes the third one land:
//
//   1. the home screen        two coaches, and their prompts are different
//   2. switch coach           the four suggestions swap, which proves the point
//   3. an honest answer       named records, real numbers, an uncomfortable read
//   4. build me a chart       it reads the ledger and draws the thing
//
// The cross-out of Claude and ChatGPT used to open this loop. It is above the
// panel now, as ReplacesChip, so the tour starts on the product.
//
// The answer beat holds longest. A chart is a party trick; the paragraph that
// tells you your marketing team is too small to hit your own annual goal is the
// product.
//
// Same architecture as the other ten hero tours: the app is React state, only
// the cursor and its ripple are animated imperatively through the Web Animations
// API, and the sequence is generation-token guarded so a re-render or unmount
// cancels the in-flight tour rather than leaving orphaned timers behind.
//
// Every figure Multi cites here is one the other feature pages already publish.
// That is deliberate: the claim is that it can see all of them at once. See
// docs/ai-coach-feature-notes.md section 6.
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

const MIN_W = 980;
const STAGE_H = 500;
const EASE = "cubic-bezier(0.22,1,0.36,1)";


const ASSISTANT = "#4B57C4";
const COACH = "#1592AE";
const RED = "#C0402B";
const AMBER = "#C9832B";

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
const Compass = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="12" cy="12" r="8.4" />
    <path d="M15.2 8.8l-1.8 4.6-4.6 1.8 1.8-4.6z" />
  </svg>
);
const Bot = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="4" y="7.4" width="16" height="11.2" rx="2.6" />
    <path d="M12 3.4v4M8.8 12.2v1.4M15.2 12.2v1.4" />
  </svg>
);
const Brain = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 5.2a2.8 2.8 0 0 0-5.3 1.3A2.8 2.8 0 0 0 5 11.4a2.8 2.8 0 0 0 1.9 4.8A2.8 2.8 0 0 0 12 18z" />
    <path d="M12 5.2a2.8 2.8 0 0 1 5.3 1.3A2.8 2.8 0 0 1 19 11.4a2.8 2.8 0 0 1-1.9 4.8A2.8 2.8 0 0 1 12 18z" />
  </svg>
);
const Search = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="10.8" cy="10.8" r="6.4" />
    <path d="M15.6 15.6l4.4 4.4" />
  </svg>
);
const Clip = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M16.6 8.4l-6.8 6.8a2.6 2.6 0 0 0 3.6 3.6l6.4-6.4a4.8 4.8 0 0 0-6.8-6.8L6 12.4a7 7 0 0 0 9.8 9.8" />
  </svg>
);
const Mic = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="9" y="3.4" width="6" height="10.4" rx="3" />
    <path d="M5.6 11.6a6.4 6.4 0 0 0 12.8 0M12 18v2.6" />
  </svg>
);
const Send = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2.2}>
    <path d="M12 19.4V5M6.2 10.8L12 5l5.8 5.8" />
  </svg>
);
const Plus = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2.4}>
    <path d="M12 5.4v13.2M5.4 12h13.2" />
  </svg>
);
const Tick = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2.6}>
    <path d="M5 12l5 5L20 7" />
  </svg>
);
const Chevron = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2.2}>
    <path d="M6.4 9.6l5.6 5.2 5.6-5.2" />
  </svg>
);

// ---------------------------------------------------------------- data
// The two coaches, with their real subtitles and their real suggested prompts.
// The prompts are verbatim: they are the best evidence in the screenshots that
// the coaches are genuinely different rather than one thing with two labels.
const COACHES = {
  assistant: {
    name: "Multi AI Assistant",
    sub: "Your AI Assistant for day-to-day work",
    c: ASSISTANT,
    icon: Bot,
    prompts: [
      "What should I focus on this week based on my assigned tasks?",
      "Draft a short status update to my manager on what I shipped this week.",
      "Which of my tasks are overdue or at risk, and what should I do first?",
      "Where can I find the SOP for onboarding a new client?",
    ],
  },
  coach: {
    name: "Strategic Coach",
    sub: "Ask me anything",
    c: COACH,
    icon: Compass,
    prompts: [
      "Based on my data, what are the top 3 things I should focus on this week?",
      "How can I produce more results in my role, for the company?",
      "Where does the business look like it needs the most support?",
      "What am I not seeing in my role that I should be paying attention to?",
    ],
  },
} as const;

type Which = keyof typeof COACHES;

// The chat history, grouped the way the product groups it.
const HISTORY = [
  { g: "Today", items: ["Q3 goals at risk", "Draft the Monday update", "Where cash actually went"] },
  { g: "This week", items: ["Second market readiness", "Turnaround bottleneck", "Cost per lead review"] },
  { g: "This month", items: ["Onboarding SOP gaps", "Scoreboard for Sales"] },
];

// ---- beat one: the Assistant, doing operational work ----
// Modelled on the real Assistant transcript, which narrated its own tool use
// before answering: "Let me pull your recent tasks so the update reflects what
// you actually shipped."
const A_ASKED = "Draft a short status update to my manager on what I shipped this week.";
const A_TOOL = "Pulled your tasks for the week of Aug 18";

const A_DONE = [
  { l: "Second crew certification", s: "completed" },
  { l: "Dispatch rebuild scope", s: "delivered" },
  { l: "Q3 margin review with finance", s: "done" },
];

// Both of these exist on other feature pages, which is the quiet part of the
// demo: the Assistant is reading the same records the rest of the site shows.
const A_OPEN = [
  { l: "Field Safety Lead hire", s: "was due Aug 14" },
  { l: "Vendor Terms 2026 signature", s: "was due Aug 10" },
];

const A_CLOSE = "Want me to adjust the tone, or handle the two overdue items differently?";

// ---- beat two: the Coach, doing something else entirely ----
const ASKED = "Where does the business look like it needs the most support?";

// Stitched from the numbers the other feature pages already publish. Notes 6.
const LEAD =
  "Skylar, the honest answer is marketing, and it is not close. Cost per lead is the only Critical goal in the quarter, it has zero of four milestones done, and there are five weeks left.";

const POINTS = [
  {
    h: "It is the smallest team in the company",
    t: "Marketing is two seats against Sales' three, and one of the two is part-time.",
  },
  {
    h: "Spend is growing faster than revenue",
    t: "Marketing was up 17.5% last month against 8.4% revenue growth.",
  },
  {
    h: "The annual plan is sitting on top of it",
    t: "Cost per lead is the parent of Second market open and profitable, which is also Critical.",
  },
];

const CLOSE =
  "You are paying more for leads that cost more, with the smallest team in the company, against the goal the rest of the year depends on.";

const FOLLOW_UP = "Chart marketing spend against cost per lead";

// Six months, ending on the same July figure the CFO Analytics P&L publishes.
const MONTHS = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];
const SPEND = [24800, 27200, 29600, 31400, 33100, 38900];
const CPL = [14, 15, 16, 17, 19, 23];
const CPL_GOAL = 18;

// ---------------------------------------------------------------- scene
type Scene = {
  // The whole card faded out, so the loop restarts on a fade rather than a cut.
  dim: boolean;
  who: Which;
  view: "home" | "chat";
  // the Assistant's thread
  aTool: boolean;
  aLines: number; // how much of the drafted update has landed
  // the Coach's thread
  lead: string; // the answer, streamed
  points: number; // how many findings have landed
  closed: boolean;
  typed: string; // the follow-up being typed
  tool: boolean; // "read your P&L and scoreboard"
  chart: boolean;
  hot: string;
};

const BLANK: Scene = {
  dim: false,
  who: "assistant", view: "home", aTool: false, aLines: 0,
  lead: "", points: 0, closed: false, typed: "", tool: false, chart: false, hot: "",
};

// Under prefers-reduced-motion: the finished answer with the chart under it,
// which is both of the client's headline asks in one frame.
const STILL: Scene = {
  ...BLANK, who: "coach", view: "chat", lead: LEAD, points: POINTS.length,
  closed: true, typed: FOLLOW_UP, tool: true, chart: true,
};

// ---------------------------------------------------------------- component
export default function AiCoachHeroTour() {
  const hostRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<SVGSVGElement>(null);
  const rippleRef = useRef<HTMLSpanElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const inView = useInView(hostRef, { margin: "-60px" });
  const reduce = useReducedMotion() ?? false;

  const [scene, setScene] = useState<Scene>(reduce ? STILL : BLANK);
  const [scaled, setScaled] = useState(false);
  const [scale, setScale] = useState(1);
  const [boxH, setBoxH] = useState<number | undefined>(undefined);

  const runRef = useRef(0);
  const scaleRef = useRef(1);
  const posRef = useRef({ x: 520, y: 44 });

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

  // Follow the transcript as it grows, the way a real chat pane does.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [scene.lead, scene.points, scene.closed, scene.tool, scene.chart, scene.typed, scene.aTool, scene.aLines]);

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

    const type = async (text: string, apply: (v: string) => void, per = 40) => {
      for (let i = 1; i <= text.length; i++) {
        if (!alive()) return;
        apply(text.slice(0, i));
        await wait(per);
      }
    };

    (async function loop() {
      setCursor(520, 44);
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

        // --- 1. the home screen, on the assistant
        await wait(1700);

        // --- 2. the Assistant does the errand: it reads, then it writes
        if (!(await tap("prompt-1", 700))) return;
        patch({ view: "chat" });
        await wait(700);
        patch({ aTool: true });
        await wait(1000);

        for (let i = 1; i <= 3; i++) {
          patch({ aLines: i });
          await wait(520);
          if (!alive()) return;
        }
        await wait(2600);

        // --- 3. same product, different job
        if (!(await tap("new-chat", 700))) return;
        patch({ view: "home", aTool: false, aLines: 0 });
        await wait(800);

        if (!(await tap("coach-coach", 620))) return;
        patch({ who: "coach" });
        await wait(2200);

        // --- 4. and this one asks something uncomfortable
        if (!(await tap("prompt-2", 700))) return;
        patch({ view: "chat" });
        await wait(700);

        await type(LEAD, (v) => patch({ lead: v }), 15);
        if (!alive()) return;
        await wait(500);

        for (let i = 0; i < POINTS.length; i++) {
          patch({ points: i + 1 });
          await wait(560);
          if (!alive()) return;
        }
        await wait(400);
        patch({ closed: true });
        await wait(3400);

        // --- 5. and it can draw what it just said
        await glide(pointAt("composer"), 620);
        if (!alive()) return;
        await click();
        await type(FOLLOW_UP, (v) => patch({ typed: v }), 34);
        if (!alive()) return;
        await wait(360);

        if (!(await tap("send", 480))) return;
        patch({ tool: true });
        await wait(1100);
        patch({ chart: true });
        await wait(4200);

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
            className="relative flex overflow-hidden rounded-2xl border border-black/5 bg-white text-brand-ink shadow-[0_30px_60px_-30px_rgba(40,30,15,0.45),0_2px_6px_-3px_rgba(40,30,15,0.12)] transition-opacity duration-[520ms] ease-out"
            style={{ height: STAGE_H, opacity: scene.dim ? 0 : 1 }}
          >
            <Sidebar scene={scene} />
            <div className="flex min-w-0 flex-1 flex-col">
              <TopBar scene={scene} />
              {scene.view === "home" ? (
                <HomeView scene={scene} />
              ) : (
                <ChatView scene={scene} scrollRef={scrollRef} />
              )}
            </div>

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

// ---------------------------------------------------------------- sidebar
function Sidebar({ scene }: { scene: Scene }) {
  return (
    <div className="flex w-[188px] flex-none flex-col border-r border-[#EDEAE4] bg-[#FBFAF9]">
      <div className="flex items-center gap-2 px-3 py-3">
        <span className="grid h-[24px] w-[24px] flex-none place-items-center rounded-lg bg-gradient-to-br from-[#F49230] to-[#DE6F14] text-white">
          <Spark className="h-3.5 w-3.5" />
        </span>
        <span className="min-w-0">
          <span className="block text-[12px] font-extrabold leading-none tracking-tight">Multi AI</span>
          <span className="block text-[8.5px] text-brand-gray">Coach &amp; Assistant</span>
        </span>
      </div>

      <div className="px-2.5">
        <span
          data-t="new-chat"
          className={`flex items-center justify-center gap-1.5 rounded-lg bg-brand-orange py-1.5 text-[10.5px] font-semibold text-white transition-all duration-200 ${
            scene.hot === "new-chat" ? "shadow-[0_0_0_3px_rgba(234,123,27,0.4)]" : ""
          }`}
        >
          <Plus className="h-2.5 w-2.5" />
          New chat
        </span>
        <span className="mt-1.5 flex items-center gap-1.5 rounded-lg bg-[#F1EEE9] px-2 py-1.5 text-[9.5px] text-brand-gray">
          <Search className="h-2.5 w-2.5" />
          Search chats...
        </span>
        <span className="mt-1.5 flex items-center gap-1.5 px-1 py-1 text-[10px] font-medium text-brand-charcoal">
          <Brain className="h-3 w-3" />
          Memory
        </span>
      </div>

      <div className="mt-2 min-h-0 flex-1 overflow-hidden px-2.5">
        {HISTORY.map((g) => (
          <div key={g.g} className="mb-1.5">
            <p className="px-1 py-1 text-[7.5px] font-bold uppercase tracking-[0.14em] text-brand-gray">
              {g.g}
            </p>
            {g.items.map((t, i) => {
              // History carries the coach's own glyph, so the split is visible
              // even before you open anything.
              const isCoach = (i + g.g.length) % 2 === 0;
              return (
                <p key={t} className="flex items-center gap-1.5 rounded-md px-1 py-[3px] text-[9.5px] text-brand-charcoal">
                  {isCoach ? (
                    <Compass className="h-2.5 w-2.5 flex-none" style={{ color: COACH }} />
                  ) : (
                    <Bot className="h-2.5 w-2.5 flex-none" style={{ color: ASSISTANT }} />
                  )}
                  <span className="min-w-0 truncate">{t}</span>
                </p>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- top bar
function TopBar({ scene }: { scene: Scene }) {
  const c = COACHES[scene.who];
  const Icon = c.icon;
  return (
    <div className="flex flex-none items-center gap-2.5 border-b border-[#EDEAE4] px-4 py-2.5">
      <span className="grid h-[22px] w-[22px] flex-none place-items-center rounded-lg text-white" style={{ background: c.c }}>
        <Icon className="h-3 w-3" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[11.5px] font-bold leading-tight">
          {scene.view === "home"
            ? "New chat"
            : scene.who === "assistant"
              ? "Weekly status update"
              : "Where the business needs support"}
        </span>
        {scene.view === "chat" && (
          <span className="flex items-center gap-1 text-[8.5px] text-brand-gray">
            {c.name}
            <Chevron className="h-2 w-2" />
          </span>
        )}
      </span>
      <span className="ml-auto flex flex-none items-center gap-1.5 rounded-lg border border-[#E6E2DB] px-2 py-1 text-[9px] font-medium text-brand-charcoal">
        <Search className="h-2.5 w-2.5" />
        Search Multiply
        <span className="rounded bg-[#F1EEE9] px-1 font-mono text-[7.5px]">Ctrl K</span>
      </span>
    </div>
  );
}

// ---------------------------------------------------------------- composer
function Composer({ scene }: { scene: Scene }) {
  return (
    <div className="flex-none">
      <div
        data-t="composer"
        className="flex items-center gap-2 rounded-xl border border-[#E6E2DB] bg-white px-3 py-2 shadow-[0_2px_10px_-6px_rgba(40,30,15,0.28)]"
      >
        <Clip className="h-3.5 w-3.5 flex-none text-brand-gray" />
        <span className="min-w-0 flex-1 truncate text-[11px]">
          {scene.typed ? (
            <>
              {scene.typed}
              {!scene.tool && <span className="tour-caret" />}
            </>
          ) : (
            <span className="text-brand-gray">Ask Multi...</span>
          )}
        </span>
        <span className="flex flex-none items-center gap-1 rounded-lg bg-[#F4F1EC] px-1.5 py-1 text-[9px] font-medium">
          <Spark className="h-2.5 w-2.5" style={{ color: ASSISTANT }} />
          Sonnet 4.6
          <Chevron className="h-2 w-2 text-brand-gray" />
        </span>
        <span className="grid h-[20px] w-[20px] flex-none place-items-center rounded-full bg-[#F4F1EC] text-brand-charcoal">
          <Mic className="h-2.5 w-2.5" />
        </span>
        <span
          data-t="send"
          className={`grid h-[20px] w-[20px] flex-none place-items-center rounded-full text-white transition-all duration-200 ${
            scene.hot === "send" ? "shadow-[0_0_0_3px_rgba(234,123,27,0.4)]" : ""
          }`}
          style={{ background: scene.typed ? ASSISTANT : "#C4CBE8" }}
        >
          <Send className="h-2.5 w-2.5" />
        </span>
      </div>
      <p className="mt-1.5 text-center text-[8.5px] text-brand-gray">
        Coach responses are based on your live company data. Always verify important decisions with
        your team.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- home
function HomeView({ scene }: { scene: Scene }) {
  const c = COACHES[scene.who];

  return (
    <div className="flex min-h-0 flex-1 flex-col justify-center px-10 py-4">
      <div className="text-center">
        <span className="mx-auto grid h-[38px] w-[38px] place-items-center rounded-xl bg-gradient-to-br from-[#F49230] to-[#DE6F14] text-white">
          <Spark className="h-5 w-5" />
        </span>
        <h3 className="mt-2.5 text-[22px] font-extrabold tracking-tight">Good evening, Skylar.</h3>
        <p className="mt-0.5 text-[11px] text-brand-charcoal">{c.sub}. Ask away.</p>
      </div>

      <div className="mx-auto mt-3 w-full max-w-[560px]">
        <Composer scene={scene} />

        <div className="mt-2.5 grid grid-cols-2 gap-2">
          {(Object.keys(COACHES) as Which[]).map((k) => {
            const x = COACHES[k];
            const Icon = x.icon;
            const on = scene.who === k;
            return (
              <span
                key={k}
                data-t={`coach-${k}`}
                className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 transition-all duration-200 ${
                  scene.hot === `coach-${k}` ? "shadow-[0_0_0_3px_rgba(234,123,27,0.35)]" : ""
                }`}
                style={
                  on
                    ? { borderColor: `${x.c}66`, background: `${x.c}0F` }
                    : { borderColor: "#E6E2DB", background: "#fff" }
                }
              >
                <span
                  className="grid h-[24px] w-[24px] flex-none place-items-center rounded-lg"
                  style={on ? { background: x.c, color: "#fff" } : { background: "#F1EEE9", color: "#8A857D" }}
                >
                  <Icon className="h-3 w-3" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[10.5px] font-bold leading-tight" style={on ? { color: x.c } : undefined}>
                    {x.name}
                  </span>
                  <span className="block truncate text-[8.5px] text-brand-gray">{x.sub}</span>
                </span>
              </span>
            );
          })}
        </div>

        {/* The suggestions belong to the coach, not to the app. Switching one
            swaps all four, which is the clearest proof they are different. */}
        <div key={scene.who} className="sop-view mt-2 space-y-1.5">
          {c.prompts.map((p, i) => (
            <span
              key={p}
              data-t={`prompt-${i}`}
              className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 transition-all duration-200 ${
                scene.hot === `prompt-${i}`
                  ? "border-brand-orange/55 bg-[#FFF6EC] shadow-[0_0_0_2px_rgba(234,123,27,0.28)]"
                  : "border-[#EDEAE4] bg-white"
              }`}
            >
              <Spark className="h-2.5 w-2.5 flex-none" style={{ color: c.c }} />
              <span className="min-w-0 truncate text-[10px] text-brand-charcoal">{p}</span>
            </span>
          ))}
        </div>

        <p className="mt-2.5 text-center text-[8.5px] text-brand-gray">
          Powered by Claude &amp; GPT <span className="text-[#C4BFB6]">&middot;</span> Answers
          grounded in your live company data
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- chat
// One pane, two threads. Which one is showing is just which coach is selected,
// the same way it works in the product.
function ChatView({ scene, scrollRef }: { scene: Scene; scrollRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col px-8 pb-3 pt-3">
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-hidden">
        <div className="mx-auto max-w-[600px]">
          {scene.who === "assistant" ? <AssistantThread scene={scene} /> : <CoachThread scene={scene} />}
        </div>
      </div>

      <div className="mx-auto w-full max-w-[600px] pt-2">
        <Composer scene={scene} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- coach thread
// The reflective half. It does not produce an artefact, it produces a finding,
// and then draws the evidence when asked.
function CoachThread({ scene }: { scene: Scene }) {
  return (
    <>
      <div className="flex justify-end">
        <p className="max-w-[78%] rounded-2xl rounded-br-md bg-[#F1EEE9] px-3 py-2 text-[11px] font-medium">
          {ASKED}
        </p>
      </div>

      <div className="mt-3 flex gap-2.5">
        <span className="grid h-[22px] w-[22px] flex-none place-items-center rounded-lg text-white" style={{ background: COACH }}>
          <Compass className="h-3 w-3" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11.5px] leading-relaxed text-brand-charcoal">
            {scene.lead}
            {scene.lead.length > 0 && scene.lead.length < LEAD.length && <span className="tour-caret" />}
          </p>

          <div className="mt-2 space-y-1.5">
            {POINTS.slice(0, scene.points).map((p, i) => (
              <div
                key={p.h}
                className="sop-pop rounded-lg border px-2.5 py-1.5"
                style={{ borderColor: i === 0 ? `${RED}30` : "#EDEAE4", background: i === 0 ? `${RED}08` : "#FBFAF9" }}
              >
                <p className="text-[10.5px] font-bold leading-tight">{p.h}</p>
                <p className="mt-0.5 text-[10px] leading-snug text-brand-charcoal">{p.t}</p>
              </div>
            ))}
          </div>

          {scene.closed && (
            <p className="sop-view mt-2 text-[11.5px] font-semibold leading-relaxed">{CLOSE}</p>
          )}

          {(scene.closed || scene.chart) && (
            <p className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-[#F4F1EC] px-1.5 py-px font-mono text-[8px] text-brand-gray">
              Sonnet 4.6 <span className="text-[#C4BFB6]">&middot;</span> Anthropic
            </p>
          )}
        </div>
      </div>

      {/* the follow-up, and what it draws */}
      {scene.tool && (
        <>
          <div className="mt-3 flex justify-end">
            <p className="max-w-[78%] rounded-2xl rounded-br-md bg-[#F1EEE9] px-3 py-2 text-[11px] font-medium">
              {FOLLOW_UP}
            </p>
          </div>

          <div className="mt-3 flex gap-2.5">
            <span className="grid h-[22px] w-[22px] flex-none place-items-center rounded-lg text-white" style={{ background: COACH }}>
              <Compass className="h-3 w-3" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="inline-flex items-center gap-1.5 rounded-full border border-[#E6E2DB] bg-[#FBFAF9] px-2 py-[3px] text-[9px] font-medium text-brand-charcoal">
                <Tick className="h-2.5 w-2.5" style={{ color: "#1F7F4C" }} />
                Read your P&amp;L and scoreboard
              </p>

              {scene.chart && (
                <div className="sop-view mt-2 rounded-xl border border-[#EDEAE4] bg-white p-3">
                  <p className="flex items-center gap-2 text-[10.5px] font-bold">
                    Marketing spend against cost per lead
                    <span className="ml-auto font-mono text-[8px] font-normal text-brand-gray">
                      Feb to Jul 2026
                    </span>
                  </p>
                  <SpendChart />
                  <p className="mt-1.5 text-[10px] leading-snug text-brand-charcoal">
                    Spend is up 57% over six months. Cost per lead is up 64%. You are buying fewer
                    leads with more money, and the goal line is 18.
                  </p>
                  <p className="mt-1.5 flex items-center gap-1.5 text-[8.5px] text-brand-gray">
                    <Tick className="h-2.5 w-2.5" style={{ color: "#1F7F4C" }} />
                    Saved to Interactive AI Tools. Open, download, or share it with a link.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ---------------------------------------------------------------- assistant thread
// The operational half. It reads first and says so, then produces the artefact
// rather than advice about the artefact.
function AssistantThread({ scene }: { scene: Scene }) {
  return (
    <>
      <div className="flex justify-end">
        <p className="max-w-[78%] rounded-2xl rounded-br-md bg-[#F1EEE9] px-3 py-2 text-[11px] font-medium">
          {A_ASKED}
        </p>
      </div>

      <div className="mt-3 flex gap-2.5">
        <span className="grid h-[22px] w-[22px] flex-none place-items-center rounded-lg text-white" style={{ background: ASSISTANT }}>
          <Bot className="h-3 w-3" />
        </span>
        <div className="min-w-0 flex-1">
          {scene.aTool && (
            <p className="sop-pop inline-flex items-center gap-1.5 rounded-full border border-[#E6E2DB] bg-[#FBFAF9] px-2 py-[3px] text-[9px] font-medium text-brand-charcoal">
              <Tick className="h-2.5 w-2.5" style={{ color: "#1F7F4C" }} />
              {A_TOOL}
            </p>
          )}

          {scene.aLines > 0 && (
            <div className="sop-view mt-2 rounded-xl border border-[#EDEAE4] bg-white p-3">
              <p className="text-[11px] font-bold">
                Weekly Status Update <span className="font-normal text-brand-gray">Skylar Lewis</span>
              </p>
              <p className="text-[9px] text-brand-gray">August 18 to 24, week 33</p>

              <p className="mt-2 text-[10px] font-semibold">Wrapped up this week</p>
              <div className="mt-1 space-y-[3px]">
                {A_DONE.map((d) => (
                  <p key={d.l} className="flex items-center gap-1.5 text-[10px] text-brand-charcoal">
                    <Tick className="h-2.5 w-2.5 flex-none" style={{ color: "#1F7F4C" }} />
                    <span className="min-w-0 truncate">{d.l}</span>
                    <span className="flex-none text-brand-gray">{d.s}</span>
                  </p>
                ))}
              </div>

              {scene.aLines > 1 && (
                <div className="sop-view mt-2">
                  <p className="text-[10px] font-semibold">Still open, and overdue</p>
                  <div className="mt-1 space-y-[3px]">
                    {A_OPEN.map((d) => (
                      <p key={d.l} className="flex items-center gap-1.5 text-[10px] text-brand-charcoal">
                        <span className="h-[6px] w-[6px] flex-none rounded-full" style={{ background: RED }} />
                        <span className="min-w-0 truncate">{d.l}</span>
                        <span className="flex-none text-brand-gray">{d.s}</span>
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {scene.aLines > 2 && (
            <>
              <p className="sop-view mt-2 text-[11px] leading-relaxed text-brand-charcoal">{A_CLOSE}</p>
              <p className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-[#F4F1EC] px-1.5 py-px font-mono text-[8px] text-brand-gray">
                Sonnet 4.6 <span className="text-[#C4BFB6]">&middot;</span> Anthropic
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------- the chart
// Bars for spend, a line for cost per lead, and a dashed goal at 18. Two scales
// on one frame, because the whole finding is that they diverge.
function SpendChart() {
  const W = 300;
  const H = 74;
  const maxSpend = Math.max(...SPEND) * 1.08;
  const maxCpl = Math.max(...CPL, CPL_GOAL) * 1.15;

  const x = (i: number) => (i + 0.5) * (W / SPEND.length);
  const yCpl = (v: number) => H - (v / maxCpl) * H;

  const line = CPL.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${yCpl(v).toFixed(1)}`).join(" ");

  return (
    <div className="mt-1.5">
      <div className="relative" style={{ height: H }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" preserveAspectRatio="none" aria-hidden="true">
          {SPEND.map((v, i) => {
            const bw = (W / SPEND.length) * 0.52;
            const bh = (v / maxSpend) * H;
            return (
              <rect
                key={MONTHS[i]}
                x={x(i) - bw / 2}
                y={H - bh}
                width={bw}
                height={bh}
                rx="2"
                fill={i === SPEND.length - 1 ? ASSISTANT : `${ASSISTANT}33`}
              />
            );
          })}
          <line
            x1="0"
            x2={W}
            y1={yCpl(CPL_GOAL)}
            y2={yCpl(CPL_GOAL)}
            stroke={AMBER}
            strokeWidth="1"
            strokeDasharray="4 3"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={line}
            fill="none"
            stroke={RED}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      <div className="mt-1 flex justify-between">
        {MONTHS.map((m) => (
          <span key={m} className="flex-1 text-center font-mono text-[7.5px] text-brand-gray">{m}</span>
        ))}
      </div>

      <div className="mt-1 flex items-center gap-3">
        <span className="flex items-center gap-1 text-[8px] text-brand-gray">
          <span className="h-[7px] w-[7px] rounded-[2px]" style={{ background: ASSISTANT }} />
          Marketing spend
        </span>
        <span className="flex items-center gap-1 text-[8px] text-brand-gray">
          <span className="h-[2px] w-3 rounded-full" style={{ background: RED }} />
          Cost per lead
        </span>
        <span className="flex items-center gap-1 text-[8px] text-brand-gray">
          <span className="h-[2px] w-3 rounded-full" style={{ background: AMBER }} />
          Goal 18
        </span>
      </div>
    </div>
  );
}
