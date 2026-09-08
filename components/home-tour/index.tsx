"use client";

// The home page's main animation.
//
// Replaces the static iframe mockup at public/mockup/dashboard.html, which
// cycled eight tabs by showing and hiding fixed panels. Nothing inside a panel
// moved. This cycles the ten tabs the client asked for in September 2026, and
// each one is a SHORT CUT of that feature's own hero tour: a pointer arrives,
// does the one thing the feature is for, and the loop moves on.
//
//   1. Org Chart      Expand All, drag a seat between managers, Show DISC
//   2. Scoreboard     add a metric and its goal, then put an owner on it
//   3. One Page Plan  the plan scrolled, then a goal opened, a milestone
//                     ticked, the week's update written, and the chip flipped
//   4. 12 Week Year   add a quarterly goal, tick the week, and week 5 scores
//   5. Multi AI       switch coach, change the model, an honest answer, a chart
//   6. Projects       open a project, close two of its tasks out
//   7. CFO Dashboard  the Big Six against their goals, and the briefing
//   8. SOP's          department, subject, SOP
//   9. Agreements     draw a signature, and the executed row lands
//  10. Forms          click three fields in, publish, QR code
//
// Four of those (1, 3, 4, 5) were deepened on the client's request and run
// 9.6-14.4s; the rest run 6.4-7.4s. See ./tabs.ts, which is where that tradeoff
// is written down.
//
// Order and pacing live in ./tabs.ts, which is the only file to touch to retime
// the loop. Beats live in ./acts/*. The pointer, the stage scaling and the act
// contract live in ./rig.tsx.
//
// Only ONE act is mounted at a time. Ten mounted acts would be ten idle React
// trees on the most important page on the site, and an act that is not the
// visible tab has nothing to show.
//
// The whole thing is gated on being in view, so a visitor who scrolls past the
// hero is not paying for a tour that is running off screen.
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import Chrome from "./Chrome";
import { ASPECT, Pointer, STAGE_H, STAGE_W, useCursorRig, useStageScale } from "./rig";
import { CLICK_BONUS, SWAP_MS, TABS } from "./tabs";
import AgreementsAct from "./acts/AgreementsAct";
import CfoAct from "./acts/CfoAct";
import FormsAct from "./acts/FormsAct";
import MultiAiAct from "./acts/MultiAiAct";
import OnePagePlanAct from "./acts/OnePagePlanAct";
import OrgChartAct from "./acts/OrgChartAct";
import ProjectsAct from "./acts/ProjectsAct";
import ScoreboardAct from "./acts/ScoreboardAct";
import SopAct from "./acts/SopAct";
import TwelveWeekAct from "./acts/TwelveWeekAct";

const ACTS = {
  org: OrgChartAct,
  score: ScoreboardAct,
  plan: OnePagePlanAct,
  twelve: TwelveWeekAct,
  multi: MultiAiAct,
  proj: ProjectsAct,
  cfo: CfoAct,
  sop: SopAct,
  agree: AgreementsAct,
  forms: FormsAct,
} as const;

// Under prefers-reduced-motion the tour does not run at all: one tab is rendered
// in its resting state and nothing moves. The Scoreboard is the one chosen for
// it, because its resting state is a fully populated board rather than a screen
// waiting to be acted on, and because it is the screen the client's own
// screenshots are of.
const STILL_TAB = TABS.findIndex((t) => t.key === "score");

export default function HomeOsTour() {
  const { hostRef, scale, scaleRef } = useStageScale();
  const stageRef = useRef<HTMLDivElement>(null);
  const { rig, cursorRef, rippleRef } = useCursorRig(stageRef, scaleRef);

  const inView = useInView(hostRef, { margin: "-80px" });
  const reduce = useReducedMotion() ?? false;

  const [i, setI] = useState(reduce ? STILL_TAB : 0);
  /** Set when a visitor clicks a nav row, so that tab gets a longer hold. */
  const [held, setHeld] = useState(false);

  const tab = TABS[i];
  // A clicked tab keeps its own full length and gets a bonus on top, so choosing
  // a tab can never show you less of it than waiting for it would have.
  const hold = held ? tab.ms + CLICK_BONUS : tab.ms;

  // ---- the cycle
  useEffect(() => {
    if (reduce || !inView) return;
    const t = setTimeout(() => {
      setHeld(false);
      setI((n) => (n + 1) % TABS.length);
    }, hold);
    return () => clearTimeout(t);
  }, [i, hold, inView, reduce]);

  // Every sidebar row is one of the ten tabs, so every row is clickable and
  // jumps straight to its act. Nothing in the rail is decorative.
  const pick = (navKey: string) => {
    if (reduce) return;
    const idx = TABS.findIndex((t) => t.nav === navKey);
    if (idx < 0 || idx === i) return;
    setHeld(true);
    setI(idx);
  };

  const Act = ACTS[tab.key];

  return (
    <div ref={hostRef} className="mx-auto w-full max-w-[1180px]">
      {/* Sized by aspect ratio, so the box is correct before any measurement
          and the stage inside it is clipped rather than overflowing on the one
          server-rendered frame where the scale is not known yet.
          The shadow is the one the old AppMockup wrapper carried. */}
      <div
        className="relative overflow-hidden rounded-[14px]"
        style={{
          aspectRatio: ASPECT,
          boxShadow:
            "0 22px 45px -28px rgba(20,20,20,0.22), 0 4px 12px -8px rgba(20,20,20,0.10)",
        }}
      >
        <div
          ref={stageRef}
          className="absolute left-0 top-0"
          style={{
            width: STAGE_W,
            height: STAGE_H,
            transform: scale < 1 ? `scale(${scale})` : undefined,
            transformOrigin: "top left",
          }}
        >
          <Chrome
            url={tab.url}
            nav={tab.nav}
            duration={reduce ? 0 : hold}
            onPick={pick}
            // Hidden on Multi AI because you are already inside it there, and on
            // Forms because that act ends with a panel across the bottom of the
            // frame that the pill sits on top of.
            showAsk={tab.key !== "multi" && tab.key !== "forms"}
          >
            {/* Keyed on the tab, so the outgoing act unmounts and the incoming
                one starts from its own initial state rather than inheriting a
                half-finished scene. */}
            <div
              key={tab.key}
              className="h-full"
              style={{ animation: reduce ? undefined : `homeTourSwap ${SWAP_MS}ms ease-out` }}
            >
              <Act active={inView && !reduce} rig={rig} />
            </div>
          </Chrome>

          {!reduce && <Pointer cursorRef={cursorRef} rippleRef={rippleRef} />}
        </div>
      </div>

      <style>{`@keyframes homeTourSwap{from{opacity:0}to{opacity:1}}`}</style>
    </div>
  );
}
