'use client';

import { createContext, useContext } from 'react';

import type { ModalSize } from './Modal';

/**
 * Context for Modal component coordination
 * Allows child components to access modal state and IDs
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
 * Hook to access Modal context
 * @throws Error if used outside of a Modal component
 */
export function useModalContext(): ModalContextValue {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('Modal components must be used within a Modal component');
  }
  return context;
}

/**
 * Provider component for Modal context
 * @internal - Used by Modal component
 */
export const ModalContextProvider = ModalContext.Provider;
