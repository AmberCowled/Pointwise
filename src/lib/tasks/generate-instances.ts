/**
 * Client-Side Task Instance Generation
 * 
 * Generates Task instances from recurring task templates on-demand.
 * This replaces server-side cron job generation.
 */

import type { DashboardTask } from '@pointwise/app/components/dashboard/tasks/TaskList';
import type { RecurrencePattern } from '@pointwise/lib/api/types';
import { generateOccurrences } from '@pointwise/lib/recurrence/generator';
import { toRecurrenceType } from '@pointwise/lib/recurrence/types';

/**
 * Generate a unique instance key for a recurring task occurrence
 * Format: "YYYY-MM-DDTHH:MM:SSZ" (ISO 8601 datetime)
 */
export function generateInstanceKey(date: Date, time: string | null): string {
  if (time) {
    // Combine date and time
    const [hours, minutes] = time.split(':');
    const instanceDate = new Date(date);
    instanceDate.setUTCHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    return instanceDate.toISOString();
  } else {
    // Date-only (no specific time) - use start of day
    const instanceDate = new Date(date);
    instanceDate.setUTCHours(0, 0, 0, 0);
    return instanceDate.toISOString();
  }
}

/**
 * Generate a unique ID for an instance based on template ID and instance key
 */
export function generateInstanceId(templateId: string, instanceKey: string): string {
  // Use a deterministic approach: hash of templateId + instanceKey
  // For now, use a simple concatenation with separator
  // In production, you might want to use a proper hash
  return `${templateId}::${instanceKey}`;
}

/**
 * Generate Task instances from a recurring task template
 * 
 * @param template - The recurring task template (isRecurringInstance = false, has recurrencePattern)
 * @param dateRange - The date range to generate instances for
 * @param userTimeZone - User's timezone for date calculations
 * @param existingInstances - Existing task instances (to merge with generated ones)
 * @returns Array of Task instances (both generated and existing)
 */
export function generateRecurringInstances(
  template: DashboardTask,
  dateRange: { start: Date; end: Date },
  userTimeZone: string,
  existingInstances: DashboardTask[] = [],
): DashboardTask[] {
  // Validate template
  if (!template.recurrencePattern) {
    return [];
  }

  if (template.isRecurringInstance) {
    // This is already an instance, not a template
    return [];
  }

  const pattern = template.recurrencePattern;
  const editedKeys = new Set(template.editedInstanceKeys || []);

  // Convert pattern to format expected by generateOccurrences
  const recurrenceType = toRecurrenceType(pattern.type);
  if (!recurrenceType) {
    return [];
  }

  // Generate dates based on pattern
  const startDate = new Date(pattern.startDate);
  const occurrences = generateOccurrences({
    recurrence: pattern.type,
    startDate,
    recurrenceDays: pattern.daysOfWeek || [],
    recurrenceMonthDays: pattern.daysOfMonth || [],
    timesOfDay: pattern.timesOfDay || [],
    timeZone: userTimeZone,
    maxOccurrences: pattern.maxOccurrences || 30,
  });

  // Filter occurrences to date range
  const filteredOccurrences = occurrences.filter((occ) => {
    return occ >= dateRange.start && occ <= dateRange.end;
  });

  // Create a map of existing instances by their instance key
  const existingInstancesMap = new Map<string, DashboardTask>();
  existingInstances.forEach((instance) => {
    if (instance.recurrenceInstanceKey) {
      existingInstancesMap.set(instance.recurrenceInstanceKey, instance);
    }
  });

  // Generate instances
  const generatedInstances: DashboardTask[] = [];

  for (const occurrenceDate of filteredOccurrences) {
    // Get times for this date
    const times = pattern.timesOfDay && pattern.timesOfDay.length > 0
      ? pattern.timesOfDay
      : [null]; // null = date-only, no specific time

    for (const time of times) {
      const instanceKey = generateInstanceKey(occurrenceDate, time);

      // Skip if this instance was edited (exists in editedInstanceKeys)
      if (editedKeys.has(instanceKey)) {
        continue;
      }

      // Check if instance already exists (from database)
      if (existingInstancesMap.has(instanceKey)) {
        // Use existing instance (may have been edited)
        generatedInstances.push(existingInstancesMap.get(instanceKey)!);
        continue;
      }

      // Create new instance
      const instanceDate = new Date(occurrenceDate);
      if (time) {
        const [hours, minutes] = time.split(':');
        instanceDate.setUTCHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      } else {
        instanceDate.setUTCHours(0, 0, 0, 0);
      }

      // Calculate due date if template has one
      let dueDate: string | null = null;
      let dueTime: string | null = null;
      if (template.dueDate) {
        const templateStartDate = typeof template.startDate === 'string' 
          ? new Date(template.startDate) 
          : template.startDate 
          ? new Date(template.startDate)
          : null;
        const templateDueDate = typeof template.dueDate === 'string' 
          ? new Date(template.dueDate) 
          : new Date(template.dueDate);
        
        if (templateStartDate) {
          const daysDiff = Math.floor(
            (templateDueDate.getTime() - templateStartDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          const calculatedDueDate = new Date(instanceDate);
          calculatedDueDate.setDate(calculatedDueDate.getDate() + daysDiff);
          dueDate = calculatedDueDate.toISOString().split('T')[0]; // YYYY-MM-DD
        } else {
          // No start date on template, use due date as-is
          dueDate = templateDueDate.toISOString().split('T')[0];
        }
        dueTime = template.dueTime || null;
      }

      const instance: DashboardTask = {
        id: generateInstanceId(template.id, instanceKey),
        title: template.title,
        context: template.context,
        category: template.category,
        xp: template.xp,
        status: template.status || 'pending',
        completed: false,
        startDate: instanceDate.toISOString().split('T')[0], // YYYY-MM-DD
        startTime: time || null,
        dueDate: dueDate, // dueDate is already a string in YYYY-MM-DD format
        dueTime: dueTime,
        completedAt: null,
        
        // Assignment (preserve from template)
        assignedUserIds: template.assignedUserIds,
        acceptedUserIds: template.acceptedUserIds,
        
        // Recurring instance tracking
        isRecurringInstance: true,
        sourceRecurringTaskId: template.id,
        recurrenceInstanceKey: instanceKey,
        isEditedInstance: false,
      };

      generatedInstances.push(instance);
    }
  }

  // Merge with existing instances that are outside the date range or don't match
  const allInstances = [...generatedInstances];
  existingInstances.forEach((existing) => {
    // Only add if not already included
    if (!generatedInstances.find((inst) => inst.id === existing.id)) {
      allInstances.push(existing);
    }
  });

  return allInstances;
}

/**
 * Merge template tasks with their generated instances
 * 
 * @param tasks - Array of tasks (templates and instances mixed)
 * @param dateRange - Date range to generate instances for
 * @param userTimeZone - User's timezone
 * @returns Array with templates replaced by their instances
 */
export function mergeTemplatesWithInstances(
  tasks: DashboardTask[],
  dateRange: { start: Date; end: Date },
  userTimeZone: string,
): DashboardTask[] {
  const templates: DashboardTask[] = [];
  const instances: DashboardTask[] = [];
  const regularTasks: DashboardTask[] = [];

  // Separate tasks into categories
  tasks.forEach((task) => {
    if (task.recurrencePattern && !task.isRecurringInstance) {
      templates.push(task);
    } else if (task.isRecurringInstance) {
      instances.push(task);
    } else {
      regularTasks.push(task);
    }
  });

  // Generate instances for each template
  const allInstances: DashboardTask[] = [];
  templates.forEach((template) => {
    // Get existing instances for this template
    const templateInstances = instances.filter(
      (inst) => inst.sourceRecurringTaskId === template.id,
    );

    // Generate new instances
    const generated = generateRecurringInstances(
      template,
      dateRange,
      userTimeZone,
      templateInstances,
    );

    allInstances.push(...generated);
  });

  // Combine: regular tasks + generated instances
  return [...regularTasks, ...allInstances];
}

