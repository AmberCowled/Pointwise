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
import {
	IoCalendar,
	IoChevronBack,
	IoChevronForward,
	IoClose,
} from "react-icons/io5";

import { InputHeader } from "./InputHeader";

type DatePickerVariants = "primary" | "secondary" | "danger";
type DatePickerSizes = "xs" | "sm" | "md" | "lg" | "xl";
type DatePickerFlex = "shrink" | "default" | "grow";

type CalendarView = "calendar" | "month" | "year";

/**
 * Props for the DatePicker component
 */
export interface DatePickerProps {
	/**
	 * Selected date value (controlled)
	 */
	value?: Date | null;

	/**
	 * Default selected date (uncontrolled)
	 */
	defaultValue?: Date | null;

	/**
	 * Callback fired when a date is selected
	 * @param date - The selected date or null if cleared
	 */
	onChange?: (date: Date | null) => void;

	/**
	 * Minimum selectable date
	 */
	minDate?: Date;

	/**
	 * Maximum selectable date
	 */
	maxDate?: Date;

	/**
	 * Array of dates to disable
	 */
	disabledDates?: Date[];

	/**
	 * Visual variant style
	 * @default 'primary'
	 */
	variant?: DatePickerVariants;

	/**
	 * Size of the date picker button
	 * @default 'md'
	 */
	size?: DatePickerSizes;

	/**
	 * Flex behavior for the date picker wrapper
	 * - 'shrink': Prevents the date picker from shrinking (flex-shrink-0)
	 * - 'default': Normal flex behavior
	 * - 'grow': Date picker takes up available space (flex-1 min-w-0)
	 * @default 'default'
	 */
	flex?: DatePickerFlex;

	/**
	 * Error state. Can be a boolean to show error styling, or a string to display an error message
	 */
	error?: boolean | string;

	/**
	 * Label text displayed above the date picker
	 */
	label?: React.ReactNode;

	/**
	 * Description text displayed below the date picker
	 */
	description?: React.ReactNode;

	/**
	 * Whether the date picker is disabled
	 * @default false
	 */
	disabled?: boolean;

	/**
	 * Placeholder text displayed when no date is selected
	 * @default 'Select date...'
	 */
	placeholder?: string;

	/**
	 * Additional CSS classes for the date picker button
	 */
	className?: string;
}

const baseButtonStyle =
	"relative w-full text-left text-zinc-100 shadow-inner shadow-white/5 transition focus:outline-none disabled:cursor-not-allowed";

const variantStyles: Record<DatePickerVariants, string> = {
	primary: "rounded-2xl border-white/10 bg-white/5",
	secondary: "rounded-lg border-white/10 bg-zinc-900",
	danger: "rounded-2xl border-rose-400/60 bg-rose-500/10",
};

const variantFocusStyles: Record<DatePickerVariants, string> = {
	primary: "focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-500/40",
	secondary: "focus:border-fuchsia-500/50",
	danger: "focus:border-rose-500/80 focus:ring-2 focus:ring-rose-500/40",
};

const variantHoverStyles: Record<DatePickerVariants, string> = {
	primary: "hover:border-white/20",
	secondary: "hover:border-white/15",
	danger: "hover:border-rose-400/70",
};

const sizeStyles: Record<DatePickerSizes, string> = {
	xs: "text-[16px] px-2 py-1.5",
	sm: "text-[16px] px-3 py-2",
	md: "text-[16px] px-4 py-3",
	lg: "text-base px-6 py-3",
	xl: "text-lg px-8 py-4",
};

const disabledStyle = "opacity-50";

const defaultErrorStyle = "border-rose-400/60 focus:border-rose-400/80";
const variantErrorStyles: Record<DatePickerVariants, string> = {
	primary: defaultErrorStyle,
	secondary: defaultErrorStyle,
	danger: "border-rose-500/80 focus:border-rose-500/90",
};

const calendarBaseStyle =
	"absolute z-[100] mt-2 border bg-zinc-900 p-1.5 sm:p-2 text-sm shadow-lg focus:outline-none overflow-hidden";

const calendarVariantStyles: Record<DatePickerVariants, string> = {
	primary: "rounded-2xl border-white/10 shadow-indigo-500/20",
	secondary: "rounded-lg border-white/10 shadow-fuchsia-500/20",
	danger: "rounded-2xl border-rose-400/40 shadow-rose-500/20",
};

const flexClasses: Record<DatePickerFlex, string> = {
	shrink: "flex-shrink-0",
	default: "",
	grow: "flex-1 min-w-0",
};

const innerWidthClasses: Record<DatePickerFlex, string> = {
	shrink: "w-auto",
	default: "inline-block",
	grow: "w-full",
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

/**
 * Format a Date object to ISO string (YYYY-MM-DD)
 */
function formatDateToISO(date: Date | null): string {
	if (!date) return "";
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

/**
 * Check if two dates are the same day (ignoring time)
 */
function isSameDay(date1: Date | null, date2: Date | null): boolean {
	if (!date1 || !date2) return false;
	return (
		date1.getFullYear() === date2.getFullYear() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getDate() === date2.getDate()
	);
}

/**
 * Check if a date is disabled
 */
function isDateDisabled(
	date: Date,
	minDate?: Date,
	maxDate?: Date,
	disabledDates?: Date[],
): boolean {
	// Check min/max date constraints
	if (minDate) {
		const minDateOnly = new Date(
			minDate.getFullYear(),
			minDate.getMonth(),
			minDate.getDate(),
		);
		const dateOnly = new Date(
			date.getFullYear(),
			date.getMonth(),
			date.getDate(),
		);
		if (dateOnly < minDateOnly) return true;
	}

	if (maxDate) {
		const maxDateOnly = new Date(
			maxDate.getFullYear(),
			maxDate.getMonth(),
			maxDate.getDate(),
		);
		const dateOnly = new Date(
			date.getFullYear(),
			date.getMonth(),
			date.getDate(),
		);
		if (dateOnly > maxDateOnly) return true;
	}

	// Check disabled dates array
	if (disabledDates) {
		return disabledDates.some((disabledDate) => isSameDay(date, disabledDate));
	}

	return false;
}

/**
 * Get today's date (date only, no time)
 */
function getToday(): Date {
	const today = new Date();
	return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

/**
 * DatePicker - Date picker component with calendar popover
 *
 * **Props:**
 * - `value?: Date | null` - Selected date (controlled)
 * - `defaultValue?: Date | null` - Default selected date (uncontrolled)
 * - `onChange?: (date: Date | null) => void` - Callback when date is selected
 * - `minDate?: Date` - Minimum selectable date
 * - `maxDate?: Date` - Maximum selectable date
 * - `disabledDates?: Date[]` - Array of dates to disable
 * - `variant?: "primary" | "secondary" | "danger"` - Visual style (default: "primary")
 * - `size?: "xs" | "sm" | "md" | "lg" | "xl"` - Date picker size (default: "md")
 * - `flex?: "shrink" | "default" | "grow"` - Flex behavior (default: "default")
 * - `error?: boolean | string` - Error state or error message
 * - `label?: ReactNode` - Label text above date picker
 * - `description?: ReactNode` - Description text below date picker
 * - `disabled?: boolean` - Disable the date picker (default: false)
 * - `placeholder?: string` - Placeholder text (default: "Select date...")
 * - `className?: string` - Additional CSS classes
 *
 * @example
 * ```tsx
 * <DatePicker
 *   label="Start Date"
 *   value={startDate}
 *   onChange={setStartDate}
 *   minDate={new Date()}
 *   variant="primary"
 *   size="md"
 *   flex="grow"
 * />
 * ```
 */
function DatePicker({
	value,
	defaultValue,
	onChange,
	minDate,
	maxDate,
	disabledDates,
	variant = "primary",
	size = "md",
	flex = "default",
	error,
	label,
	description,
	disabled = false,
	placeholder = "Select date...",
	className,
}: DatePickerProps) {
	const generatedId = useId();
	const pickerId = generatedId;
	const errorMessage = typeof error === "string" ? error : undefined;
	const buttonRef = useRef<HTMLButtonElement>(null);
	const [buttonWidth, setButtonWidth] = useState<number | null>(null);
	const [isMobile, setIsMobile] = useState(false);
	const [maxCalendarWidth, setMaxCalendarWidth] = useState<number | null>(null);

	// Internal state for selected date (uncontrolled mode)
	const [internalValue, setInternalValue] = useState<Date | null>(
		defaultValue ?? null,
	);

	// Use controlled value if provided, otherwise use internal state
	const selectedDate = value !== undefined ? value : internalValue;

	// Calendar navigation state
	const [viewDate, setViewDate] = useState<Date>(selectedDate ?? new Date());
	const [view, setView] = useState<CalendarView>("calendar");

	const hasHeader = !!label;

	// Handle date selection - will be called with close function from Popover
	const handleDateSelect = (date: Date, close: () => void) => {
		const newDate = new Date(
			date.getFullYear(),
			date.getMonth(),
			date.getDate(),
		);

		// Update state first
		if (value === undefined) {
			// Uncontrolled mode
			setInternalValue(newDate);
		}

		onChange?.(newDate);

		// Close popover immediately
		close();
	};

	// Measure button width for calendar matching and detect mobile
	useEffect(() => {
		if (!buttonRef.current) return;

		const updateWidth = () => {
			if (buttonRef.current && typeof window !== "undefined") {
				const width = buttonRef.current.offsetWidth;
				setButtonWidth(width);
				const mobile = window.innerWidth < 640;
				setIsMobile(mobile);
				// Calculate max calendar width (viewport width minus padding)
				setMaxCalendarWidth(window.innerWidth - 32);
			}
		};

		updateWidth();
		window.addEventListener("resize", updateWidth);

		return () => {
			window.removeEventListener("resize", updateWidth);
		};
	}, []);

	// Update viewDate when selectedDate changes (to show selected month)
	useEffect(() => {
		if (selectedDate) {
			setViewDate(
				new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
			);
		}
	}, [selectedDate]);

	// Generate calendar grid
	const generateCalendarDays = (): Date[] => {
		const year = viewDate.getFullYear();
		const month = viewDate.getMonth();

		// First day of the month
		const firstDay = new Date(year, month, 1);

		// Get the first Sunday on or before the first day of the month
		const startDate = new Date(firstDay);
		const dayOfWeek = startDate.getDay(); // 0 = Sunday, 6 = Saturday
		startDate.setDate(startDate.getDate() - dayOfWeek);

		// Generate 42 days (6 weeks × 7 days)
		const days: Date[] = [];
		for (let i = 0; i < 42; i++) {
			const date = new Date(startDate);
			date.setDate(startDate.getDate() + i);
			days.push(date);
		}

		return days;
	};

	const calendarDays = generateCalendarDays();
	const today = getToday();

	// Month navigation
	const handlePrevMonth = () => {
		setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
	};

	const handleNextMonth = () => {
		setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
	};

	// Year navigation
	const handlePrevYear = () => {
		setViewDate(new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1));
	};

	const handleNextYear = () => {
		setViewDate(new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1));
	};

	// Year picker: generate year range
	const generateYearRange = (): number[] => {
		const currentYear = viewDate.getFullYear();
		const startYear = Math.floor(currentYear / 12) * 12; // Round down to nearest multiple of 12
		const years: number[] = [];
		for (let i = 0; i < 12; i++) {
			years.push(startYear + i);
		}
		return years;
	};

	const yearRange = generateYearRange();

	// Render calendar view
	const renderCalendar = (close: () => void) => (
		<div className="space-y-1.5 sm:space-y-2">
			{/* Header with month/year and navigation */}
			<div className="flex items-center justify-between">
				<button
					type="button"
					onClick={handlePrevMonth}
					className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
					aria-label="Previous month"
				>
					<IoChevronBack className="h-4 w-4" />
				</button>
				<button
					type="button"
					onClick={() => setView("month")}
					className="rounded-lg px-3 py-1.5 text-sm font-semibold text-zinc-100 transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
				>
					{MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
				</button>
				<button
					type="button"
					onClick={handleNextMonth}
					className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
					aria-label="Next month"
				>
					<IoChevronForward className="h-4 w-4" />
				</button>
			</div>

			{/* Day names header */}
			<div
				className="grid gap-0.5 sm:gap-1 min-w-0"
				style={{ gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}
			>
				{DAY_NAMES.map((day) => (
					<div
						key={day}
						className="py-0.5 sm:py-1 text-center text-[10px] sm:text-xs font-semibold text-zinc-500 min-w-0 overflow-hidden"
					>
						{day}
					</div>
				))}
			</div>

			{/* Calendar grid */}
			<div
				className="grid gap-0.5 sm:gap-1 min-w-0"
				style={{ gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}
			>
				{calendarDays.map((day) => {
					const isCurrentMonth = day.getMonth() === viewDate.getMonth();
					const isSelected = isSameDay(day, selectedDate);
					const isToday = isSameDay(day, today);
					const isDisabled = isDateDisabled(
						day,
						minDate,
						maxDate,
						disabledDates,
					);
					const dayKey = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;

					return (
						<button
							key={dayKey}
							type="button"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								if (!isDisabled) {
									handleDateSelect(day, close);
								}
							}}
							disabled={isDisabled}
							className={clsx(
								"rounded-lg px-1 py-1.5 text-xs sm:px-2 sm:py-2 sm:text-sm transition text-zinc-100 min-w-0 w-full flex items-center justify-center overflow-hidden",
								!isCurrentMonth && "text-zinc-500",
								isToday && !isSelected && "border border-indigo-400/60",
								isSelected && "bg-indigo-500/20 text-white font-semibold",
								!isSelected &&
									!isDisabled &&
									"hover:bg-indigo-500/10 hover:text-white",
								isDisabled && "cursor-not-allowed opacity-50",
								!isDisabled && "cursor-pointer",
							)}
						>
							{day.getDate()}
						</button>
					);
				})}
			</div>
		</div>
	);

	// Render month picker
	const renderMonthPicker = () => (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<button
					type="button"
					onClick={handlePrevYear}
					className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
					aria-label="Previous year"
				>
					<IoChevronBack className="h-4 w-4" />
				</button>
				<button
					type="button"
					onClick={() => setView("year")}
					className="rounded-lg px-3 py-1.5 text-sm font-semibold text-zinc-100 transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
				>
					{viewDate.getFullYear()}
				</button>
				<button
					type="button"
					onClick={handleNextYear}
					className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
					aria-label="Next year"
				>
					<IoChevronForward className="h-4 w-4" />
				</button>
			</div>
			<div className="grid grid-cols-3 gap-1">
				{MONTH_NAMES.map((month, index) => {
					const isSelected = viewDate.getMonth() === index;
					return (
						<button
							key={month}
							type="button"
							onClick={() => {
								setViewDate(new Date(viewDate.getFullYear(), index, 1));
								setView("calendar");
							}}
							className={clsx(
								"rounded-xl px-3 py-2 text-sm transition text-zinc-100",
								isSelected && "bg-indigo-500/20 text-white font-semibold",
								!isSelected && "hover:bg-indigo-500/10 hover:text-white",
								"cursor-pointer",
							)}
						>
							{month.substring(0, 3)}
						</button>
					);
				})}
			</div>
		</div>
	);

	// Render year picker
	const renderYearPicker = () => (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<button
					type="button"
					onClick={() => {
						setViewDate(
							new Date(viewDate.getFullYear() - 12, viewDate.getMonth(), 1),
						);
					}}
					className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
					aria-label="Previous 12 years"
				>
					<IoChevronBack className="h-4 w-4" />
				</button>
				<div className="rounded-lg px-3 py-1.5 text-sm font-semibold text-zinc-100">
					{yearRange[0]} - {yearRange[11]}
				</div>
				<button
					type="button"
					onClick={() => {
						setViewDate(
							new Date(viewDate.getFullYear() + 12, viewDate.getMonth(), 1),
						);
					}}
					className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
					aria-label="Next 12 years"
				>
					<IoChevronForward className="h-4 w-4" />
				</button>
			</div>
			<div className="grid grid-cols-3 gap-1">
				{yearRange.map((year) => {
					const isSelected = viewDate.getFullYear() === year;
					return (
						<button
							key={year}
							type="button"
							onClick={() => {
								setViewDate(new Date(year, viewDate.getMonth(), 1));
								setView("month");
							}}
							className={clsx(
								"rounded-xl px-3 py-2 text-sm transition text-zinc-100",
								isSelected && "bg-indigo-500/20 text-white font-semibold",
								!isSelected && "hover:bg-indigo-500/10 hover:text-white",
								"cursor-pointer",
							)}
						>
							{year}
						</button>
					);
				})}
			</div>
		</div>
	);

	return (
		<div className={clsx("space-y-2", flexClasses[flex])}>
			<div className={innerWidthClasses[flex]}>
				{hasHeader && <InputHeader htmlFor={pickerId} label={label} />}

				<div className="relative mt-1">
					<Popover>
						{({ close }) => (
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
									<span className="block truncate pr-8">
										{selectedDate ? formatDateToISO(selectedDate) : placeholder}
									</span>
									<span
										className={clsx(
											"pointer-events-none absolute inset-y-0 flex items-center text-zinc-400",
											selectedDate ? "right-11 sm:right-8" : "right-3",
										)}
									>
										<IoCalendar className="h-4 w-4" aria-hidden="true" />
									</span>
								</PopoverButton>
								{selectedDate && !disabled && (
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											// Update internal state if uncontrolled
											if (value === undefined) {
												setInternalValue(null);
											}
											onChange?.(null);
										}}
										className="absolute inset-y-0 right-0 sm:right-1 flex items-center p-2 rounded hover:bg-white/10 text-rose-400 hover:text-rose-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/40 z-10 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
										aria-label="Clear date"
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
											calendarBaseStyle,
											calendarVariantStyles[variant],
										)}
										onClick={(e) => {
											e.stopPropagation();
										}}
										style={
											buttonWidth && maxCalendarWidth
												? {
														width: isMobile
															? `${Math.min(buttonWidth, maxCalendarWidth)}px`
															: `${Math.max(buttonWidth, 320)}px`,
														maxWidth: isMobile
															? `${maxCalendarWidth}px`
															: undefined,
														minWidth: "280px",
													}
												: {
														width: isMobile ? "calc(100vw - 32px)" : "100%",
														minWidth: "280px",
														maxWidth: isMobile
															? "calc(100vw - 32px)"
															: undefined,
													}
										}
									>
										{view === "calendar" && renderCalendar(close)}
										{view === "month" && renderMonthPicker()}
										{view === "year" && renderYearPicker()}
									</PopoverPanel>
								</Transition>
							</>
						)}
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

export default DatePicker;
