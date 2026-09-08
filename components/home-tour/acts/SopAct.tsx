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
//   7. record it              capture source, a running timer, stop and publish
//   8. the published SOP      with the chapters it generated
//
// Beats 5 to 8 are the authoring half, which the earlier cut dropped on the
// grounds that it reads badly when rushed. That was the right call at six
// seconds and the wrong one at sixteen: recording your screen is the thing
// people do not expect a SOP tool to do, so it earns the length.
//
// Everything here traces to SopHqPage.tsx rather than being invented. The ten
// block names, the three capture sources, "Records in the browser, and keeps
// running while you work", the generated chapters and the 23-step count with
// only the first seven shown are all the product's own. The one deliberate
// change is the step and chapter wording, which is client-onboarding flavoured
// so it sits under Operations -> Onboarding where the drill actually lands.
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
  IChevron,
  IClock,
  IPlay,
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

const SOURCES = [
  { k: "Screen", I: IScreen },
  { k: "Screen + camera", I: ICamera },
  { k: "Camera", I: ICamera },
];
/** Screen + camera, so the camera bubble has a reason to be on the capture. */
const SRC_PICK = 1;

const VIDEO_TITLE = "Setting Up a New Client Workspace";
const CHAPTERS = [
  { at: "0:00", t: "Open the onboarding template" },
  { at: "0:16", t: "Add the client's details" },
  { at: "0:34", t: "Invite their team by email" },
  { at: "0:52", t: "Set folder permissions" },
];

const clock = (n: number) => `00:${String(n).padStart(2, "0")}`;

type Level = 0 | 1 | 2 | 3 | 4 | 5 | 6;
type Scene = {
  lvl: Level;
  hot: string | null;
  /** The step the pointer checks off. */
  ticked: boolean;
  /** The Screen Record block has been added to the new SOP. */
  block: boolean;
  src: number;
  /** Seconds on the recording clock. */
  secs: number;
};
const BLANK: Scene = { lvl: 0, hot: null, ticked: false, block: false, src: 0, secs: 0 };

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

    // ---- 7. pick the capture source, then roll
    if (!(await press("src", 400, { src: SRC_PICK }, 400))) return;
    if (!(await press("rec", 440, { lvl: 5 }, 260))) return;

    // The clock runs faster than real time on purpose: a mockup that ticks in
    // true seconds spends four of them proving it can count.
    for (const n of [2, 4, 6, 8]) {
      if (!alive()) return;
      setScene((x) => ({ ...x, secs: n }));
      await wait(360);
    }

    // ---- 8. stop, and it is a published SOP with chapters
    if (!(await press("stop", 460, { lvl: 6 }, 1700))) return;

    await r.fade(0, 340);
  });

  const crumbs = ["SOP HQ", "Operations", "Onboarding", "Client Onboarding Runbook"].slice(
    0,
    Math.min(s.lvl, 3) + 1,
  );
  const doneCount = MSTEPS.filter((m) => m.done).length + (s.ticked ? 1 : 0);
  const pct = Math.round((doneCount / TOTAL_STEPS) * 100);
  const recording = s.lvl === 5;

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

          {/* the Screen Record block, once it is in the document */}
          <div
            className="mx-5 mt-3.5 flex-none rounded-[10px] border p-3 transition-all duration-[320ms]"
            style={{
              borderColor: T.hair2,
              opacity: s.block ? 1 : 0,
              transform: s.block ? "translateY(0)" : "translateY(6px)",
            }}
          >
            <div className="text-[8.5px] font-bold uppercase tracking-[0.12em]" style={{ color: T.muted }}>
              Screen Record
            </div>
            <div className="mt-[9px] flex items-center gap-2">
              <span className="inline-flex rounded-[8px] p-[3px]" style={{ background: "#EDEAE4" }}>
                {SOURCES.map((src, i) => (
                  <span
                    key={src.k}
                    data-sop={i === SRC_PICK ? "src" : undefined}
                    className="inline-flex items-center gap-[5px] rounded-[6px] px-[9px] py-[5px] text-[11px] transition-all duration-200"
                    style={
                      i === s.src
                        ? { background: "#fff", color: T.ink, fontWeight: 650, boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }
                        : { color: T.muted }
                    }
                  >
                    <src.I className="h-[12px] w-[12px]" />
                    {src.k}
                  </span>
                ))}
              </span>
              <span
                data-sop="rec"
                className="ml-auto inline-flex flex-none items-center gap-[7px] rounded-[8px] px-[12px] py-[7px] text-[11.5px] font-semibold text-white transition-all duration-200"
                style={{
                  background: T.navy,
                  boxShadow: s.hot === "rec" ? "0 0 0 3px rgba(31,41,55,0.18)" : undefined,
                }}
              >
                <span className="h-[7px] w-[7px] rounded-full" style={{ background: "#E8574A" }} />
                Start recording
              </span>
            </div>
            <p className="mt-[9px] text-[11px]" style={{ color: T.muted }}>
              Records in the browser, and keeps running while you work.
            </p>
          </div>
        </div>

        {/* ---- level 5: recording ---- */}
        <div
          className="absolute inset-0 flex flex-col overflow-hidden rounded-[12px] border bg-white transition-all duration-[300ms]"
          style={{
            borderColor: T.hair,
            opacity: recording ? 1 : 0,
            transform: recording ? "scale(1)" : "scale(0.99)",
          }}
        >
          <div
            className="flex flex-none items-center gap-2 border-b px-4 py-[10px]"
            style={{ borderColor: T.hair }}
          >
            <b className="text-[13px]">Record a video SOP</b>
            <span className="ml-auto inline-flex rounded-[8px] p-[3px]" style={{ background: "#EDEAE4" }}>
              {SOURCES.map((src, i) => (
                <span
                  key={src.k}
                  className="inline-flex items-center gap-[5px] rounded-[6px] px-[9px] py-[5px] text-[11px]"
                  style={
                    i === s.src
                      ? { background: "#fff", color: T.ink, fontWeight: 650, boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }
                      : { color: T.muted }
                  }
                >
                  <src.I className="h-[12px] w-[12px]" />
                  {src.k}
                </span>
              ))}
            </span>
          </div>

          {/* what is being captured */}
          <div className="min-h-0 flex-1 p-3">
            <div className="relative h-full overflow-hidden rounded-[10px]" style={{ background: "#2E2C28" }}>
              {/* The app window being captured. Greyed-out furniture rather than
                  a real screen: what matters is that the frame reads as somebody
                  working, and a half-empty box does not. */}
              <div className="absolute inset-[14px] flex flex-col overflow-hidden rounded-[7px] bg-white/95">
                <div
                  className="flex flex-none items-center gap-[5px] border-b px-2.5 py-[6px]"
                  style={{ borderColor: T.hair }}
                >
                  <span className="h-[7px] w-[7px] rounded-full" style={{ background: "#E4E0D9" }} />
                  <span className="h-[7px] w-[7px] rounded-full" style={{ background: "#E4E0D9" }} />
                  <span className="h-[7px] w-[7px] rounded-full" style={{ background: "#E4E0D9" }} />
                  <span className="ml-2 text-[9px]" style={{ color: T.muted2 }}>
                    Client workspace
                  </span>
                </div>

                <div className="flex min-h-0 flex-1">
                  <div
                    className="flex w-[112px] flex-none flex-col gap-[9px] border-r p-2.5"
                    style={{ borderColor: T.hair }}
                  >
                    <div className="h-[9px] w-[64%] rounded-full" style={{ background: "#E2DDD4" }} />
                    {[74, 62, 80, 56, 70, 50, 66].map((w, i) => (
                      <div key={i} className="h-[7px] rounded-full" style={{ width: `${w}%`, background: "#EEEAE3" }} />
                    ))}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-2.5 p-3">
                    <div className="h-[11px] w-[38%] flex-none rounded-full" style={{ background: "#DED9D0" }} />
                    <div className="flex flex-none gap-2.5">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="flex flex-1 flex-col gap-[6px] rounded-[6px] border p-2"
                          style={{ borderColor: T.hair }}
                        >
                          <div className="h-[6px] w-[52%] rounded-full" style={{ background: "#EEEAE3" }} />
                          <div className="h-[12px] w-[36%] rounded-[3px]" style={{ background: "#E2DDD4" }} />
                        </div>
                      ))}
                    </div>
                    <div
                      className="flex min-h-0 flex-1 flex-col justify-around rounded-[6px] border px-2.5 py-2"
                      style={{ borderColor: T.hair }}
                    >
                      {[92, 78, 86, 70, 82, 74].map((w, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="h-[8px] w-[8px] flex-none rounded-[2px]" style={{ background: "#EEEAE3" }} />
                          <span className="h-[7px] rounded-full" style={{ width: `${w}%`, background: "#EFECE6" }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* the camera bubble, when the source includes it */}
              {s.src === SRC_PICK && (
                <span
                  className="absolute bottom-[22px] left-[22px] grid h-[42px] w-[42px] place-items-center rounded-full border-2 border-white/80"
                  style={{ background: "#22201D", color: "#B8B2AA" }}
                >
                  <ICamera className="h-[17px] w-[17px]" />
                </span>
              )}

              {/* the recording readout */}
              <span className="absolute right-[22px] top-[22px] flex items-center gap-[7px] rounded-full bg-black/55 px-[10px] py-[4px] text-[10px] font-semibold text-white">
                <span className="h-[7px] w-[7px] rounded-full" style={{ background: "#E8574A" }} />
                REC {clock(s.secs)}
              </span>
            </div>
          </div>

          <div className="flex flex-none items-center gap-2.5 px-4 pb-3.5">
            <span
              data-sop="stop"
              className="inline-flex items-center gap-[7px] rounded-[8px] px-[13px] py-[7px] text-[12px] font-semibold text-white transition-all duration-200"
              style={{
                background: "#E8574A",
                boxShadow: s.hot === "stop" ? "0 0 0 3px rgba(232,87,74,0.22)" : undefined,
              }}
            >
              <span className="h-[8px] w-[8px] rounded-[2px] bg-white" />
              Stop &amp; publish
            </span>
            <span className="text-[11.5px]" style={{ color: T.muted }}>
              Recording screen and camera
            </span>
          </div>
        </div>

        {/* ---- level 6: the published video SOP ---- */}
        <div
          className="absolute inset-0 flex flex-col overflow-hidden rounded-[12px] border bg-white transition-all duration-[320ms]"
          style={{
            borderColor: T.hair,
            opacity: s.lvl === 6 ? 1 : 0,
            transform: s.lvl === 6 ? "scale(1)" : "scale(1.01)",
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
