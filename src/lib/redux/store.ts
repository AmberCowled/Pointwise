import { configureStore } from "@reduxjs/toolkit";
import { conversationsApi } from "./services/conversationsApi";
import { friendsApi } from "./services/friendsApi";
import { invitesApi } from "./services/invitesApi";
import { joinRequestsApi } from "./services/joinRequestsApi";
import { messagesApi } from "./services/messagesApi";
import { notificationsApi } from "./services/notificationsApi";
import { projectApi } from "./services/projectsApi";
import { tasksApi } from "./services/tasksApi";
import { usersApi } from "./services/usersApi";
import { xpApi } from "./services/xpApi";

export const store = configureStore({
	reducer: {
		[xpApi.reducerPath]: xpApi.reducer,
		[projectApi.reducerPath]: projectApi.reducer,
		[tasksApi.reducerPath]: tasksApi.reducer,
		[invitesApi.reducerPath]: invitesApi.reducer,
		[joinRequestsApi.reducerPath]: joinRequestsApi.reducer,
		[usersApi.reducerPath]: usersApi.reducer,
		[friendsApi.reducerPath]: friendsApi.reducer,
		[notificationsApi.reducerPath]: notificationsApi.reducer,
		[conversationsApi.reducerPath]: conversationsApi.reducer,
		[messagesApi.reducerPath]: messagesApi.reducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(
			xpApi.middleware,
			projectApi.middleware,
			tasksApi.middleware,
			invitesApi.middleware,
			joinRequestsApi.middleware,
			usersApi.middleware,
			friendsApi.middleware,
			notificationsApi.middleware,
			conversationsApi.middleware,
			messagesApi.middleware,
		),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
