'use client';

import type { DashboardTask } from '../tasks/TaskList';
import { useEffect, useId, useMemo, useState } from 'react';
import LineChart from './LineChart';
import useAnalyticsSeries from '@pointwise/hooks/useAnalyticsSeries';
import {
  ANALYTICS_RANGE_LABELS,
  ANALYTICS_TAB_LABELS,
  type AnalyticsSnapshot,
  type AnalyticsRange,
  type AnalyticsTab,
} from '@pointwise/lib/analytics';
import { CUSTOM_CATEGORY_LABEL } from '@pointwise/lib/categories';
import {
  AnalyticsCard,
  AnalyticsRangeSelect,
  AnalyticsTabs,
} from './AnalyticsCard';
import AnalyticsSummaryMetric from './AnalyticsSummaryMetric';

export type { AnalyticsTab, AnalyticsRange };

export default function AnalyticsSection({
  tasks,
  locale,
  timeZone,
  initialSnapshot,
}: {
  tasks: DashboardTask[];
  locale: string;
  timeZone: string;
  initialSnapshot?: AnalyticsSnapshot | null;
}) {
  const [tab, setTab] = useState<AnalyticsTab>('xp');
  const [range, setRange] = useState<AnalyticsRange>('7d');
  const gradientSeed = useId();
  const xpGradientId = `${gradientSeed}-xp`;
  const focusGradientId = `${gradientSeed}-focus`;
  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(locale),
    [locale],
  );

  const liveSnapshot = useAnalyticsSeries(tasks, range, locale, timeZone);
  const [snapshot, setSnapshot] = useState<AnalyticsSnapshot>(
    initialSnapshot ?? liveSnapshot,
  );

  useEffect(() => {
    setSnapshot(liveSnapshot);
  }, [liveSnapshot]);

  const {
    xpSeries,
    totalXpInRange,
    focusSeries,
    peakFocusHour,
    categoryBreakdown,
    customCategoryBreakdown,
    categoryGradient,
    totalCategoryCount,
  } = snapshot;

  const tabOptions = (Object.keys(ANALYTICS_TAB_LABELS) as AnalyticsTab[]).map(
    (value) => ({ value, label: ANALYTICS_TAB_LABELS[value] }),
  );

  const rangeOptions = (
    Object.keys(ANALYTICS_RANGE_LABELS) as AnalyticsRange[]
  ).map((value) => ({ value, label: value.toUpperCase() }));

  return (
    <AnalyticsCard
      title={ANALYTICS_TAB_LABELS[tab]}
      subtitle="Analytics"
      controls={
        <AnalyticsRangeSelect
          value={range}
          options={rangeOptions}
          onChange={setRange}
        />
      }
      contentClassName="space-y-8"
    >
      <AnalyticsTabs value={tab} options={tabOptions} onChange={setTab} />

      {tab === 'xp' ? (
        <div className="space-y-6">
          <AnalyticsSummaryMetric
            label="XP earned in range"
            value={`+${numberFormatter.format(totalXpInRange)} XP`}
          />
          <LineChart
            data={xpSeries}
            lineColor="#a855f7"
            gradientId={xpGradientId}
            formatValue={(point) =>
              `+${numberFormatter.format(Math.round(point.value))} XP`
            }
            locale={locale}
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
          <AnalyticsSummaryMetric
            label="Peak focus window"
            value={
              peakFocusHour
                ? `${peakFocusHour.label} · ${numberFormatter.format(
                    Math.round(peakFocusHour.value),
                  )} XP/hr`
                : 'No peak yet'
            }
          />
          <LineChart
            data={focusSeries}
            lineColor="#22d3ee"
            gradientId={focusGradientId}
            formatValue={(point) =>
              `${numberFormatter.format(Math.round(point.value))} XP/hr`
            }
            locale={locale}
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
              {numberFormatter.format(totalCategoryCount)} completed
              <br />
              tasks
            </div>
          </div>
          <ul className="flex flex-1 flex-col gap-3 text-sm">
            {categoryBreakdown.length > 0 ? (
              categoryBreakdown.map((slice) => (
                <li
                  key={slice.category}
                  className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-4">
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
                        {numberFormatter.format(slice.value)} tasks
                      </span>
                    </div>
                  </div>
                  {slice.category === CUSTOM_CATEGORY_LABEL &&
                  customCategoryBreakdown.length > 0 ? (
                    <ul className="mt-3 space-y-2 border-l border-white/10 pl-4 text-xs text-zinc-400">
                      {customCategoryBreakdown.map((custom) => (
                        <li
                          key={`custom-${custom.category}`}
                          className="flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{
                                background: custom.color,
                                opacity: 0.8,
                              }}
                            />
                            <span className="font-medium text-zinc-300">
                              {custom.category}
                            </span>
                          </div>
                          <div className="text-right text-[11px] text-zinc-400">
                            <span className="font-semibold text-zinc-200">
                              {Math.round(custom.percentage * 100)}%
                            </span>
                            <span className="ml-2 text-[10px] text-zinc-500">
                              {numberFormatter.format(custom.value)} tasks
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : null}
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
    </AnalyticsCard>
  );
}
