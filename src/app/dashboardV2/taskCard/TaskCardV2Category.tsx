"use client";

import { getCategoryColor } from "@pointwise/lib/categories";

export default function TaskCardV2Category({ category }: { category: string }) {
  const categoryColor = getCategoryColor(category);

  return (
    <span
      className="text-xs uppercase rounded-xl px-2 py-0.5 border"
      style={{
        backgroundColor: `${categoryColor}20`,
        borderColor: categoryColor,
        color: categoryColor,
      }}
    >
      {category}
    </span>
  );
}
