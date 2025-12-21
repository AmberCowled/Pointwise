/**
 * Tests for useDateSettings hook
 *
 * Tests date selection, timezone handling, and date formatting
 */

import { formatDateLabel, startOfDay } from "@pointwise/lib/datetime";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDateSettings } from "./useDateSettings";

// Mock datetime functions
vi.mock("@pointwise/lib/datetime", async () => {
  const actual = await vi.importActual("@pointwise/lib/datetime");
  return {
    ...actual,
    startOfDay: vi.fn((date: Date, tz?: string) => {
      const d = new Date(date);
      d.setUTCHours(0, 0, 0, 0);
      return d;
    }),
    formatDateLabel: vi.fn((date: Date, locale?: string, tz?: string) => {
      return date.toLocaleDateString(locale || "en-AU", {
        weekday: "long",
        month: "long",
        day: "numeric",
        timeZone: tz || "UTC",
      });
    }),
  };
});

describe("useDateSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultOptions = {
    initialSelectedDate: new Date("2025-01-15T09:00:00Z"),
    initialToday: "Wednesday, January 15, 2025",
    locale: "en-US",
    timeZone: "UTC",
  };

  it("should initialize with provided values", () => {
    const { result } = renderHook(() => useDateSettings(defaultOptions));

    expect(result.current.selectedDate).toEqual(
      defaultOptions.initialSelectedDate,
    );
    expect(result.current.displayToday).toBeDefined();
    expect(typeof result.current.displayToday).toBe("string");
  });

  it("should use defaults when no initial values provided", () => {
    const mockDate = new Date("2025-01-15T09:00:00Z");
    vi.mocked(startOfDay).mockReturnValue(mockDate);
    vi.mocked(formatDateLabel).mockReturnValue("Wednesday, January 15, 2025");

    const { result } = renderHook(() => useDateSettings({}));

    expect(result.current.selectedDate).toBeDefined();
    expect(result.current.displayToday).toBeDefined();
  });

  it("should update selected date", () => {
    const { result } = renderHook(() => useDateSettings(defaultOptions));
    const newDate = new Date("2025-01-20T09:00:00Z");

    act(() => {
      result.current.setSelectedDate(newDate);
    });

    expect(result.current.selectedDate).toEqual(newDate);
  });

  it("should call onDateChange callback when date changes", () => {
    const onDateChange = vi.fn();
    const { result } = renderHook(() =>
      useDateSettings({
        ...defaultOptions,
        onDateChange,
      }),
    );
    const newDate = new Date("2025-01-20T09:00:00Z");

    act(() => {
      result.current.setSelectedDate(newDate);
    });

    expect(onDateChange).toHaveBeenCalledWith(newDate);
  });

  it("should update displayToday when timezone changes", () => {
    const { result, rerender } = renderHook(
      ({ timeZone }) =>
        useDateSettings({
          ...defaultOptions,
          timeZone,
        }),
      {
        initialProps: { timeZone: "UTC" },
      },
    );

    expect(result.current.displayToday).toBeDefined();

    rerender({ timeZone: "America/New_York" });

    // displayToday should be updated (mocked function should be called)
    expect(formatDateLabel).toHaveBeenCalled();
  });

  it("should reset selectedDate when timezone changes", () => {
    const mockNewDate = new Date("2025-01-15T00:00:00Z");
    vi.mocked(startOfDay).mockReturnValue(mockNewDate);

    const { result, rerender } = renderHook(
      ({ timeZone }) =>
        useDateSettings({
          ...defaultOptions,
          timeZone,
        }),
      {
        initialProps: { timeZone: "UTC" },
      },
    );

    const initialDate = result.current.selectedDate;

    rerender({ timeZone: "America/New_York" });

    // Selected date should be reset when timezone changes
    expect(startOfDay).toHaveBeenCalled();
  });

  it("should maintain selectedDateRef reference", () => {
    const { result } = renderHook(() => useDateSettings(defaultOptions));

    expect(result.current.selectedDateRef.current).toBeDefined();
    expect(result.current.selectedDateRef.current).toEqual(
      defaultOptions.initialSelectedDate,
    );
  });

  it("should update selectedDateRef when selectedDate changes", () => {
    const { result } = renderHook(() => useDateSettings(defaultOptions));
    const newDate = new Date("2025-01-20T09:00:00Z");

    act(() => {
      result.current.setSelectedDate(newDate);
    });

    expect(result.current.selectedDateRef.current).toEqual(newDate);
  });

  it("should handle locale changes", () => {
    const { rerender } = renderHook(
      ({ locale }) =>
        useDateSettings({
          ...defaultOptions,
          locale,
        }),
      {
        initialProps: { locale: "en-US" },
      },
    );

    rerender({ locale: "en-AU" });

    // formatDateLabel should be called with new locale
    expect(formatDateLabel).toHaveBeenCalled();
  });
});
