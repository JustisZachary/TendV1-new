import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { exchangeCodeForTokens } from "@/lib/googleCalendar";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (error) {
    return NextResponse.redirect(`/calendar?status=error&reason=${error}`);
  }

  if (!code || !state) {
    return NextResponse.redirect("/calendar?status=error&reason=missing_code");
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get("gcal_oauth_state")?.value;

  if (!storedState || storedState !== state) {
    return NextResponse.redirect("/calendar?status=error&reason=invalid_state");
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const refreshToken =
      tokens.refresh_token ?? cookieStore.get("gcal_refresh_token")?.value;
    const expiresAt = Date.now() + tokens.expires_in * 1000;

    cookieStore.set("gcal_access_token", tokens.access_token, {
      ...cookieOptions,
      maxAge: tokens.expires_in,
    });
    cookieStore.set("gcal_expires_at", `${expiresAt}`, {
      ...cookieOptions,
      maxAge: tokens.expires_in,
    });

    if (refreshToken) {
      cookieStore.set("gcal_refresh_token", refreshToken, {
        ...cookieOptions,
        maxAge: 60 * 60 * 24 * 365,
      });
    }

    cookieStore.delete("gcal_oauth_state");
    return NextResponse.redirect("/calendar?status=connected");
  } catch {
    return NextResponse.redirect("/calendar?status=error&reason=token_exchange");
  }
}
