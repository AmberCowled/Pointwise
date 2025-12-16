/**
 * Project validation schemas
 *
 * Validates project creation and update requests
 */

import type { CreateProjectRequest, UpdateProjectRequest } from "../api/types";

interface ValidationResult<T> {
	success: boolean;
	data?: T;
	error?: string;
	status?: number;
}

/**
 * Validate project creation request
 */
export function parseCreateProjectBody(body: unknown): ValidationResult<CreateProjectRequest> {
	if (!body || typeof body !== "object") {
		return {
			success: false,
			error: "Invalid request body",
			status: 400,
		};
	}

	const data = body as Record<string, unknown>;

	// Validate name (required)
	if (!data.name || typeof data.name !== "string") {
		return {
			success: false,
			error: "Project name is required",
			status: 400,
		};
	}

	const name = data.name.trim();
	if (name.length === 0) {
		return {
			success: false,
			error: "Project name cannot be empty",
			status: 400,
		};
	}

	if (name.length > 100) {
		return {
			success: false,
			error: "Project name must be 100 characters or fewer",
			status: 400,
		};
	}

	// Validate description (optional)
	let description: string | undefined;
	if (data.description !== undefined) {
		if (typeof data.description !== "string") {
			return {
				success: false,
				error: "Description must be a string",
				status: 400,
			};
		}
		description = data.description.trim();
		if (description.length > 500) {
			return {
				success: false,
				error: "Description must be 500 characters or fewer",
				status: 400,
			};
		}
	}

	// Validate visibility (optional, defaults to PRIVATE)
	let visibility: "PRIVATE" | "PUBLIC" = "PRIVATE";
	if (data.visibility !== undefined) {
		if (
			typeof data.visibility !== "string" ||
			(data.visibility !== "PRIVATE" && data.visibility !== "PUBLIC")
		) {
			return {
				success: false,
				error: 'Visibility must be either "PRIVATE" or "PUBLIC"',
				status: 400,
			};
		}
		visibility = data.visibility as "PRIVATE" | "PUBLIC";
	}

	return {
		success: true,
		data: {
			name,
			description,
			visibility,
		},
	};
}

/**
 * Validate project update request
 */
export function parseUpdateProjectBody(body: unknown): ValidationResult<UpdateProjectRequest> {
	if (!body || typeof body !== "object") {
		return {
			success: false,
			error: "Invalid request body",
			status: 400,
		};
	}

	const data = body as Record<string, unknown>;
	const updates: UpdateProjectRequest = {};

	// Validate name (optional)
	if (data.name !== undefined) {
		if (typeof data.name !== "string") {
			return {
				success: false,
				error: "Name must be a string",
				status: 400,
			};
		}
		const name = data.name.trim();
		if (name.length === 0) {
			return {
				success: false,
				error: "Name cannot be empty",
				status: 400,
			};
		}
		if (name.length > 100) {
			return {
				success: false,
				error: "Name must be 100 characters or fewer",
				status: 400,
			};
		}
		updates.name = name;
	}

	// Validate description (optional)
	if (data.description !== undefined) {
		if (typeof data.description !== "string") {
			return {
				success: false,
				error: "Description must be a string",
				status: 400,
			};
		}
		const description = data.description.trim();
		if (description.length > 500) {
			return {
				success: false,
				error: "Description must be 500 characters or fewer",
				status: 400,
			};
		}
		updates.description = description;
	}

	// Validate visibility (optional)
	if (data.visibility !== undefined) {
		if (
			typeof data.visibility !== "string" ||
			(data.visibility !== "PRIVATE" && data.visibility !== "PUBLIC")
		) {
			return {
				success: false,
				error: 'Visibility must be either "PRIVATE" or "PUBLIC"',
				status: 400,
			};
		}
		updates.visibility = data.visibility as "PRIVATE" | "PUBLIC";
	}

	// At least one field must be provided
	if (Object.keys(updates).length === 0) {
		return {
			success: false,
			error: "At least one field must be provided for update",
			status: 400,
		};
	}

	return {
		success: true,
		data: updates,
	};
}
