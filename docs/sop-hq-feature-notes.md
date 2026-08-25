# SOP HQ: how the real product works

Reference notes for the `/features/sop-hq` marketing page. Everything here comes from
screenshots of the live app inside a customer account (Rise Up Kings), reviewed August 2026.
The marketing page mockups are hand-built rather than screenshotted, so this file is the
source of truth for what those mockups are allowed to claim.

Two standing rules for anything built off this file:

- **Generalise the content.** The live library is full of Rise Up Kings names. The feature
  page has to read as any business. See [Generalising pass](#generalising-pass) at the bottom.
- **No em dashes** in site copy, per house style. Quoted UI strings below are verbatim, so a few
  of them carry the product's own em dashes. Do not copy that punctuation onto the page.

---

## 1. Where it lives

SOP HQ is one item in the Multiply OS left nav, alongside Dashboard, My HQ, One Page Plan,
Scoreboards, MOS Scribe, Team Meetings, CRM, Events HQ, Inventory HQ, Multi AI, Projects,
Forms & Checklists, and Toolbox.

It expands into two sub-pages:

- **SOP Library** (everything below)
- **SOP Planner**

Page header is `SOP HQ`, subtitle `How your team gets things done — captured once, shared forever.`
A `+ New SOP` button sits top right. An `Ask Multi AI` pill floats bottom right on every screen.

---

## 2. The library, three levels deep

### Level 1: Departments

A three column grid of department cards. Each card shows a coloured icon tile, the name, and
`N SOPs · N members`. A department with nothing in it gets a `No SOPs yet` pill. There is one
special card, `Company-wide`, described as `1 SOP not tied to a department`.

Live departments: Operations (92), Programs (12), Sales (29), Accounting (9), Marketing (10),
Events (22), Technology (4), RUK Ministries (0), Company-wide.

A `Manage in Settings` link and a grid/list view toggle sit to the right of the `Departments` heading.

Right rail:

- **Favorites**, empty state `Star a SOP to pin it here.`
- **Recently viewed**, a stack of compact SOP rows with a star toggle on each

Below the grid: the filter bar, then a grid of recent SOP cards.

**Filter bar** (appears at every level): tab pills `All`, `Assigned to me`, `Recently viewed`,
`Created`, `Recently published`, `Outdated SOPs`, then a search field,
`Search SOPs — title, content, or concept...`, then a grid/list toggle.

Note the search promise: **content and concept, not just title.**

### Level 2: Subjects inside a department

Breadcrumb link `← All departments`, then a department header card repeating the icon, name,
and counts, with a line under it:

> Members of this department automatically receive every SOP in it.

Then `Browse by subject` / `Pick a subject to see its SOPs.` and a three column grid of subject
folder cards, each `N SOPs`. Subjects are free-form per customer. Live examples under Operations:
AI Agent SOP, Hiring, EA SOP's, Executives Operation, Inventory / Gifting, GENERAL, COACHES, RUQ,
and `Uncategorized` (30), which uses an inbox icon rather than a folder.

The filter bar repeats underneath, with its own SOP results area.

### Level 3: SOPs inside a subject

Breadcrumb `← Operations subjects`, subject header card, filter bar, then the SOP list.
Empty state is an open book glyph with `Nothing here yet` / `No SOPs available right now.`

### SOP cards

Each card carries: initials tile, title, department chip, author (`by Kath`), a shared-with line
(`Technology, Alisha Dickerson & 3 others`), read time, step count, a `0/N complete` counter with
a progress bar, and star plus share icons. Drafts show a `Draft` pill.

---

## 3. Opening a SOP

Breadcrumb across the top: `SOPs › Technology › Uncategorized › Adding New User`.
Then the title and read time.

**Toolbar:** `Favorite`, `Share`, `Print / PDF`, `Versions`, `Edit`, plus `Reset progress` when
the reader has started it.

**Second row:** `Read aloud` (with a play control) and `Suggest an edit`.

**Footer:** `Mark complete`.

### A SOP is not one shape

This is the single most important thing the feature page has to communicate. The same library
holds all of these:

| Shape | What it looks like |
| --- | --- |
| Written procedure | Numbered steps, bold callouts, inline links, formulas, sub-lists. Can end with an attached Google Doc card. |
| Video SOP | A `Quick Notes:` block of links, then embedded players (Loom, Screencast) rendered inline. |
| Embedded doc | A Google Drive or Docs iframe rendered in the body, with a purpose line beneath it. |
| Reference table | A `Change Log:` style table with Date / Description / Author rows. |
| Multi-step SOP | A left sidebar of steps grouped under headings, a progress counter, and one step per screen. |

### Multi-step SOP layout

Left sidebar: `← Back`, the SOP title, a `0/23` progress bar, then steps grouped under uppercase
headings the author writes (live example: OVERVIEW, PERFORMANCE, GENERAL, EFFICIENCY HACKS,
WEEK ONE - VIDEOS). Each step has a radio circle that fills when complete.

Right pane: breadcrumb, `OVERVIEW · STEP 1 OF 23`, the step title, the toolbar, the step content,
then `‹ Previous`, `Mark step complete`, `Next ›`.

---

## 4. Creating a SOP

`+ New SOP` opens a three modal sequence.

### Modal 1: format

> **New SOP**
> Pick the format. You can always change it later by adding or removing steps.

- **Single document / video** (Default): "One page of content — text, video, image, or any combo.
  No step structure. Best for short procedures and reference material."
- **Multi-step**: "Break it into ordered steps with their own titles and content. Best for longer
  procedures the team works through in sequence."

### Modal 2: starting point

> Start from blank, generate with AI from a one-line prompt, or paste an SOP you already have.
> Format: Single document / video · Change

- **Start from blank** (Default): "Open an empty document and start writing."
- **Record a walkthrough with screenshots**: "Narrate a screen recording and the AI SOP Agent
  writes a step-by-step SOP with screenshots from what you say and show. Keeps running in the
  background; controls stay in the top bar."
- **Generate with AI**: "Describe the procedure in one line. We'll draft the content you can refine."
- **Upload or Paste SOP**: "Import DOCX, Markdown, or rich paste content while preserving
  formatting, images, and links."

### Modal 3: title

> Give it a title your team will recognize. You can rename it anytime.

Single `SOP title` field, then `Back` / `Create →`.

Only `Start from blank` goes straight here. The other three starting points replace this modal
with their own flow, below.

### Starting point: Upload or Paste SOP

A wide two column importer.

> Upload DOCX or Markdown files, or paste rich content, then review before creating.

Two tabs at the top: **Single document** and **Import workspace** (the bulk path).
Heading: `Review imported SOPs before creating them`.

**Left column, four stacked cards:**

1. **Dropzone** — `Drop files here or click to upload` / "DOCX, Markdown, and image files.
   Formatting, images, and links are preserved."
2. **Synced Google Docs** — connect an account, then pick docs to import. Shows
   `Connect before importing` with a `Connect` button, and two chips, `0 synced` and `0 selected`.
   In this account it also shows a red permission notice: `Your role doesn't allow editing this
   feature.` So **importer access is role gated.**
3. **Rich paste** — "Paste from Google Docs, Word, Notion, or a browser page." A full rich text
   toolbar over a `Paste SOP content here...` area, with an `Add pasted SOP` button that stays
   disabled until there is content.
4. **Documents** — the queue. Empty state `Nothing added yet` / "Upload a DOCX or Markdown file,
   or add a rich paste to begin."

**Right column: Review editor**, with a `0 ready` counter chip.
Empty state: `No SOP selected` / "Add a document or paste content on the left, then review it
here before creating."

Nothing is created until it has been reviewed. That review gate is the point of the screen.

### Starting point: Generate with AI

**Prompt modal:** `What does this SOP cover?` A textarea with a 500 character limit and a live
counter, then `TRY ONE OF THESE` suggestion chips:

- How we onboard a new sales hire
- How to respond to a 1-star Google review
- Closing checklist for the kitchen at end of shift
- How to run our weekly leadership meeting

Then `Back` / `Generate draft`.

Worth noting: **the product's own example prompts already span four unrelated industries.** That
is the "any business" argument made by the product itself, and the copy is reusable on the page.

**Progress modal:** `Drafting your SOP` / "Generating your SOP draft. This usually takes 30-120
seconds." Three named stages, each with its own line of explanation, lighting up in sequence:

1. `Outlining topics` — "Identifying the major phases of the procedure."
2. `Drafting step contents` — "Writing instructions, lists, and visuals to add."
3. `Polishing & saving` — "Tightening language and creating the draft."

### Starting point: Record a walkthrough with screenshots

See [section 6](#6-the-ai-walkthrough-recorder).

---

## 5. The editor

**Top bar:** `← All SOPs`, an `Auto-save on` status dot, then `Versions`, `Discard` (red),
`Cancel`, `Save draft`, `Preview`, `Publish` (dark, primary).

**Header block:**

- `SOP TITLE` with the title and a pencil affordance
- `Department: Company-wide ✎` pill and a `Visible to everyone` pill
- `Required training  None  [+ Link a course]`

**Add a block** palette, ten buttons in two rows:

`Text` · `Video` · `Video from Link` · `Screen Record` · `Audio` · `Image` · `Screenshot` ·
`File` · `Link` · `Quiz`

Blocks stack below in whatever order you add them, each collapsible with an uppercase label.
Blocks can be added and removed freely, so the shape of a SOP is entirely author-controlled.

At the bottom: `+ Convert to multi-step`, then a red **Delete SOP** danger zone:

> Permanently remove this SOP. Steps, blocks, sign-offs, and recordings will be deleted forever.
> This cannot be undone.

### What each block offers

| Block | Contents |
| --- | --- |
| **Text** | Full rich text toolbar: bold, italic, underline, strikethrough, text colour, highlight, H1/H2/H3, bullet and numbered lists, blockquote, horizontal rule, table, three alignments, outdent/indent, link, image, undo/redo. Placeholder `Write the step content...` |
| **Video** | `Upload video` or `Record screen`, plus an optional caption |
| **Video from Link** (renders as EMBED) | Preview pane, URL field with `Apply`, a `Title (shown to screen readers)` field, and a caption. Supports YouTube, Vimeo, Loom, Google Drive, Wistia, Streamable, Vidyard, Twitch, Dailymotion, or any web page. Blocked iframes still leave the link openable. |
| **Screen Record** | `Screen` / `Screen + Camera` / `Camera` toggle, live `Duration 0:00`, `Record microphone` and `Record me on camera` checkboxes, `Start recording` / `Cancel`. The camera bubble is draggable: the preview shows `Video will render here` and a dashed `Move here` target. |
| **Audio** | `Upload audio` plus caption |
| **Image** | `Upload image` or `Take screenshot`, `Alt text (describe the image — required for accessibility)`, caption |
| **Screenshot** | Same family as Image, capture rather than upload |
| **File** | `Upload file` plus caption. Supported: PDF, Word, Excel, PowerPoint, plain text, CSV, Markdown, JSON, ZIP. Max 50 MB. |
| **Link** | Paste a Google Doc, Sheet, Slides, Notion, Figma, or any URL, then `Apply`. Renders as a card with an optional caption beneath. |
| **Quiz** | "Create a knowledge check that trainees must pass before they can mark this step complete. Hand-write questions or generate them with AI, from this SOP or from pasted text." Two buttons: `Generate with AI` and `+ Quiz from Scratch`. |

**The Quiz block is a completion gate**, not just an attachment. That is a real differentiator
and it is currently claimed nowhere on the marketing page.

### The multi-step editor

Everything above describes the single document editor. Choosing **Multi-step** in modal 1 gives
the same editor with a step navigator added on the left. The block palette, the header block, the
top bar, and the danger zone are all identical.

**Left sidebar:**

- `← All SOPs`
- `SOP TITLE`, the title with a pencil affordance, and a `Draft` pill
- A **topic** heading in uppercase with its own pencil (default `OVERVIEW`)
- The steps under it, numbered, the current one highlighted: `1. Step 1`, `2. Step 2`, `3. Step 3`
- `+ Add step` and `+ Add topic`

Topics are the uppercase groupings that show up in the reader view (the live 23 step SOP uses
OVERVIEW, PERFORMANCE, GENERAL, EFFICIENCY HACKS, WEEK ONE - VIDEOS). The author writes them.

**Right pane:** the step title with a pencil, then that step's own `Add a block` palette and
blocks. So **every step is a full document**, with all ten block types available inside it.

**Per step:** a red `Delete step` action sits under the blocks, above the SOP level danger zone.

`+ Convert to multi-step` is absent here, since it already is. The conversion runs one way from
the editor, though modal 1 says format is changeable "by adding or removing steps".

On the reader side each step carries a checkbox, so a person ticks their way through and the
`N/23` counter moves.

---

## 6. The AI walkthrough recorder

Picking `Record a walkthrough with screenshots` in modal 2 replaces modal 3 with a setup step:

> Narrate as you go — the AI SOP Agent writes the SOP from what you say and what it sees on
> screen, and pulls screenshots straight out of the recording. Next you'll pick a screen to share,
> then a 3-second countdown before it starts. Keep it under ~10 minutes.

- A `MICROPHONE` select, defaulted to the system device
- Helper text: "Your narration drives the draft, make sure the right mic is picked."
- `Back` / `Choose screen & start`

Then:

1. Screen picker, then an in-app banner counts down: `Get ready — recording starts in 1...`
2. Recording runs in the background with controls in the top bar, so you keep using the app
3. On stop, a green toast: **`AI draft ready`** / "Review every step, fill in the TODO image /
   video blocks, then publish."
4. The editor opens on a draft with the title already filled in, the department set, and a
   populated **Text block**: an H2 heading, prose written from the narration with key terms
   bolded, and **screenshots pulled straight out of the recording** placed inline

The draft lands with `TODO` markers where an image or video block still needs a human.

This is the strongest single story in the whole feature: you talk through a process once, and a
publishable SOP with screenshots exists at the end of it.

---

## 7. Generalising pass

The live library is Rise Up Kings specific. Mapping used on the feature page:

**Departments**

| Live | Page |
| --- | --- |
| RUK Ministries | Customer Success |
| Programs | People & HR |
| Events | Fulfillment |
| Operations, Sales, Marketing, Accounting, Technology, Company-wide | kept (Accounting shown as Finance) |

**Subjects**

| Live | Page |
| --- | --- |
| EA SOP's | Onboarding |
| RUQ | Daily Checklists |
| COACHES | Quality Control |
| Inventory / Gifting | Inventory |
| Executives Operation | Vendors |

**SOPs and people**

| Live | Page |
| --- | --- |
| Adding New User | New Client Onboarding |
| Setting up GHL for New Hires | Setting Up the CRM for a New Client |
| Ontraport Inbox | Issue a Refund |
| GSuite Training Videos | Product Walkthrough |
| Employee Onboarding Template | kept, it is already generic |
| Kath, Alisha Dickerson, Ashley Acker | Skylar Lewis, Jordan Rivera, Priya Nair, Marcus Hale |

Dashboard mockups across the site use **Skylar Lewis (SL)** as the owner persona.

---

## 8. Page status

Done:

- **Hero** now runs four acts, at the client's direction (August 2026), because the old loop
  showed navigation and none of the headline features:
  0. *the cross-out* &mdash; the loop opens on `This replaces` over the Trainual wordmark, a marker
     draws across it in two passes, it dims, then dissolves and the library rises into its place.
     About 2.7s. Placement options were reviewed in
     [`design/sop-hq-replaces-placement-options.html`](../design/sop-hq-replaces-placement-options.html);
     this is option C. The mark is no longer a caption above the animation.
  1. *read* &mdash; department, subject, open a SOP, back to the library
  2. *record* &mdash; New SOP, single document, start from blank, title, then the **Screen Record**
     block rather than a Text block: the Screen / Screen + Camera / Camera switch, the draggable
     camera bubble, and Start recording with a live Duration
  3. *narrate* &mdash; back out, New SOP again, this time **Record a walkthrough with screenshots**:
     mic pick, the browser's own share sheet, the 3 second countdown, the recording strip over the
     working library, then **the tour switches to the shared tab**: the document being narrated,
     with the browser's own `Sharing this tab to app.multiplyos.com` bar and `Stop sharing` above
     it. Stop sharing hands back to SOP HQ with the AI SOP Agent drafting notice, then the draft
     opens itself with a heading, prose with the key terms bolded, and the screenshots it cut out
     of the recording, each labelled with the timestamp it came from.

     Two things here are deliberate, both from watching the live product:
     - **The shared tab is never Multiply OS.** It is a document, currently the refund policy.
       Recording the product inside the product is circular, and a SOP is a record of work done
       somewhere else. Multiply OS stays in the share sheet's tab list, unpicked, so the cursor is
       seen passing it. `PICK_TAB` selects which one.
     - **The SOP that comes out matches the document it was recorded over.** Change the shared doc
       and `DRAFT_TITLE` / `DRAFT_HEADING` / `DRAFT_PROSE` have to move with it, or the tour
       narrates one thing and writes another. `Issuing a Refund` also lines up with the Quiz block
       further down the page, which asks who approves a refund inside thirty days.

  **Roughly 58s a loop, measured in the browser.** That is long for a hero.
  `SHOW_BROWSE = false` in `SopHqHeroTour.tsx` drops act one, which buys back about 8s and takes
  it to ~50s: the cross-out then leads straight into the two recording paths, which are the only
  parts the client asked to highlight. Worth doing before this goes to them.
- **Content generalised**, and the invented off-palette colours dropped in favour of the five the
  app already ships.
- **Section 2** is now **Blocks**, a playable palette that toggles the ten block types in and out
  of a document. It replaced the AI Agent walkthrough.
- **The AI Agent walkthrough** moved into the Multi AI closer, rendered under the wired diagram
  via the new optional `below` prop on `MultiAiWired`.

### Open items

- Department icon colours for the invented departments need a brand pass. People & HR is
  currently a purple that is off-palette.
- **The Share panel is still undocumented.** Section 3 records the `Share` button in the toolbar,
  but nothing behind it: permission levels, whether a public link exists, and what
  `Required training` / `Link a course` actually does. Screenshots needed before the page can
  claim anything about sharing, which the client has asked for by name.
- The page still does not mention the Quiz completion gate, `Versions`, or `Read aloud`. All are
  real and all are sellable. The four ways in and the AI walkthrough recorder are now covered by
  the hero.
- Ashley Acker's top three for Projects, Metrics, and Team Meetings are still outstanding, so the
  same hero pass cannot yet run on those pages.
- The four ways in (blank, record, generate, import) may deserve a section of their own. The page
  currently only argues that SOPs are easy to read, never that they are easy to write.
- Role gating exists (`Your role doesn't allow editing this feature`), so the page should not imply
  every user can do everything.
- If the hero animates a checklist, it will overlap the Multi-step SOPs section further down the
  page. Different step names needed in each.
