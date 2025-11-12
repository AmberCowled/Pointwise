'use client';

import { useId, useMemo, useState } from 'react';
import Navbar from '@pointwise/app/components/dashboard/Navbar';
import TaskList, {
  type DashboardTask,
} from '@pointwise/app/components/dashboard/TaskList';
import TaskCreateModal, {
  type TaskFormValues,
} from '@pointwise/app/components/dashboard/TaskCreateModal';
import TaskManageModal from '@pointwise/app/components/dashboard/TaskManageModal';

type AnalyticsTab = 'xp' | 'focus' | 'categories';
type AnalyticsRange = '1d' | '7d' | '30d';

const ANALYTICS_TAB_LABELS: Record<AnalyticsTab, string> = {
  xp: 'XP Trend',
  focus: 'Focus Tracker',
  categories: 'Category Breakdown',
};

const ANALYTICS_RANGE_LABELS: Record<AnalyticsRange, string> = {
  '1d': 'Past day',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
};

const CATEGORY_COLORS = [
  '#6366f1',
  '#a855f7',
  '#ec4899',
  '#f97316',
  '#22d3ee',
  '#10b981',
];

type ProfileSnapshot = {
  level: number;
  totalXp: number;
  xpIntoLevel: number;
  xpRemaining: number;
  progress: number;
  streak: number;
  title: string;
};

type DashboardPageClientProps = {
  today: string;
  displayName: string;
  initials: string;
  tasks: DashboardTask[];
  profile: ProfileSnapshot;
};

export default function DashboardPageClient({
  today,
  displayName,
  initials,
  tasks,
  profile,
}: DashboardPageClientProps) {
  const [xpState, setXpState] = useState({
    level: profile.level,
    totalXp: profile.totalXp,
    xpIntoLevel: profile.xpIntoLevel,
    xpRemaining: profile.xpRemaining,
    progress: profile.progress,
  });
  const [taskItems, setTaskItems] = useState<DashboardTask[]>(
    Array.isArray(tasks) ? tasks : [],
  );
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(() =>
    startOfDay(new Date()),
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [editorTask, setEditorTask] = useState<DashboardTask | null>(null);
  const [manageTask, setManageTask] = useState<DashboardTask | null>(null);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [editorVersion, setEditorVersion] = useState(0);
  const [analyticsTab, setAnalyticsTab] = useState<AnalyticsTab>('xp');
  const [analyticsRange, setAnalyticsRange] = useState<AnalyticsRange>('7d');
  const gradientSeed = useId();
  const xpGradientId = `${gradientSeed}-xp`;
  const focusGradientId = `${gradientSeed}-focus`;

  const handleSubmitTask = async (values: TaskFormValues) => {
    setIsCreating(true);
    try {
      if (editorMode === 'edit' && values.id) {
        const response = await fetch(`/api/tasks/${values.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: values.title,
            category: values.category,
            xpValue: values.xpValue,
            context: values.context,
            startAt: values.startAt,
            dueAt: values.dueAt,
          }),
        });

        if (!response.ok) throw new Error('Task update failed');

        const payload = await response.json();
        if (payload.task) {
          setTaskItems((prev) => mergeTasks(prev, [payload.task]));
          setEditorTask(payload.task);
        }
      } else {
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: values.title,
            category: values.category,
            xpValue: values.xpValue,
            context: values.context,
            startAt: values.startAt ?? null,
            dueAt: values.dueAt ?? null,
            recurrence: values.recurrence ?? 'none',
            recurrenceDays: values.recurrenceDays ?? [],
            recurrenceMonthDays: values.recurrenceMonthDays ?? [],
            timesOfDay: (values.timesOfDay ?? []).filter(Boolean),
          }),
        });

        if (!response.ok) throw new Error('Task creation failed');

        const payload = await response.json();
        if (Array.isArray(payload.tasks)) {
          setTaskItems((prev) => mergeTasks(prev, payload.tasks));
        }
      }

      setIsCreateOpen(false);
      setEditorTask(null);
      setManageTask(null);
      setIsManageOpen(false);
    } catch (error) {
      console.error('Failed to create task', error);
    } finally {
      setIsCreating(false);
    }
  };
  const openCreateModal = (
    mode: 'create' | 'edit',
    task: DashboardTask | null = null,
  ) => {
    setEditorMode(mode);
    setEditorTask(task);
    setEditorVersion((v) => v + 1);
    setIsCreateOpen(true);
  };
  const handleTaskClick = (task: DashboardTask) => {
    setManageTask(task);
    setIsManageOpen(true);
  };

  const handleEditTask = (task: DashboardTask) => {
    setIsManageOpen(false);
    openCreateModal('edit', task);
  };

  const handleDeleteTask = async (
    task: DashboardTask,
    scope: 'single' | 'all',
  ) => {
    try {
      const url =
        scope === 'all'
          ? `/api/tasks/${task.id}?scope=series`
          : `/api/tasks/${task.id}`;
      const response = await fetch(url, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Task deletion failed');
      }
      const payload = await response.json();
      const deletedIds: string[] = payload.deletedIds ?? [task.id];
      setTaskItems((prev) =>
        prev.filter((item) => !deletedIds.includes(item.id)),
      );
      setIsManageOpen(false);
      setManageTask(null);
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  };

  const filteredTasks = useMemo(() => {
    const dayStart = startOfDay(selectedDate);
    const dayKey = dayStart.getTime();
    return taskItems.filter((task) => {
      if (task.completed) return false;
      const rawStart = toDate(task.startAt);
      const rawEnd = toDate(task.dueAt);
      const start = rawStart
        ? startOfDay(rawStart)
        : rawEnd
          ? startOfDay(rawEnd)
          : null;
      const end = rawEnd
        ? startOfDay(rawEnd)
        : rawStart && !task.completed
          ? null
          : start;
      if (!start && !end) return false;
      const startTime = start?.getTime() ?? Number.NEGATIVE_INFINITY;
      const endTime = end ? end.getTime() : Number.POSITIVE_INFINITY;
      return startTime <= dayKey && endTime >= dayKey;
    });
  }, [selectedDate, taskItems]);

  const optionalTasks = useMemo(
    () =>
      taskItems.filter(
        (task) => !task.completed && !task.startAt && !task.dueAt,
      ),
    [taskItems],
  );

  const xpSeries = useMemo(
    () => buildXpSeries(taskItems, analyticsRange),
    [taskItems, analyticsRange],
  );

  const totalXpInRange = useMemo(
    () => xpSeries.reduce((sum, point) => sum + point.value, 0),
    [xpSeries],
  );

  const focusSeries = useMemo(
    () => buildFocusSeries(taskItems, analyticsRange),
    [taskItems, analyticsRange],
  );

  const peakFocusHour = useMemo(
    () => getPeakFocusHour(focusSeries),
    [focusSeries],
  );

  const categoryBreakdown = useMemo(
    () => buildCategoryBreakdown(taskItems, analyticsRange),
    [taskItems, analyticsRange],
  );

  const categoryGradient = useMemo(
    () => buildCategoryGradient(categoryBreakdown),
    [categoryBreakdown],
  );

  const totalCategoryCount = useMemo(
    () => categoryBreakdown.reduce((sum, slice) => sum + slice.value, 0),
    [categoryBreakdown],
  );

  const tabButtonClass = (tab: AnalyticsTab) =>
    [
      'rounded-full border px-3 py-1 text-sm font-semibold transition',
      analyticsTab === tab
        ? 'border-indigo-400/70 bg-indigo-500/20 text-white shadow-inner shadow-indigo-500/30'
        : 'border-white/10 text-zinc-300 hover:border-indigo-400/60 hover:text-white',
    ].join(' ');

  const rangeButtonClass = (range: AnalyticsRange) =>
    [
      'rounded-full border px-3 py-1 text-xs font-semibold tracking-wide transition',
      analyticsRange === range
        ? 'border-indigo-400/80 bg-indigo-500/20 text-white shadow-inner shadow-indigo-500/30'
        : 'border-white/10 text-zinc-400 hover:border-indigo-400/60 hover:text-white',
    ].join(' ');

  const overdueTasks = useMemo(() => {
    const now = Date.now();
    return taskItems
      .filter((task) => {
        if (task.completed) return false;
        const due = toDate(task.dueAt);
        if (!due) return false;
        return due.getTime() < now;
      })
      .sort((a, b) => {
        const aDue = toDate(a.dueAt)!.getTime();
        const bDue = toDate(b.dueAt)!.getTime();
        return aDue - bDue;
      });
  }, [taskItems]);

  const selectedDateLabel = useMemo(() => {
    return formatDateLabel(selectedDate);
  }, [selectedDate]);

  const selectedDateInputValue = useMemo(() => {
    return toDateKey(selectedDate);
  }, [selectedDate]);

  const handleComplete = async (task: DashboardTask) => {
    if (task.completed || completingId) return;
    setCompletingId(task.id);
    try {
      const response = await fetch(`/api/tasks/${task.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Task completion failed');
      }

      const payload = await response.json();

      if (payload.task) {
        setTaskItems((prev) => mergeTasks(prev, [payload.task]));
      }

      if (payload.xp) {
        const xpSnapshot = payload.xp;
        const xpIntoLevel = xpSnapshot.xpIntoLevel ?? 0;
        const xpToNext = xpSnapshot.xpToNext ?? 0;
        setXpState({
          level: xpSnapshot.level,
          totalXp: xpSnapshot.totalXp,
          xpIntoLevel,
          xpRemaining: Math.max(0, xpToNext - xpIntoLevel),
          progress: xpSnapshot.progress ?? 0,
        });
      }
    } catch (error) {
      console.error('Failed to complete task', error);
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <>
      <Navbar
        initials={initials}
        level={xpState.level}
        xpRemaining={xpState.xpRemaining}
        progress={xpState.progress}
      />

      <TaskCreateModal
        key={`task-modal-${editorMode}-${editorTask?.id ?? 'new'}-${editorVersion}`}
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        defaultDate={selectedDate}
        onSubmit={handleSubmitTask}
        loading={isCreating}
        mode={editorMode}
        task={editorTask}
      />
      <TaskManageModal
        open={isManageOpen}
        task={manageTask}
        onClose={() => {
          setIsManageOpen(false);
          setManageTask(null);
        }}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        onComplete={handleComplete}
        isCompleting={Boolean(completingId && manageTask?.id === completingId)}
      />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
              {today}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Welcome back, {displayName}
            </h1>
          </div>
        </header>

        <main className="flex-1 space-y-6">
          <section className="space-y-6">
            <div className="rounded-3xl border border-white/5 bg-zinc-900/60 p-6 backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                    Overview
                  </p>
                  <h2 className="mt-2 text-xl font-semibold">Task list</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-zinc-200 transition hover:border-indigo-400/60 hover:bg-indigo-500/10 hover:text-white"
                    onClick={() => openCreateModal('create')}
                  >
                    Create Task
                  </button>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-medium text-zinc-200">
                  {selectedDateLabel}
                </div>
                <div className="inline-flex items-center gap-1">
                  <button
                    className="rounded-full border border-white/10 px-2 py-1 font-medium text-zinc-300 transition hover:border-indigo-400/60 hover:text-white"
                    onClick={() => setSelectedDate((prev) => addDays(prev, -1))}
                  >
                    ⟨ Prev
                  </button>
                  <button
                    className="rounded-full border border-white/10 px-2 py-1 font-medium text-zinc-300 transition hover:border-indigo-400/60 hover:text-white"
                    onClick={() => setSelectedDate(startOfDay(new Date()))}
                  >
                    Today
                  </button>
                  <button
                    className="rounded-full border border-white/10 px-2 py-1 font-medium text-zinc-300 transition hover:border-indigo-400/60 hover:text-white"
                    onClick={() => setSelectedDate((prev) => addDays(prev, 1))}
                  >
                    Next ⟩
                  </button>
                </div>
                <label className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-medium text-zinc-200">
                  <span className="text-xs text-zinc-400">Jump to</span>
                  <input
                    className="cursor-pointer border-0 bg-transparent text-sm text-zinc-100 focus:outline-none"
                    type="date"
                    value={selectedDateInputValue}
                    onChange={(event) => {
                      const value = event.target.value;
                      if (!value) return;
                      const next = new Date(value);
                      if (!Number.isNaN(next.getTime())) {
                        setSelectedDate(startOfDay(next));
                      }
                    }}
                  />
                </label>
              </div>
              {filteredTasks.length > 0 ? (
                <TaskList
                  tasks={filteredTasks}
                  onComplete={handleComplete}
                  completingTaskId={completingId}
                  onTaskClick={handleTaskClick}
                />
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-sm text-zinc-400">
                  No tasks scheduled for{' '}
                  <span className="font-medium text-zinc-200">
                    {selectedDateLabel}
                  </span>
                  . Add one with{' '}
                  <span className="font-medium text-zinc-200">Create Task</span>{' '}
                  or set up a recurring routine.
                </div>
              )}
            </div>

            {overdueTasks.length > 0 ? (
              <div className="rounded-3xl border border-white/5 bg-zinc-900/60 p-6 backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-rose-400/70">
                      Needs attention
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-rose-200">
                      Overdue tasks
                    </h2>
                  </div>
                </div>
                <TaskList
                  tasks={overdueTasks}
                  onComplete={handleComplete}
                  completingTaskId={completingId}
                  onTaskClick={handleTaskClick}
                />
              </div>
            ) : null}

            {optionalTasks.length > 0 ? (
              <div className="rounded-3xl border border-white/5 bg-zinc-900/60 p-6 backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                      Backlog
                    </p>
                    <h2 className="mt-2 text-xl font-semibold">
                      Optional tasks
                    </h2>
                  </div>
                </div>
                <TaskList
                  tasks={optionalTasks}
                  onComplete={handleComplete}
                  completingTaskId={completingId}
                  onTaskClick={handleTaskClick}
                />
              </div>
            ) : null}
          </section>
        </main>

        <section className="rounded-3xl border border-white/5 bg-zinc-900/60 p-6 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                Analytics
              </p>
              <h2 className="mt-2 text-xl font-semibold text-zinc-100">
                {ANALYTICS_TAB_LABELS[analyticsTab]}
              </h2>
              <p className="text-sm text-zinc-500">
                {ANALYTICS_RANGE_LABELS[analyticsRange]}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {(['1d', '7d', '30d'] as const).map((range) => (
                <button
                  key={range}
                  type="button"
                  className={rangeButtonClass(range)}
                  onClick={() => setAnalyticsRange(range)}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            {(['xp', 'focus', 'categories'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                className={tabButtonClass(tab)}
                onClick={() => setAnalyticsTab(tab)}
              >
                {ANALYTICS_TAB_LABELS[tab]}
              </button>
            ))}
          </div>

          <div className="mt-8">
            {analyticsTab === 'xp' ? (
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
                      {xpSeries[
                        Math.max(0, Math.floor((xpSeries.length - 1) / 2))
                      ]?.label ?? ''}
                    </span>
                    <span className="text-right">
                      {xpSeries[xpSeries.length - 1]?.label ?? ''}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-sm text-zinc-400">
                  No XP recorded in this window yet. Complete tasks to populate
                  your trendline.
                </div>
              )
            ) : analyticsTab === 'focus' ? (
              focusSeries.some((point) => point.value > 0) ? (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-400">
                    <span>Peak focus window</span>
                    {peakFocusHour ? (
                      <span className="text-lg font-semibold text-cyan-200">
                        {peakFocusHour.label} ·{' '}
                        {Math.round(peakFocusHour.value)} XP/hr
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
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-sm text-zinc-400">
                  No focus data yet. Completing tasks will reveal your daily
                  energy curve.
                </div>
              )
            ) : categoryBreakdown.length > 0 ? (
              <div className="grid gap-8 lg:grid-cols-[240px,1fr]">
                <div className="relative mx-auto h-48 w-48">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        categoryGradient ??
                        'conic-gradient(#27272a 0deg 360deg)',
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
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-sm text-zinc-400">
                Complete at least one task to unlock your category mix.
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

type LineDataPoint = { label: string; value: number };

type CategorySlice = {
  category: string;
  value: number;
  percentage: number;
  color: string;
};

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
        <rect
          x="0"
          y="0"
          width="100"
          height="100"
          fill="#09090b"
          opacity="0.0"
        />
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

function buildXpSeries(tasks: DashboardTask[], range: AnalyticsRange) {
  const { start, end, days } = getAnalyticsWindow(range);

  if (range === '1d') {
    const buckets = new Array(24).fill(0);
    for (const task of tasks) {
      if (!task.completed) continue;
      const completedAt = getEffectiveCompletionDate(task);
      if (!completedAt) continue;
      if (completedAt < start || completedAt > end) continue;
      const hour = completedAt.getHours();
      buckets[hour] += task.xp ?? 0;
    }

    return buckets.map((value, hour) => ({
      label: formatHourLabel(hour),
      value,
    }));
  }

  const totals = new Map<string, number>();
  for (const task of tasks) {
    if (!task.completed) continue;
    const completedAt = getEffectiveCompletionDate(task);
    if (!completedAt) continue;
    if (completedAt < start || completedAt > end) continue;
    const key = toDateKey(startOfDay(completedAt));
    totals.set(key, (totals.get(key) ?? 0) + (task.xp ?? 0));
  }

  const series: LineDataPoint[] = [];
  for (let index = 0; index < days; index += 1) {
    const date = addDays(start, index);
    const key = toDateKey(date);
    series.push({
      label: formatShortDayLabel(date),
      value: totals.get(key) ?? 0,
    });
  }
  return series;
}

function buildFocusSeries(tasks: DashboardTask[], range: AnalyticsRange) {
  const { start, end } = getAnalyticsWindow(range);
  const buckets = new Array(24).fill(0);
  const dayKeys = new Set<string>();

  for (const task of tasks) {
    if (!task.completed) continue;
    const completedAt = getEffectiveCompletionDate(task);
    if (!completedAt) continue;
    if (completedAt < start || completedAt > end) continue;
    const hour = completedAt.getHours();
    buckets[hour] += task.xp ?? 0;
    dayKeys.add(toDateKey(startOfDay(completedAt)));
  }

  const divisor = Math.max(1, dayKeys.size || (range === '1d' ? 1 : 0));

  return buckets.map((value, hour) => ({
    label: formatHourLabel(hour),
    value: divisor > 0 ? value / divisor : 0,
  }));
}

function getPeakFocusHour(series: LineDataPoint[]) {
  if (!series.length) return null;
  return series.reduce<LineDataPoint | null>((best, point) => {
    if (!best || point.value > best.value) {
      return point;
    }
    return best;
  }, null);
}

function buildCategoryBreakdown(
  tasks: DashboardTask[],
  range: AnalyticsRange,
): CategorySlice[] {
  const { start, end } = getAnalyticsWindow(range);
  const counts = new Map<string, number>();
  for (const task of tasks) {
    if (!task.completed) continue;
    const completedAt = getEffectiveCompletionDate(task);
    if (!completedAt) continue;
    if (completedAt < start || completedAt > end) continue;
    const key = (task.category ?? 'Uncategorized').trim() || 'Uncategorized';
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const entries = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  if (total === 0) return [];
  return entries.map(([category, value], index) => ({
    category,
    value,
    percentage: value / total,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }));
}

function buildCategoryGradient(slices: CategorySlice[]) {
  if (!slices.length) return null;
  let cumulative = 0;
  const segments: string[] = [];
  for (const slice of slices) {
    const start = cumulative * 360;
    cumulative += slice.percentage;
    const end = cumulative * 360;
    segments.push(`${slice.color} ${start.toFixed(2)}deg ${end.toFixed(2)}deg`);
  }
  return `conic-gradient(${segments.join(', ')})`;
}

function getAnalyticsWindow(range: AnalyticsRange) {
  const end = new Date();
  const todayStart = startOfDay(end);
  const days = range === '1d' ? 1 : range === '7d' ? 7 : 30;
  const start = addDays(todayStart, -(days - 1));
  return { start, end, days };
}

function getEffectiveCompletionDate(task: DashboardTask) {
  const completion = toDate(task.completedAt);
  if (completion) return completion;
  const due = toDate(task.dueAt);
  if (due) return due;
  const start = toDate(task.startAt);
  return start;
}

const SHORT_DAY_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
});

function formatShortDayLabel(date: Date) {
  return SHORT_DAY_FORMATTER.format(date);
}

function formatHourLabel(hour: number) {
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12} ${period}`;
}

type ChartPoint = { x: number; y: number };

function createSmoothPath(points: ChartPoint[]) {
  if (!points.length) return '';
  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    const controlX = previous.x + (current.x - previous.x) / 2;
    path += ` C ${controlX} ${previous.y} ${controlX} ${current.y} ${current.x} ${current.y}`;
  }
  return path;
}

function createAreaPath(
  points: ChartPoint[],
  chartHeight: number,
  bottomPadding: number,
) {
  if (!points.length) return '';
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

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date: Date, amount: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return startOfDay(copy);
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const DATE_LABEL_FORMATTER = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

function formatDateLabel(date: Date) {
  const utcSafe = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  return DATE_LABEL_FORMATTER.format(utcSafe);
}

function toDate(input?: string | Date | null) {
  if (!input) return null;
  const value = input instanceof Date ? input : new Date(input);
  return Number.isNaN(value.getTime()) ? null : value;
}

function mergeTasks(existing: DashboardTask[], incoming: DashboardTask[]) {
  const map = new Map<string, DashboardTask>();
  for (const task of existing) {
    map.set(task.id, task);
  }
  for (const task of incoming) {
    map.set(task.id, task);
  }
  const result = Array.from(map.values());
  result.sort((a, b) => {
    const aTime = getTaskSortTime(a);
    const bTime = getTaskSortTime(b);
    const aFinite = Number.isFinite(aTime);
    const bFinite = Number.isFinite(bTime);
    if (!aFinite && !bFinite) return 0;
    if (!aFinite) return 1;
    if (!bFinite) return -1;
    return aTime - bTime;
  });
  return result;
}

function getTaskSortTime(task: DashboardTask) {
  const start = toDate(task.startAt);
  if (start) return start.getTime();
  const due = toDate(task.dueAt);
  if (due) return due.getTime();
  return Number.POSITIVE_INFINITY;
}
