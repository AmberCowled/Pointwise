import type { DashboardTask } from '@pointwise/app/components/dashboard/tasks/TaskList';

/**
 * Props for the TaskBoard component
 */
export type TaskBoardProps = {
  scheduledTasks: DashboardTask[];
  optionalTasks: DashboardTask[];
  overdueTasks: DashboardTask[];
  upcomingTasks: DashboardTask[];
  selectedDate: Date;
  selectedDateLabel: string;
  selectedDateInputValue: string;
  onSelectedDateChange: (next: Date) => void;
  onCreateTask: () => void;
  onTaskClick: (task: DashboardTask) => void;
  onCompleteTask: (task: DashboardTask) => void;
  completingTaskId: string | null;
  locale: string;
  timeZone: string;
  viewMode?: TaskBoardViewMode;
  onViewModeChange?: (mode: TaskBoardViewMode) => void;
  searchQuery?: string;
};

/**
 * Task board view mode
 */
export type TaskBoardViewMode = 'day' | 'week' | 'month';

/**
 * Task board filter options
 */
export type TaskBoardFilterOptions = {
  category?: string;
  searchQuery?: string;
  showCompleted?: boolean;
};

/**
 * Task board sort options
 */
export type TaskBoardSortOption =
  | 'date-asc'
  | 'date-desc'
  | 'xp-asc'
  | 'xp-desc'
  | 'title-asc'
  | 'title-desc';
