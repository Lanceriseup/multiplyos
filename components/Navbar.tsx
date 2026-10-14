"use client";

import { useEffect, useRef, useState } from "react";
import type { JSX, CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { useDemo } from "./DemoModal";

const APP_URL = "https://app.multiplyos.com";

const navItems: { label: string; href: string }[] = [
  { label: "Platform", href: "/" },
  { label: "AI", href: "#ai" },
  { label: "Implementation", href: "https://multiplyos.com/implementation" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
  { label: "Request a Demo", href: "#demo" },
];

// ---- Features submenu: twelve core features, then the HQ Modules band ----
// Omit `href` on anything without a page yet and it renders as a non-navigating
// tile (or card) until its page ships.
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
// Analytics Reports does not exist as a feature yet, so its slot went to
// Agreements. A page with a pen across it, matching the product's own glyph.
const AgreementIcon = ({ className }: { className?: string }) => (
  <svg className={className} {...svgProps}>
    <path d="M19.4 11.2V5.2a1.8 1.8 0 0 0-1.8-1.8H6.4a1.8 1.8 0 0 0-1.8 1.8v13.6a1.8 1.8 0 0 0 1.8 1.8h5" />
    <path d="M8.4 7.8h7.2M8.4 11.4h4.4" />
    <path d="M12.8 20.6l1-3.4 5.4-5.4a1.6 1.6 0 0 1 2.3 2.3l-5.4 5.4z" />
  </svg>
);

// Order matters: the menu flows top-to-bottom then across. It is grid-rows-4, so
// items 1-4 form the first column, 5-8 the second, and 9-12 the third.
//
// SOP HQ moved out of this list into the HQ Modules band, which brought it back to
// twelve and three even columns. A thirteenth core feature would spill into a
// fourth column holding a single item; switch to grid-rows-5 then.
const WhiteboardIcon = ({ className }: { className?: string }) => (
  <svg className={className} {...svgProps}>
    <rect x="3" y="4.4" width="18" height="12.6" rx="2" />
    <path d="M12 17v3.2M8.4 20.6h7.2" />
    <path d="M7.4 8.6h4.2M7.4 12.2h7.2" />
  </svg>
);

const features: Feature[] = [
  { label: "Metrics Scoreboard", desc: "Know if you won the week.", href: "/features/metrics-scoreboard", color: "#EA7B1B", icon: ScoreboardIcon },
  { label: "CFO Analytics", desc: "Cash, margin & runway.", href: "/features/cfo-analytics", color: "#A16207", icon: CoinsIcon },
  { label: "Projects & Tasks", desc: "See the whole board.", href: "/features/projects-tasks", color: "#5B47A8", icon: BoardIcon },
  { label: "Team Accountability", desc: "Own the week, every week.", href: "/features/team-accountability", color: "#B4532A", icon: TargetIcon },
  { label: "Team Meetings", desc: "Every meeting, on rhythm.", href: "/features/team-meetings", color: "#2C6BA6", icon: CalIcon },
  { label: "Org Chart", desc: "The whole org at a glance.", href: "/features/org-chart", color: "#3F7A6B", icon: OrgIcon },
  { label: "DISC Assessments", desc: "Know how your team works.", href: "/features/disc-assessments", color: "#8A3F6D", icon: DiscIcon },
  { label: "Forms", desc: "Capture what you need.", href: "/features/forms", color: "#2E7D5B", icon: FormIcon },
  { label: "Checklists", desc: "Automate the routine.", href: "/features/checklists", color: "#6B7A2E", icon: ChecklistIcon },
  { label: "Agreements", desc: "Signed, and on the record.", href: "/features/agreements", color: "#1F5F7A", icon: AgreementIcon },
  { label: "Whiteboards", desc: "Think it out together.", href: "/features/whiteboards", color: "#1592AE", icon: WhiteboardIcon },
  { label: "AI Coach & Agent", desc: "Your AI Chief of Staff.", href: "/features/ai-coach", color: "#4B3CC4", icon: SparkIcon },
];

// ---- HQ Modules: whole departments, shown as full-colour cards below the grid ----
const TicketIcon = ({ className }: { className?: string }) => (
  <svg className={className} {...svgProps}>
    <path d="M3.6 7.6A1.6 1.6 0 0 1 5.2 6h13.6a1.6 1.6 0 0 1 1.6 1.6v2.1a2.3 2.3 0 0 0 0 4.6v2.1a1.6 1.6 0 0 1-1.6 1.6H5.2a1.6 1.6 0 0 1-1.6-1.6v-2.1a2.3 2.3 0 0 0 0-4.6z" />
    <path d="M14.4 6.6v1.6M14.4 11.2v1.6M14.4 15.8v1.6" />
  </svg>
);
const BoxIcon = ({ className }: { className?: string }) => (
  <svg className={className} {...svgProps}>
    <path d="M12 3.2l7.8 4.3v9L12 20.8l-7.8-4.3v-9z" />
    <path d="M4.4 7.6L12 11.8l7.6-4.2" />
    <path d="M12 11.8v8.8" />
    <path d="M8.1 5.4l7.7 4.3" />
  </svg>
);
const PeopleIcon = ({ className }: { className?: string }) => (
  <svg className={className} {...svgProps}>
    <circle cx="9" cy="8.2" r="3.2" />
    <path d="M3.4 19.2c.6-3.2 2.9-5.1 5.6-5.1s5 1.9 5.6 5.1" />
    <path d="M15.4 5.3a3 3 0 0 1 0 5.7" />
    <path d="M17.3 14.4c1.8.6 3 2.2 3.3 4.8" />
  </svg>
);
const HardHatIcon = ({ className }: { className?: string }) => (
  <svg className={className} {...svgProps}>
    <path d="M5.2 16.4v-1.9a6.8 6.8 0 0 1 13.6 0v1.9" />
    <path d="M10.2 8.3V6.4a1.8 1.8 0 0 1 3.6 0v1.9" />
    <path d="M3.4 16.4h17.2v1.6a1.2 1.2 0 0 1-1.2 1.2H4.6a1.2 1.2 0 0 1-1.2-1.2z" />
  </svg>
);
const HqIcon = ({ className }: { className?: string }) => (
  <svg className={className} {...svgProps} strokeWidth={1.9}>
    <path d="M4 20V8.6L12 4l8 4.6V20" />
    <path d="M9.4 20v-5h5.2v5" />
    <path d="M2.8 20h18.4" />
  </svg>
);
const ArrowIcon = ({ className }: { className?: string }) => (
  <svg className={className} {...svgProps} strokeWidth={2.2}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

// Inventory and People HQ have no page yet, so they render as non-navigating
// cards; add `href` as each page ships. `soon` replaces the Explore link with a
// pulsing badge and keeps the card from navigating.
type HqModule = Feature & { soon?: string };

const hqModules: HqModule[] = [
  { label: "Events HQ", desc: "Plan, staff and run every event.", href: "/features/events-hq", color: "#C2412D", icon: TicketIcon },
  { label: "Inventory HQ", desc: "Stock, counts and reorders in one place.", color: "#2F6F8F", icon: BoxIcon },
  { label: "People HQ", desc: "Hire, onboard and grow your people.", color: "#B0466E", icon: PeopleIcon },
  { label: "SOP HQ", desc: "Every process, documented.", href: "/features/sop-hq", color: "#7A4E28", icon: BookIcon },
  { label: "Contractor HQ", desc: "Your contractors, organized.", color: "#9A7414", icon: HardHatIcon, soon: "Coming Nov" },
];

const liveCount = [...features, ...hqModules].filter((f) => f.href).length;

// Gradient "app tile" for each feature icon — white glyph, soft colored shadow.
function tileStyle(c: string): CSSProperties {
  return {
    background: `linear-gradient(145deg, color-mix(in srgb, ${c} 84%, #fff), color-mix(in srgb, ${c} 82%, #000))`,
    boxShadow: `0 3px 8px color-mix(in srgb, ${c} 38%, transparent), inset 0 1px 0 rgba(255,255,255,0.34)`,
    color: "#fff",
  };
}

// Full-colour HQ card. Live cards tilt toward the cursor and catch a shine on
// hover (styles in globals.css under "Features menu: HQ Module cards").
function HqCard({ m, onNavigate, className = "" }: { m: HqModule; onNavigate: () => void; className?: string }) {
  const Icon = m.icon;
  const live = Boolean(m.href) && !m.soon;
  const body = (
    <>
      <span className="hq-shine" aria-hidden="true" />
      <span className="hq-glass">
        <Icon className="h-[21px] w-[21px]" />
      </span>
      <span className="relative z-[1] mt-auto text-base font-bold leading-tight tracking-[-0.015em]">{m.label}</span>
      <span className="relative z-[1] mt-0.5 text-[12.25px] leading-snug text-white/[0.82]">{m.desc}</span>
      {m.soon ? (
        <span className="hq-soon">
          <i aria-hidden="true" />
          {m.soon}
        </span>
      ) : live ? (
        <span className="hq-go">
          Explore <ArrowIcon className="h-[13px] w-[13px]" />
        </span>
      ) : null}
    </>
  );
  const cls = `hq-card ${m.soon ? "hq-card-soon" : ""} ${className}`;
  const style = { "--c": m.color } as CSSProperties;

  if (!live) {
    return (
      <div role="menuitem" aria-disabled="true" className={cls} style={style}>
        {body}
      </div>
    );
  }
  return (
    <Link
      href={m.href!}
      role="menuitem"
      onClick={onNavigate}
      className={`${cls} hq-card-live`}
      style={style}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const el = e.currentTarget;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(700px) rotateX(${(-y * 10).toFixed(2)}deg) rotateY(${(x * 12).toFixed(2)}deg) translateY(-4px)`;
      }}
      onPointerLeave={(e) => {
        e.currentTarget.style.transform = "";
      }}
    >
      {body}
    </Link>
  );
}

function SectionLabel({ children, count, accent }: { children: ReactNode; count?: number; accent?: boolean }) {
  return (
    <span
      className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] ${
        accent ? "text-brand-orange-dark" : "text-[#9A9894]"
      }`}
    >
      {children}
      {count !== undefined && (
        <span className="rounded-full bg-black/5 px-[7px] py-px text-[11px] font-semibold tracking-normal text-[#6E6D6A]">
          {count}
        </span>
      )}
    </span>
  );
}

function FeaturesMenu({ onNavigate }: { onNavigate: () => void }) {
  return (
    // Centred under the whole nav (which is `relative`), not under the Features
    // button: the menu is wider than the space to the button's right. The inner
    // div carries the entrance animation so it doesn't fight the centring transform.
    <div className="absolute left-1/2 top-[calc(100%-6px)] z-40 w-[960px] max-w-[calc(100vw-2.5rem)] -translate-x-1/2">
      {/* invisible bridge so the gap below the button doesn't drop the hover */}
      <span className="absolute -top-4 left-0 right-0 h-4" aria-hidden="true" />
      <div
        role="menu"
        aria-label="Features"
        className="hq-menu-in rounded-[22px] border border-black/[0.09] bg-white p-2.5 shadow-[0_4px_12px_rgba(10,10,10,0.06),0_30px_70px_rgba(10,10,10,0.2)]"
      >
        <div className="px-2.5 py-2">
          <SectionLabel count={features.length}>Core features</SectionLabel>
        </div>
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
  
        {/* HQ Modules band */}
        <div className="mt-2.5 rounded-2xl border border-black/[0.05] bg-gradient-to-b from-[#FBF8F3] to-[#F4EEE5] p-4">
          <div className="mb-3.5 px-0.5">
            <SectionLabel accent>
              <HqIcon className="h-3.5 w-3.5" />
              HQ Modules
            </SectionLabel>
            <p className="mt-1 text-lg font-bold tracking-[-0.015em] text-brand-ink">
              Run whole departments inside Multiply OS
            </p>
          </div>
          <div className="grid grid-cols-5 gap-2.5">
            {hqModules.map((m) => (
              <HqCard key={m.label} m={m} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [mobileFeaturesOpen, setMobileFeaturesOpen] = useState(false);
  const [activeHq, setActiveHq] = useState(0);
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

  const renderMobileItem = (item: { label: string; href: string }) =>
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
    );

  const renderSimpleItem = (item: { label: string; href: string }) =>
    item.href === "#demo" ? (
      <button
        key={item.label}
        type="button"
        onClick={openDemo}
        className="whitespace-nowrap rounded-md px-3 py-2 text-[15px] font-medium text-brand-charcoal xl:px-4 transition-colors hover:bg-black/5 hover:text-brand-ink"
      >
        {item.label}
      </button>
    ) : (
      <Link
        key={item.label}
        href={item.href}
        className="whitespace-nowrap rounded-md px-3 py-2 text-[15px] font-medium text-brand-charcoal xl:px-4 transition-colors hover:bg-black/5 hover:text-brand-ink"
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
      <nav className="relative mx-auto flex h-[72px] max-w-container items-center justify-between px-5 sm:px-8">
        {/* Logo */}
        <Link href="/" className="flex flex-none items-center" aria-label="Multiply OS home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/MultiplyOS_logoBlack.png" alt="Multiply OS" className="h-12 w-auto" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 lg:flex">
          {/* Platform */}
          {renderSimpleItem(navItems[0])}

          {/* Features dropdown. Deliberately not `relative`: the menu positions
              against the nav so it can centre under the whole bar. */}
          <div
            ref={featuresRef}
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
              className="flex items-center gap-1 whitespace-nowrap rounded-md px-3 py-2 text-[15px] font-medium text-brand-charcoal xl:px-4 transition-colors hover:bg-black/5 hover:text-brand-ink"
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
        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href={APP_URL}
            className="whitespace-nowrap rounded-lg bg-brand-ink px-5 py-2.5 text-[15px] font-semibold text-white transition-colors hover:bg-black"
          >
            Log in
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="inline-flex items-center justify-center rounded-md p-2 text-brand-ink lg:hidden"
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
        <div className="max-h-[calc(100vh-72px)] overflow-y-auto border-t border-black/5 bg-white px-5 pb-6 pt-2 lg:hidden">
          <div className="flex flex-col">
            {/* Platform first, then Features, then the rest, so the order
                matches the desktop bar */}
            {renderMobileItem(navItems[0])}

            {/* Features, collapsed by default: twelve rows open by default
                would bury Pricing and Contact below the fold */}
            <button
              type="button"
              aria-expanded={mobileFeaturesOpen}
              onClick={() => setMobileFeaturesOpen((v) => !v)}
              className="flex items-center gap-2 rounded-md px-2 py-3 text-left text-base font-medium text-brand-charcoal hover:bg-black/5"
            >
              Features
              <svg
                className={`transition-transform duration-200 ${mobileFeaturesOpen ? "rotate-180" : ""}`}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
              >
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="ml-auto text-[12px] font-normal text-brand-gray">{liveCount} live</span>
            </button>

            {mobileFeaturesOpen && (
              <div className="mb-1 flex flex-col gap-0.5 pb-1">
                {/* HQ Modules: a swipeable row of the same full-colour cards */}
                <div className="flex items-center justify-between px-1 pb-2.5 pt-0.5">
                  <SectionLabel accent>
                    <HqIcon className="h-3.5 w-3.5" />
                    HQ Modules
                  </SectionLabel>
                  <span className="flex items-center gap-1 text-[12px] text-[#9A9894]">
                    Swipe <ArrowIcon className="h-3 w-3" />
                  </span>
                </div>
                {/* bottom padding leaves room for the cards' shadows, which the
                    scroll container would otherwise clip; the dots pull up into it */}
                <div
                  className="scrollbar-none -mx-5 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-5 pb-9 pt-0.5"
                  onScroll={(e) => {
                    const track = e.currentTarget;
                    const step = (track.firstElementChild as HTMLElement).offsetWidth + 10;
                    setActiveHq(Math.min(hqModules.length - 1, Math.round(track.scrollLeft / step)));
                  }}
                >
                  {hqModules.map((m) => (
                    <HqCard
                      key={m.label}
                      m={m}
                      onNavigate={() => {
                        setMobileFeaturesOpen(false);
                        setMobileOpen(false);
                      }}
                      className="!h-[168px] w-[214px] flex-none snap-start scroll-ml-5"
                    />
                  ))}
                </div>
                <div className="-mt-6 flex justify-center gap-1.5" aria-hidden="true">
                  {hqModules.map((m, i) => (
                    <span
                      key={m.label}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === activeHq ? "w-[18px] bg-brand-orange" : "w-1.5 bg-[#E2DED6]"
                      }`}
                    />
                  ))}
                </div>

                <div className="px-1 pb-1 pt-4">
                  <SectionLabel count={features.length}>Core features</SectionLabel>
                </div>
                {features.map((f) => {
                  const Icon = f.icon;
                  const tile = (
                    <>
                      <span
                        className="grid h-9 w-9 flex-none place-items-center rounded-[10px]"
                        style={tileStyle(f.color)}
                      >
                        <Icon className="h-[19px] w-[19px] [filter:drop-shadow(0_1px_1px_rgba(0,0,0,0.18))]" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[14px] font-semibold leading-tight text-brand-ink">{f.label}</span>
                        <span className="mt-px block text-[12px] leading-snug text-brand-charcoal">{f.desc}</span>
                      </span>
                    </>
                  );
                  const rowClass = "flex items-center gap-3 rounded-xl p-2";

                  // Same rule as the desktop menu: no destination yet, so the
                  // row renders flat and dimmed rather than pretending to link.
                  return f.href ? (
                    <Link
                      key={f.label}
                      href={f.href}
                      onClick={() => {
                        setMobileFeaturesOpen(false);
                        setMobileOpen(false);
                      }}
                      className={`${rowClass} hover:bg-[#F6F3EE]`}
                    >
                      {tile}
                    </Link>
                  ) : (
                    <div key={f.label} className={`${rowClass} opacity-45`} aria-disabled="true">
                      {tile}
                    </div>
                  );
                })}
              </div>
            )}

            {navItems.slice(1).map((item) =>
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
