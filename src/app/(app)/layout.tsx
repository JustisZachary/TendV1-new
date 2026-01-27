export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 lg:grid-cols-[88px_1fr]">
        <aside className="border-b border-gray-200 bg-gray-100 px-4 py-6 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col items-center justify-between">
            <div className="flex flex-col items-center gap-5">
              <a
                aria-label="Dashboard"
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-gray-800 shadow-sm transition hover:bg-gray-50"
                href="/dashboard"
              >
                <svg
                  aria-hidden="true"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 8h16M6 8l1.8 10.5a2 2 0 0 0 2 1.5h4.4a2 2 0 0 0 2-1.5L18 8M9 12h6"
                  />
                </svg>
              </a>
              <a
                aria-label="New submission"
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-sm transition hover:bg-gray-800"
                href="/form"
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
                    d="M12 5v14m-7-7h14"
                  />
                </svg>
              </a>
              <a
                aria-label="Search"
                className="flex h-11 w-11 items-center justify-center rounded-2xl text-gray-600 transition hover:bg-white"
                href="/search"
              >
                <svg
                  aria-hidden="true"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 4a7 7 0 0 1 5.292 11.546l3.081 3.081a1 1 0 0 1-1.414 1.414l-3.081-3.081A7 7 0 1 1 11 4z"
                  />
                </svg>
              </a>
              <div className="h-px w-10 bg-gray-300" />
              <nav className="flex flex-col items-center gap-3 text-gray-500">
                <a
                  aria-label="Calendar"
                  className="flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-white"
                  href="/calendar"
                >
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5"
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
                </a>
                <a
                  aria-label="People"
                  className="flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-white"
                  href="/people"
                >
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5"
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
                </a>
                <a
                  aria-label="Analytics"
                  className="flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-white"
                  href="/analytics"
                >
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5"
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
                </a>
                <a
                  aria-label="Explore"
                  className="flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-white"
                  href="/explore"
                >
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9Zm0 0c2.5 2.7 2.5 12.3 0 18m0-18c-2.5 2.7-2.5 12.3 0 18M3 12h18"
                    />
                  </svg>
                </a>
              </nav>
            </div>
            <a
              aria-label="Settings"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition hover:bg-white"
              href="/settings"
            >
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm8 3.5a7.94 7.94 0 0 0-.18-1.65l2.11-1.64-2-3.46-2.54 1a7.99 7.99 0 0 0-2.86-1.65l-.38-2.7H9.85l-.38 2.7a7.99 7.99 0 0 0-2.86 1.65l-2.54-1-2 3.46 2.11 1.64A7.94 7.94 0 0 0 4 12c0 .56.06 1.11.18 1.65l-2.11 1.64 2 3.46 2.54-1a7.99 7.99 0 0 0 2.86 1.65l.38 2.7h4.3l.38-2.7a7.99 7.99 0 0 0 2.86-1.65l2.54 1 2-3.46-2.11-1.64c.12-.54.18-1.09.18-1.65Z"
                />
              </svg>
            </a>
          </div>
        </aside>
        <main className="px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
