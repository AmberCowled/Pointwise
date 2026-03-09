"use client";

import {
	Area,
	AreaChart,
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

interface AreaChartWidgetProps {
	data: Record<string, unknown>[];
	xKey: string;
	areas: { key: string; color?: string; name?: string }[];
}

export default function AreaChartWidget({
	data,
	xKey,
	areas,
}: AreaChartWidgetProps) {
	return (
		<ResponsiveContainer
			width="100%"
			height="100%"
			initialDimension={{ width: 1, height: 1 }}
		>
			<AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
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
				{areas.map((area, i) => (
					<Area
						key={area.key}
						type="monotone"
						dataKey={area.key}
						name={area.name ?? area.key}
						stroke={area.color ?? Object.values(CHART_COLORS)[i % 8]}
						fill={area.color ?? Object.values(CHART_COLORS)[i % 8]}
						fillOpacity={0.15}
						strokeWidth={2}
					/>
				))}
			</AreaChart>
		</ResponsiveContainer>
	);
}
