"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Menu from "@pointwise/app/components/ui/menu";
import Modal from "@pointwise/app/components/ui/modal";
import { useUserId } from "@pointwise/hooks/useUserId";
import type { Project } from "@pointwise/lib/validation/projects-schema";
import { useRouter } from "next/navigation";
import { IoSettings } from "react-icons/io5";
import DeleteProjectModal from "../modals/project/DeleteProjectModal";

export interface ProjectCardSettingsMenuProps {
	project: Project;
}

export default function ProjectCardSettingsMenu({
	project,
}: ProjectCardSettingsMenuProps) {
	const userId = useUserId();
	const router = useRouter();

	const handleCancelRequest = () => {
		console.log("cancel request");
		// TODO: Implement cancel request API call
	};

	const handleRequestJoin = () => {
		console.log("request join");
		// TODO: Implement request join API call
	};

	const handleViewProject = () => {
		router.push(`/dashboard/${project.id}`);
	};

	const handleEditProject = () => {
		Modal.Manager.open(`update-project-modal-${project.id}`);
	};

	const handleLeave = () => {
		console.log("leave project");
		// TODO: Implement leave project API call
	};

	const handleDelete = () => {
		Modal.Manager.open(`delete-project-modal-${project.id}`);
	};

	return (
		<>
			<DeleteProjectModal project={project} />
			<Menu trigger={<Button variant="ghost" size="xs" icon={IoSettings} />}>
				{project.role === "NONE" && (
					<Menu.Section>
						{userId && project.joinRequestUserIds?.includes(userId) ? (
							<Menu.Option
								label="Cancel Request"
								onClick={handleCancelRequest}
							/>
						) : (
							<Menu.Option
								label="Request to Join"
								onClick={handleRequestJoin}
							/>
						)}
						<Menu.Option label="View Project" onClick={handleViewProject} />
					</Menu.Section>
				)}

				{project.role === "ADMIN" && (
					<>
						<Menu.Section>
							<Menu.Option
								label="View Project"
								href={`/dashboard/${project.id}`}
							/>
							<Menu.Option label="Edit Project" onClick={handleEditProject} />
						</Menu.Section>
						<Menu.Section>
							<Menu.Option label="Leave Project" onClick={handleLeave} />
							<Menu.Option
								label="Delete Project"
								danger
								onClick={handleDelete}
							/>
						</Menu.Section>
					</>
				)}

				{(project.role === "USER" || project.role === "VIEWER") && (
					<Menu.Section>
						<Menu.Option
							label="View Project"
							href={`/dashboard/${project.id}`}
						/>
						<Menu.Option label="Leave Project" onClick={handleLeave} />
					</Menu.Section>
				)}
			</Menu>
		</>
	);
}
