"use client";

import clsx from "clsx";

export default function TaskCardOptional({ optional }: { optional: boolean }) {
	return (
		<span
			className={clsx(
				"text-xs border rounded-xl px-2 py-0.5 min-w-25 text-center uppercase font-medium",
				optional
					? "bg-fuchsia-500/10 border-fuchsia-500/50 text-fuchsia-400"
					: "bg-indigo-500/10 border-indigo-500/50 text-indigo-400",
			)}
		>
			{optional ? "Optional" : "Required"}
		</span>
	);
}
