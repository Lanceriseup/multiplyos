"use client";

// Two features side by side (Notion 2-up): AI-Driven Decisions (red) and
// Meetings & 1-on-1s (blue). White header (eyebrow + headline + "Request a
// demo") over a soft-tinted panel; the product is centered and bleeds off the
// bottom (no empty space, Notion-style). Red gets a thinking-robot overlay; blue
// gets a video-call overlay.
import { motion, useInView, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useRef, useState, type ReactNode } from "react";
import { useDemo } from "./DemoModal";

const EASE = [0.22, 1, 0.36, 1] as const;

const colTransition = { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const };

function Card({
  panelClass,
  eyeColor,
  ctaColor,
  eyebrow,
  headline,
  delay,
  overlay,
  mobileShow,
  children,
}: {
  panelClass: string;
  eyeColor: string;
  ctaColor: string;
  eyebrow: string;
  headline: string;
  delay: number;
  overlay: ReactNode;
  mobileShow: boolean;
  children: ReactNode;
}) {
  const { openDemo } = useDemo();
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ ...colTransition, delay }}
      className={`${mobileShow ? "flex" : "hidden md:flex"} flex-col overflow-hidden rounded-[24px] border border-brand-gray/20 bg-white shadow-[0_30px_60px_-38px_rgba(40,30,15,0.3)]`}
    >
      <div className="px-7 pb-6 pt-7">
        <p className="text-[12.5px] font-semibold" style={{ color: eyeColor }}>{eyebrow}</p>
        <h3 className="mt-1.5 text-[22px] font-extrabold tracking-tight text-brand-ink">{headline}</h3>
        <button type="button" onClick={openDemo} className="mt-4 inline-flex items-center gap-2 border-b-2 pb-1 text-[14px] font-bold text-brand-ink" style={{ borderColor: ctaColor }}>
          Request a demo
          <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </button>
      </div>
      <div className={`relative flex flex-1 flex-col items-center overflow-hidden bg-gradient-to-br px-6 pt-7 ${panelClass}`}>
        <div className="flex w-full max-w-[460px] flex-1">{children}</div>
        {overlay}
      </div>
    </motion.div>
  );
}

/* ---------- RED: Company Insights ---------- */
const INSIGHTS = [
  { tags: ["Company", "Cross-Module"], title: "Strong week masks thin execution.", text: "New Customers jumped 5 to 23 and CSAT hit 93%, but only 1 open task across the team." },
  { tags: ["Company", "Team"], title: "Open work is concentrated on the CEO.", text: "1 Task and 1 Issue both sit with Skylar, so there's no delegation across Sales, Ops, or Accounting." },
];

function RedInsights({ play, reduce }: { play: boolean; reduce: boolean }) {
  return (
    <div className="w-full overflow-hidden rounded-t-[12px] border border-black/5 bg-white text-[12px] shadow-[0_18px_40px_-26px_rgba(20,15,10,0.5)]">
      <div className="flex items-center gap-2 border-b border-[#ECEAE6] px-3.5 py-2.5 text-[12.5px] font-bold">
        <span className="grid h-[22px] w-[22px] flex-none place-items-center rounded-md bg-brand-ink text-white">
          <svg viewBox="0 0 24 24" className="h-[13px] w-[13px]" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h4" /></svg>
        </span>
        Company Insights
        <span className="ml-auto rounded-full bg-[#FDECE8] px-2 py-0.5 text-[9px] font-semibold text-[#C0402B]">Coach</span>
      </div>
      <div className="p-3">
        {INSIGHTS.map((n, i) => (
          <motion.div
            key={n.title}
            initial={{ opacity: 0, y: 8 }}
            animate={play ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: reduce ? 0 : 0.45, delay: reduce ? 0 : 0.4 + i * 0.5, ease: EASE }}
            className="mb-2.5 rounded-[9px] border border-[#ECEAE6] border-l-[3px] border-l-[#EF6B54] px-3 py-2.5 last:mb-0"
          >
            <div className="flex gap-1.5">
              {n.tags.map((t, j) => (
                <span key={t} className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${j === 0 ? "bg-[#FDECE8] text-[#C0402B]" : "bg-[#F4F1EC] text-[#57534C]"}`}>{t}</span>
              ))}
            </div>
            <div className="mt-2 text-[13px] font-extrabold tracking-tight text-brand-ink">{n.title}</div>
            <p className="mt-1 text-[11px] leading-relaxed text-brand-charcoal">{n.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* "AI is thinking" orb - glossy sphere with radar-pulse rings rippling outward */
function AiOrb() {
  return (
    <div className="pointer-events-none absolute bottom-4 right-4">
      <div className="relative h-[92px] w-[92px]" style={{ transform: "scale(1.2)", transformOrigin: "100% 100%" }}>
        <div className="ai-orb-pulse absolute inset-[24px] rounded-full border-2 border-[#EF6B54]/55" style={{ animationDelay: "0s" }} />
        <div className="ai-orb-pulse absolute inset-[24px] rounded-full border-2 border-[#EF6B54]/55" style={{ animationDelay: "0.8s" }} />
        <div className="ai-orb-pulse absolute inset-[24px] rounded-full border-2 border-[#EF6B54]/55" style={{ animationDelay: "1.6s" }} />
        <div
          className="absolute inset-[26px] rounded-full"
          style={{
            background: "radial-gradient(circle at 33% 28%, #FCC079, #EF6B54 55%, #B33417)",
            boxShadow: "0 10px 24px -6px rgba(178,52,23,0.6), inset -5px -7px 13px rgba(120,20,10,0.4), inset 4px 5px 11px rgba(255,255,255,0.45)",
          }}
        />
        <div className="absolute inset-0 z-[4] grid place-items-center text-white [filter:drop-shadow(0_1px_2px_rgba(120,20,10,0.4))]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9z" /></svg>
        </div>
      </div>
    </div>
  );
}

/* ---------- BLUE: meeting agenda + issues ---------- */
const AGENDA = [
  { label: "Opening", min: "3 min", done: true },
  { label: "Goals Review", min: "5 min", done: true },
  { label: "Scoreboards Review", min: "5 min", done: true },
  { label: "Issues", min: "40 min", active: true },
];
const ISSUES = [
  { pr: "HIGH", text: "Onboarding is still manual", av: "MC" },
  { pr: "MED", text: "Pricing hasn't been revisited", av: "SL" },
  { pr: "MED", text: "Sales Manager seat is open", av: "SL" },
];

function BlueMeeting({ play, reduce }: { play: boolean; reduce: boolean }) {
  const doneCount = AGENDA.filter((a) => a.done).length;
  let d = 0;
  return (
    <div className="w-full overflow-hidden rounded-t-[12px] border border-black/5 bg-white text-[12px] shadow-[0_18px_40px_-26px_rgba(20,15,10,0.5)]">
      <div className="flex items-center gap-2 border-b border-[#ECEAE6] px-3.5 py-2.5 text-[12.5px] font-bold">
        <span className="grid h-[22px] w-[22px] flex-none place-items-center rounded-md bg-brand-ink text-white">
          <svg viewBox="0 0 24 24" className="h-[13px] w-[13px]" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2.5M9 2h6" /></svg>
        </span>
        Weekly Leadership Meeting
        <span className="ml-auto text-[10.5px] font-medium text-brand-gray">65 min</span>
      </div>
      <div className="py-1">
        {AGENDA.map((a) => {
          if (a.active) {
            return (
              <motion.div
                key={a.label}
                initial={{ backgroundColor: "rgba(234,243,252,0)" }}
                animate={{ backgroundColor: play ? "#EAF3FC" : "rgba(234,243,252,0)" }}
                transition={{ duration: reduce ? 0 : 0.4, delay: reduce ? 0 : 0.4 + doneCount * 0.4 }}
                className="flex items-center gap-2.5 px-3.5 py-1.5"
              >
                <span className="grid h-[15px] w-[15px] flex-none place-items-center rounded-full border-[1.5px] border-[#E3E0DA]" />
                <span className="text-[12px] font-semibold text-[#2C6BA6]">{a.label}</span>
                <span className="ml-auto font-mono text-[10px] text-brand-gray">{a.min}</span>
              </motion.div>
            );
          }
          const di = a.done ? d++ : 0;
          return (
            <div key={a.label} className="flex items-center gap-2.5 px-3.5 py-1.5">
              <motion.span
                initial={{ scale: a.done ? 0.2 : 1, opacity: a.done ? 0 : 1 }}
                animate={a.done ? (play ? { scale: 1, opacity: 1 } : { scale: 0.2, opacity: 0 }) : { scale: 1, opacity: 1 }}
                transition={a.done ? { duration: reduce ? 0 : 0.35, delay: reduce ? 0 : 0.35 + di * 0.4, ease: EASE } : { duration: 0 }}
                className={`grid h-[15px] w-[15px] flex-none place-items-center rounded-full border-[1.5px] ${a.done ? "border-[#2BA463] bg-[#2BA463]" : "border-[#E3E0DA]"}`}
              >
                {a.done && <svg viewBox="0 0 24 24" className="h-[9px] w-[9px] text-white" fill="none" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>}
              </motion.span>
              <span className={`text-[12px] font-semibold ${a.done ? "text-brand-gray line-through" : "text-brand-ink"}`}>{a.label}</span>
              <span className="ml-auto font-mono text-[10px] text-brand-gray">{a.min}</span>
            </div>
          );
        })}
      </div>
      <div className="border-t border-[#ECEAE6] px-3.5 pb-1 pt-2.5">
        <div className="text-[9.5px] font-bold uppercase tracking-wide text-[#2C6BA6]">Issues · 3 open</div>
        {ISSUES.map((it) => (
          <div key={it.text} className="flex items-center gap-2 border-b border-[#ECEAE6] py-2 text-[11.5px] last:border-0">
            <span className={`rounded-[4px] px-1.5 py-0.5 text-[8.5px] font-bold ${it.pr === "HIGH" ? "bg-[#FDECE8] text-[#C0402B]" : "bg-[#FBF0D6] text-[#A16207]"}`}>{it.pr}</span>
            {it.text}
            <span className="ml-auto grid h-[16px] w-[16px] place-items-center rounded-full bg-[#3E7BC0] text-[7.5px] font-bold text-white">{it.av}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* video call with real headshots */
function VideoTile({ src, name, active }: { src: string; name: string; active?: boolean }) {
  return (
    <div className={`relative h-[76px] w-[120px] overflow-hidden rounded-lg border-2 shadow-md ${active ? "border-[#4A9FE0]" : "border-white"}`}>
      <Image src={src} alt={name} fill sizes="120px" className="object-cover object-[center_30%]" />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-5 bg-gradient-to-t from-black/45 to-transparent" />
      <span className="absolute bottom-1 left-2 z-10 text-[9px] font-semibold text-white drop-shadow">{name}</span>
    </div>
  );
}

function VideoCall() {
  return (
    <div className="absolute bottom-3 right-3 flex w-[120px] flex-col items-center gap-2">
      <VideoTile src="/Girl.png" name="Maya" />
      <VideoTile src="/Guy.png" name="Devin" active />
      <div className="flex items-center gap-2.5 rounded-full bg-[#1B1A17] px-3 py-2">
        <svg viewBox="0 0 24 24" className="h-[13px] w-[13px] text-white" fill="none" stroke="currentColor" strokeWidth={2}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
        <svg viewBox="0 0 24 24" className="h-[13px] w-[13px] text-white" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="6" width="13" height="12" rx="2" /><path d="M16 10l5-3v10l-5-3z" /></svg>
        <span className="grid h-[19px] w-[19px] place-items-center rounded-full bg-[#EF4444]"><svg viewBox="0 0 24 24" className="h-[11px] w-[11px] text-white" fill="currentColor"><path d="M21 15.5c-1.2 0-2.4-.2-3.5-.6a1 1 0 0 0-1 .2l-1.5 1.5a15 15 0 0 1-6.6-6.6l1.5-1.5a1 1 0 0 0 .2-1A11 11 0 0 1 9.5 4 1 1 0 0 0 8.5 3H5a1 1 0 0 0-1 1 17 17 0 0 0 17 17 1 1 0 0 0 1-1v-3.5a1 1 0 0 0-1-1z" transform="rotate(135 12 12)" /></svg></span>
      </div>
    </div>
  );
}

export default function FeatureAiMeetings() {
  const ref = useRef<HTMLDivElement>(null);
  const play = useInView(ref, { once: true, margin: "-100px" });
  const reduce = useReducedMotion() ?? false;
  const [tab, setTab] = useState<"red" | "blue">("red");

  return (
    <section id="ai-meetings" className="scroll-mt-24 px-5 pb-24 pt-6 sm:px-8 md:pt-0">
      {/* mobile-only switcher between the two feature cards */}
      <div className="mx-auto mb-5 flex max-w-container gap-2 md:hidden">
        <button
          type="button"
          onClick={() => setTab("red")}
          className={`flex-1 rounded-xl border px-3 py-2.5 text-[12.5px] font-bold transition-colors ${
            tab === "red" ? "border-[#EF6B54] bg-[#FDEEE9] text-[#C0402B]" : "border-brand-gray/25 bg-white text-brand-charcoal"
          }`}
        >
          AI-Driven Decisions
        </button>
        <button
          type="button"
          onClick={() => setTab("blue")}
          className={`flex-1 rounded-xl border px-3 py-2.5 text-[12.5px] font-bold transition-colors ${
            tab === "blue" ? "border-[#4A9FE0] bg-[#EDF4FC] text-[#2C6BA6]" : "border-brand-gray/25 bg-white text-brand-charcoal"
          }`}
        >
          Meetings &amp; 1-on-1s
        </button>
      </div>

      <div ref={ref} className="mx-auto grid max-w-container items-stretch gap-6 md:grid-cols-2">
        <Card
          panelClass="from-[#FDEEE9] to-[#F9D9CE]"
          eyeColor="#C0402B"
          ctaColor="#EF6B54"
          eyebrow="AI-Driven Decisions"
          headline="Know your next move."
          delay={0}
          overlay={<AiOrb />}
          mobileShow={tab === "red"}
        >
          <RedInsights play={play} reduce={reduce} />
        </Card>
        <Card
          panelClass="from-[#EDF4FC] to-[#D6E8F8]"
          eyeColor="#2C6BA6"
          ctaColor="#4A9FE0"
          eyebrow="Meetings & 1-on-1s"
          headline="Every meeting, on rhythm."
          delay={0.1}
          overlay={<VideoCall />}
          mobileShow={tab === "blue"}
        >
          <BlueMeeting play={play} reduce={reduce} />
        </Card>
      </div>
    </section>
  );
}
