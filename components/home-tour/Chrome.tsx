"use client";

// The shell the ten acts play inside: browser title bar, the product's sidebar,
// the top bar, and the floating Ask Multi AI pill.
//
// Ported from public/mockup/dashboard.html, which this component replaces, so
// the frame the client has been signing off on is unchanged.
//
// The rail is EXACTLY the client's ten, in the client's order. One row per tab,
// nothing else.
//
// An earlier cut padded it out with Dashboard, My HQ, Team Meetings and a
// Toolbox group, copied from the real app's twenty-four-row rail so the frame
// would look like the product. That was wrong: it put rows on screen that the
// tour never visits and that nobody asked for, and it forced 12 Week Year and
// Agreements to hide inside collapsed parents. The brief was ten destinations,
// so the rail is ten destinations, every one of them clickable and every one of
// them somewhere the tour actually goes.
//
// Two labels are the client's words rather than the product's, because the
// client's list is what this rail follows:
//   - "CFO Dashboard" is Finance HQ / CFO View in the product
//   - "Scoreboards" and "Forms & Checklists" keep the product's plurals
// The rest match the real app's rail as screenshotted in September 2026.
import { useEffect, useRef, type ReactNode } from "react";
import {
  IBell,
  IBoard,
  IBook,
  ICal,
  IChart,
  ICoins,
  IDoc,
  IGear,
  IPen,
  IPlus,
  IShield,
  ISpark,
  ITarget,
  ITree,
  IUpDown,
  T,
  type Icon,
} from "./ui";

export const SIDEBAR_W = 226;
export const TOPBAR_H = 54;

type Row = { k: string; label: string; icon: Icon; dot?: boolean };

// The client's order, top to bottom. `k` matches Tab.nav in ./tabs.ts, so the
// rail and the running order cannot drift apart.
const NAV: Row[] = [
  { k: "org", label: "Org Chart", icon: ITree, dot: true },
  { k: "score", label: "Scoreboards", icon: IChart, dot: true },
  { k: "plan", label: "One Page Plan", icon: ITarget },
  { k: "twelve", label: "My 12 Week Year", icon: ICal },
  { k: "multi", label: "Multi AI", icon: ISpark },
  { k: "proj", label: "Projects", icon: IBoard },
  { k: "cfo", label: "CFO Dashboard", icon: ICoins },
  { k: "sop", label: "SOP HQ", icon: IBook },
  { k: "agree", label: "Agreements", icon: IPen, dot: true },
  { k: "forms", label: "Forms & Checklists", icon: IDoc },
];

// ---------------------------------------------------------------- browser bar
function TitleBar({ url }: { url: string }) {
  return (
    <div
      className="flex flex-none items-center gap-4 border-b px-4"
      style={{ height: 40, background: "#F0EEEA", borderColor: T.hair }}
    >
      <span className="flex flex-none gap-2">
        {["#F0655A", "#F4BE4F", "#61C454"].map((c) => (
          <i key={c} className="block h-3 w-3 rounded-full" style={{ background: c }} />
        ))}
      </span>
      <span
        className="mx-auto flex h-6 w-full max-w-[380px] items-center justify-center gap-[7px] rounded-[7px] border bg-white text-[12.5px]"
        style={{ borderColor: T.hair2, color: T.muted }}
      >
        <svg viewBox="0 0 24 24" className="h-3 w-3 flex-none" fill="none" stroke="currentColor" strokeWidth={2}>
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3" />
        </svg>
        {/* The path animates by character count, so a longer URL does not reflow
            the bar; it is centred and the bar has a fixed max width. */}
        <span>app.multiplyos.com{url}</span>
      </span>
    </div>
  );
}

// ---------------------------------------------------------------- the rail
function NavItem({
  row,
  active,
  duration,
  onPick,
}: {
  row: Row;
  active: boolean;
  duration: number;
  onPick: (k: string) => void;
}) {
  const fillRef = useRef<HTMLElement>(null);
  const Ico = row.icon;

  // The loading bar under the active row. Rebuilt on every activation so the
  // fill restarts from zero, and driven by the tab's own hold time so the bar
  // reaching its end and the tab advancing are the same instant.
  useEffect(() => {
    const el = fillRef.current;
    if (!el || !active) return;
    el.style.width = "0%";
    void el.offsetWidth; // reflow, so the transition below actually plays
    const a = el.animate([{ width: "0%" }, { width: "100%" }], {
      duration,
      easing: "linear",
      fill: "forwards",
    });
    return () => a.cancel();
  }, [active, duration]);

  return (
    <>
      <button
        type="button"
        onClick={() => onPick(row.k)}
        data-nav={row.k}
        className="relative mb-px flex w-full flex-none items-center gap-[11px] rounded-[8px] px-[10px] py-[6px] text-left text-[13px] transition-colors"
        style={{
          background: active ? T.orangeSoft : "transparent",
          color: active ? T.orange : T.body,
          fontWeight: active ? 650 : 500,
        }}
      >
        <Ico className="h-[17px] w-[17px] flex-none" style={{ color: active ? T.orange : T.muted }} />
        <span className="truncate">{row.label}</span>
        {row.dot && (
          <span className="ml-auto h-[6px] w-[6px] flex-none rounded-full" style={{ background: T.orange }} />
        )}
        {active && (
          <span
            aria-hidden="true"
            className="absolute bottom-[2px] left-[10px] right-[10px] h-[2.5px] overflow-hidden rounded-[2px]"
            style={{ background: "rgba(234,123,27,0.2)" }}
          >
            <i ref={fillRef} className="block h-full w-0 rounded-[2px]" style={{ background: T.orange }} />
          </span>
        )}
      </button>
    </>
  );
}

function Sidebar({
  nav,
  duration,
  onPick,
}: {
  nav: string;
  duration: number;
  onPick: (k: string) => void;
}) {
  return (
    <aside
      className="flex flex-none flex-col overflow-hidden border-r bg-white px-3 pb-[18px] pt-[14px]"
      style={{ width: SIDEBAR_W, borderColor: T.hair }}
    >
      <div className="flex items-center gap-px px-2 pb-3 pt-1 text-[16px] font-extrabold tracking-[-0.02em]">
        MULTIPLY
        <span className="text-[17px] leading-none" style={{ color: T.orange }}>
          ⚙
        </span>
        S
      </div>

      <div
        className="mb-2 flex items-center gap-[9px] rounded-[9px] border px-[10px] py-[9px]"
        style={{ borderColor: T.hair2 }}
      >
        <span
          className="grid h-[22px] w-[22px] flex-none place-items-center rounded-[6px]"
          style={{ background: "#EFEDE8", color: T.muted }}
        >
          <IShield className="h-[13px] w-[13px]" />
        </span>
        <b className="text-[13px] font-[650]">Company</b>
        <IUpDown className="ml-auto h-[13px] w-[13px] flex-none" style={{ color: T.muted2 }} />
      </div>

      {/* Ten rows at a 34px pitch is 340px against the 476px the rail has, so
          there is no longer any risk of the list running past the frame. The
          overflow-hidden stays as a backstop: if a row is ever added, it clips
          the bottom of the LIST rather than eating the footer and the profile. */}
      <nav className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {NAV.map((row) => (
          <NavItem
            key={row.k}
            row={row}
            active={row.k === nav}
            duration={duration}
            onPick={onPick}
          />
        ))}
      </nav>

      <div className="flex flex-none flex-col">
        {[
          { l: "Organization Settings", I: IGear },
          { l: "Inbox", I: IBell },
        ].map(({ l, I }) => (
          <span
            key={l}
            className="flex items-center gap-[11px] rounded-[8px] px-[10px] py-[7px] text-[12.5px]"
            style={{ color: "#6A655E" }}
          >
            <I className="h-4 w-4 flex-none" style={{ color: T.muted2 }} />
            {l}
          </span>
        ))}
      </div>

      <div
        className="mt-1 flex flex-none items-center gap-[9px] border-t px-2 pb-[2px] pt-[9px]"
        style={{ borderColor: T.hair }}
      >
        <span
          className="grid h-7 w-7 flex-none place-items-center rounded-[7px] text-[11px] font-bold text-white"
          style={{ background: "linear-gradient(135deg,#F49230,#D8563F)" }}
        >
          SL
        </span>
        <div className="min-w-0">
          <div className="text-[12.5px] font-[650] leading-[1.2]">Skylar Lewis</div>
          <div className="text-[11px]" style={{ color: T.muted2 }}>
            Company
          </div>
        </div>
        <IUpDown className="ml-auto h-[13px] w-[13px] flex-none" style={{ color: T.muted2 }} />
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------- the frame
export default function Chrome({
  url,
  nav,
  duration,
  onPick,
  showAsk,
  children,
}: {
  url: string;
  nav: string;
  duration: number;
  onPick: (k: string) => void;
  showAsk: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className="overflow-hidden rounded-[14px] border bg-white"
      style={{ borderColor: "rgba(0,0,0,0.06)" }}
    >
      <TitleBar url={url} />

      <div className="relative flex" style={{ height: 700, background: T.ground, color: T.ink }}>
        <Sidebar nav={nav} duration={duration} onPick={onPick} />

        <div className="flex min-w-0 flex-1 flex-col">
          <div
            className="flex flex-none items-center gap-[14px] border-b px-5"
            style={{ height: TOPBAR_H, borderColor: T.hair, background: T.ground }}
          >
            <span
              className="grid h-[30px] w-[30px] flex-none place-items-center rounded-[8px] text-white"
              style={{ background: T.orange, boxShadow: "0 6px 12px -6px rgba(234,123,27,0.7)" }}
            >
              <IPlus className="h-4 w-4" />
            </span>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden px-5 py-[14px]">{children}</div>
        </div>

        {/* Hidden on the Multi AI tab, since you are already inside it there. */}
        <span
          className="absolute bottom-5 right-5 z-50 inline-flex h-[38px] items-center gap-2 rounded-full border bg-white px-[15px] text-[13px] font-[650] transition-opacity duration-300"
          style={{
            borderColor: T.hair2,
            boxShadow: "0 12px 24px -12px rgba(40,30,15,0.4)",
            opacity: showAsk ? 1 : 0,
          }}
        >
          <span
            className="grid h-[22px] w-[22px] place-items-center rounded-full"
            style={{ background: "linear-gradient(135deg,#F49230,#EA7B1B)" }}
          >
            <ISpark className="h-[13px] w-[13px] text-white" />
          </span>
          Ask Multi AI
        </span>
      </div>
    </div>
  );
}
