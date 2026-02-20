"use client";

import clsx from "clsx";
import type React from "react";
import { Children, cloneElement, isValidElement, useState } from "react";
import type { IconType } from "react-icons";
import Grid from "./Grid";
import { InputHeader } from "./InputHeader";
import { StyleTheme } from "./StyleTheme";

type SelectorSize = "xs" | "sm" | "md" | "lg" | "xl";
type SelectorFlex = "shrink" | "default" | "grow";

const sizeStyles: Record<
	SelectorSize,
	{ padding: string; textSize: string; iconSize: string }
> = {
	xs: { padding: "px-3 py-2", textSize: "text-xs", iconSize: "w-4 h-4" },
	sm: { padding: "px-3 py-2.5", textSize: "text-sm", iconSize: "w-4 h-4" },
	md: { padding: "px-4 py-3", textSize: "text-sm", iconSize: "w-5 h-5" },
	lg: { padding: "px-5 py-4", textSize: "text-base", iconSize: "w-5 h-5" },
	xl: { padding: "px-6 py-5", textSize: "text-lg", iconSize: "w-6 h-6" },
};

/**
 * Props for SelectorOption component
 */
export interface SelectorOptionProps {
	/**
	 * Value of the option (passed to onChange when selected)
	 */
	value: string;
	/**
	 * Icon to display with the option
	 */
	icon?: IconType;
	/**
	 * Label text displayed to the user
	 */
	label: string;
	/**
	 * Optional description text below the label
	 */
	description?: React.ReactNode;
	/**
	 * Whether this option is disabled
	 */
	disabled?: boolean;
	/**
	 * Additional CSS classes
	 */
	className?: string;
	/**
	 * Size variant (injected by Selector parent)
	 * @internal
	 */
	size?: SelectorSize;
}

/**
 * SelectorOption - Individual option in a Selector
 * @internal - Used internally by Selector component
 */
export function SelectorOption({
	icon: Icon,
	label,
	description,
	className,
	size = "md",
	...props
}: SelectorOptionProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
	const sizeStyle = sizeStyles[size];

	return (
		<button
			type="button"
			className={clsx(
				"flex flex-col items-center justify-center text-center gap-1",
				className,
			)}
			{...props}
		>
			{Icon && (
				<Icon
					className={clsx(sizeStyle.iconSize, "shrink-0")}
					aria-hidden="true"
				/>
			)}
			<span className={clsx("font-medium", sizeStyle.textSize)}>{label}</span>
			{description && (
				<span
					className={clsx(
						`mt-1 ${StyleTheme.Text.Muted}`,
						size === "xs" ? "text-[10px]" : "text-xs",
					)}
				>
					{description}
				</span>
			)}
		</button>
	);
}

/**
 * Props for Selector component
 */
export interface SelectorProps {
	/**
	 * Label text displayed above the selector
	 */
	label?: React.ReactNode;
	/**
	 * Responsive column configuration
	 */
	columns?: {
		default?: number;
		sm?: number;
		md?: number;
		lg?: number;
	};
	/**
	 * Spacing between options
	 * @default 'md'
	 */
	gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
	/**
	 * Size variant affecting button padding and text sizes
	 * @default 'md'
	 */
	size?: SelectorSize;
	/**
	 * Flex behavior for the selector wrapper
	 * @default 'default'
	 */
	flex?: SelectorFlex;
	/**
	 * Whether the selector is required
	 */
	required?: boolean;
	/**
	 * Whether the entire selector is disabled
	 */
	disabled?: boolean;
	/**
	 * Default selected value
	 */
	defaultValue?: string;
	/**
	 * Callback fired when selection changes
	 * @param value - The selected option value
	 */
	onChange?: (value: string) => void;
	/**
	 * Additional CSS classes
	 */
	className?: string;
	/**
	 * Selector.Option components
	 */
	children: React.ReactNode;
}

const flexClasses: Record<SelectorFlex, string> = {
	shrink: "flex-shrink-0",
	default: "",
	grow: "flex-1 min-w-0",
};

const innerWidthClasses: Record<SelectorFlex, string> = {
	shrink: "w-auto",
	default: "inline-block",
	grow: "w-full",
};

const selectedStyles = StyleTheme.Interactive.Selected;
const unselectedStyles = `${StyleTheme.Container.BackgroundEmpty} ${StyleTheme.Container.Border.Primary} ${StyleTheme.Text.Secondary} ${StyleTheme.Hover.BorderLift}`;
const disabledStyles = "opacity-50 cursor-not-allowed";

// Define component type with static Option property
interface SelectorComponent {
	(props: SelectorProps): React.ReactElement;
	Option: typeof SelectorOption;
}

/**
 * Selector - Button-based selection grid component
 *
 * Uncontrolled component that manages its own internal state. Use `onChange` to track value changes
 * in parent components.
 *
 * **Props:**
 * - `label?: ReactNode` - Label text above selector
 * - `columns?: { default?: number; sm?: number; md?: number; lg?: number }` - Responsive column configuration
 * - `gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl"` - Spacing between options (default: "md")
 * - `size?: "xs" | "sm" | "md" | "lg" | "xl"` - Size variant (default: "md")
 * - `flex?: "shrink" | "default" | "grow"` - Flex behavior (default: "default")
 * - `required?: boolean` - Whether selector is required
 * - `disabled?: boolean` - Whether entire selector is disabled
 * - `defaultValue?: string` - Default selected value
 * - `onChange?: (value: string) => void` - Callback fired when selection changes
 *
 * **Sub-components:**
 * - `Selector.Option` - Individual option with value, label, icon, description
 *
 * @example
 * ```tsx
 * const [visibility, setVisibility] = useState("PRIVATE");
 *
 * <Selector
 *   label="Visibility"
 *   columns={{ default: 2 }}
 *   gap="sm"
 *   defaultValue="PRIVATE"
 *   onChange={setVisibility}
 * >
 *   <Selector.Option
 *     value="PRIVATE"
 *     icon={IoLockClosed}
 *     label="Private"
 *     description="Invite only"
 *   />
 *   <Selector.Option
 *     value="PUBLIC"
 *     icon={IoGlobe}
 *     label="Public"
 *     description="Anyone can request"
 *   />
 * </Selector>
 * ```
 */
const Selector = (({
	label,
	columns = { default: 2 },
	gap = "md",
	size = "md",
	flex = "default",
	required,
	disabled = false,
	defaultValue = "",
	onChange,
	className,
	children,
}: SelectorProps) => {
	// Internal state management (uncontrolled component)
	const [selectedValue, setSelectedValue] = useState(defaultValue);

	const sizeStyle = sizeStyles[size];
	const hasLabel = !!label || !!required;

	const handleOptionClick = (value: string, optionDisabled?: boolean) => {
		if (disabled || optionDisabled) return;
		setSelectedValue(value);
		onChange?.(value);
	};

	// Clone children and inject selection state and handlers
	const options = Children.map(children, (child) => {
		if (
			!isValidElement<SelectorOptionProps>(child) ||
			child.type !== SelectorOption
		) {
			return child;
		}

		const optionValue = child.props.value;
		const isSelected = selectedValue === optionValue;
		const optionDisabled = disabled || child.props.disabled;

		return cloneElement(child, {
			...child.props,
			size, // Pass size prop for styling
			className: clsx(
				"w-full rounded-xl border transition-colors",
				sizeStyle.padding,
				isSelected ? selectedStyles : unselectedStyles,
				optionDisabled && disabledStyles,
				!optionDisabled && "cursor-pointer",
				child.props.className,
			),
			onClick: () => handleOptionClick(optionValue, child.props.disabled),
			onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					handleOptionClick(optionValue, child.props.disabled);
				}
			},
			tabIndex: optionDisabled ? -1 : 0,
			"aria-pressed": isSelected,
			"aria-disabled": optionDisabled,
		} as SelectorOptionProps & React.ButtonHTMLAttributes<HTMLButtonElement>);
	});

	return (
		<div className={clsx("space-y-2", flexClasses[flex], className)}>
			<div className={innerWidthClasses[flex]}>
				{hasLabel && <InputHeader label={label} required={required} />}

				<div className="mt-1">
					<Grid columns={columns} gap={gap}>
						{options}
					</Grid>
				</div>
			</div>
		</div>
	);
}) as unknown as SelectorComponent;

// Attach Option as static property
Selector.Option = SelectorOption;

export default Selector;
