"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import { ErrorCard } from "@pointwise/app/components/ui/ErrorCard";
import Modal from "@pointwise/app/components/ui/modal";
import { useNotifications } from "@pointwise/app/components/ui/NotificationProvider";
import { getErrorMessage } from "@pointwise/lib/api/errors";
import {
	useGetProjectInvitesQuery,
	useRejectInviteMutation,
} from "@pointwise/lib/redux/services/invitesApi";
import type { Project } from "@pointwise/lib/validation/projects-schema";
import { useState } from "react";
import InviteCard from "./InviteCard";

export interface ManageProjectInvitesModalProps {
	project: Project;
}

export default function ManageProjectInvitesModal({
	project,
}: ManageProjectInvitesModalProps) {
	const { showNotification } = useNotifications();
	const [cancelingInviteId, setCancelingInviteId] = useState<string | null>(
		null,
	);

	const { data, isLoading, isError, error } = useGetProjectInvitesQuery(
		project.id,
		{
			skip: !project.id,
		},
	);

	const [rejectInvite] = useRejectInviteMutation();

	const handleCancelInvite = async (inviteId: string) => {
		setCancelingInviteId(inviteId);
		try {
			await rejectInvite(inviteId).unwrap();
			showNotification({
				message: "Invite canceled successfully",
				variant: "success",
			});
		} catch (error) {
			showNotification({
				message: getErrorMessage(error),
				variant: "error",
			});
		} finally {
			setCancelingInviteId(null);
		}
	};

	const invites = data?.invites || [];
	const hasInvites = invites.length > 0;

	return (
		<Modal
			id={`manage-invites-modal-${project.id}`}
			size="xl"
			loading={isLoading && !data}
		>
			<Modal.Header title="Manage Invites" />
			<Modal.Body>
				{isError ? (
					<ErrorCard
						display={true}
						message={getErrorMessage(error)}
						onRetry={() => window.location.reload()}
					/>
				) : hasInvites ? (
					<Container direction="vertical" gap="md" className="items-stretch">
						{invites.map((invite) => (
							<InviteCard
								key={invite.id}
								invite={invite}
								onCancel={handleCancelInvite}
								isCanceling={cancelingInviteId === invite.id}
							/>
						))}
					</Container>
				) : (
					<Container
						direction="vertical"
						gap="md"
						width="full"
						className="items-center justify-center py-12"
					>
						<p className="text-zinc-400 text-sm">No pending invites</p>
					</Container>
				)}
			</Modal.Body>
			<Modal.Footer align="end">
				<Button variant="secondary">Close</Button>
			</Modal.Footer>
		</Modal>
	);
}
