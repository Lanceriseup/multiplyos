"use client";

// Animated hero for the Inventory HQ feature page.
//
// Inventory HQ is one page with tabs across the top, so the tour walks it the
// way an inventory manager would on a normal morning: start from what needs a
// decision, then across every tab, then scan one SKU.
//
//   Browse        an event is short; Draft a PO opens the new purchase order
//   Purchasing    the drafted PO lands at the top of the list
//   Stock         on hand, allocated, reserved, available and inbound
//   Orders        a Shopify order moves New → Allocated → Picked → Packed
//   Events        Reserve stock on Leaders Summit 2026; Available drops
//   Cycle counts  the apparel shelf gets counted and goes for approval
//   Forecast      the items heading for a shortfall, and when
//   Assets        tagged units and who has each one
//   Insights      order to first shipment, and sell-through
//   one item      a SKU typed into Scan or search a SKU opens its record,
//                 then its stock history
//
// Every screen is traced from the client's November 2026 screenshots: the
// header (All locations, Sharing, Scan or search a SKU, the settings gear), the
// four tiles, the What needs a decision panel, the ten tabs, the Browse folders
// and items, the Stock table's columns, the Purchasing list and New purchase
// order dialog, the Orders board's six columns, the Events tab's event cards and
// buttons, the Cycle counts table, the Forecast cards, the Assets empty state's
// "tag, custodian, and condition", the Insights tables, and the item record.
//
// Same architecture as the other hero tours: the screen is React state, only
// the cursor and the ripple are animated imperatively through the Web
// Animations API, and the sequence is generation-token guarded so a re-render
// or unmount cancels the in-flight tour rather than leaving orphaned timers.
//
// Everything on screen is fictional. The client's screenshots carry real event
// names, real customers on real orders, real vendors and real staff with their
// emails; none of that is on the public site. The company is the Ridgeline
// cast the other feature pages use, and the events are the ones on the Events
// HQ page, so the two modules tell the same story.
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

const MIN_W = 980;
const STAGE_H = 540;
const SIDEBAR_W = 178;
const EASE = "cubic-bezier(0.22,1,0.36,1)";

const INK = "#1B1A17";
const HAIR = "#ECEAE6";
const HAIR2 = "#E3E0DA";
const MUTED = "#8A867E";
const MUTED2 = "#A9A49B";
const ORANGE = "#EA7B1B";
const TEAL = "#2F6F8F"; // Inventory HQ's own colour, from the navbar
const GREEN = "#1FA36A";
const NAVY = "#0F1B2D";
const AMBER = "#C9832B";
const BLUE = "#2F7FD1";
const PURPLE = "#7A4EDB";
const RED = "#C0402B";

// ---------------------------------------------------------------- icons
const ico = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
type IconProps = { className?: string; style?: React.CSSProperties };

/** Inventory HQ's own mark in the app: three boxes, two below and one on top. */
const Boxes =({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42z" />
    <path d="M7 16.5l-4.74-2.85M7 16.5l5-3M7 16.5v5.17" />
    <path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3z" />
    <path d="M17 16.5l-5-3M17 16.5l4.74-2.85M17 16.5v5.17" />
    <path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8z" />
    <path d="M12 8L7.26 5.15M12 8l4.74-2.85M12 13.5V8" />
  </svg>
);
const Box = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 3.2l7.8 4.3v9L12 20.8l-7.8-4.3v-9z" />
    <path d="M4.4 7.6L12 11.8l7.6-4.2M12 11.8v8.8" />
  </svg>
);
const Cal = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="4" y="5.2" width="16" height="14.6" rx="2.4" />
    <path d="M4 9.6h16M8.3 3.4v3.4M15.7 3.4v3.4" />
  </svg>
);
const CalDays = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="3.8" y="5" width="16.4" height="15" rx="2.4" />
    <path d="M3.8 9.6h16.4M8.2 3.2v3.4M15.8 3.2v3.4" />
    <path d="M8 13.2h.01M12 13.2h.01M16 13.2h.01M8 16.6h.01M12 16.6h.01M16 16.6h.01" strokeWidth={2.4} />
  </svg>
);
const Dash = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="4" y="4" width="7" height="7" rx="1.6" />
    <rect x="13" y="4" width="7" height="7" rx="1.6" />
    <rect x="4" y="13" width="7" height="7" rx="1.6" />
    <rect x="13" y="13" width="7" height="7" rx="1.6" />
  </svg>
);
const Target = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="12" cy="12" r="7.7" />
    <circle cx="12" cy="12" r="3.9" />
  </svg>
);
const People = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="9" cy="8.2" r="3.2" />
    <path d="M3.4 19.2c.6-3.2 2.9-5.1 5.6-5.1s5 1.9 5.6 5.1" />
    <path d="M15.4 5.3a3 3 0 0 1 0 5.7M17.3 14.4c1.8.6 3 2.2 3.3 4.8" />
  </svg>
);
const Tree = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="3.6" y="3.6" width="6" height="5" rx="1.2" />
    <rect x="14.4" y="9.6" width="6" height="5" rx="1.2" />
    <rect x="14.4" y="16" width="6" height="5" rx="1.2" />
    <path d="M6.6 8.6v9.9h7.8M6.6 12.1h7.8" />
  </svg>
);
const Truck = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M3 6.4h10.4v9.4H3zM13.4 9.6h4l3 3.2v3h-7" />
    <circle cx="7" cy="17.4" r="1.8" />
    <circle cx="16.8" cy="17.4" r="1.8" />
  </svg>
);
const Cart = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M3.4 4.4h2.4l2 10.4h10.4l1.8-7.2H6.6" />
    <circle cx="9.2" cy="18.8" r="1.4" />
    <circle cx="17" cy="18.8" r="1.4" />
  </svg>
);
const Gear = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3.4v2.2M12 18.4v2.2M3.4 12h2.2M18.4 12h2.2M5.9 5.9l1.6 1.6M16.5 16.5l1.6 1.6M5.9 18.1l1.6-1.6M16.5 7.5l1.6-1.6" />
  </svg>
);
const Pin = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 20.6s-6.4-5.6-6.4-10.6a6.4 6.4 0 0 1 12.8 0c0 5-6.4 10.6-6.4 10.6z" />
    <circle cx="12" cy="10" r="2.2" />
  </svg>
);
const Scan = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M4 8V5.6A1.6 1.6 0 0 1 5.6 4H8M16 4h2.4A1.6 1.6 0 0 1 20 5.6V8M20 16v2.4a1.6 1.6 0 0 1-1.6 1.6H16M8 20H5.6A1.6 1.6 0 0 1 4 18.4V16" />
    <path d="M7.6 12h8.8" />
  </svg>
);
const Search = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="11" cy="11" r="6.4" />
    <path d="M20 20l-4.4-4.4" />
  </svg>
);
const Warn = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 4l9 15.6H3z" />
    <path d="M12 10v4M12 17h.01" />
  </svg>
);
const Bulb = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M9 17.6h6M10 20.6h4" />
    <path d="M12 3.4a5.8 5.8 0 0 0-3.4 10.5c.6.5 1 1.2 1 2v.4h4.8v-.4c0-.8.4-1.5 1-2A5.8 5.8 0 0 0 12 3.4z" />
  </svg>
);
const Folder = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M3.6 7.2a1.6 1.6 0 0 1 1.6-1.6h4.2l2 2.2h7.4a1.6 1.6 0 0 1 1.6 1.6v8a1.6 1.6 0 0 1-1.6 1.6H5.2a1.6 1.6 0 0 1-1.6-1.6z" />
  </svg>
);
const Home = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M4 11l8-6.6 8 6.6M6.4 9.2v10h11.2v-10" />
  </svg>
);
const Lock = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="4.6" y="10.4" width="14.8" height="9.8" rx="2" />
    <path d="M8 10.4V7.4a4 4 0 0 1 8 0v3" />
  </svg>
);
const Tag = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M3.6 12.4V4.6a1 1 0 0 1 1-1h7.8l8 8a1.4 1.4 0 0 1 0 2l-6.8 6.8a1.4 1.4 0 0 1-2 0z" />
    <circle cx="8" cy="8" r="1.4" />
  </svg>
);
const Clipboard = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="5" y="4.6" width="14" height="16" rx="2" />
    <path d="M9 4.6V3.4h6v1.2M8.6 11.4l2 2 4-4" />
  </svg>
);
const Layers = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 3.6l8.4 4.4L12 12.4 3.6 8z" />
    <path d="M3.6 12.2l8.4 4.4 8.4-4.4M3.6 16.2l8.4 4.4 8.4-4.4" />
  </svg>
);
const Scroll = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M7 4h11.4v13.4a2.6 2.6 0 0 1-2.6 2.6H6.6" />
    <path d="M7 4a2.4 2.4 0 0 0-2.4 2.4V8H7M6.6 20A2.6 2.6 0 0 1 4 17.4h9.2a2.6 2.6 0 0 0 2.6 2.6M10.4 8.4h4.8M10.4 12h4.8" />
  </svg>
);
const Back = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);
const Check = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2.6}>
    <path d="M5 12.4l4.4 4.4L19 7.4" />
  </svg>
);
const Chevron = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2.2}>
    <path d="M6 9.5l6 6 6-6" />
  </svg>
);
const Plus = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2.2}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

// ---------------------------------------------------------------- data
type Tab = "browse" | "stock" | "purchasing" | "orders" | "events" | "counts" | "forecast" | "assets" | "insights";
const TABS: { k: Tab | "settings"; l: string }[] = [
  { k: "browse", l: "Browse" },
  { k: "stock", l: "Stock" },
  { k: "purchasing", l: "Purchasing" },
  { k: "orders", l: "Orders" },
  { k: "events", l: "Events" },
  { k: "counts", l: "Cycle counts" },
  { k: "forecast", l: "Forecast" },
  { k: "assets", l: "Assets" },
  { k: "insights", l: "Insights" },
  { k: "settings", l: "Settings" },
];

// The Inventory HQ sidebar, in the product's order. The other tabs have no
// sidebar page of their own, so nothing under it lights up while they are open.
const SUBNAV = [
  { k: "browse", l: "Browse", icon: Tree },
  { k: "stock", l: "Stock", icon: Boxes },
  { k: "purchasing", l: "Purchasing", icon: Truck },
  { k: "orders", l: "Orders", icon: Cart },
  { k: "settings", l: "Settings", icon: Gear },
];

const FOLDERS = [
  { n: "Apparel", c: 42 },
  { n: "Event supplies", c: 118 },
  { n: "AV and tech", c: 37 },
  { n: "Books and journals", c: 26 },
  { n: "Signs and banners", c: 14 },
  { n: "Food and beverage", c: 31 },
];

const ITEMS = [
  { n: "Event T-shirt", sku: "APP-TEE-EVT", skus: 5, on: 358, av: 216 },
  { n: "Lanyards", sku: "SUP-LNY-STD", skus: 1, on: 85, av: 12 },
  { n: "Name badge holders", sku: "SUP-BDG-HLD", skus: 1, on: 640, av: 503 },
  { n: "Welcome journal", sku: "BOK-JRN-WLC", skus: 2, on: 260, av: 123 },
];

type Behavior = "Merch" | "Consumable" | "Reusable";
const STOCK: { n: string; sku: string; b: Behavior; skus: number; on: number; al: number; res: number; inb: number }[] = [
  { n: "Event T-shirt", sku: "APP-TEE-EVT", b: "Merch", skus: 5, on: 358, al: 6, res: 136, inb: 200 },
  { n: "Lanyards", sku: "SUP-LNY-STD", b: "Consumable", skus: 1, on: 85, al: 0, res: 73, inb: 0 },
  { n: "Name badge holders", sku: "SUP-BDG-HLD", b: "Consumable", skus: 1, on: 640, al: 0, res: 137, inb: 0 },
  { n: "Welcome journal", sku: "BOK-JRN-WLC", b: "Merch", skus: 2, on: 260, al: 0, res: 137, inb: 0 },
  { n: "Water bottle", sku: "MER-BTL-STL", b: "Merch", skus: 3, on: 188, al: 4, res: 0, inb: 150 },
  { n: "Wireless mic kit", sku: "AVT-MIC-WLS", b: "Reusable", skus: 1, on: 6, al: 0, res: 0, inb: 0 },
  { n: "Banner stand", sku: "SGN-BNR-STD", b: "Reusable", skus: 1, on: 12, al: 0, res: 4, inb: 0 },
];

const POS = [
  { po: "PO-0141", v: "Summit Apparel Co.", items: "Event T-shirt ×200", more: "", s: "Submitted", eta: "Oct 20, 2026", brand: "Oct 18" },
  { po: "PO-0140", v: "Northwind Supply", items: "Water bottle ×150", more: "+1 more", s: "Submitted", eta: "Oct 23, 2026", brand: "" },
  { po: "PO-0139", v: "Badge & Print Co.", items: "Name badge holders ×500", more: "", s: "Partial", eta: "Oct 16, 2026", brand: "" },
  { po: "PO-0138", v: "Summit Apparel Co.", items: "Event T-shirt ×150", more: "+2 more", s: "Received", eta: "Oct 9, 2026", brand: "" },
  { po: "PO-0137", v: "Northwind Supply", items: "Lanyards ×300", more: "", s: "Received", eta: "Oct 2, 2026", brand: "" },
  { po: "PO-0136", v: "Lakeview Books", items: "Welcome journal ×120", more: "+1 more", s: "Received", eta: "Sep 28, 2026", brand: "" },
];
const NEW_PO = { po: "PO-0142", v: "Summit Apparel Co.", items: "Event T-shirt ×40", more: "+2 more", s: "Draft", eta: "Oct 20, 2026", brand: "Oct 18" };

// The order board's six columns, in the product's order.
const COLS = ["On hold", "New", "Allocated", "Picked", "Packed", "Shipped"];
type Card = { so: string; ch: "Shopify" | "Webhook"; n: string; d: string; item: string; due?: boolean };
const BOARD: Card[][] = [
  [],
  [
    { so: "SO-1214", ch: "Webhook", n: "Noah Bennett", d: "Oct 14 · Ship by Oct 17", item: "Welcome journal" },
    { so: "SO-1213", ch: "Shopify", n: "Grace Okafor", d: "Oct 14 · Ship by Oct 17", item: "Water bottle" },
  ],
  [],
  [],
  [
    { so: "SO-1207", ch: "Shopify", n: "Samuel Ortiz", d: "Oct 11 · Ship by Oct 13", item: "Event T-shirt · L", due: true },
    { so: "SO-1205", ch: "Webhook", n: "Maya Lindqvist", d: "Oct 11 · Ship by Oct 14", item: "Welcome journal" },
  ],
  [
    { so: "SO-1203", ch: "Shopify", n: "Owen Park", d: "Oct 10", item: "Event T-shirt · M" },
    { so: "SO-1201", ch: "Webhook", n: "Hannah Reyes", d: "Oct 9", item: "Water bottle" },
  ],
];
const MOVER: Card = { so: "SO-1215", ch: "Shopify", n: "Elena Cruz", d: "Oct 14 · Ship by Oct 17", item: "Event T-shirt · M" };
const BOARD_COUNTS = [0, 14, 0, 0, 37, 128];

// What Reserve stock holds for Leaders Summit 2026: the Summit kit for its 137
// registrations, plus the fixed lines.
const HOLD = 312;

const EVENTS = [
  { n: "Leaders Summit 2026", d: "Thu, Oct 22", at: "Hilltop Conference Center", reg: 137 },
  { n: "Founders Retreat", d: "Thu, Oct 29", at: "Lakeside Lodge", reg: 31, holding: "Holding 94 units (from the Retreat kit)" },
  { n: "Sales Bootcamp", d: "Thu, Nov 5", at: "Ridgeline HQ", reg: 41, holding: "" },
];

const COUNTS = [
  { n: "Cycle count — Apparel", where: "Main Warehouse · APP", who: "Priya Nair", due: "Oct 16", total: 48, live: true },
  { n: "Cycle count — AV and tech", where: "Main Warehouse · AVT", who: "Marcus Hale", due: "Oct 2", total: 37, s: "Approved" },
  { n: "Cycle count — Event supplies", where: "Event trailer", who: "Theo Barnes", due: "Sep 25", total: 118, s: "Approved" },
  { n: "Cycle count — Books", where: "Main Warehouse · BOK", who: "Unassigned", due: "—", total: 26, s: "Cancelled" },
];
const COUNT_FROM = 31;

const FORECAST = [
  { n: "Lanyards", sku: "SUP-LNY-STD", b: "Consumable" as Behavior, msg: "Runs out around Oct 20.", tail: "Order now: with a 2-week lead time, an order lands after that.", by: "Driven by 210 for events", on: 85, order: 240, low: 100, red: true },
  { n: "Event T-shirt", sku: "APP-TEE-EVT-L", b: "Merch" as Behavior, msg: "Runs out around Oct 29.", tail: "Order by Oct 15 to arrive in time.", by: "Driven by 168 for events", on: 96, order: 120, low: 60, red: true },
  { n: "Welcome journal", sku: "BOK-JRN-WLC", b: "Merch" as Behavior, msg: "Already below its reorder point (123 available, reorder point 150).", tail: "Order now (2-week lead time).", by: "Driven by 137 for events", on: 260, order: 64, low: 150, red: false },
];

const ASSETS = [
  { tag: "LAP-0012", n: "MacBook Air 13\"", who: "Dana Whitfield", cond: "Good", out: true },
  { tag: "LAP-0015", n: "MacBook Air 13\"", who: "Priya Nair", cond: "Good", out: true },
  { tag: "CAM-0004", n: "Mirrorless camera kit", who: "Marcus Hale", cond: "Fair", out: true },
  { tag: "PRJ-0002", n: "Portable projector", who: "Main Warehouse", cond: "Good", out: false },
  { tag: "MIC-0021", n: "Wireless mic kit", who: "Event trailer", cond: "Needs repair", out: false },
];

const SELL = [
  { sku: "APP-TEE-EVT-M", n: "Event T-shirt", sub: "Medium", sh: 186, on: 120, av: 73 },
  { sku: "MER-BTL-STL", n: "Water bottle", sub: "Steel", sh: 142, on: 188, av: 184 },
  { sku: "BOK-JRN-WLC", n: "Welcome journal", sub: "", sh: 131, on: 260, av: 123 },
  { sku: "APP-TEE-EVT-L", n: "Event T-shirt", sub: "Large", sh: 118, on: 96, av: 56 },
];

const SCAN_SKU = "APP-TEE-EVT";

const VARIANTS = [
  { sku: "APP-TEE-EVT-S", v: "Small", on: 48, av: 27, at: 30 },
  { sku: "APP-TEE-EVT-M", v: "Medium", on: 120, av: 73, at: 60 },
  { sku: "APP-TEE-EVT-L", v: "Large", on: 96, av: 56, at: 60, low: true },
  { sku: "APP-TEE-EVT-XL", v: "XL", on: 64, av: 40, at: 30 },
  { sku: "APP-TEE-EVT-2XL", v: "2XL", on: 30, av: 20, at: 15 },
];
const HISTORY = [
  { what: "Held for Leaders Summit 2026", who: "Dana Whitfield", when: "Today, 9:12 AM", q: "−137 available", tone: "amber" as const },
  { what: "Shopify order SO-1215 allocated", who: "Shopify", when: "Today, 8:47 AM", q: "−1 available", tone: "amber" as const },
  { what: "Counted · Apparel shelf", who: "Priya Nair", when: "Oct 12", q: "−2 on hand", tone: "red" as const },
  { what: "Received · PO-0138", who: "Marcus Hale", when: "Oct 9", q: "+150 on hand", tone: "green" as const },
  { what: "Moved to Event trailer", who: "Theo Barnes", when: "Oct 6", q: "24 moved", tone: "grey" as const },
];

const AVAILABLE = 12480;
const LOW = 23;
const INBOUND = 1150;
const ON_HAND = 14906;

// ---------------------------------------------------------------- scene
type Scene = {
  dim: boolean;
  view: Tab | "item";
  /** The New purchase order dialog is open over Browse. */
  poOpen: boolean;
  /** PO-0142 has landed at the top of the Purchasing list. */
  poDrafted: boolean;
  /** Which board column the Shopify order is in. */
  col: number;
  /** Leaders Summit 2026's stock is held. */
  reserved: boolean;
  counted: number;
  /** What has been typed into Scan or search a SKU. */
  scan: string;
  itab: "variants" | "history";
  toast: string | null;
};
const BLANK: Scene = {
  dim: false,
  view: "browse",
  poOpen: false,
  poDrafted: false,
  col: 1,
  reserved: false,
  counted: COUNT_FROM,
  scan: "",
  itab: "variants",
  toast: null,
};
// The frame shown under prefers-reduced-motion: the Events tab with the
// summit's stock held. One shot that still tells the story.
const STILL: Scene = { ...BLANK, view: "events", reserved: true, poDrafted: true };

export default function InventoryHqHeroTour() {
  const hostRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<SVGSVGElement>(null);
  const rippleRef = useRef<HTMLSpanElement>(null);

  const inView = useInView(hostRef, { margin: "-60px" });
  const reduce = useReducedMotion() ?? false;

  // Always BLANK on the first render, even under reduced motion: the server
  // cannot know the visitor's setting, so starting from STILL here would render
  // different text on the client and fail hydration. The tour effect swaps in
  // STILL straight after mount.
  const [scene, setScene] = useState<Scene>(BLANK);
  const [scaled, setScaled] = useState(false);
  const [scale, setScale] = useState(1);
  const [boxH, setBoxH] = useState<number | undefined>(undefined);

  const runRef = useRef(0);
  const scaleRef = useRef(1);
  const posRef = useRef({ x: 560, y: 260 });

  // ---- fluid width with a scale-down floor at MIN_W
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const measure = () => {
      const hw = host.clientWidth;
      if (hw <= 0) return;
      if (hw >= MIN_W) {
        scaleRef.current = 1;
        setScale(1);
        setScaled(false);
      } else {
        const s = hw / MIN_W;
        scaleRef.current = s;
        setScale(s);
        setScaled(true);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(host);
    return () => ro.disconnect();
  }, []);

  // ---- when scaled, collapse the wrapper to the visual height
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const upd = () => {
      const s = scaleRef.current;
      setBoxH(s < 1 ? stage.offsetHeight * s : undefined);
    };
    upd();
    const ro = new ResizeObserver(upd);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [scale]);

  // ---- the tour
  useEffect(() => {
    if (reduce) {
      setScene(STILL);
      return;
    }
    if (!inView) return;

    const gen = ++runRef.current;
    const alive = () => gen === runRef.current;
    const wait = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));
    const patch = (p: Partial<Scene>) => {
      if (alive()) setScene((s) => ({ ...s, ...p }));
    };

    const setCursor = (x: number, y: number) => {
      posRef.current = { x, y };
      if (cursorRef.current) cursorRef.current.style.transform = `translate(${x}px,${y}px)`;
    };

    // Positions are in unscaled stage units, so divide out the CSS scale.
    const pointAt = (sel: string, fx = 0.5, fy = 0.5) => {
      const stage = stageRef.current;
      const node = stage?.querySelector(`[data-ih="${sel}"]`);
      if (!stage || !node) return posRef.current;
      const s = stage.getBoundingClientRect();
      const t = node.getBoundingClientRect();
      const k = scaleRef.current || 1;
      if (t.width === 0 && t.height === 0) return posRef.current;
      return {
        x: (t.left - s.left) / k + (t.width / k) * fx,
        y: (t.top - s.top) / k + (t.height / k) * fy,
      };
    };

    const glide = async (pt: { x: number; y: number }, dur = 620) => {
      const c = cursorRef.current;
      const from = posRef.current;
      if (!c) return;
      const a = c.animate(
        [{ transform: `translate(${from.x}px,${from.y}px)` }, { transform: `translate(${pt.x}px,${pt.y}px)` }],
        { duration: dur, easing: EASE, fill: "forwards" },
      );
      try {
        await a.finished;
      } catch {
        /* cancelled */
      }
      a.cancel();
      setCursor(pt.x, pt.y);
    };

    const click = async () => {
      const c = cursorRef.current;
      const r = rippleRef.current;
      const { x, y } = posRef.current;
      const anims: Animation[] = [];
      if (r) {
        r.style.left = `${x}px`;
        r.style.top = `${y}px`;
        anims.push(
          r.animate(
            [
              { transform: "translate(-50%,-50%) scale(.35)", opacity: 0.95 },
              { transform: "translate(-50%,-50%) scale(1.5)", opacity: 0 },
            ],
            { duration: 460, easing: "ease-out" },
          ),
        );
      }
      if (c) {
        anims.push(
          c.animate(
            [
              { transform: `translate(${x}px,${y}px) scale(1)` },
              { transform: `translate(${x}px,${y}px) scale(.82)` },
              { transform: `translate(${x}px,${y}px) scale(1)` },
            ],
            { duration: 240, easing: "ease-out" },
          ),
        );
      }
      try {
        await Promise.all(anims.map((a) => a.finished));
      } catch {
        /* cancelled */
      }
      anims.forEach((a) => a.cancel());
      setCursor(x, y);
    };

    const fade = async (to: number, dur = 280) => {
      const c = cursorRef.current;
      if (!c) return;
      const a = c.animate([{ opacity: c.style.opacity || "0" }, { opacity: `${to}` }], {
        duration: dur,
        fill: "forwards",
      });
      try {
        await a.finished;
      } catch {
        /* cancelled */
      }
      if (alive()) c.style.opacity = `${to}`;
    };

    /**
     * Glide to a target and press it. `p` lands the moment the press starts,
     * the way a real UI responds on mousedown-ish timing, rather than after
     * the press animation has finished.
     */
    const tap = async (sel: string, dur = 560, p?: Partial<Scene>, fx = 0.5, fy = 0.5) => {
      await glide(pointAt(sel, fx, fy), dur);
      if (!alive()) return false;
      await wait(70);
      if (!alive()) return false;
      const pressed = click();
      if (p) patch(p);
      await pressed;
      return alive();
    };

    /** Click a tab and hold on its screen long enough to read it. */
    const visit = async (sel: string, p: Partial<Scene>, hold: number, dur = 560) => {
      if (!(await tap(sel, dur, p))) return false;
      await wait(hold);
      return alive();
    };

    (async function loop() {
      while (alive()) {
        setScene(BLANK);
        setCursor(560, 300);
        await fade(1, 260);
        if (!alive()) return;
        await wait(1300);

        // ---- an event is short: draft the PO from the warning
        if (!(await tap("draft-po", 640, { poOpen: true }))) return;
        await wait(1500);
        if (!(await tap("create-po", 620))) return;
        patch({ poOpen: false, view: "purchasing", poDrafted: true, toast: "PO-0142 drafted. Nothing changes stock until you receive it." });
        await wait(2000);
        patch({ toast: null });

        // ---- across the tabs
        if (!(await visit("tab-stock", { view: "stock" }, 1800, 600))) return;
        if (!(await visit("tab-orders", { view: "orders" }, 700))) return;
        for (let c = 2; c <= 4; c++) {
          if (!alive()) return;
          patch({ col: c });
          await wait(720);
        }
        await wait(500);
        if (!(await visit("tab-events", { view: "events" }, 600))) return;
        if (!(await tap("reserve", 600, { reserved: true, toast: `${HOLD} units held for Leaders Summit 2026. They no longer count as available.` }))) return;
        await wait(2000);
        patch({ toast: null });
        if (!(await visit("tab-counts", { view: "counts" }, 300))) return;
        for (let n = COUNT_FROM + 1; n <= COUNTS[0].total; n++) {
          if (!alive()) return;
          patch({ counted: n });
          await wait(55);
        }
        await wait(1000);
        if (!(await visit("tab-forecast", { view: "forecast" }, 2000))) return;
        if (!(await visit("tab-assets", { view: "assets" }, 1600))) return;
        if (!(await visit("tab-insights", { view: "insights" }, 1900))) return;

        // ---- scan a SKU and open its record
        if (!(await tap("scan", 640, undefined, 0.3))) return;
        for (let i = 1; i <= SCAN_SKU.length; i++) {
          if (!alive()) return;
          patch({ scan: SCAN_SKU.slice(0, i) });
          await wait(55);
        }
        await wait(350);
        patch({ view: "item" });
        await wait(1700);
        if (!(await visit("itab-history", { itab: "history" }, 2400, 600))) return;

        if (!alive()) return;
        patch({ dim: true });
        await fade(0, 320);
        await wait(560);
      }
    })();

    return () => {
      runRef.current++;
      cursorRef.current?.getAnimations().forEach((a) => a.cancel());
      rippleRef.current?.getAnimations().forEach((a) => a.cancel());
    };
  }, [inView, reduce]);

  const inModule = scene.view !== "item";
  const nav = scene.view === "item" ? "stock" : scene.view;

  return (
    <div ref={hostRef} className="w-full">
      <div style={{ height: boxH }}>
        <div
          ref={stageRef}
          className="relative"
          style={{
            width: scaled ? MIN_W : "100%",
            transform: scaled ? `scale(${scale})` : undefined,
            transformOrigin: "top left",
          }}
        >
          <div
            className="relative flex overflow-hidden rounded-2xl border border-black/5 text-left transition-opacity duration-[520ms] ease-out"
            style={{
              height: STAGE_H,
              background: "#F7F6F3",
              opacity: scene.dim ? 0 : 1,
              boxShadow: "0 30px 60px -30px rgba(40,30,15,0.45), 0 2px 6px -3px rgba(40,30,15,0.12)",
            }}
          >
            <Sidebar active={nav} />
            <div className="relative min-w-0 flex-1">
              {/* The module's header, tiles and tabs, shared by every tab. */}
              <Fade on={inModule} from="left">
                <ModuleHeader scene={scene} />
                <div className="relative mt-3" style={{ height: STAGE_H - 196 }}>
                  <Fade on={scene.view === "browse"}>
                    <Browse />
                  </Fade>
                  <Fade on={scene.view === "stock"}>
                    <StockTable />
                  </Fade>
                  <Fade on={scene.view === "purchasing"}>
                    <Purchasing drafted={scene.poDrafted} />
                  </Fade>
                  <Fade on={scene.view === "orders"}>
                    <Orders col={scene.col} />
                  </Fade>
                  <Fade on={scene.view === "events"}>
                    <EventsTab reserved={scene.reserved} />
                  </Fade>
                  <Fade on={scene.view === "counts"}>
                    <Counts counted={scene.counted} />
                  </Fade>
                  <Fade on={scene.view === "forecast"}>
                    <Forecast />
                  </Fade>
                  <Fade on={scene.view === "assets"}>
                    <Assets />
                  </Fade>
                  <Fade on={scene.view === "insights"}>
                    <Insights />
                  </Fade>
                </div>
              </Fade>
              <Fade on={!inModule} from="right">
                <ItemRecord tab={scene.itab} />
              </Fade>

              {/* The New purchase order dialog, over the module. */}
              <div
                className="absolute inset-0 z-10 grid place-items-center transition-opacity duration-200"
                style={{ background: "rgba(15,20,30,0.32)", opacity: scene.poOpen ? 1 : 0, pointerEvents: scene.poOpen ? "auto" : "none" }}
              >
                <PoDialog open={scene.poOpen} />
              </div>
            </div>

            {/* The toast sits over every screen, bottom centre, the way the app shows them. */}
            <div
              className="pointer-events-none absolute bottom-5 left-1/2 z-20 flex items-center gap-2 rounded-[10px] px-3.5 py-2.5 text-[11.5px] font-semibold text-white transition-all duration-300"
              style={{
                marginLeft: SIDEBAR_W / 2,
                background: NAVY,
                opacity: scene.toast ? 1 : 0,
                transform: `translateX(-50%) translateY(${scene.toast ? 0 : 8}px)`,
                boxShadow: "0 14px 30px -12px rgba(15,27,45,0.55)",
                whiteSpace: "nowrap",
              }}
            >
              <span className="grid h-[16px] w-[16px] place-items-center rounded-full" style={{ background: GREEN }}>
                <Check className="h-[10px] w-[10px]" />
              </span>
              {scene.toast}
            </div>

            <span
              ref={rippleRef}
              className="pointer-events-none absolute z-30 h-[34px] w-[34px] rounded-full opacity-0"
              style={{ background: `${ORANGE}55` }}
            />
            <svg
              ref={cursorRef}
              viewBox="0 0 24 24"
              className="pointer-events-none absolute left-0 top-0 z-40 h-[22px] w-[22px]"
              style={{ opacity: 0, filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.28))", transform: "translate(560px,300px)" }}
              aria-hidden="true"
            >
              <path
                d="M5.5 2.5l12.4 8.1-5.2.7 3 6.2-2.5 1.2-3-6.2-3.4 3.6z"
                fill="#fff"
                stroke={INK}
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- plumbing
/**
 * A full-size layer that crossfades. The incoming layer sits ON TOP with the
 * app's own background, so it covers the outgoing one as it fades in: no
 * ghosting of two tables through each other, and no blank gap between screens.
 */
function Fade({ on, from, children }: { on: boolean; from?: "left" | "right"; children: React.ReactNode }) {
  const shift = from === "left" ? "translateX(-10px)" : from === "right" ? "translateX(10px)" : "translateY(4px)";
  return (
    <div
      className="absolute inset-0"
      style={{
        background: "#F7F6F3",
        zIndex: on ? 2 : 1,
        opacity: on ? 1 : 0,
        transform: on ? "none" : shift,
        pointerEvents: on ? "auto" : "none",
        transitionProperty: "opacity, transform",
        transitionDuration: on ? "260ms" : "0ms",
        transitionDelay: on ? "0ms" : "260ms",
        transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)",
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

function Pill({ children, tone }: { children: React.ReactNode; tone: "green" | "amber" | "grey" | "red" | "blue" | "purple" | "teal" }) {
  const t = {
    green: { background: `${GREEN}16`, color: GREEN },
    amber: { background: `${AMBER}1C`, color: AMBER },
    grey: { background: "#EEECE8", color: MUTED },
    red: { background: "#FBE4E1", color: "#B4322A" },
    blue: { background: `${BLUE}16`, color: BLUE },
    purple: { background: `${PURPLE}16`, color: PURPLE },
    teal: { background: `${TEAL}16`, color: TEAL },
  }[tone];
  return (
    <span className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-2 py-[2px] text-[9px] font-bold" style={t}>
      {children}
    </span>
  );
}

const BEHAVIOR_TONE: Record<Behavior, "green" | "blue" | "purple"> = { Reusable: "green", Consumable: "blue", Merch: "purple" };

const fmt = (n: number) => n.toLocaleString("en-US");

/** The light, bordered button the app uses for secondary actions. */
function Btn({ children, dark, ih }: { children: React.ReactNode; dark?: boolean; ih?: string }) {
  return (
    <span
      data-ih={ih}
      className="flex flex-none items-center gap-1.5 whitespace-nowrap rounded-[8px] border px-2.5 py-[5px] text-[10px] font-semibold"
      style={dark ? { background: NAVY, borderColor: NAVY, color: "#fff" } : { background: "#fff", borderColor: HAIR2, color: INK }}
    >
      {children}
    </span>
  );
}

function TableHead({ cols, tpl }: { cols: string[]; tpl: string }) {
  return (
    <div
      className="grid border-b px-4 py-2 text-[8.5px] font-bold uppercase tracking-[0.1em]"
      style={{ gridTemplateColumns: tpl, borderColor: HAIR, color: MUTED2, background: "#FBFAF8" }}
    >
      {cols.map((c, i) => (
        // Numbers sit right; Status follows Progress in the counts table, so it
        // gets the same left padding its pills have.
        <span
          key={c}
          className={i > 0 && /^(On hand|Allocated|Reserved|Available|Inbound|SKUs|Shipped|Progress|Average days|Samples|Reorder at)$/i.test(c) ? "text-right" : c === "Status" ? "pl-3" : ""}
        >
          {c}
        </span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- sidebar
function Sidebar({ active }: { active: string }) {
  const above = [
    { l: "Dashboard", icon: Dash },
    { l: "One Page Plan", icon: Target },
    { l: "Calendars", icon: Cal },
    { l: "Events HQ", icon: CalDays },
  ];
  const below = [
    { l: "Multi AI", icon: Target },
    { l: "People HQ", icon: People },
  ];
  return (
    <div className="flex flex-none flex-col border-r bg-white px-2.5 py-3" style={{ width: SIDEBAR_W, borderColor: HAIR }}>
      <div className="mb-3 flex items-center gap-2 rounded-[9px] border px-2.5 py-2" style={{ borderColor: HAIR }}>
        <span className="grid h-[18px] w-[18px] place-items-center rounded-[5px] text-[9px] font-extrabold text-white" style={{ background: INK }}>
          R
        </span>
        <span className="text-[11px] font-semibold">Ridgeline Services</span>
      </div>
      {above.map((n) => (
        <NavRow key={n.l} {...n} />
      ))}
      <div className="mt-0.5 flex items-center gap-2 rounded-[8px] px-2 py-[6px] text-[11px] font-semibold" style={{ background: `${ORANGE}14`, color: ORANGE }}>
        <Boxes className="h-[13px] w-[13px] flex-none" />
        Inventory HQ
        <Chevron className="ml-auto h-[11px] w-[11px]" />
      </div>
      <div className="ml-3 mt-1 border-l pl-2" style={{ borderColor: HAIR }}>
        {SUBNAV.map((n) => {
          const Ico = n.icon;
          const on = n.k === active;
          return (
            <div
              key={n.l}
              className="flex items-center gap-2 rounded-[7px] px-2 py-[4.5px] text-[10.5px] transition-colors duration-300"
              style={on ? { background: `${ORANGE}10`, color: ORANGE, fontWeight: 600 } : { color: "#5C5852" }}
            >
              <Ico className="h-[12px] w-[12px] flex-none" style={{ color: on ? ORANGE : MUTED2 }} />
              {n.l}
              {on && <span className="ml-auto h-[5px] w-[5px] rounded-full" style={{ background: ORANGE }} />}
            </div>
          );
        })}
      </div>
      <div className="mt-1">
        {below.map((n) => (
          <NavRow key={n.l} {...n} />
        ))}
      </div>
    </div>
  );
}

function NavRow({ l, icon: Ico }: { l: string; icon: (p: IconProps) => React.JSX.Element }) {
  return (
    <div className="flex items-center gap-2 rounded-[8px] px-2 py-[6px] text-[11px]" style={{ color: "#4A4740" }}>
      <Ico className="h-[13px] w-[13px] flex-none" style={{ color: MUTED }} />
      {l}
    </div>
  );
}

// ---------------------------------------------------------------- the module
function ModuleHeader({ scene }: { scene: Scene }) {
  const available = AVAILABLE - (scene.reserved ? HOLD : 0);
  const tiles = [
    { l: "Available", v: fmt(available), s: "286 SKUs tracked", c: GREEN, icon: Box },
    { l: "Low stock", v: String(LOW), s: "Below reorder point", c: AMBER, icon: Warn },
    { l: "Inbound", v: fmt(INBOUND), s: "On open purchase orders", c: BLUE, icon: Truck },
    { l: "On hand", v: fmt(ON_HAND), s: "Physically in the building", c: PURPLE, icon: Boxes },
  ];
  const typing = scene.scan.length > 0;
  return (
    <div className="px-6 pt-4">
      <div className="flex items-start">
        <div>
          <div className="text-[18px] font-bold tracking-tight">Inventory HQ</div>
          <div className="mt-0.5 text-[10.5px]" style={{ color: MUTED }}>
            One pool of stock for what you sell and what you take to events.
          </div>
        </div>
        <span className="ml-auto flex items-center gap-1.5">
          <Btn>
            <Pin className="h-[11px] w-[11px]" />
            All locations
            <Chevron className="h-[9px] w-[9px]" />
          </Btn>
          <Btn>
            <People className="h-[11px] w-[11px]" />
            Sharing
          </Btn>
          <span
            data-ih="scan"
            className="flex w-[150px] items-center gap-1.5 rounded-[8px] border bg-white px-2.5 py-[5px] text-[10px] transition-colors duration-200"
            style={{ borderColor: typing ? TEAL : HAIR2, boxShadow: typing ? `0 0 0 3px ${TEAL}1F` : "none" }}
          >
            <Scan className="h-[11px] w-[11px] flex-none" style={{ color: MUTED }} />
            {typing ? (
              <span className="font-mono text-[9.5px] font-semibold" style={{ color: INK }}>
                {scene.scan}
                <span className="ml-[1px] inline-block h-[10px] w-[1px] align-middle" style={{ background: INK }} />
              </span>
            ) : (
              <span style={{ color: MUTED }}>Scan or search a SKU</span>
            )}
          </span>
          <span className="grid h-[25px] w-[25px] place-items-center rounded-[8px] border bg-white" style={{ borderColor: HAIR2 }}>
            <Gear className="h-[12px] w-[12px]" />
          </span>
        </span>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2">
        {tiles.map((t) => (
          <div
            key={t.l}
            className="relative overflow-hidden rounded-[10px] border border-l-[3px] bg-white px-3 py-2"
            style={{ borderColor: HAIR, borderLeftColor: t.c, background: `linear-gradient(135deg, ${t.c}0C, #fff 60%)` }}
          >
            <div className="text-[8px] font-bold uppercase tracking-[0.1em]" style={{ color: MUTED }}>
              {t.l}
            </div>
            <div className="text-[17px] font-bold tabular-nums leading-tight transition-colors duration-300">{t.v}</div>
            <div className="text-[8.5px]" style={{ color: MUTED }}>
              {t.s}
            </div>
            <span className="absolute right-2.5 top-2.5 grid h-[22px] w-[22px] place-items-center rounded-[7px]" style={{ background: `${t.c}18`, color: t.c }}>
              <t.icon className="h-[12px] w-[12px]" />
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-4 border-b text-[10.5px]" style={{ borderColor: HAIR2 }}>
        {TABS.map((t) => (
          <span
            key={t.k}
            data-ih={`tab-${t.k}`}
            className="-mb-px whitespace-nowrap border-b-2 pb-1.5 font-semibold transition-colors duration-300"
            style={scene.view === t.k ? { borderColor: NAVY, color: INK } : { borderColor: "transparent", color: MUTED }}
          >
            {t.l}
          </span>
        ))}
      </div>
    </div>
  );
}

// The What needs a decision panel sits above the tabs in the app. In the tour
// it opens the Browse tab, where the loop starts, so the tabs keep their room.
function Browse() {
  return (
    <div className="px-6">
      <div className="overflow-hidden rounded-[10px] border bg-white" style={{ borderColor: HAIR }}>
        <div className="flex items-center gap-1.5 border-b px-3 py-1.5 text-[10px] font-bold" style={{ borderColor: HAIR }}>
          <Bulb className="h-[11px] w-[11px]" />
          What needs a decision
          <span className="ml-1 font-normal" style={{ color: MUTED }}>
            Read from your event calendar, past deployments and current stock.
          </span>
          <span className="ml-auto font-semibold">Dismiss all for me</span>
        </div>
        <div className="flex items-start gap-2 border-l-[3px] px-3 py-2" style={{ borderLeftColor: RED, background: "#FCF1EF" }}>
          <Warn className="mt-[1px] h-[12px] w-[12px] flex-none" style={{ color: RED }} />
          <div className="min-w-0 flex-1">
            <div className="text-[10.5px] font-semibold">Leaders Summit 2026 is short on 3 items</div>
            <div className="text-[9.5px] leading-snug" style={{ color: "#5C5852" }}>
              Oct 22 (in 8 days): short 40 Event T-shirts (Large), 25 Lanyards and 30 Name badge holders. Order by Oct 15 to arrive in time.
            </div>
            <span data-ih="draft-po" className="mt-0.5 inline-flex items-center gap-0.5 text-[9.5px] font-bold" style={{ color: INK }}>
              Draft a PO ›
            </span>
          </div>
          <span className="text-[11px]" style={{ color: MUTED2 }}>
            ×
          </span>
        </div>
      </div>

      <div className="mt-2.5 grid grid-cols-[170px_1fr] gap-3">
        <div>
          <div className="mb-1 flex items-center text-[8.5px] font-bold uppercase tracking-[0.1em]" style={{ color: MUTED2 }}>
            Folders
          </div>
          <div className="flex items-center gap-1.5 rounded-[7px] px-2 py-[5px] text-[10px] font-semibold text-white" style={{ background: ORANGE }}>
            <Home className="h-[11px] w-[11px]" />
            All items
            <span className="ml-auto opacity-80">286</span>
          </div>
          {FOLDERS.map((f) => (
            <div key={f.n} className="flex items-center gap-1.5 px-2 py-[4.5px] text-[10px]" style={{ color: "#4A4740" }}>
              <Folder className="h-[11px] w-[11px] flex-none" style={{ color: MUTED }} />
              <span className="truncate">{f.n}</span>
              <span className="ml-auto text-[9px]" style={{ color: MUTED2 }}>
                {f.c}
              </span>
            </div>
          ))}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10.5px] font-semibold">All items</span>
            <span className="ml-auto flex w-[150px] items-center gap-1.5 rounded-[8px] border bg-white px-2.5 py-[5px] text-[10px]" style={{ borderColor: HAIR2, color: MUTED }}>
              <Search className="h-[11px] w-[11px]" />
              Search all items
            </span>
            <Btn>
              <Folder className="h-[11px] w-[11px]" />
              Create folder
            </Btn>
            <Btn dark>
              <Plus className="h-[11px] w-[11px]" />
              Add item
            </Btn>
          </div>
          <div className="mt-2 overflow-hidden rounded-[10px] border bg-white" style={{ borderColor: HAIR }}>
            <TableHead cols={["Item", "On hand", "Available"]} tpl="1fr 70px 70px" />
            {ITEMS.map((it) => (
              <div key={it.sku} className="grid items-center border-b px-4 py-[5px] last:border-b-0" style={{ gridTemplateColumns: "1fr 70px 70px", borderColor: HAIR }}>
                <span className="flex min-w-0 items-center gap-2">
                  <span className="grid h-[22px] w-[22px] flex-none place-items-center rounded-[6px]" style={{ background: "#EFEDE9", color: MUTED }}>
                    <Box className="h-[11px] w-[11px]" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[10.5px] font-semibold">{it.n}</span>
                    <span className="block truncate text-[8.5px]" style={{ color: MUTED }}>
                      {it.sku} · {it.skus} SKU{it.skus > 1 ? "s" : ""}
                    </span>
                  </span>
                </span>
                <span className="text-right text-[10.5px] tabular-nums">{it.on}</span>
                <span className="text-right text-[10.5px] tabular-nums">{it.av}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PoDialog({ open }: { open: boolean }) {
  const lines = [
    { n: "Event T-shirt · Large", q: 40, c: "6.50" },
    { n: "Lanyards", q: 25, c: "1.20" },
    { n: "Name badge holders", q: 30, c: "0.80" },
  ];
  return (
    <div
      className="w-[440px] rounded-[14px] border bg-[#FBFAF8] p-4 transition-transform duration-200"
      style={{ borderColor: HAIR2, transform: open ? "scale(1)" : "scale(0.97)", boxShadow: "0 30px 60px -20px rgba(15,20,30,0.45)" }}
    >
      <div className="flex items-start">
        <div>
          <div className="text-[14px] font-bold">New purchase order</div>
          <div className="text-[10px]" style={{ color: MUTED }}>
            Drafts a PO. Nothing changes stock until you receive it.
          </div>
        </div>
        <span className="ml-auto text-[13px]" style={{ color: MUTED }}>
          ×
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <Field l="Vendor" v="Summit Apparel Co." />
        <Field l="Expected arrival" v="Oct 20, 2026" icon />
      </div>
      <div className="mt-2.5 rounded-[10px] border bg-white px-3 py-2" style={{ borderColor: HAIR2 }}>
        <div className="flex items-center">
          <div>
            <div className="text-[10.5px] font-semibold">Branding needed?</div>
            <div className="text-[9px]" style={{ color: MUTED }}>
              If yes, the first delivery is held out of your stock count until branding is marked complete.
            </div>
          </div>
          <span className="ml-auto flex flex-none rounded-[7px] border p-[2px] text-[9.5px] font-semibold" style={{ borderColor: HAIR2 }}>
            <span className="rounded-[5px] px-2 py-[2px] text-white" style={{ background: NAVY }}>
              Yes
            </span>
            <span className="px-2 py-[2px]" style={{ color: MUTED }}>
              No
            </span>
          </span>
        </div>
      </div>
      <div className="mt-2.5 text-[10.5px] font-semibold">Items</div>
      <div className="mt-1 flex flex-col gap-1">
        {lines.map((l) => (
          <div key={l.n} className="grid items-center gap-1.5" style={{ gridTemplateColumns: "1fr 42px 62px" }}>
            <span className="truncate rounded-[7px] border bg-white px-2 py-[4px] text-[10px]" style={{ borderColor: HAIR2 }}>
              {l.n}
            </span>
            <span className="rounded-[7px] border bg-white px-2 py-[4px] text-right text-[10px] tabular-nums" style={{ borderColor: HAIR2 }}>
              {l.q}
            </span>
            <span className="rounded-[7px] border bg-white px-2 py-[4px] text-right text-[10px] tabular-nums" style={{ borderColor: HAIR2 }}>
              ${l.c}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex items-center text-[10px]">
        <span className="flex items-center gap-1 rounded-[7px] border bg-white px-2 py-[3px] font-semibold" style={{ borderColor: HAIR2 }}>
          <Plus className="h-[10px] w-[10px]" />
          Add item
        </span>
        <span className="ml-auto" style={{ color: MUTED }}>
          Subtotal <b style={{ color: INK }}>$314.00</b>
        </span>
      </div>
      <div className="mt-3 flex justify-end gap-1.5">
        <Btn>Cancel</Btn>
        <Btn dark ih="create-po">
          Create PO
        </Btn>
      </div>
    </div>
  );
}

function Field({ l, v, icon }: { l: string; v: string; icon?: boolean }) {
  return (
    <div>
      <div className="mb-1 text-[10px] font-semibold">{l}</div>
      <div className="flex items-center gap-1.5 rounded-[8px] border bg-white px-2.5 py-[5px] text-[10px]" style={{ borderColor: HAIR2 }}>
        {icon && <Cal className="h-[11px] w-[11px]" style={{ color: MUTED }} />}
        {v}
        {!icon && <Chevron className="ml-auto h-[9px] w-[9px]" style={{ color: MUTED }} />}
      </div>
    </div>
  );
}

function StockTable() {
  const tpl = "1.6fr 0.8fr 0.45fr 0.6fr 0.65fr 0.65fr 0.65fr 0.6fr";
  return (
    <div className="px-6">
      <div className="flex items-center gap-1.5">
        <span className="flex w-[150px] items-center gap-1.5 rounded-[8px] border bg-white px-2.5 py-[5px] text-[10px]" style={{ borderColor: HAIR2, color: MUTED }}>
          <Search className="h-[11px] w-[11px]" />
          Search items
        </span>
        <Btn>
          <Warn className="h-[11px] w-[11px]" />
          Low stock
          <span className="rounded-full px-1.5 text-[9px]" style={{ background: `${AMBER}1F`, color: AMBER }}>
            {LOW}
          </span>
        </Btn>
        <span className="rounded-[8px] border border-dashed px-2.5 py-[5px] text-[10px]" style={{ borderColor: HAIR2, color: MUTED }}>
          Division
        </span>
        <span className="rounded-[8px] border border-dashed px-2.5 py-[5px] text-[10px]" style={{ borderColor: HAIR2, color: MUTED }}>
          Behavior
        </span>
        <span className="ml-auto flex gap-1.5">
          <Btn>
            <Clipboard className="h-[11px] w-[11px]" />
            Cycle counts
          </Btn>
          <Btn>Export</Btn>
          <Btn dark>
            <Plus className="h-[11px] w-[11px]" />
            Add item
          </Btn>
        </span>
      </div>
      <div className="mt-2.5 overflow-hidden rounded-[10px] border bg-white" style={{ borderColor: HAIR }}>
        <TableHead cols={["Item", "Behavior", "SKUs", "On hand", "Allocated", "Reserved", "Available", "Inbound"]} tpl={tpl} />
        {STOCK.map((r) => {
          const av = r.on - r.al - r.res;
          return (
            <div key={r.sku} className="grid items-center border-b px-4 py-[4px] text-[10.5px] tabular-nums last:border-b-0" style={{ gridTemplateColumns: tpl, borderColor: HAIR }}>
              <span className="min-w-0">
                <span className="block truncate font-semibold">{r.n}</span>
                <span className="block truncate font-mono text-[8.5px]" style={{ color: MUTED }}>
                  {r.sku}
                </span>
              </span>
              <span>
                <Pill tone={BEHAVIOR_TONE[r.b]}>{r.b}</Pill>
              </span>
              <span className="text-right">{r.skus}</span>
              <span className="text-right">{r.on}</span>
              <span className="text-right" style={{ color: r.al ? INK : MUTED2 }}>
                {r.al || "—"}
              </span>
              <span className="text-right" style={{ color: r.res ? INK : MUTED2 }}>
                {r.res || "—"}
              </span>
              <span className="text-right font-semibold" style={{ color: av < 20 && r.b !== "Reusable" ? AMBER : INK }}>
                {av}
              </span>
              <span className="text-right" style={{ color: r.inb ? BLUE : MUTED2 }}>
                {r.inb || "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Purchasing({ drafted }: { drafted: boolean }) {
  const rows = drafted ? [NEW_PO, ...POS.slice(0, 5)] : POS;
  const tpl = "0.6fr 1fr 1.5fr 0.7fr 0.85fr 0.65fr";
  const tone = (s: string) => (s === "Draft" ? "grey" : s === "Submitted" ? "blue" : s === "Partial" ? "amber" : "green");
  return (
    <div className="px-6">
      <div className="flex items-center">
        <span className="flex rounded-[9px] border bg-white p-[2px] text-[10px] font-semibold" style={{ borderColor: HAIR2 }}>
          <span className="rounded-[7px] px-2.5 py-[3px]" style={{ background: "#F3F1EC" }}>
            Purchase orders
          </span>
          <span className="flex items-center gap-1 px-2.5 py-[3px]" style={{ color: MUTED }}>
            Branding
            <span className="rounded-full px-1.5 text-[9px]" style={{ background: `${PURPLE}18`, color: PURPLE }}>
              1
            </span>
          </span>
        </span>
        <span className="ml-auto">
          <Btn dark>
            <Plus className="h-[11px] w-[11px]" />
            New PO
          </Btn>
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2 rounded-[10px] border px-3 py-2" style={{ borderColor: "#EED9A6", background: "#FCF5E6" }}>
        <Warn className="h-[13px] w-[13px] flex-none" style={{ color: AMBER }} />
        <span className="min-w-0 flex-1">
          <span className="block text-[10.5px] font-bold">{LOW} SKUs below their reorder point</span>
          <span className="block truncate text-[9px]" style={{ color: "#7A5418" }}>
            Lanyards (12 left), Event T-shirt · Large (56 left), Welcome journal (123 left), +20 more
          </span>
        </span>
        <Btn dark>Draft purchase order</Btn>
      </div>
      <div className="mt-2 overflow-hidden rounded-[10px] border bg-white" style={{ borderColor: HAIR }}>
        <TableHead cols={["PO", "Vendor", "Items", "Status", "Expected arrival", "Branding due"]} tpl={tpl} />
        {rows.map((p) => {
          const fresh = p.po === NEW_PO.po;
          return (
            <div
              key={p.po}
              className="grid items-center border-b px-4 py-[6px] text-[10.5px] last:border-b-0"
              style={{ gridTemplateColumns: tpl, borderColor: HAIR, background: fresh ? `${TEAL}0D` : "#fff" }}
            >
              <span className="font-mono text-[9.5px] font-semibold">{p.po}</span>
              <span className="truncate">{p.v}</span>
              <span className="flex min-w-0 items-center gap-1.5">
                <span className="truncate">{p.items}</span>
                {p.more && (
                  <span className="flex-none rounded-[4px] px-1 text-[8.5px]" style={{ background: "#EEECE8", color: MUTED }}>
                    {p.more}
                  </span>
                )}
              </span>
              <span>
                <Pill tone={tone(p.s)}>{p.s}</Pill>
              </span>
              <span className="tabular-nums">{p.s === "Draft" ? "—" : p.eta}</span>
              <span style={{ color: p.brand ? PURPLE : MUTED2 }}>{p.brand || "—"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrderCard({ c, hot }: { c: Card; hot?: boolean }) {
  return (
    <div
      className="mb-1.5 rounded-[9px] border bg-white px-2 py-1.5 transition-shadow duration-300"
      style={{ borderColor: hot ? TEAL : HAIR, boxShadow: hot ? `0 0 0 2px ${TEAL}26, 0 6px 14px -8px rgba(20,40,60,0.4)` : "none" }}
    >
      <div className="flex items-center">
        <span className="font-mono text-[8.5px] font-semibold">{c.so}</span>
        <span className="ml-auto rounded-[4px] px-1 text-[7.5px] font-bold uppercase" style={c.ch === "Shopify" ? { background: "#E7F4EA", color: "#2C7A3F" } : { background: "#EEECE8", color: MUTED }}>
          {c.ch}
        </span>
      </div>
      <div className="mt-0.5 truncate text-[10px] font-semibold">{c.n}</div>
      <div className="truncate text-[8.5px]" style={{ color: c.due ? RED : MUTED }}>
        {c.d}
      </div>
      <div className="truncate text-[8.5px] font-semibold">{c.item}</div>
      <div className="mt-0.5 flex items-center gap-1 text-[8.5px]" style={{ color: MUTED }}>
        1 unit
        {c.due && <Pill tone="red">Past due</Pill>}
      </div>
    </div>
  );
}

function Orders({ col }: { col: number }) {
  return (
    <div className="px-6">
      <div className="flex items-center gap-1.5">
        <span className="flex w-[140px] items-center gap-1.5 rounded-[8px] border bg-white px-2.5 py-[5px] text-[10px]" style={{ borderColor: HAIR2, color: MUTED }}>
          <Search className="h-[11px] w-[11px]" />
          Search orders
        </span>
        {["Type", "Status", "Order date", "Past due"].map((f) => (
          <span key={f} className="rounded-[8px] border border-dashed px-2 py-[5px] text-[10px]" style={{ borderColor: HAIR2, color: MUTED }}>
            {f}
          </span>
        ))}
        <Btn>
          All channels
          <Chevron className="h-[9px] w-[9px]" />
        </Btn>
        <span className="ml-auto">
          <Btn dark>
            <Plus className="h-[11px] w-[11px]" />
            New order
          </Btn>
        </span>
      </div>
      <div className="mt-2.5 grid grid-cols-6 gap-1.5">
        {COLS.map((name, i) => {
          const n = BOARD_COUNTS[i] + (col === i ? 1 : 0);
          return (
            <div key={name} className="min-w-0 rounded-[10px] p-1.5" style={{ background: "#EFEDE9", height: 290 }}>
              <div className="mb-1.5 flex items-center px-0.5 text-[8.5px] font-bold uppercase tracking-[0.06em]" style={{ color: "#5C5852" }}>
                {name}
                <span className="ml-auto tabular-nums" style={{ color: MUTED }}>
                  {n}
                </span>
              </div>
              {col === i && <OrderCard c={MOVER} hot />}
              {BOARD[i].map((c) => (
                <OrderCard key={c.so} c={c} />
              ))}
              {n === 0 && <div className="h-[46px] rounded-[8px] border border-dashed" style={{ borderColor: "#D9D5CD" }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EventsTab({ reserved }: { reserved: boolean }) {
  return (
    <div className="px-6">
      <div className="flex items-end">
        <div>
          <div className="text-[11.5px] font-bold">Upcoming events</div>
          <div className="text-[9.5px]" style={{ color: MUTED }}>
            Reserved stock disappears from what&rsquo;s available to sell, so a storefront can never sell the shirts an event is already holding.
          </div>
        </div>
      </div>
      <div className="mt-2 flex gap-1.5">
        <Btn>Event draw-down</Btn>
        <Btn>
          <Cal className="h-[11px] w-[11px]" />
          Gear calendar
        </Btn>
        <Btn dark>
          <Box className="h-[11px] w-[11px]" />
          Kits (3)
        </Btn>
      </div>
      <div className="mt-2.5 flex flex-col gap-2">
        {EVENTS.map((e, i) => {
          const holding = i === 0 ? (reserved ? `Holding ${HOLD} units (Summit kit × ${e.reg} registered)` : "") : e.holding;
          return (
            <div
              key={e.n}
              className="rounded-[10px] border bg-white px-3.5 py-2.5 transition-colors duration-300"
              style={{ borderColor: i === 0 && reserved ? `${GREEN}66` : HAIR }}
            >
              <div className="text-[11.5px] font-semibold">{e.n}</div>
              <div className="text-[9.5px]" style={{ color: MUTED }}>
                {e.d} · {e.at} · Gear from Main Warehouse · {e.reg} registered
              </div>
              <div className="mt-0.5 flex items-center gap-1 text-[9px]" style={{ color: holding ? GREEN : MUTED }}>
                {holding ? <Lock className="h-[10px] w-[10px]" /> : null}
                {holding || "Nothing reserved yet"}
              </div>
              {i < 2 && (
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="px-1 text-[10px] font-semibold">Stock report</span>
                  <span className="px-1 text-[10px] font-semibold">Sizes</span>
                  <Btn ih={i === 0 ? "reserve" : undefined}>
                    <Lock className="h-[10px] w-[10px]" />
                    Reserve stock
                  </Btn>
                  <Btn>
                    <Cart className="h-[10px] w-[10px]" />
                    Fulfil
                  </Btn>
                  <span className="px-1 text-[10px] font-semibold">Release</span>
                  <Btn dark>
                    <Plus className="h-[10px] w-[10px]" />
                    Plan gear
                  </Btn>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Counts({ counted }: { counted: number }) {
  const tpl = "1.5fr 1.2fr 0.9fr 0.6fr 0.6fr 0.95fr";
  const live = COUNTS[0];
  const done = counted >= live.total;
  return (
    <div className="px-6">
      <div className="flex items-center">
        <span className="flex rounded-[9px] border bg-white p-[2px] text-[10px] font-semibold" style={{ borderColor: HAIR2 }}>
          <span className="flex items-center gap-1 rounded-[7px] px-2.5 py-[3px]" style={{ background: "#F3F1EC" }}>
            <Clipboard className="h-[11px] w-[11px]" />
            Counts
            <span className="rounded-full px-1.5 text-[9px]" style={{ background: `${BLUE}18`, color: BLUE }}>
              1
            </span>
          </span>
          <span className="flex items-center gap-1 px-2.5 py-[3px]" style={{ color: MUTED }}>
            <Dash className="h-[11px] w-[11px]" />
            Groups
          </span>
        </span>
        <span className="ml-auto flex gap-1.5">
          <Btn>Count now</Btn>
          <Btn dark>
            <People className="h-[11px] w-[11px]" />
            Assign a count
          </Btn>
        </span>
      </div>
      <div className="mt-2.5 overflow-hidden rounded-[10px] border bg-white" style={{ borderColor: HAIR }}>
        <TableHead cols={["Count", "Where", "Counter", "Due", "Progress", "Status"]} tpl={tpl} />
        {COUNTS.map((c, i) => {
          const first = i === 0;
          const n = first ? counted : c.s === "Cancelled" ? 0 : c.total;
          return (
            <div key={c.n} className="grid items-center border-b px-4 py-[7px] text-[10.5px] last:border-b-0" style={{ gridTemplateColumns: tpl, borderColor: HAIR }}>
              <span className="truncate" style={{ fontWeight: first ? 700 : 400, color: c.s === "Cancelled" ? MUTED : INK }}>
                {c.n}
              </span>
              <span className="truncate" style={{ color: MUTED }}>
                {c.where}
              </span>
              <span className="truncate" style={{ fontWeight: first ? 600 : 400, color: c.who === "Unassigned" ? MUTED : INK }}>
                {c.who}
              </span>
              <span style={{ color: MUTED }}>{c.due}</span>
              <span className="text-right tabular-nums">
                {n} / {c.total}
              </span>
              <span className="pl-3">
                {first ? (
                  <Pill tone={done ? "teal" : "blue"}>{done ? "For approval" : "In progress"}</Pill>
                ) : (
                  <Pill tone={c.s === "Approved" ? "green" : "grey"}>{c.s}</Pill>
                )}
              </span>
            </div>
          );
        })}
      </div>
      {/* The live count's sheet, filling as the shelf gets counted. */}
      <div className="mt-2.5 rounded-[10px] border bg-white px-3.5 py-2.5" style={{ borderColor: HAIR }}>
        <div className="flex items-center text-[10px]">
          <span className="font-semibold">Apparel shelf · counted by Priya Nair</span>
          <span className="ml-auto tabular-nums" style={{ color: MUTED }}>
            {Math.round((counted / live.total) * 100)}%
          </span>
        </div>
        <div className="mt-1.5 h-[5px] overflow-hidden rounded-full" style={{ background: "#EEECE8" }}>
          <div className="h-full rounded-full transition-[width] duration-100" style={{ width: `${(counted / live.total) * 100}%`, background: done ? TEAL : BLUE }} />
        </div>
        <div className="mt-1.5 text-[9.5px]" style={{ color: MUTED }}>
          {done
            ? "Every SKU counted. 2 differences found; the sheet goes to Dana Whitfield, the inventory manager, for approval."
            : "Count the shelf; the sheet goes back to the inventory manager for approval before the record changes."}
        </div>
      </div>
    </div>
  );
}

function Spark({ red }: { red: boolean }) {
  return (
    <svg viewBox="0 0 120 30" className="h-[26px] w-[110px] flex-none">
      <path d="M0 6h120" stroke={AMBER} strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
      {red && <path d="M0 22h120" stroke={RED} strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />}
      <path d={red ? "M0 10 L30 12 L60 18 L90 24 L120 28" : "M0 14 L30 15 L60 16 L90 18 L120 19"} stroke={NAVY} strokeWidth="1.6" fill="none" />
    </svg>
  );
}

function Forecast() {
  return (
    <div className="px-6">
      <div className="flex items-center gap-1.5">
        <span className="flex rounded-[8px] border bg-white p-[2px] text-[9.5px] font-semibold" style={{ borderColor: HAIR2 }}>
          {["1 mo", "3 mo", "6 mo", "9 mo", "12 mo"].map((m) => (
            <span key={m} className="rounded-[6px] px-2 py-[2px]" style={m === "3 mo" ? { background: NAVY, color: "#fff" } : { color: MUTED }}>
              {m}
            </span>
          ))}
        </span>
        <span className="flex rounded-[8px] border bg-white p-[2px] text-[9.5px] font-semibold" style={{ borderColor: HAIR2 }}>
          <span className="rounded-[6px] px-2 py-[2px] text-white" style={{ background: NAVY }}>
            By week
          </span>
          <span className="px-2 py-[2px]" style={{ color: MUTED }}>
            By month
          </span>
        </span>
        <span className="flex rounded-[8px] border bg-white p-[2px] text-[9.5px] font-semibold" style={{ borderColor: HAIR2 }}>
          <span className="rounded-[6px] px-2 py-[2px] text-white" style={{ background: NAVY }}>
            Needs attention
          </span>
          <span className="px-2 py-[2px]" style={{ color: MUTED }}>
            All items
          </span>
        </span>
        <span className="ml-auto text-[9.5px]" style={{ color: MUTED }}>
          Through Jan 14, 2027 · events, open orders and a 90-day sales run rate
        </span>
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-[10.5px] font-bold">
        <Warn className="h-[12px] w-[12px]" style={{ color: AMBER }} />6 items heading for a shortfall
      </div>
      <div className="mt-1.5 flex flex-col gap-1.5">
        {FORECAST.map((f) => (
          <div key={f.sku} className="flex items-center gap-3 rounded-[10px] border bg-white px-3.5 py-2" style={{ borderColor: HAIR }}>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold">{f.n}</span>
                <span className="font-mono text-[8.5px]" style={{ color: MUTED }}>
                  {f.sku}
                </span>
                <Pill tone={BEHAVIOR_TONE[f.b]}>{f.b}</Pill>
              </div>
              <div className="truncate text-[9.5px]">
                <span style={{ color: f.red ? RED : AMBER }}>{f.msg}</span> {f.tail}
              </div>
              <div className="text-[8.5px]" style={{ color: MUTED }}>
                {f.by}
              </div>
            </div>
            <Spark red={f.red} />
            {[
              ["On hand", f.on, INK],
              ["Order", f.order, RED],
              ["Low at", f.low, INK],
            ].map(([l, v, c]) => (
              <div key={l as string} className="w-[46px] flex-none text-right">
                <div className="text-[7.5px] font-bold uppercase tracking-[0.08em]" style={{ color: MUTED }}>
                  {l as string}
                </div>
                <div className="text-[14px] font-bold tabular-nums" style={{ color: c as string }}>
                  {v as number}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Assets() {
  const tpl = "0.75fr 1.4fr 1.2fr 0.9fr 0.9fr";
  return (
    <div className="px-6">
      <div className="flex items-center">
        <span className="text-[10px]" style={{ color: MUTED }}>
          Individual units of serialized gear, each with its own tag, custodian and condition.
        </span>
        <span className="ml-auto">
          <Btn dark>
            <Plus className="h-[11px] w-[11px]" />
            Add unit
          </Btn>
        </span>
      </div>
      <div className="mt-2.5 overflow-hidden rounded-[10px] border bg-white" style={{ borderColor: HAIR }}>
        <TableHead cols={["Tag", "Item", "Custodian", "Condition", "Status"]} tpl={tpl} />
        {ASSETS.map((a) => (
          <div key={a.tag} className="grid items-center border-b px-4 py-[8px] text-[10.5px] last:border-b-0" style={{ gridTemplateColumns: tpl, borderColor: HAIR }}>
            <span className="flex items-center gap-1.5 font-mono text-[9.5px] font-semibold">
              <Tag className="h-[11px] w-[11px]" style={{ color: TEAL }} />
              {a.tag}
            </span>
            <span className="truncate">{a.n}</span>
            <span className="flex items-center gap-1.5 truncate">
              {a.out ? (
                <span className="grid h-[17px] w-[17px] flex-none place-items-center rounded-full text-[7px] font-bold" style={{ background: "#EEECE8", color: "#5C5852" }}>
                  {a.who
                    .split(" ")
                    .map((w) => w[0])
                    .join("")}
                </span>
              ) : (
                <Pin className="h-[11px] w-[11px] flex-none" style={{ color: MUTED }} />
              )}
              {a.who}
            </span>
            <span style={{ color: a.cond === "Needs repair" ? RED : a.cond === "Fair" ? AMBER : INK }}>{a.cond}</span>
            <span>
              <Pill tone={a.out ? "blue" : "grey"}>{a.out ? "Checked out" : "In stock"}</Pill>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Insights() {
  const tpl = "1fr 1fr 0.7fr 0.6fr";
  const tpl2 = "1.1fr 1.3fr 0.6fr 0.6fr 0.6fr";
  return (
    <div className="px-6">
      <div className="text-[11px] font-bold">Order to first shipment</div>
      <div className="text-[9.5px]" style={{ color: MUTED }}>
        Orders placed in the last 30 days, grouped by source and order type.
      </div>
      <div className="mt-1.5 overflow-hidden rounded-[10px] border bg-white" style={{ borderColor: HAIR }}>
        <TableHead cols={["Source", "Order type", "Average days", "Samples"]} tpl={tpl} />
        {[
          ["Shopify", "Online store", "1.6", "84"],
          ["Webhook", "Sign-up gift box", "2.3", "41"],
        ].map((r) => (
          <div key={r[0]} className="grid items-center border-b px-4 py-[6px] text-[10.5px] last:border-b-0" style={{ gridTemplateColumns: tpl, borderColor: HAIR }}>
            <span className="font-semibold">{r[0]}</span>
            <span>{r[1]}</span>
            <span className="text-right tabular-nums">{r[2]}</span>
            <span className="text-right tabular-nums">{r[3]}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center">
        <span className="text-[11px] font-bold">Sell-through (last 90 days)</span>
        <span className="ml-auto flex gap-1.5">
          <Pill tone="teal">Inventory value</Pill>
          <Pill tone="amber">Event losses</Pill>
        </span>
      </div>
      <div className="mt-1.5 overflow-hidden rounded-[10px] border bg-white" style={{ borderColor: HAIR }}>
        <TableHead cols={["SKU", "Item", "Shipped", "On hand", "Available"]} tpl={tpl2} />
        {SELL.map((r) => (
          <div key={r.sku} className="grid items-center border-b px-4 py-[5px] text-[10.5px] tabular-nums last:border-b-0" style={{ gridTemplateColumns: tpl2, borderColor: HAIR }}>
            <span className="font-mono text-[9px]">{r.sku}</span>
            <span className="min-w-0">
              <span className="block truncate">{r.n}</span>
              {r.sub && (
                <span className="block text-[8.5px]" style={{ color: MUTED }}>
                  {r.sub}
                </span>
              )}
            </span>
            <span className="text-right font-bold">{r.sh}</span>
            <span className="text-right" style={{ color: MUTED }}>
              {r.on}
            </span>
            <span className="text-right" style={{ color: MUTED }}>
              {r.av}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- one item's record
function ItemRecord({ tab }: { tab: "variants" | "history" }) {
  const tpl = "1.3fr 1fr 0.6fr 0.6fr 0.7fr 1.1fr";
  return (
    <div className="px-6 pt-4">
      <div className="flex items-center gap-1.5 text-[10.5px] font-semibold" style={{ color: MUTED }}>
        <Back className="h-[12px] w-[12px]" />
        All stock
      </div>

      <div className="mt-2.5 rounded-[12px] border bg-white p-3.5" style={{ borderColor: HAIR }}>
        <div className="flex items-start gap-3.5">
          {/* The item's photo: a plain shirt on the app's grey tile. */}
          <span className="grid h-[64px] w-[64px] flex-none place-items-center rounded-[12px]" style={{ background: `linear-gradient(150deg, ${TEAL}, #1E4E66)` }}>
            <svg viewBox="0 0 24 24" className="h-[34px] w-[34px]" fill="#fff" opacity="0.92">
              <path d="M8.6 3.8L4 6.4l1.6 4 2.2-.8V20h8.4V9.6l2.2.8 1.6-4-4.6-2.6a3.4 3.4 0 0 1-6.8 0z" />
            </svg>
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[17px] font-bold tracking-tight">Event T-shirt</span>
              <span style={{ color: MUTED }}>···</span>
              <Pill tone="purple">Merch</Pill>
            </div>
            <div className="font-mono text-[9.5px]" style={{ color: MUTED }}>
              {SCAN_SKU}
            </div>
            <div className="mt-2.5 flex gap-6">
              {[
                ["On hand", "358"],
                ["Available", "216"],
                ["Low at", "195"],
                ["Lead time", "2 wk"],
                ["Alerts", "On"],
              ].map(([l, v]) => (
                <div key={l}>
                  <div className="text-[8px] font-bold uppercase tracking-[0.08em]" style={{ color: MUTED }}>
                    {l}
                  </div>
                  <div className="text-[15px] font-bold tabular-nums">{v}</div>
                </div>
              ))}
            </div>
          </div>
          <span className="ml-auto flex flex-none items-center gap-1 rounded-full px-2 py-[3px] text-[9.5px] font-semibold" style={{ background: `${BLUE}12`, color: BLUE }}>
            <Truck className="h-[11px] w-[11px]" />
            200 inbound on PO-0141
          </span>
        </div>
      </div>

      <div className="mt-3 flex gap-5 border-b text-[10.5px]" style={{ borderColor: HAIR2 }}>
        {[
          { k: "variants", l: "Variants (5)", icon: Layers },
          { k: "history", l: "Stock history", icon: Scroll },
          { k: "branding", l: "Branding", icon: Tag },
          { k: "settings", l: "Settings", icon: Gear },
        ].map((t) => (
          <span
            key={t.k}
            data-ih={`itab-${t.k}`}
            className="-mb-px flex items-center gap-1.5 border-b-2 pb-1.5 font-semibold transition-colors duration-300"
            style={tab === t.k ? { borderColor: NAVY, color: INK } : { borderColor: "transparent", color: MUTED }}
          >
            <t.icon className="h-[12px] w-[12px]" />
            {t.l}
          </span>
        ))}
      </div>

      <div className="relative mt-2.5" style={{ height: 230 }}>
        <Fade on={tab === "variants"}>
          <div className="overflow-hidden rounded-[10px] border bg-white" style={{ borderColor: HAIR }}>
            <TableHead cols={["SKU", "Variant", "On hand", "Available", "Reorder at", ""]} tpl={tpl} />
            {VARIANTS.map((v) => (
              <div key={v.sku} className="grid items-center border-b px-4 py-[6px] text-[10.5px] tabular-nums last:border-b-0" style={{ gridTemplateColumns: tpl, borderColor: HAIR }}>
                <span className="font-mono text-[9px]">{v.sku}</span>
                <span className="flex items-center gap-1.5">
                  {v.v}
                  {v.low && <Pill tone="amber">Low</Pill>}
                </span>
                <span className="text-right">{v.on}</span>
                <span className="text-right font-semibold" style={{ color: v.low ? AMBER : INK }}>
                  {v.av}
                </span>
                <span className="text-right">{v.at}</span>
                <span className="flex justify-end gap-3 text-[10px] font-semibold">
                  <span>Edit</span>
                  <span>Adjust</span>
                  <span>Move</span>
                </span>
              </div>
            ))}
          </div>
        </Fade>
        <Fade on={tab === "history"}>
          <div className="overflow-hidden rounded-[10px] border bg-white" style={{ borderColor: HAIR }}>
            {HISTORY.map((h) => (
              <div key={h.what} className="flex items-center gap-2.5 border-b px-4 py-[7px] text-[10.5px] last:border-b-0" style={{ borderColor: HAIR }}>
                <span
                  className="h-[7px] w-[7px] flex-none rounded-full"
                  style={{ background: h.tone === "green" ? GREEN : h.tone === "red" ? RED : h.tone === "amber" ? AMBER : MUTED2 }}
                />
                <span className="min-w-0 flex-1 truncate font-semibold">{h.what}</span>
                <span className="w-[110px] flex-none truncate" style={{ color: MUTED }}>
                  {h.who}
                </span>
                <span className="w-[100px] flex-none" style={{ color: MUTED }}>
                  {h.when}
                </span>
                <span className="w-[100px] flex-none text-right font-semibold tabular-nums">{h.q}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[9.5px]" style={{ color: MUTED }}>
            <Lock className="h-[11px] w-[11px]" />
            Every change to a stock level is written here, and nothing in it can be edited.
          </div>
        </Fade>
      </div>
    </div>
  );
}
