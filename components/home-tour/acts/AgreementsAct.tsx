"use client";

// Tab 9 of 10 — Agreements.
//
// Short cut of AgreementsHeroTour, which alternates two full passes (the form
// path and the document path). Neither pass fits here, so this is a round trip
// through the half that is hardest to believe until you watch it:
//
//   1. the Agreements page   what is signed, what is waiting, and on whom
//   1b. Needs my signature   the tab that finds the one waiting on YOU
//   5. the signer's view     draw a signature, consent, Sign and submit
//   6. back to Agreements    the same card, now Completed, with a download
//
// Beats 1 and 1b were added on the client's request for more context. Before
// them the act opened cold on a signature pad, which showed that signing works
// without showing what signing is FOR. Opening on the tracking page puts the
// signature inside a system of record: five other agreements, each with its own
// state, and one of them waiting on you.
//
// THE TRACKING PAGE IS A CARD GRID, NOT A TABLE. An earlier version of this act
// used a table, which is wrong: the product's page is a grid whose cards carry
// their signers INDIVIDUALLY, so you can see who has signed and who has only
// been sent it. See docs/agreements-feature-notes.md section 2, and the same
// note at AgreementsHeroTour.tsx:336. The four state pills (Completed, Awaiting,
// Draft, Voided) and the six tab labels with their counts are the product's own.
//
// The round trip is the point. The card the pointer opens is the card that comes
// back Completed, with both signers ticked and a PDF to download, so the page is
// visibly the same object before and after rather than two screens that happen
// to look alike.
//
// The signature is a real stroke being drawn, not a picture of one fading in:
// the path is dash-offset from its own length to zero while the pointer travels
// the pad. A signature that appears all at once reads as a stock image.
//
// The account here belongs to Skylar Lewis, which is who the sidebar says is
// signed in, so the agreement waiting is the one waiting on Skylar.
import { useRef, useState } from "react";
import { useAct, type Rig } from "../rig";
import { Av, ICheck, IClock, IDownload, IPen, IPlus, PageHead, Pill, T } from "../ui";

const SIG_PATH =
  "M12 52C30 18 44 16 50 34c6 18-6 24-10 12C36 34 52 22 70 40c14 14 26-10 34-6 8 4 4 18 16 14 20-6 30-28 48-18 14 8 8 24 22 20 20-6 24-28 42-18 14 8 12 20 26 16 14-4 22-14 34-8";
const SIG_LEN = 720; // generous over-estimate; fine for a dash offset

const ME = { who: "Skylar Lewis", i: "SL" };

type Signer = { who: string; i: string; done: boolean };
type StateKey = "done" | "wait" | "draft" | "void";

const STATE_META: Record<StateKey, { label: string; color: string; bg: string }> = {
  done: { label: "Completed", color: "#1F8A52", bg: T.greenSoft },
  wait: { label: "Awaiting", color: T.amber, bg: "#FDF1DF" },
  draft: { label: "Draft", color: "#6B665F", bg: "#F0EFEC" },
  void: { label: "Voided", color: "#D8445F", bg: "#FCECEF" },
};

type Deal = {
  name: string;
  party: string;
  signers: Signer[];
  created: string;
  done?: string;
  state: StateKey;
  /** The one the tour opens and signs. */
  mine?: boolean;
};

const DEALS: Deal[] = [
  {
    name: "Mutual NDA",
    party: "Brightline Supply",
    signers: [
      { who: "Priya Anand", i: "PA", done: true },
      { who: ME.who, i: ME.i, done: true },
    ],
    created: "Aug 16, 2026",
    done: "Aug 18, 2026",
    state: "done",
  },
  {
    name: "Client Services Agreement",
    party: "Northwind Ltd",
    signers: [
      { who: "Dana Whitfield", i: "DW", done: true },
      { who: ME.who, i: ME.i, done: false },
    ],
    created: "Aug 20, 2026",
    state: "wait",
    mine: true,
  },
  {
    name: "Contractor Agreement",
    party: "R. Alvarez",
    signers: [
      { who: "Marcus Reed", i: "MR", done: true },
      { who: ME.who, i: ME.i, done: true },
    ],
    created: "Aug 12, 2026",
    done: "Aug 14, 2026",
    state: "done",
  },
  {
    name: "Vendor Terms 2026",
    party: "Not sent yet",
    signers: [],
    created: "Aug 21, 2026",
    state: "draft",
  },
  {
    name: "Event Sponsorship",
    party: "Ridgeline Events",
    signers: [
      { who: "Ryan Cole", i: "RC", done: true },
      { who: "Marcus Reed", i: "MR", done: false },
    ],
    created: "Aug 9, 2026",
    state: "void",
  },
  {
    name: "Supplier Terms",
    party: "Brightline Supply",
    signers: [{ who: "Priya Anand", i: "PA", done: true }],
    created: "Aug 5, 2026",
    done: "Aug 7, 2026",
    state: "done",
  },
];

const MINE = DEALS.findIndex((d) => d.mine);

// The product's own tabs and counts. A page showing zeros everywhere reads as an
// empty account rather than a working one.
//
// `after` is the count once the tour has signed. Three of them have to move, or
// the page contradicts itself: the agreement it just completed would still be
// counted under Needs my signature and missing from Completed. A stale badge is
// the kind of detail that makes a mockup look like a mockup.
const TABS: { l: string; n: string; after?: string; k: "all" | "mine" }[] = [
  { l: "All", n: "9", k: "all" },
  { l: "Needs my signature", n: "1", after: "0", k: "mine" },
  { l: "Awaiting signatures", n: "2", after: "1", k: "all" },
  { l: "Drafts", n: "1", k: "all" },
  { l: "Completed", n: "4", after: "5", k: "all" },
  { l: "Archived", n: "2", k: "all" },
];

type Scene = {
  view: "list" | "sign";
  tab: number;
  hot: string;
  drawn: boolean;
  consent: boolean;
  signed: boolean;
};
const BLANK: Scene = { view: "list", tab: 0, hot: "", drawn: false, consent: false, signed: false };

export default function AgreementsAct({ active, rig }: { active: boolean; rig: Rig }) {
  const [s, setScene] = useState<Scene>(BLANK);
  // Scopes cursor-target lookups to THIS copy of the act. See ActApi.q.
  const rootRef = useRef<HTMLDivElement>(null);

  useAct(active, rig, rootRef, () => setScene(BLANK), async ({ alive, wait, rig: r, q }) => {
    const patch = (p: Partial<Scene>) => alive() && setScene((x) => ({ ...x, ...p }));
    const hit = (k: string) => q(`[data-ag="${k}"]`);
    const tap = async (key: string, dur = 440, hold = 200) => {
      await r.glide(hit(key), 0.5, 0.5, dur);
      if (!alive()) return false;
      patch({ hot: key });
      await wait(hold);
      if (!alive()) return false;
      await r.click();
      patch({ hot: "" });
      return alive();
    };

    r.at(hit("tab1"), 0.5, 0.5);
    await r.fade(1, 200);
    if (!alive()) return;
    // Let the grid be read before anything moves: six agreements, four states.
    await wait(1100);

    // ---- 1b. find the one waiting on me
    if (!(await tap("tab1", 420, 220))) return;
    patch({ tab: 1 });
    await wait(780);

    // ---- 5. open it and sign it
    if (!(await tap("card", 460, 220))) return;
    patch({ view: "sign" });
    await wait(620);

    r.at(hit("pad"), 0.06, 0.78);
    await wait(200);
    if (!alive()) return;
    patch({ drawn: true });
    await r.glide(hit("pad"), 0.94, 0.42, 1180);
    if (!alive()) return;
    await wait(260);

    if (!(await tap("consent", 420, 200))) return;
    patch({ consent: true });
    await wait(300);

    if (!(await tap("submit", 440, 220))) return;
    patch({ view: "list", signed: true, tab: 0 });
    await r.fade(0, 300);
  });

  const visible = s.tab === 1 ? DEALS.filter((d) => d.mine) : DEALS;
  const deal = DEALS[MINE];

  return (
    <div ref={rootRef} className="relative h-full">
      {/* ---------------- the tracking page ---------------- */}
      <div
        className="absolute inset-0 flex flex-col gap-3 transition-all duration-[320ms] ease-out"
        style={{
          opacity: s.view === "list" ? 1 : 0,
          transform: s.view === "list" ? "scale(1)" : "scale(0.985)",
          pointerEvents: "none",
        }}
      >
        <PageHead
          title="Agreements"
          sub="What is signed, what is waiting, and on whom."
          right={
            <span
              className="inline-flex items-center gap-[6px] rounded-[8px] px-[13px] py-2 text-[12.5px] font-semibold text-white"
              style={{ background: T.navy }}
            >
              <IPlus className="h-[13px] w-[13px]" />
              New agreement
            </span>
          }
        />

        {/* the product's tab set */}
        <div className="flex flex-none items-center gap-1">
          {TABS.map((tb, i) => {
            const on = i === s.tab;
            return (
              <span
                key={tb.l}
                data-ag={i === 1 ? "tab1" : undefined}
                className="flex items-center gap-[6px] rounded-[8px] px-[10px] py-[6px] text-[11.5px] transition-colors duration-200"
                style={{
                  background: on ? T.orangeSoft : s.hot === "tab1" && i === 1 ? "#F4F1EB" : "transparent",
                  color: on ? T.orange : T.muted,
                  fontWeight: on ? 650 : 500,
                }}
              >
                {tb.l}
                <span
                  className="rounded-full px-[6px] py-px text-[9.5px] font-bold tabular-nums"
                  style={{
                    background: on ? "rgba(234,123,27,0.16)" : "#F1EEE9",
                    color: on ? T.orange : T.muted2,
                  }}
                >
                  {s.signed && tb.after ? tb.after : tb.n}
                </span>
              </span>
            );
          })}
        </div>

        {/* the card grid */}
        <div className="grid min-h-0 flex-1 grid-cols-3 content-start gap-3">
          {visible.map((d) => {
            const isMine = !!d.mine;
            // The one card that changes: after Save it is Completed and both
            // signers are ticked.
            const st = STATE_META[isMine && s.signed ? "done" : d.state];
            const signers = isMine && s.signed ? d.signers.map((g) => ({ ...g, done: true })) : d.signers;
            return (
              <div
                key={d.name}
                data-ag={isMine ? "card" : undefined}
                className="flex flex-col rounded-[12px] border bg-white px-[13px] py-[11px] transition-all duration-[280ms]"
                style={{
                  borderColor: s.hot === "card" && isMine ? T.orange : T.hair,
                  boxShadow: s.hot === "card" && isMine ? "0 0 0 3px rgba(234,123,27,0.16)" : undefined,
                }}
              >
                <div className="flex items-start gap-2">
                  <IPen
                    className="mt-[2px] h-[14px] w-[14px] flex-none"
                    style={{ color: st.label === "Completed" ? T.green : T.muted2 }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-bold leading-tight">{d.name}</span>
                    <span className="block truncate text-[10.5px]" style={{ color: T.muted2 }}>
                      {d.party}
                    </span>
                  </span>
                </div>

                <span className="mt-[9px]">
                  <Pill bg={st.bg} fg={st.color}>
                    {st.label === "Completed" && <ICheck className="h-[9px] w-[9px]" />}
                    {st.label === "Awaiting" && <IClock className="h-[9px] w-[9px]" />}
                    {st.label}
                  </Pill>
                </span>

                {/* who has signed, and who has only been sent it */}
                <div className="mt-[9px] min-h-[34px] flex-1">
                  {signers.length === 0 ? (
                    <span className="text-[10px] italic" style={{ color: T.muted2 }}>
                      No signers yet
                    </span>
                  ) : (
                    <>
                      <div className="text-[9px] font-bold uppercase tracking-[0.09em]" style={{ color: T.muted2 }}>
                        {signers.length} signer{signers.length === 1 ? "" : "s"}
                      </div>
                      {signers.map((g) => (
                        <div key={g.who} className="mt-[3px] flex items-center gap-[6px]">
                          <Av n={g.i} size={16} bg={g.done ? T.green : "#C9C2B6"} />
                          <span className="min-w-0 flex-1 truncate text-[10px]" style={{ color: "#4A4A4A" }}>
                            {g.who}
                          </span>
                          <span
                            className="flex-none text-[9px] font-bold uppercase tracking-[0.06em]"
                            style={{ color: g.done ? "#1F8A52" : T.amber }}
                          >
                            {g.done ? "Signed" : "Sent"}
                          </span>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                <div
                  className="mt-[9px] flex items-center gap-2 border-t pt-[7px] text-[9.5px]"
                  style={{ borderColor: T.hair, color: T.muted2 }}
                >
                  <span>
                    {isMine && s.signed ? "Completed just now" : d.done ? `Completed ${d.done}` : `Created ${d.created}`}
                  </span>
                  {(d.state === "done" || (isMine && s.signed)) && (
                    <span
                      className="ml-auto inline-flex items-center gap-[4px] rounded-[6px] border px-[7px] py-[2px] text-[9.5px] font-semibold"
                      style={{ borderColor: T.hair2, color: "#44403A" }}
                    >
                      <IDownload className="h-[10px] w-[10px]" />
                      PDF
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ---------------- the signer's view ---------------- */}
      <div
        className="absolute inset-0 flex flex-col gap-3 transition-all duration-[320ms] ease-out"
        style={{
          opacity: s.view === "sign" ? 1 : 0,
          transform: s.view === "sign" ? "scale(1)" : "scale(1.012)",
          pointerEvents: "none",
        }}
      >
        <PageHead
          title={deal.name}
          sub={`${deal.party} · sent by Dana Whitfield on Aug 20, 2026`}
          right={
            <Pill bg={T.amberSoft} fg={T.amber}>
              <IClock className="h-[11px] w-[11px]" />
              Awaiting your signature
            </Pill>
          }
        />

        <div
          className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[12px] border bg-white"
          style={{ borderColor: T.hair }}
        >
          <div className="flex-none border-b px-5 py-4" style={{ borderColor: T.hair }}>
            <div className="grid grid-cols-3 gap-4">
              {[
                ["Client", deal.party],
                ["Engagement", "Implementation & Coaching"],
                ["Term", "12 months from Sep 1, 2026"],
                ["Monthly fee", "$4,800"],
                ["Primary contact", "Dana Whitfield"],
                ["Governing law", "State of Texas"],
              ].map(([k, v]) => (
                <div key={k}>
                  <div className="text-[9.5px] font-bold uppercase tracking-[0.09em]" style={{ color: T.muted2 }}>
                    {k}
                  </div>
                  <div className="mt-[3px] text-[12.5px] font-semibold">{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col justify-center px-5 py-4">
            <div className="text-[10.5px] font-bold uppercase tracking-[0.09em]" style={{ color: T.muted }}>
              Sign here
            </div>

            <div
              data-ag="pad"
              className="relative mt-2 h-[86px] w-full max-w-[440px] overflow-hidden rounded-[10px] border transition-colors"
              style={{
                borderColor: s.drawn ? T.orange : T.hair2,
                borderStyle: s.drawn ? "solid" : "dashed",
                background: "#FDFCFB",
              }}
            >
              <svg viewBox="0 0 320 70" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
                <path
                  d={SIG_PATH}
                  fill="none"
                  stroke={T.ink}
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    strokeDasharray: SIG_LEN,
                    strokeDashoffset: s.drawn ? 0 : SIG_LEN,
                    transition: "stroke-dashoffset 1180ms cubic-bezier(0.4,0.1,0.3,1)",
                  }}
                />
              </svg>
              {!s.drawn && (
                <span className="absolute bottom-2 left-3 text-[11.5px]" style={{ color: T.muted2 }}>
                  Draw your signature
                </span>
              )}
            </div>

            <div
              className="mt-1 flex items-center gap-2 text-[11px] transition-opacity duration-500"
              style={{ color: T.muted2, opacity: s.drawn ? 1 : 0 }}
            >
              <IPen className="h-[12px] w-[12px]" />
              {ME.who} · signed on this device · Aug 22, 2026 at 2:41 PM
            </div>

            <div data-ag="consent" className="mt-4 flex items-start gap-[10px]">
              <span
                className="mt-[1px] grid h-4 w-4 flex-none place-items-center rounded-[4px] border transition-all duration-[260ms]"
                style={{
                  borderColor: s.consent ? T.green : T.hair2,
                  background: s.consent ? T.green : "#fff",
                }}
              >
                <ICheck
                  className="h-[11px] w-[11px] text-white transition-all duration-[220ms]"
                  style={{ opacity: s.consent ? 1 : 0, transform: s.consent ? "scale(1)" : "scale(0.5)" }}
                />
              </span>
              <span className="text-[12.5px] leading-[1.5]" style={{ color: "#3C3833" }}>
                I agree to be legally bound by this document and consent to do business electronically.
              </span>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <span
                data-ag="submit"
                className="inline-flex items-center gap-2 rounded-[9px] px-[18px] py-[10px] text-[13px] font-[650] text-white transition-all"
                style={{
                  background: s.consent ? T.orange : "#D9D5CE",
                  boxShadow: s.hot === "submit" ? "0 0 0 4px rgba(234,123,27,0.3)" : undefined,
                }}
              >
                <IPen className="h-[14px] w-[14px]" />
                Sign and submit
              </span>
              <span className="text-[11.5px]" style={{ color: T.muted2 }}>
                A copy is emailed to both parties the moment you submit.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
