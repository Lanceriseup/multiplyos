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

**Revised September 2026 on the client's review.** The first cut introduced the
collaborator as beat 5 of 6. The client's note was: *"make sure in the beginning
and throughout you show collaboration (another user in there moving his mouse
and adding things)"*. Fair, and it was the right criticism: presence arriving
five sixths of the way through a loop reads as a scripted cameo, and most
visitors never saw it at all.

So presence is no longer a beat. **Dana is on the board when it opens** and her
cursor never stops moving. Two drivers run concurrently, each owning exactly one
cursor:

**Ours,** the main loop:

1. A sticky lands and gets typed into, then a second one.
2. A connector joins them, so the board is a map and not a pile.
3. The pen draws a freehand loop around both.
4. Two photos are dropped onto the board together.
5. A pinned comment is left on Dana's second sticky and typed out.

**Dana's,** `mateScript`, running alongside all of that:

- Already on the canvas and drifting before we touch anything, with her avatar
  in the presence stack from the first frame.
- **Her first sticky** ("Q1 budget") added and typed while we are still writing
  our second, about 2.8 seconds in.
- **Drifting the whole way through**, along hand-placed waypoints that keep her
  in the right half of the canvas: clear of our pointer's path on the left, of
  the photo strip along the bottom, and of the minimap in the corner. Two
  cursors that overlap read as one cursor glitching.
- **Her second sticky** ("Pricing page"), the one we then comment on.
- Still drifting until our own pointer has finished.

Measured on the built page, over 44 samples across one 30-second loop: her
cursor is on screen in 44 of 44, occupies 33 distinct positions, and moves in
both the first and the last quarter. That is the client's "throughout", checked
rather than asserted.

### Why two drivers and not one sequence

Nothing but `mateScript` ever animates `mateRef`, and nothing but the main loop
ever animates `cursorRef`. That split is load-bearing. Two callers animating one
element through the Web Animations API race each other, and the loser strands
its cursor mid-canvas because it reads a start position that has already moved.

The two scripts meet at exactly one point: `mateAddedC`, a flag Dana sets when
her second sticky exists. The main loop waits on that flag before commenting
rather than trusting the two timelines to stay in step, so retuning any earlier
beat cannot send our pointer to comment on a sticky that is not there. A second
flag, `mainDone`, lets her keep drifting for as long as we are busy without
having to know how long that is.

### The rest of the chrome

The two photos in beat 4 are **drawn SVG landscapes, not stock photography**,
each with a filename caption underneath. The client's screenshot has two real
photographs on the board, and a real one here would both imply the board ships
with content and publish an image that is not ours to publish. Drawn ones still
read as placed images: rounded, shadowed, captioned.

Traced from the canvas screenshot: the `← Boards` crumb, the title, the presence
avatars, the palette, the **Saved** pill (which flips to *Saving…* while the
board is being edited and back at the end), the fourteen-tool rail, the dot
grid, the floating selection toolbar, the minimap and the zoom readout at 79%.
The minimap carries four marks now, two grey and two teal, so it shows the board
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
