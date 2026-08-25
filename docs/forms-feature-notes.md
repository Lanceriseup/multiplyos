# Forms: how the real product works

Reference notes for the `/features/forms` marketing page. Everything here comes from
screenshots of the live app inside a customer account (Rise Up Kings), reviewed August 2026.
The marketing page mockups are hand-built rather than screenshotted, so this file is the
source of truth for what those mockups are allowed to claim.

Two standing rules for anything built off this file:

- **Generalise the content.** The live library is full of Rise Up Kings names. The feature
  page has to read as any business. See [Generalising pass](#8-generalising-pass) at the bottom.
- **No em dashes** in site copy, per house style. Quoted UI strings below are verbatim, so many
  of them carry the product's own em dashes. Do not copy that punctuation onto the page.

---

## 1. The client's brief

> Forms (Show the form list, show creating a form, show a form that has been created, show how
> you can create a QR code, show how you can have a form add a task, show how form can add a
> response to Google Sheets)

Six asks. Where each one lands on the page:

| Ask | Where |
| --- | --- |
| The form list | Hero tour, opening beat |
| Creating a form | Hero tour, the Create modal and the builder |
| A form that has been created | Hero tour, Preview then the published public form |
| A QR code | Hero tour close, and the Share section |
| A form adding a task | Integrations section |
| A response going to Google Sheets | Integrations section |

The last two are the ones worth leading on. A standalone form tool cannot open a task on your
project board or push a number onto your scoreboard, because it does not own either one. That is
the whole argument of this page.

---

## 2. The form library

Header card: orange document tile, `Forms`, subtitle
`Build and share forms — feedback surveys, client intake, and employee surveys.`
Three stat chips: `26 forms`, `294 responses`, `25 published`. A `+ New form` button sits top right.

**Tabs:** `All Forms`, `Customer Surveys`, `Employee Surveys` (with a count badge). These are
customer-defined groupings, not fixed.

**Controls row:** a `Search forms...` field, a sort select defaulting to `Last activity`, and a
list/grid view toggle.

**Left sidebar:**

- `All Forms`
- `My Forms`, `Department Forms`, `Shared with Me`, each with a count
- Folders, each with a count. One live example carries a padlock, so **folders can be locked**.
- `New folder`
- `Trash`, with a count

**A form row carries:** document tile, title, `Created by <name> · Updated <date>`, a status pill
(`Published`, green), a visibility chip (`Company`, `Department`, or `Company · Shared`), a
response count (`21 responses`, `108 responses`, `1 response`), and a `...` menu.

An `Ask Multi AI` pill floats bottom right, as on every screen in the product.

---

## 3. Creating a form

`+ New form` opens one modal, not a sequence.

> **Create a new form**
> Name it, pick how to start, and choose who can see it. Everything can be changed later.

- **FORM NAME**, a single field, placeholder `e.g. Client intake`
- **HOW DO YOU WANT TO START?** three cards: `Start from blank` (default), `Generate with AI`,
  `Use a template`
- **WHO CAN SEE IT** three cards: `Private` (`You can add people later`), `Department`,
  `Company` (default)
- Footer: `Name your form to continue.` and `Cancel`. The create action stays disabled until the
  form has a name.

---

## 4. The builder

**Top bar:** back arrow, the form name, then `Responses & Reports` with a count, `Themes`,
`Preview`, `Sharing`, `Publish` (dark, primary), `...`

Once published the top bar changes to: `Responses & Reports`, `Themes`, `Edit`, `View`,
`Copy link`, `Sharing`, `✓ Published` (green), `...`

**Left rail, five stages:**

| Stage | Sub-label |
| --- | --- |
| `Build` | `Fields & layout` |
| `Recipients` | `N added` |
| `Email Notifications` | `N addresses` |
| `Integrations` | `Sheets, CRM, tasks` |
| `Settings` | `Layout, link, security` |

### The field palette

Headed `+ DRAG OR CLICK TO ADD`, so fields can be dragged or clicked. Twenty-eight types in
seven groups:

| Group | Fields |
| --- | --- |
| **TEXT** | Short text, Long text, Fill in the blank, Email, Phone, Number, Currency, Website |
| **CHOICE** | Single choice, Multiple choice, Dropdown, Multi-select, Ranking, Yes / No, Consent / agreement |
| **CONTACT** | Full name, Address |
| **DATE & TIME** | Date, Time |
| **SURVEY** | Star rating, NPS (0–10) |
| **MEDIA & FILES** | File upload, Signature, Image, Logo, Video |
| **LAYOUT** | Section header, Text block, Divider, Page break |

Note **Signature** and **Consent / agreement**: this covers waivers, not just surveys. The live
library has an `Event Waiver` in it.

### The canvas

Top affordance: `+ Add logo above form`. Then the blocks, each draggable by a handle. The first is
a **form header** block, whose helper line reads
`Form header · edit the text here, drag to reposition, or delete to remove it`, with alignment
controls and a delete on the right. A `Drop here to add at the end` target sits at the bottom.

### Field settings

Selecting a field opens a right-hand panel, `<Type> settings`, carrying:

- `Question / label`
- `Required` checkbox
- `Help text` (Optional)
- `Alignment` select
- For choice fields, an `Options` list with a `✕` per option and `+ Add option`
- **`Conditional logic`** with `+ Add a rule`

---

## 5. Recipients

> **Recipients: Who should receive this form?**
> Add the people you'll send this form to. Each gets a personal tracked link, and you can see
> who's opened and completed it.

That is the whole feature in one line: **personal tracked links, with open and completion state
per person.**

- A paste area, `Paste emails, separated by commas or new lines...`, then `+ Add recipients`
- **Recipient Message**: `Included in the invitation and every reminder — context, a deadline, why
  you're asking. Leave blank to send just the form link.` 2000 character limit. The placeholder is
  a good line to reuse: `e.g. Please complete this before Friday's leadership meeting — it should
  take about 5 minutes.`
- **Email a Copy of Form Submissions to Recipients**, off by default:
  `When someone submits, also send the response summary to everyone in this Recipients list.
  Off by default — recipients just get the form to fill out.`

Note the wording **and every reminder**, so reminders exist.

---

## 6. Email notifications

> When someone submits this form, a response summary is emailed to everyone on this list. Add as
> many people as you like.

- **Reply-to address**: `When someone replies to this form's emails, this is where it goes. Leave
  blank to use your company's default.`
- **Also notify me in the app**: `Puts each submission in the in-app inbox (bell) of the form owner
  and any teammate on this list, on web and mobile.` So there is a mobile app.
- A paste area plus `+ Add emails`. Empty state: `No notification emails yet. Add people above to
  be alerted when this form is submitted.`
- **Conditional routing**: `Route submissions by an answer: if a chosen field's answer matches a
  value, the summary is also emailed to that rule's recipients — on top of the list above.`
  Gated: `Add a choice field (dropdown, single choice, multi-select, yes/no) in the Build stage to
  route by its answer.`

Conditional routing is a real differentiator and is claimed nowhere yet.

---

## 7. Integrations

This is the strongest section on the page. Six destinations, each a toggle with its own enabling
condition.

| Destination | Copy | Gate |
| --- | --- | --- |
| **Create a task on submit** | `Turn each response into a Move assigned to a teammate` | none |
| **Send results to a Scoreboard** | `Push NPS / rating / count into a weekly metric` | none |
| **Create a CRM record on submit** | `Pick an object, map at least one field, and cover required fields to enable` | object plus mapping |
| **Send responses to Google Sheets** | `Connect a spreadsheet below to enable` | a connected Google account |
| **Send responses to Ontraport** | `Map at least the contact email to enable` | contact email mapped |
| **Send submissions to a URL** | `We POST each new response as signed JSON, and retry with backoff if your endpoint is down. Only this form's submissions are sent.` | Admin or owner only |

### Create a task on submit, in full

Switching the toggle on opens a configuration block. This is far more than "make a task", and it
is the strongest thing in the section:

| Control | Default | Notes |
| --- | --- | --- |
| `Assign to` | `Unassigned` | a teammate |
| `Task title (use {fieldKey} to insert answers)` | placeholder `New response: <form name>` | **the title is a template**, and answers interpolate into it |
| `Field keys:` | the form's own keys | what you can reference in the title |
| `Add to project` | `No project` | drops the task onto a board |
| `Assign a date` | `No date` | a due date |
| `Match fields to the task` | `Match answers to task fields...` with `Edit` | helper: `Route answers into the task's status, priority, dates, attachments, or custom fields.` |

So an answer does not just create a task, it can **set that task's status, priority, dates,
attachments, and custom fields**. That is the claim no standalone form tool can make.

Details worth keeping:

- The UI calls the created item a **Move**. The client describes the behaviour as "when someone
  submits it sends a task to someone", so the page says **task**. Switch if Move turns out to be
  the canonical marketing name.
- Google Sheets: a `Your Google account` select, then `Create new spreadsheet` or
  `Pick existing...`. Helper: `Sheets sync runs through a personal Google account, so an Admin sets
  it up here using their own connected account.` So **Sheets sync is Admin-gated and tied to one
  person's account.**
- Webhooks: `Only an Admin or the business owner can manage webhooks.` and
  `Want one endpoint for every form instead? Company-wide webhooks`

### Settings stage

- **Share**: `Publish the form to get its public link, short code, and embed code.` So a **short
  code** exists as well as a full link.
- **Share with Multi AI**, `Let AI read this form's responses`, on by default:
  `When on, AI summaries and the AI Coach can read this form's responses — still limited to what
  each viewer is allowed to see.`
- **Layout**, `One question per page`: `Show one question at a time, Typeform-style, with a
  progress bar`. The product names Typeform itself here.
- **Content**: a rich-text `Thank-you message`, `Shown after submission. Leave blank for the
  default.`, or `Or redirect to a URL after submit`.
- **Branding**: `Logo URL`, `Cover image URL`, `Accent` (`Buttons, links, progress bar, selected
  choices.`, default `#4f46e5`), `Page background` and `Card background`, both defaulting to `Auto`.

### Publishing, the public link, and the QR code

The `Sharing` popover carries:

- **PUBLIC LINK**, on a real vanity domain: `https://forms.riseupkings.com/test`, with `Copy`
- **View QR Code**
- **EMBED ON YOUR WEBSITE**: `Paste this where you want the form. It renders right in the page —
  no iframe box — and submissions land here like any other response.` The snippet is a
  `<script src="https://app.multiplyos.com/embed/forms.js" data-...>` tag.

**The QR modal:** `Scan to open this form`, the URL, the code, then `Download PNG` and
`Download SVG`, with `PNG suits slides and flyers. SVG scales to any size for print.`

Three things to note. The public form is served on the **customer's own subdomain**, not a
Multiply OS URL. The embed is **script-based, not an iframe**. And the public form footer reads
`Powered by Multiply OS Forms`.

---

## 8. Generalising pass

**Forms**

| Live | Page |
| --- | --- |
| Focus time on Onboarding tasks — Booking | Onboarding Call Booking |
| Marriage Intensive Survey | Workshop Feedback |
| Elevate: Pre-Event Questionnaire | Pre-Event Questionnaire |
| RUQ Volunteer Application | Volunteer Application |
| Radiance Event Survey - Daughters | Event Survey |
| Revival Mastermind survey | Mastermind Survey |
| Refinery MOS Implementation Options | Onboarding Options |
| Refinery Group Coaching Call | Group Coaching Call |
| King's Coalition Study Sign-Up | Study Sign-Up |
| REVIVAL EVENT SCHOLARSHIP APPLICATION | Scholarship Application |
| Rise Up Queens Event Waiver | Event Waiver |
| IT Requests, Client Intake Form, Event Debrief Form | kept, already generic |

**Folders and people**

| Live | Page |
| --- | --- |
| Rise Up Queens (folder) | Client Programs |
| Jax Wainright, Alisha Dickerson, Jayden Ngoi, Justin Baker, Mark Hernandez, Ashley Acker, Ces De Leon | Skylar Lewis, Jordan Rivera, Priya Nair, Marcus Hale, Kath Nakamura |
| forms.riseupkings.com | forms.yourcompany.com |

Dashboard mockups across the site use **Skylar Lewis (SL)** as the owner persona.

---

## 9. Page status

Open items:

- **What Forms replaces, per the client:** Jotform, Google Forms, and Typeform. Wired in
  `ZERO_ITEMS` in `FormsHeroTour.tsx`. Three marks in a row render at 46px rather than the 64px
  the single-logo pages use, because at 64 they run close to 850px inside a 980px stage. Heights
  need re-tuning per logo once the artwork lands, the way Asana and Monday.com were.

  The client's full mapping for the pages not yet built, given August 2026: CFO Analytics replaces
  nothing, Team Accountability replaces Ninety.io and EOS One, Org Chart replaces Ninety.io, DISC
  Assessments replaces nothing, Checklists replaces Jotform and Google Forms, AI Coach & Agent
  replaces Claude and ChatGPT, Analytics Reports replaces nothing.
- **The QR code on the marketing page is drawn, not encoded.** The product's QR is real and
  scannable. The mockup's is a hand-made SVG pattern, because the caption beside it is the
  placeholder domain `forms.yourcompany.com` and a code encoding that would fail when scanned. To
  make it real, export one from the product with `Download PNG` and drop it at
  `public/forms-qr.png`.
- Nothing on the page yet claims **conditional logic** on fields, **conditional routing** of
  submissions, the **short code**, reminders, or the **locked folders**. All are real and all are
  sellable.
- Sheets sync being Admin-gated and tied to one person's Google account is a real constraint. The
  page must not imply every user can wire it up.

---

## 10. Corrections from the Sharing modal, August 2026

Two things the later screenshots changed.

### `Sharing` is access control, not the public link

The `Sharing` button in the builder's top bar opens a **centred modal about who on your team can
reach the form**, not the public link:

- **WHO CAN ACCESS**, three cards: `Private` (`Only you (and people you share with)`),
  `Department` (`Everyone in a chosen department`), `Company` (`Everyone in your company`)
- **SHARED WITH SPECIFIC PEOPLE**: an `Add a teammate...` select, a role select defaulting to
  `Editor`, and an `+ Add` button
- Each person then appears as a row with their name, their email, their role as a select, and a
  delete

So **roles exist on a form**, and `Editor` is one of them. That is claimed nowhere yet.

The **public link, QR code, and embed snippet are behind `Copy link`**, which is a popover rather
than a modal. Both hero tours were tapping `Sharing` to open the public-link popover, which was
wrong, and now tap `Copy link`.

### The signature pad confirms itself

Once a stroke lands, a green **`✓ Signature captured`** appears next to `Undo` and `Clear`.
Small detail, but it is the feedback that tells a signer the pad registered them, and both the
Agreements hero and its signing section now show it.
