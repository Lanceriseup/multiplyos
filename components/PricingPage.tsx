"use client";

// The pricing page.
//
// Replaces the nav's old off-site link to app.multiplyos.com/pricing, so this is
// now the page that has to do the selling rather than hand the visitor to the
// app. Two sources fed it:
//
//   1. Screenshots of the live in-app pricing page: the Multiply Scale Bundle at
//      $299 with ten seats, the AI usage billing explainer, the savings
//      calculator, the six included modules, and the FAQ. All reproduced.
//   2. The client's reference, HighLevel's "what's included" table, which lists
//      each capability against the tools it replaces and totals the stack.
//
// The stack table is the addition. Everything else already existed in the app.
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
import { useMemo, useState } from "react";
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
// the orange has to lift off a near-black slab, so it is a lighter tint of the same hue
const ORANGE_ON_DARK = "#FFB265";
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
const People = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="9.2" cy="8.4" r="3" />
    <path d="M3.6 18.6c0-2.8 2.5-4.6 5.6-4.6s5.6 1.8 5.6 4.6" />
    <path d="M16.2 6.2a3 3 0 0 1 0 5.6M17.4 14.6c1.9.6 3.2 1.9 3.2 4" />
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
    note: "Claude and GPT, grounded in your own company data",
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
  {
    what: "CRM and pipeline",
    note: "Contacts, deals, and the follow-up that closes them",
    // GoHighLevel Starter, $97/mo flat with unlimited users, so nothing to
    // multiply. The one figure on the table that was already exactly right.
    was: 97,
    logos: [{ name: "GoHighLevel", logo: "/replaces-highlevel.png" }],
  },
];

const STACK_TOTAL = STACK.reduce((s, r) => s + r.was, 0);

const FAQ = [
  { q: "Can I cancel anytime?", a: "Yes. Cancel from Settings, then Billing, whenever you like. There is no notice period and no cancellation fee, and you keep full access until the end of the period you have already paid for." },
  { q: "How does AI usage billing work?", a: "Your $299 is billed monthly like any subscription. AI usage is separate: it is metered and invoiced every two weeks on a Friday against the same card, so a quiet month costs less than a busy one. You set a monthly maximum, $200 by default, and AI features pause once your team reaches it until the month rolls over. Raise it, lower it, or turn the cap off entirely from Settings, then Billing." },
  { q: "What is included in the Multiply Scale Bundle?", a: "Every module. Scoreboards, the one page plan, meetings and 1-on-1s, the org chart, DISC assessments, SOP HQ, projects and tasks, forms, checklists, agreements, the CRM, the CFO dashboard with banking analytics, and Multi AI across all of it. There are no add-ons to assemble and nothing held back for a higher tier." },
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
// Below sm each row becomes a small card: a four-column table at 360px is
// unreadable, and the price is the one thing that must not end up in a corner.
function StackTable() {
  return (
    <div className="overflow-hidden rounded-[20px] border border-black/[0.07] bg-white shadow-[0_24px_54px_-30px_rgba(40,30,15,0.45)]">
      <div className="hidden grid-cols-[minmax(0,1.45fr)_minmax(0,1.35fr)_120px_116px] items-center gap-4 border-b border-[#EBE7E0] bg-[#F6F3EE] px-6 py-3.5 sm:grid">
        {["What you get", "Instead of", "Their price", "Multiply OS"].map((h, i) => (
          <span
            key={h}
            className={`text-[10.5px] font-extrabold uppercase tracking-[0.11em] text-[#8A857D] ${i >= 2 ? "text-center" : ""}`}
          >
            {h}
          </span>
        ))}
      </div>

      {/* Phone header. The desktop header above is a four column rule; this is
          the two column version of it, and it carries the Included claim for
          the whole table.

          That claim used to be a chip on every row. Twelve identical chips read
          as a column on a desktop and as the same three words twelve times on a
          phone, which is padding rather than information. Stated once here, the
          rows get a whole block back each. */}
      <div className="grid grid-cols-[1fr_76px] items-center gap-x-2.5 border-b border-[#EBE7E0] bg-[#F6F3EE] px-4 py-2.5 sm:hidden">
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
          breaks that column on every row. So: name over its logos on the left,
          price pinned right across both lines, note hidden, chip gone. */}
      {STACK.map((r) => (
        <div
          key={r.what}
          className="grid grid-cols-[1fr_76px] gap-x-2.5 gap-y-1 border-b border-l-[3px] border-[#F3F0EB] border-l-transparent px-4 py-3 transition-colors duration-150 last:border-b-0 hover:border-l-brand-orange hover:bg-[#FFFCF7] sm:grid-cols-[minmax(0,1.45fr)_minmax(0,1.35fr)_120px_116px] sm:items-center sm:gap-4 sm:px-6 sm:py-[15px]"
        >
          <span className="col-start-1 row-start-1 min-w-0 sm:col-auto sm:row-auto">
            <span className="block text-[13px] font-bold leading-tight sm:text-[14px]">{r.what}</span>
            {/* Kept in the DOM, hidden on a phone: it is the longest text in
                the row and it explains a capability the visitor was already
                sold two screens up. What this table is for is the arithmetic. */}
            <span className="hidden text-[11.5px] leading-snug text-brand-gray sm:block">
              {r.note}
            </span>
          </span>

          {/* bare marks on a phone, pills from sm up: at 14px a pill around a
              wordmark is mostly border */}
          <span className="col-start-1 row-start-2 flex min-w-0 flex-wrap items-center gap-[7px] sm:col-auto sm:row-auto">
            {r.logos.map((l) => (
              <span
                key={l.name}
                className="inline-flex items-center rounded-full border-black/[0.08] text-[11px] font-[650] text-brand-charcoal sm:border sm:bg-white sm:px-2.5 sm:py-1.5 sm:shadow-[0_1px_2px_rgba(40,30,15,0.05)]"
              >
                <ReplacedLogo
                  src={l.logo ?? ""}
                  name={l.name}
                  className="h-[14px] w-auto opacity-80 sm:h-[17px] sm:opacity-100"
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

// ---------------------------------------------------------------- calculator
function Slider({ value, min, max, step, onChange, label }: {
  value: number; min: number; max: number; step: number;
  onChange: (n: number) => void; label: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <input
      type="range"
      aria-label={label}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="price-range w-full"
      style={{ background: `linear-gradient(to right, ${ORANGE} ${pct}%, #E1DDD6 ${pct}%)` }}
    />
  );
}

/* The three billing facts. Deliberately not a card: it sits on the page ground so
   the calculator beside it is the only object in the section with a border. */
function BillingFacts() {
  const facts = [
    {
      t: "The plan is billed monthly",
      d: "Your Multiply Scale Bundle price behaves like any other subscription.",
    },
    {
      t: "Usage is invoiced every two weeks",
      d: "Insights, the coach, and recordings are metered and charged on a Friday, as a separate automatic charge against the same card.",
    },
    {
      t: "You set the ceiling",
      d: "$200 a month by default. AI features pause when your team reaches it, until the month rolls over. Raise it, lower it, or turn it off from Settings, then Billing.",
    },
  ];

  return (
    <div className="pt-1">
      <h3 className="flex items-center gap-2 text-[20px] font-extrabold tracking-tight sm:text-[22px]">
        <Spark className="h-[18px] w-[18px] flex-none text-brand-orange" />
        How AI usage billing works
      </h3>
      <p className="mt-2.5 text-[14px] leading-relaxed text-brand-charcoal">
        Claude is built into every seat, so you skip the $20 to $200 a month subscription and pay
        only for what your team actually uses. Heavy month or light month, the bill follows the
        usage rather than a flat AI fee.
      </p>

      <ul className="mt-6 flex flex-col gap-[18px]">
        {facts.map((f, i) => (
          <li key={f.t} className="grid grid-cols-[30px_minmax(0,1fr)] items-start gap-x-[13px]">
            <span
              className="row-span-2 grid h-[30px] w-[30px] place-items-center rounded-[9px] text-[12.5px] font-extrabold"
              style={{ background: "#FDEEDC", color: ORANGE_DARK }}
            >
              {i + 1}
            </span>
            <b className="text-[14px] font-bold text-brand-ink">{f.t}</b>
            <span className="col-start-2 mt-[3px] text-[13px] leading-relaxed text-brand-charcoal">
              {f.d}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Calculator() {
  const [rev, setRev] = useState(100000);
  const [lift, setLift] = useState(3);
  const [team, setTeam] = useState(SEATS);
  const perUser = 20;

  const { save, year, aiCost } = useMemo(() => ({
    save: rev * (lift / 100),
    year: rev * (lift / 100) * 12,
    aiCost: team * perUser,
  }), [rev, lift, team]);

  // a white-ish inset panel, used for every input group
  const panel = "rounded-[14px] border border-white/80 bg-white/70 p-4";

  return (
    <div
      className="rounded-[20px] border p-5 shadow-[0_22px_48px_-30px_rgba(150,90,20,0.5)] sm:p-6"
      style={{ borderColor: "#F0DCC4", background: "linear-gradient(160deg, #FFF8F0, #FDEEDC)" }}
    >
      <div className={panel}>
        <p className="text-[10.5px] font-bold uppercase tracking-[0.09em] text-brand-charcoal">
          Your monthly revenue today
        </p>
        <p className="mt-2 flex items-baseline gap-[7px]">
          <span className="text-[28px] font-extrabold leading-none tabular-nums sm:text-[36px]">
            {money(rev)}
          </span>
          <span className="text-[13px] text-brand-gray">/mo</span>
        </p>
        <div className="mt-3">
          <Slider value={rev} min={0} max={10000000} step={100000} onChange={setRev} label="Monthly revenue" />
          <div className="mt-1 flex justify-between font-mono text-[10.5px] text-brand-gray">
            <span>$0</span>
            <span>Drag to set</span>
            <span>$10M+</span>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className={panel}>
          <p className="flex items-baseline gap-2.5 text-[10.5px] font-bold uppercase tracking-[0.09em] text-brand-charcoal">
            Profit lift from AI
            <b className="ml-auto text-[16px] font-extrabold tabular-nums text-brand-ink">{lift}%</b>
          </p>
          <div className="mt-2.5">
            <Slider value={lift} min={1} max={10} step={1} onChange={setLift} label="Profitability improvement" />
            <div className="mt-1 flex justify-between font-mono text-[10.5px] text-brand-gray">
              <span>1%</span>
              <span>10%</span>
            </div>
          </div>
        </div>

        <div className={panel}>
          <p className="flex items-baseline gap-2.5 text-[10.5px] font-bold uppercase tracking-[0.09em] text-brand-charcoal">
            <People className="h-3 w-3 flex-none" />
            Team size
            <b className="ml-auto text-[16px] font-extrabold tabular-nums text-brand-ink">{team}</b>
          </p>
          <div className="mt-2.5">
            <Slider value={team} min={1} max={50} step={1} onChange={setTeam} label="Team size" />
            <div className="mt-1 flex justify-between font-mono text-[10.5px] text-brand-gray">
              <span>1</span>
              <span>50</span>
            </div>
          </div>
        </div>
      </div>

      {/* the answer, on a dark slab so the orange figure is the loudest thing here */}
      <div className="mt-3 rounded-[14px] px-[18px] pb-4 pt-[18px] text-white" style={{ background: "#171310" }}>
        <p className="text-[10.5px] font-bold uppercase tracking-[0.11em]" style={{ color: ORANGE_ON_DARK }}>
          Estimated monthly gain
        </p>
        <p className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span
            className="text-[32px] font-black leading-none tabular-nums sm:text-[42px]"
            style={{ color: ORANGE_ON_DARK }}
          >
            {money(save)}
          </span>
          <span className="text-[13px] text-white/60">/mo</span>
          <span className="text-[19px] font-bold tabular-nums" style={{ color: ORANGE_ON_DARK }}>
            {money(year)}
          </span>
          <span className="text-[13px] text-white/60">a year</span>
        </p>
        <p className="mt-3 border-t border-white/[0.14] pt-3 text-[13px] text-white/[0.78]">
          Against <b className="font-semibold text-white tabular-nums">{money(aiCost)}</b>/mo of
          metered AI usage, plus your <b className="font-semibold text-white">{money(PRICE)}</b> plan.
        </p>
      </div>

      <p className="mt-2.5 text-[11.5px] leading-snug text-brand-gray">
        An estimate built from the numbers you entered, not a projection or a guarantee.
      </p>
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

      {/* ------------------------------------------------ hero
          Stripe's pricing hero rebuilt in this site's palette. See
          design/pricing-hero-stripe-options.html (direction S5) and
          design/pricing-hero-s5-revised.html (direction R4), which is what
          shipped.

          Four things carry it, and none of them is decoration:

            1. The dashed column rules ARE the layout. The lead sits in columns
               one and two and the card in three to five. They mirror the
               content grid exactly, so they only line up while both use the
               same padding and the same max width.
            2. One card, because we sell one plan. Stripe shows two only because
               they sell two things.
            3. The card is three bands with two hairlines between them: price,
               then what is in it, then the way in. That is what makes it read
               as expensive rather than as a box with a number in it.
            4. The gradient strip is 160px at -10.5 degrees, centred on the
               section. At that angle its low end drops about 176px below
               centre, so the section has to stay taller than roughly 510px or
               the strip gets sliced flat by its own overflow and reads as a
               bug. The generous vertical padding below is load-bearing.

          Below lg the rules and the strip come off and it stacks. That is not a
          fallback, it is the design: the grid is the idea, and there is no grid
          on a phone. */}
      <section className="relative overflow-hidden bg-[#F6F3EE] px-5 pb-[76px] pt-8 sm:px-8 sm:pb-[276px] sm:pt-20">
        {/* the column rules, aligned to the content grid by mirroring it */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden px-5 sm:px-8 lg:block">
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
            and prints ink on orange.

            The geometry is tight and worth writing down. At -10.5 degrees the
            strip's low end sits about 176px below its centre on a 1440px
            viewport, and that offset grows with the viewport. calc(100% - 344px)
            puts its centre 270px above the section's bottom edge, which leaves
            roughly 20px under the strip and about 30px between its top edge and
            the last line of the lead. 276px is the old 240px plus the 36px the
            #stack sheet below rides up over, so the visible hero still ends
            240px under the lead exactly as it always did. The two numbers move
            together: change one and the hero gets shorter or taller than it
            looks here.

            One consequence, and it is wanted. The strip's low end now finishes
            about 16px past the visible edge, behind the sheet. That is where
            the overflow-hidden cut goes to hide, so the flat chop that used to
            land on the section boundary is no longer visible at all. Check the
            left column at 1440px before shipping. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[-16%] top-[calc(100%-344px)] hidden h-[148px] w-[132%] lg:block"
          style={{
            transform: "rotate(-10.5deg)",
            background:
              "linear-gradient(93deg, #C9650F 0%, #F49230 14%, #FFD08A 27%, #E8683A 40%, #F7B45C 55%, #DE4E52 70%, #F49230 86%, #A8480A 100%)",
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
              <h1 className="text-balance text-[26px] font-bold leading-[1.12] tracking-[-0.022em] text-brand-ink sm:text-[34px] sm:leading-[1.1]">
                Pricing built for the whole team
              </h1>
              <p className="mx-auto mt-2.5 max-w-[30ch] text-[14.5px] leading-relaxed text-brand-charcoal sm:mx-0 sm:mt-3 sm:max-w-[42ch] sm:text-[15px]">
                Every module, with nothing held back for a bigger contract.
              </p>
              {/* "twelve" tracks STACK.length. If a row is added or removed
                  there, this word changes with it.

                  Hidden on a phone, where it runs to three lines in a hero that
                  is already fighting for the fold. It is not lost: below sm the
                  card carries the same claim as a strip under the button, where
                  it sits next to the price it is being compared with. Both are
                  fed from STACK_TOTAL, so they cannot drift apart. */}
              <p className="mt-5 hidden max-w-[34ch] text-[15.5px] font-medium leading-relaxed text-brand-ink sm:block">
                The same twelve tools cost{" "}
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
                    <h2 className="flex items-center justify-center gap-2.5 text-[14px] font-[650] tracking-[-0.016em] text-brand-charcoal sm:justify-start sm:text-[21px] sm:font-bold sm:text-brand-ink">
                      {/* the dot is desktop only: at 14px caption weight it
                          reads as a stray bullet rather than a marker */}
                      <span
                        className="hidden h-2 w-2 flex-none rounded-full sm:block"
                        style={{ background: ORANGE }}
                      />
                      Multiply Scale Bundle
                    </h2>
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
                    wrapping, were most of the reason this hero ran past a
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
                  The same twelve tools cost{" "}
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

      {/* ------------------------------------------------ the sheet
          #stack rides 36px up over the hero on a rounded top edge with a soft
          shadow above it. The join used to be a 1px #EFECE6 rule between
          #FBF9F6 and #FBFAF8, two creams close enough that the rule read as an
          edge that should not be there rather than as a change of section. Now
          one surface passes under another, which is a thing the eye already
          knows how to read. See design/pricing-hero-seam-options.html,
          direction 4.

          The hero's ground dropped to #F6F3EE at the same time, so it reads as
          the surface underneath rather than as the same paper.

          The hero's bottom padding grew by the same 36px this pulls up, so the
          hero looks exactly as tall as it did before; the comment on the hero
          has the arithmetic. The strip's low end runs on under this sheet,
          which is the good part: the hero still chops it flat with its own
          overflow-hidden, but the cut now lands behind here where nobody sees
          it. */}
      <section
        id="stack"
        className="relative z-10 -mt-9 scroll-mt-24 rounded-t-[22px] bg-[#FBFAF8] px-5 pb-14 pt-16 shadow-[0_-18px_36px_-22px_rgba(40,30,15,0.26)] sm:px-8 sm:pb-20 sm:pt-24"
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
        <div className="mx-auto max-w-container">
          {/* Headline only. The eyebrow and the subheadline were removed: the
              table underneath says what the section is faster than a paragraph
              above it can. */}
          <Reveal className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
            <h2 className="text-[26px] font-extrabold leading-[1.1] tracking-tight text-brand-ink sm:text-[40px]">
              Everything Multiply OS{" "}
              <span className="relative whitespace-nowrap">
                replaces.
                <svg className="absolute -bottom-2 left-0 h-3 w-full text-brand-orange" viewBox="0 0 120 12" preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" aria-hidden="true">
                  <path d="M3 8c26-5 74-6 114-3" />
                </svg>
              </span>
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <StackTable />
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mx-auto mt-4 max-w-2xl text-center text-[11.5px] leading-relaxed text-brand-gray">
              Comparison uses each vendor&rsquo;s entry level paid plan at monthly list pricing for a team of ten, checked {AS_OF}.
              Vendors change their pricing, so treat these as indicative rather than quoted.
              All trademarks belong to their owners.
            </p>
          </Reveal>

          <Reveal delay={0.2} className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={openDemo}
              className="inline-flex w-full max-w-[420px] items-center justify-center gap-2.5 rounded-lg bg-brand-orange px-10 py-3.5 text-[15px] font-semibold text-white shadow-[0_12px_30px_-10px_rgba(234,123,27,0.85)] transition-colors hover:bg-brand-orange-dark sm:w-auto sm:min-w-[300px]"
            >
              Request a Demo
              <Arrow className="h-[17px] w-[17px]" />
            </button>
          </Reveal>
        </div>
      </section>
      <section className="px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-container">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-[26px] font-extrabold leading-[1.1] tracking-tight text-brand-ink sm:text-[38px]">
              What the AI costs, and what it returns.
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-brand-charcoal">
              Usage is metered rather than a flat fee, so the number below moves with your team.
            </p>
          </Reveal>

          {/* calculator leads, explainer follows: the interactive thing earns the wider column */}
          <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:gap-12 sm:mt-10">
            <Reveal>
              <Calculator />
            </Reveal>
            <Reveal delay={0.1}>
              <BillingFacts />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-t border-[#EFECE6] bg-[#FBFAF8] px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-container">
          <Reveal className="mb-8 text-center sm:mb-10">
            <h2 className="text-[26px] font-extrabold leading-[1.1] tracking-tight text-brand-ink sm:text-[38px]">
              Frequently asked questions
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
