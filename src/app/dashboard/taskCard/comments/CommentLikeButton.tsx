"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import {
	useLikeCommentMutation,
	useUnlikeCommentMutation,
} from "@pointwise/generated/api";
import { IoHeart, IoHeartOutline } from "react-icons/io5";

export interface CommentLikeButtonProps {
	taskId: string;
	commentId: string;
	projectId: string;
	parentCommentId?: string;
	likeCount: number;
	likedByCurrentUser: boolean;
}

export default function CommentLikeButton({
	taskId,
	commentId,
	projectId,
	parentCommentId,
	likeCount,
	likedByCurrentUser,
}: CommentLikeButtonProps) {
	const [likeComment, { isLoading: isLiking }] = useLikeCommentMutation();
	const [unlikeComment, { isLoading: isUnliking }] = useUnlikeCommentMutation();

	const isLoading = isLiking || isUnliking;

	const handleClick = () => {
		if (isLoading) return;
		if (likedByCurrentUser) {
			unlikeComment({ taskId, commentId, projectId, parentCommentId });
		} else {
			likeComment({ taskId, commentId, projectId, parentCommentId });
		}
	};

	const LikeIcon = likedByCurrentUser ? IoHeart : IoHeartOutline;

	return (
		<Button
			type="button"
			variant="ghost"
			size="xs"
			disabled={isLoading}
			title={likedByCurrentUser ? "Unlike" : "Like"}
			onClick={handleClick}
			className={
				likedByCurrentUser ? "text-rose-500! hover:text-rose-400!" : undefined
			}
		>
			<LikeIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
			{likeCount > 0 && (
				<span
					className={`text-xs font-medium ${likedByCurrentUser ? "text-rose-500!" : "text-zinc-400"}`}
				>
					{likeCount}
				</span>
			)}
		</Button>
	);
}
