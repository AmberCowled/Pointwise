"use client";

import Container from "@pointwise/app/components/ui/Container";
import type { Project } from "@pointwise/lib/validation/projects-schema";
import { useRouter } from "next/navigation";
import DeleteProjectModal from "../modals/project/DeleteProjectModal";
import ProjectCardDescription from "./ProjectCardDescription";
import ProjectCardJoinRequestButton from "./ProjectCardJoinRequestButton";
import ProjectCardMenu from "./ProjectCardMenu";
import ProjectCardRole from "./ProjectCardRole";
import ProjectCardStats from "./ProjectCardStats";
import ProjectCardTitle from "./ProjectCardTitle";
import ProjectCardVisibility from "./ProjectCardVisibility";

export interface ProjectCardProps {
	project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
	const router = useRouter();

	return (
		<>
			<DeleteProjectModal project={project} />
			<Container
				width="full"
				direction="vertical"
				gap="none"
				className="bg-black/50 rounded-lg border border-zinc-800 hover:border-zinc-600 cursor-pointer px-4 py-2"
				onClick={() => {
					if (project.visibility === "PUBLIC" || project.role !== "NONE") {
						router.push(`/dashboard/${project.id}`);
					}
				}}
			>
				<Container width="full">
					<Container width="full" gap="sm">
						<ProjectCardTitle title={project.name} />
						<ProjectCardVisibility visibility={project.visibility} />
						<ProjectCardRole role={project.role} />
					</Container>
					<Container width="auto" className="justify-end">
						<ProjectCardMenu project={project} />
					</Container>
				</Container>

				<Container width="full" gap="none">
					<ProjectCardStats project={project} />
				</Container>

				<Container width="full" gap="none">
					<ProjectCardDescription project={project} />
					<ProjectCardJoinRequestButton project={project} />
				</Container>
			</Container>
		</>
	);
}
