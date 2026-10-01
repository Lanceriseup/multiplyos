"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import Reveal from "./Reveal";

/**
 * "Meet Our Multiply OS Coaches" — sits directly under the Book a Call box on
 * the Implementation page. The dotted backdrop from CoachingPackages carries
 * on into this section and fades out as a warm tint and a faint orange grid
 * fade in, so there's no visible seam between the two sections.
 */

const TITLE = "Multiply OS Coach";

type Coach = {
  name: string;
  photo: string;
  bio: string;
  /** object-position for the portrait crop; defaults to the top of the photo */
  position?: string;
  /**
   * For photos pre-cropped to a circle (transparent corners): the circle is
   * sized as a % of card width and offset from the top as a % of card height,
   * with its edge feathered into a backdrop matched to the photo.
   */
  circle?: { width: number; top: number };
};

const COACHES: Coach[] = [
  {
    name: "Mark Simpson",
    photo: "/coaches/mark-simpson.jpg",
    bio: "Mark is a seasoned business and technology leader and Fractional Integrator with 15+ years of experience turning vision into execution. Mark helps entrepreneurs build stronger teams, scalable businesses, and lasting impact.",
  },
  {
    name: "Mondoe Davis",
    photo: "/coaches/mondoe-davis.png",
    bio: "Mondoe Davis, former NFL player with the N.Y. Jets turned successful Life Transformation Strategist, brings over 20 years of experience as a Pastor, Speaker, Entrepreneur, and Author. Specializing in vision clarification, strategic planning, and leadership development. He and his college sweetheart Leelee have been happily married for nearly 20 years, raising 11 children together.",
  },
  {
    name: "David Bonnet",
    photo: "/coaches/david-bonnet.png",
    bio: "David began in military logistics and finance before transitioning to energy conservation. As a Multiply OS coach, he coaches sales, finance, and operations leaders.",
  },
  {
    name: "Jeremy McWilliams",
    photo: "/coaches/jeremy-mcwilliams.png",
    bio: "Jeremy McWilliams is a Green Beret and studied theology at Oral Roberts University. After the events of 9/11, he enlisted in the US Army and eventually became a Green Beret. In 2010, he was injured in combat in Afghanistan and transitioned into a teaching role. He and his wife started buying and flipping businesses before transitioning into brokering business sales. Jeremy now uses his military and business experiences to help Christian businessmen reach their potential through Rise Up Kings.",
  },
  {
    // Sized so his head matches the other coaches' framing.
    name: "Joe Power",
    photo: "/coaches/joe-power.png",
    circle: { width: 124, top: 4.4 },
    bio: "Joe is a 3 time INC 500 listed entrepreneur. Growing and scaling multiple businesses, and maximizing remote productivity with KPIs and Culture.",
  },
  {
    name: "Mason Brandenberger",
    photo: "/coaches/mason-brandenberger.jpg",
    bio: "Founder and CEO of Brandenberger Tree Care Professionals. He brings nearly two decades of business leadership experience and grit to everything he does. Mason is also an Ironman finisher and Jiu-Jitsu blue belt.",
  },
];

/* ---- Icons -------------------------------------------------------------- */

function InfoIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="M10 9v6.5" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
      <circle cx="10" cy="5.6" r="1.4" fill="currentColor" />
    </svg>
  );
}

/* ---- Photos ------------------------------------------------------------- */

// Portrait filling its (relatively positioned) parent. Circle-cropped photos
// are sized and feathered instead; the parent supplies .coach-circle-bg.
function CoachPhoto({ coach, sizes }: { coach: Coach; sizes: string }) {
  if (coach.circle) {
    return (
      <Image
        src={coach.photo}
        alt={coach.name}
        width={600}
        height={600}
        sizes={sizes}
        className="coach-feather absolute h-auto max-w-none"
        style={{
          width: `${coach.circle.width}%`,
          left: `${(100 - coach.circle.width) / 2}%`,
          top: `${coach.circle.top}%`,
        }}
      />
    );
  }
  return (
    <Image
      src={coach.photo}
      alt={coach.name}
      fill
      sizes={sizes}
      className="object-cover"
      style={{ objectPosition: coach.position ?? "50% 15%" }}
    />
  );
}

function CoachAvatar({ coach, className = "" }: { coach: Coach; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-full bg-[#1c1511] ${className}`}>
      <Image
        src={coach.photo}
        alt=""
        fill
        sizes="64px"
        className="object-cover"
        style={{ objectPosition: coach.position ?? "50% 12%" }}
      />
    </div>
  );
}

const faceBg = (coach: Coach) => (coach.circle ? "coach-circle-bg" : "bg-[#111]");

/* ---- Card (tablet and up) ----------------------------------------------- */

// Flips on hover where the device has one (pure CSS); on touch screens a tap
// toggles it, and on a keyboard Enter/Space does.
function CoachCard({ coach, index }: { coach: Coach; index: number }) {
  const [flipped, setFlipped] = useState(false);

  function onClick() {
    if (window.matchMedia("(hover: none)").matches) setFlipped((f) => !f);
  }

  function onKeyDown(e: KeyboardEvent<HTMLElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setFlipped((f) => !f);
    }
  }

  return (
    <article
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      aria-label={`${coach.name}, ${TITLE}. Show bio`}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={`coach-flip h-[500px] rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-4 ${flipped ? "is-flipped" : ""}`}
    >
      <div className="coach-flip-inner">
        {/* Front: full-bleed portrait */}
        <div
          className={`coach-flip-face coach-flip-front shadow-[0_30px_60px_-35px_rgba(0,0,0,0.6)] ${faceBg(coach)}`}
        >
          <CoachPhoto coach={coach} sizes="(min-width: 1024px) 370px, 45vw" />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(10,10,10,0.95)_0%,rgba(10,10,10,0.4)_30%,transparent_55%)]" />
          <span className="absolute left-0 top-7 h-10 w-1.5 rounded-r bg-brand-orange" />
          <div className="absolute inset-x-7 bottom-7 flex items-end justify-between gap-3">
            <div>
              <h3 className="text-2xl font-extrabold uppercase leading-tight tracking-wide text-white">
                {coach.name}
              </h3>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-orange">
                {TITLE}
              </p>
            </div>
            {/* Info button; a "Read bio" tag pops up above it on a loop,
                staggered per card so they don't all fire at once */}
            <span
              className="coach-cta relative flex h-10 w-10 flex-none items-center justify-center rounded-full bg-brand-orange text-white shadow-[0_10px_24px_-6px_rgba(234,123,27,0.9)]"
              style={{ animationDelay: `${index * 0.45}s` }}
            >
              <InfoIcon className="h-[18px] w-[18px]" />
              <span
                aria-hidden="true"
                className="coach-cta-tag"
                style={{ animationDelay: `${index * 0.45}s` }}
              >
                Read bio
              </span>
            </span>
          </div>
        </div>

        {/* Back: bio on orange */}
        <div className="coach-flip-face coach-flip-back flex flex-col bg-[linear-gradient(150deg,#F08A2E_0%,#EA7B1B_45%,#C9650F_100%)] p-7 text-white shadow-[0_40px_80px_-35px_rgba(234,123,27,0.8)]">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
          <div className="relative flex items-center gap-4">
            <CoachAvatar coach={coach} className="h-16 w-16 flex-none border-[3px] border-white/80" />
            <div>
              <p className="text-lg font-extrabold uppercase leading-tight tracking-wide">
                {coach.name}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/75">
                {TITLE}
              </p>
            </div>
          </div>
          <p className="relative mt-5 text-[14px] leading-relaxed text-white/95">{coach.bio}</p>
        </div>
      </div>
    </article>
  );
}

/* ---- Phones: compact tile + bio sheet ----------------------------------- */

function CoachTile({ coach, index, onOpen }: { coach: Coach; index: number; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      aria-label={`${coach.name}, ${TITLE}. Read bio`}
      className={`relative block aspect-[3/4] w-full overflow-hidden rounded-2xl text-left shadow-[0_20px_40px_-28px_rgba(0,0,0,0.7)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 ${faceBg(coach)}`}
    >
      <CoachPhoto coach={coach} sizes="46vw" />
      <span className="absolute inset-0 bg-[linear-gradient(to_top,rgba(10,10,10,0.95)_0%,rgba(10,10,10,0.4)_32%,transparent_58%)]" />
      <span className="absolute left-0 top-4 h-7 w-1 rounded-r bg-brand-orange" />
      {/* Info button sits top-right so long names get the tile's full width */}
      <span
        className="coach-cta absolute right-2.5 top-2.5 flex h-[30px] w-[30px] items-center justify-center rounded-full bg-brand-orange text-white shadow-[0_10px_24px_-6px_rgba(234,123,27,0.9)]"
        style={{ animationDelay: `${index * 0.45}s` }}
      >
        <InfoIcon className="h-3.5 w-3.5" />
      </span>
      <span className="absolute inset-x-3 bottom-3">
        <span className="block text-[14px] font-extrabold uppercase leading-tight tracking-wide text-white">
          {coach.name}
        </span>
        <span className="mt-1 block whitespace-nowrap text-[8.5px] font-bold uppercase tracking-[0.08em] text-brand-orange">
          {TITLE}
        </span>
      </span>
    </button>
  );
}

// Slides up from the bottom with the coach's bio. Closes on the × button,
// a tap on the backdrop, Escape, or dragging the top of the sheet down.
function BioSheet({ coach, open, onClose }: { coach: Coach; open: boolean; onClose: () => void }) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const drag = useRef<{ y: number; dy: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    const returnFocus = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });

    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      // The close button is the only control in the sheet: keep focus on it
      if (e.key === "Tab") {
        e.preventDefault();
        closeRef.current?.focus();
      }
    };
    // The sheet only exists on phones; close it if the viewport grows past that
    const wide = window.matchMedia("(min-width: 640px)");
    const onWide = () => wide.matches && onClose();
    window.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
      returnFocus?.focus({ preventScroll: true });
    };
  }, [open, onClose]);

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    drag.current = { y: e.clientY, dy: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
    if (sheetRef.current) sheetRef.current.style.transition = "none";
  }
  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!drag.current || !sheetRef.current) return;
    drag.current.dy = Math.max(0, e.clientY - drag.current.y);
    sheetRef.current.style.transform = `translateY(${drag.current.dy}px)`;
  }
  function onPointerUp() {
    if (!drag.current || !sheetRef.current) return;
    const { dy } = drag.current;
    drag.current = null;
    sheetRef.current.style.transition = "";
    sheetRef.current.style.transform = "";
    if (dy > 90) onClose();
  }

  return (
    <div
      aria-hidden={!open}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className={`fixed inset-0 z-[80] flex flex-col justify-end bg-black/50 transition-[opacity,visibility] duration-300 sm:hidden ${open ? "visible opacity-100" : "invisible opacity-0"}`}
    >
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="coach-sheet-name"
        className={`coach-sheet relative max-h-[85vh] overflow-y-auto rounded-t-[28px] bg-white px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-3 text-brand-ink ${open ? "translate-y-0" : "translate-y-full"}`}
      >
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="touch-none pb-1"
        >
          <span className="mx-auto block h-1 w-10 rounded-full bg-black/15" />
          <div className="mt-4 flex items-center gap-3.5 pr-10">
            <CoachAvatar
              coach={coach}
              className="h-16 w-16 flex-none ring-[3px] ring-brand-orange ring-offset-2"
            />
            <div>
              <p
                id="coach-sheet-name"
                className="text-[18px] font-extrabold uppercase leading-tight tracking-wide"
              >
                {coach.name}
              </p>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-orange">
                {TITLE}
              </p>
            </div>
          </div>
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close bio"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-brand-charcoal focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
        >
          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
            <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <p className="mt-4 text-[14px] leading-relaxed text-brand-charcoal">{coach.bio}</p>
      </div>
    </div>
  );
}

/* ---- Section ------------------------------------------------------------ */

const FILL = "#F6F3EF";
const DOT = 22; // .bg-dotted tile size

export default function CoachBios() {
  const ref = useRef<HTMLElement>(null);
  const [dotY, setDotY] = useState(0);
  // index stays put while closing so the sheet keeps its content as it slides away
  const [sheet, setSheet] = useState({ index: 0, open: false });
  const openSheet = useCallback((index: number) => setSheet({ index, open: true }), []);
  const closeSheet = useCallback(() => setSheet((s) => ({ ...s, open: false })), []);

  // Keep this section's dots on the same 22px grid as the section above, so
  // the dotted backdrop reads as one continuous surface across the seam.
  useEffect(() => {
    const prev = ref.current?.previousElementSibling;
    if (!prev) return;
    const sync = () => setDotY(-(prev.getBoundingClientRect().height % DOT));
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(prev);
    return () => ro.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative px-5 pb-20 pt-8 sm:px-8 sm:pb-28 sm:pt-12">
      {/* Backdrop: dots carry on from above and fade out while the warm tint
          and the orange grid fade in */}
      <div
        className="coach-dots-fade pointer-events-none absolute inset-x-0 top-0 h-[340px] bg-dotted opacity-60"
        style={{ backgroundPosition: `0 ${dotY}px` }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `linear-gradient(to bottom, rgba(246,243,239,0) 0, ${FILL} 320px)` }}
      />
      <div className="coach-grid-fade pointer-events-none absolute inset-0">
        <div className="coach-grid absolute inset-0" />
      </div>

      <div className="relative mx-auto max-w-container">
        <Reveal>
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-brand-ink sm:text-5xl">
            Meet Our <span className="text-brand-orange">Multiply OS</span> Coaches
          </h2>
        </Reveal>

        {/* Phones: compact 2-up tiles; tapping one opens the bio sheet */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:hidden">
          {COACHES.map((coach, i) => (
            <Reveal key={coach.name} delay={(i % 2) * 0.08}>
              <CoachTile coach={coach} index={i} onOpen={() => openSheet(i)} />
            </Reveal>
          ))}
        </div>

        {/* Tablet and up: flip cards */}
        <div className="mx-auto mt-14 hidden max-w-6xl gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-3">
          {COACHES.map((coach, i) => (
            <Reveal key={coach.name} delay={(i % 3) * 0.1}>
              <CoachCard coach={coach} index={i} />
            </Reveal>
          ))}
        </div>
      </div>

      <BioSheet coach={COACHES[sheet.index]} open={sheet.open} onClose={closeSheet} />
    </section>
  );
}
