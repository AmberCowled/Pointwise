"use client";

import {
	Listbox,
	ListboxButton,
	ListboxOption,
	ListboxOptions,
	Transition,
} from "@headlessui/react";
import clsx from "clsx";
import type React from "react";
import { Fragment, useEffect, useId, useRef, useState } from "react";
import { IoChevronDown } from "react-icons/io5";

import { InputHeader } from "./InputHeader";
import { StyleTheme } from "./StyleTheme";

type InputSelectVariants = "primary" | "secondary" | "danger";
type InputSelectSizes = "xs" | "sm" | "md" | "lg" | "xl";
type InputFlex = "shrink" | "default" | "grow";

/**
 * Props for the InputSelect component
 */
export interface InputSelectProps {
	/**
	 * Array of string options to display in the dropdown
	 * The first option will be auto-selected if no defaultValue is provided
	 */
	options: string[];

	/**
	 * Callback fired when an option is selected
	 * Also fires on mount with the initial selected value
	 * @param value - The selected option value
	 */
	onSelect?: (value: string) => void;

	/**
	 * Default selected value. If not provided, the first option from the options array will be selected
	 */
	defaultValue?: string;

	/**
	 * Visual variant style
	 * @default 'primary'
	 */
	variant?: InputSelectVariants;

	/**
	 * Size of the select button
	 * @default 'md'
	 */
	size?: InputSelectSizes;

	/**
	 * Flex behavior for the select wrapper
	 * - 'shrink': Prevents the select from shrinking (flex-shrink-0)
	 * - 'default': Normal flex behavior
	 * - 'grow': Select takes up available space (flex-1 min-w-0)
	 * @default 'default'
	 */
	flex?: InputFlex;

	/**
	 * Placeholder text displayed when no option is selected
	 * @default 'Select...'
	 */
	placeholder?: string;

	/**
	 * Whether the select is disabled
	 * @default false
	 */
	disabled?: boolean;

	/**
	 * Error state. Can be a boolean to show error styling, or a string to display an error message
	 */
	error?: boolean | string;

	/**
	 * Label text displayed above the select
	 */
	label?: React.ReactNode;

	/**
	 * Description text displayed below the select
	 */
	description?: React.ReactNode;

	/**
	 * Additional CSS classes for the select button
	 */
	className?: string;
}

const baseButtonStyle = `relative w-full text-left ${StyleTheme.Text.Primary} ${StyleTheme.Shadow.Inner} transition focus:outline-none disabled:cursor-not-allowed`;

const variantStyles: Record<InputSelectVariants, string> = {
	primary: `rounded-2xl ${StyleTheme.Container.Border.Primary} ${StyleTheme.Container.BackgroundInput}`,
	secondary: `rounded-lg ${StyleTheme.Container.Border.Primary} ${StyleTheme.Container.BackgroundInputSecondary}`,
	danger: `rounded-2xl ${StyleTheme.Container.Border.DangerStrong} ${StyleTheme.Container.BackgroundDangerSubtle}`,
};

const variantFocusStyles: Record<InputSelectVariants, string> = {
	primary: `${StyleTheme.Accent.FocusBorderPrimary} ${StyleTheme.Accent.FocusRingPrimary}`,
	secondary: StyleTheme.Accent.FocusBorderSecondary,
	danger: `${StyleTheme.Accent.FocusBorderDanger} ${StyleTheme.Accent.FocusRingDanger}`,
};

const variantHoverStyles: Record<InputSelectVariants, string> = {
	primary: StyleTheme.Hover.BorderLift,
	secondary: StyleTheme.Hover.BorderLiftSecondary,
	danger: StyleTheme.Hover.DangerBorder,
};

const sizeStyles: Record<InputSelectSizes, string> = {
	xs: "text-[16px] px-2 py-1.5",
	sm: "text-[16px] px-3 py-2",
	md: "text-[16px] px-4 py-3",
	lg: "text-base px-6 py-3",
	xl: "text-lg px-8 py-4",
};

const disabledStyle = "opacity-50";

const variantErrorStyles: Record<InputSelectVariants, string> = {
	primary: StyleTheme.ErrorBorder.Primary,
	secondary: StyleTheme.ErrorBorder.Secondary,
	danger: StyleTheme.ErrorBorder.Danger,
};

const listBaseStyle = `absolute z-[100] mt-2 max-h-60 w-full overflow-auto border ${StyleTheme.Dropdown.Background} p-2 text-sm shadow-lg focus:outline-none`;

const listVariantStyles: Record<InputSelectVariants, string> = {
	primary: `rounded-2xl ${StyleTheme.Container.Border.Primary} ${StyleTheme.Status.Info.shadow}`,
	secondary: `rounded-lg ${StyleTheme.Container.Border.Primary} shadow-fuchsia-500/20`,
	danger: `rounded-2xl ${StyleTheme.Container.Border.Danger} ${StyleTheme.Status.Error.shadow}`,
};

const flexClasses: Record<InputFlex, string> = {
	shrink: "flex-shrink-0",
	default: "",
	grow: "flex-1 min-w-0",
};

const innerWidthClasses: Record<InputFlex, string> = {
	shrink: "w-auto",
	default: "inline-block",
	grow: "w-full",
};

/**
 * InputSelect - Dropdown select component with variants, sizes, and flexible layout
 *
 * **Props:**
 * - `options: string[]` - Array of string options (required)
 * - `onSelect?: (value: string) => void` - Callback when option is selected (fires on mount with initial value)
 * - `defaultValue?: string` - Default selected value (defaults to first option)
 * - `variant?: "primary" | "secondary" | "danger"` - Visual style (default: "primary")
 * - `size?: "xs" | "sm" | "md" | "lg" | "xl"` - Select size (default: "md")
 * - `flex?: "shrink" | "default" | "grow"` - Flex behavior (default: "default")
 * - `placeholder?: string` - Placeholder text (default: "Select...")
 * - `disabled?: boolean` - Disable the select (default: false)
 * - `error?: boolean | string` - Error state or error message
 * - `label?: ReactNode` - Label text above select
 * - `description?: ReactNode` - Description text below select
 * - `className?: string` - Additional CSS classes
 *
 * The component automatically selects the first option on mount if no defaultValue is provided.
 * The onSelect callback fires on mount with the initial selected value.
 *
 * @example
 * ```tsx
 * <InputSelect
 *   options={["Projects", "Tasks", "Settings"]}
 *   onSelect={(value) => console.log(value)}
 *   label="Select an option"
 *   variant="primary"
 *   size="md"
 *   flex="grow"
 * />
 * ```
 */
function InputSelect({
	options,
	onSelect,
	defaultValue,
	variant = "primary",
	size = "md",
	flex = "default",
	placeholder,
	disabled,
	error,
	label,
	description,
	className,
}: InputSelectProps) {
	const generatedId = useId();
	const selectId = generatedId;
	const errorMessage = typeof error === "string" ? error : undefined;
	const buttonRef = useRef<HTMLButtonElement>(null);
	const [buttonWidth, setButtonWidth] = useState<number | null>(null);
	const [isMobile, setIsMobile] = useState(false);
	const hasFiredInitialSelect = useRef(false);

	// Convert string array to option objects
	const optionObjects = options.map((str) => ({ label: str, value: str }));

	// Internal state management - auto-select first option
	const [selectedValue, setSelectedValue] = useState<string>(
		defaultValue ?? options[0] ?? "",
	);

	// Find active option
	const activeOption = optionObjects.find(
		(option) => option.value === selectedValue,
	);

	const hasHeader = !!label;

	// Handle selection change
	const handleChange = (value: string) => {
		setSelectedValue(value);
		onSelect?.(value);
	};

	// Fire onSelect with initial value on mount
	useEffect(() => {
		if (!hasFiredInitialSelect.current && selectedValue && onSelect) {
			hasFiredInitialSelect.current = true;
			onSelect(selectedValue);
		}
	}, [selectedValue, onSelect]);

	// Measure button width for dropdown matching and detect mobile
	useEffect(() => {
		if (!buttonRef.current) return;

		const updateWidth = () => {
			if (buttonRef.current) {
				setButtonWidth(buttonRef.current.offsetWidth);
				setIsMobile(window.innerWidth < 640);
			}
		};

		updateWidth();
		window.addEventListener("resize", updateWidth);

		return () => {
			window.removeEventListener("resize", updateWidth);
		};
	}, []);

	return (
		<div className={clsx("space-y-2", flexClasses[flex])}>
			<div className={innerWidthClasses[flex]}>
				{hasHeader && <InputHeader htmlFor={selectId} label={label} />}

				<div className="relative mt-1">
					<Listbox
						value={selectedValue}
						onChange={handleChange}
						disabled={disabled}
					>
						<ListboxButton
							ref={buttonRef}
							id={selectId}
							className={clsx(
								// Remove w-full if className contains a width class
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
								{activeOption
									? activeOption.label
									: (placeholder ?? "Select...")}
							</span>
							<span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-zinc-400">
								<IoChevronDown className="h-4 w-4" aria-hidden="true" />
							</span>
						</ListboxButton>
						<Transition
							as={Fragment}
							leave="transition ease-in duration-100"
							leaveFrom="opacity-100"
							leaveTo="opacity-0"
						>
							<ListboxOptions
								anchor="bottom start"
								portal={true}
								modal={false}
								className={clsx(listBaseStyle, listVariantStyles[variant])}
								style={
									buttonWidth
										? {
												width: isMobile
													? "100%"
													: `${Math.max(buttonWidth, 160)}px`,
											}
										: { width: "100%", minWidth: "160px" }
								}
							>
								{optionObjects.map((option) => (
									<ListboxOption
										key={option.value}
										value={option.value}
										className={({ focus, selected, disabled: isDisabled }) =>
											clsx(
												"cursor-pointer rounded-xl px-3 py-2 transition text-zinc-100",
												selected && StyleTheme.Dropdown.OptionSelected,
												focus && !selected && StyleTheme.Dropdown.OptionHover,
												isDisabled && "cursor-not-allowed opacity-50",
											)
										}
									>
										<span className="font-medium">{option.label}</span>
									</ListboxOption>
								))}
							</ListboxOptions>
						</Transition>
					</Listbox>
				</div>
			</div>

			{description && <p className="text-xs text-zinc-500">{description}</p>}

			{errorMessage && (
				<p className="text-xs font-medium text-rose-400">{errorMessage}</p>
			)}
		</div>
	);
}

export default InputSelect;
