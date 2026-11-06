"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import BarChart from "./BarChart";
import { DataTable, StatTile, StatusPill, Tile, Unavailable, type HealthTone } from "./ui";
import {
  ActivityTile,
  FormMixTile,
  HeroTile,
  LatestLeadsTile,
  NextDemoTile,
  OutcomesTile,
  STATUS_LABEL,
  SourcesTile,
  TYPE_COLOR,
  TYPE_LABEL,
} from "./overview";
import { useTheme } from "./useTheme";
import DateRangePicker, { formatRangeLong } from "./DateRangePicker";
import { downloadCsv, fmtDateTime, fmtInt, fmtMoney, fmtPct, zoneName } from "./format";
import {
  DEFAULT_PRESET,
  PRESETS,
  dayKey,
  eachDay,
  formatRange,
  isDayKey,
  presetRange,
  previousRange,
  type DayRange,
  type PresetId,
} from "@/lib/admin/range";
import type { Lead, LeadType, MetricsResponse, PaidAdsResponse, Source } from "@/lib/admin/types";

// ---- Navigation --------------------------------------------------------------

type Tab = "overview" | "leads" | "ads" | "traffic" | "search" | "health";

const ICONS: Record<Tab | "theme" | "logout" | "refresh" | "download" | "print", ReactNode> = {
  overview: <path d="M3 13h4v8H3zM10 8h4v13h-4zM17 3h4v18h-4z" />,
  leads: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5M16 4.5a3.5 3.5 0 010 7M18.5 14.8c1.6.8 2.6 2.5 3 5.2" />
    </>
  ),
  ads: <path d="M3 10v4a1 1 0 001 1h3l6 4V5L7 9H4a1 1 0 00-1 1zM17 8.5a5 5 0 010 7M19.5 6a8.5 8.5 0 010 12" />,
  traffic: <path d="M3 17l5.5-5.5 4 4L21 7M15 7h6v6" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5L21 21" />
    </>
  ),
  health: <path d="M3 12h4l2.5-6 5 12 2.5-6h4" />,
  theme: <path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z" />,
  logout: <path d="M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3M10 16l-4-4 4-4M6 12h10" />,
  refresh: <path d="M20 11a8 8 0 10-2.3 5.7M20 4v7h-7" />,
  download: <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />,
  print: <path d="M7 9V4h10v5M7 17H5a2 2 0 01-2-2v-4a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2h-2M7 14h10v6H7z" />,
};

function Icon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg className="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {ICONS[name]}
    </svg>
  );
}

const TABS: { id: Tab; label: string; title: string }[] = [
  { id: "overview", label: "Overview", title: "Overview" },
  { id: "leads", label: "Leads & demos", title: "Leads & demos" },
  { id: "ads", label: "Paid ads", title: "Paid ads" },
  { id: "traffic", label: "Traffic", title: "Traffic" },
  { id: "search", label: "Search", title: "Search" },
  { id: "health", label: "Data health", title: "Data health" },
];

// ---- Helpers -----------------------------------------------------------------

/** Value from a source, or null when it is unavailable (never 0). */
function pick<T, R>(src: Source<T> | undefined, fn: (d: T) => R): R | null {
  return src?.available ? fn(src.data) : null;
}

function toneOf(src: Source<unknown> | undefined): HealthTone | null {
  if (!src) return null;
  if (!src.available) return src.reason === "not_configured" ? "off" : "error";
  return src.warnings?.length ? "warn" : "ok";
}

function noteOf(src: Source<unknown> | undefined): string | undefined {
  return src && !src.available ? src.note : undefined;
}

async function getJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal, cache: "no-store" });
  if (res.status === 401) {
    window.location.assign("/admin/login");
    throw new Error("Signed out");
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.ok) throw new Error(json.error || `Request failed (${res.status})`);
  return json as T;
}

const leadCountInfo = (what: string) => (
  <>
    {what} New GoHighLevel contacts created in this period, by the day they were first added. A person who
    submits again later is not counted again. Staff and test emails are left out.
  </>
);

function TypeTags({ types }: { types: LeadType[] }) {
  return (
    <span className="adm-tags">
      {types.map((t) => (
        <span key={t} className="adm-tag">
          <i style={{ background: TYPE_COLOR[t] }} />
          {TYPE_LABEL[t]}
        </span>
      ))}
    </span>
  );
}

const Loading = () => <p className="t-sub">Loading…</p>;

// ---- Component ---------------------------------------------------------------

export default function AdminDashboard({ timeZone }: { timeZone: string }) {
  const { theme, cycleTheme, themeAttr } = useTheme();
  const today = dayKey(Date.now(), timeZone);

  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [preset, setPreset] = useState<PresetId>(DEFAULT_PRESET);
  const [range, setRange] = useState<DayRange>(() => presetRange("30d", today));
  const [reloadKey, setReloadKey] = useState(0);

  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [ads, setAds] = useState<PaidAdsResponse | null>(null);
  const [adsError, setAdsError] = useState<string | null>(null);
  const [leadFilter, setLeadFilter] = useState<LeadType | "all">("all");

  // ---- Rail blob: slides to the active item ----------------------------------
  const navRef = useRef<HTMLDivElement>(null);
  const blobRef = useRef<HTMLDivElement>(null);
  const placeBlob = useCallback(() => {
    const nav = navRef.current;
    const blob = blobRef.current;
    const active = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!nav || !blob || !active) return;
    if (matchMedia("(max-width: 760px)").matches) {
      blob.style.top = "0px";
      blob.style.left = `${active.offsetLeft}px`;
    } else {
      blob.style.left = "0px";
      blob.style.top = `${active.offsetTop}px`;
    }
  }, []);
  useLayoutEffect(placeBlob, [tab, placeBlob]);
  useEffect(() => {
    window.addEventListener("resize", placeBlob);
    return () => window.removeEventListener("resize", placeBlob);
  }, [placeBlob]);

  // Read tab and range from the address bar once, so a view can be shared.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const t = q.get("tab") as Tab | null;
    if (t && TABS.some((x) => x.id === t)) setTab(t);
    const p = q.get("range");
    const s = q.get("start");
    const e = q.get("end");
    if (p === "custom" && isDayKey(s) && isDayKey(e) && s <= e) {
      setPreset("custom");
      setRange({ start: s, end: e > today ? today : e });
    } else if (p && PRESETS.some((x) => x.id === p)) {
      setPreset(p as PresetId);
      setRange(presetRange(p as Exclude<PresetId, "custom">, today));
    }
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the address bar in step with the view.
  useEffect(() => {
    if (!ready) return;
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    url.searchParams.set("range", preset);
    if (preset === "custom") {
      url.searchParams.set("start", range.start);
      url.searchParams.set("end", range.end);
    } else {
      url.searchParams.delete("start");
      url.searchParams.delete("end");
    }
    window.history.replaceState(null, "", url);
  }, [ready, tab, preset, range]);

  // Main report and paid ads load separately: slow ad data never blocks leads.
  useEffect(() => {
    if (!ready) return;
    const q = `start=${range.start}&end=${range.end}`;
    const ac = new AbortController();
    setMetrics(null);
    setMetricsError(null);
    setAds(null);
    setAdsError(null);
    getJson<MetricsResponse>(`/api/admin/metrics?${q}`, ac.signal)
      .then(setMetrics)
      .catch((e) => !ac.signal.aborted && setMetricsError(String(e.message ?? e)));
    getJson<PaidAdsResponse>(`/api/admin/paid-ads?${q}`, ac.signal)
      .then(setAds)
      .catch((e) => !ac.signal.aborted && setAdsError(String(e.message ?? e)));
    return () => ac.abort();
  }, [ready, range.start, range.end, reloadKey]);

  const loading = !metrics && !metricsError;
  const adsLoading = !ads && !adsError;
  const leads = metrics?.leads;
  const demos = metrics?.demos;
  const traffic = metrics?.traffic;
  const search = metrics?.search;
  const metaAds = ads?.meta_ads;
  const previous = previousRange(range);
  const days = useMemo(() => eachDay(range), [range]);

  const health: { name: string; short: string; feeds: string; src: Source<unknown> | undefined; fetchError: string | null }[] = [
    { name: "GoHighLevel contacts", short: "GHL contacts", feeds: "Website leads on Overview and Leads", src: leads, fetchError: metricsError },
    { name: "GoHighLevel calendar", short: "GHL calendar", feeds: "Demos booked, outcomes, next demo", src: demos, fetchError: metricsError },
    { name: "Google Analytics 4", short: "GA4", feeds: "Traffic", src: traffic, fetchError: metricsError },
    { name: "Google Search Console", short: "Search Console", feeds: "Search", src: search, fetchError: metricsError },
    { name: "Meta ads (Windsor.ai)", short: "Meta ads", feeds: "Paid ads", src: metaAds, fetchError: adsError },
  ];
  const healthTone = (h: (typeof health)[number]): HealthTone | null => (h.fetchError ? "error" : toneOf(h.src));
  const issues = health.filter((h) => {
    const t = healthTone(h);
    return t !== null && t !== "ok";
  }).length;
  const failures = health.filter((h) => healthTone(h) === "error").length;

  function choosePreset(id: Exclude<PresetId, "custom">) {
    setPreset(id);
    setRange(presetRange(id, today));
  }

  /** Dates picked on the calendar; if they match a preset, show that preset's name. */
  function chooseCustom(r: DayRange) {
    if (!isDayKey(r.start) || !isDayKey(r.end) || r.start > r.end) return;
    const end = r.end > today ? today : r.end;
    const match = PRESETS.find((p) => {
      const pr = presetRange(p.id, today);
      return pr.start === r.start && pr.end === end;
    });
    setPreset(match ? match.id : "custom");
    setRange({ start: r.start, end });
  }

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => undefined);
    window.location.assign("/admin/login");
  }

  const visibleLeads: Lead[] = leads?.available
    ? leads.data.leads.filter((l) => leadFilter === "all" || l.types.includes(leadFilter))
    : [];

  // ---- Export ----------------------------------------------------------------

  function exportCsv() {
    const file = `multiplyos-${tab}-${range.start}_to_${range.end}.csv`;
    if (tab === "overview") {
      const l = leads?.available ? leads.data.daily : [];
      const d = demos?.available ? demos.data.daily : [];
      downloadCsv(file, [
        ["Date", "Demo requests", "Coaching requests", "Contact form", "Demos booked"],
        ...days.map((day, i) => [day, l[i]?.demo ?? "", l[i]?.coaching ?? "", l[i]?.contact ?? "", d[i]?.booked ?? ""]),
      ]);
    } else if (tab === "leads" && leads?.available) {
      downloadCsv(file, [
        ["Added", "Name", "Email", "Company", "Forms", "Event", "Source"],
        ...visibleLeads.map((l) => [
          l.dateAdded,
          l.name,
          l.email,
          l.company,
          l.types.map((t) => TYPE_LABEL[t]).join("; "),
          l.event ?? "",
          l.source,
        ]),
      ]);
    } else if (tab === "ads" && metaAds?.available) {
      downloadCsv(file, [
        ["Campaign", "Spend", "Impressions", "Clicks"],
        ...metaAds.data.campaigns.map((c) => [c.campaign, c.spend.toFixed(2), c.impressions, c.clicks]),
      ]);
    } else if (tab === "traffic" && traffic?.available) {
      downloadCsv(file, [
        ["Date", "Sessions"],
        ...traffic.data.daily.map((d) => [d.date, d.sessions ?? ""]),
        [],
        ["Channel", "Sessions"],
        ...traffic.data.channels.map((c) => [c.channel, c.sessions]),
      ]);
    } else if (tab === "search" && search?.available) {
      downloadCsv(file, [
        ["Query", "Clicks", "Impressions", "CTR", "Position"],
        ...search.data.queries.map((q) => [q.query, q.clicks, q.impressions, q.ctr.toFixed(4), q.position.toFixed(1)]),
      ]);
    } else if (tab === "health") {
      downloadCsv(file, [
        ["Source", "Status", "Note"],
        ...health.map((h) => [
          h.name,
          healthTone(h) ?? "loading",
          h.fetchError ?? (h.src && !h.src.available ? h.src.note : h.src?.available ? (h.src.warnings ?? []).join(" ") : ""),
        ]),
      ]);
    }
  }

  // ---- Render ------------------------------------------------------------------

  const current = TABS.find((t) => t.id === tab)!;
  const includesToday = range.end >= today;
  const demoCostRatio =
    metaAds?.available && leads?.available && leads.data.current.demo > 0
      ? metaAds.data.current.spend / leads.data.current.demo
      : null;

  const leadsChart = leads?.available ? (
    <BarChart
      label="Website leads per day"
      days={days}
      integer
      format={fmtInt}
      series={(["demo", "coaching", "contact"] as LeadType[]).map((t) => ({
        key: t,
        label: TYPE_LABEL[t],
        color: TYPE_COLOR[t],
        values: leads.data.daily.map((d) => d[t]),
      }))}
    />
  ) : leads ? (
    <Unavailable source={leads} name="GoHighLevel" />
  ) : (
    <Loading />
  );

  return (
    <div className="adm" data-theme={themeAttr}>
      {/* ---- Liquid rail ---- */}
      <aside className="adm-rail" aria-label="Admin">
        <div className="adm-rail-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/MultiplyOS_GearsOnly.png" alt="" />
          <span className="adm-rail-label">Multiply OS</span>
        </div>
        <nav className="adm-rail-nav" ref={navRef} aria-label="Dashboard sections">
          <div className="adm-blob" ref={blobRef} aria-hidden />
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className="adm-rail-item"
              aria-current={tab === t.id ? "page" : undefined}
              aria-label={t.label}
              onClick={() => setTab(t.id)}
            >
              <Icon name={t.id} />
              <span className="adm-rail-label">{t.label}</span>
              {t.id === "health" && issues > 0 && <span className="adm-nb">{issues}</span>}
            </button>
          ))}
        </nav>
        <div className="adm-rail-foot adm-rail-nav">
          <button type="button" className="adm-rail-item" onClick={cycleTheme} aria-label={`Theme: ${theme}. Change theme`}>
            <Icon name="theme" />
            <span className="adm-rail-label">Theme: {theme === "system" ? "System" : theme === "light" ? "Light" : "Dark"}</span>
          </button>
          <button type="button" className="adm-rail-item" onClick={signOut} aria-label="Sign out">
            <Icon name="logout" />
            <span className="adm-rail-label">Sign out</span>
          </button>
        </div>
      </aside>

      <main className={`adm-main${tab === "overview" ? " adm-main-fit" : ""}`}>
        {/* ---- Header ---- */}
        <header className="adm-head">
          <div>
            <h1>{current.title}</h1>
            <p className="adm-context">
              <span className="adm-print-range">{formatRangeLong(range)} · </span>
              Compared with <b>{formatRange(previous)}</b> · {zoneName(timeZone)}
              {includesToday && (
                <span className="adm-live">
                  <i aria-hidden />
                  Live · includes today
                </span>
              )}
            </p>
          </div>
          <div className="adm-controls">
            <span className="adm-loading" aria-live="polite">
              {loading || adsLoading ? "Loading…" : ""}
            </span>
            <DateRangePicker
              preset={preset}
              range={range}
              today={today}
              onPreset={choosePreset}
              onCustom={chooseCustom}
            />
            <div className="adm-tools">
              <button type="button" className="adm-icon-btn" onClick={() => setReloadKey((k) => k + 1)} aria-label="Refresh">
                <Icon name="refresh" />
                <span className="adm-tool-label">Refresh</span>
              </button>
              <button type="button" className="adm-icon-btn" onClick={exportCsv} disabled={loading} aria-label="Download CSV">
                <Icon name="download" />
                <span className="adm-tool-label">CSV</span>
              </button>
              <button type="button" className="adm-icon-btn" onClick={() => window.print()} aria-label="Save as PDF">
                <Icon name="print" />
                <span className="adm-tool-label">PDF</span>
              </button>
              <span className="adm-mobile-tools">
                <button type="button" className="adm-icon-btn" onClick={cycleTheme} aria-label="Change theme">
                  <Icon name="theme" />
                </button>
                <button type="button" className="adm-icon-btn" onClick={signOut} aria-label="Sign out">
                  <Icon name="logout" />
                </button>
              </span>
            </div>
          </div>
        </header>

        {(metricsError || failures > 0) && tab !== "health" && (
          <div className="adm-note is-error" role="status">
            <Icon name="health" />
            <span>
              {metricsError
                ? `The main report couldn't load: ${metricsError}`
                : `${failures} data source${failures === 1 ? "" : "s"} failed to load.`}
            </span>
            <button type="button" className="adm-btn" onClick={() => setTab("health")}>
              See Data health
            </button>
          </div>
        )}

        {/* ---- Overview ---- */}
        {tab === "overview" && (
          <>
            <div className="adm-bento adm-bento-overview">
              <HeroTile
                loading={loading}
                value={pick(leads, (d) => d.current.total)}
                previous={pick(leads, (d) => d.previous.total)}
                daily={pick(leads, (d) => d.daily.map((x) => x.demo + x.coaching + x.contact))}
                note={noteOf(leads)}
              />
              <StatTile
                className="span-3 p-k1"
                style={{ animationDelay: ".05s" }}
                label="Demo requests"
                loading={loading}
                value={pick(leads, (d) => d.current.demo)}
                previous={pick(leads, (d) => d.previous.demo)}
                format={fmtInt}
                info={leadCountInfo('Contacts tagged "demo-request" by the Book a Demo form.')}
              />
              <StatTile
                className="span-2 p-k2"
                style={{ animationDelay: ".1s" }}
                label="Demos booked"
                loading={loading}
                value={pick(demos, (d) => d.bookedCurrent)}
                previous={pick(demos, (d) => d.bookedPrevious)}
                format={fmtInt}
                info="Bookings made in this period on the demo calendar, counted on the day the booking was made, including ones later cancelled. Calendar events carry no email, so staff test bookings are not filtered out."
              />
              <StatTile
                className="span-2 p-k3"
                style={{ animationDelay: ".15s" }}
                label="Event leads"
                loading={loading}
                value={pick(leads, (d) => d.current.event)}
                previous={pick(leads, (d) => d.previous.event)}
                format={fmtInt}
                info="Website leads that arrived through an event QR code or short link (currently RUKCON)."
              />
              <ActivityTile
                days={days}
                loading={loading}
                values={pick(leads, (d) => d.daily.map((x) => x.demo + x.coaching + x.contact))}
                unavailable={noteOf(leads)}
              />
              <FormMixTile
                loading={loading}
                counts={pick(leads, (d) => ({ demo: d.current.demo, coaching: d.current.coaching, contact: d.current.contact }))}
              />
              <NextDemoTile
                loading={loading}
                timeZone={timeZone}
                next={demos?.available ? (demos.data.upcoming[0] ?? null) : undefined}
                unavailable={noteOf(demos)}
              />
              <LatestLeadsTile
                loading={loading}
                timeZone={timeZone}
                leads={pick(leads, (d) => d.leads)}
                unavailable={noteOf(leads)}
                onOpen={() => setTab("leads")}
              />
              <OutcomesTile loading={loading} byStatus={pick(demos, (d) => d.heldByStatus)} />
              <SourcesTile
                sources={health.map((h) => ({ name: h.short, tone: healthTone(h) }))}
                onOpen={() => setTab("health")}
              />
            </div>
            {leads?.available && leads.data.excluded.count > 0 && (
              <p className="adm-foot">
                {leads.data.excluded.count} staff or test submission{leads.data.excluded.count === 1 ? " was" : "s were"} left out
                (emails containing {leads.data.excluded.patterns.join(", ")}).
              </p>
            )}
          </>
        )}

        {/* ---- Leads & demos ---- */}
        {tab === "leads" && (
          <div className="adm-bento">
            <StatTile label="Website leads" loading={loading} value={pick(leads, (d) => d.current.total)} previous={pick(leads, (d) => d.previous.total)} format={fmtInt} info={leadCountInfo("Everyone who sent a website form.")} />
            <StatTile label="Demo requests" loading={loading} value={pick(leads, (d) => d.current.demo)} previous={pick(leads, (d) => d.previous.demo)} format={fmtInt} style={{ animationDelay: ".05s" }} />
            <StatTile label="Coaching calls" loading={loading} value={pick(leads, (d) => d.current.coaching)} previous={pick(leads, (d) => d.previous.coaching)} format={fmtInt} style={{ animationDelay: ".1s" }} />
            <StatTile label="Contact form" loading={loading} value={pick(leads, (d) => d.current.contact)} previous={pick(leads, (d) => d.previous.contact)} format={fmtInt} style={{ animationDelay: ".15s" }} />

            <Tile
              title="Leads per day"
              info="Each bar is one day in the reporting timezone, split by the form used. A contact who used two forms appears in both colours."
              style={{ animationDelay: ".2s" }}
            >
              {leadsChart}
            </Tile>

            <Tile
              title="Website leads"
              sub={leads?.available ? `${fmtInt(visibleLeads.length)} in this period, newest first` : undefined}
              info={leadCountInfo("Everyone who sent a website form.")}
              style={{ animationDelay: ".25s" }}
              tools={
                <select className="adm-select" aria-label="Filter by form" value={leadFilter} onChange={(e) => setLeadFilter(e.target.value as LeadType | "all")}>
                  <option value="all">All forms</option>
                  <option value="demo">Demo requests</option>
                  <option value="coaching">Coaching calls</option>
                  <option value="contact">Contact form</option>
                </select>
              }
            >
              {leads?.available ? (
                <DataTable
                  rows={visibleLeads}
                  rowKey={(l) => l.id}
                  columns={[
                    { label: "Added", render: (l) => fmtDateTime(l.dateAdded, timeZone) },
                    { label: "Name", render: (l) => l.name || "—" },
                    { label: "Email", render: (l) => l.email || "—" },
                    { label: "Company", render: (l) => l.company || "—" },
                    { label: "Form", render: (l) => <TypeTags types={l.types} /> },
                    { label: "Event", render: (l) => l.event?.toUpperCase() ?? "—" },
                    { label: "Source", render: (l) => l.source || "—" },
                  ]}
                />
              ) : leads ? (
                <Unavailable source={leads} name="GoHighLevel" />
              ) : (
                <Loading />
              )}
            </Tile>

            <Tile className="span-6" title="Demos booked in this period" info="Bookings made in this period on the demo calendar, newest first." style={{ animationDelay: ".3s" }}>
              {demos?.available ? (
                <DataTable
                  rows={demos.data.booked}
                  rowKey={(d) => d.id}
                  columns={[
                    { label: "Booked", render: (d) => fmtDateTime(d.bookedAt, timeZone) },
                    { label: "Demo time", render: (d) => fmtDateTime(d.startTime, timeZone) },
                    { label: "Status", render: (d) => STATUS_LABEL[d.status] ?? d.status },
                  ]}
                />
              ) : demos ? (
                <Unavailable source={demos} name="GoHighLevel calendar" />
              ) : (
                <Loading />
              )}
            </Tile>

            <Tile className="span-6" title="Upcoming demos" style={{ animationDelay: ".35s" }}>
              {demos?.available ? (
                <DataTable
                  rows={demos.data.upcoming}
                  rowKey={(d) => d.id}
                  empty="No upcoming demos."
                  columns={[
                    { label: "Demo time", render: (d) => fmtDateTime(d.startTime, timeZone) },
                    { label: "Status", render: (d) => STATUS_LABEL[d.status] ?? d.status },
                    { label: "Title", render: (d) => d.title || "—" },
                  ]}
                />
              ) : demos ? (
                <Unavailable source={demos} name="GoHighLevel calendar" />
              ) : (
                <Loading />
              )}
            </Tile>
          </div>
        )}

        {/* ---- Paid ads ---- */}
        {tab === "ads" && (
          <div className="adm-bento">
            {metaAds?.available &&
              metaAds.warnings?.map((w) => (
                <div key={w} className="adm-note span-12" role="status" style={{ margin: 0 }}>
                  <Icon name="health" />
                  <span>{w}</span>
                </div>
              ))}
            {adsError ? (
              <Tile title="Paid ads">
                <p className="t-sub">Paid ads couldn&apos;t load: {adsError}</p>
              </Tile>
            ) : metaAds && !metaAds.available ? (
              <Tile title="Meta ads">
                <Unavailable source={metaAds} name="Meta ads (Windsor.ai)" />
              </Tile>
            ) : (
              <>
                <StatTile className="span-2" label="Spend" loading={adsLoading} value={pick(metaAds, (d) => d.current.spend)} previous={pick(metaAds, (d) => d.previous.spend)} format={(n) => fmtMoney(n)} direction="neutral" />
                <StatTile className="span-2" label="Impressions" loading={adsLoading} value={pick(metaAds, (d) => d.current.impressions)} previous={pick(metaAds, (d) => d.previous.impressions)} format={fmtInt} />
                <StatTile className="span-2" label="Clicks" loading={adsLoading} value={pick(metaAds, (d) => d.current.clicks)} previous={pick(metaAds, (d) => d.previous.clicks)} format={fmtInt} />
                <StatTile
                  className="span-2"
                  label="Click-through"
                  loading={adsLoading}
                  value={pick(metaAds, (d) => (d.current.impressions ? d.current.clicks / d.current.impressions : 0))}
                  previous={pick(metaAds, (d) => (d.previous.impressions ? d.previous.clicks / d.previous.impressions : 0))}
                  format={(n) => fmtPct(n, 2)}
                  info="Total clicks divided by total impressions for the period (not an average of daily rates)."
                />
                <StatTile
                  className="span-2"
                  label="Cost per click"
                  loading={adsLoading}
                  value={pick(metaAds, (d) => (d.current.clicks ? d.current.spend / d.current.clicks : 0))}
                  previous={pick(metaAds, (d) => (d.previous.clicks ? d.previous.spend / d.previous.clicks : 0))}
                  format={(n) => fmtMoney(n, 2)}
                  direction="down-good"
                />
                <StatTile
                  className="span-2"
                  label="Per demo request"
                  loading={adsLoading || loading}
                  value={demoCostRatio}
                  format={(n) => fmtMoney(n, 2)}
                  note="Directional only"
                  info="Meta spend divided by website demo requests in the same period. Not attribution: it treats every demo request as if it came from ads. Return on ad spend isn't calculated."
                />
                <Tile title="Spend per day" info="In the ad account's timezone.">
                  {metaAds?.available ? (
                    <BarChart label="Meta ad spend per day" days={days} format={(n) => fmtMoney(n)} series={[{ key: "spend", label: "Spend", color: "var(--s1)", values: metaAds.data.daily.map((d) => d.spend) }]} />
                  ) : (
                    <Loading />
                  )}
                </Tile>
                <Tile title="Campaigns">
                  {metaAds?.available ? (
                    <DataTable
                      rows={metaAds.data.campaigns}
                      rowKey={(c) => c.campaign}
                      columns={[
                        { label: "Campaign", render: (c) => c.campaign },
                        { label: "Spend", num: true, render: (c) => fmtMoney(c.spend, 2) },
                        { label: "Impressions", num: true, render: (c) => fmtInt(c.impressions) },
                        { label: "Clicks", num: true, render: (c) => fmtInt(c.clicks) },
                        { label: "CTR", num: true, render: (c) => (c.impressions ? fmtPct(c.clicks / c.impressions, 2) : "—") },
                      ]}
                    />
                  ) : (
                    <Loading />
                  )}
                </Tile>
              </>
            )}
          </div>
        )}

        {/* ---- Traffic ---- */}
        {tab === "traffic" && (
          <div className="adm-bento">
            {traffic && !traffic.available ? (
              <Tile title="Traffic">
                <Unavailable source={traffic} name="Google Analytics 4" />
              </Tile>
            ) : (
              <>
                <StatTile label="Visitors" loading={loading} value={pick(traffic, (d) => d.current.users)} previous={pick(traffic, (d) => d.previous.users)} format={fmtInt} info="GA4 active users. One person on two devices counts twice." />
                <StatTile label="Sessions" loading={loading} value={pick(traffic, (d) => d.current.sessions)} previous={pick(traffic, (d) => d.previous.sessions)} format={fmtInt} />
                <StatTile label="Page views" loading={loading} value={pick(traffic, (d) => d.current.pageViews)} previous={pick(traffic, (d) => d.previous.pageViews)} format={fmtInt} />
                <StatTile
                  label="Leads per 100 sessions"
                  loading={loading}
                  value={traffic?.available && leads?.available && traffic.data.current.sessions ? (leads.data.current.total / traffic.data.current.sessions) * 100 : null}
                  format={(n) => n.toFixed(1)}
                  note="Directional only"
                  info="Website leads (GoHighLevel) divided by GA4 sessions, times 100. Different units from different systems, so treat it as a trend."
                />
                <Tile className="span-8" title="Sessions per day" info="GA4 dates follow the GA4 property's timezone. Days with no data are left as gaps.">
                  {traffic?.available ? (
                    <BarChart label="Sessions per day" days={days} integer format={fmtInt} series={[{ key: "sessions", label: "Sessions", color: "var(--s2)", values: traffic.data.daily.map((d) => d.sessions) }]} />
                  ) : (
                    <Loading />
                  )}
                </Tile>
                <Tile className="span-4" title="Channels">
                  {traffic?.available ? (
                    <DataTable
                      rows={traffic.data.channels}
                      rowKey={(c) => c.channel}
                      columns={[
                        { label: "Channel", render: (c) => c.channel },
                        { label: "Sessions", num: true, render: (c) => fmtInt(c.sessions) },
                      ]}
                    />
                  ) : (
                    <Loading />
                  )}
                </Tile>
              </>
            )}
          </div>
        )}

        {/* ---- Search ---- */}
        {tab === "search" && (
          <div className="adm-bento">
            {search && !search.available ? (
              <Tile title="Search">
                <Unavailable source={search} name="Google Search Console" />
              </Tile>
            ) : (
              <>
                <StatTile label="Google clicks" loading={loading} value={pick(search, (d) => d.current.clicks)} previous={pick(search, (d) => d.previous.clicks)} format={fmtInt} />
                <StatTile label="Impressions" loading={loading} value={pick(search, (d) => d.current.impressions)} previous={pick(search, (d) => d.previous.impressions)} format={fmtInt} />
                <StatTile label="Click-through" loading={loading} value={pick(search, (d) => d.current.ctr)} previous={pick(search, (d) => d.previous.ctr)} format={(n) => fmtPct(n, 2)} />
                <StatTile label="Average position" loading={loading} value={pick(search, (d) => d.current.position)} previous={pick(search, (d) => d.previous.position)} format={(n) => n.toFixed(1)} direction="down-good" info="Lower is better: 1 is the top result." />
                <Tile title="Clicks per day" info="Search Console reports in Pacific time. The last two or three days are provisional.">
                  {search?.available ? (
                    <BarChart label="Google clicks per day" days={days} integer format={fmtInt} series={[{ key: "clicks", label: "Clicks", color: "var(--s2)", values: search.data.daily.map((d) => d.clicks) }]} />
                  ) : (
                    <Loading />
                  )}
                </Tile>
                <Tile title="Top search queries">
                  {search?.available ? (
                    <DataTable
                      rows={search.data.queries}
                      rowKey={(q) => q.query}
                      columns={[
                        { label: "Query", render: (q) => q.query },
                        { label: "Clicks", num: true, render: (q) => fmtInt(q.clicks) },
                        { label: "Impressions", num: true, render: (q) => fmtInt(q.impressions) },
                        { label: "CTR", num: true, render: (q) => fmtPct(q.ctr, 1) },
                        { label: "Position", num: true, render: (q) => q.position.toFixed(1) },
                      ]}
                    />
                  ) : (
                    <Loading />
                  )}
                </Tile>
              </>
            )}
          </div>
        )}

        {/* ---- Data health ---- */}
        {tab === "health" && (
          <div className="adm-bento">
            <Tile title="Data sources" sub="Each source loads on its own. A source that is missing shows as Unavailable, never as zero.">
              {health.map((h) => {
                const tone = healthTone(h);
                const note = h.fetchError
                  ? h.fetchError
                  : !h.src
                    ? "Checking…"
                    : !h.src.available
                      ? h.src.note
                      : h.src.warnings?.join(" ") || "Loaded for this period.";
                return (
                  <div key={h.name} className="adm-health-row">
                    <div>
                      <strong>{h.name}</strong>
                      <small>{h.feeds}</small>
                    </div>
                    <div>{tone ? <StatusPill tone={tone} /> : <span className="adm-status">Checking…</span>}</div>
                    <p>{note}</p>
                  </div>
                );
              })}
            </Tile>
            <Tile title="How the numbers are counted" style={{ animationDelay: ".08s" }}>
              <ul className="adm-rules">
                <li>One date range drives every section. Days are calendar days in {timeZone}; the comparison is the same number of days just before.</li>
                <li>Leads are GoHighLevel contacts, counted once on the day they were first added, grouped by the website form tag they carry.</li>
                <li>
                  Staff and test emails are left out (emails containing{" "}
                  {leads?.available ? leads.data.excluded.patterns.join(", ") : "@riseupkings.com, +test"}). Change the list with INTERNAL_EMAIL_PATTERNS.
                </li>
                <li>Demos booked count by the day the booking was made. Demo outcomes count by the day of the demo.</li>
                <li>Search Console and Meta use their own clocks (Pacific time and the ad account&apos;s timezone).</li>
                <li>Ratios across systems (leads per session, spend per demo request) are directional. Ad-platform conversions are never counted as leads or sales.</li>
                <li>Nothing is stored: every figure is read from its source when the page loads.</li>
              </ul>
            </Tile>
          </div>
        )}

        <p className="adm-foot">
          Read-only. Nothing on this page changes data in any system.
          {metrics && ` Loaded ${fmtDateTime(metrics.meta.generatedAt, timeZone)}.`}
        </p>
      </main>
    </div>
  );
}
