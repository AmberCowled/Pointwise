"use client";

import Container from "@pointwise/app/components/general/Container";
import Grid from "@pointwise/app/components/general/Grid";
import { Button } from "@pointwise/app/components/ui/Button";
import { Card } from "@pointwise/app/components/ui/Card";
import { ErrorCard } from "@pointwise/app/components/ui/ErrorCard";
import { useGetProjectsQuery } from "@pointwise/lib/redux/services/projectsApi";
import ProjectCardV2 from "./ProjectCardV2";

export default function ProjectsOverviewV2() {
	const { data: projects, isLoading, isError, refetch } = useGetProjectsQuery();

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
					{!isError && !isLoading && projects?.projects && projects.projects.length > 0 ? (
						<Grid columns={{ default: 1, md: 2, lg: 3 }} gap="md">
							{projects.projects.map((project) => (
								<ProjectCardV2 key={project.id} project={project} />
							))}
						</Grid>
					) : !isError && !isLoading && projects?.projects && projects.projects.length === 0 ? (
						<div className="text-center py-12">
							<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800/50 flex items-center justify-center">
								<svg
									className="w-8 h-8 text-zinc-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
									/>
								</svg>
							</div>
							<h3 className="text-lg font-semibold text-zinc-100 mb-2">No projects yet</h3>
							<p className="text-sm text-zinc-400 mb-6 max-w-md mx-auto">
								Create your first project to start organizing your tasks and collaborating with your
								team.
							</p>
							<Button variant="secondary" size="sm" className="rounded-full">
								<svg
									className="w-4 h-4 mr-2"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 4v16m8-8H4"
									/>
								</svg>
								Create Your First Project
							</Button>
						</div>
					) : null}
				</Card>
			</Container>
		</Container>
	);
}
