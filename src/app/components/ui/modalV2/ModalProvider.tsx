"use client";

import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";
import { ModalRenderQueue, type QueuedModal } from "./modalRenderQueue";

/**
 * ModalProvider - Provides context for modal management and renders dynamic modals
 *
 * This component should be placed at the app root (in layout.tsx).
 * It provides context for managing modal state, z-index stacking, and renders
 * dynamically queued modals (like those from ModalV2.Confirm, etc.).
 *
 * @example
 * ```tsx
 * // In layout.tsx
 * <ModalProvider>
 *   {children}
 * </ModalProvider>
 * ```
 */
export function ModalProvider({ children }: PropsWithChildren) {
  const [queuedModals, setQueuedModals] = useState<QueuedModal[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Mark as mounted to prevent hydration mismatch
    setIsMounted(true);

    const updateModals = () => {
      setQueuedModals(ModalRenderQueue.getAll());
    };

    updateModals();
    const unsubscribe = ModalRenderQueue.subscribe(updateModals);

    return unsubscribe;
  }, []);

  return (
    <>
      {children}
      {isMounted &&
        queuedModals.map((modal) => {
          const Component = modal.component;
          return <Component key={modal.id} id={modal.id} {...modal.props} />;
        })}
    </>
  );
}
