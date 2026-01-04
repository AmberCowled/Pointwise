"use client";

import Container from "@pointwise/app/components/ui/Container";
import { IoClipboard, IoPeople } from "react-icons/io5";

export interface ProjectCardStatsProps {
	/**
	 * Number of tasks in the project
	 */
	taskCount: number;
	/**
	 * Number of members in the project
	 */
	memberCount: number;
}

/**
 * ProjectCardStats - Displays task count and member count
 *
 * Shows statistics about the project including number of tasks and members.
 */
export default function ProjectCardStats({
	taskCount,
	memberCount,
}: ProjectCardStatsProps) {
	return (
		<Container width="auto" className="text-sm text-zinc-400">
			<IoClipboard className="w-4 h-4" aria-hidden="true" />
			{taskCount} {taskCount === 1 ? "task" : "tasks"}
			<IoPeople className="w-4 h-4" aria-hidden="true" />
			{memberCount} {memberCount === 1 ? "member" : "members"}
		</Container>
	);
}
