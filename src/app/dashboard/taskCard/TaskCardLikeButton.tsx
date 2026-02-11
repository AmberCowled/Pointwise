"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import {
	useLikeTaskMutation,
	useUnlikeTaskMutation,
} from "@pointwise/lib/redux/services/tasksApi";
import type { Task } from "@pointwise/lib/validation/tasks-schema";
import { IoHeart, IoHeartOutline } from "react-icons/io5";

export interface TaskCardLikeButtonProps {
	task: Task;
}

export default function TaskCardLikeButton({ task }: TaskCardLikeButtonProps) {
	const [likeTask, { isLoading: isLiking }] = useLikeTaskMutation();
	const [unlikeTask, { isLoading: isUnliking }] = useUnlikeTaskMutation();

	const isLoading = isLiking || isUnliking;
	const likedByCurrentUser = task.likedByCurrentUser ?? false;
	const likeCount = task.likeCount ?? 0;

	const handleClick = () => {
		if (isLoading) return;
		if (likedByCurrentUser) {
			unlikeTask({ taskId: task.id, projectId: task.projectId });
		} else {
			likeTask({ taskId: task.id, projectId: task.projectId });
		}
	};

	const LikeIcon = likedByCurrentUser ? IoHeart : IoHeartOutline;

	return (
		<Button
			type="button"
			variant="ghost"
			size="sm"
			disabled={isLoading}
			title={likedByCurrentUser ? "Unlike" : "Like"}
			onClick={handleClick}
			className={
				likedByCurrentUser ? "text-rose-500! hover:text-rose-400!" : undefined
			}
		>
			<LikeIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
			<span
				className={`text-xs font-medium ${likedByCurrentUser ? "text-rose-500!" : "text-zinc-400"}`}
			>
				{likeCount}
			</span>
		</Button>
	);
}
