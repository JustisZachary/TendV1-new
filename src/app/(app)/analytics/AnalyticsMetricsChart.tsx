"use client";

import { useState } from "react";

type MetricFilter = "tags" | "source" | "campus";

type SubmissionData = {
  tags: string | null;
  source: string | null;
  primaryCampus: string | null;
};

type AnalyticsMetricsChartProps = {
  submissions: SubmissionData[];
  tagCounts: Record<string, number>;
  totalRequests: number;
};

const TAG_STYLES: Record<
  string,
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

const SOURCE_STYLES: Record<
  string,
  { text: string; border: string; dot: string; slice: string; label: string }
> = {
  form: {
    text: "text-indigo-700",
    border: "border-indigo-200",
    dot: "bg-indigo-500",
    slice: "#4f46e5",
    label: "Form Submissions",
  },
  sms: {
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    slice: "#059669",
    label: "Text Messages",
  },
  email: {
    text: "text-sky-700",
    border: "border-sky-200",
    dot: "bg-sky-500",
    slice: "#0284c7",
    label: "Email",
  },
  social: {
    text: "text-pink-700",
    border: "border-pink-200",
    dot: "bg-pink-500",
    slice: "#db2777",
    label: "Social Media DMs",
  },
};

const CAMPUS_COLORS = [
  { text: "text-violet-700", border: "border-violet-200", dot: "bg-violet-500", slice: "#7c3aed" },
  { text: "text-orange-700", border: "border-orange-200", dot: "bg-orange-500", slice: "#ea580c" },
  { text: "text-teal-700", border: "border-teal-200", dot: "bg-teal-500", slice: "#0d9488" },
  { text: "text-rose-700", border: "border-rose-200", dot: "bg-rose-500", slice: "#e11d48" },
  { text: "text-cyan-700", border: "border-cyan-200", dot: "bg-cyan-500", slice: "#0891b2" },
  { text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500", slice: "#d97706" },
];

const TAG_LABELS: Record<string, string> = {
  marriage: "Marriage",
  finances: "Finances",
  "spiritual-health": "Spiritual Health",
  "mental-health": "Mental Health",
  "faith-questions": "Faith Questions",
  other: "Other",
};

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

export default function AnalyticsMetricsChart({
  submissions,
  tagCounts,
  totalRequests,
}: AnalyticsMetricsChartProps) {
  const [activeFilter, setActiveFilter] = useState<MetricFilter>("tags");
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  // Calculate source counts
  const sourceCounts = submissions.reduce<Record<string, number>>(
    (acc, submission) => {
      const source = submission.source ?? "form";
      acc[source] = (acc[source] ?? 0) + 1;
      return acc;
    },
    {}
  );

  // Calculate campus counts
  const campusCounts = submissions.reduce<Record<string, number>>(
    (acc, submission) => {
      const campus = submission.primaryCampus ?? "Unknown";
      // Normalize campus names
      const normalizedCampus = campus.replace(/\s*campus\s*/i, "").trim() || "Unknown";
      acc[normalizedCampus] = (acc[normalizedCampus] ?? 0) + 1;
      return acc;
    },
    {}
  );

  // Get current data based on filter
  const getCurrentData = () => {
    if (activeFilter === "tags") {
      const tagEntries = Object.entries(tagCounts).filter(
        ([id]) => id !== "other"
      );
      const total = tagEntries.reduce((sum, [, count]) => sum + count, 0);
      return tagEntries.map(([id, count]) => ({
        id,
        label: TAG_LABELS[id] ?? id,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        share: total > 0 ? count / total : 0,
        styles: TAG_STYLES[id] ?? TAG_STYLES.other,
      }));
    }

    if (activeFilter === "source") {
      const total = Object.values(sourceCounts).reduce(
        (sum, count) => sum + count,
        0
      );
      return Object.entries(sourceCounts).map(([id, count]) => ({
        id,
        label: SOURCE_STYLES[id]?.label ?? id,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        share: total > 0 ? count / total : 0,
        styles: SOURCE_STYLES[id] ?? {
          text: "text-gray-600",
          border: "border-gray-200",
          dot: "bg-gray-400",
          slice: "#6b7280",
        },
      }));
    }

    // Campus filter
    const total = Object.values(campusCounts).reduce(
      (sum, count) => sum + count,
      0
    );
    return Object.entries(campusCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([id, count], index) => ({
        id,
        label: id,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        share: total > 0 ? count / total : 0,
        styles: CAMPUS_COLORS[index % CAMPUS_COLORS.length],
      }));
  };

  const currentData = getCurrentData();

  // Build pie slices
  const slices = currentData.map((item) => ({
    ...item,
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
    if (endAngle - startAngle >= 360) {
      // Full circle
      return `M ${center} ${center - radius} A ${radius} ${radius} 0 1 1 ${center - 0.01} ${center - radius} Z`;
    }
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

  const filterLabels: Record<MetricFilter, string> = {
    tags: "By Tag",
    source: "By Source",
    campus: "By Campus",
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-gray-900">
          {activeFilter === "tags" && "Keyword category metrics"}
          {activeFilter === "source" && "Submission source breakdown"}
          {activeFilter === "campus" && "Campus distribution"}
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
            {(["tags", "source", "campus"] as MetricFilter[]).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  activeFilter === filter
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {filterLabels[filter]}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-500">
            {totalRequests} total requests
          </span>
        </div>
      </div>

      <div className="tag-metrics mt-6 grid gap-6 lg:grid-cols-[220px_1fr] lg:items-center">
        <div className="flex items-center justify-center">
          <svg
            className="h-48 w-48"
            viewBox="0 0 200 200"
            role="img"
            aria-label={`${filterLabels[activeFilter]} distribution`}
          >
            {totalRequests === 0 || slices.length === 0 ? (
              <circle cx="100" cy="100" r={radius} fill="#e5e7eb" />
            ) : (
              slices.map((slice) => (
                <g
                  key={slice.id}
                  className="pie-slice-group"
                  onMouseEnter={() => setHoveredSlice(slice.id)}
                  onMouseLeave={() => setHoveredSlice(null)}
                  style={{ cursor: "pointer" }}
                >
                  <path
                    d={arcPath(slice.startAngle, slice.endAngle)}
                    fill={slice.styles.slice}
                    className="pie-slice-path origin-center transition-all duration-200"
                    style={{
                      opacity: hoveredSlice && hoveredSlice !== slice.id ? 0.4 : 1,
                      transform: hoveredSlice === slice.id ? "scale(1.03)" : "scale(1)",
                      transformOrigin: "100px 100px",
                      filter: hoveredSlice === slice.id ? "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.15))" : "none",
                    }}
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
        <div className={`grid gap-4 ${currentData.length > 4 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
          {currentData.map((item) => {
            const isHighlighted = hoveredSlice === item.id;
            const isDimmed = hoveredSlice && hoveredSlice !== item.id;
            return (
              <div
                key={item.id}
                className={`metric-card group relative rounded-xl border bg-white p-4 transition-all duration-200 ${item.styles.border} ${
                  isHighlighted ? "scale-[1.02] shadow-lg" : ""
                } ${isDimmed ? "opacity-50" : ""}`}
                style={{
                  boxShadow: isHighlighted
                    ? `0 0 0 2px white, 0 0 0 4px ${item.styles.slice}, 0 10px 15px -3px rgba(0, 0, 0, 0.1)`
                    : undefined,
                }}
                onMouseEnter={() => setHoveredSlice(item.id)}
                onMouseLeave={() => setHoveredSlice(null)}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full transition-transform duration-200 ${item.styles.dot} ${
                      isHighlighted ? "scale-125" : ""
                    }`}
                    aria-hidden="true"
                  />
                  <p
                    className={`text-xs font-semibold uppercase tracking-wide ${item.styles.text}`}
                  >
                    {item.label}
                  </p>
                </div>
                <p className={`mt-2 text-2xl font-semibold ${item.styles.text}`}>
                  {item.percentage}%
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {item.count} request{item.count === 1 ? "" : "s"}
                </p>
                <div
                  className={`pointer-events-none absolute left-4 top-3 -translate-y-full rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-700 shadow-sm transition-opacity duration-200 ${
                    isHighlighted ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {item.count} request{item.count === 1 ? "" : "s"} •{" "}
                  {item.percentage}% of total
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
