"use client";

import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import type { HeatmapDay } from "@pointwise/lib/validation/analytics-schema";
import { useRef, useState } from "react";
import { CHART_COLORS } from "./chartTheme";

interface ActivityHeatmapProps {
	data: HeatmapDay[];
}

const CELL_SIZE = 12;
const CELL_GAP = 2;
const CELL_STEP = CELL_SIZE + CELL_GAP;
const DAYS_IN_WEEK = 7;
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];
const DAY_LABEL_WIDTH = 28;
const HEADER_HEIGHT = 16;

function getIntensityColor(count: number, maxCount: number): string {
	if (count === 0) return "rgba(255,255,255,0.05)";
	const ratio = Math.min(count / Math.max(maxCount, 1), 1);
	if (ratio <= 0.25) return `${CHART_COLORS.primary}40`;
	if (ratio <= 0.5) return `${CHART_COLORS.primary}80`;
	if (ratio <= 0.75) return `${CHART_COLORS.primary}bb`;
	return CHART_COLORS.primary;
}

function formatDate(dateStr: string): string {
	const d = new Date(dateStr);
	return d.toLocaleDateString("en-US", {
		weekday: "short",
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

const MONTHS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];

export default function ActivityHeatmap({ data }: ActivityHeatmapProps) {
	const containerRef = useRef<HTMLElement>(null);
	const [tooltip, setTooltip] = useState<{
		x: number;
		y: number;
		text: string;
	} | null>(null);

	const clearTooltip = () => setTooltip(null);

	if (data.length === 0) {
		return (
			<p className={`text-sm text-center py-8 ${StyleTheme.Text.Secondary}`}>
				No activity data
			</p>
		);
	}

	const maxCount = Math.max(...data.map((d) => d.count));

	// Group by weeks
	const firstDate = new Date(data[0].date);
	const startDay = firstDate.getDay(); // 0=Sun

	const weeks: (HeatmapDay | null)[][] = [];
	let currentWeek: (HeatmapDay | null)[] = new Array(startDay).fill(null);

	for (const day of data) {
		currentWeek.push(day);
		if (currentWeek.length === DAYS_IN_WEEK) {
			weeks.push(currentWeek);
			currentWeek = [];
		}
	}
	if (currentWeek.length > 0) {
		weeks.push(currentWeek);
	}

	// Reassign handleMouseMove with weeks in scope
	const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		const container = containerRef.current;
		if (!container) return;

		const svg = container.querySelector("svg");
		if (!svg) return;

		const containerRect = container.getBoundingClientRect();
		const svgRect = svg.getBoundingClientRect();

		// Convert screen coordinates to SVG viewBox coordinates
		const scaleX = svgWidth / svgRect.width;
		const scaleY = svgHeight / svgRect.height;
		const mouseX = (e.clientX - svgRect.left) * scaleX;
		const mouseY = (e.clientY - svgRect.top) * scaleY;

		const gridX = mouseX - DAY_LABEL_WIDTH;
		const gridY = mouseY - HEADER_HEIGHT;

		if (gridX < 0 || gridY < 0) {
			setTooltip(null);
			return;
		}

		const weekIdx = Math.floor(gridX / CELL_STEP);
		const dayIdx = Math.floor(gridY / CELL_STEP);

		const cellOffsetX = gridX - weekIdx * CELL_STEP;
		const cellOffsetY = gridY - dayIdx * CELL_STEP;
		if (
			cellOffsetX > CELL_SIZE ||
			cellOffsetY > CELL_SIZE ||
			dayIdx >= DAYS_IN_WEEK
		) {
			setTooltip(null);
			return;
		}

		if (weekIdx >= weeks.length || dayIdx >= (weeks[weekIdx]?.length ?? 0)) {
			setTooltip(null);
			return;
		}

		const day = weeks[weekIdx]?.[dayIdx];
		if (!day) {
			setTooltip(null);
			return;
		}

		setTooltip({
			x: e.clientX - containerRect.left,
			y: e.clientY - containerRect.top - 8,
			text: `${day.count} completion${day.count !== 1 ? "s" : ""} on ${formatDate(day.date)}`,
		});
	};

	// Compute month labels
	const monthLabels: { label: string; x: number }[] = [];
	let lastMonth = -1;
	for (let w = 0; w < weeks.length; w++) {
		const firstDay = weeks[w].find((d) => d !== null);
		if (!firstDay) continue;
		const month = new Date(firstDay.date).getMonth();
		if (month !== lastMonth) {
			monthLabels.push({
				label: MONTHS[month],
				x: DAY_LABEL_WIDTH + w * CELL_STEP,
			});
			lastMonth = month;
		}
	}

	const svgWidth = DAY_LABEL_WIDTH + weeks.length * CELL_STEP;
	const svgHeight = HEADER_HEIGHT + DAYS_IN_WEEK * CELL_STEP;

	return (
		<section
			ref={containerRef}
			aria-label="Activity heatmap"
			className="heatmap-container relative w-full h-full flex flex-col"
			onMouseMove={onMouseMove}
			onMouseLeave={clearTooltip}
		>
			<svg
				viewBox={`0 0 ${svgWidth} ${svgHeight}`}
				className="w-full flex-1 min-h-0"
				preserveAspectRatio="xMidYMid meet"
				role="img"
				aria-label="Activity heatmap showing task completions per day"
				style={{ cursor: "crosshair", display: "block" }}
			>
				{/* Month labels */}
				{monthLabels.map((ml) => (
					<text
						key={`${ml.label}-${ml.x}`}
						x={ml.x}
						y={11}
						fill="rgba(255,255,255,0.4)"
						fontSize={10}
					>
						{ml.label}
					</text>
				))}

				{/* Day labels */}
				{DAY_LABELS.map((label, i) =>
					label ? (
						<text
							key={label}
							x={0}
							y={HEADER_HEIGHT + i * CELL_STEP + CELL_SIZE - 2}
							fill="rgba(255,255,255,0.4)"
							fontSize={10}
						>
							{label}
						</text>
					) : null,
				)}

				{/* Cells */}
				{weeks.map((week, weekIdx) =>
					week.map((day, dayIdx) => {
						if (!day) return null;
						return (
							<rect
								key={day.date}
								x={DAY_LABEL_WIDTH + weekIdx * CELL_STEP}
								y={HEADER_HEIGHT + dayIdx * CELL_STEP}
								width={CELL_SIZE}
								height={CELL_SIZE}
								rx={2}
								fill={getIntensityColor(day.count, maxCount)}
							/>
						);
					}),
				)}
			</svg>

			{/* Tooltip */}
			{tooltip && (
				<div
					className="absolute pointer-events-none z-10 px-2.5 py-1.5 rounded-md text-xs whitespace-nowrap"
					style={{
						left: tooltip.x,
						top: tooltip.y,
						transform: "translate(-50%, -100%)",
						backgroundColor: "#18181b",
						border: "1px solid rgba(255,255,255,0.1)",
						color: "#e4e4e7",
						boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
					}}
				>
					{tooltip.text}
				</div>
			)}

			{/* Legend */}
			<div className="flex items-center gap-1.5 mt-2 text-[10px] text-zinc-500">
				<span>Less</span>
				{[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
					<div
						key={ratio}
						className="rounded-sm"
						style={{
							width: CELL_SIZE - 2,
							height: CELL_SIZE - 2,
							backgroundColor: getIntensityColor(
								ratio * Math.max(maxCount, 1),
								maxCount,
							),
						}}
					/>
				))}
				<span>More</span>
			</div>
		</section>
	);
}
