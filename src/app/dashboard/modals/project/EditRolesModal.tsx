"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import InputSelect from "@pointwise/app/components/ui/InputSelect";
import Modal from "@pointwise/app/components/ui/modal";
import { useNotifications } from "@pointwise/app/components/ui/NotificationProvider";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import { Tag } from "@pointwise/app/components/ui/Tag";
import {
	useGetProjectMembersQuery,
	useRemoveProjectMemberMutation,
	useUpdateMemberRoleMutation,
} from "@pointwise/generated/api";
import { getErrorMessage } from "@pointwise/lib/api/errors";
import type { Project } from "@pointwise/lib/validation/projects-schema";
import { useSession } from "next-auth/react";
import { useState } from "react";
import ProfilePicture from "../../userCard/ProfilePicture";

export interface EditRolesModalProps {
	project: Project;
}

type RoleOrRemove = "ADMIN" | "USER" | "VIEWER" | "REMOVE";

const roleLabels: Record<string, string> = {
	ADMIN: "Admin",
	USER: "User",
	VIEWER: "Viewer",
	REMOVE: "Remove",
};

const labelToValue: Record<string, RoleOrRemove> = {
	Admin: "ADMIN",
	User: "USER",
	Viewer: "VIEWER",
	Remove: "REMOVE",
};

const dropdownOptions = ["Admin", "User", "Viewer", "Remove"];

const roleTagVariants: Record<string, "info" | "success" | "warning"> = {
	ADMIN: "warning",
	USER: "info",
	VIEWER: "success",
};

export default function EditRolesModal({ project }: EditRolesModalProps) {
	const { showNotification } = useNotifications();
	const { data: session } = useSession();
	const currentUserId = session?.user?.id;
	const isOwner = project.ownerId === currentUserId;

	const [pendingChanges, setPendingChanges] = useState<
		Map<string, RoleOrRemove>
	>(new Map());
	const [isApplying, setIsApplying] = useState(false);

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

	const members = membersData?.members ?? [];

	const handleRoleSelect = (
		userId: string,
		originalRole: string,
		label: string,
	) => {
		const value = labelToValue[label];
		if (!value) return;

		setPendingChanges((prev) => {
			const next = new Map(prev);
			if (value === originalRole) {
				next.delete(userId);
			} else {
				next.set(userId, value);
			}
			return next;
		});
	};

	const handleApply = async () => {
		setIsApplying(true);
		let successCount = 0;
		let errorCount = 0;

		for (const [userId, newValue] of pendingChanges) {
			try {
				if (newValue === "REMOVE") {
					await removeProjectMember({
						projectId: project.id,
						targetId: userId,
					}).unwrap();
				} else {
					await updateMemberRole({
						projectId: project.id,
						targetId: userId,
						role: newValue,
					}).unwrap();
				}
				successCount++;
			} catch (err) {
				errorCount++;
				showNotification({
					message: getErrorMessage(err),
					variant: "error",
				});
			}
		}

		if (successCount > 0) {
			showNotification({
				message: `${successCount} change${successCount > 1 ? "s" : ""} applied`,
				variant: "success",
			});
		}

		if (errorCount === 0) {
			setPendingChanges(new Map());
			Modal.Manager.close(`edit-roles-modal-${project.id}`);
		}

		setIsApplying(false);
	};

	const handleReset = () => {
		setPendingChanges(new Map());
	};

	return (
		<Modal
			id={`edit-roles-modal-${project.id}`}
			size="xl"
			loading={(isLoading && !membersData) || isApplying}
			onAfterClose={handleReset}
		>
			<Modal.Header title="Edit Roles" />
			<Modal.Body>
				{isError ? (
					<p className={`${StyleTheme.Text.Secondary} text-sm p-4`}>
						Failed to load members: {getErrorMessage(error)}
					</p>
				) : members.length > 0 ? (
					<Container
						direction="vertical"
						width="full"
						className="items-stretch"
					>
						{members.map((member) => {
							const isCurrentUser = member.userId === currentUserId;
							const canManage =
								!isCurrentUser && (isOwner || member.role !== "ADMIN");
							const pendingValue = pendingChanges.get(member.userId);
							const hasChange = pendingValue !== undefined;

							return (
								<Container
									key={member.userId}
									direction="horizontal"
									width="full"
									className={`p-3 items-center rounded-lg border ${
										hasChange
											? pendingValue === "REMOVE"
												? "bg-rose-500/10 border-rose-400/20"
												: "bg-blue-500/10 border-blue-400/20"
											: "bg-zinc-700/50 border-zinc-700/80"
									}`}
								>
									<ProfilePicture
										profilePicture={member.image ?? ""}
										displayName={member.displayName}
										userId={member.userId}
										size="xs"
										className="shrink-0"
									/>
									<Container
										direction="horizontal"
										gap="sm"
										width="full"
										className="items-center min-w-0"
									>
										<span
											className={`text-sm font-medium ${StyleTheme.Text.Primary} truncate`}
										>
											{member.displayName}
										</span>
										{isCurrentUser && (
											<Tag variant="info" size="sm">
												You
											</Tag>
										)}
									</Container>
									{canManage ? (
										<Container
											direction="horizontal"
											width="auto"
											className="items-center shrink-0"
										>
											<InputSelect
												options={dropdownOptions}
												defaultValue={roleLabels[member.role]}
												onSelect={(label) =>
													handleRoleSelect(member.userId, member.role, label)
												}
												variant={
													pendingValue === "REMOVE" ? "danger" : "secondary"
												}
												size="xs"
												flex="shrink"
												disabled={isApplying}
											/>
										</Container>
									) : (
										<Container
											direction="horizontal"
											width="auto"
											className="items-center shrink-0"
										>
											<Tag
												variant={roleTagVariants[member.role] ?? "info"}
												size="sm"
											>
												{roleLabels[member.role] ?? member.role}
											</Tag>
										</Container>
									)}
								</Container>
							);
						})}
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
				<Button variant="secondary">Cancel</Button>
				<Button
					variant="primary"
					disabled={pendingChanges.size === 0}
					onClick={handleApply}
					loading={isApplying}
				>
					Apply Changes
				</Button>
			</Modal.Footer>
		</Modal>
	);
}
