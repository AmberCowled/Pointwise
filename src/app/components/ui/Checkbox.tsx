"use client";

import clsx from "clsx";
import type React from "react";
import { forwardRef, useId, useState } from "react";

import { InputHeader } from "./InputHeader";
import { StyleTheme } from "./StyleTheme";

export type CheckboxVariants = "primary" | "secondary" | "danger";
export type CheckboxSizes = "xs" | "sm" | "md" | "lg" | "xl";

/**
 * Custom props for the Checkbox component
 */
export interface CheckboxCustomProps {
	variant?: CheckboxVariants;
	size?: CheckboxSizes;
	error?: boolean | string;
	label?: React.ReactNode;
	description?: React.ReactNode;
	required?: boolean;
	/**
	 * Default checked state (uncontrolled component)
	 * @default false
	 */
	defaultChecked?: boolean;
	/**
	 * Callback fired when the checkbox checked state changes
	 * Receives the new checked state as a boolean (not the event)
	 * @param value - The new checked state
	 */
	onChange?: (value: boolean) => void;
}

/**
 * Props for the Checkbox component
 */
export interface CheckboxProps
	extends CheckboxCustomProps,
		Omit<
			React.InputHTMLAttributes<HTMLInputElement>,
			"size" | "type" | "onChange" | "checked" | "defaultChecked"
		> {}

const baseStyle =
	"appearance-none cursor-pointer border transition focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed";

const variantStyles: Record<CheckboxVariants, string> = {
	primary: `${StyleTheme.Container.Border.Primary} ${StyleTheme.Container.BackgroundInput} ${StyleTheme.Interactive.CheckedPrimary}`,
	secondary: `${StyleTheme.Container.Border.Primary} ${StyleTheme.Container.BackgroundInputSecondary} ${StyleTheme.Interactive.CheckedSecondary}`,
	danger: `${StyleTheme.Container.Border.DangerStrong} ${StyleTheme.Container.BackgroundDangerSubtle} ${StyleTheme.Interactive.CheckedDanger}`,
};

const variantFocusStyles: Record<CheckboxVariants, string> = {
	primary: `${StyleTheme.Accent.FocusBorderPrimary} focus:ring-indigo-500/40`,
	secondary: `${StyleTheme.Accent.FocusBorderSecondary} focus:ring-fuchsia-500/30`,
	danger: `${StyleTheme.Accent.FocusBorderDanger} focus:ring-rose-500/40`,
};

const variantHoverStyles: Record<CheckboxVariants, string> = {
	primary: StyleTheme.Hover.BorderLift,
	secondary: StyleTheme.Hover.BorderLiftSecondary,
	danger: StyleTheme.Hover.DangerBorder,
};

const sizeStyles: Record<CheckboxSizes, string> = {
	xs: "w-3 h-3 rounded",
	sm: "w-4 h-4 rounded",
	md: "w-5 h-5 rounded-md",
	lg: "w-6 h-6 rounded-md",
	xl: "w-7 h-7 rounded-lg",
};

const variantDisabledStyles: Record<CheckboxVariants, string> = {
	primary: "opacity-50",
	secondary: "opacity-50",
	danger: "opacity-50",
};

const variantErrorStyles: Record<CheckboxVariants, string> = {
	primary: `${StyleTheme.ErrorBorder.Primary} ${StyleTheme.Accent.FocusRingDanger}`,
	secondary: `${StyleTheme.ErrorBorder.Secondary} ${StyleTheme.Accent.FocusRingDanger}`,
	danger: `${StyleTheme.ErrorBorder.Danger} focus:ring-rose-500/50`,
};

// Checkmark icon styles based on size
const checkmarkStyles: Record<CheckboxSizes, string> = {
	xs: "w-1.5 h-1.5",
	sm: "w-2 h-2",
	md: "w-2.5 h-2.5",
	lg: "w-3 h-3",
	xl: "w-3.5 h-3.5",
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
	function Checkbox(
		{
			variant = "primary",
			size = "md",
			error,
			label,
			description,
			required,
			className,
			id,
			disabled,
			defaultChecked = false,
			onChange,
			...props
		}: CheckboxProps,
		ref,
	) {
		const generatedId = useId();
		const checkboxId = id || generatedId;
		const errorMessage = typeof error === "string" ? error : undefined;
		const hasHeader = !!required && !label;

		// Internal state management (uncontrolled component)
		const [checked, setChecked] = useState(defaultChecked);

		const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const newChecked = e.target.checked;
			setChecked(newChecked);
			onChange?.(newChecked);
		};

		return (
			<div className="space-y-2">
				<div className="inline-block">
					{hasHeader && (
						<InputHeader htmlFor={checkboxId} required={required} />
					)}

					<div
						className={clsx(
							"relative flex items-center gap-3",
							hasHeader && "mt-1",
						)}
					>
						<div className="relative flex items-center justify-center">
							<input
								{...props}
								id={checkboxId}
								ref={ref}
								type="checkbox"
								disabled={disabled}
								required={required}
								checked={checked}
								onChange={handleChange}
								className={clsx(
									baseStyle,
									"peer",
									variantStyles[variant],
									sizeStyles[size],
									disabled && variantDisabledStyles[variant],
									!disabled && error && variantErrorStyles[variant],
									!disabled && !error && variantFocusStyles[variant],
									!disabled && !error && variantHoverStyles[variant],
									className,
								)}
							/>

							{/* Custom checkmark */}
							<svg
								aria-hidden="true"
								className={clsx(
									"absolute pointer-events-none text-white opacity-0 transition-opacity peer-checked:opacity-100",
									checkmarkStyles[size],
								)}
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={3}
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</div>
						{label && (
							<label
								htmlFor={checkboxId}
								className={clsx(
									"text-sm text-zinc-100 cursor-pointer select-none",
									disabled && "opacity-50 cursor-not-allowed",
									size === "xs" && "text-xs",
									size === "sm" && "text-sm",
									size === "md" && "text-sm",
									size === "lg" && "text-base",
									size === "xl" && "text-lg",
								)}
							>
								{label}
							</label>
						)}
					</div>
				</div>

				{description && <p className="text-xs text-zinc-500">{description}</p>}

				{errorMessage && (
					<p className="text-xs font-medium text-rose-400">{errorMessage}</p>
				)}
			</div>
		);
	},
);

Checkbox.displayName = "Checkbox";
