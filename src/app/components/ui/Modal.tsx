'use client';

import { Dialog, Transition } from '@headlessui/react';
import clsx from 'clsx';
import type { PropsWithChildren } from 'react';
import { Fragment, useEffect, useId } from 'react';

import {
  ModalContextProvider,
  type ModalContextValue,
  useModalContext,
} from './ModalContext';
import { ModalOverlay } from './ModalOverlay';
import { ModalPanel } from './ModalPanel';
import { Spinner } from './Spinner';

/**
 * Modal size variants
 */
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';

/**
 * Modal animation presets
 */
export type ModalAnimation = 'fade' | 'slide' | 'scale' | 'none';

/**
 * Props for the Modal component
 */
export interface ModalProps extends PropsWithChildren {
  /**
   * Whether the modal is open
   */
  open: boolean;
  /**
   * Callback when modal should close
   */
  onClose: () => void;
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
   * Whether to return focus to the element that opened the modal
   * Note: Headless UI automatically handles returnFocus when modal closes.
   * This prop is kept for API consistency but behavior is controlled by focusTrap.
   * @default true
   */
  returnFocus?: boolean;
  /**
   * Note: Headless UI Dialog automatically portals modals to document.body.
   * Portal customization is not directly supported in Headless UI v2.
   * If you need custom portal behavior, consider using a wrapper component.
   */
}

/**
 * Modal component - supports both centered and fullscreen modes
 *
 * Use `size="fullscreen"` for fullscreen modals (replaces FullScreenModal).
 *
 * @example
 * ```tsx
 * // Standard centered modal
 * <Modal open={isOpen} onClose={() => setIsOpen(false)} size="lg">
 *   <ModalHeader title="Example Modal" />
 *   <ModalBody>Content here</ModalBody>
 *   <ModalFooter>Actions here</ModalFooter>
 * </Modal>
 *
 * // Fullscreen modal
 * <Modal open={isOpen} onClose={() => setIsOpen(false)} size="fullscreen">
 *   <ModalHeader title="Full Screen Modal" />
 *   <ModalBody>Content here</ModalBody>
 *   <ModalFooter>Actions here</ModalFooter>
 * </Modal>
 * ```
 */
export function Modal({
  open,
  onClose,
  size = 'md',
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
  returnFocus = true, // Note: Headless UI handles returnFocus automatically
  children,
}: ModalProps) {
  const isFullscreen = size === 'fullscreen';

  // Default animation: scale for standard, slide for fullscreen
  const defaultAnimation = isFullscreen ? 'slide' : 'scale';
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
  let parentDepth = -1;
  try {
    const parentContext = useModalContext();
    parentDepth = parentContext.depth;
  } catch {
    // Not in a parent modal, this is top level
  }

  const currentDepth = parentDepth + 1;

  // Calculate z-index based on depth (each nested modal increases z-index by 10)
  const calculatedZIndex = zIndex + currentDepth * 10;

  // Create context value for child components
  const contextValue: ModalContextValue = {
    open,
    onClose,
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
      document.body.style.overflow = 'hidden';

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
  // Note: Headless UI automatically handles returnFocus when modal closes.
  // Disabling focusTrap also affects returnFocus behavior.
  // The returnFocus prop is kept for API consistency but is handled automatically.
  const shouldDisableFocusTrap = !focusTrap;

  // Suppress unused variable warning - returnFocus is for API consistency
  void returnFocus;

  // Handle Escape key - prevent if disabled
  useEffect(() => {
    if (!open || closeOnEscape || isStatic) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Capture phase to intercept before Headless UI
    document.addEventListener('keydown', handleEscape, true);
    return () => {
      document.removeEventListener('keydown', handleEscape, true);
    };
  }, [open, closeOnEscape, isStatic]);

  // Handle close from Dialog (overlay click, Escape, or programmatic)
  const handleClose = () => {
    // Only close if overlay click is enabled
    // Escape is prevented in the effect above if disabled
    if (closeOnOverlayClick) {
      onClose();
    }
  };

  // Responsive sizing: on mobile, modals should be full width with padding
  // On larger screens, use the specified max-width
  const responsiveSizeStyles: Record<ModalSize, string> = {
    sm: 'w-full sm:max-w-sm',
    md: 'w-full sm:max-w-md',
    lg: 'w-full sm:max-w-lg',
    xl: 'w-full sm:max-w-xl',
    fullscreen: 'max-w-full h-screen',
  };

  // Shared Dialog wrapper
  const dialogContent = (
    <Dialog
      as="div"
      className={clsx('relative', className)}
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
                    {loadingMessage && (
                      <p className="text-sm text-zinc-300">{loadingMessage}</p>
                    )}
                  </div>
                </div>
              )}
            </ModalPanel>
          </div>
        </div>
      ) : (
        <div
          className="fixed inset-0 overflow-y-auto"
          style={{ zIndex: calculatedZIndex }}
        >
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
                    {loadingMessage && (
                      <p className="text-sm text-zinc-300">{loadingMessage}</p>
                    )}
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
