"use client";

import { getAblyClient } from "@pointwise/lib/ably/client";
import { useEffect } from "react";
import { RealtimeChannels, RealtimeEvents } from "../registry";
import type { NewMessagePayload } from "../types";

export interface UseSubscribeConversationOptions {
	/** Called when a new-message arrives on the conversation channel. */
	onNewMessage?: (payload: NewMessagePayload) => void;
}

/**
 * Subscribe to a conversation's live message channel.
 */
export function useSubscribeConversation(
	conversationId: string | undefined,
	options: UseSubscribeConversationOptions = {},
): void {
	const { onNewMessage } = options;

	useEffect(() => {
		if (!conversationId) return;

		let channel: import("ably").RealtimeChannel | null = null;
		let isActive = true;

		const handleMessage = (message: import("ably").Message) => {
			if (message.name !== RealtimeEvents.NEW_MESSAGE) return;
			const payload = message.data as NewMessagePayload;
			onNewMessage?.(payload);
		};

		const subscribe = async () => {
			try {
				const client = await getAblyClient();
				if (!isActive) return;
				const channelName = RealtimeChannels.conversation(conversationId);
				channel = client.channels.get(channelName);
				channel.subscribe(handleMessage);
			} catch (err) {
				console.warn("[realtime] Failed to subscribe to conversation", err);
			}
		};

		void subscribe();

		return () => {
			isActive = false;
			channel?.unsubscribe(handleMessage);
		};
	}, [conversationId, onNewMessage]);
}
