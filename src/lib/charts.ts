export type ChartPoint = {
	x: number;
	y: number;
};

export function createSmoothPath(points: ChartPoint[]) {
	if (!points.length) return "";
	if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
	let path = `M ${points[0].x} ${points[0].y}`;
	for (let index = 1; index < points.length; index += 1) {
		const previous = points[index - 1];
		const current = points[index];
		const controlX = previous.x + (current.x - previous.x) / 2;
		path += ` C ${controlX} ${previous.y} ${controlX} ${current.y} ${current.x} ${current.y}`;
	}
	return path;
}

export function createAreaPath(points: ChartPoint[], chartHeight: number, bottomPadding: number) {
	if (!points.length) return "";
	const baseline = chartHeight - bottomPadding;
	if (points.length === 1) {
		const [point] = points;
		return `M ${point.x} ${baseline} L ${point.x} ${point.y} L ${point.x + 0.001} ${baseline} Z`;
	}
	let path = `M ${points[0].x} ${baseline} L ${points[0].x} ${points[0].y}`;
	for (let index = 1; index < points.length; index += 1) {
		const previous = points[index - 1];
		const current = points[index];
		const controlX = previous.x + (current.x - previous.x) / 2;
		path += ` C ${controlX} ${previous.y} ${controlX} ${current.y} ${current.x} ${current.y}`;
	}
	path += ` L ${points[points.length - 1].x} ${baseline} Z`;
	return path;
}
