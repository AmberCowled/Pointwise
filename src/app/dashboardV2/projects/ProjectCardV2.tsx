"use client";

import Container from "@pointwise/app/components/general/Container";
import { Button } from "@pointwise/app/components/ui/Button";
import { Tag } from "@pointwise/app/components/ui/Tag";
import { TextPreview } from "@pointwise/app/components/ui/TextPreview";
import { getProjectMemberCount } from "@pointwise/lib/api/projectsV2";
import type { Project } from "@pointwise/lib/validation/projects-schema";
import { useRouter } from "next/navigation";
import { IoClipboard, IoGlobe, IoLockClosed, IoPeople, IoSettings } from "react-icons/io5";

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

			{/* Header Row: Title */}
			<Container fullWidth={false} className="items-center">
				<h2 className="text-lg font-semibold text-zinc-100 group-hover:text-blue-400 transition-colors w-full text-center min-w-0 truncate">
					{project.name}
				</h2>
			</Container>

			{/* Description */}
			<Container fullWidth={false}>
				<TextPreview
					text={project.description}
					lines={2}
					placeholder="Edit project to add a description"
					size="sm"
					className="text-zinc-400"
				/>
			</Container>

			{/* Stats Row: Tasks + Members */}
			<Container fullWidth={false} className="gap-4">
				<div className="flex items-center gap-2 text-sm text-zinc-400">
					<IoClipboard className="w-4 h-4" aria-hidden="true" />
					<span>
						{project.taskCount} {project.taskCount === 1 ? "task" : "tasks"}
					</span>
				</div>
				<div className="flex items-center gap-2 text-sm text-zinc-400">
					<IoPeople className="w-4 h-4" aria-hidden="true" />
					<span>
						{memberCount} {memberCount === 1 ? "member" : "members"}
					</span>
				</div>
			</Container>

			{/* Tags Row: Visibility + Role + Settings */}
			<Container fullWidth={false} className="gap-2 items-center">
				{project.visibility === "PUBLIC" ? (
					<Tag variant="info" size="xs" icon={IoGlobe}>
						Public
					</Tag>
				) : (
					<Tag variant="secondary" size="xs" icon={IoLockClosed}>
						Private
					</Tag>
				)}
				{project.role !== "NONE" && (
					<Tag
						variant={project.role === "ADMIN" ? "primary" : project.role === "USER" ? "secondary" : "info"}
						size="xs"
					>
						{project.role === "ADMIN" ? "Admin" : project.role === "USER" ? "Member" : "Viewer"}
					</Tag>
				)}
				{project.role === "ADMIN" && (
					<Button
						variant="ghost"
						size="xs"
						icon={IoSettings}
						onClick={handleSettingsClick}
						className="ml-auto shrink-0 p-1"
						aria-label="Project settings"
						title="Project settings"
					/>
				)}
			</Container>
		</Container>
	);
}
