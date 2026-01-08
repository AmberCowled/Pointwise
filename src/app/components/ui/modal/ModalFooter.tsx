"use client";

import clsx from "clsx";
import type { PropsWithChildren } from "react";
import React from "react";
import { useModalContext } from "./ModalContext";

/**
 * Props for ModalFooter component
 */
export interface ModalFooterProps
	extends PropsWithChildren,
		React.HTMLAttributes<HTMLElement> {
	/**
	 * Alignment of footer content
	 * @default 'between'
	 */
	align?: "start" | "center" | "end" | "between";
	/**
	 * Size variant affecting spacing
	 * @default 'md'
	 */
	size?: "sm" | "md" | "lg";
}

type Alignment = "start" | "center" | "end" | "between";

const paddingStyles: Record<NonNullable<ModalFooterProps["size"]>, string> = {
	sm: "px-4 py-3",
	md: "px-6 py-4",
	lg: "px-8 py-6",
};

const gapStyles: Record<NonNullable<ModalFooterProps["size"]>, string> = {
	sm: "gap-2",
	md: "gap-3",
	lg: "gap-4",
};

/**
 * ModalFooter component for modal actions
 *
 * Automatically detects cancel/close buttons by checking if the button text contains
 * "cancel" or "close" (case-insensitive). If a cancel/close button doesn't have an
 * onClick handler, it will automatically close the modal when clicked. This provides
 * smart close handling.
 *
 * Note: Only buttons with "cancel" or "close" in their text will auto-close. Secondary
 * variant buttons without these texts will not auto-close, allowing you to use secondary
 * buttons for other actions.
 *
 * @example
 * ```tsx
 * // Cancel/Close buttons without onClick will auto-close
 * <Modal.Footer align="end">
 *   <Button variant="secondary">Cancel</Button>
 *   <Button variant="secondary">Close</Button>
 *   <Button variant="secondary" onClick={handleOtherAction}>Other Action</Button>
 *   <Button variant="primary" onClick={onSave}>Save</Button>
 * </Modal.Footer>
 * ```
 */
export function ModalFooter({
	children,
	className,
	align = "between",
	size = "md",
	...props
}: ModalFooterProps) {
	const context = useModalContext();

	const alignmentStyles: Record<Alignment, string> = {
		start: "justify-start",
		center: "justify-center",
		end: "justify-end",
		between: "justify-between",
	};

	const alignmentClass = alignmentStyles[align];

	// Smart close handling: wrap children to detect cancel buttons
	const processedChildren = React.Children.map(children, (child) => {
		if (!child || typeof child !== "object" || !("props" in child))
			return child;

		// Check if this is a button with cancel-like behavior
		const childProps = child.props as {
			children?: unknown;
			variant?: string;
			onClick?: (e: React.MouseEvent) => void;
		};

		// Extract text from children (could be string, number, or nested)
		const getTextContent = (node: unknown): string => {
			if (typeof node === "string" || typeof node === "number")
				return String(node);
			if (Array.isArray(node)) return node.map(getTextContent).join("");
			if (
				node &&
				typeof node === "object" &&
				"props" in node &&
				node.props &&
				typeof node.props === "object" &&
				"children" in node.props
			) {
				return getTextContent((node.props as { children?: unknown }).children);
			}
			return "";
		};

		const textContent = getTextContent(childProps.children);
		// Only detect cancel/close buttons by text content, not by variant
		// This allows secondary buttons to be used for other actions
		const isCancelOrCloseButton =
			textContent.toLowerCase().includes("cancel") ||
			textContent.toLowerCase().includes("close");

		// If it's a cancel/close button (by text) and doesn't have an onClick, add auto-close
		if (isCancelOrCloseButton && !childProps.onClick) {
			return React.cloneElement(
				child as React.ReactElement<{
					onClick?: (e: React.MouseEvent) => void;
				}>,
				{
					onClick: (e: React.MouseEvent) => {
						e.stopPropagation();
						context.onClose();
					},
				},
			);
		}

		return child;
	});

	return (
		<footer
			className={clsx(
				"flex flex-wrap items-center border-t border-white/10",
				paddingStyles[size],
				gapStyles[size],
				alignmentClass,
				className,
			)}
			{...props}
		>
			{processedChildren}
		</footer>
	);
}
