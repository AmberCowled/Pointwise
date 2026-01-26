"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import Menu from "@pointwise/app/components/ui/menu";
import Modal from "@pointwise/app/components/ui/modal";
import { useNotifications } from "@pointwise/app/components/ui/NotificationProvider";
import { utcNow } from "@pointwise/lib/api/date-time";
import { hasDeleteAccess, hasWriteAccess } from "@pointwise/lib/api/projects";
import { useUpdateTaskMutation } from "@pointwise/lib/redux/services/tasksApi";
import { useUpdateXPMutation } from "@pointwise/lib/redux/services/xpApi";
import type { Project } from "@pointwise/lib/validation/projects-schema";
import type { Task } from "@pointwise/lib/validation/tasks-schema";
import { useState } from "react";
import {
	IoChatbubbleOutline,
	IoCheckmarkCircleOutline,
	IoEllipsisHorizontal,
	IoHeartOutline,
	IoPencilOutline,
	IoPersonAddOutline,
	IoTrashOutline,
} from "react-icons/io5";
import UpdateTaskModal from "../modals/task/UpdateTaskModal";
import TaskCardDate from "./TaskCardDate";
import TaskCardOptional from "./TaskCardOptional";
import TaskStatus from "./TaskCardStatus";
import TaskDescription from "./TaskDescription";
import TaskHeader from "./TaskHeader";

export interface TaskCardV2Props {
	task: Task;
	project: Project;
}

export default function TaskCardV2({ task, project }: TaskCardV2Props) {
	const [open, setOpen] = useState(false);
	const compact = !open;
	const [updateTask] = useUpdateTaskMutation();
	const [updateXP] = useUpdateXPMutation();
	const { showNotification } = useNotifications();

	const handleCompleteTask = async () => {
		try {
			const response = await updateTask({
				taskId: task.id,
				data: {
					projectId: project.id,
					completedAt: utcNow(),
					status: "COMPLETED",
				},
			}).unwrap();
			if (response.task) {
				await updateXP({ delta: response.task.xpAward }).unwrap();
			}

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
		<>
			<UpdateTaskModal task={task} project={project} />
			<Container
				direction="vertical"
				width="full"
				gap="none"
				className="bg-zinc-900/50 px-4 py-2 rounded-lg border border-zinc-700/50 hover:border-white/20 items-start"
			>
				<TaskHeader task={task} open={open} onChange={setOpen} />
				{task.description && (
					<TaskDescription description={task.description} compact={compact} />
				)}

				<Container
					direction="vertical"
					width="full"
					gap="sm"
					className="py-2 border-b border-zinc-700/50"
				>
					<Container width="full" gap="sm">
						<TaskStatus status={task.status ?? "PENDING"} />
						<TaskCardOptional optional={task.optional} />
					</Container>
					{(task.startDate || task.dueDate) && (
						<Container width="full" gap="md" className="flex-wrap">
							{task.startDate && (
								<TaskCardDate
									label="Start"
									date={task.startDate}
									hasTime={task.hasStartTime ?? false}
								/>
							)}
							{task.dueDate && (
								<TaskCardDate
									label="Due"
									date={task.dueDate}
									hasTime={task.hasDueTime ?? false}
								/>
							)}
						</Container>
					)}
				</Container>

				<Container width="full" gap="sm" className="pt-2 justify-between">
					<Container width="auto" gap="xs">
						<Button
							variant="ghost"
							size="sm"
							icon={IoHeartOutline}
							disabled
							title="Like (Coming Soon)"
						>
							<span className="text-xs ml-1 font-medium text-zinc-400">0</span>
						</Button>
						<Button
							variant="ghost"
							size="sm"
							icon={IoChatbubbleOutline}
							disabled
							title="Comment (Coming Soon)"
						>
							<span className="text-xs ml-1 font-medium text-zinc-400">0</span>
						</Button>
					</Container>

					<Menu
						trigger={
							<Button
								variant="ghost"
								size="sm"
								icon={IoEllipsisHorizontal}
								className="text-zinc-400 hover:text-white"
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
								onClick={() =>
									Modal.Manager.open(`update-task-modal-${task.id}`)
								}
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
									onClick={() =>
										Modal.Manager.open(`delete-task-modal-${task.id}`)
									}
								/>
							</Menu.Section>
						)}
					</Menu>
				</Container>
			</Container>
		</>
	);
}
