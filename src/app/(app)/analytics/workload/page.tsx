import { mockMessageSeeds, mockSubmissions } from "@/lib/mockSubmissions";
import { supabase } from "@/lib/supabase";
import { getLoggedInEmail, isAdminEmail, isTestEmail } from "@/lib/auth";

type WorkloadSubmission = {
  createdAt: string;
  updatedAt: string;
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

const formatDateRange = (dates: string[]) => {
  if (dates.length === 0) {
    return "No data";
  }
  const sorted = dates
    .map((date) => new Date(date))
    .filter((value) => !Number.isNaN(value.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());
  if (sorted.length === 0) {
    return "No data";
  }
  const start = sorted[0];
  const end = sorted[sorted.length - 1];
  const startLabel = start.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const endLabel = end.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${startLabel} - ${endLabel}`;
};

const getHeatClass = (count: number, maxCount: number) => {
  if (count <= 0 || maxCount === 0) return "bg-gray-100";
  const ratio = count / maxCount;
  if (ratio > 0.75) return "bg-purple-500";
  if (ratio > 0.5) return "bg-purple-400";
  if (ratio > 0.25) return "bg-purple-300";
  return "bg-purple-200";
};

export default async function WorkloadPage() {
  const loggedInEmail = await getLoggedInEmail();
  const showRealData = isAdminEmail(loggedInEmail);
  const showMockData = isTestEmail(loggedInEmail);

  let submissions: WorkloadSubmission[] = [];

  if (showRealData && supabase) {
    const { data, error } = await supabase
      .from("Submission")
      .select("createdAt, updatedAt")
      .order("createdAt", { ascending: false });

    if (error && process.env.NODE_ENV !== "production") {
      console.warn("WorkloadPage: failed to load submissions.", error);
    } else {
      submissions = data ?? [];
    }
  } else if (showMockData) {
    submissions = mockSubmissions.map((submission) => ({
      createdAt: submission.createdAt,
      updatedAt: submission.updatedAt,
    }));
  }

  const dates = submissions.map((submission) => submission.createdAt);
  const dateRangeLabel = formatDateRange(dates);

  // For mock data, use seed messages; for real data, estimate based on submissions
  const messagesSent = showMockData
    ? Object.values(mockMessageSeeds)
        .flat()
        .filter((message) => message.sender === "user").length
    : submissions.length;

  const responseDurations = submissions
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
  const averageResponseMs =
    responseDurations.length > 0
      ? responseDurations.reduce((sum, value) => sum + value, 0) /
        responseDurations.length
      : 0;
  const averageHandleMs = responseDurations.length
    ? responseDurations.reduce((sum, value) => sum + value, 0) /
      responseDurations.length /
      3
    : 0;
  const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const timeLabels = [
    "9 AM",
    "10 AM",
    "11 AM",
    "12 PM",
    "1 PM",
    "2 PM",
    "3 PM",
    "4 PM",
  ];
  const hourBuckets = [9, 10, 11, 12, 13, 14, 15, 16];
  const heatmap = hourBuckets.map(() => Array.from({ length: 7 }, () => 0));
  submissions.forEach((submission) => {
    const createdAt = new Date(submission.createdAt);
    if (Number.isNaN(createdAt.getTime())) return;
    const hour = createdAt.getHours();
    const hourIndex = hourBuckets.indexOf(hour);
    if (hourIndex === -1) return;
    const dayIndex = createdAt.getDay();
    const normalizedIndex = (dayIndex + 6) % 7;
    heatmap[hourIndex][normalizedIndex] += 1;
  });
  const maxHeat = Math.max(0, ...heatmap.flat());
  return (
    <>
      <div className="border border-gray-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Team performance
            </h1>
            <p className="mt-1 text-xs text-gray-500">
              Data from up to 1 hour ago
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-600"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                className="h-4 w-4"
                fill="currentColor"
              >
                <path d="M3 14a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1h-2v1H5v-1H3v1zm7-12a1 1 0 0 0-1 1v6.586L7.707 8.293a1 1 0 0 0-1.414 1.414l3 3a1 1 0 0 0 1.414 0l3-3a1 1 0 1 0-1.414-1.414L11 9.586V3a1 1 0 0 0-1-1z" />
              </svg>
            </button>
            <button
              type="button"
              className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600"
            >
              All views
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5 px-6 pb-6 pt-4">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-3 text-xs text-gray-500">
          <button
            type="button"
            className="font-semibold text-gray-900"
          >
            Default
          </button>
          <button type="button" className="text-gray-500">
            Add view
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            dateRangeLabel,
            "All shared inboxes",
            "All teammates",
            "More filters",
          ].map((label) => (
            <button
              key={label}
              type="button"
              className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600"
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Key metrics</h2>
              <button
                type="button"
                className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] text-gray-600"
              >
                Messages sent, +2
              </button>
            </div>
            <div className="mt-4 space-y-5">
              {[
                {
                  label: "Messages sent",
                  value: `${messagesSent}`,
                  trend: "+19%",
                },
                {
                  label: "Reply time (avg)",
                  value: formatDuration(averageResponseMs),
                  trend: "+37%",
                },
                {
                  label: "Handle time (avg)",
                  value: formatDuration(averageHandleMs),
                  trend: "+12%",
                },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                >
                  <p className="text-xs text-gray-500">{metric.label}</p>
                  <div className="mt-2 flex items-baseline justify-between">
                    <p className="text-2xl font-semibold text-gray-900">
                      {metric.value}
                    </p>
                    <span className="text-xs text-gray-500">
                      {metric.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-gray-900">
                  Busiest times
                </h2>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">New conversations</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <button
                  type="button"
                  className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-600"
                >
                  New conversations
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
                    <path d="M3 4a1 1 0 0 1 1-1h4a1 1 0 1 1 0 2H5v10h10v-3a1 1 0 1 1 2 0v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4z" />
                    <path d="M12 3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 1 1-2 0V5.414l-6.293 6.293a1 1 0 1 1-1.414-1.414L14.586 4H13a1 1 0 0 1-1-1z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs text-gray-400">
              <div className="grid grid-cols-[40px_repeat(7,1fr)] gap-2">
                <div />
                {weekdayLabels.map((day) => (
                  <div key={day} className="text-center">
                    {day}
                  </div>
                ))}
              </div>
              {timeLabels.map((time, rowIndex) => (
                <div
                  key={time}
                  className="grid grid-cols-[40px_repeat(7,1fr)] gap-2"
                >
                  <div className="flex items-center">{time}</div>
                  {Array.from({ length: 7 }).map((_, idx) => (
                    <div
                      key={`${time}-${idx}`}
                      className={`h-7 rounded-md ${getHeatClass(
                        heatmap[rowIndex]?.[idx] ?? 0,
                        maxHeat
                      )}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </section>
        </div>

      </div>
    </>
  );
}
