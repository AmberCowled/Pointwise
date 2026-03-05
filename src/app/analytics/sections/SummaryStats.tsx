"use client";

import Grid from "@pointwise/app/components/ui/Grid";
import { Stat } from "@pointwise/app/components/ui/Stat";
import type { AnalyticsSummary } from "@pointwise/lib/validation/analytics-schema";
import {
	IoCheckmarkCircle,
	IoFlame,
	IoHourglass,
	IoList,
	IoSparkles,
	IoStarHalf,
	IoTime,
	IoWarning,
} from "react-icons/io5";

interface SummaryStatsProps {
	summary: AnalyticsSummary;
}

export default function SummaryStats({ summary }: SummaryStatsProps) {
	return (
		<Grid columns={{ default: 2, sm: 4 }} gap="sm">
			<Stat
				icon={IoList}
				label="Total"
				value={summary.totalTasks}
				colorClass="text-indigo-400"
				size="md"
			/>
			<Stat
				icon={IoCheckmarkCircle}
				label="Done"
				value={summary.completedTasks}
				colorClass="text-emerald-400"
				size="md"
			/>
			<Stat
				icon={IoStarHalf}
				label="Rate"
				value={`${summary.completionRate}%`}
				colorClass="text-violet-400"
				size="md"
			/>
			<Stat
				icon={IoSparkles}
				label="XP"
				value={summary.totalXpEarned.toLocaleString()}
				colorClass="text-amber-400"
				size="md"
			/>
			<Stat
				icon={IoWarning}
				label="Overdue"
				value={summary.overdueTasks}
				colorClass="text-rose-400"
				size="md"
			/>
			<Stat
				icon={IoTime}
				label="Avg Time"
				value={
					summary.averageCompletionTimeHours
						? `${summary.averageCompletionTimeHours}h`
						: "—"
				}
				colorClass="text-cyan-400"
				size="md"
			/>
			<Stat
				icon={IoFlame}
				label="Streak"
				value={`${summary.currentStreak}d`}
				colorClass="text-orange-400"
				size="md"
			/>
			<Stat
				icon={IoHourglass}
				label="Best"
				value={`${summary.longestStreak}d`}
				colorClass="text-pink-400"
				size="md"
			/>
		</Grid>
	);
}
