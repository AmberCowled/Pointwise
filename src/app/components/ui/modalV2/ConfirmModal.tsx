"use client";

import type { ComponentType } from "react";
import { Button } from "../Button";
import ModalV2 from "./ModalV2";
import { ModalRenderQueue } from "./modalRenderQueue";

/**
 * Options for ConfirmModal
 */
export interface ConfirmModalOptions {
  /**
   * Title of the confirm dialog
   */
  title?: string;
  /**
   * Message/content of the confirm dialog
   */
  message: string;
  /**
   * Text for the confirm button
   * @default 'Confirm'
   */
  confirmText?: string;
  /**
   * Text for the cancel button
   * @default 'Cancel'
   */
  cancelText?: string;
  /**
   * Variant for the confirm button
   * @default 'primary'
   */
  confirmVariant?: "primary" | "secondary" | "danger";
  /**
   * Variant for the cancel button
   * @default 'secondary'
   */
  cancelVariant?: "primary" | "secondary" | "danger";
  /**
   * Size of the modal
   * @default 'md'
   */
  size?: "sm" | "md" | "lg" | "xl";
}

/**
 * Registry for tracking pending confirm modals
 */
const confirmRegistry = new Map<
  string,
  {
    resolve: (value: boolean) => void;
    reject: (reason?: unknown) => void;
  }
>();

let confirmCounter = 0;

/**
 * ConfirmModal component - renders a confirm dialog
 * @internal - Used by ModalV2.Confirm static method
 */
export function ConfirmModalComponent({
  id,
  options,
}: {
  id: string;
  options: ConfirmModalOptions;
}) {
  const handleConfirm = () => {
    const entry = confirmRegistry.get(id);
    if (entry) {
      entry.resolve(true);
      confirmRegistry.delete(id);
    }
    ModalV2.Manager.close(id);
    // Remove from render queue after a short delay to allow transition
    setTimeout(() => {
      ModalRenderQueue.remove(id);
    }, 300);
  };

  const handleCancel = () => {
    const entry = confirmRegistry.get(id);
    if (entry) {
      entry.resolve(false);
      confirmRegistry.delete(id);
    }
    ModalV2.Manager.close(id);
    // Remove from render queue after a short delay to allow transition
    setTimeout(() => {
      ModalRenderQueue.remove(id);
    }, 300);
  };

  return (
    <ModalV2 id={id} size={options.size || "md"}>
      <ModalV2.Header title={options.title || "Confirm"} showCloseButton />
      <ModalV2.Body>
        <p className="text-zinc-300">{options.message}</p>
      </ModalV2.Body>
      <ModalV2.Footer align="end">
        <Button
          variant={options.cancelVariant || "secondary"}
          onClick={handleCancel}
        >
          {options.cancelText || "Cancel"}
        </Button>
        <Button
          variant={options.confirmVariant || "primary"}
          onClick={handleConfirm}
        >
          {options.confirmText || "Confirm"}
        </Button>
      </ModalV2.Footer>
    </ModalV2>
  );
}

/**
 * ConfirmModal - Promise-based confirm dialog
 *
 * Opens a confirm dialog and returns a promise that resolves to:
 * - `true` if the user clicks confirm
 * - `false` if the user clicks cancel or closes the modal
 *
 * @example
 * ```tsx
 * const confirmed = await ModalV2.Confirm({
 *   title: "Delete Project",
 *   message: "Are you sure you want to delete this project?",
 *   confirmText: "Delete",
 *   cancelText: "Cancel",
 *   confirmVariant: "danger"
 * });
 *
 * if (confirmed) {
 *   await deleteProject();
 * }
 * ```
 */
export async function ConfirmModal(
  options: ConfirmModalOptions,
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const id = `confirm-modal-${confirmCounter++}`;

    // Store promise resolvers
    confirmRegistry.set(id, { resolve, reject });

    // Add to render queue
    ModalRenderQueue.add({
      id,
      component: ConfirmModalComponent as ComponentType<{
        id: string;
        [key: string]: unknown;
      }>,
      props: { options },
    });

    // Open the modal via manager
    setTimeout(() => {
      ModalV2.Manager.open(id);
    }, 0);
  });
}
