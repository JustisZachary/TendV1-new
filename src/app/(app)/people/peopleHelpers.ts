import { TAG_CATEGORIES, type TagId } from "@/lib/tags";

export const TAG_STYLES: Record<
  TagId,
  {
    text: string;
    border: string;
    hover: string;
  }
> = {
  marriage: {
    text: "text-red-700",
    border: "border-red-300",
    hover: "hover:bg-red-50",
  },
  finances: {
    text: "text-blue-700",
    border: "border-blue-300",
    hover: "hover:bg-blue-50",
  },
  "spiritual-health": {
    text: "text-purple-700",
    border: "border-purple-300",
    hover: "hover:bg-purple-50",
  },
  "mental-health": {
    text: "text-green-700",
    border: "border-green-300",
    hover: "hover:bg-green-50",
  },
  "faith-questions": {
    text: "text-yellow-700",
    border: "border-yellow-300",
    hover: "hover:bg-yellow-50",
  },
  other: {
    text: "text-gray-600",
    border: "border-gray-300",
    hover: "hover:bg-gray-50",
  },
};

export const resolveTagId = (value: string): TagId | undefined => {
  const normalized = value.trim().toLowerCase();
  return TAG_CATEGORIES.find(
    (category) => category.label.toLowerCase() === normalized
  )?.id;
};

export const getTagClasses = (tagId: TagId) => {
  const style = TAG_STYLES[tagId];
  return `border ${style.border} ${style.text} ${style.hover} bg-white`;
};
