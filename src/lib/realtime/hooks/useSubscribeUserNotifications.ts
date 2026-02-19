"use client";

import { getAblyClient } from "@pointwise/lib/ably/client";
import { useEffect } from "react";
import type {
	UserNotificationChannel,
	UserNotificationPreset,
} from "../config";
import { SUBSCRIPTION_PRESETS } from "../config";
import { RealtimeChannels, RealtimeEvents } from "../registry";
import type { NewNotificationPayload } from "../types";

export type { UserNotificationChannel } from "../config";

export interface UseSubscribeUserNotificationsOptions {
	/** Preset to use for channel and event filtering. */
	preset?: UserNotificationPreset;
	/** Override channel (advanced). Used when preset is not provided. */
	channel?: UserNotificationChannel;
	/** Called when a matching new-notification arrives. */
	onEvent?: (payload: NewNotificationPayload) => void;
}

/** Map channel suffix → channel name builder. */
const CHANNEL_NAME_BUILDERS: Record<
	UserNotificationChannel,
	(userId: string) => string
> = {
	"friend-requests": RealtimeChannels.user.friendRequests,
	messages: RealtimeChannels.user.messages,
	projects: RealtimeChannels.user.projects,
};

function shouldTrigger(
	payload: NewNotificationPayload,
	presetConfig: (typeof SUBSCRIPTION_PRESETS)[UserNotificationPreset],
): boolean {
	const { notificationTypes, excludeNotificationTypes } = presetConfig;
	const payloadType = payload.type;

	if (excludeNotificationTypes?.includes(payloadType as never)) {
		return false;
	}
	if (notificationTypes && notificationTypes.length > 0) {
		return notificationTypes.includes(payloadType as never);
	}
	return true;
}

/**
 * Subscribe to user notification channels. Uses a preset to determine channel and
 * filters events by NotificationType before calling onEvent.
 */
export function useSubscribeUserNotifications(
	userId: string | undefined,
	options: UseSubscribeUserNotificationsOptions = {},
): void {
	const { preset, channel: channelOverride, onEvent } = options;

	useEffect(() => {
		if (!userId) return;

		const presetConfig = preset ? SUBSCRIPTION_PRESETS[preset] : null;
		const channel: UserNotificationChannel =
			channelOverride ??
			(presetConfig?.channel as UserNotificationChannel) ??
			"friend-requests";

		const buildChannelName =
			CHANNEL_NAME_BUILDERS[channel] ??
			CHANNEL_NAME_BUILDERS["friend-requests"];
		const channelName = buildChannelName(userId);

		let ablyChannel: import("ably").RealtimeChannel | null = null;
		let isActive = true;

		const handleMessage = (message: import("ably").Message) => {
			if (message.name !== RealtimeEvents.NEW_NOTIFICATION) return;
			const payload = message.data as NewNotificationPayload;

			if (presetConfig && !shouldTrigger(payload, presetConfig)) {
				return;
			}

			onEvent?.(payload);
		};

		const subscribe = async () => {
			try {
				const client = await getAblyClient();
				if (!isActive) return;
				ablyChannel = client.channels.get(channelName);
				ablyChannel.subscribe(handleMessage);
			} catch (err) {
				console.warn(
					"[realtime] Failed to subscribe to user notifications",
					err,
				);
			}
		};

		void subscribe();

		return () => {
			isActive = false;
			ablyChannel?.unsubscribe(handleMessage);
		};
	}, [userId, preset, channelOverride, onEvent]);
}
