import type { InviteResponse } from "@pointwise/lib/validation/invite-schema";
import type {
	InviteProjectRequest,
	InviteProjectResponse,
	Project,
} from "@pointwise/lib/validation/projects-schema";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const invitesApi = createApi({
	reducerPath: "invitesApi",
	baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
	tagTypes: ["Invites", "Projects"],
	refetchOnFocus: false,
	refetchOnReconnect: true,
	endpoints: (builder) => ({
		// Invite users to a project (admin only)
		inviteUsersToProject: builder.mutation<
			InviteProjectResponse,
			{ projectId: string; data: InviteProjectRequest }
		>({
			query: ({ projectId, data }) => ({
				url: `/projects/${projectId}/invite`,
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["Invites", "Projects"],
		}),
		// Check if a user can invite another user to a project
		canInvite: builder.query<
			InviteResponse,
			{ projectId: string; inviteeId: string; role: string }
		>({
			query: ({ projectId, inviteeId, role }) =>
				`/projects/${projectId}/can-invite?inviteeId=${inviteeId}&role=${role}`,
			providesTags: ["Invites", "Projects"],
		}),
		// Get pending invites for a project (admin only)
		getProjectInvites: builder.query<
			{
				invites: Array<{
					id: string;
					inviterId: string;
					invitedUserId: string;
					projectId: string;
					inviteRole: "ADMIN" | "USER" | "VIEWER";
					createdAt: string;
					updatedAt: string;
					inviter: { id: string; name: string | null };
					invitedUser: {
						id: string;
						name: string | null;
					};
				}>;
			},
			string
		>({
			query: (projectId) => `/projects/${projectId}/invites`,
			providesTags: ["Invites"],
		}),
		// Get received invites for current user
		getReceivedInvites: builder.query<
			{
				invites: Array<{
					id: string;
					inviterId: string;
					invitedUserId: string;
					projectId: string;
					inviteRole: "ADMIN" | "USER" | "VIEWER";
					createdAt: string;
					updatedAt: string;
					inviter: { id: string; name: string | null };
					project: {
						id: string;
						name: string;
						description: string | null;
						visibility: "PUBLIC" | "PRIVATE";
					};
				}>;
			},
			void
		>({
			query: () => "/invites",
			providesTags: ["Invites"],
		}),
		// Accept an invite
		acceptInvite: builder.mutation<
			{ success: boolean; project: Project },
			string
		>({
			query: (inviteId) => ({
				url: `/invites/${inviteId}/accept`,
				method: "POST",
			}),
			invalidatesTags: ["Invites", "Projects"],
		}),
		// Reject/cancel an invite
		rejectInvite: builder.mutation<{ success: boolean }, string>({
			query: (inviteId) => ({
				url: `/invites/${inviteId}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Invites", "Projects"],
		}),
	}),
});

export const {
	useInviteUsersToProjectMutation,
	useCanInviteQuery,
	useGetProjectInvitesQuery,
	useGetReceivedInvitesQuery,
	useAcceptInviteMutation,
	useRejectInviteMutation,
} = invitesApi;
