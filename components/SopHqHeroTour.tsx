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

const MIN_W = 980; // narrower than this and the whole stage scales down
const STAGE_H = 500; // card height, sized to the tallest view (the library home)
const EASE = "cubic-bezier(0.22,1,0.36,1)";

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
const BLOCK_HEADING = "Before the call";

// ---------------------------------------------------------------- scene
type View = "home" | "subjects" | "soplist" | "read" | "editor";
type Modal = "" | "format" | "start" | "title";

type Scene = {
  view: View;
  modal: Modal;
  hot: string; // data-t of the element under the cursor
  typed: string; // characters entered in the title field
  caret: boolean;
  block: 0 | 1 | 2; // 0 none, 1 empty text block, 2 written in
  written: string;
};

const BLANK: Scene = { view: "home", modal: "", hot: "", typed: "", caret: false, block: 0, written: "" };

// The static frame shown under prefers-reduced-motion: the SOP itself, open.
const STILL: Scene = { ...BLANK, view: "read" };

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

    (async function loop() {
      setCursor(160, 46);
      while (alive()) {
        setScene({ ...BLANK });
        await wait(360);
        if (!alive()) return;
        await fade(1);

        // --- 1. open the department
        if (!(await tap("dept-0", 720))) return;
        patch({ view: "subjects" });
        await wait(760);

        // --- 2. open the subject
        if (!(await tap("subj-0", 600))) return;
        patch({ view: "soplist" });
        await wait(760);

        // --- 3. open the SOP, and let it be read
        if (!(await tap("sop-0", 600))) return;
        patch({ view: "read" });
        await wait(2100);

        // --- 4. back to the library
        if (!(await tap("crumb", 640))) return;
        patch({ view: "home" });
        await wait(700);

        // --- 5. New SOP, three modals
        if (!(await tap("new-sop", 660))) return;
        patch({ modal: "format" });
        await wait(560);

        if (!(await tap("fmt-single", 560))) return;
        patch({ modal: "start" });
        await wait(560);

        if (!(await tap("start-blank", 560))) return;
        patch({ modal: "title" });
        await wait(560);

        // type the title, then create
        await glide(pointAt("title-field"), 520);
        if (!alive()) return;
        await click();
        patch({ caret: true });
        await wait(240);
        await type(NEW_TITLE, (v) => patch({ typed: v }));
        if (!alive()) return;
        await wait(420);
        if (!(await tap("create", 520))) return;
        patch({ modal: "", view: "editor", caret: false });
        await wait(720);

        // --- 6. add a block and write in it
        if (!(await tap("blk-0", 640))) return;
        patch({ block: 1 });
        await wait(620);
        await type(BLOCK_HEADING, (v) => patch({ written: v }), 58);
        if (!alive()) return;
        patch({ block: 2 });
        await wait(2400);

        if (!alive()) return;
        await fade(0);
        await wait(560);
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
            className="relative overflow-hidden rounded-2xl border border-black/5 bg-[#FAF9F7] text-brand-ink shadow-[0_30px_60px_-30px_rgba(40,30,15,0.45),0_2px_6px_-3px_rgba(40,30,15,0.12)]"
            style={{ height: STAGE_H }}
          >
            {scene.view === "home" && <HomeView scene={scene} />}
            {scene.view === "subjects" && <SubjectsView scene={scene} />}
            {scene.view === "soplist" && <SopListView scene={scene} />}
            {scene.view === "read" && <ReadView scene={scene} />}
            {scene.view === "editor" && <EditorView scene={scene} />}

            {scene.modal && <ModalLayer scene={scene} />}

            {/* Ask Multi AI, present on every screen in the product */}
            <span className="pointer-events-none absolute bottom-4 right-5 z-[50] flex items-center gap-1.5 rounded-full border border-[#F7D8B4] bg-white px-3 py-1.5 text-[11px] font-semibold text-brand-ink shadow-[0_10px_22px_-10px_rgba(40,30,15,0.5)]">
              <span className="grid h-[18px] w-[18px] place-items-center rounded-full bg-gradient-to-br from-[#F49230] to-[#DE6F14] text-white">
                <Spark className="h-[10px] w-[10px]" />
              </span>
              Ask Multi AI
            </span>
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
        <span className="flex items-center gap-1.5 text-[11.5px] font-semibold">
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

      <div className="min-h-0 flex-1 px-6 py-4">
        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-brand-gray">SOP Title</p>
        <h3 className="mt-0.5 text-[20px] font-extrabold tracking-tight">{NEW_TITLE}</h3>

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

        {scene.block > 0 && <TextBlock scene={scene} />}
      </div>
    </div>
  );
}

// The one block the tour adds. Its toolbar is drawn flat, the way the editor
// renders it, so the block reads as a real editing surface rather than a card.
function TextBlock({ scene }: { scene: Scene }) {
  return (
    <div className="sop-view mt-3 rounded-xl border border-[#EBE7E0] bg-white p-3">
      <p className="mb-2 text-[8.5px] font-bold uppercase tracking-[0.12em] text-brand-gray">Text</p>
      <div className="flex items-center gap-2.5 rounded-lg border border-[#EBE7E0] bg-[#FBFAF8] px-2.5 py-1.5 text-[10px] font-semibold text-brand-charcoal">
        <span className="font-bold">B</span>
        <span className="italic">I</span>
        <span className="underline">U</span>
        <span className="line-through">S</span>
        <span className="h-3 w-px bg-[#E3E0DA]" />
        <span>H1</span>
        <span>H2</span>
        <span>H3</span>
        <span className="h-3 w-px bg-[#E3E0DA]" />
        <ListGlyph className="h-3 w-3" />
        <LinkGlyph className="h-3 w-3" />
        <ImageGlyph className="h-3 w-3" />
      </div>
      <div className="px-1 pt-2.5">
        {scene.block === 1 && scene.written.length === 0 ? (
          <p className="text-[11.5px] text-brand-gray">
            Write the step content...
            <Caret />
          </p>
        ) : (
          <>
            <p className="text-[13px] font-bold">
              {scene.written}
              {scene.block === 1 && <Caret />}
            </p>
            {scene.block === 2 && (
              <p className="sop-view mt-1 text-[11.5px] leading-relaxed text-[#2B2926]">
                Open the client record and read the last two notes, so you are not asking what
                they already told sales.
              </p>
            )}
          </>
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
