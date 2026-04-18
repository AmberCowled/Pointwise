"use client";

import Container from "@pointwise/app/components/ui/Container";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import type { Project } from "@pointwise/lib/validation/projects-schema";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { IoLockClosed } from "react-icons/io5";
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
	disableMenu?: boolean;
	overrideOnClick?: () => void;
}

export default function ProjectCard({
	project,
	disableMenu = false,
	overrideOnClick,
}: ProjectCardProps) {
	const router = useRouter();
	const { data: session } = useSession();
	const isOwner = project.ownerId === session?.user?.id;
	const isOverLimit = project.memberLimitInfo?.exceeded ?? false;

	return (
		<>
			<DeleteProjectModal project={project} />
			<Container
				width="full"
				direction="vertical"
				gap="none"
				className={`${StyleTheme.Container.BackgroundSubtle} rounded-lg border ${isOverLimit ? "border-amber-500/50" : StyleTheme.Container.Border.Dark} hover:border-zinc-600 cursor-pointer px-4 py-2`}
				onClick={() => {
					if (overrideOnClick) {
						overrideOnClick();
					} else if (
						project.visibility === "PUBLIC" ||
						project.role !== "NONE"
					) {
						router.push(`/dashboard/${project.id}`);
					}
				}}
			>
				<Container width="full">
					<Container width="full" gap="sm">
						<ProjectCardTitle title={project.name} />
						<ProjectCardVisibility visibility={project.visibility} />
						<ProjectCardRole role={project.role} isOwner={isOwner} />
						{isOverLimit && (
							<span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400">
								<IoLockClosed className="h-3 w-3" />
								Over limit
							</span>
						)}
					</Container>
					{!disableMenu && (
						<Container width="auto" className="justify-end">
							<ProjectCardMenu project={project} />
						</Container>
					)}
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
