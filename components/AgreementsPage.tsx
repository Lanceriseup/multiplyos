"use client";

// Feature page: Agreements.
//
// The product supplies the argument in one sentence, and says it twice:
//
//     "An agreement is a form with a signature on it."
//
// So this page is not a cheaper DocuSign. It is the claim that a signed contract
// is a live object in the same system as your projects, CRM, and scoreboards,
// because the document was built out of the Forms engine in the first place.
// Sections run in that order of strength:
//
//   2. it is a form        the scaffold, and everything a form can ask
//   3. signing it          draw or type, consent, the executed copy
//   4. tracking it         what is signed, and what is waiting on whom
//   5. and then it acts    a signed contract opening a task, a CRM record, a row
//
// See docs/agreements-feature-notes.md. Two rules from it are load-bearing:
// the populated tracking list is INFERRED rather than screenshotted, and the page
// names no statute, because the product names none.
import { motion } from "framer-motion";
import { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CTA from "./CTA";
import Reveal from "./Reveal";
import AgreementsHeroTour from "./AgreementsHeroTour";
import MultiAiWired from "./MultiAiWired";
import type { Row, Insight } from "./MultiAiWired";
import { useDemo } from "./DemoModal";

// ---------------------------------------------------------------- tokens
const GREEN = "#2BA463";
const AMBER = "#C9832B";
const INK = "#1F5F7A";
const AI = "#4B3CC4";
const SHEETS = "#188038";
const colTransition = { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const };

// Written out in full because Tailwind scans source for literal class names.
const CARD_CLS = "h-[380px] sm:h-[430px]";

// ---------------------------------------------------------------- icons
const ico = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
type IconProps = { className?: string; style?: React.CSSProperties };

const SignDoc = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={1.7}>
    <path d="M19.4 11.2V5.2a1.8 1.8 0 0 0-1.8-1.8H6.4a1.8 1.8 0 0 0-1.8 1.8v13.6a1.8 1.8 0 0 0 1.8 1.8h5" />
    <path d="M8.4 7.8h7.2M8.4 11.4h4.4" />
    <path d="M12.8 20.6l1-3.4 5.4-5.4a1.6 1.6 0 0 1 2.3 2.3l-5.4 5.4z" />
  </svg>
);
const PenNib = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M4 20.2l.6-4L16.2 4.6a2 2 0 0 1 2.8 0l.4.4a2 2 0 0 1 0 2.8L8 19.6z" />
  </svg>
);
const Tick = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2.4}>
    <path d="M5 12l5 5L20 7" />
  </svg>
);
const Arrow = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2.4}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
const Download = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 4.6v11M7.4 11l4.6 4.6L16.6 11M4.4 19.4h15.2" />
  </svg>
);
const ClockIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="12" cy="12" r="8.4" />
    <path d="M12 7.4V12l3 1.8" />
  </svg>
);
const ShieldCheck = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 3.4l7.4 2.6v5.6c0 4.2-3 7.6-7.4 9-4.4-1.4-7.4-4.8-7.4-9V6z" />
    <path d="M8.8 12l2.2 2.2 4.2-4.4" />
  </svg>
);
const People = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="9.2" cy="8.4" r="3" />
    <path d="M3.6 18.6c0-2.8 2.5-4.6 5.6-4.6s5.6 1.8 5.6 4.6" />
    <path d="M16.2 6.2a3 3 0 0 1 0 5.6M17.4 14.6c1.9.6 3.2 1.9 3.2 4" />
  </svg>
);
const MailIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="3.4" y="5.6" width="17.2" height="12.8" rx="2" />
    <path d="M3.8 7l8.2 5.6L20.2 7" />
  </svg>
);
const Cal = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <rect x="3.6" y="5.4" width="16.8" height="15" rx="2.2" />
    <path d="M3.6 10h16.8M8.4 3.4v3.6M15.6 3.4v3.6" />
  </svg>
);
const Heading = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2}>
    <path d="M5.4 5v14M13 5v14M5.4 12H13M16.6 19v-6.4l2.6 1.6" />
  </svg>
);
const Para = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2}>
    <path d="M4.4 6.6h15.2M4.4 12h15.2M4.4 17.4h9" />
  </svg>
);
const Caret = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2.2}>
    <path d="M6.4 9.6l5.6 5.2 5.6-5.2" />
  </svg>
);
const Clip = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M16.6 8.4l-6.8 6.8a2.6 2.6 0 0 0 3.6 3.6l6.4-6.4a4.8 4.8 0 0 0-6.8-6.8L6 12.4a7 7 0 0 0 9.8 9.8" />
  </svg>
);
const BoardIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="3.4" y="4.4" width="17.2" height="15.2" rx="2.2" />
    <path d="M9.2 4.4v15.2M15 4.4v15.2" />
  </svg>
);
const SheetIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <rect x="4.4" y="3.4" width="15.2" height="17.2" rx="2" />
    <path d="M4.4 9h15.2M4.4 14.6h15.2M10.2 3.4v17.2" />
  </svg>
);
const RowsIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.2" />
    <path d="M3.5 9.5h17M3.5 14.5h17" />
  </svg>
);
const AlertIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2}>
    <path d="M12 4.2l8.4 15.2H3.6z" />
    <path d="M12 10v3.6M12 16.6v.1" />
  </svg>
);

// ---------------------------------------------------------------- 2. it is a form
// The differentiator, made playable. The scaffold is fixed; the extras are what a
// signature vendor cannot offer, because it only knows how to drop boxes on a PDF.
type Extra = "dropdown" | "upload" | "logic" | "number";

const EXTRAS: { key: Extra; label: string; kind: string; icon: (p: IconProps) => React.JSX.Element }[] = [
  { key: "dropdown", label: "Which plan are you signing for?", kind: "Dropdown", icon: Caret },
  { key: "number", label: "Agreed monthly retainer", kind: "Currency", icon: Para },
  { key: "upload", label: "Certificate of insurance", kind: "File upload", icon: Clip },
  { key: "logic", label: "Only if they picked Enterprise", kind: "Conditional logic", icon: ShieldCheck },
];

const SCAFFOLD = [
  { label: "Agreement terms", kind: "Section heading", icon: Heading },
  { label: "Full legal name", kind: "Full name", icon: People, req: true },
  { label: "Email address", kind: "Email", icon: MailIcon, req: true },
  { label: "Date signed", kind: "Date", icon: Cal, req: true },
  { label: "Signature", kind: "Signature", icon: PenNib, req: true, locked: true },
];

function FormDemo() {
  const [on, setOn] = useState<Extra[]>(["dropdown", "upload"]);
  const toggle = (k: Extra) =>
    setOn((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));
  const extras = EXTRAS.filter((e) => on.includes(e.key));

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${CARD_CLS}`}>
      <div className="flex flex-none items-center gap-2.5 border-b border-[#F1EEE9] px-3.5 py-2.5">
        <span className="min-w-0 flex-1">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-brand-gray">Agreement</p>
          <h4 className="truncate text-[13.5px] font-extrabold tracking-tight">Client Services Agreement</h4>
        </span>
        <span
          className="flex flex-none items-center gap-1 whitespace-nowrap rounded-full px-2 py-[3px] text-[9px] font-bold"
          style={{ background: "#FFF1E2", color: "#C9650F" }}
        >
          <PenNib className="h-2.5 w-2.5" />
          Signature always included
        </span>
      </div>

      <div className="flex-none border-b border-[#F1EEE9] px-3.5 py-2.5">
        <p className="mb-1.5 text-[9.5px] text-brand-gray">
          Add anything a form can ask <span className="text-[#C4BFB6]">·</span> {on.length} of 4 added
        </p>
        <div className="scrollbar-none flex flex-nowrap gap-1 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-x-visible sm:pb-0">
          {EXTRAS.map((e) => {
            const Icon = e.icon;
            const active = on.includes(e.key);
            return (
              <button
                key={e.key}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(e.key)}
                className={`flex flex-none items-center gap-1 whitespace-nowrap rounded-full border px-2 py-1 text-[9.5px] transition-colors ${
                  active
                    ? "border-brand-orange/55 bg-[#FFF6EC] font-semibold text-brand-orange-dark"
                    : "border-[#E6E2DB] font-medium text-brand-charcoal hover:bg-[#FAF9F7]"
                }`}
              >
                <Icon className="h-2.5 w-2.5" />
                {e.kind}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative min-h-0 flex-1 bg-[#FAF9F7]">
        <div className="h-full space-y-1.5 overflow-y-auto px-3.5 py-3">
          {SCAFFOLD.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="flex items-center gap-2.5 rounded-lg border bg-white px-2.5 py-2"
                style={s.locked ? { borderColor: "rgba(234,123,27,0.4)", background: "#FFFCF7" } : { borderColor: "#EBE7E0" }}
              >
                <span
                  className="grid h-[22px] w-[22px] flex-none place-items-center rounded-md"
                  style={s.locked ? { background: "#C9650F", color: "#fff" } : { background: "#F4F1EC", color: "#4A4744" }}
                >
                  <Icon className="h-3 w-3" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[10.5px] font-semibold leading-tight">
                    {s.label}
                    {s.req && <span style={{ color: "#D8563F" }}> *</span>}
                  </span>
                  <span className="text-[8.5px] text-brand-gray">{s.kind}</span>
                </span>
              </div>
            );
          })}

          {extras.map((e) => {
            const Icon = e.icon;
            return (
              <div
                key={e.key}
                className="sop-pop flex items-center gap-2.5 rounded-lg border bg-white px-2.5 py-2"
                style={{ borderColor: "rgba(75,60,196,0.3)" }}
              >
                <span className="grid h-[22px] w-[22px] flex-none place-items-center rounded-md text-white" style={{ background: AI }}>
                  <Icon className="h-3 w-3" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[10.5px] font-semibold leading-tight">{e.label}</span>
                  <span className="text-[8.5px]" style={{ color: AI }}>{e.kind}</span>
                </span>
              </div>
            );
          })}
        </div>
        {extras.length > 1 && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-7 bg-gradient-to-t from-[#FAF9F7] to-transparent"
          />
        )}
      </div>

      <p className="flex-none border-t border-[#F1EEE9] px-3.5 py-2 text-[10px] leading-snug text-brand-gray">
        Twenty-eight field types are available here. A tool that drops boxes onto a PDF has none of
        them.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- 3. signing
const THEMES = [
  { l: "Clean", a: "#4F46E5", bg: "#FFFFFF" },
  { l: "Midnight", a: "#6366F1", bg: "#12121A" },
  { l: "Ocean", a: "#06B6D4", bg: "#EAF6FB" },
  { l: "Forest", a: "#16A34A", bg: "#EEF7EF" },
  { l: "Sunset", a: "#EA7B1B", bg: "#FFF4EA" },
  { l: "Berry", a: "#DB2777", bg: "#FDF0F6" },
];

function SignDemo() {
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [consent, setConsent] = useState(false);
  const [theme, setTheme] = useState(4); // Sunset, so the accent is visibly not the default
  const t = THEMES[theme];

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${CARD_CLS}`}>
      <div className="flex flex-none items-center gap-2 border-b border-[#F1EEE9] px-3.5 py-2.5">
        <b className="flex-none text-[12.5px]">What the signer sees</b>
        <span className="ml-auto flex flex-none items-center gap-1">
          {THEMES.map((x, i) => (
            <button
              key={x.l}
              type="button"
              aria-label={x.l}
              aria-pressed={theme === i}
              onClick={() => setTheme(i)}
              className={`h-[15px] w-[15px] rounded-full border transition-transform ${
                theme === i ? "scale-115 border-brand-ink" : "border-black/10 hover:scale-110"
              }`}
              style={{ background: x.a }}
            />
          ))}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-4 py-3" style={{ background: t.bg }}>
        <div
          className="mx-auto max-w-[330px] rounded-lg border px-4 py-3"
          style={{
            background: theme === 1 ? "#1C1C28" : "#fff",
            borderColor: theme === 1 ? "#2E2E3E" : "#E6E2DB",
          }}
        >
          <p className="text-[10px] font-semibold" style={{ color: theme === 1 ? "#E8E6F0" : "#15120E" }}>
            Signature <span style={{ color: "#E8574A" }}>*</span>
          </p>

          <div className="mt-1 flex w-fit items-center gap-0.5 rounded-lg p-0.5" style={{ background: theme === 1 ? "#26263A" : "#F1EEE9" }}>
            {(["draw", "type"] as const).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => setMode(m)}
                className={`rounded-[6px] px-2.5 py-[3px] text-[9.5px] capitalize transition-colors ${
                  mode === m ? "font-semibold shadow-sm" : "font-medium"
                }`}
                style={
                  mode === m
                    ? { background: theme === 1 ? "#3A3A52" : "#fff", color: theme === 1 ? "#fff" : "#15120E" }
                    : { color: theme === 1 ? "#A5A3B8" : "#4A4744" }
                }
              >
                {m}
              </button>
            ))}
          </div>

          <div
            className="relative mt-1.5 h-[58px] overflow-hidden rounded-md border border-dashed"
            style={{ borderColor: theme === 1 ? "#3A3A52" : "#D8D2C8", background: theme === 1 ? "#20202E" : "#FBFAF8" }}
          >
            <span className="absolute inset-x-5 bottom-[11px] h-px" style={{ background: theme === 1 ? "#3A3A52" : "#DDD8CF" }} />
            {mode === "draw" ? (
              <svg viewBox="0 0 240 44" className="absolute inset-x-0 bottom-[7px] mx-auto h-[34px] w-[200px]"
                fill="none" stroke={theme === 1 ? "#E8E6F0" : "#1B2A44"} strokeWidth={2} strokeLinecap="round">
                <path d="M16 30c9-15 15-17 18-10s-3 17 3 17 10-19 17-19 5 12 12 12 11-14 18-14 7 10 14 10 12-7 19-10" />
              </svg>
            ) : (
              <span
                className="absolute inset-x-0 bottom-[15px] text-center text-[19px]"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic", color: theme === 1 ? "#E8E6F0" : "#1B2A44" }}
              >
                Jordan Rivera
              </span>
            )}
          </div>

          <button
            type="button"
            aria-pressed={consent}
            onClick={() => setConsent((c) => !c)}
            className="mt-2.5 flex w-full items-start gap-2 rounded-lg border px-2 py-1.5 text-left transition-colors"
            style={
              consent
                ? { background: theme === 1 ? "#17301F" : "#F2FBF6", borderColor: theme === 1 ? "#2C5A3A" : "#BFE5CD" }
                : { background: theme === 1 ? "#20202E" : "#F7F5F1", borderColor: theme === 1 ? "#3A3A52" : "#E6E2DB" }
            }
          >
            <span
              className="mt-px grid h-3 w-3 flex-none place-items-center rounded-[3px] transition-colors"
              style={consent ? { background: GREEN, color: "#fff" } : { border: "1.5px solid #C9C2B6", color: "transparent" }}
            >
              <Tick className="h-2 w-2" />
            </span>
            <span className="min-w-0">
              <span className="block text-[9px] leading-snug" style={{ color: theme === 1 ? "#C8C6D8" : "#4A4744" }}>
                I agree to use electronic records and signatures, and that my electronic signature is
                legally binding. <span style={{ color: "#E8574A" }}>*</span>
              </span>
              <span className="mt-0.5 block text-[8.5px] font-semibold underline" style={{ color: t.a }}>
                View full disclosure
              </span>
            </span>
          </button>

          <div className="mt-2 flex justify-end">
            <span
              className="rounded-md px-3 py-1.5 text-[10px] font-semibold text-white transition-colors"
              style={{ background: consent ? t.a : "#B7B2AA" }}
            >
              Sign and submit
            </span>
          </div>
        </div>
      </div>

      <p className="flex-none border-t border-[#F1EEE9] px-3.5 py-2 text-[10px] leading-snug text-brand-gray">
        {consent
          ? "Consent is collected separately from the signature, and it is required."
          : "Until that box is ticked, Sign and submit does nothing. That is deliberate."}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- 4. tracking
// The populated list is inferred, not screenshotted. See the notes, section 2.
type Deal = { name: string; who: string; when: string; state: "signed" | "them" | "you" };

const DEALS: Deal[] = [
  { name: "Client Services Agreement", who: "Jordan Rivera", when: "Aug 22", state: "signed" },
  { name: "Mutual NDA", who: "Priya Nair", when: "Aug 18", state: "signed" },
  { name: "Vendor Terms 2026", who: "waiting on you", when: "sent Aug 21", state: "you" },
  { name: "Policy Acknowledgment", who: "Kath Nakamura", when: "sent Aug 20", state: "them" },
  { name: "Contractor Agreement", who: "Marcus Hale", when: "Aug 14", state: "signed" },
];

const STATE_META = {
  signed: { label: "Signed", color: GREEN, bg: "#EAF7F0" },
  them: { label: "Awaiting them", color: AMBER, bg: "#FDF1DF" },
  you: { label: "Awaiting you", color: INK, bg: "#E6F0F5" },
} as const;

type Filter = "all" | "signed" | "open";

function TrackDemo() {
  const [f, setF] = useState<Filter>("all");
  const rows = DEALS.filter((d) =>
    f === "all" ? true : f === "signed" ? d.state === "signed" : d.state !== "signed",
  );
  const signed = DEALS.filter((d) => d.state === "signed").length;

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${CARD_CLS}`}>
      <div className="flex flex-none items-center gap-2 border-b border-[#F1EEE9] px-3.5 py-2.5">
        <span className="flex items-center gap-0.5 rounded-lg bg-[#F1EEE9] p-0.5">
          {([
            { k: "all", l: `All ${DEALS.length}` },
            { k: "signed", l: `Signed ${signed}` },
            { k: "open", l: `Open ${DEALS.length - signed}` },
          ] as const).map(({ k, l }) => (
            <button
              key={k}
              type="button"
              aria-pressed={f === k}
              onClick={() => setF(k)}
              className={`whitespace-nowrap rounded-[7px] px-2.5 py-[5px] text-[10px] transition-colors ${
                f === k ? "bg-brand-ink font-semibold text-white" : "font-medium text-brand-charcoal"
              }`}
            >
              {l}
            </button>
          ))}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {rows.map((d) => {
          const m = STATE_META[d.state];
          return (
            <div key={d.name} className="flex items-center gap-2.5 border-b border-[#F5F2ED] px-3.5 py-[10px]">
              <span
                className="grid h-[26px] w-[26px] flex-none place-items-center rounded-lg"
                style={{ background: m.bg, color: m.color }}
              >
                <SignDoc className="h-[14px] w-[14px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[11.5px] font-bold leading-tight">{d.name}</span>
                <span className="text-[9.5px] text-brand-gray">
                  {d.who} <span className="text-[#C4BFB6]">·</span> {d.when}
                </span>
              </span>
              <span
                className="hidden flex-none items-center gap-1 whitespace-nowrap rounded-full px-2 py-[3px] text-[9px] font-bold min-[400px]:flex"
                style={{ background: m.bg, color: m.color }}
              >
                {d.state === "signed" ? <Tick className="h-2.5 w-2.5" /> : <ClockIcon className="h-2.5 w-2.5" />}
                {m.label}
              </span>
              <span className="w-[54px] flex-none text-right">
                {d.state === "signed" ? (
                  <span
                    className="inline-flex items-center gap-1 rounded-md border border-[#E6E2DB] px-1.5 py-1 text-[9px] font-semibold"
                    style={{ color: INK }}
                  >
                    <Download className="h-2.5 w-2.5" />
                    PDF
                  </span>
                ) : d.state === "you" ? (
                  <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[9px] font-bold text-white" style={{ background: INK }}>
                    <PenNib className="h-2.5 w-2.5" />
                    Sign
                  </span>
                ) : (
                  <span className="text-[9px] text-[#C4BFB6]">&mdash;</span>
                )}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex-none space-y-1.5 bg-[#FAF9F7] px-3.5 py-2.5">
        <p className="flex items-start gap-2 text-[10px] leading-snug text-brand-gray">
          <PenNib className="mt-px h-[11px] w-[11px] flex-none" style={{ color: INK }} />
          <span>
            <b className="font-semibold text-brand-charcoal">One is waiting on you.</b> Sign it here
            rather than hunting for the email it arrived in.
          </span>
        </p>
        <p className="flex items-start gap-2 text-[10px] leading-snug text-brand-gray">
          <MailIcon className="mt-px h-[11px] w-[11px] flex-none" style={{ color: AMBER }} />
          The countersigned copy goes to the signer&rsquo;s email, and the executed copy stays here.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 5. and then it acts
type Dest = "task" | "crm" | "sheet";

const DESTS: { key: Dest; label: string; sub: string; color: string; icon: (p: IconProps) => React.JSX.Element }[] = [
  { key: "task", label: "Open a task", sub: "Kick off onboarding", color: "#5B47A8", icon: BoardIcon },
  { key: "crm", label: "Create a contact", sub: "In your CRM", color: "#2C6BA6", icon: People },
  { key: "sheet", label: "Add a row", sub: "Google Sheets", color: SHEETS, icon: SheetIcon },
];

function ActsDemo() {
  const [on, setOn] = useState<Dest[]>(["task", "crm"]);
  const toggle = (k: Dest) =>
    setOn((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_50px_-28px_rgba(40,30,15,0.4)] ${CARD_CLS}`}>
      <div className="flex flex-none items-center gap-2.5 border-b border-[#F1EEE9] bg-[#FAF9F7] px-3.5 py-2.5">
        <span className="grid h-[26px] w-[26px] flex-none place-items-center rounded-lg text-white" style={{ background: GREEN }}>
          <Tick className="h-3.5 w-3.5" />
        </span>
        <span className="min-w-0 flex-1">
          <p className="truncate text-[11.5px] font-bold leading-tight">
            Jordan Rivera signed Client Services Agreement
          </p>
          <p className="text-[9.5px] text-brand-gray">Just now &middot; Enterprise plan &middot; retainer 4,500</p>
        </span>
      </div>

      <div className="flex-none border-b border-[#F1EEE9] px-3.5 py-2.5">
        <p className="mb-1.5 text-[9.5px] text-brand-gray">Because it is a form, it can also</p>
        <div className="grid grid-cols-3 gap-1.5">
          {DESTS.map((d) => {
            const Icon = d.icon;
            const active = on.includes(d.key);
            return (
              <button
                key={d.key}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(d.key)}
                className={`flex flex-col items-start gap-1 rounded-lg border px-2 py-1.5 text-left transition-colors ${
                  active ? "border-transparent bg-[#F7F5F1]" : "border-[#E6E2DB] hover:bg-[#FAF9F7]"
                }`}
                style={active ? { boxShadow: `inset 0 0 0 1.5px ${d.color}44` } : undefined}
              >
                <span
                  className="grid h-[20px] w-[20px] place-items-center rounded-md"
                  style={active ? { background: d.color, color: "#fff" } : { background: "#F1EEE9", color: "#8A857D" }}
                >
                  <Icon className="h-2.5 w-2.5" />
                </span>
                <span className="block truncate text-[9.5px] font-semibold leading-tight">{d.label}</span>
                <span className="block truncate text-[8px] text-brand-gray">{d.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto bg-[#FAF9F7] px-3.5 py-3">
        {on.length === 0 && (
          <p className="pt-10 text-center text-[10.5px] leading-relaxed text-brand-gray">
            Nothing switched on, so the contract is filed and that is the end of it.
            <br />
            Which is everything a signature vendor can offer.
          </p>
        )}

        {on.includes("task") && (
          <div className="sop-view rounded-lg border border-[#EBE7E0] bg-white p-2.5">
            <p className="mb-1.5 flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.12em]" style={{ color: "#5B47A8" }}>
              <BoardIcon className="h-2.5 w-2.5" />
              Projects
            </p>
            <div className="flex items-start gap-2">
              <span className="mt-px h-[15px] w-[15px] flex-none rounded-[4px] border-[1.5px] border-[#D5D0C7]" />
              <span className="min-w-0 flex-1">
                <p className="text-[10.5px] font-semibold leading-tight">
                  Start Enterprise onboarding for Jordan Rivera
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[9px] text-brand-gray">
                  <span className="rounded-full bg-[#EDEAF7] px-1.5 py-px font-semibold" style={{ color: "#5B47A8" }}>
                    Client Onboarding
                  </span>
                  <span className="rounded-full bg-[#F1EEE9] px-1.5 py-px font-semibold text-brand-charcoal">Skylar L</span>
                  due Monday
                </p>
              </span>
            </div>
            <p className="mt-1.5 text-[9px] leading-snug text-brand-gray">
              The plan they chose set the project. Signing was the trigger.
            </p>
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
                JR
              </span>
              <span className="min-w-0 flex-1">
                <p className="truncate text-[10.5px] font-semibold leading-tight">Jordan Rivera</p>
                <p className="text-[9px] text-brand-gray">
                  Contact created &middot; stage: Signed &middot; retainer 4,500
                </p>
              </span>
            </div>
          </div>
        )}

        {on.includes("sheet") && (
          <div className="sop-view overflow-hidden rounded-lg border border-[#EBE7E0] bg-white">
            <p className="flex items-center gap-1.5 border-b border-[#F1EEE9] px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-[0.12em]" style={{ color: SHEETS }}>
              <SheetIcon className="h-2.5 w-2.5" />
              Signed agreements
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[9px]">
                <thead>
                  <tr className="bg-[#F7F5F1] text-brand-gray">
                    {["Signed", "Signer", "Plan", "Retainer"].map((h) => (
                      <th key={h} className="whitespace-nowrap px-2 py-1 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-brand-charcoal">
                  <tr className="border-t border-[#F5F2ED]">
                    {["8/18", "Priya Nair", "Standard", "1,800"].map((c) => (
                      <td key={c} className="whitespace-nowrap px-2 py-1">{c}</td>
                    ))}
                  </tr>
                  <tr className="border-t border-[#F5F2ED] tour-landed">
                    {["8/22", "Jordan Rivera", "Enterprise", "4,500"].map((c) => (
                      <td key={c} className="whitespace-nowrap px-2 py-1 font-semibold text-brand-ink">{c}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <p className="flex-none border-t border-[#F1EEE9] px-3.5 py-2 text-[10px] leading-snug text-brand-gray">
        A signature vendor does not own your projects or your CRM, so it cannot do any of this.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- 6. Multi AI
const AI_ROWS: Row[] = [
  { name: "Vendor Terms 2026", value: "waiting on you", hit: false, tone: "amber" },
  { name: "Policy Acknowledgment", value: "6 of 9 signed", hit: false },
  { name: "Contractor Agreement", value: "expires in 21d", hit: false, tone: "red" },
];

const AI_INSIGHTS: Insight[] = [
  {
    tag: "Blocked",
    color: AMBER,
    source: "Vendor Terms 2026",
    text: "This one has been waiting on your signature for six days, and the vendor start date in it is next Monday. You are the hold-up on your own contract.",
  },
  {
    tag: "Gap",
    color: AI,
    source: "Policy Acknowledgment",
    text: "Six of nine people have signed. The three who have not are all in Operations, all hired in the last month, and none of them opened the link.",
  },
  {
    tag: "Expiring",
    color: "#D8563F",
    source: "Contractor Agreement",
    text: "The term ends in twenty-one days. Renewing it is not on anybody's board yet, which is how a contractor ends up working unpapered.",
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
export default function AgreementsPage() {
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
              <span className="grid h-[21px] w-[21px] flex-none place-items-center rounded-lg bg-gradient-to-br from-[#2B7EA0] to-[#17495D] text-white shadow-[0_2px_6px_rgba(23,73,93,0.34),inset_0_1px_0_rgba(255,255,255,0.34)] sm:h-[34px] sm:w-[34px] sm:rounded-[11px]">
                <SignDoc className="h-[14px] w-[14px] sm:h-[19px] sm:w-[19px]" />
              </span>
              <span className="text-[11.5px] font-[650] tracking-[0.02em] text-[#33302C] sm:text-[16.5px]">
                Agreements
              </span>
            </span>
            <h1 className="text-[24px] font-extrabold leading-[1.1] tracking-tight text-brand-ink sm:text-[66px] sm:leading-[1.04]">
              Signed, tracked, and
              <br />
              <span className="text-brand-orange">already working.</span>
            </h1>
            <p className="mx-auto mt-3.5 max-w-2xl text-[14.5px] leading-relaxed text-brand-charcoal sm:mt-7 sm:text-xl">
              <span className="sm:hidden">
                An agreement is a form with a signature on it. So the moment it is signed, it can
                start the work.
              </span>
              <span className="hidden sm:inline">
                An agreement is a form with a signature on it. Which means the contract you send is
                built out of real fields, and the moment somebody signs it, it can open the task,
                create the contact, and fill the spreadsheet by itself.
              </span>
            </p>
          </Reveal>

          <Reveal delay={0.12} className="mt-6 sm:mt-12">
            <div
              className="overflow-hidden rounded-2xl p-2 sm:rounded-[30px] sm:p-8"
              style={{ background: "linear-gradient(160deg, #E8F1F5, #D9E8EF)" }}
            >
              <AgreementsHeroTour />
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

      {/* ------------------------------------------------ 2. it is a form */}
      <Section
        id="form"
        eyebrow="A form with a signature on it"
        title="Not a PDF with boxes dragged"
        swash="onto it."
        body="Creating an agreement builds the whole document for you: a terms section, the signer's name and email, the date, and a signature that cannot be removed. Then it is an ordinary form, so it can ask anything a form can ask."
        points={[
          "The signature block is placed for you, and it is not optional",
          "Dropdowns, currency fields, and file uploads inside a contract",
          "Conditional logic, so an enterprise clause only shows for enterprise",
        ]}
        visual={<FormDemo />}
        panel="linear-gradient(160deg, #F3F0FA, #E9E4F6)"
      />

      {/* ------------------------------------------------ 3. signing */}
      <Section
        id="signing"
        eyebrow="What the signer sees"
        title="Draw it or type it. Consent is"
        swash="separate."
        body="Your subdomain, your accent colour, your logo. The signer draws or types their signature, then agrees to use electronic records and signatures as a distinct, required step, with a full disclosure they can read first."
        points={[
          "Draw or type, with undo and clear",
          "Electronic-signature consent collected separately, and required",
          "Six themes, or set the accent, card, text, and field colours yourself",
        ]}
        visual={<SignDemo />}
        flip
        panel="linear-gradient(160deg, #EEF4FB, #E2ECF8)"
      />

      {/* ------------------------------------------------ 4. tracking */}
      <Section
        id="tracking"
        eyebrow="Track and download"
        title="Every executed copy, and who you are"
        swash="waiting on."
        body="One page for everything sent for signature. What is signed, what is sitting with them, and what is sitting with you. Download the executed copy from the row, and sign the ones waiting on you without going back through your inbox."
        points={[
          "Signed, awaiting them, and awaiting you, on one list",
          "The executed copy downloadable from the row",
          "A countersigned copy sent to the signer's email automatically",
        ]}
        visual={<TrackDemo />}
        panel="linear-gradient(160deg, #EEF6F2, #E1EFE8)"
      />

      {/* ------------------------------------------------ 5. and then it acts */}
      <Section
        id="acts"
        eyebrow="Signed is a starting gun"
        title="The contract closes. The work"
        swash="opens."
        body="Because the agreement is a form, a signature is an event the rest of your system can hear. It opens the onboarding task with the plan they chose, creates the CRM contact at the right stage, and adds the row to the spreadsheet finance already watches."
        points={[
          "Open a task, assigned and dated, from the answers they gave",
          "Create the CRM contact with the deal terms already on it",
          "Add a row to a spreadsheet, or POST the whole thing to your own endpoint",
        ]}
        visual={<ActsDemo />}
        flip
        panel="linear-gradient(160deg, #FFF6EC, #FFEBD8)"
      />

      {/* ------------------------------------------------ 6. Multi AI (always last) */}
      <MultiAiWired
        heading="Your paperwork, watched by"
        swash="somebody who reads it."
        intro="Multi AI can see every agreement, its status, and the terms inside it. Ask what is unsigned, who is holding things up, and what is about to expire, and it answers out of the documents themselves."
        leftLabel="The agreements your team sends"
        leftColor={INK}
        leftIcon={RowsIcon}
        rightLabel="What Multi AI finds in them"
        panelTitle="Agreements · All"
        panelMeta="24 documents"
        panelDot={INK}
        rows={AI_ROWS}
        insights={AI_INSIGHTS}
        aiMeta="reading 24 agreements"
        footer="Multi AI reads the agreements you already signed. No exports, no separate contract-management tool, no spreadsheet of renewal dates."
      />

      <CTA />
      <Footer />
    </main>
  );
}
