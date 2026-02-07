"use client";

import { Spinner } from "@pointwise/app/components/ui/Spinner";
import type { XpAwardSource } from "@pointwise/lib/validation/tasks-schema";

export interface TaskCardXPProps {
	xp: number;
	xpAwardSource?: XpAwardSource;
}

export default function TaskCardXP({ xp, xpAwardSource }: TaskCardXPProps) {
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
		return (
			<span className="text-xs border border-rose-500/50 rounded-xl px-2 py-0.5 bg-rose-500/10 text-rose-400 min-w-25 text-center font-medium">
				Failed
			</span>
		);
	}

	return (
		<span className="text-xs border border-blue-500/50 rounded-xl px-2 py-0.5 bg-blue-500/10 text-blue-400 min-w-25 text-center font-medium uppercase">
			+{xp} XP
		</span>
	);
}
