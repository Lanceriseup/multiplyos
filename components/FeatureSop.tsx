"use client";

// SOP & Training feature section. Centered headline on top, then a two-tone
// panel: copy on the LEFT, the training-library visual on a soft brown panel on
// the RIGHT (mirror of the CFO block). Made-up product: walkthrough videos +
// a progress-tracked onboarding path.
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import { useDemo } from "./DemoModal";

const colTransition = { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const };

const POINTS = [
  "Video walkthroughs for every process",
  "Living SOPs your team actually uses",
  "See who's completed their training",
];

const LESSONS = [
  { title: "Set up your first scoreboard", meta: "4:12", state: "done" as const },
  { title: "Run a Leadership Meeting", meta: "6:30 · in progress", state: "prog" as const },
  { title: "Ask Multi AI for decisions", meta: "3:45", state: "next" as const },
];

const PLAY = (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
);

function SopLibrary() {
  const appRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<SVGSVGElement>(null);
  const inView = useInView(appRef, { once: true, margin: "-80px" });
  const reduce = useReducedMotion() ?? false;

  // Loop: cursor taps play -> video expands -> a scoreboard number is logged and
  // turns green -> collapses. Starts when scrolled into view.
  useEffect(() => {
    if (!inView || reduce) return;
    const app = appRef.current;
    const cur = cursorRef.current;
    if (!app || !cur) return;
    const playBtnRaw = app.querySelector<HTMLElement>(".sop-playbtn");
    const scrubRaw = app.querySelector<HTMLElement>(".sop-scrub > i");
    const cellRaw = app.querySelector<HTMLElement>(".sop-cell");
    const tipRaw = app.querySelector<HTMLElement>(".sop-tip");
    if (!playBtnRaw || !scrubRaw || !cellRaw || !tipRaw) return;

    // Capture the narrowed refs as non-null consts so TypeScript keeps the
    // narrowing inside the run()/rel() closures below (dev SWC skips the check;
    // the production tsc build enforces it).
    const appEl = app;
    const curEl = cur;
    const playBtn = playBtnRaw;
    const scrub = scrubRaw;
    const cell = cellRaw;
    const tip = tipRaw;

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const rel = (n: HTMLElement) => {
      const r = n.getBoundingClientRect();
      const d = appEl.getBoundingClientRect();
      return { x: r.left - d.left + r.width / 2, y: r.top - d.top + r.height / 2 };
    };

    function run() {
      if (cancelled) return;
      appEl.classList.remove("sop-open");
      cell.textContent = "–";
      cell.classList.remove("win");
      tip.style.opacity = "0";
      tip.textContent = "Log this week's number";
      scrub.style.transition = "none";
      scrub.style.width = "0";

      const p = rel(playBtn);
      curEl.animate(
        [
          { transform: `translate(${p.x + 28}px,${p.y + 32}px)`, opacity: 0, offset: 0 },
          { transform: `translate(${p.x}px,${p.y}px)`, opacity: 1, offset: 0.16 },
          { transform: `translate(${p.x}px,${p.y + 3}px)`, opacity: 1, offset: 0.2 },
          { transform: `translate(${p.x}px,${p.y}px)`, opacity: 1, offset: 0.24 },
          { transform: `translate(${p.x + 28}px,${p.y + 32}px)`, opacity: 0, offset: 0.4 },
          { transform: `translate(${p.x + 28}px,${p.y + 32}px)`, opacity: 0, offset: 1 },
        ],
        { duration: 6000, easing: "ease-in-out" },
      );

      timers.push(setTimeout(() => {
        appEl.classList.add("sop-open");
        void scrub.offsetWidth;
        scrub.style.transition = "width 3s linear";
        scrub.style.width = "100%";
      }, 1150));
      timers.push(setTimeout(() => { cell.textContent = "$54.1k"; cell.classList.add("win"); tip.style.opacity = "1"; }, 2500));
      timers.push(setTimeout(() => { tip.textContent = "You won the week ✓"; }, 3500));
      timers.push(setTimeout(() => { appEl.classList.remove("sop-open"); }, 5100));
    }

    run();
    const iv = setInterval(run, 6000);
    return () => {
      cancelled = true;
      clearInterval(iv);
      timers.forEach((t) => clearTimeout(t));
      curEl.getAnimations().forEach((a) => a.cancel());
    };
  }, [inView, reduce]);

  return (
    <div ref={appRef} className="sop-app relative w-full overflow-hidden rounded-[13px] border border-black/5 bg-[#F6F5F3] text-[12px] text-brand-ink shadow-[0_20px_44px_-26px_rgba(60,45,25,0.45),0_2px_6px_-3px_rgba(60,45,25,0.14)]">
      {/* header */}
      <div className="flex items-center gap-2 px-3.5 py-3">
        <span className="grid h-[26px] w-[26px] flex-none place-items-center rounded-[7px] bg-[#A56A43]/[0.14] text-[#7A4E28]">
          <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="4" width="18" height="14" rx="2" /><path d="M10 9l5 3-5 3z" fill="currentColor" stroke="none" /></svg>
        </span>
        <span className="text-[16px] font-extrabold tracking-tight">SOPs &amp; Training</span>
        <span className="rounded-full border border-[#E3E0DA] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#57534C]">Company</span>
        <span className="ml-auto flex gap-0.5 rounded-lg bg-[#EDEAE4] p-0.5">
          <span className="rounded-md bg-white px-2.5 py-1 text-[10.5px] font-semibold text-brand-ink">Training</span>
          <span className="px-2.5 py-1 text-[10.5px] font-semibold text-brand-gray">SOPs</span>
        </span>
      </div>

      {/* body (dims while the guide plays) */}
      <div className="sop-body flex flex-col gap-2.5 px-3.5 pb-3.5">
        {/* featured video */}
        <div className="flex gap-3">
          <div className="relative h-[84px] w-[148px] flex-none overflow-hidden rounded-[10px]" style={{ background: "linear-gradient(135deg,#6E4A2E,#A56A43)" }}>
            <div className="absolute inset-3 opacity-25">
              <span className="absolute left-0 top-0 block h-[5px] w-[60%] rounded bg-white" />
              <span className="absolute left-0 top-3 block h-[4px] w-[82%] rounded bg-white" />
              <span className="absolute left-0 top-6 block h-[4px] w-[40%] rounded bg-white" />
            </div>
            <span className="sop-playbtn absolute inset-0 m-auto grid h-[30px] w-[30px] place-items-center rounded-full bg-white/90 text-[#7A4E28] shadow-[0_4px_12px_rgba(0,0,0,0.25)]"><span className="h-[13px] w-[13px]">{PLAY}</span></span>
            <span className="absolute bottom-1.5 right-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-semibold text-white">4:12</span>
          </div>
          <div className="flex flex-col justify-center">
            <span className="self-start rounded-full bg-[#A56A43]/[0.14] px-2 py-0.5 text-[9px] font-bold text-[#7A4E28]">GET STARTED</span>
            <div className="mt-1.5 text-[14px] font-extrabold leading-tight">How to run your Weekly Scoreboard</div>
            <div className="mt-1 text-[11px] text-brand-gray">Training video · 4:12 · Skylar Lewis</div>
          </div>
        </div>

        {/* progress */}
        <div className="flex items-center gap-2 text-[10.5px] text-brand-gray">
          Onboarding path
          <span className="h-[5px] flex-1 overflow-hidden rounded-full bg-[#E7E0D6]"><span className="block h-full rounded-full bg-[#A56A43]" style={{ width: "38%" }} /></span>
          3 of 8 complete
        </div>

        {/* lessons */}
        {LESSONS.map((l) => (
          <div key={l.title} className="flex items-center gap-2.5 rounded-[9px] border border-[#ECEAE6] bg-white px-2.5 py-2">
            <span className="grid h-[24px] w-[38px] flex-none place-items-center rounded-[5px] text-white" style={{ background: "linear-gradient(135deg,#6E4A2E,#A56A43)" }}><span className="h-[10px] w-[10px]">{PLAY}</span></span>
            <div>
              <div className="text-[12px] font-semibold">{l.title}</div>
              <div className="text-[10px] text-brand-gray">{l.meta}</div>
            </div>
            <span className="ml-auto flex items-center">
              {l.state === "done" && (
                <span className="grid h-[17px] w-[17px] place-items-center rounded-full bg-[#2BA463]"><svg viewBox="0 0 24 24" className="h-[10px] w-[10px] text-white" fill="none" stroke="currentColor" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg></span>
              )}
              {l.state === "prog" && (
                <span className="h-[4px] w-[44px] overflow-hidden rounded-full bg-[#E7E0D6]"><span className="block h-full bg-[#A56A43]" style={{ width: "60%" }} /></span>
              )}
              {l.state === "next" && <span className="h-[14px] w-[14px] text-[#7A4E28]">{PLAY}</span>}
            </span>
          </div>
        ))}
      </div>

      {/* expanding player - a scoreboard walkthrough plays inside */}
      <div className="sop-player">
        <span className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[8px] font-bold text-white"><span className="h-[5px] w-[5px] rounded-full bg-[#F0655A]" />REC</span>
        <div className="px-3 pb-1.5 pt-2.5 text-[11px] font-extrabold">Leadership Scoreboard</div>
        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2 border-t border-[#ECEAE6] px-3 py-1.5 text-[10.5px]"><span>Revenue</span><span className="font-mono text-brand-gray">$50k</span><span className="sop-cell min-w-[46px] rounded border border-[#E3E0DA] py-0.5 text-center font-bold">–</span></div>
        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2 border-t border-[#ECEAE6] px-3 py-1.5 text-[10.5px]"><span>New Customers</span><span className="font-mono text-brand-gray">10</span><span className="min-w-[46px] rounded border border-[#E3E0DA] py-0.5 text-center font-bold">12</span></div>
        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2 border-t border-[#ECEAE6] px-3 py-1.5 text-[10.5px]"><span>Cash Balance</span><span className="font-mono text-brand-gray">$100k</span><span className="min-w-[46px] rounded border border-[#E3E0DA] py-0.5 text-center font-bold">$109k</span></div>
        <span className="sop-tip">Log this week&apos;s number</span>
        <div className="sop-scrub"><i /></div>
      </div>

      {/* cursor */}
      <svg ref={cursorRef} className="pointer-events-none absolute left-0 top-0 z-30 h-[18px] w-[18px] opacity-0 [filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.4))]" viewBox="0 0 24 24" fill="#fff" stroke="#1B1A17" strokeWidth={1.4} strokeLinejoin="round"><path d="M5 3l14 8-6 1.5 3.5 6-2.8 1.6-3.5-6L7 18z" /></svg>
    </div>
  );
}

export default function FeatureSop() {
  const { openDemo } = useDemo();
  return (
    <section id="sop" className="scroll-mt-24 px-5 pb-6 pt-10 sm:px-8 sm:pt-24">
      <div className="mx-auto max-w-container">
        {/* headline on top - centered */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={colTransition}
          className="text-center text-[27px] font-extrabold leading-[1.08] tracking-tight text-brand-ink sm:text-[52px] sm:leading-[1.04]"
        >
          Document once.{" "}
          <span className="relative whitespace-nowrap">
            Train forever.
            <svg className="absolute -bottom-2 left-0 h-3 w-full text-brand-orange" viewBox="0 0 130 12" preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round">
              <path d="M3 8c30-5 84-6 124-3" />
            </svg>
          </span>
        </motion.h2>

        {/* two-tone panel - copy left, visual right */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ ...colTransition, delay: 0.1 }}
          className="mt-6 grid overflow-hidden rounded-[28px] border border-brand-gray/25 bg-white shadow-[0_30px_60px_-34px_rgba(60,45,25,0.28)] sm:mt-9 lg:grid-cols-[0.82fr_1.18fr]"
        >
          {/* copy half (left on desktop; centered above the visual on mobile) */}
          <div className="p-6 text-center sm:p-11 lg:text-left">
            <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-[#7A4E28]">SOP &amp; Training</p>
            <h3 className="mt-3.5 text-2xl font-extrabold tracking-tight text-brand-ink">Turn how you work into training.</h3>
            <p className="mx-auto mt-3.5 max-w-sm text-sm leading-relaxed text-brand-charcoal sm:text-lg lg:mx-0">
              Capture the way your business runs as living SOPs and walkthrough videos, so new hires ramp fast and nothing stays locked in someone&apos;s head.
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
            <button type="button" onClick={openDemo} className="mt-5 inline-flex items-center gap-2.5 border-b-2 border-[#A56A43] pb-1 text-[15px] font-bold text-brand-ink sm:mt-8">
              Request a demo
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>

          {/* visual half (right) - brown panel */}
          <div className="flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#F4E7D7] to-[#E8D2B6] p-4 sm:p-8 sm:py-9">
            <SopLibrary />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
