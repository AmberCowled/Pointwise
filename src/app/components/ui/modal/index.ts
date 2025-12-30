// Modal - default export (high-level wrapper with all static properties)

export type { AlertModalOptions } from "./AlertModal";
export { AlertModal } from "./AlertModal";
export type { ConfirmModalOptions } from "./ConfirmModal";
// Built-in modals (also available as Modal.Confirm, etc.)
export { ConfirmModal } from "./ConfirmModal";
export type { ModalProps } from "./Modal";
export { default, default as Modal } from "./Modal";
export { ModalBody, type ModalBodyProps } from "./ModalBody";
export {
  ModalCloseButton,
  type ModalCloseButtonProps,
} from "./ModalCloseButton";
// Core components (for advanced usage)
export { ModalContainer, type ModalContainerProps } from "./ModalContainer";
export type { ModalContextValue } from "./ModalContext";
// Context (for advanced usage)
export { ModalContextProvider, useModalContext } from "./ModalContext";
export { ModalFooter, type ModalFooterProps } from "./ModalFooter";
// Sub-components (also available as Modal.Header, etc.)
export { ModalHeader, type ModalHeaderProps } from "./ModalHeader";
export type { ModalRef } from "./ModalManager";
export { ModalManager } from "./ModalManager";
export { ModalProvider } from "./ModalProvider";
export type { PromptModalOptions } from "./PromptModal";
export { PromptModal } from "./PromptModal";
