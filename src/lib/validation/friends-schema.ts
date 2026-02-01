import { z } from "zod";
import { SearchableUserSchema } from "./users-schema";

export const FriendshipStatusSchema = z.enum([
	"NONE",
	"PENDING_SENT",
	"PENDING_RECEIVED",
	"FRIENDS",
]);

export const FriendRequestSchema = z.object({
	id: z.string(),
	senderId: z.string(),
	receiverId: z.string(),
	createdAt: z.date(),
	sender: SearchableUserSchema.optional(),
	receiver: SearchableUserSchema.optional(),
});

export const FriendListResponseSchema = z.object({
	friends: z.array(SearchableUserSchema),
});

export const PendingRequestsResponseSchema = z.object({
	incoming: z.array(FriendRequestSchema),
	outgoing: z.array(FriendRequestSchema),
});

export const FriendshipStatusResponseSchema = z.object({
	status: FriendshipStatusSchema,
	requestId: z.string().optional(),
});

export type FriendshipStatus = z.infer<typeof FriendshipStatusSchema>;
export type FriendRequest = z.infer<typeof FriendRequestSchema>;
export type FriendListResponse = z.infer<typeof FriendListResponseSchema>;
export type PendingRequestsResponse = z.infer<
	typeof PendingRequestsResponseSchema
>;
export type FriendshipStatusResponse = z.infer<
	typeof FriendshipStatusResponseSchema
>;
