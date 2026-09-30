/**
 * GHL's booking widget mangles a "+" in a prefilled email.
 *
 * Checked 2026-09-30 against the live widget: `email=jax%2Btest%40…` arrives
 * as "jax test@…". The widget decodes the query string and then turns "+"
 * into a space, so no encoding survives it (`%252B` shows a literal "%2B").
 * The phone field is not affected.
 *
 * So a "+" address is never prefilled: the visitor types it in the widget's
 * own contact step, which keeps it intact. Our lead capture (/api/lead,
 * /api/coaching-lead) still stores the exact address.
 */
export function canPrefillWidgetEmail(email: string | undefined | null): boolean {
  return !!email && !email.includes("+");
}
