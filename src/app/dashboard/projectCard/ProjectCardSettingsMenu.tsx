"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Menu from "@pointwise/app/components/ui/menu";
import Modal from "@pointwise/app/components/ui/modal";
import { useNotifications } from "@pointwise/app/components/ui/NotificationProvider";
import { useUserId } from "@pointwise/hooks/useUserId";
import type { Project } from "@pointwise/lib/validation/projects-schema";
import { useRouter } from "next/navigation";
import { IoSettings } from "react-icons/io5";
import { getErrorMessage } from "../../../lib/api/errors";
import {
	useCancelRequestToJoinProjectMutation,
	useLeaveProjectMutation,
	useRequestToJoinProjectMutation,
} from "../../../lib/redux/services/projectsApi";
import DeleteProjectModal from "../modals/project/DeleteProjectModal";

export interface ProjectCardSettingsMenuProps {
	project: Project;
}

export default function ProjectCardSettingsMenu({
	project,
}: ProjectCardSettingsMenuProps) {
	const userId = useUserId();
	const router = useRouter();
	const { showNotification } = useNotifications();
	const [requestToJoinProject] = useRequestToJoinProjectMutation();
	const [cancelRequestToJoinProject] = useCancelRequestToJoinProjectMutation();
	const [leaveProject] = useLeaveProjectMutation();

	const handleCancelRequest = async () => {
		try {
			await cancelRequestToJoinProject({ projectId: project.id }).unwrap();
			showNotification({
				message: "Join request cancelled",
				variant: "success",
			});
		} catch (error) {
			showNotification({
				message: getErrorMessage(error),
				variant: "error",
			});
		}
	};

	const handleRequestJoin = async () => {
		try {
			await requestToJoinProject({ projectId: project.id }).unwrap();
			showNotification({
				message: "Join request sent",
				variant: "success",
			});
		} catch (error) {
			showNotification({
				message: getErrorMessage(error),
				variant: "error",
			});
		}
	};

	const handleViewProject = () => {
		router.push(`/dashboard/${project.id}`);
	};

	const handleEditProject = () => {
		Modal.Manager.open(`update-project-modal-${project.id}`);
	};

	const handleLeave = async () => {
		try {
			await leaveProject({ projectId: project.id }).unwrap();
			showNotification({
				message: "You have left the project",
				variant: "success",
			});
		} catch (error) {
			showNotification({
				message: getErrorMessage(error),
				variant: "error",
			});
		}
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
