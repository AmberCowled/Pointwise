import { Button } from "@pointwise/app/components/ui/Button";
import Menu from "@pointwise/app/components/ui/menu";
import Modal from "@pointwise/app/components/ui/modal";
import { useNotifications } from "@pointwise/app/components/ui/NotificationProvider";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import { useUpdateTaskMutation } from "@pointwise/generated/api";
import { invalidateTags } from "@pointwise/generated/invalidation";
import { utcNow } from "@pointwise/lib/api/date-time";
import { hasDeleteAccess, hasWriteAccess } from "@pointwise/lib/api/projects";
import { useAppDispatch } from "@pointwise/lib/redux/hooks";
import type { Project } from "@pointwise/lib/validation/projects-schema";
import type { Task } from "@pointwise/lib/validation/tasks-schema";
import {
	IoCheckmarkCircleOutline,
	IoEllipsisHorizontal,
	IoPencilOutline,
	IoPersonAddOutline,
	IoTrashOutline,
} from "react-icons/io5";

export interface TaskCardMenuProps {
	task: Task;
	project: Project;
}

export default function TaskCardMenu({ task, project }: TaskCardMenuProps) {
	const dispatch = useAppDispatch();
	const [updateTask] = useUpdateTaskMutation();
	const { showNotification } = useNotifications();

	const handleCompleteTask = async () => {
		try {
			await updateTask({
				taskId: task.id,
				data: {
					projectId: project.id,
					completedAt: utcNow(),
					status: "COMPLETED",
				},
			}).unwrap();
			dispatch(invalidateTags(["XP"]));

			showNotification({
				message: "Task completed successfully",
				variant: "success",
			});
		} catch (_error) {
			showNotification({
				message: "Failed to complete task",
				variant: "error",
			});
		}
	};

	return (
		<Menu
			trigger={
				<Button
					variant="ghost"
					size="sm"
					icon={IoEllipsisHorizontal}
					className={`${StyleTheme.Text.Secondary} hover:text-white`}
				/>
			}
		>
			<Menu.Section title="User">
				<Menu.Option
					label="Complete"
					icon={<IoCheckmarkCircleOutline className="text-green-400" />}
					onClick={handleCompleteTask}
					disabled={
						task.status === "COMPLETED" || !hasWriteAccess(project.role)
					}
				/>
				<Menu.Option
					label="Edit Task"
					icon={<IoPencilOutline className="text-blue-400" />}
					onClick={() => Modal.Manager.open(`update-task-modal-${task.id}`)}
					disabled={
						task.status === "COMPLETED" || !hasWriteAccess(project.role)
					}
				/>
				<Menu.Option
					label="Assign"
					icon={<IoPersonAddOutline className="text-indigo-400" />}
					disabled
					description="Coming Soon"
				/>
			</Menu.Section>
			{hasDeleteAccess(project.role) && (
				<Menu.Section title="Admin">
					<Menu.Option
						label="Delete"
						icon={<IoTrashOutline className="text-rose-400" />}
						danger
						onClick={() => Modal.Manager.open(`delete-task-modal-${task.id}`)}
					/>
				</Menu.Section>
			)}
		</Menu>
	);
}
