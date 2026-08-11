"use client";

// The Multi AI closer, wired to the board.
//
// Deliberately unlike the four feature sections above it: centred heading, then a
// full-width diagram where the scoreboard sits on the left, the AI read-out on the
// right, and a dashed wire runs from each metric row to the insight it produced.
// That turns "grounded in your real numbers" from a claim into something visible.
//
// Wire geometry is measured from the live DOM (row centres to card centres) rather
// than hardcoded, so it stays attached when copy wraps or the container resizes.
// Below lg the wires are hidden and the two panels stack, since curves across a
// narrow gutter read as noise.
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

const AI = "#4B3CC4";
const RISK = "#C0402B";
const STEP = "#1F7F4C";
const GREEN = "#2BA463";
const RED = "#D8563F";

type Row = { name: string; value: string; hit: boolean };
type Insight = { tag: string; color: string; source: string; text: string };

// Marketing board here, so Tech is not the featured board in every mockup on the
// page. Each insight names the row it came from, so the two must stay in step.
const BOARD = "Marketing Scoreboard";

const ROWS: Row[] = [
  { name: "New Leads", value: "134", hit: true },
  { name: "Cost per Lead", value: "$21", hit: false },
  { name: "Email Open Rate", value: "41%", hit: true },
];

const INSIGHTS: Insight[] = [
  {
    tag: "Pattern",
    color: AI,
    source: "New Leads",
    text: "New Leads has beaten goal 4 weeks running, but cost per lead climbed from $16 to $21 over the same stretch. You are buying the growth, not earning it.",
  },
  {
    tag: "Risk",
    color: RISK,
    source: "Cost per Lead",
    text: "Cost per lead is $21 against an $18 goal and rising. At this pace the quarter's acquisition budget runs dry about three weeks early.",
  },
  {
    tag: "Next step",
    color: STEP,
    source: "Email Open Rate",
    text: "Email open rate is 41%, six points clear of goal. Move spend out of paid and into the list you already own.",
  },
];

const Spark = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.6 4L18 8.5 14 10l-2 4-2-4-4-1.5L10 7z" />
  </svg>
);

// Reads as a board of rows, for the left-hand column label.
const RowsIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round">
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.2" />
    <path d="M3.5 9.5h17M3.5 14.5h17" />
  </svg>
);

export default function MultiAiWired() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const inView = useInView(sectionRef, { once: true, margin: "-80px" });
  const reduce = useReducedMotion() ?? false;

  const [box, setBox] = useState({ w: 0, h: 0 });
  const [paths, setPaths] = useState<string[]>([]);

  // Measure the gap between the board's right edge and the panel's left edge,
  // then curve from each row centre to its matching card centre.
  const measure = useCallback(() => {
    const wrap = wrapRef.current;
    const board = boardRef.current;
    const ai = aiRef.current;
    if (!wrap || !board || !ai) return;

    const w = wrap.getBoundingClientRect();
    if (w.width <= 0) return;
    const b = board.getBoundingClientRect();
    const a = ai.getBoundingClientRect();

    // Stacked layout: the panels sit above one another, so there is nothing to wire.
    if (a.left < b.right) {
      setPaths([]);
      setBox({ w: w.width, h: w.height });
      return;
    }

    const sx = b.right - w.left;
    const ex = a.left - w.left;
    const dx = Math.max(28, (ex - sx) * 0.46);

    const next: string[] = [];
    for (let i = 0; i < ROWS.length; i++) {
      const row = rowRefs.current[i];
      const card = cardRefs.current[i];
      if (!row || !card) continue;
      const r = row.getBoundingClientRect();
      const c = card.getBoundingClientRect();
      const sy = r.top + r.height / 2 - w.top;
      const ey = c.top + c.height / 2 - w.top;
      next.push(`M${sx.toFixed(1)} ${sy.toFixed(1)} C${(sx + dx).toFixed(1)} ${sy.toFixed(1)}, ${(ex - dx).toFixed(1)} ${ey.toFixed(1)}, ${ex.toFixed(1)} ${ey.toFixed(1)}`);
    }
    setBox({ w: w.width, h: w.height });
    setPaths(next);
  }, []);

  useEffect(() => {
    measure();
    const wrap = wrapRef.current;
    if (!wrap) return;
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    const board = boardRef.current;
    const ai = aiRef.current;
    if (board) ro.observe(board);
    if (ai) ro.observe(ai);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  return (
    <section
      id="multi-ai"
      ref={sectionRef}
      className="relative overflow-hidden border-y border-[#E7E0F7] bg-[#FBFAFE] px-5 py-12 scroll-mt-24 sm:px-8 sm:py-24"
    >
      {/* aurora mesh: two violet orbs and one orange, drifting off the edges */}
      <span className="pointer-events-none absolute -top-[120px] left-[2%] h-[340px] w-[400px] rounded-full bg-[rgba(122,102,232,0.36)] blur-[52px]" />
      <span className="pointer-events-none absolute -top-[70px] right-[4%] h-[300px] w-[320px] rounded-full bg-[rgba(234,123,27,0.26)] blur-[52px]" />
      <span className="pointer-events-none absolute -bottom-[190px] left-[34%] h-[320px] w-[460px] rounded-full bg-[rgba(75,60,196,0.2)] blur-[52px]" />

      <div className="relative mx-auto max-w-container">
        {/* centred heading: the first break from the alternating sections above */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="mb-4 text-[13px] font-bold uppercase tracking-[0.14em] text-brand-orange-dark">
            Multi AI
          </p>
          <h2 className="text-[26px] font-extrabold leading-[1.1] tracking-tight text-brand-ink sm:text-[42px] sm:leading-[1.06]">
            Your scoreboard, read by{" "}
            <span className="relative whitespace-nowrap">
              an analyst.
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
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-brand-charcoal sm:mt-6 sm:text-lg">
            Multi AI is already looking at these numbers. Ask what to worry about and it answers from
            your actual data, naming the metric, the direction, and what to do next.
          </p>
        </motion.div>

        {/* the diagram */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 sm:mt-14"
        >
          {/* column labels: frosted pills sitting over their own column, so the
              flow from logged numbers to read-out is stated, not implied */}
          <div className="mb-4 hidden grid-cols-[minmax(0,0.78fr)_112px_minmax(0,1.12fr)] items-center lg:grid">
            <span className="inline-flex w-fit items-center justify-self-center gap-2.5 rounded-full border border-white/90 bg-white/70 py-2 pl-2.5 pr-4 shadow-[0_6px_18px_-12px_rgba(30,20,70,0.4)] backdrop-blur-[6px]">
              <span className="grid h-[22px] w-[22px] flex-none place-items-center rounded-md bg-[#8A3F6D] text-white">
                <RowsIcon className="h-[13px] w-[13px]" />
              </span>
              <span className="text-[12.5px] font-[650] tracking-[0.01em] text-[#33302C]">
                The numbers your team logs
              </span>
            </span>

            {/* empty gutter column, matching the diagram's grid below */}
            <span aria-hidden="true" />

            <span className="inline-flex w-fit items-center justify-self-center gap-2.5 rounded-full border border-white/90 bg-white/70 py-2 pl-2.5 pr-4 shadow-[0_6px_18px_-12px_rgba(30,20,70,0.4)] backdrop-blur-[6px]">
              <span className="grid h-[22px] w-[22px] flex-none place-items-center rounded-md bg-gradient-to-br from-[#F49230] to-[#DE6F14] text-white">
                <Spark className="h-[13px] w-[13px]" />
              </span>
              <span className="text-[12.5px] font-[650] tracking-[0.01em] text-[#33302C]">
                What Multi AI reads out of them
              </span>
            </span>
          </div>

          <div
            ref={wrapRef}
            className="relative grid grid-cols-1 items-center gap-6 lg:grid-cols-[minmax(0,0.78fr)_112px_minmax(0,1.12fr)] lg:gap-0"
          >
            {/* ---- wires ---- */}
            <svg
              className="pointer-events-none absolute inset-0 z-0 hidden overflow-visible lg:block"
              width="100%"
              height="100%"
              viewBox={`0 0 ${box.w || 1} ${box.h || 1}`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {paths.map((d, i) => (
                <g key={`${d}-${i}`}>
                  <path d={d} fill="none" stroke="#C9BDF0" strokeWidth="1.6" strokeDasharray="4 4" />
                  {!reduce && inView && (
                    <circle r="4" fill={INSIGHTS[i].color}>
                      <animateMotion dur="1.6s" begin={`${i * 0.45}s`} repeatCount="indefinite" path={d} />
                      <animate
                        attributeName="opacity"
                        values="0;1;1;0"
                        dur="1.6s"
                        begin={`${i * 0.45}s`}
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                </g>
              ))}
            </svg>

            {/* ---- left: the board ---- */}
            <div
              ref={boardRef}
              className="relative z-10 overflow-hidden rounded-xl border border-white/90 bg-white/[0.84] shadow-[0_18px_40px_-24px_rgba(30,20,70,0.42)] backdrop-blur-[10px]"
            >
              <div className="flex items-center gap-2 border-b border-[#F1EEE9] px-3 py-2.5 text-[11.5px] font-bold">
                <span className="h-[7px] w-[7px] flex-none rounded-[3px] bg-[#8A3F6D]" />
                {BOARD}
                <span className="ml-auto font-mono text-[8.5px] font-normal text-brand-gray">week 32</span>
              </div>
              {ROWS.map((r, i) => (
                <div
                  key={r.name}
                  ref={(el) => { rowRefs.current[i] = el; }}
                  className="flex h-[52px] items-center gap-2 border-b border-[#F5F2ED] px-3 text-[11.5px] last:border-b-0"
                >
                  <span className="min-w-0 flex-1 truncate font-[620]">{r.name}</span>
                  <span
                    className="flex-none rounded-[5px] px-[7px] py-[3px] font-extrabold tabular-nums"
                    style={
                      r.hit
                        ? { background: "#EAF7F0", color: GREEN }
                        : { background: "#FBEEEB", color: RED }
                    }
                  >
                    {r.value}
                  </span>
                </div>
              ))}
            </div>

            {/* spacer column, so the wires have a gutter to cross */}
            <div className="hidden lg:block" aria-hidden="true" />

            {/* ---- right: the read-out ---- */}
            <div
              ref={aiRef}
              className="relative z-10 overflow-hidden rounded-xl border border-white/90 bg-white/[0.84] shadow-[0_18px_40px_-24px_rgba(30,20,70,0.42)] backdrop-blur-[10px]"
            >
              <div className="flex items-center gap-2.5 border-b border-[#F1EEE9] px-3.5 py-2.5">
                <span className="grid h-6 w-6 flex-none place-items-center rounded-lg bg-gradient-to-br from-[#F49230] to-[#DE6F14] text-white">
                  <Spark className="h-[13px] w-[13px]" />
                </span>
                <b className="text-[12.5px]">Multi AI</b>
                <span className="ml-auto font-mono text-[8.5px] text-brand-gray">reading 3 metrics</span>
              </div>

              {INSIGHTS.map((ins, i) => (
                <div key={ins.tag} className="px-3 py-2 first:pt-3">
                  <div
                    ref={(el) => { cardRefs.current[i] = el; }}
                    className="flex items-start gap-2.5 rounded-[11px] border p-3"
                    style={{ borderColor: `${ins.color}22`, background: `${ins.color}08` }}
                  >
                    <span
                      className="mt-px h-fit flex-none rounded-full px-2 py-[3px] font-mono text-[8.5px] font-bold uppercase tracking-[0.08em] text-white"
                      style={{ background: ins.color }}
                    >
                      {ins.tag}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[12.5px] leading-relaxed text-brand-charcoal">{ins.text}</p>
                      <p className="mt-1.5 truncate font-mono text-[8.5px] uppercase tracking-[0.06em] text-brand-gray">
                        from {ins.source}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <p className="border-t border-black/[0.06] bg-white/40 px-3.5 py-2.5 text-[10.5px] text-brand-gray">
                Multi AI reads the same numbers your team logs. No exports, no prompt engineering, no
                separate AI subscription.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
