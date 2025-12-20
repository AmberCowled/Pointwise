"use client";

import Container from "@pointwise/app/components/ui/Container";
import { getProjectMemberCount } from "@pointwise/lib/api/projectsV2";
import type { Project } from "@pointwise/lib/validation/projects-schema";
import { useRouter } from "next/navigation";
import ProjectCardV2Description from "./ProjectCardV2Description";
import ProjectCardV2Header from "./ProjectCardV2Header";
import ProjectCardV2Stats from "./ProjectCardV2Stats";
import ProjectCardV2Tags from "./ProjectCardV2Tags";

export interface ProjectCardProps {
	project: Project;
}

export default function ProjectCardV2({ project }: ProjectCardProps) {
	const router = useRouter();
	const memberCount = getProjectMemberCount(project);

	const handleSettingsClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		// TODO: Wire up to ProjectSettingsModal
	};

	return (
		<Container
			fullWidth={false}
			direction="vertical"
			className="group h-full outline outline-zinc-700 hover:outline-zinc-500 rounded-lg transition-all p-4 gap-3"
			onClick={() => router.push(`/dashboard/projects/${project.id}`)}
		>
			<ProjectCardV2Header name={project.name} />
			<ProjectCardV2Description description={project.description} />
			<ProjectCardV2Stats taskCount={project.taskCount} memberCount={memberCount} />
			<ProjectCardV2Tags
				visibility={project.visibility}
				role={project.role}
				onSettingsClick={handleSettingsClick}
			/>
		</Container>
	);
}
