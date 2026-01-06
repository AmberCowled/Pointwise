"use client";

import Container from "@pointwise/app/components/ui/Container";
import { getProjectMemberCount } from "@pointwise/lib/api/projects";
import type { Project } from "@pointwise/lib/validation/projects-schema";
import { IoClipboard, IoPeople } from "react-icons/io5";

export interface ProjectCardStatsProps {
	project: Project;
}

export default function ProjectCardStats({ project }: ProjectCardStatsProps) {
	const memberCount = getProjectMemberCount(project);
	const taskCount = project.taskCount ?? 0;

	return (
		<>
			<Container width="auto" gap="sm" className="pt-1 text-xs text-zinc-400">
				<IoPeople className="size-4.5" />
				<span>
					{memberCount} {memberCount === 1 ? "Member" : "Members"}
				</span>
			</Container>
			<Container
				width="auto"
				gap="sm"
				className="px-2 pt-1 text-xs text-zinc-400"
			>
				<IoClipboard className="size-4.5" />
				<span>
					{taskCount} {taskCount === 1 ? "Task" : "Tasks"}
				</span>
			</Container>
		</>
	);
}
