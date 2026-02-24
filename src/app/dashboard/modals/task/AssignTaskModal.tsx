"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import { Checkbox } from "@pointwise/app/components/ui/Checkbox";
import Container from "@pointwise/app/components/ui/Container";
import { ErrorCard } from "@pointwise/app/components/ui/ErrorCard";
import Modal from "@pointwise/app/components/ui/modal";
import { useNotifications } from "@pointwise/app/components/ui/NotificationProvider";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import { Tag } from "@pointwise/app/components/ui/Tag";
import {
	useGetProjectMembersQuery,
	useUpdateTaskAssignmentsMutation,
} from "@pointwise/generated/api";
import { getErrorMessage } from "@pointwise/lib/api/errors";
import type { Project } from "@pointwise/lib/validation/projects-schema";
import type { Task } from "@pointwise/lib/validation/tasks-schema";
import { useState } from "react";
import ProfilePicture from "../../userCard/ProfilePicture";

export interface AssignTaskModalProps {
	task: Task;
	project: Project;
}

const roleTagVariants: Record<
	"ADMIN" | "USER" | "VIEWER",
	"info" | "success" | "warning"
> = {
	ADMIN: "warning",
	USER: "info",
	VIEWER: "success",
};

const roleLabels: Record<"ADMIN" | "USER" | "VIEWER", string> = {
	ADMIN: "Admin",
	USER: "User",
	VIEWER: "Viewer",
};

export default function AssignTaskModal({
	task,
	project,
}: AssignTaskModalProps) {
	const { showNotification } = useNotifications();
	const [selectedIds, setSelectedIds] = useState<Set<string>>(
		new Set(task.assignedUserIds ?? []),
	);

	const {
		data: membersData,
		isLoading,
		isError,
		error,
	} = useGetProjectMembersQuery(project.id, {
		skip: !project.id,
	});

	const [updateTaskAssignments, { isLoading: isSaving }] =
		useUpdateTaskAssignmentsMutation();

	const eligibleMembers = (membersData?.members ?? []).filter(
		(m) => m.role === "ADMIN" || m.role === "USER",
	);

	const handleToggle = (userId: string) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(userId)) {
				next.delete(userId);
			} else {
				next.add(userId);
			}
			return next;
		});
	};

	const handleSave = async () => {
		try {
			await updateTaskAssignments({
				taskId: task.id,
				data: {
					projectId: project.id,
					assignedUserIds: [...selectedIds],
				},
			}).unwrap();
			Modal.Manager.close(`assign-task-modal-${task.id}`);
			showNotification({
				message: "Task assignments updated",
				variant: "success",
			});
		} catch (err) {
			showNotification({
				message: getErrorMessage(err),
				variant: "error",
			});
		}
	};

	const handleReset = () => {
		setSelectedIds(new Set(task.assignedUserIds ?? []));
	};

	return (
		<Modal
			id={`assign-task-modal-${task.id}`}
			size="xl"
			loading={isSaving}
			onAfterClose={handleReset}
		>
			<Modal.Header title="Assign Members" />
			<Modal.Body>
				{isLoading && !membersData ? (
					<Container
						direction="vertical"
						width="full"
						className="items-center justify-center py-12"
					>
						<p className={`${StyleTheme.Text.Secondary} text-sm`}>
							Loading members...
						</p>
					</Container>
				) : isError ? (
					<ErrorCard
						display={true}
						message={getErrorMessage(error)}
						onRetry={() => window.location.reload()}
					/>
				) : eligibleMembers.length > 0 ? (
					<Container
						direction="vertical"
						width="full"
						gap="sm"
						className="items-stretch"
					>
						{eligibleMembers.map((member) => (
							<Container
								key={member.userId}
								width="full"
								direction="horizontal"
								className="p-3 items-center bg-zinc-700/50 rounded-lg border border-zinc-700/80 cursor-pointer"
								onClick={() => handleToggle(member.userId)}
							>
								<Checkbox
									checked={selectedIds.has(member.userId)}
									onChange={() => handleToggle(member.userId)}
									size="sm"
								/>
								<ProfilePicture
									profilePicture={member.image ?? ""}
									displayName={member.displayName}
									size="xs"
									className="shrink-0"
								/>
								<span
									className={`text-sm font-medium ${StyleTheme.Text.Primary} truncate`}
								>
									{member.displayName}
								</span>
								<Tag
									variant={roleTagVariants[member.role as "ADMIN" | "USER"]}
									size="sm"
								>
									{roleLabels[member.role as "ADMIN" | "USER"]}
								</Tag>
							</Container>
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
							No eligible members found
						</p>
					</Container>
				)}
			</Modal.Body>
			<Modal.Footer align="end">
				<Button variant="secondary">Cancel</Button>
				<Button onClick={handleSave} disabled={isSaving}>
					Save
				</Button>
			</Modal.Footer>
		</Modal>
	);
}
