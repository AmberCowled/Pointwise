"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Menu from "@pointwise/app/components/ui/menu";
import Modal from "@pointwise/app/components/ui/modal";
import ManageJoinRequestsModal from "@pointwise/app/dashboard/modals/joinRequest/ManageJoinRequestsModal";
import LeaveProjectConfirmModal from "@pointwise/app/dashboard/modals/project/LeaveProjectConfirmModal";
import ManageProjectInvitesModal from "@pointwise/app/dashboard/modals/project/ManageProjectInvitesModal";
import UpdateProjectModal from "@pointwise/app/dashboard/modals/project/UpdateProjectModal";
import type { Project } from "@pointwise/lib/validation/projects-schema";
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
	const isOnlyAdmin =
		project.role === "ADMIN" && project.adminUserIds?.length === 1;

	return (
		<>
			{project.role === "ADMIN" && (
				<>
					<UpdateProjectModal project={project} />
					<ManageProjectInvitesModal project={project} />
					<ManageJoinRequestsModal project={project} />
				</>
			)}
			{project.role !== "NONE" && (
				<LeaveProjectConfirmModal project={project} />
			)}
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
							<Menu.Option
								icon={<IoPersonRemove />}
								label="Leave Project"
								description="Leave project"
								disabled={isOnlyAdmin}
								onClick={() =>
									Modal.Manager.open(`leave-project-modal-${project.id}`)
								}
							/>
						</Menu.Section>
					)}
					{project.role === "ADMIN" && (
						<Menu.Section title="Admin">
							{project.joinRequestUserIds.length > 0 && (
								<Menu.Option
									icon={<IoClipboard />}
									label={`Pending Requests (${project.joinRequestUserIds.length})`}
									description="Manage pending requests"
									onClick={() => {
										Modal.Manager.open(
											`manage-join-requests-modal-${project.id}`,
										);
									}}
								/>
							)}
							{(project.inviteCount ?? 0) > 0 && (
								<Menu.Option
									icon={<IoMail />}
									label="Pending Invites"
									description="Manage pending invites"
									onClick={() => {
										Modal.Manager.open(`manage-invites-modal-${project.id}`);
									}}
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
