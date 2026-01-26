"use client";

import { getCategoryColor } from "@pointwise/lib/categories";

export default function TaskCardCategory({ category }: { category: string }) {
	const categoryColor = getCategoryColor(category);

	return (
		<span
			className="text-xs uppercase rounded-xl px-2 py-0.5 border min-w-25 text-center font-medium"
			style={{
				backgroundColor: `${categoryColor}10`, // Softer background to match others
				borderColor: `${categoryColor}80`, // Softer border to match others
				color: categoryColor,
			}}
		>
			{category}
		</span>
	);
}
