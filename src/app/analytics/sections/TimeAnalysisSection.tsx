"use client";

import Grid from "@pointwise/app/components/ui/Grid";
import type {
	CategoryBreakdownItem,
	CompletionTimeBucket,
	HeatmapDay,
	TimeSeriesItem,
} from "@pointwise/lib/validation/analytics-schema";
import ActivityHeatmap from "../charts/ActivityHeatmap";
import BarChartWidget from "../charts/BarChartWidget";
import ChartCard from "../charts/ChartCard";
import { CHART_COLORS } from "../charts/chartTheme";
import LineChartWidget from "../charts/LineChartWidget";

interface TimeAnalysisSectionProps {
	timeSeries: TimeSeriesItem[];
	completionTimeDistribution: CompletionTimeBucket[];
	categoryBreakdown: CategoryBreakdownItem[];
	activityHeatmap: HeatmapDay[];
}

export default function TimeAnalysisSection({
	timeSeries,
	completionTimeDistribution,
	categoryBreakdown,
	activityHeatmap,
}: TimeAnalysisSectionProps) {
	const hasCompletionData = completionTimeDistribution.some((b) => b.count > 0);
	const hasOverdueData = timeSeries.some((t) => t.overdueCount > 0);
	const hasCategoryTimeData = categoryBreakdown.some(
		(c) => c.averageCompletionTimeHours !== null,
	);

	const categoryTimeData = categoryBreakdown
		.filter((c) => c.averageCompletionTimeHours !== null)
		.map((c) => ({
			category: c.category,
			hours: c.averageCompletionTimeHours,
		}));

	return (
		<Grid columns={{ default: 1, md: 2 }} gap="sm">
			<ChartCard
				title="Time to Complete"
				description="Distribution of task completion times"
				isEmpty={!hasCompletionData}
			>
				<BarChartWidget
					data={completionTimeDistribution}
					xKey="bucket"
					bars={[
						{
							key: "count",
							name: "Tasks",
							color: CHART_COLORS.info,
						},
					]}
				/>
			</ChartCard>

			<ChartCard
				title="Avg Completion Time by Category"
				description="Hours to complete tasks by category"
				isEmpty={!hasCategoryTimeData}
			>
				<BarChartWidget
					data={categoryTimeData}
					xKey="category"
					bars={[
						{
							key: "hours",
							name: "Avg Hours",
							color: CHART_COLORS.secondary,
						},
					]}
				/>
			</ChartCard>

			<ChartCard
				title="Overdue Tasks Over Time"
				description="Tasks that missed their due date per period"
				isEmpty={!hasOverdueData}
			>
				<LineChartWidget
					data={timeSeries}
					xKey="date"
					lines={[
						{
							key: "overdueCount",
							name: "Overdue",
							color: CHART_COLORS.danger,
						},
					]}
				/>
			</ChartCard>

			<ChartCard
				title="Activity Heatmap"
				description="Task completions per day"
				isEmpty={activityHeatmap.length === 0}
			>
				<ActivityHeatmap data={activityHeatmap} />
			</ChartCard>
		</Grid>
	);
}
