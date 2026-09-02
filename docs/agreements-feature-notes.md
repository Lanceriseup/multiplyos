# Agreements: how the real product works

Reference notes for the `/features/agreements` marketing page. Everything here comes from
screenshots of the live app inside a customer account (Rise Up Kings), reviewed August 2026, plus
the product's own help-centre description relayed through Multi AI.

House rules: **no em dashes** in site copy. Quoted UI strings below are verbatim, so several carry
the product's own em dashes. Do not copy that punctuation onto the page.

---

## 1. The one sentence that decides the whole page

The product says it twice, in the empty state and again in the create modal:

> An agreement is a form with a signature on it.

That is the entire positioning. Agreements is not a separate product bolted on, it is the **Forms
engine plus a legally-binding signature layer**. Every screen after the create modal is the Forms
builder: the same five stages, the same twenty-eight field types, the same integrations, the same
themes.

Which means the page's argument against DocuSign, PandaDoc, and Adobe Sign writes itself:

| | DocuSign and friends | Agreements |
| --- | --- | --- |
| What you start from | a finished PDF you upload | a document you build, with real fields |
| What the signer can do | type in the boxes you dragged on | anything a form can ask: dropdowns, uploads, conditional questions |
| What happens after | it is filed | it can open a task, add a CRM contact, or fill a spreadsheet |
| What it costs | per envelope | part of the OS you already pay for |

**Do not let this page read as a cheaper DocuSign.** The claim is that the signed document is a
live object in the same system as your projects, CRM, and scoreboards.

### Correction, September 2026: the product does both

The table above was written before the create flow was screenshotted properly, and its first row
is now wrong. **Agreements does take a finished PDF.** `+ New agreement` opens a picker whose
first question is which of the two you want, and both are real:

| Card | Copy |
| --- | --- |
| `Form based agreement` | `Build the terms as a form with a signature block. Best when you're writing the agreement here.` |
| `Document based agreement` | `Bring in a finished PDF, Word file or Google Doc, drop signature and date fields onto its pages, and send it out for signing.` |

So the honest version of the row is: DocuSign can *only* start from a finished document; Agreements
does that **and** builds one out of real fields. That is a strictly larger claim, and it makes the
rest of the table stronger rather than weaker, because the "what happens after" row still only goes
one way. **The positioning note above still stands**: lead with the form path, because the
integrations argument only exists on that side.

### The document path, step by step

> **New agreement**
> Bring in the finished document &mdash; a PDF, a Word file, or a Google Doc. Next you'll place the
> signature and date fields on its pages and send it out for signing.

- `Agreement name`, placeholder `e.g. Consulting agreement`
- A dashed drop zone: `Drop your PDF or Word file here or browse`, then `PDF or Word (.docx), up to
  25 MB`, then `OR`, then a `Connect Google Drive` button, then
  `Google Docs are converted to PDF for signing.`
- Footer: `Back` and `Next: who signs it`, the primary disabled until a file is in

Three details worth holding onto. The ceiling is **25 MB**. Word is **.docx specifically**. And a
Google Doc is **converted to PDF**, not signed live, which is the sort of thing that turns into a
support ticket if the page implies otherwise.

### The tracking page, as screenshotted September 2026

Section 2 used to flag the populated list as inferred. It has now been screenshotted in full and
the hero has been rebuilt to match. What is on it:

- Heading **`My Agreements`**, then the subtitle from section 2.
- An actions row: `How it works` (a plain link with a `?`), `Templates` (outline button), and
  `+ New agreement` (dark, primary).
- **Tabs**, in one rounded container, each with a count badge:
  `All`, `Needs my signature`, `Awaiting signatures`, `Drafts`, `Completed`, `Archived`.
  A `Search by title or signer...` box sits to their right.
- A **grid / list view toggle** below them, grid selected.
- A **card grid**, three across, not a table.

**A card carries:** the title, a status pill, a `...` menu, then `N signers`, then **one row per
signer** with their name and either a green `⊘ Signed` or a grey `Sent`, then
`Created <date>`, then a green `Completed <date>` when there is one, then an action:
`Download` (outline) on a completed one, `Continue editing` (dark) on a draft.

Per-signer state is the detail worth noticing. A three-signer agreement shows all three and which
of them have actually signed, so "awaiting" is never a mystery about who.

**Status pills seen:** `Draft` (grey), `Completed` (green), `Voided` (red). The in-flight pill has
**not** been screenshotted; the `Awaiting signatures` tab proves the state exists. The hero uses
`Awaiting` in amber as a stand-in. **Confirm the real label before launch.**

The mockup's tab counts are its own rather than the screenshot's, which are mostly zeros: a page of
zeros reads as an empty account rather than a working one.

### The help centre's framing

- **Find every signed document** &mdash; one view of everything the company has executed
- **Track signature status** &mdash; what is still waiting on somebody, yours or theirs
- **Recorded decisions** &mdash; send work for approval and get a documented sign-off with a timestamp

Use cases it names: client contracts and NDAs, employee agreements and policy acknowledgments,
vendor agreements, internal approvals on key documents.

---

## 2. The Agreements page

Heading `Agreements`, then the subtitle, which is three verbs worth reusing:

> Every document sent for legally-binding signature: track status, download the executed copy, and
> sign what's waiting on you.

A `+ New agreement` button sits top right.

**Empty state**, in a dashed card: a pen-on-document glyph, `No agreements yet`, then

> An agreement is a form with a signature on it. Create one and every submission lands here:
> tracked, signed, and downloadable.

and a second `+ New agreement` button.

> **Caveat for anything built off this section.** Only the *empty* list has been screenshotted. A
> populated list has not, so the columns are inferred from the subtitle and the help centre: name,
> status (waiting on you, waiting on them, signed), who signed, when, and a download. The mockup on
> the page follows that inference. **Get a screenshot of a populated list before the page ships**,
> because the status vocabulary is a guess.

---

## 3. Creating one

`+ New agreement` opens a single modal.

> **New agreement**
> An agreement is a form with a signature on it. We'll create the form with the signature block
> already in place &mdash; you add the terms and publish.

- `Agreement name`, placeholder `e.g. Client services agreement`
- **`Start it with`**, a scaffold picker:

| Item | Copy | Default |
| --- | --- | --- |
| **Signature** | `Always included. It's what turns the form into a tracked, legally-binding agreement.` | forced on, rendered as a highlighted card rather than a checkbox |
| Terms section | `A heading and text block to paste your agreement language into.` | checked |
| Signer's full name | `Printed name to accompany the signature.` | checked |
| Signer's email | `Where the countersigned copy is sent.` | checked |
| Date signed | `Pre-filled with the signer's current date.` | checked |
| Explicit "I agree" checkbox | `An additional acknowledgement of the terms — electronic-signature consent is always collected separately at submit.` | unchecked |

Then a note:

> You can add, remove, and reorder any of this in the form builder. Once published, every
> submission becomes an agreement tracked on this page.

Two details that matter. **Signature cannot be removed**, which is what separates an agreement from
an ordinary form. And the `I agree` checkbox is *optional* because **e-signature consent is always
collected separately at submit** regardless.

---

## 4. What it builds

The create action drops you into the ordinary Forms builder with the scaffold already laid out:

1. `Add logo above form`
2. the form header
3. `Logo`
4. `Agreement terms` &mdash; Section heading
5. `Replace this text with the terms of your agreement. Everything the signer needs to read before signing belongs here.` &mdash; Text block
6. `Full legal name` * &mdash; Full name
7. `Email address` * &mdash; Email
8. `I have read and agree to the terms above.` * &mdash; Consent / agreement
9. `Date signed` * &mdash; Date
10. `Signature` * &mdash; Signature

Everything after that is Forms, unchanged: `Build`, `Recipients`, `Email Notifications`,
`Integrations`, `Settings`, and the twenty-eight field types. See
`docs/forms-feature-notes.md` for all of it rather than repeating it here.

Worth noting from these screenshots specifically:

- **Section heading settings** carries `Heading`, `Sub-heading`, and `Alignment`. Sub-heading was
  not visible in the Forms screenshots.
- Integrations shows the un-connected state: `You haven't connected a Google account yet — connect
  Google Sheets on the Data page, then come back here.` plus `Refresh accounts`, and
  `No webhooks on this form yet.` with `+ Add webhook`.

### Themes

A `Theme` modal with **six presets**: `Clean`, `Midnight`, `Ocean`, `Forest`, `Sunset`, `Berry`.
Then `CUSTOMIZE COLORS`: `Accent` (`Buttons, links, progress bar, selected choices.`, default
`#4f46e5`), `Card background` (`The form card itself.`), `Text` (`Headings, labels and helper
text.`). Then `INPUT FIELDS`: `Field background` (`The box people type into. Leave on Auto to derive
it from the background.`) and `Field text` (`What people see as they type. Auto keeps it readable on
the field.`), with a `Live preview` showing `Sample answer text` and `Placeholder...`.

This is a real answer to "will it look like our contract or like a form vendor's".

---

## 5. Signing it, which is the legally interesting part

The published agreement, on the customer's own subdomain, renders the scaffold and then:

- **`Signature` \*** with a **`Draw` / `Type`** toggle
- a signature pad showing a rule and `✕ Sign here`, with `↺ Undo` and `◇ Clear`
- a separate consent block:

  > ☐ I agree to use electronic records and signatures, and that my electronic signature is
  > legally binding. \*
  > **View full disclosure**

- the button reads **`Sign and submit`**, not Submit
- footer: `Powered by Multiply OS Forms`

`Date signed` is pre-filled with the signer's date and offers `✕ Clear date`.

Four things to claim, and nothing more, because this is a legal claim and overstating it is the one
mistake that actually costs somebody:

1. The signature can be **drawn or typed**.
2. Consent to electronic records and signatures is **collected separately and is required**.
3. There is a **full disclosure** the signer can read before agreeing.
4. The result is described by the product as a **tracked, legally-binding agreement**, and the
   executed copy is **downloadable**.

**Do not write copy claiming compliance with any named statute** (ESIGN, UETA, eIDAS) unless
somebody at Multiply OS confirms it in writing. The product does not name one anywhere in these
screenshots.

---

## 6. What the page should argue

1. **An agreement is a form with a signature on it.** Lead with this. It is the differentiator and
   the product's own words.
2. **The signing experience is real.** Draw or type, separate consent, full disclosure, executed
   copy.
3. **Track what is waiting on whom.** One view of everything executed, and what is not yet.
4. **Then it does something.** Because it is a form, a signed contract can open a task, create a
   CRM contact, or add a row to a spreadsheet. This is the thing a signature vendor structurally
   cannot do, and it belongs last because it is the strongest.

---

## 7. Page status

- **Replaces DocuSign, PandaDoc, and Adobe Sign**, per the client. Note the client wrote "panda
  sign"; the product is **PandaDoc**. Logos needed at `public/replaces-docusign.png`,
  `public/replaces-pandadoc.png`, `public/replaces-adobe-sign.png`.
- **This page took the nav slot that was Analytics Reports**, which does not exist as a feature yet.
- The Agreements list has been **rebuilt to the September 2026 design** and is no longer inferred.
  The one open question on it is the in-flight status pill, noted in section 1.

### The hero tour, September 2026

The tour runs **one continuous pass covering both create paths**, about forty seconds.

It was built as two alternating passes first, and that was wrong. Fading out after the signature
and coming back to the tracking page read as the loop restarting, so the document path looked like
the beginning of a second viewing rather than the next thing that happens. Anyone who did not sit
through two full passes never saw the PDF at all.

The fix is that **there is no fade between the two halves**. The signed copy lands on the tracking
page, holds for a beat and a half, and the cursor goes straight back to `+ New agreement` and picks
`Document based` this time. The tracking page is where you already are once something is signed, so
carrying on from it is both truer to the product and the fastest route to the PDF. The document
half now starts around twenty-three seconds in rather than after a restart.

Two other things the pass shows:

- A field **dragged in by hand** from the palette, landing above the signature block. The scaffold
  that `Create agreement` lays down used to appear on its own and read as a fixed template. The
  field dragged in is a `Dropdown`, because a question with options is the thing a flat PDF cannot
  ask.
- The document half ends at `Send for signing`, not at a signature. The card then lands on the
  tracking page as awaiting the other side, which is true: nobody has signed it yet. Signing a
  document-based agreement is a screen that has not been screenshotted, so it is not drawn.

**If the loop needs to come down from forty seconds**, the cheapest cuts in order are: the
`Explicit "I agree"` beat in the scaffold picker (about 1.4s), the hold after the hand-dragged
field (about 1s), and the closing hold on the tracking page (about 2.3s, of which roughly 1s is
spare).

Two things in the document path are **drawn rather than screenshotted**, and should be checked:

- The **page editor** itself. The modal copy names the two fields (`signature and date`), so only
  those two are in the palette, but the real editor's chrome, its page navigation, and whether
  fields snap or free-place are all unknown. The mockup shows a single page with a
  `Drag onto the document` palette and a `1 signer` chip.
- The file's **page count and size** on the upload chip (`184 KB · 3 pages`) are invented detail.
- Not claimed anywhere yet, all real: the six theme presets, `Sub-heading` on section headings,
  `Clear date`, the countersigned copy going to the signer's email, and the `Explicit "I agree"`
  option being additional to the consent that is always collected.
- No statute is named by the product, so the page names none either.

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
