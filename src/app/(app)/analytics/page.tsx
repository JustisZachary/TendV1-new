import { supabase } from "@/lib/supabase";
import { TagId, TAG_CATEGORIES, parseTagString } from "@/lib/tags";

import { getTagClasses, resolveTagId, TAG_STYLES } from "../people/peopleHelpers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

type SubmissionMetrics = {
  tags: string | null;
  createdAt: string;
  updatedAt: string;
  helpTopic: string | null;
  email: string | null;
};

const formatHourLabel = (hour: number) => {
  const period = hour >= 12 ? "PM" : "AM";
  const normalized = hour % 12 === 0 ? 12 : hour % 12;
  return `${normalized} ${period}`;
};

const formatDuration = (milliseconds: number) => {
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) {
    return "Not available";
  }
  const totalMinutes = Math.round(milliseconds / 60000);
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  if (totalHours < 48) {
    return `${totalHours} hr ${remainingMinutes} min`;
  }
  const totalDays = Math.round(totalHours / 24);
  return `${totalDays} days`;
};

export default async function AnalyticsPage() {
  let submissions: SubmissionMetrics[] = [];

  if (supabase) {
    const { data, error } = await supabase
      .from("Submission")
      .select("tags, createdAt, updatedAt, helpTopic, email")
      .order("createdAt", { ascending: false });

    if (error && process.env.NODE_ENV !== "production") {
      console.warn("AnalyticsPage: failed to load submissions.", error);
    } else {
      submissions = data ?? [];
    }
  }

  const submissionTags: TagId[][] = submissions.map((submission) => {
    const tags = parseTagString(submission.tags);
    return tags.length > 0 ? tags : ["other"];
  });
  const totalRequests = submissionTags.length;
  const submissionsByEmail = submissions.reduce<Record<string, number>>(
    (acc, submission) => {
      if (!submission.email) {
        return acc;
      }
      acc[submission.email] = (acc[submission.email] ?? 0) + 1;
      return acc;
    },
    {}
  );
  const uniqueProfiles = Object.keys(submissionsByEmail).length;
  const tagCountsByTag = submissions.reduce<Record<string, number>>(
    (acc, submission) => {
      const tags = parseTagString(submission.tags);
      tags.forEach((tag) => {
        acc[tag] = (acc[tag] ?? 0) + 1;
      });
      if (submission.helpTopic) {
        const tagId = resolveTagId(submission.helpTopic);
        if (tagId) {
          acc[tagId] = (acc[tagId] ?? 0) + 1;
        }
      }
      return acc;
    },
    {}
  );
  const topTags = Object.entries(tagCountsByTag)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 5)
    .map(([tagId, count]) => {
      const label =
        TAG_CATEGORIES.find((category) => category.id === tagId)?.label ??
        tagId;
      return { id: tagId, label, count };
    });
  const hourBuckets = submissions.reduce<number[]>((acc, submission) => {
    const createdAt = new Date(submission.createdAt);
    if (!Number.isNaN(createdAt.getTime())) {
      acc[createdAt.getHours()] += 1;
    }
    return acc;
  }, Array.from({ length: 24 }, () => 0));
  const busiestHours = hourBuckets
    .map((count, hour) => ({ hour, count }))
    .filter((entry) => entry.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
  const resolutionDurations = submissions
    .map((submission) => {
      const createdAt = new Date(submission.createdAt).getTime();
      const updatedAt = new Date(submission.updatedAt).getTime();
      if (Number.isNaN(createdAt) || Number.isNaN(updatedAt)) {
        return null;
      }
      const diff = updatedAt - createdAt;
      return diff > 0 ? diff : null;
    })
    .filter((value): value is number => value !== null);
  const averageResolutionMs =
    resolutionDurations.length > 0
      ? resolutionDurations.reduce((sum, value) => sum + value, 0) /
        resolutionDurations.length
      : 0;
  const tagMetricStyles: Record<
    TagId,
    { text: string; border: string; dot: string; slice: string }
  > = {
    marriage: {
      text: "text-red-700",
      border: "border-red-200",
      dot: "bg-red-500",
      slice: "#dc2626",
    },
    finances: {
      text: "text-blue-700",
      border: "border-blue-200",
      dot: "bg-blue-500",
      slice: "#2563eb",
    },
    "spiritual-health": {
      text: "text-purple-700",
      border: "border-purple-200",
      dot: "bg-purple-500",
      slice: "#7e22ce",
    },
    "mental-health": {
      text: "text-green-700",
      border: "border-green-200",
      dot: "bg-green-500",
      slice: "#16a34a",
    },
    "faith-questions": {
      text: "text-yellow-700",
      border: "border-yellow-200",
      dot: "bg-yellow-400",
      slice: "#facc15",
    },
    other: {
      text: "text-gray-600",
      border: "border-gray-200",
      dot: "bg-gray-400",
      slice: "#6b7280",
    },
  };
  const pieCategories = TAG_CATEGORIES.filter(
    (category) => category.id !== "other"
  );
  const tagCounts = pieCategories.reduce<Record<TagId, number>>(
    (acc, category) => {
      acc[category.id] = 0;
      return acc;
    },
    {} as Record<TagId, number>
  );
  submissionTags.forEach((tags) => {
    tags.forEach((tag) => {
      if (tagCounts[tag] !== undefined) {
        tagCounts[tag] += 1;
      }
    });
  });
  const totalTaggedCount = Object.values(tagCounts).reduce(
    (sum, count) => sum + count,
    0
  );
  const categoryTotals = pieCategories.map((category) => {
    const count = tagCounts[category.id] ?? 0;

    return {
      ...category,
      color: tagMetricStyles[category.id].slice,
      count,
      percentage: totalTaggedCount
        ? Math.round((count / totalTaggedCount) * 100)
        : 0,
      share: totalTaggedCount ? count / totalTaggedCount : 0,
    };
  });
  const slices = categoryTotals.map((category) => ({
    ...category,
    startAngle: 0,
    endAngle: 0,
  }));
  let currentAngle = 0;
  slices.forEach((slice) => {
    slice.startAngle = currentAngle;
    slice.endAngle = currentAngle + slice.share * 360;
    currentAngle = slice.endAngle;
  });

  const center = 100;
  const radius = 88;
  const arcPath = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(center, center, radius, endAngle);
    const end = polarToCartesian(center, center, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      `M ${center} ${center}`,
      `L ${start.x} ${start.y}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
      "Z",
    ].join(" ");
  };

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

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">
            People + submission reporting
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Profiles tracked
              </p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {uniqueProfiles}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Submissions
              </p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {submissions.length}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Avg response time
              </p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {formatDuration(averageResolutionMs)}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Based on latest update timestamp.
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Avg time to resolution
              </p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {formatDuration(averageResolutionMs)}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Based on latest update timestamp.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">
            Tag + time insights
          </h2>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Top tags
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {topTags.length > 0 ? (
                  topTags.map((tag) => (
                    <span
                      key={tag.id}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getTagClasses(
                        (tag.id in TAG_STYLES ? tag.id : "other") as keyof typeof TAG_STYLES
                      )}`}
                    >
                      {tag.label} · {tag.count}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">
                    No tags have been applied yet.
                  </span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Busiest submission hours
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {busiestHours.length > 0 ? (
                  busiestHours.map((entry) => (
                    <span
                      key={entry.hour}
                      className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700"
                    >
                      {formatHourLabel(entry.hour)} · {entry.count}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">
                    Not enough data to determine peak times.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">
            Keyword category metrics
          </h2>
          <span className="text-xs text-gray-500">
            {totalRequests} total requests
          </span>
        </div>

        <div className="tag-metrics mt-6 grid gap-6 lg:grid-cols-[220px_1fr] lg:items-center">
          <div className="flex items-center justify-center">
            <svg
              className="h-48 w-48"
              viewBox="0 0 200 200"
              role="img"
              aria-label="Keyword category distribution"
            >
              {totalRequests === 0 ? (
                <circle cx="100" cy="100" r={radius} fill="#e5e7eb" />
              ) : (
                slices.map((slice) => (
                  <g key={slice.id} className="pie-slice-group">
                    <path
                      d={arcPath(slice.startAngle, slice.endAngle)}
                      fill={slice.color}
                      className="pie-slice-path"
                      data-tag={slice.id}
                    >
                    <title>
                      {slice.label}: {slice.count} request
                      {slice.count === 1 ? "" : "s"} ({slice.percentage}%)
                    </title>
                    </path>
                  </g>
                ))
              )}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="white"
                strokeWidth="2"
              />
            </svg>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {categoryTotals.map((category) => (
              <div
                key={category.id}
                className={`metric-card group relative rounded-xl border bg-white p-4 ${tagMetricStyles[category.id].border}`}
                data-tag={category.id}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${tagMetricStyles[category.id].dot}`}
                    aria-hidden="true"
                  />
                  <p
                    className={`text-xs font-semibold uppercase tracking-wide ${tagMetricStyles[category.id].text}`}
                  >
                    {category.label}
                  </p>
                </div>
                <p
                  className={`mt-2 text-2xl font-semibold ${tagMetricStyles[category.id].text}`}
                >
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
