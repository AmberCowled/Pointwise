"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import {
	useDeleteCommentMutation,
	useEditCommentMutation,
} from "@pointwise/generated/api";
import type { Comment } from "@pointwise/lib/validation/comments-schema";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useCallback, useState } from "react";
import {
	IoChatbubbleOutline,
	IoCreateOutline,
	IoTrashOutline,
} from "react-icons/io5";
import CommentLikeButton from "./CommentLikeButton";
import CommentReplySection from "./CommentReplySection";

export interface CommentItemProps {
	comment: Comment;
	taskId: string;
	projectId: string;
	parentCommentId?: string;
	isReply?: boolean;
	isProjectAdmin?: boolean;
}

export default function CommentItem({
	comment,
	taskId,
	projectId,
	parentCommentId,
	isReply = false,
	isProjectAdmin = false,
}: CommentItemProps) {
	const { data: session } = useSession();
	const currentUserId = session?.user?.id;
	const isAuthor = currentUserId === comment.authorId;

	const [isEditing, setIsEditing] = useState(false);
	const [editContent, setEditContent] = useState(comment.content);
	const [showReplies, setShowReplies] = useState(false);

	const [editComment, { isLoading: isSaving }] = useEditCommentMutation();
	const [deleteComment, { isLoading: isDeleting }] = useDeleteCommentMutation();

	const editTextareaRef = useCallback((node: HTMLTextAreaElement | null) => {
		node?.focus();
	}, []);

	const handleSaveEdit = async () => {
		const trimmed = editContent.trim();
		if (!trimmed || isSaving) return;
		await editComment({
			taskId,
			commentId: comment.id,
			projectId,
			content: trimmed,
			parentCommentId,
		});
		setIsEditing(false);
	};

	const handleCancelEdit = () => {
		setEditContent(comment.content);
		setIsEditing(false);
	};

	const handleDelete = async () => {
		if (isDeleting) return;
		await deleteComment({
			taskId,
			commentId: comment.id,
			projectId,
			parentCommentId,
			replyCount: isReply ? 0 : comment.replyCount,
		});
	};

	const handleEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			void handleSaveEdit();
		}
		if (e.key === "Escape") {
			handleCancelEdit();
		}
	};

	const createdAt = new Date(comment.createdAt);
	const timeAgo = getTimeAgo(createdAt);

	return (
		<Container
			direction="vertical"
			width="full"
			gap="xs"
			className="items-stretch"
		>
			<Container width="full" gap="sm" className="items-start">
				{comment.author.image ? (
					<Image
						src={comment.author.image}
						alt={comment.author.displayName}
						width={24}
						height={24}
						className="rounded-full shrink-0 mt-0.5"
						unoptimized
					/>
				) : (
					<div className="w-6 h-6 rounded-full bg-zinc-700 shrink-0 mt-0.5 flex items-center justify-center text-xs text-zinc-400">
						{comment.author.displayName.charAt(0).toUpperCase()}
					</div>
				)}
				<div className="flex-1 min-w-0">
					<Container width="auto" gap="sm" className="items-baseline">
						<span
							className={`text-sm font-medium ${StyleTheme.Text.Body} truncate`}
						>
							{comment.author.displayName}
						</span>
						<span className="text-xs text-zinc-500 shrink-0">{timeAgo}</span>
						{comment.editedAt && (
							<span className="text-xs text-zinc-600 shrink-0">(edited)</span>
						)}
					</Container>
					{isEditing ? (
						<Container
							direction="vertical"
							width="full"
							gap="xs"
							className="mt-1 items-stretch"
						>
							<textarea
								ref={editTextareaRef}
								value={editContent}
								onChange={(e) => setEditContent(e.target.value)}
								onKeyDown={handleEditKeyDown}
								rows={2}
								className={`w-full resize-none rounded-lg border ${StyleTheme.Container.Border.Subtle} ${StyleTheme.Container.BackgroundMuted} px-3 py-2 text-[16px] ${StyleTheme.Text.Body} focus:border-zinc-500 focus:outline-none`}
							/>
							<Container width="auto" gap="xs">
								<Button
									type="button"
									variant="ghost"
									size="xs"
									onClick={handleSaveEdit}
									disabled={!editContent.trim() || isSaving}
									loading={isSaving}
								>
									Save
								</Button>
								<Button
									type="button"
									variant="ghost"
									size="xs"
									onClick={handleCancelEdit}
								>
									Cancel
								</Button>
							</Container>
						</Container>
					) : (
						<p
							className={`text-sm ${StyleTheme.Text.Tertiary} whitespace-pre-wrap break-words`}
						>
							{comment.content}
						</p>
					)}
					{!isEditing && (
						<Container width="auto" gap="xs" className="mt-0.5">
							<CommentLikeButton
								taskId={taskId}
								commentId={comment.id}
								projectId={projectId}
								parentCommentId={parentCommentId}
								likeCount={comment.likeCount}
								likedByCurrentUser={comment.likedByCurrentUser}
							/>
							{!isReply && (
								<Button
									type="button"
									variant="ghost"
									size="xs"
									onClick={() => setShowReplies(!showReplies)}
									title="Replies"
								>
									<IoChatbubbleOutline
										className="h-3.5 w-3.5"
										aria-hidden="true"
									/>
									{comment.replyCount > 0 && (
										<span className="text-xs text-zinc-400">
											{comment.replyCount}
										</span>
									)}
								</Button>
							)}
							{isAuthor && (
								<Button
									type="button"
									variant="ghost"
									size="xs"
									onClick={() => {
										setEditContent(comment.content);
										setIsEditing(true);
									}}
									title="Edit"
								>
									<IoCreateOutline className="h-3.5 w-3.5" aria-hidden="true" />
								</Button>
							)}
							{(isAuthor || isProjectAdmin) && (
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
					)}
				</div>
			</Container>
			{!isReply && showReplies && (
				<CommentReplySection
					taskId={taskId}
					projectId={projectId}
					parentCommentId={comment.id}
				/>
			)}
		</Container>
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
