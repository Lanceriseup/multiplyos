"use client";

// CFO Dashboard feature section (Notion "two-tone panel" layout): a centered
// headline on top, then a contained panel - dashboard on a yellow panel on the
// left, white copy on the right. On scroll-in the revenue line draws in, then a
// cursor tours the dashboard: it highlights a KPI, reads the chart (tooltip),
// and pops the expense pie (callout). Themed yellow to set it apart from the
// orange Weekly Scoreboards section above.
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import { useDemo } from "./DemoModal";

const POINTS = [
  "Live KPIs pulled from your scoreboards",
  "Revenue trend and expense breakdown at a glance",
  "An AI read on the next move to make",
];

const KPIS = [
  { label: "Revenue", value: "$214.8k", delta: "▲ 12%" },
  { label: "Gross Margin", value: "62%", delta: "▲ 3 pts" },
  { label: "Cash", value: "$486k", delta: "▲ $22k" },
];

const colTransition = { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const };

function CfoDashboard({ play, instant }: { play: boolean; instant: boolean }) {
  const anim = play && !instant;
  const rootRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const calloutRef = useRef<HTMLSpanElement>(null);
  const kpiRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const pieRef = useRef<HTMLSpanElement>(null);

  // Cursor tour loop.
  useEffect(() => {
    if (!play || instant) return;
    // The cursor tour is a desktop flourish; skip it on mobile (the trimmed
    // dashboard hides the pie it tours to, which would glitch the cursor).
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches) return;
    const root = rootRef.current!, cur = cursorRef.current!, tip = tipRef.current!, callout = calloutRef.current!;
    const kpi = kpiRef.current!, chart = chartRef.current!, pie = pieRef.current!;
    if (!root || !cur || !tip || !callout || !kpi || !chart || !pie) return;

    let cancelled = false;
    const timers: number[] = [];
    const rel = (node: HTMLElement) => {
      const r = node.getBoundingClientRect();
      const d = root.getBoundingClientRect();
      return { x: r.left - d.left, y: r.top - d.top, w: r.width, h: r.height };
    };

    const run = () => {
      if (cancelled) return;
      const k = rel(kpi), c = rel(chart), p = rel(pie);
      const kx = k.x + k.w * 0.5, ky = k.y + k.h * 0.6;
      const cx = c.x + c.w - 16, cy = c.y + c.h * 0.58;
      const px = p.x + p.w * 0.5, py = p.y + p.h * 0.5;

      cur.animate(
        [
          { transform: `translate(${kx + 30}px,${ky - 24}px)`, opacity: 0, offset: 0 },
          { transform: `translate(${kx}px,${ky}px)`, opacity: 1, offset: 0.1 },
          { transform: `translate(${kx}px,${ky}px)`, opacity: 1, offset: 0.24 },
          { transform: `translate(${cx}px,${cy}px)`, opacity: 1, offset: 0.42 },
          { transform: `translate(${cx}px,${cy}px)`, opacity: 1, offset: 0.56 },
          { transform: `translate(${px}px,${py}px)`, opacity: 1, offset: 0.74 },
          { transform: `translate(${px}px,${py}px)`, opacity: 1, offset: 0.88 },
          { transform: `translate(${px + 30}px,${py - 24}px)`, opacity: 0, offset: 1 },
        ],
        { duration: 7000, easing: "ease-in-out" },
      );

      timers.push(window.setTimeout(() => { kpi.style.transform = "translateY(-3px) scale(1.02)"; kpi.style.boxShadow = "0 12px 24px -10px rgba(60,45,10,0.32)"; }, 750));
      timers.push(window.setTimeout(() => { kpi.style.transform = ""; kpi.style.boxShadow = ""; }, 1900));
      timers.push(window.setTimeout(() => { tip.style.left = `${cx}px`; tip.style.top = `${cy}px`; tip.style.opacity = "1"; }, 2900));
      timers.push(window.setTimeout(() => { tip.style.opacity = "0"; }, 4000));
      timers.push(window.setTimeout(() => { pie.style.transform = "scale(1.08)"; callout.style.left = `${px + 4}px`; callout.style.top = `${py - 34}px`; callout.style.opacity = "1"; }, 5100));
      timers.push(window.setTimeout(() => { pie.style.transform = ""; callout.style.opacity = "0"; }, 6400));
    };

    run();
    const iv = window.setInterval(run, 7400);
    return () => {
      cancelled = true;
      clearInterval(iv);
      timers.forEach((t) => clearTimeout(t));
      cur.getAnimations().forEach((a) => a.cancel());
    };
  }, [play, instant]);

  return (
    <div ref={rootRef} className="relative w-full overflow-hidden rounded-[13px] border border-black/5 bg-[#F6F5F3] shadow-[0_20px_44px_-26px_rgba(60,45,10,0.4),0_2px_6px_-3px_rgba(60,45,10,0.12)] lg:w-auto lg:min-w-[540px]">
      <div className="px-3.5 pt-2.5 text-[10.5px] text-brand-gray">Good morning, Skylar.</div>

      {/* header */}
      <div className="flex items-center gap-2 px-3.5 pt-1">
        <span className="grid h-[26px] w-[26px] place-items-center rounded-[7px] bg-[#F2B01E]/15 text-[#A16207]">
          <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth={1.9}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
        </span>
        <span className="text-[18px] font-extrabold tracking-tight">CFO</span>
        <span className="rounded-full border border-[#E3E0DA] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#57534C]">Company</span>
        <span className="ml-auto hidden gap-1.5 sm:flex">
          <span className="inline-flex items-center gap-1.5 rounded-[7px] border border-[#E3E0DA] bg-white px-2 py-1 text-[10px] font-semibold text-[#57534C]"><svg viewBox="0 0 24 24" className="h-[11px] w-[11px] text-brand-gray" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M4 7h12M4 12h16M4 17h9" /></svg>Customize</span>
          <span className="inline-flex items-center gap-1.5 rounded-[7px] border border-[#E3E0DA] bg-white px-2 py-1 text-[10px] font-semibold text-[#57534C]"><svg viewBox="0 0 24 24" className="h-[11px] w-[11px] text-brand-gray" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></svg>Q2 · Jun 29 - Jul 5</span>
        </span>
      </div>

      {/* tabs */}
      <div className="hidden gap-1.5 px-3.5 pt-2.5 sm:flex">
        <span className="rounded-full border border-[#E3E0DA] bg-white px-2.5 py-0.5 text-[10.5px] font-semibold text-[#57534C]">Main Dashboard</span>
        <span className="rounded-full bg-[#F2B01E]/15 px-2.5 py-0.5 text-[10.5px] font-semibold text-[#A16207]">CFO</span>
        <span className="rounded-full border border-[#E3E0DA] bg-white px-2.5 py-0.5 text-[10.5px] font-semibold text-[#57534C]">+ New</span>
      </div>

      {/* body */}
      <div className="flex flex-col gap-2.5 p-3.5">
        {/* KPI row — 3 cards on desktop, a compact label/value list on mobile */}
        <div className="hidden grid-cols-3 gap-2.5 sm:grid">
          {KPIS.map((k, i) => (
            <div
              key={k.label}
              ref={i === 0 ? kpiRef : undefined}
              className="rounded-[11px] border border-[#ECEAE6] bg-white px-3 py-2.5 transition-[transform,box-shadow] duration-300"
            >
              <div className="text-[9.5px] font-bold uppercase tracking-wide text-brand-gray">{k.label}</div>
              <div className="mt-1 text-[19px] font-extrabold tracking-tight tabular-nums">{k.value}</div>
              <div className="mt-0.5 text-[10px] font-semibold text-[#2BA463]">{k.delta}</div>
            </div>
          ))}
        </div>
        <div className="rounded-[11px] border border-[#ECEAE6] bg-white px-3 sm:hidden">
          {KPIS.map((k) => (
            <div
              key={k.label}
              className="flex items-center justify-between border-t border-[#ECEAE6] py-2.5 first:border-t-0"
            >
              <span className="text-[10px] font-bold uppercase tracking-wide text-brand-gray">{k.label}</span>
              <span className="text-[16px] font-extrabold tracking-tight tabular-nums">
                {k.value}
                <span className="ml-1.5 text-[10px] font-semibold text-[#2BA463]">{k.delta}</span>
              </span>
            </div>
          ))}
        </div>

        {/* chart + pie */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[1.35fr_1fr]">
          <div ref={chartRef} className="rounded-[11px] border border-[#ECEAE6] bg-white px-3 py-2.5">
            <div className="text-[9.5px] font-bold uppercase tracking-wide text-brand-gray">Revenue · 6 months</div>
            <div className="mt-0.5 text-[16px] font-extrabold tabular-nums">$214.8k <span className="text-[11px] font-bold text-[#2BA463]">▲ 12%</span></div>
            <svg viewBox="0 0 300 74" preserveAspectRatio="none" className="mt-1.5 block h-[74px] w-full">
              <defs>
                <linearGradient id="cfoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#F2B01E" stopOpacity="0.28" />
                  <stop offset="1" stopColor="#F2B01E" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path className={`${instant ? "" : "cfo-area"} ${anim ? "cfo-area-play" : ""}`} d="M0 56 L50 50 L100 52 L150 38 L200 32 L250 22 L300 14 L300 74 L0 74 Z" fill="url(#cfoGrad)" />
              <path className={`${instant ? "" : "cfo-line"} ${anim ? "cfo-line-play" : ""}`} d="M0 56 L50 50 L100 52 L150 38 L200 32 L250 22 L300 14" fill="none" stroke="#E8A80F" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="300" cy="14" r="3.4" fill="#fff" stroke="#E8A80F" strokeWidth={2.4} />
            </svg>
          </div>
          <div className="hidden rounded-[11px] border border-[#ECEAE6] bg-white px-3 py-2.5 sm:block">
            <div className="text-[9.5px] font-bold uppercase tracking-wide text-brand-gray">Expense mix</div>
            <div className="mt-2 flex items-center gap-3">
              <span
                ref={pieRef}
                className="block h-[58px] w-[58px] flex-none rounded-full transition-transform duration-300"
                style={{
                  background: "conic-gradient(#F2B01E 0 48%, #F8CE63 48% 70%, #58B368 70% 88%, #E3DED6 88% 100%)",
                  boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.04)",
                }}
              />
              <div className="flex flex-col gap-1 text-[10px] text-brand-charcoal">
                <span className="flex items-center gap-1.5"><i className="h-[7px] w-[7px] rounded-sm bg-[#F2B01E]" />Payroll 48%</span>
                <span className="flex items-center gap-1.5"><i className="h-[7px] w-[7px] rounded-sm bg-[#F8CE63]" />Marketing 22%</span>
                <span className="flex items-center gap-1.5"><i className="h-[7px] w-[7px] rounded-sm bg-[#58B368]" />Ops 18%</span>
                <span className="flex items-center gap-1.5"><i className="h-[7px] w-[7px] rounded-sm bg-[#E3DED6]" />Other 12%</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI insight */}
        <div className="flex items-start gap-2.5 rounded-[11px] border border-[#ECEAE6] bg-gradient-to-r from-[#FFF8E4] to-white px-3 py-2.5">
          <span className="grid h-[22px] w-[22px] flex-none place-items-center rounded-[7px] bg-gradient-to-br from-[#F6C244] to-[#EAA00E]">
            <svg viewBox="0 0 24 24" className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.6 4L18 8.5 14 10l-2 4-2-4-4-1.5L10 7z" /></svg>
          </span>
          <div>
            <div className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-wide text-[#A16207]">
              Company Insights <span className="rounded-full bg-[#F2B01E]/15 px-1.5 py-0.5 text-[8px] text-[#A16207]">Coach</span>
            </div>
            <div className="mt-0.5 text-[11px] leading-snug text-brand-ink">Margin is up 3 pts on lower COGS, so you can fund the Sales Manager hire without touching runway.</div>
          </div>
        </div>
      </div>

      {/* tour overlays */}
      <span ref={tipRef} className="pointer-events-none absolute left-0 top-0 z-30 -translate-x-1/2 -translate-y-[150%] whitespace-nowrap rounded-md bg-brand-ink px-2 py-1 text-[10px] font-semibold text-white opacity-0 transition-opacity duration-200">Jul · $214.8k</span>
      <span ref={calloutRef} className="pointer-events-none absolute left-0 top-0 z-30 whitespace-nowrap rounded-full border border-brand-gray/30 bg-white px-2.5 py-1 text-[10px] font-semibold text-brand-ink opacity-0 shadow-[0_6px_14px_-6px_rgba(40,30,15,0.3)] transition-opacity duration-200">Payroll · 48%</span>
      <span ref={cursorRef} className="pointer-events-none absolute left-0 top-0 z-40 opacity-0 [filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.3))]">
        <svg viewBox="0 0 24 24" className="h-[20px] w-[20px]" fill="#fff" stroke="#1B1A17" strokeWidth={1.4} strokeLinejoin="round"><path d="M5 3l14 8-6 1.5 3.5 6-2.8 1.6-3.5-6L7 18z" /></svg>
      </span>
    </div>
  );
}

export default function FeatureCfo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion() ?? false;
  const { openDemo } = useDemo();

  return (
    <section id="cfo" className="scroll-mt-24 px-5 pb-6 pt-10 sm:px-8 sm:pt-24">
      <div className="mx-auto max-w-container">
        {/* headline on top - centered, one line on desktop */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={colTransition}
          className="text-center text-[27px] font-extrabold leading-[1.08] tracking-tight text-brand-ink sm:text-[52px] sm:leading-[1.04]"
        >
          Turn your numbers into{" "}
          <span className="relative whitespace-nowrap">
            decisions.
            <svg className="absolute -bottom-2 left-0 h-3 w-full text-[#F2B01E]" viewBox="0 0 120 12" preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round">
              <path d="M3 8c26-5 74-6 114-3" />
            </svg>
          </span>
        </motion.h2>

        {/* two-tone panel */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ ...colTransition, delay: 0.1 }}
          className="mt-6 grid overflow-hidden rounded-[28px] border border-brand-gray/25 bg-white shadow-[0_30px_60px_-34px_rgba(60,45,10,0.28)] sm:mt-9 lg:grid-cols-[1.18fr_0.82fr]"
        >
          {/* visual half - yellow panel (left, bleeds left) */}
          <div className="flex items-center justify-end overflow-hidden bg-gradient-to-br from-[#FFF8E1] to-[#FCEEB8] p-4 sm:p-8 sm:py-9 lg:pl-0">
            <CfoDashboard play={inView} instant={reduce} />
          </div>

          {/* copy half (right on desktop; centered below the panel on mobile) */}
          <div className="p-6 text-center sm:p-11 lg:text-left">
            <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-[#A16207]">CFO Dashboard</p>
            <h3 className="mt-3.5 text-2xl font-extrabold tracking-tight text-brand-ink">See the money side, clearly.</h3>
            <p className="mx-auto mt-3.5 max-w-sm text-sm leading-relaxed text-brand-charcoal sm:text-lg lg:mx-0">
              Cash, margin, and runway in real time, with an AI read on the next move.
            </p>
            <ul className="mx-auto mt-5 flex max-w-[280px] flex-col items-start gap-2.5 text-left sm:mt-6 sm:max-w-none sm:gap-3 lg:mx-0">
              {POINTS.map((p) => (
                <li key={p} className="flex items-start gap-3 text-[13.5px] text-brand-ink sm:items-center sm:text-[15px]">
                  <svg viewBox="0 0 24 24" className="mt-0.5 h-[17px] w-[17px] flex-none text-[#2BA463] sm:mt-0" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                  {p}
                </li>
              ))}
            </ul>

            <button type="button" onClick={openDemo} className="mt-5 inline-flex items-center gap-2.5 border-b-2 border-[#F2B01E] pb-1 text-[15px] font-bold text-brand-ink sm:mt-8">
              Request a demo
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
