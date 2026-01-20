import { z } from "zod";

export const DisplayNameSchema = z.string().min(1).max(50);

export const UserSchema = z.object({
	id: z.string(),
	name: z.string().nullable(),
	email: z.string().nullable(),
	image: z.string().nullable(),
	profileVisibility: z.string().nullable(),
	xp: z.number(),
	emailVerified: z.boolean().nullable(),
	displayName: DisplayNameSchema, // Required, 1-50 chars
	bio: z.string().max(500).nullable(), // Optional, max 500 chars
	location: z.string().max(100).nullable(), // Optional, max 100 chars
	website: z.string().url().nullable().or(z.literal("")), // Optional URL or empty string
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const GetUserResponseSchema = z.object({
	user: UserSchema,
});

export const UpdateUserProfileSchema = z.object({
	displayName: DisplayNameSchema,
	bio: z.string().max(500).nullable(),
	location: z.string().max(100).nullable(),
	website: z.string().url().nullable().or(z.literal("")),
	profileVisibility: z.enum(["PRIVATE", "PUBLIC"]),
});

export const UpdateUserProfileResponseSchema = z.object({
	user: UserSchema,
});

export const SearchUsersRequestSchema = z.object({
	query: z.string().optional(),
	limit: z.coerce.number().int().min(1).max(100).optional().default(50),
	offset: z.coerce.number().int().min(0).optional().default(0),
});

export const SearchableUserSchema = z.object({
	id: z.string(),
	displayName: z.string(),
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
export type GetUserResponse = z.infer<typeof GetUserResponseSchema>;
export type UpdateUserProfile = z.infer<typeof UpdateUserProfileSchema>;
export type UpdateUserProfileResponse = z.infer<
	typeof UpdateUserProfileResponseSchema
>;
export type SearchUsersRequest = z.infer<typeof SearchUsersRequestSchema>;
export type SearchUsersResponse = z.infer<typeof SearchUsersResponseSchema>;
export type SearchableUser = z.infer<typeof SearchableUserSchema>;

export const CheckDisplayNameResponseSchema = z.object({
	available: z.boolean(),
});

export const CheckDisplayNameAvailabilitySchema = z.object({
	name: DisplayNameSchema,
});

export type CheckDisplayNameResponse = z.infer<
	typeof CheckDisplayNameResponseSchema
>;
export type CheckDisplayNameAvailability = z.infer<
	typeof CheckDisplayNameAvailabilitySchema
>;
