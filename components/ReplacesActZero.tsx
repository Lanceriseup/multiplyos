"use client";

// The opening beat every feature-page hero tour runs before its product appears:
// the tool this feature replaces, crossed out by hand, dissolving into the app.
//
// The client's mapping:
//
//   Projects       Asana, Monday.com
//   SOP HQ         Trainual
//   Metrics        ninety.io
//   Team Meetings  ninety.io
//
// Competitor names are set as their own wordmark where the artwork exists in
// public/, and fall back to plain text where it does not, so a page never renders
// a broken image while assets are still being made.
//
// The four tours do not share a state shape, so this exports the visual and the
// beat timing separately. Each tour keeps its own state and its own liveness
// guard, and calls runZero inside its existing loop.
import { PASS_ONE, PASS_TWO, ReplacedLogo } from "./ReplacesStrip";

// "" not running, "in" logo showing, "struck" marker drawn, "out" dissolving.
export type Zero = "" | "in" | "struck" | "out";

// h is the render height in px. It exists because the exports do not share a
// trim: measured against their 320x80 canvases, the artwork fills 95% of the
// height for Trainual and ninety.io but only 79% for Asana and 74% for
// Monday.com, so one shared height would render those two visibly smaller. The
// plain wordmarks also sit a little lower than the script face, since they are
// all cap height and read larger at the same measure.
export type ZeroItem = { name: string; logo: string; h?: number };

// Beat lengths. Exported so a tour can budget its loop against them.
const IN_MS = 520;
const STRUCK_MS = 1520; // two passes take 560 of this, so it holds struck ~1s
const OUT_MS = 480;
const GAP_MS = 160;

export const ZERO_MS = IN_MS + STRUCK_MS + OUT_MS + GAP_MS;

// A second name starts being struck this long after the first, so "Asana &
// Monday.com" reads as two deliberate strokes rather than one flicker.
const STAGGER_MS = 340;

// Runs the beats against a tour's own setter, waiter and liveness check.
// Returns false if the tour moved on underneath it.
export async function runZero(
  set: (z: Zero) => void,
  wait: (ms: number) => Promise<void>,
  alive: () => boolean,
  count = 1,
) {
  const extra = Math.max(0, count - 1) * STAGGER_MS;
  set("in");
  await wait(IN_MS);
  if (!alive()) return false;
  set("struck");
  await wait(STRUCK_MS + extra);
  if (!alive()) return false;
  set("out");
  await wait(OUT_MS);
  if (!alive()) return false;
  set("");
  await wait(GAP_MS);
  return alive();
}

function Mark({
  item,
  delay,
  struck,
  tight,
}: {
  item: ZeroItem;
  delay: number;
  struck: boolean;
  tight: boolean;
}) {
  return (
    <span
      // The type size is for the fallback: with no artwork yet, the name has to
      // carry the same weight the logo will. An <img> ignores it.
      className={`relative inline-flex items-center rounded-full border border-black/[0.07] bg-white text-[38px] font-[650] leading-none tracking-tight text-brand-charcoal shadow-[0_2px_8px_rgba(40,30,15,0.09)] transition-opacity duration-300 ${
        tight ? "px-4 py-2.5" : "px-6 py-3"
      }`}
      // Dims only once the second pass has landed, so the logo reads clearly
      // right up to the moment it is crossed out.
      style={{
        opacity: struck ? 0.66 : 1,
        transitionDelay: struck ? `${delay + 460}ms` : "0ms",
      }}
    >
      <ReplacedLogo
        src={item.logo}
        name={item.name}
        className="w-auto"
        style={{ height: item.h ?? 64 }}
      />
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute left-[-4%] top-1/2 h-[17px] w-[108%] -translate-y-1/2 text-brand-orange"
        viewBox="0 0 100 12"
        preserveAspectRatio="none"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
      >
        <path
          className={`sop-strike ${struck ? "sop-strike-go" : ""}`}
          d={PASS_ONE}
          strokeWidth={2.8}
          style={{ animationDelay: `${delay}ms` }}
        />
        <path
          className={`sop-strike ${struck ? "sop-strike-go" : ""}`}
          d={PASS_TWO}
          strokeWidth={1.5}
          opacity={0.5}
          style={{ animationDelay: `${delay + 140}ms` }}
        />
      </svg>
    </span>
  );
}

export default function ActZero({
  state,
  items,
  label = "This replaces",
  bg = "#FAF9F7",
}: {
  state: Zero;
  items: ZeroItem[];
  label?: string;
  // matched to the host tour's own card, so the dissolve reveals the product
  // rather than swapping one panel for another
  bg?: string;
}) {
  const struck = state === "struck" || state === "out";
  const last = items.length - 1;

  return (
    <div
      className={`absolute inset-0 z-[58] grid place-items-center px-6 transition-[opacity,transform] duration-500 ${
        state === "out" ? "scale-[1.04] opacity-0" : "opacity-100"
      }`}
      style={{ background: bg, transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)" }}
    >
      <div className="text-center">
        <p className="mb-5 text-[12.5px] font-bold uppercase tracking-[0.18em] text-brand-gray">
          {label}
        </p>
        <span className="flex flex-wrap items-center justify-center gap-x-3 gap-y-3">
          {items.map((item, i) => (
            <span key={item.name} className="flex items-center gap-x-3">
              <Mark item={item} delay={i * STAGGER_MS} struck={struck} tight={items.length > 2} />
              {/* Two names take an ampersand. Three or more read as a list, so
                  everything but the last join is a comma. */}
              {i < last && (
                <span className="text-[17px] font-medium text-brand-gray">
                  {last > 1 && i < last - 1 ? "," : "&"}
                </span>
              )}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
