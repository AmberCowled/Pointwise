import type {
	GetUserResponse,
	SearchUsersRequest,
	SearchUsersResponse,
} from "@pointwise/lib/validation/users-schema";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const usersApi = createApi({
	reducerPath: "usersApi",
	baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
	tagTypes: ["Users"],
	refetchOnFocus: false,
	refetchOnReconnect: true,
	endpoints: (builder) => ({
		// Get user
		getUser: builder.query<GetUserResponse, string>({
			query: (id) => ({
				url: `/users/${id}`,
			}),
			providesTags: ["Users"],
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
	}),
});

export const { useSearchUsersQuery } = usersApi;
