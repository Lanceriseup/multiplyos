"use client";

// "Built-in AI" feature section — same anatomy as FeatureScoreboards, mirrored:
// the AI Coach widget sits on the LEFT (in an iris/violet gradient panel) and the
// copy on the RIGHT.
//
// The widget runs a looping "watch it work" sequence:
//   1. the AI reply streams in, key figures flashing as they land
//   2. three suggested-action chips slide in
//   3. a pointer glides over and clicks "Draft conversion play"
//   4. that becomes a follow-up request and the AI generates a plan
//   5. brief hold, then it resets and loops from the top
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useDemo } from "./DemoModal";

const BULLETS: React.ReactNode[] = [
  <>Ask anything about your business and get answers grounded in your <b className="font-semibold">real data</b>, not generic advice.</>,
  <>A built-in <b className="font-semibold">Fractional CMO</b> for marketing strategy, campaigns, and on-brand copy.</>,
  <>Turn a screen recording into a ready-to-run agent prompt with <b className="font-semibold">Build for AI Agent</b>.</>,
  <>Powered by Claude and included in your plan. Skip the $20-$200/mo AI subscriptions and pay only for what your team actually uses.</>,
];

type Seg = [string, boolean]; // [text, isBold]

// First reply — the revenue readout (bold figures flash on landing).
const ANSWER1: Seg[] = [
  ["You’re at ", false],
  ["$51k", true],
  [" against your ", false],
  ["$50k", true],
  [" goal - pacing ", false],
  ["8% ahead", true],
  [". Watch ", false],
  ["New Customers", true],
  [": 12 this week, but two are trial-only. Want me to draft a conversion play?", false],
];

// Follow-up reply after the "Draft conversion play" chip is clicked.
const ANSWER2: Seg[] = [
  ["Here’s a 3-step play to convert those 2 trials:\n\n", false],
  ["1. Send each a tailored case study today.\n", false],
  ["2. Offer a 15-min onboarding call to de-risk the switch.\n", false],
  ["3. Add a ", false],
  ["10% annual-prepay", true],
  [" incentive, expires Friday.\n\n", false],
  ["Projected lift: ", false],
  ["+$4k this month", true],
  [".", false],
];

const len = (segs: Seg[]) => segs.reduce((s, x) => s + x[0].length, 0);
const LEN1 = len(ANSWER1);
const LEN2 = len(ANSWER2);

const ACTIONS = ["Draft conversion play", "Message the team", "Add note to Scoreboard"];
const colTransition = { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const };

function Spark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.6 4L18 8.5 14 10l-2 4-2-4-4-1.5L10 7z" />
    </svg>
  );
}

// Render a segmented answer up to `n` chars; when `done`, show all and flash bolds.
function renderAnswer(segs: Seg[], n: number, done: boolean) {
  const nodes: React.ReactNode[] = [];
  let count = 0;
  let boldIdx = 0;
  for (let i = 0; i < segs.length; i++) {
    const [text, bold] = segs[i];
    const take = done ? text.length : Math.min(text.length, Math.max(0, n - count));
    if (take <= 0) {
      if (!done && n <= count) break;
      continue;
    }
    const piece = text.slice(0, take);
    if (bold) {
      const delay = boldIdx * 90;
      boldIdx += 1;
      nodes.push(
        <b key={i} className={`font-bold text-[#4B3CC4]${done ? " ai-num-flash" : ""}`} style={done ? { animationDelay: `${delay}ms` } : undefined}>
          {piece}
        </b>,
      );
    } else {
      nodes.push(<span key={i}>{piece}</span>);
    }
    count += take;
  }
  return nodes;
}

type Phase = "a1" | "chips" | "cursor" | "q2" | "a2" | "hold";

function CoachWidget({ play, instant }: { play: boolean; instant: boolean }) {
  const [phase, setPhase] = useState<Phase>("a1");
  const [n1, setN1] = useState(0);
  const [n2, setN2] = useState(0);
  const [chipPressed, setChipPressed] = useState(false);
  const [cursor, setCursor] = useState<{ x: number; y: number; on: boolean; press: boolean }>({ x: 0, y: 0, on: false, press: false });

  const widgetRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const chipRef = useRef<HTMLSpanElement>(null);

  const a1Done = phase !== "a1";
  const a2Done = phase === "hold";
  const showChips = phase === "chips" || phase === "cursor" || phase === "q2" || phase === "a2" || phase === "hold";
  const showQ2 = phase === "q2" || phase === "a2" || phase === "hold";

  // Keep the newest message in view as the conversation grows.
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [phase, n2]);

  useEffect(() => {
    if (instant) {
      setN1(LEN1);
      setPhase("chips");
      return;
    }
    if (!play) return;

    let alive = true;
    const timers: number[] = [];
    const wait = (ms: number) => new Promise<void>((res) => timers.push(window.setTimeout(res, ms)));
    const type = (total: number, set: (v: number) => void) =>
      new Promise<void>((res) => {
        let i = 0;
        const tick = () => {
          if (!alive) return res();
          i += 1;
          set(i);
          if (i < total) timers.push(window.setTimeout(tick, 18 + Math.random() * 22));
          else res();
        };
        tick();
      });

    (async function loop() {
      while (alive) {
        // reset
        setPhase("a1");
        setN1(0);
        setN2(0);
        setChipPressed(false);
        setCursor({ x: 0, y: 0, on: false, press: false });
        if (bodyRef.current) bodyRef.current.scrollTop = 0;
        await wait(600);
        if (!alive) break;

        // 1 · stream first answer
        await type(LEN1, setN1);
        if (!alive) break;
        await wait(450); // let the figures flash

        // 2 · options appear
        setPhase("chips");
        await wait(1100);
        if (!alive) break;

        // 3 · pointer glides in and clicks "Draft conversion play"
        setPhase("cursor");
        const wr = widgetRef.current?.getBoundingClientRect();
        const cr = chipRef.current?.getBoundingClientRect();
        if (wr && cr) {
          const cx = cr.left - wr.left + cr.width / 2;
          const cy = cr.top - wr.top + cr.height / 2;
          setCursor({ x: cx + 40, y: cy - 30, on: true, press: false }); // appear off the chip
          await wait(80);
          setCursor({ x: cx, y: cy, on: true, press: false }); // glide onto it
          await wait(680);
          setChipPressed(true);
          setCursor({ x: cx, y: cy, on: true, press: true }); // click
          await wait(220);
          setCursor({ x: cx, y: cy, on: false, press: false });
        } else {
          await wait(500);
        }
        if (!alive) break;
        await wait(160);

        // 4 · follow-up request + generated plan
        setPhase("q2");
        await wait(480);
        setPhase("a2");
        await type(LEN2, setN2);
        if (!alive) break;

        // 5 · hold, then loop
        setPhase("hold");
        await wait(3200);
      }
    })();

    return () => {
      alive = false;
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [play, instant]);

  const bubbleAi = "flex-1 rounded-xl rounded-bl-[4px] bg-[#FAFAFF] px-3.5 py-2.5 leading-relaxed";
  const avatar = "grid h-6 w-6 flex-none place-items-center rounded-[7px] bg-gradient-to-br from-[#7A6BF0] to-[#5B4BD6] text-white";

  return (
    <div ref={widgetRef} className="relative flex h-[380px] flex-col overflow-hidden rounded-2xl border border-[#140F28]/[0.08] bg-white text-[12.5px] text-brand-ink shadow-[0_24px_50px_-28px_rgba(30,20,40,0.5),0_2px_6px_-3px_rgba(30,20,40,0.14)] sm:h-[468px]">
      {/* header */}
      <div className="flex items-center gap-2.5 border-b border-[#140F28]/[0.08] px-4 py-3.5">
        <span className={avatar}>
          <Spark className="h-[13px] w-[13px]" />
        </span>
        <b className="text-[14px] font-bold tracking-tight">AI Business Coach</b>
      </div>

      {/* conversation */}
      <div ref={bodyRef} className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
        <div className="max-w-[84%] self-end rounded-xl rounded-br-[4px] bg-[#F1F0FB] px-3.5 py-2.5 leading-relaxed text-[#2b2740]">
          How are we tracking toward our revenue goal this week?
        </div>

        <div className="flex items-start gap-2.5">
          <span className={avatar}><Spark className="h-3 w-3" /></span>
          <div className={bubbleAi}>
            <span>
              {renderAnswer(ANSWER1, n1, a1Done)}
              {phase === "a1" && <span className="ai-caret" />}
            </span>
            <div className="mt-2 hidden items-center gap-1.5 text-[10.5px] text-[#8A86A6] transition-opacity duration-500 sm:flex" style={{ opacity: a1Done ? 1 : 0 }}>
              <span className="text-[8px] text-[#5B4BD6]">◆</span>
              Grounded in your Leadership Scoreboard · updated 2m ago
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {ACTIONS.map((a, k) => (
                <span
                  key={a}
                  ref={k === 0 ? chipRef : undefined}
                  className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-all duration-300 ${k >= 1 ? "hidden sm:inline-block" : ""}`}
                  style={{
                    opacity: showChips ? 1 : 0,
                    transform: showChips ? (k === 0 && chipPressed ? "scale(0.95)" : "none") : "translateY(4px)",
                    transitionDelay: showChips && phase === "chips" ? `${k * 110}ms` : "0ms",
                    borderColor: k === 0 && chipPressed ? "transparent" : "rgba(91,75,214,0.16)",
                    background: k === 0 && chipPressed ? "#5B4BD6" : "rgba(91,75,214,0.09)",
                    color: k === 0 && chipPressed ? "#fff" : "#4B3CC4",
                  }}
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Follow-up exchange — desktop only; on mobile we keep the widget short. */}
        <div className="hidden sm:contents">
          {showQ2 && (
            <div className="max-w-[84%] self-end rounded-xl rounded-br-[4px] bg-[#F1F0FB] px-3.5 py-2.5 leading-relaxed text-[#2b2740]">
              Draft conversion play
            </div>
          )}

          {showQ2 && (
            <div className="flex items-start gap-2.5">
              <span className={avatar}><Spark className="h-3 w-3" /></span>
              <div className={`${bubbleAi} whitespace-pre-line`}>
                {renderAnswer(ANSWER2, n2, a2Done)}
                {phase === "a2" && <span className="ai-caret" />}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* fake pointer */}
      <div
        className="pointer-events-none absolute left-0 top-0 z-20 [filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.3))]"
        style={{
          transform: `translate(${cursor.x}px, ${cursor.y}px) scale(${cursor.press ? 0.86 : 1})`,
          opacity: cursor.on ? 1 : 0,
          transition: "transform 0.6s cubic-bezier(0.22,1,0.36,1), opacity 0.3s ease",
        }}
      >
        <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="#fff" stroke="#1B1A17" strokeWidth={1.4} strokeLinejoin="round">
          <path d="M5 3l14 8-6 1.5 3.5 6-2.8 1.6-3.5-6L7 18z" />
        </svg>
      </div>

      {/* modes */}
      <div className="hidden flex-wrap gap-1.5 px-4 pb-3 sm:flex">
        <span className="rounded-full bg-[#5B4BD6] px-2.5 py-1.5 text-[11px] font-semibold text-white">Ask</span>
        <span className="rounded-full border border-[#140F28]/[0.08] bg-[#F5F4FD] px-2.5 py-1.5 text-[11px] font-semibold text-[#8A86A6]">Fractional CMO</span>
        <span className="rounded-full border border-[#140F28]/[0.08] bg-[#F5F4FD] px-2.5 py-1.5 text-[11px] font-semibold text-[#8A86A6]">Build for AI Agent</span>
      </div>

      {/* input */}
      <div className="mx-4 mb-4 flex items-center gap-2.5 rounded-[11px] border border-[#140F28]/[0.08] bg-[#FAFAFE] px-3.5 py-3 text-[#8A86A6]">
        Ask anything about your business…
        <span className="ml-auto grid h-6 w-6 flex-none place-items-center rounded-[7px] bg-[#5B4BD6] text-[13px] text-white">↑</span>
      </div>
    </div>
  );
}

export default function FeatureBuiltInAI() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion() ?? false;
  const { openDemo } = useDemo();

  return (
    <section id="ai" className="scroll-mt-24 px-5 py-8 sm:px-8 sm:py-24">
      <div className="mx-auto grid max-w-container items-center gap-8 lg:grid-cols-2 lg:gap-16">
        {/* visual — LEFT (iris gradient panel) */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ ...colTransition, delay: 0.1 }}
          className="rounded-2xl p-3 sm:rounded-[28px] sm:p-8"
          style={{ background: "linear-gradient(160deg, #EEEDFF, #E0DEFF)" }}
        >
          <CoachWidget play={inView} instant={reduce} />
        </motion.div>

        {/* copy — RIGHT on desktop, but FIRST on mobile (above the widget) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={colTransition}
          className="order-first text-center lg:order-none lg:text-left"
        >
          <p className="mb-4 text-[13px] font-bold uppercase tracking-[0.14em] text-[#4B3CC4]">
            Built-in AI
          </p>

          <h2 className="text-[27px] font-extrabold leading-[1.08] tracking-tight text-brand-ink sm:text-[52px] sm:leading-[1.04]">
            <span className="hidden sm:inline">Your </span>AI Chief of Staff,{" "}
            <span className="relative whitespace-nowrap">
              built in
              <svg
                className="absolute -bottom-2 left-0 h-3 w-full text-[#5B4BD6]"
                viewBox="0 0 120 12"
                preserveAspectRatio="none"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                strokeLinecap="round"
              >
                <path d="M3 8c26-5 74-6 114-3" />
              </svg>
            </span>
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-brand-charcoal sm:mt-6 sm:text-lg lg:mx-0">
            Meet the AI Business Coach that already knows your goals, your
            numbers, and your team - and tells you exactly what to do next.
          </p>

          <ul className="mt-4 flex flex-col items-center gap-2.5 text-left sm:mt-7 sm:gap-3.5 lg:items-start">
            {BULLETS.map((b, i) => (
              <li key={i} className="flex items-start gap-3 text-[13.5px] leading-relaxed text-brand-ink sm:text-[15px]">
                <svg viewBox="0 0 24 24" className="mt-0.5 h-[17px] w-[17px] flex-none text-[#2BA463]" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12l5 5L20 7" />
                </svg>
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <button type="button" onClick={openDemo} className="mt-5 inline-flex items-center gap-2.5 border-b-2 border-[#5B4BD6] pb-1 text-[15px] font-bold text-brand-ink sm:mt-8">
            Request a demo
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
