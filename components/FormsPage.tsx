"use client";

// Feature page: Forms.
//
// Follows the client's brief. Six asks, in their order:
//   1. the form list              hero tour, opening beat
//   2. creating a form            hero tour, the Create modal
//   3. a form that exists         hero tour, Preview then the published form
//   4. a QR code                  hero tour close, and section 3
//   5. a form adding a task       section 4, Integrations
//   6. a response to Sheets       section 4, Integrations
//
// Sections 5 and 6 are the argument of the whole page, so they share one section
// and it is the one with the most room. A standalone form tool cannot open a task
// on your board or push a number onto your scoreboard, because it owns neither.
//
// Mockups are hand-built in markup rather than screenshots so they stay crisp and
// themeable. Field names, form titles, and counts mirror the live library, with
// the generalising pass from docs/forms-feature-notes.md applied.
import { motion } from "framer-motion";
import { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CTA from "./CTA";
import Reveal from "./Reveal";
import FormsHeroTour from "./FormsHeroTour";
import MultiAiWired from "./MultiAiWired";
import type { Row, Insight } from "./MultiAiWired";
import { useDemo } from "./DemoModal";

// ---------------------------------------------------------------- tokens
const GREEN = "#2BA463";
const AMBER = "#C9832B";
const AI = "#4B3CC4";
const SHEETS = "#188038";
const colTransition = { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const };

// Shared card height, so the four mockups do not run ragged against each other.
// Written out in full because Tailwind scans source for literal class names.
const CARD_CLS = "h-[380px] sm:h-[430px]";

// ---------------------------------------------------------------- icons
const ico = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
type IconProps = { className?: string; style?: React.CSSProperties };

const FormIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.7}>
    <rect x="4.6" y="3.3" width="14.8" height="17.4" rx="2.3" />
    <path d="M8.4 8.4h7.2M8.4 12.4h7.2M8.4 16.4h4.4" />
  </svg>
);
const Check = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2.4}>
    <path d="M5 12l5 5L20 7" />
  </svg>
);
const Arrow = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2.4}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
const Plus = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2.4}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const RowsIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.2" />
    <path d="M3.5 9.5h17M3.5 14.5h17" />
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
const LinkIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.9}>
    <path d="M10.2 13.8a3.6 3.6 0 0 0 5.4.4l2.6-2.6a3.6 3.6 0 0 0-5.1-5.1l-1.5 1.5" />
    <path d="M13.8 10.2a3.6 3.6 0 0 0-5.4-.4l-2.6 2.6a3.6 3.6 0 0 0 5.1 5.1l1.5-1.5" />
  </svg>
);
const CodeIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.9}>
    <path d="M8.6 8.4L4.4 12l4.2 3.6M15.4 8.4L19.6 12l-4.2 3.6M13.4 5.4l-2.8 13.2" />
  </svg>
);
const BoardIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.9}>
    <rect x="3.4" y="4.4" width="17.2" height="15.2" rx="2.2" />
    <path d="M9.2 4.4v15.2M15 4.4v15.2" />
  </svg>
);
const SheetIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.9}>
    <rect x="4.4" y="3.4" width="15.2" height="17.2" rx="2" />
    <path d="M4.4 9h15.2M4.4 14.6h15.2M10.2 3.4v17.2" />
  </svg>
);
const TrendIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.9}>
    <path d="M3.6 16.6l5-5.2 3.2 3.2 6-6.4" />
    <path d="M13.6 8.2h4.2v4.2" />
  </svg>
);
const People = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.9}>
    <circle cx="9.2" cy="8.4" r="3" />
    <path d="M3.6 18.6c0-2.8 2.5-4.6 5.6-4.6s5.6 1.8 5.6 4.6" />
    <path d="M16.2 6.2a3 3 0 0 1 0 5.6M17.4 14.6c1.9.6 3.2 1.9 3.2 4" />
  </svg>
);
const MailIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.9}>
    <rect x="3.4" y="5.6" width="17.2" height="12.8" rx="2" />
    <path d="M3.8 7l8.2 5.6L20.2 7" />
  </svg>
);
const EyeIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.9}>
    <path d="M2.6 12S6 5.8 12 5.8 21.4 12 21.4 12 18 18.2 12 18.2 2.6 12 2.6 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const ClockIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.9}>
    <circle cx="12" cy="12" r="8.4" />
    <path d="M12 7.4V12l3 1.8" />
  </svg>
);
const DownloadIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.9}>
    <path d="M12 4.6v11M7.4 11l4.6 4.6L16.6 11M4.4 19.4h15.2" />
  </svg>
);
const BellIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.9}>
    <path d="M17.6 11.6a5.6 5.6 0 1 0-11.2 0c0 4.2-1.8 5.4-1.8 5.4h14.8s-1.8-1.2-1.8-5.4z" />
    <path d="M10.4 20a1.9 1.9 0 0 0 3.2 0" />
  </svg>
);
const PenIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.9}>
    <path d="M4 20.2l.6-4L16.2 4.6a2 2 0 0 1 2.8 0l.4.4a2 2 0 0 1 0 2.8L8 19.6z" />
  </svg>
);

// ---------------------------------------------------------------- 2. field types
// The palette, made playable: chips toggle a field in and out of the form, so the
// reader builds it rather than reading about it. Twenty-eight types is the claim,
// and a short list of eight would undersell it, so all seven groups are drawn.
type FieldKey =
  | "name" | "email" | "choice" | "dropdown" | "rating"
  | "signature" | "consent" | "upload" | "date" | "long";

const FIELD_DEFS: {
  key: FieldKey;
  label: string;
  group: string;
  icon: (p: IconProps) => React.JSX.Element;
}[] = [
  { key: "name", label: "Full name", group: "Contact", icon: People },
  { key: "email", label: "Email", group: "Text", icon: MailIcon },
  { key: "long", label: "Long text", group: "Text", icon: RowsIcon },
  { key: "choice", label: "Single choice", group: "Choice", icon: FormIcon },
  { key: "dropdown", label: "Dropdown", group: "Choice", icon: FormIcon },
  { key: "consent", label: "Consent", group: "Choice", icon: Check },
  { key: "date", label: "Date", group: "Date", icon: ClockIcon },
  { key: "rating", label: "Star rating", group: "Survey", icon: TrendIcon },
  { key: "upload", label: "File upload", group: "Media", icon: LinkIcon },
  { key: "signature", label: "Signature", group: "Media", icon: PenIcon },
];

// Opens on the four that make the range obvious: a person, a choice, a rating,
// and a signature. The last one is the argument that this covers waivers too.
const FIELDS_OPEN: FieldKey[] = ["name", "choice", "rating", "signature"];

function FieldBody({ k }: { k: FieldKey }) {
  const shell = (label: string, children: React.ReactNode, hint?: string) => (
    <div className="rounded-lg border border-[#EBE7E0] bg-white p-2.5">
      <p className="text-[10.5px] font-semibold text-brand-ink">{label}</p>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1.5 text-[9px] leading-snug text-brand-gray">{hint}</p>}
    </div>
  );
  const input = <div className="h-[24px] rounded-md border border-[#E6E2DB] bg-[#FBFAF8]" />;

  switch (k) {
    case "name":
      return shell("Full name", <div className="grid grid-cols-2 gap-1.5">{input}{input}</div>);
    case "email":
      return shell("Email", input, "Validated on the way in, so you do not chase typos.");
    case "long":
      return shell("Tell us more", <div className="h-[42px] rounded-md border border-[#E6E2DB] bg-[#FBFAF8]" />);
    case "choice":
      return shell(
        "What do you need help with?",
        <div className="space-y-1">
          {["Onboarding", "Billing", "Something else"].map((c, i) => (
            <span key={c} className="flex items-center gap-2 text-[10px] text-brand-charcoal">
              <span
                className={`h-2.5 w-2.5 flex-none rounded-full border-[1.5px] ${
                  i === 0 ? "border-transparent" : "border-[#D5D0C7]"
                }`}
                style={i === 0 ? { background: AI } : undefined}
              />
              {c}
            </span>
          ))}
        </div>,
      );
    case "dropdown":
      return shell(
        "How did you hear about us?",
        <div className="flex h-[24px] items-center justify-between rounded-md border border-[#E6E2DB] bg-[#FBFAF8] px-2 text-[9.5px] text-brand-gray">
          A referral
          <span>&#9662;</span>
        </div>,
        "Conditional logic can hide the next question based on this answer.",
      );
    case "consent":
      return shell(
        "Agreement",
        <span className="flex items-start gap-2 text-[9.5px] leading-snug text-brand-charcoal">
          <span className="mt-px grid h-3 w-3 flex-none place-items-center rounded-[3px] text-white" style={{ background: AI }}>
            <Check className="h-2 w-2" />
          </span>
          I have read and agree to the terms.
        </span>,
      );
    case "date":
      return shell(
        "Preferred start date",
        <div className="flex h-[24px] items-center gap-2 rounded-md border border-[#E6E2DB] bg-[#FBFAF8] px-2 text-[9.5px] text-brand-charcoal">
          <ClockIcon className="h-3 w-3 text-brand-gray" />
          Mon 14 Sep 2026
        </div>,
      );
    case "rating":
      return shell(
        "How did we do?",
        <span className="flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <TrendIcon
              key={i}
              className="h-4 w-4"
              style={{ color: i < 4 ? "#F0A31E" : "#DED9D0" }}
            />
          ))}
        </span>,
        "Star ratings and NPS can push straight onto a scoreboard.",
      );
    case "upload":
      return shell(
        "Attach anything relevant",
        <div className="grid place-items-center rounded-md border border-dashed border-[#DED9D0] bg-[#FBFAF8] py-2 text-[9.5px] text-brand-gray">
          Drop a file, or click to upload
        </div>,
      );
    case "signature":
      return shell(
        "Signature",
        <div className="relative h-[34px] overflow-hidden rounded-md border border-[#E6E2DB] bg-[#FBFAF8]">
          <svg viewBox="0 0 200 34" className="absolute inset-0 h-full w-full" fill="none"
            stroke="#2B2926" strokeWidth={1.6} strokeLinecap="round">
            <path d="M14 24c8-12 14-14 17-8s-2 14 3 14 9-16 15-16 4 10 10 10 10-12 16-12 6 8 12 8 10-6 16-8" />
          </svg>
        </div>,
        "Which is why a waiver is a form here, not a PDF somebody has to print.",
      );
  }
}

function FieldsDemo() {
  const [on, setOn] = useState<FieldKey[]>(FIELDS_OPEN);
  const toggle = (k: FieldKey) =>
    setOn((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));
  const shown = FIELD_DEFS.filter((f) => on.includes(f.key));

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${CARD_CLS}`}>
      <div className="flex flex-none items-center gap-2.5 border-b border-[#F1EEE9] px-3.5 py-2.5">
        <span className="min-w-0 flex-1">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-brand-gray">Form</p>
          <h4 className="truncate text-[13.5px] font-extrabold tracking-tight">Client Intake</h4>
        </span>
        <span className="flex-none whitespace-nowrap rounded-full bg-[#F1EEE9] px-2 py-[3px] text-[9px] font-semibold text-brand-charcoal">
          Company
        </span>
      </div>

      <div className="flex-none border-b border-[#F1EEE9] px-3.5 py-2.5">
        <p className="mb-1.5 text-[9.5px] text-brand-gray">
          Add a field <span className="text-[#C4BFB6]">·</span> {on.length} of 28 types in use
        </p>
        {/* One scrolling row below sm, wrapping from sm up: ten chips with long
            labels wrap onto four rows on a phone and the palette ends up taller
            than the form it edits. */}
        <div className="scrollbar-none flex flex-nowrap gap-1 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-x-visible sm:pb-0">
          {FIELD_DEFS.map((f) => {
            const Icon = f.icon;
            const active = on.includes(f.key);
            return (
              <button
                key={f.key}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(f.key)}
                className={`flex flex-none items-center gap-1 whitespace-nowrap rounded-full border px-2 py-1 text-[9.5px] transition-colors ${
                  active
                    ? "border-brand-orange/55 bg-[#FFF6EC] font-semibold text-brand-orange-dark"
                    : "border-[#E6E2DB] font-medium text-brand-charcoal hover:bg-[#FAF9F7]"
                }`}
              >
                <Icon className="h-2.5 w-2.5" />
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative min-h-0 flex-1 bg-[#FAF9F7]">
        <div className="h-full space-y-2 overflow-y-auto px-3.5 py-3">
          {shown.length === 0 ? (
            <p className="pt-16 text-center text-[11px] text-brand-gray">
              An empty form. Add a field to start.
            </p>
          ) : (
            shown.map((f) => <FieldBody key={f.key} k={f.key} />)
          )}
        </div>
        {shown.length > 3 && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-7 bg-gradient-to-t from-[#FAF9F7] to-transparent"
          />
        )}
      </div>

      <div className="flex flex-none items-center gap-2 border-t border-[#F1EEE9] px-3.5 py-2">
        <span className="flex flex-none items-center gap-1.5 rounded-lg border border-[#E3E0DA] px-2 py-1.5 text-[9.5px] font-semibold text-brand-charcoal">
          <EyeIcon className="h-2.5 w-2.5" />
          One question per page
        </span>
        <span className="text-[9.5px] text-brand-gray">When a long form needs to feel short.</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 3. share it
type ShareTab = "link" | "qr" | "embed";

function ShareDemo() {
  const [tab, setTab] = useState<ShareTab>("qr");

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${CARD_CLS}`}>
      <div className="flex flex-none items-center gap-2 border-b border-[#F1EEE9] px-3.5 py-2.5">
        <b className="flex-none text-[12.5px]">Share Client Intake</b>
        <span
          className="ml-auto flex-none rounded-full px-2 py-[3px] text-[9px] font-bold"
          style={{ background: "#EAF7F0", color: GREEN }}
        >
          PUBLISHED
        </span>
      </div>

      <div className="flex flex-none gap-0.5 border-b border-[#F1EEE9] px-3.5 py-2">
        {([
          { k: "link", l: "Public link", i: LinkIcon },
          { k: "qr", l: "QR code", i: QrGlyph },
          { k: "embed", l: "Embed", i: CodeIcon },
        ] as const).map(({ k, l, i: Ico }) => (
          <button
            key={k}
            type="button"
            aria-pressed={tab === k}
            onClick={() => setTab(k)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10.5px] transition-colors ${
              tab === k
                ? "bg-brand-ink font-semibold text-white"
                : "font-medium text-brand-charcoal hover:bg-[#FAF9F7]"
            }`}
          >
            <Ico className="h-3 w-3" />
            {l}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden bg-[#FAF9F7] px-3.5 py-3">
        {tab === "link" && (
          <div className="sop-view">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-brand-gray">
              Your own subdomain
            </p>
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="min-w-0 flex-1 truncate rounded-lg border border-[#E6E2DB] bg-white px-2.5 py-2 text-[11px] text-brand-charcoal">
                forms.yourcompany.com/client-intake
              </span>
              <span className="flex-none rounded-lg bg-[#16233D] px-2.5 py-2 text-[10px] font-semibold text-white">
                Copy
              </span>
            </div>
            <p className="mt-2 text-[10.5px] leading-relaxed text-brand-charcoal">
              Not a link on somebody else&rsquo;s domain with their logo on the bottom. Your
              subdomain, your accent colour, your logo above the first question.
            </p>
            <div className="mt-3 space-y-1.5">
              {[
                "A short code as well as the full link",
                "A thank-you message, or a redirect to any URL",
                "Accent, page and card colours, all yours",
              ].map((t) => (
                <p key={t} className="flex items-start gap-2 text-[10px] leading-snug text-brand-charcoal">
                  <Check className="mt-px h-3 w-3 flex-none" style={{ color: GREEN }} />
                  {t}
                </p>
              ))}
            </div>
          </div>
        )}

        {tab === "qr" && (
          <div className="sop-view flex h-full items-center gap-4">
            <div className="flex-none rounded-xl border border-[#EBE7E0] bg-white p-2.5">
              <div className="h-[104px] w-[104px]">
                <QrArt />
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-bold leading-tight">Scan to open this form</p>
              <p className="mt-0.5 truncate text-[9.5px] text-brand-gray">
                forms.yourcompany.com/client-intake
              </p>
              <div className="mt-2.5 flex gap-1.5">
                {["PNG", "SVG"].map((l) => (
                  <span
                    key={l}
                    className="flex items-center gap-1.5 rounded-lg border border-[#E6E2DB] bg-white px-2 py-1.5 text-[9.5px] font-semibold text-brand-charcoal"
                  >
                    <DownloadIcon className="h-2.5 w-2.5" />
                    {l}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-[10px] leading-relaxed text-brand-charcoal">
                PNG for slides and flyers. SVG scales to any size, so the same code works on a
                business card and on a pull-up banner.
              </p>
            </div>
          </div>
        )}

        {tab === "embed" && (
          <div className="sop-view">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-brand-gray">
              One script tag
            </p>
            <div className="mt-1.5 overflow-hidden rounded-lg border border-[#E6E2DB] bg-white px-2.5 py-2 font-mono text-[9px] leading-relaxed text-brand-charcoal">
              &lt;script src=&quot;app.multiplyos.com/embed/forms.js&quot;
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;data-form=&quot;client-intake&quot;&gt;&lt;/script&gt;
            </div>
            <p className="mt-2 text-[10.5px] leading-relaxed text-brand-charcoal">
              It renders in the page, not in an iframe box, so it inherits your site&rsquo;s width
              and never shows a scrollbar inside a scrollbar.
            </p>
            <div className="mt-3 rounded-lg border border-[#EBE7E0] bg-white p-2.5">
              <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-brand-gray">
                Your marketing site
              </p>
              <div className="mt-1.5 space-y-1">
                <span className="block h-1.5 w-2/3 rounded bg-[#E9E4DC]" />
                <span className="block h-1.5 w-1/2 rounded bg-[#EFEBE4]" />
              </div>
              <div className="mt-2 rounded-md border border-dashed px-2 py-2" style={{ borderColor: AI }}>
                <p className="text-[9.5px] font-semibold" style={{ color: AI }}>
                  Client Intake, rendered inline
                </p>
                <div className="mt-1 h-[16px] rounded bg-[#F4F1EC]" />
                <div className="mt-1 h-[16px] w-2/3 rounded bg-[#F4F1EC]" />
              </div>
              <p className="mt-1.5 text-[9px] text-brand-gray">
                Submissions land in Forms like any other response.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// The same decorative QR art the hero tour uses. Deliberately not a scannable
// code: it encodes nothing, so nobody can point a phone at the marketing site
// and land somewhere unintended. The finder squares are what make it read as a QR.
function QrArt() {
  const cells: boolean[] = [];
  let seed = 7;
  for (let i = 0; i < 441; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    cells.push(((seed >> 16) & 1) === 1);
  }
  const finder = (r: number, c: number) =>
    (r < 7 && c < 7) || (r < 7 && c > 13) || (r > 13 && c < 7);

  return (
    <svg viewBox="0 0 21 21" className="block h-full w-full" shapeRendering="crispEdges" aria-hidden="true">
      <rect width="21" height="21" fill="#fff" />
      {cells.map((on, i) => {
        const r = Math.floor(i / 21);
        const c = i % 21;
        if (finder(r, c) || !on) return null;
        return <rect key={i} x={c} y={r} width="1" height="1" fill="#15120E" />;
      })}
      {[[0, 0], [0, 14], [14, 0]].map(([r, c]) => (
        <g key={`${r}-${c}`} fill="none" stroke="#15120E">
          <rect x={c + 0.5} y={r + 0.5} width="6" height="6" strokeWidth="1" />
          <rect x={c + 2} y={r + 2} width="3" height="3" fill="#15120E" stroke="none" />
        </g>
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------- 4. integrations
// The client's asks 5 and 6, and the argument of the page. Toggling a destination
// shows what the submission turns into on the other side.
type Dest = "task" | "sheet" | "score" | "crm";

const DESTS: {
  key: Dest;
  label: string;
  sub: string;
  color: string;
  icon: (p: IconProps) => React.JSX.Element;
}[] = [
  { key: "task", label: "Create a task", sub: "Assigned to a teammate", color: "#5B47A8", icon: BoardIcon },
  { key: "sheet", label: "Google Sheets", sub: "A row per response", color: SHEETS, icon: SheetIcon },
  { key: "score", label: "Scoreboard", sub: "NPS, rating, or a count", color: "#EA7B1B", icon: TrendIcon },
  { key: "crm", label: "CRM record", sub: "Mapped to an object", color: "#2C6BA6", icon: People },
];

function IntegrationsDemo() {
  const [on, setOn] = useState<Dest[]>(["task", "sheet"]);
  const toggle = (k: Dest) =>
    setOn((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${CARD_CLS}`}>
      {/* the submission that arrived */}
      <div className="flex flex-none items-center gap-2.5 border-b border-[#F1EEE9] bg-[#FAF9F7] px-3.5 py-2.5">
        <span className="grid h-[26px] w-[26px] flex-none place-items-center rounded-lg text-white" style={{ background: GREEN }}>
          <Check className="h-3.5 w-3.5" />
        </span>
        <span className="min-w-0 flex-1">
          <p className="truncate text-[11.5px] font-bold leading-tight">
            Priya Nair submitted Client Intake
          </p>
          <p className="text-[9.5px] text-brand-gray">Just now &middot; Billing &middot; rated 4 of 5</p>
        </span>
      </div>

      {/* the destinations */}
      <div className="flex-none border-b border-[#F1EEE9] px-3.5 py-2.5">
        <p className="mb-1.5 text-[9.5px] text-brand-gray">Send it where the work happens</p>
        <div className="grid grid-cols-2 gap-1.5">
          {DESTS.map((d) => {
            const Icon = d.icon;
            const active = on.includes(d.key);
            return (
              <button
                key={d.key}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(d.key)}
                className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 text-left transition-colors ${
                  active ? "border-transparent bg-[#F7F5F1]" : "border-[#E6E2DB] hover:bg-[#FAF9F7]"
                }`}
                style={active ? { boxShadow: `inset 0 0 0 1.5px ${d.color}44` } : undefined}
              >
                <span
                  className="grid h-[22px] w-[22px] flex-none place-items-center rounded-md"
                  style={
                    active
                      ? { background: d.color, color: "#fff" }
                      : { background: "#F1EEE9", color: "#8A857D" }
                  }
                >
                  <Icon className="h-3 w-3" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[10px] font-semibold leading-tight">{d.label}</span>
                  <span className="block truncate text-[8.5px] text-brand-gray">{d.sub}</span>
                </span>
                <span
                  className="h-[14px] w-[24px] flex-none rounded-full transition-colors"
                  style={{ background: active ? d.color : "#E3E0DA" }}
                >
                  <span
                    className="mt-[2px] block h-[10px] w-[10px] rounded-full bg-white transition-transform"
                    style={{ transform: active ? "translateX(12px)" : "translateX(2px)" }}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* what it became */}
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto bg-[#FAF9F7] px-3.5 py-3">
        {on.length === 0 && (
          <p className="pt-12 text-center text-[11px] leading-relaxed text-brand-gray">
            Nothing switched on, so the response just sits in Forms.
            <br />
            Which is all a standalone form tool can do.
          </p>
        )}

        {on.includes("task") && (
          <div className="sop-view rounded-lg border border-[#EBE7E0] bg-white p-2.5">
            <p className="mb-1.5 flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.12em]" style={{ color: "#5B47A8" }}>
              <BoardIcon className="h-2.5 w-2.5" />
              Projects
            </p>

            {/* the title template, and what it resolved to */}
            <p className="font-mono text-[9px] leading-snug text-brand-gray">
              New <span className="rounded bg-[#EDEAF7] px-1 font-semibold" style={{ color: "#5B47A8" }}>&#123;topic&#125;</span>{" "}
              request from <span className="rounded bg-[#EDEAF7] px-1 font-semibold" style={{ color: "#5B47A8" }}>&#123;name&#125;</span>
            </p>

            <div className="mt-1.5 flex items-start gap-2 border-t border-[#F5F2ED] pt-1.5">
              <span className="mt-px h-[15px] w-[15px] flex-none rounded-[4px] border-[1.5px] border-[#D5D0C7]" />
              <span className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold leading-tight">
                  New Billing request from Priya Nair
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[9px] text-brand-gray">
                  <span className="rounded-full bg-[#EDEAF7] px-1.5 py-px font-semibold" style={{ color: "#5B47A8" }}>
                    Client Onboarding
                  </span>
                  <span className="rounded-full bg-[#F1EEE9] px-1.5 py-px font-semibold text-brand-charcoal">
                    Skylar L
                  </span>
                  <span className="rounded-full px-1.5 py-px font-semibold" style={{ background: "#FBEEEB", color: "#D8563F" }}>
                    High
                  </span>
                  due tomorrow
                </p>
              </span>
            </div>

            <p className="mt-1.5 text-[9px] leading-snug text-brand-gray">
              The title is built from their answers. Answers can also set the status, priority,
              dates, and attachments on the task itself.
            </p>
          </div>
        )}

        {on.includes("sheet") && (
          <div className="sop-view overflow-hidden rounded-lg border border-[#EBE7E0] bg-white">
            <p className="flex items-center gap-1.5 border-b border-[#F1EEE9] px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-[0.12em]" style={{ color: SHEETS }}>
              <SheetIcon className="h-2.5 w-2.5" />
              Client Intake responses
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[9px]">
                <thead>
                  <tr className="bg-[#F7F5F1] text-brand-gray">
                    {["Submitted", "Name", "Topic", "Rating"].map((h) => (
                      <th key={h} className="whitespace-nowrap px-2 py-1 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-brand-charcoal">
                  {[
                    ["8/20 09:14", "Marcus Hale", "Onboarding", "5"],
                    ["8/21 11:02", "Jordan Rivera", "Billing", "3"],
                  ].map((r) => (
                    <tr key={r[0]} className="border-t border-[#F5F2ED]">
                      {r.map((c) => (
                        <td key={c} className="whitespace-nowrap px-2 py-1">{c}</td>
                      ))}
                    </tr>
                  ))}
                  <tr className="border-t border-[#F5F2ED] tour-landed">
                    {["8/22 14:38", "Priya Nair", "Billing", "4"].map((c) => (
                      <td key={c} className="whitespace-nowrap px-2 py-1 font-semibold text-brand-ink">{c}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="border-t border-[#F1EEE9] px-2.5 py-1.5 text-[9px] text-brand-gray">
              An Admin connects the spreadsheet once, through their own Google account.
            </p>
          </div>
        )}

        {on.includes("score") && (
          <div className="sop-view rounded-lg border border-[#EBE7E0] bg-white p-2.5">
            <p className="mb-1.5 flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.12em] text-brand-orange-dark">
              <TrendIcon className="h-2.5 w-2.5" />
              Scoreboard
            </p>
            <div className="flex items-center gap-2.5">
              <span className="min-w-0 flex-1">
                <p className="truncate text-[10.5px] font-semibold">Client satisfaction, weekly</p>
                <span className="mt-1 block h-[5px] overflow-hidden rounded-full bg-[#ECE8E1]">
                  <span className="block h-full rounded-full" style={{ width: "82%", background: GREEN }} />
                </span>
              </span>
              <span className="flex-none text-right">
                <p className="text-[15px] font-extrabold leading-none tabular-nums" style={{ color: GREEN }}>4.1</p>
                <p className="text-[8.5px] text-brand-gray">goal 4.0</p>
              </span>
            </div>
          </div>
        )}

        {on.includes("crm") && (
          <div className="sop-view rounded-lg border border-[#EBE7E0] bg-white p-2.5">
            <p className="mb-1.5 flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.12em]" style={{ color: "#2C6BA6" }}>
              <People className="h-2.5 w-2.5" />
              CRM
            </p>
            <div className="flex items-center gap-2.5">
              <span className="grid h-[26px] w-[26px] flex-none place-items-center rounded-lg bg-[#EAF1F8] text-[9px] font-bold text-[#2C6BA6]">
                PN
              </span>
              <span className="min-w-0 flex-1">
                <p className="truncate text-[10.5px] font-semibold leading-tight">Priya Nair</p>
                <p className="text-[9px] text-brand-gray">Contact created &middot; source: Client Intake</p>
              </span>
            </div>
          </div>
        )}
      </div>

      <p className="flex-none border-t border-[#F1EEE9] px-3.5 py-2 text-[10px] text-brand-gray">
        Or POST every submission to your own endpoint as signed JSON.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- 5. who answered
type Person = { init: string; name: string; state: "done" | "opened" | "sent"; when: string; color: string };

const PEOPLE: Person[] = [
  { init: "MH", name: "Marcus Hale", state: "done", when: "completed 2 days ago", color: "#2C6BA6" },
  { init: "JR", name: "Jordan Rivera", state: "done", when: "completed yesterday", color: "#8A3F6D" },
  { init: "PN", name: "Priya Nair", state: "done", when: "completed today", color: "#2E7D5B" },
  { init: "KN", name: "Kath Nakamura", state: "opened", when: "opened, not finished", color: "#41638A" },
  { init: "DS", name: "Devon Sparks", state: "sent", when: "not opened yet", color: "#B4532A" },
];

const STATE_META = {
  done: { label: "Complete", color: GREEN, bg: "#EAF7F0" },
  opened: { label: "Opened", color: AMBER, bg: "#FDF1DF" },
  sent: { label: "Sent", color: "#8A857D", bg: "#F1EEE9" },
} as const;

function RecipientsDemo() {
  const done = PEOPLE.filter((p) => p.state === "done").length;

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${CARD_CLS}`}>
      <div className="flex flex-none items-center gap-2 border-b border-[#F1EEE9] px-3.5 py-3">
        <b className="min-w-0 flex-1 truncate text-[12.5px]">Event Debrief Form</b>
        <span className="flex-none whitespace-nowrap text-[10.5px] text-brand-gray">
          {done} of {PEOPLE.length} complete
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {PEOPLE.map((p) => {
          const st = STATE_META[p.state];
          return (
            <div key={p.name} className="flex items-center gap-2.5 border-b border-[#F5F2ED] px-3.5 py-2.5">
              <span
                className="grid h-[26px] w-[26px] flex-none place-items-center rounded-lg text-[9.5px] font-bold text-white"
                style={{ background: p.color }}
              >
                {p.init}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[11.5px] font-semibold leading-tight">{p.name}</span>
                <span className="text-[9.5px] text-brand-gray">{p.when}</span>
              </span>
              <span
                className="flex-none whitespace-nowrap rounded-full px-2 py-[3px] text-center text-[8.5px] font-bold uppercase tracking-wide"
                style={{ background: st.bg, color: st.color }}
              >
                {st.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex-none space-y-1.5 bg-[#FAF9F7] px-3.5 py-2.5">
        <p className="flex items-start gap-2 text-[10.5px] leading-snug text-brand-gray">
          <LinkIcon className="mt-px h-[12px] w-[12px] flex-none" style={{ color: AI }} />
          Everyone gets their own tracked link, so this list is real rather than a guess.
        </p>
        <p className="flex items-start gap-2 text-[10.5px] leading-snug text-brand-gray">
          <BellIcon className="mt-px h-[12px] w-[12px] flex-none" style={{ color: AMBER }} />
          <span>
            <b className="font-semibold text-brand-charcoal">Route by answer.</b> A submission that
            picks &ldquo;Billing&rdquo; also emails whoever owns billing.
          </span>
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 6. Multi AI
const AI_ROWS: Row[] = [
  { name: "Group Coaching Call", value: "108 responses", hit: false },
  { name: "Client Intake Form", value: "6 this week", hit: false, tone: "amber" },
  { name: "Event Debrief Form", value: "2 not opened", hit: false },
];

const AI_INSIGHTS: Insight[] = [
  {
    tag: "Theme",
    color: "#1F7F4C",
    source: "Group Coaching Call",
    text: "Across 108 responses the same complaint comes up 31 times, in different words: the session starts before people know what it is about. Nobody wrote that sentence, and every one of them meant it.",
  },
  {
    tag: "Drop",
    color: "#C9832B",
    source: "Client Intake Form",
    text: "Six intakes this week and four of them stopped at the file upload. That field is optional, and people are treating it as a wall.",
  },
  {
    tag: "Chase",
    color: AI,
    source: "Event Debrief Form",
    text: "Two people have had the link for nine days without opening it. The debrief closes Friday, so they are the reason it will be late.",
  },
];

// ---------------------------------------------------------------- section shell
function Section({
  id,
  eyebrow,
  title,
  swash,
  body,
  points,
  visual,
  flip,
  panel,
}: {
  id: string;
  eyebrow: string;
  title: React.ReactNode;
  swash?: string;
  body: string;
  points: string[];
  visual: React.ReactNode;
  flip?: boolean;
  panel: string;
}) {
  return (
    <section id={id} className="scroll-mt-24 px-5 py-10 sm:px-8 sm:py-20">
      <div className="mx-auto grid max-w-container items-center gap-8 lg:grid-cols-2 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={colTransition}
          className={`text-center lg:text-left ${flip ? "lg:order-2" : ""}`}
        >
          <p className="mb-4 text-[13px] font-bold uppercase tracking-[0.14em] text-brand-orange-dark">{eyebrow}</p>
          <h2 className="text-[26px] font-extrabold leading-[1.1] tracking-tight text-brand-ink sm:text-[42px] sm:leading-[1.06]">
            {title}
            {swash && (
              <>
                {" "}
                <span className="relative whitespace-nowrap">
                  {swash}
                  <svg
                    className="absolute -bottom-2 left-0 h-3 w-full text-brand-orange"
                    viewBox="0 0 120 12"
                    preserveAspectRatio="none"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    strokeLinecap="round"
                  >
                    <path d="M3 8c26-5 74-6 114-3" />
                  </svg>
                </span>
              </>
            )}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-brand-charcoal sm:mt-6 sm:text-lg lg:mx-0">
            {body}
          </p>
          <ul className="mt-5 flex flex-col items-center gap-2.5 sm:gap-3 lg:items-start">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-left text-[13.5px] text-brand-ink sm:text-[15px]">
                <Check className="mt-[3px] h-[17px] w-[17px] flex-none" style={{ color: GREEN }} />
                {p}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ ...colTransition, delay: 0.1 }}
          // min-w-0 so a wide mockup shrinks the column instead of blowing the
          // grid track out and scrolling the whole page sideways
          className={`min-w-0 rounded-2xl p-3 sm:rounded-[28px] sm:p-7 ${flip ? "lg:order-1" : ""}`}
          style={{ background: panel }}
        >
          {visual}
        </motion.div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- page
export default function FormsPage() {
  const { openDemo } = useDemo();

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* ------------------------------------------------ hero */}
      <section className="relative overflow-hidden px-5 pb-4 pt-6 sm:px-8 sm:pb-8 sm:pt-16">
        <div className="bg-dotted pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative mx-auto max-w-container">
          <Reveal className="mx-auto max-w-4xl text-center">
            <span className="mb-4 inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-black/10 bg-white py-1 pl-1 pr-[11px] shadow-sm sm:mb-7 sm:gap-3 sm:py-2 sm:pl-2 sm:pr-[22px]">
              <span className="grid h-[21px] w-[21px] flex-none place-items-center rounded-lg bg-gradient-to-br from-[#3E9B72] to-[#22684C] text-white shadow-[0_2px_6px_rgba(34,104,76,0.34),inset_0_1px_0_rgba(255,255,255,0.34)] sm:h-[34px] sm:w-[34px] sm:rounded-[11px]">
                <FormIcon className="h-[14px] w-[14px] sm:h-[19px] sm:w-[19px]" />
              </span>
              <span className="text-[11.5px] font-[650] tracking-[0.02em] text-[#33302C] sm:text-[16.5px]">
                Forms
              </span>
            </span>
            <h1 className="text-[24px] font-extrabold leading-[1.1] tracking-tight text-brand-ink sm:text-[66px] sm:leading-[1.04]">
              Ask once. The answer
              <br />
              <span className="text-brand-orange">goes to work.</span>
            </h1>
            <p className="mx-auto mt-3.5 max-w-2xl text-[14.5px] leading-relaxed text-brand-charcoal sm:mt-7 sm:text-xl">
              <span className="sm:hidden">
                Build a form in a minute. Every answer lands where the work already happens.
              </span>
              <span className="hidden sm:inline">
                Build a form in a minute, share it as a link, a QR code, or an embed. Then every
                answer opens a task, fills a spreadsheet, or moves a number, without anybody
                copying anything across.
              </span>
            </p>
          </Reveal>

          <Reveal delay={0.12} className="mt-6 sm:mt-12">
            <div
              className="overflow-hidden rounded-2xl p-2 sm:rounded-[30px] sm:p-8"
              style={{ background: "linear-gradient(160deg, #E9F5EF, #DCEEE4)" }}
            >
              <FormsHeroTour />
            </div>
          </Reveal>

          <Reveal delay={0.2} className="mt-6 sm:mt-10">
            <div className="flex justify-center">
              <button
                type="button"
                onClick={openDemo}
                className="inline-flex w-full max-w-[420px] items-center justify-center gap-2.5 rounded-lg bg-brand-orange px-10 py-3 text-[15px] font-semibold text-white shadow-[0_12px_30px_-10px_rgba(234,123,27,0.85)] transition-colors hover:bg-brand-orange-dark sm:w-auto sm:min-w-[300px]"
              >
                Request a Demo
                <Arrow className="h-[17px] w-[17px]" />
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-container px-5 sm:px-8">
        <hr className="border-t border-brand-gray/20" />
      </div>

      {/* ------------------------------------------------ 2. fields */}
      <Section
        id="fields"
        eyebrow="Twenty-eight field types"
        title="A survey, an intake, a waiver. Same"
        swash="builder."
        body="Text, choices, ratings, dates, uploads, a signature. Click a field in, drag it where it belongs, and set a rule so the next question only shows when it needs to."
        points={[
          "Twenty-eight field types, added and removed in any order",
          "Signature and consent fields, so a waiver stops being a PDF",
          "Conditional logic on any question, so nobody answers what does not apply",
        ]}
        visual={<FieldsDemo />}
        panel="linear-gradient(160deg, #F3F0FA, #E9E4F6)"
      />

      {/* ------------------------------------------------ 3. share */}
      <Section
        id="share"
        eyebrow="Link, QR, or embed"
        title="Put it on a flyer, a website, or"
        swash="a wall."
        body="Publishing gives you a link on your own subdomain, a QR code you can print at any size, and one script tag that renders the form inside your website rather than in an iframe."
        points={[
          "A public link on your subdomain, not somebody else's",
          "A QR code as PNG for slides or SVG for print",
          "An embed that inherits your page width, with no iframe box",
        ]}
        visual={<ShareDemo />}
        flip
        panel="linear-gradient(160deg, #EEF4FB, #E2ECF8)"
      />

      {/* ------------------------------------------------ 4. integrations */}
      <Section
        id="integrations"
        eyebrow="Where the answer goes"
        title="A response that just sits there is"
        swash="a dead end."
        body="Switch on a destination and every submission does something. It opens a task on your board, adds a row to a spreadsheet, moves a metric on a scoreboard, or creates a contact in the CRM. A form tool that does not own your projects cannot do any of this."
        points={[
          "Turn each response into a task, assigned and dated",
          "A row per response in Google Sheets, connected once by an Admin",
          "Push a rating or an NPS score straight onto a weekly metric",
        ]}
        visual={<IntegrationsDemo />}
        panel="linear-gradient(160deg, #FFF6EC, #FFEBD8)"
      />

      {/* ------------------------------------------------ 5. recipients */}
      <Section
        id="recipients"
        eyebrow="Send and track"
        title="Know who answered, not who was"
        swash="emailed."
        body="Send the form to a list and each person gets their own tracked link. You see who opened it, who finished, and who has been sitting on it for nine days, so a chase is a fact rather than a hunch."
        points={[
          "A personal tracked link per recipient, with open and completion state",
          "One message carried into the invitation and every reminder",
          "Route a submission to whoever owns that answer, automatically",
        ]}
        visual={<RecipientsDemo />}
        flip
        panel="linear-gradient(160deg, #EEF6F2, #E1EFE8)"
      />

      {/* ------------------------------------------------ 6. Multi AI (always last) */}
      <MultiAiWired
        heading="294 responses, read by"
        swash="someone who read them all."
        intro="Multi AI already has every answer your forms have collected. Ask what people keep saying, where they give up, and who has not replied, and it answers out of the responses themselves."
        leftLabel="The answers your forms collect"
        leftColor="#2E7D5B"
        leftIcon={RowsIcon}
        rightLabel="What Multi AI finds in them"
        panelTitle="Forms · All responses"
        panelMeta="294 responses"
        panelDot="#2E7D5B"
        rows={AI_ROWS}
        insights={AI_INSIGHTS}
        aiMeta="reading 26 forms"
        footer="Reading responses is on by default for new forms, and still limited to what each viewer is allowed to see."
      />

      <CTA />
      <Footer />
    </main>
  );
}
