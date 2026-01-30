import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Notification } from "../../validation/notification-schema";

export const notificationsApi = createApi({
	reducerPath: "notificationsApi",
	baseQuery: fetchBaseQuery({
		baseUrl: "/api/notifications",
	}),
	tagTypes: ["Notifications"],
	endpoints: (builder) => ({
		// Get all notifications
		getNotifications: builder.query<Notification[], void>({
			query: () => "/",
			providesTags: ["Notifications"],
		}),

		// Mark all as read
		markAllRead: builder.mutation<{ success: boolean }, void>({
			query: () => ({
				url: "/",
				method: "PATCH",
			}),
			invalidatesTags: ["Notifications"],
		}),
	}),
});

export const { useGetNotificationsQuery, useMarkAllReadMutation } =
	notificationsApi;
