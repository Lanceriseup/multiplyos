"use client";

// Tab 10 of 10: Forms.
//
// Short cut of FormsHeroTour, which runs eight beats over about thirty-six
// seconds. Two survive, the first and the last:
//
//   3. the builder     click three fields in
//   7. Publish        the public link on your own subdomain
//   8. the QR code     the thing you put on a flyer
//   6. the live form   the form as a person filling it in actually sees it
//
// Dropped: the 26-form library, naming the form, email notifications, the
// Sheets / Ontraport / webhook integrations, and the filled-in preview. The
// integrations are the strongest half of the full tour's argument and the
// hardest to compress, because "and then the response goes somewhere" needs
// three destinations on screen to read as a claim about your stack rather than
// about one app.
//
// The LIVE FORM at the end was added on the client's request, and it closes a
// real gap: the act used to say the form was published and then show a URL and a
// QR code, neither of which IS the form. You never saw the thing you built. The
// builder now hands over to the public page on forms.multiplyos.com, rendered
// the way somebody filling it in sees it, with the five fields in the order they
// were added and the required one marked.
//
// So the act reads build -> publish -> and here is what the world gets, which is
// the shortest honest version of this page.
import { useRef, useState } from "react";
import { useAct, type Rig } from "../rig";
import {
  ICheck,
  IChevron,
  IDoc,
  IDownload,
  IEye,
  IPen,
  IQr,
  ISend,
  PageHead,
  Pill,
  T,
} from "../ui";

type FieldKind = "text" | "email" | "phone" | "select" | "date" | "file" | "sign" | "long";

const PALETTE: { k: FieldKind; label: string }[] = [
  { k: "text", label: "Short text" },
  { k: "long", label: "Long text" },
  { k: "email", label: "Email" },
  { k: "phone", label: "Phone" },
  { k: "select", label: "Dropdown" },
  { k: "date", label: "Date" },
  { k: "file", label: "File upload" },
  { k: "sign", label: "Signature" },
];

const BASE: { k: FieldKind; label: string; ph: string }[] = [
  { k: "text", label: "Full name", ph: "Dana Whitfield" },
  { k: "text", label: "Company", ph: "Northwind Ltd" },
];

/** The three the tour clicks in, in order, and where they come from in the palette. */
const ADDED: { k: FieldKind; label: string; ph: string; from: number }[] = [
  { k: "email", label: "Email address", ph: "you@company.com", from: 2 },
  { k: "select", label: "Service interested in", ph: "Choose one", from: 4 },
  { k: "file", label: "Upload your logo", ph: "PNG or SVG, up to 10MB", from: 6 },
];

const PUBLIC_URL = "forms.multiplyos.com/company/new-client-intake";

// A deterministic 21x21 module pattern. It must not use Math.random: the page is
// server-rendered and a different pattern on the client would be a hydration
// mismatch.
const QR_N = 21;
function qrOn(x: number, y: number) {
  const finder = (ox: number, oy: number) => {
    const dx = x - ox;
    const dy = y - oy;
    if (dx < 0 || dy < 0 || dx > 6 || dy > 6) return null;
    const ring = Math.max(Math.abs(dx - 3), Math.abs(dy - 3));
    return ring === 3 || ring === 1 ? false : true;
  };
  for (const [ox, oy] of [
    [0, 0],
    [QR_N - 7, 0],
    [0, QR_N - 7],
  ]) {
    const f = finder(ox, oy);
    if (f !== null) return f;
  }
  return (x * 7 + y * 13 + x * y * 3) % 5 < 2;
}

type Scene = {
  added: number;
  hot: number | null;
  pubHot: boolean;
  published: boolean;
  /** The public page has taken over from the builder. */
  live: boolean;
};
const BLANK: Scene = { added: 0, hot: null, pubHot: false, published: false, live: false };

export default function FormsAct({ active, rig }: { active: boolean; rig: Rig }) {
  const [s, setScene] = useState<Scene>(BLANK);
  // Scopes cursor-target lookups to THIS copy of the act. See ActApi.q.
  const rootRef = useRef<HTMLDivElement>(null);

  useAct(active, rig, rootRef, () => setScene(BLANK), async ({ alive, wait, rig: r, q }) => {
    const patch = (p: Partial<Scene>) => alive() && setScene((x) => ({ ...x, ...p }));
    const hit = (k: string) => q(`[data-fm="${k}"]`);

    r.at(hit(`p${ADDED[0].from}`), 0.5, 0.5);
    await r.fade(1, 200);
    if (!alive()) return;
    await wait(220);

    // ---- click three fields in
    for (let i = 0; i < ADDED.length; i++) {
      if (!alive()) return;
      patch({ hot: ADDED[i].from });
      await r.tap(hit(`p${ADDED[i].from}`), 0.5, 0.5, i === 0 ? 400 : 320);
      if (!alive()) return;
      patch({ hot: null, added: i + 1 });
      await wait(230);
    }

    await wait(220);

    // ---- publish it
    if (!alive()) return;
    patch({ pubHot: true });
    await r.tap(hit("publish"), 0.5, 0.5, 460);
    if (!alive()) return;
    patch({ pubHot: false, published: true });
    await r.fade(0, 300);
    if (!alive()) return;
    // Let the link and the QR land before the page they point at takes over.
    await wait(1600);
    patch({ live: true });
  });

  const fields = [...BASE, ...ADDED.slice(0, s.added)];

  return (
    <div ref={rootRef} className="relative h-full">
      {/* ---------------- the live public form ----------------
          What the world actually gets. Sits above the builder and fades in over
          it, so the handover reads as "and here it is" rather than as a
          navigation. Rendered from the same `fields` array the builder just
          assembled, in the order they were added. */}
      <div
        className="absolute inset-0 z-20 flex flex-col items-center overflow-hidden transition-all duration-[460ms] ease-out"
        style={{
          background: T.ground,
          opacity: s.live ? 1 : 0,
          transform: s.live ? "translateY(0)" : "translateY(10px)",
          pointerEvents: "none",
        }}
      >
        {/* The public address, labelled as a preview. The browser chrome above
            still reads app.multiplyos.com, because the app is showing you the
            live page rather than navigating to it, and an unlabelled full-bleed
            form under an app URL is a small lie. */}
        <div className="mt-1 flex flex-none items-center gap-2">
          <span className="text-[9.5px] font-bold uppercase tracking-[0.1em]" style={{ color: T.muted2 }}>
            Live form
          </span>
          <span
            className="flex items-center gap-2 rounded-full border bg-white px-3 py-[5px] text-[11px]"
            style={{ borderColor: T.hair2, color: T.muted }}
          >
            <svg viewBox="0 0 24 24" className="h-[11px] w-[11px] flex-none" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="5" y="11" width="14" height="9" rx="2" />
              <path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3" />
            </svg>
            {PUBLIC_URL}
            <Pill bg={T.greenSoft} fg="#1F8A52">
              Live
            </Pill>
          </span>
        </div>

        {/* The QR follows the form in, top-right, instead of being covered by
            it. It only had 1.6s of screen time when the publish panel below was
            the only place it appeared. */}
        <div
          className="absolute right-1 top-1 flex items-center gap-[10px] rounded-[10px] border bg-white px-[11px] py-2"
          style={{ borderColor: T.hair2, boxShadow: "0 8px 20px -14px rgba(40,30,15,0.35)" }}
        >
          <span className="flex-none whitespace-nowrap text-right">
            <span className="flex items-center justify-end gap-[5px] text-[10.5px] font-bold">
              <IQr className="h-[12px] w-[12px]" style={{ color: T.orange }} />
              Scan to open
            </span>
            <span className="mt-[1px] block text-[9.5px]" style={{ color: T.muted2 }}>
              Put it on a flyer
            </span>
          </span>
          <div
            className="grid flex-none rounded-[6px] border bg-white p-[4px]"
            style={{
              borderColor: T.hair2,
              gridTemplateColumns: `repeat(${QR_N}, 2.4px)`,
              gridTemplateRows: `repeat(${QR_N}, 2.4px)`,
            }}
          >
            {Array.from({ length: QR_N * QR_N }, (_, i) => {
              const x = i % QR_N;
              const y = Math.floor(i / QR_N);
              return <span key={i} style={{ background: qrOn(x, y) ? T.ink : "transparent" }} />;
            })}
          </div>
        </div>

        <div
          className="mt-3 w-full max-w-[520px] rounded-[14px] border bg-white px-6 py-5"
          style={{ borderColor: T.hair, boxShadow: "0 18px 40px -24px rgba(40,30,15,0.35)" }}
        >
          <div className="flex items-center gap-2">
            <span
              className="grid h-[22px] w-[22px] flex-none place-items-center rounded-[6px] text-[11px] font-black text-white"
              style={{ background: T.orange }}
            >
              M
            </span>
            <span className="text-[11px] font-bold" style={{ color: T.muted }}>
              Company
            </span>
          </div>

          <h3 className="mt-3 text-[19px] font-[780] tracking-[-0.02em]">New Client Intake</h3>
          <p className="mt-1 text-[11.5px]" style={{ color: T.muted }}>
            Tell us a little about your business and we will be in touch within one working day.
          </p>

          <div className="mt-4">
            {fields.map((f) => (
              <div key={f.label} className="mb-[11px]">
                <div className="flex items-center gap-[6px]">
                  <span className="text-[11px] font-bold">{f.label}</span>
                  {f.k === "email" && (
                    <span className="text-[13px] leading-none" style={{ color: T.pinkInk }}>
                      *
                    </span>
                  )}
                </div>
                {f.k === "file" ? (
                  <div
                    className="mt-[5px] flex h-[38px] items-center justify-center gap-2 rounded-[8px] border border-dashed text-[11.5px]"
                    style={{ borderColor: T.hair2, color: T.muted2 }}
                  >
                    <IDownload className="h-[13px] w-[13px] rotate-180" />
                    {f.ph}
                  </div>
                ) : f.k === "select" ? (
                  <div
                    className="mt-[5px] flex h-[34px] items-center gap-2 rounded-[8px] border px-3 text-[12px]"
                    style={{ borderColor: T.hair2, color: T.muted2 }}
                  >
                    {f.ph}
                    <IChevron className="ml-auto h-[12px] w-[12px] rotate-90" />
                  </div>
                ) : (
                  <div
                    className="mt-[5px] flex h-[34px] items-center rounded-[8px] border px-3 text-[12px]"
                    style={{ borderColor: T.hair2, color: T.muted2 }}
                  >
                    {f.ph}
                  </div>
                )}
              </div>
            ))}
          </div>

          <span
            className="mt-1 flex h-[38px] items-center justify-center rounded-[9px] text-[13px] font-[650] text-white"
            style={{ background: T.orange }}
          >
            Submit
          </span>
          <p className="mt-[9px] text-center text-[9.5px]" style={{ color: T.muted2 }}>
            Powered by Multiply OS
          </p>
        </div>
      </div>

      <div className="flex h-full flex-col gap-3">
      <PageHead
        title="New Client Intake"
        sub="Forms & Checklists / New Client Intake"
        right={
          <>
            <span
              className="inline-flex h-[32px] items-center gap-[7px] rounded-[8px] border bg-white px-3 text-[12.5px] font-[550]"
              style={{ borderColor: T.hair2, color: "#44403A" }}
            >
              <IEye className="h-[13px] w-[13px]" style={{ color: T.muted }} />
              Preview
            </span>
            <span
              data-fm="publish"
              className="inline-flex items-center gap-[6px] rounded-[8px] px-[13px] py-2 text-[12.5px] font-[650] text-white transition-all"
              style={{
                background: s.published ? T.green : T.orange,
                boxShadow: s.pubHot ? "0 0 0 4px rgba(234,123,27,0.3)" : undefined,
              }}
            >
              {s.published ? <ICheck className="h-[13px] w-[13px]" /> : <ISend className="h-[13px] w-[13px]" />}
              {s.published ? "Published" : "Publish"}
            </span>
          </>
        }
      />

      <div className="grid min-h-0 flex-1 gap-3" style={{ gridTemplateColumns: "176px 1fr" }}>
        {/* ---- the palette ---- */}
        <div className="flex min-h-0 flex-col overflow-hidden rounded-[12px] border bg-white" style={{ borderColor: T.hair }}>
          <div
            className="flex-none border-b px-3 py-[9px] text-[9.5px] font-bold uppercase tracking-[0.09em]"
            style={{ borderColor: T.hair, color: T.muted }}
          >
            Add a field
          </div>
          <div className="flex-1 p-2">
            {PALETTE.map((p, i) => (
              <div
                key={p.k}
                data-fm={`p${i}`}
                className="mb-[3px] flex items-center gap-[9px] rounded-[8px] border px-[9px] py-[7px] text-[12px] font-semibold transition-all duration-150"
                style={{
                  borderColor: s.hot === i ? T.orange : "transparent",
                  background: s.hot === i ? T.orangeSoft : "#FBFAF8",
                  color: s.hot === i ? T.orange : "#44403A",
                }}
              >
                <IDoc className="h-[13px] w-[13px] flex-none" style={{ color: s.hot === i ? T.orange : T.muted2 }} />
                {p.label}
              </div>
            ))}
          </div>
        </div>

        {/* ---- the form canvas ---- */}
        <div className="flex min-h-0 flex-col overflow-hidden rounded-[12px] border bg-white" style={{ borderColor: T.hair }}>
          <div className="flex flex-none items-center gap-2 border-b px-4 py-[10px]" style={{ borderColor: T.hair }}>
            <b className="text-[13px]">Form fields</b>
            <Pill bg="#F1EEE9" fg={T.muted}>
              {fields.length} fields
            </Pill>
            <span className="ml-auto text-[11px]" style={{ color: T.muted2 }}>
              Drag to reorder
            </span>
          </div>

          <div className="flex-1 px-4 py-3">
            {fields.map((f, i) => {
              const fresh = i >= BASE.length;
              return (
                <div
                  key={f.label}
                  className="mb-[10px] transition-all duration-[300ms] ease-out"
                  style={{
                    opacity: 1,
                    animation: fresh ? "homeTourDrop 320ms cubic-bezier(0.22,1,0.36,1)" : undefined,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[11.5px] font-bold">{f.label}</span>
                    {f.k === "email" && (
                      <Pill bg={T.blueSoft} fg={T.blue}>
                        Required
                      </Pill>
                    )}
                  </div>
                  <div
                    className="mt-[5px] flex h-[34px] items-center gap-2 rounded-[8px] border px-3 text-[12px]"
                    style={{ borderColor: T.hair2, background: "#FDFCFB", color: T.muted2 }}
                  >
                    {f.k === "file" ? (
                      <>
                        <IDownload className="h-[13px] w-[13px] rotate-180" />
                        {f.ph}
                      </>
                    ) : f.k === "select" ? (
                      <>
                        {f.ph}
                        <IChevron className="ml-auto h-[12px] w-[12px] rotate-90" />
                      </>
                    ) : (
                      f.ph
                    )}
                  </div>
                </div>
              );
            })}

            <div
              className="flex h-[38px] items-center justify-center rounded-[8px] border border-dashed text-[11.5px]"
              style={{ borderColor: T.hair2, color: T.muted2 }}
            >
              Click a field on the left to add it here
            </div>
          </div>
        </div>
      </div>

      {/* ---- what you get when you publish ---- */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-4 rounded-[12px] border px-4 py-[14px] transition-all duration-[420ms] ease-out"
        style={{
          borderColor: "#CFE6D8",
          background: "#F6FCF8",
          boxShadow: "0 -10px 30px -18px rgba(40,30,15,0.3)",
          opacity: s.published ? 1 : 0,
          transform: s.published ? "translateY(0)" : "translateY(14px)",
        }}
      >
        <span
          className="grid h-[26px] w-[26px] flex-none place-items-center rounded-full"
          style={{ background: T.green }}
        >
          <ICheck className="h-[14px] w-[14px] text-white" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="text-[12.5px] font-bold" style={{ color: "#1F6A44" }}>
            Live on your own subdomain
          </div>
          <div
            className="mt-[5px] inline-flex max-w-full items-center gap-2 rounded-[7px] border bg-white px-[9px] py-[5px] text-[11.5px]"
            style={{ borderColor: "#CFE6D8" }}
          >
            <span className="truncate font-semibold">{PUBLIC_URL}</span>
            <span className="flex-none font-semibold" style={{ color: T.green }}>
              Copy
            </span>
          </div>
        </div>

        {/* the QR */}
        <div className="flex flex-none items-center gap-3">
          <div className="text-right">
            <div className="flex items-center justify-end gap-[6px] text-[11.5px] font-bold">
              <IQr className="h-[13px] w-[13px]" style={{ color: "#1F6A44" }} />
              QR code
            </div>
            <div className="mt-[2px] text-[10.5px]" style={{ color: T.muted }}>
              Put it on a flyer, a
              <br />
              door, or a name badge.
            </div>
          </div>
          <div
            className="grid flex-none rounded-[7px] border bg-white p-[5px]"
            style={{
              borderColor: "#CFE6D8",
              gridTemplateColumns: `repeat(${QR_N}, 2.9px)`,
              gridTemplateRows: `repeat(${QR_N}, 2.9px)`,
            }}
          >
            {Array.from({ length: QR_N * QR_N }, (_, i) => {
              const x = i % QR_N;
              const y = Math.floor(i / QR_N);
              return (
                <span
                  key={i}
                  style={{ background: qrOn(x, y) ? T.ink : "transparent" }}
                />
              );
            })}
          </div>
        </div>
      </div>
      </div>

      <style>{`@keyframes homeTourDrop{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
