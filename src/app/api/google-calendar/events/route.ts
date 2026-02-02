import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  fetchCalendarEvents,
  refreshAccessToken,
} from "@/lib/googleCalendar";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function GET() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("gcal_access_token")?.value;
  const refreshToken = cookieStore.get("gcal_refresh_token")?.value;
  const expiresAt = Number(cookieStore.get("gcal_expires_at")?.value ?? 0);

  if (!accessToken && !refreshToken) {
    return NextResponse.json({ error: "Not connected." }, { status: 401 });
  }

  let activeToken = accessToken ?? null;
  if (!activeToken || Date.now() >= expiresAt) {
    if (!refreshToken) {
      return NextResponse.json({ error: "Token expired." }, { status: 401 });
    }

    try {
      const refreshed = await refreshAccessToken(refreshToken);
      activeToken = refreshed.access_token;
      const updatedExpiresAt = Date.now() + refreshed.expires_in * 1000;

      cookieStore.set("gcal_access_token", refreshed.access_token, {
        ...cookieOptions,
        maxAge: refreshed.expires_in,
      });
      cookieStore.set("gcal_expires_at", `${updatedExpiresAt}`, {
        ...cookieOptions,
        maxAge: refreshed.expires_in,
      });
    } catch {
      return NextResponse.json({ error: "Refresh failed." }, { status: 401 });
    }
  }

  try {
    const { status, events } = await fetchCalendarEvents(activeToken);

    if (status === 401) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    return NextResponse.json({ events });
  } catch {
    return NextResponse.json(
      { error: "Failed to load events." },
      { status: 502 },
    );
  }
}
