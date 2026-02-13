"use client";

import Container from "@pointwise/app/components/ui/Container";
import type { Comment } from "@pointwise/lib/validation/comments-schema";
import CommentItem from "./CommentItem";

export interface CommentListProps {
	comments: Comment[];
	taskId: string;
	projectId: string;
	isProjectAdmin?: boolean;
}

export default function CommentList({
	comments,
	taskId,
	projectId,
	isProjectAdmin = false,
}: CommentListProps) {
	if (comments.length === 0) {
		return (
			<p className="text-sm text-zinc-500 text-center py-2">No comments yet</p>
		);
	}

	return (
		<Container
			direction="vertical"
			width="full"
			gap="sm"
			className="items-stretch"
		>
			{comments.map((comment) => (
				<CommentItem
					key={comment.id}
					comment={comment}
					taskId={taskId}
					projectId={projectId}
					isProjectAdmin={isProjectAdmin}
				/>
			))}
		</Container>
	);
}
