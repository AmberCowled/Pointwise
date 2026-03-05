export const CHART_COLORS = {
	primary: "#818cf8", // indigo-400
	secondary: "#a78bfa", // violet-400
	success: "#34d399", // emerald-400
	warning: "#fbbf24", // amber-400
	danger: "#f87171", // red-400
	info: "#22d3ee", // cyan-400
	muted: "#71717a", // zinc-500
	pink: "#f472b6", // pink-400
} as const;

export const CHART_PALETTE = [
	CHART_COLORS.primary,
	CHART_COLORS.secondary,
	CHART_COLORS.success,
	CHART_COLORS.warning,
	CHART_COLORS.danger,
	CHART_COLORS.info,
	CHART_COLORS.pink,
	CHART_COLORS.muted,
];

export const CHART_AXIS = {
	stroke: "rgba(255,255,255,0.1)",
	tick: "rgba(255,255,255,0.4)",
	fontSize: 11,
} as const;

export const CHART_TOOLTIP = {
	background: "#18181b", // zinc-900
	border: "rgba(255,255,255,0.1)",
	text: "#e4e4e7", // zinc-200
} as const;

export const CHART_GRID = {
	stroke: "rgba(255,255,255,0.05)",
} as const;
