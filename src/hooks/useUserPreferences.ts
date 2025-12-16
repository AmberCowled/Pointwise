"use client";

import type { UpdatePreferencesRequest } from "@pointwise/lib/api/types";
import { DateTimeDefaults } from "@pointwise/lib/datetime";
import { useCallback, useEffect, useRef, useState } from "react";

export interface UseUserPreferencesOptions {
	initialLocale?: string | null;
	initialTimeZone?: string | null;
	updatePreferences?: (
		data: UpdatePreferencesRequest,
	) => Promise<{ locale: string; timeZone: string }>;
	detectBrowserPreferences?: boolean;
}

export interface UseUserPreferencesReturn {
	locale: string;
	timeZone: string;
	setLocale: (locale: string) => void;
	setTimeZone: (timeZone: string) => void;
	syncPreferences: (locale: string, timeZone: string) => Promise<void>;
}

/**
 * Hook for managing user preferences (locale and timezone)
 *
 * Handles:
 * - Preference state management
 * - Syncing preferences to server
 * - Browser preference detection (optional)
 * - Preference persistence tracking
 */
export function useUserPreferences(
	options: UseUserPreferencesOptions = {},
): UseUserPreferencesReturn {
	const {
		initialLocale,
		initialTimeZone,
		updatePreferences,
		detectBrowserPreferences = true,
	} = options;

	const persistedSettingsRef = useRef({
		locale: initialLocale ?? DateTimeDefaults.locale,
		timeZone: initialTimeZone ?? DateTimeDefaults.timeZone,
	});
	const syncingRef = useRef(false);

	const [locale, setLocaleState] = useState(initialLocale ?? DateTimeDefaults.locale);
	const [timeZone, setTimeZoneState] = useState(initialTimeZone ?? DateTimeDefaults.timeZone);

	// Sync preferences to server
	const syncPreferences = useCallback(
		async (nextLocale: string, nextTimeZone: string) => {
			if (
				persistedSettingsRef.current.locale === nextLocale &&
				persistedSettingsRef.current.timeZone === nextTimeZone
			) {
				return;
			}

			if (!updatePreferences) {
				// If no update function provided, just update local state
				persistedSettingsRef.current = {
					locale: nextLocale,
					timeZone: nextTimeZone,
				};
				setLocaleState(nextLocale);
				setTimeZoneState(nextTimeZone);
				return;
			}

			try {
				syncingRef.current = true;
				await updatePreferences({
					locale: nextLocale,
					timeZone: nextTimeZone,
				});
				persistedSettingsRef.current = {
					locale: nextLocale,
					timeZone: nextTimeZone,
				};
				setLocaleState(nextLocale);
				setTimeZoneState(nextTimeZone);
			} catch (error) {
				// API client handles error notifications automatically
				// Only log in dev for debugging
				if (process.env.NODE_ENV === "development") {
					console.error("Failed to update user preferences", error);
				}
			} finally {
				syncingRef.current = false;
			}
		},
		[updatePreferences],
	);

	// Update state when initial props change
	useEffect(() => {
		const nextLocale = initialLocale ?? DateTimeDefaults.locale;
		const nextTimeZone = initialTimeZone ?? DateTimeDefaults.timeZone;

		persistedSettingsRef.current = {
			locale: nextLocale,
			timeZone: nextTimeZone,
		};

		setLocaleState((prev) => {
			if (prev === nextLocale) return prev;
			return nextLocale;
		});

		setTimeZoneState((prev) => {
			if (prev === nextTimeZone) return prev;
			return nextTimeZone;
		});
	}, [initialLocale, initialTimeZone]);

	// Detect browser preferences (optional)
	useEffect(() => {
		if (!detectBrowserPreferences || typeof window === "undefined") return;

		const detectPreferences = () => {
			const browserLocale = navigator.language || persistedSettingsRef.current.locale;
			const browserTimeZone =
				Intl.DateTimeFormat().resolvedOptions().timeZone || persistedSettingsRef.current.timeZone;

			setLocaleState((prev) => {
				if (prev === browserLocale) return prev;
				return browserLocale;
			});

			setTimeZoneState((prev) => {
				if (prev === browserTimeZone) return prev;
				return browserTimeZone;
			});
		};

		detectPreferences();

		const handleVisibility = () => {
			if (document.visibilityState === "visible") {
				detectPreferences();
			}
		};

		window.addEventListener("focus", detectPreferences);
		document.addEventListener("visibilitychange", handleVisibility);

		return () => {
			window.removeEventListener("focus", detectPreferences);
			document.removeEventListener("visibilitychange", handleVisibility);
		};
	}, [detectBrowserPreferences]);

	// Sync preferences when they change (but not on initial mount)
	useEffect(() => {
		// Only sync if preferences have actually changed from persisted values
		// and we're not currently syncing
		if (
			syncingRef.current ||
			(locale === persistedSettingsRef.current.locale &&
				timeZone === persistedSettingsRef.current.timeZone)
		) {
			return;
		}

		// Only sync if preferences differ from persisted values
		if (
			locale !== persistedSettingsRef.current.locale ||
			timeZone !== persistedSettingsRef.current.timeZone
		) {
			syncPreferences(locale, timeZone);
		}
	}, [locale, timeZone, syncPreferences]);

	const setLocale = useCallback((newLocale: string) => {
		setLocaleState(newLocale);
	}, []);

	const setTimeZone = useCallback((newTimeZone: string) => {
		setTimeZoneState(newTimeZone);
	}, []);

	return {
		locale,
		timeZone,
		setLocale,
		setTimeZone,
		syncPreferences,
	};
}
