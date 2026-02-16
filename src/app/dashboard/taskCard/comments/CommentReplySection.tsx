"use client";

import Container from "@pointwise/app/components/ui/Container";
import { useGetRepliesQuery } from "@pointwise/generated/api";
import CommentInput from "./CommentInput";
import CommentItem from "./CommentItem";

export interface CommentReplySectionProps {
	taskId: string;
	projectId: string;
	parentCommentId: string;
}

export default function CommentReplySection({
	taskId,
	projectId,
	parentCommentId,
}: CommentReplySectionProps) {
	const { data, isLoading } = useGetRepliesQuery({
		taskId,
		commentId: parentCommentId,
		projectId,
	});

	return (
		<Container
			direction="vertical"
			width="auto"
			gap="sm"
			className="ml-6 mt-2 border-l-2 border-zinc-700/50 pl-4 items-stretch min-w-0 overflow-hidden w-[calc(100%-1.5rem)]"
		>
			{isLoading && <p className="text-xs text-zinc-500">Loading replies...</p>}
			{data?.replies.map((reply) => (
				<CommentItem
					key={reply.id}
					comment={{ ...reply, replyCount: 0 }}
					taskId={taskId}
					projectId={projectId}
					parentCommentId={parentCommentId}
					isReply
				/>
			))}
			<CommentInput
				taskId={taskId}
				projectId={projectId}
				parentCommentId={parentCommentId}
				placeholder="Write a reply..."
			/>
		</Container>
	);
}
