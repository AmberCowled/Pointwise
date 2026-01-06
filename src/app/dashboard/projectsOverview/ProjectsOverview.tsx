"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Card from "@pointwise/app/components/ui/Card";
import Container from "@pointwise/app/components/ui/Container";
import { ErrorCard } from "@pointwise/app/components/ui/ErrorCard";
import Modal from "@pointwise/app/components/ui/modal/index";
import { useGetProjectsQuery } from "@pointwise/lib/redux/services/projectsApi";
import CreateProjectModal from "../modals/project/CreateProjectModal";
import ProjectCard from "../projectCard/ProjectCard";
import NoProjectsView from "./NoProjectsView";

export default function ProjectsOverview() {
	const { data: projects, isLoading, isError, refetch } = useGetProjectsQuery();

	const hasProjects =
		!isError &&
		!isLoading &&
		projects?.projects &&
		projects.projects.length > 0;
	const isEmpty =
		!isError &&
		!isLoading &&
		projects?.projects &&
		projects.projects.length === 0;

	return (
		<>
			<CreateProjectModal />
			<Container direction="vertical" gap="sm" className="pt-3">
				<Card
					title="Projects"
					label="Overview"
					loading={isLoading}
					action={
						<Button
							variant="secondary"
							size="sm"
							onClick={() => Modal.Manager.open("create-project-modal")}
						>
							Create Project
						</Button>
					}
				>
					<Container
						direction="vertical"
						gap="sm"
						width="full"
						className="pt-2"
					>
						<ErrorCard
							display={isError}
							message="Projects could not be loaded"
							onRetry={refetch}
							className="mb-6"
						/>
						{hasProjects ? (
							projects.projects.map((project) => (
								<ProjectCard key={project.id} project={project} />
							))
						) : isEmpty ? (
							<NoProjectsView
								onCreateClick={() => Modal.Manager.open("create-project-modal")}
							/>
						) : null}
					</Container>
				</Card>
			</Container>
		</>
	);
}
