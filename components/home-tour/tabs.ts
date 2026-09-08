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
// SEVEN tabs carry almost all of the loop:
//
//   SOP's          15.7s  the library drill, a multi step SOP with 23 steps and
//                         a step ticked off, then New SOP -> Screen Record ->
//                         Start recording, a running duration and Stop & save,
//                         then the published SOP's chapters
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
// THAT IS THE PROBLEM WITH THIS TABLE AS IT STANDS. Those seven are 82.9 of the
// loop's 112.3 seconds. SOP's does not begin until 1:14, Agreements until 1:29,
// Forms until 1:41. Nobody watches a hero for the better part of two minutes, so
// the last two tabs are effectively click-only.
//
// SOP's went from 8.0s to 15.7s in September on the client's review: recording a
// video off your own screen and the multi step SOP were both asked for by name,
// and neither survives being rushed. So it is now the longest tab in the loop,
// and the loop is 13 seconds longer than it already was.
//
// Every act is worth its length, so trimming beats is the wrong lever. The right
// one is a SHORTER ROTATION, and it is now overdue. Auto-cycling five tabs
//
//   Org Chart, One Page Plan, Multi AI, CFO Dashboard, SOP's
//
// is 62.5 seconds and keeps everything the client has singled out so far. All
// ten sidebar rows stay clickable whatever the cycle contains, so a dropped tab
// becomes unlikely rather than unreachable. That change belongs in index.tsx,
// not here: this table is the client's order and should stay complete.
//
// If the total must come down without touching the rotation, in the order that
// costs the least:
//   1. the plan's Goal Updates beat        ~2.4s, the one beat that stands alone
//   2. the CFO's Profit & Loss hold        2.1s of reading on a dense table
//   3. the SOP recording clock             6 ticks at 320ms in SopAct
//   4. the plan's opening scroll           SCROLL_MS in OnePagePlanAct
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
  // Longest tab in the loop, and deliberately so. See the pacing note above.
  { key: "sop", brief: "SOP's", nav: "sop", url: "/sop-hq", ms: 15700 },
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
