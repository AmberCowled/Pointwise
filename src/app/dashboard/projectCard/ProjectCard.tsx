"use client";

import Container from "@pointwise/app/components/ui/Container";
import { getProjectMemberCount } from "@pointwise/lib/api/projects";
import type { Project } from "@pointwise/lib/validation/projects-schema";
import { useRouter } from "next/navigation";
import UpdateProjectModal from "../modals/project/UpdateProjectModal";
import ProjectCardDescription from "./ProjectCardDescription";
import ProjectCardHeader from "./ProjectCardHeader";
import ProjectCardStats from "./ProjectCardStats";
import ProjectCardTags from "./ProjectCardTags";

export interface ProjectCardProps {
	project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
	const router = useRouter();
	const memberCount = getProjectMemberCount(project);

	return (
		<>
			<UpdateProjectModal project={project} />
			<Container
				width="full"
				direction="vertical"
				className="group h-full outline outline-zinc-700 hover:outline-zinc-500 rounded-lg transition-all p-4 gap-3 cursor-pointer"
				onClick={() => {
					router.push(`/dashboard/${project.id}`);
				}}
			>
				<ProjectCardHeader name={project.name} />
				<ProjectCardDescription description={project.description} />
				<ProjectCardStats
					taskCount={project.taskCount}
					memberCount={memberCount}
				/>
				<ProjectCardTags project={project} />
			</Container>
		</>
	);
}
