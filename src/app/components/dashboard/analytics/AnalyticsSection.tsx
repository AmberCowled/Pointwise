'use client';

import type { DashboardTask } from '../TaskList';
import { useId, useState } from 'react';
import LineChart from './LineChart';
import useAnalyticsSeries from './useAnalyticsSeries';
import {
  ANALYTICS_RANGE_LABELS,
  ANALYTICS_TAB_LABELS,
  type AnalyticsRange,
  type AnalyticsTab,
} from '@pointwise/lib/analytics';

export type { AnalyticsTab, AnalyticsRange };

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

  const {
    xpSeries,
    totalXpInRange,
    focusSeries,
    peakFocusHour,
    categoryBreakdown,
    categoryGradient,
    totalCategoryCount,
  } = useAnalyticsSeries(tasks, range);

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
        ) : tab === 'focus' ? (
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
                    hour === 0 ? '' : hour === 23 ? 'text-right' : 'text-center'
                  }
                >
                  {focusSeries[hour]?.label ?? ''}
                </span>
              ))}
            </div>
          </div>
        ) : (
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
              {categoryBreakdown.length > 0 ? (
                categoryBreakdown.map((slice) => (
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
                ))
              ) : (
                <li className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-zinc-400">
                  Complete tasks to see your category mix.
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
