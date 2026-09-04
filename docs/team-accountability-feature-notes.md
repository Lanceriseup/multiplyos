# Team Accountability / One Page Plan: how the real product works

Reference notes for the `/features/team-accountability` marketing page. Sources, August 2026:

1. Twelve screenshots of the live app inside the Rise Up Kings account: the full One Page Plan, and
   every edit modal on it (Why We Exist, Core Values, Company Vision, all four SWOT quadrants,
   Long-Term Detail, Annual Detail, and two Quarterly Details).
2. The client's brief on what the page must show.
3. The product's help-centre description of the One Page Plan, relayed through Multi AI.

House rules: **no em dashes** in site copy. Quoted UI strings below are verbatim, so several carry
the product's own punctuation. Do not copy that onto the page.

> **Two decisions taken before this page was built**, both by Lance, both binding:
>
> 1. **Only what the screenshots support goes on the page.** No invented screens. Where the client's
>    brief asks for something the screenshots do not show, the page expresses it through the real UI
>    that does exist. See section 6 for exactly what that cost.
> 2. **"12 Week Year" is not used as a name.** It is Brian Moran's trademark. The page describes a
>    twelve-week execution cycle in its own words instead. See section 7.

---

## 1. What it is

The nav calls it **Team Accountability**. The product screen is the **One Page Plan**, and its
subtitle is `[Company]'s strategic blueprint`. The pitch the help centre makes, and the one the page
takes: instead of a fifty-page strategic plan nobody opens, one screen that holds the whole company
strategy, with a named owner on every line.

---

## 2. The One Page Plan, top to bottom

Everything in this section is verbatim or directly visible.

**Header.** `One Page Plan`, subtitle `Rise Up Kings's strategic blueprint`. Top right: a company
picker (`Rise Up Kings`) and **`Plan style: Standard`**, which implies other plan styles exist. We
have not seen them, so the page does not mention styles.

**`WHY WE EXIST`.** An icon and a statement. Editable through a modal with a **sixteen-icon picker**
and a full rich-text editor (bold, italic, underline, strike, colour, highlight, H1 to H3, lists,
quote, rule, table, alignment, indent, link, undo, redo). The prompt inside the modal is
`Why does this business exist?`

**`VALUES`.** Each value is a lettered circle with the value name under it. Rise Up Kings's six
spell RISEUP, which is a nice accident of their naming and not a product feature. The edit modal
lists them with their letter circles and an `Add new value...` field.

**Period tabs.** `FY 2026` sits apart, then `Q1` `Q2` `Q3` `Q4`. The plan is scoped to whichever is
selected.

**`COMPANY VISION`.** Icon plus a one-line vision. Its modal has the same sixteen-icon picker, a
`Title` field (so the heading itself is editable), and a `Vision Statement` rich-text field.

**SWOT.** Four coloured cards: `Strengths` (green, shield), `Weaknesses` (violet, warning triangle),
`Opportunities` (blue, trend arrow), `Threats` (red, alert circle). Three items each in the
screenshot. Each opens an edit modal with **drag handles for reordering**, the list, and an
`Add new strength...` style field.

**`5+ Year Vision`** and **`Annual Goals - 2026`**, side by side, each a numbered list with a `+ Add`
in the corner and a status dot per row. Annual goals also carry a status chip.

**`Department Goals`.** A heading, then one card per department: `Operations Goals - Q3`,
`Programs Goals - Q3`, `Marketing Goals - Q3`, `Events Goals - Q3`, `Technology Goals - Q3`,
`RUK Ministries Goals - Q3`. Each row: a number, an **owner avatar**, the goal name, a **milestone
counter** (`0/5`, `2/4`, `2/5`, `1/3`), and a status chip. A department with nothing in it shows
`No Goals Found` and an `Add Goal` button.

**Footer.** `+ New One Page Plan`, under it:

> Run a separate plan for a department, or a custom plan for a division or team you pick the people
> for.

The `Ask Multi AI` pill sits bottom right, as on every screen.

### Status vocabulary

Exactly three, and the page uses no others: **`On Track`** (green), **`At Risk`** (amber),
**`Critical`** (red).

---

## 3. The goal detail modals

Three modals, one per tier, and the differences between them matter.

### `Long-Term Detail`

`Name`, `Status`, `Assignee`, `Description / Plan`, `Potential Roadblocks`, `Delete`. **No parent
field**, because it is the top of the chain.

### `Annual Detail`

Adds **`Parent Goal`**, a select showing `5,000 Mastermind Members by Dec 2027 (Long-Term)`, with
the helper text `Reassign this goal to a different parent.` So the chain is editable, not fixed at
creation.

Also carries the delete guard:

> **Delete unavailable**
> This goal has 33 child missions. Manage them below to unblock deletion.

with a `Manage 33` dropdown. **The product calls child goals "missions."** Worth knowing; the page
does not use the word, because it appears exactly once and only in an error state.

### `Quarterly Detail`

The richest one. Two tabs, **`Details`** and **`Goal Updates`**.

On `Details`:

- `Name`, with an **AI sparkle button** beside the label
- `Parent Goal`, e.g. `500 Refinery Graduates (Annual)`, or `— None —`
- `Status`, `Assignee` (**required**, red asterisk)
- **`Department`**, a select, with `Manage departments in Settings.` under it
- **`MILESTONES`**, with a done counter (`0/5 done`, `4/4 done`). Each milestone has a checkbox, its
  text, a **due date chip** (calendar icon, `Sep 30, 2026`, and an `×` to clear) or an empty
  `Due date`, and its **own assignee select**. Completed ones render struck through. Then
  `Add a milestone...` and `+ Add`.
- **`Linked projects`**, with `+ Link project` and the empty state `No projects linked to this goal
  yet.` This is the join to the Projects & Tasks feature.
- `Description / Plan` and `Potential Roadblocks`, both rich text, both with AI sparkle buttons. The
  roadblocks placeholder is `What could get in the way?`

**Three things worth pulling onto the page**, because they are the actual accountability mechanism:
the assignee is **required**, milestones carry **their own owner and due date** rather than
inheriting the goal's, and the `Goal Updates` tab means a goal has a **written history**, not just a
current status.

### AI sparkles

They appear on `Name`, `Description / Plan`, and `Potential Roadblocks`. So Multi AI can draft a
goal, its plan, and what might get in the way. Claimed on the page, since it is visible in three
separate screenshots.

---

## 4. What the help centre says it is for

Relayed through Multi AI, so product framing rather than screenshot:

1. **Clarity on what matters.** Everyone sees the same page, so "should I work on X or Y" has a
   visible answer.
2. **One accountable person per goal.** No goal is orphaned, no goal has fuzzy ownership.
3. **Scoreboards measure progress toward goals.** The weekly metric feeds the quarterly goal, which
   feeds the annual, which feeds the vision.
4. **Weekly visibility.** Reviewed in the weekly team meeting, against thirteen weeks of scoreboard
   history.
5. **The Why We Exist statement feeds the AI coaches.**

The line worth stealing, and the page does steal its shape:

> Because every goal is tied to a person, and every person's metrics are visible weekly, there's
> nowhere to hide.

---

## 5. The client's brief

Verbatim:

> (Show 12 Week Year) (Show how we reverse engineer goals from Quarterly, to Monthly, to Weekly.
> Explain that this is a weekly outcome management for entire teams, have team members plan out
> their week, every week!)

Mapped onto sections:

| Client's ask | Section | Honest? |
| --- | --- | --- |
| a twelve-week execution cycle | 5. the weekly cycle | Yes, via the `Q1..Q4` tabs and quarterly goals |
| reverse engineer quarterly to monthly to weekly | 5. the weekly cycle | **Partly. See section 6.** |
| weekly outcome management for teams | 5. the weekly cycle | Yes, via `Goal Updates` and dated milestones |
| team members plan their week, every week | 5. the weekly cycle | **Partly. See section 6.** |

**Replaces ninety.io and EOS One**, per the client. Artwork is at `public/replaces-ninety.png` and
`public/replaces-eosone.png`, both already present.

---

## 6. The gap, and how it closed

> **Resolved, August 2026.** This section originally recorded that no monthly or weekly tier existed
> in any screenshot, and the page was built to claim none. **Four screenshots of `My 12 Week Year`
> then turned up and the tier exists.** Section 5 of the page and the whole hero tour were rebuilt
> around it. What follows is what the new screenshots show.

### `My 12 Week Year`

A page of its own, in the sidebar under **`My HQ`**, alongside `My Inbox`, `My Tasks`, `My Scorecard`
and `Focus HQ`. So it is a **personal** surface, not a company one. Three selectors top right: the
person (`Lance Ramirez (me)`, so you can view somebody else's), the quarter, and the year.

**This is the client's "reverse engineer goals from Quarterly, to Monthly, to Weekly", and it is
literally that, in that order.**

### The full cascade, corrected

    Long-Term  ->  Annual  ->  Quarterly  ->  Monthly Outcomes  ->  Weekly Priorities
                                    |
                                    +-> Milestones (dated, individually owned)
                                    +-> KPIs (weekly target across 13 weeks)

### `Quarterly Goals`

Headed **`Quarterly Goals · 1 goals × 13 weeks`**. A grid: `GOALS & KPIS`, `STATUS`,
**`WEEKLY TARGET`**, then **thirteen dated week columns** (`7/6 – 7/12` through `9/28 – 10/4`), with
the current week highlighted in orange. Each goal row expands and offers **`+ Add KPI`**.

**Thirteen weeks is stated by the product**, so the page can use the number.

### `Add Quarterly Goal`

> For you. Pick a quarter &mdash; current or future.

Carries a **SMART panel**, verbatim:

| Letter | Copy |
| --- | --- |
| Specific | `what exactly will get done?` |
| Measurable | `how will you know it's done?` |
| Attainable | `within reach with the resources you have` |
| **Risky** | `a stretch that pushes you` |
| Timebound | `locked to a quarter` |

Note **Risky**, not Realistic or Relevant. That is a deliberate variant and worth not "correcting".

Fields: `Goal name` with an AI sparkle (placeholder `e.g. Increase coaching clients from 9 to 12`),
`Quarter`, `Year`, `Department`. And the empty state points both ways:

> Add one below &mdash; or in **One Page Plan** if you want to group it under a department.

**So a goal can be personal or company-scoped, and the two screens are two doors into the same
object.** That is the hinge the hero tour's zoom is built on.

### `Add KPI`

`Label` (`e.g. Admin hours/week`), **`KPI type`** defaulting to `Hit a weekly target, every week`
with the helper `e.g. ≥ 1 check-in each week — counts the weeks you hit it.`, `Weekly Target`,
`Unit (optional)` (`hours, $, %, ...`), and `Quarterly Goal (optional)`:

> Only add if you want to have a quarterly KPI verses Weekly &mdash; leave blank to judge each week.

**A KPI is judged weekly by default.** That is the mechanism behind the thirteen-column grid.

### `Monthly & Weekly Plan`

Three month cards, `MONTH 1 OF 3` through `MONTH 3 OF 3`, the current one badged **`NOW`**. Each
holds:

- **`Monthly Outcomes`**, with an AI sparkle and `+ Add outcome`
- **`Weekly Priorities`**, one row per week, dated, each showing a **`0/0`** count and a **`0 %`**

The current week is badged `NOW` and tinted orange.

### What the page now claims, and still does not

Claimed, all visible: thirteen weeks, weekly targets, monthly outcomes, weekly priorities with a
completion percentage, per-person plans, the SMART panel, and AI drafting on goal names and monthly
outcomes.

**Still not claimed:** what a Weekly Priority record actually contains beyond its text, since every
week in the screenshots is empty (`0/0`). The mockups show three plausible priorities per week and
that is an inference about *volume*, not capability.

**Still outstanding: a screenshot of the `Goal Updates` tab.** It remains the one tab in the original
twelve screenshots that was never opened.

---

## 7. The trademark note

**"The 12 Week Year" is Brian Moran's trademarked book and methodology.** The client asked for it by
name. Lance's call, August 2026: **describe the concept, do not use the name.**

> **New evidence, August 2026.** The product itself ships a screen called **`My 12 Week Year`**, in
> the sidebar, as a feature name. A Strategic Coach transcript also refers to `your Q3 12-Week-Year
> plan`. So the term is in the product regardless of what the marketing page does.
>
> **Where that leaves the page.** The hero tour reproduces the app, so the mockup's screen title
> reads `My 12 Week Year`, because that is what the screen says and a mockup that renamed it would be
> a mockup of a different product. **The page's own marketing copy still avoids the phrase**: the
> section is headed "Quarter, month, week" and the eyebrow reads the same, per Lance's call.
>
> That split is deliberate and defensible: naming a screen inside a depiction of the app is a
> different kind of use from putting the phrase in a headline. **It is still worth a decision.**
> Flagged to Lance.

If Rise Up Kings turns out to hold a licence or partner status, promoting the phrase into the copy is
a small change: the strings live in the `id="weekly"` section of
`components/TeamAccountabilityPage.tsx`, in that section's eyebrow and heading. Nowhere else.

---

## 8. The invented data, and why it hangs together

The screenshots are of **Rise Up Kings's real internal plan**, including real quarterly targets,
real renewal percentages, and real staff names. **None of that goes on a public marketing page.**

So the mockups use the fictional company the other feature pages already established: **Skylar
Lewis** as the owner, with **Jordan Rivera**, **Marcus Hale**, **Priya Nair**, and **Kath Nakamura**
as the team, and the departments the Metrics Scoreboard page already uses (Operations, Marketing,
Sales, Technology). A growing field-services business, consistent with the vans and site walks in
the Checklists mockups.

One chain is carried through every section on the page so they corroborate each other:

    Operating in 4 markets by 2031            (Long-Term, On Track)
      -> 40% gross margin on delivery         (Annual 2026, On Track)
        -> Cut job turnaround 9 days to 6     (Q3, Operations, Marcus Hale, At Risk)
          -> 5 milestones, 2 done, dated Jul 18 through Sep 30

That quarterly goal is the one the hero tour opens, the one the cascade section traces, and the one
the weekly section breaks into milestones and updates. If it changes, it changes in four places.

Status spread across the mockups is deliberately mixed (one Critical, three At Risk, the rest On
Track) so the plan reads like a real quarter rather than a sales screenshot where everything is
green.

---

## 9. Page status

- Route `/features/team-accountability`, nav label `Team Accountability`, tile colour `#B4532A` from
  the navbar.
- **Replaces ninety.io and EOS One.** Both logos present.
- Screenshot-backed throughout. The only inferences are noted in section 6, and all of them concern
  the `Goal Updates` tab.
- Not claimed anywhere, all real and available if a future revision wants them: `Plan style`,
  the sixteen-icon pickers, SWOT drag-reordering, the editable `Title` on Company Vision, the
  `Manage 33` child-goal guard, and the word "missions" for child goals.
