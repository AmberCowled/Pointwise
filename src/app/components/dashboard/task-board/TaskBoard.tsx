"use client";

import TaskList from "@pointwise/app/components/dashboard/tasks/TaskList";
import { Button } from "@pointwise/app/components/ui/Button";
import { addDays, startOfDay } from "@pointwise/lib/datetime";
import { useEffect, useRef, useState } from "react";
import TaskBoardEmptyState from "./TaskBoardEmptyState";
import TaskBoardLoadingState from "./TaskBoardLoadingState";
import TaskDayControls from "./TaskDayControls";
import TaskSectionCard from "./TaskSectionCard";
import type { TaskBoardProps, TaskBoardViewMode } from "./types";

export type { TaskBoardProps };

export default function TaskBoard({
  scheduledTasks,
  optionalTasks,
  overdueTasks,
  upcomingTasks,
  selectedDate,
  selectedDateLabel,
  selectedDateInputValue,
  onSelectedDateChange,
  onCreateTask,
  onTaskClick,
  onCompleteTask,
  completingTaskId,
  locale,
  timeZone,
  viewMode: externalViewMode,
  onViewModeChange: externalOnViewModeChange,
  searchQuery,
}: TaskBoardProps) {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [internalViewMode, setInternalViewMode] =
    useState<TaskBoardViewMode>("day");
  const [isFocused, setIsFocused] = useState(false);
  const boardRef = useRef<HTMLElement>(null);

  // Use external viewMode if provided, otherwise use internal state
  const effectiveViewMode = externalViewMode ?? internalViewMode;
  const effectiveSetViewMode = externalOnViewModeChange ?? setInternalViewMode;

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setHasHydrated(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // Keyboard shortcuts handler
  useEffect(() => {
    if (!isFocused) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't handle shortcuts if user is typing in an input, textarea, or select
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      // Prevent default for our shortcuts
      if (
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight" ||
        event.key === "t" ||
        event.key === "T" ||
        event.key === "d" ||
        event.key === "D" ||
        event.key === "w" ||
        event.key === "W" ||
        event.key === "m" ||
        event.key === "M"
      ) {
        event.preventDefault();
      }

      // Handle shortcuts
      if (event.key === "ArrowLeft") {
        // Previous
        if (effectiveViewMode === "week") {
          onSelectedDateChange(addDays(selectedDate, -7, timeZone));
        } else if (effectiveViewMode === "month") {
          onSelectedDateChange(addDays(selectedDate, -30, timeZone));
        } else {
          onSelectedDateChange(addDays(selectedDate, -1, timeZone));
        }
      } else if (event.key === "ArrowRight") {
        // Next
        if (effectiveViewMode === "week") {
          onSelectedDateChange(addDays(selectedDate, 7, timeZone));
        } else if (effectiveViewMode === "month") {
          onSelectedDateChange(addDays(selectedDate, 30, timeZone));
        } else {
          onSelectedDateChange(addDays(selectedDate, 1, timeZone));
        }
      } else if (event.key === "t" || event.key === "T") {
        // Today
        onSelectedDateChange(startOfDay(new Date(), timeZone));
      } else if (event.key === "d" || event.key === "D") {
        // Day view
        effectiveSetViewMode("day");
      } else if (event.key === "w" || event.key === "W") {
        // Week view
        effectiveSetViewMode("week");
      } else if (event.key === "m" || event.key === "M") {
        // Month view
        effectiveSetViewMode("month");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    isFocused,
    effectiveViewMode,
    selectedDate,
    timeZone,
    onSelectedDateChange,
    effectiveSetViewMode,
  ]);

  return (
    <section
      ref={boardRef}
      tabIndex={0}
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => {
        // Only blur if focus is moving outside the TaskBoard
        if (!boardRef.current?.contains(e.relatedTarget as Node)) {
          setIsFocused(false);
        }
      }}
      className="space-y-6 outline-none md:hover:ring-2 md:hover:ring-indigo-500/30 md:hover:ring-offset-2 md:hover:ring-offset-zinc-950 md:focus:ring-2 md:focus:ring-indigo-500/50 md:focus:ring-offset-2 md:focus:ring-offset-zinc-950 rounded-3xl transition-all cursor-pointer"
    >
      <TaskSectionCard
        title="Task list"
        eyebrow="Overview"
        action={
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onCreateTask}
            className="rounded-full"
          >
            Create Task
          </Button>
        }
      >
        <TaskDayControls
          selectedDate={selectedDate}
          selectedDateLabel={selectedDateLabel}
          selectedDateInputValue={selectedDateInputValue}
          onDateChange={onSelectedDateChange}
          viewMode={effectiveViewMode}
          onViewModeChange={effectiveSetViewMode}
          timeZone={timeZone}
        />
        <div className="mt-5" suppressHydrationWarning>
          {!hasHydrated ? (
            <TaskBoardLoadingState />
          ) : scheduledTasks.length > 0 ? (
            <TaskList
              tasks={scheduledTasks}
              onComplete={onCompleteTask}
              completingTaskId={completingTaskId}
              onTaskClick={onTaskClick}
              locale={locale}
              timeZone={timeZone}
            />
          ) : (
            <TaskBoardEmptyState
              selectedDateLabel={selectedDateLabel}
              searchQuery={searchQuery}
            />
          )}
        </div>
      </TaskSectionCard>

      {hasHydrated && overdueTasks.length > 0 ? (
        <TaskSectionCard
          title="Overdue tasks"
          eyebrow={<span className="text-rose-400/70">Needs attention</span>}
          collapsible
          itemCount={overdueTasks.length}
          storageKey="overdue"
        >
          <TaskList
            tasks={overdueTasks}
            onComplete={onCompleteTask}
            completingTaskId={completingTaskId}
            onTaskClick={onTaskClick}
            locale={locale}
            timeZone={timeZone}
          />
        </TaskSectionCard>
      ) : null}

      {hasHydrated && optionalTasks.length > 0 ? (
        <TaskSectionCard
          title="Optional tasks"
          eyebrow="Backlog"
          collapsible
          itemCount={optionalTasks.length}
          storageKey="optional"
        >
          <TaskList
            tasks={optionalTasks}
            onComplete={onCompleteTask}
            completingTaskId={completingTaskId}
            onTaskClick={onTaskClick}
            locale={locale}
            timeZone={timeZone}
          />
        </TaskSectionCard>
      ) : null}

      {hasHydrated && upcomingTasks.length > 0 ? (
        <TaskSectionCard
          title="Upcoming tasks"
          eyebrow="Future"
          collapsible
          itemCount={upcomingTasks.length}
          storageKey="upcoming"
        >
          <TaskList
            tasks={upcomingTasks}
            onComplete={onCompleteTask}
            completingTaskId={completingTaskId}
            onTaskClick={onTaskClick}
            locale={locale}
            timeZone={timeZone}
          />
        </TaskSectionCard>
      ) : null}
    </section>
  );
}
