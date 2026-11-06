"use client";

// The Contractor HQ feature page.
//
// Built November 2026 from thirty-four client screenshots of the module, the
// help center's Contractor HQ articles (the overview and the MOS ContractorHQ
// crew app) and Multi AI's own summary of it: a trades business run from the
// first phone call to the paid invoice.
//
// Work moves down the Contractor HQ menu in order, so the page has a band for
// that flow under the hero (Request, Quote, Job, Visit, Invoice), then six
// sections:
//
//   1. quotes      requests in from your website, quotes with cost beside price
//   2. client hub  what the client sees: requests, quotes, invoices, appointments
//   3. jobs        one-off and recurring jobs, visits, crews, and job costing
//   4. projects    phases on a dependency-driven schedule, measured to a baseline
//   5. crew app    MOS ContractorHQ on the phone, at the access level you set
//   6. get paid    invoicing closed jobs in one go, payments, expenses, time
//
// Multi AI's advice was to keep the page about what the contractor's own
// clients experience, so the client hub sits second and the quote demo shows
// both sides of one quote.
//
// Everything here traces to a screenshot or the help center text. No estimating
// claims: Settings → Estimating is off in the client's account, and nothing we
// were given shows Multi drafting an estimate. The crew app had no screenshots,
// so its section is drawn from the help center alone. See
// docs/contractor-hq-feature-notes.md.
import { motion } from "framer-motion";
import { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CTA from "./CTA";
import Reveal from "./Reveal";
import ContractorHqHeroTour from "./ContractorHqHeroTour";
import MultiAiWired from "./MultiAiWired";
import type { Row, Insight } from "./MultiAiWired";
import { useDemo } from "./DemoModal";
import { signupCta } from "@/lib/signup-cta";

const SIGNUP = signupCta();

// ---------------------------------------------------------------- tokens
const GOLD = "#9A7414"; // the module's own colour, from the navbar
const GREEN = "#1FA36A";
const APP_GREEN = "#1F9D55";
const AMBER = "#C9832B";
const BLUE = "#2F8FD8";
const NAVY = "#0F1B2D";
const RED = "#C0402B";
const ORANGE = "#EA7B1B";
const PINK = "#D6336C";
const AI = "#4B3CC4";
const INK = "#1B1A17";
const HAIR = "#ECEAE6";
const HAIR2 = "#E3E0DA";
const MUTED = "#8A867E";
const MUTED2 = "#A9A49B";

// The client hub is dark, as the client's screenshots of it are.
const HUB_BG = "#0F1521";
const HUB_CARD = "#151C2B";
const HUB_LINE = "#263045";
const HUB_MUTED = "#8E98AB";

const PANEL_GOLD = "linear-gradient(160deg, #F5EEDC, #EADDBC)";
const PANEL_STONE = "linear-gradient(160deg, #F2EEE7, #E7E0D4)";

const colTransition = { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const };
// One height at every width, as on the other HQ pages.
const CARD_CLS = "h-[440px]";

const money = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ---------------------------------------------------------------- icons
type IconProps = { className?: string; style?: React.CSSProperties };
type Ico = (p: IconProps) => React.JSX.Element;
const ico = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** The hard hat the navbar card and the app's Projects use. */
const HardHatIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M5.2 16.4v-1.9a6.8 6.8 0 0 1 13.6 0v1.9" />
    <path d="M10.2 8.3V6.4a1.8 1.8 0 0 1 3.6 0v1.9" />
    <path d="M3.4 16.4h17.2v1.6a1.2 1.2 0 0 1-1.2 1.2H4.6a1.2 1.2 0 0 1-1.2-1.2z" />
  </svg>
);
const TrayIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M4 13.4l2.4-7.2a1.6 1.6 0 0 1 1.5-1.1h8.2a1.6 1.6 0 0 1 1.5 1.1l2.4 7.2v4.8a1.6 1.6 0 0 1-1.6 1.6H5.6A1.6 1.6 0 0 1 4 18.2z" />
    <path d="M4 13.4h4.4l1.2 2.2h4.8l1.2-2.2H20" />
  </svg>
);
const DocIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M14 3.6H7.2a1.6 1.6 0 0 0-1.6 1.6v13.6a1.6 1.6 0 0 0 1.6 1.6h9.6a1.6 1.6 0 0 0 1.6-1.6V8z" />
    <path d="M14 3.6V8h4.4M9 12.6h6M9 16h4" />
  </svg>
);
const BriefcaseIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="3.6" y="7" width="16.8" height="12.4" rx="2" />
    <path d="M9 7V5.4A1.4 1.4 0 0 1 10.4 4h3.2A1.4 1.4 0 0 1 15 5.4V7M9 7v12.4M15 7v12.4" />
  </svg>
);
const CalIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="3.8" y="5" width="16.4" height="15" rx="2.4" />
    <path d="M3.8 9.6h16.4M8.2 3.2v3.4M15.8 3.2v3.4" />
  </svg>
);
const ReceiptIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="5" y="3.6" width="14" height="16.8" rx="1.8" />
    <path d="M8.6 8.4h6.8M8.6 12h6.8M8.6 15.6h4" />
  </svg>
);
const GlobeIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="12" cy="12" r="8.4" />
    <path d="M3.6 12h16.8M12 3.6c2.4 2.4 3.4 5.2 3.4 8.4s-1 6-3.4 8.4c-2.4-2.4-3.4-5.2-3.4-8.4s1-6 3.4-8.4z" />
  </svg>
);
const PhoneIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="6.6" y="2.8" width="10.8" height="18.4" rx="2.4" />
    <path d="M10.6 18h2.8" />
  </svg>
);
const ClockIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="12" cy="12" r="8.2" />
    <path d="M12 7.6V12l3 1.8" />
  </svg>
);
const CardIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="3.4" y="5.6" width="17.2" height="12.8" rx="2" />
    <path d="M3.4 10h17.2" />
  </svg>
);
const CameraIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M4.4 8.2h3l1.6-2.4h6l1.6 2.4h3a1.4 1.4 0 0 1 1.4 1.4v8.6a1.4 1.4 0 0 1-1.4 1.4H4.4A1.4 1.4 0 0 1 3 18.2V9.6a1.4 1.4 0 0 1 1.4-1.4z" />
    <circle cx="12" cy="13.4" r="3.2" />
  </svg>
);
const PinIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 20.6s-6.4-5.6-6.4-10.6a6.4 6.4 0 0 1 12.8 0c0 5-6.4 10.6-6.4 10.6z" />
    <circle cx="12" cy="10" r="2.2" />
  </svg>
);
const LockIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="4.6" y="10.4" width="14.8" height="9.8" rx="2" />
    <path d="M8 10.4V7.4a4 4 0 0 1 8 0v3" />
  </svg>
);
const BellIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M6.4 16.4V11a5.6 5.6 0 0 1 11.2 0v5.4l1.6 1.8H4.8zM10 20.4h4" />
  </svg>
);
const ShiftIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M4 8h12l-3-3M20 16H8l3 3" />
  </svg>
);
const Tick = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2.4}>
    <path d="M5 12l5 5L20 7" />
  </svg>
);
const Arrow = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M5 12h13M12.5 5.5L19 12l-6.5 6.5" />
  </svg>
);
const RowsIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="3.4" y="5" width="17.2" height="4.2" rx="1.4" />
    <rect x="3.4" y="14.8" width="17.2" height="4.2" rx="1.4" />
  </svg>
);

/** Small labelled header shared by every section card. */
function CardHead({ icon: I, title, right }: { icon: Ico; title: string; right?: React.ReactNode }) {
  return (
    <div className="flex flex-none items-center gap-2 border-b px-4 py-2.5" style={{ borderColor: HAIR }}>
      <I className="h-[15px] w-[15px] flex-none" style={{ color: GOLD }} />
      <span className="truncate text-[12.5px] font-bold">{title}</span>
      {right && <span className="ml-auto flex flex-none items-center gap-1.5">{right}</span>}
    </div>
  );
}

function Footnote({ icon: I, children }: { icon: Ico; children: React.ReactNode }) {
  return (
    <div className="mx-4 mb-4 flex flex-none items-center gap-2 rounded-[10px] border px-3 py-2 text-[10.5px]" style={{ borderColor: HAIR2, background: "#FBFAF8", color: MUTED }}>
      <I className="h-[12px] w-[12px] flex-none" style={{ color: GOLD }} />
      <span className="truncate">{children}</span>
    </div>
  );
}

function ActionButton({ onClick, done, children }: { onClick: () => void; done?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-[8px] py-1.5 text-[10.5px] font-bold transition-colors"
      style={done ? { background: "#EEECE8", color: MUTED } : { background: NAVY, color: "#fff" }}
    >
      {children}
    </button>
  );
}

type Tone = "green" | "amber" | "grey" | "red" | "blue";
const TONES: Record<Tone, { background: string; color: string }> = {
  green: { background: "#E3F4EA", color: "#1B7A45" },
  amber: { background: "#FCEFD9", color: "#9A5A12" },
  grey: { background: "#EEECE8", color: MUTED },
  red: { background: "#FBE4E1", color: "#B4322A" },
  blue: { background: "#E3EEFB", color: "#1F5F9E" },
};
function Pill({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-[2px] text-[10px] font-bold transition-colors duration-300" style={TONES[tone]}>
      <span className="h-[5px] w-[5px] rounded-full" style={{ background: "currentColor" }} />
      {children}
    </span>
  );
}

function Seg<T extends string>({ items, on, set }: { items: [T, string][]; on: T; set: (v: T) => void }) {
  return (
    <span className="inline-flex rounded-[9px] border bg-white p-[2px] text-[10.5px] font-semibold" style={{ borderColor: HAIR2 }}>
      {items.map(([k, l]) => (
        <button
          key={k}
          type="button"
          onClick={() => set(k)}
          aria-pressed={k === on}
          className="whitespace-nowrap rounded-[7px] px-2.5 py-[3px] transition-colors"
          style={k === on ? { background: NAVY, color: "#fff" } : { color: MUTED }}
        >
          {l}
        </button>
      ))}
    </span>
  );
}

const initials = (n: string) =>
  n
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

function Avatar({ n, size = 18 }: { n: string; size?: number }) {
  return (
    <span className="grid flex-none place-items-center rounded-full text-[7px] font-bold text-white" style={{ width: size, height: size, background: "#1D2B44" }}>
      {initials(n)}
    </span>
  );
}

// ---------------------------------------------------------------- 1. requests and quotes
// Quote #24, the same quote the hero tour sends and Elena Cruz approves.
const QUOTE_LINES = [
  { n: "Backsplash tile, supply (sq ft)", q: 32, cost: 6.5, price: 11 },
  { n: "Setting materials and grout", q: 1, cost: 85, price: 140 },
  { n: "Installation labor (hours)", q: 12, cost: 35, price: 85 },
  { n: "Outlet extenders and trim", q: 1, cost: 40, price: 95 },
];
const SUBTOTAL = QUOTE_LINES.reduce((s, l) => s + l.q * l.price, 0); // 1,607.00
const TAX = Math.round(SUBTOTAL * 0.0825 * 100) / 100; // 132.58
const TOTAL = SUBTOTAL + TAX; // 1,739.58
const TOTAL_COST = QUOTE_LINES.reduce((s, l) => s + l.q * l.cost, 0); // 753.00

function QuoteDemo() {
  const [side, setSide] = useState<"yours" | "client">("yours");
  const [answer, setAnswer] = useState<"none" | "approved" | "changes">("none");
  const client = side === "client";
  const status: [Tone, string] = answer === "approved" ? ["green", "Approved"] : answer === "changes" ? ["amber", "Changes requested"] : ["blue", "Awaiting response"];
  const cols = client ? "minmax(0,2.6fr) 0.5fr 0.9fr 0.9fr" : "minmax(0,2.2fr) 0.5fr 0.8fr 0.8fr 0.9fr";
  return (
    <div className={`relative flex flex-col overflow-hidden rounded-[18px] border bg-white ${CARD_CLS}`} style={{ borderColor: HAIR }}>
      <CardHead icon={DocIcon} title="Quote #24 · Kitchen backsplash" right={<Pill tone={status[0]}>{status[1]}</Pill>} />
      <div className="flex flex-none items-center gap-2 px-4 pt-3">
        <Seg
          items={[
            ["yours", "Your view"],
            ["client", "Elena's view"],
          ]}
          on={side}
          set={setSide}
        />
        <span className="ml-auto truncate text-[10px]" style={{ color: MUTED }}>
          Elena Cruz · from the client hub
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-4 pt-3">
        <div className="grid gap-x-2 border-b pb-1 text-[8.5px] font-bold uppercase tracking-[0.08em]" style={{ gridTemplateColumns: cols, borderColor: HAIR, color: MUTED2 }}>
          <span>Item</span>
          <span className="text-right">Qty</span>
          {!client && <span className="text-right">Cost</span>}
          <span className="text-right">Price</span>
          <span className="text-right">Total</span>
        </div>
        {QUOTE_LINES.map((l) => (
          <div key={l.n} className="grid items-center gap-x-2 border-b py-[5px] text-[10.5px] tabular-nums" style={{ gridTemplateColumns: cols, borderColor: HAIR }}>
            <span className="truncate font-medium">{l.n}</span>
            <span className="text-right">{l.q}</span>
            {!client && (
              <span className="text-right" style={{ color: MUTED }}>
                {money(l.cost)}
              </span>
            )}
            <span className="text-right">{money(l.price)}</span>
            <span className="text-right">{money(l.q * l.price)}</span>
          </div>
        ))}
        <div className="ml-auto mt-1.5 w-[230px] max-w-full text-[10.5px] tabular-nums">
          <div className="flex py-[1px]">
            <span style={{ color: MUTED }}>Subtotal</span>
            <span className="ml-auto">{money(SUBTOTAL)}</span>
          </div>
          <div className="flex py-[1px]">
            <span style={{ color: MUTED }}>Tax (8.25%)</span>
            <span className="ml-auto">{money(TAX)}</span>
          </div>
          <div className="mt-0.5 flex border-t pt-1 text-[12.5px] font-bold" style={{ borderColor: HAIR }}>
            Total<span className="ml-auto">{money(TOTAL)}</span>
          </div>
          {!client && (
            <div className="flex py-[1px]">
              <span style={{ color: MUTED }}>Total cost</span>
              <span className="ml-auto">{money(TOTAL_COST)}</span>
            </div>
          )}
        </div>

        {client && (
          <div className="mt-2 flex items-center gap-2 rounded-[10px] border px-3 py-1.5" style={{ borderColor: HAIR2 }}>
            {answer === "none" ? (
              <>
                <button type="button" onClick={() => setAnswer("approved")} className="rounded-[8px] px-3 py-1 text-[11px] font-bold text-white" style={{ background: APP_GREEN }}>
                  Approve
                </button>
                <button type="button" onClick={() => setAnswer("changes")} className="rounded-[8px] border px-3 py-1 text-[11px] font-bold" style={{ borderColor: HAIR2 }}>
                  Request changes
                </button>
              </>
            ) : (
              <span className="text-[10.5px] leading-snug">
                {answer === "approved" ? (
                  <>
                    <b>Approved.</b> <span style={{ color: MUTED }}>It moves to Approved in your Pipeline, ready to convert into a job.</span>
                  </>
                ) : (
                  <>
                    <b>Changes requested.</b> <span style={{ color: MUTED }}>Elena&rsquo;s note lands on the quote for you to revise.</span>
                  </>
                )}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mx-4 mb-3 mt-2 flex-none">
        <ActionButton
          onClick={() => {
            if (!client) setSide("client");
            else {
              setAnswer("none");
              setSide("yours");
            }
          }}
          done={client && answer !== "none"}
        >
          {client ? (answer === "none" ? "Back to your view" : "Start over") : "See it as Elena does"}
        </ActionButton>
      </div>
      <Footnote icon={LockIcon}>Your unit costs and internal notes never reach the client.</Footnote>
    </div>
  );
}

// ---------------------------------------------------------------- 2. client hub
type HubTab = "request" | "quotes" | "invoices" | "appointments";

function ClientHubDemo() {
  const [tab, setTab] = useState<HubTab>("quotes");
  const [sent, setSent] = useState(false);
  const [approved, setApproved] = useState(false);
  const [paid, setPaid] = useState(false);
  const [showTime, setShowTime] = useState(true);
  const tabs: [HubTab, string][] = [
    ["request", "New Request"],
    ["quotes", "Quotes"],
    ["invoices", "Invoices"],
    ["appointments", "Appointments"],
  ];
  return (
    <div className={`relative flex flex-col overflow-hidden rounded-[18px] border ${CARD_CLS}`} style={{ borderColor: HUB_LINE, background: HUB_BG, color: "#E8ECF3" }}>
      <div className="flex flex-none items-center gap-2 px-4 pb-2 pt-3">
        <span className="grid h-[22px] w-[22px] place-items-center rounded-[6px] text-[11px] font-extrabold" style={{ background: "#fff", color: "#1D2B44" }}>
          R
        </span>
        <span className="text-[12.5px] font-bold">Ridgeline Services</span>
        <span className="ml-auto truncate text-[10px]" style={{ color: HUB_MUTED }}>
          Signed in as Elena Cruz
        </span>
      </div>
      <div className="flex flex-none gap-1 overflow-hidden px-4">
        {tabs.map(([k, l]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            aria-pressed={tab === k}
            className="whitespace-nowrap rounded-[7px] px-2 py-[4px] text-[10.5px] font-semibold transition-colors"
            style={tab === k ? { background: HUB_CARD, color: "#fff", boxShadow: `inset 0 0 0 1px ${HUB_LINE}` } : { color: k === "request" ? "#3FCB7E" : HUB_MUTED }}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="mx-4 mt-2.5 min-h-0 flex-1 overflow-hidden rounded-[12px] border px-3.5 py-3" style={{ borderColor: HUB_LINE, background: HUB_CARD }}>
        {tab === "request" &&
          (sent ? (
            <div className="grid h-full place-items-center text-center">
              <div>
                <span className="mx-auto grid h-[34px] w-[34px] place-items-center rounded-full" style={{ background: "#1F9D5533", color: "#3FCB7E" }}>
                  <Tick className="h-[16px] w-[16px]" />
                </span>
                <div className="mt-2 text-[13px] font-bold">Request sent</div>
                <div className="mt-1 text-[10.5px]" style={{ color: HUB_MUTED }}>
                  It lands in Requests at Ridgeline Services.
                </div>
                <button type="button" onClick={() => setSent(false)} className="mt-3 text-[10.5px] font-semibold" style={{ color: "#3FCB7E" }}>
                  Send another
                </button>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col">
              <div className="text-[14px] font-bold">Get work done</div>
              <div className="text-[10px]" style={{ color: HUB_MUTED }}>
                Send us a request and we will get back to you.
              </div>
              <HubLabel>Service details</HubLabel>
              <div className="rounded-[7px] border px-2.5 py-1.5 text-[10.5px] leading-snug" style={{ borderColor: HUB_LINE, background: HUB_BG }}>
                Retile the kitchen backsplash, about 30 sq ft. Two outlets on that wall.
              </div>
              <HubLabel>Photos (3/10)</HubLabel>
              <div className="flex gap-1.5">
                {["#3B4A63", "#46566F", "#2F3D55"].map((c) => (
                  <span key={c} className="grid h-[34px] w-[44px] place-items-center rounded-[6px]" style={{ background: c, color: HUB_MUTED }}>
                    <CameraIcon className="h-[13px] w-[13px]" />
                  </span>
                ))}
              </div>
              <HubLabel>When are you available?</HubLabel>
              <div className="rounded-[7px] border px-2.5 py-1.5 text-[10.5px]" style={{ borderColor: HUB_LINE, background: HUB_BG }}>
                Weekday mornings
              </div>
              <button type="button" onClick={() => setSent(true)} className="mt-auto self-start rounded-[8px] px-3 py-1.5 text-[11px] font-bold text-white" style={{ background: APP_GREEN }}>
                Submit request
              </button>
            </div>
          ))}

        {tab === "quotes" && (
          <div className="flex h-full flex-col">
            <HubDocHead kind="Quote #24" sub="Kitchen backsplash" chip={approved ? "Approved" : "Awaiting response"} chipOn={approved} />
            {QUOTE_LINES.map((l) => (
              <div key={l.n} className="flex border-b py-[5px] text-[10.5px] tabular-nums" style={{ borderColor: HUB_LINE }}>
                <span className="min-w-0 flex-1 truncate">{l.n}</span>
                <span className="ml-2">{money(l.q * l.price)}</span>
              </div>
            ))}
            <div className="mt-1.5 flex text-[12.5px] font-bold tabular-nums">
              Total<span className="ml-auto">{money(TOTAL)}</span>
            </div>
            <div className="mt-auto flex gap-2 pt-2">
              {approved ? (
                <span className="text-[10.5px]" style={{ color: HUB_MUTED }}>
                  Thanks, Elena. We&rsquo;ll be in touch to schedule.{" "}
                  <button type="button" onClick={() => setApproved(false)} className="font-semibold" style={{ color: "#3FCB7E" }}>
                    Undo
                  </button>
                </span>
              ) : (
                <>
                  <button type="button" onClick={() => setApproved(true)} className="rounded-[8px] px-3 py-1.5 text-[11px] font-bold text-white" style={{ background: APP_GREEN }}>
                    Approve
                  </button>
                  <span className="rounded-[8px] border px-3 py-1.5 text-[11px] font-bold" style={{ borderColor: HUB_LINE }}>
                    Request changes
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {tab === "invoices" && (
          <div className="flex h-full flex-col">
            <HubDocHead kind="Invoice INV-0038" sub="Leaking kitchen faucet" chip={paid ? "Paid" : "Awaiting payment"} chipOn={paid} />
            {[
              ["Faucet cartridge and supply lines", 98.5],
              ["Labor (hours)", 127.5],
            ].map(([n, v]) => (
              <div key={n as string} className="flex border-b py-[5px] text-[10.5px] tabular-nums" style={{ borderColor: HUB_LINE }}>
                <span className="min-w-0 flex-1 truncate">{n as string}</span>
                <span className="ml-2">{money(v as number)}</span>
              </div>
            ))}
            <div className="mt-1.5 flex text-[10.5px] tabular-nums" style={{ color: HUB_MUTED }}>
              Tax<span className="ml-auto">{money(18.65)}</span>
            </div>
            <div className="flex text-[12.5px] font-bold tabular-nums">
              Balance due<span className="ml-auto">{money(paid ? 0 : 244.65)}</span>
            </div>
            <div className="mt-auto flex items-center gap-2 rounded-[9px] border px-2.5 py-2" style={{ borderColor: HUB_LINE }}>
              <span className="min-w-0 flex-1 text-[10px] leading-snug" style={{ color: HUB_MUTED }}>
                {paid ? "Paid by card. A receipt is on its way." : "Pay securely by card. You will be sent to our payment provider and back."}
              </span>
              <button
                type="button"
                onClick={() => setPaid((p) => !p)}
                className="flex-none rounded-[8px] px-3 py-1.5 text-[11px] font-bold"
                style={paid ? { background: HUB_LINE, color: HUB_MUTED } : { background: APP_GREEN, color: "#fff" }}
              >
                {paid ? "Undo" : `Pay ${money(244.65)}`}
              </button>
            </div>
          </div>
        )}

        {tab === "appointments" && (
          <div className="flex h-full flex-col">
            <div className="text-[13px] font-bold">Appointments</div>
            {[
              { d: "Fri, Nov 6", t: "8:00 AM – 12:00 PM", n: "Kitchen backsplash", s: "Upcoming" },
              { d: "Tue, Nov 3", t: "3:00 PM – 4:00 PM", n: "On-site assessment", s: "Completed" },
            ].map((a) => (
              <div key={a.n} className="mt-2 flex items-center gap-2.5 rounded-[9px] border px-2.5 py-2" style={{ borderColor: HUB_LINE }}>
                <CalIcon className="h-[15px] w-[15px] flex-none" style={{ color: HUB_MUTED }} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[11px] font-semibold">{a.n}</span>
                  <span className="block text-[10px]" style={{ color: HUB_MUTED }}>
                    {a.d}
                    {showTime ? ` · ${a.t}` : ""}
                  </span>
                </span>
                <span className="text-[9.5px] font-semibold" style={{ color: a.s === "Upcoming" ? "#7DB7F0" : HUB_MUTED }}>
                  {a.s}
                </span>
              </div>
            ))}
            <div className="mt-2 text-[10px] leading-snug" style={{ color: HUB_MUTED }}>
              Reminders go out by email the day before and by text an hour before.
            </div>
            <button
              type="button"
              onClick={() => setShowTime((s) => !s)}
              aria-pressed={showTime}
              className="mt-auto flex items-center gap-2 self-start rounded-[8px] border px-2.5 py-1 text-[10px] font-semibold"
              style={{ borderColor: HUB_LINE }}
            >
              <span className="relative h-[14px] w-[24px] rounded-full transition-colors" style={{ background: showTime ? APP_GREEN : HUB_LINE }}>
                <span className="absolute top-[2px] h-[10px] w-[10px] rounded-full bg-white transition-[left] duration-200" style={{ left: showTime ? 12 : 2 }} />
              </span>
              Your setting: show scheduled time
            </button>
          </div>
        )}
      </div>

      <div className="flex-none py-3 text-center text-[10px]" style={{ color: HUB_MUTED }}>
        Powered by <span className="font-semibold text-white/80">Multiply OS</span>
      </div>
    </div>
  );
}

function HubLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-1 mt-2.5 text-[10px] font-semibold">{children}</div>;
}

function HubDocHead({ kind, sub, chip, chipOn }: { kind: string; sub: string; chip: string; chipOn: boolean }) {
  return (
    <div className="mb-1.5 flex items-start">
      <div className="min-w-0">
        <div className="truncate text-[13px] font-bold">{kind}</div>
        <div className="truncate text-[10px]" style={{ color: HUB_MUTED }}>
          {sub}
        </div>
      </div>
      <span
        className="ml-auto flex-none rounded-full px-2 py-[2px] text-[9.5px] font-bold transition-colors"
        style={chipOn ? { background: "#1F9D5533", color: "#3FCB7E" } : { background: HUB_LINE, color: "#E8ECF3" }}
      >
        {chip}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------- 3. jobs
// Job #55, the deck job the hero tour later invoices. Labor is costed at $40 an
// hour per person; the expense is the one logged against the job on visit two.
const REVENUE = 2180;
const LINE_COSTS = 640;
const JOB_VISITS = [
  { n: "Replace boards", d: "Mon, Nov 2", t: "8:00 AM – 12:00 PM", hours: 8 },
  { n: "Sand and stain", d: "Tue, Nov 3", t: "8:00 AM – 3:00 PM", hours: 14 },
];

function JobDemo() {
  const [step, setStep] = useState(0);
  const hours = JOB_VISITS.slice(0, Math.min(step, 2)).reduce((s, v) => s + v.hours, 0);
  const labor = hours * 40;
  const expenses = step >= 2 ? 45.5 : 0;
  const cost = LINE_COSTS + labor + expenses;
  const profit = REVENUE - cost;
  const closed = step >= 3;
  const label = ["Complete visit 1", "Complete visit 2", "Close job", "Start over"][step];
  return (
    <div className={`relative flex flex-col overflow-hidden rounded-[18px] border bg-white ${CARD_CLS}`} style={{ borderColor: HAIR }}>
      <CardHead icon={BriefcaseIcon} title="Job #55 · Deck repair and stain" right={<Pill tone={closed ? "amber" : "green"}>{closed ? "Requires invoicing" : "Active"}</Pill>} />
      <div className="flex flex-none items-center gap-2 px-4 pt-3 text-[10.5px]">
        <span className="font-semibold">Noah Bennett</span>
        <span className="truncate" style={{ color: MUTED }}>
          · One-off job · Crew A
        </span>
        <span className="ml-auto flex gap-[3px]">
          <Avatar n="Marcus Hale" />
          <Avatar n="Sam Ortega" />
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-4 pt-3">
        <div className="text-[9px] font-bold uppercase tracking-[0.1em]" style={{ color: MUTED2 }}>
          Scheduled visits
        </div>
        <div className="mt-1 flex flex-col gap-1.5">
          {JOB_VISITS.map((v, i) => {
            const done = step > i;
            return (
              <div key={v.n} className="flex items-center gap-2.5 rounded-[9px] border px-3 py-[6px] transition-colors duration-300" style={{ borderColor: done ? `${GREEN}55` : HAIR, background: done ? "#F1FAF5" : "#fff" }}>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[11px] font-semibold" style={{ textDecoration: done ? "line-through" : undefined, color: done ? MUTED : INK }}>
                    {v.d} · {v.t}
                  </span>
                  <span className="block truncate text-[10px]" style={{ color: MUTED }}>
                    {v.n} · checklist and instructions attached
                  </span>
                </span>
                {done ? <Pill tone="green">Completed</Pill> : <Pill tone="grey">Upcoming</Pill>}
              </div>
            );
          })}
        </div>

        <div className="mt-3 rounded-[10px] border px-3 py-2" style={{ borderColor: HAIR2 }}>
          <div className="flex items-baseline text-[11px] font-bold">
            Total cost to date
            <span className="ml-auto tabular-nums">
              <span className="mr-1.5 text-[10px] font-semibold" style={{ color: MUTED }}>
                Profit
              </span>
              {money(profit)}
            </span>
          </div>
          <CostBar l="Revenue" v={REVENUE} max={REVENUE} c={GREEN} />
          <CostBar l="Cost" v={cost} max={REVENUE} c={ORANGE} />
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {[
              ["Line items", money(LINE_COSTS)],
              [`Labor · ${hours}h`, money(labor)],
              ["Expenses", money(expenses)],
            ].map(([a, b]) => (
              <div key={a} className="min-w-0 rounded-[7px] px-2 py-1" style={{ background: "#F6F4F0" }}>
                <div className="truncate text-[8.5px] font-bold uppercase tracking-[0.06em]" style={{ color: MUTED2 }}>
                  {a}
                </div>
                <div className="truncate text-[10.5px] font-semibold tabular-nums">{b}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-4 mb-3 mt-2 flex-none">
        <ActionButton onClick={() => setStep((s) => (s >= 3 ? 0 : s + 1))} done={closed}>
          {label}
        </ActionButton>
      </div>
      <Footnote icon={ReceiptIcon}>Closed jobs wait under Requires invoicing until they are billed.</Footnote>
    </div>
  );
}

function CostBar({ l, v, max, c }: { l: string; v: number; max: number; c: string }) {
  return (
    <div className="mt-1.5">
      <div className="flex text-[10px] tabular-nums">
        <span>{l}</span>
        <span className="ml-auto font-semibold">{money(v)}</span>
      </div>
      <div className="mt-[3px] h-[5px] overflow-hidden rounded-full" style={{ background: "#EEECE8" }}>
        <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${Math.min(100, (v / max) * 100)}%`, background: c }} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 4. projects
// Project #18, Owen Park's kitchen remodel, on a Monday-to-Friday work week
// from Mon Oct 26, 2026, with Thanksgiving set as a day off. Today is Wed Nov 4.
const HOLIDAYS = ["2026-11-26"];
const WORKDAYS: Date[] = (() => {
  const out: Date[] = [];
  const d = new Date(2026, 9, 26);
  while (out.length < 40) {
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (d.getDay() !== 0 && d.getDay() !== 6 && !HOLIDAYS.includes(iso)) out.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
})();
const fmt = (i: number) => WORKDAYS[i].toLocaleDateString("en-US", { month: "short", day: "numeric" });
const TODAY = 7;
const SPAN = 28;

type Item = { k: string; n: string; dur: number; after: string[]; who: string };
const PHASES: { n: string; items: Item[] }[] = [
  {
    n: "Demo and rough-in",
    items: [
      { k: "demo", n: "Demo", dur: 3, after: [], who: "Crew B" },
      { k: "plumb", n: "Plumbing rough-in", dur: 4, after: ["demo"], who: "Sub: plumber" },
      { k: "elec", n: "Electrical rough-in", dur: 3, after: ["demo"], who: "Sub: electrician" },
      { k: "insp", n: "Inspection", dur: 1, after: ["plumb", "elec"], who: "City inspector" },
    ],
  },
  { n: "Walls", items: [{ k: "dry", n: "Drywall", dur: 5, after: ["insp"], who: "Crew B" }] },
  {
    n: "Cabinets and tops",
    items: [
      { k: "cab", n: "Cabinets", dur: 4, after: ["dry"], who: "Marcus Hale" },
      { k: "top", n: "Countertops", dur: 3, after: ["cab"], who: "Theo Barnes" },
    ],
  },
  {
    n: "Finish",
    items: [
      { k: "back", n: "Backsplash", dur: 2, after: ["top"], who: "Sam Ortega" },
      { k: "punch", n: "Punch list", dur: 2, after: ["back"], who: "Marcus Hale" },
    ],
  },
];

/** Start each item the workday after everything it waits on ends; `delay` pushes Cabinets. */
function plan(delay: number) {
  const at: Record<string, { s: number; e: number }> = {};
  for (const ph of PHASES)
    for (const it of ph.items) {
      let s = it.after.length ? Math.max(...it.after.map((a) => at[a].e)) + 1 : 0;
      if (it.k === "cab") s += delay;
      at[it.k] = { s, e: s + it.dur - 1 };
    }
  return at;
}
const BASE = plan(0);

function ProjectDemo() {
  const [delayed, setDelayed] = useState(false);
  const [view, setView] = useState<"yours" | "client">("yours");
  const at = delayed ? plan(3) : BASE;
  const finish = at.punch.e;
  // The client's view has fewer, taller rows, so its labels get more room.
  const label = view === "client" ? 132 : 96;
  const x = (i: number) => `${(i / SPAN) * 100}%`;
  const w = (s: number, e: number) => `${((e - s + 1) / SPAN) * 100}%`;
  return (
    <div className={`relative flex flex-col overflow-hidden rounded-[18px] border bg-white ${CARD_CLS}`} style={{ borderColor: HAIR }}>
      <CardHead
        icon={HardHatIcon}
        title="Project #18 · Kitchen remodel"
        right={<Pill tone={delayed ? "red" : "green"}>{delayed ? "Behind baseline" : "On baseline"}</Pill>}
      />
      <div className="flex flex-none items-center gap-2 px-4 pt-3">
        <Seg
          items={[
            ["yours", "Your schedule"],
            ["client", "Owen's view"],
          ]}
          on={view}
          set={setView}
        />
        <span className="ml-auto text-right text-[10px] leading-tight" style={{ color: MUTED }}>
          Finish
          <span className="block text-[12px] font-bold tabular-nums" style={{ color: delayed ? RED : INK }}>
            {fmt(finish)}
            {delayed && <span className="ml-1 text-[9.5px] font-semibold line-through" style={{ color: MUTED2 }}>{fmt(BASE.punch.e)}</span>}
          </span>
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-4 pt-2.5">
        <div className="relative">
          {/* Today runs through every row. */}
          <span className="pointer-events-none absolute bottom-0 top-0 z-[1] w-[1.5px]" style={{ left: `calc(${label}px + (100% - ${label}px) * ${(TODAY + 0.5) / SPAN})`, background: RED }} />
          {view === "yours"
            ? PHASES.map((ph) => (
                <div key={ph.n}>
                  <div className="truncate pt-1 text-[8.5px] font-bold uppercase tracking-[0.08em]" style={{ color: MUTED2 }}>
                    {ph.n}
                  </div>
                  {ph.items.map((it) => {
                    const { s, e } = at[it.k];
                    const b = BASE[it.k];
                    const moved = s !== b.s;
                    const done = e < TODAY;
                    const live = s <= TODAY && e >= TODAY;
                    return (
                      <div key={it.k} className="grid h-[20px] grid-cols-[96px_1fr] items-center">
                        <span className="truncate pr-2 text-[10px]" style={{ color: done ? MUTED : INK }}>
                          {it.n}
                        </span>
                        <span className="relative h-full">
                          {moved && <span className="absolute top-[5px] h-[10px] rounded-[4px] border border-dashed" style={{ left: x(b.s), width: w(b.s, b.e), borderColor: MUTED2 }} />}
                          <span
                            className="absolute top-[5px] h-[10px] rounded-[4px] transition-[left] duration-500"
                            style={{ left: x(s), width: w(s, e), background: done ? "#A9D9BD" : live ? GREEN : moved ? "#E8A090" : "#C9D6E8" }}
                            title={`${it.n}: ${fmt(s)} – ${fmt(e)} · ${it.who}`}
                          />
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))
            : PHASES.map((ph) => {
                const s = Math.min(...ph.items.map((i) => at[i.k].s));
                const e = Math.max(...ph.items.map((i) => at[i.k].e));
                const days = ph.items.reduce((n, i) => n + i.dur, 0);
                const doneDays = ph.items.reduce((n, i) => n + Math.max(0, Math.min(i.dur, TODAY - at[i.k].s)), 0);
                const pct = Math.round((doneDays / days) * 100);
                return (
                  <div key={ph.n} className="grid grid-cols-[132px_1fr] items-center border-b py-3 last:border-b-0" style={{ borderColor: HAIR }}>
                    <span className="min-w-0 pr-2">
                      <span className="block truncate text-[10.5px] font-semibold">{ph.n}</span>
                      <span className="block text-[9.5px] tabular-nums" style={{ color: MUTED }}>
                        {fmt(s)} – {fmt(e)} · {pct}%
                      </span>
                    </span>
                    <span className="relative h-[12px]">
                      <span className="absolute top-0 h-[12px] overflow-hidden rounded-[4px] transition-[left] duration-500" style={{ left: x(s), width: w(s, e), background: "#DCE5F1" }}>
                        <span className="block h-full" style={{ width: `${pct}%`, background: GREEN }} />
                      </span>
                    </span>
                  </div>
                );
              })}
        </div>
      </div>

      <div className="mx-4 mb-3 mt-2 flex-none">
        <ActionButton onClick={() => setDelayed((d) => !d)} done={delayed}>
          {delayed ? "Undo" : "Cabinets slip 3 days: material delay"}
        </ActionButton>
      </div>
      <Footnote icon={view === "client" ? GlobeIcon : delayed ? ShiftIcon : BellIcon}>
        {view === "client"
          ? "Owen sees phases, dates and progress in his client hub."
          : delayed
            ? "Shift reason: Material delay. Dashed bars are the baseline."
            : "When an item is done, whoever has the next one is told they are up."}
      </Footnote>
    </div>
  );
}

// ---------------------------------------------------------------- 5. the crew app
// Marcus Hale's afternoon visit. He is a crew lead, so he sees the price; field
// crew would not.
const CHECKLIST = ["Power off at the panel", "Remove the old fan", "Install and test", "Clean up and haul away"];
const APP_STEPS = [
  { l: "Today and Schedule", d: "The day's visits and to-dos." },
  { l: "On my way", d: "Instructions and a checklist on the visit." },
  { l: "Start visit", d: "The clock switches from general time to the visit." },
  { l: "Photos with markup", d: "Arrows, circles and numbers on the photo." },
  { l: "Get paid", d: "Card, cash or check, if your company allows it." },
];

function CrewAppDemo() {
  const [step, setStep] = useState(0);
  const label = ["Open the 2:00 PM visit", "On my way", "Start visit", "Complete visit", "Get paid by card", "Start over"][step];
  const onVisit = step >= 3;
  return (
    <div className={`relative flex flex-col overflow-hidden rounded-[18px] border bg-white ${CARD_CLS}`} style={{ borderColor: HAIR }}>
      <CardHead icon={PhoneIcon} title="MOS ContractorHQ · Marcus Hale" right={<Pill tone="blue">Crew lead</Pill>} />
      <div className="flex min-h-0 flex-1 gap-4 px-4 pt-3">
        {/* The phone. */}
        <div className="mx-auto flex h-[268px] w-[176px] flex-none flex-col overflow-hidden rounded-[22px] border-[5px] sm:mx-0" style={{ borderColor: "#1D2B44", background: "#F7F6F3" }}>
          <div className="flex flex-none items-center px-2.5 py-1.5 text-[8.5px] font-bold text-white" style={{ background: "#1D2B44" }}>
            {step === 0 ? "Today · Wed, Nov 4" : "Bathroom fan replacement"}
          </div>
          <div className="flex flex-none items-center gap-1 px-2.5 py-[3px] text-[8px] font-semibold" style={{ background: onVisit ? "#E3F4EA" : "#EEECE8", color: onVisit ? "#1B7A45" : MUTED }}>
            <ClockIcon className="h-[9px] w-[9px]" />
            {onVisit ? "On the clock · this visit" : "Clocked in · general time"}
          </div>
          <div className="min-h-0 flex-1 overflow-hidden px-2 pt-2 text-[9px]">
            {step === 0 && (
              <>
                {[
                  { t: "8:00 AM", n: "Kitchen remodel", c: "Owen Park", s: "Completed" },
                  { t: "2:00 PM", n: "Bathroom fan replacement", c: "Maya Lindqvist", s: "Next" },
                ].map((v) => (
                  <div key={v.n} className="mb-1.5 rounded-[7px] border bg-white px-2 py-1.5" style={{ borderColor: v.s === "Next" ? APP_GREEN : HAIR }}>
                    <div className="font-bold">
                      {v.t} · {v.n}
                    </div>
                    <div style={{ color: MUTED }}>
                      {v.c} · {v.s}
                    </div>
                  </div>
                ))}
                <div className="mt-2 text-[8px] font-bold uppercase tracking-[0.08em]" style={{ color: MUTED2 }}>
                  To-dos
                </div>
                <div className="mt-1 rounded-[7px] border bg-white px-2 py-1.5" style={{ borderColor: HAIR }}>
                  Pick up the fan from the supply house
                </div>
              </>
            )}
            {step >= 1 && step <= 3 && (
              <>
                <div className="flex items-center gap-1" style={{ color: MUTED }}>
                  <PinIcon className="h-[9px] w-[9px] flex-none" />
                  <span className="truncate">15 Brushy Ridge Rd, Cedar Park</span>
                </div>
                <div className="mt-1 rounded-[7px] border bg-white px-2 py-1.5 leading-snug" style={{ borderColor: HAIR }}>
                  Hall bath. Maya works from home, so use the side door.
                </div>
                <div className="mt-1.5">
                  {CHECKLIST.map((c) => (
                    <div key={c} className="flex items-center gap-1.5 py-[2px]">
                      <span className="grid h-[10px] w-[10px] flex-none place-items-center rounded-[3px] border" style={step >= 3 ? { background: APP_GREEN, borderColor: APP_GREEN, color: "#fff" } : { borderColor: "#B9B4AA" }}>
                        {step >= 3 && <Tick className="h-[7px] w-[7px]" />}
                      </span>
                      {c}
                    </div>
                  ))}
                </div>
                {step >= 3 && (
                  <svg viewBox="0 0 150 62" className="mt-1.5 block w-full rounded-[6px]" style={{ background: "#3B4A63" }} aria-label="A photo of the new fan, marked up">
                    <rect x="52" y="14" width="44" height="34" rx="4" fill="#C9CFD9" />
                    <path d="M58 22h32M58 30h32M58 38h32" stroke="#8E98AB" strokeWidth="2" />
                    <circle cx="74" cy="31" r="25" fill="none" stroke="#F2B01E" strokeWidth="2.4" />
                    <path d="M128 10L102 26" stroke="#F2B01E" strokeWidth="2.4" strokeLinecap="round" />
                    <path d="M102 26l3-7M102 26l7-1" stroke="#F2B01E" strokeWidth="2.4" strokeLinecap="round" />
                    <circle cx="134" cy="8" r="6" fill="#F2B01E" />
                    <text x="134" y="11" textAnchor="middle" fontSize="8" fontWeight="700" fill="#1D2B44">
                      1
                    </text>
                  </svg>
                )}
                {step === 2 && (
                  <div className="mt-1.5 rounded-[6px] px-2 py-1 text-[8.5px] font-semibold" style={{ background: "#E3EEFB", color: "#1F5F9E" }}>
                    On my way
                  </div>
                )}
              </>
            )}
            {step >= 4 && (
              <div className="text-center">
                <div className="mt-2 text-[8.5px]" style={{ color: MUTED }}>
                  Get paid on this visit
                </div>
                <div className="text-[18px] font-extrabold tabular-nums">{money(378.88)}</div>
                <div className="mt-2 grid grid-cols-3 gap-1">
                  {["Card", "Cash", "Check"].map((m) => (
                    <span key={m} className="rounded-[6px] border py-1 font-semibold" style={m === "Card" && step === 5 ? { borderColor: APP_GREEN, background: "#E3F4EA", color: "#1B7A45" } : { borderColor: HAIR2, background: "#fff" }}>
                      {m}
                    </span>
                  ))}
                </div>
                {step === 5 && (
                  <div className="mt-3 flex items-center justify-center gap-1 font-bold" style={{ color: "#1B7A45" }}>
                    <Tick className="h-[11px] w-[11px]" />
                    Paid by card
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* What the app does, step by step. Hidden on a phone, where the card is too narrow. */}
        <div className="hidden min-w-0 flex-1 flex-col gap-1 sm:flex">
          {APP_STEPS.map((s, i) => {
            const at = Math.min(step, 4) === i;
            const done = i < Math.min(step, 4) || step === 5;
            return (
              <div key={s.l} className="rounded-[9px] border px-2.5 py-[6px] transition-colors duration-300" style={{ borderColor: at ? NAVY : HAIR, background: at ? "#F3F2EF" : "#fff" }}>
                <div className="flex items-center gap-1.5 text-[10.5px] font-semibold" style={{ color: done || at ? INK : MUTED }}>
                  {done && <Tick className="h-[10px] w-[10px] flex-none" style={{ color: GREEN }} />}
                  {s.l}
                </div>
                <div className="truncate text-[9.5px]" style={{ color: MUTED }}>
                  {s.d}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mx-4 mb-3 mt-2 flex-none">
        <ActionButton onClick={() => setStep((s) => (s >= 5 ? 0 : s + 1))} done={step === 5}>
          {label}
        </ActionButton>
      </div>
      <Footnote icon={LockIcon}>The app shows Contractor HQ only. Field crew see their own visits, without prices.</Footnote>
    </div>
  );
}

// ---------------------------------------------------------------- 6. get paid
const CLOSED = [
  { n: "55", t: "Deck repair and stain", c: "Noah Bennett", v: 2180 },
  { n: "57", t: "Dryer vent cleaning", c: "Hannah Reyes", v: 164 },
];
const RECEIVABLE = 2151.31;
const COLLECTED = 2906.4;

function InvoiceDemo() {
  const [picked, setPicked] = useState<string[]>([]);
  const [stage, setStage] = useState<0 | 1 | 2 | 3>(0);
  const toggle = (n: string) => setPicked((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]));
  const billed = CLOSED.filter((j) => picked.includes(j.n));
  const billedSum = billed.reduce((s, j) => s + j.v, 0);
  const noahPaid = stage === 3 && picked.includes("55");
  const receivable = RECEIVABLE + (stage >= 2 ? billedSum : 0) - (noahPaid ? 2180 : 0);
  const collected = COLLECTED + (noahPaid ? 2180 : 0);
  const next = () => {
    if (stage === 0) {
      if (picked.length) setStage(1);
    } else if (stage === 1) setStage(2);
    else if (stage === 2 && picked.includes("55")) setStage(3);
    else {
      setStage(0);
      setPicked([]);
    }
  };
  const label =
    stage === 0
      ? picked.length
        ? `Create ${picked.length} invoice${picked.length === 1 ? "" : "s"}`
        : "Select a closed job"
      : stage === 1
        ? `Send ${billed.length === 1 ? "it" : "both"}`
        : stage === 2
          ? picked.includes("55")
            ? "Noah pays online"
            : "Start over"
          : "Start over";
  return (
    <div className={`relative flex flex-col overflow-hidden rounded-[18px] border bg-white ${CARD_CLS}`} style={{ borderColor: HAIR }}>
      <CardHead icon={ReceiptIcon} title="Invoices" right={<span className="text-[10px] font-semibold" style={{ color: MUTED }}>Ridgeline Services</span>} />
      <div className="grid flex-none grid-cols-2 gap-2 px-4 pt-3">
        {[
          ["Receivable", money(receivable), "Open invoices", BLUE],
          ["Collected", money(collected), "Past 30 days", GREEN],
        ].map(([l, v, s, c]) => (
          <div key={l} className="rounded-[10px] border border-l-[3px] px-2.5 py-1.5" style={{ borderColor: HAIR, borderLeftColor: c }}>
            <div className="truncate text-[8.5px] font-bold uppercase tracking-[0.08em]" style={{ color: MUTED2 }}>
              {l} · {s}
            </div>
            <div className="text-[16px] font-bold tabular-nums">{v}</div>
          </div>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-4 pt-3">
        {stage === 0 ? (
          <div className="overflow-hidden rounded-[10px] border" style={{ borderColor: "#C9DAF1" }}>
            <div className="px-3 py-2" style={{ background: "#F5F8FD" }}>
              <div className="text-[11px] font-bold">Requires invoicing</div>
              <div className="text-[10px] leading-snug" style={{ color: MUTED }}>
                Select several to invoice them in one go, one draft per client.
              </div>
            </div>
            {CLOSED.map((j) => {
              const on = picked.includes(j.n);
              return (
                <button key={j.n} type="button" onClick={() => toggle(j.n)} aria-pressed={on} className="flex w-full items-center gap-2.5 border-t px-3 py-2 text-left" style={{ borderColor: "#DCE6F4" }}>
                  <span className="grid h-[14px] w-[14px] flex-none place-items-center rounded-full border transition-colors" style={on ? { background: APP_GREEN, borderColor: APP_GREEN, color: "#fff" } : { borderColor: "#B9B4AA" }}>
                    {on && <Tick className="h-[9px] w-[9px]" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[11px] font-semibold">
                      #{j.n} {j.t}
                    </span>
                    <span className="block text-[10px]" style={{ color: MUTED }}>
                      {j.c} · closed
                    </span>
                  </span>
                  <span className="text-[11px] font-semibold tabular-nums">{money(j.v)}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {billed.map((j, i) => {
              const paid = stage === 3 && j.n === "55";
              const [tone, s]: [Tone, string] = paid ? ["green", "Paid"] : stage >= 2 ? ["blue", "Awaiting payment"] : ["grey", "Draft"];
              return (
                <div key={j.n} className="flex items-center gap-2.5 rounded-[9px] border px-3 py-2" style={{ borderColor: paid ? `${GREEN}55` : HAIR }}>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[11px] font-semibold">
                      INV-00{43 + i} · {j.c}
                    </span>
                    <span className="block truncate text-[10px]" style={{ color: MUTED }}>
                      {j.t}
                    </span>
                  </span>
                  <span className="text-[11px] font-semibold tabular-nums">{money(j.v)}</span>
                  <Pill tone={tone}>{s}</Pill>
                </div>
              );
            })}
            {stage === 3 && picked.includes("55") && (
              <div className="mt-1 flex items-center gap-2 rounded-[9px] border px-3 py-2 text-[10.5px]" style={{ borderColor: HAIR2, background: "#FBFAF8" }}>
                <CardIcon className="h-[14px] w-[14px] flex-none" style={{ color: GOLD }} />
                <span className="min-w-0 flex-1 truncate">
                  <b>{money(2180)}</b> <span style={{ color: MUTED }}>· Card · paid online from the client hub</span>
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mx-4 mb-3 mt-2 flex-none">
        <ActionButton onClick={next} done={(stage === 0 && !picked.length) || label === "Start over"}>
          {label}
        </ActionButton>
      </div>
      <Footnote icon={BellIcon}>Optional reminders 3 days before, on, and 7 days after the due date.</Footnote>
    </div>
  );
}

// ---------------------------------------------------------------- the flow band
const FLOW = [
  { k: "Request", c: ORANGE, icon: TrayIcon, d: "Someone asking for work, from your request form, the client hub, or a call you log.", href: "#quotes" },
  { k: "Quote", c: PINK, icon: DocIcon, d: "The price you send. The client approves it online or asks for changes.", href: "#quotes" },
  { k: "Job", c: APP_GREEN, icon: BriefcaseIcon, d: "The work you won: one-off, recurring, or a project with a full schedule.", href: "#jobs" },
  { k: "Visit", c: BLUE, icon: CalIcon, d: "Crews on site, on the schedule, with instructions and checklists.", href: "#jobs" },
  { k: "Invoice", c: NAVY, icon: ReceiptIcon, d: "Getting paid, online from the client hub or collected on site.", href: "#get-paid" },
];

// ---------------------------------------------------------------- Multi AI
const AI_ROWS: Row[] = [
  { name: "Quote #22 · Gutter guards", value: "9 days waiting", hit: false, tone: "amber" },
  { name: "Kitchen remodel · Cabinets", value: "+3 days", hit: false, tone: "red" },
  { name: "INV-0042 · Samuel Ortiz", value: "Past due", hit: false, tone: "red" },
  { name: "Quote conversion", value: "68%", hit: true },
];

const AI_INSIGHTS: Insight[] = [
  {
    tag: "Quotes",
    color: AMBER,
    source: "Quote #22 · Gutter guards",
    text: "Grace Okafor's gutter guards quote has waited nine days without an answer, and quote follow-ups are switched off. Turning on the 2 and 5 day follow-ups covers this one and every quote after it.",
  },
  {
    tag: "Schedule",
    color: RED,
    source: "Kitchen remodel · Cabinets",
    text: "Cabinets slipped three workdays on a material delay, so Owen Park's kitchen now finishes Dec 2 instead of Nov 27. Countertops, backsplash and the punch list moved with it.",
  },
  {
    tag: "Cash",
    color: AI,
    source: "INV-0042 · Samuel Ortiz",
    text: "Samuel Ortiz's $1,150 fence repair invoice is past due, and payment reminders are off, so nothing has gone out since it was sent.",
  },
];

// ---------------------------------------------------------------- the page
export default function ContractorHqPage() {
  const { openDemo } = useDemo();

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* ------------------------------------------------ hero */}
      <section className="relative overflow-hidden px-5 pb-4 pt-6 sm:px-8 sm:pb-8 sm:pt-16">
        <div className="mx-auto max-w-container">
          <Reveal className="mx-auto max-w-4xl text-center">
            <span
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] sm:text-[12px]"
              style={{ borderColor: `${GOLD}33`, background: `${GOLD}0F`, color: GOLD }}
            >
              <HardHatIcon className="h-[14px] w-[14px] sm:h-[19px] sm:w-[19px]" />
              Contractor HQ
            </span>

            <h1 className="mt-5 text-[24px] font-extrabold leading-[1.1] tracking-tight text-brand-ink sm:mt-7 sm:text-[66px] sm:leading-[1.04]">
              From the first call
              <br />
              <span className="text-brand-orange">to the paid invoice.</span>
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-[14px] leading-relaxed text-brand-charcoal sm:mt-6 sm:text-[19px]">
              Contractor HQ runs a trades business in its own workspace: requests, quotes, jobs, crews on site and
              invoices. Your clients get a hub of their own to approve quotes, see their appointments and pay online.
            </p>
          </Reveal>

          <Reveal delay={0.12} className="mt-6 sm:mt-12">
            <div className="relative mx-auto max-w-[1120px]">
              <div className="overflow-hidden rounded-2xl p-2 sm:rounded-[30px] sm:p-8" style={{ background: PANEL_GOLD }}>
                <ContractorHqHeroTour />
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.2} className="mt-6 sm:mt-10">
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={openDemo}
                className="flex items-center justify-center gap-2 rounded-lg bg-brand-orange px-7 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-brand-orange-dark"
              >
                Request a Demo
                <Arrow className="h-[17px] w-[17px]" />
              </button>
              <a
                href={SIGNUP.href}
                className="border border-brand-orange/35 flex items-center justify-center gap-2 rounded-lg bg-white/70 px-7 py-3 text-base font-semibold text-brand-orange transition-colors hover:border-brand-orange/55 hover:bg-white sm:min-w-[170px]"
              >
                {SIGNUP.label}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------ the flow */}
      <section className="px-5 pb-4 pt-8 sm:px-8 sm:pt-14">
        <div className="mx-auto max-w-container">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-[13px] font-bold uppercase tracking-[0.14em] text-brand-orange-dark">The flow</p>
            <h2 className="text-[26px] font-extrabold leading-[1.1] tracking-tight text-brand-ink sm:text-[42px] sm:leading-[1.06]">
              Five steps, <span className="text-brand-orange">down one menu.</span>
            </h2>
            <p className="mt-4 text-[14px] leading-relaxed text-brand-charcoal sm:text-[17px]">
              Convert each one into the next, or skip ahead: straight to a job when a regular customer calls. Home shows
              what needs you today at every step.
            </p>
          </Reveal>
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {FLOW.map((f, i) => (
              <Reveal key={f.k} delay={0.05 * i}>
                <a href={f.href} className="group block h-full rounded-[18px] border bg-white p-5 transition-shadow hover:shadow-md" style={{ borderColor: HAIR }}>
                  <div className="flex items-center">
                    <span className="grid h-[34px] w-[34px] place-items-center rounded-[10px] text-white" style={{ background: f.c }}>
                      <f.icon className="h-[18px] w-[18px]" />
                    </span>
                    <span className="ml-auto font-mono text-[12px]" style={{ color: MUTED2 }}>
                      0{i + 1}
                    </span>
                  </div>
                  <div className="mt-4 text-[13px] font-bold uppercase tracking-[0.12em]" style={{ color: "#5C5852" }}>
                    {f.k}
                  </div>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-brand-charcoal">{f.d}</p>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ 1. requests and quotes */}
      <Section
        id="quotes"
        eyebrow="Requests and quotes"
        title={
          <>
            Clear quotes,
            <br className="hidden sm:block" /> <span className="text-brand-orange">approved online.</span>
          </>
        }
        body="Requests come in from a form on your website, your Google Business Profile or a link you share, with the client's photos and when they're free. Book an on-site assessment, convert the request into a quote, and send it."
        points={[
          "A request form you link to or paste into your site; new people become leads",
          "Line items from your price list, with your cost beside the price the client sees",
          "Clients approve online or ask for changes, and you can require a signature",
          "Optional follow-ups 2 and 5 days after sending, and a Pipeline from draft to won",
        ]}
        visual={<QuoteDemo />}
        panel={PANEL_GOLD}
      />

      {/* ------------------------------------------------ 2. client hub */}
      <Section
        id="client-hub"
        eyebrow="Client hub"
        title={
          <>
            Your clients see it all,
            <br className="hidden sm:block" /> <span className="text-brand-orange">in one place.</span>
          </>
        }
        body="Every client gets a hub with your name on it. They open it from a link or sign in with their email, then send requests, approve quotes, check their appointments and pay their invoices."
        points={[
          "Requests, quotes, invoices and appointments, plus Contact Us and Refer a Friend",
          "Pay by card: the client goes to your payment provider and back, and payouts land in your bank",
          "Visit and assessment reminders by email the day before and by text an hour before",
          "Show the scheduled time, or only the date if you work to an arrival window",
        ]}
        visual={<ClientHubDemo />}
        flip
        panel={PANEL_STONE}
      />

      {/* ------------------------------------------------ 3. jobs and the schedule */}
      <Section
        id="jobs"
        eyebrow="Jobs and the schedule"
        title={
          <>
            Crews on site,
            <br className="hidden sm:block" /> <span className="text-brand-orange">costs on the job.</span>
          </>
        }
        body="A job is One-off, a single visit or a few, or Recurring, with visits that repeat on a rule like a monthly clean. Put the visits on the schedule, assign a crew, and watch revenue, cost and profit add up as the work gets done."
        points={[
          "Month, Week, Day and Map views, Find a Time, and a list of work still to schedule",
          "Crews you assign as one, checklists and instructions on each visit, and arrival windows",
          "A live dispatch map: visits done, who's on the clock, and visits at risk",
          "Job costs from line items, labor and expenses, with a CSV for every job",
        ]}
        visual={<JobDemo />}
        panel={PANEL_GOLD}
      />

      {/* ------------------------------------------------ 4. projects */}
      <Section
        id="projects"
        eyebrow="Projects"
        title={
          <>
            Build to a schedule,
            <br className="hidden sm:block" /> <span className="text-brand-orange">finish what you start.</span>
          </>
        }
        body="For remodels and new builds, a Project plans the work in phases, and each item starts when the ones before it finish. Move one item and everything after it moves too, measured against the baseline you set."
        points={[
          "Start from a blank schedule or a template, with your work week, holidays and extra workdays",
          "Every move records a reason: weather, a late client selection, a material delay, an inspection",
          "When an item is done, whoever has the next one is told they're up, with their start date",
          "List, Timeline and Health views across projects, and the schedule in each client's hub",
        ]}
        visual={<ProjectDemo />}
        flip
        panel={PANEL_STONE}
      />

      {/* ------------------------------------------------ 5. the crew app */}
      <Section
        id="crew-app"
        eyebrow="The crew app"
        title={
          <>
            The whole job,
            <br className="hidden sm:block" /> <span className="text-brand-orange">in their pocket.</span>
          </>
        }
        body="MOS ContractorHQ is a phone app for work on site. Your team signs in with their Multiply OS account and sees Contractor HQ only, so a lost phone is not a key to the rest of the company. What each person can do follows their access level."
        points={[
          "Today and Schedule, On my way and Complete visit, with time that follows the visit",
          "Photos marked up with arrows, circles, labels and numbers, plus notes, to-dos and expenses",
          "Clients sign change orders and selections on the screen, right on site",
          "Walkthroughs recorded even with the screen locked, and work saved with no signal",
        ]}
        visual={<CrewAppDemo />}
        panel={PANEL_GOLD}
      />

      {/* ------------------------------------------------ 6. get paid */}
      <Section
        id="get-paid"
        eyebrow="Invoices and payments"
        title={
          <>
            Close the job,
            <br className="hidden sm:block" /> <span className="text-brand-orange">get paid.</span>
          </>
        }
        body="Closed jobs wait under Requires invoicing until they're billed. Pick several and invoice them in one go, one draft per client. Clients pay online from the hub, or you record a check, cash, a transfer or the card reader."
        points={[
          "Expenses logged against a job, with receipts and who is owed a reimbursement",
          "Timesheets by day or week, with an approval step and a CSV export",
          "Insights on lead conversion, quote value, scheduled job value, and recurring against one-off work",
          "Four access levels, from field crew who see no prices to managers who see everything",
        ]}
        visual={<InvoiceDemo />}
        flip
        panel={PANEL_STONE}
      />

      {/* ------------------------------------------------ Multi AI (always last) */}
      <MultiAiWired
        heading="Your jobs, read by"
        swash="an operations manager."
        intro="Ask Multi sits in the top bar of Contractor HQ. Ask what needs attention and it answers from your quotes, schedules and invoices, naming the client, the job and what to do next."
        leftLabel="What your team keeps in Contractor HQ"
        leftColor={GOLD}
        leftIcon={RowsIcon}
        rightLabel="What Multi AI finds in it"
        prompt="What should I chase this week?"
        panelTitle="Contractor HQ · Needs attention"
        panelMeta="4 items"
        panelDot={GOLD}
        rows={AI_ROWS}
        insights={AI_INSIGHTS}
        aiMeta="reading 40 jobs"
        footer="Multi AI reads the same quotes, jobs and invoices your team already keeps. Nothing to export before you can ask."
      />

      <CTA />
      <Footer />
    </main>
  );
}

// ---------------------------------------------------------------- Section
function Section({
  id,
  eyebrow,
  title,
  body,
  points,
  visual,
  flip,
  panel,
}: {
  id: string;
  eyebrow: string;
  title: React.ReactNode;
  body: string;
  points: string[];
  visual: React.ReactNode;
  flip?: boolean;
  panel: string;
}) {
  return (
    <section id={id} className="scroll-mt-24 px-5 py-10 sm:px-8 sm:py-20">
      <div className="mx-auto grid max-w-container grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={colTransition}
          className={`min-w-0 text-center lg:text-left ${flip ? "lg:order-2" : ""}`}
        >
          <p className="mb-4 text-[13px] font-bold uppercase tracking-[0.14em] text-brand-orange-dark">{eyebrow}</p>
          <h2 className="text-[26px] font-extrabold leading-[1.1] tracking-tight text-brand-ink sm:text-[42px] sm:leading-[1.06]">
            {title}
          </h2>
          <p className="mt-4 text-[14px] leading-relaxed text-brand-charcoal sm:mt-5 sm:text-[17px]">{body}</p>
          <ul className="mt-5 flex flex-col items-center gap-2.5 sm:gap-3 lg:items-start">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-left text-[13.5px] text-brand-ink sm:text-[15px]">
                <Tick className="mt-[3px] h-[17px] w-[17px] flex-none" style={{ color: GREEN }} />
                {p}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ ...colTransition, delay: 0.08 }}
          // min-w-0: a grid item defaults to min-width:auto, so a visual that
          // cannot shrink below its content pushes the whole track wider than
          // the screen on a phone.
          className={`min-w-0 ${flip ? "lg:order-1" : ""}`}
        >
          <div className="overflow-hidden rounded-2xl p-2 sm:rounded-[26px] sm:p-6" style={{ background: panel }}>
            {visual}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
