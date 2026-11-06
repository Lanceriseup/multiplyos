# 2 Day CEO admin dashboard: reference for a MultiplyOS dashboard

Reference notes, not a spec. The 2 Day CEO campaign site has a working, password-protected
reporting dashboard at `https://www.2dayceo.com/admin/`. MultiplyOS will get its **own** dashboard
built around its own system (leads, demos, signups, billing, whatever we decide counts). This file
records how the 2DayCEO one works and what we learned building it, so the MultiplyOS version can
reuse the good patterns and skip the campaign-specific parts.

Source: GitHub `Rise-Up-Kings/2dayceo-web`, `main` at `4e8ba65` (2026-11-06). Its own docs go deeper:
`docs/ADMIN-DASHBOARD.md`, `docs/ADMIN-DASHBOARD-UI.md`, `docs/PAID-ADS-DASHBOARD.md`,
`docs/buyer-journey-reporting.md`.

---

## 1. What it is for

One page where staff can answer "how is the free-book campaign doing?" for any date range, without
logging into Stripe, GA4, Meta and Hyros separately. It was requested in September 2026 (Justin:
visitors, opt-ins, conversions and upsells; Jax: a visual `/admin` page grounded in Stripe). The
explicit lesson from that request: **sales alone was not enough**. Staff wanted the whole funnel,
from visit to upsell, in one place.

It is read-only. Nothing on the dashboard changes orders, campaigns or customer records.

## 2. What staff see

Five sections, one shared date bar on top.

| Section | Contents | Data source |
|---|---|---|
| **Overview** | Cards: 2DayCEO net revenue, paid book orders, audiobook bumps, KSP upsells, combined net revenue, each with "vs previous period". Daily trend charts below. | Order store (Stripe webhooks), GA4 for visitors/sessions |
| **Sales & orders** | Book shipping card, book buyer journey (bought book, reached offer page, bought KSP), full order table | Order store, MOS Inventory HQ (read-only) |
| **Paid Ads** | Meta spend, impressions, clicks, campaign and ad tables, cost per book purchase, cost per KSP purchase, Hyros attribution kept separate | Windsor.ai (Meta), Hyros |
| **Traffic** | Funnel checkpoints (landing, opt-in, checkout, offer page) and channel totals | GA4 Data API |
| **Search** | Google clicks, impressions, CTR, position, top queries | Google Search Console API |
| **Data health** | Status of every source plus a notices carousel; the nav badge counts warnings and errors (live showed "7 issues") | All of the above |

Shared controls:

- **Date bar:** Today, Yesterday, Last weekend, 7 / 14 / 30 / 90 days, custom range. One range drives
  every section, and the previous equal-length period is used for comparisons.
- The header line states the range, reporting timezone, data basis ("Stripe live records") and the
  comparison window, and flags "includes an incomplete current day".
- **Export this view:** CSV, Excel (.xlsx), Print / Save as PDF.
- Dark/light theme (only the theme choice is stored in the browser; no report data is).
- Small "i" tooltips explaining how each figure is counted.

## 3. How it is built

Stack: Vite + React site on Vercel, but the dashboard itself is a **static HTML page with plain
JavaScript** (`public/admin/index.html` plus helpers in `public/admin/*.js`), backed by Vercel
serverless functions.

| Piece | File | Job |
|---|---|---|
| Main report | `api/admin-metrics.js` | GA4, order store and Search Console for one date range, in one response |
| Paid ads | `api/admin-paid-ads.js` | Windsor and Hyros, loaded separately so slow ad APIs never block sales numbers |
| Book shipping | `api/admin-book-shipping.js` | Looks up each paid order in MOS Inventory HQ via the MOS MCP endpoint, read-only tools only |
| Login / logout | `api/admin-login.js`, `api/admin-logout.js` | Shared password, signed session cookie |
| Order store | `api/stripe-webhook.js` → Vercel KV (`2dc:order:*`) | Every Stripe payment event writes a reporting copy of the order |
| Keep-warm job | `api/cron-warm-windsor.js` (hourly) | Pre-loads each date preset so the Paid Ads tab does not time out |
| Report logic | `api/_lib/funnel-report.js`, `ga4.js`, `gsc.js`, `windsor-report.js`, `hyros-report.js`, `buyer-journey.js` | Source adapters and the maths |

### The order store is the backbone

Revenue figures are **not** live Stripe API calls. The Stripe webhook saves each order to KV, and
the dashboard reads that copy. This makes reports fast and lets the site attach its own fields
(product legs, internal/test flags, offer-page markers). The trade-off: KV is a reporting copy, not
the ledger, so the docs require reconciling totals against Stripe before quoting financial numbers.

### Each source succeeds or fails on its own

This is the most reusable design decision. Every source returns either data or
`{ available: false, note: "<reason>" }`. The page shows **"Unavailable"** with the reason in Data
health, and every other card still loads. A missing source is never shown as zero. Integrations
were connected weeks apart, so a dashboard that broke when one source was missing would have been
useless at launch.

### Access control

- One shared password (`ADMIN_PASSWORD`) and a signing secret (`ADMIN_SESSION_SECRET`).
- Signed, expiring, `HttpOnly`, `Secure`, `SameSite=Strict`, `__Host-` prefixed cookie.
- Login throttled to 8 attempts per 15 minutes via KV; fails closed if KV is down.
- Admin responses are never cached; no marketing tags load on the admin page.
- Known limit: no named users, so no record of who viewed what and no way to revoke one person.

### Environment variables (names only)

`ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `INTERNAL_EMAIL_PATTERNS`, `ADMIN_REPORT_TIME_ZONE`,
`KV_REST_API_URL`, `KV_REST_API_TOKEN`, `GA4_PROPERTY_ID`, `GA4_HOSTNAMES`,
`GA4_LEAD_EVENT_START_DATE`, `GSC_SITE_URL`, `GOOGLE_SA_CLIENT_EMAIL`, `GOOGLE_SA_PRIVATE_KEY` (or
the temporary `GOOGLE_OAUTH_*` set), `WINDSOR_AI_API_KEY`, `HYROS_API_KEY`,
`MOS_INVENTORY_READ_API_KEY`, `CRON_SECRET`.

## 4. Counting rules worth copying

- **State the definition next to the number.** Each card has a tooltip saying what it counts and
  what it does not.
- **Exclude staff and test orders** by email pattern (default `@riseupkings.com`, `+test`) and by
  Stripe mode; list the exclusions so they can be reviewed.
- **One reporting timezone** (GA4 property timezone, fallback `America/Chicago`), shown on the page.
  Sources with their own clock (Search Console and Meta use Pacific) are labelled as such.
- **Orders are grouped by original order date** (a cohort view). Later refunds change older days.
- **Never divide unlike things and call it a conversion rate.** GA4 sessions and Stripe orders are
  different units, so their ratio is labelled directional only.
- **Ad-platform conversions are not sales.** Meta "confirmations" and Hyros attributed revenue sit
  apart from verified Stripe revenue. Cost per purchase uses Meta spend divided by Stripe orders;
  ROAS is deliberately not calculated until attribution is reconciled.
- **Gaps stay gaps.** Missing chart days are not drawn as zero; rates are summed numerators over
  summed denominators, never averages of daily rates.
- **Tracking start dates.** When a metric only started being recorded on a given day, ranges before
  that show "unavailable", not zero.

## 5. What went wrong on the live 2DayCEO dashboard

As of the 2026-10-20 audit. Most of the "7 issues" come from these.

- **Paid Ads blank since 2026-10-17.** Windsor's Free plan allows 1 connected account; 12 were
  connected, so Windsor paused reads and returned placeholder rows. Lesson: a paid data relay is a
  hidden dependency. Watch its plan limits, and detect placeholder data explicitly.
- **Opt-ins switched off.** The GTM container never published the GA4 `generate_lead` (and other
  funnel) event tags, so GA4 never received them. Lesson: wiring the code is half the job; the tag
  manager publish step needs an owner.
- **Search Console not connected.** `GSC_SITE_URL` not set; property not yet verified.
- **Google data read as a person.** GA4 reads use Jax's personal OAuth token until a service account
  is granted access. The footer says so. Personal tokens can expire every 7 days if the OAuth consent
  screen is in Testing mode.
- **Cold-cache timeouts.** Windsor took 24 to 32 seconds on a cache miss, past the old budget. Fixed
  with the hourly warm-up job, a longer timeout and a 3-day "last good copy" in KV.

## 6. What carries over to MultiplyOS and what does not

**Reusable as patterns**

- Shell: section tabs, one date bar with presets and previous-period comparison, exports, tooltips,
  Data health with a notices badge, light/dark.
- The `available: false` + reason contract for every source.
- Separate endpoints for slow sources (ads) so they cannot block core numbers.
- Session and throttling approach (consider named users instead of one shared password).
- Source adapters: GA4, Search Console, Windsor/Meta, Hyros need only different IDs and keys.
- Stored "last good copy" for flaky third-party sources.

**2DayCEO-specific, do not copy**

- Book / audiobook / KSP / coaching-call product legs and revenue cards.
- Book shipping via Inventory HQ and the KSP buyer journey.
- The KV order store shape (`2dc:order:*`). MultiplyOS should decide its own source of truth first.

**Questions to settle before designing the MultiplyOS dashboard**

1. Which property: the marketing site (`multiplyos.com`), the product app (`app.multiplyos.com`),
   or both on one page?
2. What counts as a conversion: contact and demo leads in GoHighLevel, booked demos, coaching-call
   submissions, app signups, trial to paid, MRR?
3. Where does each number live (GHL, Stripe, app database, GA4), and is there an existing record we
   can read instead of building a reporting copy?
4. Who signs in, and do we need named users and an audit trail?
5. Which reporting timezone, and which staff/test accounts get excluded?

In this Next.js codebase the natural shape is an `app/admin` route with route handlers under
`app/api/admin/*`, rather than porting the static HTML page.
