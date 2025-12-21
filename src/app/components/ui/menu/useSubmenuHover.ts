import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hook for managing submenu hover state with a delay
 *
 * Provides open/close handlers for submenu hover interactions.
 * The close action is delayed to prevent flickering when moving between
 * the menu item and submenu panel.
 *
 * @param delay - Delay in milliseconds before closing the submenu (default: 150ms)
 * @returns Object with `isOpen` state and `open`/`close` handlers
 *
 * @example
 * ```tsx
 * const { isOpen, open, close } = useSubmenuHover(150);
 *
 * <div onMouseEnter={open} onMouseLeave={close}>
 *   {isOpen && <SubmenuPanel />}
 * </div>
 * ```
 */
export function useSubmenuHover(delay = 150) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const open = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, delay);
  }, [delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { isOpen, open, close };
}
