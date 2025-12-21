"use client";

import type { ComponentType } from "react";
import { Button } from "../Button";
import ModalV2 from "./ModalV2";
import { ModalRenderQueue } from "./modalRenderQueue";

/**
 * Options for AlertModal
 */
export interface AlertModalOptions {
  /**
   * Title of the alert dialog
   */
  title?: string;
  /**
   * Message/content of the alert dialog
   */
  message: string;
  /**
   * Text for the close button
   * @default 'OK'
   */
  buttonText?: string;
  /**
   * Variant for the button
   * @default 'primary'
   */
  buttonVariant?: "primary" | "secondary" | "danger";
  /**
   * Size of the modal
   * @default 'md'
   */
  size?: "sm" | "md" | "lg" | "xl";
}

/**
 * Registry for tracking pending alert modals
 */
const alertRegistry = new Map<
  string,
  {
    resolve: () => void;
    reject: (reason?: unknown) => void;
  }
>();

let alertCounter = 0;

/**
 * AlertModal component - renders an alert dialog
 * @internal - Used by ModalV2.Alert static method
 */
export function AlertModalComponent({
  id,
  options,
}: {
  id: string;
  options: AlertModalOptions;
}) {
  const handleClose = () => {
    const entry = alertRegistry.get(id);
    if (entry) {
      entry.resolve();
      alertRegistry.delete(id);
    }
    ModalV2.Manager.close(id);
    // Remove from render queue after a short delay to allow transition
    setTimeout(() => {
      ModalRenderQueue.remove(id);
    }, 300);
  };

  return (
    <ModalV2 id={id} size={options.size || "md"}>
      <ModalV2.Header title={options.title || "Alert"} showCloseButton />
      <ModalV2.Body>
        <p className="text-zinc-300">{options.message}</p>
      </ModalV2.Body>
      <ModalV2.Footer align="end">
        <Button
          variant={options.buttonVariant || "primary"}
          onClick={handleClose}
        >
          {options.buttonText || "OK"}
        </Button>
      </ModalV2.Footer>
    </ModalV2>
  );
}

/**
 * AlertModal - Promise-based alert dialog
 *
 * Opens an alert dialog and returns a promise that resolves when the user closes it.
 *
 * @example
 * ```tsx
 * await ModalV2.Alert({
 *   title: "Success",
 *   message: "Your changes have been saved.",
 *   buttonText: "OK"
 * });
 * ```
 */
export async function AlertModal(options: AlertModalOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    const id = `alert-modal-${alertCounter++}`;

    // Store promise resolvers
    alertRegistry.set(id, { resolve, reject });

    // Add to render queue
    ModalRenderQueue.add({
      id,
      component: AlertModalComponent as ComponentType<{
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
