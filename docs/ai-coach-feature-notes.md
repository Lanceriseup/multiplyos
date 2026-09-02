# AI Coach & Agent / Multi AI: how the real product works

Reference notes for the `/features/ai-coach` marketing page. Sources, August 2026:

1. Six screenshots of the live app inside the Rise Up Kings account: the Multi AI home on each of the
   two coaches, a Strategic Coach conversation mid-stream, an Assistant conversation that drafted a
   status update, the Saved Memory modal, and the Interactive AI Tools page.
2. The client's brief.
3. A thirteen-point capability list the product gave about itself, relayed through Multi AI.

House rules: **no em dashes** in site copy. Quoted UI strings below are verbatim, so several carry
the product's own em dashes. Do not copy that punctuation onto the page.

---

## 1. The client's brief

> Show Multi AI, show it building a chart, show it giving insightful information, etc

**Replaces Claude and ChatGPT.** Artwork is at `public/replaces-claude.png` and
`public/replaces-chatgpt.png`.

> ### The tension in that claim, and how the page handles it
>
> The product's own footer reads **`Powered by Claude & GPT`**, and the model picker in every
> conversation says `Sonnet 4.6`, with the response footer stamped `Sonnet 4.6 · Anthropic`.
>
> So the page cannot say "better than Claude" or "instead of ChatGPT" without immediately
> contradicting the app's own chrome. What it says instead, which is both true and stronger:
> **it is the same models, except they can see your business.** You are not replacing the
> intelligence, you are replacing the copying and pasting. That reframes the Replaces strip from a
> weak claim into the actual argument.

---

## 2. What the screenshots confirm

### The shell

Left sidebar, top to bottom: **`Multi AI`** with the subtitle **`Coach & Assistant`**, a collapse
control, an orange **`New chat`**, `Search chats...`, and **`Memory`** with a brain glyph.

Then **`HUBS`** with a `View all`, showing `Marketing Email Creator` with a count of `4` and a
disclosure arrow. **Hubs are not explained anywhere in these screenshots.** See section 4.

Then chat history grouped by **`TODAY`**, **`THIS WEEK`**, **`THIS MONTH`**. Each row carries a glyph
that differs by coach, so history is visibly per-coach.

A global top bar sits above everything with an orange `+` and `Search Multiply...` at `Ctrl+K`.

### The home screen

A sparkle tile, **`Good evening, Lance.`**, and **`Your AI assistant for day-to-day work. Ask away.`**

The composer: a paperclip, `Ask Multi...`, a **model picker reading `Sonnet 4.6`**, a microphone, and
send. Under it, always:

> Coach responses are based on your live company data. Always verify important decisions with your
> team.

Then **two coach cards**:

| Coach | Subtitle | Tint |
| --- | --- | --- |
| `Multi AI Assistant` | `Your AI Assistant for day-to-day work` | indigo |
| `Strategic Coach` | `Ask me anything` | cyan |

And at the very bottom:

> Powered by Claude & GPT &middot; Answers grounded in your live company data

### The model picker, September 2026

The composer's model chip opens a grouped picker. Five models across two providers, and the copy is
candid in a way worth reusing:

| Group | Model | The product's own description |
| --- | --- | --- |
| `CLAUDE (ANTHROPIC)` | `Claude Haiku 4.5` | `Default — Haiku is fast, cost effective, and comprehensive.` |
| | `Claude Sonnet 4.6` | `Use Sonnet for your deepest work.` |
| | `Claude Opus 4.8` | `Anthropic flagship — deepest reasoning for your hardest strategic work (slower, costlier).` |
| `GPT (OPENAI)` | `OpenAI GPT-5` | `OpenAI flagship. Text in / text out — no business tools, web search, or images.` |
| | `OpenAI GPT-5 mini` | `OpenAI value tier. Faster and cheaper than GPT-5 with the same constraints.` |

Two things matter here. **Haiku is the default**, not Sonnet, which the hero mockup had wrong. And
the product openly says the **OpenAI models lose the business tools, web search, and images** — so
the grounding this whole page argues for is a Claude-path capability. Do not let the page imply the
two providers are interchangeable.

### The suggested prompts change with the coach

This is the single best detail in the screenshots, because it proves the coaches are actually
different rather than two labels on one thing. Both sets are verbatim.

**Multi AI Assistant**, all operational, all first person:

- `What should I focus on this week based on my assigned tasks?`
- `Draft a short status update to my manager on what I shipped this week.`
- `Which of my tasks are overdue or at risk, and what should I do first?`
- `Where can I find the SOP for onboarding a new client?`

**Strategic Coach**, all reflective, two of them uncomfortable:

- `Based on my data, what are the top 3 things I should focus on this week?`
- `How can I produce more results in my role, for the company?`
- `Where does the business look like it needs the most support?`
- `What am I not seeing in my role that I should be paying attention to?`

The Assistant asks what you should *do*. The Coach asks what you are *missing*. The page is built on
that split.

### A real Strategic Coach answer

Worth reproducing at length, because the tone is the product:

> Lance, here's the honest picture: you have two overdue Tasks sitting on your plate right now, and
> you have **zero weeks filled** in your Q3 12-Week-Year plan. That's the biggest lever you can pull
> today.
>
> **The immediate gap — your 12-Week-Year plan**
> Every other person on the team has weekly priorities mapped out through Q3. You don't have a single
> week filled. That means you're operating without a scoreboard [...]
>
> **Your open Tasks — two are overdue**
> - **[Tech Team] Fwd: No Longer Bound - URGENT** — assigned from Email Intake, was due August 14.
>   That's 11 days overdue.
> - **[Tech Team] Re: 2026 Calendar Changes** — assigned from Will Stratman, was due August 10.
>   That's 15 days overdue.

Note what it does: **names the records, counts the days, and tells the user they are the problem.**
It is not a summariser. The response is stamped **`Sonnet 4.6 · Anthropic`**.

### A real Assistant answer

Asked to draft a status update, it showed a **`✓ Questions answered`** chip, then narrated its own
tool use:

> Let me pull your recent tasks so the update reflects what you actually shipped.

then produced a formatted update headed `Weekly Status Update — Lance Ramirez | August 18–24 (W33)`,
with completed items, a section flagging two overdue ones "for visibility", and a closing offer:

> Want me to adjust the tone, add context on any of the items, or address the overdue tasks
> differently?

**So it reads records before answering and says so.** That narration is worth showing.

### Saved Memory

> **Saved Memory for Multi AI** (Saved only for Lance's chats)
> Durable facts Multi uses in every conversation, plus memory and instructions you can give each
> coach on its own. Memories are private to you and never shared with teammates.

Three tiers, and the limits are explicit:

1. **`Primary instructions`**, a 5000-character field. Placeholder:
   `e.g. Always answer concisely. Show concrete numbers. Use plain English, not jargon. Never
   recommend anything that conflicts with our company values.`
2. **`Shared with every coach`**, capped at **25 memories**.
3. **`Memory for each coach`**, capped at **8 memories** each, "Kept short on purpose so each coach
   stays fast."

Plus guidance headed `What works well as a memory`: durable facts, working preferences, the kind of
help you want. And explicitly **not** one-off project facts, which belong in "Project custom
instructions instead".

**`Memories are private to you and never shared with teammates`** is the sentence to put on the page.
It is the objection everybody raises about AI memory in a work tool.

### Interactive AI Tools

A page of its own, reached from the coach.

> **Interactive AI Tools**
> Interactive HTML reports and mini-apps Multi has built for you. Open, download, or share one with
> your team or anyone via a link.

The three-step explainer is verbatim gold:

> 1. Open the **Multi AI Coach** and start (or continue) a conversation.
> 2. Ask it to build an interactive report — e.g. *"Build me an interactive dashboard of our top
>    scoreboard metrics"* or *"Make a mortgage calculator I can put on my website."*
> 3. It saves here automatically. Open, download, or share it — or click Edit in chat to ask Multi to
>    refine it.

Three example templates ship with it:

| Template | The product's own description |
| --- | --- |
| `Mortgage Calculator` | `A lead-gen widget you can embed on a website — visitors estimate a monthly payment, then hit your CTA.` |
| `Scoreboard Dashboard` | `An internal report combining several charts — monthly revenue, a leads trend line, and goal progress` |
| `ROI / Savings Calculator` | `Another lead-gen angle — prospects enter a few numbers and see their projected annual savings` |

Each offers `Use this with Multi`, `Open Multi`, and `New tab`. Built tools get `Open`, `download`,
`share`, and **`Edit in chat`**.

**Two of the three examples are lead-gen widgets for a customer's own website.** That is a much
bigger claim than "it makes charts" and the page says so.

---

## 3. The capability list

Thirteen headings the product gave about itself. Condensed, with what the page does about each:

| # | Capability | On the page? |
| --- | --- | --- |
| 1 | Your tasks, what is overdue, what to focus on | Yes, section 3 |
| 2 | Scoreboards: 13 weeks of history, up to 3 years for one metric, **log numbers directly**, generate charts | Yes, sections 3 and 4 |
| 3 | Goals, Issues, leadership meeting notes, SWOT | Yes, section 6 |
| 4 | P&L, margin, balance sheet, cash flow flags, **for those with financial access** | Yes, section 6, permission caveat included |
| 5 | Org chart, DISC profiles for teammates, role responsibilities | Yes, section 6 |
| 6 | Search SOPs, walk a process step by step, **offer to draft one that does not exist** | Yes, section 6 |
| 7 | Emails, status updates, meeting notes, brand-voice copy, social graphics and flyers | Partly. See section 4. |
| 8 | Interactive dashboards and calculators, PDF / Excel / CSV exports, charts from real data | Yes, section 4 |
| 9 | Read and summarise AI-enabled form and survey responses | Yes, section 6 |
| 10 | Web search, fetch a URL, **critique a website's design, copy, UX and conversion** | Yes, section 6 |
| 11 | Guided expert playbooks, e.g. Compensation Plans | Not claimed. See section 4. |
| 12 | Memory, viewable and editable | Yes, section 5 |
| 13 | General assistant, any general knowledge question | Yes, section 6 |

Two facts from the list that are worth more than they look:

- **It can log your weekly numbers into the scoreboard.** That is the first thing in any of these
  notes where Multi *writes* rather than reads. It makes "Agent" in the nav label mean something.
- **Up to 3 years of history for a single metric**, against 13 weeks for the board. A specific,
  checkable number.

---

## 4. The gaps

**1. Hubs.** `HUBS`, `View all`, and `Marketing Email Creator 4` are in the sidebar of every
screenshot and explained nowhere. A hub with a count of four looks like a saved workspace or a
multi-step assistant, but that is a guess. **Not claimed on the page.** One screenshot of a hub open
would probably earn its own section.

**Still open as of September 2026.** Lance asked for the hero tour to show a hub being built,
suggesting "a social media voice or a sales quote tool" as examples. Those examples suggest a hub is
a saved, configured assistant with a purpose and a stored brief, which would fit the sidebar count.
It was **not built**, because every other screen in this tour is drawn from a screenshot and there
is still none of a hub. What is needed to build it: the hub open, and whatever screen creates one.

**2. Guided expert playbooks.** Capability 11 names `Compensation Plans` as an expert-authored
playbook you can be walked through. Nothing in the UI shows this. Not claimed.

**3. Social graphics and flyers.** Capability 7 says Multi creates "social graphics, flyers, and
event visuals (with or without text)". Nothing in the screenshots shows image generation. The page
claims the writing half of capability 7 and stays quiet about the image half.

**4. The `Multi ⌄` and `Strategic Coach ⌄` carets** in the conversation header suggest you can switch
coach mid-thread. Never opened. Not claimed.

**5. Voice.** There is a microphone in the composer in every screenshot. What it does, dictation
versus a spoken conversation, is unknown. The page shows the button and says nothing about it.

**6. `Questions answered`** is a chip in the Assistant transcript with a tick. Its meaning is
unclear, possibly a form or survey tool completing. Not claimed.

---

## 5. Two findings that affect OTHER pages

**These came out of screenshot 3 and need Lance's decision. Both were flagged in chat.**

### 5.1 The weekly layer exists after all

When the Team Accountability page was built, the twelve One Page Plan screenshots showed no monthly
or weekly goal tier, so the page deliberately claims none. See
`docs/team-accountability-feature-notes.md` section 6.

**The Strategic Coach transcript contradicts that:**

> you have **zero weeks filled** in your Q3 12-Week-Year plan
>
> Every other person on the team has weekly priorities mapped out through Q3. You don't have a single
> week filled.

"Weeks filled", "weekly priorities mapped out through Q3", and a per-person plan are exactly the
weekly outcome management the client asked for and we declined to show. **A weekly planning surface
appears to exist.** Team Accountability is currently underselling it. Needs a screenshot.

### 5.2 The product itself says "12-Week-Year"

The same transcript calls it `your Q3 12-Week-Year plan`. The Team Accountability page deliberately
avoids the phrase on trademark grounds (Brian Moran), per Lance's call. That decision may still be
right for public marketing even though the product uses it internally, but it should be a decision
made with this evidence rather than without it. See
`docs/team-accountability-feature-notes.md` section 7.

---

## 6. The invented data

The screenshots are Lance Ramirez's own account, with real overdue tasks, real teammates, and real
internal chat titles. **None of that goes on a public marketing page.**

The mockups use the fictional company the other feature pages established, **Ridgeline Services**,
with **Skylar Lewis** as the user. The answers Multi gives in the mockups are stitched from the
numbers already on the other pages, which is the point: the whole argument is that it can see all of
them at once.

| Fact used | Where it already appears |
| --- | --- |
| Cost per lead is the quarter's only Critical goal, 0 of 4 milestones | Team Accountability |
| Marketing is two seats against Sales' three, one part-time | Org Chart |
| Marketing spend up 17.5% against 8.4% revenue growth | CFO Analytics |
| Second market open and profitable is Critical | Team Accountability |

The chart the tour builds plots marketing spend against cost per lead over the same six months the
CFO Analytics page uses (February to July 2026), and the spend figures reconcile with that page's
P&L: `24,800 / 27,200 / 29,600 / 31,400 / 33,100 / 38,900`, ending on the same `38,900` the P&L
shows for July. Cost per lead runs `14 / 15 / 16 / 17 / 19 / 23` against an `18` goal.

Spend up 57%, cost per lead up 64%. That is the insight the mockup exists to deliver, and it is
arithmetically true against the other pages.

---

## 7. Page status

- Route `/features/ai-coach`, nav label `AI Coach & Agent`, tile colour `#4B3CC4` from the navbar.
- **Replaces Claude and ChatGPT**, with the framing caveat in section 1.
- **This is the only feature page that does not end with the `MultiAiWired` closer**, because the
  whole page is Multi AI and the component would be arguing with itself. Its closing section is a
  cross-product one instead, which is also the page that ties the other eleven together.
### The hero tour, September 2026

Two beats were added, both drawn from screenshots.

- **The model picker**, opened just before the Coach's hardest question and switched from the
  default `Haiku 4.5` to `Claude Opus 4.8`. Placed there deliberately: the product's own description
  of Opus is "deepest reasoning for your hardest strategic work", so the switch reads as a judgement
  rather than as a feature demo. The picker opens **downward**, because on the home screen the
  composer sits mid-page with the suggested prompts under it.
- **Saved Memory**, as the closing beat and the longest one in the tour, reached from the sidebar.
  It shows all three tiers with their real caps, the `What works well as a memory` guidance, and
  the privacy line. The cursor actually fills two of the three tiers:

  1. **Primary instructions**, typed in and saved: `Answer concisely. Plain English, not jargon.`
     The `0/5000` counter runs up as the characters land and the `Save primary instructions` button
     goes from grey to live to a green `Saved`. The counter is what makes the field read as a real
     5000-character field rather than a label.
  2. **Shared with every coach**, filled one memory at a time so the `N of 25 memories` count moves
     on screen: `We price in tiers, never hourly.` then `Our fiscal year starts in April.`

  All three strings are **durable preferences or standing facts**, never anything about a project
  and never anything that changes soon. That is deliberate: it is the exact line the product's own
  guidance draws, so the mockup demonstrates the guidance instead of contradicting it.

Memory closes the loop rather than opening it: it is the reason the coach opened already knowing
the business, which is what the September hero copy ("Gets smarter every day") now promises. It
gets the most screen time of any beat for the same reason.

The loop runs about **forty-three seconds**. Roughly eight seconds were trimmed out of the earlier
holds across two passes to pay for the two new beats. If it needs to come down further, the
cheapest cut is the Assistant's opening errand, worth about six seconds, since the Coach beat
already establishes the grounding argument on its own.

- Not claimed anywhere, all real: Hubs, the `Ctrl+K` global search, chat search, attachments, voice,
  PDF / Excel / CSV export, coach switching mid-thread, image generation, and expert playbooks.
