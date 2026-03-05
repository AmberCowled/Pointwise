"use client";

import Collapsible from "@pointwise/app/components/ui/Collapsible";
import Container from "@pointwise/app/components/ui/Container";
import Grid from "@pointwise/app/components/ui/Grid";
import Input from "@pointwise/app/components/ui/Input";
import InputSelect from "@pointwise/app/components/ui/InputSelect";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import { useGetProjectMembersQuery } from "@pointwise/generated/api";
import {
	CORE_TASK_CATEGORIES,
	CUSTOM_CATEGORY_LABEL,
} from "@pointwise/lib/categories";
import { useEffect, useMemo, useState } from "react";

export type AnalyticsFiltersRequest = {
	dateRange: "7d" | "30d" | "90d" | "thisMonth" | "thisYear" | "all";
	category: string;
	customCategory?: string;
	status: "All" | "PENDING" | "COMPLETED";
	granularity: "daily" | "weekly" | "monthly";
	memberId?: string;
	viewMode: "personal" | "team";
};

const DATE_RANGE_OPTIONS = [
	"Last 7 Days",
	"Last 30 Days",
	"Last 90 Days",
	"This Month",
	"This Year",
	"All Time",
] as const;

const DATE_RANGE_MAP: Record<string, AnalyticsFiltersRequest["dateRange"]> = {
	"Last 7 Days": "7d",
	"Last 30 Days": "30d",
	"Last 90 Days": "90d",
	"This Month": "thisMonth",
	"This Year": "thisYear",
	"All Time": "all",
};

interface AnalyticsFiltersProps {
	onChange?: (filters: AnalyticsFiltersRequest) => void;
	isAdmin: boolean;
	projectId: string | null;
}

export default function AnalyticsFilters({
	onChange,
	isAdmin,
	projectId,
}: AnalyticsFiltersProps) {
	const [dateRange, setDateRange] = useState<string>("Last 30 Days");
	const [category, setCategory] = useState("All");
	const [customCategory, setCustomCategory] = useState("");
	const [status, setStatus] = useState<string>("All");
	const [granularity, setGranularity] = useState<string>("Weekly");
	const [memberId, setMemberId] = useState<string>("All Members");
	const [viewMode, setViewMode] = useState<string>(
		isAdmin ? "Team Analytics" : "My Analytics",
	);

	const { data: membersData } = useGetProjectMembersQuery(projectId ?? "", {
		skip: !projectId || !isAdmin,
	});

	const memberOptions = useMemo(() => {
		if (!membersData?.members) return ["All Members"];
		return ["All Members", ...membersData.members.map((m) => m.displayName)];
	}, [membersData]);

	const filters: AnalyticsFiltersRequest = useMemo(() => {
		const resolvedMemberId =
			memberId === "All Members"
				? "all"
				: membersData?.members?.find((m) => m.displayName === memberId)?.userId;

		return {
			dateRange: DATE_RANGE_MAP[dateRange] ?? "30d",
			category: category === CUSTOM_CATEGORY_LABEL ? customCategory : category,
			customCategory:
				category === CUSTOM_CATEGORY_LABEL ? customCategory : undefined,
			status: status as AnalyticsFiltersRequest["status"],
			granularity:
				granularity.toLowerCase() as AnalyticsFiltersRequest["granularity"],
			memberId: resolvedMemberId,
			viewMode:
				viewMode === "Team Analytics"
					? "team"
					: ("personal" as AnalyticsFiltersRequest["viewMode"]),
		};
	}, [
		dateRange,
		category,
		customCategory,
		status,
		granularity,
		memberId,
		viewMode,
		membersData,
	]);

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
				<Container gap="xs" width="full">
					<InputSelect
						variant="secondary"
						label="Date Range"
						size="sm"
						flex="grow"
						defaultValue={dateRange}
						options={[...DATE_RANGE_OPTIONS]}
						onSelect={setDateRange}
						className={`max-h-10 ${StyleTheme.Container.BackgroundSubtle} ${StyleTheme.Text.Secondary} hover:text-zinc-100`}
					/>
				</Container>

				<Container gap="xs" width="full">
					<InputSelect
						variant="secondary"
						label="Status"
						size="sm"
						flex="grow"
						defaultValue={status}
						options={["All", "Pending", "Completed"]}
						onSelect={(v) =>
							setStatus(
								v === "Pending"
									? "PENDING"
									: v === "Completed"
										? "COMPLETED"
										: "All",
							)
						}
						className={`max-h-10 ${StyleTheme.Container.BackgroundSubtle} ${StyleTheme.Text.Secondary} hover:text-zinc-100`}
					/>
				</Container>

				<Container gap="xs" width="full">
					<InputSelect
						variant="secondary"
						label="Granularity"
						size="sm"
						flex="grow"
						defaultValue={granularity}
						options={["Daily", "Weekly", "Monthly"]}
						onSelect={setGranularity}
						className={`max-h-10 ${StyleTheme.Container.BackgroundSubtle} ${StyleTheme.Text.Secondary} hover:text-zinc-100`}
					/>
				</Container>
			</Grid>

			<Grid
				columns={{ default: 1, sm: 3 }}
				gap="sm"
				className="w-full pb-4 sm:px-2 md:px-4"
			>
				<Container gap="xs" width="full">
					<InputSelect
						variant="secondary"
						label="Category"
						size="sm"
						flex="grow"
						defaultValue={category}
						options={["All"]
							.concat([...CORE_TASK_CATEGORIES])
							.concat(CUSTOM_CATEGORY_LABEL)}
						onSelect={setCategory}
						className={`max-h-10 ${StyleTheme.Container.BackgroundSubtle} ${StyleTheme.Text.Secondary} hover:text-zinc-100`}
					/>
				</Container>

				{category === CUSTOM_CATEGORY_LABEL && (
					<Container gap="xs" width="full">
						<Input
							variant="secondary"
							label="Custom Category"
							size="sm"
							flex="grow"
							placeholder="All"
							onChange={setCustomCategory}
							className={`max-h-10 ${StyleTheme.Container.BackgroundSubtle} ${StyleTheme.Text.Secondary} hover:text-zinc-100`}
						/>
					</Container>
				)}

				{isAdmin && (
					<Container gap="xs" width="full">
						<InputSelect
							variant="secondary"
							label="View Mode"
							size="sm"
							flex="grow"
							defaultValue={viewMode}
							options={["My Analytics", "Team Analytics"]}
							onSelect={setViewMode}
							className={`max-h-10 ${StyleTheme.Container.BackgroundSubtle} ${StyleTheme.Text.Secondary} hover:text-zinc-100`}
						/>
					</Container>
				)}
			</Grid>

			{isAdmin && viewMode === "Team Analytics" && (
				<Grid
					columns={{ default: 1, sm: 3 }}
					gap="sm"
					className="w-full pb-4 sm:px-2 md:px-4"
				>
					<Container gap="xs" width="full">
						<InputSelect
							variant="secondary"
							label="Member"
							size="sm"
							flex="grow"
							defaultValue={memberId}
							options={memberOptions}
							onSelect={setMemberId}
							className={`max-h-10 ${StyleTheme.Container.BackgroundSubtle} ${StyleTheme.Text.Secondary} hover:text-zinc-100`}
						/>
					</Container>
				</Grid>
			)}
		</Collapsible>
	);
}
