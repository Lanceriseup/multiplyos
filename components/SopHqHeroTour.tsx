"use client";

// Animated hero for the SOP HQ feature page.
//
// A pointer runs one loop that covers both halves of the product, reading then
// writing, at 1x pacing:
//   1. open a department          SOP HQ home -> Operations
//   2. open a subject             Operations  -> Onboarding
//   3. open a SOP                 Onboarding  -> Welcome Call Script
//   4. back to the library        the breadcrumb
//   5. New SOP                    format -> starting point -> title
//   6. the editor                 add a Text block and write in it
//
// Content is deliberately generic. Departments, subjects, SOP titles, and people
// are the ones any business would recognise, not the ones in the demo account.
//
// Same split as ScoreboardHeroTour: the library is React state, only the cursor
// and its ripple are animated imperatively through the Web Animations API. The
// sequence is generation-token guarded, so a re-render or unmount cancels the
// in-flight tour rather than leaving orphaned timers behind.
//
// Layout: the stage is FLUID and fills its container, with a floor of MIN_W below
// which it scales down proportionally. Cursor targets are measured from live rects
// and divided by the scale, so both modes stay in sync. Views swap inside a fixed
// height card, so it never resizes mid-tour.
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import ActZero, { runZero, type Zero } from "./ReplacesActZero";

const MIN_W = 980; // narrower than this and the whole stage scales down
const STAGE_H = 500; // card height, sized to the tallest view (the library home)
const EASE = "cubic-bezier(0.22,1,0.36,1)";

// The pull-back at the end, borrowed from the Team Meetings tour and for the
// same reason: the rail sits BEHIND the content plate and is never scaled, so it
// is invisible until the plate retreats, and so the one cursor target used while
// zoomed still measures true. RAIL_W and ZOOM together decide the travel: the
// plate's left edge must clear the rail and its right edge must stay on stage.
const RAIL_W = 158;
const RAIL_GAP = 14;
const ZOOM = 0.84;

// Left edge after scaling about the centre is (w - w*ZOOM)/2, so this is the
// extra translation needed to clear the rail, in pre-scale units.
function plateShift(w: number) {
  return Math.max(0, (RAIL_W + RAIL_GAP - (w * (1 - ZOOM)) / 2) / ZOOM);
}

// ---------------------------------------------------------------- icons
const ico = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
type IconProps = { className?: string };

// A true cog outline. The radial-spokes shortcut reads as a sun at this size.
const Gear = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.7}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const Trend = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M3.6 16.6l5-5.2 3.2 3.2 6-6.4" />
    <path d="M13.6 8.2h4.2v4.2" />
  </svg>
);
const Dollar = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M12 3.4v17.2" />
    <path d="M16.2 7.2H10a2.9 2.9 0 0 0 0 5.8h4a2.9 2.9 0 0 1 0 5.8H7.4" />
  </svg>
);
const Megaphone = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M3.4 10v3.4a1.6 1.6 0 0 0 1.6 1.6h2.4L14.6 19V5L7.4 9H5a1.6 1.6 0 0 0-1.6 1.6z" />
    <path d="M17.8 9.2a4 4 0 0 1 0 5.6" />
  </svg>
);
const Truck = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M2.8 7.2h9.6v8.4H2.8z" />
    <path d="M12.4 10.4h3.6l3.2 3v2.2h-6.8z" />
    <circle cx="6.6" cy="17.4" r="1.7" />
    <circle cx="16.2" cy="17.4" r="1.7" />
  </svg>
);
const Monitor = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <rect x="2.9" y="4.4" width="18.2" height="12" rx="1.9" />
    <path d="M8.6 20h6.8M12 16.4V20" />
  </svg>
);
const Folder = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M3.2 6.6a1.8 1.8 0 0 1 1.8-1.8h3.7l2 2.4h7.5a1.8 1.8 0 0 1 1.8 1.8v8.4a1.8 1.8 0 0 1-1.8 1.8H5a1.8 1.8 0 0 1-1.8-1.8z" />
  </svg>
);
const Inbox = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M3.2 13.4h4.2l1.4 2.4h6.4l1.4-2.4h4.2" />
    <path d="M5.4 5h13.2l2.2 8.4v4A1.6 1.6 0 0 1 19.2 19H4.8a1.6 1.6 0 0 1-1.6-1.6v-4z" />
  </svg>
);
const People = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <circle cx="9.2" cy="8.4" r="3" />
    <path d="M3.6 18.6c0-2.8 2.5-4.6 5.6-4.6s5.6 1.8 5.6 4.6" />
    <path d="M16.2 6.2a3 3 0 0 1 0 5.6M17.4 14.6c1.9.6 3.2 1.9 3.2 4" />
  </svg>
);
const Star = ({ className, filled }: IconProps & { filled?: boolean }) => (
  <svg className={className} {...ico} fill={filled ? "currentColor" : "none"} strokeWidth={filled ? 1.4 : 1.9}>
    <path d="M12 3.9l2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5 2.7 1-5.6-4.1-3.9 5.6-.8z" />
  </svg>
);
const Share = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <circle cx="17.6" cy="5.8" r="2.3" />
    <circle cx="6.4" cy="12" r="2.3" />
    <circle cx="17.6" cy="18.2" r="2.3" />
    <path d="M8.4 10.9l7.2-3.9M8.4 13.1l7.2 3.9" />
  </svg>
);
const Clock = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <circle cx="12" cy="12" r="8.4" />
    <path d="M12 7.4V12l3 1.8" />
  </svg>
);
const SearchGlyph = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <circle cx="10.8" cy="10.8" r="6.4" />
    <path d="M15.6 15.6l4.4 4.4" />
  </svg>
);
const GridGlyph = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2}>
    <rect x="4" y="4" width="6.4" height="6.4" rx="1.4" />
    <rect x="13.6" y="4" width="6.4" height="6.4" rx="1.4" />
    <rect x="4" y="13.6" width="6.4" height="6.4" rx="1.4" />
    <rect x="13.6" y="13.6" width="6.4" height="6.4" rx="1.4" />
  </svg>
);
const ListGlyph = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2}>
    <path d="M4.4 6.6h15.2M4.4 12h15.2M4.4 17.4h15.2" />
  </svg>
);
const ArrowRight = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2}>
    <path d="M4.8 12h14.4M13.4 6.4l5.8 5.6-5.8 5.6" />
  </svg>
);
const ArrowLeft = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2}>
    <path d="M19.2 12H4.8M10.6 6.4L4.8 12l5.8 5.6" />
  </svg>
);
const Plus = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2.4}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const Spark = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.6 4L18 8.5 14 10l-2 4-2-4-4-1.5L10 7z" />
  </svg>
);
const Wand = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M4 20l9.4-9.4" />
    <path d="M15.6 3.4l.9 2.2 2.2.9-2.2.9-.9 2.2-.9-2.2-2.2-.9 2.2-.9z" />
  </svg>
);
const DocGlyph = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <rect x="4.6" y="3.3" width="14.8" height="17.4" rx="2.3" />
    <path d="M8.4 8.4h7.2M8.4 12.4h7.2M8.4 16.4h4.4" />
  </svg>
);
const StepsGlyph = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M4 6.6l2 2 3-3.4M4 13l2 2 3-3.4M12.4 7.4h7.4M12.4 14h7.4" />
  </svg>
);
const ScreenGlyph = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <rect x="2.8" y="4.4" width="18.4" height="12.4" rx="2" />
    <path d="M9.8 10.2l4 2.4-4 2.4z" fill="currentColor" stroke="none" />
    <path d="M8.6 20.4h6.8" />
  </svg>
);
const UploadGlyph = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M12 16.4V4.6" />
    <path d="M7.4 9.2L12 4.6l4.6 4.6" />
    <path d="M4.4 19.4h15.2" />
  </svg>
);
const VideoGlyph = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <rect x="2.8" y="6.2" width="12.6" height="11.6" rx="2.2" />
    <path d="M15.4 10.6l5.8-3.2v9.2l-5.8-3.2z" />
  </svg>
);
const LinkGlyph = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M10.2 13.8a3.6 3.6 0 0 0 5.4.4l2.6-2.6a3.6 3.6 0 0 0-5.1-5.1l-1.5 1.5" />
    <path d="M13.8 10.2a3.6 3.6 0 0 0-5.4-.4l-2.6 2.6a3.6 3.6 0 0 0 5.1 5.1l1.5-1.5" />
  </svg>
);
const AudioGlyph = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M4 10v4M8 7v10M12 4.6v14.8M16 8v8M20 10.6v2.8" />
  </svg>
);
const ImageGlyph = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <rect x="3.2" y="4.6" width="17.6" height="14.8" rx="2.2" />
    <circle cx="8.6" cy="9.8" r="1.6" />
    <path d="M4.4 17l4.8-4.6 3.4 3.2 3-2.6 4 3.8" />
  </svg>
);
const CameraGlyph = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M3.4 8.4h3.2l1.4-2.2h7.9l1.4 2.2h3.3v10.2H3.4z" />
    <circle cx="12" cy="13.2" r="3.2" />
  </svg>
);
const FileGlyph = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M13.4 3.4H6.8a1.8 1.8 0 0 0-1.8 1.8v13.6a1.8 1.8 0 0 0 1.8 1.8h10.4a1.8 1.8 0 0 0 1.8-1.8V8.8z" />
    <path d="M13.4 3.4v5.4h5.6" />
  </svg>
);
const History = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M3.6 12a8.4 8.4 0 1 0 2.6-6.1" />
    <path d="M3.4 4.6v4h4" />
    <path d="M12 7.8V12l3 1.6" />
  </svg>
);
const Trash = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M4.6 6.6h14.8" />
    <path d="M9.4 6.6V4.8h5.2v1.8" />
    <path d="M6.4 6.6l1 12.6h9.2l1-12.6" />
  </svg>
);
const Eye = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M2.6 12S6 5.8 12 5.8 21.4 12 21.4 12 18 18.2 12 18.2 2.6 12 2.6 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const Save = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M5.4 4.4h10.2l3 3v12.2H5.4z" />
    <path d="M8.4 4.4v5h6.2v-5" />
  </svg>
);
const Send = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M20.6 3.4L10.4 13.6" />
    <path d="M20.6 3.4l-6.4 17.2-3.8-7-7-3.8z" />
  </svg>
);
const Pencil = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M4 20.2l.6-4L16.2 4.6a2 2 0 0 1 2.8 0l.4.4a2 2 0 0 1 0 2.8L8 19.6z" />
  </svg>
);
const Globe = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <circle cx="12" cy="12" r="8.4" />
    <path d="M3.6 12h16.8" />
    <path d="M12 3.6c2.2 2.4 3.3 5.2 3.3 8.4s-1.1 6-3.3 8.4c-2.2-2.4-3.3-5.2-3.3-8.4S9.8 6 12 3.6z" />
  </svg>
);
const Printer = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M7 9.2V4h10v5.2" />
    <rect x="3.6" y="9.2" width="16.8" height="7" rx="1.8" />
    <path d="M7 14h10v6H7z" />
  </svg>
);
const Speaker = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M4.6 9.4h3.2L12 6v12l-4.2-3.4H4.6z" />
    <path d="M15.4 9.6a3.4 3.4 0 0 1 0 4.8" />
  </svg>
);
const Chat = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M20.4 12.6a7.4 7.4 0 0 1-7.4 7.4 8 8 0 0 1-3.3-.7L4.4 21l1.7-4.9a7.4 7.4 0 1 1 14.3-3.5z" />
  </svg>
);
const Mic = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <rect x="9" y="3" width="6" height="10.4" rx="3" />
    <path d="M5.6 11.4a6.4 6.4 0 0 0 12.8 0M12 17.8V21M9 21h6" />
  </svg>
);
const PauseGlyph = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <rect x="7" y="5.4" width="3.6" height="13.2" rx="1.1" />
    <rect x="13.4" y="5.4" width="3.6" height="13.2" rx="1.1" />
  </svg>
);
const StopGlyph = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2}>
    <rect x="6.2" y="6.2" width="11.6" height="11.6" rx="1.6" />
  </svg>
);
// The three tabs on the browser's own share sheet.
const TabGlyph = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.8}>
    <path d="M3.2 8.4h6.2l1.6-2.6h9.8v12.4H3.2z" />
  </svg>
);
const WindowGlyph = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.8}>
    <rect x="3.2" y="4.6" width="17.6" height="14.8" rx="2" />
    <path d="M3.2 9h17.6" />
  </svg>
);
const AllScreenGlyph = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.8}>
    <path d="M4 8.4V5.6a1.6 1.6 0 0 1 1.6-1.6h2.8M15.6 4h2.8A1.6 1.6 0 0 1 20 5.6v2.8M20 15.6v2.8a1.6 1.6 0 0 1-1.6 1.6h-2.8M8.4 20H5.6A1.6 1.6 0 0 1 4 18.4v-2.8" />
  </svg>
);
const SpeakerSmall = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.8}>
    <path d="M4.6 9.4h3.2L12 6v12l-4.2-3.4H4.6z" />
    <path d="M15.4 9.6a3.4 3.4 0 0 1 0 4.8" />
  </svg>
);

// ---------------------------------------------------------------- data
type Dept = {
  name: string;
  meta: string;
  color: string;
  icon: (p: IconProps) => React.JSX.Element;
};

// Nine departments any business would recognise, using only the colours the real
// app already ships. Company-wide is the catch-all, as it is in the product.
const DEPTS: Dept[] = [
  { name: "Operations", meta: "92 SOPs · 8 members", color: "#F0821E", icon: Gear },
  { name: "Sales", meta: "29 SOPs · 4 members", color: "#17A673", icon: Trend },
  { name: "Marketing", meta: "10 SOPs · 6 members", color: "#E8305A", icon: Megaphone },
  { name: "Finance", meta: "9 SOPs · 3 members", color: "#17A673", icon: Dollar },
  { name: "Customer Success", meta: "22 SOPs · 10 members", color: "#2E9BD6", icon: People },
  { name: "People & HR", meta: "12 SOPs · 2 members", color: "#F0821E", icon: People },
  { name: "Technology", meta: "14 SOPs · 7 members", color: "#2E9BD6", icon: Monitor },
  { name: "Fulfillment", meta: "6 SOPs · 4 members", color: "#F0A31E", icon: Truck },
  { name: "Company-wide", meta: "9 SOPs not tied to a department", color: "#9A958C", icon: Folder },
];

const OPEN_DEPT = 0; // Operations

type Subject = { name: string; n: number; color: string; inbox?: boolean };

const SUBJECTS: Subject[] = [
  { name: "Onboarding", n: 12, color: "#16233D" },
  { name: "Hiring", n: 8, color: "#16233D" },
  { name: "Vendors", n: 5, color: "#16233D" },
  { name: "Daily Checklists", n: 19, color: "#E8305A" },
  { name: "Inventory", n: 10, color: "#16233D" },
  { name: "Quality Control", n: 7, color: "#16233D" },
  { name: "Reporting", n: 6, color: "#16233D" },
  { name: "Templates", n: 4, color: "#16233D" },
  { name: "Uncategorized", n: 21, color: "#C7C3BB", inbox: true },
];

const OPEN_SUBJECT = 0; // Onboarding

type Kind = "doc" | "video" | "steps";

type Sop = {
  init: string;
  title: string;
  dept: string;
  by: string;
  mins: string;
  steps: number;
  kind: Kind;
  shared: string;
};

const ONBOARDING_SOPS: Sop[] = [
  {
    init: "WC", title: "Welcome Call Script", dept: "Operations", by: "Jordan",
    mins: "4 min", steps: 6, kind: "doc", shared: "Operations, Jordan Rivera & 3 others",
  },
  {
    init: "CR", title: "Setting Up the CRM for a New Client", dept: "Operations", by: "Priya",
    mins: "1 min", steps: 1, kind: "video", shared: "Operations, Priya Nair & 2 others",
  },
  {
    init: "NC", title: "New Client Onboarding", dept: "Operations", by: "Skylar",
    mins: "12 min", steps: 23, kind: "steps", shared: "Operations, Skylar Lewis & 5 others",
  },
];

const OPEN_SOP = 0; // Welcome Call Script

const KIND_META: Record<Kind, { label: string; color: string; icon: (p: IconProps) => React.JSX.Element }> = {
  doc: { label: "Doc", color: "#2E7D5B", icon: DocGlyph },
  video: { label: "Video", color: "#2C6BA6", icon: VideoGlyph },
  steps: { label: "Checklist", color: "#8A3F6D", icon: StepsGlyph },
};

// The right rail's recent strip, and the card row under the filter bar.
const RECENT = [
  { title: "New Client Onboarding", dept: "Operations" },
  { title: "Issue a Refund", dept: "Customer Success" },
  { title: "Monthly Close Checklist", dept: "Finance" },
  { title: "Product Walkthrough", dept: "Technology" },
];

const LIB_CARDS = [
  { init: "WC", title: "Welcome Call Script", dept: "Operations", by: "Jordan", mins: "4 min", steps: 6 },
  { init: "IR", title: "Issue a Refund", dept: "Customer Success", by: "Priya", mins: "3 min", steps: 7 },
  { init: "MC", title: "Monthly Close Checklist", dept: "Finance", by: "Marcus", mins: "8 min", steps: 14 },
];

const TABS = ["All", "Assigned to me", "Recently viewed", "Created", "Outdated SOPs"];

// The six steps of the SOP the tour opens.
const CALL_STEPS = [
  "Open the client record and read the last two notes.",
  "Confirm the plan they bought and their start date.",
  "Send the agenda in chat one minute before the call.",
  "Ask the three qualifying questions, in order.",
  "Write the notes up while they are still fresh.",
  "Book the kickoff before you hang up.",
];

// The block palette, exactly as the editor lists it.
const BLOCKS: { label: string; icon: (p: IconProps) => React.JSX.Element }[] = [
  { label: "Text", icon: DocGlyph },
  { label: "Video", icon: VideoGlyph },
  { label: "Video from Link", icon: LinkGlyph },
  { label: "Screen Record", icon: ScreenGlyph },
  { label: "Audio", icon: AudioGlyph },
  { label: "Image", icon: ImageGlyph },
  { label: "Screenshot", icon: CameraGlyph },
  { label: "File", icon: FileGlyph },
  { label: "Link", icon: LinkGlyph },
  { label: "Quiz", icon: StepsGlyph },
];

const NEW_TITLE = "Client Kickoff Call";

// ---------------------------------------------------------------- recording
// Act two records a video into a blank SOP. Act three narrates a walkthrough and
// lets the AI SOP Agent write the SOP from it. Both are real paths in the
// product: see docs/sop-hq-feature-notes.md, sections 5 and 6.
type RecSrc = "screen" | "both" | "camera";

const REC_SOURCES: { key: RecSrc; label: string; icon: (p: IconProps) => React.JSX.Element }[] = [
  { key: "screen", label: "Screen", icon: Monitor },
  { key: "both", label: "Screen + Camera", icon: VideoGlyph },
  { key: "camera", label: "Camera", icon: CameraGlyph },
];

// The tabs on the browser share sheet.
//
// Multiply OS is deliberately in this list and deliberately not the one picked:
// the cursor glides past it to the CRM. Recording the product inside the product
// would be circular, and the SOP that comes out of this recording is about
// setting up a client in the CRM, so the shared tab has to be the CRM for the
// draft to make sense.
const SHARE_TABS = [
  { title: "Multiply OS · SOP HQ", dot: "#F0821E" },
  { title: "Your CRM · Client accounts", dot: "#2E9BD6" },
  { title: "Refund Policy 2026 · Docs", dot: "#4285F4" },
];

const PICK_TAB = 2; // the policy document

// The shared tab, as the browser draws it while a capture runs. Chrome puts its
// own bar above the page, and Stop sharing there ends the recording just as
// Finish & draft does inside Multiply OS.
const SHARED_DOC_TITLE = "Refund Policy 2026";
const SHARED_ORIGIN = "app.multiplyos.com";

// A few lines of the document, so the tab reads as a real page being narrated.
const SHARED_DOC_BODY = [
  "Refunds requested inside thirty days of purchase are approved automatically.",
  "No manager sign-off is required, and the finance team is notified by email.",
  "Requests past thirty days route to the account manager for review first.",
  "Chargebacks are handled separately. See the disputes procedure.",
];

// What the AI SOP Agent hands back. The prose is chunked rather than one string
// so the bolded terms survive being typed a character at a time.
// Drawn from the document the walkthrough was recorded over, and deliberately
// the same procedure the Quiz block further down the page asks about.
const DRAFT_TITLE = "Issuing a Refund";
const DRAFT_HEADING = "When a refund needs approval";

const DRAFT_PROSE: { t: string; b?: boolean }[] = [
  { t: "Inside " },
  { t: "thirty days", b: true },
  { t: " a refund is " },
  { t: "automatic", b: true },
  { t: ", so nobody signs it off. Past thirty days it routes to the " },
  { t: "account manager", b: true },
  { t: " first." },
];

const DRAFT_PROSE_LEN = DRAFT_PROSE.reduce((n, c) => n + c.t.length, 0);

// Timestamps the screenshots were pulled from, which is the detail that makes
// "pulled straight out of the recording" land.
const DRAFT_SHOTS = ["from 0:18", "from 0:41"];

// ---------------------------------------------------------------- the shared tab
// What the browser shows once a capture is running: Chrome's own bar pinned above
// whatever page you switched to, with Stop sharing on it. The page underneath is
// the document being narrated, not Multiply OS, because a SOP is a record of work
// done somewhere else.
function SharedTabView({ scene }: { scene: Scene }) {
  const hot = scene.hot === "stop-share";
  return (
    <div className="sop-view flex h-full flex-col bg-[#F1F0EE]">
      {/* the browser's sharing bar, drawn as the browser draws it */}
      <div className="flex flex-none items-center justify-center gap-2.5 bg-[#3B3A38] px-5 py-2 text-white">
        <ScreenGlyph className="h-3.5 w-3.5 flex-none text-white/80" />
        <span className="text-[11.5px]">
          Sharing this tab to <b className="font-semibold text-[#9CC7F2]">{SHARED_ORIGIN}</b>
        </span>
        <span
          data-t="stop-share"
          className={`ml-1.5 rounded-full bg-[#5C5A56] px-3 py-1 text-[11px] font-semibold transition-shadow duration-200 ${
            hot ? "shadow-[0_0_0_3px_rgba(234,123,27,0.5)]" : ""
          }`}
        >
          Stop sharing
        </span>
      </div>

      {/* the document's own chrome */}
      <div className="flex flex-none items-center gap-2.5 border-b border-[#E3E0DA] bg-white px-4 py-2.5">
        <span className="grid h-[22px] w-[22px] flex-none place-items-center rounded bg-[#4285F4] text-white">
          <DocGlyph className="h-3.5 w-3.5" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[12.5px] font-semibold leading-tight">{SHARED_DOC_TITLE}</span>
          <span className="flex gap-2.5 text-[9px] text-brand-gray">
            <span>File</span><span>Edit</span><span>View</span><span>Insert</span><span>Format</span><span>Tools</span>
          </span>
        </span>
        <span className="ml-auto flex flex-none items-center gap-1.5">
          <span className="rounded-md border border-[#E6E2DB] px-2 py-1 text-[9.5px] font-semibold text-brand-charcoal">
            Share
          </span>
        </span>
      </div>

      {/* a toolbar strip, so it reads as an editor rather than a print-out */}
      <div className="flex flex-none items-center gap-3 border-b border-[#E3E0DA] bg-[#F7F5F1] px-4 py-1.5 text-[9.5px] font-semibold text-brand-charcoal">
        <span>100%</span>
        <span className="h-2.5 w-px bg-[#DDD8CF]" />
        <span>Normal text</span>
        <span className="h-2.5 w-px bg-[#DDD8CF]" />
        <span className="font-bold">B</span>
        <span className="italic">I</span>
        <span className="underline">U</span>
        <span className="h-2.5 w-px bg-[#DDD8CF]" />
        <ListGlyph className="h-2.5 w-2.5" />
        <LinkGlyph className="h-2.5 w-2.5" />
      </div>

      {/* the page */}
      <div className="min-h-0 flex-1 overflow-hidden px-10 py-5">
        <div className="mx-auto h-full max-w-[560px] rounded-t-lg border border-[#E3E0DA] bg-white px-9 py-6 shadow-[0_10px_24px_-16px_rgba(40,30,15,0.3)]">
          <p className="text-[8.5px] font-bold uppercase tracking-[0.16em] text-brand-orange-dark">
            Company policy
          </p>
          <h4 className="mt-1.5 text-[17px] font-extrabold leading-tight tracking-tight">
            {SHARED_DOC_TITLE}
          </h4>
          <div className="mt-3 space-y-2">
            {SHARED_DOC_BODY.map((line) => (
              <p key={line} className="text-[11px] leading-relaxed text-[#2B2926]">
                {line}
              </p>
            ))}
          </div>
          <div className="mt-3.5 space-y-1.5">
            {[92, 78, 86].map((w, i) => (
              <span key={i} className="block h-1.5 rounded bg-[#EDE9E2]" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- act zero
// The loop opens on the tool this replaces, struck out, before the product
// appears. The cross-out used to be a caption above the animation; here it is
// the first thing the animation does. Roughly 2.6s, replayed every loop.
const ZERO_ITEMS = [{ name: "Trainual", logo: "/replaces-trainual.png" }];

// ---------------------------------------------------------------- scene
// "planner" was added August 2026: the SOP Planner, which is the other half of
// SOP HQ. The library is where SOPs live; the planner is where you work out
// which ones you are missing.
type View = "home" | "subjects" | "soplist" | "read" | "editor" | "shared" | "planner";
type Modal = "" | "format" | "start" | "title" | "mic" | "picker" | "count";
// A strip pinned over the library while a walkthrough records, then drafts.
type Banner = "" | "rec" | "draft";
// What the editor is holding: nothing, the screen recorder, or the AI draft.
type Doc = "none" | "rec" | "draft";

type Scene = {
  view: View;
  modal: Modal;
  banner: Banner;
  zero: Zero;
  hot: string; // data-t of the element under the cursor
  typed: string; // characters entered in the title field
  caret: boolean;
  title: string; // the SOP the editor is showing

  doc: Doc;
  recSrc: RecSrc;
  recOn: boolean; // Start recording has been pressed
  recSecs: number; // the block's own Duration counter

  picked: boolean; // a tab is selected on the share sheet
  count: number; // 3, 2, 1 before a walkthrough starts
  wtSecs: number; // the walkthrough's elapsed time in the top strip

  draftH: string; // the heading, as it types in
  draftP: number; // characters of prose written so far
  shots: number; // screenshots that have landed

  // the pull-back, and the planner it lands on
  zoomed: boolean;
  racked: boolean; // the two SOP HQ tabs come into focus on the rail
  planTyped: string; // the SOP being named in the Operations card
  planAdded: boolean; // it is on the plan
  planWho: boolean; // somebody is down to write it
  planMade: boolean; // and it exists
};

const BLANK: Scene = {
  view: "home", modal: "", banner: "", zero: "", hot: "", typed: "", caret: false, title: NEW_TITLE,
  doc: "none", recSrc: "screen", recOn: false, recSecs: 0,
  picked: false, count: 3, wtSecs: 0, draftH: "", draftP: 0, shots: 0,
  zoomed: false, racked: false, planTyped: "", planAdded: false, planWho: false, planMade: false,
};

// The static frame shown under prefers-reduced-motion: the finished AI draft,
// since that is the outcome the whole tour exists to show.
const STILL: Scene = {
  ...BLANK, view: "editor", title: DRAFT_TITLE, doc: "draft",
  draftH: DRAFT_HEADING, draftP: DRAFT_PROSE_LEN, shots: DRAFT_SHOTS.length,
};

// Act one browses the library. It is the part a returning visitor already knows,
// so it is the first thing to drop if the loop needs to be shorter: set this to
// false and the tour opens straight into recording, at roughly 33s a loop
// instead of 50s.
const SHOW_BROWSE = true;

// mm:ss for the two running clocks.
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

// ---------------------------------------------------------------- component
export default function SopHqHeroTour() {
  const hostRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<SVGSVGElement>(null);
  const rippleRef = useRef<HTMLSpanElement>(null);

  const inView = useInView(hostRef, { margin: "-60px" });
  const reduce = useReducedMotion() ?? false;

  const [scene, setScene] = useState<Scene>(reduce ? STILL : BLANK);
  // Only pin a pixel width when the stage has to scale down; otherwise it stays
  // width:100% so the first paint is already correct (no measure-then-resize flash).
  const [scaled, setScaled] = useState(false);
  const [scale, setScale] = useState(1);
  const [boxH, setBoxH] = useState<number | undefined>(undefined);
  // The plate's own width in pre-scale units, which is what plateShift needs.
  const [boxW, setBoxW] = useState(MIN_W);

  const runRef = useRef(0);
  const scaleRef = useRef(1);
  const posRef = useRef({ x: 160, y: 46 });

  // ---- fluid width, with a scale-down floor at MIN_W
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
        setBoxW(hw);
      } else {
        setBoxW(MIN_W);
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
    const pointAt = (key: string) => {
      const stage = stageRef.current;
      const node = cardRef.current?.querySelector(`[data-t="${key}"]`);
      if (!stage || !node) return posRef.current;
      const s = stage.getBoundingClientRect();
      const t = node.getBoundingClientRect();
      const k = scaleRef.current || 1;
      return {
        x: (t.left - s.left) / k + t.width / k / 2,
        y: (t.top - s.top) / k + t.height / k / 2,
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
      try { await a.finished; } catch { /* cancelled */ }
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
        anims.push(r.animate(
          [{ transform: "scale(.35)", opacity: 0.95 }, { transform: "scale(1.5)", opacity: 0 }],
          { duration: 440, easing: "ease-out" },
        ));
      }
      if (c) {
        anims.push(c.animate([
          { transform: `translate(${x}px,${y}px) scale(1)` },
          { transform: `translate(${x}px,${y}px) scale(.82)` },
          { transform: `translate(${x}px,${y}px) scale(1)` },
        ], { duration: 230, easing: "ease-out" }));
      }
      try { await Promise.all(anims.map((a) => a.finished)); } catch { /* cancelled */ }
      anims.forEach((a) => a.cancel());
      setCursor(x, y);
    };

    const fade = async (to: number, dur = 260) => {
      const c = cursorRef.current;
      if (!c) return;
      const a = c.animate([{ opacity: c.style.opacity || "0" }, { opacity: `${to}` }],
        { duration: dur, fill: "forwards" });
      try { await a.finished; } catch { /* cancelled */ }
      if (alive()) c.style.opacity = `${to}`;
    };

    // One click: move to a target, light it, press, then hand the scene forward.
    const tap = async (key: string, dur = 620, hold = 300) => {
      await glide(pointAt(key), dur);
      if (!alive()) return false;
      patch({ hot: key });
      await wait(hold);
      if (!alive()) return false;
      await click();
      patch({ hot: "" });
      return alive();
    };

    const type = async (text: string, apply: (v: string) => void, per = 62) => {
      for (let i = 1; i <= text.length; i++) {
        if (!alive()) return;
        apply(text.slice(0, i));
        await wait(per);
      }
    };

    // Runs a clock up from zero, one tick a second, bailing if the tour moves on.
    const tick = async (n: number, apply: (s: number) => void) => {
      for (let i = 1; i <= n; i++) {
        await wait(1000);
        if (!alive()) return;
        apply(i);
      }
    };

    (async function loop() {
      setCursor(160, 46);
      while (alive()) {
        // ============================================ act zero: the cross-out
        // Runs before the cursor appears, so the first thing on screen is the
        // tool being replaced rather than a pointer looking for something.
        setScene({ ...BLANK });
        if (!(await runZero((z) => patch({ zero: z }), wait, alive, ZERO_ITEMS.length))) return;
        await fade(1);

        // ============================================== act one: read a SOP
        if (SHOW_BROWSE) {
          // --- open the department
          if (!(await tap("dept-0", 720))) return;
          patch({ view: "subjects" });
          await wait(680);

          // --- open the subject
          if (!(await tap("subj-0", 600))) return;
          patch({ view: "soplist" });
          await wait(680);

          // --- open the SOP, and let it be read
          if (!(await tap("sop-0", 600))) return;
          patch({ view: "read" });
          await wait(1500);

          // --- back to the library
          if (!(await tap("crumb", 620))) return;
          patch({ view: "home" });
          await wait(560);
        }

        // ====================== act two: a blank SOP, with a screen recording
        if (!(await tap("new-sop", 640))) return;
        patch({ modal: "format" });
        await wait(500);

        if (!(await tap("fmt-single", 520))) return;
        patch({ modal: "start" });
        await wait(500);

        if (!(await tap("start-blank", 520))) return;
        patch({ modal: "title" });
        await wait(460);

        // type the title, then create
        await glide(pointAt("title-field"), 500);
        if (!alive()) return;
        await click();
        patch({ caret: true });
        await wait(220);
        await type(NEW_TITLE, (v) => patch({ typed: v }));
        if (!alive()) return;
        await wait(360);
        if (!(await tap("create", 500))) return;
        patch({ modal: "", view: "editor", caret: false });
        await wait(600);

        // --- the Screen Record block, rather than a paragraph of text
        if (!(await tap("blk-3", 640))) return;
        patch({ doc: "rec" });
        await wait(680);

        // pick a source, so the Screen / Screen + Camera / Camera choice registers
        if (!(await tap("src-both", 520))) return;
        patch({ recSrc: "both" });
        await wait(480);

        // and roll it
        if (!(await tap("rec-start", 540))) return;
        patch({ recOn: true });
        await tick(3, (s) => patch({ recSecs: s }));
        if (!alive()) return;
        await wait(500);

        // ============ act three: a walkthrough, written up by the AI SOP Agent
        if (!(await tap("all-sops", 620))) return;
        patch({ view: "home", doc: "none", recOn: false, recSecs: 0, recSrc: "screen" });
        await wait(560);

        if (!(await tap("new-sop", 600))) return;
        patch({ modal: "format" });
        await wait(460);

        if (!(await tap("fmt-single", 520))) return;
        patch({ modal: "start" });
        await wait(500);

        // this time, the second card
        if (!(await tap("start-record", 560))) return;
        patch({ modal: "mic" });
        await wait(720);

        if (!(await tap("mic-go", 560))) return;
        patch({ modal: "picker" });
        await wait(600);

        // the browser's own share sheet: pick a tab, then Share
        if (!(await tap(`tab-${PICK_TAB}`, 540))) return;
        patch({ picked: true });
        await wait(340);

        if (!(await tap("share-go", 480))) return;
        patch({ view: "shared", modal: "count", count: 3 });
        await fade(0, 200);
        await wait(660);
        if (!alive()) return;
        patch({ count: 2 });
        await wait(660);
        if (!alive()) return;
        patch({ count: 1 });
        await wait(660);

        // Recording. The browser's bar is the only chrome on screen, because the
        // page being narrated is not ours.
        if (!alive()) return;
        patch({ modal: "" });
        await wait(2600);
        if (!alive()) return;
        await fade(1, 200);

        // Stop sharing, from the browser's bar, ends it and hands back to the app.
        if (!(await tap("stop-share", 620))) return;
        patch({ view: "home", banner: "draft" });
        await wait(2000);

        // --- the draft opens on its own
        if (!alive()) return;
        patch({ view: "editor", banner: "", title: DRAFT_TITLE, doc: "draft" });
        await wait(520);
        await type(DRAFT_HEADING, (v) => patch({ draftH: v }), 30);
        if (!alive()) return;
        await wait(280);

        // prose is typed by character count, so the bold runs stay bold
        for (let i = 1; i <= DRAFT_PROSE_LEN; i++) {
          if (!alive()) return;
          patch({ draftP: i });
          await wait(13);
        }
        await wait(300);

        // then the screenshots the agent pulled out of the recording
        for (let i = 1; i <= DRAFT_SHOTS.length; i++) {
          patch({ shots: i });
          await wait(480);
          if (!alive()) return;
        }
        await wait(1700);

        // ============================ act four: the other half of SOP HQ
        // The plate pulls back and the rail is revealed, already soft. The only
        // thing the eye tracks is the pair of SOP HQ tabs coming into focus,
        // which is why the rack waits for the pull-back to settle.
        patch({ zoomed: true });
        await wait(600);
        patch({ racked: true });
        await wait(900);

        if (!(await tap("nav-planner", 780))) return;
        patch({ view: "planner", zoomed: false, racked: false, doc: "none", banner: "" });
        // let the scale settle before anything inside the plate is measured
        await wait(900);
        await wait(1500);

        // --- name a process the company does not have written down
        await glide(pointAt("plan-field"), 620);
        if (!alive()) return;
        await click();
        for (let i = 1; i <= PLAN_SOP.length; i++) {
          if (!alive()) return;
          patch({ planTyped: PLAN_SOP.slice(0, i) });
          await wait(26);
        }
        await wait(320);

        if (!(await tap("plan-add", 520))) return;
        patch({ planAdded: true, planTyped: "" });
        await wait(900);

        // --- put somebody's name against it
        if (!(await tap("plan-who", 560))) return;
        patch({ planWho: true });
        await wait(900);

        // --- and it stops being a plan
        if (!(await tap("plan-create", 560))) return;
        patch({ planMade: true });
        await wait(2600);

        if (!alive()) return;
        await fade(0);
        await wait(520);
      }
    })();

    return () => {
      runRef.current++;
      cursorRef.current?.getAnimations().forEach((a) => a.cancel());
      rippleRef.current?.getAnimations().forEach((a) => a.cancel());
    };
  }, [inView, reduce]);

  // ---- render
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
            ref={cardRef}
            className="relative overflow-hidden rounded-2xl border border-black/5 bg-[#F3F1ED] text-brand-ink shadow-[0_30px_60px_-30px_rgba(40,30,15,0.45),0_2px_6px_-3px_rgba(40,30,15,0.12)]"
            style={{ height: STAGE_H }}
          >
            {/* Behind the plate and never scaled, so it is invisible until the
                pull-back uncovers it, and so the one cursor target used while
                zoomed still measures true. */}
            <NavRail scene={scene} />

            <div
              className="absolute inset-0 z-[2] overflow-hidden bg-[#FAF9F7]"
              style={{
                transform: scene.zoomed
                  ? `scale(${ZOOM}) translateX(${plateShift(boxW)}px)`
                  : "none",
                transformOrigin: "center center",
                transition: `transform 780ms ${EASE}, box-shadow 780ms ${EASE}, border-radius 780ms ${EASE}`,
                boxShadow: scene.zoomed ? "0 26px 54px -24px rgba(40,30,15,0.5)" : "0 0 0 rgba(0,0,0,0)",
                borderRadius: scene.zoomed ? 14 : 0,
              }}
            >
              {/* A strip pushes the page down rather than covering its heading,
                  which is what the product does. The overflow it costs at the
                  bottom is clipped by the card, so the page just reads as
                  continuing past the frame. */}
              <div className="h-full" style={{ paddingTop: scene.banner ? 41 : undefined }}>
                {scene.view === "home" && <HomeView scene={scene} />}
                {scene.view === "subjects" && <SubjectsView scene={scene} />}
                {scene.view === "soplist" && <SopListView scene={scene} />}
                {scene.view === "read" && <ReadView scene={scene} />}
                {scene.view === "editor" && <EditorView scene={scene} />}
                {scene.view === "shared" && <SharedTabView scene={scene} />}
                {scene.view === "planner" && <PlannerView scene={scene} />}
              </div>

              {/* the walkthrough strips, pinned over whatever view is showing */}
              {scene.banner === "rec" && <RecBanner scene={scene} />}
              {scene.banner === "draft" && <DraftBanner />}
            </div>

            {/* the opening cross-out, over the library it is about to become */}
            {scene.zero && <ActZero state={scene.zero} items={ZERO_ITEMS} bg="#FAF9F7" />}

            {scene.modal && <ModalLayer scene={scene} />}

            {/* Ask Multi AI, present on every screen in the product, and only
                there: on the shared tab we are looking at somebody else's page,
                so none of the app's own chrome belongs. It also steps aside
                during the pull-back, where it would float over the rail rather
                than sit on the app it belongs to. */}
            {scene.view !== "shared" && !scene.zoomed && (
              <span className="pointer-events-none absolute bottom-4 right-5 z-[50] flex items-center gap-1.5 rounded-full border border-[#F7D8B4] bg-white px-3 py-1.5 text-[11px] font-semibold text-brand-ink shadow-[0_10px_22px_-10px_rgba(40,30,15,0.5)]">
                <span className="grid h-[18px] w-[18px] place-items-center rounded-full bg-gradient-to-br from-[#F49230] to-[#DE6F14] text-white">
                  <Spark className="h-[10px] w-[10px]" />
                </span>
                Ask Multi AI
              </span>
            )}
          </div>

          {/* ---------------- cursor + ripple ---------------- */}
          <span
            ref={rippleRef}
            aria-hidden="true"
            className="pointer-events-none absolute z-[85] -m-[13px] h-[26px] w-[26px] rounded-full border-2 border-brand-orange opacity-0"
          />
          <svg
            ref={cursorRef}
            aria-hidden="true"
            viewBox="0 0 24 24"
            width="23"
            height="23"
            fill="#fff"
            stroke="#1B1A17"
            strokeWidth={1.4}
            strokeLinejoin="round"
            className="pointer-events-none absolute left-0 top-0 z-[90] opacity-0 [filter:drop-shadow(0_2px_3px_rgba(0,0,0,0.32))]"
          >
            <path d="M5 3l14 8-6 1.5 3.5 6-2.8 1.6-3.5-6L7 18z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- the rail
// Rack focus: everything is soft, and only the two SOP HQ tabs sharpen once the
// plate has settled. The blur is applied per row rather than to the rail itself,
// because a filter on a parent rasterises its children with it and a child can
// never un-blur itself back out of an ancestor's filter.
const SOFT = { filter: "blur(3.4px)", opacity: 0.5 };
const SHARP = { filter: "blur(0px)", opacity: 1 };

const RAIL = [
  { k: "dash", label: "Dashboard", icon: GridGlyph },
  { k: "plan", label: "One Page Plan", icon: Star },
  { k: "score", label: "Scoreboards", icon: Trend },
  { k: "meet", label: "Team Meetings", icon: Clock },
  { k: "sop", label: "SOP HQ", icon: Folder, parent: true },
  { k: "lib", label: "SOP Library", icon: DocGlyph, sub: true, focus: true },
  { k: "planner", label: "SOP Planner", icon: StepsGlyph, sub: true, focus: true },
  { k: "forms", label: "Forms & Checklists", icon: ListGlyph },
];

function NavRail({ scene }: { scene: Scene }) {
  const RACK = `filter 620ms ${EASE}, opacity 620ms ${EASE}`;
  const active = scene.view === "planner" ? "planner" : "lib";

  return (
    <div
      className="absolute inset-y-0 left-0 z-0 flex flex-col border-r border-[#E7E4DE] bg-white"
      style={{ width: RAIL_W }}
    >
      <div className="flex items-center gap-2 px-3 py-3.5" style={{ ...SOFT, transition: RACK }}>
        <span className="grid h-[21px] w-[21px] flex-none place-items-center rounded-[7px] bg-brand-orange text-[10.5px] font-black text-white">
          M
        </span>
        <span className="text-[12px] font-extrabold tracking-tight">Multiply OS</span>
      </div>

      <div className="px-2 pb-2">
        {RAIL.map((n) => {
          const on = n.k === active;
          const Icon = n.icon;
          return (
            <div
              key={n.k}
              data-t={n.k === "planner" ? "nav-planner" : undefined}
              className="mb-0.5 flex items-center gap-2 rounded-[9px] py-[6px] pr-2"
              style={{
                paddingLeft: n.sub ? 22 : 8,
                background: on
                  ? "#FDF0E4"
                  : scene.hot === "nav-planner" && n.k === "planner"
                    ? "#FFF6EC"
                    : "transparent",
                color: on ? "#C9650F" : n.parent ? "#33302C" : "#6F6A62",
                ...(n.focus && scene.racked ? SHARP : SOFT),
                transition: `${RACK}, background 400ms, color 400ms`,
              }}
            >
              <Icon className={n.sub ? "h-[11px] w-[11px] flex-none" : "h-[13px] w-[13px] flex-none"} />
              <span className={`whitespace-nowrap font-semibold ${n.sub ? "text-[10.5px]" : "text-[11px]"}`}>
                {n.label}
              </span>
              {n.k === "planner" && (
                <span
                  className="ml-auto h-[6px] w-[6px] flex-none rounded-full transition-opacity duration-500"
                  style={{ background: "#E2703A", opacity: scene.racked ? 1 : 0 }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- view: planner
// The other half of SOP HQ. The library answers "where is the process"; the
// planner answers "which processes do we not have yet", which is the harder
// question and the one nobody asks until somebody leaves.
const PLAN_DEPTS = DEPTS.slice(0, 8);
const PLAN_DEPT = 0; // Operations
const PLAN_SOP = "Customer Service SOP";

function PlannerView({ scene }: { scene: Scene }) {
  const planned = scene.planAdded ? 1 : 0;
  const made = scene.planMade ? 1 : 0;
  const pct = planned ? Math.round((made / planned) * 100) : 0;

  return (
    <div className="sop-view flex h-full flex-col px-7 pb-5 pt-5">
      <div className="flex flex-none items-start gap-3">
        <span className="grid h-[34px] w-[34px] flex-none place-items-center rounded-[11px] bg-[#16233D] text-white">
          <StepsGlyph className="h-[18px] w-[18px]" />
        </span>
        <span className="min-w-0 flex-1">
          <h3 className="text-[21px] font-extrabold tracking-tight">SOP Planner</h3>
          <p className="mt-0.5 text-[11px] leading-snug text-brand-charcoal">
            Map out the core SOPs each department needs, assign who will write each one, and create
            them when you are ready.
          </p>
        </span>
      </div>

      {/* overall progress */}
      <div className="mt-3 flex-none rounded-xl border border-[#EBE7E0] bg-white px-3.5 py-2.5">
        <p className="text-[9px] font-bold uppercase tracking-[0.11em] text-brand-gray">
          Overall progress
        </p>
        <p className="mt-0.5 flex items-baseline gap-2">
          <span className="text-[17px] font-extrabold tabular-nums">{made}</span>
          <span className="text-[11px] text-brand-charcoal">
            of {planned} planned SOP{planned === 1 ? "" : "s"} created
          </span>
          <span
            className="ml-auto text-[19px] font-extrabold tabular-nums transition-colors duration-500"
            style={{ color: pct === 100 ? "#17A673" : "#0A0A0A" }}
          >
            {pct}%
          </span>
        </p>
        <span className="mt-1.5 block h-[5px] w-full overflow-hidden rounded-full bg-[#EFECE6]">
          <span
            className="block h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: "#17A673" }}
          />
        </span>
      </div>

      {/* one card per department */}
      <div className="mt-2.5 grid min-h-0 flex-1 grid-cols-2 gap-2 overflow-hidden">
        {PLAN_DEPTS.map((d, i) => {
          const Icon = d.icon;
          const isTarget = i === PLAN_DEPT;
          const has = isTarget && scene.planAdded;
          return (
            <div key={d.name} className="min-h-0 rounded-xl border border-[#EBE7E0] bg-white px-2.5 py-2">
              <div className="flex items-center gap-2">
                <span
                  className="grid h-[22px] w-[22px] flex-none place-items-center rounded-[7px] text-white"
                  style={{ background: d.color }}
                >
                  <Icon className="h-[12px] w-[12px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[11px] font-bold leading-tight">{d.name}</span>
                  <span className="block text-[8.5px] text-brand-gray">
                    {has ? `${made} of 1 created` : "No SOPs planned yet"}
                  </span>
                </span>
                {has && (
                  <span
                    className="flex-none font-mono text-[9.5px] font-bold tabular-nums transition-colors duration-500"
                    style={{ color: scene.planMade ? "#17A673" : "#A6A6A6" }}
                  >
                    {pct}%
                  </span>
                )}
              </div>

              {has && (
                <div className="sop-pop mt-1.5 flex items-center gap-2 border-t border-[#F1EEE9] pt-1.5">
                  <span
                    className="grid h-[13px] w-[13px] flex-none place-items-center rounded-full border transition-colors duration-300"
                    style={
                      scene.planMade
                        ? { background: "#17A673", borderColor: "#17A673", color: "#fff" }
                        : { borderColor: "#C9C2B6" }
                    }
                  >
                    {scene.planMade && (
                      <svg viewBox="0 0 24 24" className="h-[8px] w-[8px]" fill="none" stroke="currentColor" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                    )}
                  </span>
                  <span
                    className={`min-w-0 flex-1 truncate text-[10px] ${
                      scene.planMade ? "text-brand-gray line-through" : "font-semibold"
                    }`}
                  >
                    {PLAN_SOP}
                  </span>
                  <span
                    data-t="plan-who"
                    className="grid h-[17px] w-[17px] flex-none place-items-center rounded-full text-[6.5px] font-bold text-white transition-all duration-300"
                    style={
                      scene.planWho
                        ? { background: "#B4532A" }
                        : { background: "transparent", border: "1px dashed #C9C2B6", color: "#B7B2AA" }
                    }
                  >
                    {scene.planWho ? "PN" : "+"}
                  </span>
                  <span
                    data-t="plan-create"
                    className={`flex flex-none items-center gap-1 rounded-md px-1.5 py-[3px] text-[8.5px] font-bold text-white transition-all duration-200 ${
                      scene.hot === "plan-create" ? "shadow-[0_0_0_3px_rgba(234,123,27,0.4)]" : ""
                    }`}
                    style={{ background: scene.planMade ? "#9A958C" : "#16233D" }}
                  >
                    <Plus className="h-[8px] w-[8px]" />
                    {scene.planMade ? "Created" : "Create SOP"}
                  </span>
                </div>
              )}

              {/* the field that puts a missing process on the plan */}
              <div className="mt-1.5 flex items-center gap-1.5">
                <span
                  data-t={isTarget ? "plan-field" : undefined}
                  className="min-w-0 flex-1 truncate rounded-md border bg-[#FAF9F7] px-2 py-1 text-[9.5px] transition-all duration-200"
                  style={
                    isTarget && scene.planTyped && !scene.planAdded
                      ? { borderColor: "rgba(234,123,27,0.55)", background: "#fff" }
                      : { borderColor: "#E6E2DB" }
                  }
                >
                  {isTarget && scene.planTyped && !scene.planAdded ? (
                    <span className="font-medium text-brand-ink">
                      {scene.planTyped}
                      <span className="tour-caret" />
                    </span>
                  ) : (
                    <span className="text-brand-gray">Add an SOP this department needs...</span>
                  )}
                </span>
                <span
                  data-t={isTarget ? "plan-add" : undefined}
                  className={`flex flex-none items-center gap-1 rounded-md border border-[#E6E2DB] px-1.5 py-1 text-[9px] font-semibold text-brand-charcoal transition-all duration-200 ${
                    scene.hot === "plan-add" && isTarget ? "shadow-[0_0_0_3px_rgba(234,123,27,0.35)]" : ""
                  }`}
                >
                  <Plus className="h-[8px] w-[8px]" />
                  Add
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- shared bits
function tile(color: string) {
  return {
    background: `linear-gradient(145deg, color-mix(in srgb, ${color} 86%, #fff), color-mix(in srgb, ${color} 84%, #000))`,
    boxShadow: `0 3px 8px color-mix(in srgb, ${color} 34%, transparent), inset 0 1px 0 rgba(255,255,255,0.3)`,
    color: "#fff",
  };
}

// The ring that follows the cursor onto whatever it is about to press.
function hotRing(on: boolean) {
  return on
    ? "border-brand-orange/50 shadow-[0_0_0_3px_rgba(234,123,27,0.16)]"
    : "border-[#EBE7E0]";
}

function ViewToggle() {
  return (
    <span className="flex items-center gap-0.5 rounded-lg border border-[#E6E2DB] bg-white p-0.5">
      <span className="grid h-[20px] w-[20px] place-items-center rounded-md bg-brand-ink text-white">
        <GridGlyph className="h-3 w-3" />
      </span>
      <span className="grid h-[20px] w-[20px] place-items-center rounded-md text-brand-gray">
        <ListGlyph className="h-3 w-3" />
      </span>
    </span>
  );
}

function FilterBar() {
  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-0.5 rounded-lg bg-[#F1EEE9] p-0.5">
        {TABS.map((t, i) => (
          <span
            key={t}
            className={`whitespace-nowrap rounded-[7px] px-2.5 py-[5px] text-[10.5px] ${
              i === 0 ? "bg-brand-ink font-semibold text-white" : "font-medium text-brand-charcoal"
            }`}
          >
            {t}
          </span>
        ))}
      </span>
      <span className="flex h-[30px] min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#E6E2DB] bg-white px-2.5">
        <SearchGlyph className="h-3.5 w-3.5 flex-none text-brand-gray" />
        <span className="truncate text-[10.5px] text-brand-gray">
          Search SOPs by title, content, or concept
        </span>
      </span>
    </div>
  );
}

function Caret() {
  return <span className="tour-caret" />;
}

// ---------------------------------------------------------------- the two strips
// While a walkthrough records, the product keeps working underneath and the
// controls live in a strip at the top. Both strips are drawn over the view.
function RecBanner({ scene }: { scene: Scene }) {
  const hot = scene.hot === "finish";
  return (
    <div className="sop-view absolute inset-x-0 top-0 z-[55] flex items-center gap-2.5 border-b border-[#F3C9C2] bg-[#FDF1EF] px-5 py-2.5">
      <span className="sop-rec h-2 w-2 flex-none rounded-full bg-[#E8574A]" />
      <b className="text-[11.5px] font-semibold text-[#8E3325]">Recording your walkthrough</b>
      <span className="font-mono text-[11px] tabular-nums text-[#A5564A]">{clock(scene.wtSecs)}</span>
      <span className="ml-auto flex items-center gap-1.5">
        <span className="flex items-center gap-1.5 rounded-lg border border-[#E6E2DB] bg-white px-2.5 py-1.5 text-[10.5px] font-semibold text-brand-charcoal">
          <PauseGlyph className="h-2.5 w-2.5" />
          Pause
        </span>
        <span
          data-t="finish"
          className={`flex items-center gap-1.5 rounded-lg bg-[#16233D] px-3 py-1.5 text-[10.5px] font-semibold text-white transition-shadow duration-200 ${
            hot ? "shadow-[0_0_0_3px_rgba(234,123,27,0.4)]" : ""
          }`}
        >
          <StopGlyph className="h-2.5 w-2.5" />
          Finish &amp; draft
        </span>
        <Trash className="h-3.5 w-3.5 text-[#C08C84]" />
      </span>
    </div>
  );
}

function DraftBanner() {
  return (
    <div className="sop-view absolute inset-x-0 top-0 z-[55] flex items-center gap-2.5 border-b border-[#EFDDB4] bg-[#FDF8EC] px-5 py-2.5">
      <span className="flex flex-none items-center gap-1.5 rounded-full bg-[#F6E4C4] px-2 py-[3px] text-[9.5px] font-bold text-[#7A5418]">
        <Spark className="h-2.5 w-2.5" />
        AI SOP Agent
      </span>
      {/* the product's own spinner, so the wait reads as work rather than a stall */}
      <span className="sop-spin h-3 w-3 flex-none rounded-full border-[1.6px] border-[#D9BC85] border-t-transparent" />
      <b className="text-[11.5px] font-semibold text-brand-ink">Drafting your SOP</b>
      <span className="text-[10.5px] text-brand-charcoal">
        This usually takes 30 to 120 seconds. Keep working, it opens when it is ready.
      </span>
    </div>
  );
}

// ---------------------------------------------------------------- view: home
function HomeView({ scene }: { scene: Scene }) {
  return (
    <div className="sop-view flex h-full flex-col px-6 pb-6 pt-5">
      <div className="flex items-start">
        <div>
          <h3 className="text-[24px] font-extrabold tracking-tight">SOP HQ</h3>
          <p className="mt-0.5 text-[12.5px] text-brand-charcoal">
            How your team gets things done. Captured once, shared forever.
          </p>
        </div>
        <span
          data-t="new-sop"
          className={`ml-auto flex items-center gap-1.5 rounded-lg bg-[#16233D] px-3.5 py-2 text-[12px] font-semibold text-white transition-shadow duration-200 ${
            scene.hot === "new-sop" ? "shadow-[0_0_0_3px_rgba(234,123,27,0.35)]" : ""
          }`}
        >
          <Plus className="h-3.5 w-3.5" />
          New SOP
        </span>
      </div>

      <div className="mt-3.5 grid grid-cols-[minmax(0,1fr)_236px] gap-5">
        <div className="min-w-0">
          <div className="mb-2 flex items-center">
            <b className="text-[13.5px] tracking-tight">Departments</b>
            <span className="ml-auto mr-2 text-[10px] font-semibold text-brand-charcoal">
              Manage in Settings &rarr;
            </span>
            <ViewToggle />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {DEPTS.map((d, i) => {
              const Icon = d.icon;
              const hot = scene.hot === `dept-${i}`;
              return (
                <div
                  key={d.name}
                  data-t={`dept-${i}`}
                  className={`rounded-xl border bg-white p-2.5 transition-all duration-200 ${hotRing(hot)}`}
                >
                  <div className="flex items-start">
                    <span className="grid h-[27px] w-[27px] place-items-center rounded-[9px]" style={tile(d.color)}>
                      <Icon className="h-[15px] w-[15px]" />
                    </span>
                    <ArrowRight className={`ml-auto h-3 w-3 ${hot ? "text-brand-orange" : "text-[#C4BFB6]"}`} />
                  </div>
                  <p className="mt-1.5 truncate text-[12px] font-bold leading-tight">{d.name}</p>
                  <p className="mt-0.5 truncate text-[9px] text-brand-gray">{d.meta}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-1.5">
            <Star className="h-[14px] w-[14px] text-[#F0A31E]" filled />
            <b className="text-[12.5px] tracking-tight">Favorites</b>
          </div>
          <div className="grid place-items-center rounded-xl border border-dashed border-[#DED9D0] bg-white/60 px-3 py-4 text-center">
            <Star className="h-4 w-4 text-[#C4BFB6]" />
            <p className="mt-1 text-[10px] text-brand-gray">Star a SOP to pin it here.</p>
          </div>

          <div className="mb-2 mt-3 flex items-center gap-1.5">
            <Clock className="h-[13px] w-[13px] text-brand-gray" />
            <b className="text-[12.5px] tracking-tight">Recently viewed</b>
          </div>
          <div className="space-y-1.5">
            {RECENT.map((r) => (
              <div key={r.title} className="flex items-center gap-2 rounded-lg border border-[#EBE7E0] bg-white px-2 py-1.5">
                <span className="grid h-[20px] w-[20px] flex-none place-items-center rounded-md bg-[#EAF1F8] text-[#41638A]">
                  <Monitor className="h-[11px] w-[11px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[10px] font-semibold leading-tight">{r.title}</span>
                  <span className="text-[8.5px] text-brand-gray">{r.dept}</span>
                </span>
                <Star className="h-3 w-3 flex-none text-[#C4BFB6]" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3.5">
        <FilterBar />
      </div>

      <div className="mt-2.5 grid grid-cols-3 gap-2.5">
        {LIB_CARDS.map((s) => (
          <div key={s.title} className="rounded-xl border border-[#EBE7E0] bg-[#F4F1EC] p-2.5">
            <div className="flex items-start gap-2">
              <span className="grid h-[25px] w-[25px] flex-none place-items-center rounded-lg bg-[#DCE6F0] text-[9px] font-bold text-[#41638A]">
                {s.init}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[11px] font-bold leading-tight">{s.title}</span>
                <span className="mt-1 flex items-center gap-1.5 text-[8.5px] text-brand-gray">
                  <span className="rounded-full bg-[#F1EEE9] px-1.5 py-px font-semibold text-brand-charcoal">
                    {s.dept}
                  </span>
                  by {s.by}
                </span>
              </span>
              <span className="flex flex-none gap-1 text-brand-gray">
                <Star className="h-3 w-3" />
                <Share className="h-3 w-3" />
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[8.5px] text-brand-gray">
              <Clock className="h-2.5 w-2.5" />
              {s.mins}
              <span className="text-[#C4BFB6]">·</span>
              {s.steps} steps
              <span className="ml-auto">0/{s.steps} complete</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- view: subjects
function SubjectsView({ scene }: { scene: Scene }) {
  const dept = DEPTS[OPEN_DEPT];
  const Icon = dept.icon;
  return (
    <div className="sop-view flex h-full flex-col px-6 pb-6 pt-5">
      <span className="mb-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-brand-charcoal">
        <ArrowLeft className="h-3.5 w-3.5" />
        All departments
      </span>

      <div className="rounded-xl border border-[#EBE7E0] bg-white">
        <div className="flex items-center gap-3 px-3.5 py-3">
          <span className="grid h-[36px] w-[36px] flex-none place-items-center rounded-[11px]" style={tile(dept.color)}>
            <Icon className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-[17px] font-extrabold tracking-tight">{dept.name}</span>
            <span className="text-[10px] text-brand-gray">{dept.meta}</span>
          </span>
        </div>
        <p className="border-t border-[#F1EEE9] px-3.5 py-2 text-[9.5px] text-brand-gray">
          Members of this department automatically receive every SOP in it.
        </p>
      </div>

      <div className="mb-2.5 mt-4">
        <b className="block text-[14px] tracking-tight">Browse by subject</b>
        <span className="text-[10px] text-brand-gray">Pick a subject to see its SOPs.</span>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {SUBJECTS.map((s, i) => {
          const hot = scene.hot === `subj-${i}`;
          return (
            <div
              key={s.name}
              data-t={`subj-${i}`}
              className={`rounded-xl border bg-white p-2.5 transition-all duration-200 ${hotRing(hot)}`}
            >
              <div className="flex items-start">
                <span className="grid h-[27px] w-[27px] place-items-center rounded-[9px]" style={tile(s.color)}>
                  {s.inbox ? <Inbox className="h-[15px] w-[15px]" /> : <Folder className="h-[15px] w-[15px]" />}
                </span>
                <ArrowRight className={`ml-auto h-3 w-3 ${hot ? "text-brand-orange" : "text-[#C4BFB6]"}`} />
              </div>
              <p className="mt-1.5 truncate text-[12px] font-bold leading-tight">{s.name}</p>
              <p className="mt-0.5 text-[9.5px] text-brand-gray">{s.n} SOPs</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- view: SOP list
function SopListView({ scene }: { scene: Scene }) {
  const dept = DEPTS[OPEN_DEPT];
  const subject = SUBJECTS[OPEN_SUBJECT];
  return (
    <div className="sop-view flex h-full flex-col px-6 pb-6 pt-5">
      <span className="mb-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-brand-charcoal">
        <ArrowLeft className="h-3.5 w-3.5" />
        {dept.name} subjects
      </span>

      <div className="flex items-center gap-3 rounded-xl border border-[#EBE7E0] bg-white px-3.5 py-2.5">
        <span className="grid h-[34px] w-[34px] flex-none place-items-center rounded-[11px]" style={tile(subject.color)}>
          <Folder className="h-[19px] w-[19px]" />
        </span>
        <span>
          <span className="block text-[9.5px] text-brand-gray">{dept.name}</span>
          <span className="block text-[16px] font-extrabold leading-tight tracking-tight">{subject.name}</span>
          <span className="text-[9.5px] text-brand-gray">{subject.n} SOPs</span>
        </span>
      </div>

      <div className="mt-3">
        <FilterBar />
      </div>

      <div className="mt-2.5 space-y-2">
        {ONBOARDING_SOPS.map((s, i) => {
          const hot = scene.hot === `sop-${i}`;
          const meta = KIND_META[s.kind];
          const KindIcon = meta.icon;
          return (
            <div
              key={s.title}
              data-t={`sop-${i}`}
              className={`rounded-xl border bg-white p-3 transition-all duration-200 ${hotRing(hot)}`}
            >
              <div className="flex items-start gap-3">
                <span className="grid h-[32px] w-[32px] flex-none place-items-center rounded-[10px] bg-[#DCE6F0] text-[10.5px] font-bold text-[#41638A]">
                  {s.init}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-bold leading-tight">{s.title}</span>
                  <span className="mt-1 flex items-center gap-1.5 text-[10px] text-brand-gray">
                    <span className="rounded-full bg-[#F1EEE9] px-1.5 py-px font-semibold text-brand-charcoal">
                      {s.dept}
                    </span>
                    by {s.by}
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-1.5 py-px text-[8.5px] font-bold uppercase tracking-wide"
                      style={{ background: `${meta.color}14`, color: meta.color }}
                    >
                      <KindIcon className="h-[9px] w-[9px]" />
                      {meta.label}
                    </span>
                  </span>
                </span>
                <span className="flex flex-none items-center gap-1.5 text-brand-gray">
                  <Star className="h-3.5 w-3.5" />
                  <Share className="h-3.5 w-3.5" />
                  <ArrowRight className={`h-3.5 w-3.5 ${hot ? "text-brand-orange" : ""}`} />
                </span>
              </div>

              <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-[#F7F5F1] px-2.5 py-1.5 text-[9.5px] text-brand-gray">
                <People className="h-[11px] w-[11px] flex-none" />
                <span className="truncate">{s.shared}</span>
              </div>

              <div className="mt-2 flex items-center gap-2 text-[10px] text-brand-gray">
                <Clock className="h-[11px] w-[11px]" />
                {s.mins}
                <span className="text-[#C4BFB6]">·</span>
                {s.steps} {s.steps === 1 ? "step" : "steps"}
                <span className="ml-auto">0/{s.steps} complete</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- view: reading a SOP
function ReadView({ scene }: { scene: Scene }) {
  const sop = ONBOARDING_SOPS[OPEN_SOP];
  const hot = scene.hot === "crumb";
  return (
    <div className="sop-view flex h-full flex-col px-7 pb-6 pt-5">
      <div className="flex items-center gap-1.5 border-b border-[#EBE7E0] pb-2 text-[10px] text-brand-gray">
        <span
          data-t="crumb"
          className={`rounded px-1.5 py-0.5 font-semibold transition-all duration-200 ${
            hot ? "bg-[#FFF1E2] text-brand-orange-dark shadow-[0_0_0_3px_rgba(234,123,27,0.16)]" : "text-brand-charcoal"
          }`}
        >
          SOPs
        </span>
        <span>&rsaquo;</span>
        Operations
        <span>&rsaquo;</span>
        Onboarding
        <span>&rsaquo;</span>
        <b className="font-semibold text-brand-ink">{sop.title}</b>
      </div>

      <div className="mt-3 flex items-start">
        <div>
          <h3 className="text-[21px] font-extrabold tracking-tight">{sop.title}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-[10px] text-brand-gray">
            <Clock className="h-[11px] w-[11px]" />
            {sop.mins} read
          </p>
        </div>
        <div className="ml-auto flex flex-wrap justify-end gap-1.5">
          {[
            { l: "Favorite", i: Star },
            { l: "Share", i: Share },
            { l: "Print / PDF", i: Printer },
            { l: "Versions", i: History },
            { l: "Edit", i: Pencil },
          ].map(({ l, i: Ico }) => (
            <span
              key={l}
              className="flex items-center gap-1.5 rounded-lg border border-[#E6E2DB] bg-white px-2.5 py-1.5 text-[10.5px] font-semibold text-brand-charcoal"
            >
              <Ico className="h-3 w-3" />
              {l}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-2 flex justify-end gap-3.5 text-[10px] text-brand-charcoal">
        <span className="flex items-center gap-1.5">
          <Speaker className="h-3 w-3" />
          Read aloud
        </span>
        <span className="flex items-center gap-1.5">
          <Chat className="h-3 w-3" />
          Suggest an edit
        </span>
      </div>

      <div className="mt-2.5 rounded-xl border border-[#EBE7E0] bg-white px-4 py-3.5">
        <h4 className="text-[12.5px] font-bold">Before the call</h4>
        <ol className="mt-1.5 list-decimal space-y-1 pl-5">
          {CALL_STEPS.map((s) => (
            <li key={s} className="text-[11.5px] leading-relaxed text-[#2B2926]">
              {s}
            </li>
          ))}
        </ol>
      </div>

      <span className="mx-auto mt-3.5 rounded-lg bg-[#16233D] px-5 py-2 text-[11.5px] font-semibold text-white">
        Mark complete
      </span>
    </div>
  );
}

// ---------------------------------------------------------------- view: the editor
function EditorView({ scene }: { scene: Scene }) {
  return (
    <div className="sop-view flex h-full flex-col">
      {/* top bar */}
      <div className="flex items-center gap-2.5 border-b border-[#EBE7E0] px-5 py-3">
        <span
          data-t="all-sops"
          className={`flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[11.5px] font-semibold transition-all duration-200 ${
            scene.hot === "all-sops"
              ? "bg-[#FFF1E2] text-brand-orange-dark shadow-[0_0_0_3px_rgba(234,123,27,0.16)]"
              : ""
          }`}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All SOPs
        </span>
        <span className="flex items-center gap-1.5 text-[10.5px] text-[#2BA463]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#2BA463]" />
          Auto-save on
        </span>
        <span className="ml-auto flex items-center gap-1.5">
          {[
            { l: "Versions", i: History },
            { l: "Save draft", i: Save },
            { l: "Preview", i: Eye },
          ].map(({ l, i: Ico }) => (
            <span
              key={l}
              className="flex items-center gap-1.5 rounded-lg border border-[#E6E2DB] bg-white px-2.5 py-1.5 text-[10.5px] font-semibold text-brand-charcoal"
            >
              <Ico className="h-3 w-3" />
              {l}
            </span>
          ))}
          <span className="flex items-center gap-1.5 rounded-lg border border-[#F0D2CC] px-2.5 py-1.5 text-[10.5px] font-semibold text-[#D8563F]">
            <Trash className="h-3 w-3" />
            Discard
          </span>
          <span className="flex items-center gap-1.5 rounded-lg bg-[#16233D] px-3 py-1.5 text-[10.5px] font-semibold text-white">
            <Send className="h-3 w-3" />
            Publish
          </span>
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-6 py-4">
        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-brand-gray">SOP Title</p>
        <h3 className="mt-0.5 text-[20px] font-extrabold tracking-tight">{scene.title}</h3>

        <div className="mt-2 flex gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-[#F1EEE9] px-2.5 py-1 text-[10px] text-brand-charcoal">
            Department: <b className="font-semibold text-brand-ink">Company-wide</b>
            <Pencil className="h-2.5 w-2.5" />
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-[#F1EEE9] px-2.5 py-1 text-[10px] text-brand-charcoal">
            <Globe className="h-2.5 w-2.5" />
            Visible to everyone
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-brand-charcoal">
            Required training <span className="text-brand-gray">None</span>
          </span>
        </div>

        <div className="my-3 h-px bg-[#EBE7E0]" />

        <p className="mb-1.5 text-[10px] text-brand-gray">Add a block</p>
        <div className="flex flex-wrap gap-1.5">
          {BLOCKS.map((b, i) => {
            const Ico = b.icon;
            const hot = scene.hot === `blk-${i}`;
            return (
              <span
                key={b.label}
                data-t={`blk-${i}`}
                className={`flex items-center gap-1.5 rounded-full border bg-white px-3 py-1.5 text-[10.5px] font-medium transition-all duration-200 ${
                  hot
                    ? "border-brand-orange/60 bg-[#FFF6EC] shadow-[0_0_0_3px_rgba(234,123,27,0.16)]"
                    : "border-[#E6E2DB]"
                }`}
              >
                <Ico className="h-3 w-3 text-brand-charcoal" />
                {b.label}
              </span>
            );
          })}
        </div>

        {scene.doc === "rec" && <RecorderBlock scene={scene} />}
        {scene.doc === "draft" && <DraftBlock scene={scene} />}
      </div>
    </div>
  );
}

// The editor's rich-text toolbar, drawn flat the way the product renders it.
// `active` highlights one control, which is how the draft shows H2 selected.
function TextToolbar({ active }: { active?: string }) {
  const on = (k: string) =>
    active === k
      ? "rounded bg-[#FFF1E2] px-1 font-bold text-brand-orange-dark"
      : "";
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-[#EBE7E0] bg-[#FBFAF8] px-2.5 py-1.5 text-[10px] font-semibold text-brand-charcoal">
      <span className="font-bold">B</span>
      <span className="italic">I</span>
      <span className="underline">U</span>
      <span className="line-through">S</span>
      <span className="h-3 w-px bg-[#E3E0DA]" />
      <span className={on("h1")}>H1</span>
      <span className={on("h2")}>H2</span>
      <span className={on("h3")}>H3</span>
      <span className="h-3 w-px bg-[#E3E0DA]" />
      <ListGlyph className="h-3 w-3" />
      <LinkGlyph className="h-3 w-3" />
      <ImageGlyph className="h-3 w-3" />
    </div>
  );
}

// ---------------------------------------------------------------- act two
// The Screen Record block. Same three sources the product offers, the draggable
// camera bubble, a live Duration, and the two capture checkboxes. The mic
// warning the real recorder can show is left out on purpose: it is an error
// state, and this is the hero.
function RecorderBlock({ scene }: { scene: Scene }) {
  const { recSrc, recOn, recSecs } = scene;
  const hotStart = scene.hot === "rec-start";

  return (
    // Capped and centred: left to fill the stage, the preview came out at
    // roughly 5:1 and the app inside it read as a stack of bars.
    <div className="sop-view mx-auto mt-3 w-full max-w-[680px] rounded-xl border border-[#EBE7E0] bg-white p-3">
      <p className="mb-2 flex items-center gap-1.5 text-[8.5px] font-bold uppercase tracking-[0.12em] text-brand-gray">
        <ScreenGlyph className="h-3 w-3" />
        Screen Record
      </p>

      <div className="flex gap-3">
        {/* ---- the preview, and the source switch that sits on it ---- */}
        <div className="relative h-[186px] flex-1 overflow-hidden rounded-lg bg-[#1B1A17]">
          {/* The switch goes away once it rolls, and the REC light takes over.
              Before then the preview is empty, as it is in the product. */}
          {!recOn ? (
            <span className="absolute left-1/2 top-2.5 z-20 flex -translate-x-1/2 items-center gap-0.5 rounded-lg bg-[#2E2C28] p-0.5">
              {REC_SOURCES.map((s) => {
                const Icon = s.icon;
                const on = recSrc === s.key;
                const hot = scene.hot === `src-${s.key}`;
                return (
                  <span
                    key={s.key}
                    data-t={`src-${s.key}`}
                    className={`flex items-center gap-1.5 whitespace-nowrap rounded-[7px] px-2.5 py-1 text-[10px] transition-all duration-200 ${
                      on ? "bg-white font-semibold text-brand-ink" : "font-medium text-[#C9C4BC]"
                    } ${hot && !on ? "shadow-[0_0_0_2px_rgba(234,123,27,0.55)]" : ""}`}
                  >
                    <Icon className="h-3 w-3" />
                    {s.label}
                  </span>
                );
              })}
            </span>
          ) : (
            /* right, not left: the captured window's URL chip lives top-left */
            <span className="absolute right-4 top-4 z-20 flex items-center gap-1.5 rounded-full bg-black/60 px-2 py-1 text-[9px] font-semibold text-white backdrop-blur-sm">
              <span className="sop-rec h-[6px] w-[6px] rounded-full bg-[#E8574A]" />
              REC
            </span>
          )}

          {!recOn ? (
            <>
              <p className="absolute inset-0 grid place-items-center text-[10.5px] text-[#B8B2AA]">
                Click &ldquo;Start recording&rdquo; to begin
              </p>
              {recSrc === "camera" && (
                <span className="absolute inset-0 grid place-items-center pt-6">
                  <span className="grid h-[72px] w-[72px] place-items-center rounded-full bg-[#2E2C28] text-[#8C8781]">
                    <CameraGlyph className="h-7 w-7" />
                  </span>
                </span>
              )}
            </>
          ) : recSrc !== "camera" ? (
            /* the window being captured */
            <div className="absolute inset-0 p-2.5">
              <div className="flex h-full flex-col overflow-hidden rounded-md bg-[#F7F5F1]">
                <div className="flex flex-none items-center gap-1 border-b border-[#E6E2DB] bg-white px-2 py-1">
                  <span className="h-[5px] w-[5px] rounded-full bg-[#E8574A]" />
                  <span className="h-[5px] w-[5px] rounded-full bg-[#F0B429]" />
                  <span className="h-[5px] w-[5px] rounded-full bg-[#3BB273]" />
                  <span className="ml-1.5 rounded bg-[#F1EEE9] px-1.5 py-px text-[7px] text-brand-gray">
                    app.yourcrm.com
                  </span>
                </div>
                {/* sidebar plus main, so a wide frame still reads as an app */}
                <div className="flex min-h-0 flex-1">
                  <div className="w-[62px] flex-none space-y-1 border-r border-[#E6E2DB] bg-white p-1.5">
                    {[70, 52, 64, 44, 58].map((w, i) => (
                      <div key={i} className="h-1.5 rounded bg-[#E6E2DB]" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                  <div className="min-w-0 flex-1 p-2">
                    <div className="h-1.5 w-1/4 rounded bg-[#D3CDC2]" />
                    <div className="mt-2 grid grid-cols-3 gap-1.5">
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="h-[26px] rounded bg-white p-1 ring-1 ring-[#E6E2DB]"
                        >
                          <div className="h-1 w-3/5 rounded bg-[#E6E2DB]" />
                          <div className="mt-1 h-1 w-2/5 rounded bg-[#EFEBE4]" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 grid place-items-center">
              <span className="grid h-[86px] w-[86px] place-items-center rounded-full bg-[#2E2C28] text-[#8C8781]">
                <CameraGlyph className="h-8 w-8" />
              </span>
            </div>
          )}

          {/* the draggable camera bubble, and where it can go */}
          {recSrc === "both" && (
            <>
              <span className="absolute bottom-2.5 left-2.5 z-10 grid h-[46px] w-[46px] place-items-center rounded-full border-2 border-white/80 bg-[#2E2C28] px-1 text-center text-[7px] font-semibold leading-[1.15] text-white shadow-lg">
                {recOn ? <CameraGlyph className="h-4 w-4 text-[#B8B2AA]" /> : "Video will render here"}
              </span>
              {!recOn && (
                <span className="absolute bottom-2.5 right-2.5 grid h-[46px] w-[46px] place-items-center rounded-full border-2 border-dashed border-white/45 px-1 text-center text-[7px] font-medium leading-[1.15] text-white/70">
                  Move here
                </span>
              )}
            </>
          )}
        </div>

        {/* ---- the controls beside it ---- */}
        <div className="w-[178px] flex-none">
          <p className="text-[8.5px] font-bold uppercase tracking-[0.12em] text-brand-gray">Duration</p>
          <p className="font-mono text-[19px] font-semibold tabular-nums leading-tight">
            {clock(recSecs)}
          </p>

          <label className="mt-2.5 flex items-center gap-1.5 text-[10.5px] text-brand-charcoal">
            <span className="grid h-3 w-3 flex-none place-items-center rounded-[3px] bg-[#2C6BA6] text-white">
              <Check3 />
            </span>
            <Mic className="h-3 w-3 flex-none" />
            Record microphone
          </label>
          <div className="mt-1.5 rounded-md border border-[#E6E2DB] bg-white px-2 py-1 text-[9.5px] text-brand-charcoal">
            System default
          </div>
          {/* the level meter, alive only while it is actually recording */}
          <span className="mt-1.5 flex h-2.5 items-end gap-[2px]">
            {[6, 9, 5, 10, 7, 4, 8, 10, 6, 9, 5, 7].map((h, i) => (
              <span
                key={i}
                className={`w-full rounded-full ${recOn ? "sop-lvl bg-[#8FBF9F]" : "bg-[#E3E0DA]"}`}
                style={recOn ? { height: h, animationDelay: `${i * 70}ms` } : { height: h }}
              />
            ))}
          </span>

          <label className="mt-2 flex items-center gap-1.5 text-[10.5px] text-brand-charcoal">
            <span className="grid h-3 w-3 flex-none place-items-center rounded-[3px] bg-[#2C6BA6] text-white">
              <Check3 />
            </span>
            <CameraGlyph className="h-3 w-3 flex-none" />
            Record me on camera
          </label>

          <span
            data-t="rec-start"
            className={`mt-2.5 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-semibold text-white transition-shadow duration-200 ${
              recOn ? "bg-[#E8574A]" : "bg-[#16233D]"
            } ${hotStart ? "shadow-[0_0_0_3px_rgba(234,123,27,0.4)]" : ""}`}
          >
            {recOn ? (
              <>
                <span className="h-2 w-2 rounded-sm bg-white" />
                Stop &amp; save
              </>
            ) : (
              "Start recording"
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

// A checkbox tick, small enough that the stroke icon would turn to mush.
function Check3() {
  return (
    <svg viewBox="0 0 12 12" className="h-2 w-2" fill="none" stroke="currentColor" strokeWidth={2.4}
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 6.2l2.4 2.4L9.6 3.8" />
    </svg>
  );
}

// ---------------------------------------------------------------- act three
// What the agent hands back: a Text block with a heading it wrote, prose with the
// key terms bolded, and the screenshots it cut out of the recording. The
// timestamps are the detail that proves where the images came from.
function DraftBlock({ scene }: { scene: Scene }) {
  const typing = scene.draftP < DRAFT_PROSE_LEN;

  // Walk the chunks, handing each one only the characters typed so far.
  let seen = 0;
  const prose = DRAFT_PROSE.map((c, i) => {
    const take = Math.max(0, Math.min(c.t.length, scene.draftP - seen));
    seen += c.t.length;
    if (take === 0) return null;
    const text = c.t.slice(0, take);
    return c.b ? (
      <b key={i} className="font-bold text-brand-ink">
        {text}
      </b>
    ) : (
      <span key={i}>{text}</span>
    );
  });

  return (
    // Same cap as the recorder, so the two acts sit on the same measure and the
    // screenshots keep an aspect that reads as a screenshot.
    <div className="sop-view mx-auto mt-3 w-full max-w-[680px] rounded-xl border border-[#EBE7E0] bg-white p-3">
      <p className="mb-2 text-[8.5px] font-bold uppercase tracking-[0.12em] text-brand-gray">Text</p>
      <TextToolbar active="h2" />

      <div className="px-1 pt-2.5">
        <p className="text-[13px] font-bold">
          {scene.draftH}
          {scene.draftH.length > 0 && scene.draftH.length < DRAFT_HEADING.length && <Caret />}
        </p>
        {scene.draftP > 0 && (
          <p className="mt-1 text-[11.5px] leading-relaxed text-[#2B2926]">
            {prose}
            {typing && <Caret />}
          </p>
        )}

        {scene.shots > 0 && (
          <div className="mt-2.5 flex gap-2.5">
            {DRAFT_SHOTS.slice(0, scene.shots).map((at) => (
              <span key={at} className="sop-pop block w-[186px] flex-none">
                <span className="block overflow-hidden rounded-md border border-[#E6E2DB] bg-[#F7F5F1]">
                  {/* the doc's chrome, so it reads as a capture and not a grey box */}
                  <span className="flex items-center gap-1 border-b border-[#E6E2DB] bg-white px-1.5 py-[3px]">
                    <span className="h-[6px] w-[6px] rounded-[1px] bg-[#4285F4]" />
                    <span className="h-[3px] w-[38%] rounded bg-[#E0DAD1]" />
                  </span>
                  <span className="block h-[86px] bg-[#EFEDE8] px-2.5 py-2">
                    {/* the page, inset the way a doc page sits on its canvas */}
                    <span className="block h-full rounded-sm bg-white px-2 py-1.5">
                      <span className="block h-1.5 w-1/2 rounded bg-[#C9C2B6]" />
                      <span className="mt-1.5 block space-y-[3px]">
                        {[96, 88, 92, 70, 84, 60].map((w, i) => (
                          <span key={i} className="block h-[3px] rounded bg-[#E4DFD7]" style={{ width: `${w}%` }} />
                        ))}
                      </span>
                    </span>
                  </span>
                </span>
                <span className="mt-1 flex items-center gap-1 font-mono text-[8px] uppercase tracking-[0.08em] text-brand-gray">
                  <CameraGlyph className="h-2.5 w-2.5" />
                  {at}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- the New SOP modals
function ModalLayer({ scene }: { scene: Scene }) {
  return (
    <div className="absolute inset-0 z-[60] grid place-items-center bg-[rgba(24,19,12,0.42)] px-6">
      {scene.modal === "format" && <FormatModal scene={scene} />}
      {scene.modal === "start" && <StartModal scene={scene} />}
      {scene.modal === "title" && <TitleModal scene={scene} />}
      {scene.modal === "mic" && <MicModal scene={scene} />}
      {scene.modal === "picker" && <PickerModal scene={scene} />}
      {scene.modal === "count" && <CountModal scene={scene} />}
    </div>
  );
}

function modalCard(extra = "") {
  return `sop-view rounded-2xl bg-white p-5 shadow-[0_24px_60px_-18px_rgba(20,14,6,0.5)] ${extra}`;
}

function FormatModal({ scene }: { scene: Scene }) {
  const opts = [
    {
      key: "fmt-single",
      icon: DocGlyph,
      title: "Single document / video",
      body: "One page of content: text, video, image, or any combo. No step structure. Best for short procedures and reference material.",
      def: true,
    },
    {
      key: "fmt-multi",
      icon: StepsGlyph,
      title: "Multi-step",
      body: "Break it into ordered steps with their own titles and content. Best for longer procedures the team works through in sequence.",
      def: false,
    },
  ];
  return (
    <div className={modalCard("w-[520px]")}>
      <h4 className="text-[16px] font-bold tracking-tight">New SOP</h4>
      <p className="mt-1 text-[11.5px] leading-relaxed text-brand-charcoal">
        Pick the format. You can always change it later by adding or removing steps.
      </p>
      <div className="mt-3.5 grid grid-cols-2 gap-2.5">
        {opts.map((o) => {
          const Ico = o.icon;
          const hot = scene.hot === o.key;
          return (
            <div
              key={o.key}
              data-t={o.key}
              className={`rounded-xl border p-3 transition-all duration-200 ${
                hot
                  ? "border-brand-orange/60 shadow-[0_0_0_3px_rgba(234,123,27,0.16)]"
                  : "border-[#E6E2DB]"
              } ${o.def ? "bg-[#F7F5F1]" : "bg-white"}`}
            >
              <span className="mb-2 grid h-[28px] w-[28px] place-items-center rounded-lg bg-[#F1EEE9] text-brand-charcoal">
                <Ico className="h-4 w-4" />
              </span>
              <b className="block text-[12.5px] leading-tight">{o.title}</b>
              <p className="mt-1 text-[10px] leading-relaxed text-brand-charcoal">{o.body}</p>
              {o.def && <p className="mt-1.5 text-[10px] font-semibold">Default &rarr;</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StartModal({ scene }: { scene: Scene }) {
  const opts = [
    {
      key: "start-blank",
      icon: DocGlyph,
      title: "Start from blank",
      body: "Open an empty document and start writing.",
      def: true,
    },
    {
      key: "start-record",
      icon: ScreenGlyph,
      title: "Record a walkthrough with screenshots",
      body: "Narrate a screen recording and the AI SOP Agent writes a step-by-step SOP with screenshots from what you say and show.",
      def: false,
    },
    {
      key: "start-ai",
      icon: Wand,
      title: "Generate with AI",
      body: "Describe the procedure in one line. We draft the content you can refine.",
      def: false,
    },
    {
      key: "start-import",
      icon: UploadGlyph,
      title: "Upload or Paste SOP",
      body: "Import DOCX, Markdown, or rich paste content while preserving formatting, images, and links.",
      def: false,
    },
  ];
  return (
    <div className={modalCard("w-[560px]")}>
      <h4 className="text-[16px] font-bold tracking-tight">New SOP</h4>
      <p className="mt-1 text-[11.5px] leading-relaxed text-brand-charcoal">
        Start from blank, generate with AI from a one-line prompt, or paste a SOP you already have.
      </p>
      <p className="mt-2 text-[10.5px] text-brand-charcoal">
        Format: <b className="font-semibold text-brand-ink">Single document / video</b>{" "}
        <span className="text-[#2C6BA6] underline">Change</span>
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        {opts.map((o) => {
          const Ico = o.icon;
          const hot = scene.hot === o.key;
          return (
            <div
              key={o.key}
              data-t={o.key}
              className={`rounded-xl border p-3 transition-all duration-200 ${
                hot
                  ? "border-brand-orange/60 shadow-[0_0_0_3px_rgba(234,123,27,0.16)]"
                  : "border-[#E6E2DB]"
              } ${o.def ? "bg-[#F7F5F1]" : "bg-white"}`}
            >
              <span className="mb-2 grid h-[26px] w-[26px] place-items-center rounded-lg bg-[#F1EEE9] text-brand-charcoal">
                <Ico className="h-[14px] w-[14px]" />
              </span>
              <b className="block text-[12px] leading-tight">{o.title}</b>
              <p className="mt-1 text-[9.5px] leading-relaxed text-brand-charcoal">{o.body}</p>
              {o.def && <p className="mt-1.5 text-[9.5px] font-semibold">Default &rarr;</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Picking "Record a walkthrough" replaces the title modal with this: the mic
// choice, and the promise of what the agent is about to do with the narration.
function MicModal({ scene }: { scene: Scene }) {
  const hot = scene.hot === "mic-go";
  return (
    <div className={modalCard("w-[500px]")}>
      <h4 className="text-[16px] font-bold tracking-tight">New SOP</h4>
      <p className="mt-1 text-[11.5px] leading-relaxed text-brand-charcoal">
        Narrate as you go. The AI SOP Agent writes the SOP from what you say and what it sees on
        screen, and pulls screenshots straight out of the recording. Next you pick a screen to
        share, then a 3 second countdown before it starts. Keep it under ten minutes.
      </p>

      <p className="mt-3.5 text-[9px] font-bold uppercase tracking-[0.12em] text-brand-gray">
        Microphone
      </p>
      <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-[#E6E2DB] bg-white px-3 py-2 text-[11.5px] text-brand-ink">
        <Mic className="h-3.5 w-3.5 flex-none text-brand-charcoal" />
        System default
        <span className="ml-auto text-brand-gray">&#9662;</span>
      </div>
      <p className="mt-1.5 text-[10px] text-brand-gray">
        Your narration drives the draft, so make sure the right mic is picked.
      </p>

      <div className="mt-4 flex items-center justify-end gap-4">
        <span className="text-[11.5px] font-semibold text-brand-charcoal">Back</span>
        <span
          data-t="mic-go"
          className={`flex items-center gap-2 rounded-lg bg-[#16233D] px-4 py-2 text-[12px] font-semibold text-white transition-shadow duration-200 ${
            hot ? "shadow-[0_0_0_3px_rgba(234,123,27,0.35)]" : ""
          }`}
        >
          <ScreenGlyph className="h-3.5 w-3.5" />
          Choose screen &amp; start
        </span>
      </div>
    </div>
  );
}

// The browser's own share sheet, not the product's. Worth showing: it is the
// moment the reader realises this records their actual screen, not a mock-up of it.
function PickerModal({ scene }: { scene: Scene }) {
  const hotShare = scene.hot === "share-go";
  return (
    <div className="sop-view w-[560px] rounded-xl bg-[#292723] p-4 text-white shadow-[0_24px_60px_-18px_rgba(20,14,6,0.6)]">
      <h4 className="text-[13.5px] font-semibold">Choose what to share with app.multiplyos.com</h4>
      <p className="mt-1 text-[10.5px] text-[#B6B0A7]">
        The site will be able to see the contents of your screen
      </p>

      <div className="mt-3 flex gap-5 border-b border-white/12 text-[11px]">
        {[
          { l: "Chrome Tab", i: TabGlyph, on: true },
          { l: "Window", i: WindowGlyph, on: false },
          { l: "Entire Screen", i: AllScreenGlyph, on: false },
        ].map(({ l, i: Ico, on }) => (
          <span
            key={l}
            className={`flex items-center gap-1.5 border-b-2 pb-1.5 ${
              on ? "border-[#7CB2E8] font-semibold text-[#9CC7F2]" : "border-transparent text-[#B6B0A7]"
            }`}
          >
            <Ico className="h-3 w-3" />
            {l}
          </span>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_150px] gap-3">
        <div className="space-y-0.5 rounded-lg bg-[#1F1D1A] p-1.5">
          {SHARE_TABS.map((t, i) => {
            const sel = scene.picked && i === PICK_TAB;
            const hot = scene.hot === `tab-${i}`;
            return (
              <span
                key={t.title}
                data-t={`tab-${i}`}
                className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[10.5px] transition-all duration-200 ${
                  sel ? "bg-[#3A4B63] font-medium text-white" : "text-[#C9C4BC]"
                } ${hot && !sel ? "shadow-[0_0_0_2px_rgba(234,123,27,0.5)]" : ""}`}
              >
                <span className="h-2.5 w-2.5 flex-none rounded-full" style={{ background: t.dot }} />
                <span className="truncate">{t.title}</span>
              </span>
            );
          })}
        </div>
        <div className="grid place-items-center rounded-lg bg-[#3A3630] text-center text-[9.5px] text-[#B6B0A7]">
          {scene.picked ? (
            <span className="w-full px-2">
              <span className="mx-auto block h-[42px] w-full rounded border border-white/15 bg-[#4A453D]" />
              <span className="mt-1.5 block truncate">{SHARE_TABS[PICK_TAB].title}</span>
            </span>
          ) : (
            "Select a tab to share"
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-2.5 text-[10.5px] text-[#C9C4BC]">
        <SpeakerSmall className="h-3 w-3" />
        Also share tab audio
        <span className="ml-auto flex h-[15px] w-[26px] items-center rounded-full bg-[#5B8FD1] px-[2px]">
          <span className="ml-auto h-[11px] w-[11px] rounded-full bg-white" />
        </span>
      </div>

      <div className="mt-3 flex justify-end gap-2.5">
        <span
          data-t="share-go"
          className={`rounded-lg px-4 py-1.5 text-[11.5px] font-semibold transition-shadow duration-200 ${
            scene.picked ? "bg-[#4C89D6] text-white" : "bg-[#3A3630] text-[#8B857D]"
          } ${hotShare ? "shadow-[0_0_0_3px_rgba(234,123,27,0.45)]" : ""}`}
        >
          Share
        </span>
        <span className="rounded-lg border border-white/18 px-4 py-1.5 text-[11.5px] font-semibold text-[#C9C4BC]">
          Cancel
        </span>
      </div>
    </div>
  );
}

function CountModal({ scene }: { scene: Scene }) {
  return (
    <div className="sop-view grid place-items-center rounded-2xl bg-[#1B1A17] px-12 py-9 text-center text-white shadow-[0_24px_60px_-18px_rgba(20,14,6,0.6)]">
      <p key={scene.count} className="sop-pop font-mono text-[46px] font-bold leading-none tabular-nums">
        {scene.count}
      </p>
      <p className="mt-3 text-[12px] text-white/75">Get ready. Recording starts in&hellip;</p>
    </div>
  );
}

function TitleModal({ scene }: { scene: Scene }) {
  const hotField = scene.caret;
  const hotCreate = scene.hot === "create";
  return (
    <div className={modalCard("w-[430px]")}>
      <h4 className="text-[16px] font-bold tracking-tight">New SOP</h4>
      <p className="mt-1 text-[11.5px] leading-relaxed text-brand-charcoal">
        Give it a title your team will recognize. You can rename it anytime.
      </p>
      <p className="mt-3.5 text-[11px] font-semibold">SOP title</p>
      <div
        data-t="title-field"
        className={`mt-1.5 rounded-lg border bg-white px-3 py-2.5 text-[12.5px] transition-all duration-200 ${
          hotField ? "border-brand-orange/60 shadow-[0_0_0_3px_rgba(234,123,27,0.16)]" : "border-[#E6E2DB]"
        }`}
      >
        {scene.typed ? (
          <span className="font-medium text-brand-ink">
            {scene.typed}
            {hotField && <Caret />}
          </span>
        ) : (
          <span className="text-brand-gray">
            {hotField ? <Caret /> : "Name this SOP"}
          </span>
        )}
      </div>
      <div className="mt-4 flex items-center justify-end gap-4">
        <span className="text-[11.5px] font-semibold text-brand-charcoal">Back</span>
        <span
          data-t="create"
          className={`flex items-center gap-2 rounded-lg bg-[#16233D] px-4 py-2 text-[12px] font-semibold text-white transition-shadow duration-200 ${
            hotCreate ? "shadow-[0_0_0_3px_rgba(234,123,27,0.35)]" : ""
          }`}
        >
          Create
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  );
}
