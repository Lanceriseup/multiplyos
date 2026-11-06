/**
 * Google service-account access tokens (GA4 Data API, Search Console).
 *
 * Signs a JWT with the service account's private key and swaps it for an
 * access token; tokens are reused until five minutes before they expire.
 * The service account must be added as a user on the GA4 property and the
 * Search Console property.
 */

import { createSign } from "node:crypto";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const cache = new Map<string, { token: string; expiresAt: number }>();

export function googleConfigured(): boolean {
  return Boolean(process.env.GOOGLE_SA_CLIENT_EMAIL && process.env.GOOGLE_SA_PRIVATE_KEY);
}

export const GOOGLE_SETUP_NOTE =
  "Set GOOGLE_SA_CLIENT_EMAIL and GOOGLE_SA_PRIVATE_KEY (a service account with read access).";

export async function googleAccessToken(scope: string): Promise<string> {
  const hit = cache.get(scope);
  if (hit && hit.expiresAt - 300_000 > Date.now()) return hit.token;

  const email = process.env.GOOGLE_SA_CLIENT_EMAIL!;
  // Vercel and .env files usually store the key with literal "\n".
  const key = process.env.GOOGLE_SA_PRIVATE_KEY!.replace(/\\n/g, "\n");
  const now = Math.floor(Date.now() / 1000);
  const encode = (obj: object) => Buffer.from(JSON.stringify(obj)).toString("base64url");
  const unsigned = `${encode({ alg: "RS256", typ: "JWT" })}.${encode({
    iss: email,
    scope,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  })}`;
  const signature = createSign("RSA-SHA256").update(unsigned).sign(key).toString("base64url");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${signature}`,
    }),
    signal: AbortSignal.timeout(15_000),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Google token request failed (${res.status}) ${(await res.text()).slice(0, 200)}`);
  }
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cache.set(scope, { token: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 });
  return json.access_token;
}

export async function googlePost<T>(url: string, scope: string, body: unknown): Promise<T> {
  const token = await googleAccessToken(scope);
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20_000),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
  return res.json() as Promise<T>;
}
