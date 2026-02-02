import crypto from "crypto";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { buildGoogleCalendarAuthUrl } from "@/lib/googleCalendar";

export async function GET() {
  const state = crypto.randomUUID();
  const authUrl = buildGoogleCalendarAuthUrl(state);

  if (!authUrl) {
    return NextResponse.json(
      { error: "Google Calendar is not configured." },
      { status: 501 },
    );
  }

  const cookieStore = await cookies();
  cookieStore.set("gcal_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });

  return NextResponse.redirect(authUrl);
}
