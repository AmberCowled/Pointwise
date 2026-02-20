import { Card } from "@pointwise/app/components/ui/Card";
import Container from "@pointwise/app/components/ui/Container";
import { ErrorCard } from "@pointwise/app/components/ui/ErrorCard";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import ProjectCard from "@pointwise/app/dashboard/projectCard/ProjectCard";
import { useSearchPublicProjectsQuery } from "@pointwise/generated/api";
import { IoSearchOutline } from "react-icons/io5";

interface ProjectsSearchResultsProps {
	query: string;
}

export default function ProjectsSearchResults({
	query,
}: ProjectsSearchResultsProps) {
	const {
		data: projectsSearchResults,
		isLoading: isProjectsLoading,
		isError: isProjectsError,
		refetch: refetchProjects,
	} = useSearchPublicProjectsQuery({
		limit: 10,
		offset: 0,
		query,
	});

	const projects = projectsSearchResults?.projects ?? [];
	const projectsCount = projectsSearchResults?.pagination.total ?? 0;
	return (
		<Card label={`${projectsCount} results`} loading={isProjectsLoading}>
			<Container direction="vertical" gap="sm" width="full" className="mt-3">
				<ErrorCard
					message="Something went wrong"
					onRetry={refetchProjects}
					display={isProjectsError}
				/>
				{!isProjectsError && projectsCount > 0 ? (
					projects.map((project) => (
						<ProjectCard key={project.id} project={project} />
					))
				) : (
					<Container
						width="full"
						direction="vertical"
						gap="sm"
						className={`py-8 ${StyleTheme.Text.Secondary} ${StyleTheme.Container.BackgroundSubtle} border ${StyleTheme.Container.Border.Subtle}`}
					>
						<IoSearchOutline className="size-10 mb-2" />
						<span className="font-medium text-lg">No projects found</span>
					</Container>
				)}
			</Container>
		</Card>
	);
}
