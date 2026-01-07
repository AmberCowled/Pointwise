import { configureStore } from "@reduxjs/toolkit";
import { invitesApi } from "./services/invitesApi";
import { projectApi } from "./services/projectsApi";
import { tasksApi } from "./services/tasksApi";
import { xpApi } from "./services/xpApi";

export const store = configureStore({
	reducer: {
		[xpApi.reducerPath]: xpApi.reducer,
		[projectApi.reducerPath]: projectApi.reducer,
		[tasksApi.reducerPath]: tasksApi.reducer,
		[invitesApi.reducerPath]: invitesApi.reducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(
			xpApi.middleware,
			projectApi.middleware,
			tasksApi.middleware,
			invitesApi.middleware,
		),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
