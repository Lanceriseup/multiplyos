# CFO Analytics / Finance HQ: how the real product works

Reference notes for the `/features/cfo-analytics` marketing page. Sources, August 2026:

1. Five screenshots of the connection flow: the Finance HQ disconnected state, the Addons &
   Integrations card, the QuickBooks consent modal, the Intuit sign-in hand-off, and the Manual
   Financial Data uploader.
2. **Ten screenshots of the populated app** (added later, and they replace most of what used to be
   guesswork here): CFO View / Big Picture, Overview, Profit and Loss, Balance Sheet, Key Ratios,
   Transactions, Class, AI Insights, two steps of the Business Valuation wizard, and the valuation
   result screen. See sections 9 and 10.
3. The client's brief on what the page must show, in order.
4. The product's own description of Finance HQ, relayed through Multi AI.

House rules: **no em dashes** in site copy. Quoted UI strings below are verbatim, so several carry
the product's own em dashes and curly apostrophes. Do not copy that punctuation onto the page.

> **What is still invented.** The populated screenshots settled the layout, the tab set, the card
> anatomy and the figures. Three things on the marketing page are still ours:
>
> 1. **The Finance HQ password gate.** The client says the feature requires a second password on top
>    of the account login. Nobody has screenshotted that screen, so the lock in the hero tour and in
>    section 2 of the page is our rendering of a real requirement. Claim the requirement, not the
>    pixels, and do **not** claim a per-member permission model on top of it.
> 2. **The AI briefing prose.** The AI Insights tab ships empty until an account is connected, and
>    the product's own copy points at the CFO View for sample insights. So the briefing text is
>    written by us, against figures that appear elsewhere on the page.
> 3. **The QuickBooks sync screen.** The connection flow is screenshotted up to the Intuit hand-off
>    and picks up again at a populated dashboard. What the app shows *between* those two is unseen,
>    so the progress screen in the hero tour is ours. Its five line items are not: they are the
>    consent modal's own scope plus the Transactions tab's own line count.
>
> Everything else on the Business Valuation beat, including the $1.37M headline, is now read off a
> real result screen. See section 10.

---

## 1. What it is called

The nav calls the feature **CFO Analytics**. The product calls the page **Finance HQ**, and the
integration that powers it **CFO Dashboard**. All three names are live at once, so the page uses:

- **CFO Analytics** as the feature name, because that is the nav slot and the URL
- **Finance HQ** for the page inside the product, because that is the heading in the screenshot
- **CFO Dashboard** only when quoting the integrations card

The product's own subtitle is the positioning line, and it is a good one:

> CFO-grade financial analytics powered by QuickBooks.

**But the connected app shortens it to `CFO-Grade Analytics`.** The hero tour uses the short form,
because that is what a customer with data actually sees; the long form is still fine in prose.

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

That framing survives, but the sample ledger tells a different and better version of it. July
revenue fell 6.6% and net margin still went up, because gross margin improved and receivables came
in. Same lesson, opposite direction: the headline number moving down is not the same as the business
getting worse. The page is built on that, and the figures in section 7 demonstrate it rather than
assert it.

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
| the second password on top of the account login | 2. Locked by default |
| quick connection to QuickBooks | 3. Connect it once |
| the BIG 6 | 4. The Big Six, tiles |
| trends and deep dive charts at the bottom | 4. same section, chart under the tiles |
| AI CFO Briefing example | 5. The briefing |
| overview page, then P&L | 6. The statements, plus Balance Sheet and Key Ratios |
| transactions tab, search instead of QuickBooks | 7. Transactions |
| show the Business Valuation somewhere | beat 7 of the hero tour |
| Multi AI Coach connected, with an example prompt | 8. the MultiAiWired closer |

Three departures from the letter of that brief, all deliberate:

- The client asked for a **last month / last 6 months** toggle on the P&L. The shipped tab has a
  **Compare** control instead, so the page shows July against June rather than six columns.
- The **Overview** tab does not get a section. Its four KPI cards duplicate the Big Six, and a third
  mockup of the same numbers earns nothing.
- **There is no catch-all section** for the tabs the page does not visit. One existed briefly, a
  grid of one-sentence cards headed "Four more tabs nobody opens a second app for", covering Class,
  Business Valuation, Overview, AI Insights, Ask CFO Coach, Shared P&Ls and Set Goals. It was cut:
  after seven sections of showing, a feature list reads like telling. **Do not add it back.** If one
  of those tabs deserves the page's attention, it deserves a section with a working mockup, the way
  the other seven have one. Business Valuation already has beat 7 of the hero tour.

**Replaces nothing.** The client was explicit. So this is the first feature page with **no
`ReplacesStrip` and no `ActZero` opening beat** in its hero tour. Do not add one.

---

## 5. The Big Six

**Confirmed by the Big Picture screenshot.** The client named it, the screenshot enumerated it, and
the enumeration is not what we had guessed. The real six, in the order the app lays them out:

| # | Card | Jul 2026 | Goal | Verdict |
| --- | --- | --- | --- | --- |
| 1 | Revenue | $178.9K | $175K | Above goal, $3.9K |
| 2 | Profit | $34K | $32K | Above goal, $2K |
| 3 | Profit Margin | 19.0% | 18.0% | Above goal, 1.0 pts |
| 4 | Operating Cash Flow | $32.7K | $30K | Above goal, $2.7K |
| 5 | Gross Margin | 69.7% | 70.0% | To goal, 0.3 pts |
| 6 | Operating Expenses (OpEx) | $81.1K | $72K | Over budget, $9.1K |

**Runway is not one of them.** Neither is Cash on Hand. Do not put either back.

The card anatomy is the important part, and it is the page's best argument:

- a **goal chip** top right, showing the target the owner set
- the month, the value, and a delta chip against the prior month
- a filled six-month sparkline
- a **goal footer**: the goal on the left, and on the right `ABOVE GOAL` / `TO GOAL` / `OVER BUDGET`
  with the distance to it

So every number arrives pre-judged. The subtitle in the app is "The Big Six — every metric measured
against your own goal." Recast without the em dash when quoting it.

Alongside them: a **HEALTH SCORE** of `79/100` and an **ACTIVE WARNINGS** count of `0`.

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
- **The password gate is a real requirement with an invented screen.** Claim that Finance HQ needs a
  second password on top of the account login. Do not claim who can grant it, that it re-locks on
  sign-out, or anything else about how it is administered.
- **Business Valuation is fully screenshotted now**, wizard and result. Section 10 has the figures.
  Note that its result screen says **B2B SaaS**, while the Step 1 screenshot from a different
  session had Marketing / Creative Agency selected. The page uses B2B SaaS, because that is what the
  screen showing the number says.
- **`Included with Multiply Scale Bundle`** is a packaging claim on the integrations card. The page
  does not repeat it, because pricing lives on the pricing page and may differ by plan.

---

## 7. The numbers, and why they hang together

These are the product's **own sample ledger**, read off the screenshots, not invented. That is worth
saying twice: a prospect who starts a trial sees these exact figures before connecting anything, so
the page and the product agree. July 2026 is the last closed month throughout.

**Twelve months of revenue**, Aug 2025 to Jul 2026, because Revenue per Employee is a trailing
twelve-month figure and has to reconcile:

| Aug 25 | Sep 25 | Oct 25 | Nov 25 | Dec 25 | Jan 26 |
| --- | --- | --- | --- | --- | --- |
| 152,900 | 166,400 | 178,200 | 198,760 | 173,100 | 186,540 |

| Feb 26 | Mar 26 | Apr 26 | May 26 | Jun 26 | Jul 26 |
| --- | --- | --- | --- | --- | --- |
| 172,135 | 209,880 | 202,640 | 197,900 | 191,505 | 178,865 |

Sum: **2,208,825**. Divided by the 5-person headcount in the Key Ratios card: **$441,765**, which is
the figure the screenshot shows. That is the constraint that fixes the whole series.

**July 2026, the P&L**, verbatim off the Profit and Loss tab:

| Line | Amount | % of income |
| --- | --- | --- |
| Services Revenue | 98,068.00 | 54.83% |
| Recurring Subscriptions | 46,102.00 | 25.77% |
| Product Sales | 20,752.00 | 11.60% |
| Training & Workshops | 13,943.00 | 7.80% |
| **Total Income** | **178,865.00** | 100.00% |
| Direct Labor | 25,396.00 | 14.20% |
| Materials | 16,371.00 | 9.15% |
| Subcontractors | 8,128.00 | 4.54% |
| Shipping & Freight | 4,234.00 | 2.37% |
| **Total Cost of Goods Sold** | **54,129.00** | 30.26% |
| **GROSS PROFIT** | **124,736.00** | 69.74% |
| Salaries & Wages | 30,398.00 | 16.99% |
| Payroll Taxes & Benefits | 8,171.00 | 4.57% |
| Marketing | 7,529.00 | 4.21% |
| Rent | 6,861.00 | 3.84% |
| Software & Subscriptions | 5,862.00 | 3.28% |
| Depreciation | 4,200.00 | 2.35% |
| Professional Fees | 3,714.00 | 2.08% |
| Travel & Meals | 3,271.00 | 1.83% |
| Insurance | 2,950.00 | 1.65% |
| Utilities | 1,925.00 | 1.08% |
| Interest Expense | 1,850.00 | 1.03% |
| Bank & Merchant Fees | 1,578.00 | 0.88% |
| Repairs & Maintenance | 1,452.00 | 0.81% |
| Office Supplies | 1,363.00 | 0.76% |
| **Total Expenses** | **81,124.00** | 45.35% |
| **NET OPERATING INCOME** | **43,612.00** | 24.38% |

Then the July income tax accrual of **9,595** (journal `JE-2026-07-TAX` on the Transactions tab)
takes net operating income to **net income 34,017**, which is 19.0% of revenue. That is the Overview
tab's Net Income card, and the Big Six Profit and Profit Margin cards. It all foots.

**Where the hero tour trims.** The tour's P&L leaves Cost of Goods Sold collapsed and rolls the
eight smallest expense accounts into one `8 more expense accounts` row at 18,103.00 (10.12%), purely
so eighteen rows fit the stage. The page's own statement shows all twenty-eight.

**June 2026**, derived so the compare column and every delta chip agree:

- Revenue **191,505** (July is -6.6%)
- Gross margin **68.9%**, so gross profit **131,947** and COGS **59,558** (July is +0.8 pts)
- Total expenses **86,302** (July is -6.0%)
- Net operating income **45,645** (July is -4.5%)
- Net income **35,620**, an 18.6% margin (July is +0.4 pts)

**Balance Sheet, as of Jul 31 2026** against Jun 30, verbatim where the screenshot shows it and
derived where it does not:

| Line | Jul 31 | Jun 30 | Change |
| --- | --- | --- | --- |
| Operating Checking | 339,087 | 334,162 | +4,925 |
| Savings | 145,323 | 143,212 | +2,111 |
| **Total Bank Accounts** | **484,410** | **477,374** | **+7,036** |
| Accounts Receivable | 164,556 | 176,224 | -11,668 |
| Inventory Asset | 21,652 | 23,832 | -2,180 |
| **Total Current Assets** | **670,618** | **677,430** | **-6,812** |
| Equipment | 108,000 | 108,000 | 0 |
| Furniture & Fixtures | 72,000 | 72,000 | 0 |
| **TOTAL ASSETS** | **850,618** | **857,430** | **-6,812** |
| Accounts Payable | 35,184 | 38,726 | -3,542 |
| Visa Credit Card | 12,000 | 12,000 | 0 |
| **Total Current Liabilities** | **62,796** | **66,338** | **-3,542** |
| **TOTAL LIABILITIES** | **139,779** | **143,321** | **-3,542** |
| **TOTAL EQUITY** | **710,839** | **714,109** | **-3,270** |

Liabilities plus equity equals total assets on both columns. Current liabilities of 62,796 is the
figure that makes the Key Ratios current ratio come out at **10.68x**, so it is fixed, not free.

**Key Ratios**, all seven verbatim, each with its shipped target:

| Ratio | Value | Target | State |
| --- | --- | --- | --- |
| Gross Margin | 69.7% | > 50% | green |
| Net Profit Margin | 19.0% | > 10% | green |
| Revenue per Employee | $441,765 | higher is better | green |
| Current Ratio | 10.68x | 1.5x to 3.0x | green |
| Debt-to-Equity | 0.20x | < 2.0x | green |
| OpEx Ratio | 45.4% | lower is better | amber |
| Return on Assets | 4.0% | > 5% | amber |

**Class**, off that tab: top class by revenue **Consulting, $1,003,073**; highest gross margin
**Consulting, 75.1%**; **4** active classes in the twelve-month window; **$109,085** untagged
revenue. The page splits the remaining twelve-month revenue as Managed Services 662,400, Products
251,300, Training 182,967, which sums with Consulting and the untagged figure to the 2,208,825 above.

**Transactions**: the tab says `4,430 posting lines across 24 months, Aug 1 2024 to Jul 31 2026`.
Twelve July rows are reproduced on the page, in the product's own column order (Date, Type, Name,
Account with its offset, Memo, Doc #, Amount). The product's memos use em dashes; the page recasts
them with commas.

**The story the numbers tell**, which is what the briefing is written against:

1. **Revenue fell 6.6% and net margin still rose**, to 19.0%, because gross margin went up 0.8
   points to 69.7%.
2. **OpEx is the problem.** $81,124 against a $72,000 goal, $9,124 over, in a month that earned
   less. It is the only one of the Big Six flagged `OVER BUDGET`.
3. **Collections were the quiet win.** Receivables fell $11,668 and the bank rose $7,036, so a
   slower month still added cash.

---

## 8. Page status

- Route `/features/cfo-analytics`, nav label `CFO Analytics`, tile colour `#A16207` from the navbar.
  The page's own accent is the QuickBooks-ish green `#0F7B4F`, which is where the product's own
  buttons sit; charts use the brighter `#12A870` the live app draws with.
- **No Replaces strip.** Client says it replaces nothing.
- **Every mockup card is `h-[380px] sm:h-[430px]`**, the same pair seven of the other feature pages
  use. There is no taller variant on this page any more; the P&L card used to have one and it made
  this page the odd one out at both breakpoints.
- **Nothing inside a mockup card scrolls.** Lists that run past the frame are clipped by the card,
  on purpose. Do not put `overflow-y-auto` back: a scrollbar inside a marketing mockup invites the
  reader to fight with it, and a statement that carries on past the edge is what a real window onto
  real data looks like. Two consequences to keep in mind when editing:
  - Any card whose height depends on what the reader clicked has to fit in **380px** in *every*
    state, not just its opening one. That is why the AI Briefing card hides the CFO View sub-tab
    strip below `sm` and shortens its Claude footnote there.
  - Counts in a card footer must not say "shown", because the reader cannot see them all. The
    Transactions card says "12 rows from July", or "N of 12 rows match" while a search is active.
- **The hero tour is 560px tall**, not the 500px the other eight tours use, because this screen
  carries nine tabs plus a sub-tab strip plus a period-control row. It also reserves a 46px band at
  the bottom of the card so the floating `Ask Multi AI` pill never covers a number. Both are
  deliberate; do not "fix" them back.
- **Hero tour running order**: the password gate, the QuickBooks sync, CFO View / Big Picture,
  CFO View / AI Briefing, Profit and Loss, Key Ratios, Business Valuation. The gate leads on
  purpose, and the sync follows it so the connection is something the reader watches happen. The
  cursor fades out for the sync beat, because nothing on that screen is clickable.
- **The Business Valuation beat scrolls.** It is three screens: the headline and 4-P scorecard, then
  the eleven-axis radar and the value trajectory, then the executive summary with strengths,
  opportunities and risks. They are absolutely positioned siblings translated by whole multiples of
  their own height, so it is a real vertical scroll rather than a cross-fade, with a slim position
  indicator on the right edge.
- **The loop ends on a fade, not a cut**, and this is now house-wide rather than specific to this
  page. All twelve hero tours carry a `dim` flag that drops the card element itself to zero opacity
  over 520ms; the scene resets while it is invisible, then it fades back up. The pattern is:
  `let first = true` outside the `while`, the reset branch does
  `setScene({ ...BLANK, dim: true })` then `patch({ dim: false })`, and the tail sets
  `dim: true` immediately before the existing `fade(0)`. The two tours that keep one `useState` per
  thing rather than a `Scene` object (Projects & Tasks, Team Meetings) use a `dim` state and put the
  opacity on their scaled stage. One full pass of this tour is about **41 seconds**, which is long
  next to the others (~25s). If that needs to come down, the valuation holds are the place to take
  it from, not the beats before it.
- Still unverified, and therefore claimed carefully or not at all: what the password gate looks
  like, what the valuation output actually says, what the AI Insights tab renders once connected,
  and what the CCC, What-If, Warnings and Trends sub-tabs contain. The page names those four
  sub-tabs and describes none of them.

---

## 9. What the populated screenshots showed

Kept as an index of what is now settled, so nobody re-invents it:

| Screenshot | What it fixed |
| --- | --- |
| CFO View / Big Picture | The Big Six, the goal footers, health score 79/100, 0 warnings, the eight CFO View sub-tabs |
| Overview | Four KPI cards, twelve-month revenue chart with Revenue / Gross Margin / Net Margin / Net Profit toggles, revenue vs COGS vs OpEx bars |
| Profit and Loss | Nested accounts, `% INC` column, `Hide $0`, `Compare`, `Collapse all` / `Expand all`, accrual basis |
| Balance Sheet | Three summary cards, current assets vs current liabilities chart, period-over-period table with a change column |
| Key Ratios | All seven ratios, their targets, and the green / amber states |
| Transactions | Column order, the offset-account line, doc numbers, `Export CSV`, the 4,430-line sample ledger |
| Class | Revenue and gross margin per class, By Class / By Item, the four summary cards |
| AI Insights | That it ships **empty** until connected, and points at the CFO View for samples |
| Business Valuation | Step 1's questions, the four quadrants scored 0 to 5, the radar chart, and that the pillars are excluded from the multiple and feed a 12-month roadmap |

Also fixed by these: the header carries `Set Goals`, `Share`, `Shared P&Ls`, `Settings`, a
`REPORT TIMEFRAME` selector, a locked `LAST CLOSED MONTH` selector, and an orange `Ask CFO Coach`
button. The subtitle is `CFO-Grade Analytics`, not the older `CFO-grade financial analytics powered
by QuickBooks.` from the disconnected state.

---

## 10. Business Valuation, off the result screen

A tenth screenshot arrived after the other nine: the Business Valuation **result**, not the wizard.
It replaces everything this file used to guess about that tab.

**The headline band** (silver gradient, dark buttons top right):

| Field | Value |
| --- | --- |
| Your business is worth | **$1.37M**, tagged `ESTIMATED` |
| Range | $715K to $1.97M |
| Industry | B2B SaaS |
| Multiple | 4.3x SDE |
| Computed | 8/27/2026 |
| Asset sale | $206K |
| Liquidation | $113K |
| Buttons | `Recalculate Valuation`, `Edit Evaluation` |

So the product quotes **three** numbers, not one: a going-concern estimate, an asset-sale figure and
a liquidation figure. That is worth keeping on the page, because it is what makes it read as a
valuation rather than a revenue multiple.

**The 12-month goal band** (cream gradient): target `$2.06M` with an editable `$ 2,057,550` field and
a `Save target` button, a slider, `Required lift $686K (50%)`, and a `Build 3-Year Roadmap` button.

**The 2-Day CEO 4-P Scorecard**, headed "Where you stand across the four quadrants". Four tinted
cards, each scored out of 5.0, each with its sub-categories:

| Quadrant | Score | Tint | Sub-categories |
| --- | --- | --- | --- |
| People | 3.0 | orange `#EA7A1F` | Leadership Team 2.3, Culture & Growth 3.3, Team Accountability 3.3 |
| Process | 3.2 | violet `#8B5CF6` | Standard Operating Procedures 4.0, Training & Development Processes 3.0, Business Software & Oversight 2.7 |
| Product | 3.2 | blue `#2F6BD8` | Core Customer & Marketing 3.3, Product / Core Strategy 3.0 |
| Plan | 3.3 | green `#10A870` | One Page Plan 3.7, Metrics & KPIs 3.0, Financials 3.3 |

The lowest-scoring quadrant gets a different line from the other three: "PEOPLE is the
highest-impact area to improve", where the rest say "is workable; targeted upgrades will lift
value." The hero tour keeps the first line and drops the repeated one, purely for space.

Below the fold on that screen: a "Comparative self-evaluation / 11 Sub-categories at a glance"
radar, a "Trajectory / Value over time" chart that "re-runs monthly when QuickBooks syncs, plus
every manual refresh and override", an executive summary with a Refresh button, three columns of
Strengths / Opportunities / Risks, and a "How we got to this number" panel holding the EBITDA and
SDE build-up. **The tour scrolls through all of that except the last one.**

> **Why the EBITDA panel is left out, and the problem it points at.** That panel shows the
> arithmetic: revenue, less COGS, less operating expenses, plus D&A, equals EBITDA, plus owner
> add-backs, equals SDE, times the multiple. Putting it on the page would expose a contradiction we
> have not resolved: **the $1.37M headline does not reconcile with this page's own ledger.** At
> 4.3x SDE, $1.37M implies SDE of about $319K. The sample ledger in section 7 runs at $2.21M
> trailing revenue and roughly $574K of EBITDA before any owner add-back, which at the same multiple
> would be nearer $2.5M. The two figures come from different demo accounts: the valuation screenshot
> is a three-year-old B2B SaaS business whose own EBITDA panel shows $300,000 of revenue.
>
> The page currently keeps the screenshot's numbers, because they are what the real product output
> says. **Whoever picks this up next has to choose one:** re-base the valuation off the section 7
> ledger and lose the match with the screenshot, or leave it and accept that a finance reader who
> does the division will notice. Do not add the EBITDA panel without settling that first.

**What the tour does with all this.** Beat 7 renders the headline band, the goal band and the four
quadrant cards, in that order. `valued` reveals the headline and the two floor figures; `pillars`
then fills the goal slider and every sub-category bar. The radar that used to be in this beat is
gone, along with the wizard step rail, because the result screen has neither.
