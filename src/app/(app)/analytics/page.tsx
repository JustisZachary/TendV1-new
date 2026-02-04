import { supabase } from "@/lib/supabase";
import { TagId, TAG_CATEGORIES, parseTagString } from "@/lib/tags";
import { mockSubmissions } from "@/lib/mockSubmissions";
import { getLoggedInEmail, isAdminEmail, isTestEmail } from "@/lib/auth";

import { getTagClasses, resolveTagId, TAG_STYLES } from "../people/peopleHelpers";
import AnalyticsMetricsChart from "./AnalyticsMetricsChart";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SubmissionMetrics = {
  tags: string | null;
  createdAt: string;
  updatedAt: string;
  helpTopic: string | null;
  email: string | null;
  source: string | null;
  primaryCampus: string | null;
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
  const loggedInEmail = await getLoggedInEmail();
  const showRealData = isAdminEmail(loggedInEmail);
  const showMockData = isTestEmail(loggedInEmail);

  let submissions: SubmissionMetrics[] = [];

  if (showRealData && supabase) {
    const { data, error } = await supabase
      .from("Submission")
      .select("tags, createdAt, updatedAt, helpTopic, email, primaryCampus")
      .order("createdAt", { ascending: false });

    if (error && process.env.NODE_ENV !== "production") {
      console.warn("AnalyticsPage: failed to load submissions.", error);
    } else {
      // Real data doesn't have source field, default to "form"
      submissions = (data ?? []).map((row) => ({
        ...row,
        source: "form",
      }));
    }
  } else if (showMockData) {
    submissions = mockSubmissions.map((submission) => ({
      tags: submission.tags,
      createdAt: submission.createdAt,
      updatedAt: submission.updatedAt,
      helpTopic: submission.helpTopic,
      email: submission.email,
      source: submission.source ?? "form",
      primaryCampus: submission.primaryCampus,
    }));
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

  // Calculate tag counts for the metrics chart
  const tagCounts = submissions.reduce<Record<string, number>>(
    (acc, submission) => {
      const tags = parseTagString(submission.tags);
      tags.forEach((tag) => {
        acc[tag] = (acc[tag] ?? 0) + 1;
      });
      return acc;
    },
    {}
  );

  const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekdayCounts = submissions.reduce<number[]>((acc, submission) => {
    const createdAt = new Date(submission.createdAt);
    if (!Number.isNaN(createdAt.getTime())) {
      const dayIndex = createdAt.getDay(); // 0=Sun..6=Sat
      const normalizedIndex = (dayIndex + 6) % 7; // shift to Mon..Sun
      acc[normalizedIndex] += 1;
    }
    return acc;
  }, Array.from({ length: 7 }, () => 0));
  const maxWeekdayCount = Math.max(1, ...weekdayCounts);
  const chartPoints = weekdayCounts
    .map((count, index) => {
      const x = 10 + index * (680 / 6);
      const y = 180 - (count / maxWeekdayCount) * 140;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <>
      <div className="border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-xs uppercase tracking-widest text-gray-400">
          Dashboard
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Analytics</h1>
        <p className="mt-3 text-sm text-gray-600">
          Review keyword trends across form requests.
        </p>
      </div>

      <div className="flex flex-col gap-6 px-6 pb-6">
        <section className="grid gap-6 lg:grid-cols-2">
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
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Avg time to resolution
                </p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {formatDuration(averageResolutionMs)}
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
              Workload over time
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-600"
              >
                New conversations
              </button>
              <button
                type="button"
                className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-600"
              >
                Compare
              </button>
              <button
                type="button"
                className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  className="h-4 w-4 text-gray-500"
                  fill="currentColor"
                >
                  <path d="M3 14a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1h-2v1H5v-1H3v1zm7-12a1 1 0 0 0-1 1v6.586L7.707 8.293a1 1 0 0 0-1.414 1.414l3 3a1 1 0 0 0 1.414 0l3-3a1 1 0 1 0-1.414-1.414L11 9.586V3a1 1 0 0 0-1-1z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="relative h-56">
                <div className="absolute inset-0 grid grid-rows-4 gap-0">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div
                      key={`grid-${idx}`}
                      className="border-t border-dashed border-gray-200"
                    />
                  ))}
                </div>
                <svg
                  viewBox="0 0 700 200"
                  className="absolute inset-0 h-full w-full"
                  role="img"
                  aria-label="Workload over time"
                >
                  <polyline
                    fill="none"
                    stroke="#7c3aed"
                    strokeWidth="2"
                    points={chartPoints}
                  />
                </svg>
              </div>
              <div className="mt-3 grid grid-cols-7 text-xs text-gray-400">
                {weekdayLabels.map((label) => (
                  <div key={label} className="text-center">
                    {label}
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500">
                <span className="h-2 w-2 rounded-full bg-gray-500" />
                New conversations
              </div>
            </div>
          </div>
        </section>

        <AnalyticsMetricsChart
          submissions={submissions.map((s) => ({
            tags: s.tags,
            source: s.source,
            primaryCampus: s.primaryCampus,
          }))}
          tagCounts={tagCounts}
          totalRequests={totalRequests}
        />
      </div>
    </>
  );
}
