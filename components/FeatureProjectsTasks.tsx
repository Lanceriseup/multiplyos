"use client";

// Projects & Tasks — two cards tucked directly under the SOP section (like the
// AI/Meetings cards sit under the CFO dashboard). Projects is GREEN with a
// kanban card that drags itself To do -> Doing -> Done on a loop (Web Animations
// API, with a cursor). Tasks is PURPLE with a task that completes on a loop
// (To do -> In progress -> Done, checkbox pops). Both respect reduced-motion.
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useDemo } from "./DemoModal";

const colTransition = { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const };

function Card({
  panelClass,
  eyeColor,
  ctaColor,
  eyebrow,
  headline,
  delay,
  mobileShow,
  children,
}: {
  panelClass: string;
  eyeColor: string;
  ctaColor: string;
  eyebrow: string;
  headline: string;
  delay: number;
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
      </div>
    </motion.div>
  );
}

/* ---------- GREEN: Projects kanban with self-dragging card ---------- */
function Avatar({ children, bg }: { children: ReactNode; bg: string }) {
  return <span className="grid h-[17px] w-[17px] flex-none place-items-center rounded-full text-[7px] font-bold text-white" style={{ background: bg }}>{children}</span>;
}

function MiniCard({ title, av, avBg, tag, tagClass }: { title: string; av: string; avBg: string; tag?: string; tagClass?: string }) {
  return (
    <div className="mb-1.5 rounded-[7px] border border-[#ECEAE6] bg-white p-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="text-[10.5px] font-semibold leading-snug text-brand-ink">{title}</div>
      <div className="mt-1.5 flex items-center">
        {tag && <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-semibold ${tagClass}`}>{tag}</span>}
        <span className="ml-auto"><Avatar bg={avBg}>{av}</Avatar></span>
      </div>
    </div>
  );
}

function ColHead({ dot, label, count }: { dot: string; label: string; count: number }) {
  return (
    <div className="mb-1.5 flex items-center gap-1.5 text-[9.5px] font-bold text-brand-ink">
      <span className="h-[6px] w-[6px] rounded-full" style={{ background: dot }} />
      {label}
      <span className="text-brand-gray">{count}</span>
    </div>
  );
}

function ProjectsBoard({ play, reduce }: { play: boolean; reduce: boolean }) {
  const boardRef = useRef<HTMLDivElement>(null);
  const moverRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const colTodoRef = useRef<HTMLDivElement>(null);
  const colDoingRef = useRef<HTMLDivElement>(null);
  const colDoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!play || reduce) return;
    // Non-null assertions keep the narrowing alive inside the run() closure
    // below (tsc drops control-flow narrowing across closures); the guard still
    // protects at runtime.
    const board = boardRef.current!;
    const mover = moverRef.current!;
    const cursor = cursorRef.current!;
    const cTodo = colTodoRef.current!;
    const cDoing = colDoingRef.current!;
    const cDone = colDoneRef.current!;
    if (!board || !mover || !cursor || !cTodo || !cDoing || !cDone) return;

    const LIFT = "0 15px 26px -8px rgba(18,80,45,0.5)";
    const REST = "0 1px 2px rgba(0,0,0,0.04)";
    const DUR = 6800;
    let running: Animation[] = [];

    const run = () => {
      running.forEach((a) => a.cancel());
      const l0 = cTodo.getBoundingClientRect().left;
      const dxDoing = Math.round(cDoing.getBoundingClientRect().left - l0);
      const dxDone = Math.round(cDone.getBoundingClientRect().left - l0);
      const br = board.getBoundingClientRect();
      const mr = mover.getBoundingClientRect();
      const dy = Math.round(mr.height + 6); // drop into the slot BELOW the column's existing card
      const cx = mr.left - br.left + mr.width * 0.62;
      const cy = mr.top - br.top + mr.height * 0.6;

      const mAnim = mover.animate(
        [
          { transform: "translate(0,0) scale(1)", boxShadow: REST, opacity: 0, offset: 0 },
          { transform: "translate(0,0) scale(1)", boxShadow: REST, opacity: 1, offset: 0.05 },
          { transform: "translate(0,-3px) scale(1.04)", boxShadow: LIFT, opacity: 1, offset: 0.15 },
          { transform: `translate(${dxDoing}px,-3px) scale(1.04)`, boxShadow: LIFT, opacity: 1, offset: 0.33 },
          { transform: `translate(${dxDoing}px,${dy}px) scale(1)`, boxShadow: REST, opacity: 1, offset: 0.44 },
          { transform: `translate(${dxDoing}px,${dy}px) scale(1)`, boxShadow: REST, opacity: 1, offset: 0.56 },
          { transform: `translate(${dxDoing}px,-3px) scale(1.04)`, boxShadow: LIFT, opacity: 1, offset: 0.65 },
          { transform: `translate(${dxDone}px,-3px) scale(1.04)`, boxShadow: LIFT, opacity: 1, offset: 0.83 },
          { transform: `translate(${dxDone}px,${dy}px) scale(1)`, boxShadow: REST, opacity: 1, offset: 0.92 },
          { transform: `translate(${dxDone}px,${dy}px) scale(1)`, boxShadow: REST, opacity: 1, offset: 0.97 },
          { transform: `translate(${dxDone}px,${dy}px) scale(1)`, boxShadow: REST, opacity: 0, offset: 1 },
        ],
        { duration: DUR, easing: "ease-in-out" },
      );

      const cAnim = cursor.animate(
        [
          { transform: `translate(${cx}px,${cy + 20}px)`, opacity: 0, offset: 0 },
          { transform: `translate(${cx}px,${cy}px)`, opacity: 1, offset: 0.09 },
          { transform: `translate(${cx}px,${cy - 3}px)`, opacity: 1, offset: 0.15 },
          { transform: `translate(${cx + dxDoing}px,${cy - 3}px)`, opacity: 1, offset: 0.33 },
          { transform: `translate(${cx + dxDoing}px,${cy + dy}px)`, opacity: 1, offset: 0.44 },
          { transform: `translate(${cx + dxDoing}px,${cy + dy}px)`, opacity: 1, offset: 0.56 },
          { transform: `translate(${cx + dxDoing}px,${cy - 3}px)`, opacity: 1, offset: 0.65 },
          { transform: `translate(${cx + dxDone}px,${cy - 3}px)`, opacity: 1, offset: 0.83 },
          { transform: `translate(${cx + dxDone}px,${cy + dy}px)`, opacity: 1, offset: 0.92 },
          { transform: `translate(${cx + dxDone}px,${cy + dy}px)`, opacity: 1, offset: 0.97 },
          { transform: `translate(${cx + dxDone}px,${cy + dy + 20}px)`, opacity: 0, offset: 1 },
        ],
        { duration: DUR, easing: "ease-in-out" },
      );
      running = [mAnim, cAnim];
    };

    run();
    const iv = setInterval(run, DUR);
    return () => {
      clearInterval(iv);
      running.forEach((a) => a.cancel());
    };
  }, [play, reduce]);

  return (
    <div ref={boardRef} className="relative flex w-full flex-col overflow-hidden rounded-t-[12px] border border-black/5 bg-white shadow-[0_18px_40px_-26px_rgba(20,60,35,0.5)]">
      <div className="flex items-center gap-2 border-b border-[#ECEAE6] px-3.5 py-2.5 text-[12.5px] font-bold">
        <span className="grid h-[22px] w-[22px] flex-none place-items-center rounded-md bg-brand-ink text-white">
          <svg viewBox="0 0 24 24" className="h-[13px] w-[13px]" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="6" height="16" rx="1.5" /><rect x="10" y="4" width="6" height="11" rx="1.5" /><rect x="17" y="4" width="4" height="7" rx="1.5" /></svg>
        </span>
        Roadmap
        <span className="ml-auto rounded-full bg-[rgba(31,157,87,0.13)] px-2 py-0.5 text-[9px] font-semibold text-[#157A43]">Q3</span>
      </div>

      <div className="grid flex-1 grid-cols-3 gap-2 px-3 py-3">
        {/* To do */}
        <div ref={colTodoRef}>
          <ColHead dot="#6B7280" label="To do" count={3} />
          <div ref={moverRef} className="relative z-20">
            <MiniCard title="Ship reporting v2" av="DB" avBg="#1F8A52" tag="This week" tagClass="bg-[rgba(31,157,87,0.13)] text-[#157A43]" />
          </div>
          <MiniCard title="Refresh SOPs" av="MC" avBg="#3E7BC0" />
          <MiniCard title="Plan Q4 offsite" av="SL" avBg="linear-gradient(135deg,#F49230,#D8563F)" />
        </div>
        {/* Doing */}
        <div ref={colDoingRef}>
          <ColHead dot="#A16207" label="Doing" count={1} />
          <MiniCard title="Summer campaign" av="JL" avBg="#C9503B" tag="Marketing" tagClass="bg-[#FBF0D6] text-[#A16207]" />
        </div>
        {/* Done */}
        <div ref={colDoneRef}>
          <ColHead dot="#1F9D57" label="Done" count={1} />
          <MiniCard title="Interview CSM" av="SL" avBg="linear-gradient(135deg,#F49230,#D8563F)" />
        </div>
      </div>

      {/* footer: owners + weekly progress */}
      <div className="mt-auto flex items-center gap-2.5 border-t border-[#ECEAE6] px-3.5 py-2.5">
        <div className="flex -space-x-1.5">
          <span className="h-[18px] w-[18px] rounded-full border-2 border-white" style={{ background: "linear-gradient(135deg,#F49230,#D8563F)" }} />
          <span className="h-[18px] w-[18px] rounded-full border-2 border-white bg-[#3E7BC0]" />
          <span className="h-[18px] w-[18px] rounded-full border-2 border-white bg-[#1F8A52]" />
          <span className="h-[18px] w-[18px] rounded-full border-2 border-white bg-[#C9503B]" />
        </div>
        <span className="text-[10px] font-medium text-brand-charcoal">4 owners</span>
        <span className="ml-auto flex items-center gap-1.5 text-[10px] font-semibold text-[#157A43]">
          <span className="h-[6px] w-[26px] overflow-hidden rounded-full bg-[rgba(31,157,87,0.18)]"><span className="block h-full w-1/3 rounded-full bg-[#1F9D57]" /></span>
          2 of 6 done
        </span>
      </div>

      {/* dragging cursor */}
      <div ref={cursorRef} className="pointer-events-none absolute left-0 top-0 z-30 opacity-0" style={{ willChange: "transform" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" fill="#15120E" stroke="#fff" strokeWidth={1.5}><path d="M5 3l6 16 2.5-6.5L20 10z" /></svg>
      </div>
    </div>
  );
}

/* ---------- PURPLE: Tasks list with a task completing ---------- */
type Status = "todo" | "prog" | "done";

function StatusPill({ s }: { s: Status }) {
  const map = {
    todo: { bg: "#EEF0F2", fg: "#6B7280", dot: "#6B7280", label: "To do" },
    prog: { bg: "rgba(124,92,214,0.14)", fg: "#5B47A8", dot: "#7C5CD6", label: "In progress" },
    done: { bg: "rgba(124,92,214,0.14)", fg: "#5B47A8", dot: "#7C5CD6", label: "Done" },
  }[s];
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold" style={{ background: map.bg, color: map.fg }}>
      <span className="h-[5px] w-[5px] rounded-full" style={{ background: map.dot }} />
      {map.label}
    </span>
  );
}

function TaskRow({ name, status, checked, av, avBg }: { name: string; status: Status; checked: boolean; av: string; avBg: string }) {
  return (
    <div className="flex items-center gap-2.5 border-t border-[#ECEAE6] px-3.5 py-2.5 first:border-t-0">
      <span className={`grid h-[16px] w-[16px] flex-none place-items-center rounded-full border-[1.5px] transition-colors ${checked ? "border-[#7C5CD6] bg-[#7C5CD6]" : "border-[#E3E0DA]"}`}>
        {checked && (
          <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 520, damping: 17 }} viewBox="0 0 24 24" className="h-[10px] w-[10px] text-white" fill="none" stroke="currentColor" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></motion.svg>
        )}
      </span>
      <span className={`text-[12px] font-medium ${checked ? "text-brand-gray line-through" : "text-brand-ink"}`}>{name}</span>
      <span className="ml-auto flex items-center gap-2">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={status} initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} transition={{ duration: 0.2 }}>
            <StatusPill s={status} />
          </motion.span>
        </AnimatePresence>
        <Avatar bg={avBg}>{av}</Avatar>
      </span>
    </div>
  );
}

function TasksList({ play, reduce }: { play: boolean; reduce: boolean }) {
  const [status, setStatus] = useState<Status>(reduce ? "prog" : "todo");
  const checked = status === "done";

  useEffect(() => {
    if (!play || reduce) return;
    let timers: ReturnType<typeof setTimeout>[] = [];
    const run = () => {
      timers.forEach(clearTimeout);
      timers = [];
      setStatus("todo");
      timers.push(setTimeout(() => setStatus("prog"), 1300));
      timers.push(setTimeout(() => setStatus("done"), 2900));
    };
    run();
    const iv = setInterval(run, 5200);
    return () => {
      clearInterval(iv);
      timers.forEach(clearTimeout);
    };
  }, [play, reduce, setStatus]);

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-t-[12px] border border-black/5 bg-white shadow-[0_18px_40px_-26px_rgba(45,25,90,0.45)]">
      <div className="flex items-center gap-2 border-b border-[#ECEAE6] px-3.5 py-2.5 text-[12.5px] font-bold">
        <span className="grid h-[22px] w-[22px] flex-none place-items-center rounded-md bg-brand-ink text-white">
          <svg viewBox="0 0 24 24" className="h-[13px] w-[13px]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h16M4 18h10" /></svg>
        </span>
        My Tasks
        <span className="ml-auto rounded-full bg-[rgba(124,92,214,0.14)] px-2 py-0.5 text-[9px] font-semibold text-[#5B47A8]">From meetings</span>
      </div>

      <div className="flex items-center gap-1.5 px-3.5 pb-1 pt-2.5 text-[9px] font-bold uppercase tracking-wide text-[#5B47A8]">This week <span className="text-brand-gray">· 3</span></div>
      <TaskRow name="Follow up on Q2 close" status={status} checked={checked} av="SL" avBg="linear-gradient(135deg,#F49230,#D8563F)" />
      <TaskRow name="Draft the new hire plan" status="prog" checked={false} av="MC" avBg="#3E7BC0" />
      <TaskRow name="Review vendor contracts" status="todo" checked={false} av="DB" avBg="#1F8A52" />

      <div className="flex items-center gap-1.5 border-t border-[#ECEAE6] px-3.5 pb-1 pt-2.5 text-[9px] font-bold uppercase tracking-wide text-[#5B47A8]">Later <span className="text-brand-gray">· 2</span></div>
      <TaskRow name="Refresh onboarding docs" status="todo" checked={false} av="JL" avBg="#C9503B" />
      <TaskRow name="Plan Q4 hiring" status="todo" checked={false} av="MC" avBg="#3E7BC0" />

      {/* footer: weekly progress */}
      <div className="mt-auto flex items-center gap-2.5 border-t border-[#ECEAE6] px-3.5 py-2.5">
        <span className="text-[10px] font-medium text-brand-charcoal">Weekly progress</span>
        <span className="ml-auto text-[10px] font-semibold text-[#5B47A8]">1 of 5 done</span>
      </div>
      <div className="h-[5px] w-full bg-[rgba(124,92,214,0.16)]"><span className="block h-full w-1/5 bg-[#7C5CD6]" /></div>
    </div>
  );
}

export default function FeatureProjectsTasks() {
  const ref = useRef<HTMLDivElement>(null);
  const play = useInView(ref, { once: true, margin: "-100px" });
  const reduce = useReducedMotion() ?? false;
  const [tab, setTab] = useState<"projects" | "tasks">("projects");

  return (
    <section id="projects-tasks" className="scroll-mt-24 px-5 pb-10 pt-6 sm:px-8 sm:pb-24 md:pt-0">
      {/* mobile-only switcher between the two cards */}
      <div className="mx-auto mb-5 flex max-w-container gap-2 md:hidden">
        <button
          type="button"
          onClick={() => setTab("projects")}
          className={`flex-1 rounded-xl border px-3 py-2.5 text-[12.5px] font-bold transition-colors ${
            tab === "projects" ? "border-[#1F9D57] bg-[#E7F4EC] text-[#157A43]" : "border-brand-gray/25 bg-white text-brand-charcoal"
          }`}
        >
          Projects
        </button>
        <button
          type="button"
          onClick={() => setTab("tasks")}
          className={`flex-1 rounded-xl border px-3 py-2.5 text-[12.5px] font-bold transition-colors ${
            tab === "tasks" ? "border-[#7C5CD6] bg-[#EFEBFB] text-[#5B47A8]" : "border-brand-gray/25 bg-white text-brand-charcoal"
          }`}
        >
          Tasks
        </button>
      </div>

      <div ref={ref} className="mx-auto grid max-w-container items-stretch gap-6 md:grid-cols-2">
        <Card
          panelClass="from-[#E7F4EC] to-[#CFE9D8]"
          eyeColor="#157A43"
          ctaColor="#1F9D57"
          eyebrow="Projects"
          headline="See the whole board."
          delay={0}
          mobileShow={tab === "projects"}
        >
          <ProjectsBoard play={play} reduce={reduce} />
        </Card>
        <Card
          panelClass="from-[#EFEBFB] to-[#DED6F6]"
          eyeColor="#5B47A8"
          ctaColor="#7C5CD6"
          eyebrow="Tasks"
          headline="Nothing slips through."
          delay={0.1}
          mobileShow={tab === "tasks"}
        >
          <TasksList play={play} reduce={reduce} />
        </Card>
      </div>
    </section>
  );
}
