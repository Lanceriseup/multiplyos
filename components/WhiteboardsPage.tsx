"use client";

// The Whiteboards feature page.
//
// Newest of the thirteen feature pages, and the only one that replaces Miro.
// Built September 2026 from two client screenshots (the board list and a live
// canvas) plus the two help-centre articles, which give the feature exactly two
// capabilities: "start a whiteboard" and "share a whiteboard and comment on it".
//
// The page is those two, opened out into four sections:
//
//   1. the canvas       infinite, and every tool on the rail
//   2. together, live   presence, cursors, and the same board at the same time
//   3. sharing          a role for each teammate, a public link for outsiders
//   4. comments         pinned feedback that does not need a meeting
//
// Section 2 is the one that earns the Miro comparison, so it is second rather
// than last: an infinite canvas is table stakes, and the reason to move off Miro
// is that the canvas is already inside the system that holds your plan, your
// scoreboard and your SOPs.
//
// Whiteboards is an OPTIONAL MODULE teams enable, per the help centre. The page
// says so once, in section 1's points, rather than hedging the whole thing.
//
// The board list in section 3's visual is traced from the client's screenshot:
// the All boards / My boards / Shared with me / My department rail, the Unfiled
// folder, Trash, the search field, and a card carrying its own visibility and
// who shared it.
import { motion } from "framer-motion";
import { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CTA from "./CTA";
import Reveal from "./Reveal";
import WhiteboardsHeroTour from "./WhiteboardsHeroTour";
import { ReplacesChip, REPLACES } from "./ReplacesStrip";
import MultiAiWired from "./MultiAiWired";
import type { Row, Insight } from "./MultiAiWired";
import { useDemo } from "./DemoModal";

// ---------------------------------------------------------------- tokens
const TEAL = "#1592AE"; // the feature's own tile colour, from the navbar
const GREEN = "#2BA463";
const AMBER = "#C9832B";
const AI = "#4B3CC4";
const INK = "#1B1A17";
const HAIR = "#ECEAE6";
const HAIR2 = "#E3E0DA";
const MUTED = "#8A867E";
const MUTED2 = "#A9A49B";
const STICKY = "#FBE98A";

const colTransition = { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const };
const CARD_CLS = "h-[380px] sm:h-[430px]";

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

const BoardIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="3" y="4.4" width="18" height="12.6" rx="2" />
    <path d="M12 17v3.2M8.4 20.4h7.2" />
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
const Infinite = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M8.4 8.4a5 5 0 1 0 0 7.2c1.6-1.6 5.6-5.6 7.2-7.2a5 5 0 1 1 0 7.2C14 14 10 10 8.4 8.4z" />
  </svg>
);
const CursorsIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M4 3l8.4 5.4-3.6.6 2.1 4.2-1.8.8-2.1-4.2-2.4 2.4z" />
    <path d="M13.4 11.6l7.2 4.6-3 .5 1.8 3.6-1.6.7-1.8-3.6-2 2z" />
  </svg>
);
const ShareIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="17.6" cy="6" r="2.6" />
    <circle cx="6.4" cy="12" r="2.6" />
    <circle cx="17.6" cy="18" r="2.6" />
    <path d="M8.8 10.8l6.4-3.4M8.8 13.2l6.4 3.4" />
  </svg>
);
const CommentIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M20.4 14.6a2 2 0 0 1-2 2H8l-4.4 3.8V5.4a2 2 0 0 1 2-2h12.8a2 2 0 0 1 2 2z" />
  </svg>
);
const LinkIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M10 13.6a4 4 0 0 0 5.7 0l2.8-2.8a4 4 0 0 0-5.7-5.7L11.4 6.5" />
    <path d="M14 10.4a4 4 0 0 0-5.7 0L5.5 13.2a4 4 0 0 0 5.7 5.7l1.4-1.4" />
  </svg>
);
const LockIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="4.6" y="10.4" width="14.8" height="9.8" rx="2" />
    <path d="M8 10.4V7.4a4 4 0 0 1 8 0v3" />
  </svg>
);
const EyeIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M2.6 12S6 6 12 6s9.4 6 9.4 6-3.4 6-9.4 6-9.4-6-9.4-6z" />
    <circle cx="12" cy="12" r="2.8" />
  </svg>
);
const PenIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M3.6 20.4l4.4-1.2 10.6-10.6a2 2 0 0 0-2.8-2.8L5.2 16.4z" />
    <path d="M14 6.6l2.8 2.8" />
  </svg>
);
const RowsIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="3.4" y="5" width="17.2" height="4.2" rx="1.4" />
    <rect x="3.4" y="14.8" width="17.2" height="4.2" rx="1.4" />
  </svg>
);
const SparkIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2}>
    <path d="M12 3l1.6 4L18 8.5 14 10l-2 4-2-4-4-1.5L10 7z" />
  </svg>
);
const SearchIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="11" cy="11" r="7" />
    <path d="M16.2 16.2L21 21" />
  </svg>
);
const FolderIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="3" y="3" width="7.4" height="7.4" rx="1.4" />
    <rect x="13.6" y="3" width="7.4" height="7.4" rx="1.4" />
    <rect x="3" y="13.6" width="7.4" height="7.4" rx="1.4" />
    <rect x="13.6" y="13.6" width="7.4" height="7.4" rx="1.4" />
  </svg>
);
const TrashIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M4.4 7h15.2M9 7V4.8h6V7M6.4 7l1 12.2h9.2L17.6 7" />
  </svg>
);
const PersonIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="12" cy="8" r="3.4" />
    <path d="M5 20c0-3.4 3.1-5.6 7-5.6s7 2.2 7 5.6" />
  </svg>
);
const BuildingIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="4.4" y="3.4" width="15.2" height="17.2" rx="1.6" />
    <path d="M8.4 7.4h2M13.6 7.4h2M8.4 11.4h2M13.6 11.4h2M10.4 20.6v-4.2h3.2v4.2" />
  </svg>
);
const InboxIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M3.4 13.4h4l1.4 2.6h6.4l1.4-2.6h4" />
    <path d="M3.4 13.4L6 4.6h12l2.6 8.8v5a1.6 1.6 0 0 1-1.6 1.6H5a1.6 1.6 0 0 1-1.6-1.6z" />
  </svg>
);

// ---------------------------------------------------------------- 1. the canvas
const TOOL_CHIPS = [
  "Sticky notes",
  "Text",
  "Shapes",
  "Connectors",
  "Freehand pen",
  "Highlighter",
  "Frames",
  "Images",
  "Comments",
];
/**
 * How many chips a phone shows before "+N more".
 *
 * All nine wrap to FOUR rows and 113px at 390px wide, which is a lot of a
 * 380px card spent listing tool names nobody taps, and it was the main reason
 * the board underneath looked squeezed.
 *
 * Five, not six: six fits two rows at 390 but pushes the counter onto a third
 * row at 360, where the row is only 272px wide. Five holds two rows at both,
 * and "+4 more" still makes the point that the rail is deep.
 */
const CHIPS_ON_PHONE = 5;

// The board's drawing, in the coordinate space it was composed in. Given to the
// mobile SVG as a viewBox so the strokes scale instead of running off the edge;
// the desktop copy keeps drawing at raw pixel coordinates, exactly as it always
// has, so nothing about the signed-off desktop composition moves.
const BOARD_W = 364;
const BOARD_H = 258;
const BOARD_LINK = "M118 78 V150 H236 V180";
const BOARD_LOOP =
  "M64 44c92-30 260-16 292 26 30 40-14 122-78 150-66 30-198 24-232-26-32-46 6-122 18-150z";
/**
 * The two stickies, as pixels for desktop and as percentages of the same space
 * for mobile. One source, so the two copies cannot drift apart.
 */
const BOARD_NOTES = [
  { x: 62, y: 30, t: "Ship v2 in Q1" },
  { x: 186, y: 176, t: "Hiring plan" },
];
const NOTE_PX = { w: 112, h: 76 };
const pct = (n: { x: number; y: number }) => ({
  left: `${(n.x / BOARD_W) * 100}%`,
  top: `${(n.y / BOARD_H) * 100}%`,
  width: `${(NOTE_PX.w / BOARD_W) * 100}%`,
  height: `${(NOTE_PX.h / BOARD_H) * 100}%`,
});

/** One sticky, at whatever position the caller measures it in. */
function BoardNote({ t, style }: { t: string; style: React.CSSProperties }) {
  return (
    <div
      className="absolute grid place-items-center rounded-[3px] px-2 text-center"
      style={{
        ...style,
        background: STICKY,
        border: "1px solid #F0D96A",
        boxShadow: "0 6px 14px -8px rgba(40,30,15,0.35)",
      }}
    >
      {/* w-full so the label wraps inside the note. `place-items-center` sizes
          its child to max-content, so without this a label wider than the note
          runs straight out over the edge, which it does at phone width where
          the notes are narrower. */}
      <span className="w-full text-[11.5px] font-semibold leading-snug" style={{ color: "#4A4432" }}>
        {t}
      </span>
    </div>
  );
}

function CanvasDemo() {
  const [tool, setTool] = useState(0);
  const [allChips, setAllChips] = useState(false);
  return (
    // flex-col so the board can take the room that is actually left. It used to
    // be sized `calc(100% - 118px)`, a constant that assumed the chips sat on
    // one or two rows; on a phone they wrapped to four and the board's bottom
    // 34px was clipped away by the card.
    <div
      className={`relative flex flex-col overflow-hidden rounded-[18px] border bg-white ${CARD_CLS}`}
      style={{ borderColor: HAIR }}
    >
      <div className="flex flex-none items-center gap-2 border-b px-4 py-2.5" style={{ borderColor: HAIR }}>
        <BoardIcon className="h-[15px] w-[15px]" style={{ color: TEAL }} />
        <span className="text-[12.5px] font-bold">Q1 planning session</span>
        <span className="ml-auto flex items-center gap-1.5 text-[10.5px] font-semibold" style={{ color: MUTED }}>
          <span className="h-[6px] w-[6px] rounded-full" style={{ background: GREEN }} />
          Saved
        </span>
      </div>

      <div className="flex flex-none flex-wrap gap-1.5 px-4 py-3">
        {TOOL_CHIPS.map((t, i) => (
          <button
            key={t}
            type="button"
            onClick={() => setTool(i)}
            // Chips past the sixth are hidden on a phone until asked for. See
            // CHIPS_ON_PHONE: all nine cost four rows there, and the board is
            // what pays for them.
            className={`rounded-full border px-2.5 py-1 text-[10.5px] font-semibold transition-colors ${
              i >= CHIPS_ON_PHONE && !allChips ? "hidden sm:inline-block" : ""
            }`}
            style={
              i === tool
                ? { borderColor: TEAL, background: `${TEAL}12`, color: TEAL }
                : { borderColor: HAIR2, background: "#fff", color: MUTED }
            }
          >
            {t}
          </button>
        ))}
        {!allChips && (
          <button
            type="button"
            onClick={() => setAllChips(true)}
            className="px-1 py-1 text-[10.5px] font-semibold sm:hidden"
            style={{ color: MUTED2 }}
          >
            +{TOOL_CHIPS.length - CHIPS_ON_PHONE} more
          </button>
        )}
      </div>

      <div
        className="relative mx-4 mb-4 min-h-0 flex-1 overflow-hidden rounded-[12px] border"
        style={{
          borderColor: HAIR2,
          backgroundColor: "#FDFDFC",
          backgroundImage: "radial-gradient(#DCD9D2 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        {/* Desktop: raw pixel coordinates, exactly as this has always drawn. */}
        <div className="absolute inset-0 hidden sm:block">
          <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
            <path d={BOARD_LINK} fill="none" stroke={INK} strokeWidth={1.4} />
            <path d={BOARD_LOOP} fill="none" stroke="#EA7B1B" strokeWidth={2.2} opacity={0.7} />
          </svg>
          {BOARD_NOTES.map((n) => (
            <BoardNote key={n.t} t={n.t} style={{ left: n.x, top: n.y, width: NOTE_PX.w, height: NOTE_PX.h }} />
          ))}
        </div>

        {/* Phone: the same drawing, mapped to whatever size the board ends up.
            The viewBox lets the strokes scale rather than run off the right
            edge, and the stickies are placed as percentages of the same space
            so they land where they do on desktop. preserveAspectRatio="none"
            because the board is not the same shape at both widths, and a loop
            drawn by hand can stretch a little without anyone noticing; the
            strokes stay their true weight via non-scaling-stroke. */}
        <div className="absolute inset-0 sm:hidden">
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox={`0 0 ${BOARD_W} ${BOARD_H}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d={BOARD_LINK} fill="none" stroke={INK} strokeWidth={1.4} vectorEffect="non-scaling-stroke" />
            <path
              d={BOARD_LOOP}
              fill="none"
              stroke="#EA7B1B"
              strokeWidth={2.2}
              opacity={0.7}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          {BOARD_NOTES.map((n) => (
            <BoardNote key={n.t} t={n.t} style={pct(n)} />
          ))}
        </div>
        <span
          className="absolute right-3 top-3 rounded-full border bg-white px-2 py-[3px] font-mono text-[9.5px] font-semibold"
          style={{ borderColor: HAIR2, color: MUTED }}
        >
          79%
        </span>
        <span
          className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full border bg-white/90 px-2.5 py-1 text-[10px] font-semibold"
          style={{ borderColor: HAIR2, color: MUTED }}
        >
          <Infinite className="h-[12px] w-[12px]" style={{ color: TEAL }} />
          Infinite canvas
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 2. together
const PEOPLE = [
  { n: "Skylar Lewis", i: "SL", c: "#EA7B1B", role: "Owner", at: { x: 34, y: 26 } },
  { n: "Dana Whitfield", i: "DW", c: TEAL, role: "Can edit", at: { x: 45, y: 72 } },
  { n: "Marcus Reed", i: "MR", c: "#7A4EA8", role: "Can comment", at: { x: 76, y: 24 } },
];

function TogetherDemo() {
  const [who, setWho] = useState(1);
  return (
    <div
      className={`relative overflow-hidden rounded-[18px] border bg-white ${CARD_CLS}`}
      style={{ borderColor: HAIR }}
    >
      <div className="flex items-center gap-2 border-b px-4 py-2.5" style={{ borderColor: HAIR }}>
        <CursorsIcon className="h-[15px] w-[15px]" style={{ color: TEAL }} />
        <span className="text-[12.5px] font-bold">3 people on this board</span>
        <span className="ml-auto flex -space-x-1.5">
          {PEOPLE.map((p, i) => (
            <button
              key={p.i}
              type="button"
              onClick={() => setWho(i)}
              className="grid h-[24px] w-[24px] place-items-center rounded-full text-[9px] font-bold text-white ring-2 transition-transform"
              style={{
                background: p.c,
                // The selected avatar lifts, so the ring reads as focus rather
                // than as a different person.
                transform: i === who ? "scale(1.12)" : "scale(1)",
                // @ts-expect-error -- ring colour is a CSS variable on the ring utility
                "--tw-ring-color": i === who ? p.c : "#fff",
              }}
            >
              {p.i}
            </button>
          ))}
        </span>
      </div>

      <div
        className="relative mx-4 my-4 overflow-hidden rounded-[12px] border"
        style={{
          height: "calc(100% - 130px)",
          borderColor: HAIR2,
          backgroundColor: "#FDFDFC",
          backgroundImage: "radial-gradient(#DCD9D2 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        {/* Two stickies, so the cursors read as people working on something
            rather than as pointers on a blank grid. */}
        {[
          { x: 12, y: 20, t: "Ship v2 in Q1" },
          { x: 52, y: 48, t: "Hiring plan" },
        ].map((n) => (
          <div
            key={n.t}
            className="absolute grid place-items-center rounded-[3px] px-2 text-center"
            style={{
              left: `${n.x}%`,
              top: `${n.y}%`,
              width: 104,
              height: 66,
              background: STICKY,
              border: "1px solid #F0D96A",
              boxShadow: "0 5px 12px -8px rgba(40,30,15,0.3)",
            }}
          >
            <span className="text-[10.5px] font-semibold leading-snug" style={{ color: "#4A4432" }}>
              {n.t}
            </span>
          </div>
        ))}

        {PEOPLE.map((p, i) => (
          <div
            key={p.i}
            className="absolute z-10 transition-all duration-500 ease-out"
            style={{
              left: `${p.at.x}%`,
              top: `${p.at.y}%`,
              opacity: i === who ? 1 : 0.35,
              transform: i === who ? "scale(1)" : "scale(0.92)",
            }}
          >
            <svg viewBox="0 0 24 24" className="h-[20px] w-[20px]" style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.25))" }}>
              <path
                d="M5.5 2.5l12.4 8.1-5.2.7 3 6.2-2.5 1.2-3-6.2-3.4 3.6z"
                fill="#fff"
                stroke={INK}
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
            <span
              className="absolute left-[15px] top-[16px] whitespace-nowrap rounded-[6px] px-1.5 py-[2px] text-[9px] font-bold text-white"
              style={{ background: p.c }}
            >
              {p.n.split(" ")[0]}
            </span>
          </div>
        ))}
      </div>

      <div className="mx-4 mb-4 flex items-center gap-2 rounded-[10px] border px-3 py-2" style={{ borderColor: HAIR2, background: "#FBFAF8" }}>
        <span
          className="grid h-[22px] w-[22px] flex-none place-items-center rounded-full text-[8.5px] font-bold text-white"
          style={{ background: PEOPLE[who].c }}
        >
          {PEOPLE[who].i}
        </span>
        <span className="text-[11.5px] font-bold">{PEOPLE[who].n}</span>
        <span className="ml-auto rounded-full px-2 py-[2px] text-[10px] font-bold" style={{ background: `${PEOPLE[who].c}18`, color: PEOPLE[who].c }}>
          {PEOPLE[who].role}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 3. sharing
const BOARDS = [
  { n: "Q1 planning session", when: "2h ago", vis: "Only people I invite", by: "shared by Dana", i: "DW", c: TEAL },
  { n: "Onboarding flow map", when: "Yesterday", vis: "Anyone with the link", by: "public link", i: "SL", c: "#EA7B1B" },
  { n: "Pricing workshop", when: "3d ago", vis: "My department", by: "Operations", i: "MR", c: "#7A4EA8" },
];

const RAIL = [
  { l: "All boards", n: 3, icon: InboxIcon },
  { l: "My boards", n: 1, icon: PersonIcon },
  { l: "Shared with me", n: 2, icon: ShareIcon },
  { l: "My department", n: 1, icon: BuildingIcon },
];

function ShareDemo() {
  const [pick, setPick] = useState(0);
  return (
    <div
      className={`relative overflow-hidden rounded-[18px] border bg-white ${CARD_CLS}`}
      style={{ borderColor: HAIR }}
    >
      <div className="flex items-center gap-2 border-b px-4 py-2.5" style={{ borderColor: HAIR }}>
        <BoardIcon className="h-[15px] w-[15px]" style={{ color: TEAL }} />
        <span className="text-[12.5px] font-bold">Whiteboards</span>
        <span
          className="ml-auto flex items-center gap-1.5 rounded-[7px] border px-2 py-1 text-[10px]"
          style={{ borderColor: HAIR2, color: MUTED2 }}
        >
          <SearchIcon className="h-[11px] w-[11px]" />
          Search boards
        </span>
      </div>

      <div className="flex" style={{ height: "calc(100% - 45px)" }}>
        {/* 170 on a desktop, because at 148 "Shared with me" and "My department"
            both truncated and those two labels are the section's whole point. On a
            phone the card is only about 334 wide, where 170 would eat half of it,
            so it drops to 144: still enough for the longest label at 10.5px, and
            it leaves the board list room to stay readable. */}
        <div className="w-[158px] flex-none border-r px-2.5 py-3 sm:w-[170px]" style={{ borderColor: HAIR }}>
          {RAIL.map((r, i) => {
            const Ico = r.icon;
            return (
              <div
                key={r.l}
                className="mb-0.5 flex items-center gap-2 rounded-[7px] px-2 py-[6px] text-[10.5px]"
                style={{
                  background: i === 0 ? "#F1EFEA" : "transparent",
                  color: i === 0 ? INK : MUTED,
                  fontWeight: i === 0 ? 650 : 500,
                }}
              >
                <Ico className="h-[12px] w-[12px] flex-none" style={{ color: i === 0 ? INK : MUTED2 }} />
                <span className="truncate">{r.l}</span>
                <span className="ml-auto tabular-nums" style={{ color: MUTED2 }}>
                  {r.n}
                </span>
              </div>
            );
          })}
          <div className="mt-2 px-2 text-[8.5px] font-bold uppercase tracking-[0.1em]" style={{ color: MUTED2 }}>
            Folders
          </div>
          <div className="mt-1 flex items-center gap-2 rounded-[7px] px-2 py-[6px] text-[10.5px]" style={{ color: MUTED }}>
            <FolderIcon className="h-[12px] w-[12px] flex-none" style={{ color: MUTED2 }} />
            Unfiled
            <span className="ml-auto tabular-nums" style={{ color: MUTED2 }}>
              3
            </span>
          </div>
          <div
            className="mt-1 flex items-center gap-2 border-t px-2 pt-2 text-[10.5px]"
            style={{ borderColor: HAIR, color: MUTED }}
          >
            <TrashIcon className="h-[12px] w-[12px] flex-none" style={{ color: MUTED2 }} />
            Trash
            <span className="ml-auto tabular-nums" style={{ color: MUTED2 }}>
              0
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1 p-3">
          {BOARDS.map((b, i) => (
            <button
              key={b.n}
              type="button"
              onClick={() => setPick(i)}
              className="mb-2 flex w-full items-center gap-2.5 rounded-[10px] border px-3 py-2.5 text-left transition-all"
              style={{
                borderColor: i === pick ? TEAL : HAIR,
                background: i === pick ? `${TEAL}0A` : "#fff",
              }}
            >
              {/* Hidden on a phone. It only repeats who shared the board, which
                  the line underneath already says, and the 36px it costs is the
                  difference between a readable board name and "Q1 planni...". */}
              <span
                className="hidden h-[26px] w-[26px] flex-none place-items-center rounded-full text-[9px] font-bold text-white sm:grid"
                style={{ background: b.c }}
              >
                {b.i}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[11.5px] font-bold">{b.n}</span>
                <span className="block truncate text-[10px]" style={{ color: MUTED2 }}>
                  {b.when} · {b.by}
                </span>
              </span>
              <span
                className="flex flex-none items-center gap-1 rounded-full px-2 py-[3px] text-[9.5px] font-bold"
                style={{
                  background: b.vis === "Anyone with the link" ? "#FDF1DF" : "#F1EFEA",
                  color: b.vis === "Anyone with the link" ? AMBER : MUTED,
                }}
              >
                {b.vis === "Anyone with the link" ? (
                  <LinkIcon className="h-[10px] w-[10px]" />
                ) : b.vis === "My department" ? (
                  <BuildingIcon className="h-[10px] w-[10px]" />
                ) : (
                  <LockIcon className="h-[10px] w-[10px]" />
                )}
                {/* Icon only on a phone. At 360 the label pushed this pill off
                    the edge of the card, and the panel below already spells the
                    selected board's visibility out in full. */}
                <span className="hidden sm:inline">{b.vis}</span>
              </span>
            </button>
          ))}

          <div className="mt-1 rounded-[10px] border px-3 py-2.5" style={{ borderColor: HAIR2, background: "#FBFAF8" }}>
            <div className="text-[8.5px] font-bold uppercase tracking-[0.1em]" style={{ color: MUTED2 }}>
              Who can open it
            </div>
            <div className="mt-1.5 flex items-center gap-2 text-[11px] font-semibold">
              {BOARDS[pick].vis === "Anyone with the link" ? (
                <>
                  <LinkIcon className="h-[13px] w-[13px]" style={{ color: AMBER }} />
                  A public link. No account needed, view only.
                </>
              ) : BOARDS[pick].vis === "My department" ? (
                <>
                  <BuildingIcon className="h-[13px] w-[13px]" style={{ color: TEAL }} />
                  Everyone in Operations, at their department role.
                </>
              ) : (
                <>
                  <LockIcon className="h-[13px] w-[13px]" style={{ color: TEAL }} />
                  Only the people invited, each at their own role.
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 4. comments
const THREAD = [
  {
    who: "Skylar Lewis",
    i: "SL",
    c: "#EA7B1B",
    when: "2h ago",
    t: "Can we hold this until the Q1 pricing review?",
  },
  {
    who: "Dana Whitfield",
    i: "DW",
    c: TEAL,
    when: "1h ago",
    t: "Works for me. I have moved it out of the March block so it is not blocking the hiring plan.",
  },
  {
    who: "Marcus Reed",
    i: "MR",
    c: "#7A4EA8",
    when: "24m ago",
    t: "Agreed. I will bring the margin numbers to the review so we are deciding with them in front of us.",
  },
];

function CommentsDemo() {
  const [open, setOpen] = useState(2);
  return (
    <div
      className={`relative overflow-hidden rounded-[18px] border bg-white ${CARD_CLS}`}
      style={{ borderColor: HAIR }}
    >
      <div className="flex items-center gap-2 border-b px-4 py-2.5" style={{ borderColor: HAIR }}>
        <CommentIcon className="h-[15px] w-[15px]" style={{ color: TEAL }} />
        <span className="text-[12.5px] font-bold">Pinned to &ldquo;Pricing page&rdquo;</span>
        <span className="ml-auto rounded-full px-2 py-[2px] text-[10px] font-bold" style={{ background: `${TEAL}18`, color: TEAL }}>
          3 replies
        </span>
      </div>

      <div className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-[8.5px] font-bold uppercase tracking-[0.1em]" style={{ color: MUTED2 }}>
            Thread
          </span>
          <span className="h-px flex-1" style={{ background: HAIR }} />
        </div>

        <div className="mt-2.5">
          {THREAD.map((c, i) => (
            <button
              key={c.who}
              type="button"
              onClick={() => setOpen(i)}
              className="mb-2 flex w-full gap-2.5 rounded-[10px] border px-3 py-2.5 text-left transition-all"
              style={{
                borderColor: i <= open ? HAIR2 : HAIR,
                background: i <= open ? "#fff" : "#FBFAF8",
                opacity: i <= open ? 1 : 0.45,
              }}
            >
              <span
                className="mt-[1px] grid h-[22px] w-[22px] flex-none place-items-center rounded-full text-[8.5px] font-bold text-white"
                style={{ background: c.c }}
              >
                {c.i}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-[11px] font-bold">{c.who}</span>
                  <span className="ml-auto font-mono text-[9px]" style={{ color: MUTED2 }}>
                    {c.when}
                  </span>
                </span>
                <span className="mt-1 block text-[11px] leading-snug" style={{ color: "#3C3833" }}>
                  {c.t}
                </span>
              </span>
            </button>
          ))}
        </div>

        <div
          className="mt-1 flex items-center gap-2 rounded-[10px] border px-3 py-2 text-[10.5px]"
          style={{ borderColor: HAIR2, color: MUTED2 }}
        >
          <EyeIcon className="h-[12px] w-[12px] flex-none" style={{ color: TEAL }} />
          Nobody had to be in a meeting for any of this.
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Multi AI
const AI_ROWS: Row[] = [
  { name: "Q1 planning session", value: "18 objects", hit: true },
  { name: "Onboarding flow map", value: "42 objects", hit: true },
  { name: "Pricing workshop", value: "11 objects", hit: false, tone: "amber" },
  { name: "Open comment threads", value: "6", hit: false, tone: "red" },
];

const AI_INSIGHTS: Insight[] = [
  {
    tag: "Loose end",
    color: "#C0402B",
    source: "Open comment threads",
    text: "Four of the six open threads are on the Pricing workshop board and all four are waiting on Marcus. Two have been open eleven days.",
  },
  {
    tag: "Turn it into work",
    color: "#1F7F4C",
    source: "Q1 planning session",
    text: "Nine stickies on this board name an owner but exist nowhere else. They are decisions with nobody accountable until they become tasks in Projects.",
  },
  {
    tag: "Pattern",
    color: AI,
    source: "Pricing workshop",
    text: "This board has not moved in three days and its only editor is on leave. Sessions that stall past a week almost never restart.",
  },
];

// ---------------------------------------------------------------- the page
export default function WhiteboardsPage() {
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
              <BoardIcon className="h-[14px] w-[14px] sm:h-[19px] sm:w-[19px]" />
              Whiteboards
            </span>

            <h1 className="mt-5 text-[24px] font-extrabold leading-[1.1] tracking-tight text-brand-ink sm:mt-7 sm:text-[66px] sm:leading-[1.04]">
              Think it out together,
              <br />
              <span className="text-brand-orange">on one canvas.</span>
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-[14px] leading-relaxed text-brand-charcoal sm:mt-6 sm:text-[19px]">
              An infinite canvas for planning, brainstorming and mapping things out together, in real time. Invite your
              team at the role you choose, send a public link to anyone else, and leave pinned comments so the thinking
              carries on after everyone closes the tab.
            </p>
          </Reveal>

          <Reveal delay={0.12} className="mt-6 sm:mt-12">
            {/* The chip goes in a RELATIVE wrapper alongside the panel, not in a
                flex row above it. From sm up ReplacesChip is `absolute
                -translate-y-1/2` so it straddles the panel's top edge, and it
                needs a positioned ancestor here to straddle. Without one it
                resolved against the whole hero <section> and flew up behind the
                sticky navbar. Same wrapper as the other twelve pages. */}
            <div className="relative mx-auto max-w-[1120px]">
              <ReplacesChip names={REPLACES.whiteboards} />
              <div
                className="overflow-hidden rounded-2xl p-2 sm:rounded-[30px] sm:p-8"
                style={{ background: "linear-gradient(160deg, #E4F1F5, #D2E7ED)" }}
              >
                <WhiteboardsHeroTour />
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.2} className="mt-6 sm:mt-10">
            <div className="flex justify-center">
              <button
                type="button"
                onClick={openDemo}
                className="flex items-center justify-center gap-2 rounded-lg bg-brand-orange px-7 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-brand-orange-dark"
              >
                Request a Demo
                <Arrow className="h-[17px] w-[17px]" />
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------ 1. the canvas */}
      <Section
        id="canvas"
        eyebrow="Start a whiteboard"
        title={
          <>
            A canvas that never
            <br className="hidden sm:block" /> <span className="text-brand-orange">runs out of room.</span>
          </>
        }
        body="Open a board and start putting things down. Sticky notes, text, shapes, connectors, freehand pen, highlighter, frames and images, on a canvas that keeps going in every direction. Nothing has to fit a slide."
        points={[
          "Sticky notes, shapes and connectors for mapping how things actually join up",
          "Freehand pen and highlighter, because some thinking is not a shape",
          "Drop in images and frame sections off as the board fills up",
          "An optional module: turn Whiteboards on for the teams that want it",
        ]}
        visual={<CanvasDemo />}
        panel="linear-gradient(160deg, #E4F1F5, #D2E7ED)"
      />

      {/* ------------------------------------------------ 2. together, live */}
      <Section
        id="together"
        eyebrow="At the same time"
        title={
          <>
            Everyone on the board,
            <br className="hidden sm:block" /> <span className="text-brand-orange">at the same moment.</span>
          </>
        }
        swash="at the same moment."
        body="Whiteboards is built for live sessions. You see who else is on the board, where their cursor is, and what they are adding as they add it. Nobody is waiting for a screen share or a file."
        points={[
          "Live cursors with names, so you can follow who is working where",
          "Every change lands for everyone immediately, and saves itself",
          "Run a real planning session without leaving Multiply OS",
          "The canvas sits beside your One Page Plan, scoreboards and SOPs",
        ]}
        visual={<TogetherDemo />}
        flip
        panel="linear-gradient(160deg, #EDEAFB, #DFDAF6)"
      />

      {/* ------------------------------------------------ 3. sharing */}
      <Section
        id="sharing"
        eyebrow="Share and collaborate"
        title={
          <>
            The right people,
            <br className="hidden sm:block" /> <span className="text-brand-orange">at the right access.</span>
          </>
        }
        body="Invite teammates and give each one a role, so the people who should be editing can edit and the people who should only be reading cannot move your work. Share a public link when somebody outside needs to see it."
        points={[
          "Assign a role per person: edit, comment, or view",
          "Generate a public link for clients and anyone without an account",
          "Boards organise themselves into My boards, Shared with me and departments",
          "Folders and a searchable list, so a year of sessions stays findable",
        ]}
        visual={<ShareDemo />}
        panel="linear-gradient(160deg, #E4F1F5, #D2E7ED)"
      />

      {/* ------------------------------------------------ 4. comments */}
      <Section
        id="comments"
        eyebrow="Feedback, on the spot"
        title={
          <>
            Pin the question
            <br className="hidden sm:block" /> <span className="text-brand-orange">to the thing itself.</span>
          </>
        }
        body="Not everyone is free at once. Pinned comments attach to the object they are about, so feedback arrives with its context and the answer is waiting when the other person next opens the board."
        points={[
          "Comments pin to a sticky, a shape or a region, not to the whole board",
          "Threads keep the back and forth in one place",
          "Reply on your own time, without booking a meeting to do it",
          "The board becomes the record of the decision, not just the sketch",
        ]}
        visual={<CommentsDemo />}
        flip
        panel="linear-gradient(160deg, #EDEAFB, #DFDAF6)"
      />

      {/* ------------------------------------------------ 5. Multi AI (always last) */}
      <MultiAiWired
        heading="Your boards, read by"
        // Kept short on purpose. The swash is whitespace-nowrap so its underline
        // stays on one line, and at 29 characters this ran 15px off the right
        // edge of a 390px phone. It is also the better line: the intro is about
        // boards being quietly forgotten.
        swash="somebody who remembers."
        intro="A whiteboard is where decisions get made and then quietly forgotten. Multi AI can already see every board, every sticky and every open thread, so ask it what came out of a session and what is still hanging."
        leftLabel="The boards your team fills"
        leftColor={TEAL}
        leftIcon={RowsIcon}
        rightLabel="What Multi AI finds on them"
        prompt="What did we decide on the Q1 boards, and what is still open?"
        panelTitle="Whiteboards · All boards"
        panelMeta="3 boards"
        panelDot={TEAL}
        rows={AI_ROWS}
        insights={AI_INSIGHTS}
        aiMeta="reading 3 boards"
        footer="Multi AI reads the boards your team already made. A session that ends in stickies nobody actioned is the normal outcome; this is the part that stops it."
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
          // cannot shrink below its content pushes the whole track wider than the
          // screen. That is what made this page scroll sideways on a phone.
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
