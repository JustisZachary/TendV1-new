import Link from "next/link";

import { prisma } from "@/lib/db";
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

  const submissions = await prisma.submission.findMany({
    where: tagFilter ? { tags: { contains: `|${tagFilter}|` } } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-xs uppercase tracking-widest text-gray-400">
          Dashboard
        </p>
        <h1 className="mt-2 text-2xl font-semibold">People</h1>
        <p className="mt-3 text-sm text-gray-600">
          Review form submissions and their keyword tags.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-2 text-xs font-semibold">
          <Link
            href="/people"
            className={`rounded-full border px-3 py-1.5 ${
              selectedTag === "all"
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            All requests
          </Link>
          {TAG_CATEGORIES.map((category) => (
            <Link
              key={category.id}
              href={`/people?tag=${category.id}`}
              className={`rounded-full border px-3 py-1.5 ${
                selectedTag === category.id
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {category.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">
            Latest requests
          </h2>
          <span className="text-xs text-gray-500">
            {submissions.length} total
          </span>
        </div>

        <div className="mt-4 space-y-4">
          {submissions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
              No requests match this tag yet.
            </div>
          ) : (
            submissions.map((submission) => {
              const tags = parseTagString(submission.tags);
              return (
                <div
                  key={submission.id}
                  className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {submission.firstName} {submission.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {submission.email}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-600">
                      {submission.helpTopic}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tags.length > 0 ? (
                      tags.map((tag) => {
                        const label =
                          TAG_CATEGORIES.find(
                            (category) => category.id === tag
                          )?.label ?? tag;
                        return (
                          <span
                            key={`${submission.id}-${tag}`}
                            className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700"
                          >
                            {label}
                          </span>
                        );
                      })
                    ) : (
                      <span className="rounded-full bg-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-600">
                        Untagged
                      </span>
                    )}
                  </div>
                  {submission.additionalDetails && (
                    <p className="mt-3 text-sm text-gray-600">
                      {submission.additionalDetails}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
