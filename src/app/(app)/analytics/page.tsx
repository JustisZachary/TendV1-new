import { prisma } from "@/lib/db";
import { TagId, TAG_CATEGORIES, parseTagString } from "@/lib/tags";

export default async function AnalyticsPage() {
  const submissions = await prisma.submission.findMany({
    select: {
      tags: true,
    },
  });

  const totalRequests = submissions.length;
  const palette = ["#0072B2", "#009E73", "#E69F00", "#CC79A7", "#D55E00"];
  const iconById: Record<TagId, JSX.Element> = {
    marriage: (
      <svg
        aria-hidden="true"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7.5 6.5a3 3 0 1 1 6 0v4a3 3 0 1 1-6 0v-4Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.5 8.5h3m5 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 0v4a3 3 0 0 1-3 3h-2"
        />
      </svg>
    ),
    finances: (
      <svg
        aria-hidden="true"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 7h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 12h2M6 9v6"
        />
      </svg>
    ),
    "spiritual-health": (
      <svg
        aria-hidden="true"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v18m-5-9h10"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.5 5.5 17.5 18.5M17.5 5.5 6.5 18.5"
        />
      </svg>
    ),
    "mental-health": (
      <svg
        aria-hidden="true"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 4a6 6 0 0 1 6 6v3a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V9a5 5 0 0 1 5-5Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 10h6M9 13h6"
        />
      </svg>
    ),
    "faith-questions": (
      <svg
        aria-hidden="true"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.25 9.5a2.75 2.75 0 1 1 4.1 2.4c-.9.52-1.35 1.04-1.35 2.1v.5"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 17.5h.01"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Z"
        />
      </svg>
    ),
  };
  const categoryTotals = TAG_CATEGORIES.map((category, index) => {
    const count = submissions.filter((submission) =>
      parseTagString(submission.tags).includes(category.id)
    ).length;

    return {
      ...category,
      color: palette[index % palette.length],
      count,
      percentage: totalRequests
        ? Math.round((count / totalRequests) * 100)
        : 0,
      share: totalRequests ? count / totalRequests : 0,
    };
  });
  const pieStops: string[] = [];
  let currentAngle = 0;
  categoryTotals.forEach((category) => {
    const nextAngle = currentAngle + category.share * 360;
    pieStops.push(`${category.color} ${currentAngle}deg ${nextAngle}deg`);
    currentAngle = nextAngle;
  });
  const pieBackground = totalRequests
    ? `conic-gradient(${pieStops.join(", ")})`
    : "conic-gradient(#e5e7eb 0deg 360deg)";

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-xs uppercase tracking-widest text-gray-400">
          Dashboard
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Analytics</h1>
        <p className="mt-3 text-sm text-gray-600">
          Review keyword trends across form requests.
        </p>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">
            Keyword category metrics
          </h2>
          <span className="text-xs text-gray-500">
            {totalRequests} total requests
          </span>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr] lg:items-center">
          <div className="flex items-center justify-center">
            <div
              className="h-48 w-48 rounded-full"
              style={{ background: pieBackground }}
              aria-hidden="true"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {categoryTotals.map((category) => (
              <div
                key={category.id}
                className="group relative rounded-xl border border-gray-100 bg-gray-50 p-4"
              >
                <div className="flex items-center gap-2 text-gray-700">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: category.color }}
                    aria-hidden="true"
                  />
                  <span aria-hidden="true">{iconById[category.id]}</span>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {category.label}
                  </p>
                </div>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {category.percentage}%
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {category.count} request{category.count === 1 ? "" : "s"} tagged
                </p>
                <div className="pointer-events-none absolute left-4 top-3 hidden -translate-y-full rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-700 shadow-sm group-hover:block">
                  {category.count} request{category.count === 1 ? "" : "s"} •{" "}
                  {category.percentage}% of total
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
