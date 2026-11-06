"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { fmtDay } from "./format";

export interface ChartSeries {
  key: string;
  label: string;
  /** CSS colour, normally a var(--sN) token. */
  color: string;
  /** One value per day; null = no data for that day (drawn as a gap, not 0). */
  values: (number | null)[];
}

interface BarChartProps {
  days: string[];
  series: ChartSeries[];
  format: (n: number) => string;
  height?: number;
  label: string;
  /** Counts: keep axis ticks on whole numbers. */
  integer?: boolean;
}

const M = { top: 8, right: 4, bottom: 24, left: 44 };
const GAP = 2; // surface gap between stacked segments

function niceStep(raw: number): number {
  if (raw <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const n = raw / pow;
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return nice * pow;
}

/** Bar path with 4px rounded top corners, square at the baseline. */
function topRounded(x: number, y: number, w: number, h: number, r: number): string {
  const rr = Math.max(0, Math.min(r, w / 2, h));
  return `M${x},${y + h}V${y + rr}Q${x},${y} ${x + rr},${y}H${x + w - rr}Q${x + w},${y} ${x + w},${y + rr}V${y + h}Z`;
}

/**
 * Daily bar chart (stacked when given more than one series). One y axis,
 * recessive grid, hover tooltip per day, legend for 2+ series, and a table
 * view underneath for anyone who can't read the colours.
 */
export default function BarChart({ days, series, format, height = 220, label, integer }: BarChartProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [hover, setHover] = useState<number | null>(null);

  // Measure the container (not the SVG), right away and on every resize.
  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setWidth(Math.max(240, Math.floor(w)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const totals = days.map((_, i) =>
    series.reduce<number | null>((sum, s) => {
      const v = s.values[i];
      return v === null || v === undefined ? sum : (sum ?? 0) + v;
    }, null)
  );
  const max = Math.max(0, ...totals.map((t) => t ?? 0));
  const step = integer ? Math.max(1, Math.ceil(niceStep(max / 4))) : niceStep(max / 4);
  const top = Math.max(step, Math.ceil(max / step) * step);
  const ticks: number[] = [];
  for (let t = 0; t <= top + 1e-9; t += step) ticks.push(t);

  const plotW = width - M.left - M.right;
  const plotH = height - M.top - M.bottom;
  const band = plotW / Math.max(1, days.length);
  const barW = Math.max(2, Math.min(28, band * 0.68));
  const y = (v: number) => M.top + plotH - (v / top) * plotH;
  const labelEvery = Math.max(1, Math.ceil(days.length / Math.max(2, Math.floor(plotW / 70))));
  const isEmpty = totals.every((t) => !t);

  const tipLeft =
    hover === null ? 0 : Math.min(width - 170, Math.max(0, M.left + band * hover + band / 2 - 80));

  return (
    <div>
      {series.length > 1 && (
        <ul className="adm-legend">
          {series.map((s) => (
            <li key={s.key}>
              <i style={{ background: s.color }} />
              {s.label}
            </li>
          ))}
        </ul>
      )}
      <div className="adm-chart" ref={wrap} onMouseLeave={() => setHover(null)}>
        <svg width={width} height={height} role="img" aria-label={label}>
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={M.left}
                x2={width - M.right}
                y1={y(t)}
                y2={y(t)}
                stroke={t === 0 ? "var(--axis)" : "var(--grid)"}
                strokeWidth={1}
              />
              <text x={M.left - 8} y={y(t) + 4} textAnchor="end">
                {format(t)}
              </text>
            </g>
          ))}

          {hover !== null && (
            <rect
              x={M.left + band * hover}
              y={M.top}
              width={band}
              height={plotH}
              fill="var(--surface-2)"
            />
          )}

          {days.map((day, i) => {
            const x = M.left + band * i + (band - barW) / 2;
            let base = 0;
            const segs = series
              .map((s) => ({ s, v: s.values[i] ?? 0 }))
              .filter((seg) => seg.v > 0);
            return (
              <g key={day}>
                {segs.map((seg, j) => {
                  const y0 = y(base);
                  base += seg.v;
                  const y1 = y(base);
                  const isTop = j === segs.length - 1;
                  const gap = j > 0 ? GAP : 0;
                  const h = Math.max(1, y0 - y1 - gap);
                  return (
                    <path
                      key={seg.s.key}
                      d={
                        isTop
                          ? topRounded(x, y1, barW, h, 4)
                          : `M${x},${y1}h${barW}v${h}h${-barW}Z`
                      }
                      fill={seg.s.color}
                    />
                  );
                })}
                {i % labelEvery === 0 && (
                  <text x={M.left + band * i + band / 2} y={height - 6} textAnchor="middle">
                    {fmtDay(day)}
                  </text>
                )}
              </g>
            );
          })}

          {/* Hit targets: the whole day column, bigger than the bar. */}
          {days.map((day, i) => (
            <rect
              key={`hit-${day}`}
              x={M.left + band * i}
              y={M.top}
              width={band}
              height={plotH}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
          ))}
        </svg>

        {isEmpty && <div className="adm-chart-empty">Nothing recorded in this period</div>}

        {hover !== null && (
          <div className="adm-chart-tip" style={{ left: tipLeft, top: 0 }}>
            <b>{fmtDay(days[hover], true)}</b>
            {series.map((s) => (
              <div key={s.key}>
                <i style={{ background: s.color }} />
                {s.label}
                <span>{s.values[hover] === null ? "No data" : format(s.values[hover] ?? 0)}</span>
              </div>
            ))}
            {series.length > 1 && (
              <div>
                Total<span>{totals[hover] === null ? "No data" : format(totals[hover] ?? 0)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <details className="adm-details">
        <summary>View as table</summary>
        <div className="adm-table-wrap adm-table-scroll" style={{ marginTop: 8, maxHeight: 280 }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th scope="col">Date</th>
                {series.map((s) => (
                  <th key={s.key} scope="col" className="num">
                    {s.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((day, i) => (
                <tr key={day}>
                  <td>{fmtDay(day, true)}</td>
                  {series.map((s) => (
                    <td key={s.key} className="num">
                      {s.values[i] === null ? "—" : format(s.values[i] ?? 0)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
