import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
	Message,
	MessagesResponse,
	SendMessageInput,
} from "../../validation/message-schema";

export const messagesApi = createApi({
	reducerPath: "messagesApi",
	baseQuery: fetchBaseQuery({
		baseUrl: "/api/conversations",
	}),
	tagTypes: ["Messages", "Conversations"],
	endpoints: (builder) => ({
		getMessages: builder.query<
			MessagesResponse,
			{ conversationId: string; cursor?: string; limit?: number }
		>({
			query: ({ conversationId, cursor, limit }) => {
				const params = new URLSearchParams();
				if (cursor) params.set("cursor", cursor);
				if (limit !== undefined) params.set("limit", String(limit));
				const q = params.toString();
				return `/${conversationId}/messages${q ? `?${q}` : ""}`;
			},
			providesTags: (_result, _error, { conversationId }) => [
				{ type: "Messages", id: conversationId },
			],
		}),

		sendMessage: builder.mutation<
			Message,
			{ conversationId: string; body: SendMessageInput }
		>({
			query: ({ conversationId, body }) => ({
				url: `/${conversationId}/messages`,
				method: "POST",
				body,
			}),
			invalidatesTags: (_result, _error, { conversationId }) => [
				{ type: "Messages", id: conversationId },
				"Conversations",
			],
		}),
	}),
});

export const { useGetMessagesQuery, useSendMessageMutation } = messagesApi;
