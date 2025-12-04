/**
 * Shared API types for client-server communication
 */

// Task types
export interface Task {
  id: string;
  title: string;
  category: string | null;
  xp: number;
  context: string | null;
  status: 'scheduled' | 'in-progress' | 'focus' | 'completed';
  completed?: boolean;
  startAt: string | null;
  dueAt: string | null;
  completedAt: string | null;
  sourceRecurringTaskId: string | null;
}

// Task creation request
export interface CreateTaskRequest {
  title: string;
  category: string;
  xpValue: number;
  context?: string;
  startAt?: string | null;
  dueAt?: string | null;
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly';
  recurrenceDays?: number[];
  recurrenceMonthDays?: number[];
  timesOfDay?: string[];
}

// Task creation response
export interface CreateTaskResponse {
  tasks: Task[];
}

// Task update request
//
// ⚠️ BUG: Recurrence fields are NOT supported in updates
// The UI (TaskCreateModal) allows editing recurrence settings, but:
// 1. The client code doesn't send recurrence fields when updating (DashboardPageClient.tsx)
// 2. The API endpoint doesn't support recurrence updates even if sent
//
// This means users can change recurrence settings in the UI, but changes are silently ignored.
//
// To fix this, we need to:
// 1. Add recurrence fields to UpdateTaskRequest (recurrence, recurrenceDays, recurrenceMonthDays, timesOfDay)
// 2. Update parseUpdateTaskBody in src/lib/validation/tasks.ts to accept recurrence fields
// 3. Update the API route (src/app/api/tasks/[taskId]/route.ts) to handle recurrence changes
// 4. Handle edge cases (converting one-time to recurring, recurring to one-time, changing recurrence type)
export interface UpdateTaskRequest {
  title?: string;
  category?: string;
  xpValue?: number;
  context?: string;
  startAt?: string | null;
  dueAt?: string | null;
  // TODO: Add recurrence support
  // recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  // recurrenceDays?: number[];
  // recurrenceMonthDays?: number[];
  // timesOfDay?: string[];
}

// Task update response
export interface UpdateTaskResponse {
  task: Task;
}

// Task complete response (includes updated task and XP snapshot)
export interface CompleteTaskResponse {
  task: Task;
  xp: {
    level: number;
    totalXp: number;
    progress: number;
    xpIntoLevel: number;
    xpToNext: number;
  };
}

// Task delete response
export interface DeleteTaskResponse {
  deletedIds: string[];
}

// User preferences request
export interface UpdatePreferencesRequest {
  locale: string;
  timeZone: string;
}

// User preferences response
export interface UpdatePreferencesResponse {
  locale: string;
  timeZone: string;
}

// Signup request
export interface SignupRequest {
  name?: string;
  email: string;
  password: string;
}

// Signup response
export interface SignupResponse {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

// API error response (standard format from server)
export interface ApiErrorResponse {
  error: string;
}
