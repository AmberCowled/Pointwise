"use client";

import { getAblyClient } from "@pointwise/lib/ably/client";
import { useEffect, useRef } from "react";
import { RealtimeChannels } from "../registry";

const USER_CHANNELS = [
	RealtimeChannels.user.friendRequests,
	RealtimeChannels.user.messages,
	RealtimeChannels.user.projects,
] as const;

/**
 * Manages Ably Push Notification activation/deactivation.
 * Subscribes the device to all user notification channels when enabled.
 */
export function usePushNotifications(
	userId: string | undefined,
	{ enabled }: { enabled: boolean },
): void {
	const activatedRef = useRef(false);

	useEffect(() => {
		if (!userId) return;

		let cancelled = false;

		const activate = async (retry = false) => {
			if (activatedRef.current) return;

			try {
				// Ensure service worker is registered before Ably activation
				if ("serviceWorker" in navigator) {
					await navigator.serviceWorker.register("/service_worker.js");
				}

				const client = await getAblyClient();
				if (cancelled) return;

				await client.push.activate();
				if (cancelled) return;

				activatedRef.current = true;

				for (const buildChannel of USER_CHANNELS) {
					const channelName = buildChannel(userId);
					const channel = client.channels.get(channelName);
					await channel.push.subscribeDevice();
				}
			} catch (err) {
				// If device registration was deleted server-side, clear local
				// state and retry once with a fresh registration.
				const msg = err instanceof Error ? err.message : String(err);
				if (!retry && msg.includes("doesn't exist")) {
					try {
						const client = await getAblyClient();
						await client.push.deactivate();
					} catch {
						// deactivate may also fail — that's OK
					}
					activatedRef.current = false;
					if (!cancelled) {
						await activate(true);
					}
					return;
				}
				console.warn("[push] Failed to activate push notifications", err);
			}
		};

		const deactivate = async () => {
			if (!activatedRef.current) return;

			try {
				const client = await getAblyClient();
				if (cancelled) return;

				for (const buildChannel of USER_CHANNELS) {
					const channelName = buildChannel(userId);
					const channel = client.channels.get(channelName);
					try {
						await channel.push.unsubscribeDevice();
					} catch {
						// Channel may not have been subscribed
					}
				}

				await client.push.deactivate();
				activatedRef.current = false;
			} catch (err) {
				console.warn("[push] Failed to deactivate push notifications", err);
			}
		};

		if (enabled) {
			void activate();
		} else {
			void deactivate();
		}

		return () => {
			cancelled = true;
		};
	}, [userId, enabled]);
}
