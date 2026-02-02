"use client";

import { useEffect, useMemo, useState } from "react";

import type { Submission } from "@/lib/types";
import { TAG_CATEGORIES, type TagId, parseTagString } from "@/lib/tags";

import { getTagClasses, resolveTagId } from "./peopleHelpers";
import PeopleTagFilterSelect from "./PeopleTagFilterSelect";
import PeopleSortSelect from "./PeopleSortSelect";

type PeopleProfilesClientProps = {
  submissions: Submission[];
  submissionsByEmail: Record<string, number>;
  selectedTag: string;
  selectedSort: "newest" | "oldest";
  basePath?: string;
};

type NotesState = Record<string, string>;

const NOTES_STORAGE_KEY = "tend.people.notes";

const formatDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Unknown";
  }
  const now = new Date();
  const diffMs = now.getTime() - parsed.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) {
    return "Today";
  }
  if (diffDays === 1) {
    return "1d";
  }
  if (diffDays < 7) {
    return `${diffDays}d`;
  }
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const formatPhone = (submission: Submission) => {
  if (!submission.phoneNumber) {
    return "Not provided";
  }
  return `${submission.phoneNumber} (${submission.phoneType || "unknown"})`;
};

const getInitials = (firstName: string, lastName: string) => {
  const first = firstName?.charAt(0)?.toUpperCase() ?? "";
  const last = lastName?.charAt(0)?.toUpperCase() ?? "";
  return `${first}${last}` || "?";
};

export default function PeopleProfilesClient({
  submissions,
  submissionsByEmail,
  selectedTag,
  selectedSort,
  basePath,
}: PeopleProfilesClientProps) {
  const [notes, setNotes] = useState<NotesState>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState(submissions[0]?.id ?? "");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const stored = window.localStorage.getItem(NOTES_STORAGE_KEY);
    if (stored) {
      try {
        setNotes(JSON.parse(stored) as NotesState);
      } catch {
        setNotes({});
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  }, [isLoaded, notes]);

  useEffect(() => {
    if (!selectedId && submissions[0]?.id) {
      setSelectedId(submissions[0].id);
    }
  }, [selectedId, submissions]);

  const submissionsWithTagData = useMemo(
    () =>
      submissions.map((submission) => ({
        submission,
        tags: parseTagString(submission.tags),
      })),
    [submissions]
  );

  const selectedEntry = submissionsWithTagData.find(
    (entry) => entry.submission.id === selectedId
  );
  const activeEntry = selectedEntry ?? submissionsWithTagData[0];

  return (
    <div className="flex">
      {/* Sidebar - Inbox list */}
      <aside className="w-80 shrink-0 border-r border-gray-200 bg-transparent">
        <div className="border-b border-gray-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <PeopleTagFilterSelect selectedTag={selectedTag} basePath={basePath} />
            <PeopleSortSelect
              selectedTag={selectedTag}
              selectedSort={selectedSort}
              basePath={basePath}
            />
          </div>
        </div>
        <div className="h-[calc(100vh-244px)] min-h-[500px] overflow-y-auto">
          {submissionsWithTagData.map(({ submission, tags }, index) => {
            const details = submission.additionalDetails ?? "";
            const snippet =
              details.length > 60 ? `${details.slice(0, 60)}...` : details;
            const isActive = submission.id === activeEntry?.submission.id;
            return (
              <button
                key={submission.id}
                type="button"
                onClick={() => setSelectedId(submission.id)}
                className={`relative w-full px-4 py-3 text-left transition ${
                  isActive
                    ? "bg-purple-50/70"
                    : "bg-transparent hover:bg-white/70"
                } ${index > 0 ? "border-t border-gray-100" : ""}`}
              >
                {/* Colored dot indicator */}
                <span
                  className={`absolute left-1.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full ${
                    isActive ? "bg-purple-500" : "bg-blue-500"
                  }`}
                />

                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-900">
                    {submission.firstName} {submission.lastName}
                  </p>
                  <span className="shrink-0 text-xs text-gray-400">
                    {formatDate(submission.createdAt)}
                  </span>
                </div>

                {submission.helpTopic ? (
                  <p className="mt-0.5 text-xs font-medium text-gray-700">
                    {submission.helpTopic}
                  </p>
                ) : null}

                {snippet ? (
                  <p className="mt-1 text-xs text-gray-500">{snippet}</p>
                ) : null}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Detail panel */}
      <section className="min-w-0 flex-1 bg-transparent">
        {activeEntry ? (
          <div>
            {/* Header */}
            <div className="border-b border-gray-100 px-6 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-700">
                    {getInitials(
                      activeEntry.submission.firstName,
                      activeEntry.submission.lastName
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {activeEntry.submission.firstName}{" "}
                      {activeEntry.submission.lastName}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {activeEntry.submission.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">
                    {formatDate(activeEntry.submission.createdAt)}
                  </span>
                  <button
                    type="button"
                    disabled
                    className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-500"
                  >
                    Assign
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-5">
              {/* Topic tag */}
              {activeEntry.submission.helpTopic ? (
                <div className="mb-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getTagClasses(
                      resolveTagId(activeEntry.submission.helpTopic) ?? "other"
                    )}`}
                  >
                    {activeEntry.submission.helpTopic}
                  </span>
                </div>
              ) : null}

              {/* Message / Details */}
              {activeEntry.submission.additionalDetails ? (
                <div className="mb-5 text-sm leading-relaxed text-gray-700">
                  {activeEntry.submission.additionalDetails}
                </div>
              ) : (
                <p className="mb-5 text-sm text-gray-400">
                  No additional details provided.
                </p>
              )}

              {/* Contact info grid */}
              <div className="mb-5 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Phone
                  </p>
                  <p className="mt-1 text-gray-700">
                    {formatPhone(activeEntry.submission)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Campus
                  </p>
                  <p className="mt-1 text-gray-700">
                    {activeEntry.submission.primaryCampus || "Not shared"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Submissions
                  </p>
                  <p className="mt-1 text-gray-700">
                    {submissionsByEmail[activeEntry.submission.email] ?? 1}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Regular attender
                  </p>
                  <p className="mt-1 text-gray-700">
                    {activeEntry.submission.regularAttender ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className="mb-5 flex flex-wrap items-center gap-1.5">
                {activeEntry.tags.length > 0 ? (
                  activeEntry.tags.map((tag) => {
                    const label =
                      TAG_CATEGORIES.find((category) => category.id === tag)
                        ?.label ?? tag;
                    return (
                      <span
                        key={`${activeEntry.submission.id}-${tag}`}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getTagClasses(
                          tag as TagId
                        )}`}
                      >
                        {label}
                      </span>
                    );
                  })
                ) : (
                  <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-600">
                    Untagged
                  </span>
                )}
              </div>

              {/* Notes */}
              <div className="border-t border-gray-100 pt-5">
                <label
                  htmlFor={`notes-${activeEntry.submission.id}`}
                  className="text-xs font-medium uppercase tracking-wide text-gray-400"
                >
                  Internal notes
                </label>
                <textarea
                  id={`notes-${activeEntry.submission.id}`}
                  value={notes[activeEntry.submission.id] ?? ""}
                  onChange={(event) =>
                    setNotes((prev) => ({
                      ...prev,
                      [activeEntry.submission.id]: event.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="Add internal notes for this profile..."
                  className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                />
                <p className="mt-1 text-[11px] text-gray-400">
                  Notes are saved locally in this browser.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex min-h-[300px] items-center justify-center text-sm text-gray-500">
            Select a profile to view details.
          </div>
        )}
      </section>
    </div>
  );
}
