# Admin dashboard (`/admin`)

A read-only, password-protected reporting page for staff: website leads, demo
bookings, traffic, search and paid ads for any date range. Modelled on the 2DayCEO
dashboard (see `docs/2dayceo-admin-dashboard-reference.md`), rebuilt for this
Next.js site and for MultiplyOS's own funnel.

## What staff see

One date button drives every tab: it opens a panel with the presets (Today,
Yesterday, Last weekend, 7/14/30/90 days) and a two-month calendar for any other
range (`components/admin/DateRangePicker.tsx`). Each figure is compared with the
period of the same length just before.

| Tab | Shows | Source |
|---|---|---|
| Overview | Website leads, demo requests, demos booked, coaching requests, contact form, event (RUKCON) leads, visitors, Meta spend; leads per day; demos per day; latest leads | GoHighLevel, GA4, Windsor |
| Leads & demos | Every lead in the range (filter by form), demos booked, demo outcomes by status, upcoming demos | GoHighLevel contacts + demo calendar |
| Paid ads | Spend, impressions, clicks, CTR, CPC, spend per demo request, spend per day, campaigns | Windsor.ai (Meta) |
| Traffic | Visitors, sessions, page views, leads per 100 sessions, sessions per day, channels | GA4 Data API |
| Search | Google clicks, impressions, CTR, position, top queries | Search Console API |
| Data health | Status of every source with the reason when one is missing; the nav badge counts sources that aren't fully working | All of the above |

Also: CSV export of the current tab, Print / Save as PDF, light/dark/system theme
(light by default, whatever the computer's setting; only the theme choice is kept in
the browser), and "i" notes on how each figure is
counted. The tab and range live in the address bar, so a view can be shared.

## Status as of 2026-11-06

- **GoHighLevel: live.** Uses the existing `GHL_*` vars. The token must also have
  `contacts.readonly` and `calendars/events.readonly` (it does today).
- **GA4: not connected.** The site has no GA4 tag yet, so there is nothing to read
  even once the keys are set.
- **Search Console: not connected.** Needs `GSC_SITE_URL` and the Google service account.
- **Meta ads: not connected.** Needs `WINDSOR_AI_API_KEY` and `WINDSOR_META_ACCOUNT_IDS`.

A source that isn't connected shows "Unavailable" with the reason. It is never shown
as zero, and everything else still loads.

## How it is built

| Piece | File |
|---|---|
| Sign-in guard (pages and API) | `middleware.ts` |
| Session cookie (HMAC-signed, 12 h, HttpOnly, SameSite=Strict, `__Host-` in production) | `lib/admin/session.ts` |
| Login throttle (8 failures / 15 min per IP, in memory) | `lib/admin/throttle.ts` |
| Login / logout | `app/api/admin/login/route.ts`, `app/api/admin/logout/route.ts` |
| Main report (leads, demos, traffic, search) | `app/api/admin/metrics/route.ts` |
| Paid ads (separate so slow ad APIs never block the rest) | `app/api/admin/paid-ads/route.ts` |
| Date ranges and timezone maths | `lib/admin/range.ts` |
| Source readers | `lib/admin/sources/{ghl,ga4,gsc,windsor,google}.ts` |
| Response shapes, `Source<T>` contract | `lib/admin/types.ts` |
| Page and sign-in screen | `app/admin/page.tsx`, `app/admin/login/page.tsx`, `components/admin/AdminLogin.tsx` (bento sign-in, `design/admin-login-options-v1.html` option 4), `app/admin/admin.css` |
| UI (bento tiles + liquid rail menu, chosen from `design/admin-nav-options-v1.html` option 2) | `components/admin/*` |
| Tests | `tests/admin.test.mjs` |

Nothing is stored: every figure is read from its source when the page loads.

## Counting rules

- **Leads** are GoHighLevel contacts with a website form tag, counted once on the day
  they were first added: `demo-request` (demo form), `coaching-call-request` /
  `mos-coaching-lead` (coaching form), `contact-form` (contact page). Other contacts
  in the location (for example the `mos-bblive-*` funnel) are not counted. Someone who
  uses two forms counts once in the total and once under each form.
- **Event leads** carry an approved event tag from `lib/event-tag.ts` (currently `rukcon`).
- **Staff and test emails are left out** (default `@riseupkings.com`, `+test`;
  override with `INTERNAL_EMAIL_PATTERNS`). Calendar events carry no email, so demo
  bookings are not filtered.
- **Demos booked** count by the day the booking was made; **demo outcomes** count by
  the day of the demo, using the status in GHL.
- **One reporting timezone** (`ADMIN_REPORT_TIME_ZONE`, default `America/Chicago`).
  Search Console (Pacific) and Meta (ad account timezone) keep their own clocks.
- **Ratios across systems are directional only** (leads per 100 sessions, spend per
  demo request). Return on ad spend is not calculated.
- **Gaps stay gaps.** Days a source has no data for are not drawn as zero.

## Environment variables

See `.env.example` for the full list with notes. Required for the page to work:
`ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, plus the existing `GHL_PRIVATE_TOKEN`,
`GHL_LOCATION_ID`, `GHL_CALENDAR_ID`. Optional: `ADMIN_REPORT_TIME_ZONE`,
`INTERNAL_EMAIL_PATTERNS`, `GOOGLE_SA_CLIENT_EMAIL`, `GOOGLE_SA_PRIVATE_KEY`,
`GA4_PROPERTY_ID`, `GA4_HOSTNAMES`, `GSC_SITE_URL`, `WINDSOR_AI_API_KEY`,
`WINDSOR_META_ACCOUNT_IDS`.

Without `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` the sign-in refuses everyone.

## Known limits

- One shared password: no named users, no record of who viewed what, no way to
  revoke one person. Rotating `ADMIN_SESSION_SECRET` signs everyone out.
- The login throttle is per server instance (no shared store on this site). A long
  random password is the real protection; move the throttle to KV/Upstash for a hard cap.
- GHL contact search stops at 10,000 results per period; the page warns if hit.
- No "last good copy" cache for Windsor yet (2DayCEO keeps one in KV for 3 days).
