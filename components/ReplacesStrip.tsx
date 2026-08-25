"use client";

// "Replaces X" line for the feature-page heroes.
//
// The client's brief: every feature page opens by crossing out the tool it
// replaces. The mapping they gave:
//
//   Projects       Asana, Monday.com
//   SOP HQ         Trainual
//   Metrics        ninety.io
//   Team Meetings  ninety.io
//
// A name can be given as plain text, or as a logo file in public/. A logo that
// fails to load falls back to its text name, so the claim never renders as a
// broken image and the artwork can be dropped in later without a code change.
//
// Two marker passes draw across the name, the way somebody would strike it out
// by hand, then the chip dims so the eye moves on to the animation.
//
// Runs once when it scrolls into view, matching Reveal and the rest of the page.
// Under prefers-reduced-motion the names render already struck, so the claim
// still reads without anything moving.
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

// Either "Trainual", or { name: "Trainual", logo: "/replaces-trainual.png" }.
// name is required either way: it is the alt text, and the fallback.
export type Replaced = string | { name: string; logo: string };

const asItem = (r: Replaced) => (typeof r === "string" ? { name: r, logo: "" } : r);

// Two hand-drawn passes rather than one straight rule. The first carries the
// weight, the second is the overshoot you get from not lifting the pen cleanly.
// preserveAspectRatio="none" so one path stretches to any chip width.
//
// Exported because the hero tour's opening beat draws the same two strokes at a
// much larger size. One definition, so the mark is identical in both places.
export const PASS_ONE = "M1.5 7.4C17 4.6 33 5.8 50 6.3s33 2 48.5-1";
export const PASS_TWO = "M2.5 5.6C19 8.2 35 7 51 6.6s32-1.4 46.5 1.2";

// A competitor logo that degrades to its name if the file is missing.
//
// onError alone is not enough: a missing file 404s while the server HTML is
// still parsing, which is before React attaches the handler, so the event is
// never seen and the broken image sticks. Checking naturalWidth on mount catches
// that; onError covers anything that fails later. The text fallback inherits
// whatever type styles the parent sets.
export function ReplacedLogo({
  src,
  name,
  className,
  style,
}: {
  src: string;
  name: string;
  className: string;
  style?: React.CSSProperties;
}) {
  const [broken, setBroken] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0) setBroken(true);
  }, [src]);

  if (src === "" || broken) return <>{name}</>;
  return (
    // block, so the line box does not add descender space under the logo
    <img
      ref={ref}
      src={src}
      alt={name}
      onError={() => setBroken(true)}
      className={`block ${className}`}
      style={style}
    />
  );
}

const EASE = [0.22, 1, 0.36, 1] as const;

// Time between one name being struck and the next starting, so "Asana &
// Monday.com" reads as two deliberate strokes instead of one flicker.
const STAGGER = 0.42;

function Strike({ delay, reduce }: { delay: number; reduce: boolean }) {
  const draw = (d: string, at: number, width: number, opacity: number) => (
    <motion.path
      d={d}
      strokeWidth={width}
      strokeLinecap="round"
      initial={reduce ? undefined : { pathLength: 0 }}
      whileInView={reduce ? undefined : { pathLength: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.42, delay: at, ease: EASE }}
      style={{ opacity, pathLength: reduce ? 1 : undefined }}
    />
  );

  return (
    <svg
      aria-hidden="true"
      // Sits over the name, a touch wider than the text so the stroke runs past
      // the last letter the way a real one does.
      className="pointer-events-none absolute left-[-5%] top-1/2 h-[11px] w-[110%] -translate-y-1/2 text-brand-orange"
      viewBox="0 0 100 12"
      preserveAspectRatio="none"
      fill="none"
      stroke="currentColor"
    >
      {draw(PASS_ONE, delay, 2.7, 1)}
      {draw(PASS_TWO, delay + 0.14, 1.5, 0.5)}
    </svg>
  );
}

// One struck-out competitor. The logo renders at the same height the text
// occupied, so swapping artwork in does not change the chip's size.
function Mark({ item, delay, reduce }: { item: { name: string; logo: string }; delay: number; reduce: boolean }) {
  return (
    <motion.span
      className="relative whitespace-nowrap rounded-full border border-black/[0.07] bg-white px-2.5 py-[3px] text-[13px] font-[650] tracking-[-0.01em] text-brand-charcoal shadow-[0_1px_2px_rgba(40,30,15,0.06)] sm:px-3.5 sm:py-1 sm:text-[15.5px]"
      // The dim lands as the second pass finishes, so the name reads clearly
      // right up until it is crossed out.
      initial={reduce ? undefined : { opacity: 1 }}
      whileInView={reduce ? undefined : { opacity: 0.48 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.3, delay: delay + 0.46, ease: "easeOut" }}
      style={reduce ? { opacity: 0.48 } : undefined}
    >
      {/* 24px, not 20: it is a script face with tall flourishes, so at 20 the
          letters read smaller than the sans text beside them. */}
      <ReplacedLogo src={item.logo} name={item.name} className="h-[19px] w-auto sm:h-[24px]" />
      <Strike delay={delay} reduce={reduce} />
    </motion.span>
  );
}

export default function ReplacesStrip({
  names,
  className = "",
}: {
  names: Replaced[];
  className?: string;
}) {
  const reduce = useReducedMotion() ?? false;
  const items = names.map(asItem);
  const last = items.length - 1;

  return (
    <p
      className={`flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 sm:gap-x-2.5 ${className}`}
    >
      <span className="text-[10.5px] font-bold uppercase tracking-[0.15em] text-brand-gray sm:text-[12px]">
        Replaces
      </span>

      {items.map((item, i) => (
        <span key={item.name} className="flex items-center gap-x-2 sm:gap-x-2.5">
          <Mark item={item} delay={i * STAGGER} reduce={reduce} />
          {i < last && (
            <span className="text-[12px] font-medium text-brand-gray sm:text-[14px]">&amp;</span>
          )}
        </span>
      ))}
    </p>
  );
}
