"use client";

// Tab 5 of 10 — Multi AI.
//
// Short cut of AiCoachHeroTour, which is the AI Coach & Agent feature page. The
// product calls that area Multi AI, which is the client's label for this tab.
//
//   1. the home screen      two coaches, and their suggested prompts differ
//   2. switch coach         Multi AI Assistant -> Strategic Coach, prompts swap
//   3. change the model     the picker, both providers, Haiku -> Sonnet
//   4. an honest answer     named records, real numbers, an uncomfortable read
//   5. build me a chart     it reads the ledger and draws the thing
//
// THERE ARE EXACTLY TWO COACHES, and these are their names: "Multi AI Assistant"
// and "Strategic Coach". An earlier version of this act invented a CFO Coach and
// a Sales Coach, neither of which exists in the product. Both coaches' names,
// subtitles and suggested prompts here are the real ones, copied from
// AiCoachHeroTour, which took them from the client's own screenshots. Do not add
// a third.
//
// Beat 2 is the only reason the suggested prompts are on screen. Two labels over
// one assistant would be a re-skin; four prompts that genuinely change when you
// switch is the evidence that they are different coaches. The Assistant's
// prompts are about YOUR tasks and YOUR week; the Coach's are about the business.
//
// Beat 3 is the model picker, verbatim from the product including its second
// group. Drawing the OpenAI models matters because the product is candid that
// they lose the business tools, and that honesty is easier to show than to say.
//
// The question is CLICKED from the Strategic Coach's own suggestions rather than
// typed. That ties beat 4 back to beat 2, and costs less time than typing it.
//
// The answer, not the chart, is the point. A chart is a party trick; the sentence
// that tells you your marketing team is too small to hit your own annual goal is
// the product. Every figure it cites is one another tab on this same tour already
// publishes: $54.1K is the Scoreboard's current Revenue cell, $1M ARR is an
// Annual Goal on the One Page Plan.
import { useRef, useState } from "react";
import { useAct, type Rig } from "../rig";
import { Caret, IBot, IChevron, ICompass, ISpark, PageHead, Pill, T, type Icon } from "../ui";

const ASSISTANT = "#4B57C4";
const COACH = "#1592AE";

type CoachKey = "assistant" | "coach";
const COACHES: Record<CoachKey, { name: string; sub: string; c: string; icon: Icon; prompts: string[] }> = {
  assistant: {
    name: "Multi AI Assistant",
    sub: "Your AI Assistant for day-to-day work",
    c: ASSISTANT,
    icon: IBot,
    prompts: [
      "What should I focus on this week based on my assigned tasks?",
      "Draft a short status update to my manager on what I shipped this week.",
      "Which of my tasks are overdue or at risk, and what should I do first?",
      "Where can I find the SOP for onboarding a new client?",
    ],
  },
  coach: {
    name: "Strategic Coach",
    sub: "Ask me anything",
    c: COACH,
    icon: ICompass,
    prompts: [
      "Based on my data, what are the top 3 things I should focus on this week?",
      "How can I produce more results in my role, for the company?",
      "Where does the business look like it needs the most support?",
      "What am I not seeing in my role that I should be paying attention to?",
    ],
  },
};

/** Which of the Strategic Coach's suggestions the pointer picks. */
const PICK = 0;

// The model picker, verbatim from the product.
const MODELS: { group: string; icon: Icon; items: { key: string; label: string; short: string; sub: string }[] }[] = [
  {
    group: "Claude (Anthropic)",
    icon: ISpark,
    items: [
      { key: "haiku", label: "Claude Haiku 4.5", short: "Haiku 4.5", sub: "Default. Fast, cost effective, and comprehensive." },
      { key: "sonnet", label: "Claude Sonnet 4.6", short: "Sonnet 4.6", sub: "Use Sonnet for your deepest work." },
      { key: "opus", label: "Claude Opus 4.8", short: "Opus 4.8", sub: "Deepest reasoning for your hardest strategic work." },
    ],
  },
  {
    group: "GPT (OpenAI)",
    icon: IBot,
    items: [
      { key: "gpt5", label: "OpenAI GPT-5", short: "GPT-5", sub: "Text in, text out, with no business tools or web search." },
      { key: "gpt5mini", label: "OpenAI GPT-5 mini", short: "GPT-5 mini", sub: "Value tier, with the same constraints." },
    ],
  },
];
const ALL_MODELS = MODELS.flatMap((g) => g.items);
/** Which model the pointer switches to. */
const MODEL_PICK = "sonnet";

const ANSWER =
  "No. At $54.1K in June you are pacing to $712K, not $1M. The gap is marketing: 2 of 9 seats filled, and Cost per Lead is 31% over goal.";

const MONTHS = [
  ["Jan", 38.0],
  ["Feb", 41.4],
  ["Mar", 43.8],
  ["Apr", 47.2],
  ["May", 49.1],
  ["Jun", 54.1],
] as const;
const GOAL = 83.3; // $1M / 12
// Headroom above the goal line. At 92 the dashed line sat hard against the
// chart title; the bars are meant to look far short of it, not cramped under it.
const SCALE = 100;
const CHART_H = 128;

type Scene = {
  who: CoachKey;
  /** Bumped on every coach switch, so the prompt cards re-stagger in. */
  gen: number;
  hot: string;
  picker: boolean;
  model: string;
  sent: boolean;
  thinking: boolean;
  answer: string;
  chart: boolean;
};
const BLANK: Scene = {
  who: "assistant",
  gen: 0,
  hot: "",
  picker: false,
  model: "haiku",
  sent: false,
  thinking: false,
  answer: "",
  chart: false,
};

export default function MultiAiAct({ active, rig }: { active: boolean; rig: Rig }) {
  const [s, setScene] = useState<Scene>(BLANK);
  // Scopes cursor-target lookups to THIS copy of the act. See ActApi.q.
  const rootRef = useRef<HTMLDivElement>(null);

  useAct(active, rig, rootRef, () => setScene(BLANK), async ({ alive, wait, rig: r, q }) => {
    const patch = (p: Partial<Scene>) => alive() && setScene((x) => ({ ...x, ...p }));
    const hit = (k: string) => q(`[data-ai="${k}"]`);
    const tap = async (key: string, dur = 460, hold = 200) => {
      await r.glide(hit(key), 0.5, 0.5, dur);
      if (!alive()) return false;
      patch({ hot: key });
      await wait(hold);
      if (!alive()) return false;
      await r.click();
      patch({ hot: "" });
      return alive();
    };

    r.at(hit("coach-coach"), 0.5, 0.5);
    await r.fade(1, 200);
    if (!alive()) return;
    await wait(240);

    // ---- 2. switch coach, and watch the suggestions change
    if (!(await tap("coach-coach", 400, 220))) return;
    setScene((x) => ({ ...x, who: "coach", gen: x.gen + 1 }));
    // Long enough to actually read a couple of the swapped prompts. They are the
    // evidence for this beat, so skimming past them wastes the beat.
    await wait(1100);

    // ---- 3. change the model
    if (!(await tap("model", 500, 200))) return;
    patch({ picker: true });
    // Five models with subtitles is a lot to take in; hold it open.
    await wait(900);
    if (!(await tap(`m-${MODEL_PICK}`, 400, 200))) return;
    patch({ picker: false, model: MODEL_PICK });
    await wait(520);

    // ---- 4. ask one of the coach's own questions
    if (!(await tap(`p-${PICK}`, 460, 220))) return;
    patch({ sent: true, thinking: true });
    await r.fade(0, 260);
    if (!alive()) return;
    await wait(400);

    patch({ thinking: false });
    await wait(110);
    for (let i = 1; i <= ANSWER.length; i++) {
      if (!alive()) return;
      patch({ answer: ANSWER.slice(0, i) });
      await wait(8);
    }
    if (!alive()) return;
    await wait(170);

    // ---- 5. and the evidence under it
    patch({ chart: true });
  });

  const coach = COACHES[s.who];
  const CoachIcon = coach.icon;
  const model = ALL_MODELS.find((m) => m.key === s.model) ?? ALL_MODELS[0];

  return (
    <div ref={rootRef} className="flex h-full flex-col gap-3">
      <PageHead
        title="Multi AI"
        sub="Your AI Chief of Staff, reading your real numbers."
        right={
          <span className="flex items-center gap-[6px]">
            {(Object.keys(COACHES) as CoachKey[]).map((k) => {
              const c = COACHES[k];
              const on = k === s.who;
              const Ico = c.icon;
              return (
                <span
                  key={k}
                  data-ai={`coach-${k}`}
                  className="inline-flex items-center gap-[6px] rounded-full border px-[10px] py-[6px] text-[11.5px] font-semibold transition-all duration-200"
                  style={{
                    borderColor: on ? c.c : T.hair2,
                    background: on ? `${c.c}12` : "#fff",
                    color: on ? c.c : T.muted,
                    boxShadow: s.hot === `coach-${k}` ? `0 0 0 3px ${c.c}2E` : undefined,
                  }}
                >
                  <Ico className="h-[13px] w-[13px]" />
                  {c.name}
                </span>
              );
            })}
          </span>
        }
      />

      <div
        className="relative flex min-h-0 flex-1 flex-col rounded-[12px] border bg-white px-4 py-4"
        style={{ borderColor: T.hair }}
      >
        <div className="min-h-0 flex-1 overflow-hidden">
          {!s.sent ? (
            /* ---------------- the coach's home screen ---------------- */
            <div className="flex h-full flex-col">
              <div className="flex flex-none items-center gap-[10px]">
                <span
                  className="grid h-[34px] w-[34px] flex-none place-items-center rounded-[10px] transition-colors duration-300"
                  style={{ background: `${coach.c}14`, color: coach.c }}
                >
                  <CoachIcon className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[15px] font-bold leading-tight">{coach.name}</span>
                  <span className="block text-[11.5px]" style={{ color: T.muted }}>
                    {coach.sub}
                  </span>
                </span>
              </div>

              <div
                className="mt-3 flex-none text-[9.5px] font-bold uppercase tracking-[0.1em]"
                style={{ color: T.muted2 }}
              >
                Suggested for you
              </div>

              {/* Keyed on the switch count, so changing coach re-mounts the cards
                  and they stagger in rather than swapping their text in place. */}
              <div key={s.gen} className="mt-2 grid grid-cols-2 gap-2">
                {coach.prompts.map((p, i) => (
                  <span
                    key={p}
                    data-ai={`p-${i}`}
                    className="flex items-start gap-2 rounded-[10px] border px-3 py-[10px] text-[11.5px] leading-[1.4] transition-colors duration-200"
                    style={{
                      borderColor: s.hot === `p-${i}` ? coach.c : T.hair2,
                      background: s.hot === `p-${i}` ? `${coach.c}0A` : "#FCFBFA",
                      color: "#3C3833",
                      animation: `homeTourRise 320ms ${i * 70}ms cubic-bezier(0.22,1,0.36,1) both`,
                    }}
                  >
                    <ISpark className="mt-[1px] h-[12px] w-[12px] flex-none" style={{ color: coach.c }} />
                    {p}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            /* ---------------- the exchange ---------------- */
            <div>
              <div className="flex justify-end">
                <span
                  className="max-w-[62%] rounded-[12px] rounded-br-[4px] px-[13px] py-[9px] text-[13px] font-medium text-white"
                  style={{ background: T.navy }}
                >
                  {COACHES.coach.prompts[PICK]}
                </span>
              </div>

              <div className="mt-3 flex gap-[10px]">
                <span
                  className="mt-[1px] grid h-[26px] w-[26px] flex-none place-items-center rounded-full"
                  style={{ background: coach.c }}
                >
                  <CoachIcon className="h-[14px] w-[14px] text-white" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <b className="text-[12.5px]">{coach.name}</b>
                    <Pill bg={`${coach.c}14`} fg={coach.c}>
                      {model.short}
                    </Pill>
                    <Pill bg={T.orangeSoft} fg={T.orange}>
                      Reading 4 sources
                    </Pill>
                  </div>

                  {s.thinking ? (
                    <div className="mt-2 flex items-center gap-[5px]">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="h-[6px] w-[6px] rounded-full"
                          style={{
                            background: T.muted2,
                            animation: `homeTourBlink 1s ${i * 0.16}s infinite ease-in-out`,
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="mt-[6px] text-[13.5px] leading-[1.55]" style={{ color: "#3C3833" }}>
                      {s.answer}
                      <Caret on={s.answer.length > 0 && s.answer.length < ANSWER.length} />
                    </p>
                  )}

                  {/* the chart it drew */}
                  <div
                    className="mt-3 overflow-hidden rounded-[10px] border transition-all duration-[420ms] ease-out"
                    style={{
                      borderColor: T.hair,
                      background: "#FCFBFA",
                      maxHeight: s.chart ? 220 : 0,
                      opacity: s.chart ? 1 : 0,
                    }}
                  >
                    <div className="flex items-center gap-2 px-3 pb-1 pt-[10px]">
                      <b className="text-[11.5px]">Monthly revenue against the pace you need</b>
                      <span className="ml-auto text-[10.5px]" style={{ color: T.muted2 }}>
                        Source: CFO Dashboard · One Page Plan
                      </span>
                    </div>

                    <div className="relative px-3 pb-2" style={{ height: CHART_H + 30 }}>
                      <div
                        className="absolute left-3 right-3 flex items-center transition-opacity duration-500"
                        style={{ bottom: 26 + (GOAL / SCALE) * CHART_H, opacity: s.chart ? 1 : 0 }}
                      >
                        <span className="flex-1 border-t border-dashed" style={{ borderColor: T.pinkInk }} />
                        <span
                          className="ml-2 flex-none rounded-full px-2 py-[2px] text-[9.5px] font-bold"
                          style={{ background: T.pink, color: T.pinkInk }}
                        >
                          Need $83.3K/mo
                        </span>
                      </div>

                      <div
                        className="absolute bottom-[26px] left-3 right-3 flex items-end gap-[10px]"
                        style={{ height: CHART_H }}
                      >
                        {MONTHS.map(([m, v], i) => (
                          <div key={m} className="flex flex-1 flex-col items-center justify-end">
                            <span className="mb-1 text-[9.5px] font-bold" style={{ color: T.muted }}>
                              ${v}K
                            </span>
                            <span
                              className="w-full rounded-t-[4px] transition-all ease-out"
                              style={{
                                height: s.chart ? (v / SCALE) * (CHART_H - 16) : 0,
                                background: i === MONTHS.length - 1 ? T.orange : "#F0C79A",
                                transitionDuration: "560ms",
                                transitionDelay: `${i * 50}ms`,
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="absolute bottom-1 left-3 right-3 flex gap-[10px]">
                        {MONTHS.map(([m]) => (
                          <span key={m} className="flex-1 text-center text-[10px]" style={{ color: T.muted2 }}>
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ---------------- the model picker ----------------
            Opens upward from the model chip, so it never covers the composer it
            belongs to. Both provider groups are drawn on purpose. */}
        <div
          className="absolute bottom-[62px] right-4 z-40 w-[292px] rounded-[12px] border bg-white p-[6px] transition-all duration-200"
          style={{
            borderColor: "rgba(0,0,0,0.09)",
            boxShadow: "0 6px 14px rgba(10,10,10,0.07), 0 22px 48px rgba(10,10,10,0.18)",
            opacity: s.picker ? 1 : 0,
            transform: s.picker ? "translateY(0) scale(1)" : "translateY(6px) scale(0.97)",
            pointerEvents: "none",
          }}
        >
          {MODELS.map((g) => {
            const GIco = g.icon;
            return (
              <div key={g.group} className="mb-[2px] last:mb-0">
                <div
                  className="flex items-center gap-[6px] px-2 py-[5px] text-[8.5px] font-bold uppercase tracking-[0.1em]"
                  style={{ color: T.muted2 }}
                >
                  <GIco className="h-[11px] w-[11px]" />
                  {g.group}
                </div>
                {g.items.map((m) => {
                  const on = m.key === s.model;
                  return (
                    <div
                      key={m.key}
                      data-ai={`m-${m.key}`}
                      className="rounded-[8px] px-2 py-[6px] transition-colors duration-150"
                      style={{
                        background: s.hot === `m-${m.key}` ? "#F6F3EE" : on ? T.orangeSoft : "transparent",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[11.5px] font-semibold" style={{ color: on ? T.orange : T.ink }}>
                          {m.label}
                        </span>
                        {on && (
                          <span className="ml-auto text-[10px] font-bold" style={{ color: T.orange }}>
                            ✓
                          </span>
                        )}
                      </div>
                      <div className="mt-[1px] text-[9.5px] leading-[1.35]" style={{ color: T.muted2 }}>
                        {m.sub}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* ---------------- composer ---------------- */}
        <div
          className="mt-3 flex flex-none items-center gap-[10px] rounded-[10px] border px-3 py-[9px]"
          style={{ borderColor: T.hair2 }}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 flex-none" fill="none" stroke={T.muted2} strokeWidth={1.8}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="min-w-0 flex-1 truncate text-[12.5px]" style={{ color: T.muted2 }}>
            {s.sent ? "Ask a follow-up…" : `Ask ${coach.name}…`}
          </span>
          <span
            data-ai="model"
            className="flex flex-none items-center gap-[5px] rounded-[7px] border px-[9px] py-1 text-[11px] font-semibold transition-all"
            style={{
              borderColor: s.hot === "model" || s.picker ? T.orange : T.hair2,
              color: s.hot === "model" || s.picker ? T.orange : "#57534C",
              boxShadow: s.hot === "model" ? "0 0 0 3px rgba(234,123,27,0.18)" : undefined,
            }}
          >
            <ISpark className="h-[11px] w-[11px]" />
            {model.short}
            <IChevron
              className="h-[10px] w-[10px] transition-transform duration-200"
              style={{ transform: s.picker ? "rotate(-90deg)" : "rotate(90deg)" }}
            />
          </span>
          <span
            className="grid h-[26px] w-[26px] flex-none place-items-center rounded-[7px] text-white"
            style={{ background: "#D9D5CE" }}
          >
            <IChevron className="h-[14px] w-[14px] -rotate-90" />
          </span>
        </div>
      </div>

      <style>{`
@keyframes homeTourBlink{0%,80%,100%{opacity:.25}40%{opacity:1}}
@keyframes homeTourRise{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
`}</style>
    </div>
  );
}
