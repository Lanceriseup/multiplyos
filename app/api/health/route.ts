import { NextResponse } from "next/server";

// TEMPORARY diagnostic — reports which GHL env vars the running build can see.
// Returns presence + length only (never the secret values). Remove after debugging.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function check(key: string) {
  const val = process.env[key];
  return { present: !!val, length: val ? val.length : 0 };
}

export async function GET() {
  return NextResponse.json({
    note: "temporary diagnostic — no secret values are exposed",
    env: {
      GHL_PRIVATE_TOKEN: check("GHL_PRIVATE_TOKEN"),
      GHL_LOCATION_ID: check("GHL_LOCATION_ID"),
      GHL_CALENDAR_ID: check("GHL_CALENDAR_ID"),
      GHL_FIELD_TEAM_SIZE: check("GHL_FIELD_TEAM_SIZE"),
      GHL_FIELD_DEMO_INTEREST: check("GHL_FIELD_DEMO_INTEREST"),
    },
  });
}
