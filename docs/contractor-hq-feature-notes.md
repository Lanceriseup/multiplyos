# Contractor HQ — feature page notes

Built November 2026. The fourth HQ Module page, after Events HQ, Inventory HQ
and People HQ.

Route: `/features/contractor-hq`.

## 1. What we were given

1. **Thirty-four screenshots of the module**, from the client's ABC
   Construction account with sample data on: the sidebar entry; Home; Schedule
   (Week and Map); Clients; Requests and one request; Quotes and one quote;
   Jobs and one job; New job and New project; Projects; Invoices; Payments;
   Pipeline; Insights; Expenses; Timesheets; the Create menu; search; and
   Settings (Company settings, Client hub, Team & crews, Projects, Estimating,
   Automations).
2. **The client hub from the client's side**: the request form, Quote #21 with
   Approve and Request changes, and an invoice with its Pay button.
3. **Help center text**: the Contractor HQ overview, and the MOS ContractorHQ
   crew app.
4. **Multi AI's own summary** of the module, with a suggested angle: keep the
   page about what the contractor's clients experience.

Everything on the page traces to one of those.

## 2. What the page does NOT claim

- **No estimating.** Settings → Estimating is off in the client's account, and
  what it describes when on (floors and rooms, a cost-code worksheet, live
  margin) is construction estimates, not Multi drafting one from a
  walkthrough. Multi AI said to check that before advertising it; the client
  said to leave it out for now.
- **No "Coming Nov".** The navbar card links to the page and its description
  changed from "Your contractors, organized." to "Requests, quotes, jobs and
  invoices.", since the module runs a contracting business rather than
  managing contractors. The pricing page still says "Coming in Nov"
  (`lib/pricing-copy.ts`, pinned by `tests/pricing-copy.test.mjs`) and was not
  touched. If the module is not live for customers yet, add
  `soon: "Coming Nov"` back to the card in `components/Navbar.tsx`, which also
  stops it navigating.
- **No appointment confirmation.** Multi AI's summary says clients confirm
  appointments in the hub; the screenshots show an Appointments page but no
  confirm button, so the page says clients can see their appointments.
- **Nothing about notifying the client on "On my way".** The help center does
  not say it.

## 3. The structure

A band under the hero for the flow the menu is built around (Request, Quote,
Job, Visit, Invoice), then six sections:

1. **Requests and quotes**: the request form, cost beside price, approval
   online, follow-ups, the Pipeline. The demo shows Quote #24 from both sides.
2. **Client hub**: the request form, a quote to approve, an invoice to pay,
   and appointments with the Show scheduled time setting.
3. **Jobs and the schedule**: one-off and recurring jobs, visits and crews, the
   dispatch map, and job costing as visits are completed.
4. **Projects**: phases, dependencies, a baseline, shift reasons, holidays,
   hand-offs, and the phases-only view the client sees.
5. **The crew app**: Today, On my way, the clock switching to the visit, photo
   markup, and getting paid on site.
6. **Invoices and payments**: Requires invoicing in one go, sending, and a
   payment from the client hub.

Then Multi AI, last as on every page.

The crew app section is the one section with **no screenshots behind it**; it
follows the help center article line by line. If the client can share phone
screenshots, check the demo against them.

## 4. The hero tour

`components/ContractorHqHeroTour.tsx`. Same architecture as the other tours.

The sidebar is Contractor HQ's own navy menu, not the Multiply OS one, because
the module opens in its own workspace. The loop follows one piece of work down
it: **Home**; **Requests**, where Elena Cruz's request from the client hub is
converted into a quote; **Quote #24**, emailed; the **Pipeline**, where it
moves to Approved when she approves it in the hub; the **Schedule**, where
Find a Time offers Crew A's free Friday morning; **Projects**, List then
Timeline; **Invoices**, where two closed jobs are invoiced in one go; and
**Insights**.

The row menu with "Convert to quote" and "Convert to job" is not in a
screenshot. The help center says each item converts into the next and that you
can skip ahead to a job, and the menu says no more than that.

Reduced motion shows Home.

## 5. Numbers that agree

- **Quote #24**, Elena Cruz, Kitchen backsplash: four lines, subtotal $1,607.00,
  tax at 8.25% $132.58, total $1,739.58, total cost $753.00. Same in the tour,
  the quote demo and the client hub demo.
- **Job #55**, Noah Bennett, Deck repair and stain: $2,180.00. Its visits are
  Mon Nov 2 and Tue Nov 3 on the tour's schedule; it is one of the two jobs
  under Requires invoicing in the tour and the invoice demo.
- **Project #18**, Owen Park, Kitchen remodel: starts Mon Oct 26, finishes
  Nov 27, or Dec 2 after the three-day cabinet delay, with Thanksgiving skipped.
  The tour's Projects list and the Multi AI insight use the same dates.
- **INV-0042**, Samuel Ortiz, $1,150.00, past due, in the tour and Multi AI.
- **Bathroom fan replacement**, Maya Lindqvist, $378.88, Wed Nov 4 at 2:00 PM:
  on Home's appointments, the schedule and the crew app demo.

## 6. Privacy

The client's screenshots carry their company name and logo, their staff and
test users, test clients with real-looking emails and a phone number, and
their office email and phone. None of it is on the page.

Everything is the fictional Ridgeline cast the other pages use (Dana
Whitfield, Marcus Hale, Priya Nair, Theo Barnes, Sam Ortega, Jordan Rivera,
Avery Rowe; clients Elena Cruz, Noah Bennett, Grace Okafor, Samuel Ortiz, Maya
Lindqvist, Owen Park, Hannah Reyes), under "Ridgeline Services". Addresses are
invented; emails are example.com and phone numbers are 555 numbers.

## 7. Integration points touched

- `app/features/contractor-hq/page.tsx`: new route and metadata.
- `components/ContractorHqPage.tsx`, `components/ContractorHqHeroTour.tsx`: new.
- `components/Navbar.tsx`: the Contractor HQ card gets its `href`, loses
  `soon`, and gets a new description.
