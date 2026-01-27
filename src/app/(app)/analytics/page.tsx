import { prisma } from "@/lib/db";
import { TAG_CATEGORIES, parseTagString } from "@/lib/tags";

export default async function AnalyticsPage() {
  const submissions = await prisma.submission.findMany({
    select: {
      tags: true,
    },
  });

  const totalRequests = submissions.length;
  const categoryTotals = TAG_CATEGORIES.map((category) => {
    const count = submissions.filter((submission) =>
      parseTagString(submission.tags).includes(category.id)
    ).length;

    return {
      ...category,
      count,
      percentage: totalRequests
        ? Math.round((count / totalRequests) * 100)
        : 0,
    };
  });

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

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categoryTotals.map((category) => (
            <div
              key={category.id}
              className="rounded-xl border border-gray-100 bg-gray-50 p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {category.label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-gray-900">
                {category.percentage}%
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {category.count} request{category.count === 1 ? "" : "s"} tagged
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
