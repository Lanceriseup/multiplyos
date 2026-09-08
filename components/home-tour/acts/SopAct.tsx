"use client";

// Tab 8 of 10 — SOP's.
//
// Short cut of SopHqHeroTour, the longest of the ten feature tours at about
// forty-four seconds. It covers reading AND writing; this keeps only the read:
//
//   1. open a department    SOP HQ home -> Operations
//   2. open a subject       Operations  -> Onboarding
//   3. open a SOP           Onboarding  -> Welcome Call Script
//
// Dropped: the breadcrumb back out, New SOP's format and starting-point pickers,
// and the editor beat where a Text block is added and written into. Authoring is
// the half that needs the most screen time and reads worst when rushed, so at
// six seconds the honest trade is to show that the library is deep and organised
// and let the feature page make the authoring case.
//
// The three levels are the argument by themselves: a business with real SOPs has
// them filed, and getting to one takes three clicks rather than a search through
// somebody's Drive.
//
// Departments, subjects and SOP titles are deliberately generic. They are the
// ones any business would recognise, not the ones in the demo account.
import { useRef, useState } from "react";
import { useAct, type Rig } from "../rig";
import { Av, IBook, IChevron, IPlus, ISearch, PageHead, Pill, T } from "../ui";

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

const SOPS = [
  { n: "Welcome Call Script", who: "JK", up: "Jun 28", v: "v2.4" },
  { n: "Account Setup Checklist", who: "TA", up: "Jun 12", v: "v3.1" },
  { n: "Data Import Runbook", who: "TA", up: "May 30", v: "v1.8" },
  { n: "Handoff to Client Success", who: "DW", up: "May 22", v: "v2.0" },
];

const STEPS = [
  "Confirm you have the signed agreement and the completed intake form open before you dial.",
  "Introduce yourself, restate what they bought, and name the outcome they told sales they wanted.",
  "Walk the 30/60/90 plan. Give a date for each milestone, not a duration.",
  "Agree the single point of contact on their side, and write it into the project.",
  "Book the kickoff call before you hang up. Never end the call with \"we'll email you\".",
];

type Level = 0 | 1 | 2 | 3;
type Scene = { lvl: Level; hot: string | null };
const BLANK: Scene = { lvl: 0, hot: null };

export default function SopAct({ active, rig }: { active: boolean; rig: Rig }) {
  const [s, setScene] = useState<Scene>(BLANK);
  // Scopes cursor-target lookups to THIS copy of the act. See ActApi.q.
  const rootRef = useRef<HTMLDivElement>(null);

  useAct(active, rig, rootRef, () => setScene(BLANK), async ({ alive, wait, rig: r, q }) => {
    const hit = (k: string) => q(`[data-sop="${k}"]`);
    const step = async (target: string, lvl: Level, dur: number) => {
      if (!alive()) return;
      setScene((x) => ({ ...x, hot: target }));
      await r.tap(hit(target), 0.5, 0.5, dur);
      if (!alive()) return;
      setScene({ lvl, hot: null });
      await wait(380);
    };

    r.at(hit("dept"), 0.5, 0.5);
    await r.fade(1, 200);
    if (!alive()) return;
    await wait(240);

    await step("dept", 1, 420);
    await step("subj", 2, 480);
    await step("sop", 3, 480);

    await r.fade(0, 340);
  });

  const crumbs = ["SOP HQ", "Operations", "Onboarding", "Welcome Call Script"].slice(0, s.lvl + 1);

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
              className="inline-flex items-center gap-[6px] rounded-[8px] px-[13px] py-2 text-[12.5px] font-semibold text-white"
              style={{ background: T.navy }}
            >
              <IPlus className="h-[13px] w-[13px]" />
              New SOP
            </span>
          </>
        }
      />

      {/* breadcrumb */}
      <div className="flex flex-none items-center gap-[6px] text-[12px]">
        {crumbs.map((c, i) => (
          <span key={c} className="flex items-center gap-[6px]">
            {i > 0 && <IChevron className="h-[11px] w-[11px]" style={{ color: T.muted2 }} />}
            <span
              className="transition-colors duration-300"
              style={{ color: i === crumbs.length - 1 ? T.ink : T.muted, fontWeight: i === crumbs.length - 1 ? 650 : 500 }}
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

        {/* ---- level 3: the SOP ---- */}
        <div
          className="absolute inset-0 flex flex-col overflow-hidden rounded-[12px] border bg-white transition-all duration-[320ms]"
          style={{
            borderColor: T.hair,
            opacity: s.lvl === 3 ? 1 : 0,
            transform: s.lvl === 3 ? "scale(1)" : "scale(1.01)",
          }}
        >
          <div className="flex flex-none items-start gap-3 border-b px-5 py-4" style={{ borderColor: T.hair }}>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-[19px] font-[780] tracking-[-0.02em]">Welcome Call Script</h3>
                <Pill bg={T.greenSoft} fg="#1F8A52">
                  Published
                </Pill>
                <Pill bg="#F1EEE9" fg={T.muted}>
                  v2.4
                </Pill>
              </div>
              <div className="mt-[5px] flex items-center gap-3 text-[11.5px]" style={{ color: T.muted }}>
                <span className="flex items-center gap-[6px]">
                  <Av n="JK" size={18} />
                  Jess Kim
                </span>
                <span>Updated Jun 28, 2026</span>
                <span>Reviewed quarterly</span>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 px-5 py-4">
            <div className="text-[10.5px] font-bold uppercase tracking-[0.09em]" style={{ color: T.muted }}>
              Purpose
            </div>
            <p className="mt-[6px] text-[13px] leading-[1.55]" style={{ color: "#3C3833" }}>
              The first call after someone signs sets the tone for the whole relationship. This script makes
              sure every new client hears the same three things, in the same order, whoever makes the call.
            </p>

            <div className="mt-4 text-[10.5px] font-bold uppercase tracking-[0.09em]" style={{ color: T.muted }}>
              Steps
            </div>
            <ol className="mt-2 flex list-none flex-col gap-[9px] p-0">
              {STEPS.map((st, i) => (
                <li key={i} className="flex gap-[10px] text-[12.5px] leading-[1.5]" style={{ color: "#3C3833" }}>
                  <span
                    className="grid h-[19px] w-[19px] flex-none place-items-center rounded-full text-[10.5px] font-bold"
                    style={{ background: T.orangeSoft, color: T.orange }}
                  >
                    {i + 1}
                  </span>
                  <span>{st}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
