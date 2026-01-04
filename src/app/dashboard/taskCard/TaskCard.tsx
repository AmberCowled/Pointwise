"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import Modal from "@pointwise/app/components/ui/modal";
import { TextPreview } from "@pointwise/app/components/ui/TextPreview";
import { utcNow, utcToLocal } from "@pointwise/lib/api/date-time";
import { hasWriteAccess } from "@pointwise/lib/api/projects";
import { useUpdateTaskMutation } from "@pointwise/lib/redux/services/tasksApi";
import { useUpdateXPMutation } from "@pointwise/lib/redux/services/xpApi";
import type { Project } from "@pointwise/lib/validation/projects-schema";
import type { Task } from "@pointwise/lib/validation/tasks-schema";
import UpdateTaskModal from "../modals/task/UpdateTaskModal";
import TaskCardCategory from "./TaskCardCategory";
import TaskCardDate from "./TaskCardDate";
import TaskCardOptional from "./TaskCardOptional";
import TaskCardStatus from "./TaskCardStatus";
import TaskCardXP from "./TaskCardXP";

export default function TaskCard({
	task,
	project,
}: {
	task: Task;
	project: Project;
}) {
	const isOverdue = () => {
		if (task?.status === "COMPLETED") return false;
		if (task?.dueDate === null || task?.dueDate === undefined) return false;
		const localDue = utcToLocal(task.dueDate);
		const localDueDate = localDue?.date;
		const localDueTime = localDue?.time;
		if (localDueDate === null || localDueDate === undefined) return false;
		const localNow = new Date();
		if (localNow > localDueDate) {
			if (
				task?.hasDueTime &&
				localDueTime !== null &&
				localDueTime !== undefined
			) {
				const localNowTime = new Date().toLocaleTimeString();
				if (localNowTime > localDueTime) {
					return true;
				}
				return false;
			}
			return true;
		}
		return false;
	};

	const [updateTask, { isLoading: isCompletingTask }] = useUpdateTaskMutation();
	const [updateXP] = useUpdateXPMutation();

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
				await handleRewardXp(response.task.xpAward);
			}
		} catch (error) {
			console.error(error);
		}
	};

	const handleRewardXp = async (xpAward: number) => {
		try {
			await updateXP({ delta: xpAward }).unwrap();
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<>
			<UpdateTaskModal task={task} project={project} />
			<Container
				direction="vertical"
				gap="sm"
				width="full"
				className="bg-black/50 rounded-lg border border-zinc-800 hover:border-zinc-600 cursor-pointer p-4"
				onClick={() => {
					if (hasWriteAccess(project.role) && task.status !== "COMPLETED") {
						Modal.Manager.open(`update-task-modal-${task.id}`);
					}
				}}
			>
				<Container width="full">
					<Container gap="sm" width="full">
						<TextPreview
							text={task.title}
							lines={2}
							placeholder="No title"
							size="md"
							className="text-md font-bold"
						/>
						<TaskCardCategory category={task.category} />
					</Container>
					<Container width="auto" className="justify-end">
						<TaskCardXP xp={task.xpAward} />
					</Container>
				</Container>

				<Container width="full">
					<Container width="full">
						<TextPreview
							text={task.description}
							lines={3}
							placeholder="No description"
							size="sm"
							className="text-zinc-400"
						/>
					</Container>
					<Container width="auto" className="justify-end">
						<Container width="full" direction="vertical" gap="xs">
							<TaskCardStatus
								status={isOverdue() ? "OVERDUE" : (task.status ?? "PENDING")}
							/>
							<TaskCardOptional optional={task.optional} />
						</Container>
					</Container>
				</Container>

				<Container width="full">
					<Container
						direction="vertical"
						width="full"
						gap="xs"
						className="items-start"
					>
						<TaskCardDate
							label="Start"
							date={task.startDate ?? ""}
							hasTime={task.hasStartTime ?? false}
						/>
						<TaskCardDate
							label="Due"
							date={task.dueDate ?? ""}
							hasTime={task.hasDueTime ?? false}
						/>
					</Container>
					<Container width="auto" className="justify-end">
						{task.status === "PENDING" && hasWriteAccess(project.role) ? (
							<Button
								size="xs"
								className="min-w-25 hover:cursor-pointer"
								loading={isCompletingTask}
								onClick={handleCompleteTask}
							>
								Complete
							</Button>
						) : null}
					</Container>
				</Container>
			</Container>
		</>
	);
}
