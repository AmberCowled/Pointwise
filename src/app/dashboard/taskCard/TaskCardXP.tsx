"use client";

import { Spinner } from "@pointwise/app/components/ui/Spinner";
import type { XpAwardSource } from "@pointwise/lib/validation/tasks-schema";
import { IoRefresh } from "react-icons/io5";

export interface TaskCardXPProps {
	xp: number;
	xpAwardSource?: XpAwardSource;
	onRetry?: () => void;
	canRetry?: boolean;
	isRetrying?: boolean;
}

export default function TaskCardXP({
	xp,
	xpAwardSource,
	onRetry,
	canRetry,
	isRetrying,
}: TaskCardXPProps) {
	const source = xpAwardSource ?? "MANUAL";

	if (source === "AI_PENDING") {
		return (
			<span className="text-xs border border-amber-500/50 rounded-xl px-2 py-0.5 bg-amber-500/10 text-amber-400 min-w-25 inline-flex items-center justify-center gap-1.5 font-medium uppercase">
				<Spinner
					size="xs"
					type="circular"
					colorOverride="text-amber-400"
					aria-label="Calculating XP"
				/>
				XP
			</span>
		);
	}

	if (source === "AI_FAILED") {
		const isClickable = canRetry && onRetry && !isRetrying;
		const className =
			"text-xs border border-rose-500/50 rounded-xl px-2 py-0.5 bg-rose-500/10 text-rose-400 min-w-25 inline-flex items-center justify-center gap-1.5 font-medium";
		if (isClickable) {
			return (
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						onRetry();
					}}
					className={`${className} group cursor-pointer appearance-none focus:outline-none transition-colors hover:border-rose-400/70 hover:bg-rose-500/20 hover:text-rose-300`}
					aria-label="Failed. Click to retry XP suggestion"
				>
					Failed
					<IoRefresh className="size-3 shrink-0 text-rose-400 transition-colors group-hover:text-rose-300" />
				</button>
			);
		}
		return (
			<span className={className}>
				{isRetrying ? (
					<>
						<Spinner
							size="xs"
							type="circular"
							colorOverride="text-rose-400"
							aria-label="Retrying"
						/>
						Failed
					</>
				) : (
					"Failed"
				)}
			</span>
		);
	}

	return (
		<span className="text-xs border border-blue-500/50 rounded-xl px-2 py-0.5 bg-blue-500/10 text-blue-400 min-w-25 text-center font-medium uppercase">
			+{xp} XP
		</span>
	);
}
