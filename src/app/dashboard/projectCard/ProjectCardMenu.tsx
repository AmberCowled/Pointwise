"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Menu from "@pointwise/app/components/ui/menu";
import Modal from "@pointwise/app/components/ui/modal";
import { useNotifications } from "@pointwise/app/components/ui/NotificationProvider";
import UpdateProjectModal from "@pointwise/app/dashboard/modals/project/UpdateProjectModal";
import { getErrorMessage } from "@pointwise/lib/api/errors";
import { useLeaveProjectMutation } from "@pointwise/lib/redux/services/projectsApi";
import type { Project } from "@pointwise/lib/validation/projects-schema";
import { useRouter } from "next/navigation";
import {
	IoClipboard,
	IoFolder,
	IoMail,
	IoPencil,
	IoPeople,
	IoPersonAdd,
	IoPersonRemove,
	IoSettings,
	IoTrash,
} from "react-icons/io5";

export interface ProjectCardMenuProps {
	project: Project;
}

export default function ProjectCardMenu({ project }: ProjectCardMenuProps) {
	const router = useRouter();
	const { showNotification } = useNotifications();
	const [leaveProject] = useLeaveProjectMutation();

	const handleLeaveProject = async () => {
		try {
			await leaveProject({ projectId: project.id }).unwrap();
			showNotification({
				message: "Project left successfully",
				variant: "success",
			});
			router.push("/dashboard");
		} catch (error) {
			showNotification({
				message: getErrorMessage(error),
				variant: "error",
			});
		}
	};

	return (
		<>
			<UpdateProjectModal project={project} />
			{(project.role !== "NONE" || project.visibility === "PUBLIC") && (
				<Menu trigger={<Button variant="ghost" size="xs" icon={IoSettings} />}>
					<Menu.Section title="Navigation">
						<Menu.Option
							icon={<IoFolder />}
							label="View Project"
							description="View all tasks"
							href={`/dashboard/${project.id}`}
						/>
					</Menu.Section>
					{project.role !== "NONE" && (
						<Menu.Section title="Community">
							<Menu.Option
								disabled
								icon={<IoPeople />}
								label="View Members"
								description="View all members"
								onClick={() => {}}
							/>
							<Menu.Option
								disabled
								icon={<IoPersonAdd />}
								label="Invite Members"
								description="Invite new members"
								onClick={() => {}}
							/>
						</Menu.Section>
					)}
					{project.role === "ADMIN" && (
						<Menu.Section title="Admin">
							{project.joinRequestUserIds.length > 0 && (
								<Menu.Option
									disabled
									icon={<IoClipboard />}
									label={`Pending Requests (${project.joinRequestUserIds.length})`}
									description="Manage pending requests"
									onClick={() => {}}
								/>
							)}
							{(project.inviteCount ?? 0) > 0 && (
								<Menu.Option
									disabled
									icon={<IoMail />}
									label="Pending Invites"
									description="Manage pending invites"
									onClick={() => {}}
								/>
							)}
							<Menu.Option
								icon={<IoPencil />}
								label="Edit Project"
								description="Edit project details"
								onClick={() => {
									Modal.Manager.open(`update-project-modal-${project.id}`);
								}}
							/>
							<Menu.Option
								icon={<IoPersonRemove />}
								label="Leave Project"
								description="Leave project"
								onClick={handleLeaveProject}
							/>
							<Menu.Option
								icon={<IoTrash />}
								danger
								label="Delete Project"
								description="Permanently delete project"
								onClick={() => {
									Modal.Manager.open(`delete-project-modal-${project.id}`);
								}}
							/>
						</Menu.Section>
					)}
				</Menu>
			)}
		</>
	);
}
