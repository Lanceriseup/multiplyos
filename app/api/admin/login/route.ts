import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import {
  SESSION_TTL_MS,
  createSessionToken,
  sessionCookieName,
  sessionCookieOptions,
} from "@/lib/admin/session";
import { clearFailures, isLocked, recordFailure } from "@/lib/admin/throttle";
import { NO_STORE } from "@/lib/admin/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function samePassword(given: string, expected: string): boolean {
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const expected = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!expected || !secret) {
    return NextResponse.json(
      { ok: false, error: "Admin sign-in isn't set up. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET." },
      { status: 503, headers: NO_STORE }
    );
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (isLocked(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Try again in 15 minutes." },
      { status: 429, headers: NO_STORE }
    );
  }

  let password = "";
  try {
    const body = await request.json();
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    // treated as a wrong password below
  }

  if (!password || !samePassword(password, expected)) {
    recordFailure(ip);
    return NextResponse.json(
      { ok: false, error: "That password isn't right." },
      { status: 401, headers: NO_STORE }
    );
  }

  clearFailures(ip);
  const response = NextResponse.json({ ok: true }, { headers: NO_STORE });
  response.cookies.set(
    sessionCookieName(),
    await createSessionToken(secret),
    sessionCookieOptions(SESSION_TTL_MS / 1000)
  );
  return response;
}
