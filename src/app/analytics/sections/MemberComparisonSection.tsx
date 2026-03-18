"use client";

import Grid from "@pointwise/app/components/ui/Grid";
import type { MemberBreakdownItem } from "@pointwise/lib/validation/analytics-schema";
import dynamic from "next/dynamic";
import ChartCard from "../charts/ChartCard";
import { CHART_COLORS, CHART_PALETTE } from "../charts/chartTheme";
import MemberTable from "../charts/MemberTable";

const BarChartWidget = dynamic(() => import("../charts/BarChartWidget"), {
	ssr: false,
});
const PieChartWidget = dynamic(() => import("../charts/PieChartWidget"), {
	ssr: false,
});

interface MemberComparisonSectionProps {
	memberBreakdown: MemberBreakdownItem[];
}

export default function MemberComparisonSection({
	memberBreakdown,
}: MemberComparisonSectionProps) {
	const hasData = memberBreakdown.length > 0;

	const contributionData = memberBreakdown
		.filter((m) => m.tasksCompleted > 0)
		.map((m, i) => ({
			name: m.displayName,
			value: m.tasksCompleted,
			color: CHART_PALETTE[i % CHART_PALETTE.length],
		}));

	const comparisonData = memberBreakdown.map((m) => ({
		member: m.displayName.slice(0, 10),
		completed: m.tasksCompleted,
		xp: Math.round(m.totalXpEarned / 100), // Scale down for chart readability
	}));

	return (
		<Grid columns={{ default: 1 }} gap="sm">
			<ChartCard
				title="Member Activity"
				description="Overview of member contributions"
				isEmpty={!hasData}
			>
				<MemberTable members={memberBreakdown} />
			</ChartCard>

			<Grid columns={{ default: 1, md: 2 }} gap="sm">
				<ChartCard
					title="Contribution Distribution"
					description="Share of completed tasks per member"
					isEmpty={contributionData.length === 0}
				>
					<PieChartWidget data={contributionData} />
				</ChartCard>

				<ChartCard
					title="Member Comparison"
					description="Tasks completed and XP (hundreds) per member"
					isEmpty={!hasData}
				>
					<BarChartWidget
						data={comparisonData}
						xKey="member"
						bars={[
							{
								key: "completed",
								name: "Tasks",
								color: CHART_COLORS.success,
							},
							{
								key: "xp",
								name: "XP (×100)",
								color: CHART_COLORS.warning,
							},
						]}
					/>
				</ChartCard>
			</Grid>
		</Grid>
	);
}
