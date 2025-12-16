import { CORE_TASK_CATEGORIES, CUSTOM_CATEGORY_LABEL } from "@pointwise/lib/categories";

export const CUSTOM_CATEGORY_OPTION_VALUE = "__custom__";

export const CATEGORY_OPTIONS = [
	...CORE_TASK_CATEGORIES.map((category) => ({
		label: category,
		value: category,
	})),
	{
		label: CUSTOM_CATEGORY_LABEL,
		value: CUSTOM_CATEGORY_OPTION_VALUE,
	},
];

export const REPEAT_OPTIONS = [
	{ label: "Does not repeat", value: "none" as const },
	{ label: "Daily", value: "daily" as const },
	{ label: "Weekly", value: "weekly" as const },
	{ label: "Monthly", value: "monthly" as const },
];

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const DEFAULT_TIME_OF_DAY = "09:00";
export const TITLE_MAX_LENGTH = 200;
export const CONTEXT_MAX_LENGTH = 5000;
