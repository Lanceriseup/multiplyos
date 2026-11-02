# Inventory HQ — feature page notes

Built November 2026. The second HQ Module to get a page from the HQ Modules
band in the Features menu, after Events HQ.

Route: `/features/inventory-hq`.

## 1. What we were given

1. **Seventeen screenshots of the module**: the header with the four tiles and
   What needs a decision; the Browse, Stock, Purchasing, Orders, Events, Cycle
   counts, Forecast, Assets (empty) and Insights tabs; the New purchase order
   dialog; one item's record; Settings → Team & alerts and Settings → Sales
   channels; and a close-up of the sidebar icon.
2. **Help center text**: the Inventory HQ overview (tabs, setup order,
   permissions), Connect Shopify, ShipStation or a webhook, and Bring your
   existing inventory in.
3. **Multi AI's own summary** of the module, which pointed at the same articles.

Everything on the page traces to one of those. No pricing, limits or
performance claims.

## 2. What the page does NOT claim

- **No "This replaces" chip.** The importer reads a Sortly export, but the
  client has not said Inventory HQ replaces Sortly. Add one to `REPLACES` in
  `components/ReplacesStrip.tsx` if they do.
- **No "Coming Q1".** The pricing page still lists Inventory HQ as "Coming Q1"
  (`lib/pricing-copy.ts`). The navbar card links to the page like Events HQ's
  does. If the module is not live for customers yet, either add
  `soon: "Coming Q1"` to its card in `components/Navbar.tsx` (which also stops
  it navigating) or update the pricing copy.
- **Nothing about how Rise Up Kings uses it.** Multi AI's summary flagged that
  claims about kits per event, reconciliation or gifting should come from the
  client's own workflow, not the help center. The page describes the product.
- **ShipStation sending is off by default.** The orders card says so rather than
  implying orders flow out to ShipStation on connect.

## 3. The five sections, and why five

Inventory HQ is a whole department, like Events HQ, so it runs to five sections,
in the order stock moves through a business:

1. **One pool of stock**: SKUs per size and colour, the five numbers (on hand,
   allocated, reserved, available, inbound), Scan or search a SKU, importing,
   and the history that cannot be edited.
2. **Purchasing and receiving**: reorder points, drafting a PO from a
   shortfall, partial receiving, branding holds, and cost visibility as its own
   permission.
3. **Orders and sales channels**: the six-column order board, Shopify,
   ShipStation and custom webhooks (GoHighLevel, Zapier, Make).
4. **Events and gear**: kits, Reserve stock for an Events HQ event, Plan gear
   and check-in, with losses counted against the event.
5. **Counts, forecasts and alerts**: cycle counts with manager approval, the
   forecast, alerts once a day per kind, and assets.

Multi AI is last, as on every page.

## 4. The hero tour

`components/InventoryHqHeroTour.tsx`. Same architecture as the other tours: the
screen is React state, only the cursor and ripple animate through the Web
Animations API, and the loop is generation-token guarded.

The loop walks the module the way an inventory manager would:

- **Browse**: What needs a decision says Leaders Summit 2026 is short; Draft a
  PO opens the New purchase order dialog (vendor, expected arrival, Branding
  needed, items) and Create PO lands PO-0142 at the top of **Purchasing**.
- **Stock**: the eight columns from the client's Stock tab.
- **Orders**: a Shopify order moves New → Allocated → Picked → Packed.
- **Events**: Reserve stock on Leaders Summit 2026 holds 312 units, and the
  Available tile drops by the same number.
- **Cycle counts**: the apparel count fills and goes for approval.
- **Forecast**, **Assets**, **Insights**.
- **One item**: a SKU typed into Scan or search a SKU opens the Event T-shirt's
  record (five size variants), then its Stock history.

What needs a decision sits above the tabs in the app; in the tour it sits in the
Browse tab, where the loop starts, so the other tabs keep their height.

The Assets tab was empty in the client's screenshot. The tour fills it with the
columns its empty state names: tag, custodian and condition.

**The Inventory HQ icon** is the app's own: three boxes, two below and one on
top. It replaces the single box the navbar card carried before, and is used in
the navbar card, the hero badge and the tour's sidebar.

**Reduced motion** shows the Events tab with the summit's stock held. The scene
starts BLANK on the first render and the effect swaps in STILL after mount, as
on the Events HQ tour.

## 5. Numbers that agree

The tour and the section cards share one set of numbers so nothing contradicts
itself on the page: the Event T-shirt is 358 on hand and 216 available across
S to 2XL (Large is 96 on hand, 56 available, low at 60), 200 inbound on
PO-0141, and the summit hold is 312 units (137 shirts, 137 badge holders, 30
staff lanyards, 4 banner stands, 4 mic kits). Lanyards are 85 on hand and 12
available, needed 210 for events.

## 6. Privacy

The client's screenshots carry real event names, real customers on real orders,
real vendors, real staff names and emails, and a live webhook URL with its
secret. None of it is on the page.

Everything is the fictional Ridgeline cast the other pages use (Dana Whitfield,
Marcus Hale, Priya Nair, Theo Barnes; customers Elena Cruz, Noah Bennett, Grace
Okafor, Samuel Ortiz, Maya Lindqvist, Owen Park, Hannah Reyes) and the events
from the Events HQ page (Leaders Summit 2026, Founders Retreat, Sales
Bootcamp). Vendors are invented: Summit Apparel Co., Northwind Supply, Badge &
Print Co., Lakeview Books.

## 7. Integration points touched

- `app/features/inventory-hq/page.tsx`: new route and metadata.
- `components/InventoryHqPage.tsx`, `components/InventoryHqHeroTour.tsx`: new.
- `components/Navbar.tsx`: the Inventory HQ card gets its `href` and the app's
  Inventory HQ icon.

Not touched: `StackTable.tsx` and the pricing copy (see "Coming Q1" above).

## 8. Mobile

Checked at 390px through the DevTools protocol: the document is exactly 390
wide, so nothing scrolls sideways. Section cards are 440px at every width, as on
the Events HQ page. Card tabs use short labels on a phone (Reserve / Gear,
Count, Channels), and the counts card drops "Inventory manager ·" from its
header so the title fits.
