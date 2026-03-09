"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import TaskDescription from "@pointwise/app/dashboard/taskCard/TaskDescription";
import {
	useDeletePostMutation,
	useGetPostCommentsQuery,
} from "@pointwise/generated/api";
import type { Post } from "@pointwise/lib/validation/posts-schema";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useState } from "react";
import {
	IoChatbubbleOutline,
	IoCreateOutline,
	IoTrashOutline,
} from "react-icons/io5";
import EditPostModal from "./EditPostModal";
import PostCommentInput from "./PostCommentInput";
import PostCommentItem from "./PostCommentItem";
import PostLikeButton from "./PostLikeButton";

export interface PostItemProps {
	post: Post;
	userId: string;
}

export default function PostItem({ post, userId }: PostItemProps) {
	const { data: session } = useSession();
	const currentUserId = session?.user?.id;
	const isAuthor = currentUserId === post.authorId;

	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [showComments, setShowComments] = useState(false);

	const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();

	const { data: commentsData } = useGetPostCommentsQuery(
		{ userId, postId: post.id },
		{ skip: !showComments },
	);

	const handleDelete = async () => {
		if (isDeleting) return;
		await deletePost({ userId, postId: post.id });
	};

	const createdAt = new Date(post.createdAt);
	const timeAgo = getTimeAgo(createdAt);

	return (
		<>
			{isAuthor && (
				<EditPostModal
					postId={post.id}
					userId={userId}
					initialContent={post.content}
					open={isEditModalOpen}
					onClose={() => setIsEditModalOpen(false)}
				/>
			)}
			<Container
				direction="vertical"
				width="full"
				gap="sm"
				className={`${StyleTheme.Container.Background} border ${StyleTheme.Container.Border.Primary} rounded-lg p-4 items-stretch`}
			>
				{/* Header */}
				<Container width="full" gap="sm" className="items-start">
					{post.author.image ? (
						<Image
							src={post.author.image}
							alt={post.author.displayName}
							width={32}
							height={32}
							className="rounded-full shrink-0"
							unoptimized
						/>
					) : (
						<div className="w-8 h-8 rounded-full bg-zinc-700 shrink-0 flex items-center justify-center text-sm text-zinc-400">
							{post.author.displayName.charAt(0).toUpperCase()}
						</div>
					)}
					<div className="flex-1 min-w-0">
						<Container width="auto" gap="sm" className="items-baseline">
							<span
								className={`text-sm font-medium ${StyleTheme.Text.Body} truncate`}
							>
								{post.author.displayName}
							</span>
							<span className="text-xs text-zinc-500 shrink-0">{timeAgo}</span>
							{post.editedAt && (
								<span className="text-xs text-zinc-600 shrink-0">(edited)</span>
							)}
						</Container>
					</div>
				</Container>

				{/* Content — rendered as markdown */}
				<TaskDescription description={post.content} />

				{/* Actions */}
				<Container width="auto" gap="xs">
					<PostLikeButton
						userId={userId}
						postId={post.id}
						likeCount={post.likeCount}
						likedByCurrentUser={post.likedByCurrentUser}
					/>
					<Button
						type="button"
						variant="ghost"
						size="xs"
						onClick={() => setShowComments(!showComments)}
						title="Comments"
					>
						<IoChatbubbleOutline className="h-3.5 w-3.5" aria-hidden="true" />
						{post.commentCount > 0 && (
							<span className="text-xs text-zinc-400">{post.commentCount}</span>
						)}
					</Button>
					{isAuthor && (
						<Button
							type="button"
							variant="ghost"
							size="xs"
							onClick={() => setIsEditModalOpen(true)}
							title="Edit"
						>
							<IoCreateOutline className="h-3.5 w-3.5" aria-hidden="true" />
						</Button>
					)}
					{isAuthor && (
						<Button
							type="button"
							variant="ghost"
							size="xs"
							onClick={handleDelete}
							disabled={isDeleting}
							title="Delete"
							className="hover:text-rose-400!"
						>
							<IoTrashOutline className="h-3.5 w-3.5" aria-hidden="true" />
						</Button>
					)}
				</Container>

				{/* Comments section */}
				{showComments && (
					<Container
						direction="vertical"
						width="full"
						gap="sm"
						className={`border-t ${StyleTheme.Container.Border.Subtle} pt-3 items-stretch`}
					>
						{commentsData?.comments.map((comment) => (
							<PostCommentItem
								key={comment.id}
								comment={comment}
								userId={userId}
								postId={post.id}
							/>
						))}
						{commentsData?.comments.length === 0 && (
							<p className="text-sm text-zinc-500 text-center py-1">
								No comments yet
							</p>
						)}
						<PostCommentInput userId={userId} postId={post.id} />
					</Container>
				)}
			</Container>
		</>
	);
}

function getTimeAgo(date: Date): string {
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffSec = Math.floor(diffMs / 1000);
	const diffMin = Math.floor(diffSec / 60);
	const diffHour = Math.floor(diffMin / 60);
	const diffDay = Math.floor(diffHour / 24);

	if (diffSec < 60) return "just now";
	if (diffMin < 60) return `${diffMin}m ago`;
	if (diffHour < 24) return `${diffHour}h ago`;
	if (diffDay < 7) return `${diffDay}d ago`;
	return date.toLocaleDateString();
}
