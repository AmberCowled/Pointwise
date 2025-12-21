"use client";

import { Modal, ModalFooter, ModalHeader } from "../../../ui/modals";
import { useNotifications } from "../../../ui/NotificationProvider";
import type { TaskFormValues } from "./types";

type ConvertToOnetimeModalProps = {
  open: boolean;
  pendingSubmission: TaskFormValues | null;
  onClose: () => void;
  onCancel: () => void;
  onSubmit?: (values: TaskFormValues) => Promise<void> | void;
  onSuccess?: () => void;
};

export function ConvertToOnetimeModal({
  open,
  pendingSubmission,
  onClose,
  onCancel,
  onSubmit,
  onSuccess,
}: ConvertToOnetimeModalProps) {
  const { showNotification } = useNotifications();

  return (
    <Modal open={open} onClose={onCancel} size="sm" zIndex={60}>
      <ModalHeader
        title="Convert to one-time task?"
        subtitle="Converting a recurring task to a one-time task will delete all other tasks in the series. This action cannot be undone."
        showCloseButton
        onClose={onCancel}
      />
      <ModalFooter align="end">
        <button
          className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-zinc-400/60 hover:text-white"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="rounded-full border border-rose-500/40 px-4 py-2 text-sm font-medium text-rose-300 transition hover:bg-rose-500/30 hover:text-white"
          onClick={async () => {
            if (pendingSubmission) {
              try {
                await onSubmit?.(pendingSubmission);
                onClose();
                onSuccess?.();
              } catch (error) {
                const message =
                  error instanceof Error
                    ? error.message
                    : "Failed to update task. Please try again.";
                console.error("Failed to update task", error);
                showNotification({
                  message,
                  variant: "error",
                });
              }
            }
          }}
        >
          Convert
        </button>
      </ModalFooter>
    </Modal>
  );
}
