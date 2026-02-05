"use client";

import { getAblyClient } from "@pointwise/lib/ably/client";
import { useEffect } from "react";
import { RealtimeChannels, RealtimeEvents } from "../registry";

/** Friend-related events that trigger UI updates (not new-notification). */
const FRIEND_UPDATE_EVENTS = [
	RealtimeEvents.FRIENDSHIP_REMOVED,
	RealtimeEvents.FRIEND_REQUEST_RECEIVED,
	RealtimeEvents.FRIEND_REQUEST_DECLINED,
	RealtimeEvents.FRIEND_REQUEST_CANCELLED,
] as const;

export interface UseSubscribeFriendUpdatesOptions {
	/** Called when friendship:removed, friend-request:received, etc. arrive. */
	onEvent?: () => void;
}

/**
 * Subscribe to friend-requests channel for friendship sync events (removed, received,
 * declined, cancelled). Use alongside useSubscribeUserNotifications for new-notification.
 * Invalidates FriendRequests and FriendshipStatus so UserCard and friend list update.
 */
export function useSubscribeFriendUpdates(
	userId: string | undefined,
	options: UseSubscribeFriendUpdatesOptions = {},
): void {
	const { onEvent } = options;

	useEffect(() => {
		if (!userId) return;

		const channelName = RealtimeChannels.user.friendRequests(userId);
		let channel: import("ably").RealtimeChannel | null = null;
		let isActive = true;

		const handleMessage = (message: import("ably").Message) => {
			if (
				FRIEND_UPDATE_EVENTS.includes(
					message.name as (typeof FRIEND_UPDATE_EVENTS)[number],
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
				console.warn("[realtime] Failed to subscribe to friend updates", err);
			}
		};

		void subscribe();

		return () => {
			isActive = false;
			channel?.unsubscribe(handleMessage);
		};
	}, [userId, onEvent]);
}
