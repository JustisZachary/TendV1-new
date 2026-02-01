import Link from "next/link";

import type { Submission } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { TAG_CATEGORIES, parseTagString } from "@/lib/tags";

type PeoplePageProps = {
  searchParams?: { tag?: string } | Promise<{ tag?: string }>;
};

export default async function PeoplePage({ searchParams }: PeoplePageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const selectedTag = resolvedSearchParams?.tag ?? "all";
  const tagFilter =
    selectedTag !== "all"
      ? TAG_CATEGORIES.find((category) => category.id === selectedTag)?.id
      : null;

  let submissions: Submission[] = [];

  if (supabase) {
    let query = supabase
      .from("Submission")
      .select("*")
      .order("createdAt", { ascending: false });

    if (tagFilter) {
      query = query.like("tags", `%|${tagFilter}|%`);
    }

    const { data, error } = await query;

    if (error && process.env.NODE_ENV !== "production") {
      console.warn("PeoplePage: failed to load submissions.", error);
    } else {
      submissions = (data ?? []) as Submission[];
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-widest text-gray-400">
          DASHBOARD
        </p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">People</h1>
        <p className="mt-2 text-sm text-gray-600">
          Review form submissions and their keyword tags.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Link
            href="/people"
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              selectedTag === "all"
                ? "bg-[#1e3a5f] text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All requests
          </Link>
          {TAG_CATEGORIES.map((category) => (
            <Link
              key={category.id}
              href={`/people?tag=${category.id}`}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                selectedTag === category.id
                  ? "border-2 border-blue-400 bg-white text-gray-900"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            Latest requests
          </h2>
          <span className="text-sm text-gray-500">
            {submissions.length} total
          </span>
        </div>

        <div className="mt-5 space-y-4">
          {submissions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
              {supabase
                ? "No requests match this tag yet."
                : "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, or use Formspree for form submissions."}
            </div>
          ) : (
            submissions.map((submission) => {
              const tags = parseTagString(submission.tags);
              const details = submission.additionalDetails ?? "";
              const snippet =
                details.length > 80 ? `${details.slice(0, 80)}...` : details;
              return (
                <div
                  key={submission.id}
                  className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900">
                      {submission.firstName} {submission.lastName}
                    </p>
                    {submission.helpTopic ? (
                      <span className="rounded-full bg-[#1e3a5f] px-3 py-1 text-xs font-semibold text-white">
                        {submission.helpTopic}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {submission.email}
                  </p>
                  {snippet ? (
                    <p className="mt-2 text-sm text-gray-700">{snippet}</p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {tags.length > 0 ? (
                      tags.map((tag) => {
                        const label =
                          TAG_CATEGORIES.find(
                            (category) => category.id === tag
                          )?.label ?? tag;
                        return (
                          <span
                            key={`${submission.id}-${tag}`}
                            className="rounded-full bg-[#1e3a5f] px-3 py-1 text-xs font-semibold text-white"
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
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
