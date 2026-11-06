"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { Demo, Lead, LeadType } from "@/lib/admin/types";
import { fmtDateTime, fmtDay, fmtInt, delta } from "./format";
import { InfoTip, Skeleton, useCountUp } from "./ui";

export const TYPE_LABEL: Record<LeadType, string> = {
  demo: "Demo request",
  coaching: "Coaching call",
  contact: "Contact form",
};
export const TYPE_COLOR: Record<LeadType, string> = {
  demo: "var(--s1)",
  coaching: "var(--s2)",
  contact: "var(--s3)",
};
export const STATUS_LABEL: Record<string, string> = {
  confirmed: "Confirmed",
  showed: "Showed",
  noshow: "No-show",
  cancelled: "Cancelled",
  new: "New",
  invalid: "Invalid",
};
const STATUS_ORDER = ["showed", "confirmed", "noshow", "new", "cancelled", "invalid"];
const STATUS_COLOR: Record<string, string> = {
  showed: "var(--s3)",
  confirmed: "var(--s1)",
  noshow: "var(--s2)",
};

const delay = (s: number): CSSProperties => ({ animationDelay: `${s}s` });

// ---- Hero ----------------------------------------------------------------------

export function HeroTile({
  value,
  previous,
  daily,
  loading,
  note,
}: {
  value: number | null;
  previous: number | null;
  daily: number[] | null;
  loading: boolean;
  note?: string;
}) {
  const shown = useCountUp(loading ? null : value, 1200);
  const d = value !== null && previous !== null ? delta(value, previous) : null;

  const path = useMemo(() => {
    if (!daily || daily.length < 2) return null;
    let run = 0;
    const cum = daily.map((v) => (run += v));
    const max = Math.max(1, cum[cum.length - 1]);
    const n = cum.length - 1;
    return cum.map((v, i) => `${i ? "L" : "M"}${((i / n) * 400).toFixed(1)},${(116 - (v / max) * 92).toFixed(1)}`).join("");
  }, [daily]);

  return (
    <section className="t hero span-5 rows-3 p-hero">
      <div className="hero-deco" />
      <h2>Website leads</h2>
      {loading ? (
        <div className="big">
          <Skeleton width="40%" height={96} />
        </div>
      ) : value === null ? (
        <div className="big is-na">Unavailable</div>
      ) : (
        <div className="big">{fmtInt(shown ?? value)}</div>
      )}
      {d && previous !== null && (
        <span className="chg">
          {d.text} <s>vs {fmtInt(previous)}</s>
        </span>
      )}
      <p>{note ?? "People who sent a demo, coaching or contact form. Staff and test emails left out."}</p>
      {path && (
        <svg className="hero-ribbon" viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id="adm-hero-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity=".35" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${path}L400,120L0,120Z`} fill="url(#adm-hero-fill)" />
          <path d={path} fill="none" stroke="#fff" strokeWidth={2.5} vectorEffect="non-scaling-stroke" />
        </svg>
      )}
    </section>
  );
}

// ---- Activity calendar ---------------------------------------------------------

export function ActivityTile({
  days,
  values,
  loading,
  unavailable,
}: {
  days: string[];
  values: number[] | null;
  loading: boolean;
  unavailable?: string;
}) {
  const max = values ? Math.max(1, ...values) : 1;
  const pad = days.length ? new Date(`${days[0]}T00:00:00Z`).getUTCDay() : 0;
  const weeks = Math.ceil((pad + days.length) / 7);
  const months = useMemo(() => {
    const seen: string[] = [];
    for (const d of days) {
      const m = new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", month: "short" });
      if (!seen.includes(m)) seen.push(m);
    }
    return seen.length > 1 ? seen : days.length ? [fmtDay(days[0]), fmtDay(days[days.length - 1])] : [];
  }, [days]);

  return (
    <section className="t heat span-7 rows-2 p-heat" style={delay(0.2)}>
      <h2>
        <span className="t-title">
          Lead activity
          <InfoTip>Each square is one day in this period (Sunday at the top). The darker the square, the more website leads that day.</InfoTip>
        </span>
        <span className="heat-scale" aria-hidden>
          Less <i style={{ background: "var(--heat-0)" }} />
          <i style={{ background: "var(--heat-1)" }} />
          <i style={{ background: "var(--heat-2)" }} />
          <i style={{ background: "var(--heat-3)" }} /> More
        </span>
      </h2>
      {loading ? (
        <div style={{ marginTop: 14 }}>
          <Skeleton width="100%" height={150} />
        </div>
      ) : !values ? (
        <p className="t-sub" style={{ marginTop: 14 }}>
          {unavailable ?? "Unavailable"}
        </p>
      ) : (
        <>
          <div
            className="heat-cal"
            role="img"
            aria-label="Website leads per day"
            style={{ gridAutoColumns: weeks >= 10 ? "minmax(0, 1fr)" : "34px" }}
          >
            {Array.from({ length: pad }, (_, i) => (
              <i key={`p${i}`} className="pad" />
            ))}
            {days.map((d, i) => {
              const n = values[i] ?? 0;
              const level = n === 0 ? "" : `l${Math.min(3, Math.max(1, Math.ceil((n / max) * 3)))}`;
              return (
                <i
                  key={d}
                  className={level}
                  title={`${fmtDay(d, true)}: ${n} lead${n === 1 ? "" : "s"}`}
                  style={{ animationDelay: `${(0.25 + i * 0.006).toFixed(3)}s` }}
                />
              );
            })}
          </div>
          <div className="heat-months" style={weeks < 10 ? { justifyContent: "flex-start", gap: 24 } : undefined}>
            {months.map((m, i) => (
              // A one-day range labels the first and last day the same, so the key needs the position.
              <span key={`${i}-${m}`}>{m}</span>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

// ---- Form mix donut --------------------------------------------------------------

export function FormMixTile({
  counts,
  loading,
}: {
  counts: Record<LeadType, number> | null;
  loading: boolean;
}) {
  const types: LeadType[] = ["demo", "coaching", "contact"];
  const total = counts ? types.reduce((s, t) => s + counts[t], 0) : 0;
  const R = 54;
  const C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <section className="t mix span-4 rows-2 p-mix" style={delay(0.25)}>
      <h2>
        <span className="t-title">
          Which form they used
          <InfoTip>Form submissions in this period. Someone who used two forms counts under both, so this can add up to more than the lead total.</InfoTip>
        </span>
      </h2>
      {loading || !counts ? (
        <>
          <Skeleton width={136} height={136} />
          <div>{loading ? <Skeleton width="80%" height={60} /> : <span className="t-sub">Unavailable</span>}</div>
        </>
      ) : (
        <>
          <svg viewBox="0 0 136 136" role="img" aria-label={types.map((t) => `${TYPE_LABEL[t]}: ${counts[t]}`).join(", ")}>
            <circle cx="68" cy="68" r={R} fill="none" stroke="var(--heat-0)" strokeWidth="18" />
            {total > 0 &&
              types.map((t) => {
                const n = counts[t];
                if (!n) return null;
                const len = Math.max(1, (n / total) * C - (total === n ? 0 : 4));
                const el = (
                  <circle
                    key={t}
                    cx="68"
                    cy="68"
                    r={R}
                    fill="none"
                    stroke={TYPE_COLOR[t]}
                    strokeWidth="18"
                    strokeDasharray={`${len} ${C - len}`}
                    strokeDashoffset={-offset}
                    transform="rotate(-90 68 68)"
                  />
                );
                offset += (n / total) * C;
                return el;
              })}
            <text x="68" y="66" textAnchor="middle" fontFamily="var(--display)" fontWeight="800" fontSize="28" fill="var(--text)">
              {total}
            </text>
            <text x="68" y="84" textAnchor="middle" fontSize="11" fill="var(--muted)">
              forms sent
            </text>
          </svg>
          <ul>
            {types.map((t) => (
              <li key={t}>
                <i style={{ background: TYPE_COLOR[t] }} />
                {TYPE_LABEL[t]}
                <b>{counts[t]}</b>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

// ---- Next demo countdown -------------------------------------------------------

export function NextDemoTile({
  next,
  loading,
  timeZone,
  unavailable,
}: {
  next: Demo | null | undefined;
  loading: boolean;
  timeZone: string;
  unavailable?: string;
}) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);
  const at = next ? Date.parse(next.startTime) : NaN;
  const left = Math.max(0, at - now);
  const parts = [
    [Math.floor(left / 86_400_000), "days"],
    [Math.floor((left % 86_400_000) / 3_600_000), "hours"],
    [Math.floor((left % 3_600_000) / 60_000), "min"],
  ] as const;

  return (
    <section className="t night span-4 rows-2 p-next" style={delay(0.3)}>
      <h2>Next demo in</h2>
      {loading ? (
        <div className="count">
          {parts.map(([, l]) => (
            <div key={l}>
              <b>–</b>
              <span>{l}</span>
            </div>
          ))}
        </div>
      ) : next === undefined ? (
        <p>{unavailable ?? "The demo calendar isn't available."}</p>
      ) : next === null ? (
        <p>
          <b>No demos booked ahead.</b> New bookings on the demo calendar show up here.
        </p>
      ) : (
        <>
          <div className="count" aria-label={`Next demo ${fmtDateTime(next.startTime, timeZone)}`}>
            {parts.map(([n, l]) => (
              <div key={l}>
                <b>{l === "days" ? n : String(n).padStart(2, "0")}</b>
                <span>{l}</span>
              </div>
            ))}
          </div>
          <p>
            <b>
              {new Date(at).toLocaleString("en-US", {
                timeZone,
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </b>
            {next.title ? ` · ${next.title}` : ""} · {(STATUS_LABEL[next.status] ?? next.status).toLowerCase()}
          </p>
        </>
      )}
    </section>
  );
}

// ---- Latest leads ----------------------------------------------------------------

function initials(name: string, email: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (email[0] ?? "?").toUpperCase();
}

export function LatestLeadsTile({
  leads,
  loading,
  timeZone,
  unavailable,
  onOpen,
}: {
  leads: Lead[] | null;
  loading: boolean;
  timeZone: string;
  unavailable?: string;
  onOpen: () => void;
}) {
  return (
    <section className="t span-4 rows-3 p-leads" style={delay(0.35)}>
      <h2>
        Latest leads
        <button type="button" className="adm-icon-btn" onClick={onOpen} style={{ minHeight: 30 }}>
          See all ↗
        </button>
      </h2>
      <div className="lead-list">
        {loading ? (
          Array.from({ length: 5 }, (_, i) => (
            <div className="lead" key={i}>
              <Skeleton width={36} height={36} />
              <Skeleton width="50%" height={14} />
            </div>
          ))
        ) : !leads ? (
          <p className="t-sub">{unavailable ?? "Unavailable"}</p>
        ) : leads.length === 0 ? (
          <p className="t-sub">No website leads in this period.</p>
        ) : (
          leads.slice(0, 12).map((l) => (
            <div className="lead" key={l.id}>
              <span className="lead-av" style={{ background: TYPE_COLOR[l.types[0]] }}>
                {initials(l.name, l.email)}
              </span>
              <span className="lead-who">
                <b>{l.name || l.email || "Unnamed"}</b>
                <span>{l.types.map((t) => TYPE_LABEL[t]).join(" · ")}</span>
              </span>
              <time dateTime={l.dateAdded}>
                {new Date(l.dateAdded).toLocaleDateString("en-US", { timeZone, month: "short", day: "numeric" })}
              </time>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

// ---- Demo outcomes -------------------------------------------------------------

export function OutcomesTile({
  byStatus,
  loading,
}: {
  byStatus: Record<string, number> | null;
  loading: boolean;
}) {
  const rank = (s: string) => (STATUS_ORDER.includes(s) ? STATUS_ORDER.indexOf(s) : 99);
  const entries = byStatus
    ? Object.entries(byStatus).sort((a, b) => rank(a[0]) - rank(b[0]) || b[1] - a[1])
    : [];
  return (
    <section className="t span-4 p-out" style={delay(0.4)}>
      <h2>
        <span className="t-title">
          Demo outcomes
          <InfoTip>Demos whose scheduled time falls in this period, by their status in GoHighLevel.</InfoTip>
        </span>
        {entries.length > 0 && (
          <ul className="legend">
            {entries.map(([s]) => (
              <li key={s}>
                <i style={{ background: STATUS_COLOR[s] ?? "var(--neutral-seg)" }} />
                {STATUS_LABEL[s] ?? s}
              </li>
            ))}
          </ul>
        )}
      </h2>
      {loading ? (
        <div className="stackbar">
          <Skeleton width="100%" height={42} />
        </div>
      ) : !byStatus ? (
        <p className="t-sub">Unavailable</p>
      ) : entries.length === 0 ? (
        <p className="t-sub" style={{ marginTop: 14 }}>
          No demos scheduled in this period.
        </p>
      ) : (
        <div className="stackbar">
          {entries.map(([s, n]) => (
            <div
              key={s}
              style={{ flex: n, background: STATUS_COLOR[s] ?? "var(--neutral-seg)" }}
              title={`${STATUS_LABEL[s] ?? s}: ${n}`}
            >
              {n}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ---- Data sources --------------------------------------------------------------

export function SourcesTile({
  sources,
  onOpen,
}: {
  sources: { name: string; tone: "ok" | "warn" | "error" | "off" | null }[];
  onOpen: () => void;
}) {
  const live = sources.filter((s) => s.tone === "ok" || s.tone === "warn").length;
  return (
    <section className="t span-4 p-src" style={delay(0.45)}>
      <h2>
        Data sources · {live} of {sources.length} live
        <button type="button" className="adm-icon-btn" onClick={onOpen} style={{ minHeight: 30 }}>
          Details ↗
        </button>
      </h2>
      <div className="src-row">
        {sources.map((s) => (
          <span key={s.name} className={`src is-${s.tone ?? "wait"}`}>
            {s.name}
          </span>
        ))}
      </div>
    </section>
  );
}
