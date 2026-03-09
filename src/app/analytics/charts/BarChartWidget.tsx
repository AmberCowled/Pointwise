"use client";

import {
	Bar,
	BarChart,
	CartesianGrid,
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

interface BarConfig {
	key: string;
	color?: string;
	name?: string;
	stackId?: string;
}

interface BarChartWidgetProps {
	data: Record<string, unknown>[];
	xKey: string;
	bars: BarConfig[];
}

export default function BarChartWidget({
	data,
	xKey,
	bars,
}: BarChartWidgetProps) {
	return (
		<ResponsiveContainer
			width="100%"
			height="100%"
			initialDimension={{ width: 1, height: 1 }}
		>
			<BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
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
					cursor={{ fill: "rgba(255, 255, 255, 0.04)" }}
				/>
				{bars.map((bar, i) => (
					<Bar
						key={bar.key}
						dataKey={bar.key}
						name={bar.name ?? bar.key}
						fill={bar.color ?? Object.values(CHART_COLORS)[i % 8]}
						stackId={bar.stackId}
						radius={[4, 4, 0, 0]}
					/>
				))}
			</BarChart>
		</ResponsiveContainer>
	);
}
