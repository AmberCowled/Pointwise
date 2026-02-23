"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import { ErrorCard } from "@pointwise/app/components/ui/ErrorCard";
import Modal from "@pointwise/app/components/ui/modal";
import { useNotifications } from "@pointwise/app/components/ui/NotificationProvider";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import {
	useGetProjectMembersQuery,
	useRemoveProjectMemberMutation,
	useUpdateMemberRoleMutation,
} from "@pointwise/generated/api";
import { getErrorMessage } from "@pointwise/lib/api/errors";
import type { Project } from "@pointwise/lib/validation/projects-schema";
import { useSession } from "next-auth/react";
import { useState } from "react";
import ProjectMemberCard from "./ProjectMemberCard";

export interface ViewMembersModalProps {
	project: Project;
}

export default function ViewMembersModal({ project }: ViewMembersModalProps) {
	const { showNotification } = useNotifications();
	const { data: session } = useSession();
	const currentUserId = session?.user?.id;
	const [loadingMemberId, setLoadingMemberId] = useState<string | null>(null);

	const {
		data: membersData,
		isLoading,
		isError,
		error,
	} = useGetProjectMembersQuery(project.id, {
		skip: !project.id,
	});

	const [updateMemberRole] = useUpdateMemberRoleMutation();
	const [removeProjectMember] = useRemoveProjectMemberMutation();

	const handleRoleChange = async (
		userId: string,
		role: "ADMIN" | "USER" | "VIEWER",
	) => {
		setLoadingMemberId(userId);
		try {
			await updateMemberRole({
				projectId: project.id,
				targetId: userId,
				role,
			}).unwrap();
			showNotification({
				message: "Role updated successfully",
				variant: "success",
			});
		} catch (err) {
			showNotification({
				message: getErrorMessage(err),
				variant: "error",
			});
		} finally {
			setLoadingMemberId(null);
		}
	};

	const handleRemove = async (userId: string) => {
		const confirmed = await Modal.Confirm({
			title: "Remove Member",
			message: "Are you sure you want to remove this member from the project?",
			confirmText: "Remove",
			confirmVariant: "danger",
		});
		if (!confirmed) return;

		setLoadingMemberId(userId);
		try {
			await removeProjectMember({
				projectId: project.id,
				targetId: userId,
			}).unwrap();
			showNotification({
				message: "Member removed successfully",
				variant: "success",
			});
		} catch (err) {
			showNotification({
				message: getErrorMessage(err),
				variant: "error",
			});
		} finally {
			setLoadingMemberId(null);
		}
	};

	const members = membersData?.members ?? [];
	const isAdmin = project.role === "ADMIN";

	return (
		<Modal
			id={`view-members-modal-${project.id}`}
			size="xl"
			loading={isLoading && !membersData}
		>
			<Modal.Header title="Project Members" />
			<Modal.Body>
				{isError ? (
					<ErrorCard
						display={true}
						message={getErrorMessage(error)}
						onRetry={() => window.location.reload()}
					/>
				) : members.length > 0 ? (
					<Container
						direction="vertical"
						width="full"
						className="items-stretch"
					>
						{members.map((member) => (
							<ProjectMemberCard
								key={`${member.userId}-${member.role}`}
								member={member}
								isAdmin={isAdmin}
								isCurrentUser={member.userId === currentUserId}
								onRoleChange={handleRoleChange}
								onRemove={handleRemove}
								isLoading={loadingMemberId === member.userId}
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
						<p className={`${StyleTheme.Text.Secondary} text-sm`}>
							No members found
						</p>
					</Container>
				)}
			</Modal.Body>
			<Modal.Footer align="end">
				<Button variant="secondary">Close</Button>
			</Modal.Footer>
		</Modal>
	);
}
