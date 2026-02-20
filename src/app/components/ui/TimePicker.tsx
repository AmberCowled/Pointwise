"use client";

import {
	Popover,
	PopoverButton,
	PopoverPanel,
	Transition,
} from "@headlessui/react";
import clsx from "clsx";
import type React from "react";
import { Fragment, useEffect, useId, useRef, useState } from "react";
import { IoClose, IoTime } from "react-icons/io5";

import { Button } from "./Button";
import { InputHeader } from "./InputHeader";
import { StyleTheme } from "./StyleTheme";

type TimePickerVariants = "primary" | "secondary" | "danger";
type TimePickerSizes = "xs" | "sm" | "md" | "lg" | "xl";
type TimePickerFlex = "shrink" | "default" | "grow";
type ClockMode = "hour" | "minute";

/**
 * Props for the TimePicker component
 */
export interface TimePickerProps {
	/**
	 * Default time value (uncontrolled)
	 * Format: HH:MM (24-hour, e.g., "14:30")
	 */
	defaultValue?: string | null;

	/**
	 * Callback fired when a time is selected
	 * @param time - The selected time in HH:MM format (24-hour) or null if cleared
	 */
	onChange?: (time: string | null) => void;

	/**
	 * Visual variant style
	 * @default 'primary'
	 */
	variant?: TimePickerVariants;

	/**
	 * Size of the time picker button
	 * @default 'md'
	 */
	size?: TimePickerSizes;

	/**
	 * Flex behavior for the time picker wrapper
	 * - 'shrink': Prevents the time picker from shrinking (flex-shrink-0)
	 * - 'default': Normal flex behavior
	 * - 'grow': Time picker takes up available space (flex-1 min-w-0)
	 * @default 'default'
	 */
	flex?: TimePickerFlex;

	/**
	 * Error state. Can be a boolean to show error styling, or a string to display an error message
	 */
	error?: boolean | string;

	/**
	 * Label text displayed above the time picker
	 */
	label?: React.ReactNode;

	/**
	 * Description text displayed below the time picker
	 */
	description?: React.ReactNode;

	/**
	 * Whether the time picker is disabled
	 * @default false
	 */
	disabled?: boolean;

	/**
	 * Placeholder text displayed when no time is selected
	 * @default 'Select time...'
	 */
	placeholder?: string;

	/**
	 * Additional CSS classes for the time picker button
	 */
	className?: string;
}

const baseButtonStyle = `relative w-full text-left ${StyleTheme.Text.Primary} ${StyleTheme.Shadow.Inner} transition focus:outline-none disabled:cursor-not-allowed`;

const variantStyles: Record<TimePickerVariants, string> = {
	primary: `rounded-2xl ${StyleTheme.Container.Border.Primary} ${StyleTheme.Container.BackgroundInput}`,
	secondary: `rounded-lg ${StyleTheme.Container.Border.Primary} ${StyleTheme.Container.BackgroundInputSecondary}`,
	danger: `rounded-2xl ${StyleTheme.Container.Border.DangerStrong} ${StyleTheme.Container.BackgroundDangerSubtle}`,
};

const variantFocusStyles: Record<TimePickerVariants, string> = {
	primary: `${StyleTheme.Accent.FocusBorderPrimary} ${StyleTheme.Accent.FocusRingPrimary}`,
	secondary: StyleTheme.Accent.FocusBorderSecondary,
	danger: `${StyleTheme.Accent.FocusBorderDanger} ${StyleTheme.Accent.FocusRingDanger}`,
};

const variantHoverStyles: Record<TimePickerVariants, string> = {
	primary: StyleTheme.Hover.BorderLift,
	secondary: StyleTheme.Hover.BorderLiftSecondary,
	danger: StyleTheme.Hover.DangerBorder,
};

const sizeStyles: Record<TimePickerSizes, string> = {
	xs: "text-[16px] px-2 py-1.5",
	sm: "text-[16px] px-3 py-2",
	md: "text-[16px] px-4 py-3",
	lg: "text-base px-6 py-3",
	xl: "text-lg px-8 py-4",
};

const disabledStyle = "opacity-50";

const variantErrorStyles: Record<TimePickerVariants, string> = {
	primary: StyleTheme.ErrorBorder.Primary,
	secondary: StyleTheme.ErrorBorder.Secondary,
	danger: StyleTheme.ErrorBorder.Danger,
};

const flexClasses: Record<TimePickerFlex, string> = {
	shrink: "flex-shrink-0",
	default: "",
	grow: "flex-1 min-w-0",
};

const innerWidthClasses: Record<TimePickerFlex, string> = {
	shrink: "w-auto",
	default: "inline-block",
	grow: "w-full",
};

const clockBaseStyle = `absolute z-[100] mt-2 border ${StyleTheme.Dropdown.Background} p-2 sm:p-3 text-sm shadow-lg focus:outline-none overflow-hidden max-w-[calc(100vw-32px)]`;

const clockVariantStyles: Record<TimePickerVariants, string> = {
	primary: `rounded-2xl ${StyleTheme.Container.Border.Primary} ${StyleTheme.Status.Info.shadow}`,
	secondary: `rounded-lg ${StyleTheme.Container.Border.Primary} shadow-fuchsia-500/20`,
	danger: `rounded-2xl ${StyleTheme.Container.Border.Danger} ${StyleTheme.Status.Error.shadow}`,
};

/**
 * Parse a time string in HH:MM format to hour and minute
 */
function parseTimeString(
	time: string | null,
): { hour: number; minute: number } | null {
	if (!time) return null;
	const parts = time.split(":");
	if (parts.length !== 2) return null;
	const hour = parseInt(parts[0], 10);
	const minute = parseInt(parts[1], 10);
	if (
		Number.isNaN(hour) ||
		Number.isNaN(minute) ||
		hour < 0 ||
		hour > 23 ||
		minute < 0 ||
		minute > 59
	) {
		return null;
	}
	return { hour, minute };
}

/**
 * Format hour and minute to HH:MM string (24-hour format)
 */
function formatTimeForStorage(hour: number, minute: number): string {
	return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/**
 * Format hour and minute to 12-hour display format with AM/PM
 */
function formatTimeForDisplay(hour: number, minute: number): string {
	const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
	const ampm = hour < 12 ? "AM" : "PM";
	return `${displayHour}:${String(minute).padStart(2, "0")} ${ampm}`;
}

/**
 * Convert 24-hour hour to 12-hour display hour (1-12)
 */
function to12Hour(hour24: number): number {
	if (hour24 === 0) return 12;
	if (hour24 > 12) return hour24 - 12;
	return hour24;
}

/**
 * Convert 12-hour display hour to 24-hour hour
 */
function to24Hour(hour12: number, isPM: boolean): number {
	if (hour12 === 12) return isPM ? 12 : 0;
	return isPM ? hour12 + 12 : hour12;
}

/**
 * Get minute options for clock face (5-minute increments)
 */
function getMinuteOptions(): number[] {
	const minutes: number[] = [];
	for (let i = 0; i < 60; i += 5) {
		minutes.push(i);
	}
	return minutes;
}

/**
 * Calculate position for a number on a clock face
 */
function getClockPosition(
	index: number,
	total: number,
	radius: number,
	centerX: number,
	centerY: number,
): { x: number; y: number } {
	// Angle in radians: start at top (-90 degrees) and go clockwise
	const angle = (index * (360 / total) - 90) * (Math.PI / 180);
	const x = centerX + radius * Math.cos(angle);
	const y = centerY + radius * Math.sin(angle);
	return { x, y };
}

/**
 * TimePicker - Time picker component with clock face interface
 *
 * Uncontrolled component that follows the same design patterns as InputV2 and DatePicker.
 * Uses a mobile-first clock face interface where users select hour first, then minute.
 *
 * **Props:**
 * - `defaultValue?: string | null` - Default time in HH:MM format (24-hour, e.g., "14:30")
 * - `onChange?: (time: string | null) => void` - Callback when time is selected (returns HH:MM or null)
 * - `variant?: "primary" | "secondary" | "danger"` - Visual style (default: "primary")
 * - `size?: "xs" | "sm" | "md" | "lg" | "xl"` - Time picker size (default: "md")
 * - `flex?: "shrink" | "default" | "grow"` - Flex behavior (default: "default")
 * - `error?: boolean | string` - Error state or error message
 * - `label?: ReactNode` - Label text above time picker
 * - `description?: ReactNode` - Description text below time picker
 * - `disabled?: boolean` - Disable the time picker (default: false)
 * - `placeholder?: string` - Placeholder text (default: "Select time...")
 * - `className?: string` - Additional CSS classes
 *
 * **Time Format:**
 * - Display: 12-hour format with AM/PM (e.g., "2:30 PM")
 * - Storage/onChange: 24-hour format string (e.g., "14:30")
 *
 * **Clock Face:**
 * - Hour selection: Radial clock with numbers 1-12, AM/PM selector in center
 * - Minute selection: Same clock face with 5-minute increments (0, 5, 10, ..., 55)
 * - Mobile-optimized with large touch targets
 *
 * @example
 * ```tsx
 * <TimePicker
 *   label="Start Time"
 *   defaultValue="14:30"
 *   onChange={(time) => console.log(time)} // "14:30"
 * />
 * ```
 */
function TimePicker({
	defaultValue,
	onChange,
	variant = "primary",
	size = "md",
	flex = "default",
	error,
	label,
	description,
	disabled = false,
	placeholder = "Select time...",
	className,
}: TimePickerProps) {
	const generatedId = useId();
	const pickerId = generatedId;
	const errorMessage = typeof error === "string" ? error : undefined;
	const buttonRef = useRef<HTMLButtonElement>(null);
	const [buttonWidth, setButtonWidth] = useState<number | null>(null);
	const [isMobile, setIsMobile] = useState(false);

	// Internal state for selected time (uncontrolled mode)
	const [internalValue, setInternalValue] = useState<string | null>(
		defaultValue ?? null,
	);

	// Parse current time
	const currentTime = parseTimeString(internalValue);
	const currentHour = currentTime?.hour ?? null;
	const currentMinute = currentTime?.minute ?? null;

	// Clock face state
	const [mode, setMode] = useState<ClockMode>("hour");
	const [selectedHour, setSelectedHour] = useState<number | null>(currentHour);
	const [selectedMinute, setSelectedMinute] = useState<number | null>(
		currentMinute,
	);
	const [isPM, setIsPM] = useState<boolean>(
		currentHour !== null ? currentHour >= 12 : false,
	);
	const popoverOpenRef = useRef(false);
	const originalValueRef = useRef<string | null>(null);
	const lastPopoverOpenRef = useRef(false);

	const hasHeader = !!label;

	// Measure button width and detect mobile
	useEffect(() => {
		if (!buttonRef.current) return;

		const updateWidth = () => {
			if (buttonRef.current && typeof window !== "undefined") {
				const width = buttonRef.current.offsetWidth;
				setButtonWidth(width);
				setIsMobile(window.innerWidth < 640);
			}
		};

		updateWidth();
		window.addEventListener("resize", updateWidth);

		return () => {
			window.removeEventListener("resize", updateWidth);
		};
	}, []);

	// Reset clock state when popover opens
	const resetClockState = () => {
		// Store original value for cancel
		originalValueRef.current = internalValue;

		const time = parseTimeString(internalValue);
		if (time) {
			setSelectedHour(time.hour);
			setSelectedMinute(time.minute);
			setIsPM(time.hour >= 12);
		} else {
			setSelectedHour(null);
			setSelectedMinute(null);
			setIsPM(false);
		}
		setMode("hour");
	};

	// Handle hour selection
	const handleHourSelect = (hour12: number) => {
		const hour24 = to24Hour(hour12, isPM);
		setSelectedHour(hour24);

		// Update immediately with current minute (or default to 0)
		const minuteToUse =
			selectedMinute !== null ? selectedMinute : (currentMinute ?? 0);
		const timeString = formatTimeForStorage(hour24, minuteToUse);
		setInternalValue(timeString);
		onChange?.(timeString);

		// If no minute was selected yet, set it to the default
		if (selectedMinute === null) {
			setSelectedMinute(currentMinute ?? 0);
		}

		setMode("minute");
	};

	// Handle minute selection (updates immediately)
	const handleMinuteSelect = (minute: number) => {
		if (selectedHour === null) return;
		setSelectedMinute(minute);

		// Update immediately
		const timeString = formatTimeForStorage(selectedHour, minute);
		setInternalValue(timeString);
		onChange?.(timeString);
	};

	// Handle OK button - confirm selection
	const handleOK = (close: () => void) => {
		if (selectedHour === null || selectedMinute === null) return;

		const timeString = formatTimeForStorage(selectedHour, selectedMinute);
		setInternalValue(timeString);
		onChange?.(timeString);
		close();
	};

	// Handle Cancel button - discard changes
	const handleCancel = (close: () => void) => {
		// Restore original value
		const originalValue = originalValueRef.current;
		setInternalValue(originalValue);
		onChange?.(originalValue ?? null);

		// Reset to original value
		const time = parseTimeString(originalValue);
		if (time) {
			setSelectedHour(time.hour);
			setSelectedMinute(time.minute);
			setIsPM(time.hour >= 12);
		} else {
			setSelectedHour(null);
			setSelectedMinute(null);
			setIsPM(false);
		}
		setMode("hour");
		close();
	};

	// Handle AM/PM toggle
	const handleAMPMToggle = () => {
		if (selectedHour === null) {
			setIsPM(!isPM);
			return;
		}
		const hour12 = to12Hour(selectedHour);
		const newHour24 = to24Hour(hour12, !isPM);
		setSelectedHour(newHour24);
		setIsPM(!isPM);

		// Update immediately
		const minuteToUse =
			selectedMinute !== null ? selectedMinute : (currentMinute ?? 0);
		const timeString = formatTimeForStorage(newHour24, minuteToUse);
		setInternalValue(timeString);
		onChange?.(timeString);
	};

	// Get current display time parts (from selected values or current time)
	const getDisplayTimeParts = (): {
		hour: number;
		minute: number;
		ampm: string;
	} => {
		if (selectedHour !== null && selectedMinute !== null) {
			const displayHour =
				selectedHour === 0
					? 12
					: selectedHour > 12
						? selectedHour - 12
						: selectedHour;
			return {
				hour: displayHour,
				minute: selectedMinute,
				ampm: selectedHour < 12 ? "AM" : "PM",
			};
		}
		if (currentTime) {
			const displayHour =
				currentTime.hour === 0
					? 12
					: currentTime.hour > 12
						? currentTime.hour - 12
						: currentTime.hour;
			return {
				hour: displayHour,
				minute: currentTime.minute,
				ampm: currentTime.hour < 12 ? "AM" : "PM",
			};
		}
		return { hour: 12, minute: 0, ampm: "AM" };
	};

	// Render clock face
	const renderClockFace = () => {
		const centerX = clockSize / 2;
		const centerY = clockSize / 2;
		const radius = isMobile ? 80 : 100;

		if (mode === "hour") {
			// Hour selection mode - 12 at top (index 0)
			const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

			return (
				<div
					className="relative mx-auto"
					style={{ width: clockSize, height: clockSize, maxWidth: "100%" }}
				>
					{/* Hour numbers */}
					{hours.map((hour, index) => {
						const position = getClockPosition(
							index,
							12,
							radius,
							centerX,
							centerY,
						);
						const isSelected =
							selectedHour !== null &&
							to12Hour(selectedHour) === hour &&
							selectedHour >= 12 === isPM;

						return (
							<button
								key={hour}
								type="button"
								onClick={() => handleHourSelect(hour)}
								className={clsx(
									"absolute w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm sm:text-base font-semibold transition-all",
									"transform -translate-x-1/2 -translate-y-1/2",
									isSelected
										? "bg-indigo-500/20 text-white"
										: "text-zinc-300 hover:bg-indigo-500/10 hover:text-white",
									"focus:outline-none focus:ring-2 focus:ring-indigo-500/40",
								)}
								style={{
									left: `${position.x}px`,
									top: `${position.y}px`,
								}}
							>
								{hour}
							</button>
						);
					})}

					{/* Center AM/PM selector */}
					<button
						type="button"
						onClick={handleAMPMToggle}
						className={clsx(
							"absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2",
							"w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center",
							"text-xs sm:text-sm font-semibold transition-all",
							"bg-zinc-800/50 text-zinc-300 hover:bg-indigo-500/10 hover:text-white",
							"focus:outline-none focus:ring-2 focus:ring-indigo-500/40",
						)}
					>
						{isPM ? "PM" : "AM"}
					</button>
				</div>
			);
		} else {
			// Minute selection mode
			const minutes = getMinuteOptions();
			const minuteCount = minutes.length;

			return (
				<div
					className="relative mx-auto"
					style={{ width: clockSize, height: clockSize, maxWidth: "100%" }}
				>
					{/* Minute numbers */}
					{minutes.map((minute, index) => {
						const position = getClockPosition(
							index,
							minuteCount,
							radius,
							centerX,
							centerY,
						);
						const isSelected = selectedMinute === minute;

						return (
							<button
								key={minute}
								type="button"
								onClick={() => handleMinuteSelect(minute)}
								className={clsx(
									"absolute w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm sm:text-base font-semibold transition-all",
									"transform -translate-x-1/2 -translate-y-1/2",
									isSelected
										? "bg-indigo-500/20 text-white"
										: "text-zinc-300 hover:bg-indigo-500/10 hover:text-white",
									"focus:outline-none focus:ring-2 focus:ring-indigo-500/40",
								)}
								style={{
									left: `${position.x}px`,
									top: `${position.y}px`,
								}}
							>
								{minute}
							</button>
						);
					})}
				</div>
			);
		}
	};

	// Format display value
	const displayValue = currentTime
		? formatTimeForDisplay(currentTime.hour, currentTime.minute)
		: placeholder;

	// Calculate clock size for PopoverPanel width
	const clockSize = isMobile ? 240 : 280;

	return (
		<div className={clsx("space-y-2", flexClasses[flex])}>
			<div className={innerWidthClasses[flex]}>
				{hasHeader && <InputHeader htmlFor={pickerId} label={label} />}

				<div className="relative mt-1">
					<Popover>
						{({ close, open }) => {
							// Track popover open state and reset clock when it opens
							// Use a ref to avoid calling setState during render
							const prevOpen = lastPopoverOpenRef.current;

							// Only reset if popover just opened
							if (open && !prevOpen && !popoverOpenRef.current) {
								// Use setTimeout to schedule after render completes
								setTimeout(() => {
									resetClockState();
									popoverOpenRef.current = true;
								}, 0);
							} else if (!open && prevOpen) {
								popoverOpenRef.current = false;
							}

							lastPopoverOpenRef.current = open;

							return (
								<>
									<PopoverButton
										ref={buttonRef}
										id={pickerId}
										disabled={disabled}
										className={clsx(
											className?.match(/\bw-\d+\b/)
												? baseButtonStyle.replace("w-full", "").trim()
												: baseButtonStyle,
											"border",
											variantStyles[variant],
											sizeStyles[size],
											disabled && disabledStyle,
											!!error && variantErrorStyles[variant],
											!disabled && !error && variantFocusStyles[variant],
											!disabled && !error && variantHoverStyles[variant],
											className,
										)}
									>
										<span className="block truncate pr-8">{displayValue}</span>
										<span
											className={clsx(
												"pointer-events-none absolute inset-y-0 flex items-center text-zinc-400",
												internalValue ? "right-11 sm:right-8" : "right-3",
											)}
										>
											<IoTime className="h-4 w-4" aria-hidden="true" />
										</span>
									</PopoverButton>
									{internalValue && !disabled && (
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												setInternalValue(null);
												onChange?.(null);
											}}
											className="absolute inset-y-0 right-0 sm:right-1 flex items-center p-2 rounded hover:bg-white/10 text-rose-400 hover:text-rose-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/40 z-10 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
											aria-label="Clear time"
										>
											<IoClose className="h-3 w-3 sm:h-3 sm:w-3" />
										</button>
									)}
									<Transition
										as={Fragment}
										leave="transition ease-in duration-100"
										leaveFrom="opacity-100"
										leaveTo="opacity-0"
									>
										<PopoverPanel
											anchor="bottom start"
											className={clsx(
												clockBaseStyle,
												clockVariantStyles[variant],
											)}
											onClick={(e) => {
												e.stopPropagation();
											}}
											style={
												buttonWidth
													? {
															width: `${Math.max(buttonWidth, clockSize + 32)}px`,
															minWidth: `${clockSize + 32}px`,
															maxWidth: isMobile
																? `${window.innerWidth - 32}px`
																: undefined,
														}
													: {
															width: isMobile
																? `${clockSize + 32}px`
																: `${clockSize + 32}px`,
															minWidth: `${clockSize + 32}px`,
															maxWidth: isMobile
																? "calc(100vw - 32px)"
																: undefined,
														}
											}
										>
											<div className="flex flex-col overflow-hidden">
												{/* Time display at top - clickable hour and minute */}
												<div className="flex items-center justify-center overflow-hidden">
													<div className="flex items-center gap-1">
														<button
															type="button"
															onClick={() => setMode("hour")}
															className={clsx(
																"px-2 py-1.5 rounded-lg transition-all",
																"text-xl sm:text-2xl font-semibold",
																"flex items-center justify-center",
																"min-h-12",
																mode === "hour"
																	? "bg-indigo-500/20 text-white"
																	: "text-zinc-300 hover:bg-indigo-500/10 hover:text-white",
																"focus:outline-none focus:ring-2 focus:ring-indigo-500/40",
															)}
														>
															{getDisplayTimeParts().hour}
														</button>
														<span className="text-zinc-400 text-lg sm:text-xl">
															:
														</span>
														<button
															type="button"
															onClick={() => {
																if (selectedHour !== null) {
																	setMode("minute");
																}
															}}
															className={clsx(
																"px-2 py-1.5 rounded-lg transition-all",
																"text-xl sm:text-2xl font-semibold",
																"flex items-center justify-center",
																"min-h-12",
																mode === "minute"
																	? "bg-indigo-500/20 text-white"
																	: "text-zinc-300 hover:bg-indigo-500/10 hover:text-white",
																selectedHour === null &&
																	"opacity-50 cursor-not-allowed",
																"focus:outline-none focus:ring-2 focus:ring-indigo-500/40",
															)}
															disabled={selectedHour === null}
														>
															{String(getDisplayTimeParts().minute).padStart(
																2,
																"0",
															)}
														</button>
														<button
															type="button"
															onClick={handleAMPMToggle}
															className={clsx(
																"ml-2 px-2 py-1.5 rounded-lg transition-all",
																"flex flex-col items-center justify-center",
																"min-h-12",
																"hover:bg-indigo-500/10",
																"focus:outline-none focus:ring-2 focus:ring-indigo-500/40",
															)}
														>
															<span
																className={clsx(
																	"text-base sm:text-lg font-semibold leading-none transition-colors",
																	!isPM ? "text-white" : "text-zinc-500",
																)}
															>
																AM
															</span>
															<span
																className={clsx(
																	"text-base sm:text-lg font-semibold leading-none transition-colors",
																	isPM ? "text-white" : "text-zinc-500",
																)}
															>
																PM
															</span>
														</button>
													</div>
												</div>

												{/* Clock face */}
												<div className="py-0">{renderClockFace()}</div>

												{/* Cancel and OK buttons at bottom */}
												<div
													className={`flex items-center justify-end gap-2 pt-1 border-t ${StyleTheme.Divider.Subtle}`}
												>
													<Button
														variant="secondary"
														size="sm"
														onClick={() => handleCancel(close)}
													>
														Cancel
													</Button>
													<Button
														variant="primary"
														size="sm"
														onClick={() => handleOK(close)}
														disabled={
															selectedHour === null || selectedMinute === null
														}
													>
														OK
													</Button>
												</div>
											</div>
										</PopoverPanel>
									</Transition>
								</>
							);
						}}
					</Popover>
				</div>
			</div>

			{description && <p className="text-xs text-zinc-500">{description}</p>}

			{errorMessage && (
				<p className="text-xs font-medium text-rose-400">{errorMessage}</p>
			)}
		</div>
	);
}

export default TimePicker;
