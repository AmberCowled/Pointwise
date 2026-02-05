import { z } from "zod";

export const CreateConversationSchema = z.object({
	participantIds: z
		.array(z.string())
		.min(1, "At least one participant required"),
	name: z.string().max(100).nullable().optional(),
});

export const UpdateConversationSchema = z.object({
	name: z.string().max(100).nullable().optional(),
	addParticipantIds: z.array(z.string()).optional(),
});

export const ConversationParticipantSchema = z.object({
	id: z.string(),
	conversationId: z.string(),
	userId: z.string(),
	joinedAt: z.date(),
	lastReadAt: z.date().nullable(),
	user: z
		.object({
			id: z.string(),
			displayName: z.string(),
			image: z.string().nullable(),
		})
		.optional(),
});

export const ConversationSchema = z.object({
	id: z.string(),
	name: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
	participants: z.array(ConversationParticipantSchema).optional(),
	messages: z.array(z.unknown()).optional(),
	canSend: z.boolean().optional(),
});

export const ConversationListItemSchema = z.object({
	id: z.string(),
	name: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
	participants: z.array(ConversationParticipantSchema).optional(),
	lastMessage: z
		.object({
			id: z.string(),
			content: z.string(),
			senderId: z.string(),
			createdAt: z.date(),
		})
		.nullable()
		.optional(),
});

export type CreateConversationInput = z.infer<typeof CreateConversationSchema>;
export type UpdateConversationInput = z.infer<typeof UpdateConversationSchema>;
export type Conversation = z.infer<typeof ConversationSchema>;
export type ConversationListItem = z.infer<typeof ConversationListItemSchema>;
