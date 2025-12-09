/**
 * Shared API types for client-server communication
 */

// ============================================================================
// Project Types
// ============================================================================

export type ProjectVisibility = 'PRIVATE' | 'PUBLIC';

export type ProjectRole = 'admin' | 'user' | 'viewer' | 'none';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  visibility: ProjectVisibility;
  adminUserIds: string[];
  projectUserIds: string[];
  viewerUserIds: string[];
  joinRequestUserIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectWithRole extends Project {
  role: ProjectRole;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  visibility?: ProjectVisibility;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  visibility?: ProjectVisibility;
}

export interface CreateProjectResponse {
  project: Project;
}

export interface GetProjectResponse {
  project: Project;
}

export interface GetProjectsResponse {
  projects: Project[];
}

export interface DeleteProjectResponse {
  success: boolean;
}

// ============================================================================
// Task Types
// ============================================================================

// Recurrence pattern type
export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly';
  interval?: number;
  daysOfWeek?: number[];
  daysOfMonth?: number[];
  timesOfDay?: string[];
  startDate: string; // ISO 8601 date string
  endDate?: string; // ISO 8601 date string
  maxOccurrences?: number;
}

// Task types
export interface Task {
  id: string;
  projectId: string; // Tasks belong to projects
  title: string;
  category: string | null;
  xp: number;
  context: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  completed?: boolean;
  startDate: string | null;
  startTime: string | null;
  dueDate: string | null;
  dueTime: string | null;
  completedAt: string | null;
  
  // Assignment
  assignedUserIds: string[];
  acceptedUserIds: string[];
  
  // Recurring pattern (if this is a recurring task template)
  recurrencePattern?: RecurrencePattern;
  
  // Recurring instance tracking
  isRecurringInstance: boolean;
  sourceRecurringTaskId: string | null;
  recurrenceInstanceKey: string | null;
  isEditedInstance: boolean;
  editedInstanceKeys: string[];
  
  // Creator tracking
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Task creation request
export interface CreateTaskRequest {
  projectId: string; // Required: task belongs to a project
  title: string;
  category: string;
  xpValue: number;
  context?: string;
  startDate?: string | null;
  startTime?: string | null;
  dueDate?: string | null;
  dueTime?: string | null;
  
  // Recurring pattern (optional - if provided, creates recurring task template)
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  recurrenceDays?: number[];
  recurrenceMonthDays?: number[];
  timesOfDay?: string[];
  
  // Assignment
  assignedUserIds?: string[];
}

// Task creation response
export interface CreateTaskResponse {
  tasks: Task[];
}

// Task update request
export interface UpdateTaskRequest {
  title?: string;
  category?: string;
  xpValue?: number;
  context?: string;
  startDate?: string | null;
  startTime?: string | null;
  dueDate?: string | null;
  dueTime?: string | null;
  
  // Recurring pattern fields
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  recurrenceDays?: number[];
  recurrenceMonthDays?: number[];
  timesOfDay?: string[];
  
  // Assignment
  assignedUserIds?: string[];
  acceptedUserIds?: string[];
}

// Task update response
// When scope=single, returns a single task
// When scope=series, returns an array of tasks
export interface UpdateTaskResponse {
  task?: Task;
  tasks?: Task[];
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

// Get recurring task response (for backward compatibility during transition)
export interface GetRecurringTaskResponse {
  isRecurring: boolean;
  recurringTask: {
    id: string;
    title: string;
    description: string | null;
    category: string;
    xpValue: number;
    startAt: string | null;
    recurrence: 'daily' | 'weekly' | 'monthly';
    recurrenceDays: number[];
    recurrenceMonthDays: number[];
    timesOfDay: string[];
  } | null;
}

// API error response (standard format from server)
export interface ApiErrorResponse {
  error: string;
}
