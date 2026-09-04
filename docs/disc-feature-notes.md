# DISC Assessments: how the real product works

Reference notes for the `/features/disc-assessments` marketing page. Sources, August 2026:

1. Seven screenshots, pulled from a screen recording, of the live app inside the Rise Up Kings
   account: the DISC Personality Assessments page, the Train Me on DISC modal, the Example DISC
   Report viewer, the Team Assessment Status list, the Team Members table, and two views of the Edit
   team member modal including the DISC profile panel.
2. The client's brief.
3. The product's help-centre description, relayed through Multi AI.

House rules: **no em dashes** in site copy. Quoted UI strings below are verbatim, so several carry
the product's own em dashes. Do not copy that punctuation onto the page.

---

## 1. The client's brief

> (Show the main DISC page, show a user and how you can see their DISC profile, talk about using
> personality assessments for your team and having it built in)

A follow-up brief added the org chart, and then Hiring:

> (on the disc assessment page video animation lets add an additional animation that shows that the
> disc assessment can be sent in the Hiring tab [...] after showing the org chart, and how disc works
> on that page then switch to the hire page choose an applicant then theres going to be a scroll
> animation that goes to the send disc assessment)

Both are in the hero tour, as beats 5-6 and 7-9. Section 8 has the shot list.

**Replaces nothing**, per the client. So this is the second feature page with **no `ReplacesStrip`
and no `ActZero` opening beat**, after CFO Analytics. Do not add one.

---

## 2. The one sentence that positions the page

The product's own subtitle, and it names the three use cases so the page does not have to invent
them:

> See who has taken DISC, send assessments, and put behavioral insights to work in **hiring**,
> **1-on-1s**, and **team communication**.

That is the whole argument. Not "we have a personality test", but "the results are already sitting in
the record of the person you are about to interview, coach, or delegate to".

---

## 3. What the screenshots confirm

### Where it lives

Two tabs at the top of the same screen: **`Team Members`** and **`DISC Personality Assessments`**.
The sidebar shows it nested under `Team` in Settings, as `DISC Assessments`. So DISC is not a
separate product area, it is a second view of your team list. That matters and the page says so.

Top right: **`Send Outside Organization`**. **You can assess somebody who does not work for you.**
That is the hiring use case, and it is the least obvious of the three.

### The DISC coach offer

A card headed `Need help utilizing DISC in your organization?`

> A DISC coach will show you how DISC works and how to best utilize it &mdash; reading reports,
> coaching your team, and applying styles day to day. Not sure what a report looks like? View a real
> example first.

with **`Train Me on DISC`** and **`View Example Report`**. The training modal collects
`What are you looking for?` and says `We'll reach out to [email] to schedule time with a DISC coach.`

**This is a human being, not a chatbot.** Worth saying plainly, because every other AI-adjacent
feature on this site is software.

### The assessment itself is TTI

The Example DISC Report viewer shows a real PDF: **TTI SUCCESS INSIGHTS**, **`TTI Talent Insights®`**,
edition `Management-Staff`, personalised with a name, a role line, and a date. A person's profile
panel elsewhere cites `TTI Executive (R4)`.

**So Multiply OS is not writing its own personality test.** It administers a real, third-party,
commercially recognised instrument. That is a credibility claim worth making and an accuracy claim
worth not overstating: the page names TTI, does not describe TTI's methodology, and does not claim
any validation study.

> **Trademark note.** `TTI Talent Insights®` carries a registered mark in the product's own PDF.
> The page names the instrument once, factually, in the context of what you receive. It does not use
> TTI branding, logos, or styling.

### Assessment credits

A whole card, headed `COMPANY CREDIT POOL`, and the mechanic is genuinely reassuring:

> Sending an assessment holds 1 credit. Completion uses it; cancelling the assessment or reaching 30
> days returns it to your pool.

Two counters, `AVAILABLE` and `HELD BY PENDING`. Then a four-step explainer:

| Step | Copy |
| --- | --- |
| 1 Buy | `Credits enter your shared company pool.` |
| 2 Send | `1 credit is held while the link is open.` |
| 3 Resolve | `They complete, you cancel, or 30 days pass.` |
| 4 Credit updates | `Complete = used` / `Cancel + expire = returned` |

Plus `No second charge when someone completes` and **`Purchased credits never expire`**. Packs of 1,
5, 10, 25, or a custom quantity, `Secure checkout powered by Stripe`.

> **Pricing is deliberately NOT on the page.** The screenshots show a per-credit price and four pack
> totals. Same rule as the `Included with Multiply Scale Bundle` line on CFO Analytics: pricing lives
> on the pricing page and may differ by plan. The page describes the *mechanic*, because "you do not
> lose the credit if they never finish" is the reassuring part, not the number.

### Team Assessment Status

Three counts across the top: **`Completed`**, **`Pending`**, **`Not Completed`**, with a
**`Show contractors`** toggle and a `Search people` field.

`Pending DISC Assessments` has its own section with the empty state
`Nothing is awaiting completion right now.`

`Completed DISC Assessments` lists each person with:

- avatar and name
- a **two-letter DISC badge**, tinted by the primary letter
- sometimes a **named style**, e.g. `Implementing Conductor`, `Promoting Analyzer (Across)`
- `Completed [date]`
- **`View Report`**, a download button, and **`Replace`**
- contractors carry a `Contractor` chip

### A person's DISC profile, inside their record

The best screenshot of the set. Scrolled to the bottom of `Edit team member`, there is an expandable
panel headed with their badge and **`[Name]'s DISC Profile`**, containing **four dimensions scored
0 to 100**, each with a bar and a descriptor:

| Dimension | Score in the screenshot | Descriptor, verbatim |
| --- | --- | --- |
| **Dominance** | 28 | `Direct, decisive, results-focused` |
| **Influence** | 58 | `Optimistic, people-focused, persuasive` |
| **Steadiness** | 74 | `Patient, predictable, consistent` |
| **Compliance** | 61 | `Analytical, accurate, systematic` |

Then **`View full report`** with `TTI Executive (R4) · Completed 9/15/2025`, and three actions:

- **`Send DISC invite`**
- **`Allow retake`**
- **`REPLACE THIS DISC`**: `Overwrite the current profile with a report taken outside Multiply OS.`
  **`Does not use a credit.`**

That last one is a real answer to "we already did DISC two years ago with somebody else".

### The Team Members table

Columns: `MEMBER` (name, title, department chip), `EMAIL`, `ROLE`, `PERMISSION`, **`DISC`**,
`ACTIONS`. The DISC column carries the badge, or a grey dash for anybody who has not taken it.

**DISC is a column in the team table, not a separate report.** With the Org Chart overlay, that is
two places it shows up without being asked for.

---

## 4. What the help centre adds

Three core things, and one dependency:

1. Send assessments to team members from inside the system
2. Track who has finished and who has not
3. Read results in-platform, for decisions about communication, delegation, role fit, and team
   dynamics

And: **it requires the DISC module to be switched on**, by an admin, in settings. The page mentions
that it is a module rather than pretending it is always on.

---

## 5. The gaps

**1. Nobody has taken the assessment on camera.** What the person receiving the invite actually sees,
how long it takes, how many questions, whether it is mobile-friendly: all unknown. **The page never
describes the taking experience**, only the sending and the reading.

**2. The full report is one page deep.** The Example DISC Report viewer shows the cover and the top
of a bar chart. What the remaining pages contain is unknown. The page says a full behavioural report
is produced and downloadable, and describes nothing inside it.

**3. Named styles are illustrative on the page.** `Implementing Conductor` and
`Promoting Analyzer (Across)` are genuine TTI classifications visible in the screenshots, but the
mapping from a given score set to a style name is TTI's, not ours. The mockups pair conservative,
real TTI style names with score sets that plausibly support them, and **the style name is shown
sparingly for that reason**. If accuracy matters here, get the real names off real reports.

**4. `Send Outside Organization` was never opened.** It exists as a button. Whether it collects an
email, generates a link, or ties to the Hiring module is unknown. The page says you can assess people
outside the company and stops.

**5. Multiply Hiring** appears as a separate module in the Edit team member modal, with a
`Assign as Hiring Manager` toggle covering `positions, applicants, interviews, references, and
offers`. **This is a whole feature nobody has mentioned and it is not one of the twelve in the nav.**
Flagged for Lance. Not claimed on this page beyond the fact that DISC can be sent outside the
organisation.

**6. `View MOS Insights`** appears as a link in the Edit team member modal. Unexplained. Not claimed.

---

## 6. The invented data

The screenshots are Rise Up Kings's real team: real names, real emails, real completion dates, and
real behavioural profiles. **None of that goes on a public marketing page.** Behavioural assessment
results are about as personal as workplace data gets.

The mockups use the fictional company the other pages established, **Ridgeline Services**, and the
profiles match the DISC badges already published on the **Org Chart** page, so the two corroborate
each other:

| Person | Badge | D | I | S | C | Style shown |
| --- | --- | --- | --- | --- | --- | --- |
| Skylar Lewis | I/D | 68 | 81 | 34 | 46 | Persuader |
| Dana Whitfield | C/S | 38 | 41 | 66 | 79 | Coordinator |
| Marcus Hale | S/C | 31 | 42 | 78 | 66 | Specialist |
| Kath Nakamura | C/D | 61 | 33 | 40 | 84 | Analyzer |
| Jordan Rivera | I/D | 71 | 86 | 29 | 38 | Persuader |
| Priya Nair | I/S | 44 | 77 | 63 | 41 | Promoter |
| Nina Petrova | S/I | 32 | 64 | 76 | 48 | Relater |
| Sam Okafor | not assessed | | | | | |
| Theo Barnes | not assessed | | | | | |

In every row the two highest scores are the two badge letters, in order. A reader who checks will
find it holds.

Two people are deliberately unassessed, the same two the Org Chart page shows as a grey dash, so the
"send an invite" beat in the hero tour has somebody real to send to.

The **hiring applicants are invented too**, and for a sharper version of the same reason. The real
board is a live pipeline: a candidate's name, inbox and phone number are not ours to publish
anywhere, least of all on the page selling the tool that holds them. The mockup uses seven fictional
people on `@example.com`, and no phone numbers at all.

The **open positions and their counts are real** — `Bookkeeper VA 0`, `Sales Setter 1`, `Financial
Controller 2`, `Inventory Manager 6`, `Senior Developer & Technical Project Manager 39`. Those are
facts about the company's hiring rather than about any person, so they carry across as they are.

Credit counters in the mockups run `10 available / 0 held`, moving to `9 / 1` the moment an invite is
sent. That is the mechanic doing exactly what the product says it does.

The pool then **carries across the whole tour instead of resetting per beat**. Beat 2 spends one on
Sam Okafor, so the hiring card in beat 9 opens on **9 available** and goes to **8** when the
candidate's assessment goes out. One company pool, employees and candidates alike, which is the only
claim neither half of the tour can make on its own.

---

## 7. Page status

- Route `/features/disc-assessments`, nav label `DISC Assessments`, tile colour `#8A3F6D` from the
  navbar.
- **Replaces nothing**, so no Replaces strip and no crossed-out opening beat.
- **This is the twelfth and final feature page.** Every tile in the nav now has a destination.
- Cross-links: the **Org Chart** page already shows the DISC overlay and its legend, and the
  **AI Coach** page claims Multi AI can read DISC profiles to help you pitch something to somebody.
  Both are true and both are backed by these screenshots.
- The four dimension colours match the Org Chart legend exactly: D red, I amber, S green, C blue,
  with grey for not assessed.
- Not claimed anywhere, all real: pricing and packs, Stripe checkout, the `Show contractors` toggle,
  `Allow retake`, downloading an individual report, and the module dependency being an admin setting.
- The `Multiply Hiring` module **is now claimed**, by beats 7-9 of the hero tour and nowhere else.
  The page copy still does not mention it. If Hiring ever gets its own feature page, both tours will
  be drawing the same DISC card and they must not be allowed to drift.

---

## 8. The hero tour

Nine beats, one loop, in `components/DiscHeroTour.tsx`.

| # | Beat | What it has to prove |
| --- | --- | --- |
| 1 | The assessments page | Who has taken it, who has not, credits available |
| 2 | Send an invite | Pending goes up and a credit moves to held |
| 3 | The Team Members tab | DISC is a column here, not a separate report |
| 4 | Open somebody | Four dimensions, scored, inside their own record |
| 5 | Zoom out to the rail | Org Chart is the area next door |
| 6 | Show DISC | Badges land on a chart the viewer has already read |
| 7 | Zoom out again | Hiring is an area too, reached the same way |
| 8 | Open an applicant | DISC sits inside a live hiring record |
| 9 | Scroll to the card | And you send it from there, off the same pool |

Two rules the tour keeps, both worth not breaking:

**One gesture for changing area.** Beats 5 and 7 are the same move — the plate pulls back to `ZOOM`
and shifts right until its left edge clears the rail, every rail row sits soft, and only the pair
that matters racks into focus once the pull-back has settled. It is lifted from
`TeamMeetingsHeroTour` and reused rather than reinvented, so a viewer learns to read it once. Beat 5
sharpens Team + Org Chart, beat 7 sharpens Org Chart + Hiring. Always a **pair**: the claim is "this
area, and the one beside it", never "go here".

**Beat 9 is a scroll, not a click.** The DISC card is deliberately below the fold of the candidate's
record, because the point is that the assessment lives inside the hiring record you were already
working in — you get to it by scrolling that record, not by leaving for another part of the product.
Opening a view with the card already on screen would make a weaker claim, and an easier one.

Only the **left detail rail** travels, though the real record scrolls whole. At 500px of hero,
scrolling everything drags the funnel panel off with it and leaves half the frame empty on the beat
that matters most. Moving one column says the same thing and gives the eye exactly one thing to
follow. `APPL_SCROLL` is tuned so the card lands mid-panel rather than against the bottom edge.
