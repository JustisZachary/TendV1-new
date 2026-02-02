"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type PeopleSortSelectProps = {
  selectedSort: "newest" | "oldest";
  selectedTag: string;
  basePath?: string;
};

export default function PeopleSortSelect({
  selectedSort,
  selectedTag,
  basePath = "/dashboard",
}: PeopleSortSelectProps) {
  const router = useRouter();
  const [value, setValue] = useState(selectedSort);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextValue = event.target.value as "newest" | "oldest";
    setValue(nextValue);
    const params = new URLSearchParams();
    if (selectedTag !== "all") {
      params.set("tag", selectedTag);
    }
    params.set("sort", nextValue);
    const query = params.toString();
    router.push(query ? `${basePath}?${query}` : basePath);
  };

  return (
    <div className="relative inline-flex items-center">
      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="h-4 w-4"
          fill="currentColor"
        >
          <path d="M6 3a1 1 0 0 1 1 1v10.586l2.293-2.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4A1 1 0 0 1 2.707 12.293L5 14.586V4a1 1 0 0 1 1-1zM13 3a1 1 0 0 1 .707.293l4 4a1 1 0 0 1-1.414 1.414L14 6.414V16a1 1 0 1 1-2 0V6.414l-2.293 2.293a1 1 0 1 1-1.414-1.414l4-4A1 1 0 0 1 13 3z" />
        </svg>
      </div>
      <select
        id="people-sort-filter"
        value={value}
        onChange={handleChange}
        className="appearance-none rounded-full border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm font-semibold text-gray-700 shadow-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
      >
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
      </select>
    </div>
  );
}
