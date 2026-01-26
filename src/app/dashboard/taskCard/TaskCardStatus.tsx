"use client";

import clsx from "clsx";

export default function TaskCardStatus({ status }: { status: string }) {
	const baseClasses =
		"text-xs border rounded-xl px-2 py-0.5 min-w-25 text-center font-medium uppercase";
	const completedClasses =
		"bg-emerald-500/10 border-emerald-500/50 text-emerald-400";
	const overdueClasses = "bg-rose-500/10 border-rose-500/50 text-rose-400";
	const pendingClasses = "bg-zinc-500/10 border-zinc-500/50 text-zinc-400";

	return (
		<span
			className={clsx(
				baseClasses,
				status === "COMPLETED"
					? completedClasses
					: status === "OVERDUE"
						? overdueClasses
						: pendingClasses,
			)}
		>
			{status}
		</span>
	);
}
