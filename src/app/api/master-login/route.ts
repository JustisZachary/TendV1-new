import { NextResponse } from "next/server";

const COOKIE_NAME = "tend_master_auth";
const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7;

export async function POST(request: Request) {
  const { email, password } = await request
    .json()
    .catch(() => ({ email: "", password: "" }));
  const masterPassword = "Tether";
  const normalizedEmail = typeof email === "string" ? email.trim() : "";

  if (
    normalizedEmail.length === 0 ||
    typeof password !== "string" ||
    password !== masterPassword
  ) {
    return NextResponse.json(
      { error: "Incorrect email or password." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: COOKIE_NAME,
    value: normalizedEmail,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ONE_WEEK_SECONDS,
    path: "/",
  });

  return response;
}
