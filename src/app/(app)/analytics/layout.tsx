import AnalyticsSidebar from "./AnalyticsSidebar";

import { supabase } from "@/lib/supabase";
import { TAG_CATEGORIES, parseTagString } from "@/lib/tags";
import { resolveTagId } from "../people/peopleHelpers";

type SubmissionMetrics = {
  tags: string | null;
  helpTopic: string | null;
  email: string | null;
};

export default async function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let submissions: SubmissionMetrics[] = [];

  if (supabase) {
    const { data, error } = await supabase
      .from("Submission")
      .select("tags, helpTopic, email");

    if (error && process.env.NODE_ENV !== "production") {
      console.warn("AnalyticsLayout: failed to load submissions.", error);
    } else {
      submissions = data ?? [];
    }
  }

  const submissionTags = submissions.map((submission) => {
    const tags = parseTagString(submission.tags);
    return tags.length > 0 ? tags : ["other"];
  });
  const totalRequests = submissionTags.length;
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
        TAG_CATEGORIES.find((category) => category.id === tagId)?.label ?? tagId;
      return { id: tagId, label, count };
    });

  return (
    <div className="flex w-full">
      <AnalyticsSidebar topTags={topTags} totalRequests={totalRequests} />
      <div className="flex w-full flex-col gap-6 p-0">{children}</div>
    </div>
  );
}
