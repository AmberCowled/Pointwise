"use client";

import { DateTimeDefaults, formatDateLabel, startOfDay } from "@pointwise/lib/datetime";
import { useCallback, useEffect, useRef, useState } from "react";

export interface UseDateSettingsOptions {
	initialSelectedDate?: Date;
	initialToday?: string;
	locale?: string;
	timeZone?: string;
	onDateChange?: (date: Date) => void;
}

export interface UseDateSettingsReturn {
	selectedDate: Date;
	displayToday: string;
	setSelectedDate: (date: Date) => void;
	selectedDateRef: React.MutableRefObject<Date | null>;
}

/**
 * Hook for managing date settings and display
 *
 * Handles:
 * - Selected date state
 * - Today's date label formatting
 * - Timezone change detection and date reset
 * - Date reference for stable comparisons
 */
export function useDateSettings(options: UseDateSettingsOptions = {}): UseDateSettingsReturn {
	const {
		initialSelectedDate,
		initialToday,
		locale = DateTimeDefaults.locale,
		timeZone = DateTimeDefaults.timeZone,
		onDateChange,
	} = options;

	const [selectedDate, setSelectedDateState] = useState(
		initialSelectedDate ?? startOfDay(new Date(), timeZone),
	);
	const [displayToday, setDisplayToday] = useState(
		initialToday ?? formatDateLabel(startOfDay(new Date(), timeZone), locale, timeZone),
	);
	const appliedTimeZoneRef = useRef<string | null>(timeZone);
	const selectedDateRef = useRef<Date | null>(
		initialSelectedDate ?? startOfDay(new Date(), timeZone),
	);

	// Update displayToday and reset selectedDate when timezone changes
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => {
		const currentStart = startOfDay(new Date(), timeZone);
		setDisplayToday(formatDateLabel(currentStart, locale, timeZone));

		if (appliedTimeZoneRef.current !== timeZone || !selectedDateRef.current) {
			appliedTimeZoneRef.current = timeZone;
			setSelectedDateState(currentStart);
			selectedDateRef.current = currentStart;
			onDateChange?.(currentStart);
		}
	}, [locale, timeZone, onDateChange]);

	// Keep ref in sync
	useEffect(() => {
		selectedDateRef.current = selectedDate;
	}, [selectedDate]);

	// Update displayToday periodically (when date changes)
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => {
		const currentStart = startOfDay(new Date(), timeZone);
		setDisplayToday(formatDateLabel(currentStart, locale, timeZone));
	}, [locale, timeZone]);

	const setSelectedDate = useCallback(
		(date: Date) => {
			setSelectedDateState(date);
			onDateChange?.(date);
		},
		[onDateChange],
	);

	return {
		selectedDate,
		displayToday,
		setSelectedDate,
		selectedDateRef,
	};
}
