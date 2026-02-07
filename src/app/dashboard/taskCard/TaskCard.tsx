"use client";

import Container from "@pointwise/app/components/ui/Container";
import { useNotifications } from "@pointwise/app/components/ui/NotificationProvider";
import { llmApi } from "@pointwise/lib/api/llm";
import { hasWriteAccess } from "@pointwise/lib/api/projects";
import { useAppDispatch } from "@pointwise/lib/redux/hooks";
import { tasksApi } from "@pointwise/lib/redux/services/tasksApi";
import type { Project } from "@pointwise/lib/validation/projects-schema";
import type { Task } from "@pointwise/lib/validation/tasks-schema";
import { useCallback, useRef, useState } from "react";
import UpdateTaskModal from "../modals/task/UpdateTaskModal";
import TaskCardCommentButton from "./TaskCardCommentButton";
import TaskCardDate from "./TaskCardDate";
import TaskCardLikeButton from "./TaskCardLikeButton";
import TaskCardMenu from "./TaskCardMenu";
import TaskCardOptional from "./TaskCardOptional";
import TaskStatus from "./TaskCardStatus";
import TaskDescription from "./TaskDescription";
import TaskHeader from "./TaskHeader";

export interface TaskCardProps {
	task: Task;
	project: Project;
}

export default function TaskCard({ task, project }: TaskCardProps) {
	const dispatch = useAppDispatch();
	const { showNotification } = useNotifications();
	const [open, setOpen] = useState(false);
	const compact = !open;

	const [isRetryingXp, setIsRetryingXp] = useState(false);
	const isRetryingXpRef = useRef(false);

	const handleRetryXp = useCallback(async () => {
		if (isRetryingXpRef.current) return;
		isRetryingXpRef.current = true;
		setIsRetryingXp(true);
		try {
			await llmApi.submitXpSuggestion(task.id);
			dispatch(tasksApi.util.invalidateTags(["Tasks"]));
			showNotification({
				message: "XP suggestion requested",
				variant: "success",
			});
		} catch {
			showNotification({
				message: "Failed to request XP suggestion",
				variant: "error",
			});
		} finally {
			isRetryingXpRef.current = false;
			setIsRetryingXp(false);
		}
	}, [task.id, dispatch, showNotification]);

	const canRetryXp =
		(task.xpAwardSource ?? "MANUAL") === "AI_FAILED" &&
		hasWriteAccess(project.role ?? "NONE") &&
		!isRetryingXp;

	return (
		<>
			<UpdateTaskModal task={task} project={project} />
			<Container
				direction="vertical"
				width="full"
				gap="none"
				className="bg-zinc-900/50 px-4 py-2 rounded-lg border border-zinc-700/50 hover:border-white/20 items-start"
			>
				<TaskHeader
					task={task}
					open={open}
					onChange={setOpen}
					onRetryXp={handleRetryXp}
					canRetryXp={canRetryXp}
					isRetryingXp={isRetryingXp}
				/>
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
						<TaskCardLikeButton />
						<TaskCardCommentButton />
					</Container>

					<TaskCardMenu task={task} project={project} />
				</Container>
			</Container>
		</>
	);
}
