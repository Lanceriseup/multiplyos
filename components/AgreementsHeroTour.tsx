"use client";

// Animated hero for the Agreements feature page.
//
// The product's own line decides the loop: "An agreement is a form with a
// signature on it." So the tour has to show the form being scaffolded, then the
// signature actually happening, then the executed copy landing back on the
// tracking page. Nothing else earns its place.
//
//   1. the Agreements page      what is signed, what is waiting on whom
//   2. New agreement            name it, and the scaffold picker
//   3. the builder              the whole agreement laid out, Signature last
//   4. the signer's view        draw a signature, consent, Sign and submit
//   5. back to Agreements       the row lands, signed, with a download
//
// The signing beat is the payoff, so it holds longest.
//
// Same architecture as the other six hero tours: the app is React state, only the
// cursor and its ripple are animated imperatively through the Web Animations API,
// and the sequence is generation-token guarded so a re-render or unmount cancels
// the in-flight tour rather than leaving orphaned timers behind.
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

const MIN_W = 980;
const STAGE_H = 500;
const EASE = "cubic-bezier(0.22,1,0.36,1)";

// Three wide wordmarks, so they render shorter than the single-logo pages do.
// Heights get re-tuned per logo once the artwork lands, the way the Forms three
// were, because the exports never share a trim.

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

// A page with a pen across it, matching the product's Agreements glyph.
const SignDoc = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
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
const Plus = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2.4}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const Tick = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico} strokeWidth={2.6}>
    <path d="M5 12l5 5L20 7" />
  </svg>
);
const ArrowLeft = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2}>
    <path d="M19.2 12H4.8M10.6 6.4L4.8 12l5.8 5.6" />
  </svg>
);
const Download = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M12 4.6v11M7.4 11l4.6 4.6L16.6 11M4.4 19.4h15.2" />
  </svg>
);
const ClockIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <circle cx="12" cy="12" r="8.4" />
    <path d="M12 7.4V12l3 1.8" />
  </svg>
);
const Eye = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M2.6 12S6 5.8 12 5.8 21.4 12 21.4 12 18 18.2 12 18.2 2.6 12 2.6 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const Rocket = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M14.6 3.6c2.4 1.2 4.4 3.4 5.8 5.8L14 15.8l-5.8-5.8z" />
    <path d="M8.2 10L4.4 11.4l2 2M14 15.8l-1.4 3.8-2-2" />
    <circle cx="15.4" cy="8.6" r="1.4" />
  </svg>
);
const Palette = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M12 20.4a8.4 8.4 0 1 1 8.4-8.4c0 2.2-1.8 3-3.4 3h-1.4a2 2 0 0 0-1.4 3.4 1.6 1.6 0 0 1-1.2 2z" />
    <circle cx="8.4" cy="10" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="7.6" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="15.6" cy="10" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);
const Share = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <circle cx="17.6" cy="5.8" r="2.3" />
    <circle cx="6.4" cy="12" r="2.3" />
    <circle cx="17.6" cy="18.2" r="2.3" />
    <path d="M8.4 10.9l7.2-3.9M8.4 13.1l7.2 3.9" />
  </svg>
);
const Chat = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M20.4 12.6a7.4 7.4 0 0 1-7.4 7.4 8 8 0 0 1-3.3-.7L4.4 21l1.7-4.9a7.4 7.4 0 1 1 14.3-3.5z" />
  </svg>
);
const Grid = ({ className }: IconProps) => (
  <svg className={className} {...ico} strokeWidth={2}>
    <rect x="4" y="4" width="6.4" height="6.4" rx="1.4" />
    <rect x="13.6" y="4" width="6.4" height="6.4" rx="1.4" />
    <rect x="4" y="13.6" width="6.4" height="6.4" rx="1.4" />
    <rect x="13.6" y="13.6" width="6.4" height="6.4" rx="1.4" />
  </svg>
);
const People = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <circle cx="9.2" cy="8.4" r="3" />
    <path d="M3.6 18.6c0-2.8 2.5-4.6 5.6-4.6s5.6 1.8 5.6 4.6" />
    <path d="M16.2 6.2a3 3 0 0 1 0 5.6M17.4 14.6c1.9.6 3.2 1.9 3.2 4" />
  </svg>
);
const Bell = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M17.6 11.6a5.6 5.6 0 1 0-11.2 0c0 4.2-1.8 5.4-1.8 5.4h14.8s-1.8-1.2-1.8-5.4z" />
    <path d="M10.4 20a1.9 1.9 0 0 0 3.2 0" />
  </svg>
);
const Plug = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M9 3.4v5M15 3.4v5" />
    <path d="M6.6 8.4h10.8v2.4a5.4 5.4 0 0 1-10.8 0z" />
    <path d="M12 16.2v4.4" />
  </svg>
);
const Sliders = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
    <path d="M4.4 7.2h8M16.4 7.2h3.2M4.4 16.8h3.2M11.6 16.8h8" />
    <circle cx="14.2" cy="7.2" r="2.2" />
    <circle cx="9.4" cy="16.8" r="2.2" />
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
const MailIcon = ({ className }: IconProps) => (
  <svg className={className} {...ico}>
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
const ShieldCheck = ({ className, style }: IconProps) => (
  <svg className={className} style={style} {...ico}>
    <path d="M12 3.4l7.4 2.6v5.6c0 4.2-3 7.6-7.4 9-4.4-1.4-7.4-4.8-7.4-9V6z" />
    <path d="M8.8 12l2.2 2.2 4.2-4.4" />
  </svg>
);
const Spark = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.6 4L18 8.5 14 10l-2 4-2-4-4-1.5L10 7z" />
  </svg>
);
const Undo = ({ className }: IconProps) => (
  <svg className={className} {...ico}><path d="M4 9.4h9.6a4.4 4.4 0 0 1 0 8.8H8" /><path d="M6.8 6.2L4 9.4l2.8 3.2" /></svg>
);
const Eraser = ({ className }: IconProps) => (
  <svg className={className} {...ico}><path d="M8.6 19.4h10.8" /><path d="M14.2 5.4l4.4 4.4-8 8H6.4l-1.8-1.8z" /></svg>
);

// ---------------------------------------------------------------- data
const INK = "#1F5F7A";
const GREEN = "#2BA463";
const AMBER = "#C9832B";

const NEW_NAME = "Client Services Agreement";
const PUBLIC_URL = "forms.yourcompany.com/client-services";
const SIGNER = "Jordan Rivera";

// The scaffold picker, exactly as the modal lists it. Signature is not a
// checkbox: it is what makes this an agreement rather than a form.
const SCAFFOLD = [
  { key: "sig", label: "Signature", sub: "Always included. It is what turns the form into a tracked, legally-binding agreement.", forced: true, on: true },
  { key: "terms", label: "Terms section", sub: "A heading and text block to paste your agreement language into.", on: true },
  { key: "name", label: "Signer's full name", sub: "Printed name to accompany the signature.", on: true },
  { key: "email", label: "Signer's email", sub: "Where the countersigned copy is sent.", on: true },
  { key: "date", label: "Date signed", sub: "Pre-filled with the signer's current date.", on: true },
  { key: "agree", label: "Explicit “I agree” checkbox", sub: "An additional acknowledgement. Electronic-signature consent is always collected separately at submit.", on: false },
];

// What the create action lays out in the builder, in order.
const BUILT = [
  { label: "Agreement terms", kind: "Section heading", icon: Heading },
  { label: "Replace this text with the terms of your agreement.", kind: "Text block", icon: Para },
  { label: "Full legal name", kind: "Full name", icon: People, req: true },
  { label: "Email address", kind: "Email", icon: MailIcon, req: true },
  { label: "I have read and agree to the terms above.", kind: "Consent / agreement", icon: ShieldCheck, req: true },
  { label: "Date signed", kind: "Date", icon: Cal, req: true },
  { label: "Signature", kind: "Signature", icon: PenNib, req: true },
];

const STAGES = [
  { key: "build", label: "Build", sub: "Fields & layout", icon: Grid },
  { key: "recipients", label: "Recipients", sub: "1 added", icon: People },
  { key: "notify", label: "Email Notifications", sub: "1 address", icon: Bell },
  { key: "integrations", label: "Integrations", sub: "Sheets, CRM, tasks", icon: Plug },
  { key: "settings", label: "Settings", sub: "Layout, link, security", icon: Sliders },
];

// The tracking list. Only the empty state has been screenshotted, so the columns
// here are inferred from the page's own subtitle and the help centre. See
// docs/agreements-feature-notes.md section 2.
type Deal = { name: string; who: string; when: string; state: "signed" | "them" | "you" };

const DEALS: Deal[] = [
  { name: "Mutual NDA", who: "Priya Nair", when: "signed Aug 18", state: "signed" },
  { name: "Contractor Agreement", who: "Marcus Hale", when: "signed Aug 14", state: "signed" },
  { name: "Policy Acknowledgment", who: "Kath Nakamura", when: "sent Aug 20", state: "them" },
  { name: "Vendor Terms 2026", who: "waiting on you", when: "sent Aug 21", state: "you" },
];

const STATE_META = {
  signed: { label: "Signed", color: GREEN, bg: "#EAF7F0" },
  them: { label: "Awaiting them", color: AMBER, bg: "#FDF1DF" },
  you: { label: "Awaiting you", color: INK, bg: "#E6F0F5" },
} as const;

// ---------------------------------------------------------------- scene
type View = "list" | "builder" | "sign";

type Scene = {
  // The whole card faded out, so the loop restarts on a fade rather than a cut.
  dim: boolean;
  view: View;
  modal: "" | "new";
  hot: string;
  typed: string;
  caret: boolean;
  agree: boolean; // the optional "I agree" box in the scaffold picker
  built: number; // how many BUILT rows exist
  // the signer
  mode: "draw" | "type";
  drawn: number; // 0..1, how much of the signature stroke is inked
  consent: boolean;
  submitted: boolean;
  landed: boolean; // the new row on the tracking page
};

const BLANK: Scene = {
  dim: false,
  view: "list", modal: "", hot: "", typed: "", caret: false, agree: false,
  built: 0, mode: "draw", drawn: 0, consent: false, submitted: false, landed: false,
};

// The static frame under prefers-reduced-motion: the signed agreement tracked on
// the list, since that is the outcome the loop exists to reach.
const STILL: Scene = { ...BLANK, landed: true };

// ---------------------------------------------------------------- component
export default function AgreementsHeroTour() {
  const hostRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<SVGSVGElement>(null);
  const rippleRef = useRef<HTMLSpanElement>(null);

  const inView = useInView(hostRef, { margin: "-60px" });
  const reduce = useReducedMotion() ?? false;

  const [scene, setScene] = useState<Scene>(reduce ? STILL : BLANK);
  const [scaled, setScaled] = useState(false);
  const [scale, setScale] = useState(1);
  const [boxH, setBoxH] = useState<number | undefined>(undefined);

  const runRef = useRef(0);
  const scaleRef = useRef(1);
  const posRef = useRef({ x: 160, y: 46 });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const measure = () => {
      const hw = host.clientWidth;
      if (hw <= 0) return;
      if (hw >= MIN_W) {
        scaleRef.current = 1;
        setScale(1);
        setScaled(false);
      } else {
        const s = hw / MIN_W;
        scaleRef.current = s;
        setScale(s);
        setScaled(true);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(host);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const upd = () => {
      const s = scaleRef.current;
      setBoxH(s < 1 ? stage.offsetHeight * s : undefined);
    };
    upd();
    const ro = new ResizeObserver(upd);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [scale]);

  useEffect(() => {
    if (reduce) {
      setScene(STILL);
      return;
    }
    if (!inView) return;

    const gen = ++runRef.current;
    const alive = () => gen === runRef.current;
    const wait = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));
    const patch = (p: Partial<Scene>) => {
      if (alive()) setScene((s) => ({ ...s, ...p }));
    };

    const setCursor = (x: number, y: number) => {
      posRef.current = { x, y };
      if (cursorRef.current) cursorRef.current.style.transform = `translate(${x}px,${y}px)`;
    };

    const pointAt = (key: string) => {
      const stage = stageRef.current;
      const node = cardRef.current?.querySelector(`[data-t="${key}"]`);
      if (!stage || !node) return posRef.current;
      const s = stage.getBoundingClientRect();
      const t = node.getBoundingClientRect();
      const k = scaleRef.current || 1;
      return {
        x: (t.left - s.left) / k + t.width / k / 2,
        y: (t.top - s.top) / k + t.height / k / 2,
      };
    };

    const glide = async (pt: { x: number; y: number }, dur = 620) => {
      const c = cursorRef.current;
      const from = posRef.current;
      if (!c) return;
      const a = c.animate(
        [{ transform: `translate(${from.x}px,${from.y}px)` }, { transform: `translate(${pt.x}px,${pt.y}px)` }],
        { duration: dur, easing: EASE, fill: "forwards" },
      );
      try { await a.finished; } catch { /* cancelled */ }
      a.cancel();
      setCursor(pt.x, pt.y);
    };

    const click = async () => {
      const c = cursorRef.current;
      const r = rippleRef.current;
      const { x, y } = posRef.current;
      const anims: Animation[] = [];
      if (r) {
        r.style.left = `${x}px`;
        r.style.top = `${y}px`;
        anims.push(r.animate(
          [{ transform: "scale(.35)", opacity: 0.95 }, { transform: "scale(1.5)", opacity: 0 }],
          { duration: 440, easing: "ease-out" },
        ));
      }
      if (c) {
        anims.push(c.animate([
          { transform: `translate(${x}px,${y}px) scale(1)` },
          { transform: `translate(${x}px,${y}px) scale(.82)` },
          { transform: `translate(${x}px,${y}px) scale(1)` },
        ], { duration: 230, easing: "ease-out" }));
      }
      try { await Promise.all(anims.map((a) => a.finished)); } catch { /* cancelled */ }
      anims.forEach((a) => a.cancel());
      setCursor(x, y);
    };

    const fade = async (to: number, dur = 260) => {
      const c = cursorRef.current;
      if (!c) return;
      const a = c.animate([{ opacity: c.style.opacity || "0" }, { opacity: `${to}` }],
        { duration: dur, fill: "forwards" });
      try { await a.finished; } catch { /* cancelled */ }
      if (alive()) c.style.opacity = `${to}`;
    };

    const tap = async (key: string, dur = 620, hold = 300) => {
      await glide(pointAt(key), dur);
      if (!alive()) return false;
      patch({ hot: key });
      await wait(hold);
      if (!alive()) return false;
      await click();
      patch({ hot: "" });
      return alive();
    };

    const type = async (text: string, apply: (v: string) => void, per = 58) => {
      for (let i = 1; i <= text.length; i++) {
        if (!alive()) return;
        apply(text.slice(0, i));
        await wait(per);
      }
    };

    (async function loop() {
      setCursor(160, 46);
      let first = true;
      while (alive()) {
        if (first) {
          setScene({ ...BLANK });
          first = false;
        } else {
          // Come back behind the fade the last pass ended on, then bring the card
          // up rather than cutting to it.
          setScene({ ...BLANK, dim: true });
          await wait(90);
          patch({ dim: false });
          await wait(460);
          if (!alive()) return;
        }

        await fade(1);

        // --- 1. what is signed, and what is waiting on whom
        await wait(1900);
        if (!(await tap("new-agreement", 700))) return;
        patch({ modal: "new" });
        await wait(520);

        // name it
        await glide(pointAt("name-field"), 520);
        if (!alive()) return;
        await click();
        patch({ caret: true });
        await wait(200);
        await type(NEW_NAME, (v) => patch({ typed: v }), 46);
        if (!alive()) return;
        await wait(420);

        // the one optional box, so the picker reads as a picker
        if (!(await tap("opt-agree", 560))) return;
        patch({ agree: true });
        await wait(760);

        if (!(await tap("create", 540))) return;
        patch({ modal: "", view: "builder", caret: false });
        await wait(560);

        // --- 2. the scaffold lands, row by row
        for (let i = 0; i < BUILT.length; i++) {
          patch({ built: i + 1 });
          await wait(150);
          if (!alive()) return;
        }
        await wait(2100);

        // --- 3. publish, then over to the signer
        if (!(await tap("publish", 640))) return;
        patch({ view: "sign" });
        await wait(1500);

        // draw the signature
        await glide(pointAt("pad"), 620);
        if (!alive()) return;
        for (let i = 1; i <= 10; i++) {
          patch({ drawn: i / 10 });
          await wait(72);
          if (!alive()) return;
        }
        await wait(560);

        // consent, which is collected separately and is required
        if (!(await tap("consent", 560))) return;
        patch({ consent: true });
        await wait(760);

        if (!(await tap("submit", 560))) return;
        patch({ submitted: true });
        await wait(1500);

        // --- 4. and it is tracked, with the executed copy
        if (!alive()) return;
        patch({ view: "list", landed: true });
        await wait(3000);

        if (!alive()) return;
        // Fade the card out before the loop restarts, rather than cutting.
        patch({ dim: true });
        await fade(0);
        await wait(520);
      }
    })();

    return () => {
      runRef.current++;
      cursorRef.current?.getAnimations().forEach((a) => a.cancel());
      rippleRef.current?.getAnimations().forEach((a) => a.cancel());
    };
  }, [inView, reduce]);

  return (
    <div ref={hostRef} className="w-full">
      <div style={{ height: boxH }}>
        <div
          ref={stageRef}
          className="relative"
          style={{
            width: scaled ? MIN_W : "100%",
            transform: scaled ? `scale(${scale})` : undefined,
            transformOrigin: "top left",
          }}
        >
          <div
            ref={cardRef}
            className="relative overflow-hidden rounded-2xl border border-black/5 bg-[#FAF9F7] text-brand-ink shadow-[0_30px_60px_-30px_rgba(40,30,15,0.45),0_2px_6px_-3px_rgba(40,30,15,0.12)] transition-opacity duration-[520ms] ease-out"
            style={{ height: STAGE_H, opacity: scene.dim ? 0 : 1 }}
          >
            {scene.view === "list" && <ListView scene={scene} />}
            {scene.view === "builder" && <BuilderView scene={scene} />}
            {scene.view === "sign" && <SignView scene={scene} />}

            {scene.modal === "new" && <NewAgreementModal scene={scene} />}


            {/* Ask Multi AI, present on every screen in the product. Not on the
                signer's view, which is a stranger's browser. */}
            {scene.view !== "sign" && (
              <span className="pointer-events-none absolute bottom-4 right-5 z-[50] flex items-center gap-1.5 rounded-full border border-[#F7D8B4] bg-white px-3 py-1.5 text-[11px] font-semibold text-brand-ink shadow-[0_10px_22px_-10px_rgba(40,30,15,0.5)]">
                <span className="grid h-[18px] w-[18px] place-items-center rounded-full bg-gradient-to-br from-[#F49230] to-[#DE6F14] text-white">
                  <Spark className="h-[10px] w-[10px]" />
                </span>
                Ask Multi AI
              </span>
            )}
          </div>

          <span
            ref={rippleRef}
            aria-hidden="true"
            className="pointer-events-none absolute z-[85] -m-[13px] h-[26px] w-[26px] rounded-full border-2 border-brand-orange opacity-0"
          />
          <svg
            ref={cursorRef}
            aria-hidden="true"
            viewBox="0 0 24 24"
            width="23"
            height="23"
            fill="#fff"
            stroke="#1B1A17"
            strokeWidth={1.4}
            strokeLinejoin="round"
            className="pointer-events-none absolute left-0 top-0 z-[90] opacity-0 [filter:drop-shadow(0_2px_3px_rgba(0,0,0,0.32))]"
          >
            <path d="M5 3l14 8-6 1.5 3.5 6-2.8 1.6-3.5-6L7 18z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function TypeCaret() {
  return <span className="tour-caret" />;
}

// A hand-drawn signature, inked progressively. pathLength is normalised to 1 so
// the dash maths does not care how long the real path is.
function Ink({ at }: { at: number }) {
  return (
    <svg
      viewBox="0 0 240 44"
      className="pointer-events-none absolute inset-x-0 bottom-[13px] mx-auto h-[38px] w-[220px]"
      fill="none"
      stroke="#1B2A44"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path
        d="M16 30c9-15 15-17 18-10s-3 17 3 17 10-19 17-19 5 12 12 12 11-14 18-14 7 10 14 10 12-7 19-10"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - at}
      />
    </svg>
  );
}

// ---------------------------------------------------------------- view: the list
function ListView({ scene }: { scene: Scene }) {
  const rows: Deal[] = scene.landed
    ? [{ name: NEW_NAME, who: SIGNER, when: "signed just now", state: "signed" }, ...DEALS]
    : DEALS;

  return (
    <div className="sop-view flex h-full flex-col px-7 pb-6 pt-6">
      <div className="flex flex-none items-start gap-3">
        <span className="min-w-0 flex-1">
          <h3 className="text-[24px] font-extrabold tracking-tight">Agreements</h3>
          <p className="mt-0.5 max-w-[540px] text-[11.5px] leading-snug text-brand-charcoal">
            Every document sent for legally-binding signature. Track status, download the executed
            copy, and sign what is waiting on you.
          </p>
        </span>
        <span
          data-t="new-agreement"
          className={`flex flex-none items-center gap-1.5 rounded-lg bg-[#16233D] px-3.5 py-2 text-[12px] font-semibold text-white transition-shadow duration-200 ${
            scene.hot === "new-agreement" ? "shadow-[0_0_0_3px_rgba(234,123,27,0.4)]" : ""
          }`}
        >
          <Plus className="h-3.5 w-3.5" />
          New agreement
        </span>
      </div>

      <div className="mt-4 min-h-0 flex-1 overflow-hidden rounded-xl border border-[#EBE7E0] bg-white">
        <div className="flex items-center gap-3 border-b border-[#F1EEE9] bg-[#FAF9F7] px-3.5 py-2 text-[8.5px] font-bold uppercase tracking-[0.1em] text-brand-gray">
          <span className="flex-1">Agreement</span>
          <span className="w-[132px]">Signer</span>
          <span className="w-[104px]">Status</span>
          <span className="w-[92px] text-right">Executed copy</span>
        </div>
        {rows.map((d, i) => {
          const m = STATE_META[d.state];
          const fresh = scene.landed && i === 0;
          return (
            <div
              key={d.name}
              className={`flex items-center gap-3 border-b border-[#F5F2ED] px-3.5 py-[11px] last:border-b-0 ${
                fresh ? "tour-landed" : ""
              }`}
            >
              <span className="flex min-w-0 flex-1 items-center gap-2.5">
                <span
                  className="grid h-[26px] w-[26px] flex-none place-items-center rounded-lg"
                  style={{ background: m.bg, color: m.color }}
                >
                  <SignDoc className="h-[14px] w-[14px]" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[12px] font-bold leading-tight">{d.name}</span>
                  <span className="text-[9.5px] text-brand-gray">{d.when}</span>
                </span>
              </span>
              <span className="w-[132px] flex-none truncate text-[10.5px] text-brand-charcoal">
                {d.who}
              </span>
              <span className="w-[104px] flex-none">
                <span
                  className="inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-[3px] text-[9px] font-bold"
                  style={{ background: m.bg, color: m.color }}
                >
                  {d.state === "signed" ? <Tick className="h-2.5 w-2.5" /> : <ClockIcon className="h-2.5 w-2.5" />}
                  {m.label}
                </span>
              </span>
              <span className="w-[92px] flex-none text-right">
                {d.state === "signed" ? (
                  <span
                    className="inline-flex items-center gap-1 rounded-md border border-[#E6E2DB] px-2 py-1 text-[9.5px] font-semibold"
                    style={{ color: INK }}
                  >
                    <Download className="h-2.5 w-2.5" />
                    PDF
                  </span>
                ) : d.state === "you" ? (
                  <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[9.5px] font-bold text-white" style={{ background: INK }}>
                    <PenNib className="h-2.5 w-2.5" />
                    Sign
                  </span>
                ) : (
                  <span className="text-[9.5px] text-[#C4BFB6]">&mdash;</span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- the create modal
function NewAgreementModal({ scene }: { scene: Scene }) {
  const named = scene.typed.length > 0;
  return (
    <div className="absolute inset-0 z-[60] grid place-items-center bg-[rgba(24,19,12,0.42)] px-6">
      {/* Sized to sit inside the 500px stage with room to spare: the card clips
          anything taller, and the create button is what the scene builds to. */}
      <div className="sop-view w-[500px] rounded-2xl bg-white px-5 py-4 shadow-[0_24px_60px_-18px_rgba(20,14,6,0.5)]">
        <h4 className="flex items-center gap-2 text-[15.5px] font-bold tracking-tight">
          <SignDoc className="h-4 w-4" style={{ color: INK }} />
          New agreement
        </h4>
        <p className="mt-1 text-[11px] leading-snug text-brand-charcoal">
          An agreement is a form with a signature on it. We create the form with the signature block
          already in place. You add the terms and publish.
        </p>

        <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.12em] text-brand-gray">
          Agreement name
        </p>
        <div
          data-t="name-field"
          className={`mt-1.5 rounded-lg border bg-white px-3 py-1.5 text-[12px] transition-all duration-200 ${
            scene.caret ? "border-brand-orange/60 shadow-[0_0_0_3px_rgba(234,123,27,0.16)]" : "border-[#E6E2DB]"
          }`}
        >
          {named ? (
            <span className="font-medium text-brand-ink">
              {scene.typed}
              {scene.caret && <TypeCaret />}
            </span>
          ) : (
            <span className="text-brand-gray">
              {scene.caret ? <TypeCaret /> : "e.g. Client services agreement"}
            </span>
          )}
        </div>

        <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.12em] text-brand-gray">
          Start it with
        </p>
        <div className="mt-1.5 space-y-0.5">
          {SCAFFOLD.map((s) => {
            const on = s.key === "agree" ? scene.agree : s.on;
            const hot = scene.hot === "opt-agree" && s.key === "agree";
            return (
              <div
                key={s.key}
                data-t={s.key === "agree" ? "opt-agree" : undefined}
                className={`flex items-start gap-2 rounded-lg px-2 py-1 transition-all duration-200 ${
                  s.forced ? "border" : ""
                } ${hot ? "shadow-[0_0_0_2px_rgba(234,123,27,0.3)]" : ""}`}
                style={
                  s.forced
                    ? { background: "#FFF6EC", borderColor: "rgba(234,123,27,0.35)" }
                    : undefined
                }
              >
                {s.forced ? (
                  <PenNib className="mt-px h-3 w-3 flex-none" style={{ color: "#C9650F" }} />
                ) : (
                  <span
                    className="mt-px grid h-3 w-3 flex-none place-items-center rounded-[3px] transition-colors duration-200"
                    style={
                      on
                        ? { background: "#16233D", color: "#fff" }
                        : { border: "1.5px solid #C9C2B6", color: "transparent" }
                    }
                  >
                    <Tick className="h-2 w-2" />
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block text-[10.5px] font-semibold leading-tight">{s.label}</span>
                  <span className="block text-[8.5px] leading-snug text-brand-gray">{s.sub}</span>
                </span>
              </div>
            );
          })}
        </div>

        <p className="mt-2 rounded-lg bg-[#F4F1EC] px-2.5 py-1.5 text-[9px] leading-snug text-brand-charcoal">
          You can add, remove, and reorder any of this in the form builder. Once published, every
          submission becomes an agreement tracked on this page.
        </p>

        <div className="mt-3 flex items-center justify-end gap-3">
          <span className="text-[11.5px] font-semibold text-brand-charcoal">Cancel</span>
          <span
            data-t="create"
            className={`rounded-lg px-4 py-1.5 text-[12px] font-semibold transition-all duration-200 ${
              named ? "bg-[#16233D] text-white" : "bg-[#E6E2DB] text-brand-gray"
            } ${scene.hot === "create" ? "shadow-[0_0_0_3px_rgba(234,123,27,0.35)]" : ""}`}
          >
            Create agreement
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- view: builder
// This is the Forms builder, unchanged, which is the whole point: the agreement
// is a form, so everything Forms can do it can do too.
function BuilderView({ scene }: { scene: Scene }) {
  const shown = BUILT.slice(0, scene.built);
  return (
    <div className="sop-view flex h-full flex-col">
      <div className="flex flex-none items-center gap-2 border-b border-[#EBE7E0] bg-white px-4 py-2.5">
        <ArrowLeft className="h-4 w-4 flex-none text-brand-charcoal" />
        <b className="flex-none text-[13px]">{NEW_NAME}</b>
        <span className="ml-auto flex flex-none items-center gap-1.5">
          <span className="flex items-center gap-1.5 rounded-lg border border-[#DDDCF2] bg-[#F4F4FD] px-2.5 py-1.5 text-[10.5px] font-semibold text-[#4B3CC4]">
            <Chat className="h-3 w-3" />
            Responses &amp; Reports
          </span>
          {[
            { l: "Themes", i: Palette },
            { l: "Preview", i: Eye },
            { l: "Sharing", i: Share },
          ].map(({ l, i: Ico }) => (
            <span
              key={l}
              className="flex items-center gap-1.5 rounded-lg border border-[#E6E2DB] bg-white px-2.5 py-1.5 text-[10.5px] font-semibold text-brand-charcoal"
            >
              <Ico className="h-3 w-3" />
              {l}
            </span>
          ))}
          <span
            data-t="publish"
            className={`flex items-center gap-1.5 rounded-lg bg-[#16233D] px-3 py-1.5 text-[10.5px] font-semibold text-white transition-shadow duration-200 ${
              scene.hot === "publish" ? "shadow-[0_0_0_3px_rgba(234,123,27,0.4)]" : ""
            }`}
          >
            <Rocket className="h-3 w-3" />
            Publish
          </span>
        </span>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="w-[164px] flex-none border-r border-[#EBE7E0] bg-white p-2">
          {STAGES.map((s, i) => {
            const Ico = s.icon;
            const on = i === 0;
            return (
              <span
                key={s.key}
                className={`mb-1 flex items-center gap-2 rounded-lg px-2 py-[7px] ${
                  on ? "bg-[#16233D] text-white" : "text-brand-charcoal"
                }`}
              >
                <Ico className={`h-3.5 w-3.5 flex-none ${on ? "text-white" : "text-brand-gray"}`} />
                <span className="min-w-0">
                  <span className="block truncate text-[10.5px] font-semibold leading-tight">{s.label}</span>
                  <span className={`block truncate text-[8.5px] ${on ? "text-white/65" : "text-brand-gray"}`}>
                    {s.sub}
                  </span>
                </span>
              </span>
            );
          })}
        </div>

        <div className="min-w-0 flex-1 overflow-hidden px-5 py-3">
          <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.1em] text-brand-orange-dark">
            Built for you, ready to edit
          </p>
          <div className="space-y-1.5">
            {shown.map((b) => {
              const Ico = b.icon;
              const isSig = b.kind === "Signature";
              return (
                <div
                  key={b.label}
                  className="sop-pop flex items-center gap-2.5 rounded-lg border bg-white px-2.5 py-2"
                  style={
                    isSig
                      ? { borderColor: "rgba(234,123,27,0.4)", background: "#FFFCF7" }
                      : { borderColor: "#EBE7E0" }
                  }
                >
                  <span className="flex-none text-[9px] leading-none text-[#C4BFB6]">&#8942;&#8942;</span>
                  <span
                    className="grid h-[22px] w-[22px] flex-none place-items-center rounded-md"
                    style={isSig ? { background: "#C9650F", color: "#fff" } : { background: "#F4F1EC", color: "#4A4744" }}
                  >
                    <Ico className="h-3 w-3" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[11px] font-semibold leading-tight">
                      {b.label}
                      {b.req && <span style={{ color: "#D8563F" }}> *</span>}
                    </span>
                    <span className="text-[8.5px] text-brand-gray">{b.kind}</span>
                  </span>
                  {isSig && (
                    <span className="flex-none rounded-full px-2 py-[2px] text-[8px] font-bold uppercase tracking-wide" style={{ background: "#FFF1E2", color: "#C9650F" }}>
                      Always included
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          {shown.length === BUILT.length && (
            <p className="mt-2 text-[9.5px] text-brand-gray">
              Every other field type is still available, so an agreement can ask anything a form can.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- view: signing
// The payoff. Draw or type, consent collected separately, and the button says
// Sign and submit rather than Submit.
function SignView({ scene }: { scene: Scene }) {
  return (
    <div className="sop-view flex h-full flex-col bg-[#F1F0EE]">
      <div className="flex flex-none items-center gap-2 bg-[#E6E3DE] px-4 py-2">
        <span className="flex gap-1">
          <span className="h-[7px] w-[7px] rounded-full bg-[#CFC9C0]" />
          <span className="h-[7px] w-[7px] rounded-full bg-[#CFC9C0]" />
          <span className="h-[7px] w-[7px] rounded-full bg-[#CFC9C0]" />
        </span>
        <span className="ml-2 flex-1 truncate rounded-md bg-white px-2.5 py-1 text-[10px] text-brand-charcoal">
          {PUBLIC_URL}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-6 py-3">
        <div className="mx-auto w-[430px] rounded-xl border border-[#E3E0DA] bg-white px-6 py-4 shadow-[0_12px_28px_-18px_rgba(40,30,15,0.35)]">
          {scene.submitted ? (
            <div className="grid place-items-center py-8 text-center">
              <span className="grid h-[38px] w-[38px] place-items-center rounded-full" style={{ background: "#EAF7F0", color: GREEN }}>
                <Tick className="h-5 w-5" />
              </span>
              <p className="mt-2.5 text-[14px] font-extrabold tracking-tight">Signed</p>
              <p className="mt-1 max-w-[300px] text-[10.5px] leading-snug text-brand-charcoal">
                A countersigned copy is on its way to {SIGNER}&rsquo;s email, and the executed copy
                is already tracked on the Agreements page.
              </p>
            </div>
          ) : (
            <>
              <p className="text-center text-[14px] font-extrabold tracking-tight">{NEW_NAME}</p>
              <div className="my-2.5 h-px bg-[#EDE9E2]" />
              <p className="text-[11.5px] font-bold">Agreement terms</p>
              <p className="mt-1 text-[9px] leading-snug text-brand-gray">
                Everything the signer needs to read before signing belongs here.
              </p>
              <div className="mt-1.5 space-y-1">
                {[96, 88, 72].map((w, i) => (
                  <span key={i} className="block h-1.5 rounded bg-[#EDE9E2]" style={{ width: `${w}%` }} />
                ))}
              </div>

              <p className="mt-2.5 text-[10px] font-semibold">
                Signature <span style={{ color: "#D8563F" }}>*</span>
              </p>
              <div className="mt-1 flex w-fit items-center gap-0.5 rounded-lg bg-[#F1EEE9] p-0.5">
                {(["Draw", "Type"] as const).map((l) => (
                  <span
                    key={l}
                    className={`rounded-[6px] px-2.5 py-[3px] text-[9.5px] ${
                      (l === "Draw") === (scene.mode === "draw")
                        ? "bg-white font-semibold text-brand-ink shadow-sm"
                        : "font-medium text-brand-charcoal"
                    }`}
                  >
                    {l}
                  </span>
                ))}
              </div>

              {/* the pad */}
              <div
                data-t="pad"
                className="relative mt-1.5 h-[72px] overflow-hidden rounded-md border border-dashed border-[#D8D2C8] bg-[#FBFAF8]"
              >
                <span className="absolute inset-x-6 bottom-[13px] h-px bg-[#DDD8CF]" />
                {scene.drawn > 0 ? (
                  <Ink at={scene.drawn} />
                ) : (
                  <span className="absolute inset-x-0 bottom-[3px] text-center text-[9px] text-brand-gray">
                    Sign here
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-3 text-[9px] text-brand-gray">
                <span className="flex items-center gap-1">
                  <Undo className="h-2.5 w-2.5" />
                  Undo
                </span>
                <span className="flex items-center gap-1">
                  <Eraser className="h-2.5 w-2.5" />
                  Clear
                </span>
                {/* the pad confirms itself once a stroke lands */}
                {scene.drawn >= 1 && (
                  <span className="sop-pop flex items-center gap-1 font-semibold" style={{ color: GREEN }}>
                    <Tick className="h-2.5 w-2.5" />
                    Signature captured
                  </span>
                )}
              </div>

              {/* consent, always collected separately */}
              <div
                data-t="consent"
                className={`mt-2.5 flex items-start gap-2 rounded-lg border px-2.5 py-2 transition-all duration-200 ${
                  scene.hot === "consent" ? "shadow-[0_0_0_3px_rgba(234,123,27,0.2)]" : ""
                }`}
                style={
                  scene.consent
                    ? { background: "#F2FBF6", borderColor: "#BFE5CD" }
                    : { background: "#F7F5F1", borderColor: "#E6E2DB" }
                }
              >
                <span
                  className="mt-px grid h-3 w-3 flex-none place-items-center rounded-[3px] transition-colors duration-200"
                  style={
                    scene.consent
                      ? { background: GREEN, color: "#fff" }
                      : { border: "1.5px solid #C9C2B6", color: "transparent" }
                  }
                >
                  <Tick className="h-2 w-2" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[9.5px] leading-snug text-brand-charcoal">
                    I agree to use electronic records and signatures, and that my electronic
                    signature is legally binding. <span style={{ color: "#D8563F" }}>*</span>
                  </span>
                  <span className="mt-0.5 block text-[9px] font-semibold underline" style={{ color: INK }}>
                    View full disclosure
                  </span>
                </span>
              </div>

              <div className="mt-2.5 flex items-center justify-end">
                <span
                  data-t="submit"
                  className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-[11px] font-semibold text-white transition-shadow duration-200 ${
                    scene.hot === "submit" ? "shadow-[0_0_0_3px_rgba(234,123,27,0.4)]" : ""
                  }`}
                  style={{ background: scene.consent ? "#4F46E5" : "#B7B2AA" }}
                >
                  <PenNib className="h-3 w-3" />
                  Sign and submit
                </span>
              </div>
              <p className="mt-2 text-center text-[8.5px] text-brand-gray">
                Powered by Multiply OS Forms
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
