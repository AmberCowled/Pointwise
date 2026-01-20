import type {
	CheckDisplayNameAvailability,
	CheckDisplayNameResponse,
	GetUserResponse,
	SearchUsersRequest,
	SearchUsersResponse,
	UpdateUserProfile,
	UpdateUserProfileResponse,
} from "@pointwise/lib/validation/users-schema";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const usersApi = createApi({
	reducerPath: "usersApi",
	baseQuery: fetchBaseQuery({
		baseUrl: "/api",
	}),
	tagTypes: ["User", "Users"],
	refetchOnFocus: false,
	refetchOnReconnect: true,
	endpoints: (builder) => ({
		// Get user
		getUser: builder.query<GetUserResponse, void>({
			query: () => ({
				url: `/user`,
			}),
			providesTags: ["User"],
		}),
		// Update user profile
		updateUser: builder.mutation<UpdateUserProfileResponse, UpdateUserProfile>({
			query: (profileData) => ({
				url: `/user`,
				method: "PATCH",
				body: profileData,
			}),
			invalidatesTags: ["User"],
		}),
		// Search users
		searchUsers: builder.query<SearchUsersResponse, SearchUsersRequest>({
			query: (params) => ({
				url: "/users/search",
				params: {
					query: params.query,
					limit: params.limit,
					offset: params.offset,
				},
			}),
			providesTags: ["Users"],
		}),
		// Check display name availability
		checkDisplayNameAvailability: builder.query<
			CheckDisplayNameResponse,
			CheckDisplayNameAvailability
		>({
			query: ({ name }) => ({
				url: "/user/check-availability",
				params: { name },
			}),
		}),
	}),
});

export const {
	useGetUserQuery,
	useUpdateUserMutation,
	useCheckDisplayNameAvailabilityQuery,
} = usersApi;
export const { useSearchUsersQuery } = usersApi;
