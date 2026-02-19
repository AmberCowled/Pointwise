import type { NotificationType } from "@pointwise/lib/validation/notification-schema";

/** All user notification channel suffixes. */
export type UserNotificationChannel =
	| "friend-requests"
	| "messages"
	| "projects";

/**
 * Subscription presets — single source of truth for "what event triggers what".
 * Developers choose a preset to subscribe to the correct channel and filter by NotificationType.
 *
 * Use RealtimePreset.* instead of string literals for type-safety and autocomplete.
 * To add a new preset: add to RealtimePreset, extend UserNotificationPreset, and add to SUBSCRIPTION_PRESETS.
 * To override per-call: pass channel/notificationTypes in the hook options.
 */
export type UserNotificationPreset =
	| "friend-notifications"
	| "general-notifications"
	| "message-notifications"
	| "project-notifications";

/** Enum-like object for preset identifiers (e.g. RealtimePreset.GENERAL_NOTIFICATIONS). */
export const RealtimePreset = {
	FRIEND_NOTIFICATIONS: "friend-notifications",
	GENERAL_NOTIFICATIONS: "general-notifications",
	MESSAGE_NOTIFICATIONS: "message-notifications",
	PROJECT_NOTIFICATIONS: "project-notifications",
} as const satisfies Record<string, UserNotificationPreset>;

export const SUBSCRIPTION_PRESETS: Record<
	UserNotificationPreset,
	{
		channel: UserNotificationChannel;
		event: "new-notification";
		/** Filter: only trigger onEvent for these NotificationTypes. Empty = all. */
		notificationTypes?: NotificationType[];
		/** Exclude these (e.g. general-notifications excludes NEW_MESSAGE). */
		excludeNotificationTypes?: NotificationType[];
	}
> = {
	"friend-notifications": {
		channel: "friend-requests",
		event: "new-notification",
		notificationTypes: [
			"FRIEND_REQUEST_ACCEPTED" as const,
			"FRIEND_REQUEST_RECEIVED" as const,
		],
	},
	"general-notifications": {
		channel: "friend-requests",
		event: "new-notification",
		excludeNotificationTypes: ["NEW_MESSAGE" as const],
	},
	"message-notifications": {
		channel: "messages",
		event: "new-notification",
		notificationTypes: ["NEW_MESSAGE" as const],
	},
	"project-notifications": {
		channel: "projects",
		event: "new-notification",
	},
};
