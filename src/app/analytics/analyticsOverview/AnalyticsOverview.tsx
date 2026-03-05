"use client";

import Card from "@pointwise/app/components/ui/Card";
import Container from "@pointwise/app/components/ui/Container";
import { ErrorCard } from "@pointwise/app/components/ui/ErrorCard";
import {
	useGetProjectAnalyticsQuery,
	useGetProjectsQuery,
} from "@pointwise/generated/api";
import { hasDeleteAccess } from "@pointwise/lib/api/projects";
import { useCallback, useEffect, useMemo, useState } from "react";
import CategoryBreakdownSection from "../sections/CategoryBreakdownSection";
import EngagementSection from "../sections/EngagementSection";
import MemberComparisonSection from "../sections/MemberComparisonSection";
import ProductivityPatternsSection from "../sections/ProductivityPatternsSection";
import SummaryStats from "../sections/SummaryStats";
import TaskCompletionSection from "../sections/TaskCompletionSection";
import TimeAnalysisSection from "../sections/TimeAnalysisSection";
import XpAnalyticsSection from "../sections/XpAnalyticsSection";
import AnalyticsFilters, {
	type AnalyticsFiltersRequest,
} from "./AnalyticsFilters";
import NoAnalyticsView from "./NoAnalyticsView";
import NoProjectsView from "./NoProjectsView";
import ProjectSelector from "./ProjectSelector";

function getDateRangeDates(dateRange: AnalyticsFiltersRequest["dateRange"]): {
	startDate?: string;
	endDate?: string;
} {
	const now = new Date();
	const endDate = now.toISOString();

	switch (dateRange) {
		case "7d":
			return {
				startDate: new Date(
					now.getTime() - 7 * 24 * 60 * 60 * 1000,
				).toISOString(),
				endDate,
			};
		case "30d":
			return {
				startDate: new Date(
					now.getTime() - 30 * 24 * 60 * 60 * 1000,
				).toISOString(),
				endDate,
			};
		case "90d":
			return {
				startDate: new Date(
					now.getTime() - 90 * 24 * 60 * 60 * 1000,
				).toISOString(),
				endDate,
			};
		case "thisMonth": {
			const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
			return { startDate: monthStart.toISOString(), endDate };
		}
		case "thisYear": {
			const yearStart = new Date(now.getFullYear(), 0, 1);
			return { startDate: yearStart.toISOString(), endDate };
		}
		case "all":
			return {};
	}
}

export default function AnalyticsOverview() {
	const {
		data: projectsData,
		isLoading: isProjectsLoading,
		isError: isProjectsError,
		refetch: refetchProjects,
	} = useGetProjectsQuery();

	const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
		null,
	);
	const [filters, setFilters] = useState<AnalyticsFiltersRequest | null>(null);

	// Auto-select first project
	useEffect(() => {
		if (projectsData?.projects?.length && !selectedProjectId) {
			setSelectedProjectId(projectsData.projects[0].id);
		}
	}, [projectsData, selectedProjectId]);

	const selectedProject = projectsData?.projects?.find(
		(p) => p.id === selectedProjectId,
	);
	const isAdmin = hasDeleteAccess(selectedProject?.role ?? "NONE");

	// Build query params from filters
	const queryParams = useMemo(() => {
		if (!selectedProjectId || !filters) return null;

		const dateRange = getDateRangeDates(filters.dateRange);
		return {
			projectId: selectedProjectId,
			startDate: dateRange.startDate,
			endDate: dateRange.endDate,
			category:
				filters.category && filters.category !== "All"
					? filters.category
					: undefined,
			status:
				filters.status !== "All"
					? (filters.status as "PENDING" | "COMPLETED")
					: undefined,
			memberId:
				isAdmin && filters.viewMode === "team" ? filters.memberId : undefined,
			granularity: filters.granularity,
		};
	}, [selectedProjectId, filters, isAdmin]);

	const {
		data: analytics,
		isLoading: isAnalyticsLoading,
		isError: isAnalyticsError,
		refetch: refetchAnalytics,
	} = useGetProjectAnalyticsQuery(queryParams ?? { projectId: "" }, {
		skip: !queryParams,
	});

	const handleFiltersChange = useCallback(
		(newFilters: AnalyticsFiltersRequest) => {
			setFilters(newFilters);
		},
		[],
	);

	const isLoading = isProjectsLoading || isAnalyticsLoading;
	const hasProjects = !isProjectsLoading && projectsData?.projects?.length;
	const hasAnalytics = !isAnalyticsLoading && analytics;
	const showMemberComparison =
		isAdmin &&
		filters?.viewMode === "team" &&
		analytics?.memberBreakdown !== null;

	return (
		<Container direction="vertical" gap="sm" className="py-3">
			<Card
				title="Analytics"
				label="Overview"
				loading={isLoading}
				loadingMessage="Loading analytics..."
			>
				<Container direction="vertical" gap="sm" width="full" className="pt-2">
					<ErrorCard
						display={isProjectsError}
						message="Projects could not be loaded"
						onRetry={refetchProjects}
						className="mb-4 w-full"
					/>

					{!isProjectsLoading && !hasProjects && <NoProjectsView />}

					{hasProjects && (
						<>
							<ProjectSelector
								projects={projectsData.projects}
								onSelect={setSelectedProjectId}
								selectedProjectId={selectedProjectId}
							/>

							<AnalyticsFilters
								onChange={handleFiltersChange}
								isAdmin={isAdmin}
								projectId={selectedProjectId}
							/>

							<ErrorCard
								display={isAnalyticsError}
								message="Analytics could not be loaded"
								onRetry={refetchAnalytics}
								className="mb-4 w-full"
							/>

							{hasAnalytics && analytics.summary.totalTasks === 0 && (
								<NoAnalyticsView />
							)}

							{hasAnalytics && analytics.summary.totalTasks > 0 && (
								<Container direction="vertical" gap="sm" width="full">
									<SummaryStats summary={analytics.summary} />

									<TaskCompletionSection
										timeSeries={analytics.timeSeries}
										completedTasks={analytics.summary.completedTasks}
										totalTasks={analytics.summary.totalTasks}
									/>

									<XpAnalyticsSection
										timeSeries={analytics.timeSeries}
										categoryBreakdown={analytics.categoryBreakdown}
									/>

									<TimeAnalysisSection
										timeSeries={analytics.timeSeries}
										completionTimeDistribution={
											analytics.completionTimeDistribution
										}
										categoryBreakdown={analytics.categoryBreakdown}
										activityHeatmap={analytics.activityHeatmap}
									/>

									<CategoryBreakdownSection
										categoryBreakdown={analytics.categoryBreakdown}
									/>

									<EngagementSection
										timeSeries={analytics.timeSeries}
										topTasks={analytics.topTasks}
										engagementScore={analytics.summary.engagementScore}
									/>

									<ProductivityPatternsSection
										dayOfWeekDistribution={analytics.dayOfWeekDistribution}
										timeOfDayDistribution={analytics.timeOfDayDistribution}
									/>

									{showMemberComparison && analytics.memberBreakdown && (
										<MemberComparisonSection
											memberBreakdown={analytics.memberBreakdown}
										/>
									)}
								</Container>
							)}
						</>
					)}
				</Container>
			</Card>
		</Container>
	);
}
