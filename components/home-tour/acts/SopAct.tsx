"use client";

// Tab 8 of 10: SOP's.
//
// The client reviewed the first cut and asked for two specific things here:
// recording a video off your own screen as a SOP ("that's a huge feature"), and
// the multi step SOP. Both are now the back half of the act, and the read-only
// library drill that used to be the whole thing is the setup for them:
//
//   1. open a department      SOP HQ home -> Operations
//   2. open a subject         Operations  -> Onboarding
//   3. open a SOP             and it is a MULTI STEP one: 23 steps, a progress
//                             count, and a type on the steps that carry one
//   4. tick a step            the count and the bar move with it
//   5. New SOP                the block palette, all ten of them
//   6. Screen Record          picked out of the palette, so the recorder is a
//                             block in a SOP rather than a separate tool
//   7. record it              Start recording, a running duration, Stop & save
//   8. the published SOP      with the chapters it generated
//
// Beats 5 to 8 are the authoring half, which the earliest cut dropped on the
// grounds that it reads badly when rushed. That was the right call at six
// seconds and the wrong one at sixteen: recording your screen is the thing
// people do not expect a SOP tool to do, so it earns the length.
//
// THE RECORDER is traced from a screenshot of the real thing, supplied by the
// client in September 2026 with the note "make it look similar to this": the
// SCREEN RECORD block label, the dark capture frame with its own browser chrome
// and a REC flag, the camera bubble in the corner, and a control column holding
// DURATION, a Record microphone checkbox over a device picker and a live input
// level, a Record me on camera checkbox, and a red Stop & save.
//
// It is ONE block that changes state, not two screens. Start recording and
// Stop & save are the same control in the same place, which is why the pointer
// presses the same spot twice and the layout never jumps under it.
//
// The rest traces to SopHqPage.tsx rather than being invented: the ten block
// names, the generated chapters, and the 23-step count with only the first
// seven shown. The one deliberate change is the step and chapter wording, which
// is client-onboarding flavoured so it sits under Operations -> Onboarding
// where the drill actually lands.
//
// Departments, subjects and SOP titles stay generic. They are the ones any
// business would recognise, not the ones in the demo account, and the author is
// Skylar Lewis because she is the signed-in user doing the recording.
import { useRef, useState } from "react";
import { useAct, type Rig } from "../rig";
import {
  Av,
  IBook,
  ICamera,
  ICheck,
  IChevron,
  IClock,
  IPlay,
  IMic,
  IPlus,
  IScreen,
  ISearch,
  PageHead,
  Pill,
  T,
  Tick,
} from "../ui";

const DEPTS = [
  { n: "Operations", c: T.orange, sops: 34, subj: 6 },
  { n: "Sales", c: "#B4532A", sops: 21, subj: 4 },
  { n: "Finance", c: "#7A4E28", sops: 18, subj: 5 },
  { n: "People", c: "#8A3F6D", sops: 26, subj: 5 },
  { n: "Marketing", c: T.purple, sops: 15, subj: 3 },
  { n: "IT & Security", c: "#1F5F7A", sops: 12, subj: 4 },
];

const SUBJECTS = [
  { n: "Onboarding", sops: 9 },
  { n: "Client Delivery", sops: 11 },
  { n: "Vendor Management", sops: 6 },
  { n: "Quality Control", sops: 8 },
];

// Row 0 is the one we open, and it is the multi-step SOP.
const SOPS = [
  { n: "Client Onboarding Runbook", who: "SL", up: "Sep 2", v: "v4.2" },
  { n: "Welcome Call Script", who: "JK", up: "Jun 28", v: "v2.4" },
  { n: "Account Setup Checklist", who: "TA", up: "Jun 12", v: "v3.1" },
  { n: "Handoff to Client Success", who: "DW", up: "May 22", v: "v2.0" },
];

// A SOP is as long as whoever wrote it needed, so nothing here claims a number
// in general. This one is 23 steps and shows the first seven, the same way the
// feature page's mockup does: enough to read the structure without a wall of
// text. The count comes off the visible rows, so it stays under the total
// because everything below the fold is still open.
const TOTAL_STEPS = 23;
const MSTEPS: { t: string; kind?: "form" | "video" | "link"; done: boolean }[] = [
  { t: "Send the signed agreement to the client portal", kind: "form", done: true },
  { t: "Create the workspace from the onboarding template", done: true },
  { t: "Set up billing and raise the first invoice", done: true },
  { t: "Add their main contact to the shared calendar", done: true },
  { t: "Watch: how we run the first two weeks", kind: "video", done: false },
  { t: "Confirm portal login with their main contact", kind: "link", done: false },
  { t: "Book the kickoff call before the handoff", done: false },
];
/** Index of the step the pointer ticks. The video one, so it points forward. */
const TICK_AT = 4;

const KIND = {
  form: { label: "Form", bg: T.greenSoft, fg: "#2E7D5B" },
  video: { label: "Video", bg: T.blueSoft, fg: "#2C6BA6" },
  link: { label: "Link", bg: "#F6EBF2", fg: "#8A3F6D" },
} as const;

// The editor's block palette, all ten, in the product's own order. Rendered as
// plain labelled chips: at this size ten icons read as noise, and the labels are
// the part that makes the range obvious.
const BLOCKS = [
  "Text",
  "Video",
  "Video from Link",
  "Screen Record",
  "Audio",
  "Image",
  "Screenshot",
  "File",
  "Link",
  "Quiz",
];
/** The one the pointer picks. Its position drives nothing, but it is real. */
const REC_BLOCK = "Screen Record";

// Bar heights for the microphone input level, as percentages. Fixed rather than
// random so the shape is the same on every loop and on the server render.
const WAVE = [38, 62, 100, 74, 46, 88, 58, 100, 70, 34, 80, 52, 92, 44];

/** The recorder's two toggles are on, so both are drawn checked. */
function CheckBox({ on }: { on: boolean }) {
  return (
    <span
      className="grid h-[13px] w-[13px] flex-none place-items-center rounded-[3px]"
      style={{ background: on ? T.blue : "#fff", border: on ? "none" : `1.5px solid ${T.hair2}` }}
    >
      <ICheck className="h-[9px] w-[9px] text-white" style={{ opacity: on ? 1 : 0 }} />
    </span>
  );
}

const VIDEO_TITLE = "Setting Up a New Client Workspace";
const CHAPTERS = [
  { at: "0:00", t: "Open the onboarding template" },
  { at: "0:16", t: "Add the client's details" },
  { at: "0:34", t: "Invite their team by email" },
  { at: "0:52", t: "Set folder permissions" },
];

/** The product prints the duration as 0:01, not 00:01. */
const clock = (n: number) => `0:${String(n).padStart(2, "0")}`;

type Level = 0 | 1 | 2 | 3 | 4 | 5;
type Scene = {
  lvl: Level;
  hot: string | null;
  /** The step the pointer checks off. */
  ticked: boolean;
  /** The Screen Record block has been added to the new SOP. */
  block: boolean;
  /** The block is rolling. Swaps Start recording for Stop & save. */
  rec: boolean;
  /** Seconds on the recording clock. */
  secs: number;
};
const BLANK: Scene = { lvl: 0, hot: null, ticked: false, block: false, rec: false, secs: 0 };

export default function SopAct({ active, rig }: { active: boolean; rig: Rig }) {
  const [s, setScene] = useState<Scene>(BLANK);
  // Scopes cursor-target lookups to THIS copy of the act. See ActApi.q.
  const rootRef = useRef<HTMLDivElement>(null);

  useAct(active, rig, rootRef, () => setScene(BLANK), async ({ alive, wait, rig: r, q }) => {
    const hit = (k: string) => q(`[data-sop="${k}"]`);

    /** Move to a target, press it, then apply the change it causes. */
    const press = async (target: string, dur: number, after: Partial<Scene>, settle = 380) => {
      if (!alive()) return false;
      setScene((x) => ({ ...x, hot: target }));
      await r.tap(hit(target), 0.5, 0.5, dur);
      if (!alive()) return false;
      setScene((x) => ({ ...x, ...after, hot: null }));
      await wait(settle);
      return alive();
    };

    r.at(hit("dept"), 0.5, 0.5);
    await r.fade(1, 200);
    if (!alive()) return;
    await wait(240);

    // ---- 1 to 3. down through the library, into a multi-step SOP
    if (!(await press("dept", 420, { lvl: 1 }))) return;
    if (!(await press("subj", 460, { lvl: 2 }))) return;
    if (!(await press("sop", 460, { lvl: 3 }))) return;
    await wait(560);

    // ---- 4. tick a step, and watch the count move
    if (!(await press("step", 520, { ticked: true }, 820))) return;

    // ---- 5 and 6. a new SOP, and the block that records your screen
    if (!(await press("new", 540, { lvl: 4 }, 520))) return;
    if (!(await press("block", 540, { block: true }, 560))) return;

    // ---- 7. roll. Start recording and Stop & save are the same control in the
    // same place, so the pointer barely moves between them, which is the point.
    if (!(await press("rec", 440, { rec: true }, 300))) return;

    // The clock runs faster than real time on purpose: a mockup that counts in
    // true seconds spends six of them proving it can count.
    for (const n of [1, 2, 3, 4, 5, 6]) {
      if (!alive()) return;
      setScene((x) => ({ ...x, secs: n }));
      await wait(320);
    }

    // ---- 8. stop, and it is a published SOP with chapters
    if (!(await press("stop", 300, { lvl: 5, rec: false }, 1700))) return;

    await r.fade(0, 340);
  });

  const crumbs = ["SOP HQ", "Operations", "Onboarding", "Client Onboarding Runbook"].slice(
    0,
    Math.min(s.lvl, 3) + 1,
  );
  const doneCount = MSTEPS.filter((m) => m.done).length + (s.ticked ? 1 : 0);
  const pct = Math.round((doneCount / TOTAL_STEPS) * 100);

  return (
    <div ref={rootRef} className="flex h-full flex-col gap-[10px]">
      <PageHead
        title="SOP HQ"
        sub="Every process your business runs, written down and findable."
        right={
          <>
            <span
              className="inline-flex h-[32px] items-center gap-[7px] rounded-[8px] border bg-white px-3 text-[12px]"
              style={{ borderColor: T.hair2, color: T.muted2 }}
            >
              <ISearch className="h-[13px] w-[13px]" />
              Search 126 SOPs
            </span>
            <span
              data-sop="new"
              className="inline-flex items-center gap-[6px] rounded-[8px] px-[13px] py-2 text-[12.5px] font-semibold text-white transition-all duration-200"
              style={{
                background: T.navy,
                boxShadow: s.hot === "new" ? "0 0 0 3px rgba(31,41,55,0.18)" : undefined,
              }}
            >
              <IPlus className="h-[13px] w-[13px]" />
              New SOP
            </span>
          </>
        }
      />

      {/* breadcrumb. Levels 4 to 6 are the new SOP, so it stops at the library. */}
      <div className="flex flex-none items-center gap-[6px] text-[12px]">
        {(s.lvl >= 4 ? ["SOP HQ", "New SOP"] : crumbs).map((c, i, all) => (
          <span key={c} className="flex items-center gap-[6px]">
            {i > 0 && <IChevron className="h-[11px] w-[11px]" style={{ color: T.muted2 }} />}
            <span
              className="transition-colors duration-300"
              style={{ color: i === all.length - 1 ? T.ink : T.muted, fontWeight: i === all.length - 1 ? 650 : 500 }}
            >
              {c}
            </span>
          </span>
        ))}
      </div>

      <div className="relative min-h-0 flex-1">
        {/* ---- level 0: departments ---- */}
        <div
          className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-3 transition-all duration-[300ms]"
          style={{ opacity: s.lvl === 0 ? 1 : 0, transform: s.lvl === 0 ? "scale(1)" : "scale(0.99)" }}
        >
          {DEPTS.map((d, i) => (
            <div
              key={d.n}
              data-sop={i === 0 ? "dept" : undefined}
              className="flex flex-col justify-between rounded-[12px] border bg-white p-4 transition-all duration-200"
              style={{
                borderColor: s.hot === "dept" && i === 0 ? T.orange : T.hair,
                boxShadow: s.hot === "dept" && i === 0 ? "0 0 0 3px rgba(234,123,27,0.16)" : undefined,
              }}
            >
              <span
                className="grid h-[34px] w-[34px] place-items-center rounded-[9px]"
                style={{ background: `${d.c}18`, color: d.c }}
              >
                <IBook className="h-[18px] w-[18px]" />
              </span>
              <div>
                <div className="text-[15px] font-bold">{d.n}</div>
                <div className="mt-[2px] text-[11.5px]" style={{ color: T.muted }}>
                  {d.subj} subjects · {d.sops} SOPs
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ---- level 1: subjects ---- */}
        <div
          className="absolute inset-0 flex flex-col gap-[10px] transition-all duration-[300ms]"
          style={{ opacity: s.lvl === 1 ? 1 : 0, transform: s.lvl === 1 ? "scale(1)" : "scale(0.99)" }}
        >
          {SUBJECTS.map((sb, i) => (
            <div
              key={sb.n}
              data-sop={i === 0 ? "subj" : undefined}
              className="flex flex-1 items-center gap-3 rounded-[12px] border bg-white px-4 transition-all duration-200"
              style={{
                borderColor: s.hot === "subj" && i === 0 ? T.orange : T.hair,
                boxShadow: s.hot === "subj" && i === 0 ? "0 0 0 3px rgba(234,123,27,0.16)" : undefined,
              }}
            >
              <span
                className="grid h-[32px] w-[32px] flex-none place-items-center rounded-[9px]"
                style={{ background: T.orangeSoft, color: T.orange }}
              >
                <IBook className="h-[16px] w-[16px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14.5px] font-bold">{sb.n}</span>
                <span className="block text-[11.5px]" style={{ color: T.muted }}>
                  Operations · {sb.sops} SOPs
                </span>
              </span>
              <IChevron className="h-[15px] w-[15px] flex-none" style={{ color: T.muted2 }} />
            </div>
          ))}
        </div>

        {/* ---- level 2: the SOPs in this subject ---- */}
        <div
          className="absolute inset-0 overflow-hidden rounded-[12px] border bg-white transition-all duration-[300ms]"
          style={{
            borderColor: T.hair,
            opacity: s.lvl === 2 ? 1 : 0,
            transform: s.lvl === 2 ? "scale(1)" : "scale(0.99)",
          }}
        >
          <div
            className="flex items-center border-b px-4 py-[9px] text-[8.5px] font-semibold uppercase tracking-wide"
            style={{ borderColor: "#F1EEE9", background: "#FAF9F7", color: T.muted }}
          >
            <span className="flex-1">SOP</span>
            <span className="w-[90px] text-center">Owner</span>
            <span className="w-[90px] text-center">Updated</span>
            <span className="w-[80px] text-center">Version</span>
            <span className="w-[96px] text-center">Status</span>
          </div>
          {SOPS.map((sp, i) => (
            <div
              key={sp.n}
              data-sop={i === 0 ? "sop" : undefined}
              className="flex items-center border-b px-4 py-[13px] text-[13px] transition-colors duration-200"
              style={{
                borderColor: "#F5F3EF",
                background: s.hot === "sop" && i === 0 ? "#FDF7F0" : "#fff",
              }}
            >
              <span className="flex min-w-0 flex-1 items-center gap-[10px]">
                <IBook className="h-[15px] w-[15px] flex-none" style={{ color: T.muted2 }} />
                <span className="truncate font-semibold">{sp.n}</span>
              </span>
              <span className="grid w-[90px] place-items-center">
                <Av n={sp.who} size={22} />
              </span>
              <span className="w-[90px] text-center text-[11.5px]" style={{ color: T.muted }}>
                {sp.up}
              </span>
              <span className="w-[80px] text-center text-[11.5px] font-semibold" style={{ color: T.muted }}>
                {sp.v}
              </span>
              <span className="grid w-[96px] place-items-center">
                <Pill bg={T.greenSoft} fg="#1F8A52">
                  Published
                </Pill>
              </span>
            </div>
          ))}
        </div>

        {/* ---- level 3: the SOP, and it is a multi-step one ---- */}
        <div
          className="absolute inset-0 flex flex-col overflow-hidden rounded-[12px] border bg-white transition-all duration-[320ms]"
          style={{
            borderColor: T.hair,
            opacity: s.lvl === 3 ? 1 : 0,
            transform: s.lvl === 3 ? "scale(1)" : "scale(1.01)",
          }}
        >
          <div className="flex flex-none items-start gap-3 px-5 pb-3 pt-4">
            <Av n="CO" size={34} sq />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-[17px] font-[780] tracking-[-0.02em]">Client Onboarding Runbook</h3>
                <Pill bg={T.greenSoft} fg="#1F8A52">
                  Published
                </Pill>
              </div>
              <div className="mt-[4px] flex items-center gap-2 text-[11.5px]" style={{ color: T.muted }}>
                <Pill bg="#F1EEE9" fg={T.body}>
                  Operations
                </Pill>
                by Skylar Lewis
                <span style={{ color: T.muted2 }}>·</span>
                <IClock className="h-[12px] w-[12px]" />
                12 min
              </div>
            </div>
          </div>

          {/* progress, off the steps that are ticked */}
          <div className="flex-none px-5 pb-3">
            <div className="flex items-baseline gap-2">
              <span
                className="text-[20px] font-[800] leading-none tabular-nums transition-colors duration-300"
                style={{ color: pct >= 50 ? T.green : T.amber }}
              >
                {doneCount}/{TOTAL_STEPS}
              </span>
              <span className="text-[11.5px]" style={{ color: T.muted }}>
                steps complete
              </span>
              <span className="ml-auto text-[11.5px] font-semibold tabular-nums">{pct}%</span>
            </div>
            <div className="mt-[6px] h-[5px] overflow-hidden rounded-full" style={{ background: "#ECE8E1" }}>
              <span
                className="block h-full rounded-full transition-[width,background] duration-500"
                style={{ width: `${pct}%`, background: pct >= 50 ? T.green : T.orange }}
              />
            </div>
          </div>

          {/* the steps */}
          <div className="min-h-0 flex-1 border-t" style={{ borderColor: "#F1EEE9" }}>
            {MSTEPS.map((m, i) => {
              const on = m.done || (i === TICK_AT && s.ticked);
              const k = m.kind ? KIND[m.kind] : null;
              return (
                <div
                  key={m.t}
                  data-sop={i === TICK_AT ? "step" : undefined}
                  className="flex items-center gap-[10px] border-b px-5 py-[9px] text-[12.5px] transition-colors duration-200"
                  style={{
                    borderColor: "#F7F5F1",
                    background: s.hot === "step" && i === TICK_AT ? "#FDF7F0" : "#fff",
                  }}
                >
                  <Tick on={on} size={18} />
                  <span className="w-[14px] flex-none text-[11px] font-semibold tabular-nums" style={{ color: T.muted2 }}>
                    {i + 1}
                  </span>
                  <span
                    className="min-w-0 flex-1 truncate transition-colors duration-300"
                    style={{ color: on ? T.muted : "#3C3833" }}
                  >
                    {m.t}
                  </span>
                  {k && (
                    <Pill bg={k.bg} fg={k.fg}>
                      {k.label}
                    </Pill>
                  )}
                </div>
              );
            })}
            <div className="px-5 py-[7px] text-[11px]" style={{ color: T.muted2 }}>
              {TOTAL_STEPS - MSTEPS.length} more steps below
            </div>
          </div>
        </div>

        {/* ---- level 4: a new SOP, and the block palette ---- */}
        <div
          className="absolute inset-0 flex flex-col overflow-hidden rounded-[12px] border bg-white transition-all duration-[300ms]"
          style={{
            borderColor: T.hair,
            opacity: s.lvl === 4 ? 1 : 0,
            transform: s.lvl === 4 ? "scale(1)" : "scale(0.99)",
          }}
        >
          <div className="flex-none border-b px-5 py-[13px]" style={{ borderColor: T.hair }}>
            <div className="text-[10.5px] font-bold uppercase tracking-[0.09em]" style={{ color: T.muted }}>
              Title
            </div>
            <div className="mt-[5px] text-[17px] font-[760] tracking-[-0.02em]">{VIDEO_TITLE}</div>
          </div>

          <div className="flex-none px-5 pt-3.5">
            <div className="text-[10.5px] font-bold uppercase tracking-[0.09em]" style={{ color: T.muted }}>
              Add a block
            </div>
            <div className="mt-[9px] flex flex-wrap gap-[7px]">
              {BLOCKS.map((b) => {
                const isRec = b === REC_BLOCK;
                const lit = isRec && (s.hot === "block" || s.block);
                return (
                  <span
                    key={b}
                    data-sop={isRec ? "block" : undefined}
                    className="rounded-[8px] border px-[10px] py-[6px] text-[11.5px] transition-all duration-200"
                    style={{
                      borderColor: lit ? T.orange : T.hair2,
                      background: lit ? T.orangeSoft : "#fff",
                      color: lit ? "#B4532A" : T.body,
                      fontWeight: lit ? 650 : 500,
                      boxShadow: s.hot === "block" && isRec ? "0 0 0 3px rgba(234,123,27,0.16)" : undefined,
                    }}
                  >
                    {b}
                  </span>
                );
              })}
            </div>
          </div>

          {/* The Screen Record block, once it is in the document. It does not
              hand off to a separate screen when it starts: the block itself
              becomes the recorder, which is how the product does it. */}
          <div
            className="mx-5 mt-3.5 flex h-[252px] flex-none flex-col transition-all duration-[320ms]"
            style={{
              opacity: s.block ? 1 : 0,
              transform: s.block ? "translateY(0)" : "translateY(6px)",
            }}
          >
            <div
              className="flex flex-none items-center gap-[6px] text-[8.5px] font-bold uppercase tracking-[0.12em]"
              style={{ color: T.muted }}
            >
              <IScreen className="h-[12px] w-[12px]" />
              Screen Record
            </div>

            <div
              className="mt-[7px] flex min-h-0 flex-1 rounded-[10px] border bg-white p-2.5"
              style={{ borderColor: T.hair2 }}
            >
              {/* ---- what is being captured ---- */}
              <div
                className="relative min-h-0 min-w-0 flex-1 overflow-hidden rounded-[8px] p-[7px]"
                style={{ background: "#22201D" }}
              >
                <div className="flex h-full flex-col overflow-hidden rounded-[5px] bg-[#FAF9F7]">
                  <div
                    className="flex flex-none items-center gap-[5px] border-b px-2 py-[5px]"
                    style={{ borderColor: "#EDEAE6" }}
                  >
                    <span className="h-[6px] w-[6px] rounded-full" style={{ background: "#E8574A" }} />
                    <span className="h-[6px] w-[6px] rounded-full" style={{ background: "#EBB84B" }} />
                    <span className="h-[6px] w-[6px] rounded-full" style={{ background: "#4FB477" }} />
                    <span
                      className="ml-1.5 rounded-[4px] px-[7px] py-[2px] text-[8px]"
                      style={{ background: "#EFECE6", color: T.muted }}
                    >
                      app.yourcrm.com
                    </span>
                  </div>
                  <div className="flex min-h-0 flex-1">
                    <div className="flex w-[62px] flex-none flex-col gap-[6px] p-2">
                      {[78, 62, 70, 54].map((w, i) => (
                        <span key={i} className="h-[5px] rounded-full" style={{ width: `${w}%`, background: "#E6E2DA" }} />
                      ))}
                    </div>
                    <div className="grid min-w-0 flex-1 grid-cols-3 grid-rows-2 gap-[7px] p-2">
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <span
                          key={i}
                          className="rounded-[4px] border"
                          style={{ borderColor: "#EDEAE4", background: "#F4F1EC" }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* the recording flag, on the capture itself */}
                <span
                  className="absolute right-[15px] top-[15px] flex items-center gap-[5px] rounded-full px-[9px] py-[3px] text-[9px] font-bold text-white transition-opacity duration-300"
                  style={{ background: "rgba(34,32,29,0.86)", opacity: s.rec ? 1 : 0 }}
                >
                  <span className="h-[6px] w-[6px] rounded-full" style={{ background: "#E8574A" }} />
                  REC
                </span>

                {/* the camera bubble, because Record me on camera is on */}
                <span
                  className="absolute bottom-[15px] left-[15px] grid h-[44px] w-[44px] place-items-center rounded-full"
                  style={{ background: "#33302B", color: "#B8B2AA" }}
                >
                  <ICamera className="h-[17px] w-[17px]" />
                </span>
              </div>

              {/* ---- the controls ---- */}
              <div className="ml-3 flex w-[212px] flex-none flex-col">
                <div className="text-[8.5px] font-bold uppercase tracking-[0.12em]" style={{ color: T.muted }}>
                  Duration
                </div>
                <div className="mt-[2px] text-[24px] font-[800] leading-none tabular-nums">{clock(s.secs)}</div>

                <label className="mt-3 flex items-center gap-[7px] text-[11.5px] font-semibold" style={{ color: T.orange }}>
                  <CheckBox on />
                  <IMic className="h-[13px] w-[13px]" />
                  Record microphone
                </label>
                <div
                  className="mt-[7px] rounded-[7px] border px-2.5 py-[6px] text-[11px]"
                  style={{ borderColor: T.hair2, color: T.body }}
                >
                  System default
                </div>

                {/* input level, so the microphone reads as live rather than a
                    checkbox nobody can tell is doing anything */}
                <div className="mt-[9px] flex h-[13px] items-center gap-[3px]">
                  {WAVE.map((h, i) => (
                    <span
                      key={i}
                      className="flex-1 rounded-full transition-[height] duration-300"
                      style={{ height: `${s.rec ? h : 12}%`, background: T.green, opacity: 0.85 }}
                    />
                  ))}
                </div>

                <label className="mt-3 flex items-center gap-[7px] text-[11.5px] font-semibold">
                  <CheckBox on />
                  <ICamera className="h-[13px] w-[13px]" />
                  Record me on camera
                </label>

                {/* One button in one place, which is what the product does:
                    it is the same control before and after, so the pointer
                    presses the same spot twice. */}
                {/* Directly under the camera toggle, not pinned to the bottom
                    of the column: at the foot of the stage it collided with the
                    floating Ask Multi AI pill. */}
                <span
                  data-sop={s.rec ? "stop" : "rec"}
                  className="mt-3 flex items-center justify-center gap-[7px] rounded-[8px] py-[9px] text-[12px] font-semibold text-white transition-all duration-200"
                  style={{
                    background: s.rec ? "#E8574A" : T.navy,
                    boxShadow:
                      s.hot === (s.rec ? "stop" : "rec")
                        ? `0 0 0 3px ${s.rec ? "rgba(232,87,74,0.22)" : "rgba(31,41,55,0.18)"}`
                        : undefined,
                  }}
                >
                  <span
                    className="transition-all duration-200"
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: s.rec ? 2 : 9999,
                      background: s.rec ? "#fff" : "#E8574A",
                    }}
                  />
                  {s.rec ? "Stop & save" : "Start recording"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ---- level 5: the published video SOP ---- */}
        <div
          className="absolute inset-0 flex flex-col overflow-hidden rounded-[12px] border bg-white transition-all duration-[320ms]"
          style={{
            borderColor: T.hair,
            opacity: s.lvl === 5 ? 1 : 0,
            transform: s.lvl === 5 ? "scale(1)" : "scale(1.01)",
          }}
        >
          <div className="flex flex-none items-start gap-3 px-5 pb-3 pt-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-[17px] font-[780] tracking-[-0.02em]">{VIDEO_TITLE}</h3>
                <Pill bg={T.greenSoft} fg="#1F8A52">
                  Published
                </Pill>
              </div>
              <div className="mt-[4px] flex items-center gap-2 text-[11.5px]" style={{ color: T.muted }}>
                <Pill bg="#F1EEE9" fg={T.body}>
                  Operations
                </Pill>
                by Skylar Lewis
                <span style={{ color: T.muted2 }}>·</span>
                <IClock className="h-[12px] w-[12px]" />
                1 min
              </div>
            </div>
          </div>

          {/* The player beside its chapters. The recording is the SOP now, so it
              gets the room, and the chapters sit next to it as the way in. */}
          <div className="flex min-h-0 flex-1 gap-3 border-t px-5 py-3" style={{ borderColor: "#F1EEE9" }}>
            <div
              className="relative min-h-0 min-w-0 flex-1 overflow-hidden rounded-[10px]"
              style={{ background: "#22201D" }}
            >
              <span className="absolute inset-0 grid place-items-center">
                {/* Opacity set in style, not as bg-white/92: 92 is not on
                    Tailwind's opacity scale, so the class silently produced no
                    background and left a dark icon on a dark player. */}
                <span
                  className="grid h-[46px] w-[46px] place-items-center rounded-full"
                  style={{ background: "rgba(255,255,255,0.94)", color: "#22201D" }}
                >
                  <IPlay className="h-[18px] w-[18px]" />
                </span>
              </span>
              {/* scrubber, with a mark where each chapter starts */}
              <span className="absolute inset-x-3 bottom-3">
                <span className="relative block h-[4px] rounded-full bg-white/25">
                  <span className="absolute inset-y-0 left-0 w-[16%] rounded-full" style={{ background: T.orange }} />
                  {["0%", "26%", "54%", "82%"].map((at) => (
                    <span
                      key={at}
                      className="absolute top-[-2px] h-[8px] w-[2px] rounded-full bg-white/70"
                      style={{ left: at }}
                    />
                  ))}
                </span>
                <span className="mt-[6px] flex items-center justify-between font-mono text-[9px] text-white/70">
                  <span>0:10</span>
                  <span>1:04</span>
                </span>
              </span>
            </div>

            <div className="flex w-[286px] flex-none flex-col">
              <div className="text-[10.5px] font-bold uppercase tracking-[0.09em]" style={{ color: T.muted }}>
                Chapters, generated for you
              </div>
              <div className="mt-2 flex flex-col gap-[3px]">
                {CHAPTERS.map((c) => (
                  <div
                    key={c.at}
                    className="flex items-center gap-2.5 rounded-[7px] border px-2.5 py-[7px] text-[12px]"
                    style={{ borderColor: T.hair }}
                  >
                    <span className="w-[26px] flex-none font-mono text-[10.5px] font-semibold" style={{ color: "#B4532A" }}>
                      {c.at}
                    </span>
                    <span className="min-w-0 truncate" style={{ color: "#3C3833" }}>
                      {c.t}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="flex-none border-t px-5 py-[9px] text-[11.5px]" style={{ borderColor: "#F1EEE9", color: T.muted }}>
            Fully transcribed, so a search for &ldquo;permissions&rdquo; lands on 0:52.
          </p>
        </div>
      </div>
    </div>
  );
}
