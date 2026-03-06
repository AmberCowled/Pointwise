import { z } from "zod";

const POST_CONTENT_SCHEMA = z.string().min(1).max(5000);

export const CreatePostRequestSchema = z.object({
	content: POST_CONTENT_SCHEMA,
});

export const EditPostRequestSchema = z.object({
	content: POST_CONTENT_SCHEMA,
});

export const PostSchema = z.object({
	id: z.string(),
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
	commentCount: z.number().int().min(0),
});

export const GetPostsResponseSchema = z.object({
	posts: z.array(PostSchema),
});

export const CreatePostResponseSchema = z.object({
	post: PostSchema,
});

export const EditPostResponseSchema = z.object({
	post: PostSchema,
});

export const DeletePostResponseSchema = z.object({
	success: z.boolean(),
});

export const PostLikeResponseSchema = z.object({
	success: z.boolean(),
});

export type CreatePostRequest = z.infer<typeof CreatePostRequestSchema>;
export type EditPostRequest = z.infer<typeof EditPostRequestSchema>;
export type Post = z.infer<typeof PostSchema>;
export type GetPostsResponse = z.infer<typeof GetPostsResponseSchema>;
export type CreatePostResponse = z.infer<typeof CreatePostResponseSchema>;
export type EditPostResponse = z.infer<typeof EditPostResponseSchema>;
export type DeletePostResponse = z.infer<typeof DeletePostResponseSchema>;
export type PostLikeResponse = z.infer<typeof PostLikeResponseSchema>;
