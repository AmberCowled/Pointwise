"use client";

import Container from "@pointwise/app/components/general/Container";
import Grid from "@pointwise/app/components/general/Grid";
import { Button } from "@pointwise/app/components/ui/Button";
import { Card } from "@pointwise/app/components/ui/Card";
import { ErrorCard } from "@pointwise/app/components/ui/ErrorCard";
import { useGetProjectsQuery } from "@pointwise/lib/redux/services/projectsApi";
import ProjectCardV2 from "../projectCard/ProjectCardV2";
import NoProjectsView from "./NoProjectsView";

export default function ProjectsOverviewV2() {
	const { data: projects, isLoading, isError, refetch } = useGetProjectsQuery();
	const hasProjects = !isError && !isLoading && projects?.projects && projects.projects.length > 0;
	const isEmpty = !isError && !isLoading && projects?.projects && projects.projects.length === 0;

	return (
		<Container direction="vertical" gap="sm" className="pt-3">
			<Container>
				<Card
					title="Projects"
					label="Overview"
					loading={isLoading}
					className="flex-1"
					action={
						<Button variant="secondary" size="sm">
							Create Project
						</Button>
					}
				>
					<ErrorCard
						display={isError}
						message="Projects could not be loaded"
						onRetry={refetch}
						className="mb-6"
					/>
					{hasProjects ? (
						<Grid columns={{ default: 1, md: 2, lg: 3 }} gap="md">
							{projects.projects.map((project) => (
								<ProjectCardV2 key={project.id} project={project} />
							))}
						</Grid>
					) : isEmpty ? (
						<NoProjectsView />
					) : null}
				</Card>
			</Container>
		</Container>
	);
}
