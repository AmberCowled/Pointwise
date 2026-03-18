"use client";

import Grid from "@pointwise/app/components/ui/Grid";
import type { CategoryBreakdownItem } from "@pointwise/lib/validation/analytics-schema";
import dynamic from "next/dynamic";
import ChartCard from "../charts/ChartCard";
import { CHART_COLORS } from "../charts/chartTheme";

const BarChartWidget = dynamic(() => import("../charts/BarChartWidget"), {
	ssr: false,
});
const PieChartWidget = dynamic(() => import("../charts/PieChartWidget"), {
	ssr: false,
});

interface CategoryBreakdownSectionProps {
	categoryBreakdown: CategoryBreakdownItem[];
}

export default function CategoryBreakdownSection({
	categoryBreakdown,
}: CategoryBreakdownSectionProps) {
	const hasData = categoryBreakdown.length > 0;

	const taskCountData = categoryBreakdown.map((c) => ({
		name: c.category,
		value: c.totalTasks,
		color: c.color,
	}));

	const completionData = categoryBreakdown.map((c) => ({
		category: c.category,
		total: c.totalTasks,
		completed: c.completedTasks,
	}));

	return (
		<Grid columns={{ default: 1, md: 2 }} gap="sm">
			<ChartCard
				title="Tasks by Category"
				description="Distribution of tasks across categories"
				isEmpty={!hasData}
			>
				<PieChartWidget data={taskCountData} />
			</ChartCard>

			<ChartCard
				title="Category Completion Rates"
				description="Total vs completed tasks per category"
				isEmpty={!hasData}
			>
				<BarChartWidget
					data={completionData}
					xKey="category"
					bars={[
						{
							key: "total",
							name: "Total",
							color: CHART_COLORS.muted,
						},
						{
							key: "completed",
							name: "Completed",
							color: CHART_COLORS.success,
						},
					]}
				/>
			</ChartCard>
		</Grid>
	);
}
