// The words on the pricing v2 page: plan cards, the HQ add-ons, the setup
// packages, the comparison table, the FAQ and the page metadata.
//
// Source of the copy: direction A of the MOS Pricing Rollout map (chief-of-staff
// repository, references/mos-pricing-restructure/pricing-rollout.html). Every
// dollar figure is built from pricing-tiers.ts, so a price is never typed twice.
//
// Two modes. With annual billing on, the page offers Annual and Monthly, and
// Launch onboarding is included with ANNUAL MULTIPLY only (spec decision D2, the
// app's multiplyLaunchIncluded: "annual_only"). With annual billing off, the
// site launches monthly only (the app blocks annual checkout until counsel
// approves the annual consent text), and nothing on the page may mention annual
// billing or say Launch is included. The functions below (planItems,
// visibleFeatureGroups, visibleSetupPackages, faqItems, pricingMeta) are how the
// page asks for the right words in the mode it is built in.
//
// Pure data and pure functions only, so node:test can import it. Used only by the
// pricing v2 page, so it is not part of any page while the switch is off.
import type { Billing, PlanId } from "@/lib/pricing-tiers";
import {
  AI_MONTHLY_CAP_DEFAULT,
  FORMS_ADDON_PRICE_PER_MONTH,
  GROW_ADDON_PRICE_PER_MONTH,
  HQ_PRICE_PER_MONTH,
  PLAN_ORDER,
  PRICE_PER_USER_MONTH,
  SETUP_PRICE,
  TRIAL_DAYS,
  lowestPrice,
  money,
} from "@/lib/pricing-tiers";

// ---------------------------------------------------------------- add-ons

export type HqAddon = { name: string; blurb: string; comingSoon?: string };

export const HQ_ADDONS: readonly HqAddon[] = [
  { name: "Contractor HQ", blurb: "Jobs, crews, estimates, invoices and signatures for service businesses" },
  { name: "Inventory HQ", blurb: "Items, stock levels, reorder points and transfers between locations" },
  { name: "Events HQ", blurb: "Registration, attendee management and event portals" },
  {
    name: "Marketing HQ",
    blurb: "Campaign and funnel analytics across your ad and email accounts",
    comingSoon: "Coming Q1",
  },
];

// ---------------------------------------------------------------- setup packages

// `included` is a claim about annual billing (Launch comes with annual MULTIPLY),
// so visibleSetupPackages drops it while annual billing is off.
export type SetupPackage = { name: string; price: number; fit: string; items: readonly string[]; included?: string };

export const SETUP_PACKAGES: readonly SetupPackage[] = [
  {
    name: "LAUNCH",
    price: SETUP_PRICE.launch,
    fit: "Teams up to 10 · live in 7 to 14 days",
    items: [
      "Leadership scoreboard, 5 to 10 metrics",
      "Owner's Quarterly Execution Plan",
      "Org chart and 2 to 3 core SOPs",
      "One training call, 30 days of email support",
    ],
    included: "Included with MULTIPLY annual",
  },
  {
    name: "ACCELERATE",
    price: SETUP_PRICE.accelerate,
    fit: "11 to 30 people · 3 to 4 weeks",
    items: [
      "Company and 2 to 3 department scoreboards",
      "Leadership team plans",
      "Finance HQ connection, 5 to 10 SOPs",
      "Two training calls, 60 days of support",
    ],
  },
  {
    name: "MOMENTUM",
    price: SETUP_PRICE.momentum,
    fit: "20 to 100+ people · 3 to 4 months",
    items: [
      "Full scoreboard architecture",
      "Plans for up to 25 people, 15 to 20 SOPs",
      "5 custom AI Hubs",
      "A dedicated implementation lead for 6 months",
    ],
  },
];

// The packages as the page shows them: with annual billing off, no package says
// it is included with anything.
export function visibleSetupPackages(annualBilling: boolean): SetupPackage[] {
  if (annualBilling) return [...SETUP_PACKAGES];
  return SETUP_PACKAGES.map(({ included: _included, ...rest }) => rest);
}

const launchValue = money(SETUP_PRICE.launch);

// ---------------------------------------------------------------- plan cards

// A line on a plan card. A plain string shows on both billings; an object with
// onlyOn shows only on that billing.
export type PlanItem = string | { text: string; onlyOn: Billing };
export type PlanCopy = { name: string; who: string; lead: string | null; items: readonly PlanItem[] };

export const PLANS: Record<PlanId, PlanCopy> = {
  grow: {
    name: "GROW",
    who: "For lean teams getting organized",
    lead: null,
    items: [
      "3 scoreboards",
      "One Page Plan and Quarterly Execution Plan",
      "Leadership, team and 1-on-1 meetings",
      "Org chart",
      "Projects and tasks",
      "Multi AI and Hubs",
      "MOS Scribe meeting notes",
    ],
  },
  scale: {
    name: "SCALE",
    who: "For growing teams that run on systems",
    lead: "Everything in GROW, plus",
    items: [
      "Unlimited scoreboards",
      "SOP HQ",
      "Finance HQ and Banking Analytics",
      "CRM and pipelines",
      "Hiring and Training",
      "Websites, whiteboards and calendars",
      "SSO, API access and audit log",
    ],
  },
  multiply: {
    name: "MULTIPLY",
    who: "For companies running the whole system",
    lead: "Everything in SCALE, plus",
    items: [
      "Any 2 HQ modules included",
      // Launch onboarding is included with ANNUAL MULTIPLY only (spec D2).
      { text: `Launch onboarding included with annual billing (${launchValue} value)`, onlyOn: "annual" },
      "Additional businesses at 25% off",
      "Expanded AI connections",
      "Unlimited websites",
    ],
  },
};

// The lines on a plan's card at a billing interval, in the designed order.
export function planItems(plan: PlanId, billing: Billing): string[] {
  const out: string[] = [];
  for (const item of PLANS[plan].items) {
    if (typeof item === "string") out.push(item);
    else if (item.onlyOn === billing) out.push(item.text);
  }
  return out;
}

// ---------------------------------------------------------------- compare table

// true is a tick, false is a dash, a string is shown as written.
export type FeatureValue = boolean | string;
export type FeatureRow = {
  name: string;
  note?: string;
  // Shown beside the name while a feature is not released yet.
  tag?: string;
  // The row is about something that exists only on annual billing, so it is
  // hidden while annual billing is off.
  annualOnly?: boolean;
  // GROW, SCALE, MULTIPLY, in that order.
  values: readonly [FeatureValue, FeatureValue, FeatureValue];
};
export type FeatureGroup = { name: string; rows: readonly FeatureRow[] };

const Y = true;
const N = false;

function row(
  name: string,
  grow: FeatureValue,
  scale: FeatureValue,
  multiply: FeatureValue,
  extra: { note?: string; tag?: string; annualOnly?: boolean } = {},
): FeatureRow {
  return { name, ...extra, values: [grow, scale, multiply] };
}

const growAddon = `${money(GROW_ADDON_PRICE_PER_MONTH)}/mo add-on`;

export const FEATURE_GROUPS: readonly FeatureGroup[] = [
  {
    name: "The core",
    rows: [
      row("One Page Plan", Y, Y, Y),
      row("Scoreboards", "3", "Unlimited", "Unlimited"),
      row("Leadership meetings, team meetings and 1-on-1s", Y, Y, Y),
      row("Org chart", Y, Y, Y),
      row("Quarterly Execution Plan", Y, Y, Y),
      row("Projects and tasks", Y, Y, Y),
      row("Multi AI and Hubs", Y, "Adds interactive AI tools", "Adds expanded connections"),
      row("MOS Scribe", Y, Y, Y, { note: "Meeting recording and notes" }),
    ],
  },
  {
    name: "Business modules",
    rows: [
      row("SOP HQ", growAddon, Y, Y),
      row("Finance HQ and Banking Analytics", growAddon, Y, Y, { note: "Owner and CEO only" }),
      row("CRM and pipelines", N, Y, Y),
      row("Hiring", N, Y, Y),
      row("Training", N, Y, Y, { note: "Courses and lessons" }),
      row("Performance reviews and engagement surveys", N, Y, Y, { tag: "Coming Q4" }),
      row("Websites", N, "2 published", "Unlimited"),
      row(
        "Forms and e-signatures",
        `${money(FORMS_ADDON_PRICE_PER_MONTH)}/mo add-on`,
        "25 forms, 100 signatures",
        "Unlimited forms",
        { tag: "Coming soon" },
      ),
      row("Whiteboards", N, Y, Y),
      row("Calendars", N, Y, Y),
      row("Multicast screen recorder", N, Y, Y),
      row("SSO, API access and audit log", N, Y, Y),
    ],
  },
  {
    name: "Whole company",
    rows: [
      row(
        "HQ modules",
        `${money(HQ_PRICE_PER_MONTH)}/mo each`,
        `${money(HQ_PRICE_PER_MONTH)}/mo each`,
        "2 included",
        { note: "Contractor, Inventory, Events; Marketing coming Q1" },
      ),
      row("Additional businesses", "10% off", "10% off", "25% off"),
      // Launch onboarding is included with ANNUAL MULTIPLY only (spec D2).
      row("Launch onboarding", N, N, "Included on annual", { note: `${launchValue} value`, annualOnly: true }),
    ],
  },
];

const readsTheSameEverywhere = (r: FeatureRow) => r.values[0] === r.values[1] && r.values[1] === r.values[2];

// The rows the compare table shows. With differencesOnly the rows that read the
// same on every plan are dropped. With annual off, the rows about annual billing
// are dropped too. A group left with no rows is dropped.
export function visibleFeatureGroups({
  differencesOnly,
  annual,
}: {
  differencesOnly: boolean;
  annual: boolean;
}): FeatureGroup[] {
  return FEATURE_GROUPS.map((g) => ({
    ...g,
    rows: g.rows.filter((r) => (annual || !r.annualOnly) && !(differencesOnly && readsTheSameEverywhere(r))),
  })).filter((g) => g.rows.length > 0);
}

// ---------------------------------------------------------------- FAQ

// `a` is the answer when annual billing is on. aMonthlyOnly is the answer when
// the site launches monthly only, for the answers that would otherwise mention
// annual billing.
export type FaqItem = { q: string; a: string; aMonthlyOnly?: string };

export const FAQ: readonly FaqItem[] = [
  {
    q: "Do I need a credit card to start the trial?",
    a: "Yes. Nothing is charged during the 14 days, and we email you three days before your trial ends. Cancel any time before then in Settings, Billing.",
  },
  {
    q: "What happens when my trial ends?",
    a: "Your plan starts and we charge the card on file for the people on your account. You can switch plans or move between annual and monthly before then.",
    aMonthlyOnly:
      "Your plan starts and we charge the card on file for the people on your account. You can switch plans before then.",
  },
  {
    q: "Does everyone need the same plan?",
    a: "Yes. Your whole company is on one plan, so everyone works with the same tools. Add or remove users whenever someone joins or leaves.",
  },
  {
    q: "How does AI billing work?",
    a: `AI is metered and billed every two weeks on the card on file. You set a monthly cap, ${money(AI_MONTHLY_CAP_DEFAULT)} by default, and AI features pause when your team reaches it.`,
  },
  {
    // Deliberately says nothing about proration or when a downgrade takes effect:
    // those are open decisions (D18) and not built.
    q: "Can I change plans later?",
    a: "Yes. You can switch plans at any time, and your whole company moves to the new plan together.",
  },
  {
    q: "Can you set it up for us?",
    a: `Yes. Setup packages start at ${launchValue} for teams up to 10, and MULTIPLY on annual billing includes Launch onboarding.`,
    aMonthlyOnly: `Yes. Setup packages start at ${launchValue} for teams up to 10.`,
  },
];

// The questions and answers as the page shows them.
export function faqItems(annualBilling: boolean): { q: string; a: string }[] {
  return FAQ.map((f) => ({ q: f.q, a: annualBilling ? f.a : (f.aMonthlyOnly ?? f.a) }));
}

// ---------------------------------------------------------------- page metadata

// The description for search results and link previews, built from the price
// table at the billing the site leads with.
export function pricingMeta(billing: Billing): { description: string; short: string } {
  const [grow, scale, multiply] = PLAN_ORDER.map((p) => `${p.toUpperCase()} is ${money(PRICE_PER_USER_MONTH[p][billing])}`);
  const from = money(lowestPrice(billing));
  const trial = `${TRIAL_DAYS}-day free trial`;
  if (billing === "annual") {
    return {
      description: `Three plans, priced per user. ${grow}, ${scale} and ${multiply} per user a month on annual billing. Every plan starts with a ${trial}.`,
      short: `Three plans from ${from} per user a month, billed annually. Start a ${trial} on any plan.`,
    };
  }
  return {
    description: `Three plans, priced per user. ${grow}, ${scale} and ${multiply} per user a month, billed monthly. Every plan starts with a ${trial}.`,
    short: `Three plans from ${from} per user a month. Start a ${trial} on any plan.`,
  };
}
