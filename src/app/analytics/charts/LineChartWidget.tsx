"use client";

import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import {
	CHART_AXIS,
	CHART_COLORS,
	CHART_GRID,
	CHART_TOOLTIP,
} from "./chartTheme";

interface LineChartWidgetProps {
	data: Record<string, unknown>[];
	xKey: string;
	lines: { key: string; color?: string; name?: string }[];
}

export default function LineChartWidget({
	data,
	xKey,
	lines,
}: LineChartWidgetProps) {
	return (
		<ResponsiveContainer width="100%" height="100%">
			<LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
				<CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID.stroke} />
				<XAxis
					dataKey={xKey}
					stroke={CHART_AXIS.stroke}
					tick={{ fill: CHART_AXIS.tick, fontSize: CHART_AXIS.fontSize }}
					tickLine={false}
				/>
				<YAxis
					stroke={CHART_AXIS.stroke}
					tick={{ fill: CHART_AXIS.tick, fontSize: CHART_AXIS.fontSize }}
					tickLine={false}
					width={40}
				/>
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
				{lines.map((line, i) => (
					<Line
						key={line.key}
						type="monotone"
						dataKey={line.key}
						name={line.name ?? line.key}
						stroke={line.color ?? Object.values(CHART_COLORS)[i % 8]}
						strokeWidth={2}
						dot={false}
						activeDot={{ r: 4 }}
					/>
				))}
			</LineChart>
		</ResponsiveContainer>
	);
}
