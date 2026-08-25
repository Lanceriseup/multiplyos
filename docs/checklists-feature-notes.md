# Checklists: how the real product works

Reference notes for the `/features/checklists` marketing page. Everything here comes from
screenshots of the live app inside a customer account (Rise Up Kings), reviewed August 2026, plus
the product's own help-centre description relayed through Multi AI.

Two standing rules for anything built off this file:

- **Generalise the content.** The live library is almost entirely one ministry's vehicle fleet.
  The feature page has to read as any business. See [Generalising pass](#7-generalising-pass).
- **No em dashes** in site copy, per house style. Quoted UI strings below are verbatim, so several
  carry the product's own em dashes. Do not copy that punctuation onto the page.

---

## 1. The brief, and the positioning problem it solves

The client's brief:

> Checklists (Talk about automating and overseeing processes using checklists, talking about
> creating consistent quality with checklists, then show checklist features)

Three asks, in order: **automate and oversee**, **consistent quality**, then **the features**.

### Checklists is not Forms

The client's replaces list puts Jotform and Google Forms against *both* pages, which would make
them argue the same thing. The product settles it. The line is:

| | Forms | Checklists |
| --- | --- | --- |
| Who fills it in | anyone, often outside the company | your own team |
| How often | once per person | again, on a schedule |
| What you want back | their answer | proof the work was done |
| What it produces | a response | a **signed run**, kept forever |

So Forms collects answers. Checklists proves recurring work happened, to a standard, by a named
person, at a known time. That is an accountability story, not a data-collection one, and it is what
the page should argue.

The product's own subtitle says it in one line:

> Repeatable process checklists your team runs on a schedule &mdash; with photos, sign-offs, and a
> permanent history of every run.

### The help centre's framing

Worth reusing, because it is the product team's own words:

- **Repeatability** &mdash; any routine done more than once stops living in somebody's head.
- **Accountability** &mdash; each run is signed off, giving a timestamped, auditable record of who
  did what and when.
- **Consistency** &mdash; a new hire executes it the same way a veteran does. No more "well, I do
  it differently".

It also frames Checklists as the bridge between "this person knows how to do it" and "anyone can
do it consistently", which is what lets an owner step away.

**One caveat to respect:** the feature requires the `process_checklists` module to be switched on
for the workspace. The page must not imply it is on for everybody by default.

---

## 2. The library

Header card: blue clipboard tile, `Checklists`, then the subtitle above. Four stat chips:
`19 checklists`, `21 runs`, `14 recurring`, `2 due this week`.

Two buttons top right: `Permissions` (outline, padlock) and `+ New Checklist` (dark, primary).

**Tabs:** `All Checklists`, `Recurring` (14), `One-off` (5), `Archived` (2).

**Controls:** `Search checklists...`, a sort select defaulting to `Last activity`, a list/grid toggle.

**Sidebar:** `All Checklists`, `My Checklists`, `Department`, `Shared with Me`, each with a count,
then `New folder`.

**A row carries:** clipboard tile, title, `Created by <name> · Updated <date>`, then

- a cadence chip: `Repeats Weekly`, `Repeats Monthly`, or `One-Off`
- an `Inherits` chip, meaning it takes its permissions from its parent
- a due state: `Due in 7d`, `Due in 3d`, `Due in 20d`, `Last run Aug 10, 2026`, or `Never run`
- a **`Run`** action, right there in the list
- a `...` menu

`Run` sitting on every row is the detail to notice. The library is not a filing cabinet, it is a
worklist: what is due, what has never been run, and a one-click way to start.

---

## 3. The editor

**Top bar:** back arrow, the name, `N items · N runs` underneath, then `Archive`, `Share`,
`Permissions`, and `Run Checklist` (disabled until there is at least one item).

**Left rail, three stages:**

| Stage | Sub-label |
| --- | --- |
| `Build` | `Items & sections` |
| `Settings` | `Reminders & notifications` |
| `History` | `N completed runs` |

Three stages, not Forms' five. There are no integrations and no public link, which is consistent
with this being an internal tool.

### The palette

Headed `+ ADD TO CHECKLIST`. Five item types, each with its own one-line description:

| Type | Description |
| --- | --- |
| `Check item` | `Tick when done` |
| `Pass / Fail` | `Pass, fail, or N/A` |
| `Text answer` | `Short written answer` |
| `Number` | `A reading or count` |
| `Section header` | `Group items (a pause point)` |

Note `Section header` is described as **a pause point**, not just a grouping.

### The name and description

`Checklist name`, then `Description (optional)` whose placeholder is a genuinely good question:

> What process does this checklist protect, and when should it be run?

### The empty state, which is the best copy in the product

> No items yet. Add the killer items &mdash; the steps that get skipped, not every step that
> exists. Aim for 5&ndash;9 per section.

That is an opinion baked into the product, and it is worth quoting on the page almost verbatim. It
is the difference between a checklist somebody runs and a checklist somebody resents.

### Per-item controls

Every item row carries a drag handle, its type icon, the label, then three chips and three actions:

- **`Required`** &mdash; toggles on, and the run cannot be completed without it
- **`Photo`** &mdash; attach a picture as evidence
- **`Note`** &mdash; add context
- move up, move down, delete
- **`+ Sub-item`** underneath, so items nest one level

---

## 4. Settings

**Reminders**

> Nudge the responsible people to run this checklist. Presets send at 9:00 AM in your company's
> timezone; a custom reminder sends at the exact time you pick.

A single `Cadence` select, defaulting to `No reminder`.

**When a checklist is completed**

> Notify people every time a run is signed off &mdash; with the results and a link to the full record.

- `In-app notification` with an `On` state
- `Email` with an `On` state
- `Notify team members`, `Type a name to add people...`
- `Email people outside your organization`, `name@company.com`

That last field matters: a completed run can be sent to somebody who does not have a login, which
is how an inspection record reaches an insurer or a franchisor.

---

## 5. Running one, and the sign-off

`Run Checklist` opens a focused runner, not the editor.

**Header:** the name, `Covers <date>` underneath, a `N/N done` counter and a close `✕`, with a
progress bar directly beneath.

**Items** render as cards. A finished one turns green-tinted with a filled green tick. Required
items carry a red `*`. Each type behaves as named:

- Check item: a tick
- Pass / Fail: three buttons, `Pass` / `Fail` / `N/A`, the chosen one highlighted
- Text answer: `Your answer...`
- Number: a numeric field defaulting to `0`

**The sign-off card**, which is the whole point of the feature:

> **Sign off**
> Type your full name (<their name>) to certify this checklist was completed as recorded. Your
> name, the time, and your device are stored with the permanent record.

Then a field holding their typed name.

**Footer:** `All required items are done.` and a `Complete Checklist` button.

Three things worth claiming from this screen and claimed nowhere yet: the run **covers a specific
date**, the certification is **typed by name rather than a tickbox**, and **the device is recorded**
alongside the name and time.

---

## 6. What the page should argue

In the client's order:

1. **Automate** &mdash; recurring cadence, reminders at 9am in your timezone, due-in counters, and
   a `Run` button on the row so the routine starts itself.
2. **Oversee** &mdash; the library as a worklist: 14 recurring, 2 due this week, `Never run` on the
   ones nobody has touched, and a completion notice with the results attached.
3. **Consistent quality** &mdash; required items that block completion, Pass / Fail / N/A instead
   of a vague tick, a photo as evidence, and a signed record so the standard is provable.
4. **Then the features** &mdash; the five item types, sub-items, sections as pause points,
   permissions that inherit, archiving.

---

## 7. Generalising pass

The live library is one ministry's vehicle fleet: twelve of the nineteen checklists are inspections
of named vans and SUVs, plus a sand-dunes trip. Vehicle inspection is a good universal example, but
twelve of them reads as one niche, so the page uses a spread.

| Live | Page |
| --- | --- |
| Sprinter #2&ndash;#6 Inspection, Cadillac Escalade / Ford Escape / Dodge Ram / Chevy Tahoe / Silverado / Ford Expedition Inspection | one `Van 3 Safety Inspection`, and the rest replaced by routines from other trades |
| Request for Leave - Day Off | kept, already generic |
| Review Monthly Financial Payouts | Monthly Payout Review |
| 08-28-2026 - K5 Trip - Little Sahara Sand Dunes, Wynoka, Okla... | Offsite Trip Prep |
| Jax Wainright, Rod Hazzard, Jessica Craycraft, Carolyn Johnson | Skylar Lewis, Jordan Rivera, Priya Nair, Marcus Hale, Kath Nakamura |

Added for spread, all plausible for a small business: `Closing Checklist`, `New Client Onboarding`,
`Weekly Leadership Prep`, `Site Safety Walk`.

Dashboard mockups across the site use **Skylar Lewis (SL)** as the owner persona.

---

## 8. Page status

- **Replaces Jotform and Google Forms**, per the client. Both logos already exist in `public/`, so
  act zero needed no new artwork.
- Nothing on the page claims the `process_checklists` module gate, and it should not imply the
  feature is on for every workspace by default.
- Not yet claimed anywhere, all real: **sub-items**, **sections as pause points**, `Inherits`
  permissions, `Archived`, emailing a completed run to somebody outside the company, and the fact
  that a run **covers a named date** rather than just a timestamp.
- The empty-state copy about "the killer items, not every step that exists" is the strongest line
  in the product. It is quoted on the page and should survive any copy edit.
