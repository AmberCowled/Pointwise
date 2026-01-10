import { z } from "zod";

export const UserSchema = z.object({
	id: z.string(),
	name: z.string().nullable(),
	image: z.string().nullable(),
	xp: z.number(),
});

export const SearchUsersRequestSchema = z.object({
	query: z.string().optional(),
	limit: z.coerce.number().int().min(1).max(100).optional().default(50),
	offset: z.coerce.number().int().min(0).optional().default(0),
});

export const SearchableUserSchema = z.object({
	id: z.string(),
	name: z.string().nullable(),
	image: z.string().nullable(),
	xp: z.number(),
});

export const SearchUsersResponseSchema = z.object({
	users: z.array(SearchableUserSchema),
	pagination: z.object({
		total: z.number(),
		limit: z.number(),
		offset: z.number(),
		hasMore: z.boolean(),
	}),
});

export type User = z.infer<typeof UserSchema>;
export type SearchUsersRequest = z.infer<typeof SearchUsersRequestSchema>;
export type SearchUsersResponse = z.infer<typeof SearchUsersResponseSchema>;
export type SearchableUser = z.infer<typeof SearchableUserSchema>;
