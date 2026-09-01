"use client";

// The pricing page.
//
// Replaces the nav's old off-site link to app.multiplyos.com/pricing, so this is
// now the page that has to do the selling rather than hand the visitor to the
// app. Two sources fed it:
//
//   1. Screenshots of the live in-app pricing page: the Multiply Scale Bundle at
//      $299 with ten seats, the AI usage billing explainer, the savings
//      calculator, the six included modules, and the FAQ.
//   2. The client's reference, HighLevel's "what's included" table, which lists
//      each capability against the tools it replaces and totals the stack.
//
// The stack table is the addition. Everything else already existed in the app.
//
// September 2026, on the client's note. The stack table moved above the price
// and now opens the page; the price card follows it. The AI usage explainer and
// the savings calculator that used to sit between the price and the FAQ are
// gone entirely, along with the .price-range rules in globals.css that styled
// the calculator's sliders. What survives of that section is one line, the AI
// row's note in STACK, which says the usage is billed per user and there is no
// set fee per user. That started as an asterisk on the price with a footnote
// under the table and moved into the row, where it sits beside the number it
// qualifies. The FAQ still answers the billing question in full.
//
// The hero was rebuilt in August 2026 on the client's reference, Stripe's
// pricing page. Two decks fed it: design/pricing-hero-stripe-options.html for
// the layout (direction S5) and design/pricing-hero-s5-revised.html for the
// card (direction R4). The hero comment below has the detail.
//
// The flipping receipt that used to fill the right column is gone, and with it
// the .flip-*, .receipt-perf and .seat-dot rules in globals.css. Its back face
// was the only place the eleven inclusions appeared, so they now live inside
// the hero's own card, which is where the client wanted them.
//
// >>> BEFORE THIS SHIPS: every figure in STACK is a competitor's list price and
// >>> needs verifying. They are gathered in one constant for exactly that reason.
import { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Reveal from "./Reveal";
import { ReplacedLogo } from "./ReplacesStrip";
import { useDemo } from "./DemoModal";

// Orange carries every accent on this page. The navy this replaced came from the
// in-app pricing screen and was the only cool colour anywhere on the site.
const ORANGE = "#EA7B1B";
const ORANGE_DARK = "#C9650F";
const ORANGE_GRAD = "linear-gradient(135deg, #F49230, #DE6F14)";
const GREEN = "#1F7F4C";
const RED = "#C0402B";

const ico = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
type IconProps = { className?: string; style?: React.CSSProperties };

const Tick = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2.6}>
    <path d="M5 12l5 5L20 7" />
  </svg>
);
const Spark = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2}>
    <path d="M12 3l1.6 4L18 8.5 14 10l-2 4-2-4-4-1.5L10 7z" />
  </svg>
);
const Chevron = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2.2}>
    <path d="M6.4 9.6l5.6 5.2 5.6-5.2" />
  </svg>
);
// Points right, for the hero's pill button. Stripe's buttons all carry one.
const ChevronRight = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2.8}>
    <path d="M9.4 5.6L15.8 12l-6.4 6.4" />
  </svg>
);
const Arrow = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2.4}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

// ---------------------------------------------------------------- the plan
const PRICE = 299;
const SEATS = 10;
const EXTRA = 29;

const INCLUDED = [
  "10 users included, then $29 per extra user",
  "Unlimited scoreboards and metrics",
  "Meetings, agendas, and one page plans",
  "Org chart, issues tracker, and tasks",
  "AI Coach, AI insights, and a fractional CMO",
  "SOP platform included",
  "CFO dashboard and banking analytics included",
  "Projects, boards and timelines, included",
  "CRM, pipelines, and follow-up included",
  "Forms and e-signatures, 25 forms and 100 signatures a month",
  "AI usage billed every 2 weeks, capped at $200 a month by default",
];

// ---------------------------------------------------------------- the stack
// The client's HighLevel reference, done our way.
//
// Every figure was checked against the vendor's own pricing page in August
// 2026 and the source is noted on each row. Three rows could NOT be verified at
// source and are marked UNVERIFIED; they are the ones to re-check first.
//
// THE RULE, and it has to stay consistent or the total means nothing:
//
//   Each vendor's CHEAPEST PAID TIER, priced for ten people, at MONTHLY list.
//
//   - Per-seat vendors: that tier's seat price times ten.
//   - Vendors who bundle a seat allowance: the cheapest tier whose allowance
//     covers ten people, or, where no such tier is published, the cheapest tier
//     a team could share. Those are called out row by row.
//
// Monthly rather than annual, deliberately. The $299 above is a monthly price
// with no annual discount attached, so quoting competitors at their
// annual-prepay rate would flatter us with a comparison the buyer cannot
// actually make. Several vendors are 15 to 20 percent cheaper prepaid.
//
// A literal reading of "base price" was rejected: for six of these vendors the
// cheapest published plan is a ONE USER plan, and setting a one-seat price
// against a bundle that includes ten seats is not a comparison, it is an error
// in our favour.
//
// One vendor is never counted twice: each row is a distinct category with its
// own tool, so the total is a clean sum rather than HighLevel's approach of
// repeating the same vendor across several rows and adding it in each time.
//
// The CRM row came out in September 2026 on the client's instruction. It was
// GoHighLevel Starter at $97 flat, and it was the one figure here that needed
// no arithmetic to arrive at. Its removal is why the total is $1,664 rather
// than $1,761 and why the page says eleven tools rather than twelve, and it
// means the page no longer claims to replace a CRM at all. If it goes back,
// the word "eleven" has to move with it in three places.
const AS_OF = "August 2026";

type StackRow = {
  what: string;
  note: string;
  was: number;
  logos: { name: string; logo?: string }[];
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
    // The note that used to describe the capability now states how we bill
    // for it, on the client's instruction (September 2026). It replaced an
    // asterisk on the price and a footnote under the table, which said the
    // same thing one glance further away from the number it qualifies.
    note: "Pay only for monthly AI usage per user, no set fee per user",
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

const STACK_TOTAL = STACK.reduce((s, r) => s + r.was, 0);

const FAQ = [
  { q: "Can I cancel anytime?", a: "Yes, you can cancel whenever you like. There’s no cancellation fee and you’ll maintain access until the end of the month for which you’ve paid." },
  { q: "How does AI usage billing work?", a: "Your main Multiply OS software is billed as a monthly subscription. AI usage is billed separately. It is metered and invoiced every two weeks on a Friday with the same credit card you have on file. You’re able to set a monthly maximum ($200 by default) and the AI features pause once your team reaches it until the month rolls over. Raise it, lower it, turn it on/off per user or turn the cap off entirely from your Billing Settings." },
  { q: "Can I add or remove users mid-month?", a: "Yes. Ten seats are included and extra seats are $29 each per month. Add them when somebody joins and remove them when somebody leaves, rather than waiting for a renewal date." },
  { q: "Do I need to be on QuickBooks for the CFO dashboard?", a: "No. QuickBooks connects in about two minutes and is read-only, which is the fastest route. If you are on something else, upload a profit and loss and a balance sheet as a CSV each month and every dashboard, chart, and AI briefing works exactly the same way." },
];

const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

// ---------------------------------------------------------------- plan card
// NOT RENDERED. The "Plans that MULTIPLY results for your team" section that
// used to hold this was removed once the hero carried the price, the seats, the
// inclusions, and the call to action on its own.
//
// It is kept because of one thing the hero does not do: the extra-users stepper,
// which is the only place a buyer can work out what their own team costs. If
// that lands in the hero, or the answer is that nobody needs it, delete this.
function PlanCard() {
  const { openDemo } = useDemo();
  const [extra, setExtra] = useState(0);
  const total = PRICE + extra * EXTRA;

  return (
    <div className="relative mx-auto w-full max-w-[460px]">
      <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-bold text-white" style={{ background: ORANGE_DARK }}>
        Most popular
      </span>

      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-[0_30px_60px_-30px_rgba(40,30,15,0.45)] sm:p-7">
        <div className="flex items-center gap-2.5">
          <span className="grid h-[30px] w-[30px] flex-none place-items-center rounded-lg bg-[#FDF0E4]" style={{ color: ORANGE_DARK }}>
            <Spark className="h-4 w-4" />
          </span>
          <b className="text-[19px] font-extrabold tracking-tight">Multiply Scale Bundle</b>
        </div>
        <p className="mt-2 text-[13.5px] leading-relaxed text-brand-charcoal">
          The complete weekly operating system. Every module and every AI feature included.
        </p>

        <p className="mt-3 inline-flex items-start gap-1.5 rounded-lg bg-[#F4F1EC] px-2.5 py-1.5 text-[11.5px] font-semibold leading-snug text-brand-charcoal">
          <Spark className="mt-px h-3 w-3 flex-none text-brand-orange" />
          Claude AI included, so you can skip the $20 to $200 a month subscription
        </p>

        <p className="mt-4 flex items-baseline gap-1.5">
          <span className="text-[46px] font-extrabold leading-none tracking-tight tabular-nums">{money(total)}</span>
          <span className="text-[15px] font-medium text-brand-gray">/mo</span>
        </p>
        <p className="mt-1.5 text-[13px] text-brand-charcoal">
          Includes <b className="font-semibold">{SEATS} users</b> (owner plus 9 team members)
        </p>
        <p className="text-[12px] text-brand-gray">Plus ${EXTRA} a month per additional user</p>

        <div className="mt-4 rounded-xl border border-[#E6E2DB] bg-[#FAF9F7] px-3.5 py-3">
          <div className="flex items-center gap-3">
            <span className="flex-1 text-[13px] font-semibold">Extra users</span>
            <button
              type="button"
              onClick={() => setExtra((n) => Math.max(0, n - 1))}
              aria-label="Remove a user"
              disabled={extra === 0}
              className="grid h-[30px] w-[30px] place-items-center rounded-lg border border-[#E6E2DB] bg-white text-[17px] font-semibold text-brand-charcoal transition-colors hover:bg-[#F4F1EC] disabled:opacity-40"
            >
              &minus;
            </button>
            <span className="w-[30px] text-center text-[17px] font-bold tabular-nums">{extra}</span>
            <button
              type="button"
              onClick={() => setExtra((n) => Math.min(90, n + 1))}
              aria-label="Add a user"
              className="grid h-[30px] w-[30px] place-items-center rounded-lg border border-[#E6E2DB] bg-white text-[17px] font-semibold text-brand-charcoal transition-colors hover:bg-[#F4F1EC]"
            >
              +
            </button>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2 border-t border-[#EBE7E0] pt-2.5">
            <span className="flex-1 text-[12.5px] text-brand-charcoal">{SEATS + extra} users total</span>
            <span className="text-[17px] font-extrabold tabular-nums">{money(total)}</span>
            <span className="text-[12px] text-brand-gray">/mo</span>
          </div>
        </div>

        <ul className="mt-5 flex flex-col gap-2.5">
          {INCLUDED.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-[13.5px] leading-snug text-brand-ink">
              <Tick className="mt-[3px] h-[15px] w-[15px] flex-none" style={{ color: GREEN }} />
              {f}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={openDemo}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3.5 text-[15px] font-bold text-white shadow-[0_14px_30px_-12px_rgba(234,123,27,0.9)] transition-opacity hover:opacity-90"
          style={{ background: ORANGE_GRAD }}
        >
          Request a Demo
          <Arrow className="h-[16px] w-[16px]" />
        </button>
      </div>
    </div>
  );
}

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
// The logo column leads, on the client's instruction (September 2026). A
// reader recognises a mark faster than they read a capability, so the row now
// opens with the tool being replaced and explains the replacement second. The
// two flexible columns were reweighted at the same time, and then again when
// the client asked for the marks to stop stacking (September 2026). The logo
// track is sized off a measurement rather than a guess: at 21px the widest set
// on the table, Typeform + Jotform + Google Forms, runs 332px, and at the
// 1200px container the 1.25fr track comes out at about 362px. That is one line
// with 30px to spare, and no fixed width to go stale if a row gains a mark.
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
function StackTable() {
  return (
    <div className="overflow-hidden rounded-[20px] border border-black/[0.07] bg-white shadow-[0_24px_54px_-30px_rgba(40,30,15,0.45)]">
      <div className="hidden grid-cols-[minmax(0,1.25fr)_minmax(0,1.75fr)_120px_116px] items-center gap-4 border-b border-[#EBE7E0] bg-[#F6F3EE] px-6 py-3.5 sm:grid">
        {["Instead of", "What you get", "Their price", "Multiply OS"].map((h) => (
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
          All included
        </span>
        <span className="text-right text-[9.5px] font-extrabold uppercase tracking-[0.11em] text-[#8A857D]">
          Their price
        </span>
      </div>

      {/* Below sm this stays a table rather than unfolding into a card per row.
          See design/stack-table-mobile-options.html, direction 4. A reader on a
          price comparison runs their eye down a column of numbers, and a card
          breaks that column on every row. So: logos over the name on the left,
          price pinned right across both lines, note hidden, chip gone.

          The bottom hairline comes off the LAST ROW with nth-last-child(2),
          not with last:. The total bar is the table's last child, so the row
          before it is never :last-child and last:border-b-0 silently did
          nothing: every row kept its rule and the twelfth one stacked a grey
          hairline straight onto the total bar's 2px orange one.

          The two left cells sit in explicit grid slots rather than in flow, so
          the phone stacks them in the same order the desktop reads them in.
          Logos first on both. */}
      {STACK.map((r) => (
        <div
          key={r.what}
          className="grid grid-cols-[1fr_84px] gap-x-2.5 gap-y-1.5 border-b border-l-[3px] border-[#F3F0EB] border-l-transparent px-4 py-3 transition-colors duration-150 [&:nth-last-child(2)]:border-b-0 hover:border-l-brand-orange hover:bg-[#FFFCF7] sm:grid-cols-[minmax(0,1.25fr)_minmax(0,1.75fr)_120px_116px] sm:items-center sm:gap-4 sm:px-6 sm:py-[15px]"
        >
          {/* bare marks on a phone, pills from sm up: at 21px a pill around a
              wordmark is mostly border */}
          <span className="col-start-1 row-start-1 flex min-w-0 flex-wrap items-center gap-[7px] sm:col-auto sm:row-auto sm:justify-center">
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

          <span className="col-start-1 row-start-2 min-w-0 sm:col-auto sm:row-auto sm:text-center">
            <span className="block text-[13px] font-bold leading-tight sm:text-[14px]">{r.what}</span>
            {/* Kept in the DOM, hidden on a phone: it is the longest text in
                the row, and the phone already has the mark and the price, which
                is what this table is for. */}
            <span className="hidden text-[11.5px] leading-snug text-brand-gray sm:block">
              {r.note}
            </span>
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

          <span className="hidden sm:flex sm:justify-center">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-[5px] text-[12px] font-extrabold"
              style={{ background: "#EAF7F0", color: GREEN }}
            >
              <Tick className="h-3 w-3" />
              Included
            </span>
          </span>
        </div>
      ))}

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

// ---------------------------------------------------------------- FAQ
function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-3xl divide-y divide-[#EBE7E0] border-y border-[#EBE7E0]">
      {FAQ.map((f, i) => {
        const on = open === i;
        return (
          <div key={f.q}>
            <button
              type="button"
              aria-expanded={on}
              onClick={() => setOpen(on ? null : i)}
              className="flex w-full items-center gap-4 py-4 text-left"
            >
              <span className="flex-1 text-[15.5px] font-semibold text-brand-ink">{f.q}</span>
              <Chevron
                className="h-4 w-4 flex-none text-brand-gray transition-transform duration-200"
                style={{ transform: on ? "rotate(180deg)" : undefined }}
              />
            </button>
            {on && (
              <p className="sop-view -mt-1 max-w-2xl pb-4 text-[14px] leading-relaxed text-brand-charcoal">
                {f.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------- page
// How many inclusions the hero card shows on a phone before the rest go behind
// the disclosure. Four is what fits without the card outrunning the fold.
const MOBILE_INCLUDED = 4;

export default function PricingPage() {
  const { openDemo } = useDemo();
  // Phone only. At sm and up every inclusion is rendered regardless, so this
  // never affects the desktop card.
  const [allIn, setAllIn] = useState(false);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* ------------------------------------------------ what it replaces
          The client moved this above the price in September 2026, so the
          argument now runs the other way round. The visitor reads the stack and
          its total first, and the $299 arrives underneath as the answer to a
          number they are already carrying.

          Which makes this the page opening, so it takes the h1. The price
          section below, which used to hold it, took an h2.

          The eyebrow and the lede came back with the move. They had been
          dropped when this was section two and the table could speak for
          itself. At the top of a page it has to say what it is before the table
          gets a chance to. */}
      <section
        id="stack"
        className="relative scroll-mt-24 overflow-hidden bg-white px-5 pb-14 pt-10 sm:px-8 sm:pb-[76px] sm:pt-[72px]"
      >
        {/* The platform page's ground, brought across unchanged: white under
            .bg-dotted at 60%, which is globals.css's 1px #e5e5e5 radial on a
            22px pitch. Hero.tsx runs the identical pair, so the two pages now
            open on the same surface rather than on two different creams.

            See design/pricing-lead-bg-and-highlight-options.html, direction A1.

            It is a texture, not a layer with content in it, so it is aria-hidden
            and the container below picks up relative to sit over it. */}
        <div
          aria-hidden="true"
          className="bg-dotted pointer-events-none absolute inset-0 opacity-60"
        />
        <div className="relative mx-auto max-w-container">
          <Reveal className="mx-auto mb-8 max-w-2xl text-center sm:mb-11">
            <p
              className="mb-2.5 text-[10.5px] font-bold uppercase tracking-[0.19em] sm:mb-4"
              style={{ color: ORANGE_DARK }}
            >
              Eleven tools &middot; one subscription
            </p>
            <h1 className="text-[28px] font-extrabold leading-[1.1] tracking-tight text-brand-ink sm:text-[44px]">
              Everything Multiply OS{" "}
              <span className="relative whitespace-nowrap">
                replaces.
                <svg className="absolute -bottom-2 left-0 h-3 w-full text-brand-orange" viewBox="0 0 120 12" preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" aria-hidden="true">
                  <path d="M3 8c26-5 74-6 114-3" />
                </svg>
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-[48ch] text-[14.5px] leading-relaxed text-brand-charcoal sm:mt-7 sm:text-[15.5px]">
              The stack a team of ten is usually paying for, at list price, next to what the same
              work costs on one subscription.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <StackTable />
          </Reveal>

          {/* Sourcing only. The asterisk note that used to lead this block
              moved into the AI row itself, where it sits beside the price it
              qualifies rather than a table's length below it. */}
          <Reveal delay={0.16} className="mx-auto mt-5 max-w-2xl text-center">
            <p className="text-[11.5px] leading-relaxed text-brand-gray">
              Comparison uses each vendor&rsquo;s entry level paid plan at monthly list pricing for a team of ten, checked {AS_OF}.
              Vendors change their pricing, so treat these as indicative rather than quoted.
              All trademarks belong to their owners.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------ the price
          Stripe's pricing hero rebuilt in this site's palette. See
          design/pricing-hero-stripe-options.html (direction S5) and
          design/pricing-hero-s5-revised.html (direction R4), which is what
          shipped.

          It used to open the page. Since the stack moved above it, it is the
          second sheet: it rides 36px up over the section above on a rounded top
          edge, which is the join the stack section used to make over the hero.
          One surface passing under another is a thing the eye already knows how
          to read, which is why the join is done this way rather than with a
          rule. See design/pricing-hero-seam-options.html, direction 4.

          THE THREE GROUNDS ARE A SET AND HAVE TO STAY ONE. An overlap only
          reads while the two surfaces differ, so the page alternates: white
          under the stack, cream #F6F3EE here, near-white #FBFAF8 under the FAQ.
          This section held #FBFAF8 while the stack was cream above it; taking
          the platform page's white up there pushed the cream down to here and
          the near-white down to the FAQ. Change any one of the three and the
          sheet under it stops looking like a sheet.

          The cream is also the better ground for what this section holds: the
          price card is white, and it was designed to lift off exactly this
          colour back when this was the hero.

          Four things carry the section, and none of them is decoration:

            1. The dashed column rules ARE the layout. The lead sits in columns
               one and two and the card in three to five. They mirror the
               content grid exactly, so they only line up while both use the
               same padding and the same max width.
            2. One card, because we sell one plan. Stripe shows two only because
               they sell two things.
            3. The card is three bands with two hairlines between them: price,
               then what is in it, then the way in. That is what makes it read
               as expensive rather than as a box with a number in it.
            4. The gradient strip is 148px at -10.5 degrees. At that angle its
               low end drops about 176px below its centre on a 1440px viewport,
               and that offset grows with the viewport, so the section has to
               stay tall enough or the strip gets sliced flat by its own
               overflow and reads as a bug. The 276px of bottom padding is
               load-bearing, and it is scoped to lg for that reason: the strip
               is the only thing it makes room for, and between sm and lg there
               is no strip, so the same padding there was just a blank field.

          The strip geometry, which is tight and worth writing down. The two
          numbers move together and are set so the strip's top edge lands 68px
          above the end of the content: calc(100% - 332px) against 264px of
          bottom padding. Change the padding and the offset changes with it, or
          the strip slides into the price card.

          Nothing hides the strip's low end any more. The FAQ below is the same
          cream carried on, with no sheet and no card to bury anything, so the
          strip is masked to fade out instead. The note on the strip itself has
          the measurements. What the padding buys now is only clearance: at
          1920px the faded end finishes about 27px above where the FAQ's own
          padding starts.

          Below lg the rules and the strip come off and it stacks. That is not a
          fallback, it is the design: the grid is the idea, and there is no grid
          on a phone. */}
      <section
        id="pricing"
        className="relative z-10 -mt-9 scroll-mt-24 overflow-hidden rounded-t-[22px] bg-[#F6F3EE] px-5 pb-[76px] pt-12 shadow-[0_-18px_36px_-22px_rgba(40,30,15,0.26)] sm:px-8 sm:pb-20 sm:pt-20 lg:pb-[264px]"
      >
        {/* the grabber. Without it the section reads as a box with two rounded
            corners; with it, it reads as a sheet that has been pulled up.

            A chevron was tried here instead (direction 6 in
            design/pricing-sheet-edge-options.html) and came back off: at the
            size this edge wants, an arrow is too small to read as anything. A
            bar carries that width comfortably, an icon does not. */}
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-[13px] h-[3px] w-[42px] -translate-x-1/2 rounded-full bg-[#E4DED4]"
        />

        {/* The column rules, aligned to the content grid by mirroring it.

            They fade out at the foot for the same reason the strip does. With
            the FAQ below carrying this section on rather than covering it, a
            hard stop is the one thing left that gives the boundary away: twelve
            dashed lines ending on a level in the middle of an unbroken cream
            field reads as a mistake. Dissolved, the grid simply runs out. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden px-5 sm:px-8 lg:block"
          style={{
            WebkitMaskImage: "linear-gradient(180deg, #000 58%, transparent 94%)",
            maskImage: "linear-gradient(180deg, #000 58%, transparent 94%)",
          }}
        >
          <div className="mx-auto grid h-full max-w-container grid-cols-5">
            <span />
            <span className="border-l border-dashed border-[#E8E2D8]" />
            <span className="border-l border-dashed border-[#E8E2D8]" />
            <span className="border-l border-dashed border-[#E8E2D8]" />
            <span className="border-l border-dashed border-[#E8E2D8]" />
          </div>
        </div>

        {/* Anchored to the bottom of the section rather than centred in it,
            because the only thing that matters is that it passes BELOW the lead
            column's last line. Centred, it runs straight through the sentence
            and prints ink on orange. The comment on the section has the
            arithmetic. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[-16%] top-[calc(100%-332px)] hidden h-[148px] w-[132%] lg:block"
          style={{
            transform: "rotate(-10.5deg)",
            background:
              "linear-gradient(93deg, #C9650F 0%, #F49230 14%, #FFD08A 27%, #E8683A 40%, #F7B45C 55%, #DE4E52 70%, #F49230 86%, #A8480A 100%)",
            // The low end fades rather than stopping. It is the one part of this
            // strip whose position is not ours to choose: the bar is 132% of the
            // viewport and rotated about its centre, so its low end drops further
            // the wider the screen gets. Measured, it finishes 12px below the FAQ
            // edge at 1440px, 69px at 1920px, and about 147px at 2560px.
            //
            // A full-bleed sheet could cover that by overlapping far enough. The
            // FAQ is an inset card now and covers nothing at the margins, so
            // instead of racing the geometry the strip dissolves into the ground
            // before it ever reaches a boundary. Viewport independent, and it
            // reads as a fade rather than as something ending.
            WebkitMaskImage: "linear-gradient(90deg, transparent 5%, #000 30%)",
            maskImage: "linear-gradient(90deg, transparent 5%, #000 30%)",
          }}
        />

        <div className="relative mx-auto max-w-container">
          <div className="grid items-start gap-6 sm:gap-10 lg:grid-cols-5 lg:gap-0">
            {/* columns one and two: what this is.
                See design/pricing-hero-lead-options.html, direction L1. The
                comparison used to be grey 13.5px under the lede and it
                disappeared, partly on contrast and partly because the strip
                arrives underneath it. It is a sentence in ink now, not a
                caption, with the figure struck so the eye stops on it. */}
            <Reveal className="text-center sm:text-left lg:col-span-2 lg:pr-10">
              <p
                className="mb-2.5 text-[10.5px] font-bold uppercase tracking-[0.19em] sm:mb-3.5"
                style={{ color: ORANGE_DARK }}
              >
                One plan &middot; {SEATS} users &middot; no tiers
              </p>
              <h2 className="text-balance text-[26px] font-bold leading-[1.12] tracking-[-0.022em] text-brand-ink sm:text-[34px] sm:leading-[1.1]">
                Pricing built for the whole team
              </h2>
              <p className="mx-auto mt-2.5 max-w-[30ch] text-[14.5px] leading-relaxed text-brand-charcoal sm:mx-0 sm:mt-3 sm:max-w-[42ch] sm:text-[15px]">
                Every module, with nothing held back for a bigger contract.
              </p>
              {/* "eleven" tracks STACK.length. If a row is added or removed
                  there, this word changes with it, here and in the eyebrow at
                  the top of the page and in the card's phone-only band below.
                  Three places, all spelled out in words, so grep for the word
                  rather than trusting this comment.

                  Hidden on a phone, where it runs to three lines. It is not
                  lost: below sm the card carries the same claim as a strip
                  under the button, where it sits next to the price it is being
                  compared with. Both are fed from STACK_TOTAL, so they cannot
                  drift apart. */}
              <p className="mt-5 hidden max-w-[34ch] text-[15.5px] font-medium leading-relaxed text-brand-ink sm:block">
                The same eleven tools cost{" "}
                <b className="font-extrabold line-through decoration-[rgba(192,64,43,0.55)] decoration-2">
                  {money(STACK_TOTAL)} a month
                </b>{" "}
                bought separately.
              </p>
            </Reveal>

            {/* columns three to five: the only price on the page */}
            <Reveal delay={0.1} className="lg:col-span-3">
              <div className="overflow-hidden rounded-[14px] border border-black/[0.055] bg-white shadow-[0_32px_72px_-26px_rgba(40,30,15,0.3),0_3px_10px_-3px_rgba(40,30,15,0.07)]">
                {/* band one: the price gets the full width of the card.
                    See design/pricing-hero-mobile-centered-variants.html,
                    direction 6.

                    Below sm the order inverts: the price comes first at 46px
                    and the plan name drops to a caption underneath it. On a
                    phone this card is the whole screen, so the biggest thing in
                    it should be the number rather than a product name the
                    visitor already knows. `order` does the swap, so the DOM
                    keeps the name before the price and a screen reader still
                    hears what is being priced first. */}
                <div
                  className="flex flex-col items-center gap-1.5 border-b border-[#F1EBE2] px-5 py-5 text-center sm:flex-row sm:items-center sm:gap-4 sm:text-left sm:px-7"
                  style={{ background: "linear-gradient(112deg, #FFFAF3 0%, #FFEEDD 100%)" }}
                >
                  <span className="order-2 min-w-0 sm:order-1">
                    <h3 className="flex items-center justify-center gap-2.5 text-[14px] font-[650] tracking-[-0.016em] text-brand-charcoal sm:justify-start sm:text-[21px] sm:font-bold sm:text-brand-ink">
                      {/* the dot is desktop only: at 14px caption weight it
                          reads as a stray bullet rather than a marker */}
                      <span
                        className="hidden h-2 w-2 flex-none rounded-full sm:block"
                        style={{ background: ORANGE }}
                      />
                      Multiply Scale Bundle
                    </h3>
                    <p className="mt-1 text-[12.5px] leading-snug text-brand-charcoal sm:mt-1.5 sm:text-[13px]">
                      {SEATS} users included <span className="text-[#C4BFB6]">&middot;</span> $
                      {EXTRA} per extra seat
                    </p>
                  </span>
                  <p className="order-1 flex-none text-[46px] font-extrabold leading-none tracking-[-0.034em] text-brand-ink sm:order-2 sm:ml-auto sm:text-[42px]">
                    {money(PRICE)}
                    <span className="text-[15px] font-bold sm:text-[17px]">/mo</span>
                  </p>
                </div>

                {/* band two: everything in it. The first line of INCLUDED is
                    dropped because the band above already says it, and a card
                    that states its seat count twice looks careless.

                    Below sm the list shows four and the rest are behind the
                    button underneath. Ten single-column rows, several of them
                    wrapping, were most of the reason this card ran past a
                    screen and a half on a phone. Nothing is deleted: the tail
                    is hidden with a class, so at sm and up the full list is
                    always rendered and always in the DOM for search engines
                    and screen readers.

                    The block is centred but the sentences inside it are not.
                    Centring each row leaves the ticks starting at a different
                    x on every line, and they stop reading as a column. */}
                <div className="px-5 py-5 sm:px-7 sm:py-6">
                  <p className="text-center text-[10px] font-bold uppercase tracking-[0.13em] text-brand-gray sm:text-left sm:text-[10.5px]">
                    Everything included, no add-ons
                  </p>
                  <ul className="mx-auto mt-3 grid w-fit gap-x-6 gap-y-2 sm:mx-0 sm:w-auto sm:grid-cols-2">
                    {INCLUDED.slice(1).map((f, i) => (
                      <li
                        key={f}
                        className={`items-start gap-2.5 text-left text-[13px] leading-snug text-brand-ink ${
                          i >= MOBILE_INCLUDED && !allIn ? "hidden sm:flex" : "flex"
                        }`}
                      >
                        <Tick className="mt-[3px] h-[13px] w-[13px] flex-none" style={{ color: GREEN }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 text-center sm:hidden">
                    <button
                      type="button"
                      onClick={() => setAllIn((v) => !v)}
                      aria-expanded={allIn}
                      className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold"
                      style={{ color: ORANGE_DARK }}
                    >
                      {allIn ? "Show less" : `See all ${INCLUDED.length - 1}`}
                      <Chevron
                        className="h-3 w-3 transition-transform duration-200"
                        style={{ transform: allIn ? "rotate(180deg)" : undefined }}
                      />
                    </button>
                  </div>
                </div>

                {/* band three: the way in */}
                <div className="flex flex-wrap items-center gap-3 border-t border-[#F1EBE2] bg-[#FDFCFA] px-5 py-4 sm:gap-4 sm:px-7">
                  <button
                    type="button"
                    onClick={openDemo}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-full px-[20px] py-[11px] text-[14.5px] font-semibold text-white shadow-[0_10px_22px_-10px_rgba(234,123,27,0.9)] transition-opacity hover:opacity-90 sm:w-auto"
                    style={{ background: ORANGE }}
                  >
                    Request a Demo
                    <ChevronRight className="h-[11px] w-[11px]" />
                  </button>
                  {/* full width on a phone, where ml-auto would leave it
                      stranded on its own right-aligned line under the button */}
                  <p className="w-full text-center text-[12.5px] leading-snug text-brand-gray sm:ml-auto sm:w-auto sm:text-right">
                    No setup fees, no minimum term
                    <br />
                    Cancel any time
                  </p>
                </div>

                {/* band four, phone only: the comparison the lead column drops
                    below sm. Same figure, same source, stated where it does the
                    most work, right under the price it is being measured
                    against. */}
                <div className="border-t border-[#F1EBE2] bg-[#FFF9F2] px-5 py-2.5 text-center text-[12.5px] leading-snug text-brand-charcoal sm:hidden">
                  The same eleven tools cost{" "}
                  <b className="font-extrabold text-brand-ink line-through decoration-[rgba(192,64,43,0.55)] decoration-2">
                    {money(STACK_TOTAL)}/mo
                  </b>{" "}
                  separately
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ FAQ
          Part of the price section, on the client's instruction. Not a sheet
          over it, not a card on it: the same cream, carried straight on. No
          rounded edge, no overlap, no shadow, no rule, nothing drawn between
          the two at all. What separates them is white space and a heading,
          which is what separates any two runs of a document.

          It stays its own <section> because it is its own subject and carries
          its own h2. Only the styling is continuous. Merging the elements would
          also break the strip above, whose position is measured off its
          section's own height.

          So the gap is made entirely of the price section's bottom padding plus
          this section's top padding. The bulk of it is the strip's clearance,
          which is why the number up there is large and why it is on lg only. */}
      <section className="bg-[#F6F3EE] px-5 pb-14 pt-6 sm:px-8 sm:pb-20 sm:pt-10">
        <div className="mx-auto max-w-container">
          <Reveal className="mb-8 text-center sm:mb-10">
            <h2 className="text-[26px] font-extrabold leading-[1.1] tracking-tight text-brand-ink sm:text-[38px]">
              Frequently Asked Questions
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <Faq />
          </Reveal>

          <Reveal delay={0.14}>
            <div className="mx-auto mt-10 max-w-2xl text-center">
              <p className="text-[14px] font-semibold text-brand-ink">
                Trusted by entrepreneurs running $500K to $10M businesses
              </p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-brand-gray">
                Every plan includes SSL encryption, daily backups, and 99.9% uptime.
                <br className="hidden sm:block" />
                Questions?{" "}
                <a href="mailto:support@multiplyos.com" className="font-semibold text-brand-orange-dark underline">
                  support@multiplyos.com
                </a>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
