export type TaskFormValues = {
  id?: string;
  title: string;
  category: string;
  xpValue: number;
  context: string;
  startDate?: string | null;
  startTime?: string | null;
  dueDate?: string | null;
  dueTime?: string | null;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  recurrenceDays?: number[];
  recurrenceMonthDays?: number[];
  timesOfDay?: string[];
};

export type RecurringTaskData = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  xpValue: number;
  startDate: string | null; // Updated to match unified model
  recurrence: 'daily' | 'weekly' | 'monthly';
  recurrenceDays: number[];
  recurrenceMonthDays: number[];
  timesOfDay: string[];
};

