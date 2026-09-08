"use client";

// Tab 7 of 10: CFO Dashboard.
//
// Short cut of CfoAnalyticsHeroTour, which runs seven beats over about forty
// seconds. Four survive, and they walk the tab strip left to right:
//
//   3. CFO View, Big Picture   the Big Six, each one against a goal YOU set
//   4. CFO View, AI Briefing   typed out, and it explains a fall that was fine
//   5. Profit and Loss         the real hierarchy, with the % of income column
//   6. Key Ratios              seven ratios, each against its own target
//
// Beats 5 and 6 were added on the client's request. They are the two that answer
// "is this a dashboard or is this accounting": the Big Six are a summary anyone
// could draw, but a real P&L with accounts rolled up under Income, Cost of Goods
// Sold and Expenses, footing to a Net Operating Income and carrying a % of
// income column, is a statement out of the books. Key Ratios then does the same
// job one level up, and two of the seven deliberately FAIL their target, because
// a scorecard where everything passes is a brochure.
//
// Dropped, and worth naming because they are the strongest beats in the full
// tour: the second-password lock screen, six months of books arriving from
// QuickBooks, and the Business Valuation wizard. All three need setup time this
// tab does not have, and all three are on the feature page.
//
// The P&L rows and all seven ratios are traced from the product, via
// CfoAnalyticsHeroTour, which took them from the client's screenshots. Cost of
// Goods Sold stays collapsed and the nine smallest expense accounts are rolled
// into one row, which is how the full tour fits the statement on a stage too.
//
// "CFO Dashboard" is the client's name for this. The product calls the area
// Finance HQ and this tab CFO View, which is why the sidebar row is CFO
// Dashboard but the tab strip below says CFO View.
import { useRef, useState } from "react";
import { useAct, type Rig } from "../rig";
import { Caret, IChevron, ICoins, ILock, ISpark, PageHead, Pill, T } from "../ui";

type Metric = {
  k: string;
  /** Rendered from `to` scaled by the count-up progress. */
  to: number;
  fmt: (v: number) => string;
  goal: string;
  /** Fraction of the goal this figure represents, for the bar. */
  frac: number;
  good: boolean;
  note: string;
};

const BIG_SIX: Metric[] = [
  {
    k: "Revenue YTD",
    to: 612400,
    fmt: (v) => `$${(v / 1000).toFixed(1)}K`,
    goal: "$700.0K",
    frac: 0.875,
    good: true,
    note: "87% of goal, 6 months in",
  },
  {
    k: "Gross Margin",
    to: 61.4,
    fmt: (v) => `${v.toFixed(1)}%`,
    goal: "60.0%",
    frac: 1.023,
    good: true,
    note: "1.4 pts over goal",
  },
  {
    k: "Net Profit",
    to: 94200,
    fmt: (v) => `$${(v / 1000).toFixed(1)}K`,
    goal: "$110.0K",
    frac: 0.856,
    good: false,
    note: "down 14% on May",
  },
  {
    k: "Cash on Hand",
    to: 108900,
    fmt: (v) => `$${(v / 1000).toFixed(1)}K`,
    goal: "$100.0K",
    frac: 1.089,
    good: true,
    note: "8.9% over target",
  },
  {
    k: "Runway",
    to: 7.2,
    fmt: (v) => `${v.toFixed(1)} mo`,
    goal: "6.0 mo",
    frac: 1.2,
    good: true,
    note: "1.2 months of buffer",
  },
  {
    k: "Burn Rate",
    to: 15100,
    fmt: (v) => `$${(v / 1000).toFixed(1)}K`,
    goal: "$14.0K",
    frac: 1.079,
    good: false,
    note: "$1.1K over plan",
  },
];

// Trimmed from a longer version: at 183 characters it was still typing when the
// tab handed over, so the beat never settled. The kept half is the one that
// explains the one figure on screen that fell.
const BRIEFING =
  "Net profit fell 14% in June and that was the right call: the $16K went into two Sales hires who close in Q3. Margin held at 61.4%.";

// ---------------------------------------------------------------- Profit & Loss
// July 2026, accrual basis. Cost of Goods Sold is left collapsed and the nine
// smallest expense accounts are rolled into one row, so the statement fits.
type PlRow = { k: "grp" | "shut" | "acct" | "tot" | "key" | "more"; l: string; v?: string; p?: string; star?: boolean };
const PL: PlRow[] = [
  { k: "grp", l: "Income" },
  { k: "acct", l: "Services Revenue", v: "98,068.00", p: "54.83 %" },
  { k: "acct", l: "Recurring Subscriptions", v: "46,102.00", p: "25.77 %" },
  { k: "acct", l: "Product Sales", v: "20,752.00", p: "11.60 %" },
  { k: "acct", l: "Training & Workshops", v: "13,943.00", p: "7.80 %" },
  { k: "tot", l: "Total Income", v: "$178,865.00", p: "100.00 %" },
  { k: "shut", l: "Cost of Goods Sold", v: "54,129.00", p: "30.26 %" },
  { k: "key", l: "GROSS PROFIT", v: "$124,736.00", p: "69.74 %", star: true },
  { k: "grp", l: "Expenses" },
  { k: "acct", l: "Salaries & Wages", v: "30,398.00", p: "16.99 %" },
  { k: "acct", l: "Payroll Taxes & Benefits", v: "8,171.00", p: "4.57 %" },
  { k: "acct", l: "Marketing", v: "7,529.00", p: "4.21 %" },
  { k: "acct", l: "Rent", v: "6,861.00", p: "3.84 %" },
  { k: "acct", l: "Software & Subscriptions", v: "5,862.00", p: "3.28 %" },
  { k: "acct", l: "Depreciation", v: "4,200.00", p: "2.35 %" },
  { k: "more", l: "8 more expense accounts", v: "18,103.00", p: "10.12 %" },
  { k: "tot", l: "Total Expenses", v: "81,124.00", p: "45.35 %", star: true },
  { k: "key", l: "NET OPERATING INCOME", v: "$43,612.00", p: "24.38 %" },
];

// ---------------------------------------------------------------- Key Ratios
// All seven, each with the target the product ships. Two of them fail on
// purpose: OpEx Ratio and Return on Assets.
const RATIOS: { l: string; v: string; d: string; t: string; ok: boolean }[] = [
  { l: "Gross Margin", v: "69.7%", d: "Revenue minus cost of goods sold, divided by revenue", t: "Target: > 50%", ok: true },
  { l: "Net Profit Margin", v: "19.0%", d: "Net income divided by total revenue", t: "Target: > 10%", ok: true },
  { l: "Revenue per Employee", v: "$441,765", d: "Trailing 12-month revenue divided by headcount", t: "Higher is better", ok: true },
  { l: "Current Ratio", v: "10.68x", d: "Current assets divided by current liabilities", t: "Target: 1.5x to 3.0x", ok: true },
  { l: "Debt-to-Equity", v: "0.20x", d: "Total liabilities divided by total equity", t: "Target: < 2.0x", ok: true },
  { l: "OpEx Ratio", v: "45.4%", d: "Operating expenses excluding COGS, divided by revenue", t: "Lower is better", ok: false },
  { l: "Return on Assets", v: "4.0%", d: "Net income divided by total assets", t: "Target: > 5%", ok: false },
];

type ViewKey = "overview" | "cfo" | "pl" | "ratios";
const TABS: { k: ViewKey; label: string }[] = [
  { k: "overview", label: "Overview" },
  { k: "cfo", label: "CFO View" },
  { k: "pl", label: "Profit & Loss" },
  { k: "ratios", label: "Key Ratios" },
];

type Scene = {
  view: ViewKey;
  hot: string;
  /** Big Six count-up progress, 0..1. */
  t: number;
  brief: string;
  typing: boolean;
  /** Ratio cards revealed so far. */
  ratios: number;
};
const BLANK: Scene = { view: "overview", hot: "", t: 0, brief: "", typing: false, ratios: 0 };

export default function CfoAct({ active, rig }: { active: boolean; rig: Rig }) {
  const [s, setScene] = useState<Scene>(BLANK);
  // Scopes cursor-target lookups to THIS copy of the act. See ActApi.q.
  const rootRef = useRef<HTMLDivElement>(null);

  useAct(active, rig, rootRef, () => setScene(BLANK), async ({ alive, wait, rig: r, q }) => {
    const patch = (p: Partial<Scene>) => alive() && setScene((x) => ({ ...x, ...p }));
    const hit = (k: string) => q(`[data-cfo="${k}"]`);
    const tap = async (key: string, dur = 420, hold = 190) => {
      await r.glide(hit(key), 0.5, 0.5, dur);
      if (!alive()) return false;
      patch({ hot: key });
      await wait(hold);
      if (!alive()) return false;
      await r.click();
      patch({ hot: "" });
      return alive();
    };

    r.at(hit("t-cfo"), 0.5, 0.5);
    await r.fade(1, 200);
    if (!alive()) return;
    await wait(220);

    // ---- 1. CFO View, Big Picture
    if (!(await tap("t-cfo", 380))) return;
    patch({ view: "cfo" });
    // 16 steps reads as a roll rather than a cut, and is cheap enough that six
    // cards re-rendering together stays smooth.
    for (let i = 1; i <= 16; i++) {
      await wait(34);
      if (!alive()) return;
      patch({ t: i / 16 });
    }
    await wait(280);

    // ---- 2. the briefing that explains the one number that fell
    if (!alive()) return;
    await r.glide(hit("brief"), 0.12, 0.4, 420);
    if (!alive()) return;
    patch({ typing: true });
    for (let i = 1; i <= BRIEFING.length; i++) {
      if (!alive()) return;
      patch({ brief: BRIEFING.slice(0, i) });
      await wait(10);
    }
    patch({ typing: false });
    await wait(700);

    // ---- 3. and where those numbers come from
    if (!(await tap("t-pl", 480))) return;
    patch({ view: "pl" });
    await wait(2100);

    // ---- 4. the same books, one level up
    if (!(await tap("t-ratios", 400))) return;
    patch({ view: "ratios" });
    for (let i = 1; i <= RATIOS.length; i++) {
      await wait(70);
      if (!alive()) return;
      patch({ ratios: i });
    }
    await r.fade(0, 320);
  });

  const open = s.view !== "overview";

  return (
    <div ref={rootRef} className="flex h-full flex-col gap-3">
      <PageHead
        title="CFO Dashboard"
        sub="Your books, read the way a CFO would read them."
        right={
          <span
            className="inline-flex items-center gap-[6px] rounded-full border px-[10px] py-[5px] text-[11px] font-semibold"
            style={{ borderColor: T.hair2, color: T.muted }}
          >
            <ILock className="h-[12px] w-[12px]" />
            Second password required
          </span>
        }
      />

      {/* the tab strip, walked left to right */}
      <div className="flex flex-none items-center gap-1">
        {TABS.map((tb) => {
          const on = tb.k === s.view;
          return (
            <span
              key={tb.k}
              data-cfo={`t-${tb.k}`}
              className="rounded-[8px] px-[11px] py-[6px] text-[12px] transition-colors duration-200"
              style={{
                background: on ? T.orangeSoft : s.hot === `t-${tb.k}` ? "#F4F1EB" : "transparent",
                color: on ? T.orange : s.hot === `t-${tb.k}` ? T.ink : T.muted,
                fontWeight: on ? 650 : 500,
              }}
            >
              {tb.label}
            </span>
          );
        })}
        <span className="ml-auto flex items-center gap-[6px] text-[11px]" style={{ color: T.muted2 }}>
          <ICoins className="h-[13px] w-[13px]" />
          Synced from QuickBooks · 2 min ago
        </span>
      </div>

      <div className="relative min-h-0 flex-1">
        {/* ---------------- CFO View ---------------- */}
        <div
          className="absolute inset-0 flex flex-col gap-3 transition-opacity duration-[260ms]"
          style={{ opacity: s.view === "cfo" ? 1 : 0 }}
        >
          <div className="grid flex-none grid-cols-3 gap-3">
            {BIG_SIX.map((m, i) => {
              const v = m.to * s.t;
              const barPct = Math.min(100, m.frac * s.t * 100);
              const over = m.frac >= 1;
              return (
                <div
                  key={m.k}
                  className="rounded-[12px] border bg-white px-[14px] py-3 transition-all duration-[380ms] ease-out"
                  style={{
                    borderColor: T.hair,
                    opacity: open ? 1 : 0,
                    transform: open ? "translateY(0)" : "translateY(8px)",
                    transitionDelay: `${i * 45}ms`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10.5px] font-bold uppercase tracking-[0.09em]" style={{ color: T.muted }}>
                      {m.k}
                    </span>
                    <span className="ml-auto">
                      {m.good ? (
                        <Pill bg={T.greenSoft} fg="#1F8A52">
                          {over ? "Over goal" : "On pace"}
                        </Pill>
                      ) : (
                        <Pill bg={T.pink} fg={T.pinkInk}>
                          {over ? "Over plan" : "Under goal"}
                        </Pill>
                      )}
                    </span>
                  </div>
                  <div className="mt-[6px] flex items-baseline gap-[7px]">
                    <span className="text-[24px] font-[780] leading-none tracking-[-0.03em] tabular-nums">
                      {m.fmt(v)}
                    </span>
                    <span className="text-[11px]" style={{ color: T.muted2 }}>
                      goal {m.goal}
                    </span>
                  </div>
                  <div className="mt-[9px] h-[5px] overflow-hidden rounded-full" style={{ background: "#F1EEE9" }}>
                    <span
                      className="block h-full rounded-full"
                      style={{ width: `${barPct}%`, background: m.good ? T.green : T.pinkInk }}
                    />
                  </div>
                  <div className="mt-[6px] text-[11px]" style={{ color: T.muted2 }}>
                    {m.note}
                  </div>
                </div>
              );
            })}
          </div>

          <div
            data-cfo="brief"
            className="flex min-h-[96px] flex-none gap-[11px] rounded-[12px] border px-4 py-[13px] transition-all duration-[380ms]"
            style={{
              borderColor: s.typing || s.brief ? "#E6DFD3" : T.hair,
              background: s.typing || s.brief ? "#FFFCF7" : "#fff",
            }}
          >
            <span
              className="mt-[1px] grid h-[26px] w-[26px] flex-none place-items-center rounded-full"
              style={{ background: "linear-gradient(135deg,#F49230,#EA7B1B)" }}
            >
              <ISpark className="h-[14px] w-[14px] text-white" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <b className="text-[12.5px]">AI Briefing</b>
                <Pill bg={T.orangeSoft} fg={T.orange}>
                  AI-generated
                </Pill>
                <span className="text-[10.5px]" style={{ color: T.muted2 }}>
                  June close · reviewed against your One Page Plan
                </span>
              </div>
              <p className="mt-[6px] text-[13px] leading-[1.55]" style={{ color: "#3C3833" }}>
                {s.brief}
                <Caret on={s.typing} />
              </p>
            </div>
          </div>
        </div>

        {/* ---------------- Profit and Loss ---------------- */}
        <div
          className="absolute inset-0 flex flex-col overflow-hidden rounded-[12px] border bg-white transition-opacity duration-[260ms]"
          style={{ borderColor: T.hair, opacity: s.view === "pl" ? 1 : 0 }}
        >
          <div
            className="flex flex-none items-center gap-2 border-b px-3 py-[7px]"
            style={{ borderColor: T.hair, background: "#FAF9F7" }}
          >
            <b className="text-[10.5px]">Profit and Loss</b>
            <span className="text-[9.5px]" style={{ color: T.muted2 }}>
              July 2026 · accrual basis
            </span>
            <span className="ml-auto w-[104px] text-right text-[8px] font-bold uppercase tracking-[0.11em]" style={{ color: T.muted }}>
              Total
            </span>
            <span className="w-[58px] text-right text-[8px] font-bold uppercase tracking-[0.11em]" style={{ color: T.muted }}>
              % Inc
            </span>
          </div>

          <div className="min-h-0 flex-1">
            {PL.map((row) => {
              const grp = row.k === "grp";
              const shut = row.k === "shut";
              const tot = row.k === "tot";
              const key = row.k === "key";
              const more = row.k === "more";
              return (
                <div
                  key={row.l}
                  className="flex items-center gap-2 border-t px-3 py-[3px] leading-[12px]"
                  style={{
                    borderColor: "#F7F4EF",
                    background: tot || key ? "#FAF9F7" : undefined,
                  }}
                >
                  <span className="flex min-w-0 flex-1 items-center gap-[6px]">
                    {(grp || shut || row.k === "acct") && (
                      <IChevron
                        className="h-[9px] w-[9px] flex-none"
                        style={{ color: T.muted2, transform: grp ? "rotate(90deg)" : undefined }}
                      />
                    )}
                    <span
                      className="truncate"
                      style={{
                        paddingLeft: row.k === "acct" || more ? 6 : undefined,
                        fontSize: key ? 10 : 10,
                        fontWeight: key ? 800 : tot || grp || shut ? 700 : 400,
                        letterSpacing: key ? "0.01em" : undefined,
                        color: more ? T.muted2 : row.k === "acct" ? "#4A4A4A" : T.ink,
                        fontStyle: more ? "italic" : undefined,
                      }}
                    >
                      {row.l}
                    </span>
                  </span>
                  <span
                    className="w-[104px] flex-none text-right tabular-nums"
                    style={{
                      fontSize: key ? 10.5 : 10,
                      fontWeight: key ? 800 : tot || shut ? 700 : 400,
                    }}
                  >
                    {row.v}
                  </span>
                  <span
                    className="flex w-[58px] flex-none items-center justify-end gap-1 tabular-nums"
                    style={{ fontSize: 9.5, color: "#4A4A4A" }}
                  >
                    {row.star && <span style={{ color: "#E0A32E" }}>&#9733;</span>}
                    <span style={{ fontWeight: key || tot || shut ? 700 : 400 }}>{row.p}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ---------------- Key Ratios ---------------- */}
        <div
          className="absolute inset-0 transition-opacity duration-[260ms]"
          style={{ opacity: s.view === "ratios" ? 1 : 0 }}
        >
          <div className="grid h-full grid-cols-2 content-start gap-[10px]">
            {RATIOS.map((rt, i) => {
              const shown = s.ratios > i;
              return (
                <div
                  key={rt.l}
                  className="rounded-[12px] border bg-white px-[13px] py-[10px] transition-all duration-[320ms] ease-out"
                  style={{
                    borderColor: T.hair,
                    opacity: shown ? 1 : 0,
                    transform: shown ? "translateY(0)" : "translateY(7px)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10.5px] font-bold uppercase tracking-[0.09em]" style={{ color: T.muted }}>
                      {rt.l}
                    </span>
                    <span className="ml-auto">
                      {rt.ok ? (
                        <Pill bg={T.greenSoft} fg="#1F8A52">
                          Passing
                        </Pill>
                      ) : (
                        <Pill bg={T.pink} fg={T.pinkInk}>
                          Off target
                        </Pill>
                      )}
                    </span>
                  </div>
                  <div className="mt-[4px] flex items-baseline gap-2">
                    <span
                      className="text-[21px] font-[780] leading-none tracking-[-0.03em] tabular-nums"
                      style={{ color: rt.ok ? T.ink : T.pinkInk }}
                    >
                      {rt.v}
                    </span>
                    <span className="text-[10px] font-semibold" style={{ color: rt.ok ? "#1F8A52" : T.pinkInk }}>
                      {rt.t}
                    </span>
                  </div>
                  <div className="mt-[4px] text-[10px] leading-[1.35]" style={{ color: T.muted2 }}>
                    {rt.d}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
