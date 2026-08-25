"use client";

// Animated hero for the Forms feature page.
//
// The client's brief for this page, in their order: show the form list, show
// creating a form, show a form that has been created, show the QR code, show a
// form adding a task, and show a response reaching Google Sheets. The first four
// are this tour. The last two are the Integrations section further down the page,
// because they are what happens after a submission rather than part of building.
//
// One loop:
//   1. the library                  26 forms, response counts, the sidebar
//   2. New form                     name it, start from blank, who can see it
//   3. the builder                  click three fields in, open one's settings
//   4. Preview                      the form as a person filling it in sees it
//   5. Publish                      the public link on your own subdomain
//   6. the QR code                  the thing you put on a flyer
//
// Content is generalised per docs/forms-feature-notes.md, section 8.
//
// Same architecture as the other four hero tours: the app is React state, only
// the cursor and its ripple are animated imperatively through the Web Animations
// API, and the sequence is generation-token guarded so a re-render or unmount
// cancels the in-flight tour rather than leaving orphaned timers behind.
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import ActZero, { runZero, type Zero } from "./ReplacesActZero";

const MIN_W = 980; // narrower than this and the whole stage scales down
const STAGE_H = 500;
const EASE = "cubic-bezier(0.22,1,0.36,1)";

// The three the client named for this page. Three marks in a row rather than one,
// so they render shorter than the single-logo pages do: at 64px they would run
// close to 850px inside a 980px stage. Heights get re-tuned per logo once the
// artwork lands, the way Asana and Monday.com were, because the exports do not
// share a trim.
const ZERO_ITEMS: { name: string; logo: string; h?: number }[] = [
  { name: "Jotform", logo: "/replaces-jotform.png", h: 53 },
  { name: "Google Forms", logo: "/replaces-google-forms.png", h: 54 },
  { name: "Typeform", logo: "/replaces-typeform.png", h: 59 },
];

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

const DocGlyph = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <rect x="4.6" y="3.3" width="14.8" height="17.4" rx="2.3" />
    <path d="M8.4 8.4h7.2M8.4 12.4h7.2M8.4 16.4h4.4" />
  </svg>
);
const Plus = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2.4}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const ArrowLeft = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2}>
    <path d="M19.2 12H4.8M10.6 6.4L4.8 12l5.8 5.6" />
  </svg>
);
const SearchGlyph = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <circle cx="10.8" cy="10.8" r="6.4" />
    <path d="M15.6 15.6l4.4 4.4" />
  </svg>
);
const Chat = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M20.4 12.6a7.4 7.4 0 0 1-7.4 7.4 8 8 0 0 1-3.3-.7L4.4 21l1.7-4.9a7.4 7.4 0 1 1 14.3-3.5z" />
  </svg>
);
const Building = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M4.6 20.4V5.6a1.4 1.4 0 0 1 1.4-1.4h7.2a1.4 1.4 0 0 1 1.4 1.4v14.8" />
    <path d="M14.6 10.4h3.4a1.4 1.4 0 0 1 1.4 1.4v8.6" />
    <path d="M7.8 8h3.4M7.8 11.8h3.4M7.8 15.6h3.4M3.4 20.4h17.2" />
  </svg>
);
const People = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <circle cx="9.2" cy="8.4" r="3" />
    <path d="M3.6 18.6c0-2.8 2.5-4.6 5.6-4.6s5.6 1.8 5.6 4.6" />
    <path d="M16.2 6.2a3 3 0 0 1 0 5.6M17.4 14.6c1.9.6 3.2 1.9 3.2 4" />
  </svg>
);
const Lock = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <rect x="4.8" y="10.4" width="14.4" height="9.8" rx="2" />
    <path d="M8.4 10.4V7.8a3.6 3.6 0 0 1 7.2 0v2.6" />
  </svg>
);
const Folder = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M3.2 6.6a1.8 1.8 0 0 1 1.8-1.8h3.7l2 2.4h7.5a1.8 1.8 0 0 1 1.8 1.8v8.4a1.8 1.8 0 0 1-1.8 1.8H5a1.8 1.8 0 0 1-1.8-1.8z" />
  </svg>
);
const FolderPlus = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M3.2 6.6a1.8 1.8 0 0 1 1.8-1.8h3.7l2 2.4h7.5a1.8 1.8 0 0 1 1.8 1.8v8.4a1.8 1.8 0 0 1-1.8 1.8H5a1.8 1.8 0 0 1-1.8-1.8z" />
    <path d="M11.2 11.4v4.4M9 13.6h4.4" />
  </svg>
);
const Trash = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M4.6 6.6h14.8M9.4 6.6V4.8h5.2v1.8M6.4 6.6l1 12.6h9.2l1-12.6" />
  </svg>
);
const Inbox = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M3.2 13.4h4.2l1.4 2.4h6.4l1.4-2.4h4.2" />
    <path d="M5.4 5h13.2l2.2 8.4v4A1.6 1.6 0 0 1 19.2 19H4.8a1.6 1.6 0 0 1-1.6-1.6v-4z" />
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
const Eye = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M2.6 12S6 5.8 12 5.8 21.4 12 21.4 12 18 18.2 12 18.2 2.6 12 2.6 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const Rocket = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M14.6 3.6c2.4 1.2 4.4 3.4 5.8 5.8L14 15.8l-5.8-5.8z" />
    <path d="M8.2 10L4.4 11.4l2 2M14 15.8l-1.4 3.8-2-2" />
    <circle cx="15.4" cy="8.6" r="1.4" />
  </svg>
);
const Palette = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M12 20.4a8.4 8.4 0 1 1 8.4-8.4c0 2.2-1.8 3-3.4 3h-1.4a2 2 0 0 0-1.4 3.4 1.6 1.6 0 0 1-1.2 2z" />
    <circle cx="8.4" cy="10" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="7.6" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="15.6" cy="10" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);
const Bell = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M17.6 11.6a5.6 5.6 0 1 0-11.2 0c0 4.2-1.8 5.4-1.8 5.4h14.8s-1.8-1.2-1.8-5.4z" />
    <path d="M10.4 20a1.9 1.9 0 0 0 3.2 0" />
  </svg>
);
const Plug = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M9 3.4v5M15 3.4v5" />
    <path d="M6.6 8.4h10.8v2.4a5.4 5.4 0 0 1-10.8 0z" />
    <path d="M12 16.2v4.4" />
  </svg>
);
const Sliders = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M4.4 7.2h8M16.4 7.2h3.2M4.4 16.8h3.2M11.6 16.8h8" />
    <circle cx="14.2" cy="7.2" r="2.2" />
    <circle cx="9.4" cy="16.8" r="2.2" />
  </svg>
);
const Grid = ({ className }: IconProps) => (
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
const Spark = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.6 4L18 8.5 14 10l-2 4-2-4-4-1.5L10 7z" />
  </svg>
);
const Copy = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <rect x="8.6" y="8.6" width="11.2" height="11.2" rx="2" />
    <path d="M15.4 8.6V6.2a2 2 0 0 0-2-2H6.2a2 2 0 0 0-2 2v7.2a2 2 0 0 0 2 2h2.4" />
  </svg>
);
const QrGlyph = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.8}>
    <rect x="3.6" y="3.6" width="6" height="6" rx="1.2" />
    <rect x="14.4" y="3.6" width="6" height="6" rx="1.2" />
    <rect x="3.6" y="14.4" width="6" height="6" rx="1.2" />
    <path d="M14.4 14.4h2.4v2.4M20.4 17.6v2.8h-3.2" />
  </svg>
);
const Download = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M12 4.6v11M7.4 11l4.6 4.6L16.6 11M4.4 19.4h15.2" />
  </svg>
);
const Check = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2.6}>
    <path d="M5 12l5 5L20 7" />
  </svg>
);

// palette glyphs, kept simple because they render at 11px
const Tt = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2}><path d="M5.4 6.2h13.2M12 6.2v11.6" /></svg>
);
const Rows = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2}><path d="M4.4 7.6h15.2M4.4 12h15.2M4.4 16.4h9" /></svg>
);
const Mail = ({ className }: IconProps) => (
  <svg className={className} {...ico}><rect x="3.4" y="5.6" width="17.2" height="12.8" rx="2" /><path d="M3.8 7l8.2 5.6L20.2 7" /></svg>
);
const Radio = ({ className }: IconProps) => (
  <svg className={className} {...ico}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" /></svg>
);
const CheckSq = ({ className }: IconProps) => (
  <svg className={className} {...ico}><rect x="4" y="4" width="16" height="16" rx="2.4" /><path d="M8 12.4l2.6 2.6L16 9.6" /></svg>
);
const Caret = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2.2}><path d="M6.4 9.6l5.6 5.2 5.6-5.2" /></svg>
);
const Star = ({ className }: IconProps) => (
  <svg className={className} {...ico}><path d="M12 3.9l2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5 2.7 1-5.6-4.1-3.9 5.6-.8z" /></svg>
);
const Gauge = ({ className }: IconProps) => (
  <svg className={className} {...ico}><path d="M4 16.4a8.4 8.4 0 1 1 16 0" /><path d="M12 16.4l3.8-4.6" /></svg>
);
const Clip = ({ className }: IconProps) => (
  <svg className={className} {...ico}><path d="M16.6 8.4l-6.8 6.8a2.6 2.6 0 0 0 3.6 3.6l6.4-6.4a4.8 4.8 0 0 0-6.8-6.8L6 12.4a7 7 0 0 0 9.8 9.8" /></svg>
);
const Pen = ({ className }: IconProps) => (
  <svg className={className} {...ico}><path d="M4 20.2l.6-4L16.2 4.6a2 2 0 0 1 2.8 0l.4.4a2 2 0 0 1 0 2.8L8 19.6z" /></svg>
);
const Img = ({ className }: IconProps) => (
  <svg className={className} {...ico}><rect x="3.2" y="4.6" width="17.6" height="14.8" rx="2.2" /><circle cx="8.6" cy="9.8" r="1.6" /><path d="M4.4 17l4.8-4.6 3.4 3.2 3-2.6 4 3.8" /></svg>
);
const Hash = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2}><path d="M9 4.4L7.4 19.6M16.6 4.4L15 19.6M4.4 9h15.2M3.8 15h15.2" /></svg>
);
const Cal = ({ className }: IconProps) => (
  <svg className={className} {...ico}><rect x="3.6" y="5.4" width="16.8" height="15" rx="2.2" /><path d="M3.6 10h16.8M8.4 3.4v3.6M15.6 3.4v3.6" /></svg>
);

// ---------------------------------------------------------------- data
// The library, generalised. Response counts are the interesting column: they are
// what a reader checks to see whether anybody actually fills these in.
type Row = { title: string; by: string; date: string; vis: string; shared?: boolean; n: number };

const FORMS: Row[] = [
  { title: "Onboarding Call Booking", by: "Skylar", date: "8/21/2026", vis: "Company", n: 1 },
  { title: "Client Intake Form", by: "Jordan", date: "8/20/2026", vis: "Company", n: 6 },
  { title: "IT Requests", by: "Marcus", date: "8/19/2026", vis: "Department", n: 21 },
  { title: "Pre-Event Questionnaire", by: "Priya", date: "8/18/2026", vis: "Company", n: 0 },
  { title: "Group Coaching Call", by: "Kath", date: "8/15/2026", vis: "Company", shared: true, n: 108 },
  { title: "Event Debrief Form", by: "Skylar", date: "8/17/2026", vis: "Company", shared: true, n: 6 },
  { title: "Event Waiver", by: "Priya", date: "8/13/2026", vis: "Company", n: 34 },
  { title: "Study Sign-Up", by: "Jordan", date: "8/11/2026", vis: "Company", shared: true, n: 62 },
];

const SIDE = [
  { label: "All Forms", icon: Inbox, n: "", on: true },
  { label: "My Forms", icon: People, n: "4" },
  { label: "Department Forms", icon: People, n: "1" },
  { label: "Shared with Me", icon: Share, n: "3" },
];

const FOLDERS = [
  { label: "Client Programs", n: "9", locked: true },
  { label: "New folder", n: "", plus: true },
];

const TABS = ["All Forms", "Customer Surveys", "Employee Surveys"];

// The builder's five stages, as the left rail lists them.
const STAGES = [
  { key: "build", label: "Build", sub: "Fields & layout", icon: Grid },
  { key: "recipients", label: "Recipients", sub: "0 added", icon: People },
  { key: "notify", label: "Email Notifications", sub: "0 addresses", icon: Bell },
  { key: "integrations", label: "Integrations", sub: "Sheets, CRM, tasks", icon: Plug },
  { key: "settings", label: "Settings", sub: "Layout, link, security", icon: Sliders },
];

// The palette, all seven groups. The tour only clicks three of them, but the
// whole thing is drawn: the point of the shot is that there are twenty-eight.
const PALETTE: { group: string; items: { label: string; icon: (p: IconProps) => React.JSX.Element }[] }[] = [
  {
    group: "Text",
    items: [
      { label: "Short text", icon: Tt }, { label: "Long text", icon: Rows },
      { label: "Fill in the bl...", icon: Tt }, { label: "Email", icon: Mail },
      { label: "Phone", icon: Hash }, { label: "Number", icon: Hash },
      { label: "Currency", icon: Hash }, { label: "Website", icon: Clip },
    ],
  },
  {
    group: "Choice",
    items: [
      { label: "Single choice", icon: Radio }, { label: "Multiple ch...", icon: CheckSq },
      { label: "Dropdown", icon: Caret }, { label: "Multi-select", icon: Rows },
      { label: "Ranking", icon: Rows }, { label: "Yes / No", icon: Radio },
      { label: "Consent / a...", icon: CheckSq },
    ],
  },
  { group: "Contact", items: [{ label: "Full name", icon: People }, { label: "Address", icon: Img }] },
  { group: "Date & time", items: [{ label: "Date", icon: Cal }, { label: "Time", icon: Gauge }] },
  { group: "Survey", items: [{ label: "Star rating", icon: Star }, { label: "NPS (0-10)", icon: Gauge }] },
  {
    group: "Media & files",
    items: [
      { label: "File upload", icon: Clip }, { label: "Signature", icon: Pen },
      { label: "Image", icon: Img }, { label: "Logo", icon: Img }, { label: "Video", icon: Eye },
    ],
  },
  {
    group: "Layout",
    items: [
      { label: "Section he...", icon: Tt }, { label: "Text block", icon: Rows },
      { label: "Divider", icon: ListGlyph }, { label: "Page break", icon: Rows },
    ],
  },
];

// data-t keys for the three fields the tour clicks, looked up by label.
const PICKS = ["Full name", "Single choice", "Dropdown"];

const NEW_NAME = "Client Intake";
const PUBLIC_URL = "forms.yourcompany.com/client-intake";

// The three fields, as they render on the canvas and in the preview.
type Field = { label: string; kind: "name" | "choice" | "dropdown" };
const FIELDS: Field[] = [
  { label: "Full name", kind: "name" },
  { label: "What do you need help with?", kind: "choice" },
  { label: "How did you hear about us?", kind: "dropdown" },
];

const CHOICES = ["Onboarding", "Billing", "Something else"];
const DROPS = ["A referral", "Search", "Social"];

// ---------------------------------------------------------------- scene
type View = "library" | "builder" | "preview" | "published";

type Scene = {
  view: View;
  zero: Zero;
  modal: "" | "new" | "qr";
  hot: string;
  typed: string; // the form name being entered
  caret: boolean;
  fields: number; // how many of FIELDS are on the canvas
  selected: number; // which field's settings panel is open, -1 for none
  share: boolean; // the Sharing popover
  live: boolean; // published
};

const BLANK: Scene = {
  view: "library", zero: "", modal: "", hot: "", typed: "", caret: false,
  fields: 0, selected: -1, share: false, live: false,
};

// The static frame under prefers-reduced-motion: the published form, since that
// is the outcome the tour exists to show.
const STILL: Scene = {
  ...BLANK, view: "published", fields: FIELDS.length, live: true,
};

// ---------------------------------------------------------------- component
export default function FormsHeroTour() {
  const hostRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<SVGSVGElement>(null);
  const rippleRef = useRef<HTMLSpanElement>(null);

  const inView = useInView(hostRef, { margin: "-60px" });
  const reduce = useReducedMotion() ?? false;

  const [scene, setScene] = useState<Scene>(reduce ? STILL : BLANK);
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

        // --- act zero, only once somebody decides what this replaces
        if (ZERO_ITEMS.length) {
          if (!(await runZero((z) => patch({ zero: z }), wait, alive, ZERO_ITEMS.length))) return;
        } else {
          await wait(340);
        }
        if (!alive()) return;
        await fade(1);

        // --- 1. the library, then New form
        await wait(1500);
        if (!(await tap("new-form", 700))) return;
        patch({ modal: "new" });
        await wait(520);

        // name it
        await glide(pointAt("name-field"), 520);
        if (!alive()) return;
        await click();
        patch({ caret: true });
        await wait(220);
        await type(NEW_NAME, (v) => patch({ typed: v }));
        if (!alive()) return;
        await wait(320);

        // who can see it, then create
        if (!(await tap("vis-company", 560))) return;
        await wait(260);
        if (!(await tap("create", 520))) return;
        patch({ modal: "", view: "builder", caret: false });
        await wait(680);

        // --- 2. the builder: three fields in
        for (let i = 0; i < FIELDS.length; i++) {
          if (!(await tap(`fld-${PICKS[i]}`, i === 0 ? 700 : 520))) return;
          patch({ fields: i + 1 });
          await wait(i === FIELDS.length - 1 ? 320 : 480);
        }

        // open the last field's settings, so options and conditional logic show
        if (!(await tap("canvas-2", 560))) return;
        patch({ selected: 2 });
        await wait(2300);

        // --- 3. preview it
        if (!(await tap("preview", 640))) return;
        patch({ view: "preview", selected: -1 });
        await wait(2400);

        // --- 4. publish, and open the share popover
        if (!(await tap("publish", 620))) return;
        patch({ view: "published", live: true });
        await wait(760);

        // Copy link, not Sharing: Sharing is who on your team can access the
        // form. The public link, QR, and embed are behind Copy link.
        if (!(await tap("copy", 560))) return;
        patch({ share: true });
        await wait(2100);

        // --- 5. the QR code
        if (!(await tap("qr", 540))) return;
        patch({ modal: "qr" });
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
            className="relative overflow-hidden rounded-2xl border border-black/5 bg-[#FAF9F7] text-brand-ink shadow-[0_30px_60px_-30px_rgba(40,30,15,0.45),0_2px_6px_-3px_rgba(40,30,15,0.12)]"
            style={{ height: STAGE_H }}
          >
            {scene.view === "library" && <LibraryView scene={scene} />}
            {scene.view === "builder" && <BuilderView scene={scene} />}
            {scene.view === "preview" && <PreviewView scene={scene} />}
            {scene.view === "published" && <PublishedView scene={scene} />}

            {scene.modal === "new" && <NewFormModal scene={scene} />}
            {scene.modal === "qr" && <QrModal />}

            {scene.zero && <ActZero state={scene.zero} items={ZERO_ITEMS} bg="#FAF9F7" />}

            {/* Ask Multi AI, present on every screen in the product. Not on the
                public form, which is somebody else's browser. */}
            {scene.view !== "preview" && (
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

// ---------------------------------------------------------------- shared bits
function hotRing(on: boolean) {
  return on ? "border-brand-orange/50 shadow-[0_0_0_3px_rgba(234,123,27,0.16)]" : "border-[#EBE7E0]";
}

function TypeCaret() {
  return <span className="tour-caret" />;
}

// ---------------------------------------------------------------- view: library
function LibraryView({ scene }: { scene: Scene }) {
  return (
    <div className="sop-view flex h-full flex-col px-6 pb-5 pt-5">
      {/* the header card, as the product draws it */}
      <div className="flex flex-none items-start gap-3 rounded-xl border border-[#EBE7E0] bg-white px-4 py-3">
        <span className="grid h-[34px] w-[34px] flex-none place-items-center rounded-[10px] bg-gradient-to-br from-[#F49230] to-[#DE6F14] text-white shadow-[0_3px_8px_rgba(222,111,20,0.3)]">
          <DocGlyph className="h-[19px] w-[19px]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[21px] font-extrabold leading-tight tracking-tight">Forms</span>
          <span className="block text-[11.5px] text-brand-charcoal">
            Build and share forms. Feedback surveys, client intake, and employee surveys.
          </span>
          <span className="mt-2 flex items-center gap-1.5">
            {[
              { n: "26", l: "forms", i: DocGlyph },
              { n: "294", l: "responses", i: Chat },
              { n: "25", l: "published", i: Check },
            ].map(({ n, l, i: Ico }) => (
              <span
                key={l}
                className="flex items-center gap-1.5 rounded-full border border-[#EBE7E0] bg-[#FAF9F7] px-2.5 py-[3px] text-[10px] text-brand-gray"
              >
                <Ico className="h-[11px] w-[11px] text-brand-orange-dark" />
                <b className="font-bold text-brand-ink">{n}</b>
                {l}
              </span>
            ))}
          </span>
        </span>
        <span
          data-t="new-form"
          className={`flex flex-none items-center gap-1.5 rounded-lg bg-[#16233D] px-3.5 py-2 text-[12px] font-semibold text-white transition-shadow duration-200 ${
            scene.hot === "new-form" ? "shadow-[0_0_0_3px_rgba(234,123,27,0.4)]" : ""
          }`}
        >
          <Plus className="h-3.5 w-3.5" />
          New form
        </span>
      </div>

      {/* tabs and controls */}
      <div className="mt-3 flex flex-none items-center gap-2">
        <span className="flex items-center gap-0.5 rounded-lg bg-[#F1EEE9] p-0.5">
          {TABS.map((t, i) => (
            <span
              key={t}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-[7px] px-2.5 py-[5px] text-[10.5px] ${
                i === 0 ? "bg-brand-ink font-semibold text-white" : "font-medium text-brand-charcoal"
              }`}
            >
              {t}
              {i === 2 && (
                <span className="rounded-full bg-[#E3E0DA] px-1.5 text-[8.5px] font-bold text-brand-charcoal">2</span>
              )}
            </span>
          ))}
        </span>
        <span className="flex h-[30px] min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#E6E2DB] bg-white px-2.5">
          <SearchGlyph className="h-3.5 w-3.5 flex-none text-brand-gray" />
          <span className="truncate text-[10.5px] text-brand-gray">Search forms...</span>
        </span>
        <span className="flex flex-none items-center gap-1.5 rounded-lg border border-[#E6E2DB] bg-white px-2.5 py-1.5 text-[10.5px] text-brand-charcoal">
          Last activity
          <Caret className="h-2.5 w-2.5" />
        </span>
        <span className="flex flex-none items-center gap-0.5 rounded-lg border border-[#E6E2DB] bg-white p-0.5">
          <span className="grid h-[20px] w-[20px] place-items-center rounded-md bg-brand-ink text-white">
            <ListGlyph className="h-3 w-3" />
          </span>
          <span className="grid h-[20px] w-[20px] place-items-center rounded-md text-brand-gray">
            <Grid className="h-3 w-3" />
          </span>
        </span>
      </div>

      {/* sidebar plus rows */}
      <div className="mt-3 grid min-h-0 flex-1 grid-cols-[178px_minmax(0,1fr)] gap-4">
        <div className="min-w-0">
          {SIDE.map((s) => {
            const Ico = s.icon;
            return (
              <span
                key={s.label}
                className={`mb-0.5 flex items-center gap-2 rounded-lg px-2.5 py-[7px] text-[11px] ${
                  s.on ? "bg-[#F1EEE9] font-semibold text-brand-ink" : "font-medium text-brand-charcoal"
                }`}
              >
                <Ico className="h-3.5 w-3.5 flex-none text-brand-gray" />
                <span className="min-w-0 flex-1 truncate">{s.label}</span>
                {s.n && <span className="flex-none text-[9.5px] text-brand-gray">{s.n}</span>}
              </span>
            );
          })}
          <span className="my-1.5 block h-px bg-[#EBE7E0]" />
          {FOLDERS.map((f) => (
            <span
              key={f.label}
              className="mb-0.5 flex items-center gap-2 rounded-lg px-2.5 py-[7px] text-[11px] font-medium text-brand-charcoal"
            >
              {f.plus ? (
                <FolderPlus className="h-3.5 w-3.5 flex-none text-brand-gray" />
              ) : (
                <Folder className="h-3.5 w-3.5 flex-none text-brand-gray" />
              )}
              <span className="min-w-0 flex-1 truncate">{f.label}</span>
              {f.locked && <Lock className="h-2.5 w-2.5 flex-none text-brand-gray" />}
              {f.n && <span className="flex-none text-[9.5px] text-brand-gray">{f.n}</span>}
            </span>
          ))}
          <span className="my-1.5 block h-px bg-[#EBE7E0]" />
          <span className="flex items-center gap-2 rounded-lg px-2.5 py-[7px] text-[11px] font-medium text-brand-charcoal">
            <Trash className="h-3.5 w-3.5 flex-none text-brand-gray" />
            <span className="flex-1">Trash</span>
            <span className="text-[9.5px] text-brand-gray">0</span>
          </span>
        </div>

        <div className="min-h-0 overflow-hidden rounded-xl border border-[#EBE7E0] bg-white">
          {FORMS.map((f) => (
            <div
              key={f.title}
              className="flex items-center gap-3 border-b border-[#F5F2ED] px-3 py-[9px] last:border-b-0"
            >
              <span className="grid h-[26px] w-[26px] flex-none place-items-center rounded-lg bg-[#EAF1F8] text-[#41638A]">
                <DocGlyph className="h-[14px] w-[14px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] font-bold leading-tight">{f.title}</span>
                <span className="text-[9.5px] text-brand-gray">
                  Created by {f.by} <span className="text-[#C4BFB6]">·</span> Updated {f.date}
                </span>
              </span>
              <span
                className="flex-none rounded-full px-2 py-[3px] text-[8.5px] font-bold"
                style={{ background: "#EAF7F0", color: "#2BA463" }}
              >
                Published
              </span>
              <span className="flex flex-none items-center gap-1 whitespace-nowrap rounded-full bg-[#F1EEE9] px-2 py-[3px] text-[9px] text-brand-charcoal">
                {f.vis === "Department" ? <People className="h-2.5 w-2.5" /> : <Building className="h-2.5 w-2.5" />}
                {f.vis}
                {f.shared && <b className="font-semibold"> · Shared</b>}
              </span>
              <span className="flex w-[86px] flex-none items-center justify-end gap-1.5 text-[10px] text-brand-gray">
                <Chat className="h-[11px] w-[11px]" />
                <b className="font-bold text-brand-charcoal">{f.n}</b>
                {f.n === 1 ? "response" : "responses"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- the create modal
function NewFormModal({ scene }: { scene: Scene }) {
  const starts = [
    { key: "start-blank", label: "Start from blank", icon: DocGlyph, def: true },
    { key: "start-ai", label: "Generate with AI", icon: Spark, def: false },
    { key: "start-tpl", label: "Use a template", icon: Grid, def: false },
  ];
  const vis = [
    { key: "vis-private", label: "Private", sub: "You can add people later", icon: Lock },
    { key: "vis-dept", label: "Department", sub: "", icon: People },
    { key: "vis-company", label: "Company", sub: "", icon: Building },
  ];
  const named = scene.typed.length > 0;

  return (
    <div className="absolute inset-0 z-[60] grid place-items-center bg-[rgba(24,19,12,0.42)] px-6">
      <div className="sop-view w-[520px] rounded-2xl bg-white p-5 shadow-[0_24px_60px_-18px_rgba(20,14,6,0.5)]">
        <h4 className="text-[16px] font-bold tracking-tight">Create a new form</h4>
        <p className="mt-1 text-[11.5px] leading-relaxed text-brand-charcoal">
          Name it, pick how to start, and choose who can see it. Everything can be changed later.
        </p>

        <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.12em] text-brand-gray">Form name</p>
        <div
          data-t="name-field"
          className={`mt-1.5 rounded-lg border bg-white px-3 py-2.5 text-[12.5px] transition-all duration-200 ${
            scene.caret ? "border-brand-orange/60 shadow-[0_0_0_3px_rgba(234,123,27,0.16)]" : "border-[#E6E2DB]"
          }`}
        >
          {named ? (
            <span className="font-medium text-brand-ink">
              {scene.typed}
              {scene.caret && <TypeCaret />}
            </span>
          ) : (
            <span className="text-brand-gray">{scene.caret ? <TypeCaret /> : "e.g. Client intake"}</span>
          )}
        </div>

        <p className="mt-3.5 text-[9px] font-bold uppercase tracking-[0.12em] text-brand-gray">
          How do you want to start?
        </p>
        <div className="mt-1.5 grid grid-cols-3 gap-2">
          {starts.map((o) => {
            const Ico = o.icon;
            return (
              <div
                key={o.key}
                data-t={o.key}
                className={`grid place-items-center gap-1.5 rounded-xl border px-2 py-2.5 text-center ${
                  o.def ? "border-brand-ink/25 bg-[#F7F5F1]" : "border-[#E6E2DB] bg-white"
                }`}
              >
                <Ico className="h-4 w-4 text-brand-charcoal" />
                <b className="text-[11px] leading-tight">{o.label}</b>
              </div>
            );
          })}
        </div>

        <p className="mt-3.5 text-[9px] font-bold uppercase tracking-[0.12em] text-brand-gray">Who can see it</p>
        <div className="mt-1.5 grid grid-cols-3 gap-2">
          {vis.map((o) => {
            const Ico = o.icon;
            const on = o.key === "vis-company";
            const hot = scene.hot === o.key;
            return (
              <div
                key={o.key}
                data-t={o.key}
                className={`grid place-items-center gap-1 rounded-xl border px-2 py-2.5 text-center transition-all duration-200 ${
                  on ? "border-[#5B6CB8] bg-[#F7F5F1]" : "border-[#E6E2DB] bg-white"
                } ${hot ? "shadow-[0_0_0_3px_rgba(234,123,27,0.2)]" : ""}`}
              >
                <Ico className="h-4 w-4 text-brand-charcoal" />
                <b className="text-[11px] leading-tight">{o.label}</b>
                {o.sub && <span className="text-[8.5px] leading-tight text-brand-gray">{o.sub}</span>}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <span className="text-[10.5px] text-brand-gray">
            {named ? "Ready to create." : "Name your form to continue."}
          </span>
          <span className="ml-auto text-[11.5px] font-semibold text-brand-charcoal">Cancel</span>
          <span
            data-t="create"
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-[12px] font-semibold transition-all duration-200 ${
              named ? "bg-[#16233D] text-white" : "bg-[#E6E2DB] text-brand-gray"
            } ${scene.hot === "create" ? "shadow-[0_0_0_3px_rgba(234,123,27,0.35)]" : ""}`}
          >
            Create form
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- the builder chrome
function TopBar({ scene }: { scene: Scene }) {
  const live = scene.live;
  const btn = (key: string, label: string, Ico: (p: IconProps) => React.JSX.Element) => (
    <span
      key={key}
      data-t={key}
      className={`flex items-center gap-1.5 rounded-lg border border-[#E6E2DB] bg-white px-2.5 py-1.5 text-[10.5px] font-semibold text-brand-charcoal transition-shadow duration-200 ${
        scene.hot === key ? "shadow-[0_0_0_3px_rgba(234,123,27,0.3)]" : ""
      }`}
    >
      <Ico className="h-3 w-3" />
      {label}
    </span>
  );

  return (
    <div className="flex flex-none items-center gap-2 border-b border-[#EBE7E0] bg-white px-4 py-2.5">
      <ArrowLeft className="h-4 w-4 flex-none text-brand-charcoal" />
      <b className="flex-none text-[13px]">{NEW_NAME}</b>
      <span className="ml-auto flex flex-none items-center gap-1.5">
        <span className="flex items-center gap-1.5 rounded-lg border border-[#DDDCF2] bg-[#F4F4FD] px-2.5 py-1.5 text-[10.5px] font-semibold text-[#4B3CC4]">
          <Chat className="h-3 w-3" />
          Responses &amp; Reports
          <span className="rounded-full bg-[#E1E0F7] px-1.5 text-[9px] font-bold">0</span>
        </span>
        {btn("themes", "Themes", Palette)}
        {live ? (
          <>
            {btn("edit", "Edit", Pen)}
            {btn("view", "View", Eye)}
            {btn("copy", "Copy link", Copy)}
          </>
        ) : (
          btn("preview", "Preview", Eye)
        )}
        {btn("sharing", "Sharing", Share)}
        {live ? (
          <span className="flex items-center gap-1.5 rounded-lg bg-[#EAF7F0] px-3 py-1.5 text-[10.5px] font-bold text-[#2BA463]">
            <Check className="h-3 w-3" />
            Published
          </span>
        ) : (
          <span
            data-t="publish"
            className={`flex items-center gap-1.5 rounded-lg bg-[#16233D] px-3 py-1.5 text-[10.5px] font-semibold text-white transition-shadow duration-200 ${
              scene.hot === "publish" ? "shadow-[0_0_0_3px_rgba(234,123,27,0.4)]" : ""
            }`}
          >
            <Rocket className="h-3 w-3" />
            Publish
          </span>
        )}
      </span>
    </div>
  );
}

function StageRail() {
  return (
    <div className="w-[164px] flex-none border-r border-[#EBE7E0] bg-white p-2">
      {STAGES.map((s, i) => {
        const Ico = s.icon;
        const on = i === 0;
        return (
          <span
            key={s.key}
            className={`mb-1 flex items-center gap-2 rounded-lg px-2 py-[7px] ${
              on ? "bg-[#16233D] text-white" : "text-brand-charcoal"
            }`}
          >
            <Ico className={`h-3.5 w-3.5 flex-none ${on ? "text-white" : "text-brand-gray"}`} />
            <span className="min-w-0">
              <span className="block truncate text-[10.5px] font-semibold leading-tight">{s.label}</span>
              <span className={`block truncate text-[8.5px] ${on ? "text-white/65" : "text-brand-gray"}`}>
                {s.sub}
              </span>
            </span>
          </span>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------- view: builder
function BuilderView({ scene }: { scene: Scene }) {
  const shown = FIELDS.slice(0, scene.fields);
  const panel = scene.selected >= 0 && scene.selected < scene.fields;

  return (
    <div className="sop-view flex h-full flex-col">
      <TopBar scene={scene} />
      <div className="flex min-h-0 flex-1">
        <StageRail />

        {/* the palette */}
        <div className="w-[196px] flex-none overflow-hidden border-r border-[#EBE7E0] px-2.5 py-2">
          <p className="mb-1.5 flex items-center gap-1 text-[8.5px] font-bold uppercase tracking-[0.1em] text-brand-orange-dark">
            <Plus className="h-2.5 w-2.5" />
            Drag or click to add
          </p>
          {PALETTE.map((g) => (
            <div key={g.group} className="mb-1.5">
              <p className="mb-1 text-[7.5px] font-bold uppercase tracking-[0.12em] text-brand-gray">
                {g.group}
              </p>
              <div className="grid grid-cols-2 gap-1">
                {g.items.map((it) => {
                  const Ico = it.icon;
                  const hot = scene.hot === `fld-${it.label}`;
                  return (
                    <span
                      key={it.label}
                      data-t={`fld-${it.label}`}
                      className={`flex items-center gap-1 overflow-hidden rounded-md border bg-white px-1.5 py-[5px] text-[8.5px] font-medium transition-all duration-200 ${
                        hot
                          ? "border-brand-orange/60 bg-[#FFF6EC] shadow-[0_0_0_2px_rgba(234,123,27,0.2)]"
                          : "border-[#EBE7E0]"
                      }`}
                    >
                      <Ico className="h-2.5 w-2.5 flex-none text-brand-charcoal" />
                      <span className="truncate">{it.label}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* the canvas */}
        <div className="min-w-0 flex-1 overflow-hidden px-4 py-3">
          <div className="grid place-items-center rounded-lg border border-dashed border-[#DED9D0] py-2 text-[10px] text-brand-gray">
            <span className="flex items-center gap-1.5">
              <Plus className="h-2.5 w-2.5" />
              Add logo above form
            </span>
          </div>

          <div className="mt-2 rounded-lg border border-dashed border-[#D8D2C8] bg-[#F4F1EC] px-3 py-2 text-center">
            <b className="block text-[11.5px]">{NEW_NAME}</b>
            <span className="text-[8.5px] text-brand-gray">
              Form header. Edit the text here, drag to reposition, or delete to remove it.
            </span>
          </div>

          <div className="mt-2 space-y-1.5">
            {shown.map((f, i) => (
              <div
                key={f.label}
                data-t={`canvas-${i}`}
                className={`sop-pop flex items-center gap-2 rounded-lg border bg-white px-2.5 py-2 transition-all duration-200 ${
                  scene.selected === i
                    ? "border-brand-ink/40 shadow-[0_0_0_2px_rgba(22,35,61,0.12)]"
                    : hotRing(scene.hot === `canvas-${i}`)
                }`}
              >
                <span className="grid h-[22px] w-[22px] flex-none place-items-center rounded-md bg-[#16233D] text-white">
                  {f.kind === "name" ? <People className="h-3 w-3" /> : f.kind === "choice" ? <Radio className="h-3 w-3" /> : <Caret className="h-3 w-3" />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[11px] font-semibold leading-tight">{f.label}</span>
                  <span className="text-[8.5px] text-brand-gray">
                    {f.kind === "name" ? "Full name" : f.kind === "choice" ? "Single choice" : "Dropdown"}
                  </span>
                </span>
              </div>
            ))}
          </div>

          {shown.length < FIELDS.length && (
            <div className="mt-2 grid place-items-center rounded-lg border border-dashed border-[#DED9D0] py-2.5 text-[9.5px] text-brand-gray">
              Drop here to add at the end
            </div>
          )}
        </div>

        {/* the field settings panel */}
        {panel && <FieldPanel />}
      </div>
    </div>
  );
}

// The panel for the dropdown, which is the field the tour selects: it is the one
// that carries options and conditional logic, and those are the interesting bits.
function FieldPanel() {
  return (
    <div className="sop-view w-[188px] flex-none overflow-hidden border-l border-[#EBE7E0] bg-white px-3 py-2.5">
      <p className="mb-2 flex items-center gap-1.5 text-[10.5px] font-bold">
        <Caret className="h-3 w-3 text-brand-charcoal" />
        Dropdown settings
      </p>

      <p className="text-[8.5px] font-semibold text-brand-charcoal">Question / label</p>
      <div className="mt-1 truncate rounded-md border border-[#E6E2DB] px-2 py-1 text-[9.5px]">
        How did you hear about us?
      </div>

      <label className="mt-2 flex items-center gap-1.5 text-[9.5px] text-brand-charcoal">
        <span className="h-2.5 w-2.5 flex-none rounded-[3px] border-[1.5px] border-[#D5D0C7]" />
        Required
      </label>

      <p className="mt-2 text-[8.5px] font-semibold text-brand-charcoal">Options</p>
      <div className="mt-1 space-y-1">
        {DROPS.map((d) => (
          <div
            key={d}
            className="flex items-center gap-1 rounded-md border border-[#E6E2DB] px-2 py-1 text-[9.5px]"
          >
            <span className="min-w-0 flex-1 truncate">{d}</span>
            <span className="flex-none text-brand-gray">&times;</span>
          </div>
        ))}
      </div>
      <p className="mt-1.5 flex items-center gap-1 text-[9px] font-semibold text-brand-charcoal">
        <Plus className="h-2.5 w-2.5" />
        Add option
      </p>

      <div className="my-2 h-px bg-[#EBE7E0]" />
      <p className="text-[8.5px] font-semibold text-brand-charcoal">Conditional logic</p>
      <p className="mt-1 flex items-center gap-1 text-[9px] font-semibold text-brand-orange-dark">
        <Plus className="h-2.5 w-2.5" />
        Add a rule
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- view: preview
// The form as somebody filling it in sees it, on the customer's own subdomain.
function PreviewView({ scene }: { scene: Scene }) {
  return (
    <div className="sop-view flex h-full flex-col bg-[#F1F0EE]">
      {/* browser chrome, because this is what a respondent sees */}
      <div className="flex flex-none items-center gap-2 bg-[#E6E3DE] px-4 py-2">
        <span className="flex gap-1">
          <span className="h-[7px] w-[7px] rounded-full bg-[#CFC9C0]" />
          <span className="h-[7px] w-[7px] rounded-full bg-[#CFC9C0]" />
          <span className="h-[7px] w-[7px] rounded-full bg-[#CFC9C0]" />
        </span>
        <span className="ml-2 flex-1 truncate rounded-md bg-white px-2.5 py-1 text-[10px] text-brand-charcoal">
          {PUBLIC_URL}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-6 py-5">
        <div className="mx-auto w-[440px] rounded-xl border border-[#E3E0DA] bg-white px-7 py-5 shadow-[0_12px_28px_-18px_rgba(40,30,15,0.35)]">
          <p className="text-center text-[17px] font-extrabold tracking-tight">{NEW_NAME}</p>
          <div className="my-3 h-px bg-[#EDE9E2]" />

          <p className="text-[10.5px] font-semibold">Full name</p>
          <div className="mt-1 h-[26px] rounded-md border border-[#E6E2DB] bg-[#FBFAF8]" />

          <p className="mt-3 text-[10.5px] font-semibold">What do you need help with?</p>
          <div className="mt-1 space-y-1">
            {CHOICES.map((c) => (
              <span key={c} className="flex items-center gap-2 text-[10.5px] text-brand-charcoal">
                <span className="h-2.5 w-2.5 flex-none rounded-full border-[1.5px] border-[#C9C2B6]" />
                {c}
              </span>
            ))}
          </div>

          <p className="mt-3 text-[10.5px] font-semibold">How did you hear about us?</p>
          <div className="mt-1 flex h-[26px] items-center justify-between rounded-md border border-[#E6E2DB] bg-[#FBFAF8] px-2.5 text-[10px] text-brand-gray">
            Select...
            <Caret className="h-2.5 w-2.5" />
          </div>

          <div className="mt-4 grid place-items-center rounded-md bg-[#4F46E5] py-2 text-[11.5px] font-semibold text-white">
            Submit
          </div>
          <p className="mt-2.5 text-center text-[8.5px] text-brand-gray">
            Powered by Multiply OS Forms
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- view: published
function PublishedView({ scene }: { scene: Scene }) {
  return (
    <div className="sop-view flex h-full flex-col">
      <TopBar scene={scene} />
      <div className="relative flex min-h-0 flex-1">
        <StageRail />
        <div className="min-w-0 flex-1 overflow-hidden bg-[#F1F0EE] px-6 py-5">
          <div className="mx-auto w-[400px] rounded-xl border border-[#E3E0DA] bg-white px-6 py-4 shadow-[0_12px_28px_-18px_rgba(40,30,15,0.35)]">
            <p className="text-center text-[15px] font-extrabold tracking-tight">{NEW_NAME}</p>
            <div className="my-2.5 h-px bg-[#EDE9E2]" />
            <p className="text-[10px] font-semibold">Full name</p>
            <div className="mt-1 h-[22px] rounded-md border border-[#E6E2DB] bg-[#FBFAF8]" />
            <p className="mt-2.5 text-[10px] font-semibold">What do you need help with?</p>
            <div className="mt-1 space-y-1">
              {CHOICES.map((c) => (
                <span key={c} className="flex items-center gap-2 text-[10px] text-brand-charcoal">
                  <span className="h-2.5 w-2.5 flex-none rounded-full border-[1.5px] border-[#C9C2B6]" />
                  {c}
                </span>
              ))}
            </div>
            <div className="mt-3 grid place-items-center rounded-md bg-[#4F46E5] py-1.5 text-[11px] font-semibold text-white">
              Submit
            </div>
          </div>
        </div>

        {scene.share && <SharePopover scene={scene} />}
      </div>
    </div>
  );
}

// The Sharing popover: the public link on the customer's own subdomain, the QR
// code, and the embed script. The domain is the detail worth noticing.
function SharePopover({ scene }: { scene: Scene }) {
  return (
    <div className="sop-view absolute right-5 top-2 z-[40] w-[268px] rounded-xl border border-[#E6E2DB] bg-white p-3 shadow-[0_20px_44px_-18px_rgba(40,30,15,0.45)]">
      <p className="text-[8.5px] font-bold uppercase tracking-[0.12em] text-brand-gray">Public link</p>
      <div className="mt-1.5 flex items-center gap-1.5">
        <span className="min-w-0 flex-1 truncate rounded-md border border-[#E6E2DB] bg-[#FBFAF8] px-2 py-1.5 text-[9.5px] text-brand-charcoal">
          {PUBLIC_URL}
        </span>
        <span className="flex flex-none items-center gap-1 rounded-md border border-[#E6E2DB] px-2 py-1.5 text-[9.5px] font-semibold text-brand-charcoal">
          <Copy className="h-2.5 w-2.5" />
          Copy
        </span>
      </div>

      <span
        data-t="qr"
        className={`mt-1.5 flex items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-[10px] font-semibold text-brand-charcoal transition-all duration-200 ${
          scene.hot === "qr"
            ? "border-brand-orange/60 bg-[#FFF6EC] shadow-[0_0_0_3px_rgba(234,123,27,0.2)]"
            : "border-[#E6E2DB]"
        }`}
      >
        <QrGlyph className="h-3 w-3" />
        View QR Code
      </span>

      <div className="my-2.5 h-px bg-[#EBE7E0]" />
      <p className="text-[8.5px] font-bold uppercase tracking-[0.12em] text-brand-gray">
        Embed on your website
      </p>
      <p className="mt-1 text-[9px] leading-snug text-brand-gray">
        It renders right in the page, no iframe box, and submissions land here like any other
        response.
      </p>
      <div className="mt-1.5 overflow-hidden rounded-md border border-[#E6E2DB] bg-[#F7F5F1] px-2 py-1.5 font-mono text-[8px] leading-snug text-brand-charcoal">
        &lt;script src=&quot;app.multiplyos.com/embed/forms.js&quot; data-form=&quot;...&quot;&gt;
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- the QR modal
function QrModal() {
  return (
    <div className="absolute inset-0 z-[62] grid place-items-center bg-[rgba(24,19,12,0.42)] px-6">
      <div className="sop-view w-[300px] rounded-2xl bg-white p-5 text-center shadow-[0_24px_60px_-18px_rgba(20,14,6,0.5)]">
        <h4 className="text-[14.5px] font-bold tracking-tight">Scan to open this form</h4>
        <p className="mt-1 text-[10px] text-brand-gray">{PUBLIC_URL}</p>
        <div className="mx-auto mt-3 w-[150px] rounded-lg border border-[#EBE7E0] bg-white p-2.5">
          <QrArt />
        </div>
        <div className="mt-3 flex gap-2">
          {["Download PNG", "Download SVG"].map((l) => (
            <span
              key={l}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#E6E2DB] py-1.5 text-[10px] font-semibold text-brand-charcoal"
            >
              <Download className="h-2.5 w-2.5" />
              {l}
            </span>
          ))}
        </div>
        <p className="mt-2 text-[9px] leading-snug text-brand-gray">
          PNG suits slides and flyers. SVG scales to any size for print.
        </p>
      </div>
    </div>
  );
}

// A decorative QR-looking block. Deliberately not a real scannable code: it
// encodes nothing, so nobody can point a phone at the marketing site and land
// somewhere unintended. The three finder squares are what make it read as a QR.
function QrArt() {
  // A fixed pseudo-random fill, so it renders identically every time.
  const cells: boolean[] = [];
  let seed = 7;
  for (let i = 0; i < 441; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    cells.push(((seed >> 16) & 1) === 1);
  }
  const finder = (r: number, c: number) =>
    (r < 7 && c < 7) || (r < 7 && c > 13) || (r > 13 && c < 7);

  return (
    <svg viewBox="0 0 21 21" className="block h-full w-full" shapeRendering="crispEdges">
      <rect width="21" height="21" fill="#fff" />
      {cells.map((on, i) => {
        const r = Math.floor(i / 21);
        const c = i % 21;
        if (finder(r, c) || !on) return null;
        return <rect key={i} x={c} y={r} width="1" height="1" fill="#15120E" />;
      })}
      {[
        [0, 0],
        [0, 14],
        [14, 0],
      ].map(([r, c]) => (
        <g key={`${r}-${c}`} fill="none" stroke="#15120E">
          <rect x={c + 0.5} y={r + 0.5} width="6" height="6" strokeWidth="1" />
          <rect x={c + 2} y={r + 2} width="3" height="3" fill="#15120E" stroke="none" />
        </g>
      ))}
    </svg>
  );
}
