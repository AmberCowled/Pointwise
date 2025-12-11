import { configureStore } from '@reduxjs/toolkit';
import { xpApi } from './services/xpApi';
import { projectApi } from './services/projectsApi';

export const store = configureStore({
  reducer: {
    [xpApi.reducerPath]: xpApi.reducer,
    [projectApi.reducerPath]: projectApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(xpApi.middleware, projectApi.middleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
