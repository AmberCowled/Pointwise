import prisma from "@pointwise/lib/prisma";
import {
	FALLBACK_RENDERER,
	getCategoryForNotificationType,
	NOTIFICATION_RENDERERS,
} from "@pointwise/lib/realtime/registry";

/**
 * Build an Ably push notification payload from a notification type and data.
 * Reuses the existing NOTIFICATION_RENDERERS for message text and URLs.
 */
export function buildPushPayload(
	type: string,
	data: Record<string, unknown>,
): {
	notification: { title: string; body: string; icon: string };
	data?: { url: string };
} {
	const renderer = NOTIFICATION_RENDERERS[type] ?? FALLBACK_RENDERER;
	const body = renderer.getPushMessage?.(data) ?? renderer.getMessage(data);
	const href = renderer.getHref?.(data);

	return {
		notification: {
			title: "Pointwise",
			body,
			icon: "/logo.png",
		},
		...(href ? { data: { url: href } } : {}),
	};
}

const PUSH_DEFAULTS = {
	pushEnabled: true,
	pushMessages: true,
	pushFriendRequests: true,
	pushProjectActivity: true,
	pushTaskAssignments: true,
	pushComments: true,
	pushTaskStatusChanges: true,
	pushLikes: true,
};

/**
 * Build push extras for a user if their settings allow it.
 * Returns the extras object to pass to publishAblyEvent, or undefined.
 * Use this when you want push without creating a DB notification.
 */
export async function buildPushExtras(
	recipientId: string,
	type: string,
	data: Record<string, unknown>,
): Promise<Record<string, unknown> | undefined> {
	try {
		const dbUser = await prisma.user.findUnique({
			where: { id: recipientId },
			select: { notificationSettings: true },
		});

		const settings = dbUser?.notificationSettings ?? PUSH_DEFAULTS;
		if (!settings.pushEnabled) return undefined;

		const categoryKey = getCategoryForNotificationType(type);
		const categoryEnabled = categoryKey
			? (settings[categoryKey as keyof typeof settings] as boolean)
			: false;

		if (!categoryEnabled) return undefined;

		return { push: buildPushPayload(type, data) };
	} catch {
		return undefined;
	}
}

/**
 * Batch variant: resolve push extras for multiple recipients in a single DB query.
 * Returns a Map of userId → extras (or undefined if push disabled for that user).
 */
export async function buildPushExtrasForUsers(
	recipientIds: string[],
	type: string,
	data: Record<string, unknown>,
): Promise<Map<string, Record<string, unknown> | undefined>> {
	const result = new Map<string, Record<string, unknown> | undefined>();
	if (recipientIds.length === 0) return result;

	try {
		const users = await prisma.user.findMany({
			where: { id: { in: recipientIds } },
			select: { id: true, notificationSettings: true },
		});

		const settingsMap = new Map(
			users.map((u) => [u.id, u.notificationSettings ?? PUSH_DEFAULTS]),
		);

		const categoryKey = getCategoryForNotificationType(type);
		const pushPayload = { push: buildPushPayload(type, data) };

		for (const id of recipientIds) {
			const settings = settingsMap.get(id) ?? PUSH_DEFAULTS;
			if (!settings.pushEnabled) {
				result.set(id, undefined);
				continue;
			}
			const categoryEnabled = categoryKey
				? (settings[categoryKey as keyof typeof settings] as boolean)
				: false;
			if (!categoryEnabled) {
				result.set(id, undefined);
				continue;
			}
			result.set(id, pushPayload);
		}
	} catch {
		// On failure, return all undefined (no push)
		for (const id of recipientIds) {
			result.set(id, undefined);
		}
	}

	return result;
}
