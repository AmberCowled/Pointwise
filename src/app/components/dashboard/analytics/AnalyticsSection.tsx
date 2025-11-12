'use client';

import type { DashboardTask } from '../TaskList';
import { useId, useMemo, useState } from 'react';
import {
  type AnalyticsRange,
  type LineDataPoint,
  buildXpSeries,
  buildFocusSeries,
  getPeakFocusHour,
  buildCategoryBreakdown,
  buildCategoryGradient,
  createSmoothPath,
  createAreaPath,
} from '@pointwise/lib/analytics';

const ANALYTICS_TAB_LABELS = {
  xp: 'XP Trend',
  focus: 'Focus Tracker',
  categories: 'Category Breakdown',
} as const;

const ANALYTICS_RANGE_LABELS = {
  '1d': 'Past day',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
} as const;

export type AnalyticsTab = keyof typeof ANALYTICS_TAB_LABELS;
export type { AnalyticsRange };

export default function AnalyticsSection({
  tasks,
}: {
  tasks: DashboardTask[];
}) {
  const [tab, setTab] = useState<AnalyticsTab>('xp');
  const [range, setRange] = useState<AnalyticsRange>('7d');
  const gradientSeed = useId();
  const xpGradientId = `${gradientSeed}-xp`;
  const focusGradientId = `${gradientSeed}-focus`;

  const stableTasks = useMemo(
    () => (Array.isArray(tasks) ? tasks : []),
    [tasks],
  );

  const xpSeries = useMemo(
    () => buildXpSeries(stableTasks, range),
    [stableTasks, range],
  );
  const totalXpInRange = useMemo(
    () => xpSeries.reduce((sum, point) => sum + point.value, 0),
    [xpSeries],
  );
  const focusSeries = useMemo(
    () => buildFocusSeries(stableTasks, range),
    [stableTasks, range],
  );
  const peakFocusHour = useMemo(
    () => getPeakFocusHour(focusSeries),
    [focusSeries],
  );
  const categoryBreakdown = useMemo(
    () => buildCategoryBreakdown(stableTasks, range),
    [stableTasks, range],
  );
  const categoryGradient = useMemo(
    () => buildCategoryGradient(categoryBreakdown),
    [categoryBreakdown],
  );
  const totalCategoryCount = useMemo(
    () => categoryBreakdown.reduce((sum, slice) => sum + slice.value, 0),
    [categoryBreakdown],
  );

  const tabButtonClass = (value: AnalyticsTab) =>
    [
      'rounded-full border px-3 py-1 text-sm font-semibold transition',
      tab === value
        ? 'border-indigo-400/70 bg-indigo-500/20 text-white shadow-inner shadow-indigo-500/30'
        : 'border-white/10 text-zinc-300 hover:border-indigo-400/60 hover:text-white',
    ].join(' ');

  const rangeButtonClass = (value: AnalyticsRange) =>
    [
      'rounded-full border px-3 py-1 text-xs font-semibold tracking-wide transition',
      range === value
        ? 'border-indigo-400/80 bg-indigo-500/20 text-white shadow-inner shadow-indigo-500/30'
        : 'border-white/10 text-zinc-400 hover:border-indigo-400/60 hover:text-white',
    ].join(' ');

  return (
    <section className="rounded-3xl border border-white/5 bg-zinc-900/60 p-6 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            Analytics
          </p>
          <h2 className="mt-2 text-xl font-semibold text-zinc-100">
            {ANALYTICS_TAB_LABELS[tab]}
          </h2>
          <p className="text-sm text-zinc-500">
            {ANALYTICS_RANGE_LABELS[range]}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(Object.keys(ANALYTICS_RANGE_LABELS) as AnalyticsRange[]).map(
            (value) => (
              <button
                key={value}
                type="button"
                className={rangeButtonClass(value)}
                onClick={() => setRange(value)}
              >
                {value.toUpperCase()}
              </button>
            ),
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {(Object.keys(ANALYTICS_TAB_LABELS) as AnalyticsTab[]).map((value) => (
          <button
            key={value}
            type="button"
            className={tabButtonClass(value)}
            onClick={() => setTab(value)}
          >
            {ANALYTICS_TAB_LABELS[value]}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === 'xp' ? (
          xpSeries.some((point) => point.value > 0) ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-400">
                <span>XP earned in range</span>
                <span className="text-lg font-semibold text-zinc-100">
                  +{totalXpInRange.toLocaleString()} XP
                </span>
              </div>
              <LineChart
                data={xpSeries}
                lineColor="#a855f7"
                gradientId={xpGradientId}
                formatValue={(point) =>
                  `+${Math.round(point.value).toLocaleString()} XP`
                }
              />
              <div className="grid grid-cols-3 text-xs text-zinc-500">
                <span>{xpSeries[0]?.label ?? ''}</span>
                <span className="text-center">
                  {xpSeries[Math.max(0, Math.floor((xpSeries.length - 1) / 2))]
                    ?.label ?? ''}
                </span>
                <span className="text-right">
                  {xpSeries[xpSeries.length - 1]?.label ?? ''}
                </span>
              </div>
            </div>
          ) : (
            <EmptyState message="No XP recorded in this window yet. Complete tasks to populate your trendline." />
          )
        ) : tab === 'focus' ? (
          focusSeries.some((point) => point.value > 0) ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-400">
                <span>Peak focus window</span>
                {peakFocusHour ? (
                  <span className="text-lg font-semibold text-cyan-200">
                    {peakFocusHour.label} · {Math.round(peakFocusHour.value)}{' '}
                    XP/hr
                  </span>
                ) : (
                  <span className="text-zinc-500">No peak yet</span>
                )}
              </div>
              <LineChart
                data={focusSeries}
                lineColor="#22d3ee"
                gradientId={focusGradientId}
                formatValue={(point) =>
                  `${Math.round(point.value).toLocaleString()} XP/hr`
                }
              />
              <div className="grid grid-cols-5 text-xs text-zinc-500">
                {[0, 6, 12, 18, 23].map((hour) => (
                  <span
                    key={hour}
                    className={
                      hour === 0
                        ? ''
                        : hour === 23
                          ? 'text-right'
                          : 'text-center'
                    }
                  >
                    {focusSeries[hour]?.label ?? ''}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState message="No focus data yet. Completing tasks will reveal your daily energy curve." />
          )
        ) : categoryBreakdown.length > 0 ? (
          <div className="grid gap-8 lg:grid-cols-[240px,1fr]">
            <div className="relative mx-auto h-48 w-48">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    categoryGradient ?? 'conic-gradient(#27272a 0deg 360deg)',
                }}
              />
              <div className="absolute inset-[20%] rounded-full bg-zinc-950/90 shadow-inner shadow-black/40" />
              <div className="relative flex h-full w-full items-center justify-center text-center text-sm font-semibold text-zinc-100">
                {totalCategoryCount} completed
                <br />
                tasks
              </div>
            </div>
            <ul className="flex flex-1 flex-col gap-3 text-sm">
              {categoryBreakdown.map((slice) => (
                <li
                  key={slice.category}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/5 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: slice.color }}
                    />
                    <span className="font-medium text-zinc-100">
                      {slice.category}
                    </span>
                  </div>
                  <div className="text-right text-sm text-zinc-300">
                    <span className="font-semibold text-zinc-100">
                      {Math.round(slice.percentage * 100)}%
                    </span>
                    <span className="ml-2 text-xs text-zinc-500">
                      {slice.value} tasks
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <EmptyState message="Complete at least one task to unlock your category mix." />
        )}
      </div>
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-sm text-zinc-400">
      {message}
    </div>
  );
}

function LineChart({
  data,
  gradientId,
  lineColor,
  height = 160,
  formatValue,
}: {
  data: LineDataPoint[];
  gradientId: string;
  lineColor: string;
  height?: number;
  formatValue?: (point: LineDataPoint) => string;
}) {
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
  const [hover, setHover] = useState<{
    index: number;
    dataPoint: LineDataPoint;
    svgX: number;
    svgY: number;
    xPx: number;
    yPx: number;
  } | null>(null);

  const linePoints = corePoints.length
    ? [{ x: 0, y: baseline }, ...corePoints, { x: 100, y: baseline }]
    : [];
  const linePath = createSmoothPath(linePoints);
  const areaPath = createAreaPath(corePoints, chartHeight, bottomPadding);

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
