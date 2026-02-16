"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import {
	useCreateCommentMutation,
	useCreateReplyMutation,
} from "@pointwise/lib/redux/services/commentsApi";
import { useState } from "react";
import { IoSend } from "react-icons/io5";

export interface CommentInputProps {
	taskId: string;
	projectId: string;
	parentCommentId?: string;
	placeholder?: string;
}

export default function CommentInput({
	taskId,
	projectId,
	parentCommentId,
	placeholder = "Write a comment...",
}: CommentInputProps) {
	const [content, setContent] = useState("");
	const [createComment, { isLoading: isCreating }] = useCreateCommentMutation();
	const [createReply, { isLoading: isReplying }] = useCreateReplyMutation();

	const isLoading = isCreating || isReplying;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = content.trim();
		if (!trimmed || isLoading) return;

		if (parentCommentId) {
			await createReply({
				taskId,
				commentId: parentCommentId,
				projectId,
				content: trimmed,
			});
		} else {
			await createComment({ taskId, projectId, content: trimmed });
		}
		setContent("");
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			void handleSubmit(e);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="flex gap-2 items-end w-full">
			<textarea
				value={content}
				onChange={(e) => setContent(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder={placeholder}
				rows={1}
				className="flex-1 resize-none rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-3 py-2 text-[16px] text-zinc-200 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
			/>
			<Button
				type="submit"
				variant="ghost"
				size="sm"
				disabled={!content.trim() || isLoading}
				loading={isLoading}
			>
				<IoSend className="h-4 w-4" />
			</Button>
		</form>
	);
}
