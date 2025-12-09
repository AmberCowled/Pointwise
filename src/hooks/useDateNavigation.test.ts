/**
 * Tests for useDateNavigation hook
 * 
 * Tests date navigation (prev/next/today/goToDate) and timezone handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDateNavigation } from './useDateNavigation';

// Mock datetime functions
vi.mock('@pointwise/lib/datetime', async () => {
  const actual = await vi.importActual('@pointwise/lib/datetime');
  return {
    ...actual,
    DateTimeDefaults: {
      locale: 'en-AU',
      timeZone: 'UTC',
    },
    startOfDay: vi.fn((date: Date, tz?: string) => {
      const d = new Date(date);
      d.setUTCHours(0, 0, 0, 0);
      return d;
    }),
    addDays: vi.fn((date: Date, days: number, tz?: string) => {
      const d = new Date(date);
      d.setUTCDate(d.getUTCDate() + days);
      return d;
    }),
  };
});

describe('useDateNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock requestAnimationFrame
    global.requestAnimationFrame = vi.fn((cb) => {
      setTimeout(cb, 0);
      return 1;
    });
  });

  const initialDate = new Date('2025-01-15T12:00:00Z');

  it('should initialize with provided date', () => {
    const { result } = renderHook(() =>
      useDateNavigation({
        initialDate,
        timeZone: 'UTC',
      }),
    );

    expect(result.current.selectedDate).toEqual(initialDate);
  });

  it('should use default timezone when not provided', () => {
    const { result } = renderHook(() =>
      useDateNavigation({
        initialDate,
      }),
    );

    expect(result.current.selectedDate).toBeDefined();
  });

  it('should navigate to previous day', () => {
    const { result } = renderHook(() =>
      useDateNavigation({
        initialDate,
        timeZone: 'UTC',
      }),
    );

    act(() => {
      result.current.goToPrev();
    });

    const prevDate = new Date(initialDate);
    prevDate.setUTCDate(prevDate.getUTCDate() - 1);
    expect(result.current.selectedDate.getUTCDate()).toBe(prevDate.getUTCDate());
  });

  it('should navigate to next day', () => {
    const { result } = renderHook(() =>
      useDateNavigation({
        initialDate,
        timeZone: 'UTC',
      }),
    );

    act(() => {
      result.current.goToNext();
    });

    const nextDate = new Date(initialDate);
    nextDate.setUTCDate(nextDate.getUTCDate() + 1);
    expect(result.current.selectedDate.getUTCDate()).toBe(nextDate.getUTCDate());
  });

  it('should navigate to today', () => {
    const { result } = renderHook(() =>
      useDateNavigation({
        initialDate,
        timeZone: 'UTC',
      }),
    );

    act(() => {
      result.current.goToToday();
    });

    // Should be today (start of day)
    expect(result.current.selectedDate.getUTCHours()).toBe(0);
    expect(result.current.selectedDate.getUTCMinutes()).toBe(0);
  });

  it('should navigate to specific date', () => {
    const { result } = renderHook(() =>
      useDateNavigation({
        initialDate,
        timeZone: 'UTC',
      }),
    );

    const targetDate = new Date('2025-01-20T12:00:00Z');

    act(() => {
      result.current.goToDate(targetDate);
    });

    expect(result.current.selectedDate.getUTCDate()).toBe(20);
  });

  it('should call onDateChange callback when date changes', () => {
    const onDateChange = vi.fn();
    const { result } = renderHook(() =>
      useDateNavigation({
        initialDate,
        timeZone: 'UTC',
        onDateChange,
      }),
    );

    act(() => {
      result.current.goToNext();
    });

    expect(onDateChange).toHaveBeenCalled();
  });

  it('should set selected date directly', () => {
    const { result } = renderHook(() =>
      useDateNavigation({
        initialDate,
        timeZone: 'UTC',
      }),
    );

    const newDate = new Date('2025-01-20T12:00:00Z');

    act(() => {
      result.current.setSelectedDate(newDate);
    });

    expect(result.current.selectedDate).toEqual(newDate);
  });

  it('should reset to today when timezone changes', async () => {
    const { result, rerender } = renderHook(
      ({ timeZone }) =>
        useDateNavigation({
          initialDate,
          timeZone,
        }),
      {
        initialProps: { timeZone: 'UTC' },
      },
    );

    const initialSelectedDate = result.current.selectedDate;

    rerender({ timeZone: 'America/New_York' });

    // Wait for requestAnimationFrame
    await waitFor(() => {
      expect(result.current.selectedDate).not.toEqual(initialSelectedDate);
    });
  });

  it('should handle multiple navigation operations', () => {
    const { result } = renderHook(() =>
      useDateNavigation({
        initialDate,
        timeZone: 'UTC',
      }),
    );

    act(() => {
      result.current.goToNext();
    });
    const afterFirst = result.current.selectedDate.getUTCDate();

    act(() => {
      result.current.goToNext();
    });
    const afterSecond = result.current.selectedDate.getUTCDate();

    act(() => {
      result.current.goToPrev();
    });
    const afterThird = result.current.selectedDate.getUTCDate();

    // Should have moved forward twice, then back once
    expect(afterSecond).toBeGreaterThan(afterFirst);
    expect(afterThird).toBe(afterFirst);
  });

  it('should normalize date to start of day when navigating', () => {
    const { result } = renderHook(() =>
      useDateNavigation({
        initialDate: new Date('2025-01-15T14:30:00Z'),
        timeZone: 'UTC',
      }),
    );

    act(() => {
      result.current.goToDate(new Date('2025-01-20T14:30:00Z'));
    });

    // Date should be normalized to start of day
    expect(result.current.selectedDate.getUTCHours()).toBe(0);
    expect(result.current.selectedDate.getUTCMinutes()).toBe(0);
  });
});

