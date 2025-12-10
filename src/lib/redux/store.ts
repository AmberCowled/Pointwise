import { configureStore } from '@reduxjs/toolkit';
import { xpApi } from './services/xpApi';

export const store = configureStore({
  reducer: {
    [xpApi.reducerPath]: xpApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(xpApi.middleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
