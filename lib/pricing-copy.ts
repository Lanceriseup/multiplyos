// The words on the pricing v2 page: plan cards, the HQ add-ons, the setup
// packages, the comparison table and the FAQ.
//
// Source of the copy: direction A of the MOS Pricing Rollout map (chief-of-staff
// repository, references/mos-pricing-restructure/pricing-rollout.html). Every
// dollar figure is built from pricing-tiers.ts, so a price is never typed twice.
//
// Pure data and pure functions only, so node:test can import it. Used only by
// PricingTiersPage, so it is not part of any page while the pricing v2 switch is
// off.
import type { PlanId } from "@/lib/pricing-tiers";
import {
  AI_MONTHLY_CAP_DEFAULT,
  FORMS_ADDON_PRICE_PER_MONTH,
  GROW_ADDON_PRICE_PER_MONTH,
  HQ_PRICE_PER_MONTH,
  SETUP_PRICE,
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
    included: "Included with MULTIPLY",
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

const launchValue = money(SETUP_PRICE.launch);

// ---------------------------------------------------------------- plan cards

export type PlanCopy = { name: string; who: string; lead: string | null; items: readonly string[] };

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
      `Launch onboarding included (${launchValue} value)`,
      "Additional businesses at 25% off",
      "Expanded AI connections",
      "Unlimited websites",
    ],
  },
};

// ---------------------------------------------------------------- compare table

// true is a tick, false is a dash, a string is shown as written.
export type FeatureValue = boolean | string;
export type FeatureRow = {
  name: string;
  note?: string;
  // Shown beside the name while a feature is not released yet.
  tag?: string;
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
  extra: { note?: string; tag?: string } = {},
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
      row("Launch onboarding", N, N, "Included", { note: `${launchValue} value` }),
    ],
  },
];

const readsTheSameEverywhere = (r: FeatureRow) => r.values[0] === r.values[1] && r.values[1] === r.values[2];

// The rows the compare table shows. With differencesOnly the rows that read the
// same on every plan are dropped, and so is any group left with no rows.
export function visibleFeatureGroups(differencesOnly: boolean): FeatureGroup[] {
  if (!differencesOnly) return [...FEATURE_GROUPS];
  return FEATURE_GROUPS.map((g) => ({ ...g, rows: g.rows.filter((r) => !readsTheSameEverywhere(r)) })).filter(
    (g) => g.rows.length > 0,
  );
}

// ---------------------------------------------------------------- FAQ

export type FaqItem = { q: string; a: string };

export const FAQ: readonly FaqItem[] = [
  {
    q: "Do I need a credit card to start the trial?",
    a: "Yes. Nothing is charged during the 14 days, and we email you three days before your trial ends. Cancel any time before then in Settings, Billing.",
  },
  {
    q: "What happens when my trial ends?",
    a: "Your plan starts and we charge the card on file for the people on your account. You can switch plans or move between annual and monthly before then.",
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
    q: "Can I change plans later?",
    a: "Yes. Upgrades take effect right away and the difference is prorated. Downgrades take effect at your next renewal.",
  },
  {
    q: "Can you set it up for us?",
    a: `Yes. Setup packages start at ${launchValue} for teams up to 10, and MULTIPLY includes Launch onboarding.`,
  },
];
