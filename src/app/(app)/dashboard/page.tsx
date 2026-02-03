import PeopleProfilesClient from "../people/PeopleProfilesClient";

import type { Submission } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { TAG_CATEGORIES } from "@/lib/tags";

type InboxPageProps = {
  searchParams?: { tag?: string; sort?: string } | Promise<{
    tag?: string;
    sort?: string;
  }>;
};

export default async function InboxPage({ searchParams }: InboxPageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const selectedTag = resolvedSearchParams?.tag ?? "all";
  const selectedSort =
    resolvedSearchParams?.sort === "oldest" ? "oldest" : "newest";
  const tagFilter =
    selectedTag !== "all"
      ? TAG_CATEGORIES.find((category) => category.id === selectedTag)?.id
      : null;

  let submissions: Submission[] = [];

  if (supabase) {
    let query = supabase
      .from("Submission")
      .select("*")
      .order("createdAt", { ascending: selectedSort === "oldest" });

    if (tagFilter) {
      query = query.like("tags", `%|${tagFilter}|%`);
    }

    const { data, error } = await query;

    if (error && process.env.NODE_ENV !== "production") {
      console.warn("InboxPage: failed to load submissions.", error);
    } else {
      submissions = (data ?? []) as Submission[];
    }
  }

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

  return (
    <div className="h-full w-full">
      {submissions.length === 0 ? (
        <div className="flex h-full items-center justify-center p-8 text-center text-sm text-gray-500">
          {supabase
            ? "No requests match this tag yet."
            : "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, or use Formspree for form submissions."}
        </div>
      ) : (
        <PeopleProfilesClient
          submissions={submissions}
          submissionsByEmail={submissionsByEmail}
          selectedTag={selectedTag}
          selectedSort={selectedSort}
          basePath="/dashboard"
        />
      )}
    </div>
  );
}
