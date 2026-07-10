# MultiplyOS Marketing Website

Public marketing site for **multiplyos.com**. This repo is intentionally separate from the
MultiplyOS app ([Rise-Up-Kings/MultiplyOS](https://github.com/Rise-Up-Kings/MultiplyOS), served at
app.multiplyos.com) so the site can ship copy and design changes on its own cadence, with its own
Vercel project.

## What lives here vs. the app

| Here (multiplyos.com) | App repo (app.multiplyos.com) |
|---|---|
| Landing pages, pricing page (marketing), contact, FAQs | Signup, login, free-trial checkout, the product itself |
| Request Demo form → GoHighLevel | Stripe billing, user/company data |
| Book-a-call calendar (custom UI on the GHL calendar API) | — |

CTAs on this site point to:
- **Start free trial** → `https://app.multiplyos.com/signup`
- **Request a demo / Book a call** → the GHL form + Ashley's calendar (MOS sub-account)

## GHL wiring targets (for the demo form + calendar)

- Form fields to capture: **name, email, phone, company name** (phone matters — the app signup
  does not collect it).
- On submit: tag `mos-demo-request`, create the contact in the MOS GHL sub-account, opportunity
  in the "MOS Sales" pipeline at stage **New Lead**.
- Booking confirmed: tag `mos-demo-booked`, opportunity → **Demo Booked**.
- Full CRM design: internal doc `references/mos-crm/crm-design.md` in the chief-of-staff workspace
  (ask Justin).

## Deploy

Vercel project (to be created) → domain `multiplyos.com`. Push to `main` deploys production.
