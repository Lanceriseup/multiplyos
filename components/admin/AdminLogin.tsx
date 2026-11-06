"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "./useTheme";
import { zoneName } from "./format";

/**
 * Sign-in screen built from the dashboard's bento tiles
 * (design/admin-login-options-v1.html option 4). The side tiles are decoration
 * only: nothing from the reports is shown before sign-in.
 */
export default function AdminLogin({ timeZone }: { timeZone: string }) {
  const { themeAttr } = useTheme();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [caps, setCaps] = useState(false);
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);
  const [state, setState] = useState<"idle" | "busy" | "ok">("idle");
  const input = useRef<HTMLInputElement>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!password || state !== "idle") return;
    setState("busy");
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        setState("ok");
        window.location.assign("/admin");
        return;
      }
      setError(json.error || "Couldn't sign in. Try again.");
    } catch {
      setError("Couldn't reach the server. Check your connection.");
    }
    setState("idle");
    setShaking(true);
    input.current?.select();
  }

  const checkCaps = (e: React.KeyboardEvent) => setCaps(e.getModifierState("CapsLock"));

  return (
    <div className="adm adm-login" data-theme={themeAttr}>
      <main className="lg-grid">
        <section className="t lg-form">
          <form onSubmit={submit} noValidate>
            <div className="lg-brand">
              <span className="lg-mark">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/MultiplyOS_GearsOnly.png" alt="" width={28} height={28} />
              </span>
              Multiply OS <span className="lg-pill">Admin</span>
            </div>
            <h1>Sign in</h1>
            <p className="lg-sub">Enter the admin password to open the dashboard.</p>

            <label htmlFor="adm-password">Password</label>
            <div
              className={`lg-field${error ? " is-bad" : ""}${shaking ? " is-shake" : ""}`}
              onAnimationEnd={() => setShaking(false)}
            >
              <span className="lg-lock" aria-hidden>
                <Icon d={LOCK} />
              </span>
              <input
                ref={input}
                id="adm-password"
                name="password"
                type={show ? "text" : "password"}
                autoComplete="current-password"
                spellCheck={false}
                autoFocus
                required
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "adm-login-error" : undefined}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                onKeyDown={checkCaps}
                onKeyUp={checkCaps}
              />
              <button
                type="button"
                className="lg-eye"
                aria-label={show ? "Hide password" : "Show password"}
                aria-pressed={show}
                onClick={() => {
                  setShow((s) => !s);
                  input.current?.focus();
                }}
              >
                <Icon d={show ? EYE_OFF : EYE} />
              </button>
            </div>
            {caps && (
              <p className="lg-msg is-warn">
                <Icon d={UP} />
                Caps Lock is on
              </p>
            )}
            {error && (
              <p className="lg-msg is-bad" id="adm-login-error" role="alert">
                <Icon d={ALERT} />
                {error}
              </p>
            )}

            <button className={`lg-go is-${state}`} type="submit" disabled={!password || state !== "idle"}>
              {state === "busy" ? "Signing in…" : state === "ok" ? "Opening dashboard…" : "Sign in"}
              <span className="lg-go-i" aria-hidden>
                {state === "busy" ? <span className="lg-spin" /> : <Icon d={state === "ok" ? CHECK : ARROW} />}
              </span>
            </button>
            <p className="lg-fine">
              <Icon d={SHIELD} />
              Staff only. You stay signed in for 12 hours on this device.
            </p>
          </form>
        </section>

        <section className="t lg-hero" aria-hidden>
          <span className="lg-k">Multiply OS</span>
          <strong>Admin dashboard</strong>
          <span className="lg-gear">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/MultiplyOS_GearsOnly.png" alt="" width={150} height={150} />
          </span>
        </section>

        <Clock timeZone={timeZone} />

        {/* design/admin-login-staff-tile-options-v1.html option 2 */}
        <section className="t lg-staff">
          <h2>Stay signed in</h2>
          <div>
            <p className="lg-big">
              <span aria-hidden>
                12<small>h</small>
              </span>
              <span className="lg-sr">12 hours</span>
            </p>
            <div className="lg-cells" aria-hidden>
              {Array.from({ length: 12 }, (_, i) => (
                <i key={i} style={{ animationDelay: `${0.3 + i * 0.05}s` }} />
              ))}
            </div>
          </div>
          <span className="lg-note">
            <Icon d={SHIELD} />
            Staff only
          </span>
        </section>
      </main>
    </div>
  );
}

/** Live clock in the reporting timezone. Rendered after mount so server and browser agree. */
function Clock({ timeZone }: { timeZone: string }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 10_000);
    return () => clearInterval(id);
  }, []);


  let hour = "--";
  let minute = "--";
  let period = "";
  let day = "";
  if (now) {
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit", hour12: true })
        .formatToParts(now)
        .map((p) => [p.type, p.value])
    );
    hour = parts.hour;
    minute = parts.minute;
    period = parts.dayPeriod ?? "";
    day = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short", month: "short", day: "numeric" }).format(now);
  }

  return (
    <section className="t lg-clock">
      <span className="lg-k">
        <i aria-hidden />
        {zoneName(timeZone)}
      </span>
      <time dateTime={now?.toISOString()}>
        {hour}
        <span className="lg-colon">:</span>
        {minute}
        {period && <small>{period}</small>}
      </time>
      <p>{day ? `${day} · reports use this clock` : "Reports use this clock"}</p>
    </section>
  );
}

const LOCK = "M7 11V8a5 5 0 0110 0v3M6.5 11h11a1.5 1.5 0 011.5 1.5v6a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 015 18.5v-6A1.5 1.5 0 016.5 11z";
const EYE = "M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12zM12 15a3 3 0 100-6 3 3 0 000 6z";
const EYE_OFF =
  "M3 3l18 18M10.6 5.6A9.6 9.6 0 0112 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 01-3.1 3.9M6.6 6.6C3.9 8.3 2.5 12 2.5 12S6 18.5 12 18.5a9 9 0 004.4-1.1M9.9 9.9a3 3 0 004.2 4.2";
const ARROW = "M5 12h14M13 6l6 6-6 6";
const CHECK = "M5 12.5l4.5 4.5L19 7.5";
const SHIELD = "M12 3l7.5 3v5.5c0 4.6-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.9-7.5-9.5V6zM9 12l2.2 2.2L15.5 10";
const ALERT = "M12 21a9 9 0 100-18 9 9 0 000 18zM12 7.5v5.5M12 16.4v.1";
const UP = "M12 19V5M6 11l6-6 6 6";

function Icon({ d }: { d: string }) {
  return (
    <svg className="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}
