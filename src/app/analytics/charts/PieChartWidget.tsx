"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CHART_PALETTE, CHART_TOOLTIP } from "./chartTheme";

interface PieChartWidgetProps {
	data: { name: string; value: number; color?: string }[];
	innerRadius?: number;
}

export default function PieChartWidget({
	data,
	innerRadius = 50,
}: PieChartWidgetProps) {
	return (
		<ResponsiveContainer
			width="100%"
			height="100%"
			initialDimension={{ width: 1, height: 1 }}
		>
			<PieChart>
				<Pie
					data={data}
					cx="50%"
					cy="50%"
					innerRadius={innerRadius}
					outerRadius="80%"
					dataKey="value"
					nameKey="name"
					paddingAngle={2}
					stroke="none"
				>
					{data.map((entry, i) => (
						<Cell
							key={entry.name}
							fill={entry.color ?? CHART_PALETTE[i % CHART_PALETTE.length]}
						/>
					))}
				</Pie>
				<Tooltip
					contentStyle={{
						backgroundColor: CHART_TOOLTIP.background,
						border: `1px solid ${CHART_TOOLTIP.border}`,
						borderRadius: "8px",
						color: CHART_TOOLTIP.text,
						fontSize: 12,
					}}
					itemStyle={{
						color: CHART_TOOLTIP.text,
					}}
					labelStyle={{
						color: CHART_TOOLTIP.text,
					}}
				/>
			</PieChart>
		</ResponsiveContainer>
	);
}
