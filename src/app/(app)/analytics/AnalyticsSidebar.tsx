"use client";

import { usePathname } from "next/navigation";

type SidebarTag = {
  id: string;
  label: string;
  count: number;
};

type AnalyticsSidebarProps = {
  topTags: SidebarTag[];
  totalRequests: number;
};

const navItems = [
  { label: "Team Performance", href: "/analytics/workload", icon: "team" },
  { label: "Workload", href: "/analytics", icon: "workload" },
  { label: "Response", href: "/analytics/response", icon: "response" },
  { label: "People Satisfaction", href: "/analytics/people-satisfaction", icon: "satisfaction" },
  { label: "Time Goals", href: "/analytics/time-goals", icon: "goals" },
] as const;

export default function AnalyticsSidebar({
  topTags,
  totalRequests,
}: AnalyticsSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 -ml-px lg:block">
      <div className="border border-l-0 border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Analytics</h2>
          <button
            type="button"
            aria-label="Add view"
            className="rounded-full border border-gray-200 bg-white p-1 text-gray-500 shadow-sm"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="h-4 w-4"
              fill="currentColor"
            >
              <path d="M10 4a1 1 0 0 1 1 1v4h4a1 1 0 1 1 0 2h-4v4a1 1 0 1 1-2 0v-4H5a1 1 0 1 1 0-2h4V5a1 1 0 0 1 1-1z" />
            </svg>
          </button>
        </div>

        <nav className="mt-4 space-y-1 text-sm">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <a
                key={item.label}
                href={item.href}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left ${
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 ${
                    isActive ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  {item.icon === "team" && (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-4 w-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 12a4 4 0 1 1 8 0m-8 0a5 5 0 0 0-5 5v2h18v-2a5 5 0 0 0-5-5m-8 0h8"
                      />
                    </svg>
                  )}
                  {item.icon === "workload" && (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-4 w-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 20V10M12 20V6M18 20v-4"
                      />
                    </svg>
                  )}
                  {item.icon === "response" && (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-4 w-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 11l2 2 4-4m7 3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
                      />
                    </svg>
                  )}
                  {item.icon === "satisfaction" && (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-4 w-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 10h.01M15 10h.01M8.5 14a5 5 0 0 0 7 0"
                      />
                    </svg>
                  )}
                  {item.icon === "goals" && (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-4 w-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 3a9 9 0 1 1-9 9 9 9 0 0 1 9-9zm0 4a5 5 0 1 1-5 5 5 5 0 0 1 5-5zm0 3a2 2 0 1 1-2 2 2 2 0 0 1 2-2z"
                      />
                    </svg>
                  )}
                </span>
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="mt-6 border-t border-gray-100 pt-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            AI detected topics
          </p>
          <div className="mt-3 space-y-3 text-xs text-gray-500">
            {topTags.length > 0 ? (
              topTags.map((tag) => {
                const percent =
                  totalRequests > 0
                    ? Math.round((tag.count / totalRequests) * 100)
                    : 0;
                return (
                  <div key={tag.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span>{tag.label}</span>
                      <span>{percent}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100">
                      <div
                        className="h-1.5 rounded-full bg-gray-900"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-gray-500">No topics detected yet.</p>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
