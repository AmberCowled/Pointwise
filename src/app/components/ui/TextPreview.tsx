"use client";

import clsx from "clsx";

export interface TextPreviewProps {
	/**
	 * Text to display. If null/undefined/empty, placeholder will be shown
	 */
	text: string | null | undefined;

	/**
	 * Number of lines to show before truncating
	 * @default 2
	 */
	lines?: number;

	/**
	 * Placeholder text to show when text is empty
	 */
	placeholder?: string;

	/**
	 * Whether to use fixed height (reserves space for all lines even if text is shorter)
	 * @default false
	 */
	fixedHeight?: boolean;

	/**
	 * Text size variant
	 * @default 'sm'
	 */
	size?: "sm" | "md" | "lg";

	/**
	 * Additional CSS classes
	 */
	className?: string;

	/**
	 * Click handler for the text preview
	 */
	onClick?: () => void;
}

const sizeStyles = {
	sm: "text-sm",
	md: "text-base",
	lg: "text-lg",
};

const lineHeightStyles = {
	sm: "leading-5",
	md: "leading-6",
	lg: "leading-7",
};

/**
 * TextPreview - Component for displaying truncated text with ellipsis and optional placeholder
 *
 * **Props:**
 * - `text: string | null | undefined` - Text to display
 * - `lines?: number` - Number of lines before truncating (default: 2)
 * - `placeholder?: string` - Placeholder text when text is empty
 * - `fixedHeight?: boolean` - Use fixed height (default: false)
 * - `size?: "sm" | "md" | "lg"` - Text size variant (default: "sm")
 * - `className?: string` - Additional CSS classes
 *
 * @example
 * ```tsx
 * <TextPreview
 *   text={project.description}
 *   lines={2}
 *   placeholder="Edit project to add a description"
 *   size="sm"
 * />
 * ```
 */
const lineClampStyles: Record<number, string> = {
	1: "line-clamp-1",
	2: "line-clamp-2",
	3: "line-clamp-3",
	4: "line-clamp-4",
	5: "line-clamp-5",
	6: "line-clamp-6",
};

export function TextPreview({
	text,
	lines = 2,
	placeholder,
	fixedHeight = false,
	size = "sm",
	className,
	onClick,
}: TextPreviewProps) {
	const hasText = text && text.trim().length > 0;
	const lineClampClass = lineClampStyles[lines] ?? lineClampStyles[2];

	// Calculate fixed height if needed (approximate line height * number of lines)
	const fixedHeightStyle = fixedHeight
		? {
				minHeight:
					size === "sm"
						? `${lines * 1.25}rem`
						: size === "md"
							? `${lines * 1.5}rem`
							: `${lines * 1.75}rem`,
			}
		: undefined;

	if (!hasText && placeholder) {
		return (
			<p
				className={clsx(
					sizeStyles[size],
					lineHeightStyles[size],
					"text-zinc-500 italic",
					fixedHeight && lineClampClass,
					onClick && "cursor-pointer",
					className,
				)}
				style={fixedHeightStyle}
				onClick={onClick}
				onKeyDown={onClick ? (e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						onClick();
					}
				} : undefined}
				tabIndex={onClick ? 0 : undefined}
			>
				{placeholder}
			</p>
		);
	}

	if (!hasText) {
		return null;
	}

	return (
		<p
			className={clsx(
				sizeStyles[size],
				lineHeightStyles[size],
				lineClampClass,
				onClick && "cursor-pointer",
				className,
			)}
			style={fixedHeightStyle}
			onClick={onClick}
			onKeyDown={onClick ? (e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					onClick();
				}
			} : undefined}
			tabIndex={onClick ? 0 : undefined}
		>
			{text}
		</p>
	);
}
