export const TAG_CATEGORIES = [
  {
    id: "marriage",
    label: "Marriage",
    keywords: [
      "marriage",
      "married",
      "spouse",
      "husband",
      "wife",
      "relationship",
      "divorce",
      "wedding",
    ],
  },
  {
    id: "finances",
    label: "Finances",
    keywords: [
      "finance",
      "financial",
      "money",
      "budget",
      "debt",
      "bills",
      "rent",
      "mortgage",
      "tithing",
    ],
  },
  {
    id: "spiritual-health",
    label: "Spiritual health",
    keywords: [
      "spiritual",
      "prayer",
      "pray",
      "discipleship",
      "worship",
      "church",
    ],
  },
  {
    id: "mental-health",
    label: "Mental health",
    keywords: [
      "mental",
      "anxiety",
      "depression",
      "depressed",
      "stress",
      "trauma",
      "therapy",
      "counseling",
    ],
  },
  {
    id: "faith-questions",
    label: "Faith questions",
    keywords: [
      "faith question",
      "faith questions",
      "bible question",
      "bible questions",
      "questions about the bible",
      "scripture question",
      "scripture questions",
      "doubt",
      "doubts",
      "belief",
      "unbelief",
      "agnostic",
      "atheist",
      "salvation",
      "bible",
      "scripture",
      "jane doe",
    ],
  },
] as const;

export type TagId = (typeof TAG_CATEGORIES)[number]["id"];

const normalize = (value: string) => value.toLowerCase();

export const extractTags = (text: string) => {
  const normalized = normalize(text);
  const matches = new Set<TagId>();

  const faithCategory = TAG_CATEGORIES.find(
    (category) => category.id === "faith-questions"
  );
  const hasFaithQuestion =
    faithCategory?.keywords.some((keyword) => normalized.includes(keyword)) ??
    false;

  TAG_CATEGORIES.forEach((category) => {
    if (category.id === "spiritual-health" && hasFaithQuestion) {
      return;
    }

    if (category.keywords.some((keyword) => normalized.includes(keyword))) {
      matches.add(category.id);
    }
  });

  return Array.from(matches);
};

export const toTagString = (tags: TagId[]) => {
  if (!tags.length) return "";
  return `|${tags.join("|")}|`;
};

export const parseTagString = (tagString?: string | null) => {
  if (!tagString) return [];
  return tagString
    .split("|")
    .map((tag) => tag.trim())
    .filter(Boolean) as TagId[];
};
