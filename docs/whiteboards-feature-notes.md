# Whiteboards — feature page notes

Built September 2026. The thirteenth feature page and the newest module.

## 1. What we were given

Three things, and nothing else:

1. **Two screenshots.** The board list (`Whiteboards` → All boards, with one
   card), and a live canvas with the tool rail, sticky notes, connectors,
   freehand strokes, two photographs, a selected object's floating toolbar, the
   minimap and the zoom control.
2. **`public/replaces-miro.png`**, supplied by the client.
3. **A summary of the two help-centre articles**, which give the feature exactly
   two capabilities: *Start a whiteboard* and *Share a whiteboard and comment on
   it*.

The help centre also says Whiteboards is an **optional module teams can enable**.

Everything on the page traces to one of those three. Nothing about pricing,
limits, object counts, or performance is claimed anywhere, because we were given
none of it.

## 2. What the page does NOT claim

Worth being explicit, because these are the obvious things a whiteboard page
would say and we cannot support any of them:

- No object, board or storage limits.
- No import from Miro, or from anything else. Nobody told us there is one.
- No templates or template gallery. The screenshots show none.
- No video, voice or in-board chat. Presence and comments only.
- No offline or mobile-app claim.
- **No other tool replaced besides Miro.** FigJam and Mural are the obvious
  neighbours and both are deliberately absent: the client supplied one logo and
  named one tool. See `components/ReplacesStrip.tsx`.

## 3. The four sections, and why in this order

1. **Start a whiteboard** — the canvas and the whole tool rail.
2. **At the same time** — presence, live cursors, and saving itself.
3. **Share and collaborate** — a role per person, a public link for outsiders.
4. **Feedback, on the spot** — pinned comments.

Sections 1 and 3/4 are the help centre's two articles. Section 2 was split out
of the middle of them on purpose and put **second**, because it is the one that
earns the Miro comparison. An infinite canvas is table stakes; the argument for
moving off Miro is that this canvas is already inside the system holding your One
Page Plan, your scoreboards and your SOPs, and that is what section 2 says.

The optional-module fact is stated **once**, as the last bullet of section 1,
rather than hedging the whole page.

## 4. The hero tour

`components/WhiteboardsHeroTour.tsx`.

**Revised twice in September 2026, both times on the client's review.**

The first cut introduced the collaborator as beat 5 of 6. The note back was:
*"make sure in the beginning and throughout you show collaboration (another user
in there moving his mouse and adding things)"*. Fair: presence arriving five
sixths of the way through a loop reads as a scripted cameo, and most visitors
never saw it.

The second cut over-corrected. Dana was on the board from frame one, but she
drifted between seven waypoints for the whole loop, and the note back was
blunt: *"there's a lot of unnecessary movements"*. Also fair. The fix was not
less presence, it was less motion.

Where it landed, and the two notes that shaped it:

- **She is invited in, on screen, as the first thing that happens.** Share,
  then Invite, and her avatar joins the presence stack. That answers *"show
  that we added someone in, in the first place"*: you see the board gain a
  person rather than finding one already there. The role is **Can edit**,
  matching the sharing section further down the page.
- **Every move she makes does something**, and she is still in between: in from
  the edge, to her first sticky, along an arrow, to her second sticky, along a
  second arrow, and one step aside so the comment bubble has room. A real
  collaborator's cursor sits still most of the time. Presence is her being there,
  not her being busy.
- **She draws two arrows of her own**, added on a later note asking for *"a
  little bit of animation for Dana W like adding some arrows"*. They were the
  way to give her more to do without giving her more to wander. The first
  reaches across from OUR sticky to hers, so the board reads as two people
  thinking about the same thing rather than two people working in parallel
  columns; the second joins her own pair. Both are in her teal with her own
  arrowhead marker, and **she travels each one while it draws**, so the stroke
  reads as her hand rather than as something that appeared on its own.
- **Her cursor sits at 0.72 opacity**, ours at 1, from the same note. At parity
  the eye cannot tell which of the two cursors it is meant to follow.

**Ours,** the main loop:

0. Share the board and invite Dana.
1. A sticky lands and gets typed into, then a second one.
2. A connector joins them, so the board is a map and not a pile.
3. The pen draws a freehand loop around both.
4. Two photos are dropped onto the board together.
5. A pinned comment is left on Dana's second sticky and typed out.

**Dana's,** `mateScript`, started the moment she is invited: arrive, her first
sticky ("Q1 budget") while we are still writing ours, her second ("Pricing
page"), then rest.

Measured on the built page: she is off the board only while we are inviting her,
then on it for the rest; her cursor computes to 0.72 against ours at 1; both
arrows reach fully drawn at about 19.2s; and the hero's own pinned comment still
finishes typing at about 27.6s, so nothing downstream got squeezed out by the
extra beats.

### Why two drivers and not one sequence

Nothing but `mateScript` ever animates `mateRef`, and nothing but the main loop
ever animates `cursorRef`. That split is load-bearing. Two callers animating one
element through the Web Animations API race each other, and the loser strands
its cursor mid-canvas because it reads a start position that has already moved.

The two scripts meet at exactly one point: `mateAddedC`, a flag Dana sets when
her second sticky exists. The main loop waits on that flag before commenting
rather than trusting the two timelines to stay in step, so retuning any earlier
beat cannot send our pointer to comment on a sticky that is not there. A second
flag, `mainDone`, lets her stay for as long as we are busy without having to
know how long that is.

### The rest of the chrome

The two photos in beat 4 are **drawn SVG landscapes, not stock photography**,
each with a filename caption underneath. The client's screenshot has two real
photographs on the board, and a real one here would both imply the board ships
with content and publish an image that is not ours to publish.

Traced from the canvas screenshot: the `← Boards` crumb, the title, the presence
avatars, the palette, the **Saved** pill (which flips to *Saving…* while the
board is being edited and back at the end), the fourteen-tool rail, the dot
grid, the floating selection toolbar, the minimap and the zoom readout at 79%.
The minimap carries four marks, two grey and two teal, so it shows the board
filling up from both sides rather than only from ours.

Fourteen tools are drawn and only four are ever picked, the image tool being the
fourth. That is deliberate: a three-tool whiteboard does not read as a
whiteboard.

## 5. Privacy

The client's canvas screenshot contains **real photographs** (a motorbike, a
personal avatar), a real board name (`Whiteboard access check (Justin + Lance)`),
and a real teammate's first name. None of that is on the public site.

The board is `Q1 planning session`, the stickies are `Ship v2 in Q1`, `Hiring
plan` and `Pricing page`, and the collaborator is **Dana Whitfield** — the same
fictional Ridgeline/Company cast the other twelve feature pages and the home tour
already use. Our own user is Skylar Lewis, matching every other mockup.

## 6. Integration points touched

- `app/features/whiteboards/page.tsx` — new route and metadata.
- `components/WhiteboardsPage.tsx`, `components/WhiteboardsHeroTour.tsx` — new.
- `components/ReplacesStrip.tsx` — `whiteboards: [Miro]`.
- `components/Navbar.tsx` — a thirteenth feature, a `WhiteboardIcon`, colour
  `#1592AE`, placed second-to-last so AI Coach stays the closer. **The menu grid
  went from `grid-rows-4` to `grid-rows-5`**: at four rows, a thirteenth item
  spilled into a fourth column holding one entry and widened the dropdown.
- `components/AiCoachPage.tsx` — its comments said "the other eleven features";
  now twelve. `REACH` is a curated six and needed no new row.
- `components/StackTable.tsx` — a twelfth row, `was: 100`. See section 7.
- `components/PricingPage.tsx`, `components/StackStrip.tsx` — "Eleven tools" to
  "Twelve", four places, and a new `INCLUDED` line. See section 7.

## 7. The pricing table

Whiteboards is the **twelfth row** of `components/StackTable.tsx`, added
September 2026.

**The Miro figure: $100 a month.** That is Miro **Starter** at
$10/member/month, monthly billing, for ten members.

Two decisions sit behind it, and both are written into the row's comment so the
next person does not have to re-derive them:

- **Why Starter, not Free.** Miro Free is capped at *three editable boards* and
  has no private boards. Starter is the first tier with unlimited and private
  boards, granular sharing, and public visitor editing, which is what our
  sharing section actually claims. Business at $20 adds guests and SSO we do not
  claim, so it would overstate the comparison.
- **Why $10 and not the $8 on the page.** `miro.com/pricing` prints only
  *"$8/month per member, billed yearly"* and labels its own toggle *"Yearly
  (save 20%)"*, so the monthly rate is $8 / 0.8 = **$10**. Miro's help centre
  states the $10 monthly figure directly. Monthly is the right basis because the
  table's own footnote commits to it: *"each vendor's entry level paid plan at
  monthly list pricing for a team of ten"*. Miro Starter is the entry level paid
  plan, so the row follows the stated rule with no exception.

**What else moved with it:**

- `STACK_TOTAL` is a `reduce`, so the stack cost went from **$1,664 to $1,764**
  on its own. Nothing to hand-edit.
- The visible count is hardcoded, and **"Eleven tools" appeared four times
  across two files**, not the two the old note here claimed:
  `PricingPage.tsx` lines 327, 540 and 661, plus `StackStrip.tsx` line 77. All
  four now say twelve, and the tracking comment in `StackTable.tsx` names all
  four so the next row does not miss one again.
- `INCLUDED` in `PricingPage.tsx` gained *"Whiteboards and visual planning,
  included"*, because the new row claims **Included** and the plan's own list
  has to agree with it.

**`AS_OF` is deliberately still "August 2026".** The Miro row was checked in
September, but the other eleven were not re-checked. Moving the date would claim
a freshness the table does not have; leaving it understates by one month, which
is the safe direction. Bump it only when all twelve are re-verified.

## 8. Known inconsistency, not ours to fix

`INCLUDED` says *"CRM, pipelines, and follow-up included"*, but there is **no CRM
row on the comparison table** and no CRM feature page. That predates this work
and is a claim about what the product ships, so it is the client's call: either
the table is missing a row or the plan list is promising something the site does
not show anywhere else.

## 9. Mobile

The client's third September note was that *"some parts of it doesn't look
optimized"* on a phone. One real bug, and it was this page's alone.

**The page scrolled sideways.** At 390px the document was **490px wide**. The
`Section` grid children had the default `min-width: auto`, so a visual that
could not shrink below its content pushed the whole track wider than the
screen, and `ShareDemo`'s 170px rail was that visual. Fixed with `min-w-0` on
both grid columns plus a narrower rail on small screens.

Checked against the sibling feature pages at 390px: **none of the other twelve
overflowed**, so this was a Whiteboards defect rather than a house-wide one. It
now matches them exactly, including the hero tour's scale of 0.3408.

Three smaller things went with it:

- The board rail is **158px on a phone, 170px from `sm` up**. 170 ate half the
  card at phone width; below about 150 the labels "Shared with me" and "My
  department" truncate, and those two labels are what the section is arguing.
  158 is the width at which both survive, verified by comparing `scrollWidth`
  against `clientWidth` rather than by eye.
- The visibility pill on each board row is **icon only below `sm`**. The label
  pushed it off the edge of the card at 360px, and the panel underneath already
  spells the selected board's visibility out in full.
- The avatar on each board row is **hidden below `sm`**. It only repeats who
  shared the board, which the line under the title already says, and the 36px it
  cost was the difference between an 88px board name and a 52px one.

**Known and left alone:** at 360px the Multi AI swash still runs about 5px past
the edge. It is `whitespace-nowrap` so its underline stays on one line, and the
constraint lives in the shared `MultiAiWired`, not here. Our swash was shortened
from "somebody who finishes things." to "somebody who remembers." which brings
it to 23 characters, within a character of the longest one any other page uses
("somebody who reads it." on Agreements), so this page is no longer the outlier.
Fixing the remaining 5px means changing the shared component for all thirteen.
