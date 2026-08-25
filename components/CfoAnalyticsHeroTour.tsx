"use client";

// Animated hero for the CFO Analytics feature page.
//
// The whole promise is "connect QuickBooks, get a CFO", so the loop has to earn
// the second half by showing the first half actually happening:
//
//   1. Finance HQ, not connected     the real disconnected state
//   2. the consent modal             read-only, six months, encrypted, Claude
//   3. the sync                      chart of accounts, P&L, balance sheet
//   4. the Big 6                     tiles counting up, trend drawing under them
//   5. the AI CFO briefing           typed out, and it says cash went the wrong way
//   6. the P&L tab                   because companies manage the whole P&L here
//
// The briefing beat holds longest. It is the one that says this is a CFO rather
// than a chart library.
//
// This is the first hero tour with NO ActZero opening: the client is explicit
// that CFO Analytics replaces nothing, so there is nothing to cross out.
//
// Same architecture as the other seven: the app is React state, only the cursor
// and its ripple are animated imperatively through the Web Animations API, and
// the sequence is generation-token guarded so a re-render or unmount cancels the
// in-flight tour rather than leaving orphaned timers behind.
//
// Every number here is invented and matches docs/cfo-analytics-feature-notes.md
// section 7. Nobody has screenshotted a connected account.
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

const MIN_W = 980;
const STAGE_H = 500;
const EASE = "cubic-bezier(0.22,1,0.36,1)";

// The product's own green, from the Connect QuickBooks and Reconnect buttons.
const GREEN = "#0F7B4F";
const UP = "#1F7F4C";
const DOWN = "#C0402B";
const AMBER = "#C9832B";
const AI = "#4B3CC4";

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

const Spark = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2}>
    <path d="M12 3l1.6 4L18 8.5 14 10l-2 4-2-4-4-1.5L10 7z" />
  </svg>
);
const Alert = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2}>
    <path d="M12 4.2l8.4 15.2H3.6z" />
    <path d="M12 10v3.6M12 16.6v.1" />
  </svg>
);
const Plug = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M9 3.4v5M15 3.4v5" />
    <path d="M6.4 8.4h11.2v3.2a5.6 5.6 0 0 1-11.2 0z" />
    <path d="M12 17.2v3.4" />
  </svg>
);
const Shield = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 3.4l7.4 2.6v5.6c0 4.2-3 7.6-7.4 9-4.4-1.4-7.4-4.8-7.4-9V6z" />
    <path d="M8.8 12l2.2 2.2 4.2-4.4" />
  </svg>
);
const Tick = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2.4}>
    <path d="M5 12l5 5L20 7" />
  </svg>
);
const Gem = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M7.4 4.4h9.2l3.4 4.6L12 19.6 4 9z" />
    <path d="M4 9h16M9.6 4.4L12 19.6 14.4 4.4" />
  </svg>
);
const Share = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="9.2" cy="8.4" r="3" />
    <path d="M3.6 18.6c0-2.8 2.5-4.6 5.6-4.6s5.6 1.8 5.6 4.6" />
    <path d="M16.2 6.2a3 3 0 0 1 0 5.6M17.4 14.6c1.9.6 3.2 1.9 3.2 4" />
  </svg>
);
const Ledger = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="4.4" y="3.4" width="15.2" height="17.2" rx="2" />
    <path d="M8 8h8M8 12h8M8 16h4.4" />
  </svg>
);
const Scale = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 4.4v15.2M6.6 19.6h10.8" />
    <path d="M4 9.4h16M4 9.4l-2 4.4h4zM20 9.4l-2 4.4h4z" />
  </svg>
);
const Wave = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M3.4 14.6c2.4 0 2.4-4 4.8-4s2.4 4 4.8 4 2.4-4 4.8-4 2.4 4 3.8 4" />
    <path d="M3.4 19.4h17.2" />
  </svg>
);
const Grid = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="3.6" y="3.6" width="7" height="7" rx="1.6" />
    <rect x="13.4" y="3.6" width="7" height="7" rx="1.6" />
    <rect x="3.6" y="13.4" width="7" height="7" rx="1.6" />
    <rect x="13.4" y="13.4" width="7" height="7" rx="1.6" />
  </svg>
);
const Search = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="10.8" cy="10.8" r="6.4" />
    <path d="M15.6 15.6l4.4 4.4" />
  </svg>
);
const Spin = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2.2}>
    <path d="M12 4.2a7.8 7.8 0 1 1-5.5 2.3" />
  </svg>
);

// ---------------------------------------------------------------- data
// July 2026. Notes section 7. Revenue less COGS is gross profit, gross profit
// less opex is net profit, on every column. A finance buyer will check.
const MONTHS = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];
const REVENUE = [318400, 336900, 352100, 371500, 380700, 412800];
const NET = [40300, 45800, 50600, 54800, 55500, 55900];

type Tile = {
  key: string;
  label: string;
  value: string;
  sub: string;
  delta: string;
  dir: "up" | "down" | "warn";
};

// The Big 6: two from the P&L's top, two from its bottom, two from cash.
const BIG6: Tile[] = [
  { key: "rev", label: "Revenue", value: "$412,800", sub: "July 2026", delta: "+8.4%", dir: "up" },
  { key: "gp", label: "Gross Profit", value: "$242,300", sub: "58.7% margin", delta: "+1.9 pts", dir: "up" },
  { key: "opex", label: "Operating Expenses", value: "$186,400", sub: "of $412,800 revenue", delta: "+12.1%", dir: "warn" },
  { key: "np", label: "Net Profit", value: "$55,900", sub: "13.5% margin", delta: "-1.1 pts", dir: "down" },
  { key: "cash", label: "Cash on Hand", value: "$318,400", sub: "across 3 accounts", delta: "-$22,100", dir: "down" },
  { key: "run", label: "Runway", value: "7.4 mo", sub: "at current burn", delta: "-0.6 mo", dir: "down" },
];

// The consent modal, condensed from the real one. Section 2 of the notes.
const SYNCS = [
  "Chart of Accounts",
  "Profit & Loss, last 6 months",
  "Balance Sheet, last 6 months",
];

// What the sync ticks through, in order.
const STEPS = [
  { label: "Chart of Accounts", meta: "142 accounts" },
  { label: "Profit & Loss", meta: "6 months" },
  { label: "Balance Sheet", meta: "6 months" },
  { label: "Building your dashboard", meta: "Big 6, trends, KPIs" },
];

const BRIEF =
  "Record revenue, and your cash still went down. July profit was $55,900 but cash fell $22,100, because receivables grew $55,800 and $68,400 of that is now over sixty days. The profit is real. It is sitting in somebody else's bank account.";

// The P&L tab, last month against the month before.
const PL = [
  { label: "Revenue", jul: "412,800", jun: "380,700", d: "+8.4%", dir: "up" as const, bold: true },
  { label: "Cost of goods sold", jul: "170,500", jun: "158,900", d: "+7.3%", dir: "flat" as const },
  { label: "Gross profit", jul: "242,300", jun: "221,800", d: "+9.2%", dir: "up" as const, bold: true },
  { label: "Payroll", jul: "112,600", jun: "101,400", d: "+11.0%", dir: "warn" as const },
  { label: "Marketing", jul: "38,900", jun: "33,100", d: "+17.5%", dir: "warn" as const },
  { label: "Software & hosting", jul: "12,400", jun: "11,900", d: "+4.2%", dir: "flat" as const },
  { label: "Rent & facilities", jul: "8,900", jun: "8,900", d: "0.0%", dir: "flat" as const },
  { label: "Other operating", jul: "13,600", jun: "11,000", d: "+23.6%", dir: "warn" as const },
  { label: "Total operating expenses", jul: "186,400", jun: "166,300", d: "+12.1%", dir: "warn" as const, bold: true },
  { label: "Net profit", jul: "55,900", jun: "55,500", d: "+0.7%", dir: "down" as const, bold: true },
];

// ---------------------------------------------------------------- scene
type View = "empty" | "syncing" | "dash" | "pl";

type Scene = {
  view: View;
  modal: boolean;
  hot: string;
  agreed: boolean;
  step: number; // how many sync steps have completed
  tiles: number; // how many of the Big 6 have landed
  chart: boolean; // the trend line drawn
  brief: string; // the briefing, typed
  briefDone: boolean;
};

const BLANK: Scene = {
  view: "empty", modal: false, hot: "", agreed: false,
  step: 0, tiles: 0, chart: false, brief: "", briefDone: false,
};

// Under prefers-reduced-motion: the finished dashboard with the briefing on it,
// since that is the outcome the loop exists to reach.
const STILL: Scene = {
  ...BLANK, view: "dash", tiles: BIG6.length, chart: true, brief: BRIEF, briefDone: true,
};

// ---------------------------------------------------------------- component
export default function CfoAnalyticsHeroTour() {
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
  const posRef = useRef({ x: 170, y: 44 });

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
      setCursor(170, 44);
      while (alive()) {
        setScene({ ...BLANK });
        await fade(1);

        // --- 1. Finance HQ with nothing in it yet
        await wait(1700);
        if (!(await tap("connect", 700))) return;
        patch({ modal: true });
        await wait(900);

        // --- 2. read the terms, tick the box, hand off to Intuit
        if (!(await tap("agree", 620))) return;
        patch({ agreed: true });
        await wait(620);

        if (!(await tap("continue", 560))) return;
        patch({ modal: false, view: "syncing" });
        await wait(560);

        // --- 3. the sync, one report at a time
        for (let i = 0; i < STEPS.length; i++) {
          patch({ step: i + 1 });
          await wait(560);
          if (!alive()) return;
        }
        await wait(420);
        patch({ view: "dash" });
        await wait(420);

        // --- 4. the Big 6 land, then the trend draws under them
        for (let i = 0; i < BIG6.length; i++) {
          patch({ tiles: i + 1 });
          await wait(130);
          if (!alive()) return;
        }
        await wait(340);
        patch({ chart: true });
        await wait(1500);

        // --- 5. the briefing, which is the point of the whole thing
        for (let i = 1; i <= BRIEF.length; i += 2) {
          if (!alive()) return;
          patch({ brief: BRIEF.slice(0, i) });
          await wait(11);
        }
        patch({ brief: BRIEF, briefDone: true });
        await wait(3400);

        // --- 6. and the whole P&L is here too
        if (!(await tap("tab-pl", 620))) return;
        patch({ view: "pl" });
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
            <Chrome scene={scene} />

            {scene.modal && <ConsentModal scene={scene} />}

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

// ---------------------------------------------------------------- the page shell
// Heading, the two real buttons, and the tab strip, all constant across views so
// the tour reads as one screen changing rather than four screens cutting.
const TABS = [
  { key: "over", label: "Overview", icon: Grid },
  { key: "pl", label: "Profit & Loss", icon: Ledger },
  { key: "bs", label: "Balance Sheet", icon: Scale },
  { key: "cf", label: "Cash Flow", icon: Wave },
  { key: "tx", label: "Transactions", icon: Search },
];

function Chrome({ scene }: { scene: Scene }) {
  const live = scene.view === "dash" || scene.view === "pl";

  return (
    <div className="flex h-full flex-col px-7 pb-6 pt-6">
      <div className="flex flex-none items-start gap-3">
        <span className="min-w-0 flex-1">
          <h3 className="text-[24px] font-extrabold tracking-tight">Finance HQ</h3>
          <p className="mt-0.5 text-[11.5px] leading-snug text-brand-charcoal">
            CFO-grade financial analytics powered by QuickBooks.
          </p>
        </span>
        <span className="flex flex-none items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-lg border border-[#E6E2DB] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-brand-charcoal">
            <Gem className="h-3 w-3" />
            Business Valuation
          </span>
          <span className="flex items-center gap-1.5 rounded-lg border border-[#E6E2DB] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-brand-charcoal">
            <Share className="h-3 w-3" />
            Share
          </span>
        </span>
      </div>

      {/* The tab strip only exists once there is data behind it. */}
      {live && (
        <div className="sop-view mt-3.5 flex flex-none items-center gap-1 border-b border-[#EBE7E0]">
          {TABS.map((t) => {
            const Icon = t.icon;
            const on = t.key === (scene.view === "pl" ? "pl" : "over");
            return (
              <span
                key={t.key}
                data-t={t.key === "pl" ? "tab-pl" : undefined}
                className={`flex items-center gap-1.5 border-b-2 px-2.5 pb-1.5 pt-1 text-[11px] transition-colors ${
                  on ? "font-bold" : "border-transparent font-medium text-brand-gray"
                } ${scene.hot === "tab-pl" && t.key === "pl" ? "rounded-t-md bg-[#FFF6EC]" : ""}`}
                style={on ? { borderColor: GREEN, color: GREEN } : undefined}
              >
                <Icon className="h-3 w-3" />
                {t.label}
              </span>
            );
          })}
          <span className="ml-auto flex items-center gap-1.5 pb-1.5 text-[10px] font-semibold" style={{ color: GREEN }}>
            <span className="h-[6px] w-[6px] rounded-full" style={{ background: GREEN }} />
            QuickBooks synced 4m ago
          </span>
        </div>
      )}

      <div className="mt-3.5 min-h-0 flex-1">
        {scene.view === "empty" && <EmptyView scene={scene} />}
        {scene.view === "syncing" && <SyncView scene={scene} />}
        {scene.view === "dash" && <DashView scene={scene} />}
        {scene.view === "pl" && <PlView />}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- view: not connected
// The real disconnected state, near enough verbatim.
function EmptyView({ scene }: { scene: Scene }) {
  return (
    <div className="sop-view grid h-full place-items-center rounded-xl border border-dashed border-[#DDD8CF] bg-white">
      <div className="text-center">
        <span className="mx-auto grid h-[54px] w-[54px] place-items-center rounded-2xl bg-[#FDF1DF]">
          <Alert className="h-6 w-6" style={{ color: AMBER }} />
        </span>
        <h4 className="mt-3.5 text-[16px] font-extrabold tracking-tight">Connect QuickBooks</h4>
        <p className="mx-auto mt-1 max-w-[320px] text-[11.5px] leading-relaxed text-brand-charcoal">
          Sync your chart of accounts, profit &amp; loss, and balance sheet to turn this page into a
          finance department.
        </p>
        <span
          data-t="connect"
          className={`mt-3.5 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[12.5px] font-semibold text-white transition-all duration-200 ${
            scene.hot === "connect" ? "shadow-[0_0_0_3px_rgba(234,123,27,0.4)]" : ""
          }`}
          style={{ background: GREEN }}
        >
          <Plug className="h-3.5 w-3.5" />
          Connect QuickBooks
        </span>
        <p className="mt-3 text-[10.5px] text-brand-gray">
          Don&rsquo;t use QuickBooks?{" "}
          <span className="font-semibold" style={{ color: GREEN }}>
            Add data manually &rarr;
          </span>
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- the consent modal
// Condensed from the real Connect QuickBooks Online modal. The four claims kept
// are the ones a finance person actually asks about.
function ConsentModal({ scene }: { scene: Scene }) {
  return (
    <div className="absolute inset-0 z-[60] grid place-items-center bg-[rgba(24,19,12,0.42)] px-6">
      <div className="sop-view w-[440px] rounded-2xl bg-white px-5 py-4 shadow-[0_24px_60px_-18px_rgba(20,14,6,0.5)]">
        <h4 className="flex items-center gap-2 text-[15px] font-bold tracking-tight">
          <Shield className="h-4 w-4" style={{ color: GREEN }} />
          Connect QuickBooks Online
        </h4>
        <p className="mt-1 text-[10.5px] leading-snug text-brand-charcoal">
          Before we redirect you to Intuit, review what we do with your data.
        </p>

        <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.12em] text-brand-gray">
          What we sync
        </p>
        <div className="mt-1.5 space-y-1">
          {SYNCS.map((s) => (
            <p key={s} className="flex items-center gap-2 text-[10.5px] font-medium">
              <Tick className="h-2.5 w-2.5 flex-none" style={{ color: GREEN }} />
              {s}
            </p>
          ))}
        </div>
        <p className="mt-1.5 rounded-md bg-[#EAF5EF] px-2 py-1 text-[9.5px] font-semibold" style={{ color: GREEN }}>
          Read-only. We never write to your QuickBooks.
        </p>

        <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.12em] text-brand-gray">
          Your control
        </p>
        <div className="mt-1.5 space-y-1 text-[10px] leading-snug text-brand-charcoal">
          <p>OAuth tokens are encrypted at rest (AES-256-GCM).</p>
          <p>Disconnect any time, or delete all data for a hard purge.</p>
          <p>
            AI insights are generated by Anthropic Claude, which does not retain your data for
            training.
          </p>
        </div>

        <div
          data-t="agree"
          className={`mt-3 flex items-start gap-2 rounded-lg border px-2.5 py-2 transition-all duration-200 ${
            scene.hot === "agree" ? "shadow-[0_0_0_2px_rgba(234,123,27,0.3)]" : ""
          }`}
          style={
            scene.agreed
              ? { background: "#EAF5EF", borderColor: "rgba(15,123,79,0.34)" }
              : { background: "#F7F5F1", borderColor: "#E6E2DB" }
          }
        >
          <span
            className="mt-px grid h-3 w-3 flex-none place-items-center rounded-[3px] transition-colors duration-200"
            style={
              scene.agreed
                ? { background: GREEN, color: "#fff" }
                : { border: "1.5px solid #C9C2B6", color: "transparent" }
            }
          >
            <Tick className="h-2 w-2" />
          </span>
          <span className="text-[9.5px] leading-snug text-brand-charcoal">
            I authorize Multiply OS to access my QuickBooks Online data under these terms.
          </span>
        </div>

        <div className="mt-3 flex items-center justify-end gap-3">
          <span className="text-[11.5px] font-semibold text-brand-charcoal">Cancel</span>
          <span
            data-t="continue"
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[12px] font-semibold transition-all duration-200 ${
              scene.agreed ? "text-white" : "bg-[#E6E2DB] text-brand-gray"
            } ${scene.hot === "continue" ? "shadow-[0_0_0_3px_rgba(234,123,27,0.35)]" : ""}`}
            style={scene.agreed ? { background: GREEN } : undefined}
          >
            <Plug className="h-3 w-3" />
            Continue to Intuit
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- view: syncing
function SyncView({ scene }: { scene: Scene }) {
  return (
    <div className="sop-view grid h-full place-items-center rounded-xl border border-[#EBE7E0] bg-white">
      <div className="w-[300px]">
        <p className="mb-3 flex items-center justify-center gap-2 text-[12.5px] font-bold">
          <Spin className="sop-spin h-3.5 w-3.5" style={{ color: GREEN }} />
          Pulling six months from QuickBooks
        </p>
        <div className="space-y-1.5">
          {STEPS.map((s, i) => {
            const done = scene.step > i;
            const now = scene.step === i;
            return (
              <div
                key={s.label}
                className="flex items-center gap-2.5 rounded-lg border px-2.5 py-1.5 transition-all duration-300"
                style={
                  done
                    ? { borderColor: "rgba(15,123,79,0.3)", background: "#F4FAF7" }
                    : { borderColor: "#EBE7E0", background: "#FAF9F7", opacity: now ? 1 : 0.5 }
                }
              >
                <span
                  className="grid h-[18px] w-[18px] flex-none place-items-center rounded-full transition-colors duration-300"
                  style={done ? { background: GREEN, color: "#fff" } : { border: "1.5px solid #D5D0C7" }}
                >
                  {done && <Tick className="h-2.5 w-2.5" />}
                </span>
                <span className="min-w-0 flex-1 truncate text-[10.5px] font-semibold">{s.label}</span>
                <span className="flex-none font-mono text-[8.5px] text-brand-gray">{s.meta}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-center text-[9.5px] text-brand-gray">
          Read-only. Nothing is written back to your books.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- view: the dashboard
function DashView({ scene }: { scene: Scene }) {
  return (
    <div className="flex h-full flex-col gap-2.5">
      {/* the Big 6 */}
      <div className="grid flex-none grid-cols-6 gap-2">
        {BIG6.map((t, i) => {
          const shown = scene.tiles > i;
          const tone = t.dir === "up" ? UP : t.dir === "warn" ? AMBER : DOWN;
          return (
            <div
              key={t.key}
              className="rounded-xl border border-[#EBE7E0] bg-white px-2.5 py-2 transition-all duration-300"
              style={{ opacity: shown ? 1 : 0, transform: shown ? "none" : "translateY(6px)" }}
            >
              <p className="truncate text-[8.5px] font-bold uppercase tracking-[0.1em] text-brand-gray">
                {t.label}
              </p>
              <p className="mt-0.5 text-[17px] font-extrabold leading-none tracking-tight tabular-nums">
                {t.value}
              </p>
              <p className="mt-1 flex items-center gap-1">
                <span
                  className="rounded-[4px] px-1 py-px text-[8.5px] font-bold tabular-nums"
                  style={{ background: `${tone}18`, color: tone }}
                >
                  {t.delta}
                </span>
              </p>
              <p className="mt-0.5 truncate text-[8px] text-brand-gray">{t.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[1.15fr_1fr] gap-2.5">
        {/* the deep dive, under the tiles, as the brief asks */}
        <div className="flex min-h-0 flex-col rounded-xl border border-[#EBE7E0] bg-white px-3 py-2.5">
          <p className="flex flex-none items-center gap-2 text-[11px] font-bold">
            Revenue and net profit
            <span className="ml-auto font-mono text-[8.5px] font-normal text-brand-gray">
              6 months
            </span>
          </p>
          <div className="relative min-h-0 flex-1 pt-2">
            <TrendChart on={scene.chart} />
          </div>
          <div className="flex flex-none items-center gap-3 pt-1">
            <span className="flex items-center gap-1 text-[8.5px] text-brand-gray">
              <span className="h-[2px] w-3 rounded-full" style={{ background: GREEN }} />
              Revenue
            </span>
            <span className="flex items-center gap-1 text-[8.5px] text-brand-gray">
              <span className="h-[2px] w-3 rounded-full" style={{ background: AI }} />
              Net profit
            </span>
          </div>
        </div>

        {/* the AI CFO briefing */}
        <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border bg-white" style={{ borderColor: "rgba(75,60,196,0.22)" }}>
          <p className="flex flex-none items-center gap-2 border-b px-3 py-2 text-[11px] font-bold" style={{ borderColor: "rgba(75,60,196,0.14)", background: "rgba(75,60,196,0.05)" }}>
            <span className="grid h-[18px] w-[18px] place-items-center rounded-md bg-gradient-to-br from-[#F49230] to-[#DE6F14] text-white">
              <Spark className="h-[10px] w-[10px]" />
            </span>
            AI CFO Briefing
            <span className="ml-auto font-mono text-[8.5px] font-normal text-brand-gray">
              July 2026
            </span>
          </p>
          <div className="min-h-0 flex-1 px-3 py-2.5">
            <p className="flex items-center gap-1.5">
              <span
                className="rounded-full px-1.5 py-px font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-white"
                style={{ background: DOWN }}
              >
                Cash
              </span>
              <span className="font-mono text-[8px] uppercase tracking-[0.06em] text-brand-gray">
                from Cash on Hand
              </span>
            </p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-brand-charcoal">
              {scene.brief}
              {!scene.briefDone && scene.brief.length > 0 && <span className="tour-caret" />}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Two series over the same six months, drawn on one axis by normalising each to
// its own range. The shapes are what matter here, not a shared scale.
function TrendChart({ on }: { on: boolean }) {
  const W = 300;
  const H = 96;
  const path = (vals: number[]) => {
    const lo = Math.min(...vals) * 0.94;
    const hi = Math.max(...vals) * 1.04;
    return vals
      .map((v, i) => {
        const x = (i / (vals.length - 1)) * W;
        const y = H - ((v - lo) / (hi - lo)) * H;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
  };

  return (
    <div className="absolute inset-x-0 top-2 bottom-0">
      <svg viewBox={`0 0 ${W} ${H + 14}`} className="h-full w-full" preserveAspectRatio="none" aria-hidden="true">
        {[0, 0.33, 0.66, 1].map((f) => (
          <line key={f} x1="0" x2={W} y1={f * H} y2={f * H} stroke="#F1EEE9" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        ))}
        <path
          d={path(REVENUE)}
          fill="none"
          stroke={GREEN}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          className={`tour-series ${on ? "tour-series-draw" : ""}`}
        />
        <path
          d={path(NET)}
          fill="none"
          stroke={AI}
          strokeWidth="2"
          strokeDasharray="3 3"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          style={{ opacity: on ? 1 : 0, transition: "opacity .5s ease .5s" }}
        />
      </svg>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between">
        {MONTHS.map((m) => (
          <span key={m} className="font-mono text-[7.5px] text-brand-gray">{m}</span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- view: the P&L
function PlView() {
  return (
    <div className="sop-view flex h-full flex-col overflow-hidden rounded-xl border border-[#EBE7E0] bg-white">
      <div className="flex flex-none items-center gap-2 border-b border-[#F1EEE9] px-3 py-2">
        <b className="text-[11.5px]">Profit &amp; Loss</b>
        <span className="ml-2 flex items-center gap-0.5 rounded-lg bg-[#F1EEE9] p-0.5">
          <span className="rounded-[6px] bg-brand-ink px-2 py-[3px] text-[9.5px] font-semibold text-white">
            Last month
          </span>
          <span className="px-2 py-[3px] text-[9.5px] font-medium text-brand-charcoal">Last 6 months</span>
        </span>
        <span className="ml-auto font-mono text-[8.5px] text-brand-gray">July 2026 vs June 2026</span>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#FAF9F7] text-[8.5px] uppercase tracking-[0.1em] text-brand-gray">
              <th className="px-3 py-1.5 font-bold">Account</th>
              <th className="px-3 py-1.5 text-right font-bold">Jul 2026</th>
              <th className="px-3 py-1.5 text-right font-bold">Jun 2026</th>
              <th className="px-3 py-1.5 text-right font-bold">Change</th>
            </tr>
          </thead>
          <tbody>
            {PL.map((r) => {
              const tone = r.dir === "up" ? UP : r.dir === "warn" ? AMBER : r.dir === "down" ? DOWN : "#8A857D";
              return (
                <tr
                  key={r.label}
                  className="border-t border-[#F5F2ED]"
                  style={r.bold ? { background: "#FAF9F7" } : undefined}
                >
                  <td className={`px-3 py-[5px] text-[10.5px] ${r.bold ? "font-bold" : "pl-5 text-brand-charcoal"}`}>
                    {r.label}
                  </td>
                  <td className={`px-3 py-[5px] text-right text-[10.5px] tabular-nums ${r.bold ? "font-bold" : ""}`}>
                    {r.jul}
                  </td>
                  <td className="px-3 py-[5px] text-right text-[10.5px] tabular-nums text-brand-gray">
                    {r.jun}
                  </td>
                  <td className="px-3 py-[5px] text-right">
                    <span
                      className="rounded-[4px] px-1.5 py-px text-[9px] font-bold tabular-nums"
                      style={{ background: `${tone}16`, color: tone }}
                    >
                      {r.d}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="flex-none border-t border-[#F1EEE9] px-3 py-1.5 text-[9.5px] text-brand-gray">
        Every line traces back to the QuickBooks accounts behind it. Click one to see the
        transactions.
      </p>
    </div>
  );
}
