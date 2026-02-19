"use client";

import { getAblyClient } from "@pointwise/lib/ably/client";
import { useEffect } from "react";
import { RealtimeChannels, RealtimeEvents } from "../registry";

/** Project-related events that trigger UI updates (not new-notification). */
const PROJECT_UPDATE_EVENTS = [
	RealtimeEvents.JOIN_REQUEST_REJECTED,
	RealtimeEvents.INVITE_REJECTED,
] as const;

export interface UseSubscribeProjectUpdatesOptions {
	/** Called when join-request:rejected, invite:rejected, etc. arrive. */
	onEvent?: () => void;
}

/**
 * Subscribe to user:{userId}:projects channel for project sync events
 * (join request rejected, invite rejected). Use alongside
 * useSubscribeUserNotifications for new-notification events.
 * Invalidates Projects and Invites so search results and UI update.
 */
export function useSubscribeProjectUpdates(
	userId: string | undefined,
	options: UseSubscribeProjectUpdatesOptions = {},
): void {
	const { onEvent } = options;

	useEffect(() => {
		if (!userId) return;

		const channelName = RealtimeChannels.user.projects(userId);
		let channel: import("ably").RealtimeChannel | null = null;
		let isActive = true;

		const handleMessage = (message: import("ably").Message) => {
			if (
				PROJECT_UPDATE_EVENTS.includes(
					message.name as (typeof PROJECT_UPDATE_EVENTS)[number],
				)
			) {
				onEvent?.();
			}
		};

		const subscribe = async () => {
			try {
				const client = await getAblyClient();
				if (!isActive) return;
				channel = client.channels.get(channelName);
				channel.subscribe(handleMessage);
			} catch (err) {
				console.warn("[realtime] Failed to subscribe to project updates", err);
			}
		};

		void subscribe();

		return () => {
			isActive = false;
			channel?.unsubscribe(handleMessage);
		};
	}, [userId, onEvent]);
}
