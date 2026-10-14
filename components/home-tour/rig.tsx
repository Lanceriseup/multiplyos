"use client";

// Shared machinery for the home page's app tour.
//
// The ten feature-page hero tours each carry their own copy of this rig. Here it
// is extracted once, because ten acts share one stage and one cursor: the acts
// are swapped underneath a pointer that never unmounts, so the pointer cannot
// live inside an act.
//
// Same split as the feature tours, and for the same reason: the app is React
// state, and ONLY the cursor and its ripple are animated imperatively through
// the Web Animations API. Driving a 12px pointer through React state at 60fps
// re-renders the whole screen behind it for no reason.
//
// Everything here works in STAGE UNITS, which are unscaled 1180-wide pixels.
// The stage is a single CSS transform: scale(), so a live getBoundingClientRect
// comes back multiplied by that scale and every measurement divides it back out.
// Cursor transforms are then applied inside the scaled space and land correctly
// at any container width.
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

// The stage has to be measured before paint or the first frame renders at the
// full 1180 inside a container narrower than that. useLayoutEffect warns during
// SSR, so fall back to useEffect on the server, where there is nothing to
// measure anyway.
const useMeasureEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export const STAGE_W = 1180; // the mockup's design width, matches the old iframe
export const CHROME_H = 40; // browser title bar
export const APP_H = 700; // the app itself
export const STAGE_H = CHROME_H + APP_H;
export const EASE = "cubic-bezier(0.22,1,0.36,1)";

export type Pt = { x: number; y: number };

// ---------------------------------------------------------------- stage scaling
// The stage is a fixed 1180x740 box scaled down to whatever width it is given.
//
// A CSS transform does not affect layout, so the untransformed 740px would
// reserve its full height and leave a gap under the mockup. The wrapper solves
// that with `aspect-ratio` rather than a measured pixel height: the visual
// height is ALWAYS width * (STAGE_H / STAGE_W), so CSS can size the box
// correctly at any width with no JavaScript and no first-paint reflow. That
// matters most on mobile, where the old iframe needed an initialHeight guess and
// then corrected itself once the frame reported back.
export const ASPECT = `${STAGE_W} / ${STAGE_H}`;

export function useStageScale() {
  const hostRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef(1);
  const [scale, setScale] = useState(1);

  useMeasureEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const measure = () => {
      const w = host.clientWidth;
      if (w <= 0) return;
      const s = Math.min(1, w / STAGE_W);
      scaleRef.current = s;
      setScale(s);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(host);
    return () => ro.disconnect();
  }, []);

  return { hostRef, scale, scaleRef };
}

// ---------------------------------------------------------------- the cursor
export type Rig = {
  /** Centre of `node` in stage units, or the current position if it is missing. */
  pointAt: (node: Element | null, fx?: number, fy?: number) => Pt;
  /** Jump without animating. Used to place the pointer before fading it in. */
  at: (node: Element | null, fx?: number, fy?: number) => void;
  atPoint: (pt: Pt) => void;
  glide: (node: Element | null, fx?: number, fy?: number, dur?: number) => Promise<void>;
  glideTo: (pt: Pt, dur?: number) => Promise<void>;
  click: () => Promise<void>;
  /** glide + click, which is what nearly every beat actually wants. */
  tap: (node: Element | null, fx?: number, fy?: number, dur?: number) => Promise<void>;
  fade: (to: number, dur?: number) => Promise<void>;
  /**
   * Put `el` on the pointer's CURRENT position without animating. Call this
   * before revealing a drag ghost: its transform is otherwise only set by the
   * carry animation that has not started yet, so it paints one frame at the
   * stage origin before jumping to the pointer.
   */
  park: (el: HTMLElement | null) => void;
  /**
   * Move the pointer and a passenger element to `to` on ONE set of keyframes,
   * so a dragged card cannot drift away from the cursor holding it.
   */
  carry: (to: Pt, el: HTMLElement | null, dur?: number) => Promise<void>;
  cancel: () => void;
  pos: () => Pt;
};

export function useCursorRig(
  stageRef: React.RefObject<HTMLDivElement | null>,
  scaleRef: React.MutableRefObject<number>,
) {
  const cursorRef = useRef<SVGSVGElement>(null);
  const rippleRef = useRef<HTMLSpanElement>(null);
  const posRef = useRef<Pt>({ x: 300, y: 120 });

  const setCursor = useCallback((x: number, y: number) => {
    posRef.current = { x, y };
    const c = cursorRef.current;
    if (c) c.style.transform = `translate(${x}px,${y}px)`;
  }, []);

  const rig = useMemo<Rig>(() => {
    const pointAt = (node: Element | null, fx = 0.5, fy = 0.5): Pt => {
      const stage = stageRef.current;
      if (!stage || !node) return posRef.current;
      const s = stage.getBoundingClientRect();
      const t = node.getBoundingClientRect();
      const k = scaleRef.current || 1;
      // A zero-size target means the node is display:none, almost always the
      // hidden second copy of the tour. Falling back to the current position
      // leaves the pointer parked while the beats fire around it, which is easy
      // to misread as an easing problem, so say so out loud in development.
      if (t.width === 0 && t.height === 0) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[home-tour] cursor target has no layout box; is it the hidden copy?", node);
        }
        return posRef.current;
      }
      return {
        x: (t.left - s.left) / k + (t.width / k) * fx,
        y: (t.top - s.top) / k + (t.height / k) * fy,
      };
    };

    // A passenger element (a drag ghost) is owned by an ACT, so it is mounted
    // deep inside the app chrome, while the pointer is a direct child of the
    // stage. Their transforms resolve against different offset parents, so
    // feeding the pointer's own coordinates straight to a passenger drops it
    // hundreds of pixels away from the cursor supposedly holding it. This is the
    // offset between the two origins, in stage units.
    const passengerOffset = (el: HTMLElement | null): Pt => {
      const stage = stageRef.current;
      const parent = el?.offsetParent as HTMLElement | null;
      if (!stage || !parent) return { x: 0, y: 0 };
      const s = stage.getBoundingClientRect();
      const p = parent.getBoundingClientRect();
      const k = scaleRef.current || 1;
      return { x: (s.left - p.left) / k, y: (s.top - p.top) / k };
    };

    const glideTo = async (pt: Pt, dur = 560) => {
      const c = cursorRef.current;
      const from = posRef.current;
      if (!c) return;
      const a = c.animate(
        [
          { transform: `translate(${from.x}px,${from.y}px)` },
          { transform: `translate(${pt.x}px,${pt.y}px)` },
        ],
        { duration: dur, easing: EASE, fill: "forwards" },
      );
      try {
        await a.finished;
      } catch {
        /* cancelled by an act switch */
      }
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
        anims.push(
          r.animate(
            [
              { transform: "translate(-50%,-50%) scale(.35)", opacity: 0.95 },
              { transform: "translate(-50%,-50%) scale(1.5)", opacity: 0 },
            ],
            { duration: 460, easing: "ease-out" },
          ),
        );
      }
      if (c) {
        anims.push(
          c.animate(
            [
              { transform: `translate(${x}px,${y}px) scale(1)` },
              { transform: `translate(${x}px,${y}px) scale(.82)` },
              { transform: `translate(${x}px,${y}px) scale(1)` },
            ],
            { duration: 240, easing: "ease-out" },
          ),
        );
      }
      try {
        await Promise.all(anims.map((a) => a.finished));
      } catch {
        /* cancelled */
      }
      anims.forEach((a) => a.cancel());
      setCursor(x, y);
    };

    const fade = async (to: number, dur = 260) => {
      const c = cursorRef.current;
      if (!c) return;
      const a = c.animate([{ opacity: c.style.opacity || "0" }, { opacity: `${to}` }], {
        duration: dur,
        fill: "forwards",
      });
      try {
        await a.finished;
      } catch {
        /* cancelled */
      }
    };

    return {
      pointAt,
      at: (node, fx, fy) => {
        const p = pointAt(node, fx, fy);
        setCursor(p.x, p.y);
      },
      atPoint: (pt) => setCursor(pt.x, pt.y),
      glide: (node, fx, fy, dur) => glideTo(pointAt(node, fx, fy), dur),
      glideTo,
      click,
      tap: async (node, fx, fy, dur) => {
        await glideTo(pointAt(node, fx, fy), dur);
        await click();
      },
      fade,
      park: (el) => {
        if (!el) return;
        const d = passengerOffset(el);
        el.style.transform = `translate(${posRef.current.x + d.x}px,${posRef.current.y + d.y}px)`;
      },
      carry: async (to, el, dur = 900) => {
        const from = posRef.current;
        const kf = (dx: number, dy: number) => [
          { transform: `translate(${from.x + dx}px,${from.y + dy}px)` },
          { transform: `translate(${to.x + dx}px,${to.y + dy}px)` },
        ];
        const anims: Animation[] = [];
        const c = cursorRef.current;
        if (c) anims.push(c.animate(kf(0, 0), { duration: dur, easing: EASE, fill: "forwards" }));
        let d = { x: 0, y: 0 };
        if (el) {
          d = passengerOffset(el);
          anims.push(el.animate(kf(d.x, d.y), { duration: dur, easing: EASE, fill: "forwards" }));
        }
        try {
          await Promise.all(anims.map((a) => a.finished));
        } catch {
          /* cancelled */
        }
        anims.forEach((a) => a.cancel());
        setCursor(to.x, to.y);
        if (el) el.style.transform = `translate(${to.x + d.x}px,${to.y + d.y}px)`;
      },
      cancel: () => {
        cursorRef.current?.getAnimations().forEach((a) => a.cancel());
        rippleRef.current?.getAnimations().forEach((a) => a.cancel());
      },
      pos: () => posRef.current,
    };
  }, [stageRef, scaleRef, setCursor]);

  return { rig, cursorRef, rippleRef };
}

// ---------------------------------------------------------------- act contract
// An act is handed this when it becomes the visible tab. `alive()` goes false
// the moment the tab changes or the component unmounts, and every await in an
// act is followed by a check of it, so a switch mid-beat abandons the sequence
// instead of writing state into a screen nobody is looking at any more.
export type ActApi = {
  rig: Rig;
  alive: () => boolean;
  wait: (ms: number) => Promise<void>;
  /**
   * Find one of THIS act's own cursor targets.
   *
   * Acts must never use document.querySelector for this. The tour is mounted
   * TWICE on the home page, once in the Hero for mobile and once in OsOverview
   * for desktop, and one is always display:none. document.querySelector
   * returns whichever comes first in the document, which is the mobile copy, and
   * a display:none element has no layout box, so every cursor target measured
   * zero and pointAt silently fell back to "wherever the pointer already is".
   * The result was a pointer that clicked in the right order without ever
   * travelling. This scopes the lookup to the act's own subtree.
   */
  q: (selector: string) => Element | null;
};

/**
 * The per-act sequence hook. Handles the generation guard, the initial-state
 * reset on deactivate, and cancelling the pointer's in-flight animations.
 *
 * `seq` is intentionally NOT in the dependency list. Acts declare it inline, so
 * a new function identity arrives on every render and depending on it would
 * restart the tour on every `setScene`.
 */
export function useAct(
  active: boolean,
  rig: Rig,
  /** The act's own outermost element. Scopes `api.q` to this act's copy. */
  rootRef: React.RefObject<HTMLElement | null>,
  reset: () => void,
  seq: (api: ActApi) => Promise<void>,
) {
  const seqRef = useRef(seq);
  seqRef.current = seq;
  const resetRef = useRef(reset);
  resetRef.current = reset;

  useEffect(() => {
    if (!active) {
      resetRef.current();
      return;
    }
    let dead = false;
    const api: ActApi = {
      rig,
      alive: () => !dead,
      wait: (ms) => new Promise<void>((res) => setTimeout(res, ms)),
      q: (selector) => {
        const found = rootRef.current?.querySelector(selector) ?? null;
        if (process.env.NODE_ENV !== "production" && !found) {
          console.warn(`[home-tour] cursor target not found: ${selector}`);
        }
        return found;
      },
    };
    void seqRef.current(api);
    return () => {
      dead = true;
      rig.cancel();
    };
  }, [active, rig, rootRef]);
}

// ---------------------------------------------------------------- the pointer
export function Pointer({
  cursorRef,
  rippleRef,
}: {
  cursorRef: React.RefObject<SVGSVGElement | null>;
  rippleRef: React.RefObject<HTMLSpanElement | null>;
}) {
  return (
    <>
      <span
        ref={rippleRef}
        aria-hidden="true"
        className="pointer-events-none absolute z-[85] h-9 w-9 rounded-full opacity-0"
        style={{ background: "radial-gradient(circle, rgba(234,123,27,0.5), rgba(234,123,27,0))" }}
      />
      <svg
        ref={cursorRef}
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="pointer-events-none absolute left-0 top-0 z-[90] h-[26px] w-[26px] opacity-0"
        style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.3))" }}
      >
        <path
          d="M5.5 2.5l12.4 8.1-5.2.7 3 6.2-2.5 1.2-3-6.2-3.4 3.6z"
          fill="#fff"
          stroke="#1B1A17"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    </>
  );
}
