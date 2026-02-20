import { Checkbox } from "@pointwise/app/components/ui/Checkbox";
import Collapsible from "@pointwise/app/components/ui/Collapsible";
import Container from "@pointwise/app/components/ui/Container";
import Grid from "@pointwise/app/components/ui/Grid";
import Input from "@pointwise/app/components/ui/Input";
import InputSelect from "@pointwise/app/components/ui/InputSelect";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import {
	CORE_TASK_CATEGORIES,
	CUSTOM_CATEGORY_LABEL,
} from "@pointwise/lib/categories";
import { useEffect, useMemo, useState } from "react";

/**
 * Task filter configuration object
 */
export type TaskFiltersRequest = {
	status: "All" | "Pending" | "Completed";
	date: "All" | "Today" | "Overdue" | "Upcoming";
	category: string; // "All" or category name
	customCategory?: string; // Only present if category === CUSTOM_CATEGORY_LABEL
	optional: boolean;
};

type TaskFiltersProps = {
	/**
	 * Callback fired when filter values change
	 * Receives the complete filter configuration object
	 */
	onChange?: (filters: TaskFiltersRequest) => void;

	/**
	 * Optional default filter values
	 */
	defaultFilters?: Partial<TaskFiltersRequest>;
};

export default function TaskFilters({
	onChange,
	defaultFilters,
}: TaskFiltersProps) {
	const [selectedStatus, setSelectedStatus] = useState<
		TaskFiltersRequest["status"]
	>((defaultFilters?.status ?? "Pending") as TaskFiltersRequest["status"]);
	const [selectedDate, setSelectedDate] = useState<TaskFiltersRequest["date"]>(
		(defaultFilters?.date ?? "All") as TaskFiltersRequest["date"],
	);
	const [selectedCategory, setSelectedCategory] = useState<string>(
		defaultFilters?.category ?? "All",
	);
	const [customCategory, setCustomCategory] = useState<string>(
		defaultFilters?.customCategory ?? "",
	);
	const [optional, setOptional] = useState<boolean>(
		defaultFilters?.optional ?? true,
	);

	// Aggregate all filter state into a single object
	const filters: TaskFiltersRequest = useMemo(() => {
		const result: TaskFiltersRequest = {
			status: selectedStatus,
			date: selectedDate,
			category:
				selectedCategory === "Custom" ? customCategory : selectedCategory,
			optional,
		};

		return result;
	}, [
		selectedStatus,
		selectedDate,
		selectedCategory,
		customCategory,
		optional,
	]);

	// Call onChange whenever filters change
	useEffect(() => {
		onChange?.(filters);
	}, [filters, onChange]);

	return (
		<Collapsible
			label="Filters"
			width="full"
			defaultCollapsed={true}
			className={`rounded-lg border ${StyleTheme.Container.Border.Primary} ${StyleTheme.Hover.BorderLift} ${StyleTheme.Container.BackgroundSubtle} px-2`}
		>
			<Grid
				columns={{ default: 1, sm: 3 }}
				gap="sm"
				className="w-full pb-4 sm:px-2 md:px-4"
			>
				{/* Status Filter */}
				<Container gap="xs" width="full">
					<InputSelect
						variant="secondary"
						label="Status"
						size="sm"
						flex="grow"
						defaultValue={selectedStatus}
						options={["All", "Pending", "Completed"]}
						onSelect={(value) =>
							setSelectedStatus(value as TaskFiltersRequest["status"])
						}
						className="max-h-10 bg-zinc-900/50 text-zinc-400 hover:text-zinc-100"
					/>
				</Container>

				{/* Date Filter */}
				<Container gap="xs" width="full">
					<InputSelect
						variant="secondary"
						label="Date"
						size="sm"
						flex="grow"
						defaultValue={selectedDate}
						options={["All", "Today", "Overdue", "Upcoming"]}
						onSelect={(value) =>
							setSelectedDate(value as TaskFiltersRequest["date"])
						}
						className="max-h-10 bg-zinc-900/50 text-zinc-400 hover:text-zinc-100"
					/>
				</Container>
			</Grid>

			<Grid
				columns={{ default: 1, sm: 3 }}
				gap="sm"
				className="w-full pb-4 sm:px-2 md:px-4"
			>
				{/* Category Filter */}
				<Container gap="xs" width="full">
					<InputSelect
						variant="secondary"
						label="Category"
						size="sm"
						flex="grow"
						defaultValue={selectedCategory}
						options={["All"]
							.concat(CORE_TASK_CATEGORIES)
							.concat(CUSTOM_CATEGORY_LABEL)}
						onSelect={setSelectedCategory}
						className="max-h-10 bg-zinc-900/50 text-zinc-400 hover:text-zinc-100"
					/>
				</Container>

				{/* Custom Category Filter - Conditionally rendered */}
				{selectedCategory === CUSTOM_CATEGORY_LABEL && (
					<Container gap="xs" width="full">
						<Input
							variant="secondary"
							label="Custom Category"
							size="sm"
							flex="grow"
							placeholder="All"
							onChange={setCustomCategory}
							className="max-h-10 bg-zinc-900/50 text-zinc-400 hover:text-zinc-100"
						/>
					</Container>
				)}
			</Grid>

			<Grid
				columns={{ default: 1, sm: 3 }}
				gap="sm"
				className="w-full pb-4 sm:px-2 md:px-4"
			>
				<Container gap="xs" width="full">
					<Checkbox
						label="Show Optional"
						defaultChecked={optional}
						onChange={(value) => setOptional(value)}
					/>
				</Container>
			</Grid>
		</Collapsible>
	);
}
