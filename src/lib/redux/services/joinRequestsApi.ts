import type { GetProjectResponse } from "@pointwise/lib/validation/projects-schema";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const joinRequestsApi = createApi({
	reducerPath: "joinRequestsApi",
	baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
	tagTypes: ["JoinRequests", "Projects"],
	refetchOnFocus: false,
	refetchOnReconnect: true,
	endpoints: (builder) => ({
		// Get join requests for a project (admin only)
		getProjectJoinRequests: builder.query<
			{
				requests: Array<{
					userId: string;
					name: string | null;
					requestedAt: string;
				}>;
			},
			string
		>({
			query: (projectId) => `/projects/${projectId}/join-requests`,
			providesTags: ["JoinRequests"],
		}),
		// Approve a join request
		approveJoinRequest: builder.mutation<
			{ success: boolean; project: GetProjectResponse["project"] },
			{ projectId: string; userId: string; role: "ADMIN" | "USER" | "VIEWER" }
		>({
			query: ({ projectId, userId, role }) => ({
				url: `/projects/${projectId}/join-requests/${userId}`,
				method: "PATCH",
				body: { role },
			}),
			invalidatesTags: ["JoinRequests", "Projects"],
		}),
		// Reject a join request
		rejectJoinRequest: builder.mutation<
			{ success: boolean },
			{ projectId: string; userId: string }
		>({
			query: ({ projectId, userId }) => ({
				url: `/projects/${projectId}/join-requests/${userId}`,
				method: "DELETE",
			}),
			invalidatesTags: ["JoinRequests", "Projects"],
		}),
	}),
});

export const {
	useGetProjectJoinRequestsQuery,
	useApproveJoinRequestMutation,
	useRejectJoinRequestMutation,
} = joinRequestsApi;
