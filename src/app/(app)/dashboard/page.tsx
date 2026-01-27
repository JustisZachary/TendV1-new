export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-gray-200 pb-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <h1 className="text-base font-semibold text-gray-900">Workload</h1>
            <p className="text-xs text-gray-500">
              Data from up to 1 hour ago
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm"
              type="button"
            >
              <svg
                aria-hidden="true"
                className="h-4 w-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.7}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 7a2 2 0 0 1 2-2h3l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z"
                />
              </svg>
              All views
              <svg
                aria-hidden="true"
                className="h-3 w-3 text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m6 9 6 6 6-6"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <button
            className="border-b-2 border-gray-900 pb-2 text-gray-900"
            type="button"
          >
            Default
          </button>
          <button className="pb-2 text-gray-400" type="button">
            Add view
          </button>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          className="flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 font-semibold text-gray-700"
          type="button"
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7V5m8 2V5M4 9h16"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
            />
          </svg>
          Jan 20, 2026 - Jan 26, 2026
          <svg
            aria-hidden="true"
            className="h-3 w-3 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m6 9 6 6 6-6"
            />
          </svg>
        </button>
        <button
          className="flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 font-semibold text-gray-700"
          type="button"
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 7h12M8 7v10m8-10v10M4 7l2 14h12l2-14"
            />
          </svg>
          All shared inboxes
          <svg
            aria-hidden="true"
            className="h-3 w-3 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m6 9 6 6 6-6"
            />
          </svg>
        </button>
        <button
          className="flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 font-semibold text-gray-700"
          type="button"
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7 7a7 7 0 0 1 14 0"
            />
          </svg>
          All teammates
          <svg
            aria-hidden="true"
            className="h-3 w-3 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m6 9 6 6 6-6"
            />
          </svg>
        </button>
        <button
          className="flex items-center gap-1 rounded-md px-2 py-2 font-semibold text-blue-600"
          type="button"
        >
          More filters
          <svg
            aria-hidden="true"
            className="h-3 w-3"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m6 9 6 6 6-6"
            />
          </svg>
        </button>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Key metrics</h2>
            <button className="rounded-md bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-600">
              New conversations, +2
            </button>
          </div>
          <div className="mt-8 flex flex-col items-center gap-3 text-center text-xs text-gray-500">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <div className="h-4 w-8 rounded-md bg-gray-200" />
            </div>
            <p className="text-sm font-semibold text-gray-700">No data</p>
            <p>No matching data for the selected filters.</p>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">
              Workload over time
            </h2>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
              <button className="rounded-md bg-gray-50 px-2 py-1">
                New conversations
              </button>
              <button className="rounded-md bg-gray-50 px-2 py-1">
                Compare
              </button>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center gap-3 text-center text-xs text-gray-500">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <div className="h-4 w-8 rounded-md bg-gray-200" />
            </div>
            <p className="text-sm font-semibold text-gray-700">No data</p>
            <p>No matching data for the selected filters.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Busiest times</h2>
            <button className="rounded-md bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-600">
              New conversations
            </button>
          </div>
          <div className="mt-8 flex flex-col items-center gap-3 text-center text-xs text-gray-500">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <div className="h-4 w-8 rounded-md bg-gray-200" />
            </div>
            <p className="text-sm font-semibold text-gray-700">No data</p>
            <p>No matching data for the selected filters.</p>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Efficiency</h2>
            <button className="rounded-md bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-600">
              Resolution time
            </button>
          </div>
          <div className="mt-8 flex flex-col items-center gap-3 text-center text-xs text-gray-500">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <div className="h-4 w-8 rounded-md bg-gray-200" />
            </div>
            <p className="text-sm font-semibold text-gray-700">No data</p>
            <p>No matching data for the selected filters.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
