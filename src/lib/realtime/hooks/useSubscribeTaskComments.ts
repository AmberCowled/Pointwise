"use client";

import { getAblyClient } from "@pointwise/lib/ably/client";
import { useEffect } from "react";
import { RealtimeChannels, RealtimeEvents } from "../registry";
import type { CommentEventPayload } from "../types";

export interface UseSubscribeTaskCommentsOptions {
	onCommentCreated?: (payload: CommentEventPayload) => void;
	onCommentEdited?: (payload: CommentEventPayload) => void;
	onCommentDeleted?: (payload: CommentEventPayload) => void;
}

/**
 * Subscribe to a task's live comment channel.
 */
export function useSubscribeTaskComments(
	taskId: string | undefined,
	options: UseSubscribeTaskCommentsOptions = {},
): void {
	const { onCommentCreated, onCommentEdited, onCommentDeleted } = options;

	useEffect(() => {
		if (!taskId) return;

		let channel: import("ably").RealtimeChannel | null = null;
		let isActive = true;

		const handleMessage = (message: import("ably").Message) => {
			const payload = message.data as CommentEventPayload;
			switch (message.name) {
				case RealtimeEvents.COMMENT_CREATED:
					onCommentCreated?.(payload);
					break;
				case RealtimeEvents.COMMENT_EDITED:
					onCommentEdited?.(payload);
					break;
				case RealtimeEvents.COMMENT_DELETED:
					onCommentDeleted?.(payload);
					break;
			}
		};

		const subscribe = async () => {
			try {
				const client = await getAblyClient();
				if (!isActive) return;
				const channelName = RealtimeChannels.task.comments(taskId);
				channel = client.channels.get(channelName);
				channel.subscribe(handleMessage);
			} catch (err) {
				console.warn("[realtime] Failed to subscribe to task comments", err);
			}
		};

		void subscribe();

		return () => {
			isActive = false;
			channel?.unsubscribe(handleMessage);
		};
	}, [taskId, onCommentCreated, onCommentEdited, onCommentDeleted]);
}
