"use client";

import type React from "react";
import type { PropsWithChildren } from "react";
import { ModalContainer, type ModalContainerProps } from "./ModalContainer";
import { ModalV2Body } from "./ModalV2Body";
import { ModalV2CloseButton } from "./ModalV2CloseButton";
import { ModalV2Footer } from "./ModalV2Footer";
import { ModalV2Header } from "./ModalV2Header";

/**
 * Props for ModalV2 component
 */
export interface ModalV2Props
  extends Omit<ModalContainerProps, "id">,
    PropsWithChildren {
  /**
   * Unique ID for this modal (required for manager operations)
   * Used to open/close the modal via ModalV2.Manager
   */
  id: string;
}

/**
 * ModalV2 - High-level modal component with declarative API
 *
 * A convenient wrapper around ModalContainer that provides sub-components
 * as static properties for a cleaner developer experience. Modals manage
 * their own state and auto-register with ModalManager.
 *
 * **Props:**
 * - `id: string` - Required unique ID for manager operations
 * - `size?: "sm" | "md" | "lg" | "xl" | "2xl" | "6xl" | "fullscreen"` - Modal size (default: "md")
 * - `initialFocusRef?: React.RefObject<HTMLElement>` - Element to focus when modal opens
 * - `className?: string` - Custom className for the dialog container
 * - `panelClassName?: string` - Custom className for the dialog panel
 * - `overlayClassName?: string` - Custom className for the overlay
 * - `titleId?: string` - ID for the modal title (for accessibility)
 * - `descriptionId?: string` - ID for the modal description (for accessibility)
 * - `closeOnOverlayClick?: boolean` - Whether clicking overlay closes modal (default: true)
 * - `closeOnEscape?: boolean` - Whether pressing Escape closes modal (default: true)
 * - `transitionDuration?: { enter?: number; leave?: number }` - Custom transition durations (ms)
 * - `animation?: "scale" | "slide" | "fade"` - Animation preset (default: "scale", "slide" for fullscreen)
 * - `loading?: boolean` - Whether to show loading overlay (default: false)
 * - `loadingMessage?: string` - Optional message to display with loading spinner
 * - `onOpen?: () => void` - Callback fired when modal opens
 * - `onAfterClose?: () => void` - Callback fired after modal closes (after transition)
 * - `zIndex?: number` - Custom z-index for the modal (default: 50)
 * - `focusTrap?: boolean` - Whether to trap focus within modal (default: true)
 * - `children?: ReactNode` - Modal content (typically Header, Body, Footer)
 *
 * **Sub-components:**
 * - `ModalV2.Header` - Modal header with title, subtitle, icon, actions
 * - `ModalV2.Body` - Modal content area
 * - `ModalV2.Footer` - Modal footer with smart cancel button detection
 * - `ModalV2.CloseButton` - Close button that auto-uses context
 *
 * **Static Properties:**
 * - `ModalV2.Provider` - Provider component for app root
 * - `ModalV2.Manager` - Singleton manager for opening/closing modals
 * - `ModalV2.Confirm` - Promise-based confirm modal
 * - `ModalV2.Alert` - Promise-based alert modal
 * - `ModalV2.Prompt` - Promise-based prompt modal
 *
 * @example
 * ```tsx
 * import ModalV2 from "@pointwise/app/components/ui/modalV2";
 *
 * // Define modal component
 * <ModalV2 id="createProject" size="md" closeOnOverlayClick={false}>
 *   <ModalV2.Header title="Create Project" showCloseButton />
 *   <ModalV2.Body>
 *     <form>Form content</form>
 *   </ModalV2.Body>
 *   <ModalV2.Footer>
 *     <Button onClick={() => ModalV2.Manager.close("createProject")}>Cancel</Button>
 *     <Button onClick={handleSubmit}>Create</Button>
 *   </ModalV2.Footer>
 * </ModalV2>
 *
 * // Open modal from anywhere
 * <Button onClick={() => ModalV2.Manager.open("createProject")}>
 *   Create Project
 * </Button>
 * ```
 */
// Import dependencies first
import { AlertModal } from "./AlertModal";
import { ConfirmModal } from "./ConfirmModal";
import { ModalManager } from "./ModalManager";
import { ModalProvider } from "./ModalProvider";
import { PromptModal } from "./PromptModal";

// Define the component with proper typing
interface ModalV2Component {
  /**
   * ModalV2 component - High-level modal with declarative API
   *
   * @param props - ModalV2 props including id, size, and all ModalContainer props
   * @returns React element representing the modal
   */
  (props: ModalV2Props): React.ReactElement;

  /**
   * Modal header component with title, subtitle, icon, and actions
   *
   * **Props:**
   * - `title?: ReactNode` - Title of the modal
   * - `subtitle?: ReactNode` - Subtitle or description below the title
   * - `icon?: ReactNode` - Icon to display with the title
   * - `iconPosition?: "left" | "right"` - Position of the icon (default: "left")
   * - `actions?: ReactNode` - Action buttons or elements on the right side
   * - `showCloseButton?: boolean` - Whether to show a close button (default: false)
   * - `onClose?: () => void` - Callback when close button is clicked
   * - `size?: "sm" | "md" | "lg"` - Size variant affecting title and subtitle sizes (default: "md")
   *
   * @example
   * ```tsx
   * <ModalV2.Header
   *   title="Create Project"
   *   subtitle="Add a new project to your workspace"
   *   showCloseButton
   * />
   * ```
   */
  Header: typeof ModalV2Header;

  /**
   * Modal body component for content area
   *
   * **Props:**
   * - `maxHeight?: string` - Maximum height (e.g., '400px', '50vh')
   * - `scrollBehavior?: "auto" | "smooth"` - Scroll behavior (default: "auto")
   * - `noScroll?: boolean` - Disable scrolling (default: false)
   * - `padding?: "none" | "sm" | "md" | "lg"` - Padding variant (default: "md")
   * - `children?: ReactNode` - Modal content
   *
   * @example
   * ```tsx
   * <ModalV2.Body padding="md">
   *   <p>Modal content goes here</p>
   * </ModalV2.Body>
   * ```
   */
  Body: typeof ModalV2Body;

  /**
   * Modal footer component with smart cancel button detection
   *
   * Automatically detects cancel buttons by checking if the button text contains "cancel"
   * (case-insensitive). If a cancel button doesn't have an onClick handler, it will
   * automatically close the modal when clicked.
   *
   * **Props:**
   * - `align?: "start" | "center" | "end" | "between"` - Alignment of footer content (default: "between")
   * - `size?: "sm" | "md" | "lg"` - Size variant affecting spacing (default: "md")
   * - `children?: ReactNode` - Footer content (buttons, etc.)
   *
   * @example
   * ```tsx
   * <ModalV2.Footer align="end">
   *   <Button variant="secondary">Cancel</Button>
   *   <Button>Create</Button>
   * </ModalV2.Footer>
   * ```
   */
  Footer: typeof ModalV2Footer;

  /**
   * Close button component that automatically uses modal context
   *
   * Automatically uses the close function from ModalV2 context. If onClose is provided,
   * it will be used instead of the context's onClose.
   *
   * **Props:**
   * - `variant?: "primary" | "secondary" | "ghost"` - Button variant (default: "secondary")
   * - `size?: "xs" | "sm" | "md" | "lg" | "xl"` - Button size (default: "md")
   * - `onClose?: () => void` - Optional custom click handler
   * - `aria-label?: string` - Accessible label (default: "Close")
   * - `className?: string` - Custom className
   *
   * @example
   * ```tsx
   * <ModalV2.CloseButton />
   * ```
   */
  CloseButton: typeof ModalV2CloseButton;

  /**
   * Provider component for app root - renders dynamically queued modals
   *
   * Wrap your app root with this component to enable modal functionality.
   * This provider renders dynamically queued modals (like those from ModalV2.Confirm, etc.)
   * and manages hydration to prevent mismatches.
   *
   * @example
   * ```tsx
   * // In layout.tsx or app root
   * <ModalV2.Provider>
   *   <App />
   * </ModalV2.Provider>
   * ```
   */
  Provider: typeof ModalProvider;

  /**
   * Singleton manager for opening and closing modals by ID
   *
   * Tracks all registered modals by ID and provides methods to open/close them.
   * Modals auto-register themselves when mounted and unregister when unmounted.
   *
   * **Methods:**
   * - `open(id: string)` - Open a modal by ID
   * - `close(id: string)` - Close a modal by ID
   * - `isOpen(id: string): boolean` - Check if a modal is currently open
   * - `getRegisteredIds(): string[]` - Get all registered modal IDs
   *
   * @example
   * ```tsx
   * // Open a modal
   * ModalV2.Manager.open("createProject");
   *
   * // Close a modal
   * ModalV2.Manager.close("createProject");
   *
   * // Check if open
   * if (ModalV2.Manager.isOpen("createProject")) {
   *   // Do something
   * }
   * ```
   */
  Manager: typeof ModalManager;

  /**
   * Promise-based confirm modal
   *
   * Shows a confirmation dialog and returns a promise that resolves to `true` if confirmed,
   * or `false` if cancelled.
   *
   * **Options:**
   * - `title?: string` - Title of the confirm dialog
   * - `message: string` - Message/content (required)
   * - `confirmText?: string` - Text for confirm button (default: "Confirm")
   * - `cancelText?: string` - Text for cancel button (default: "Cancel")
   * - `confirmVariant?: "primary" | "secondary" | "danger"` - Confirm button variant (default: "primary")
   * - `cancelVariant?: "primary" | "secondary" | "danger"` - Cancel button variant (default: "secondary")
   * - `size?: "sm" | "md" | "lg" | "xl" | "2xl" | "6xl" | "fullscreen"` - Modal size (default: "md")
   *
   * @param options - Configuration options for the confirm modal
   * @returns Promise that resolves to `true` if confirmed, `false` if cancelled
   *
   * @example
   * ```tsx
   * const confirmed = await ModalV2.Confirm({
   *   title: "Delete Project",
   *   message: "Are you sure you want to delete this project?",
   *   confirmText: "Delete",
   *   confirmVariant: "danger"
   * });
   *
   * if (confirmed) {
   *   // User confirmed
   *   await deleteProject();
   * }
   * ```
   */
  Confirm: typeof ConfirmModal;

  /**
   * Promise-based alert modal
   *
   * Shows an alert dialog and returns a promise that resolves when the user clicks OK.
   *
   * **Options:**
   * - `title?: string` - Title of the alert (default: "Alert")
   * - `message: string` - Message/content (required)
   * - `buttonText?: string` - Text for the close button (default: "OK")
   * - `buttonVariant?: "primary" | "secondary" | "danger"` - Button variant (default: "primary")
   * - `size?: "sm" | "md" | "lg" | "xl" | "2xl" | "6xl" | "fullscreen"` - Modal size (default: "md")
   *
   * @param options - Configuration options for the alert modal
   * @returns Promise that resolves when the user clicks OK
   *
   * @example
   * ```tsx
   * await ModalV2.Alert({
   *   title: "Success",
   *   message: "Project created successfully!"
   * });
   * ```
   */
  Alert: typeof AlertModal;

  /**
   * Promise-based prompt modal
   *
   * Shows a prompt dialog with an input field and returns a promise that resolves to the
   * user's input string, or `null` if cancelled.
   *
   * **Options:**
   * - `title?: string` - Title of the prompt (default: "Prompt")
   * - `label?: string` - Label for the input field
   * - `message?: string` - Message/instruction text (deprecated, use label instead)
   * - `placeholder?: string` - Placeholder for the input field
   * - `defaultValue?: string` - Default value for the input
   * - `confirmText?: string` - Text for confirm button (default: "OK")
   * - `cancelText?: string` - Text for cancel button (default: "Cancel")
   * - `confirmVariant?: "primary" | "secondary" | "danger"` - Confirm button variant (default: "primary")
   * - `cancelVariant?: "primary" | "secondary" | "danger"` - Cancel button variant (default: "secondary")
   * - `size?: "sm" | "md" | "lg" | "xl" | "2xl" | "6xl" | "fullscreen"` - Modal size (default: "md")
   * - `inputType?: "text" | "password" | "email" | "number"` - Type of input (default: "text")
   *
   * @param options - Configuration options for the prompt modal
   * @returns Promise that resolves to the input string, or `null` if cancelled
   *
   * @example
   * ```tsx
   * const name = await ModalV2.Prompt({
   *   title: "Enter Name",
   *   label: "Please enter your name:",
   *   placeholder: "John Doe",
   *   required: true
   * });
   *
   * if (name) {
   *   console.log("User entered:", name);
   * }
   * ```
   */
  Prompt: typeof PromptModal;
}

/**
 * ModalV2 - High-level modal component with declarative API
 *
 * A convenient wrapper around ModalContainer that provides sub-components
 * as static properties for a cleaner developer experience. Modals manage
 * their own state and auto-register with ModalManager.
 *
 * **Props:**
 * - `id: string` - Required unique ID for manager operations (used to open/close via ModalV2.Manager)
 * - `size?: "sm" | "md" | "lg" | "xl" | "2xl" | "6xl" | "fullscreen"` - Modal size (default: "md")
 * - `initialFocusRef?: React.RefObject<HTMLElement>` - Element to focus when modal opens
 * - `className?: string` - Custom className for the dialog container
 * - `panelClassName?: string` - Custom className for the dialog panel
 * - `overlayClassName?: string` - Custom className for the overlay
 * - `titleId?: string` - ID for the modal title (for accessibility)
 * - `descriptionId?: string` - ID for the modal description (for accessibility)
 * - `closeOnOverlayClick?: boolean` - Whether clicking overlay closes modal (default: true)
 * - `closeOnEscape?: boolean` - Whether pressing Escape closes modal (default: true)
 * - `transitionDuration?: { enter?: number; leave?: number }` - Custom transition durations in milliseconds
 * - `animation?: "scale" | "slide" | "fade"` - Animation preset (default: "scale", "slide" for fullscreen)
 * - `loading?: boolean` - Whether to show loading overlay (default: false)
 * - `loadingMessage?: string` - Optional message to display with loading spinner
 * - `onOpen?: () => void` - Callback fired when modal opens
 * - `onAfterClose?: () => void` - Callback fired after modal closes (after transition completes)
 * - `zIndex?: number` - Custom z-index for the modal (default: 50)
 * - `focusTrap?: boolean` - Whether to trap focus within modal (default: true)
 * - `children?: ReactNode` - Modal content (typically Header, Body, Footer)
 *
 * **Sub-components:**
 * - `ModalV2.Header` - Modal header with title, subtitle, icon, actions
 * - `ModalV2.Body` - Modal content area
 * - `ModalV2.Footer` - Modal footer with smart cancel button detection
 * - `ModalV2.CloseButton` - Close button that auto-uses context
 *
 * **Static Properties:**
 * - `ModalV2.Provider` - Provider component for app root
 * - `ModalV2.Manager` - Singleton manager for opening/closing modals
 * - `ModalV2.Confirm` - Promise-based confirm modal
 * - `ModalV2.Alert` - Promise-based alert modal
 * - `ModalV2.Prompt` - Promise-based prompt modal
 *
 * @example
 * ```tsx
 * import ModalV2 from "@pointwise/app/components/ui/modalV2";
 *
 * // Define modal component
 * <ModalV2 id="createProject" size="md" closeOnOverlayClick={false}>
 *   <ModalV2.Header title="Create Project" showCloseButton />
 *   <ModalV2.Body>
 *     <form>Form content</form>
 *   </ModalV2.Body>
 *   <ModalV2.Footer>
 *     <Button onClick={() => ModalV2.Manager.close("createProject")}>Cancel</Button>
 *     <Button onClick={handleSubmit}>Create</Button>
 *   </ModalV2.Footer>
 * </ModalV2>
 *
 * // Open modal from anywhere
 * <Button onClick={() => ModalV2.Manager.open("createProject")}>
 *   Create Project
 * </Button>
 * ```
 */
const ModalV2 = (({ id, children, ...props }: ModalV2Props) => {
  return (
    <ModalContainer id={id} {...props}>
      {children}
    </ModalContainer>
  );
}) as unknown as ModalV2Component;

// Attach sub-components as static properties
ModalV2.Header = ModalV2Header;
ModalV2.Body = ModalV2Body;
ModalV2.Footer = ModalV2Footer;
ModalV2.CloseButton = ModalV2CloseButton;

// Attach Provider, Manager, and built-in modals
ModalV2.Provider = ModalProvider;
ModalV2.Manager = ModalManager;
ModalV2.Confirm = ConfirmModal;
ModalV2.Alert = AlertModal;
ModalV2.Prompt = PromptModal;

export default ModalV2;
