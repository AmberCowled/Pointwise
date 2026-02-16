"use client";

import Container from "@pointwise/app/components/ui/Container";
import { useSubscribeTaskComments } from "@pointwise/lib/realtime/hooks";
import type { CommentEventPayload } from "@pointwise/lib/realtime/types";
import {
	commentsApi,
	useGetCommentsQuery,
} from "@pointwise/lib/redux/services/commentsApi";
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import CommentInput from "./comments/CommentInput";
import CommentList from "./comments/CommentList";

export interface TaskCardCommentSectionProps {
	taskId: string;
	projectId: string;
	isProjectAdmin?: boolean;
}

export default function TaskCardCommentSection({
	taskId,
	projectId,
	isProjectAdmin = false,
}: TaskCardCommentSectionProps) {
	const { data, isLoading } = useGetCommentsQuery({ taskId, projectId });
	const dispatch = useDispatch();

	const invalidateComments = useCallback(() => {
		dispatch(
			commentsApi.util.invalidateTags([{ type: "Comments", id: taskId }]),
		);
	}, [dispatch, taskId]);

	const invalidateReplies = useCallback(
		(parentCommentId: string | null) => {
			if (parentCommentId) {
				dispatch(
					commentsApi.util.invalidateTags([
						{ type: "Replies", id: parentCommentId },
					]),
				);
			}
			// Also refresh comments to update replyCount
			invalidateComments();
		},
		[dispatch, invalidateComments],
	);

	const handleCommentEvent = useCallback(
		(payload: CommentEventPayload) => {
			if (payload.parentCommentId) {
				invalidateReplies(payload.parentCommentId);
			} else {
				invalidateComments();
			}
		},
		[invalidateComments, invalidateReplies],
	);

	useSubscribeTaskComments(taskId, {
		onCommentCreated: handleCommentEvent,
		onCommentEdited: handleCommentEvent,
		onCommentDeleted: handleCommentEvent,
	});

	return (
		<Container
			direction="vertical"
			width="full"
			gap="sm"
			className="py-3 border-t border-zinc-700/50 items-stretch"
		>
			{isLoading ? (
				<p className="text-sm text-zinc-500 text-center py-2">
					Loading comments...
				</p>
			) : (
				<CommentList
					comments={data?.comments ?? []}
					taskId={taskId}
					projectId={projectId}
					isProjectAdmin={isProjectAdmin}
				/>
			)}
			<CommentInput taskId={taskId} projectId={projectId} />
		</Container>
	);
}
