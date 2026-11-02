"use client";

// The Inventory HQ feature page.
//
// Built November 2026 from seventeen client screenshots of the module, the help
// center's Inventory HQ articles (overview, sales channels, importing) and
// Multi AI's own summary of it: one pool of stock for what you sell and what
// you take to events.
//
// Like Events HQ, it is a whole department rather than a single tool, so the
// page runs to five sections, in the order stock moves through a business:
//
//   1. stock          every SKU, the five numbers per item, and a history
//                     that cannot be edited
//   2. purchasing     reorder points, drafting a PO from a shortfall,
//                     receiving, and branding holds
//   3. orders         the order board, and Shopify, ShipStation and webhooks
//   4. events         kits, holding stock for Events HQ events, and gear that
//                     goes out and comes back
//   5. counts         cycle counts, the forecast and the alerts
//
// Everything here traces to a screenshot or to the help center text. Nothing
// about limits or pricing is claimed. See docs/inventory-hq-feature-notes.md.
//
// No "This replaces" chip: the help center imports a Sortly export, but the
// client has not said Inventory HQ replaces Sortly, and the other pages only
// show a chip when they have.
import { motion } from "framer-motion";
import { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CTA from "./CTA";
import Reveal from "./Reveal";
import InventoryHqHeroTour from "./InventoryHqHeroTour";
import MultiAiWired from "./MultiAiWired";
import type { Row, Insight } from "./MultiAiWired";
import { useDemo } from "./DemoModal";
import { signupCta } from "@/lib/signup-cta";

const SIGNUP = signupCta();

// ---------------------------------------------------------------- tokens
const TEAL = "#2F6F8F"; // the module's own colour, from the navbar
const GREEN = "#1FA36A";
const AMBER = "#C9832B";
const BLUE = "#2F7FD1";
const NAVY = "#0F1B2D";
const RED = "#C0402B";
const AI = "#4B3CC4";
const INK = "#1B1A17";
const HAIR = "#ECEAE6";
const HAIR2 = "#E3E0DA";
const MUTED = "#8A867E";
const MUTED2 = "#A9A49B";

const PANEL_COOL = "linear-gradient(160deg, #E3EEF2, #CFE0E8)";
const PANEL_STONE = "linear-gradient(160deg, #F2EEE7, #E7E0D4)";

const colTransition = { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const };
// One height at every width, as on the Events HQ page.
const CARD_CLS = "h-[440px]";

// ---------------------------------------------------------------- icons
type IconProps = { className?: string; style?: React.CSSProperties };
const ico = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Inventory HQ's own mark in the app: three boxes, two below and one on top. */
const BoxesIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42z" />
    <path d="M7 16.5l-4.74-2.85M7 16.5l5-3M7 16.5v5.17" />
    <path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3z" />
    <path d="M17 16.5l-5-3M17 16.5l4.74-2.85M17 16.5v5.17" />
    <path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8z" />
    <path d="M12 8L7.26 5.15M12 8l4.74-2.85M12 13.5V8" />
  </svg>
);
const Tick = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2.4}>
    <path d="M5 12l5 5L20 7" />
  </svg>
);
const Arrow = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M5 12h13M12.5 5.5L19 12l-6.5 6.5" />
  </svg>
);
const TruckIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M3 6.4h10.4v9.4H3zM13.4 9.6h4l3 3.2v3h-7" />
    <circle cx="7" cy="17.4" r="1.8" />
    <circle cx="16.8" cy="17.4" r="1.8" />
  </svg>
);
const CartIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M3.4 4.4h2.4l2 10.4h10.4l1.8-7.2H6.6" />
    <circle cx="9.2" cy="18.8" r="1.4" />
    <circle cx="17" cy="18.8" r="1.4" />
  </svg>
);
const CalDaysIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="3.8" y="5" width="16.4" height="15" rx="2.4" />
    <path d="M3.8 9.6h16.4M8.2 3.2v3.4M15.8 3.2v3.4" />
    <path d="M8 13.2h.01M12 13.2h.01M16 13.2h.01M8 16.6h.01M12 16.6h.01M16 16.6h.01" strokeWidth={2.4} />
  </svg>
);
const ClipboardIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="5" y="4.6" width="14" height="16" rx="2" />
    <path d="M9 4.6V3.4h6v1.2M8.6 11.4l2 2 4-4" />
  </svg>
);
const LockIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="4.6" y="10.4" width="14.8" height="9.8" rx="2" />
    <path d="M8 10.4V7.4a4 4 0 0 1 8 0v3" />
  </svg>
);
const WarnIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 4l9 15.6H3z" />
    <path d="M12 10v4M12 17h.01" />
  </svg>
);
const PlugIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M9 3.6v4.2M15 3.6v4.2M6.6 7.8h10.8v3a5.4 5.4 0 0 1-10.8 0zM12 16.2v4.2" />
  </svg>
);
const RowsIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="3.4" y="5" width="17.2" height="4.2" rx="1.4" />
    <rect x="3.4" y="14.8" width="17.2" height="4.2" rx="1.4" />
  </svg>
);

/** Small labelled header shared by every section card. */
function CardHead({
  icon: Ico,
  title,
  right,
}: {
  icon: (p: IconProps) => React.JSX.Element;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-none items-center gap-2 border-b px-4 py-2.5" style={{ borderColor: HAIR }}>
      <Ico className="h-[15px] w-[15px] flex-none" style={{ color: TEAL }} />
      <span className="truncate text-[12.5px] font-bold">{title}</span>
      {right && <span className="ml-auto flex flex-none items-center gap-1.5">{right}</span>}
    </div>
  );
}

/** A row of segmented tabs inside a card. `s` is the label on a phone. */
function CardTabs<K extends string>({ tabs, value, onChange }: { tabs: readonly { k: K; l: string; s?: string }[]; value: K; onChange: (k: K) => void }) {
  return (
    <div className="flex flex-none gap-1 px-4 pt-3">
      {tabs.map((t) => (
        <button
          key={t.k}
          type="button"
          onClick={() => onChange(t.k)}
          className="flex-1 truncate rounded-[8px] px-2 py-1.5 text-[10.5px] font-semibold transition-colors"
          style={value === t.k ? { background: NAVY, color: "#fff" } : { background: "#F3F1EC", color: MUTED }}
        >
          <span className="hidden sm:inline">{t.l}</span>
          <span className="sm:hidden">{t.s ?? t.l}</span>
        </button>
      ))}
    </div>
  );
}

function Footnote({ icon: Ico, children }: { icon: (p: IconProps) => React.JSX.Element; children: React.ReactNode }) {
  return (
    <div className="mx-4 mb-4 flex flex-none items-center gap-2 rounded-[10px] border px-3 py-2 text-[10.5px]" style={{ borderColor: HAIR2, background: "#FBFAF8", color: MUTED }}>
      <Ico className="h-[12px] w-[12px] flex-none" style={{ color: TEAL }} />
      <span className="truncate">{children}</span>
    </div>
  );
}

// ---------------------------------------------------------------- 1. stock
// One item, five sizes. The numbers match the hero tour's Event T-shirt.
const VARIANTS = [
  { k: "S", on: 48, al: 1, res: 20, inb: 0, low: 30, rec: 20 },
  { k: "M", on: 120, al: 3, res: 44, inb: 100, low: 60, rec: 50 },
  { k: "L", on: 96, al: 2, res: 38, inb: 100, low: 60, rec: 40 },
  { k: "XL", on: 64, al: 0, res: 24, inb: 0, low: 30, rec: 25 },
  { k: "2XL", on: 30, al: 0, res: 10, inb: 0, low: 15, rec: 15 },
] as const;

function StockDemo() {
  const [pick, setPick] = useState(2);
  const v = VARIANTS[pick];
  const av = v.on - v.al - v.res;
  const low = av < v.low;
  const segs = [
    { l: "Allocated", n: v.al, c: NAVY, d: "Promised to orders" },
    { l: "Reserved", n: v.res, c: TEAL, d: "Held for events" },
    { l: "Available", n: av, c: low ? AMBER : GREEN, d: low ? `Below its reorder point of ${v.low}` : "Free to sell or promise" },
  ];
  const history = [
    { what: "Held for upcoming events", q: `−${v.res} available`, c: TEAL },
    { what: "Counted · Apparel shelf", q: "−1 on hand", c: RED },
    { what: "Received · PO-0138", q: `+${v.rec} on hand`, c: GREEN },
  ];
  return (
    <div className={`relative flex flex-col overflow-hidden rounded-[18px] border bg-white ${CARD_CLS}`} style={{ borderColor: HAIR }}>
      <CardHead
        icon={BoxesIcon}
        title="Event T-shirt"
        right={
          <span className="font-mono text-[10px]" style={{ color: MUTED }}>
            APP-TEE-EVT-{v.k}
          </span>
        }
      />

      <div className="flex flex-none gap-1.5 px-4 pt-3">
        {VARIANTS.map((x, i) => (
          <button
            key={x.k}
            type="button"
            onClick={() => setPick(i)}
            className="flex-1 rounded-[8px] border py-1.5 text-[11px] font-bold transition-colors"
            style={i === pick ? { borderColor: TEAL, background: `${TEAL}12`, color: TEAL } : { borderColor: HAIR2, color: MUTED }}
          >
            {x.k}
          </button>
        ))}
      </div>

      <div className="flex-none px-4 pt-3">
        <div className="flex items-baseline gap-2">
          <span className="text-[26px] font-bold tabular-nums leading-none">{v.on}</span>
          <span className="text-[11px] font-semibold" style={{ color: MUTED }}>
            on hand, Main Warehouse
          </span>
          {v.inb > 0 && (
            <span className="ml-auto flex items-center gap-1 rounded-full px-2 py-[2px] text-[10px] font-semibold" style={{ background: `${BLUE}12`, color: BLUE }}>
              <TruckIcon className="h-[11px] w-[11px]" />
              {v.inb} inbound
            </span>
          )}
        </div>
        <div className="mt-2.5 flex h-[12px] overflow-hidden rounded-full" style={{ background: "#EEECE8" }}>
          {segs.map((s) => (
            <div key={s.l} className="h-full transition-[width] duration-300" style={{ width: `${(s.n / v.on) * 100}%`, background: s.c }} />
          ))}
        </div>
        <div className="mt-2.5 flex flex-col gap-1">
          {segs.map((s) => (
            <div key={s.l} className="flex items-center gap-2 text-[11px]">
              <span className="h-[8px] w-[8px] flex-none rounded-[2px]" style={{ background: s.c }} />
              <span className="w-[68px] flex-none font-semibold">{s.l}</span>
              <span className="min-w-0 flex-1 truncate" style={{ color: s.l === "Available" && low ? AMBER : MUTED }}>
                {s.d}
              </span>
              <span className="flex-none font-bold tabular-nums">{s.n}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-4 pt-3">
        <div className="mb-1 text-[8.5px] font-bold uppercase tracking-[0.1em]" style={{ color: MUTED2 }}>
          Stock history
        </div>
        {history.map((h) => (
          <div key={h.what} className="flex items-center gap-2 border-b py-[5px] text-[10.5px] last:border-b-0" style={{ borderColor: HAIR }}>
            <span className="h-[6px] w-[6px] flex-none rounded-full" style={{ background: h.c }} />
            <span className="min-w-0 flex-1 truncate">{h.what}</span>
            <span className="flex-none font-semibold tabular-nums">{h.q}</span>
          </div>
        ))}
      </div>

      <Footnote icon={LockIcon}>Every change is written to the history, and nothing in it can be edited.</Footnote>
    </div>
  );
}

// ---------------------------------------------------------------- 2. purchasing
const PO_STEPS = ["Draft", "Submitted", "Partial", "Received"] as const;
const PO_LINES = [
  { n: "Event T-shirt · Large", q: 40, first: 40 },
  { n: "Lanyards", q: 25, first: 0 },
  { n: "Name badge holders", q: 30, first: 0 },
];
const PO_ACTION = ["Submit to vendor", "Receive the shirts", "Receive the rest", "Start over"];

function PurchaseDemo() {
  const [step, setStep] = useState(0);
  const received = (l: (typeof PO_LINES)[number]) => (step >= 3 ? l.q : step === 2 ? l.first : 0);
  const ordered = PO_LINES.reduce((s, l) => s + l.q, 0);
  const got = PO_LINES.reduce((s, l) => s + received(l), 0);
  const inbound = step === 0 ? 0 : ordered - got;
  return (
    <div className={`relative flex flex-col overflow-hidden rounded-[18px] border bg-white ${CARD_CLS}`} style={{ borderColor: HAIR }}>
      <CardHead
        icon={TruckIcon}
        title="PO-0142 · Summit Apparel Co."
        right={
          <span
            className="rounded-full px-2 py-[2px] text-[10px] font-bold"
            style={
              step === 3
                ? { background: `${GREEN}16`, color: GREEN }
                : step === 2
                  ? { background: `${AMBER}1C`, color: AMBER }
                  : step === 1
                    ? { background: `${BLUE}16`, color: BLUE }
                    : { background: "#EEECE8", color: MUTED }
            }
          >
            {PO_STEPS[step]}
          </span>
        }
      />

      {/* Where this PO came from: the reorder warning on the Purchasing tab. */}
      <div className="mx-4 mt-3 flex flex-none items-center gap-2 rounded-[10px] border px-3 py-2 text-[10.5px]" style={{ borderColor: "#EED9A6", background: "#FCF5E6", color: "#7A5418" }}>
        <WarnIcon className="h-[13px] w-[13px] flex-none" />
        <span className="min-w-0 flex-1 truncate">
          <b>23 SKUs below their reorder point.</b> Drafted from Leaders Summit 2026&rsquo;s shortfall.
        </span>
      </div>

      <div className="flex flex-none px-4 pt-3">
        {PO_STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 items-center">
            <span
              className="grid h-[18px] w-[18px] flex-none place-items-center rounded-full text-[9px] font-bold transition-colors duration-300"
              style={i <= step ? { background: i === step ? NAVY : GREEN, color: "#fff" } : { background: "#EEECE8", color: MUTED }}
            >
              {i < step ? <Tick className="h-[10px] w-[10px]" /> : i + 1}
            </span>
            <span className="ml-1.5 truncate text-[10px] font-semibold" style={{ color: i <= step ? INK : MUTED2 }}>
              {s}
            </span>
            {i < PO_STEPS.length - 1 && <span className="mx-2 h-px min-w-[8px] flex-1" style={{ background: i < step ? GREEN : HAIR2 }} />}
          </div>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-4 pt-3">
        <div className="grid border-b pb-1 text-[8.5px] font-bold uppercase tracking-[0.1em]" style={{ gridTemplateColumns: "1fr 58px 70px", borderColor: HAIR, color: MUTED2 }}>
          <span>Item</span>
          <span className="text-right">Ordered</span>
          <span className="text-right">Received</span>
        </div>
        {PO_LINES.map((l) => {
          const r = received(l);
          return (
            <div key={l.n} className="grid items-center border-b py-[7px] text-[11px] tabular-nums" style={{ gridTemplateColumns: "1fr 58px 70px", borderColor: HAIR }}>
              <span className="truncate">{l.n}</span>
              <span className="text-right">{l.q}</span>
              <span className="text-right font-semibold" style={{ color: r === l.q ? GREEN : r > 0 ? AMBER : MUTED2 }}>
                {r} / {l.q}
              </span>
            </div>
          );
        })}
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          <div className="rounded-[10px] border px-3 py-2" style={{ borderColor: HAIR2, background: "#FBFAF8" }}>
            <div className="text-[8.5px] font-bold uppercase tracking-[0.1em]" style={{ color: MUTED2 }}>
              Inbound
            </div>
            <div className="text-[18px] font-bold tabular-nums" style={{ color: inbound ? BLUE : MUTED2 }}>
              {inbound}
            </div>
          </div>
          <div className="rounded-[10px] border px-3 py-2" style={{ borderColor: HAIR2, background: "#FBFAF8" }}>
            <div className="text-[8.5px] font-bold uppercase tracking-[0.1em]" style={{ color: MUTED2 }}>
              Added to on hand
            </div>
            <div className="text-[18px] font-bold tabular-nums" style={{ color: got ? GREEN : MUTED2 }}>
              +{got}
            </div>
          </div>
        </div>
        <div className="mt-2 text-[10px]" style={{ color: MUTED }}>
          {step === 0 ? "A draft changes nothing. Stock moves only when you receive it." : "Branding due Oct 18: the first delivery stays out of stock until branding is marked complete."}
        </div>
      </div>

      <div className="mx-4 mb-4 mt-2 flex flex-none items-center gap-2">
        <span className="flex min-w-0 flex-1 items-center gap-1.5 truncate text-[10px]" style={{ color: MUTED }}>
          <LockIcon className="h-[11px] w-[11px] flex-none" />
          Unit costs only for people with cost access
        </span>
        <button
          type="button"
          onClick={() => setStep((s) => (s + 1) % PO_STEPS.length)}
          className="flex-none rounded-[8px] px-3 py-1.5 text-[10.5px] font-bold transition-colors"
          style={step === 3 ? { background: "#EEECE8", color: MUTED } : { background: NAVY, color: "#fff" }}
        >
          {PO_ACTION[step]}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 3. orders
const ORDER_STAGES = ["New", "Allocated", "Picked", "Packed", "Shipped"] as const;
const ORDER_ACTION = ["Allocate", "Pick", "Pack", "Ship", "Next order"];
const ORDER_NOTE = [
  "Came in from Shopify. Nothing is promised yet.",
  "Allocated: the shirt is promised to this order and leaves Available.",
  "Picked from Main Warehouse, bin A-14.",
  "Packed and ready for the carrier.",
  "Shipped. Tracking came back from ShipStation and marked it done.",
];
const CHANNELS = [
  { n: "Shopify store", on: true, d: "Orders come in; available-to-sell goes out.", meta: "42 SKUs mapped · Map variants" },
  { n: "ShipStation", on: true, d: "Eligible orders go out; shipments and tracking come back.", meta: "Automatic send is off until you turn it on" },
  { n: "Custom webhook", on: true, d: "Orders from GoHighLevel, Zapier, Make, or anything that can post JSON.", meta: "Post orders to this URL · Map fields" },
];

function OrdersDemo() {
  const [tab, setTab] = useState<"board" | "channels">("board");
  const [stage, setStage] = useState(0);
  return (
    <div className={`relative flex flex-col overflow-hidden rounded-[18px] border bg-white ${CARD_CLS}`} style={{ borderColor: HAIR }}>
      <CardHead
        icon={CartIcon}
        title="Orders"
        right={
          <span className="text-[10px] font-semibold tabular-nums" style={{ color: MUTED }}>
            14 new · 37 packed
          </span>
        }
      />
      <CardTabs
        tabs={[
          { k: "board", l: "Order board" },
          { k: "channels", l: "Sales channels", s: "Channels" },
        ]}
        value={tab}
        onChange={setTab}
      />

      <div className="min-h-0 flex-1 overflow-hidden px-4 pt-3">
        {tab === "board" ? (
          <div>
            <div className="grid grid-cols-5 gap-1">
              {ORDER_STAGES.map((s, i) => (
                <div
                  key={s}
                  className="rounded-[7px] py-1.5 text-center text-[9.5px] font-bold transition-colors duration-300"
                  style={i < stage ? { background: `${GREEN}16`, color: GREEN } : i === stage ? { background: NAVY, color: "#fff" } : { background: "#F3F1EC", color: MUTED2 }}
                >
                  {s}
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-[12px] border p-3" style={{ borderColor: TEAL, boxShadow: `0 0 0 3px ${TEAL}14` }}>
              <div className="flex items-center">
                <span className="font-mono text-[10px] font-semibold">SO-1215</span>
                <span className="ml-2 rounded-[4px] px-1.5 text-[8.5px] font-bold uppercase" style={{ background: "#E7F4EA", color: "#2C7A3F" }}>
                  Shopify
                </span>
                <span className="ml-auto text-[10px]" style={{ color: MUTED }}>
                  Ship by Oct 17
                </span>
              </div>
              <div className="mt-1 text-[12.5px] font-bold">Elena Cruz</div>
              <div className="mt-1.5 flex flex-col gap-1">
                {[
                  ["Event T-shirt · M", "APP-TEE-EVT-M"],
                  ["Water bottle · Steel", "MER-BTL-STL"],
                ].map(([n, sku]) => (
                  <div key={sku} className="flex items-center gap-2 text-[10.5px]">
                    <span className="grid h-[15px] w-[15px] flex-none place-items-center rounded-[4px]" style={stage >= 2 ? { background: GREEN, color: "#fff" } : { background: "#EEECE8" }}>
                      {stage >= 2 && <Tick className="h-[9px] w-[9px]" />}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{n}</span>
                    <span className="hidden font-mono text-[9px] sm:inline" style={{ color: MUTED }}>
                      {sku}
                    </span>
                    <span className="flex-none tabular-nums">×1</span>
                  </div>
                ))}
              </div>
              {stage === 4 && (
                <div className="mt-2 flex items-center gap-1.5 rounded-[8px] px-2 py-1 text-[10px] font-semibold" style={{ background: `${GREEN}12`, color: GREEN }}>
                  <TruckIcon className="h-[11px] w-[11px]" />
                  UPS · 1Z 84A 220 9918
                </div>
              )}
            </div>
            <div className="mt-2.5 text-[10.5px] leading-snug" style={{ color: MUTED }}>
              {ORDER_NOTE[stage]}
            </div>
            <button
              type="button"
              onClick={() => setStage((s) => (s + 1) % ORDER_STAGES.length)}
              className="mt-2.5 w-full rounded-[8px] py-1.5 text-[10.5px] font-bold transition-colors"
              style={stage === 4 ? { background: "#EEECE8", color: MUTED } : { background: NAVY, color: "#fff" }}
            >
              {ORDER_ACTION[stage]}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {CHANNELS.map((c) => (
              <div key={c.n} className="rounded-[10px] border px-3 py-2" style={{ borderColor: HAIR }}>
                <div className="flex items-center">
                  <span className="text-[11.5px] font-bold">{c.n}</span>
                  <span className="ml-auto rounded-full px-2 py-[1px] text-[9px] font-bold" style={{ background: `${GREEN}16`, color: GREEN }}>
                    Connected
                  </span>
                </div>
                <div className="text-[10px]" style={{ color: MUTED }}>
                  {c.d}
                </div>
                <div className="mt-0.5 truncate text-[9.5px] font-semibold" style={{ color: TEAL }}>
                  {c.meta}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footnote icon={PlugIcon}>Inventory HQ is the source of truth: it sends stock out and never reads it back.</Footnote>
    </div>
  );
}

// ---------------------------------------------------------------- 4. events and gear
// The Summit kit for Leaders Summit 2026's 137 registrations. Per-attendee lines
// scale with registrations; the rest are fixed. 312 in all, as in the hero tour.
const REGISTERED = 137;
const KIT = [
  { n: "Event T-shirt", per: true, q: 1 },
  { n: "Name badge holder", per: true, q: 1 },
  { n: "Lanyards, staff", per: false, q: 30 },
  { n: "Banner stand", per: false, q: 4 },
  { n: "Wireless mic kit", per: false, q: 4 },
];
const GEAR = [
  { n: "Wireless mic kit", out: 4, back: 4 },
  { n: "Banner stand", out: 4, back: 4 },
  { n: "HDMI splitter", out: 2, back: 1 },
  { n: "Portable projector", out: 1, back: 1 },
];

function EventsDemo() {
  const [tab, setTab] = useState<"reserve" | "gear">("reserve");
  const [held, setHeld] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const total = KIT.reduce((s, k) => s + (k.per ? k.q * REGISTERED : k.q), 0);
  const missing = GEAR.reduce((s, g) => s + g.out - g.back, 0);
  return (
    <div className={`relative flex flex-col overflow-hidden rounded-[18px] border bg-white ${CARD_CLS}`} style={{ borderColor: HAIR }}>
      <CardHead
        icon={CalDaysIcon}
        title="Leaders Summit 2026"
        right={
          <span className="text-[10px] font-semibold tabular-nums" style={{ color: MUTED }}>
            Oct 22 · {REGISTERED} registered
          </span>
        }
      />
      <CardTabs
        tabs={[
          { k: "reserve", l: "Reserve stock", s: "Reserve" },
          { k: "gear", l: "Plan gear", s: "Gear" },
        ]}
        value={tab}
        onChange={setTab}
      />

      <div className="min-h-0 flex-1 overflow-hidden px-4 pt-3">
        {tab === "reserve" ? (
          <div>
            <div className="flex items-center text-[9px] font-bold uppercase tracking-[0.1em]" style={{ color: MUTED2 }}>
              Summit kit
              <span className="ml-auto normal-case tracking-normal">per attendee lines scale with registrations</span>
            </div>
            <div className="mt-1.5 flex flex-col gap-1">
              {KIT.map((k) => (
                <div key={k.n} className="flex items-center gap-2 rounded-[8px] border px-2.5 py-[5px] text-[10.5px]" style={{ borderColor: HAIR }}>
                  <span className="min-w-0 flex-1 truncate">{k.n}</span>
                  <span className="flex-none text-[9.5px]" style={{ color: MUTED }}>
                    {k.per ? `${k.q} / person` : "Fixed"}
                  </span>
                  <span className="w-[34px] flex-none text-right font-bold tabular-nums">{k.per ? k.q * REGISTERED : k.q}</span>
                  <span className="grid w-[14px] flex-none place-items-center">
                    {held && <LockIcon className="h-[11px] w-[11px]" style={{ color: GREEN }} />}
                  </span>
                </div>
              ))}
            </div>
            <div
              className="mt-2.5 flex items-center gap-2 rounded-[10px] border px-3 py-2 text-[10.5px] transition-colors duration-300"
              style={held ? { borderColor: `${GREEN}55`, background: "#EEF8F2", color: "#17714A" } : { borderColor: HAIR2, background: "#FBFAF8", color: MUTED }}
            >
              {held ? <LockIcon className="h-[13px] w-[13px] flex-none" /> : <BoxesIcon className="h-[13px] w-[13px] flex-none" />}
              <span className="min-w-0 flex-1 leading-snug">
                {held ? (
                  <>
                    <b>Holding {total} units.</b> They left Available, so a storefront can&rsquo;t sell them.
                  </>
                ) : (
                  "Nothing reserved yet."
                )}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setHeld((h) => !h)}
              className="mt-2.5 w-full rounded-[8px] py-1.5 text-[10.5px] font-bold transition-colors"
              style={held ? { background: "#EEECE8", color: MUTED } : { background: NAVY, color: "#fff" }}
            >
              {held ? "Release" : `Reserve stock for ${REGISTERED} attendees`}
            </button>
          </div>
        ) : (
          <div>
            <div className="grid border-b pb-1 text-[8.5px] font-bold uppercase tracking-[0.1em]" style={{ gridTemplateColumns: "1fr 44px 64px", borderColor: HAIR, color: MUTED2 }}>
              <span>Pull list</span>
              <span className="text-right">Out</span>
              <span className="text-right">Back</span>
            </div>
            {GEAR.map((g) => {
              const back = checkedIn ? g.back : 0;
              const short = checkedIn && g.back < g.out;
              return (
                <div key={g.n} className="grid items-center border-b py-[7px] text-[11px] tabular-nums" style={{ gridTemplateColumns: "1fr 44px 64px", borderColor: HAIR }}>
                  <span className="truncate">{g.n}</span>
                  <span className="text-right">{g.out}</span>
                  <span className="text-right font-semibold" style={{ color: !checkedIn ? MUTED2 : short ? RED : GREEN }}>
                    {back} / {g.out}
                  </span>
                </div>
              );
            })}
            <div
              className="mt-2.5 flex items-center gap-2 rounded-[10px] border px-3 py-2 text-[10.5px] transition-colors duration-300"
              style={checkedIn ? { borderColor: "#EBC4BC", background: "#FCF1EF", color: "#8A2E1F" } : { borderColor: HAIR2, background: "#FBFAF8", color: MUTED }}
            >
              <WarnIcon className="h-[13px] w-[13px] flex-none" />
              <span className="min-w-0 flex-1 leading-snug">
                {checkedIn ? (
                  <>
                    <b>{missing} HDMI splitter missing.</b> Counted against Leaders Summit 2026 in event losses.
                  </>
                ) : (
                  "11 items went out with the event."
                )}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setCheckedIn((c) => !c)}
              className="mt-2.5 w-full rounded-[8px] py-1.5 text-[10.5px] font-bold transition-colors"
              style={checkedIn ? { background: "#EEECE8", color: MUTED } : { background: NAVY, color: "#fff" }}
            >
              {checkedIn ? "Undo" : "Check everything back in"}
            </button>
          </div>
        )}
      </div>

      <Footnote icon={CalDaysIcon}>Every Events HQ event in the next 120 days shows up here.</Footnote>
    </div>
  );
}

// ---------------------------------------------------------------- 5. counts, forecast and alerts
const RUNS_SHORT = [
  { n: "Lanyards", when: "Runs out around Oct 20", note: "An order now lands after that", pct: 18, red: true },
  { n: "Event T-shirt · Large", when: "Runs out around Oct 29", note: "Order by Oct 15 to arrive in time", pct: 42, red: true },
  { n: "Welcome journal", when: "Below its reorder point", note: "Order now (2-week lead time)", pct: 64, red: false },
];
const SHEET = [
  { n: "Event T-shirt · S", exp: 48, got: 48 },
  { n: "Event T-shirt · M", exp: 121, got: 120 },
  { n: "Event T-shirt · L", exp: 96, got: 96 },
  { n: "Event T-shirt · XL", exp: 65, got: 64 },
  { n: "Water bottle · Steel", exp: 188, got: 188 },
];

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className="relative h-[16px] w-[28px] flex-none rounded-full transition-colors"
      style={{ background: on ? NAVY : "#D9D5CD" }}
    >
      <span className="absolute top-[2px] h-[12px] w-[12px] rounded-full bg-white transition-[left] duration-200" style={{ left: on ? 14 : 2 }} />
    </button>
  );
}

function CountsDemo() {
  const [tab, setTab] = useState<"forecast" | "count" | "alerts">("forecast");
  const [sent, setSent] = useState(false);
  const [alerts, setAlerts] = useState({ low: true, task: true, stale: true });
  const [via, setVia] = useState<"In app" | "Email" | "Both">("Both");
  const diffs = SHEET.filter((s) => s.got !== s.exp).length;
  return (
    <div className={`relative flex flex-col overflow-hidden rounded-[18px] border bg-white ${CARD_CLS}`} style={{ borderColor: HAIR }}>
      <CardHead
        icon={ClipboardIcon}
        title="Main Warehouse"
        right={
          <span className="text-[10px] font-semibold" style={{ color: MUTED }}>
            <span className="hidden sm:inline">Inventory manager · </span>Dana Whitfield
          </span>
        }
      />
      <CardTabs
        tabs={[
          { k: "forecast", l: "Forecast" },
          { k: "count", l: "Cycle count", s: "Count" },
          { k: "alerts", l: "Alerts" },
        ]}
        value={tab}
        onChange={setTab}
      />

      <div className="min-h-0 flex-1 overflow-hidden px-4 pt-3">
        {tab === "forecast" && (
          <div>
            <div className="text-[10px]" style={{ color: MUTED }}>
              The next 3 months: planned event inventory, unfilled orders and a 90-day sales run rate, with open POs topping it up.
            </div>
            <div className="mt-2 flex flex-col gap-1.5">
              {RUNS_SHORT.map((r) => (
                <div key={r.n} className="rounded-[10px] border px-3 py-2" style={{ borderColor: HAIR }}>
                  <div className="flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-[11.5px] font-semibold">{r.n}</span>
                    <span className="flex-none text-[10px] font-semibold" style={{ color: r.red ? RED : AMBER }}>
                      {r.when}
                    </span>
                  </div>
                  <div className="mt-1 h-[4px] overflow-hidden rounded-full" style={{ background: "#EEECE8" }}>
                    <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: r.red ? RED : AMBER }} />
                  </div>
                  <div className="mt-1 text-[9.5px]" style={{ color: MUTED }}>
                    {r.note}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "count" && (
          <div>
            <div className="grid border-b pb-1 text-[8.5px] font-bold uppercase tracking-[0.1em]" style={{ gridTemplateColumns: "1fr 54px 60px", borderColor: HAIR, color: MUTED2 }}>
              <span>Apparel shelf · Priya Nair</span>
              <span className="text-right">Record</span>
              <span className="text-right">Counted</span>
            </div>
            {SHEET.map((s) => {
              const off = s.got !== s.exp;
              return (
                <div key={s.n} className="grid items-center border-b py-[6px] text-[11px] tabular-nums" style={{ gridTemplateColumns: "1fr 54px 60px", borderColor: HAIR }}>
                  <span className="truncate">{s.n}</span>
                  <span className="text-right" style={{ color: MUTED }}>
                    {s.exp}
                  </span>
                  <span className="text-right font-semibold" style={{ color: off ? AMBER : INK }}>
                    {s.got}
                    {off && <span className="ml-1 text-[9px]">({s.got - s.exp})</span>}
                  </span>
                </div>
              );
            })}
            <div className="mt-2 text-[10px]" style={{ color: MUTED }}>
              {sent ? `Sent to Dana Whitfield. Once approved, the ${diffs} differences correct the record.` : `${diffs} differences. Nothing changes until the inventory manager approves the sheet.`}
            </div>
            <button
              type="button"
              onClick={() => setSent((s) => !s)}
              className="mt-2 w-full rounded-[8px] py-1.5 text-[10.5px] font-bold transition-colors"
              style={sent ? { background: "#EEECE8", color: MUTED } : { background: NAVY, color: "#fff" }}
            >
              {sent ? "Undo" : "Send for approval"}
            </button>
          </div>
        )}

        {tab === "alerts" && (
          <div className="flex flex-col gap-1.5">
            {[
              { k: "low", l: "Low stock", d: "When an item drops below its reorder point" },
              { k: "task", l: "Open a reorder task", d: "Assigned to the inventory manager" },
              { k: "stale", l: "Not counted recently", d: "Warn after 60 days without a count" },
            ].map((a) => (
              <div key={a.k} className="flex items-center gap-2.5 rounded-[10px] border px-3 py-2" style={{ borderColor: HAIR }}>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-semibold">{a.l}</span>
                  <span className="block truncate text-[9.5px]" style={{ color: MUTED }}>
                    {a.d}
                  </span>
                </span>
                <Toggle
                  on={alerts[a.k as keyof typeof alerts]}
                  onClick={() => setAlerts((s) => ({ ...s, [a.k]: !s[a.k as keyof typeof alerts] }))}
                />
              </div>
            ))}
            <div className="mt-1 text-[8.5px] font-bold uppercase tracking-[0.1em]" style={{ color: MUTED2 }}>
              Deliver
            </div>
            <div className="flex gap-1">
              {(["In app", "Email", "Both"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVia(v)}
                  className="flex-1 rounded-[8px] border py-1.5 text-[10.5px] font-semibold transition-colors"
                  style={via === v ? { borderColor: TEAL, background: `${TEAL}12`, color: TEAL } : { borderColor: HAIR2, color: MUTED }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footnote icon={WarnIcon}>
        {tab === "alerts" ? "Checked every half hour, and each kind is sent at most once a day." : tab === "count" ? "Counts are assigned to a counter and come back for approval." : "Events further out aren't counted until you widen the window."}
      </Footnote>
    </div>
  );
}

// ---------------------------------------------------------------- Multi AI
const AI_ROWS: Row[] = [
  { name: "Lanyards", value: "12 available", hit: false, tone: "red" },
  { name: "Event T-shirt · Large", value: "56 available", hit: false, tone: "amber" },
  { name: "PO-0141", value: "Arrives Oct 20", hit: true },
  { name: "Wireless mic kits", value: "4 / 4 back", hit: true },
];

const AI_INSIGHTS: Insight[] = [
  {
    tag: "Shortfall",
    color: RED,
    source: "Lanyards",
    text: "Leaders Summit 2026 and Founders Retreat need 210 lanyards between them and you have 85. With a 2-week lead time, order today or trim the staff count.",
  },
  {
    tag: "Timing",
    color: AMBER,
    source: "Event T-shirt · Large",
    text: "PO-0141 brings 100 large shirts on Oct 20, but its branding is due Oct 18. If branding slips, the delivery stays out of stock past the summit.",
  },
  {
    tag: "Pattern",
    color: AI,
    source: "Wireless mic kits",
    text: "Every kit has come back from the last three events. HDMI splitters are the gear that goes missing: two lost this quarter.",
  },
];

// ---------------------------------------------------------------- the page
export default function InventoryHqPage() {
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
              style={{ borderColor: `${TEAL}33`, background: `${TEAL}0F`, color: TEAL }}
            >
              <BoxesIcon className="h-[14px] w-[14px] sm:h-[19px] sm:w-[19px]" />
              Inventory HQ
            </span>

            <h1 className="mt-5 text-[24px] font-extrabold leading-[1.1] tracking-tight text-brand-ink sm:mt-7 sm:text-[66px] sm:leading-[1.04]">
              Know what you have.
              <br />
              <span className="text-brand-orange">Know where it&rsquo;s going.</span>
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-[14px] leading-relaxed text-brand-charcoal sm:mt-6 sm:text-[19px]">
              Inventory HQ keeps one pool of stock for what you sell and what you take to events. Every item down to
              the SKU: where it&rsquo;s stored, what&rsquo;s on order, what&rsquo;s promised to orders and events, and
              what&rsquo;s out with someone, with every change written to a history nobody can edit.
            </p>
          </Reveal>

          <Reveal delay={0.12} className="mt-6 sm:mt-12">
            {/* Relative wrapper kept to match the other pages, though there is no
                ReplacesChip here. */}
            <div className="relative mx-auto max-w-[1120px]">
              <div className="overflow-hidden rounded-2xl p-2 sm:rounded-[30px] sm:p-8" style={{ background: PANEL_COOL }}>
                <InventoryHqHeroTour />
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

      {/* ------------------------------------------------ 1. stock */}
      <Section
        id="stock"
        eyebrow="One pool of stock"
        title={
          <>
            Every SKU,
            <br className="hidden sm:block" /> <span className="text-brand-orange">and where it stands.</span>
          </>
        }
        body="Every size and colour of a product gets its own SKU. For each one you see what's on hand, what's promised to orders, what's held for events, what's free to sell and what's on its way, and every change lands in a history nobody can rewrite."
        points={[
          "Items down to the SKU, filed in folders, with sizes and colours as their own SKUs",
          "On hand, allocated, reserved, available and inbound for every item, at every location",
          "Scan a barcode or type a SKU code to open any item",
          "Import a spreadsheet or a Sortly export instead of retyping what you have",
        ]}
        visual={<StockDemo />}
        panel={PANEL_COOL}
      />

      {/* ------------------------------------------------ 2. purchasing */}
      <Section
        id="purchasing"
        eyebrow="Purchasing and receiving"
        title={
          <>
            Reorder before
            <br className="hidden sm:block" /> <span className="text-brand-orange">you run out.</span>
          </>
        }
        body="Reorder points drive the low stock tile, the reorder suggestions and the alerts. Draft a purchase order straight from a shortfall, receive it in part or in full, and nothing changes stock until it's actually on the shelf."
        points={[
          "Draft a PO from a shortfall or a reorder suggestion, from your own vendor list",
          "Receive in part or in full; what's still to come shows as inbound",
          "Need it branded? The first delivery stays out of stock until branding is marked complete",
          "Costs are their own permission, so people can see you hold forty of something without seeing what you paid",
        ]}
        visual={<PurchaseDemo />}
        flip
        panel={PANEL_STONE}
      />

      {/* ------------------------------------------------ 3. orders */}
      <Section
        id="orders"
        eyebrow="Orders and sales channels"
        title={
          <>
            Sell it once,
            <br className="hidden sm:block" /> <span className="text-brand-orange">not twice.</span>
          </>
        }
        body="Orders arrive from Shopify, from any tool that can send a webhook, or by hand. Allocate, pick, pack and ship them on one board, and the stock you have left goes back out to your store."
        points={[
          "Orders from Shopify, or from GoHighLevel, Zapier, Make and anything else that can post JSON",
          "Allocate, pick, pack and ship on one board, and handle returns",
          "Available stock, after event holds, goes out to Shopify. Quantities are never read back in",
          "ShipStation sends shipments and tracking back and marks the matching order shipped",
        ]}
        visual={<OrdersDemo />}
        panel={PANEL_COOL}
      />

      {/* ------------------------------------------------ 4. events and gear */}
      <Section
        id="events"
        eyebrow="Events and gear"
        title={
          <>
            Hold it for the event
            <br className="hidden sm:block" /> <span className="text-brand-orange">before anyone sells it.</span>
          </>
        }
        body="Every event in Events HQ shows up in Inventory HQ ahead of time. Build a kit once, hold what each event needs for its headcount, and track the gear that goes out and comes back."
        points={[
          "Kits: the packing list for a kind of event, with per-attendee lines that scale with registrations",
          "Held stock leaves Available, so it can't be sold online or promised to another event",
          "Run it again as registrations change and it tops up or trims back; release it if the event moves",
          "Plan gear makes a pull list; anything missing or damaged on check-in is counted against the event",
        ]}
        visual={<EventsDemo />}
        flip
        panel={PANEL_STONE}
      />

      {/* ------------------------------------------------ 5. counts, forecast and alerts */}
      <Section
        id="counts"
        eyebrow="Counts, forecasts and alerts"
        title={
          <>
            Numbers you can trust,
            <br className="hidden sm:block" /> <span className="text-brand-orange">and fair warning.</span>
          </>
        }
        body="Count the shelf and correct the record. The forecast reads your event plans, open orders and sales to show when each item is likely to run short, and alerts tell the right people once a day, not every half hour."
        points={[
          "Cycle counts assigned to a counter, sent back to the inventory manager for approval",
          "A forecast of when each item runs short, from events, open orders and a 90-day sales run rate",
          "Low stock and not-counted-recently alerts, in the app, by email or both, and everyone picks their own",
          "Assets: individually tagged units, like laptops, with who has each one and its condition",
        ]}
        visual={<CountsDemo />}
        panel={PANEL_COOL}
      />

      {/* ------------------------------------------------ 6. Multi AI (always last) */}
      <MultiAiWired
        heading="Your stock, read by"
        swash="an operations manager."
        intro="Multi AI can already see every item, order, purchase order and event hold. Ask what to reorder this week and it answers from the stock itself, naming the item, the event that needs it and when to order."
        leftLabel="The stock your team keeps"
        leftColor={TEAL}
        leftIcon={RowsIcon}
        rightLabel="What Multi AI finds in it"
        prompt="What do we need to reorder before the next two events?"
        panelTitle="Inventory HQ · Needs attention"
        panelMeta="4 items"
        panelDot={TEAL}
        rows={AI_ROWS}
        insights={AI_INSIGHTS}
        aiMeta="reading 286 SKUs"
        footer="Multi AI reads the same stock, orders and event holds your team already keeps. Nothing to export before you can ask."
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
