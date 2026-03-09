import { z } from "zod";
import {
	EventRegistry,
	type NotificationData,
	notificationTypeValues,
} from "../realtime/registry";

// Re-export everything consumers need from the registry
export {
	type NotificationData,
	NotificationType,
	notificationTypeValues,
} from "../realtime/registry";

// ---------------------------------------------------------------------------
// Shared actor fields (injected by dispatch, stored alongside context data)
// ---------------------------------------------------------------------------

export const ActorFieldsSchema = z.object({
	actorId: z.string(),
	actorName: z.string().nullable(),
	actorImage: z.string().nullable(),
});

export type ActorFields = z.infer<typeof ActorFieldsSchema>;

/** Individual data type exports (derived from registry, includes actor fields). */
export type FriendRequestAcceptedData =
	NotificationData<"FRIEND_REQUEST_ACCEPTED"> & ActorFields;
export type FriendRequestReceivedData =
	NotificationData<"FRIEND_REQUEST_RECEIVED"> & ActorFields;
export type NewMessageData = NotificationData<"NEW_MESSAGE"> & ActorFields;
export type ProjectInviteReceivedData =
	NotificationData<"PROJECT_INVITE_RECEIVED"> & ActorFields;
export type ProjectInviteAcceptedData =
	NotificationData<"PROJECT_INVITE_ACCEPTED"> & ActorFields;
export type ProjectJoinRequestReceivedData =
	NotificationData<"PROJECT_JOIN_REQUEST_RECEIVED"> & ActorFields;
export type ProjectJoinRequestApprovedData =
	NotificationData<"PROJECT_JOIN_REQUEST_APPROVED"> & ActorFields;
export type ProjectMemberRoleChangedData =
	NotificationData<"PROJECT_MEMBER_ROLE_CHANGED"> & ActorFields;
export type ProjectMemberRemovedData =
	NotificationData<"PROJECT_MEMBER_REMOVED"> & ActorFields;
export type TaskAssignedData = NotificationData<"TASK_ASSIGNED"> & ActorFields;
export type TaskCompletedData = NotificationData<"TASK_COMPLETED"> &
	ActorFields;
export type TaskCommentReceivedData =
	NotificationData<"TASK_COMMENT_RECEIVED"> & ActorFields;
export type PostCommentReceivedData =
	NotificationData<"POST_COMMENT_RECEIVED"> & ActorFields;
export type TaskCreatedData = NotificationData<"TASK_CREATED"> & ActorFields;
export type TaskDeletedData = NotificationData<"TASK_DELETED"> & ActorFields;
export type TaskReopenedData = NotificationData<"TASK_REOPENED"> & ActorFields;
export type TaskLikedData = NotificationData<"TASK_LIKED"> & ActorFields;
export type PostLikedData = NotificationData<"POST_LIKED"> & ActorFields;
export type TaskCommentLikedData = NotificationData<"TASK_COMMENT_LIKED"> &
	ActorFields;
export type PostCommentLikedData = NotificationData<"POST_COMMENT_LIKED"> &
	ActorFields;
export type MemberLeftProjectData = NotificationData<"MEMBER_LEFT_PROJECT"> &
	ActorFields;
export type ProjectDeletedData = NotificationData<"PROJECT_DELETED"> &
	ActorFields;

/** Individual data schema exports (derived from registry, merged with actor fields). */
export const FriendRequestAcceptedDataSchema =
	EventRegistry.FRIEND_REQUEST_ACCEPTED.notification.schema.merge(
		ActorFieldsSchema,
	);
export const FriendRequestReceivedDataSchema =
	EventRegistry.FRIEND_REQUEST_RECEIVED.notification.schema.merge(
		ActorFieldsSchema,
	);
export const NewMessageDataSchema =
	EventRegistry.NEW_MESSAGE.notification.schema.merge(ActorFieldsSchema);
export const ProjectInviteReceivedDataSchema =
	EventRegistry.PROJECT_INVITE_RECEIVED.notification.schema.merge(
		ActorFieldsSchema,
	);
export const ProjectInviteAcceptedDataSchema =
	EventRegistry.PROJECT_INVITE_ACCEPTED.notification.schema.merge(
		ActorFieldsSchema,
	);
export const ProjectJoinRequestReceivedDataSchema =
	EventRegistry.PROJECT_JOIN_REQUEST_RECEIVED.notification.schema.merge(
		ActorFieldsSchema,
	);
export const ProjectJoinRequestApprovedDataSchema =
	EventRegistry.PROJECT_JOIN_REQUEST_APPROVED.notification.schema.merge(
		ActorFieldsSchema,
	);
export const ProjectMemberRoleChangedDataSchema =
	EventRegistry.PROJECT_MEMBER_ROLE_CHANGED.notification.schema.merge(
		ActorFieldsSchema,
	);
export const ProjectMemberRemovedDataSchema =
	EventRegistry.PROJECT_MEMBER_REMOVED.notification.schema.merge(
		ActorFieldsSchema,
	);
export const TaskAssignedDataSchema =
	EventRegistry.TASK_ASSIGNED.notification.schema.merge(ActorFieldsSchema);
export const TaskCompletedDataSchema =
	EventRegistry.TASK_COMPLETED.notification.schema.merge(ActorFieldsSchema);
export const TaskCommentReceivedDataSchema =
	EventRegistry.TASK_COMMENT_RECEIVED.notification.schema.merge(
		ActorFieldsSchema,
	);
export const PostCommentReceivedDataSchema =
	EventRegistry.POST_COMMENT_RECEIVED.notification.schema.merge(
		ActorFieldsSchema,
	);
export const TaskCreatedDataSchema =
	EventRegistry.TASK_CREATED.notification.schema.merge(ActorFieldsSchema);
export const TaskDeletedDataSchema =
	EventRegistry.TASK_DELETED.notification.schema.merge(ActorFieldsSchema);
export const TaskReopenedDataSchema =
	EventRegistry.TASK_REOPENED.notification.schema.merge(ActorFieldsSchema);
export const TaskLikedDataSchema =
	EventRegistry.TASK_LIKED.notification.schema.merge(ActorFieldsSchema);
export const PostLikedDataSchema =
	EventRegistry.POST_LIKED.notification.schema.merge(ActorFieldsSchema);
export const TaskCommentLikedDataSchema =
	EventRegistry.TASK_COMMENT_LIKED.notification.schema.merge(ActorFieldsSchema);
export const PostCommentLikedDataSchema =
	EventRegistry.POST_COMMENT_LIKED.notification.schema.merge(ActorFieldsSchema);
export const MemberLeftProjectDataSchema =
	EventRegistry.MEMBER_LEFT_PROJECT.notification.schema.merge(
		ActorFieldsSchema,
	);
export const ProjectDeletedDataSchema =
	EventRegistry.PROJECT_DELETED.notification.schema.merge(ActorFieldsSchema);

/** Union of all data schemas (each merged with actor fields). */
export const NotificationDataSchema = z.union([
	FriendRequestAcceptedDataSchema,
	FriendRequestReceivedDataSchema,
	NewMessageDataSchema,
	ProjectInviteReceivedDataSchema,
	ProjectInviteAcceptedDataSchema,
	ProjectJoinRequestReceivedDataSchema,
	ProjectJoinRequestApprovedDataSchema,
	ProjectMemberRoleChangedDataSchema,
	ProjectMemberRemovedDataSchema,
	TaskAssignedDataSchema,
	TaskCompletedDataSchema,
	TaskCommentReceivedDataSchema,
	PostCommentReceivedDataSchema,
	TaskCreatedDataSchema,
	TaskDeletedDataSchema,
	TaskReopenedDataSchema,
	TaskLikedDataSchema,
	PostLikedDataSchema,
	TaskCommentLikedDataSchema,
	PostCommentLikedDataSchema,
	MemberLeftProjectDataSchema,
	ProjectDeletedDataSchema,
]);

/** Zod schema for the notification type field (validated at app level, stored as String in DB). */
export const NotificationTypeSchema = z
	.string()
	.refine(
		(val): val is (typeof notificationTypeValues)[number] =>
			notificationTypeValues.includes(val as never),
		{ message: "Invalid notification type" },
	);

/** Full notification record shape. */
export const NotificationSchema = z.object({
	id: z.string(),
	userId: z.string(),
	type: z.string(),
	data: z.any(),
	read: z.boolean(),
	createdAt: z.string().or(z.date()),
});

export type Notification = z.infer<typeof NotificationSchema>;

/** Paginated response shape for the notifications list endpoint. */
export interface NotificationsResponse {
	notifications: Notification[];
	nextCursor: string | null;
	hasMore: boolean;
}
