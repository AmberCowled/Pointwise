import prisma from "@pointwise/lib/prisma";
import { getCategoryForNotificationType } from "./categories";
import { FALLBACK_RENDERER, NOTIFICATION_RENDERERS } from "./renderers";

/**
 * Build an Ably push notification payload from a notification type and data.
 * Reuses the existing NOTIFICATION_RENDERERS for message text and URLs.
 */
export function buildPushPayload(
	type: string,
	data: Record<string, unknown>,
): {
	notification: {
		title: string;
		body: string;
		icon: string;
		data?: { url: string };
	};
} {
	const renderer = NOTIFICATION_RENDERERS[type] ?? FALLBACK_RENDERER;
	const body = renderer.getMessage(data);
	const href = renderer.getHref?.(data);

	return {
		notification: {
			title: "Pointwise",
			body,
			icon: "/logo.png",
			...(href ? { data: { url: href } } : {}),
		},
	};
}

const PUSH_DEFAULTS = {
	pushEnabled: true,
	pushMessages: true,
	pushFriendRequests: true,
	pushProjectActivity: true,
	pushTaskAssignments: true,
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
