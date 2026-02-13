import { z } from "zod";

const COMMENT_CONTENT_SCHEMA = z.string().min(1).max(5000);
const PROJECT_ID_SCHEMA = z.string();

export const CreateCommentRequestSchema = z.object({
	projectId: PROJECT_ID_SCHEMA,
	content: COMMENT_CONTENT_SCHEMA,
});

export const EditCommentRequestSchema = z.object({
	projectId: PROJECT_ID_SCHEMA,
	content: COMMENT_CONTENT_SCHEMA,
});

export const GetCommentsQuerySchema = z.object({
	projectId: PROJECT_ID_SCHEMA,
});

export const CommentLikeQuerySchema = z.object({
	projectId: PROJECT_ID_SCHEMA,
});

export const CommentSchema = z.object({
	id: z.string(),
	threadId: z.string(),
	authorId: z.string(),
	author: z.object({
		id: z.string(),
		displayName: z.string(),
		image: z.string().nullable(),
	}),
	content: z.string(),
	editedAt: z.string().nullable(),
	createdAt: z.string(),
	likeCount: z.number().int().min(0),
	likedByCurrentUser: z.boolean(),
	replyCount: z.number().int().min(0),
});

export const ReplySchema = CommentSchema.omit({ replyCount: true });

export const GetCommentsResponseSchema = z.object({
	comments: z.array(CommentSchema),
});

export const GetRepliesResponseSchema = z.object({
	replies: z.array(ReplySchema),
});

export const CreateCommentResponseSchema = z.object({
	comment: CommentSchema,
});

export const CreateReplyResponseSchema = z.object({
	reply: ReplySchema,
});

export const EditCommentResponseSchema = z.object({
	comment: z.union([CommentSchema, ReplySchema]),
});

export const DeleteCommentResponseSchema = z.object({
	success: z.boolean(),
});

export const CommentLikeResponseSchema = z.object({
	success: z.boolean(),
});

export type CreateCommentRequest = z.infer<typeof CreateCommentRequestSchema>;
export type EditCommentRequest = z.infer<typeof EditCommentRequestSchema>;
export type GetCommentsQuery = z.infer<typeof GetCommentsQuerySchema>;
export type CommentLikeQuery = z.infer<typeof CommentLikeQuerySchema>;
export type Comment = z.infer<typeof CommentSchema>;
export type Reply = z.infer<typeof ReplySchema>;
export type GetCommentsResponse = z.infer<typeof GetCommentsResponseSchema>;
export type GetRepliesResponse = z.infer<typeof GetRepliesResponseSchema>;
export type CreateCommentResponse = z.infer<typeof CreateCommentResponseSchema>;
export type CreateReplyResponse = z.infer<typeof CreateReplyResponseSchema>;
export type EditCommentResponse = z.infer<typeof EditCommentResponseSchema>;
export type DeleteCommentResponse = z.infer<typeof DeleteCommentResponseSchema>;
export type CommentLikeResponse = z.infer<typeof CommentLikeResponseSchema>;
