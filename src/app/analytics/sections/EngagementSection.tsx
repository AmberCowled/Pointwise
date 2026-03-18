"use client";

import Container from "@pointwise/app/components/ui/Container";
import Grid from "@pointwise/app/components/ui/Grid";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import type {
	TimeSeriesItem,
	TopTask,
} from "@pointwise/lib/validation/analytics-schema";
import dynamic from "next/dynamic";
import ChartCard from "../charts/ChartCard";
import { CHART_COLORS } from "../charts/chartTheme";

const LineChartWidget = dynamic(() => import("../charts/LineChartWidget"), {
	ssr: false,
});

interface EngagementSectionProps {
	timeSeries: TimeSeriesItem[];
	topTasks: TopTask[];
	engagementScore: number;
}

export default function EngagementSection({
	timeSeries,
	topTasks,
	engagementScore,
}: EngagementSectionProps) {
	const hasEngagementData = timeSeries.some(
		(t) => t.likesReceived > 0 || t.commentsReceived > 0,
	);
	const topLiked = [...topTasks]
		.sort((a, b) => b.likeCount - a.likeCount)
		.slice(0, 5);
	const topCommented = [...topTasks]
		.sort((a, b) => b.commentCount - a.commentCount)
		.slice(0, 5);

	return (
		<Grid columns={{ default: 1, md: 2 }} gap="sm">
			<ChartCard
				title="Engagement Over Time"
				description="Likes and comments per period"
				isEmpty={!hasEngagementData}
			>
				<LineChartWidget
					data={timeSeries}
					xKey="date"
					lines={[
						{
							key: "likesReceived",
							name: "Likes",
							color: CHART_COLORS.danger,
						},
						{
							key: "commentsReceived",
							name: "Comments",
							color: CHART_COLORS.info,
						},
					]}
				/>
			</ChartCard>

			<ChartCard
				title="Engagement Score"
				description="Average likes + comments per task"
				isEmpty={false}
			>
				<div className="flex items-center justify-center h-full">
					<div className="text-center">
						<div className="text-4xl font-bold text-indigo-400">
							{engagementScore}
						</div>
						<p className={`text-xs mt-1 ${StyleTheme.Text.Muted}`}>per task</p>
					</div>
				</div>
			</ChartCard>

			<ChartCard
				title="Most Liked Tasks"
				isEmpty={topLiked.length === 0 || topLiked[0].likeCount === 0}
				emptyMessage="No liked tasks yet"
			>
				<Container direction="vertical" gap="xs" width="full">
					{topLiked
						.filter((t) => t.likeCount > 0)
						.map((task, i) => (
							<div
								key={task.taskId}
								className={`flex justify-between items-center py-1.5 px-2 rounded text-xs ${i % 2 === 0 ? "bg-white/5" : ""}`}
							>
								<span
									className={`truncate max-w-[200px] ${StyleTheme.Text.Primary}`}
								>
									{task.title}
								</span>
								<span className="text-rose-400 font-medium">
									{task.likeCount} likes
								</span>
							</div>
						))}
				</Container>
			</ChartCard>

			<ChartCard
				title="Most Discussed Tasks"
				isEmpty={
					topCommented.length === 0 || topCommented[0].commentCount === 0
				}
				emptyMessage="No commented tasks yet"
			>
				<Container direction="vertical" gap="xs" width="full">
					{topCommented
						.filter((t) => t.commentCount > 0)
						.map((task, i) => (
							<div
								key={task.taskId}
								className={`flex justify-between items-center py-1.5 px-2 rounded text-xs ${i % 2 === 0 ? "bg-white/5" : ""}`}
							>
								<span
									className={`truncate max-w-[200px] ${StyleTheme.Text.Primary}`}
								>
									{task.title}
								</span>
								<span className="text-cyan-400 font-medium">
									{task.commentCount} comments
								</span>
							</div>
						))}
				</Container>
			</ChartCard>
		</Grid>
	);
}
