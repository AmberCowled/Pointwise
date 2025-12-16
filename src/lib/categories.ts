export const CORE_TASK_CATEGORIES = [
	"Work",
	"Planning",
	"Communication",
	"Learning",
	"Health",
	"Personal",
] as const;

export type CoreTaskCategory = (typeof CORE_TASK_CATEGORIES)[number];

export const CUSTOM_CATEGORY_LABEL = "Custom";

export const CATEGORY_COLORS = [
	"#6366f1",
	"#a855f7",
	"#ec4899",
	"#f97316",
	"#22d3ee",
	"#10b981",
	"#f59e0b",
	"#14b8a6",
] as const;

export type CategorySlice = {
	category: string;
	value: number;
	percentage: number;
	color: string;
};

export type CategoryBreakdownResult = {
	slices: CategorySlice[];
	customSlices: CategorySlice[];
};

export function normalizeCoreTaskCategory(input: string): CoreTaskCategory | null {
	const normalized = input.trim().toLowerCase();
	for (const category of CORE_TASK_CATEGORIES) {
		if (category.toLowerCase() === normalized) {
			return category;
		}
	}
	return null;
}

export function isCoreTaskCategory(input: string) {
	return normalizeCoreTaskCategory(input) !== null;
}

export const MAX_CUSTOM_CATEGORY_LENGTH = 60;

export function normalizeTaskCategory(input?: string | null) {
	const raw = (input ?? "").trim();
	if (!raw) return CORE_TASK_CATEGORIES[0];
	const core = normalizeCoreTaskCategory(raw);
	if (core) return core;
	return raw.slice(0, MAX_CUSTOM_CATEGORY_LENGTH);
}

export function createCategorySlices(
	coreEntries: Array<[string, number]>,
	customEntries: Array<[string, number]>,
): CategoryBreakdownResult {
	const totalCore = coreEntries.reduce((sum, [, value]) => sum + value, 0);
	const totalCustom = customEntries.reduce((sum, [, value]) => sum + value, 0);
	const total = totalCore + totalCustom;

	if (total === 0) return { slices: [], customSlices: [] };

	const slices: CategorySlice[] = [];
	let colorIndex = 0;

	for (const [category, value] of coreEntries) {
		const color = CATEGORY_COLORS[colorIndex % CATEGORY_COLORS.length];
		slices.push({
			category,
			value,
			percentage: value / total,
			color,
		});
		colorIndex += 1;
	}

	let customSlices: CategorySlice[] = [];
	if (customEntries.length > 0) {
		const customTotal = totalCustom;
		const customColor = CATEGORY_COLORS[colorIndex % CATEGORY_COLORS.length];

		slices.push({
			category: CUSTOM_CATEGORY_LABEL,
			value: customTotal,
			percentage: customTotal / total,
			color: customColor,
		});

		customSlices = customEntries.map(([category, value]) => ({
			category,
			value,
			percentage: value / total,
			color: customColor,
		}));
	}

	return { slices, customSlices };
}

export function buildCategoryGradient(slices: CategorySlice[]) {
	if (!slices.length) return null;
	let cumulative = 0;
	const segments: string[] = [];
	for (const slice of slices) {
		const start = cumulative * 360;
		cumulative += slice.percentage;
		const end = cumulative * 360;
		segments.push(`${slice.color} ${start.toFixed(2)}deg ${end.toFixed(2)}deg`);
	}
	return `conic-gradient(${segments.join(", ")})`;
}

/**
 * Get a consistent color for a category name.
 * Core categories get their index-based color, custom categories get a hash-based color.
 * Same category name always returns the same color.
 */
export function getCategoryColor(categoryName: string | null | undefined): string {
	if (!categoryName) {
		// Default to first color if no category
		return CATEGORY_COLORS[0];
	}

	const normalized = categoryName.trim();

	// Check if it's a core category
	const coreIndex = CORE_TASK_CATEGORIES.findIndex(
		(cat) => cat.toLowerCase() === normalized.toLowerCase(),
	);

	if (coreIndex >= 0) {
		// Core category: use its index in the array
		return CATEGORY_COLORS[coreIndex % CATEGORY_COLORS.length];
	}

	// Custom category: use hash-based color assignment for consistency
	// Simple hash function to convert string to number
	let hash = 0;
	for (let i = 0; i < normalized.length; i++) {
		const char = normalized.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // Convert to 32-bit integer
	}

	// Use absolute value and modulo to get color index
	const colorIndex = Math.abs(hash) % CATEGORY_COLORS.length;
	return CATEGORY_COLORS[colorIndex];
}
