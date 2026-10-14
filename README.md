# MultiplyOS Marketing Website

Public marketing, feature, pricing, contact, demo-booking, and coaching-call site for MultiplyOS. This repository is separate from the product app so marketing work can be reviewed and deployed independently.

## Review links

| Link | Access / status |
| --- | --- |
| [Marketing website](https://multiplyos.com/) | Public production |
| [Implementation packages](https://multiplyos.com/implementation) | Public production; linked from the top navigation but `noindex` |
| [Coaching-call page](https://multiplyos.com/coaching-call) | Public production; form submission writes to GoHighLevel |
| [Start free trial](https://app.multiplyos.com/signup) | Separate product-app signup |
| [MultiplyOS app](https://app.multiplyos.com/) | Separate product; redirects to login |
| Vercel preview | Preview; the branch-specific link is posted on each pull request |

### Three-step review

1. Open the pull request's Vercel preview and follow only the pages changed by the pull request.
2. Review copy, navigation, responsive layout, and form fields without submitting the demo, contact, coaching, or booking forms; those endpoints can write contacts, notes, webhooks, or appointments in GoHighLevel.
3. Confirm the preview comment and checks point to the commit under review. A preview does not establish that production has deployed.

## What lives here vs. the app

| Here (`multiplyos.com`) | Product app (`app.multiplyos.com`) |
| --- | --- |
| Marketing home, pricing, implementation, feature, privacy, and terms pages | Signup, login, billing, company data, and the product itself |
| Contact and demo lead capture | Authenticated product workflows |
| Demo availability and appointment booking | — |
| Coaching-call qualification and optional booking handoff | — |

The current site exposes `/api/lead`, `/api/slots`, and `/api/book` for the demo/contact journey, plus `/api/coaching-lead` for the separate coaching journey. These are live integration routes, not mock forms.

## GoHighLevel wiring

### Demo and contact

- The demo form captures name, email, company, team size, and an optional message. It does not currently capture phone.
- `/api/lead` upserts a GoHighLevel contact and applies `website-lead` plus a source-derived tag such as `demo-request` or `contact-form`.
- Extra answers use configured custom fields when available and are also retained in a contact note.
- A successful demo lead can continue to the in-page calendar. `/api/slots` reads availability and `/api/book` creates the appointment.
- The repository does not create or advance a sales opportunity in these routes.

### Coaching call

- `/coaching-call` captures contact and qualification fields through `/api/coaching-lead`.
- The route sends an independently configured inbound-webhook payload and attempts a contact upsert with `coaching-call-request` and `mos-coaching-lead` tags.
- Qualification answers are mirrored to a contact note and can map to configured custom fields.
- When configured, the response includes a prefilled coaching-calendar handoff.

### Contact names are required

`/api/lead` requires a non-blank name and `/api/coaching-lead` requires a non-blank first and last name; both return 400 before any GoHighLevel write. If a contact is ever upserted without a name anyway, `upsertContact` still saves it and logs `MULTIPLYOS_WEBSITE_CONTACT_NAME_MISSING` at error level with the contact id only. `npm test` covers this with a mocked `fetch`.

Server-side configuration is documented in [`.env.example`](.env.example). Never commit tokens, webhook URLs, customer data, or copied production payloads.

## Routes

- `/`, `/pricing`, `/contact`
- `/implementation` is linked from the top navigation but marked `noindex`, so it stays out of search results
- `/coaching-call` and `/coaching-call/thank-you`
- `/rukcon` redirects to the app's trial, and exists only while the pricing v2 switch is on (see below)
- `/features/*` for the individual product capabilities
- `/privacy` and `/terms`

The source of truth for page routes is the `app/` directory.

## Local development

```bash
npm install
npm run dev
```

The site uses Next.js 15, React 19, TypeScript, Tailwind CSS, and Framer Motion. Copy `.env.example` to `.env.local` only when integration work requires local credentials; public page review does not require submitting forms.

## Pricing v2 switches

The three plan pricing (GROW, SCALE, MULTIPLY) is built behind two build time flags. Both are read in `lib/pricing-v2-switch.mjs` (the typed door is `lib/pricing-v2.ts`), and only the value `1` or `true` turns one on.

- `NEXT_PUBLIC_PRICING_V2` is the main switch. Unset, the site is exactly as it was: the single $299 pricing page, Sign up buttons, and no `/rukcon`.
- `NEXT_PUBLIC_PRICING_V2_ANNUAL` only does anything while the main switch is on. Set, the site offers annual billing. Unset, it launches monthly only. Keep it unset until counsel approves the annual consent text, because the app blocks annual checkout until then.

With the main switch on:

- `/pricing` renders `components/PricingTiersPage.tsx`. Prices and the math are in `lib/pricing-tiers.ts`; the words are in `lib/pricing-copy.ts`.
- Every Sign up button becomes Start free trial and links to the SCALE trial in the app (`/trial/signup?plan=scale&billing=annual`, or `billing=monthly` when annual billing is off). Every link into the app is built in `lib/app-links.mjs`.
- The home page's stack comparison stops quoting $299 and says what SCALE costs for a team of ten.
- `/rukcon` redirects (307) to the SCALE trial with the RUKCON code applied, on the same billing. Ashley names the final code; it is `RUKCON_PROMO_CODE` in `lib/app-links.mjs`.

With annual billing on, the pricing page opens on Annual with a Monthly toggle and "Save up to 25%", and Launch onboarding is included with annual MULTIPLY only. With it off, the page shows monthly prices only, has no toggle, and says nothing about annual billing or about Launch being included.

Turn the main switch on only after the app's `pricing_v2` switch is on, because the trial links lead to the app's `/trial/signup`. Set the variables in the Vercel environment (not as Sensitive) and redeploy; both are read at build time. `npm test` checks that each is read in one place only.

## Deployment

The Vercel project and `multiplyos.com` production domain already exist. Vercel's Git deployment integration is disabled in `vercel.json`; GitHub Actions creates pull-request previews and deploys pushes to `main` through the shared Vercel workflow.

Preview and production deployment are separate events. A successful preview or merge is not by itself evidence that the production deployment completed.
