"use client";

// Tokens, icons and the small primitives the ten acts share.
//
// The palette is lifted verbatim from public/mockup/dashboard.html, which is the
// mockup this component replaces. Keeping the exact values means the new tour
// reads as the same product as the screenshots the client has been reviewing,
// rather than as a redraw of it.
import type { CSSProperties, ReactNode } from "react";

export const T = {
  ground: "#F6F5F3",
  card: "#FFFFFF",
  hair: "#ECEAE6",
  hair2: "#E3E0DA",
  ink: "#1B1A17",
  muted: "#8A867E",
  muted2: "#A9A49B",
  body: "#54504A",
  orange: "#EA7B1B",
  orangeSoft: "#FCEEE0",
  navy: "#1F2937",
  pink: "#FBEAEA",
  pinkInk: "#D8563F",
  green: "#2BA463",
  greenSoft: "#E7F6EE",
  blue: "#3E7BC0",
  blueSoft: "#E8F0F9",
  amber: "#C9832B",
  amberSoft: "#FBF1E1",
  purple: "#5B47A8",
} as const;

// ---------------------------------------------------------------- icons
const ico = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
export type IconProps = { className?: string; style?: CSSProperties };
export type Icon = (p: IconProps) => ReactNode;

const mk = (paths: ReactNode, sw = 1.8): Icon =>
  function I({ className, style }: IconProps) {
    return (
      <svg className={className} style={style} {...ico} strokeWidth={sw}>
        {paths}
      </svg>
    );
  };

// Sidebar. The first eight are ported from the mockup so the rail is unchanged.
export const IGrid = mk(
  <>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </>,
);
export const IFrame = mk(
  <path d="M9 3H5a2 2 0 0 0-2 2v4M15 3h4a2 2 0 0 1 2 2v4M9 21H5a2 2 0 0 1-2-2v-4M15 21h4a2 2 0 0 0 2-2v-4" />,
);
export const ITarget = mk(
  <>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.4" fill="currentColor" />
  </>,
);
export const IChart = mk(
  <>
    <path d="M3 3v18h18" />
    <path d="M7 14l3-4 3 2 4-6" />
  </>,
);
export const ICal = mk(
  <>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </>,
);
export const ITree = mk(
  <>
    <rect x="9" y="3" width="6" height="5" rx="1" />
    <rect x="3" y="16" width="6" height="5" rx="1" />
    <rect x="15" y="16" width="6" height="5" rx="1" />
    <path d="M12 8v4M6 16v-2h12v2" />
  </>,
);
export const ISpark = mk(
  <>
    <path d="M12 3l1.9 4.6L18.5 9l-4.6 1.4L12 15l-1.9-4.6L5.5 9l4.6-1.4z" />
    <path d="M18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8z" />
  </>,
);
export const IChat = mk(
  <path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 8.5 8.5 0 0 1-3.8-.9L3 20l1.9-4.2A8.5 8.5 0 0 1 12 3a8.38 8.38 0 0 1 9 8.5z" />,
);
export const ICoins = mk(
  <>
    <ellipse cx="12" cy="6.2" rx="7.4" ry="3.2" />
    <path d="M4.6 6.2v5.4c0 1.8 3.3 3.2 7.4 3.2s7.4-1.4 7.4-3.2V6.2" />
    <path d="M4.6 11.6v5.4c0 1.8 3.3 3.2 7.4 3.2s7.4-1.4 7.4-3.2v-5.4" />
  </>,
);
export const IBoard = mk(
  <>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M9 4v16M15 4v16" />
  </>,
);
export const IBook = mk(
  <>
    <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H10a2 2 0 0 1 2 2v15a1.6 1.6 0 0 0-1.6-1.6H4z" />
    <path d="M20 4.5A1.5 1.5 0 0 0 18.5 3H14a2 2 0 0 0-2 2v15a1.6 1.6 0 0 1 1.6-1.6H20z" />
  </>,
);
export const IDoc = mk(
  <>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5M9 13h6M9 17h4" />
  </>,
);
export const ITools = mk(
  <>
    <path d="M4 20V9M9 20V4M14 20v-8M19 20V7" />
  </>,
  2,
);
export const IDisc = mk(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3v18M3 12h18" />
  </>,
);
export const IPen = mk(
  <>
    <path d="M3.5 20.5l4.6-1.2 11-11a2.1 2.1 0 0 0-3-3l-11 11z" />
    <path d="M14.4 5.6l3 3" />
  </>,
);
export const IWhiteboard = mk(
  <>
    <rect x="3" y="4" width="18" height="12" rx="1.8" />
    <path d="M12 16v4M8.5 20h7" />
  </>,
);
/** A monitor. The Screen Record block and the Screen capture source. */
export const IScreen = mk(
  <>
    <rect x="2.6" y="4" width="18.8" height="12.6" rx="1.8" />
    <path d="M9 20h6M12 16.6V20" />
  </>,
);
/** A camcorder body, for Screen + camera and the camera bubble. */
export const ICamera = mk(
  <>
    <rect x="2.6" y="6.4" width="12.4" height="11.2" rx="2" />
    <path d="M15 10.6l6.4-3.4v9.6L15 13.4z" />
  </>,
);
export const IPlay = mk(
  <>
    <path d="M8 5.4l10.4 6.6L8 18.6z" />
  </>,
);
/** A microphone on its stand, for the recorder's Record microphone toggle. */
export const IMic = mk(
  <>
    <rect x="9.2" y="2.6" width="5.6" height="10.4" rx="2.8" />
    <path d="M5.6 11.2a6.4 6.4 0 0 0 12.8 0M12 17.6V21M9 21h6" />
  </>,
);
export const IGear = mk(
  <>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 2.8v2.4M12 18.8v2.4M4.6 4.6l1.7 1.7M17.7 17.7l1.7 1.7M2.8 12h2.4M18.8 12h2.4M4.6 19.4l1.7-1.7M17.7 6.3l1.7-1.7" />
  </>,
);
export const IBell = mk(
  <>
    <path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6" />
    <path d="M10.3 20a2 2 0 0 0 3.4 0" />
  </>,
);
export const ILock = mk(
  <>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
    <path d="M8 10.5V7.4a4 4 0 0 1 8 0v3.1" />
  </>,
);
export const ISearch = mk(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="M16.2 16.2L21 21" />
  </>,
);
export const IPlus = mk(<path d="M12 5v14M5 12h14" />, 2.2);
export const ICheck = mk(<path d="M4.5 12.5l5 5 10-11" />, 2.4);
export const IPerson = mk(
  <>
    <circle cx="12" cy="8" r="3.4" />
    <path d="M5 20c0-3.4 3.1-5.6 7-5.6s7 2.2 7 5.6" />
  </>,
);
export const IPersonPlus = mk(
  <>
    <circle cx="10" cy="8" r="3.2" />
    <path d="M3.8 19c0-3 2.8-5 6.2-5 1 0 2 .2 2.8.5" />
    <path d="M17.4 14.4v5.2M14.8 17h5.2" />
  </>,
);
export const IDownload = mk(
  <>
    <path d="M12 4v11M7.5 11l4.5 4.5L16.5 11" />
    <path d="M4.5 20h15" />
  </>,
);
export const ISend = mk(<path d="M4 12l16-8-6 16-2.6-6.2z" />);
export const IEye = mk(
  <>
    <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="3" />
  </>,
);
export const IQr = mk(
  <>
    <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1" />
    <rect x="14" y="3.5" width="6.5" height="6.5" rx="1" />
    <rect x="3.5" y="14" width="6.5" height="6.5" rx="1" />
    <path d="M14 14h2.5v2.5H14zM18 18h2.5v2.5H18zM14 20.5h2M20.5 14v2" />
  </>,
);
export const IFlag = mk(
  <>
    <path d="M5 21V4.5h9.5l-.9 3.2H20l-1.2 4.4H8.6" />
    <path d="M5 4.5h3.6" />
  </>,
);
export const IClock = mk(
  <>
    <circle cx="12" cy="12" r="8.6" />
    <path d="M12 7.4V12l3.2 2.2" />
  </>,
);
export const IDrag = mk(
  <>
    <circle cx="9" cy="6" r="1.3" fill="currentColor" />
    <circle cx="15" cy="6" r="1.3" fill="currentColor" />
    <circle cx="9" cy="12" r="1.3" fill="currentColor" />
    <circle cx="15" cy="12" r="1.3" fill="currentColor" />
    <circle cx="9" cy="18" r="1.3" fill="currentColor" />
    <circle cx="15" cy="18" r="1.3" fill="currentColor" />
  </>,
);
export const IShield = mk(<path d="M12 3l7.5 2.6v5.6c0 4.4-3.1 8.2-7.5 9.6-4.4-1.4-7.5-5.2-7.5-9.6V5.6z" />);
export const IChevron = mk(<path d="M9 5l7 7-7 7" />, 2);
export const IUpDown = mk(<path d="M8 9.5L12 5.5l4 4M8 14.5l4 4 4-4" />, 1.9);
// The two Multi AI coach marks, matching AiCoachHeroTour: the Assistant is the
// bot, the Strategic Coach is the compass.
export const IBot = mk(
  <>
    <rect x="4" y="7.4" width="16" height="11.2" rx="2.6" />
    <path d="M12 3.4v4M8.8 12.2v1.4M15.2 12.2v1.4" />
  </>,
);
export const ICompass = mk(
  <>
    <circle cx="12" cy="12" r="8.4" />
    <path d="M15.2 8.8l-1.8 4.6-4.6 1.8 1.8-4.6z" />
  </>,
);

// ---------------------------------------------------------------- primitives
export function Card({
  children,
  className = "",
  style,
}: {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`rounded-[12px] border bg-white ${className}`}
      style={{ borderColor: T.hair, ...style }}
    >
      {children}
    </div>
  );
}

/** The page title block every screen in the product opens with. */
export function PageHead({
  title,
  sub,
  right,
}: {
  title: string;
  sub?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex flex-none items-start gap-3">
      <div className="min-w-0">
        <h2 className="text-[25px] font-[780] leading-none tracking-[-0.03em]" style={{ color: T.ink }}>
          {title}
        </h2>
        {sub && (
          <div className="mt-[3px] text-[13px]" style={{ color: T.muted }}>
            {sub}
          </div>
        )}
      </div>
      {right && <div className="ml-auto flex flex-none items-center gap-2">{right}</div>}
    </div>
  );
}

export function BtnDark({ children, hot }: { children: ReactNode; hot?: boolean }) {
  return (
    <span
      className="inline-flex flex-none items-center gap-[7px] rounded-[8px] px-[13px] py-2 text-[12.5px] font-semibold text-white transition-shadow"
      style={{
        background: T.navy,
        boxShadow: hot ? "0 0 0 3px rgba(234,123,27,0.35)" : undefined,
      }}
    >
      {children}
    </span>
  );
}

export function BtnOrange({ children, hot }: { children: ReactNode; hot?: boolean }) {
  return (
    <span
      className="inline-flex flex-none items-center gap-[7px] rounded-[8px] px-[13px] py-2 text-[12.5px] font-[650] text-white transition-shadow"
      style={{
        background: T.orange,
        boxShadow: hot ? "0 0 0 3px rgba(234,123,27,0.35)" : undefined,
      }}
    >
      {children}
    </span>
  );
}

export function Ghost({ children, hot }: { children: ReactNode; hot?: boolean }) {
  return (
    <span
      className="inline-flex h-[32px] flex-none items-center gap-[7px] rounded-[8px] border bg-white px-3 text-[12.5px] font-[550] transition-colors"
      style={{
        borderColor: T.hair2,
        color: "#44403A",
        background: hot ? "#F6F3EE" : "#fff",
      }}
    >
      {children}
    </span>
  );
}

/** The grey/white segmented control the product uses for view switches. */
export function Seg({ items, on }: { items: string[]; on: number }) {
  return (
    <span className="inline-flex rounded-[8px] p-[3px]" style={{ background: "#EDEAE4" }}>
      {items.map((s, i) => (
        <span
          key={s}
          className="rounded-[6px] px-3 py-[5px] text-[12px] transition-all"
          style={
            i === on
              ? { background: "#fff", color: T.ink, fontWeight: 600, boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }
              : { color: T.muted }
          }
        >
          {s}
        </span>
      ))}
    </span>
  );
}

export function Pill({
  children,
  bg,
  fg,
}: {
  children: ReactNode;
  bg: string;
  fg: string;
}) {
  return (
    <span
      className="inline-flex flex-none items-center gap-[5px] rounded-full px-[9px] py-[3px] text-[10.5px] font-[650]"
      style={{ background: bg, color: fg }}
    >
      {children}
    </span>
  );
}

export function StatusPill({ kind }: { kind: "ok" | "risk" | "wait" | "done" }) {
  const map = {
    ok: { bg: T.greenSoft, fg: "#1F7F4C", dot: T.green, label: "On Track" },
    risk: { bg: T.pink, fg: T.pinkInk, dot: T.pinkInk, label: "At Risk" },
    wait: { bg: T.amberSoft, fg: T.amber, dot: T.amber, label: "Waiting" },
    done: { bg: T.greenSoft, fg: "#1F7F4C", dot: T.green, label: "Signed" },
  }[kind];
  return (
    <Pill bg={map.bg} fg={map.fg}>
      <span className="h-[5px] w-[5px] rounded-full" style={{ background: map.dot }} />
      {map.label}
    </Pill>
  );
}

/** Round initials chip. `sq` switches it to the squared app-icon shape. */
export function Av({
  n,
  size = 22,
  bg = T.navy,
  sq,
}: {
  n: string;
  size?: number;
  bg?: string;
  sq?: boolean;
}) {
  return (
    <span
      className="grid flex-none place-items-center font-bold text-white"
      style={{
        width: size,
        height: size,
        borderRadius: sq ? size * 0.26 : "50%",
        background: bg,
        fontSize: size * 0.42,
      }}
    >
      {n}
    </span>
  );
}

/** A checkbox that animates its tick, used by four of the acts. */
export function Tick({ on, size = 15 }: { on: boolean; size?: number }) {
  return (
    <span
      className="grid flex-none place-items-center rounded-[4px] border transition-all duration-[260ms]"
      style={{
        width: size,
        height: size,
        borderColor: on ? T.green : T.hair2,
        background: on ? T.green : "#fff",
      }}
    >
      <ICheck
        className="text-white transition-all duration-[220ms]"
        style={{
          width: size * 0.72,
          height: size * 0.72,
          opacity: on ? 1 : 0,
          transform: on ? "scale(1)" : "scale(0.5)",
        }}
      />
    </span>
  );
}

/** The caret that hangs off a typed field while it is being filled in. */
export function Caret({ on }: { on: boolean }) {
  return (
    <span
      className="ml-[1px] inline-block h-[1.05em] w-[1.5px] align-[-0.18em]"
      style={{ background: on ? T.ink : "transparent" }}
    />
  );
}
