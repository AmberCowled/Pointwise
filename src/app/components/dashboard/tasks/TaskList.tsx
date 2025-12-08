'use client';

import { useState, useMemo, useEffect, useRef } from 'react';

import { Pagination } from '@pointwise/app/components/ui/Pagination';
import TaskItem from './TaskItem';

export type TaskStatus = 'in-progress' | 'focus' | 'scheduled' | 'completed';

export type DashboardTask = {
  id: string;
  title: string;
  context?: string | null;
  category?: string | null;
  xp: number;
  status: TaskStatus;
  completed?: boolean;
  startDate?: string | Date | null;
  startTime?: string | null;
  dueDate?: string | Date | null;
  dueTime?: string | null;
  completedAt?: string | Date | null;
  
  // Assignment (for Phase 3)
  assignedUserIds?: string[];
  acceptedUserIds?: string[];
  
  // Recurring pattern (if this is a recurring task template)
  recurrencePattern?: {
    type: 'daily' | 'weekly' | 'monthly';
    interval?: number;
    daysOfWeek?: number[];
    daysOfMonth?: number[];
    timesOfDay?: string[];
    startDate: string;
    endDate?: string;
    maxOccurrences?: number;
  };
  
  // Recurring instance tracking
  isRecurringInstance?: boolean;
  sourceRecurringTaskId?: string | null;
  recurrenceInstanceKey?: string | null;
  isEditedInstance?: boolean;
  editedInstanceKeys?: string[];
};

type TaskListProps = {
  tasks: DashboardTask[];
  className?: string;
  onComplete?: (task: DashboardTask) => void;
  completingTaskId?: string | null;
  onTaskClick?: (task: DashboardTask) => void;
  locale?: string;
  timeZone?: string;
  pageSize?: number;
  showPagination?: boolean;
  onPageChange?: (page: number) => void;
};

export default function TaskList({
  tasks,
  className,
  onComplete,
  completingTaskId,
  onTaskClick,
  locale,
  timeZone,
  pageSize: initialPageSize = 20,
  showPagination = true,
  onPageChange: externalOnPageChange,
}: TaskListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Calculate pagination
  const totalItems = tasks.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Slice tasks for current page
  const paginatedTasks = useMemo(() => {
    if (!showPagination || totalItems === 0) {
      return tasks;
    }
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return tasks.slice(startIndex, endIndex);
  }, [tasks, currentPage, pageSize, showPagination, totalItems]);

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    externalOnPageChange?.(page);
  };

  // Track previous tasks length to detect when tasks change
  const previousTasksLengthRef = useRef(tasks.length);

  // Reset to page 1 when tasks change significantly or current page is out of bounds
  useEffect(() => {
    const tasksChanged = previousTasksLengthRef.current !== tasks.length;
    previousTasksLengthRef.current = tasks.length;

    if (tasksChanged || (totalPages > 0 && currentPage > totalPages)) {
      // Schedule state update to avoid synchronous setState in effect
      queueMicrotask(() => {
        setCurrentPage(1);
      });
    }
  }, [tasks.length, totalPages, currentPage]);

  const listClassName = ['mt-5 space-y-4', className].filter(Boolean).join(' ');

  return (
    <div>
      <ul className={listClassName}>
        {paginatedTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onComplete={onComplete}
            isProcessing={completingTaskId === task.id}
            onOpen={onTaskClick}
            showActions={true}
            locale={locale}
            timeZone={timeZone}
          />
        ))}
      </ul>

      {showPagination && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onPageSizeChange={setPageSize}
            showItemCount={false}
            showPageSizeSelector={true}
            size="sm"
            variant="primary"
            hideWhenEmpty={true}
            enableTransitions={true}
          />
        </div>
      )}
    </div>
  );
}
