"use client";

import { getAblyClient } from "@pointwise/lib/ably/client";
import { useEffect } from "react";
import { RealtimeChannels, RealtimeEvents } from "../registry";
import type { PostCommentEventPayload } from "../types";

export interface UseSubscribePostCommentsOptions {
	onCommentCreated?: (payload: PostCommentEventPayload) => void;
	onCommentEdited?: (payload: PostCommentEventPayload) => void;
	onCommentDeleted?: (payload: PostCommentEventPayload) => void;
}

export function useSubscribePostComments(
	postId: string | undefined,
	options: UseSubscribePostCommentsOptions = {},
): void {
	const { onCommentCreated, onCommentEdited, onCommentDeleted } = options;

	useEffect(() => {
		if (!postId) return;

		let channel: import("ably").RealtimeChannel | null = null;
		let isActive = true;

		const handleMessage = (message: import("ably").Message) => {
			const payload = message.data as PostCommentEventPayload;
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
				const channelName = RealtimeChannels.post.comments(postId);
				channel = client.channels.get(channelName);
				channel.subscribe(handleMessage);
			} catch (err) {
				console.warn("[realtime] Failed to subscribe to post comments", err);
			}
		};

		void subscribe();

		return () => {
			isActive = false;
			channel?.unsubscribe(handleMessage);
		};
	}, [postId, onCommentCreated, onCommentEdited, onCommentDeleted]);
}
