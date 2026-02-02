import { cookies } from "next/headers";

import { MasterLoginForm } from "./master-login-form";

export default async function Home() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.get("tend_master_auth")?.value === "1";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-6 px-6 py-10">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold text-purple-700">
          Tether
        </h1>
      </div>
      {isLoggedIn ? (
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href="/form"
            className="inline-flex items-center justify-center rounded-full bg-purple-700 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-800"
          >
            Open Form
          </a>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full border border-purple-700 px-6 py-2 text-sm font-semibold text-purple-700 transition hover:bg-purple-50"
          >
            View Dashboard
          </a>
        </div>
      ) : (
        <MasterLoginForm />
      )}
    </main>
  );
}
