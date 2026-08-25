# CFO Analytics / Finance HQ: how the real product works

Reference notes for the `/features/cfo-analytics` marketing page. Sources, August 2026:

1. Five screenshots of the live app: the Finance HQ disconnected state, the Addons & Integrations
   card, the QuickBooks consent modal, the Intuit sign-in hand-off, and the Manual Financial Data
   uploader.
2. The client's brief on what the page must show, in order.
3. The product's own description of Finance HQ, relayed through Multi AI.

House rules: **no em dashes** in site copy. Quoted UI strings below are verbatim, so several carry
the product's own em dashes and curly apostrophes. Do not copy that punctuation onto the page.

> **The load-bearing caveat.** The screenshots stop at the Intuit sign-in. **Nobody has seen the
> populated dashboard.** Every number, tile, chart, tab, and briefing on the marketing page is
> invented. It is invented to be *internally consistent* (see section 7) rather than accurate, and
> it must be checked against a real connected account before this page ships. What is *real* is
> listed in section 2. Everything else is a mockup and should be treated as one.

---

## 1. What it is called

The nav calls the feature **CFO Analytics**. The product calls the page **Finance HQ**, and the
integration that powers it **CFO Dashboard**. All three names are live at once, so the page uses:

- **CFO Analytics** as the feature name, because that is the nav slot and the URL
- **Finance HQ** for the page inside the product, because that is the heading in the screenshot
- **CFO Dashboard** only when quoting the integrations card

The product's own subtitle is the positioning line, and it is a good one:

> CFO-grade financial analytics powered by QuickBooks.

---

## 2. What is actually confirmed by the screenshots

This is the list the page is allowed to claim. It is short, and it is all verbatim.

### Finance HQ, disconnected

Heading `Finance HQ`, subtitle `CFO-grade financial analytics powered by QuickBooks.` Two buttons
top right: **`Business Valuation`** and **`Share`**. A dashed card holds the disconnected state:
`Reconnect QuickBooks`, `Your QuickBooks connection needs to be re-authorized to keep syncing.`, a
green `Reconnect in Settings` button, and below it `Don't use QuickBooks? Add data manually →`.

The `Ask Multi AI` pill sits bottom right, as it does on every screen in the product.

### The integrations card

> **CFO Dashboard**
> Live QuickBooks-powered financial analytics & AI briefings
> `Included with Multiply Scale Bundle`
> Connect your accounting system to sync your chart of accounts, profit & loss, and balance sheet data.
> `Connect QuickBooks`
> You'll be redirected to your provider to authorize access. We only request read-only accounting
> data. You can connect one accounting system at a time.

And a coming-soon row: `More integrations coming soon — Plaid Banking, Stripe Revenue, Gusto
Payroll, and more.` **Do not put Plaid, Stripe, or Gusto on the page as if they ship today.**

### The consent modal, `Connect QuickBooks Online`

The single richest screenshot, and the source of most of what the page can honestly claim.

**What we sync**
- `Chart of Accounts (account names, types, balances)`
- `Profit & Loss reports — last 6 months, monthly`
- `Balance Sheet reports — last 6 months, monthly`
- `Read-only. We never write to your QuickBooks.`

**How we use it**
- `Auto-populate metric values on your scoreboards from accounts you map`
- `Render financial dashboards (P&L, Balance Sheet, Cash Flow, KPIs)`
- `Generate AI financial insights using Anthropic Claude (model claude-sonnet-4-6). Anthropic does not retain your data for training.`

**Your control**
- `OAuth tokens are encrypted at rest (AES-256-GCM).`
- `Disconnect any time — or use "Delete all data" for a hard purge.`
- `We are an independent controller of this data, not Intuit's processor. We do not sell or share it with anyone other than the service providers listed in our Privacy Policy.`
- `This data is not used as a "consumer report." We are not a consumer reporting agency or furnisher under the U.S. Fair Credit Reporting Act.`

Then a required checkbox, `I have read the above and authorize Multiply OS to access my QuickBooks
Online data under these terms.`, and `Continue to Intuit`.

Three things worth pulling onto the page, because they are the objections a finance person actually
raises: **read-only**, **six months of history**, and **disconnect or hard-purge at will**.

### The Intuit hand-off

Standard Intuit sign-in. Confirms the connection is real OAuth to QuickBooks Online, not a file
import pretending to be one.

### Manual Financial Data

> Upload your Profit and Loss and Balance Sheet for a single month at a time. Use this when you
> don't have QuickBooks Online connected. Re-uploading the same month replaces the previous values.

Two cards, `Profit and Loss` and `Balance Sheet`, each `One CSV per month.` with a `Template`
download, a `MONTH` picker, a file chooser, an `Or paste CSV contents` disclosure, and an upload
button.

**This matters more than it looks.** It means the feature does not die if the customer is on Xero,
Sage, or a bookkeeper's spreadsheet. The page should say so, because "we only work if you use
QuickBooks" is the first objection.

---

## 3. What the product says Finance HQ is for

Relayed through Multi AI, so it is the product's framing rather than a screenshot:

- **Profit & Loss** revenue, costs, and profit over a period. Whether you are making money and where
  the money goes.
- **Balance Sheet** what you own, what you owe, what is left. A financial X-ray.
- **Cash Position** how much cash you actually have, *right now*.

And the argument, which is the best sentence in the whole brief:

> Profit and cash aren't the same thing. You can be profitable on paper but short on cash if money
> is tied up in unpaid invoices or inventory.

That is the page's emotional core. The mockup numbers in section 7 are built to *demonstrate* it
rather than assert it: a record profit month where cash still went down.

---

## 4. The client's running order

Verbatim, because the page follows it:

> Explain that with a quick connection to quickbooks they get CFO level analytics (Show the
> dashboard BIG 6, Then show trends and deep dive charts (at the bottom), then Show AI CFO Briefing
> example, then show overview page, then show P&L page with a last month and last 6 months view
> (Companies Manage their entire P&L), show transactions tab explaining that they can search any
> transactions intead of going to quickbooks, Also, show at bottom, how Multi AI Coach is connected
> (Show an example prompt).

Mapped onto sections:

| Client's ask | Section |
| --- | --- |
| quick connection to QuickBooks | 2. Connect it once |
| the BIG 6 | 3. The Big 6, tiles |
| trends and deep dive charts at the bottom | 3. same section, chart under the tiles |
| AI CFO Briefing example | 4. The briefing |
| overview page, then P&L with last month / last 6 months | 5. The statements, three tabs |
| transactions tab, search instead of QuickBooks | 6. Transactions |
| Multi AI Coach connected, with an example prompt | 7. the MultiAiWired closer |

**Replaces nothing.** The client was explicit. So this is the first feature page with **no
`ReplacesStrip` and no `ActZero` opening beat** in its hero tour. Do not add one.

---

## 5. The "Big 6"

The client named it but did not enumerate it. Six chosen to cover the product's own three pillars
(P&L, balance sheet, cash) with two tiles each:

| # | Tile | Comes from |
| --- | --- | --- |
| 1 | Revenue | P&L |
| 2 | Gross Profit, with margin | P&L |
| 3 | Operating Expenses | P&L |
| 4 | Net Profit, with margin | P&L |
| 5 | Cash on Hand | Balance Sheet |
| 6 | Runway | Cash divided by average monthly burn |

**Runway is the only derived one.** If the real product does not compute it, swap the tile for
Accounts Receivable, which the mockup already carries numbers for.

---

## 6. Things to be careful about

- **Do not claim real-time.** The consent modal says reports are pulled monthly, six months back.
  The page says "every sync", not "live to the second".
- **Do not name a compliance regime it does not claim.** The modal explicitly *disclaims* FCRA
  applicability. It claims AES-256-GCM at rest and read-only scope, nothing more. Say those two and
  stop.
- **Anthropic Claude is named by the product**, in the consent modal, along with the no-training
  commitment. The page may say the briefings are generated by Claude, because the product already
  tells the customer that at the point of authorisation.
- **Business Valuation is a real button** and nobody has seen what is behind it. Mention it as
  existing, do not describe what it does.
- **`Included with Multiply Scale Bundle`** is a packaging claim on the integrations card. The page
  does not repeat it, because pricing lives on the pricing page and may differ by plan.

---

## 7. The invented numbers, and why they hang together

One fictional services business, July 2026, carried across every mockup on the page so the sections
corroborate each other instead of contradicting each other. If any number changes, change it
everywhere.

**Six months, February to July 2026:**

| | Feb | Mar | Apr | May | Jun | Jul |
| --- | --- | --- | --- | --- | --- | --- |
| Revenue | 318,400 | 336,900 | 352,100 | 371,500 | 380,700 | 412,800 |
| COGS | 136,900 | 142,800 | 148,600 | 155,000 | 158,900 | 170,500 |
| Gross profit | 181,500 | 194,100 | 203,500 | 216,500 | 221,800 | 242,300 |
| Operating expenses | 141,200 | 148,300 | 152,900 | 161,700 | 166,300 | 186,400 |
| Net profit | 40,300 | 45,800 | 50,600 | 54,800 | 55,500 | 55,900 |
| Gross margin | 57.0% | 57.6% | 57.8% | 58.3% | 58.3% | 58.7% |
| Net margin | 12.7% | 13.6% | 14.4% | 14.8% | 14.6% | 13.5% |
| Cash | 281,200 | 296,800 | 312,500 | 328,900 | 340,500 | 318,400 |

Revenue less COGS equals gross profit on every column. Gross profit less operating expenses equals
net profit on every column. That arithmetic is the whole point: a finance buyer will check it.

**The three stories the numbers are built to tell**, which are also the three AI briefing findings:

1. **Gross margin is improving**, 57.0% to 58.7% over five months. Revenue grew 29.6% while COGS
   grew 24.5%, so delivery is getting more efficient. This is the good news.
2. **Operating expenses are outrunning revenue.** July: opex +12.1%, revenue +8.4%. Net margin
   peaked at 14.8% in May and has fallen to 13.5% on a *record* top line. This is the warning.
3. **Profit went up and cash went down.** July net profit 55,900, cash down 22,100. Receivables
   grew 55,800 to 241,800, and 68,400 of that is over sixty days. This is the payoff, and it is the
   product's own "profit and cash aren't the same thing" made arithmetical.

**July balance sheet**, which balances:

- Assets: cash 318,400 + receivables 241,800 + other current 34,600 + fixed assets net 96,200 = **691,000**
- Liabilities: payables 128,400 + credit cards 31,900 + accrued 42,700 + loan 148,000 = **351,000**
- Equity: **340,000**, and 351,000 + 340,000 = 691,000

**Runway**: 318,400 cash against roughly 43,000 average monthly burn gives 7.4 months. Burn here is
the cash decline, not the P&L loss, since the business is profitable.

**Transactions** are ten July rows across seven accounts. Three are `Software & Hosting` (AWS
4,182.40, Adobe 1,079.88, Figma 684.00) so that searching "software" in the mockup returns a real
subtotal of 5,946.28 rather than a hand-waved one.

---

## 8. Page status

- Route `/features/cfo-analytics`, nav label `CFO Analytics`, tile colour `#A16207` from the navbar.
  The page's own accent is the QuickBooks-ish green `#0F7B4F`, which is where the product's own
  buttons sit.
- **First feature page with no Replaces strip.** Client says it replaces nothing.
- **The entire populated dashboard is invented.** See the caveat at the top and the numbers in
  section 7. Screenshots of a connected account are the single most valuable thing anyone could add
  to this file.
- Unverified and therefore not claimed anywhere on the page: what Business Valuation produces, what
  the Cash Flow dashboard looks like, whether a Transactions tab exists at all in the shipped
  product, and whether Runway is computed. **Transactions is in the client's brief but not in any
  screenshot**, so it is described from the brief's own words: search transactions without going to
  QuickBooks.
