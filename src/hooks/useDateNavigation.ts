"use client";

import { addDays, DateTimeDefaults, startOfDay } from "@pointwise/lib/datetime";
import { useCallback, useEffect, useRef, useState } from "react";

export type UseDateNavigationOptions = {
	initialDate: Date;
	locale?: string | null;
	timeZone?: string | null;
	onDateChange?: (date: Date) => void;
};

export type UseDateNavigationReturn = {
	selectedDate: Date;
	goToPrev: () => void;
	goToNext: () => void;
	goToToday: () => void;
	goToDate: (date: Date) => void;
	setSelectedDate: (date: Date) => void;
};

/**
 * Hook for managing date navigation in task board and similar components.
 * Handles date state, navigation functions, and timezone changes.
 *
 * @example
 * ```tsx
 * const { selectedDate, goToPrev, goToNext, goToToday } = useDateNavigation({
 *   initialDate: new Date(),
 *   locale: 'en-US',
 *   timeZone: 'America/New_York',
 * });
 * ```
 */
export function useDateNavigation({
	initialDate,
	timeZone,
	onDateChange,
}: UseDateNavigationOptions): UseDateNavigationReturn {
	const effectiveTimeZone = timeZone ?? DateTimeDefaults.timeZone;

	const [selectedDate, setSelectedDateState] = useState(initialDate);
	const appliedTimeZoneRef = useRef<string | null>(null);
	const selectedDateRef = useRef<Date | null>(initialDate);

	// Reset to today when timezone changes
	useEffect(() => {
		if (appliedTimeZoneRef.current !== effectiveTimeZone || !selectedDateRef.current) {
			appliedTimeZoneRef.current = effectiveTimeZone;
			const today = startOfDay(new Date(), effectiveTimeZone);
			// Defer state update to avoid cascading renders
			requestAnimationFrame(() => {
				setSelectedDateState(today);
				selectedDateRef.current = today;
				onDateChange?.(today);
			});
		}
	}, [effectiveTimeZone, onDateChange]);

	// Keep ref in sync
	useEffect(() => {
		selectedDateRef.current = selectedDate;
	}, [selectedDate]);

	const setSelectedDate = useCallback(
		(date: Date) => {
			setSelectedDateState(date);
			onDateChange?.(date);
		},
		[onDateChange],
	);

	const goToPrev = useCallback(() => {
		const prevDate = addDays(selectedDate, -1, effectiveTimeZone);
		setSelectedDate(prevDate);
	}, [selectedDate, effectiveTimeZone, setSelectedDate]);

	const goToNext = useCallback(() => {
		const nextDate = addDays(selectedDate, 1, effectiveTimeZone);
		setSelectedDate(nextDate);
	}, [selectedDate, effectiveTimeZone, setSelectedDate]);

	const goToToday = useCallback(() => {
		const today = startOfDay(new Date(), effectiveTimeZone);
		setSelectedDate(today);
	}, [effectiveTimeZone, setSelectedDate]);

	const goToDate = useCallback(
		(date: Date) => {
			const normalizedDate = startOfDay(date, effectiveTimeZone);
			setSelectedDate(normalizedDate);
		},
		[effectiveTimeZone, setSelectedDate],
	);

	return {
		selectedDate,
		goToPrev,
		goToNext,
		goToToday,
		goToDate,
		setSelectedDate,
	};
}
