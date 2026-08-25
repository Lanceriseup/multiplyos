"use client";

// Animated hero for the Org Chart feature page.
//
// The client's brief is three shows and one do-not: show the full chart, show
// the list view, show DISC being switched on, and never open a person's detail.
// Adding somebody was asked for afterwards and slots in as the fourth beat:
//
//   1. ninety.io               crossed out
//   2. the chart, collapsed    the CEO and three reports
//   3. Expand All              the whole company fans out, open seats included
//   4. + New User/Role         the chooser, the form, and a card landing
//   5. Show DISC               the legend lands and every face gets a badge
//   6. the list view           the same org, as rows, new hire included
//
// The new hire is deliberately unassessed, so when DISC comes on a beat later
// they are the grey dash. That is the coverage-gap argument arriving by itself.
//
// Same architecture as the other nine hero tours: the app is React state, only
// the cursor and its ripple are animated imperatively through the Web Animations
// API, and the sequence is generation-token guarded so a re-render or unmount
// cancels the in-flight tour rather than leaving orphaned timers behind.
//
// The company is fictional and matches the other feature pages. The screenshots
// are of Rise Up Kings's real org and none of that is on the public site. See
// docs/org-chart-feature-notes.md section 5.
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import ActZero, { runZero, type Zero } from "./ReplacesActZero";

const MIN_W = 980;
const STAGE_H = 500;
const EASE = "cubic-bezier(0.22,1,0.36,1)";

const ZERO_ITEMS = [{ name: "ninety.io", logo: "/replaces-ninety.png", h: 54 }];

const LINE = "#DCD7CE";

// Chart geometry. Every connector is derived from these, so adding a report
// re-flows the branches instead of leaving a rule hanging in space.
const CARD_W = 160; // a manager card
const KID_W = 124; // a leaf card
const KID_GAP = 8;
const GROUP_GAP = 16;
const STUB = 14; // the vertical drop above and below every sibling rule

// DISC, straight off the legend in the screenshot.
const DISC = {
  D: { label: "Dominance", c: "#D6453C" },
  I: { label: "Influence", c: "#D69A28" },
  S: { label: "Steadiness", c: "#2BA463" },
  C: { label: "Compliance", c: "#2C6BA6" },
} as const;

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
const PersonPlus = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="10" cy="8" r="3.2" />
    <path d="M3.8 19c0-3 2.8-5 6.2-5 1 0 2 .2 2.8.5" />
    <path d="M17.4 14.4v5.2M14.8 17h5.2" />
  </svg>
);
const Case = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="3.4" y="7.4" width="17.2" height="12.2" rx="2" />
    <path d="M8.8 7.4V5.8a1.6 1.6 0 0 1 1.6-1.6h3.2a1.6 1.6 0 0 1 1.6 1.6v1.6" />
  </svg>
);
const Target = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="12" cy="12" r="8.4" />
    <circle cx="12" cy="12" r="4.6" />
    <circle cx="12" cy="12" r="1.2" />
  </svg>
);
const Tree = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="9" y="3.4" width="6" height="4.4" rx="1.2" />
    <rect x="3" y="16.2" width="6" height="4.4" rx="1.2" />
    <rect x="15" y="16.2" width="6" height="4.4" rx="1.2" />
    <path d="M12 7.8v4.4M6 16.2v-4h12v4" />
  </svg>
);
const ListIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M4 6.6h16M4 12h16M4 17.4h16" />
  </svg>
);
const Search = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="10.8" cy="10.8" r="6.4" />
    <path d="M15.6 15.6l4.4 4.4" />
  </svg>
);
const Plus = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2.4}>
    <path d="M12 5.4v13.2M5.4 12h13.2" />
  </svg>
);
const Chevron = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2.2}>
    <path d="M6.4 9.6l5.6 5.2 5.6-5.2" />
  </svg>
);

// ---------------------------------------------------------------- data
// Fictional company, consistent with the other feature pages. Notes section 5.
type Disc = keyof typeof DISC;

const DEPTS: Record<string, string> = {
  Operations: "#B4532A",
  Sales: "#2C6BA6",
  Marketing: "#2E7D5B",
  Technology: "#5B47A8",
};

type Seat = {
  role: string;
  who: string | null; // null is an open seat, and that is a normal state
  init: string;
  dept: keyof typeof DEPTS;
  disc: [Disc, Disc] | null; // null means they have not taken it
  outcomes: number;
  reports: number;
  fresh?: boolean; // added during the tour, so it can flash on arrival
};

// The person the tour hires. Deliberately without a DISC profile: somebody who
// joined this morning has not taken it, which is exactly the state the overlay
// is there to surface.
const NEW_HIRE: Seat = {
  role: "Demand Gen Lead", who: "Theo Barnes", init: "TB", dept: "Marketing",
  disc: null, outcomes: 0, reports: 0, fresh: true,
};

// A real tree, so every connector can be derived rather than guessed at.
type Node = { seat: Seat; kids: Seat[] };

const CEO: Seat = {
  role: "CEO", who: "Skylar Lewis", init: "SL", dept: "Operations",
  disc: ["I", "D"], outcomes: 4, reports: 3,
};

const BRANCHES: Node[] = [
  {
    seat: { role: "COO", who: "Dana Whitfield", init: "DW", dept: "Operations", disc: ["C", "S"], outcomes: 3, reports: 3 },
    kids: [
      { role: "Operations Manager", who: "Marcus Hale", init: "MH", dept: "Operations", disc: ["S", "C"], outcomes: 3, reports: 2 },
      { role: "Technology Lead", who: "Kath Nakamura", init: "KN", dept: "Technology", disc: ["C", "D"], outcomes: 1, reports: 1 },
      { role: "Field Safety Lead", who: null, init: "", dept: "Operations", disc: null, outcomes: 0, reports: 0 },
    ],
  },
  {
    seat: { role: "VP Sales", who: "Jordan Rivera", init: "JR", dept: "Sales", disc: ["I", "D"], outcomes: 2, reports: 2 },
    kids: [
      { role: "Account Executive", who: "Sam Okafor", init: "SO", dept: "Sales", disc: null, outcomes: 1, reports: 0 },
      { role: "Second Market Manager", who: null, init: "", dept: "Sales", disc: null, outcomes: 0, reports: 0 },
    ],
  },
  {
    seat: { role: "Marketing Lead", who: "Priya Nair", init: "PN", dept: "Marketing", disc: ["I", "S"], outcomes: 2, reports: 1 },
    kids: [
      { role: "Content Lead", who: "Nina Petrova", init: "NP", dept: "Marketing", disc: ["S", "I"], outcomes: 1, reports: 0 },
    ],
  },
];

// The new hire reports to Marketing Lead, so the branch that had one child ends
// up with two and the whole row re-flows. That re-flow is the point.
const HIRE_INTO = 2;

// The form, as the tour fills it in.
const FORM = [
  { label: "Last name", value: "Barnes" },
  { label: "Email", value: "theo@ridgeline.co" },
  { label: "Title", value: "Demand Gen Lead" },
  { label: "Department", value: "Marketing" },
  { label: "Reports To", value: "Marketing Lead" },
];

// ---------------------------------------------------------------- scene
type Scene = {
  zero: Zero;
  view: "chart" | "list";
  expanded: boolean;
  disc: boolean;
  modal: "" | "choose" | "form";
  typed: string; // the first-name field
  filled: number; // how many of the remaining fields have landed
  added: boolean;
  hot: string;
};

const BLANK: Scene = {
  zero: "", view: "chart", expanded: false, disc: false,
  modal: "", typed: "", filled: 0, added: false, hot: "",
};

// Under prefers-reduced-motion: the full chart with DISC on, which is the frame
// that carries the client's headline asks at once.
const STILL: Scene = { ...BLANK, expanded: true, disc: true, added: true };

// ---------------------------------------------------------------- component
export default function OrgChartHeroTour() {
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
  const posRef = useRef({ x: 200, y: 44 });

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

    const type = async (text: string, apply: (v: string) => void, per = 60) => {
      for (let i = 1; i <= text.length; i++) {
        if (!alive()) return;
        apply(text.slice(0, i));
        await wait(per);
      }
    };

    (async function loop() {
      setCursor(200, 44);
      while (alive()) {
        setScene({ ...BLANK });

        if (!(await runZero((z) => patch({ zero: z }), wait, alive, ZERO_ITEMS.length))) return;
        await fade(1);

        // --- 1. the top of the house
        await wait(1600);

        // --- 2. and the rest of it
        if (!(await tap("expand", 700))) return;
        patch({ expanded: true });
        await wait(2600);

        // --- 3. hire somebody
        if (!(await tap("new-user", 700))) return;
        patch({ modal: "choose" });
        await wait(1100);

        if (!(await tap("opt-user", 620))) return;
        patch({ modal: "form" });
        await wait(700);

        await glide(pointAt("first-name"), 520);
        if (!alive()) return;
        await click();
        await type("Theo", (v) => patch({ typed: v }), 74);
        if (!alive()) return;
        await wait(320);

        for (let i = 0; i < FORM.length; i++) {
          patch({ filled: i + 1 });
          await wait(230);
          if (!alive()) return;
        }
        await wait(900);

        if (!(await tap("create", 620))) return;
        patch({ modal: "", added: true });
        await wait(2600);

        // --- 4. the overlay nobody expects, and the new hire has no profile yet
        if (!(await tap("disc", 700))) return;
        patch({ disc: true });
        await wait(3600);

        // --- 5. the same org, as rows
        if (!(await tap("list", 700))) return;
        patch({ view: "list" });
        await wait(3600);

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
            <div className="flex h-full flex-col px-6 pb-5 pt-5">
              <Chrome scene={scene} />
              <div className="mt-3 min-h-0 flex-1 overflow-hidden rounded-xl border border-[#EBE7E0] bg-white">
                {scene.view === "chart" ? <ChartView scene={scene} /> : <ListView scene={scene} />}
              </div>
            </div>

            {scene.modal === "choose" && <ChooserModal scene={scene} />}
            {scene.modal === "form" && <AddMemberModal scene={scene} />}

            {scene.zero && <ActZero state={scene.zero} items={ZERO_ITEMS} bg="#FAF9F7" />}

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

// ---------------------------------------------------------------- chrome
function Chrome({ scene }: { scene: Scene }) {
  const heads = scene.added ? 19 : 18;

  return (
    <div className="flex-none">
      <div className="flex items-start gap-3">
        <span className="min-w-0 flex-1">
          <h3 className="text-[22px] font-extrabold tracking-tight">Org Chart</h3>
          <p className="mt-0.5 text-[11px] text-brand-charcoal">
            Drag roles to reorganize. Hover to see outcomes and add child roles.
          </p>
        </span>

        <span className="flex flex-none items-center gap-2">
          <span
            data-t="new-user"
            className={`flex items-center gap-1.5 rounded-lg bg-brand-orange px-2.5 py-1.5 text-[10.5px] font-semibold text-white transition-all duration-200 ${
              scene.hot === "new-user" ? "shadow-[0_0_0_3px_rgba(234,123,27,0.4)]" : ""
            }`}
          >
            <Plus className="h-2.5 w-2.5" />
            New User/Role
          </span>
          <span
            data-t="disc"
            className={`rounded-lg px-2.5 py-1.5 text-[10.5px] font-semibold transition-all duration-200 ${
              scene.disc ? "bg-brand-orange text-white" : "text-brand-charcoal"
            } ${scene.hot === "disc" ? "shadow-[0_0_0_3px_rgba(234,123,27,0.35)]" : ""}`}
          >
            Show DISC
          </span>
          <span className="flex items-center gap-0.5 rounded-lg border border-[#E6E2DB] bg-white p-0.5">
            <span
              className={`grid h-[20px] w-[20px] place-items-center rounded-[6px] ${
                scene.view === "chart" ? "bg-brand-orange text-white" : "text-brand-gray"
              }`}
            >
              <Tree className="h-3 w-3" />
            </span>
            <span
              data-t="list"
              className={`grid h-[20px] w-[20px] place-items-center rounded-[6px] transition-all duration-200 ${
                scene.view === "list" ? "bg-brand-orange text-white" : "text-brand-gray"
              } ${scene.hot === "list" ? "shadow-[0_0_0_3px_rgba(234,123,27,0.35)]" : ""}`}
            >
              <ListIcon className="h-3 w-3" />
            </span>
          </span>
          <span className="flex items-center gap-0.5 rounded-lg bg-[#F1EEE9] p-0.5">
            <span className="rounded-[6px] bg-brand-orange px-2 py-[3px] text-[10px] font-semibold text-white">
              Current
            </span>
            <span className="px-2 py-[3px] text-[10px] font-medium text-brand-charcoal">Future</span>
          </span>
        </span>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <span className="flex items-center gap-1.5 rounded-full bg-[#F1EEE9] px-2.5 py-1 text-[10px] font-semibold">
          <People className="h-3 w-3 text-brand-charcoal" />
          <span className="tabular-nums">{heads} of 25 Team Members</span>
          <span className="font-normal text-brand-gray">({heads - 2} FT &amp; 2 PT)</span>
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-[#F1EEE9] px-2.5 py-1 text-[10px] font-semibold">
          <Case className="h-3 w-3 text-brand-charcoal" />
          6 Contractors
        </span>

        <span className="ml-auto flex items-center gap-2">
          <span className="flex w-[186px] items-center gap-1.5 rounded-lg border border-[#E6E2DB] bg-white px-2.5 py-1.5 text-[10px] text-brand-gray">
            <Search className="h-3 w-3" />
            Search people, roles, departments
          </span>
          <span
            data-t="expand"
            className={`flex items-center gap-1.5 rounded-lg border border-[#E6E2DB] bg-white px-2.5 py-1.5 text-[10.5px] font-semibold text-brand-charcoal transition-all duration-200 ${
              scene.hot === "expand" ? "shadow-[0_0_0_3px_rgba(234,123,27,0.35)]" : ""
            }`}
          >
            <People className="h-3 w-3" />
            Expand All
          </span>
          <span className="rounded-lg border border-[#E6E2DB] bg-white px-2.5 py-1.5 font-mono text-[10px] text-brand-charcoal">
            100%
          </span>
        </span>
      </div>

      {/* The legend only exists while the overlay is on, exactly as in the app. */}
      {scene.disc && (
        <div className="sop-view mt-2 flex items-center justify-center gap-3.5">
          {(Object.keys(DISC) as Disc[]).map((k) => (
            <span key={k} className="flex items-center gap-1.5 text-[9.5px] font-medium text-brand-charcoal">
              <span
                className="grid h-[14px] w-[14px] place-items-center rounded-full text-[8px] font-bold text-white"
                style={{ background: DISC[k].c }}
              >
                {k}
              </span>
              {DISC[k].label}
            </span>
          ))}
          <span className="flex items-center gap-1.5 text-[9.5px] font-medium text-brand-gray">
            <span className="grid h-[14px] w-[14px] place-items-center rounded-full bg-[#E6E2DB] text-[8px] font-bold text-brand-gray">
              &ndash;
            </span>
            Not assessed
          </span>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- the DISC badge
function DiscBadge({ seat }: { seat: Seat }) {
  if (!seat.who) return null; // a seat has no personality
  if (!seat.disc) {
    return (
      <span className="grid h-[13px] w-[17px] flex-none place-items-center rounded-full bg-[#EDEAE4] text-[8px] font-bold text-brand-gray">
        &ndash;
      </span>
    );
  }
  const [a, b] = seat.disc;
  return (
    <span
      className="flex-none rounded-full px-1 py-px text-[8px] font-bold text-white"
      style={{ background: DISC[a].c }}
    >
      {a}/{b}
    </span>
  );
}

// ---------------------------------------------------------------- a role card
function Card({ seat, scene, root }: { seat: Seat; scene: Scene; root?: boolean }) {
  const dept = DEPTS[seat.dept];
  return (
    <div
      className={`rounded-lg border bg-white px-2 py-1.5 shadow-[0_2px_6px_-3px_rgba(40,30,15,0.16)] ${
        seat.fresh ? "tour-landed" : ""
      }`}
      style={{ borderColor: "#EBE7E0", borderLeft: root ? "3px solid #EA7B1B" : undefined }}
    >
      <p className="truncate text-[9.5px] font-bold leading-tight">{seat.role}</p>

      <p className="mt-1 flex items-center gap-1">
        {seat.who ? (
          <>
            <span className="grid h-[14px] w-[14px] flex-none place-items-center rounded-full bg-[#F1EEE9] text-[6px] font-bold text-brand-charcoal">
              {seat.init}
            </span>
            <span className="min-w-0 flex-1 truncate text-[8.5px] font-medium text-brand-charcoal">
              {seat.who}
            </span>
          </>
        ) : (
          <>
            <span className="h-[14px] w-[14px] flex-none rounded-full bg-[#E6E2DB]" />
            <span className="min-w-0 flex-1 truncate text-[8.5px] font-semibold uppercase tracking-[0.04em] text-brand-gray">
              Open seat
            </span>
          </>
        )}
        {scene.disc && <DiscBadge seat={seat} />}
      </p>

      <p className="mt-1">
        <span
          className="inline-block truncate rounded-full px-1.5 py-px text-[7.5px] font-semibold"
          style={{ background: `${dept}1A`, color: dept }}
        >
          {seat.dept}
        </span>
      </p>

      {seat.outcomes > 0 && (
        <p className="mt-1 flex items-center gap-1 text-[7.5px] text-brand-charcoal">
          <Target className="h-2 w-2 flex-none" style={{ color: "#C9832B" }} />
          <span className="truncate">Annual Outcomes ({seat.outcomes})</span>
        </p>
      )}
      {seat.reports > 0 && (
        <p className="mt-0.5 flex items-center gap-1 text-[7.5px] text-brand-gray">
          <People className="h-2 w-2 flex-none" />
          {seat.reports} direct report{seat.reports === 1 ? "" : "s"}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- connectors
// One rule for the whole chart: a sibling row is joined by a horizontal line
// running from the FIRST child's centre to the LAST child's centre, extended if
// necessary to reach the parent's centre, with a stub dropping from the parent
// into it and a stub rising from each child. Because both ends are centres and
// never edges, no line can stick out past a card or stop short of one.
function Rule({ left, width }: { left: number; width: number }) {
  if (width <= 0) return null;
  return (
    <span
      className="absolute h-px"
      style={{ left, width, top: STUB, background: LINE, transition: "left .5s ease, width .5s ease" }}
    />
  );
}

function Stub({ left, from = 0 }: { left: number; from?: number }) {
  return (
    <span
      className="absolute w-px"
      style={{ left, top: from, height: STUB, background: LINE, transition: "left .5s ease" }}
    />
  );
}

// ---------------------------------------------------------------- the chart
function ChartView({ scene }: { scene: Scene }) {
  // Each branch is as wide as its own children need, so branches never overlap
  // and a new hire widens only the branch that gained one.
  const kidsOf = (i: number) =>
    i === HIRE_INTO && scene.added ? [...BRANCHES[i].kids, NEW_HIRE] : BRANCHES[i].kids;

  const kidRow = (n: number) => n * KID_W + Math.max(0, n - 1) * KID_GAP;
  const widths = BRANCHES.map((_, i) =>
    scene.expanded ? Math.max(CARD_W, kidRow(kidsOf(i).length)) : CARD_W,
  );

  const total = widths.reduce((a, b) => a + b, 0) + GROUP_GAP * (widths.length - 1);

  // Centre of each branch, measured from the left edge of the row.
  const centres: number[] = [];
  let x = 0;
  for (const w of widths) {
    centres.push(x + w / 2);
    x += w + GROUP_GAP;
  }

  // The CEO sits over the midpoint of the span it is joining, not over the
  // midpoint of the row, so the drop always lands on the rule.
  const spanL = centres[0];
  const spanR = centres[centres.length - 1];
  const mid = (spanL + spanR) / 2;

  return (
    <div className="h-full overflow-hidden px-4 py-3">
      <div className="mx-auto" style={{ width: total, transition: "width .5s ease" }}>
        {/* the root, centred over the span below it */}
        <div style={{ marginLeft: mid - CARD_W / 2, width: CARD_W, transition: "margin-left .5s ease" }}>
          <Card seat={CEO} scene={scene} root />
        </div>

        {/* the rule joining the three branches, plus every stub into it */}
        <div className="relative" style={{ height: STUB * 2 }}>
          <Stub left={mid} />
          <Rule left={spanL} width={spanR - spanL} />
          {centres.map((c, i) => (
            <Stub key={BRANCHES[i].seat.role} left={c} from={STUB} />
          ))}
        </div>

        <div className="flex items-start" style={{ gap: GROUP_GAP }}>
          {BRANCHES.map((b, i) => {
            const kids = kidsOf(i);
            const rowW = kidRow(kids.length);
            const startX = (widths[i] - rowW) / 2;
            const firstC = startX + KID_W / 2;
            const lastC = startX + rowW - KID_W / 2;
            const pc = widths[i] / 2;
            // Reach the parent even when it sits outside its children's span.
            const ruleL = Math.min(firstC, pc);
            const ruleR = Math.max(lastC, pc);

            return (
              <div key={b.seat.role} style={{ width: widths[i], transition: "width .5s ease" }}>
                <div className="mx-auto" style={{ width: CARD_W }}>
                  <Card seat={b.seat} scene={scene} />
                </div>

                {scene.expanded && kids.length > 0 && (
                  <>
                    <div className="relative" style={{ height: STUB * 2 }}>
                      <Stub left={pc} />
                      <Rule left={ruleL} width={ruleR - ruleL} />
                      {kids.map((k, j) => (
                        <Stub key={k.role} left={startX + j * (KID_W + KID_GAP) + KID_W / 2} from={STUB} />
                      ))}
                    </div>
                    <div className="flex justify-center" style={{ gap: KID_GAP }}>
                      {kids.map((k) => (
                        <div key={k.role} style={{ width: KID_W }}>
                          <Card seat={k} scene={scene} />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {!scene.expanded && (
        <p className="mt-5 flex items-center justify-center gap-1.5 text-[9.5px] text-brand-gray">
          <Chevron className="h-3 w-3" />
          14 more roles below this level
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- the chooser
// Verbatim from the product, condensed only in length.
function ChooserModal({ scene }: { scene: Scene }) {
  return (
    <div className="absolute inset-0 z-[60] grid place-items-center bg-[rgba(24,19,12,0.42)] px-6">
      <div className="sop-view w-[420px] rounded-2xl bg-white px-5 py-4 shadow-[0_24px_60px_-18px_rgba(20,14,6,0.5)]">
        <h4 className="text-[15px] font-bold tracking-tight">What are you adding?</h4>
        <p className="mt-1 text-[10.5px] text-brand-charcoal">
          Pick a starting point. You can rearrange later.
        </p>

        <div
          data-t="opt-user"
          className={`mt-3 flex items-start gap-2.5 rounded-lg border px-3 py-2.5 transition-all duration-200 ${
            scene.hot === "opt-user"
              ? "border-brand-orange/60 bg-[#FFF6EC] shadow-[0_0_0_2px_rgba(234,123,27,0.28)]"
              : "border-[#E6E2DB] bg-[#FAF9F7]"
          }`}
        >
          <PersonPlus className="mt-px h-4 w-4 flex-none text-brand-charcoal" />
          <span className="min-w-0">
            <span className="block text-[11.5px] font-bold leading-tight">New User + Role</span>
            <span className="mt-0.5 block text-[9.5px] leading-snug text-brand-charcoal">
              Bring a teammate in and place them on the chart. Pick who they report to, and invite by
              email or add their account directly.
            </span>
          </span>
        </div>

        <div className="mt-2 flex items-start gap-2.5 rounded-lg border border-[#E6E2DB] bg-[#FAF9F7] px-3 py-2.5">
          <Target className="mt-px h-4 w-4 flex-none text-brand-charcoal" />
          <span className="min-w-0">
            <span className="block text-[11.5px] font-bold leading-tight">New role</span>
            <span className="mt-0.5 block text-[9.5px] leading-snug text-brand-charcoal">
              Add a seat to the chart, assignable to a teammate now or later. Pick where it sits when
              you create it.
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- add a member
function AddMemberModal({ scene }: { scene: Scene }) {
  return (
    <div className="absolute inset-0 z-[60] grid place-items-center bg-[rgba(24,19,12,0.42)] px-6">
      <div className="sop-view w-[440px] rounded-2xl bg-white px-5 py-4 shadow-[0_24px_60px_-18px_rgba(20,14,6,0.5)]">
        <h4 className="text-[15px] font-bold tracking-tight">Add team member</h4>
        <p className="mt-1 text-[10px] text-brand-charcoal">
          Fill in their info, then choose how to get them into the system at the bottom.
        </p>

        <div className="mt-2.5 grid grid-cols-2 gap-2">
          <span>
            <span className="block text-[8.5px] font-bold uppercase tracking-[0.1em] text-brand-gray">
              First name <span style={{ color: "#D8563F" }}>*</span>
            </span>
            <span
              data-t="first-name"
              className="mt-1 block rounded-lg border bg-white px-2 py-1.5 text-[10.5px] font-medium transition-all duration-200"
              style={{
                borderColor: scene.typed ? "rgba(234,123,27,0.6)" : "#E6E2DB",
                boxShadow: scene.typed ? "0 0 0 3px rgba(234,123,27,0.14)" : undefined,
              }}
            >
              {scene.typed || <span className="text-brand-gray">Jane</span>}
              {scene.typed && scene.typed.length < 4 && <span className="tour-caret" />}
            </span>
          </span>

          {FORM.slice(0, 1).map((f, i) => (
            <span key={f.label}>
              <span className="block text-[8.5px] font-bold uppercase tracking-[0.1em] text-brand-gray">
                {f.label}
              </span>
              <span className="mt-1 block rounded-lg border border-[#E6E2DB] bg-[#FAF9F7] px-2 py-1.5 text-[10.5px] font-medium">
                {scene.filled > i ? f.value : <span className="text-brand-gray">Smith</span>}
              </span>
            </span>
          ))}
        </div>

        <div className="mt-2 space-y-2">
          {FORM.slice(1).map((f, i) => {
            const on = scene.filled > i + 1;
            const req = f.label === "Email" || f.label === "Title" || f.label === "Reports To";
            return (
              <span key={f.label} className="block">
                <span className="block text-[8.5px] font-bold uppercase tracking-[0.1em] text-brand-gray">
                  {f.label}
                  {req && <span style={{ color: "#D8563F" }}> *</span>}
                </span>
                <span className="mt-1 block rounded-lg border border-[#E6E2DB] bg-[#FAF9F7] px-2 py-1.5 text-[10.5px] font-medium">
                  {on ? f.value : <span className="text-brand-gray">&nbsp;</span>}
                </span>
                {f.label === "Reports To" && (
                  <span className="mt-0.5 block text-[8px] text-brand-gray">
                    Where this new seat sits on the org chart.
                  </span>
                )}
              </span>
            );
          })}
        </div>

        {/* The three switches, which are the interesting half of this modal. */}
        <div className="mt-2.5 space-y-1">
          {([
            { l: "Company Admin", on: false },
            { l: "One Page Plan Access", on: true },
            { l: "Allow this user to use Multi", on: true },
          ] as const).map((t) => (
            <span key={t.l} className="flex items-center gap-2 rounded-lg border border-[#EBE7E0] bg-[#FAF9F7] px-2 py-1">
              <span className="min-w-0 flex-1 truncate text-[9.5px] font-medium">{t.l}</span>
              <span
                className="flex h-[13px] w-[22px] flex-none items-center rounded-full px-px"
                style={{ background: t.on ? "#16233D" : "#D5D0C7", justifyContent: t.on ? "flex-end" : "flex-start" }}
              >
                <span className="h-[11px] w-[11px] rounded-full bg-white" />
              </span>
            </span>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-end gap-3">
          <span className="text-[11.5px] font-semibold text-brand-charcoal">Cancel</span>
          <span
            data-t="create"
            className={`rounded-lg bg-brand-orange px-4 py-1.5 text-[12px] font-semibold text-white transition-all duration-200 ${
              scene.hot === "create" ? "shadow-[0_0_0_3px_rgba(234,123,27,0.4)]" : ""
            }`}
          >
            Add to chart
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- the list
// Notes section 4: the real list view has not been screenshotted, so this shows
// exactly the fields the cards already carry and claims no more than that.
function ListView({ scene }: { scene: Scene }) {
  const rows: { seat: Seat; to: string; type: string }[] = [
    { seat: CEO, to: "None (top-level)", type: "Full-Time" },
  ];
  BRANCHES.forEach((b, i) => {
    rows.push({ seat: b.seat, to: "CEO", type: "Full-Time" });
    const kids = i === HIRE_INTO && scene.added ? [...b.kids, NEW_HIRE] : b.kids;
    kids.forEach((k) =>
      rows.push({ seat: k, to: b.seat.role, type: k.role === "Content Lead" ? "Part-Time" : "Full-Time" }),
    );
  });

  return (
    <div className="sop-view h-full overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-[#FAF9F7] text-[8px] uppercase tracking-[0.1em] text-brand-gray">
            <th className="px-3 py-1.5 font-bold">Role</th>
            <th className="px-3 py-1.5 font-bold">Person</th>
            <th className="px-3 py-1.5 font-bold">Department</th>
            <th className="px-3 py-1.5 font-bold">Reports to</th>
            <th className="px-3 py-1.5 text-center font-bold">Reports</th>
            <th className="px-3 py-1.5 font-bold">Type</th>
            {scene.disc && <th className="px-3 py-1.5 text-center font-bold">DISC</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ seat, to, type }) => {
            const dept = DEPTS[seat.dept];
            return (
              <tr key={seat.role} className={`border-t border-[#F5F2ED] ${seat.fresh ? "tour-landed" : ""}`}>
                <td className="px-3 py-[5px] text-[10px] font-semibold">{seat.role}</td>
                <td className="px-3 py-[5px]">
                  {seat.who ? (
                    <span className="flex items-center gap-1.5">
                      <span className="grid h-[15px] w-[15px] flex-none place-items-center rounded-full bg-[#F1EEE9] text-[6.5px] font-bold text-brand-charcoal">
                        {seat.init}
                      </span>
                      <span className="text-[10px] text-brand-charcoal">{seat.who}</span>
                    </span>
                  ) : (
                    <span className="rounded-full bg-[#F4F1EC] px-2 py-px text-[9px] font-semibold uppercase tracking-[0.04em] text-brand-gray">
                      Open seat
                    </span>
                  )}
                </td>
                <td className="px-3 py-[5px]">
                  <span
                    className="rounded-full px-1.5 py-px text-[8.5px] font-semibold"
                    style={{ background: `${dept}1A`, color: dept }}
                  >
                    {seat.dept}
                  </span>
                </td>
                <td className="px-3 py-[5px] text-[10px] text-brand-charcoal">{to}</td>
                <td className="px-3 py-[5px] text-center font-mono text-[10px] tabular-nums text-brand-charcoal">
                  {seat.reports || "-"}
                </td>
                <td className="px-3 py-[5px] text-[9.5px] text-brand-charcoal">{type}</td>
                {scene.disc && (
                  <td className="px-3 py-[5px]">
                    <span className="flex justify-center">
                      <DiscBadge seat={seat} />
                    </span>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
