"use client";

import { api, useGetNotificationSettingsQuery } from "@pointwise/generated/api";
import { invalidateTags } from "@pointwise/generated/invalidation";
import { getAblyClient } from "@pointwise/lib/ably/client";
import { useAppDispatch } from "@pointwise/lib/redux/hooks";
import { useSession } from "next-auth/react";
import { type ReactNode, useEffect, useRef } from "react";
import { logDispatchError } from "./log";
import {
	RealtimeChannels,
	type RealtimeEventData,
	RealtimeEvents,
	resolveEventTags,
	resolveNotificationTypeTags,
} from "./registry";

export function RealtimeProvider({ children }: { children: ReactNode }) {
	const { data: session } = useSession();
	const userId = session?.user?.id;
	const dispatch = useAppDispatch();

	// Ably channel subscription with centralized event handling
	useEffect(() => {
		if (!userId) return;

		const channelName = RealtimeChannels.user(userId);
		let ablyChannel: import("ably").RealtimeChannel | null = null;
		let isActive = true;

		const STALENESS_THRESHOLD_MS = 30_000;

		const handleEvent = (eventName: string, data: unknown) => {
			// Special case: NEW_NOTIFICATION — optimistic insert + sub-map
			if (eventName === RealtimeEvents.NEW_NOTIFICATION) {
				const payload = data as RealtimeEventData<"NEW_NOTIFICATION">;
				dispatch(
					api.util.updateQueryData("getNotifications", {}, (draft) => {
						if (draft.notifications.some((n) => n.id === payload.id)) return;

						// Staleness guard: skip inserts older than 30s relative to newest cached
						const newest = draft.notifications[0];
						if (newest) {
							const newestTime = new Date(newest.createdAt).getTime();
							const incomingTime = new Date(payload.createdAt).getTime();
							if (newestTime - incomingTime > STALENESS_THRESHOLD_MS) return;
						}

						draft.notifications.unshift(payload);
					}),
				);
				const ntTags = resolveNotificationTypeTags(payload.type, payload.data);
				if (ntTags.length > 0)
					dispatch(
						invalidateTags(ntTags as Parameters<typeof invalidateTags>[0]),
					);
				return;
			}

			// Generic: resolve tags from registry
			const tags = resolveEventTags(eventName, data);
			if (tags.length > 0) {
				dispatch(invalidateTags(tags as Parameters<typeof invalidateTags>[0]));
			} else if (process.env.NODE_ENV === "development") {
				console.info(`[realtime] Unhandled event: "${eventName}"`, data);
			}
		};

		const handleMessage = (message: import("ably").Message) => {
			handleEvent(message.name as string, message.data);
		};

		const setup = async () => {
			try {
				const client = await getAblyClient();
				if (!isActive) return;
				ablyChannel = client.channels.get(channelName);
				ablyChannel.subscribe(handleMessage);
			} catch (err) {
				logDispatchError("realtime channel subscribe", err);
			}
		};

		void setup();

		return () => {
			isActive = false;
			ablyChannel?.unsubscribe(handleMessage);
		};
	}, [userId, dispatch]);

	// Push notifications
	const { data: settingsData } = useGetNotificationSettingsQuery();
	const pushEnabled = settingsData?.settings?.pushEnabled ?? true;
	const pushActivatedRef = useRef(false);

	useEffect(() => {
		if (!userId || !pushEnabled) return;

		let cancelled = false;

		const activate = async (retry = false) => {
			if (pushActivatedRef.current) return;
			try {
				if ("serviceWorker" in navigator) {
					try {
						await navigator.serviceWorker.register("/service_worker.js");
					} catch (swErr) {
						logDispatchError("service worker register", swErr);
					}
				}
				const client = await getAblyClient();
				if (cancelled) return;
				await client.push.activate();
				if (cancelled) return;
				pushActivatedRef.current = true;

				const channelName = RealtimeChannels.user(userId);
				const channel = client.channels.get(channelName);
				await channel.push.subscribeDevice();
			} catch (err) {
				const msg = err instanceof Error ? err.message : String(err);
				if (!retry && msg.includes("doesn't exist")) {
					try {
						const client = await getAblyClient();
						await client.push.deactivate();
					} catch {
						// ignore deactivation errors
					}
					pushActivatedRef.current = false;
					if (!cancelled) await activate(true);
					return;
				}
				logDispatchError("push notification activate", err);
			}
		};

		void activate();

		return () => {
			cancelled = true;
		};
	}, [userId, pushEnabled]);

	return <>{children}</>;
}
