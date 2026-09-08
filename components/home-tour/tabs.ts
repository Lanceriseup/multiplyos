// The home tour's running order, and the one place its pacing is tuned.
//
// The order is the client's, verbatim, from the September 2026 brief:
//
//   Org Chart / Scoreboard / One Page Plan / 12 Week Year / Multi AI /
//   Projects (show tasks in projects) / CFO Dashboard / SOP's / Agreements / Forms
//
// It replaced the eight tabs the old iframe mockup cycled, so Dashboard, My HQ,
// Leadership Meeting and 1on1s are gone from the rotation AND from the sidebar.
// The rail is these ten rows and nothing else: one row per tab, in this order.
// See components/home-tour/Chrome.tsx.
//
// ---------------------------------------------------------------- pacing
// `ms` is how long a tab holds before the loop advances, and it is also the
// duration the nav row's loading bar fills over, so the two cannot drift.
//
// Each act is a cut of its feature-page tour. The short ones keep one or
// two beats; the long ones were each extended on the client's request to
// carry more of the original. The feature tours run 15-44s; these run 6-13s.
//
// SIX tabs carry most of the loop:
//
//   Multi AI       12.6s  switch coach and the prompts swap, change the model
//                         across both providers, an honest answer, a chart
//   One Page Plan  12.6s  scroll, open a goal, tick a milestone, write the
//                         week's update, save, and the chip flips on the plan
//   CFO Dashboard  12.0s  the Big Six and the AI briefing, then Profit & Loss,
//                         then all seven Key Ratios with two off target
//   Projects       10.8s  open a project, then List -> Board -> Timeline on the
//                         same eight tasks, then tick one and the counter moves
//   Org Chart       9.6s  Expand All, drag a seat between managers, Show DISC
//   12 Week Year    9.6s  add a quarterly goal with its KPI target, tick the
//                         week's priorities, and week 5 scores on that goal
//
// None compresses much further. Each is a chain where a beat only means anything
// because of the one before it, and a press-carry-release cannot be rushed the
// way a click can. Multi AI in particular spends its length on reading time
// rather than on moves: the swapped prompts, the five-model picker and the final
// answer are all things a visitor has to read, not watch.
//
// THAT IS THE PROBLEM WITH THIS TABLE AS IT STANDS. Those six are 67 of the
// loop's 99 seconds. SOP HQ does not begin until 1:05, Agreements until 1:13,
// Forms until 1:22. Nobody watches a hero for a minute and a half, so the last
// three tabs are effectively click-only: the client's ordering is carrying the
// whole thing.
//
// Every act here is now worth its length, so trimming beats is the wrong lever.
// The right one is a SHORTER ROTATION. Cutting SOP HQ, Agreements and Forms out
// of the cycle leaves about 74 seconds; cutting to the six deep tabs plus
// Scoreboard leaves about 73. Every sidebar row stays clickable either way, so
// nothing becomes unreachable, only unlikely.
//
// If the total must come down without dropping tabs, in the order that costs
// the least:
//   1. the plan's Goal Updates beat        ~2.4s, the one beat that stands alone
//   2. the CFO's Profit & Loss hold        2.1s of reading on a dense table
//   3. the plan's opening scroll           SCROLL_MS in OnePagePlanAct
//
// To retime: change `ms` here and nothing else. Nothing reads a duration from
// inside an act, and the acts are written to look finished at any hold length,
// so shortening a tab clips its tail rather than desynchronising it.
export type TabKey =
  | "org"
  | "score"
  | "plan"
  | "twelve"
  | "multi"
  | "proj"
  | "cfo"
  | "sop"
  | "agree"
  | "forms";

export type Tab = {
  key: TabKey;
  /** The client's own label for this beat, kept for traceability. */
  brief: string;
  /** Sidebar row that goes active. Every tab has its own; there is no nesting. */
  nav: TabKey;
  url: string;
  ms: number;
};

export const TABS: Tab[] = [
  { key: "org", brief: "Org Chart", nav: "org", url: "/org-chart", ms: 9600 },
  { key: "score", brief: "Scoreboard", nav: "score", url: "/scoreboards", ms: 6400 },
  { key: "plan", brief: "One Page Plan", nav: "plan", url: "/one-page-plan", ms: 12600 },
  { key: "twelve", brief: "12 Week Year", nav: "twelve", url: "/my-12-week-year", ms: 9600 },
  { key: "multi", brief: "Multi AI", nav: "multi", url: "/multi-ai", ms: 12600 },
  { key: "proj", brief: "Projects (tasks in projects)", nav: "proj", url: "/projects/client-onboarding", ms: 10800 },
  { key: "cfo", brief: "CFO Dashboard", nav: "cfo", url: "/cfo-dashboard", ms: 12000 },
  { key: "sop", brief: "SOP's", nav: "sop", url: "/sop-hq", ms: 8000 },
  { key: "agree", brief: "Agreements", nav: "agree", url: "/agreements", ms: 12000 },
  { key: "forms", brief: "Forms", nav: "forms", url: "/forms", ms: 11000 },
];

/**
 * Extra time a tab gets when a visitor CLICKS its nav row, on top of its own
 * `ms`. Cycling resumes after that.
 *
 * This used to be a flat 9000ms replacing `ms` entirely, which was backwards:
 * every tab longer than nine seconds got LESS time when you deliberately chose
 * it than when the loop reached it on its own. On Multi AI, whose answer starts
 * generating at about the nine-second mark, clicking the row cut the tab exactly
 * as the answer began. A clicked tab must never get less than the auto-cycle
 * would give it, so this is added to `ms` rather than substituted for it.
 */
export const CLICK_BONUS = 2000;

/** Cross-fade between tabs. Deliberately short; the acts open on their own move. */
export const SWAP_MS = 260;
