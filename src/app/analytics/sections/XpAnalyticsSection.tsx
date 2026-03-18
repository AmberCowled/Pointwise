"use client";

import Grid from "@pointwise/app/components/ui/Grid";
import type {
	CategoryBreakdownItem,
	TimeSeriesItem,
} from "@pointwise/lib/validation/analytics-schema";
import dynamic from "next/dynamic";
import ChartCard from "../charts/ChartCard";
import { CHART_COLORS } from "../charts/chartTheme";

const LineChartWidget = dynamic(() => import("../charts/LineChartWidget"), {
	ssr: false,
});
const PieChartWidget = dynamic(() => import("../charts/PieChartWidget"), {
	ssr: false,
});

interface XpAnalyticsSectionProps {
	timeSeries: TimeSeriesItem[];
	categoryBreakdown: CategoryBreakdownItem[];
}

export default function XpAnalyticsSection({
	timeSeries,
	categoryBreakdown,
}: XpAnalyticsSectionProps) {
	const hasTimeSeries = timeSeries.length > 0;
	const categoryXpData = categoryBreakdown
		.filter((c) => c.totalXp > 0)
		.map((c) => ({
			name: c.category,
			value: c.totalXp,
			color: c.color,
		}));

	return (
		<Grid columns={{ default: 1, md: 2 }} gap="sm">
			<ChartCard
				title="XP Earned Over Time"
				description="XP from completed tasks per period"
				isEmpty={!hasTimeSeries}
			>
				<LineChartWidget
					data={timeSeries}
					xKey="date"
					lines={[
						{
							key: "xpEarned",
							name: "XP Earned",
							color: CHART_COLORS.warning,
						},
					]}
				/>
			</ChartCard>

			<ChartCard
				title="XP by Category"
				description="Distribution of XP across task categories"
				isEmpty={categoryXpData.length === 0}
			>
				<PieChartWidget data={categoryXpData} />
			</ChartCard>
		</Grid>
	);
}
