import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
	FriendListResponse,
	FriendshipStatusResponse,
	PendingRequestsResponse,
} from "../../validation/friends-schema";

export const friendsApi = createApi({
	reducerPath: "friendsApi",
	baseQuery: fetchBaseQuery({
		baseUrl: "/api/friends",
	}),
	tagTypes: ["Friends", "FriendRequests", "FriendshipStatus"],
	endpoints: (builder) => ({
		// Get all friends
		getFriends: builder.query<FriendListResponse, void>({
			query: () => "/",
			providesTags: ["Friends"],
		}),

		// Get pending requests
		getPendingRequests: builder.query<PendingRequestsResponse, void>({
			query: () => "/requests",
			providesTags: ["FriendRequests"],
		}),

		// Get friendship status with a user
		getFriendshipStatus: builder.query<FriendshipStatusResponse, string>({
			query: (userId) => `/${userId}/status`,
			providesTags: (_result, _error, userId) => [
				{ type: "FriendshipStatus", id: userId },
			],
		}),

		// Send friend request
		sendFriendRequest: builder.mutation<
			{ status: string },
			{ receiverId: string }
		>({
			query: (body) => ({
				url: "/requests",
				method: "POST",
				body,
			}),
			invalidatesTags: (_result, _error, { receiverId }) => [
				"FriendRequests",
				{ type: "FriendshipStatus", id: receiverId },
			],
		}),

		// Accept/Decline request
		handleFriendRequest: builder.mutation<
			{ success: boolean },
			{ requestId: string; action: "ACCEPT" | "DECLINE" }
		>({
			query: ({ requestId, action }) => ({
				url: `/requests/${requestId}`,
				method: "PATCH",
				body: { action },
			}),
			invalidatesTags: ["Friends", "FriendRequests", "FriendshipStatus"],
		}),

		// Cancel sent request
		cancelFriendRequest: builder.mutation<{ success: boolean }, string>({
			query: (requestId) => ({
				url: `/requests/${requestId}`,
				method: "DELETE",
			}),
			invalidatesTags: ["FriendRequests", "FriendshipStatus"],
		}),

		// Remove friend
		removeFriend: builder.mutation<{ success: boolean }, string>({
			query: (friendId) => ({
				url: `/${friendId}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Friends", "FriendshipStatus"],
		}),
	}),
});

export const {
	useGetFriendsQuery,
	useGetPendingRequestsQuery,
	useGetFriendshipStatusQuery,
	useSendFriendRequestMutation,
	useHandleFriendRequestMutation,
	useCancelFriendRequestMutation,
	useRemoveFriendMutation,
} = friendsApi;
