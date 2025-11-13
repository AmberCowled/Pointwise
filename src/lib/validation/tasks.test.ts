import { describe, it, expect } from 'vitest';
import { parseCreateTaskBody, parseUpdateTaskBody } from './tasks';

const basePayload = {
  title: 'Weekly Review',
  category: 'Work',
  xpValue: 50,
  context: 'Review the past week and plan ahead.',
  startAt: '2025-01-01T09:00:00.000Z',
  dueAt: '2025-01-01T10:00:00.000Z',
  recurrence: 'none',
  recurrenceDays: [],
  recurrenceMonthDays: [],
  timesOfDay: [],
};

describe('parseCreateTaskBody', () => {
  it('normalizes a valid payload', () => {
    const result = parseCreateTaskBody(basePayload);
    expect(result.success).toBe(true);
    if (!result.success) throw new Error('Should be success');
    expect(result.data.title).toBe('Weekly Review');
    expect(result.data.category).toBe('Work');
    expect(result.data.xpValue).toBe(50);
    expect(result.data.startAt?.toISOString()).toBe('2025-01-01T09:00:00.000Z');
    expect(result.data.dueAt?.toISOString()).toBe('2025-01-01T10:00:00.000Z');
  });

  it('rejects missing title', () => {
    const result = parseCreateTaskBody({ ...basePayload, title: '   ' });
    expect(result.success).toBe(false);
    if (result.success) throw new Error('Should be failure');
    expect(result.error).toContain('Title is required');
  });

  it('rejects excessively long title', () => {
    const result = parseCreateTaskBody({
      ...basePayload,
      title: 'x'.repeat(250),
    });
    expect(result.success).toBe(false);
    if (result.success) throw new Error('Should be failure');
    expect(result.error).toContain('Title must be 200 characters or fewer');
  });

  it('rejects invalid recurrence', () => {
    const result = parseCreateTaskBody({
      ...basePayload,
      recurrence: 'yearly',
    });
    expect(result.success).toBe(false);
    if (result.success) throw new Error('Should be failure');
    expect(result.error).toContain('Invalid recurrence');
  });

  it('rejects start after due date', () => {
    const result = parseCreateTaskBody({
      ...basePayload,
      startAt: '2025-01-02T09:00:00.000Z',
    });
    expect(result.success).toBe(false);
    if (result.success) throw new Error('Should be failure');
    expect(result.error).toContain('Start date cannot be after due date');
  });

  it('requires weekly recurrence to specify at least one weekday', () => {
    const result = parseCreateTaskBody({
      ...basePayload,
      recurrence: 'weekly',
      recurrenceDays: [],
    });
    expect(result.success).toBe(false);
    if (result.success) throw new Error('Should be failure');
    expect(result.error).toContain('Select at least one weekday');
  });
});

describe('parseUpdateTaskBody', () => {
  it('accepts partial update', () => {
    const result = parseUpdateTaskBody({ title: 'Focus Sprint', xpValue: 10 });
    expect(result.success).toBe(true);
    if (!result.success) throw new Error('Should be success');
    expect(result.data).toEqual({ title: 'Focus Sprint', xpValue: 10 });
  });

  it('rejects invalid xpValue', () => {
    const result = parseUpdateTaskBody({ xpValue: 'high' });
    expect(result.success).toBe(false);
    if (result.success) throw new Error('Should be failure');
    expect(result.error).toContain('Invalid xpValue');
  });

  it('rejects empty title', () => {
    const result = parseUpdateTaskBody({ title: '   ' });
    expect(result.success).toBe(false);
    if (result.success) throw new Error('Should be failure');
    expect(result.error).toContain('Title cannot be empty');
  });

  it('rejects start date after due date', () => {
    const result = parseUpdateTaskBody({
      startAt: '2025-01-03T09:00:00.000Z',
      dueAt: '2025-01-02T09:00:00.000Z',
    });
    expect(result.success).toBe(false);
    if (result.success) throw new Error('Should be failure');
    expect(result.error).toContain('Start date cannot be after due date');
  });

  it('rejects payload with no updatable fields', () => {
    const result = parseUpdateTaskBody({ foo: 'bar' });
    expect(result.success).toBe(false);
    if (result.success) throw new Error('Should be failure');
    expect(result.error).toContain('No valid fields to update');
  });
});
