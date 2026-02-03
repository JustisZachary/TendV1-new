"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setValue(selectedSort);
  }, [selectedSort]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    <div
      ref={containerRef}
      className="relative inline-flex h-9 w-9 items-center justify-center"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-500">
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="h-4 w-4"
          fill="currentColor"
        >
          <path d="M6 3a1 1 0 0 1 1 1v10.586l2.293-2.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4A1 1 0 0 1 2.707 12.293L5 14.586V4a1 1 0 0 1 1-1zM13 3a1 1 0 0 1 .707.293l4 4a1 1 0 0 1-1.414 1.414L14 6.414V16a1 1 0 1 1-2 0V6.414l-2.293 2.293a1 1 0 1 1-1.414-1.414l4-4A1 1 0 0 1 13 3z" />
        </svg>
      </div>
      <button
        id="people-sort-filter"
        type="button"
        aria-label="Sort inbox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-9 w-9 rounded-full border border-gray-200 bg-white shadow-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
      />
      {isOpen && (
        <div className="absolute left-0 top-11 z-20 w-44 rounded-xl border border-gray-200 bg-white p-1 shadow-lg">
          {[
            { value: "newest", label: "Newest first" },
            { value: "oldest", label: "Oldest first" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (option.value !== value) {
                  handleChange({
                    target: { value: option.value },
                  } as React.ChangeEvent<HTMLSelectElement>);
                }
              }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 ${
                value === option.value ? "bg-gray-50 font-semibold" : ""
              }`}
            >
              <span>{option.label}</span>
              {value === option.value && (
                <span className="text-purple-600">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
