"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "../Button";
import { StyleTheme } from "../StyleTheme";
import Modal from "./Modal";
import { ModalRenderQueue } from "./modalRenderQueue";

/**
 * Options for PromptModal
 */
export interface PromptModalOptions {
	/**
	 * Title of the prompt dialog
	 */
	title?: string;
	/**
	 * Label for the input field
	 */
	label?: string;
	/**
	 * Placeholder for the input field
	 */
	placeholder?: string;
	/**
	 * Default value for the input field
	 */
	defaultValue?: string;
	/**
	 * Text for the confirm button
	 * @default 'OK'
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
	/**
	 * Type of input
	 * @default 'text'
	 */
	inputType?: "text" | "password" | "email" | "number";
}

/**
 * Registry for tracking pending prompt modals
 */
const promptRegistry = new Map<
	string,
	{
		resolve: (value: string | null) => void;
		reject: (reason?: unknown) => void;
	}
>();

let promptCounter = 0;

/**
 * PromptModal component - renders a prompt dialog
 * @internal - Used by Modal.Prompt static method
 */
export function PromptModalComponent({
	id,
	options,
}: {
	id: string;
	options: PromptModalOptions;
}) {
	const [value, setValue] = useState(options.defaultValue || "");
	const inputRef = useRef<HTMLInputElement>(null);

	// Focus the input when the modal opens
	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	const handleConfirm = () => {
		const entry = promptRegistry.get(id);
		if (entry) {
			entry.resolve(value.trim() || null);
			promptRegistry.delete(id);
		}
		Modal.Manager.close(id);
		// Remove from render queue after a short delay to allow transition
		setTimeout(() => {
			ModalRenderQueue.remove(id);
		}, 300);
	};

	const handleCancel = () => {
		const entry = promptRegistry.get(id);
		if (entry) {
			entry.resolve(null);
			promptRegistry.delete(id);
		}
		Modal.Manager.close(id);
		// Remove from render queue after a short delay to allow transition
		setTimeout(() => {
			ModalRenderQueue.remove(id);
		}, 300);
	};

	return (
		<Modal id={id} size={options.size || "md"}>
			<Modal.Header title={options.title || "Prompt"} showCloseButton />
			<Modal.Body>
				<div className="space-y-2">
					{options.label && (
						<label
							htmlFor={`prompt-input-${id}`}
							className="block text-sm font-medium text-zinc-300"
						>
							{options.label}
						</label>
					)}
					<input
						ref={inputRef}
						id={`prompt-input-${id}`}
						type={options.inputType || "text"}
						value={value}
						onChange={(e) => setValue(e.target.value)}
						placeholder={options.placeholder}
						className={`w-full rounded-lg border ${StyleTheme.Container.Border.Primary} ${StyleTheme.Container.BackgroundInput} px-4 py-2 ${StyleTheme.Text.Primary} ${StyleTheme.Text.Placeholder} focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								handleConfirm();
							} else if (e.key === "Escape") {
								handleCancel();
							}
						}}
					/>
				</div>
			</Modal.Body>
			<Modal.Footer align="end">
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
					{options.confirmText || "OK"}
				</Button>
			</Modal.Footer>
		</Modal>
	);
}

/**
 * PromptModal - Promise-based prompt dialog
 *
 * Opens a prompt dialog and returns a promise that resolves to:
 * - The input value (string) if the user clicks confirm
 * - `null` if the user clicks cancel or closes the modal
 *
 * @example
 * ```tsx
 * const name = await Modal.Prompt({
 *   title: "Enter Name",
 *   label: "Name",
 *   placeholder: "John Doe",
 *   confirmText: "OK",
 *   cancelText: "Cancel"
 * });
 *
 * if (name) {
 *   console.log("User entered:", name);
 * }
 * ```
 */
export async function PromptModal(
	options: PromptModalOptions,
): Promise<string | null> {
	return new Promise((resolve, reject) => {
		const id = `prompt-modal-${promptCounter++}`;

		// Store promise resolvers
		promptRegistry.set(id, { resolve, reject });

		// Add to render queue
		ModalRenderQueue.add({
			id,
			component: PromptModalComponent as React.ComponentType<{
				id: string;
				[key: string]: unknown;
			}>,
			props: { options },
		});

		// Open the modal via manager
		setTimeout(() => {
			Modal.Manager.open(id);
		}, 0);
	});
}
