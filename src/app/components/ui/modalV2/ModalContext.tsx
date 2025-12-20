"use client";

import { createContext, useContext } from "react";

import type { ModalSize } from "../Modal";

/**
 * Context for ModalV2 component coordination
 * Allows child components to access modal state, close function, and IDs
 */
export interface ModalContextValue {
	/**
	 * Whether the modal is open
	 */
	open: boolean;
	/**
	 * Callback to close the modal
	 */
	onClose: () => void;
	/**
	 * ID of the modal (for manager operations)
	 */
	modalId: string;
	/**
	 * ID for the modal title (for accessibility)
	 */
	titleId?: string;
	/**
	 * ID for the modal description (for accessibility)
	 */
	descriptionId?: string;
	/**
	 * Size of the modal
	 */
	size: ModalSize;
	/**
	 * Depth of nested modals (0 = top level)
	 */
	depth: number;
}

const ModalContext = createContext<ModalContextValue | null>(null);

/**
 * Hook to access ModalV2 context
 * @throws Error if used outside of a ModalV2 component
 */
export function useModalContext(): ModalContextValue {
	const context = useContext(ModalContext);
	if (!context) {
		throw new Error("ModalV2 components must be used within a ModalV2 component");
	}
	return context;
}

/**
 * Provider component for ModalV2 context
 * @internal - Used by ModalContainer component
 */
export const ModalContextProvider = ModalContext.Provider;
