"use client";

// The stack comparison, on the platform page.
//
// Same table as the pricing page, from components/StackTable.tsx, so the eleven
// competitor list prices live in one place and cannot drift between the two
// pages that quote them.
//
// It sits under the hero rather than between the hero copy and the app mockup.
// OsOverview is the hero's visual on a desktop and is hidden on a phone, where
// the mockup is inside Hero itself, so anything dropped between them splits the
// hero on one breakpoint and not the other. Below both, it is directly under
// the hero at every width.
//
// The ground is the cream the pricing page uses for its price sheet. Hero and
// OsOverview above are both dotted-on-white and Framework below is near-white
// graph paper, so a fourth pale surface in a row would have read as one long
// undifferentiated stretch. Cream separates it from both without introducing a
// colour the site does not already use.
//
// THE WASH AND THE SECTION ABOVE ARE A PAIR. The cream used to start on a hard
// horizontal line, which read as two pages stapled together rather than one
// page changing subject. So the top of the section carries a gradient that
// fades from the colour above into the cream, and there is no edge to see.
//
// Its top stop is #FFFFFF because that is what Hero and OsOverview sit on. It
// is not a decorative white: if either of those sections ever takes a ground of
// its own, this stop has to move with it or the seam comes back as a visible
// step at the top of the wash.
//
// The height is set so the fade finishes before the table does. From the top of
// the section to the top of the table is about 203px on a phone and 274px on a
// desktop, so at 160px and 220px the cream is solid by the time the table
// lands on it, and the table never sits half on a gradient.
//
// The heading is an h2. Hero owns the h1 on this page, which is the difference
// between this and the pricing page, where the same block leads and carries the
// h1 itself.
//
// "use client" is required, not decorative: StackTable.tsx is a client module,
// so calling its money() helper from a server component throws at render. The
// table would have rendered either way, since a server component can render a
// client one, but the two figures in the footnote below it call money() directly.
import Link from "next/link";
import Reveal from "./Reveal";
import { StackTable, STACK_TOTAL, AS_OF, PRICE, money } from "./StackTable";

const ORANGE_DARK = "#C9650F";

export default function StackStrip() {
  return (
    <section
      id="replaces"
      className="relative scroll-mt-24 px-5 py-12 sm:px-8 sm:py-[76px]"
      style={{ backgroundColor: "#F6F3EE" }}
    >
      {/* A texture, not a layer with anything in it, so it is aria-hidden and
          the container below picks up relative to sit over it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[160px] sm:h-[220px]"
        style={{ background: "linear-gradient(#FFFFFF, #F6F3EE)" }}
      />

      <div className="relative mx-auto max-w-container">
        <Reveal className="mx-auto mb-8 max-w-2xl text-center sm:mb-11">
          <p
            className="mb-2.5 text-[10.5px] font-bold uppercase tracking-[0.19em] sm:mb-4"
            style={{ color: ORANGE_DARK }}
          >
            Eleven tools &middot; one subscription
          </p>
          <h2 className="text-[28px] font-extrabold leading-[1.1] tracking-tight text-brand-ink sm:text-[44px]">
            Everything Multiply OS{" "}
            <span className="relative whitespace-nowrap">
              replaces.
              <svg
                className="absolute -bottom-2 left-0 h-3 w-full text-brand-orange"
                viewBox="0 0 120 12"
                preserveAspectRatio="none"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M3 8c26-5 74-6 114-3" />
              </svg>
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-[48ch] text-[14.5px] leading-relaxed text-brand-charcoal sm:mt-7 sm:text-[15.5px]">
            The stack a team of ten is usually paying for, at list price, next to what the same
            work costs on one subscription.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <StackTable />
        </Reveal>

        <Reveal delay={0.16} className="mx-auto mt-5 max-w-2xl text-center">
          <p className="text-[11.5px] leading-relaxed text-brand-gray">
            Comparison uses each vendor&rsquo;s entry level paid plan at monthly list pricing for a
            team of ten, checked {AS_OF}. Vendors change their pricing, so treat these as
            indicative rather than quoted. All trademarks belong to their owners.
          </p>
          <Link
            href="/pricing"
            className="mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-brand-orange-dark underline decoration-brand-orange/40 underline-offset-[3px] transition-colors hover:text-brand-orange"
          >
            See what {money(PRICE)} a month includes
            <span aria-hidden="true">&rarr;</span>
          </Link>
          {/* The saving is stated here rather than left to the reader, because
              the table's own total bar shows the two figures but never the
              difference between them. Fed from STACK_TOTAL so it cannot drift
              from the rows above it. */}
          <p className="mt-2 text-[11.5px] text-brand-gray">
            That is {money(STACK_TOTAL - PRICE)} a month back, on the same work.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
