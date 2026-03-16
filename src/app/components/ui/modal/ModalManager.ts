/**
 * ModalManager - Global singleton for managing modal state
 *
 * Tracks all registered modals by ID and provides methods to open/close them.
 * Modals auto-register themselves when mounted and unregister when unmounted.
 */

export interface ModalRef {
	open: () => void;
	close: () => void;
	isOpen: () => boolean;
}

class ModalManagerClass {
	private modals: Map<string, ModalRef> = new Map();

	/**
	 * Register a modal with the manager
	 * Called automatically when a modal component mounts
	 */
	registerModal(id: string, ref: ModalRef): void {
		this.modals.set(id, ref);
	}

	/**
	 * Unregister a modal from the manager
	 * Called automatically when a modal component unmounts.
	 * Only removes the entry if the stored ref matches, preventing
	 * stale cleanup from removing a freshly re-registered modal.
	 */
	unregisterModal(id: string, ref: ModalRef): void {
		if (this.modals.get(id) === ref) {
			this.modals.delete(id);
		}
	}

	/**
	 * Open a modal by ID
	 * @param id - The modal ID
	 */
	open(id: string): void {
		const modal = this.modals.get(id);
		if (!modal) {
			console.warn(`Modal with id "${id}" is not registered.`);
			return;
		}
		modal.open();
	}

	/**
	 * Close a modal by ID
	 * @param id - The modal ID
	 */
	close(id: string): void {
		const modal = this.modals.get(id);
		if (!modal) {
			console.warn(`Modal with id "${id}" is not registered.`);
			return;
		}
		modal.close();
	}

	/**
	 * Check if a modal is currently open
	 * @param id - The modal ID
	 * @returns true if the modal is open, false otherwise
	 */
	isOpen(id: string): boolean {
		const modal = this.modals.get(id);
		if (!modal) {
			return false;
		}
		return modal.isOpen();
	}

	/**
	 * Get all registered modal IDs
	 * @returns Array of registered modal IDs
	 */
	getRegisteredIds(): string[] {
		return Array.from(this.modals.keys());
	}
}

// Export singleton instance
export const ModalManager = new ModalManagerClass();
