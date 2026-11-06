"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { Source } from "@/lib/admin/types";
import { delta, type Direction } from "./format";

/** Counts up to `value` once on mount and whenever it changes. */
export function useCountUp(value: number | null, durationMs = 1000): number | null {
  const [shown, setShown] = useState<number | null>(value);
  const from = useRef(0);
  useEffect(() => {
    if (value === null) {
      setShown(null);
      return;
    }
    if (typeof window === "undefined" || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(value);
      return;
    }
    const start = performance.now();
    const origin = from.current;
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(origin + (value - origin) * eased);
      if (p < 1) raf = requestAnimationFrame(step);
      else from.current = value;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs]);
  return shown;
}

/** Small "i" button with a note on how a figure is counted. */
export function InfoTip({ children, label = "How this is counted" }: { children: ReactNode; label?: string }) {
  return (
    <span className="adm-tip">
      <button type="button" aria-label={label}>
        i
      </button>
      <span className="adm-tip-body" role="tooltip">
        {children}
      </span>
    </span>
  );
}

export function Skeleton({ width = "60%", height = 34 }: { width?: string | number; height?: number }) {
  return <span className="skel" style={{ width, height }} aria-hidden />;
}

interface StatTileProps {
  label: string;
  info?: ReactNode;
  /** null = the source is unavailable; shown as "Unavailable", never as 0. */
  value: number | null;
  previous?: number | null;
  format: (n: number) => string;
  direction?: Direction;
  note?: string;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

/** A bento stat tile: label, big number, change versus the previous period. */
export function StatTile({
  label,
  info,
  value,
  previous,
  format,
  direction = "up-good",
  note,
  loading,
  className = "span-3",
  style,
}: StatTileProps) {
  const shown = useCountUp(loading ? null : value);
  const d =
    value !== null && previous !== null && previous !== undefined
      ? delta(value, previous, direction)
      : null;
  return (
    <section className={`t k ${className}`} style={style}>
      <h3>
        <span className="t-title">
          {label}
          {info && <InfoTip>{info}</InfoTip>}
        </span>
      </h3>
      {loading ? (
        <div className="big">
          <Skeleton width="45%" />
        </div>
      ) : value === null ? (
        <div className="big is-na">Unavailable</div>
      ) : (
        <div className="big">{format(shown ?? value)}</div>
      )}
      {!loading && d && previous !== null && previous !== undefined ? (
        <span className={`chg is-${d.tone}`}>
          {d.text} <s>vs {format(previous)}</s>
        </span>
      ) : !loading && value === null ? (
        <div className="t-note">See Data health</div>
      ) : note ? (
        <div className="t-note">{note}</div>
      ) : null}
    </section>
  );
}

/** A bento tile with a title row, optional tools and any content. */
export function Tile({
  title,
  info,
  sub,
  tools,
  className = "span-12",
  style,
  children,
}: {
  title: ReactNode;
  info?: ReactNode;
  sub?: ReactNode;
  tools?: ReactNode;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <section className={`t ${className}`} style={style}>
      <h2>
        <span className="t-title">
          {title}
          {info && <InfoTip>{info}</InfoTip>}
        </span>
        {tools}
      </h2>
      {sub ? <p className="t-sub">{sub}</p> : <div style={{ height: 12 }} />}
      {children}
    </section>
  );
}

/** Empty state for a section whose source is missing or failed. */
export function Unavailable({ source, name }: { source: Source<unknown>; name: string }) {
  if (source.available) return null;
  return (
    <div className="adm-unavailable">
      <span className="adm-un-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden>
          {source.reason === "not_configured" ? (
            <path d="M9 7H7a5 5 0 000 10h2M15 7h2a5 5 0 010 10h-2M8 12h8" />
          ) : (
            <path d="M12 8v5M12 16.5v.1M10.3 3.9L2.6 17.5A2 2 0 004.3 20.5h15.4a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
          )}
        </svg>
      </span>
      <strong>
        {name} {source.reason === "not_configured" ? "isn't connected yet" : "couldn't load"}
      </strong>
      <p>{source.note}</p>
    </div>
  );
}

export interface Column<T> {
  label: string;
  num?: boolean;
  render: (row: T) => ReactNode;
}

export function DataTable<T>({
  rows,
  columns,
  empty = "Nothing in this period.",
  rowKey,
}: {
  rows: T[];
  columns: Column<T>[];
  empty?: string;
  rowKey: (row: T, i: number) => string;
}) {
  return (
    <div className="adm-table-wrap adm-table-scroll">
      <table className="adm-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.label} className={c.num ? "num" : undefined} scope="col">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="adm-empty">
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={rowKey(row, i)}>
                {columns.map((c) => (
                  <td key={c.label} className={c.num ? "num" : undefined}>
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export type HealthTone = "ok" | "warn" | "error" | "off";

export function StatusPill({ tone }: { tone: HealthTone }) {
  const label = { ok: "Connected", warn: "Warning", error: "Error", off: "Not connected" }[tone];
  return (
    <span className={`adm-status is-${tone}`}>
      <StatusIcon tone={tone} />
      {label}
    </span>
  );
}

function StatusIcon({ tone }: { tone: HealthTone }) {
  const common = { viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.8, "aria-hidden": true } as const;
  if (tone === "ok")
    return (
      <svg {...common}>
        <circle cx="8" cy="8" r="6.5" />
        <path d="M5 8.2l2 2 4-4.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  if (tone === "warn")
    return (
      <svg {...common}>
        <path d="M8 2l6.5 11.5h-13z" strokeLinejoin="round" />
        <path d="M8 6.5v3.2M8 11.6v.1" strokeLinecap="round" />
      </svg>
    );
  if (tone === "error")
    return (
      <svg {...common}>
        <circle cx="8" cy="8" r="6.5" />
        <path d="M5.7 5.7l4.6 4.6M10.3 5.7l-4.6 4.6" strokeLinecap="round" />
      </svg>
    );
  return (
    <svg {...common}>
      <circle cx="8" cy="8" r="6.5" strokeDasharray="2.5 2.2" />
    </svg>
  );
}
