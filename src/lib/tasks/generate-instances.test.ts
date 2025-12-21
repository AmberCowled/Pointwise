/**
 * Tests for client-side task instance generation
 *
 * Tests the generateRecurringInstances function which creates task instances
 * from recurring task templates on-demand.
 */

import type { DashboardTask } from "@pointwise/app/components/dashboard/tasks/TaskList";
import { describe, expect, it } from "vitest";
import {
  generateInstanceId,
  generateInstanceKey,
  generateRecurringInstances,
} from "./generate-instances";

const createTemplateTask = (
  overrides: Partial<DashboardTask> = {},
): DashboardTask => ({
  id: "template-1",
  title: "Daily Task",
  context: "Test context",
  category: "Work",
  xp: 50,
  status: "scheduled",
  completed: false,
  startDate: "2025-01-01",
  startTime: null,
  dueDate: null,
  dueTime: null,
  completedAt: null,
  isRecurringInstance: false,
  sourceRecurringTaskId: null,
  recurrencePattern: {
    type: "daily",
    interval: 1,
    startDate: "2025-01-01",
    timesOfDay: [],
    maxOccurrences: 30,
  },
  editedInstanceKeys: [],
  ...overrides,
});

const createInstanceTask = (
  templateId: string,
  instanceKey: string,
  date: string,
  overrides: Partial<DashboardTask> = {},
): DashboardTask => ({
  id: `${templateId}::${instanceKey}`,
  title: "Daily Task",
  context: "Test context",
  category: "Work",
  xp: 50,
  status: "scheduled",
  completed: false,
  startDate: date,
  startTime: null,
  dueDate: null,
  dueTime: null,
  completedAt: null,
  isRecurringInstance: true,
  sourceRecurringTaskId: templateId,
  recurrenceInstanceKey: instanceKey,
  ...overrides,
});

describe("generateInstanceKey", () => {
  it("should generate key with time", () => {
    const date = new Date("2025-01-15T09:00:00Z");
    const key = generateInstanceKey(date, "09:00");
    expect(key).toBe("2025-01-15T09:00:00.000Z");
  });

  it("should generate key without time (date-only)", () => {
    const date = new Date("2025-01-15T00:00:00Z");
    const key = generateInstanceKey(date, null);
    expect(key).toBe("2025-01-15T00:00:00.000Z");
  });
});

describe("generateInstanceId", () => {
  it("should generate deterministic ID", () => {
    const templateId = "template-1";
    const instanceKey = "2025-01-15T09:00:00.000Z";
    const id = generateInstanceId(templateId, instanceKey);
    expect(id).toBe("template-1::2025-01-15T09:00:00.000Z");
  });
});

describe("generateRecurringInstances", () => {
  describe("daily recurrence", () => {
    it("should generate daily instances for date range", () => {
      // Use future dates to avoid past date filtering
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const startDateStr = futureDate.toISOString().split("T")[0];

      const template = createTemplateTask({
        recurrencePattern: {
          type: "daily",
          interval: 1,
          startDate: startDateStr,
          timesOfDay: [],
          maxOccurrences: 30,
        },
      });

      const dateRange = {
        start: new Date(futureDate),
        end: new Date(futureDate.getTime() + 4 * 24 * 60 * 60 * 1000), // +4 days (5 total days)
      };

      const instances = generateRecurringInstances(template, dateRange, "UTC");

      expect(instances.length).toBeGreaterThan(0);
      // Should generate instances for the date range (start date + 4 more days = 5 days)
      // But may be 4 or 5 depending on time boundaries, so just check it's reasonable
      expect(instances.length).toBeGreaterThanOrEqual(4);
      expect(instances.length).toBeLessThanOrEqual(5);

      // All should be instances
      instances.forEach((instance) => {
        expect(instance.isRecurringInstance).toBe(true);
        expect(instance.sourceRecurringTaskId).toBe(template.id);
        expect(instance.recurrenceInstanceKey).toBeDefined();
      });
    });

    it("should generate instances with specific times", () => {
      // Use future dates to avoid past date filtering
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const startDateStr = futureDate.toISOString().split("T")[0];

      const template = createTemplateTask({
        recurrencePattern: {
          type: "daily",
          interval: 1,
          startDate: startDateStr,
          timesOfDay: ["09:00", "17:00"],
          maxOccurrences: 30,
        },
      });

      const dateRange = {
        start: new Date(futureDate),
        end: new Date(futureDate.getTime() + 1 * 24 * 60 * 60 * 1000), // +1 day
      };

      const instances = generateRecurringInstances(template, dateRange, "UTC");

      // Should generate 2 instances per day (2 days = 4 instances)
      expect(instances.length).toBe(4);
    });
  });

  describe("weekly recurrence", () => {
    it("should generate weekly instances for specific weekdays", () => {
      // Find next Monday
      const today = new Date();
      const daysUntilMonday = (1 - today.getDay() + 7) % 7 || 7;
      const nextMonday = new Date(today);
      nextMonday.setDate(today.getDate() + daysUntilMonday);
      nextMonday.setHours(0, 0, 0, 0);
      const startDateStr = nextMonday.toISOString().split("T")[0];

      const template = createTemplateTask({
        recurrencePattern: {
          type: "weekly",
          interval: 1,
          startDate: startDateStr,
          daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
          timesOfDay: ["09:00"],
          maxOccurrences: 12,
        },
      });

      const dateRange = {
        start: new Date(nextMonday),
        end: new Date(nextMonday.getTime() + 14 * 24 * 60 * 60 * 1000), // +14 days
      };

      const instances = generateRecurringInstances(template, dateRange, "UTC");

      expect(instances.length).toBeGreaterThan(0);
      // Should only include Mon, Wed, Fri
      instances.forEach((instance) => {
        const date = new Date(instance.startDate as string);
        const dayOfWeek = date.getUTCDay();
        expect([1, 3, 5]).toContain(dayOfWeek);
      });
    });
  });

  describe("edited instances", () => {
    it("should skip edited instances", () => {
      // Use future dates
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const startDateStr = futureDate.toISOString().split("T")[0];
      const editedDate = new Date(
        futureDate.getTime() + 2 * 24 * 60 * 60 * 1000,
      ); // +2 days
      const editedKey = editedDate.toISOString();

      const template = createTemplateTask({
        recurrencePattern: {
          type: "daily",
          interval: 1,
          startDate: startDateStr,
          timesOfDay: [],
          maxOccurrences: 30,
        },
        editedInstanceKeys: [editedKey],
      });

      const dateRange = {
        start: new Date(futureDate),
        end: new Date(futureDate.getTime() + 4 * 24 * 60 * 60 * 1000), // +4 days
      };

      const instances = generateRecurringInstances(template, dateRange, "UTC");

      // Should skip edited instance
      const editedInstance = instances.find(
        (inst) => inst.recurrenceInstanceKey === editedKey,
      );
      expect(editedInstance).toBeUndefined();
    });

    it("should use existing edited instances from database", () => {
      // Use future dates
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const startDateStr = futureDate.toISOString().split("T")[0];
      const editedDate = new Date(
        futureDate.getTime() + 2 * 24 * 60 * 60 * 1000,
      ); // +2 days
      const editedKey = editedDate.toISOString();
      const editedDateStr = editedDate.toISOString().split("T")[0];

      const template = createTemplateTask({
        recurrencePattern: {
          type: "daily",
          interval: 1,
          startDate: startDateStr,
          timesOfDay: [],
          maxOccurrences: 30,
        },
        editedInstanceKeys: [editedKey],
      });

      const existingInstance = createInstanceTask(
        template.id,
        editedKey,
        editedDateStr,
        {
          title: "Edited Task",
          xp: 100, // Different from template
        },
      );

      const dateRange = {
        start: new Date(futureDate),
        end: new Date(futureDate.getTime() + 4 * 24 * 60 * 60 * 1000), // +4 days
      };

      const instances = generateRecurringInstances(template, dateRange, "UTC", [
        existingInstance,
      ]);

      // Should include the edited instance
      const foundInstance = instances.find(
        (inst) => inst.recurrenceInstanceKey === editedKey,
      );
      expect(foundInstance).toBeDefined();
      expect(foundInstance?.title).toBe("Edited Task");
      expect(foundInstance?.xp).toBe(100);
    });
  });

  describe("edge cases", () => {
    it("should return empty array for non-template task", () => {
      const task = createTemplateTask({
        isRecurringInstance: true, // This is an instance, not a template
      });

      const dateRange = {
        start: new Date("2025-01-01T00:00:00Z"),
        end: new Date("2025-01-05T23:59:59Z"),
      };

      const instances = generateRecurringInstances(task, dateRange, "UTC");
      expect(instances).toEqual([]);
    });

    it("should return empty array for task without recurrencePattern", () => {
      const task = createTemplateTask({
        recurrencePattern: undefined,
      });

      const dateRange = {
        start: new Date("2025-01-01T00:00:00Z"),
        end: new Date("2025-01-05T23:59:59Z"),
      };

      const instances = generateRecurringInstances(task, dateRange, "UTC");
      expect(instances).toEqual([]);
    });

    it("should filter instances to date range", () => {
      // Use future dates
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);
      const startDateStr = futureDate.toISOString().split("T")[0];

      const template = createTemplateTask({
        recurrencePattern: {
          type: "daily",
          interval: 1,
          startDate: startDateStr,
          timesOfDay: [],
          maxOccurrences: 30,
        },
      });

      const dateRange = {
        start: new Date(futureDate.getTime() + 2 * 24 * 60 * 60 * 1000), // +2 days from start
        end: new Date(futureDate.getTime() + 4 * 24 * 60 * 60 * 1000), // +4 days from start
      };

      const instances = generateRecurringInstances(template, dateRange, "UTC");

      // Should only include dates in range
      instances.forEach((instance) => {
        const date = new Date(instance.startDate as string);
        expect(date.getTime()).toBeGreaterThanOrEqual(
          dateRange.start.getTime(),
        );
        expect(date.getTime()).toBeLessThanOrEqual(dateRange.end.getTime());
      });
    });
  });
});
