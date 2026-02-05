"use client";

import { usePathname } from "next/navigation";

const navItems = [
  { href: "/calendar", label: "Calendar", path: "/calendar" },
  { href: "/people", label: "People", path: "/people" },
  { href: "/analytics", label: "Analytics", path: "/analytics" },
] as const;

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideSidebar = pathname === "/form";

  if (hideSidebar) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] text-gray-900">
        <main className="px-6 py-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-gray-900">
      <div className="grid w-full grid-cols-[72px_1fr]">
        <aside className="sticky top-0 flex h-screen flex-col border-r border-gray-100 bg-white">
          <div className="flex flex-1 flex-col items-center gap-1 py-5">
            <a
              aria-label="Inbox"
              className="flex h-11 w-11 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-50 hover:text-gray-700"
              href="/dashboard"
            >
              <svg
                aria-hidden="true"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2 8l10 7 10-7M2 20h20a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"
                />
              </svg>
            </a>
            <a
              aria-label="New submission"
              className="flex h-11 w-11 items-center justify-center rounded-xl text-purple-700 transition hover:bg-purple-50 hover:text-purple-800"
              href="/form"
            >
              <svg
                aria-hidden="true"
                className="h-7 w-7"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 5v14m-7-7h14"
                />
              </svg>
            </a>
            <a
              aria-label="Search"
              className="flex h-11 w-11 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-50 hover:text-gray-700"
              href="/search"
            >
              <svg
                aria-hidden="true"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.2-5.2M11 5a6 6 0 1 0 0 12 6 6 0 0 0 0-12z"
                />
              </svg>
            </a>
            <a
              aria-label="AI chat"
              className="flex h-11 w-11 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-50 hover:text-gray-700"
              href="/ai-chat"
            >
              <svg
                aria-hidden="true"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 8h10M7 12h6m-5 8-5 3V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7z"
                />
              </svg>
            </a>
            <div className="my-2 h-px w-8 bg-gray-300" />
            <nav className="flex flex-col items-center gap-0.5" aria-label="Main">
              {navItems.map(({ href, label, path }) => {
                const isActive = pathname === path;
                return (
                  <a
                    key={path}
                    aria-label={label}
                    aria-current={isActive ? "page" : undefined}
                    href={href}
                    className={`relative flex h-11 w-11 items-center justify-center rounded-xl transition ${
                      isActive
                        ? "bg-white text-purple-700 shadow-sm"
                        : "text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                    }`}
                  >
                    {path === "/calendar" && (
                      <svg
                        aria-hidden="true"
                        className="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 7V5m8 2V5M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"
                        />
                      </svg>
                    )}
                    {path === "/people" && (
                      <svg
                        aria-hidden="true"
                        className="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7 7a7 7 0 0 1 14 0"
                        />
                      </svg>
                    )}
                    {path === "/analytics" && (
                      <svg
                        aria-hidden="true"
                        className="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 20h16M7 16V9m5 7V6m5 10v-4"
                        />
                      </svg>
                    )}
                    {isActive && (
                      <span
                        aria-hidden
                        className="absolute right-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-purple-700"
                      />
                    )}
                  </a>
                );
              })}
            </nav>
            <a
              aria-label="Settings"
              className="mt-2 flex h-11 w-11 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-50 hover:text-gray-700"
              href="/settings"
            >
              <svg
                aria-hidden="true"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.4 15a1.6 1.6 0 0 0 .32 1.76l.05.05a2 2 0 1 1-2.83 2.83l-.05-.05a1.6 1.6 0 0 0-1.76-.32 1.6 1.6 0 0 0-.97 1.46V21a2 2 0 0 1-4 0v-.08a1.6 1.6 0 0 0-1.02-1.48 1.6 1.6 0 0 0-1.76.32l-.05.05a2 2 0 1 1-2.83-2.83l.05-.05a1.6 1.6 0 0 0 .32-1.76 1.6 1.6 0 0 0-1.46-.97H3a2 2 0 0 1 0-4h.08a1.6 1.6 0 0 0 1.48-1.02 1.6 1.6 0 0 0-.32-1.76l-.05-.05a2 2 0 1 1 2.83-2.83l.05.05a1.6 1.6 0 0 0 1.76.32 1.6 1.6 0 0 0 .97-1.46V3a2 2 0 0 1 4 0v.08a1.6 1.6 0 0 0 1.02 1.48 1.6 1.6 0 0 0 1.76-.32l.05-.05a2 2 0 1 1 2.83 2.83l-.05.05a1.6 1.6 0 0 0-.32 1.76 1.6 1.6 0 0 0 1.46.97H21a2 2 0 0 1 0 4h-.08a1.6 1.6 0 0 0-1.48 1.02Z"
                />
              </svg>
            </a>
          </div>
        </aside>
        <main className="min-h-screen flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
