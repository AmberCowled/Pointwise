import { Button } from "@pointwise/app/components/ui/Button";
import Modal from "@pointwise/app/components/ui/modal";
import { useNotifications } from "@pointwise/app/components/ui/NotificationProvider";
import Page from "@pointwise/app/components/ui/Page";
import { useInviteUsersToProjectMutation } from "@pointwise/generated/api";
import { getErrorMessage } from "@pointwise/lib/api/errors";
import type { Project } from "@pointwise/lib/validation/projects-schema";
import type { SearchableUser } from "@pointwise/lib/validation/users-schema";
import { useState } from "react";
import Container from "../../../components/ui/Container";
import InviteRequestCard from "./InviteRequestCard";

export interface InviteAsRoleModalProps {
	inviteUser: SearchableUser;
	project: Project;
}

export default function InviteAsRoleModal({
	inviteUser,
	project,
}: InviteAsRoleModalProps) {
	const { showNotification } = useNotifications();
	const [isInviting, setIsInviting] = useState(false);

	const [inviteUsersToProject] = useInviteUsersToProjectMutation();

	const handleInvite = async (
		userId: string,
		role: "ADMIN" | "USER" | "VIEWER",
	) => {
		setIsInviting(true);
		try {
			await inviteUsersToProject({
				projectId: project.id,
				data: { invites: [{ userId, role }] },
			}).unwrap();
			showNotification({
				message: "Invite sent successfully",
				variant: "success",
			});
			Modal.Manager.close(
				`invite-as-role-modal-${inviteUser.id}-${project.id}`,
			);
		} catch (error) {
			showNotification({
				message: getErrorMessage(error),
				variant: "error",
			});
		} finally {
			setIsInviting(false);
		}
	};

	return (
		<Modal
			id={`invite-as-role-modal-${inviteUser.id}-${project.id}`}
			size="fullscreen"
		>
			<Modal.Header
				title={`Invite to ${project.name}`}
				className="text-center"
			/>
			<Modal.Body className="p-0!">
				<Page height="auto" backgroundGlow={false}>
					<Container direction="vertical" gap="sm" className="pt-2">
						<InviteRequestCard
							key={`invite-request-card-${inviteUser.id}-${project.id}`}
							invitee={inviteUser}
							projectName={project.name}
							onInvite={handleInvite}
							isInviting={isInviting}
						/>
					</Container>
				</Page>
			</Modal.Body>
			<Modal.Footer align="center" className="p-0!">
				<Button
					variant="secondary"
					className="w-full min-h-[60px] rounded-none border-none border-t border-white/10 m-0"
				>
					Cancel
				</Button>
			</Modal.Footer>
		</Modal>
	);
}
