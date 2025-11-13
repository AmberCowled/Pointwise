'use client';

import { useState } from 'react';
import type { LineDataPoint } from '@pointwise/lib/analytics';
import { createAreaPath, createSmoothPath } from '@pointwise/lib/charts';

type LineChartProps = {
  data: LineDataPoint[];
  gradientId: string;
  lineColor: string;
  height?: number;
  formatValue?: (point: LineDataPoint) => string;
};

export default function LineChart({
  data,
  gradientId,
  lineColor,
  height = 160,
  formatValue,
}: LineChartProps) {
  const chartHeight = 100;
  const topPadding = 12;
  const bottomPadding = 12;
  const baseline = chartHeight - bottomPadding;
  const maxValue = data.reduce((max, point) => Math.max(max, point.value), 0);
  const span = data.length > 1 ? 100 / (data.length - 1) : 0;
  const corePoints = data.map((point, index) => {
    const x = data.length > 1 ? index * span : 50;
    const normalized = maxValue > 0 ? point.value / maxValue : 0;
    const y =
      chartHeight -
      bottomPadding -
      normalized * (chartHeight - topPadding - bottomPadding);
    return { x, y };
  });
  const linePoints = corePoints.length
    ? [{ x: 0, y: baseline }, ...corePoints, { x: 100, y: baseline }]
    : [];
  const linePath = createSmoothPath(linePoints);
  const areaPath = createAreaPath(corePoints, chartHeight, bottomPadding);

  const [hover, setHover] = useState<{
    index: number;
    dataPoint: LineDataPoint;
    svgX: number;
    svgY: number;
    xPx: number;
    yPx: number;
  } | null>(null);

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!corePoints.length) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const relativeX = ((event.clientX - rect.left) / rect.width) * 100;

    let nearestIndex = 0;
    let shortestDistance = Number.POSITIVE_INFINITY;
    for (let index = 0; index < corePoints.length; index += 1) {
      const distance = Math.abs(corePoints[index].x - relativeX);
      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestIndex = index;
      }
    }

    const point = corePoints[nearestIndex];
    const dataPoint = data[nearestIndex];
    const xPx = (point.x / 100) * rect.width;
    const unclampedYPx = (point.y / 100) * rect.height;
    const clampedYPx = Math.min(Math.max(unclampedYPx, 16), rect.height - 16);

    setHover({
      index: nearestIndex,
      dataPoint,
      svgX: point.x,
      svgY: point.y,
      xPx,
      yPx: clampedYPx,
    });
  };

  const handlePointerLeave = () => {
    setHover(null);
  };

  return (
    <div className="relative w-full" style={{ height }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-full w-full touch-none"
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.45" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="100" height="100" fill="#09090b" opacity="0" />
        {areaPath ? (
          <path d={areaPath} fill={`url(#${gradientId})`} opacity="0.75" />
        ) : null}
        {linePath ? (
          <path
            d={linePath}
            fill="none"
            stroke={lineColor}
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
        {hover ? (
          <>
            <line
              x1={hover.svgX}
              x2={hover.svgX}
              y1={topPadding}
              y2={baseline}
              stroke={lineColor}
              strokeWidth={0.6}
              strokeDasharray="1.5 2.5"
              opacity={0.6}
            />
            <circle
              cx={hover.svgX}
              cy={hover.svgY}
              r={3}
              fill="#09090b"
              opacity={0.85}
            />
            <circle cx={hover.svgX} cy={hover.svgY} r={2.2} fill={lineColor} />
          </>
        ) : null}
        {corePoints.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={1.2}
            fill={lineColor}
            opacity={maxValue > 0 ? 0.9 : 0}
          />
        ))}
      </svg>
      {hover ? (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-3 rounded-2xl border border-white/10 bg-zinc-900/95 px-3 py-2 text-xs text-zinc-200 shadow-xl shadow-black/30"
          style={{ left: `${hover.xPx}px`, top: `${hover.yPx}px` }}
        >
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">
            {hover.dataPoint.label}
          </p>
          <p className="mt-1 text-sm font-semibold text-white">
            {formatValue
              ? formatValue(hover.dataPoint)
              : hover.dataPoint.value.toLocaleString()}
          </p>
        </div>
      ) : null}
    </div>
  );
}
