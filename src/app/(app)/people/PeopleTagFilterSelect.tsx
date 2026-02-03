"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { TAG_CATEGORIES } from "@/lib/tags";

type PeopleTagFilterSelectProps = {
  selectedTag: string;
  basePath?: string;
};

export default function PeopleTagFilterSelect({
  selectedTag,
  basePath = "/dashboard",
}: PeopleTagFilterSelectProps) {
  const router = useRouter();
  const [value, setValue] = useState(selectedTag);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setValue(selectedTag);
  }, [selectedTag]);

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
    const nextValue = event.target.value;
    setValue(nextValue);
    if (nextValue === "all") {
      router.push(basePath);
      return;
    }
    router.push(`${basePath}?tag=${nextValue}`);
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
          <path d="M3 4a1 1 0 0 1 1-1h12a1 1 0 0 1 .8 1.6l-4.8 6.4V15a1 1 0 0 1-1.447.894l-2-1A1 1 0 0 1 8 14v-3.999L3.2 4.6A1 1 0 0 1 3 4z" />
        </svg>
      </div>
      <button
        id="people-tag-filter"
        type="button"
        aria-label="Filter inbox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-9 w-9 rounded-full border border-gray-200 bg-white shadow-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
      />
      {isOpen && (
        <div className="absolute left-0 top-11 z-20 w-56 rounded-xl border border-gray-200 bg-white p-1 shadow-lg">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              if (value !== "all") {
                handleChange({
                  target: { value: "all" },
                } as React.ChangeEvent<HTMLSelectElement>);
              }
            }}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 ${
              value === "all" ? "bg-gray-50 font-semibold" : ""
            }`}
          >
            <span>All requests</span>
            {value === "all" && <span className="text-purple-600">✓</span>}
          </button>
          {TAG_CATEGORIES.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (value !== category.id) {
                  handleChange({
                    target: { value: category.id },
                  } as React.ChangeEvent<HTMLSelectElement>);
                }
              }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 ${
                value === category.id ? "bg-gray-50 font-semibold" : ""
              }`}
            >
              <span>{category.label}</span>
              {value === category.id && (
                <span className="text-purple-600">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
