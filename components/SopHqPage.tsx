"use client";

// Feature page: SOP HQ.
//
// Follows the client's brief, in the order they gave it:
//   1. hero: the library, then a SOP being written (see SopHqHeroTour)
//   2. blocks: the ten block types a SOP can be built from
//   3. video SOPs, recorded off the user's own screen
//   4. a multi-step SOP. The Employee Onboarding Template is only an example, so
//      the copy never claims a step count. See EXAMPLE_LEN.
//   5. assigning a SOP and tracking who has actually finished it
//   6. (last, as on every feature page) how Multi AI reads this data for insights,
//      including the AI walkthrough it can run over a single SOP
//
// Mockups are hand-built in markup rather than screenshots so they stay crisp and
// themeable. Department names, SOP titles, and counts mirror the live library.
import { motion } from "framer-motion";
import { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CTA from "./CTA";
import Reveal from "./Reveal";
import SopHqHeroTour from "./SopHqHeroTour";
import MultiAiWired from "./MultiAiWired";
import type { Row, Insight } from "./MultiAiWired";
import { useDemo } from "./DemoModal";

// ---------------------------------------------------------------- tokens
const GREEN = "#2BA463";
const AMBER = "#C9832B";
const RED = "#D8563F";
const AI = "#4B3CC4";
const colTransition = { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const };

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

// Open book, matching the SOP HQ icon in the nav's Features menu.
const BookIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.7}>
    <path d="M12 6.6C10.5 5.5 8.4 4.9 6 4.9c-1 0-1.9.1-2.7.3v11.6c.8-.2 1.7-.3 2.7-.3 2.4 0 4.5.6 6 1.7z" />
    <path d="M12 6.6C13.5 5.5 15.6 4.9 18 4.9c1 0 1.9.1 2.7.3v11.6c-.8-.2-1.7-.3-2.7-.3-2.4 0-4.5.6-6 1.7z" />
    <path d="M12 6.6v11" />
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
const Play = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5.4v13.2l11-6.6z" />
  </svg>
);
const VideoIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.9}>
    <rect x="2.8" y="6.2" width="12.6" height="11.6" rx="2.2" />
    <path d="M15.4 10.6l5.8-3.2v9.2l-5.8-3.2z" />
  </svg>
);
const CameraIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.9}>
    <circle cx="12" cy="8.6" r="3.4" />
    <path d="M4.4 19.4c0-3.5 3.4-5.8 7.6-5.8s7.6 2.3 7.6 5.8" />
  </svg>
);
const MonitorIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.9}>
    <rect x="2.9" y="4.4" width="18.2" height="12" rx="1.9" />
    <path d="M8.6 20h6.8M12 16.4V20" />
  </svg>
);
const ClockIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.9}>
    <circle cx="12" cy="12" r="8.4" />
    <path d="M12 7.4V12l3 1.8" />
  </svg>
);
const LinkIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.9}>
    <path d="M10.2 13.8a3.6 3.6 0 0 0 5.4.4l2.6-2.6a3.6 3.6 0 0 0-5.1-5.1l-1.5 1.5" />
    <path d="M13.8 10.2a3.6 3.6 0 0 0-5.4-.4l-2.6 2.6a3.6 3.6 0 0 0 5.1 5.1l1.5-1.5" />
  </svg>
);
const FormIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.9}>
    <rect x="4.6" y="3.3" width="14.8" height="17.4" rx="2.3" />
    <path d="M8.4 8.4h7.2M8.4 12.4h7.2M8.4 16.4h4.4" />
  </svg>
);
const AlertIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2}>
    <path d="M12 4.2l8.4 15.2H3.6z" />
    <path d="M12 10v3.6M12 16.6v.1" />
  </svg>
);
const RowsIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.2" />
    <path d="M3.5 9.5h17M3.5 14.5h17" />
  </svg>
);
const ScreenIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.9}>
    <rect x="2.8" y="4.4" width="18.4" height="12.4" rx="2" />
    <path d="M9.8 10.2l4 2.4-4 2.4z" fill="currentColor" stroke="none" />
    <path d="M8.6 20.4h6.8" />
  </svg>
);
const AudioIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.9}>
    <path d="M4 10v4M8 7v10M12 4.6v14.8M16 8v8M20 10.6v2.8" />
  </svg>
);
const ImageIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.9}>
    <rect x="3.2" y="4.6" width="17.6" height="14.8" rx="2.2" />
    <circle cx="8.6" cy="9.8" r="1.6" />
    <path d="M4.4 17l4.8-4.6 3.4 3.2 3-2.6 4 3.8" />
  </svg>
);
const ShotIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.9}>
    <path d="M3.4 8.4h3.2l1.4-2.2h7.9l1.4 2.2h3.3v10.2H3.4z" />
    <circle cx="12" cy="13.2" r="3.2" />
  </svg>
);
const FileIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.9}>
    <path d="M13.4 3.4H6.8a1.8 1.8 0 0 0-1.8 1.8v13.6a1.8 1.8 0 0 0 1.8 1.8h10.4a1.8 1.8 0 0 0 1.8-1.8V8.8z" />
    <path d="M13.4 3.4v5.4h5.6" />
  </svg>
);
const QuizIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.9}>
    <path d="M4 6.6l2 2 3-3.4M4 13l2 2 3-3.4M12.4 7.4h7.4M12.4 14h7.4" />
  </svg>
);
const PlusIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2.4}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const GlobeIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.8}>
    <circle cx="12" cy="12" r="8.4" />
    <path d="M3.6 12h16.8" />
    <path d="M12 3.6c2.2 2.4 3.3 5.2 3.3 8.4s-1.1 6-3.3 8.4c-2.2-2.4-3.3-5.2-3.3-8.4S9.8 6 12 3.6z" />
  </svg>
);

// ---------------------------------------------------------------- 2. blocks
// The editor's block palette, made playable. Chips toggle a block in and out of
// the document, so the reader builds the SOP rather than reading about it. The
// document renders in the palette's own order, not click order, so toggling a
// block off and on again does not shuffle the page.
type BlockKey =
  | "text" | "video" | "vlink" | "rec" | "audio"
  | "image" | "shot" | "file" | "link" | "quiz";

const BLOCK_DEFS: { key: BlockKey; label: string; icon: (p: IconProps) => React.JSX.Element }[] = [
  { key: "text", label: "Text", icon: FormIcon },
  { key: "video", label: "Video", icon: VideoIcon },
  { key: "vlink", label: "Video from Link", icon: LinkIcon },
  { key: "rec", label: "Screen Record", icon: ScreenIcon },
  { key: "audio", label: "Audio", icon: AudioIcon },
  { key: "image", label: "Image", icon: ImageIcon },
  { key: "shot", label: "Screenshot", icon: ShotIcon },
  { key: "file", label: "File", icon: FileIcon },
  { key: "link", label: "Link", icon: LinkIcon },
  { key: "quiz", label: "Quiz", icon: QuizIcon },
];

// Opens on the three that make the range obvious: written, recorded, tested.
const BLOCKS_OPEN: BlockKey[] = ["text", "rec", "quiz"];

function BlockShell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="sop-view rounded-lg border border-[#EBE7E0] bg-white p-2.5">
      <p className="mb-1.5 text-[8px] font-bold uppercase tracking-[0.12em] text-brand-gray">{label}</p>
      {children}
    </div>
  );
}

function BlockBody({ k }: { k: BlockKey }) {
  switch (k) {
    case "text":
      return (
        <BlockShell label="Text">
          <div className="flex items-center gap-2 rounded-md border border-[#EBE7E0] bg-[#FBFAF8] px-2 py-1 text-[9px] font-semibold text-brand-charcoal">
            <span className="font-bold">B</span>
            <span className="italic">I</span>
            <span className="underline">U</span>
            <span className="h-2.5 w-px bg-[#E3E0DA]" />
            <span>H1</span>
            <span>H2</span>
            <span className="h-2.5 w-px bg-[#E3E0DA]" />
            <LinkIcon className="h-2.5 w-2.5" />
            <ImageIcon className="h-2.5 w-2.5" />
          </div>
          <p className="mt-1.5 text-[11.5px] font-bold leading-tight">Before the call</p>
          <p className="mt-0.5 text-[10.5px] leading-snug text-brand-charcoal">
            Read the last two notes, so you are not asking what they already told sales.
          </p>
        </BlockShell>
      );
    case "video":
      return (
        <BlockShell label="Video">
          <div className="flex items-center gap-2.5">
            <span className="grid h-[30px] w-[46px] flex-none place-items-center rounded-md bg-[#1B1A17] text-white">
              <Play className="h-3 w-3" />
            </span>
            <span className="min-w-0">
              <b className="block truncate text-[11px] leading-tight">Walking the account setup</b>
              <span className="text-[9.5px] text-brand-gray">1 min 12 sec · uploaded by Priya</span>
            </span>
          </div>
        </BlockShell>
      );
    case "vlink":
      return (
        <BlockShell label="Embed">
          <div className="flex items-center gap-2 rounded-md border border-[#EBE7E0] bg-[#FBFAF8] px-2 py-1.5 text-[10px] text-brand-gray">
            <LinkIcon className="h-3 w-3 flex-none" />
            <span className="truncate">loom.com/share/the-kickoff-call</span>
          </div>
          <p className="mt-1.5 text-[9.5px] leading-snug text-brand-gray">
            Plays inline. YouTube, Vimeo, Loom, Drive, or any page.
          </p>
        </BlockShell>
      );
    case "rec":
      return (
        <BlockShell label="Screen Record">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <span className="flex items-center gap-0.5 rounded-md bg-[#F1EEE9] p-0.5 text-[9px]">
              <span className="whitespace-nowrap rounded-[5px] px-1.5 py-[3px] font-medium text-brand-charcoal">Screen</span>
              <span className="whitespace-nowrap rounded-[5px] bg-white px-1.5 py-[3px] font-semibold shadow-sm">Screen + Camera</span>
              <span className="whitespace-nowrap rounded-[5px] px-1.5 py-[3px] font-medium text-brand-charcoal">Camera</span>
            </span>
            <span className="flex flex-none items-center gap-1.5 rounded-md bg-[#16233D] px-2.5 py-1.5 text-[9.5px] font-semibold text-white sm:ml-auto">
              <span className="sop-rec h-1.5 w-1.5 rounded-full bg-[#E8574A]" />
              Start recording
            </span>
          </div>
          <p className="mt-1.5 text-[9.5px] leading-snug text-brand-gray">
            Records in the browser, and keeps running while you work.
          </p>
        </BlockShell>
      );
    case "audio":
      return (
        <BlockShell label="Audio">
          <div className="flex items-center gap-2">
            <AudioIcon className="h-3.5 w-3.5 flex-none text-brand-charcoal" />
            <span className="flex h-4 flex-1 items-end gap-[2px]">
              {[5, 10, 7, 14, 9, 16, 6, 12, 8, 16, 7, 11, 5, 13, 9, 7, 12, 6].map((h, i) => (
                <span key={i} className="w-full rounded-full bg-[#D8D2C8]" style={{ height: h }} />
              ))}
            </span>
          </div>
          <p className="mt-1.5 text-[9.5px] text-brand-gray">The call recording, on the step it explains.</p>
        </BlockShell>
      );
    case "image":
      return (
        <BlockShell label="Image">
          <div className="flex items-center gap-2.5">
            <span className="grid h-[30px] w-[46px] flex-none place-items-center rounded-md border border-[#E6E2DB] bg-gradient-to-br from-[#F4F1EC] to-[#E9E4DC] text-brand-gray">
              <ImageIcon className="h-3 w-3" />
            </span>
            <span className="min-w-0">
              <b className="block truncate text-[11px] leading-tight">The billing tab, plan field circled</b>
              <span className="text-[9.5px] text-brand-gray">Alt text required, so it stays readable for everyone.</span>
            </span>
          </div>
        </BlockShell>
      );
    case "shot":
      return (
        <BlockShell label="Screenshot">
          <div className="flex items-center gap-2">
            <span className="flex flex-none items-center gap-1.5 rounded-md border border-[#E6E2DB] px-2 py-1.5 text-[9.5px] font-semibold text-brand-charcoal">
              <ShotIcon className="h-2.5 w-2.5" />
              Take screenshot
            </span>
            <span className="text-[9.5px] leading-snug text-brand-gray">Captured from your screen, not uploaded.</span>
          </div>
        </BlockShell>
      );
    case "file":
      return (
        <BlockShell label="File">
          <div className="flex items-center gap-2.5">
            <span className="grid h-[24px] w-[24px] flex-none place-items-center rounded-md bg-[#EAF1F8] text-[#2C6BA6]">
              <FileIcon className="h-3 w-3" />
            </span>
            <span className="min-w-0">
              <b className="block truncate text-[11px] leading-tight">Refund Policy 2026.pdf</b>
              <span className="text-[9.5px] text-brand-gray">PDF, Office, CSV, Markdown, JSON, ZIP. Up to 50 MB.</span>
            </span>
          </div>
        </BlockShell>
      );
    case "link":
      return (
        <BlockShell label="Link">
          <div className="flex items-center gap-2.5">
            <span className="grid h-[24px] w-[24px] flex-none place-items-center rounded-md bg-[#EAF7F0] text-[#2E7D5B]">
              <FormIcon className="h-3 w-3" />
            </span>
            <span className="min-w-0">
              <b className="block truncate text-[11px] leading-tight">Pricing sheet, Q3</b>
              <span className="text-[9.5px] text-brand-gray">Docs, Sheets, Slides, Notion, Figma, or any URL.</span>
            </span>
          </div>
        </BlockShell>
      );
    case "quiz":
      return (
        <BlockShell label="Quiz">
          <p className="text-[11px] font-bold leading-tight">Inside thirty days, who approves a refund?</p>
          <div className="mt-1.5 space-y-1">
            <span className="flex items-center gap-2 rounded-md border border-[#E6E2DB] px-2 py-1 text-[10px]">
              <span className="h-2.5 w-2.5 flex-none rounded-full border-[1.5px] border-[#D5D0C7]" />
              A manager, every time
            </span>
            <span className="flex items-center gap-2 rounded-md border border-[#BFE5CD] bg-[#F2FBF6] px-2 py-1 text-[10px]">
              <span className="h-2.5 w-2.5 flex-none rounded-full" style={{ background: GREEN }} />
              Nobody, it is automatic
            </span>
          </div>
          <p className="mt-1.5 text-[9.5px] text-brand-gray">
            They cannot complete the step until they pass this.
          </p>
        </BlockShell>
      );
  }
}

function BlocksDemo() {
  const [on, setOn] = useState<BlockKey[]>(BLOCKS_OPEN);
  const toggle = (k: BlockKey) =>
    setOn((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));
  const shown = BLOCK_DEFS.filter((b) => on.includes(b.key));

  return (
    <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)]">
      {/* SOP header, as the editor draws it, on one line to keep the card short */}
      <div className="flex items-center gap-2.5 border-b border-[#F1EEE9] px-3.5 py-2.5">
        <span className="min-w-0 flex-1">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-brand-gray">SOP Title</p>
          <h4 className="truncate text-[13.5px] font-extrabold tracking-tight">Welcome Call Script</h4>
        </span>
        <span className="flex flex-none items-center gap-1.5">
          <span className="whitespace-nowrap rounded-full bg-[#F1EEE9] px-2 py-[3px] text-[9px] font-semibold text-brand-charcoal">
            Operations
          </span>
          {/* second pill is the first thing to go when there is no room for it */}
          <span className="hidden items-center gap-1 whitespace-nowrap rounded-full bg-[#F1EEE9] px-2 py-[3px] text-[9px] text-brand-charcoal min-[380px]:flex">
            <GlobeIcon className="h-2.5 w-2.5" />
            Everyone
          </span>
        </span>
      </div>

      {/* the palette */}
      <div className="border-b border-[#F1EEE9] px-3.5 py-2.5">
        <p className="mb-1.5 text-[9.5px] text-brand-gray">
          Add a block <span className="text-[#C4BFB6]">·</span> {on.length} of {BLOCK_DEFS.length} in use
        </p>
        <div className="flex flex-wrap gap-1">
          {BLOCK_DEFS.map((b) => {
            const Icon = b.icon;
            const active = on.includes(b.key);
            return (
              <button
                key={b.key}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(b.key)}
                className={`flex items-center gap-1 rounded-full border px-2 py-1 text-[9.5px] transition-colors ${
                  active
                    ? "border-brand-orange/55 bg-[#FFF6EC] font-semibold text-brand-orange-dark"
                    : "border-[#E6E2DB] font-medium text-brand-charcoal hover:bg-[#FAF9F7]"
                }`}
              >
                <Icon className="h-2.5 w-2.5" />
                {b.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* The document. Fixed height and scrolled, so adding blocks never resizes
          the card and shunts the rest of the section around. */}
      <div className="relative bg-[#FAF9F7]">
        <div className="h-[244px] space-y-2 overflow-y-auto px-3.5 py-3">
          {shown.length === 0 ? (
            <p className="pt-16 text-center text-[11px] text-brand-gray">
              An empty document. Add a block to start.
            </p>
          ) : (
            shown.map((b) => <BlockBody key={b.key} k={b.key} />)
          )}
        </div>
        {shown.length > 3 && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-7 bg-gradient-to-t from-[#FAF9F7] to-transparent"
          />
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-[#F1EEE9] px-3.5 py-2">
        <span className="flex flex-none items-center gap-1.5 rounded-lg border border-[#E3E0DA] px-2 py-1.5 text-[9.5px] font-semibold text-brand-charcoal">
          <PlusIcon className="h-2.5 w-2.5" />
          Convert to multi-step
        </span>
        <span className="text-[9.5px] text-brand-gray">When one page stops being enough.</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 3. video SOP
type Source = "screen" | "both" | "camera";

const SOURCES: { key: Source; label: string; icon: (p: IconProps) => React.JSX.Element }[] = [
  { key: "screen", label: "Screen", icon: MonitorIcon },
  { key: "both", label: "Screen + camera", icon: VideoIcon },
  { key: "camera", label: "Camera", icon: CameraIcon },
];

const CHAPTERS = [
  { at: "0:00", title: "Open GHL and log in" },
  { at: "0:18", title: "Create the sub-account" },
  { at: "0:34", title: "Invite the new hire by email" },
  { at: "0:52", title: "Set their permissions" },
];

function VideoSopDemo() {
  const [src, setSrc] = useState<Source>("both");

  return (
    <div className="space-y-3">
      {/* ---- recorder ---- */}
      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)]">
        {/* Wraps below the title on narrow screens: the three sources plus the
            heading are wider than a phone, and this row used to force the whole
            card to overflow sideways. */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2 border-b border-[#F1EEE9] px-3.5 py-2.5">
          <b className="text-[12.5px]">Record a video SOP</b>
          <span className="flex w-full items-center gap-0.5 rounded-lg bg-[#F1EEE9] p-0.5 sm:ml-auto sm:w-auto">
            {SOURCES.map((s) => {
              const Icon = s.icon;
              const on = src === s.key;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setSrc(s.key)}
                  aria-pressed={on}
                  className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-[7px] px-2 py-1 text-[10.5px] sm:flex-none sm:justify-start ${
                    on ? "bg-white font-semibold text-brand-ink shadow-sm" : "font-medium text-brand-charcoal"
                  }`}
                >
                  <Icon className="hidden h-3 w-3 flex-none sm:block" />
                  {s.label}
                </button>
              );
            })}
          </span>
        </div>

        {/* preview */}
        <div className="p-3">
          <div className="relative overflow-hidden rounded-xl bg-[#1B1A17]" style={{ height: 148 }}>
            {src !== "camera" ? (
              <div className="absolute inset-0 p-2.5">
                {/* a mock app window being recorded */}
                <div className="flex h-full flex-col overflow-hidden rounded-lg bg-[#F7F5F1]">
                  <div className="flex items-center gap-1 border-b border-[#E6E2DB] bg-white px-2 py-1.5">
                    <span className="h-[6px] w-[6px] rounded-full bg-[#E8574A]" />
                    <span className="h-[6px] w-[6px] rounded-full bg-[#F0B429]" />
                    <span className="h-[6px] w-[6px] rounded-full bg-[#3BB273]" />
                    <span className="ml-2 rounded bg-[#F1EEE9] px-2 py-px text-[7.5px] text-brand-gray">
                      app.gohighlevel.com
                    </span>
                  </div>
                  <div className="flex-1 p-2">
                    <div className="h-2 w-1/3 rounded bg-[#DDD8CF]" />
                    <div className="mt-2 grid grid-cols-3 gap-1.5">
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-7 rounded bg-white ring-1 ring-[#E6E2DB]" />
                      ))}
                    </div>
                    <div className="mt-2 h-2 w-2/5 rounded bg-[#E6E2DB]" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 grid place-items-center">
                <span className="grid h-[86px] w-[86px] place-items-center rounded-full bg-[#2E2C28] text-[#8C8781]">
                  <CameraIcon className="h-9 w-9" />
                </span>
              </div>
            )}

            {/* camera bubble */}
            {src === "both" && (
              <span className="absolute bottom-2.5 left-2.5 grid h-[46px] w-[46px] place-items-center rounded-full border-2 border-white/80 bg-[#2E2C28] text-[#B8B2AA] shadow-lg">
                <CameraIcon className="h-5 w-5" />
              </span>
            )}

            {/* recording chrome */}
            <span className="absolute right-2.5 top-2.5 flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[9.5px] font-semibold text-white backdrop-blur-sm">
              <span className="sop-rec h-[7px] w-[7px] rounded-full bg-[#E8574A]" />
              REC 00:42
            </span>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <span className="flex flex-none items-center gap-1.5 rounded-lg bg-[#E8574A] px-3 py-1.5 text-[11px] font-semibold text-white">
              <span className="h-2 w-2 rounded-sm bg-white" />
              Stop &amp; publish
            </span>
            <span className="text-[10.5px] text-brand-gray">
              Recording {src === "screen" ? "your screen" : src === "camera" ? "your camera" : "screen and camera"}
            </span>
          </div>
        </div>
      </div>

      {/* ---- published ---- */}
      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)]">
        <div className="flex items-start gap-3 px-3.5 py-3">
          <span className="relative grid h-[42px] w-[62px] flex-none place-items-center overflow-hidden rounded-lg bg-[#22201D] text-white">
            <Play className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <b className="block truncate text-[12.5px] leading-tight">Setting up GHL for New Hires</b>
            <span className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[10px] text-brand-gray">
              <span className="rounded-full bg-[#F1EEE9] px-1.5 py-px font-semibold text-brand-charcoal">
                Technology
              </span>
              by Kath
              <span className="text-[#C4BFB6]">·</span>
              <ClockIcon className="h-[11px] w-[11px]" />
              1 min
            </span>
          </span>
          <span
            className="flex-none rounded-full px-2 py-[3px] text-[9px] font-bold"
            style={{ background: "#EAF7F0", color: GREEN }}
          >
            PUBLISHED
          </span>
        </div>

        <div className="border-t border-[#F1EEE9] px-3.5 py-2.5">
          <p className="mb-1.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-brand-gray">
            Chapters, generated for you
          </p>
          <div className="space-y-1">
            {CHAPTERS.map((c) => (
              <div key={c.at} className="flex items-center gap-2.5 text-[11.5px]">
                <span className="w-[26px] flex-none font-mono text-[10px] text-brand-orange-dark">{c.at}</span>
                <span className="min-w-0 truncate text-brand-charcoal">{c.title}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="border-t border-[#F1EEE9] px-3.5 py-2 text-[10.5px] text-brand-gray">
          Fully transcribed, so a search for &ldquo;sub-account&rdquo; lands on 0:18.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 4. multi-step SOP
// A SOP is as long as whoever wrote it needed, so the page never claims a number.
// This mockup is one example: EXAMPLE_LEN steps, of which the first seven are shown
// so the reader sees structure without a wall of text. Checking a box moves the
// count, which stays out of the total because the steps below the fold are all
// still open. Change EXAMPLE_LEN and both this section and Assign and track follow.
const EXAMPLE_LEN = 23;

type Step = { n: number; title: string; kind?: "video" | "form" | "link"; done: boolean };

const STEPS: Step[] = [
  { n: 1, title: "Send the offer letter and collect the signature", kind: "form", done: true },
  { n: 2, title: "Create the payroll record in Gusto", done: true },
  { n: 3, title: "Order the laptop and ship it to their address", done: true },
  { n: 4, title: "Add them to the team calendar and Monday standup", done: true },
  { n: 5, title: "Watch: how we run the first week", kind: "video", done: false },
  { n: 6, title: "Set up the RUK App account and confirm login", kind: "link", done: false },
  { n: 7, title: "Create Google Workspace account", done: false },
];

const KIND_META = {
  video: { label: "Video", color: "#2C6BA6", icon: VideoIcon },
  form: { label: "Form", color: "#2E7D5B", icon: FormIcon },
  link: { label: "Link", color: "#8A3F6D", icon: LinkIcon },
} as const;

function MultiStepDemo() {
  const [done, setDone] = useState<boolean[]>(STEPS.map((s) => s.done));
  const count = done.filter(Boolean).length;
  const pct = Math.round((count / EXAMPLE_LEN) * 100);

  return (
    <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)]">
      {/* SOP header */}
      <div className="flex items-start gap-3 px-4 pb-3 pt-3.5">
        <span className="grid h-[34px] w-[34px] flex-none place-items-center rounded-[10px] bg-[#DCE6F0] text-[11px] font-bold text-[#41638A]">
          EO
        </span>
        <span className="min-w-0 flex-1">
          <b className="block text-[14px] leading-tight">Employee Onboarding Template</b>
          <span className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[10px] text-brand-gray">
            <span className="rounded-full bg-[#F1EEE9] px-1.5 py-px font-semibold text-brand-charcoal">
              Company-wide
            </span>
            by Skylar
            <span className="text-[#C4BFB6]">·</span>
            <ClockIcon className="h-[11px] w-[11px]" />
            12 min
          </span>
        </span>
      </div>

      {/* progress */}
      <div className="px-4 pb-3">
        <div className="flex items-baseline gap-2">
          <span className="text-[19px] font-extrabold tabular-nums leading-none" style={{ color: pct >= 50 ? GREEN : AMBER }}>
            {count}/{EXAMPLE_LEN}
          </span>
          <span className="text-[11px] text-brand-gray">steps complete</span>
          <span className="ml-auto text-[11px] font-semibold tabular-nums text-brand-charcoal">{pct}%</span>
        </div>
        <div className="mt-1.5 h-[5px] overflow-hidden rounded-full bg-[#ECE8E1]">
          <span
            className="block h-full rounded-full transition-[width] duration-300"
            style={{ width: `${pct}%`, background: pct >= 50 ? GREEN : "#EA7B1B" }}
          />
        </div>
      </div>

      {/* steps */}
      <div className="border-t border-[#F1EEE9]">
        {STEPS.map((s, i) => {
          const on = done[i];
          const meta = s.kind ? KIND_META[s.kind] : null;
          const KindIcon = meta?.icon;
          return (
            <button
              key={s.n}
              type="button"
              aria-pressed={on}
              onClick={() => setDone(done.map((d, j) => (j === i ? !d : d)))}
              className="flex w-full items-center gap-2.5 border-b border-[#F5F2ED] px-4 py-2.5 text-left last:border-b-0 hover:bg-[#FAF9F7]"
            >
              <span
                className={`grid h-[19px] w-[19px] flex-none place-items-center rounded-md border-[1.5px] transition-colors ${
                  on ? "border-transparent text-white" : "border-[#D5D0C7] text-transparent"
                }`}
                style={on ? { background: GREEN } : undefined}
              >
                <Check className="h-[11px] w-[11px]" />
              </span>
              <span className="w-[15px] flex-none text-[10px] font-bold tabular-nums text-brand-gray">{s.n}</span>
              <span
                className={`min-w-0 flex-1 truncate text-[12px] ${
                  on ? "text-brand-gray line-through" : "font-medium text-brand-ink"
                }`}
              >
                {s.title}
              </span>
              {meta && KindIcon && (
                <span
                  className="flex flex-none items-center gap-1 rounded-full px-1.5 py-[2px] text-[8.5px] font-bold uppercase tracking-wide"
                  style={{ background: `${meta.color}14`, color: meta.color }}
                >
                  <KindIcon className="h-[9px] w-[9px]" />
                  {meta.label}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="border-t border-[#F1EEE9] bg-[#FAF9F7] px-4 py-2 text-[10.5px] text-brand-gray">
        This one runs {EXAMPLE_LEN}, covering access, training, and the week-one check-ins. The next
        one might run six.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- 5. assign and track
type Person = { init: string; name: string; role: string; done: number; color: string };

const PEOPLE: Person[] = [
  { init: "AD", name: "Alisha Dickerson", role: "Operations", done: EXAMPLE_LEN, color: "#2E7D5B" },
  { init: "MH", name: "Marcus Hale", role: "Operations", done: 18, color: "#2C6BA6" },
  { init: "TR", name: "Tova Reyes", role: "Events", done: 8, color: "#C9832B" },
  { init: "JP", name: "Jordan Pike", role: "Events", done: 8, color: "#8A3F6D" },
  { init: "KN", name: "Kath Nakamura", role: "Technology", done: 2, color: "#41638A" },
  { init: "DS", name: "Devon Sparks", role: "Sales", done: 0, color: "#B4532A" },
];

function statusOf(done: number) {
  if (done >= EXAMPLE_LEN) return { label: "Complete", color: GREEN, bg: "#EAF7F0" };
  if (done > 0) return { label: "In progress", color: AMBER, bg: "#FDF1DF" };
  return { label: "Not started", color: RED, bg: "#FBEEEB" };
}

function AssignDemo() {
  const finished = PEOPLE.filter((p) => p.done >= EXAMPLE_LEN).length;

  return (
    <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)]">
      <div className="flex items-center gap-2 border-b border-[#F1EEE9] px-3.5 py-3">
        <b className="min-w-0 flex-1 truncate text-[12.5px]">Employee Onboarding Template</b>
        <span className="flex-none whitespace-nowrap text-[10.5px] text-brand-gray">
          {finished} of {PEOPLE.length} complete
        </span>
      </div>

      {PEOPLE.map((p) => {
        const st = statusOf(p.done);
        const pct = Math.round((p.done / EXAMPLE_LEN) * 100);
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
              <span className="text-[9.5px] text-brand-gray">{p.role}</span>
            </span>
            <span className="hidden w-[86px] flex-none sm:block">
              <span className="block h-[4px] overflow-hidden rounded-full bg-[#ECE8E1]">
                <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: st.color }} />
              </span>
            </span>
            <span className="w-[42px] flex-none text-right text-[10.5px] font-bold tabular-nums text-brand-charcoal">
              {p.done}/{EXAMPLE_LEN}
            </span>
            <span
              className="w-[88px] flex-none whitespace-nowrap rounded-full px-1.5 py-[3px] text-center text-[8.5px] font-bold uppercase tracking-wide"
              style={{ background: st.bg, color: st.color }}
            >
              {st.label}
            </span>
          </div>
        );
      })}

      {/* the two things that keep this list honest */}
      <div className="space-y-1.5 bg-[#FAF9F7] px-3.5 py-2.5">
        <p className="flex items-start gap-2 text-[10.5px] leading-snug text-brand-gray">
          <Check className="mt-px h-[12px] w-[12px] flex-none" style={{ color: GREEN }} />
          Everyone in Operations picked this up automatically when they joined the department.
        </p>
        <p className="flex items-start gap-2 text-[10.5px] leading-snug text-brand-gray">
          <AlertIcon className="mt-px h-[12px] w-[12px] flex-none" style={{ color: AMBER }} />
          <span>
            <b className="font-semibold text-brand-charcoal">3 SOPs flagged for review.</b> The
            Welcome Call Script has not been touched in 14 months.
          </span>
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 6. Multi AI data
const AI_ROWS: Row[] = [
  { name: "Employee Onboarding Template", value: "3 stalled", hit: false, tone: "amber" },
  { name: "Welcome Call Script", value: "4 dropped off", hit: false },
  { name: "Sales · Refunds", value: "0 SOPs", hit: false },
];

const AI_INSIGHTS: Insight[] = [
  {
    tag: "Blocked",
    color: "#C9832B",
    source: "Employee Onboarding Template",
    text: "Three of the six people assigned are stuck on step 8, the department access step, and none of them have moved in nine days. That one step is your onboarding bottleneck.",
  },
  {
    tag: "Walkthrough",
    color: AI,
    source: "Welcome Call Script",
    text: "Six people opened this in the last month and four stopped before the qualifying questions. Point the AI walkthrough at it and the agent takes them a step at a time, in plain language, answering only out of this SOP.",
  },
  {
    tag: "Gap",
    color: "#1F7F4C",
    source: "Sales · Refunds",
    text: "Sales has 29 SOPs and not one covers refunds or chargebacks, a process three support tickets asked for by name last month. Record it once and it stops being tribal knowledge.",
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
export default function SopHqPage() {
  const { openDemo } = useDemo();

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* ------------------------------------------------ hero */}
      <section className="relative overflow-hidden px-5 pb-4 pt-10 sm:px-8 sm:pb-8 sm:pt-16">
        {/* the site's own dotted backdrop, as used on the home-page hero */}
        <div className="bg-dotted pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative mx-auto max-w-container">
          <Reveal className="mx-auto max-w-4xl text-center">
            {/* feature badge: icon tile + label, in the SystemTokens pill idiom */}
            <span className="mb-6 inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-black/10 bg-white py-1.5 pl-1.5 pr-[13px] shadow-sm sm:mb-7 sm:gap-3 sm:py-2 sm:pl-2 sm:pr-[22px]">
              <span className="grid h-[24px] w-[24px] flex-none place-items-center rounded-lg bg-gradient-to-br from-[#9A6534] to-[#6B4220] text-white shadow-[0_2px_6px_rgba(122,78,40,0.34),inset_0_1px_0_rgba(255,255,255,0.34)] sm:h-[34px] sm:w-[34px] sm:rounded-[11px]">
                <BookIcon className="h-[14px] w-[14px] sm:h-[19px] sm:w-[19px]" />
              </span>
              <span className="text-[12.5px] font-[650] tracking-[0.02em] text-[#33302C] sm:text-[16.5px]">
                SOP HQ
              </span>
            </span>
            {/* 28px on mobile so "Every process, out of" fits one line inside 335px */}
            <h1 className="text-[28px] font-extrabold leading-[1.12] tracking-tight text-brand-ink sm:text-[66px] sm:leading-[1.04]">
              Every process, out of
              <br />
              <span className="text-brand-orange">someone&rsquo;s head.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-brand-charcoal sm:mt-7 sm:text-xl">
              Write it once, record it once, and the whole team runs it the same way. Every step,
              video, and checklist lives where the work happens.
            </p>
          </Reveal>

          <Reveal delay={0.12} className="mt-9 sm:mt-12">
            <div
              className="overflow-hidden rounded-2xl p-2.5 sm:rounded-[30px] sm:p-8"
              style={{ background: "linear-gradient(160deg, #FFF1E2, #FFE7D2)" }}
            >
              <SopHqHeroTour />
            </div>
          </Reveal>

          {/* CTA sits under the library, so the tour is the first thing seen */}
          <Reveal delay={0.2} className="mt-8 sm:mt-10">
            <div className="flex justify-center">
              <button
                type="button"
                onClick={openDemo}
                className="inline-flex w-full max-w-[420px] items-center justify-center gap-2.5 rounded-lg bg-brand-orange px-10 py-3.5 text-base font-semibold text-white shadow-[0_12px_30px_-10px_rgba(234,123,27,0.85)] transition-colors hover:bg-brand-orange-dark sm:w-auto sm:min-w-[300px]"
              >
                Request a Demo
                <Arrow className="h-[17px] w-[17px]" />
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* divider between the hero tour and the capability sections */}
      <div className="mx-auto max-w-container px-5 sm:px-8">
        <hr className="border-t border-brand-gray/20" />
      </div>

      {/* ------------------------------------------------ 2. blocks */}
      <Section
        id="blocks"
        eyebrow="Blocks"
        title="Some steps need a paragraph. Some need"
        swash="a recording."
        body="Text, video, a screen recording, audio, an image, a file, a link, or a quiz. Add what the step actually needs, take out what it does not, and the SOP ends up the shape of the work."
        points={[
          "Ten block types, added and removed in any order",
          "Record your screen without leaving the editor",
          "Turn a single page into ordered steps when it outgrows one",
        ]}
        visual={<BlocksDemo />}
        panel="linear-gradient(160deg, #F3F0FA, #E9E4F6)"
      />

      {/* ------------------------------------------------ 3. video SOPs */}
      <Section
        id="video"
        eyebrow="Video SOPs"
        title="Hit record. That is the whole"
        swash="writing process."
        body="Record your screen, your camera, or both, straight from the browser. What you publish is a SOP with a transcript and chapters, so the next person jumps to the part they need."
        points={[
          "Screen, camera, or both. No install, no separate tool",
          "Chapters and a full transcript, so long recordings stay searchable",
          "Lives inside the SOP next to the written steps, not in a drive folder",
        ]}
        visual={<VideoSopDemo />}
        flip
        panel="linear-gradient(160deg, #EEF4FB, #E2ECF8)"
      />

      {/* ------------------------------------------------ 4. multi-step SOP */}
      <Section
        id="steps"
        eyebrow="Multi-step SOPs"
        title="However many steps it takes, not one of them"
        swash="gets skipped."
        body="Some procedures are four steps. Some run past fifty. Break yours into as many as the job actually needs, group them under your own headings, and every one gets ticked off by a person, on a date, with their name on it."
        points={[
          "A checkbox on every step, with a live completion count",
          "Attach a video, a form, or a link to any step that needs one",
          "It is not done until the last box is ticked, and everyone can see that",
        ]}
        visual={<MultiStepDemo />}
        panel="linear-gradient(160deg, #FFF6EC, #FFEBD8)"
      />

      {/* ------------------------------------------------ 5. assign and track */}
      <Section
        id="assign"
        eyebrow="Assign and track"
        title="Know who has done it, not who was"
        swash="told to."
        body="Assign a SOP to a person, a subject, or a whole department. Anyone who joins that department picks up every SOP in it automatically, and you get a live completion count instead of a promise."
        points={[
          "Department members receive every SOP in that department, automatically",
          "Per-person progress, so a stalled onboarding shows up on day two",
          "Stale SOPs get flagged for review before they teach the wrong thing",
        ]}
        visual={<AssignDemo />}
        flip
        panel="linear-gradient(160deg, #EEF6F2, #E1EFE8)"
      />

      {/* ------------------------------------------------ 6. Multi AI (always last)
          Deliberately not a Section: centred heading plus a full-width wired
          diagram, so the closer reads as its own thing rather than a fifth
          alternating block. See components/MultiAiWired.tsx. */}
      <MultiAiWired
        heading="Your playbook, read by"
        swash="a chief of staff."
        intro="Multi AI already has every SOP your team has written. Ask what is missing, what is stale, or who is stuck, and it answers out of the library itself. Point it at one SOP and it walks somebody through it, a step at a time."
        leftLabel="The SOPs your team writes"
        leftColor="#7A4E28"
        leftIcon={RowsIcon}
        rightLabel="What Multi AI finds in them"
        panelTitle="SOP HQ · Operations"
        panelMeta="92 SOPs"
        panelDot="#7A4E28"
        rows={AI_ROWS}
        insights={AI_INSIGHTS}
        aiMeta="reading 92 SOPs"
        footer="Multi AI reads the SOPs your team already wrote. No exports, no prompt engineering, no separate AI subscription."
      />

      <CTA />
      <Footer />
    </main>
  );
}
