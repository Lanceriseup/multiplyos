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
//
// The profile beat holds longest. It is the client's actual ask and the only
// frame that shows what you get for the credit.
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
  view: "disc" | "team";
  sent: boolean;
  modal: boolean;
  bars: boolean;
  hot: string;
};

const BLANK: Scene = { view: "disc", sent: false, modal: false, bars: false, hot: "" };

// Under prefers-reduced-motion: the profile open with its bars drawn, which is
// the client's actual ask and the frame that shows what a credit buys.
const STILL: Scene = { view: "team", sent: true, modal: true, bars: true, hot: "" };

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
      while (alive()) {
        setScene({ ...BLANK });
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
        await wait(5000);

        if (!alive()) return;
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
            className="relative overflow-hidden rounded-2xl border border-black/5 bg-[#FAF9F7] text-brand-ink shadow-[0_30px_60px_-30px_rgba(40,30,15,0.45),0_2px_6px_-3px_rgba(40,30,15,0.12)]"
            style={{ height: STAGE_H }}
          >
            <div className="flex h-full flex-col px-6 pb-5 pt-4">
              <Tabs scene={scene} />
              <div className="mt-3 min-h-0 flex-1 overflow-hidden">
                {scene.view === "disc" ? <DiscView scene={scene} /> : <TeamView scene={scene} />}
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
        return (
          <span
            key={k}
            data-t={k === "team" ? "tab-team" : undefined}
            className={`flex items-center gap-1.5 border-b-2 pb-2 pt-1 text-[11.5px] transition-colors ${
              on ? "font-bold" : "border-transparent font-medium text-brand-gray"
            } ${scene.hot === "tab-team" && k === "team" ? "rounded-t-md bg-[#FFF6EC]" : ""}`}
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
        <h4 className="text-[14.5px] font-bold tracking-tight">Edit team member</h4>
        <p className="mt-0.5 text-[10px] text-brand-charcoal">
          Update {p.name}&rsquo;s profile and permission role.
        </p>

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
