"use client";

import Container from "@pointwise/app/components/ui/Container";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import { useGetPostRepliesQuery } from "@pointwise/generated/api";
import PostCommentInput from "./PostCommentInput";
import PostCommentItem from "./PostCommentItem";

export interface PostCommentReplySectionProps {
	userId: string;
	postId: string;
	parentCommentId: string;
}

export default function PostCommentReplySection({
	userId,
	postId,
	parentCommentId,
}: PostCommentReplySectionProps) {
	const { data, isLoading } = useGetPostRepliesQuery({
		userId,
		postId,
		commentId: parentCommentId,
	});

	return (
		<Container
			direction="vertical"
			width="auto"
			gap="sm"
			className={`ml-6 mt-2 border-l-2 ${StyleTheme.Container.Border.Subtle} pl-4 items-stretch min-w-0 overflow-hidden w-[calc(100%-1.5rem)]`}
		>
			{isLoading && <p className="text-xs text-zinc-500">Loading replies...</p>}
			{data?.replies.map((reply) => (
				<PostCommentItem
					key={reply.id}
					comment={{ ...reply, replyCount: 0 }}
					userId={userId}
					postId={postId}
					parentCommentId={parentCommentId}
					isReply
				/>
			))}
			<PostCommentInput
				userId={userId}
				postId={postId}
				parentCommentId={parentCommentId}
				placeholder="Write a reply..."
			/>
		</Container>
	);
}
