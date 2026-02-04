import { cookies } from "next/headers";

const COOKIE_NAME = "tend_master_auth";

export const TETHER_ADMIN_EMAIL = "Tether@gmail.com";
export const TETHER_TEST_EMAIL = "TetherTest@gmail.com";

export async function getLoggedInEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(COOKIE_NAME);
  if (!authCookie?.value || authCookie.value === "1") {
    return null;
  }
  return authCookie.value;
}

export function isAdminEmail(email: string | null): boolean {
  if (!email) return false;
  return email.toLowerCase() === TETHER_ADMIN_EMAIL.toLowerCase();
}

export function isTestEmail(email: string | null): boolean {
  if (!email) return false;
  return email.toLowerCase() === TETHER_TEST_EMAIL.toLowerCase();
}
