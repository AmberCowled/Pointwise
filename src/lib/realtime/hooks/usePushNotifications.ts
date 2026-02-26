"use client";

import { getAblyClient } from "@pointwise/lib/ably/client";
import { useEffect, useRef } from "react";
import { RealtimeChannels } from "../registry";

const USER_CHANNELS = [
	RealtimeChannels.user.friendRequests,
	RealtimeChannels.user.messages,
	RealtimeChannels.user.projects,
];

export function usePushNotifications(
	userId: string | undefined,
	options: { enabled: boolean },
): void {
	const activatedRef = useRef(false);

	useEffect(() => {
		if (!userId || !options.enabled) return;

		let cancelled = false;

		const activate = async (retry = false) => {
			if (activatedRef.current) return;
			try {
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
				const msg = err instanceof Error ? err.message : String(err);
				if (!retry && msg.includes("doesn't exist")) {
					try {
						const client = await getAblyClient();
						await client.push.deactivate();
					} catch {
						// ignore deactivation errors
					}
					activatedRef.current = false;
					if (!cancelled) await activate(true);
					return;
				}
				console.warn("[push] Failed to activate push notifications", err);
			}
		};

		void activate();

		return () => {
			cancelled = true;
		};
	}, [userId, options.enabled]);
}
