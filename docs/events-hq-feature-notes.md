# Events HQ — feature page notes

Built October 2026. The first HQ Module to get its own page after SOP HQ, and
the first page linked from the new HQ Modules band in the Features menu.

Route: `/features/events-hq`.

## 1. What we were given

1. **Fifteen screenshots of the module**: the Events HQ sidebar; the Events,
   Calendar (year view), Overview Calendar, Registrations, Coaches and Templates
   tabs; one event's record (countdown, date, registrations, budget, the stage
   bar, the Tasks tab); the Agenda Library; Client Portal settings (brand,
   portal address, welcome page, text and email messages); and Events HQ
   settings (sharing, event types, attendee shirts).
2. **Multi AI's own summary of the module**: planning, registrations and roster,
   running the day from a run-of-show sheet, inventory held from Inventory HQ and
   checked back in, and a contact's Events card showing every registration and
   role across events.

Everything on the page traces to one of those two. No pricing, limits or
performance claims, and no integrations beyond the Ontraport contact group the
screenshots show.

## 2. What the page does NOT claim

- **No "promote".** The navbar card first read "Plan, promote and run every
  event". Nothing we were given covers marketing or promotion, so it now reads
  "Plan, staff and run every event."
- **No ticketing or payments.** The AI summary mentions pricing as an event
  field; the page does not claim Events HQ takes payments.
- **No tool replaced.** No "This replaces" chip, because the client named no
  tool. Add one to `REPLACES` in `components/ReplacesStrip.tsx` if they do.
- **No progression rules.** The AI summary talks about attendees needing one
  event before another. The page says a contact's record *shows* their history;
  it does not claim Events HQ enforces eligibility.

## 3. The five sections, and why five

Events HQ is a whole department rather than one tool, so it runs to five
sections where the single-feature pages run to four, in the order an event
happens:

1. **Every event, one calendar**: year / month / list, colour by event type,
   filters, PDF export, protected days, and the Overview Calendar.
2. **Plan by stages**: stages from six months out to the week of, tasks,
   templates, and the Agenda Library.
3. **Registrations and staffing**: rosters, coaches and volunteers (team or
   external; approved, pending, declined), a contact's event history, and the
   Ontraport contact group.
4. **The client portal**: brand, own address, welcome page, and the Invite /
   New event / Reminder / Follow-up messages with a one-time login link.
5. **Budget and inventory**: plan, spend and P/L; budget access; stock held
   from Inventory HQ; and the banner for a finished event still holding stock.

Multi AI is last, as on every page.

The portal card's **Invite** text follows the client's own default nearly word
for word. The other three messages and all four email subjects are written in
the same voice; the screenshot only shows the Invite tab.

## 4. The hero tour

`components/EventsHqHeroTour.tsx`. Same architecture as the other tours: the
screen is React state, only the cursor and ripple animate through the Web
Animations API, and the loop is generation-token guarded.

The loop walks the module the way a manager would, using every screen the
client sent:

- **Across the top tabs**: Events → Calendar (year view) → Overview Calendar
  (planning, staffing and coaches grid) → Registrations (a new one lands) →
  Coaches (a pending volunteer gets approved) → Templates → back to Events.
- **Into one event**: Leaders Summit 2026 opens; registrations climb to 137 of
  140; the stage's three open tasks get ticked off and the bar moves on. Then
  **Details** (dates, type, capacity, ticket price, owner, landing page link),
  **Agenda** (multi-day run of show with coloured groups and notes and cues,
  then View / Share agenda → text and email it to the coaches), **Client
  Portal** (attendee table with portal status, forms, shirt size, hotel and
  welcome box carrier and tracking; a hotel gets booked) and **Inventory**
  (attendee shirt sizes synced from the attendee list, per-person items scaled
  to attendance, a shortage flagged).

Screens fade out quickly and the next fades in after, rather than a straight
crossfade, so two tables never ghost through each other.

The View / Share agenda menu is traced from a later client screenshot: View
agenda, Open the shared agenda, Share agenda…, then "Text & email the agenda
to" Volunteers… and Coaches….

**The Events HQ icon** is the app's own: a calendar with a grid of days. It is
used in the navbar card, the hero badge and the tour's sidebar. Team Meetings
keeps its lined calendar, so the two stay distinguishable.

**Reduced motion** shows the finished record (stage moved on, tasks done). The
scene starts BLANK on the first render and the effect swaps in STILL after
mount, so the server and client render the same thing. The older tours start
from `reduce ? STILL : BLANK`, which fails hydration for reduced-motion visitors
(React recovers by re-rendering on the client). Worth fixing house-wide.

## 5. Privacy

The client's screenshots carry real event names, real attendees with phone
numbers and emails, real coaches and volunteers, a real budget, and Rise Up
Kings' own portal brand and domain. None of it is on the page.

Everything is the fictional Ridgeline cast the other pages use: Dana Whitfield,
Marcus Hale, Priya Nair, Jordan Rivera, Theo Barnes, Avery Rowe, and Skylar
Lewis's company, Ridgeline Services. Registrants (Elena Cruz, Noah Bennett,
Grace Okafor, Samuel Ortiz) are new and equally fictional. Events are generic:
Leaders Summit 2026, Founders Retreat, Sales Bootcamp, Leadership Intensive,
Winter Gala, Q1 Kickoff. The portal is "Ridgeline Portal" at
portal.ridgeline.com.

## 6. Integration points touched

- `app/features/events-hq/page.tsx`: new route and metadata.
- `components/EventsHqPage.tsx`, `components/EventsHqHeroTour.tsx`: new.
- `components/Navbar.tsx`: the Events HQ card gets its `href`, its corrected
  description, and the app's Events HQ icon.

Not touched: `StackTable.tsx` and the pricing copy. `lib/pricing-copy.ts`
already lists Events HQ ("Registration, attendee management and event
portals"), which the page agrees with.

## 7. Mobile

Checked at 390px with the DevTools protocol (real time, not virtual time, so the
scroll reveals actually fire): the document is exactly 390 wide, so nothing
scrolls sideways.

- Section cards are **440px at every width**. 400 on a phone clipped the last
  volunteer in the People card and the calendar's Next up rows.
- The calendar shows **two months on a phone**, three from `sm` up, and two Next
  up rows instead of three. Its footer drops the legend and shortens the button
  to "PDF", or it wrapped to three lines.
- The stage chevrons print short labels ("6 mo" ... "Week of"); the picked
  stage's full name is spelled out under them. The bar scrolls sideways inside
  the card below 480px.
- The People tabs read Registrations / Staff / History on a phone.
- The budget card drops its line items on a phone; the held stock is what the
  banner is about, so that half stays.
- The portal card hides the dark portal preview on a phone; the message is the
  part that has to read.
