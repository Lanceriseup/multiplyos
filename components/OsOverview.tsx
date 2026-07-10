"use client";

// Product preview section (desktop only): a faithful, interactive mockup of the
// real Multiply OS app. On mobile this section is hidden — the mockup instead
// lives inside the Hero (between the tagline and the CTAs) so there's no large
// empty section on small screens. See components/Hero.tsx and AppMockup.tsx.
import AppMockup from "./AppMockup";

export default function OsOverview() {
  return (
    <section className="relative hidden overflow-hidden px-5 pb-24 pt-2 sm:px-8 md:block">
      {/* soft dotted backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage: "radial-gradient(#E2E0DC 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          WebkitMaskImage: "radial-gradient(70% 60% at 50% 38%, #000, transparent)",
          maskImage: "radial-gradient(70% 60% at 50% 38%, #000, transparent)",
        }}
      />

      <div className="relative mx-auto max-w-container">
        <AppMockup />
      </div>
    </section>
  );
}
