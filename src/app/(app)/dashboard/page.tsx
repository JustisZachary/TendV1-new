import { TAG_CATEGORIES, type TagId, parseTagString } from "@/lib/tags";
import { supabase } from "@/lib/supabase";

type DashboardPageProps = {
  searchParams?:
    | { range?: string; campus?: string; tag?: string }
    | Promise<{ range?: string; campus?: string; tag?: string }>;
};

const tagStyles: Record<TagId, { text: string; border: string; bg: string }> = {
  marriage: { text: "text-red-700", border: "border-red-200", bg: "bg-red-50" },
  finances: { text: "text-blue-700", border: "border-blue-200", bg: "bg-blue-50" },
  "spiritual-health": {
    text: "text-purple-700",
    border: "border-purple-200",
    bg: "bg-purple-50",
  },
  "mental-health": {
    text: "text-green-700",
    border: "border-green-200",
    bg: "bg-green-50",
  },
  "faith-questions": {
    text: "text-yellow-700",
    border: "border-yellow-200",
    bg: "bg-yellow-50",
  },
  other: { text: "text-gray-600", border: "border-gray-200", bg: "bg-gray-50" },
};

const rangeOptions = [
  { id: "day", label: "Today", days: 1 },
  { id: "week", label: "Last 7 days", days: 7 },
  { id: "month", label: "Last 30 days", days: 30 },
  { id: "year", label: "Last 12 months", days: 365 },
] as const;

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const selectedRange =
    rangeOptions.find((option) => option.id === resolvedSearchParams?.range) ??
    rangeOptions[0];
  const selectedTag = TAG_CATEGORIES.find(
    (category) => category.id === resolvedSearchParams?.tag
  )?.id;
  const selectedCampus = resolvedSearchParams?.campus?.trim();
  const now = new Date();
  const rangeStart = new Date(now);
  rangeStart.setDate(now.getDate() - selectedRange.days);

  let submissions: {
    tags: string | null;
    createdAt: string;
    primaryCampus: string | null;
  }[] = [];

  if (supabase) {
    let query = supabase
      .from("Submission")
      .select("tags, createdAt, primaryCampus")
      .gte("createdAt", rangeStart.toISOString())
      .order("createdAt", { ascending: false });

    if (selectedCampus) {
      query = query.eq("primaryCampus", selectedCampus);
    }

    if (selectedTag) {
      query = query.like("tags", `%|${selectedTag}|%`);
    }

    const { data, error } = await query;

    if (error && process.env.NODE_ENV !== "production") {
      console.warn("DashboardPage: failed to load submissions.", error);
    } else {
      submissions = data ?? [];
    }
  }

  const tagCounts = TAG_CATEGORIES.reduce<Record<TagId, number>>(
    (acc, category) => {
      acc[category.id] = 0;
      return acc;
    },
    {} as Record<TagId, number>
  );

  const campusOptions = Array.from(
    new Set(
      submissions
        .map((submission) => submission.primaryCampus?.trim())
        .filter(Boolean)
    )
  ) as string[];

  submissions.forEach((submission) => {
    const tags = parseTagString(submission.tags);
    const resolvedTags = tags.length > 0 ? tags : (["other"] as TagId[]);
    resolvedTags.forEach((tag) => {
      if (tagCounts[tag] !== undefined) {
        tagCounts[tag] += 1;
      }
    });
  });

  const campusTagCounts = submissions.reduce<Record<string, number>>(
    (acc, submission) => {
      const campus = submission.primaryCampus?.trim() || "Unknown campus";
      const tags = parseTagString(submission.tags);
      const resolvedTags = tags.length > 0 ? tags : (["other"] as TagId[]);
      acc[campus] = (acc[campus] ?? 0) + resolvedTags.length;
      return acc;
    },
    {}
  );
  const campusTotals = Object.entries(campusTagCounts).sort(
    ([, countA], [, countB]) => countB - countA
  );

  const mostPopular = Object.entries(tagCounts)
    .filter(([tag]) => tag !== "other")
    .sort(([, countA], [, countB]) => countB - countA)[0];

  const mostPopularId = (mostPopular?.[0] as TagId | undefined) ?? null;
  const mostPopularCount = mostPopular?.[1] ?? 0;
  const mostPopularLabel =
    TAG_CATEGORIES.find((category) => category.id === mostPopularId)?.label ??
    "No data";

  const tagStyle = mostPopularId ? tagStyles[mostPopularId] : tagStyles.other;
  const tagOptions = TAG_CATEGORIES.filter((category) => category.id !== "other");
  const buildFilterHref = (next: {
    range?: string | null;
    campus?: string | null;
    tag?: string | null;
  }) => {
    const params = new URLSearchParams();
    const range = next.range ?? selectedRange.id;
    if (range) params.set("range", range);
    const campus =
      next.campus === null ? undefined : next.campus ?? selectedCampus;
    if (campus) params.set("campus", campus);
    const tag = next.tag === null ? undefined : next.tag ?? selectedTag;
    if (tag) params.set("tag", tag);
    const query = params.toString();
    return query ? `/dashboard?${query}` : "/dashboard";
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-gray-100 pb-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <h1 className="text-lg font-semibold text-gray-900">Workload</h1>
            <p className="text-xs text-gray-500">
              Data from up to 1 hour ago
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm"
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
          className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 font-semibold text-gray-600 shadow-sm"
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
          className="flex items-center gap-2 rounded-full bg-purple-700 px-3 py-2 font-semibold text-white shadow-sm"
          type="button"
        >
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
          className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 font-semibold text-gray-600 shadow-sm"
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
          className="flex items-center gap-1 rounded-md px-2 py-2 font-semibold text-purple-700"
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
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Key metrics</h2>
            <div className="flex items-center gap-2">
              <details className="relative">
                <summary className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-600 shadow-sm">
                  Range
                  <span className="text-gray-400">· {selectedRange.label}</span>
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
                </summary>
                <div className="absolute right-0 z-10 mt-2 w-40 rounded-lg border border-gray-200 bg-white p-1 text-xs shadow-lg">
                  {rangeOptions.map((option) => {
                    const isActive = option.id === selectedRange.id;
                    return (
                      <a
                        key={option.id}
                        href={buildFilterHref({ range: option.id })}
                        className={`flex items-center justify-between rounded-md px-2 py-1.5 font-semibold ${
                          isActive
                            ? "bg-purple-50 text-purple-700"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {option.label}
                        {isActive ? (
                          <span className="text-purple-700">✓</span>
                        ) : null}
                      </a>
                    );
                  })}
                </div>
              </details>
              <details className="relative">
                <summary className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-600 shadow-sm">
                  Campus
                  <span className="text-gray-400">
                    · {selectedCampus ?? "All"}
                  </span>
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
                </summary>
                <div className="absolute right-0 z-10 mt-2 w-44 rounded-lg border border-gray-200 bg-white p-1 text-xs shadow-lg">
                  <a
                    href={buildFilterHref({ campus: null })}
                    className={`flex items-center justify-between rounded-md px-2 py-1.5 font-semibold ${
                      !selectedCampus
                        ? "bg-purple-50 text-purple-700"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    All campuses
                    {!selectedCampus ? (
                      <span className="text-purple-700">✓</span>
                    ) : null}
                  </a>
                  {campusOptions.map((campus) => {
                    const isActive = campus === selectedCampus;
                    return (
                      <a
                        key={campus}
                        href={buildFilterHref({ campus })}
                        className={`flex items-center justify-between rounded-md px-2 py-1.5 font-semibold ${
                          isActive
                            ? "bg-purple-50 text-purple-700"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {campus}
                        {isActive ? (
                          <span className="text-purple-700">✓</span>
                        ) : null}
                      </a>
                    );
                  })}
                </div>
              </details>
              <details className="relative">
                <summary className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-600 shadow-sm">
                  Tag
                  <span className="text-gray-400">
                    ·{" "}
                    {selectedTag
                      ? TAG_CATEGORIES.find((category) => category.id === selectedTag)
                          ?.label
                      : "All"}
                  </span>
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
                </summary>
                <div className="absolute right-0 z-10 mt-2 w-44 rounded-lg border border-gray-200 bg-white p-1 text-xs shadow-lg">
                  <a
                    href={buildFilterHref({ tag: null })}
                    className={`flex items-center justify-between rounded-md px-2 py-1.5 font-semibold ${
                      !selectedTag
                        ? "bg-purple-50 text-purple-700"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    All tags
                    {!selectedTag ? (
                      <span className="text-purple-700">✓</span>
                    ) : null}
                  </a>
                  {tagOptions.map((tag) => {
                    const isActive = tag.id === selectedTag;
                    return (
                      <a
                        key={tag.id}
                        href={buildFilterHref({ tag: tag.id })}
                        className={`flex items-center justify-between rounded-md px-2 py-1.5 font-semibold ${
                          isActive
                            ? "bg-purple-50 text-purple-700"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {tag.label}
                        {isActive ? (
                          <span className="text-purple-700">✓</span>
                        ) : null}
                      </a>
                    );
                  })}
                </div>
              </details>
            </div>
          </div>
          {mostPopularId && mostPopularCount > 0 ? (
            <div className="mt-8 flex flex-col items-center gap-3 text-center text-xs text-gray-500">
              <div
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${tagStyle.border} ${tagStyle.bg} ${tagStyle.text}`}
              >
                {mostPopularLabel}
              </div>
              <p className="text-3xl font-semibold text-gray-900">
                {mostPopularCount}
              </p>
              <p className="text-xs text-gray-500">
                Most popular tag ({selectedRange.label.toLowerCase()})
              </p>
              {campusTotals.length > 0 ? (
                <div className="mt-4 w-full space-y-2 text-left">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    Tag totals by campus
                  </p>
                  <div className="space-y-1 text-xs text-gray-600">
                    {campusTotals.map(([campus, count]) => (
                      <div
                        key={campus}
                        className="flex items-center justify-between"
                      >
                        <span>{campus}</span>
                        <span className="font-semibold text-gray-700">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-8 flex flex-col items-center gap-3 text-center text-xs text-gray-500">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <div className="h-4 w-8 rounded-md bg-gray-200" />
              </div>
              <p className="text-sm font-semibold text-gray-700">No data</p>
              <p>No matching data for the selected filters.</p>
            </div>
          )}
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
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
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
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
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
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
