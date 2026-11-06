import { NextResponse } from "next/server";
import { sessionCookieName, sessionCookieOptions } from "@/lib/admin/session";
import { NO_STORE } from "@/lib/admin/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({ ok: true }, { headers: NO_STORE });
  response.cookies.set(sessionCookieName(), "", sessionCookieOptions(0));
  return response;
}
