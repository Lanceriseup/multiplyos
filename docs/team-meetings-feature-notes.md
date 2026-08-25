# Team Meetings: how the real product works

Reference notes for the planned `/features/team-meetings` marketing page. Screenshots come from
the live app inside a customer account (Rise Up Kings), reviewed August 2026. The marketing page
mockups are hand-built rather than screenshotted, so this file is the source of truth for what
those mockups are allowed to claim.

Same two standing rules as [`sop-hq-feature-notes.md`](sop-hq-feature-notes.md):

- **Generalise the content.** The live account is full of Rise Up Kings names and email addresses.
  The feature page has to read as any business. See [Generalising pass](#6-generalising-pass).
- **No em dashes** in site copy, per house style. Quoted UI strings below are verbatim, so many of
  them carry the product's own em dashes. Do not copy that punctuation onto the page.

**Third rule, specific to this feature:** the screenshots and the AI's description disagree about
scope. Section 5 tracks that carefully. Nothing from section 5 goes on the page until it is
confirmed with a screenshot.

---

## 1. Where it lives

**These are two separate nav items, not one feature.** `Team Meetings` and `1on1s` sit next to
each other in the left nav and never link to one another.

Full left nav, read off a screenshot in August 2026, in order:

Dashboard, My HQ, One Page Plan, Scoreboards, MOS Scribe, **Team Meetings**, **1on1s**, CRM,
Calendars, Events HQ, Inventory HQ, Multi AI, Projects, SOP HQ, Forms & Checklists, Toolbox.

This supersedes the nav list in [`sop-hq-feature-notes.md`](sop-hq-feature-notes.md), which predates
`1on1s` and `Calendars`. Nav items carry badges: `1on1s` had a dot, `CRM` had a `1`. Below the nav:
`Inbox` (`9+`, `69 NEW`), `What's New`, `Help & Tours`, then the account switcher, `Rise Up Kings`,
and the signed-in user, `Lance Ramirez`.

Naming mismatch on the team side: the nav item reads `Team Meetings`, but the page header reads
`Meetings`. The page covers more than team meetings, so the header is the more honest label.
Decide which one the marketing page leads with.

**Open decision: one page or two?** The client asked to "show team meetings & 1on1's" together, but
the product treats them as separate destinations with different structures. Recommendation in
[section 8](#8-page-status).

Page header is `Meetings`, subtitle
`Leadership, recurring team meetings, and ad hoc meeting notes — all in one place.`
An orange `Start a meeting` button with a play icon sits top right. The `Ask Multi AI` pill floats
bottom right, same as everywhere else in the product.

The subtitle names **three** kinds of meeting. Only two of them have sections on the page.
`Leadership` is claimed in the subtitle and then never appears. Flag for the client.

---

## 2. The Meetings index

Two stacked sections, each with a heading, a one line description, a primary button, and a list.

### Recurring Team Meetings

Heading `Recurring Team Meetings`, description `Pick a meeting, step through its agenda, and capture tasks.`

That description is the whole product promise in one line: **pick, step through, capture.** It is
the best piece of copy on the screen and the page should probably build its hero around it.

Below it a dark `+ New Recurring Team Meeting` button, then a grid of meeting cards.

**Meeting card** shows:

- a coloured icon tile (light blue with a monitor glyph on the live `Tech Team` card)
- the meeting name
- a metadata line, calendar icon then `Daily or Multi-Day · Meets today`
- a row of circular member avatars with initials, overflowing to `+3`
- an `Open ›` link, right aligned

Live account has exactly one: `Tech Team`, 7 participants total (4 avatars shown, `+3`).

`Meets today` is a live computed state, not a static label. Worth showing on the page.

### Ad Hoc Meetings

Heading `Ad Hoc Meetings`, description
`Quick, unplanned meetings — name it, pick who's in the room, and capture the notes.`

A dark `Start an Ad Hoc Meeting` button with a play icon, then a dashed empty state box:

> **No ad hoc meetings yet**
> Capture an unplanned conversation — notes and action items included.

The two sections answer two different problems, and the page should keep them distinct:
recurring meetings are **structure** (an agenda that repeats), ad hoc meetings are **capture**
(a conversation that would otherwise vanish).

---

## 3. Inside a recurring meeting

Reached by `Open ›` on a card, or through the `Start a meeting` menu.

Header: a back arrow, the meeting's icon tile, the meeting name (`Tech Team`), and an orange
`Issues` button with a warning triangle, top right.

**The `Issues` button is a real signal.** Issues are a first class object here, promoted to the
top right of the meeting the way `+ New SOP` is on SOP HQ. The agenda has an `Issues Review` step
and the daily huddle is described as covering roadblocks, so issues appear to be raised, carried,
and worked through the meeting rather than tracked somewhere else. Confirm how issues are created
and where they live between meetings before the page claims anything specific.

### The agenda card

A metadata row across the top:

- calendar icon, `Daily or Multi-Day · Mon–Fri`
- clock icon, `45 min`
- people icon, `7 participants`

Then the agenda itself, a numbered list with a duration right aligned on each row:

| # | Item | Duration |
| --- | --- | --- |
| 1 | Opening | 5m |
| 2 | Tasks Review | 15m |
| 3 | Issues Review | 15m |
| 4 | Anchor Dashboard | 10m |

**The durations sum to exactly the 45 min in the header.** 5 + 15 + 15 + 10 = 45. That is a strong
detail for the page: the agenda is timeboxed and the box adds up, which is the difference between
an agenda and a wish list.

A dark `Start meeting` button with a play icon sits at the right of the card.

Note what the agenda items point at: `Tasks Review` and `Anchor Dashboard` are references to other
parts of Multiply OS (Projects and Scoreboards). The meeting is a walk through work that already
lives in the system, not a separate place where notes pile up. **That is the integration story and
it is the strongest argument this feature has.** It is also the one thing on the marketing page
that ties Team Meetings to the Metrics Scoreboard and Projects & Tasks pages we already built.

### History

Section heading `History`, with a dashed empty state: `No past meetings yet.`

Every recurring meeting keeps a timeline of past runs. The live account has never run one, so the
populated shape is unknown. See [Open questions](#7-open-questions).

---

## 4. Starting a meeting

### The `Start a meeting` menu

Clicking the orange `Start a meeting` button opens a small dropdown with two items:

- `Recurring Team Meetings`, with a people icon and a `›` chevron, which flies out a submenu
  listing each recurring meeting by name (`Tech Team`, with a play icon)
- `Ad Hoc Meeting`, with a pencil/edit icon

The highlighted row is orange. Two clicks from anywhere on the page to a running meeting.

The global top bar is visible in this screenshot: an orange `+` button and a search field,
`Search Multiply...` with a `Ctrl K` hint.

### The New Ad Hoc Meeting modal

Title `New Ad Hoc Meeting`, subtitle
`Name the meeting and pick who's in it — then take notes in the editor.`

- **`Meeting name`** text field, placeholder `e.g. Vendor follow-up`
- **`Attendees`** with a people icon and a live count, `0 selected`, plus `Select all` and `Clear`
  actions on the right
- a `Search people` field with a magnifier
- a scrollable checkbox list of everyone in the account, each row showing full name over email
  address. Live rows, alphabetical: Alena Mixson, Alisha Dickerson, Anne Hillin, Ashley Acker,
  Beth Crow, all `@riseupkings.com`
- helper text under the list: `You'll be included automatically.`
- footer: `Cancel` and a dark `Start new meeting` button with a play icon

The attendee list is the company directory, so the meeting knows who your people are without you
typing anyone in. `You'll be included automatically` is a nice touch worth keeping in the mockup.

The phrase **"then take notes in the editor"** confirms an ad hoc meeting opens into a note editor.
Unseen. Probably the same block editor as SOP HQ, but do not assume it on the page.

---

## 5. 1on1s, the 1on1 Studio

Its own nav item, `1on1s`, and its own page. Verified by screenshot. The product spells it `1on1`,
no hyphens, and calls the page **`1on1 studio`**. Use the product's spelling on the marketing page.

Page header is a pill badge, `1ON1 STUDIO`, with a speech bubble icon, then the title `1on1 studio`.
Three buttons top right: `Org chart`, `Past meetings`, `Scorecard`.

`Org chart` and `Scorecard` sitting in the header of a 1on1 page is a real signal. The conversation
is framed by reporting lines and by the person's numbers, not just by notes.

### Setup: who, then how

An orange dashed callout runs across the top:

> **Who are you meeting with?**
> `+ Pick someone else`

with an orange `Start meeting` button and the helper `Pick a teammate first`. Until a teammate is
picked, the second `Start meeting` button lower down is disabled with
`Pick a teammate up top to begin.` **Pick a person before anything else happens.**

### Discussion Topics

A collapsible card, `Discussion Topics`, described as:

> Shared discussion topics. Add one topic per row; they carry into the live meeting agenda.

**`Shared`** is the important word. This is the "both people write the agenda before the meeting"
idea the AI described, and it is real. Topics written here become the live agenda.

### Meeting options

Card `Meeting options`, sub `Set the length, type, and flow for this 1on1.` Three settings:

- **`Meeting length`** with a clock icon, pills: `15 min`, `30 min` (default selected), `45 min`,
  `60 min`, `90 min`
- **`Meeting type`**, pills: `Regular 1on1` (selected), `Monthly check-in`, `Quarterly check-in`,
  `Annual review`
- **`Choose a flow`** with a sparkle icon, two cards:
  - **`Standard cadence`** (selected, no description shown)
  - **`12 Week Year`**, described as
    `Review the teammate's quarterly missions, monthly objectives, and weekly moves together.`

Footer: `Org default length` dropdown set to `30 min`, with `Applies to every new 1on1.`
So the org sets a default and the individual meeting can override it.

**Correcting the AI's account.** The AI claimed "four shapes of conversation depending on what you
need: a quick pulse, the standard cadence, a deep dive, or a walk through your quarter." The UI has
two separate settings, and the AI conflated them. `Standard cadence` is real. `Quick pulse` and
`deep dive` **do not exist** in the UI. Do not put them on the page. What is real is four meeting
**types** (regular, monthly, quarterly, annual) crossed with two **flows** (standard, 12 Week Year).

`12 Week Year` is a named methodology. Check whether it can be described generically on a public
marketing page.

### Right rail

A `1on1s` card with an `Add or remove` action, then two connection prompts:

- `Connect Google Calendar to send invites.`
- `Connect Microsoft Teams to send Teams invites.`

Empty state: `No 1on1 partners yet. Click Add or remove from my 1on1's above to pick anyone in your
organization.`

This partly confirms the AI's scheduling claim. Calendar invites are real and come through
integrations. **"Attach a video link" is not visible anywhere** and should not be claimed.

Note "pick **anyone** in your organization", so 1on1 partners are not restricted to your reporting
line, even though an org chart is one click away.

### Search

A `Search 1on1s` card with the placeholder
`Search notes, agendas, commitments, action items...`

Four indexed object types, and **`commitments`** is one of them. That is the strongest single word
on the page. It confirms the AI's history claim: what was discussed, what was committed, and what
got recorded, searchable across every 1on1 you have ever had.

Below it, a `Past team meetings` section with a row of tabs, cut off in the screenshot.

---

## 5b. A live 1on1 in progress

**This is the money screenshot.** It is the only view of a running meeting anywhere in the material,
and it answers what `Start meeting` actually does.

### The running-meeting bar

A persistent cream/yellow bar pinned to the top of the screen:

- an amber status dot and a shield icon
- `1on1 paused · Justin Baker`
- a monospace timer, `0:03 of 30:00`, counting against the 30 min chosen in Meeting options
- buttons: `Resume` (play), `Cancel` (x), and a dark `Complete` (check)

**The meeting is a stateful session you can pause, resume, cancel, or complete.** It is not a note
page you happen to be typing on. That bar, with a live timer against the chosen length, is the best
hero animation candidate on this whole feature.

### The meeting body

Header card repeats the `1ON1 STUDIO` pill and `1on1 studio` title, with a `← Back` button.
Then a `Regular 1on1` chip, the heading `Regular 1on1`, and `With Justin Baker`.

Sections, top to bottom:

**`QUESTIONS`**, a collapsed row with a `›` chevron. Contents unseen. Presumably prompts for what
to actually discuss, which would match the AI's "Run a 1-on-1 worth having" material.

**`AGENDA / TOPICS`**, with a parenthetical that is the single best detail in the feature:

> (Unchecked topics will be carried over to the next meeting)

Empty state `No topics yet — add what you want to cover.`, an `+ Add a topic` input and an `Add`
button. So topics are checkable during the meeting, and anything you do not get to follows you into
next time. **Nothing gets dropped just because you ran out of clock.**

**`TASKS`**, with a dark `+ Add task` button. Empty state:
`No tasks yet — add one or carry from your last 1on1.`

Same continuity idea again, and confirmation that tasks move between sessions.

**Presence row**: a green dot `You`, a grey dot `Justin`, and `not joined`. Both people are meant to
be in the document at the same time, and the page shows who has actually arrived.

**`Add Notes`**, a collapsible card with a pencil icon, described as
`— shared notes, decisions, checklists`. **`Shared`** again, and `decisions` is a distinct object
from notes and tasks.

### What this establishes

Continuity is the product thesis for 1on1s, and it is stated three separate times in one screen:
topics carry over, tasks carry from your last 1on1, and every past commitment stays searchable.
The pitch is not "take better notes." It is **"the conversation never restarts from zero."**

---

## 5c. Client methodology, which is not the product

The AI's answer also described a meeting cadence based on the 2-Day CEO framework: Daily Huddle
(5 to 15 min), Weekly Team Meeting (1 hr), Monthly Company Meeting (1 hr), Quarterly Planning,
Annual Strategy. It noted 1on1s sit outside these group meetings.

**This is customer methodology, not Multiply OS functionality.** It does explain the shape of the
product. An agenda-driven recurring meeting with timeboxes is exactly what a Daily Huddle or Weekly
Team Meeting needs, and the `Meeting type` pills (`Monthly check-in`, `Quarterly check-in`,
`Annual review`) line up with the same cadence. The `Tech Team` meeting in the screenshots,
`Mon–Fri`, 45 min, opening then tasks then issues then dashboard, is recognisably a huddle.

The framework can inform how the page is structured. The framework's own names and the 2-Day CEO
branding should not appear on the page.

Also unverified from the AI's account, and not to be claimed: recurring 1on1 scheduling with "the
system reminds you when one is due", and the dedicated experience for people who manage nobody.
Both are plausible given what is on screen, neither is visible.

### Rise Up Kings meeting rhythms, which are not the product

The same answer describes a meeting cadence based on the 2-Day CEO framework: Daily Huddle
(5 to 15 min), Weekly Team Meeting (1 hr), Monthly Company Meeting (1 hr), Quarterly Planning,
Annual Strategy. It notes 1-on-1s sit outside these group meetings.

**This is customer methodology, not Multiply OS functionality.** It does explain the shape of the
product, an agenda-driven recurring meeting with timeboxes is exactly what a Daily Huddle or
Weekly Team Meeting needs. The `Tech Team` meeting in the screenshots, `Mon–Fri`, 45 min, opening
then tasks then issues then dashboard, is recognisably a huddle.

The framework can inform how the page is structured. The framework's own names and the 2-Day CEO
branding should not appear on the page.

---

## 6. Generalising pass

Nothing is built yet, so this is the intended mapping.

| Live | Page |
| --- | --- |
| `Tech Team` | keep, it is already generic |
| Alena Mixson, Alisha Dickerson, Anne Hillin, Ashley Acker, Beth Crow | Skylar Lewis, Jordan Rivera, Priya Nair, Marcus Hale, plus one more as needed |
| `Justin Baker`, the 1on1 partner | Jordan Rivera |
| `Lance Ramirez`, the signed-in user | Skylar Lewis (SL) |
| `Rise Up Kings` in the account switcher | a neutral company name |
| `@riseupkings.com` | a neutral placeholder domain |
| 2-Day CEO, Rise Up Kings, Skylar's framework | never named on the page |
| `12 Week Year` | check licensing before naming it, see [section 7](#7-open-questions) |

Dashboard mockups across the site use **Skylar Lewis (SL)** as the owner persona. Reuse the same
people already used on the SOP HQ page so the site reads as one company throughout.

Agenda item names (`Opening`, `Tasks Review`, `Issues Review`, `Anchor Dashboard`) are generic
enough to keep verbatim, and `Tasks Review` plus `Anchor Dashboard` are useful because they echo
the Projects & Tasks and Metrics Scoreboard pages.

---

## 6b. The three beats added in front of the hero, August 2026

The hero tour originally opened on a single recurring meeting. Lance asked for three more beats
before it, and they differ sharply in how well evidenced they are.

### Confirmed, from a screenshot of the Meetings index

Heading `Meetings`, subtitle **`Leadership, recurring team meetings, and ad hoc meeting notes — all
in one place.`**, with a **`Start a meeting`** button top right.

Then **`Upcoming meetings`**, subtitled **`Provider, invitation, and MOS Scribe status for scheduled
meetings.`**, with a `View all`. Each row carries the meeting name, its date and time, an
`N invite(s) pending` count, and four actions: a **`Scheduled`** status chip, **`Join`** with a video
glyph, **`Edit`**, a red **`Cancel`**, and **`Review`**.

Then **`Recurring Team Meetings`**, subtitled `Pick a meeting, step through its agenda, and capture
tasks.`, a **`+ New Recurring Team Meeting`** button, and a card per meeting showing its icon, name,
description, cadence (`Bi-Weekly · Mondays ⏱ 11:00`) and `Last run 3w ago`.

**The word `Provider` in that subtitle matters.** It means a meeting has an external provider and an
invitation state, which is the strongest in-product evidence for the calendar claim below.

### Confirmed, from a screenshot of `New meeting type`

The proof that a meeting is configurable rather than a fixed template:

- **`Start from a template`**: `Custom Meeting`, `Sales Meeting`, `Business Development`,
  `Accounting Meeting`, `Marketing Meeting`
- a name field (`e.g. Sales Meeting`), **`Icon`** and **`Color`** selects, `Description (optional)`
- **`How often`** (`Weekly`) and **`On`**, seven day pills plus a time
- **`Agenda & timing`**, headed with a live count: **`4 stages · 30 min total`**
- **`Meeting length`** pills: `15 min`, `30 min`, `45 min`, `60 min`, `90 min`, `Custom`
- a reorderable, deletable stage list, each with a name and a minutes box. `Opening` carries a prompt
  field (`Opening prompt shown to the team (optional) — e.g. share a win, set the tone...`), and
  `Scoreboard Review` carries **`Scoreboards to review (1)`** with a named board attached
- **`Add stage:`** `+ Opening`, `+ Scoreboard Review`, **`+ One Page Plan`**
- `Cancel` / `Create`

Two things worth pulling out: **a stage can have a scoreboard attached to it**, and **One Page Plan
is an available stage type**, which wires meetings to two other features.

### NOT confirmed: the Google Calendar beat

> **Read this before anyone ships the page.** Lance's client says a meeting can be added to Google
> Calendar. **Lance could not find the option, and nobody has screenshotted it.** He asked for the
> beat anyway, which is a reasonable call given the supporting evidence, but the evidence is
> circumstantial and it is listed here in full so the claim can be checked or pulled quickly.
>
> **What is actually confirmed:**
>
> 1. **`Google Calendar` is a listed integration.** It appears under `INTEGRATIONS` in the settings
>    sidebar, visible in the DISC screenshots, alongside `Data sources`, `Marketing sources`,
>    `QuickBooks`, and `Ontraport`.
> 2. **The Meetings index tracks `Provider, invitation, and MOS Scribe status`** per scheduled
>    meeting, and every row shows a `Scheduled` chip and a `Join` action with a video glyph.
> 3. Meetings carry `N invite(s) pending`, so invitations are a real, tracked state.
>
> **What is inferred:** that creating a recurring meeting adds the event to the owner's Google
> Calendar automatically, sends the invites, and puts the video link on the event. That is what the
> tour's confirmation toast says.
>
> **If this turns out to be wrong**, the fix is contained: delete `CalToast` and the two `setCal`
> calls in `components/TeamMeetingsHeroTour.tsx`. Nothing else on the page mentions calendars.

---

## 7. Open questions

Needed before the page can be built honestly.

Resolved by the 1on1 screenshots: 1on1s do exist as shipped UI, and a running meeting is a
stateful timed session. Both former blockers are closed.

**Decided, August 2026:**

1. **One page**, covering both halves. Hero is a single continuous camera move: run a team meeting,
   zoom out to the workspace, push into a 1on1. See [section 8](#8-page-status).
2. **No branded methodology names anywhere on the page.** `12 Week Year` is Brian Moran's published
   methodology and naming another company's brand in our own marketing invites trademark and
   endorsement questions. `2-Day CEO` is the client's own framework, but it is their methodology
   rather than a Multiply OS feature. Both stay off the page. The flow is shown generically as
   `Quarterly review`, keeping the app's own description, which already names nobody:
   `Review the teammate's quarterly missions, monthly objectives, and weekly moves together.`
   Standing instruction from Lance: keep everything general enough for any business.

**Blocking for a team meetings hero, non-blocking for a 1on1 hero:**

3. **What does a running team meeting look like?** Still unseen. Does it get the same pinned timer
   bar as a 1on1, stepping through the four agenda items against their timeboxes? If it does, that
   is one motion that sells both halves of the page and the hero is obvious. **Best remaining
   screenshot to request.**
4. **What does a completed meeting record look like?** `History` and `Past meetings` are empty in
   the live account, so the payoff of running meetings in the system is undocumented. A populated
   `Past meetings` view for 1on1s would prove the continuity story rather than just asserting it.

**Each of these is a section we currently cannot write:**

5. **What is behind `QUESTIONS` in a live 1on1?** Collapsed in the screenshot. If it is a prompt
   library for what to actually discuss, that is a section of its own.
6. **What do `Org chart` and `Scorecard` open from the 1on1 header?** If a teammate's live numbers
   render inside the 1on1, that is the same integration story as `Anchor Dashboard` on the team
   side, and it is strong.
7. **How do Issues work?** First class enough for the top right button on a team meeting, and an
   agenda step, but the flow is unseen.
8. **Where do captured tasks go?** "capture tasks" and the 1on1 `TASKS` card both imply Projects &
   Tasks. If they land there, that is a direct link between two feature pages and worth proving.
9. **What is `Anchor Dashboard`?** Presumably a Scoreboards view pulled into the meeting.
10. **What does `Leadership` mean in the Meetings subtitle?** Claimed and then absent from the page.
11. **Is the ad hoc note editor the SOP HQ block editor?** Affects how much of the existing editor
    mockup can be reused. Same question for `Add Notes` in a 1on1.
12. **What does `+ New Recurring Team Meeting` open?** Presumably where agendas and timeboxes get
    set. Being able to build your own agenda is a selling point we cannot currently show. The 1on1
    side has no equivalent gap, since Meeting options is fully visible.
13. **Recurring 1on1s.** The AI claimed the system reminds you when one is due. Nothing in the
    studio shows a schedule or a due state. Verify before claiming.
14. **Role gating.** SOP HQ has it (`Your role doesn't allow editing this feature`). Assume
    meetings do too, so the page should not imply every user can do everything.

---

## 8. Page status

Built, August 2026. Route [`/features/team-meetings`](../app/features/team-meetings/page.tsx),
page [`TeamMeetingsPage.tsx`](../components/TeamMeetingsPage.tsx), hero
[`TeamMeetingsHeroTour.tsx`](../components/TeamMeetingsHeroTour.tsx). The `Team Meetings` entry in
the Navbar feature menu now carries an `href`.

Headline: **Run the meeting, not the notes.** Colours: BLUE `#2C6BA6` for team meetings, matching
the nav entry and the home-page card in [`FeatureAiMeetings.tsx`](../components/FeatureAiMeetings.tsx),
and TEAL `#1C6B62` for 1on1s.

Sections shipped: the agenda that adds up, the live session, the 1on1 studio, continuity, ad hoc
meetings, then the Multi AI closer.

### The zoom-out beat

Four treatments were drawn up in
[`design/team-meetings-zoomout-options.html`](../design/team-meetings-zoomout-options.html) and
**option B, rack focus**, was chosen. The nav rail does not exist during Act 1 at all: it sits
behind an opaque content plate and is only revealed by the pull-back, already soft, after which
`Team Meetings` and `1on1s` pull into focus while the rest of the rail stays blurred.

Two implementation notes that are easy to get wrong:

- **Blur must be applied per nav row, never to the rail element.** A CSS filter on a parent
  rasterises its children along with it, so a child cannot un-blur itself back out of an ancestor's
  filter. Blurring the rail and trying to sharpen two items inside it silently does nothing.
- **The plate's travel is computed from the live stage width**, not hardcoded. Its left edge has to
  clear the rail while its right edge still fits the stage, and at `MIN_W` those two constraints
  leave about 12px of slack. See `plateShift()` in the hero.

Rejected, with reasons, in the options page: A (blur fires as a second event after the rail lands,
so it reads as two things happening), C (a shared card round the pair claims a grouping the real
app does not have), D (no blur, labels collapse to bars; the one to take if the hero is ever
recorded to video, since blur at this scale does not survive compression).

### Panel heights

All five section mockups are locked to `CARD_H = 460`, chosen from
[`design/team-meetings-panel-height-options.html`](../design/team-meetings-panel-height-options.html)
(option B, fixed height with the content filling it). Same approach as
ProjectsTasksPage's `CARD_H = 430`, just taller: Continuity is the tallest of the five and its
carry-over card is the argument of that section, so the height was raised to fit the card rather
than the card trimmed to fit the height.

Pattern: root is `flex flex-col` at `CARD_H`, bands are `min-h-0 flex-1`, rows inside a band spread
with `justify-between`. **`min-h-0` matters** — without it a flex child refuses to shrink below its
content height, the card overflows, and `overflow-hidden` eats the last row.

**The agenda card is drawn to scale.** Locking the panels to a shared height broke this mockup:
four short rows spread with `justify-between` left about 60px of dead air between each one. Options
were drawn up in
[`design/team-meetings-agenda-card-options.html`](../design/team-meetings-agenda-card-options.html)
and **option C, proportional timeboxes**, was chosen. Each step is a flex block weighted by its
minutes (`flex: 5 / 15 / 15 / 10`), so Tasks Review is three times the height of Opening because it
is three times as long, and a cumulative time rail runs up the left like a calendar column.

This is the one place where filling the height does real work rather than absorbing it: there is no
leftover space to distribute, because every pixel is allocated to a step. The footer sum changed
from "which is exactly the length you booked" to "and the blocks are drawn to scale", since the
arithmetic is now visible rather than asserted.

Two constraints that come with it:

- **The 5m block has no room for a note.** It lands at roughly 33px, enough for the label and the
  duration only. `NOTE_MIN` controls the cutoff. If a customer's agenda has several short steps,
  this layout starts to strain.
- **The rail and the blocks must share the same flex weights and the same gap**, or the ticks stop
  landing on their block's top edge. The closing `45:00` is pinned with `absolute bottom-0` rather
  than added as a fifth segment, which would make the rail taller than the blocks it labels.

**The live card is two columns.** Options in
[`design/team-meetings-live-card-options.html`](../design/team-meetings-live-card-options.html);
**option A** was chosen. A single column left roughly 180px of nothing at the bottom until the
meeting was nearly over, because the card was using half its width and all of its height. Splitting
it puts the agenda left and the captures right, so the vertical space they were competing for stops
existing.

The real test for this card is **step 0, not step 4** — the old version looked fine at the end and
broke at the start. Both columns therefore end in something permanent that does not depend on
progress: an elapsed bar under the agenda, and a `Task goes to Projects / Issue stays on the
meeting` footer under the captures. The scrubber also opens on step 2 so the first thing anyone
sees has work in it.

Constraints:

- **Capture text must stay under roughly 34 characters.** The right column is a little over half
  the card, so anything longer truncates.
- **Only two kinds, task and issue.** Those are the two the product actually shows. A third
  (decision, note) would be invented.
- **The steps are driven off `AGENDA`**, so labels, timeboxes, and cumulative times cannot drift
  from section 2.

Rejected: B (three bands, never empty but the fake note lines read as filler), C (a now-line
sweeping a proportional column, the best single image of the four, but section 2 is already a
proportional column and two stacked reads as one idea used twice), D (a Tasks/Issues board, best at
the end and worst at the start, and it implies a kanban the product does not have here).

**The ad hoc card is a full-height dialog.** Options in
[`design/team-meetings-adhoc-card-options.html`](../design/team-meetings-adhoc-card-options.html);
**option A** was chosen. Centring a short modal in the shared height left dead tint above and below
it, so the dialog now grows to the panel using only content the live one really has.

The dialog gained the parts the earlier mockup was missing: a people search, an email under every
name, a `Clear` action beside `Select all`, and a fade at the foot of the list. The attendee list is
the flexible band, taking whatever height is left, and it carries **six people, one more than fits**
on purpose: the last row is cut by the fade, so the directory reads as the whole company rather than
a four-person team. That is the section's first claim, that your whole directory is already there.

`PEOPLE` gained three entries (Ava Donnelly, Dana Whitfield, Tomas Bergman) for that reason, and
`DOMAIN` holds the neutral stand-in domain, matched to the `Northwind Group` org name in the hero's
nav rail.

Rejected: **B** (the dialog over a dimmed Meetings index; it matched the screenshot exactly and was
recommended, but built out it read as two washes of colour stacked, a dark scrim inside an
already-tinted green panel, and Lance turned it down on sight), C (the modal turning into a live
note editor, the most persuasive option and the least verified, since that editor has never been
seen; take it if the client sends a screenshot), D (a populated ad hoc history, which contradicts
the live account's `No ad hoc meetings yet`).

Continuity does not stretch either. It set the 460 number, so it already fits.

### Mobile

Below `sm` every card gets a different layout, and all five share a second height:
`CARD_CLS = "h-[360px] sm:h-[460px]"`. Written out in full rather than composed from `CARD_H`,
because Tailwind scans source for literal class names and never sees an interpolated one.

Options are in
[`design/team-meetings-agenda-mobile-options.html`](../design/team-meetings-agenda-mobile-options.html),
[`design/team-meetings-live-mobile-options.html`](../design/team-meetings-live-mobile-options.html),
and [`design/team-meetings-remaining-mobile-options.html`](../design/team-meetings-remaining-mobile-options.html).

| Card | Mobile treatment | Why |
| --- | --- | --- |
| Agenda | Plain list, tap to open one note | The proportional column cannot work at 360px: once blocks carry minimum heights so the 5m step stays tappable, the proportions flatten and the drawing stops being to scale, while the notes still clip mid-sentence. A list makes no claim it cannot keep. |
| Live session | Agenda collapses to a segmented bar; body is all capture | Two 165px columns truncated every captured item to `Send…`. The strip still carries what the rows did: done, running, left. |
| 1on1 studio | Settings list, three rows carrying the current value | Nine pills wrapped onto three ragged rows. The trade is that the alternatives stop being visible, so the section copy has to carry that instead. |
| Continuity | One card split by a `carries over` divider | Two cards plus an arrow plus a third card is three headers for one idea. Merging makes the carry read as continuous rather than a hop between objects. |
| Ad hoc | Same dialog, shorter, footer sentence dropped | It was built to fill 460px; on a phone there is no height to fill. The fade still says the directory keeps going. |

Also shortened on mobile: the agenda meta row (`Weekly · 45 min · 7 people`), the footer sum (equation
only), the live bar (two rows so `Complete` is not clipped), and the studio header buttons (icons
without labels).

**Not done, and deliberately so:**

- **The hero.** It scales down as one piece below 980px so it does not break, but at 360px the
  workspace renders at roughly 37% and the text inside is unreadable. Wants its own pass: either a
  simplified mobile cut of the tour, or a static frame with the animation kept for desktop.
- **The Multi AI closer.** [`MultiAiWired`](../components/MultiAiWired.tsx) is shared with the
  Scoreboard, Projects, and SOP HQ pages, so any mobile change there lands on four pages at once.

### What is invented, and why

A running **team** meeting has never been seen. The hero and the live-session section draw it as
the 1on1 session bar, which has been seen: pinned bar, timer against the chosen length,
pause/resume/complete. Same app, same session concept, so it should differ in detail rather than
in kind. Resolve [open question 3](#7-open-questions) and this can be trued up quickly.

Also invented: the agenda item names, which are generalised from the live account
(`Anchor Dashboard` became `Scoreboard Review` so it reads for any business and points at the
Metrics Scoreboard page), the meeting name `Leadership Team`, the captured task and issue, the
1on1 topics, and the `Quarterly review` flow label standing in for the branded original.

### Kept off the page deliberately

`12 Week Year`, `2-Day CEO`, and the meeting-cadence framework. The `quick pulse` and `deep dive`
flows, which the AI described and the UI does not have. Attaching a video link. Recurring 1on1
reminders. All of section 5c and the unverified half of section 5.

### Recommendation: one page, two halves

The client asked for both, and the product keeps them apart. Building one page still works, because
the two halves share a spine:

**Both are a timeboxed agenda you step through, in a live session, that captures what was decided
and carries the rest forward.** Team meetings do it for a group against the company's tasks and
numbers. 1on1s do it for two people against one person's growth and commitments.

Suggested structure:

1. **Hero**, the live session. Pinned bar, running timer against the chosen length, agenda items
   getting checked off. Animate the 1on1 because it is the only one we have seen, and swap in the
   team meeting later if open question 3 confirms the same treatment.
2. **The team half.** Recurring meetings, the four step agenda whose timeboxes sum to the stated
   length, and the pull from Projects and Scoreboards.
3. **The 1on1 half.** The studio: pick a person, set length, type, and flow, and a shared topic
   list both people write before the meeting starts.
4. **Continuity.** The strongest section and the one with the most evidence. Unchecked topics carry
   to the next meeting, tasks carry from your last 1on1, and `commitments` stay searchable forever.
5. **Ad hoc capture.** The lightweight closer. Name it, pick who is in the room, take notes.

Two arguments carry the page, and both are grounded in confirmed UI:

- **Integration.** Plenty of tools take meeting notes. Far fewer step you through an agenda that
  reads from your live task board and scoreboard.
- **Continuity.** Stated three times over in the 1on1 UI. The conversation never restarts from zero.

Avoid on the page until verified: `quick pulse` and `deep dive` flows (do not exist), attaching a
video link, recurring 1on1 reminders, and anything from the 2-Day CEO framework by name.
