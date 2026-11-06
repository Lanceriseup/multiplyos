"use client";

import { useEffect, useRef, useState } from "react";
import {
  MAX_RANGE_DAYS,
  PRESETS,
  formatRange,
  presetRange,
  previousRange,
  rangeLength,
  type DayRange,
  type PresetId,
} from "@/lib/admin/range";

/**
 * One slim date button that opens a panel with the presets and a two-month
 * calendar (design/admin-date-range-options-v1.html option 2). A preset applies
 * at once; calendar picks apply on "Apply". On phones the panel is a bottom sheet.
 */

export const PRESET_LABEL: Record<PresetId, string> = {
  today: "Today",
  yesterday: "Yesterday",
  "last-weekend": "Last weekend",
  "7d": "Last 7 days",
  "14d": "Last 14 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  custom: "Custom range",
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/** Like formatRange, but a single day also names the weekday: "Fri, Nov 6, 2026". */
export function formatRangeLong(range: DayRange): string {
  if (range.start !== range.end) return formatRange(range);
  return new Date(`${range.start}T12:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const key = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const monthOf = (k: string) => ({ y: Number(k.slice(0, 4)), m: Number(k.slice(5, 7)) - 1 });

interface Props {
  preset: PresetId;
  range: DayRange;
  today: string;
  onPreset: (id: Exclude<PresetId, "custom">) => void;
  onCustom: (range: DayRange) => void;
}

export default function DateRangePicker({ preset, range, today, onPreset, onCustom }: Props) {
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState<string | null>(range.start);
  const [end, setEnd] = useState<string | null>(range.end);
  const [view, setView] = useState(() => monthOf(range.end)); // the right-hand month
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  function show() {
    setStart(range.start);
    setEnd(range.end);
    setView(monthOf(range.end));
    setOpen(true);
  }
  function hide(returnFocus = true) {
    setOpen(false);
    if (returnFocus) trigger.current?.focus();
  }

  // Close on Escape or a click outside; focus the panel when it opens.
  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLButtonElement>(".is-on, button")?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && hide();
    const onDown = (e: PointerEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) hide(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function pickDay(k: string) {
    if (!start || end) {
      setStart(k);
      setEnd(null);
    } else if (k < start) {
      setStart(k);
    } else {
      setEnd(k);
    }
  }

  function shiftMonth(by: number) {
    setView(({ y, m }) => {
      const t = m + by;
      return { y: y + Math.floor(t / 12), m: ((t % 12) + 12) % 12 };
    });
  }

  const chosen: DayRange | null = start ? { start, end: end ?? start } : null;
  const tooLong = chosen ? rangeLength(chosen) > MAX_RANGE_DAYS : false;
  const thisMonth = monthOf(today);
  const atNow = view.y === thisMonth.y && view.m === thisMonth.m;
  const left = view.m === 0 ? { y: view.y - 1, m: 11 } : { y: view.y, m: view.m - 1 };

  const renderMonth = (y: number, m: number, side: "left" | "right") => {
    const first = new Date(Date.UTC(y, m, 1)).getUTCDay();
    const count = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    const lo = chosen?.start;
    const hi = chosen?.end;
    const prevBtn = (
      <button type="button" className="adm-dp-nav" aria-label="Previous month" onClick={() => shiftMonth(-1)}>
        <Chevron dir="left" />
      </button>
    );
    return (
      <div className={`adm-dp-month is-${side}`}>
        <div className="adm-dp-mhead">
          {side === "left" ? prevBtn : <span className="adm-dp-ph">{prevBtn}</span>}
          <strong>
            {MONTHS[m]} {y}
          </strong>
          {side === "right" ? (
            <button type="button" className="adm-dp-nav" aria-label="Next month" disabled={atNow} onClick={() => shiftMonth(1)}>
              <Chevron dir="right" />
            </button>
          ) : (
            <span className="adm-dp-nav-space" />
          )}
        </div>
        <div className="adm-dp-grid" role="grid" aria-label={`${MONTHS[m]} ${y}`}>
          {WEEKDAYS.map((w) => (
            <span key={w} className="adm-dp-wd" aria-hidden>
              {w}
            </span>
          ))}
          {Array.from({ length: first }, (_, i) => (
            <span key={`b${i}`} />
          ))}
          {Array.from({ length: count }, (_, i) => {
            const k = key(y, m, i + 1);
            const cls = [
              "adm-dp-day",
              k === lo && "is-start",
              k === hi && "is-end",
              lo && hi && k > lo && k < hi && "is-in",
              k === today && "is-today",
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <button
                key={k}
                type="button"
                className={cls}
                disabled={k > today}
                aria-pressed={k === lo || k === hi}
                aria-label={new Date(`${k}T12:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                onClick={() => pickDay(k)}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="adm-dp" ref={wrap}>
      <button
        ref={trigger}
        type="button"
        className="adm-dp-btn"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => (open ? hide() : show())}
      >
        <span className="adm-dp-ico" aria-hidden>
          <svg className="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
            <rect x="3.5" y="5" width="17" height="15" rx="3" />
            <path d="M3.5 10h17M8 3v4M16 3v4" />
          </svg>
        </span>
        <span className="adm-dp-label">{PRESET_LABEL[preset]}</span>
        <span className="adm-dp-dates">{formatRangeLong(range)}</span>
        <Chevron dir="down" className="adm-dp-chev" />
      </button>

      {open && (
        <>
          <div className="adm-dp-scrim" onClick={() => hide()} aria-hidden />
          <div className="adm-dp-pop" role="dialog" aria-label="Choose dates" ref={panel}>
            <div className="adm-dp-presets" role="group" aria-label="Quick ranges">
              {PRESETS.map((p) => {
                const r = presetRange(p.id, today);
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={preset === p.id ? "is-on" : undefined}
                    aria-pressed={preset === p.id}
                    onClick={() => {
                      onPreset(p.id);
                      hide();
                    }}
                  >
                    {PRESET_LABEL[p.id]}
                    <small>{r.start === r.end ? formatRange(r).replace(/, \d{4}$/, "") : `${rangeLength(r)}d`}</small>
                  </button>
                );
              })}
            </div>
            <div className="adm-dp-body">
              <div className="adm-dp-months">
                {renderMonth(left.y, left.m, "left")}
                {renderMonth(view.y, view.m, "right")}
              </div>
              <div className="adm-dp-foot">
                <p aria-live="polite">
                  {!chosen || !end ? (
                    "Pick the last day, or Apply for a single day."
                  ) : tooLong ? (
                    `Pick ${MAX_RANGE_DAYS} days or fewer.`
                  ) : (
                    <>
                      <b>{formatRangeLong(chosen)}</b> · {rangeLength(chosen)} {rangeLength(chosen) === 1 ? "day" : "days"}
                      <br />
                      Compared with {formatRange(previousRange(chosen))}
                    </>
                  )}
                </p>
                <div className="adm-dp-acts">
                  <button type="button" className="adm-dp-act" onClick={() => hide()}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="adm-dp-act is-primary"
                    disabled={!chosen || tooLong}
                    onClick={() => {
                      if (!chosen) return;
                      onCustom(chosen);
                      hide();
                    }}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Chevron({ dir, className }: { dir: "left" | "right" | "down"; className?: string }) {
  const d = dir === "left" ? "M15 6l-6 6 6 6" : dir === "right" ? "M9 6l6 6-6 6" : "M6 9l6 6 6-6";
  return (
    <svg className={`i ${className ?? ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}
