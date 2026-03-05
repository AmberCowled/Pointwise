"use client";

import Grid from "@pointwise/app/components/ui/Grid";
import type {
	DayOfWeekItem,
	TimeOfDayItem,
} from "@pointwise/lib/validation/analytics-schema";
import BarChartWidget from "../charts/BarChartWidget";
import ChartCard from "../charts/ChartCard";
import { CHART_COLORS } from "../charts/chartTheme";

interface ProductivityPatternsSectionProps {
	dayOfWeekDistribution: DayOfWeekItem[];
	timeOfDayDistribution: TimeOfDayItem[];
}

export default function ProductivityPatternsSection({
	dayOfWeekDistribution,
	timeOfDayDistribution,
}: ProductivityPatternsSectionProps) {
	const hasDayData = dayOfWeekDistribution.some((d) => d.count > 0);
	const hasTimeData = timeOfDayDistribution.some((t) => t.count > 0);

	const timeData = timeOfDayDistribution.map((t) => ({
		hour: `${t.hour.toString().padStart(2, "0")}:00`,
		count: t.count,
	}));

	return (
		<Grid columns={{ default: 1, md: 2 }} gap="sm">
			<ChartCard
				title="Day of Week"
				description="Which days are most productive"
				isEmpty={!hasDayData}
			>
				<BarChartWidget
					data={dayOfWeekDistribution}
					xKey="day"
					bars={[
						{
							key: "count",
							name: "Completions",
							color: CHART_COLORS.primary,
						},
					]}
				/>
			</ChartCard>

			<ChartCard
				title="Time of Day"
				description="When tasks are completed"
				isEmpty={!hasTimeData}
			>
				<BarChartWidget
					data={timeData}
					xKey="hour"
					bars={[
						{
							key: "count",
							name: "Completions",
							color: CHART_COLORS.secondary,
						},
					]}
				/>
			</ChartCard>
		</Grid>
	);
}
