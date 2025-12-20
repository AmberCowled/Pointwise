// ModalV2 - default export (high-level wrapper with all static properties)

export type { AlertModalOptions } from "./AlertModal";
export { AlertModal } from "./AlertModal";
export type { ConfirmModalOptions } from "./ConfirmModal";
// Built-in modals (also available as ModalV2.Confirm, etc.)
export { ConfirmModal } from "./ConfirmModal";
// Core components (for advanced usage)
export { ModalContainer, type ModalContainerProps } from "./ModalContainer";
export type { ModalContextValue } from "./ModalContext";
// Context (for advanced usage)
export { ModalContextProvider, useModalContext } from "./ModalContext";
export type { ModalRef } from "./ModalManager";
export { ModalManager } from "./ModalManager";
export { ModalProvider } from "./ModalProvider";
export type { ModalV2Props } from "./ModalV2";
export { default, default as ModalV2 } from "./ModalV2";
export { ModalV2Body, type ModalV2BodyProps } from "./ModalV2Body";
export { ModalV2CloseButton, type ModalV2CloseButtonProps } from "./ModalV2CloseButton";
export { ModalV2Footer, type ModalV2FooterProps } from "./ModalV2Footer";
// Sub-components (also available as ModalV2.Header, etc.)
export { ModalV2Header, type ModalV2HeaderProps } from "./ModalV2Header";
export type { PromptModalOptions } from "./PromptModal";
export { PromptModal } from "./PromptModal";
