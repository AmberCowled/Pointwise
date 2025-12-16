/**
 * Tests for client-side task form validation
 *
 * High priority because:
 * - Must match server-side validation
 * - User-facing error messages
 * - Form UX depends on accurate validation
 */

import type { TaskFormValues } from "@pointwise/app/components/dashboard/tasks/form/types";
import { describe, expect, it } from "vitest";
import { validateField, validateTaskForm } from "./task-form";

describe("validateTaskForm", () => {
	const baseForm: TaskFormValues = {
		title: "Test Task",
		category: "Work",
		xpValue: 50,
		context: "Test context",
		recurrence: "none",
		recurrenceDays: [],
		recurrenceMonthDays: [],
		timesOfDay: [],
	};

	describe("valid input", () => {
		it("should validate a complete valid form", () => {
			const result = validateTaskForm({
				form: baseForm,
				selectedCategory: "Work",
			});

			expect(result.isValid).toBe(true);
			expect(result.errors).toEqual({});
			expect(result.normalizedValues).toBeDefined();
			if (result.normalizedValues) {
				expect(result.normalizedValues.title).toBe("Test Task");
				expect(result.normalizedValues.category).toBe("Work");
			}
		});

		it("should validate form with custom category", () => {
			const result = validateTaskForm({
				form: { ...baseForm, category: "My Custom Category" }, // form.category should be the actual custom value
				selectedCategory: "__custom__",
				customCategory: "My Custom Category",
			});

			expect(result.isValid).toBe(true);
			expect(result.errors).toEqual({});
			if (result.normalizedValues) {
				expect(result.normalizedValues.category).toBe("My Custom Category");
			}
		});

		it("should validate form with dates", () => {
			const result = validateTaskForm({
				form: {
					...baseForm,
					startDate: "2025-01-15",
					startTime: "09:00",
					dueDate: "2025-01-16",
					dueTime: "09:00",
				},
				selectedCategory: "Work",
				hasStart: true,
				hasDue: true,
			});

			expect(result.isValid).toBe(true);
			expect(result.errors).toEqual({});
		});
	});

	describe("title validation", () => {
		it("should reject empty title", () => {
			const result = validateTaskForm({
				form: { ...baseForm, title: "" },
				selectedCategory: "Work",
			});

			expect(result.isValid).toBe(false);
			expect(result.errors.title).toBeDefined();
		});

		it("should reject whitespace-only title", () => {
			const result = validateTaskForm({
				form: { ...baseForm, title: "   " },
				selectedCategory: "Work",
			});

			expect(result.isValid).toBe(false);
			expect(result.errors.title).toBeDefined();
		});

		it("should reject title exceeding max length", () => {
			const result = validateTaskForm({
				form: { ...baseForm, title: "x".repeat(201) },
				selectedCategory: "Work",
			});

			expect(result.isValid).toBe(false);
			expect(result.errors.title).toBeDefined();
		});

		it("should accept title at max length", () => {
			const result = validateTaskForm({
				form: { ...baseForm, title: "x".repeat(200) },
				selectedCategory: "Work",
			});

			expect(result.isValid).toBe(true);
			expect(result.errors.title).toBeUndefined();
		});
	});

	describe("category validation", () => {
		it("should reject empty custom category", () => {
			const result = validateTaskForm({
				form: { ...baseForm, category: "" }, // Empty category when custom is selected
				selectedCategory: "__custom__",
				customCategory: "",
			});

			expect(result.isValid).toBe(false);
			expect(result.errors.category).toBe("Enter a custom category name");
		});

		it("should reject whitespace-only custom category", () => {
			const result = validateTaskForm({
				form: { ...baseForm, category: "   " }, // Whitespace category when custom is selected
				selectedCategory: "__custom__",
				customCategory: "   ",
			});

			expect(result.isValid).toBe(false);
			expect(result.errors.category).toBe("Enter a custom category name");
		});
	});

	describe("XP value validation", () => {
		it("should reject negative XP", () => {
			const result = validateTaskForm({
				form: { ...baseForm, xpValue: -10 },
				selectedCategory: "Work",
			});

			expect(result.isValid).toBe(false);
			expect(result.errors.xpValue).toBeDefined();
		});

		it("should reject XP exceeding max", () => {
			const result = validateTaskForm({
				form: { ...baseForm, xpValue: 1000001 },
				selectedCategory: "Work",
			});

			expect(result.isValid).toBe(false);
			expect(result.errors.xpValue).toBeDefined();
		});

		it("should accept zero XP", () => {
			const result = validateTaskForm({
				form: { ...baseForm, xpValue: 0 },
				selectedCategory: "Work",
			});

			expect(result.isValid).toBe(true);
			expect(result.errors.xpValue).toBeUndefined();
		});

		it("should accept max XP", () => {
			const result = validateTaskForm({
				form: { ...baseForm, xpValue: 1000000 },
				selectedCategory: "Work",
			});

			expect(result.isValid).toBe(true);
			expect(result.errors.xpValue).toBeUndefined();
		});
	});

	describe("context validation", () => {
		it("should accept empty context", () => {
			const result = validateTaskForm({
				form: { ...baseForm, context: "" },
				selectedCategory: "Work",
			});

			expect(result.isValid).toBe(true);
			expect(result.errors.context).toBeUndefined();
		});

		it("should reject context exceeding max length", () => {
			const result = validateTaskForm({
				form: { ...baseForm, context: "x".repeat(5001) },
				selectedCategory: "Work",
			});

			expect(result.isValid).toBe(false);
			expect(result.errors.context).toBeDefined();
		});

		it("should accept context at max length", () => {
			const result = validateTaskForm({
				form: { ...baseForm, context: "x".repeat(5000) },
				selectedCategory: "Work",
			});

			expect(result.isValid).toBe(true);
			expect(result.errors.context).toBeUndefined();
		});
	});

	describe("date validation", () => {
		it("should reject start date after due date", () => {
			const result = validateTaskForm({
				form: {
					...baseForm,
					startDate: "2025-01-16",
					startTime: "09:00",
					dueDate: "2025-01-15",
					dueTime: "09:00",
				},
				selectedCategory: "Work",
				hasStart: true,
				hasDue: true,
			});

			expect(result.isValid).toBe(false);
			expect(result.errors.dateOrder).toBeDefined();
		});

		it("should accept start date before due date", () => {
			const result = validateTaskForm({
				form: {
					...baseForm,
					startDate: "2025-01-15",
					startTime: "09:00",
					dueDate: "2025-01-16",
					dueTime: "09:00",
				},
				selectedCategory: "Work",
				hasStart: true,
				hasDue: true,
			});

			expect(result.isValid).toBe(true);
			expect(result.errors.startDate).toBeUndefined();
			expect(result.errors.dueDate).toBeUndefined();
		});

		it("should accept same start and due date", () => {
			const result = validateTaskForm({
				form: {
					...baseForm,
					startDate: "2025-01-15T09:00:00Z",
					dueDate: "2025-01-15T09:00:00Z",
				},
				selectedCategory: "Work",
				hasStart: true,
				hasDue: true,
			});

			expect(result.isValid).toBe(true);
		});
	});

	describe("recurrence validation", () => {
		it("should validate weekly recurrence with weekdays", () => {
			const result = validateTaskForm({
				form: {
					...baseForm,
					recurrence: "weekly",
					recurrenceDays: [1, 3, 5], // Mon, Wed, Fri
				},
				selectedCategory: "Work",
			});

			expect(result.isValid).toBe(true);
		});

		it("should validate monthly recurrence with month days", () => {
			const result = validateTaskForm({
				form: {
					...baseForm,
					recurrence: "monthly",
					recurrenceMonthDays: [1, 15],
				},
				selectedCategory: "Work",
			});

			expect(result.isValid).toBe(true);
		});
	});
});

describe("validateField", () => {
	it("should validate title field", () => {
		expect(validateField("title", "Valid Title")).toBeNull();
		expect(validateField("title", "")).not.toBeNull();
		expect(validateField("title", "x".repeat(201))).not.toBeNull();
	});

	it("should validate xpValue field", () => {
		expect(validateField("xpValue", 50)).toBeNull();
		expect(validateField("xpValue", -1)).not.toBeNull();
		expect(validateField("xpValue", 1000001)).not.toBeNull();
	});

	it("should validate context field", () => {
		expect(validateField("context", "Valid context")).toBeNull();
		expect(validateField("context", "x".repeat(5001))).not.toBeNull();
	});

	it("should return null for unknown fields", () => {
		expect(validateField("unknownField" as any, "value")).toBeNull();
	});
});
