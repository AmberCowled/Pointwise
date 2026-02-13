"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import { IoChatbubble, IoChatbubbleOutline } from "react-icons/io5";

export interface TaskCardCommentButtonProps {
	commentCount: number;
	onClick: () => void;
	isOpen: boolean;
}

export default function TaskCardCommentButton({
	commentCount,
	onClick,
	isOpen,
}: TaskCardCommentButtonProps) {
	const CommentIcon = isOpen ? IoChatbubble : IoChatbubbleOutline;

	return (
		<Button
			type="button"
			variant="ghost"
			size="sm"
			title="Comments"
			onClick={onClick}
			className={isOpen ? "text-indigo-400! hover:text-indigo-300!" : undefined}
		>
			<CommentIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
			<span
				className={`text-xs font-medium ${isOpen ? "text-indigo-400!" : "text-zinc-400"}`}
			>
				{commentCount}
			</span>
		</Button>
	);
}
