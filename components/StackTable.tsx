"use client";

// The stack comparison table, and the competitor pricing behind it.
//
// This lives on its own because two pages render it: the pricing page, where it
// opens the page under "Everything Multiply OS replaces", and the platform page,
// where it sits under the hero. It used to be inside PricingPage.tsx, which meant
// the second copy would have been a fork of a table whose every figure is a
// competitor list price that needs re-checking. One table, one set of numbers.
//
// >>> BEFORE THIS SHIPS: every figure in STACK is a competitor's list price and
// >>> needs verifying. They are gathered here for exactly that reason.
import { ReplacedLogo } from "./ReplacesStrip";

// Same literals the pricing page uses. Repeated rather than imported, which is
// how every other component on this site carries its palette.
const ORANGE_DARK = "#C9650F";
const ORANGE_GRAD = "linear-gradient(135deg, #F49230, #DE6F14)";
const GREEN = "#1F7F4C";
const RED = "#C0402B";

type IconProps = { className?: string; style?: React.CSSProperties };

const Tick = ({ className, style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6.5L9.2 17.3 4 12.1" />
  </svg>
);

const Info = ({ className, style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5.5M12 7.6h.01" />
  </svg>
);

// Said in two places, so it lives in one: the desktop tooltip on "Usage based",
// and the phone's footnote under the last row.
const USAGE_NOTE = "You only pay for monthly AI usage per user. There is no set fee per user.";

export const PRICE = 299;
export const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

// The CRM row came out in September 2026 on the client's instruction. It was
// GoHighLevel Starter at $97 flat, and it was the one figure here that needed
// no arithmetic to arrive at. Its removal is why the total is $1,664 rather
// than $1,761 and why the page says eleven tools rather than twelve, and it
// means the page no longer claims to replace a CRM at all. If it goes back,
// the word "eleven" has to move with it in three places.
export const AS_OF = "August 2026";

type StackRow = {
  what: string;
  note: string;
  was: number;
  logos: { name: string; logo?: string }[];
  // Set on the one row that is not flatly included. Ten rows are covered by the
  // subscription outright; AI is metered, so its cell says so and carries the
  // explanation rather than a tick it has not quite earned.
  usage?: boolean;
};

const STACK: StackRow[] = [
  {
    what: "Weekly scoreboards and metrics",
    note: "Thirteen weeks of history, an owner on every number",
    // ninety.io Essentials, $12/user/mo list, x10. Their site was showing a
    // 30% promotion ($8.40) when this was checked; promotional pricing is not
    // list pricing, so the full figure is used.
    was: 120,
    logos: [{ name: "ninety.io", logo: "/replaces-ninety.png" }],
  },
  {
    what: "Quarterly planning and accountability",
    note: "One page plan, goals that cascade, weekly priorities",
    // EOS One, one flat tier at $10/user/mo with the first user free, so ten
    // people is nine paid seats. The old $149 here appears to have been Reach
    // Reporting's number copied up a row.
    was: 90,
    logos: [{ name: "EOS One", logo: "/replaces-eosone.png" }],
  },
  {
    what: "SOPs, training, and documentation",
    // "Screen recordings" came out of this note when the Loom row was added
    // below. Both claims were true, but a table whose whole job is to be
    // audited cannot bill the same capability on two lines. Recording is the
    // Loom row's argument now; this row keeps the writing and the storage.
    note: "AI drafting, assignments, and 15 GB of storage",
    // UNVERIFIED. Trainual pulled public pricing: their page now lists Core,
    // Pro, Premium and Enterprise with no figures and a "book a demo" button.
    // $249 for the Core tier including ten seats comes from third-party
    // aggregators, not from Trainual, and it is the one number on this table
    // that cannot be checked at source. It is also the largest single line, so
    // it is the first one to get a real quote for.
    was: 249,
    logos: [{ name: "Trainual", logo: "/replaces-trainual.png" }],
  },
  {
    what: "Screen recording and video messaging",
    note: "Record your screen, drop it into any step or message",
    // Loom Business, $18/user/mo monthly, x10. Their annual rate is about
    // $15/user, which is where the previous $150 came from; monthly is the
    // like-for-like number against our monthly price.
    was: 180,
    logos: [{ name: "Loom", logo: "/replaces-loom.png" }],
  },
  {
    what: "Projects and tasks",
    note: "Boards, timelines, dependencies, and subtasks",
    // Asana Starter, $13.49/user/mo monthly, x10, rounded from $134.90. Their
    // annual rate is $10.99. Monday.com Basic is cheaper at $9/seat, so Asana
    // is the conservative pick of the two named here.
    was: 135,
    logos: [
      { name: "Asana", logo: "/replaces-asana.png" },
      { name: "Monday.com", logo: "/replaces-monday.png" },
    ],
  },
  {
    what: "Forms and surveys",
    note: "Twenty eight field types, conditional logic, integrations",
    // The awkward row. NEITHER named vendor publishes a ten-user plan:
    // Typeform runs 1 user (Basic $28), 3 (Plus $56), 5 (Business $91), then
    // Enterprise; every paid Jotform tier is single user. So the rule cannot
    // apply cleanly. $91 is Typeform Business, the cheapest tier a team can
    // share, and it covers five people rather than ten. This line UNDERSTATES
    // what ten people actually costs, which is the safe direction to be wrong.
    was: 91,
    logos: [
      { name: "Typeform", logo: "/replaces-typeform.png" },
      { name: "Jotform", logo: "/replaces-jotform.png" },
      { name: "Google Forms", logo: "/replaces-google-forms.png" },
    ],
  },
  {
    what: "E-signatures and agreements",
    note: "Draw or type, separate consent, executed copies tracked",
    // DocuSign Standard, $25/user/mo, x10. Their Personal tier is $10 but it
    // is one user with five envelopes a month, so Standard is the cheapest
    // plan a team of ten can actually be on. This is the biggest correction on
    // the table: the old $65 was priced as though a company signs contracts
    // with two or three people.
    was: 250,
    logos: [
      { name: "DocuSign", logo: "/replaces-docusign.png" },
      { name: "PandaDoc", logo: "/replaces-pandadoc.png" },
      { name: "Adobe Sign", logo: "/replaces-adobe-sign.png" },
    ],
  },
  {
    what: "An AI assistant for the whole team",
    // This note held the billing sentence for a while, which made the AI row
    // the only one whose note did not say what you get. The billing moved to
    // the Multiply OS cell in September 2026, where it sits in the tooltip on
    // "Usage based", beside the arrangement it describes rather than under the
    // capability. So the note is a capability again, like the other ten.
    //
    // Losing the always-visible copy is a real trade and it is covered: the
    // pricing page's FAQ answers "How does AI usage billing work?" in full, so
    // the detail does not depend on somebody hovering an icon.
    note: "Two coaches, answers from your live data, charts on request",
    usage: true,
    // Claude Team standard seat, $25/seat/mo monthly, x10. Annual is $20.
    // OpenAI's pricing page refused automated fetching, so ChatGPT is not the
    // basis for this figure; Claude alone carries it, which is fine since
    // ChatGPT Business sits at a similar per-seat rate.
    was: 250,
    logos: [
      { name: "Claude", logo: "/replaces-claude.png" },
      { name: "ChatGPT", logo: "/replaces-chatgpt.png" },
    ],
  },
  {
    what: "CFO dashboard and bank analytics",
    note: "Live P&L, balance sheet, cash flow, monthly AI briefing",
    // Reach Reporting, $149/mo for one data connection, unlimited users, so
    // there is nothing to multiply. This is their entry price and there is no
    // cheaper paid tier.
    was: 149,
    logos: [{ name: "Reach Reporting", logo: "/replaces-reachreporting.png" }],
  },
  {
    what: "Org chart",
    note: "Every seat, who is in it, and who they report to",
    // UNVERIFIED. Pingboard was bought by Workleap and pingboard.com/pricing
    // now redirects to workleap.com, which publishes only bundle pricing from
    // $4,999 a year. Third-party trackers still list Pingboard standalone at
    // $5/user/mo monthly ($4 annual), which is what x10 gives here. Worth
    // deciding whether a product you can no longer buy on its own belongs in
    // this table at all.
    was: 50,
    logos: [{ name: "Pingboard", logo: "/replaces-pingboard.png" }],
  },
  {
    what: "Calendar and booking",
    note: "Share your availability and let people book a time",
    // Calendly Standard, $10/seat/mo, x10. Their Teams tier is $16; Standard
    // is the cheapest paid tier and the one the rule calls for.
    was: 100,
    logos: [{ name: "Calendly", logo: "/replaces-calendly.png" }],
  },
];

export const STACK_TOTAL = STACK.reduce((s, r) => s + r.was, 0);

// ---------------------------------------------------------------- stack table
// Below sm each row becomes a small card: a four-column table at 360px is
// unreadable, and the price is the one thing that must not end up in a corner.
// ---------------------------------------------------------------- stack table
// The "sharper" treatment: same four columns, same rows, tightened.
//
// The change that matters is the price. It was 13.5px, which made the whole
// argument of the section read as a footnote, and it is now 17px. Rows also
// pick up an orange rail and a warm tint on hover, and the total bar carries
// the $299 on its own raised chip.
//
// The capability column leads, on the client's instruction (September 2026),
// which reverses an earlier instruction that put the logos first. So the row
// states what you get and names what it replaces second. Two things follow
// from that and both are load-bearing:
//
// The headings swapped with the cells, so `What you get` is column one and
// `Replaces` is column two. Swapping one without the other silently mislabels
// every row on the table.
//
// The fr weights swapped with them, so the marks still sit in the 1.25fr
// track, just in the second position now. That track is sized off a
// measurement rather than a guess: at 21px the widest set on the table,
// Typeform + Jotform + Google Forms, runs 332px, and at the 1200px container
// the 1.25fr track comes out at about 355px. That is one line with 23px to
// spare, and no fixed width to go stale if a row gains a mark. Leaving the
// weights alone would have handed the marks the 1.75fr track and stacked them
// again at every width.
//
// That 355px is down from 362px because the last column went from 116px to
// 132px, which took 16px out of the pool the two fr tracks share. The last
// column had to grow: it used to hold nothing longer than the word "Included",
// and the AI row's "Usage based" plus its info icon needs about 118px, so at
// 116px the pill wrapped onto two lines and stretched the row. Both pills also
// carry whitespace-nowrap now, so a future label cannot reintroduce the wrap
// quietly. If the last column ever grows again, re-check the 332px figure
// above: the logo track is what pays for it.
//
// Below roughly a 1226px viewport the track drops under 332px and the three
// mark rows wrap again. That is deliberate. The alternative is either marks too
// small to read or logos overflowing into the description, and a laptop at
// 1280px, which is where this gets looked at, is comfortably above the line.
//
// The marks themselves went up half again on the client's instruction and then
// back down a fifth, landing at 21px, which is why the pill lost a little
// vertical padding on the way through.
//
// Both left hand columns centre from sm up, on the client's instruction. Left
// aligned in a track sized for the three-mark rows, a single logo sat hard
// against the table edge and the description read as though it had drifted away
// from its own column. Centred, every column on the table is centred, and the
// rows with one mark line up with the rows that have three.
export function StackTable() {
  return (
    <div className="overflow-hidden rounded-[20px] border border-black/[0.07] bg-white shadow-[0_24px_54px_-30px_rgba(40,30,15,0.45)]">
      <div className="hidden grid-cols-[minmax(0,1.75fr)_minmax(0,1.25fr)_120px_132px] items-center gap-4 border-b border-[#EBE7E0] bg-[#F6F3EE] px-6 py-3.5 sm:grid">
        {["What you get", "Replaces", "Their price", "Multiply OS"].map((h) => (
          <span
            key={h}
            className="text-center text-[10.5px] font-extrabold uppercase tracking-[0.11em] text-[#8A857D]"
          >
            {h}
          </span>
        ))}
      </div>

      {/* Phone header. The desktop header above is a four column rule; this is
          the two column version of it, and it carries the Included claim for
          the whole table.

          That claim used to be a chip on every row. An identical chip on every
          row reads as a column on a desktop and as the same three words over
          and over on a phone, which is padding rather than information. Stated
          once here, the rows get a whole block back each. */}
      <div className="grid grid-cols-[1fr_84px] items-center gap-x-2.5 border-b border-[#EBE7E0] bg-[#F6F3EE] px-4 py-2.5 sm:hidden">
        <span
          className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold"
          style={{ background: "#EAF7F0", color: GREEN }}
        >
          <Tick className="h-2.5 w-2.5" />
          All in one subscription
        </span>
        <span className="text-right text-[9.5px] font-extrabold uppercase tracking-[0.11em] text-[#8A857D]">
          Their price
        </span>
      </div>

      {/* Below sm this stays a table rather than unfolding into a card per row.
          See design/stack-table-mobile-options.html, direction 4. A reader on a
          price comparison runs their eye down a column of numbers, and a card
          breaks that column on every row. So: the name over the logos on the
          left, price pinned right across both lines, note hidden, chip gone.

          The bottom hairline comes off the LAST ROW from the map index, not
          from a positional selector. It used to be nth-last-child(2), because
          the total bar is the table's last child so the last row is never
          :last-child and last:border-b-0 silently did nothing. That worked
          until the mobile footnote went in below the rows: it made the
          footnote nth-last-child(2), so no row matched, every row kept its
          rule, and the last one stacked a grey hairline onto the total bar's
          2px orange one. And because nth-last-child counts hidden elements,
          the footnote being sm:hidden did not save the desktop from it.

          Counting in JS instead means the rule follows the data rather than
          the DOM order, so anything else added below the rows cannot move it.

          The two left cells sit in explicit grid slots rather than in flow, so
          the phone stacks them in the same order the desktop reads them in.
          Capability first on both, which is why the row-start values swapped
          along with the columns. */}
      {STACK.map((r, i) => (
        <div
          key={r.what}
          className={`grid grid-cols-[1fr_84px] gap-x-2.5 gap-y-1.5 border-l-[3px] border-[#F3F0EB] border-l-transparent px-4 py-3 transition-colors duration-150 hover:border-l-brand-orange hover:bg-[#FFFCF7] sm:grid-cols-[minmax(0,1.75fr)_minmax(0,1.25fr)_120px_132px] sm:items-center sm:gap-4 sm:px-6 sm:py-[15px] ${
            i === STACK.length - 1 ? "" : "border-b"
          }`}
        >
          <span className="col-start-1 row-start-1 min-w-0 sm:col-auto sm:row-auto sm:text-center">
            <span className="block text-[13px] font-bold leading-tight sm:text-[14px]">
              {r.what}
              {/* Phone only. On a desktop this row already carries "Usage based"
                  and its tooltip in the last column, and that column does not
                  exist below sm. The marker ties to the footnote under the last
                  row rather than trying to fit the sentence in the row. */}
              {r.usage && (
                <span className="font-extrabold sm:hidden" style={{ color: ORANGE_DARK }}>
                  {" *"}
                </span>
              )}
            </span>
            {/* Kept in the DOM, hidden on a phone: it is the longest text in
                the row, and the phone already has the name and the price, which
                is what this table is for. */}
            <span className="hidden text-[11.5px] leading-snug text-brand-gray sm:block">
              {r.note}
            </span>
          </span>

          {/* bare marks on a phone, pills from sm up: at 21px a pill around a
              wordmark is mostly border */}
          <span className="col-start-1 row-start-2 flex min-w-0 flex-wrap items-center gap-[7px] sm:col-auto sm:row-auto sm:justify-center">
            {r.logos.map((l) => (
              <span
                key={l.name}
                className="inline-flex items-center rounded-full border-black/[0.08] text-[12.5px] font-[650] text-brand-charcoal sm:border sm:bg-white sm:px-2.5 sm:py-1 sm:shadow-[0_1px_2px_rgba(40,30,15,0.05)]"
              >
                <ReplacedLogo
                  src={l.logo ?? ""}
                  name={l.name}
                  className="h-[17px] w-auto opacity-80 sm:h-[21px] sm:opacity-100"
                />
              </span>
            ))}
          </span>

          <span className="col-start-2 row-start-1 row-span-2 flex items-center justify-end gap-1.5 sm:col-auto sm:row-auto sm:row-span-1 sm:items-baseline sm:justify-center sm:gap-2">
            {/* Not struck. A row price is a real number the buyer is really
                paying today, and crossing it out says it has been cancelled,
                which is only true of the total at the foot of the table. The
                rows state the cost; the total is what gets struck. */}
            <span className="text-[16px] font-extrabold tabular-nums sm:text-[17px]" style={{ color: RED }}>
              {money(r.was)}
            </span>
            <span className="text-[11.5px] text-brand-gray">/mo</span>
          </span>

          {/* The last column. Ten rows are a tick and the word Included; the AI
              row says what it actually is and explains itself on hover.

              THE TOOLTIP OPENS LEFT, AND HAS TO. The table wrapper is
              overflow-hidden for its rounded corners, which clips anything
              positioned outside it, and this is the last column, so up and down
              are only safe while this row has rows above and below it. Left is
              safe on every row and stays safe if the rows are ever reordered.

              The pill stays green. The nuance is real but it is not a caveat,
              and a single amber cell in a column of greens reads as one. The
              icon carries the "there is more here" job instead, in the site's
              orange so it is visibly not part of the green it sits on.

              This tooltip is now the only place on the table that states how AI
              is billed. It used to be here and in the row's note as well, and
              the note went back to describing the capability so the AI row
              reads like the other ten. The FAQ further down the pricing page
              carries the full answer, which is what stops this being the one
              copy of a pricing detail that needs a hover to find.

              THE TOOLTIP NEEDS whitespace-normal AND IT IS NOT REDUNDANT. The
              pill carries whitespace-nowrap so "Usage based" cannot break onto
              two lines, white-space inherits, and the tooltip is a child of the
              pill. Without the override the tooltip text lays out as one long
              line, overflows its 218px box and spills across the row. */}
          <span className="hidden sm:flex sm:justify-center">
            {r.usage ? (
              <span
                className="group relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-[5px] text-[12px] font-extrabold"
                style={{ background: "#EAF7F0", color: GREEN }}
              >
                Usage based
                <button
                  type="button"
                  aria-label="How AI billing works"
                  className="inline-flex cursor-help rounded-full leading-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange"
                >
                  <Info className="h-[13px] w-[13px] opacity-80 transition-opacity group-hover:opacity-100" style={{ color: GREEN }} />
                </button>
                <span
                  role="tooltip"
                  className="pointer-events-none invisible absolute right-[calc(100%+10px)] top-1/2 z-30 w-[218px] -translate-y-1/2 whitespace-normal rounded-[10px] bg-[#16233D] px-3 py-2 text-left text-[11.5px] font-medium leading-relaxed text-white opacity-0 shadow-[0_14px_30px_-12px_rgba(20,14,6,0.7)] transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
                >
                  {USAGE_NOTE}
                  <span
                    aria-hidden="true"
                    className="absolute -right-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 bg-[#16233D]"
                  />
                </span>
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-[5px] text-[12px] font-extrabold"
                style={{ background: "#EAF7F0", color: GREEN }}
              >
                <Tick className="h-3 w-3" />
                Included
              </span>
            )}
          </span>
        </div>
      ))}

      {/* The phone's footnote, tied to the asterisk on the AI row.

          Phone only, because the desktop states this in the row itself. It sits
          between the last row and the total bar so it reads as part of the
          table rather than as a caption floating under it, and it carries its
          own top hairline because the last row no longer draws one.

          It is always visible. That was the point of choosing this over a
          tap-to-reveal: there is no hover on a phone, and a pricing detail that
          needs a tap to find is a pricing detail most people never read. */}
      <p className="border-t border-[#EBE7E0] bg-[#FBFAF8] px-4 py-2.5 text-[10px] leading-snug text-brand-gray sm:hidden">
        <span className="font-extrabold" style={{ color: ORANGE_DARK }}>
          *
        </span>{" "}
        {USAGE_NOTE}
      </p>

      {/* Wraps rather than stacking. As flex-col on a phone the three parts came
          out as three left-aligned lines down the bar, which is not what the
          mock showed: the label and the struck total belong on one line facing
          each other, and the chip takes the full width underneath. flex-wrap
          plus w-full on the chip does exactly that, and sm:flex-nowrap puts it
          back on one row from the small breakpoint up. */}
      <div
        className="flex flex-wrap items-center gap-x-3 gap-y-3.5 px-4 py-4 sm:flex-nowrap sm:gap-4 sm:px-6 sm:py-5"
        style={{
          background: "linear-gradient(90deg, #FFF6EC, #FFE9D4)",
          borderTop: "2px solid rgba(234,123,27,0.4)",
        }}
      >
        <span
          className="text-[10.5px] font-extrabold uppercase tracking-[0.11em] sm:text-[12.5px]"
          style={{ color: ORANGE_DARK }}
        >
          What that stack costs
        </span>
        <span className="ml-auto flex items-baseline gap-2">
          <span
            className="text-[22px] font-extrabold tabular-nums line-through sm:text-[27px]"
            style={{ color: RED }}
          >
            {money(STACK_TOTAL)}
          </span>
          <span className="text-[11.5px] text-brand-gray sm:text-[12.5px]">/mo</span>
        </span>
        {/* The brand name sits above the figure rather than trailing it. As
            "$299 /mo with Multiply OS" the chip ran wider than the struck total
            it exists to beat, so the eye landed on the loser first. Stacking it
            keeps the name for anyone who wants it there without letting it run
            along the line. See design/stack-total-bar-options.html, direction 3. */}
        <span
          className="flex w-full flex-col items-center gap-[2px] rounded-[13px] px-5 pb-2.5 pt-2 text-white shadow-[0_14px_28px_-12px_rgba(201,101,15,0.8)] sm:w-auto sm:items-start"
          style={{ background: ORANGE_GRAD }}
        >
          <span className="text-[9.5px] font-bold uppercase tracking-[0.13em] opacity-[0.82] sm:text-[10px]">
            With Multiply OS
          </span>
          <span className="text-[24px] font-black leading-none tracking-tight tabular-nums sm:text-[27px]">
            {money(PRICE)}
            <span className="ml-1 text-[11.5px] font-semibold sm:text-[12.5px]">/mo</span>
          </span>
        </span>
      </div>
    </div>
  );
}
