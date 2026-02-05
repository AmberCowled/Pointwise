import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
	Conversation,
	ConversationListItem,
	CreateConversationInput,
	UpdateConversationInput,
} from "../../validation/conversation-schema";

export const conversationsApi = createApi({
	reducerPath: "conversationsApi",
	baseQuery: fetchBaseQuery({
		baseUrl: "/api/conversations",
	}),
	tagTypes: ["Conversations", "Conversation", "Notifications"],
	endpoints: (builder) => ({
		getConversations: builder.query<ConversationListItem[], void>({
			query: () => "/",
			providesTags: ["Conversations"],
		}),

		getConversation: builder.query<Conversation, string>({
			query: (id) => `/${id}`,
			providesTags: (_result, _error, id) => [{ type: "Conversation", id }],
		}),

		createConversation: builder.mutation<Conversation, CreateConversationInput>(
			{
				query: (body) => ({
					url: "/",
					method: "POST",
					body,
				}),
				invalidatesTags: ["Conversations"],
			},
		),

		updateConversation: builder.mutation<
			Conversation,
			{ id: string; body: UpdateConversationInput }
		>({
			query: ({ id, body }) => ({
				url: `/${id}`,
				method: "PATCH",
				body,
			}),
			invalidatesTags: (_result, _error, { id }) => [
				"Conversations",
				{ type: "Conversation", id },
			],
		}),

		leaveConversation: builder.mutation<{ success: boolean }, string>({
			query: (id) => ({
				url: `/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: (_result, _error, id) => [
				"Conversations",
				{ type: "Conversation", id },
			],
		}),

		markConversationRead: builder.mutation<{ success: boolean }, string>({
			query: (id) => ({
				url: `/${id}/read`,
				method: "PATCH",
			}),
			invalidatesTags: ["Notifications"],
		}),

		archiveConversation: builder.mutation<{ success: true }, string>({
			query: (id) => ({
				url: `/${id}/archive`,
				method: "PATCH",
			}),
			invalidatesTags: ["Conversations"],
		}),
	}),
});

export const {
	useGetConversationsQuery,
	useGetConversationQuery,
	useCreateConversationMutation,
	useUpdateConversationMutation,
	useLeaveConversationMutation,
	useMarkConversationReadMutation,
	useArchiveConversationMutation,
} = conversationsApi;
