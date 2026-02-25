import type { NotificationType } from "./registry";

/**
 * Maps push notification category toggle keys to notification types.
 * Used to determine whether to include a push payload based on user settings.
 */
export const PUSH_CATEGORIES: Record<string, NotificationType[]> = {
	pushMessages: ["NEW_MESSAGE"],
	pushFriendRequests: ["FRIEND_REQUEST_RECEIVED", "FRIEND_REQUEST_ACCEPTED"],
	pushProjectActivity: [
		"PROJECT_INVITE_RECEIVED",
		"PROJECT_INVITE_ACCEPTED",
		"PROJECT_JOIN_REQUEST_RECEIVED",
		"PROJECT_JOIN_REQUEST_APPROVED",
		"PROJECT_MEMBER_ROLE_CHANGED",
		"PROJECT_MEMBER_REMOVED",
	],
	pushTaskAssignments: ["TASK_ASSIGNED"],
};

/** Reverse lookup: notification type → category toggle key. */
const typeToCategory = new Map<string, string>();
for (const [category, types] of Object.entries(PUSH_CATEGORIES)) {
	for (const type of types) {
		typeToCategory.set(type, category);
	}
}

/**
 * Get the push category toggle key for a given notification type.
 * Returns undefined if the type has no push category mapping.
 */
export function getCategoryForNotificationType(
	type: string,
): string | undefined {
	return typeToCategory.get(type);
}
