import Card from "@pointwise/app/components/ui/Card";
import Container from "@pointwise/app/components/ui/Container";
import { ErrorCard } from "@pointwise/app/components/ui/ErrorCard";
import { useSearchPublicProjectsQuery } from "@pointwise/lib/redux/services/projectsApi";
import ProjectCard from "../projectCard/ProjectCard";

export default function SearchOverview({ query }: { query: string }) {
	const {
		data: searchResults,
		isLoading,
		isError,
		refetch,
	} = useSearchPublicProjectsQuery({
		query,
		limit: 10,
		offset: 0,
	});

	return (
		<Container direction="vertical" gap="sm" className="pt-3">
			<Card title="Search" label="Overview" loading={isLoading}>
				<Container direction="vertical" gap="sm" width="full" className="mt-3">
					<ErrorCard
						message="Something went wrong"
						onRetry={refetch}
						display={isError}
					/>
					{!isError &&
						searchResults?.projects.map((project) => (
							<ProjectCard key={project.id} project={project} />
						))}
				</Container>
			</Card>
		</Container>
	);
}
