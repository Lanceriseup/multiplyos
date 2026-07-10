"use client";

import { useEffect, useState } from "react";
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

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { openDemo } = useDemo();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
          {navItems.map((item) =>
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
            )
          )}
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
