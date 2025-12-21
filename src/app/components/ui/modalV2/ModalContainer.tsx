"use client";

import { Dialog, Transition } from "@headlessui/react";
import clsx from "clsx";
import type { PropsWithChildren } from "react";
import { Fragment, useEffect, useId, useImperativeHandle, useRef, useState } from "react";

import type { ModalAnimation, ModalSize } from "../Modal";
import { ModalOverlay } from "../ModalOverlay";
import { ModalPanel } from "../ModalPanel";
import { Spinner } from "../Spinner";
import { ModalContextProvider, type ModalContextValue } from "./ModalContext";
import { ModalManager, type ModalRef } from "./ModalManager";

/**
 * Props for ModalContainer component
 */
export interface ModalContainerProps extends PropsWithChildren {
	/**
	 * Unique ID for this modal (required for manager operations)
	 */
	id: string;
	/**
	 * Size of the modal
	 * @default 'md'
	 */
	size?: ModalSize;
	/**
	 * Element to focus when modal opens
	 */
	initialFocusRef?: React.RefObject<HTMLElement>;
	/**
	 * Custom className for the dialog container
	 */
	className?: string;
	/**
	 * Custom className for the dialog panel
	 */
	panelClassName?: string;
	/**
	 * Custom className for the overlay
	 */
	overlayClassName?: string;
	/**
	 * ID for the modal title (for accessibility)
	 */
	titleId?: string;
	/**
	 * ID for the modal description (for accessibility)
	 */
	descriptionId?: string;
	/**
	 * Whether clicking the overlay should close the modal
	 * @default true
	 */
	closeOnOverlayClick?: boolean;
	/**
	 * Whether pressing Escape should close the modal
	 * @default true
	 */
	closeOnEscape?: boolean;
	/**
	 * Custom transition durations for modal animations
	 */
	transitionDuration?: {
		/**
		 * Duration for enter animation in milliseconds
		 * @default 200
		 */
		enter?: number;
		/**
		 * Duration for leave animation in milliseconds
		 * @default 150
		 */
		leave?: number;
	};
	/**
	 * Animation preset style
	 * @default 'scale' for standard modals, 'slide' for fullscreen
	 */
	animation?: ModalAnimation;
	/**
	 * Whether to show a loading overlay
	 * @default false
	 */
	loading?: boolean;
	/**
	 * Optional message to display with the loading spinner
	 */
	loadingMessage?: string;
	/**
	 * Callback fired when modal opens
	 */
	onOpen?: () => void;
	/**
	 * Callback fired after modal closes (after transition completes)
	 */
	onAfterClose?: () => void;
	/**
	 * Custom z-index for the modal
	 * @default 50
	 */
	zIndex?: number;
	/**
	 * Whether to trap focus within the modal
	 * @default true
	 */
	focusTrap?: boolean;
	/**
	 * Ref to expose imperative handle for ModalManager
	 */
	modalRef?: React.RefObject<ModalRef>;
}

/**
 * ModalContainer - Low-level modal container with self-managed state
 *
 * This component manages its own open/close state and automatically
 * registers with ModalManager when mounted. It uses Headless UI Dialog
 * under the hood and supports all standard modal features.
 *
 * @internal - Used by ModalV2 component
 */
export function ModalContainer({
	id,
	size = "md",
	initialFocusRef,
	className,
	panelClassName,
	overlayClassName,
	titleId,
	descriptionId,
	closeOnOverlayClick = true,
	closeOnEscape = true,
	transitionDuration,
	animation,
	loading = false,
	loadingMessage,
	onOpen,
	onAfterClose,
	zIndex = 50,
	focusTrap = true,
	children,
	modalRef,
}: ModalContainerProps) {
	const [open, setOpen] = useState(false);
	const openRef = useRef(open);
	const isFullscreen = size === "fullscreen";

	// Keep ref in sync with state
	useEffect(() => {
		openRef.current = open;
	}, [open]);

	// Default animation: scale for standard, slide for fullscreen
	const defaultAnimation = isFullscreen ? "slide" : "scale";
	const finalAnimation = animation ?? defaultAnimation;

	// Animation durations
	const enterDuration = transitionDuration?.enter ?? 200;
	const leaveDuration = transitionDuration?.leave ?? 150;

	// Generate IDs for accessibility if not provided
	const generatedTitleId = useId();
	const generatedDescriptionId = useId();
	const finalTitleId = titleId || generatedTitleId;
	const finalDescriptionId = descriptionId || generatedDescriptionId;

	// Get parent modal depth from context (for nested modals)
	// Note: useModalContext will throw if not in a context, but we can't use hooks conditionally
	// For now, we'll assume we're at the root level (depth 0)
	// Nested modals would need a different approach, but for the initial implementation
	// we'll start with depth 0 for all modals
	const parentDepth = -1;

	const currentDepth = parentDepth + 1;

	// Calculate z-index based on depth (each nested modal increases z-index by 10)
	const calculatedZIndex = zIndex + currentDepth * 10;

	// Imperative handle for ModalManager
	useImperativeHandle(
		modalRef,
		() => ({
			open: (options?: Record<string, unknown>) => {
				setOpen(true);
				// Store options for potential future use
				if (options) {
					// Could store in a ref or state for child components to access
				}
			},
			close: () => {
				setOpen(false);
			},
			isOpen: () => openRef.current,
		}),
		[],
	);

	// Register/unregister with ModalManager
	useEffect(() => {
		const ref: ModalRef = {
			open: (options?: Record<string, unknown>) => {
				setOpen(true);
				// Store options for potential future use
				if (options) {
					// Could store in a ref or state for child components to access
				}
			},
			close: () => {
				setOpen(false);
			},
			isOpen: () => openRef.current,
		};

		ModalManager.registerModal(id, ref);

		return () => {
			ModalManager.unregisterModal(id);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]); // Only re-register if id changes, not when open changes

	// Create context value for child components
	const contextValue: ModalContextValue = {
		open,
		onClose: () => setOpen(false),
		modalId: id,
		titleId: finalTitleId,
		descriptionId: finalDescriptionId,
		size,
		depth: currentDepth,
	};

	// Body scroll lock - prevent background scrolling when modal is open
	useEffect(() => {
		if (open) {
			// Store original overflow value
			const originalOverflow = document.body.style.overflow;
			document.body.style.overflow = "hidden";

			// Call onOpen callback
			onOpen?.();

			return () => {
				// Restore original overflow on cleanup
				document.body.style.overflow = originalOverflow;
			};
		} else {
			// Call onAfterClose after a delay to allow transition to complete
			if (onAfterClose) {
				const timeout = setTimeout(
					() => {
						onAfterClose();
					},
					Math.max(enterDuration, leaveDuration),
				);
				return () => clearTimeout(timeout);
			}
		}
	}, [open, onOpen, onAfterClose, enterDuration, leaveDuration]);

	// Determine if modal should be static (non-closable via user interaction)
	const isStatic = !closeOnOverlayClick && !closeOnEscape;

	// Focus management: if focusTrap is false, make modal static (disables focus trap)
	const shouldDisableFocusTrap = !focusTrap;

	// Handle Escape key - prevent if disabled
	useEffect(() => {
		if (!open || closeOnEscape || isStatic) return;

		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.preventDefault();
				e.stopPropagation();
			}
		};

		// Capture phase to intercept before Headless UI
		document.addEventListener("keydown", handleEscape, true);
		return () => {
			document.removeEventListener("keydown", handleEscape, true);
		};
	}, [open, closeOnEscape, isStatic]);

	// Handle close from Dialog (overlay click, Escape, or programmatic)
	const handleClose = () => {
		// Only close if overlay click is enabled
		// Escape is prevented in the effect above if disabled
		if (closeOnOverlayClick) {
			setOpen(false);
		}
	};

	// Responsive sizing: on mobile, modals should be full width with padding
	// On larger screens, use the specified max-width
	const responsiveSizeStyles: Record<ModalSize, string> = {
		sm: "w-full sm:max-w-sm",
		md: "w-full sm:max-w-md",
		lg: "w-full sm:max-w-lg",
		xl: "w-full sm:max-w-xl",
		"2xl": "w-full sm:max-w-2xl",
		"6xl": "w-full sm:max-w-6xl",
		fullscreen: "max-w-full h-screen",
	};

	// Shared Dialog wrapper
	const dialogContent = (
		<Dialog
			as="div"
			className={clsx("relative", className)}
			style={{ zIndex: calculatedZIndex }}
			onClose={isStatic ? () => {} : handleClose}
			static={isStatic || shouldDisableFocusTrap}
			initialFocus={initialFocusRef}
		>
			<ModalOverlay
				className={overlayClassName}
				enterDuration={enterDuration}
				leaveDuration={leaveDuration}
			/>

			{isFullscreen ? (
				<div className="fixed inset-0 overflow-y-auto">
					<div className="flex min-h-full items-start justify-center">
						<ModalPanel
							isFullscreen={true}
							className={panelClassName}
							animation={finalAnimation}
							enterDuration={enterDuration}
							leaveDuration={leaveDuration}
							titleId={finalTitleId}
							descriptionId={finalDescriptionId}
						>
							{children}
							{loading && (
								<div
									className="absolute inset-0 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm"
									style={{ zIndex: calculatedZIndex + 1 }}
								>
									<div className="flex flex-col items-center gap-3">
										<Spinner size="lg" variant="primary" />
										{loadingMessage && <p className="text-sm text-zinc-300">{loadingMessage}</p>}
									</div>
								</div>
							)}
						</ModalPanel>
					</div>
				</div>
			) : (
				<div className="fixed inset-0 overflow-y-auto" style={{ zIndex: calculatedZIndex }}>
					<div className="flex min-h-full items-center justify-center p-4">
						<ModalPanel
							isFullscreen={false}
							className={panelClassName}
							sizeClassName={responsiveSizeStyles[size]}
							animation={finalAnimation}
							enterDuration={enterDuration}
							leaveDuration={leaveDuration}
							titleId={finalTitleId}
							descriptionId={finalDescriptionId}
						>
							{children}
							{loading && (
								<div
									className="absolute inset-0 flex items-center justify-center rounded-2xl bg-zinc-950/80 backdrop-blur-sm"
									style={{ zIndex: calculatedZIndex + 1 }}
								>
									<div className="flex flex-col items-center gap-3">
										<Spinner size="lg" variant="primary" />
										{loadingMessage && <p className="text-sm text-zinc-300">{loadingMessage}</p>}
									</div>
								</div>
							)}
						</ModalPanel>
					</div>
				</div>
			)}
		</Dialog>
	);

	return (
		<ModalContextProvider value={contextValue}>
			<Transition show={open} as={Fragment}>
				{dialogContent}
			</Transition>
		</ModalContextProvider>
	);
}
