# People HQ — feature page notes

Built November 2026. The third HQ Module page, after Events HQ and Inventory HQ.

Route: `/features/people-hq`.

## 1. What we were given

1. **Twenty-four screenshots of the module**: the Overview (header, journey
   cards, Needs your attention, hiring pipeline, new hires); Hiring's dashboard
   (candidates and positions), Start Hiring menu, Applicants by Stage, Hiring
   Pipeline Templates, Hiring Settings (hiring managers, coordinators and
   recruiting admins, hiring approvals, default benefits), the position planner
   and one candidate's profile with its funnel; Performance Reviews (cycles, My
   team, the 360 Feedback tab, review questions); Engagement Surveys (empty
   state and the New survey template picker); Certifications / Trainings
   (tracker, manage, to verify); People Reports (all three views, empty); and a
   close-up of the sidebar.
2. **Help center text**: the People HQ overview, the Overview page, and Hiring.
3. **Multi AI's own summary** of the module, with a suggested page structure.

Everything on the page traces to one of those.

## 2. What was empty, and drawn from the text

The client's account has no review cycle running and no survey closed, so
these screens were empty states. They follow the help center's description and
the look of the screens that were not empty:

- **Survey results**: Engagement Index, eNPS, participation, drivers with focus
  areas, and the heatmap by department.
- **A review being written**, with the Evidence panel (1on1s, recognition,
  People Alignment, scoreboard, tasks) and mid-year goal ratings (Ahead, On
  track, At risk, Off track).
- **The 360 report**: self against others, and the gap.
- **The Performance Chart** with people plotted, on the axes and labels the
  empty chart shows (Value: Limited, Solid, Essential; Engagement: None,
  Medium, High).

## 3. What the page does NOT claim

- **No plan names.** The help center says Hiring is part of the "Multiply Scale
  Bundle", which the pricing page no longer calls anything. The page says Hiring
  has its own access and leaves plans out.
- **No definition of "misaligned".** The Performance Chart has a Show only
  misalignments filter, but nothing we were given says how a misalignment is
  decided, so the page names the filter and stops there.
- **No DISC.** DISC has its own page; this one does not repeat it.
- **Nothing about Multi AI and anonymity.** The page does not claim Multi AI is
  kept from individual survey answers; nothing we were given says either way.
- **No FAQ or access band.** Multi AI suggested an FAQ; the other HQ pages have
  none. A three-column band on who runs People HQ (owner and Admins, Hiring's
  own access, everyone else under My HQ) and a DISC link sat after the
  sections at first; the client asked for it to come out.

## 4. The structure

A band under the hero for the employee journey the Overview is built around
(Attract, Onboard, Grow, Engage), then five sections, one per page that does
the work:

1. **Hiring**: the funnel from Plan to Onboarding, candidate rating, offer
   approval, onboarding from a template.
2. **Performance reviews**: the Evidence panel, then second-level approval,
   release, the review conversation as a 1on1, acknowledgement, and a
   development plan that Make tasks turns into tasks.
3. **360 feedback**: groups from the org chart, external raters by email, and
   groups that only appear once three people have answered.
4. **Engagement surveys**: the anonymity minimum (3, 4, 5, 7 or 10, with 5
   recommended) hiding small teams on the heatmap, live.
5. **Certifications and trainings**: the tracker, the Needs attention switch,
   and verifying a card someone added themselves.

Then Multi AI, last as on every page.

## 5. The hero tour

`components/PeopleHqHeroTour.tsx`. Same architecture as the other tours.

The loop follows the sidebar: the **Overview**; **Hiring** and its Start
Hiring menu; **Applicants by Stage**, where a finalist moves to Waiting on
Offer Letter and the offer goes for approval; **one candidate**, whose rating
fills in before they move on to Reference Check; **Performance Reviews**, then
a manager review typed beside the Evidence panel and submitted; **Engagement
Surveys** results; **Certifications**, where a card someone added gets
verified; and **Reports**, the Performance Chart.

The People HQ icon is the app's own, two people, which the navbar card already
used. Reduced motion shows the Overview.

## 6. Numbers that agree

42 people in 6 departments, 4 open roles, 23 candidates, 3 onboarding. The
FY2026 Annual Review is 68% done. Q3 Team Engagement closed Oct 3 with 37 of 42
answered (88%), an Engagement Index of 74% (up 6 from Q2) and an eNPS of +32;
its heatmap numbers are the same in the tour and in the surveys card.

## 7. Privacy

The client's screenshots carry real candidates with their emails and phone
numbers, real staff names and emails, real role names, a real benefits package
and real interview recordings. None of it is on the page. The Certifications
sample data in the screenshots was already fictional, but the page uses the
Ridgeline cast anyway so it reads as one company: Dana Whitfield, Marcus Hale,
Priya Nair, Jordan Rivera, Theo Barnes, Avery Rowe, with new candidates (Nora
Castillo, Ben Archer, Leah Kim, Omar Haddad, Ruby Chen) and crew (Sam Ortega).
Emails are example.com and phone numbers are 555 numbers.

## 8. Integration points touched

- `app/features/people-hq/page.tsx`: new route and metadata.
- `components/PeopleHqPage.tsx`, `components/PeopleHqHeroTour.tsx`: new.
- `components/Navbar.tsx`: the People HQ card gets its `href`.

Not touched: the pricing copy, which already describes People HQ as "Hiring,
performance reviews, engagement surveys and certifications".

## 9. Mobile

Checked at 390px through the DevTools protocol: nothing scrolls sideways.
Section cards are 440px at every width. The certifications grid uses
`minmax(0, …)` columns and 8.5px cells on a phone so card numbers fit whole.
