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

// still renders the mark already drawn, with nothing to animate. Two callers
// want that: anything under prefers-reduced-motion, and ReplacesChip, which is
// a static element by design.
function Strike({ delay, still }: { delay: number; still: boolean }) {
  const draw = (d: string, at: number, width: number, opacity: number) => (
    <motion.path
      d={d}
      strokeWidth={width}
      strokeLinecap="round"
      initial={still ? undefined : { pathLength: 0 }}
      whileInView={still ? undefined : { pathLength: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.42, delay: at, ease: EASE }}
      style={{ opacity, pathLength: still ? 1 : undefined }}
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
      <Strike delay={delay} still={reduce} />
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

// The same claim as a single pill that straddles the top edge of a hero tour's
// gradient panel. Direction 2 in design/replaces-above-tour-options.html.
//
// This is where the cross-out went when it came out of the tour animation. It
// used to run as ActZero, an overlay held across the tour card for ZERO_MS
// before dissolving into the product. The client wanted it stated above the
// container instead, so it is now stated once, it does not move, and every tour
// opens on the app rather than on a competitor.
//
// The difference from ReplacesStrip above: there, each name carries its own
// pill. Here the pill IS the container, so the wordmarks sit bare inside it.
// One pill, one claim.
//
// It does not animate. Nothing draws on, nothing fades: it renders struck and
// stays struck, which is why there is no useReducedMotion here and no motion
// component below. It is an element, not a beat.
//
// Two sizing rules are load-bearing, and both were learned the hard way:
//
//   1. The wordmark renders at 26px, not 18px. Every file in public/ is a
//      320x80 canvas, so 18px is a 4.4x downscale, and several of these marks
//      carry a tagline under the logotype that lands about 3px tall at that
//      size. Three pixels is not small text, it is noise. 26px is the floor
//      where they resolve. See design/replaces-chip-and-mark-options.html.
//   2. The wrapper around each mark is inline-FLEX, not inline. The strike is
//      absolutely positioned at w-[110%], and an absolutely positioned child of
//      an inline box measures that box's line fragments rather than the image
//      inside it, so as a plain span the stroke ran far past the letters.
//
// Logos share one height rather than carrying the per-item trim ActZero needed.
// The trims genuinely differ, but at 26px the difference is a fraction of a
// pixel. Add a per-item height to REPLACES if a wordmark ever looks wrong
// beside its neighbours.
//
// Positioned, so its parent has to be relative AND must not clip: the hero
// panels all carry overflow-hidden for their rounded corners, so the chip goes
// in a wrapper alongside the panel, never inside it.
export function ReplacesChip({
  names,
  label = "This replaces",
}: {
  names: Replaced[];
  label?: string;
}) {
  const items = names.map(asItem);
  const last = items.length - 1;

  return (
    // Two placements, because one does not work at both widths.
    //
    // From sm up the chip straddles the panel's top edge, half on the page and
    // half on the panel, which is the look the pages were designed around.
    //
    // On a phone that fails: the panel carries 8px of padding there rather than
    // 32px, so the chip's lower half lands on the app card's own header instead
    // of on tinted background, covering the title and the button beside it. So
    // below sm it drops out of the overlay and sits in normal flow above the
    // panel. That also costs nothing when the chip wraps to two lines, which
    // Agreements does: it names three tools, and a straddling two-line chip
    // would need clearance that changes per page.
    <div className="pointer-events-none mb-3 w-full px-4 sm:absolute sm:left-1/2 sm:top-0 sm:z-10 sm:mb-0 sm:-translate-x-1/2 sm:-translate-y-1/2">
      {/* Two lines on a phone, one line from sm up.

          Agreements and Forms each name three tools, which is wider than a
          phone. Letting the pill wrap put the break in whatever arbitrary place
          the widths landed on, so the second line read as the pill running out
          of room. Stacking it puts the break where it means something: the
          label takes the top line, and the marks sit in a row underneath it.

          The marks live in their own row for that reason, and that row goes
          `display: contents` at sm so they become direct children of the pill
          again and the desktop layout is exactly what it always was. */}
      <p className="mx-auto flex w-fit max-w-full flex-col items-center justify-center gap-y-[5px] rounded-[20px] border border-[#F0E4D3] bg-white px-4 py-[7px] shadow-[0_8px_20px_-12px_rgba(40,30,15,0.5)] sm:flex-row sm:flex-wrap sm:gap-x-3.5 sm:gap-y-1.5 sm:rounded-full sm:px-5 sm:py-2.5">
        {/* ink rather than grey: at this size, in caps, on white, brand-gray
            read as a watermark next to the wordmark it introduces */}
        <span className="text-[9.5px] font-bold uppercase tracking-[0.15em] text-brand-ink sm:text-[11px]">
          {label}
        </span>

        <span className="flex max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-1.5 sm:contents">
          {items.map((item, i) => (
            <span key={item.name} className="flex items-center gap-x-3 sm:gap-x-3.5">
              <span
                // inline-flex, not inline: see note 2 above.
                //
                // The type size is for the fallback: with no artwork, the name
                // has to carry the weight the logo will. An <img> ignores it.
                className="relative inline-flex items-center whitespace-nowrap text-[15px] font-[650] tracking-[-0.01em] text-brand-charcoal sm:text-[19px]"
              >
                <ReplacedLogo
                  src={item.logo}
                  name={item.name}
                  className="h-[18px] w-auto sm:h-[26px]"
                />
                <Strike delay={0} still />
              </span>

              {/* Two names take an ampersand. Three or more read as a list, so
                  everything but the last join is a comma. */}
              {i < last && (
                <span className="text-[12px] font-medium text-brand-gray sm:text-[14px]">
                  {last > 1 && i < last - 1 ? "," : "&"}
                </span>
              )}
            </span>
          ))}
        </span>
      </p>
    </div>
  );
}

// The client's mapping of feature to the tools it replaces.
//
// One place, because it is a business fact rather than a per-page styling
// choice. It used to live as a ZERO_ITEMS const inside each of the ten hero
// tours, which meant the answer to "what does this replace" was copied ten
// times and could drift ten ways.
//
// The per-item render heights those copies carried are gone: they existed to
// even out the artwork trims at ActZero's 64px, and ReplacesChip sets one
// height for everything. Add them back here if a wordmark ever looks wrong
// beside its neighbours.
//
// CFO Analytics and DISC are deliberately absent. Per the client, neither
// replaces anything, so neither page carries the claim.
export const REPLACES = {
  agreements: [
    { name: "DocuSign", logo: "/replaces-docusign.png" },
    { name: "PandaDoc", logo: "/replaces-pandadoc.png" },
    { name: "Adobe Sign", logo: "/replaces-adobe-sign.png" },
  ],
  aiCoach: [
    { name: "Claude", logo: "/replaces-claude.png" },
    { name: "ChatGPT", logo: "/replaces-chatgpt.png" },
  ],
  checklists: [
    { name: "Jotform", logo: "/replaces-jotform.png" },
    { name: "Google Forms", logo: "/replaces-google-forms.png" },
  ],
  forms: [
    { name: "Jotform", logo: "/replaces-jotform.png" },
    { name: "Google Forms", logo: "/replaces-google-forms.png" },
    { name: "Typeform", logo: "/replaces-typeform.png" },
  ],
  // Pingboard, not ninety.io. ninety.io is the scoreboard and meetings tool;
  // the org chart competitor is Pingboard, which is what the pricing table has
  // had on its Org chart row all along. Corrected September 2026.
  orgChart: [{ name: "Pingboard", logo: "/replaces-pingboard.png" }],
  projectsTasks: [
    { name: "Asana", logo: "/replaces-asana.png" },
    { name: "Monday.com", logo: "/replaces-monday.png" },
  ],
  scoreboard: [{ name: "ninety.io", logo: "/replaces-ninety.png" }],
  sopHq: [{ name: "Trainual", logo: "/replaces-trainual.png" }],
  teamAccountability: [
    { name: "ninety.io", logo: "/replaces-ninety.png" },
    { name: "EOS One", logo: "/replaces-eosone.png" },
  ],
  teamMeetings: [{ name: "ninety.io", logo: "/replaces-ninety.png" }],
} satisfies Record<string, Replaced[]>;
