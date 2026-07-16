"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const SLOT_MINUTES = 30;

const TZ_OPTIONS = [
  "Asia/Manila",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Asia/Singapore",
  "Australia/Sydney",
];

const pad = (n: number) => String(n).padStart(2, "0");
const dateKey = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

/** "Fri, Jul 17" from a "YYYY-MM-DD" key, tz-drift-free. */
function labelFromKey(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${WEEKDAYS[dow]}, ${MONTHS[m - 1].slice(0, 3)} ${d}`;
}

function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Manila";
  } catch {
    return "Asia/Manila";
  }
}

interface Props {
  contactId: string | null;
  leadName?: string;
  leadEmail?: string;
  onBack: () => void;
}

export default function BookingCalendar({ contactId, leadName, leadEmail, onBack }: Props) {
  const initialTz = useMemo(() => {
    const tz = detectTimezone();
    return TZ_OPTIONS.includes(tz) ? tz : tz; // keep detected even if not in list
  }, []);

  const today = useMemo(() => new Date(), []);
  const [timezone, setTimezone] = useState(initialTz);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const [days, setDays] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [booking, setBooking] = useState(false);
  const [bookError, setBookError] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);

  const isCurrentMonth =
    viewYear === today.getFullYear() && viewMonth === today.getMonth();

  // Fetch slots whenever the month or timezone changes.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    setSelectedDate(null);
    setSelectedSlot(null);

    const start = new Date(viewYear, viewMonth, 1).getTime();
    const end = new Date(viewYear, viewMonth + 1, 0, 23, 59, 59).getTime();

    const params = new URLSearchParams({
      start: String(start),
      end: String(end),
      timezone,
    });

    fetch(`/api/slots?${params.toString()}`)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        if (!json.ok) throw new Error(json.error || "Failed");
        const data: Record<string, string[]> = json.days || {};
        setDays(data);
        // Auto-select the first available date this month.
        const firstAvail = Object.keys(data).sort()[0] || null;
        setSelectedDate(firstAvail);
      })
      .catch(() => {
        if (!cancelled) setLoadError("Couldn't load available times. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [viewYear, viewMonth, timezone]);

  const fmtTime = useCallback(
    (iso: string) =>
      new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: timezone,
      }).format(new Date(iso)),
    [timezone]
  );

  const rangeLabel = useMemo(() => {
    if (!selectedSlot) return null;
    const startTxt = fmtTime(selectedSlot);
    const endTxt = fmtTime(
      new Date(new Date(selectedSlot).getTime() + SLOT_MINUTES * 60000).toISOString()
    );
    return `${startTxt} – ${endTxt}`;
  }, [selectedSlot, fmtTime]);

  const handleConfirm = async () => {
    if (!selectedSlot || !contactId) return;
    setBooking(true);
    setBookError(null);
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId, startTime: selectedSlot, timezone }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Failed");
      setBooked(true);
    } catch (err) {
      setBookError(
        err instanceof Error && err.message
          ? err.message
          : "That time couldn't be booked. Please pick another slot."
      );
    } finally {
      setBooking(false);
    }
  };

  // --- Booked confirmation (Celebration) ---
  if (booked) {
    const tzCity = timezone.split("/").pop()?.replace(/_/g, " ");
    const confetti = [
      { l: "16%", c: "#EA7B1B", d: "0.1s" },
      { l: "30%", c: "#1F9D55", d: "0.5s" },
      { l: "46%", c: "#E2740F", d: "0.25s" },
      { l: "60%", c: "#F6A04C", d: "0.7s" },
      { l: "74%", c: "#1F9D55", d: "0.15s" },
      { l: "86%", c: "#EA7B1B", d: "0.55s" },
    ];
    return (
      <div className="relative flex min-h-[460px] flex-col items-center justify-center overflow-hidden px-8 py-12 text-center">
        {/* confetti */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40">
          {confetti.map((p, i) => (
            <span
              key={i}
              className="book-confetti-piece absolute top-0 h-2 w-2 rounded-[2px]"
              style={{ left: p.l, background: p.c, animationDelay: p.d }}
            />
          ))}
        </div>

        {/* check disc + pulse ring */}
        <div className="book-pop relative mb-5 h-[74px] w-[74px]">
          <span className="absolute -inset-2 rounded-full border-2 border-brand-orange opacity-60 [animation:ping_2.4s_ease-out_infinite] motion-reduce:hidden" />
          <span className="absolute inset-0 grid place-items-center rounded-full bg-gradient-to-br from-[#F6A04C] to-[#E2740F] text-white shadow-[0_14px_30px_-12px_rgba(226,116,15,0.8)]">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>

        <h3 className="text-[27px] font-extrabold tracking-tight text-brand-ink">Your session is scheduled</h3>
        <p className="mt-2 max-w-[46ch] text-[15px] leading-relaxed text-brand-charcoal">
          <strong className="font-semibold text-brand-ink">Ashley</strong> will show you how Multiply OS brings your
          whole operation into one place, and answer any questions along the way.
        </p>

        {/* date + time chips */}
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#F0E4CE] bg-brand-orange/[0.08] px-3.5 py-2 text-[13.5px] font-semibold text-brand-ink">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="text-brand-orange-dark">
              <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" strokeLinecap="round" />
            </svg>
            <span className="tabular-nums">{selectedDate ? labelFromKey(selectedDate) : ""}</span>
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#F0E4CE] bg-brand-orange/[0.08] px-3.5 py-2 text-[13.5px] font-semibold text-brand-ink">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="text-brand-orange-dark">
              <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="tabular-nums">{rangeLabel}{tzCity ? ` · ${tzCity}` : ""}</span>
          </span>
        </div>

        {/* highlighted email confirmation */}
        {leadEmail ? (
          <div className="mt-7 inline-flex items-center gap-2.5 rounded-xl border border-brand-orange/40 bg-brand-orange/[0.10] px-4 py-3 text-[14px] text-brand-charcoal">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="flex-none text-brand-orange-dark">
              <rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>
              Confirmation &amp; calendar invite sent to{" "}
              <strong className="font-bold text-brand-orange-dark">{leadEmail}</strong>
            </span>
          </div>
        ) : (
          <p className="mt-7 text-[13.5px] text-brand-gray">Your confirmation &amp; calendar invite are on the way.</p>
        )}
      </div>
    );
  }

  // --- Month grid cells ---
  const firstDow = new Date(Date.UTC(viewYear, viewMonth, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(viewYear, viewMonth + 1, 0)).getUTCDate();
  const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate());
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const slotsForDay = selectedDate ? days[selectedDate] || [] : [];

  return (
    <div className="p-7 sm:p-8">
      {/* Top: title + host + lead chip */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to details"
            className="grid h-9 w-9 place-items-center rounded-[9px] border border-black/10 bg-white text-brand-charcoal transition-colors hover:bg-black/5 hover:text-brand-ink"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-brand-ink">MultiplyOS Demo Call</h3>
            <p className="mt-0.5 flex items-center gap-1.5 text-[13.5px] text-brand-charcoal">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="text-brand-orange-dark">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              30 min with Ashley
            </p>
          </div>
        </div>
        {leadName && (
          <div className="hidden items-center gap-2 rounded-full border border-[#F0E4CE] bg-brand-orange/[0.08] px-3 py-1.5 text-[12.5px] font-semibold text-brand-orange-dark sm:flex">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-orange text-white">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            {leadName}
          </div>
        )}
      </div>

      {/* Body: calendar + slots */}
      <div className="grid gap-8 sm:grid-cols-2">
        {/* Calendar */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                const m = viewMonth - 1;
                if (m < 0) { setViewMonth(11); setViewYear((y) => y - 1); } else setViewMonth(m);
              }}
              disabled={isCurrentMonth}
              aria-label="Previous month"
              className="grid h-[30px] w-[30px] place-items-center rounded-lg border border-[#E1DBD2] bg-white text-brand-charcoal transition-colors hover:border-brand-orange hover:text-brand-orange-dark disabled:cursor-not-allowed disabled:opacity-35"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <span className="text-[15px] font-bold tracking-tight text-brand-ink">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={() => {
                const m = viewMonth + 1;
                if (m > 11) { setViewMonth(0); setViewYear((y) => y + 1); } else setViewMonth(m);
              }}
              aria-label="Next month"
              className="grid h-[30px] w-[30px] place-items-center rounded-lg border border-[#E1DBD2] bg-white text-brand-charcoal transition-colors hover:border-brand-orange hover:text-brand-orange-dark"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-0.5">
            {WEEKDAYS.map((d) => (
              <span key={d} className="py-1 text-center text-[11px] font-semibold uppercase tracking-wide text-brand-gray">{d}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              if (d === null) return <span key={`b${i}`} />;
              const key = dateKey(viewYear, viewMonth, d);
              const avail = !!days[key];
              const isSelected = key === selectedDate;
              const isToday = key === todayKey;
              return (
                <button
                  key={key}
                  type="button"
                  disabled={!avail}
                  onClick={() => { setSelectedDate(key); setSelectedSlot(null); }}
                  className={[
                    "relative grid aspect-square place-items-center rounded-[10px] text-sm font-semibold tabular-nums transition-colors",
                    isSelected
                      ? "bg-brand-orange text-white"
                      : avail
                        ? "bg-brand-orange/[0.10] text-brand-ink hover:bg-brand-orange/25"
                        : "cursor-not-allowed font-medium text-[#D6CFC2]",
                  ].join(" ")}
                >
                  {d}
                  {isToday && (
                    <span className={`absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${isSelected ? "bg-white" : "bg-brand-orange"}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Slots */}
        <div>
          <p className="text-[15px] font-bold text-brand-ink">
            {selectedDate ? labelFromKey(selectedDate) : "Select a date"}
          </p>
          <p className="mb-3.5 text-[12.5px] text-brand-gray">
            {loading ? "Loading times…" : selectedDate ? `${slotsForDay.length} open times` : "Pick a day with availability"}
          </p>

          {loadError ? (
            <p className="text-[13.5px] font-medium text-[#C0392B]">{loadError}</p>
          ) : loading ? (
            <div className="grid grid-cols-2 gap-2.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[42px] animate-pulse rounded-[10px] bg-black/5" />
              ))}
            </div>
          ) : slotsForDay.length === 0 ? (
            <p className="text-[13.5px] text-brand-charcoal">
              No open times this month.{" "}
              <button type="button" onClick={() => { const m = viewMonth + 1; if (m > 11) { setViewMonth(0); setViewYear((y) => y + 1); } else setViewMonth(m); }} className="font-semibold text-brand-orange-dark underline underline-offset-2">
                Try next month →
              </button>
            </p>
          ) : (
            <div className="grid max-h-[220px] grid-cols-2 gap-2.5 overflow-y-auto pr-1">
              {slotsForDay.map((iso) => {
                const isSel = iso === selectedSlot;
                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => setSelectedSlot(iso)}
                    className={[
                      "rounded-[10px] border px-2.5 py-3 text-[14.5px] font-semibold tabular-nums transition-all",
                      isSel
                        ? "border-brand-orange bg-brand-orange text-white shadow-[0_8px_18px_-10px_rgba(234,123,27,0.9)]"
                        : "border-[#E1DBD2] bg-white text-brand-ink hover:border-brand-orange hover:bg-brand-orange/[0.06]",
                    ].join(" ")}
                  >
                    {fmtTime(iso)}
                  </button>
                );
              })}
            </div>
          )}

          {/* Timezone */}
          <div className="mt-4 flex items-center gap-2 rounded-[9px] border border-[#E1DBD2] bg-white px-3 py-2.5">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="text-brand-gray">
              <circle cx="12" cy="12" r="9" /><path d="M2 12h20M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
            </svg>
            <select
              aria-label="Time zone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="flex-1 cursor-pointer border-0 bg-transparent text-[13px] font-semibold text-brand-ink outline-none"
            >
              {(TZ_OPTIONS.includes(timezone) ? TZ_OPTIONS : [timezone, ...TZ_OPTIONS]).map((tz) => (
                <option key={tz} value={tz}>{tz.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#EFE8DB] pt-5">
        <div className="text-[13.5px] text-brand-charcoal">
          {bookError ? (
            <span className="font-medium text-[#C0392B]">{bookError}</span>
          ) : selectedSlot && selectedDate ? (
            <>
              <strong className="font-bold text-brand-ink">{labelFromKey(selectedDate)}</strong> · {rangeLabel}{" "}
              <span className="text-brand-gray">({timezone.split("/").pop()?.replace(/_/g, " ")})</span>
            </>
          ) : (
            <span className="text-brand-gray">Select a time to continue</span>
          )}
        </div>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!selectedSlot || booking}
          className="rounded-[11px] bg-brand-orange px-7 py-3 text-[15px] font-bold text-white shadow-[0_10px_22px_-12px_rgba(234,123,27,0.95)] transition-colors hover:bg-brand-orange-dark disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          {booking ? "Booking…" : "Confirm booking"}
        </button>
      </div>
    </div>
  );
}
