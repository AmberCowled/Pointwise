/**
 * ModalRenderQueue - Manages dynamically rendered modals (for built-in modals)
 *
 * This queue tracks modals that should be rendered dynamically,
 * such as those created by ModalV2.Confirm(), ModalV2.Alert(), etc.
 */

import type { ComponentType } from "react";

export interface QueuedModal {
	id: string;
	component: ComponentType<{ id: string; [key: string]: unknown }>;
	props: Record<string, unknown>;
}

class ModalRenderQueueClass {
	private queue: Map<string, QueuedModal> = new Map();
	private listeners: Set<() => void> = new Set();

	/**
	 * Add a modal to the render queue
	 */
	add(modal: QueuedModal): void {
		this.queue.set(modal.id, modal);
		this.notifyListeners();
	}

	/**
	 * Remove a modal from the render queue
	 */
	remove(id: string): void {
		this.queue.delete(id);
		this.notifyListeners();
	}

	/**
	 * Get all queued modals
	 */
	getAll(): QueuedModal[] {
		return Array.from(this.queue.values());
	}

	/**
	 * Subscribe to queue changes
	 */
	subscribe(listener: () => void): () => void {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}

	private notifyListeners(): void {
		this.listeners.forEach((listener) => {
			listener();
		});
	}
}

export const ModalRenderQueue = new ModalRenderQueueClass();
