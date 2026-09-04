"use client";

// Notion-style feature section for Weekly Scoreboards. Left: category eyebrow +
// benefit headline + proof points. Right: a faithful replica of the real
// Leadership Scoreboard. On scroll-in the CURRENT-week values count up and flash
// green (plays once); a pointer then loops, grabbing a metric by its handle and
// dragging it up two spots to show the board is reorderable.
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useDemo } from "./DemoModal";

type Cur = { prefix: string; to: number; dec: number; suffix: string };
type Metric = { name: string; owner: Who; goal: string; prev: string; cur: Cur };

// One accountable person per metric. Every row used to render the same "SL"
// badge, which quietly contradicted the proof point sitting right beside it:
// "Owners on every metric, so nothing slips".
const PEOPLE = {
  SL: { from: "#F49230", to: "#D8563F" },
  DW: { from: "#6C5CE0", to: "#3B2EA6" },
  PN: { from: "#2E9E7A", to: "#1F7F4C" },
  MH: { from: "#C9832B", to: "#9A6115" },
  JR: { from: "#C9663A", to: "#8E3F1D" },
} as const;

type Who = keyof typeof PEOPLE;

const METRICS: Metric[] = [
  { name: "Revenue", owner: "SL", goal: "$50,000", prev: "$30.0k", cur: { prefix: "$", to: 51.0, dec: 1, suffix: "k" } },
  { name: "New Customers", owner: "JR", goal: "10", prev: "8", cur: { prefix: "", to: 12, dec: 0, suffix: "" } },
  { name: "Cash Balance", owner: "DW", goal: "$100,000", prev: "$96k", cur: { prefix: "$", to: 108.9, dec: 1, suffix: "k" } },
  { name: "Customer Satisfaction", owner: "PN", goal: "90%", prev: "88%", cur: { prefix: "", to: 93, dec: 0, suffix: "%" } },
  { name: "Team Tasks Completed", owner: "MH", goal: "25", prev: "21", cur: { prefix: "", to: 28, dec: 0, suffix: "" } },
];

const WEEKS = [["7/6", "7/12"], ["7/13", "7/19"], ["7/20", "7/26"]];
// Grid columns. On mobile we collapse to Metric · Goal · Current (via the
// responsive `sb-grid` classes below) so the green payoff column is on-screen
// instead of scrolled off to the right; the full 8-column layout returns at sm.
const SB_GRID =
  "grid-cols-[minmax(0,1fr)_86px_66px] w-full sm:w-max sm:grid-cols-[176px_44px_86px_66px_66px_46px_46px_46px]";

const POINTS = [
  "Goals and actuals side by side, every week",
  "Owners on every metric, so nothing slips",
];

const EASE = "cubic-bezier(0.22,1,0.36,1)";
const LIFT = "0 12px 26px -8px rgba(40,30,15,0.32)";

function fmt(cur: Cur, n: number) {
  return cur.prefix + (cur.dec ? n.toFixed(cur.dec) : Math.round(n)) + cur.suffix;
}

function CurrentCell({ cur, delay, play, instant }: { cur: Cur; delay: number; play: boolean; instant: boolean }) {
  const [val, setVal] = useState(instant ? cur.to : 0);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (!play || instant) return;
    let raf = 0;
    let t0 = 0;
    const dur = 900;
    const timeout = window.setTimeout(() => {
      const step = (ts: number) => {
        if (!t0) t0 = ts;
        const p = Math.min((ts - t0) / dur, 1);
        setVal(cur.to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) raf = requestAnimationFrame(step);
        else {
          setFlash(true);
          window.setTimeout(() => setFlash(false), 600);
        }
      };
      raf = requestAnimationFrame(step);
    }, delay);
    return () => {
      window.clearTimeout(timeout);
      cancelAnimationFrame(raf);
    };
  }, [play, instant, cur, delay]);

  return (
    <div className={`flex items-center justify-center bg-[#EAF7F0] px-2.5 py-2 ${flash ? "sb-flash" : ""}`}>
      <span className="font-bold tabular-nums text-[#2BA463]">{fmt(cur, val)}</span>
    </div>
  );
}

function ScoreboardVisual({ play, instant }: { play: boolean; instant: boolean }) {
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cursorRef = useRef<HTMLDivElement>(null);

  // Cursor-driven drag-to-reorder: a sequence of distinct moves on different
  // metrics, then the board resets and the sequence loops. Starts when in view.
  useEffect(() => {
    if (!play || instant) return;
    const rows = rowRefs.current.filter(Boolean) as HTMLDivElement[];
    const cursor = cursorRef.current;
    if (rows.length < 5 || !cursor) return;
    const cursorEl = cursor; // non-null, so the nested closures keep the type

    const h = rows[0].getBoundingClientRect().height;
    const handleX = 24;
    let cancelled = false;
    const slot = rows.map((_, i) => i); // slot[i] = current visual position of DOM row i
    const yState = rows.map(() => 0); // current translateY of each row
    const wait = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

    // Grab whatever metric sits at `fromSlot` and drop it at `toSlot`.
    function doMove(fromSlot: number, toSlot: number) {
      const di = slot.indexOf(fromSlot);
      const newSlot = rows.map((_, j) => {
        const s = slot[j];
        if (j === di) return toSlot;
        if (fromSlot < toSlot) return s > fromSlot && s <= toSlot ? s - 1 : s;
        return s >= toSlot && s < fromSlot ? s + 1 : s;
      });
      const newY = rows.map((_, j) => (newSlot[j] - j) * h);
      const grabY = fromSlot * h + h / 2;
      const dropY = toSlot * h + h / 2;
      const D = 1500;

      rows.forEach((r, j) => { r.style.zIndex = j === di ? "6" : "1"; });

      const anims: Animation[] = [];
      anims.push(rows[di].animate([
        { transform: `translateY(${yState[di]}px)`, boxShadow: "none", borderRadius: "0px", offset: 0 },
        { transform: `translateY(${yState[di]}px) scale(1.02)`, boxShadow: LIFT, borderRadius: "8px", offset: 0.16 },
        { transform: `translateY(${newY[di]}px) scale(1.02)`, boxShadow: LIFT, borderRadius: "8px", offset: 0.82 },
        { transform: `translateY(${newY[di]}px) scale(1)`, boxShadow: "none", borderRadius: "0px", offset: 1 },
      ], { duration: D, easing: EASE, fill: "forwards" }));

      rows.forEach((r, j) => {
        if (j === di || newY[j] === yState[j]) return;
        anims.push(r.animate(
          [{ transform: `translateY(${yState[j]}px)` }, { transform: `translateY(${newY[j]}px)` }],
          { duration: D, easing: EASE, fill: "forwards" },
        ));
      });

      anims.push(cursorEl.animate([
        { transform: `translate(${handleX + 40}px,${grabY - 28}px)`, opacity: 0, offset: 0 },
        { transform: `translate(${handleX}px,${grabY}px)`, opacity: 1, offset: 0.16 },
        { transform: `translate(${handleX}px,${grabY}px)`, opacity: 1, offset: 0.24 },
        { transform: `translate(${handleX}px,${dropY}px)`, opacity: 1, offset: 0.82 },
        { transform: `translate(${handleX}px,${dropY}px)`, opacity: 1, offset: 0.9 },
        { transform: `translate(${handleX + 40}px,${dropY - 28}px)`, opacity: 0, offset: 1 },
      ], { duration: D, easing: EASE, fill: "forwards" }));

      return Promise.all(anims.map((a) => a.finished))
        .then(() => {
          rows.forEach((r, j) => {
            r.style.transform = `translateY(${newY[j]}px)`;
            yState[j] = newY[j];
            slot[j] = newSlot[j];
          });
          anims.forEach((a) => a.cancel());
        })
        .catch(() => {});
    }

    // Smoothly return every metric to its original position.
    function resetMove() {
      const anims: Animation[] = [];
      rows.forEach((r, j) => {
        if (yState[j] === 0) return;
        anims.push(r.animate(
          [{ transform: `translateY(${yState[j]}px)` }, { transform: "translateY(0px)" }],
          { duration: 850, easing: EASE, fill: "forwards" },
        ));
      });
      return Promise.all(anims.map((a) => a.finished))
        .then(() => {
          rows.forEach((r, j) => { r.style.transform = ""; yState[j] = 0; slot[j] = j; });
          anims.forEach((a) => a.cancel());
        })
        .catch(() => {});
    }

    (async function loop() {
      await wait(1800); // let the count-up land first
      while (!cancelled) {
        await doMove(3, 1); if (cancelled) break;
        await wait(450); if (cancelled) break;
        await doMove(4, 2); if (cancelled) break;
        await wait(450); if (cancelled) break;
        await doMove(0, 3); if (cancelled) break;
        await wait(900); if (cancelled) break;
        await resetMove(); if (cancelled) break;
        await wait(600);
      }
    })();

    return () => {
      cancelled = true;
      rows.forEach((r) => r.getAnimations().forEach((a) => a.cancel()));
      cursorEl.getAnimations().forEach((a) => a.cancel());
    };
  }, [play, instant]);

  return (
    <div className="overflow-hidden rounded-2xl border border-black/5 bg-white text-[12px] text-brand-ink shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4),0_2px_6px_-3px_rgba(40,30,15,0.12)]">
      {/* top bar */}
      <div className="flex items-center gap-2.5 px-4 pb-2 pt-3.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-orange opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-orange" />
        </span>
        <span className="text-[15px] font-extrabold tracking-tight">Leadership Scoreboard ▾</span>
        <span className="ml-auto hidden gap-1.5 sm:flex">
          <span className="rounded-md border border-[#E3E0DA] px-2 py-1 text-[10.5px] font-semibold text-[#57534C]">Settings</span>
          <span className="rounded-md bg-brand-ink px-2 py-1 text-[10.5px] font-semibold text-white">+ Add Metric/KPI</span>
        </span>
      </div>
      <div className="hidden px-4 text-[11.5px] text-brand-gray sm:block">High-level metrics every leader should track weekly.</div>
      <div className="hidden items-center gap-2 px-4 pt-1.5 text-[11px] text-brand-gray sm:flex">
        FY 2026 (Current) · Week 26 of 52
        <span className="rounded-full bg-[#EAF1FB] px-2 py-0.5 font-semibold text-[#3E7BC0]">Weekly</span>
      </div>

      {/* AI insights */}
      <div className="mx-4 mt-2.5 hidden items-center gap-2.5 rounded-[10px] border border-[#ECEAE6] px-3 py-2 sm:flex">
        <span className="grid h-[22px] w-[22px] flex-none place-items-center rounded-[7px] bg-gradient-to-br from-[#F49230] to-[#EA7B1B]">
          <svg viewBox="0 0 24 24" className="h-[13px] w-[13px] text-white" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.6 4L18 8.5 14 10l-2 4-2-4-4-1.5L10 7z" /></svg>
        </span>
        <b className="text-[12px]">AI Insights</b>
        <span className="rounded-full bg-brand-orange/[0.12] px-2 py-0.5 text-[9.5px] font-semibold text-brand-orange">AI-generated</span>
        <span className="text-[11px] text-brand-gray">Revenue is pacing 8% ahead of goal.</span>
        <span className="ml-auto text-brand-gray">›</span>
      </div>

      {/* filters */}
      <div className="hidden items-center gap-1.5 px-4 pb-2 pt-3 text-[11.5px] text-brand-gray sm:flex">
        <span className="rounded-md bg-[#EDEAE4] px-2.5 py-1 font-semibold text-brand-ink">All</span>
        <span className="px-1.5">High</span>
        <span className="px-1.5">Watch</span>
        <span className="ml-1">↕ Priority</span>
      </div>

      {/* grid table (fades off to the right to imply all 52 weeks) */}
      <div className="relative overflow-hidden border-t border-[#ECEAE6]">
        <span className="pointer-events-none absolute inset-y-0 right-0 z-[8] hidden w-14 bg-gradient-to-l from-white sm:block" />

        {/* header */}
        <div
          className={`grid items-center bg-[#FAF9F7] ${SB_GRID} [&>div]:px-2.5 [&>div]:py-2 [&>div]:text-[9px] [&>div]:font-semibold [&>div]:uppercase [&>div]:leading-tight [&>div]:tracking-wide [&>div]:text-brand-gray`}
        >
          <div className="!text-left">Metric</div>
          <div className="hidden text-center sm:block">Owner</div>
          <div className="text-center">Goal</div>
          <div className="hidden text-center sm:block">Prev<br />6/22</div>
          <div className="text-center !text-brand-orange">Current<br />6/29</div>
          {WEEKS.map((w) => (
            <div key={w[0]} className="hidden text-center font-normal sm:block">{w[0]}<br />{w[1]}</div>
          ))}
        </div>

        {/* rows */}
        <div className="relative">
          {/* fake cursor for the drag */}
          <div ref={cursorRef} className="pointer-events-none absolute left-0 top-0 z-20 opacity-0 [filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.3))]">
            <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="#fff" stroke="#1B1A17" strokeWidth={1.4} strokeLinejoin="round">
              <path d="M5 3l14 8-6 1.5 3.5 6-2.8 1.6-3.5-6L7 18z" />
            </svg>
          </div>

          {METRICS.map((m, i) => (
            <div
              key={m.name}
              ref={(el) => { rowRefs.current[i] = el; }}
              className={`relative grid h-[52px] items-stretch border-b border-[#F1EEE9] bg-white [will-change:transform] ${SB_GRID}`}
            >
              <div className="flex min-w-0 items-center px-2.5 py-2">
                <span className="flex min-w-0 items-center gap-1.5 text-[12px] font-semibold">
                  <span className="flex-none cursor-grab tracking-[-2px] text-brand-gray">⠿</span>
                  <span className="truncate">{m.name}</span>
                  <span className="flex-none text-[#2BA463]">↑</span>
                  <span className="flex-none text-brand-gray">☆</span>
                </span>
              </div>
              <div className="hidden items-center justify-center px-2.5 py-2 sm:flex">
                <span
                  className="inline-grid h-5 w-5 place-items-center rounded-[5px] text-[8.5px] font-bold text-white"
                  style={{ background: `linear-gradient(135deg, ${PEOPLE[m.owner].from}, ${PEOPLE[m.owner].to})` }}
                >
                  {m.owner}
                </span>
              </div>
              <div className="flex items-center justify-center border-l border-[#ECEAE6] px-2.5 py-2">
                <span className="inline-block rounded-[5px] border border-[#E3E0DA] px-2 py-1 font-bold">{m.goal}</span>
              </div>
              <div className="hidden items-center justify-center bg-[#FBEEEB] px-2.5 py-2 sm:flex">
                <span className="font-bold tabular-nums text-[#D8563F]">{m.prev}</span>
              </div>
              <CurrentCell cur={m.cur} delay={250 + i * 220} play={play} instant={instant} />
              {WEEKS.map((w) => (
                <div key={w[0]} className="hidden items-center justify-center px-2.5 py-2 text-brand-gray sm:flex">–</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const colTransition = { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const };

export default function FeatureScoreboards() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion() ?? false;
  const { openDemo } = useDemo();

  return (
    <section id="features" className="scroll-mt-24 px-5 py-8 sm:px-8 sm:py-24">
      <div className="mx-auto grid max-w-container items-center gap-8 lg:grid-cols-2 lg:gap-16">
        {/* copy */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={colTransition}
          className="text-center lg:text-left"
        >
          {/* eyebrow — Option B treatment, slightly larger */}
          <p className="mb-4 text-[13px] font-bold uppercase tracking-[0.14em] text-brand-orange-dark">
            Weekly Scoreboards
          </p>

          {/* headline with a hand-drawn swash under "week." */}
          <h2 className="text-[27px] font-extrabold leading-[1.08] tracking-tight text-brand-ink sm:text-[52px] sm:leading-[1.04]">
            Know if you won the{" "}
            <span className="relative whitespace-nowrap">
              week.
              <svg
                className="absolute -bottom-2 left-0 h-3 w-full text-brand-orange"
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
            Every department gets a live scoreboard, so green and red weeks show
            at a glance. No spreadsheets, no end-of-month surprises.
          </p>

          {/* proof points — green checks */}
          <ul className="mt-4 flex flex-col items-center gap-2 sm:mt-7 sm:gap-3 lg:items-start">
            {POINTS.map((p) => (
              <li key={p} className="flex items-center gap-3 text-[13.5px] text-brand-ink sm:text-[15px]">
                <svg viewBox="0 0 24 24" className="h-[17px] w-[17px] flex-none text-[#2BA463]" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12l5 5L20 7" />
                </svg>
                {p}
              </li>
            ))}
          </ul>

          {/* CTA — editorial text link */}
          <button type="button" onClick={openDemo} className="mt-5 inline-flex items-center gap-2.5 border-b-2 border-brand-orange pb-1 text-[15px] font-bold text-brand-ink sm:mt-8">
            Request a demo
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </motion.div>

        {/* visual */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ ...colTransition, delay: 0.1 }}
          className="rounded-2xl p-3 sm:rounded-[28px] sm:p-8"
          style={{ background: "linear-gradient(160deg, #FFF1E2, #FFE7D2)" }}
        >
          <ScoreboardVisual play={inView} instant={reduce} />
        </motion.div>
      </div>
    </section>
  );
}
