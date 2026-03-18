"use client";

import Grid from "@pointwise/app/components/ui/Grid";
import type { TimeSeriesItem } from "@pointwise/lib/validation/analytics-schema";
import dynamic from "next/dynamic";
import ChartCard from "../charts/ChartCard";
import { CHART_COLORS } from "../charts/chartTheme";

const AreaChartWidget = dynamic(() => import("../charts/AreaChartWidget"), {
	ssr: false,
});
const BarChartWidget = dynamic(() => import("../charts/BarChartWidget"), {
	ssr: false,
});
const LineChartWidget = dynamic(() => import("../charts/LineChartWidget"), {
	ssr: false,
});

interface TaskCompletionSectionProps {
	timeSeries: TimeSeriesItem[];
	completedTasks: number;
	totalTasks: number;
}

export default function TaskCompletionSection({
	timeSeries,
	completedTasks,
	totalTasks,
}: TaskCompletionSectionProps) {
	const hasData = timeSeries.length > 0;

	// Compute completion rate per bucket
	const rateData = timeSeries.map((item) => {
		const total = item.tasksCreated || 1;
		return {
			date: item.date,
			rate: Math.round((item.tasksCompleted / total) * 100),
		};
	});

	return (
		<Grid columns={{ default: 1, md: 2 }} gap="sm">
			<ChartCard
				title="Task Velocity"
				description="Tasks completed per period"
				isEmpty={!hasData}
			>
				<BarChartWidget
					data={timeSeries}
					xKey="date"
					bars={[
						{
							key: "tasksCompleted",
							name: "Completed",
							color: CHART_COLORS.success,
						},
						{
							key: "tasksCreated",
							name: "Created",
							color: CHART_COLORS.primary,
						},
					]}
				/>
			</ChartCard>

			<ChartCard
				title="Cumulative Progress"
				description="Running total of completed tasks"
				isEmpty={!hasData}
			>
				<AreaChartWidget
					data={timeSeries}
					xKey="date"
					areas={[
						{
							key: "cumulativeCompleted",
							name: "Total Completed",
							color: CHART_COLORS.primary,
						},
					]}
				/>
			</ChartCard>

			<ChartCard
				title="Completion Rate"
				description="Percentage of tasks completed per period"
				isEmpty={!hasData}
			>
				<LineChartWidget
					data={rateData}
					xKey="date"
					lines={[
						{
							key: "rate",
							name: "Completion %",
							color: CHART_COLORS.secondary,
						},
					]}
				/>
			</ChartCard>

			<ChartCard
				title="Task Status"
				description={`${completedTasks} completed of ${totalTasks} total`}
				isEmpty={totalTasks === 0}
			>
				<div className="flex items-center justify-center h-full">
					<div className="flex flex-col items-center gap-3">
						<div className="flex gap-4">
							<div className="flex items-center gap-2">
								<div
									className="w-3 h-3 rounded-full"
									style={{ backgroundColor: CHART_COLORS.success }}
								/>
								<span className="text-xs text-zinc-400">
									Completed ({completedTasks})
								</span>
							</div>
							<div className="flex items-center gap-2">
								<div
									className="w-3 h-3 rounded-full"
									style={{ backgroundColor: CHART_COLORS.muted }}
								/>
								<span className="text-xs text-zinc-400">
									Pending ({totalTasks - completedTasks})
								</span>
							</div>
						</div>
						<div className="text-3xl font-bold text-zinc-100">
							{totalTasks > 0
								? Math.round((completedTasks / totalTasks) * 100)
								: 0}
							%
						</div>
					</div>
				</div>
			</ChartCard>
		</Grid>
	);
}
