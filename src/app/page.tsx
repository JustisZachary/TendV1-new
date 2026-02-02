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
      <MasterLoginForm />
      {isLoggedIn ? (
        <p className="text-xs text-slate-500">
          You are signed in. Use the sidebar to navigate.
        </p>
      ) : null}
    </main>
  );
}
