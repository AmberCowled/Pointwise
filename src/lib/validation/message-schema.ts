import { z } from "zod";

export const SendMessageSchema = z.object({
	content: z.string().min(1).max(10000),
});

export const MessageSchema = z.object({
	id: z.string(),
	conversationId: z.string(),
	senderId: z.string(),
	content: z.string(),
	createdAt: z.date(),
	sender: z
		.object({
			id: z.string(),
			displayName: z.string(),
			image: z.string().nullable(),
		})
		.optional(),
});

export const GetMessagesQuerySchema = z.object({
	cursor: z.string().optional(),
	limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});

export const MessagesResponseSchema = z.object({
	messages: z.array(MessageSchema),
	nextCursor: z.string().nullable(),
});

export type SendMessageInput = z.infer<typeof SendMessageSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type GetMessagesQuery = z.infer<typeof GetMessagesQuerySchema>;
export type MessagesResponse = z.infer<typeof MessagesResponseSchema>;
