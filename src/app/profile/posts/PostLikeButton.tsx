"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import {
	useLikePostMutation,
	useUnlikePostMutation,
} from "@pointwise/generated/api";
import { IoHeart, IoHeartOutline } from "react-icons/io5";

export interface PostLikeButtonProps {
	userId: string;
	postId: string;
	likeCount: number;
	likedByCurrentUser: boolean;
}

export default function PostLikeButton({
	userId,
	postId,
	likeCount,
	likedByCurrentUser,
}: PostLikeButtonProps) {
	const [likePost, { isLoading: isLiking }] = useLikePostMutation();
	const [unlikePost, { isLoading: isUnliking }] = useUnlikePostMutation();

	const isLoading = isLiking || isUnliking;

	const handleClick = () => {
		if (isLoading) return;
		if (likedByCurrentUser) {
			unlikePost({ userId, postId });
		} else {
			likePost({ userId, postId });
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
