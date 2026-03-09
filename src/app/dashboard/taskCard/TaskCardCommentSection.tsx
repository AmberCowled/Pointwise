"use client";

import Container from "@pointwise/app/components/ui/Container";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import { useGetCommentsQuery } from "@pointwise/generated/api";
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

	return (
		<Container
			direction="vertical"
			width="full"
			gap="sm"
			className={`py-3 border-t ${StyleTheme.Container.Border.Subtle} items-stretch`}
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
