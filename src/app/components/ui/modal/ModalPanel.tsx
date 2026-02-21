"use client";

import { DialogPanel, TransitionChild } from "@headlessui/react";
import clsx from "clsx";
import type { PropsWithChildren } from "react";
import { Fragment } from "react";

import { StyleTheme } from "../StyleTheme";
import type { ModalAnimation } from "./ModalContainer";

interface ModalPanelProps extends PropsWithChildren {
	/**
	 * Whether this is a fullscreen modal
	 */
	isFullscreen: boolean;
	/**
	 * Whether to go fullscreen on mobile (below sm breakpoint)
	 */
	mobileFullscreen?: boolean;
	/**
	 * Custom className for the panel
	 */
	className?: string;
	/**
	 * Size-specific styles (for non-fullscreen modals)
	 */
	sizeClassName?: string;
	/**
	 * Animation preset
	 */
	animation: ModalAnimation;
	/**
	 * Enter animation duration in milliseconds
	 */
	enterDuration: number;
	/**
	 * Leave animation duration in milliseconds
	 */
	leaveDuration: number;
	/**
	 * ID for the modal title (for accessibility)
	 */
	titleId?: string;
	/**
	 * ID for the modal description (for accessibility)
	 */
	descriptionId?: string;
}

/**
 * Animation style configurations
 */
const animationStyles: Record<
	ModalAnimation,
	{
		enterFrom: string;
		enterTo: string;
		leaveFrom: string;
		leaveTo: string;
	}
> = {
	fade: {
		enterFrom: "opacity-0",
		enterTo: "opacity-100",
		leaveFrom: "opacity-100",
		leaveTo: "opacity-0",
	},
	slide: {
		enterFrom: "opacity-0 translate-y-6",
		enterTo: "opacity-100 translate-y-0",
		leaveFrom: "opacity-100 translate-y-0",
		leaveTo: "opacity-0 translate-y-6",
	},
	scale: {
		enterFrom: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95",
		enterTo: "opacity-100 translate-y-0 sm:scale-100",
		leaveFrom: "opacity-100 translate-y-0 sm:scale-100",
		leaveTo: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95",
	},
	none: {
		enterFrom: "",
		enterTo: "",
		leaveFrom: "",
		leaveTo: "",
	},
};

/**
 * ModalPanel component - handles panel transition and rendering
 * @internal - Used by Modal component
 */
export function ModalPanel({
	isFullscreen,
	mobileFullscreen,
	className,
	sizeClassName,
	animation,
	enterDuration,
	leaveDuration,
	titleId,
	descriptionId,
	children,
}: ModalPanelProps) {
	const anim = animationStyles[animation];
	const hasAnimation = animation !== "none";

	// Fullscreen panel animation
	if (isFullscreen) {
		return (
			<TransitionChild
				as={Fragment}
				enter={hasAnimation ? "ease-out" : ""}
				enterFrom={anim.enterFrom}
				enterTo={anim.enterTo}
				leave={hasAnimation ? "ease-in" : ""}
				leaveFrom={anim.leaveFrom}
				leaveTo={anim.leaveTo}
			>
				<DialogPanel
					className={clsx(
						`relative flex h-dvh w-full max-w-full flex-col ${StyleTheme.Container.BackgroundSolid} ${StyleTheme.Text.Primary} ${StyleTheme.Container.Shadow}`,
						className,
					)}
					style={
						{
							"--enter-duration": `${enterDuration}ms`,
							"--leave-duration": `${leaveDuration}ms`,
							transitionDuration: "var(--enter-duration)",
						} as React.CSSProperties
					}
					aria-labelledby={titleId}
					aria-describedby={descriptionId}
				>
					{children}
				</DialogPanel>
			</TransitionChild>
		);
	}

	// Standard centered panel animation
	return (
		<TransitionChild
			as={Fragment}
			enter={hasAnimation ? "ease-out" : ""}
			enterFrom={anim.enterFrom}
			enterTo={anim.enterTo}
			leave={hasAnimation ? "ease-in" : ""}
			leaveFrom={anim.leaveFrom}
			leaveTo={anim.leaveTo}
		>
			<DialogPanel
				className={clsx(
					`relative w-full transform overflow-hidden rounded-2xl border ${StyleTheme.Container.Border.Primary} ${StyleTheme.Container.BackgroundSolid} ${StyleTheme.Text.Primary} ${StyleTheme.Container.Shadow} transition-all`,
					sizeClassName,
					mobileFullscreen &&
						"max-sm:h-dvh max-sm:max-w-full max-sm:rounded-none max-sm:border-0 max-sm:flex max-sm:flex-col",
					className,
				)}
				style={
					{
						"--enter-duration": `${enterDuration}ms`,
						"--leave-duration": `${leaveDuration}ms`,
						transitionDuration: "var(--enter-duration)",
					} as React.CSSProperties
				}
				aria-labelledby={titleId}
				aria-describedby={descriptionId}
			>
				{children}
			</DialogPanel>
		</TransitionChild>
	);
}
