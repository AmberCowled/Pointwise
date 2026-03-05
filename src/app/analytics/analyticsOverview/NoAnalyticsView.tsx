"use client";

import Container from "@pointwise/app/components/ui/Container";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import { IoStatsChart } from "react-icons/io5";

export default function NoAnalyticsView() {
	return (
		<Container direction="vertical" gap="sm" className="items-center py-12">
			<IoStatsChart
				className={`h-10 w-10 ${StyleTheme.Text.Muted}`}
				aria-hidden="true"
			/>
			<p className={`text-sm ${StyleTheme.Text.Secondary}`}>
				No analytics data yet
			</p>
			<p className={`text-xs ${StyleTheme.Text.Muted}`}>
				Complete some tasks to see your analytics
			</p>
		</Container>
	);
}
