import { z } from "zod";

// ---------------------------------------------------------------------------
// Tag types — mirrors the RTK Query tag strings used by invalidateTags
// ---------------------------------------------------------------------------

type TagDescription = string | { type: string; id: string };

type TagResolver = TagDescription[] | ((data: unknown) => TagDescription[]);

// ---------------------------------------------------------------------------
// Notification renderer interface (consumed by NotificationMenu, push.ts)
// ---------------------------------------------------------------------------

export interface NotificationRenderer {
	/** Human-readable message for the notification. */
	getMessage(data: Record<string, unknown>): string;
	/** Optional push-specific copy. Falls back to getMessage if not implemented. */
	getPushMessage?(data: Record<string, unknown>): string;
	/** User info for avatar/name display. Returns { name, image }. */
	getUser(data: Record<string, unknown>): {
		name: string;
		image: string | null;
	};
	/** Optional user ID for the actor (for linking to their profile). */
	getUserId?(data: Record<string, unknown>): string | undefined;
	/** Optional link to navigate to when clicking the notification. */
	getHref?(data: Record<string, unknown>): string;
}

// ---------------------------------------------------------------------------
// Notification action definition interface
// ---------------------------------------------------------------------------

export interface NotificationActionDefinition {
	label: string;
	variant: "accept" | "reject";
	/** Returns the arguments to pass to the mutation. */
	getPayload: (data: Record<string, unknown>) => Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Actor framework
// ---------------------------------------------------------------------------

export interface ActorInfo {
	id: string;
	name: string;
	image: string | null;
}

/** Read standardized actor fields from notification data. */
export function extractActor(data: Record<string, unknown>): ActorInfo {
	return {
		id: data.actorId as string,
		name: (data.actorName as string) ?? "Someone",
		image: (data.actorImage as string | null) ?? null,
	};
}

// ---------------------------------------------------------------------------
// Compat adapter: builds a NotificationRenderer from simplified entry shape
// ---------------------------------------------------------------------------

function buildCompatRenderer(notif: {
	getMessage(data: Record<string, unknown>, actorName: string): string;
	getHref?(data: Record<string, unknown>): string;
}): NotificationRenderer {
	return {
		getMessage(data) {
			const actor = extractActor(data);
			return notif.getMessage(data, actor.name);
		},
		getUser(data) {
			const actor = extractActor(data);
			return { name: actor.name || "User", image: actor.image };
		},
		getUserId(data) {
			return extractActor(data).id || undefined;
		},
		getHref: notif.getHref,
	};
}

// ---------------------------------------------------------------------------
// Shared schemas
// ---------------------------------------------------------------------------

const CommentEventSchema = z.object({
	commentId: z.string(),
	threadId: z.string(),
	taskId: z.string().optional(),
	postId: z.string().optional(),
	parentCommentId: z.string().nullable(),
	comment: z.record(z.string(), z.unknown()).nullable(),
});

// ---------------------------------------------------------------------------
// Shared tag arrays
// ---------------------------------------------------------------------------

const FRIEND_TAGS: TagDescription[] = [
	"Friends",
	"FriendRequests",
	"FriendshipStatus",
];
const PROJECT_TAGS: TagDescription[] = ["Projects", "Invites", "JoinRequests"];

// ---------------------------------------------------------------------------
// Unified Event Registry
// ---------------------------------------------------------------------------

export const EventRegistry = {
	// -----------------------------------------------------------------------
	// Realtime-only entries (16) — have `event`, no `notification`
	// -----------------------------------------------------------------------

	NEW_NOTIFICATION: {
		event: "new-notification" as const,
		schema: z.object({
			id: z.string(),
			userId: z.string(),
			type: z.string(),
			data: z.unknown(),
			read: z.boolean(),
			createdAt: z.string(),
		}),
		tags: null,
	},
	FRIENDSHIP_REMOVED: {
		event: "friendship:removed" as const,
		schema: z.object({ removerId: z.string() }),
		tags: FRIEND_TAGS,
	},
	FRIEND_REQUEST_DECLINED: {
		event: "friend-request:declined" as const,
		schema: z.object({ declinerId: z.string() }),
		tags: FRIEND_TAGS,
	},
	FRIEND_REQUEST_CANCELLED: {
		event: "friend-request:cancelled" as const,
		schema: z.object({ cancellerId: z.string() }),
		tags: FRIEND_TAGS,
	},
	INVITE_REJECTED: {
		event: "invite:rejected" as const,
		schema: z.object({ projectId: z.string() }),
		tags: PROJECT_TAGS,
	},
	INVITE_CANCELLED: {
		event: "invite:cancelled" as const,
		schema: z.object({ projectId: z.string() }),
		tags: PROJECT_TAGS,
	},
	INVITE_SENT: {
		event: "invite:sent" as const,
		schema: z.object({ projectId: z.string() }),
		tags: PROJECT_TAGS,
	},
	JOIN_REQUEST_REJECTED: {
		event: "join-request:rejected" as const,
		schema: z.object({ projectId: z.string() }),
		tags: PROJECT_TAGS,
	},
	JOIN_REQUEST_RECEIVED: {
		event: "join-request:received" as const,
		schema: z.object({ projectId: z.string() }),
		tags: PROJECT_TAGS,
	},
	JOIN_REQUEST_APPROVED: {
		event: "join-request:approved" as const,
		schema: z.object({ projectId: z.string() }),
		tags: PROJECT_TAGS,
	},
	MEMBER_REMOVED: {
		event: "member:removed" as const,
		schema: z.object({ projectId: z.string() }),
		tags: PROJECT_TAGS,
	},
	MEMBER_ROLE_UPDATED: {
		event: "member:role-updated" as const,
		schema: z.object({ projectId: z.string() }),
		tags: PROJECT_TAGS,
	},
	NOTIFICATIONS_READ: {
		event: "notifications:read" as const,
		schema: z.object({ userId: z.string() }),
		tags: ["Notifications"] as TagDescription[],
	},
	COMMENT_CREATED: {
		event: "comment:created" as const,
		schema: CommentEventSchema,
		tags: resolveCommentTags as TagResolver,
	},
	COMMENT_EDITED: {
		event: "comment:edited" as const,
		schema: CommentEventSchema,
		tags: resolveCommentTags as TagResolver,
	},
	COMMENT_DELETED: {
		event: "comment:deleted" as const,
		schema: CommentEventSchema,
		tags: resolveCommentTags as TagResolver,
	},

	// -----------------------------------------------------------------------
	// Notification entries (13) — have `notification`, some also have `event`
	// Actor fields (actorId/actorName/actorImage) are injected by dispatch()
	// and are NOT in the per-type schema — only context fields are declared.
	// -----------------------------------------------------------------------

	FRIEND_REQUEST_RECEIVED: {
		event: "friend-request:received" as const,
		schema: z.object({ senderId: z.string() }),
		tags: FRIEND_TAGS,
		notification: {
			schema: z.object({}),
			pushCategory: "pushFriendRequests" as const,
			menu: "friends" as const,
			getMessage(_data: Record<string, unknown>, actorName: string) {
				return `${actorName} sent you a friend request.`;
			},
		},
	},
	FRIEND_REQUEST_ACCEPTED: {
		tags: FRIEND_TAGS,
		notification: {
			schema: z.object({}),
			pushCategory: "pushFriendRequests" as const,
			menu: "notifications" as const,
			getMessage(_data: Record<string, unknown>, actorName: string) {
				return `${actorName} accepted your friend request.`;
			},
			getHref(data: Record<string, unknown>) {
				return `/profile/${(data as { actorId: string }).actorId}`;
			},
		},
	},
	NEW_MESSAGE: {
		event: "new-message" as const,
		schema: z.object({
			id: z.string(),
			conversationId: z.string(),
			senderId: z.string(),
			content: z.string(),
			createdAt: z.string(),
			sender: z
				.object({
					id: z.string(),
					displayName: z.string().nullable(),
					image: z.string().nullable(),
				})
				.optional(),
		}),
		tags: ((data) => {
			const { conversationId } = data as { conversationId: string };
			return ["Conversations", { type: "Messages", id: conversationId }];
		}) as TagResolver,
		notification: {
			schema: z.object({
				conversationId: z.string(),
				messageSnippet: z.string(),
				messageId: z.string(),
			}),
			pushCategory: "pushMessages" as const,
			menu: "messages" as const,
			getMessage(data: Record<string, unknown>, actorName: string) {
				const d = data as { messageSnippet: string };
				return `${actorName}: ${d.messageSnippet}`;
			},
			getHref(data: Record<string, unknown>) {
				return `/messages/${(data as { conversationId: string }).conversationId}`;
			},
		},
	},
	PROJECT_INVITE_RECEIVED: {
		tags: null,
		notification: {
			schema: z.object({
				inviteId: z.string(),
				projectId: z.string(),
				projectName: z.string(),
				role: z.string(),
			}),
			pushCategory: "pushProjectActivity" as const,
			menu: "notifications" as const,
			getMessage(data: Record<string, unknown>, actorName: string) {
				const d = data as { projectName: string };
				return `${actorName} invited you to join ${d.projectName}.`;
			},
			actions(data: Record<string, unknown>): NotificationActionDefinition[] {
				const d = data as { inviteId: string };
				return [
					{
						label: "Accept",
						variant: "accept",
						getPayload: () => ({ inviteId: d.inviteId }),
					},
					{
						label: "Reject",
						variant: "reject",
						getPayload: () => ({ inviteId: d.inviteId }),
					},
				];
			},
		},
	},
	PROJECT_INVITE_ACCEPTED: {
		tags: [...PROJECT_TAGS, "Members"] as TagDescription[],
		notification: {
			schema: z.object({
				projectId: z.string(),
				projectName: z.string(),
				role: z.string(),
			}),
			pushCategory: "pushProjectActivity" as const,
			menu: "notifications" as const,
			getMessage(data: Record<string, unknown>, actorName: string) {
				const d = data as { projectName: string };
				return `${actorName} accepted your invite to ${d.projectName}.`;
			},
			getHref(data: Record<string, unknown>) {
				return `/dashboard/${(data as { projectId: string }).projectId}`;
			},
		},
	},
	PROJECT_JOIN_REQUEST_RECEIVED: {
		tags: PROJECT_TAGS,
		notification: {
			schema: z.object({
				projectId: z.string(),
				projectName: z.string(),
			}),
			pushCategory: "pushProjectActivity" as const,
			menu: "notifications" as const,
			getMessage(data: Record<string, unknown>, actorName: string) {
				const d = data as { projectName: string };
				return `${actorName} requested to join ${d.projectName}.`;
			},
			actions(data: Record<string, unknown>): NotificationActionDefinition[] {
				const d = data as { projectId: string; actorId: string };
				return [
					{
						label: "Approve",
						variant: "accept",
						getPayload: () => ({
							projectId: d.projectId,
							userId: d.actorId,
						}),
					},
					{
						label: "Reject",
						variant: "reject",
						getPayload: () => ({
							projectId: d.projectId,
							userId: d.actorId,
						}),
					},
				];
			},
		},
	},
	PROJECT_JOIN_REQUEST_APPROVED: {
		tags: [...PROJECT_TAGS, "Members"] as TagDescription[],
		notification: {
			schema: z.object({
				projectId: z.string(),
				projectName: z.string(),
				role: z.string(),
			}),
			pushCategory: "pushProjectActivity" as const,
			menu: "notifications" as const,
			getMessage(data: Record<string, unknown>, _actorName: string) {
				return `Your request to join ${(data as { projectName: string }).projectName} was approved!`;
			},
			getHref(data: Record<string, unknown>) {
				return `/dashboard/${(data as { projectId: string }).projectId}`;
			},
		},
	},
	PROJECT_MEMBER_ROLE_CHANGED: {
		tags: null,
		notification: {
			schema: z.object({
				projectId: z.string(),
				projectName: z.string(),
				newRole: z.string(),
			}),
			pushCategory: "pushProjectActivity" as const,
			menu: "notifications" as const,
			getMessage(data: Record<string, unknown>, _actorName: string) {
				const d = data as { projectName: string; newRole: string };
				return `Your role in ${d.projectName} was changed to ${d.newRole}.`;
			},
			getHref(data: Record<string, unknown>) {
				return `/dashboard/${(data as { projectId: string }).projectId}`;
			},
		},
	},
	PROJECT_MEMBER_REMOVED: {
		tags: null,
		notification: {
			schema: z.object({
				projectId: z.string(),
				projectName: z.string(),
			}),
			pushCategory: "pushProjectActivity" as const,
			menu: "notifications" as const,
			getMessage(data: Record<string, unknown>, _actorName: string) {
				return `You were removed from ${(data as { projectName: string }).projectName}.`;
			},
			getHref() {
				return "/dashboard";
			},
		},
	},
	TASK_ASSIGNED: {
		tags: null,
		notification: {
			schema: z.object({
				projectId: z.string(),
				projectName: z.string(),
				taskId: z.string(),
				taskName: z.string(),
			}),
			pushCategory: "pushTaskAssignments" as const,
			menu: "notifications" as const,
			getMessage(data: Record<string, unknown>, actorName: string) {
				const d = data as { taskName: string; projectName: string };
				return `${actorName} assigned you to "${d.taskName}" in ${d.projectName}.`;
			},
			getHref(data: Record<string, unknown>) {
				return `/dashboard/${(data as { projectId: string }).projectId}`;
			},
		},
	},
	TASK_COMPLETED: {
		tags: ["Tasks", "XP"] as TagDescription[],
		notification: {
			schema: z.object({
				projectId: z.string(),
				projectName: z.string(),
				taskId: z.string(),
				taskName: z.string(),
			}),
			pushCategory: "pushTaskStatusChanges" as const,
			menu: "notifications" as const,
			getMessage(data: Record<string, unknown>, actorName: string) {
				const d = data as { taskName: string; projectName: string };
				return `${actorName} completed "${d.taskName}" in ${d.projectName}.`;
			},
			getHref(data: Record<string, unknown>) {
				return `/dashboard/${(data as { projectId: string }).projectId}`;
			},
		},
	},
	TASK_COMMENT_RECEIVED: {
		tags: null,
		notification: {
			schema: z.object({
				taskId: z.string(),
				taskName: z.string(),
				projectId: z.string(),
				projectName: z.string(),
				commentId: z.string(),
				commentSnippet: z.string(),
				isReply: z.boolean(),
			}),
			pushCategory: "pushComments" as const,
			menu: "notifications" as const,
			getMessage(data: Record<string, unknown>, actorName: string) {
				const d = data as { taskName: string; isReply: boolean };
				return d.isReply
					? `${actorName} replied to a comment on "${d.taskName}".`
					: `${actorName} commented on "${d.taskName}".`;
			},
			getHref(data: Record<string, unknown>) {
				return `/dashboard/${(data as { projectId: string }).projectId}`;
			},
		},
	},
	POST_COMMENT_RECEIVED: {
		tags: null,
		notification: {
			schema: z.object({
				postId: z.string(),
				commentId: z.string(),
				commentSnippet: z.string(),
				isReply: z.boolean(),
			}),
			pushCategory: "pushComments" as const,
			menu: "notifications" as const,
			getMessage(data: Record<string, unknown>, actorName: string) {
				const d = data as { isReply: boolean };
				return d.isReply
					? `${actorName} replied to a comment on your post.`
					: `${actorName} commented on your post.`;
			},
			getHref(data: Record<string, unknown>) {
				return `/profile/posts#${(data as { postId: string }).postId}`;
			},
		},
	},

	// -----------------------------------------------------------------------
	// New notification entries (7) — tasks, likes, project lifecycle
	// -----------------------------------------------------------------------

	TASK_CREATED: {
		tags: ["Tasks"] as TagDescription[],
		notification: {
			schema: z.object({
				projectId: z.string(),
				projectName: z.string(),
				taskId: z.string(),
				taskName: z.string(),
			}),
			pushCategory: "pushTaskStatusChanges" as const,
			menu: "notifications" as const,
			getMessage(data: Record<string, unknown>, actorName: string) {
				const d = data as { taskName: string; projectName: string };
				return `${actorName} created "${d.taskName}" in ${d.projectName}.`;
			},
			getHref(data: Record<string, unknown>) {
				return `/dashboard/${(data as { projectId: string }).projectId}`;
			},
		},
	},
	TASK_DELETED: {
		tags: ["Tasks"] as TagDescription[],
		notification: {
			schema: z.object({
				projectId: z.string(),
				projectName: z.string(),
				taskName: z.string(),
			}),
			pushCategory: "pushTaskStatusChanges" as const,
			menu: "notifications" as const,
			getMessage(data: Record<string, unknown>, actorName: string) {
				const d = data as { taskName: string; projectName: string };
				return `${actorName} deleted "${d.taskName}" from ${d.projectName}.`;
			},
			getHref(data: Record<string, unknown>) {
				return `/dashboard/${(data as { projectId: string }).projectId}`;
			},
		},
	},
	TASK_REOPENED: {
		tags: ["Tasks"] as TagDescription[],
		notification: {
			schema: z.object({
				projectId: z.string(),
				projectName: z.string(),
				taskId: z.string(),
				taskName: z.string(),
			}),
			pushCategory: "pushTaskStatusChanges" as const,
			menu: "notifications" as const,
			getMessage(data: Record<string, unknown>, actorName: string) {
				const d = data as { taskName: string; projectName: string };
				return `${actorName} reopened "${d.taskName}" in ${d.projectName}.`;
			},
			getHref(data: Record<string, unknown>) {
				return `/dashboard/${(data as { projectId: string }).projectId}`;
			},
		},
	},
	TASK_LIKED: {
		tags: null,
		notification: {
			schema: z.object({
				projectId: z.string(),
				projectName: z.string(),
				taskId: z.string(),
				taskName: z.string(),
			}),
			pushCategory: "pushLikes" as const,
			menu: "notifications" as const,
			getMessage(data: Record<string, unknown>, actorName: string) {
				const d = data as { taskName: string };
				return `${actorName} liked your task "${d.taskName}".`;
			},
			getHref(data: Record<string, unknown>) {
				return `/dashboard/${(data as { projectId: string }).projectId}`;
			},
		},
	},
	POST_LIKED: {
		tags: null,
		notification: {
			schema: z.object({
				postId: z.string(),
			}),
			pushCategory: "pushLikes" as const,
			menu: "notifications" as const,
			getMessage(_data: Record<string, unknown>, actorName: string) {
				return `${actorName} liked your post.`;
			},
			getHref(data: Record<string, unknown>) {
				return `/profile/posts#${(data as { postId: string }).postId}`;
			},
		},
	},
	TASK_COMMENT_LIKED: {
		tags: null,
		notification: {
			schema: z.object({
				taskId: z.string(),
				taskName: z.string(),
				projectId: z.string(),
				projectName: z.string(),
				commentId: z.string(),
			}),
			pushCategory: "pushLikes" as const,
			menu: "notifications" as const,
			getMessage(_data: Record<string, unknown>, actorName: string) {
				const d = _data as { taskName: string };
				return `${actorName} liked your comment on "${d.taskName}".`;
			},
			getHref(data: Record<string, unknown>) {
				return `/dashboard/${(data as { projectId: string }).projectId}`;
			},
		},
	},
	POST_COMMENT_LIKED: {
		tags: null,
		notification: {
			schema: z.object({
				postId: z.string(),
				commentId: z.string(),
			}),
			pushCategory: "pushLikes" as const,
			menu: "notifications" as const,
			getMessage(_data: Record<string, unknown>, actorName: string) {
				return `${actorName} liked your comment on a post.`;
			},
			getHref(data: Record<string, unknown>) {
				return `/profile/posts#${(data as { postId: string }).postId}`;
			},
		},
	},
	MEMBER_LEFT_PROJECT: {
		tags: ["Projects", "Members"] as TagDescription[],
		notification: {
			schema: z.object({
				projectId: z.string(),
				projectName: z.string(),
			}),
			pushCategory: "pushProjectActivity" as const,
			menu: "notifications" as const,
			getMessage(data: Record<string, unknown>, actorName: string) {
				const d = data as { projectName: string };
				return `${actorName} left ${d.projectName}.`;
			},
			getHref(data: Record<string, unknown>) {
				return `/dashboard/${(data as { projectId: string }).projectId}`;
			},
		},
	},
	PROJECT_DELETED: {
		tags: ["Projects"] as TagDescription[],
		notification: {
			schema: z.object({
				projectName: z.string(),
			}),
			pushCategory: "pushProjectActivity" as const,
			menu: "notifications" as const,
			getMessage(data: Record<string, unknown>, actorName: string) {
				const d = data as { projectName: string };
				return `${actorName} deleted ${d.projectName}.`;
			},
			getHref() {
				return "/dashboard";
			},
		},
	},

	// -----------------------------------------------------------------------
	// New event-only entries (3) — realtime cache invalidation
	// -----------------------------------------------------------------------

	TASK_MUTATED: {
		event: "task:mutated" as const,
		schema: z.object({ projectId: z.string() }),
		tags: ["Tasks"] as TagDescription[],
	},
	PROJECT_MUTATED: {
		event: "project:mutated" as const,
		schema: z.object({ projectId: z.string() }),
		tags: ["Projects", "Members"] as TagDescription[],
	},
	POST_MUTATED: {
		event: "post:mutated" as const,
		schema: z.object({ postId: z.string() }),
		tags: ["Posts"] as TagDescription[],
	},
};

// ---------------------------------------------------------------------------
// Comment tag resolver (shared by COMMENT_CREATED/EDITED/DELETED)
// ---------------------------------------------------------------------------

function resolveCommentTags(data: unknown): TagDescription[] {
	const payload = data as {
		taskId?: string;
		postId?: string;
		parentCommentId?: string | null;
	};
	const tags: TagDescription[] = [];

	if (payload.taskId) {
		tags.push({ type: "Comments", id: payload.taskId });
		if (payload.parentCommentId) {
			tags.push({ type: "Replies", id: payload.parentCommentId });
		}
	}
	if (payload.postId) {
		tags.push({ type: "PostComments", id: payload.postId });
		if (payload.parentCommentId) {
			tags.push({ type: "PostReplies", id: payload.parentCommentId });
		}
	}

	return tags;
}

// ---------------------------------------------------------------------------
// Derived realtime exports (backwards-compatible)
// ---------------------------------------------------------------------------

type EventRegistryKey = keyof typeof EventRegistry;

/** Keys of entries that have a dedicated Ably event. */
export type RealtimeEventKey = {
	[K in EventRegistryKey]: (typeof EventRegistry)[K] extends { event: string }
		? K
		: never;
}[EventRegistryKey];

/** Backwards-compatible alias — the full registry. */
export const RealtimeEventRegistry = EventRegistry;

/** Event key → event name string map (backwards-compatible). */
export const RealtimeEvents = Object.fromEntries(
	Object.entries(EventRegistry)
		.filter(([, entry]) => "event" in entry)
		.map(([key, entry]) => [key, (entry as { event: string }).event]),
) as {
	[K in RealtimeEventKey]: (typeof EventRegistry)[K] extends { event: string }
		? (typeof EventRegistry)[K]["event"]
		: never;
};

/** Union of all event name strings. */
export type RealtimeEventName = (typeof RealtimeEvents)[RealtimeEventKey];

/** Inferred payload type for a given realtime event key. */
export type RealtimeEventData<K extends RealtimeEventKey> =
	(typeof EventRegistry)[K] extends { schema: z.ZodType }
		? z.infer<(typeof EventRegistry)[K]["schema"]>
		: never;

/** Channel name builders — single source of truth for all Ably channels. */
export const RealtimeChannels = {
	/** Single user-scoped channel for all realtime events. */
	user: (userId: string) => `user:${userId}`,
} as const;

// ---------------------------------------------------------------------------
// Derived notification exports (backwards-compatible)
// ---------------------------------------------------------------------------

/** Keys of entries that represent DB-persisted notifications. */
export type NotificationType = {
	[K in EventRegistryKey]: (typeof EventRegistry)[K] extends {
		notification: { schema: z.ZodType };
	}
		? K
		: never;
}[EventRegistryKey];

/** Array of all notification type values (for validation). */
export const notificationTypeValues = Object.keys(EventRegistry).filter(
	(key) => "notification" in EventRegistry[key as EventRegistryKey],
) as NotificationType[];

/** Enum-like object for NotificationType (e.g. NotificationType.FRIEND_REQUEST_ACCEPTED). */
export const NotificationType = Object.fromEntries(
	notificationTypeValues.map((k) => [k, k]),
) as { [K in NotificationType]: K };

/** Map of notification type → Zod data schema. */
export const NotificationDataSchemas = Object.fromEntries(
	Object.entries(EventRegistry)
		.filter(([, entry]) => "notification" in entry)
		.map(([key, entry]) => [
			key,
			(entry as { notification: { schema: z.ZodType } }).notification.schema,
		]),
) as {
	[K in NotificationType]: (typeof EventRegistry)[K] extends {
		notification: { schema: z.ZodType };
	}
		? (typeof EventRegistry)[K]["notification"]["schema"]
		: never;
};

/** Inferred data type for a given notification type (context-only fields from schema). */
export type NotificationData<T extends NotificationType> =
	(typeof EventRegistry)[T] extends {
		notification: { schema: z.ZodType };
	}
		? z.infer<(typeof EventRegistry)[T]["notification"]["schema"]>
		: never;

/** Map of notification type → renderer (built via compat adapter). */
export const NOTIFICATION_RENDERERS: Record<string, NotificationRenderer> =
	Object.fromEntries(
		Object.entries(EventRegistry)
			.filter(([, entry]) => "notification" in entry)
			.map(([key, entry]) => {
				const notif = (
					entry as {
						notification: {
							getMessage(
								data: Record<string, unknown>,
								actorName: string,
							): string;
							getHref?(data: Record<string, unknown>): string;
						};
					}
				).notification;
				return [key, buildCompatRenderer(notif)];
			}),
	);

/** Fallback renderer for unknown notification types. */
export const FALLBACK_RENDERER: NotificationRenderer = {
	getMessage() {
		return "You have a new notification.";
	},
	getUser() {
		return { name: "User", image: null };
	},
};

/** Reverse lookup: notification type → push category toggle key. */
const typeToPushCategory = new Map<string, string>();
for (const [key, entry] of Object.entries(EventRegistry)) {
	if (
		"notification" in entry &&
		typeof (entry as Record<string, unknown>).notification === "object"
	) {
		const notif = (entry as { notification: { pushCategory: string } })
			.notification;
		typeToPushCategory.set(key, notif.pushCategory);
	}
}

export function getCategoryForNotificationType(
	type: string,
): string | undefined {
	return typeToPushCategory.get(type);
}

// ---------------------------------------------------------------------------
// Menu routing helper
// ---------------------------------------------------------------------------

/** Reverse lookup: notification type → menu ("notifications" | "messages"). */
const typeToMenu = new Map<string, string>();
for (const [key, entry] of Object.entries(EventRegistry)) {
	if (
		"notification" in entry &&
		typeof (entry as Record<string, unknown>).notification === "object"
	) {
		const notif = (
			entry as { notification: { menu: "notifications" | "messages" } }
		).notification;
		typeToMenu.set(key, notif.menu);
	}
}

/** Get the menu a notification type belongs to ("notifications" or "messages"). */
export function getNotificationMenu(type: string): string | undefined {
	return typeToMenu.get(type);
}

// ---------------------------------------------------------------------------
// Action resolution helper
// ---------------------------------------------------------------------------

/** Get action definitions for a notification type, if any are co-located in the registry. */
export function getRegistryActions(
	type: string,
	data: Record<string, unknown>,
): NotificationActionDefinition[] | undefined {
	const entry = EventRegistry[type as keyof typeof EventRegistry];
	if (!entry || !("notification" in entry)) return undefined;
	const notif = (entry as { notification: Record<string, unknown> })
		.notification;
	if (typeof notif.actions !== "function") return undefined;
	const actions = (
		notif.actions as (
			data: Record<string, unknown>,
		) => NotificationActionDefinition[]
	)(data);
	return actions.length > 0 ? actions : undefined;
}

// ---------------------------------------------------------------------------
// Tag resolution helpers (used by RealtimeProvider)
// ---------------------------------------------------------------------------

/** Reverse lookup: event name string → registry key. */
const nameToKey = new Map<string, RealtimeEventKey>(
	(
		Object.entries(EventRegistry) as [
			EventRegistryKey,
			Record<string, unknown>,
		][]
	)
		.filter((e) => typeof e[1].event === "string")
		.map(([key, entry]) => [entry.event as string, key as RealtimeEventKey]),
);

/** Resolve tags for a realtime event (returns [] for NEW_NOTIFICATION or unknown events). */
export function resolveEventTags(
	eventName: string,
	data: unknown,
): TagDescription[] {
	const key = nameToKey.get(eventName);
	if (!key) return [];

	const entry = EventRegistry[key];
	const resolver = entry.tags;
	if (resolver === null) return [];

	return typeof resolver === "function" ? resolver(data) : [...resolver];
}

/** Resolve tags for a notification sub-type (used inside the NEW_NOTIFICATION handler). */
export function resolveNotificationTypeTags(
	notificationType: string,
	data: unknown,
): TagDescription[] {
	const entry = EventRegistry[notificationType as keyof typeof EventRegistry];
	if (!entry) return [];

	const resolver = entry.tags;
	if (resolver === null) return [];

	return typeof resolver === "function" ? resolver(data) : [...resolver];
}

// ---------------------------------------------------------------------------
// Backwards-compatible type aliases (replaces types.ts)
// ---------------------------------------------------------------------------

export type NewNotificationPayload = RealtimeEventData<"NEW_NOTIFICATION">;
export type NewMessagePayload = RealtimeEventData<"NEW_MESSAGE">;
export type CommentEventPayload = RealtimeEventData<"COMMENT_CREATED">;

/** Union of all known event payloads. */
export type RealtimeEventPayload =
	| NewNotificationPayload
	| NewMessagePayload
	| CommentEventPayload;
