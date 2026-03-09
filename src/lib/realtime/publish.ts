/**
 * Server-only publish functions for the realtime layer.
 * Import only from API routes, lib/api, or lib/notifications.
 */
import { publishAblyBatch, publishAblyEvent } from "@pointwise/lib/ably/server";
import { buildPushExtras } from "@pointwise/lib/notifications/push";
import { sendNotifications } from "@pointwise/lib/notifications/service";
import prisma from "@pointwise/lib/prisma";
import type { Notification } from "@pointwise/lib/validation/notification-schema";
import {
	EventRegistry,
	type NewMessagePayload,
	type NotificationData,
	NotificationDataSchemas,
	type NotificationType,
	RealtimeChannels,
	type RealtimeEventData,
	type RealtimeEventKey,
	RealtimeEvents,
} from "./registry";

/**
 * Fan-out an event to multiple users' channels.
 * Deduplicates IDs. Uses batch publish for 2+ users, single publish for 1.
 */
export async function publishToUsers(
	userIds: string[],
	eventName: string,
	payload: Record<string, unknown>,
	extras?: Record<string, unknown>,
): Promise<void> {
	const unique = [...new Set(userIds)];
	if (unique.length === 0) return;

	if (unique.length === 1) {
		await publishAblyEvent(
			RealtimeChannels.user(unique[0]),
			eventName,
			payload,
			extras,
		);
		return;
	}

	await publishAblyBatch(
		unique.map((id) => RealtimeChannels.user(id)),
		eventName,
		payload,
		extras,
	);
}

/**
 * High-level helper: publish a typed event to a list of users.
 * Single import instead of publishToUsers + RealtimeEvents.
 */
export async function emitEvent<K extends RealtimeEventKey>(
	event: K,
	payload: RealtimeEventData<K>,
	userIds: string[],
	extras?: Record<string, unknown>,
): Promise<void> {
	await publishToUsers(
		userIds,
		RealtimeEvents[event],
		payload as Record<string, unknown>,
		extras,
	);
}

// ---------------------------------------------------------------------------
// Unified dispatch
// ---------------------------------------------------------------------------

type EventRegistryKey = keyof typeof EventRegistry;

/** Keys that have a notification block. */
export type NotificationKey = {
	[K in EventRegistryKey]: (typeof EventRegistry)[K] extends {
		notification: { schema: import("zod").ZodType };
	}
		? K
		: never;
}[EventRegistryKey];

/** Keys that have an event but no notification. */
export type EventOnlyKey = Exclude<RealtimeEventKey, NotificationKey>;

/** Infer the right payload type depending on whether the key has a notification. */
export type DispatchPayload<K extends EventRegistryKey> =
	K extends NotificationKey
		? NotificationData<K & NotificationType>
		: K extends RealtimeEventKey
			? RealtimeEventData<K>
			: never;

/**
 * Unified dispatch: routes to `sendNotifications` (DB + push + realtime)
 * for notification entries, or `emitEvent` (realtime-only) for event-only entries.
 *
 * Notification keys accept an `actorId` parameter — the actor's display name
 * and image are looked up automatically and merged into the persisted data.
 *
 * For dual entries (have both `event` and `notification`), the notification path
 * handles everything — `sendNotification` internally publishes a `NEW_NOTIFICATION`
 * event, and `RealtimeProvider` resolves the notification type's tags.
 */
export async function dispatch<K extends NotificationKey>(
	key: K,
	actorId: string,
	payload: NotificationData<K & NotificationType>,
	userIds: string[],
): Promise<void>;
export async function dispatch<K extends EventOnlyKey>(
	key: K,
	payload: RealtimeEventData<K>,
	userIds: string[],
): Promise<void>;
export async function dispatch(
	key: string,
	actorIdOrPayload: string | Record<string, unknown>,
	payloadOrUserIds: Record<string, unknown> | string[],
	maybeUserIds?: string[],
): Promise<void> {
	const entry = EventRegistry[key as EventRegistryKey];

	if ("notification" in entry) {
		// Notification path: dispatch(key, actorId, payload, userIds)
		const actorId = actorIdOrPayload as string;
		const payload = payloadOrUserIds as Record<string, unknown>;
		const userIds = maybeUserIds as string[];

		// Validate context payload against the type's schema
		const schema = NotificationDataSchemas[key as NotificationType];
		const validatedPayload = schema.parse(payload);

		// Look up actor info
		const actor = await prisma.user.findUnique({
			where: { id: actorId },
			select: { displayName: true, image: true },
		});

		// Merge actor fields into the payload
		const mergedData = {
			...(validatedPayload as Record<string, unknown>),
			actorId,
			actorName: actor?.displayName ?? null,
			actorImage: actor?.image ?? null,
		};

		await sendNotifications(
			userIds,
			key as NotificationType,
			mergedData as unknown as NotificationData<NotificationType>,
		);
		return;
	}

	if ("event" in entry) {
		// Event-only path: dispatch(key, payload, userIds)
		const payload = actorIdOrPayload as Record<string, unknown>;
		const userIds = payloadOrUserIds as string[];
		await emitEvent(
			key as RealtimeEventKey,
			payload as RealtimeEventData<RealtimeEventKey>,
			userIds,
		);
		return;
	}
}

/**
 * Publish a notification to the recipient's Ably channel.
 * Resolves push extras via DB lookup.
 */
export async function publishNotification(
	notification: Notification,
): Promise<void> {
	const extras = await buildPushExtras(
		notification.userId,
		notification.type,
		notification.data as Record<string, unknown>,
	);
	await publishNotificationWithExtras(notification, extras);
}

/**
 * Publish a notification with pre-computed push extras (skips DB lookup).
 * Use this when extras have already been batch-resolved.
 */
export async function publishNotificationWithExtras(
	notification: Notification,
	extras?: Record<string, unknown>,
): Promise<void> {
	const channelName = RealtimeChannels.user(notification.userId);

	await publishAblyEvent(
		channelName,
		RealtimeEvents.NEW_NOTIFICATION,
		{
			...notification,
			createdAt:
				typeof notification.createdAt === "string"
					? notification.createdAt
					: notification.createdAt.toISOString(),
			data: notification.data,
		},
		extras,
	);
}

/**
 * Publish a new message to all conversation participants' channels.
 */
export async function publishNewMessage(
	conversationId: string,
	message: Omit<NewMessagePayload, "createdAt"> & {
		createdAt: string | Date;
	},
): Promise<void> {
	const participants = await prisma.conversationParticipant.findMany({
		where: { conversationId },
		select: { userId: true },
	});

	const payload: Record<string, unknown> = {
		...message,
		conversationId,
		createdAt:
			typeof message.createdAt === "string"
				? message.createdAt
				: message.createdAt instanceof Date
					? message.createdAt.toISOString()
					: String(message.createdAt),
	};

	await publishToUsers(
		participants.map((p) => p.userId),
		RealtimeEvents.NEW_MESSAGE,
		payload,
	);
}
