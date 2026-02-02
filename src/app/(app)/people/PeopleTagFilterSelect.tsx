"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { TAG_CATEGORIES } from "@/lib/tags";

type PeopleTagFilterSelectProps = {
  selectedTag: string;
};

export default function PeopleTagFilterSelect({
  selectedTag,
}: PeopleTagFilterSelectProps) {
  const router = useRouter();
  const [value, setValue] = useState(selectedTag);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextValue = event.target.value;
    setValue(nextValue);
    if (nextValue === "all") {
      router.push("/people");
      return;
    }
    router.push(`/people?tag=${nextValue}`);
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
          <path d="M3 4a1 1 0 0 1 1-1h12a1 1 0 0 1 .8 1.6l-4.8 6.4V15a1 1 0 0 1-1.447.894l-2-1A1 1 0 0 1 8 14v-3.999L3.2 4.6A1 1 0 0 1 3 4z" />
        </svg>
      </div>
      <select
        id="people-tag-filter"
        value={value}
        onChange={handleChange}
        className="appearance-none rounded-full border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm font-semibold text-gray-700 shadow-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
      >
        <option value="all">All requests</option>
        {TAG_CATEGORIES.map((category) => (
          <option key={category.id} value={category.id}>
            {category.label}
          </option>
        ))}
      </select>
    </div>
  );
}
