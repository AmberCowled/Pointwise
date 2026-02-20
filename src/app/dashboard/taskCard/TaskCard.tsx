"use client";

import Container from "@pointwise/app/components/ui/Container";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import type { Project } from "@pointwise/lib/validation/projects-schema";
import type { Task } from "@pointwise/lib/validation/tasks-schema";
import { useState } from "react";
import UpdateTaskModal from "../modals/task/UpdateTaskModal";
import TaskCardCommentButton from "./TaskCardCommentButton";
import TaskCardCommentSection from "./TaskCardCommentSection";
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
	const [open, setOpen] = useState(false);
	const [commentsOpen, setCommentsOpen] = useState(false);
	const compact = !open;

	return (
		<>
			<UpdateTaskModal task={task} project={project} />
			<Container
				direction="vertical"
				width="full"
				gap="none"
				className={`${StyleTheme.Container.BackgroundSubtle} px-4 py-2 rounded-lg border border-zinc-700/50 ${StyleTheme.Hover.BorderLift} items-start`}
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
						<TaskCardLikeButton task={task} />
						<TaskCardCommentButton
							commentCount={task.commentCount ?? 0}
							onClick={() => setCommentsOpen(!commentsOpen)}
							isOpen={commentsOpen}
						/>
					</Container>

					<TaskCardMenu task={task} project={project} />
				</Container>
				{commentsOpen && (
					<TaskCardCommentSection
						taskId={task.id}
						projectId={task.projectId}
						isProjectAdmin={project.role === "ADMIN"}
					/>
				)}
			</Container>
		</>
	);
}
