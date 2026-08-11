"use client";

import { useEffect, useRef, useState } from "react";
import type { JSX, CSSProperties } from "react";
import Link from "next/link";
import { useDemo } from "./DemoModal";

const APP_URL = "https://app.multiplyos.com";

const navItems: { label: string; href: string }[] = [
  { label: "Platform", href: "/" },
  { label: "AI", href: "#ai" },
  { label: "Pricing", href: `${APP_URL}/pricing` },
  { label: "Contact", href: "/contact" },
  { label: "Request a Demo", href: "#demo" },
];

// ---- Features submenu (the twelve product features) ----
// `href` is intentionally omitted for now — feature destinations aren't built yet,
// so items render as non-navigating tiles. Add `href` per feature to wire them up.
type Feature = {
  label: string;
  desc: string;
  href?: string;
  color: string;
  icon: (props: { className?: string }) => JSX.Element;
};

// Refined, distinctive glyphs — rendered white on a gradient tile (Style 1).
const svgProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

// Clipboard-list, matching the Scoreboards icon in the live app.
const ScoreboardIcon = ({ className }: { className?: string }) => (
  <svg className={className} {...svgProps}>
    <rect x="8" y="2.4" width="8" height="4" rx="1.2" />
    <path d="M16 4.4h2a2 2 0 0 1 2 2v13.2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6.4a2 2 0 0 1 2-2h2" />
    <path d="M8.2 11.4h7.6" />
    <path d="M8.2 15.4h4.8" />
  </svg>
);
const SparkIcon = ({ className }: { className?: string }) => (
  <svg className={className} {...svgProps}>
    <path d="M12 3.7c.36 3.7 1.9 5.24 5.4 5.4-3.5.16-5.04 1.7-5.4 5.4-.36-3.7-1.9-5.24-5.4-5.4 3.5-.16 5.04-1.7 5.4-5.4z" />
    <path d="M18 14.4c.13 1.34.72 1.93 2.1 2.06-1.38.13-1.97.72-2.1 2.06-.13-1.34-.72-1.93-2.1-2.06 1.38-.13 1.97-.72 2.1-2.06z" />
  </svg>
);
const CoinsIcon = ({ className }: { className?: string }) => (
  <svg className={className} {...svgProps}>
    <ellipse cx="12" cy="7" rx="6" ry="2.7" />
    <path d="M6 7v4.3c0 1.5 2.7 2.7 6 2.7s6-1.2 6-2.7V7" />
    <path d="M6 11.3v4.3c0 1.5 2.7 2.7 6 2.7s6-1.2 6-2.7v-4.3" />
  </svg>
);
const CalIcon = ({ className }: { className?: string }) => (
  <svg className={className} {...svgProps}>
    <rect x="4" y="5.2" width="16" height="14.6" rx="2.4" />
    <path d="M4 9.6h16" />
    <path d="M8.3 3.4v3.4M15.7 3.4v3.4" />
    <path d="M7.6 13.2h4.2M7.6 16.2h6.6" />
  </svg>
);
const BookIcon = ({ className }: { className?: string }) => (
  <svg className={className} {...svgProps}>
    <path d="M12 6.6C10.5 5.5 8.4 4.9 6 4.9c-1 0-1.9.1-2.7.3v11.6c.8-.2 1.7-.3 2.7-.3 2.4 0 4.5.6 6 1.7z" />
    <path d="M12 6.6C13.5 5.5 15.6 4.9 18 4.9c1 0 1.9.1 2.7.3v11.6c-.8-.2-1.7-.3-2.7-.3-2.4 0-4.5.6-6 1.7z" />
    <path d="M12 6.6v11" />
  </svg>
);
const BoardIcon = ({ className }: { className?: string }) => (
  <svg className={className} {...svgProps}>
    <rect x="3.6" y="5" width="4.7" height="14" rx="1.5" />
    <rect x="9.65" y="5" width="4.7" height="9.3" rx="1.5" />
    <rect x="15.7" y="5" width="4.7" height="11" rx="1.5" />
  </svg>
);
const TargetIcon = ({ className }: { className?: string }) => (
  <svg className={className} {...svgProps}>
    <circle cx="12" cy="12" r="7.7" />
    <circle cx="12" cy="12" r="3.9" />
    <circle cx="12" cy="12" r="1.05" />
  </svg>
);
const OrgIcon = ({ className }: { className?: string }) => (
  <svg className={className} {...svgProps}>
    <rect x="9.4" y="3.5" width="5.2" height="4.1" rx="1.2" />
    <rect x="3.3" y="16.4" width="5.2" height="4.1" rx="1.2" />
    <rect x="15.5" y="16.4" width="5.2" height="4.1" rx="1.2" />
    <path d="M12 7.6v3.5" />
    <path d="M5.9 16.4v-2.6h12.2v2.6" />
  </svg>
);
const DiscIcon = ({ className }: { className?: string }) => (
  <svg className={className} {...svgProps}>
    <rect x="3.7" y="3.7" width="7" height="7" rx="1.7" />
    <rect x="13.3" y="3.7" width="7" height="7" rx="1.7" />
    <rect x="3.7" y="13.3" width="7" height="7" rx="1.7" />
    <rect x="13.3" y="13.3" width="7" height="7" rx="1.7" />
  </svg>
);
const FormIcon = ({ className }: { className?: string }) => (
  <svg className={className} {...svgProps}>
    <rect x="4.6" y="3.3" width="14.8" height="17.4" rx="2.3" />
    <rect x="7.9" y="7.2" width="8.2" height="3.2" rx="1.1" />
    <path d="M7.9 14.2h8.2M7.9 17.2h5" />
  </svg>
);
const ChecklistIcon = ({ className }: { className?: string }) => (
  <svg className={className} {...svgProps}>
    <path d="M4 7.3l1.9 1.9 3.1-3.5" />
    <path d="M4 14.8l1.9 1.9 3.1-3.5" />
    <path d="M11.8 7.5h8.2" />
    <path d="M11.8 15h8.2" />
  </svg>
);
const ReportIcon = ({ className }: { className?: string }) => (
  <svg className={className} {...svgProps}>
    <rect x="4.4" y="3.3" width="15.2" height="17.4" rx="2.3" />
    <path d="M8 8.2h5.2" />
    <path d="M8 16.1l2.9-3.3 2.3 2 3-3.7" />
  </svg>
);

// Order matters: the menu flows top-to-bottom then across, so items 1–4 form the
// first column, 5–8 the second, 9–12 the third.
const features: Feature[] = [
  { label: "Metrics Scoreboard", desc: "Know if you won the week.", href: "/features/metrics-scoreboard", color: "#EA7B1B", icon: ScoreboardIcon },
  { label: "CFO Analytics", desc: "Cash, margin & runway.", color: "#A16207", icon: CoinsIcon },
  { label: "SOP HQ", desc: "Every process, documented.", color: "#7A4E28", icon: BookIcon },
  { label: "Projects & Tasks", desc: "See the whole board.", color: "#5B47A8", icon: BoardIcon },
  { label: "Team Accountability", desc: "Own the week, every week.", color: "#B4532A", icon: TargetIcon },
  { label: "Team Meetings", desc: "Every meeting, on rhythm.", color: "#2C6BA6", icon: CalIcon },
  { label: "Org Chart", desc: "The whole org at a glance.", color: "#3F7A6B", icon: OrgIcon },
  { label: "DISC Assessments", desc: "Know how your team works.", color: "#8A3F6D", icon: DiscIcon },
  { label: "Forms", desc: "Capture what you need.", color: "#2E7D5B", icon: FormIcon },
  { label: "Checklists", desc: "Automate the routine.", color: "#6B7A2E", icon: ChecklistIcon },
  { label: "AI Coach & Agent", desc: "Your AI Chief of Staff.", color: "#4B3CC4", icon: SparkIcon },
  { label: "Analytics Reports", desc: "The data behind decisions.", color: "#1F5F7A", icon: ReportIcon },
];

// Gradient "app tile" for each feature icon — white glyph, soft colored shadow.
function tileStyle(c: string): CSSProperties {
  return {
    background: `linear-gradient(145deg, color-mix(in srgb, ${c} 84%, #fff), color-mix(in srgb, ${c} 82%, #000))`,
    boxShadow: `0 3px 8px color-mix(in srgb, ${c} 38%, transparent), inset 0 1px 0 rgba(255,255,255,0.34)`,
    color: "#fff",
  };
}

function FeaturesMenu({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div
      role="menu"
      aria-label="Features"
      className="absolute left-0 top-[calc(100%+10px)] z-40 w-[860px] max-w-[calc(100vw-2.5rem)] rounded-2xl border border-black/[0.09] bg-white p-3 shadow-[0_4px_12px_rgba(10,10,10,0.06),0_18px_44px_rgba(10,10,10,0.14)]"
    >
      {/* invisible bridge so the 10px gap doesn't drop the hover */}
      <span className="absolute -top-3 left-0 right-0 h-3" aria-hidden="true" />
      {/* 3 columns x 4 rows, filled column-first to keep related features grouped */}
      <div className="grid grid-flow-col grid-rows-4 gap-0.5">
        {features.map((f) => {
          const Icon = f.icon;
          const tile = (
            <>
              <span
                className="grid h-10 w-10 flex-none place-items-center rounded-[11px]"
                style={tileStyle(f.color)}
              >
                <Icon className="h-[21px] w-[21px] [filter:drop-shadow(0_1px_1px_rgba(0,0,0,0.18))]" />
              </span>
              <span className="min-w-0">
                <span className="block text-[14.5px] font-semibold leading-tight text-brand-ink">{f.label}</span>
                <span className="mt-px block text-[12.5px] leading-snug text-brand-charcoal">{f.desc}</span>
              </span>
            </>
          );
          const rowClass = "flex items-center gap-3 rounded-xl p-[9px] transition-colors hover:bg-[#F6F3EE]";

          // No destination yet — render a plain tile so nothing navigates.
          return f.href ? (
            <Link key={f.label} href={f.href} role="menuitem" onClick={onNavigate} className={rowClass}>
              {tile}
            </Link>
          ) : (
            <div key={f.label} role="menuitem" onClick={onNavigate} className={rowClass}>
              {tile}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const featuresRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { openDemo } = useDemo();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const openFeatures = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setFeaturesOpen(true);
  };
  // small delay so moving the cursor across the gap doesn't flicker the menu shut
  const closeFeatures = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setFeaturesOpen(false), 120);
  };

  const renderSimpleItem = (item: { label: string; href: string }) =>
    item.href === "#demo" ? (
      <button
        key={item.label}
        type="button"
        onClick={openDemo}
        className="rounded-md px-4 py-2 text-[15px] font-medium text-brand-charcoal transition-colors hover:bg-black/5 hover:text-brand-ink"
      >
        {item.label}
      </button>
    ) : (
      <Link
        key={item.label}
        href={item.href}
        className="rounded-md px-4 py-2 text-[15px] font-medium text-brand-charcoal transition-colors hover:bg-black/5 hover:text-brand-ink"
      >
        {item.label}
      </Link>
    );

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md transition-shadow ${
        scrolled ? "shadow-[0_1px_0_0_rgba(0,0,0,0.08)]" : ""
      }`}
    >
      <nav className="mx-auto flex h-[72px] max-w-container items-center justify-between px-5 sm:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center" aria-label="Multiply OS home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/MultiplyOS_logoBlack.png" alt="Multiply OS" className="h-12 w-auto" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {/* Platform */}
          {renderSimpleItem(navItems[0])}

          {/* Features dropdown */}
          <div
            ref={featuresRef}
            className="relative"
            onMouseEnter={openFeatures}
            onMouseLeave={closeFeatures}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setFeaturesOpen(false);
            }}
          >
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={featuresOpen}
              onClick={() => setFeaturesOpen((v) => !v)}
              className="flex items-center gap-1 rounded-md px-4 py-2 text-[15px] font-medium text-brand-charcoal transition-colors hover:bg-black/5 hover:text-brand-ink"
            >
              Features
              <svg
                className={`transition-transform duration-200 ${featuresOpen ? "rotate-180" : ""}`}
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
              >
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {featuresOpen && <FeaturesMenu onNavigate={() => setFeaturesOpen(false)} />}
          </div>

          {/* Remaining items */}
          {navItems.slice(1).map(renderSimpleItem)}
        </div>

        {/* Right side CTA */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href={APP_URL}
            className="rounded-lg bg-brand-ink px-5 py-2.5 text-[15px] font-semibold text-white transition-colors hover:bg-black"
          >
            Log in
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="inline-flex items-center justify-center rounded-md p-2 text-brand-ink md:hidden"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileOpen ? (
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-black/5 bg-white px-5 pb-6 pt-2 md:hidden">
          <div className="flex flex-col">
            {navItems.map((item) =>
              item.href === "#demo" ? (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    openDemo();
                  }}
                  className="rounded-md px-2 py-3 text-left text-base font-medium text-brand-charcoal hover:bg-black/5"
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-2 py-3 text-base font-medium text-brand-charcoal hover:bg-black/5"
                >
                  {item.label}
                </Link>
              )
            )}
            <Link
              href={APP_URL}
              className="mt-3 rounded-lg bg-brand-ink px-4 py-3 text-center text-base font-semibold text-white"
            >
              Log in
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
