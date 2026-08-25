# Org Chart: how the real product works

Reference notes for the `/features/org-chart` marketing page. Sources, August 2026:

1. Six screenshots of the live app inside the Rise Up Kings account: the chart collapsed, the
   "What are you adding?" chooser, the Add team member modal, the New Role modal, the chart fully
   expanded to three levels, and the same chart with DISC switched on.
2. The client's brief on what the page must and must not show.
3. The product's help-centre description of the Org Chart, relayed through Multi AI.

House rules: **no em dashes** in site copy. Quoted UI strings below are verbatim, so several carry
the product's own em dashes. Do not copy that punctuation onto the page.

---

## 1. The client's brief, and the one instruction that shapes the page

Verbatim:

> (Show a full view of an org chart, show the list view, show DISC being turned on to see DISC on
> profiles, don't show clicking on a person and seeing the full detail, that is too much info)

Three shows and one **do not**. The do-not is the useful one: **no person-detail view anywhere on
this page.** The argument is the shape of the org, not any individual's record. Every mockup stops
at the card.

**Replaces ninety.io**, per the client. Artwork is already at `public/replaces-ninety.png`, shared
with the Metrics Scoreboard and Team Meetings pages.

---

## 2. What the screenshots confirm

### The page chrome

Heading `Org Chart`, subtitle **`Drag roles to reorganize. Hover to see outcomes and add child
roles.`** Two count chips underneath:

- `29 of 58 Team Members` with `(29 FT & 0 PT)` beside it
- `25 Contractors`

Top right, in order: **`+ New User/Role`**, **`Show DISC`**, a **chart / list view toggle** (two
icons, chart active), and a **`Current` / `Future`** toggle with Current selected.

Second row: a search field placeholdered `Search people, roles, departm...`, **`Expand All`**, and
zoom controls reading `100%` with minus, plus, and a fit-to-screen button.

The `Ask Multi AI` pill sits bottom right, as on every screen.

### A role card

Every card carries, top to bottom:

1. **The role title**, e.g. `CEO`, `Operations Manager`, `COO`, `CTO / Technology`
2. **The person in it**, avatar and name, e.g. `Skylar Lewis`
3. **A department chip**, colour-coded with its own glyph (`Operations`, `Technology`, `Marketing`,
   `Events`, `Programs`, `Sales`, `Accounting`), or **`+ Add seat department`** where none is set
4. **`[Name]'s Annual Outcomes (N)`** with a target glyph and a caret, where the seat has any
5. **`N direct reports`** with a people glyph

Cards have expand and collapse chevrons hanging off them, and the root card carries an orange left
border.

**Vacant seats are visible and normal.** In the expanded screenshot, `RUK Ministries Departm...`,
`SALES DEPARTMENT`, and one other show a grey avatar and the *role name where the person's name
would be*. A seat exists whether or not somebody is in it, and it still shows its direct reports.
This is worth a section of its own on the page.

### `+ New User/Role` opens a chooser

> **What are you adding?**
> Pick a starting point &mdash; you can rearrange later.
>
> **New User + Role**
> Bring a teammate in and place them on the chart. Pick who they report to &mdash; you can invite by
> email or add their account directly.
>
> **New role**
> Add a seat to the chart &mdash; assignable to a teammate now or later. Pick where it sits when you
> create it.

That split is the whole model in two sentences: **a role is a seat, a user is a person, and the two
are joined rather than the same thing.**

### `Add team member`

> Fill in their info, then choose how to get them into the system at the bottom.

Fields: `First name` *, `Last name`, `Email` *, `Title` *, `Mobile number`, `Department` (default
`No department`, with `Manage the list in Settings.`), **`Reports To`** * with
`Where this new seat sits on the org chart.`, `Birthday`, `Anniversary`, `Permission role` with a
`Compare roles` link and a default of `Team Member — Restricted to own items by default.`, then a
`Temporary password (leave blank to auto-generate)`.

Three toggles, and these are more interesting than the fields:

- **`Company Admin`**, off by default:
  > Grants company settings, team management, billing, API keys, the audit log, editing the Org
  > Chart, and visibility of every project and form in the company. Does not add them to the
  > Leadership Team, so goals and leadership meetings still follow the role.
- **`Module Access`**: `One Page Plan Access?`, on
- **`Multi AI Coach/Assistant`**: `Allow this user to use Multi`, on:
  > When off, Multi is hidden from their sidebar and the chat is blocked. You can change this any
  > time from Team settings.

**The admin note is the quotable one.** Being a Company Admin does *not* put you on the Leadership
Team, because goals and leadership meetings follow the **role**, not the permission. That is a real
and unusual design decision and it belongs on the page.

### `New Role`

`Role Title` (placeholder `e.g. Sales Manager`), `Reports To` defaulting to `None (top-level)` with
the helper **`61 roles in this org chart.`**, `Assign To` defaulting to **`Unassigned`**,
`Description` (`Brief role description...`), and **`Employment Type`** as four buttons:
**`Full-Time`**, **`Part-Time`**, **`FT Contractor`**, **`PT Contractor`**. Then `Create Role`.

That employment-type split explains the two count chips at the top of the page: team members are
counted with an FT/PT breakdown, and contractors are counted separately.

### DISC on

Pressing `Show DISC` fills the button orange and adds a **legend across the top**:

| Letter | Label | Colour |
| --- | --- | --- |
| `D` | `Dominance` | red |
| `I` | `Influence` | amber |
| `S` | `Steadiness` | green |
| `C` | `Compliance` | blue |
| `—` | `Not assessed` | grey |

Each person then carries a **two-letter badge beside their name**, e.g. `I/D`, `S/C`, `I/S`, tinted
by the primary letter. **People who have not taken it show a grey dash**, which is a genuinely good
detail: the overlay shows you your coverage gap as well as your team's styles.

**Vacant seats get no badge at all**, because a seat has no personality.

---

## 3. What the help centre adds

Relayed through Multi AI, so product framing rather than screenshot:

- Map reporting relationships, so the chain of command is explicit
- One accountable person per seat
- Departments, created and changed in Settings
- **Track 1-on-1 cadence**, so you can see who is having regular check-ins and who is overdue
- **Role-level FY scorecard goals**, so you can see what success looks like for that seat
- Everyone can see the whole structure

Two of these need care. See section 4.

---

## 4. The gaps

**1. The list view is not screenshotted.** The client explicitly asked for it and the toggle for it
is visible in the top right of every chart screenshot, but nobody has opened it. The page therefore
renders a list of **exactly the data the cards already show**: role, person, department, who they
report to, direct-report count, employment type, and the DISC badge. That is an inference about
*layout*, not about capability, which is why it was judged safe to build. **Its real columns and
sort order are unknown. Get a screenshot before this page ships.**

**2. `Current` / `Future` has never been switched to Future.** The toggle is plainly there in every
screenshot. What Future actually does, whether it is scenario planning, succession, or a hiring
plan, is unknown. The page mentions that the toggle exists and says nothing about what is behind it.
**This is potentially the strongest thing on the whole feature and we cannot describe it.** One
screenshot would change that.

**3. 1-on-1 cadence tracking is claimed by the help centre and appears nowhere in the UI we have.**
Not on a card, not in a modal, not in the chrome. The page does not claim it.

**4. "FY scorecard goals" versus "Annual Outcomes."** The help centre calls them scorecard goals;
the cards say `[Name]'s Annual Outcomes (N)`. The page uses the product's own words, **Annual
Outcomes**, and treats it as the same thing, because the count on the card behaves like the goal
count on the One Page Plan.

**5. The small `Ⓓc` badge** at the top right of two cards in the DISC-off screenshot is unexplained.
It looks DISC-related but appears on only two of eight cards with DISC switched off. Not claimed.

**6. Drag to reorganise** is stated in the product's own subtitle, so it is claimed, but no
screenshot shows a drag in progress and the page does not animate one.

---

## 5. The invented data

The screenshots show Rise Up Kings's real org: real staff names, real reporting lines, real
headcount. **None of that goes on a public marketing page.**

So the mockups use the fictional company the other feature pages already established, **Ridgeline
Services**, the same one on the Team Accountability page. The cast is the one already in use across
Agreements, Checklists, Forms, and Team Accountability, extended with the extra seats an org chart
needs:

| Seat | Person | Department |
| --- | --- | --- |
| CEO | Skylar Lewis | Operations |
| COO | Dana Whitfield | Operations |
| VP Sales | Jordan Rivera | Sales |
| Marketing Lead | Priya Nair | Marketing |
| Operations Manager | Marcus Hale | Operations |
| Technology Lead | Kath Nakamura | Technology |
| Field Safety Lead | **vacant** | Operations |
| Account Executive | Sam Okafor | Sales |
| Second Market Manager | **vacant** | Sales |
| Content Lead | Nina Petrova | Marketing |

Two vacant seats on purpose. They carry the argument in section 3 of the page: a seat exists before
somebody is in it, and an empty one is a hiring plan rather than a gap nobody noticed.

DISC spread is deliberately mixed, and **two people are deliberately unassessed** so the grey dash
and the coverage-gap argument both have something to point at.

Counts on the chrome follow the real page's shape: `18 of 24 Team Members`, `(16 FT & 2 PT)`, and
`6 Contractors`.

---

## 6. Page status

- Route `/features/org-chart`, nav label `Org Chart`, tile colour `#3F7A6B` from the navbar.
- **Replaces ninety.io.** Logo already present.
- **No person-detail view anywhere**, per the client's explicit instruction.
- The DISC overlay cross-links to the **DISC Assessments** feature, which does not have a page yet.
  When it ships, section 5 of this page should link to it.
- The `Annual Outcomes` on each card cross-link to **Team Accountability**, whose annual goals are
  the same objects. Both pages use Ridgeline Services so the two can be read together.
- Not claimed anywhere, all real and available to a future revision: the permission-role system and
  its `Compare roles` screen, `Birthday` and `Anniversary` fields, the temporary-password flow,
  API keys and the audit log, zoom and fit-to-screen, and search across people, roles, and
  departments.
