import prisma from "@pointwise/lib/prisma";
import { logDispatchError } from "@pointwise/lib/realtime/log";
import {
	publishNotification,
	publishNotificationWithExtras,
} from "@pointwise/lib/realtime/publish";
import {
	type NotificationData,
	NotificationDataSchemas,
	type NotificationType,
} from "@pointwise/lib/realtime/registry";
import type { Prisma } from "@prisma/client";
import type { ZodObject, ZodTypeAny } from "zod";
import { buildPushExtrasForUsers } from "./push";

const MESSAGE_SNIPPET_MAX_LENGTH = 80;

/** Truncate message content for notification snippet (e.g. MessagesMenu preview). */
export function truncateMessageSnippet(content: string): string {
	if (content.length <= MESSAGE_SNIPPET_MAX_LENGTH) return content;
	return `${content.slice(0, MESSAGE_SNIPPET_MAX_LENGTH).trimEnd()}…`;
}

export async function sendNotification<T extends NotificationType>(
	recipientId: string,
	type: T,
	data: NotificationData<T>,
) {
	// 1. Validate data using Zod schema (passthrough preserves actor fields)
	const schema = NotificationDataSchemas[type];
	const validatedData = (schema as ZodObject<Record<string, ZodTypeAny>>)
		.passthrough()
		.parse(data);

	// 2. Persist to Database
	const notification = await prisma.notification.create({
		data: {
			userId: recipientId,
			type: type,
			data: validatedData as Prisma.InputJsonValue,
		},
	});

	// 3. Publish Realtime Event via Ably
	try {
		await publishNotification({
			...notification,
			data: validatedData,
		});
	} catch (error) {
		logDispatchError("realtime notification publish", error);
	}

	return notification;
}

/**
 * Send a notification to multiple recipients.
 * Validates data once, inserts per-user, then batch-resolves push extras.
 */
export async function sendNotifications<T extends NotificationType>(
	recipientIds: string[],
	type: T,
	data: NotificationData<T>,
) {
	const uniqueIds = [...new Set(recipientIds)];
	if (uniqueIds.length === 0) return [];

	// 1. Validate data once (passthrough preserves actor fields)
	const schema = NotificationDataSchemas[type];
	const validatedData = (schema as ZodObject<Record<string, ZodTypeAny>>)
		.passthrough()
		.parse(data);

	// 2. Create DB records (individual creates — MongoDB doesn't support createManyAndReturn)
	const notifications = await Promise.all(
		uniqueIds.map((recipientId) =>
			prisma.notification.create({
				data: {
					userId: recipientId,
					type: type,
					data: validatedData as Prisma.InputJsonValue,
				},
			}),
		),
	);

	// 3. Batch resolve push extras for all recipients
	const extrasMap = await buildPushExtrasForUsers(
		uniqueIds,
		type,
		validatedData as Record<string, unknown>,
	);

	// 4. Publish each notification with pre-computed extras
	await Promise.all(
		notifications.map(async (notification) => {
			try {
				const extras = extrasMap.get(notification.userId);
				await publishNotificationWithExtras(
					{ ...notification, data: validatedData },
					extras,
				);
			} catch (error) {
				logDispatchError("realtime notification publish", error);
			}
		}),
	);

	return notifications;
}
