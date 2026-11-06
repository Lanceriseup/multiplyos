/**
 * Admin session cookie: `v1.<expiry ms>.<HMAC-SHA256 signature>`.
 *
 * Uses Web Crypto so the same code runs in middleware (Edge) and in route
 * handlers (Node). The secret is ADMIN_SESSION_SECRET; changing it signs
 * everyone out.
 */

export const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

/**
 * `__Host-` cookies must be Secure, which plain http://localhost cannot always
 * honour (Safari), so local dev uses an unprefixed name.
 */
export function sessionCookieName(): string {
  return process.env.NODE_ENV === "production" ? "__Host-mos_admin" : "mos_admin";
}

export function sessionCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

const encoder = new TextEncoder();

function toBase64Url(bytes: ArrayBuffer): string {
  let bin = "";
  for (const b of new Uint8Array(bytes)) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return toBase64Url(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)));
}

/** Compares in time that does not depend on where the strings differ. */
function sameString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken(
  secret: string,
  now: number = Date.now(),
  ttlMs: number = SESSION_TTL_MS
): Promise<string> {
  const payload = `v1.${now + ttlMs}`;
  return `${payload}.${await sign(payload, secret)}`;
}

export async function verifySessionToken(
  token: string | undefined,
  secret: string | undefined,
  now: number = Date.now()
): Promise<boolean> {
  if (!token || !secret) return false;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return false;
  const expires = Number(parts[1]);
  if (!Number.isFinite(expires) || expires <= now) return false;
  const expected = await sign(`${parts[0]}.${parts[1]}`, secret);
  return sameString(parts[2], expected);
}
