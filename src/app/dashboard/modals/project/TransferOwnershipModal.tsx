"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import Modal from "@pointwise/app/components/ui/modal";
import { useNotifications } from "@pointwise/app/components/ui/NotificationProvider";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import {
	useGetProjectMembersQuery,
	useTransferOwnershipMutation,
} from "@pointwise/generated/api";
import { getErrorMessage } from "@pointwise/lib/api/errors";
import type { Project } from "@pointwise/lib/validation/projects-schema";
import { useState } from "react";
import ProfilePicture from "../../userCard/ProfilePicture";

export interface TransferOwnershipModalProps {
	project: Project;
}

export default function TransferOwnershipModal({
	project,
}: TransferOwnershipModalProps) {
	const { showNotification } = useNotifications();
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

	const {
		data: membersData,
		isLoading: isMembersLoading,
		isError,
		error,
	} = useGetProjectMembersQuery(project.id, {
		skip: !project.id,
	});

	const [transferOwnership, { isLoading: isTransferring }] =
		useTransferOwnershipMutation();

	const adminMembers = (membersData?.members ?? []).filter(
		(m) => m.role === "ADMIN" && m.userId !== project.ownerId,
	);

	const handleTransfer = async () => {
		if (!selectedUserId) return;
		try {
			await transferOwnership({
				projectId: project.id,
				newOwnerId: selectedUserId,
			}).unwrap();
			showNotification({
				message: "Ownership transferred successfully",
				variant: "success",
			});
			Modal.Manager.close(`transfer-ownership-modal-${project.id}`);
		} catch (err) {
			showNotification({
				message: getErrorMessage(err),
				variant: "error",
			});
		}
	};

	const handleReset = () => {
		setSelectedUserId(null);
	};

	return (
		<Modal
			id={`transfer-ownership-modal-${project.id}`}
			size="lg"
			loading={isTransferring}
			onAfterClose={handleReset}
		>
			<Modal.Header title="Transfer Ownership" />
			<Modal.Body>
				<Container direction="vertical" gap="sm" className="items-stretch">
					<div className="px-4 py-3 bg-amber-500/10 border border-amber-400/20 rounded-lg">
						<p className="text-amber-400 text-sm font-medium mb-2">
							Ownership will be transferred
						</p>
						<p className={`${StyleTheme.Text.Secondary} text-sm`}>
							Credit sharing will be disabled until the new owner enables it.
						</p>
					</div>

					{isError ? (
						<p className={`${StyleTheme.Text.Secondary} text-sm p-4`}>
							Failed to load members: {getErrorMessage(error)}
						</p>
					) : isMembersLoading ? (
						<p className={`${StyleTheme.Text.Secondary} text-sm p-4`}>
							Loading members...
						</p>
					) : adminMembers.length === 0 ? (
						<p className={`${StyleTheme.Text.Secondary} text-sm p-4`}>
							No other admins available. Promote a member to admin first.
						</p>
					) : (
						<Container
							direction="vertical"
							gap="xs"
							width="full"
							className="items-stretch"
						>
							{adminMembers.map((member) => (
								<Container
									key={member.userId}
									direction="horizontal"
									width="full"
									className={`p-3 items-center rounded-lg border cursor-pointer transition-colors ${
										selectedUserId === member.userId
											? "bg-blue-500/10 border-blue-400/30"
											: "bg-zinc-700/50 border-zinc-700/80 hover:border-zinc-600"
									}`}
									onClick={() => setSelectedUserId(member.userId)}
								>
									<ProfilePicture
										profilePicture={member.image ?? ""}
										displayName={member.displayName}
										userId={member.userId}
										size="xs"
										className="shrink-0"
									/>
									<span
										className={`text-sm font-medium ${StyleTheme.Text.Primary} truncate flex-1`}
									>
										{member.displayName}
									</span>
									{selectedUserId === member.userId && (
										<span className="text-xs text-blue-400 font-medium shrink-0">
											Selected
										</span>
									)}
								</Container>
							))}
						</Container>
					)}
				</Container>
			</Modal.Body>
			<Modal.Footer align="end">
				<Button variant="secondary">Cancel</Button>
				<Button
					variant="primary"
					disabled={!selectedUserId}
					onClick={handleTransfer}
				>
					Transfer Ownership
				</Button>
			</Modal.Footer>
		</Modal>
	);
}
